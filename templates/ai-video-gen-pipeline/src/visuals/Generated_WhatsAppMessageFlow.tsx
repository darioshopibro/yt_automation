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
  pink: "#ec4899",
  whatsapp: "#25D366",
};

// ─── SCENE 1: Online Message Path (0-350) ───
// ─── SCENE 2: Offline Path + Read Receipts (350-600) ───
// ─── SCENE 3: Scale Stats (600-900) ───

const Generated_WhatsAppMessageFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══════════════════════════════════════════
  // SCENE TRANSITIONS
  // ═══════════════════════════════════════════
  const scene1Opacity = interpolate(frame, [0, 15, 320, 350], [0, 1, 1, 0], clamp);
  const scene2Opacity = interpolate(frame, [340, 370, 570, 600], [0, 1, 1, 0], clamp);
  const scene3Opacity = interpolate(frame, [590, 620, 880, 900], [0, 1, 1, 1], clamp);

  // ═══════════════════════════════════════════
  // SCENE 1: ONLINE MESSAGE PATH
  // ═══════════════════════════════════════════

  // Title
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], clamp);
  const titleY = interpolate(frame, [0, 20], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Step 1: Typing "Hey" (frame 30-60)
  const typingText = "Hey";
  const charsVisible = Math.min(
    typingText.length,
    Math.floor(interpolate(frame, [35, 55], [0, typingText.length], clamp))
  );
  const phoneOpacity = interpolate(frame, [25, 40], [0, 1], clamp);
  const phoneY = interpolate(frame, [25, 40], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Step 2: Encryption (frame 70-110)
  const encryptOpacity = interpolate(frame, [70, 85], [0, 1], clamp);
  const encryptScale = spring({
    frame: Math.max(0, frame - 70),
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  const encryptLabelOpacity = interpolate(frame, [90, 105], [0, 1], clamp);

  // Step 3: Relay Server (frame 120-160)
  const serverOpacity = interpolate(frame, [120, 135], [0, 1], clamp);
  const serverScale = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  const latencyOpacity = interpolate(frame, [140, 155], [0, 1], clamp);

  // Step 4: Online check → push (frame 170-210)
  const checkOpacity = interpolate(frame, [170, 185], [0, 1], clamp);
  const checkY = interpolate(frame, [170, 185], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const pushOpacity = interpolate(frame, [195, 210], [0, 1], clamp);
  const pushX = interpolate(frame, [195, 210], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Step 5: Delivered to recipient (frame 220-250)
  const recipientOpacity = interpolate(frame, [220, 235], [0, 1], clamp);
  const recipientScale = spring({
    frame: Math.max(0, frame - 220),
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  const deliveredBadgeOpacity = interpolate(frame, [240, 255], [0, 1], clamp);

  // Step 6: Double checkmarks (frame 260-290)
  const check1Opacity = interpolate(frame, [260, 270], [0, 1], clamp);
  const check2Opacity = interpolate(frame, [275, 285], [0, 1], clamp);

  // ═══════════════════════════════════════════
  // SCENE 2: OFFLINE PATH + READ RECEIPTS
  // ═══════════════════════════════════════════

  // Offline server + queue (frame 360-400)
  const offlineServerOpacity = interpolate(frame, [355, 370], [0, 1], clamp);
  const queueOpacity = interpolate(frame, [380, 395], [0, 1], clamp);

  // Queued messages stacking (frame 400-440)
  const queuedMsgs = 4;
  const queueMsgCount = Math.floor(
    interpolate(frame, [400, 440], [0, queuedMsgs], clamp)
  );

  // 30 days badge (frame 420-440)
  const daysBadgeOpacity = interpolate(frame, [420, 435], [0, 1], clamp);

  // Recipient opens → messages flood (frame 450-480)
  const floodOpacity = interpolate(frame, [450, 465], [0, 1], clamp);
  const floodX = interpolate(frame, [450, 475], [-40, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Read receipt → blue checkmarks (frame 490-530)
  const blueCheck1 = interpolate(frame, [490, 500], [0, 1], clamp);
  const blueCheck2 = interpolate(frame, [505, 515], [0, 1], clamp);

  // Round trip badge (frame 530-560)
  const roundTripOpacity = interpolate(frame, [530, 545], [0, 1], clamp);
  const roundTripScale = spring({
    frame: Math.max(0, frame - 530),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // ═══════════════════════════════════════════
  // SCENE 3: SCALE STATS
  // ═══════════════════════════════════════════

  // Big number: 100 billion (frame 620-680)
  const billionCount = interpolate(frame, [630, 700], [0, 100], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const billionOpacity = interpolate(frame, [620, 640], [0, 1], clamp);

  // Per second: 1.15 million (frame 700-750)
  const perSecCount = interpolate(frame, [710, 760], [0, 1.15], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const perSecOpacity = interpolate(frame, [700, 720], [0, 1], clamp);

  // Stats grid (frame 760-840)
  const stats = [
    { label: "End-to-End Encrypted", icon: "LockSimple", color: c.green, startFrame: 760 },
    { label: "Delivery Receipts", icon: "Checks", color: c.blue, startFrame: 785 },
    { label: "Up to 4 Devices", icon: "DeviceMobile", color: c.purple, startFrame: 810 },
  ];

  // ═══════════════════════════════════════════
  // HELPER: Stage node
  // ═══════════════════════════════════════════
  const StageNode = ({
    icon,
    label,
    color,
    opacity,
    scale,
    y = 0,
    children,
    glow = false,
  }: {
    icon: string;
    label: string;
    color: string;
    opacity: number;
    scale: number;
    y?: number;
    children?: React.ReactNode;
    glow?: boolean;
  }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${color}25, ${color}10)`,
          border: `1.5px solid ${color}${glow ? "50" : "30"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: glow ? `0 0 25px ${color}40` : `0 0 15px ${color}15`,
          transform: `scale(${scale})`,
        }}
      >
        {React.createElement(getIcon(icon), {
          size: 30,
          color,
          weight: "duotone",
          style: { filter: `drop-shadow(0 0 8px ${color}60)` },
        })}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#e2e8f0",
          fontFamily: "'SF Mono', monospace",
          letterSpacing: 0.5,
          textAlign: "center",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );

  // ═══════════════════════════════════════════
  // HELPER: Connector pulse between stages
  // ═══════════════════════════════════════════
  const Connector = ({
    progress,
    color,
  }: {
    progress: number;
    color: string;
  }) => (
    <div
      style={{
        flex: 1,
        height: 2,
        background: `${color}12`,
        borderRadius: 1,
        alignSelf: "center",
        marginTop: -30,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}40, ${color}80)`,
          borderRadius: 1,
          boxShadow: `0 0 8px ${color}30`,
        }}
      />
      {progress > 0.05 && progress < 0.95 && (
        <div
          style={{
            position: "absolute",
            top: -4,
            left: `${progress * 100}%`,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 12px ${color}80`,
            transform: "translateX(-5px)",
          }}
        />
      )}
    </div>
  );

  // ═══════════════════════════════════════════
  // HELPER: Checkmarks
  // ═══════════════════════════════════════════
  const Checkmarks = ({
    op1,
    op2,
    color,
  }: {
    op1: number;
    op2: number;
    color: string;
  }) => (
    <div style={{ display: "flex", gap: 2 }}>
      <span
        style={{
          fontSize: 22,
          fontWeight: 800,
          color,
          opacity: op1,
          textShadow: `0 0 10px ${color}60`,
          fontFamily: "'SF Mono', monospace",
        }}
      >
        ✓
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 800,
          color,
          opacity: op2,
          textShadow: `0 0 10px ${color}60`,
          fontFamily: "'SF Mono', monospace",
          marginLeft: -6,
        }}
      >
        ✓
      </span>
    </div>
  );

  // Connector progress values for scene 1
  const conn1Progress = interpolate(frame, [85, 110], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const conn2Progress = interpolate(frame, [135, 160], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const conn3Progress = interpolate(frame, [185, 210], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const conn4Progress = interpolate(frame, [210, 235], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

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
      {/* ═══ SCENE 1: ONLINE PATH ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          opacity: scene1Opacity,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: 1,
              fontFamily: "'SF Mono', monospace",
              textTransform: "uppercase",
            }}
          >
            WhatsApp Message Flow
          </span>
          <div
            style={{
              width: 60,
              height: 3,
              background: c.whatsapp,
              margin: "12px auto 0",
              borderRadius: 2,
              boxShadow: `0 0 12px ${c.whatsapp}60`,
            }}
          />
        </div>

        {/* PIPELINE: Phone → Encrypt → Server → Check → Recipient */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 0,
            flex: 1,
          }}
        >
          {/* 1: Sender Phone */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              flex: 1,
              opacity: phoneOpacity,
              transform: `translateY(${phoneY}px)`,
            }}
          >
            <div
              style={{
                width: 80,
                height: 120,
                borderRadius: 14,
                background: "#12121f",
                border: `1.5px solid ${c.whatsapp}30`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: 8,
                boxShadow: `0 0 20px ${c.whatsapp}15`,
                position: "relative",
              }}
            >
              {/* Screen */}
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  borderRadius: 8,
                  background: "#0f0f1a",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: 6,
                  gap: 4,
                }}
              >
                {/* Chat bubble */}
                {charsVisible > 0 && (
                  <div
                    style={{
                      alignSelf: "flex-end",
                      background: `${c.whatsapp}25`,
                      borderRadius: 6,
                      padding: "3px 8px",
                      maxWidth: "90%",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#e2e8f0",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      {typingText.slice(0, charsVisible)}
                      {charsVisible < typingText.length && (
                        <span style={{ opacity: frame % 15 < 8 ? 1 : 0, color: c.whatsapp }}>|</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              You
            </span>
            {/* Checkmarks appear under sender */}
            <Checkmarks op1={check1Opacity} op2={check2Opacity} color="#94a3b8" />
          </div>

          <Connector progress={conn1Progress} color={c.whatsapp} />

          {/* 2: Encryption */}
          <StageNode
            icon="LockSimple"
            label="Signal Protocol"
            color={c.green}
            opacity={encryptOpacity}
            scale={encryptScale}
            glow={frame >= 70 && frame < 120}
          >
            {encryptLabelOpacity > 0 && (
              <div
                style={{
                  opacity: encryptLabelOpacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  background: `${c.green}10`,
                  border: `1px solid ${c.green}20`,
                  borderRadius: 8,
                }}
              >
                {React.createElement(getIcon("ShieldCheck"), {
                  size: 14,
                  color: c.green,
                  weight: "duotone",
                })}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.green,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  256-bit AES
                </span>
              </div>
            )}
          </StageNode>

          <Connector progress={conn2Progress} color={c.blue} />

          {/* 3: Relay Server */}
          <StageNode
            icon="CloudArrowUp"
            label="Relay Server"
            color={c.blue}
            opacity={serverOpacity}
            scale={serverScale}
            glow={frame >= 120 && frame < 200}
          >
            {latencyOpacity > 0 && (
              <div
                style={{
                  opacity: latencyOpacity,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  background: `${c.cyan}10`,
                  border: `1px solid ${c.cyan}20`,
                  borderRadius: 8,
                }}
              >
                {React.createElement(getIcon("Timer"), {
                  size: 14,
                  color: c.cyan,
                  weight: "duotone",
                })}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.cyan,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  ~30ms
                </span>
              </div>
            )}
          </StageNode>

          <Connector progress={conn3Progress} color={c.amber} />

          {/* 4: Online Check */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              flex: 1,
              opacity: checkOpacity,
              transform: `translateY(${checkY}px)`,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${c.amber}25, ${c.amber}10)`,
                border: `1.5px solid ${c.amber}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${c.amber}25`,
              }}
            >
              {React.createElement(getIcon("WifiHigh"), {
                size: 30,
                color: c.amber,
                weight: "duotone",
                style: { filter: `drop-shadow(0 0 8px ${c.amber}60)` },
              })}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Online?
            </span>

            {/* "Yes → Push" badge */}
            {pushOpacity > 0 && (
              <div
                style={{
                  opacity: pushOpacity,
                  transform: `translateX(${pushX}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  background: `${c.green}10`,
                  border: `1px solid ${c.green}25`,
                  borderRadius: 8,
                }}
              >
                {React.createElement(getIcon("ArrowRight"), {
                  size: 14,
                  color: c.green,
                  weight: "bold",
                })}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.green,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  Push Direct
                </span>
              </div>
            )}
          </div>

          <Connector progress={conn4Progress} color={c.whatsapp} />

          {/* 5: Recipient Phone */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              flex: 1,
              opacity: recipientOpacity,
              transform: `scale(${recipientScale})`,
            }}
          >
            <div
              style={{
                width: 80,
                height: 120,
                borderRadius: 14,
                background: "#12121f",
                border: `1.5px solid ${c.whatsapp}30`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: 8,
                boxShadow: `0 0 20px ${c.whatsapp}15`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  flex: 1,
                  borderRadius: 8,
                  background: "#0f0f1a",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: 6,
                }}
              >
                {recipientOpacity > 0.5 && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      background: `${c.blue}15`,
                      borderRadius: 6,
                      padding: "3px 8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#e2e8f0",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      Hey
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Recipient
            </span>
            {/* Delivered badge */}
            {deliveredBadgeOpacity > 0 && (
              <div
                style={{
                  opacity: deliveredBadgeOpacity,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  background: `${c.green}10`,
                  border: `1px solid ${c.green}25`,
                  borderRadius: 8,
                }}
              >
                {React.createElement(getIcon("Lightning"), {
                  size: 14,
                  color: c.green,
                  weight: "duotone",
                })}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: c.green,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {"< 100ms"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SCENE 2: OFFLINE PATH + READ RECEIPTS ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          opacity: scene2Opacity,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: 1,
              fontFamily: "'SF Mono', monospace",
              textTransform: "uppercase",
            }}
          >
            Offline Path & Receipts
          </span>
          <div
            style={{
              width: 60,
              height: 3,
              background: c.amber,
              margin: "12px auto 0",
              borderRadius: 2,
              boxShadow: `0 0 12px ${c.amber}60`,
            }}
          />
        </div>

        {/* Main content — 3 columns */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flex: 1,
            gap: 60,
          }}
        >
          {/* LEFT: Server + Offline check */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              opacity: offlineServerOpacity,
            }}
          >
            <StageNode
              icon="CloudArrowUp"
              label="Relay Server"
              color={c.blue}
              opacity={1}
              scale={1}
              glow
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background: `${c.red}10`,
                border: `1px solid ${c.red}25`,
                borderRadius: 8,
              }}
            >
              {React.createElement(getIcon("WifiSlash"), {
                size: 14,
                color: c.red,
                weight: "duotone",
              })}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: c.red,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                Recipient Offline
              </span>
            </div>
          </div>

          {/* CENTER: Message Queue */}
          <div
            style={{
              flex: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              opacity: queueOpacity,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#94a3b8",
                fontFamily: "'SF Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Message Queue
            </span>

            {/* Stacking messages */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: 280,
              }}
            >
              {Array.from({ length: queuedMsgs }).map((_, i) => {
                const visible = i < queueMsgCount;
                const msgOpacity = visible ? 1 : 0;
                return (
                  <div
                    key={i}
                    style={{
                      opacity: msgOpacity,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 16px",
                      background: `${c.amber}08`,
                      border: `1px solid ${c.amber}15`,
                      borderRadius: 10,
                    }}
                  >
                    {React.createElement(getIcon("EnvelopeSimple"), {
                      size: 18,
                      color: c.amber,
                      weight: "duotone",
                    })}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e2e8f0",
                        fontFamily: "'SF Mono', monospace",
                      }}
                    >
                      Queued message {i + 1}
                    </span>
                    {React.createElement(getIcon("Clock"), {
                      size: 14,
                      color: "#64748b",
                      weight: "duotone",
                      style: { marginLeft: "auto" },
                    })}
                  </div>
                );
              })}
            </div>

            {/* 30 days badge */}
            {daysBadgeOpacity > 0 && (
              <div
                style={{
                  opacity: daysBadgeOpacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 18px",
                  background: `${c.amber}12`,
                  border: `1px solid ${c.amber}30`,
                  borderRadius: 10,
                  boxShadow: `0 0 15px ${c.amber}15`,
                }}
              >
                {React.createElement(getIcon("HourglassMedium"), {
                  size: 18,
                  color: c.amber,
                  weight: "duotone",
                })}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: c.amber,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  Waits up to 30 days
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Recipient opens + flood + blue checks */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Recipient opens */}
            <div
              style={{
                opacity: floodOpacity,
                transform: `translateX(${floodX}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <StageNode
                icon="DeviceMobile"
                label="Opens WhatsApp"
                color={c.whatsapp}
                opacity={1}
                scale={1}
                glow
              />

              {/* Flood indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  background: `${c.whatsapp}10`,
                  border: `1px solid ${c.whatsapp}25`,
                  borderRadius: 8,
                }}
              >
                {React.createElement(getIcon("ArrowsIn"), {
                  size: 14,
                  color: c.whatsapp,
                  weight: "bold",
                })}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: c.whatsapp,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  Messages flood in
                </span>
              </div>
            </div>

            {/* Read receipt + blue checks */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#94a3b8",
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                Read Receipt Sent
              </span>
              <Checkmarks op1={blueCheck1} op2={blueCheck2} color={c.blue} />
            </div>

            {/* Round trip badge */}
            {roundTripOpacity > 0 && (
              <div
                style={{
                  opacity: roundTripOpacity,
                  transform: `scale(${roundTripScale})`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  background: `${c.green}12`,
                  border: `1.5px solid ${c.green}35`,
                  borderRadius: 10,
                  boxShadow: `0 0 20px ${c.green}20`,
                  marginTop: 12,
                }}
              >
                {React.createElement(getIcon("Lightning"), {
                  size: 20,
                  color: c.green,
                  weight: "duotone",
                })}
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: c.green,
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {"< 200ms round trip"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SCENE 3: SCALE STATS ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          opacity: scene3Opacity,
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#94a3b8",
              fontFamily: "'SF Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            WhatsApp Scale
          </span>
        </div>

        {/* Big number: 100 BILLION */}
        <div
          style={{
            opacity: billionOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: c.whatsapp,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: -3,
              textShadow: `0 0 40px ${c.whatsapp}40`,
              lineHeight: 1,
            }}
          >
            {Math.round(billionCount)}B
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#94a3b8",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            messages per day
          </span>
        </div>

        {/* Per second number */}
        <div
          style={{
            opacity: perSecOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: c.cyan,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: -2,
              textShadow: `0 0 30px ${c.cyan}40`,
              lineHeight: 1,
            }}
          >
            {perSecCount.toFixed(2)}M
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#94a3b8",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            messages per second
          </span>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
          }}
        >
          {stats.map((stat, i) => {
            const sOpacity = interpolate(
              frame,
              [stat.startFrame, stat.startFrame + 15],
              [0, 1],
              clamp
            );
            const sY = interpolate(
              frame,
              [stat.startFrame, stat.startFrame + 15],
              [15, 0],
              { ...clamp, easing: Easing.out(Easing.cubic) }
            );
            return (
              <div
                key={i}
                style={{
                  opacity: sOpacity,
                  transform: `translateY(${sY}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 24px",
                  background: `${stat.color}08`,
                  border: `1px solid ${stat.color}20`,
                  borderRadius: 12,
                  boxShadow: `0 0 15px ${stat.color}10`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}08)`,
                    border: `1.5px solid ${stat.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 15px ${stat.color}15`,
                  }}
                >
                  {React.createElement(getIcon(stat.icon), {
                    size: 24,
                    color: stat.color,
                    weight: "duotone",
                    style: { filter: `drop-shadow(0 0 8px ${stat.color}60)` },
                  })}
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#e2e8f0",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Generated_WhatsAppMessageFlow;
