# Sound Synchronization Rules

Pravila za sinhronizaciju zvukova sa animacijama u motion graphics projektima.

---

## FUNDAMENTALNO PRAVILO: JEDNA KOMPOZICIJA

**Vizualno + Audio = JEDNA CELINA koja se planira ZAJEDNO od početka.**

```
❌ POGREŠNO:  Napravi animacije → Dodaj zvukove na kraju
✅ ISPRAVNO:  Planiraj sve zajedno → Animacije i zvuci su koordinisani
```

### Šta ovo znači u praksi:

**1. Pre pravljenja animacije, razmisli:**
- Gde će biti camera transitions? → Tu ide whoosh
- Koliko elemenata se pojavljuje odjednom? → Ako više, NE stavljaj zvuk na svaki
- Da li se ova animacija preklapa sa drugom? → Odluči KO dobija zvuk

**2. Dok praviš camera keyframes:**
- Označi "SOUND POINT" frame numbers
- Ostavi 20+ frames između velikih animacija za "breathing room"
- Grupiši staggered animacije kao JEDNU ZVUČNU JEDINICU

**3. Dok praviš element animacije:**
- Ako se element pojavljuje TOKOM camera move → NEMA zvuk
- Ako se element pojavljuje u TIŠINI → Može imati zvuk
- Ako je 5 ikonica staggered → JEDAN zvuk ili NULA, ne 5

### Praktični primer planiranja:

```
FRAME 0-200:    Section 1 reveal + icons
                → 1 soft-whoosh za section
                → 0 zvukova za icons (staggered)

FRAME 200-220:  Camera transition
                → 1 medium-whoosh (DOMINANTAN)
                → NIŠTA drugo u ovom prozoru!

FRAME 220-240:  "Breathing room" - TIŠINA
                → Nema novih zvukova

FRAME 240+:     Section 2 reveal
                → 1 soft-whoosh za section
```

### Skill/Workflow implikacije:

Kad Claude pravi animacije u Remotion, MORA da:
1. Output-uje `SOUND_SYNC_POINTS` listu sa frame numbers
2. Grupiše staggered animacije kao jednu entry
3. Označi camera transition windows kao "NO OTHER SOUNDS"
4. Proveri da nema preklapanja pre nego doda bilo šta

---

## AI CONSERVATIVE RULE

**AI nema osećaj ni iskustvo za zvukove. Zato mora biti KONZERVATIVAN.**

```
ČOVEK SA ISKUSTVOM:    Može dodati 15+ zvukova i fino ih uskladiti
AI BEZ ISKUSTVA:       Samo PRIMARNI zvukovi koji SIGURNO rade
```

### Pravilo za AI-generated content:

**DODAJ SAMO:**
- Camera transition whooshes (uvek radi, očigledno)
- Section reveal whooshes (ako nije blizu camera)
- Final outro whoosh (zaključuje video)

**NE DODAJ (previše rizično):**
- Icon pop-up sounds (lako se preteruje)
- Staggered animation sounds (AI ne zna kad je previše)
- Ambience (teško za balansiranje)
- Hits/risers (dramatični, lako promašiš)

### Zašto ovo pravilo:

1. **AI ne čuje rezultat** dok pravi - čovek može testirati i fino podesiti
2. **AI ne zna kontekst** - da li je voiceover glasan, tih, brz, spor
3. **Greška AI-a se čuje** - loš zvuk je gori od bez zvuka
4. **Less is more** - 5 dobrih zvukova > 20 random zvukova

### Praktična primena:

```
60-sekundni video:
- 5-6 camera whooshes     ✓ SIGURNO
- 3-4 section whooshes    ✓ SIGURNO (ako nema overlap)
- 1 outro whoosh          ✓ SIGURNO
- 0 icon sounds           ✓ SIGURNO (skip, ne rizikuj)
─────────────────────────────────────
TOTAL: ~10 zvukova MAX

= Čisto, profesionalno, bez rizika
```

### Kad ČOVEK pregleda:
Posle prvog renderovanja, čovek može ručno dodati:
- Dodatne icon sounds gde fali
- Ambience ako treba
- Fine-tuning volume levels

**AI postavlja SIGURNU BAZU, čovek fino podešava.**

---

## HIJERARHIJA ZVUKOVA (Prioritet)

```
1. VOICEOVER      ████████████████████  (1.0)   - Nikad ne prekrivati
2. CAMERA MOVE    ████████              (0.25)  - Glavni SFX
3. SECTION REVEAL ██████                (0.20)  - Sekundarni SFX
4. ICON POP-UP    ████                  (0.15)  - Tercijarni SFX
5. AMBIENCE       ██                    (0.05)  - Background
```

**ZLATNO PRAVILO:** Ako se dva zvuka preklapaju, niži prioritet se UKIDA ili TIŠI.

---

## OVERLAP RULES (Kada NE dodavati zvuk)

### Rule 1: Camera Movement Trumps All
```
AKO camera_moving == TRUE:
    → NE dodavaj section reveal whoosh
    → NE dodavaj icon pop sounds
    → SAMO camera whoosh
```

**Zašto:** Camera transition je dominantan vizualni i audio momenat. Dodavanje drugih zvukova stvara haos.

### Rule 2: Staggered Animations = ONE Sound
```
AKO multiple_icons_staggered == TRUE:
    → JEDAN zvuk na PRVI element, ILI
    → NULA zvukova (silence)
    → NIKAD zvuk na svaki element
```

**Zašto:** 23 whoosh-a za 23 ikonice = audio garbage. Stagger vizuelno, ali ne audio.

### Rule 3: Silence After Camera
```
AKO camera_just_stopped (within 15 frames):
    → Pusti 10-15 frames TIŠINE pre sledećeg zvuka
    → Ovo daje "breathing room"
```

**Zašto:** Konstantan zvuk = ništa ne ističe. Tišina pravi kontrast.

---

## KOJI ZVUK ZA KOJU ANIMACIJU

| Animacija | Zvuk | Trajanje | Volume | Timing |
|-----------|------|----------|--------|--------|
| Camera pan/zoom | `medium-whoosh.mp3` | ~0.5s | 0.25 | -2 frames pre |
| Section box reveal | `soft-whoosh.mp3` | ~0.3s | 0.20 | @ reveal start |
| Icon pop-up (single) | `pop-blip.mp3` | ~0.1s | 0.15 | @ pop peak |
| Icon pop-up (staggered) | NIŠTA ili 1x pop | - | - | - |
| Text typing | `soft-click.mp3` × N | ~0.1s | 0.10 | @ each letter |
| Final outro | `slow-whoosh.mp3` | ~1s | 0.30 | -5 frames pre |

---

## ŠTA SMO POGREŠILI

### Greška 1: Whoosh za Icon Pop-ups
**Pogrešno:** `thin-whoosh.mp3` za svaku ikonicu
**Trebalo:** `pop-blip.mp3` (kratki, digitalni pop) ili NIŠTA

**Zašto:** Whoosh implicira KRETANJE kroz prostor. Ikonica se pojavljuje IN PLACE - nema kretanja.

### Greška 2: Previše Zvukova (Sound Overcrowding)
**Pogrešno:** 35 zvukova za ~60 sekundi videa
**Trebalo:** ~10-15 zvukova MAX

**Račun:**
- 6 camera whooshes ✓ (OK, ovo ostaje)
- 6 section whooshes ⚠️ (nekih preklapanje sa camera, možda 3-4)
- 23 icon whooshes ✗ (TOTALNO POGREŠNO - treba 0 ili 3-4 pop zvuka)

### Greška 3: Preklapanje Camera + Section
**Pogrešno:** Camera whoosh @ frame 218, Section whoosh @ frame 232
**Problem:** Samo 14 frames razmaka = zvuci se preklapaju

**Trebalo:**
- Ili SAMO camera whoosh
- Ili section whoosh 20+ frames POSLE camera završi

### Greška 4: Pogrešan Tip Zvuka za UI
**Pogrešno:** Whoosh (organic, movement sound) za digitalne ikonice
**Trebalo:** Pop/Blip (digital, percussive sound) za UI elemente

---

## ISPRAVLJENA IMPLEMENTACIJA

### Šta OSTAJE:
```tsx
// Camera transitions - KEEP (6 total)
<Sequence from={218} durationInFrames={30}>
  <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
</Sequence>
// ... ostale camera transitions
```

### Šta se BRIŠE:
```tsx
// ❌ OBRIŠI: Sve icon pop-in whooshes (23 komada)
// ❌ OBRIŠI: Section whooshes koji su <20 frames od camera transition
```

### Šta se MENJA:
```tsx
// Section reveal - SAMO ako nije blizu camera transition
// Proveri: |section_frame - camera_frame| > 20

// Icon pop-ups - ako uopšte treba zvuk:
// UMESTO: thin-whoosh.mp3 × 23
// KORISTI: pop-blip.mp3 × 0-4 (samo na KEY ikone)
```

---

## NOVA PRAVILA ZA SKILL

### Pre dodavanja zvuka, proveri:
1. [ ] Da li se preklapa sa camera transition? → AKO DA, skip
2. [ ] Da li je staggered animacija? → AKO DA, max 1 zvuk ili 0
3. [ ] Da li dodaje VALUE? → AKO NE, skip
4. [ ] Da li je prošlo 15+ frames od zadnjeg zvuka? → AKO NE, razmisli

### Volume Formula:
```
base_volume = type_volume  // (camera=0.25, section=0.20, icon=0.15)
final_volume = base_volume * (voiceover_present ? 0.8 : 1.0)
```

### Timing Formula:
```
whoosh_start = animation_start - 2 frames (pre-cue effect)
pop_start = animation_peak (kad scale = max)
```

---

## ZVUKOVI KOJE TREBA DODATI

Trenutno NEMAMO pop/blip zvukove. Treba:

| Zvuk | Za šta | Gde nabaviti |
|------|--------|--------------|
| `pop-blip.mp3` | Icon pop-ups | Epidemic Sound → SFX → UI/Buttons → "Pop" |
| `soft-pop.mp3` | Subtle reveals | Epidemic Sound → SFX → UI → "Blip" |
| `digital-pop.mp3` | Tech UI | Epidemic Sound → SFX → UI → "Digital" |

---

## REFERENCE

Research sources:
- Krotosa Audio: "Don't mindlessly stack sounds"
- School of Motion: "Less is almost always more"
- Film Editing Pro: Step-by-step sound design workflow
- Jacob Nordin: "Silence is just as important as sound"
- Herman Huang: Frequency layering for whooshes
- Nicolas Titeux: Sound design for motion design

---

## CHECKLIST PRED RENDEROVANJE

- [ ] Svi camera whooshes postavljeni?
- [ ] Section whooshes NE preklapaju camera? (20+ frames gap)
- [ ] Icon sounds = 0 ili samo KEY ikonice sa pop zvukom?
- [ ] Nema više od 15 zvukova za 60s video?
- [ ] Volume hijerarhija poštovana?
- [ ] Test: Pusti bez slike - da li zvukovi imaju smisla?
