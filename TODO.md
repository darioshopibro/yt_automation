# YouTube Automation Plan

## Izabrani pristup: CLAUDE CODE + REMOTION

**Stack:** Claude Code ($20) + ElevenLabs ($22) + DaVinci (free)
**Cena:** ~$42/mo
bo**Vreme po videu:** 30-60 min
**Kvalitet:** Profesionalan (ByteMonk/Fireship stil - infografike, motion graphics)

**Workflow:** Vidi [ANIMATED-EXPLAINER-WORKFLOW.md](ANIMATED-EXPLAINER-WORKFLOW.md)

---

## TODO — Redosled: 1 → 2 → 3 → 4 → 5 → 6

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

### FAZA 2: Novi vizuali
- [ ] 2.1 Table vizual (poređenja, feature matrice)
- [ ] 2.2 Code Block vizual (syntax highlight, typing animacija)
- [ ] 2.3 Terminal vizual (CLI, command output)
- [ ] 2.4 List/Bullets vizual (numbered, checkmarks)
- [ ] 2.5 Logo Grid vizual (tech stack, ekosistem)
- [ ] 2.6 Timeline vizual (istorija, roadmap, verzije)
- [ ] 2.7 Bar/Line charts (benchmarks, statistike)
- [ ] 2.8 Pie/Donut charts (distribucija, procenti)
- [ ] 2.9 VS Layout wrapper (side-by-side duboko poređenje)

### FAZA 3: Kompozitni vizuali
- [ ] 3.1 Vizual kao node — sekcija može sadržati mini-vizual umesto samo ikona
- [ ] 3.2 ExplainerLayout kao konektor — strelice/vs/combine povezuju vizuale
- [ ] 3.3 Mixed sections — mešavina ikona + vizuala u istom sticky-ju

### FAZA 4: Vizual Routing (mozak sistema)
- [ ] 4.1 Pravila po vizualu — uslovi kad se koji vizual koristi (ključne reči, heuristike)
- [ ] 4.2 Transcript segmentacija — podeli transcript na logičke delove
- [ ] 4.3 Segment → vizual matching — AI bira vizual za svaki segment
- [ ] 4.4 Planner integracija — routing logika u remotion-planner skill

### FAZA 5: Research & Content Pipeline
- [ ] 5.1 YT niša monitoring — prati kanale, nalazi videe koji performuju
- [ ] 5.2 Video scoring — ranira po views/engagement/relevance
- [ ] 5.3 Transcript extraction — skida i čisti transcript
- [ ] 5.4 Content processing — preformuliše u originalan tekst (NE plagijat)
- [ ] 5.5 User review — prikazuje kandidate, user bira/odobrava

### FAZA 6: Branding skill (zahteva focus — radi se kad bude vreme)
- [ ] 6.1 Brand config — boje, font, logo, custom bg
- [ ] 6.2 Template theming — svi vizuali čitaju brand config
- [ ] 6.3 Per-project override — različiti brendovi za različite projekte
- [ ] 6.4 Multi-template support — user može da bira između više template-a (ne samo 1), svaki sa svojim stilom/layoutom

### Editor poboljšanja (usput, kad radimo vizuale)
- [ ] Sticky direction control — biramo gde ide sledeći sticky (desno, dole, levo, gore) umesto samo desno
- [ ] Više icon library-ja — react-icons (40k+ ikona iz 25 libraryja) + update lookup u templateu
- [ ] Vizuali unutar sticky-ja — nove komponente (table, chart, code) kao node tipovi

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
