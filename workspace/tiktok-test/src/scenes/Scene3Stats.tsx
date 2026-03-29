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

const STATS = [
  { value: "41%", label: "of code is AI-generated", color: COLORS.purple },
  { value: "10x", label: "faster than manual coding", color: COLORS.blue },
  { value: "2025", label: "the tipping point year", color: COLORS.pink },
];

export const Scene3Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <GradientBackground colors={["#0f0720", "#1a0a30", "#0a0520"]} />

      {/* Animated grid lines */}
      <AbsoluteFill style={{ opacity: 0.08 }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: i * 192,
              height: 1,
              background: COLORS.purple,
            }}
          />
        ))}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 60,
          padding: "0 80px",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: interFont,
            fontSize: 56,
            fontWeight: 900,
            color: COLORS.white,
            textAlign: "center",
            marginBottom: 20,
            opacity: interpolate(frame, [0, 15], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          The Numbers Don't Lie
        </div>

        {/* Stats */}
        {STATS.map((stat, i) => {
          const delay = 10 + i * 15;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12 },
          });
          const slideX = interpolate(
            s,
            [0, 1],
            [i % 2 === 0 ? -200 : 200, 0],
          );

          return (
            <div
              key={i}
              style={{
                transform: `translateX(${slideX}px) scale(${s})`,
                opacity: s,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: interFont,
                  fontSize: 110,
                  fontWeight: 900,
                  color: stat.color,
                  textShadow: `0 0 40px ${stat.color}50`,
                  letterSpacing: "-0.03em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: interFont,
                  fontSize: 36,
                  fontWeight: 700,
                  color: COLORS.gray,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
