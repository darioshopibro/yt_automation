import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { interFont } from "../lib/fonts";
import { COLORS } from "../lib/constants";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dramatic zoom from far
  const zoom = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const mainScale = interpolate(zoom, [0, 1], [3, 1]);
  const mainOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glitch flash
  const flash = frame < 5 ? interpolate(frame, [0, 5], [0.8, 0]) : 0;

  // Pulsing glow
  const pulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  // Warning icon bounce
  const iconSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 8 },
  });

  return (
    <AbsoluteFill>
      <GradientBackground colors={["#0a0118", "#1a0533", "#0f0a2e"]} />

      {/* Radial glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${COLORS.purple}30 0%, transparent 60%)`,
          opacity: pulse,
        }}
      />

      {/* Flash overlay */}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${mainScale})`,
          opacity: mainOpacity,
        }}
      >
        {/* Warning emoji */}
        <div
          style={{
            fontSize: 120,
            marginBottom: 30,
            transform: `scale(${iconSpring})`,
          }}
        >
          {"⚠️"}
        </div>

        {/* Main title */}
        <div
          style={{
            fontFamily: interFont,
            fontSize: 88,
            fontWeight: 900,
            color: COLORS.white,
            textAlign: "center",
            lineHeight: 1.1,
            padding: "0 60px",
            textShadow: `0 0 40px ${COLORS.purple}80`,
          }}
        >
          AI Agents
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontSize: 64,
            fontWeight: 700,
            color: COLORS.pink,
            textAlign: "center",
            marginTop: 16,
            textShadow: `0 0 30px ${COLORS.pink}60`,
          }}
        >
          Are Replacing
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontSize: 88,
            fontWeight: 900,
            color: COLORS.white,
            textAlign: "center",
            marginTop: 16,
            textShadow: `0 0 40px ${COLORS.purple}80`,
          }}
        >
          Junior Devs
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
