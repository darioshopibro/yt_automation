# NEXT TASK 2: Skill Validation Test

## CILJ

Testirati `remotion-motion` skill sa PRAVIM YouTube transkriptima.
Napraviti 4-6 test projekata koji pokrivaju oba template tipa.

---

## WORKFLOW

### 1. RESEARCH - Nađi pogodne tekstove

**Koristi research skill:**
```bash
python3 .claude/skills/research/scripts/research.py "tech explainer short clips architecture"
python3 .claude/skills/research/scripts/research.py "how X works explained tutorial"
```

**Traži tekstove koji su:**
- 30-120 reči (kratki segmenti, ne ceo video)
- Objašnjavaju sistem/proces/arhitekturu
- Imaju strukturu (koraci ILI komponente)

**PRAVILO:** Tekst iz YT transkripta = IDENTIČAN u projektu! Ne menjaj ništa.

---

### 2. KATEGORIZUJ tekstove

Za svaki pronađeni tekst, odluči:

```
┌─────────────────────────────────────────┐
│            ANALIZIRAJ TEKST             │
└─────────────────────────────────────────┘
                    │
      ┌─────────────┴─────────────┐
      ▼                           ▼
┌───────────┐               ┌───────────┐
│   FLAT    │               │   STICKY  │
│ (2-layer) │               │ (3-layer) │
└───────────┘               └───────────┘
      │                           │
Tech stack                  Procesi
Feature lista               Tutorial
Komponente                  Step-by-step
< 100 reči                  > 100 reči
```

---

### 3. SPAWN SUB-AGENTE

Pokreni paralelno više sub-agenata, svaki pravi svoj projekat:

**FLAT projekti (2-3):**
- Port 3010, 3011, 3012
- Template: `remotion-nvidia-test`
- Kraći tekstovi, tech stack, feature lista

**STICKY projekti (2-3):**
- Port 3020, 3021, 3022
- Template: `rag-pipeline-test`
- Duži tekstovi sa koracima/fazama

---

### 4. TEST CHECKLIST

Za svaki projekat proveri:

- [ ] Tekst je IDENTIČAN originalnom YT transkriptu
- [ ] Voiceover generisan sa timestamps
- [ ] Animacija sinhronizovana sa audio
- [ ] Nodovi se pojavljuju kad se pominju
- [ ] Camera transitions smooth
- [ ] Zvukovi na pravim mestima (max 10)
- [ ] centerVertically radi za single-row (ako sticky)
- [ ] Linije prate boxove

---

## OUTPUT STRUCTURE

```
/Users/dario61/Desktop/YT automation/
├── test-flat-1/          # Port 3010
│   ├── src/
│   ├── public/voiceover.mp3
│   └── TRANSCRIPT.md     # Original YT tekst
├── test-flat-2/          # Port 3011
├── test-sticky-1/        # Port 3020
├── test-sticky-2/        # Port 3021
└── TEST-RESULTS.md       # Summary svih testova
```

---

## PRIMER TEKSTOVA ZA TRAŽENJE

### FLAT kandidati:
- "This is our tech stack: React for frontend, Node for backend, Postgres for database"
- "The system has three main components: API gateway, processing service, storage layer"
- "Here's what makes this architecture work: caching, load balancing, CDN"

### STICKY kandidati:
- "Step one, you authenticate. Step two, you authorize. Step three, you access."
- "First the request comes in. Then it gets validated. Finally it's processed."
- "In phase one we collect data. Phase two is analysis. Phase three is reporting."

---

## KOMANDE ZA POKRETANJE

```bash
# Research
python3 .claude/skills/research/scripts/research.py "how authentication works explained"

# Get transcript
python3 .claude/skills/research/scripts/transcript.py "VIDEO_URL"

# Create project (flat)
cp -r remotion-nvidia-test test-flat-1
cd test-flat-1 && npm run dev -- --port 3010

# Create project (sticky)
cp -r rag-pipeline-test test-sticky-1
cd test-sticky-1 && npm run dev -- --port 3020
```

---

## VALIDATION CRITERIA

| Kriterijum | Pass | Fail |
|------------|------|------|
| Tekst identičan | 100% match | Bilo koja izmena |
| Audio sync | < 5 frame offset | > 10 frame offset |
| Visual quality | Smooth animations | Jerky/broken |
| Sound count | <= 10 | > 10 |
| centerVertically | Radi za 1-row | Broken |

---

## NOTES

- NE MENJAJ TEKST iz transkripta
- Koristi tačne timestamps iz ElevenLabs
- Svaki projekat = samostalan test
- Dokumentuj svaki problem u TEST-RESULTS.md
