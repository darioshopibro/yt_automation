#!/usr/bin/env python3
"""
Regenerate a specific segment of the voiceover, splicing new audio in place.

Usage:
  python3 regenerate-segment.py --project videos/blue-green-deploy --start 5.2 --end 8.1 --new-text "you are deploying manually and without tests"
"""

import argparse
import base64
import io
import json
import os
import shutil
import sys
import time
from pathlib import Path

import requests
from pydub import AudioSegment

ROOT = Path("/Users/dario61/Desktop/YT automation")

API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
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
    """Call ElevenLabs API and return audio bytes + alignment data."""
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
    audio_bytes = base64.b64decode(data["audio_base64"])

    return {
        "audio_bytes": audio_bytes,
        "alignment": data.get("alignment", {}),
    }


def parse_alignment_to_words(alignment: dict, time_offset: float = 0.0) -> list:
    """Convert ElevenLabs alignment to word list, offset by time_offset."""
    characters = alignment.get("characters", [])
    char_start_times = alignment.get("character_start_times_seconds", [])
    char_end_times = alignment.get("character_end_times_seconds", [])

    if not characters:
        return []

    words = []
    current_word = ""
    word_start = None
    word_end = None

    for i, char in enumerate(characters):
        if char == " ":
            if current_word:
                start = round(word_start + time_offset, 3)
                end = round(word_end + time_offset, 3)
                words.append({
                    "word": current_word,
                    "start": start,
                    "end": end,
                    "startFrame": round(start * FPS),
                    "endFrame": round(end * FPS),
                })
                current_word = ""
                word_start = None
                word_end = None
        else:
            if word_start is None:
                word_start = char_start_times[i]
            word_end = char_end_times[i]
            current_word += char

    if current_word and word_start is not None:
        start = round(word_start + time_offset, 3)
        end = round(word_end + time_offset, 3)
        words.append({
            "word": current_word,
            "start": start,
            "end": end,
            "startFrame": round(start * FPS),
            "endFrame": round(end * FPS),
        })

    return words


def main():
    parser = argparse.ArgumentParser(description="Regenerate a segment of the voiceover")
    parser.add_argument("--project", type=str, required=True, help="Project path relative to root")
    parser.add_argument("--start", type=float, required=True, help="Start time in seconds of segment to replace")
    parser.add_argument("--end", type=float, required=True, help="End time in seconds of segment to replace")
    parser.add_argument("--new-text", type=str, required=True, help="New text for the segment")
    args = parser.parse_args()

    if args.start >= args.end:
        print("ERROR: --start must be less than --end")
        sys.exit(1)

    if not args.new_text.strip():
        print("ERROR: --new-text cannot be empty")
        sys.exit(1)

    # Resolve paths
    project_dir = ROOT / args.project
    mp3_path = project_dir / "public" / "voiceover.mp3"
    timestamps_path = project_dir / "src" / "voiceover-timestamps.json"

    if not mp3_path.exists():
        print(f"ERROR: MP3 not found: {mp3_path}")
        sys.exit(1)
    if not timestamps_path.exists():
        print(f"ERROR: Timestamps not found: {timestamps_path}")
        sys.exit(1)

    # Load existing data
    original_audio = AudioSegment.from_mp3(str(mp3_path))
    original_timestamps = json.loads(timestamps_path.read_text())
    original_words = original_timestamps["words"]
    original_duration_ms = len(original_audio)

    old_segment_duration = args.end - args.start

    print(f"\n{'='*60}")
    print(f"REGENERATE SEGMENT")
    print(f"{'='*60}")
    print(f"  Project: {args.project}")
    print(f"  Segment: {args.start}s - {args.end}s ({old_segment_duration:.3f}s)")
    print(f"  New text: \"{args.new_text}\"")
    print(f"  Original audio: {original_duration_ms/1000:.2f}s")
    print(f"  Original words: {len(original_words)}")
    print()

    # Backup existing files
    print("Backing up existing files...")
    backup_file(mp3_path)
    backup_file(timestamps_path)
    print()

    # Generate new audio for the segment
    print("Generating new segment audio...")
    result = call_elevenlabs(args.new_text)
    new_segment_audio = AudioSegment.from_mp3(io.BytesIO(result["audio_bytes"]))
    new_segment_duration_ms = len(new_segment_audio)
    new_segment_duration = new_segment_duration_ms / 1000.0
    print(f"  New segment duration: {new_segment_duration:.3f}s")
    print()

    # Calculate duration difference
    duration_diff = new_segment_duration - old_segment_duration
    print(f"  Duration difference: {duration_diff:+.3f}s")
    print()

    # Splice audio: before + new segment + after
    print("Splicing audio...")
    start_ms = int(args.start * 1000)
    end_ms = int(args.end * 1000)

    before_audio = original_audio[:start_ms]
    after_audio = original_audio[end_ms:]

    combined = before_audio + new_segment_audio + after_audio
    print(f"  Before: {len(before_audio)/1000:.3f}s")
    print(f"  New segment: {new_segment_duration:.3f}s")
    print(f"  After: {len(after_audio)/1000:.3f}s")
    print(f"  Total: {len(combined)/1000:.3f}s")
    print()

    # Build new timestamps
    print("Recalculating timestamps...")

    # Words before the cut point: unchanged
    words_before = [w for w in original_words if w["end"] <= args.start]

    # Words in the replaced segment: from new ElevenLabs data, offset by start time
    words_new = parse_alignment_to_words(result["alignment"], time_offset=args.start)

    # Words after the cut point: shift by duration difference
    words_after_raw = [w for w in original_words if w["start"] >= args.end]
    words_after = []
    for w in words_after_raw:
        new_start = round(w["start"] + duration_diff, 3)
        new_end = round(w["end"] + duration_diff, 3)
        words_after.append({
            "word": w["word"],
            "start": new_start,
            "end": new_end,
            "startFrame": round(new_start * FPS),
            "endFrame": round(new_end * FPS),
        })

    # Words that partially overlap the cut boundaries are dropped
    overlapping = [w for w in original_words
                   if not (w["end"] <= args.start or w["start"] >= args.end)
                   and w not in words_before]
    if overlapping:
        print(f"  Dropped {len(overlapping)} overlapping word(s): {[w['word'] for w in overlapping]}")

    all_words = words_before + words_new + words_after
    print(f"  Words before: {len(words_before)}")
    print(f"  Words new: {len(words_new)}")
    print(f"  Words after: {len(words_after)}")
    print(f"  Total words: {len(all_words)}")
    print()

    # Save files
    print("Saving files...")
    combined.export(str(mp3_path), format="mp3")
    print(f"  Saved: {mp3_path}")

    new_timestamps = {"words": all_words}
    timestamps_path.write_text(json.dumps(new_timestamps, indent=2))
    print(f"  Saved: {timestamps_path}")

    print(f"\n{'='*60}")
    print("DONE - Segment regenerated successfully")
    print(f"  Old duration: {original_duration_ms/1000:.2f}s -> New duration: {len(combined)/1000:.2f}s")
    print(f"  Shift: {duration_diff:+.3f}s applied to {len(words_after)} words after cut point")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
