# Composition Rules — Kako birati i kombinovati vizuale

Ovaj fajl je OBAVEZAN za korake 2.5 (shape planning) i 4.5 (composition validation) u SKILL.md workflow-u.

---

## ⚠️ RULE 0: TRANSCRIPT STRUKTURA JE PRIORITET #1

**Ovo pravilo je IZNAD svih ostalih. Ako se bilo koje drugo pravilo kosi sa ovim — ovo pobeđuje.**

### 0.1. Prati strukturu transcripta

```
Transcript kaže "Step 1: Kling, Step 2: Runway, Step 3: Sora"
→ 3 sticky-ja: Kling, Runway, Sora
→ NE grupiši u "Pipeline / Comparison / Verdict"

Transcript opisuje pipeline u 4 faze
→ 4 sekcije sa flow ikonama
→ NE forsiraj tabelu ili listu
```

**Sticky = tema/korak iz transcripta, NE apstraktna kategorija.**

### 0.2. Ikone su DEFAULT, vizuali su BONUS

```
Za svaku sekciju pitaj: "Ima li KONKRETNIH podataka?"
  ├─ Konkretni brojevi (10M+, 99.9%, $2.5B)? → stats/bar-chart
  ├─ Konkretan kod ili komande? → code-block/terminal
  ├─ Konkretno poređenje sa 3+ kriterijuma? → table
  ├─ Konkretne godine/verzije? → timeline
  └─ NE, apstraktan koncept/pipeline/odnos? → IKONE (flow/vs/merge/etc.)

IKONE SU PODRAZUMEVANO. Vizuali samo kad ima PRAVIH podataka.
```

### 0.3. Slobodan broj sekcija — content diktira strukturu

```
Sekcije po sticky-ju:
  NEMA LIMITA — koliko god transcript zahteva (1, 2, 3, 4, 5+)
  Nikad ne dodavaj fake sekciju samo za uniformnost
  Nikad ne merge-uj sekcije samo da bi imao "lep" broj

Node count po sekciji:
  Preferiraj 2 ili 3 noda
  4 noda OK za flow sa 4 koraka
  1 nod — izbegavaj (nema odnos)
  Preferiraj isti count unutar sticky-ja ali content > uniformnost

Sticky height:
  Preferiraj iste visine ali content je bitniji
  Nikad ne forsiraj strukturu zarad izgleda
```

**KLJUČNO: Content UVEK pobeđuje. Transcript diktira koliko sekcija treba, ne layout pravila.**

---

## COMMON MISTAKES (iz testiranja)

### Greška 1: Konkretni brojevi kao flow ikone
```
Transcript: "PostgreSQL 85%, Redis 43%, MongoDB 21%"
❌ [flow] PG 85% → Redis 43% → Mongo 21%  (3 noda u flow — gubi podatke!)
✅ [bar-chart] sa 3 bara: PG 85, Redis 43, Mongo 21  (vizualno pokazuje razliku)
✅ [stats] sa 3 itema: PG "85%", Redis "43%", Mongo "21%"

PRAVILO: 2+ konkretna broja u segmentu = VIZUAL, ne ikone. Bez izuzetka.
```

### Greška 2: Kod/komande kao flow ikone umesto terminal/code-block
```
Transcript: "Run npm init, then npm install express typescript"
❌ [flow] npm init → Install  (2 ikone — gubi informaciju!)
✅ [terminal] $ npm init -y / $ npm install express typescript  (prikazuje TAČNE komande)

Transcript: "Import Express, create app, define health endpoint"
❌ [flow] Import → Create → Define  (apstraktno, ne pokazuje KOD)
✅ [code-block] import express... app.get('/health')...  (prikazuje pravi snippet)
```

### Greška 4: Proces sa imenovanim koracima kao flow ikone
```
Transcript: "Stage one is build. Stage two is testing. Stage three is staging. Stage four is deploy."
❌ 4 flow sekcije sa po 3 ikone svaka  (sve izgleda isto, ne vidi se PROCES)
✅ process-steps vizual: Build → Test → Stage → Deploy  (jasno prikazuje korake)
```

### Greška 5: Node count mismatch u sticky-ju
```
❌ Step 1: [2 noda] + [3 noda] + [2 noda] + [4 noda] — sve različito
✅ Step 1: [3 noda] + [3 noda] + [3 noda] + [3 noda] — uniformno
Popravi: dodaj relevantan nod manjoj sekciji ILI merge noda u većoj
```


### 0.7. Ne forsiraj vizuale zarad raznovrsnosti

```
❌ "Moram imati 4 različita vizual tipa" → forsira table gde nema podataka
❌ "Max 30% ikona" → zamenjuje dobre ikone lošim vizualima
✅ Ako je 100% ikona najbolje za ovaj transcript → 100% ikona je ISPRAVNO
✅ Vizuali su BONUS koji poboljšava kad ima podataka, ne obaveza
```

---

## A. COMPOSITION (Sticky-Level)

### A1. Visual weight limit

Vizuali po "težini":
- **HEAVY:** code-block, table, hierarchy, split-screen (300-450px, zauzimaju puno prostora)
- **MEDIUM:** bar-chart, process-steps, timeline, list, logo-grid (250-350px)
- **LIGHT:** stats (1-2 items), kinetic, pie-chart (200-400px, kompaktni)

**Pravilo:** Max 2 HEAVY vizuala po sticky-ju. Ostatak mora biti MEDIUM/LIGHT ili ikone.

```
✅ code-block + stats         (heavy + light)
✅ table + list                (heavy + medium)
✅ list + process-steps        (medium + medium)
❌ code-block + hierarchy + table  (3 heavy = sticky prevelik za kameru)
```

### A2. Sekcije po sticky-ju — SLOBODAN BROJ

- **Koliko god transcript zahteva** (1, 2, 3, 4, 5+) — content diktira, ne layout
- Sekcije UVEK idu linearno (levo → desno), NIKAD grid
- Akcenat na tome da se transcript što bolje objasni i podeli

### A3. Vizuali nisu obavezni

Sticky sa SVE ikonama je potpuno validan. Vizuali se koriste SAMO kad sekcija ima konkretne podatke (vidi Rule 0.2).

### A4. Icon proporcija — NEMA limita

Nema minimalnog procenta vizuala. Ako transcript opisuje apstraktne pipeline-ove i koncepte, 100% icon sekcija je ISPRAVNO. Vizuali su bonus, ne kvota.

### A5. Visual + icon pairing

Kad sticky ima 1 vizual + 1 icon sekciju:
- Icon sekcija = **kontekst/overview** (apstraktni odnos)
- Vizual sekcija = **detalj** (konkretni podaci)
- Redosled zavisi od narativa: ako icon uvodi temu → icon prvi; ako vizual uvodi → vizual prvi

```
✅ [icons-flow "Overview"] + [code-block "Implementation"]  (kontekst → detalj)
✅ [code-block "The Code"] + [icons-negation "Problem → Fix"]  (detalj → kontekst)
```

### A6. Balanced visual pairing

Kad obe sekcije su vizuali, trebaju imati sličan pixel footprint:

```
Dobri parovi:
  heavy + light:    code-block + stats, table + kinetic
  medium + medium:  list + process-steps, bar-chart + timeline
  medium + light:   logo-grid + stats, list + kinetic

Loši parovi:
  heavy + heavy:    code-block + hierarchy (oba velika)
  light + light:    stats(1) + kinetic (oba sićušna, sticky prazan)
```

---

## B. SHAPE CONSISTENCY

### B1. Shape-first pristup

**UVEK** odluči shape mode za sticky PRE biranja vizuala:
1. Pogledaj koji vizual transcript ZAHTEVA (npr. "history from 2014..." = timeline = wide)
2. Shape mode = taj vizual's natural shape
3. Companion sekcija MORA da bude kompatibilna sa tim shape modom

### B2. Natural shape po vizualu

| Vizual | Natural Shape | Napomena |
|--------|---------------|----------|
| code-block | SQUARE | Wide cap na 6 linija — gubi info |
| terminal | SQUARE | Wide cap na 3 komande |
| list | SQUARE | Wide: 2 kolone (radi ok) |
| bar-chart | SQUARE | Wide: menja orijentaciju |
| process-steps | SQUARE | Wide: horizontalni layout |
| logo-grid | SQUARE | Wide: jedan red |
| hierarchy | SQUARE | Wide: horizontalno drvo |
| timeline | WIDE | Square: vertikalni, gubi horizontal clarity |
| table | WIDE | Square: uže kolone |
| split-screen | WIDE | Square: paneli stacked |
| kinetic | WIDE | Square: forsira "stack" stil |
| pie-chart | WIDE | Square: kolona layout |
| stats | DYNAMIC | ≤2 itema = wide, 3+ = square |

### B3. Shape compatibility matrix

**ZELENO — isti natural shape (uvek safe):**

SQUARE + SQUARE:
- code-block + list, code-block + process-steps, code-block + logo-grid
- code-block + bar-chart, terminal + list, terminal + process-steps
- list + bar-chart, list + logo-grid, list + hierarchy
- process-steps + logo-grid, bar-chart + process-steps
- hierarchy + logo-grid, stats(3+) + bilo koji square

WIDE + WIDE:
- timeline + stats(1-2), timeline + kinetic, timeline + table
- timeline + split-screen, table + stats(1-2), table + kinetic
- split-screen + stats(1-2), pie-chart + stats(1-2), pie-chart + kinetic

**ŽUTO — radi uz oprez:**
- timeline + list (list se adaptira na 2 kolone — ok)
- table + bar-chart (bar-chart menja orijentaciju — ok)
- split-screen + process-steps (process-steps horizontalno — ok)
- code-block + stats(1-2) (code-block wide gubi linije — max 6)

**CRVENO — izbegavaj:**
- code-block + timeline (code hoće tall-narrow, timeline hoće wide-short)
- hierarchy + split-screen (hierarchy treba vertikalni prostor, split-screen širinu)
- code-block + split-screen (oba velika, različite dimenzije)
- terminal + pie-chart (terminal square, pie-chart wide)

### B4. Rešavanje shape konflikta

Kad transcript zahteva vizuale sa različitim natural shapes u istom sticky-ju:

1. **RAZDVOJ** u 2 sticky-ja (svaki sa svojim natural shape), poveži sa direction="right"
2. **ZAMENI** minority vizual sa shape-kompatibilnom alternativom (npr. timeline → process-steps za square mode)
3. **KORISTI IKONE** za minority — icon sekcije su shape-neutral i uvek rade

### B5. Icon sekcije su shape-neutral

Icon sekcije (ExplainerLayout) rade u oba shape moda jer su male (56x56 ikone). Uvek safe kao companion za BILO koji vizual.

---

## C. CONTENT DENSITY

### C1. Hard limits po shape modu

| Vizual | Square Max | Wide Max | Optimalno |
|--------|-----------|----------|-----------|
| code-block | 12 linija | 6 linija | 5-8 linija |
| terminal | 5 komandi | 3 komande | 2-3 komande |
| list | 5 stavki | 5 stavki (2 col) | 3-4 stavke |
| table | 5 redova × 4 col | 5 redova × 5 col | 3-4 reda × 3 col |
| bar-chart | 5 barova | 5 barova | 3-4 bara |
| pie-chart | 5 segmenata | 5 segmenata | 3-4 segmenta |
| stats | 4 itema (2×2) | 4 itema (1 red) | 2-3 itema |
| timeline | 5 tačaka (vert) | 5 tačaka (horiz) | 4 tačke |
| process-steps | 5 koraka | 5 koraka | 3-4 koraka |
| logo-grid | 6 ikona (2×3) | 6 ikona (1 red) | 4-6 ikona |
| hierarchy | 8 nodova total | 8 nodova total | 5-7 nodova |
| split-screen | 4 itema/strana | 5 itema/strana | 3-4 itema/strana |
| kinetic | 8 reči | 8 reči | 4-6 reči |

### C2. Balans između sekcija

Razlika u item count između 2 sekcije u istom sticky-ju: **MAX 2 itema.**

```
✅ list (4 stavke) + process-steps (3 koraka)   → razlika 1
✅ stats (3 itema) + bar-chart (3 bara)          → razlika 0
❌ list (7 stavki) + stats (1 item)              → razlika 6
❌ table (5 redova) + kinetic (1 fraza)          → razlika 4
```

Ako je disbalans prevelik:
1. Trim veći vizual (ukloni najmanje bitne stavke)
2. Expand manji vizual (traži implicitne stavke u transcriptu)
3. Zameni manji vizual sa tipom koji prirodno ima manje itema (stats, kinetic)

### C3. Kad splitovati sekciju

**Split u 2 sekcije kad:**
- Transcript ima 8+ stavki za jedan vizual (npr. 10 features → 2 liste od 5)
- Sadržaj se prirodno deli u 2 kategorije ("benefits and drawbacks" = split-screen)
- Vizual bi prešao max items i truncation gubi bitne info

**NE splituj kad:**
- Stavke su kohezivan set (5 tutorial koraka — cepanje 1-3 i 4-5 lomi flow)
- Vizual tip handluje count (logo-grid sa 12 ikona je ok)

---

## D. DISAMBIGUATION

### D1. Table vs Split-screen

```
Poredi TAČNO 2 stvari?
  ├─ DA: Ima jasno pro/con ili dobro/loše strane?
  │   ├─ DA → split-screen (left=negativno, right=pozitivno)
  │   └─ NE: Multi-criteria poređenje (3+ atributa)?
  │       ├─ DA → table (kriterijumi kao redovi)
  │       └─ NE → split-screen (neutralne boje)
  └─ NE: Poredi 3+ stvari?
      └─ DA → table (stvari kao kolone, kriterijumi kao redovi)
```

### D2. Stats vs Bar-chart vs Pie-chart

```
Brojevi treba da IMPRESIONIRAJU (standalone "wow")?
  ├─ DA → stats ("10M+", "99.9%", "$2.5B")
  └─ NE: Brojevi treba da se POREDE (relativne veličine)?
      ├─ DA → bar-chart (React 40%, Vue 18%, Angular 17%)
      └─ NE: Brojevi su DISTRIBUCIJA (delovi celine)?
          └─ DA → pie-chart (Compute 70%, Storage 20%, Network 10%)
```

**Ključno:** Stats koristi STRING vrednosti ("10M+") — ne moraju biti matematički uporedive. Bar-chart koristi NUMERIČKE vrednosti na istoj skali.

### D3. List vs Process-steps

```
RED KORAKA je bitan (step 1 pre step 2)?
  ├─ DA → process-steps (numerisani krugovi sa konektorima)
  └─ NE: Neuređena kolekcija?
      ├─ DA → list (bullet/numbered/checklist)
      └─ NE: Samo 2 koraka?
          └─ DA → icons sa flow layoutom (premalo za process-steps, min 3)
```

### D4. Flow icons vs Process-steps

```
3+ konkretnih koraka sa imenima i opisima?
  ├─ DA → process-steps vizual
  └─ NE: Apstraktan pipeline ili odnos?
      ├─ DA → icons sa flow layoutom
      └─ NE: Samo 2 elementa u sekvenci?
          └─ DA → icons sa arrow layoutom
```

**Razlika:** Process-steps = konkretni tutorial koraci ("Install Node", "Create project"). Flow icons = apstraktni koncepti ("Request → Auth → Process → Response").

### D5. Code-block vs Terminal

```
Izvorni kod (funkcije, klase, importi, config)?
  ├─ DA → code-block (syntax highlighting, filename, line numbers)
  └─ NE: CLI komande (npm, docker, git, kubectl)?
      ├─ DA → terminal (prompt $, command, output)
      └─ NE: Config fajl (YAML, JSON, .env)?
          └─ DA → code-block (tretiraj kao kod)
```

---

## E. VARIETY

### E1. Isti vizual max 2× po videu

Ako transcript zahteva treću instancu istog tipa:
1. Zameni sa drugim tipom koji prikazuje iste podatke (treća lista → logo-grid ili process-steps)
2. Merge sadržaj u postojeću instancu (proširi listu sa 3 na 5 stavki)
3. Koristi icon sekciju umesto toga

**Izuzetak:** Icon sekcije nemaju repeat limit.

### E2. Kinetic: max 1 po videu — PRIORITETNO za početak!

```
PRAVILO: Animacija MORA da krene odmah (unutar 0.5 sekundi od početka videa).

Ako prvi sticky NEMA adekvatan vizual ili ikone koje odmah kreću animaciju:
  → Stavi kinetic u PRVI sticky kao intro/hook
  → Kinetic odmah pokreće animaciju — gledalac vidi motion od frame 1

Kinetic NIJE obavezan za kraj videa. Koristi ga gde ima smisla:
  - Kao intro/hook (prvi sticky) — kad nema bolji vizual za početak
  - Kao punchline/finale (zadnji sticky) — kad transcript ima jak završetak
  - NIKAD oboje u istom videu (max 1 kinetic po videu)
```

### E3. Susedni sticky-ji — soft preporuka za raznovrsnost

Ako susedni sticky-ji oba imaju vizualne sekcije, poželjno je da budu različiti tipovi. Ali ovo je SOFT preporuka — ako transcript zahteva isti vizual tip u 2 susedna sticky-ja, to je OK.

**Za icon sekcije: nema limita.** Svi sticky-ji mogu imati icon-flow sekcije.

### E4. Diversity targets — SOFT PREPORUKE (ne hard requirements!)

Poželjno ali NE obavezno:
- Koristi vizuale kad ima konkretnih podataka
- Variraj layout tipove ikona (flow, vs, merge, combine — ne sve flow)
- Ako transcript ima brojeve → dodaj stats/bar-chart
- Ako transcript poredi → dodaj table/split-screen
- **ALI: NIKAD ne forsiraj vizual samo zarad raznovrsnosti (Rule 0.3)**

---

## F. DIRECTION & CONNECTION

### F1. Direction — UVEK "right"

```
Svi sticky-ji idu linearno levo → desno. UVEK direction: "right".
Nema "below", nema grid, nema clockwise.
Kamera samo panuje u jednom smeru — jednostavno, glatko, profesionalno.
```

### F2. Connection type izbor

| Tip | Kad | Primer |
|-----|-----|--------|
| `flow` | Default. Sekvencijalna progresija | Step 1 → Step 2 |
| `bidirectional` | Dvosmerna komunikacija | API ↔ Database |
| `vs` | Direktno poređenje (trigger group camera zoom-out) | Monolith vs Microservices |
| `none` | Bez vizuelne veze (zadnji sticky, ili nepovezani) | Conclusion |

---

## G. CONTENT CONDENSATION

### G1. Word limits po kontekstu

| Kontekst | Max reči | Primer |
|----------|----------|--------|
| Node label | 2 reči ili 1 acronym | "API Server", "K8s", "Auth" |
| List item | 4-5 reči | "Zero-config deployment" |
| Table cell | 3 reči | "Yes", "42kb", "Medium" |
| Timeline description | 4-5 reči | "Born at Google" |
| Process step label | 2-3 reči | "Clone Repo" |
| Process step description | 4-5 reči | "Run npm install" |
| Stats label | 1-2 reči | "Users", "Uptime" |
| Stats subtitle | 2-3 reči | "Monthly active" |
| Kinetic text | 4-8 reči total | "Ship fast, break nothing" |
| Split-screen item | 3-4 reči | "Single codebase" |
| Hierarchy node label | 1-2 reči | "Frontend", "React" |
| Logo-grid label | 1-2 reči | "Docker", "PostgreSQL" |
| Section title | 2-3 reči | "Key Metrics", "Deploy Flow" |
| Sticky title | 1-3 reči | "Overview", "Build & Test" |

### G2. Tehnike kondenzacije (primeni redom)

1. **Ukloni članove i prepozicije:** "The process of deployment" → "Deployment process"
2. **Koristi glagolske oblike:** "It provides automatic scaling" → "Auto-scales"
3. **Skraćenice za poznat tech:** "Kubernetes" → "K8s", "JavaScript" → "JS", "database" → "DB"
4. **Ukloni kvalifikatore:** "very fast performance" → "High performance"
5. **Imeničke fraze:** "You need to install dependencies" → "Install deps"
6. **Truncate na core:** "Automatically distributes pods across available nodes in the cluster" → "Auto-distribute pods"

### G3. Kada parafrazirati vs koristiti tačne reči

- **Tačne reči za:** Proper nouns, tech imena, brojeve, citate, CLI komande
- **Parafraza za:** Objašnjenja, benefits, opise, korake
- **AI generiše za:** code-block (ilustrativni snippet, NE transcript tekst)

### G4. Stats value formatting

- Brojevi > 1000: K/M/B suffix ("3,500+" ili "3.5K+")
- Procenti: uključi % ("99.9%")
- Novac: valuta simbol ("$2.5B")
- Vreme: kratke jedinice ("12ms", "3.5s")
- Rasponi: < ili > ("<200ms", ">99%")
- Aproksimacije: dodaj + ("10M+")

---

## H. EDGE CASES

### H1. Premalo podataka (ispod minimuma vizuala)

```
Samo 1 data point?
  ├─ Broj? → stats (min 1 item radi)
  ├─ Fraza? → kinetic (ako nije iskorišćen)
  └─ Koncept? → icon sekcija (uvek radi sa 2+ noda)

Samo 2 data pointa?
  ├─ Poređenje? → split-screen (min 2/strana) ili icons sa "vs" layoutom
  ├─ Sekvenca? → icons sa "arrow" layoutom (min 2 noda)
  └─ Kategorije? → stats (2 itema, wide mode)
```

### H2. Previše podataka (iznad maksimuma)

```
8+ stavki za listu?
  ├─ Mogu se grupisati u 2 kategorije? → 2 liste u istom sticky-ju
  ├─ Mogu se rangirati? → top 5 (list numbered), discard rest
  └─ Tehnologije? → logo-grid (do 12 ikona)

8+ koraka za proces?
  ├─ Mogu se grupisati u faze? → 2 sticky-ja, svaki sa 3-4 koraka
  └─ Mogu se merge-ovati? → Spoji srodne ("install" + "configure" = "Setup")

6+ kriterijuma za poređenje?
  ├─ Split u 2 tabele kroz 2 sticky-ja
  └─ Izaberi top 4-5 najbitnijih kriterijuma

Kod 15+ linija?
  ├─ Izvuci KEY 5-8 linija koje pokazuju koncept
  └─ Koristi highlightLines za bitne linije
```

### H3. Ambiguozan match (matchuje više vizuala)

Prioritet tiebreaker:
1. **Specifičnost** — vizual sa najkonkretnijim prikazom podataka
2. **Gustina podataka** — vizual koji prenosi NAJVIŠE info iz transcripta
3. **Shape compatibility** — vizual koji matchuje sticky shape mode
4. **Variety** — vizual koji NIJE već korišćen u videu
5. **Visual over icons** — ako vizual radi, uvek ga preferiraj nad ikonama

### H4. Mixed content u segmentu

Kad segment ima više tipova sadržaja (brojevi + poređenje + lista):
- **Split u više sekcija** u istom sticky-ju, svaka sa odgovarajućim vizualom
- NE forsiraj sve u jedan vizual

```
"K8s has 3,500 contributors. Workers run runtime, kubelet, and proxy."
→ Sekcija 1: stats { items: [{ label: "Contributors", value: "3,500+" }] }
→ Sekcija 2: icons flow [Runtime, Kubelet, Proxy]
```

### H5. Transcript bez vizual patterna

Čisto narativni tekst bez podataka → icon sekcija:
1. Odredi ODNOS koji se opisuje
2. Mapiraj na layout:
   - "A vodi ka B" → flow/arrow
   - "A vs B" → vs
   - "A + B = C" → combine
   - "Problem → Rešenje" → negation
   - "Ili A ili B" → if-else
   - "Više stvari → jedna" → merge
   - "A komunicira sa B" → bidirectional
   - "Filter/selekcija" → filter
3. Napravi 2-4 noda sa kratkim labelima
4. Koristi batch_icons.py za Phosphor ikone
