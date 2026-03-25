# Remotion Builder Skill

Implementira video prema `master-plan.json` koji je generisao `remotion-planner`.

**Input:** `master-plan.json` (iz planner-a)
**Output:** Funkcionalan Remotion projekat

**⚠️ OUTPUT LOKACIJE:**
- **Finalni projekti** → `videos/{project-name}/` (gotovi video projekti)
- **Privremeni fajlovi** → `workspace/{project-name}/` (voiceover, timestamps, master-plan dok se radi)
- **NIKAD u root, NIKAD u skills folder, NIKAD u templates!**

---

## ⚠️ KRITIČNO: NE MENJAJ TEMPLATE KOD!

**NIKAD ne edituj DynamicPipeline.tsx, ExplainerLayout.tsx, Root.tsx ili bilo koji .tsx fajl!**

Template već ima SVE ugrađeno:
- **Camera** — auto-generiše keyframes iz sticky pozicija (zoom po sticky-ju, pan po sekcijama)
- **Sounds** — auto-generiše whoosh zvukove na camera/section tranzicijama
- **Animacije** — spring-based fade-in, scale-in, stagger po nodovima
- **Layouts** — 9 ExplainerLayout tipova (flow, vs, combine, if-else, merge, negation, bidirectional, filter, arrow)
- **Ikone** — 1512 Phosphor ikona, dinamički lookup, fallback Cube

**Builder samo:**
1. Kopira template
2. Kopira assets (voiceover, timestamps)
3. Generiše `dynamic-config.json`
4. Pokrene server

```
❌ POGREŠNO: Editovati DynamicPipeline.tsx da dodaš camera keyframes
❌ POGREŠNO: Pisati custom sound logic
❌ POGREŠNO: Menjati bilo koji .tsx fajl

✅ ISPRAVNO: Samo generiši dynamic-config.json i pusti template da radi
```

---

## WORKFLOW

### KORAK 1: Kopiraj Template + npm install

```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/ai-video-gen-pipeline"/* ./videos/{project-name}/
cd ./videos/{project-name} && npm install
```

### KORAK 2: Kopiraj Assets

```bash
cp workspace/{project-name}/voiceover.mp3 ./videos/{project-name}/public/
cp workspace/{project-name}/voiceover-timestamps.json ./videos/{project-name}/src/
cp workspace/{project-name}/master-plan.json ./videos/{project-name}/src/
```

Sounds su VEĆ u templateu (`public/sounds/whooshes/`).

### KORAK 3: Generiši `dynamic-config.json`

Jedini fajl koji builder KREIRA. Transformacija iz master-plan.json:

```json
{
  "title": "Video Title",
  "fps": 30,
  "totalFrames": 1395,
  "showStepPrefix": true,
  "stickies": [
    {
      "step": 1,
      "title": "Retrieve",
      "color": "#a855f7",
      "sections": [
        {
          "id": "section_1_1",
          "title": "Query",
          "layout": "flow",
          "startFrame": 95,
          "nodes": [
            { "label": "Input", "icon": "Terminal" },
            { "label": "Embed", "icon": "Cube" }
          ]
        }
      ]
    }
  ]
}
```

**Config Options:**
- `showStepPrefix: true` → "STEP 1: RETRIEVE"
- `showStepPrefix: false` → just "RETRIEVE"

**Sticky Colors:** `#ef4444` (red), `#3b82f6` (blue), `#06b6d4` (cyan), `#22c55e` (green), `#a855f7` (purple), `#f97316` (orange)

### KORAK 4: Pokreni

```bash
cd videos/{project-name} && npx remotion studio --port 3001
```

---

## STRUKTURA STICKY-JA

```
❌ POGREŠNO: 1 sticky sa 5 sekcija
✅ ISPRAVNO: 3 sticky-ja (Step 1, Step 2, Step 3), svaki ima 2-4 sekcije, svaka 2-3 noda
```

---

## DOSTUPNI LAYOUT-I (9)

| Layout | Vizual | Kad se koristi |
|--------|--------|----------------|
| `flow` | A → B → C | sekvenca, pipeline |
| `arrow` | A → B | jednostavna veza |
| `vs` | A vs B | poređenje |
| `combine` | A + B = C | kombinacija |
| `negation` | ✗A → B | loše → dobro |
| `if-else` | A → [B, C] | split/branch |
| `merge` | [A, B] → C | spajanje |
| `bidirectional` | A ↔ B | dvosmerna veza |
| `filter` | A ▷ B | filtriranje |

---

## IKONICE

1512 Phosphor ikona, dinamički lookup. Planner bira via `batch_icons.py`.
Fallback = `Cube`. Ikone su PascalCase (npr. `GitMerge`, `Database`, `Brain`).

---

## CHECKLIST PRE POKRETANJA

- [ ] Template kopiran u `videos/{project-name}/`
- [ ] `npm install` urađen
- [ ] `voiceover.mp3` u `public/`
- [ ] `sounds/whooshes/` postoji (medium-whoosh + soft-whoosh)
- [ ] `dynamic-config.json` generisan u `src/`
- [ ] **NIJEDAN .tsx fajl NIJE editovan**

---

## COMMON ERRORS

| Simptom | Uzrok | Fix |
|---------|-------|-----|
| Elementi levo | Flexbox bug | Proveri template verziju |
| Camera bugged | Agent editovao DynamicPipeline.tsx | **VRATI ORIGINAL** — template auto-generiše kameru |
| Nema zvuka | Sounds folder fali | Proveri `public/sounds/whooshes/` |
| Crn ekran | Frame 0 nema content | **BUG U PLANU** — vrati planner-u |
| Pogrešne ikone | Planner dao loše nazive | Proveri da su PascalCase Phosphor nazivi |

---

## VALIDACIJA

- [ ] Frame 0 ima content (NE crn ekran!)
- [ ] Camera smooth prati sticky-je automatski
- [ ] Sounds se čuju
- [ ] Svi layouti renderuju ispravno (strelice, vs, if-else, combine)
- [ ] Voiceover sync OK
