# Extraction Rules — Šta tačno izvući za svaki vizualni tip

## Princip

Za svaki vizualni tip, pročitaj segment transcripta i izvuci TAČNE podatke. Ne izmišljaj — ako tekst ne sadrži dovoljno podataka za vizual, koristi ikone kao fallback.

## ⚠️ GLOBALNA PRAVILA ZA SVE VIZUALE

> **Za detaljna composition/shape/variety pravila vidi → `composition-rules.md`**

### Max items po shape modu

| Vizual | Square Max | Wide Max | Optimalno | Min |
|--------|-----------|----------|-----------|-----|
| code-block | 12 linija | 6 linija | 5-8 | 3 |
| terminal | 5 komandi | 3 komande | 2-3 | 1 |
| list | 5 stavki | 5 stavki (2 col) | 3-4 | 3 |
| table | 5r × 4c | 5r × 5c | 3-4r × 3c | 2r × 2c |
| bar-chart | 5 barova | 5 barova | 3-4 | 2 |
| pie-chart | 5 seg | 5 seg | 3-4 | 2 |
| stats | 4 (2×2) | 4 (1 red) | 2-3 | 1 |
| timeline | 5 (vert) | 5 (horiz) | 4 | 3 |
| process-steps | 5 koraka | 5 koraka | 3-4 | 3 |
| logo-grid | 6 (2×3) | 6 (1 red) | 4-6 | 3 |
| hierarchy | 8 nodova | 8 nodova | 5-7 | 3 |
| split-screen | 4/strana | 5/strana | 3-4/strana | 2/strana |
| kinetic | 8 reči | 8 reči | 4-6 | 3 |

### Text length limits

```
- Svaka stavka (list item, table cell, step label): MAX 4-5 reči
  ❌ "Install master or worker processes on bare metal" (8 reči)
  ✅ "Install worker processes" (3 reči)
  ❌ "Pods auto-distribute to new nodes in cluster" (8 reči)
  ✅ "Auto-distribute pods" (2 reči)

- Node label: MAX 2 kratke reči ili 1 acronym
- Stats label: MAX 2 reči
- Kinetic: MAX 8 reči, highlight MAX 3 reči
```

### Ostala globalna pravila

```
1. BALANCED PAIRS: 2 sekcije u istom sticky-ju — razlika max 1-2 itema
   ❌ Lista 5 stavki + Steps 2 koraka (razlika 3)
   ✅ Lista 4 stavki + Steps 3 koraka (razlika 1)

2. KINETIC: max 1 po celom videu, samo za finale/punchline

3. VARIETY: isti vizual tip max 2× po videu (vidi composition-rules.md E)

4. SHAPE: sve sekcije u sticky-ju treba da matchuju isti shape mode
   (vidi composition-rules.md B za compatibility matrix)
```

---

## code-block

**Kad:** Tekst pominje konkretan kod, library, API, config.

**Šta izvući:**
```json
{
  "visualType": "code-block",
  "visualData": {
    "language": "typescript",
    "filename": "server.ts",
    "code": "import express from 'express';\n\nconst app = express();\napp.get('/api', (req, res) => {\n  res.json({ status: 'ok' });\n});\n\napp.listen(3000);",
    "highlightLines": [4, 5]
  }
}
```

**Pravila:**
- `language`: prepoznaj iz konteksta (pominje "Python" → python, "npm" → javascript, "Docker" → dockerfile)
- `filename`: ako se pominje fajl (server.ts, Dockerfile, config.yaml) — koristi ga
- `code`: AI GENERIŠE snippet koji ilustruje temu. NE kopira transcript doslovno. 3-12 linija.
- `highlightLines`: 1-3 najbitnije linije (obično core logika)

**Primer iz transcripta:**
> "You need to create a basic Express server with a health check endpoint"
→ AI generiše: express import + app.get('/health') + listen

---

## terminal

**Kad:** Tekst pominje CLI komande, install, docker, git, npm run.

```json
{
  "visualType": "terminal",
  "visualData": {
    "commands": [
      { "prompt": "$", "command": "npm create vite@latest my-app", "output": "Scaffolding project..." },
      { "prompt": "$", "command": "cd my-app && npm install" },
      { "prompt": "$", "command": "npm run dev", "output": "  VITE ready at http://localhost:5173/" }
    ],
    "title": "bash — setup"
  }
}
```

**Pravila:**
- `command`: tačna komanda iz teksta ili logičan ekvivalent
- `output`: kratak realan output (1-3 linije). Ako tekst ne govori o output-u, izostavi.
- `prompt`: "$" (default), ">" za Windows, "#" za root
- Max 5 komandi. Ako tekst pominje više → izaberi najbitnije.

---

## list

**Kad:** Tekst nabraja stavke — benefits, features, reasons, requirements.

```json
{
  "visualType": "list",
  "visualData": {
    "items": [
      "Zero-config deployment with automatic HTTPS",
      "Edge runtime for ultra-low latency",
      "Built-in CI/CD with preview deployments",
      "Real-time analytics dashboard"
    ],
    "style": "bullet"
  }
}
```

**Pravila:**
- `items`: izvuci TAČNE stavke iz teksta. Svaka stavka = **MAX 4-5 reči!**
  ❌ "Install master or worker processes" (predugačko, 5+ reči)
  ✅ "Install master processes" (kraće)
  ❌ "Pods auto-distribute to new nodes" (predugačko)
  ✅ "Auto-distribute pods" (kraće)
- `style`:
  - "bullet" → features, benefits, capabilities
  - "numbered" → top 5, rangiranje, prioritet
  - "checklist" → tasks, requirements, done items
- 3-7 stavki. Ako tekst ima 2 → dodaj fallback ikone. Ako ima 10+ → grupiši ili skrati.

---

## table

**Kad:** Tekst poredi 2-4 stvari po više kriterijuma.

```json
{
  "visualType": "table",
  "visualData": {
    "headers": ["Feature", "React", "Vue", "Svelte"],
    "rows": [
      ["Virtual DOM", "Yes", "Yes", "No"],
      ["Bundle Size", "42kb", "33kb", "1.6kb"],
      ["Learning Curve", "Medium", "Easy", "Easy"],
      ["TypeScript", "Yes", "Yes", "Yes"]
    ],
    "highlightCol": 3
  }
}
```

**Pravila:**
- `headers`: prva kolona = kriterijum, ostale = stvari koje se porede
- `rows`: svaki red = jedan kriterijum. Koristi "Yes"/"No" gde moguće (auto-zeleno/crveno).
- `highlightCol`: kolona "pobednika" ili fokusa (obično poslednja ili ona o kojoj tekst najviše priča)
- 2-6 redova, 3-5 kolona. Ako tekst poredi samo 2 stvari sa 1-2 kriterijuma → koristi split-screen umesto table.

---

## bar-chart

**Kad:** Tekst pominje numeričke vrednosti za poređenje.

```json
{
  "visualType": "bar-chart",
  "visualData": {
    "items": [
      { "label": "React", "value": 40 },
      { "label": "Vue", "value": 18 },
      { "label": "Angular", "value": 17 },
      { "label": "Svelte", "value": 8 }
    ],
    "unit": "%",
    "maxValue": 50
  }
}
```

**Pravila:**
- Vrednosti MORAJU biti numeričke. "React is popular" → NE koristi bar chart. "React: 40%" → DA.
- `unit`: "%" za procente, "$" za novac, "" za ostalo
- `maxValue`: postavi na smislenu gornju granicu (100 za %, auto za ostalo)
- 3-8 barova. Sortiraj od najvećeg ka najmanjem.

---

## pie-chart

**Kad:** Distribucija/udeo — "X% goes to Y, Z% to W".

```json
{
  "visualType": "pie-chart",
  "visualData": {
    "items": [
      { "label": "Compute", "value": 70 },
      { "label": "Storage", "value": 20 },
      { "label": "Network", "value": 10 }
    ],
    "donut": true
  }
}
```

**Pravila:**
- Vrednosti treba da se saberu u smislenu celinu (100% ili ukupan budget).
- `donut: true` (default, izgleda bolje od punog pie-a)
- 3-6 segmenata. Ako su 2 → koristi stats umesto pie.

---

## stats

**Kad:** Tekst pominje impresivne brojeve, KPI, metrike.

```json
{
  "visualType": "stats",
  "visualData": {
    "items": [
      { "label": "Users", "value": "10M+", "subtitle": "Monthly active" },
      { "label": "Uptime", "value": "99.9%", "subtitle": "Last 12 months" },
      { "label": "Latency", "value": "12ms", "subtitle": "p99 globally" }
    ]
  }
}
```

**Pravila:**
- `value` je STRING (formatiran za prikaz): "10M+", "$2.5B", "99.9%", "3,500+"
- `label`: 1-2 reči, uppercase u prikazu
- `subtitle`: opciono, kontekst za broj
- 1-6 statova. Ako tekst ima samo 1 broj → možda stats nije pravi izbor, koristi kinetic.

---

## timeline

**Kad:** Tekst pominje hronologiju — godine, verzije, evoluciju.

```json
{
  "visualType": "timeline",
  "visualData": {
    "items": [
      { "label": "2014", "description": "Kubernetes born at Google" },
      { "label": "2015", "description": "CNCF founded" },
      { "label": "2018", "description": "Production ready" },
      { "label": "2024", "description": "De facto standard" }
    ],
    "direction": "horizontal"
  }
}
```

**Pravila:**
- `label`: godina, verzija ("v1.0"), ili kratak marker
- `description`: 2-5 reči objašnjenja
- `direction`: "horizontal" za 3-5 tačaka, "vertical" za 6+
- Hronološki redosled (od starijeg ka novijem)

---

## process-steps

**Kad:** Tutorial, how-to, numerisani koraci.

```json
{
  "visualType": "process-steps",
  "visualData": {
    "steps": [
      { "label": "Clone Repo", "description": "git clone the repository" },
      { "label": "Install Deps", "description": "Run npm install" },
      { "label": "Configure", "description": "Set up .env file" },
      { "label": "Run Tests", "description": "npm run test" },
      { "label": "Deploy", "description": "Push to production" }
    ]
  }
}
```

**Pravila:**
- `label`: 1-3 reči (ime koraka)
- `description`: 1 kratka rečenica
- 3-7 koraka. Ako tekst opisuje 2 koraka → koristi flow ikone umesto process-steps.

---

## logo-grid

**Kad:** Tekst pominje 3+ tehnologija/alata po imenu.

```json
{
  "visualType": "logo-grid",
  "visualData": {
    "items": [
      { "icon": "Package", "label": "Docker", "color": "#2496ed" },
      { "icon": "Cube", "label": "Kubernetes", "color": "#326ce5" },
      { "icon": "Database", "label": "PostgreSQL", "color": "#336791" },
      { "icon": "Lightning", "label": "Redis", "color": "#dc382d" }
    ]
  }
}
```

**Pravila:**
- `icon`: Phosphor PascalCase. **OBAVEZNO koristi batch_icons.py!**
- `label`: ime tehnologije
- `color`: prepoznatljiva boja (Docker blue, Redis red, K8s blue, AWS orange...)
- 3-12 itema. Grid se auto-layoutira (3 cols za ≤6, 4 za 7+).

**Poznate boje:**
Docker=#2496ed, K8s=#326ce5, AWS=#ff9900, GCP=#4285f4, Azure=#0078d4,
React=#61dafb, Vue=#42b883, Node=#339933, Python=#3776ab, Go=#00add8,
Redis=#dc382d, PostgreSQL=#336791, MongoDB=#47a248, Nginx=#009639

---

## hierarchy

**Kad:** Tekst opisuje strukturu sa nivoima — file system, class inheritance, system layers.

```json
{
  "visualType": "hierarchy",
  "visualData": {
    "root": {
      "label": "Application",
      "children": [
        { "label": "Frontend", "children": [{ "label": "React" }, { "label": "Next.js" }] },
        { "label": "Backend", "children": [{ "label": "Express" }, { "label": "GraphQL" }] },
        { "label": "Database", "children": [{ "label": "PostgreSQL" }] }
      ]
    }
  }
}
```

**Pravila:**
- Max 3 nivoa dubine
- Max 10 nodova ukupno (root + children + grandchildren)
- Root je najširi/najbitniji koncept

---

## split-screen

**Kad:** Direktno poređenje DVE stvari sa listama.

```json
{
  "visualType": "split-screen",
  "visualData": {
    "left": {
      "title": "Monolith",
      "items": ["Single codebase", "Tightly coupled", "One deployment", "Vertical scaling"]
    },
    "right": {
      "title": "Microservices",
      "items": ["Multiple services", "Loosely coupled", "Independent deploy", "Horizontal scaling"]
    },
    "leftColor": "#ef4444",
    "rightColor": "#22c55e",
    "dividerLabel": "vs"
  }
}
```

**Pravila:**
- Left = "loše/staro/problem", Right = "dobro/novo/rešenje" (ili neutralno)
- `leftColor`: #ef4444 (red) za negativno, ostalo po kontekstu
- `rightColor`: #22c55e (green) za pozitivno
- 2-6 stavki po strani. Idealno isti broj na obe strane.

---

## kinetic

**Kad:** Key quote, punchline, emphasis moment.

```json
{
  "visualType": "kinetic",
  "visualData": {
    "text": "Ship fast, break nothing, scale everything",
    "highlight": ["fast", "nothing", "everything"],
    "style": "impact"
  }
}
```

**Pravila:**
- `text`: TAČAN citat ili parafraza iz transcripta (3-10 reči)
- `highlight`: 1-3 ključne reči
- `style`: "impact" (default, big + glow), "stack" (vertikalno, dramatično), "reveal" (word-by-word)
- Koristi RETKO — max 1 kinetic po videu. Za finale/punchline.

---

## ikone (ExplainerLayout fallback)

**Kad:** Apstraktan koncept, proces, odnos — nema konkretnih podataka za vizual.

```json
{
  "layout": "flow",
  "nodes": [
    { "label": "Request", "icon": "ArrowRight" },
    { "label": "Auth", "icon": "ShieldCheck" },
    { "label": "Process", "icon": "Cpu" },
    { "label": "Response", "icon": "Export" }
  ]
}
```

**Layout decision:**
- Sekvencijalni koraci? → `flow`
- Problem → Rešenje? → `negation`
- Poređenje? → `vs`
- Kombinacija? → `combine`
- Decision/branch? → `if-else`
- Više u jedno? → `merge`
- Dvosmerno? → `bidirectional`
- Filtriranje? → `filter`
- Prosta veza? → `arrow`

**Node pravila:**
- 2-4 nodova (nikad 1, nikad 5+)
- Label: max 2 kratke reči ILI 1 duža ILI acronym
- Icon: batch_icons.py za tačne Phosphor nazive
- NIKAD isti icon dva puta u celom videu
