# Visual Generator

Cita transcript i PISE kompletnu .tsx Remotion komponentu od nule. Svaki put nova komponenta skrojena za taj konkretan tekst. NE koristi template, NE popunjava katalog — pise ceo fajl.

Komponenta je FULLSCREEN (1920x1080). Zauzima ceo ekran. Animacija prati govor — elementi se pojavljuju, menjaju, transformisu TACNO kad narator prica o njima.

**Trigger:** "generisi vizual", "generate visual", "napravi komponentu za transcript", "visual from scratch"

**Input:**
- Transcript segment (tekst)
- Word-level timestamps iz voiceover-timestamps.json (niz `{ word, start, end }`)
- fps (default 30)
- startFrame — frame od kog počinje ovaj segment u celom videu

**Output:** Nova .tsx datoteka u `videos/{project-name}/src/visuals/Generated_{name}.tsx`

---

## CORE PRINCIP

**Ti si motion designer.** Gledas transcript i pitas se:

> "Koji animirani vizual bi nekom ko NIKAD nije cuo za ovo objasnio koncept? Koji vizuelni METAFOR, koji POKRET, koja TRANSFORMACIJA elementa najbolje prenosi ono sto narator govori?"

Ovo NIJE "izvlacenje podataka u kutije". Ovo je vizuelno OBJASNJAVANJE koncepta.

**Animacija = objasnjenje.** Svaki pokret mora da ZNACI nesto:
- Element se pojavi → narator upravo pominje taj koncept
- Dva elementa se poveze → narator objasnjava kako komuniciraju
- Element se eliminise → narator kaze "to ne radi" ili "to otpada"
- Progress bar se puni → narator prica o kapacitetu/ucitavanju
- Elementi se transformisu → narator opisuje promenu stanja

**Animacija prati govor.** Elementi se NE pojavljuju svi odjednom. Pojavljuju se, menjaju, transformisu u TACNIM trenucima kad narator prica o njima. Vizual je sinhronizovan sa naratorom — kao da narator crta na tabli dok prica.

---

## REDOSLED RAZMISLJANJA (OBAVEZNO pre pisanja koda)

Kad dobis transcript, razmisljaj OVIM REDOM. Ne preskaci korake.

### 1. STA JE SUSTINA? (najbitnije)
- Sta je JEDNA stvar koju gledalac mora da shvati?
- Ne detalji, ne sve — SUSTINA koncepta

### 2. KOJI VIZUELNI METAFOR?
- Kako da tu sustinu vizuelno OBJASNIM?
- Kakav pokret/transformacija prenosi ideju?
- NE "kutije sa labelama" — nego metafor koji OBJASNJAVA
- Da li transcript opisuje konkretan fajl/terminal/browser/UI? → razmisli o **Context Panel** (levo kontekst, desno vizual) — vidi `reference/generation-rules.md` sekcija 8

### 3. LAYOUT — KAKO RASPOREDITI?
- Koji raspored INTUITIVNO pokazuje strukturu?
- Velicina elementa = vaznost. Blizina = povezanost. Prazan prostor = naglasavanje.
- Ako gledalac vidi SAMO obrise bez teksta — da li bi shvatio strukturu?
- 1920x1080 je OGROMAN ekran — koristi prostor sa namerom, ne stiskaj sve u centar

### 4. TIMELINE — KOJIM REDOM SE GRADI?
- Prati naraciju — sta se kad pojavljuje
- Progresivno — pocni od praznog ekrana, gradi dok narator prica
- Max 4-6 aktivnih elemenata u bilo kom trenutku
- Gledalac mora da procita i shvati sve sto vidi za 2 sekunde

### 5. ANIMACIJE — KAKO SE ELEMENTI KRECU?
- Svaki pokret prenosi informaciju — nema dekorativnih animacija
- Profesionalno, glatko — ne bouncy
- Pojava = fade in + slide. Naglasak = glow. Eliminacija = bledi + grayscale.

TEK POSLE ovog razmisljanja — pisi kod.

---

## WORKFLOW

### KORAK 1: Procitaj transcript + timestamps

Procitaj transcript segment i word-level timestamps. Timestamps dolaze iz voiceover-timestamps.json:
```json
{ "words": [{ "word": "Docker", "start": 4.23, "end": 4.55 }, ...] }
```

Ovi timestamps su OBAVEZNI — bez njih ne možeš sinhronizovati animacije sa glasom.

### KORAK 2: Procitaj pravila

OBAVEZNO procitaj pre pisanja koda:
1. **`reference/generation-rules.md`** — layout, animacije, anti-patterns, struktura, dizajn
2. **`.claude/skills/visual-proposer/reference/component-skeleton.md`** — dizajn sistem (boje, fontovi, padding, ikone)
3. **`.claude/skills/remotion-motion/reference/remotion-coding-rules.md`** — Remotion API (useCurrentFrame, interpolate, spring, clamp)

### KORAK 3: Razmisli po REDOSLEDU iznad

Prodji svih 5 koraka razmisljanja (sustina → metafor → layout → timeline → animacije). Napisi kratko sta si odlucio za svaki korak PRE nego sto pises kod.

### KORAK 4: Napisi .tsx komponentu

Pisi CELU komponentu od nule. Svaki element, svaki stil, svaka animacija — sve skrojeno za ovaj transcript.

Komponenta je 1920x1080 fullscreen. Koristi useCurrentFrame() za animacije.

**TIMESTAMP SYNC — OBAVEZNO:**
Svaki element ima startFrame koji se računa iz voiceover timestamps:
```tsx
// Nađi reč u timestamps nizu
const findWord = (word: string) => timestamps.find(w => w.word.toLowerCase().includes(word.toLowerCase()));

// Frame kad narator kaže "FROM"
const FROM_HL = Math.round(findWord("FROM").start * fps);
// Frame kad narator kaže "COPY"  
const COPY_HL = Math.round(findWord("COPY").start * fps);
```

**NIKAD hardkodirati frameove napamet!** Svaki frame MORA doći iz timestamps-a. Element se pojavi TAČNO kad narator izgovori ključnu reč — na milisekundu tačno.

**FRAME CONTRACT:** `useCurrentFrame()` vraća GLOBALNI frame. NE dodavaj OFFSET. Timestamps su apsolutni. Vidi `reference/generation-rules.md` FRAME CONTRACT sekciju.

Ako timestamp niz dolazi kao prop ili se čita iz fajla, definiši ga na vrhu komponente.

**Komponenta MORA pratiti pravila iz `reference/generation-rules.md`.**

### KORAK 5: Sacuvaj fajl

```
videos/{project-name}/src/visuals/Generated_{ImeKoncepta}.tsx
```

### KORAK 6: Prikazi korisniku

Reci sta si napravio:
- Koji vizuelni metafor si izabrao i ZASTO
- Koji elementi i kako se animiraju
- Timeline (kad se sta pojavljuje — mapiran na naraciju)

Reci: "Pokreni `npx remotion studio` da vidis preview. Ako ne valja — reci sta da promenim ili kazi 'regenerisi'."

---

## REFERENCE

- `reference/generation-rules.md` — layout, animacije, dizajn sistem, anti-patterns
- `reference/good-examples/` — 6 DOBRIH komponenti (9+/10). PROČITAJ BAR 2 PRE PISANJA KODA. Ovi fajlovi su standard kvaliteta.
- `.claude/skills/visual-proposer/reference/component-skeleton.md` — dizajn sistem (boje, fontovi, spacing)
- `.claude/skills/remotion-motion/reference/remotion-coding-rules.md` — Remotion API pravila
