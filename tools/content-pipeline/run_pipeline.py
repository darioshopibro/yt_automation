#!/usr/bin/env python3
"""Daily content pipeline orchestrator — scan, cluster, score, store."""

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
from scanners import hackernews_scanner, reddit_scanner, youtube_scanner
from scanners import github_scanner, devto_scanner, news_scanner, trends_scanner


ALL_SCANNERS = {
    "hackernews": hackernews_scanner,
    "reddit": reddit_scanner,
    "youtube": youtube_scanner,
    "github": github_scanner,
    "devto": devto_scanner,
    "news": news_scanner,
    "trends": trends_scanner,
}


def run_scanners():
    """Run all scanners in parallel, collect results."""
    all_items = []
    succeeded = []
    failed = []
    errors = []

    print(f"Scanning {len(ALL_SCANNERS)} sources...")

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(scanner.scan): name for name, scanner in ALL_SCANNERS.items()}

        for future in as_completed(futures):
            name = futures[future]
            try:
                result = future.result()
                items = result.get("items", [])
                error = result.get("error")

                if items:
                    all_items.extend(items)
                    succeeded.append(name)
                    print(f"  ✅ {name}: {len(items)} items")
                else:
                    failed.append(name)
                    print(f"  ❌ {name}: 0 items" + (f" ({error})" if error else ""))

                if error and items:
                    errors.append(f"{name}: {error} (partial)")
                elif error:
                    errors.append(f"{name}: {error}")

            except Exception as e:
                failed.append(name)
                errors.append(f"{name}: {e}")
                print(f"  ❌ {name}: EXCEPTION - {e}")

    print(f"\nTotal: {len(all_items)} items from {len(succeeded)}/{len(ALL_SCANNERS)} sources")
    return all_items, succeeded, failed, errors


def run_clustering(all_items):
    """Cluster items into topics using LLM."""
    print(f"\nClustering {len(all_items)} items with LLM...")
    groups = extract_topics(all_items)
    topics = build_topics_with_sources(groups, all_items)
    print(f"  Found {len(topics)} topic groups")
    return topics


def run_scoring(topics):
    """Score each topic and store in database. Check for similar past topics."""
    print(f"\nScoring {len(topics)} topics...")
    new_count = 0
    similar_warnings = []

    # Get past processed/approved topics for similarity check
    conn = db.get_connection()
    past_topics = conn.execute(
        "SELECT id, title, slug, status FROM topics WHERE status IN ('approved', 'processed')"
    ).fetchall()
    past_titles = {t["title"].lower(): t for t in past_topics}
    past_slugs = {t["slug"]: t for t in past_topics}
    conn.close()

    for topic in topics:
        if db.topic_exists(topic["slug"]):
            continue

        # Check if similar topic was already processed
        similar = _find_similar_past_topic(topic, past_titles, past_slugs)
        if similar:
            similar_warnings.append((topic["title"], similar["title"], similar["status"]))

        scores = score_topic(topic["sources"])
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
        new_count += 1

    if similar_warnings:
        print(f"  ⚠️ {len(similar_warnings)} topics similar to past work:")
        for new_title, old_title, status in similar_warnings:
            print(f"    '{new_title}' ↔ '{old_title}' ({status})")

    print(f"  {new_count} new topics stored")
    return new_count


def _find_similar_past_topic(topic, past_titles, past_slugs):
    """Check if a topic is similar to an already processed/approved topic."""
    # Exact slug match
    if topic["slug"] in past_slugs:
        return dict(past_slugs[topic["slug"]])

    # Check word overlap in title
    new_words = set(topic["title"].lower().split())
    stop_words = {"the", "a", "an", "and", "or", "in", "of", "to", "for", "is", "with", "on", "&", "how", "why", "what"}
    new_words -= stop_words

    for past_title, past_topic in past_titles.items():
        past_words = set(past_title.split()) - stop_words
        if not new_words or not past_words:
            continue
        overlap = len(new_words & past_words) / min(len(new_words), len(past_words))
        if overlap >= 0.6:  # 60% word overlap = similar
            return dict(past_topic)

    return None


def print_top_candidates():
    """Print top candidates from database."""
    candidates = db.get_top_candidates(config.DAILY_CANDIDATES)
    if not candidates:
        print("\nNo candidates found.")
        return

    print(f"\n{'='*60}")
    print(f"TOP {len(candidates)} CANDIDATES")
    print(f"{'='*60}")
    for i, c in enumerate(candidates):
        sources = db.get_topic_sources(c["id"])
        source_types = set(s["source_type"] for s in sources)
        print(f"\n{i+1}. {c['title']} (Score: {c['final_score']:.3f})")
        print(f"   📈 Eng: {c['engagement_score']:.2f} | ⏰ Fresh: {c['freshness_score']:.2f} | Sources: {len(sources)} ({', '.join(source_types)})")


def main():
    start_time = time.time()
    print("=" * 60)
    print("CONTENT PIPELINE — Daily Scan")
    print("=" * 60)

    # Start scan run
    run_id = db.start_scan_run()

    # 1. Scan
    all_items, succeeded, failed, errors = run_scanners()

    # 2. Cluster
    topics = run_clustering(all_items)

    # 3. Score & store
    new_count = run_scoring(topics)

    # 4. Complete scan run
    db.complete_scan_run(run_id, len(topics), new_count, succeeded, failed, errors)

    # 5. Print results
    print_top_candidates()

    # 6. Self-improvement scan
    print("\n🔧 Scanning for stack improvements...")
    improvements = analyze_for_improvements(all_items)
    if improvements:
        print(f"  Found {len(improvements)} suggestions:")
        for imp in improvements:
            print(f"    {imp.get('category', '?')}: {imp.get('title', 'N/A')}")
    else:
        print("  No improvements found today.")

    elapsed = time.time() - start_time
    print(f"\n✅ Pipeline complete in {elapsed:.1f}s")

    # Update learning weights
    analyze_decisions()
    print(f"📊 Learning: {get_learning_summary()}")


if __name__ == "__main__":
    main()
