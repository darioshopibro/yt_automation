"""Adaptive learning — analyzes approve/reject patterns to improve scoring."""

import sys
import os
import json
from collections import Counter

sys.path.insert(0, os.path.dirname(__file__))
import db
import config


def analyze_decisions():
    """Analyze all approve/reject decisions and compute learned preferences.

    Returns dict with learned weights, or None if not enough data.
    """
    conn = db.get_connection()

    approved = conn.execute(
        "SELECT * FROM topics WHERE status='approved'"
    ).fetchall()
    rejected = conn.execute(
        "SELECT * FROM topics WHERE status='rejected'"
    ).fetchall()
    conn.close()

    total = len(approved) + len(rejected)
    if total < config.LEARNING_MIN_DECISIONS:
        return {
            "status": "collecting",
            "decisions": total,
            "needed": config.LEARNING_MIN_DECISIONS,
        }

    # Analyze approved topics
    approved_sources = _get_source_distribution([dict(t) for t in approved])
    rejected_sources = _get_source_distribution([dict(t) for t in rejected])

    # Analyze topic keywords
    approved_keywords = _extract_keywords([dict(t) for t in approved])
    rejected_keywords = _extract_keywords([dict(t) for t in rejected])

    # Compute source weights (which sources produce more approved topics)
    source_weights = _compute_source_weights(approved_sources, rejected_sources)

    # Compute preferred/avoided keywords
    preferred = [k for k, c in approved_keywords.most_common(20) if k not in rejected_keywords or approved_keywords[k] > rejected_keywords[k]]
    avoided = [k for k, c in rejected_keywords.most_common(20) if k not in approved_keywords or rejected_keywords[k] > approved_keywords[k]]

    # Compute engagement preference (do they prefer high-engagement or niche topics?)
    avg_approved_eng = sum(t["engagement_score"] for t in approved) / len(approved) if approved else 0
    avg_rejected_eng = sum(t["engagement_score"] for t in rejected) / len(rejected) if rejected else 0

    # Adjust scoring weights based on what user actually picks
    learned_weights = _compute_scoring_weights(approved, rejected)

    preferences = {
        "status": "active",
        "decisions": total,
        "approved_count": len(approved),
        "rejected_count": len(rejected),
        "approve_rate": round(len(approved) / total, 2) if total else 0,
        "source_weights": source_weights,
        "preferred_topics": preferred[:10],
        "avoided_topics": avoided[:10],
        "avg_approved_engagement": round(avg_approved_eng, 3),
        "avg_rejected_engagement": round(avg_rejected_eng, 3),
        "scoring_weights": learned_weights,
    }

    # Store in DB
    db.set_preference("learned_preferences", preferences)
    db.set_preference("scoring_weights", learned_weights)

    return preferences


def _get_source_distribution(topics):
    """Count how many times each source type appears in topics."""
    counter = Counter()
    for t in topics:
        sources = db.get_topic_sources(t["id"])
        for s in sources:
            counter[s["source_type"]] += 1
    return counter


def _extract_keywords(topics):
    """Extract simple keywords from topic titles."""
    counter = Counter()
    stop_words = {"the", "a", "an", "and", "or", "in", "of", "to", "for", "is", "with", "on", "at", "by", "from", "&"}
    for t in topics:
        words = t["title"].lower().split()
        for w in words:
            w = w.strip(".,!?()[]{}:;\"'")
            if len(w) > 2 and w not in stop_words:
                counter[w] += 1
    return counter


def _compute_source_weights(approved_sources, rejected_sources):
    """Compute per-source weight multiplier based on approve/reject ratio."""
    all_sources = set(list(approved_sources.keys()) + list(rejected_sources.keys()))
    weights = {}
    for source in all_sources:
        approved = approved_sources.get(source, 0)
        rejected = rejected_sources.get(source, 0)
        total = approved + rejected
        if total == 0:
            weights[source] = 1.0
        else:
            # ratio > 0.5 = source produces more approved topics
            ratio = approved / total
            # Scale to 0.7 — 1.3 range
            weights[source] = round(0.7 + (ratio * 0.6), 2)
    return weights


def _compute_scoring_weights(approved, rejected):
    """Learn optimal engagement/freshness/opportunity weights from user choices.

    If user consistently picks high-engagement topics → increase engagement weight.
    If user picks fresh topics → increase freshness weight.
    """
    if not approved:
        return config.DEFAULT_WEIGHTS.copy()

    # Average scores of approved topics
    avg_eng = sum(t["engagement_score"] for t in approved) / len(approved)
    avg_fresh = sum(t["freshness_score"] for t in approved) / len(approved)

    # If approved topics have high engagement → user values engagement
    # If approved topics have high freshness → user values freshness
    eng_signal = min(avg_eng / 0.5, 1.5)  # normalize around 0.5
    fresh_signal = min(avg_fresh / 0.5, 1.5)

    total_signal = eng_signal + fresh_signal + 1.0  # 1.0 for opportunity (stable)

    return {
        "engagement": round(eng_signal / total_signal, 3),
        "freshness": round(fresh_signal / total_signal, 3),
        "opportunity": round(1.0 / total_signal, 3),
    }


def get_learning_summary():
    """Get human-readable learning status for dashboard/telegram."""
    prefs = db.get_preference("learned_preferences")
    if not prefs:
        decisions = db.count_decisions()
        if decisions < config.LEARNING_MIN_DECISIONS:
            return f"Collecting data ({decisions}/{config.LEARNING_MIN_DECISIONS} decisions). Using default scoring."
        return "No preferences learned yet."

    if prefs["status"] == "collecting":
        return f"Collecting data ({prefs['decisions']}/{prefs['needed']} decisions). Using default scoring."

    lines = [f"Active — {prefs['decisions']} decisions ({prefs['approve_rate']*100:.0f}% approve rate)"]

    if prefs.get("preferred_topics"):
        lines.append(f"Prefers: {', '.join(prefs['preferred_topics'][:5])}")
    if prefs.get("avoided_topics"):
        lines.append(f"Avoids: {', '.join(prefs['avoided_topics'][:5])}")

    if prefs.get("source_weights"):
        best = max(prefs["source_weights"], key=prefs["source_weights"].get)
        lines.append(f"Best source: {best} (weight: {prefs['source_weights'][best]})")

    return "\n".join(lines)


if __name__ == "__main__":
    result = analyze_decisions()
    print(json.dumps(result, indent=2))
    print()
    print("Summary:", get_learning_summary())
