# Agent vs Skill vs Sub-Agent — Research Findings

## Kad koristiti šta

| Mehanizam | Kad koristiti | Kontekst | Ograničenja |
|-----------|--------------|----------|-------------|
| **Skill** | Instrukcije/pravila koja agent treba da prati | Učitava se u MAIN kontekst (troši tokene) | Nema izolaciju — sve ide u isti kontekst |
| **Sub-agent** | Fokusiran task koji vraća rezultat | SVOJ kontekst — ne zagađuje main | NE MOŽE da spawnuje druge sub-agente |
| **Agent Teams** | Koordinacija između više agenata | Svaki svoj kontekst, mogu da komuniciraju | Teammates NE MOGU da spawnuju sub-agente |

## Ključna ograničenja (BITNO!)

1. **Sub-agenti NE MOGU da spawnuju druge sub-agente** — nema nestovanja
2. **Sub-agenti NE MOGU da koriste Agent tool** — samo main session može
3. **Arhitektura je hub-and-spoke** — main session je centar, sub-agenti su spokes
4. **Teammates NE MOGU da spawnuju sub-agente, kreiraju timove, ili dodaju druge teammate-ove**
5. **Agent tool, TeamCreate, TeamDelete, CronCreate/Delete/List se UKLANJAJU iz teammate-a pri spawn-u**
6. **Sva orkestracaja mora da ide kroz main session (team lead)**

## Sub-agent definicija (.claude/agents/)

```yaml
---
name: visual-segmenter
description: Segmentira transcript i bira vizual tipove
tools: Read, Glob, Grep, Bash
model: sonnet
---
Ti si specialist za segmentaciju tech transcripta...
(system prompt — max 300 linija)
```

- Sub-agent prima SAMO ovaj system prompt (ne full Claude Code prompt)
- Može imati persistent memory u `~/.claude/agent-memory/`
- `--agent <name>` startuje sesiju gde main thread preuzima taj prompt

## Zašto sub-agenti pomažu za naš problem

**Problem:** Visual Router ima 1787 linija pravila. Agent zaboravi dok generiše.

**Rešenje sa sub-agentima:**
- Svaki sub-agent čita SAMO svoja pravila (~300 linija)
- Main session orkestrira — ne drži sva pravila u glavi
- Kontekst izolacija — Segmenter ne vidi Extractor pravila i obrnuto
- Verbose output (čitanje fajlova, razmišljanje) ne zagađuje main

## Predložena arhitektura za Visual Router

```
Main Session (Orchestrator — skill ili user)
  │
  ├── spawn Sub-agent A: "visual-segmenter"
  │   Input: transcript tekst
  │   Pravila: samo segmentacija + vizual detekcija (~200 linija)
  │   Output: segmenti sa vizual tipovima (JSON)
  │
  ├── spawn Sub-agent B: "visual-extractor"
  │   Input: segmenti + transcript
  │   Pravila: samo ekstrakcija podataka po tipu (~300 linija)
  │   Output: sekcije sa visualData (JSON)
  │
  └── spawn Sub-agent C: "visual-composer"
      Input: sekcije sa visualData
      Pravila: samo composition/shape/grouping (~300 linija)
      Output: visual-structure.json (finalni output)
```

**NE MOŽE:**
```
Sub-agent A → spawn Sub-agent B  ❌ (sub-agenti ne mogu da spawnuju)
Sub-agent A → koristi Agent tool  ❌ (nemaju pristup)
```

**MOŽE:**
```
Main → spawn A → čeka rezultat → spawn B → čeka → spawn C  ✅
Main → spawn B1, B2, B3 paralelno → čeka sve  ✅
```

## Alternativa: 3 skilla umesto sub-agenata

```
remotion-segmenter/SKILL.md (~200 linija)
remotion-extractor/SKILL.md (~300 linija)
remotion-composer/SKILL.md (~300 linija)
```

**Problem:** Skillovi se učitavaju u ISTI kontekst — nema izolacije.
Ako orchestrator pozove skill 1 pa skill 2 pa skill 3, sva 3 su u istom kontekstu.
Ukupno: 800 linija u kontekstu — bolje od 1787 ali i dalje sve zajedno.

**Sub-agenti su BOLJI jer:**
- Svaki ima SVOJ kontekst (izolacija)
- Verbose output (čitanje fajlova) ne ide u main
- Main session dobija samo REZULTAT (sažetak)

## Rizici

1. **Koordinacija** — sub-agenti ne vide jedni druge. Ako Segmenter odluči "timeline" a Extractor ne zna šta je timeline → problem. Rešenje: jasno definisan interface (JSON format) između koraka.

2. **Duplikati ikona** — ako B1, B2, B3 rade paralelno, mogu da izaberu istu ikonu. Rešenje: Composer (C) na kraju proverava i fiksuje.

3. **Overhead** — 3 sub-agent spawna = 3× inicijalizacija. Ali svaki je brži jer ima manje pravila.

4. **Debugging** — kad nešto ne radi, teže je naći gde je greška (A, B, ili C?). Rešenje: svaki korak loguje output u workspace/.

## Izvori

- [Claude Code Sub-agents Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Agent SDK Subagents](https://platform.claude.com/docs/en/agent-sdk/subagents)
- [Skills Explained](https://claude.com/blog/skills-explained)
- [Best Practices for Sub-agents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Mental Model: Skills, Subagents, Plugins](https://levelup.gitconnected.com/a-mental-model-for-claude-code-skills-subagents-and-plugins-3dea9924bf05)
- [Sub-agents cannot spawn sub-sub-agents (Bug #19077)](https://github.com/anthropics/claude-code/issues/19077)
- [Teammates lack Agent tool (Bug #31977)](https://github.com/anthropics/claude-code/issues/31977)
