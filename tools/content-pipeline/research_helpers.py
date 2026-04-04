"""Research helpers — fetch YouTube comments, Reddit threads, and transcripts in parallel.

These feed into angle detection to give a much fuller picture than just transcripts alone.
"""

import subprocess
import json
import urllib.request
import urllib.parse
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(__file__))

RESEARCH_SCRIPT = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "research", "scripts")


# === TRANSCRIPT FETCHING ===

def search_videos(topic_title, count=10):
    """Search YouTube for videos on a topic. Returns list of video dicts."""
    search_script = os.path.join(RESEARCH_SCRIPT, "search.py")

    result = subprocess.run(
        ["python3", search_script, topic_title],
        capture_output=True, text=True, timeout=30
    )
    if not result.stdout:
        return []

    try:
        data = json.loads(result.stdout)
        return data.get("results", data.get("videos", []))[:count]
    except json.JSONDecodeError:
        return []


def fetch_transcript(url):
    """Fetch transcript for a single video. Returns dict or None."""
    transcript_script = os.path.join(RESEARCH_SCRIPT, "transcript.py")

    try:
        result = subprocess.run(
            ["python3", transcript_script, url],
            capture_output=True, text=True, timeout=60
        )
        if not result.stdout:
            return None

        data = json.loads(result.stdout)
        text = data.get("transcript", "")
        if text and len(text) > 100:
            return {
                "title": data.get("video", {}).get("title", url),
                "text": text[:4000],
                "url": url,
                "channel": data.get("video", {}).get("channel", ""),
            }
    except Exception:
        pass
    return None


def fetch_transcripts_parallel(videos, max_transcripts=7):
    """Fetch transcripts for multiple videos in parallel.

    Tries more videos than needed in case some fail.
    """
    transcripts = []
    urls = [v.get("url", v.get("webpage_url", "")) for v in videos if v.get("url") or v.get("webpage_url")]

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(fetch_transcript, url): url for url in urls[:max_transcripts + 3]}

        for future in as_completed(futures):
            if len(transcripts) >= max_transcripts:
                break
            result = future.result()
            if result:
                transcripts.append(result)

    return transcripts


# === YOUTUBE COMMENT MINING ===

def fetch_video_comments(video_url, max_comments=50):
    """Fetch top comments from a YouTube video using yt-dlp.

    Comments reveal what viewers want more of, what confused them,
    and what the creator missed.
    """
    try:
        cmd = [
            "yt-dlp", "--dump-json", "--no-download",
            "--extractor-args", f"youtube:max_comments={max_comments},all,100",
            "--no-warnings", "--quiet",
            video_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            return []

        data = json.loads(result.stdout)
        raw_comments = data.get("comments", [])

        comments = []
        for c in raw_comments[:max_comments]:
            text = c.get("text", "")
            if len(text) > 10:  # skip tiny comments
                comments.append({
                    "text": text[:500],
                    "likes": c.get("like_count", 0),
                    "author": c.get("author", ""),
                })

        # Sort by likes (most liked comments = most representative)
        comments.sort(key=lambda x: x["likes"], reverse=True)
        return comments

    except Exception:
        return []


def fetch_comments_for_videos(videos, max_per_video=30):
    """Fetch comments from multiple videos in parallel.

    Returns dict: {video_url: [comments]}
    """
    all_comments = {}

    def _fetch(v):
        url = v.get("url", "")
        comments = fetch_video_comments(url, max_per_video)
        return url, comments

    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(_fetch, v) for v in videos[:5]]  # top 5 videos
        for future in as_completed(futures):
            url, comments = future.result()
            if comments:
                all_comments[url] = comments

    return all_comments


def extract_pain_points_from_comments(all_comments):
    """Extract common pain points and requests from YouTube comments.

    Looks for patterns like:
    - Questions (?)
    - Requests ("I wish", "would be nice", "please cover")
    - Confusion ("I don't understand", "confused", "what about")
    - Disagreements ("actually", "but", "not quite")
    """
    pain_points = []
    requests = []
    questions = []

    request_keywords = ["wish", "please", "would be nice", "should cover", "could you", "can you", "make a video"]
    confusion_keywords = ["confused", "don't understand", "doesn't make sense", "what about", "but what if"]

    for url, comments in all_comments.items():
        for c in comments:
            text = c["text"].lower()

            if "?" in c["text"]:
                questions.append(c["text"][:200])

            if any(kw in text for kw in request_keywords):
                requests.append(c["text"][:200])

            if any(kw in text for kw in confusion_keywords):
                pain_points.append(c["text"][:200])

    return {
        "questions": questions[:15],
        "requests": requests[:10],
        "pain_points": pain_points[:10],
        "total_comments_analyzed": sum(len(c) for c in all_comments.values()),
    }


# === REDDIT PAIN POINTS ===

def fetch_reddit_threads(topic, limit=10):
    """Search Reddit for threads about a topic.

    Returns top threads with titles, scores, and top comments.
    """
    # Search across relevant subreddits
    subreddits = ["programming", "webdev", "devops", "machinelearning", "learnprogramming", "cscareerquestions"]
    all_threads = []

    for subreddit in subreddits[:3]:  # limit to 3 subreddits for speed
        try:
            encoded = urllib.parse.quote(topic)
            url = f"https://www.reddit.com/r/{subreddit}/search.json?q={encoded}&sort=relevance&t=month&limit={limit}"
            req = urllib.request.Request(url, headers={"User-Agent": "YTAutomation/1.0"})

            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read())

            for p in data.get("data", {}).get("children", []):
                d = p["data"]
                all_threads.append({
                    "title": d.get("title", ""),
                    "score": d.get("score", 0),
                    "comments": d.get("num_comments", 0),
                    "selftext": d.get("selftext", "")[:500],
                    "subreddit": subreddit,
                    "url": f"https://reddit.com{d.get('permalink', '')}",
                })

        except Exception:
            continue

    # Sort by engagement (score + comments)
    all_threads.sort(key=lambda x: x["score"] + x["comments"] * 3, reverse=True)
    return all_threads[:limit]


def fetch_reddit_comments(thread_url, limit=20):
    """Fetch top comments from a Reddit thread."""
    try:
        json_url = thread_url.rstrip("/") + ".json"
        req = urllib.request.Request(json_url, headers={"User-Agent": "YTAutomation/1.0"})

        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())

        if not isinstance(data, list) or len(data) < 2:
            return []

        comments = []
        for c in data[1].get("data", {}).get("children", []):
            body = c.get("data", {}).get("body", "")
            score = c.get("data", {}).get("score", 0)
            if body and len(body) > 20:
                comments.append({"text": body[:500], "score": score})

        comments.sort(key=lambda x: x["score"], reverse=True)
        return comments[:limit]

    except Exception:
        return []


def fetch_reddit_pain_points(topic):
    """Full Reddit research for a topic.

    Returns threads + pain points extracted from comments.
    """
    threads = fetch_reddit_threads(topic, limit=5)

    # Fetch comments for top 3 threads
    all_reddit_comments = []
    for thread in threads[:3]:
        comments = fetch_reddit_comments(thread["url"])
        all_reddit_comments.extend(comments)

    # Extract questions and pain points
    questions = []
    pain_points = []

    for thread in threads:
        if "?" in thread["title"]:
            questions.append(thread["title"])
        if thread["selftext"] and "?" in thread["selftext"]:
            for sentence in thread["selftext"].split("?"):
                s = sentence.strip()
                if len(s) > 15:
                    questions.append(s + "?")

    for c in all_reddit_comments:
        if "?" in c["text"]:
            for sentence in c["text"].split("?"):
                s = sentence.strip()
                if len(s) > 15:
                    questions.append(s + "?")

    return {
        "threads": threads,
        "questions": questions[:15],
        "total_threads": len(threads),
        "total_comments": len(all_reddit_comments),
    }


# === FULL PARALLEL RESEARCH ===

def research_topic(topic_title):
    """Run full parallel research for a topic.

    Fetches transcripts, YouTube comments, and Reddit threads in parallel.

    Returns:
        dict with transcripts, yt_comments, reddit_data, and step_log
    """
    step_log = []
    results = {}

    # First: search for videos (needed for both transcripts and comments)
    videos = search_videos(topic_title, count=10)
    step_log.append({"step": "video_search", "status": "ok" if videos else "failed", "count": len(videos)})

    if not videos:
        return {
            "transcripts": [],
            "yt_comments": {"questions": [], "requests": [], "pain_points": [], "total_comments_analyzed": 0},
            "reddit_data": {"threads": [], "questions": [], "total_threads": 0, "total_comments": 0},
            "step_log": step_log,
        }

    # Parallel: transcripts + comments + reddit
    with ThreadPoolExecutor(max_workers=3) as executor:
        future_transcripts = executor.submit(fetch_transcripts_parallel, videos, 7)
        future_comments = executor.submit(fetch_comments_for_videos, videos[:5])
        future_reddit = executor.submit(fetch_reddit_pain_points, topic_title)

        # Collect results
        try:
            transcripts = future_transcripts.result(timeout=120)
            step_log.append({"step": "fetch_transcripts", "status": "ok", "count": len(transcripts)})
        except Exception as e:
            transcripts = []
            step_log.append({"step": "fetch_transcripts", "status": "failed", "error": str(e)})

        try:
            raw_comments = future_comments.result(timeout=60)
            yt_comment_analysis = extract_pain_points_from_comments(raw_comments)
            step_log.append({
                "step": "fetch_yt_comments", "status": "ok",
                "count": yt_comment_analysis["total_comments_analyzed"],
            })
        except Exception as e:
            yt_comment_analysis = {"questions": [], "requests": [], "pain_points": [], "total_comments_analyzed": 0}
            step_log.append({"step": "fetch_yt_comments", "status": "failed", "error": str(e)})

        try:
            reddit_data = future_reddit.result(timeout=30)
            step_log.append({
                "step": "fetch_reddit", "status": "ok",
                "threads": reddit_data["total_threads"],
                "comments": reddit_data["total_comments"],
            })
        except Exception as e:
            reddit_data = {"threads": [], "questions": [], "total_threads": 0, "total_comments": 0}
            step_log.append({"step": "fetch_reddit", "status": "failed", "error": str(e)})

    return {
        "transcripts": transcripts,
        "yt_comments": yt_comment_analysis,
        "reddit_data": reddit_data,
        "step_log": step_log,
    }


if __name__ == "__main__":
    topic = sys.argv[1] if len(sys.argv) > 1 else "docker container security"
    print(f"Researching: {topic}\n")

    data = research_topic(topic)

    print(f"--- Step Log ---")
    for s in data["step_log"]:
        icon = "✅" if s["status"] == "ok" else "❌"
        print(f"  {icon} {s['step']}: {s['status']} — {s}")

    print(f"\n--- Transcripts: {len(data['transcripts'])} ---")
    for t in data["transcripts"]:
        print(f"  {t['title'][:60]} ({len(t['text'])} chars)")

    print(f"\n--- YT Comments Analysis ---")
    yc = data["yt_comments"]
    print(f"  Total analyzed: {yc['total_comments_analyzed']}")
    print(f"  Questions: {len(yc['questions'])}")
    for q in yc["questions"][:3]:
        print(f"    ? {q[:80]}")
    print(f"  Requests: {len(yc['requests'])}")
    for r in yc["requests"][:3]:
        print(f"    → {r[:80]}")

    print(f"\n--- Reddit Data ---")
    rd = data["reddit_data"]
    print(f"  Threads: {rd['total_threads']}, Comments: {rd['total_comments']}")
    print(f"  Questions: {len(rd['questions'])}")
    for q in rd["questions"][:3]:
        print(f"    ? {q[:80]}")
