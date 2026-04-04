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

const colors = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#a855f7",
  cyan: "#06b6d4",
  pink: "#ec4899",
};

// Pipeline stages with their frame timings
const stages = [
  { id: "api", label: "API Edge", icon: "Lightning", color: colors.blue, startFrame: 45 },
  { id: "fraud", label: "Fraud Detection", icon: "ShieldCheck", color: colors.purple, startFrame: 90 },
  { id: "network", label: "Card Network", icon: "CreditCard", color: colors.amber, startFrame: 270 },
  { id: "bank", label: "Issuing Bank", icon: "Bank", color: colors.cyan, startFrame: 360 },
  { id: "settle", label: "Settlement", icon: "CheckCircle", color: colors.green, startFrame: 450 },
];

const Generated_StripePaymentFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === TITLE ===
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], clamp);
  const titleY = interpolate(frame, [0, 20], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // === PAY BUTTON ===
  const payOpacity = interpolate(frame, [30, 45], [0, 1], clamp);
  const payScale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // === PIPELINE NODES ===
  const getNodeAnim = (startFrame: number) => {
    const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], clamp);
    const y = interpolate(frame, [startFrame, startFrame + 15], [20, 0], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    });
    const scale = spring({
      frame: Math.max(0, frame - startFrame),
      fps,
      config: { damping: 22, stiffness: 200 },
    });
    return { opacity, y, scale };
  };

  // === CONNECTOR LINES between nodes ===
  const getLineProgress = (fromStageIdx: number) => {
    const nextStage = stages[fromStageIdx + 1];
    if (!nextStage) return 0;
    const lineStart = nextStage.startFrame - 15;
    return interpolate(frame, [lineStart, lineStart + 20], [0, 1], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    });
  };

  // === LATENCY BADGE ===
  const latencyOpacity = interpolate(frame, [55, 70], [0, 1], clamp);
  const latencyY = interpolate(frame, [55, 70], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // === FRAUD SCORE GAUGE ===
  const scoreProgress = interpolate(frame, [110, 160], [0, 0.15], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const gaugeOpacity = interpolate(frame, [100, 115], [0, 1], clamp);

  // === DECISION THRESHOLDS ===
  const thresholds = [
    { label: "> 0.8 — Blocked", color: colors.red, startFrame: 180 },
    { label: "0.3–0.8 — 3D Secure", color: colors.amber, startFrame: 205 },
    { label: "< 0.3 — Approved", color: colors.green, startFrame: 230 },
  ];

  // Score result highlight (0.15 = approved)
  const resultOpacity = interpolate(frame, [250, 265], [0, 1], clamp);
  const resultGlow = interpolate(frame, [250, 280], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // === CARD NETWORKS ===
  const networks = ["Visa", "Mastercard", "Amex"];
  const networkStart = 285;

  // === BANK CHECKS ===
  const bankChecks = [
    { label: "Sufficient funds", startFrame: 375 },
    { label: "Card not frozen", startFrame: 395 },
    { label: "Daily limit OK", startFrame: 415 },
  ];
  const authCodeOpacity = interpolate(frame, [440, 455], [0, 1], clamp);

  // === SETTLEMENT ACTIONS ===
  const settlementActions = [
    { label: "Merchant Dashboard", icon: "ChartBar", startFrame: 465 },
    { label: "Webhook Fired", icon: "WebhooksLogo", startFrame: 485 },
    { label: "Funds to Settlement", icon: "Money", startFrame: 505 },
  ];

  // === TIMING COMPARISON ===
  const timingOpacity = interpolate(frame, [540, 555], [0, 1], clamp);
  const fastBarWidth = interpolate(frame, [555, 585], [0, 120], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const slowBarWidth = interpolate(frame, [580, 620], [0, 500], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // === TRAVELING PULSE along pipeline ===
  const pulseStageIdx = frame < 90 ? 0 : frame < 270 ? 1 : frame < 360 ? 2 : frame < 450 ? 3 : 4;
  const pulseOpacity = interpolate(frame, [50, 60], [0, 1], clamp);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        padding: 80,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* TITLE */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 50,
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
          Stripe Payment Flow
        </span>
        <div
          style={{
            width: 60,
            height: 3,
            background: colors.blue,
            margin: "12px auto 0",
            borderRadius: 2,
            boxShadow: `0 0 12px ${colors.blue}60`,
          }}
        />
      </div>

      {/* PAY BUTTON (origin point) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
          opacity: payOpacity,
          transform: `scale(${payScale})`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 24px",
            background: `${colors.blue}15`,
            border: `1.5px solid ${colors.blue}30`,
            borderRadius: 10,
            boxShadow: `0 0 20px ${colors.blue}20`,
          }}
        >
          {React.createElement(getIcon("CursorClick"), {
            size: 22,
            color: colors.blue,
            weight: "duotone",
          })}
          <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>
            User clicks Pay
          </span>
        </div>
      </div>

      {/* PIPELINE TRACK */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flex: 1,
          gap: 0,
          position: "relative",
        }}
      >
        {stages.map((stage, idx) => {
          const anim = getNodeAnim(stage.startFrame);
          const isActive =
            frame >= stage.startFrame &&
            (idx === stages.length - 1 || frame < stages[idx + 1].startFrame);
          const isPast = !isActive && frame >= stage.startFrame;

          return (
            <div
              key={stage.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                opacity: anim.opacity,
                transform: `translateY(${anim.y}px)`,
                position: "relative",
              }}
            >
              {/* Node circle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: isActive
                    ? `linear-gradient(135deg, ${stage.color}25, ${stage.color}10)`
                    : `${stage.color}08`,
                  border: `1.5px solid ${isActive ? `${stage.color}50` : `${stage.color}20`}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isActive ? `0 0 25px ${stage.color}30` : "none",
                  transform: `scale(${anim.scale})`,
                  transition: "none",
                }}
              >
                {React.createElement(getIcon(stage.icon), {
                  size: 30,
                  color: stage.color,
                  weight: "duotone",
                  style: { filter: `drop-shadow(0 0 8px ${stage.color}60)` },
                })}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isActive ? "#e2e8f0" : isPast ? "#94a3b8" : "#64748b",
                  marginTop: 10,
                  fontFamily: "'SF Mono', monospace",
                  letterSpacing: 0.5,
                  textAlign: "center",
                }}
              >
                {stage.label}
              </span>

              {/* Connector line to next node */}
              {idx < stages.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 32,
                    left: "calc(50% + 40px)",
                    width: "calc(100% - 80px)",
                    height: 2,
                    background: `${stages[idx + 1].color}15`,
                    borderRadius: 1,
                  }}
                >
                  <div
                    style={{
                      width: `${getLineProgress(idx) * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${stage.color}60, ${stages[idx + 1].color}60)`,
                      borderRadius: 1,
                      boxShadow: `0 0 8px ${stage.color}30`,
                    }}
                  />
                  {/* Traveling pulse dot */}
                  {pulseStageIdx === idx && pulseOpacity > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -4,
                        left: `${getLineProgress(idx) * 100}%`,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: stage.color,
                        boxShadow: `0 0 12px ${stage.color}80`,
                        opacity: pulseOpacity,
                        transform: "translateX(-5px)",
                      }}
                    />
                  )}
                </div>
              )}

              {/* === STAGE-SPECIFIC DETAILS === */}
              <div style={{ marginTop: 20, width: "100%", maxWidth: 280 }}>
                {/* API: Latency badge */}
                {stage.id === "api" && (
                  <div
                    style={{
                      opacity: latencyOpacity,
                      transform: `translateY(${latencyY}px)`,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        background: `${colors.green}10`,
                        border: `1px solid ${colors.green}25`,
                        borderRadius: 8,
                      }}
                    >
                      {React.createElement(getIcon("Timer"), {
                        size: 16,
                        color: colors.green,
                        weight: "duotone",
                      })}
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: colors.green,
                          fontFamily: "'SF Mono', monospace",
                        }}
                      >
                        {"< 10ms"}
                      </span>
                    </div>
                  </div>
                )}

                {/* FRAUD: Score gauge + thresholds */}
                {stage.id === "fraud" && (
                  <div
                    style={{
                      opacity: gaugeOpacity,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {/* Score gauge bar */}
                    <div style={{ width: "100%", maxWidth: 220 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            fontFamily: "'SF Mono', monospace",
                          }}
                        >
                          ML Score
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: colors.green,
                            fontFamily: "'SF Mono', monospace",
                          }}
                        >
                          {scoreProgress.toFixed(2)}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 8,
                          background: "#1a1a2e",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${scoreProgress * 100}%`,
                            height: "100%",
                            background: `linear-gradient(90deg, ${colors.green}, ${colors.green})`,
                            borderRadius: 4,
                            boxShadow: `0 0 10px ${colors.green}40`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Decision thresholds */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        width: "100%",
                        maxWidth: 220,
                      }}
                    >
                      {thresholds.map((t, i) => {
                        const tOpacity = interpolate(
                          frame,
                          [t.startFrame, t.startFrame + 12],
                          [0, 1],
                          clamp
                        );
                        const tX = interpolate(
                          frame,
                          [t.startFrame, t.startFrame + 12],
                          [15, 0],
                          { ...clamp, easing: Easing.out(Easing.cubic) }
                        );
                        const isApproved = i === 2;
                        const highlight =
                          isApproved && resultOpacity > 0
                            ? resultGlow
                            : 0;
                        return (
                          <div
                            key={i}
                            style={{
                              opacity: tOpacity,
                              transform: `translateX(${tX}px)`,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "5px 10px",
                              background:
                                highlight > 0
                                  ? `${t.color}${Math.round(highlight * 20)
                                      .toString(16)
                                      .padStart(2, "0")}`
                                  : `${t.color}08`,
                              border: `1px solid ${t.color}${highlight > 0 ? "40" : "15"}`,
                              borderRadius: 8,
                              boxShadow:
                                highlight > 0
                                  ? `0 0 15px ${t.color}30`
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: t.color,
                                boxShadow:
                                  highlight > 0
                                    ? `0 0 8px ${t.color}80`
                                    : "none",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color:
                                  highlight > 0 ? "#e2e8f0" : "#94a3b8",
                                fontFamily: "'SF Mono', monospace",
                              }}
                            >
                              {t.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Score result badge */}
                    {resultOpacity > 0 && (
                      <div
                        style={{
                          opacity: resultOpacity,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 12px",
                          background: `${colors.green}15`,
                          border: `1px solid ${colors.green}30`,
                          borderRadius: 8,
                        }}
                      >
                        {React.createElement(getIcon("Check"), {
                          size: 16,
                          color: colors.green,
                          weight: "bold",
                        })}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: colors.green,
                            fontFamily: "'SF Mono', monospace",
                          }}
                        >
                          0.15 — Clean
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* CARD NETWORK: 3 network options */}
                {stage.id === "network" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {networks.map((net, i) => {
                      const nStart = networkStart + i * 15;
                      const nOpacity = interpolate(
                        frame,
                        [nStart, nStart + 12],
                        [0, 1],
                        clamp
                      );
                      const nScale = spring({
                        frame: Math.max(0, frame - nStart),
                        fps,
                        config: { damping: 22, stiffness: 200 },
                      });
                      return (
                        <div
                          key={net}
                          style={{
                            opacity: nOpacity,
                            transform: `scale(${nScale})`,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 14px",
                            background: `${colors.amber}08`,
                            border: `1px solid ${colors.amber}20`,
                            borderRadius: 8,
                            width: 160,
                          }}
                        >
                          {React.createElement(getIcon("CreditCard"), {
                            size: 16,
                            color: colors.amber,
                            weight: "duotone",
                          })}
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#e2e8f0",
                            }}
                          >
                            {net}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ISSUING BANK: 3 checks */}
                {stage.id === "bank" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {bankChecks.map((check, i) => {
                      const cOpacity = interpolate(
                        frame,
                        [check.startFrame, check.startFrame + 12],
                        [0, 1],
                        clamp
                      );
                      const checkScale = spring({
                        frame: Math.max(0, frame - check.startFrame),
                        fps,
                        config: { damping: 20, stiffness: 200 },
                      });
                      const passed = frame >= check.startFrame + 20;
                      return (
                        <div
                          key={i}
                          style={{
                            opacity: cOpacity,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 12px",
                            background: passed
                              ? `${colors.green}10`
                              : `${colors.cyan}08`,
                            border: `1px solid ${passed ? `${colors.green}30` : `${colors.cyan}15`}`,
                            borderRadius: 8,
                            width: 200,
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              background: passed
                                ? `${colors.green}20`
                                : "#1a1a2e",
                              border: `1.5px solid ${passed ? colors.green : "#2a2a3e"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transform: `scale(${checkScale})`,
                            }}
                          >
                            {passed &&
                              React.createElement(getIcon("Check"), {
                                size: 14,
                                color: colors.green,
                                weight: "bold",
                              })}
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: passed ? "#e2e8f0" : "#94a3b8",
                              fontFamily: "'SF Mono', monospace",
                            }}
                          >
                            {check.label}
                          </span>
                        </div>
                      );
                    })}

                    {/* Auth code badge */}
                    {authCodeOpacity > 0 && (
                      <div
                        style={{
                          opacity: authCodeOpacity,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 12px",
                          background: `${colors.green}12`,
                          border: `1px solid ${colors.green}30`,
                          borderRadius: 8,
                          boxShadow: `0 0 12px ${colors.green}20`,
                        }}
                      >
                        {React.createElement(getIcon("Key"), {
                          size: 16,
                          color: colors.green,
                          weight: "duotone",
                        })}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: colors.green,
                            fontFamily: "'SF Mono', monospace",
                          }}
                        >
                          AUTH CODE ✓
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* SETTLEMENT: 3 actions */}
                {stage.id === "settle" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {settlementActions.map((action, i) => {
                      const aOpacity = interpolate(
                        frame,
                        [action.startFrame, action.startFrame + 12],
                        [0, 1],
                        clamp
                      );
                      const aY = interpolate(
                        frame,
                        [action.startFrame, action.startFrame + 12],
                        [12, 0],
                        { ...clamp, easing: Easing.out(Easing.cubic) }
                      );
                      return (
                        <div
                          key={i}
                          style={{
                            opacity: aOpacity,
                            transform: `translateY(${aY}px)`,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "5px 12px",
                            background: `${colors.green}08`,
                            border: `1px solid ${colors.green}15`,
                            borderRadius: 8,
                            width: 220,
                          }}
                        >
                          {React.createElement(getIcon(action.icon), {
                            size: 16,
                            color: colors.green,
                            weight: "duotone",
                          })}
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#e2e8f0",
                            }}
                          >
                            {action.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TIMING COMPARISON — bottom */}
      <div
        style={{
          opacity: timingOpacity,
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "20px 40px",
          background: "#12121f",
          borderRadius: 12,
          border: "1px solid #1a1a2e",
        }}
      >
        {/* Fast bar: 1.2 seconds */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#94a3b8",
              fontFamily: "'SF Mono', monospace",
              width: 140,
              textAlign: "right",
            }}
          >
            Click → Confirm
          </span>
          <div
            style={{
              height: 24,
              width: fastBarWidth,
              background: `linear-gradient(90deg, ${colors.green}40, ${colors.green}80)`,
              borderRadius: 6,
              boxShadow: `0 0 12px ${colors.green}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 10,
              minWidth: fastBarWidth > 20 ? fastBarWidth : 0,
            }}
          >
            {fastBarWidth > 60 && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  fontFamily: "'SF Mono', monospace",
                  whiteSpace: "nowrap",
                }}
              >
                1.2s
              </span>
            )}
          </div>
        </div>

        {/* Slow bar: 2-3 business days */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#94a3b8",
              fontFamily: "'SF Mono', monospace",
              width: 140,
              textAlign: "right",
            }}
          >
            Actual $ Movement
          </span>
          <div
            style={{
              height: 24,
              width: slowBarWidth,
              background: `linear-gradient(90deg, ${colors.amber}30, ${colors.amber}60)`,
              borderRadius: 6,
              boxShadow: `0 0 12px ${colors.amber}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 10,
              minWidth: slowBarWidth > 20 ? slowBarWidth : 0,
            }}
          >
            {slowBarWidth > 120 && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  fontFamily: "'SF Mono', monospace",
                  whiteSpace: "nowrap",
                }}
              >
                2-3 business days (ACH)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_StripePaymentFlow;
