---
name: review-analyzer
description: "Analyze video review markers across all projects to find recurring quality problems, then propose specific improvements to the visual generation system. Use when user says 'analyze reviews', 'find patterns', 'what needs improving', 'system weaknesses', or 'improve quality'."
---

# Review Analyzer — Find Patterns, Propose Fixes

You analyze accumulated video review markers (good/bad/missing) to find **systematic weaknesses** in the visual generation pipeline, then propose targeted improvements.

## Step 0: Collect Data

1. Scan all `videos/*/review.json` files
2. For each, read markers: type, comment, startFrame, endFrame
3. Also read the corresponding segment code (Generated_*.tsx) for bad markers
4. Count totals: how many good, bad, missing across all projects

**Report:** "Found X markers across Y projects (G good, B bad, M missing)"

## Step 1: Categorize Bad Markers

Group every bad/missing marker into categories by analyzing comments:

| Category | Signal words |
|----------|-------------|
| **animation** | static, no movement, boring, still, frozen |
| **layout** | too many, crowded, overlapping, small, cluttered |
| **timing** | too fast, too slow, desync, early, late |
| **visual-type** | wrong type, should be X not Y, doesn't fit |
| **content** | missing info, wrong data, unclear, confusing |
| **style** | ugly, colors, font, looks bad, inconsistent |

Read `reference/analysis-framework.md` for full categorization.

## Step 2: Find Patterns

A pattern = same category appears **3+ times** across different projects.

For each pattern:
1. List all markers that match
2. Quote the user's comments
3. Read 1-2 of the actual bad Generated_*.tsx files to understand what went wrong
4. Compare with good examples in `reference/good-examples/` to see the difference

## Step 3: Propose Improvements

For each pattern, generate ONE specific recommendation:

```
TITLE: [Clear name for the problem]
SEVERITY: high / medium / low
OCCURRENCES: [count] across [projects]
EVIDENCE: [quote 2-3 user comments]
PROBLEM: [What exactly is wrong in the generated code]
FIX: [Specific, actionable change]
TARGET: [Exact file to modify, e.g., generation-rules.md line ~45]
IMPACT: [1-10, how much this improves overall quality]
```

## Step 4: ASK Before Applying

**CRITICAL: NEVER apply changes automatically.**

Present ALL recommendations as a numbered list. Then ask:

> "These are the patterns I found. Which ones should I apply?
> Type the numbers (e.g., 1, 3, 5) or 'all' or 'none'."

Wait for user response.

## Step 5: Apply Approved Fixes

For each approved recommendation:
1. Read the target file
2. Make the specific change (add rule, modify rule, add example)
3. Show the diff
4. Save to `workspace/improvements.json` with status: "applied"

## Step 6: Save Report

Write full analysis to `workspace/improvements.json`:

```json
{
  "analyzedAt": "2026-04-04",
  "videosAnalyzed": 5,
  "totalMarkers": { "good": 12, "bad": 18, "missing": 5 },
  "recommendations": [
    {
      "id": "rec-1",
      "title": "...",
      "category": "animation",
      "severity": "high",
      "occurrences": 8,
      "evidence": ["project:marker_id - comment", ...],
      "problem": "...",
      "fix": "...",
      "targetFile": "...",
      "impactScore": 9,
      "status": "applied" | "pending" | "rejected"
    }
  ]
}
```

## Rules

- ALWAYS ask before changing any file
- Be specific — "add animation" is bad, "every element needs spring() fade-in with damping >= 15 in first 10 frames" is good
- Show evidence — quote user comments, reference specific files
- Don't invent problems — if there are only 2 bad markers about layout, that's not a pattern yet
- Compare bad vs good — when proposing a fix, show what the good examples do differently
- Max 10 recommendations per analysis — focus on highest impact
- Read `reference/analysis-framework.md` for scoring methodology
