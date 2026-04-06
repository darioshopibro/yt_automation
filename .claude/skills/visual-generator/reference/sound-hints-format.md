# Sound Hints Format + Sound Komentari

## sound_hints_X.json format

```json
{
  "segment": "How Docker Works",
  "segmentIndex": 2,
  "startFrame": 150,
  "endFrame": 900,
  "frameMode": "global",
  "events": [
    { "frame": 150, "type": "scene_start", "description": "segment opens, title text fades in" },
    { "frame": 200, "type": "element_appear", "description": "Docker logo slides in from left" },
    { "frame": 350, "type": "element_appear", "description": "3 container boxes pop in staggered" },
    { "frame": 500, "type": "reveal", "description": "big stat number ' 60%' scales up — key info" },
    { "frame": 700, "type": "transition", "description": "scene crossfades to comparison view" },
    { "frame": 850, "type": "element_disappear", "description": "elements fade out, segment ending" }
  ]
}
```

## Event types

- `scene_start` — početak segmenta, prvi elementi se pojavljuju
- `element_appear` — nov element se pojavljuje (slide-in, fade-in, pop)
- `reveal` — BITAN momenat — ključna informacija, šokantan podatak, veliki broj
- `transition` — promena scene unutar segmenta
- `element_disappear` — elementi nestaju (fade-out, slide-out)
- `staggered_group` — više elemenata u nizu (npr. 5 ikona redom) — zapiši JEDNOM, ne za svaki

## Pravila

- `frame` je UVEK GLOBALNI frame (apsolutni od početka videa)
- `frameMode` je UVEK `"global"`
- `description` mora opisati ŠTA se vizuelno dešava, ne šta narator kaže
- Zapiši SVE vizuelne promene — bolje previše hints nego premalo
- NE biraj zvukove, NE piši volume, NE referenciraj .mp3 fajlove

---

## 🔊 SOUND Komentari u .tsx — OBAVEZNO

Na SVAKI `interpolate()` ili `spring()` koji pokreće vizuelnu promenu, dodaj komentar:

```tsx
// 🔊 SOUND: element_appear @ frame 200 — arrow draws from domain to IP
const arrowProgress = interpolate(frame, [200, 230], [0, 1], { extrapolateRight: 'clamp' });

// 🔊 SOUND: reveal @ frame 350 — IP address pops in big
const ipScale = interpolate(frame, [350, 365], [0, 1], { extrapolateRight: 'clamp' });

// 🔊 SOUND: transition @ frame 500 — scene wipes to resolver diagram
const sceneOpacity = interpolate(frame, [500, 515], [0, 1], { extrapolateRight: 'clamp' });
```

**Format:** `// 🔊 SOUND: {event_type} @ frame {N} — {šta se vizuelno dešava}`

Sound Coordinator čita ove komentare iz .tsx fajlova kao backup za sound_hints JSON. Ovo osigurava da SVAKA animacija ima zvuk — ne može da se promaši.
