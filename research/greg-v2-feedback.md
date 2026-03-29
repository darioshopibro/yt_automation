# GregV2 Feedback & Fix Lista

> Fajl: `workspace/short-poc/src/GregV2.tsx`
> Status: Prva verzija, treba dosta ispravki
> Reference: `research/motion-physics-guide.md` za pravila

---

## Šta radi OK:
- Struktura postoji (4 pill-a → merge → morph → card → prompt → context)
- Camera se kreće (scroll + zoom)
- Dotted lines se crtaju
- Greg paleta je tu (#1E3A2F, #80C2A0, #F0F0F0)

## Šta treba da se FIX-uje:

### 1. Spring Physics
- [ ] Previše "CSS-like" — treba da izgleda kao da elementi imaju TEŽINU
- [ ] Morph nema weight — kartica se otvara bez osećaja mase
- [ ] Pill convergence je previše mehanički
- [ ] Pogledaj `motion-physics-guide.md` sekcija "What is Weight in Animation"

### 2. Merge tranzicija (4 pills → 1)
- [ ] Trenutno: pills samo fade out i novi pop-uje — LOŠE
- [ ] Treba: pills se SUDARE, overlap-uju, kompresuju jedan u drugi
- [ ] Reference: Greg Video 1 [0:06-0:07] — "pills slide into center, morphing/merging"
- [ ] Ideja: pills dolaze blizu, overlap-uju se, scale se smanji na 0.5, pa se iz tog cluster-a rodi novi pill

### 3. Camera Movement
- [ ] Preagresivno — treba glatki, jedva primetni prelazi
- [ ] Zoom je prevelik (1.15x je previše) — probaj 1.05-1.08x max
- [ ] Treba duži ease na camera move-ovima
- [ ] Pogledaj `motion-physics-guide.md` sekcija "Greg Isenberg Style Camera"

### 4. Morph Pill → Card
- [ ] Anticipation postoji ali je neprimetna — treba da se VIDI malo skupljanje pre expand-a
- [ ] Width/height expand treba offset — width PRVI, height DRUGI (ne istovremeno)
- [ ] Border-radius tranzicija treba da prati spring, ne linear
- [ ] Content fade-in treba da bude POSLE shape-a, ne tokom
- [ ] Pogledaj `motion-physics-guide.md` sekcija "Element Transformation Rules"

### 5. Element Appearance (Pop)
- [ ] Svi elementi pop-uju isto — treba varijacija (neki drop, neki slide in, neki scale)
- [ ] Stagger timing je prekratak — probaj 12-15 frame-ova gap umesto 8
- [ ] Feature pills unutar kartice treba da imaju slight slide from left, ne samo scale
- [ ] Pogledaj `motion-physics-guide.md` sekcija "Stagger Timing"

### 6. Visual Quality
- [ ] Elementi izgledaju kao basic CSS divovi — treba depth
- [ ] Shadow treba da bude mekaniji, diffused-iji
- [ ] Pill-ovi nemaju inner highlight (Greg ima subtle white top border)
- [ ] Background grid je ok ali treba blede tačke
- [ ] Sunburst je previše jak — treba suptilniji

### 7. Dotted Lines
- [ ] Debljina OK, ali opacity je prevelik kad se pojave
- [ ] Treba da budu tanje i suptilnije
- [ ] Drawing speed je ok

### 8. Prompt Bar
- [ ] Typewriter OK ali treba cursor blink
- [ ] Bar je previše mali/tanak — treba veći sa više detalja
- [ ] Nedostaje hover/glow efekat

### 9. Timing
- [ ] Sve se dešava prebrzo — treba breathing room između sekcija
- [ ] Hold na svakoj sceni bar 1-2 sec pre nego što camera krene dalje
- [ ] Greg drži scene 4-6 sekundi — mi ih držimo 2-3

### 10. Nedostaje
- [ ] Kinetic typography (reči pop-uju uz voiceover)
- [ ] Skeleton lines unutar card-a pre nego što se popune feature pills
- [ ] Glow/ambient efekti u pozadini

---

## Kako da fix-uješ u sledećoj sesiji:

1. Otvori `workspace/short-poc/src/GregV2.tsx`
2. Reci Claude-u: "Pročitaj `research/greg-v2-feedback.md` i `research/motion-physics-guide.md` i fix-uj GregV2 po feedback-u"
3. Fix po prioritetu: Merge tranzicija → Morph quality → Camera → Timing → Visual polish
4. Posle svakog fix-a proveri u Remotion Studio na `localhost:3005/GregV2`

## Reference fajlovi:
- `research/motion-physics-guide.md` — pravila za fiziku i animacije
- `research/greg-analysis/master-patterns.md` — svi Greg pattern-i
- `research/greg-analysis/video-1.md` — detaljni breakdown scene koju repliciramo
