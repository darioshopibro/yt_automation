# Visual Ideas — Inspiracija za nove vizuale

> Ova lista je INSPIRACIJA, ne ograničenje. Agent može smisliti vizual koji nije ovde.
> Svaki vizual mora biti REUSABLE — koristan za 5+ različitih tema, ne samo za jedan video.

---

## Networking & Architecture

### ServiceMeshVisual
- **Šta:** Nodovi (servisi) povezani linijama (API pozivi, events)
- **Primer:** Microservices koji komuniciraju — User Service → Auth → DB → Cache
- **Teme:** microservices, Kubernetes, event-driven, message queues, API gateway
- **Shape:** SQUARE | **Weight:** HEAVY

### NetworkTopologyVisual
- **Šta:** Layered network diagram — client → load balancer → servers → database
- **Primer:** Request flow kroz infrastructure layers
- **Teme:** CDN, load balancing, reverse proxy, edge computing, distributed systems
- **Shape:** WIDE | **Weight:** HEAVY

---

## Data & Storage

### DatabaseSchemaVisual
- **Šta:** Tabele sa kolonama + relacije (1:N, N:M linije)
- **Primer:** Users → Orders → Products sa FK linijama
- **Teme:** SQL, ORM, migrations, normalization, database design
- **Shape:** WIDE | **Weight:** HEAVY

### DataFlowVisual
- **Šta:** Podaci koji teku kroz transformacije — input → process → output sa labelama
- **Primer:** Raw logs → Parser → Aggregator → Dashboard
- **Teme:** ETL, data pipelines, streaming, Kafka, data engineering
- **Shape:** WIDE | **Weight:** MEDIUM

---

## DevOps & Infrastructure

### DeploymentDiagramVisual
- **Šta:** Serveri/containers sa labelama, grouped po environment-u (dev/staging/prod)
- **Primer:** 3 Docker containera na AWS ECS sa load balancer-om
- **Teme:** deployment, Docker, Kubernetes, cloud, CI/CD, scaling
- **Shape:** SQUARE | **Weight:** HEAVY

### GitBranchVisual
- **Šta:** Branch linije sa commit tačkama, merge arrows
- **Primer:** main → feature-branch → PR → merge back
- **Teme:** Git, version control, branching strategies, GitFlow, trunk-based
- **Shape:** WIDE | **Weight:** MEDIUM

---

## API & Communication

### ApiEndpointVisual
- **Šta:** Lista API ruta sa method badge-ovima (GET/POST/PUT/DELETE) i opisima
- **Primer:** GET /users, POST /auth/login, DELETE /users/:id
- **Teme:** REST, API design, routing, CRUD, backend development
- **Shape:** SQUARE | **Weight:** MEDIUM

### RequestResponseVisual
- **Šta:** Dva panela — Request (headers, body) → Response (status, body) sa strelicom
- **Primer:** POST /api/chat → 200 { message: "Hello" }
- **Teme:** HTTP, API debugging, webhooks, GraphQL queries
- **Shape:** WIDE | **Weight:** MEDIUM

---

## State & Logic

### StateMachineVisual
- **Šta:** Stanja (krugovi/boxovi) sa labeled prelazima (strelice)
- **Primer:** Idle → Loading → Success/Error → Idle
- **Teme:** state management, finite automata, workflow engines, Redux, XState
- **Shape:** SQUARE | **Weight:** HEAVY

### DecisionTreeVisual
- **Šta:** Dijamanti (decisions) sa Yes/No granama → outcomes
- **Primer:** "Is cached?" → Yes: return cache → No: fetch → store → return
- **Teme:** algorithms, business logic, routing decisions, conditional flows
- **Shape:** SQUARE | **Weight:** HEAVY

---

## Security & Auth

### AuthFlowVisual
- **Šta:** Sekvencijalni flow — User → App → Auth Provider → Token → Access
- **Primer:** OAuth2 flow sa redirect-ima
- **Teme:** authentication, OAuth, JWT, SSO, session management
- **Shape:** WIDE | **Weight:** MEDIUM

---

## UI & Frontend

### ComponentTreeVisual
- **Šta:** Drvo React/Vue komponenti sa props flow strelicama
- **Primer:** App → Layout → Sidebar → NavItem
- **Teme:** React, component architecture, props drilling, composition
- **Shape:** SQUARE | **Weight:** HEAVY

---

## Performance & Monitoring

### MetricsDashboardVisual
- **Šta:** Mini dashboard sa 2-3 grafikona (line chart, gauge, counter)
- **Primer:** CPU 45%, Memory 2.1GB, Requests 1.2k/s
- **Teme:** monitoring, observability, Grafana, performance, SRE
- **Shape:** WIDE | **Weight:** HEAVY

### LatencyBreakdownVisual
- **Šta:** Waterfall/gantt prikaz — koji deo requesta koliko traje
- **Primer:** DNS 5ms → TCP 10ms → TLS 15ms → Server 200ms → Transfer 30ms
- **Teme:** performance optimization, tracing, profiling, network latency
- **Shape:** WIDE | **Weight:** MEDIUM

---

## Pravila za dodavanje novih ideja

1. **Reusability test:** Da li bi ovaj vizual bio koristan za 5+ različitih video tema?
2. **Overlap test:** Da li postojeći vizuali VEĆ pokrivaju ovaj use case?
3. **Data test:** Da li transcript obično sadrži KONKRETNE podatke za ovaj vizual?
4. **Shape/Weight:** Odredi unapred — pomaže pri composition planiranju
