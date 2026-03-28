"""YouTube scanner — yt-dlp, flat-playlist for speed + full metadata for top videos."""

import subprocess
import json
from datetime import datetime, timedelta

from config import YOUTUBE_CHANNELS, YOUTUBE_VIDEOS_PER_CHANNEL


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
                "views": d.get("view_count", 0),
                "duration": d.get("duration", 0),
                "channel": handle.lstrip("@"),
                "url": f"https://www.youtube.com/watch?v={d.get('id', '')}",
            })
        except json.JSONDecodeError:
            continue
    return videos


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
    """Scan all configured YouTube channels for recent videos."""
    all_items = []
    errors = []

    for handle in YOUTUBE_CHANNELS:
        try:
            videos = _fetch_channel_videos(handle)
            for v in videos:
                all_items.append({
                    "source_type": "youtube",
                    "source_detail": handle,
                    "title": v["title"],
                    "url": v["url"],
                    "score": v["views"],
                    "comments": 0,  # not available in flat-playlist
                    "published_at": None,  # not available in flat-playlist
                    "raw_data": {
                        "video_id": v["id"],
                        "channel": v["channel"],
                        "duration": v["duration"],
                        "views": v["views"],
                    },
                })
        except Exception as e:
            errors.append(f"{handle}: {e}")

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
