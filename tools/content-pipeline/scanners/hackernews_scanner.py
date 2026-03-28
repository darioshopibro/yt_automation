"""Hacker News scanner — Firebase API, no auth, no rate limits."""

import urllib.request
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from config import HN_STORIES_LIMIT, SCANNER_TIMEOUT


def _fetch_item(story_id):
    url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
        return json.loads(resp.read())


def scan():
    """Fetch top HN stories with metadata."""
    try:
        req = urllib.request.Request("https://hacker-news.firebaseio.com/v0/topstories.json")
        with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
            story_ids = json.loads(resp.read())[:HN_STORIES_LIMIT]

        with ThreadPoolExecutor(max_workers=5) as executor:
            stories = list(executor.map(_fetch_item, story_ids))

        items = []
        for s in stories:
            if not s or s.get("type") != "story":
                continue
            published = datetime.fromtimestamp(s.get("time", 0)).isoformat() if s.get("time") else None
            items.append({
                "source_type": "hackernews",
                "source_detail": "front_page",
                "title": s.get("title", ""),
                "url": s.get("url", f"https://news.ycombinator.com/item?id={s['id']}"),
                "score": s.get("score", 0),
                "comments": s.get("descendants", 0),
                "published_at": published,
                "raw_data": {"id": s["id"], "by": s.get("by", "")},
            })

        return {"source": "hackernews", "items": items, "error": None}

    except Exception as e:
        return {"source": "hackernews", "items": [], "error": str(e)}


if __name__ == "__main__":
    result = scan()
    print(f"HN: {len(result['items'])} stories")
    for i, item in enumerate(result["items"][:5]):
        print(f"  {i+1}. [{item['score']} pts] {item['title'][:70]}")
