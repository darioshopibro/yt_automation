import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  interpolateColors,
} from "remotion";
import {
  HardDrives,
  ArrowsClockwise,
  Scales,
  Heartbeat,
  Lightning,
  Warning,
  CheckCircle,
  Cpu,
} from "@phosphor-icons/react";

/* ─────────────────────────────────────────────
   Generated_LoadBalancing
   Load Balancing Strategies: Round Robin → Least Connections
   → Weighted Round Robin → Health Checks
   4 scenes, progressive build, 1920×1080 @ 30fps
   ───────────────────────────────────────────── */

// ── Design tokens ──
const BG = "#0f0f1a";
const BORDER = "#1a1a2e";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_DIM = "#64748b";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";

const CLAMP = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const EASE_OUT = { ...CLAMP, easing: Easing.out(Easing.cubic) };
const EASE_IN = { ...CLAMP, easing: Easing.in(Easing.quad) };

// ── Phase boundaries ──
const PHASE_1_START = 0;
const PHASE_1_END = 330;
const PHASE_2_START = 330;
const PHASE_2_END = 660;
const PHASE_3_START = 660;
const PHASE_3_END = 990;
const PHASE_4_START = 990;
const PHASE_4_END = 1350;

// ── Phase config ──
const PHASES = [
  {
    title: "ROUND ROBIN",
    subtitle: "Request 1 → A, Request 2 → B, Request 3 → C, repeat",
    icon: ArrowsClockwise,
    color: BLUE,
    start: PHASE_1_START,
    end: PHASE_1_END,
  },
  {
    title: "LEAST CONNECTIONS",
    subtitle: "Route to the server with fewest active connections",
    icon: Scales,
    color: GREEN,
    start: PHASE_2_START,
    end: PHASE_2_END,
  },
  {
    title: "WEIGHTED ROUND ROBIN",
    subtitle: "Distribute proportionally: A×5, C×3, B×1",
    icon: Lightning,
    color: AMBER,
    start: PHASE_3_START,
    end: PHASE_3_END,
  },
  {
    title: "HEALTH CHECKS",
    subtitle: "Ping every 10s — dead servers get zero traffic",
    icon: Heartbeat,
    color: CYAN,
    start: PHASE_4_START,
    end: PHASE_4_END,
  },
];

// ── Helpers ──
const fadeSlideIn = (frame: number, start: number, dur = 18) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], EASE_OUT),
  translateY: interpolate(frame, [start, start + dur], [24, 0], EASE_OUT),
});

const fadeOut = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [1, 0], EASE_IN);

// ── Server Card ──
type ServerProps = {
  name: string;
  label: string;
  color: string;
  load: number; // 0-1
  connections: number;
  weight: string;
  showConnections: boolean;
  showWeight: boolean;
  status: "healthy" | "warning" | "down" | "recovering";
  isReceiving: boolean;
  frame: number;
  appearFrame: number;
  cores: string;
};

const ServerCard: React.FC<ServerProps> = ({
  name,
  label,
  color,
  load,
  connections,
  weight,
  showConnections,
  showWeight,
  status,
  isReceiving,
  frame,
  appearFrame,
  cores,
}) => {
  const { opacity, translateY } = fadeSlideIn(frame, appearFrame);
  const loadClamped = Math.max(0, Math.min(1, load));

  // Status-based color
  const statusColor =
    status === "down" ? RED :
    status === "warning" ? AMBER :
    status === "recovering" ? AMBER : color;

  const barColor =
    loadClamped > 0.85 ? RED :
    loadClamped > 0.6 ? AMBER : statusColor;

  // Receiving pulse glow
  const receivePulse = isReceiving
    ? interpolate(frame % 20, [0, 10, 20], [0.3, 0.7, 0.3], CLAMP)
    : 0;

  const downOpacity = status === "down"
    ? interpolate(frame, [frame, frame + 1], [0.35, 0.35], CLAMP)
    : 1;

  return (
    <div
      style={{
        opacity: opacity * (status === "down" ? 0.4 : 1),
        transform: `translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        flex: 1,
      }}
    >
      {/* Server box */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "32px 28px",
          borderRadius: 12,
          background: `${statusColor}08`,
          border: `1.5px solid ${statusColor}${isReceiving ? "50" : "20"}`,
          boxShadow: isReceiving
            ? `0 0 ${30 + receivePulse * 30}px ${statusColor}${Math.round(receivePulse * 40).toString(16).padStart(2, "0")}`
            : status === "down"
            ? "none"
            : `0 0 15px ${statusColor}10`,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "relative",
          overflow: "hidden",
          transition: "none",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${statusColor}20, ${statusColor}08)`,
              border: `1.5px solid ${statusColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${statusColor}15`,
            }}
          >
            {status === "down" ? (
              <Warning size={26} color={RED} weight="duotone" />
            ) : (
              <HardDrives size={26} color={statusColor} weight="duotone" />
            )}
          </div>
          <div>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: statusColor,
                letterSpacing: 0.5,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                color: TEXT_DIM,
                marginTop: 2,
              }}
            >
              {label}
            </div>
          </div>

          {/* Status indicator */}
          <div
            style={{
              marginLeft: "auto",
              width: 12,
              height: 12,
              borderRadius: "50%",
              background:
                status === "healthy" ? GREEN :
                status === "warning" ? AMBER :
                status === "recovering" ? AMBER : RED,
              boxShadow: `0 0 8px ${
                status === "healthy" ? GREEN :
                status === "warning" ? AMBER :
                status === "recovering" ? AMBER : RED
              }60`,
            }}
          />
        </div>

        {/* Load bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                color: TEXT_DIM,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              CPU Load
            </span>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                color: barColor,
              }}
            >
              {Math.round(loadClamped * 100)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 10,
              borderRadius: 5,
              background: "#1a1a2e",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${loadClamped * 100}%`,
                height: "100%",
                borderRadius: 5,
                background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                boxShadow: `0 0 10px ${barColor}40`,
              }}
            />
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ display: "flex", gap: 16 }}>
          {showConnections && (
            <div
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#12121f",
                border: `1px solid ${BORDER}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 9,
                  color: TEXT_DIM,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 4,
                }}
              >
                Connections
              </div>
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 22,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  letterSpacing: -0.5,
                }}
              >
                {connections}
              </div>
            </div>
          )}
          {showWeight && (
            <div
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#12121f",
                border: `1px solid ${BORDER}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 9,
                  color: TEXT_DIM,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 4,
                }}
              >
                Weight
              </div>
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 22,
                  fontWeight: 700,
                  color: AMBER,
                  letterSpacing: -0.5,
                }}
              >
                {weight}
              </div>
            </div>
          )}
          {(showWeight || showConnections) && (
            <div
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                background: "#12121f",
                border: `1px solid ${BORDER}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 9,
                  color: TEXT_DIM,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 4,
                }}
              >
                Cores
              </div>
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 18,
                  fontWeight: 600,
                  color: TEXT_SECONDARY,
                }}
              >
                {cores}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Request indicator (small dot that shows which server is receiving) ──
const RequestDot: React.FC<{
  frame: number;
  serverIndex: number;
  requestNum: number;
  color: string;
}> = ({ frame, serverIndex, requestNum, color }) => {
  const appear = fadeSlideIn(frame, 0, 12);
  return (
    <div
      style={{
        opacity: appear.opacity,
        transform: `translateY(${appear.translateY}px)`,
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: `${color}25`,
        border: `1.5px solid ${color}50`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'SF Mono', monospace",
        fontSize: 10,
        fontWeight: 700,
        color,
      }}
    >
      {requestNum}
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

const Generated_LoadBalancing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Determine active phase ──
  const phaseIndex =
    frame < PHASE_2_START ? 0 :
    frame < PHASE_3_START ? 1 :
    frame < PHASE_4_START ? 2 : 3;

  const phase = PHASES[phaseIndex];
  const phaseFrame = frame - phase.start; // local frame within phase

  // ── Phase transition (fade out old → fade in new) ──
  const TRANS = 25; // transition duration
  const phaseOpacity = interpolate(
    phaseFrame,
    [0, TRANS, phase.end - phase.start - TRANS, phase.end - phase.start],
    [0, 1, 1, 0],
    CLAMP,
  );

  // ── Title animation ──
  const titleAnim = fadeSlideIn(frame, phase.start + 5, 20);
  const PhaseIcon = phase.icon;

  // ── Server states per phase ──
  // Phase 1: Round Robin — even distribution, cycling highlight
  // Phase 2: Least Connections — B overloaded (890 conns), A lowest (230)
  // Phase 3: Weighted RR — different weights, A=5 B=1 C=3
  // Phase 4: Health Checks — B goes down at frame ~70 into phase, recovers ~250

  const getServerStates = () => {
    if (phaseIndex === 0) {
      // Round Robin — requests cycle evenly, load grows equally
      const loadGrowth = interpolate(phaseFrame, [60, 300], [0.15, 0.45], EASE_OUT);
      const cycleIndex = Math.floor((phaseFrame - 60) / 25) % 3;
      const isActive = phaseFrame > 60;
      return [
        {
          name: "Server A", label: "us-east-1", color: BLUE,
          load: loadGrowth, connections: 0, weight: "",
          showConnections: false, showWeight: false,
          status: "healthy" as const,
          isReceiving: isActive && cycleIndex === 0,
          cores: "16-core",
        },
        {
          name: "Server B", label: "us-east-2", color: GREEN,
          load: loadGrowth + interpolate(phaseFrame, [150, 300], [0, 0.35], EASE_OUT),
          connections: 0, weight: "",
          showConnections: false, showWeight: false,
          status: "healthy" as const,
          isReceiving: isActive && cycleIndex === 1,
          cores: "16-core",
        },
        {
          name: "Server C", label: "us-west-1", color: PURPLE,
          load: loadGrowth, connections: 0, weight: "",
          showConnections: false, showWeight: false,
          status: "healthy" as const,
          isReceiving: isActive && cycleIndex === 2,
          cores: "16-core",
        },
      ];
    }

    if (phaseIndex === 1) {
      // Least Connections — B at 890, A at 230, C at 310
      const connReveal = interpolate(phaseFrame, [30, 60], [0, 1], EASE_OUT);
      const bLoad = interpolate(phaseFrame, [30, 120], [0.5, 0.9], EASE_OUT);
      const aLoad = interpolate(phaseFrame, [30, 120], [0.2, 0.3], EASE_OUT);
      const cLoad = interpolate(phaseFrame, [30, 120], [0.25, 0.38], EASE_OUT);
      // After showing counts, new requests go to A (lowest)
      const redirectPhase = phaseFrame > 150;
      const aLoadAfter = redirectPhase
        ? interpolate(phaseFrame, [150, 300], [0.3, 0.5], EASE_OUT) : aLoad;

      return [
        {
          name: "Server A", label: "us-east-1", color: BLUE,
          load: aLoadAfter,
          connections: Math.round(230 + (redirectPhase ? interpolate(phaseFrame, [150, 300], [0, 120], EASE_OUT) : 0)),
          weight: "", showConnections: connReveal > 0.5, showWeight: false,
          status: "healthy" as const,
          isReceiving: redirectPhase && (phaseFrame % 30 < 15),
          cores: "16-core",
        },
        {
          name: "Server B", label: "us-east-2", color: GREEN,
          load: bLoad,
          connections: 890,
          weight: "", showConnections: connReveal > 0.5, showWeight: false,
          status: "warning" as const,
          isReceiving: false,
          cores: "16-core",
        },
        {
          name: "Server C", label: "us-west-1", color: PURPLE,
          load: cLoad,
          connections: Math.round(310 + (redirectPhase ? interpolate(phaseFrame, [150, 300], [0, 40], EASE_OUT) : 0)),
          weight: "", showConnections: connReveal > 0.5, showWeight: false,
          status: "healthy" as const,
          isReceiving: redirectPhase && (phaseFrame % 30 >= 15),
          cores: "16-core",
        },
      ];
    }

    if (phaseIndex === 2) {
      // Weighted Round Robin — A=5 (32-core), B=1 (4-core), C=3 (16-core)
      const weightReveal = interpolate(phaseFrame, [30, 60], [0, 1], EASE_OUT);
      // Distribution pattern: 9-request cycle, A gets 5, C gets 3, B gets 1
      const cyclePos = Math.floor((phaseFrame - 80) / 18) % 9;
      const isA = cyclePos < 5;
      const isC = cyclePos >= 5 && cyclePos < 8;
      const isB = cyclePos === 8;
      const active = phaseFrame > 80;

      return [
        {
          name: "Server A", label: "32-core beast", color: BLUE,
          load: interpolate(phaseFrame, [80, 300], [0.2, 0.55], EASE_OUT),
          connections: 0, weight: "5",
          showConnections: false, showWeight: weightReveal > 0.5,
          status: "healthy" as const,
          isReceiving: active && isA,
          cores: "32-core",
        },
        {
          name: "Server B", label: "4-core small", color: GREEN,
          load: interpolate(phaseFrame, [80, 300], [0.15, 0.3], EASE_OUT),
          connections: 0, weight: "1",
          showConnections: false, showWeight: weightReveal > 0.5,
          status: "healthy" as const,
          isReceiving: active && isB,
          cores: "4-core",
        },
        {
          name: "Server C", label: "16-core medium", color: PURPLE,
          load: interpolate(phaseFrame, [80, 300], [0.18, 0.45], EASE_OUT),
          connections: 0, weight: "3",
          showConnections: false, showWeight: weightReveal > 0.5,
          status: "healthy" as const,
          isReceiving: active && isC,
          cores: "16-core",
        },
      ];
    }

    // Phase 4: Health Checks
    const pingReveal = interpolate(phaseFrame, [20, 50], [0, 1], EASE_OUT);
    const bDown = phaseFrame > 100;
    const bRecovering = phaseFrame > 260;
    const bBack = phaseFrame > 300;

    const aLoad = bDown && !bBack
      ? interpolate(phaseFrame, [100, 200], [0.4, 0.7], EASE_OUT)
      : bBack
      ? interpolate(phaseFrame, [300, 350], [0.7, 0.45], EASE_OUT)
      : interpolate(phaseFrame, [20, 100], [0.3, 0.4], EASE_OUT);

    const cLoad = bDown && !bBack
      ? interpolate(phaseFrame, [100, 200], [0.35, 0.65], EASE_OUT)
      : bBack
      ? interpolate(phaseFrame, [300, 350], [0.65, 0.4], EASE_OUT)
      : interpolate(phaseFrame, [20, 100], [0.25, 0.35], EASE_OUT);

    return [
      {
        name: "Server A", label: "us-east-1", color: BLUE,
        load: aLoad, connections: 0, weight: "",
        showConnections: false, showWeight: false,
        status: "healthy" as const,
        isReceiving: bDown && !bBack && (phaseFrame % 24 < 12),
        cores: "32-core",
      },
      {
        name: "Server B", label: "us-east-2", color: GREEN,
        load: bDown && !bRecovering ? 0 : bRecovering && !bBack
          ? interpolate(phaseFrame, [260, 320], [0, 0.2], EASE_OUT) : 0.3,
        connections: 0, weight: "",
        showConnections: false, showWeight: false,
        status: bDown && !bRecovering ? "down" as const : bRecovering && !bBack ? "recovering" as const : "healthy" as const,
        isReceiving: false,
        cores: "16-core",
      },
      {
        name: "Server C", label: "us-west-1", color: PURPLE,
        load: cLoad, connections: 0, weight: "",
        showConnections: false, showWeight: false,
        status: "healthy" as const,
        isReceiving: bDown && !bBack && (phaseFrame % 24 >= 12),
        cores: "16-core",
      },
    ];
  };

  const servers = getServerStates();

  // ── Initial 3-server appear (only phase 1) ──
  const serversAppearBase = phaseIndex === 0 ? 15 : phase.start + 8;

  // ── Request counter (top right) ──
  const totalRequests = interpolate(
    frame,
    [60, 1350],
    [0, 10000],
    CLAMP,
  );

  // ── "10,000 users" banner ──
  const usersBannerOpacity = interpolate(frame, [0, 25], [0, 1], EASE_OUT);

  // ── Explanation text per phase ──
  const getExplanation = () => {
    if (phaseIndex === 0) {
      if (phaseFrame < 130) return "Every server gets an equal share — regardless of capacity";
      return "But what if Server B is at 90% CPU? Round Robin doesn't care...";
    }
    if (phaseIndex === 1) {
      if (phaseFrame < 130) return "Track active connections — route to the least busy server";
      return "Server B is struggling → it naturally gets fewer requests";
    }
    if (phaseIndex === 2) {
      if (phaseFrame < 130) return "Assign weights based on capacity: 5 : 1 : 3";
      return "For every 9 requests → A gets 5, C gets 3, B gets 1";
    }
    if (phaseFrame < 100) return "Ping every server every 10 seconds";
    if (phaseFrame < 190) return "Server B stops responding → all traffic shifts to A and C";
    if (phaseFrame < 280) return "When B recovers → traffic gradually returns";
    return "This is why your users never notice when a server dies";
  };

  const explanationAnim = fadeSlideIn(
    phaseFrame,
    phaseIndex === 0 ? 60 : 40,
    18,
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar: strategy badge + users counter ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 48,
          opacity: phaseOpacity,
        }}
      >
        {/* Strategy badge */}
        <div
          style={{
            opacity: titleAnim.opacity,
            transform: `translateY(${titleAnim.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`,
                border: `1.5px solid ${phase.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${phase.color}20`,
              }}
            >
              <PhaseIcon size={28} color={phase.color} weight="duotone" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 26,
                  fontWeight: 700,
                  color: phase.color,
                  letterSpacing: 1,
                }}
              >
                {phase.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: TEXT_DIM,
                  marginTop: 3,
                }}
              >
                {phase.subtitle}
              </div>
            </div>
          </div>
        </div>

        {/* Users counter */}
        <div
          style={{
            opacity: usersBannerOpacity,
            padding: "14px 24px",
            borderRadius: 12,
            background: "#12121f",
            border: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Cpu size={22} color={CYAN} weight="duotone" />
          <div>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 11,
                color: TEXT_DIM,
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              Active Requests
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 22,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: -0.5,
              }}
            >
              {Math.round(totalRequests).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Load Balancer indicator ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 40,
          opacity: phaseOpacity,
        }}
      >
        <div
          style={{
            padding: "16px 40px",
            borderRadius: 12,
            background: `linear-gradient(135deg, ${phase.color}12, ${phase.color}05)`,
            border: `1.5px solid ${phase.color}25`,
            boxShadow: `0 0 30px ${phase.color}10`,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: phase.color,
              boxShadow: `0 0 10px ${phase.color}60`,
            }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 15,
              fontWeight: 600,
              color: TEXT_SECONDARY,
              letterSpacing: 0.5,
            }}
          >
            LOAD BALANCER
          </span>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: phase.color,
              boxShadow: `0 0 10px ${phase.color}60`,
            }}
          />
        </div>
      </div>

      {/* ── Distribution visualization (small dots showing pattern) ── */}
      {phaseIndex === 0 && phaseFrame > 60 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginBottom: 24,
            opacity: interpolate(phaseFrame, [60, 80], [0, 1], EASE_OUT),
          }}
        >
          {Array.from({ length: Math.min(9, Math.floor((phaseFrame - 60) / 20)) }).map((_, i) => {
            const serverIdx = i % 3;
            const sColor = [BLUE, GREEN, PURPLE][serverIdx];
            return (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: `${sColor}25`,
                  border: `1.5px solid ${sColor}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  color: sColor,
                  opacity: interpolate(phaseFrame, [60 + i * 20, 60 + i * 20 + 12], [0, 1], EASE_OUT),
                }}
              >
                {"ABC"[serverIdx]}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Weighted distribution dots ── */}
      {phaseIndex === 2 && phaseFrame > 80 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginBottom: 24,
            opacity: interpolate(phaseFrame, [80, 100], [0, 1], EASE_OUT),
          }}
        >
          {/* A A A A A C C C B pattern */}
          {["A", "A", "A", "A", "A", "C", "C", "C", "B"].map((s, i) => {
            const sColor = s === "A" ? BLUE : s === "B" ? GREEN : PURPLE;
            const dotCount = Math.min(9, Math.floor((phaseFrame - 80) / 14));
            return (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `${sColor}25`,
                  border: `1.5px solid ${sColor}50`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: sColor,
                  opacity: i < dotCount
                    ? interpolate(phaseFrame, [80 + i * 14, 80 + i * 14 + 12], [0, 1], EASE_OUT)
                    : 0,
                }}
              >
                {s}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Health check ping indicators ── */}
      {phaseIndex === 3 && phaseFrame > 20 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginBottom: 24,
            opacity: interpolate(phaseFrame, [20, 50], [0, 1], EASE_OUT),
          }}
        >
          {["Server A", "Server B", "Server C"].map((name, i) => {
            const isB = i === 1;
            const bDown = phaseFrame > 100 && phaseFrame < 260;
            const bRecovering = phaseFrame >= 260 && phaseFrame < 300;
            const pingColor = isB && bDown ? RED : isB && bRecovering ? AMBER : GREEN;
            const pingPulse = interpolate((frame + i * 10) % 30, [0, 15, 30], [0.5, 1, 0.5], CLAMP);
            return (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Heartbeat
                  size={18}
                  color={pingColor}
                  weight="duotone"
                  style={{ opacity: pingPulse }}
                />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: pingColor,
                    fontWeight: 600,
                  }}
                >
                  {isB && bDown ? "TIMEOUT" : isB && bRecovering ? "RECOVERING" : "200 OK"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 3 Server Cards ── */}
      <div
        style={{
          display: "flex",
          gap: 32,
          flex: 1,
          alignItems: "flex-start",
          opacity: phaseOpacity,
        }}
      >
        {servers.map((s, i) => (
          <ServerCard
            key={s.name}
            {...s}
            frame={frame}
            appearFrame={serversAppearBase + i * 12}
          />
        ))}
      </div>

      {/* ── Explanation text (bottom) ── */}
      <div
        style={{
          marginTop: 32,
          textAlign: "center",
          opacity: explanationAnim.opacity * phaseOpacity,
          transform: `translateY(${explanationAnim.translateY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: TEXT_SECONDARY,
            fontWeight: 500,
            maxWidth: 900,
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          {getExplanation()}
        </div>
      </div>
    </div>
  );
};

export default Generated_LoadBalancing;
