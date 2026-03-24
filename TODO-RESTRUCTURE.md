# TODO: Skill Restructure za Production Quality

**Cilj:** Dostići nivo "pravog video editora" - 9/10 kvalitet
**Trenutno:** 6/10
**Problem:** Jedan agent radi sve, nema validacije, context overload

---

## VAŽNO: REDOSLED RADA

```
1. PRVO: Quick fixes (bez diranja skill strukture)
2. ZATIM: Testiraj sa 6 transkripata
3. PA TEK ONDA: Multi-agent refactor (ako treba)
```

**ZAŠTO OVAJ REDOSLED:**
- Ako diramo skill strukturu pre testiranja = možemo izgubiti ono što radi
- Quick fixes mogu rešiti 80% problema
- Multi-agent je VELIKI REFACTOR - mora se raditi PAŽLJIVO i ODVOJENO

---

## FAZA 1: Quick Fixes (BEZ diranja strukture)

### Task 1.1: Dodaj validaciju u SKILL.md
- [ ] Dodaj checklist na početku: "PROVERI pre renderovanja"
- [ ] Dodaj: "Frame 0 MORA imati content (ne crn ekran)"
- [ ] Dodaj: "Prva animacija kreće na frame 1-30, ne kasnije"
- [ ] **TEST:** Pokreni skill na 2 transkripta, proveri da li validacija pomaže

### Task 1.2: Fix timing offset bug
- [ ] Pronađi gde se računa prvi frame
- [ ] Proveri da li ima hardcoded delay
- [ ] Fix ako postoji
- [ ] **TEST:** Pokreni skill, proveri da animacija kreće odmah

### Task 1.3: Smanjiti SKILL.md
- [ ] Trenutno: 21KB
- [ ] Cilj: < 10KB
- [ ] Premesti detalje u reference/ fajlove
- [ ] Ostavi samo ESSENTIAL korake u glavnom SKILL.md
- [ ] **TEST:** Pokreni skill, proveri da i dalje radi

---

## FAZA 2: Testiranje sa 6 Transkripata

**KRITIČNO:** Svaki test MORA da koristi SKILL, ne ručno editovanje!

### Test transkripti (iz research/ foldera):

#### TEST 1: RAG Explained (IBM)
**Tip:** Sticky (ima korake: retrieve, augment, generate)
**Dužina:** ~200 reči
```
so imagine you're a journalist and you want to write an article on a specific topic now you have a pretty good general idea about this topic but you'd like to do some more research so you go to your local library right now this library has thousands of books on multiple different topics but how do you know as the journalist which books are relevant for your topic well you go to the librarian now the librarian is the expert on what books contain which information in the library so our journalist queries the librarian to retrieve books on certain topics and the librarian produces those books and provides them back to the journalist
```

#### TEST 2: Microservices vs Monolith
**Tip:** VS/Comparison
**Dužina:** ~180 reči
```
a monolith is an application where everything works as one piece of code It's usually the starting point for any new application whether that be an API or a front end and you usually end up with one executable in one repository your application is then developed deployed and scaled as one single component. with microservices we take your big monolithic application and break it down into individual components each component has a single responsibility and is usually in charge of a single business functionality if you take Netflix for example they might have one component in charge of search another one in charge of streaming videos and another one in charge of the recommendations each service is self-contained and independent from all the others they all have their own infrastructure and their own database
```

#### TEST 3: Event-Driven Architecture
**Tip:** Sticky (Producer → Broker → Consumer flow)
**Dužina:** ~150 reči
```
in an event-driven architecture there's three main components there's the producer which publishes the events the broker which manages which subscribers get which events and finally there's the consumer which subscribes to the event broker to receive the events. the main difference is that in event driven architecture our service will send an event after the event has happened the service raising the event doesn't care what happens after the event has been raised it doesn't care whether there's another service listening to it or not if the state has changed in your application then an event is raised
```

#### TEST 4: Username Check at Scale (ByteMonk)
**Tip:** Flat/Branching (multiple data structures)
**Dužina:** ~200 reči
```
When you are signing up for a new app, you enter your preferred username and get a message saying, 'This username is already taken.' It feels like a small inconvenience, but behind the scenes, that simple check is surprisingly complex. When you're dealing with billions of users, checking whether a username exist can't rely on a basic database query. That would create serious performance issues, high latency, bottlenecks, and unnecessary load in the system. In radius, a hashmap lets you store multiple field value pairs under one key. For username lookups, each field can represent a username and its value could be something lightweight like a user ID or even a placeholder flag. A try is a treel like structure that organizes strings by their shared prefixes. A bloom filter is just a bit array combined with handful of hash functions.
```

#### TEST 5: Data Pipelines (IBM)
**Tip:** Sticky (Extract → Transform → Load flow)
**Dužina:** ~180 reči
```
data in organization starts out in data lakes it's in different databases that are a part of different sas applications some applications are on-prem and then we also have streaming data which is kind of like our river here now this can be data that is coming in in real time. one of the most common processes is etl which stands for extract transform and load and that does exactly what it sounds like it extracts data from where it is it transforms it by cleaning up mismatching data by taking care of missing values getting rid of duplicated data putting in making sure the right columns are there and then loading it into a landing repository ready-to-use business data an example of one of these repositories could be an enterprise data warehouse
```

#### TEST 6: Kubernetes Architecture
**Tip:** Complex Sticky (Worker nodes + Master nodes)
**Dužina:** ~250 reči
```
one of the main components of kubernetes architecture are its worker servers or nodes and each node will have multiple application pots with containers running on that node and the way communities does it is using three processes that must be installed on every node. the first process that needs to run on every node is the container runtime. the process that actually schedules those pots and the containers then underneath is cubelet which is a process of kubernetes itself. the third process that is responsible for forwarding requests from services to pots is actually cute proxy. all these managing processes are done by master nodes so master servers or master notes have completely different processes running inside and these are four processes that run on every master node. the first service is API server. API server is like a cluster gateway. the next component is controller manager. the last master process is etcd which is a key value store of a cluster state you can think of it as a cluster brain.
```

### Test Checklist (za SVAKI test):

- [ ] Pokreni skill od koraka 1 (voiceover)
- [ ] Proveri: Da li frame 0 ima content?
- [ ] Proveri: Da li animacija kreće na vreme?
- [ ] Proveri: Da li su timestamps tačni?
- [ ] Proveri: Da li camera prati sekcije?
- [ ] Oceni: 1-10 kvalitet
- [ ] Zabeleži: Šta nije radilo?

---

## FAZA 3: Multi-Agent Refactor (PAŽLJIVO!)

**⚠️ UPOZORENJE: Ovo raditi SAMO ako Faza 1 i 2 ne daju dovoljno poboljšanja!**

**⚠️ RADITI ODVOJENO - ne u isto vreme kad radimo druge stvari!**

### Predložena struktura:

```
.claude/skills/
├── voiceover-agent/
│   └── SKILL.md          # SAMO voiceover + timestamps
├── structure-agent/
│   └── SKILL.md          # SAMO analiza + segments
├── animation-agent/
│   └── SKILL.md          # SAMO React kod
└── qa-agent/
    └── SKILL.md          # SAMO validacija
```

### Task 3.1: Definiši input/output formate
- [ ] voiceover-agent output format (JSON schema)
- [ ] structure-agent output format (JSON schema)
- [ ] animation-agent output format (file structure)
- [ ] Napisi validaciju za svaki format

### Task 3.2: Napravi voiceover-agent
- [ ] Izvuci voiceover deo iz trenutnog SKILL.md
- [ ] Napravi novi SKILL.md samo za voiceover
- [ ] Dodaj validaciju na output
- [ ] **TEST:** Pokreni samo ovaj agent na 3 transkripta

### Task 3.3: Napravi structure-agent
- [ ] Izvuci structure analizu iz trenutnog SKILL.md
- [ ] Napravi novi SKILL.md
- [ ] Input: voiceover-agent output
- [ ] **TEST:** Chain sa voiceover-agent

### Task 3.4: Napravi animation-agent
- [ ] Izvuci animation kod iz trenutnog SKILL.md
- [ ] Input: structure-agent output + voiceover timestamps
- [ ] **TEST:** Full chain test

### Task 3.5: Napravi qa-agent
- [ ] Checklist validacija
- [ ] Automatsko otkrivanje grešaka
- [ ] Predlozi za fix
- [ ] **TEST:** Pokreni na svim test projektima

### Task 3.6: Integration test
- [ ] Pokreni ceo pipeline na svih 6 transkripata
- [ ] Uporedi kvalitet sa single-agent
- [ ] Dokumentuj razlike

---

## TRACKING

| Faza | Status | Ocena pre | Ocena posle |
|------|--------|-----------|-------------|
| Quick Fixes | TODO | 6/10 | ? |
| Test 6 transkripata | TODO | - | ? |
| Multi-agent refactor | TODO | ? | ? |

---

## NAPOMENE

1. **NE ŽURI** - bolje sporo i kvalitetno nego brzo i broken
2. **TESTIRAJ POSLE SVAKOG KORAKA** - ne gomilaj promene
3. **SKILL MORA DA SE KORISTI** - ne ručno editovanje
4. **BACKUP PRE REFACTORA** - sačuvaj trenutni SKILL.md pre izmena
5. **ODVOJENO OD OSTALOG RADA** - multi-agent refactor je poseban task
