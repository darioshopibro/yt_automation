"""Topic extractor — LLM-based clustering via Claude CLI."""

import subprocess
import json
import re


def extract_topics(items):
    """Group raw scanner items by topic using Claude LLM.

    Args:
        items: list of dicts with 'title', 'source_type', 'source_detail'

    Returns:
        list of topic groups: [{"topic": "...", "items": [indices], "item_count": N}]
    """
    if not items:
        return []

    title_list = "\n".join(
        f"{i+1}. [{item['source_type']}/{item.get('source_detail', '')}] {item['title']}"
        for i, item in enumerate(items)
    )

    prompt = f"""You are a topic clustering engine for a TECH YOUTUBE CHANNEL. Below are {len(items)} titles from various tech sources.

Group them by SPECIFIC TOPIC. Two titles are the same topic if they discuss the same underlying subject, even if they use completely different words.

CRITICAL RULES:
- Topics must be SPECIFIC and ACTIONABLE for a tech YouTube video. "Docker Security Vulnerabilities" is good. "Miscellaneous" or "Consumer Hardware" is BAD.
- NEVER create vague catch-all groups like "Miscellaneous", "Other", "General Tech", "Various". If an item doesn't fit, leave it ungrouped.
- NEVER create broad categories like "Hardware", "Software", "Science". Be specific: "AMD's New 208MB Cache CPU" not "Hardware".
- Each topic should be specific enough to be a single YouTube video title
- Group only items that are truly about the SAME specific thing
- A group can have 1 item if the topic is unique — that's fine
- Filter OUT non-tech items (sports, weather, celebrities) — skip them entirely
- Return ONLY valid JSON array, no markdown, no code fences

Titles:
{title_list}

Return JSON array:
[{{"topic": "Specific Topic Name", "items": [1, 2, 5], "item_count": 3}}]"""

    result = subprocess.run(
        ["claude", "-p", prompt, "--model", "claude-haiku-4-5-20251001", "--output-format", "text"],
        capture_output=True, text=True, timeout=300
    )

    response = result.stdout.strip()

    # Extract JSON from response (may have markdown fences)
    json_match = re.search(r'\[[\s\S]*\]', response)
    if not json_match:
        return []

    try:
        groups = json.loads(json_match.group())
    except json.JSONDecodeError:
        return []

    # Convert 1-indexed items to 0-indexed
    for group in groups:
        group["items"] = [i - 1 for i in group["items"] if 0 < i <= len(items)]
        group["item_count"] = len(group["items"])

    return groups


def build_topics_with_sources(groups, all_items):
    """Convert topic groups into topic dicts with their source items.

    Returns:
        list of: {"title": "...", "slug": "...", "sources": [...]}
    """
    topics = []
    for group in groups:
        if not group["items"]:
            continue

        slug = re.sub(r'[^a-z0-9]+', '-', group["topic"].lower()).strip('-')

        sources = []
        for idx in group["items"]:
            if 0 <= idx < len(all_items):
                sources.append(all_items[idx])

        topics.append({
            "title": group["topic"],
            "slug": slug,
            "sources": sources,
        })

    return topics
