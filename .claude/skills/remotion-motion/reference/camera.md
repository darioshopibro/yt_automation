# Camera & Animation Reference

Detaljna pravila za camera keyframes i animacije.

> **ZAPAMTI:** Ovo je deo JEDNE KOMPOZICIJE - camera, sound, design se planiraju ZAJEDNO.

---

## CAMERA KEYFRAMES

### Struktura
```tsx
const cameraKeyframes = [
  { frame: 0, x: 230, y: 490, scale: 1.1 },      // Section 1
  { frame: 220, x: 635, y: 490, scale: 1.0 },    // Section 2
  { frame: 515, x: 1085, y: 450, scale: 0.95 },  // Section 3
];
```

### Timing pravilo
```
Camera pomera se ~15 frames PRE nego što sekcija počne (anticipation)
```

### Spring Config za Smooth Camera
```tsx
// SMOOTH camera movement
config: { damping: 22, stiffness: 90 }

// Transition duration: 45 frames (~1.5 sec)
```

### Camera Breathing (subtle drift)
```tsx
const breathingX = Math.sin(frame * 0.05) * 6;
const breathingY = Math.cos(frame * 0.04) * 3;

// Dodaj na camera position
x: baseX + breathingX,
y: baseY + breathingY,
```

---

## ANIMATION TIMING (Fireship Style)

### Animation Durations (@ 30fps)
| Animacija | Frames | Milisekunde | Feel |
|-----------|--------|-------------|------|
| Micro (button, toggle) | 3-6 | 100-200ms | Instant |
| **Element fade-in** | **6-9** | **200-300ms** | **Snappy** |
| **Element scale-in** | **8-12** | **250-400ms** | **Smooth** |
| Scene transition | 9-15 | 300-500ms | Quick |
| **Camera zoom/pan** | **12-18** | **400-600ms** | **Snappy** |

### Spring Configs
```tsx
// SNAPPY (preporučeno za elemente)
config: { damping: 15, stiffness: 120 }

// BOUNCY (za hero elemente)
config: { damping: 12, stiffness: 150 }

// SMOOTH (za camera)
config: { damping: 22, stiffness: 90 }
```

---

## STAGGER ANIMATIONS

### Timing
```tsx
// BRZO - Fireship stil (4 frames = 133ms između)
<Item delay={18} />
<Item delay={22} />  // +4
<Item delay={26} />  // +4

// SREDNJE (6 frames = 200ms)
// SPORO (10 frames = 333ms) - izbegavaj!
```

### Helper funkcije
```tsx
const getOpacity = (startFrame: number, duration = 8) =>
  interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const getScale = (startFrame: number, duration = 10) =>
  interpolate(frame, [startFrame, startFrame + duration], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.2)),
  });
```

---

## INTERPOLATE vs SPRING

### Interpolate - Linear/Eased
```tsx
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.back(1.5)),  // Bounce
});
```

### Spring - Prirodna
```tsx
const springValue = spring({
  frame: frame - 30,  // Počinje na frame 30
  fps,
  config: { damping: 12, stiffness: 100 },
});
```

---

## COMMON CAMERA ERRORS

| Simptom | Uzrok | Fix |
|---------|-------|-----|
| Camera snaps | Transition prebrz | 45 frames, damping: 22 |
| Camera "mrtva" | Nema breathing | Dodaj sin/cos drift |
| Prespore animacije | duration > 15 | Koristi 8-12 frames |
| Elementi skaču | Loš easing | `Easing.out(Easing.back(1.2))` |

---

## SOUND SYNC POINTS

Kad praviš camera keyframes, OZNAČI gde idu zvukovi:

```tsx
const cameraKeyframes = [
  { frame: 0, x: 230, y: 490, scale: 1.1 },    // SOUND: section whoosh
  { frame: 218, x: 635, y: 490, scale: 1.0 },  // SOUND: camera whoosh @ 218
  { frame: 513, x: 1085, y: 450, scale: 0.95 }, // SOUND: camera whoosh @ 513
];

// Camera whoosh: 2 frames PRE keyframe
// Section whoosh: 15+ frames POSLE camera završi
```
