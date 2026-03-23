---
name: openclaw
description: Building OpenClaw agents, skills, subagents, and Python scripts. Use when creating or modifying anything in OpenClaw workspace.
---

# OpenClaw Building Patterns

Use this skill when building OpenClaw agents, skills, subagents, or Python scripts.

## Quick Reference

| Building... | Create | Location |
|-------------|--------|----------|
| Skill | `SKILL.md` + `scripts/` | `/root/.openclaw/workspace/skills/<name>/` |
| Agent | Entry in `AGENTS.md` | `/root/.openclaw/workspace/AGENTS.md` |
| Subagent | Entry in `AGENTS.md` | Same (subagents read AGENTS.md) |
| Python script | `.py` in `scripts/` | Inside skill folder |
| Tool | **CAN'T** | Tools are built-in to OpenClaw |

## Full Guide

Read [OPENCLAW_BUILDING_GUIDE.md](openClawIntegration/OPENCLAW_BUILDING_GUIDE.md) for complete instructions.

## Key Patterns

### SKILL.md Frontmatter

```yaml
---
name: my-skill
description: What this skill does
---
```

### Python Script Output

```python
# Success
print(json.dumps({"success": True, "data": result}))

# For quiz scripts
print("QUIZ_STARTED:message_id=123")
print("NO_REPLY")
```

### AGENTS.md Entry

```markdown
### Agent: MyAgent

**Role:** Brief description
**Skills:**
- `/root/.openclaw/workspace/skills/skill-name/SKILL.md`

**After quiz script:** Say ONLY `ANNOUNCE_SKIP`
```

### Callback Data Format

```
prefix|task_id|action|value
```

Examples: `quiz|cal_123|proceed`, `contact|c_456|add`

## What Subagents Read

- `AGENTS.md` (always loaded)
- `TOOLS.md` (always loaded)
- `SKILL.md` (on-demand when needed)

**NOT read:** SOUL.md, USER.md, MEMORY.md, individual agent files

## Tools vs Skills vs Scripts

- **Tools** = Built-in capabilities (exec, read, write) - CAN'T create
- **Skills** = Knowledge/workflows (SKILL.md) - WE create
- **Scripts** = Executable code (Python) - Inside skills

## Remember

1. Always use `python3` not `python`
2. After quiz scripts, agent says `ANNOUNCE_SKIP`
3. Keep AGENTS.md entries SHORT (~15 lines)
4. Put detailed instructions in SKILL.md files
5. Scripts output JSON
6. Store quiz state in `/tmp/openclaw_<type>/`
