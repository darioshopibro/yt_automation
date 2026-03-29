import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GradientBackground } from "../components/GradientBackground";
import { interFont } from "../lib/fonts";
import { COLORS } from "../lib/constants";

const ITEMS = [
  { icon: "🔥", text: "Entry-level jobs shrinking" },
  { icon: "🤖", text: "AI does code reviews" },
  { icon: "📉", text: "Fewer junior hires in 2025" },
];

export const Scene4Impact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera zoom in
  const zoom = interpolate(frame, [0, 90], [1, 1.12], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <GradientBackground colors={["#1a0000", "#2d0a0a", "#0a0000"]} />

      {/* Red pulsing vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 40%, #ff000015 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
          gap: 50,
        }}
      >
        {/* Title with slide-in */}
        <div
          style={{
            fontFamily: interFont,
            fontSize: 68,
            fontWeight: 900,
            color: COLORS.orange,
            textAlign: "center",
            textShadow: `0 0 30px ${COLORS.orange}60`,
            opacity: interpolate(frame, [0, 12], [0, 1], {
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [0, 12], [40, 0], { extrapolateRight: "clamp" })}px)`,
          }}
        >
          What This Means
        </div>

        {/* Impact items */}
        {ITEMS.map((item, i) => {
          const delay = 15 + i * 18;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 150 },
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: s,
                transform: `translateX(${interpolate(s, [0, 1], [-100, 0])}px)`,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 24,
                padding: "24px 40px",
                border: "1px solid rgba(255,255,255,0.1)",
                width: "100%",
              }}
            >
              <span style={{ fontSize: 56 }}>{item.icon}</span>
              <span
                style={{
                  fontFamily: interFont,
                  fontSize: 40,
                  fontWeight: 700,
                  color: COLORS.white,
                }}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
