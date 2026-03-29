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

export const Scene6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainSpring = spring({ frame, fps, config: { damping: 12 } });
  const mainScale = interpolate(mainSpring, [0, 1], [0.5, 1]);

  // Pulsing follow button
  const pulse = Math.sin(frame * 0.2) * 0.05 + 1;

  const followSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  return (
    <AbsoluteFill>
      <GradientBackground colors={["#0a0020", "#1a0040", "#0a0030"]} />

      {/* Animated rays */}
      <AbsoluteFill
        style={{
          background: `conic-gradient(from ${frame * 3}deg at 50% 50%, transparent, ${COLORS.purple}08, transparent, ${COLORS.blue}08, transparent)`,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          transform: `scale(${mainScale})`,
        }}
      >
        <div
          style={{
            fontSize: 100,
            marginBottom: 10,
          }}
        >
          {"💡"}
        </div>

        <div
          style={{
            fontFamily: interFont,
            fontSize: 64,
            fontWeight: 900,
            color: COLORS.white,
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: `0 0 40px ${COLORS.purple}60`,
          }}
        >
          Adapt or Get
          <br />
          <span style={{ color: COLORS.purple }}>Left Behind</span>
        </div>

        {/* Follow button */}
        <div
          style={{
            marginTop: 40,
            opacity: followSpring,
            transform: `scale(${followSpring * pulse})`,
            background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.blue})`,
            borderRadius: 60,
            padding: "24px 80px",
            boxShadow: `0 0 40px ${COLORS.purple}50`,
          }}
        >
          <span
            style={{
              fontFamily: interFont,
              fontSize: 44,
              fontWeight: 900,
              color: COLORS.white,
            }}
          >
            Follow for more
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
