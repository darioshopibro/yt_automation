# Component Skeleton — Template za nove vizuale

Svaki novi vizual MORA pratiti isti dizajn kao postojeći. Pre pisanja, PROČITAJ 2-3 postojeće komponente da vidiš tačan stil.

---

## OBAVEZNO pročitaj pre generisanja

### Remotion API pravila (OBAVEZNO za napredne vizuale!)

Ako vizual koristi BILO STA od ovoga — PRVO procitaj:
**`.claude/skills/remotion-motion/reference/remotion-coding-rules.md`**

- **Slike** → `<Img>` iz Remotion-a, NIKAD HTML `<img>` ili CSS background-image
- **Video embed** → `<Video>` sa trimBefore/trimAfter, volume callback
- **GIF/animirane slike** → `<AnimatedImage>` sa playbackRate i loop
- **Lottie animacije** → `delayRender()`/`continueRender()` pattern, `premountFor`
- **SVG path animacije** → `evolvePath()` iz `@remotion/paths`
- **Text fitting** → `fitText()` iz `@remotion/layout-utils` za auto-sizing
- **Audio vizualizacija** → `visualizeAudio()` za beat-reactive efekte
- **Spring animacije** → `spring()` za poziciju/scale, `interpolate()` za opacity
- **UVEK** `extrapolateLeft: "clamp", extrapolateRight: "clamp"` na interpolate

Bez tog fajla, vizual moze imati flickering, broken renderovanje, ili CSS animacije koje ne rade u renderovanju.

### Postojece komponente (procitaj 2+ za dizajn pattern)

```
templates/ai-video-gen-pipeline/src/visuals/LogoGridVisual.tsx    — grid layout, icon boxes, Phosphor ikone
templates/ai-video-gen-pipeline/src/visuals/HierarchyVisual.tsx   — tree sa konekcijama (div connectors)
templates/ai-video-gen-pipeline/src/visuals/ProcessStepsVisual.tsx — numerisani koraci, circle + connector linije
templates/ai-video-gen-pipeline/src/visuals/StatsVisual.tsx       — grid brojeva, count-up animacija
templates/ai-video-gen-pipeline/src/visuals/TimelineVisual.tsx    — tačke + linije, gradient connectors
templates/ai-video-gen-pipeline/src/visuals/BarChartVisual.tsx    — barovi sa ease-out animacijom
templates/ai-video-gen-pipeline/src/visuals/SplitScreenVisual.tsx — dva panela sa divider-om
```

**KOPIRAJ ISTE PATTERNE — ne izmišljaj novi stil!**

---

## Dizajn sistem (izvučen iz postojećih komponenti)

### Container (SVE komponente imaju ovo)
```tsx
<div style={{
  background: "#0f0f1a",
  borderRadius: 12,
  border: "1px solid #1a1a2e",
  padding: "24px 20px",    // ili "24px 28px"
  fontFamily: "'Inter', system-ui, sans-serif",
  width: "100%",
}}>
```

### Node/Item box (kao u LogoGrid, Stats)
```tsx
<div style={{
  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
  padding: "14px 8px", borderRadius: 10,
  background: `${color}08`,           // VEOMA blagi tint
  border: `1px solid ${color}15`,      // VEOMA blagi border
}}>
```

### Icon box (kao u LogoGrid — OBAVEZAN za vizuale sa ikonama)
```tsx
<div style={{
  width: 44, height: 44, borderRadius: 12,
  background: `linear-gradient(135deg, ${color}20, ${color}08)`,
  border: `1.5px solid ${color}30`,
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: `0 0 15px ${color}15`,
}}>
  <IconComponent size={24} color={color} weight="duotone" style={{
    filter: `drop-shadow(0 0 8px ${color}60)`,
  }} />
</div>
```

### Connector linije (kao u Hierarchy, ProcessSteps, Timeline)
```tsx
// Vertikalni connector
<div style={{ width: 2, height: 16, background: `${color}30` }} />

// Horizontalni connector
<div style={{ height: 2, width: 16, background: `${color}30` }} />

// Gradient connector (kao Timeline)
<div style={{
  width: 2, flex: 1,
  background: `linear-gradient(${color}60, ${nextColor}30)`,
  minHeight: 30,
}} />
```

### Circle indicator (kao ProcessSteps, Timeline)
```tsx
// Tačka
<div style={{
  width: 14, height: 14, borderRadius: "50%",
  background: color,
  boxShadow: `0 0 12px ${color}60`,
  border: "2px solid #0f0f1a",
}} />

// Numerisani krug
<div style={{
  width: 32, height: 32, borderRadius: "50%",
  background: isActive ? color : `${color}20`,
  border: `2px solid ${color}`,
  boxShadow: isActive ? `0 0 15px ${color}40` : "none",
}}>
```

### Glow za highlighted elemente
```tsx
boxShadow: `0 0 20px ${color}20`   // suptilni glow
boxShadow: `0 0 15px ${color}40`   // jači glow (aktivni element)
textShadow: `0 0 30px ${color}30`  // text glow (veliki brojevi)
```

### Boje
```tsx
const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

// Tekst
"#e2e8f0"  // primary text (svetlo siva)
"#94a3b8"  // secondary text / labels (muted)
"#64748b"  // tertiary text (dim)
"#4a4a5e"  // disabled text

// Pozadine
"#0f0f1a"  // main background
"#12121f"  // slightly lighter bg
"#1a1a2e"  // border, inactive backgrounds
"#2a2a3e"  // inactive borders
```

### Tipografija
```tsx
// Regular text
fontFamily: "'Inter', system-ui, sans-serif"
fontSize: 12-13   // body
fontSize: 10-11    // labels, subtitles
fontWeight: 500-600

// Mono text (labels, brojevi, kod)
fontFamily: "'SF Mono', monospace"
fontWeight: 600-700
letterSpacing: -1 (za velike brojeve)
letterSpacing: 1.5 (za uppercase labels)

// Section titles
fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5
```

### Ikone — Phosphor
```tsx
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";  // fallback

const getPhosphorIcon = (name: string): React.FC<any> => {
  const IconComp = (PhosphorIcons as Record<string, unknown>)[name];
  if (IconComp) return IconComp as React.FC<any>;
  return Cube as React.FC<any>;  // fallback
};

// Usage: <IconComponent size={24} color={color} weight="duotone" />
```

---

## Template struktura

```tsx
import React from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

/**
 * {VISUAL_NAME} VISUAL
 * Config: { ... }
 */

interface {ItemType} {
  label: string;
  // specifični props
}

interface Props {
  items: {ItemType}[];   // ILI drugi data format ako ima smisla (vidi nodes+connections)
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const getPhosphorIcon = (name: string): React.FC<any> => {
  const IconComp = (PhosphorIcons as Record<string, unknown>)[name];
  if (IconComp) return IconComp as React.FC<any>;
  return Cube as React.FC<any>;
};

const {VisualName}: React.FC<Props> = ({
  items, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const mode = shapeMode ?? "square";
  const isWide = mode === "wide";
  const easedProgress = easeOut(Math.min(progress * 1.5, 1));
  const visibleCount = Math.ceil(items.length * easedProgress);

  // SQUARE layout
  if (!isWide) {
    return (
      <div style={{
        background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e",
        padding: "24px 20px", fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
      }}>
        {/* Square rendering */}
      </div>
    );
  }

  // WIDE layout
  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e",
      padding: "24px 20px", fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
    }}>
      {/* Wide rendering */}
    </div>
  );
};

export default {VisualName};
```

---

## NIKAD ne radi ovo

- **NIKAD** drugačije boje pozadine (ne #111, ne #1a1a1a, ne #000)
- **NIKAD** bele pozadine ili svetle teme
- **NIKAD** border-radius različit od 10-12px
- **NIKAD** fontove koji nisu Inter ili SF Mono
- **NIKAD** opacity umesto hex alpha (#3b82f620 DA, rgba(59,130,246,0.12) NE)
- **NIKAD** veći padding od 28px ili manji od 12px
- **NIKAD** font-size veći od 32px (osim kinetic typography)
- **NIKAD** SVG za cele vizuale — koristi HTML/CSS divove, SVG samo za konekcione linije ako je neophodno

---

## Checklist pre finalizacije

- [ ] Pročitao sam 2+ postojeće komponente pre pisanja?
- [ ] Container: #0f0f1a, borderRadius 12, border 1px solid #1a1a2e?
- [ ] Item boxes: ${color}08 background, ${color}15 border?
- [ ] Icon boxes: linear-gradient(135deg), 1.5px solid, glow?
- [ ] progress=0 → prazan, progress=1 → pun?
- [ ] shapeMode="square" i "wide" oba rade?
- [ ] Koristi defaultColors niz kad item nema boju?
- [ ] Phosphor ikone sa weight="duotone"?
- [ ] Fontovi: Inter za tekst, SF Mono za labels/brojeve?
- [ ] items[] prazan array ne crasha?
