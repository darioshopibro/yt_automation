# Sound Design Reference

Pravila za zvukove u motion graphics projektima.

> **ZAPAMTI:** Ovo je deo JEDNE KOMPOZICIJE - sound se planira ZAJEDNO sa camera i animacijama.

---

## AI CONSERVATIVE RULE

**AI nema osećaj ni iskustvo za zvukove. Zato mora biti KONZERVATIVAN.**

### DODAJ SAMO:
- Camera transition whooshes (uvek radi)
- Section reveal whooshes (ako nije blizu camera)

### NE DODAJ:
- Icon pop-up sounds (lako se preteruje)
- Staggered animation sounds
- Ambience, hits, risers

### Formula za 60-sec video:
```
5-6 camera whooshes  @ 0.25 ✓
3-4 section whooshes @ 0.12 ✓ (ako nema overlap)
0 icon sounds              ✓
─────────────────────────────
TOTAL: ~10 zvukova MAX
```

---

## HIJERARHIJA ZVUKOVA

```
1. VOICEOVER      ████████████████████  (1.0)   - Nikad ne prekrivati
2. CAMERA MOVE    ████████              (0.25)  - Glavni SFX
3. SECTION REVEAL ██████                (0.12)  - Sekundarni SFX
4. ICON POP-UP    ████                  (0.15)  - Tercijarni (skip za AI)
5. AMBIENCE       ██                    (0.05)  - Background (skip za AI)
```

---

## OVERLAP RULES

### Rule 1: Camera Trumps All
```
AKO camera_moving == TRUE:
    → SAMO camera whoosh
    → NE dodavaj section/icon sounds
```

### Rule 2: 20+ Frames Gap
```
AKO |section_frame - camera_frame| < 20:
    → SKIP section whoosh
    → ILI stavi section whoosh TIŠI (0.12)
```

### Rule 3: Staggered = ONE or ZERO
```
AKO multiple_icons_staggered == TRUE:
    → NULA zvukova, ILI
    → JEDAN zvuk na prvi element
```

---

## IMPLEMENTACIJA U REMOTION

### Audio import
```tsx
import { Audio, Sequence, staticFile } from "remotion";
```

### Camera whoosh
```tsx
<Sequence from={218} durationInFrames={30}>
  <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
</Sequence>
```

### Section whoosh (tiši)
```tsx
<Sequence from={235} durationInFrames={20}>
  <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
</Sequence>
```

---

## ZVUKOVI U PROJEKTU

### Folder struktura
```
public/sounds/
├── whooshes/
│   ├── medium-whoosh.mp3  → Camera transitions
│   ├── soft-whoosh.mp3    → Section reveals
│   └── thin-whoosh.mp3    → (za ručno dodavanje)
├── hits/     → (ne koristi AI)
├── risers/   → (ne koristi AI)
└── clicks/   → (ne koristi AI)
```

### Timing pravilo
```
Camera whoosh:  START @ camera_keyframe - 2 frames
Section whoosh: START @ section_reveal frame
```

---

## CHECKLIST PRED RENDEROVANJE

- [ ] Svi camera whooshes postavljeni?
- [ ] Section whooshes NE preklapaju camera? (20+ frames gap)
- [ ] Nema icon sounds (AI skip)?
- [ ] Nema više od 10-12 zvukova za 60s?
- [ ] Volume hijerarhija: camera 0.25, section 0.12?

---

## DETALJNA DOKUMENTACIJA

Za kompletna pravila i research, vidi:
`/remotion-canvas-demo/SOUND-SYNC-RULES.md`
