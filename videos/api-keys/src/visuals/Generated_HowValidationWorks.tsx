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
  cyan: "#06b6d4",
  amber: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  purple: "#a855f7",
  orange: "#f97316",
};

// ── Word-level timestamps (absolute frames at 30fps) ──
// From voiceover-timestamps.json — segment 2
const T = {
  heres: 633,
  works: 679,
  app: 713,
  sends: 723,
  request: 736,
  server: 755,
  apiKey: 799,
  header: 846,
  serverReceives: 880,
  checks: 935,
  database: 968,
  asks: 999,
  three: 1009,
  questions: 1016,
  isValid: 1041,
  valid: 1060,
  isActive: 1075,
  active: 1085,
  revoked: 1124,
  doesHave: 1152,
  permission: 1184,
  endpoint: 1236,
  ifAll: 1236,
  allThree: 1281,
  checksPass: 1293,
  pass: 1302,
  serverProcesses: 1322,
  sendsBack: 1382,
  data: 1400,
  ifAny: 1435,
  checkFails: 1448,
  fails: 1456,
  youGet: 1481,
  four01: 1493,
  unauthorized: 1513,
  four03: 1551,
  forbidden: 1577,
  error: 1591,
  whole: 1617,
  process: 1632,
  takes: 1646,
  fiveMs: 1664,
  milliseconds: 1675,
};

// ── Scene boundaries ──
const SCENE1_END = T.questions + 10;   // ~1026 — request flow scene
const SCENE2_START = T.questions - 10; // ~1006
const SCENE2_END = T.ifAny - 10;      // ~1425
const SCENE3_START = T.ifAny - 25;    // ~1410

type Props = {
  startFrame: number;
  endFrame: number;
};

const Generated_HowValidationWorks: React.FC<Props> = ({ startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Local frame for visibility checks
  const localFrame = frame - startFrame;
  const totalFrames = endFrame - startFrame;

  // Don't render outside our segment
  if (frame < startFrame || frame > endFrame) return null;

  // Scene opacities with crossfade
  const scene1Op =
    interpolate(frame, [T.heres, T.heres + 15], [0, 1], clamp) *
    interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);

  const scene2Op =
    interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp) *
    interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);

  const scene3Op = interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#030305",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ═══ SCENE 1: App → Server request flow ═══ */}
      {frame < SCENE1_END && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 0,
            opacity: scene1Op,
          }}
        >
          <Scene1_RequestFlow frame={frame} fps={fps} />
        </div>
      )}

      {/* ═══ SCENE 2: 3 Validation checks ═══ */}
      {frame >= SCENE2_START && frame < SCENE2_END && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: scene2Op,
          }}
        >
          <Scene2_ValidationChecks frame={frame} fps={fps} />
        </div>
      )}

      {/* ═══ SCENE 3: Pass / Fail response ═══ */}
      {frame >= SCENE3_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: scene3Op,
          }}
        >
          <Scene3_Response frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: App sends request → Server receives
// ═══════════════════════════════════════════════════════════
const Scene1_RequestFlow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const AppIcon = getIcon("DeviceMobile");
  const ServerIcon = getIcon("HardDrives");
  const KeyIcon = getIcon("Key");

  // Title: "Here's how it works"
  const titleOp = interpolate(frame, [T.heres, T.heres + 15], [0, 1], clamp);
  const titleY = interpolate(frame, [T.heres, T.heres + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // App node appears at "Your app"
  const appOp = interpolate(frame, [T.app - 5, T.app + 10], [0, 1], clamp);
  const appScale = spring({
    frame: Math.max(0, frame - (T.app - 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Server node appears at "server"
  const serverOp = interpolate(frame, [T.server - 5, T.server + 10], [0, 1], clamp);
  const serverScale = spring({
    frame: Math.max(0, frame - (T.server - 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Request packet traveling from app to server
  const packetStart = T.sends;
  const packetEnd = T.serverReceives;
  const packetProgress = interpolate(frame, [packetStart, packetEnd], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const packetOp =
    interpolate(frame, [packetStart, packetStart + 8], [0, 1], clamp) *
    interpolate(frame, [packetEnd - 8, packetEnd], [1, 0.3], clamp);

  // API Key badge on the packet
  const keyBadgeOp = interpolate(frame, [T.apiKey - 5, T.apiKey + 10], [0, 1], clamp);

  // "usually in a header" sub-label
  const headerOp = interpolate(frame, [T.header - 5, T.header + 10], [0, 1], clamp);
  const headerY = interpolate(frame, [T.header - 5, T.header + 10], [8, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Server "receives" glow
  const serverGlow = interpolate(frame, [T.serverReceives, T.serverReceives + 20], [0, 25], clamp);

  // "checks against database" label
  const dbOp = interpolate(frame, [T.checks - 5, T.checks + 15], [0, 1], clamp);
  const dbY = interpolate(frame, [T.checks - 5, T.checks + 15], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "asks three questions" label
  const questionsOp = interpolate(frame, [T.asks - 5, T.asks + 15], [0, 1], clamp);
  const questionsScale = spring({
    frame: Math.max(0, frame - (T.asks - 5)),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Title */}
      <span
        style={{
          color: "#f8fafc",
          fontSize: 28,
          fontWeight: 700,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          textTransform: "uppercase",
          letterSpacing: 2,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        How Validation Works
      </span>

      {/* Flow: App → [packet] → Server */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, position: "relative", marginTop: 40 }}>
        {/* APP */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: appOp,
            transform: `scale(${appScale})`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${c.blue}20, ${c.blue}08)`,
              border: `1.5px solid ${c.blue}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${c.blue}15`,
            }}
          >
            <AppIcon size={42} color={c.blue} weight="duotone" />
          </div>
          <span style={{ color: "#f8fafc", fontSize: 16, fontWeight: 600 }}>Your App</span>
        </div>

        {/* TRACK between app and server */}
        <div style={{ width: 500, height: 60, position: "relative", display: "flex", alignItems: "center" }}>
          {/* Track line */}
          <div style={{ width: "100%", height: 2, background: `${c.blue}15`, borderRadius: 1 }} />

          {/* Traveling request packet */}
          <div
            style={{
              position: "absolute",
              left: `${packetProgress * 100}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              opacity: packetOp,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Packet body */}
            <div
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                background: `${c.cyan}12`,
                border: `1px solid ${c.cyan}30`,
                boxShadow: `0 0 15px ${c.cyan}25`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  color: "#f8fafc",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                }}
              >
                GET /api/data
              </span>
              {/* API Key badge on packet */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: `${c.amber}15`,
                  border: `1px solid ${c.amber}25`,
                  opacity: keyBadgeOp,
                }}
              >
                <KeyIcon size={14} color={c.amber} weight="duotone" />
                <span
                  style={{
                    color: c.amber,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                  }}
                >
                  API Key
                </span>
              </div>
            </div>

            {/* "in a header" label */}
            <span
              style={{
                color: "#94a3b8",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                opacity: headerOp,
                transform: `translateY(${headerY}px)`,
              }}
            >
              Authorization: Bearer sk_...
            </span>
          </div>
        </div>

        {/* SERVER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: serverOp,
            transform: `scale(${serverScale})`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${c.cyan}20, ${c.cyan}08)`,
              border: `1.5px solid ${c.cyan}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${15 + serverGlow}px ${c.cyan}${serverGlow > 10 ? "30" : "15"}`,
            }}
          >
            <ServerIcon size={42} color={c.cyan} weight="duotone" />
          </div>
          <span style={{ color: "#f8fafc", fontSize: 16, fontWeight: 600 }}>Server</span>

          {/* "checks against database" */}
          <span
            style={{
              color: "#94a3b8",
              fontSize: 13,
              fontWeight: 500,
              opacity: dbOp,
              transform: `translateY(${dbY}px)`,
            }}
          >
            Checks key against database
          </span>
        </div>
      </div>

      {/* "Asks three questions" badge */}
      <div
        style={{
          marginTop: 40,
          padding: "14px 32px",
          borderRadius: 12,
          background: `${c.amber}08`,
          border: `1.5px solid ${c.amber}25`,
          boxShadow: `0 0 20px ${c.amber}15`,
          opacity: questionsOp,
          transform: `scale(${questionsScale})`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {React.createElement(getIcon("Question"), { size: 24, color: c.amber, weight: "duotone" })}
        <span
          style={{
            color: "#f8fafc",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}
        >
          3 Questions
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Three validation checks
// ═══════════════════════════════════════════════════════════
const Scene2_ValidationChecks: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ShieldIcon = getIcon("ShieldCheck");

  // Title
  const titleOp = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp);
  const titleY = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Three checks data
  const checks = [
    {
      question: "Is this key valid?",
      icon: "Key",
      color: c.blue,
      appearFrame: T.isValid - 5,
      passFrame: T.isValid + 30,
    },
    {
      question: "Is it active, or revoked?",
      icon: "Power",
      color: c.green,
      appearFrame: T.isActive - 5,
      passFrame: T.revoked + 15,
    },
    {
      question: "Does it have permission?",
      icon: "LockOpen",
      color: c.purple,
      appearFrame: T.doesHave - 5,
      passFrame: T.endpoint - 10,
    },
  ];

  // Server icon in center-top
  const serverOp = interpolate(frame, [SCENE2_START + 5, SCENE2_START + 20], [0, 1], clamp);
  const serverScale = spring({
    frame: Math.max(0, frame - (SCENE2_START + 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%" }}>
      {/* Title */}
      <span
        style={{
          color: "#f8fafc",
          fontSize: 26,
          fontWeight: 700,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          textTransform: "uppercase",
          letterSpacing: 2,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Server Validation
      </span>

      {/* Server icon */}
      <div
        style={{
          opacity: serverOp,
          transform: `scale(${serverScale})`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${c.cyan}20, ${c.cyan}08)`,
            border: `1.5px solid ${c.cyan}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 15px ${c.cyan}15`,
          }}
        >
          <ShieldIcon size={30} color={c.cyan} weight="duotone" />
        </div>
        <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 600 }}>
          Server asks 3 questions:
        </span>
      </div>

      {/* Three check cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%", maxWidth: 900 }}>
        {checks.map((check, i) => {
          const Icon = getIcon(check.icon);
          const CheckCircle = getIcon("CheckCircle");

          // Card entrance
          const cardOp = interpolate(frame, [check.appearFrame, check.appearFrame + 15], [0, 1], clamp);
          const cardX = interpolate(frame, [check.appearFrame, check.appearFrame + 15], [40, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });

          // Check passes — checkmark appears
          const passed = frame >= check.passFrame;
          const checkOp = interpolate(frame, [check.passFrame, check.passFrame + 12], [0, 1], clamp);
          const checkScale = spring({
            frame: Math.max(0, frame - check.passFrame),
            fps,
            config: { damping: 20, stiffness: 200 },
          });

          // Progress bar fill (from appear to pass)
          const barProgress = interpolate(frame, [check.appearFrame + 15, check.passFrame], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });

          // Glow when passed
          const passGlow = interpolate(frame, [check.passFrame, check.passFrame + 20], [0, 20], clamp);

          return (
            <div
              key={i}
              style={{
                opacity: cardOp,
                transform: `translateX(${cardX}px)`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "20px 28px",
                borderRadius: 12,
                background: passed ? `${check.color}08` : "#0a0a12",
                border: `1.5px solid ${passed ? `${check.color}30` : "#1a1a2e"}`,
                boxShadow: passed ? `0 0 ${passGlow}px ${check.color}20` : "none",
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: passed ? `${check.color}20` : "#1a1a2e",
                  border: `2px solid ${passed ? check.color : "#2a2a3e"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: passed ? check.color : "#64748b",
                    fontSize: 18,
                    fontWeight: 700,
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                  }}
                >
                  {i + 1}
                </span>
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${check.color}20, ${check.color}08)`,
                  border: `1.5px solid ${check.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={24} color={check.color} weight="duotone" />
              </div>

              {/* Question + progress bar */}
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    color: passed ? "#f8fafc" : "#94a3b8",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {check.question}
                </span>
                {/* Progress bar */}
                <div
                  style={{
                    marginTop: 10,
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    background: "#1a1a2e",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barProgress * 100}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${check.color}60, ${check.color})`,
                      boxShadow: barProgress > 0.5 ? `0 0 8px ${check.color}40` : "none",
                    }}
                  />
                </div>
              </div>

              {/* Checkmark */}
              <div
                style={{
                  width: 36,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: checkOp,
                  transform: `scale(${checkScale})`,
                }}
              >
                <CheckCircle size={32} color={c.green} weight="fill" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Pass → Data / Fail → 401/403
// ═══════════════════════════════════════════════════════════
const Scene3_Response: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const CheckIcon = getIcon("CheckCircle");
  const XIcon = getIcon("XCircle");
  const DatabaseIcon = getIcon("Database");
  const WarningIcon = getIcon("Warning");
  const TimerIcon = getIcon("Timer");

  // "If all three checks pass" — success path
  const successTitleOp = interpolate(frame, [T.allThree - 5, T.allThree + 15], [0, 1], clamp);
  const successTitleY = interpolate(frame, [T.allThree - 5, T.allThree + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Three small checkmarks appear
  const check1Op = interpolate(frame, [T.checksPass - 5, T.checksPass + 8], [0, 1], clamp);
  const check2Op = interpolate(frame, [T.checksPass + 5, T.checksPass + 13], [0, 1], clamp);
  const check3Op = interpolate(frame, [T.checksPass + 15, T.checksPass + 23], [0, 1], clamp);

  // "Server processes your request" — data card
  const dataOp = interpolate(frame, [T.serverProcesses - 5, T.serverProcesses + 15], [0, 1], clamp);
  const dataY = interpolate(frame, [T.serverProcesses - 5, T.serverProcesses + 15], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const dataGlow = interpolate(frame, [T.data - 5, T.data + 20], [0, 25], clamp);

  // Success path fades slightly to make room for error path
  const successDim = interpolate(frame, [T.ifAny - 10, T.ifAny + 10], [1, 0.4], clamp);

  // "If any check fails" — error path
  const errorTitleOp = interpolate(frame, [T.ifAny - 5, T.ifAny + 15], [0, 1], clamp);
  const errorTitleY = interpolate(frame, [T.ifAny - 5, T.ifAny + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 401 badge
  const four01Op = interpolate(frame, [T.four01 - 5, T.four01 + 12], [0, 1], clamp);
  const four01Scale = spring({
    frame: Math.max(0, frame - (T.four01 - 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // 403 badge
  const four03Op = interpolate(frame, [T.four03 - 5, T.four03 + 12], [0, 1], clamp);
  const four03Scale = spring({
    frame: Math.max(0, frame - (T.four03 - 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // "5 milliseconds" timer badge
  const timerOp = interpolate(frame, [T.takes - 5, T.takes + 15], [0, 1], clamp);
  const timerScale = spring({
    frame: Math.max(0, frame - (T.takes - 5)),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const timerValue = Math.round(
    interpolate(frame, [T.takes, T.fiveMs], [0, 5], clamp)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}>
      {/* Split layout: Success (left) | Error (right) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 60,
          width: "100%",
          maxWidth: 1600,
        }}
      >
        {/* ── SUCCESS PATH ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            opacity: successDim,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: successTitleOp,
              transform: `translateY(${successTitleY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                color: c.green,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              All 3 Checks Pass
            </span>
          </div>

          {/* Three small checkmarks in a row */}
          <div style={{ display: "flex", gap: 16 }}>
            {[check1Op, check2Op, check3Op].map((op, i) => {
              const colors = [c.blue, c.green, c.purple];
              const scale = spring({
                frame: Math.max(0, frame - (T.checksPass - 5 + i * 10)),
                fps,
                config: { damping: 20, stiffness: 200 },
              });
              return (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: `${colors[i]}15`,
                    border: `1.5px solid ${colors[i]}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: op,
                    transform: `scale(${scale})`,
                    boxShadow: `0 0 12px ${colors[i]}20`,
                  }}
                >
                  <CheckIcon size={24} color={colors[i]} weight="fill" />
                </div>
              );
            })}
          </div>

          {/* Data response card */}
          <div
            style={{
              padding: "24px 40px",
              borderRadius: 12,
              background: `${c.green}06`,
              border: `1.5px solid ${c.green}20`,
              boxShadow: `0 0 ${dataGlow}px ${c.green}20`,
              opacity: dataOp,
              transform: `translateY(${dataY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${c.green}20, ${c.green}08)`,
                border: `1.5px solid ${c.green}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DatabaseIcon size={28} color={c.green} weight="duotone" />
            </div>
            <div>
              <div style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700 }}>
                200 OK
              </div>
              <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 400, marginTop: 4 }}>
                Server sends back the data
              </div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div
          style={{
            width: 2,
            background: `linear-gradient(180deg, transparent, #1a1a2e, transparent)`,
            opacity: errorTitleOp,
          }}
        />

        {/* ── ERROR PATH ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: errorTitleOp,
              transform: `translateY(${errorTitleY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                color: c.red,
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              Any Check Fails
            </span>
          </div>

          {/* X marks */}
          <div
            style={{
              opacity: errorTitleOp,
              display: "flex",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `${c.red}15`,
                border: `1.5px solid ${c.red}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 12px ${c.red}20`,
              }}
            >
              <XIcon size={24} color={c.red} weight="fill" />
            </div>
          </div>

          {/* 401 Unauthorized */}
          <div
            style={{
              padding: "16px 28px",
              borderRadius: 12,
              background: `${c.red}06`,
              border: `1.5px solid ${c.red}20`,
              boxShadow: `0 0 15px ${c.red}15`,
              opacity: four01Op,
              transform: `scale(${four01Scale})`,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <WarningIcon size={24} color={c.red} weight="duotone" />
            <div>
              <span
                style={{
                  color: c.red,
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                }}
              >
                401
              </span>
              <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500, marginLeft: 10 }}>
                Unauthorized
              </span>
            </div>
          </div>

          {/* 403 Forbidden */}
          <div
            style={{
              padding: "16px 28px",
              borderRadius: 12,
              background: `${c.orange}06`,
              border: `1.5px solid ${c.orange}20`,
              boxShadow: `0 0 15px ${c.orange}15`,
              opacity: four03Op,
              transform: `scale(${four03Scale})`,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <WarningIcon size={24} color={c.orange} weight="duotone" />
            <div>
              <span
                style={{
                  color: c.orange,
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                }}
              >
                403
              </span>
              <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500, marginLeft: 10 }}>
                Forbidden
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5ms TIMER BADGE (bottom) ── */}
      <div
        style={{
          marginTop: 20,
          padding: "16px 36px",
          borderRadius: 12,
          background: `${c.cyan}08`,
          border: `1.5px solid ${c.cyan}25`,
          boxShadow: `0 0 20px ${c.cyan}15`,
          opacity: timerOp,
          transform: `scale(${timerScale})`,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <TimerIcon size={28} color={c.cyan} weight="duotone" />
        <span
          style={{
            color: c.cyan,
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            letterSpacing: -1,
          }}
        >
          ~{timerValue}ms
        </span>
        <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500 }}>
          total validation time
        </span>
      </div>
    </div>
  );
};

export default Generated_HowValidationWorks;
