# Remotion Motion Graphics Skill

Pravi animirane motion graphics video od transcripta. SVE fullscreen, BEZ canvas/sticky notes.

---

## PIPELINE

```
TRANSCRIPT
    ↓
REMOTION-PLANNER — segmentira + beat tipovi + voiceover + timestamps + visual-generator po segmentu
    ↓
REMOTION-BUILDER — Root.tsx sa svim segmentima + voiceover Audio
    ↓
GOTOV VIDEO
```

**NAPOMENA:** Visual Router je ukinut. Planner sad SAM segmentira transcript I odlučuje beat tipove (motion_graphics / ai_video / meme) pre generisanja vizuala.

---

## WORKFLOW

### KORAK 1: Pokreni PLANNER

```
Koristi: remotion-planner skill
Input: Transcript tekst + memes.json (ako postoji) + AI clips info (ako postoji)
Output: master-plan.json + voiceover.mp3 + timestamps.json + Generated_*.tsx
```

Planner radi:
1. Čisti transcript
2. Generiše voiceover + word timestamps (ElevenLabs)
3. **Segmentira transcript** na vizuelne scene — koliko treba, agent odlučuje po sadržaju
4. **Odlučuje beat tip** za svaki segment: motion_graphics / ai_video / meme
5. Mapira timestamps na segmente
6. **Čita memes.json** (ako postoji u workspace/) — koristi za meme segment odluke
7. **Čita AI clips** (ako postoje u workspace/ai-clips/) — koristi za ai_video segment odluke
8. **Za SVAKI `motion_graphics` segment pokreni `visual-generator` skill** — skill piše .tsx
9. Generiše master-plan.json (sa beatType, memes i AI clips pozicijama)

### KORAK 1.5: ZVUKOVI (Hints + Sound Coordinator)

**DVA KORAKA za zvukove:**

**A) Visual-generator piše sound HINTS (automatski, deo koraka 1):**
Svaki visual-generator sub-agent piše `sound_hints_X.json` — opisuje ŠTA se vizuelno dešava na kom frame-u. NE bira zvukove.

**B) Sound Coordinator (KORAK 5.5 u planner-u):**
Planner čita SVE sound_hints_*.json i odlučuje KOJI zvuk ide gde gledajući CELINU.
Piše finalne `sounds_segment_X.json` za premix.
Pročitaj `reference/sound.md` za pravila.

Posle Sound Coordinator-a pokreni premix:

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

### KORAK 2: Pokreni BUILDER

```
Koristi: remotion-builder skill
Input: master-plan.json + Generated_*.tsx + voiceover.mp3
Output: Funkcionalan Remotion projekat
```

Builder radi:
1. Napravi projekat (npm init, install deps)
2. Kopira voiceover u public/
3. **Za svaki `motion_graphics` segment** — koristi Generated_*.tsx koji je planner napravio
4. **Za `ai_video` segmente** — koristi klipove iz ai-clips/ (ili placeholder ako nisu generisani)
5. **Za `meme` segmente** — renderuje meme overlay
6. Generiše Root.tsx — svi segmenti direktno (BEZ Sequence), Audio voiceover
7. Pokrene `npx remotion studio`

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
