# Template: Infinite Canvas

Zoom through animacija - veliki canvas sa sekcijama, kamera se pomera i zumira na svaku.

## KADA KORISTITI

- Arhitektura sistema
- Flowchart sa više koraka
- Mind map
- Bilo šta gde treba "zoom tour" kroz dijagram

---

## KONCEPT

```
┌─────────────────────────────────────────┐
│           CANVAS (4000x2400)            │
│                                         │
│    ┌─────────┐     ┌─────────┐         │
│    │ Section │────▶│ Section │         │
│    └─────────┘     └─────────┘         │
│         │                               │
│         ▼          ┌──────────────┐    │
│    ┌─────────┐     │   VIEWPORT   │    │
│    │ Section │     │  (1920x1080) │    │
│    └─────────┘     │   Kamera     │    │
│                    └──────────────┘    │
└─────────────────────────────────────────┘
```

**Canvas** = Veliki prostor sa svim sekcijama
**Viewport** = Video output (1920x1080)
**Camera** = Kontroliše šta se vidi (x, y, scale)

---

## CANVAS SETUP

```tsx
const canvasWidth = 4000;
const canvasHeight = 2400;
const viewportWidth = 1920;
const viewportHeight = 1080;
```

### KRITIČNO - Canvas Transform

```tsx
<div style={{
  width: canvasWidth,
  height: canvasHeight,
  position: "absolute",
  left: viewportWidth / 2,    // CENTRIRANJE!
  top: viewportHeight / 2,     // CENTRIRANJE!
  transform: `scale(${cameraScale}) translate(${-cameraX}px, ${-cameraY}px)`,
  transformOrigin: "0 0",      // MORA BITI 0 0!
}}>
  {/* Sections, lines, etc */}
</div>
```

**GREŠKA**: Bez `left/top` centering, canvas je u gornjem levom uglu viewport-a!

---

## CAMERA SYSTEM

```tsx
// Keyframes - frame, x, y, scale
const cameraKeyframes = [
  { frame: 0, x: 1000, y: 450, scale: 0.55 },    // Overview
  { frame: 60, x: 230, y: 490, scale: 1.1 },     // Section 1
  { frame: 150, x: 635, y: 490, scale: 1.0 },    // Section 2
  { frame: 240, x: 1085, y: 450, scale: 0.95 },  // Section 3
  // ... više sekcija
  { frame: 570, x: 1000, y: 450, scale: 0.55 },  // Nazad na overview (LOOP!)
];

// Spring interpolacija između keyframes
const getCameraValue = (prop: "x" | "y" | "scale") => {
  for (let i = 0; i < cameraKeyframes.length - 1; i++) {
    const current = cameraKeyframes[i];
    const next = cameraKeyframes[i + 1];
    if (frame >= current.frame && frame < next.frame) {
      // SMOOTH camera - 45 frames (~1.5 sec), NOT snappy
      const transitionDuration = 45;
      const springValue = spring({
        frame: frame - current.frame,
        fps,
        config: { damping: 22, stiffness: 90 },  // Smooth, settles nicely
        durationInFrames: transitionDuration,
      });
      return current[prop] + (next[prop] - current[prop]) * Math.min(springValue, 1);
    }
  }
  return cameraKeyframes[cameraKeyframes.length - 1][prop];
};

const baseCameraX = getCameraValue("x");
const baseCameraY = getCameraValue("y");
const cameraScale = getCameraValue("scale");

// Subtle idle drift - breathing movement (camera feels "alive")
const driftX = Math.sin(frame * 0.05) * 6;
const driftY = Math.cos(frame * 0.04) * 3;

const cameraX = baseCameraX + driftX;
const cameraY = baseCameraY + driftY;
```

**PRAVILO**: Poslednji keyframe = prvi keyframe (za seamless loop)

### Camera Config Guidelines

| Scenario | Spring Config | Transition | Feel |
|----------|---------------|------------|------|
| **Smooth camera pan** | `damping: 22, stiffness: 90` | 45 frames | Cinematic |
| Snappy zoom | `damping: 15, stiffness: 120` | 18 frames | Fireship |
| Slow reveal | `damping: 25, stiffness: 60` | 60 frames | Documentary |

### Breathing Movement

Dodaje subtilno "živo" pomeranje kamere dok stoji:

```tsx
// Values: speed * amplitude
const driftX = Math.sin(frame * 0.05) * 6;  // ~6px horizontal
const driftY = Math.cos(frame * 0.04) * 3;  // ~3px vertical
```

**Tune-ovanje:**
- Veći speed (0.08) = brže pomeranje, nervoznije
- Manji speed (0.02) = sporije, mirnije
- Veća amplituda (10) = primetnije pomeranje
- Manja amplituda (3) = subtilnije

**GREŠKA**: Bez breathing-a kamera izgleda "mrtvo" i statično!

---

## SECTION BOX COMPONENT

```tsx
const SectionBox = ({ title, colorScheme, x, y, width, height, opacity, scale, children }) => (
  <div style={{
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    background: colorScheme.bg,
    backdropFilter: "blur(16px) saturate(180%)",
    border: `1.5px solid ${colorScheme.border}40`,
    boxShadow: `
      0 0 60px ${colorScheme.glow},
      0 0 100px ${colorScheme.glow}50,
      0 8px 40px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.08)
    `,
    borderRadius: 20,
    padding: 24,
    opacity,
    display: "flex",
    flexDirection: "column",
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }}>
    {/* Corner accents */}
    <div style={{
      position: "absolute", top: 0, left: 0,
      width: 40, height: 40,
      borderTop: `2px solid ${colorScheme.accent}`,
      borderLeft: `2px solid ${colorScheme.accent}`,
      borderTopLeftRadius: 20, opacity: 0.6,
    }}/>
    <div style={{
      position: "absolute", bottom: 0, right: 0,
      width: 40, height: 40,
      borderBottom: `2px solid ${colorScheme.accent}`,
      borderRight: `2px solid ${colorScheme.accent}`,
      borderBottomRightRadius: 20, opacity: 0.6,
    }}/>

    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: `linear-gradient(135deg, ${colorScheme.accent}, ${colorScheme.border})`,
        boxShadow: `0 0 15px ${colorScheme.glow}`,
      }}/>
      <div style={{
        fontSize: 12, fontWeight: 700, color: colorScheme.accent,
        textTransform: "uppercase", letterSpacing: 3,
        fontFamily: "'SF Mono', monospace",
      }}>
        {title}
      </div>
      <div style={{
        flex: 1, height: 1,
        background: `linear-gradient(90deg, ${colorScheme.border}40, transparent)`,
      }}/>
    </div>

    {/* Content - FLEXBOX CENTERED! */}
    <div style={{
      flex: 1,
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      justifyContent: "center",
      alignItems: "flex-start",
      alignContent: "flex-start",
    }}>
      {children}
    </div>
  </div>
);
```

---

## NODE ITEM COMPONENT

```tsx
const NodeItem = ({ label, icon, opacity, accentColor, frame, delay = 0 }) => {
  const scaleSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      opacity,
      width: 85,        // FIKSNA ŠIRINA!
      flexShrink: 0,
      transform: `scale(${Math.min(scaleSpring, 1)}) translateY(${(1 - opacity) * 15}px)`,
    }}>
      <div style={{
        width: 60,
        height: 60,
        background: "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 40px ${accentColor}15`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Shimmer */}
        <div style={{
          position: "absolute", top: 0, left: -60,
          width: 60, height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          transform: `translateX(${(frame * 2) % 180}px)`,
        }}/>
        <Icon type={icon} color={accentColor} />
      </div>
      <span style={{
        fontSize: 11,
        textAlign: "center",
        maxWidth: 75,
        fontWeight: 500,
        color: "#e2e8f0",
      }}>
        {label}
      </span>
    </div>
  );
};
```

---

## COLOR SCHEMES

```tsx
const colors = {
  bg: "#030305",

  channels: {
    bg: "linear-gradient(145deg, #0f3d3d 0%, #082828 50%, #051a1a 100%)",
    border: "#2dd4bf", glow: "rgba(45, 212, 191, 0.4)", accent: "#5eead4",
  },
  gateway: {
    bg: "linear-gradient(145deg, #1e1e3f 0%, #151530 50%, #0d0d20 100%)",
    border: "#818cf8", glow: "rgba(129, 140, 248, 0.4)", accent: "#a5b4fc",
  },
  reasoning: {
    bg: "linear-gradient(145deg, #3d1e5c 0%, #2a1540 50%, #1a0d28 100%)",
    border: "#c084fc", glow: "rgba(192, 132, 252, 0.5)", accent: "#d8b4fe",
  },
  memory: {
    bg: "linear-gradient(145deg, #3d2e0f 0%, #2a2008 50%, #1a1405 100%)",
    border: "#fbbf24", glow: "rgba(251, 191, 36, 0.4)", accent: "#fcd34d",
  },
  execution: {
    bg: "linear-gradient(145deg, #0f3d1e 0%, #082815 50%, #051a0d 100%)",
    border: "#4ade80", glow: "rgba(74, 222, 128, 0.4)", accent: "#86efac",
  },
  sessions: {
    bg: "linear-gradient(145deg, #262626 0%, #1a1a1a 50%, #0f0f0f 100%)",
    border: "#a1a1aa", glow: "rgba(161, 161, 170, 0.25)", accent: "#d4d4d8",
  },
};
```

---

## CONNECTION LINES

Pozicioniraj linije da spajaju sekcije:

```tsx
<svg style={{ position: "absolute", width: canvasWidth, height: canvasHeight, pointerEvents: "none" }}>
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  {/* x1,y1 = start point, x2,y2 = end point */}
  <AnimatedLine x1={360} y1={490} x2={460} y2={490} progress={getLineProgress(80)} color="#2dd4bf" frame={frame} />
  {/* ... više linija */}
</svg>
```

**PRAVILO**: Kad pomeriš box, MORAŠ ažurirati koordinate linija koje ga spajaju!

---

## CANVAS CHECKLIST

- [ ] Canvas centriran: `left: viewportWidth/2, top: viewportHeight/2`
- [ ] Transform origin: `0 0`
- [ ] Camera keyframes završavaju gde su počeli (loop)
- [ ] Linije koordinate odgovaraju box pozicijama
- [ ] SectionBox širine proporcionalne broju elemenata

---

## REFERENCE

Working example: `/Users/dario61/Desktop/YT automation/templates/remotion-canvas-demo/src/InfiniteCanvas.tsx`
