"""News RSS scanner — TechCrunch, TheVerge, ArsTechnica via feedparser."""

import feedparser

from config import RSS_FEEDS


def scan():
    """Fetch articles from all configured RSS feeds."""
    all_items = []
    errors = []

    for name, url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:10]:
                all_items.append({
                    "source_type": "news",
                    "source_detail": name,
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "score": 0,  # RSS doesn't have engagement metrics
                    "comments": 0,
                    "published_at": entry.get("published", ""),
                    "raw_data": {
                        "source": name,
                        "summary": entry.get("summary", "")[:300],
                    },
                })
        except Exception as e:
            errors.append(f"{name}: {e}")

    return {
        "source": "news",
        "items": all_items,
        "error": "; ".join(errors) if errors else None,
    }
