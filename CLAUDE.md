## GLAVNO PRAVILO


# About Me

**Dario Acimovic** - AI Automation Engineer iz Beograda

- 7 godina iskustva u developmentu, radio za agencije u USA i Nemačkoj
- Co-founder Adsgun (Shopify app u app store-u)
- Fiverr profil: 200+ reviews, 5.0 rating
- Specijalizacija: n8n workflows, AI agenti, voice agenti (Vapi, Retell AI), chatbots
- Pravim OpenClaw asistente za klijente (open-source AI assistant za WhatsApp, Telegram, Discord)
- Radio za brendove sa $50-100k/day prometom

## Tech Stack
Radim sve - backend, frontend, AI, automatizacije. Koristim Claude Code kao glavni alat za development.

**AI & Automation:** n8n, OpenClaw, OpenAI, Claude, Vapi, Retell AI, LangChain, Make, Zapier
**Backend:** Node.js, Python, Supabase, PostgreSQL, REST APIs, webhooks
**Frontend:** React, Next.js, Shopify/Liquid, TypeScript, JavaScript
**Hosting:** n8n Cloud, self-hosted n8n (VPS/Docker), Vercel, Railway, Supabase

## Klijenti & Način Rada
- **Glavni klijent:** Felix Shpilman (Moses Capital, ETG) - pravim OpenClaw asistenta
- **Fiverr:** 200+ reviews, aktivno dobijam klijente
- **Direktni klijenti:** dugoročne saradnje
- Razmišljam o konsultacijama
- **Naplata:** hourly
- **Jezik:** Engleski

## Lični Projekti
- 2 teretane na Novom Beogradu (porodični biznis) - potencijalno automatizacije
- YouTube automatizacije - u planu

## Napomena
Imam spremne MD fajlove za pojedinačne klijente - dodaću ih posebno.

---

## Research Rule

**When user asks to research something online, ALWAYS do BOTH:**

1. **Web Search** - Use WebSearch tool for docs, blogs, Stack Overflow
2. **YouTube Search** - Use `python3 .claude/skills/research/scripts/research.py "query"`

**Trigger phrases:**
- "research this", "check online", "search online"
- "look up how", "how is this usually done"
- "find out how", "what's the best way to"
- "find tutorials on", "how do others do this"

**Process:**
1. WebSearch: `"topic + relevant keywords"`
2. YouTube: `python3 .claude/skills/research/scripts/research.py "topic"`
3. If a video looks highly relevant, get transcript: `python3 .claude/skills/research/scripts/transcript.py "URL"`
4. Summarize findings from BOTH sources

---

## Problem Solving Rule (Auto-Trigger)

**ALWAYS auto-trigger this when:**
- There's an error, bug, or problem to solve
- Comparing multiple approaches/options
- User asks "how should we...", "what's the best way...", "which option..."
- Debugging something that's not working
- Deciding between solutions

**Process:**
1. Define problem in one sentence
2. Research solutions using research skill
3. List 3-5 options found
4. Score each option (1-10): Effort, Reliability, Maintainability, Fit
5. Rank and recommend ONE

---

## Grill Me Rule (Auto-Trigger)

**ALWAYS auto-trigger when:**
- User says "grill me", "stress test this", "challenge this plan"
- User presents a plan or design and wants validation
- User asks "is this a good approach?", "what am I missing?"

**Process:** Interview relentlessly about every aspect until shared understanding.

---

## Pattern Detection Rule

**When you notice the user doing the same type of task 3+ times, suggest:**
> "I notice we keep doing [X]. Want me to create a skill for this so it's faster next time?"

---

## KRITIČNO: Testing Rule za Animacije

**Kada se testira BILO ŠTA vezano za animacije/remotion:**

### DVA AGENTA - OBAVEZNO OBA!

```
1. REMOTION-PLANNER → planira SVE (voiceover, structure, camera, sounds)
   Output: master-plan.json

2. REMOTION-BUILDER → implementira prema planu
   Input: master-plan.json
   Output: Funkcionalan projekat
```

### Workflow za testiranje:

1. Pokreni `remotion-planner` skill sa transkriptom
2. Proveri `master-plan.json` (frame 0 ima content?)
3. Pokreni `remotion-builder` skill sa master-plan.json
4. Proveri output u preview-u

### Pravila:

- **UVEK koristi OBA SKILLA** - nikad ručno
- Skills se nalaze u:
  - `.claude/skills/remotion-planner/SKILL.md`
  - `.claude/skills/remotion-builder/SKILL.md`
  - `.claude/skills/remotion-motion/SKILL.md` (orchestrator)
- Ako skill ima bug - FIXUJ SKILL, ne zaobilazi

```
❌ POGREŠNO: Ručno editovati template, ubaciti timestamps, napisati kod
✅ ISPRAVNO: Planner → master-plan.json → Builder → projekat
```

**Zašto:** Ako ručno radiš - testiraš SEBE, ne skill. A skill je ono što mora da radi perfektno.

---

## YT Automation Terminologija

**Visual template hijerarhija:**
```
StickyNote (glavni layer container, "Step 1", "Step 2"...)
  └── SectionBox (grupacija unutar sticky-a)
        └── NodeItem (box sa ikonom + label)
```

**Kad kažem:**
- **"sticky notes"** = StickyNote komponente (glavni kontejneri po koracima)
- **"nodes"** = NodeItem boxovi UNUTAR sticky-a (mali boxovi sa ikonama)
- **"sections"** = SectionBox (srednji nivo grupacije)
