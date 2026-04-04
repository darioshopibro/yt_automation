"""Content processor — full pipeline from approved topic to finished script.

Upgraded pipeline:
1. PARALLEL RESEARCH — transcripts + YT comments + Reddit threads
2. ANGLE DETECTION — uses all 3 sources for better gap finding
3. OUTLINE — 8-12 beat outline before full script (review gate)
4. SCRIPT WRITING — from outline, not from scratch
5. QUALITY SCORING — readability + pacing + TTS check (replaces LLM plagiarism)
"""

import subprocess
import json
import re
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import config
import db
from research_helpers import research_topic
from quality_scorer import score_script
from pipeline_logger import PipelineLogger

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")


def _load_prompt(name):
    path = os.path.join(PROMPTS_DIR, f"{name}.md")
    with open(path) as f:
        return f.read()


def _call_claude(prompt, model=None):
    """Call Claude via CLI and return response text."""
    model = model or config.SONNET_MODEL
    result = subprocess.run(
        ["claude", "-p", prompt, "--model", model, "--output-format", "text"],
        capture_output=True, text=True, timeout=300
    )
    return result.stdout.strip()


def _extract_json(text):
    """Extract JSON object or array from response text."""
    json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', text)
    if not json_match:
        return None
    try:
        return json.loads(json_match.group())
    except json.JSONDecodeError:
        return None


# === STEP 1: RESEARCH (parallel) ===

def run_research(topic_title, logger):
    """Run parallel research: transcripts + YT comments + Reddit."""
    logger.start_step("research")

    try:
        data = research_topic(topic_title)

        transcripts = data["transcripts"]
        yt_comments = data["yt_comments"]
        reddit_data = data["reddit_data"]

        details = {
            "transcripts": len(transcripts),
            "yt_comments_analyzed": yt_comments["total_comments_analyzed"],
            "yt_questions": len(yt_comments["questions"]),
            "yt_requests": len(yt_comments["requests"]),
            "reddit_threads": reddit_data["total_threads"],
            "reddit_questions": len(reddit_data["questions"]),
            "sub_steps": data["step_log"],
        }

        if not transcripts:
            logger.fail_step("No transcripts found", details=details)
        else:
            logger.complete_step(items_in=0, items_out=len(transcripts), details=details)

        return data

    except Exception as e:
        logger.fail_step(str(e))
        return {
            "transcripts": [],
            "yt_comments": {"questions": [], "requests": [], "pain_points": [], "total_comments_analyzed": 0},
            "reddit_data": {"threads": [], "questions": [], "total_threads": 0, "total_comments": 0},
            "step_log": [],
        }


# === STEP 2: ANGLE DETECTION ===

def run_angle_detection(topic_title, research_data, logger):
    """Detect unique angle using transcripts + comments + Reddit data."""
    logger.start_step("angle_detection")

    transcripts = research_data["transcripts"]
    yt_comments = research_data["yt_comments"]
    reddit_data = research_data["reddit_data"]

    if not transcripts:
        logger.fail_step("No transcripts to analyze")
        return None

    try:
        # Build transcript block (cap per transcript to keep prompt manageable)
        max_per_transcript = 2500 if len(transcripts) > 5 else 3500
        transcript_text = ""
        for i, t in enumerate(transcripts[:7]):
            transcript_text += f"\n--- VIDEO {i+1}: {t['title']} ---\n{t['text'][:max_per_transcript]}\n"

        # Build pain points block (from comments + reddit)
        pain_points = []

        if yt_comments["questions"]:
            pain_points.append("VIEWER QUESTIONS (from YouTube comments):")
            for q in yt_comments["questions"][:10]:
                pain_points.append(f"  - {q}")

        if yt_comments["requests"]:
            pain_points.append("\nVIEWER REQUESTS:")
            for r in yt_comments["requests"][:5]:
                pain_points.append(f"  - {r}")

        if yt_comments["pain_points"]:
            pain_points.append("\nCONFUSION POINTS:")
            for p in yt_comments["pain_points"][:5]:
                pain_points.append(f"  - {p}")

        if reddit_data["questions"]:
            pain_points.append("\nREDDIT QUESTIONS (unanswered or debated):")
            for q in reddit_data["questions"][:10]:
                pain_points.append(f"  - {q}")

        pain_points_text = "\n".join(pain_points) if pain_points else "No audience data available."

        # Build full prompt
        template = _load_prompt("angle-detection")
        prompt = template.replace("{topic}", topic_title).replace("{transcripts}", transcript_text)

        # Append pain points as extra context
        prompt += f"""

AUDIENCE PAIN POINTS (from YouTube comments and Reddit discussions):
{pain_points_text}

Use these pain points to find angles that directly address what real people are confused about or asking for.
An angle that answers a real question is ALWAYS better than a clever gap-fill."""

        response = _call_claude(prompt, config.SONNET_MODEL)
        angle = _extract_json(response)

        # If JSON parsing failed, try a simpler extraction
        if not angle or not angle.get("proposed_angle"):
            # Try to salvage — ask Claude to just give the angle as text
            fallback_prompt = f"""Based on this analysis, give me a JSON with proposed_angle, angle_type, proposed_hook, and key_differentiators for a video about "{topic_title}".

Previous analysis:
{response[:2000]}

Return ONLY valid JSON."""
            fallback_response = _call_claude(fallback_prompt, config.HAIKU_MODEL)
            angle = _extract_json(fallback_response)

        if angle and angle.get("proposed_angle"):
            logger.complete_step(details={
                "angle": angle["proposed_angle"],
                "type": angle.get("angle_type", "?"),
                "hook": angle.get("proposed_hook", "?"),
                "pain_points_fed": len(pain_points),
            })
        else:
            logger.fail_step("Angle detection returned invalid JSON")

        return angle

    except Exception as e:
        logger.fail_step(str(e))
        return None


# === STEP 3: OUTLINE ===

def run_outline(topic_title, angle, research_data, logger):
    """Generate outline from angle + pain points."""
    logger.start_step("outline")

    if not angle:
        logger.fail_step("No angle to build outline from")
        return None

    try:
        yt_comments = research_data["yt_comments"]
        reddit_data = research_data["reddit_data"]

        # Build pain points summary for outline prompt
        pain_points_lines = []
        for q in yt_comments["questions"][:5]:
            pain_points_lines.append(f"- YT comment: {q}")
        for r in yt_comments["requests"][:3]:
            pain_points_lines.append(f"- YT request: {r}")
        for q in reddit_data["questions"][:5]:
            pain_points_lines.append(f"- Reddit: {q}")

        pain_points_text = "\n".join(pain_points_lines) if pain_points_lines else "None collected."

        template = _load_prompt("outline")
        prompt = (
            template
            .replace("{topic}", topic_title)
            .replace("{angle}", angle.get("proposed_angle", ""))
            .replace("{hook}", angle.get("proposed_hook", ""))
            .replace("{differentiators}", "\n".join(f"- {d}" for d in angle.get("key_differentiators", [])))
            .replace("{pain_points}", pain_points_text)
        )

        response = _call_claude(prompt, config.SONNET_MODEL)
        outline = _extract_json(response)

        if outline and outline.get("outline"):
            beats = outline["outline"]
            logger.complete_step(details={
                "beats": len(beats),
                "estimated_duration": outline.get("estimated_duration_seconds", "?"),
                "tension_arc": outline.get("tension_arc", "?"),
                "outline_preview": [b["beat"][:60] for b in beats[:4]],
            })
        else:
            logger.fail_step("Outline generation returned invalid JSON")

        return outline

    except Exception as e:
        logger.fail_step(str(e))
        return None


# === STEP 4: SCRIPT WRITING ===

def run_script_writing(topic_title, angle, outline, logger):
    """Write full script from outline."""
    logger.start_step("script_writing")

    if not angle or not outline:
        logger.fail_step("Missing angle or outline")
        return None

    try:
        # Build outline text for the script prompt
        outline_text = ""
        for i, beat in enumerate(outline.get("outline", [])):
            outline_text += f"{i+1}. [{beat.get('type', '?')}] {beat['beat']}\n"

        template = _load_prompt("script-writing")
        prompt = (
            template
            .replace("{topic}", topic_title)
            .replace("{angle}", angle.get("proposed_angle", ""))
            .replace("{angle_type}", angle.get("angle_type", ""))
            .replace("{hook}", angle.get("proposed_hook", ""))
            .replace("{differentiators}", "\n".join(f"- {d}" for d in angle.get("key_differentiators", [])))
        )

        # Add outline as structure guide
        prompt += f"""

OUTLINE (follow this structure beat-by-beat):
{outline_text}

Tension arc: {outline.get('tension_arc', 'build problem, then reveal solution')}
Target: {outline.get('target_word_count', 800)} words

Write the script following this outline. Each beat should become 1-3 sentences."""

        # Add variety block
        variety_block = _build_variety_block()
        if variety_block:
            prompt += variety_block

        raw_script = _call_claude(prompt, config.SONNET_MODEL)

        if raw_script:
            raw_script = _preprocess_for_tts(raw_script)

        if raw_script and len(raw_script) > 100:
            word_count = len(raw_script.split())
            logger.complete_step(details={"word_count": word_count})
        else:
            logger.fail_step("Script too short or empty")

        return raw_script

    except Exception as e:
        logger.fail_step(str(e))
        return None


# === STEP 5: QUALITY SCORING ===

def run_quality_check(script, logger):
    """Run quality scoring on the script."""
    logger.start_step("quality_check")

    if not script:
        logger.fail_step("No script to check")
        return None

    try:
        result = score_script(script)

        logger.complete_step(details={
            "overall_score": result["overall_score"],
            "verdict": result["verdict"],
            "word_count": result["pacing"]["word_count"],
            "readability_grade": result["readability"]["grade"],
            "avg_sentence_length": result["pacing"]["avg_sentence_length"],
            "issues": result["issues"],
        })

        return result

    except Exception as e:
        logger.fail_step(str(e))
        return None


# === HELPERS ===

def _preprocess_for_tts(text):
    """Run text through TTS preprocessing if available."""
    preprocess_script = os.path.join(
        os.path.dirname(__file__), "..", "..", ".claude", "skills",
        "remotion-planner", "scripts", "preprocess-tts.py"
    )
    if not os.path.exists(preprocess_script):
        return text

    try:
        result = subprocess.run(
            ["python3", preprocess_script, "--text", text, "--auto-fix"],
            capture_output=True, text=True, timeout=10
        )
        if result.stdout.strip():
            return result.stdout.strip()
    except Exception:
        pass

    return text


def _build_variety_block():
    """Load past scripts and build a 'DO NOT REPEAT' block."""
    conn = db.get_connection()
    past_scripts = conn.execute(
        "SELECT s.script_text, t.title FROM scripts s JOIN topics t ON s.topic_id = t.id ORDER BY s.id DESC LIMIT 5"
    ).fetchall()
    conn.close()

    if not past_scripts:
        return ""

    lines = ["\n\nSCRIPT VARIETY — CRITICAL (do NOT repeat patterns from past scripts):"]
    lines.append("Your new script MUST differ in structure, examples, analogies, hook style, and closing style.")
    lines.append("")

    for i, s in enumerate(past_scripts):
        script = s["script_text"]
        hook = script.split('.')[0] if script else ""
        closing = script.strip().split('.')[-1] if script else ""
        lines.append(f"PAST SCRIPT {i+1} ({s['title']}):")
        lines.append(f"  Hook: \"{hook[:100]}\"")
        lines.append(f"  Closing: \"{closing[:100]}\"")
        lines.append("")

    return "\n".join(lines)


# === MAIN PIPELINE ===

def process_topic(topic_id):
    """Full content processing pipeline for an approved topic.

    Chain:
    1. Parallel research (transcripts + YT comments + Reddit)
    2. Angle detection (all sources combined)
    3. Outline generation
    4. Script writing (from outline)
    5. Quality scoring

    Every step is logged. Returns full result dict.
    """
    conn = db.get_connection()
    topic = dict(conn.execute("SELECT * FROM topics WHERE id=?", (topic_id,)).fetchone())
    conn.close()

    print(f"\n{'='*60}")
    print(f"CONTENT PROCESSOR — {topic['title']}")
    print(f"{'='*60}")

    logger = PipelineLogger(run_id=topic_id * 1000)  # Use topic_id * 1000 to avoid conflicts with scan runs
    result = {"topic_id": topic_id, "topic_title": topic["title"]}

    # 1. Research (parallel)
    research_data = run_research(topic["title"], logger)
    result["transcripts_count"] = len(research_data["transcripts"])
    result["comments_analyzed"] = research_data["yt_comments"]["total_comments_analyzed"]
    result["reddit_threads"] = research_data["reddit_data"]["total_threads"]

    if not research_data["transcripts"]:
        result["error"] = "No transcripts found"
        logger.print_report()
        return result

    # 2. Angle detection
    angle = run_angle_detection(topic["title"], research_data, logger)
    result["angle"] = angle

    if not angle or not angle.get("proposed_angle"):
        result["error"] = "Angle detection failed"
        logger.print_report()
        return result

    print(f"\n  🎯 Angle: {angle['proposed_angle']}")
    print(f"     Type: {angle.get('angle_type', 'N/A')}")
    print(f"     Hook: {angle.get('proposed_hook', 'N/A')}")

    # 3. Outline
    outline = run_outline(topic["title"], angle, research_data, logger)
    result["outline"] = outline

    if not outline:
        result["error"] = "Outline generation failed"
        logger.print_report()
        return result

    print(f"\n  📋 Outline ({len(outline.get('outline', []))} beats):")
    for beat in outline.get("outline", [])[:5]:
        print(f"     [{beat.get('type', '?'):12s}] {beat['beat'][:60]}")
    if len(outline.get("outline", [])) > 5:
        print(f"     ... and {len(outline['outline']) - 5} more beats")

    # 4. Script writing
    script = run_script_writing(topic["title"], angle, outline, logger)
    result["script"] = script

    if not script or len(script) < 100:
        result["error"] = "Script writing failed"
        logger.print_report()
        return result

    word_count = len(script.split())
    print(f"\n  ✍️  Script: {word_count} words")

    # 5. Quality scoring
    quality = run_quality_check(script, logger)
    result["quality"] = quality

    if quality:
        print(f"\n  📊 Quality: {quality['overall_score']}/10 — {quality['verdict']}")
        if quality["issues"]:
            for issue in quality["issues"][:3]:
                print(f"     ⚠️ {issue}")

    # Store in DB
    similarity = quality.get("overall_score", 0) if quality else None
    conn = db.get_connection()
    conn.execute(
        """INSERT INTO scripts (topic_id, script_text, similarity_score, similarity_report, status)
           VALUES (?, ?, ?, ?, ?)""",
        (topic_id, script, similarity,
         json.dumps(quality) if quality else None,
         "approved" if quality and quality.get("verdict") == "PASS" else "needs_review")
    )
    conn.execute(
        "UPDATE topics SET proposed_angle=?, proposed_hook=?, angle_type=?, status='processed' WHERE id=?",
        (angle.get("proposed_angle"), angle.get("proposed_hook"), angle.get("angle_type"), topic_id)
    )
    conn.commit()
    conn.close()

    # Print full report
    summary = logger.print_report()
    report_path = logger.save_report()
    print(f"📄 Log: {report_path}")

    return result


def process_topic_with_feedback(topic_id, feedback, old_script_text=None):
    """Rewrite a script with specific user feedback.

    Uses existing angle but rewrites the script incorporating feedback.
    Called from Telegram bot when user requests a rewrite.
    """
    conn = db.get_connection()
    topic = dict(conn.execute("SELECT * FROM topics WHERE id=?", (topic_id,)).fetchone())
    conn.close()

    print(f"\n✏️ Rewriting: {topic['title']}")
    print(f"   Feedback: {feedback[:100]}")

    result = {"topic_id": topic_id, "topic_title": topic["title"]}

    # Get existing angle or detect new one
    angle = None
    if "angle" in feedback.lower() or "new angle" in feedback.lower():
        print("   🎯 Detecting new angle...")
        research_data = research_topic(topic["title"])
        if research_data["transcripts"]:
            logger = PipelineLogger(run_id=topic_id * 1000 + 1)
            angle = run_angle_detection(topic["title"], research_data, logger)
    else:
        angle = {
            "proposed_angle": topic.get("proposed_angle", ""),
            "angle_type": topic.get("angle_type", ""),
            "proposed_hook": topic.get("proposed_hook", ""),
            "key_differentiators": [],
        }

    if not angle:
        result["error"] = "Could not determine angle"
        return result

    # Build rewrite prompt
    template = _load_prompt("script-writing")
    prompt = (
        template
        .replace("{topic}", topic["title"])
        .replace("{angle}", angle.get("proposed_angle", ""))
        .replace("{angle_type}", angle.get("angle_type", ""))
        .replace("{hook}", angle.get("proposed_hook", ""))
        .replace("{differentiators}", "\n".join(f"- {d}" for d in angle.get("key_differentiators", [])))
    )

    prompt += f"\n\nUSER FEEDBACK ON PREVIOUS SCRIPT (MUST address this):\n{feedback}\n"

    if old_script_text:
        prompt += f"\nPREVIOUS SCRIPT (rewrite addressing feedback above):\n{old_script_text[:2000]}\n"

    variety_block = _build_variety_block()
    if variety_block:
        prompt += variety_block

    print("   ✍️ Writing new script...")
    script = _call_claude(prompt, config.SONNET_MODEL)
    if script:
        script = _preprocess_for_tts(script)

    if not script or len(script) < 100:
        result["error"] = "Script generation failed"
        return result

    # Quality check
    quality = score_script(script)
    result["script"] = script
    result["angle"] = angle
    result["quality"] = quality
    word_count = len(script.split())
    print(f"   ✅ New script: {word_count} words | Quality: {quality['overall_score']}/10")

    # Store
    conn = db.get_connection()
    conn.execute(
        "INSERT INTO scripts (topic_id, script_text, similarity_score, similarity_report, status) VALUES (?, ?, ?, ?, ?)",
        (topic_id, script, quality["overall_score"], json.dumps(quality),
         "approved" if quality["verdict"] == "PASS" else "needs_review")
    )
    if angle.get("proposed_angle"):
        conn.execute(
            "UPDATE topics SET proposed_angle=?, proposed_hook=?, angle_type=? WHERE id=?",
            (angle.get("proposed_angle"), angle.get("proposed_hook"), angle.get("angle_type"), topic_id)
        )
    conn.commit()
    conn.close()

    return result


if __name__ == "__main__":
    # Process the top-scored topic
    candidates = db.get_top_candidates(1)
    if candidates:
        result = process_topic(candidates[0]["id"])
        print("\n" + json.dumps({k: v for k, v in result.items() if k != "script"}, indent=2, default=str)[:2000])
    else:
        print("No candidates found. Run run_pipeline.py first.")
