# Remotion Visual Router

Čita transcript i odlučuje koji vizual za koji deo teksta. Ovo je PRVI korak pre planner-a.

**Trigger:** "napravi video", "generiši vizuale", "route visuals", "visual structure", ili kad remotion-motion orchestrator pozove pre planera.

**Input:** Čist transcript (očišćen od filler words)
**Output:** `visual-structure.json` u `workspace/{project-name}/`

```
Transcript → VISUAL ROUTER → visual-structure.json → PLANNER (timing) → BUILDER (render)
```

---

## ⚠️ FUNDAMENTALNO: PRATI TRANSCRIPT, NE PRAVILA

```
PRIORITET #1: Struktura prati transcript
  - Transcript kaže "Step 1 Kling, Step 2 Runway" → sticky Kling, sticky Runway
  - NE grupiši u apstraktne kategorije ("Pipeline / Comparison / Verdict")

PRIORITET #2: Ikone su DEFAULT
  - Svaki segment je ikone OSIM AKO ima KONKRETNIH podataka
  - Vizuali su BONUS, ne obaveza — 100% ikona je validno

PRIORITET #3: Konzistentan layout
  - Sticky height-ovi moraju da se poklapaju (2+2+2 ili 4+4+4)
  - Node count unutar sticky-ja mora biti isti (sve 2 ili sve 3)
```

---

## WORKFLOW

### KORAK 1: Segmentiraj transcript

Podeli na logičke segmente (2-4 rečenice):
- Novi segment kad se menja TEMA ("Now let's talk about...", "Step one...")
- ISTI segment kad nastavlja istu temu ("Another benefit...", "Also...")
- Cilj: 6-12 segmenata za 2-3 min video

### KORAK 2: Grupiši u sticky-je (PRATI TRANSCRIPT!)

```
Transcript ima eksplicitne korake? ("Step 1", "Step 2", "Step 3")
  → 1 sticky po koraku. NE izmišljaj apstraktne kategorije.

Transcript nema eksplicitne korake?
  → Grupiši po TEMI. Svaki sticky = jedna faza/tema.

PRAVILA:
  - MAX 4 stickies
  - Preferiraj 4 sekcije po sticky-ju kad ima dovoljno contenta
    → 4 sekcije popunjavaju sticky, kamera ima šta da prati, nema praznog vremena
    → Svaka sekcija = 1 pod-tema iz transcripta
  - 2 sekcije su OK za kratke sticky-je sa manje contenta
  - Ako imaš 3 pod-teme:
    → Dodaj 4. sekciju (output, result, summary, example)
    → ILI merge 2 srodne u 1 (= 2 sekcije)
  - Preferiraj iste visine sticky-ja (4+4+4 ili 2+2+2)
  <!-- REVERT NOTE: ako 4 sekcije pravi prenatrpane sticky-je, vrati na "preferiraj 2" -->
```

### KORAK 3: Za svaku sekciju — IKONE ili VIZUAL?

**Default = IKONE.** Vizual SAMO ako segment ima KONKRETNE podatke:

```
⚠️ BROJEVI SU UVEK TRIGGER ZA VIZUAL:
  Segment ima 2+ konkretna broja? ("100K ops/sec", "85%", "$500")
  → stats (ako su standalone impresivni brojevi)
  → bar-chart (ako se porede numerički)
  → pie-chart (ako su distribucija)
  NIKAD ne stavljaj brojeve u flow ikone!
  ❌ [PG 85%] → [Redis 43%] → [Mongo 21%] kao flow
  ✅ bar-chart sa 3 bara: PG 85, Redis 43, Mongo 21

⚠️ KOD/KOMANDE SU UVEK TRIGGER ZA VIZUAL:
  Segment pominje CLI komande? ("npm init", "curl", "docker run", "git push")
  → terminal vizual sa tim komandama
  Segment opisuje source code? ("import express", "create function", "define endpoint")
  → code-block vizual sa ilustrativnim snippetom
  NIKAD ne stavljaj komande/kod u flow ikone!
  ❌ [npm init] → [Install] kao flow ikone
  ✅ terminal vizual: $ npm init -y / $ npm install express

⚠️ JASNI KORACI U PROCESU SU TRIGGER ZA VIZUAL:
  Segment opisuje 3+ eksplicitna koraka? ("stage one build, stage two test, stage three deploy")
  → process-steps vizual
  Ali samo kad su KONKRETNI IMENOVANI koraci, ne apstraktni koncepti
  ❌ "request goes to auth then processing" → ovo je apstraktan flow, koristi ikone
  ✅ "Stage 1 Build, Stage 2 Test, Stage 3 Stage, Stage 4 Deploy" → process-steps

⚠️ POREĐENJE SA PODACIMA:
  Poredi 3+ stvari po 2+ kriterijuma sa konkretnim podacima?
  → table (kriterijumi kao redovi, stvari kao kolone)
  Poredi TAČNO 2 stvari pro/con?
  → split-screen (left=staro/loše, right=novo/dobro)

⚠️ HRONOLOGIJA:
  Pominje 3+ godina/verzija? ("2014", "v1.0", "v2.0")
  → timeline vizual

⚠️ HIJERARHIJA/STRUKTURA:
  Opisuje parent-child, layers, "consists of", "contains"?
  → hierarchy vizual (tree sa levels)

⚠️ TECH STACK:
  Nabraja 3+ tehnologija po imenu? ("Docker, K8s, Redis, Nginx")
  → logo-grid vizual (ikone sa brand bojama)

⚠️ DISTRIBUCIJA (ne isto kao poređenje!):
  Opisuje delove celine? ("70% compute, 20% storage, 10% network")
  → pie-chart (NE bar-chart — pie je za distribuciju, bar za poređenje)
  Variraj: ne koristi uvek isti vizual za brojeve!
  stats = standalone wow brojevi, bar-chart = poređenje, pie-chart = distribucija

SVE OSTALO → IKONE sa odgovarajućim layout-om
```

### KORAK 3.5: Odaberi LAYOUT za icon sekcije

**NE koristi flow za SVE! Razmisli kakav je ODNOS između nodova:**

```
Pipeline, sekvenca (A→B→C)?                    → flow
Jednostavna veza (A→B)?                         → arrow
Problem → Rešenje (✗A→B)?                       → negation
Dve alternative (A vs B)?                       → vs
Kombinacija (A+B=C)?                            → combine
Odluka/branch (A→[B,C])?                        → if-else
Više inputa → jedan output ([A,B]→C)?           → merge
Dvosmerna komunikacija (A↔B)?                   → bidirectional
Filtriranje (A▷B)?                              → filter
```

**Variraj layout-e unutar sticky-ja!** Dobar primer (Blue-Green deploy):
```
Sticky 1: [flow, vs]       — pipeline PA poređenje
Sticky 2: [flow, if-else]  — pipeline PA branch decision
Sticky 3: [flow, combine]  — pipeline PA spajanje
```

### KORAK 4: Node count, layout height, i POST-CHECK

```
Node count:
  ✅ 2 noda — kompaktno
  ✅ 3 noda — detaljno
  ⚠️ 4 noda — samo ako content zahteva
  ❌ 1 nod — nema odnos

```

**⚠️ POST-CHECK (uradi NAKON svih koraka, PRE outputa):**
```
Prođi svaki sticky i proveri:
1. Broj sekcija: 2 ili 4? Ako je 3 → merge ili dodaj
2. Node count: isti unutar sticky-ja? Ako je [2,3] → izjednači
3. Ima li segment sa 2+ konkretna broja koji je ostao kao ikone? → stats/bar-chart
4. GUSTINA: Nova sekcija ili nod mora da se pojavi bar svakih 15-20 sec!
   - Prebroj rečenice u svakom segmentu transcripta
   - 1-3 rečenice = 1 sekcija sa 2-3 noda OK
   - 4-6 rečenica = treba 2 sekcije (split po pod-temi)
   - 7+ rečenica = treba ceo novi sticky
   - Ako lik priča o testovima 1 minut (Unit, Integration, E2E, staging, QA)
     → to su 2-3 sekcije, ne 1 sekcija sa 3 noda!
   - PRAVILO: svaka rečenica koja uvodi NOV KONCEPT = potencijalan nov nod ili sekcija
```

### KORAK 5: Izvuci podatke

**Za vizualne sekcije:** pročitaj `reference/extraction-rules.md` za tačan format.

**Za icon sekcije:**
```bash
# Batch icon search — OBAVEZNO za sve ikone
echo '["concept1", "concept2", "concept3"]' | \
  python3 /Users/dario61/Desktop/YT\ automation/templates/icon-search/batch_icons.py
```

**Pravila za ikone:**
- Label: max 2 kratke reči ILI 1 duža ILI acronym
- NIKAD isti icon dva puta u celom videu
- Ako batch_icons.py vrati duplikat → traži alternativu

### KORAK 6: Direction + Connections

```
direction (gde ide sledeći sticky):
  "right" (default) — horizontalni flow
  "below" — drill-down u istu temu (donji NE SME biti širi od gornjeg)

connectionToNext (tip lasera):
  "flow" (default) — prosta laser linija
  "bidirectional" — dvosmerna komunikacija
  "none" — bez lasera (zadnji sticky)
```

### KORAK 7: Generiši visual-structure.json

```json
{
  "title": "Video Title",
  "hierarchyType": "sticky",
  "stickies": [
    {
      "step": 1,
      "title": "Sticky Title",
      "direction": "right",
      "connectionToNext": "flow",
      "sections": [
        {
          "title": "Section Title",
          "subtitle": "Short Description",
          "layout": "flow",
          "nodes": [
            { "label": "Node", "icon": "PascalCase" }
          ]
        }
      ]
    }
  ]
}
```

Sačuvaj u: `workspace/{project-name}/visual-structure.json`

---

## VALIDACIJA PRE OUTPUTA

**Struktura (KRITIČNO):**
- [ ] Sticky-ji prate transcript strukturu (ne apstraktne kategorije)
- [ ] Svaka sekcija ima ILI (visualType + visualData) ILI (layout + nodes), NIKAD oba
- [ ] 2-4 stickies, 2-4 sekcije po sticky-ju

**Height konzistentnost (KRITIČNO):**
- [ ] Svi sticky-ji imaju ISTI broj sekcija (2+2+2 ili 4+4+4) ILI konzistentan pattern (2+4+2+4)
- [ ] NIKAD mismatch (2+3+4 = ružno)
- [ ] Node count unutar sticky-ja je ISTI (sve 2 ili sve 3)

**Ikone:**
- [ ] Svi icon nazivi su PascalCase Phosphor (proveri sa batch_icons.py)
- [ ] Nema duplikata ikona u celom videu
- [ ] Node labels max 2 kratke reči ili acronym
- [ ] Layout-i su varirani (ne sve flow — koristi vs, combine, negation, if-else gde ima smisla)

**Vizuali (samo ako ih ima):**
- [ ] Vizual je dodat SAMO jer segment ima KONKRETNE podatke (brojevi, kod, poređenje sa podacima)
- [ ] NIJE forsiran zarad raznovrsnosti
- [ ] Shape kompatibilnost sa companion sekcijama (vidi composition-rules.md B)
- [ ] Podaci izvučeni iz transcripta, ne izmišljeni

---

## REFERENCE

- `reference/composition-rules.md` — Rule 0 (transcript first), shape, composition, edge cases
- `reference/visual-catalog.md` — svi vizuali, props, shape mode, weight
- `reference/extraction-rules.md` — šta izvući za svaki vizual tip
- `reference/examples.md` — primeri transcript → structure
