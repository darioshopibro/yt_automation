# Video Analysis - Infographic Mapping

> Analiza pravih tech explainer videa i mapiranje sekcija na infographic tipove

---

## 1. ByteMonk - "How to Build a Scalable RAG System"

**Video:** [Full Architecture](https://www.youtube.com/watch?v=4KiiKQ9RVvA)
**Duzina:** 15:53

### Sekcija Breakdown:

| Timestamp | Sekcija teksta | Infographic tip |
|-----------|----------------|-----------------|
| 0:00-0:30 | "Large language models don't know anything about your private data..." | **Comparison** - LLM knowledge vs private data |
| 0:30-1:00 | "RAG: Retrieval, Augmentation, Generation - that's where the name comes from" | **Process Steps** - 3 steps: Retrieve → Augment → Generate |
| 1:00-1:30 | "Google research: when retrieval is off, LLM hallucinates more" | **Statistics Display** - Research finding |
| 1:30-2:30 | "User sends query → embedding → vector search → retrieve chunks" | **Node/Flow Diagram** - Query pipeline flow |
| 2:30-4:00 | "What can go wrong: 2019 policy outdated, table jumbled, context incomplete" | **Comparison** - Expected vs actual behavior |
| 4:00-6:00 | "Production RAG architecture: data sources → restructuring → chunking → metadata → database" | **Node/Flow Diagram** - Full architecture |
| 6:00-7:00 | "Query side: reasoning engine, planner, multi-agent system, validation nodes" | **Hierarchy/Tree** - System components |
| 7:00-8:00 | "Evaluation: qualitative, quantitative, performance metrics" | **Icon Grid** - Evaluation types |
| 8:00-10:00 | "Data injection: PDFs → restructure → structure-aware chunking → metadata" | **Process Steps** - Injection pipeline |
| 10:00-12:00 | "256-512 tokens per chunk, overlap for context" | **Statistics Display** - Technical specs |

**Pattern:** Heavy use of **Node/Flow Diagrams** and **Process Steps**

---

## 2. ByteMonk - "OpenClaw: Most Dangerous AI Project"

**Video:** [OpenClaw Explained](https://www.youtube.com/watch?v=Hv84JhzKvKQ)
**Duzina:** 10:58

### Sekcija Breakdown:

| Timestamp | Sekcija teksta | Infographic tip |
|-----------|----------------|-----------------|
| 0:00-0:30 | "200,000 stars, connects to WhatsApp, Slack, email, calendar" | **Statistics Display** - GitHub stars, platform list |
| 0:30-1:00 | "20% of plugin marketplace is malware, Meta banned it" | **Statistics Display** - Security findings |
| 1:00-2:00 | "Most AI tools: you ask, you get answer. OpenClaw flips that - autonomous" | **Comparison** - Chatbot vs Autonomous agent |
| 2:00-3:00 | "Two things needed: autonomous invocation + persistent state" | **Process Steps** - 2 key primitives |
| 3:00-5:00 | "4 layers: Gateway → Reasoning → Memory → Skills/Execution" | **Node/Flow Diagram** - Architecture layers |
| 5:00-6:00 | "Gateway: websocket server, message broker + orchestrator" | **Educational Diagram** - Layer 1 breakdown |
| 6:00-7:00 | "Memory: markdown files, write-ahead logging pattern" | **Comparison** - RAM vs Storage analogy |
| 7:00-8:00 | "Context window = RAM, files = storage, compact = paging" | **Educational Diagram** - Technical analogy |
| 8:00-9:00 | "Security attack: websocket no origin validation → token steal" | **Process Steps** - Attack chain |
| 9:00-10:00 | "800 malicious skills = 20% of marketplace, 30,000 exposed instances" | **Statistics Display** - Security stats |

**Pattern:** Mix of **Architecture Diagrams** and **Statistics**

---

## 3. ByteMonk - "The End of Coding Jobs? AI Software Factory"

**Video:** [Software Factory](https://www.youtube.com/watch?v=xz1EDn4khLA)
**Duzina:** 12:00

### Sekcija Breakdown:

| Timestamp | Sekcija teksta | Infographic tip |
|-----------|----------------|-----------------|
| 0:00-0:45 | "February this year, Nifty IT dropped 6% in one day, 9% in four days" | **Data Visualization** - Stock chart drop |
| 0:45-1:30 | "Anthropic launched Cloud CoWork - 11 specialized AI coworkers" | **Statistics Display** - 11 AI types |
| 1:30-2:30 | "Infosys -8%, LTI Minds -8%, TCS, Wipro all red. 2 lakh crores wiped" | **Data Visualization** - Stock drops table |
| 2:30-4:00 | "Software Factory: Humans write specs → AI writes code, tests, reviews" | **Node/Flow Diagram** - Factory pipeline |
| 4:00-5:00 | "Before 2024: each iteration = more bugs. After Oct 2024: compounding correctness" | **Timeline** - Evolution moment |
| 5:00-6:00 | "Problem: agent writes 'return true' to pass tests" | **Comparison** - Expected vs lazy behavior |
| 6:00-7:00 | "Solution: Scenarios stored outside codebase, satisfaction % not pass/fail" | **Process Steps** - New testing approach |
| 7:00-8:00 | "Digital twin universe: fake Octa, fake Jira, fake Slack" | **Node/Flow Diagram** - Twin system |
| 8:00-9:00 | "Google 25%+ code by AI, Microsoft 30%, Salesforce paused hiring" | **Statistics Display** - Company stats |
| 9:00-10:00 | "2017: 93% Google jobs required degree → 2022: 77%" | **Timeline** + **Statistics** - Trend over time |
| 10:00-11:00 | "India IT model: 1 US engineer $150k = 5 Indian engineers" | **Comparison** - Cost equation |

**Pattern:** Heavy **Statistics** and **Timeline** for narrative

---

## 4. Fireship - "Kubernetes in 100 Seconds"

**Video:** [Kubernetes Explained](https://www.youtube.com/watch?v=PziYflu8cB8)
**Duzina:** 2:07

### Sekcija Breakdown:

| Timestamp | Sekcija teksta | Infographic tip |
|-----------|----------------|-----------------|
| 0:00-0:20 | "Imagine orchestra, musicians = containers, conductor = kubernetes" | **Educational Diagram** - Analogy visual |
| 0:20-0:40 | "Robinhood: markets closed = low, markets open = millions of trades" | **Comparison** - Load states |
| 0:40-1:00 | "Cluster = brain (control plane) + worker machines (nodes)" | **Hierarchy/Tree** - Cluster structure |
| 1:00-1:20 | "Control plane: API server, etcd database" | **Node/Flow Diagram** - Control plane |
| 1:20-1:40 | "Node → cubelet → pods → containers" | **Hierarchy/Tree** - Node structure |
| 1:40-2:00 | "YAML config: nginx deployment, replica set, 3 pods" | **Process Steps** - Config example |

**Pattern:** Fireship style = **Rapid analogies** + **Hierarchy diagrams**

---

## 5. Fireship - "Machine Learning in 100 Seconds"

**Video:** [ML Explained](https://www.youtube.com/watch?v=PeMlggyqz0Y)
**Duzina:** 2:35

### Sekcija Breakdown:

| Timestamp | Sekcija teksta | Infographic tip |
|-----------|----------------|-----------------|
| 0:00-0:15 | "Teach computer without explicit programming" | **Comparison** - Traditional vs ML |
| 0:15-0:30 | "1959 Arthur Samuel at IBM, checkers AI" | **Timeline** - Origin point |
| 0:30-0:50 | "Two jobs: classify data, make predictions" | **Process Steps** - 2 fundamental tasks |
| 0:50-1:10 | "Step 1: acquire data, clean data, feature engineering" | **Process Steps** - Data prep |
| 1:10-1:30 | "Separate: training set vs testing set" | **Comparison** - Split screen |
| 1:30-2:00 | "Algorithms: linear regression, decision tree, CNN" | **Icon Grid** - Algorithm types |
| 2:00-2:20 | "Error functions: accuracy (classification), MAE (regression)" | **Comparison** - Error types |
| 2:20-2:35 | "Output = model file: input → prediction" | **Node/Flow Diagram** - Model pipeline |

**Pattern:** **Process Steps** dominant, quick **Comparisons**

---

## 6. Fireship - "DevOps CI/CD in 100 Seconds"

**Video:** [CI/CD Explained](https://www.youtube.com/watch?v=scEDHsr3APg)
**Duzina:** 1:56

### Sekcija Breakdown:

| Timestamp | Sekcija teksta | Infographic tip |
|-----------|----------------|-----------------|
| 0:00-0:20 | "DevOps: build, test, release in small frequent steps" | **Process Steps** - Core loop |
| 0:20-0:40 | "Merge Hell: Mary (API) + Jane (UI) → months later incompatible" | **Timeline** - Problem scenario |
| 0:40-1:00 | "CI pipeline: push → trigger workflow → run on Linux container" | **Node/Flow Diagram** - Pipeline |
| 1:00-1:20 | "Steps: checkout → setup nodejs → install → test → build → deploy" | **Process Steps** - Workflow steps |
| 1:20-1:40 | "If step fails → bad software blocked, notification sent" | **Node/Flow Diagram** - Failure path |
| 1:40-1:56 | "Benefits: automation = velocity, early detection = quality" | **Comparison** - Before/After CI |

**Pattern:** **Node/Flow Diagrams** + **Process Steps** (perfect for DevOps)

---

## 7. Two Minute Papers - "AlphaFold 3 Nobel Prize"

**Video:** [AlphaFold 3](https://www.youtube.com/watch?v=Mz7Qp73lj9o)
**Duzina:** 9:47

### Sekcija Breakdown:

| Timestamp | Sekcija teksta | Infographic tip |
|-----------|----------------|-----------------|
| 0:00-0:30 | "AlphaFold version 3 is here, history in the making" | **Statistics Display** - Version announcement |
| 0:30-1:30 | "Protein = string of amino acids, 3D structure, protein folding" | **Educational Diagram** - Protein structure |
| 1:30-2:30 | "Follow-up paper: enzymes that digest plastics, recycling" | **Process Steps** - Use case |
| 2:30-3:00 | "21,000 citations" | **Statistics Display** - Impact metric |
| 3:00-4:00 | "Accuracy: marginally better on proteins, DOUBLED on antibodies" | **Data Visualization** - Comparison chart |
| 4:00-5:00 | "Ligands: AI beats physics-based systems for first time" | **Comparison** - AI vs traditional |
| 5:00-6:00 | "Now handles: proteins + ligands + ions + DNA + RNA" | **Icon Grid** - Capability list |
| 6:00-7:00 | "Architecture: EvoFormer → Pairformer, new diffusion module" | **Node/Flow Diagram** - Architecture change |
| 7:00-8:00 | "Diffusion: noise → 3D molecular structure" | **Process Steps** - Generation process |
| 8:00-9:00 | "Applications: drugs, crops, genomics, biorenewable materials" | **Icon Grid** - Use cases |

**Pattern:** **Educational Diagrams** + **Statistics** (research paper style)

---

## 8. Two Minute Papers - "AlphaFold Deep Dive" (Interview)

**Video:** [AlphaFold Interview](https://www.youtube.com/watch?v=Vhcwjzeukts)
**Duzina:** 22:49

### Key Patterns:

| Topic | Infographic tip |
|-------|-----------------|
| "DNA → 20 amino acids → protein chain → 3D fold" | **Process Steps** - Chain formation |
| "Pennies to read DNA, $100k + 1 year for structure" | **Comparison** - Cost/time difference |
| "200 million proteins predicted, 3 million scientists used" | **Statistics Display** - Scale metrics |
| "30-40 individual ideas over 2 years" | **Timeline** - Development journey |
| "AlphaFold server: free tool with presets" | **Icon Grid** - Features |

**Pattern:** Interview format → **Statistics** and **Process explanations**

---

## Summary: Infographic Usage Patterns by Channel

### ByteMonk Style:
- **Primary:** Node/Flow Diagrams (architecture)
- **Secondary:** Statistics Display (research findings)
- **Tertiary:** Process Steps (how things work)
- **Tone:** Deep technical, layer-by-layer breakdown

### Fireship Style:
- **Primary:** Process Steps (quick explanations)
- **Secondary:** Hierarchy/Tree (system structure)
- **Tertiary:** Analogies via Educational Diagrams
- **Tone:** Fast, punchy, analogy-heavy

### Two Minute Papers Style:
- **Primary:** Educational Diagrams (scientific concepts)
- **Secondary:** Statistics Display (research metrics)
- **Tertiary:** Data Visualization (performance charts)
- **Tone:** Research paper breakdown, wow factor

---

## Mapping: Content Type → Infographic

| Content Type | Best Infographic | Example |
|--------------|------------------|---------|
| "How system works" | Node/Flow Diagram | RAG architecture |
| "X vs Y" | Comparison | LLM vs RAG |
| "Step 1, Step 2..." | Process Steps | CI/CD pipeline |
| "History of X" | Timeline | AI milestones |
| "X% of Y do Z" | Statistics Display | "25% of Google code is AI" |
| "Growth over time" | Data Visualization | Stock drop chart |
| "Components of X" | Hierarchy/Tree | Kubernetes cluster |
| "Scientific concept" | Educational Diagram | Protein folding |
| "List of features" | Icon Grid | AlphaFold capabilities |

---

## Keyword Triggers Identified

| Keywords | → Infographic |
|----------|---------------|
| "architecture", "how it works", "under the hood" | Node/Flow Diagram |
| "vs", "compared to", "difference between", "unlike" | Comparison |
| "step 1", "first", "then", "finally", "process" | Process Steps |
| "in 2020", "years ago", "history", "evolution" | Timeline |
| "X%", "millions", "statistics show", "research found" | Statistics Display |
| "growth", "dropped", "increased over time" | Data Visualization |
| "components", "layers", "consists of", "hierarchy" | Hierarchy/Tree |
| "think of it as", "imagine", "like a", "analogy" | Educational Diagram |
| "features include", "capabilities", "types of" | Icon Grid |
