# Session Log: Visual Generator Skill

**Datum:** 2026-03-31
**Status:** Skill napravljen i testiran, ceka integraciju u pipeline

---

## STA SMO URADILI

### 1. Napravili Visual Generator skill

Skill koji cita transcript i PISE kompletnu .tsx Remotion komponentu od nule. Svaki put nova komponenta skrojena za taj tekst. NE template, NE katalog.

**Lokacija:** `.claude/skills/visual-generator/`
```
SKILL.md                          — workflow + redosled razmisljanja
reference/
  generation-rules.md             — SVA pravila (layout, animacije, dizajn, anti-patterns)
  test-prompts.md                 — 27 test promptova (medium → very hard)
```

### 2. Iterirali pravila kroz 20+ testova

**Pocetni pristup (4/10):** Mehanicki — izvuci entitete, stavi u kutije, povezi linijama.

**Finalni pristup (8.1/10):** Motion designer mindset sa 5 koraka razmisljanja.

#### Pravila koja smo dodali kroz iteracije:

| Iteracija | Pravilo | Zasto |
|-----------|---------|-------|
| 1 | Motion designer princip | Prestao da pravi "kutije sa podacima", poceo da razmislja o vizuelnom objasnjenju |
| 2 | Redosled razmisljanja (sustina → metafor → layout → timeline → animacije) | Forsira da razmisli PRE nego sto kuca kod |
| 3 | Progresivno gradjenje | Prestao da stavlja sve na ekran odjednom |
| 4 | Vise scena sa crossfade | Kompleksan transcript se deli na 2-3 scene umesto jednog ekrana |
| 5 | Animiraj koncept, ne crtaj dijagram | Umesto box "Play Button" — animira sam klik |
| 6 | SVG linije ZABRANJENE za konekcije/tree/strelice | SVG linije uvek broken layout |
| 7 | Layout shift fix — opacity: 0 umesto display:none | Elementi ne skacu kad nestaju |
| 8 | Profesionalne animacije (damping 20+) | Ne bouncy kao igrica |
| 9 | Max 4-6 aktivnih elemenata | Gledalac mora da procita sve za 2 sekunde |
| 10 | Vizuelna hijerarhija velicina | Bitniji = VECI (TODO — jos nije dodato u rules) |

### 3. Testirali na 20 komponenti

**Top rezultati (9+):**
- RaceConditions — 3 faze, counter menja boju, paralelni trakovi
- NetflixPlayClick — play dugme animacija, progress barovi, converging dots
- TokenBucketRateLimiting — liquid fill bucket metafora
- GoogleSearchRanking — levak → signal barovi → CTR decay

**Najslabiji:**
- MicroservicesArch (5) — star, pre pravila, PowerPoint dijagram
- V8EnginePipeline (6) — SVG tree (pre SVG zabrane)
- WhatsAppMessageFlow (6.5) — layout broken

---

## STA TREBA SLEDECE (za novu sesiju)

### INTEGRACIJA U PIPELINE (najbitnije)

1. **Gde Visual Generator staje u flow:**
   - Visual Router odlucuje: canvas mode (sticky-ji) ILI full screen mode (generated komponenta)
   - Planner koordinira timing sa voiceoverom
   - Builder ucitava generisanu komponentu

2. **Logika full screen vs canvas:**
   - Kad koristiti full screen? (konceptualna objasnjenja, procesi, poredjenja)
   - Kad koristiti canvas? (tutoriali, step-by-step, liste)
   - Moze li se mesati? (canvas za neke delove, full screen za druge)
   - Tranzicija izmedju canvas i full screen

3. **Voiceover sync:**
   - Sad su frameovi hardkodirani napamet
   - Treba mapirati na ElevenLabs word timestamps
   - Element se pojavi TACNO kad narator izgovori rec

### POBOLJSANJA SKILL-A

4. **Vizuelna hijerarhija** — bitniji element = VECI (dodati u rules)
5. **Context panel layout** — leva strana kontekst (fajl/terminal/kod sa placeholder linijama), desna strana vizual objasnjenje. Highlight na levoj dok narator prica.
6. **Re-generate dugme u editoru** (port 3002)

### NOVI SISTEMI

7. **Asset Sourcing** — AI trazi slike/screenshotove/video za kontekst
8. **Research Validation** — metrike (Google Trends, search volume, YT channel stats) za potvrdu tema

---

## FAJLOVI NAPRAVLJENI

### Novi (SACUVATI)
- `.claude/skills/visual-generator/SKILL.md`
- `.claude/skills/visual-generator/reference/generation-rules.md`
- `.claude/skills/visual-generator/reference/test-prompts.md`

### Generisane komponente (TEST — mogu se obrisati)
- `templates/ai-video-gen-pipeline/src/visuals/Generated_*.tsx` (20 fajlova)
- Ovo su test komponente, ne idu u produkciju

---

## KLJUCNI ZAKLJUCCI

1. **Princip > Template** — skill sa principom (motion designer) radi bolje od skill-a sa template-om
2. **Zabrane su bitnije od dozvola** — "NIKAD SVG linije" je vazniji od "koristi bilo sta"
3. **Iteracija radi** — od 4/10 do 8.1/10 kroz 10 iteracija pravila
4. **Progresivno gradjenje** je bio najveci skok u kvalitetu
5. **Vise scena** resava problem "previse na jednom ekranu"
6. **Animiraj koncept** umesto "crtaj dijagram koncepta" — 10x bolje
