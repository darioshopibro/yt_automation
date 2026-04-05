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
import Generated_WhatIsDNS from "./visuals/Generated_WhatIsDNS";
import Generated_DNSLookupCache from "./visuals/Generated_DNSLookupCache";
import Generated_ChainOfQuestions from "./visuals/Generated_ChainOfQuestions";
import Generated_TheResolution from "./visuals/Generated_TheResolution";

const FPS = 30;
const TOTAL_FRAMES = 3619;

const segments = [
  // Segment 1: ai_video (hook) — placeholder black with text
  { id: "hook", startFrame: 0, endFrame: 390, Component: null },
  // Segment 2-5: motion_graphics
  { id: "what-is-dns", startFrame: 390, endFrame: 1110, Component: Generated_WhatIsDNS },
  { id: "dns-lookup-cache", startFrame: 1110, endFrame: 1890, Component: Generated_DNSLookupCache },
  { id: "chain-of-questions", startFrame: 1890, endFrame: 3000, Component: Generated_ChainOfQuestions },
  { id: "the-resolution", startFrame: 3000, endFrame: 3619, Component: Generated_TheResolution },
];

const HookPlaceholder: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleScale = interpolate(frame, [30, 60], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "#f8fafc",
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        Why Every Developer
        <br />
        Should Understand{" "}
        <span style={{ color: "#3b82f6" }}>DNS</span>
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#94a3b8",
          fontFamily: "'Inter', system-ui, sans-serif",
          marginTop: 24,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        [AI Video Hook — replace with generated clip]
      </div>
    </div>
  );
};

const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#0f0f1a" }}>
      <Audio src={staticFile("voiceover.mp3")} />

      {/* SFX per segment */}
      <Sequence from={390} durationInFrames={720}>
        <Audio src={staticFile("sfx/segment_2_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={1110} durationInFrames={780}>
        <Audio src={staticFile("sfx/segment_3_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={1890} durationInFrames={1110}>
        <Audio src={staticFile("sfx/segment_4_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={3000} durationInFrames={619}>
        <Audio src={staticFile("sfx/segment_5_sfx.mp3")} volume={1} />
      </Sequence>

      {/* Segment visuals with crossfade */}
      {segments.map(({ id, startFrame, endFrame, Component }, i) => {
        if (frame < startFrame - 1 || frame > endFrame + 1) return null;

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
            key={id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1920,
              height: 1080,
              opacity: fadeIn * fadeOut,
            }}
          >
            {Component ? <Component /> : <HookPlaceholder />}
          </div>
        );
      })}
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
