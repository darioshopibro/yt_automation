import { Composition, AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import Generated_WhatIsDocker from "./visuals/Generated_WhatIsDocker";
import Generated_HowContainersWork from "./visuals/Generated_HowContainersWork";
import Generated_DockerVsVMs from "./visuals/Generated_DockerVsVMs";
import Generated_DockerfileToImage from "./visuals/Generated_DockerfileToImage";
import Generated_RunningContainers from "./visuals/Generated_RunningContainers";

const segments = [
  { Component: Generated_WhatIsDocker, startFrame: 0, endFrame: 1004 },
  { Component: Generated_HowContainersWork, startFrame: 1004, endFrame: 2536 },
  { Component: Generated_DockerVsVMs, startFrame: 2536, endFrame: 4574 },
  { Component: Generated_DockerfileToImage, startFrame: 4574, endFrame: 6068 },
  { Component: Generated_RunningContainers, startFrame: 6068, endFrame: 7329 },
];

const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#0f0f1a" }}>
      <Audio src={staticFile("voiceover.mp3")} />
      {segments.map(({ Component, startFrame, endFrame }, i) => {
        // Don't render if not active
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

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="DockerExplained"
      component={FullVideo}
      durationInFrames={7329}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
