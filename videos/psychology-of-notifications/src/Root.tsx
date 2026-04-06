import React from "react";
import {
  Composition,
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import Generated_VariableRewardScheduling from "./visuals/Generated_VariableRewardScheduling";
import Generated_SlotMachineComparison from "./visuals/Generated_SlotMachineComparison";
import Generated_DopamineRedBadge from "./visuals/Generated_DopamineRedBadge";
import Generated_AttentionCost from "./visuals/Generated_AttentionCost";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const segments = [
  // Segment 1: ai_video hook — placeholder (dark screen with subtle text)
  { id: "hook", startFrame: 0, endFrame: 474, Component: null },
  // Segment 2: Variable Reward Scheduling
  { id: "variable-reward", startFrame: 474, endFrame: 963, Component: Generated_VariableRewardScheduling },
  // Segment 3: Slot Machine Comparison
  { id: "slot-comparison", startFrame: 963, endFrame: 1275, Component: Generated_SlotMachineComparison },
  // Segment 4: Dopamine & Red Badge
  { id: "dopamine-badge", startFrame: 1275, endFrame: 1992, Component: Generated_DopamineRedBadge },
  // Segment 5: Attention Cost
  { id: "attention-cost", startFrame: 1992, endFrame: 2689, Component: Generated_AttentionCost },
];

const HookPlaceholder: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [0, 30], [0, 1], clamp);
  const subtitleOp = interpolate(frame, [30, 50], [0, 1], clamp);
  const subtitleY = interpolate(frame, [30, 50], [15, 0], {
    ...clamp,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
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
        gap: 20,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#e2e8f0",
          opacity: titleOp,
          letterSpacing: -1,
        }}
      >
        The Psychology of Notifications
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: "#64748b",
          opacity: subtitleOp,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        AI Video Placeholder — Replace with generated clip
      </div>
    </div>
  );
};

const FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: "#0f0f1a" }}>
      <Audio src={staticFile("voiceover.mp3")} />

      {segments.map(({ id, startFrame, endFrame, Component }, i) => {
        // Skip rendering segments that aren't visible
        if (frame < startFrame - 1 || frame > endFrame + 1) return null;

        // Fade in (first segment starts at full opacity)
        const fadeIn =
          i === 0
            ? 1
            : interpolate(frame, [startFrame, startFrame + 15], [0, 1], clamp);

        // Fade out (last segment ends at full opacity)
        const fadeOut =
          i === segments.length - 1
            ? 1
            : interpolate(frame, [endFrame - 15, endFrame], [1, 0], clamp);

        const SegmentComponent = Component || HookPlaceholder;

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
            <SegmentComponent />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PsychologyOfNotifications"
        component={FullVideo}
        durationInFrames={2689}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
