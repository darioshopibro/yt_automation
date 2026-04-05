# Visual Generator

Cita transcript i PISE kompletnu .tsx Remotion komponentu od nule. Svaki put nova komponenta skrojena za taj konkretan tekst. NE koristi template, NE popunjava katalog — pise ceo fajl.

Komponenta je FULLSCREEN (1920x1080). Zauzima ceo ekran. Animacija prati govor — elementi se pojavljuju, menjaju, transformisu TACNO kad narator prica o njima.

**Trigger:** "generisi vizual", "generate visual", "napravi komponentu za transcript", "visual from scratch"

**Input:**
- Transcript segment (tekst)
- Word-level timestamps iz voiceover-timestamps.json (niz `{ word, start, end }`)
- fps (default 30)
- startFrame — frame od kog počinje ovaj segment u celom videu

**Output:**
1. Nova .tsx datoteka u `videos/{project-name}/src/visuals/Generated_{name}.tsx`
2. Sound hints JSON u `workspace/{project-name}/sound_hints_X.json` — opisuje šta se vizuelno dešava na kom frame-u

**Sound hints — OBAVEZNO.** Za SVAKU vizuelnu promenu (element pojava, scene change, reveal, text pop-in) zapiši hint u JSON. Ti NE biraš zvukove — samo opisuješ šta se dešava vizuelno. Sound Coordinator (poseban korak posle tebe) će odlučiti koji zvuk ide gde.

**sound_hints_X.json format:**
```json
{
  "segment": "How Docker Works",
  "segmentIndex": 2,
  "startFrame": 150,
  "endFrame": 900,
  "frameMode": "global",
  "events": [
    { "frame": 150, "type": "scene_start", "description": "segment opens, title text fades in" },
    { "frame": 200, "type": "element_appear", "description": "Docker logo slides in from left" },
    { "frame": 350, "type": "element_appear", "description": "3 container boxes pop in staggered" },
    { "frame": 500, "type": "reveal", "description": "big stat number ' 60%' scales up — key info" },
    { "frame": 700, "type": "transition", "description": "scene crossfades to comparison view" },
    { "frame": 850, "type": "element_disappear", "description": "elements fade out, segment ending" }
  ]
}
```

**Event types:**
- `scene_start` — početak segmenta, prvi elementi se pojavljuju
- `element_appear` — nov element se pojavljuje (slide-in, fade-in, pop)
- `reveal` — BITAN momenat — ključna informacija, šokantan podatak, veliki broj
- `transition` — promena scene unutar segmenta
- `element_disappear` — elementi nestaju (fade-out, slide-out)
- `staggered_group` — više elemenata u nizu (npr. 5 ikona redom) — zapiši JEDNOM, ne za svaki

**Pravila:**
- `frame` je UVEK GLOBALNI frame (apsolutni od početka videa)
- `frameMode` je UVEK `"global"`
- `description` mora opisati ŠTA se vizuelno dešava, ne šta narator kaže
- Zapiši SVE vizuelne promene — bolje previše hints nego premalo
- NE biraj zvukove, NE piši volume, NE referenciraj .mp3 fajlove

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

**🔊 SOUND KOMENTARI — OBAVEZNO:**
Na SVAKI `interpolate()` ili `spring()` koji pokreće vizuelnu promenu, dodaj komentar:

```tsx
// 🔊 SOUND: element_appear @ frame 200 — arrow draws from domain to IP
const arrowProgress = interpolate(frame, [200, 230], [0, 1], { extrapolateRight: 'clamp' });

// 🔊 SOUND: reveal @ frame 350 — IP address pops in big
const ipScale = interpolate(frame, [350, 365], [0, 1], { extrapolateRight: 'clamp' });

// 🔊 SOUND: transition @ frame 500 — scene wipes to resolver diagram
const sceneOpacity = interpolate(frame, [500, 515], [0, 1], { extrapolateRight: 'clamp' });
```

**Format:** `// 🔊 SOUND: {event_type} @ frame {N} — {šta se vizuelno dešava}`

Sound Coordinator čita ove komentare iz .tsx fajlova kao backup za sound_hints JSON. Ovo osigurava da SVAKA animacija ima zvuk — ne može da se promaši.

### KORAK 5: Sacuvaj fajlove

**DVA fajla OBAVEZNO:**
1. `.tsx` komponenta:
```
videos/{project-name}/src/visuals/Generated_{ImeKoncepta}.tsx
```

2. Sound hints JSON:
```
workspace/{project-name}/sound_hints_{segmentIndex}.json
```

**Ako ne napišeš sound_hints JSON → Sound Coordinator nema šta da čita → TIŠINA u tom segmentu.**

### KORAK 6: Prikazi korisniku

Reci sta si napravio:
- Koji vizuelni metafor si izabrao i ZASTO
- Koji elementi i kako se animiraju
- Timeline (kad se sta pojavljuje — mapiran na naraciju)
- Koliko sound hints events si zapisao

Reci: "Pokreni `npx remotion studio` da vidis preview. Ako ne valja — reci sta da promenim ili kazi 'regenerisi'."

---

## REFERENCE

- `reference/generation-rules.md` — layout, animacije, dizajn sistem, anti-patterns
- `reference/good-examples/` — 6 DOBRIH komponenti (9+/10). PROČITAJ BAR 2 PRE PISANJA KODA. Ovi fajlovi su standard kvaliteta.
- `.claude/skills/visual-proposer/reference/component-skeleton.md` — dizajn sistem (boje, fontovi, spacing)
- `.claude/skills/remotion-motion/reference/remotion-coding-rules.md` — Remotion API pravila
