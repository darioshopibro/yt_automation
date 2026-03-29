import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont, spaceFont } from "../lib/fonts";

const CODE_LINES = [
  { text: "const agent = new AIAgent({", color: "#c792ea" },
  { text: '  model: "claude-4",', color: "#82aaff" },
  { text: '  task: "write_code",', color: "#82aaff" },
  { text: "  autonomous: true,", color: "#f78c6c" },
  { text: "});", color: "#c792ea" },
  { text: "", color: "#fff" },
  { text: "await agent.complete({", color: "#c792ea" },
  { text: '  prompt: "Build a REST API",', color: "#c3e88d" },
  { text: '  language: "TypeScript",', color: "#c3e88d" },
  { text: "});", color: "#c792ea" },
];

export const PhoneMockup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneScale = spring({ frame, fps, config: { damping: 15 } });
  const phoneY = interpolate(phoneScale, [0, 1], [200, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          transform: `scale(${phoneScale}) translateY(${phoneY}px)`,
          width: 560,
          height: 980,
          borderRadius: 50,
          border: "4px solid rgba(255,255,255,0.3)",
          background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)",
          boxShadow:
            "0 0 60px rgba(124,58,237,0.4), 0 0 120px rgba(59,130,246,0.2), inset 0 0 30px rgba(0,0,0,0.5)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: 20,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 12px",
            fontSize: 18,
            color: "#94a3b8",
            fontFamily: interFont,
          }}
        >
          <span>9:41</span>
          <span>AI Agent IDE</span>
          <span>100%</span>
        </div>

        {/* Editor area */}
        <div
          style={{
            flex: 1,
            background: "#0d1117",
            borderRadius: 16,
            padding: 24,
            marginTop: 8,
            fontFamily: spaceFont,
            fontSize: 22,
            lineHeight: 1.8,
            overflow: "hidden",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid #1e293b",
            }}
          >
            <div
              style={{
                background: "#7c3aed33",
                padding: "4px 16px",
                borderRadius: 8,
                color: "#c792ea",
                fontSize: 16,
                fontFamily: interFont,
              }}
            >
              agent.ts
            </div>
          </div>

          {/* Code lines with typewriter */}
          {CODE_LINES.map((line, i) => {
            const lineDelay = i * 5;
            const chars = Math.floor(
              interpolate(frame - lineDelay, [0, 15], [0, line.text.length], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  opacity: frame > lineDelay ? 1 : 0,
                }}
              >
                <span style={{ color: "#3b4252", minWidth: 30 }}>
                  {i + 1}
                </span>
                <span style={{ color: line.color }}>
                  {line.text.slice(0, chars)}
                  {frame > lineDelay && chars < line.text.length && (
                    <span
                      style={{
                        borderRight: "2px solid #7c3aed",
                        marginLeft: 1,
                      }}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 8,
            height: 6,
            borderRadius: 3,
            background: "#1e293b",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 3,
              width: `${interpolate(frame, [0, 80], [0, 100], { extrapolateRight: "clamp" })}%`,
              background: "linear-gradient(90deg, #7c3aed, #3b82f6)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
