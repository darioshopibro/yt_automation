# Design System Reference

Premium dark theme stil, glassmorphism, glow efekti.

> **ZAPAMTI:** Ovo je deo JEDNE KOMPOZICIJE - design podržava animacije i zvukove.

---

## COLOR SYSTEM

```tsx
const colors = {
  bg: "#030305",
  bgGradient1: "#080810",
  bgGradient2: "#050508",

  text: "#f8fafc",
  textMuted: "#94a3b8",
  textAccent: "#e2e8f0",

  // Svaki element ima svoj color scheme:
  example: {
    bg: "linear-gradient(145deg, #0f3d3d 0%, #082828 50%, #051a1a 100%)",
    border: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.4)",
    accent: "#5eead4",
  },
};
```

**PRAVILO**: Uvek gradient za background, nikad flat color!

---

## GLASSMORPHISM STIL

```tsx
const glassStyle = (borderColor: string, glowColor: string) => ({
  backdropFilter: "blur(16px) saturate(180%)",
  WebkitBackdropFilter: "blur(16px) saturate(180%)",
  border: `1.5px solid ${borderColor}40`,
  boxShadow: `
    0 0 60px ${glowColor},
    0 0 100px ${glowColor}50,
    0 8px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
  `,
  borderRadius: 20,
});
```

---

## LAYOUT PRAVILA (KRITIČNO!)

### Flexbox Centering
```tsx
<div style={{
  display: "flex",
  flexWrap: "wrap",
  gap: 20,
  justifyContent: "center",      // OBAVEZNO!
  alignItems: "flex-start",
  alignContent: "flex-start",
}}>
  {children}
</div>
```

### Fiksna Širina Elemenata
```tsx
<div style={{
  width: 85,          // FIKSNO!
  flexShrink: 0,      // NE SMANJUJ!
}}>
```

### Proporcionalne Veličine
- 3 itema: container ~350px
- 4 itema: container ~260-280px (2x2)
- 5 itema: container ~350px (3+2)

---

## BACKGROUND EFFECTS

### PRAVILO: Static > Animated!
Animirane pozadine odvlače pažnju. Koristi STATIČNE.

### Static Mesh Gradient (PREPORUČENO)
```tsx
<svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.5 }}>
  <defs>
    <radialGradient id="mesh1" cx="30%" cy="30%">
      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12"/>
      <stop offset="100%" stopColor="transparent"/>
    </radialGradient>
  </defs>
  <ellipse cx="30%" cy="30%" rx="40%" ry="35%" fill="url(#mesh1)"/>
</svg>
```

### Grid sa Fade
```tsx
<svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.08 }}>
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>
</svg>
```

---

## OVERLAY EFFECTS

### Vignette
```tsx
<div style={{
  position: "absolute",
  inset: 0,
  background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)",
  pointerEvents: "none",
}}/>
```

### Scanlines
```tsx
<div style={{
  position: "absolute",
  inset: 0,
  background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
  pointerEvents: "none",
  opacity: 0.5,
}}/>
```

---

## ICONS SA GLOW

```tsx
const iconStyle = {
  filter: `drop-shadow(0 0 10px ${color}60) drop-shadow(0 0 20px ${color}30)`,
};

<svg width={28} height={28} viewBox="0 0 24 24"
     fill="none" stroke={color} strokeWidth="1.5"
     style={iconStyle}>
  {/* SVG paths */}
</svg>
```

---

## ANIMATED LINES (SVG)

```tsx
const AnimatedLine = ({ x1, y1, x2, y2, progress, color }) => (
  <g>
    {/* Outer glow */}
    <line x1={x1} y1={y1} x2={endX} y2={endY}
      stroke={color} strokeWidth={8} strokeOpacity={0.2} filter="blur(6px)" />
    {/* Main line */}
    <line x1={x1} y1={y1} x2={endX} y2={endY}
      stroke={color} strokeWidth={2} />
  </g>
);
```

**PRAVILO**: NE koristi dashed linije. Solid izgleda profesionalnije.

---

## TITLE COMPONENT

```tsx
<div style={{
  fontSize: 42,
  fontWeight: 800,
  background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: -1.5,
}}>
  Title Here
</div>
```

---

## DEKORACIJE

### Corner Accents
```tsx
<div style={{
  position: "absolute",
  top: 0, left: 0,
  width: 40, height: 40,
  borderTop: `2px solid ${accentColor}`,
  borderLeft: `2px solid ${accentColor}`,
  borderTopLeftRadius: 20,
  opacity: 0.6,
}}/>
```
