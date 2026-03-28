"""Reddit scanner — public JSON endpoint, no auth needed."""

import urllib.request
import json
from datetime import datetime

from config import SUBREDDITS, REDDIT_POSTS_LIMIT, SCANNER_TIMEOUT


def _fetch_subreddit(subreddit):
    url = f"https://www.reddit.com/r/{subreddit}/top.json?t=week&limit={REDDIT_POSTS_LIMIT}"
    req = urllib.request.Request(url, headers={"User-Agent": "YTAutomation/1.0"})
    with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
        data = json.loads(resp.read())

    items = []
    for p in data["data"]["children"]:
        d = p["data"]
        published = datetime.fromtimestamp(d.get("created_utc", 0)).isoformat() if d.get("created_utc") else None
        items.append({
            "source_type": "reddit",
            "source_detail": f"r/{subreddit}",
            "title": d.get("title", ""),
            "url": f"https://reddit.com{d.get('permalink', '')}",
            "score": d.get("score", 0),
            "comments": d.get("num_comments", 0),
            "published_at": published,
            "raw_data": {
                "subreddit": subreddit,
                "author": d.get("author", ""),
                "selftext": d.get("selftext", "")[:500],
                "link_url": d.get("url", ""),
            },
        })
    return items


def scan():
    """Fetch top posts from all configured subreddits."""
    all_items = []
    errors = []

    for subreddit in SUBREDDITS:
        try:
            items = _fetch_subreddit(subreddit)
            all_items.extend(items)
        except Exception as e:
            errors.append(f"r/{subreddit}: {e}")

    return {
        "source": "reddit",
        "items": all_items,
        "error": "; ".join(errors) if errors else None,
    }


if __name__ == "__main__":
    result = scan()
    print(f"Reddit: {len(result['items'])} posts from {len(SUBREDDITS)} subreddits")
    if result["error"]:
        print(f"  Errors: {result['error']}")
    for i, item in enumerate(result["items"][:5]):
        print(f"  {i+1}. [{item['score']} pts, {item['comments']} comments] {item['title'][:70]}")
