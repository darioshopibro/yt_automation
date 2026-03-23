# Infographic Selection Conditions

> Uslovi za AI izbor infographic tipa na osnovu skripte

---

## 1. Node/Flow Diagram (EXISTING - node-canvas)

**Svrha:** architecture, connections, data-flow, how-things-work

**Koristi kad:**
- Skripta opisuje kako sistem funkcioniše
- Ima više komponenti koje komuniciraju
- Prikazuje pipeline ili data flow
- Objašnjava arhitekturu softvera/sistema

**Keywords/triggers:**
- "architecture", "how it works", "under the hood"
- "connects to", "sends to", "receives from"
- "pipeline", "flow", "data flows"
- "layer 1", "layer 2", "components"
- "API", "server", "database", "gateway"
- "input → process → output"

**Struktura:**
- Nodes (boxes/circles) sa labelama
- Arrows pokazuju smer toka
- Optional: animated data particles

**Broj elemenata:** 3-8 nodes

### TEST SNIPPETS - Node/Flow Diagram

```
VIDEO: ByteMonk - RAG System
TEKST: "User sends query → embedding → vector search → retrieve chunks"
NODES: [User Query] → [Embedding] → [Vector Search] → [Retrieved Chunks]
```

```
VIDEO: ByteMonk - RAG System
TEKST: "Data sources → restructuring layer → structure-aware chunking → metadata creation → database"
NODES: [Data Sources] → [Restructuring] → [Chunking] → [Metadata] → [Database]
```

```
VIDEO: ByteMonk - OpenClaw
TEKST: "4 layers: Gateway → Reasoning Layer → Memory System → Skills/Execution"
NODES: [Gateway] → [Reasoning] → [Memory] → [Execution]
```

```
VIDEO: Fireship - CI/CD
TEKST: "Push to master → trigger workflow → Linux container → checkout → test → build → deploy"
NODES: [Push] → [Trigger] → [Container] → [Checkout] → [Test] → [Build] → [Deploy]
```

```
VIDEO: Fireship - Kubernetes
TEKST: "Control plane: API server connects to etcd database, manages worker nodes"
NODES: [Control Plane] ─┬─ [API Server] ─── [etcd]
                        └─ [Worker Nodes]
```

---

## 2. Timeline

**Svrha:** show-progression, history, evolution, milestones

**Koristi kad:**
- Skripta priča o istoriji/evoluciji
- Ima vremenske markere
- Sekvencijalni događaji kroz vreme
- "Pre X godina... sada..."

**Keywords/triggers:**
- "history of", "evolution of", "timeline"
- "first", "then", "finally", "eventually"
- "in 2020", "years ago", "years later"
- "started as", "became", "transformed into"
- "before... now...", "used to... now..."
- "version 1", "version 2", "v3"

**Struktura:**
- Horizontalna ili vertikalna linija
- Tačke/milestone na liniji
- Datumi ili labele ispod/iznad
- Sequential reveal animation

**Broj elemenata:** 3-8 milestone-ova

### TEST SNIPPETS - Timeline

```
VIDEO: ByteMonk - Software Factory
TEKST: "Before late 2024: errors compounding. October 2024: compounding correctness started"
MILESTONES: [Before 2024: Errors] ──── [Oct 2024: Shift] ──── [Now: AI Writes Code]
```

```
VIDEO: ByteMonk - Software Factory
TEKST: "2017: 93% Google jobs required degree → 2022: 77% → now: falling further"
MILESTONES: [2017: 93%] ──── [2022: 77%] ──── [Now: Lower]
```

```
VIDEO: Fireship - ML
TEKST: "1959: Arthur Samuel at IBM coined the term, developing AI for checkers"
MILESTONES: [1959: Term Coined] ──── [...] ──── [Today: Everywhere]
```

---

## 3. Comparison / Versus

**Svrha:** A vs B, pros/cons, before/after, differences

**Koristi kad:**
- Skripta poredi dve stvari
- Objašnjava razlike
- Shows advantages/disadvantages
- Before/after scenarios

**Keywords/triggers:**
- "vs", "versus", "compared to"
- "difference between", "unlike"
- "on one hand... on the other"
- "pros and cons", "advantages"
- "before... after...", "old way... new way"
- "traditional vs modern"
- "instead of"

**Struktura:**
- Split screen (levo/desno)
- Ili comparison table
- Check/X marks
- Highlighting differences

**Broj elemenata:** 2 strane, 3-6 poređenja

### TEST SNIPPETS - Comparison

```
VIDEO: ByteMonk - RAG System
TEKST: "LLMs don't know your private data. They were trained on public internet, not your internal wiki."
LEFT: [LLM Knowledge: Public Internet]
RIGHT: [Your Data: Private Wiki]
```

```
VIDEO: ByteMonk - OpenClaw
TEKST: "Most AI tools: you ask, get answer. OpenClaw flips that - it's autonomous."
LEFT: [Chatbot: You Ask → Answer]
RIGHT: [OpenClaw: Autonomous Action]
```

```
VIDEO: Two Minute Papers - AlphaFold
TEKST: "Pennies to read DNA sequence. $100,000 + 1 year for structure experimentally."
LEFT: [DNA Sequence: Pennies, Fast]
RIGHT: [Structure: $100k, 1 Year]
```

```
VIDEO: ByteMonk - Software Factory
TEKST: "1 US engineer $150k = 5 Indian engineers same price. But AI needs fewer engineers, period."
LEFT: [Old Model: Cost Arbitrage]
RIGHT: [AI Model: Fewer Engineers]
```

---

## 4. Statistics Display / Metrics

**Svrha:** impressive numbers, key metrics, research findings

**Koristi kad:**
- Skripta navodi konkretne brojeve
- Percentage, millions, growth rates
- Research findings sa ciframa
- Impact metrics

**Keywords/triggers:**
- Brojevi: "25%", "1 million", "$100k"
- "statistics show", "research found"
- "X out of Y", "X times more"
- "grew by", "dropped by", "increased"
- "users", "downloads", "revenue"
- "according to study"

**Struktura:**
- Large animated numbers (count-up)
- Percentage circles/bars
- Metric cards grid
- Emphasis effects (glow, scale)

**Broj elemenata:** 1-4 key stats

### TEST SNIPPETS - Statistics

```
VIDEO: ByteMonk - OpenClaw
TEKST: "200,000 GitHub stars. 20% of plugin marketplace is malware. 30,000 exposed instances."
STATS: [200K Stars] [20% Malware] [30K Exposed]
```

```
VIDEO: ByteMonk - Software Factory
TEKST: "Google: 25%+ code by AI. Microsoft: 30%. Two lakh crores wiped in hours."
STATS: [Google 25%] [Microsoft 30%] [₹2L Cr Lost]
```

```
VIDEO: Two Minute Papers - AlphaFold
TEKST: "21,000 citations. 200 million proteins predicted. 3 million scientists used it."
STATS: [21K Citations] [200M Proteins] [3M Scientists]
```

```
VIDEO: ByteMonk - Software Factory
TEKST: "Nifty IT dropped 6% in one day, 9% in four sessions"
STATS: [-6% Day 1] [-9% Week]
```

---

## 5. Process Steps / How-To

**Svrha:** step-by-step, sequential instructions, workflow

**Koristi kad:**
- Skripta objašnjava proces korak po korak
- Numbered steps
- "First do X, then Y, finally Z"
- Tutorial/how-to content

**Keywords/triggers:**
- "step 1", "step 2", "step 3"
- "first", "second", "third"
- "then", "next", "after that", "finally"
- "how to", "process", "workflow"
- "start by", "begin with"

**Struktura:**
- Numbered circles (1, 2, 3...)
- Arrows ili linije između
- Icons per step
- Sequential reveal + checkmarks

**Broj elemenata:** 3-7 steps

### TEST SNIPPETS - Process Steps

```
VIDEO: Fireship - ML
TEKST: "Step 1: acquire and clean data. Step 2: separate into training/testing. Step 3: choose algorithm. Step 4: train. Step 5: validate."
STEPS: [1. Clean Data] → [2. Split] → [3. Choose Algo] → [4. Train] → [5. Validate]
```

```
VIDEO: ByteMonk - RAG
TEKST: "Retrieval, Augmentation, Generation - that's where the name comes from"
STEPS: [1. Retrieve] → [2. Augment] → [3. Generate]
```

```
VIDEO: Two Minute Papers - AlphaFold
TEKST: "Diffusion: starts from noise, over time reorganizes into 3D molecular structure"
STEPS: [1. Noise] → [2. Reorganize] → [3. 3D Structure]
```

---

## 6. Hierarchy / Tree Structure

**Svrha:** organization, nested relationships, system structure

**Koristi kad:**
- Skripta opisuje hijerarhiju
- Parent-child relationships
- Categories and subcategories
- System components with nesting

**Keywords/triggers:**
- "consists of", "contains", "includes"
- "parent", "child", "nested"
- "hierarchy", "structure", "organization"
- "layers", "levels", "tiers"
- "under", "within", "inside"

**Struktura:**
- Tree diagram (top-down or left-right)
- Expandable nodes
- Indentation levels
- Branch animations

**Broj elemenata:** 2-4 levels, 3-10 nodes

### TEST SNIPPETS - Hierarchy

```
VIDEO: Fireship - Kubernetes
TEKST: "Cluster contains control plane and nodes. Nodes contain cubelets. Cubelets contain pods. Pods contain containers."
TREE:
Cluster
├── Control Plane
│   ├── API Server
│   └── etcd
└── Nodes
    └── Cubelets
        └── Pods
            └── Containers
```

```
VIDEO: ByteMonk - OpenClaw
TEKST: "Memory system: session logs, user preferences, semantic memories - all just markdown files"
TREE:
Memory System
├── Session Logs
├── User Preferences
└── Semantic Memories
```

---

## 7. Data Visualization / Charts

**Svrha:** trends over time, growth/decline, quantitative comparison

**Koristi kad:**
- Skripta prikazuje trend
- Rast ili pad kroz vreme
- Multiple data points to compare
- Requires visual chart (bar, line, pie)

**Keywords/triggers:**
- "grew from X to Y", "dropped", "increased"
- "over time", "trend", "growth"
- "chart shows", "graph", "data"
- "percentage breakdown"
- Years + numbers combined

**Struktura:**
- Bar chart (horizontal/vertical)
- Line chart (trends)
- Pie/donut (breakdown)
- Animated growth

**Broj elemenata:** 3-10 data points

### TEST SNIPPETS - Data Viz

```
VIDEO: ByteMonk - Software Factory
TEKST: "Infosys -8%, LTI Minds -8%, TCS down, Wipro down, Tech Mahindra down"
CHART: Bar chart showing drops per company
```

```
VIDEO: Two Minute Papers - AlphaFold
TEKST: "Accuracy doubled on antibodies, marginally better on proteins, beats physics on ligands"
CHART: Grouped bar - AlphaFold 2 vs 3 per category
```

---

## 8. Educational Diagram / Labeled Illustration

**Svrha:** technical concepts, analogies, component breakdown

**Koristi kad:**
- Skripta koristi analogiju
- Objašnjava naučni/tehnički koncept
- "Think of it as...", "Imagine..."
- Visual metaphor needed

**Keywords/triggers:**
- "think of it as", "imagine"
- "like a", "similar to", "analogy"
- "picture this", "visualize"
- Technical terms that need illustration

**Struktura:**
- Central illustration
- Label lines pointing to parts
- Callout boxes
- Zoom + highlight animation

**Broj elemenata:** 1 main visual + 3-6 labels

### TEST SNIPPETS - Educational Diagram

```
VIDEO: Fireship - Kubernetes
TEKST: "Imagine orchestra. Musicians = containers. Conductor = Kubernetes. Music = workload."
DIAGRAM: Orchestra visual with labeled parts
```

```
VIDEO: ByteMonk - OpenClaw
TEKST: "Context window is your RAM. Files on disk are storage. Compact operation is like virtual memory paging."
DIAGRAM: Computer memory visual with labeled analogy
```

```
VIDEO: Two Minute Papers - AlphaFold
TEKST: "Protein: string of amino acids folds into 3D structure"
DIAGRAM: Chain → fold → 3D shape visualization
```

---

## 9. Icon Grid / Feature List

**Svrha:** capabilities, feature lists, multi-point overview

**Koristi kad:**
- Skripta lista više features/capabilities
- "It can do X, Y, Z..."
- Multiple parallel items
- No inherent order

**Keywords/triggers:**
- "features include", "capabilities"
- "can do X, Y, and Z"
- "supports", "offers", "provides"
- "types of", "categories"
- Comma-separated lists

**Struktura:**
- Grid of icons (2x2, 3x3)
- Label under each icon
- Sequential reveal
- Hover/highlight states

**Broj elemenata:** 4-9 items

### TEST SNIPPETS - Icon Grid

```
VIDEO: ByteMonk - OpenClaw
TEKST: "Connects to WhatsApp, Slack, email, calendar, terminal, browser"
ICONS: [WhatsApp] [Slack] [Email] [Calendar] [Terminal] [Browser]
```

```
VIDEO: Two Minute Papers - AlphaFold 3
TEKST: "Now handles proteins, ligands, ions, DNA, and RNA"
ICONS: [Proteins] [Ligands] [Ions] [DNA] [RNA]
```

```
VIDEO: Two Minute Papers - AlphaFold
TEKST: "Applications: drug development, biorenewable materials, resilient crops, genomics"
ICONS: [Drugs] [Materials] [Crops] [Genomics]
```

---

## Quick Reference - Decision Tree

```
SKRIPTA KAŽE...                          → INFOGRAPHIC
─────────────────────────────────────────────────────────
"X connects to Y, sends to Z"            → Node/Flow Diagram
"In 2020... then in 2022... now..."      → Timeline
"X vs Y", "unlike", "compared to"        → Comparison
"25%", "1 million users", "$100k"        → Statistics Display
"Step 1... Step 2... Step 3..."          → Process Steps
"Contains X, which has Y inside"         → Hierarchy/Tree
"Grew from X to Y over time"             → Data Visualization
"Think of it as...", "Imagine..."        → Educational Diagram
"Features: A, B, C, D"                   → Icon Grid
```

---

## Priority Matrix za AI Izbor

| Ako detektujemo... | Prioritet | Tip |
|--------------------|-----------|-----|
| Architecture keywords + multiple components | 1st | Node/Flow |
| Numbers/percentages prominent | 1st | Statistics |
| Explicit comparison ("vs", "unlike") | 1st | Comparison |
| Step-by-step language | 2nd | Process Steps |
| Time markers + progression | 2nd | Timeline |
| Nesting/containment language | 3rd | Hierarchy |
| Analogy/metaphor | 3rd | Educational |
| List of features | 3rd | Icon Grid |
| Trend/growth data | 3rd | Data Viz |

---

## EXISTING TEMPLATE TEST CASES

Ovo su konkretni snippeti za testiranje `node-canvas` templatea:

### Test Case 1: RAG Pipeline
```
Input: "User sends query which gets converted to embedding, then vector search finds relevant chunks"
Expected nodes: [User Query] → [Embedding] → [Vector Search] → [Chunks]
```

### Test Case 2: CI/CD Pipeline
```
Input: "Code push triggers workflow on Linux container: checkout, install, test, build, deploy"
Expected nodes: [Push] → [Workflow] → [Checkout] → [Install] → [Test] → [Build] → [Deploy]
```

### Test Case 3: OpenClaw Layers
```
Input: "Four layers: Gateway handles connections, Reasoning runs LLM, Memory stores state, Execution runs skills"
Expected nodes: [Gateway] → [Reasoning] → [Memory] → [Execution]
```

### Test Case 4: Software Factory
```
Input: "Humans write specifications, AI agents write code, test it, review it, and ship it"
Expected nodes: [Humans: Specs] → [AI: Write] → [AI: Test] → [AI: Review] → [Ship]
```
