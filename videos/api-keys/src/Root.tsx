import { Composition, AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import Generated_WhatIsAnAPIKey from "./visuals/Generated_WhatIsAnAPIKey";
import Generated_HowValidationWorks from "./visuals/Generated_HowValidationWorks";
import Generated_SecurityProblem from "./visuals/Generated_SecurityProblem";
import Generated_LayeredSecurity from "./visuals/Generated_LayeredSecurity";
import Generated_WhereToStore from "./visuals/Generated_WhereToStore";
import Generated_KeyRotation from "./visuals/Generated_KeyRotation";

const segments = [
  { Component: Generated_WhatIsAnAPIKey, startFrame: 0, endFrame: 633 },
  { Component: Generated_HowValidationWorks, startFrame: 633, endFrame: 1719 },
  { Component: Generated_SecurityProblem, startFrame: 1719, endFrame: 2357 },
  { Component: Generated_LayeredSecurity, startFrame: 2357, endFrame: 3259 },
  { Component: Generated_WhereToStore, startFrame: 3259, endFrame: 3970 },
  { Component: Generated_KeyRotation, startFrame: 3970, endFrame: 4499 },
];

const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#030305" }}>
      <Audio src={staticFile("voiceover.mp3")} />
      {segments.map(({ Component, startFrame, endFrame }, i) => {
        if (frame < startFrame - 1 || frame > endFrame + 1) return null;

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
            <Component startFrame={startFrame} endFrame={endFrame} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="APIKeysExplained"
      component={FullVideo}
      durationInFrames={4499}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
