# Sticky Flow Template (DINAMIČKI)

**⚠️ KORISTI DINAMIČKI TEMPLATE - SVE SE GENERIŠE IZ JSON CONFIG-a!**

Template za step-by-step procese sa StickyNote wrapperima.

## TEMPLATE LOKACIJA

```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/test-sticky-1" ./my-new-project
```

**Fajlovi:**
- `src/DynamicPipeline.tsx` - NE MENJAJ! Template koji čita JSON
- `src/dynamic-config.json` - **SAMO OVO MENJAŠ!**

## Kada koristiti

- Tutorial videi sa eksplicitnim koracima
- Process flow (Step 1 → Step 2 → Step 3)
- Kada svaki korak ima VIŠE pod-operacija
- Kompleksni dijagrami sa hijerarhijom

## Struktura (definisana u JSON)

```
StickyNote (Step 1)        ← "stickies[0]"
  ├── SectionBox           ← "sections[0]"
  │     ├── NodeItem       ← "nodes[0]"
  │     └── NodeItem       ← "nodes[1]"
  └── SectionBox           ← "sections[1]"
        └── NodeItem

StickyNote (Step 2)        ← "stickies[1]"
  └── SectionBox
        ├── NodeItem
        └── NodeItem
```

## WORKFLOW: Od Teksta do Videa

### 1. Generiši Voiceover sa Timestamps
```bash
# Koristi ElevenLabs API
# Output: voiceover.mp3 + timestamps.json
```

### 2. Analiziraj Tekst → Generiši JSON Config
Iz timestamps-a, kreiraj `dynamic-config.json`:
- **Identifikuj korake:** "step one", "first", "then", "next", "finally"
- **Grupiši sekcije:** Svaka logička celina = SectionBox
- **Izvuci nodove:** Ključni koncepti = NodeItem (icon + label)
- **Izračunaj startFrame:** `timestamp_seconds * fps`

### 3. Kopiraj Template + Zameni JSON
```bash
cp -r test-sticky-1 my-project
# Edit my-project/src/dynamic-config.json
# Kopiraj voiceover.mp3 u public/
```

### 4. Renderuj
```bash
cd my-project && npx remotion studio
```

## Analiza Teksta - Pravila

### Identifikuj korake
```
Trigger reči: "step one", "first", "then", "next", "finally"
Implicitni koraci: logičke celine, promene teme
```

### Grupiši pod-operacije
```
Svaka rečenica između koraka = potencijalni SectionBox
Imenice = NodeItem kandidati
```

### Odluči o strukturi
```
Ako korak ima 1 operaciju → 1 SectionBox
Ako korak ima 2-4 operacije → 2-4 SectionBox-a u 2x2 grid
Ako korak ima 5-6 operacija → 3x2 grid
```

## Component Code

### StickyNote

```tsx
const StickyNote: React.FC<{
  step: number;
  title: string;
  colorScheme: { border: string; glow: string; bg: string };
  opacity: number;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ step, title, colorScheme, opacity, scale, x, y, width, height, children }) => (
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
    {/* Step badge - floating above */}
    <div style={{
      position: "absolute",
      top: -24,
      left: 24,
      background: `linear-gradient(135deg, ${colorScheme.border} 0%, ${colorScheme.glow} 100%)`,
      padding: "10px 24px",
      borderRadius: "14px 14px 0 0",
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: 2,
      textTransform: "uppercase",
      boxShadow: `0 -4px 30px ${colorScheme.glow}`,
      fontFamily: "'SF Mono', monospace",
    }}>
      Step {step}: {title}
    </div>

    {/* Main container with dashed border */}
    <div style={{
      width: "100%",
      height: "100%",
      border: `2px dashed ${colorScheme.border}50`,
      borderRadius: 20,
      padding: 30,
      background: colorScheme.bg,
      backdropFilter: "blur(8px)",
      display: "flex",
      flexWrap: "wrap",
      gap: 24,
      alignContent: "flex-start",
      justifyContent: "center",
    }}>
      {children}
    </div>
  </div>
);
```

### Color Schemes za Steps

```tsx
const stepColors = {
  step1: {
    border: "#a855f7",  // Purple
    glow: "rgba(168, 85, 247, 0.4)",
    bg: "linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%)",
  },
  step2: {
    border: "#f97316",  // Orange
    glow: "rgba(249, 115, 22, 0.4)",
    bg: "linear-gradient(145deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)",
  },
  step3: {
    border: "#22c55e",  // Green
    glow: "rgba(34, 197, 94, 0.4)",
    bg: "linear-gradient(145deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)",
  },
};
```

## Layout

### Horizontal (3 koraka u redu)
```tsx
const stickyWidth = 500;
const stickyHeight = 400;
const gap = 60;

const step1X = 100;
const step2X = step1X + stickyWidth + gap;
const step3X = step2X + stickyWidth + gap;
const stepY = 200;
```

### Vertical (koraci jedan ispod drugog)
```tsx
const stickyWidth = 800;
const stickyHeight = 300;
const gap = 80;

const stepX = 200;
const step1Y = 100;
const step2Y = step1Y + stickyHeight + gap;
const step3Y = step2Y + stickyHeight + gap;
```

## Animation Timing

```tsx
// StickyNote se pojavljuje PRVI
// SectionBox-ovi unutra imaju stagger

<StickyNote opacity={getOpacity(500)} scale={getScale(500)}>
  <SectionBox opacity={getOpacity(510)} scale={getScale(510)}>
    <NodeItem delay={520} />
    <NodeItem delay={526} />
  </SectionBox>
  <SectionBox opacity={getOpacity(540)} scale={getScale(540)}>
    <NodeItem delay={550} />
  </SectionBox>
</StickyNote>
```

## Camera Flow

```tsx
// Camera se pomera između StickyNotes, ne između SectionBox-ova
const cameraKeyframes = [
  { frame: 0, x: 600, y: 400, scale: 0.7 },    // Overview - vide se svi
  { frame: 100, x: 350, y: 400, scale: 1.0 },  // Zoom to Step 1
  { frame: 400, x: 850, y: 400, scale: 1.0 },  // Pan to Step 2
  { frame: 700, x: 1350, y: 400, scale: 1.0 }, // Pan to Step 3
];
```

## Lines Between Steps

```tsx
// Linije idu IZMEĐU StickyNotes, ne između SectionBox-ova
<AnimatedLine
  x1={step1X + stickyWidth}
  y1={stepY + stickyHeight/2}
  x2={step2X}
  y2={stepY + stickyHeight/2}
  progress={getLineProgress(410)}
/>
```

## Example: RAG Pipeline

**Transcript:**
> "Step one, retrieve... The chunks become your context.
> In step two, augment... combine with the original query into a prompt.
> Step three, generate... pass that prompt to the LLM."

**dynamic-config.json:**
```json
{
  "title": "RAG Pipeline",
  "subtitle": "Retrieval Augmented Generation",
  "fps": 30,
  "totalFrames": 1153,
  "stickies": [
    {
      "step": 1,
      "title": "Retrieve",
      "color": "#a855f7",
      "sections": [
        {
          "id": "SEARCH",
          "title": "Search",
          "colorKey": "userQuery",
          "startFrame": 129,
          "nodes": [
            { "label": "Query", "icon": "search" },
            { "label": "Vector DB", "icon": "database" }
          ]
        },
        {
          "id": "RESULTS",
          "title": "Results",
          "colorKey": "embedding",
          "startFrame": 254,
          "nodes": [
            { "label": "Chunks", "icon": "file" },
            { "label": "Context", "icon": "layers" }
          ]
        }
      ]
    },
    {
      "step": 2,
      "title": "Augment",
      "color": "#f97316",
      "sections": [
        {
          "id": "COMBINE",
          "title": "Combine",
          "colorKey": "augment",
          "startFrame": 581,
          "nodes": [
            { "label": "Context", "icon": "layers" },
            { "label": "Query", "icon": "terminal" },
            { "label": "Prompt", "icon": "merge" }
          ]
        }
      ]
    },
    {
      "step": 3,
      "title": "Generate",
      "color": "#22c55e",
      "sections": [
        {
          "id": "LLM",
          "title": "LLM",
          "colorKey": "generate",
          "startFrame": 893,
          "nodes": [
            { "label": "Process", "icon": "cpu" },
            { "label": "Response", "icon": "sparkle" }
          ]
        }
      ]
    }
  ]
}
```

**Color Keys Available:**
- `userQuery` (blue), `embedding` (teal), `vectorSearch` (amber)
- `retrieve` (purple), `augment` (orange), `generate` (green)

**Icons Available:**
- `user`, `search`, `terminal`, `cube`, `vector`, `database`
- `zap`, `file`, `layers`, `merge`, `sparkle`, `cpu`
