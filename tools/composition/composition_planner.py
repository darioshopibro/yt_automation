"""Composition Planner — ONE agent plans visuals + sounds + memes TOGETHER.

This is FAZA 2 — after TTS, before generation.
Plans EVERYTHING as ONE COMPOSITION:
- Which visual type for each beat (motion_graphics / ai_video / meme)
- Which sound effect accompanies which visual (whoosh on transition, hit on reveal)
- Where memes go
- Where AI video clips go
- Ducking zones for music

Uses Claude CLI to plan — LLM reads transcript + timestamps and decides
visuals AND sounds together because they are ONE COMPOSITION.

Input: master-plan.json + memes.json (optional)
Output: master-composition.json with EVERYTHING planned together
"""

import json
import os
import sys
import subprocess
import re

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Sound library files
SOUND_FILES = {
    "whoosh_soft": "whooshes/soft-whoosh.mp3",
    "whoosh_medium": "whooshes/medium-whoosh.mp3",
    "whoosh_fast": "whooshes/fast-whoosh.mp3",
    "whoosh_digital": "whooshes/digital-whoosh.mp3",
    "whoosh_airy": "whooshes/airy-whoosh.mp3",
    "whoosh_lofi": "whooshes/lofi-whoosh.mp3",
    "hit_soft": "hits/soft-hit-01.mp3",
    "hit_bass": "hits/bass-hit.mp3",
    "hit_punch": "hits/punch-hit.mp3",
    "hit_epic": "hits/epic-hit.mp3",
    "riser_short": "risers/short-riser-01.mp3",
    "riser_fast": "risers/fast-riser.mp3",
    "riser_tension": "risers/tension-riser.mp3",
    "click_soft": "clicks/soft-click.mp3",
    "click_tick": "clicks/tick-click.mp3",
    "click_button": "clicks/button-click.mp3",
}

SOUND_FILES_LIST = "\n".join(f"  {k}: {v}" for k, v in SOUND_FILES.items())


def _call_claude(prompt, model="claude-sonnet-4-20250514"):
    """Call Claude via CLI."""
    result = subprocess.run(
        ["claude", "-p", prompt, "--model", model, "--output-format", "text"],
        capture_output=True, text=True, timeout=300
    )
    return result.stdout.strip()


def _extract_json(text):
    """Extract JSON from response."""
    json_match = re.search(r'(\{[\s\S]*\})', text)
    if not json_match:
        return None
    try:
        return json.loads(json_match.group())
    except json.JSONDecodeError:
        return None


def _build_ducking_zones(words, fps):
    """Build ducking zones from word timestamps."""
    if not words:
        return []
    zones = []
    zone_start = words[0].get("startFrame", 0)
    zone_end = words[0].get("endFrame", zone_start + 5)

    for i in range(1, len(words)):
        prev_end = words[i-1].get("end", 0)
        curr_start = words[i].get("start", 0)
        if curr_start - prev_end > 0.5:
            zones.append({"startFrame": zone_start, "endFrame": zone_end, "type": "voiceover_active"})
            zone_start = words[i].get("startFrame", 0)
        zone_end = words[i].get("endFrame", words[i].get("startFrame", 0) + 5)

    zones.append({"startFrame": zone_start, "endFrame": zone_end, "type": "voiceover_active"})
    return zones


def compose(project_dir, memes_path=None):
    """Plan ENTIRE composition — visuals + sounds + memes — in ONE agent call.

    This is the corrected version where visuals and sounds are planned TOGETHER
    because they are ONE COMPOSITION.
    """
    # Load master plan
    master_plan_path = os.path.join(project_dir, "master-plan.json")
    if not os.path.exists(master_plan_path):
        raise FileNotFoundError(f"master-plan.json not found in {project_dir}")

    with open(master_plan_path) as f:
        master_plan = json.load(f)

    # Load memes if available
    memes_data = {}
    if memes_path and os.path.exists(memes_path):
        with open(memes_path) as f:
            memes_data = json.load(f)
    else:
        # Try to find memes file in project dir
        for f in os.listdir(project_dir):
            if f.startswith("memes_") and f.endswith(".json"):
                with open(os.path.join(project_dir, f)) as mf:
                    memes_data = mf.read()
                    memes_data = json.loads(memes_data)
                break

    fps = master_plan.get("meta", {}).get("fps", 30)
    total_frames = master_plan.get("meta", {}).get("totalFrames", 0)
    total_duration = total_frames / fps if fps else 0
    title = master_plan.get("meta", {}).get("title", "")
    words = master_plan.get("voiceover", {}).get("words", [])

    # Get segments
    structure = master_plan.get("structure", {})
    segments = structure.get("segments", structure.get("stickies", []))

    # Build segment text for prompt
    segment_text = ""
    for i, seg in enumerate(segments):
        start_frame = seg.get("startFrame", 0)
        end_frame = seg.get("endFrame") or (segments[i+1]["startFrame"] if i+1 < len(segments) else total_frames)

        seg_words = [w for w in words if w.get("startFrame", 0) >= start_frame and w.get("startFrame", 0) < end_frame]
        transcript = " ".join(w.get("word", "") for w in seg_words)

        segment_text += f"\nSEGMENT {i+1}: \"{seg.get('title', '')}\" (frames {start_frame}-{end_frame}, {(end_frame-start_frame)/fps:.1f}s)\n"
        segment_text += f"  Transcript: {transcript[:300]}\n"

    # Build memes text
    memes_text = "No memes available."
    if memes_data:
        available = []
        for m in memes_data.get("topic_specific", [])[:5]:
            available.append(f"  - {m.get('title', '?')} (score: {m.get('score', 0)})")
        for m in memes_data.get("tech_evergreen_suggestions", [])[:10]:
            available.append(f"  - {m['name']}: {m['usage']} (evergreen)")
        if available:
            memes_text = "Available memes:\n" + "\n".join(available)

    # === ONE AGENT CALL — plans visuals + sounds + memes TOGETHER ===
    prompt = f"""You are a video composition planner for a tech YouTube explainer (Fireship style, 2-5 min).

VIDEO: "{title}" ({total_duration:.0f}s, {len(segments)} segments, {fps} fps)

SEGMENTS:
{segment_text}

AVAILABLE SOUND EFFECTS:
{SOUND_FILES_LIST}

{memes_text}

PLAN THE ENTIRE VIDEO COMPOSITION. For each segment, decide:
1. VISUAL TYPE: "motion_graphics" (animated diagram/flowchart/code), "ai_video" (cinematic AI-generated clip), or "meme" (reaction image overlay)
2. SOUND EFFECTS that accompany the visual:
   - whoosh when a new visual element APPEARS or scene TRANSITIONS
   - hit/impact when an important word is REVEALED
   - riser BEFORE a big reveal (30-45 frames before)
   - click for small UI elements appearing
3. MEME placement if the beat is humorous or needs a reaction

CRITICAL RULES:
- Sounds MUST match what happens VISUALLY — a whoosh plays when something MOVES on screen
- First segment should be ai_video (dramatic hook)
- Max 3 ai_video segments per video
- Max 5 memes per video
- SFX density: 8-12 per minute, never 2 sounds within 20 frames
- Every segment transition gets a whoosh
- Big reveals get riser (before) + hit (on reveal)
- Vary sound types — don't use same whoosh 5 times in a row

Return ONLY valid JSON:
{{
  "beats": [
    {{
      "segment_index": 0,
      "segment_title": "...",
      "startFrame": 0,
      "endFrame": 450,
      "visual_type": "ai_video",
      "visual_description": "cinematic shot of programmer at laptop",
      "ai_video_prompt": "Cinematic close-up, dramatic lighting...",
      "sfx": [
        {{"frame": 0, "type": "riser_fast", "volume": 0.20, "reason": "build-up to hook reveal"}},
        {{"frame": 30, "type": "hit_punch", "volume": 0.35, "reason": "hook word appears"}}
      ],
      "meme": null
    }},
    {{
      "segment_index": 0,
      "segment_title": "...",
      "startFrame": 450,
      "endFrame": 900,
      "visual_type": "motion_graphics",
      "visual_description": "flowchart showing Docker container layers building up",
      "sfx": [
        {{"frame": 445, "type": "whoosh_medium", "volume": 0.25, "reason": "scene transition"}},
        {{"frame": 500, "type": "click_soft", "volume": 0.15, "reason": "first layer appears"}}
      ],
      "meme": null
    }},
    {{
      "segment_index": 1,
      "segment_title": "...",
      "startFrame": 900,
      "endFrame": 1200,
      "visual_type": "meme",
      "visual_description": "reaction to surprising stat",
      "meme": {{"name": "Surprised Pikachu", "reason": "audience reaction to shocking number"}},
      "sfx": [
        {{"frame": 895, "type": "whoosh_fast", "volume": 0.25, "reason": "transition to meme"}}
      ]
    }}
  ]
}}

Split each segment into 2-5 beats of 5-15 seconds each. Total beats should be 15-30 for a {total_duration:.0f}s video.
Every beat MUST have at least 1 sfx. Use the exact sound file keys from the list above."""

    print(f"  🎬 Planning composition with Claude (visuals + sounds together)...")
    response = _call_claude(prompt)
    plan = _extract_json(response)

    if not plan or "beats" not in plan:
        # Retry with Haiku for speed
        print(f"  ⚠️ First attempt failed, retrying...")
        response = _call_claude(prompt, "claude-haiku-4-5-20251001")
        plan = _extract_json(response)

    if not plan or "beats" not in plan:
        raise ValueError("Composition planning failed — no valid JSON returned")

    beats = plan["beats"]

    # === BUILD FINAL master-composition.json ===

    # Map SFX keys to actual file paths
    all_sfx = []
    for beat in beats:
        for sfx in beat.get("sfx", []):
            sfx_key = sfx.get("type", "")
            sfx["file"] = SOUND_FILES.get(sfx_key, "whooshes/soft-whoosh.mp3")
            all_sfx.append(sfx)

    # Build transitions
    transitions = []
    for i, beat in enumerate(beats):
        if i > 0 and beat.get("segment_index", -1) != beats[i-1].get("segment_index", -1):
            transitions.append({
                "atFrame": beat["startFrame"],
                "type": "crossfade",
                "durationFrames": 15,
            })

    # Build memes list
    memes_list = []
    for beat in beats:
        if beat.get("meme"):
            memes_list.append({
                "beatIndex": beats.index(beat),
                "startFrame": beat["startFrame"],
                "endFrame": min(beat["startFrame"] + 60, beat["endFrame"]),  # max 2s
                "name": beat["meme"].get("name", ""),
                "reason": beat["meme"].get("reason", ""),
            })

    # Build AI video clips list
    ai_clips = []
    for beat in beats:
        if beat.get("visual_type") == "ai_video":
            ai_clips.append({
                "beatIndex": beats.index(beat),
                "startFrame": beat["startFrame"],
                "endFrame": beat["endFrame"],
                "prompt": beat.get("ai_video_prompt", beat.get("visual_description", "")),
            })

    composition = {
        "meta": {
            "title": title,
            "fps": fps,
            "width": 1920,
            "height": 1080,
            "totalFrames": total_frames,
            "totalDurationSec": round(total_duration, 1),
        },
        "voiceover": {
            "file": master_plan.get("voiceover", {}).get("file", "voiceover.mp3"),
            "durationSec": master_plan.get("voiceover", {}).get("duration", total_duration),
            "wordCount": len(words),
        },
        "beats": [{
            "id": f"beat_{i+1}",
            "segmentIndex": b.get("segment_index", 0),
            "title": b.get("segment_title", ""),
            "startFrame": b.get("startFrame", 0),
            "endFrame": b.get("endFrame", 0),
            "durationSec": round((b.get("endFrame", 0) - b.get("startFrame", 0)) / fps, 1),
            "visualType": b.get("visual_type", "motion_graphics"),
            "visualDescription": b.get("visual_description", ""),
            "aiVideoPrompt": b.get("ai_video_prompt", ""),
            "isSegmentStart": i == 0 or b.get("segment_index", -1) != beats[i-1].get("segment_index", -1),
        } for i, b in enumerate(beats)],
        "audio": {
            "music": {
                "file": None,
                "baseVolume": 0.20,
                "duckedVolume": 0.08,
                "duckRampFrames": 15,
                "fadeInEndFrame": 30,
                "fadeOutStartFrame": max(total_frames - 60, 0),
            },
            "sfx": all_sfx,
            "duckingZones": _build_ducking_zones(words, fps),
        },
        "memes": memes_list,
        "aiVideoClips": ai_clips,
        "transitions": transitions,
    }

    # Stats
    sfx_types = {}
    for s in all_sfx:
        t = s.get("type", "?").split("_")[0]
        sfx_types[t] = sfx_types.get(t, 0) + 1

    visual_types = {}
    for b in beats:
        vt = b.get("visual_type", "?")
        visual_types[vt] = visual_types.get(vt, 0) + 1

    print(f"  ✅ Composition planned:")
    print(f"     Beats: {len(beats)}")
    print(f"     Visuals: {visual_types}")
    print(f"     SFX: {len(all_sfx)} ({sfx_types})")
    print(f"     Memes: {len(memes_list)}")
    print(f"     AI clips: {len(ai_clips)}")
    print(f"     Transitions: {len(transitions)}")

    return composition


def save_composition(composition, output_path):
    """Save master-composition.json."""
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(composition, f, indent=2)
    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 composition_planner.py <project_dir> [memes.json]")
        sys.exit(1)

    project_dir = sys.argv[1]
    memes = sys.argv[2] if len(sys.argv) > 2 else None

    comp = compose(project_dir, memes)

    output = os.path.join(project_dir, "master-composition.json")
    save_composition(comp, output)
    print(f"\n📄 Saved: {output}")
