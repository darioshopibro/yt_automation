import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  EnvelopeSimple,
  PhoneCall,
  Globe,
  ArrowRight,
  ArrowLeft,
  Lightning,
  ChartLineUp,
  GameController,
  ChatCircleDots,
  X,
  Check,
  ArrowsLeftRight,
  HardDrives,
  Browser,
} from "@phosphor-icons/react";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const colors = {
  http: "#3b82f6",
  ws: "#22c55e",
  accent: "#f59e0b",
  danger: "#ef4444",
  cyan: "#06b6d4",
  purple: "#a855f7",
};

// ─── SCENE 1: HTTP vs WebSocket Concept (frame 0–200) ───────────────────────

const HttpLetterDemo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const labelOp = interpolate(frame, [0, 15], [0, 1], clamp);
  const labelY = interpolate(frame, [0, 15], [20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Envelope travels right (request) f30-60
  const reqProgress = interpolate(frame, [30, 60], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const reqX = reqProgress * 280;
  const reqOp = frame >= 30 ? 1 : 0;

  // Response travels left f65-95
  const resProgress = interpolate(frame, [65, 95], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const resX = (1 - resProgress) * 280;
  const resOp = frame >= 65 && frame < 130 ? interpolate(frame, [65, 70], [0, 1], clamp) : 0;

  // Connection closed X mark f105+
  const closeOp = interpolate(frame, [105, 120], [0, 1], clamp);
  const closeScale = spring({ frame: Math.max(0, frame - 105), fps, config: { damping: 20, stiffness: 200 } });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, opacity: labelOp, transform: `translateY(${labelY}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <EnvelopeSimple size={36} color={colors.http} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${colors.http}60)` }} />
        <span style={{ fontSize: 28, fontWeight: 700, color: colors.http, fontFamily: "'SF Mono', monospace", letterSpacing: -0.5 }}>HTTP</span>
      </div>
      <span style={{ fontSize: 16, color: "#94a3b8", fontFamily: "'Inter', system-ui, sans-serif" }}>"Sending letters"</span>

      {/* Request/Response track */}
      <div style={{ width: 340, height: 120, position: "relative", background: `${colors.http}06`, borderRadius: 12, border: `1px solid ${colors.http}15`, padding: 16, marginTop: 8 }}>
        {/* Endpoints */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'SF Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>Client</span>
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'SF Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>Server</span>
        </div>

        {/* Track line */}
        <div style={{ width: "100%", height: 2, background: `${colors.http}20`, borderRadius: 1, marginTop: 8 }} />

        {/* Request packet */}
        <div style={{
          position: "absolute", top: 52, left: 20 + reqX,
          opacity: reqOp * (frame < 95 ? 1 : interpolate(frame, [95, 105], [1, 0], clamp)),
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <div style={{
            width: 32, height: 24, borderRadius: 6,
            background: colors.http,
            boxShadow: `0 0 12px ${colors.http}60`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ArrowRight size={14} color="#fff" weight="bold" />
          </div>
          <span style={{ fontSize: 10, color: colors.http, fontFamily: "'SF Mono', monospace" }}>REQ</span>
        </div>

        {/* Response packet */}
        <div style={{
          position: "absolute", top: 52, left: 20 + resX,
          opacity: resOp,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <div style={{
            width: 32, height: 24, borderRadius: 6,
            background: colors.accent,
            boxShadow: `0 0 12px ${colors.accent}60`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ArrowLeft size={14} color="#fff" weight="bold" />
          </div>
          <span style={{ fontSize: 10, color: colors.accent, fontFamily: "'SF Mono', monospace" }}>RES</span>
        </div>

        {/* Connection closed */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: `translateX(-50%) scale(${closeScale})`,
          opacity: closeOp,
          display: "flex", alignItems: "center", gap: 6,
          background: `${colors.danger}15`, borderRadius: 8, padding: "4px 12px",
          border: `1px solid ${colors.danger}30`,
        }}>
          <X size={14} color={colors.danger} weight="bold" />
          <span style={{ fontSize: 11, color: colors.danger, fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>CLOSED</span>
        </div>
      </div>
    </div>
  );
};

const WebSocketPhoneDemo: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const startF = 130;
  const labelOp = interpolate(frame, [startF, startF + 15], [0, 1], clamp);
  const labelY = interpolate(frame, [startF, startF + 15], [20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Bidirectional arrows pulsing f160+
  const arrowOp = interpolate(frame, [160, 175], [0, 1], clamp);
  const pulse = frame >= 160 ? 0.6 + 0.4 * Math.sin((frame - 160) * 0.15) : 0;

  // Data packets flowing both ways
  const flow1 = frame >= 170 ? ((frame - 170) % 40) / 40 : 0;
  const flow2 = frame >= 175 ? ((frame - 175) % 35) / 35 : 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, opacity: labelOp, transform: `translateY(${labelY}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PhoneCall size={36} color={colors.ws} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${colors.ws}60)` }} />
        <span style={{ fontSize: 28, fontWeight: 700, color: colors.ws, fontFamily: "'SF Mono', monospace", letterSpacing: -0.5 }}>WebSocket</span>
      </div>
      <span style={{ fontSize: 16, color: "#94a3b8", fontFamily: "'Inter', system-ui, sans-serif" }}>"Phone call"</span>

      {/* Bidirectional channel */}
      <div style={{ width: 340, height: 120, position: "relative", background: `${colors.ws}06`, borderRadius: 12, border: `1px solid ${colors.ws}15`, padding: 16, marginTop: 8, opacity: arrowOp }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'SF Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>Client</span>
          <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'SF Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 }}>Server</span>
        </div>

        {/* Two tracks — bidirectional */}
        <div style={{ width: "100%", height: 2, background: `${colors.ws}30`, borderRadius: 1, marginTop: 4 }} />
        <div style={{ width: "100%", height: 2, background: `${colors.ws}30`, borderRadius: 1, marginTop: 16 }} />

        {/* Flowing dot — client to server */}
        <div style={{
          position: "absolute", top: 50, left: 20 + flow1 * 280,
          width: 10, height: 10, borderRadius: "50%",
          background: colors.ws,
          boxShadow: `0 0 10px ${colors.ws}80`,
          opacity: pulse,
        }} />

        {/* Flowing dot — server to client */}
        <div style={{
          position: "absolute", top: 68, left: 300 - flow2 * 280,
          width: 10, height: 10, borderRadius: "50%",
          background: colors.cyan,
          boxShadow: `0 0 10px ${colors.cyan}80`,
          opacity: pulse,
        }} />

        {/* OPEN badge */}
        <div style={{
          position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 6,
          background: `${colors.ws}15`, borderRadius: 8, padding: "4px 12px",
          border: `1px solid ${colors.ws}30`,
        }}>
          <Check size={14} color={colors.ws} weight="bold" />
          <span style={{ fontSize: 11, color: colors.ws, fontFamily: "'SF Mono', monospace", fontWeight: 600 }}>OPEN</span>
        </div>
      </div>
    </div>
  );
};

// ─── SCENE 2: The Upgrade Process (frame 200–400) ───────────────────────────

const UpgradeScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 210;
  if (sceneFrame < 0) return null;

  const sceneOp = interpolate(frame, [200, 215], [0, 1], clamp);

  // Browser + Server boxes
  const boxOp = interpolate(sceneFrame, [0, 15], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const boxY = interpolate(sceneFrame, [0, 15], [20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // GET request line
  const getOp = interpolate(sceneFrame, [20, 30], [0, 1], clamp);

  // Headers appear one by one
  const h1Op = interpolate(sceneFrame, [40, 55], [0, 1], clamp);
  const h1Y = interpolate(sceneFrame, [40, 55], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const h2Op = interpolate(sceneFrame, [60, 75], [0, 1], clamp);
  const h2Y = interpolate(sceneFrame, [60, 75], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // 101 response
  const resOp = interpolate(sceneFrame, [90, 105], [0, 1], clamp);
  const resScale = spring({ frame: Math.max(0, sceneFrame - 90), fps, config: { damping: 20, stiffness: 200 } });

  // TRANSFORMATION — color morph from HTTP blue to WebSocket green
  const morphProgress = interpolate(sceneFrame, [115, 145], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const morphColor = morphProgress > 0
    ? `rgb(${Math.round(59 + (34 - 59) * morphProgress)}, ${Math.round(130 + (197 - 130) * morphProgress)}, ${Math.round(246 + (94 - 246) * morphProgress)})`
    : colors.http;
  const morphGlow = morphProgress > 0.3 ? interpolate(morphProgress, [0.3, 0.7, 1], [0, 25, 12], clamp) : 0;

  // "Same TCP socket" text
  const tcpOp = interpolate(sceneFrame, [150, 165], [0, 1], clamp);
  const tcpY = interpolate(sceneFrame, [150, 165], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32,
      opacity: sceneOp, padding: 80,
    }}>
      {/* Browser → Server */}
      <div style={{
        display: "flex", alignItems: "center", gap: 80,
        opacity: boxOp, transform: `translateY(${boxY}px)`,
      }}>
        {/* Browser */}
        <div style={{
          width: 200, padding: "20px 24px", borderRadius: 12,
          background: `${morphColor}10`,
          border: `1.5px solid ${morphColor}30`,
          boxShadow: `0 0 ${morphGlow}px ${morphColor}40`,
          display: "flex", alignItems: "center", gap: 12,
          transition: "none",
        }}>
          <Browser size={32} color={morphColor} weight="duotone" />
          <span style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>Browser</span>
        </div>

        {/* Arrow / connection between */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 300 }}>
          {/* GET request */}
          <div style={{
            opacity: getOp,
            fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.http,
            background: `${colors.http}10`, padding: "6px 16px", borderRadius: 8,
            border: `1px solid ${colors.http}20`,
          }}>
            GET / HTTP/1.1
          </div>

          {/* Headers */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <div style={{
              opacity: h1Op, transform: `translateY(${h1Y}px)`,
              fontSize: 13, fontFamily: "'SF Mono', monospace", color: colors.accent,
              background: `${colors.accent}10`, padding: "5px 14px", borderRadius: 8,
              border: `1px solid ${colors.accent}25`,
            }}>
              Upgrade: websocket
            </div>
            <div style={{
              opacity: h2Op, transform: `translateY(${h2Y}px)`,
              fontSize: 13, fontFamily: "'SF Mono', monospace", color: colors.accent,
              background: `${colors.accent}10`, padding: "5px 14px", borderRadius: 8,
              border: `1px solid ${colors.accent}25`,
            }}>
              Connection: Upgrade
            </div>
          </div>

          {/* 101 response */}
          <div style={{
            opacity: resOp, transform: `scale(${resScale})`,
            fontSize: 16, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: colors.ws,
            background: `${colors.ws}15`, padding: "8px 20px", borderRadius: 10,
            border: `1.5px solid ${colors.ws}35`,
            boxShadow: `0 0 20px ${colors.ws}30`,
            marginTop: 4,
          }}>
            101 Switching Protocols
          </div>
        </div>

        {/* Server */}
        <div style={{
          width: 200, padding: "20px 24px", borderRadius: 12,
          background: `${morphColor}10`,
          border: `1.5px solid ${morphColor}30`,
          boxShadow: `0 0 ${morphGlow}px ${morphColor}40`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <HardDrives size={32} color={morphColor} weight="duotone" />
          <span style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>Server</span>
        </div>
      </div>

      {/* "Same TCP socket, different protocol" */}
      <div style={{
        opacity: tcpOp, transform: `translateY(${tcpY}px)`,
        fontSize: 20, fontWeight: 600, color: "#94a3b8",
        fontFamily: "'Inter', system-ui, sans-serif",
        textAlign: "center",
      }}>
        Same TCP socket — <span style={{ color: colors.ws }}>different protocol</span>
      </div>
    </div>
  );
};

// ─── SCENE 3: The Payoff (frame 400–600) ─────────────────────────────────────

const PayoffScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 410;
  if (sceneFrame < 0) return null;

  const sceneOp = interpolate(frame, [400, 415], [0, 1], clamp);

  // Frames comparison — 2 bytes vs hundreds
  const framesOp = interpolate(sceneFrame, [0, 15], [0, 1], clamp);
  const framesY = interpolate(sceneFrame, [0, 15], [20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Bar widths animate
  const wsBarW = interpolate(sceneFrame, [15, 40], [0, 30], { ...clamp, easing: Easing.out(Easing.cubic) });
  const httpBarW = interpolate(sceneFrame, [25, 50], [0, 280], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Server push
  const pushOp = interpolate(sceneFrame, [55, 70], [0, 1], clamp);
  const pushY = interpolate(sceneFrame, [55, 70], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pushArrowX = frame >= 470 ? interpolate(sceneFrame, [65, 85], [0, 1], clamp) : 0;

  // Use cases stagger
  const useCases = [
    { label: "Stock prices", icon: ChartLineUp, color: colors.ws, delay: 0 },
    { label: "Multiplayer games", icon: GameController, color: colors.cyan, delay: 10 },
    { label: "Chat messages", icon: ChatCircleDots, color: colors.purple, delay: 20 },
  ];
  const ucBaseFrame = 95;

  // Final overhead stat
  const statOp = interpolate(sceneFrame, [140, 155], [0, 1], clamp);
  const statY = interpolate(sceneFrame, [140, 155], [20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Overhead bars — 600B vs 40KB
  const smallBarW = interpolate(sceneFrame, [155, 175], [0, 24], { ...clamp, easing: Easing.out(Easing.cubic) });
  const bigBarW = interpolate(sceneFrame, [160, 180], [0, 320], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 36,
      opacity: sceneOp, padding: 80,
    }}>
      {/* Header size comparison */}
      <div style={{ opacity: framesOp, transform: `translateY(${framesY}px)`, display: "flex", flexDirection: "column", gap: 16, width: 700 }}>
        <span style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 4 }}>
          Header overhead per message
        </span>

        {/* WebSocket bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.ws, width: 110, textAlign: "right" }}>WebSocket</span>
          <div style={{ flex: 1, height: 28, background: "#1a1a2e", borderRadius: 8, overflow: "hidden", position: "relative" }}>
            <div style={{
              width: wsBarW, height: "100%", borderRadius: 8,
              background: `linear-gradient(90deg, ${colors.ws}, ${colors.ws}80)`,
              boxShadow: `0 0 12px ${colors.ws}40`,
            }} />
          </div>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.ws, fontWeight: 700, width: 80 }}>2 bytes</span>
        </div>

        {/* HTTP bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.http, width: 110, textAlign: "right" }}>HTTP</span>
          <div style={{ flex: 1, height: 28, background: "#1a1a2e", borderRadius: 8, overflow: "hidden", position: "relative" }}>
            <div style={{
              width: httpBarW, height: "100%", borderRadius: 8,
              background: `linear-gradient(90deg, ${colors.http}, ${colors.http}80)`,
              boxShadow: `0 0 12px ${colors.http}40`,
            }} />
          </div>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.http, fontWeight: 700, width: 80 }}>400+ bytes</span>
        </div>
      </div>

      {/* Server push */}
      <div style={{
        opacity: pushOp, transform: `translateY(${pushY}px)`,
        display: "flex", alignItems: "center", gap: 20,
        background: `${colors.ws}08`, borderRadius: 12, padding: "14px 28px",
        border: `1px solid ${colors.ws}15`,
      }}>
        <HardDrives size={28} color={colors.ws} weight="duotone" />
        <div style={{
          width: 80, height: 2, background: `${colors.ws}30`, position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -4, left: pushArrowX * 60,
            width: 10, height: 10, borderRadius: "50%",
            background: colors.ws, boxShadow: `0 0 8px ${colors.ws}80`,
          }} />
        </div>
        <Lightning size={20} color={colors.accent} weight="fill" />
        <span style={{ fontSize: 15, color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
          Server pushes data <span style={{ color: "#64748b" }}>— no client request needed</span>
        </span>
      </div>

      {/* Use cases */}
      <div style={{ display: "flex", gap: 24 }}>
        {useCases.map((uc, i) => {
          const ucOp = interpolate(sceneFrame, [ucBaseFrame + uc.delay, ucBaseFrame + uc.delay + 15], [0, 1], clamp);
          const ucY = interpolate(sceneFrame, [ucBaseFrame + uc.delay, ucBaseFrame + uc.delay + 15], [20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
          const Icon = uc.icon;
          return (
            <div key={i} style={{
              opacity: ucOp, transform: `translateY(${ucY}px)`,
              display: "flex", alignItems: "center", gap: 10,
              background: `${uc.color}10`, borderRadius: 10, padding: "10px 20px",
              border: `1px solid ${uc.color}20`,
            }}>
              <Icon size={22} color={uc.color} weight="duotone" />
              <span style={{ fontSize: 15, fontWeight: 600, color: uc.color, fontFamily: "'Inter', system-ui, sans-serif" }}>{uc.label}</span>
            </div>
          );
        })}
      </div>

      {/* Final stat — 100 msg/sec comparison */}
      <div style={{
        opacity: statOp, transform: `translateY(${statY}px)`,
        display: "flex", flexDirection: "column", gap: 14, width: 700,
        background: `#ffffff06`, borderRadius: 12, padding: "20px 28px",
        border: "1px solid #1a1a2e",
      }}>
        <span style={{ fontSize: 14, color: "#64748b", fontFamily: "'Inter', system-ui, sans-serif" }}>
          At 100 messages/second:
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.ws, width: 110, textAlign: "right" }}>WebSocket</span>
          <div style={{ flex: 1, height: 22, background: "#1a1a2e", borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              width: smallBarW, height: "100%", borderRadius: 6,
              background: colors.ws, boxShadow: `0 0 10px ${colors.ws}40`,
            }} />
          </div>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.ws, fontWeight: 700, width: 90 }}>600 B/s</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.http, width: 110, textAlign: "right" }}>HTTP</span>
          <div style={{ flex: 1, height: 22, background: "#1a1a2e", borderRadius: 6, overflow: "hidden" }}>
            <div style={{
              width: bigBarW, height: "100%", borderRadius: 6,
              background: colors.http, boxShadow: `0 0 10px ${colors.http}40`,
            }} />
          </div>
          <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", color: colors.danger, fontWeight: 700, width: 90 }}>40 KB/s</span>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const Generated_HTTPvsWebSocket: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene transitions
  const scene1Op = interpolate(frame, [0, 10, 190, 210], [0, 1, 1, 0], clamp);
  const scene2Op = interpolate(frame, [200, 215, 390, 410], [0, 1, 1, 0], clamp);
  const scene3Op = interpolate(frame, [400, 415], [0, 1], clamp);

  return (
    <div style={{
      width: 1920, height: 1080,
      background: "#0f0f1a",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* SCENE 1: HTTP vs WebSocket concept */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 80, gap: 80,
        opacity: scene1Op,
      }}>
        <HttpLetterDemo frame={frame} fps={fps} />

        {/* VS divider */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: interpolate(frame, [130, 145], [0, 1], clamp),
        }}>
          <div style={{ width: 1, height: 80, background: "linear-gradient(transparent, #2a2a3e, transparent)" }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#4a4a5e", fontFamily: "'SF Mono', monospace" }}>VS</span>
          <div style={{ width: 1, height: 80, background: "linear-gradient(transparent, #2a2a3e, transparent)" }} />
        </div>

        <WebSocketPhoneDemo frame={frame} fps={fps} />
      </div>

      {/* SCENE 2: The Upgrade process */}
      <div style={{ position: "absolute", inset: 0, opacity: scene2Op }}>
        <UpgradeScene frame={frame} fps={fps} />
      </div>

      {/* SCENE 3: The Payoff */}
      <div style={{ position: "absolute", inset: 0, opacity: scene3Op }}>
        <PayoffScene frame={frame} fps={fps} />
      </div>
    </div>
  );
};

export default Generated_HTTPvsWebSocket;
