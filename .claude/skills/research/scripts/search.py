#!/usr/bin/env python3
"""
YouTube Search Script for Claude Code
Uses yt-dlp for reliable YouTube searching
"""

import sys
import json
import subprocess

def search_youtube(query: str, limit: int = 10):
    """Search YouTube using yt-dlp and return results"""
    try:
        # Use yt-dlp to search YouTube
        cmd = [
            'yt-dlp',
            f'ytsearch{limit}:{query}',
            '--dump-json',
            '--flat-playlist',
            '--no-warnings',
            '--quiet'
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            return {
                "success": False,
                "error": f"yt-dlp error: {result.stderr}"
            }

        results = []
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            try:
                video = json.loads(line)
                results.append({
                    "title": video.get('title', ''),
                    "url": f"https://www.youtube.com/watch?v={video.get('id', '')}",
                    "channel": video.get('channel', video.get('uploader', '')),
                    "views": format_views(video.get('view_count')),
                    "duration": format_duration(video.get('duration')),
                    "description": (video.get('description', '') or '')[:200] + '...' if video.get('description') else '',
                })
            except json.JSONDecodeError:
                continue

        return {
            "success": True,
            "query": query,
            "count": len(results),
            "results": results
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Search timed out"
        }
    except FileNotFoundError:
        return {
            "success": False,
            "error": "yt-dlp not installed. Run: pip3 install yt-dlp"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def format_views(count):
    """Format view count to human readable"""
    if count is None:
        return "N/A"
    count = int(count)
    if count >= 1_000_000:
        return f"{count/1_000_000:.1f}M views"
    if count >= 1_000:
        return f"{count/1_000:.1f}K views"
    return f"{count} views"

def format_duration(seconds):
    """Format duration to MM:SS or HH:MM:SS"""
    if seconds is None:
        return "N/A"
    seconds = int(seconds)
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python3 search.py 'search query'"
        }))
        sys.exit(1)

    query = ' '.join(sys.argv[1:])
    result = search_youtube(query)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
