# Element Transitions Guide — Remotion Short Form

> Naučeno kroz iteraciju na GregV2.tsx (5+ verzija, 2 dana)
> Reference implementacija: `workspace/short-poc/src/GregV2.tsx`

---

## Fundamentalno pravilo

**Dva elementa na ekranu NIKAD ne smeju biti nepovezani.**

Svaka tranzicija između elementa A i elementa B mora odgovoriti na pitanje: "Kako je A POSTAO B?" Ako gledalac ne može da prati transformaciju — izgubio si ga.

---

## Šta NE radi (testirano i odbačeno)

### 1. SVG dashed linije
- `strokeDasharray` + `strokeDashoffset`
- Izgledaju kao dijagram, ne kao animacija
- Nema dubine, nema energije, "CSS homework" look

### 2. Canvas2D glow linije
- Bolje od SVG (imaju glow, traveling dot), ali i dalje LINIJE
- Linije vizuelno RAZDVAJAJU elemente umesto da ih povezuju
- **Zaključak: linije nikad**

### 3. Pill koji leti
- Element A se smanji → isti oblik leti do pozicije B → pop-uje se element B
- Izgleda kao dugme koje leti — mehanički, neprirodno
- **Zaključak: putujući element ne sme biti isti oblik kao source/target**

### 4. Fade out + fade in
- A nestaje, B se pojavi
- NIKAD. Uvek se vidi "gap" — mozak detektuje cut
- **Zaključak: kontinuitet je obavezan**

### 5. Slime/ljigavac konekcija
- SVG shape koji se isteže od A do B
- Vizuelno zanimljivo ali previše statično
- Nema osećaj ENERGIJE/POKRETA
- **Zaključak: konekcija mora imati POKRET, ne samo shape**

---

## Šta RADI (dokazano)

### Blob + Particle Trail (trenutna implementacija)

**Zašto radi:**
1. Blob je ORGANSKI — wobbly SVG sa 7 oscillating control points. Nije krug, nije kvadrat — živo je
2. Putuje po KRIVOJ (quadratic bezier) — pravolinijski pokret je dosadan
3. Ostavlja TRAG — particles koje otpadaju daju osećaj inercije i smera
4. Blob SE PRETVORI u element — nema gap, nema pop-in

**Komponente recepta:**
```
1. Source element završava
2. Blob se rađa na DONJEM DELU source elementa
3. Blob putuje po krivoj ka CENTRU target elementa
4. Za sobom ostavlja particle trail (tačkice koje blede)
5. Kad blob stigne (progress > 0.88):
   - Blob scale → 0 (nestaje)
   - Element scale → 1 (raste)
   - IZ ISTOG CENTRA — jedno telo
6. Element morfuje iz malog kruga u finalni oblik
```

### Gooey Merge (collision/spajanje)

**Zašto radi:**
- SVG filter: `feGaussianBlur(8)` + `feColorMatrix(alpha: 18, offset: -7)`
- Kad se 2+ elementa približe, TOPE SE jedan u drugi
- Izgleda kao tečnost, ne kao overlap div-ova
- Bukvalno 3 linije SVG koda = 90% vizuelnog poboljšanja

**Kad koristiti:** Kad se više elemenata spaja u jedan (pills → merged pill)

### Film Grain

**Zašto radi:**
- `feTurbulence type="fractalNoise" seed={frame}`
- Menja se svaki frame (Remotion frame-by-frame rendering)
- `opacity: 0.04-0.06` — jedva svesno, ali podsvesno uklanja "digital" look
- Instant cinematic quality

### Neon Glow

**Zašto radi na dark bg:**
- Stacked shadows sa `feGaussianBlur`
- Mint (#80C2A0) na dark green (#1E3A2F) = prirodan contrast
- Glow peak mid-travel, fade na krajevima

---

## Pravila za tranzicije (izvučena iz iteracija)

### 1. KONTINUITET
- Element A mora fizički POSTATI element B
- Nema "nestaje pa se pojavi" — uvek transformacija
- Ako koristiš posredni oblik (blob), on mora da bude na ISTOM MESTU gde element raste

### 2. CENTAR
- Putujući oblik mora da STIGNE u centar target elementa
- Target element raste IZ TOG CENTRA outward
- `translate(-50%, -50%)` + ista x,y koordinata = jedno telo

### 3. ZERO DELAY
- Kad putujući oblik stigne — element ODMAH raste
- Čak ni 1 frame gap nije OK — mozak vidi "cut"
- Implementacija: element morph vezan za blob progress, ne za zaseban timer
```js
// DOBRO: element raste kad blob stigne
if (blobProgress < 0.88) return 0;
const morphP = interpolate(blobProgress, [0.88, 1], [0, 0.15]);

// LOŠE: element ima svoj timer sa delay-om
const f = frame - blobEndFrame - 5; // 5 frame gap = vidljiv cut
```

### 4. DONJI DEO → CENTAR
- Putujući oblik kreće od DONJEG DELA source elementa (ne centra)
- Stiže u CENTAR target elementa
- Ovo daje osećaj "izlazi iz A, ulazi u B"

### 5. KRIVA > PRAVA LINIJA
- Quadratic bezier sa horizontal offset (±55-70px)
- Alternira: prvi ide desno, drugi levo, treći desno
- Daje dinamiku i izbegava monotoniju

### 6. TRAIL = INERCIJA
- Putujući oblik ostavlja trag (particles, glow, ili blur)
- Trail je dokaz POKRETA — bez njega izgleda kao teleportacija
- Particles: veće/tamnije blizu, manje/svetlije dalje (starije)

### 7. ORGANSKI > GEOMETRIJSKI
- Wobbly SVG > savršen krug
- Spring physics > linear timing
- Različiti spring presets za različite faze

### 8. SOURCE SE BRIŠE
- Kad putujući oblik krene, source element NESTAJE
- Nikad ne smeju oba biti vidljiva u isto vreme (duplikat = amaterski)

---

## SVG efekti koji rade u Remotion

### Gooey Filter (metaball)
```jsx
<filter id="goo">
  <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
  <feColorMatrix in="blur" mode="matrix"
    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
</filter>
// Primeni na container: style={{ filter: "url(#goo)" }}
```
- `stdDeviation` kontroliše koliko se "tope" (8-12 za pills)
- `18 -7` u matrici kontroliše threshold (veći = oštrije ivice)

### Film Grain
```jsx
<filter id="grain">
  <feTurbulence type="fractalNoise" baseFrequency="0.65"
    numOctaves="3" seed={frame} stitchTiles="stitch" />
</filter>
<rect width="100%" height="100%" filter="url(#grain)" opacity={0.045} />
```
- `seed={frame}` = animated grain bez CSS keyframes
- `opacity: 0.04-0.06` za suptilno, `0.1+` za heavy vintage

### Neon Glow (SVG)
```jsx
<filter id="glow">
  <feGaussianBlur stdDeviation="6" result="blur" />
  <feMerge>
    <feMergeNode in="blur" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

### Organic Distortion (feTurbulence + feDisplacementMap)
```jsx
<filter id="distort">
  <feTurbulence type="fractalNoise"
    baseFrequency={0.01 + Math.sin(frame * 0.05) * 0.005}
    numOctaves="3" seed={Math.floor(frame / 3)} />
  <feDisplacementMap in="SourceGraphic" scale={15}
    xChannelSelector="R" yChannelSelector="G" />
</filter>
```

---

## Spring presets (testirano)

| Preset | mass | damping | stiffness | Kad koristiti |
|--------|:----:|:-------:|:---------:|---|
| entrance | 0.8 | 20 | 200 | Element pop-in |
| bounce | 1 | 12 | 180 | Gentle overshoot na skali |
| morph | 1.5 | 18 | 100 | Pill → card shape change |
| collision | 0.6 | 14 | 250 | Brz impact, snappy |
| blob | 1 | 16 | 80 | Blob travel (sporiji, teži) |
| slide | 1.2 | 22 | 80 | Konvergencija pozicija |
| camera | 2 | 30 | 60 | Smooth camera movement |

**Pravilo:** Collision = brz. Travel = srednje. Morph = spor i težak. Camera = najsporija.

---

## Wobbly blob SVG generacija

```typescript
function blobPath(frame, cx, cy, radius, wobbleAmt) {
  // 7 control points, svaki oscillira na unique frekvenciji
  // sin(frame * 0.14 + i * 1.8) + sin(frame * 0.09 + i * 3.1)
  // Catmull-Rom → cubic bezier konverzija (tension 0.35)
  // Rezultat: smooth organic shape koji se menja svaki frame
}
```

- 7 points je sweet spot (5 = previše okruglo, 9 = previše noisy)
- Wobble amount: 0.08 na krajevima, 0.28 mid-travel
- Rotation NIJE potrebna — wobble je dovoljan za organic feel

---

## Curve path (quadratic bezier)

```typescript
function curvePos(t, sx, sy, ex, ey, curveAmount) {
  const cx = (sx + ex) / 2 + curveAmount; // control point
  const cy = (sy + ey) / 2;
  // Standard quadratic bezier formula
}
```

- `curveAmount: ±55-70` za lepe krive
- Alternirati levo/desno za dinamiku
- Negativan = kriva levo, pozitivan = kriva desno

---

## Particle trail

```typescript
for (let i = 0; i < particleCount; i++) {
  const dropT = (i / particleCount) * progress; // kad je particle "ispala"
  const age = progress - dropT;                   // koliko je stara
  const pos = curvePos(dropT, ...);               // pozicija na krivoj

  // Starija = manja + prozračnija
  opacity: [0.6, 0.25, 0.03]  // po age
  radius:  [4.5, 2.5, 1.0]    // po age

  // Random offset da ne budu na savršenoj liniji
  offsetX: (seed - 0.5) * 14
  offsetY: (sin(seed * 100) - 0.5) * 10
}
```

- 12-16 particles je dovoljno
- Random seed per particle: `sin(i * 127.1 + 311.7) * 43758.5453`

---

## Efekti za istraživanje (još netestirani)

| Efekat | Potencijal | Ideja |
|--------|:---:|---|
| Glassmorphism | 8/10 | `backdrop-filter: blur(16px)` na card-ovima |
| Depth of field | 8/10 | Blur na elementima koji nisu "u fokusu" |
| clipPath reveal | 8/10 | Card se otkriva circular wipe iz blob centra |
| mix-blend-mode: screen | 7/10 | Additive light za glow efekte |
| Motion blur (ghost copies) | 7/10 | Stacked kopije blob-a sa offset-om |
| Organic distortion | 9/10 | feTurbulence na blob-u za pulsiranje |
| Pseudo-3D | 7/10 | perspective + rotateY na cards |

---

## Workflow za novu tranziciju

1. Definiši source i target element (pozicije, veličine)
2. Izaberi transport mehanizam (blob, morph, split, merge...)
3. Source se briše kad transport krene
4. Transport putuje od DONJEG DELA source-a ka CENTRU target-a
5. Transport ostavlja trail/trag za sobom
6. Kad transport stigne — target element raste IZ ISTOG CENTRA
7. ZERO DELAY — element progress vezan za transport progress
8. Dodaj efekte: gooey na merge, grain na scene, glow na transport
