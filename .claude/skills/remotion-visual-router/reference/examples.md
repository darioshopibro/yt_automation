# Examples — Real Transcript → Visual Structure Mappings

> Svaki primer uključuje **Composition Analysis** koja objašnjava ZAŠTO su ti vizuali odabrani prema pravilima iz `composition-rules.md`.

## Primer 1: Kubernetes Architecture (Tech Explainer)

### Transcript (skraćeno):
> Kubernetes is a container orchestration platform that was born at Google in 2014. It became part of CNCF in 2015, reached production readiness in 2018, and is now the de facto standard with over 3,500 contributors and 96% enterprise adoption.
>
> Worker nodes run three core processes: container runtime like Docker, kubelet which schedules pods, and kube-proxy which handles networking and load balancing.
>
> The master node has four components: API server acts as the gateway, scheduler assigns pods to nodes, controller manager detects failures and reschedules, and etcd stores the cluster state.
>
> To deploy, you run kubectl apply which sends a request to the API server, gets authenticated, scheduler picks the best node, and kubelet starts the pod.

### Visual Structure:
```json
{
  "title": "Kubernetes Architecture",
  "hierarchyType": "sticky",
  "stickies": [
    {
      "step": 1,
      "title": "Overview",
      "direction": "right",
      "connectionToNext": "flow",
      "sections": [
        {
          "title": "Evolution",
          "visualType": "timeline",
          "visualData": {
            "items": [
              { "label": "2014", "description": "Born at Google" },
              { "label": "2015", "description": "CNCF founded" },
              { "label": "2018", "description": "Production ready" },
              { "label": "2024", "description": "De facto standard" }
            ],
            "direction": "horizontal"
          }
        },
        {
          "title": "Key Numbers",
          "visualType": "stats",
          "visualData": {
            "items": [
              { "label": "Contributors", "value": "3,500+" },
              { "label": "Adoption", "value": "96%", "subtitle": "Enterprise" }
            ]
          }
        }
      ]
    },
    {
      "step": 2,
      "title": "Worker Nodes",
      "direction": "right",
      "connectionToNext": "bidirectional",
      "sections": [
        {
          "title": "Core Processes",
          "layout": "flow",
          "nodes": [
            { "label": "Runtime", "icon": "Package" },
            { "label": "Kubelet", "icon": "Cpu" },
            { "label": "Proxy", "icon": "ShareNetwork" }
          ]
        },
        {
          "title": "Runtimes",
          "visualType": "logo-grid",
          "visualData": {
            "items": [
              { "icon": "Package", "label": "Docker", "color": "#2496ed" },
              { "icon": "Cube", "label": "containerd", "color": "#575757" },
              { "icon": "CubeTransparent", "label": "CRI-O", "color": "#ef4444" }
            ]
          }
        }
      ]
    },
    {
      "step": 3,
      "title": "Master Nodes",
      "direction": "below",
      "connectionToNext": "flow",
      "sections": [
        {
          "title": "Control Plane",
          "layout": "flow",
          "nodes": [
            { "label": "API Server", "icon": "Globe" },
            { "label": "Scheduler", "icon": "ListChecks" },
            { "label": "Controller", "icon": "ArrowsClockwise" },
            { "label": "etcd", "icon": "Database" }
          ]
        },
        {
          "title": "Deploy Flow",
          "visualType": "process-steps",
          "visualData": {
            "steps": [
              { "label": "kubectl apply", "description": "Send request to API" },
              { "label": "Auth Check", "description": "Validate credentials" },
              { "label": "Schedule", "description": "Pick best node" },
              { "label": "Start Pod", "description": "Kubelet executes" }
            ]
          }
        }
      ]
    }
  ]
}
```

**Routing decisions:**
- "born in 2014... 2015... 2018" → timeline (chronological data)
- "3,500 contributors, 96% adoption" → stats (impressive numbers)
- "three core processes: runtime, kubelet, proxy" → ikone/flow (abstract process)
- "Docker, containerd, CRI-O" → logo-grid (3+ tech names)
- "API server, scheduler, controller, etcd" → ikone/flow (4 related components)
- "run kubectl... authenticated... scheduler picks... kubelet starts" → process-steps (sequential tutorial)

**Composition Analysis:**
- **Shape:** Sticky 1 (timeline=WIDE + stats=WIDE) ✅ isti shape. Sticky 2 (icons-flow=neutral + logo-grid=SQUARE) ✅. Sticky 3 (icons-flow=neutral + process-steps=SQUARE) ✅.
- **Weight:** Nikad 2 HEAVY u istom sticky-ju ✅ (timeline=MEDIUM, stats=LIGHT, logo-grid=MEDIUM, process-steps=MEDIUM)
- **Density balans:** S1: timeline 4 + stats 2 = razlika 2 ✅. S2: icons 3 + logo-grid 3 = razlika 0 ✅. S3: icons 4 + process-steps 4 = razlika 0 ✅.
- **Variety:** 5 različitih vizuala (timeline, stats, logo-grid, process-steps, icons) ✅. Nijedan ponovljen ✅.
- **Direction:** right→right→below (below za drill-down iz Master u Deploy Flow) ✅

---

## Primer 2: CI/CD Pipeline (Tutorial)

### Transcript (skraćeno):
> Let me show you the ideal CI/CD pipeline. It starts with source control — you need Git with required reviewers, at least two approvals before merging.
>
> The build step compiles your code and runs unit tests. You should aim for at least 90% code coverage.
>
> In the test environment, run your integration tests. Each test calls an API endpoint and verifies the response. For example, create an order then call get order to verify it exists.
>
> Finally, deploy to production with monitoring. Track your error rate, latency, and uptime — these are the metrics that matter.

### Visual Structure:
```json
{
  "title": "The Ideal CI/CD Pipeline",
  "hierarchyType": "sticky",
  "stickies": [
    {
      "step": 1,
      "title": "Source",
      "direction": "right",
      "connectionToNext": "flow",
      "sections": [
        {
          "title": "Git Setup",
          "visualType": "terminal",
          "visualData": {
            "commands": [
              { "command": "git checkout -b feature/auth" },
              { "command": "git push origin feature/auth" },
              { "command": "gh pr create --reviewer team-lead,senior-dev", "output": "Pull request #42 created" }
            ],
            "title": "bash — git workflow"
          }
        },
        {
          "title": "Review Rules",
          "visualType": "list",
          "visualData": {
            "items": [
              "Minimum 2 reviewer approvals required",
              "No direct merge to main branch",
              "All CI checks must pass before merge"
            ],
            "style": "checklist"
          }
        }
      ]
    },
    {
      "step": 2,
      "title": "Build & Test",
      "direction": "right",
      "connectionToNext": "flow",
      "sections": [
        {
          "title": "Build Pipeline",
          "layout": "flow",
          "nodes": [
            { "label": "Compile", "icon": "Hammer" },
            { "label": "Unit Test", "icon": "TestTube" },
            { "label": "Coverage", "icon": "ChartBar" }
          ]
        },
        {
          "title": "Test Example",
          "visualType": "code-block",
          "visualData": {
            "language": "typescript",
            "filename": "order.test.ts",
            "code": "test('create order', async () => {\n  const order = await api.post('/orders', {\n    product: 'Widget',\n    quantity: 5\n  });\n  \n  const result = await api.get(`/orders/${order.id}`);\n  expect(result.product).toBe('Widget');\n});",
            "highlightLines": [6, 7]
          }
        }
      ]
    },
    {
      "step": 3,
      "title": "Production",
      "direction": "right",
      "sections": [
        {
          "title": "Deploy",
          "layout": "flow",
          "nodes": [
            { "label": "Stage", "icon": "CloudArrowUp" },
            { "label": "Verify", "icon": "CheckCircle" },
            { "label": "Release", "icon": "Rocket" }
          ]
        },
        {
          "title": "Key Metrics",
          "visualType": "stats",
          "visualData": {
            "items": [
              { "label": "Error Rate", "value": "<0.1%", "subtitle": "Target" },
              { "label": "Latency", "value": "<200ms", "subtitle": "p99" },
              { "label": "Uptime", "value": "99.9%", "subtitle": "SLA" }
            ]
          }
        }
      ]
    }
  ]
}
```

**Routing decisions:**
- "Git with reviewers" → terminal (concrete commands) + list/checklist (rules)
- "compiles code, runs unit tests" → ikone/flow (abstract pipeline)
- "calls API endpoint, verifies response" → code-block (concrete test code)
- "error rate, latency, uptime" → stats (key metrics)

**Composition Analysis:**
- **Shape:** S1 (terminal=SQUARE + list=SQUARE) ✅. S2 (icons=neutral + code-block=SQUARE) ✅. S3 (icons=neutral + stats=WIDE) — icons su shape-neutral pa radi ✅.
- **Weight:** S1: terminal(MEDIUM) + list(MEDIUM) ✅. S2: icons + code-block(HEAVY) ✅. S3: icons + stats(LIGHT) ✅.
- **Density balans:** S1: terminal 3 + list 3 = 0 ✅. S2: icons 3 + code-block 8 linija — vizualno različiti tipovi ali icons su mali pa radi ✅. S3: icons 3 + stats 3 = 0 ✅.
- **Variety:** 5 tipova (terminal, list, code-block, stats, icons) ✅. Nijedan ponovljen ✅.
- **Disambiguation:** D5 primenjen — "git checkout, git push, gh pr create" su CLI komande → terminal (ne code-block). D3 primenjen — "reviewer approvals, no direct merge, CI checks" su pravila bez reda → list/checklist (ne process-steps).

---

## Primer 3: Microservices vs Monolith (Comparison)

### Transcript (skraćeno):
> The history of application architecture evolved from monolithic to multi-tier to microservices.
>
> A monolith is a single unified codebase where everything is tightly coupled. It's simple to deploy but hard to scale. When one part fails, everything fails.
>
> Microservices break the application into independent services, each with its own database. Teams can work independently and deploy separately.
>
> Netflix migrated in 2009 and by 2015 had over 1000 microservices. Today they have 10,000 services handling 200 million subscribers.
>
> Tools like Docker, Kubernetes, and service meshes make microservices manageable.

### Visual Structure:
```json
{
  "title": "Microservices vs Monolith",
  "hierarchyType": "sticky",
  "stickies": [
    {
      "step": 1,
      "title": "Evolution",
      "direction": "right",
      "connectionToNext": "flow",
      "sections": [
        {
          "title": "Architecture History",
          "visualType": "timeline",
          "visualData": {
            "items": [
              { "label": "1990s", "description": "Monolithic era" },
              { "label": "2000s", "description": "Multi-tier (3 layers)" },
              { "label": "2010s", "description": "Microservices emerge" },
              { "label": "2020s", "description": "Cloud-native standard" }
            ],
            "direction": "horizontal"
          }
        },
        {
          "title": "The Shift",
          "visualType": "kinetic",
          "visualData": {
            "text": "Break complexity into manageable pieces",
            "highlight": ["Break", "manageable"],
            "style": "impact"
          }
        }
      ]
    },
    {
      "step": 2,
      "title": "Comparison",
      "direction": "below",
      "connectionToNext": "flow",
      "sections": [
        {
          "title": "Side by Side",
          "visualType": "split-screen",
          "visualData": {
            "left": {
              "title": "Monolith",
              "items": ["Single codebase", "Tightly coupled", "One deployment", "Vertical scaling", "Single point of failure"]
            },
            "right": {
              "title": "Microservices",
              "items": ["Independent services", "Loosely coupled", "Independent deploy", "Horizontal scaling", "Fault isolation"]
            },
            "leftColor": "#ef4444",
            "rightColor": "#22c55e",
            "dividerLabel": "vs"
          }
        },
        {
          "title": "Netflix Migration",
          "visualType": "stats",
          "visualData": {
            "items": [
              { "label": "Year", "value": "2009", "subtitle": "Migration start" },
              { "label": "Services", "value": "10,000+", "subtitle": "Today" },
              { "label": "Users", "value": "200M+", "subtitle": "Subscribers" }
            ]
          }
        }
      ]
    },
    {
      "step": 3,
      "title": "Ecosystem",
      "sections": [
        {
          "title": "Essential Tools",
          "visualType": "logo-grid",
          "visualData": {
            "items": [
              { "icon": "Package", "label": "Docker", "color": "#2496ed" },
              { "icon": "Cube", "label": "Kubernetes", "color": "#326ce5" },
              { "icon": "GitBranch", "label": "CI/CD", "color": "#f97316" },
              { "icon": "ChartLine", "label": "Monitoring", "color": "#22c55e" },
              { "icon": "Queue", "label": "Message Queue", "color": "#a855f7" },
              { "icon": "ShieldCheck", "label": "Service Mesh", "color": "#06b6d4" }
            ]
          }
        },
        {
          "title": "Key Considerations",
          "visualType": "list",
          "visualData": {
            "items": [
              "Increased operational complexity",
              "Requires DevOps expertise",
              "Network latency between services",
              "Data consistency challenges"
            ],
            "style": "bullet"
          }
        }
      ]
    }
  ]
}
```

**Routing decisions:**
- "evolved from monolithic to multi-tier to microservices" → timeline (chronological)
- "break complexity into manageable pieces" → kinetic (punchline — jedini kinetic u videu)
- "monolith is single, tightly coupled... microservices are independent" → split-screen (D1: tačno 2 stvari sa pro/con)
- "Netflix 2009... 10,000 services... 200M users" → stats (D2: impresivni brojevi)
- "Docker, Kubernetes, service meshes" → logo-grid (3+ tech imena)
- Microservices challenges → list (umesto drugog kinetic-a — E2: max 1 kinetic po videu)

**Composition Analysis:**
- **Shape:** S1 (timeline=WIDE + kinetic=WIDE) ✅. S2 (split-screen=WIDE + stats=WIDE) ✅. S3 (logo-grid=SQUARE + list=SQUARE) ✅.
- **Weight:** S1: timeline(MEDIUM) + kinetic(LIGHT) ✅. S2: split-screen(HEAVY) + stats(LIGHT) ✅. S3: logo-grid(MEDIUM) + list(MEDIUM) ✅.
- **Density balans:** S1: timeline 4 + kinetic 5 reči = razlika 1 ✅. S2: split-screen 5/strana + stats 3 = razlika 2 ✅. S3: logo-grid 6 + list 4 = razlika 2 ✅.
- **Variety:** 6 tipova (timeline, kinetic, split-screen, stats, logo-grid, list) ✅. Nijedan ponovljen ✅. Kinetic samo 1× ✅.
- **Direction:** right → below → end. Below za drill-down iz Comparison u Ecosystem ✅.
- **Disambiguation:** D1 za split-screen (tačno 2 stvari, jasno pro/con). D2 za stats (Netflix brojevi impresioniraju, ne porede). E2: originalni primer imao 2 kinetic-a — zamenjeno sa list ✅.
