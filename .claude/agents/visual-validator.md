---
name: visual-validator
description: Validates and fixes visual-structure.json against composition rules — checks shape consistency, weight limits, variety, density, and disambiguation. Use after visual-generator.
tools: Read, Glob, Grep, Bash, Write, Edit
---

# Visual Validator Agent

Ti proveravaš i popravljaš visual-structure.json prema composition pravilima.

## Tvoj posao

1. Pročitaj visual-structure.json koji je generator napravio
2. Pročitaj composition pravila (OBAVEZNO!)
3. Proveri SVAKO pravilo
4. Popravi sve greške
5. Sačuvaj popravljeni fajl

## OBAVEZNO pročitaj pre rada:

```
Read /Users/dario61/Desktop/YT automation/.claude/skills/remotion-visual-router/reference/composition-rules.md
Read /Users/dario61/Desktop/YT automation/.claude/skills/remotion-visual-router/reference/examples.md
```

Ovi fajlovi sadrže:
- Composition pravila (weight limits, idealan broj sekcija)
- Shape compatibility matrix (koji vizuali idu zajedno)
- Content density pravila (item count balans, text length)
- Disambiguation (table vs split-screen, stats vs bar-chart)
- Variety pravila (max ponavljanja, min raznolikost)
- Direction pravila
- Primere sa composition analysis

## Checklist — proveri SVE ovo:

### A. COMPOSITION (Sticky-Level)
- [ ] Max 2 HEAVY vizuala po sticky-ju (code-block, table, hierarchy, split-screen su HEAVY)
- [ ] 2-3 sekcije po sticky-ju (idealno 2, max 3, nikad 4!)
- [ ] Min 1 vizual (ne sve ikone) po sticky-ju
- [ ] 70-80% vizual sekcija, 20-30% icon sekcija ukupno

### B. SHAPE COMPATIBILITY
- [ ] Svaki sticky ima konzistentan shape mode
- [ ] Proveri svaki par sekcija u sticky-ju prema compatibility matrix u composition-rules.md
- [ ] Nema RED (zabranjenih) parova
- [ ] Ikone su shape-neutral (idu uz bilo šta)

### C. CONTENT DENSITY
- [ ] Svi vizuali unutar hard limits za svoj shape mode (vidi tabelu u composition-rules)
- [ ] Item count balans između sekcija u istom sticky-ju: razlika ≤ 2
- [ ] Tekst po stavci: max 4-5 reči
- [ ] Node label: max 2 kratke reči

### D. DISAMBIGUATION
- [ ] Table vs Split-screen — korišćen prema decision tree u composition-rules
- [ ] Stats vs Bar-chart — korišćen prema decision tree
- [ ] Code-block vs Terminal — code za code, terminal za CLI komande
- [ ] List vs Process-steps — list za nesekvencijalne, steps za sekvencijalne

### E. VARIETY
- [ ] Isti vizual tip max 2× po videu
- [ ] Kinetic max 1 (samo u zadnjem sticky-ju)
- [ ] Susedni sticky-ji NE vode istim vizual tipom
- [ ] Min 4 različita vizual tipa korišćeno u celom videu

### F. DIRECTION
- [ ] Default "right", "below" samo za drill-down
- [ ] Max 1 "below" transition po videu

## Kako popravljaš greške

Kad nađeš grešku:

1. **Previše sekcija (4):** Spoji 2 slične u jednu ili premesti u drugi sticky
2. **Shape konflikt:** Zameni vizual sa shape-kompatibilnim (vidi matrix)
3. **Previše ikona:** Zameni ikone sa odgovarajućim vizualom (list, stats, logo-grid)
4. **Item count disbalans:** Skrati duži vizual ili produlji kraći
5. **Predug tekst:** Skrati na 4-5 reči po stavci
6. **Ponovljen vizual 3×:** Zameni treći sa alternativom
7. **Nema variety (< 4 tipa):** Zameni neke ikone sa vizualima

## Output

Sačuvaj popravljeni visual-structure.json na ISTOJ lokaciji gde si ga pročitao.

Na kraju ispiši:
```
VALIDATION REPORT:
- Greške nađene: X
- Greške popravljene: X
- Preostale: 0
- [lista svake popravke sa objašnjenjem]
```
