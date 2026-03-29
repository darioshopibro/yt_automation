# Gemini AI Studio — Prompt za Video Analizu

Kopiraj ovaj prompt u Gemini AI Studio kad uploaduješ Greg Isenberg video.

---

## PROMPT (kopiraj ovo):

```
Analyze this video frame-by-frame and give me an extremely detailed breakdown. I need to understand EXACTLY how to recreate this style of motion graphics.

For EACH SCENE in the video, describe:

## 1. ELEMENTS ON SCREEN
- What visual elements are present? (cards, icons, badges, text blocks, grid backgrounds, arrows, lines)
- Exact colors used (hex codes if possible)
- Font style (bold, thin, serif, sans-serif, size relative to screen)
- Shadows (drop shadow, inner shadow, 3D perspective shadow)
- Background (solid color, gradient, grid pattern, dotted, textured)
- Border radius, padding, spacing between elements
- Any glassmorphism, blur, or transparency effects

## 2. TRANSITIONS (MOST IMPORTANT)
For EVERY transition between scenes:
- Type: expand, split, morph, fly-in, fly-out, rotate, zoom, scale, slide, dissolve, flip, fold, bounce, elastic
- Direction: left-to-right, top-to-bottom, center-out, etc.
- Duration: estimate in seconds (e.g., "~1.5 seconds")
- What element STARTS as and what it ENDS as (e.g., "single card expands into 3 smaller cards")
- Any 3D perspective changes during transition
- Easing: linear, ease-in, ease-out, bounce, elastic, spring
- Do elements maintain their identity during transition or completely transform?

## 3. TIMING
- How long is each scene visible before transitioning? (seconds)
- How long is each transition? (seconds)
- Is there overlap between scenes (cross-fade) or hard cuts?
- Total video duration

## 4. CAMERA/VIEWPORT
- Does the camera pan, zoom, or stay static?
- Any parallax effects (foreground vs background moving at different speeds)?
- Viewport: fullscreen or contained within a frame?

## 5. AUDIO SYNC (if applicable)
- Are transitions synced with voiceover beats?
- Any sound effects on transitions (whoosh, pop, click)?
- Background music style and tempo

## 6. ELEMENT CONSISTENCY
- Do the same colors/fonts/styles repeat across all scenes?
- Is there a consistent grid or layout system?
- How many unique "element types" are there in the whole video?

FORMAT: Give me a timestamped breakdown:
- [0:00-0:03] Scene 1: description...
- [0:03-0:03.5] Transition: description...
- [0:03.5-0:07] Scene 2: description...
...and so on for the ENTIRE video.

At the end, give me a SUMMARY of:
- All unique transition types used
- All unique element types used
- Color palette (list of hex codes)
- Average scene duration
- Average transition duration
- Overall style description in 2-3 sentences
```

---

## TIPS:
- Uploaduj video direktno (ne screenshot)
- Ako Gemini propusti detalje, pitaj follow-up: "You missed the transition at 0:15 - describe it in more detail"
- Za svaki video sačuvaj output u `research/greg-analysis/video-{N}.md`
- Posle svih videa, napravićemo master-patterns.md iz svih analiza
