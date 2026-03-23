---
name: solve
description: Auto-trigger when exploring solutions, debugging problems, comparing approaches, or deciding between options. Automatically researches, ranks, and scores solutions.
---

# Problem Solver Skill

**Auto-triggers when:**
- There's a problem/error to solve
- Exploring different approaches
- Deciding between options
- Debugging something
- User says "how should we...", "what's the best way...", "how do others..."
- Comparing solutions or approaches

## Auto-Trigger Phrases

Activate this skill when you detect:
- "how do we solve this"
- "what are our options"
- "how should we approach"
- "what's the best way to"
- "need to figure out"
- "comparing options"
- "which approach is better"
- "how do others do this"
- "is there a better way"
- Errors, bugs, or problems being discussed
- Multiple possible solutions being considered

## Process (Do This Automatically)

### Step 1: Define the Problem
Clearly state what we're trying to solve in one sentence.

### Step 2: Research Solutions
Use the research skill:
```bash
python3 .claude/skills/research/scripts/research.py "problem description solution"
```
AND WebSearch for docs/articles.

### Step 3: Identify Options
List 3-5 possible solutions/approaches found.

### Step 4: Score Each Option

Rate each solution on these criteria (1-10):

| Criteria | Description |
|----------|-------------|
| **Effort** | How hard to implement (10 = easy) |
| **Reliability** | How likely to work (10 = very reliable) |
| **Maintainability** | Easy to maintain long-term (10 = easy) |
| **Fit** | How well it fits our stack/workflow (10 = perfect fit) |

**Total Score** = average of all criteria

### Step 5: Present Ranked Solutions

Output format:
```markdown
## Problem
[One sentence description]

## Solutions Found

### 1. [Solution Name] - Score: X.X/10 ⭐ RECOMMENDED
| Criteria | Score |
|----------|-------|
| Effort | X/10 |
| Reliability | X/10 |
| Maintainability | X/10 |
| Fit | X/10 |

**Pros:**
- Pro 1
- Pro 2

**Cons:**
- Con 1

**How to implement:** Brief steps

---

### 2. [Solution Name] - Score: X.X/10
[Same format...]

---

## My Recommendation
[Which solution and why, based on our specific situation]
```

## Example

User: "The webhook keeps timing out, how do we fix this?"

Auto-trigger → Research → Find solutions → Score:

```
## Problem
Webhook timing out before processing completes.

## Solutions Found

### 1. Async Processing with Queue - Score: 9.0/10 ⭐ RECOMMENDED
| Criteria | Score |
|----------|-------|
| Effort | 8/10 |
| Reliability | 10/10 |
| Maintainability | 9/10 |
| Fit | 9/10 |

**Pros:** Industry standard, handles any load, n8n has queue support
**Cons:** Slightly more complex setup

### 2. Increase Timeout - Score: 6.5/10
...

## My Recommendation
Use async queue - it's the proper fix, not a band-aid.
```

## Important

- **Always research first** - don't just guess solutions
- **Score objectively** - based on our tech stack (n8n, OpenClaw, etc.)
- **Recommend ONE** - don't leave user deciding between equal options
- **Be specific** - include implementation steps
