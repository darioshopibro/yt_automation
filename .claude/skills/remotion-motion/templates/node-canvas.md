# Template: Node Canvas

Infinite canvas sa nodovima (ikonice + tekst), glassmorphism boxovi, animated linije, camera panning.

## KADA KORISTITI

- Arhitektura sistema (layeri, komponente)
- Tech stack overview
- Flowchart sa više koraka
- Bilo šta gde treba "zoom tour" kroz nodove

---

## TEMPLATE FILE

**KOPIRAJ OVAJ FAJL KAO POČETAK:**

```
/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test/src/NemoClawStack.tsx
```

Ovaj fajl je working template sa svim komponentama:
- `SectionBox` - glassmorphism box sa corner accents
- `NodeItem` - ikonica + label ispod
- `AnimatedLine` - glow linija sa pulse
- `MeshGradient` + `GridBackground` - pozadine
- Camera system sa spring interpolacijom
- Sound effects sa pravilnim gap-ovima

---

## KRITIČNA PRAVILA

### LINE TIMING RULE (VAŽNO!)

**Linija se crta POSLE oba boxa koja povezuje!**

```tsx
// POGREŠNO - linija pre boxa:
<AnimatedLine progress={getLineProgress(340)} ... />  // Linija počinje
<SectionBox opacity={getOpacity(372)} ... />           // Box 32 frejma KASNIJE!

// TAČNO - linija posle oba boxa:
sourceBox.startFrame = 48;    // Input box
destBox.startFrame = 372;     // Router box
lineStartFrame = Math.max(48, 372) + 10;  // = 382

<AnimatedLine progress={getLineProgress(382)} ... />
```

**Formula:**
```
lineStartFrame = max(sourceBox.startFrame, destBox.startFrame) + 10
```

---

### NODE GRID LAYOUT RULE (VAŽNO!)

**Koristi CSS Grid umesto flex-wrap za nodove!**

```tsx
// POGREŠNO - flex wrap pravi ružan 2+1 sa 3 itema:
<div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" }}>
  {children}
</div>

// TAČNO - grid koji se prilagođava broju itema:
const getGridCols = (count: number) => {
  if (count <= 2) return count;        // 1-2: u redu
  if (count === 3) return 3;           // 3: jedan red od 3
  if (count === 4) return 2;           // 4: 2x2
  if (count <= 6) return 3;            // 5-6: 3 kolone
  return 4;                            // 7+: 4 kolone
};

<div style={{
  display: "grid",
  gridTemplateColumns: `repeat(${getGridCols(childCount)}, minmax(0, 1fr))`,
  gap: 20,
  justifyItems: "center",
}}>
  {children}
</div>
```

**NodeItem fiksna širina:**
```tsx
// Svaki NodeItem ima istu širinu da grid radi
<div style={{ width: 85, display: "flex", flexDirection: "column", alignItems: "center" }}>
```

---

## ŠTA SE MENJA

### 1. Content (OBAVEZNO)

```tsx
// Promeni title
<div>NemoClaw Stack</div>  →  <div>Tvoj Naslov</div>

// Promeni sekcije
<SectionBox title="OpenShell" ...>  →  <SectionBox title="Tvoja Sekcija" ...>

// Promeni node iteme
<NodeItem label="OS Enforcement" icon="shield" ...>  →  <NodeItem label="Tvoj Item" icon="file" ...>
```

### 2. Colors (po potrebi)

```tsx
// Dodaj nove color schemes u `colors` object
mySection: {
  bg: "linear-gradient(145deg, #...)",
  border: "#...",
  glow: "rgba(...)",
  accent: "#...",
},
```

### 3. Icons (po potrebi)

```tsx
// Dodaj nove ikonice u `Icon` component
myIcon: (
  <svg width={size} height={size} viewBox="0 0 24 24" ...>
    ...
  </svg>
),
```

### 4. Pozicije (ako treba više/manje sekcija)

```tsx
// x, y koordinate na canvasu
<SectionBox x={100} y={250} ...>   // Levo
<SectionBox x={650} y={250} ...>   // Sredina
<SectionBox x={1200} y={250} ...>  // Desno
```

### 5. Camera keyframes (SYNC SA VOICEOVER!)

```tsx
// Frame = 15 frames PRE nego što se reč izgovori
const cameraKeyframes = [
  { frame: 0, x: 350, y: 400, scale: 1.0 },      // Start
  { frame: 485, x: 900, y: 400, scale: 1.0 },    // Section 2 (word at 501)
  { frame: 780, x: 1450, y: 400, scale: 1.0 },   // Section 3 (word at 796)
];
```

### 6. Section startFrames (SYNC SA VOICEOVER!)

```tsx
// startFrame = 5 frames PRE nego što se reč izgovori
opacity={getOpacity(496)}  // word at 501 → 501 - 5 = 496
```

### 7. Line startFrames (SYNC SA BOXOVIMA!)

```tsx
// Linija počinje 10 frames POSLE destination box-a
// Router box: getOpacity(372)
// Linija Input→Router: getLineProgress(372 + 10) = getLineProgress(382)
```

---

## WORKFLOW

1. **Generiši voiceover** → `npx ts-node scripts/generate-voice.ts`
2. **Pročitaj timestamps** iz `voiceover-timestamps.json`
3. **Kopiraj template** fajl
4. **Update content** (sekcije, nodovi, title)
5. **Update timing** (camera keyframes, startFrames) prema timestamps
6. **Update LINIJE** - svaka linija počinje POSLE oba boxa + 10 frames!
7. **Update sounds** (20+ frames gap!)

---

## SOUND RULES (podsetnik)

```tsx
// Camera whoosh: 2 frames PRE camera keyframe
<Sequence from={483} ...>  // camera at 485

// Section whoosh: 22+ frames POSLE camera
<Sequence from={505} ...>  // 483 + 22 = 505

// Volume: camera @ 0.25, section @ 0.12
```

---

## BRANCHING LAYOUTS

Za fork/merge layout (jedan box → dva boxa → jedan box):

```tsx
// Zoom out da se vide oba brancha
{ frame: 655, x: 750, y: 750, scale: 0.75 },  // scale < 1 = zoom out

// Curved lines za fork/merge
<AnimatedLine curved ... />
```

---

## REFERENCE PROJECTS

| Project | Path | Opis |
|---------|------|------|
| NemoClaw (template) | `remotion-nvidia-test/src/NemoClawStack.tsx` | 3 sekcije, linear |
| Branch Test | `remotion-branch-test/src/BranchFlow.tsx` | fork/merge layout |
| OpenClaw | `remotion-canvas-demo/src/InfiniteCanvas.tsx` | 6 sekcija, original |
