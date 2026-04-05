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
import Generated_ThreeObjectsIntro from "./visuals/Generated_ThreeObjectsIntro";
import Generated_Blobs from "./visuals/Generated_Blobs";
import Generated_Trees from "./visuals/Generated_Trees";
import Generated_Commits from "./visuals/Generated_Commits";
import Generated_Branches from "./visuals/Generated_Branches";
import Generated_Merging from "./visuals/Generated_Merging";
import Generated_Rebasing from "./visuals/Generated_Rebasing";

const FPS = 30;
const TOTAL_FRAMES = 4480;

const segments = [
  { id: "hook", startFrame: 0, endFrame: 459, Component: null },
  { id: "three-objects-intro", startFrame: 459, endFrame: 779, Component: Generated_ThreeObjectsIntro },
  { id: "blobs", startFrame: 779, endFrame: 1221, Component: Generated_Blobs },
  { id: "trees", startFrame: 1221, endFrame: 1908, Component: Generated_Trees },
  { id: "commits", startFrame: 1908, endFrame: 2415, Component: Generated_Commits },
  { id: "branches", startFrame: 2415, endFrame: 2982, Component: Generated_Branches },
  { id: "merging", startFrame: 2982, endFrame: 3790, Component: Generated_Merging },
  { id: "rebasing", startFrame: 3790, endFrame: 4480, Component: Generated_Rebasing },
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
        How <span style={{ color: "#f59e0b" }}>Git</span> Actually Works
        <br />
        Under the Hood
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
      <Sequence from={0} durationInFrames={459}>
        <Audio src={staticFile("sfx/segment_1_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={459} durationInFrames={320}>
        <Audio src={staticFile("sfx/segment_2_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={779} durationInFrames={442}>
        <Audio src={staticFile("sfx/segment_3_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={1221} durationInFrames={687}>
        <Audio src={staticFile("sfx/segment_4_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={1908} durationInFrames={507}>
        <Audio src={staticFile("sfx/segment_5_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={2415} durationInFrames={567}>
        <Audio src={staticFile("sfx/segment_6_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={2982} durationInFrames={808}>
        <Audio src={staticFile("sfx/segment_7_sfx.mp3")} volume={1} />
      </Sequence>
      <Sequence from={3790} durationInFrames={690}>
        <Audio src={staticFile("sfx/segment_8_sfx.mp3")} volume={1} />
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
