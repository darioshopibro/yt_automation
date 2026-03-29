# Plan: AI Video Pipeline v2 — Kling 3.0 + GPT Image + ElevenLabs

## Context

Otkrili smo da Kling 3.0 sa start/end frame može da generiše PROFESIONALNE motion graphics tranzicije koje su na nivou After Effects-a. Testirali smo i radi — element se transformiše, splituje, expanduje sa 3D senkama i perspektivom. Ovo kompletno menja naš pristup — Remotion više NIJE core za animacije.

**Stari plan** (Remotion-based) je ZASTAREO. Ovaj plan je potpuno nov.

---

## ŠTA IMAMO (korisno iz projekta)

| Šta | Gde | Status |
|-----|-----|--------|
| ElevenLabs TTS skill | `.claude/skills/elevenlabs-tts/` | Radi, ostaje |
| ElevenLabs Music skill | `.claude/skills/elevenlabs-music/` | Radi, ostaje |
| Content Pipeline (Telegram bot) | `tools/content-pipeline/` | Radi, ostaje |
| Script Writing prompts | `tools/content-pipeline/prompts/` | Radi, ostaje |
| Branding system | `brands/default/brand.json` | Radi, ostaje |
| Research skill | `.claude/skills/research/` | Radi, ostaje |
| GPT Image knowledge | Research findings iz ove sesije | GPT Image 1.5 je best, $0.04/img |
| SFX research | Research findings | Premium paketi + Freesound MCP + ElevenLabs SFX v2 |
| Kling 3.0 knowledge | Research + testirali | Start/end frame radi, API postoji, multi-shot do 6 scena |

## ŠTA SE BRIŠE (zastarelo)

| Šta | Zašto |
|-----|-------|
| `remotion-planner` skill | Nepotreban — nema Remotion animacija |
| `remotion-visual-router` skill | Nepotreban — nema fiksnih vizuala |
| `visual-proposer` skill | Nepotreban |
| `remotion-builder` skill | Treba potpuno preraditi za novi pipeline |
| `remotion-motion` skill | Nepotreban |
| `remotion-correction` skill | Nepotreban |
| 14 fiksnih vizuala u `templates/ai-video-gen-pipeline/src/visuals/` | Nepotrebno |
| `DynamicPipeline.tsx` (1837 linija) | Nepotrebno |
| `workspace/short-poc/` | Bio Remotion POC, zastareo |
| `workspace/tiktok-test/` | Bio Remotion test, zastareo |
| Hybrid canvas arhitektura | Nepotrebno — Kling radi bolje |

---

## NOVI PIPELINE

```
1. Script/Topic
   ↓
2. GPT Image 1.5 → generiši frame-ove (start/end za svaku scenu)
   ↓
3. Kling 3.0 API (via fal.ai) → za svaki par frame-ova generiši video clip
   ↓
4. ElevenLabs TTS → voiceover
   ↓
5. ElevenLabs Music → background muzika
   ↓
6. SFX → whoosh/impact/transition zvukovi
   ↓
7. FFmpeg → spoji clipove + voiceover + muzika + SFX + captions
   ↓
8. Gotov video (SHORT 45s-2min ili LONG 2-8min)
```

### Detalji po koraku:

**Korak 2 — GPT Image frame generisanje:**
- Za svaku scenu pravimo START frame i END frame
- Style Prompt Template za konzistentnost (iste boje, font, stil kroz ceo video)
- Ilustracije > fotorealizam za explainere
- Grid/whiteboard pozadina sa karticama, ikonama, elementima
- $0.04 po slici, ~20-30 slika po videu = ~$1.20

**Korak 3 — Kling 3.0 animacija:**
- Start frame + End frame → AI generiše smooth 3D tranziciju
- Svaki clip 5-10 sekundi
- Za 2-min video = ~12-24 clipova
- API via fal.ai (najjeftiniji)
- ~$3-6 po videu

**Korak 7 — Spajanje:**
- FFmpeg za concatenation clipova
- Voiceover sync po timestamp-ovima
- Background muzika sa volume ducking
- Word-by-word captions (SRT/ASS format)
- Moguće i CapCut za finalni polish

---

## KLING 3.0 — Šta znamo

### Mogućnosti:
- **Start + End frame** — uploaduješ 2 slike, AI generiše tranziciju
- **Multi-shot** — do 6 scena, do 15s ukupno (ALI ne može sa start/end frame istovremeno)
- **Native audio** — generiše zvuk uz video
- **Video 3.0 model** — najbolji kvalitet, element consistency
- **API** — dostupan via fal.ai, PiAPI, Freepik API, Kie AI

### API pristup:
- **fal.ai** — najjeftiniji, webhook support, Python/Node SDK
- `type: "first_frame"` + `type: "end_frame"` za start/end
- `multi_shot: true` + `multi_prompt` za multi-shot (BEZ start/end frame)

### Ograničenja:
- Multi-shot NIJE kompatibilan sa start/end frame
- Max 15 sekundi po generaciji
- Failed generacije troše kredite
- Tekst na karticama može da se distortuje tokom animacije

### Cene:
| Plan | Krediti | Cena | ~Videa od 2min/mesec |
|------|---------|------|----------------------|
| Free | 66/dan | $0 | ~1 video/2 dana |
| Standard | 660/mes | $6.99/mo | 2-3 videa |
| Pro | 3000/mes | $29.99/mo | ~10 videa |
| API (fal.ai) | Pay per use | ~$0.07-0.15/sec | Neograničeno |

---

## GREG ISENBERG ANALIZA — TREBA ISTRAŽITI

### Šta treba uraditi u sledećoj sesiji:

**1. Analizirati Greg Isenberg-ove TikTok klipove detaljno:**
- Skinuti 5-10 njegovih videa
- Frame-by-frame analiza (kakvi su start/end frame-ovi?)
- Koji elementi se koriste? (kartice, ikone, badge-ovi, grid pozadina)
- Koje tranzicije? (expand, split, morph, fly, rotate)
- Koliko traju tranzicije? (1-2s?)
- Koja je color paleta? (dark green, cream, gold)
- Koji font stil?
- Kakav je grid/pozadina?

**2. Napraviti "prompt playbook" za GPT Image:**
- Prompt template za Greg-style kartice
- Prompt za grid pozadinu
- Prompt za ikone/badge-ove
- Prompt za start frame vs end frame
- Testirati konzistentnost stila

**3. Napraviti "prompt playbook" za Kling:**
- Koji prompt daje best rezultat za card expand?
- Koji prompt za element split?
- Koji prompt za camera pan sa elementima?
- Testirati različite Kling modele (3.0 vs 2.6 vs O1)
- Koliko kredita po tipu animacije?

**4. Testirati ceo pipeline end-to-end:**
- Jedan 30-sec video sa 4-5 scena
- GPT Image → Kling → FFmpeg → gotov video
- Izmeriti vreme i cost

---

## SKILL PLAN

### Novi skill: `video-pipeline` (ili preraditi `remotion-builder`)
Ovaj skill orchestrira ceo pipeline:

```
Input: Script/topic + brand config
Output: Gotov video file

Koraci:
1. Analizira script → identifikuje scene
2. Za svaku scenu generiše start/end frame (GPT Image API)
3. Za svaki par frame-ova generiše clip (Kling API)
4. Generiše voiceover (ElevenLabs TTS)
5. Generiše muziku (ElevenLabs Music)
6. Dodaje SFX
7. Spaja sve (FFmpeg)
8. Dodaje captions
```

### Novi skill: `kling-animator` (ili slično)
Specijalizovan za Kling prompt engineering:
- Zna koje prompte da koristi za koji tip tranzicije
- Zna kako da formatira start/end frame za best rezultat
- Ima reference primere iz Greg Isenberg analize
- Zna ograničenja i workaround-e

### Skillovi koji ostaju:
- `elevenlabs-tts` — voiceover
- `elevenlabs-music` — background muzika
- `research` — istraživanje
- `content-strategy` — planiranje sadržaja
- `branding` — brand config
- `deep-research` — duboko istraživanje
- `tiktok-research` — TikTok analiza
- `tiktok-captions` — caption writing

### Skillovi za brisanje:
- `remotion-planner`
- `remotion-builder` (preraditi u `video-pipeline`)
- `remotion-motion`
- `remotion-correction`
- `remotion-visual-router`
- `visual-proposer`
- `remotion-best-practices` (možda zadržati za reference, ali nije core)

---

## COST PO VIDEU (updated)

| Stavka | SHORT (45s-2min) | LONG (2-8min) |
|--------|-----------------|---------------|
| GPT Image frame-ovi | ~$0.80 (20 slika) | ~$2.00 (50 slika) |
| Kling 3.0 clips (fal.ai) | ~$3.00 (8 clips) | ~$12.00 (30 clips) |
| ElevenLabs TTS | ~$0.10 | ~$0.50 |
| ElevenLabs Music | ~$0.05 | ~$0.10 |
| SFX | ~$0.05 | ~$0.10 |
| **UKUPNO** | **~$4.00** | **~$15.00** |

---

## SLEDEĆA SESIJA — TODO

1. **Skinuti i analizirati 5-10 Greg Isenberg TikTok videa** — frame by frame, identifikovati pattern-e, tranzicije, elemente
2. **Gemini analiza** — dati Gemini-ju klipove da opiše svaki frame i tranziciju detaljno
3. **Napraviti GPT Image prompt playbook** — testirati generisanje frame-ova u Greg stilu
4. **Napraviti Kling prompt playbook** — testirati koje prompte daju best tranzicije
5. **End-to-end test** — jedan kratak video (30s) sa celim pipeline-om
6. **API setup** — fal.ai account, testirati Kling API programmatski
7. **Definisati skill strukturu** — `video-pipeline` i `kling-animator` skillove
8. **Odlučiti o Remotion** — da li ga zadržavamo za nešto (captions overlay?) ili potpuno izbacujemo

---

## OTVORENA PITANJA

1. **Remotion** — da li ga zadržavamo za caption overlay ili potpuno izbacujemo? FFmpeg može da doda SRT captions, CapCut isto.
2. **Konzistentnost** — da li GPT Image može da održi ISTI stil kroz 20-50 slika? Treba testirati.
3. **Tekst distorzija** — Kling ponekad distortuje tekst tokom animacije. Workaround?
4. **Dužina** — za LONG (8min) treba ~30 clipova. Koliko dugo traje generisanje? Može li se paralelizovati?
5. **Editor** — kako korisnik edituje/iterira? Per-clip regeneracija?
6. **Captions** — koji tool za word-by-word captions? FFmpeg ASS, CapCut, ili nešto treće?
