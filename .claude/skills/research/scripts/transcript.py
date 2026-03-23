#!/usr/bin/env python3
"""
YouTube Transcript Extractor for Claude Code
Fetches video metadata and clean transcript from a YouTube URL
"""

import sys
import json
import subprocess
import tempfile
import os
import re

def get_video_info(url: str):
    """Get video metadata using yt-dlp"""
    try:
        cmd = [
            'yt-dlp',
            '--dump-json',
            '--no-download',
            '--no-warnings',
            '--quiet',
            url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            return None, f"yt-dlp error: {result.stderr}"

        data = json.loads(result.stdout)
        return {
            "title": data.get('title', ''),
            "channel": data.get('channel', data.get('uploader', '')),
            "duration": format_duration(data.get('duration')),
            "views": format_views(data.get('view_count')),
            "upload_date": data.get('upload_date', ''),
            "description": (data.get('description', '') or '')[:500],
            "url": url
        }, None

    except Exception as e:
        return None, str(e)

def get_transcript(url: str):
    """Download and clean transcript using yt-dlp"""
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            output_path = os.path.join(tmpdir, 'transcript')

            # Try to get English subtitles (auto-generated or manual)
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

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

            # Find the subtitle file
            vtt_file = None
            for f in os.listdir(tmpdir):
                if f.endswith('.vtt'):
                    vtt_file = os.path.join(tmpdir, f)
                    break

            if not vtt_file:
                return None, "No English subtitles available"

            # Read and clean the VTT file
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
    # Remove VTT header
    content = re.sub(r'WEBVTT.*?Language: \w+\n', '', content, flags=re.DOTALL)

    lines = []
    seen = set()

    for line in content.split('\n'):
        # Skip timestamp lines and empty lines
        if re.match(r'^\d{2}:\d{2}', line) or not line.strip():
            continue

        # Remove HTML-like tags
        clean = re.sub(r'<[^>]+>', '', line)

        # Remove alignment info
        clean = re.sub(r'align:start position:\d+%', '', clean)

        clean = clean.strip()

        # Deduplicate (VTT often has repeated lines)
        if clean and clean not in seen:
            seen.add(clean)
            lines.append(clean)

    return ' '.join(lines)

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
            "error": "Usage: python3 transcript.py 'https://youtube.com/watch?v=...'"
        }))
        sys.exit(1)

    url = sys.argv[1]

    # Validate URL
    if 'youtube.com' not in url and 'youtu.be' not in url:
        print(json.dumps({
            "success": False,
            "error": "Invalid YouTube URL"
        }))
        sys.exit(1)

    # Get video info
    info, info_error = get_video_info(url)
    if info_error:
        print(json.dumps({
            "success": False,
            "error": f"Failed to get video info: {info_error}"
        }))
        sys.exit(1)

    # Get transcript
    transcript, transcript_error = get_transcript(url)

    result = {
        "success": True,
        "video": info,
        "transcript": transcript if transcript else None,
        "transcript_error": transcript_error
    }

    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
