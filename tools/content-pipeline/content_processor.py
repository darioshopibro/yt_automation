"""Content processor — chain: research → angle → script → plagiarism check."""

import subprocess
import json
import re
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import config
import db

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")
RESEARCH_SCRIPT = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "research", "scripts")


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
    # Try to find JSON block
    json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', text)
    if not json_match:
        return None
    try:
        return json.loads(json_match.group())
    except json.JSONDecodeError:
        return None


def fetch_transcripts(topic_title, count=3):
    """Fetch YouTube transcripts for a topic using research scripts."""
    transcript_script = os.path.join(RESEARCH_SCRIPT, "transcript.py")
    search_script = os.path.join(RESEARCH_SCRIPT, "search.py")

    # Search for videos on this topic
    result = subprocess.run(
        ["python3", search_script, topic_title],
        capture_output=True, text=True, timeout=30
    )
    if not result.stdout:
        return []

    try:
        search_data = json.loads(result.stdout)
        videos = search_data.get("results", search_data.get("videos", []))
    except json.JSONDecodeError:
        return []

    # Fetch transcripts for top videos
    transcripts = []
    for v in videos[:count + 2]:  # fetch extra in case some fail
        if len(transcripts) >= count:
            break
        url = v.get("url", v.get("webpage_url", ""))
        if not url:
            continue

        result = subprocess.run(
            ["python3", transcript_script, url],
            capture_output=True, text=True, timeout=30
        )
        if result.stdout:
            try:
                data = json.loads(result.stdout)
                text = data.get("transcript", "")
                if text and len(text) > 100:
                    transcripts.append({
                        "title": data.get("title", url),
                        "text": text[:3000],  # cap at 3000 chars per transcript
                        "url": url,
                    })
            except json.JSONDecodeError:
                continue

    return transcripts


def detect_angle(topic_title, transcripts):
    """Run angle detection on competitor transcripts.

    Returns: dict with proposed_angle, angle_type, etc. or None on failure.
    """
    if not transcripts:
        return None

    transcript_text = ""
    for i, t in enumerate(transcripts):
        transcript_text += f"\n--- VIDEO {i+1}: {t['title']} ---\n{t['text']}\n"

    template = _load_prompt("angle-detection")
    prompt = template.replace("{topic}", topic_title).replace("{transcripts}", transcript_text)

    response = _call_claude(prompt, config.SONNET_MODEL)
    return _extract_json(response)


def write_script(topic_title, angle_data):
    """Generate a script based on the detected angle.

    Loads past scripts to avoid repeating patterns, examples, analogies.
    Returns: script text string or None.
    """
    if not angle_data:
        return None

    template = _load_prompt("script-writing")
    prompt = (
        template
        .replace("{topic}", topic_title)
        .replace("{angle}", angle_data.get("proposed_angle", ""))
        .replace("{angle_type}", angle_data.get("angle_type", ""))
        .replace("{hook}", angle_data.get("proposed_hook", ""))
        .replace("{differentiators}", "\n".join(f"- {d}" for d in angle_data.get("key_differentiators", [])))
    )

    # Load past scripts to avoid repetition
    variety_block = _build_variety_block()
    if variety_block:
        prompt += variety_block

    raw_script = _call_claude(prompt, config.SONNET_MODEL)

    # Run through TTS preprocessing (tech terms, fillers, contractions)
    if raw_script:
        raw_script = _preprocess_for_tts(raw_script)

    return raw_script


def _preprocess_for_tts(text):
    """Run text through existing preprocess-tts.py pipeline."""
    preprocess_script = os.path.join(
        os.path.dirname(__file__), "..", "..", ".claude", "skills",
        "remotion-planner", "scripts", "preprocess-tts.py"
    )
    if not os.path.exists(preprocess_script):
        return text  # fallback: return as-is

    result = subprocess.run(
        ["python3", preprocess_script, "--text", text, "--auto-fix"],
        capture_output=True, text=True, timeout=10
    )
    if result.stdout.strip():
        return result.stdout.strip()

    # If --text flag doesn't work, try stdin
    result = subprocess.run(
        ["python3", preprocess_script],
        input=text, capture_output=True, text=True, timeout=10
    )
    if result.stdout.strip():
        return result.stdout.strip()

    return text  # fallback


def _build_variety_block():
    """Load past scripts and build a 'DO NOT REPEAT' block for the prompt."""
    conn = db.get_connection()
    past_scripts = conn.execute(
        "SELECT s.script_text, t.title FROM scripts s JOIN topics t ON s.topic_id = t.id ORDER BY s.id DESC LIMIT 5"
    ).fetchall()
    conn.close()

    if not past_scripts:
        return ""

    lines = ["\n\nSCRIPT VARIETY — CRITICAL (do NOT repeat patterns from past scripts):"]
    lines.append("Below are summaries of our recent scripts. Your new script MUST differ in:")
    lines.append("- Different STRUCTURE (if past scripts used problem→solution, try story→reveal)")
    lines.append("- Different EXAMPLES (if past used Klarna, use a different company)")
    lines.append("- Different ANALOGIES (if past used 'hoarding', use a completely different metaphor)")
    lines.append("- Different HOOK STYLE (if past started with a statistic, start with a scenario)")
    lines.append("- Different CLOSING STYLE (if past ended with 'one line config change', end differently)")
    lines.append("")

    for i, s in enumerate(past_scripts):
        script = s["script_text"]
        # Extract key elements for comparison (first 200 chars + last 100 chars)
        hook = script.split('.')[0] if script else ""
        closing = script.strip().split('.')[-1] if script else ""
        lines.append(f"PAST SCRIPT {i+1} ({s['title']}):")
        lines.append(f"  Hook: \"{hook[:100]}\"")
        lines.append(f"  Closing: \"{closing[:100]}\"")
        lines.append(f"  Full preview: \"{script[:300]}...\"")
        lines.append("")

    lines.append("Make your script FEEL DIFFERENT from all of the above. Same quality, different execution.")
    return "\n".join(lines)


def check_plagiarism(script_text, transcripts):
    """Check script originality against source transcripts.

    Returns: dict with overall_similarity_percent, verdict, etc. or None.
    """
    if not script_text or not transcripts:
        return None

    source_text = ""
    for i, t in enumerate(transcripts):
        source_text += f"\n--- SOURCE {i+1}: {t['title']} ---\n{t['text']}\n"

    template = _load_prompt("plagiarism-check")
    prompt = template.replace("{script}", script_text).replace("{sources}", source_text)

    response = _call_claude(prompt, config.HAIKU_MODEL)
    return _extract_json(response)


def process_topic(topic_id):
    """Full content processing pipeline for an approved topic.

    Chain: fetch transcripts → detect angle → write script → check plagiarism
    Returns: dict with all results or error info.
    """
    # Get topic from DB
    conn = db.get_connection()
    topic = dict(conn.execute("SELECT * FROM topics WHERE id=?", (topic_id,)).fetchone())
    conn.close()

    print(f"\n{'='*60}")
    print(f"Processing: {topic['title']}")
    print(f"{'='*60}")

    result = {"topic_id": topic_id, "topic_title": topic["title"]}

    # Step 1: Fetch transcripts
    print("\n📥 Fetching competitor transcripts...")
    transcripts = fetch_transcripts(topic["title"])
    result["transcripts_count"] = len(transcripts)
    if not transcripts:
        result["error"] = "No transcripts found"
        print("  ❌ No transcripts found")
        return result
    print(f"  ✅ {len(transcripts)} transcripts fetched")

    # Step 2: Angle detection
    print("\n🎯 Detecting unique angle...")
    angle = detect_angle(topic["title"], transcripts)
    result["angle"] = angle
    if not angle or not angle.get("proposed_angle"):
        result["error"] = "Angle detection failed"
        print("  ❌ Angle detection failed")
        return result
    print(f"  ✅ Angle: {angle['proposed_angle']}")
    print(f"     Type: {angle.get('angle_type', 'N/A')}")
    print(f"     Hook: {angle.get('proposed_hook', 'N/A')}")

    # Step 3: Script writing
    print("\n✍️  Writing script...")
    script = write_script(topic["title"], angle)
    result["script"] = script
    if not script or len(script) < 100:
        result["error"] = "Script writing failed"
        print("  ❌ Script writing failed")
        return result
    word_count = len(script.split())
    print(f"  ✅ Script: {word_count} words")

    # Step 4: Plagiarism check
    print("\n🔍 Checking plagiarism...")
    plagiarism = check_plagiarism(script, transcripts)
    result["plagiarism"] = plagiarism
    if plagiarism:
        sim = plagiarism.get("overall_similarity_percent", "?")
        verdict = plagiarism.get("verdict", "?")
        print(f"  {'✅' if verdict == 'PASS' else '❌'} Similarity: {sim}% — {verdict}")
    else:
        print("  ⚠️  Plagiarism check returned no result")

    # Step 5: Store in DB
    similarity = plagiarism.get("overall_similarity_percent", 0) if plagiarism else None
    conn = db.get_connection()
    conn.execute(
        """INSERT INTO scripts (topic_id, script_text, similarity_score, similarity_report, status)
           VALUES (?, ?, ?, ?, ?)""",
        (topic_id, script, similarity,
         json.dumps(plagiarism) if plagiarism else None,
         "approved" if plagiarism and plagiarism.get("verdict") == "PASS" else "needs_review")
    )
    # Update topic with angle info
    conn.execute(
        "UPDATE topics SET proposed_angle=?, proposed_hook=?, angle_type=? WHERE id=?",
        (angle.get("proposed_angle"), angle.get("proposed_hook"), angle.get("angle_type"), topic_id)
    )
    conn.commit()
    conn.close()

    print(f"\n{'='*60}")
    print(f"✅ Processing complete for: {topic['title']}")
    print(f"   Angle: {angle['proposed_angle']}")
    print(f"   Script: {word_count} words")
    print(f"   Plagiarism: {plagiarism.get('overall_similarity_percent', '?')}% — {plagiarism.get('verdict', '?')}")
    print(f"{'='*60}")

    return result


def process_topic_with_feedback(topic_id, feedback, old_script_text=None):
    """Rewrite a script with specific user feedback.

    Uses the existing angle but rewrites the script incorporating feedback.
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
        # User wants new angle — re-detect
        print("   🎯 Detecting new angle...")
        transcripts = fetch_transcripts(topic["title"])
        if transcripts:
            angle = detect_angle(topic["title"], transcripts)
    else:
        # Keep existing angle
        angle = {
            "proposed_angle": topic.get("proposed_angle", ""),
            "angle_type": topic.get("angle_type", ""),
            "proposed_hook": topic.get("proposed_hook", ""),
            "key_differentiators": [],
        }

    if not angle:
        result["error"] = "Could not determine angle"
        return result

    # Build rewrite prompt with feedback
    template = _load_prompt("script-writing")
    prompt = (
        template
        .replace("{topic}", topic["title"])
        .replace("{angle}", angle.get("proposed_angle", ""))
        .replace("{angle_type}", angle.get("angle_type", ""))
        .replace("{hook}", angle.get("proposed_hook", ""))
        .replace("{differentiators}", "\n".join(f"- {d}" for d in angle.get("key_differentiators", [])))
    )

    # Add feedback block
    prompt += f"\n\nUSER FEEDBACK ON PREVIOUS SCRIPT (MUST address this):\n{feedback}\n"

    if old_script_text:
        prompt += f"\nPREVIOUS SCRIPT (rewrite this, addressing the feedback above):\n{old_script_text[:2000]}\n"

    # Add variety block
    variety_block = _build_variety_block()
    if variety_block:
        prompt += variety_block

    # Generate
    print("   ✍️ Writing new script...")
    script = _call_claude(prompt, config.SONNET_MODEL)
    if script:
        script = _preprocess_for_tts(script)

    if not script or len(script) < 100:
        result["error"] = "Script generation failed"
        return result

    result["script"] = script
    result["angle"] = angle
    word_count = len(script.split())
    print(f"   ✅ New script: {word_count} words")

    # Store
    conn = db.get_connection()
    conn.execute(
        "INSERT INTO scripts (topic_id, script_text, status) VALUES (?, ?, 'draft')",
        (topic_id, script)
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
    # Test: process the top-scored topic
    candidates = db.get_top_candidates(1)
    if candidates:
        result = process_topic(candidates[0]["id"])
        print("\n" + json.dumps(result, indent=2, default=str)[:2000])
    else:
        print("No candidates found. Run run_pipeline.py first.")
