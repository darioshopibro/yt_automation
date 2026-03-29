import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface GradientBackgroundProps {
  colors: [string, string, string];
  angle?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  colors,
  angle = 135,
}) => {
  const frame = useCurrentFrame();

  // Slowly shift the gradient position for a living feel
  const shift = interpolate(frame, [0, 90], [0, 30], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle + shift}deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
      }}
    />
  );
};
