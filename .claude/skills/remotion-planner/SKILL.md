# Remotion Planner Skill

Planira KOMPLETNU video kompoziciju: voiceover, timestamps, struktura, camera, zvukovi - SVE ZAJEDNO.

**Output:** `master-plan.json` koji se prosleđuje `remotion-builder` skill-u.

---

## FUNDAMENTALNO: JEDNA KOMPOZICIJA

**Vizualno + Audio + Camera + Sounds = JEDNA CELINA koja se planira ZAJEDNO.**

```
❌ POGREŠNO:  Planiraj animacije → Pa dodaj zvukove na kraju
✅ ISPRAVNO:  Planiraj SVE zajedno → Camera, sounds, animacije koordinisani
```

**Ovaj skill planira SVE odjednom:**
- Timestamps iz voiceover-a
- Structure (segments, nodes)
- Camera keyframes
- Sound points
- Timing za sve elemente

---

## WORKFLOW

### KORAK 0: Očisti Transcript (AI radi!)

**Pročitaj:** `reference/text-cleaning.md`

Primeni pravila PRE slanja u ElevenLabs:
1. Ukloni filler words (um, basically, you know)
2. Popravi "and then" repetition → variraj: First/Then/Finally
3. Primeni kontrakcije (don't, we'll, it's)
4. Passive→Active samo ako 100% siguran

**NE dodavaj CAPS za emphasis! NE dodavaj ! ili ?**

---

### KORAK 1: Tech Terms + Voiceover

```bash
python3 scripts/full-pipeline.py --file cleaned-transcript.txt --output-dir ./output/
```

**Output:** voiceover.mp3, voiceover-timestamps.json, processed-text.txt

**ElevenLabs API:**
```typescript
const ELEVENLABS_API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// POST https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps
// Body: { "text": "...", "model_id": "eleven_turbo_v2_5" }
```

**Output:**
- `voiceover.mp3` - audio fajl
- Word-level timestamps za svaku reč

**Timestamps format:**
```json
{
  "words": [
    { "word": "User", "start": 0.5, "end": 0.7 },
    { "word": "query", "start": 0.75, "end": 1.1 }
  ]
}
```

---

### KORAK 2: Analiziraj Transcript → Struktura

---

## ⚠️ VISUAL BALANCE RULES (OBAVEZNO!)

**PRE kreiranja strukture, odredi vizualni balans:**

### Sticky Count Formula:
| Transcript dužina | Stickies | Sections po sticky |
|-------------------|----------|-------------------|
| < 60 sec | 2 | 2-3 |
| 60-120 sec | 2-3 | 2-4 |
| 120+ sec | 3-4 | 3-4 |

### Pravila:
1. **MAX 4 stickies** (nikad 5+!)
2. **MIN 2 sekcije po sticky-ju** (nikad 1!)
3. **Grupiši srodne teme** u isti sticky

### Node Label Pravilo:
```
❌ "Test Frequently" (2 reči ali duge)
❌ "Continuous Integration" (predugačko)
✅ "Test Often" (kratko)
✅ "CI" (acronym)

PRAVILO: Max 2 kratke reči ILI 1 duža reč ILI acronym
         Label MORA stati u 1 RED!
```

### Primer - CI/CD transcript (120+ sec):
```
❌ LOŠE: 5 stickies × 1 section = prazno, ružno

✅ DOBRO: 2 stickies × 3 sections = popunjeno, balansirano

Sticky 1: "The Problem"
  ├── Section: Merge Issues (nodes: Code, Conflict, Break)
  ├── Section: Code Freeze (nodes: Sprint End, Lock, Wait)
  └── Section: Manual Deploy (nodes: Checkout, Build, Push)

Sticky 2: "The Solution"
  ├── Section: Test First (nodes: Branch, Test, Isolate)
  └── Section: CI Way (nodes: Commit, Small, Often)
```

**UVEK proveri pre KORAK 3:**
- [ ] Imam li 2-4 stickies? (ne više!)
- [ ] Svaki sticky ima 2+ sekcija?
- [ ] Svi labels staju u 1 red?

---

**KRITIČNO:** Odredi tip hijerarhije!

```
┌─────────────────────────────────────────┐
│            ANALIZIRAJ TEKST             │
└─────────────────────────────────────────┘
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
┌───────────┐               ┌───────────┐
│   FLAT    │               │   STICKY  │
│ (2-layer) │               │ (3-layer) │
└───────────┘               └───────────┘
      │                           │
Tech stack                  Procesi
Feature lista               Tutorial
Komponente                  Step-by-step
< 100 reči                  > 100 reči
```

**FLAT (2-layer):** `SectionBox → NodeItem`
- Tech stack, feature lista
- Nezavisni koncepti (ne koraci)
- Kratak tekst (< 100 reči)

**STICKY (3-layer):** `StickyNote → SectionBox → NodeItem`
- Proces sa fazama/koracima
- Tutorial, step-by-step
- Duži tekst sa logičkim grupama

**⚠️ STICKY ≠ SVAKI KORAK! Vidi VISUAL BALANCE RULES iznad.**

**DOSTUPNE IKONICE (35):**
```
user, search, terminal, cube, vector, database, zap, file, layers,
merge, sparkle, cpu, check, server, cloud, gitBranch, gitMerge,
settings, play, lock, shield, monitor, refreshCw, code, globe,
api, webhook, queue, network, brain, alert, x, arrowRight,
container, package, messageSquare
```

**DOSTUPNI LAYOUT-I (9):**

## ⚠️ LAYOUT DECISION RULES - AI MORA DA RAZMISLI!

**NE KORISTI FLOW ZA SVE!** Analiziraj šta sekcija OPISUJE i odaberi pravi layout:

| Ako sadržaj opisuje... | Layout | Vizual | Primer iz teksta |
|------------------------|--------|--------|------------------|
| Korake u procesu, sekvence | `flow` | A → B → C | "First build, then test, then deploy" |
| Problem → Rešenje | `negation` | ✗A → B | "Manual deploys are bad → Use CI/CD" |
| Dve alternative/opcije | `vs` | A vs B | "Blue environment vs Green environment" |
| Stvari koje se kombinuju | `combine` | A + B = C | "Code + Tests = Artifact" |
| Odluke, branch logic | `if-else` | A → [B, C] | "If tests pass → deploy, else → fix" |
| Dvosmernu komunikaciju | `bidirectional` | A ↔ B | "Client syncs with Server" |
| Filtriranje, selekcija | `filter` | A ▷ B | "Filter failing tests" |
| Više inputa u jedan output | `merge` | [A, B] → C | "Dev + Staging merge to Prod" |
| Jednostavna veza (2 noda) | `arrow` | A → B | "Request triggers Build" |

### DECISION PROCESS:

```
1. Pročitaj šta sekcija opisuje
2. Pitaj se: "Kakav je ODNOS između nodova?"
   - Sekvencijalni koraci? → flow
   - Loše vs Dobro? → negation
   - Poređenje opcija? → vs
   - Spajanje stvari? → combine ili merge
   - Razdvajanje/odluka? → if-else
3. Odaberi layout koji VIZUALNO pokazuje taj odnos
```

### PRIMERI IZ PRAKSE:

```
Tekst: "Merge conflicts happen when multiple developers push code"
  → Nodovi: [Code, Merge, Conflict]
  → Odnos: Sekvencijalni proces
  → Layout: "flow" ✓

Tekst: "Instead of manual deploys, use automated CI/CD"
  → Nodovi: [Manual, Automated]
  → Odnos: Loše → Dobro
  → Layout: "negation" ✓

Tekst: "Blue environment runs old version, Green runs new"
  → Nodovi: [Blue, Green]
  → Odnos: Poređenje alternativa
  → Layout: "vs" ✓

Tekst: "Code and tests combine to create deployable artifact"
  → Nodovi: [Code, Tests, Artifact]
  → Odnos: Kombinacija
  → Layout: "combine" ✓
```

**⚠️ SVAKA SEKCIJA MORA IMATI `layout`!**
```json
{
  "sections": [
    {
      "id": "problem_solution",
      "title": "The Fix",
      "layout": "negation",  // ← RAZMISLI koji layout!
      "nodes": [...]
    }
  ]
}
```

---

### KORAK 3: Planiraj Camera Keyframes + Sound Points ZAJEDNO

**Camera keyframes:**
- Camera se pomera 15 frames PRE nego sekcija počne
- Element se pojavi 3-5 frames PRE reči

**Sound points (ISTOVREMENO sa camera!):**
```
Camera transition → whoosh zvuk (2 frames PRE camera keyframe)
Section reveal → soft whoosh (20+ frames POSLE camera)
```

**AI Conservative Rule za zvukove:**
```
60-sec video = ~10 zvukova MAX
5-6 camera whooshes + 3-4 section whooshes + 0 icon sounds
```

**Overlap Rule:**
```
AKO |section_frame - camera_frame| < 20:
    → SKIP section whoosh ili stavi tiši (0.08 umesto 0.12)
```

---

### KORAK 4: Generiši master-plan.json

**Output format:**
```json
{
  "meta": {
    "title": "Video Title",
    "fps": 30,
    "totalFrames": 1200,
    "totalDuration": 40.0,
    "hierarchyType": "sticky"
  },

  "voiceover": {
    "file": "voiceover.mp3",
    "duration": 40.0,
    "words": [
      { "word": "User", "start": 0.5, "end": 0.7, "startFrame": 15, "endFrame": 21 }
    ]
  },

  "structure": {
    "stickies": [
      {
        "id": "sticky_1",
        "step": 1,
        "title": "Retrieve",
        "color": "#a855f7",
        "startFrame": 90,
        "sections": [
          {
            "id": "section_1_1",
            "title": "Query",
            "layout": "flow",
            "startFrame": 95,
            "nodes": [
              { "label": "Input", "icon": "terminal", "startFrame": 100 },
              { "label": "Embed", "icon": "cube", "startFrame": 106 }
            ]
          }
        ]
      }
    ]
  },

  "camera": {
    "keyframes": [
      { "frame": 0, "target": "overview", "x": 960, "y": 540, "scale": 0.7 },
      { "frame": 75, "target": "sticky_1", "x": 400, "y": 400, "scale": 1.0 },
      { "frame": 350, "target": "sticky_2", "x": 960, "y": 400, "scale": 1.0 }
    ]
  },

  "sounds": {
    "points": [
      { "frame": 0, "type": "title", "file": "soft-whoosh.mp3", "volume": 0.15 },
      { "frame": 73, "type": "camera", "file": "medium-whoosh.mp3", "volume": 0.25 },
      { "frame": 95, "type": "section", "file": "soft-whoosh.mp3", "volume": 0.12 }
    ],
    "totalCount": 8
  }
}
```

---

## VALIDACIJA PRE OUTPUTA

**OBAVEZNO PROVERI:**

- [ ] Frame 0 ima content (title ili prvi element) - NE CRNI EKRAN!
- [ ] Prvi element se pojavi u prvih 30 frames
- [ ] Camera keyframes su 15 frames PRE section startFrame
- [ ] Sound points su 2 frames PRE camera keyframes
- [ ] Sounds: max 10 za 60 sec video
- [ ] Nema overlap < 20 frames između zvukova
- [ ] Svaki node ima startFrame
- [ ] hierarchyType odgovara sadržaju

**AKO VALIDACIJA FAILA → POPRAVI PRE OUTPUTA!**

---

## TIMING RULES (REFERENCE)

| Element | Timing |
|---------|--------|
| Camera keyframe | 15 frames PRE sekcije |
| Element appear | 3-5 frames PRE reči |
| Sound (camera) | 2 frames PRE camera keyframe |
| Sound (section) | 20+ frames POSLE camera |
| Stagger između nodes | +4-6 frames |

---

## PRIMER 1: RAG Pipeline (STICKY)

**Input tekst:**
> "A user sends a query. That query gets converted into embedding. You search vector database. That's step one, retrieve."

**Analiza:**
- hierarchyType: "sticky" (ima korake)
- Step 1 sadržaj POČINJE sa "A user sends a query" (NE sa "step one")
- StickyNote se pojavi 5 frames PRE prve reči o tom sadržaju

**KRITIČNO - Frame timing:**
```
Tekst: "A user sends a query... That's step one, retrieve."

"A user" = reč #1 @ frame 100    ← OVDE počinje SADRŽAJ step 1!
"step one" = reč #45 @ frame 508  ← Ovo je samo potvrda, NE početak!

StickyNote "Step 1: Retrieve" se pojavi na frame ~95
(5 frames PRE "A user", NE na frame 500+!)
```

**Camera plan:**
- Frame 0: Overview (title visible)
- Frame ~85: Zoom to Step 1 (15 frames pre "user" @ frame 100)
- Frame ~340: Zoom to Step 2 (kad priča o augment)

**Sound plan:**
- Frame 0: title whoosh (0.15)
- Frame 83: camera whoosh (0.25)
- Frame 105: section whoosh (0.12) - 20+ frames posle camera

---

## PRIMER 2: Tech Stack (FLAT)

**Input tekst:**
> "This is the NemoClaw stack. OpenShell. Policy Engine. Privacy Router."

**Analiza:**
- hierarchyType: "flat" (NEMA korake!)
- Nema "step 1, step 2" - nezavisni koncepti
- Kratak tekst, flat struktura

**Struktura (FLAT - bez StickyNote wrapper-a):**
```json
{
  "hierarchyType": "flat",
  "sections": [
    { "title": "OpenShell", "nodes": [{ "label": "Runtime", "icon": "terminal" }] },
    { "title": "Policy Engine", "nodes": [{ "label": "Rules", "icon": "shield" }] },
    { "title": "Privacy Router", "nodes": [{ "label": "Filter", "icon": "lock" }] }
  ]
}
```

**Camera:** Pomera se između SectionBox-ova (ne StickyNotes)

---

## KRITIČNA PRAVILA

### 1. Animacija od PRVOG FRAMEA!
```
❌ Frame 0-150: crn ekran
✅ Frame 0: Title visible
✅ Frame 5-10: Prvi elementi počinju
```

### 2. StickyNote se pojavi KAD POČNE SADRŽAJ
```
❌ Čekati "step one" reč pa pokazati StickyNote
✅ Kad počne da priča o tom sadržaju = StickyNote visible
```

### 3. Camera anticipira, ne kasni
```
❌ Camera dolazi KAD se sekcija pojavi
✅ Camera dolazi 15 frames PRE sekcije
```

### 4. Sounds su koordinisani sa camera
```
❌ Dodaj sounds na kraju
✅ Planiraj sounds ZAJEDNO sa camera keyframes
```

---

## OUTPUT

Kada završiš planiranje, generiši:

1. **`master-plan.json`** - kompletan plan (format gore)
2. **`voiceover.mp3`** - audio fajl (u public/)
3. **`voiceover-timestamps.json`** - word timestamps (u src/)

Zatim proslijedi `remotion-builder` skill-u za implementaciju.

---

## REFERENCE

Za dodatne detalje o specifičnim temama:
- Camera configs: `remotion-motion/reference/camera.md`
- Sound rules: `remotion-motion/reference/sound.md`
- Design system: `remotion-motion/reference/design.md`
- Voiceover API: `remotion-motion/reference/voiceover.md`
- Full legacy skill: `remotion-motion/SKILL-FULL.md`
