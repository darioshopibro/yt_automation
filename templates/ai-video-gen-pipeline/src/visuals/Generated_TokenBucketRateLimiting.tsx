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

// ─── SCENE 1: Token Bucket Core ──────────────────────────────────────────────

const Scene1TokenBucket: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();

  // Phase markers (localFrame)
  const TITLE = 0;
  const BUCKET_IN = 25;
  const FILL_START = 60;
  const FILL_END = 100;
  const STATS_START = 105;
  const DRIP_START = 120;
  const REQUESTS_START = 190;
  const DRAIN_END = 340;
  const BADGE_START = 348;
  const BURST_LABEL = 390;

  // Title
  const titleOp = interpolate(f, [TITLE, TITLE + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(f, [TITLE, TITLE + 20], [24, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Bucket container
  const bucketOp = interpolate(f, [BUCKET_IN, BUCKET_IN + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const bucketScale = spring({ frame: f - BUCKET_IN, fps, config: { damping: 22, stiffness: 200 } });

  // Token fill level 0–100
  let tokenLevel: number;
  if (f < FILL_START) tokenLevel = 0;
  else if (f < FILL_END) {
    tokenLevel = interpolate(f, [FILL_START, FILL_END], [0, 100], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
  } else if (f < REQUESTS_START) tokenLevel = 100;
  else if (f < DRAIN_END) {
    tokenLevel = interpolate(f, [REQUESTS_START, DRAIN_END], [100, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
  } else tokenLevel = 0;

  const tokenCount = Math.round(tokenLevel);
  const fillColor =
    tokenLevel > 50 ? "#22c55e" : tokenLevel > 20 ? "#f59e0b" : "#ef4444";

  // Drip pulse every 30 frames
  const dripPulse =
    f >= DRIP_START && f < DRAIN_END
      ? interpolate((f - DRIP_START) % 30, [0, 8, 30], [0, 1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        })
      : 0;

  // Stats panel
  const statsOp = interpolate(f, [STATS_START, STATS_START + 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Requests underway
  const isRequesting = f >= REQUESTS_START && f < DRAIN_END;
  const reqOp = interpolate(f, [REQUESTS_START, REQUESTS_START + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // 429 badge
  const badgeOp = interpolate(f, [BADGE_START, BADGE_START + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const badgeScale = spring({ frame: f - BADGE_START, fps, config: { damping: 18, stiffness: 260 } });

  // Burst label
  const burstOp = interpolate(f, [BURST_LABEL, BURST_LABEL + 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const DropIcon = getIcon("Drop");
  const ArrowDownIcon = getIcon("ArrowDown");
  const CursorClick = getIcon("CursorClick");
  const CheckCircle = getIcon("CheckCircle");
  const XCircle = getIcon("XCircle");
  const Lightning = getIcon("Lightning");

  const statCard = (
    icon: React.FC<any>,
    color: string,
    label: string,
    value: string,
    delay: number
  ) => {
    const op = interpolate(f, [STATS_START + delay, STATS_START + delay + 20], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const tx = interpolate(f, [STATS_START + delay, STATS_START + delay + 20], [20, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const Icon = icon;
    return (
      <div key={label} style={{
        opacity: op,
        transform: `translateX(${tx}px)`,
        background: `${color}08`,
        border: `1px solid ${color}20`,
        borderRadius: 12,
        padding: "16px 20px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1.5px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={24} color={color} weight="duotone" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", fontFamily: "'SF Mono', monospace", marginTop: 2 }}>{value}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: 1920, height: 1080,
      background: "#0f0f1a",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 36, padding: 80,
    }}>
      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, textAlign: "center" }}>
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#3b82f6",
          textTransform: "uppercase", marginBottom: 10,
        }}>
          API Protection
        </div>
        <div style={{ fontSize: 46, fontWeight: 700, color: "#e2e8f0" }}>
          Token Bucket Algorithm
        </div>
      </div>

      {/* Bucket + Stats */}
      <div style={{
        display: "flex", gap: 80, alignItems: "center",
        opacity: bucketOp,
        transform: `scale(${Math.min(bucketScale, 1)})`,
      }}>

        {/* ── Bucket visualization ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

          {/* Drip indicator */}
          <div style={{
            height: 50, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: f >= DRIP_START && f < DRAIN_END ? 1 : 0,
          }}>
            <div style={{
              background: `#22c55e${Math.round(dripPulse * 25 + 8).toString(16).padStart(2, "0")}`,
              border: "1px solid #22c55e30",
              borderRadius: 8, padding: "6px 18px",
              color: "#22c55e", fontSize: 14, fontWeight: 700,
              boxShadow: `0 0 ${dripPulse * 20}px #22c55e40`,
            }}>
              +10 tokens / second
            </div>
          </div>

          {/* The bucket */}
          <div style={{
            width: 280, height: 400,
            borderRadius: "10px 10px 36px 36px",
            border: `2px solid ${fillColor}35`,
            background: "#08081a",
            overflow: "hidden",
            position: "relative",
            boxShadow: `0 0 50px ${fillColor}18`,
          }}>
            {/* Fill level */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: `${tokenLevel}%`,
              background: `linear-gradient(180deg, ${fillColor}28 0%, ${fillColor}65 100%)`,
              borderTop: `2px solid ${fillColor}70`,
            }} />

            {/* Token count */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: 76, fontWeight: 800, fontFamily: "'SF Mono', monospace",
                letterSpacing: -2,
                color: tokenLevel > 0 ? "#e2e8f0" : "#3a3a4e",
                textShadow: tokenLevel > 0 ? `0 0 40px ${fillColor}50` : "none",
              }}>
                {tokenCount}
              </div>
              <div style={{
                fontSize: 12, fontWeight: 700, letterSpacing: 2,
                textTransform: "uppercase",
                color: tokenLevel > 0 ? "#64748b" : "#2a2a3e",
              }}>
                tokens
              </div>
            </div>

            {/* 429 badge */}
            {f >= BADGE_START && (
              <div style={{
                position: "absolute", top: "32%", left: "50%",
                transform: `translate(-50%, -50%) scale(${Math.min(badgeScale, 1)})`,
                opacity: badgeOp,
                background: "#ef444412",
                border: "2px solid #ef4444",
                borderRadius: 14, padding: "14px 28px",
                textAlign: "center",
                boxShadow: "0 0 40px #ef444455",
                zIndex: 10,
              }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#ef4444" }}>429</div>
                <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  Too Many Requests
                </div>
              </div>
            )}
          </div>

          {/* Request cost label */}
          <div style={{
            height: 44, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: isRequesting ? reqOp : 0,
          }}>
            {isRequesting && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                color: f >= BADGE_START ? "#ef4444" : "#f59e0b",
                fontSize: 14, fontWeight: 600,
              }}>
                {f >= BADGE_START
                  ? <XCircle size={16} color="#ef4444" weight="duotone" />
                  : <CheckCircle size={16} color="#f59e0b" weight="duotone" />
                }
                {f >= BADGE_START ? "Bucket empty — request rejected" : "−1 token per request"}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats panel ── */}
        <div style={{ opacity: statsOp, display: "flex", flexDirection: "column", gap: 16, width: 380 }}>
          {statCard(DropIcon, "#3b82f6", "Bucket Capacity", "100 tokens", 0)}
          {statCard(ArrowDownIcon, "#22c55e", "Refill Rate", "+10 / second", 14)}
          {statCard(CursorClick, "#f59e0b", "Cost per Request", "1 token", 28)}

          {/* Dynamic status card */}
          {f >= REQUESTS_START && (
            <div style={{
              opacity: reqOp,
              background: f >= BADGE_START ? "#ef444410" : "#22c55e10",
              border: `1px solid ${f >= BADGE_START ? "#ef444440" : "#22c55e40"}`,
              borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16,
              boxShadow: f >= BADGE_START ? "0 0 20px #ef444420" : "0 0 20px #22c55e20",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11,
                background: f >= BADGE_START
                  ? "linear-gradient(135deg, #ef444420, #ef444408)"
                  : "linear-gradient(135deg, #22c55e20, #22c55e08)",
                border: f >= BADGE_START ? "1.5px solid #ef444430" : "1.5px solid #22c55e30",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {f >= BADGE_START
                  ? <XCircle size={24} color="#ef4444" weight="duotone" />
                  : <CheckCircle size={24} color="#22c55e" weight="duotone" />
                }
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Request Status</div>
                <div style={{
                  fontSize: 20, fontWeight: 700, fontFamily: "'SF Mono', monospace", marginTop: 2,
                  color: f >= BADGE_START ? "#ef4444" : "#22c55e",
                }}>
                  {f >= BADGE_START ? "REJECTED" : "ACCEPTED"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Burst label */}
      {f >= BURST_LABEL && (
        <div style={{
          opacity: burstOp,
          background: "#3b82f610", border: "1px solid #3b82f630",
          borderRadius: 10, padding: "12px 28px",
          display: "flex", alignItems: "center", gap: 10,
          color: "#3b82f6", fontSize: 15, fontWeight: 600,
        }}>
          <Lightning size={20} color="#3b82f6" weight="duotone" />
          Burst traffic is fine — use all 100 tokens instantly, then limited to 10/sec as tokens refill
        </div>
      )}
    </div>
  );
};

// ─── SCENE 2: Stripe Rate Limits ─────────────────────────────────────────────

const Scene2Stripe: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();

  const TITLE = 0;
  const COLS = 35;
  const LIMIT_HIT = 130;
  const RETRY_HEADER = 195;

  const titleOp = interpolate(f, [TITLE, TITLE + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(f, [TITLE, TITLE + 20], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const testOp = interpolate(f, [COLS, COLS + 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const testY = interpolate(f, [COLS, COLS + 25], [30, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const liveOp = interpolate(f, [COLS + 20, COLS + 45], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const liveY = interpolate(f, [COLS + 20, COLS + 45], [30, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const limitOp = interpolate(f, [LIMIT_HIT, LIMIT_HIT + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const limitScale = spring({ frame: f - LIMIT_HIT, fps, config: { damping: 20, stiffness: 240 } });

  const retryOp = interpolate(f, [RETRY_HEADER, RETRY_HEADER + 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const retryY = interpolate(f, [RETRY_HEADER, RETRY_HEADER + 25], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const Buildings = getIcon("Buildings");
  const Warning = getIcon("Warning");
  const Clock = getIcon("Clock");

  return (
    <div style={{
      width: 1920, height: 1080,
      background: "#0f0f1a",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 44, padding: 80,
    }}>
      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, textAlign: "center" }}>
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#a855f7",
          textTransform: "uppercase", marginBottom: 10,
        }}>
          Real World Example
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
          <Buildings size={38} color="#a855f7" weight="duotone" />
          <div style={{ fontSize: 44, fontWeight: 700, color: "#e2e8f0" }}>Stripe API Rate Limits</div>
        </div>
      </div>

      {/* TEST vs LIVE columns */}
      <div style={{ display: "flex", gap: 48, alignItems: "stretch" }}>
        {/* Test Mode */}
        <div style={{
          opacity: testOp, transform: `translateY(${testY}px)`,
          background: "#3b82f608", border: "1.5px solid #3b82f625",
          borderRadius: 16, padding: "36px 52px",
          textAlign: "center", width: 360,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: "#3b82f6", textTransform: "uppercase", marginBottom: 20,
          }}>
            Test Mode
          </div>
          <div style={{
            fontSize: 70, fontWeight: 800, color: "#3b82f6",
            fontFamily: "'SF Mono', monospace", letterSpacing: -2,
            textShadow: "0 0 40px #3b82f640",
          }}>
            100
          </div>
          <div style={{ fontSize: 16, color: "#94a3b8", fontWeight: 600, marginTop: 10 }}>requests / second</div>
          <div style={{ fontSize: 12, color: "#4a4a5e", marginTop: 6 }}>per API key</div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: "#1a1a2e", alignSelf: "stretch" }} />

        {/* Live Mode */}
        <div style={{
          opacity: liveOp, transform: `translateY(${liveY}px)`,
          background: "#22c55e08", border: "1.5px solid #22c55e25",
          borderRadius: 16, padding: "36px 52px",
          textAlign: "center", width: 360,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2,
            color: "#22c55e", textTransform: "uppercase", marginBottom: 20,
          }}>
            Live Mode
          </div>
          <div style={{
            fontSize: 70, fontWeight: 800, color: "#22c55e",
            fontFamily: "'SF Mono', monospace", letterSpacing: -2,
            textShadow: "0 0 40px #22c55e40",
          }}>
            10,000
          </div>
          <div style={{ fontSize: 16, color: "#94a3b8", fontWeight: 600, marginTop: 10 }}>requests / second</div>
          <div style={{ fontSize: 12, color: "#4a4a5e", marginTop: 6 }}>per API key</div>
        </div>
      </div>

      {/* Limit hit alert */}
      {f >= LIMIT_HIT && (
        <div style={{
          opacity: limitOp,
          transform: `scale(${Math.min(limitScale, 1)})`,
          display: "flex", alignItems: "center", gap: 12,
          background: "#ef444410", border: "1px solid #ef444430",
          borderRadius: 12, padding: "12px 28px",
        }}>
          <Warning size={20} color="#ef4444" weight="duotone" />
          <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 15 }}>Hit the limit?</span>
          <span style={{ color: "#94a3b8", fontSize: 15, marginLeft: 4 }}>HTTP 429 — plus a Retry-After header</span>
        </div>
      )}

      {/* Retry-After HTTP response */}
      {f >= RETRY_HEADER && (
        <div style={{
          opacity: retryOp, transform: `translateY(${retryY}px)`,
          background: "#12121f", border: "1px solid #1a1a2e",
          borderRadius: 14, padding: "22px 32px", width: 580,
          fontFamily: "'SF Mono', monospace",
        }}>
          <div style={{
            fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Clock size={14} color="#64748b" weight="duotone" />
            HTTP Response Headers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div>
              <span style={{ color: "#f59e0b", fontSize: 14, fontWeight: 600 }}>HTTP/1.1 </span>
              <span style={{ color: "#ef4444", fontSize: 14, fontWeight: 700 }}>429 Too Many Requests</span>
            </div>
            <div>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>Retry-After: </span>
              <span style={{ color: "#22c55e", fontSize: 14, fontWeight: 700 }}>5</span>
              <span style={{ color: "#64748b", fontSize: 14 }}> seconds</span>
            </div>
            <div>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>X-RateLimit-Limit: </span>
              <span style={{ color: "#3b82f6", fontSize: 14, fontWeight: 700 }}>100</span>
            </div>
            <div>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>X-RateLimit-Remaining: </span>
              <span style={{ color: "#ef4444", fontSize: 14, fontWeight: 700 }}>0</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SCENE 3: Sliding Window + Redis ─────────────────────────────────────────

const Scene3SlidingWindow: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();

  const TITLE = 0;
  const WINDOW_IN = 35;
  const COUNT_START = 80;
  const HIT_LIMIT = 210;
  const REDIS_START = 265;
  const REDIS_CMD2 = 315;
  const PERF_START = 340;
  const FINAL = 385;

  const titleOp = interpolate(f, [TITLE, TITLE + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(f, [TITLE, TITLE + 20], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const windowOp = interpolate(f, [WINDOW_IN, WINDOW_IN + 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Request count 0 → 600 → 673
  let requestCount: number;
  if (f < COUNT_START) requestCount = 0;
  else if (f < HIT_LIMIT) {
    requestCount = Math.round(
      interpolate(f, [COUNT_START, HIT_LIMIT], [0, 600], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      })
    );
  } else {
    requestCount = Math.round(
      interpolate(f, [HIT_LIMIT, HIT_LIMIT + 40], [600, 673], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    );
  }

  const isOverLimit = f >= HIT_LIMIT;
  const fillPct = Math.min(requestCount / 600, 1.12);
  const barColor =
    fillPct < 0.55 ? "#3b82f6" : fillPct < 0.85 ? "#f59e0b" : "#ef4444";

  const blockedOp = interpolate(f, [HIT_LIMIT, HIT_LIMIT + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const blockedScale = spring({ frame: f - HIT_LIMIT, fps, config: { damping: 18, stiffness: 250 } });

  const noburstOp = interpolate(f, [HIT_LIMIT + 10, HIT_LIMIT + 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const redisOp = interpolate(f, [REDIS_START, REDIS_START + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const redisY = interpolate(f, [REDIS_START, REDIS_START + 20], [20, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const cmd2Op = interpolate(f, [REDIS_CMD2, REDIS_CMD2 + 18], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cmd2Y = interpolate(f, [REDIS_CMD2, REDIS_CMD2 + 18], [14, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const perfOp = interpolate(f, [PERF_START, PERF_START + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const finalOp = interpolate(f, [FINAL, FINAL + 25], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const ChartBar = getIcon("ChartBar");
  const Database = getIcon("Database");
  const ClockCC = getIcon("ClockCounterClockwise");
  const Lightning = getIcon("Lightning");

  return (
    <div style={{
      width: 1920, height: 1080,
      background: "#0f0f1a",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 36, padding: 80,
    }}>
      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, textAlign: "center" }}>
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 3, color: "#06b6d4",
          textTransform: "uppercase", marginBottom: 10,
        }}>
          Alternative Approach
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
          <ChartBar size={36} color="#06b6d4" weight="duotone" />
          <div style={{ fontSize: 44, fontWeight: 700, color: "#e2e8f0" }}>Sliding Window</div>
        </div>
      </div>

      {/* Window bar */}
      <div style={{ opacity: windowOp, width: 860 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{
            fontSize: 12, color: "#64748b", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <ClockCC size={14} color="#64748b" weight="duotone" />
            Last 60 seconds
          </div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Limit: 600 requests</div>
        </div>

        {/* Track */}
        <div style={{
          width: 860, height: 28,
          background: "#12121f", border: "1px solid #1a1a2e",
          borderRadius: 8, overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: `${Math.min(fillPct, 1) * 100}%`,
            background: `linear-gradient(90deg, ${barColor}55, ${barColor}85)`,
            borderRadius: "8px 0 0 8px",
            boxShadow: isOverLimit ? `0 0 20px ${barColor}60` : "none",
          }} />
        </div>

        {/* Counter row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontSize: 52, fontWeight: 800, fontFamily: "'SF Mono', monospace",
              letterSpacing: -1,
              color: isOverLimit ? "#ef4444" : "#e2e8f0",
              textShadow: isOverLimit ? "0 0 30px #ef444440" : "none",
            }}>
              {requestCount}
            </span>
            <span style={{ fontSize: 18, color: "#64748b", fontWeight: 600 }}>/ 600 requests</span>
          </div>

          {/* Status badge */}
          {isOverLimit ? (
            <div style={{
              opacity: blockedOp,
              transform: `scale(${Math.min(blockedScale, 1)})`,
              background: "#ef444410", border: "2px solid #ef4444",
              borderRadius: 10, padding: "10px 24px",
              color: "#ef4444", fontWeight: 700, fontSize: 16, letterSpacing: 1,
              boxShadow: "0 0 30px #ef444430",
            }}>
              BLOCKED
            </div>
          ) : f >= COUNT_START ? (
            <div style={{
              background: "#22c55e10", border: "1px solid #22c55e30",
              borderRadius: 10, padding: "10px 24px",
              color: "#22c55e", fontWeight: 700, fontSize: 16,
            }}>
              ALLOWED
            </div>
          ) : null}
        </div>
      </div>

      {/* No burst note */}
      {f >= HIT_LIMIT && (
        <div style={{
          opacity: noburstOp,
          background: "#06b6d410", border: "1px solid #06b6d430",
          borderRadius: 10, padding: "10px 28px",
          color: "#06b6d4", fontSize: 14, fontWeight: 600,
        }}>
          No bursting allowed — more predictable, counts every request in the last 60 seconds
        </div>
      )}

      {/* Redis section */}
      {f >= REDIS_START && (
        <div style={{
          opacity: redisOp, transform: `translateY(${redisY}px)`,
          display: "flex", gap: 24, alignItems: "flex-start",
        }}>
          {/* Commands panel */}
          <div style={{
            background: "#12121f", border: "1px solid #1a1a2e",
            borderRadius: 14, padding: "22px 28px", width: 520,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
              fontSize: 11, fontWeight: 700, letterSpacing: 2,
              color: "#ef4444", textTransform: "uppercase",
            }}>
              <Database size={15} color="#ef4444" weight="duotone" />
              Redis — 2 Commands
            </div>

            {/* INCR */}
            <div style={{
              fontFamily: "'SF Mono', monospace",
              padding: "10px 16px", background: "#0a0a18",
              borderRadius: 8, marginBottom: 10, fontSize: 15,
            }}>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>INCR </span>
              <span style={{ color: "#a855f7" }}>{`rate:{userId}:{window}`}</span>
            </div>

            {/* EXPIRE */}
            <div style={{
              opacity: cmd2Op, transform: `translateY(${cmd2Y}px)`,
              fontFamily: "'SF Mono', monospace",
              padding: "10px 16px", background: "#0a0a18",
              borderRadius: 8, fontSize: 15,
            }}>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>EXPIRE </span>
              <span style={{ color: "#a855f7" }}>{`rate:{userId}:{window} `}</span>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>60</span>
            </div>
          </div>

          {/* Performance badges */}
          {f >= PERF_START && (
            <div style={{ opacity: perfOp, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                background: "#22c55e08", border: "1px solid #22c55e25",
                borderRadius: 12, padding: "18px 24px", textAlign: "center", minWidth: 160,
              }}>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Latency</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#22c55e", fontFamily: "'SF Mono', monospace" }}>{"<"}1ms</div>
              </div>
              <div style={{
                background: "#3b82f608", border: "1px solid #3b82f625",
                borderRadius: 12, padding: "18px 24px", textAlign: "center", minWidth: 160,
              }}>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Scale</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#3b82f6", fontFamily: "'SF Mono', monospace" }}>M+ keys</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final summary */}
      {f >= FINAL && (
        <div style={{
          opacity: finalOp,
          display: "flex", gap: 10, alignItems: "center",
          background: "#ef444410", border: "1px solid #ef444430",
          borderRadius: 12, padding: "12px 28px",
        }}>
          <Lightning size={18} color="#ef4444" weight="duotone" />
          <span style={{ color: "#ef4444", fontWeight: 700, fontFamily: "'SF Mono', monospace", fontSize: 14 }}>INCR</span>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>+</span>
          <span style={{ color: "#ef4444", fontWeight: 700, fontFamily: "'SF Mono', monospace", fontSize: 14 }}>EXPIRE</span>
          <span style={{ color: "#94a3b8", fontSize: 14 }}>— two Redis commands, sub-millisecond, handles millions of keys</span>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

// Scene timing (global frames):
// Scene 1: 0–500   (fade out 470–500)
// Scene 2: 480–860 (fade in 480–510, fade out 830–860)
// Scene 3: 840–1280 (fade in 840–870)
// Total: 1280 frames

const Generated_TokenBucketRateLimiting: React.FC = () => {
  const frame = useCurrentFrame();

  const s1Op = interpolate(frame, [0, 10, 470, 500], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const s2Op = interpolate(frame, [480, 510, 830, 860], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const s3Op = interpolate(frame, [840, 870], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: 1920, height: 1080, position: "relative", background: "#0f0f1a" }}>
      {s1Op > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: s1Op }}>
          <Scene1TokenBucket f={frame} />
        </div>
      )}
      {s2Op > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: s2Op }}>
          <Scene2Stripe f={frame - 480} />
        </div>
      )}
      {s3Op > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: s3Op }}>
          <Scene3SlidingWindow f={frame - 840} />
        </div>
      )}
    </div>
  );
};

export default Generated_TokenBucketRateLimiting;
