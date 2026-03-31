# Test Prompts za Visual Generator

7 testova od medium do hard. Svaki pastuj u NOVU sesiju.
Posle svakog — pokreni `npx remotion studio --port XXXX` i pogledaj rezultat.

---

## TEST 1 — Medium (port 4001)
**Tip:** Linearan proces, 4 koraka

```
Stikni visual-generator skill.

Transcript:
"Here's how a CI/CD pipeline works. First, a developer pushes code to GitHub. That triggers a build step — the code gets compiled and unit tests run. If tests pass, it moves to staging where integration tests happen. Finally, if everything's green, it deploys to production automatically. The whole process takes about 3 minutes from push to production."

Napravi komponentu i registruj je u Root.tsx. Port 4001.
```

---

## TEST 2 — Medium (port 4002)
**Tip:** Poredjenje dva koncepta

```
Stikni visual-generator skill.

Transcript:
"Let's compare SQL and NoSQL databases. SQL databases like PostgreSQL use structured tables with strict schemas — great for complex queries and transactions. You get ACID compliance and joins. NoSQL databases like MongoDB use flexible documents — no schema required, horizontal scaling is easy, and reads are blazing fast. The tradeoff? SQL gives you consistency, NoSQL gives you speed. SQL handles about 10,000 transactions per second, while MongoDB can hit 100,000 reads per second on the same hardware."

Napravi komponentu i registruj je u Root.tsx. Port 4002.
```

---

## TEST 3 — Medium-Hard (port 4003)
**Tip:** Arhitektura sa vise servisa i metrikama

```
Stikni visual-generator skill.

Transcript:
"A modern microservices architecture has several key components. The API Gateway sits at the front, handling authentication and rate limiting — it processes about 50,000 requests per second. Behind it, you have the User Service, Order Service, and Payment Service — each running independently in their own containers. They communicate through a message queue — RabbitMQ in our case — which handles async processing. All services write to their own databases — User Service uses PostgreSQL, Orders use MongoDB, and Payments use a dedicated ledger database. A service mesh like Istio handles service-to-service communication, retries, and circuit breaking."

Napravi komponentu i registruj je u Root.tsx. Port 4003.
```

---

## TEST 4 — Hard (port 4004)
**Tip:** Proces sa eliminacijom i scoringom (K8s Scheduler stil)

```
Stikni visual-generator skill.

Transcript:
"The Kubernetes scheduler decides where to place your pod. It starts with all available nodes — let's say we have Node A with 8GB RAM, Node B with 16GB RAM, and Node C with 4GB RAM. First comes filtering — your pod needs 6GB minimum, so Node C gets eliminated immediately. That leaves Node A and Node B. Now scoring kicks in — the scheduler checks resource balance. Node A already runs 5 pods and sits at 78% CPU, while Node B runs only 2 pods at 23% CPU. Node B scores 85 out of 100, Node A only 45. The winner? Node B. The pod gets bound to Node B, status changes from Pending to Running."

Napravi komponentu i registruj je u Root.tsx. Port 4004.
```

---

## TEST 5 — Hard (port 4005)
**Tip:** Timeline/evolucija — koncept koji se menja kroz vreme

```
Stikni visual-generator skill.

Transcript:
"Let me show you the evolution of web architecture. In 2000, everything was monolithic — one big server running PHP, serving HTML directly. Response time? About 2 seconds. By 2010, we split into frontend and backend — jQuery on the client, REST APIs on the server, databases got separated. Response dropped to 500ms. Then 2015 brought microservices — Docker containers, API gateways, message queues, each service scaling independently. We hit 100ms responses. And now in 2025, it's serverless and edge computing — functions run at the edge, close to users, with AI inference built in. We're talking sub-20ms globally. The cost went from $10,000/month for a single server to $200/month for millions of requests."

Napravi komponentu i registruj je u Root.tsx. Port 4005.
```

---

## TEST 6 — Hard (port 4006)
**Tip:** Koncept sa kodom + objasnjenjima (mesovit)

```
Stikni visual-generator skill.

Transcript:
"Race conditions are one of the trickiest bugs in concurrent programming. Imagine two threads trying to increment the same counter. Thread A reads the value — it's 5. Thread B also reads — still 5. Thread A writes 6. Thread B writes 6. You lost an increment. The counter should be 7 but it's 6. The fix? Use a mutex lock. Before reading, acquire the lock. Other threads wait. Read, increment, write, release. Now it's thread-safe. In Go, you'd use sync.Mutex — just two lines: mu.Lock() before the critical section and mu.Unlock() after. Or even better, use atomic operations — atomic.AddInt64 is lock-free and 10x faster than mutex for simple counters."

Napravi komponentu i registruj je u Root.tsx. Port 4006.
```

---

## TEST 7 — Very Hard (port 4007)
**Tip:** Kompleksna arhitektura sa mnogo elemenata, stanja, i transformacija

```
Stikni visual-generator skill.

Transcript:
"Let's trace a payment through Stripe's infrastructure. The user clicks Pay — that hits Stripe's API at the edge, latency under 10ms. The request enters the fraud detection pipeline — ML models score the transaction in real-time. Score above 0.8? Blocked. Score 0.3 to 0.8? Requires 3D Secure verification. Below 0.3? Approved instantly. For our example, score is 0.15 — clean transaction. Next, Stripe routes to the card network — Visa, Mastercard, or Amex. The network contacts the issuing bank for authorization. The bank checks: sufficient funds? Card not frozen? Daily limit not exceeded? All three pass — authorization code returned. Stripe captures the payment, updates the merchant dashboard, fires a webhook to your server, and moves the funds to settlement. Total time from click to confirmation: 1.2 seconds. But the actual money movement? That takes 2-3 business days through the ACH network."

Napravi komponentu i registruj je u Root.tsx. Port 4007.
```

---

## Sta ocenjivati posle svakog testa

1. **Kompajlira li se?** — `npx remotion studio` radi bez errora
2. **Izgleda li dobro?** — dizajn sistem, boje, fontovi, spacing
3. **Razliciti tipovi elemenata?** — ne samo icon boxovi
4. **Animacije rade?** — stagger, highlight, konekcije
5. **Layout bez preklapanja?** — Grid/Flex, nista se ne preklapa
6. **Podaci iz transcripta?** — vrednosti, imena, brojevi — izvuceni tacno
7. **Timeline ima smisla?** — elementi se pojavljuju logicnim redom
8. **Fullscreen 1920x1080?** — zauzima ceo ekran, padding OK

---
---

# STRESS TESTOVI — Fokus na slabosti (arhitektura, mnogo elemenata, kompleksni sistemi)

Skill je slab kad transcript ima MNOGO servisa/komponenti koje komuniciraju. Defaultuje na "boxovi u redovima" umesto da razmisli o layoutu. Ovi testovi ciljaju tu slabost.

---

## TEST 8 — Arhitektura sa mnogo servisa (port 4008)
**Fokus:** Kako prikazati 7+ servisa a da ne bude PowerPoint

```
s
```

---

## TEST 9 — Sistem sa fazama i transformacijama (port 4009)
**Fokus:** Elementi koji MENJAJU stanje tokom animacije

```
Stikni visual-generator skill.

Transcript:
"Here's how a Docker container is born. You start with a Dockerfile — just a text file with instructions. The build command reads each instruction and creates a layer. First FROM pulls the base image — that's about 50MB. Then COPY adds your source code — maybe 5MB. RUN npm install adds node_modules — that's the heavy one, 200MB. Each layer is cached — if you change your code, only the COPY layer rebuilds, not the npm install. The final image is about 255MB. Now docker run takes that image and creates a container — an isolated process with its own filesystem, network, and process space. The container starts in under a second. But here's the thing — the container's filesystem is ephemeral. When it dies, everything inside is gone. That's why you mount volumes — persistent storage that survives container restarts."

Napravi komponentu i registruj je u Root.tsx. Port 4009.
```

---

## TEST 10 — Request flow sa grananjem (port 4010)
**Fokus:** Putanja koja se grana na vise pravaca

```
Stikni visual-generator skill.

Transcript:
"When your DNS query leaves your browser, it goes on quite a journey. First it checks the browser cache — if you visited google.com in the last 60 seconds, it's right there, done in 0ms. Cache miss? It asks the OS resolver — your operating system has its own cache, maybe 5ms. Still nothing? Now it goes to your ISP's recursive resolver — that's the first real network hop, about 10ms away. The recursive resolver checks its cache too. If it doesn't have it, it starts from the top — the root nameserver. There are only 13 root nameserver clusters in the world. The root says 'I don't know google.com but .com is handled by these TLD servers.' So the resolver asks the .com TLD server. The TLD says 'google.com is handled by ns1.google.com.' Finally, the resolver asks Google's authoritative nameserver and gets back 142.250.80.46. Total time for an uncached lookup? About 100-200ms. And all of this happens before your browser even starts loading the page."

Napravi komponentu i registruj je u Root.tsx. Port 4010.
```

---

## TEST 11 — Poredjenje sa mnogo dimenzija (port 4011)
**Fokus:** Kompleksnije poredjenje od prostog levo/desno

```
Stikni visual-generator skill.

Transcript:
"Let's settle the Kubernetes vs Serverless debate once and for all. Startup time — Kubernetes pods take 30 seconds to spin up, serverless functions cold start in 200 milliseconds. Cost at low traffic — K8s costs you $200/month minimum for the control plane alone even with zero traffic, serverless is literally $0 when idle. But flip it — at high traffic, 10 million requests per month, K8s costs about $500, serverless can hit $3,000 because you're paying per invocation. Scaling speed — serverless scales to 1000 instances in seconds, K8s horizontal pod autoscaler takes 2-3 minutes. Max execution time — serverless has a hard limit, 15 minutes on AWS Lambda. K8s? Run for days, weeks, forever. Debugging — serverless is a nightmare, distributed traces across 50 functions. K8s gives you kubectl exec right into the container. Vendor lock-in — serverless ties you to AWS or GCP. K8s runs anywhere — cloud, on-prem, your laptop."

Napravi komponentu i registruj je u Root.tsx. Port 4011.
```

---

## TEST 12 — Pipeline sa medjurezultatima (port 4012)
**Fokus:** Svaki korak transformise podatke, ne samo prosledjuje

```
Stikni visual-generator skill.

Transcript:
"This is how your JavaScript code actually runs. The engine first parses your source code into an Abstract Syntax Tree — basically a tree of nodes representing every expression and statement. Then the interpreter called Ignition walks this tree and generates bytecode — a compact, portable representation that's about 50% smaller than the AST. The bytecode starts executing immediately, but it's slow. The engine watches which functions run frequently — it calls them 'hot' functions. When a function has been called 100 times, the optimizing compiler TurboFan kicks in. TurboFan takes the bytecode and generates highly optimized machine code, using type feedback from previous runs. The machine code is 10-100x faster than bytecode. But there's a catch — if the types change, the optimized code becomes invalid. The engine deoptimizes back to bytecode and starts profiling again. This optimize-deoptimize cycle is why consistent types in JavaScript give you better performance."

Napravi komponentu i registruj je u Root.tsx. Port 4012.
```

---

## TEST 13 — Sistem sa score/ranking i eliminacijom (port 4013)
**Fokus:** Elementi se ocenjuju i eliminisu (K8s scheduler stil)

```
Stikni visual-generator skill.

Transcript:
"How does Google Search rank pages? Your query hits Google's index — over 100 billion pages. First pass is rough filtering — keyword matching eliminates 99.9% of pages instantly. You're left with maybe 10 million candidates. Now the ranking signals kick in. PageRank checks backlinks — how many quality sites link to each page. A link from Wikipedia is worth a thousand blog links. Content relevance scores how well the text matches your intent, not just keywords. Freshness matters for news queries — a page from yesterday beats one from 2019. User signals are huge — if people click a result and immediately bounce back, that page drops. If they stay 5 minutes, it rises. Mobile friendliness, page speed, HTTPS — each adds a small boost. Core Web Vitals — LCP under 2.5 seconds, FID under 100ms, CLS under 0.1. All these signals combine into a final score. The top 10 results appear on page one. Position 1 gets 31% of clicks. Position 10 gets 2.5%. Page 2? Basically invisible."

Napravi komponentu i registruj je u Root.tsx. Port 4013.
```

---

## TEST 14 — Realtime sistem sa paralelnim procesima (port 4014)
**Fokus:** Vise stvari se desava istovremeno

```
Stikni visual-generator skill.

Transcript:
"When you type a character in Google Docs, seven things happen simultaneously. The keystroke is captured and immediately rendered in your local DOM — that's instant, you see the letter appear. At the same time, the character is appended to your local operation log with a timestamp and position. The Operational Transform engine checks if there are pending remote changes — if your colleague typed something at the same position, OT resolves the conflict by adjusting positions. The change is sent to Google's Collab server via WebSocket — average latency 50ms. The server receives changes from all connected clients, applies its own OT resolution, and broadcasts the canonical version back. Your client receives the server's version and reconciles any differences. Meanwhile, the autosave system batches changes every 2 seconds and writes to persistent storage. And the revision history system snapshots the document state every 30 seconds for the version timeline. All of this — from keystroke to sync to save — happens in under 200 milliseconds."

Napravi komponentu i registruj je u Root.tsx. Port 4014.
```

---

## TEST 15 — Animirani UI (search bar, typing) (port 4015)
**Fokus:** Animiraj SAM KONCEPT — search bar sa typing, rezultati koji se pojavljuju

```
Stikni visual-generator skill.

Transcript:
"Let's see how Google Autocomplete actually works behind the scenes. You start typing 'how to' in the search bar. After just two characters, Google fires off a request to its prediction servers. These servers look at four things simultaneously: your personal search history, trending searches in your region right now, the most common completions globally, and freshness — is something happening in the news right now? Within 50 milliseconds, ten predictions come back ranked by probability. 'how to tie a tie' might be number one at 23% probability, 'how to screenshot' at 18%, 'how to lose weight' at 12%. As you type the third character, the predictions re-rank instantly. By the time you've typed 'how to sc', 'how to screenshot on mac' jumps to position one. Google serves over 8 billion of these prediction requests per day. The model updates hourly for trending topics — when a celebrity does something, new predictions appear within minutes."

Napravi komponentu i registruj je u Root.tsx. Port 4015.
```

---

## TEST 16 — Chat/messaging animacija (port 4016)
**Fokus:** Animiraj konverzaciju — poruke koje se pojavljuju, typing indicator

```
Stikni visual-generator skill.

Transcript:
"Here's what happens when you send a WhatsApp message. You type 'Hey' and hit send. The message leaves your phone encrypted with Signal Protocol — a 256-bit AES key that even WhatsApp can't read. It hits WhatsApp's relay server in about 30 milliseconds. The server checks: is the recipient online? If yes, push directly — delivered in under 100ms total. The double check mark appears on your screen. If they're offline, the server queues the message — it'll wait up to 30 days. When the recipient opens WhatsApp, queued messages flood in. They see the message, their client sends a read receipt back — now you see blue check marks. The whole round trip, online to online? Under 200 milliseconds. But here's the thing people don't realize — WhatsApp processes 100 billion messages per day. That's 1.15 million messages per second, all end-to-end encrypted, all with delivery receipts, all synced across up to 4 devices per account."

Napravi komponentu i registruj je u Root.tsx. Port 4016.
```

---

## TEST 17 — Terminal/CLI animacija (port 4017)
**Fokus:** Animiraj terminal komande, output koji se pojavljuje

```
Stikni visual-generator skill.

Transcript:
"Watch what happens when you run git push. First, Git compresses your commits into a packfile — it delta-compresses similar objects, turning 50MB of changes into maybe 2MB. Then it opens an SSH connection to GitHub's servers — that's the 'Counting objects' you see, about 200ms for the handshake. Git sends the packfile over — speed depends on your upload, but usually 1-3 seconds. GitHub receives it and runs server-side hooks — first it checks your permissions, then runs any branch protection rules. If you have CI configured, GitHub fires a webhook to your CI provider within 50ms. GitHub updates the branch ref — that's atomic, either it works or it doesn't. You see 'Everything up-to-date' or the new commit hash. Back on your machine, Git updates the remote tracking branch. Total time from hitting enter to seeing the confirmation? Usually 3-5 seconds. But those 3 seconds involve cryptography, compression, network transfer, authentication, hooks, and atomic reference updates."

Napravi komponentu i registruj je u Root.tsx. Port 4017.
```

---
---

# HARD MODE — Raznovrsni, duzi, mesani testovi

---

## TEST 18 — Kako radi Redis caching (port 4018)
**Tip:** Mehanizam sa before/after i performans razlikom

```
Stikni visual-generator skill.

Transcript:
"Every time your app hits the database, it takes 50-200 milliseconds. Do that 1000 times per second and your database is crying. That's where Redis comes in — an in-memory key-value store that responds in under 1 millisecond. Here's the pattern: user requests data, your app checks Redis first. Cache hit? Return instantly, 0.8ms. Cache miss? Query the database, get the result in 120ms, store it in Redis with a TTL of 300 seconds, then return. Next request for the same data? 0.8ms from Redis. The hit rate matters everything — at 90% hit rate, your average response time drops from 120ms to 12.7ms. At 99% hit rate, it's 2ms. But there's a catch — cache invalidation. When the underlying data changes, you need to delete or update the cached version. Miss this and users see stale data. The two hardest problems in computer science: cache invalidation, naming things, and off-by-one errors."

Napravi komponentu i registruj je u Root.tsx. Port 4018.
```

---

## TEST 19 — Kako radi OAuth2 login flow (port 4019)
**Tip:** Korisnik interaguje sa vise sistema — redirekcije, tokeni

```
Stikni visual-generator skill.

Transcript:
"You click 'Sign in with Google' on some random website. What actually happens? The website redirects your browser to accounts.google.com with a special URL containing a client_id and a redirect_uri — basically saying 'hey Google, this app wants to know who this user is, send them back to this URL when done.' Google shows you the consent screen — 'This app wants to see your email and profile.' You click Allow. Google redirects you BACK to the original website with an authorization code in the URL — a short-lived, one-time-use code. The website's server takes that code and makes a server-to-server call to Google — exchanging the code for an access token and a refresh token. The access token lasts 1 hour. The refresh token lasts until you revoke it. Now the website can call Google's API with that token to get your email and name. The user never typed a password on the website. The website never saw the user's Google password. That's the beauty of OAuth2 — delegated authorization without sharing credentials."

Napravi komponentu i registruj je u Root.tsx. Port 4019.
```

---

## TEST 20 — Kako WebSocket handshake radi (port 4020)
**Tip:** Protokol upgrade, bidirekciona komunikacija

```
Stikni visual-generator skill.

Transcript:
"HTTP is like sending letters — you send a request, wait for a response, connection closes. WebSocket is like a phone call — once connected, both sides can talk anytime. But WebSocket starts AS an HTTP request. Your browser sends a GET with two special headers: 'Upgrade: websocket' and 'Connection: Upgrade'. The server responds with 101 Switching Protocols — the HTTP connection literally transforms into a WebSocket connection. Same TCP socket, different protocol. Now both sides can send frames — tiny packets with a 2-byte header instead of HTTP's hundreds of bytes. Server can push data without the client asking — that's the game changer. Stock prices updating in real time? WebSocket. Multiplayer game state? WebSocket. Chat messages? WebSocket. The connection stays open until one side sends a close frame. Typical WebSocket message: 6 bytes overhead. Same data over HTTP: 400+ bytes of headers. For apps sending 100 messages per second, that's the difference between 600 bytes and 40 kilobytes per second."

Napravi komponentu i registruj je u Root.tsx. Port 4020.
```

---

## TEST 21 — Kako radi load balancing (port 4021)
**Tip:** Algoritmi, distribucija, health checks, failover

```
Stikni visual-generator skill.

Transcript:
"You have three servers. 10,000 users are hitting your app. How do you distribute them? Round robin is the simplest — request 1 goes to server A, request 2 to server B, request 3 to server C, repeat. Dead simple. But what if server B is running a heavy batch job and is already at 90% CPU? Round robin doesn't care — it still sends every third request to B. That's where least connections wins. The load balancer tracks active connections — A has 230, B has 890, C has 310. New request goes to A. B is struggling? It naturally gets fewer requests. But even least connections fails with long-running connections like WebSockets. Enter weighted round robin — you assign weights. Server A is a beefy 32-core machine, weight 5. Server B is a small 4-core, weight 1. Server C is medium, weight 3. For every 9 requests, A gets 5, C gets 3, B gets 1. Now add health checks — the load balancer pings each server every 10 seconds. Server B stops responding? All its traffic instantly shifts to A and C. When B recovers, traffic gradually returns. This is why your users never notice when a server dies."

Napravi komponentu i registruj je u Root.tsx. Port 4021.
```

---

## TEST 22 — Kako radi garbage collection (port 4022)
**Tip:** Apstraktan koncept, vizuelna metafora za memoriju

```
Stikni visual-generator skill.

Transcript:
"Your program creates objects on the heap — every time you write 'new User()' or append to an array, memory gets allocated. After a while, some objects are still in use and some are garbage — nothing references them anymore. The garbage collector's job is to find and reclaim that dead memory. Mark and sweep is the classic approach — start from the roots, which are your global variables and the call stack. Follow every reference — if you can reach an object from a root, it's alive. Mark it. When you're done marking, sweep through the entire heap — anything not marked is garbage. Delete it. Free the memory. But here's the performance problem — during mark-and-sweep, your program STOPS. That's a stop-the-world pause. On a heap with 2GB of objects, that pause can be 200 milliseconds. Users notice. Modern GCs like Go's use concurrent marking — the program runs while the GC marks objects. The tradeoff: it uses more CPU but the pauses drop to under 1 millisecond. Java's ZGC takes it further — pauses under 10 microseconds regardless of heap size, even with 16TB heaps."

Napravi komponentu i registruj je u Root.tsx. Port 4022.
```

---

## TEST 23 — Kako radi CDN (port 4023)
**Tip:** Geografija, latencija, caching na edge-u

```
Stikni visual-generator skill.

Transcript:
"Your website is hosted in Virginia. A user in Tokyo requests your homepage. The data travels 11,000 kilometers through undersea fiber optic cables — that's 150 milliseconds just for the speed of light. Add routing hops, and you're looking at 250ms round trip before the first byte arrives. Now multiply by every asset — HTML, CSS, JavaScript, images. A CDN fixes this by caching your content at 300+ edge locations worldwide. First request from Tokyo still goes to Virginia — 250ms. But now that response is cached at the Tokyo edge. Second user in Tokyo? Served from 50 kilometers away — 5ms. The CDN handles 90% of all traffic, your origin server only sees 10%. Netflix pushes this to the extreme — they embed custom servers called Open Connect Appliances directly inside ISPs. Your Netflix stream literally comes from a server in your ISP's building, not from Netflix's data center. Latency: under 5ms. That's why Netflix streams 4K without buffering while your corporate VPN struggles with a PDF."

Napravi komponentu i registruj je u Root.tsx. Port 4023.
```

---

## TEST 24 — Kako radi HTTPS/TLS handshake (port 4024)
**Tip:** Kriptografija, razmena kljuceva, vise koraka

```
Stikni visual-generator skill.

Transcript:
"When you type https://google.com, your browser and Google's server do a dance called the TLS handshake — all before a single byte of your search query is sent. Step one: Client Hello. Your browser sends a list of cipher suites it supports and a random number. Takes about 30ms to reach the server. Step two: Server Hello. Google picks a cipher suite, sends its own random number, and its SSL certificate — a file that proves 'yes, I really am google.com, signed by a trusted authority.' Step three: your browser verifies the certificate against its built-in list of trusted CAs. Is it expired? Is the domain correct? Is the signing chain valid? All checked in under 1ms. Step four: key exchange. Using the server's public key, your browser generates a pre-master secret, encrypts it, and sends it over. Only Google's private key can decrypt it. Both sides now independently compute the same session key from the random numbers and the pre-master secret. Step five: Finished. Both sides send a test message encrypted with the new session key. If both can decrypt it, the handshake succeeds. Total time: 1-2 round trips, about 100ms. From now on, every byte is encrypted with AES-256 — so fast it adds less than 1ms of latency."

Napravi komponentu i registruj je u Root.tsx. Port 4024.
```

---

## TEST 25 — Kako radi video encoding za streaming (port 4025)
**Tip:** Transformacija podataka, adaptivni bitrate, segmenti

```
Stikni visual-generator skill.

Transcript:
"You upload a 4K video to YouTube. It's 10GB of raw footage. Within minutes, YouTube has created 11 different versions of your video — from 144p at 100kbps to 4K at 20Mbps. Each version is split into 2-second segments — a 10-minute video becomes 300 segments per quality level, that's 3,300 segments total. When a viewer hits play, their player downloads the manifest file — a list of all available segments at all quality levels. It starts with a medium quality. Player monitors bandwidth in real-time — getting 15Mbps? Switch to 1080p. Bandwidth drops to 3Mbps? Seamlessly switch to 480p mid-stream, no buffering. This is called adaptive bitrate streaming, and it's why YouTube rarely buffers. The encoding itself uses H.264 or VP9 — these codecs find redundancy in video. A talking head? 90% of pixels don't change frame to frame — only encode the differences. A nature documentary with constant motion? Every frame needs more data. YouTube's encoder adapts — it allocates more bits to complex scenes and fewer to simple ones. The result: your 10GB upload becomes about 2GB across all quality levels, streamed to 2 billion devices."

Napravi komponentu i registruj je u Root.tsx. Port 4025.
```

---

## TEST 26 — Kako radi rate limiting (port 4026)
**Tip:** Algoritam sa vizuelnom metaforom (token bucket)

```
Stikni visual-generator skill.

Transcript:
"Without rate limiting, one angry user with a script can send 10,000 requests per second and bring down your entire API. Rate limiting is your bouncer at the door. The token bucket algorithm is elegant — imagine a bucket that holds 100 tokens. Every second, 10 new tokens drip in. Each API request costs one token. If the bucket has tokens, request goes through and a token is removed. If the bucket is empty, request is rejected with a 429 Too Many Requests. The beauty: burst traffic is fine. You can send 100 requests instantly — that empties the bucket. Then you're limited to 10 per second as tokens refill. Over time, you average 10 requests per second, but you can burst when needed. Stripe uses a similar system — 100 requests per second per API key in test mode, 10,000 in live mode. Hit the limit? They return a Retry-After header telling you exactly how many seconds to wait. The sliding window approach is different — it counts requests in the last 60 seconds. At any moment, if you've made more than 600 requests in the past minute, you're blocked. No bursting, but more predictable. Redis is perfect for this — INCR the counter, EXPIRE after 60 seconds. Two commands, sub-millisecond, handles millions of keys."

Napravi komponentu i registruj je u Root.tsx. Port 4026.
```

---

## TEST 27 — Kako radi consensus (Raft algorithm) (port 4027)
**Tip:** Distribuirani sistem, leader election, log replication

```
Stikni visual-generator skill.

Transcript:
"You have 5 database servers. A client writes data to one of them. How do you make sure all 5 have the same data, even if 2 of them crash? That's the consensus problem, and Raft is one of the cleanest solutions. Every server is in one of three states: follower, candidate, or leader. On startup, everyone is a follower. They wait for a heartbeat from the leader. No heartbeat for 150-300 milliseconds? A follower becomes a candidate and starts an election. It votes for itself and asks others to vote. If it gets votes from a majority — 3 out of 5 — it becomes the leader. Now all writes go through the leader. Client sends 'SET x = 5'. The leader appends this to its log and sends it to all followers. When a majority acknowledges — 3 out of 5 — the entry is committed. The leader tells the client 'success.' If the leader dies, followers notice the missing heartbeat. A new election starts within 300ms. The new leader has all committed entries because it needed a majority to win, and a majority had the latest data. This is how etcd works — the key-value store behind every Kubernetes cluster. Your kubectl commands are Raft-replicated writes."

Napravi komponentu i registruj je u Root.tsx. Port 4027.
```
