# Remotion Motion Graphics Skill

Pravi animirane motion graphics u Remotion-u (React). Premium dark theme stil, glassmorphism, glow efekti, spring animacije.

## KADA KORISTITI

- User traži animirani infographic
- User traži motion graphics za video
- User daje dijagram/flow za animiranje
- Bilo koja animated React komponenta za video

---

## FUNDAMENTALNO: JEDNA KOMPOZICIJA

**Vizualno + Audio + Camera = JEDNA CELINA koja se planira ZAJEDNO od početka.**

```
❌ POGREŠNO:  Napravi animacije → Dodaj zvukove na kraju
✅ ISPRAVNO:  Planiraj sve zajedno → Animacije i zvuci su koordinisani
```

### Workflow:
1. **Script** → ElevenLabs → timestamps
2. **Plan camera keyframes** + sound points ZAJEDNO
3. **Build animations** prema timestamps
4. **Add sounds** po pravilima (ne na kraju!)

### Pre pravljenja animacije, razmisli:
- Gde će biti camera transitions? → Tu ide whoosh
- Koliko elemenata se pojavljuje odjednom? → Ako više, NE stavljaj zvuk na svaki
- Da li se ova animacija preklapa sa drugom? → Odluči KO dobija zvuk

### Dok praviš camera keyframes:
- Označi "SOUND POINT" frame numbers
- Ostavi 20+ frames između velikih animacija za "breathing room"
- Grupiši staggered animacije kao JEDNU ZVUČNU JEDINICU

---

## QUICK REFERENCE

| Tema | Fajl | Kada čitati |
|------|------|-------------|
| Camera & Animation | [reference/camera.md](reference/camera.md) | Camera keyframes, spring configs, stagger |
| Sound Design | [reference/sound.md](reference/sound.md) | Zvukovi, volume, overlap rules |
| Design System | [reference/design.md](reference/design.md) | Colors, glassmorphism, icons, backgrounds |
| Voiceover Sync | [reference/voiceover.md](reference/voiceover.md) | ElevenLabs, timestamps, sync pravila |
| Infinite Canvas | [templates/infinite-canvas.md](templates/infinite-canvas.md) | Zoom through diagram template |

---

## NOVI PROJEKAT - OBAVEZNI KORACI

**⚠️ NIKAD NE PRESKAČI NIŠTA OD OVOGA!**

### 0. PRVO: Generiši Voiceover sa Timestamps!
```bash
# UVEK PRVO voiceover - timestamps definišu SVE ostalo!
```

**ElevenLabs API poziv:**
```typescript
const ELEVENLABS_API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// POST https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps
// Body: { "text": "...", "model_id": "eleven_turbo_v2_5" }
```

**Output potreban:**
- `public/voiceover.mp3` - audio fajl
- `src/voiceover-timestamps.json` - word-level timestamps

**Timestamps format:**
```json
{
  "words": [
    { "word": "User", "start": 0.5, "end": 0.7 },
    { "word": "query", "start": 0.75, "end": 1.1 }
  ]
}
```

**ZAŠTO PRVO:**
- Camera keyframes = 15 frames PRE reči
- Section appear = 5 frames PRE reči
- Sounds = synced sa camera

**Kopiraj generate-voice.ts skriptu:**
```bash
cp "/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test/scripts/generate-voice.ts" ./scripts/
```

**Ili koristi gotov projekat kao bazu:**
```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test" ./my-new-project
```

---

### 1. ANALIZIRAJ TRANSCRIPT - Odredi strukturu!

**NAKON voiceover-a, ANALIZIRAJ transcript i vrati JSON strukturu.**

Analiziraj tekst semantički i odredi:
1. `hierarchyType: "flat"` ili `"sticky"`
2. Segments: StickyNotes → SectionBoxes → NodeItems
3. Ikone za svaki node
4. Word indices za timing

**Vrati JSON u ovom formatu:**
```json
{
  "hierarchyType": "flat" | "sticky",
  "totalWords": number,
  "segments": [...],
  "cameraKeyframes": [...]
}
```

**Output primer (sticky):**
```json
{
  "hierarchyType": "sticky",
  "totalWords": 95,
  "segments": [
    {
      "id": "sticky_1",
      "title": "Retrieve",
      "step": 1,
      "type": "stickyNote",
      "sections": [
        {
          "id": "section_1_1",
          "title": "Query",
          "type": "sectionBox",
          "nodes": [
            { "label": "Input", "icon": "terminal" },
            { "label": "Embed", "icon": "cube" }
          ],
          "wordIndexStart": 0,
          "wordIndexEnd": 25
        }
      ],
      "wordIndexStart": 0,
      "wordIndexEnd": 40
    }
  ],
  "cameraKeyframes": [
    { "segmentId": "sticky_1", "wordIndex": 0, "description": "Zoom to Retrieve" }
  ]
}
```

**Validacije:**
- Tekst < 10 reči = ERROR (prekratko)
- Tekst > 800 reči = ERROR (predugo, podeli)
- Warnings za edge cases

**KORISTI OUTPUT ZA:**
- `hierarchyType` → da li praviš StickyNotes ili flat SectionBoxes
- `segments` → kompletna struktura za JSX
- `wordIndexStart/End` → mapiraš na frame timestamps
- `cameraKeyframes` → osnova za camera movement

---

### 1. Napravi foldere
```bash
mkdir -p my-project/src my-project/public/sounds/whooshes
cd my-project
```

### 2. KOPIRAJ SOUNDS (OBAVEZNO!)
```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test/public/sounds" ./public/
```

**Sounds folder MORA sadržati:**
```
public/sounds/whooshes/
├── medium-whoosh.mp3   ← camera transitions
└── soft-whoosh.mp3     ← section reveals
```

### 3. npm install
```bash
npm init -y
npm install remotion @remotion/cli @remotion/bundler react react-dom
npm install -D typescript @types/react @types/react-dom
```

### 4. OBAVEZNI IMPORTI u glavnoj komponenti
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

### 5. OBAVEZNI ZVUKOVI u komponenti
```tsx
// Na kraju komponente, pre </AbsoluteFill>:

{/* SOUND EFFECTS - OBAVEZNO DODAJ! */}

{/* Title reveal */}
<Sequence from={0} durationInFrames={20}>
  <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.15} />
</Sequence>

{/* Camera transition - za SVAKI camera keyframe */}
<Sequence from={cameraKeyframeFrame - 2} durationInFrames={30}>
  <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
</Sequence>

{/* Section reveal - 20+ frames POSLE camera */}
<Sequence from={sectionStartFrame} durationInFrames={20}>
  <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
</Sequence>
```

---

## SETUP CHECKLIST

Pre pokretanja `npm start`, proveri:

- [ ] `public/sounds/whooshes/` folder postoji
- [ ] `medium-whoosh.mp3` i `soft-whoosh.mp3` su unutra
- [ ] `Audio`, `Sequence`, `staticFile` importovani
- [ ] Zvukovi dodati u komponentu (vidi gore)

---

## STRUKTURA PROJEKTA

```
src/
├── Root.tsx           ← Composition definicija
├── MyAnimation.tsx    ← Glavna komponenta
├── voiceover-timestamps.json
public/
├── voiceover.mp3
├── sounds/
│   └── whooshes/
│       ├── medium-whoosh.mp3   ← MORA POSTOJATI!
│       └── soft-whoosh.mp3     ← MORA POSTOJATI!
```

### Root.tsx
```tsx
import { Composition } from "remotion";
import { MyAnimation } from "./MyAnimation";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MyAnimation"
    component={MyAnimation}
    durationInFrames={600}  // 20 sec @ 30fps
    fps={30}
    width={1920}
    height={1080}
  />
);
```

---

## CORE TIMING (Fireship Style)

### Animation Durations (@ 30fps)
| Animacija | Frames | Feel |
|-----------|--------|------|
| Element fade-in | 6-9 | Snappy |
| Element scale-in | 8-12 | Smooth |
| Camera zoom/pan | 12-18 | Snappy |

### Spring Configs
```tsx
// SNAPPY (elementi)
config: { damping: 15, stiffness: 120 }

// SMOOTH (camera)
config: { damping: 22, stiffness: 90 }
```

### Stagger
```tsx
// +4 frames između svakog (Fireship stil)
<Item delay={18} />
<Item delay={22} />
<Item delay={26} />
```

**Detalji:** [reference/camera.md](reference/camera.md)

---

## CORE SOUND RULES

### AI Conservative Rule
AI nema osećaj za zvukove. SAMO sigurni zvukovi:

```
✓ Camera whooshes  @ 0.25
✓ Section whooshes @ 0.12 (ako nema overlap)
✗ Icon sounds      (skip)
✗ Ambience/hits    (skip)
```

### Formula
```
60-sec video = ~10 zvukova MAX
5-6 camera + 3-4 section + 0 icons
```

### Overlap Rule
```
AKO |section_frame - camera_frame| < 20:
    → SKIP section whoosh ili stavi tiši (0.12)
```

**Detalji:** [reference/sound.md](reference/sound.md)

---

## VOICEOVER SYNC

### Timing Rules
```
Camera: 15 frames PRE sekcije
Element: 3-5 frames PRE reči
Sound: 2 frames PRE camera keyframe
```

### ElevenLabs
```tsx
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";  // Rachel
const model = "eleven_turbo_v2_5";
```

**Detalji:** [reference/voiceover.md](reference/voiceover.md)

---

## CORE DESIGN

### Color Palette
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

**Detalji:** [reference/design.md](reference/design.md)

---

## CHECKLIST - OBAVEZNO PRE POKRETANJA!

### Setup (NIKAD NE PRESKAČI):
- [ ] **Voiceover generisan** sa timestamps JSON
- [ ] **sounds/ folder** kopiran u public/
- [ ] **medium-whoosh.mp3** postoji
- [ ] **soft-whoosh.mp3** postoji

### Importi u komponenti:
- [ ] `Audio` importovan iz remotion
- [ ] `Sequence` importovan iz remotion
- [ ] `staticFile` importovan iz remotion

### Zvukovi u komponenti:
- [ ] Title whoosh dodat (frame 0)
- [ ] Camera whooshes dodati (svaki camera keyframe - 2)
- [ ] Section whooshes dodati (20+ frames posle camera)
- [ ] Volume: camera @ 0.25, section @ 0.12

### Animation:
- [ ] Static background (no particles!)
- [ ] Elementi imaju stagger (+4-6 frames)
- [ ] Spring: snappy za elemente, smooth za camera
- [ ] Flexbox ima `justifyContent: "center"`

### Design:
- [ ] Gradient backgrounds (ne flat)
- [ ] Glassmorphism na containerima
- [ ] Icons imaju glow
- [ ] Vignette + scanlines overlay

---

## COMMON ERRORS

| Simptom | Uzrok | Fix |
|---------|-------|-----|
| Elementi levo | Flexbox nije centered | `justifyContent: "center"` |
| Camera snaps | Transition prebrz | 45 frames, damping: 22 |
| Prespore animacije | duration > 15 | Koristi 8-12 frames |
| Zvukovi haos | Overlap, previše | 20+ frames gap, max 10 |
| Audio desync | Pogrešni frame offsets | Check timestamps JSON |

---

## HIERARCHICAL STRUCTURE - StickyNote Wrappers

### Component Hierarchy (kao n8n)
```
StickyNote (wrapper za korake/faze)
  └── SectionBox (grupacija operacija)
        └── NodeItem (atomska akcija: icon + label)
```

### KADA koristiti koji TEMPLATE?

**ODLUKA SE PRAVI NA OSNOVU TEKSTA:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ANALIZIRAJ TEKST                         │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐
    │  2-LAYER (flat) │         │ 3-LAYER (sticky)│
    └─────────────────┘         └─────────────────┘
              │                           │
    SectionBox → NodeItem       StickyNote → SectionBox → NodeItem
              │                           │
    TEMPLATE:                   TEMPLATE:
    remotion-nvidia-test        rag-pipeline-test
    (port 3001)                 (port 3003)
```

---

### 2-LAYER: `SectionBox → NodeItem` (FLAT)

**Koristi kad:**
- Tech stack, feature lista
- Nezavisni koncepti (ne koraci)
- Kratak tekst (< 100 reči)
- Nema "step 1, step 2, step 3"

**Template:** `remotion-nvidia-test`
```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test" ./my-project
```

---

### 3-LAYER: `StickyNote → SectionBox → NodeItem` (STICKY)

**Koristi kad:**
- Proces sa fazama/koracima
- Tutorial, step-by-step
- Duži tekst sa logičkim grupama
- Eksplicitni ili implicitni koraci

**Template:** `rag-pipeline-test`
```bash
cp -r "/Users/dario61/Desktop/YT automation/rag-pipeline-test" ./my-project
```

---

### Automatski Analyzer (opciono)

```bash
npx ts-node .claude/skills/remotion-motion/scripts/analyze-transcript.ts "transcript"
```

Analyzer vraća `hierarchyType: "flat"` ili `"sticky"`.

**NE ZAVISI OD KEYWORDS kao "step 1"!** Analyzer razume semantiku.

### KRITIČNO: Kada počinje StickyNote?

**StickyNote se pojavljuje KAD POČNE SADRŽAJ, NE KAD KAŽE "STEP X"!**

```
POGREŠNO: Čekati "step one, retrieve" pa tek onda pokazati StickyNote
ISPRAVNO: Ako priča o query → embedding → vector search, to JE step 1!
          StickyNote se pojavi KAD POČNE DA PRIČA o tom sadržaju.
```

**Primer RAG Pipeline:**
```
Tekst: "A user sends a query. That query gets converted into embedding.
        You search vector database. That's step one, retrieve."

Analiza:
- "A user sends a query" = POČETAK step 1 sadržaja (frame 99)
- "step one, retrieve" = samo POTVRDA (frame 508)

StickyNote "Step 1: Retrieve" se pojavi na frame ~90
(5 frames pre prvog sadržaja, NE na frame 500+!)
```

### Pravilo animacije od PRVOG FRAMEA

**NIKADA prazan ekran dok se priča!**

```
frame 0: Title se pojavi
frame 5-10: Intro elementi (ako ih ima)
frame X-5: StickyNote/SectionBox se pojavi (5 frames pre nego što se pomene)

Ako voiceover počinje sa sadržajem = animacija počinje ODMAH
```

### Decision Tree (AUTOMATSKI via Analyzer)

```
ANALYZER OUTPUT:
│
├── hierarchyType: "flat"
│   └── Koristi: SectionBox → NodeItems (bez StickyNote wrappera)
│   └── Camera: pomera se između SectionBox-ova
│   └── Primer: tech stack, feature lista
│
└── hierarchyType: "sticky"
    └── Koristi: StickyNote → SectionBox → NodeItems
    └── Camera: pomera se između StickyNotes
    └── Primer: RAG pipeline, tutorial sa fazama
```

**NIKAD NE ODLUČUJ RUČNO - uvek pokreni analyzer!**

### Primer: RAG Pipeline

**Tekst:**
> "Step one, retrieve. The chunks you get back become your context.
> In step two, augment. You take that context and combine it with the original query into a prompt.
> Step three, generate. You pass that prompt to the LLM."

**Analiza:**
- ✅ Eksplicitni koraci (step 1, 2, 3)
- ✅ Svaki korak ima više operacija
- ✅ Dugačak tekst sa pod-temama

**Struktura:**
```tsx
<StickyNote step={1} title="Retrieve">
  <SectionBox title="Vector Search">
    <NodeItem label="Query" />
    <NodeItem label="Chunks" />
  </SectionBox>
  <SectionBox title="Context">
    <NodeItem label="Retrieved" />
  </SectionBox>
</StickyNote>
```

### Primer: Simple Tech Stack (BEZ wrappera)

**Tekst:**
> "This is the NemoClaw stack. OpenShell. Policy Engine. Privacy Router."

**Analiza:**
- ❌ Nema eksplicitnih koraka
- ❌ Svaki koncept je nezavisan
- ❌ Kratak tekst, flat struktura

**Struktura:**
```tsx
<SectionBox title="OpenShell">
  <NodeItem label="Runtime" />
</SectionBox>
<SectionBox title="Policy Engine">
  <NodeItem label="Rules" />
</SectionBox>
```

### StickyNote Component Template

```tsx
const StickyNote: React.FC<{
  step: number;
  title: string;
  color: string;
  opacity: number;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerVertically?: boolean;  // OBAVEZNO za single-row layouts!
  children: React.ReactNode;
}> = ({ step, title, color, opacity, scale, x, y, width, height, centerVertically = false, children }) => (
  <div style={{
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    opacity,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }}>
    {/* Step badge */}
    <div style={{
      position: "absolute",
      top: -20,
      left: 20,
      background: color,
      padding: "8px 20px",
      borderRadius: "12px 12px 0 0",
      fontSize: 14,
      fontWeight: 700,
      color: "#fff",
      letterSpacing: 1,
      boxShadow: `0 0 30px ${color}60`,
    }}>
      STEP {step}: {title.toUpperCase()}
    </div>

    {/* Content area with border */}
    <div style={{
      width: "100%",
      height: "100%",
      border: `2px solid ${color}40`,
      borderRadius: 16,
      padding: 24,
      background: `linear-gradient(145deg, ${color}15 0%, ${color}05 100%)`,
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      alignContent: centerVertically ? "center" : "flex-start",  // CENTER for 1 row!
    }}>
      {children}
    </div>
  </div>
);
```

### PRAVILO: centerVertically za StickyNotes

**OBAVEZNO PRAVILO - koristi se automatski!**

```
Ako StickyNote ima SAMO 1 RED SectionBox-ova:
  → centerVertically={true}
  → Linije moraju računati verticalOffset!

Ako StickyNote ima 2+ REDA:
  → centerVertically={false} (default)
  → Linije bez offset-a
```

**Zašto?** Single-row StickyNote izgleda prazno ako su boxovi na vrhu. Centering popravlja vizual.

### PRAVILO: Linije moraju pratiti centrirane boxove!

**KRITIČNO:** Kad je `centerVertically={true}`, linije se MORAJU pomeriti!

```tsx
// ZA CENTRIRANE LAYOUTS (1 red):
{(() => {
  const boxW = 238, boxH = 186, gap = 24;
  const contentW = stickyWidth - 48;
  const contentH = stickyHeight - 48;  // Dostupna visina

  // OBAVEZNO za centerVertically=true:
  const verticalOffset = (contentH - boxH) / 2;  // ~123px za 480h sticky

  const centerY = verticalOffset + boxH / 2;  // Linija prati box centar

  return (
    <svg style={{ position: "absolute", top: 24, left: 24, width: contentW, height: contentH }}>
      <AnimatedLine x1={...} y1={centerY} x2={...} y2={centerY} ... />
    </svg>
  );
})()}
```

**BEZ offset-a = linije idu kroz prazan prostor iznad boxova!**

### Camera Flow sa StickyNotes

```tsx
// Sticky notes su VEĆI - camera se pomera između njih
const cameraKeyframes = [
  { frame: 0, x: 400, y: 400, scale: 0.8 },    // Overview
  { frame: 120, x: 300, y: 400, scale: 1.0 },  // Zoom to Step 1
  { frame: 400, x: 800, y: 400, scale: 1.0 },  // Pan to Step 2
  { frame: 700, x: 1300, y: 400, scale: 1.0 }, // Pan to Step 3
];
```

---

## TEMPLATES

| Template | Opis | Kada koristiti |
|----------|------|----------------|
| [node-canvas](templates/node-canvas.md) | Nodovi (ikonica+tekst), glassmorphism, camera pan | Arhitektura, tech stack, flowchart |
| [sticky-flow](templates/sticky-flow.md) | StickyNotes za korake, SectionBox unutra | Tutorial, step-by-step, process flow |

---

## REFERENCE PROJECTS

| Project | Path | Template | Port |
|---------|------|----------|------|
| **Dynamic Sticky** | `test-sticky-1/` | **DYNAMIC sticky-flow** | 3001 |
| RAG Pipeline (legacy) | `rag-pipeline-test/` | hardcoded sticky | 3003 |
| NemoClaw Test | `remotion-nvidia-test/` | node-canvas (3 sekcije) | 3001 |

---

### STICKY-FLOW TEMPLATE (DINAMIČKI - PRIMARNI!)

**⚠️ UVEK KORISTI DINAMIČKI TEMPLATE!**

**KOPIRAJ CEO PROJEKAT za sticky-flow:**
```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/test-sticky-1" ./my-new-project
```

**Glavni fajlovi:**
- `src/DynamicPipeline.tsx` - DINAMIČKI template (čita iz JSON)
- `src/dynamic-config.json` - CONFIG koji definise sve!

**Šta je DINAMIČKO (iz JSON config-a):**
- ✅ Broj sticky notes (1-4)
- ✅ Broj sekcija po sticky-u (1-6)
- ✅ Broj nodova po sekciji (1-4)
- ✅ Title, subtitle, boje, ikone
- ✅ startFrame za svaku sekciju (iz timestamps)
- ✅ Camera keyframes (AUTO-GENERISANI!)
- ✅ Linije (AUTO Z-pattern!)
- ✅ Sound effects (AUTO, max 10!)

**JSON Config Format:**
```json
{
  "title": "RAG Pipeline",
  "subtitle": "Retrieval Augmented Generation",
  "fps": 30,
  "totalFrames": 1153,
  "showStepPrefix": true,
  "stickies": [
    {
      "step": 1,
      "title": "Retrieve",
      "color": "#a855f7",
      "sections": [
        {
          "id": "SECTION_ID",
          "title": "Section Title",
          "subtitle": "Optional subtitle",
          "colorKey": "userQuery",
          "startFrame": 129,
          "nodes": [
            { "label": "Node 1", "icon": "layers" },
            { "label": "Node 2", "icon": "zap" }
          ]
        }
      ]
    }
  ]
}
```

**Config Options:**
- `showStepPrefix`: `true` = badge shows "Step 1: Title", `false` = just "Title" (use false for non-sequential topics)

**Color Keys:** `userQuery`, `embedding`, `vectorSearch`, `retrieve`, `augment`, `generate`
**Icons:** `user`, `search`, `terminal`, `cube`, `vector`, `database`, `zap`, `file`, `layers`, `merge`, `sparkle`, `cpu`

---

### NODE-CANVAS TEMPLATE

**KOPIRAJ za node-canvas (flat layout):**
```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test" ./my-new-project
```

**Glavni fajl:** `remotion-nvidia-test/src/NemoClawStack.tsx`

---

**Shared files (oba template-a):**
- `scripts/generate-voice.ts` - ElevenLabs generator
- `public/sounds/whooshes/` - Sound effects

---

## DEPENDENCIES

- `frontend-design` skill - Za premium dizajn smernice
