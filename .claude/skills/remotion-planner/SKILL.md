# Remotion Planner Skill

Segmentira transcript, planira beat tipove, generiše voiceover + timestamps, i pokreće visual-generator za svaki segment. Objedinjuje posao ranijeg visual-router-a i composition planner-a.

**Output:** `master-plan.json` + `voiceover.mp3` + `Generated_*.tsx`

**⚠️ OUTPUT LOKACIJE:**
- **Privremeni fajlovi** → `workspace/{project-name}/`
- **Video projekat** → `videos/{project-name}/`
- **NIKAD u root, NIKAD u skills folder, NIKAD u templates!**

---

## PRE-FLIGHT: BRAND CHECK

```bash
ls /Users/dario61/Desktop/YT\ automation/brands/*/brand.json 2>/dev/null
```

- Ako postoji → čitaj brand.json
- Ako NE postoji → nastavi sa default bojama

---

## WORKFLOW

### KORAK 1: Očisti Transcript

**Pročitaj:** `reference/text-cleaning.md`

1. Ukloni filler words (um, basically, you know)
2. Kontrakcije (don't, we'll, it's)
3. Passive→Active samo ako 100% siguran
4. **NE dodavaj CAPS, NE dodavaj ! ili ?**

### KORAK 2: Generiši Voiceover + Timestamps

```bash
cd /Users/dario61/Desktop/YT\ automation && python3 .claude/skills/remotion-planner/scripts/full-pipeline.py --file workspace/{project-name}/cleaned-transcript.txt --output-dir workspace/{project-name}/
```

**Output:** voiceover.mp3 + voiceover-timestamps.json

**Timestamps format:** Niz `{ word, start, end }` objekata. Pročitaj: `remotion-motion/reference/voiceover.md`

### KORAK 3: Segmentiraj Transcript + Odluči Beat Tipove

**OVO ZAMENJUJE stari visual-router.** Planner sad SAM segmentira.

Pročitaj ceo transcript. Podeli na segmente — svaki segment je JEDNA vizuelna scena. Ti odlučuješ koliko segmenata treba na osnovu sadržaja. Svaki segment = jedna stvar na ekranu, jedna ideja, jedna vizuelna promena. Kad se menja tema, vizual, ili perspektiva — to je novi segment. Ne hardkodiraj broj — razmisli šta transcript zahteva.

**Pročitaj:** `reference/beat-types.md` — tabela beat tipova + pravila za svaki tip

### KORAK 4: Mapiranje timestamps na segmente

Za SVAKI segment:
1. Nađi u voiceover timestamps KAD počinje tema tog segmenta
2. `startFrame = Math.round(word.start * fps)`
3. `endFrame` = startFrame sledećeg segmenta (ili kraj videa)

### KORAK 5: Generiši vizuale — SAMO za `motion_graphics` segmente

**Za svaki `motion_graphics` segment pokreni `visual-generator` skill.** NE piši .tsx sam.

```
Za svaki motion_graphics segment:
1. Pokreni visual-generator skill
2. Daj mu: transcript segment + timestamps za taj segment + fps + startFrame + beatType
3. Skill SAM piše .tsx
4. Skill sačuva u videos/{project-name}/src/visuals/Generated_{SegmentName}.tsx
```

**Za `ai_video` segmente:** NE pokreći visual-generator. Samo zapiši prompt u master-plan. AI video generator koristi te prompte kasnije.

**Za `meme` segmente:** NE pokreći visual-generator. Zapiši meme info u master-plan. Builder će renderovati meme overlay.

```
❌ ZABRANJENO: Write Generated_*.tsx (sam pišeš fajl)
❌ ZABRANJENO: Čitaš generation-rules.md i sam implementiraš
❌ ZABRANJENO: "Već znam pravila, napisaću sam brže" — NE. Skill ima strožu proceduru.
✅ JEDINO ISPRAVNO: Pokreni visual-generator skill → skill piše fajl
```

**ZAŠTO MORA SKILL:** Visual-generator skill ima 5-step razmišljanje (suština → metafor → layout → timeline → animacije) + čita good-examples + piše sound_hints + stavlja 🔊 komentare. Ako TI pišeš .tsx — preskočićeš korake. Čak i ako misliš da znaš pravila — POKRENI SKILL. Bez izuzetaka.

### KORAK 5.5: SOUND COORDINATOR — Jedan mozak za SVE zvukove

**Pročitaj:** `reference/sound-coordinator.md` — sva pravila, format, self-check lista

### KORAK 6: Generiši master-plan.json

**Pročitaj:** `reference/master-plan-format.md` — JSON format sa primerom

---

## VALIDACIJA

- [ ] Frame 0 ima content — NE CRNI EKRAN
- [ ] Svaki segment ima startFrame/endFrame iz timestamps
- [ ] Svaki segment ima `beatType` (motion_graphics | ai_video | meme)
- [ ] Generated_*.tsx postoji za svaki `motion_graphics` segment (napravljen od skill-a)
- [ ] `ai_video` segmenti imaju `aiVideoPrompt`
- [ ] `meme` segmenti imaju `meme.name` + `meme.reason`
- [ ] totalFrames izračunat iz voiceover duration
- [ ] ai_video i meme korišćeni umereno (ne forsirani)

---

## KRITIČNA PRAVILA

1. **Animacija od PRVOG FRAMEA** — Frame 0 mora imati content
2. **GLOBAL frames** — `useCurrentFrame()` vraća globalni frame, NIKAD dodavati OFFSET
3. **Visual Generator SKILL obavezan** — ne piši .tsx sam, pokreni skill
4. **NEMA kamere** — fullscreen, nema zoom/pan
5. **NEMA canvas/sticky/DynamicPipeline** — sve fullscreen
6. **Beat tipovi se odlučuju OVDE** — pre generisanja vizuala, ne posle

---

## OUTPUT

```
workspace/{project-name}/
├── master-plan.json              ← sa beatType po segmentu
├── voiceover.mp3
├── voiceover-timestamps.json
├── cleaned-transcript.txt
├── sound_hints_1.json            ← visual-generator piše (vizuelni eventi)
├── sound_hints_2.json
├── sounds_segment_1.json         ← Sound Coordinator piše (finalni zvukovi)
├── sounds_segment_2.json
└── ...

videos/{project-name}/
├── src/visuals/
│   ├── Generated_Segment1.tsx    ← samo za motion_graphics segmente
│   ├── Generated_Segment2.tsx
│   └── ...
└── public/sfx/
    ├── segment_1_sfx.mp3         ← premix_segments.py generiše
    ├── segment_2_sfx.mp3
    └── ...
```

---

## REFERENCE

- Text cleaning: `reference/text-cleaning.md`
- Beat types: `reference/beat-types.md`
- Sound coordinator: `reference/sound-coordinator.md`
- Master-plan format: `reference/master-plan-format.md`
- Voiceover API: `remotion-motion/reference/voiceover.md`
- Design system: `remotion-motion/reference/design.md`
