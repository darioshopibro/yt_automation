#!/usr/bin/env python3
"""
Shift all timestamps after a given frame by a delta.

Usage:
  python3 update-timing.py --project videos/blue-green-deploy --after-frame 500 --shift 30
  python3 update-timing.py --project videos/blue-green-deploy --after-frame 500 --shift -15
"""

import argparse
import json
import shutil
import sys
import time
from pathlib import Path

ROOT = Path("/Users/dario61/Desktop/YT automation")
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


def main():
    parser = argparse.ArgumentParser(description="Shift timestamps after a given frame")
    parser.add_argument("--project", type=str, required=True, help="Project path relative to root")
    parser.add_argument("--after-frame", type=int, required=True, help="Frame number after which to apply shift")
    parser.add_argument("--shift", type=int, required=True, help="Number of frames to shift (positive = later, negative = earlier)")
    args = parser.parse_args()

    if args.shift == 0:
        print("Nothing to do: --shift is 0")
        sys.exit(0)

    # Resolve paths
    project_dir = ROOT / args.project
    timestamps_path = project_dir / "src" / "voiceover-timestamps.json"
    config_path = project_dir / "src" / "dynamic-config.json"

    if not timestamps_path.exists():
        print(f"ERROR: Timestamps not found: {timestamps_path}")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"UPDATE TIMING")
    print(f"{'='*60}")
    print(f"  Project: {args.project}")
    print(f"  After frame: {args.after_frame}")
    print(f"  Shift: {args.shift:+d} frames ({args.shift/FPS:+.3f}s)")
    print()

    # Backup files
    print("Backing up files...")
    backup_file(timestamps_path)
    if config_path.exists():
        backup_file(config_path)
    print()

    # --- Update voiceover-timestamps.json ---
    print("Updating voiceover-timestamps.json...")
    timestamps = json.loads(timestamps_path.read_text())
    words = timestamps["words"]

    shift_seconds = args.shift / FPS
    words_shifted = 0
    words_unchanged = 0

    for word in words:
        if word["startFrame"] > args.after_frame:
            word["start"] = round(word["start"] + shift_seconds, 3)
            word["end"] = round(word["end"] + shift_seconds, 3)
            word["startFrame"] = word["startFrame"] + args.shift
            word["endFrame"] = word["endFrame"] + args.shift

            # Guard against negative values
            if word["start"] < 0:
                word["start"] = 0.0
            if word["startFrame"] < 0:
                word["startFrame"] = 0

            words_shifted += 1
        else:
            words_unchanged += 1

    timestamps_path.write_text(json.dumps(timestamps, indent=2))
    print(f"  Words shifted: {words_shifted}")
    print(f"  Words unchanged: {words_unchanged}")
    print()

    # --- Update dynamic-config.json ---
    if config_path.exists():
        print("Updating dynamic-config.json...")
        config = json.loads(config_path.read_text())

        sections_shifted = 0
        sections_unchanged = 0

        stickies = config.get("stickies", [])
        for sticky in stickies:
            sections = sticky.get("sections", [])
            for section in sections:
                start_frame = section.get("startFrame")
                if start_frame is not None and start_frame > args.after_frame:
                    section["startFrame"] = start_frame + args.shift
                    if section["startFrame"] < 0:
                        section["startFrame"] = 0
                    sections_shifted += 1
                else:
                    sections_unchanged += 1

        config_path.write_text(json.dumps(config, indent=2))
        print(f"  Sections shifted: {sections_shifted}")
        print(f"  Sections unchanged: {sections_unchanged}")
    else:
        print("  No dynamic-config.json found, skipping.")

    print()

    # Summary
    if words_shifted > 0 and words:
        first_shifted = next((w for w in words if w["startFrame"] > args.after_frame - args.shift), None)
        last_word = words[-1]
        print(f"  First shifted word: \"{first_shifted['word']}\" @ frame {first_shifted['startFrame']}" if first_shifted else "")
        print(f"  Last word: \"{last_word['word']}\" @ frame {last_word['endFrame']}")

    print(f"\n{'='*60}")
    print("DONE - Timing updated successfully")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
