---
name: meme-researcher
description: |
  Research trending and evergreen memes for video content. Fetches from Reddit r/ProgrammerHumor + Imgflip.
  Returns categorized memes with usage context for the visual planner.
  Runs PARALLEL with content pipeline — does not block anything.

  Triggers: "find memes", "meme research", "what memes are trending", "visual humor"
---

# Meme Researcher

Fetches memes from Reddit + Imgflip for use in video content.

## Quick Use

```bash
python3 .claude/skills/meme-researcher/scripts/fetch_memes.py "AI coding"
```

## Output

`memes_{topic}.json` with:
- `evergreen_templates` — Imgflip top 30 (Drake, This Is Fine, etc.)
- `trending_programmer` — Reddit r/ProgrammerHumor hot posts
- `topic_specific` — Reddit search for topic-related memes
- `tech_evergreen_suggestions` — 15 pre-defined meme formats that work for ANY tech topic

## Integration

Visual planner reads memes.json and decides WHERE to place them based on:
- Script beat type (joke → reaction image, comparison → Drake format)
- Pacing rules (max 1 meme per 20 seconds, never during critical explanations)
- Format preset (fast_explainer: 4-6 per video, tutorial: 1-3)
