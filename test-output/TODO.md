# TODO: Remotion Planner Testing & Improvement

## CILJ
Testirati skill na 20 transkripata i na osnovu rezultata:
1. Poboljšati skill da koristi RAZNOVRSNE layoute
2. Dodati da skill ODBIJE transcript ako nije pogodan za ovaj vizual
3. Napraviti MD guide "kada koristiti ovaj vizual"

---

## FAZA 1: TESTIRANJE (20 transkripata)

### Workflow:
1. [ ] Otvori NOVI chat (čist kontekst)
2. [ ] Copy prompt + transcript iz `test-transcripts.md`
3. [ ] Sačekaj da završi (voiceover + plan + build)
4. [ ] Pogledaj preview na localhost
5. [ ] Oceni u `test-results.md`:
   - **FIT SCORE** - da li tekst odgovara vizualu
   - Struktura, Layouti, Ikone, Timing
6. [ ] Zapiši probleme i šta je dobro
7. [ ] Ponovi za sve 20

### Testovi:
- [ ] Test 1: CI/CD Problem + Solution
- [ ] Test 2: Kubernetes Orchestra + Scaling
- [ ] Test 3: ML Two Jobs + Data
- [ ] Test 4: RAG Flow Simple
- [ ] Test 5: Monolith vs Microservices
- [ ] Test 6: GitHub Actions Pipeline
- [ ] Test 7: K8s Cluster Architecture
- [ ] Test 8: ML Training vs Testing
- [ ] Test 9: Microservices Communication
- [ ] Test 10: CI/CD Benefits
- [ ] Test 11: Message vs Event Driven
- [ ] Test 12: Pub/Sub Architecture
- [ ] Test 13: ETL Pipeline
- [ ] Test 14: Batch vs Stream
- [ ] Test 15: RAG Problem Statement
- [ ] Test 16: RAG Three Steps
- [ ] Test 17: Username Check Data Structures
- [ ] Test 18: Bloom Filters
- [ ] Test 19: Event-Driven Advantages
- [ ] Test 20: Eventual Consistency

---

## FAZA 2: ANALIZA REZULTATA

### Pitanja za analizu:
- [ ] Koliko testova ima FIT SCORE 8+?
- [ ] Koliko testova ima samo flow layout?
- [ ] Koji layout-i se NIKAD ne koriste?
- [ ] Koje ikonice fale?
- [ ] Koji tip teksta radi najbolje?
- [ ] Koji tip teksta radi najlošije?

### Output:
- [ ] Lista najčešćih problema
- [ ] Lista šta radi dobro
- [ ] Karakteristike "dobrog" transcripta
- [ ] Karakteristike "lošeg" transcripta

---

## FAZA 3: POBOLJŠANJE SKILL-a

### 3.1 Layout Diversity Rule
**Problem:** AI koristi samo "flow" layout
**Rešenje:** Dodati u SKILL.md pravilo:

```markdown
## LAYOUT DIVERSITY RULE

CILJ: Što RAZNOVRSNIJE layoute, NE samo flow!

Pre kreiranja strukture, analiziraj tekst:
1. Ima li POREĐENJA? → vs layout
2. Ima li PROBLEM→REŠENJE? → negation layout
3. Ima li KOMBINACIJE? → combine layout
4. Ima li ODLUKE/BRANCH? → if-else layout
5. Ima li SPAJANJA? → merge layout

AKO transcript ima samo sekvence (A→B→C) bez drugih odnosa:
→ UPOZORI: "Ovaj tekst možda nije idealan za sticky note vizual"

MINIMALNI CILJ: Bar 2 različita layout tipa u videu!
```

### 3.2 Transcript Fit Check
**Problem:** AI ne odbija loše transkripte
**Rešenje:** Dodati pre-check:

```markdown
## TRANSCRIPT FIT CHECK (pre planiranja!)

Analiziraj transcript i oceni FIT SCORE:

**VISOK FIT (8-10):**
- Ima poređenja (A vs B)
- Ima problem→rešenje
- Ima odluke/branch
- Ima kombinacije

**SREDNJI FIT (5-7):**
- Ima korake/sekvence
- Ima bar 1 poređenje ili negaciju

**NIZAK FIT (1-4):**
- Čisto narativno
- Samo sekvence (flow, flow, flow)
- Nema vizualne odnose

AKO FIT < 5:
→ RECI KORISNIKU: "Ovaj transcript nije idealan za sticky note
   vizual. Preporučujem drugačiji format ili kraći segment."
```

### 3.3 Novi Layout-i (možda dodati?)
Razmisliti da li trebaju dodatne komponente:
- [ ] `list` - za nabrajanja (1, 2, 3...)
- [ ] `highlight` - za ključne pojmove
- [ ] `timeline` - za vremenske sekvence
- [ ] `stack` - za vertikalne liste

---

## FAZA 4: FINALNI OUTPUT

### Fajlovi za kreirati:
- [ ] **visual-fit-guide.md** - kada koristiti ovaj vizual
- [ ] **transcript-requirements.md** - šta transcript mora imati
- [ ] Update **SKILL.md** sa novim pravilima

### Visual Fit Guide struktura:
```markdown
# Kada koristiti Sticky Note vizual

## IDEALNO ZA:
- Poređenja (X vs Y)
- Problem → Rešenje
- Procesi sa odlukama
- Kombinacije elemenata

## NIJE IDEALNO ZA:
- Čisto narativno objašnjenje
- Samo koraci bez odnosa
- Previše teksta (>3min)
- Premalo teksta (<30sec)

## INDIKATORI DOBROG FITA:
- Tekst ima reči: "vs", "compared to", "unlike", "but", "however"
- Tekst ima reči: "the problem is", "the solution is", "instead"
- Tekst ima reči: "combines", "together with", "plus"
- Tekst ima reči: "either...or", "if...then", "when...otherwise"

## INDIKATORI LOŠEG FITA:
- Tekst je samo priča bez strukture
- Tekst nema jasne odnose između koncepata
- Tekst je previše apstraktan
```

---

## NAPOMENE

- Svi fajlovi su u `/test-output/` folderu
- Rezultate upisivati u `test-results.md`
- Transkripti su u `test-transcripts.md`
- Kad završiš testiranje, vrati se u OVAJ chat za analizu
