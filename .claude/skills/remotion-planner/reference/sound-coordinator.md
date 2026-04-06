# Sound Coordinator — Jedan mozak za SVE zvukove

**Ovo je KRITIČAN korak.** Posle svih visual-generator sub-agenata, TI (planner) postaneš Sound Coordinator.

**Pročitaj:** `remotion-motion/reference/sound.md` — SVA pravila za zvukove

**Input:** SVE `sound_hints_*.json` fajlove iz `workspace/{project-name}/`

**Šta radiš:**
1. Pročitaj SVE sound_hints_*.json — to su vizuelni eventi po segmentu
2. Pročitaj `remotion-motion/reference/sound.md` za pravila (tipovi, volume, density, timing)
3. Za SVAKI event odluči:
   - Koji zvuk? (whoosh, hit, riser, click — iz sound.md)
   - Koji fajl? (whooshes/soft-whoosh.mp3, hits/bass-hit.mp3 — iz sound.md)
   - Koji volume? (0.06-0.22 po tipu — iz sound.md)
4. Primeni pravila CELE KOMPOZICIJE:
   - **Svaka vizuelna promena = zvuk.** NEMA limita na broj — koliko promena, toliko zvukova
   - Različiti tipovi zvukova MOGU da budu na istom frame-u (whoosh + click = OK, dva whoosh-a = NE)
   - **Varijacija:** Ne koristi isti zvuk 3x zaredom (variraj soft/medium/fast whoosh)
   - **Boundary transitions:** Svaki prelaz između segmenata ima whoosh
   - **Big reveals:** riser 30-40 frames PRE → hit NA reveal frame
   - **Staggered grupe:** Samo JEDAN click na prvu pojavu, ne na svaki element
   - **Čitaj i 🔊 komentare iz .tsx** fajlova kao backup — grep za `// 🔊 SOUND:` u Generated_*.tsx
5. Piši FINALNE `sounds_segment_X.json` za premix

**Output format — sounds_segment_X.json:**
```json
{
  "segment": "How Docker Works",
  "segmentIndex": 2,
  "frameMode": "global",
  "sounds": [
    { "frame": 142, "type": "whoosh", "file": "whooshes/medium-whoosh.mp3", "volume": 0.15, "reason": "segment transition — new scene starts" },
    { "frame": 200, "type": "click", "file": "clicks/soft-click.mp3", "volume": 0.08, "reason": "Docker logo slides in" },
    { "frame": 460, "type": "riser", "file": "risers/tension-riser.mp3", "volume": 0.12, "reason": "build-up before 60% stat reveal" },
    { "frame": 500, "type": "hit", "file": "hits/bass-hit.mp3", "volume": 0.20, "reason": "60% stat scales up — key info reveal" },
    { "frame": 692, "type": "whoosh", "file": "whooshes/digital-whoosh.mp3", "volume": 0.15, "reason": "scene crossfade to comparison" }
  ]
}
```

**Sačuvaj u:** `workspace/{project-name}/sounds_segment_X.json` (jedan po segmentu)

**PRAVILA:**
- `frame` je UVEK GLOBALNI (apsolutni od početka videa)
- `frameMode` je UVEK `"global"` — premix_segments.py koristi ovo
- Whoosh timing: **8 frames PRE** vizualne promene
- Hit timing: **frame-perfect NA** pojavu elementa
- Riser timing: **30-45 frames PRE** reveal-a
- Volume hijerarhija: hit (0.18-0.22) > whoosh (0.12-0.18) > riser (0.10-0.15) > click (0.06-0.10)
- `reason` MORA opisati vizuelnu promenu, NE šta narator kaže

**Self-check pre nastavka:**
- [ ] Svaki segment ima sounds_segment_X.json
- [ ] Svaka vizuelna promena ima zvuk (proveri 🔊 komentare u .tsx)
- [ ] Nema istog zvuka 3x zaredom
- [ ] Svaki segment boundary ima whoosh
- [ ] Svi reveal-i imaju riser→hit combo
- [ ] Nema dva ista tipa zvuka na istom frame-u
- [ ] `frameMode: "global"` u svakom JSON-u

**Posle ovog koraka pokreni premix:**
```bash
cd /Users/dario61/Desktop/YT\ automation && python3 tools/sound-design/premix_segments.py workspace/{project-name} videos/{project-name}
```
