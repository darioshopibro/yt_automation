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

**Timestamps format:**
```json
{
  "words": [
    { "word": "User", "start": 0.5, "end": 0.7 },
    { "word": "query", "start": 0.75, "end": 1.1 }
  ]
}
```

### KORAK 3: Segmentiraj Transcript + Odluči Beat Tipove

**OVO ZAMENJUJE stari visual-router.** Planner sad SAM segmentira.

Pročitaj ceo transcript. Podeli na segmente — svaki segment je JEDNA vizuelna scena. Ti odlučuješ koliko segmenata treba na osnovu sadržaja. Svaki segment = jedna stvar na ekranu, jedna ideja, jedna vizuelna promena. Kad se menja tema, vizual, ili perspektiva — to je novi segment. Ne hardkodiraj broj — razmisli šta transcript zahteva.

**Za SVAKI segment odluči beat tip:**

| Beat tip | Kad se koristi | Šta planner radi |
|----------|---------------|-------------------|
| `motion_graphics` | Objašnjava koncept, pokazuje flow, poredi opcije | Pokreni visual-generator skill |
| `ai_video` | Hook (uvek prvi), dramatičan reveal, šokantan stat | Zapiši `aiVideoPrompt` u master-plan |
| `meme` | Humor, reakcija, relatable momenat | Zapiši `meme` info u master-plan |

**Pravila za beat tipove:**
- **Prvi segment = `ai_video`** (uvek — dramaturški hook)
- `ai_video` koristi umereno — skupi su za generisanje
- `meme` koristi gde ima smisla — ne forsiraj
- **Ostatak = `motion_graphics`** (core content)
- Ako postoji `memes_{slug}.json` u workspace/ → pročitaj i koristi za meme odluke
- Ako postoji `ai-clips/` u workspace/ → proveri šta je već generisano
- Ti odlučuješ koliko čega treba — nema hardkodiranih limita

**Meme odluke:** Čitaj `workspace/{project-name}/memes_*.json` ako postoji. Biraj meme koji se TEMATSKI uklapa u segment. Ne forsiraj meme gde ne ide.

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

**Ovo je KRITIČAN korak.** Posle svih visual-generator sub-agenata, TI (planner) postaneš Sound Coordinator.

**Pročitaj:** `remotion-motion/reference/sound.md` — SVA pravila za zvukove

**Input:** SVE `sound_hints_*.json` fajlove iz `workspace/{project-name}/`

**Šta radiš:**
1. Pročitaj SVE sound_hints_*.json — to su vizuelni eventi po segmentu
2. Pročitaj `remotion-motion/reference/sound.md` za pravila (tipovi, volume, density, timing)
3. Za SVAKI event odluči:
   - Koji zvuk? (whoosh, hit, riser, click — iz sound.md)
   - Koji fajl? (whooshes/soft-whoosh.mp3, hits/bass-hit.mp3 — iz sound.md)
   - Koji volume? (0.06-0.22 po tipu — iz sound.md)
4. Primeni pravila CELE KOMPOZICIJE:
   - **Svaka vizuelna promena = zvuk.** NEMA limita na broj — koliko promena, toliko zvukova
   - Različiti tipovi zvukova MOGU da budu na istom frame-u (whoosh + click = OK, dva whoosh-a = NE)
   - **Varijacija:** Ne koristi isti zvuk 3x zaredom (variraj soft/medium/fast whoosh)
   - **Boundary transitions:** Svaki prelaz između segmenata ima whoosh
   - **Big reveals:** riser 30-40 frames PRE → hit NA reveal frame
   - **Staggered grupe:** Samo JEDAN click na prvu pojavu, ne na svaki element
   - **Čitaj i 🔊 komentare iz .tsx** fajlova kao backup — grep za `// 🔊 SOUND:` u Generated_*.tsx
5. Piši FINALNE `sounds_segment_X.json` za premix

**Output format — sounds_segment_X.json:**
```json
{
  "segment": "How Docker Works",
  "segmentIndex": 2,
  "frameMode": "global",
  "sounds": [
    { "frame": 142, "type": "whoosh", "file": "whooshes/medium-whoosh.mp3", "volume": 0.15, "reason": "segment transition — new scene starts" },
    { "frame": 200, "type": "click", "file": "clicks/soft-click.mp3", "volume": 0.08, "reason": "Docker logo slides in" },
    { "frame": 460, "type": "riser", "file": "risers/tension-riser.mp3", "volume": 0.12, "reason": "build-up before 60% stat reveal" },
    { "frame": 500, "type": "hit", "file": "hits/bass-hit.mp3", "volume": 0.20, "reason": "60% stat scales up — key info reveal" },
    { "frame": 692, "type": "whoosh", "file": "whooshes/digital-whoosh.mp3", "volume": 0.15, "reason": "scene crossfade to comparison" }
  ]
}
```

**Sačuvaj u:** `workspace/{project-name}/sounds_segment_X.json` (jedan po segmentu)

**PRAVILA:**
- `frame` je UVEK GLOBALNI (apsolutni od početka videa)
- `frameMode` je UVEK `"global"` — premix_segments.py koristi ovo
- Whoosh timing: **8 frames PRE** vizualne promene
- Hit timing: **frame-perfect NA** pojavu elementa
- Riser timing: **30-45 frames PRE** reveal-a
- Volume hijerarhija: hit (0.18-0.22) > whoosh (0.12-0.18) > riser (0.10-0.15) > click (0.06-0.10)
- `reason` MORA opisati vizuelnu promenu, NE šta narator kaže

**Self-check pre nastavka:**
- [ ] Svaki segment ima sounds_segment_X.json
- [ ] Svaka vizuelna promena ima zvuk (proveri 🔊 komentare u .tsx)
- [ ] Nema istog zvuka 3x zaredom
- [ ] Svaki segment boundary ima whoosh
- [ ] Svi reveal-i imaju riser→hit combo
- [ ] Nema dva ista tipa zvuka na istom frame-u
- [ ] `frameMode: "global"` u svakom JSON-u

**Posle ovog koraka pokreni premix:**
```bash
cd /Users/dario61/Desktop/YT\ automation && python3 tools/sound-design/premix_segments.py workspace/{project-name} videos/{project-name}
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
        "title": "The Hook",
        "beatType": "ai_video",
        "startFrame": 0,
        "endFrame": 150,
        "aiVideoPrompt": "Cinematic close-up of programmer staring at screen, dramatic lighting, code reflections in glasses",
        "transcriptSegment": "Every developer thinks AI is making them faster...",
        "timestamps": [
          { "word": "Every", "start": 0.1, "startFrame": 3 }
        ]
      },
      {
        "id": "segment_2",
        "step": 2,
        "title": "How Docker Works",
        "beatType": "motion_graphics",
        "startFrame": 150,
        "endFrame": 900,
        "componentPath": "src/visuals/Generated_HowDockerWorks.tsx",
        "transcriptSegment": "Here's how a Docker container is born...",
        "timestamps": [
          { "word": "Docker", "start": 5.52, "startFrame": 166 }
        ]
      },
      {
        "id": "segment_3",
        "step": 3,
        "title": "The Reality Check",
        "beatType": "meme",
        "startFrame": 900,
        "endFrame": 990,
        "meme": {
          "name": "This Is Fine",
          "reason": "developer debugging Docker networking",
          "durationFrames": 60
        },
        "transcriptSegment": "And then you try to debug networking...",
        "timestamps": [
          { "word": "debug", "start": 30.1, "startFrame": 903 }
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
- Voiceover API: `remotion-motion/reference/voiceover.md`
- Design system: `remotion-motion/reference/design.md`
