"""TikTok scanner — Creative Center trending + yt-dlp profile scraping.

Two data sources:
1. Creative Center API (via Vercel wrapper) — trending hashtags globally
2. yt-dlp — metadata from configured TikTok accounts (outlier detection)

No API keys needed. No paid services.
"""

import subprocess
import json
import urllib.request
import urllib.parse
import sys
import os
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import SCANNER_TIMEOUT

# TikTok accounts to monitor (tech/AI niche)
TIKTOK_ACCOUNTS = [
    "tabortime",        # Tech tips
    "iamcoreyt",        # Web dev
    "techbytim",        # Tech reviews
    "firikiapp",        # AI tools
    "thecodeboss",      # Coding
]

# Creative Center API (Vercel wrapper - free, no auth)
CREATIVE_CENTER_BASE = "https://tiktok-discover-api.vercel.app/api"


def _fetch_trending_hashtags(limit=20, period=7):
    """Fetch trending TikTok hashtags from Creative Center.

    Returns list of hashtag dicts with trend data.
    Note: country filter is unreliable on the Vercel wrapper, so we get global trends.
    """
    url = f"{CREATIVE_CENTER_BASE}?endpoint=getTrendingHastag&country=US&page=1&limit={limit}&period={period}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        hashtags = data.get("data", {}).get("list", [])
        return {"hashtags": hashtags, "error": None}
    except Exception as e:
        return {"hashtags": [], "error": str(e)}


def _fetch_trending_videos(limit=10, period=7):
    """Fetch trending TikTok videos from Creative Center."""
    url = f"{CREATIVE_CENTER_BASE}?endpoint=getTrendingVideos&country=US&page=1&limit={limit}&period={period}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})

    try:
        with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        videos = data.get("data", {}).get("videos", [])
        return {"videos": videos, "error": None}
    except Exception as e:
        return {"videos": [], "error": str(e)}


def _fetch_account_videos(username, limit=5):
    """Fetch recent videos from a TikTok account using yt-dlp.

    yt-dlp's TikTok user extractor is flaky (known issue).
    We try multiple URL formats for robustness.
    """
    # Try different URL formats — yt-dlp TikTok breaks periodically
    urls_to_try = [
        f"https://www.tiktok.com/@{username}",
        f"https://www.tiktok.com/@{username}/video",
    ]

    for url in urls_to_try:
        cmd = [
            "yt-dlp", "--flat-playlist", "--dump-json",
            "--playlist-items", f"1:{limit}",
            "--no-warnings", "--quiet",
            "--extractor-args", "tiktok:api_hostname=api22-normal-c-useast2a.tiktokv.com",
            url
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode != 0:
                continue  # Try next URL format

            videos = []
            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue
                try:
                    d = json.loads(line)
                    videos.append({
                        "id": d.get("id", ""),
                        "title": d.get("title", d.get("description", ""))[:200],
                        "views": d.get("view_count", 0) or 0,
                        "likes": d.get("like_count", 0) or 0,
                        "comments": d.get("comment_count", 0) or 0,
                        "shares": d.get("repost_count", 0) or 0,
                        "duration": d.get("duration", 0),
                        "username": username,
                        "url": d.get("webpage_url", f"https://www.tiktok.com/@{username}/video/{d.get('id', '')}"),
                        "upload_date": d.get("upload_date", ""),
                    })
                except json.JSONDecodeError:
                    continue

            if videos:
                return {"videos": videos, "error": None}

        except subprocess.TimeoutExpired:
            continue
        except Exception:
            continue

    # All URL formats failed
    return {"videos": [], "error": f"yt-dlp failed for @{username} (TikTok user extractor is flaky — known issue)"}


def _detect_account_outliers(videos, username):
    """Detect outlier videos for a TikTok account (3x+ avg views)."""
    if len(videos) < 2:
        return []

    views_list = [v["views"] for v in videos if v["views"] > 0]
    if not views_list:
        return []

    avg_views = sum(views_list) / len(views_list)
    outliers = []

    for v in videos:
        if avg_views > 0 and v["views"] >= avg_views * 3:
            v["outlier_ratio"] = round(v["views"] / avg_views, 1)
            v["account_avg_views"] = int(avg_views)
            outliers.append(v)

    return outliers


def scan():
    """Run TikTok scanner — Creative Center trends + account monitoring.

    Returns standardized scanner output with items and detailed step_log.
    """
    items = []
    errors = []
    step_log = []  # Detailed log of each step

    # === STEP 1: Creative Center Trending Hashtags ===
    step_log.append({"step": "creative_center_hashtags", "status": "running"})
    hashtag_result = _fetch_trending_hashtags(limit=20, period=7)

    if hashtag_result["error"]:
        step_log[-1].update({"status": "failed", "error": hashtag_result["error"], "count": 0})
        errors.append(f"CC hashtags: {hashtag_result['error']}")
    else:
        hashtags = hashtag_result["hashtags"]
        step_log[-1].update({"status": "ok", "count": len(hashtags)})

        for h in hashtags[:15]:  # Top 15
            name = h.get("hashtag_name", "")
            industry = h.get("industry_info", {}).get("value", "unknown")

            # Calculate hashtag velocity from trend data
            trend = h.get("trend", [])
            velocity = 0
            if len(trend) >= 2:
                first_val = trend[0].get("value", 0)
                last_val = trend[-1].get("value", 0)
                if first_val > 0:
                    velocity = (last_val - first_val) / first_val

            items.append({
                "source_type": "tiktok",
                "source_detail": "creative_center_hashtag",
                "title": f"TikTok trending: #{name} ({industry})",
                "url": f"https://www.tiktok.com/tag/{name}",
                "score": 0,  # No numeric engagement score from CC
                "comments": 0,
                "published_at": datetime.now(timezone.utc).isoformat(),
                "raw_data": {
                    "hashtag": name,
                    "industry": industry,
                    "velocity": round(velocity, 3),
                    "trend_data": trend[-3:] if trend else [],  # Last 3 data points
                    "source": "creative_center",
                },
            })

    # === STEP 2: Creative Center Trending Videos ===
    step_log.append({"step": "creative_center_videos", "status": "running"})
    video_result = _fetch_trending_videos(limit=10, period=7)

    if video_result["error"]:
        step_log[-1].update({"status": "failed", "error": video_result["error"], "count": 0})
        errors.append(f"CC videos: {video_result['error']}")
    else:
        cc_videos = video_result["videos"]
        step_log[-1].update({"status": "ok", "count": len(cc_videos)})

        for v in cc_videos[:10]:
            title = v.get("title", "")[:200]
            items.append({
                "source_type": "tiktok",
                "source_detail": "creative_center_video",
                "title": title if title else "TikTok trending video",
                "url": v.get("item_url", ""),
                "score": 0,
                "comments": 0,
                "published_at": datetime.now(timezone.utc).isoformat(),
                "raw_data": {
                    "video_id": v.get("item_id", ""),
                    "duration": v.get("duration", 0),
                    "region": v.get("region", ""),
                    "source": "creative_center",
                },
            })

    # === STEP 3: Account Monitoring (yt-dlp) ===
    step_log.append({"step": "account_monitoring", "status": "running", "accounts": {}})
    all_outliers = []

    for username in TIKTOK_ACCOUNTS:
        account_result = _fetch_account_videos(username, limit=5)
        account_log = {"status": "ok", "videos": 0, "outliers": 0, "error": None}

        if account_result["error"]:
            account_log["status"] = "failed"
            account_log["error"] = account_result["error"]
            errors.append(f"@{username}: {account_result['error']}")
        else:
            videos = account_result["videos"]
            account_log["videos"] = len(videos)

            # Detect outliers
            outliers = _detect_account_outliers(videos, username)
            account_log["outliers"] = len(outliers)
            all_outliers.extend(outliers)

            # Add all videos as items
            for v in videos:
                is_outlier = any(o["id"] == v["id"] for o in outliers)
                outlier_data = next((o for o in outliers if o["id"] == v["id"]), None)

                items.append({
                    "source_type": "tiktok",
                    "source_detail": f"@{username}",
                    "title": v["title"],
                    "url": v["url"],
                    "score": v["views"],
                    "comments": v["comments"],
                    "published_at": v.get("upload_date", ""),
                    "raw_data": {
                        "video_id": v["id"],
                        "username": username,
                        "views": v["views"],
                        "likes": v["likes"],
                        "shares": v.get("shares", 0),
                        "duration": v["duration"],
                        "is_outlier": is_outlier,
                        "outlier_ratio": outlier_data["outlier_ratio"] if outlier_data else None,
                        "account_avg_views": outlier_data["account_avg_views"] if outlier_data else None,
                        "source": "yt-dlp",
                    },
                })

        step_log[-1]["accounts"][username] = account_log

    # Finalize account monitoring step
    total_videos = sum(a["videos"] for a in step_log[-1]["accounts"].values())
    total_failed = sum(1 for a in step_log[-1]["accounts"].values() if a["status"] == "failed")
    step_log[-1]["status"] = "ok" if total_failed < len(TIKTOK_ACCOUNTS) else "failed"
    step_log[-1]["total_videos"] = total_videos
    step_log[-1]["total_outliers"] = len(all_outliers)
    step_log[-1]["accounts_ok"] = len(TIKTOK_ACCOUNTS) - total_failed
    step_log[-1]["accounts_failed"] = total_failed

    # Print summary
    if all_outliers:
        print(f"  🔥 TikTok outliers ({len(all_outliers)}):")
        for o in all_outliers[:3]:
            print(f"    @{o['username']}: {o['title'][:50]} ({o['views']:,} views, {o['outlier_ratio']}x avg)")

    return {
        "source": "tiktok",
        "items": items,
        "error": "; ".join(errors) if errors else None,
        "step_log": step_log,
    }


if __name__ == "__main__":
    print("Testing TikTok scanner...\n")
    result = scan()

    print(f"\n{'='*50}")
    print(f"Total items: {len(result['items'])}")
    if result["error"]:
        print(f"Errors: {result['error']}")

    print(f"\n--- Step Log ---")
    for step in result["step_log"]:
        name = step["step"]
        status = step["status"]
        icon = "✅" if status == "ok" else "❌" if status == "failed" else "⏳"
        print(f"  {icon} {name}: {status}")
        if name == "account_monitoring":
            for acc, info in step.get("accounts", {}).items():
                acc_icon = "✅" if info["status"] == "ok" else "❌"
                print(f"      {acc_icon} @{acc}: {info['videos']} videos, {info['outliers']} outliers"
                      + (f" — {info['error']}" if info.get('error') else ""))
        elif step.get("count") is not None:
            print(f"      {step['count']} items")

    # Show sample items
    print(f"\n--- Sample Items ---")
    for item in result["items"][:5]:
        detail = item["source_detail"]
        print(f"  [{detail}] {item['title'][:60]}")
