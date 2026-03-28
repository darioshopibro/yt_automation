# YouTube Automation Plan

## Izabrani pristup: CLAUDE CODE + REMOTION

**Stack:** Claude Code ($20) + ElevenLabs ($22) + DaVinci (free)
**Cena:** ~$42/mo
bo**Vreme po videu:** 30-60 min
**Kvalitet:** Profesionalan (ByteMonk/Fireship stil - infografike, motion graphics)

**Workflow:** Vidi [ANIMATED-EXPLAINER-WORKFLOW.md](ANIMATED-EXPLAINER-WORKFLOW.md)

---

## TODO — Redosled: 1 → 2 → 3 → 4 → 5 → 6

### ⚡⚡⚡ #1 NAJBITNIJE: Rating Skill — Ocenjivanje vizuala i videa

**Problem:** Svaki put kad kažem "rate" ili "oceni" moram da objašnjavam šta da se ocenjuje i kako. Treba standardizovan skill.

**Šta treba:**
- [ ] Napraviti `rating` skill koji se triggeruje na "rate", "oceni", "score", "evaluate"
- [ ] Istražiti best practices za ocenjivanje vizuala/videa (web + YT research)
- [ ] Skill mora da zna ŠTA ocenjuje (vizual, ceo video, routing odluke, animacije...)
- [ ] Standardne kategorije za ocenu:
  - **Logika:** Da li je pravi vizual izabran za taj content?
  - **Variety:** Koliko različitih vizuala, da li se ponavljaju?
  - **Composition:** Shape match, weight balance, density
  - **Readability:** Da li se tekst čita, font size, kontrast
  - **Animation:** Da li animacije prate govor, timing
  - **Overall:** Ukupna ocena 1-10
- [ ] Output: strukturiran JSON sa ocenama + tekstualnim komentarima
- [ ] Čuva ocene u fajlu za tracking (koji video koliko, trend poboljšanja)
- [ ] Može da poredi: "ovo je bolje od prošlog puta jer..."
- [ ] **Integracija sa grill-me:** Posle svakog grill-me kad se napravi plan, automatski pokreni rating skill/agenta koji:
  - Oceni plan prema kategorijama
  - Ispiše šta ne valja i listu TODO stavki za popravku
  - Predloži konkretne fixeve pre nego što se krene sa implementacijom
  - Ovo sprečava da se implementira loš plan bez provere

### ⚡ NOVI VIZUALI — Messaging + Brainstorm

**Messaging vizuali:**
- [ ] WhatsApp poruka vizual — message bubble sa avatar, timestamp, zelena tema
- [ ] Telegram poruka vizual — plavi bubble, channel stil
- [ ] Slack poruka vizual — thread format sa avatar + username + timestamp
- [ ] Discord poruka vizual — dark tema, embed cards
- [ ] Email vizual — inbox preview sa subject, from, snippet
- [ ] SMS/iMessage vizual — sivi/plavi bubbles
- [ ] Notifikacija vizual — push notification card (iOS/Android stil)
- [ ] Generic chat vizual — conversation flow sa 2+ učesnika

**Razmisliti o još vizualima (brainstorm):**
- [ ] Browser/URL vizual — address bar + web page preview
- [ ] Dashboard vizual — metrike u grid-u sa sparklines
- [ ] Kanban board vizual — kolone sa karticama (Trello/Jira stil)
- [ ] File explorer vizual — folder structure sa ikonama fajlova
- [ ] API request/response vizual — method + URL + body + response
- [ ] Git diff vizual — zeleno/crveno linije (added/removed)
- [ ] Error/Warning vizual — crveni/žuti alert box sa stack trace
- [ ] Pricing table vizual — Free/Pro/Enterprise kolone
- [ ] Testimonial/Quote vizual — avatar + citat + ime
- [ ] Flowchart vizual — decision diamond + boxes sa strelicama
- [ ] Annotated screenshot vizual — slika sa labelama i strelicama

### ✅ #0 DONE: Sve sekcije u projektu ISTE VISINE

**Urađeno** — globalMaxSectionHeight radi, sekcije su alignovane.

### ✅ #1 DONE: Slobodan broj sekcija + linearni layout

**Urađeno:**
- [x] Uklonjen limit "idealno 2 sekcije" — sada koliko god transcript zahteva (1-5+)
- [x] Uklonjen "max 3 sekcije" i "Greška 2: 3 sekcije" pravilo
- [x] Direction UVEK "right" — linearno levo→desno, nema grid, nema below
- [x] Kinetic nije obavezan na kraju — prioritetno za PRVI sticky ako nema vizual (animacija odmah od starta)
- [x] composition-rules.md — sva rigidna ograničenja skinuta
- [x] visual-generator.md — slobodan broj sticky-ja i sekcija
- [x] visual-validator.md — nove validacije bez rigidnih limita
- [x] extraction-rules.md — kinetic pravila ažurirana
- [x] DynamicPipeline.tsx — sekcije linearno umesto clockwise grid (template + svih 12 video projekata)

### ✅ #2 DONE: Visual Proposal Agent

**Urađeno** — `visual-proposer` skill napravljen (`.claude/skills/visual-proposer/`). Agent čita transcript, predlaže nove vizuale, generiše React komponente.

---

### ✅ #1 DONE: Visual Router — 1 skill + 2 agenta

**Urađeno:**
- [x] Visual Router skill — `.claude/skills/remotion-visual-router/SKILL.md`
- [x] visual-generator agent — `.claude/agents/visual-generator.md` (segmentira transcript, bira vizuale, grupiše u sticky-je)
- [x] visual-validator agent — `.claude/agents/visual-validator.md` (validira composition, shape, variety)
- [x] Composition rules, extraction rules, visual catalog — reference fajlovi

**LATER — Razbijanje u sub-agente (ako bude potrebno):**
- [ ] Opcija A: 1 orchestrator skill → 3 sub-agenta (Segmenter, Extractor, Composer)
- [ ] Opcija B: Agent SDK programatski pipeline
- [ ] NE IMPLEMENTIRATI BEZ PLANA — plan mode diskusija kad dođe vreme

### FAZA 1: Korekcije workflow ✅ DONE

**1A: AI Correction Skill** ✅
- [x] remotion-correction skill — čita/menja dynamic-config.json, auto-backup

**1B: Visual Editor** ✅
- [x] React app (localhost:3002) — Figma-style canvas, icon picker, color picker, layout strip, inline editing, live preview

**1C: Auto-backup** ✅ (parcijalno)
- [x] Auto-backup pre svake AI korekcije
- [ ] 1C.2 Rollback komanda — "vrati na verziju 3"

**1D: Voice korekcije** ✅
- [x] Regenerate full voiceover (ElevenLabs)
- [x] Splice segment
- [x] Editor integration (player, transcript, voice picker)

### FAZA 2: Novi vizuali ✅ DONE
- [x] 2.1 Table vizual — `src/visuals/TableVisual.tsx`
- [x] 2.2 Code Block vizual — `src/visuals/CodeBlockVisual.tsx`
- [x] 2.3 Terminal vizual — `src/visuals/TerminalVisual.tsx`
- [x] 2.4 List/Bullets vizual — `src/visuals/ListVisual.tsx`
- [x] 2.5 Logo Grid vizual — `src/visuals/LogoGridVisual.tsx`
- [x] 2.6 Timeline vizual — `src/visuals/TimelineVisual.tsx`
- [x] 2.7 Bar/Line charts — `src/visuals/BarChartVisual.tsx`
- [x] 2.8 Pie/Donut charts — `src/visuals/PieChartVisual.tsx`
- [x] 2.9 Split Screen (VS wrapper) — `src/visuals/SplitScreenVisual.tsx`
- [x] 2.10 Stats/Counter — `src/visuals/StatsVisual.tsx`
- [x] 2.11 Process Steps — `src/visuals/ProcessStepsVisual.tsx`
- [x] 2.12 Hierarchy/Tree — `src/visuals/HierarchyVisual.tsx`
- [x] 2.13 Kinetic Typography — `src/visuals/KineticTypography.tsx`
- [x] Svi imaju `shapeMode?: "square" | "wide"` prop
- [x] Visual type routing u DynamicPipeline (switch na visualType)
- [x] Visuals Preview page (localhost:3002 → Visuals tab)

### FAZA 3: Kompozitni vizuali ✅ DONE
- [x] 3.1 Vizual kao node — sekcija ima ILI ikone ILI vizual (visualType field)
- [x] 3.2 Shape Mode System — square/wide, getStickyShapeMode(), propagacija

### FAZA 4: Vizual Routing ✅ DONE
- [x] 4.1 Visual Router skill — `.claude/skills/remotion-visual-router/SKILL.md`
- [x] 4.2 Composition rules — `reference/composition-rules.md` (8 kategorija pravila)
- [x] 4.3 Extraction rules — `reference/extraction-rules.md` (shape-mode limits)
- [x] 4.4 Examples — `reference/examples.md` (3 primera sa composition analysis)
- [x] 4.5 Planner integracija — planner čita visual-structure.json
- [x] 4.6 Orchestrator update — Router → Planner → Builder workflow u remotion-motion

### FAZA 5: Research & Content Pipeline ✅ DONE (core)

**Urađeno:**
- [x] 5.1 YT niša monitoring — 7 izvora (YT 11 kanala, Reddit 4 suba, HN, GitHub, Dev.to, News RSS, Google Trends)
- [x] 5.2 Video scoring — LLM topic clustering + engagement × freshness × opportunity formula
- [x] 5.3 Transcript extraction — yt-dlp + transcript.py per-video
- [x] 5.4 Content processing — angle detection (gap analysis) → script writing (Fireship 5min) → plagiarism check (<30%)
- [x] 5.5 User review — Telegram bot (@yt_scanner_agent_bot) sa inline buttons + Dashboard Research tab
- [x] 5.6 Adaptive Learning — uči iz approve/reject odluka, cold start (20 decisions)
- [x] 5.7 Self-Improvement Engine — skenira trendove za unapređenje celog projekta
- [x] 5.8 Script variety — gleda prethodnih 5 skripti, ne ponavlja iste patterne/primere
- [x] 5.9 Auto-update dictionary — nepoznati acronymi se automatski dodaju u tech-terms-dictionary.json
- [x] 5.10 Topic history — detektuje slične već obrađene teme, prikazuje ⚠️ warning
- [x] 5.11 TTS optimizacija — prompt (stil) + preprocess-tts.py (tehnika) razdvojeni, 200+ tech termina

**Lokacija:** `tools/content-pipeline/`
**Plan:** `.claude/plans/nested-wobbling-hartmanis.md`

**Preostalo za FAZU 5:**

**🔴 HIGH PRIORITY:**
- [ ] 5.12 Cron setup — daily automatski scan u 8:00 (Claude Code scheduled trigger)
- [ ] 5.13 Telegram always-on (PM2) — bot sluša non-stop, ne samo kad pokrenemo poll
- [ ] 5.14 Rewrite feedback buttons — kad klikneš Rewrite, iskočE dugmad "šta ti se nije svidelo?" (hook, primeri, struktura, analogija, predugačko) pa generiše novu skriptu na osnovu feedback-a
- [ ] 5.15 Visual Proposer integracija — kad sistem obradi temu, prepozna gde može novi vizual i predloži/generiše (spoj sa postojećim `.claude/skills/visual-proposer/`, ne praviti ponovo)
- [ ] 5.16 research.py batch transcript fix — transcripti prazni u batch modu, radi samo per-video

**🟡 MEDIUM PRIORITY:**
- [ ] 5.17 Dashboard testiranje — otvoriti localhost:3002, proveriti Research tab radi
- [ ] 5.18 Channel average caching — računati pravi prosek views-a po kanalu (weekly refresh)
- [ ] 5.19 Script dužina testiranje — testirati novu 5-min / 750-850 word skriptu
- [ ] 5.20 Duplicate detection — ako pipeline radi 2x isti dan, ne duplira teme

**🟢 LOW PRIORITY / LATER:**
- [ ] 5.21 TikTok scanner — yt-dlp za TikTok tech kanale
- [ ] 5.22 Dashboard filters/search — filter po statusu, search po nazivu
- [ ] 5.23 Error monitoring — lepši prikaz kad scanner failuje, retry logic
- [ ] 5.24 Telegram Channels istraživanje — Claude Code native Telegram integracija umesto polling

### FAZA 6: Branding skill ✅ DONE
- [x] 6.1 Brand config — `brands/default/brand.json` (boje, font, logo, style, glass, intro/outro)
- [x] 6.2 Template theming — DynamicPipeline čita brand (theme objekat, fontovi, glass, borders)
- [x] 6.3 Brand API — server endpoints (CRUD + upload)
- [x] 6.4 Branding Page — editor tab sa full demo flow koji čita brand boje
- [x] 6.5 Branding Skill — `.claude/skills/branding/SKILL.md`
- [ ] 6.6 Per-project override — različiti brendovi za različite projekte
- [ ] 6.7 Multi-template support

### Editor poboljšanja
- [x] Visuals tab — preview svih vizuala + combination matrix
- [x] Branding tab — brand editor sa live preview
- [ ] Sticky direction control — picker za right/below/left
- [ ] Visual type picker na sekciji — zamena ikona sa vizualom
- [ ] Editor za svaki visual type (table editor, code editor, list editor)
- [ ] Više icon library-ja — react-icons (40k+)
- [ ] **Per-visual settings panel u editoru** — kad klikneš na vizual, otvori se settings:
  - Animacija: on/off, tip animacije (fade-in, stagger, typing), brzina
  - Display: koliko itema prikazati, koji deo highlightovati
  - Layout: shapeMode override (square/wide), alignment
  - Content: edit tekst, dodaj/obriši stavke, promeni vrednosti
  - Primer za Table: edit headers, dodaj red, obriši kolonu, promeni highlight
  - Primer za Code Block: promeni language, edit code, toggle line numbers
  - Primer za List: dodaj stavku, promeni stil (bullet/numbered/checklist)
  - Primer za Stats: promeni value, dodaj subtitle, promeni boju
  - SVE ovo mora da se save-uje nazad u dynamic-config.json

### Video Transcript Overlay ✅ DONE
- [x] **Transcript prati glas** — karaoke-stil overlay na dnu ekrana
  - Reč po reč highlight u accent boji sa glow efektom
  - Koristi ElevenLabs word timestamps za sinhronizaciju
  - Brand boje (accent za aktivnu reč, text za prošle, textMuted za buduće)
  - `transcriptWords` polje u dynamic-config.json

### Animacije za vizualne komponente ⚡ BITNO
- [ ] Svaki vizual treba svoju animaciju:
  - **Table:** red po red reveal (fade-in od vrha ka dnu)
  - **Code Block:** typing animacija (karakter po karakter ili linija po linija)
  - **Terminal:** komanda typing → output fade-in → sledeća komanda
  - **List:** stavka po stavka sa stagger delay
  - **Bar Chart:** barovi rastu od 0 do vrednosti
  - **Pie Chart:** segmenti se popunjavaju jedan po jedan
  - **Stats:** count-up animacija (0 → 10M+)
  - **Timeline:** tačke se pojavljuju levo→desno (ili gore→dole)
  - **Process Steps:** korak po korak sa checkmark animacijom
  - **Logo Grid:** pop-in sa stagger
  - **Hierarchy:** branch expansion od root-a
  - **Split Screen:** leva strana → divider → desna strana
  - **Kinetic:** word-by-word reveal (već postoji u reveal modu)
- [x] `progress` prop (0-1) koji kontroliše animaciju — ✅ VEĆ IMPLEMENTIRANO (DynamicPipeline linija 1624-1658)
- [x] Progress se računa automatski: 0 na section.startFrame → 1 na sledeći startFrame
- [x] Prosleđuje se svakom vizualu koji ga koristi za reveal (list stavke, table redovi, timeline tačke, bar rast)
- [ ] Animacije moraju biti opcione (editor settings: animacija on/off)
- [ ] **BONUS — Word-level sync** (nice to have, NIJE prioritet):
  - Umesto ravnomernog progress-a, svaka stavka se pojavi kad voiceover izgovori ključnu reč
  - Zahteva: word timestamps (imamo od ElevenLabs) + mapiranje reči na vizual stavke
  - Problem: komplikovano mapiranje, edge cases (reč se ne poklapa sa stavkom)
  - Trenutni ravnomerni progress je dovoljno dobar za 90% slučajeva
- [x] **Code Block typing animacija** — ✅ karakter po karakter sa blinking cursor
- [x] **Stats count-up** — ✅ broj raste od 0 sa ease-out (1.8x speed)
- [x] **Terminal typing** — ✅ komanda se kuca, output fade-in posle
- [x] **Bar Chart ease-out** — ✅ barovi se popune u prvih 66% trajanja
- [x] **Pie Chart ease-out** — ✅ segmenti isto brzo sa cubic ease-out

### 2D Positioning & Camera ✅ DONE
- [x] Sticky 2D positioning — direction: right/below/left
- [x] Camera group focus — za VS/bidirectional
- [x] Direction-aware laser lines između sticky-ja
- [x] 2D bounding box overview

### Pipeline Architecture ✅ DONE
- [x] Router → Planner → Builder workflow (remotion-motion orchestrator)
- [x] Planner prihvata visual-structure.json od Routera

### FAZA 8: Skill & Agent Optimizacija ⚡
- [ ] **Razdvajanje planner/executor pattern** — planning agenti planiraju i pišu plan negde, execution agenti samo izvršavaju
  - Primer: Visual Router PLANIRA strukturu → piše visual-structure.json → Builder ČITA i izvršava
  - Planner PLANIRA timing/camera → piše master-plan.json → Builder ČITA i izvršava
  - Nijedan agent ne radi oba — jasna separacija
- [ ] **Sub-agent decomposition** — razbiti velike skillove na manje specijalizovane agente:
  - Visual Router mogući sub-agenti: Segmenter (deli transcript), Detector (bira vizual), Extractor (vadi podatke), Composer (grupiše u sticky-je)
  - Planner mogući sub-agenti: Timer (računa frameove), Camera (generiše keyframes), Sound (postavlja zvukove)
  - Svaki sub-agent je fokusiran i može se testirati nezavisno
- [ ] **Prompt optimizacija** — skillovi su trenutno dugački MD fajlovi, treba:
  - Izmeriti koliko tokena svaki skill troši
  - Identifikovati šta je redundantno ili predugačko
  - Reference fajlovi vs inline — šta u SKILL.md a šta u reference/
  - Testirati: da li kraći prompt daje isti kvalitet?
- [ ] **Paralelizacija** — šta može da radi istovremeno:
  - Voiceover generisanje (ElevenLabs API) + Visual routing (AI) = mogu paralelno
  - Icon search (batch_icons.py) za sve sekcije odjednom umesto jedna po jedna
  - Multiple sub-agenti za različite sticky-je paralelno
- [ ] **Caching** — da ne radimo isti posao dva puta:
  - Ako se transcript ne menja, ne regeneriši voiceover
  - Ako se vizualna struktura ne menja, ne regeneriši config
  - Icon search cache — jednom nađena ikona se pamti
- [ ] **Testirati sa Claude Agent SDK** — da li možemo koristiti programatski agents umesto skillova?
  - Skills su MD fajlovi koje Claude čita — ograničeni
  - Agent SDK omogućava Python/TypeScript agente sa alatima — moćnije
  - Hibrid: orchestrator u Agent SDK, skills za instrukcije
- [ ] **Validation Agent — odvojen agent koji samo validira outpute** (SAMO IDEJA — istražiti)
  - Trenutno: svaki skill ima svoju validaciju inline (checklist na kraju SKILL.md)
  - Problem: validacija je deo istog prompta → troši tokene, skill postaje dugačak
  - Ideja: izbaciti validaciju iz skillova, napraviti JEDAN validation agent koji:
    - Prima output bilo kog skill-a (visual-structure.json, master-plan.json, dynamic-config.json)
    - Proveri prema pravilima (composition-rules, extraction-rules, timing rules)
    - Vrati PASS ili lista grešaka sa predlogom fixa
    - Skill koji je generisao output popravi na osnovu feedback-a
  - Prednosti: skillovi postaju kraći i fokusiraniji, validacija je centralizovana i konzistentna
  - Pitanja za istraživanje:
    - Da li je bolje inline validacija ili odvojen agent?
    - Koliko tokena štedimo ako izbacimo validaciju iz skillova?
    - Da li validation agent može da radi i kao "quality gate" pre buildera?
    - Može li isti validator da proverava i editor promene (ne samo agent output)?

### FAZA 7: Self-Learning / Feedback Loop ⚡ JAKO BITNO
- [ ] 7.1 Kad user menja nešto u editoru (layout, vizual, sekciju) — loguj promenu sa razlogom
  - Primer: user promeni "flow" u "vs" → zapisati: `{ from: "flow", to: "vs", section: "CI Pipeline", reason: "user_manual_change" }`
  - Ovo se čuva u nekom feedback.json ili log fajlu
- [ ] 7.2 Agent uči iz ovih promena — pre generisanja novog videa, pročita prethodne feedback-ove
  - Ako je user 3× promenio flow u vs za comparison sekcije → agent zna da za comparison koristi vs
  - Ako user uvek skraćuje liste na 3 stavke → agent zna da ne stavlja 5
- [ ] 7.3 "Zašto si ovo promenio?" prompt — kad user promeni nešto, editor opciono pita zašto
  - User može da skip-uje ili napiše razlog ("previše stavki", "loša ikona", "ne treba ovaj vizual")
  - Ovo je najvredniji signal za učenje
- [ ] 7.4 Feedback se prosleđuje Visual Router-u — router čita feedback pre generisanja
  - Akumulirani feedback = bolje odluke = manje ručnih promena = self-improving system

### FAZA 9: Face/Character Vizuali
- [ ] 9.1 Poznate face — vizuali sa licima poznatih tech ljudi (Zuckerberg, Elon, Trump, Bezos, itd.)
  - Pixel art ili cartoon stil (ne realne fotke — copyright)
  - Ili koristi AI generisane avatare u konzistentnom stilu
- [ ] 9.2 Animirani karakteri — face vizuali sa animacijom (govor, reakcije, emoji)
  - Npr. kad transcript pominje "Elon said..." → pojavi se Elon avatar sa speech bubble
  - Hostovi/naratori — custom avatar za kanal koji se pojavljuje kao "voditelj"
- [ ] 9.3 Face + Quote combo — lice sa citatom pored (split: lice levo, citat desno)
- [ ] 9.4 Reaction vizual — 2-3 face-a sa reakcijama (thumbs up/down, shocked, happy)
  - Za "the community reacted..." ili "developers love/hate this" momente
- [ ] 9.5 Integracija u Visual Router — kad transcript pominje poznatu osobu → predloži face vizual

### FAZA 10: Video & GIF Vizuali 🎬
- [ ] **Video/GIF kao vizual** — umesto statičnih komponenti, ubaciti kratke video klipove ili GIF-ove kao vizualne elemente
  - Primer: za "Docker container" sekciju → kratki GIF animacije kontejnera
  - Remotion podržava `<Video>` i `<Img>` (za GIF) — treba integrisati u visual pipeline
  - Potrebno: library kratkih klipova ili generisanje pomoću AI (Runway, Pika, itd.)
  - Asset management: gde se čuvaju, kako se referenciraju u config-u

### FAZA 11: Website/App Screen Vizuali 🌐
- [ ] **Prepoznatljivi sajtovi kao vizuali** — kad transcript pominje Google, YouTube, ChatGPT, Claude, itd.
  - Google search bar — kucanje query-ja + rezultati
  - YouTube search/player — kucanje, rezultati, video player
  - ChatGPT/Claude interface — kucanje prompta, typing animacija odgovora
  - GitHub repo page, npm install, terminal commands
  - Browser chrome (URL bar, tabs) oko sajta za realizam
- [ ] **Integracija u Visual Router** — kad transcript pominje poznati sajt/app → automatski predloži screen vizual
- [ ] **Customizable** — user može menjati tekst koji se kuca, rezultate koji se prikazuju
- [ ] Koristiti stvarne dizajne sajtova (screenshot-based ili CSS replika)

### FAZA 12: Custom AI-Generated Vizuali (na osnovu transkripta) 🤖
- [ ] **Visual Proposer agent** — ovo VEĆ POSTOJI kao koncept (videti FAZA 0 gore)
  - Agent čita transcript → predlaže 2-3 NOVA vizuala koja ne postoje u biblioteci
  - Agent GENERIŠE React komponente za svaki predloženi vizual
  - User review → approve/reject → approved vizuali idu u `src/visuals/`
- [ ] **Interactive flow** — AI pita usera za vizuale TOKOM pipeline-a:
  - Posle Visual Router-a, pre Planner-a: "Za ovu sekciju nemam dobar vizual. Predlažem: [X]. OK?"
  - User kaže OK → AI generiše komponentu → nastavlja pipeline
  - User kaže NE → AI predloži alternativu ili user opiše šta želi
- [ ] **Vizual gap detection** — automatski detektuje sekcije gde postojeći vizuali ne pokrivaju dobro
  - "Ova sekcija priča o X ali nemamo vizual za to" → predloži kreiranje
- [ ] Ovo je KLJUČNO za skaliranje — ne možemo ručno praviti vizual za svaki mogući topic

### FAZA 10: Vertical Format (Reels/Shorts) Template
- [ ] Napraviti NOVI template za vertikalni format (1080x1920 umesto 1920x1080)
- [ ] Sticky-ji idu vertikalno (gore → dole) umesto horizontalno
- [ ] Sekcije stack-ovane vertikalno — jedna ispod druge
- [ ] Camera panuje gore→dole umesto levo→desno
- [ ] Kraći content — 30-60 sekundi, max 2-3 sticky-ja
- [ ] Isti vizuali (code-block, table, list...) ali prilagođeni vertikalnom formatu
- [ ] Planner/Builder automatski biraju format na osnovu: "video" = horizontal, "reel" = vertical
- [ ] Paralelno generisanje — iz ISTOG transcripta napravi i video I reel verziju
- [ ] Reel verzija = skraćeni transcript (highlights only) + vertical template

### CLEANUP (kad stignemo)
- [ ] Obriši nepotrebne test foldere (test-output/*, test-sticky-1, etc.)
- [ ] Obriši backup fajlove (.backup.md)
- [ ] Očisti root MD fajlove — konsoliduj/obriši zastarele docs
- [ ] Obriši stare template-ove koji se više ne koriste



---

## Niša Info

**Tema:** Tech/Developer content (Fireship stil) - AI, automation, ali i šire tech teme, developer tools, frameworks, itd.
**Stil:** ByteMonk/Fireship stil (infografike, motion graphics, brz pacing)
**Dužina:** 2-3 min
**Target:** US/UK publika (visok CPM $8-15)

**Monetizacija:**
- YouTube AdSense
- Fiverr usluge
- Potencijalno kursevi

---

## Kanali za analizu

### Uspešni (zašto rade):
| Kanal | Subs | Zašto radi |
|-------|------|------------|
| **ByteMonk** | - | Infografike, motion graphics, faceless, brz pacing |
| **Fireship** | 4.13M | Brz pacing, humor, memes, code snippets |
| **Two Minute Papers** | 1.74M | AI papers objašnjeni kratko, animacije, humor |
| **3Blue1Brown** | 8.2M | Animirani math/ML explainers, vizualno genijalno |
| **Jeff Su** | 1.66M | Animated explainers, 4M views |

**Zašto uspevaju:**
- Human creativity + AI kao alat (ne zamena)
- Jasan niche
- Kvalitet > kvantitet
- Genuine value (naučiš nešto)
- Konzistentan stil
- Infografike + motion graphics (NE karakteri)

### Neuspešni (zašto NE rade):
**YouTube crackdown Jan 2026** - masovno gašenje AI kanala

**Zašto propadaju:**
1. **AI slop** - template content, nema ljudske kreativnosti
2. **Upload flooding** - previše videa dnevno, nema kvaliteta
3. **Set & forget** - misle da AI radi sve sam
4. **Nema sistema** - random content bez strategije
5. **Copyright problemi** - AI muzika, recikliran footage

**YouTube policy:**
- AI kao alat = OK
- AI kao zamena za kreativnost = BAN

---

## Plan 2: Fiverr Ad (later)
- Napraviti Fiverr gig za OpenClaw setup
- Ili Claude Code konsultacije/setup
- Ad/promo video za privlačenje klijenata

---

## Dokumentacija

- [ANIMATED-EXPLAINER-WORKFLOW.md](ANIMATED-EXPLAINER-WORKFLOW.md) - Detaljan workflow
- [AI-VIDEO-TOOLS-RESEARCH.md](AI-VIDEO-TOOLS-RESEARCH.md) - Research svih tools
- [VIDEO-QUALITY-RULES.md](VIDEO-QUALITY-RULES.md) - Anti-AI-slop pravila
- [YT-MONETIZATION-STRATEGY.md](YT-MONETIZATION-STRATEGY.md) - CPM strategija
