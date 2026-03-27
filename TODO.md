# YouTube Automation Plan

## Izabrani pristup: CLAUDE CODE + REMOTION

**Stack:** Claude Code ($20) + ElevenLabs ($22) + DaVinci (free)
**Cena:** ~$42/mo
bo**Vreme po videu:** 30-60 min
**Kvalitet:** Profesionalan (ByteMonk/Fireship stil - infografike, motion graphics)

**Workflow:** Vidi [ANIMATED-EXPLAINER-WORKFLOW.md](ANIMATED-EXPLAINER-WORKFLOW.md)

---

## TODO — Redosled: 1 → 2 → 3 → 4 → 5 → 6

### ⚡ #2 PRIORITET: Visual Proposal Agent — Predlaže NOVE vizuale po transcriptu

**Ideja:** Pre nego što uopšte koristimo postojeće vizuale, agent čita transcript i PREDLAŽE koje NOVE vizuale bi bile dobre za taj specifičan content. Ovo je iterativan proces koji stalno generiše nove vizuale dok radimo.

**Workflow:**
```
1. Agent dobije transcript
2. Analizira sadržaj — o čemu se radi, koji elementi su specifični
3. Predloži 2-3 NOVA vizuala koja ne postoje a bila bi savršena za ovaj content
   - Npr. za Kubernetes transcript: "Cluster Diagram vizual" sa nodovima i podovima
   - Npr. za CI/CD: "Pipeline Stage vizual" sa fazama i gatovima
4. Agent GENERIŠE te vizuale (React komponente) — basic verzija
5. Otvori preview na portu — user vidi kako izgledaju
6. User edituje/approve-uje u editoru
7. Vizuali se dodaju u biblioteku za buduće videe
8. Nastavi sa ostatkom pipeline-a (routing, planning, building)
```

**Self-evaluation petlja:**
- Agent napravi vizual → sam ga oceni (1-10)
- Ako ocena < 7 → proba ponovo sa drugačijim pristupom
- Posle 2-3 pokušaja → prikaže najbolji user-u
- Na osnovu user feedback-a uči šta radi a šta ne

**Zašto je ovo #0:**
- Svaki put kad radimo video, potencijalno dobijamo NOVE vizuale
- Biblioteka vizuala RASTE sa svakim projektom
- Vizuali postaju SVE specifičniji i bolji za tech content
- Umesto da imamo 13 generic vizuala, imamo 50+ specijalizovanih

**Implementacija:**
- [ ] Napraviti `visual-proposer` skill/agent koji čita transcript i predlaže nove vizuale
- [ ] Agent generiše React komponentu za svaki predloženi vizual
- [ ] Preview na localhost portu za user review
- [ ] Self-evaluation: agent oceni svaki vizual pre prikazivanja
- [ ] Approved vizuali se dodaju u `src/visuals/` biblioteku
- [ ] Visual Router se automatski ažurira sa novim vizualima

---

### ⚡ #1 PRIORITET: Agent Arhitektura za Visual Router

**Problem:** Trenutni Visual Router je 1 skill sa 1787 linija pravila. Agent zaboravi pravila dok generiše. Rezultat: 4 od 4 testova imaju greške (previše ikona, fali table za poređenje, 4 sekcije umesto 2-3).

**Rešenje:** Razbiti na fokusirane agente. Ali MORA se pažljivo isplanirati:

- [ ] **Istražiti:** Mogu li sub-agenti da pozivaju skillove? Ili agenti imaju agente?
- [ ] **Istražiti:** Šta je bolje — 1 skill sa 3 sub-agenta, ili 3 skilla, ili main skill + 3 agenta sa svojim skilovima?
- [ ] **Definisati pipeline:**
  ```
  Opcija A: 1 orchestrator skill → 3 sub-agenta (svaki čita samo svoja pravila)
    Agent A (Segmenter): transcript → segmenti + vizual tipovi
    Agent B (Extractor): segmenti → visualData (paralelizovati po segmentima?)
    Agent C (Composer): sekcije → sticky-ji + composition validation

  Opcija B: Main skill → 3 agenta → svaki agent ima SVOJ skill
    remotion-segmenter skill → Agent A
    remotion-extractor skill → Agent B
    remotion-composer skill → Agent C

  Opcija C: Agent SDK programatski pipeline
    Python/TS kod orkestrira sve, poziva Claude API per-step
  ```
- [ ] **Ključna pitanja za plan mode:**
  - Koliko pravila svaki agent treba? (target: max 300 linija)
  - Šta se deli između agenata? (transcript, ikone, boje)
  - Kako se sprečavaju duplikati ikona kad B agenti rade paralelno?
  - Gde se čuva intermediate state? (fajl? memorija?)
  - Kako validation radi — odvojen agent ili deo Composer-a?
- [ ] **NE IMPLEMENTIRATI BEZ PLANA** — ovo mora plan mode diskusija jer ako se zajebemo moramo da refaktorišemo SVE

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

### FAZA 3: Kompozitni vizuali ✅ PARTIALLY DONE
- [x] 3.1 Vizual kao node — sekcija ima ILI ikone ILI vizual (visualType field)
- [x] 3.2 Shape Mode System — square/wide, getStickyShapeMode(), propagacija
- [ ] 3.3 ExplainerLayout shapeMode — 4 ikone clockwise u square modu (NIJE IMPLEMENTIRANO)
- [ ] 3.4 Template sizing fine-tuning — vizuali se ne uklapaju savršeno (ČEKA ROUTER FIX)

### FAZA 4: Vizual Routing ✅ DONE (skill napravljen, pravila definisana)
- [x] 4.1 Visual Router skill — `.claude/skills/remotion-visual-router/SKILL.md`
- [x] 4.2 Composition rules — `reference/composition-rules.md` (8 kategorija pravila)
- [x] 4.3 Extraction rules — `reference/extraction-rules.md` (shape-mode limits)
- [x] 4.4 Examples — `reference/examples.md` (3 primera sa composition analysis)
- [ ] 4.5 Planner integracija — planner prihvata visual-structure.json od routera
- [ ] 4.6 Orchestrator update — Router → Planner → Builder workflow
- [ ] 4.7 Full pipeline test sa ElevenLabs voiceoverom

### FAZA 5: Research & Content Pipeline
- [ ] 5.1 YT niša monitoring — prati kanale, nalazi videe koji performuju
- [ ] 5.2 Video scoring — ranira po views/engagement/relevance
- [ ] 5.3 Transcript extraction — skida i čisti transcript
- [ ] 5.4 Content processing — preformuliše u originalan tekst (NE plagijat)
- [ ] 5.5 User review — prikazuje kandidate, user bira/odobrava

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
- [ ] Svaka animacija mora da se sinhronizuje sa voiceover timestamps
- [ ] `progress` prop (0-1) koji kontroliše animaciju — Remotion ga vezuje za frame
- [ ] Animacije moraju biti opcione (editor settings: animacija on/off)

### 2D Positioning & Camera ✅ PARTIALLY DONE
- [x] Sticky 2D positioning — direction: right/below/left
- [x] Camera group focus — za VS/bidirectional
- [x] Direction-aware laser lines između sticky-ja
- [x] 2D bounding box overview
- [ ] Camera testiranje sa pravim voiceoverom
- [ ] Branch/merge laser varijante

### Pipeline Architecture
- [ ] **Razmisliti o multi-agent pipeline** — da li Visual Router, Planner, Builder mogu da rade paralelno ili moraju sekvencijalno?
  - Trenutno: Router → Planner → Builder (sekvencijalno)
  - Moguće: Router + Voiceover generisanje paralelno, pa Planner spoji
  - Razmisliti o sub-agentima: jedan za segmentaciju, jedan za ekstrakciju, jedan za ikone
- [ ] Planner mora da prihvata visual-structure.json od Routera
- [ ] Orchestrator (remotion-motion) update: Router → Planner → Builder
- [ ] Full pipeline test: transcript → voiceover → visual structure → timing → render
- [ ] Error handling: šta kad router ne može da odredi vizual? Šta kad planner nema timestamps?

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
