# Remotion Builder Skill

Implementira video prema `master-plan.json`. **NE koristi DynamicPipeline/canvas.** Svaki segment je fullscreen Generated_*.tsx komponenta, chain-ovani sa Sequence + voiceover.

**Input:** `master-plan.json` (iz planner-a) + Generated_*.tsx (iz visual-generator skill-a)
**Output:** Funkcionalan Remotion projekat

**⚠️ OUTPUT LOKACIJE:**
- **Finalni projekti** → `videos/{project-name}/`
- **NIKAD u root, NIKAD u skills folder, NIKAD u templates!**

---

## WORKFLOW

### KORAK 1: Napravi projekat

```bash
mkdir -p videos/{project-name}/src/visuals videos/{project-name}/public
cd videos/{project-name}
npm init -y
npm install remotion @remotion/cli @phosphor-icons/react react react-dom
```

### KORAK 2: Kopiraj assets

```bash
cp workspace/{project-name}/voiceover.mp3 videos/{project-name}/public/
cp workspace/{project-name}/master-plan.json videos/{project-name}/src/
```

### KORAK 3: Generiši vizuale sa visual-generator SKILL-om

Za SVAKI segment iz master-plan.json, pokreni `visual-generator` skill:

```
Stikni visual-generator skill.

Transcript: [transcriptSegment iz master-plan.json]
Timestamps: [timestamps niz iz master-plan.json za taj segment]
fps: 30
Sačuvaj u: videos/{project-name}/src/visuals/Generated_{SegmentName}.tsx
```

**POKRENI SKILL ZA SVAKI SEGMENT.** Ne piši .tsx sam. Ne improvizuj. Ne čitaj pravila i sam implementiraj. POKRENI SKILL.

```
❌ ZABRANJENO: Write Generated_Segment1.tsx (sam pišeš fajl)
❌ ZABRANJENO: Čitaš generation-rules.md i sam implementiraš
❌ ZABRANJENO: "Već znam pravila, napisaću sam"

✅ JEDINO ISPRAVNO: Stikni visual-generator skill → skill piše fajl
```

### KORAK 4: Generiši Root.tsx

Root.tsx renderuje sve segmente DIREKTNO (BEZ Sequence wrapper-a) + voiceover:

```tsx
import { Composition, AbsoluteFill, Audio, staticFile } from "remotion";
import Generated_Segment1 from "./visuals/Generated_Segment1";
import Generated_Segment2 from "./visuals/Generated_Segment2";
// ... svi segmenti

const FullVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0f0f1a" }}>
      <Audio src={staticFile("voiceover.mp3")} />
      <Generated_Segment1 />
      <Generated_Segment2 />
      {/* ... ostali segmenti */}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FullVideo"
      component={FullVideo}
      durationInFrames={totalFrames}  // iz master-plan.json
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
```

**KRITIČNO — NE koristi Sequence!**
- Komponente koriste `useCurrentFrame()` koji vraća GLOBALNI frame
- Timestamps su apsolutni (frame 975 = 32.5s od početka videa)
- Sequence bi resetovao frame na 0 i sve bi se pokvarilo

**KRITIČNO — SVAKI SEGMENT MORA IMATI OPACITY KONTROLU!**
Bez toga se svi segmenti vide istovremeno jedan preko drugog = haos.

```tsx
const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const segments = [
    { Component: Generated_Seg1, startFrame: 0, endFrame: 1050 },
    { Component: Generated_Seg2, startFrame: 1050, endFrame: 2100 },
    // ...
  ];
  return (
    <AbsoluteFill style={{ background: "#0f0f1a" }}>
      <Audio src={staticFile("voiceover.mp3")} />
      {segments.map(({ Component, startFrame, endFrame }, i) => {
        // Ne renderuj ako nije aktivan
        if (frame < startFrame - 1 || frame > endFrame + 1) return null;
        // Crossfade: fade in 15 frames, fade out 15 frames
        const fadeIn = i === 0 ? 1 : interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const fadeOut = i === segments.length - 1 ? 1 : interpolate(frame, [endFrame - 15, endFrame], [1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <div key={i} style={{
            position: "absolute", top: 0, left: 0, width: 1920, height: 1080,
            opacity: fadeIn * fadeOut,
          }}>
            <Component />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
```

**BEZ OVE LOGIKE VIDEO NE RADI** — segmenti se vide svi odjednom.

### KORAK 5: Generiši remotion.config.ts i index.ts

```ts
// remotion.config.ts
import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");

// src/index.ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
```

### KORAK 6: Pokreni

```bash
cd videos/{project-name} && npx remotion studio --port 3001
```

---

## NEMA CANVAS. NEMA DYNAMICPIPELINE.

```
❌ ZABRANJENO: DynamicPipeline.tsx, ExplainerLayout.tsx, sticky notes, canvas
❌ ZABRANJENO: dynamic-config.json, camera keyframes, sticky layouts
❌ ZABRANJENO: Kopirati template iz templates/ai-video-gen-pipeline

✅ ISPRAVNO: Čist projekat sa Root.tsx → Sequence chain → Generated_*.tsx + voiceover
✅ ISPRAVNO: Svaki segment je fullscreen 1920x1080 komponenta
✅ ISPRAVNO: Animacije su u .tsx fajlovima (Visual Generator ih je napravio)
```

---

## CHECKLIST

- [ ] `videos/{project-name}/` postoji
- [ ] `public/voiceover.mp3` postoji
- [ ] `src/visuals/Generated_*.tsx` za svaki segment
- [ ] `src/Root.tsx` sa Sequence chain-om
- [ ] `npx remotion studio` radi bez errora
- [ ] Svaki segment renderuje fullscreen animacije
- [ ] Voiceover se čuje i sinhronizovan je sa vizualima
