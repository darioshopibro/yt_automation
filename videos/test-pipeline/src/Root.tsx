import React from "react";
import {
  Composition,
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";

import Generated_UnderTheHood from "./visuals/Generated_UnderTheHood";
import Generated_CodeExfiltration from "./visuals/Generated_CodeExfiltration";
import Generated_CodeInjection from "./visuals/Generated_CodeInjection";
import Generated_Persistence from "./visuals/Generated_Persistence";
import Generated_MarketplaceReality from "./visuals/Generated_MarketplaceReality";
import Generated_SafetyChecks from "./visuals/Generated_SafetyChecks";

const TOTAL_FRAMES = 4929;
const FPS = 30;

const segments = [
  // Segment 1: The Hook (ai_video) — no component, placeholder bg
  { Component: null, startFrame: 0, endFrame: 472 },
  // Segment 2: Under The Hood (motion_graphics)
  { Component: Generated_UnderTheHood, startFrame: 473, endFrame: 1345 },
  // Segment 3: Code Exfiltration (motion_graphics)
  { Component: Generated_CodeExfiltration, startFrame: 1346, endFrame: 2056 },
  // Segment 4: Code Injection (motion_graphics)
  { Component: Generated_CodeInjection, startFrame: 2057, endFrame: 2637 },
  // Segment 5: Persistence Beyond Uninstall (motion_graphics)
  { Component: Generated_Persistence, startFrame: 2638, endFrame: 3066 },
  // Segment 6: Marketplace Reality (motion_graphics)
  { Component: Generated_MarketplaceReality, startFrame: 3067, endFrame: 3677 },
  // Segment 7: Three Safety Checks (motion_graphics)
  { Component: Generated_SafetyChecks, startFrame: 3678, endFrame: 4619 },
  // Segment 8: The Closing (ai_video) — no component, placeholder bg
  { Component: null, startFrame: 4620, endFrame: 4929 },
];

const AiVideoPlaceholder: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at 50% 40%, #0a1628 0%, #030305 70%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        color: "#94a3b8",
        fontSize: 32,
        fontFamily: "Inter, system-ui, sans-serif",
        textAlign: "center",
        opacity: 0.6,
      }}
    >
      {label}
      <div style={{ fontSize: 18, marginTop: 12, color: "#475569" }}>
        AI Video Clip Placeholder
      </div>
    </div>
  </AbsoluteFill>
);

const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#030305" }}>
      {/* Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* Segments with opacity control */}
      {segments.map(({ Component, startFrame, endFrame }, i) => {
        // Don't render if not active (with 1 frame buffer)
        if (frame < startFrame - 1 || frame > endFrame + 1) return null;

        // Crossfade: fade in 15 frames, fade out 15 frames
        const fadeIn =
          i === 0
            ? 1
            : interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
        const fadeOut =
          i === segments.length - 1
            ? 1
            : interpolate(frame, [endFrame - 15, endFrame], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1920,
              height: 1080,
              opacity: fadeIn * fadeOut,
            }}
          >
            {Component ? (
              <Component />
            ) : i === 0 ? (
              <AiVideoPlaceholder label="The Hook" />
            ) : (
              <AiVideoPlaceholder label="The Closing" />
            )}
          </div>
        );
      })}

      {/* SFX Audio — one per segment, wrapped in Sequence for timing */}
      {segments.map(({ startFrame, endFrame }, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={startFrame}
          durationInFrames={endFrame - startFrame}
        >
          <Audio src={staticFile(`sfx/segment_${i + 1}_sfx.mp3`)} volume={1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FullVideo"
      component={FullVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
