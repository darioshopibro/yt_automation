# Prompt Playbook — Greg Isenberg Style Motion Graphics

> Datum: 2026-03-29
> Bazirano na: master-patterns.md (7 videa) + model research (7 modela)
> Top 3 modela za testiranje: Kling 3.0, Luma Ray3.14, Pika 2.2

---

## SECTION A: GPT Image Frame Generation

Ovi prompt-ovi generišu START i END frame-ove u Greg Isenberg stilu.
Koristi GPT Image 1.5 (ili DALL-E 3) sa ovim template-ovima.

### Master Style Prompt (dodaj na SVAKI prompt)

```
Style: Clean modern "bento box" UI aesthetic. Off-white background (#F0F0F0).
Deep forest green (#1E3A2F) for all UI elements, cards, and text.
Soft mint green (#80C2A0) for light accents.
Muted coral red (#DE6B58) for highlights only.
Heavy soft drop shadows on all floating elements (direction: bottom-right, blur 20px, rgba(0,0,0,0.18)).
All cards have rounded corners (border-radius 16px).
Pills/badges are fully rounded (border-radius 50%).
Bold serif font for large text, clean sans-serif for UI labels.
No gradients. Flat colors with 3D depth from shadows only.
9:16 vertical aspect ratio for TikTok/Shorts.
```

### Frame Pair Prompts po Tranziciji

#### 1. PILL → CARD MORPH (Najčešća tranzicija)

**START frame:**
```
[Master Style] A single small dark green (#1E3A2F) pill-shaped badge
centered on the screen. White text inside reads "[TOPIC]".
The pill has a heavy soft drop shadow. Off-white background with
subtle dot grid pattern. Nothing else on screen.
```

**END frame:**
```
[Master Style] A large dark green (#1E3A2F) rounded rectangle card
(takes up ~60% of screen width) centered on screen. Inside the card:
a white document icon at top, white title text "[TOPIC]", and 3-4
white horizontal skeleton lines representing content. Heavy soft
drop shadow. Off-white background with subtle dot grid pattern.
```

#### 2. CARD SPLIT (Jedna kartica → više manjih)

**START frame:**
```
[Master Style] One large dark green card centered on screen,
containing the title "[TOPIC]" in white text. Heavy drop shadow.
Off-white background.
```

**END frame:**
```
[Master Style] Three smaller dark green cards arranged in a
horizontal row with equal spacing. Each card has a white icon
and label: "[Item 1]", "[Item 2]", "[Item 3]". All cards have
drop shadows. Thin dotted green lines connect them at the top.
Off-white background.
```

#### 3. FLOWCHART BUILD (Linije + Badge-ovi)

**START frame:**
```
[Master Style] A single dark green pill badge at the top center
of screen with white text "[START]". Off-white background.
Nothing else.
```

**END frame:**
```
[Master Style] A vertical flowchart: dark green pill badge
"[START]" at top. Dark green dotted lines (2px, 8px gap) draw
downward, branching into 3 paths. Each path ends at a dark green
pill badge with white icon and label: "[Step 1]", "[Step 2]",
"[Step 3]". All badges have drop shadows. Off-white background.
```

#### 4. RADIAL EXPLOSION (Stek → Mind Map)

**START frame:**
```
[Master Style] A stack of 5 small dark green cards piled on top
of each other in the center, slightly offset (like a messy deck).
A translucent green container/tray shape holds them.
Off-white background.
```

**END frame:**
```
[Master Style] 5 dark green pill badges arranged in a radial/circular
pattern around a central glowing mint green (#61D095) starburst shape.
White dotted lines connect each badge to the center starburst.
Badges are evenly spaced. Off-white background.
```

#### 5. PHYSICS STACKING (Elementi padaju u kontejner)

**START frame:**
```
[Master Style] An empty dark green 3D container/bin in the center
of the screen. 4-5 small dark green cards with white labels floating
above it, scattered at different heights. Off-white background.
```

**END frame:**
```
[Master Style] The same dark green 3D container/bin, now filled
with 4-5 neatly stacked cards inside it. Cards are aligned and
organized. Off-white background.
```

#### 6. 3D OBJECT → 2D CARD (Premium tranzicija)

**START frame:**
```
[Master Style] A 3D rendered [OBJECT] (e.g., porcelain bowl, laptop,
globe) floating in center of screen with dramatic soft lighting.
Subtle green glow (#61D095) around the object.
Off-white background with depth.
```

**END frame:**
```
[Master Style] A flat 2D dark green card centered on screen containing
a white icon version of the [OBJECT] and a white text label below it.
Standard drop shadow. Off-white background. Completely flat, no 3D.
```

#### 7. FUNNEL / SQUEEZE

**START frame:**
```
[Master Style] Three user avatar circles (dark green with white
silhouettes) arranged horizontally at the top of screen.
A large, translucent red (#DE6B58) funnel shape positioned
below them, wide opening at top. Off-white background.
```

**END frame:**
```
[Master Style] The same red funnel, but now the three avatars
are squeezed down to the narrow bottom of the funnel, compressed
together. Below the funnel: a single dark green pill badge
reading "Output". Off-white background.
```

#### 8. CROSS-SECTION REVEAL

**START frame:**
```
[Master Style] A solid dark green 3D rectangular pedestal/column
in the center. A small object sits on top. Off-white background.
The pedestal looks solid and opaque.
```

**END frame:**
```
[Master Style] The same pedestal but with the front face removed
(cross-section view). Inside: visible mint green (#80C2A0) pipes,
connectors, and small grey steam/leak effects. A black wrench icon
sits next to the exposed pipes. Off-white background.
```

#### 9. ASSEMBLY LINE / CONVEYOR

**START frame:**
```
[Master Style] A vertical smartphone outline (dark green border)
in the center. A dark green block with white text "Input" sits
above the phone, ready to enter from the top. Off-white background.
```

**END frame:**
```
[Master Style] The same vertical smartphone outline. The block has
passed through and exits at the bottom, now labeled "Output" with
a green checkmark. Inside the phone: a green progress line shows
processing is complete. A counter "03" appears next to the phone.
Off-white background.
```

#### 10. KINETIC TYPOGRAPHY (Sa voiceover-om)

**START frame:**
```
[Master Style] Live-action speaker photo (blurred/darkened slightly)
as background. No text overlay yet. Clean composition.
```

**END frame:**
```
[Master Style] Same speaker photo background. Bold dark green serif
words floating around the speaker's head: "[word1]", "[word2]",
"[word3]", "[word4]". Each word has a subtle drop shadow.
Words are arranged at different angles/positions around the face.
```

---

## SECTION B: Model-Specific Motion Prompts

### KLING 3.0 — Prompt Template

**Struktura:** `[Motion opis]. [Stil]. [Kamera].`
**Negativan prompt:** `low clarity, blurriness, text distortion, unbalanced layout, overly dark colors`
**Settings:** Duration 5s, Mode Standard (za iteraciju) / Professional (za final), Motion Intensity 5, Seed: ISTI za sve clipove u videu
**CFG Scale:** 0.5 (default)

| Tranzicija | Kling Motion Prompt |
|------------|-------------------|
| Pill→Card Morph | `A small rounded green pill badge smoothly expands vertically and horizontally into a large rectangular card with rounded corners. Soft drop shadow grows as the card expands. Content text lines fade in inside the card. Clean white background. Smooth elastic motion with slight overshoot bounce.` |
| Card Split | `A single large green card in the center smoothly splits into three smaller cards that slide outward to arrange in a horizontal row. Thin dotted lines appear connecting them at the top. Spring physics with bounce. Clean minimal style.` |
| Flowchart Build | `From a single badge at the top, dotted lines draw themselves downward branching into three paths. At each endpoint, a green badge pops into existence with a bouncy spring animation. Sequential timing - each badge appears as the line reaches it.` |
| Radial Explosion | `A stack of cards in the center suddenly explodes outward radially. Cards fly to evenly spaced positions in a circle. Dotted lines draw from each card back to a glowing starburst that appears in the center. Elastic spring physics.` |
| Physics Fall | `Green cards fall from the top of the frame with realistic gravity, landing and stacking neatly inside a container below. Each card bounces slightly on impact. Clean physics simulation.` |
| 3D→2D Morph | `A three-dimensional rendered object smoothly flattens and simplifies into a flat 2D icon card. The depth and volume compress while maintaining the silhouette shape. Shadows transition from 3D lighting to flat drop shadow.` |
| Data Ingestion | `Small floating data cards fall downward with gravity acceleration and get absorbed into a central icon, disappearing as they touch it. The icon pulses slightly with each absorption. Clean minimal background.` |
| Funnel Squeeze | `A large translucent funnel drops from above. Three circular avatars get pulled into the wide opening and squeezed down through the narrow bottom. They compress and merge into a single output badge below.` |
| Camera Pan Down | `Smooth vertical camera pan downward revealing new content area. Elements in the new area pop in with spring bounce as they enter the viewport. Steady, cinematic ease-in-out movement.` |

### LUMA RAY3.14 — Prompt Template

**Struktura:** `[Subject] -> [Action] -> [Details] -> [Scene] -> [Camera]`
**Settings:** Duration 5s, Model ray-3-14 (ili ray-2 za keyframes), Aspect 9:16
**Napomena:** Avoid "vibrant", "whimsical", "hyper-realistic" — degradiraju output

| Tranzicija | Luma Motion Prompt |
|------------|------------------|
| Pill→Card Morph | `A dark green pill badge expands into a large rectangular card. The expansion is smooth with elastic bounce. White content lines appear inside. Minimal off-white background. Static camera.` |
| Card Split | `A single centered card splits into three smaller cards sliding horizontally apart. Dotted connecting lines draw between them. Spring physics, bouncy movement. Static camera, clean background.` |
| Flowchart Build | `Dotted lines draw themselves downward from a top badge, branching into three paths. Green badges pop in at each endpoint with bounce. Sequential timing, clean flow. Static camera.` |
| Radial Explosion | `Stacked cards burst outward from center into a circular arrangement. Connecting lines draw to a central glowing star. Fast elastic motion. Static camera, minimal background.` |
| 3D→2D Morph | `A three-dimensional object flattens smoothly into a two-dimensional card icon. Volume compresses, shadows simplify. Smooth continuous transformation. Static camera.` |
| Camera Pan Down | `Smooth downward tracking shot, crane down, revealing new UI elements below. Elements appear with spring animation as camera reaches them.` |

### PIKA 2.2 PIKAFRAMES — Prompt Template

**Razlika:** Pika podržava DO 5 KEYFRAME-ova! Ne samo start+end.
**Settings:** Duration 5-10s, Resolution 1080p
**API:** `fal-ai/pika/v2.2/pikaframes` sa `images: [url1, url2, ..., url5]`

Za Pika, umesto 2 frame-a, pravimo 3-5:

| Tranzicija | Keyframe Sekvenca | Pika Prompt |
|------------|------------------|-------------|
| Pill→Card Morph | KF1: pill, KF2: pill malo veći, KF3: mid-expand, KF4: skoro kartica, KF5: puna kartica | `Smooth elastic expansion from small badge to large card with content appearing inside. Spring bounce easing.` |
| Flowchart Build | KF1: badge only, KF2: first line drawn, KF3: first child badge, KF4: second line+badge, KF5: complete flowchart | `Sequential flowchart building. Dotted lines draw themselves connecting green badges. Each node pops in with bounce.` |
| 3D→2D Morph | KF1: full 3D, KF2: 3D slightly flat, KF3: halfway flat, KF4: mostly 2D, KF5: full 2D card | `Three-dimensional object gradually flattens into a flat icon card. Continuous smooth compression of depth and volume.` |

---

## SECTION C: Test Plan — Uporedno Testiranje

### Test 1: Pill → Card Morph
1. Generiši START i END frame sa GPT Image (isti za sve modele)
2. Upload na Kling 3.0 (fal.ai), Luma Ray3.14, Pika Pikaframes
3. Uporedi vizuelno: kvalitet morph-a, smoothness, bounce efekat

### Test 2: 3D Object → 2D Card
1. Generiši 3D bowl START + 2D card END
2. Upload na sva 3 modela
3. Ovo je hardest test — koji model najbolje handluje 3D→2D transformaciju?

### Test 3: Flowchart Build
1. Generiši praznu scenu START + kompletni flowchart END
2. Upload na sva 3 modela
3. Da li model razume da linije treba da se "nacrtaju" a badge-ovi da "pop-uju"?

### Test 4: Physics Fall
1. Generiši floating cards START + stacked cards END
2. Upload na sva 3 modela
3. Koji model daje najrealističniju fiziku pada?

### Test 5: Radial Explosion
1. Generiši stack START + radial layout END
2. Upload na sva 3 modela
3. Najkompleksnija tranzicija — koji model handluje multiple elements najboije?

### Evaluacija:
- **Ti gledaš vizuelno** i oceniš koji je najbolji
- Za svaki test zabeležimo: koji model, koji prompt, koji settings su dali best rezultat
- Winner postaje default za pipeline

---

## SECTION D: Negative Prompts (Svi Modeli)

```
KLING: low clarity, low resolution, blurriness, unbalanced layout,
complex composition, dark tone, overly dark colors, overly vibrant
colors, no text overlays, no distortion, no morphing artifacts

LUMA: (nema negative prompt support - koristi samo pozitivne opise)

PIKA: blurry, low quality, distorted, ugly, deformed, noisy,
text artifacts, inconsistent style
```

---

## SECTION E: Konzistentnost Stila Kroz Video

### Kling Seed Strategy:
- Generiši prvi clip
- Zapamti seed
- Koristi ISTI seed za sve naredne clipove u istom videu
- Ovo drži konzistentnu color paletu i stil

### GPT Image Konzistentnost:
- Koristi ISTI Master Style Prompt za SVE frame-ove u videu
- Dodaj specifične detalje samo za sadržaj (tekst, ikone, raspored)
- Nikad ne menjaj boje, shadows, border-radius između frame-ova

### Multi-Clip Assembly:
- Svaki clip 5s
- Za 50s video = 10 clipova
- FFmpeg concat: `ffmpeg -f concat -i list.txt -c copy output.mp4`
- Voiceover overlay: `ffmpeg -i video.mp4 -i voice.mp3 -c:v copy -c:a aac output.mp4`
