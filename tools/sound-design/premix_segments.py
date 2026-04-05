#!/usr/bin/env python3
"""Premix sounds per segment — reads sounds_segment_*.json, creates segment_X_sfx.mp3.

Reads sound JSON files from workspace/, overlays each SFX at its exact frame position,
outputs one mp3 per segment. These go into public/sfx/ for Root.tsx to use as
<Sequence><Audio> elements (6 total, not 67+).

Usage:
    python3 premix_segments.py <workspace_dir> <videos_dir>
    python3 premix_segments.py workspace/cognitive-effects-of-ai-on-developers videos/cognitive-effects-of-ai-on-developers
"""

import json
import os
import sys
import glob

from pydub import AudioSegment

LIBRARY_DIR = os.path.join(os.path.dirname(__file__), "library")


def premix_segment(sounds_json_path, segment_duration_ms, fps=30):
    """Create a single mp3 with all SFX for one segment overlaid at correct positions."""

    with open(sounds_json_path) as f:
        data = json.load(f)

    sounds = data.get("sounds", [])
    if not sounds:
        return None

    # Create silent base
    base = AudioSegment.silent(duration=segment_duration_ms)

    loaded = 0
    failed = 0

    # Determine frame mode: explicit "frameMode" field or fallback to heuristic
    frame_mode = data.get("frameMode", "")
    frames = [s.get("frame", 0) for s in sounds if s.get("type") != "meme"]
    min_frame = min(frames) if frames else 0
    segment_frames = int(segment_duration_ms / 1000 * fps)

    offset = 0
    if frame_mode == "global":
        # Explicit global — use startFrame from JSON as offset
        offset = data.get("startFrame", min_frame)
        print(f"    Frame mode: global (explicit), offset={offset}")
    elif frame_mode == "local":
        offset = 0
        print(f"    Frame mode: local (explicit)")
    else:
        # Legacy fallback: heuristic detection for old JSONs without frameMode
        if min_frame > segment_frames:
            offset = min_frame
            print(f"    Frame mode: global (heuristic, min={min_frame}), offset={offset}")
        else:
            print(f"    Frame mode: local (heuristic)")

    import math
    for s in sounds:
        frame = s.get("frame", 0)
        sfx_file = s.get("file", "")
        volume = s.get("volume", 0.15)

        if s.get("type") == "meme":
            continue

        full_path = os.path.join(LIBRARY_DIR, sfx_file)
        if not os.path.exists(full_path):
            failed += 1
            continue

        try:
            sfx = AudioSegment.from_file(full_path)

            if volume > 0:
                db = 20 * math.log10(volume)
                sfx = sfx + db

            # Subtract offset if frames are global
            local_frame = frame - offset
            position_ms = int(local_frame / fps * 1000)

            if 0 <= position_ms < segment_duration_ms:
                base = base.overlay(sfx, position=position_ms)
                loaded += 1
        except Exception:
            failed += 1

    print(f"    {os.path.basename(sounds_json_path)}: {loaded} loaded, {failed} failed")

    if loaded == 0:
        return None

    return base


def premix_all(workspace_dir, videos_dir, fps=30):
    """Premix all segment sounds and copy to videos project public/sfx/."""

    # Find all sounds_segment_*.json
    pattern = os.path.join(workspace_dir, "sounds_segment_*.json")
    sound_files = sorted(glob.glob(pattern))

    if not sound_files:
        print("No sounds_segment_*.json files found.")
        return []

    print(f"Found {len(sound_files)} segment sound files.")

    # Read master-plan for segment durations
    master_plan_path = os.path.join(workspace_dir, "master-plan.json")
    segment_durations = {}
    if os.path.exists(master_plan_path):
        with open(master_plan_path) as f:
            mp = json.load(f)
        structure = mp.get("structure", {})
        segments = structure.get("segments", structure.get("stickies", []))
        total_frames = mp.get("meta", {}).get("totalFrames", 10000)

        for i, seg in enumerate(segments):
            start = seg.get("startFrame", 0)
            end = seg.get("endFrame") or (segments[i+1]["startFrame"] if i+1 < len(segments) else total_frames)
            duration_ms = int((end - start) / fps * 1000)
            segment_durations[i+1] = duration_ms

    # Output dir
    sfx_dir = os.path.join(videos_dir, "public", "sfx")
    os.makedirs(sfx_dir, exist_ok=True)

    results = []

    for sf in sound_files:
        # Extract segment number from filename
        basename = os.path.basename(sf)
        seg_num = int(basename.replace("sounds_segment_", "").replace(".json", ""))

        duration_ms = segment_durations.get(seg_num, 120000)  # default 2 min

        print(f"  Premixing segment {seg_num} ({duration_ms/1000:.1f}s)...")
        audio = premix_segment(sf, duration_ms, fps)

        if audio:
            output_path = os.path.join(sfx_dir, f"segment_{seg_num}_sfx.mp3")
            audio.export(output_path, format="mp3", bitrate="192k")
            print(f"    ✅ {output_path}")
            results.append({"segment": seg_num, "path": output_path, "duration_ms": duration_ms})
        else:
            print(f"    ⏭️  No sounds for segment {seg_num}")

    print(f"\nDone: {len(results)} segment SFX files created in {sfx_dir}/")
    return results


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 premix_segments.py <workspace_dir> <videos_dir>")
        sys.exit(1)

    base = os.path.join(os.path.dirname(__file__), "..", "..")
    workspace = os.path.join(base, sys.argv[1])
    videos = os.path.join(base, sys.argv[2])

    premix_all(workspace, videos)
