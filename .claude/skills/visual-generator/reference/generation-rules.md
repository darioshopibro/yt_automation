# Generation Rules — Pravila za pisanje komponente od nule

Ova pravila se MORAJU postovati kad se generise nova .tsx komponenta.
Komponenta je FULLSCREEN — 1920x1080, zauzima ceo ekran.

---

## FRAME CONTRACT — KRITIČNO

**`useCurrentFrame()` UVEK vraća GLOBALNI frame.** Komponenta NE koristi Sequence wrapper. Timestamps iz voiceover-a su APSOLUTNI (npr. frame 975 = 32.5 sekundi od početka videa).

```tsx
// ✅ ISPRAVNO — koristi timestamps direktno
const DOCKER_HUB = 2107;  // frame iz voiceover timestamps-a
const opacity = interpolate(frame, [DOCKER_HUB, DOCKER_HUB + 15], [0, 1], ...);

// ❌ ZABRANJENO — ne dodavaj OFFSET
const OFFSET = 975;
const f = frame + OFFSET;  // NIKAD OVO — frame je VEĆ globalan
```

**NIKAD ne dodavaj OFFSET na frame.** NIKAD ne konvertuj lokalno u globalno. Frame koji dobiješ od `useCurrentFrame()` JE globalni.

---

## 0. CORE PRINCIP — VIZUELNO OBJASNJAVANJE, NE PRIKAZIVANJE PODATAKA

**Ti si motion designer.** Ne pravis "kutije sa podacima". Pravis animaciju koja OBJASNJAVA koncept.

### Animacija = objasnjenje

Svaki pokret MORA da ZNACI nesto:
- Element se pojavi → narator upravo pominje taj koncept
- Dva elementa se poveze → narator objasnjava kako komuniciraju
- Element se eliminise → "to ne radi" ili "to otpada"
- Progress bar se puni → kapacitet, ucitavanje, scoring
- Elementi se transformisu → promena stanja (Pending → Running)
- Dva traka idu paralelno → race condition, konkurentni procesi

### Animacija prati govor

Elementi se pojavljuju TACNO kad narator prica o njima. Ne svi odjednom. Vizual je sinhronizovan sa naratorom — kao da narator crta na tabli dok prica.

### PROGRESIVNO GRADJENJE — NAJVAZNIJE PRAVILO

**NIKAD ne stavljaj sve na ekran odjednom.** Vizual se GRADI postepeno dok narator prica:

1. Na pocetku ekran je PRAZAN (ili ima samo naslov/okvir)
2. Kad narator pomene prvi koncept → prvi element se pojavi
3. Kad narator pomene drugi → drugi se doda
4. Kad narator pomene vezu izmedju njih → veza se nacrta
5. Itd. dok se ceo vizual ne izgradi

**Ovo je kao da narator CRTA na tabli dok prica.** Gledalac prati priču i vizual se gradi pred njegovim ocima. NIKAD ne treba da gleda u 10 elemenata odjednom i pita se "sta je ovo?"

### NE STAVLJAJ PREVISE NA EKRAN

- Ako transcript opisuje 8+ elemenata — NE stavljaj svih 8 odjednom
- Grupisaj, prikazuj fazno, ili koristi zamenu (stari element bledi dok novi dolazi)
- U svakom trenutku na ekranu treba da bude max 4-6 aktivnih elemenata
- Gledalac mora da moze da PROCITA i SHVATI sve sto vidi za 2 sekunde

### VISE SCENA — kad je previse za jedan ekran

Ako transcript ima previse sadrzaja za jedan ekran — **podeli na 2-3 scene** sa tranzicijama izmedju:

```
SCENA 1 (frame 0-150):   Objasni prvi deo koncepta
  ↓ tranzicija (fade out → fade in)
SCENA 2 (frame 150-300):  Objasni drugi deo
  ↓ tranzicija
SCENA 3 (frame 300-450):  Zakljucak / rezultat
```

Svaka scena je kao ZASEBNA tabla — potpuno drugaciji sadrzaj na ekranu. Stara scena bledi, nova se pojavi. Ovo je MNOGO bolje nego stisnuti sve na jedan ekran.

Race Conditions primer je vec radio ovako: 3 faze (race demo → mutex → atomic). TO JE ISPRAVAN PRISTUP.

### ANIMIRAJ KONCEPT, NE CRTAJ DIJAGRAM

Kad transcript opisuje neku akciju ili proces — razmisli da li mozes da ANIMIRAS SAM KONCEPT umesto da crtas boxove koji ga predstavljaju.

**Pitaj se:** "Mogu li da animiram SAMU STVAR umesto da crtam box sa labelom te stvari?"

Ako nesto mozes da PRIKAZES direktno (typing, klik, loading, slojevi koji se slazu, bar koji raste) — to je uvek bolje od dijagrama sa boxovima. Gledalac ce OSETITI koncept umesto da ga cita sa labela.

### NIKAD 1 element → 5+ linija ka drugim elementima

Kad jedan element komunicira sa vise drugih — NE CRTAJ 5 linija iz jednog centra. To UVEK izgleda lose.

Umesto toga:
- Animiraj JEDAN odnos za vreme (dok narator prica o njemu), pa sledeci
- Ili stavi centralni element u sredinu, ostale oko njega radijalno
- Ili podeli u scene — svaki odnos je zasebna scena

### Vizuelni metafor > kutije sa labelama

Razmisli o metaforu pre nego sto razmislis o layoutu:
- Filtering proces → levak koji se suzava
- Evolucija → timeline koji raste udesno
- Race condition → dva paralelna traka koji se sudaraju
- Poredjenje → vaga/split screen sa metrikama
- Eliminacija → elementi koji blede/precrtavaju se
- Scaling → element koji raste/mnozi se
- Klik/akcija → animiraj SAMU AKCIJU (dugme, search bar, form)
- Kompleksna arhitektura → podeli u vise scena, svaka pokriva deo

**NIKAD nemoj default da bude "icon box + label + strelica".** To je POSLEDNJI izbor kad nista pametnije ne mozes da smislis.

---

## 0.5. TIMESTAMP SYNC — ANIMACIJE NA TAČAN FRAME

Komponenta DOBIJA word-level timestamps iz voiceover-a. Svaki element se pojavi TAČNO kad narator izgovori ključnu reč.

### Kako koristiti timestamps

```tsx
// Timestamps dolaze kao niz (iz voiceover-timestamps.json)
const timestamps = [
  { word: "Docker", start: 0.52, end: 0.85 },
  { word: "container", start: 0.88, end: 1.35 },
  { word: "FROM", start: 4.23, end: 4.55 },
  // ...
];
const fps = 30;

// Helper: nađi frame za ključnu reč
const frameFor = (keyword: string): number => {
  const w = timestamps.find(t => t.word.toLowerCase().includes(keyword.toLowerCase()));
  return w ? Math.round(w.start * fps) : 0;
};

// Koristi u animacijama
const FROM_HL = frameFor("FROM");        // tačan frame kad narator kaže "FROM"
const COPY_HL = frameFor("COPY");        // tačan frame kad narator kaže "COPY"
const RUN_HL = frameFor("install");      // tačan frame kad narator kaže "install"
```

### Pravila

- **NIKAD hardkodirati frameove** (`const X = 42` je ZABRANJENO)
- Svaki startFrame MORA doći iz timestamps-a
- Element se pojavi 3-5 frameova PRE reči (anticipacija) — gledalac vidi element TAMO kad narator kaže reč
- Ako ključna reč ne postoji u timestamps — traži najbližu alternativu
- fps je UVEK 30

### Zašto

Bez timestamp sync-a, animacije su "otprilike" tačne. Sa timestamp sync-om, animacije su na MILISEKUNDU tačne — kao da narator crta na tabli dok priča. Ovo je razlika između amaterskog i profesionalnog videa.

---

## 1. STRUKTURA KOMPONENTE

```tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

const GeneratedVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animacije se baziraju na frame (useCurrentFrame)
  // Elementi se pojavljuju na odredjenim frameovima — prate naraciju

  return (
    <div style={{
      width: 1920, height: 1080,
      padding: 80,
      background: "#0f0f1a",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      gap: 40,
    }}>
      {/* Sadrzaj */}
    </div>
  );
};

export default GeneratedVisual;
```

---

## 2. LAYOUT — NAJBITNIJI DEO

Layout je NAJBITNIJI deo vizuala. Dobar layout = gledalac INTUITIVNO shvata strukturu pre nego sto procita ijednu labelu. Los layout = PowerPoint dijagram sa boxovima u redovima.

### Princip: Layout OBJASNJAVA relacije

Pre nego sto razmisljas o Grid/Flex, pitaj se:

> "Ako gledalac vidi SAMO obrise elemenata bez teksta — da li bi shvatio strukturu?"

- Ako je odgovor = JEDAN centralni element okruzen manjim → radijalni layout
- Ako je flow levo→desno → horizontalni tok sa jasnim smerom
- Ako je hijerarhija → gore dole sa jasnim nivoima
- Ako je poredjenje → simetricno levo/desno sa jasnim divider-om
- Ako je evolucija → vodoravna linija sa tackama koje rastu

### Razmisli o PROSTORU — 1920x1080 je OGROMAN

Imas ceo ekran. Ne stiskaj sve u centar. Koristi prostor sa namerom:

- **Prazno mesto NIJE greska** — prazno mesto oko elementa ga cini vaznijim
- **Velicina elementa = vaznost** — bitniji elementi su VECI
- **Blizina = povezanost** — srodni elementi su blizu, nesrodni daleko
- **Vizuelna tezina** — tezi elementi (veci, tamiji, sa glow-om) privlace pogled prvo

### Tehnicka pravila za layout

```tsx
// UVEK Grid ili Flexbox za raspored elemenata
// NIKAD absolute positioning za sadrzaj (samo za SVG overlay linije)
```

**Zasto:** Absolute positioning = preklapanje. Grid/Flex GARANTUJU da se nista ne preklapa.

### Max elementi

- Max 4-6 AKTIVNIH elemenata na ekranu u bilo kom trenutku
- Ako transcript ima vise — gradi postepeno, zamenjuj stare novim
- Gledalac mora da moze da PROCITA sve sto vidi za 2 sekunde

---

## 3. ANIMACIJE

### SVE animacije kroz Remotion API

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// NIKAD CSS transition, animation, @keyframes, animate-*
```

### Stil animacija — PROFESIONALAN, ne bouncy

Ovo je YT explainer video, ne igrica. Animacije moraju biti:
- **Glatke i brze** — ne preterano bouncy
- **Purposeful** — svaki pokret prenosi informaciju
- **Subtle** — ne odvlace paznju od sadrzaja

```tsx
// ✅ ISPRAVNO — Smooth entrance (profesionalno)
const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
const translateY = interpolate(frame, [startFrame, startFrame + 15], [20, 0], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});

// ✅ OK — Spring SAMO ako treba blagi overshoot (scale pop-in)
const scale = spring({ frame: frame - startFrame, fps, config: { damping: 20, stiffness: 200 } });
// damping 20+ = malo ili nimalo bounce. NIKAD damping < 15.

// ❌ ZABRANJENO — Preterano bouncy
const scale = spring({ frame: frame - startFrame, fps, config: { damping: 8, stiffness: 100 } });
// Ovo bounca kao lopta — izgleda amaterski
```

### Preferiranj animacija

| Kad | Koristi | Zasto |
|-----|---------|-------|
| Fade in + slide up | `interpolate` sa `Easing.out(Easing.cubic)` | Najcistija entrance animacija |
| Scale pop-in | `spring` sa `damping: 20+` | Blagi overshoot, profesionalno |
| Crtanje linije | `interpolate` sa `Easing.out(Easing.cubic)` | Smooth, bez bounce |
| Highlight glow | `interpolate` | Postepeno pojacavanje, ne naglo |
| Fade out / eliminate | `interpolate` sa `Easing.in(Easing.quad)` | Polako krene, brzo ode |

### Stagger — elementi se pojavljuju jedan po jedan

```tsx
const staggerDelay = index * 10; // 10 frameova izmedju (1/3 sekunde na 30fps)
const opacity = interpolate(frame, [startFrame + staggerDelay, startFrame + staggerDelay + 15], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
const translateY = interpolate(frame, [startFrame + staggerDelay, startFrame + staggerDelay + 15], [20, 0], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
```

### Animacije koje nose znacenje

Animacija nije dekoracija. Svaki pokret prenosi informaciju:

| Sta narator kaze | Animacija koja OBJASNJAVA |
|------------------|--------------------------|
| "X se pojavljuje" | Fade in + slide up (15 frameova, Easing.out cubic) |
| "X postaje bitan" | Glow se postepeno pojacava, blagi scale 1.03 |
| "X salje Y-u" | Linija/dot putuje od X do Y (stroke-dashoffset animacija) |
| "X ne radi / otpada" | Postepeno bledi + grayscale filter |
| "X se menja u Y" | interpolateColors + morph animacija |
| "X raste / puni se" | Bar/krug se puni postepeno |
| "X i Y rade istovremeno" | Paralelne animacije u istom frame range-u |

---

## 4. DIZAJN SISTEM

Procitaj `component-skeleton.md` za detalje. Ukratko:

```
Pozadina:     #0f0f1a (UVEK — komponenta mora imati svoj background)
Tekst:        #e2e8f0 (primary), #94a3b8 (secondary), #64748b (dim)
Borderi:      #1a1a2e, 1px solid
BorderRadius: 10-12px
Font body:    'Inter', system-ui, sans-serif
Font mono:    'SF Mono', monospace
Ikone:        Phosphor, weight="duotone"
Glow:         boxShadow: `0 0 15px ${color}40`
Glass:        background: ${color}08, border: 1px solid ${color}15
```

**Fullscreen dimenzije:**
- Padding: 80px sa svih strana
- Icon size: 32-40px
- Label font: 14-18px
- Title font: 24-28px
- Gap izmedju elemenata: 24-40px

**NIKAD:**
- Bele pozadine, svetle teme
- Fontovi koji nisu Inter/SF Mono
- border-radius razlicit od 10-12px
- font-size > 32px (osim velikih naslova)
- rgba() — koristi hex alpha (#3b82f620)

---

## 5. ELEMENT TIPOVI — RAZMISLJAJ, NE KOPIRAJ

### Princip izbora

NE biraj tip elementa iz tabele. Pitaj se:

> "Kako bi motion designer na YT videu ovo prikazao? Koji vizuelni element OBJASNJAVA ovaj koncept, ne samo ga PRIKAZUJE?"

### Primeri dobrog razmisljanja

| Koncept iz transcripta | ❌ Mehanicki izbor | ✅ Motion designer izbor |
|------------------------|-------------------|------------------------|
| "Latency dropped to 50ms" | Stat card sa brojem | Animirani bar koji se SMANJUJE od 200ms do 50ms |
| "3 services communicate" | 3 icon boxa sa strelicama | 3 elementa izmedju kojih PUTUJE dot (paket) |
| "CPU at 78%" | Progress bar | Krug koji se puni sa bojom koja menja zelena→narandzasta→crvena |
| "Thread A and B race" | 2 icon boxa | 2 PARALELNA progress traka koji idu istovremeno i SUDARAJU se |
| "Node C gets eliminated" | Icon box + X | Element koji postepeno BLEDI i dobija strikethrough |
| "Evolution from 2000 to 2025" | 4 icon boxa u redu | Timeline koji RASTE udesno, svaka era se nadogradjuje na prethodnu |

### Nemas ogranicenje na tipove

Koristi BILO STA sto Remotion moze da renderuje — HTML, CSS, divove, spanove. Nema liste "dozvoljenih tipova". Razmisljaj o konceptu i biraj sta ga najbolje objasnjava. (SVG samo za dekorativne elemente — NIKAD za konekcije/linije/tree strukture, vidi sekciju 6).

Monotoni vizuali (sve isti boxovi) su DOSADNI — mesaj razlicite tipove elemenata u istoj komponenti.

---

## 6. SVG ZABRANA — NIKAD SVG ZA KONEKCIJE/VEZE/STRUKTURE

### ZABRANJENO koristiti SVG za crtanje BILO KAKVIH veza izmedju elemenata

Ovo ukljucuje:
- **`<line>`** izmedju dva elementa — ZABRANJENO
- **`<path>`** koji spaja elemente — ZABRANJENO
- **Tree dijagrami** sa SVG linijama (AST, hijerarhija, org chart) — ZABRANJENO
- **Strelice** napravljene od SVG `<path>` ili `<line>` — ZABRANJENO
- **Bilo kakvo SVG crtanje** cija svrha je da pokaze vezu/konekciju/strukturu — ZABRANJENO

SVG linije UVEK izgledaju lose:
- Preklapaju se sa drugim elementima
- Broken layout kad se promeni pozicija
- Izgledaju kao los PowerPoint dijagram
- Tree dijagrami sa SVG linijama su NAROCITO ruzni

**Jedini dozvoljeni SVG:** dekorativni elementi koji NISU konekcije (npr. SVG krug za progress indicator, SVG arc za score).

### Kako umesto linija pokazati vezu

Nadji BOLJI i LEPSI nacin da vizuelno animacijom prikazes vezu useru. Linije su najlenjiji i najruzniji izbor. Ti si motion designer — smisli nesto bolje:

- **Blizinu** — srodni elementi su blizu, to je dovoljno
- **Boju** — ista boja = ista grupa
- **Animaciju** — element A se pojavi, pa nesto ANIMIRANO predje ka B (glow, pulse, color wave)
- **Sekvencijalno pojavljivanje** — A se pojavi, pa B izroni PORED njega = gledalac shvata vezu
- **Scene** — svaki odnos u svojoj sceni ako je kompleksno
- **Transformaciju** — A se transformise U B (morph, fade out → fade in)

Tvoj posao je da nadjes nacin koji ce LEPSE i JASNIJE vizuelno komunicirati vezu. Razmisli kreativno.

---

## 7. ANTI-PATTERNS — NIKAD NE RADI OVO

| ❌ Ne radi | ✅ Radi umesto | Zasto |
|-----------|--------------|-------|
| CSS transitions/animate | useCurrentFrame + interpolate/spring | Ne radi u renderovanju |
| Absolute positioning za elemente | CSS Grid/Flexbox | Preklapa se |
| HTML `<img>` | Remotion `<Img>` | Ne ceka loading |
| `interface` za props | `type` za props | Remotion schema |
| interpolate bez clamp | Dodaj extrapolateLeft/Right: "clamp" | Overshoot |
| Labele na linijama | Samo strelice | Preklapa se |
| SVG `<line>`, `<path>` za konekcije/tree/strelice | Blizina, boja, animacija, scene | UVEK broken layout, ruzno |
| Element nestaje sa `display:none` / conditional render `{show && <El/>}` | Samo `opacity: 0` — element ostaje u layoutu | Layout shift — ostali elementi skacu |
| 12+ elemenata | Max 10-12, grupisaj ostale | Necitljivo |
| Isti tip za sve elemente | Mesaj tipove po potrebi | Monotono |
| Hardkodirane pixeli za layout | Relativne (%, flex, grid) | Ne skalira |
| Math.random() | Remotion random() ili deterministicki | Razlicit svaki frame |
| rgba() boje | Hex alpha (#3b82f620) | Nas dizajn sistem |

---

## 8. CONTEXT PANEL — KAD TRANSCRIPT OPISUJE KONKRETAN FAJL, TERMINAL, ILI UI

Kad transcript opisuje šta se dešava **unutar** ili **oko** nekog konkretnog izvora (fajl, terminal output, browser URL, API response) — koristi **Context Panel layout** umesto punog fullscreen-a.

### Kad da prepoznaš ovaj slučaj

Pitaj se: "Da li transcript **čita**, **prati**, ili **objašnjava** nešto što gledalac može da vidi na ekranu?"

- Narator čita fajl liniju po liniju → levo Dockerfile/config fajl
- Narator prati šta se dešava posle komande → levo terminal output
- Narator objašnjava redirect flow → levo browser sa URL barom koji se menja
- Narator opisuje API response headere → levo HTTP response
- Narator prolazi kroz kod koji gledalac verovatno piše → levo code block

Ako odgovor je DA — koristi Context Panel. Ako ne — ostani na fullscreen.

### Struktura

```
┌──────────────────────────────────────────────────────┐
│  LEVO (40%)              │  DESNO (60%)              │
│  Context Panel           │  Vizual objašnjenje       │
└──────────────────────────────────────────────────────┘
```

**Leva strana** je kontekst koji gledalac prepoznaje — fajl, terminal, browser, API response. Sadrži:
- Header zona: ikonica + naziv (npr. file icon + "Dockerfile", terminal icon + "bash")
- Placeholder linije: sive bar-ove različitih dužina koje imitiraju tekst — **ne pravi tekst**. Gledalac vidi "ovo izgleda kao fajl/kod" bez potrebe da čita.
- Highlight zona: jedan ili više redova koji se osvetljavaju (accent boja, glow) tačno u trenutku kad narator priča o toj liniji

**Desna strana** je vizualno objašnjenje — šta se ZAPRAVO dešava. Animacije, metafori, transformacije. Sve što bi inače bio fullscreen vizual.

### Sinhronizacija — najvažniji deo

Leva i desna strana moraju biti **vizuelno u paru** u svakom trenutku:
- Kad highlight skače na sledeći red levo → desno se pojavi ili promeni element koji objašnjava TU liniju
- Kad desno animacija dođe do kraja faze → highlight levo pređe na sledeći blok
- Nikad ne sme da se desi da levo prikazuje jednu stvar a desno objašnjava drugu

Highlight nije samo dekoracija — on je **kursor** koji govori gledaocu "ovo je ono o čemu pričamo sada".

### Placeholder linije

Leva strana koristi divove koji **izgledaju kao linije koda/teksta** ali nisu pravi tekst:
- Kratke/srednje/duge grey bar-ove (`background: #ffffff15`, `height: 10-12px`, `borderRadius: 4px`)
- Grupisane u blokove (kao paragrafi ili funkcije u kodu)
- 1-2 "prepoznatljive" linije mogu imati pravi tekst ako su ključne za kontekst (`FROM node:18`, `git push origin main`)

**Zašto placeholder:** Gledalac ne treba da čita levi panel — samo treba da prepozna "ovo je fajl/terminal". Pravi tekst bi odvukao pažnju od desnog vizuala.

### Dizajn levih panela

Levi panel ima isti dark background ali drugačiji karakter zavisno od tipa:
- **Fajl/kod:** monospace font, indent linije, line numbers sa strane (dimovane)
- **Terminal:** crna pozadina sa zelenim headerom, `$` prompt, output linije
- **Browser:** URL bar na vrhu, napredak konekcije, status kod

---

## 9. CHECKLIST PRE ZAVRSAVANJA

- [ ] Importi: useCurrentFrame, useVideoConfig, interpolate, spring, Easing iz "remotion"
- [ ] Fullscreen: 1920x1080, padding 80px
- [ ] Layout: Grid ili Flexbox, nikad absolute za elemente
- [ ] Animacije: SVE kroz Remotion (spring/interpolate), nikad CSS
- [ ] Clamp: SVE interpolate imaju extrapolateLeft/Right: "clamp"
- [ ] Dizajn: #0f0f1a background, Inter, SF Mono, 10-12px radius, hex alpha boje
- [ ] Ikone: Phosphor sa getIcon helper, weight="duotone"
- [ ] Export: `export default ComponentName;`
- [ ] Tipovi elemenata: razliciti gde ima smisla (ne samo icon box)
- [ ] NEMA SVG linija izmedju elemenata — koristi blizinu, boju, animaciju, scene
- [ ] Timeline: elementi se pojavljuju na razlicitim frameovima (stagger)
