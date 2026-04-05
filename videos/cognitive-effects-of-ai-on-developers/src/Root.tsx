import React from "react";
import {
  Composition,
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import Generated_TheWithdrawal from "./visuals/Generated_TheWithdrawal";
import Generated_TheDopamineLoop from "./visuals/Generated_TheDopamineLoop";
import Generated_TheCravingTrap from "./visuals/Generated_TheCravingTrap";
import Generated_TheFrictionLadder from "./visuals/Generated_TheFrictionLadder";
import Generated_RealWorldProof from "./visuals/Generated_RealWorldProof";
import Generated_TakeBackControl from "./visuals/Generated_TakeBackControl";

const TOTAL_FRAMES = 10415;
const FPS = 30;

const segments = [
  { Component: Generated_TheWithdrawal, startFrame: 0, endFrame: 1028 },
  { Component: Generated_TheDopamineLoop, startFrame: 1029, endFrame: 3216 },
  { Component: Generated_TheCravingTrap, startFrame: 3217, endFrame: 4770 },
  { Component: Generated_TheFrictionLadder, startFrame: 4771, endFrame: 6942 },
  { Component: Generated_RealWorldProof, startFrame: 6943, endFrame: 8257 },
  { Component: Generated_TakeBackControl, startFrame: 8258, endFrame: 10415 },
];

const sfxTracks = [
  { src: "sfx/segment_1_sfx.mp3", startFrame: 0, endFrame: 1028 },
  { src: "sfx/segment_2_sfx.mp3", startFrame: 1029, endFrame: 3216 },
  { src: "sfx/segment_3_sfx.mp3", startFrame: 3217, endFrame: 4770 },
  { src: "sfx/segment_4_sfx.mp3", startFrame: 4771, endFrame: 6942 },
  { src: "sfx/segment_5_sfx.mp3", startFrame: 6943, endFrame: 8257 },
  { src: "sfx/segment_6_sfx.mp3", startFrame: 8258, endFrame: 10415 },
];

const aiClips = [
  { src: "clips/hook.mp4", startFrame: 0, endFrame: 90 },
];

const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      {/* Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* SFX per segment */}
      {sfxTracks.map(({ src, startFrame, endFrame }, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={startFrame}
          durationInFrames={endFrame - startFrame}
        >
          <Audio src={staticFile(src)} volume={1} />
        </Sequence>
      ))}

      {/* AI video clips (hook) */}
      {aiClips.map(({ src, startFrame: sf, endFrame: ef }, i) => {
        if (frame < sf - 1 || frame > ef + 1) return null;
        const fadeIn = interpolate(frame, [sf, sf + 15], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fadeOut = interpolate(frame, [ef - 15, ef], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={`clip-${i}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1920,
              height: 1080,
              opacity: fadeIn * fadeOut,
              zIndex: 10,
            }}
          >
            <Video
              src={staticFile(src)}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        );
      })}

      {/* Visual segments with crossfade */}
      {segments.map(({ Component, startFrame, endFrame }, i) => {
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
      id="FullVideo"
      component={FullVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
