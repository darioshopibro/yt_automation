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


def demand_score(demand_data):
    """Calculate demand score from YouTube Search Suggest data.

    Args:
        demand_data: dict from demand_scanner.check_demand() or None

    Returns:
        float 0-1 representing search demand
    """
    if not demand_data:
        return 0.3  # neutral default when no demand data available

    return demand_data.get("demand_signal", 0.3)


def outlier_boost(sources):
    """Extra boost for topics that contain outlier videos.

    An outlier video (3x+ channel average) is strong proof of demand.
    """
    for s in sources:
        raw = s.get("raw_data", {})
        if raw.get("is_outlier") and raw.get("outlier_ratio", 0) >= 3:
            ratio = raw["outlier_ratio"]
            # 3x = 0.10 boost, 5x = 0.15, 10x+ = 0.20 (capped)
            return min(0.05 + (ratio - 3) * 0.02, 0.20)
    return 0.0


def velocity_score(velocity_data):
    """Score based on topic growth between scans.

    Args:
        velocity_data: list of velocity records from db.get_velocity()

    Returns:
        float 0-1 representing growth velocity
    """
    if not velocity_data or len(velocity_data) < 2:
        return 0.5  # neutral when not enough history

    latest = velocity_data[0]
    previous = velocity_data[1]

    # Compare source count growth
    source_growth = 0
    if previous["source_count"] > 0:
        source_growth = (latest["source_count"] - previous["source_count"]) / previous["source_count"]

    # Compare engagement growth
    eng_growth = 0
    if previous["total_engagement"] > 0:
        eng_growth = (latest["total_engagement"] - previous["total_engagement"]) / previous["total_engagement"]

    # Combined velocity: weighted avg of source and engagement growth
    velocity = (source_growth * 0.4 + eng_growth * 0.6)

    # Map to 0-1 scale: -50% decline = 0, stable = 0.5, +100% growth = 1.0
    normalized = min(max((velocity + 0.5) / 1.5, 0), 1.0)

    return round(normalized, 3)


def score_topic(sources, demand_data=None, velocity_data=None):
    """Calculate final score for a topic.

    Now includes:
    - demand_score: YouTube search suggest data (are people searching for this?)
    - outlier_boost: bonus for topics with viral videos (3x+ channel avg)
    - velocity_score: is this topic growing between scans?

    Returns:
        dict with all scores and final_score
    """
    eng = engagement_score(sources)
    fresh = freshness_score(sources)
    boost = multi_source_boost(sources)
    demand = demand_score(demand_data)
    outlier = outlier_boost(sources)
    velocity = velocity_score(velocity_data)

    # Opportunity = placeholder 0.5
    opp = 0.5

    # Get weights (adaptive or default)
    weights = _get_weights()

    # New formula: engagement + freshness + demand + opportunity
    # demand replaces some of opportunity's weight
    demand_weight = weights.get("demand", 0.15)
    opp_weight = max(weights["opportunity"] - demand_weight, 0.10)

    base = (
        eng * weights["engagement"]
        + fresh * weights["freshness"]
        + demand * demand_weight
        + opp * opp_weight
    )

    # Apply boosts
    total_boost = boost + outlier
    final = base * (1 + total_boost)

    # Velocity modifier: topics growing fast get up to 10% extra
    velocity_modifier = (velocity - 0.5) * 0.2  # -0.1 to +0.1
    final = final * (1 + velocity_modifier)

    return {
        "engagement": round(eng, 3),
        "freshness": round(fresh, 3),
        "demand": round(demand, 3),
        "velocity": round(velocity, 3),
        "competition": round(1 - opp, 3),
        "boost": round(boost, 2),
        "outlier_boost": round(outlier, 3),
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
