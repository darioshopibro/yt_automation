"""Google Trends scanner (upgraded) — uses PyTrends for velocity, breakout, related queries.

Replaces the basic RSS-only trends_scanner.py with richer data:
- Interest over time (velocity detection)
- Related queries (rising = breakout potential)
- Related topics
- Geographic breakdown (optional)
"""

import time
from datetime import datetime, timezone

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from pytrends.request import TrendReq
    HAS_PYTRENDS = True
except ImportError:
    HAS_PYTRENDS = False

from config import SCANNER_TIMEOUT

# Tech keywords to track trends for (rotated in batches of 5 — PyTrends limit)
TREND_KEYWORDS = [
    # Batch 1: AI/ML
    ["chatgpt", "claude ai", "llama ai", "gemini ai", "cursor ai"],
    # Batch 2: Dev tools
    ["docker", "kubernetes", "react", "nextjs", "typescript"],
    # Batch 3: Cloud/DevOps
    ["aws", "vercel", "github copilot", "terraform", "rust programming"],
]


def _check_trends_batch(pytrends, keywords):
    """Check trends for a batch of up to 5 keywords.

    Returns list of trend items with velocity and breakout data.
    """
    items = []

    try:
        pytrends.build_payload(keywords, timeframe="now 7-d", geo="US")

        # Interest over time
        iot = pytrends.interest_over_time()
        if iot.empty:
            return items

        for kw in keywords:
            if kw not in iot.columns:
                continue

            series = iot[kw]
            if len(series) < 2:
                continue

            # Calculate velocity: compare last 24h avg vs first 24h avg
            total_points = len(series)
            quarter = max(total_points // 4, 1)

            first_quarter_avg = series[:quarter].mean()
            last_quarter_avg = series[-quarter:].mean()

            if first_quarter_avg > 0:
                velocity = (last_quarter_avg - first_quarter_avg) / first_quarter_avg
            else:
                velocity = 1.0 if last_quarter_avg > 0 else 0

            current_interest = int(series.iloc[-1])
            peak_interest = int(series.max())
            avg_interest = float(series.mean())

            # Classify trend
            if velocity > 0.5:
                trend_type = "breakout"
            elif velocity > 0.2:
                trend_type = "rising"
            elif velocity > -0.1:
                trend_type = "stable"
            else:
                trend_type = "declining"

            items.append({
                "source_type": "trends",
                "source_detail": "google_trends_pytrends",
                "title": f"Trending: {kw} ({trend_type}, velocity: {velocity:+.0%})",
                "url": f"https://trends.google.com/trends/explore?q={kw.replace(' ', '+')}&geo=US",
                "score": current_interest,  # 0-100 scale from Google
                "comments": 0,
                "published_at": datetime.now(timezone.utc).isoformat(),
                "raw_data": {
                    "keyword": kw,
                    "current_interest": current_interest,
                    "peak_interest": peak_interest,
                    "avg_interest": round(avg_interest, 1),
                    "velocity": round(velocity, 3),
                    "trend_type": trend_type,
                },
            })

        time.sleep(1)  # Rate limit between batches

    except Exception as e:
        # PyTrends can be flaky — don't crash the whole scan
        pass

    return items


def _get_related_queries(pytrends, keywords):
    """Get rising/breakout related queries for keywords.

    These are the gold — queries that are exploding in search volume.
    """
    items = []

    try:
        pytrends.build_payload(keywords[:5], timeframe="now 7-d", geo="US")
        related = pytrends.related_queries()

        for kw, data in related.items():
            rising = data.get("rising")
            if rising is None or rising.empty:
                continue

            # Top 3 rising queries per keyword
            for _, row in rising.head(3).iterrows():
                query = row.get("query", "")
                value = row.get("value", 0)

                # "Breakout" in Google Trends means >5000% growth
                is_breakout = str(value).lower() == "breakout" or (isinstance(value, (int, float)) and value > 5000)

                items.append({
                    "source_type": "trends",
                    "source_detail": "google_trends_rising",
                    "title": f"Rising query: '{query}' (from '{kw}') — {'BREAKOUT' if is_breakout else f'+{value}%'}",
                    "url": f"https://trends.google.com/trends/explore?q={query.replace(' ', '+')}&geo=US",
                    "score": value if isinstance(value, (int, float)) else 10000,
                    "comments": 0,
                    "published_at": datetime.now(timezone.utc).isoformat(),
                    "raw_data": {
                        "query": query,
                        "parent_keyword": kw,
                        "growth_value": value,
                        "is_breakout": is_breakout,
                    },
                })
    except Exception:
        pass

    return items


def scan():
    """Scan Google Trends with PyTrends for velocity + breakout detection.

    Falls back to basic RSS if PyTrends is not installed.
    """
    if not HAS_PYTRENDS:
        # Fallback to old RSS method
        from scanners import trends_scanner as fallback
        result = fallback.scan()
        result["error"] = "PyTrends not installed — using RSS fallback. pip install pytrends"
        return result

    items = []
    errors = []

    try:
        pytrends = TrendReq(hl="en-US", tz=360)

        # Check each batch
        for batch in TREND_KEYWORDS:
            batch_items = _check_trends_batch(pytrends, batch)
            items.extend(batch_items)

        # Get rising queries for first batch (most important keywords)
        if TREND_KEYWORDS:
            rising_items = _get_related_queries(pytrends, TREND_KEYWORDS[0])
            items.extend(rising_items)

    except Exception as e:
        errors.append(str(e))

    return {
        "source": "trends",
        "items": items,
        "error": "; ".join(errors) if errors else None,
    }


if __name__ == "__main__":
    print("Testing PyTrends scanner...\n")
    result = scan()
    print(f"Found {len(result['items'])} trend items")
    if result["error"]:
        print(f"Errors: {result['error']}")

    for item in result["items"]:
        d = item["raw_data"]
        if "velocity" in d:
            print(f"  {d['keyword']}: interest={d['current_interest']}, "
                  f"velocity={d['velocity']:+.0%}, type={d['trend_type']}")
        elif "query" in d:
            growth = d.get("growth_value", "?")
            label = "BREAKOUT" if d.get("is_breakout") else f"+{growth}%"
            print(f"  Rising: '{d['query']}' (from '{d['parent_keyword']}') — {label}")
