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

// ── Key timestamps (global frames at 30fps) ──
const F_START = 3000;
const F_FINALLY = 3030;
const F_RECURSIVE = 3056;
const F_RESOLVER = 3071;
const F_ASKS = 3099;
const F_GOOGLE = 3116;
const F_AUTHORITATIVE = 3131;
const F_NAMESERVER = 3153;
const F_SERVER = 3203;
const F_ANSWER = 3223;
const F_RESPONDS = 3256;
const F_IP = 3282;
const F_ADDRESS = 3297;
const F_RESOLVER2 = 3335;
const F_CACHES = 3352;
const F_SENDS = 3391;
const F_BROWSER = 3418;
const F_PROCESS = 3477;
const F_20MS = 3521;
const F_120MS = 3543;
const F_MILLISECONDS = 3567;
const F_END = 3619;

// ── Scene boundaries ──
const SCENE1_END = F_ANSWER + 30; // ~3253
const SCENE2_START = F_ANSWER;    // ~3223
const SCENE2_END = F_BROWSER + 40; // ~3458
const SCENE3_START = F_BROWSER + 10; // ~3428

// ── Chain nodes for the return journey ──
const chainNodes = [
  { label: "Auth Nameserver", icon: "Database", color: c.green },
  { label: "Recursive Resolver", icon: "ArrowsClockwise", color: c.blue },
  { label: "Your Browser", icon: "Globe", color: c.cyan },
];

const Generated_TheResolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene crossfade opacities ──
  const scene1Op = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op =
    interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp) *
    interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Op = interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ════════ SCENE 1: Auth Nameserver receives query, lights up ════════ */}
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
          <Scene1_AuthAnswer frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════ SCENE 2: IP travels back through the chain ════════ */}
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
          <Scene2_ReturnJourney frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════ SCENE 3: Browser receives IP + timing reveal ════════ */}
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
          <Scene3_TimingReveal frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Recursive resolver asks Google's auth nameserver — EUREKA
// ═══════════════════════════════════════════════════════════
const Scene1_AuthAnswer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ResolverIcon = getIcon("ArrowsClockwise");
  const ServerIcon = getIcon("Database");
  const LightningIcon = getIcon("Lightning");

  // Title: "Finally..."
  const titleOp = interpolate(frame, [F_START, F_START + 15], [0, 1], clamp);
  const titleY = interpolate(frame, [F_START, F_START + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Recursive resolver node
  const resolverOp = interpolate(frame, [F_RECURSIVE - 5, F_RECURSIVE + 10], [0, 1], clamp);
  const resolverX = interpolate(frame, [F_RECURSIVE - 5, F_RECURSIVE + 10], [-30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "asks" — traveling query dot
  const queryProgress = interpolate(frame, [F_ASKS, F_ASKS + 30], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const queryOp =
    interpolate(frame, [F_ASKS, F_ASKS + 5], [0, 0.8], clamp) *
    interpolate(frame, [F_ASKS + 25, F_ASKS + 30], [1, 0], clamp);

  // Auth nameserver node — appears with "Google's authoritative"
  const authOp = interpolate(frame, [F_GOOGLE - 5, F_GOOGLE + 10], [0, 1], clamp);
  const authX = interpolate(frame, [F_GOOGLE - 5, F_GOOGLE + 10], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "Google's" label
  const googleLabelOp = interpolate(frame, [F_GOOGLE, F_GOOGLE + 12], [0, 1], clamp);

  // Nameserver label
  const nsLabelOp = interpolate(frame, [F_NAMESERVER - 3, F_NAMESERVER + 10], [0, 1], clamp);

  // EUREKA — "This server has the answer" — big glow pulse on auth server
  const eurekaGlow = interpolate(frame, [F_SERVER, F_SERVER + 20], [0, 50], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const eureka2Glow = interpolate(frame, [F_ANSWER - 5, F_ANSWER + 15], [0, 35], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const eurekaScale = spring({
    frame: Math.max(0, frame - F_ANSWER),
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  const answerBadgeOp = interpolate(frame, [F_ANSWER, F_ANSWER + 15], [0, 1], clamp);
  const answerBadgeY = interpolate(frame, [F_ANSWER, F_ANSWER + 15], [12, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Pulse ring on eureka
  const pulseRingScale = interpolate(frame, [F_ANSWER, F_ANSWER + 25], [1, 2.8], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const pulseRingOp = interpolate(frame, [F_ANSWER, F_ANSWER + 25], [0.6, 0], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50 }}>
      {/* Title */}
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#e2e8f0",
          letterSpacing: 1,
          fontFamily: "'SF Mono', monospace",
          textTransform: "uppercase",
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        The Final Query
      </span>

      {/* Main row: Resolver → Auth Nameserver */}
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        {/* Recursive Resolver */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: resolverOp,
            transform: `translateX(${resolverX}px)`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${c.blue}20, ${c.blue}08)`,
              border: `1.5px solid ${c.blue}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${c.blue}15`,
            }}
          >
            <ResolverIcon size={44} color={c.blue} weight="duotone" />
          </div>
          <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>
            Recursive Resolver
          </span>
          <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>
            "I need the IP..."
          </span>
        </div>

        {/* Traveling query dot */}
        <div
          style={{
            width: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ width: "100%", height: 2, background: `${c.amber}15` }} />
          <div
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: c.amber,
              boxShadow: `0 0 14px ${c.amber}80`,
              left: `${queryProgress * 100}%`,
              opacity: queryOp,
              transform: "translateX(-50%)",
            }}
          />
        </div>

        {/* Auth Nameserver */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: authOp,
            transform: `translateX(${authX}px)`,
          }}
        >
          <div style={{ position: "relative" }}>
            {/* Pulse ring on eureka */}
            <div
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                left: -10,
                top: -10,
                borderRadius: "50%",
                border: `2px solid ${c.green}`,
                transform: `scale(${pulseRingScale})`,
                opacity: pulseRingOp,
              }}
            />
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${c.green}20, ${c.green}08)`,
                border: `1.5px solid ${c.green}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 ${eurekaGlow + eureka2Glow}px ${c.green}40`,
                transform: `scale(${frame >= F_ANSWER ? eurekaScale : 1})`,
              }}
            >
              <ServerIcon
                size={44}
                color={c.green}
                weight="duotone"
                style={{ filter: `drop-shadow(0 0 ${eurekaGlow > 10 ? 12 : 0}px ${c.green}80)` }}
              />
            </div>
          </div>

          <span
            style={{
              color: "#e2e8f0",
              fontSize: 16,
              fontWeight: 600,
              opacity: nsLabelOp,
            }}
          >
            Auth Nameserver
          </span>
          <span
            style={{
              color: c.green,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'SF Mono', monospace",
              opacity: googleLabelOp,
            }}
          >
            google.com
          </span>

          {/* "HAS THE ANSWER" badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 10,
              background: `${c.green}12`,
              border: `1px solid ${c.green}30`,
              boxShadow: `0 0 20px ${c.green}25`,
              opacity: answerBadgeOp,
              transform: `translateY(${answerBadgeY}px)`,
            }}
          >
            <LightningIcon size={18} color={c.green} weight="fill" />
            <span
              style={{
                color: c.green,
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "'SF Mono', monospace",
              }}
            >
              HAS THE ANSWER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: IP address travels back — reverse chain animation
// ═══════════════════════════════════════════════════════════
const Scene2_ReturnJourney: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Title
  const titleOp = interpolate(frame, [F_RESPONDS - 5, F_RESPONDS + 10], [0, 1], clamp);
  const titleY = interpolate(frame, [F_RESPONDS - 5, F_RESPONDS + 10], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // IP address badge
  const ipOp = interpolate(frame, [F_IP - 5, F_IP + 10], [0, 1], clamp);
  const ipScale = spring({
    frame: Math.max(0, frame - F_IP),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Chain node timings
  const nodeTimings = [
    { appearFrame: F_RESPONDS, activeStart: F_RESPONDS, activeEnd: F_RESOLVER2 },
    { appearFrame: F_RESOLVER2 - 10, activeStart: F_RESOLVER2, activeEnd: F_SENDS },
    { appearFrame: F_SENDS - 10, activeStart: F_SENDS, activeEnd: F_END },
  ];

  // Traveling data packet from node 0 → 1 (resolver caches)
  const packet1Progress = interpolate(frame, [F_RESOLVER2, F_RESOLVER2 + 25], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const packet1Op =
    interpolate(frame, [F_RESOLVER2, F_RESOLVER2 + 5], [0, 0.9], clamp) *
    interpolate(frame, [F_RESOLVER2 + 20, F_RESOLVER2 + 25], [1, 0], clamp);

  // Traveling data packet from node 1 → 2 (sends to browser)
  const packet2Progress = interpolate(frame, [F_SENDS, F_SENDS + 25], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const packet2Op =
    interpolate(frame, [F_SENDS, F_SENDS + 5], [0, 0.9], clamp) *
    interpolate(frame, [F_SENDS + 20, F_SENDS + 25], [1, 0], clamp);

  // "Caches it" badge on resolver
  const cacheBadgeOp = interpolate(frame, [F_CACHES - 3, F_CACHES + 10], [0, 1], clamp);
  const cacheBadgeScale = spring({
    frame: Math.max(0, frame - F_CACHES),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Title */}
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#e2e8f0",
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        IP Address Returns Through The Chain
      </span>

      {/* IP Badge — the data that's traveling */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 24px",
          borderRadius: 10,
          background: `${c.amber}12`,
          border: `1.5px solid ${c.amber}30`,
          boxShadow: `0 0 20px ${c.amber}20`,
          opacity: ipOp,
          transform: `scale(${ipScale})`,
        }}
      >
        {React.createElement(getIcon("MapPin"), {
          size: 20,
          color: c.amber,
          weight: "duotone",
        })}
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: c.amber,
            fontFamily: "'SF Mono', monospace",
            letterSpacing: -0.5,
          }}
        >
          142.250.80.46
        </span>
      </div>

      {/* Chain: Auth → Resolver → Browser */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 0, width: "100%" }}>
        {chainNodes.map((node, idx) => {
          const timing = nodeTimings[idx];
          const nodeOp = interpolate(frame, [timing.appearFrame - 5, timing.appearFrame + 10], [0, 1], clamp);
          const nodeY = interpolate(frame, [timing.appearFrame - 5, timing.appearFrame + 10], [20, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });
          const isActive = frame >= timing.activeStart && frame < timing.activeEnd;
          const isPast = frame >= timing.activeEnd;
          const NodeIcon = getIcon(node.icon);

          return (
            <React.Fragment key={node.label}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  maxWidth: 280,
                  opacity: nodeOp,
                  transform: `translateY(${nodeY}px)`,
                }}
              >
                {/* Node circle */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    background: isActive
                      ? `linear-gradient(135deg, ${node.color}25, ${node.color}10)`
                      : `${node.color}08`,
                    border: `1.5px solid ${isActive ? `${node.color}50` : `${node.color}20`}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isActive ? `0 0 25px ${node.color}30` : "none",
                  }}
                >
                  <NodeIcon
                    size={36}
                    color={node.color}
                    weight="duotone"
                    style={{ filter: isActive ? `drop-shadow(0 0 8px ${node.color}60)` : "none" }}
                  />
                </div>

                <span
                  style={{
                    color: isActive ? "#e2e8f0" : isPast ? "#94a3b8" : "#64748b",
                    fontSize: 15,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {node.label}
                </span>

                {/* "Caches it" badge on resolver (idx 1) */}
                {idx === 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: `${c.purple}10`,
                      border: `1px solid ${c.purple}25`,
                      opacity: cacheBadgeOp,
                      transform: `scale(${cacheBadgeScale})`,
                    }}
                  >
                    {React.createElement(getIcon("FloppyDisk"), {
                      size: 16,
                      color: c.purple,
                      weight: "duotone",
                    })}
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.purple,
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      CACHED
                    </span>
                  </div>
                )}

                {/* Checkmark when node receives the IP */}
                {isPast && (
                  <div
                    style={{
                      opacity: interpolate(frame, [timing.activeEnd, timing.activeEnd + 10], [0, 1], clamp),
                    }}
                  >
                    {React.createElement(getIcon("CheckCircle"), {
                      size: 24,
                      color: c.green,
                      weight: "fill",
                    })}
                  </div>
                )}
              </div>

              {/* Connector + traveling packet between nodes */}
              {idx < chainNodes.length - 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 180,
                    height: 80,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ width: "100%", height: 2, background: `${c.amber}15`, borderRadius: 1 }} />
                  {/* Packet dot */}
                  {idx === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: c.amber,
                        boxShadow: `0 0 14px ${c.amber}80`,
                        left: `${packet1Progress * 100}%`,
                        opacity: packet1Op,
                        transform: "translateX(-50%)",
                      }}
                    />
                  )}
                  {idx === 1 && (
                    <div
                      style={{
                        position: "absolute",
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        background: c.amber,
                        boxShadow: `0 0 14px ${c.amber}80`,
                        left: `${packet2Progress * 100}%`,
                        opacity: packet2Op,
                        transform: "translateX(-50%)",
                      }}
                    />
                  )}
                  {/* Direction arrow */}
                  <div
                    style={{
                      position: "absolute",
                      right: -6,
                      width: 0,
                      height: 0,
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderLeft: `8px solid ${c.amber}30`,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Browser receives IP — Timing reveal (20-120ms)
// ═══════════════════════════════════════════════════════════
const Scene3_TimingReveal: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const BrowserIcon = getIcon("Globe");
  const CheckIcon = getIcon("CheckCircle");
  const TimerIcon = getIcon("Timer");
  const LightningIcon = getIcon("Lightning");

  // Browser receives IP — celebratory
  const browserOp = interpolate(frame, [F_BROWSER, F_BROWSER + 15], [0, 1], clamp);
  const browserScale = spring({
    frame: Math.max(0, frame - F_BROWSER),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const browserGlow = interpolate(frame, [F_BROWSER + 10, F_BROWSER + 30], [0, 30], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Connected badge
  const connectedOp = interpolate(frame, [F_BROWSER + 20, F_BROWSER + 35], [0, 1], clamp);
  const connectedY = interpolate(frame, [F_BROWSER + 20, F_BROWSER + 35], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "This entire process" title
  const processOp = interpolate(frame, [F_PROCESS - 5, F_PROCESS + 10], [0, 1], clamp);
  const processY = interpolate(frame, [F_PROCESS - 5, F_PROCESS + 10], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Timer counting animation: 0 → 120ms
  const timerCountStart = F_20MS;
  const timerCountEnd = F_120MS + 15;
  const timerValue = Math.round(
    interpolate(frame, [timerCountStart, timerCountEnd], [0, 120], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    })
  );
  const timerOp = interpolate(frame, [timerCountStart - 10, timerCountStart], [0, 1], clamp);

  // Timer bar fill
  const barProgress = interpolate(frame, [timerCountStart, timerCountEnd], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Color transitions: green (fast) → amber (medium) → stays amber
  const timerColor = timerValue <= 20 ? c.green : timerValue <= 80 ? c.amber : c.amber;

  // "20 to 120 milliseconds" range badge
  const rangeBadgeOp = interpolate(frame, [F_MILLISECONDS - 5, F_MILLISECONDS + 10], [0, 1], clamp);
  const rangeBadgeScale = spring({
    frame: Math.max(0, frame - F_MILLISECONDS),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Final glow pulse at the very end
  const finalGlow = interpolate(frame, [F_MILLISECONDS + 10, F_END], [0, 40], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Browser celebration */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: browserOp,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${c.cyan}20, ${c.cyan}08)`,
            border: `2px solid ${c.cyan}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${browserGlow}px ${c.cyan}30`,
            transform: `scale(${browserScale})`,
          }}
        >
          <BrowserIcon
            size={48}
            color={c.cyan}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 10px ${c.cyan}60)` }}
          />
        </div>

        {/* Connected badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 10,
            background: `${c.green}12`,
            border: `1px solid ${c.green}30`,
            boxShadow: `0 0 15px ${c.green}20`,
            opacity: connectedOp,
            transform: `translateY(${connectedY}px)`,
          }}
        >
          <CheckIcon size={18} color={c.green} weight="fill" />
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: c.green,
              fontFamily: "'SF Mono', monospace",
            }}
          >
            IP RECEIVED — 142.250.80.46
          </span>
        </div>
      </div>

      {/* "This entire process takes..." */}
      <span
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#94a3b8",
          opacity: processOp,
          transform: `translateY(${processY}px)`,
        }}
      >
        This entire process takes about...
      </span>

      {/* Timer display — big counter */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity: timerOp,
        }}
      >
        {/* Big number */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          <TimerIcon
            size={32}
            color={timerColor}
            weight="duotone"
            style={{ alignSelf: "center", marginRight: 12 }}
          />
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: timerColor,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: -3,
              textShadow: `0 0 30px ${timerColor}40`,
              lineHeight: 1,
            }}
          >
            {timerValue}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: `${timerColor}90`,
              fontFamily: "'SF Mono', monospace",
              marginLeft: 4,
            }}
          >
            ms
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 500,
            height: 12,
            borderRadius: 6,
            background: "#1a1a2e",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${barProgress * 100}%`,
              height: "100%",
              borderRadius: 6,
              background: `linear-gradient(90deg, ${c.green}80, ${c.amber}80)`,
              boxShadow: `0 0 15px ${c.amber}30`,
            }}
          />
        </div>

        {/* Scale labels */}
        <div
          style={{
            width: 500,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: c.green, fontFamily: "'SF Mono', monospace" }}>
            0ms
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", fontFamily: "'SF Mono', monospace" }}>
            60ms
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.amber, fontFamily: "'SF Mono', monospace" }}>
            120ms
          </span>
        </div>
      </div>

      {/* Final range badge: "20 to 120 milliseconds" */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 36px",
          borderRadius: 12,
          background: `${c.green}08`,
          border: `1.5px solid ${c.green}25`,
          boxShadow: `0 0 ${finalGlow}px ${c.green}25`,
          opacity: rangeBadgeOp,
          transform: `scale(${rangeBadgeScale})`,
        }}
      >
        <LightningIcon size={28} color={c.green} weight="fill" style={{ filter: `drop-shadow(0 0 8px ${c.green}60)` }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            20 — 120 milliseconds
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#94a3b8",
            }}
          >
            Faster than a blink of an eye
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_TheResolution;
