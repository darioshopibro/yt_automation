"""SFX Placer — reads master-plan.json timestamps and places sound effects on frames.

Uses existing sound library (tools/sound-design/library/) with 30 sounds in 4 categories.
Falls back to ElevenLabs SFX API if a specific sound is missing.

Rules from research + SOUNDS.md:
- 8-12 SFX per minute for fast_explainer
- Whoosh on segment transitions (-8 frames before)
- Riser before big reveals (-45 frames before)
- Hit/impact on segment first word (frame-perfect)
- Click on keyword emphasis (frame-perfect)
- Min 20 frame gap between sounds
- Volume hierarchy: hit 0.35, whoosh 0.25, riser 0.20, click 0.15

Input: master-plan.json (existing pipeline output)
Output: sfx_timeline.json
"""

import json
import os
import sys
import random

# === SOUND LIBRARY (existing files) ===

LIBRARY_DIR = os.path.join(os.path.dirname(__file__), "library")

SOUND_FILES = {
    "whoosh": {
        "soft": "whooshes/soft-whoosh.mp3",
        "medium": "whooshes/medium-whoosh.mp3",
        "fast": "whooshes/fast-whoosh.mp3",
        "airy": "whooshes/airy-whoosh.mp3",
        "digital": "whooshes/digital-whoosh.mp3",
        "lofi": "whooshes/lofi-whoosh.mp3",
        "thin": "whooshes/thin-whoosh.mp3",
        "wide": "whooshes/wide-whoosh.mp3",
        "reverse": "whooshes/reverse-whoosh.mp3",
        "low": "whooshes/low-whoosh.mp3",
        "metallic": "whooshes/metallic-whoosh.mp3",
        "complex": "whooshes/complex-whoosh.mp3",
        "phase": "whooshes/phase-whoosh.mp3",
        "slow": "whooshes/slow-whoosh-01.mp3",
    },
    "hit": {
        "soft": "hits/soft-hit-01.mp3",
        "bass": "hits/bass-hit.mp3",
        "punch": "hits/punch-hit.mp3",
        "epic": "hits/epic-hit.mp3",
    },
    "riser": {
        "short_1": "risers/short-riser-01.mp3",
        "short_2": "risers/short-riser-02.mp3",
        "short_3": "risers/short-riser-03.mp3",
        "fast": "risers/fast-riser.mp3",
        "tension": "risers/tension-riser.mp3",
        "cinematic": "risers/cinematic-riser.mp3",
        "dramatic": "risers/dramatic-riser.mp3",
        "reverb": "risers/reverb-riser.mp3",
        "trailer": "risers/trailer-riser.mp3",
    },
    "click": {
        "soft": "clicks/soft-click.mp3",
        "button": "clicks/button-click.mp3",
        "tick": "clicks/tick-click.mp3",
    },
}

# Volume levels from SOUNDS.md
VOLUME = {
    "hit": 0.35,
    "whoosh": 0.25,
    "riser": 0.20,
    "click": 0.15,
}

# Words that trigger emphasis sounds
IMPACT_WORDS = {
    "million", "billion", "percent", "vulnerability", "exploit", "breach", "attack",
    "crashed", "failed", "broken", "dead", "killed", "destroyed", "hacked",
    "secret", "hidden", "actually", "reality", "truth", "problem", "solution",
    "never", "always", "worst", "best", "impossible", "insane", "critical",
    "dopamine", "addicted", "hijacked", "rewiring", "degraded", "atrophies",
}

MIN_GAP_FRAMES = 20


def _pick_sound(category, intensity="medium"):
    """Pick a sound file from the library with some variety."""
    sounds = SOUND_FILES.get(category, {})
    if not sounds:
        return None

    # Try to match intensity, fall back to random
    if intensity in sounds:
        return sounds[intensity]

    # Map intensity to available sounds
    intensity_map = {
        "soft": ["soft", "thin", "lofi", "airy"],
        "medium": ["medium", "digital", "fast", "button"],
        "heavy": ["epic", "punch", "bass", "dramatic", "wide", "complex"],
    }

    candidates = intensity_map.get(intensity, [])
    for c in candidates:
        if c in sounds:
            return sounds[c]

    # Random fallback
    return random.choice(list(sounds.values()))


def _get_segments(plan):
    """Extract segments from master plan."""
    structure = plan.get("structure", {})
    if "segments" in structure:
        return structure["segments"]
    segments = []
    for sticky in structure.get("stickies", []):
        seg = {
            "id": sticky.get("id", ""),
            "title": sticky.get("title", ""),
            "startFrame": sticky.get("startFrame", 0),
            "endFrame": sticky.get("endFrame"),
            "sections": sticky.get("sections", []),
        }
        segments.append(seg)
    return segments


def place_sfx(plan, format_preset="fast_explainer"):
    """Place SFX on timeline based on master-plan timestamps.

    Returns list of sfx placement dicts ready for composition.
    """
    segments = _get_segments(plan)
    words = plan.get("voiceover", {}).get("words", [])
    fps = plan.get("meta", {}).get("fps", 30)
    total_frames = plan.get("meta", {}).get("totalFrames", 0)
    total_duration = total_frames / fps if fps else 0

    presets = {
        "fast_explainer": {"target_sfx_per_min": 10, "riser_on_segments": True},
        "deep_dive": {"target_sfx_per_min": 7, "riser_on_segments": True},
        "tutorial": {"target_sfx_per_min": 4, "riser_on_segments": False},
    }
    preset = presets.get(format_preset, presets["fast_explainer"])

    sfx = []
    used_whoosh_variants = []  # track variety

    # === PASS 1: Segment transitions — riser + whoosh + hit combo ===
    for i, seg in enumerate(segments):
        if i == 0:
            continue

        start = seg.get("startFrame", 0)

        # Riser before transition (45 frames = 1.5s build-up)
        if preset["riser_on_segments"]:
            riser_file = _pick_sound("riser", "short_1" if i % 3 == 0 else ("fast" if i % 3 == 1 else "short_2"))
            sfx.append({
                "frame": max(start - 45, 0),
                "type": "riser",
                "file": riser_file,
                "volume": VOLUME["riser"],
                "reason": f"build-up before '{seg.get('title', '')}'",
            })

        # Whoosh on transition (-8 frames per SOUNDS.md)
        variant = random.choice(["medium", "digital", "airy", "fast", "lofi", "wide"])
        while variant in used_whoosh_variants[-2:] and len(used_whoosh_variants) > 2:
            variant = random.choice(["medium", "digital", "airy", "fast", "lofi", "wide"])
        used_whoosh_variants.append(variant)

        sfx.append({
            "frame": max(start - 8, 0),
            "type": "whoosh",
            "file": _pick_sound("whoosh", variant),
            "volume": VOLUME["whoosh"],
            "reason": f"transition → '{seg.get('title', '')}'",
        })

        # Hit on first word of segment (frame-perfect)
        seg_end = seg.get("endFrame") or (segments[i+1]["startFrame"] if i+1 < len(segments) else total_frames)
        first_word = next((w for w in words if w.get("startFrame", 0) >= start and w.get("startFrame", 0) < seg_end), None)
        if first_word:
            sfx.append({
                "frame": first_word.get("startFrame", start),
                "type": "hit",
                "file": _pick_sound("hit", "soft" if i % 2 == 0 else "punch"),
                "volume": VOLUME["hit"],
                "reason": f"reveal: '{first_word.get('word', '')}' in '{seg.get('title', '')}'",
            })

    # === PASS 2: Sub-section reveals — soft whoosh ===
    for seg in segments:
        for section in seg.get("sections", []):
            sf = section.get("startFrame", 0)
            if sf > 0:
                sfx.append({
                    "frame": max(sf - 5, 0),
                    "type": "whoosh",
                    "file": _pick_sound("whoosh", "soft"),
                    "volume": VOLUME["whoosh"] * 0.7,
                    "reason": f"section: '{section.get('title', '')}'",
                })

    # === PASS 3: Keyword emphasis — clicks ===
    for w in words:
        word_clean = w.get("word", "").lower().strip(".,!?;:'\"()-")
        if word_clean in IMPACT_WORDS:
            sfx.append({
                "frame": w.get("startFrame", 0),
                "type": "click",
                "file": _pick_sound("click", random.choice(["soft", "tick", "button"])),
                "volume": VOLUME["click"],
                "reason": f"keyword: '{w.get('word', '')}'",
            })

    # === PASS 4: Fill gaps with sentence boundary whooshes ===
    sentence_boundaries = []
    for i in range(1, len(words)):
        prev_end = words[i-1].get("end", words[i-1].get("start", 0))
        curr_start = words[i].get("start", 0)
        if curr_start - prev_end > 0.4:
            sentence_boundaries.append(words[i].get("startFrame", int(curr_start * fps)))

    # Check if we need more sounds
    target_total = int(total_duration / 60 * preset["target_sfx_per_min"])
    if len(sfx) < target_total and sentence_boundaries:
        existing_frames = {s["frame"] for s in sfx}
        available = [f for f in sentence_boundaries if all(abs(f - ef) >= MIN_GAP_FRAMES for ef in existing_frames)]
        need = target_total - len(sfx)
        step = max(1, len(available) // (need + 1))
        added = 0
        for idx in range(0, len(available), step):
            if added >= need:
                break
            variant = random.choice(["thin", "soft", "lofi", "airy"])
            sfx.append({
                "frame": available[idx],
                "type": "whoosh",
                "file": _pick_sound("whoosh", variant),
                "volume": VOLUME["whoosh"] * 0.6,
                "reason": "sentence boundary (density fill)",
            })
            added += 1

    # === PASS 5: Remove overlaps (enforce MIN_GAP) ===
    sfx.sort(key=lambda x: x["frame"])
    filtered = []
    last_frame = -MIN_GAP_FRAMES * 2

    # Priority: riser > hit > whoosh > click
    priority = {"riser": 4, "hit": 3, "whoosh": 2, "click": 1}

    for s in sfx:
        if s["frame"] - last_frame >= MIN_GAP_FRAMES:
            filtered.append(s)
            last_frame = s["frame"]
        elif priority.get(s["type"], 0) > priority.get(filtered[-1]["type"], 0) if filtered else True:
            filtered[-1] = s
            last_frame = s["frame"]

    # === PASS 6: Cap density ===
    if len(filtered) > target_total * 1.5:
        # Remove lowest priority first
        by_priority = sorted(filtered, key=lambda x: priority.get(x["type"], 0))
        keep = set()
        for s in reversed(by_priority):
            keep.add(id(s))
            if len(keep) <= target_total:
                break
        filtered = [s for s in filtered if id(s) in keep or priority.get(s["type"], 0) >= 3]
        filtered.sort(key=lambda x: x["frame"])

    return filtered


def save_sfx_timeline(sfx_list, output_path):
    """Save SFX timeline to JSON."""
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)

    types_count = {}
    files_used = set()
    for s in sfx_list:
        types_count[s["type"]] = types_count.get(s["type"], 0) + 1
        files_used.add(s.get("file", ""))

    output = {
        "total_sfx": len(sfx_list),
        "sfx_types": types_count,
        "unique_files_used": len(files_used),
        "library_dir": LIBRARY_DIR,
        "timeline": sfx_list,
    }

    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)
    return output_path


def print_report(sfx_list, total_duration):
    """Print human-readable SFX placement report."""
    print(f"\n{'='*70}")
    print(f"SFX PLACEMENT REPORT")
    print(f"{'='*70}")
    print(f"Total SFX: {len(sfx_list)}")
    print(f"Duration: {total_duration:.1f}s ({total_duration/60:.1f} min)")
    print(f"Density: {len(sfx_list) / (total_duration/60):.1f} SFX/min")

    types = {}
    files = set()
    for s in sfx_list:
        types[s["type"]] = types.get(s["type"], 0) + 1
        files.add(s.get("file", ""))

    print(f"\nBy type:")
    for t, c in sorted(types.items(), key=lambda x: -x[1]):
        print(f"  {t:8s}: {c}")

    print(f"\nUnique sound files: {len(files)}")

    print(f"\nTimeline:")
    for s in sfx_list:
        frame = s["frame"]
        sec = frame / 30
        file_short = os.path.basename(s.get("file", "?"))
        print(f"  [{frame:5d}f {sec:6.1f}s] {s['type']:8s} {file_short:25s} vol={s['volume']:.2f} — {s['reason']}")
    print(f"{'='*70}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 sfx_placer.py <master-plan.json> [format_preset]")
        sys.exit(1)

    plan_path = sys.argv[1]
    preset = sys.argv[2] if len(sys.argv) > 2 else "fast_explainer"

    plan = load_master_plan(plan_path) if 'load_master_plan' in dir() else json.load(open(plan_path))
    sfx_list = place_sfx(plan, format_preset=preset)

    total_frames = plan.get("meta", {}).get("totalFrames", 0)
    total_duration = total_frames / plan.get("meta", {}).get("fps", 30)

    print_report(sfx_list, total_duration)

    output = plan_path.replace("master-plan.json", "sfx-timeline.json")
    save_sfx_timeline(sfx_list, output)
    print(f"\n📄 Saved: {output}")
