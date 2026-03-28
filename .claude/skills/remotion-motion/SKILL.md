# Remotion Motion Graphics Skill

Pravi animirane motion graphics u Remotion-u (React). Premium dark theme stil, glassmorphism, glow efekti.

---

## DVA AGENTA, JEDNA KOMPOZICIJA

Ovaj skill koristi **2 specijalizovana agenta** koji rade ZAJEDNO:

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISUAL-PROPOSER                               │
│  Čita transcript, detektuje gap u vizualima, predlaže nove      │
│  Output: 0-2 nova vizuala u src/visuals/ (ako ima gap)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VISUAL-ROUTER                                 │
│  Segmentira transcript, bira vizuale, generiše strukturu        │
│  Output: visual-structure.json                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REMOTION-PLANNER                              │
│  Planira SVE zajedno: voiceover, structure, camera, sounds      │
│  Output: master-plan.json                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      master-plan.json
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REMOTION-BUILDER                              │
│  Implementira prema planu: React/Remotion kod                    │
│  Output: Funkcionalan video projekat                             │
└─────────────────────────────────────────────────────────────────┘
```

**ZAŠTO OVAJ REDOSLED:**
- Proposer PRVO obogati biblioteku vizuala (ako fali nešto)
- Router ONDA koristi obogaćen katalog za bolji routing
- Planner ima FOKUS na koordinaciju (camera + sounds + timing)
- Builder ima FOKUS na implementaciju (kod)
- Greške se lakše pronalaze (koji agent je zajebao?)
- Manji context = bolji fokus = manje grešaka

---

## WORKFLOW

### KORAK 0: Pokreni VISUAL PROPOSER

```
Koristi: visual-proposer skill
Input: Transcript tekst
Output: 0-2 nova vizuala u src/visuals/ (ako ima gap)
```

**Proposer radi:**
1. Čita transcript + postojeći katalog (13+ vizuala)
2. Gap analysis — da li fali vizual za neki koncept?
3. Ako DA → predloži, generiše, user approve → dodaje u biblioteku
4. Ako NE → preskoči, nastavi na Router

**BITNO:** Ovaj korak je OPCIONI — ako nema gap-a, odmah ide na Korak 1.

### KORAK 0.5: Pokreni VISUAL ROUTER

```
Koristi: remotion-visual-router skill
Input: Transcript tekst
Output: visual-structure.json
```

**Router radi:**
1. Segmentira transcript u sekcije
2. Bira vizuale za svaku sekciju (iz OBOGAĆENOG kataloga)
3. Izvlači podatke iz teksta
4. Grupiše u sticky-je
5. Validira composition

### KORAK 1: Pokreni PLANNER

```
Koristi: remotion-planner skill
Input: Transcript tekst
Output: master-plan.json + voiceover.mp3 + timestamps.json
```

**Planner radi:**
1. Generiše voiceover sa timestamps
2. Analizira strukturu (flat vs sticky)
3. Planira camera keyframes
4. Planira sound points
5. Validira plan
6. Output: `master-plan.json`

### KORAK 2: Pokreni BUILDER

```
Koristi: remotion-builder skill
Input: master-plan.json
Output: Funkcionalan Remotion projekat
```

**Builder radi:**
1. Kopira template
2. Generiše config iz plana
3. Implementira komponente
4. Dodaje sounds prema planu
5. Validira output

---

## FUNDAMENTALNO: JEDNA KOMPOZICIJA

**Vizualno + Audio + Camera + Sounds = JEDNA CELINA**

```
❌ POGREŠNO:
   Planner: samo timestamps
   Builder: odlučuje camera, sounds
   = RASPAD koordinacije

✅ ISPRAVNO:
   Planner: SVE zajedno (timestamps + camera + sounds)
   Builder: SAMO implementira plan
   = KOORDINISANA kompozicija
```

---

## KADA KORISTITI

- User traži animirani infographic
- User traži motion graphics za video
- User daje dijagram/flow za animiranje
- Bilo koja animated React komponenta za video

---

## QUICK REFERENCE

| Šta | Gde |
|-----|-----|
| Planner skill | `remotion-planner/SKILL.md` |
| Builder skill | `remotion-builder/SKILL.md` |
| Master plan schema | `reference/master-plan-schema.md` |
| Camera details | `reference/camera.md` |
| Sound details | `reference/sound.md` |
| Design details | `reference/design.md` |
| Voiceover details | `reference/voiceover.md` |
| Full legacy (backup) | `SKILL-FULL.md` |

---

## TEMPLATE

**⚠️ UVEK KORISTI OVAJ TEMPLATE:**
```bash
cp -r "/Users/dario61/Desktop/YT automation/templates/ai-video-gen-pipeline" ./my-project
```

Ovaj template ima SVE:
- DynamicPipeline.tsx sa AnimatedLine (linije između ikonica)
- ExplainerLayout.tsx
- 35 ikonica
- Camera + Sound sistem

**NE KORISTI stare template-e** (`test-sticky-1`, `remotion-nvidia-test`)

---

## VALIDACIJA

### Posle PLANNER-a proveri:
- [ ] master-plan.json postoji
- [ ] Frame 0 ima content (ne crn ekran!)
- [ ] Camera keyframes su 15 frames PRE sekcija
- [ ] Sounds <= 10 za 60 sec
- [ ] Svi elementi imaju startFrame

### Posle BUILDER-a proveri:
- [ ] `npm run dev` radi
- [ ] Preview pokazuje animaciju od frame 0
- [ ] Camera se pomera smooth
- [ ] Sounds se čuju
- [ ] Sync sa voiceoverom je tačan

---

## KRITIČNA PRAVILA (oba agenta moraju pratiti!)

### 1. Animacija od PRVOG FRAMEA
```
Frame 0: Title ili prvi element MORA biti vidljiv
NIKAD crn ekran dok voiceover priča!
```

### 2. Camera anticipira
```
Camera dolazi 15 frames PRE sekcije
NE istovremeno, NE posle!
```

### 3. Sounds su koordinisani
```
Camera whoosh: 2 frames PRE camera keyframe
Section whoosh: 20+ frames POSLE camera
Max 10 zvukova za 60 sec
```

### 4. Plan je ISTINA
```
Builder NE odlučuje ništa novo
Sve je u master-plan.json
Ako nešto fali u planu → vrati planner-u
```

### 5. SVAKI KORAK = ZASEBAN STICKY
```
❌ POGREŠNO: 1 sticky sa 5 sekcija
✅ ISPRAVNO: 3-5 sticky-ja (Step 1, Step 2, Step 3...)
   Svaki sticky ima 2-4 sekcije
   Svaka sekcija ima 2-3 noda
```

---

## DEBUGGING

| Problem | Uzrok | Fix |
|---------|-------|-----|
| Crn ekran na početku | Plan nema content na frame 0 | Fix u PLANNER-u |
| Camera kasni | Keyframes nisu 15 frames ranije | Fix u PLANNER-u |
| Sounds haos | Previše ili overlap | Fix u PLANNER-u |
| Kod ne radi | Builder greška | Fix u BUILDER-u |
| Elementi levo | Missing justifyContent | Fix u BUILDER-u |

---

## DEPENDENCIES

- `frontend-design` skill - Za premium dizajn
- ElevenLabs API - Za voiceover
- Remotion - Za video rendering
