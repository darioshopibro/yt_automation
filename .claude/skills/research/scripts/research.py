#!/usr/bin/env python3
"""
YouTube Deep Research Script for Claude Code
Searches YouTube, ranks results, and gets transcripts for top videos - all in one command
"""

import sys
import json
import subprocess
import tempfile
import os
import re
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

def search_youtube(query: str, limit: int = 10):
    """Search YouTube using yt-dlp and return results"""
    try:
        cmd = [
            'yt-dlp',
            f'ytsearch{limit}:{query}',
            '--dump-json',
            '--flat-playlist',
            '--no-warnings',
            '--quiet'
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=45)

        if result.returncode != 0:
            return None, f"yt-dlp error: {result.stderr}"

        results = []
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            try:
                video = json.loads(line)
                view_count = video.get('view_count') or 0
                results.append({
                    "title": video.get('title', ''),
                    "url": f"https://www.youtube.com/watch?v={video.get('id', '')}",
                    "video_id": video.get('id', ''),
                    "channel": video.get('channel', video.get('uploader', '')),
                    "views": view_count,
                    "views_formatted": format_views(view_count),
                    "duration": video.get('duration') or 0,
                    "duration_formatted": format_duration(video.get('duration')),
                    "description": (video.get('description', '') or '')[:300],
                })
            except json.JSONDecodeError:
                continue

        return results, None

    except subprocess.TimeoutExpired:
        return None, "Search timed out"
    except Exception as e:
        return None, str(e)


def get_transcript(url: str):
    """Download and clean transcript using yt-dlp"""
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, 'transcript')

            cmd = [
                'yt-dlp',
                '--write-auto-sub',
                '--sub-lang', 'en',
                '--skip-download',
                '--output', output_path,
                '--no-warnings',
                '--quiet',
                url
            ]

            subprocess.run(cmd, capture_output=True, text=True, timeout=60)

            # Find the subtitle file
            vtt_file = None
            for f in os.listdir(tmpdir):
                if f.endswith('.vtt'):
                    vtt_file = os.path.join(tmpdir, f)
                    break

            if not vtt_file:
                return None, "No English subtitles"

            with open(vtt_file, 'r', encoding='utf-8') as f:
                content = f.read()

            transcript = clean_vtt(content)
            return transcript, None

    except subprocess.TimeoutExpired:
        return None, "Transcript download timed out"
    except Exception as e:
        return None, str(e)


def clean_vtt(content: str) -> str:
    """Clean VTT subtitle content to plain text"""
    content = re.sub(r'WEBVTT.*?Language: \w+\n', '', content, flags=re.DOTALL)

    lines = []
    seen = set()

    for line in content.split('\n'):
        if re.match(r'^\d{2}:\d{2}', line) or not line.strip():
            continue
        clean = re.sub(r'<[^>]+>', '', line)
        clean = re.sub(r'align:start position:\d+%', '', clean)
        clean = clean.strip()

        if clean and clean not in seen:
            seen.add(clean)
            lines.append(clean)

    return ' '.join(lines)


def rank_videos(videos: list, query: str) -> list:
    """Rank videos by relevance (views + duration sweet spot)"""
    query_words = set(query.lower().split())

    for video in videos:
        score = 0

        # View score (log scale)
        views = video.get('views', 0)
        if views > 0:
            import math
            score += math.log10(views + 1) * 10

        # Duration score (prefer 10-30 min videos for tutorials)
        duration = video.get('duration', 0)
        if 600 <= duration <= 1800:  # 10-30 min = sweet spot
            score += 20
        elif 300 <= duration <= 3600:  # 5-60 min = okay
            score += 10

        # Title relevance
        title_words = set(video.get('title', '').lower().split())
        overlap = len(query_words & title_words)
        score += overlap * 15

        video['relevance_score'] = score

    return sorted(videos, key=lambda x: x.get('relevance_score', 0), reverse=True)


def format_views(count):
    if count is None or count == 0:
        return "N/A"
    count = int(count)
    if count >= 1_000_000:
        return f"{count/1_000_000:.1f}M views"
    if count >= 1_000:
        return f"{count/1_000:.1f}K views"
    return f"{count} views"


def format_duration(seconds):
    if seconds is None or seconds == 0:
        return "N/A"
    seconds = int(seconds)
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def fetch_transcripts_parallel(videos: list, max_transcripts: int = 3):
    """Fetch transcripts in parallel for speed"""
    results = []

    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_video = {
            executor.submit(get_transcript, v['url']): v
            for v in videos[:max_transcripts]
        }

        for future in as_completed(future_to_video):
            video = future_to_video[future]
            try:
                transcript, error = future.result()
                results.append({
                    "video": video,
                    "transcript": transcript,
                    "error": error
                })
            except Exception as e:
                results.append({
                    "video": video,
                    "transcript": None,
                    "error": str(e)
                })

    return results


def main():
    parser = argparse.ArgumentParser(description='YouTube Deep Research')
    parser.add_argument('query', nargs='+', help='Search query')
    parser.add_argument('--results', '-r', type=int, default=10, help='Number of search results (default: 10)')
    parser.add_argument('--transcripts', '-t', type=int, default=3, help='Number of transcripts to fetch (default: 3)')
    parser.add_argument('--no-transcripts', action='store_true', help='Skip transcript fetching')

    args = parser.parse_args()
    query = ' '.join(args.query)

    print(f"🔍 Searching YouTube for: {query}", file=sys.stderr)

    # Step 1: Search
    videos, search_error = search_youtube(query, args.results)

    if search_error:
        print(json.dumps({"success": False, "error": search_error}))
        sys.exit(1)

    if not videos:
        print(json.dumps({"success": False, "error": "No videos found"}))
        sys.exit(1)

    print(f"📊 Found {len(videos)} videos, ranking by relevance...", file=sys.stderr)

    # Step 2: Rank
    ranked_videos = rank_videos(videos, query)

    # Step 3: Fetch transcripts (parallel)
    transcripts = []
    if not args.no_transcripts and args.transcripts > 0:
        print(f"📝 Fetching transcripts for top {args.transcripts} videos (parallel)...", file=sys.stderr)
        transcripts = fetch_transcripts_parallel(ranked_videos, args.transcripts)

    # Build output
    output = {
        "success": True,
        "query": query,
        "total_results": len(ranked_videos),
        "videos": [
            {
                "rank": i + 1,
                "title": v["title"],
                "url": v["url"],
                "channel": v["channel"],
                "views": v["views_formatted"],
                "duration": v["duration_formatted"],
                "relevance_score": round(v.get("relevance_score", 0), 1)
            }
            for i, v in enumerate(ranked_videos)
        ],
        "transcripts": [
            {
                "title": t["video"]["title"],
                "url": t["video"]["url"],
                "channel": t["video"]["channel"],
                "transcript": t["transcript"][:8000] if t["transcript"] else None,  # Limit size
                "transcript_length": len(t["transcript"]) if t["transcript"] else 0,
                "error": t["error"]
            }
            for t in transcripts
        ]
    }

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
