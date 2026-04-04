"""YouTube scanner — yt-dlp, flat-playlist for speed + outlier detection."""

import subprocess
import json
import sys
import os
from datetime import datetime, timedelta

# Add parent dir for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config import YOUTUBE_CHANNELS, YOUTUBE_VIDEOS_PER_CHANNEL
import db


def _fetch_channel_videos(handle):
    """Fetch recent videos from a channel using yt-dlp flat-playlist."""
    cmd = [
        "yt-dlp", "--flat-playlist", "--dump-json",
        "--playlist-items", f"1:{YOUTUBE_VIDEOS_PER_CHANNEL}",
        f"https://www.youtube.com/{handle}/videos"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        return []

    videos = []
    for line in result.stdout.strip().split("\n"):
        if not line:
            continue
        try:
            d = json.loads(line)
            videos.append({
                "id": d.get("id", ""),
                "title": d.get("title", ""),
                "views": d.get("view_count", 0) or 0,
                "duration": d.get("duration", 0),
                "channel": handle.lstrip("@"),
                "url": f"https://www.youtube.com/watch?v={d.get('id', '')}",
            })
        except json.JSONDecodeError:
            continue
    return videos


def _detect_outliers(videos, handle):
    """Detect outlier videos — those with 3x+ the channel's average views.

    An outlier video on any channel = proven topic with proven demand.
    Updates channel_stats in DB for future reference.
    """
    if not videos:
        return []

    channel_name = handle.lstrip("@")
    views_list = [v["views"] for v in videos if v["views"] > 0]

    if not views_list:
        return []

    avg_views = sum(views_list) / len(views_list)

    # Update channel stats in DB
    db.set_channel_stats(channel_name, int(avg_views), sample_size=len(views_list))

    # Find outliers: videos with 3x+ average views
    outliers = []
    for v in videos:
        if avg_views > 0 and v["views"] >= avg_views * 3:
            ratio = v["views"] / avg_views
            v["outlier_ratio"] = round(ratio, 1)
            v["channel_avg_views"] = int(avg_views)
            outliers.append(v)

    return outliers


def _fetch_full_metadata(video_url):
    """Fetch full metadata for a single video (likes, comments, upload_date)."""
    cmd = ["yt-dlp", "--dump-json", "--no-download", "--no-warnings", "--quiet", video_url]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    if result.returncode != 0:
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return None


def scan():
    """Scan all configured YouTube channels for recent videos.

    Now includes outlier detection — videos with 3x+ channel average views
    get flagged with outlier_ratio in raw_data.
    """
    all_items = []
    all_outliers = []
    errors = []

    for handle in YOUTUBE_CHANNELS:
        try:
            videos = _fetch_channel_videos(handle)

            # Detect outliers for this channel
            outliers = _detect_outliers(videos, handle)
            outlier_ids = {v["id"] for v in outliers}

            for v in videos:
                is_outlier = v["id"] in outlier_ids
                outlier_data = next((o for o in outliers if o["id"] == v["id"]), None)

                item = {
                    "source_type": "youtube",
                    "source_detail": handle,
                    "title": v["title"],
                    "url": v["url"],
                    "score": v["views"],
                    "comments": 0,
                    "published_at": None,
                    "raw_data": {
                        "video_id": v["id"],
                        "channel": v["channel"],
                        "duration": v["duration"],
                        "views": v["views"],
                        "is_outlier": is_outlier,
                        "outlier_ratio": outlier_data["outlier_ratio"] if outlier_data else None,
                        "channel_avg_views": outlier_data["channel_avg_views"] if outlier_data else None,
                    },
                }
                all_items.append(item)

                if is_outlier:
                    all_outliers.append(item)

        except Exception as e:
            errors.append(f"{handle}: {e}")

    if all_outliers:
        print(f"  🔥 {len(all_outliers)} outlier videos detected (3x+ channel avg):")
        for o in all_outliers[:5]:
            d = o["raw_data"]
            print(f"    {d['channel']}: {o['title'][:50]} ({d['views']:,} views, {d['outlier_ratio']}x avg)")

    return {
        "source": "youtube",
        "items": all_items,
        "error": "; ".join(errors) if errors else None,
    }


if __name__ == "__main__":
    result = scan()
    print(f"YouTube: {len(result['items'])} videos from {len(YOUTUBE_CHANNELS)} channels")
    if result["error"]:
        print(f"  Errors: {result['error']}")
    for i, item in enumerate(result["items"][:10]):
        print(f"  {i+1}. [{item['score']:,} views] {item['raw_data']['channel']}: {item['title'][:60]}")
