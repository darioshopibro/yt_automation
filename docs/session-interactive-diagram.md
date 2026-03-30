# Session Log: Interactive Diagram + Full Screen Komponenta

**Datum:** 2026-03-30
**Status:** U toku — komponenta se pravi od nule, ne kao template

---

## STA SMO RADILI OVU SESIJU

### 1. Uporedili official Remotion skill sa nasim skillovima

Istrazili smo `remotion-best-practices` official skill (40+ fajlova) i uporedili sa nasih 5 custom skillova (motion, planner, builder, visual-router, correction).

**Zakljucak:** Official skill ima "kako se koristi" instrukcije za Remotion API koje mi NEMAMO — pravila za kodiranje (useCurrentFrame uvek, Img umesto img, clamp na interpolate, delayRender za async, itd). Mi imamo pipeline znanje (routing, planning, building) koje oni nemaju.

**Uradjeno:**
- Napravljen `remotion-coding-rules.md` — sva pravila za pisanje Remotion koda, adaptirano za nas 1920x1080 YT pipeline
- Linkovan u SKILL.md i component-skeleton.md (Visual Proposer cita kad pravi custom vizuale)
- Napravljen `future-upgrades.md` — stvari iz community template-ova koje mozemo dodati
- Napravljen `docs/official-vs-our-skills-comparison.md` — kompletna razlika

### 2. Istrazili 5 community Remotion template-ova

Pullovali u `research/community-templates/`:

| Repo | Sta ima | Korisno za nas |
|------|---------|---------------|
| **jhartquist/claude-remotion-kickstart** | Diagrams (Mermaid/D2), Captions, Music, Code, ZoomableVideo, preload | Mermaid za layout, Music fade in/out, preload |
| **wcandillon/remotion-fireship** | Fireship stil, prism-react-renderer, 3D bez Three.js, remapSpeed | Code highlighting, speed remap utility |
| **remotion-dev/template-code-hike** | Token-level kod morphing (tokeni klize na novu poziciju) | Code Hike za code walkthrough sekcije |
| **wilwaldon/Claude-Code-Video-Toolkit** | Katalog alata, Manim integracija, digitalsamba toolkit | Manim za math content, sync_timing.py |
| **reactvideoeditor/clippkit** | Text effects, audio waveforms, card components | Audio waveform vizualizacije |

**KLJUCNO:** Niko nema animated evolving diagrams. Svi imaju STATICNE dijagrame. To je nasa prilika.

### 3. Dodali u coding rules

Direktno u `remotion-coding-rules.md`:
- **Code Hike** — kad koristiti vs CodeBlockVisual (kod se menja kroz korake → Code Hike, snapshot koda → CodeBlockVisual)
- **Background muzika** — Music component sa fade in/out, volume hijerarhija (muzika = 0.10-0.15)
- **@remotion/preload** — preloadVideo/Audio/Image za smoother Studio preview

### 4. Probali da napravimo InteractiveDiagram komponentu

**Pokusaj 1:** Absolute positioning sa x/y koordinatama → elementi se preklapaju
**Pokusaj 2:** CSS Grid layout → elementi se ne preklapaju ALI linije i labele se preklapaju sa elementima
**Pokusaj 3:** Uklonili labele sa linija (voiceover objasnjava) → bolje ali i dalje boxovi
**Pokusaj 4:** Dodali razlicite tipove elemenata (icon-box, stat, progress-bar, score, code, card, status, mini-table) → radi ali je TEMPLATE pristup — hardkodirani tipovi

**ZAKLJUCAK: POGRESAN PRISTUP.** Pravili smo template komponentu sa fiksnim tipovima elemenata. To je ista stvar kao ServiceMesh/LogoGrid koje vec imamo — boxovi povezani linijama.

---

## STA ZAPRAVO TREBA DA NAPRAVIMO

### Poenta

**Agent generise CELU React komponentu od nule za svaki transcript.** Ne popunjava template, ne edituje postojeci fajl. Svaki put potpuno nova .tsx komponenta skrojena za taj konkretan tekst.

### Zasto

- Svaki transcript je drugaciji — ne mozes imati 1 template koji pokriva sve
- Element moze da bude BILO STA — ne samo ikona+label box
- AI napreduje brzo — generisanje koda ce biti sve bolje
- Ako je lose → regenerisi, ne popravljaj rucno
- Vremenom se gradi baza vizuala i pravila se poboljsavaju

### Kako treba da radi

```
KORAK 1: Agent cita transcript
KORAK 2: Agent PISE novu .tsx komponentu od nule
  - Bira KAKVI elementi trebaju (progress bar, score circle, code snippet, card, tabela, dijagram, STA GOD)
  - Bira KAKO se rasporedjuju (grid, flex, apsolutno — sta god najbolje izgleda)
  - Bira KAKO se animiraju (spring, interpolate, stagger)
  - Bira KADA se sta pojavljuje/menja (timeline iz voiceover timestamps)
  - MORA: nikad preklapanje, nas dizajn sistem (#0f0f1a, glass, glow, Inter/SF Mono)
  - MORA: progress prop (0-1), shapeMode (square/wide), fullScreen boolean
  - MORA: Remotion coding rules (useCurrentFrame, clamp, spring, itd)
KORAK 3: Preview u Remotion Studio
KORAK 4: Ako lose → regenerisi (ili user kaze sta da promeni)
KORAK 5: Drugi agent testira (screenshot → Gemini evaluacija)
```

### Dva rezima prikaza (ista komponenta)

```
FULL SCREEN: Zauzima ceo 1920x1080 ekran, sam na ekranu
  - Za objasnjenja koncepata, arhitekture, procese
  - Elementi evoluiraju dok voiceover prica
  - Moze da zameni 3-4 staticna vizuala

NODE MODE: Uklapa se u sticky sekciju kao ostali vizuali
  - Prima progress (0-1), shapeMode, accentColor
  - Manja verzija istog vizuala
```

### Tranzicija izmedju Canvas i Full Screen

Video moze da mesaje oba rezima:
- Canvas mode (sticky-ji) za korake/tutoriale
- Full Screen mode za konceptualna objasnjenja
- Tranzicija izmedju njih (fade/zoom)
- AI odlucuje kad sta

### Sta agent mora da zna (pravila)

1. **Nikad preklapanje** — CSS Grid ili Flexbox, ne absolute positioning
2. **Nas dizajn sistem** — component-skeleton.md boje, fontovi, padding
3. **Remotion API** — remotion-coding-rules.md (useCurrentFrame, clamp, spring, Img, delayRender)
4. **Progress prop** — 0 = prazan, 1 = sve prikazano, animacije se mapiraju na progress
5. **Voiceover ne treba labele na linijama** — strelica pokazuje smer, voiceover objasnjava
6. **Razliciti tipovi elemenata** — ne samo boxovi! Progress bar, score circle, code snippet, card, tabela, status dot, mini chart, STA GOD treba
7. **Timeline events** — appear, highlight, connect, eliminate — sinhronizovano sa voiceoverom

### Iterativni workflow

```
Agent generise → Preview → Nije OK? → "promeni X" ili "Refresh" → Agent regenerise → Hot reload
```

Editor (localhost:3002) dobija "Refresh Diagram" dugme. Correction skill zna da edituje generated komponentu.

---

## FAJLOVI NAPRAVLJENI OVU SESIJU

### Novi reference fajlovi (SACUVATI)
- `.claude/skills/remotion-motion/reference/remotion-coding-rules.md` — Remotion API pravila
- `.claude/skills/remotion-motion/reference/future-upgrades.md` — buduci upgrade-ovi iz community template-ova
- `docs/official-vs-our-skills-comparison.md` — kompletna razlika official vs nas

### Update-ovani fajlovi (SACUVATI)
- `.claude/skills/remotion-motion/SKILL.md` — dodati linkovi na nove reference fajlove
- `.claude/skills/visual-proposer/SKILL.md` — dodat link na remotion-coding-rules.md
- `.claude/skills/visual-proposer/reference/component-skeleton.md` — dodati Remotion API pravila sekcija

### Test fajlovi (MOGU SE OBRISATI — bili su za rucno testiranje)
- `templates/ai-video-gen-pipeline/src/visuals/InteractiveDiagram.tsx` — template pristup, POGRESAN ali timeline engine i animacije su OK za referencu
- `templates/ai-video-gen-pipeline/src/test-interactive-diagram.tsx` — test kompozicije
- Promene u `DynamicPipeline.tsx`, `Root.tsx`, `package.json` — dodati interactive-diagram support

### Pullovani community repoi (REFERENCA)
- `research/community-templates/claude-remotion-kickstart/`
- `research/community-templates/remotion-fireship/`
- `research/community-templates/template-code-hike/`
- `research/community-templates/claude-code-video-toolkit/`
- `research/community-templates/clippkit/`

---

## SLEDECI KORACI (sledeca sesija)

1. **Napraviti skill/agenta** koji generise .tsx komponentu od nule za transcript
   - Cita transcript
   - Bira tipove elemenata, raspored, animacije
   - Pise celu .tsx datoteku
   - Postuje pravila (dizajn sistem, Remotion API, nikad preklapanje)

2. **Testirati na 3 razlicita transcripta**
   - Serverless (vec imamo)
   - Kubernetes Scheduler (filtering/scoring proces)
   - Nesto potpuno drugacije (npr. database comparison, API flow)

3. **Napraviti evaluaciju** — drugi agent gleda output i ocenjuje
   - Screenshot → Gemini evaluacija
   - Ili self-eval sa pravilima

4. **Graditi bazu pravila** — iz svake iteracije ucimo sta radi a sta ne
   - "Nikad absolute positioning" — nauceno
   - "Labele na linijama se preklapaju" — nauceno
   - "Grid layout nikad ne preklapa" — nauceno

5. **Integracija u pipeline** — kad je komponenta dovoljno dobra:
   - Visual Router zna kad da koristi full screen vs canvas
   - Planner koordinira timing sa voiceoverom
   - Builder uklapa u video projekat

---

## GRILL-ME REZULTATI

Plan je prosao stress-test (score 7.5/10, READY TO BUILD):
- **Najveci rizik (70%):** Agent ne moze konzistentno da generise dobar timeline iz transcripta → RESENO faznim pristupom (prvo komponenta, pa agent)
- **Layout haos sa 8+ elemenata** → RESENO CSS Grid umesto absolute positioning
- **Full screen vs node mode kompromis** → Ista komponenta, razliciti container-i
- **Voiceover timing zavisnost** → Iterativni workflow (regenerisi ako lose)

## K8s Scheduler Test (poslednji koji je radio)

Ovaj test je pokazao da komponenta RADI sa razlicitim tipovima elemenata:
- icon-box (Pod, Scheduler)
- progress-bar (Node CPU usage)
- score (kruzici sa brojevima)
- stat (rezultat)
- status (pending indikator)

Timeline animacije rade: appear, highlight, connect, eliminate — SVE radi.
Problem je bio samo sto je to TEMPLATE pristup — treba GENERATOR pristup.
