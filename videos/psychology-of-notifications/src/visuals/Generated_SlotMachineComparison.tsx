import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const c = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
};

// ── KEY WORD TIMESTAMPS (global frames from voiceover) ──
const F_IF_1 = 984;          // "If" (first)
const F_NOTIFICATION = 998;  // "notification"
const F_BORING = 1024;       // "boring"
const F_TURN_OFF = 1052;     // "turn"
const F_OFF = 1065;          // "off"
const F_IF_2 = 1096;         // "If" (second)
const F_EXCITING = 1116;     // "exciting"
const F_EAGERLY = 1156;      // "eagerly"
const F_CALMLY = 1175;       // "calmly"
const F_RANDOMNESS = 1219;   // "randomness"
const F_COMPULSION = 1255;   // "compulsion"

const START = 963;
const END = 1275;

// ── Notification badge component ──
const NotifBadge: React.FC<{
  color: string;
  glow: number;
  opacity: number;
  scale: number;
  y: number;
  icon: string;
  pulse?: boolean;
  frame?: number;
}> = ({ color, glow, opacity, scale, y, icon, pulse, frame }) => {
  const Icon = getIcon(icon);
  const pulseScale = pulse && frame
    ? 1 + Math.sin((frame % 18) * 0.35) * 0.06
    : 1;
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${color}25, ${color}08)`,
        border: `1.5px solid ${color}35`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: glow > 0 ? `0 0 ${glow}px ${color}50` : "none",
        opacity,
        transform: `translateY(${y}px) scale(${scale * pulseScale})`,
      }}
    >
      <Icon size={26} color={color} weight="duotone" />
    </div>
  );
};

// ── Scenario column ──
const ScenarioColumn: React.FC<{
  frame: number;
  fps: number;
  title: string;
  subtitle: string;
  color: string;
  columnOpacity: number;
  columnY: number;
  badges: Array<{
    icon: string;
    color: string;
    delay: number;
    glow: number;
    pulse?: boolean;
  }>;
  resultText: string;
  resultColor: string;
  resultIcon: string;
  resultFrame: number;
  highlight: boolean;
  highlightGlow: number;
}> = ({
  frame, fps, title, subtitle, color,
  columnOpacity, columnY, badges, resultText, resultColor,
  resultIcon, resultFrame, highlight, highlightGlow,
}) => {
  const ResultIcon = getIcon(resultIcon);

  const resultOp = interpolate(frame, [resultFrame, resultFrame + 15], [0, 1], clamp);
  const resultY = interpolate(frame, [resultFrame, resultFrame + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: "32px 20px",
        borderRadius: 12,
        background: highlight ? `${color}08` : "#0f0f1a",
        border: `1.5px solid ${highlight ? `${color}40` : "#1a1a2e"}`,
        boxShadow: highlight ? `0 0 ${highlightGlow}px ${color}30` : "none",
        opacity: columnOpacity,
        transform: `translateY(${columnY}px)`,
        minHeight: 480,
      }}
    >
      {/* Column header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700 }}>{title}</div>
        <div style={{ color: "#64748b", fontSize: 14, fontWeight: 500, marginTop: 4 }}>{subtitle}</div>
      </div>

      {/* Notification badges */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {badges.map((b, i) => {
          const badgeStart = b.delay;
          const badgeOp = interpolate(frame, [badgeStart, badgeStart + 12], [0, 1], clamp);
          const badgeScale = spring({
            frame: Math.max(0, frame - badgeStart),
            fps,
            config: { damping: 22, stiffness: 200 },
          });
          const badgeY = interpolate(frame, [badgeStart, badgeStart + 12], [12, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          return (
            <NotifBadge
              key={i}
              color={b.color}
              glow={b.glow * badgeOp}
              opacity={badgeOp}
              scale={badgeScale}
              y={badgeY}
              icon={b.icon}
              pulse={b.pulse}
              frame={frame}
            />
          );
        })}
      </div>

      {/* Result label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          borderRadius: 10,
          background: `${resultColor}10`,
          border: `1px solid ${resultColor}25`,
          opacity: resultOp,
          transform: `translateY(${resultY}px)`,
        }}
      >
        <ResultIcon size={22} color={resultColor} weight="duotone" />
        <span style={{ color: resultColor, fontSize: 15, fontWeight: 600 }}>
          {resultText}
        </span>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════
const Generated_SlotMachineComparison: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Section title: appears at segment start ──
  // 🔊 SOUND: scene_start @ frame 963 — segment title fades in
  const titleOp = interpolate(frame, [START, START + 18], [0, 1], clamp);
  const titleY = interpolate(frame, [START, START + 18], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── COLUMN 1: "All Boring" — appears with first "If" ──
  // 🔊 SOUND: element_appear @ frame 984 — "All Boring" column slides up
  const col1Op = interpolate(frame, [F_IF_1, F_IF_1 + 18], [0, 1], clamp);
  const col1Y = interpolate(frame, [F_IF_1, F_IF_1 + 18], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Boring badges: gray, dim, staggered from F_NOTIFICATION
  const boringBadges = [
    { icon: "EnvelopeSimple", color: "#475569", delay: F_NOTIFICATION, glow: 0 },
    { icon: "ChatCircle", color: "#475569", delay: F_NOTIFICATION + 8, glow: 0 },
    { icon: "Bell", color: "#475569", delay: F_NOTIFICATION + 16, glow: 0 },
    { icon: "Megaphone", color: "#475569", delay: F_BORING - 5, glow: 0 },
  ];

  // 🔊 SOUND: element_appear @ frame 1052 — "Turn them off" result appears with X
  // (result for column 1 at F_TURN_OFF)

  // ── COLUMN 2: "All Exciting" — appears with second "If" ──
  // 🔊 SOUND: element_appear @ frame 1096 — "All Exciting" column slides up
  const col2Op = interpolate(frame, [F_IF_2, F_IF_2 + 18], [0, 1], clamp);
  const col2Y = interpolate(frame, [F_IF_2, F_IF_2 + 18], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Exciting badges: bright, all gold/amber, uniform
  const excitingBadges = [
    { icon: "Star", color: c.amber, delay: F_IF_2 + 10, glow: 12 },
    { icon: "Trophy", color: c.amber, delay: F_IF_2 + 18, glow: 12 },
    { icon: "Lightning", color: c.amber, delay: F_IF_2 + 26, glow: 12 },
    { icon: "Crown", color: c.amber, delay: F_EXCITING - 3, glow: 12 },
  ];

  // 🔊 SOUND: element_appear @ frame 1175 — "Check calmly" result appears
  // (result for column 2 at F_CALMLY)

  // ── COLUMN 3: "Random Mix" — appears with "randomness" ──
  // 🔊 SOUND: element_appear @ frame 1219 — "Random Mix" column slides up with glow
  const col3Op = interpolate(frame, [F_RANDOMNESS - 15, F_RANDOMNESS + 5], [0, 1], clamp);
  const col3Y = interpolate(frame, [F_RANDOMNESS - 15, F_RANDOMNESS + 5], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Random badges: MIX of boring gray + exciting amber, unpredictable, pulsing
  const randomBadges = [
    { icon: "Bell", color: "#475569", delay: F_RANDOMNESS - 5, glow: 0, pulse: false },
    { icon: "Star", color: c.amber, delay: F_RANDOMNESS + 3, glow: 18, pulse: true },
    { icon: "EnvelopeSimple", color: "#475569", delay: F_RANDOMNESS + 10, glow: 0, pulse: false },
    { icon: "Lightning", color: c.red, delay: F_RANDOMNESS + 16, glow: 22, pulse: true },
  ];

  // 🔊 SOUND: reveal @ frame 1255 — "Compulsion!" result pulses with emphasis
  // Highlight glow on column 3 builds
  const col3Highlight = frame >= F_RANDOMNESS;
  const col3Glow = interpolate(frame, [F_RANDOMNESS, F_COMPULSION], [0, 30], clamp);

  // ── COMPULSION punchline text ──
  // 🔊 SOUND: reveal @ frame 1255 — "COMPULSION" text scales up dramatically
  const punchOp = interpolate(frame, [F_COMPULSION, F_COMPULSION + 12], [0, 1], clamp);
  const punchScale = spring({
    frame: Math.max(0, frame - F_COMPULSION),
    fps,
    config: { damping: 18, stiffness: 180 },
  });
  const punchGlow = interpolate(frame, [F_COMPULSION, F_COMPULSION + 20], [0, 40], clamp);

  // ── Dim columns 1 & 2 when column 3 appears ──
  const dimOld = interpolate(frame, [F_RANDOMNESS - 10, F_RANDOMNESS + 10], [1, 0.45], clamp);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
      }}
    >
      {/* ── Segment title ── */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "#94a3b8",
            fontSize: 16,
            fontWeight: 500,
            fontFamily: "'SF Mono', monospace",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Variable Reward Schedule
        </span>
      </div>

      {/* ── Three columns ── */}
      <div
        style={{
          display: "flex",
          gap: 32,
          width: "100%",
          flex: 1,
          alignItems: "stretch",
        }}
      >
        {/* Column 1: All Boring */}
        <div style={{ flex: 1, opacity: dimOld, display: "flex" }}>
          <ScenarioColumn
            frame={frame}
            fps={fps}
            title="All Boring"
            subtitle="Every notification is dull"
            color="#475569"
            columnOpacity={col1Op}
            columnY={col1Y}
            badges={boringBadges}
            resultText="Turn them off"
            resultColor="#64748b"
            resultIcon="XCircle"
            resultFrame={F_TURN_OFF}
            highlight={false}
            highlightGlow={0}
          />
        </div>

        {/* Column 2: All Exciting */}
        <div style={{ flex: 1, opacity: dimOld, display: "flex" }}>
          <ScenarioColumn
            frame={frame}
            fps={fps}
            title="All Exciting"
            subtitle="Every notification is gold"
            color={c.amber}
            columnOpacity={col2Op}
            columnY={col2Y}
            badges={excitingBadges}
            resultText="Check calmly"
            resultColor={c.amber}
            resultIcon="SmileyMeh"
            resultFrame={F_CALMLY}
            highlight={false}
            highlightGlow={0}
          />
        </div>

        {/* Column 3: Random Mix */}
        <div style={{ flex: 1, display: "flex" }}>
          <ScenarioColumn
            frame={frame}
            fps={fps}
            title="Random Mix"
            subtitle="You never know what you'll get"
            color={c.red}
            columnOpacity={col3Op}
            columnY={col3Y}
            badges={randomBadges}
            resultText="Can't stop checking"
            resultColor={c.red}
            resultIcon="Warning"
            resultFrame={F_COMPULSION - 5}
            highlight={col3Highlight}
            highlightGlow={col3Glow}
          />
        </div>
      </div>

      {/* ── COMPULSION punchline ── */}
      <div
        style={{
          opacity: punchOp,
          transform: `scale(${punchScale})`,
          textAlign: "center",
          marginTop: -8,
        }}
      >
        <span
          style={{
            color: c.red,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            textShadow: `0 0 ${punchGlow}px ${c.red}60`,
          }}
        >
          Compulsion
        </span>
      </div>
    </div>
  );
};

export default Generated_SlotMachineComparison;
