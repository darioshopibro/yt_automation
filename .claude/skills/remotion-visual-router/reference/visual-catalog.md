# Visual Catalog — Svi dostupni vizualni tipovi

## Vizualni tipovi (13)

> Za composition pravila, shape compatibility i disambiguation vidi → `composition-rules.md`

### code-block
Syntax-highlighted kod sa tamnom pozadinom, line numbers, file header.
- **Shape:** SQUARE | **Weight:** HEAVY
- **Min:** 3 linije | **Max:** 12 (square), 6 (wide) | **Optimalno:** 5-8
- **Props:** `language`, `filename?`, `code`, `highlightLines?`
- **Dobri parovi:** list, process-steps, logo-grid, bar-chart, stats(3+)
- **Izgleda dobro kad:** prikazuje konkretan snippet koji ilustruje temu

### terminal
CLI simulacija sa prompt, komandama i output-om.
- **Shape:** SQUARE | **Weight:** MEDIUM
- **Min:** 1 komanda | **Max:** 5 (square), 3 (wide) | **Optimalno:** 2-3
- **Props:** `commands[]` (command + output?), `title?`
- **Dobri parovi:** list, process-steps, logo-grid, bar-chart
- **Izgleda dobro kad:** prikazuje install korake, docker commands, git workflow

### list
Bullet/numbered/checklist lista.
- **Shape:** SQUARE | **Weight:** MEDIUM
- **Min:** 3 stavke | **Max:** 5 | **Optimalno:** 3-4
- **Styles:** "bullet" (features), "numbered" (top 5), "checklist" (done/todo)
- **Props:** `items[]`, `style?`
- **Dobri parovi:** code-block, terminal, bar-chart, logo-grid, hierarchy, process-steps
- **Izgleda dobro kad:** nabrajanje benefits, reasons, features

### kinetic
Animirani tekst sa naglašenim rečima. **MAX 1 PO VIDEU — samo finale/punchline!**
- **Shape:** WIDE | **Weight:** LIGHT
- **Min:** 3 reči | **Max:** 8 | **Optimalno:** 4-6
- **Styles:** "impact" (big + glow), "stack" (vertikalno), "reveal" (word-by-word)
- **Props:** `text`, `highlight[]`, `style?`
- **Dobri parovi:** timeline, table, split-screen, stats(1-2), pie-chart
- **Izgleda dobro kad:** key quote, punchline, "the takeaway is..."

### table
Tabela sa headerom i redovima.
- **Shape:** WIDE | **Weight:** HEAVY
- **Min:** 2r × 2c | **Max:** 5r × 4c (square), 5r × 5c (wide) | **Optimalno:** 3-4r × 3c
- **Props:** `headers[]`, `rows[][]`, `highlightCol?`
- **Auto-styling:** "Yes"/"No" automatski dobija zeleno/crveno
- **Dobri parovi:** stats(1-2), kinetic, timeline
- **Izgleda dobro kad:** feature comparison 3+ stvari, specs, structured data

### bar-chart
Horizontalni bar chart.
- **Shape:** SQUARE | **Weight:** MEDIUM
- **Min:** 2 bara | **Max:** 5 | **Optimalno:** 3-4
- **Props:** `items[]` (label + value + color?), `unit?`, `maxValue?`
- **Dobri parovi:** list, code-block, process-steps, terminal
- **Izgleda dobro kad:** benchmark, adoption %, performance comparison

### pie-chart
Donut ili pie chart sa legendom.
- **Shape:** WIDE | **Weight:** LIGHT
- **Min:** 2 segmenta | **Max:** 5 | **Optimalno:** 3-4
- **Props:** `items[]` (label + value + color?), `donut?`
- **Dobri parovi:** stats(1-2), kinetic
- **Izgleda dobro kad:** distribucija (cost breakdown, market share)

### stats
Grid velikih brojeva sa labelama.
- **Shape:** DYNAMIC (≤2 items = wide, 3+ = square) | **Weight:** LIGHT
- **Min:** 1 stat | **Max:** 4 (square 2×2), 4 (wide 1 red) | **Optimalno:** 2-3
- **Props:** `items[]` (label + value + subtitle? + color?)
- **Value format:** String — "10M+", "99.9%", "$2.5B", "3,500+"
- **Dobri parovi:** SVIH vizuala (univerzalno kompatibilan)
- **Izgleda dobro kad:** impressive numbers, KPIs, at-a-glance metrics

### timeline
Horizontalna ili vertikalna linija sa milestone tačkama.
- **Shape:** WIDE | **Weight:** MEDIUM
- **Min:** 3 tačke | **Max:** 5 | **Optimalno:** 4
- **Direction:** horizontal (wide), vertical (square)
- **Props:** `items[]` (label + description? + color?), `direction?`
- **Dobri parovi:** stats(1-2), kinetic, table, split-screen
- **Izgleda dobro kad:** history, evolution, version releases

### process-steps
Numerisani koraci sa checkmark progresijom.
- **Shape:** SQUARE | **Weight:** MEDIUM
- **Min:** 3 koraka | **Max:** 5 | **Optimalno:** 3-4
- **Props:** `steps[]` (label + description?)
- **Dobri parovi:** code-block, terminal, list, logo-grid, bar-chart
- **Izgleda dobro kad:** tutorial, how-to, installation steps

### logo-grid
Grid ikona/logotipa sa labelama.
- **Shape:** SQUARE | **Weight:** MEDIUM
- **Min:** 3 itema | **Max:** 6 (square 2×3), 6 (wide 1 red) | **Optimalno:** 4-6
- **Props:** `items[]` (icon + label + color?), `cols?`
- **Icon:** Phosphor PascalCase ime (koristi batch_icons.py!)
- **Color:** prepoznatljiva boja tehnologije (#2496ed Docker, #326ce5 K8s...)
- **Dobri parovi:** code-block, terminal, list, process-steps, hierarchy
- **Izgleda dobro kad:** tech stack, tools, integrations, "works with..."

### hierarchy
Tree struktura sa parent-child vezama.
- **Shape:** SQUARE | **Weight:** HEAVY
- **Min:** 1 root + 2 children | **Max:** 8 nodova total, 3 nivoa | **Optimalno:** 5-7 nodova
- **Props:** `root` (label + children[])
- **Dobri parovi:** list, logo-grid
- **Izgleda dobro kad:** file structure, class inheritance, system layers

### split-screen
Dva panela side-by-side sa divider-om.
- **Shape:** WIDE | **Weight:** HEAVY
- **Min:** 2 stavke/strana | **Max:** 4/strana (sq), 5/strana (wide) | **Optimalno:** 3-4/strana
- **Props:** `left` (title + items[]), `right` (title + items[]), `leftColor?`, `rightColor?`, `dividerLabel?`
- **Default boje:** left = #ef4444 (red/negative), right = #22c55e (green/positive)
- **Dobri parovi:** stats(1-2), kinetic, timeline
- **Izgleda dobro kad:** before/after, pros/cons, problem/solution, old way/new way

---

## Fallback: ExplainerLayout (ikone)

Kad nijedan vizual ne odgovara — koristi ikone sa layout-om.

**9 layout tipova:**

| Layout | Odnos | Primer |
|--------|-------|--------|
| flow | A → B → C | sekvenca, pipeline, proces |
| arrow | A → B | jednostavna veza |
| vs | A vs B | poređenje alternativa |
| combine | A + B = C | kombinacija elemenata |
| negation | ✗A → B | problem → rešenje |
| if-else | A → [B, C] | decision/branch |
| merge | [A, B] → C | više inputa, jedan output |
| bidirectional | A ↔ B | dvosmerna komunikacija |
| filter | A ▷ B | filtriranje/selekcija |

**Node pravila:**
- 2-4 nodova po sekciji
- Label: max 2 kratke reči ILI 1 duža ILI acronym
- Icon: Phosphor PascalCase (NIKAD duplikat u celom videu)
