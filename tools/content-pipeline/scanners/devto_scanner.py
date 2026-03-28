"""Dev.to scanner — public REST API, no auth needed."""

import urllib.request
import json

from config import DEVTO_ARTICLES_LIMIT, SCANNER_TIMEOUT


def scan():
    """Fetch top articles from the last 7 days."""
    try:
        url = f"https://dev.to/api/articles?top=7&per_page={DEVTO_ARTICLES_LIMIT}"
        req = urllib.request.Request(url, headers={"User-Agent": "YTAutomation/1.0"})
        with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
            articles = json.loads(resp.read())

        items = []
        for a in articles:
            items.append({
                "source_type": "devto",
                "source_detail": "top_week",
                "title": a.get("title", ""),
                "url": a.get("url", ""),
                "score": a.get("positive_reactions_count", 0),
                "comments": a.get("comments_count", 0),
                "published_at": a.get("published_at"),
                "raw_data": {
                    "tags": a.get("tag_list", []),
                    "description": a.get("description", ""),
                    "user": a.get("user", {}).get("name", ""),
                },
            })

        return {"source": "devto", "items": items, "error": None}

    except Exception as e:
        return {"source": "devto", "items": [], "error": str(e)}
