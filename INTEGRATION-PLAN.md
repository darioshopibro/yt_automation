# Explainer Integration Plan

## CILJ
Integrisati Explainer layouts (FLOW, VS, IF/ELSE, MERGE...) u DynamicPipeline sistem tako da AI može automatski da prepozna koji layout koristiti na osnovu transkripta.

---

## ARHITEKTURA

### Trenutno:
```
StickyNote → SectionBox → NodeItem[] (GRID)
```

### Novo:
```
StickyNote → SectionBox → ExplainerLayout → Node + Connectors
                          ↓
                    layout: "grid" | "flow" | "vs" | "combine" | "if-else" | "merge" | "negation"
```

---

## FAZE IMPLEMENTACIJE

### FAZA 1: Komponente (ExplainerLayout.tsx)

**Kreirati novi fajl:** `src/ExplainerLayout.tsx`

Sadržaj:
- Import svih komponenti iz ExplainerTest.tsx
- Export `ExplainerLayout` komponenta koja prima:
  - `layout`: tip layout-a
  - `nodes`: lista nodova sa icon + label + color
  - `frame`: za animaciju
  - `activeIntensity`: za highlight efekat

Layout tipovi:
| Layout     | Nodes | Vizual                    |
|------------|-------|---------------------------|
| grid       | 1-4   | CSS Grid (postojeći)      |
| flow       | 2-4   | A → B → C                 |
| vs         | 2     | A vs B                    |
| combine    | 3     | A + B = C                 |
| if-else    | 3     | A → [B, C]                |
| merge      | 3     | [A, B] → C                |
| negation   | 2     | ✗A → B                    |

---

### FAZA 2: JSON Config Format

**Novi format za sekciju:**
```json
{
  "id": "VECTOR_SEARCH",
  "title": "Vector Search",
  "layout": "flow",        // NEW! default: "grid"
  "colorKey": "embedding",
  "startFrame": 200,
  "nodes": [
    { "label": "Query", "icon": "search", "color": "blue" },
    { "label": "Embed", "icon": "cube", "color": "green" },
    { "label": "Vector DB", "icon": "database", "color": "purple" }
  ]
}
```

**Node format sa opcionalnom bojom:**
```json
{ "label": "...", "icon": "...", "color": "blue" }  // blue/green/orange/purple/red
```

---

### FAZA 3: Skill Update (SKILL.md)

**Dodati pravila za prepoznavanje layout-a:**

```markdown
## Layout Detection Rules

### FLOW (A → B → C)
Trigger phrases:
- "goes to", "leads to", "becomes"
- "transforms into", "passes to"
- "first... then... finally"
- Sequential process description

### VS (A vs B)
Trigger phrases:
- "versus", "compared to", "vs"
- "or alternatively", "unlike"
- "on one hand... on the other"
- Comparison of 2 approaches

### COMBINE (A + B = C)
Trigger phrases:
- "combines with", "merged with"
- "together they form", "plus"
- "A and B create C"

### IF/ELSE (A → [B, C])
Trigger phrases:
- "if... else", "either... or"
- "depending on", "based on"
- "splits into", "branches to"
- Decision point

### MERGE ([A, B] → C)
Trigger phrases:
- "all converge to", "unite into"
- "both lead to", "all go to"
- Multiple inputs, single output

### NEGATION (✗A → B)
Trigger phrases:
- "not A, but B", "instead of"
- "rather than", "replaces"
- "bad practice vs good practice"
```

---

### FAZA 4: SectionBox Update

Modifikovati `SectionBox` da:
1. Čita `layout` prop iz config-a
2. Ako je `layout !== "grid"`, renderuje `ExplainerLayout`
3. Ako je `layout === "grid"` (ili undefined), koristi postojeći CSS Grid

```tsx
// U SectionBox komponenti:
{layout && layout !== "grid" ? (
  <ExplainerLayout
    layout={layout}
    nodes={nodes}
    frame={frame}
    colorScheme={colorScheme}
  />
) : (
  // Postojeći CSS Grid
  <div style={{ display: "grid", ... }}>
    {children}
  </div>
)}
```

---

### FAZA 5: Dimenzije Sync

**Uskladiti dimenzije između ExplainerTest i DynamicPipeline:**

| Konstanta       | Nova vrednost | Opis                      |
|-----------------|---------------|---------------------------|
| ICON_SIZE       | 56px          | Veličina icon boxa        |
| ICON_CENTER     | 28px          | Centar za strelice        |
| NODE_GAP        | 8px           | Gap icon-label            |
| LABEL_HEIGHT    | 14px          | Visina labele             |
| NODE_HEIGHT     | 78px          | Ukupna visina noda        |
| STACK_GAP       | 20px          | Gap između stacked nodova |
| STACKED_HEIGHT  | 176px         | Visina IF/ELSE, MERGE     |
| CONNECTOR_GAP   | 20px          | Gap između noda i arrow-a |

**Kreirati shared constants file:** `src/dimensions.ts`

---

## AUTO-SIZING LOGIKA

Za SectionBox:
1. Ako `layout === "grid"`: postojeća logika (cols × rows)
2. Ako `layout === "flow"`: width = N × NODE_WIDTH + (N-1) × GAP, height = NODE_HEIGHT
3. Ako `layout === "vs"`: width = 2 × NODE + VS_SYMBOL + gaps
4. Ako `layout === "if-else"`: width = INPUT + ARROW + STACKED, height = STACKED_HEIGHT
5. Ako `layout === "merge"`: width = STACKED + ARROW + OUTPUT, height = STACKED_HEIGHT

---

## PRIMER KOMPLETNOG CONFIG-a

```json
{
  "title": "RAG Pipeline",
  "fps": 30,
  "totalFrames": 1200,
  "stickies": [
    {
      "step": 1,
      "title": "Retrieve",
      "color": "#a855f7",
      "sections": [
        {
          "id": "QUERY_FLOW",
          "title": "Query Processing",
          "layout": "flow",
          "startFrame": 100,
          "nodes": [
            { "label": "Query", "icon": "search", "color": "blue" },
            { "label": "Embed", "icon": "cube", "color": "green" },
            { "label": "Vector DB", "icon": "database", "color": "purple" }
          ]
        },
        {
          "id": "RETRIEVAL_DECISION",
          "title": "Retrieval Strategy",
          "layout": "if-else",
          "startFrame": 300,
          "nodes": [
            { "label": "Query Type", "icon": "search", "color": "blue" },
            { "label": "Semantic", "icon": "brain", "color": "green" },
            { "label": "Keyword", "icon": "terminal", "color": "orange" }
          ]
        }
      ]
    },
    {
      "step": 2,
      "title": "Augment",
      "color": "#f97316",
      "sections": [
        {
          "id": "CONTEXT_MERGE",
          "title": "Context Building",
          "layout": "combine",
          "startFrame": 500,
          "nodes": [
            { "label": "Chunks", "icon": "file", "color": "purple" },
            { "label": "Query", "icon": "search", "color": "blue" },
            { "label": "Prompt", "icon": "sparkle", "color": "green" }
          ]
        }
      ]
    }
  ]
}
```

---

## CHECKLIST

- [ ] Kreirati `src/ExplainerLayout.tsx`
- [ ] Kreirati `src/dimensions.ts` (shared constants)
- [ ] Update `SectionBox` sa layout prop
- [ ] Update `getSectionBoxSize()` za nove layouts
- [ ] Merge Icon komponente (35 ikona)
- [ ] Update SKILL.md sa layout detection rules
- [ ] Test sa primer config-om
- [ ] Validacija dimenzija i alignment-a

---

## NOTES

- Svaki layout mora da radi sa 2-4 noda
- Boje nodova su opcione - default je boja sekcije
- Strelice/konektori se automatski generišu
- AI ne treba da brine o dimenzijama - samo layout tip
