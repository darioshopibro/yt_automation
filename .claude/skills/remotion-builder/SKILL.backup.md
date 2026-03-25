# Remotion Builder Skill

Implementira video prema `master-plan.json` koji je generisao `remotion-planner`.

**Input:** `master-plan.json` (iz planner-a)
**Output:** Funkcionalan Remotion projekat

---

## WORKFLOW

### KORAK 1: Kopiraj Template + npm install

**⚠️ UVEK KORISTI OVAJ TEMPLATE:**
```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/ai-video-gen-pipeline"/* ./my-project/
cd ./my-project && npm install
```

**KRITIČNO:**
- Template NEMA node_modules (namerno!)
- UVEK radi `npm install` posle kopiranja
- Bez npm install = NEĆE RADITI!

**OVAJ TEMPLATE IMA SVE:**
- DynamicPipeline.tsx sa AnimatedLine (linije između ikonica)
- ExplainerLayout.tsx za različite layout-e
- Sve ikonice (35+)
- Camera sistem
- Sound sistem

**NE KORISTI** `test-sticky-1` ili `remotion-nvidia-test` - zastareli su!

---

## KRITIČNO: STRUKTURA STICKY-JA

**SVAKI KORAK = ZASEBAN STICKY!**

```
❌ POGREŠNO: 1 sticky sa 5 sekcija (Extract, Transform, Load, ...)
✅ ISPRAVNO: 3 sticky-ja (Step 1: Extract, Step 2: Transform, Step 3: Load)
```

**Primer ispravne strukture (ETL):**
```json
{
  "stickies": [
    { "step": 1, "title": "Extract", "sections": [...] },
    { "step": 2, "title": "Transform", "sections": [...] },
    { "step": 3, "title": "Load", "sections": [...] }
  ]
}
```

**Svaki sticky ima 2-4 sekcije, svaka sekcija ima 2-3 noda.**

---

## DOSTUPNE IKONICE (35)

```
user, search, terminal, cube, vector, database, zap, file, layers,
merge, sparkle, cpu, check, server, cloud, gitBranch, gitMerge,
settings, play, lock, shield, monitor, refreshCw, code, globe,
api, webhook, queue, network, brain, alert, x, arrowRight,
container, package, messageSquare
```

**AKO IKONICA NE POSTOJI → PRAZNO POLJE! Koristi samo ove.**

---

## DOSTUPNI LAYOUT-I (9)

Sekcije mogu koristiti `layout` property za vizualne veze između nodova:

| Layout | Opis | Primer |
|--------|------|--------|
| `flow` | A → B → C | sekvenca, pipeline |
| `arrow` | A → B | jednostavna veza |
| `vs` | A vs B | poređenje |
| `combine` | A + B = C | kombinacija |
| `negation` | ✗A → B | loše → dobro |
| `bidirectional` | A ↔ B | dvosmerna veza |
| `filter` | A ▷ B | filtriranje |
| `if-else` | A → [B, C] | split/branch |
| `merge` | [A, B] → C | spajanje |

**Primer config-a sa layout-om:**
```json
{
  "sections": [
    {
      "id": "query_processing",
      "title": "Query Processing",
      "layout": "flow",
      "nodes": [
        { "label": "User", "icon": "user" },
        { "label": "API", "icon": "api" },
        { "label": "DB", "icon": "database" }
      ]
    }
  ]
}
```

**Komponenta:** `ExplainerLayout.tsx` renderuje layout

---

### KORAK 2: Kopiraj Fajlove iz Plana

```bash
# Voiceover
cp voiceover.mp3 ./my-project/public/

# Timestamps
cp voiceover-timestamps.json ./my-project/src/

# Master plan (za config)
cp master-plan.json ./my-project/src/
```

---

### KORAK 3: Kopiraj Sounds (OBAVEZNO!)

```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test/public/sounds" ./my-project/public/
```

**MORA postojati:**
```
public/sounds/whooshes/
├── medium-whoosh.mp3   ← camera transitions
└── soft-whoosh.mp3     ← section reveals
```

---

### KORAK 4: Generiši `dynamic-config.json` iz master-plan.json

**Transformacija:**
```typescript
// master-plan.json → dynamic-config.json
const config = {
  title: masterPlan.meta.title,
  fps: masterPlan.meta.fps,
  totalFrames: masterPlan.meta.totalFrames,
  showStepPrefix: true,
  stickies: masterPlan.structure.stickies.map(s => ({
    step: s.step,
    title: s.title,
    color: s.color,
    sections: s.sections.map(sec => ({
      id: sec.id,
      title: sec.title,
      subtitle: sec.subtitle,
      colorKey: sec.colorKey,
      startFrame: sec.startFrame,
      nodes: sec.nodes
    }))
  }))
};
```

**Config Options:**
- `showStepPrefix: true` = badge shows "STEP 1: RETRIEVE"
- `showStepPrefix: false` = badge shows just "RETRIEVE" (za non-sequential teme)

**Color Keys za sekcije:**
```
userQuery, embedding, vectorSearch, retrieve, augment, generate
```

**Sticky Colors (hex):**
```
#a855f7 (purple), #f97316 (orange), #06b6d4 (cyan), #22c55e (green), #ef4444 (red)
```

---

### KORAK 5: Implementiraj Komponente

**OBAVEZNI IMPORTI:**
```tsx
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
  useVideoConfig,
  Audio,           // ← OBAVEZNO!
  Sequence,        // ← OBAVEZNO!
  staticFile,      // ← OBAVEZNO!
} from "remotion";
```

**Camera Component:**
```tsx
const getCameraPosition = (frame: number) => {
  const keyframes = masterPlan.camera.keyframes;
  // Interpolate between keyframes using spring
  // ...
};
```

**Sound Effects:**
```tsx
{masterPlan.sounds.points.map((sound, i) => (
  <Sequence key={i} from={sound.frame} durationInFrames={30}>
    <Audio
      src={staticFile(`sounds/whooshes/${sound.file}`)}
      volume={sound.volume}
    />
  </Sequence>
))}
```

---

### KORAK 6: Implementiraj prema Planu

**NE ODLUČUJ NIŠTA NOVO!** Samo prati master-plan.json:

| Šta | Gde u planu |
|-----|-------------|
| Kada element appear | `structure.stickies[].sections[].nodes[].startFrame` |
| Kada camera pomera | `camera.keyframes[].frame` |
| Gde camera ide | `camera.keyframes[].x, y, scale` |
| Kada sound | `sounds.points[].frame` |
| Koji sound | `sounds.points[].file` |
| Volume | `sounds.points[].volume` |

---

## STRUKTURA PROJEKTA

```
my-project/
├── src/
│   ├── Root.tsx                 ← Composition definicija
│   ├── DynamicPipeline.tsx      ← Glavna komponenta
│   ├── dynamic-config.json      ← Generisan iz master-plan
│   ├── master-plan.json         ← Plan iz planner-a
│   └── voiceover-timestamps.json
├── public/
│   ├── voiceover.mp3
│   └── sounds/
│       └── whooshes/
│           ├── medium-whoosh.mp3
│           └── soft-whoosh.mp3
├── package.json
└── remotion.config.ts
```

---

## Root.tsx

```tsx
import { Composition } from "remotion";
import { DynamicPipeline } from "./DynamicPipeline";
import config from "./dynamic-config.json";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DynamicPipeline"
    component={DynamicPipeline}
    durationInFrames={config.totalFrames}
    fps={config.fps}
    width={1920}
    height={1080}
  />
);
```

---

## ANIMATION CONFIGS

### Spring Configs
```tsx
// SNAPPY (elementi)
spring({ frame, fps, config: { damping: 15, stiffness: 120 } })

// SMOOTH (camera)
spring({ frame, fps, config: { damping: 22, stiffness: 90 } })
```

### Stagger
```tsx
// Nodovi unutar sekcije: +4-6 frames između svakog
// Već definisano u master-plan.json!
```

### Timing
```tsx
// Element fade-in: 6-9 frames
// Element scale-in: 8-12 frames
// Camera zoom/pan: 12-18 frames
```

---

## DESIGN SYSTEM

### Colors
```tsx
const colors = {
  bg: "#030305",
  text: "#f8fafc",
  textMuted: "#94a3b8",
};
```

### Glassmorphism
```tsx
backdropFilter: "blur(16px) saturate(180%)",
boxShadow: `0 0 60px ${glowColor}`,
borderRadius: 20,
```

### Layout
```tsx
display: "flex",
justifyContent: "center",  // OBAVEZNO!
gap: 20,
```

---

## CHECKLIST PRE POKRETANJA

### Setup:
- [ ] Template kopiran
- [ ] `voiceover.mp3` u public/
- [ ] `sounds/whooshes/` folder postoji
- [ ] `medium-whoosh.mp3` i `soft-whoosh.mp3` unutra
- [ ] `dynamic-config.json` generisan iz master-plan

### Importi:
- [ ] `Audio` importovan
- [ ] `Sequence` importovan
- [ ] `staticFile` importovan

### Implementacija:
- [ ] Camera prati `camera.keyframes` iz plana
- [ ] Sounds prate `sounds.points` iz plana
- [ ] Elementi se pojavljuju na tačnim frame-ovima iz plana
- [ ] `justifyContent: "center"` na flexbox-u

---

## COMMON ERRORS

| Simptom | Uzrok | Fix |
|---------|-------|-----|
| Elementi levo | Flexbox nije centered | `justifyContent: "center"` |
| Camera snaps | Transition prebrz | Koristi 45 frames, damping: 22 |
| Prespore animacije | duration > 15 | Koristi 8-12 frames |
| Nema zvuka | Sounds folder fali | Kopiraj sounds/ folder |
| Audio desync | Pogrešni frame-ovi | Koristi tačno iz master-plan |
| Crn ekran na početku | Frame 0 nema content | **BUG U PLANU** - vrati planner-u |

---

## VALIDACIJA POSLE BUILDA

**Proveri u preview-u:**

- [ ] Frame 0 ima title/content (NE crn ekran!)
- [ ] Animacija kreće u prvih 30 frames
- [ ] Camera se pomera smooth (ne snap)
- [ ] Sounds se čuju na pravim mestima
- [ ] Elementi se pojavljuju sinhronizovano sa voiceoverom
- [ ] Nema visual glitch-eva

**AKO NEŠTO NE RADI → Proveri master-plan.json!**
Builder samo implementira plan - ako plan ima grešku, output će imati grešku.

---

## POKRETANJE

```bash
cd my-project
npm install          # OBAVEZNO - template nema node_modules!
npm run dev          # ili: npx remotion studio --port 3001
```

**⚠️ NIKAD ne preskači npm install - template namerno nema node_modules!**

---

## REFERENCE

- Camera details: `remotion-motion/reference/camera.md`
- Sound details: `remotion-motion/reference/sound.md`
- Design details: `remotion-motion/reference/design.md`
- Voiceover details: `remotion-motion/reference/voiceover.md`
- Full legacy skill: `remotion-motion/SKILL-FULL.md`
- Component templates: `remotion-motion/SKILL-FULL.md` (StickyNote, SectionBox, NodeItem)
