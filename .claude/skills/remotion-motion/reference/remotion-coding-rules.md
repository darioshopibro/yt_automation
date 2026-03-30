# Remotion Coding Rules

Pravila za pisanje Remotion koda u nasem YT pipeline-u (1920x1080 horizontal, 30fps).
Vaze kad pravis novi vizual, menjas template, pravis custom komponentu.

> Izvor: Official Remotion best practices adaptirano za nas pipeline.
> Nas format: **1920x1080 @ 30fps** — YouTube horizontal. Template: DynamicPipeline.tsx.

---

## ANIMACIJE

### UVEK useCurrentFrame(), NIKAD CSS
```tsx
// ✅ ISPRAVNO — Remotion kontrolise svaki frame, radi u renderovanju i preview-u
const frame = useCurrentFrame();
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// ❌ ZABRANJENO — ne radi u renderovanju, ne prati timeline
<div style={{ transition: "opacity 0.3s" }} />
<div className="animate-fadeIn" />
```
**Zasto:** Remotion renderuje frame-by-frame. CSS animacije rade u realnom vremenu i nisu deterministicke — isti frame moze izgledati drugacije svaki put.

### UVEK clamp na interpolate()
```tsx
// ✅ Sa clamp — opacity ostaje 0-1
interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

// ❌ Bez clamp — na frame 60 opacity je 2.0, na frame -30 je -1.0
interpolate(frame, [0, 30], [0, 1]);
```

### Spring za poziciju/scale, Interpolate za opacity/boju
```tsx
// Spring: ima momentum, overshoot, fizicki osecaj → POZICIJA, SCALE, ROTACIJA
const scale = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

// Interpolate: linearna/easing promena → OPACITY, BOJA, PROGRESS BAROVI
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});
```

### measureSpring() za racunanje trajanja
```tsx
import { measureSpring } from "remotion";

const duration = measureSpring({
  fps: 30,
  config: { damping: 20, stiffness: 200, mass: 0.8 },
});
// Vraca broj frameova koji spring traje — koristi za durationInFrames
```

### Easing krive — kad koristiti koju
```tsx
import { Easing } from "remotion";

// ENTRANCE (brz dolazak, polako staje)
easing: Easing.out(Easing.cubic)     // Standard smooth
easing: Easing.out(Easing.exp)       // Dramaticniji
easing: Easing.out(Easing.back(1.2)) // Sa overshoot-om (bounce)

// EXIT (polako krene, brzo ode)
easing: Easing.in(Easing.quad)
easing: Easing.in(Easing.exp)

// MOVEMENT (oba kraja smooth)
easing: Easing.inOut(Easing.exp)     // Za camera pan
easing: Easing.bezier(0.34, 1.56, 0.64, 1) // Custom sa bounce
```

---

## SLIKE

### UVEK `<Img>` iz Remotion-a
```tsx
import { Img, staticFile } from "remotion";

// ✅ Remotion CEKA da se slika ucita pre renderovanja framea
<Img src={staticFile("images/logo.png")} style={{ width: 200 }} />

// ❌ HTML img — moze da renderuje frame pre ucitavanja (prazan/broken)
<img src="images/logo.png" />

// ❌ CSS background — isto ne ceka
<div style={{ backgroundImage: "url(logo.png)" }} />
```

### staticFile() za sve iz public/
```tsx
staticFile("images/docker.png")          // public/images/docker.png
staticFile(`frames/frame${frame}.png`)   // Dynamic path
staticFile("lottie/check.json")          // Lottie JSON
staticFile("sounds/whoosh.mp3")          // Audio
```
Remote URL-ovi rade direktno bez staticFile().

### Dimenzije slike
```tsx
import { getImageDimensions } from "@remotion/media-utils";

const { width, height } = await getImageDimensions(staticFile("photo.jpg"));
```

---

## FONTOVI

### Google Fonts — sa weight filtering
```tsx
import { loadFont } from "@remotion/google-fonts/Inter";

// ✅ Samo weights koje koristimo — manji download
const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
```

### Lokalni fontovi
```tsx
import { loadFont, waitUntilDone } from "@remotion/fonts";

loadFont({
  family: "SF Mono",
  url: staticFile("fonts/SFMono-Regular.woff2"),
  weight: "400",
});
```

### waitUntilDone() — sprecava renderovanje sa fallback fontom
```tsx
// Bez ovoga, prvi frame MOZE renderovati sa default fontom
await waitUntilDone();
```

---

## SEQUENCING

### Frame unutar Sequence je LOKALAN
```tsx
<Sequence from={60} durationInFrames={90}>
  {/* useCurrentFrame() ovde vraca 0-89, NE 60-149! */}
  <MyComponent />
</Sequence>
```

### premountFor = preload pre prikaza
```tsx
// Mountuje komponentu 30f ranije (za fetch/load), prikazuje tek od frame 90
<Sequence from={90} premountFor={30}>
  <LottieIcon />
</Sequence>
```
**Kad koristiti:** Lottie animacije, slike koje se loaduju, fontovi.

### layout="none" = bez AbsoluteFill wrappera
```tsx
// Default: Sequence wrappuje child u AbsoluteFill
// layout="none" zadrzava child u flex flow-u parenta
<Sequence from={30} layout="none">
  <NodeItem />
</Sequence>
```

### Series = sekvencijalni playback
```tsx
import { Series } from "remotion";

<Series>
  <Series.Sequence durationInFrames={60}><Scene1 /></Series.Sequence>
  <Series.Sequence durationInFrames={90}><Scene2 /></Series.Sequence>
</Series>

// Sa overlap-om (negativni offset)
<Series.Sequence durationInFrames={90} offset={-15}>
  <Scene2 />  {/* Pocinje 15f pre kraja Scene1 */}
</Series.Sequence>
```

### Trimming = odsecanje pocetka/kraja
```tsx
// Odseci prvih 10f (skip wind-up faze spring-a)
<Sequence from={-10}><BouncyEntrance /></Sequence>

// Odseci kraj (samo prvih 40f)
<Sequence durationInFrames={40}><LongAnimation /></Sequence>
```

---

## TEXT MERENJE

### fitText() — auto font size za container
```tsx
import { fitText } from "@remotion/layout-utils";

const { fontSize } = fitText({
  text: "Long Label Here",
  withinWidth: 200,           // Container sirina
  fontFamily: "Inter",
  fontWeight: "600",
});
// fontSize = optimalna velicina koja stane u 200px

<div style={{ fontSize, fontFamily: "Inter", fontWeight: 600 }}>
  Long Label Here
</div>
```

### measureText() — izracunaj dimenzije teksta
```tsx
import { measureText } from "@remotion/layout-utils";

const { width, height } = measureText({
  text: "Hello World",
  fontFamily: "Inter",
  fontSize: 24,
  fontWeight: "600",
});
// width = tacna sirina teksta u pikselima
```

### fillTextBox() — provera overflow-a
```tsx
import { fillTextBox } from "@remotion/layout-utils";

const box = fillTextBox({ maxLines: 3, maxBoxWidth: 300 });
const result = box.add({ text: "Some text", fontFamily: "Inter", fontSize: 16 });
if (result.exceedsBox) {
  // Tekst ne staje u box — smanji font ili skrati tekst
}
```

---

## COMPOSITIONS

### type umesto interface za props
```tsx
// ✅ ISPRAVNO — Remotion zahteva type za JSON serialization
type VideoProps = { title: string; color: string; };

// ❌ NE RADI — interface nije kompatibilan sa Remotion schema
interface VideoProps { title: string; color: string; }
```

### Still = single frame (thumbnails!)
```tsx
import { Still } from "remotion";

<Still
  id="thumbnail"
  component={ThumbnailComponent}
  width={1280}
  height={720}
  defaultProps={{ title: "How Docker Works" }}
/>
// Renderuj: npx remotion still thumbnail --output=thumb.png
```

### calculateMetadata = dynamic sizing
```tsx
export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props, abortSignal }) => {
  const duration = await getAudioDuration(staticFile("voiceover.mp3"));
  return {
    durationInFrames: Math.ceil(duration * 30) + 30,
    fps: 30,
    width: 1920,
    height: 1080,
  };
};
```

### Zod schema = visual editing u Studio sidebar
```tsx
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

const schema = z.object({
  title: z.string(),
  accentColor: zColor(),        // Color picker!
  showSubtitles: z.boolean(),
});
// Props se menjaju DIREKTNO u Remotion Studio
```

---

## DOM MERENJE

### useCurrentScale() za tacne dimenzije
```tsx
import { useCurrentScale } from "remotion";

const scale = useCurrentScale();
const rect = ref.current.getBoundingClientRect();
const realWidth = rect.width / scale;   // Kompenzacija za Remotion preview scaling
```

---

## LOTTIE

### delayRender/continueRender pattern
```tsx
import { Lottie } from "@remotion/lottie";

const [handle] = useState(() => delayRender("Loading Lottie"));
const [data, setData] = useState(null);

useEffect(() => {
  fetch(staticFile("lottie/check.json"))
    .then((r) => r.json())
    .then((d) => { setData(d); continueRender(handle); })
    .catch((e) => cancelRender(e));
}, [handle]);

if (!data) return null;
return <Lottie animationData={data} style={{ width: 120, height: 120 }} />;
```
**BITNO:** Bez delayRender, Remotion renderuje frame pre ucitavanja JSON-a = prazan frame.

---

## AUDIO

### Volume kao callback (fade-in/out)
```tsx
<Audio
  src={staticFile("voiceover.mp3")}
  volume={(f) => {
    if (f < 30) return f / 30;            // Fade in 1s
    if (f < totalFrames - 30) return 1;   // Puna glasnoca
    return Math.max(0, 1 - (f - (totalFrames - 30)) / 30); // Fade out
  }}
/>
```

### playbackRate za brzinu
```tsx
<Audio src={staticFile("bg-music.mp3")} playbackRate={0.8} /> // Sporije
<Video src={staticFile("demo.mp4")} playbackRate={1.5} />     // Brze
```

---

## VIDEO / GIF

> **ZA NAS PIPELINE:** Video/GIF embedi idu UNUTAR vizuala (sekcija u sticky-ju).
> Na 1920x1080 ekranu, vizual zauzima ~400-800px sirine zavisno od shape mode-a.
> Uvek stavi objectFit: "cover" i ogranici dimenzije da stane u sekciju.

### Video embed
```tsx
import { Video } from "@remotion/media";

<Video
  src={staticFile("clips/demo.mp4")}
  trimBefore={90}           // Preskoci 3s (u FRAMEOVIMA, ne sekundama!)
  trimAfter={30 * 15}       // Zaustavi na 15s
  volume={(f) => ...}       // Dynamic volume
  playbackRate={1.5}        // Brzina
  loop                      // Ponavljaj
  style={{ width: 800, objectFit: "cover", borderRadius: 12 }}
/>
```

### GIF embed
```tsx
import { AnimatedImage } from "@remotion/animated-image";

<AnimatedImage
  src={staticFile("gifs/loading.gif")}
  playbackRate={1}
  loopBehavior="loop"       // "loop" | "pause-after-finish" | "clear-after-finish"
  style={{ width: 200 }}
/>
```

---

## AUDIO VIZUALIZACIJA

### Spectrum (beat-reactive)
```tsx
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";

const audioData = useWindowedAudioData({ src: staticFile("vo.mp3"), frame, fps, numberOfSamples: 256 });
const viz = visualizeAudio({ fps, frame, audioData, numberOfSamples: 64 });
// viz = niz 0-1 vrednosti, viz[0] = bass

const glowIntensity = viz[0] * 60;  // Beat-reactive glow
```
**BITNO:** Pass `frame` iz parenta, NE pozivaj useCurrentFrame() u child koji je u Sequence.

---

## SFX BIBLIOTEKA

### @remotion/sfx — pre-hosted zvukovi
```tsx
import { Audio } from "remotion";

// Dostupni na remotion.media:
<Audio src="https://remotion.media/sfx/whoosh.mp3" volume={0.25} />
<Audio src="https://remotion.media/sfx/page-turn.mp3" volume={0.15} />
<Audio src="https://remotion.media/sfx/switch.mp3" volume={0.2} />
<Audio src="https://remotion.media/sfx/ding.mp3" volume={0.15} />
<Audio src="https://remotion.media/sfx/mouse-click.mp3" volume={0.2} />
<Audio src="https://remotion.media/sfx/shutter-modern.mp3" volume={0.15} />

// Kompletan spisak: whoosh, whip, page-turn, switch, mouse-click,
// shutter-modern, shutter-old, ding, bruh, vine-boom, windows-xp-error
```

---

## TRANSITIONS (SCENE-LEVEL)

### TransitionSeries
```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={120}><Scene1 /></TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 30 })}
  />
  <TransitionSeries.Sequence durationInFrames={150}><Scene2 /></TransitionSeries.Sequence>
</TransitionSeries>
// BITNO: Tranzicija prekriva scene → total = 120 + 150 - 30 = 240f
```

### Tipovi tranzicija
```
fade()                          — crossfade (najsigurniji)
slide({ direction: "from-right" }) — klizanje (from-left/right/top/bottom)
wipe({ direction: "from-left" })  — brisanje
flip({ direction: "from-left" })  — 3D flip
clockWipe()                      — sat-brisanje
```

### Overlay (ne skracuje timeline)
```tsx
<TransitionSeries.Overlay>
  <LightLeak durationInFrames={60} seed={3} hueShift={120} />
</TransitionSeries.Overlay>
```

---

## LIGHT LEAKS

```tsx
import { LightLeak } from "@remotion/light-leaks";

<LightLeak
  durationInFrames={90}  // Trajanje
  seed={3}                // Random pattern
  hueShift={0}            // 0=yellow, 120=cyan, 180=blue, 300=pink
/>
// Prva polovina: reveal. Druga polovina: retract.
```

---

## CHARTS — @remotion/paths

### SVG path animacija (line chart, drawing efekti)
```tsx
import { evolvePath, getLength, getPointAtLength } from "@remotion/paths";

const path = "M 0 100 C 50 0 100 200 200 100";  // SVG path

// Animiraj crtanje linije
const evolved = evolvePath(progress, path);  // progress 0-1
<path d={evolved} stroke="#3b82f6" fill="none" strokeWidth={2} />

// Dot koji prati liniju
const length = getLength(path);
const point = getPointAtLength(path, length * progress);
<circle cx={point.x} cy={point.y} r={4} fill="#3b82f6" />
```

---

## CAPTIONS — @remotion/captions

> **NAPOMENA:** Funkcija se zove "TikTok-style" ali to je samo ime iz Remotion paketa.
> Radi na BILO KOJOJ dimenziji. Mi koristimo za nas 1920x1080 YT transcript overlay.
> Razlika od TikTok-a: veci font, vise reci po grupi, pozicija na dnu ekrana (ne centar).

### Word grouping (grupise reci u stranice)
```tsx
import { createTikTokStyleCaptions } from "@remotion/captions";

const { pages } = createTikTokStyleCaptions({
  captions,                           // Caption[] niz
  combineTokensWithinMilliseconds: 800, // Koliko ms reci po grupi
});

// Svaka page ima startMs, tokens[] sa fromMs/toMs per word
{pages.map((page, i) => (
  <Sequence key={i} from={msToFrame(page.startMs)} durationInFrames={...}>
    <CaptionPage page={page} />
  </Sequence>
))}
```

### Word highlighting
```tsx
{page.tokens.map((token) => {
  const isActive = currentTimeMs >= token.fromMs && currentTimeMs < token.toMs;
  return (
    <span style={{
      color: isActive ? "#fff" : "#666",
      fontWeight: isActive ? 800 : 400,
    }}>
      {token.text}
    </span>
  );
})}
```

---

## CODE HIKE — Token-level kod animacije

Code Hike je NAPREDNIJI nacin za prikazivanje koda od naseg CodeBlockVisual typing efekta.
Umesto da se kod "kuca" karakter po karakter, tokeni FIZICKI klize na novu poziciju,
boje se morph-uju, novi tokeni fade-in, obrisani fade-out.

### Kad koristiti Code Hike vs nas CodeBlockVisual

```
CODE HIKE (token morphing):
  ✅ Kod se MENJA kroz korake (step 1 → step 2 → step 3)
  ✅ Code walkthrough — "dodamo ovu liniju, promenimo ovu"
  ✅ Refactoring prikaz — before → after sa smooth morphom
  ✅ TypeScript type inference prikaz (realan TS compiler)
  ✅ Error vizualizacija (wavy underline + error poruka)
  → Bolji kad prikazujes EVOLUCIJU koda

NAS CodeBlockVisual (typing):
  ✅ Kod se PRIKAZUJE jednom — snippet koji ilustruje temu
  ✅ "Evo kako izgleda Docker command" — jedno stanje, nema promena
  ✅ Jednostavniji — ne zahteva vise koraka koda
  → Bolji kad prikazujes SNAPSHOT koda
```

### Setup
```bash
npm install codehike @code-hike/lighter
# Opciono za TypeScript type inference:
npm install twoslash-cdn
```

### Kako radi (3 faze)

**Faza 1: Priprema (build time)**
```tsx
import { highlight } from "codehike";

// Highlightuj svaki korak koda
const step1 = await highlight({ value: codeString1, lang: "tsx", meta: "" });
const step2 = await highlight({ value: codeString2, lang: "tsx", meta: "" });
// Rezultat: tokenizovani AST sa bojama po tokenu
```

**Faza 2: Renderovanje**
```tsx
import { Pre, HighlightedCode } from "codehike/code";

// Code Hike renderuje <pre> sa svim tokenima
<Pre code={highlightedCode} handlers={[tokenTransitions, callout, errorInline]} />
```

**Faza 3: Animacija (per frame)**
```tsx
// CodeTransition komponenta:
// 1. Renderuje stari kod, napravi DOM snapshot (pozicija svakog tokena)
// 2. Zameni sa novim kodom, napravi novi snapshot
// 3. Diff: za svaki token racuna translateX/Y, color morph, opacity
// 4. Per frame: interpolate() animira svaki token ka novoj poziciji

// Token koji se POMERI: translateX/Y animacija (klizi)
// Token koji PROMENI boju: interpolateColors morph
// Token koji se DODA: opacity 0→1 (fade in)
// Token koji se OBRISE: opacity 1→0 (fade out)
```

### VS Code teme (22 dostupne)
Code Hike podrzava sve VS Code teme: One Dark Pro, GitHub Dark, Dracula, Tokyo Night, itd.
Za nas pipeline: koristiti tamnu temu koja se uklapa sa nasim #0f0f1a dizajnom.

### Za nas pipeline:
- Kad Visual Router detektuje "kod se menja kroz korake" → Code Hike umesto CodeBlockVisual
- Kad transcript kaze "let's add...", "now change...", "refactor this..." → Code Hike
- Kad transcript prikazuje jedan snippet bez promena → CodeBlockVisual (jednostavniji)
- Code Hike zahteva `calculateMetadata` za async highlight + DOM merenje

---

## BACKGROUND MUZIKA — Music component

Nas pipeline trenutno nema background muziku. Evo kako se pravilno dodaje.

### Osnovno sa fade in/out
```tsx
import { Audio, interpolate, useCurrentFrame, useVideoConfig, staticFile } from "remotion";

const Music: React.FC<{
  src: string;
  volume?: number;      // Max volume (default 0.15 — TIHO, voiceover je prioritet)
  fadeInFrames?: number; // Koliko frameova fade-in (default 60 = 2s)
  fadeOutFrames?: number;// Koliko frameova fade-out (default 90 = 3s)
}> = ({ src, volume = 0.15, fadeInFrames = 60, fadeOutFrames = 90 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const currentVolume = interpolate(
    frame,
    [0, fadeInFrames, durationInFrames - fadeOutFrames, durationInFrames],
    [0, volume, volume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <Audio src={staticFile(src)} volume={currentVolume} loop />;
};

// Koriscenje:
<Music src="music/ambient-tech.mp3" volume={0.12} />
```

### Pravila za background muziku u nasem pipeline-u
```
HIJERARHIJA ZVUKOVA (azurirano):
1. VOICEOVER      ████████████████████  (1.0)   — Nikad ne prekrivati
2. CAMERA MOVE    ████████              (0.25)  — Glavni SFX
3. SECTION REVEAL ██████                (0.12)  — Sekundarni SFX
4. BACKGROUND MUSIC ████               (0.10-0.15) — Uvek ispod svega
```

- Volume NIKAD preko 0.15 — voiceover mora da se cuje jasno
- UVEK loop — muzika traje ceo video
- Fade in 2s na pocetku, fade out 3s na kraju
- Muziku generisati sa ElevenLabs Music ili ACE-Step
- Staviti u `public/music/` folder

---

## PRELOAD — Smoother Studio preview

`@remotion/preload` preloaduje assets UNAPRED za glatkiji playback u Studio-u.
Ne utice na renderovanje (to je vec OK) — ali Studio preview moze da steka bez ovoga.

### Setup
```bash
npm install @remotion/preload
```

### Koriscenje
```tsx
import { preloadVideo, preloadAudio, preloadImage } from "@remotion/preload";

// Na pocetku komponente (ili u useEffect):
preloadAudio(staticFile("voiceover.mp3"));
preloadAudio(staticFile("music/ambient.mp3"));
preloadImage(staticFile("images/logo.png"));
preloadVideo(staticFile("clips/demo.mp4"));

// Ovo NE blokira renderovanje — samo hints browseru da pocne download ranije
// Za BLOKIRAJUCI preload (cekaj dok se ucita), koristi delayRender/continueRender
```

### Kad koristiti
```
preload:        Studio preview smoother (non-blocking hint)
delayRender:    Renderovanje MORA da ceka (blocking — za Lottie JSON, fontove)
staticFile:     Samo referencira path (ne preloaduje nista)
```

### Za nas pipeline:
- Dodati u DynamicPipeline.tsx na vrhu: preload voiceover + sounds
- Dodati u vizuale koji koriste slike/video: preload pre renderovanja
- NE koristi za Lottie — za to treba delayRender (blocking)

---

## ANTI-PATTERNI (nikad ne radi ovo)

| ❌ Ne radi | ✅ Radi umesto | Zasto |
|-----------|--------------|-------|
| CSS transitions/animate | useCurrentFrame() + interpolate/spring | CSS ne prati timeline |
| HTML `<img>` | Remotion `<Img>` | Img ceka loading pre renderovanja |
| CSS background-image | `<Img>` ili staticFile | Isto ne ceka |
| `useFrame()` (r3f) | `useCurrentFrame()` | r3f useFrame ne prati Remotion |
| interpolate bez clamp | Dodaj extrapolateLeft/Right: "clamp" | Moze dati vrednosti van range-a |
| interface za props | type za props | Interface ne radi sa Zod/Remotion schema |
| Tailwind animate-*/transition-* | useCurrentFrame() | Izvan Remotion kontrole |
| useCurrentFrame() u child Sequence-a za audio viz | Pass frame kao prop iz parenta | Child dobija lokalni frame, ne globalni |
