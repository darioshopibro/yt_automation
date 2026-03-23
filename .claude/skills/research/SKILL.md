---
name: research
description: Research topics online using BOTH web search AND YouTube. Use when user says "research this", "check online", "search online", "look up", "how is this done", "find out how", "what's the best way to", or wants to learn how others solve a problem.
---

# Research Skill

Combines **web search** + **YouTube deep research** for comprehensive results.

## When to Use

Trigger on phrases like:
- "research how to..."
- "check online for..."
- "search online..."
- "look up how..."
- "how do people usually..."
- "what's the best way to..."
- "find tutorials on..."

## Research Process

### Step 1: Web Search (ALWAYS do this)

Use the built-in WebSearch tool:
```
WebSearch tool with query: "your topic here"
```
Gets: docs, blogs, Stack Overflow, official guides, articles.

### Step 2: YouTube Deep Research (ALWAYS do this)

**NEW: One command does everything!**

```bash
python3 .claude/skills/research/scripts/research.py "your topic here"
```

This single command:
1. Searches YouTube (10 results)
2. Ranks by relevance (views + duration + title match)
3. Fetches transcripts for top 3 videos (in parallel!)
4. Returns everything in one JSON response

**Options:**
```bash
# More results
python3 .claude/skills/research/scripts/research.py "query" --results 15

# More transcripts
python3 .claude/skills/research/scripts/research.py "query" --transcripts 5

# Quick search only (no transcripts)
python3 .claude/skills/research/scripts/research.py "query" --no-transcripts
```

## Output Format

Present findings like this:

```markdown
## Web Results
- [Title](url) - what it covers
- [Title](url) - what it covers

## YouTube Results (Top 10)
| Rank | Video | Channel | Views | Duration |
|------|-------|---------|-------|----------|
| 1 | [Title](url) | Channel | 100K | 15:30 |
| 2 | [Title](url) | Channel | 50K | 20:00 |

## Video Transcripts (Top 3)

### 1. Video Title
Key points from transcript...

### 2. Video Title
Key points from transcript...

## Key Takeaways
1. Main insight
2. Main insight
3. Recommendation
```

## Scripts Reference

| Script | Purpose | Command |
|--------|---------|---------|
| `research.py` | **Full research** (search + rank + transcripts) | `python3 .claude/skills/research/scripts/research.py "query"` |
| `search.py` | Quick YouTube search only (10 results) | `python3 .claude/skills/research/scripts/search.py "query"` |
| `transcript.py` | Get single video transcript | `python3 .claude/skills/research/scripts/transcript.py "URL"` |

## Example

User: "research how to build voice booking agents"

Do:
1. WebSearch: "voice booking agent AI 2025"
2. YouTube: `python3 .claude/skills/research/scripts/research.py "voice AI booking agent tutorial"`
3. Summarize both web and YouTube findings
