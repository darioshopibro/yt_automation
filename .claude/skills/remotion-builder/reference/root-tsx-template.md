# Root.tsx Template — Opacity Control + SFX + AI Clips

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

      {/* AI video clips (hook, reveals) — ako postoje u public/clips/ */}
      {aiClips && aiClips.map(({ src, startFrame: sf, endFrame: ef }, i) => {
        if (frame < sf - 1 || frame > ef + 1) return null;
        const fadeIn = interpolate(frame, [sf, sf + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const fadeOut = interpolate(frame, [ef - 15, ef], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={`clip-${i}`} style={{ position: "absolute", top: 0, left: 0, width: 1920, height: 1080, opacity: fadeIn * fadeOut, zIndex: 10 }}>
            <Video src={staticFile(src)} style={{ width: "100%", height: "100%" }} />
          </div>
        );
      })}

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

**SFX AUDIO:** Ako postoje premixed SFX fajlovi u `public/sfx/`, dodaj ih:

```tsx
import { Sequence } from "remotion";

// SFX — jedan Audio po segmentu, wraped u Sequence za timing
{segments.map(({ startFrame, endFrame }, i) => {
  const sfxFile = `sfx/segment_${i + 1}_sfx.mp3`;
  return (
    <Sequence key={`sfx-${i}`} from={startFrame} durationInFrames={endFrame - startFrame}>
      <Audio src={staticFile(sfxFile)} volume={1} />
    </Sequence>
  );
})}
```

**NAPOMENA:** Sequence se koristi SAMO za SFX Audio timing — NIKAD za vizuelne komponente. Vizuelne komponente koriste opacity control (gore).
