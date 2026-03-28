# Visual Proposer

Čita transcript, poredi sa postojećim vizualima (13 tipova), i predlaže NOVE vizuale koji fale. Generiše React komponente, pokazuje preview, i dodaje approved vizuale u biblioteku.

**Trigger:** "predloži vizuale", "propose visuals", "fali vizual", "novi vizual", "visual gap", "treba nam vizual za"

**Input:** Transcript (tekst ili fajl)
**Output:** 0-2 nova vizuala u `src/visuals/` + ažuriran katalog

---

## WORKFLOW

### KORAK 1: Pročitaj kontekst

1. Pročitaj transcript (od usera ili iz `workspace/{project}/transcript.txt`)
2. Pročitaj `reference/visual-ideas.md` — lista vizuala koji bi mogli da postoje (inspiracija)
3. Pročitaj visual katalog: `.claude/skills/remotion-visual-router/reference/visual-catalog.md` — šta IMAMO (13 vizuala + 9 icon layouta)

### KORAK 2: Gap Analysis

Analiziraj transcript i odgovori na:

1. **Koji koncepti se pominju?** (architecture, pipeline, database, API, network, git, deployment...)
2. **Koji od tih koncepata NEMA odgovarajući vizual u katalogu?**
3. **Da li bi novi vizual bio koristan i za BUDUĆE videe?** (ne pravimo one-off vizuale)

Pravila za gap detection:
- **JESTE gap:** Transcript priča o network topology sa servisima koji komuniciraju — nemamo vizual za to
- **JESTE gap:** Transcript priča o database schema sa tabelama i relacijama — nemamo vizual za to
- **NIJE gap:** Transcript nabrajaja 5 features — to pokriva `list` vizual
- **NIJE gap:** Transcript poredi 2 opcije — to pokriva `split-screen` vizual
- **NIJE gap:** Transcript pokazuje kod — to pokriva `code-block` vizual

### KORAK 3: Predloži (ili ne predlaži)

**Ako NEMA gap-a:**
```
"Postojeći vizuali pokrivaju sve koncepte iz transcripta. Nema potrebe za novim vizualima."
```
→ Preskoči ostale korake.

**Ako IMA gap:**
Za svaki predloženi vizual prikaži:

```
PREDLOG: {VisualName}
- Šta prikazuje: {opis u 1 rečenici}
- Zašto fali: {koji koncept iz transcripta ne pokrivamo}
- Shape: SQUARE | WIDE | DYNAMIC
- Weight: LIGHT | MEDIUM | HEAVY
- Reusability: {za koje buduće teme bi bio koristan}
- Primer podataka: {kako bi izgledao visualData za ovaj transcript}
```

Max 2 predloga po transcriptu. Kvalitet > kvantitet.

### KORAK 4: User Decision

Pitaj usera:
```
Hoćeš da napravim [VisualName]? (da/ne/izmeni)
```

- **da** → idi na Korak 5
- **ne** → preskoči taj vizual
- **izmeni** → user opisuje šta želi drugačije → update predlog → ponovo pitaj

### KORAK 5: Generiši React komponentu

Pročitaj `reference/component-skeleton.md` za template.

Za svaki approved vizual:

1. **Napravi `.tsx` fajl** u `templates/ai-video-gen-pipeline/src/visuals/{VisualName}.tsx`
   - Koristi skeleton iz reference-a
   - Popuni RENDER ZONE sa vizuelnim prikazom
   - OBAVEZNO: `shapeMode`, `progress`, `accentColor` props
   - OBAVEZNO: `items[]` array za podatke
   - Stil: tamna pozadina (#0f0f1a), zaobljeni uglovi, Inter font — kao svi ostali vizuali

2. **Self-eval** — oceni vizual 1-10:
   - Da li prati design pattern ostalih vizuala? (boje, font, padding)
   - Da li progress animacija radi? (0→1 progresivni reveal)
   - Da li radi u oba shapeMode-a? (square i wide)
   - Ako < 7 → popravi i probaj ponovo (max 2 retry-a)

### KORAK 6: Preview

```bash
# Pokaži useru gde je fajl
echo "Vizual kreiran: templates/ai-video-gen-pipeline/src/visuals/{VisualName}.tsx"
echo "Pokreni 'npx remotion preview' da vidiš u browseru"
```

### KORAK 7: Integriši approved vizual

Ako user odobri nakon preview-a:

1. **Update visual-catalog.md** — dodaj entry za novi vizual (isti format kao ostali)
2. **Update extraction-rules.md** — dodaj extraction pravila za novi vizual tip
3. **Update DynamicPipeline.tsx** — dodaj case u visualType switch
4. **Prijavi uspeh:**

```
✅ {VisualName} dodat u biblioteku!
- Fajl: src/visuals/{VisualName}.tsx
- Katalog: ažuriran
- Extraction rules: ažurirane
- DynamicPipeline: ažuriran
- Visual Router će automatski koristiti novi vizual u budućim videima.
```

---

## REFERENCE

- `reference/visual-ideas.md` — inspiracija za vizuale koji bi mogli da postoje
- `reference/component-skeleton.md` — template za nove React komponente
- Visual katalog (postojeći): `.claude/skills/remotion-visual-router/reference/visual-catalog.md`
- Extraction rules (postojeći): `.claude/skills/remotion-visual-router/reference/extraction-rules.md`

## RUČNI MOD

User može i direktno zatražiti vizual:
```
"napravi mi vizual za database schema"
"treba nam vizual za API endpoint map"
```
→ Preskoči gap analysis (Korak 2), idi direktno na Korak 3 sa user-ovim zahtevom.
