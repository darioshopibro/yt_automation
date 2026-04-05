# Sound Design Rules

Pravila za zvukove u video projektima.

> **ZAPAMTI:** Zvukovi su deo JEDNE KOMPOZICIJE — planiraju se za CEO VIDEO odjednom.
> Sound Coordinator (KORAK 5.5 u planner-u) čita SVE sound hints i piše SVE zvukove.

---

## KO PRAVI ZVUKOVE?

**Dva koraka:**

1. **Visual-generator sub-agent** piše `sound_hints_X.json` — opisuje ŠTA se vizuelno dešava na kom frame-u (element pojava, reveal, transition). NE bira zvukove.

2. **Sound Coordinator** (planner KORAK 5.5) čita SVE hints i odlučuje KOJI zvuk ide gde gledajući CELINU videa. Koristi pravila iz ovog fajla.

**Input za Sound Coordinator:**
- `sound_hints_*.json` — vizuelni eventi po segmentu
- Ovaj fajl (`sound.md`) — pravila za tipove, volume, density, timing

**Output Sound Coordinator-a:**
- `sounds_segment_X.json` — finalni zvukovi sa fajl referencama i volume-om

---

## DENSITY

**NEMA limita na broj zvukova.** Svaka vizuelna promena = zvuk. Koliko promena, toliko zvukova.

Jedina pravila:
- **Variraj zvukove** — ne koristi isti fajl 3x zaredom
- **Staggered grupe** (5 ikona redom) = JEDAN click na prvu, ne na svaku
- Različiti tipovi zvukova MOGU da budu na istom frame-u (npr. whoosh + click = OK)
- Isti tip na istom frame-u = NE (npr. dva whoosh-a odjednom)

---

## 4 TIPA ZVUKOVA

### 1. WHOOSH (tranzicije)
- **Kad:** scene change, novi element slide-in, crossfade između scena
- **Timing:** 8 frames PRE vizualne promene
- **Volume:** 0.12-0.18
- **Fajlovi:** whooshes/soft-whoosh.mp3, medium-whoosh.mp3, fast-whoosh.mp3, digital-whoosh.mp3, airy-whoosh.mp3, lofi-whoosh.mp3
- **VARIRAJ** — ne koristi isti whoosh 2x zaredom

### 2. HIT / IMPACT (naglasak)
- **Kad:** reveal važne informacije, šokantan podatak pojava, veliki broj/stat
- **Timing:** frame-perfect na pojavu elementa
- **Volume:** 0.18-0.22
- **Fajlovi:** hits/soft-hit-01.mp3, bass-hit.mp3, punch-hit.mp3, epic-hit.mp3
- Hit ide na svaki reveal — koliko reveal-a, toliko hit-ova

### 3. RISER (build-up)
- **Kad:** BEFORE big reveal, pre ključnog momenta
- **Timing:** 30-45 frames PRE reveal-a
- **Volume:** 0.10-0.15
- **Fajlovi:** risers/short-riser-01.mp3, fast-riser.mp3, tension-riser.mp3
- **UVEK praćen hit-om** kad se reveal desi

### 4. CLICK (UI elementi)
- **Kad:** tekst pop-in, ikona pojava, lista item
- **Timing:** frame-perfect na pojavu
- **Volume:** 0.06-0.10
- **Fajlovi:** clicks/soft-click.mp3, tick-click.mp3, button-click.mp3
- **Za staggered (5 ikona redom)** — JEDAN click na prvu, ne na svaku

---

## VOLUME HIJERARHIJA

Zvukovi moraju biti SUPTILNI — nikad da dominiraju nad voiceover-om.
Bolje previše tiho nego previše glasno.

```
1.0  ████████████████████  Voiceover (NIKAD prekrivati)
0.20 ████                  Hit (kratki, emphasis) — TIŠIJE nego što misliš
0.15 ███                   Whoosh (tranzicije) — jedva čujno
0.12 ██                    Riser (build-up) — u pozadini
0.08 █                     Click (UI) — mikro zvuk
0.06 █                     Background music (tokom voiceovera)
```

---

## COMBO: Riser → Whoosh → Hit

Za VELIKI reveal (novi segment, šokantan stat):
```
Frame X-40: riser starts (build-up)
Frame X-8:  whoosh (scene transition)
Frame X:    hit (element appears)
```

---

## NE RADI OVO

- ❌ Zvuk BEZ vizualne promene — ako se ništa ne dešava na ekranu, NEMA zvuka
- ❌ Hit na svaku reč — samo na vizualne pojave
- ❌ Isti zvuk 3+ puta zaredom
- ❌ Click na svaki element u staggered animaciji
- ❌ Zvuk tokom mirnog objašnjenja bez vizualne promene

---

## SOUNDS JSON FORMAT

Sound Coordinator piše ovo za svaki segment (`sounds_segment_X.json`):
```json
{
  "segment": "The Withdrawal",
  "segmentIndex": 1,
  "startFrame": 0,
  "frameMode": "global",
  "sounds": [
    {"frame": 50, "type": "whoosh", "file": "whooshes/medium-whoosh.mp3", "volume": 0.15, "reason": "scene 1 starts, IDE appears"},
    {"frame": 185, "type": "hit", "file": "hits/bass-hit.mp3", "volume": 0.20, "reason": "SCREAMING text appears big"},
    {"frame": 670, "type": "riser", "file": "risers/tension-riser.mp3", "volume": 0.12, "reason": "build-up before dopamine reveal"},
    {"frame": 708, "type": "hit", "file": "hits/punch-hit.mp3", "volume": 0.20, "reason": "DOPAMINE WITHDRAWAL text appears"}
  ]
}
```

**OBAVEZNA polja:**
- `segmentIndex` — redni broj segmenta (1, 2, 3...)
- `startFrame` — globalni frame gde segment počinje (premix koristi za offset)
- `frameMode` — UVEK `"global"` (frame-ovi su apsolutni od početka videa)
- `reason` MORA da kaže šta se VIZUELNO dešava — ne šta narrator kaže

---

## IMPLEMENTACIJA

Posle svih sub-agenata, zvukovi se premixuju PO SEGMENTU u `segment_X_sfx.mp3`.
Root.tsx ima po 1 Audio element za svaki segment (koliko segmenata, toliko Audio elemenata).
Ovo sprečava Remotion Studio crash.

```tsx
<Sequence from={0} durationInFrames={1028}>
  <Audio src={staticFile("sfx/segment_1_sfx.mp3")} volume={1} />
</Sequence>
<Sequence from={1029} durationInFrames={2187}>
  <Audio src={staticFile("sfx/segment_2_sfx.mp3")} volume={1} />
</Sequence>
```
