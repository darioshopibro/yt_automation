import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { PhoneMockup } from "../components/PhoneMockup";
import { interFont } from "../lib/fonts";
import { COLORS } from "../lib/constants";

export const Scene2Code: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelY = interpolate(frame, [20, 35], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle camera zoom
  const cameraZoom = interpolate(frame, [0, 90], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${cameraZoom})` }}>
      <GradientBackground colors={["#020617", "#0f172a", "#020617"]} />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => {
        const x = (i * 137) % 1080;
        const baseY = (i * 271) % 1920;
        const y = baseY + Math.sin(frame * 0.05 + i) * 30;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: i % 2 === 0 ? COLORS.purple : COLORS.blue,
              opacity: 0.4,
            }}
          />
        );
      })}

      {/* Phone */}
      <div style={{ position: "absolute", inset: 0, top: 80 }}>
        <PhoneMockup />
      </div>

      {/* Bottom label */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 280,
        }}
      >
        <div
          style={{
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
            fontFamily: interFont,
            fontSize: 44,
            fontWeight: 700,
            color: COLORS.cyan,
            textAlign: "center",
            textShadow: `0 0 20px ${COLORS.cyan}40`,
          }}
        >
          Writing code in seconds...
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
