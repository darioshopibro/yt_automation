# Plan: Dva Remotion Skilla (SHORT + LONG) sa 100% Official Patterns

## Context

Imamo official `remotion-best-practices` skill sa 41 rule fajlova koji pokrivaju svaki Remotion API. Imamo custom pipeline za long-form explainer videa (planner/builder/router) sa DynamicPipeline.tsx templateom. Napravili smo TikTok test projekat koji koristi official patterns (TransitionSeries, springs, captions).

**Cilj:** Napraviti 2 skilla koji OBADVA koriste 100% patterns iz official skilla:
- **SHORT** = official patterns as-is + branding + guidelines (scene-based, 9:16, 15-60s)
- **LONG** = SVAKI pattern iz SHORT prerađen za long-form (sticky arhitektura, 16:9, 1-8 min)

Za LONG, svaki pattern zahteva research pre prerada.

---

## PHASE 0: Research za LONG (svaki pattern posebno)

Svaki pattern koji postoji u SHORT mora da se istraži za long-form kontekst pre implementacije. Research uključuje: WebSearch + YouTube research + test u minimalnom Remotion projektu.

### 0.1 TransitionSeries za long-form
- **SHORT:** Top-level wrapper, scene-to-scene fade/slide/wipe
- **LONG pitanje:** DynamicPipeline koristi kontinualan canvas sa camera panom - nema diskretnih scena. Kako uklopiti?
- **Research:** Da li TransitionSeries radi kao overlay-only? Performanse? Alternative?
- **Pristup za LONG:** Transition overlay layer IZNAD canvasa koji se prikazuje tokom camera move-a između sticky-ja. Ne menjamo sticky rendering, samo dodajemo vizuelni overlay.
- **Injection:** Posle camera div-a (~line 1770 DynamicPipeline.tsx)
- **Test:** Napraviti minimal test u `workspace/transition-test/`

### 0.2 Spring animations za long-form
- **SHORT:** damping:8-15 (crisp, brz), stagger 18f
- **LONG pitanje:** Koji damping/stiffness za elegant long-form? Entrance choreography (title→icons→connectors→bg)?
- **Research:** Best spring configs za educational/explainer content. Stagger timing za readability.
- **Pristup za LONG:** damping:20-30, stagger 30-50f, entrance choreography per section
- **Injection:** Modifikacija `getOpacity()`, `getScale()` (~line 1431-1451)

### 0.3 Light leaks za long-form
- **SHORT:** `TransitionSeries.Overlay` na svakoj tranziciji
- **LONG pitanje:** Koliko često? Performanse WebGL u 8-min videu? Compositing over glassmorphism?
- **Research:** Testirati LightLeak render time, vizuelni test over dark bg, optimal frequency
- **Pristup za LONG:** Standalone `<Sequence>` overlay, svake 3-4 sticky tranzicije, hueShift = brand primary
- **Injection:** Posle `<GridBackground />` (~line 1541)
- **Config:** Dodati `lightLeaks[]` array u dynamic-config.json

### 0.4 @remotion/sfx za long-form
- **SHORT:** Remote URLs (remotion.media/whoosh.wav, ding.wav, etc.)
- **LONG pitanje:** Koji zvukovi za koji event? Mix remote + local? Volume balans sa voiceover?
- **Research:** Testirati sve @remotion/sfx zvukove, mapirati na event tipove, proveriti latency
- **Pristup za LONG:** Proširiti `soundEvents[]` type sa novim tipovima, dodati remote URL support
- **Injection:** Expand sound type (~line 1515) + render loop (~line 1826-1834)
- **Zvuk mapping:** camera=whoosh, section=soft-whoosh, key-point=ding, comparison=switch

### 0.5 Gradient backgrounds za long-form
- **SHORT:** Brza promena boje per scene, angle shift
- **LONG pitanje:** Kako animirati gradient u long-form bez distrakcije? Parallax layers?
- **Research:** Static vs animated gradients za educational content. Parallax depth patterns.
- **Pristup za LONG:** Brand colors, SPORA rotacija (30deg over ceo video), parallax background layers
- **Injection:** Zamena MeshGradient-a (~line 1536-1540)

### 0.6 Word-by-word captions za long-form
- **SHORT:** Custom WordByWordCaption, 4 frames/word
- **LONG pitanje:** Integration sa @remotion/captions + ElevenLabs timestamps? Performance sa 5000+ words?
- **Research:** Test `createTikTokStyleCaptions()` sa dugim transkriptom, positioning, styling
- **Pristup za LONG:** Konvertovati ElevenLabs format → @remotion/captions Caption format, zamena TranscriptOverlay
- **Injection:** Replace TranscriptOverlay (~line 1818-1821)
- **Converter:** Nova `src/utils/convertCaptions.ts` funkcija

### 0.7 Glow/pulse + Rack focus za long-form
- **SHORT:** Jak glow (Math.sin * 0.3), nema rack focus
- **LONG pitanje:** Koliko px blur = cinematic? CSS filter:blur() u Remotion?
- **Research:** Test blur na 2px, 4px, 6px, 8px. Test performansi filter:blur() u 8-min renderu.
- **Pristup za LONG:** Suptilniji glow (0.1), rack focus blur na inactive stickies (2-4px)
- **Injection:** Na StickyNote wrapper (~line 1639), koristiti `getActiveIntensity()` za blur amount

### 0.8 Path animations za long-form
- **SHORT:** Nema (prekratko)
- **LONG pitanje:** evolvePath() za SVG connector drawing? Icon stroke reveal?
- **Research:** @remotion/paths API, stroke-dasharray animacija, performanse sa mnogo SVG elemenata
- **Pristup za LONG:** Connectors se crtaju (draw-on) umesto instant appear, icons optional stroke reveal
- **Injection:** Modifikacija AnimatedLine komponente + getLineProgress()
- **Package:** `@remotion/paths`

### 0.9 Camera Z-depth za long-form
- **SHORT:** Konstantan 8% zoom per scene
- **LONG pitanje:** Da li CSS perspective + translateZ radi u Remotion? Parallax between layers?
- **Research:** Test CSS 3D transforms u Remotion rendering pipeline
- **Pristup za LONG:** `perspective: 2000px` na camera div, `translateZ` za depth between bg/stickies/overlays
- **Injection:** Camera div (~line 1543-1553)
- **RIZIK:** Ako ne radi, fallback na scale-only depth simulation

### 0.10 Charts/data viz za long-form
- **SHORT:** Static numbers u StatsScene
- **LONG pitanje:** Animated bars/pies sa spring? Responsive sizing? @remotion/paths za line charts?
- **Research:** Best chart animation patterns, stagger per bar, pie stroke-dashoffset
- **Pristup za LONG:** Upgrade BarChartVisual.tsx i PieChartVisual.tsx sa spring animacijama
- **Injection:** Visual components u `templates/ai-video-gen-pipeline/src/visuals/`

### 0.11 Lottie za long-form
- **SHORT:** Nema (prekratko)
- **LONG pitanje:** Kada koristiti Lottie vs custom SVG? Performanse? Gde naći animacije?
- **Research:** LottieFiles library, @remotion/lottie API, use cases za tech explainers
- **Pristup za LONG:** Opcioni Lottie support za complex diagrams, loader animations, character mascots
- **Injection:** Nov visual tip u DynamicPipeline switch statement
- **Package:** `@remotion/lottie`

### 0.12 Text measurement za long-form
- **SHORT:** Hardcoded font sizes
- **LONG pitanje:** fitText() za responsive sticky content? measureText() za overflow detection?
- **Research:** @remotion/layout-utils API, integration sa dynamic text lengths
- **Pristup za LONG:** fitText() za section titles, measureText() za node labels
- **Injection:** SectionBox i NodeItem komponente
- **Package:** `@remotion/layout-utils`

### 0.13 Zod parameters za long-form
- **SHORT:** Parametrizable templates (color, text, duration)
- **LONG pitanje:** Kako parametrizovati DynamicPipeline? Koji props?
- **Research:** Zod schema design za complex configs, @remotion/zod-types
- **Pristup za LONG:** Zod schema za dynamic-config.json, UI controls u Remotion Studio sidebar
- **Injection:** Root.tsx Composition schema prop
- **Package:** `zod`, `@remotion/zod-types`

### 0.14 3D/Three.js za long-form
- **SHORT:** Optional (rotating objects za attention)
- **LONG pitanje:** Kada je 3D appropriate za explainer? Performanse? Simple use cases?
- **Research:** @remotion/three examples, simple rotating mesh, architecture diagrams u 3D
- **Pristup za LONG:** Opcioni 3D visual tip za architecture/system diagrams
- **RIZIK:** Visok effort, nizak ROI za educational content - možda skip
- **Package:** `@remotion/three`, `@react-three/fiber`, `three`

### 0.15 Audio visualization za long-form
- **SHORT:** Music sync (bass-reactive)
- **LONG pitanje:** Subtle bass-reactive effects? Spectrum bars? Background ambience visualization?
- **Research:** visualizeAudio() API, getWaveformPortion() za simple volume, bass extraction
- **Pristup za LONG:** Subtle glow intensity tied to voiceover volume, optional ambient spectrum bars
- **Injection:** Background overlay layer, tied to voiceover audio data
- **Package:** `@remotion/media-utils`

---

## PHASE 1: Shared Layer

### 1.1 Create `templates/shared/`
```
templates/shared/src/
├── types/
│   ├── brand.ts              # BrandConfig interface
│   ├── captions.ts           # Caption types + ElevenLabs converter
│   └── sfx.ts                # Sound event types
├── components/
│   ├── BrandedCaption.tsx     # @remotion/captions + brand colors
│   ├── LightLeakLayer.tsx     # Configurable light leak sequences
│   └── SfxLayer.tsx           # Sound renderer from config
└── utils/
    ├── convertCaptions.ts     # ElevenLabs → @remotion/captions
    └── springPresets.ts       # SNAPPY/SMOOTH/BOUNCY configs
```

### 1.2 Shared Packages (oba template-a)
```bash
npx remotion add @remotion/transitions
npx remotion add @remotion/light-leaks
npx remotion add @remotion/captions
npx remotion add @remotion/google-fonts
npm i zod
```

---

## PHASE 2: SHORT Skill

### 2.1 Template: `templates/short-video-pipeline/`
- **ShortPipeline.tsx** (~400 lines) - TransitionSeries kao main wrapper
- **Scene components:** HookScene, ContentScene, StatsScene, CodeScene, CompareScene, CTAScene
- **Caption overlay:** BrandedCaption iz shared
- **Config:** `short-config.json` (scenes[], captions[], lightLeaks[], brand)
- Reuse visual components iz long-form template (CodeBlockVisual, etc.)

### 2.2 Skill Files
```
.claude/skills/remotion-short/
├── SKILL.md                      # Trigger + workflow
└── reference/
    ├── short-template-spec.md    # Template architecture
    ├── scene-patterns.md         # Scene types (Hook, Stats, Code, CTA...)
    ├── caption-patterns.md       # @remotion/captions integration
    ├── transition-patterns.md    # Which transition za koji context
    └── short-branding.md         # Brand.json → short format mapping
```

---

## PHASE 3: LONG Skill

### 3.1 Template Modifications: `DynamicPipeline.tsx`
Sve modifikacije moraju biti **backward-compatible** - ako novi config fields fale, existing behavior ostaje.

| Line | Šta | Modifikacija |
|------|-----|-------------|
| 1-11 | Imports | Dodati @remotion/transitions, light-leaks, captions |
| 100-136 | Types | Dodati lightLeaks[], sfxConfig, captionConfig u interface |
| 1404-1429 | getCameraValue | Opcioni Z-depth interpolation |
| 1431-1451 | getOpacity/getScale | Sporiji timing (prelazi iz research-a) |
| 1515-1531 | soundEvents | Proširiti tip sa novim SFX tipovima |
| 1536-1543 | Background | Parallax layers + gradient upgrade |
| 1541 | Posle GridBackground | Light leak overlay layer |
| 1543-1553 | Camera div | Opcioni CSS perspective za Z-depth |
| 1639 | StickyNote wrapper | Rack focus blur filter |
| 1770 | Posle camera div | Transition overlay layer |
| 1818-1821 | TranscriptOverlay | Replace sa @remotion/captions |
| 1826-1834 | Sound rendering | Expand za nove SFX tipove + remote URLs |

### 3.2 Skill Files
```
.claude/skills/remotion-long/
├── SKILL.md                          # Trigger + workflow
└── reference/
    ├── long-adaptation-guide.md      # Master doc: SVAKI pattern SHORT→LONG
    ├── transition-injection.md       # TransitionSeries overlay approach
    ├── light-leak-injection.md       # Config + placement rules
    ├── sfx-expansion.md              # Zvuk mapping + volume rules
    ├── caption-adaptation.md         # ElevenLabs → @remotion/captions
    ├── camera-depth.md               # Z-depth + rack focus
    ├── path-animations.md            # SVG connector drawing
    └── performance-notes.md          # Render performance za 8-min videos
```

### 3.3 Planner Updates
- Proširiti `master-plan.json` schema: `lightLeaks[]`, expanded `sounds.points[]` types, opcioni `cameraDepth`
- Planner mora znati KADA staviti light leak, KOJI zvuk za koji event

### 3.4 Builder Updates
- Handle novi config fields (lightLeaks, sfxConfig)
- Install novi packages prilikom template kopiranja

---

## PHASE 4: Testing

### 4.1 SHORT test
- Generisati short video end-to-end (topic → planner → builder → render)
- Proveriti: transitions, light leaks, captions, sfx, branding

### 4.2 LONG test
- Generisati long video sa SVIM enhancement-ima
- Proveriti: backward compatibility (stari config i dalje radi)
- Performance benchmark (render time sa vs bez enhancement-a)

### 4.3 Cross-format test
- ISTI content kao SHORT i LONG - proveriti konzistentnost branding-a

---

## Execution Order

```
PHASE 0 (Research)     ← PARALLEL, svaki pattern nezavisno
  ↓
PHASE 1 (Shared)       ← Zavisi od research findings
  ↓
PHASE 2 (SHORT) ──┬──  ← Može paralelno
PHASE 3 (LONG)  ──┘    ← Zavisi od Phase 0 + 1
  ↓
PHASE 4 (Testing)      ← Zavisi od oba skilla
```

---

## Critical Files

- `templates/ai-video-gen-pipeline/src/DynamicPipeline.tsx` — LONG template (1837 lines, injection points)
- `.claude/skills/remotion-best-practices/rules/` — 41 rule files (knowledge base za oba)
- `workspace/tiktok-test/src/TikTokVideo.tsx` — SHORT reference implementation
- `.claude/skills/remotion-planner/SKILL.md` — Treba update za oba formata
- `.claude/skills/remotion-builder/SKILL.md` — Treba update za novi config fields
- `brands/default/brand.json` — Shared branding config

## Verification

1. `npx remotion studio` za SHORT template — proveriti sve scene + transitions
2. `npx remotion studio` za LONG template — proveriti backward compat + novi efekti
3. `npx remotion render` za oba — proveriti da renderuje bez errora
4. Vizuelni QA — light leaks izgledaju dobro? Rack focus suptilan? Captions čitljivi?
