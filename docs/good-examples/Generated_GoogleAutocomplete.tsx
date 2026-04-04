import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  MagnifyingGlass,
  User,
  TrendUp,
  Globe,
  Newspaper,
  Lightning,
  Clock,
  Star,
} from "@phosphor-icons/react";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// ─── DATA ──────────────────────────────────────────────────────────

const SEARCH_TEXT_1 = "how to";
const SEARCH_TEXT_2 = "how to sc";

const FACTORS = [
  { label: "Personal History", icon: User, color: "#3b82f6", desc: "Your past searches" },
  { label: "Trending Now", icon: TrendUp, color: "#22c55e", desc: "Regional trends" },
  { label: "Global Popular", icon: Globe, color: "#f59e0b", desc: "Common completions" },
  { label: "Freshness", icon: Newspaper, color: "#a855f7", desc: "Breaking news" },
];

const PREDICTIONS_PHASE1 = [
  { text: "how to tie a tie", prob: 23, color: "#3b82f6" },
  { text: "how to screenshot", prob: 18, color: "#22c55e" },
  { text: "how to lose weight", prob: 12, color: "#f59e0b" },
  { text: "how to boil eggs", prob: 9, color: "#a855f7" },
  { text: "how to screenshot on mac", prob: 8, color: "#06b6d4" },
];

const PREDICTIONS_PHASE2 = [
  { text: "how to screenshot on mac", prob: 31, color: "#06b6d4" },
  { text: "how to screenshot", prob: 22, color: "#22c55e" },
  { text: "how to scale a business", prob: 11, color: "#f59e0b" },
  { text: "how to scan QR code", prob: 9, color: "#a855f7" },
  { text: "how to schedule email", prob: 7, color: "#3b82f6" },
];

// ─── COMPONENT ─────────────────────────────────────────────────────

const Generated_GoogleAutocomplete: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── SCENE CONTROL ────────────────────────────────────────────────
  // Scene 1: Search bar + typing + factors (0-300)
  // Scene 2: Predictions + re-ranking + stats (300-510)
  const scene1Opacity = interpolate(frame, [280, 300], [1, 0], clamp);
  const scene2Opacity = interpolate(frame, [290, 310], [0, 1], clamp);
  const isScene2 = frame >= 290;

  // ── SCENE 1: SEARCH BAR + FACTORS ────────────────────────────────

  // Search bar appears
  const searchBarOpacity = interpolate(frame, [20, 40], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const searchBarY = interpolate(frame, [20, 40], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Typing animation — "how to" appears char by char
  const typingProgress = interpolate(frame, [55, 110], [0, SEARCH_TEXT_1.length], clamp);
  const displayedText1 = SEARCH_TEXT_1.slice(0, Math.floor(typingProgress));
  const showCursor = frame >= 55 && frame < 280;
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  // Request pulse fires after typing
  const pulseOpacity = interpolate(frame, [120, 130, 140, 160], [0, 1, 1, 0], clamp);
  const pulseScale = interpolate(frame, [120, 160], [0.5, 2.5], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "50ms" speed badge
  const speedBadgeOpacity = interpolate(frame, [235, 245, 270, 285], [0, 1, 1, 0], clamp);
  const speedBadgeScale = spring({
    frame: Math.max(0, frame - 235),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // ── SCENE 2: PREDICTIONS ─────────────────────────────────────────

  // Typing "how to sc" in scene 2
  const typing2Progress = interpolate(frame, [380, 410], [0, SEARCH_TEXT_2.length], clamp);
  const displayedText2 = SEARCH_TEXT_2.slice(0, Math.floor(typing2Progress));

  // Re-rank transition
  const reRankProgress = interpolate(frame, [415, 445], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const showPhase2 = frame >= 415;

  // Stats appear
  const statsOpacity = interpolate(frame, [455, 470], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const statsY = interpolate(frame, [455, 470], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── RENDER ───────────────────────────────────────────────────────

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── SCENE 1: SEARCH + FACTORS ──────────────────────────── */}
      {frame < 310 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
            gap: 60,
            opacity: scene1Opacity,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: interpolate(frame, [5, 20], [0, 1], clamp),
              transform: `translateY(${interpolate(frame, [5, 20], [15, 0], clamp)}px)`,
              fontSize: 28,
              fontWeight: 700,
              color: "#e2e8f0",
              letterSpacing: -0.5,
            }}
          >
            Google Autocomplete — Behind the Scenes
          </div>

          {/* Search Bar */}
          <div
            style={{
              opacity: searchBarOpacity,
              transform: `translateY(${searchBarY}px)`,
              width: 700,
              height: 64,
              borderRadius: 32,
              background: "#12121f",
              border: "1.5px solid #2a2a3e",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: 16,
              boxShadow: frame >= 120 && frame < 160
                ? `0 0 ${30 * pulseScale}px #3b82f640`
                : "0 0 15px #3b82f610",
            }}
          >
            <MagnifyingGlass size={24} color="#64748b" weight="duotone" />
            <span
              style={{
                fontSize: 20,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
                fontWeight: 500,
                letterSpacing: 0.3,
              }}
            >
              {displayedText1}
              {showCursor && (
                <span
                  style={{
                    opacity: cursorBlink ? 1 : 0,
                    color: "#3b82f6",
                    fontWeight: 300,
                  }}
                >
                  |
                </span>
              )}
            </span>
          </div>

          {/* Request pulse indicator */}
          {frame >= 120 && frame < 170 && (
            <div
              style={{
                opacity: pulseOpacity,
                fontSize: 14,
                fontFamily: "'SF Mono', monospace",
                color: "#3b82f6",
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Lightning size={18} color="#3b82f6" weight="fill" />
              Request fired to prediction servers
            </div>
          )}

          {/* 4 Factors */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
              width: "100%",
              maxWidth: 1100,
            }}
          >
            {FACTORS.map((factor, i) => {
              const startF = 150 + i * 20;
              const factorOpacity = interpolate(frame, [startF, startF + 15], [0, 1], {
                ...clamp,
                easing: Easing.out(Easing.cubic),
              });
              const factorY = interpolate(frame, [startF, startF + 15], [25, 0], {
                ...clamp,
                easing: Easing.out(Easing.cubic),
              });
              const Icon = factor.icon;
              const isActive = frame >= startF + 15;

              return (
                <div
                  key={factor.label}
                  style={{
                    opacity: factorOpacity,
                    transform: `translateY(${factorY}px)`,
                    background: `${factor.color}08`,
                    border: `1px solid ${factor.color}${isActive ? "30" : "15"}`,
                    borderRadius: 12,
                    padding: "28px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: isActive ? `0 0 20px ${factor.color}15` : "none",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${factor.color}20, ${factor.color}08)`,
                      border: `1.5px solid ${factor.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 15px ${factor.color}15`,
                    }}
                  >
                    <Icon
                      size={28}
                      color={factor.color}
                      weight="duotone"
                      style={{ filter: `drop-shadow(0 0 8px ${factor.color}60)` }}
                    />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#e2e8f0",
                        marginBottom: 4,
                      }}
                    >
                      {factor.label}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                      {factor.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 50ms badge */}
          <div
            style={{
              opacity: speedBadgeOpacity,
              transform: `scale(${speedBadgeScale})`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#22c55e10",
              border: "1px solid #22c55e30",
              borderRadius: 20,
              padding: "10px 24px",
            }}
          >
            <Lightning size={20} color="#22c55e" weight="fill" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: "#22c55e",
                letterSpacing: -0.5,
              }}
            >
              50ms
            </span>
            <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>
              response time
            </span>
          </div>
        </div>
      )}

      {/* ── SCENE 2: PREDICTIONS + RE-RANKING + STATS ──────────── */}
      {isScene2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "60px 80px",
            gap: 40,
            opacity: scene2Opacity,
          }}
        >
          {/* Search Bar (scene 2) */}
          <div
            style={{
              width: 700,
              height: 64,
              borderRadius: 32,
              background: "#12121f",
              border: "1.5px solid #2a2a3e",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: 16,
              boxShadow: "0 0 15px #3b82f610",
              flexShrink: 0,
            }}
          >
            <MagnifyingGlass size={24} color="#64748b" weight="duotone" />
            <span
              style={{
                fontSize: 20,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
                fontWeight: 500,
                letterSpacing: 0.3,
              }}
            >
              {frame < 380 ? SEARCH_TEXT_1 : displayedText2}
              {frame >= 290 && (
                <span
                  style={{
                    opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0,
                    color: "#3b82f6",
                    fontWeight: 300,
                  }}
                >
                  |
                </span>
              )}
            </span>
          </div>

          {/* Predictions label */}
          <div
            style={{
              opacity: interpolate(frame, [310, 320], [0, 1], clamp),
              fontSize: 13,
              fontFamily: "'SF Mono', monospace",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase" as const,
              letterSpacing: 2,
              alignSelf: "center",
            }}
          >
            Predictions ranked by probability
          </div>

          {/* Predictions list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              width: "100%",
              maxWidth: 800,
            }}
          >
            {(showPhase2 ? PREDICTIONS_PHASE2 : PREDICTIONS_PHASE1).map((pred, i) => {
              const predStart = showPhase2 ? 415 : 320 + i * 12;
              const predOpacity = showPhase2
                ? 1
                : interpolate(frame, [predStart, predStart + 12], [0, 1], {
                    ...clamp,
                    easing: Easing.out(Easing.cubic),
                  });
              const predX = showPhase2
                ? 0
                : interpolate(frame, [predStart, predStart + 12], [30, 0], {
                    ...clamp,
                    easing: Easing.out(Easing.cubic),
                  });

              // Probability bar width
              const maxBarWidth = 280;
              const targetWidth = (pred.prob / 35) * maxBarWidth;
              const barWidth = showPhase2
                ? interpolate(frame, [415, 445], [0, targetWidth], {
                    ...clamp,
                    easing: Easing.out(Easing.cubic),
                  })
                : interpolate(
                    frame,
                    [predStart + 5, predStart + 25],
                    [0, targetWidth],
                    { ...clamp, easing: Easing.out(Easing.cubic) }
                  );

              // Highlight #1 prediction
              const isTop = i === 0;

              return (
                <div
                  key={pred.text}
                  style={{
                    opacity: predOpacity,
                    transform: `translateX(${predX}px)`,
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    padding: "16px 24px",
                    borderRadius: 12,
                    background: isTop ? `${pred.color}10` : "#12121f",
                    border: `1px solid ${isTop ? pred.color + "30" : "#1a1a2e"}`,
                    boxShadow: isTop ? `0 0 20px ${pred.color}15` : "none",
                  }}
                >
                  {/* Rank number */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: isTop ? pred.color : `${pred.color}20`,
                      border: `2px solid ${pred.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: isTop ? "#0f0f1a" : pred.color,
                      fontFamily: "'SF Mono', monospace",
                      flexShrink: 0,
                      boxShadow: isTop ? `0 0 12px ${pred.color}40` : "none",
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Prediction text */}
                  <div
                    style={{
                      flex: 1,
                      fontSize: 17,
                      fontWeight: isTop ? 600 : 500,
                      color: isTop ? "#e2e8f0" : "#94a3b8",
                    }}
                  >
                    {pred.text}
                  </div>

                  {/* Probability bar + percentage */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: maxBarWidth,
                        height: 8,
                        borderRadius: 4,
                        background: "#1a1a2e",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: barWidth,
                          height: "100%",
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${pred.color}80, ${pred.color})`,
                          boxShadow: `0 0 8px ${pred.color}40`,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 15,
                        fontWeight: 700,
                        color: pred.color,
                        width: 45,
                        textAlign: "right",
                      }}
                    >
                      {pred.prob}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Re-rank indicator */}
          {frame >= 410 && frame < 450 && (
            <div
              style={{
                opacity: interpolate(frame, [410, 418, 442, 450], [0, 1, 1, 0], clamp),
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontFamily: "'SF Mono', monospace",
                color: "#06b6d4",
                fontWeight: 600,
              }}
            >
              <Star size={16} color="#06b6d4" weight="fill" />
              Predictions re-ranked instantly
            </div>
          )}

          {/* Stats row */}
          <div
            style={{
              opacity: statsOpacity,
              transform: `translateY(${statsY}px)`,
              display: "flex",
              gap: 40,
              marginTop: 10,
            }}
          >
            {[
              { value: "8B+", label: "predictions / day", color: "#3b82f6", icon: Globe },
              { value: "~1hr", label: "model update cycle", color: "#22c55e", icon: Clock },
              { value: "<5min", label: "trending topics", color: "#a855f7", icon: TrendUp },
            ].map((stat, i) => {
              const statDelay = i * 8;
              const statOp = interpolate(
                frame,
                [455 + statDelay, 468 + statDelay],
                [0, 1],
                { ...clamp, easing: Easing.out(Easing.cubic) }
              );
              const StatIcon = stat.icon;

              return (
                <div
                  key={stat.label}
                  style={{
                    opacity: statOp,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "18px 32px",
                    borderRadius: 12,
                    background: `${stat.color}08`,
                    border: `1px solid ${stat.color}15`,
                  }}
                >
                  <StatIcon
                    size={22}
                    color={stat.color}
                    weight="duotone"
                    style={{ filter: `drop-shadow(0 0 6px ${stat.color}60)` }}
                  />
                  <div
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 28,
                      fontWeight: 700,
                      color: stat.color,
                      letterSpacing: -1,
                      textShadow: `0 0 20px ${stat.color}30`,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase" as const,
                      letterSpacing: 1,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_GoogleAutocomplete;
