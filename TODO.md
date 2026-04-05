# YouTube Automation Plan

## Izabrani pristup: CLAUDE CODE + REMOTION

**Stack:** Claude Code ($20) + ElevenLabs ($22) + DaVinci (free)
**Cena:** ~$42/mo
bo**Vreme po videu:** 30-60 min
**Kvalitet:** Profesionalan (ByteMonk/Fireship stil - infografike, motion graphics)

**Workflow:** Vidi [ANIMATED-EXPLAINER-WORKFLOW.md](ANIMATED-EXPLAINER-WORKFLOW.md)

---

## TODO — Redosled: 1 → 2 → 3 → 4 → 5 → 6

### ⚡⚡⚡⚡ #1 NAJBITNIJE: Multi-Variant Generation + Editor za Biranje

**Problem:** Trenutno se generiše JEDNA verzija vizuala/videa i ili prihvatam ili odbacujem. Nema izbora, nema poređenja. Trebam moći da vidim više varijanti i izaberem najbolju.

**Šta treba — MULTI-VARIANT GENERATION:**
- [ ] Kad se generiše vizual (visual-generator), generiši 3-5 varijanti istog vizuala
- [ ] Svaka varijanta koristi drugačiji stil/layout/pristup (npr. razlike u boji, rasporedu, animaciji, tipografiji)
- [ ] Varijante se čuvaju u `videos/{project-name}/variants/` kao zasebni fajlovi
- [ ] Isto važi za cele segmente videa — više opcija za isti deo

**Šta treba — VARIANT EDITOR (UI):**
- [ ] Editor prikazuje varijante uporedo (side-by-side ili carousel)
- [ ] Mogu da izaberem "ova varijanta za ovaj segment" — mix & match
- [ ] Finalni video se sklapa od izabranih varijanti
- [ ] Opciono: "regeneriši ovu varijantu sa ovim feedback-om" za fine-tuning

**Zašto je ovo #1:**
- Kvalitet = mogućnost izbora. Profesionalni editori uvek rade sa više opcija
- Smanjuje vreme iteracije — umesto "generiši → ne valja → objasni šta → generiši opet", prosto izabereš bolju
- Radi zajedno sa Video Review Editor-om (#0) — review markeri mogu da triggeruju multi-variant regeneraciju

---

### ⚡⚡⚡ #0.5 YouTube Guidelines Audit — Da li nas mogu sjebati za monetizaciju?

**Problem:** Pre nego što uložimo vreme u ceo pipeline, moramo proveriti da li naš format (AI-generisani vizuali, TTS voiceover, automatizovan content) uopšte može da prođe YouTube monetizaciju. Nema smisla praviti 100 videa pa da nas demonetizuju.

**Šta treba:**
- [ ] Pročitati YouTube Partner Program guidelines — šta kažu o AI-generated content
- [ ] Proveriti YouTube "Repetitious content" i "Reused content" politike — da li naš format upada
- [ ] Proveriti pravila za AI voiceover (TTS) — da li YT razlikuje od pravog glasa
- [ ] Proveriti da li AI vizuali (Remotion motion graphics, infografike) upadaju u "low quality" kategoriju
- [ ] Pogledati primere kanala koji rade slično (ByteMonk, Fireship, ColdFusion) — da li su monetizovani
- [ ] Identifikovati rizike i šta moramo dodati/promeniti da budemo safe (npr. face cam, originalni komentar, editing effort)
- [ ] Napisati zaključak: šta smemo, šta ne smemo, šta je siva zona

**Output:** `docs/YT-MONETIZATION-GUIDELINES-AUDIT.md` sa jasnim pravilima šta radimo a šta izbegavamo

**Status:** DONE — vidi [YT-MONETIZATION-GUIDELINES-AUDIT.md](docs/YT-MONETIZATION-GUIDELINES-AUDIT.md)

**Pipeline score: 6.5/10 — treba 3 fixa da bude 8.5/10:**

- [ ] **FIX 1: Voice Clone** — Zameni generic "Chris" ElevenLabs voice sa kloniranim MOJIM glasom (5 min snimak). Faceless + generic AI voice + AI script = trifecta za demonetizaciju. Moj glas rešava to.
- [ ] **FIX 2: Human Touch u Scriptu** — Dodaj korak u pipeline (Telegram step) gde JA dodajem 2-3 rečenice svog mišljenja pre generisanja finalnog scripta. Ubaci u `prompts/script-writing.md` sekciju "my take".
- [ ] **FIX 3: AI Disclosure** — Dodaj u render pipeline automatski YouTube "synthetic content" label. Obavezno od jula 2025.

---

### ⚡⚡⚡ #0.4 Telegram → YT Content Repurposing Pipeline

**Problem:** Vidim dobar post na TikToku, IG-u, Twitter-u — npr. "This guy made Claude Code talk like a caveman to save 7% tokens" — i to je samo kratka objava. Ali to može biti odličan YT video ako dodamo kontekst, analizu, naš komentar, vizuale.

**Kako radi:**
- [ ] Pošaljem link ili tekst na Telegram bota (već imamo TG agenta)
- [ ] Agent prepoznaje source (TT/IG/Twitter/Reddit post, članak, tweet...)
- [ ] Agent izvuče core ideju iz objave
- [ ] Agent sam smisli kako da to proširi u YT video:
  - Dodaje kontekst: zašto je ovo bitno, kako radi, šta je pozadina
  - Dodaje naš komentar/ugao: šta mislimo, zašto je ovo korisno/glupo/genijalno
  - Dodaje related info: šta još može uz ovo, alternativni pristupi
  - Strukturira u segmente pogodne za video (hook → objašnjenje → primer → zaključak)
- [ ] Output: gotov plan za video koji prolazi kroz naš pipeline (planner → builder)

**Primeri:**
- Input: "This guy made Claude Code talk like a caveman to save 7% tokens"
- Output: YT video "5 Crazy Prompt Tricks That Save You Money on AI" — caveman trick + još 4 slična + objašnjenje zašto radi + vizuali

**Ključno:**
- Agent MORA dodati originalnu vrednost — ne samo prepričavanje tuđeg posta
- Agent odlučuje da li je tema vredna videa ili nije (ne pravimo video od svega)
- Može grupisati više sličnih postova u jedan video (compilation stil)

---

### ⚡⚡⚡ #0 NAJBITNIJE: Video Review Editor + Self-Improving Skill

**Problem:** Kad video bude generisan, moram da gledam ceo video i ručno objašnjavam šta ne valja. Nema alat za označavanje dobrih/loših delova, nema feedback loop koji poboljšava skill.

**Šta treba — VIDEO REVIEW EDITOR (UI):**
- [ ] Editor (localhost:3002) dobija novi tab: "Video Review"
- [ ] Učita Remotion projekat (videos/{project-name}/) i prikaže timeline sa preview-om
- [ ] Mogu da kliknem na bilo koji frame/segment videa i dodam komentar:
  - "Ovaj deo je DOBAR" (zeleni marker) — npr. frame 200-350: "odlična animacija, progresivno građenje"
  - "Ovaj deo je LOŠ" (crveni marker) — npr. frame 500-700: "previše kutija, nema animacije, statično"
  - "Ovaj deo FALI" (žuti marker) — npr. frame 350-500: "pauza u vizualima, narator priča ali ništa se ne dešava"
- [ ] Komentari se čuvaju u `videos/{project-name}/review.json`:
  ```json
  {
    "markers": [
      { "startFrame": 200, "endFrame": 350, "type": "good", "comment": "odlična animacija" },
      { "startFrame": 500, "endFrame": 700, "type": "bad", "comment": "previše kutija, statično" },
      { "startFrame": 350, "endFrame": 500, "type": "missing", "comment": "nema vizuala dok narator priča" }
    ]
  }
  ```
- [ ] Format komentara: slobodan tekst, kapiram šta treba da se promeni
- [ ] Timeline vizuelno prikazuje markere (zeleno/crveno/žuto) kao na video editoru

**Šta treba — FIX SKILL (automatsko popravljanje):**
- [ ] Novi skill `video-fixer` ili proširenje `visual-generator` skill-a
- [ ] Čita `review.json` iz projekta
- [ ] Za svaki CRVENI marker: regeneriše taj segment koristeći visual-generator skill + komentar kao dodatni kontekst ("korisnik kaže da je previše kutija — napravi sa više animacija i manje statičnog sadržaja")
- [ ] Za svaki ŽUTI marker (fali vizual): generiše novi vizual za taj frame range
- [ ] Za svaki ZELENI marker: izvuče taj deo koda i sačuva u `reference/good-examples/` kao pozitivan primer
- [ ] Pokreće se sa hook-om ili komandom — "popravi video prema review-u"
- [ ] Može i iz Claude Code sesije: "pročitaj review.json i popravi video"

**Šta treba — SELF-IMPROVING LOOP:**
- [ ] Zeleni markeri (dobri delovi) se automatski dodaju u `reference/good-examples/` — skill ih čita pre generisanja
- [ ] Crveni markeri se analiziraju: šta je zajedničko lošim delovima? (previše kutija? malo animacija? statično?) → dodaje se pravilo u `generation-rules.md`
- [ ] Posle svakog review-a, skill postaje BOLJI jer ima više dobrih primera i više pravila šta ne raditi
- [ ] Tracking: koliko markera po videu, trend poboljšanja (manje crvenih, više zelenih)
- [ ] Možda: poređenje dva videa — "ovaj novi video ima 3 crvena vs prošli sa 7 crvenih = napredak"

**Inspiracija — Shopify Theme Research:**
- Pogledati `shopify-theme-research/` za query/hook pattern
- Tamo imamo sistem gde se piše feedback u fajl i hook ga čita → sličan mehanizam
- Review komentari su kao "queries" koje fixer skill obrađuje

**Zašto je ovo #0:**
- Bez ovoga, svaki video zahteva ručno objašnjavanje šta ne valja
- Sa ovim, označim 5 stvari u editoru → pokrenem fix → gotovo
- Skill se sam poboljšava kroz feedback — manje posla svaki sledeći put
- Dobri delovi postaju reference, loši postaju pravila — sistem uči

### ⚡⚡⚡ #0.5 NAJBITNIJE: Visual Editor za Fullscreen Generated vizuale

**Problem:** Editor (port 3002) radi za stari sticky/node sistem. Fullscreen generated vizuali (.tsx od visual-generator-a) nemaju editor — ne možeš da menjaš elemente, brišeš ih, menjaš ikone, boje itd. Mora se prepraviti ceo editor da radi na ovom novom sistemu.

**Šta treba:**
- [ ] Editor prepoznaje fullscreen generated komponente (Generated_*.tsx)
- [ ] Parsira elemente iz generisane komponente (boxovi, kartice, labels, ikone, linije...)
- [ ] Za svaki element omogući: brisanje, promena ikone, promena boje, promena teksta
- [ ] Slično kao stari editor za sticky/node — samo adaptirano za fullscreen layout
- [ ] Live preview — promene se vide odmah u Remotion preview-u
- [ ] Save — editovana komponenta se sačuva nazad u .tsx
- [ ] Integracija sa Review Editor — iz review taba klik na segment → otvori visual editor za taj segment

**Zašto:**
- Bez ovoga moram ručno da editujem .tsx kod kad treba sitna promena (ikona, boja, tekst)
- Sa ovim: vidim video → označim šta ne valja → otvorim editor → fixujem vizuelno → gotovo

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

### ⚡⚡ NAJBITNIJE: Visual Generator — AI generise .tsx od nule za svaki transcript

**Problem:** Nasi vizuali su iz kataloga (15 tipova). Kad transcript treba nesto custom (evolving diagram, interactive process, custom layout) — nemamo resenje. Template pristup (InteractiveDiagram.tsx) je POGRESAN — hardkodirani tipovi ne pokrivaju sve.

**Resenje:** Skill/agent koji PISE celu .tsx komponentu od nule za svaki transcript. Ne popunjava template, ne koristi katalog. Svaki put potpuno nova komponenta skrojena za taj tekst.

**Kako radi:**
1. Agent cita transcript
2. Agent PISE novu .tsx — bira elemente, layout, animacije, timeline
3. Postuje: dizajn sistem (component-skeleton.md), Remotion rules (remotion-coding-rules.md), nikad preklapanje
4. Dva moda: fullScreen (1920x1080) i nodeMode (u sticky sekciji)
5. Props: progress (0-1), shapeMode, accentColor, fullScreen

**Pravila za generisanje:**
- CSS Grid/Flexbox UVEK, absolute positioning NIKAD (nauceno iz testiranja)
- Elementi: BILO STA — progress bar, score circle, code snippet, card, tabela, status dot, mini chart
- Timeline events: appear, highlight, connect, eliminate — sinhronizovano sa progress-om
- Remotion: useCurrentFrame, clamp, spring, Img — SVE iz remotion-coding-rules.md
- Dizajn: #0f0f1a, glass, glow, Inter/SF Mono — SVE iz component-skeleton.md
- Labele na linijama NIKAD — voiceover objasnjava, strelica pokazuje smer

**Integracija u pipeline (kad proradi):**
- Visual Router dobija novi tip: `visualType: "generated"` — kad nijedan katalog vizual ne odgovara
- Visual Proposer se prosiruje da generise one-off komponente (ne samo reusable za katalog)
- Builder ucitava generisanu komponentu kao svaki drugi vizual
- DynamicPipeline: `fullScreen: true` → renderuje bez sticky chrome-a, ceo ekran
- Editor (port 3002): "Re-generate" dugme na sekcijama sa generated vizualima

**Status:**
- [x] Napraviti skill koji generise .tsx od nule — `.claude/skills/visual-generator/`
- [x] Testirati na 20 transcripta (prosek layout+prikaz: 8.1/10)
- [x] Pravila iterirana: motion designer princip, progresivno gradjenje, vise scena, SVG zabrana, layout shift fix
- [ ] **Vizuelna hijerarhija** — bitniji element = VECI, manje bitan = manji. Sad su svi elementi iste velicine. Dodati u generation-rules.md
- [ ] **Context Panel layout mode** — levo (40%) kontekst (fajl/terminal/browser sa placeholder linijama + highlight), desno (60%) vizual objašnjenje. Testirati na promptovima: 9 (Dockerfile), 12 (V8 JS), 17 (git push), 18 (Redis), 19 (OAuth2 browser), 20 (WebSocket headers), 26 (rate limiting code). Kad radi — dodati u generation-rules.md
- [ ] **Logika kad šta koristiti:** context panel (transcript opisuje konkretan fajl/terminal/UI) vs full screen (apstraktan koncept) vs canvas (tutorial/step-by-step)
- [ ] **Transcript segmentacija za Visual Generator** — ceo video je dugačak transcript (2-5 min, 500-1000 reči). Visual Generator sad radi na kratkim isečcima (1 koncept = 1 komponenta). Treba odlučiti:
  - Ko deli transcript na segmente? (novi Decision agent pre svega, ili Router proširiti?)
  - Kako deliti? Po konceptima? Po pauzama u naraciji? Po promenama teme?
  - Svaki segment može biti drugačiji mod (fullscreen, context-panel, canvas) — mešan video
  - Kako se segmenti spajaju u finalni video? Tranzicije između modova?
  - Voiceover sync — Visual Generator mora da zna tačno KOJI deo transcripta pokriva i timestamps za taj deo
- [ ] Kad radi — integrisati u Proposer/Router/Builder pipeline
- [ ] Dodati Re-generate u editor

**Test promptovi:** `.claude/skills/visual-generator/reference/test-prompts.md` (27 testova)
**Session log:** `docs/session-interactive-diagram.md` — kompletna istorija, sta radi/ne radi, grill-me rezultati

### ⚡⚡ Asset Sourcing — AI trazi/predlaze slike, screenshotove, video klipove

**Problem:** Nasi vizuali su 100% generisani kodom. Kad transcript prica o konkretnom proizvodu, sajtu, app-u — fali KONTEKST. Screenshot Google-a, slika Docker loga, video demo — to bi vizual ucinilo 10x boljim.

**Sta treba:**
- [ ] AI analizira transcript i prepozna gde bi slika/screenshot/video klip bio bolji od generisanog koda
- [ ] AI trazi odgovarajuce grafike (stock, screenshot, logo) ili predlaze sta da se nabavi
- [ ] Integracija u pipeline — asset se ubacuje u komponentu (Remotion `<Img>` / `<Video>`)
- [ ] Odluciti GDE u flow-u ovo ide — da li Visual Generator sam trazi, ili poseban agent pre njega
- [ ] Odluciti KAKO nabavlja — AI generise (DALL-E/Flux), screenshot (Playwright), stock (Unsplash API), ili predlaze useru da uploaduje
- [ ] **Pipeline korak: Asset Planner** — pre Visual Generator-a, novi korak koji:
  - Čita transcript/temu i razmišlja: "šta bi gledalac hteo da VIDI?" (logo, screenshot sajta, UI demo, dijagram, slika proizvoda)
  - Za svaki segment predlaže: "ovde bi screenshot Docker Hub-a bio 10x bolji od generisanog koda"
  - Ako može sam da nabavi (Playwright screenshot, stock API, AI generisana slika) → nabavi
  - Ako NE može → ispiše listu: "Treba mi: 1) Docker Hub screenshot 2) Terminal sa docker pull output" → user uploaduje
  - Asset-i se sačuvaju u `videos/{project-name}/public/assets/` i Visual Generator ih koristi sa `<Img>`

### ⚡⚡ Research Validation — Metrike i proof za teme

**Problem:** Nas research pipeline nalazi teme sa YT i weba ali nema DOKAZ da je tema zaista u trendu. "Ovo je dobro" — odakle znas? Gde je proof?

**Sta treba:**
- [ ] Pristup pravim metrikama — Google Trends API, search volume (Ahrefs/SEMrush API ili alternativa), Reddit upvote count, HN points
- [ ] SEO signali — koliko ljudi zapravo TRAZI ovu temu? Search volume, keyword difficulty, trending score
- [ ] Social proof — koliko engagement-a tema dobija na Reddit/HN/Twitter zadnjih 7 dana
- [ ] Competitor analysis — koliko YT videa vec postoji na tu temu, koliko views imaju, kad su postavljeni
- [ ] Agent koristi ove metrike da POTVRDI ili ODBACI temu pre nego sto je predlozi — ne samo "izgleda zanimljivo" nego "evo brojeva"
- [ ] Integrisati u content pipeline — posle topic discovery, pre script writing, agent proverava metrike i daje confidence score sa izvorima
- [ ] **YT Channel Stats tracking** — pratiti kanale iz nase nise (Fireship, ByteMonk, NetworkChuck, ThePrimeagen itd):
  - Prosecni views po videu poslednjih 30 dana vs prosek kanala — da li im ova tema NADMASUJE prosek?
  - Ako Fireship napravi video o "X" i dobije 3x vise views od proseka — to je SIGNAL da je tema vrela
  - Views/subscriber ratio — koliko % subscribera zapravo gleda (engagement rate)
  - Upload frequency na temu — ako 3+ kanala uploaduju o istoj temi u 7 dana = trending
  - yt-dlp moze da izvuce view count, like count, upload date — sve sto treba
  - Napraviti bazu/JSON sa kanalima i njihovim prosecima, updejt weekly

### ⚡ Video Layout — Outline Sidebar + Transcript

**Ideja:** Ceo video ekran podeliti na 3 zone:
- **Centar (glavno):** fullscreen vizual / canvas / context panel — glavni content
- **Desno (outline sidebar):** Google Docs stil progress tracker — lista sekcija videa, highlight na trenutnoj. Automatski iz visual-structure.json naslova, pomera se po timestamps-u
- **Dole (transcript):** karaoke-stil word highlight (već imamo sistem)

**Šta treba:**
- [ ] Outline sidebar komponenta — lista sekcija sa dot/bullet, active highlight + glow, progresivno pojavljivanje
- [ ] Automatsko generisanje iz visual-structure.json (naslovi segmenata)
- [ ] Sync sa voiceover timestamps — active section se menja kad narator pređe na sledeći segment
- [ ] `showOutline: true/false` u dynamic-config.json (opciono, ne uvek)
- [ ] Prilagoditi main content width kad je outline aktivan (~1600px umesto 1920px)
- [ ] Razmisliti: da li outline radi za pure fullscreen (1 koncept) ili samo za mešane videe?
- [ ] Transcript overlay integracija sa outline-om — oba prate isti timing

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

### 🔴 NAJBITNIJE: Remotion Official Skill Integracija
**remotion-dev/skills** (instalirano u `.agents/skills/remotion-best-practices/`) — 41 fajl sa best practices za:
transitions, animations, text-animations, 3d, lottie, light-leaks, captions, subtitles, voiceover, charts, maps, audio, sfx, tailwind, fonts, images, videos, gifs, transparent-videos, compositions, sequencing, timing...

**Zadatak:** Uporediti detaljno sa NAŠIM remotion skills (remotion-planner, remotion-builder, remotion-visual-router, remotion-motion, remotion-correction) i odlučiti:
- [ ] Opcija A: MERGE — uzeti njihove best practices + naš branding/visual system
- [ ] Opcija B: REPLACE — prebaciti se na njihov skill, dodati naš branding layer
- [ ] Opcija C: HYBRID — njihov skill za rendering/efekte, naš za content pipeline/visual routing

**Cilj:** Naš branding (boje, fontovi, glass, borders) + njihovi efekti (transitions, 3d, lottie, captions) = profesionalni videi

**AI Slike/Video za efekte (istražiti):**
- [ ] AI image generation (Flux/fal.ai ~$0.01, Midjourney $10/mo, DALL-E 3 ~$0.04) — generisati slike po sekciji videa
- [ ] Image-to-video (Kling AI $6.99/mo, Runway $12/mo) — animirati AI slike (zoom, pan, rotate)
- [ ] Lottie animacije (free, Remotion plugin) — vektorske animacije umesto statičnih ikona
- [ ] Playwright screenshots — screenshot sajtova/appova za demo sekcije
- [ ] Kako uklopiti: AI slika → animacija → Remotion `<Video>` ili `<Img>` sa CSS transforms

**Takođe iz skills.sh:**
- [ ] YouTube Thumbnail design rules — izvući safe zones, 120px test, color psychology
- [ ] Deep Research quality gates — source credibility scoring + validation retry loop

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
- [x] 5.12 Cron setup — daily automatski scan u 8:00 (Claude Code scheduled trigger)
- [x] 5.13 Telegram always-on (PM2) — bot sluša non-stop, ne samo kad pokrenemo poll
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
- [ ] **Proveriti duplikate u `.claude/` folderu** — komentari i template folderi koji se ponavljaju, očistiti



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

---

### 🔧 V2 Pipeline Improvements (za poboljšanje)

**Urađeno u V2 sesiji:**
- [x] Content discovery: 9 izvora + demand (YT+Google+Bing) + TikTok + velocity + outlier detection
- [x] Content processing: parallel research + outline step + quality scorer
- [x] TTS: Chris voice sa Fireship settings (stability 0.75, style 0.1)
- [x] SFX: 30 zvukova iz library-a + placer sa density rules
- [x] Meme researcher: Reddit + Imgflip + evergreen suggestions
- [x] Visual planner: beat-level decisions, meme rotation, ai_video/motion_graphics
- [x] AI video: Flux image → Minimax video via fal.ai ($0.31/clip)
- [x] Audio mixer: ducking + LUFS normalization
- [x] Composition planner: spaja sve u master-composition.json
- [x] Editor: Composition tab (Pipeline Dashboard) + Review unified segments+beats
- [x] Full pipeline: one-click from topic to final_video.mp4

**Za poboljšanje (V3):**
- [ ] **Topic clustering kvalitet** — LLM daje generic teme ("Docker Container Technology"). Prompt treba biti specifičniji ("Docker CVE-2026-1234 Supply Chain Attack" ne "Docker"). Trenutna ocena: 5/10
- [ ] **Sorting/filtering u editoru** — filter generičnih tema, sort by multiple criteria
- [ ] **End-to-end test** — full pipeline netestiran od Scan Now do final_video.mp4
- [ ] **Scan progress** — editor ne prikazuje progress tokom scan-a (4 min čekanja bez feedback-a)
- [ ] **Meme quality filter** — meme researcher ne zna da filtrira loše/irelevantne meme-ove
- [ ] **Background music** — Suno AI integracija za custom lo-fi tech beats
- [ ] **AI host opcija** — HeyGen za talking head intro (per video type)
- [ ] **Image approval UI** — editor review za AI-generisane slike pre video generisanja
- [ ] **Freesound MCP** — kad dobiješ API key, 600K+ zvukova za agenta
- [ ] **KRITIČNO: Async process** — editor Process dugme blokira server (execFileSync). Treba spawn child process + polling za status. Server se ruši ako pipeline traje >30s
- [ ] **Tranzicije između delova videa** — crossfade između AI video hook-a i prvog Remotion vizuala, između segmenata, između meme overlay-a i vizuala. Sad je hard cut. Treba razmisliti: koji tip tranzicije (crossfade, whoosh+cut, dissolve), koliko traje, da li treba zvuk
- [ ] **Root.tsx i index.ts** — builder ponekad napravi Root.tsx pre nego što su vizuali gotovi. Proveriti da builder čeka da svi Generated_*.tsx postoje pre nego što generiše Root.tsx
