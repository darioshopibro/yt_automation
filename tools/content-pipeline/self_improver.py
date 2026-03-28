"""Self-improvement engine — scans trends for our own stack upgrades."""

import subprocess
import json
import re
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import config
import db

PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "prompts")
STACK_FILE = os.path.join(os.path.dirname(__file__), "our_stack.json")


def analyze_for_improvements(all_items):
    """Scan today's items for things relevant to our stack.

    Args:
        all_items: list of scanner items from today's scan

    Returns:
        list of improvement suggestions
    """
    # Load our stack
    with open(STACK_FILE) as f:
        stack = json.load(f)

    # Build items summary (titles + sources only, keep it compact)
    items_text = "\n".join(
        f"- [{item.get('source_type', '')}/{item.get('source_detail', '')}] "
        f"{item.get('title', '')} (url: {item.get('url', 'N/A')})"
        for item in all_items[:150]  # cap at 150 to stay within token limits
    )

    stack_text = json.dumps(stack, indent=2)

    # Load prompt template
    with open(os.path.join(PROMPTS_DIR, "self-improvement.md")) as f:
        template = f.read()

    prompt = template.replace("{items}", items_text).replace("{stack}", stack_text)

    # Call Claude (Haiku — cheap, this is classification)
    result = subprocess.run(
        ["claude", "-p", prompt, "--model", config.HAIKU_MODEL, "--output-format", "text"],
        capture_output=True, text=True, timeout=120
    )

    response = result.stdout.strip()
    json_match = re.search(r'\[[\s\S]*\]', response)
    if not json_match:
        return []

    try:
        improvements = json.loads(json_match.group())
    except json.JSONDecodeError:
        return []

    # Store in DB
    conn = db.get_connection()
    for imp in improvements:
        conn.execute(
            """INSERT INTO improvements (title, description, category, source_url, status)
               VALUES (?, ?, ?, ?, 'suggested')""",
            (imp.get("title", ""), imp.get("description", ""),
             imp.get("category", ""), imp.get("source_url", ""))
        )
    conn.commit()
    conn.close()

    return improvements


def format_improvements_telegram(improvements):
    """Format improvements for Telegram digest."""
    if not improvements:
        return ""

    lines = ["\n🔧 <b>Self-Improvement Suggestions:</b>\n"]
    for i, imp in enumerate(improvements):
        icon = {"update": "⬆️", "alternative": "🔄", "new_capability": "🆕", "competitive_intel": "🔍"}.get(imp.get("category"), "💡")
        lines.append(f"{icon} <b>{imp.get('title', 'N/A')}</b>")
        lines.append(f"   {imp.get('description', '')}")
        lines.append("")

    return "\n".join(lines)


if __name__ == "__main__":
    # Test with items from last scan
    conn = db.get_connection()
    # Get all topic sources as a proxy for scanned items
    rows = conn.execute(
        "SELECT title, source_type, source_url as url FROM topic_sources ORDER BY id DESC LIMIT 100"
    ).fetchall()
    conn.close()

    items = [dict(r) for r in rows]
    if items:
        print(f"Analyzing {len(items)} items for stack improvements...")
        improvements = analyze_for_improvements(items)
        print(f"Found {len(improvements)} suggestions:")
        for imp in improvements:
            print(f"  {imp.get('category', '?')}: {imp.get('title', 'N/A')}")
            print(f"    {imp.get('description', '')}")
    else:
        print("No items found. Run run_pipeline.py first.")
