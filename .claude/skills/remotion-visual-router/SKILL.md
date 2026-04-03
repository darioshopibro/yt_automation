# Remotion Visual Router

Čita transcript i deli ga na logičke segmente. **Svi segmenti su fullscreen** — Planner će za svaki automatski generisati .tsx komponentu.

**Trigger:** "napravi video", "generiši vizuale", "route visuals", "visual structure"

**Input:** Transcript fajl (čist tekst)
**Output:** `visual-structure.json` u `workspace/{project-name}/`

---

## WORKFLOW

### KORAK 1: Pripremi workspace

```bash
mkdir -p workspace/{project-name}
```

Ako transcript nije u fajlu, sačuvaj ga:
```bash
# workspace/{project-name}/transcript.txt
```

### KORAK 2: Segmentiraj transcript

Pročitaj ceo transcript. Podeli na logičke segmente — svaki segment je promena teme ili koncepta. Za svaki segment zapiši:
- Naslov (kratak, opisuje koncept)
- Koji deo transcripta pokriva (ceo tekst tog segmenta)

Tipično 3-6 segmenata za 4-5 min video.

### KORAK 3: Generiši visual-structure.json

```json
{
  "title": "Video Title",
  "segments": [
    {
      "step": 1,
      "title": "What is Docker",
      "transcriptSegment": "Docker is mainly a software development platform..."
    },
    {
      "step": 2,
      "title": "Containers vs VMs",
      "transcriptSegment": "Docker is a form of virtualization, but unlike virtual machines..."
    },
    {
      "step": 3,
      "title": "Dockerfile to Container",
      "transcriptSegment": "You begin with a Dockerfile, which can be built into a Docker image..."
    }
  ]
}
```

### KORAK 4: Potvrdi output

Prikaži user-u summary:
- Koliko segmenata
- Naslov svakog segmenta
- Koliko teksta pokriva svaki

Reci: "Visual structure generisan. Sledeći korak: pokreni remotion-planner."

---

## REFERENCE

- `.claude/skills/visual-generator/reference/generation-rules.md` — pravila za fullscreen vizuale
