# Greg Isenberg — Master Patterns Document

> Izvučeno iz 7 detaljno analiziranih TikTok videa
> Analizirano sa: Gemini AI Studio
> Datum: 2026-03-29
> Referentni fajlovi: video-1.md do video-8.md
> **Video 6 (Kintsugi) označen kao BEST — najimpresivniji vizuelni stil**

---

## 1. SVE TRANZICIJE (Kompletna Lista)

### Tier 1: CORE tranzicije (pojavljuju se u SVAKOM videu)

| # | Tranzicija | Opis | Trajanje | Easing | Pojavljuje se u |
|---|-----------|------|----------|--------|-----------------|
| 1 | **Pop/Scale with Spring** | Element se pojavi od 0→100% sa overshoot bounce-om | 0.3-0.5s | Elastic/Spring (heavy overshoot) | Svi videi |
| 2 | **Path Tracing (Dotted Lines)** | Isprekidana linija crta samu sebe od tačke A do B, vodiči oko | 0.5-1s | Linear ili ease-out | Svi videi |
| 3 | **Morphing/Expansion** | Mali element (pill/badge) se ekspanduje u veći (kartica/panel) | 0.5-1s | Spring/Elastic | Svi videi |
| 4 | **Kinetic Typography** | Reči pop-uju jedna po jedna, synced sa voiceover-om | 0.2-0.3s po reči | Spring bounce | Svi videi |
| 5 | **Sequential Pop** | Lista elemenata se pojavljuje jedan za drugim (top→bottom ili left→right) | 0.3s gap između | Spring stagger | Svi videi |

### Tier 2: ČESTE tranzicije (3+ videa)

| # | Tranzicija | Opis | Trajanje | Easing | Pojavljuje se u |
|---|-----------|------|----------|--------|-----------------|
| 6 | **Physics Fall/Drop** | Element pada odozgo sa gravitacijom | 0.5-0.8s | Ease-in (ubrzava) | V3, V5, V6, V7 |
| 7 | **Slide/Wipe** | Element klizi van ekrana, otkriva novi sadržaj ispod | 0.3-0.5s | Ease-out | V1, V2, V4, V8 |
| 8 | **Data Ingestion/Absorption** | Elementi padaju/lete u drugi element i nestaju (AI procesiranje) | 0.5-1s | Ease-in | V3, V5, V7, V8 |
| 9 | **Fast-Counter** | Brojevi se brzo menjaju (timer, cena, metrika) | 1-3s | Linear | V3, V5, V7 |
| 10 | **Camera Pan** | Viewport se pomera (gore/dole/levo/desno) da otkrije novi deo canvas-a | 1-2s | Ease-in-out | V1, V4, V7 |
| 11 | **Typewriter Effect** | Tekst se "kuca" karakter po karakter | 1-2s | Linear | V1, V4, V8 |
| 12 | **Stacking Drop** | Više elemenata pada i slaže se vertikalno | 0.5-1s | Ease-in + bounce | V4, V5, V7 |

### Tier 3: SPECIJALNE tranzicije (1-2 videa, ali visoko impresivne)

| # | Tranzicija | Opis | Video | Start→End Opis |
|---|-----------|------|-------|----------------|
| 13 | **3D Fracture/Explode** | 3D objekat se lomi na delove koji lete u stranu | V6 | Cela posuda → razbijeni delovi koji plutaju |
| 14 | **Magnetic Assembly** | Razbijeni delovi klize nazad i snap-uju se u celinu | V6 | Razbijeni delovi → sastavljena posuda sa zlatnim pukotinama |
| 15 | **Radial Explosion** | Elementi iz steka eksplodiraju radijalno u mindmap raspored | V4 | Naslagane kartice u kontejneru → kartice raspoređene u krug sa linijama |
| 16 | **Physics Pull/Stretch** | Objekat (raketa) vuče druge elemente gore putem linije | V5 | Statični avatari → avatari se pomeraju gore, layout se rasteže |
| 17 | **Physics Balance Scale** | Linija na pivotu se naginje kao vaga | V5 | Balansirana linija → nagnuta (teži element dole) |
| 18 | **Assembly Line/Conveyor** | Blokovi padaju kroz frame, procesiraju se, izlaze dole | V5 | Blok ulazi gore → skenira se → izlazi dole kao "Output" |
| 19 | **Funneling/Squeezing** | Veliki levak pada i "guta" manje elemente | V7 | Avatari slobodno stoje → uvučeni u levak, istisnuti dole |
| 20 | **Particle Flow/Routing** | Male sfere teku duž putanja ka centru | V7 | Sfere na ivicama → teku duž crvenih putanja ka centralnoj tački |
| 21 | **Cross-Section Reveal** | 3D objekat se "preseca" maskom, otkriva 2D dijagram unutra | V7 | Solidan 3D stubac → vidljive cevi i para unutar preseka |
| 22 | **Mechanical Fix** | Alat (ključ) okreće zupčanik, para nestaje | V7 | Curi para → ključ zavrće → para nestaje |
| 23 | **Grid Multiplication** | Jedan element se replicira u full-screen pattern | V7 | Jedna kruška → ekran pun kruški u gridu |
| 24 | **Radial Orbiting** | Elementi fizički kruže oko centralnog objekta | V5 | Ikone statične → kruže oko telefona |
| 25 | **Carousel Sliding** | Kartice klize horizontalno, nova dolazi sa strane | V6 | Kartica A vidljiva → klizi levo, kartica B dolazi zdesna |
| 26 | **Slot-Machine Counter** | Brojevi se vrte vertikalno na cilindru | V6 | Statičan broj → cifre se vrte kao na slot mašini |
| 27 | **Slider Physics** | Dugme klizi po traci, na threshold-u menja boju | V8 | Dugme levo (zeleno) → klizi desno → prelazi 50%, linija postaje crvena |
| 28 | **Color Inversion Cut** | Instant prebacivanje light→dark mode | V4 | Svetla pozadina → instant crna pozadina sa glowing elementima |
| 29 | **Hover/Click Interaction** | Kursor klikne element, element se smanji pa vrati | V5 | Kartica normalna → kursor klikne → kartica se smanji (press) → popup |
| 30 | **UI Right-Click** | Kursor selektuje kod, otvara context menu | V8 | Kod vidljiv → kursor selektuje → context menu pop |
| 31 | **Circular Mask Expand** | Zeleni krug se širi i uramljuje finalni shot | V6 | Mali krug → ekspanduje i maskira pozadinu |
| 32 | **3D Camera Push** | Kamera se polako kreće napred kroz 3D scenu | V7 | Daleka perspektiva grada → kamera se približava kroz ulice |
| 33 | **Depth-of-Field Fade** | Element se pojavljuje iz zamagljene pozadine u fokus | V6 | Zamagljeni terminal u pozadini → dolazi u fokus |

---

## 2. SVI ELEMENTI (Kompletna Lista)

### Primarni elementi (svaki video)
| Element | Opis | Dimenzije/Stil |
|---------|------|---------------|
| **Pill/Badge** | Zaobljeni pravougaonik za labele, tagove, logo-e | ~120-200px širina, border-radius 50%, shadow |
| **Large Card** | Ekspandirano stanje pill-a — drži sadržaj | ~300-500px, border-radius ~16px, heavy shadow |
| **Dotted Lines** | Isprekidane linije koje povezuju elemente | 2-3px, dark green, gap 6-8px |
| **Kinetic Text** | Bold serif tekst koji pop-uje reč po reč | Dark green #1E3A2F, large size |

### Sekundarni elementi (3+ videa)
| Element | Opis |
|---------|------|
| **Prompt UI Bar** | Horizontalni bar koji imitira chat input |
| **App UI Card/Wireframe** | Vertikalni pravougaonik koji predstavlja telefon/app |
| **Code/Terminal Window** | Dark ili light mode terminal sa monospace fontom |
| **User Avatars** | Jednostavni krugovi sa siluetom |
| **Sunburst/Asterisk** | Dekorativna 3D zvezda (narandžasta/zelena) |
| **Checkmarks/X marks** | Zeleni ✓ i crveni ✗ za status |

### Specijalni elementi (1-2 videa, ali visoko impresivni)
| Element | Video | Opis |
|---------|-------|------|
| **3D Objects** | V6, V7, V8 | Posuda, laptop, magic wand, grad — 3D renderovani |
| **Funnels/Pathways** | V7, V8 | Široki obojeni blokovi za protok |
| **Particles/Spheres** | V7 | Male bele sfere za korisnike/podatke |
| **Pipes/Plumbing** | V7 | Cevi sa parom za interne operacije |
| **Mechanical Gears** | V5 | Crni zupčanici za inženjering |
| **Balance Scale** | V5 | Fizička vaga na pivotu |
| **Slider Bar** | V6, V8 | Horizontalna traka sa pokretnim dugmetom |
| **Carousel** | V6 | Kartice koje klize levo/desno |
| **Robot Head** | V3, V8 | Retro robot — recurring karakter |
| **Smartphone Frame** | V5 | Okvir telefona kao kontejner i subjekt |
| **Chat Bubbles** | V5, V6 | iMessage/Slack stil poruke |
| **Masks/Cutouts** | V6 | Kružni prozori za uramljivanje |

---

## 3. TIMING PRAVILA

| Pravilo | Vrednost | Napomena |
|---------|----------|---------|
| **Prosečno trajanje scene** | 4-6 sekundi | Duže za kompleksne koncepte (do 8s) |
| **Prosečno trajanje tranzicije** | 0.5-1 sekunda | Brze, snappy, nikad spore |
| **Overlap tranzicija** | Minimalan | Hard cut ili brz wipe, retko cross-fade |
| **Ukupno trajanje videa** | 44-67 sekundi | Sweet spot ~50 sekundi |
| **Kinetic text timing** | 0.2-0.3s po reči | Synced sa voiceover beat-om |
| **Sequential pop gap** | 0.2-0.5s između elemenata | Stagger efekat |
| **Spring overshoot** | 10-20% | Vidljiv bounce, nije preteran |

---

## 4. COLOR PALETA (Konzistentna kroz sve videe)

| Boja | Hex | Upotreba |
|------|-----|----------|
| **Off-White Background** | `#F0F0F0` / `#F4F4F4` | Pozadina canvas-a (95% vremena) |
| **Deep Forest Green** | `#1E3A2F` / `#1A2F25` | Primarni tekst, kartice, UI elementi |
| **Soft Mint/Sage Green** | `#80C2A0` / `#88B79A` / `#A8DAB5` | Svetli akcenti, terminal pozadine, linije |
| **Vibrant Mint Green** | `#61D095` | Glowing elementi, sunburst, naglasak |
| **Muted Red/Coral** | `#DE6B58` / `#E55B5B` | Sekundarni akcent, error stanja, kursor |
| **Gold** | `#C0A040` | Specijalni efekat (Kintsugi pukotine) |
| **Near Black** | `#1A1A1A` / `#121212` | Dark mode kartice, gears, avatari |
| **Muted Mustard** | `#D4A373` | Tercijarni akcent (retko) |

### Pravila za boje:
- **Pozadina je UVEK svetla** (off-white) osim za dramski dark mode cut
- **Zelena dominira** — 80%+ svih UI elemenata
- **Crvena/coral samo za akcente** — kursor, error, naglasak
- **Shadows su meke i duboke** — soft directional drop shadows, daju 3D osećaj
- **Nikad više od 3-4 boje u jednoj sceni**

---

## 5. STILSKA PRAVILA

### Generalni stil:
- **"Bento Box / Spatial Canvas"** estetika — elementi plutaju na svetloj pozadini sa dubokim senkama
- **Node-based flowchart** — dotted linije povezuju sve, kao mind-map
- **Spring physics** je OBAVEZNA — svaki pop, svaki morph ima elastic/spring easing sa vidljivim bounce-om
- **Flat 2D sa 3D osećajem** — sami elementi su 2D ali senke i perspective daju dubinu
- **3D objekti** se koriste za hook-ove i metafore (posuda, laptop, grad)

### Font:
- **Serif bold** za kinetic typography (tamno zelena)
- **Sans-serif** za UI elemente, badge-ove, kartice (bela na tamno zelenoj)
- **Monospace** za terminal/code blokove

### Shadows:
- Heavy soft drop shadows na SVIM elementima
- Smer: dole-desno
- Blur: 15-25px
- Boja: rgba(0,0,0,0.15-0.25)
- Daju "floating" osećaj — elementi lebde iznad pozadine

### Border radius:
- Pills/Badges: 50% (potpuno zaobljeni)
- Cards: 12-20px
- Terminal windows: 8-12px

---

## 6. PATTERN-I ZA START/END FRAME (Za AI Video Modele)

Na osnovu svih analiziranih tranzicija, evo konkretnih START→END frame parova:

### Morph tranzicije:
| Start Frame | End Frame | Motion Prompt |
|-------------|-----------|---------------|
| Mali pill badge u centru | Velika kartica sa sadržajem | "Small rounded pill smoothly expands into a large card with content appearing inside" |
| Jedna velika kartica | 3-4 manje kartice raspoređene | "Large card splits and distributes into multiple smaller cards arranged in a grid" |
| 3D objekat (posuda) | 2D kartica sa logom | "3D porcelain bowl morphs and flattens into a 2D logo card" |
| Sunburst/asterisk | Velika document kartica | "Spinning starburst shape expands and transforms into a rectangular document card" |
| Zupčanik | Velika tamna kartica | "Mechanical gear expands and morphs into a large dark panel" |

### Physics tranzicije:
| Start Frame | End Frame | Motion Prompt |
|-------------|-----------|---------------|
| Elementi slobodno plutaju | Elementi naslagani u kontejneru | "Floating cards fall with gravity and stack neatly inside a container" |
| Elementi u steku | Elementi raspoređeni radijalno | "Stacked cards explode outward radially into a mind-map layout with connecting lines" |
| Elementi na vrhu | Elementi upijeni u ikonu na dnu | "Data pills fall downward and get absorbed into a central robot icon" |
| Balansirana vaga | Nagnuta vaga | "Balance scale tilts as weight on left side increases" |

### Flow tranzicije:
| Start Frame | End Frame | Motion Prompt |
|-------------|-----------|---------------|
| Prazna scena | Dotted linije nacrtane sa badge-ovima | "Dotted lines draw themselves connecting floating badges in a flowchart layout" |
| Sfere na ivicama | Sfere u centru | "Small white particles flow along red pathways toward the central icon" |
| Blok ulazi u frame gore | Blok izlazi dole sa "Output" labelom | "Block enters from top, gets processed inside a frame, exits at bottom as output" |

### 3D tranzicije (NAJIMPRESIVNIJE):
| Start Frame | End Frame | Motion Prompt |
|-------------|-----------|---------------|
| Cela posuda | Razbijeni delovi sa zlatnim pukotinama | "Porcelain bowl fractures into pieces with glowing gold Kintsugi cracks between fragments" |
| Razbijeni delovi | Sastavljena posuda sa zlatom | "Broken bowl pieces magnetically slide back together with golden repair lines" |
| 3D laptop | 3D magic wand | "Glowing laptop collapses and transforms into a glowing magic wand" |
| Solidan 3D stubac | Presek sa vidljivim cevima | "Solid pedestal cross-sections to reveal internal pipe diagram with steam" |

---

## 7. KLJUČNI ZAKLJUČCI ZA PIPELINE

1. **Spring easing je NON-NEGOTIABLE** — svaki element MORA da ima bounce/overshoot
2. **Dotted lines su lepak** — povezuju SVE, daju flowchart osećaj
3. **Morph je dominantna tranzicija** — pill→card, small→big, shape→shape
4. **3D elementi za hook-ove** — prva 3-5 sekundi koriste 3D za attention grab
5. **Kinetic typography synced sa audio-om** — reči pop-uju tačno kad ih speaker kaže
6. **Off-white pozadina + deep green UI** — konzistentna paleta, nikad ne odstupa
7. **Scenes su kratke (4-6s)** — tempo je brz, nikad dosadan
8. **Fizičke metafore** — levak, vaga, cevi, raketa — apstraktne koncepte čine opipljivim
9. **Svaki video ima 1-2 UNIQUE trick-a** — ne ponavljaju se iste tranzicije, uvek ima nešto novo
10. **Audio sync je KRITIČAN** — tranzicije se dešavaju na beat voiceover-a
