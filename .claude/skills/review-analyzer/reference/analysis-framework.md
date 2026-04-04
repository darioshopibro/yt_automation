# Analysis Framework — How to Score and Categorize

## Categories

### animation (weight: HIGH)
Bad signals: "static", "no movement", "boring", "still", "frozen", "nothing happens", "no animation", "just appears"
Good signals: "smooth", "progressive", "builds up", "nice transition", "flows"
What to check in code: Does element use spring(), interpolate(), fade-in? Or just renders immediately?

### layout (weight: HIGH)
Bad signals: "too many", "crowded", "cluttered", "overlapping", "can't read", "too small", "messy"
Good signals: "clean", "clear", "readable", "good spacing", "organized"
What to check in code: How many elements visible at once? Grid vs absolute? Spacing values?

### timing (weight: MEDIUM)
Bad signals: "too fast", "too slow", "out of sync", "appears before narrator says it", "late"
Good signals: "perfectly timed", "synced", "natural pace"
What to check in code: Does element use timestamp-based animation? Or hardcoded frames?

### visual-type (weight: MEDIUM)
Bad signals: "wrong visual", "should be X", "doesn't make sense for this", "bar chart for this?"
Good signals: "perfect choice", "great metaphor", "makes sense"
What to check: Is the visual type appropriate for the content being explained?

### content (weight: LOW-MEDIUM)
Bad signals: "missing info", "wrong data", "incomplete", "confusing labels"
Good signals: "accurate", "complete", "clear labels"
What to check: Does the visual show the right information from the transcript?

### style (weight: LOW)
Bad signals: "ugly", "bad colors", "font too small", "inconsistent"
Good signals: "looks professional", "polished", "consistent"
What to check: Colors, fonts, sizes match the design system?

## Severity Scoring

**HIGH** (8-10 impact): Problem appears in 5+ markers, affects viewer understanding
**MEDIUM** (5-7 impact): Problem appears in 3-4 markers, affects visual quality
**LOW** (1-4 impact): Problem appears in 2-3 markers, cosmetic issue

## Pattern Detection

Minimum threshold: **3 occurrences** across **2+ different projects**

When grouping markers:
1. Read all bad marker comments
2. Cluster by keyword similarity (not exact match — "static" and "no animation" are same cluster)
3. For each cluster with 3+ markers, create a recommendation
4. Sort by: severity * occurrences (highest first)

## Fix Quality Checklist

Before proposing a fix, verify:
- [ ] Is it specific enough to implement? (not vague like "make it better")
- [ ] Does it conflict with existing rules in generation-rules.md?
- [ ] Can you point to a good example that already does this correctly?
- [ ] Is the target file correct? (generation-rules.md vs SKILL.md vs reference/)
- [ ] Will this fix cover most occurrences of this pattern?

## Comparing Bad vs Good

When analyzing a bad segment:
1. Read the bad Generated_*.tsx
2. Find a good example of similar content
3. Identify the specific code difference
4. The fix should bridge that gap

Example:
- Bad: Elements render with opacity: 1 immediately
- Good: Elements use `spring(frame - appearFrame, { damping: 15 })` for entrance
- Fix: "Rule: Every element MUST have entrance animation using spring() or interpolate()"
