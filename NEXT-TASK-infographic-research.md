# TASK: Infographic System Research

## KONTEKST
Pravimo sistem za automatsko generisanje AI/tech explainer videa.
Imamo 1 template: `node-canvas` (flow/architecture diagrams).
Problem: treba nam više infographic tipova + logika za izbor.

## TRENUTNI TEMPLATE
- **node-canvas**: `/remotion-branch-test/src/BranchFlow.tsx`
- Koristi se za: arhitektura, stack, flow, povezane komponente
- Skill: `.claude/skills/remotion-motion/`

---

## TASK 1: Research infographic tipova

### Web Research
Pretraži online:
- "best infographic types for explainer videos"
- "motion graphics infographic styles"
- "data visualization for tech videos"

### YouTube Research
Koristi: `python3 .claude/skills/research/scripts/research.py "query"`
- "infographic animation types"
- "tech explainer video styles"
- "motion graphics templates"

### Output
Za svaki tip koji nađeš, dokumentuj:
- **Ime**: npr. "Timeline", "Comparison", "Process Flow"
- **Svrha**: šta prikazuje (explain, compare, show progress...)
- **Vizualni elementi**: šta sadrži (boxovi, linije, icons...)
- **Primer upotrebe**: kada se koristi u videu

Sačuvaj u: `/Users/dario61/Desktop/YT automation/research/infographic-types.md`

---

## TASK 2: Analiza pravih videa

### Nađi dobre videe
Kanali za istraživanje:
- ByteMonk
- Fireship
- Theo (t3.gg)
- Two Minute Papers
- AI Explained

### Za svaki video
1. Izvuci transcript (koristi transcript.py)
2. Podeli na sekcije po temama
3. Za svaku sekciju označi koji infographic tip bi odgovarao
4. Napravi listu: `[sekcija teksta] → [infographic tip]`

Sačuvaj u: `/Users/dario61/Desktop/YT automation/research/video-analysis.md`

---

## TASK 3: Definiši uslove za izbor

Za svaki infographic tip napiši jasne uslove:

```markdown
## Timeline Infographic
**Svrha:** show-progression
**Koristi kad:**
- Skripta priča o istoriji/evoluciji
- Ima vremenske markere (first, then, 2020, later...)
- Sekvencijalni događaji

**Keywords/triggers:**
- "history of", "evolution", "first... then..."
- "in 2020", "years later", "started as"

**Struktura:**
- Horizontalna ili vertikalna linija
- Tačke/milestone-ovi na liniji
- Datumi/labele

**Broj elemenata:** 3-8 tačaka
```

Sačuvaj u: `/Users/dario61/Desktop/YT automation/research/infographic-conditions.md`

---

## OČEKIVANI REZULTAT

3 MD fajla:
1. `infographic-types.md` - katalog svih tipova
2. `video-analysis.md` - primeri iz pravih videa
3. `infographic-conditions.md` - uslovi za AI izbor

---

## NAPOMENA
- Koristi `/research` skill za web + YT pretragu
- Budi temeljit - ovo je osnova za ceo sistem
- Focus na tipove koji se mogu animirati u Remotion
