# Future Upgrades — Stvari koje mozemo dodati kad budemo implementirali

> Ovo su tehnike iz community template-ova koje smo istrazili i koje VREDE.
> Kad budemo dodavali neku od ovih — ovde su detalji kako rade i kad da se koriste.
> Izvor repozitorijumi pullovani u `research/community-templates/`.

---

## 1. Prism Code Highlighting — Fireship standard

**Izvor:** `wcandillon/remotion-fireship` → `src/Video/components/Code.tsx`
**Paket:** `prism-react-renderer`

Syntax highlighting sa One Dark temom i macOS stoplight dugmicima (crveno/zuto/zeleno).
Ovo je THE Fireship kod komponenta — svaki "code in 100 seconds" video koristi ovo.

### Kad koristiti umesto naseg CodeBlockVisual
```
PRISM (statican highlight, Fireship stil):
  ✅ Prikaz koda sa macOS window chrome
  ✅ One Dark tema (tamna, profesionalna)
  ✅ Bolji syntax highlighting od naseg (vise jezika, tacniji tokeni)
  → Za snapshot kod prikaze gde ne treba typing animacija

NAS CodeBlockVisual:
  ✅ Typing animacija (karakter po karakter)
  ✅ Vec integrisan u pipeline (progress prop)
  → Za "pisanje koda" efekat

CODE HIKE:
  ✅ Token morphing izmedju koraka
  → Za code walkthrough sa vise koraka
```

### Implementacija
```tsx
import { Highlight, themes } from "prism-react-renderer";

<Highlight theme={themes.oneDark} code={codeString} language="tsx">
  {({ style, tokens, getLineProps, getTokenProps }) => (
    <pre style={{ ...style, padding: 20, borderRadius: 12 }}>
      {tokens.map((line, i) => (
        <div key={i} {...getLineProps({ line })}>
          {line.map((token, key) => (
            <span key={key} {...getTokenProps({ token })} />
          ))}
        </div>
      ))}
    </pre>
  )}
</Highlight>
```

### macOS stoplight dugmici
```tsx
const Stoplights = () => (
  <div style={{ display: "flex", gap: 8, padding: "12px 16px" }}>
    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
    <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
  </div>
);
```

---

## 2. remapSpeed — Varijabilna brzina unutar scene

**Izvor:** `wcandillon/remotion-fireship` → `src/Video/DataDriven/remap-speed.ts`
**13 linija koda.**

Omogucava slow-motion i speed-up UNUTAR jedne scene. Npr. brzo proletis
kroz setup, usporis na bitan deo, pa opet ubrzas.

### Implementacija (kompletna)
```tsx
type SpeedRange = { from: number; to: number; speed: number };

const remapSpeed = (frame: number, ranges: SpeedRange[]): number => {
  let currentFrame = 0;
  for (const range of ranges) {
    const rangeFrames = range.to - range.from;
    if (frame < range.from + rangeFrames) {
      const progress = (frame - range.from) / rangeFrames;
      return currentFrame + progress * rangeFrames * range.speed;
    }
    currentFrame += rangeFrames * range.speed;
  }
  return currentFrame;
};

// Koriscenje:
const mappedFrame = remapSpeed(frame, [
  { from: 0, to: 60, speed: 2 },     // 2x brzo (setup)
  { from: 60, to: 120, speed: 0.5 },  // 0.5x slow-mo (bitan deo)
  { from: 120, to: 180, speed: 1 },   // normalno
]);
```

### Kad koristiti
- Demo video sa brzim setupom i sporim highlight-om
- Typing animacija koja ubrzava na boilerplate delu
- Camera pan koji usporava kad stigne do cilja

---

## 3. Audio Waveform vizualizacije

**Izvor:** `reactvideoeditor/clippkit` → 3 komponente
**Paketi:** `@remotion/media-utils` (vec u coding rules)

Tri tipa: Bar (vertikalni barovi), Circular (radijalni), Linear (smooth SVG path).

### Bar Waveform
```tsx
const viz = visualizeAudioWaveform({
  fps, frame, audioData, numberOfSamples: 64,
});

// SVG barovi
{viz.map((v, i) => (
  <rect x={i * (barWidth + gap)} y={height - v * height}
    width={barWidth} height={v * height} fill={color} rx={2} />
))}
```

### Circular Waveform
```tsx
// Barovi rasporedieni u krug (trigonometrija)
{viz.map((v, i) => {
  const angle = (i / viz.length) * Math.PI * 2;
  const innerRadius = 50;
  const barLength = v * maxBarLength;
  const x1 = Math.cos(angle) * innerRadius;
  const y1 = Math.sin(angle) * innerRadius;
  const x2 = Math.cos(angle) * (innerRadius + barLength);
  const y2 = Math.sin(angle) * (innerRadius + barLength);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} />;
})}
```

### Kad koristiti
- Pozadinski efekat dok voiceover prica (subtle bar waveform)
- Music visualization sekcija
- Podcast-stil content

---

## 4. ZoomableVideo — Timed zoom segmenti

**Izvor:** `jhartquist/claude-remotion-kickstart` → `src/components/ZoomableVideo.tsx`

Video sa vremenski odredjenim zoom segmentima — Ken Burns efekat.
Npr. prikazi ceo ekran, pa zumuj na dugme, pa zumuj na rezultat.

### Koncept
```tsx
type ZoomSegment = {
  startFrame: number;
  endFrame: number;
  x: number;        // Centar zoom-a (0-1)
  y: number;        // Centar zoom-a (0-1)
  scale: number;    // Koliko zumovano (1 = normalno, 2 = 2x)
};

const segments: ZoomSegment[] = [
  { startFrame: 0, endFrame: 90, x: 0.5, y: 0.5, scale: 1 },      // Full view
  { startFrame: 90, endFrame: 180, x: 0.7, y: 0.3, scale: 2.5 },   // Zoom na dugme
  { startFrame: 180, endFrame: 270, x: 0.3, y: 0.6, scale: 1.8 },  // Zoom na rezultat
];

// Animacija izmedju segmenata sa spring easing
```

### Kad koristiti
- Screen recording demo — zumuj na bitan deo UI-a
- Website showcase — prikazi celu stranicu pa zumuj na feature
- B-roll video sa dinamicnim zoom-om

---

## 5. Mermaid/D2 Diagrams (za Interactive Diagram)

**Izvor:** `jhartquist/claude-remotion-kickstart` → `src/components/Diagram.tsx`
**Paketi:** `mermaid`, `@terrastruct/d2`

Deklarativno opisujes dijagram u tekstu → renderuje se u SVG.
Njihov je STATICAN — mi bismo dodali animaciju na vrh.

### Mermaid primer
```
graph LR
  A[Event] --> B[Lambda]
  B --> C[Result]
  B --> D[S3 Storage]
```

### D2 primer (bogatiji — shapes, styles, icons)
```
cloud: Cloud Provider {
  shape: cloud
  style.fill: "#1a1a2e"
}
lambda: Lambda Function {
  shape: hexagon
  style.fill: "#f97316"
}
cloud -> lambda: triggers
```

### Za nas Interactive Diagram:
```
1. AI generise Mermaid/D2 definiciju iz transcripta
2. Renderuje se u SVG (layout automatski)
3. Mi animiramo: element po element appear, linije se crtaju (evolvePath)
4. State changes: highlight, eliminate, connect — po frameovima
```

---

## CHECKLIST: Sta instalirati kad budemo implementirali

```bash
# Code Hike (token morphing)
npm install codehike @code-hike/lighter

# Prism (Fireship-style code)
npm install prism-react-renderer

# Preload (smoother preview) — VEC DODATO U CODING RULES
npm install @remotion/preload

# Mermaid diagrams
npm install mermaid

# D2 diagrams
npm install @terrastruct/d2
```
