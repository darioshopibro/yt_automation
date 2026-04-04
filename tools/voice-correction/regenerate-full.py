#!/usr/bin/env python3
"""
Regenerate entire voiceover from updated text using ElevenLabs API.

Usage:
  python3 regenerate-full.py --text "new transcript text" --project videos/blue-green-deploy
  python3 regenerate-full.py --file updated-transcript.txt --project videos/blue-green-deploy
"""

import argparse
import json
import os
import shutil
import sys
import time
from pathlib import Path

import requests

ROOT = Path("/Users/dario61/Desktop/YT automation")

API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998"
VOICE_ID = "iP95p4xoKVk53GoZ742B"
API_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps"
MODEL_ID = "eleven_turbo_v2_5"
FPS = 30


def backup_file(filepath: Path):
    """Create a timestamped backup of a file if it exists."""
    if filepath.exists():
        timestamp = int(time.time())
        backup_path = filepath.with_suffix(f".backup.{timestamp}{filepath.suffix}")
        shutil.copy2(filepath, backup_path)
        print(f"  Backed up: {filepath.name} -> {backup_path.name}")
        return backup_path
    return None


def call_elevenlabs(text: str) -> dict:
    """Call ElevenLabs API and return audio bytes + timestamp data."""
    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": MODEL_ID,
    }

    print(f"  Calling ElevenLabs API ({len(text)} chars)...")
    resp = requests.post(API_URL, headers=headers, json=payload, timeout=120)

    if resp.status_code != 200:
        print(f"  ERROR: ElevenLabs API returned {resp.status_code}")
        print(f"  Response: {resp.text[:500]}")
        sys.exit(1)

    data = resp.json()
    # Decode base64 audio
    import base64
    audio_bytes = base64.b64decode(data["audio_base64"])

    return {
        "audio_bytes": audio_bytes,
        "alignment": data.get("alignment", {}),
    }


def build_timestamps(alignment: dict) -> dict:
    """Convert ElevenLabs alignment data to our voiceover-timestamps.json format."""
    characters = alignment.get("characters", [])
    char_start_times = alignment.get("character_start_times_seconds", [])
    char_end_times = alignment.get("character_end_times_seconds", [])

    if not characters or not char_start_times or not char_end_times:
        print("  WARNING: No alignment data returned from API.")
        return {"words": []}

    # Reconstruct words from character-level data
    words = []
    current_word = ""
    word_start = None
    word_end = None

    for i, char in enumerate(characters):
        if char == " ":
            # End of word
            if current_word:
                words.append({
                    "word": current_word,
                    "start": round(word_start, 3),
                    "end": round(word_end, 3),
                    "startFrame": round(word_start * FPS),
                    "endFrame": round(word_end * FPS),
                })
                current_word = ""
                word_start = None
                word_end = None
        else:
            if word_start is None:
                word_start = char_start_times[i]
            word_end = char_end_times[i]
            current_word += char

    # Don't forget the last word
    if current_word and word_start is not None:
        words.append({
            "word": current_word,
            "start": round(word_start, 3),
            "end": round(word_end, 3),
            "startFrame": round(word_start * FPS),
            "endFrame": round(word_end * FPS),
        })

    return {"words": words}


def main():
    parser = argparse.ArgumentParser(description="Regenerate full voiceover from new text")
    parser.add_argument("--text", type=str, help="New transcript text (inline)")
    parser.add_argument("--file", type=str, help="Path to file with new transcript text")
    parser.add_argument("--project", type=str, required=True, help="Project path relative to root (e.g. videos/blue-green-deploy)")
    args = parser.parse_args()

    # Get text
    if args.text:
        text = args.text
    elif args.file:
        file_path = Path(args.file)
        if not file_path.is_absolute():
            file_path = ROOT / file_path
        if not file_path.exists():
            print(f"ERROR: File not found: {file_path}")
            sys.exit(1)
        text = file_path.read_text().strip()
    else:
        print("ERROR: Provide either --text or --file")
        sys.exit(1)

    if not text:
        print("ERROR: Text is empty")
        sys.exit(1)

    # Resolve project paths
    project_dir = ROOT / args.project
    mp3_path = project_dir / "public" / "voiceover.mp3"
    timestamps_path = project_dir / "src" / "voiceover-timestamps.json"

    if not project_dir.exists():
        print(f"ERROR: Project directory not found: {project_dir}")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"REGENERATE FULL VOICEOVER")
    print(f"{'='*60}")
    print(f"  Project: {args.project}")
    print(f"  Text: \"{text[:80]}{'...' if len(text) > 80 else ''}\"")
    print(f"  Text length: {len(text)} chars")
    print()

    # Backup existing files
    print("Backing up existing files...")
    backup_file(mp3_path)
    backup_file(timestamps_path)
    print()

    # Call ElevenLabs
    print("Generating new voiceover...")
    result = call_elevenlabs(text)
    print(f"  Audio size: {len(result['audio_bytes']):,} bytes")
    print()

    # Save MP3
    print("Saving files...")
    mp3_path.parent.mkdir(parents=True, exist_ok=True)
    mp3_path.write_bytes(result["audio_bytes"])
    print(f"  Saved: {mp3_path}")

    # Build and save timestamps
    timestamps = build_timestamps(result["alignment"])
    timestamps_path.parent.mkdir(parents=True, exist_ok=True)
    timestamps_path.write_text(json.dumps(timestamps, indent=2))
    print(f"  Saved: {timestamps_path}")
    print(f"  Words: {len(timestamps['words'])}")

    if timestamps["words"]:
        last_word = timestamps["words"][-1]
        duration = last_word["end"]
        total_frames = last_word["endFrame"]
        print(f"  Duration: {duration:.2f}s ({total_frames} frames @ {FPS}fps)")

    print(f"\n{'='*60}")
    print("DONE - Full voiceover regenerated successfully")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
