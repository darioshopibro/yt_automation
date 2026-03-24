# Text Cleaning Rules za TTS

Pre slanja teksta u ElevenLabs, AI MORA da očisti tekst.

---

## 1. FILLER WORDS (uvek ukloni)

```
um, uh, ah, basically, literally, actually, honestly,
you know, I mean, kind of, sort of
```

**Primer:**
```
❌ "So basically, you know, we just need to understand this"
✅ "We need to understand this"
```

---

## 2. "AND THEN" REPETITION (variraj)

```
❌ "And then we do X. And then we do Y. And then we do Z."
✅ "First, we do X. Then we do Y. Finally, we do Z."
```

**Transition opcije:**
- First / Then / After that / Next / Finally
- Additionally / Furthermore / Moreover
- Therefore / As a result / Consequently

---

## 3. CONTRACTIONS (zvuči prirodnije)

```
"It is" → "It's"
"Do not" → "Don't"
"We will" → "We'll"
"You are" → "You're"
"Cannot" → "Can't"
```

---

## 4. PASSIVE → ACTIVE (ako 100% siguran)

**Primeni SAMO ako ne menja značenje:**
```
❌ "The data is processed by the server"
✅ "The server processes the data"
```

**NE MENJAJ ako je passive namerno** (emphasis na objektu):
```
✓ "The API was deprecated in 2024" (OK - focus na API)
```

---

## 5. SENTENCE LENGTH (razmisli)

**Ako rečenica ima 20+ reči - razmisli da li treba split:**
```
❌ "The algorithm processes the input data using machine learning techniques and then sends the results to the database for storage"

✅ "The algorithm processes input data using machine learning. It then sends results to the database for storage."
```

**NE splittuj ako pokvari flow.**

---

## WORKFLOW

1. Pročitaj transcript
2. Primeni pravila 1-3 (UVEK)
3. Razmisli o 4-5 (samo ako 100% siguran)
4. Output čist tekst
