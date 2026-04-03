import React from "react";
import { Composition, Sequence, Audio, staticFile, interpolate, Easing, useCurrentFrame } from "remotion";
import Generated_WhatIsDocker from "./visuals/Generated_WhatIsDocker";
import Generated_ContainersMicroComputers from "./visuals/Generated_ContainersMicroComputers";
import Generated_DockerHub from "./visuals/Generated_DockerHub";
import Generated_DockerVsVMs from "./visuals/Generated_DockerVsVMs";
import Generated_DockerfileToContainer from "./visuals/Generated_DockerfileToContainer";
import Generated_DockerCommands from "./visuals/Generated_DockerCommands";

const TOTAL_FRAMES = 7267;
const FPS = 30;

const segments = [
  { id: "segment-1", Component: Generated_WhatIsDocker, startFrame: 0, endFrame: 945 },
  { id: "segment-2", Component: Generated_ContainersMicroComputers, startFrame: 975, endFrame: 1993 },
  { id: "segment-3", Component: Generated_DockerHub, startFrame: 2010, endFrame: 2521 },
  { id: "segment-4", Component: Generated_DockerVsVMs, startFrame: 2550, endFrame: 4501 },
  { id: "segment-5", Component: Generated_DockerfileToContainer, startFrame: 4530, endFrame: 5515 },
  { id: "segment-6", Component: Generated_DockerCommands, startFrame: 5550, endFrame: 7236 },
];

const CROSSFADE_DURATION = 15;

const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ width: 1920, height: 1080, background: "#0f0f1a", position: "relative" }}>
      {/* Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* Segments — NO Sequence wrapper, components use absolute (global) frames */}
      {segments.map(({ id, Component, startFrame, endFrame }, index) => {
        // Fade in at start (except first segment)
        const fadeIn = index === 0
          ? 1
          : interpolate(frame, [startFrame, startFrame + CROSSFADE_DURATION], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });

        // Fade out at end (except last segment)
        const fadeOut = index === segments.length - 1
          ? 1
          : interpolate(frame, [endFrame - CROSSFADE_DURATION, endFrame], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.in(Easing.cubic),
            });

        const opacity = fadeIn * fadeOut;

        // Don't render if completely invisible
        if (frame < startFrame - 1 || frame > endFrame + 1) return null;

        return (
          <div
            key={id}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1920,
              height: 1080,
              opacity,
            }}
          >
            <Component />
          </div>
        );
      })}
    </div>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DockerExplained"
      component={FullVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    {/* Individual segment previews */}
    {segments.map(({ id, Component, startFrame, endFrame }) => (
      <Composition
        key={id}
        id={id}
        component={Component}
        durationInFrames={endFrame - startFrame}
        fps={FPS}
        width={1920}
        height={1080}
      />
    ))}
  </>
);
