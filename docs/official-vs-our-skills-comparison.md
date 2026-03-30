# Official Remotion Skill vs Nasi Skillovi — KOMPLETNA RAZLIKA

> Generisano 2026-03-30. Uporedba SVEGA sto official skill pokriva vs sto nasi skillovi znaju.

---

## LEGENDA

- **NEMAMO** = official skill pokriva, mi uopste nemamo
- **DELIMICNO** = mi imamo nesto slicno ali official ima vise detalja/bolje tehnike
- **MI BOLJE** = mi imamo vise znanja o toj temi nego official

---

## 1. ANIMACIJE I TIMING

### 1.1 Interpolate — DELIMICNO

**Official zna:**
- `interpolate()` sa extrapolateLeft/Right: "clamp" (obavezno!)
- Input/output range mapping (frame → opacity, position, scale)
- Visestruki output ranges za complex animacije

**Mi znamo:**
- Koristimo interpolate ali nemamo eksplicitna pravila o clamping-u
- Nasi skillovi ne pominju extrapolate opcije

**Gap:** Dodati pravilo da UVEK koristimo `extrapolateLeft: "clamp", extrapolateRight: "clamp"` — bez toga animacija moze da "overshoota" van definisanog range-a.

---

### 1.2 Spring animacije — MI BOLJE

**Official zna:**
- 4 named presets: smooth (d:200), snappy (d:20, s:200), bouncy (d:8), heavy (d:15, s:80, m:2)
- `spring()` sa delay i durationInFrames
- `measureSpring()` za izracunavanje trajanja

**Mi znamo:**
- 7 presets (entrance, bounce, morph, collision, blob, slide, camera)
- Detaljni use-case za svaki preset
- Stagger timing (4 frames = 133ms Fireship stil)
- Per-property timing hierarchy (opacity → position → scale)
- 12 animacionih principa primenjenih na UI

**Gap:** Dodati `measureSpring()` — korisno za izracunavanje koliko traje spring animacija u frameovima.

---

### 1.3 Easing krive — DELIMICNO

**Official zna:**
- `Easing.sin`, `Easing.quad`, `Easing.exp`, `Easing.circle`
- `Easing.in()`, `Easing.out()`, `Easing.inOut()` modifikatori
- `Easing.bezier()` za custom cubic-bezier krive
- Kombinovanje: `Easing.inOut(Easing.exp)` za dramatican ease

**Mi znamo:**
- Znamo za ease-out entrance, ease-in exit princip
- Pomenemo "asymmetric curves" u motion-physics-guide
- Ali NEMAMO konkretne Remotion Easing primere u skill reference fajlovima

**Gap:** Dodati Easing reference sa konkretnim primerima za nase use-case-ove (node entrance, camera, sticky reveal).

---

### 1.4 Sequencing — DELIMICNO

**Official zna:**
- `<Sequence from={X} durationInFrames={Y}>` za delay
- `premountFor` prop — premountuje komponentu N frameova PRE prikaza (za fetch/load)
- `layout="none"` — izbegava AbsoluteFill wrapper kad ne treba
- `<Series>` za sekvencijalni playback BEZ rucnog racunanja frameova
- `<Series.Sequence offset={-15}>` za overlap (negativni offset)
- Frame reference unutar Sequence je LOKALAN (pocinje od 0, ne od globalnog framea)
- Nested Sequences za complex timing

**Mi znamo:**
- Koristimo startFrame u config-u, template auto-generiše Sequence-e
- Builder nikad ne pise Sequence rucno (template radi)

**Gap:** Nasi skillovi ne dokumentuju ove pattern-e jer se template brine za sequencing. Ali ako budemo pravili custom vizuale van template-a, trebace nam ovo. Posebno:
- `premountFor` — za vizuale koji loaduju assets (Lottie, slike)
- `<Series>` sa negative offset — za overlapping tranzicije izmedju sticky-ja
- `layout="none"` — za vizuale unutar vizuala

---

### 1.5 Trimming — NEMAMO

**Official zna:**
- Negativan `from` na Sequence da "odsece" pocetak animacije
- `durationInFrames` da odsece kraj
- Nested Sequence za trim-then-delay

**Mi znamo:**
- Ne pominjem nigde. Template auto-handluje trajanje.

**Gap:** Korisno za fine-tuning animacija — npr. skipovati prvih 10 frameova "wind-up" faze spring-a.

---

## 2. TEXT ANIMACIJE

### 2.1 Typewriter efekat — DELIMICNO

**Official zna:**
- String slicing karakter po karakter: `fullText.slice(0, typedChars)`
- Pause posle prvog recenice (multi-phase typing)
- Blinking cursor sa interpolate opacity
- NIKAD per-character opacity (anti-pattern!)
- Kompletan TypeScript primer sa svim edge cases

**Mi znamo:**
- Code Block vizual ima typing animaciju (karakter po karakter)
- Terminal vizual ima komandu typing + output fade-in
- Ali nemamo reusable typewriter utility

**Gap:** Napraviti reusable typewriter hook/utility koji moze da se koristi u bilo kom vizualu, ne samo code-block. Official primer sa pause-after-sentence je odlican za voiceover sync.

---

### 2.2 Word Highlight (Marker efekat) — NEMAMO

**Official zna:**
- Spring-animated `scaleX` na highlight background
- `transformOrigin: 'left center'` za wipe-from-left efekat
- Layered rendering: highlight iza teksta (zIndex: 0), tekst iznad (zIndex: 1)
- Izgleda kao highlighter marker koji precrta rec
- Kompletan TypeScript primer

**Mi znamo:**
- Kinetic Typography ima word-by-word reveal i "impact" stil sa glow
- Transcript overlay ima karaoke-stil highlight
- Ali NEMAMO highlighter/marker efekat

**Gap:** Ovo je PREMIUM efekat koji bismo mogli koristiti u:
- Kinetic Typography (novi stil "highlight")
- Sticky naslovima (highlight kljucne reci)
- Transcript overlay (umesto samo boje, marker animacija)

---

### 2.3 Text merenje i fit — NEMAMO

**Official zna:**
- `measureText({ text, fontFamily, fontSize, fontWeight })` — vraca width/height
- `fitText({ text, withinWidth, fontFamily })` — vraca optimalan fontSize za container
- `fillTextBox({ maxLines, maxBoxWidth })` — proverava overflow
- `validateFontIsLoaded: true` za safety
- Iz paketa `@remotion/layout-utils`

**Mi znamo:**
- Fiksni font sizes u design.md (42px title, 28px body, itd.)
- Nema auto-sizing

**Gap:** `fitText()` bi bio JAKO koristan za:
- Node labele koje su predugacke → auto-smanji font
- Sticky naslove razlicitih duzina → uniformna velicina
- Vizual content koji varira (table headers, list items)

---

## 3. MEDIA ASSETS

### 3.1 Slike — NEMAMO

**Official zna:**
- MORA `<Img>` iz remotion-a, NE HTML `<img>`, NE Next.js `<Image>`, NE CSS background-image
- `staticFile()` za public/ folder (rucno handling subdirectory encoding)
- `getImageDimensions()` za aspect ratio racunanje
- Dynamic paths: `` staticFile(`frames/frame${frame}.png`) ``
- Sizing sa `style={{ width, height }}` + `objectFit`

**Mi znamo:**
- Ne koristimo slike u vizualima (sve je SVG/React)
- Nema pravila o Img komponenti

**Gap:** Za buducnost (Faza 10: Video/GIF vizuali, Faza 12: AI-generated slike) trebace nam ovo. Posebno:
- `<Img>` umesto `<img>` — Remotion loaduje sliku pre renderovanja (nema flicker)
- `getImageDimensions()` — za responsive positioning

---

### 3.2 Video embedding — NEMAMO

**Official zna:**
- `<Video>` iz `@remotion/media`
- `trimBefore`/`trimAfter` u frameovima (ne sekundama!)
- Delay preko `<Sequence>`
- Dynamic `volume` callback: `volume={(f) => interpolate(f, [0, 30], [0, 1])}`
- `playbackRate` za speed (0.5x - 4x, nema reverse)
- `loop` sa `loopVolumeCurveBehavior: "repeat" | "extend"`
- `toneFrequency` za pitch (server-side samo)
- Sizing sa style prop

**Mi znamo:**
- Nemamo. Nasi vizuali su sve React/SVG.

**Gap:** BITNO za Fazu 10 (Video/GIF vizuali). Kad budemo ubacivali kratke klipove kao vizualne elemente, trebace nam:
- Kako trimovati video na tacnu sekciju
- Kako sinhronizovati video sa voiceoverom (volume callback!)
- Kako lupovati kratki clip

---

### 3.3 GIF/Animated slike — NEMAMO

**Official zna:**
- `<AnimatedImage>` za GIF, APNG, AVIF, WebP — sinhronizovano sa timeline
- `playbackRate` za brzinu animacije
- Loop behavior: `loop`, `pause-after-finish`, `clear-after-finish`
- `<Gif>` iz `@remotion/gif` kao alternativa (samo GIF)
- `getGifDurationInSeconds()` za racunanje composition trajanja

**Mi znamo:**
- Nista o GIF-ovima.

**Gap:** Za Fazu 10. `<AnimatedImage>` je bolji od `<Gif>` jer podrzava vise formata.

---

### 3.4 Fontovi — DELIMICNO

**Official zna:**
- `@remotion/google-fonts` — type-safe import sa `loadFont()`
- Moze specificirati weight i subset za manje fajlove: `loadFont("normal", { weights: ["400", "700"] })`
- `@remotion/fonts` za lokalne fontove sa `loadFont({ family, url, weight })`
- `waitUntilDone()` za cekanje da se font ucita
- Visestruki weights sa istim family name

**Mi znamo:**
- brand.json ima fontFamily field
- Template koristi font ali ne loadujemo eksplicitno

**Gap:**
- `waitUntilDone()` sprečava rendering pre font ucitavanja (moze da fixuje neke flicker bugove)
- Specificiranje weight-a smanjuje download size

---

### 3.5 Lottie animacije — NEMAMO

**Official zna:**
- `@remotion/lottie` paket
- Fetch JSON sa `delayRender()`/`continueRender()` pattern
- `<Lottie animationData={data} style={{}} />`
- Sinhronizovano sa Remotion timeline

**Mi znamo:**
- Nista o Lottie. Koristimo Phosphor SVG ikone.

**Gap:** Lottie bi DRASTICNO podigao kvalitet vizuala:
- Umesto staticne ikone → animirana Lottie ikona
- Loading/processing animacije
- Logo animacije
- Micro-interactions (checkmark animacija u process-steps)
- LottieFiles ima 1000+ besplatnih animacija

---

### 3.6 Audio — DELIMICNO

**Official zna:**
- `<Audio>` sa trim, volume callback, speed, pitch, mute, loop
- Volume kao CALLBACK (ne static): `volume={(f) => Math.min(1, f / 30)}` za fade-in
- `playbackRate` za ubrzanje/usporenje
- `toneFrequency` za pitch promenu
- `loopVolumeCurveBehavior` za loop volume

**Mi znamo:**
- Static volume (0.25 camera, 0.12 section)
- Overlap rules i hijerarhiju zvukova
- Ali NE koristimo dynamic volume callback

**Gap:** Dynamic volume callback bi bio odlican za:
- Fade-in/fade-out zvukova (umesto abruptnog start/stop)
- Volume ducking kad voiceover prica (auto-smanjenje pozadinskog zvuka)

---

## 4. ZVUKOVI I AUDIO

### 4.1 SFX biblioteka — NEMAMO

**Official zna:**
- `@remotion/sfx` paket sa pre-hosted zvukovima na remotion.media:
  - `whoosh` — whoosh efekat
  - `whip` — whip/swish
  - `page-turn` — okretanje stranice
  - `switch` — klik prekidaca
  - `mouse-click` — klik misa
  - `shutter-modern` — moderan shutter zvuk
  - `shutter-old` — stari kamera shutter
  - `ding` — notifikacija ding
  - `bruh` — bruh sound effect
  - `vine-boom` — vine boom
  - `windows-xp-error` — XP error zvuk
- Koriste se kao: `<Audio src="https://remotion.media/sfx/whoosh.mp3" />`

**Mi znamo:**
- Samo custom whoosh fajlove u public/sounds/whooshes/
- medium-whoosh.mp3, soft-whoosh.mp3, thin-whoosh.mp3

**Gap:** Dodati SFX varijantu u sound reference:
- `page-turn` — za transition izmedju sticky-ja (alternativa za whoosh)
- `switch` — za state change u Interactive Diagram
- `ding` — za highlight/emphasis momenata
- `mouse-click` — za "click" animacije u Website vizualima (Faza 11)
- Ovo prosiruje paletu zvukova bez dodavanja custom fajlova

---

### 4.2 Audio vizualizacija — NEMAMO

**Official zna:**
- `useWindowedAudioData({ src, frame, fps, numberOfSamples })` za ucitavanje audio podataka
- `visualizeAudio()` za frequency spectrum (power-of-2: 32, 64, 128, 256, 512, 1024 samples)
- Vraca niz 0-1 vrednosti (levo = bass, desno = highs)
- `visualizeAudioWaveform()` + `createSmoothSvgPath()` za oscilloscope SVG
- `getWaveformPortion()` za simplified volume data
- Bass extraction: `visualizeAudio(...)[0]` (prvi element = najniza frekvencija)
- Logarithmic postprocessing za vizualni balans
- **BITNO:** Pass frame from parent, NE pozivaj useCurrentFrame() u child (Sequence bug)

**Mi znamo:**
- Nista o audio vizualizaciji.

**Gap:** Beat-reactive efekti:
- Glow intenzitet na basu voiceover-a
- Subtle scale pulse na ikonama
- Background brightness pulse
- Waveform vizualizacija kao pozadinski element

---

## 5. CAPTION/SUBTITLE SYSTEM

### 5.1 Caption format — DELIMICNO

**Official zna:**
- `Caption` type iz `@remotion/captions`: `{ text, startMs, endMs, timestampMs, confidence }`
- JSON format za cuvanje (ne SRT!)
- Konverzija iz SRT: `parseSrt()` iz `@remotion/captions`

**Mi znamo:**
- ElevenLabs word timestamps: `{ characters, character_start_times_seconds, character_end_times_seconds }`
- Nas format je drugaciji — per-character, ne per-word

**Gap:** Unifikacija formata. @remotion/captions format je standardniji i ima vise utility funkcija.

---

### 5.2 Whisper.cpp transkripcija — NEMAMO

**Official zna:**
- `@remotion/install-whisper-cpp` za auto-install Whisper-a
- Download modela: `downloadWhisperModel({ model: "medium.en" })`
- Konverzija u 16kHz WAV: `convertToCaptions({ input, whisperPath, model, tokenLevelTimestamps: true })`
- `toCaptions()` za postprocessing

**Mi znamo:**
- Ne koristimo Whisper. Koristimo ElevenLabs timestamps direktno.

**Gap:** Niskoprioritetno — ElevenLabs nam daje timestamps. Ali Whisper bi bio koristan za:
- Transkribovanje TUDJEG audio/video content-a (analiza)
- Generisanje titlova za importovane klipove

---

### 5.3 TikTok-style captions display — NEMAMO

**Official zna:**
- `createTikTokStyleCaptions()` iz `@remotion/captions`
- Grupise reci u "stranice" (combineTokensWithinMilliseconds kontrolise koliko reci po grupi)
- Svaka stranica je `<Sequence>` sa timing-om
- Word highlighting: svaka rec ima `tokens[]` niz sa time-based highlighting
- `whiteSpace: "pre"` za ocuvanje razmaka
- Odvojen CaptionPage component

**Mi znamo:**
- Transcript overlay sa karaoke-stil highlight (rec po rec)
- Ali nismo koristili @remotion/captions paket

**Gap:** @remotion/captions ima bolji word grouping:
- Automatski grupise 3-5 reci u "stranicu" (citljivije od celog recenice)
- Built-in timing logic (ne moramo racunati rucno)
- Bolji za vertical format (Reels/Shorts) gde je prostor ogranicen

---

## 6. SCENE TRANSITIONS

### 6.1 TransitionSeries — NEMAMO

**Official zna:**
- `<TransitionSeries>` iz `@remotion/transitions`
- Built-in tranzicije:
  - `fade()` — crossfade
  - `slide({ direction: "from-left" })` — slajd sa strane
  - `wipe({ direction: "from-left" })` — brisanje
  - `flip({ direction: "from-left" })` — 3D flip
  - `clockWipe()` — sat-brisanje (krug)
- Timing: `linearTiming({ durationInFrames })` ili `springTiming({ config, durationInFrames })`
- **BITNO:** Tranzicija PREKRIVA dve scene → ukupno trajanje = scene1 + scene2 - transition
- `<TransitionSeries.Overlay>` za efekte koji NE skracuju timeline (light leaks)
- Mesanje tranzicija i overlay-a u istoj seriji

**Mi znamo:**
- Blob + gooey + particle trail za element-to-element tranzicije (GregV2)
- Camera whoosh kao "tranzicija" izmedju sticky-ja
- Ali NEMAMO scene-level transitions

**Gap:** TransitionSeries bi bio odlican za:
- Tranzicija izmedju sticky-ja (umesto samo camera pan)
- Crossfade izmedju razlicitih vizuala unutar sekcije
- Wipe za "before/after" u split-screen vizualu
- Light leak overlay na kljucnim momentima

Razlika: Nase blob tranzicije su za ELEMENT morphing, TransitionSeries je za SCENE transitions — KOMPLEMENTARNI su.

---

### 6.2 Light Leaks — NEMAMO

**Official zna:**
- `<LightLeak>` iz `@remotion/light-leaks` (WebGL, zahteva v4.0.415+)
- Props: `durationInFrames`, `seed` (random pattern), `hueShift` (0-360, default yellow-orange)
- Ponasanje: reveal tokom prve polovine, retract tokom druge
- Moze standalone ili u TransitionSeries kao Overlay
- Primer: `<LightLeak durationInFrames={90} seed={3} hueShift={120} />`

**Mi znamo:**
- Nista o light leaks.

**Gap:** Instant "premium" feel. Koriscenje:
- Overlay na camera tranzicijama (umesto samo whoosh zvuk → whoosh + light leak)
- Na kljucnim momentima (punchline, reveal)
- Kao "intro" efekat na pocetku videa

---

## 7. CHARTS I DATA VIZ

### 7.1 Line Chart sa @remotion/paths — NEMAMO

**Official zna:**
- `@remotion/paths` paket za SVG path manipulaciju
- `evolvePath(progress, path)` — animira SVG path od 0% do 100% (crtanje linije)
- `getLength(path)` — ukupna duzina patha
- `getPointAtLength(path, length)` — tacka na odredjenom mestu patha (za dot koji prati liniju)
- `getTangentAtLength(path, length)` — ugao tangente (za rotaciju markera)
- Koristiti za: line chart animacije, path-following animacije, SVG drawing efekte

**Mi znamo:**
- Bar chart i Pie chart vizuali
- Ali NEMAMO line chart

**Gap:**
- Line chart vizual: evolvePath za crtanje linije od levo ka desno
- Path-following: marker/dot koji prati liniju (za timeline vizual upgrade)
- SVG drawing: animirano iscrtavanje ikona ili dijagrama

---

### 7.2 Bar Chart pattern — DELIMICNO

**Official zna:**
- Staggered spring entrance: `spring({ frame: frame - i * 5 - 10, fps, config: { damping: 18, stiffness: 80 } })`
- Y-axis sa steps, X-axis sa labels
- Bar height = `(value / maxValue) * chartHeight * progress`
- Dark tema sa gold barovima

**Mi znamo:**
- BarChartVisual sa progress prop i cubic ease-out
- Ali koristimo progress, ne individual springs po baru

**Gap:** Official pattern sa staggered springs izgleda BOLJE — svaki bar "iskace" posebno umesto da svi rastu zajedno. Razmotriti upgrade.

---

## 8. 3D CONTENT

### 8.1 Three.js integracija — NEMAMO

**Official zna:**
- `@remotion/three` paket
- `<ThreeCanvas width={} height={}>` wrapper
- Lighting: `<ambientLight intensity={} />` + `<directionalLight position={} />`
- Animacija SAMO sa `useCurrentFrame()` — NIKAD `useFrame()` iz @react-three/fiber
- `<Sequence layout="none">` unutar ThreeCanvas
- 3D objekti, materijali, geometrija

**Mi znamo:**
- Nista o 3D.

**Gap:** Za buducnost — 3D vizuali bi bili premium:
- 3D logo rotacija
- 3D server/cloud vizualizacija
- 3D pipeline dijagram

Niskoprioritetno ali vredno znati da postoji.

---

## 9. MAPS

### 9.1 Mapbox integracija — NEMAMO

**Official zna:**
- mapbox-gl + @turf/turf za geo operacije
- `interactive: false`, `fadeDuration: 0` — disable built-in animacije
- Container MORA imati explicit width/height + position absolute
- `setFreeCameraOptions()` za camera animaciju
- Linear interpolation za straight lines, turf `lineSliceAlong` za geodesic
- Render sa `--gl=angle --concurrency=1`

**Mi znamo:**
- Nista o mapama.

**Gap:** Za specifican content (tech company locations, data center maps). Niskoprioritetno.

---

## 10. RENDERING I OUTPUT

### 10.1 Transparent video — NEMAMO

**Official zna:**
- ProRes: `--codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png`
- WebM VP9: `--codec=vp9 --pixel-format=yuva420p --image-format=png`
- Moze se setovati via CLI, remotion.config.ts, ili calculateMetadata

**Mi znamo:**
- Renderujemo standardni MP4.

**Gap:** Transparent video bi bio koristan za:
- Overlay elementi koje ubacujemo u DaVinci Resolve
- Animirani watermark/logo
- Elemente za compositing

---

### 10.2 FFmpeg utility — NEMAMO

**Official zna:**
- `bunx remotion ffmpeg` i `bunx remotion ffprobe` (ne treba instalacija)
- Video trimming: `ffmpeg -ss 00:00:05 -i input.mp4 -to 00:00:10 -c:v libx264 -c:a aac output.mp4`
- Alternative: `trimBefore`/`trimAfter` na Video komponenti (non-destructive)

**Mi znamo:**
- Pominjem DaVinci Resolve za post-production ali ne FFmpeg.

**Gap:** Korisno za automatski post-processing:
- Auto-trim intro/outro
- Concatenation vise klipova
- Audio normalizacija

---

## 11. COMPOSITION I STRUKTURA

### 11.1 calculateMetadata — NEMAMO

**Official zna:**
- `calculateMetadata` funkcija na `<Composition>` za dynamic sizing
- Moze da fetch-uje video/audio duration i postavi composition trajanje
- Moze da transformise props (fetch data, modify values)
- `abortSignal` za cancel stale requests
- Primer: ucitaj voiceover → `getAudioDuration()` → postavi durationInFrames

**Mi znamo:**
- Fiksno trajanje u config-u: `totalFrames = ceil(voiceover_duration * fps) + 30`
- Racunamo u planner-u, ne dinamicki

**Gap:** calculateMetadata bi eliminisao potrebu za rucnim racunanjem:
- Composition se automatski resizeuje na osnovu voiceover-a
- Nema "30 buffer frameova" hack — precizno trajanje

---

### 11.2 Parametrizable compositions (Zod) — NEMAMO

**Official zna:**
- Zod schema za props → visual editing u Remotion Studio sidebar
- `zColor()` iz `@remotion/zod-types` za color picker
- Top-level mora biti `z.object()`
- Primer: menjanje boja, teksta, velicina direktno u Studio-u

**Mi znamo:**
- dynamic-config.json za konfiguraciju
- Ali nema Zod schema → nema visual editing u Studio

**Gap:** Sa Zod schema-ma:
- Mogli bismo menjati brand boje DIREKTNO u Remotion Studio (bez editora)
- Live preview svih promena
- Validacija tipova na compile time

---

### 11.3 Compositions, Folders, Stills — DELIMICNO

**Official zna:**
- `<Composition>` sa id, component, duration, fps, width, height
- `defaultProps` (JSON-serializable, podrzava Date, Map, Set, staticFile)
- `type` deklaracije za props (NE `interface`!)
- `<Folder name="">` za sidebar organizaciju
- `<Still>` za single-frame slike (thumbnails!)
- Nesting: `<Sequence width={} height={}>` unutar parent composition

**Mi znamo:**
- Root.tsx registruje sve kompozicije
- Ali nemamo Folder organizaciju ni Still za thumbnails

**Gap:**
- `<Still>` za YouTube thumbnail generisanje! (1280x720 single frame)
- `<Folder>` za organizaciju kad imamo vise videa
- `type` umesto `interface` za props — TypeScript best practice za Remotion

---

## 12. LAYOUT I MERENJE

### 12.1 DOM merenje — NEMAMO

**Official zna:**
- `useCurrentScale()` za kompenzaciju Remotion scale transform-a
- `getBoundingClientRect()` deli sa scale faktorom za tacne dimenzije
- Bitno za responsive positioning

**Mi znamo:**
- Fiksne dimenzije u design system-u.

**Gap:** Korisno za responsive vizuale koji se prilagodjavaju sadrzaju.

---

## 13. TAILWIND

### 13.1 Tailwind u Remotion-u — DELIMICNO

**Official zna:**
- Tailwind RADI u Remotion-u
- ZABRANJENO: `transition-*` klase, `animate-*` klase
- SVE animacije moraju koristiti `useCurrentFrame()`

**Mi znamo:**
- Ne koristimo Tailwind u Remotion (inline styles)

**Gap:** Nema pravog gap-a — inline styles su OK za nas use-case. Ali ako preferiamo Tailwind, znamo pravila.

---

## PRIORITIZOVANA LISTA — STA DODATI U NASE SKILLOVE

### 🔴 VISOKI PRIORITET (odmah korisno)

| # | Tema | Sta dodati | Gde |
|---|------|-----------|-----|
| 1 | SFX biblioteka | @remotion/sfx zvukove (page-turn, switch, ding, mouse-click) | sound.md |
| 2 | Word Highlight | Marker/highlighter animacija za tekst | novi reference fajl |
| 3 | Text Fitting | fitText() za auto-sizing teksta u vizualima | design.md |
| 4 | TransitionSeries | Scene-level tranzicije (crossfade, slide, wipe) | novi reference fajl |
| 5 | Light Leaks | Premium overlay efekat | novi reference fajl |
| 6 | Dynamic Volume | Volume callback za fade-in/out zvukova | sound.md |
| 7 | Easing reference | Konkretni Easing primeri za nase use-case-ove | novi reference fajl |
| 8 | Staggered Bar Chart | Individual spring po baru umesto uniform progress | extraction-rules.md |

### 🟡 SREDNJI PRIORITET (za sledece faze)

| # | Tema | Sta dodati | Gde |
|---|------|-----------|-----|
| 9 | Lottie animacije | @remotion/lottie za animirane ikone | novi reference fajl |
| 10 | Line Chart | @remotion/paths evolvePath za SVG linije | visual-catalog.md |
| 11 | TikTok Captions | @remotion/captions za bolji word highlight | novi reference fajl |
| 12 | Still thumbnails | <Still> za YouTube thumbnail generisanje | builder SKILL.md |
| 13 | calculateMetadata | Dynamic composition sizing | planner reference |
| 14 | Font loading | waitUntilDone() + weight specificiranje | design.md |
| 15 | Interpolate clamping | Pravilo za extrapolateLeft/Right: "clamp" | motion reference |
| 16 | measureSpring() | Izracunavanje trajanja spring animacije | motion reference |

### 🟢 NISKI PRIORITET (za buducnost)

| # | Tema | Sta dodati | Gde |
|---|------|-----------|-----|
| 17 | Video embedding | <Video> sa trim, volume, speed za Fazu 10 | novi reference |
| 18 | Image embedding | <Img> sa getImageDimensions za Fazu 12 | novi reference |
| 19 | GIF/AnimatedImage | Animated images za Fazu 10 | novi reference |
| 20 | Audio vizualizacija | Beat-reactive efekti | novi reference |
| 21 | 3D (Three.js) | @remotion/three za premium vizuale | novi reference |
| 22 | Transparent video | ProRes/WebM sa alpha za compositing | builder reference |
| 23 | Zod parametri | Visual editing u Studio sidebar | builder reference |
| 24 | Mapbox | Mape za specifican content | novi reference |
| 25 | Whisper.cpp | Audio transkripcija | novi reference |
| 26 | Premounting | premountFor za asset loading | sequencing reference |

---

## STA MI IMAMO A OFFICIAL NEMA

Za referencing — ovo su nase PREDNOSTI koje official skill NE pokriva:

1. **Visual routing pipeline** — transcript → visual type → sticky grouping (13 vizuala + 9 layouta)
2. **Composition rules** — weight balance, variety, density, shape modes, disambiguation
3. **Camera system** — anticipation (15f before), breathing (sin/cos drift), keyframe pipeline
4. **Sound design pravila** — conservative AI rule, overlap detection, volume hierarchy
5. **Glassmorphism design system** — blur/saturate/glow/inset highlight sa branding
6. **Element transitions** — blob + gooey + grain + particle trail (7 iteracija, 8 pravila)
7. **Correction workflow** — hot-reload config editing sa auto-backup
8. **End-to-end pipeline** — research → script → TTS → visual → build → render
9. **Brand system** — per-project boje, fontovi, glass efekti
10. **Motion physics research** — 12 animacionih principa, per-property timing, 40+ izvora
11. **ExplainerLayout system** — 9 layout tipova sa animiranim linijama
12. **Visual proposer** — AI generisanje novih vizuala kad postoji gap
13. **Self-learning** (planirano) — editor feedback → bolji routing
