# ElevenLabs Voice Optimization - Complete Research

Comprehensive research za poboljšanje AI voiceover kvaliteta. Obuhvata sve od text preprocessing-a do voice settings-a.

---

## TL;DR - BRZA REŠENJA

### Odmah implementiraj:
1. **Stability:** 45-50% (ne default 50%)
2. **Similarity:** 70-75%
3. **Style Exaggeration:** 0 (UVEK)
4. **Model:** `eleven_multilingual_v2` za tech content
5. **Generiši u chunks-ovima** (ne ceo script odjednom)

### Za tehničke termine:
- `API` → `A P I` (sa razmacima)
- `SQL` → `sequel` ili `S Q L`
- `nginx` → `engine X`
- `Kubernetes` → `koo-ber-net-eez`

---

## 1. VOICE SETTINGS - OPTIMALNI PARAMETRI

### Stability (40-50%)
**Šta radi:** Kontroliše konzistentnost između regeneracija
- **Niže (30-45%)** = Više emocija, ekspresivnije
- **Više (55-70%)** = Konzistentnije ali monotono

**Preporuka za tech content:** `45-50%`

### Similarity (70-80%)
**Šta radi:** Koliko blisko prati originalni glas
- **Više** = Bliže originalu, ali može reprodukovati artifacts
- **Niže** = Manje slično, ali čistije

**Preporuka:** `70-75%`

### Style Exaggeration (KEEP AT 0!)
**Šta radi:** Pojačava stilske karakteristike glasa
- Uzrokuje nestabilnost, mispronunciations, čudne zvukove
- ElevenLabs zvanično preporučuje: **DRŽI NA 0**

### Speaker Boost (ON)
- Suptilno poboljšanje
- Malo usporava generisanje
- **Preporuka:** Ostavi uključeno

### Model Izbor

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `eleven_multilingual_v2` | Medium | **BEST** | Tech content, names, foreign words |
| `eleven_turbo_v2_5` | Fast | Good | Quick iterations |
| `eleven_flash_v2` | Fastest | OK | Testing, SSML support |
| `eleven_v3` (Alpha) | Medium | Excellent | Expressive content (uses audio tags) |

**Za nas:** Koristi `eleven_multilingual_v2` - najbolje hendla tehničke termine.

---

## 2. TEXT PREPROCESSING - PRIPREMA TEKSTA

### A) Punctuation = Pacing

| Punctuation | Effect |
|-------------|--------|
| `.` (period) | Full stop, pause |
| `,` (comma) | Short pause, breath |
| `...` (ellipsis) | Longer pause, hesitation |
| `!` | Emphasis, excitement |
| `?` | Rising intonation |
| `!?` | Strong rhetorical emphasis |
| `—` (em-dash) | Dramatic pause |

### B) CAPS = Emphasis

```
❌ "Finally after wasting 6 months on research I discovered the secret"
✅ "FINALLY! After wasting 6 months on research... I discovered the SECRET."
```

### C) Break Tags za Precise Pauses

```xml
<break time="500ms"/>
<break time="1.5s"/>
```

⚠️ Samo za starije modele (flash, turbo v2). Max 3 sekunde.

### D) Sentence Length
- **Optimalno:** 15-25 reči po rečenici
- **Kraće rečenice** = Bolji engagement
- **Izbegavaj** run-on sentences

---

## 3. TEHNIČKI TERMINI - PRONUNCIATION FIXES

### Acronyms → Razmaci

| Term | Problem | Fix |
|------|---------|-----|
| API | "a-pee-eye" blended | `A P I` |
| SQL | "squeal" | `sequel` ili `S Q L` |
| GUI | varies | `G U I` |
| CLI | "clee" | `C L I` |
| RAG | "rag" | `R A G` (for acronym) |
| LLM | mixed | `L L M` |
| GPT | "g-pt" | `G P T` |
| JSON | "jay-son" | `jason` |
| YAML | varies | `yammel` |
| JWT | mixed | `J W T` ili `jot` |
| HTML | mixed | `H T M L` |
| CSS | mixed | `C S S` |

### Framework Names → Phonetic

| Term | Problem | Fix |
|------|---------|-----|
| Kubernetes | "ku-ber-nets" | `koo-ber-net-eez` |
| kubectl | varies | `kube control` |
| PostgreSQL | "post-gress-ql" | `post-gres` |
| nginx | "n-jinx" | `engine X` |
| MongoDB | "mon-go-db" | `mongo D B` |
| Node.js | "node-js" | `node J S` |
| GraphQL | "graph-ql" | `graph Q L` |
| WebSocket | mixed | `web socket` |
| Supabase | "supa-base" | `soopa base` |

### Technical Concepts

| Term | Problem | Fix |
|------|---------|-----|
| regex | "ree-gex" | `rej ex` |
| daemon | "day-mon" | `dee-mon` |
| cache | "catch" | `cash` |
| queue | mixed | `cue` |
| async | varies | Usually OK |

### Numbers & Versions

| Format | Problem | Fix |
|--------|---------|-----|
| v2.5 | messy | `version 2 point 5` |
| $50k | "fifty-k" | `fifty thousand dollars` |
| 10x | "ten-x" | `ten times` |
| 1,000,000 | mixed | `one million` |

---

## 4. SSML PHONEME TAGS (Stariji Modeli)

Za `eleven_flash_v2` i `eleven_turbo_v2` SAMO.

### Format
```xml
<phoneme alphabet="cmu-arpabet" ph="D EY1 T AH0">data</phoneme>
```

### CMU ARPABET Reference
Website: http://www.speech.cs.cmu.edu/cgi-bin/cmudict

### Stress Markers
- `1` = primary stress
- `0` = no stress

**Napomena:** Noviji modeli (multilingual v2) koriste phonetic spelling umesto SSML.

---

## 5. V3 MODEL - AUDIO TAGS

Za `eleven_v3` (Alpha) model.

### Syntax
```
[laugh] I love that idea!
[sigh] I just can't believe it.
[whisper] Don't tell anyone...
[excited] This is amazing!
[sad] I never thought this would happen.
[angry] How could you do this?
```

### Stability Settings za V3
- **Creative:** Više emocija, prone to hallucinations
- **Natural:** Balanced (preporučeno sa audio tags)
- **Robust:** Stabilno ali manje responsive

### V3 Best Practices
- Koristi voices iz "Best voices for V3" kategorije
- Prompt length matters - 250+ karaktera radi bolje
- Match tags with voice style

---

## 6. ISAAC'S METHOD - Pro Workflow

Najpopularnija tehnika (348K views tutorial):

1. **Generiši u malim batch-evima** (1-3 rečenice)
2. **Downloaduj multiple takes** (2-3 regeneracije)
3. **Mix and match** najbolje delove
4. **Cut and combine** u editing software-u

**Zašto radi:** Svaka generacija ima malo drugačiji ton. Kombinovanje uklanja "AI pattern" koji zvuči uncanny.

---

## 7. EMOTION TRICKS

### Write Like a Book
```
❌ "That is funny"
✅ "That is funny," he said with a laugh.
```

Posle generisanja, iseci "he said with a laugh" deo.

### Descriptive Context
```
❌ "Stop," he whispered.
✅ "In a room so quiet you could hear a pin drop, he softly whispered, 'Stop.'"
```

---

## 8. PRONUNCIATION DICTIONARY (ElevenLabs Feature)

### Kako koristiti:
1. Dashboard → Pronunciation Dictionaries
2. Add Dictionary
3. Add rules:
   - **Alias:** `USA` → `United States of America`
   - **CMU Phoneme:** `wound` → `W UW1 N D`

### Limitations:
- Case-sensitive
- CMU phonemes samo za English modele

---

## 9. TROUBLESHOOTING CHECKLIST

Pre nego što komplikuješ:

- [ ] Regenerisao 2-3 puta?
- [ ] Probao drugi model?
- [ ] Acronyme napisao sa razmacima?
- [ ] Phonetic spelling za problematične reči?
- [ ] Punctuation za pauze?
- [ ] Stability 40-50%?
- [ ] Style exaggeration na 0?

---

## 10. IMPLEMENTATION PLAN

### Šta treba promeniti u našem sistemu:

#### A) Text Preprocessor Agent (NOVO)
Pre slanja teksta ElevenLabs-u:
1. Detektuj acronyme → zameni sa razmakom
2. Detektuj tehničke termine → phonetic spelling
3. Proveri sentence length
4. Dodaj punctuation hints

#### B) Voice Settings Update
```tsx
const voiceSettings = {
  stability: 0.45,        // Smanjeno sa 0.5
  similarity_boost: 0.70, // Smanjeno sa 0.75
  style: 0.0,             // Ostaje 0
  use_speaker_boost: true
};

const model = "eleven_multilingual_v2"; // Promenjeno sa turbo_v2_5
```

#### C) Generation Strategy
- Generiši po sekcijama (ne ceo script)
- Regeneriši problematične delove
- Combine best takes

---

## 11. TECH TERM DICTIONARY (Za naš projekat)

```json
{
  "replacements": {
    "API": "A P I",
    "APIs": "A P I s",
    "SQL": "sequel",
    "GUI": "G U I",
    "CLI": "C L I",
    "RAG": "R A G",
    "LLM": "L L M",
    "GPT": "G P T",
    "JWT": "J W T",
    "JSON": "jason",
    "YAML": "yammel",
    "HTML": "H T M L",
    "CSS": "C S S",
    "URL": "U R L",
    "HTTP": "H T T P",
    "nginx": "engine X",
    "Kubernetes": "koo-ber-net-eez",
    "kubectl": "kube control",
    "PostgreSQL": "post-gres",
    "MongoDB": "mongo D B",
    "Node.js": "node J S",
    "GraphQL": "graph Q L",
    "WebSocket": "web socket",
    "Supabase": "soopa base",
    "regex": "rej ex",
    "daemon": "dee-mon",
    "cache": "cash",
    "async": "a-sink",
    "OAuth": "oh-auth",
    "OAuth2": "oh auth two",
    "i18n": "I eighteen N",
    "k8s": "K eights",
    "n8n": "N eight N"
  }
}
```

---

## 12. NEXT STEPS

1. **Napravi text preprocessor** koji automatski:
   - Zamenjuje termine iz dictionary-ja
   - Dodaje punctuation hints
   - Validira sentence length

2. **Update remotion-planner skill** da koristi preprocessor

3. **Promeni default voice settings**

4. **Testiraj na jednom od postojećih transkripata**

---

## SOURCES

### YouTube Tutorials:
- Official ElevenLabs Tutorial (81K views, 2025)
- Isaac - "How I Actually Make AI Voice Sound Real" (348K views)
- 4tuneGuide - "ElevenLabs Best Voice Settings" (58K views)
- Dan Kieft - "Master ElevenLabs in 23 mins" (335K views)
- Alec Wilcock - "Full Guide to ElevenLabs" (486K views)
- Greg Preece - "4 ElevenLabs Tips in 3 Minutes" (111K views)
- Excelerator - "Better Sounding AI Voice Output" (37K views)

### Documentation:
- CMU Pronouncing Dictionary
- ElevenLabs Official Docs
