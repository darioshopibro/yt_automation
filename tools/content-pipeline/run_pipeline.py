#!/usr/bin/env python3
"""Daily content pipeline orchestrator — scan, cluster, score, store.

Every step is logged via PipelineLogger so you always know what succeeded,
what failed, and why. Run report is saved to data/logs/ as JSON.
"""

import sys
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add this directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

import db
import config
from topic_extractor import extract_topics, build_topics_with_sources
from scorer import score_topic
from learner import analyze_decisions, get_learning_summary
from self_improver import analyze_for_improvements, format_improvements_telegram
from pipeline_logger import PipelineLogger
from scanners import hackernews_scanner, reddit_scanner, youtube_scanner
from scanners import github_scanner, devto_scanner, news_scanner
from scanners import pytrends_scanner, demand_scanner, tiktok_scanner


ALL_SCANNERS = {
    "hackernews": hackernews_scanner,
    "reddit": reddit_scanner,
    "youtube": youtube_scanner,
    "github": github_scanner,
    "devto": devto_scanner,
    "news": news_scanner,
    "trends": pytrends_scanner,
    "demand": demand_scanner,
    "tiktok": tiktok_scanner,
}


def run_scanners(logger):
    """Run all scanners in parallel, collect results."""
    logger.start_step("scan_sources")

    all_items = []
    succeeded = []
    failed = []
    errors = []
    scanner_details = {}

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(scanner.scan): name for name, scanner in ALL_SCANNERS.items()}

        for future in as_completed(futures):
            name = futures[future]
            try:
                result = future.result()
                items = result.get("items", [])
                error = result.get("error")
                step_log = result.get("step_log")  # TikTok scanner provides detailed step_log

                scanner_details[name] = {
                    "items": len(items),
                    "error": error,
                    "status": "ok" if items and not error else ("partial" if items and error else "failed"),
                }

                # Include TikTok's detailed step_log if present
                if step_log:
                    scanner_details[name]["step_log"] = step_log

                if items:
                    all_items.extend(items)
                    succeeded.append(name)
                else:
                    failed.append(name)

                if error:
                    errors.append(f"{name}: {error}")

            except Exception as e:
                failed.append(name)
                errors.append(f"{name}: {e}")
                scanner_details[name] = {"items": 0, "error": str(e), "status": "failed"}

    # Log step result
    if failed and not succeeded:
        logger.fail_step(errors, items_in=0, items_out=len(all_items), details=scanner_details)
    elif errors:
        logger.partial_step(errors, items_in=0, items_out=len(all_items), details=scanner_details)
    else:
        logger.complete_step(items_in=0, items_out=len(all_items), details=scanner_details)

    return all_items, succeeded, failed, errors


def run_clustering(all_items, logger):
    """Cluster items into topics using LLM."""
    logger.start_step("cluster_topics")

    try:
        groups = extract_topics(all_items)
        topics = build_topics_with_sources(groups, all_items)
        logger.complete_step(items_in=len(all_items), items_out=len(topics))
        return topics
    except Exception as e:
        logger.fail_step(str(e), items_in=len(all_items), items_out=0)
        return []


def run_demand_check(topics, logger):
    """Check YouTube search demand for each topic."""
    logger.start_step("check_demand")

    try:
        demand_results = demand_scanner.scan_demand_for_topics(topics)

        # Count high-demand topics
        high_demand = sum(1 for d in demand_results.values() if d.get("demand_signal", 0) > 0.5)
        details = {
            "high_demand_topics": high_demand,
            "total_checked": len(demand_results),
        }

        # Show top demand signals
        top_demand = sorted(demand_results.items(), key=lambda x: x[1].get("demand_signal", 0), reverse=True)[:3]
        details["top_demand"] = [{"slug": s, "signal": d["demand_signal"], "keyword": d["keyword"]} for s, d in top_demand]

        logger.complete_step(items_in=len(topics), items_out=len(demand_results), details=details)
        return demand_results

    except Exception as e:
        logger.fail_step(str(e), items_in=len(topics), items_out=0)
        return {}


def run_scoring(topics, demand_results, run_id, logger):
    """Score each topic and store in database."""
    logger.start_step("score_and_store")

    new_count = 0
    skipped = 0
    similar_warnings = []

    try:
        conn = db.get_connection()
        past_topics = conn.execute(
            "SELECT id, title, slug, status FROM topics WHERE status IN ('approved', 'processed')"
        ).fetchall()
        past_titles = {t["title"].lower(): t for t in past_topics}
        past_slugs = {t["slug"]: t for t in past_topics}
        conn.close()

        for topic in topics:
            if db.topic_exists(topic["slug"]):
                skipped += 1
                continue

            similar = _find_similar_past_topic(topic, past_titles, past_slugs)
            if similar:
                similar_warnings.append((topic["title"], similar["title"], similar["status"]))

            demand_data = (demand_results or {}).get(topic["slug"])
            velocity_data = db.get_velocity(topic["slug"])
            scores = score_topic(topic["sources"], demand_data=demand_data, velocity_data=velocity_data)

            topic_id = db.insert_topic(
                title=topic["title"],
                slug=topic["slug"],
                description=f"⚠️ Similar to past {similar['status']}: {similar['title']}" if similar else None,
                sources=topic["sources"],
            )
            db.update_topic_scores(
                topic_id,
                engagement=scores["engagement"],
                freshness=scores["freshness"],
                competition=scores["competition"],
                final_score=scores["final_score"],
                multi_source_count=scores["multi_source_count"],
            )

            if demand_data:
                db.insert_demand(
                    topic_id, demand_data["keyword"], demand_data["suggestion_count"],
                    demand_data["has_tutorial_demand"], demand_data["has_comparison_demand"],
                    demand_data["demand_signal"], demand_data.get("suggestions")
                )

            total_engagement = sum(s.get("score", 0) or 0 for s in topic["sources"])
            db.insert_velocity(topic["slug"], run_id, len(topic["sources"]), total_engagement)
            new_count += 1

        details = {
            "new_topics": new_count,
            "skipped_duplicates": skipped,
            "similar_warnings": len(similar_warnings),
        }
        if similar_warnings:
            details["similar_topics"] = [
                {"new": n, "existing": o, "status": s} for n, o, s in similar_warnings
            ]

        logger.complete_step(items_in=len(topics), items_out=new_count, details=details)
        return new_count

    except Exception as e:
        logger.fail_step(str(e), items_in=len(topics), items_out=new_count)
        return new_count


def run_self_improvement(all_items, logger):
    """Scan for stack improvements."""
    logger.start_step("self_improvement")

    try:
        improvements = analyze_for_improvements(all_items)
        count = len(improvements) if improvements else 0
        details = {}
        if improvements:
            details["suggestions"] = [
                {"category": i.get("category", "?"), "title": i.get("title", "N/A")}
                for i in improvements[:5]
            ]
        logger.complete_step(items_in=len(all_items), items_out=count, details=details)
        return improvements

    except Exception as e:
        logger.fail_step(str(e), items_in=len(all_items), items_out=0)
        return []


def run_learning(logger):
    """Update adaptive learning weights."""
    logger.start_step("adaptive_learning")

    try:
        analyze_decisions()
        summary_text = get_learning_summary()
        logger.complete_step(details={"summary": summary_text})
        return summary_text

    except Exception as e:
        logger.fail_step(str(e))
        return "Learning failed"


def _find_similar_past_topic(topic, past_titles, past_slugs):
    """Check if a topic is similar to an already processed/approved topic."""
    if topic["slug"] in past_slugs:
        return dict(past_slugs[topic["slug"]])

    new_words = set(topic["title"].lower().split())
    stop_words = {"the", "a", "an", "and", "or", "in", "of", "to", "for", "is", "with", "on", "&", "how", "why", "what"}
    new_words -= stop_words

    for past_title, past_topic in past_titles.items():
        past_words = set(past_title.split()) - stop_words
        if not new_words or not past_words:
            continue
        overlap = len(new_words & past_words) / min(len(new_words), len(past_words))
        if overlap >= 0.6:
            return dict(past_topic)

    return None


def print_top_candidates():
    """Print top candidates from database."""
    candidates = db.get_top_candidates(config.DAILY_CANDIDATES)
    if not candidates:
        print("\nNo candidates found.")
        return

    import json as _json

    print(f"\n{'='*60}")
    print(f"TOP {len(candidates)} CANDIDATES")
    print(f"{'='*60}")
    for i, c in enumerate(candidates):
        sources = db.get_topic_sources(c["id"])
        source_types = set(s["source_type"] for s in sources)
        demand = db.get_demand(c["id"])

        demand_str = ""
        if demand:
            demand_str = f" | 🔍 Demand: {demand['demand_signal']:.2f}"
            if demand['has_tutorial_demand']:
                demand_str += " [tutorial]"
            if demand['has_comparison_demand']:
                demand_str += " [vs]"

        outlier_str = ""
        for s in sources:
            raw = s.get("raw_data", "{}")
            if isinstance(raw, str):
                try:
                    raw = _json.loads(raw)
                except Exception:
                    raw = {}
            if raw.get("is_outlier"):
                channel = raw.get("channel", raw.get("username", "?"))
                outlier_str = f" | 🔥 Outlier: {raw['outlier_ratio']}x on {channel}"
                break

        print(f"\n{i+1}. {c['title']} (Score: {c['final_score']:.3f})")
        print(f"   📈 Eng: {c['engagement_score']:.2f} | ⏰ Fresh: {c['freshness_score']:.2f} | Sources: {len(sources)} ({', '.join(source_types)}){demand_str}{outlier_str}")


def main():
    print("=" * 60)
    print("CONTENT PIPELINE — Daily Scan")
    print("=" * 60)

    # Start scan run
    run_id = db.start_scan_run()
    logger = PipelineLogger(run_id)

    # 1. Scan all sources (HN, Reddit, YouTube, GitHub, Dev.to, News, Trends, Demand, TikTok)
    all_items, succeeded, failed, errors = run_scanners(logger)

    # 2. Cluster into topics
    topics = run_clustering(all_items, logger)

    # 3. Check YouTube search demand
    demand_results = run_demand_check(topics, logger)

    # 4. Score & store
    new_count = run_scoring(topics, demand_results, run_id, logger)

    # 5. Complete scan run in DB
    db.complete_scan_run(run_id, len(topics), new_count, succeeded, failed, errors)

    # 6. Print top candidates
    print_top_candidates()

    # 7. Self-improvement
    run_self_improvement(all_items, logger)

    # 8. Adaptive learning
    learning_summary = run_learning(logger)
    print(f"📊 Learning: {learning_summary}")

    # 9. Print run report & save to file
    summary = logger.print_report()
    report_path = logger.save_report()
    print(f"📄 Log saved: {report_path}")


if __name__ == "__main__":
    main()
