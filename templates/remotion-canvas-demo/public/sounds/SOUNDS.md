# Sound Design Guide

Dokumentacija za zvukove u Remotion projektima. **Claude mora čitati ovaj fajl pre dodavanja zvukova u animacije.**

---

## KATEGORIJE ZVUKOVA

### 1. WHOOSHES (`/whooshes/`)

**Kada koristiti:**
- Camera pan/zoom tranzicije (Infinite Canvas kretanje)
- Element pop-in/pop-out animacije
- Brzi slide-in teksta ili boxova
- Swipe između sekcija

**Timing pravilo:**
```
Whoosh START = animacija_start - 8 frames (~266ms @ 30fps)
Whoosh PEAK  = najbrži deo animacije (max velocity)
```

**Volume:** `0.2 - 0.3` (nikad glasnije od voiceovera)

**Fajlovi:**
| Fajl | Trajanje | Koristi za |
|------|----------|------------|
| `fast-whoosh.mp3` | ~0.3s | Brze camera tranzicije, snappy zoom |
| `medium-whoosh.mp3` | ~0.5s | Standardne tranzicije, pan između sekcija |
| `soft-whoosh.mp3` | ~0.4s | Suptilne tranzicije, element fade-slide |
| `heavy-whoosh.mp3` | ~0.6s | Dramatične reveal tranzicije |

**Primer upotrebe:**
```tsx
// Camera prelazi na novu sekciju @ frame 60
// Whoosh počinje 8 frames ranije
<Audio src={whooshSound} startFrom={0} volume={0.25} />
// Audio se renderuje @ frame 52
```

---

### 2. RISERS (`/risers/`)

**Kada koristiti:**
- Build-up pre važnog reveal-a
- Tenzija pre "big moment"
- Pre nego što se pojavi glavni naslov/hero element
- Countdown osećaj

**Timing pravilo:**
```
Riser START  = 30-60 frames PRE reveal-a (1-2 sec)
Riser PEAK   = tačno kad se element pojavi
```

**Volume:** `0.15 - 0.25` (u pozadini, ne dominira)

**Fajlovi:**
| Fajl | Trajanje | Koristi za |
|------|----------|------------|
| `short-riser.mp3` | ~1s | Brzi build-up, mini reveal |
| `medium-riser.mp3` | ~2s | Standardni reveal, sekcija intro |
| `dramatic-riser.mp3` | ~3s | Veliki moment, finale |

**Primer upotrebe:**
```tsx
// Hero tekst se pojavljuje @ frame 120
// Riser počinje 45 frames ranije (1.5 sec build-up)
<Audio src={riserSound} startFrom={0} volume={0.2} />
// Audio se renderuje @ frame 75
```

---

### 3. HITS / IMPACTS (`/hits/`)

**Kada koristiti:**
- Emphasis na važnu reč/broj
- Drop posle riser-a
- Stamp/seal animacije
- "Bam!" momenti

**Timing pravilo:**
```
Hit PEAK = TAČNO kad element dostigne finalnu poziciju
```

**Volume:** `0.3 - 0.4` (može biti glasniji, kratko traje)

**Fajlovi:**
| Fajl | Trajanje | Koristi za |
|------|----------|------------|
| `soft-hit.mp3` | ~0.2s | Suptilan naglasak |
| `punch-hit.mp3` | ~0.3s | Jak emphasis, broj/statistika |
| `boom-hit.mp3` | ~0.5s | Dramatičan drop, finale |
| `cinematic-hit.mp3` | ~0.7s | Epski moment sa reverb-om |

**Primer upotrebe:**
```tsx
// Broj "10M+" se pojavljuje sa scale animacijom @ frame 90
// Hit tačno kad scale animacija završi
<Audio src={hitSound} startFrom={0} volume={0.35} />
// Audio se renderuje @ frame 90
```

---

### 4. CLICKS / UI SOUNDS (`/clicks/`)

**Kada koristiti:**
- Tekst typing animacije
- Male ikonice koje se pojavljuju
- Button/UI elementi
- Checkbox, toggle animacije
- Lista items jedan po jedan

**Timing pravilo:**
```
Click = TAČNO kad se element pojavi (frame-perfect)
```

**Volume:** `0.1 - 0.2` (vrlo tihi, suptilni)

**Fajlovi:**
| Fajl | Trajanje | Koristi za |
|------|----------|------------|
| `soft-click.mp3` | ~0.1s | Typing, mali elementi |
| `pop-click.mp3` | ~0.15s | Ikonica pop-in, badge |
| `tick-click.mp3` | ~0.1s | Checkbox, bullet point |
| `mechanical-click.mp3` | ~0.2s | Toggle, switch |

**Primer upotrebe:**
```tsx
// 5 ikonica se pojavljuju sa staggered animacijom
// Svaka ikonica ima svoj click
const iconFrames = [60, 65, 70, 75, 80];
iconFrames.map(f => <Audio src={clickSound} startFrom={0} volume={0.15} />)
```

---

### 5. AMBIENCE (`/ambience/`)

**Kada koristiti:**
- Background atmosphere (opcionalno)
- Tech/digital vibe
- Intro/outro sekcije

**Volume:** `0.05 - 0.1` (jedva čujno, subliminal)

**Fajlovi:**
| Fajl | Koristi za |
|------|------------|
| `digital-hum.mp3` | Tech projekti, AI teme |
| `soft-pad.mp3` | Chill atmosfera |

---

## VOLUME HIJERARHIJA

```
1.0  ████████████████████  Voiceover (DOMINANT)
0.35 ███████               Hits (kratki, emphasis)
0.25 █████                 Whooshes (tranzicije)
0.20 ████                  Risers (build-up)
0.15 ███                   Clicks (UI, typing)
0.08 ██                    Ambience (background)
```

**PRAVILO:** Nikad zvuk ne sme da preklopi voiceover. Ako nema voiceovera, sve može biti 1.5x glasnije.

---

## TIMING CHEAT SHEET

| Animacija | Zvuk | Kada počinje |
|-----------|------|--------------|
| Camera zoom/pan | Whoosh | -8 frames pre animacije |
| Element slide-in | Whoosh | -5 frames pre animacije |
| Big reveal | Riser → Hit | Riser -45 frames, Hit @ reveal |
| Tekst pop-in | Click | @ animacija start |
| Staggered lista | Click × N | @ svaki element |
| Sekcija završava | Soft whoosh | -5 frames pre fade-out |

---

## NAMING KONVENCIJA

Format: `{intenzitet}-{tip}.mp3`

Intenziteti:
- `soft-` = suptilan, miran
- `medium-` = standardan
- `heavy-` / `dramatic-` / `punch-` = jak, naglašen

Primeri:
- `soft-whoosh.mp3`
- `punch-hit.mp3`
- `dramatic-riser.mp3`

---

## KAKO CLAUDE BIRA ZVUK

1. **Identifikuj tip animacije** (camera move? element pop? reveal?)
2. **Pogledaj tabelu iznad** → koja kategorija?
3. **Odredi intenzitet** (suptilna animacija = soft, dramatična = heavy)
4. **Izračunaj timing** prema pravilima iznad
5. **Postavi volume** prema hijerarhiji

**Primer odlučivanja:**
```
Animacija: Camera zoom na novu sekciju
→ Tip: Camera move → Kategorija: WHOOSHES
→ Intenzitet: Standardan zoom → medium-whoosh.mp3
→ Timing: Zoom počinje @ frame 100 → Whoosh @ frame 92
→ Volume: 0.25
```

---

## SOURCES ZA KUPOVINU

1. **Epidemic Sound** (~$15/mo) - 200K+ SFX, odlična pretraga po kategorijama
2. **Artlist** (~$40/mo) - Manji izbor ali quality, ima i muziku
3. **Motion Array** - Jednokratna kupovina paketa
4. **Envato Elements** - Veliki izbor, monthly subscription

**Preporučeni workflow:**
1. Kupi subscription
2. Pretraži po kategoriji (whoosh, riser, impact, click)
3. Skini 3-5 varijanti svake kategorije
4. Preimenuj prema naming konvenciji iznad
5. Stavi u odgovarajući folder

---

## CHECKLIST PRE RENDEROVANJA

- [ ] Svaka camera tranzicija ima whoosh
- [ ] Svaki big reveal ima riser + hit
- [ ] Staggered animacije imaju clicks
- [ ] Volume levels provereni (voiceover dominant)
- [ ] Timing alignment proveren (peak = max velocity)
