"""GitHub scanner — Search API, no auth needed (10 req/min)."""

import urllib.request
import json
from datetime import datetime, timedelta

from config import GITHUB_REPOS_LIMIT, SCANNER_TIMEOUT


def scan():
    """Fetch trending repos created in the last 7 days."""
    try:
        week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        url = (
            f"https://api.github.com/search/repositories"
            f"?q=created:>{week_ago}&sort=stars&order=desc&per_page={GITHUB_REPOS_LIMIT}"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "YTAutomation/1.0"})
        with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
            data = json.loads(resp.read())

        items = []
        for r in data.get("items", []):
            items.append({
                "source_type": "github",
                "source_detail": "trending",
                "title": f"{r['full_name']}: {r.get('description') or 'No description'}",
                "url": r["html_url"],
                "score": r["stargazers_count"],
                "comments": 0,
                "published_at": r.get("created_at"),
                "raw_data": {
                    "full_name": r["full_name"],
                    "language": r.get("language"),
                    "topics": r.get("topics", []),
                    "description": r.get("description", ""),
                },
            })

        return {"source": "github", "items": items, "error": None}

    except Exception as e:
        return {"source": "github", "items": [], "error": str(e)}
