# Remotion Motion Graphics Skill

Pravi animirane motion graphics video od transcripta. SVE fullscreen, BEZ canvas/sticky notes.

---

## PIPELINE

```
TRANSCRIPT
    ↓
VISUAL-ROUTER — segmentira transcript na logičke celine
    ↓
REMOTION-PLANNER — voiceover + timestamps + za svaki segment pokreni visual-generator skill
    ↓
REMOTION-BUILDER — Root.tsx sa svim segmentima + voiceover Audio
    ↓
GOTOV VIDEO
```

---

## WORKFLOW

### KORAK 1: Pokreni VISUAL ROUTER

```
Koristi: remotion-visual-router skill
Input: Transcript tekst
Output: visual-structure.json (lista segmenata)
```

Router samo segmentira transcript na logičke celine. Tipično 3-6 segmenata za 4-5 min video.

### KORAK 2: Pokreni PLANNER

```
Koristi: remotion-planner skill
Input: Transcript tekst + visual-structure.json + memes.json (ako postoji) + AI clips info (ako postoji)
Output: master-plan.json + voiceover.mp3 + timestamps.json + Generated_*.tsx
```

Planner radi:
1. Čisti transcript
2. Generiše voiceover + word timestamps (ElevenLabs)
3. Mapira timestamps na segmente
4. **Čita memes.json** (ako postoji u workspace/) — odlučuje gde idu meme overlays
5. **Čita AI clips** (ako postoje u workspace/ai-clips/) — odlučuje gde idu AI video klipovi (hook, reveals)
6. **Za SVAKI segment pokreni `visual-generator` skill** — skill piše .tsx
7. Generiše master-plan.json (sa memes i AI clips pozicijama)

### KORAK 2.5: ZVUKOVI (rade SUB-AGENTI zajedno sa vizualima)

**NEMA odvojenog sound designer koraka.**
Svaki sub-agent koji pravi vizual za segment PRAVI i zvukove za taj segment.

Kad pokrećeš visual-generator za segment, dodaj u prompt:
- "Pročitaj `reference/sound.md` za pravila"
- "Pored .tsx fajla, napravi i `sounds_segment_X.json` sa zvukovima"
- "Zvuk ide SAMO gde se nešto VIZUELNO dešava"

Posle svih sub-agenata, pokreni premix:

```bash
cd /Users/dario61/Desktop/YT\ automation && python3 tools/sound-design/premix_segments.py workspace/{project-name} videos/{project-name}
```

Ovo čita sounds_segment_*.json i pravi `public/sfx/segment_X_sfx.mp3` za svaki segment.

Pa u Root.tsx dodaj za svaki segment:
```tsx
<Sequence from={startFrame} durationInFrames={endFrame - startFrame}>
  <Audio src={staticFile("sfx/segment_X_sfx.mp3")} volume={1} />
</Sequence>
```

**PRAVILO:** Zvuk MORA da prati vizual. Ako se ništa ne menja na ekranu — NEMA zvuka.

### KORAK 3: Pokreni BUILDER

```
Koristi: remotion-builder skill
Input: master-plan.json + Generated_*.tsx + voiceover.mp3
Output: Funkcionalan Remotion projekat
```

Builder radi:
1. Napravi projekat (npm init, install deps)
2. Kopira voiceover u public/
3. **Za svaki segment pokreni `visual-generator` skill** ako .tsx ne postoji
4. Generiše Root.tsx — svi segmenti direktno (BEZ Sequence), Audio voiceover
5. Pokrene `npx remotion studio`

---

## PRAVILA

- **SVE fullscreen** — svaki segment je 1920x1080 .tsx komponenta
- **NEMA canvas, NEMA DynamicPipeline, NEMA sticky notes, NEMA template kopiranja**
- **visual-generator skill OBAVEZAN** za svaki segment — NE pisati .tsx ručno
- **Globalni frameovi** — `useCurrentFrame()` vraća globalni frame, NIKAD dodavati OFFSET
- **BEZ Sequence wrapper-a** — komponente se renderuju direktno u Root.tsx
- **Frame 0 ima content** — prvi element vidljiv odmah

---

## REFERENCE

| Šta | Gde |
|-----|-----|
| Visual Generator | `.claude/skills/visual-generator/SKILL.md` |
| Generation Rules | `.claude/skills/visual-generator/reference/generation-rules.md` |
| Planner | `.claude/skills/remotion-planner/SKILL.md` |
| Builder | `.claude/skills/remotion-builder/SKILL.md` |
| Router | `.claude/skills/remotion-visual-router/SKILL.md` |
| Remotion coding rules | `reference/remotion-coding-rules.md` |
