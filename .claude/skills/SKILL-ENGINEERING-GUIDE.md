# Skill Engineering Guide

Kompletno istraživanje o tome kako se prave efektivni AI agent skills.

**Izvori:**
- [Lakera Prompt Engineering Guide](https://www.lakera.ai/blog/prompt-engineering-guide)
- [PromptHub: Agent Prompting](https://www.prompthub.us/blog/prompt-engineering-for-ai-agents)
- [Anthropic Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Don't Build Agents, Build Skills Instead - Anthropic (952K views)](https://www.youtube.com/watch?v=CEvIs9y1uog)
- [How to build Claude Skills Better than 99% (165K views)](https://www.youtube.com/watch?v=X3uum6W2xEI)
- [The Complete Guide to Agent Skills (125K views)](https://www.youtube.com/watch?v=fabAI1OKKww)
- [How to Create Good Agent Skills (10K views)](https://www.youtube.com/watch?v=Ik-Xbz2hvM0)

---

## KLJUČNI INSIGHT: Zašto Skills, Ne Agenti

> "We stopped building agents and started building skills instead." - Barry Zhang, Anthropic

**Problem sa agentima:**
- Brilliant ali bez ekspertize
- Nedostaje domain knowledge
- Ne uče kroz vreme
- Svaki domain zahteva posebnog agenta

**Rešenje - Skills:**
- Modularni paketi proceduralnog znanja
- Composable (stotine skills-a za jednog agenta)
- Self-improving
- Sharable across teams

---

## ANATOMIJA SKILL-A

### Osnovna struktura:
```
my-skill/
├── SKILL.md          # OBAVEZNO - core instrukcije
├── scripts/          # Opcionalno - executable kod
│   └── helper.py
├── templates/        # Opcionalno - output primeri
│   └── TEMPLATE.md
└── reference/        # Opcionalno - dodatni kontekst
    └── context.md
```

### SKILL.md struktura:
```markdown
---
name: Skill Name
description: Kratak, jasan opis kad se koristi
---

# Instrukcije

## Kada koristiti
- Trigger uslov 1
- Trigger uslov 2

## Workflow
1. Korak 1
2. Korak 2

## Output format
...
```

---

## KRITIČNA PRAVILA

### 1. Name + Description su NAJVAŽNIJI

> "If the description is vague, Claude will never reach the Skill—no matter how good the instructions in the body are."

```markdown
# ❌ LOŠE
---
name: Helper
description: Helps with things
---

# ✅ DOBRO
---
name: RAG Pipeline Animator
description: Creates Remotion video animations for RAG/LLM pipeline explanations with voiceover sync
---
```

**Zašto:** Claude koristi SAMO name+description za odluku da li da učita skill. Ako je vague → nikad neće triggerovati.

---

### 2. Progressive Disclosure

> "Only metadata is shown to the model. When agent needs to use a skill, it reads the rest."

```
┌─────────────────────────────────────────┐
│  CONTEXT WINDOW (limited!)              │
├─────────────────────────────────────────┤
│  System prompt                          │
│  + Conversation history                 │
│  + ALL skills metadata (name+desc only) │  ← Stotine skills-a
│  + User prompt                          │
│  + [LOADED SKILL content]               │  ← Samo kad treba!
└─────────────────────────────────────────┘
```

**Implikacija:**
- Metadata MORA biti dovoljna za trigger
- Body skill-a se učitava SAMO kad je potreban
- Reference files se učitavaju SAMO kad instrukcija kaže

---

### 3. Budi KONCIZAN

> "Keeping this lean is very important for better results and also to save money."

```markdown
# ❌ LOŠE (~500+ tokena)
When the user asks you to create an email, you should first consider
what kind of email they want. There are many types of emails such as
professional emails, casual emails, marketing emails...
[paragraf za paragrafom]

# ✅ DOBRO (~50 tokena)
## Email Footer
Always end emails with:
```
Best,
Dario
founder @ codeit.dev
```
```

**Benchmark:**
- Simple skill: ~50 tokens
- Complex skill: ~200-300 tokens
- Max: 500 tokens (ako ne možeš pročitati za 90 sekundi = predugačko)

---

### 4. Ne objašnjavaj ono što Claude zna

> "Claude is very smart already. Give it the code that it needs to run."

```markdown
# ❌ LOŠE
JSON is a data format that uses key-value pairs. When creating JSON,
make sure to use proper syntax with curly braces and quotes...

# ✅ DOBRO
Output format:
```json
{ "name": "...", "value": "..." }
```
```

---

### 5. Degrees of Freedom

**High freedom (exploratory tasks):**
```markdown
Analyze the code structure and check for potential bugs
```

**Low freedom (deterministic tasks):**
```markdown
Run exactly: `npm run build && npm run test`
Only proceed if both pass.
```

**Pravilo:** Determinističke task-ove → striktne instrukcije. Kreativne → sloboda.

---

### 6. Uključi Primere

> "Include example inputs and outputs in your SKILL.md to help Claude understand what success looks like."

```markdown
## Example

**Input:** "Create email to John about meeting"

**Output:**
```
Subject: Quick sync tomorrow?

Hi John,

Would you be available for a 15-min call tomorrow?

Best,
Dario
```
```

---

### 7. Narrow Bridge vs Open Field

**Narrow Bridge** (jedan siguran put):
- Database migrations
- Deployment scripts
- API calls sa auth
- → Striktne instrukcije, exact steps

**Open Field** (više puteva do cilja):
- Code review
- Refactoring
- Documentation
- → General direction, trust Claude

---

### 8. Error Handling

```markdown
## Error Handling

If voiceover generation fails:
1. Check API key validity
2. Retry with shorter text
3. If still fails → report error to user, don't proceed
```

---

### 9. Planning vs Execution

> "Separate planning from execution phases."

```markdown
## Workflow

### PHASE 1: Plan (no changes)
1. Read existing files
2. Analyze structure
3. Present plan to user

### PHASE 2: Execute (with approval)
1. Create files
2. Run commands
3. Validate output
```

---

## SKILL TYPES

### 1. Simple (no reference files)
```
skill/
└── SKILL.md
```
Primer: Email footer, code style preferences

### 2. With Templates
```
skill/
├── SKILL.md
└── templates/
    └── OUTPUT_EXAMPLE.md
```
Primer: Report generator, document creator

### 3. With Scripts
```
skill/
├── SKILL.md
└── scripts/
    └── api_call.py
```
Primer: API integrations, data processing

### 4. Full Package
```
skill/
├── SKILL.md
├── scripts/
├── templates/
├── reference/
└── assets/
```
Primer: Complex workflows, multi-step processes

---

## SKILL LIFECYCLE

```
1. DEFINE USE CASE
   ↓
2. BUILD MINIMAL SKILL
   ↓
3. TEST WITH REAL TASKS
   ↓
4. ITERATE BASED ON FAILURES
   ↓
5. ADD REFERENCE FILES AS NEEDED
   ↓
6. SHARE & VERSION
```

> "Start with basic instructions in Markdown before adding complex scripts."

---

## COMMON MISTAKES

| Mistake | Fix |
|---------|-----|
| Vague description | Be specific about trigger |
| Too long | Max 500 tokens |
| Explaining basics | Trust Claude's knowledge |
| No examples | Add input/output examples |
| All in one file | Split into reference files |
| No error handling | Add failure modes |
| Testing yourself, not skill | Let skill handle task fully |

---

## MCP + SKILLS

> "MCP provides connection to outside world, Skills provide expertise."

```
┌─────────────────────────────────────────┐
│              AGENT                       │
│                                          │
│  ┌──────────┐      ┌──────────┐         │
│  │   MCP    │      │  SKILLS  │         │
│  │ Servers  │      │ Library  │         │
│  └────┬─────┘      └────┬─────┘         │
│       │                 │                │
│  Connectivity      Expertise             │
│  (APIs, DBs)       (How to use them)     │
└─────────────────────────────────────────┘
```

Primer: MCP daje pristup Notion API, Skill zna KAKO da pretražuje workspace.

---

## EVALUATION CHECKLIST

Pre deploy-a skill-a, proveri:

- [ ] **Name** je specifičan i descriptivan
- [ ] **Description** jasno kaže KADA se koristi
- [ ] **Body** je < 500 tokena
- [ ] **Ne objašnjava** ono što Claude zna
- [ ] **Ima primere** input/output
- [ ] **Error handling** postoji
- [ ] **Testiran** na real tasks
- [ ] **Reference files** su razdvojeni od main skill

---

## SKILL SCORING RUBRIC

| Kriterijum | 1 (Loše) | 5 (Odlično) |
|------------|----------|-------------|
| **Trigger clarity** | Vague description | Crystal clear when to use |
| **Conciseness** | 1000+ tokens | < 200 tokens |
| **Examples** | None | Input + Output shown |
| **Error handling** | None | All edge cases |
| **Modularity** | All in one file | Clean separation |
| **Testability** | Can't verify | Clear success criteria |

---

## ANTHROPIC'S VISION

> "Skills are a concrete step towards continuous learning. Anything Claude writes down can be used efficiently by a future version of itself."

**Day 1:** Claude uses basic instructions
**Day 30:** Claude has learned from interactions, skills have evolved

Skills omogućavaju:
- Transferable learning
- Team-wide expertise sharing
- Self-improving agents

---

## NEXT STEPS

1. **Audit existing skills** - score each using rubric
2. **Identify patterns** - what do we repeat?
3. **Build skill library** - start with simple, iterate
4. **Share across team** - version in Git
5. **Let Claude create skills** - use skill-creator skill

---

*Compiled from web research + YouTube transcripts, March 2026*
