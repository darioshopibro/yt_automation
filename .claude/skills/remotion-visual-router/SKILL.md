# Remotion Visual Router

Čita transcript i generiše vizualnu strukturu za video. Koristi 2 specijalizovana agenta: Generator i Validator.

**Trigger:** "napravi video", "generiši vizuale", "route visuals", "visual structure"

**Input:** Transcript fajl (čist tekst)
**Output:** `visual-structure.json` u `workspace/{project-name}/`

---

## WORKFLOW — 2 agenta sekvencijalno

### KORAK 1: Pripremi workspace

```bash
mkdir -p workspace/{project-name}
```

Ako transcript nije u fajlu, sačuvaj ga:
```bash
# workspace/{project-name}/transcript.txt
```

### KORAK 2: Pokreni Visual Generator agenta

Koristi Agent tool sa subagent_type `visual-generator`:

```
Prompt za agenta:
"Pročitaj transcript iz workspace/{project-name}/transcript.txt
Generiši visual-structure.json i sačuvaj u workspace/{project-name}/visual-structure.json
Projekat se zove: {project-name}"
```

Generator će:
- Pročitati reference/extraction-rules.md i reference/visual-catalog.md
- Segmentirati transcript
- Izabrati vizuale za svaki segment
- Izvući podatke iz teksta
- Grupisati u sticky-je
- Sačuvati draft visual-structure.json

### KORAK 3: Pokreni Visual Validator agenta

Koristi Agent tool sa subagent_type `visual-validator`:

```
Prompt za agenta:
"Pročitaj visual-structure.json iz workspace/{project-name}/visual-structure.json
Validiraj prema composition pravilima i popravi sve greške.
Sačuvaj popravljeni fajl na isto mesto."
```

Validator će:
- Pročitati reference/composition-rules.md i reference/examples.md
- Proveriti SVA pravila (composition, shape, density, variety, disambiguation)
- Popraviti greške
- Sačuvati finalni visual-structure.json

### KORAK 4: Potvrdi output

Pročitaj finalni visual-structure.json i prikaži user-u summary:
- Koliko sticky-ja
- Koliko sekcija (vizuali vs ikone)
- Koji vizual tipovi su korišćeni
- Direction flow

Reci user-u: "Visual structure generisan. Sledeći korak: pokreni remotion-planner."

---

## REFERENCE (za agente, ne za ovaj skill)

Reference fajlovi ostaju u `reference/` folderu — agenti ih čitaju sami:
- `reference/extraction-rules.md` — koristi Generator
- `reference/visual-catalog.md` — koristi Generator
- `reference/composition-rules.md` — koristi Validator
- `reference/examples.md` — koristi Validator

## BACKUP

Originalni monolitni SKILL.md je sačuvan u `SKILL.backup.md` za reference.
