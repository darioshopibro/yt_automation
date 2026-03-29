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

const SKILLS = [
  { text: "System Design", color: COLORS.purple },
  { text: "AI Prompting", color: COLORS.blue },
  { text: "Architecture", color: COLORS.cyan },
  { text: "Problem Solving", color: COLORS.green },
];

export const Scene5Skills: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <GradientBackground colors={["#001a0a", "#0a2015", "#000a05"]} />

      {/* Glow effect */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${COLORS.green}15 0%, transparent 60%)`,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 80px",
          gap: 40,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: interFont,
            fontSize: 60,
            fontWeight: 900,
            color: COLORS.green,
            textAlign: "center",
            marginBottom: 30,
            textShadow: `0 0 30px ${COLORS.green}50`,
            opacity: interpolate(frame, [0, 12], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          Skills That Matter Now
        </div>

        {/* Skill pills */}
        {SKILLS.map((skill, i) => {
          const delay = 10 + i * 12;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 10, stiffness: 180 },
          });

          const rotation = interpolate(s, [0, 1], [10, 0]);

          return (
            <div
              key={i}
              style={{
                transform: `scale(${s}) rotate(${rotation}deg)`,
                opacity: s,
                background: `linear-gradient(135deg, ${skill.color}20, ${skill.color}05)`,
                border: `2px solid ${skill.color}60`,
                borderRadius: 30,
                padding: "28px 50px",
                width: "100%",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: interFont,
                  fontSize: 48,
                  fontWeight: 900,
                  color: skill.color,
                  textShadow: `0 0 20px ${skill.color}40`,
                }}
              >
                {skill.text}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
