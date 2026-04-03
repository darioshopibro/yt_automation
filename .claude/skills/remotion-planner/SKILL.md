# Remotion Planner Skill

Planira video: voiceover, timestamps, segmentacija, generiše vizuale sa visual-generator skill-om.

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

**Timestamps format:**
```json
{
  "words": [
    { "word": "User", "start": 0.5, "end": 0.7 },
    { "word": "query", "start": 0.75, "end": 1.1 }
  ]
}
```

### KORAK 3: Pročitaj Visual Structure od Routera

```bash
cat workspace/{project-name}/visual-structure.json
```

Sadrži segmente sa `title` i `transcriptSegment`. Planner dodaje timing (startFrame/endFrame).

### KORAK 4: Mapiranje timestamps na segmente

Za SVAKI segment:
1. Nađi u voiceover timestamps KAD počinje tema tog segmenta
2. `startFrame = Math.round(word.start * fps)`
3. `endFrame` = startFrame sledećeg segmenta (ili kraj videa)

### KORAK 5: Generiši vizuale — POKRENI visual-generator SKILL za svaki segment

**Za svaki segment pokreni `visual-generator` skill.** NE piši .tsx sam. KORISTI SKILL.

```
Za svaki segment:
1. Stikni visual-generator skill
2. Daj mu: transcript segment + timestamps za taj segment + fps + startFrame
3. Skill SAM piše .tsx
4. Skill sačuva u videos/{project-name}/src/visuals/Generated_{SegmentName}.tsx
```

```
❌ ZABRANJENO: Write Generated_*.tsx (sam pišeš fajl)
❌ ZABRANJENO: Čitaš generation-rules.md i sam implementiraš
✅ JEDINO ISPRAVNO: Stikni visual-generator skill → skill piše fajl
```

### KORAK 6: Generiši master-plan.json

```
totalFrames = Math.ceil(voiceover_duration_seconds * fps) + 30
```

```json
{
  "meta": {
    "title": "Video Title",
    "fps": 30,
    "totalFrames": 1395,
    "totalDuration": 46.5
  },
  "voiceover": {
    "file": "voiceover.mp3",
    "duration": 40.0,
    "words": [
      { "word": "User", "start": 0.5, "end": 0.7, "startFrame": 15, "endFrame": 21 }
    ]
  },
  "structure": {
    "segments": [
      {
        "id": "segment_1",
        "step": 1,
        "title": "How Docker Works",
        "startFrame": 0,
        "endFrame": 450,
        "componentPath": "src/visuals/Generated_HowDockerWorks.tsx",
        "transcriptSegment": "Here's how a Docker container is born...",
        "timestamps": [
          { "word": "Docker", "start": 0.52, "startFrame": 16 }
        ]
      }
    ]
  }
}
```

---

## VALIDACIJA

- [ ] Frame 0 ima content — NE CRNI EKRAN
- [ ] Svaki segment ima startFrame/endFrame iz timestamps
- [ ] Generated_*.tsx postoji za svaki segment (napravljen od skill-a)
- [ ] totalFrames izračunat iz voiceover duration

---

## KRITIČNA PRAVILA

1. **Animacija od PRVOG FRAMEA** — Frame 0 mora imati content
2. **GLOBAL frames** — `useCurrentFrame()` vraća globalni frame, NIKAD dodavati OFFSET
3. **Visual Generator SKILL obavezan** — ne piši .tsx sam, pokreni skill
4. **NEMA kamere** — fullscreen, nema zoom/pan
5. **NEMA canvas/sticky/DynamicPipeline** — sve fullscreen

---

## OUTPUT

```
workspace/{project-name}/
├── master-plan.json
├── voiceover.mp3
├── voiceover-timestamps.json
├── visual-structure.json
└── cleaned-transcript.txt

videos/{project-name}/src/visuals/
├── Generated_Segment1.tsx
├── Generated_Segment2.tsx
└── ...
```

---

## REFERENCE

- Text cleaning: `reference/text-cleaning.md`
- Voiceover API: `remotion-motion/reference/voiceover.md`
- Design system: `remotion-motion/reference/design.md`
