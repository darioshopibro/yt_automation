# SVG/CSS Effects Reference

## 1. Gooey Metaball Filter (HIGHEST IMPACT)
Makes overlapping elements melt/fuse like liquid.
```jsx
<svg style={{ position: "absolute", width: 0, height: 0 }}>
  <defs>
    <filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
      <feColorMatrix in="blur" mode="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
      <feComposite in="SourceGraphic" in2="goo" operator="atop" />
    </filter>
  </defs>
</svg>
// Apply: style={{ filter: "url(#goo)" }}
```
- `stdDeviation 8-12` = merge radius
- `18 -7` = alpha threshold (higher = sharper edges)
- Apply to CONTAINER div, not individual elements

## 2. Film Grain Overlay
```jsx
const GrainOverlay = () => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}>
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={frame} stitchTiles="stitch" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#grain)" opacity={0.045} />
    </svg>
  );
};
```
- `seed={frame}` = animated grain (changes every frame in Remotion)
- `opacity 0.04-0.06` = subtle cinematic, `0.1+` = heavy vintage

## 3. Neon Glow (SVG filter)
```jsx
<filter id="glow-X"> // unique ID per instance!
  <feGaussianBlur stdDeviation="6" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```
- Apply on accent-colored layer (mint #80C2A0 on dark #1E3A2F)
- Stack 2 glow layers at different scales for depth

## 4. Neon Glow (CSS box-shadow)
```js
const neonGlow = (color, intensity) => ({
  boxShadow: `0 0 ${5*intensity}px ${color}, 0 0 ${10*intensity}px ${color}, 0 0 ${20*intensity}px ${color}, 0 0 ${40*intensity}px ${color}80, 0 0 ${80*intensity}px ${color}40`,
});
```

## 5. Organic Distortion
```jsx
<filter id="distort">
  <feTurbulence type="fractalNoise"
    baseFrequency={0.01 + Math.sin(frame * 0.05) * 0.005}
    numOctaves="3" seed={Math.floor(frame / 3)} />
  <feDisplacementMap in="SourceGraphic" scale={15}
    xChannelSelector="R" yChannelSelector="G" />
</filter>
```

## 6. Glassmorphism
```js
const glass = {
  background: 'rgba(30, 58, 47, 0.25)',
  backdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid rgba(128, 194, 160, 0.18)',
};
```

## 7. Multi-layer Realistic Shadow
```js
const shadow = (elevation) => ({
  boxShadow: `0 ${1*elevation}px ${2*elevation}px rgba(0,0,0,0.24), 0 ${4*elevation}px ${8*elevation}px rgba(0,0,0,0.18), 0 ${12*elevation}px ${32*elevation}px rgba(0,0,0,0.12), 0 ${24*elevation}px ${64*elevation}px rgba(0,0,0,0.08)`,
});
```

## 8. mix-blend-mode
```
screen    — additive light (mint glow on dark green)
overlay   — enriches contrast
soft-light — subtle tinting
color-dodge — intense highlights
```

## CRITICAL RULES
- Always use UNIQUE filter IDs per instance (`glow-1`, `glow-2`)
- `extrapolateRight: "clamp"` on EVERY interpolate
- SVG filters recalculate per frame in Remotion — this is fine
- `backdrop-filter` is expensive — max 1-2 elements per scene
