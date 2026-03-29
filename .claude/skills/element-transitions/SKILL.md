---
name: Element Transitions
description: Creates animated transitions/connections between Remotion elements. Use when connecting Element A to Element B in motion graphics, morphing, or transforming elements into each other. Triggers research before implementing any new effect.
---

# Element Transitions

## When to use
- Element A needs to become/connect to Element B
- Morphing between shapes
- Elements merging
- Any visual flow between steps in explainer videos

## Workflow

### STEP 1: Read the guide
Read `research/element-transitions-guide.md` — contains all proven rules, patterns, what works/doesn't.

### STEP 2: Check if effect type exists
Look at `workspace/short-poc/src/GregV2.tsx` for proven implementations (blob, gooey, grain).

### STEP 3: If NEW effect type → RESEARCH FIRST
**NEVER implement a new effect by guessing.** Always:
1. WebSearch for: `"[effect name] javascript canvas/SVG tutorial implementation"`
2. YouTube search: `python3 .claude/skills/research/scripts/research.py "[effect name] animation tutorial"`
3. Find CodePen examples, extract exact algorithms and parameters
4. Understand performance implications for Remotion (frame-by-frame, no Math.random)
5. THEN implement based on research

### STEP 4: Apply universal rules (ALL transitions)
1. Source element DELETES when transition starts
2. Start from BOTTOM EDGE of source element
3. End at CENTER of target element
4. Target grows INSTANTLY when transition arrives (zero delay)
5. `morphProgress` tied to `transitionProgress` — not separate timer
6. Always add film grain overlay (`feTurbulence seed={frame}`)
7. Use Remotion `random()` never `Math.random()`
8. Unique SVG filter IDs per instance
9. Different spring presets for different phases (see guide)

### STEP 5: Add visual polish
- Gooey SVG filter on merge moments
- Neon glow on moving elements (layered blur)
- Film grain on scene
- `globalCompositeOperation: 'lighter'` for additive bloom (Canvas)

## Reference
- `research/element-transitions-guide.md` — rules, what works/doesn't, SVG effects, spring presets
- `workspace/short-poc/src/GregV2.tsx` — proven blob+trail+gooey+grain implementation
