# ByteMonk/Fireship Style Video Workflow

## CILJ: Infografike + Motion Graphics + Brz Editing (NE karakteri)

---

## GLAVNI PRISTUP: Claude Code + Remotion

**Cena:** $20/mo (samo Claude Pro)
**Vreme:** 30-60 min po videu
**Kvalitet:** Profesionalan

```
Script (Claude) → Voice (ElevenLabs) →
Remotion kod (Claude Code piše) → Video renderovan
```

### Setup

1. Instaliraj VS Code (FREE)
2. Kupi Claude Pro ($20/mo)
3. Instaliraj Claude Code extension
4. U terminalu: `npx @remotion/create@latest remotion-skill --install-skill`
5. Gotovo!

### Kako radi

1. Opiši video na engleskom: "Create a product demo for [website]"
2. Claude automatski:
   - Posećuje website
   - Izvlači slike, boje, fontove
   - Piše React/Remotion kod
   - Renderuje video
3. Iteriraš: "Make the intro bigger", "Add transition"

### Šta može da pravi

- Title sekvence i introi
- Lower thirds
- Product demo
- Explainer videi
- Motion graphics
- Animirani dijagrami
- Code snippets sa typing animacijom

### Tutoriali

- https://www.youtube.com/watch?v=fOY0_WCR3eY (132K views)
- https://www.youtube.com/watch?v=7J0ru0g3RUw (38K views)
- https://www.youtube.com/watch?v=Sthv8xcy2y4 (13K views)

---

## ALTERNATIVA 1: Hera AI (Instant Motion Graphics)

**Cena:** FREE / $20 Starter / $40 Pro
**Vreme:** 30 sec - 2 min po animaciji
**Best for:** Mape, infografike, text animacije

### Kako radi

1. Opiši animaciju: "Map of Europe zooming to Italy with highlighted border"
2. Klikni "Generate"
3. Čekaš 30 sec
4. Dobiješ profesionalnu animaciju

### Šta može

- Map animacije (ODLIČAN za ovo)
- Text animacije
- Infografike i grafici
- Data vizualizacije
- Logo animacije
- Charts (importuje CSV)

### Pricing

| Plan | Cena | Features |
|------|------|----------|
| Free | $0 | Watermark, 720p |
| Starter | $20/mo | 200 prompta, 1080p |
| Pro | $40/mo | Unlimited, 4K/60fps |

### Pros/Cons

**Pros:**
- Brzo (30 sec)
- Bez dizajn iskustva
- Odlično za mape
- Templates

**Cons:**
- Nekad nekonzistentno
- Iteracije spore (1-3 min svaka)
- Ne zamenjuje After Effects za complex stvari

### Tutoriali

- https://www.youtube.com/watch?v=0l07b_Aj1Mc (206K views)
- https://www.youtube.com/watch?v=eSSGEqJN8o0 (147K views)

---

## ALTERNATIVA 2: Antigravity (Google FREE IDE)

**Cena:** FREE
**Best for:** Kompleksni projekti, multi-agent

### Šta je

Google-ov FREE agentic IDE. Može da kontroliše browser, terminal, i pravi video sa Remotion.

### Setup

1. Download sa antigravity.google
2. Instaliraj Node.js i Git
3. Run: `npx create-remotion-dev/skills`
4. Kreiraj folder
5. Počni sa promptovima

### Bonus

- $300 free credits za Google AI Studio (Nano Banana Pro, Veo 3.1)
- Može kombinovati sa Claude Code

---

## ALTERNATIVA 3: Framenet (FREE Infographics)

**Cena:** FREE
**Best for:** Charts, grafici, data vizualizacije

### Features

- Bar/pie charts animirani
- Map animacije
- 100s templata
- Customizable stil i boje
- API za automatizaciju

### Kako radi

Input script → AI pravi animirani video sa motion graphics

---

## ALTERNATIVA 4: AutoAE

**Cena:** FREE (watermark) / $30-60/mo
**Best for:** Text efekti, viral hooks

### Features

- 600+ motion graphics templata
- Text efekti
- 3D transformacije
- Flowchart videi
- One-click editing (bez timeline-a)

---

## TOOL ZA ANIMACIJU SLIKA: Kling AI

**Cena:** $6.99/mo
**Best for:** Animiranje statičnih slika

### Workflow

1. Napravi sliku u Nano Banana (FREE u Gemini)
2. Upload u Kling
3. Dodaj prompt za animaciju
4. Dobiješ 5-10 sec animirani klip

### Gde

- https://klingai.com/

---

## VOICE: ElevenLabs

**Cena:** FREE tier / $5 Starter / $22 Creator
**Best for:** AI voiceover

### Features

- Voice cloning
- Mnogo glasova
- Brzo generisanje

---

## SOUND EFFECTS (FREE)

### Whoosh/UI Sounds
- **Freesound.org** - Najveća FREE biblioteka, razni formati
- **Pixabay Sounds** - FREE, no attribution required
- **Mixkit** - FREE sound effects, kategorisano

### Background Music
- **Pixabay Music** - FREE, royalty-free
- **YouTube Audio Library** - FREE za YT content
- **HeartMula** - Local AI music generation (FREE)

---

## FULL WORKFLOW OPCIJE

### Opcija 1: Claude Code + Remotion (PREPORUČENO)

```
Script → ElevenLabs voice → Claude Code + Remotion → Export
Vreme: 30-60 min
Cena: $20/mo (Claude Pro) + $22/mo (ElevenLabs) = $42/mo
```

### Opcija 2: Hera AI + Manual Edit

```
Script → ElevenLabs voice → Hera animacije → DaVinci assembly → Export
Vreme: 45-90 min
Cena: $20-40/mo (Hera) + $22/mo (ElevenLabs) = $42-62/mo
```

### Opcija 3: Mix (Nano Banana + Kling + Hera)

```
Script → ElevenLabs voice → Nano Banana slike → Kling animacija →
Hera infografike → DaVinci assembly → Export
Vreme: 60-120 min
Cena: ~$50/mo
```

---

## VREME PO VIDEU (prosek)

| Task | Vreme |
|------|-------|
| Script | 10-20 min |
| Voice | 5-10 min |
| Vizuali | 10-15 min |
| Assembly | 5-10 min |
| Review | 5-10 min |
| **TOTAL** | **35-65 min** |

Sa batching-om (3-5 videa): ~20-30 min po videu

---

## MESEČNI TROŠAK

| Stack | Cena |
|-------|------|
| Budget (Remotion + FREE tools) | $20/mo |
| Standard (+ ElevenLabs) | $42/mo |
| Premium (+ Hera Pro) | $82/mo |

---

## KLJUČNI PRINCIPI (Fireship stil)

1. **Writing quality > editing** - Dobar script je najvažniji
2. **Brz pacing** - Ne zadržavaj se
3. **Memes i humor** - Relevantni za publiku
4. **Information density** - Svaka sekunda ima value
5. **Unique perspective** - Tvoj stav na temu
6. **Hook u prva 3 sec** - Stop the scroll

---

## NEXT STEPS

1. [ ] Instaliraj VS Code + Claude Code extension
2. [ ] Kupi Claude Pro ($20/mo)
3. [ ] Instaliraj Remotion skill
4. [ ] Napravi test video (30 sec)
5. [ ] Probaj Hera AI free tier
6. [ ] Sign up ElevenLabs free
7. [ ] Evaluiraj šta ti najbolje radi

---

## SOURCES

- Remotion: https://remotion.dev/
- Hera AI: https://hera.video/
- Antigravity: antigravity.google
- Framenet: https://www.framenet.ai/
- AutoAE: https://autoae.online/
- Kling AI: https://klingai.com/
- ElevenLabs: https://elevenlabs.io/
- Nano Banana: Gemini ili Freepik AI (FREE)

### Video Tutoriali

- Claude Code + Remotion: https://www.youtube.com/watch?v=fOY0_WCR3eY
- Hera AI Tutorial: https://www.youtube.com/watch?v=0l07b_Aj1Mc
- Nano Banana Motion Graphics: https://www.youtube.com/watch?v=9yBMtvD_CFw
- Faceless Video Workflow: https://www.youtube.com/watch?v=7J0ru0g3RUw
