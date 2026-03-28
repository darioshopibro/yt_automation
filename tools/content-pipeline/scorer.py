"""Scorer — combined weighted scoring with adaptive learning support."""

from datetime import datetime, timezone
from dateutil import parser as dateparser

import config
import db


def engagement_score(sources):
    """Calculate normalized engagement score (0-1) from all sources.

    Only counts sources that HAVE engagement metrics (score > 0).
    RSS/trends without metrics are excluded from the average so they
    don't dilute high-engagement signals.
    """
    scores = []
    defaults = config.SOURCE_DEFAULTS

    for s in sources:
        raw = s.get("score", 0) or 0
        stype = s.get("source_type", "")

        if stype == "youtube":
            avg = db.get_channel_avg_views(s.get("raw_data", {}).get("channel", "")) or defaults["youtube_avg_views"]
            ratio = raw / max(avg, 1)
            scores.append(min(ratio / 3.0, 1.0))
        elif stype == "reddit":
            ratio = raw / max(defaults["reddit_avg_score"], 1)
            scores.append(min(ratio / 3.0, 1.0))
        elif stype == "hackernews":
            scores.append(min(raw / 500.0, 1.0))
        elif stype == "github":
            scores.append(min(raw / 1500.0, 1.0))
        elif stype == "devto":
            scores.append(min(raw / max(defaults["devto_avg_reactions"], 1), 1.0))
        # news/trends: SKIP — no engagement metrics, don't dilute average

    return sum(scores) / len(scores) if scores else 0.1  # 0.1 baseline for news-only topics


def freshness_score(sources):
    """Calculate freshness score (0-1) based on most recent source."""
    now = datetime.now(timezone.utc)
    min_hours = float("inf")

    for s in sources:
        pub = s.get("published_at")
        if not pub:
            continue
        try:
            pub_dt = dateparser.parse(pub)
            if pub_dt.tzinfo is None:
                pub_dt = pub_dt.replace(tzinfo=timezone.utc)
            hours = (now - pub_dt).total_seconds() / 3600
            min_hours = min(min_hours, hours)
        except (ValueError, TypeError):
            continue

    if min_hours == float("inf"):
        # No parseable timestamps — check if ALL sources are news/trends (no timestamps)
        all_news = all(s.get("source_type") in ("news", "trends") for s in sources)
        return 0.4 if all_news else 0.5  # news-only gets lower default freshness

    for max_hours, score in config.FRESHNESS_TIERS:
        if min_hours <= max_hours:
            return score
    return config.FRESHNESS_DEFAULT


def multi_source_boost(sources):
    """Calculate boost based on number of distinct source types WITH engagement.

    Only counts sources that have actual engagement (score > 0).
    News/trends alone don't count toward multi-source boost.
    This prevents generic topics from getting inflated scores.
    """
    engaged_types = set()
    for s in sources:
        raw = s.get("score", 0) or 0
        stype = s.get("source_type", "")
        if raw > 0 and stype not in ("news", "trends"):
            engaged_types.add(stype)

    count = len(engaged_types)
    return config.MULTI_SOURCE_BOOST.get(count, config.MULTI_SOURCE_BOOST_MAX)


def score_topic(sources):
    """Calculate final score for a topic.

    Returns:
        dict with engagement, freshness, opportunity, boost, final_score
    """
    eng = engagement_score(sources)
    fresh = freshness_score(sources)
    boost = multi_source_boost(sources)

    # Opportunity = placeholder 0.5 (competition check is expensive, done later for top candidates)
    opp = 0.5

    # Get weights (adaptive or default)
    weights = _get_weights()

    base = (eng * weights["engagement"]) + (fresh * weights["freshness"]) + (opp * weights["opportunity"])
    final = base * (1 + boost)

    return {
        "engagement": round(eng, 3),
        "freshness": round(fresh, 3),
        "competition": round(1 - opp, 3),
        "boost": round(boost, 2),
        "final_score": round(final, 4),
        "multi_source_count": len(set(s.get("source_type", "") for s in sources)),
    }


def _get_weights():
    """Get scoring weights — adaptive if enough decisions, else default."""
    decisions = db.count_decisions()
    if decisions < config.LEARNING_MIN_DECISIONS:
        return config.DEFAULT_WEIGHTS

    learned = db.get_preference("scoring_weights")
    if learned:
        return learned
    return config.DEFAULT_WEIGHTS
