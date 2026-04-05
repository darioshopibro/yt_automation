"""Meme researcher — fetches trending + evergreen memes relevant to a topic.

Sources:
1. Imgflip API — top 100 meme templates (evergreen)
2. Reddit r/ProgrammerHumor — trending programmer memes
3. Reddit r/memes — general trending

Returns categorized memes with context for the visual planner agent.
"""

import urllib.request
import urllib.parse
import json
import sys
import os
from datetime import datetime


def fetch_imgflip_templates(limit=30):
    """Fetch top meme templates from Imgflip (evergreen memes).

    These are the classics: Drake, Distracted Boyfriend, This Is Fine, etc.
    Free API, no auth needed.
    """
    try:
        url = "https://api.imgflip.com/get_memes"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        if not data.get("success"):
            return []

        memes = []
        for m in data["data"]["memes"][:limit]:
            memes.append({
                "id": m["id"],
                "name": m["name"],
                "url": m["url"],
                "width": m["width"],
                "height": m["height"],
                "source": "imgflip",
                "type": "static_template",
                "evergreen": True,
            })
        return memes
    except Exception as e:
        return []


def fetch_reddit_memes(subreddit="ProgrammerHumor", sort="hot", limit=20):
    """Fetch trending memes from a subreddit.

    Focuses on image posts with high engagement.
    """
    try:
        url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit={limit}"
        req = urllib.request.Request(url, headers={"User-Agent": "YTAutomation/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        memes = []
        for post in data.get("data", {}).get("children", []):
            d = post["data"]

            # Only image posts (actual memes)
            post_url = d.get("url", "")
            is_image = any(post_url.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"])
            is_imgur = "imgur.com" in post_url
            is_reddit_image = "i.redd.it" in post_url

            if not (is_image or is_imgur or is_reddit_image):
                continue

            memes.append({
                "title": d.get("title", ""),
                "url": post_url,
                "score": d.get("score", 0),
                "comments": d.get("num_comments", 0),
                "subreddit": subreddit,
                "source": "reddit",
                "type": "trending_image",
                "evergreen": False,
                "permalink": f"https://reddit.com{d.get('permalink', '')}",
            })

        # Sort by engagement
        memes.sort(key=lambda x: x["score"], reverse=True)
        return memes

    except Exception as e:
        return []


def search_reddit_memes(topic, limit=10):
    """Search Reddit for memes related to a specific topic."""
    try:
        encoded = urllib.parse.quote(topic)
        url = f"https://www.reddit.com/r/ProgrammerHumor/search.json?q={encoded}&sort=top&t=month&limit={limit}"
        req = urllib.request.Request(url, headers={"User-Agent": "YTAutomation/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        memes = []
        for post in data.get("data", {}).get("children", []):
            d = post["data"]
            post_url = d.get("url", "")
            is_image = any(post_url.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"])
            is_reddit_image = "i.redd.it" in post_url

            if not (is_image or is_reddit_image):
                continue

            memes.append({
                "title": d.get("title", ""),
                "url": post_url,
                "score": d.get("score", 0),
                "source": "reddit_search",
                "type": "topic_meme",
                "topic": topic,
                "evergreen": False,
            })

        memes.sort(key=lambda x: x["score"], reverse=True)
        return memes
    except Exception:
        return []


# Evergreen meme templates that work for ANY tech topic
TECH_EVERGREEN_MEMES = [
    {"name": "Drake Hotline Bling", "usage": "X bad → Y good comparison", "emotion": "preference"},
    {"name": "Distracted Boyfriend", "usage": "choosing new tech over old", "emotion": "temptation"},
    {"name": "This Is Fine", "usage": "production is on fire", "emotion": "denial"},
    {"name": "Anakin Padme", "usage": "unexpected consequence, 'right?'", "emotion": "dread"},
    {"name": "Galaxy Brain", "usage": "increasingly absurd solutions", "emotion": "escalation"},
    {"name": "Two Buttons", "usage": "impossible choice between options", "emotion": "dilemma"},
    {"name": "Change My Mind", "usage": "controversial opinion", "emotion": "challenge"},
    {"name": "Expanding Brain", "usage": "levels of sophistication", "emotion": "escalation"},
    {"name": "Surprised Pikachu", "usage": "obvious outcome that surprises", "emotion": "shock"},
    {"name": "Is This a Pigeon", "usage": "misidentifying something", "emotion": "confusion"},
    {"name": "Stonks", "usage": "questionable success", "emotion": "ironic_success"},
    {"name": "Panik Kalm Panik", "usage": "rollercoaster of realizations", "emotion": "anxiety"},
    {"name": "Always Has Been", "usage": "revealing hidden truth", "emotion": "revelation"},
    {"name": "Monkey Puppet", "usage": "awkward realization", "emotion": "discomfort"},
    {"name": "Trade Offer", "usage": "give X get Y deal", "emotion": "negotiation"},
]


def research_memes(topic=None):
    """Full meme research pipeline.

    Returns categorized memes from multiple sources.
    """
    results = {
        "topic": topic,
        "timestamp": datetime.now().isoformat(),
        "evergreen_templates": [],
        "trending_programmer": [],
        "topic_specific": [],
        "tech_evergreen_suggestions": TECH_EVERGREEN_MEMES,
        "step_log": [],
    }

    # 1. Imgflip evergreen templates
    templates = fetch_imgflip_templates(30)
    results["evergreen_templates"] = templates
    results["step_log"].append({
        "step": "imgflip_templates",
        "status": "ok" if templates else "failed",
        "count": len(templates),
    })

    # 2. Reddit trending programmer memes
    trending = fetch_reddit_memes("ProgrammerHumor", "hot", 15)
    results["trending_programmer"] = trending
    results["step_log"].append({
        "step": "reddit_programmer_humor",
        "status": "ok" if trending else "failed",
        "count": len(trending),
    })

    # 3. Topic-specific search
    if topic:
        specific = search_reddit_memes(topic, 10)
        results["topic_specific"] = specific
        results["step_log"].append({
            "step": "reddit_topic_search",
            "status": "ok" if specific else "no_results",
            "count": len(specific),
            "topic": topic,
        })

    # Summary
    total = len(templates) + len(trending) + len(results.get("topic_specific", []))
    results["total_memes"] = total

    return results


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else "AI coding"

    print(f"Researching memes for: '{topic}'\n")
    data = research_memes(topic)

    print(f"--- Step Log ---")
    for s in data["step_log"]:
        icon = "✅" if s["status"] == "ok" else "⚠️"
        print(f"  {icon} {s['step']}: {s['status']} ({s['count']} memes)")

    print(f"\n--- Evergreen Templates (top 5) ---")
    for m in data["evergreen_templates"][:5]:
        print(f"  {m['name']}")

    print(f"\n--- Trending Programmer Memes (top 5) ---")
    for m in data["trending_programmer"][:5]:
        print(f"  [{m['score']:,} pts] {m['title'][:60]}")

    if data["topic_specific"]:
        print(f"\n--- Topic-Specific: '{topic}' (top 5) ---")
        for m in data["topic_specific"][:5]:
            print(f"  [{m['score']:,} pts] {m['title'][:60]}")

    print(f"\n--- Tech Evergreen Suggestions ---")
    for m in data["tech_evergreen_suggestions"][:5]:
        print(f"  {m['name']:25s} — {m['usage']}")

    print(f"\nTotal: {data['total_memes']} memes found")

    # Save
    output = f"memes_{topic.replace(' ', '_')[:20]}.json"
    with open(output, "w") as f:
        json.dump(data, f, indent=2)
    print(f"📄 Saved: {output}")
