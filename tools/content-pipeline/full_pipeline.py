#!/usr/bin/env python3
"""Full pipeline — from approved topic to final video in ONE command.

Runs ALL steps automatically:
1. Content processor (research → angle → outline → script → quality)
2. Meme research (parallel sources)
3. SFX placement (from timestamps)
4. Visual plan (beat-level decisions)
5. AI video generation (hook + key reveals)
6. Composition (merge everything)
7. Audio mix (voice + SFX + music → ducking → LUFS)
8. Final concat (→ final_video.mp4)

Usage:
    python3 full_pipeline.py <topic_id>
    python3 full_pipeline.py --slug <topic-slug>
"""

import sys
import os
import json
import time

sys.path.insert(0, os.path.dirname(__file__))

import db
import config
from content_processor import process_topic
from pipeline_logger import PipelineLogger

# Add tools paths
TOOLS_DIR = os.path.join(os.path.dirname(__file__), "..")
sys.path.insert(0, os.path.join(TOOLS_DIR, "sound-design"))
sys.path.insert(0, os.path.join(TOOLS_DIR, "composition"))
sys.path.insert(0, os.path.join(TOOLS_DIR, "audio-mixer"))
sys.path.insert(0, os.path.join(TOOLS_DIR, "render"))

WORKSPACE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "workspace")
MEME_SCRIPT = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "meme-researcher", "scripts", "fetch_memes.py")
MUSIC_FILE = os.path.join(TOOLS_DIR, "sound-design", "library", "music", "bg-lofi-tech.mp3")


def run_full_pipeline(topic_id, auto_approve_images=True):
    """Run the complete pipeline from topic to final video.

    Returns dict with all results and paths.
    """
    start_time = time.time()

    # Get topic info
    conn = db.get_connection()
    topic = dict(conn.execute("SELECT * FROM topics WHERE id=?", (topic_id,)).fetchone())
    conn.close()

    title = topic["title"]
    slug = topic["slug"]
    project_dir = os.path.join(WORKSPACE_DIR, slug)
    os.makedirs(project_dir, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"FULL PIPELINE — {title}")
    print(f"{'='*60}")

    logger = PipelineLogger(run_id=topic_id * 10000)
    result = {"topic_id": topic_id, "title": title, "slug": slug, "project_dir": project_dir}

    # === STEP 1: Content processor (script + outline + quality) ===
    # Skip if script already exists in DB
    conn = db.get_connection()
    existing_script = conn.execute("SELECT script_text FROM scripts WHERE topic_id=? ORDER BY id DESC LIMIT 1", (topic_id,)).fetchone()
    conn.close()

    if existing_script and existing_script["script_text"]:
        print(f"\n[1/7] Content Processing... SKIPPED (script exists in DB)")
        logger.start_step("content_processing")
        logger.complete_step(details={"skipped": True, "reason": "script already exists"})
        result["script"] = True
        result["angle"] = topic.get("proposed_angle", "")
    else:
        print(f"\n[1/7] Content Processing...")
        logger.start_step("content_processing")
        try:
            content = process_topic(topic_id)
            if content.get("error"):
                logger.fail_step(content["error"])
                result["error"] = f"Content processing: {content['error']}"
                _print_final(result, start_time, logger)
                return result
            logger.complete_step(details={"angle": content.get("angle", {}).get("proposed_angle", "?")})
            result["script"] = True
            result["angle"] = content.get("angle", {}).get("proposed_angle", "")
        except Exception as e:
            logger.fail_step(str(e))
            result["error"] = f"Content processing: {e}"
            _print_final(result, start_time, logger)
            return result

    # === STEP 1.5: Generate voiceover + timestamps + master-plan ===
    print(f"\n[1.5/8] Voiceover + Master Plan...")
    logger.start_step("voiceover_generation")
    try:
        # Get script text
        conn = db.get_connection()
        script_row = conn.execute("SELECT script_text FROM scripts WHERE topic_id=? ORDER BY id DESC LIMIT 1", (topic_id,)).fetchone()
        conn.close()

        if script_row:
            script_text = script_row["script_text"]
            # Remove preprocessing header if present
            if "PREPROCESSED TEXT:" in script_text:
                script_text = script_text.split("PREPROCESSED TEXT:")[-1].strip().lstrip("=").strip()

            # Save cleaned transcript
            transcript_path = os.path.join(project_dir, "cleaned-transcript.txt")
            with open(transcript_path, "w") as f:
                f.write(script_text)

            # Run TTS pipeline (from remotion-planner)
            tts_script = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "remotion-planner", "scripts", "full-pipeline.py")
            import subprocess
            tts_result = subprocess.run(
                ["python3", tts_script, "--file", transcript_path, "--output-dir", project_dir],
                capture_output=True, text=True, timeout=120,
            )

            voiceover_path = os.path.join(project_dir, "voiceover.mp3")
            timestamps_path = os.path.join(project_dir, "voiceover-timestamps.json")

            if os.path.exists(voiceover_path) and os.path.exists(timestamps_path):
                # Rename to voiceover-chris.mp3 since we use Chris voice
                chris_path = os.path.join(project_dir, "voiceover-chris.mp3")
                import shutil
                shutil.copy2(voiceover_path, chris_path)

                # Build master-plan.json from timestamps
                with open(timestamps_path) as f:
                    ts_data = json.load(f)

                fps = 30
                words = ts_data.get("words", [])
                duration = ts_data.get("duration", 0)
                total_frames = int(duration * fps) + 30

                # Add frame numbers to words
                for w in words:
                    w["startFrame"] = round(w["start"] * fps)
                    w["endFrame"] = round(w["end"] * fps)

                # Rough segmentation based on natural pauses in speech (gaps > 0.8s)
                # Agent will re-segment properly — this is just a starting point
                segment_boundaries = [0]
                for i in range(1, len(words)):
                    gap = words[i].get("start", 0) - words[i-1].get("end", 0)
                    if gap > 0.8:
                        segment_boundaries.append(i)
                # Fallback: if too few boundaries found, split evenly
                if len(segment_boundaries) < 3:
                    target_segment_count = max(len(words) // 30, 3)
                    segment_boundaries = [0]
                    words_per_segment = max(len(words) // target_segment_count, 10)

                for i in range(1, len(words)):
                    if i % words_per_segment == 0 and i > 0:
                        segment_boundaries.append(i)

                segments = []
                for si in range(len(segment_boundaries)):
                    start_idx = segment_boundaries[si]
                    end_idx = segment_boundaries[si + 1] if si + 1 < len(segment_boundaries) else len(words)

                    if start_idx >= len(words):
                        break

                    seg_words = words[start_idx:end_idx]
                    if not seg_words:
                        continue

                    seg_text = " ".join(w["word"] for w in seg_words[:5])
                    segments.append({
                        "id": f"sticky_{si + 1}",
                        "step": si + 1,
                        "title": seg_text[:40],
                        "startFrame": seg_words[0]["startFrame"],
                        "sections": [],
                    })

                master_plan_path = os.path.join(project_dir, "master-plan.json")
                master_plan = {
                    "meta": {
                        "title": title,
                        "fps": fps,
                        "totalFrames": total_frames,
                        "totalDuration": round(duration, 1),
                        "hierarchyType": "sticky",
                    },
                    "voiceover": {
                        "file": "voiceover.mp3",
                        "duration": round(duration, 1),
                        "words": words,
                    },
                    "structure": {
                        "stickies": segments,
                    },
                    "camera": {"initialPosition": {"x": 960, "y": 540, "scale": 0.7}, "keyframes": []},
                    "sounds": {"points": [], "totalCount": 0},
                }

                with open(master_plan_path, "w") as f:
                    json.dump(master_plan, f, indent=2)

                logger.complete_step(details={
                    "words": len(words),
                    "duration": round(duration, 1),
                    "segments": len(segments),
                    "master_plan": master_plan_path,
                })
            else:
                logger.fail_step(f"TTS failed: {tts_result.stderr[:200]}")
        else:
            logger.fail_step("No script found in DB")
    except Exception as e:
        logger.fail_step(str(e))

    # === STEP 2: Meme research (PARALLEL — doesn't depend on anything) ===
    print(f"\n[2/10] Meme Research...")
    logger.start_step("meme_research")
    try:
        import subprocess
        meme_result = subprocess.run(
            ["python3", MEME_SCRIPT, title],
            capture_output=True, text=True, timeout=30,
            cwd=project_dir,
        )
        memes_file = os.path.join(project_dir, f"memes_{slug[:20]}.json")
        # fetch_memes.py saves to current dir, move if needed
        cwd_memes = f"memes_{title.replace(' ', '_')[:20]}.json"
        if os.path.exists(cwd_memes):
            os.rename(cwd_memes, memes_file)
        elif os.path.exists(os.path.join(project_dir, cwd_memes)):
            memes_file = os.path.join(project_dir, cwd_memes)

        if os.path.exists(memes_file):
            with open(memes_file) as f:
                memes_data = json.load(f)
            logger.complete_step(details={"total_memes": memes_data.get("total_memes", 0)})
        else:
            logger.partial_step("Memes file not found", details={})
            memes_data = {}
    except Exception as e:
        logger.fail_step(str(e))
        memes_data = {}

    # === STEP 3: AI Video Generation (hook + reveals) ===
    # Uses memes.json to know which topics need AI clips
    print(f"\n[3/7] AI Video Generation...")
    logger.start_step("ai_video_generation")
    try:
        sys.path.insert(0, os.path.join(TOOLS_DIR, "ai-video"))
        from video_generator import generate_clip
        clips_dir = os.path.join(project_dir, "ai-clips")
        os.makedirs(clips_dir, exist_ok=True)

        # Generate hook clip (always) + 1-2 reveal clips
        hook_prompt = f"Cinematic close-up, dramatic lighting, {title[:80]}, photorealistic, moody atmosphere"
        clip_results = []

        print(f"  Generating hook clip...")
        clip = generate_clip(hook_prompt, clips_dir, "hook", duration=5)
        clip["beat_id"] = "hook"
        clip_results.append(clip)

        with open(os.path.join(clips_dir, "ai_clips_results.json"), "w") as f:
            json.dump(clip_results, f, indent=2)

        ok_clips = sum(1 for c in clip_results if c.get("status") == "ok")
        logger.complete_step(details={"generated": ok_clips})
    except Exception as e:
        logger.partial_step(str(e))

    # === STEPS 4-6: VIZUALI + ZVUKOVI + BUILD ===
    # Ovo radi AGENT (ja) u sesiji koristeći remotion-motion skill:
    #   KORAK 1: Visual router → segmenti
    #   KORAK 2: Planner → vizuali + meme/AI clip placement + master-plan.json
    #   KORAK 2.5: Sound designer → zvukovi po vizualima
    #   KORAK 3: Builder → Root.tsx
    #
    # full_pipeline.py NE radi ove korake — agent ih pokreće sa skillovima.
    print(f"\n[4/7] Vizuali + Zvukovi + Build...")
    print(f"  ⏸️  Ovi koraci zahtevaju agenta sa skillovima.")
    print(f"  ⏸️  U sesiji reci: 'napravi video za {slug}'")
    print(f"  ⏸️  Agent pokreće: remotion-motion skill")
    print(f"  ⏸️  (planner → visual-generator → sound designer → builder)")
    logger.start_step("visual_sound_build")
    logger.complete_step(details={"status": "waiting_for_agent", "command": f"napravi video za {slug}"})

    # === STEP 5: Audio Mix (voiceover + music, BEZ SFX — SFX dodaje agent) ===
    print(f"\n[5/7] Audio Mix (voiceover + music)...")
    logger.start_step("audio_mix")
    try:
        from mixer import mix_audio

        voiceover = None
        for name in ["voiceover-chris.mp3", "voiceover.mp3"]:
            p = os.path.join(project_dir, name)
            if os.path.exists(p):
                voiceover = p
                break

        if voiceover:
            music = MUSIC_FILE if os.path.exists(MUSIC_FILE) else None
            # Create minimal composition for mixer (just voiceover + music, no SFX)
            minimal_comp = {
                "meta": {"fps": 30, "totalFrames": 9000},
                "audio": {
                    "music": {"baseVolume": 0.20, "duckedVolume": 0.08, "duckRampFrames": 15,
                              "fadeInEndFrame": 30, "fadeOutStartFrame": 8940},
                    "sfx": [],  # SFX will be added by agent with sound designer
                    "duckingZones": [],
                },
            }
            # Read timestamps for ducking zones
            ts_path = os.path.join(project_dir, "voiceover-timestamps.json")
            if os.path.exists(ts_path):
                with open(ts_path) as f:
                    ts = json.load(f)
                words = ts.get("words", [])
                total_frames = int(ts.get("duration", 300) * 30) + 30
                minimal_comp["meta"]["totalFrames"] = total_frames
                minimal_comp["audio"]["music"]["fadeOutStartFrame"] = max(total_frames - 60, 0)
                # Build ducking zones
                zones = []
                if words:
                    zone_start = int(words[0].get("start", 0) * 30)
                    zone_end = int(words[0].get("end", 0) * 30)
                    for i in range(1, len(words)):
                        gap = words[i].get("start", 0) - words[i-1].get("end", 0)
                        if gap > 0.5:
                            zones.append({"startFrame": zone_start, "endFrame": zone_end})
                            zone_start = int(words[i].get("start", 0) * 30)
                        zone_end = int(words[i].get("end", 0) * 30)
                    zones.append({"startFrame": zone_start, "endFrame": zone_end})
                minimal_comp["audio"]["duckingZones"] = zones

            comp_path = os.path.join(project_dir, "mix-config.json")
            with open(comp_path, "w") as f:
                json.dump(minimal_comp, f, indent=2)

            mix_output = mix_audio(comp_path, voiceover, music)
            logger.complete_step(details={"output": mix_output, "has_music": music is not None})
        else:
            logger.fail_step("No voiceover found")
    except Exception as e:
        logger.fail_step(str(e))

    _print_final(result, start_time, logger)
    return result


def _print_final(result, start_time, logger):
    elapsed = time.time() - start_time
    summary = logger.print_report()
    report_path = logger.save_report()

    print(f"\n{'='*60}")
    if result.get("final_video"):
        print(f"✅ DONE: {result['title']}")
        print(f"   Video: {result['final_video']}")
    elif result.get("error"):
        print(f"❌ FAILED: {result['error']}")
    else:
        print(f"⚠️ PARTIAL: Check report for details")
    print(f"   Time: {elapsed:.0f}s")
    print(f"   Log: {report_path}")
    print(f"{'='*60}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 full_pipeline.py <topic_id>")
        sys.exit(1)

    topic_id = int(sys.argv[1])
    run_full_pipeline(topic_id)
