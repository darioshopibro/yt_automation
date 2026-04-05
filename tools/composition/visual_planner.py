"""Visual Planner — decides what visual type goes on each beat/segment.

For each segment in the video, decides:
- motion_graphics (default — Remotion Generated_*.tsx)
- ai_video (Higgsfield/Kling — cinematic clip from AI image, for hooks + key reveals)
- meme (static image overlay — reaction/evergreen meme)
- text_callout (big text emphasis on screen)
- b_roll (AI-generated concept image with Ken Burns)
- sfx_only (no visual change, just sound effect)

Uses decision tree from research (meme-visual-humor-rules.md).
Reads: master-plan.json + outline beats + memes.json
Output: visual-plan.json

This does NOT modify anything — it PLANS what the composition planner will assemble.
"""

import json
import os
import sys
import re

# Format presets from research
FORMAT_PRESETS = {
    "fast_explainer": {
        "max_seconds_without_visual_change": 5,
        "meme_density_per_minute": 1.5,
        "min_gap_between_memes_seconds": 20,
        "preferred_visual_types": ["motion_graphics", "text_callout", "ai_video", "meme"],
        "ai_video_budget": 3,   # max AI video clips per video
        "meme_budget": 5,       # max memes per video
    },
    "deep_dive": {
        "max_seconds_without_visual_change": 8,
        "meme_density_per_minute": 0.8,
        "min_gap_between_memes_seconds": 45,
        "preferred_visual_types": ["motion_graphics", "b_roll", "text_callout", "meme"],
        "ai_video_budget": 5,
        "meme_budget": 7,
    },
    "tutorial": {
        "max_seconds_without_visual_change": 15,
        "meme_density_per_minute": 0.2,
        "min_gap_between_memes_seconds": 180,
        "preferred_visual_types": ["motion_graphics", "text_callout"],
        "ai_video_budget": 1,
        "meme_budget": 2,
    },
}

# Text signals that trigger specific visual types (from research decision tree)
HUMOR_TRIGGERS = {
    "exaggeration": ["literally", "absolutely", "the worst", "the best ever", "insane", "mind-blowing", "million", "billion"],
    "sarcasm": ["of course", "obviously", "what could go wrong", "genius idea", "brilliant"],
    "contrast": ["but wait", "plot twist", "except", "turns out", "however", "actually"],
    "self_deprecation": ["like an idiot", "rookie mistake", "don't do what I did"],
    "surprise": ["secretly", "hidden", "nobody knows", "shocking", "unbelievable"],
}

HOOK_INDICATORS = ["imagine", "picture this", "what if", "here's the thing", "let me tell you"]


def _classify_segment(text, position, total_segments):
    """Classify a segment's intent based on text content and position.

    Returns: "hook", "setup", "explanation", "reveal", "comparison", "joke", "transition", "cta"
    """
    text_lower = text.lower()

    # Position-based
    if position == 0:
        return "hook"
    if position == total_segments - 1:
        return "cta"

    # Content-based
    if any(w in text_lower for w in ["vs", "versus", "compared to", "unlike", "better than", "worse than"]):
        return "comparison"

    if any(w in text_lower for w in HUMOR_TRIGGERS["contrast"]):
        return "reveal"

    if any(w in text_lower for w in HUMOR_TRIGGERS["exaggeration"] + HUMOR_TRIGGERS["sarcasm"]):
        return "joke"

    if any(w in text_lower for w in ["how", "works", "process", "steps", "basically", "means"]):
        return "explanation"

    return "setup"


def _pick_visual_type(segment_intent, position, total_segments, budget, preset):
    """Pick the best visual type for a segment based on intent and budget.

    Returns: visual type string + reason
    """
    # Hook always gets ai_video if budget allows
    if segment_intent == "hook" and budget["ai_video"] > 0:
        return "ai_video", "dramatic hook visual"

    # Reveal/surprise → ai_video or meme
    if segment_intent == "reveal":
        if budget["ai_video"] > 0 and position < total_segments // 2:
            return "ai_video", "key reveal visualization"
        if budget["meme"] > 0:
            return "meme", "reaction to reveal"
        return "text_callout", "emphasize reveal"

    # Joke → meme or sfx_only
    if segment_intent == "joke":
        if budget["meme"] > 0:
            return "meme", "punctuate humor"
        return "sfx_only", "sound effect on joke"

    # Comparison → text_callout or b_roll
    if segment_intent == "comparison":
        return "text_callout", "comparison visualization"

    # CTA → motion_graphics (keep it clean)
    if segment_intent == "cta":
        return "motion_graphics", "clean closing"

    # Default: motion_graphics
    return "motion_graphics", "standard segment"


def _suggest_meme(segment_intent, segment_text, memes_data, used_memes=None):
    """Suggest a specific meme for a segment based on intent.

    Never returns a meme that's already in used_memes set.
    Returns meme suggestion dict or None.
    """
    used_memes = used_memes or set()
    evergreens = memes_data.get("tech_evergreen_suggestions", [])
    topic_memes = memes_data.get("topic_specific", [])
    trending = memes_data.get("trending_programmer", [])

    # Map intent → best evergreen format
    intent_to_meme = {
        "comparison": ["Drake Hotline Bling", "Two Buttons", "Distracted Boyfriend"],
        "reveal": ["Surprised Pikachu", "Always Has Been", "Anakin Padme"],
        "joke": ["This Is Fine", "Panik Kalm Panik", "Stonks", "Galaxy Brain"],
        "hook": ["Trade Offer", "Change My Mind"],
        "setup": ["Expanding Brain", "Monkey Puppet", "Is This a Pigeon"],
    }

    candidates = intent_to_meme.get(segment_intent, ["This Is Fine", "Surprised Pikachu"])

    # Try topic-specific (rotate through them)
    for tm in topic_memes:
        key = tm.get("title", "")
        if key and key not in used_memes:
            return {
                "source": "topic_specific",
                "title": key,
                "url": tm.get("url", ""),
                "type": "static_image",
            }

    # Try trending programmer memes
    for tm in trending:
        key = tm.get("title", "")
        if key and key not in used_memes:
            return {
                "source": "trending",
                "title": key,
                "url": tm.get("url", ""),
                "type": "static_image",
            }

    # Fall back to evergreen — match by intent, skip used
    for name in candidates:
        if name not in used_memes:
            for eg in evergreens:
                if eg["name"] == name:
                    return {
                        "source": "evergreen",
                        "name": name,
                        "usage": eg["usage"],
                        "emotion": eg["emotion"],
                        "type": "static_template",
                        "note": "Use AI to generate similar concept — copyright safe",
                    }

    # Last resort — any unused evergreen
    for eg in evergreens:
        if eg["name"] not in used_memes:
            return {
                "source": "evergreen",
                "name": eg["name"],
                "usage": eg["usage"],
                "emotion": eg["emotion"],
                "type": "static_template",
                "note": "Use AI to generate similar concept — copyright safe",
            }

    return None


def _suggest_ai_video_prompt(segment_text, segment_intent):
    """Generate an image prompt for AI video generation (Higgsfield/Kling).

    The pipeline is: prompt → AI image → image-to-video (3-5s clip).
    """
    text_lower = segment_text.lower()[:200]

    if segment_intent == "hook":
        return f"Cinematic close-up, dramatic lighting: {text_lower[:80]}, photorealistic, moody atmosphere"

    if segment_intent == "reveal":
        return f"Dramatic reveal moment: {text_lower[:80]}, cinematic lighting, shallow depth of field"

    return f"Abstract visualization: {text_lower[:80]}, modern tech aesthetic, dark background"


def _split_segment_into_beats(seg, words, fps, total_frames, next_seg_start):
    """Split a large segment into smaller beats based on sentence boundaries.

    A segment of 50s should become 3-5 beats of 10-15s each.
    Each beat gets its own visual decision.
    """
    start_frame = seg.get("startFrame", 0)
    end_frame = seg.get("endFrame") or next_seg_start or total_frames

    # Get words in this segment
    seg_words = [w for w in words if w.get("startFrame", 0) >= start_frame and w.get("startFrame", 0) < end_frame]
    if not seg_words:
        return [{
            "startFrame": start_frame,
            "endFrame": end_frame,
            "text": seg.get("title", ""),
            "parent_title": seg.get("title", ""),
        }]

    # Find sentence boundaries (gaps > 0.4s)
    boundaries = [start_frame]
    for i in range(1, len(seg_words)):
        prev_end = seg_words[i-1].get("end", seg_words[i-1].get("start", 0))
        curr_start = seg_words[i].get("start", 0)
        if curr_start - prev_end > 0.4:
            boundaries.append(seg_words[i].get("startFrame", int(curr_start * fps)))
    boundaries.append(end_frame)

    # Group sentences into beats of ~10-20s
    beats = []
    beat_start = boundaries[0]
    beat_words = []

    for j in range(len(seg_words)):
        wf = seg_words[j].get("startFrame", 0)
        beat_words.append(seg_words[j])

        # Check if we're at a boundary AND beat is long enough
        at_boundary = wf in boundaries[1:]
        beat_duration_s = (wf - beat_start) / fps if fps else 0

        if (at_boundary and beat_duration_s >= 8) or j == len(seg_words) - 1:
            beat_end = seg_words[j].get("endFrame", seg_words[j].get("startFrame", 0) + 10)
            # Look ahead for actual boundary
            for b in boundaries:
                if b > beat_start and b <= beat_end + 30:
                    beat_end = b
                    break

            beats.append({
                "startFrame": beat_start,
                "endFrame": min(beat_end, end_frame),
                "text": " ".join(w.get("word", "") for w in beat_words),
                "parent_title": seg.get("title", ""),
            })
            beat_start = beat_end
            beat_words = []

    # If no beats created, return whole segment as 1 beat
    if not beats:
        beats.append({
            "startFrame": start_frame,
            "endFrame": end_frame,
            "text": " ".join(w.get("word", "") for w in seg_words),
            "parent_title": seg.get("title", ""),
        })

    return beats


def plan_visuals(master_plan, memes_data=None, format_preset="fast_explainer"):
    """Create a visual plan at BEAT level (sub-segment), not just segment level.

    Large segments (30s+) are split into beats of 10-15s.
    Each beat gets its own visual type decision.

    Args:
        master_plan: parsed master-plan.json
        memes_data: parsed memes.json from meme-researcher (optional)
        format_preset: "fast_explainer" | "deep_dive" | "tutorial"

    Returns:
        visual plan dict with per-beat decisions
    """
    preset = FORMAT_PRESETS.get(format_preset, FORMAT_PRESETS["fast_explainer"])
    memes_data = memes_data or {}

    structure = master_plan.get("structure", {})
    segments = structure.get("segments", structure.get("stickies", []))
    fps = master_plan.get("meta", {}).get("fps", 30)
    total_frames = master_plan.get("meta", {}).get("totalFrames", 0)
    total_duration = total_frames / fps if fps else 0
    words = master_plan.get("voiceover", {}).get("words", [])

    # Budget tracking
    budget = {
        "ai_video": preset["ai_video_budget"],
        "meme": preset["meme_budget"],
    }

    # Track used memes for rotation (never repeat)
    used_memes = set()

    # Split ALL segments into beats
    all_beats = []
    for i, seg in enumerate(segments):
        next_start = segments[i+1]["startFrame"] if i+1 < len(segments) else total_frames
        beats = _split_segment_into_beats(seg, words, fps, total_frames, next_start)

        for j, beat in enumerate(beats):
            beat["segment_index"] = i
            beat["beat_index"] = j
            beat["is_first_beat"] = (j == 0)
            beat["is_segment_start"] = (j == 0)
            beat["segment_id"] = seg.get("id", f"segment_{i+1}")
            beat["component_path"] = seg.get("componentPath", f"src/visuals/Generated_{seg.get('title', '').replace(' ', '')}.tsx")
            all_beats.append(beat)

    total_beats = len(all_beats)

    visual_plan = {
        "meta": {
            "format": format_preset,
            "total_segments": len(segments),
            "total_beats": total_beats,
            "total_duration_s": round(total_duration, 1),
            "ai_video_budget": preset["ai_video_budget"],
            "meme_budget": preset["meme_budget"],
        },
        "beats": [],
    }

    for i, beat in enumerate(all_beats):
        duration_s = (beat["endFrame"] - beat["startFrame"]) / fps
        text = beat.get("text", "")

        # Classify intent
        intent = _classify_segment(text, i, total_beats)

        # Force hook on first beat
        if i == 0:
            intent = "hook"
        # Force CTA on last beat
        if i == total_beats - 1:
            intent = "cta"

        # Pick visual type
        visual_type, reason = _pick_visual_type(intent, i, total_beats, budget, preset)

        # Decrement budget
        if visual_type == "ai_video":
            budget["ai_video"] -= 1
        elif visual_type == "meme":
            budget["meme"] -= 1

        beat_plan = {
            "beat_id": f"beat_{i+1}",
            "segment_id": beat["segment_id"],
            "parent_title": beat["parent_title"],
            "startFrame": beat["startFrame"],
            "endFrame": beat["endFrame"],
            "duration_s": round(duration_s, 1),
            "intent": intent,
            "visual_type": visual_type,
            "reason": reason,
            "is_segment_start": beat["is_segment_start"],
        }

        # Meme with rotation — never same meme twice
        if visual_type == "meme":
            meme = _suggest_meme(intent, text, memes_data, used_memes)
            if meme:
                meme_key = meme.get("name", meme.get("title", ""))
                used_memes.add(meme_key)
                beat_plan["meme"] = meme

        if visual_type == "ai_video":
            beat_plan["ai_video_prompt"] = _suggest_ai_video_prompt(text, intent)

        if visual_type == "motion_graphics":
            beat_plan["component"] = beat.get("component_path", "")

        visual_plan["beats"].append(beat_plan)

    # Summary
    type_counts = {}
    for b in visual_plan["beats"]:
        t = b["visual_type"]
        type_counts[t] = type_counts.get(t, 0) + 1

    visual_plan["summary"] = {
        "visual_types": type_counts,
        "ai_video_used": preset["ai_video_budget"] - budget["ai_video"],
        "memes_used": preset["meme_budget"] - budget["meme"],
        "budget_remaining": budget,
    }

    return visual_plan


def print_plan(plan):
    """Print visual plan report."""
    print(f"\n{'='*70}")
    print(f"VISUAL PLAN — {plan['meta']['format']}")
    print(f"{'='*70}")
    print(f"Segments: {plan['meta']['total_segments']} → Beats: {plan['meta']['total_beats']} | Duration: {plan['meta']['total_duration_s']}s")
    print(f"AI video budget: {plan['meta']['ai_video_budget']} | Meme budget: {plan['meta']['meme_budget']}")
    print(f"{'─'*70}")

    current_segment = None
    for b in plan["beats"]:
        # Print segment header when segment changes
        if b.get("parent_title") != current_segment:
            current_segment = b.get("parent_title")
            print(f"\n  ── {current_segment} ──")

        icon = {
            "ai_video": "🎬",
            "motion_graphics": "📊",
            "meme": "😂",
            "text_callout": "📝",
            "b_roll": "🎥",
            "sfx_only": "🔊",
        }.get(b["visual_type"], "❓")

        sec_start = b["startFrame"] / 30
        sec_end = b["endFrame"] / 30
        print(f"    {icon} [{b['intent']:12s}] {b['duration_s']:5.1f}s ({sec_start:.0f}-{sec_end:.0f}s) → {b['visual_type']}")

        if "meme" in b:
            m = b["meme"]
            print(f"       Meme: {m.get('name', m.get('title', '?'))}")

        if "ai_video_prompt" in b:
            print(f"       AI: {b['ai_video_prompt'][:65]}...")

    print(f"\n{'─'*70}")
    print(f"Summary: {plan['summary']['visual_types']}")
    print(f"AI video: {plan['summary']['ai_video_used']}/{plan['meta']['ai_video_budget']} | Memes: {plan['summary']['memes_used']}/{plan['meta']['meme_budget']}")
    print(f"{'='*70}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 visual_planner.py <master-plan.json> [memes.json] [format]")
        sys.exit(1)

    plan_path = sys.argv[1]
    memes_path = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("fast") else None
    preset = sys.argv[-1] if sys.argv[-1] in FORMAT_PRESETS else "fast_explainer"

    with open(plan_path) as f:
        master_plan = json.load(f)

    memes_data = {}
    if memes_path and os.path.exists(memes_path):
        with open(memes_path) as f:
            memes_data = json.load(f)

    plan = plan_visuals(master_plan, memes_data, preset)
    print_plan(plan)

    # Save
    output = plan_path.replace("master-plan.json", "visual-plan.json")
    with open(output, "w") as f:
        json.dump(plan, f, indent=2)
    print(f"\n📄 Saved: {output}")
