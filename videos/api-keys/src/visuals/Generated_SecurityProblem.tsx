import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Warning,
  ShieldSlash,
  Eye,
  Key,
  Clock,
  LockOpen,
  Envelope,
  WarningCircle,
  Skull,
  CalendarBlank,
} from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], {
    ...clamp,
    easing: easeOutCubic,
  });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], {
    ...clamp,
    easing: easeInQuad,
  });

// ─── Colors ──────────────────────────────────────────────
const BG = "#030305";
const DANGER = "#ef4444";
const DANGER_DARK = "#991b1b";
const PRIMARY = "#3b82f6";
const ACCENT = "#f59e0b";
const TEXT = "#f8fafc";
const TEXT_MUTED = "#94a3b8";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — derived from transcript
 * Segment: startFrame=1719, endFrame=2357 (638 frames, ~21.3s)
 *
 * Transcript:
 * "But API keys have a major problem."           → f1719 (~0.0s)
 * "They're not secure for authentication."        → f1770 (~1.7s)
 * "An API key is sent with every request,"        → f1830 (~3.7s)
 * "usually in plain text in the header."          → f1890 (~5.7s)
 * "If someone intercepts that request,"           → f1960 (~8.0s)
 * "they have your key."                           → f2020 (~10.0s)
 * "And unlike passwords,"                         → f2070 (~11.7s)
 * "API keys don't expire by default."             → f2110 (~13.0s)
 * "A leaked key could be used for months"         → f2180 (~15.4s)
 * "before anyone notices."                        → f2260 (~18.0s)
 * End                                             → f2357
 * ═══════════════════════════════════════════════════════════
 */

// Frame constants from voiceover
const F_MAJOR_PROBLEM = 1719;
const F_NOT_SECURE = 1770;
const F_SENT_REQUEST = 1830;
const F_PLAIN_TEXT = 1890;
const F_INTERCEPTS = 1960;
const F_HAVE_YOUR_KEY = 2020;
const F_UNLIKE_PASSWORDS = 2070;
const F_DONT_EXPIRE = 2110;
const F_MONTHS = 2180;
const F_ANYONE_NOTICES = 2260;

// Scene boundaries
const SCENE1_END = 2055; // Interception scene fades
const SCENE2_START = 2055; // Expiration scene starts

type Props = {
  startFrame: number;
  endFrame: number;
};

// ─── HTTP Request Display ─────────────────────────────────
const HttpRequest: React.FC<{
  opacity: number;
  translateY: number;
  keyRevealed: number;
  intercepted: boolean;
  interceptProgress: number;
}> = ({ opacity, translateY, keyRevealed, intercepted, interceptProgress }) => {
  const headerLines = [
    { label: "GET", value: "/api/v1/users", color: PRIMARY },
    { label: "Host", value: "api.example.com", color: TEXT_MUTED },
    { label: "Content-Type", value: "application/json", color: TEXT_MUTED },
    { label: "X-API-Key", value: "sk_live_a8f3...d92e", color: DANGER, isKey: true },
  ];

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: "#0a0a15",
        border: `1.5px solid ${intercepted ? `${DANGER}50` : `${BORDER}`}`,
        borderRadius: 12,
        padding: "24px 32px",
        width: 680,
        boxShadow: intercepted
          ? `0 0 30px ${DANGER}20, 0 0 60px ${DANGER}08`
          : "none",
      }}
    >
      {/* Request header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Envelope size={18} color={PRIMARY} weight="duotone" />
        <span
          style={{
            fontFamily: "'SF Mono', Fira Code, monospace",
            fontSize: 13,
            fontWeight: 600,
            color: TEXT_MUTED,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          HTTP Request
        </span>
      </div>

      {/* Header lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {headerLines.map((line, i) => {
          const lineOpacity =
            line.isKey
              ? keyRevealed
              : interpolate(keyRevealed, [0, 0.3], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: lineOpacity,
                padding: line.isKey ? "8px 12px" : "2px 0",
                background: line.isKey
                  ? `${DANGER}${Math.round(interceptProgress * 15)
                      .toString(16)
                      .padStart(2, "0")}`
                  : "transparent",
                borderRadius: 8,
                border: line.isKey
                  ? `1px solid ${DANGER}${Math.round(interceptProgress * 40)
                      .toString(16)
                      .padStart(2, "0")}`
                  : "1px solid transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', Fira Code, monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: line.isKey ? DANGER : TEXT_DIM,
                  minWidth: 120,
                }}
              >
                {line.label}:
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', Fira Code, monospace",
                  fontSize: 14,
                  fontWeight: 500,
                  color: line.isKey ? DANGER : line.color,
                  textShadow: line.isKey
                    ? `0 0 10px ${DANGER}40`
                    : "none",
                }}
              >
                {line.value}
              </span>
              {line.isKey && interceptProgress > 0.5 && (
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    opacity: interpolate(
                      interceptProgress,
                      [0.5, 1],
                      [0, 1],
                      clamp
                    ),
                  }}
                >
                  <WarningCircle
                    size={16}
                    color={DANGER}
                    weight="fill"
                  />
                  <span
                    style={{
                      fontFamily: "'SF Mono', Fira Code, monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: DANGER,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    EXPOSED
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_SecurityProblem: React.FC<Props> = ({
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE 1: Interception (~f1719–f2055) ─────────────

  // Title: "But API keys have a major problem"
  const titleOpacity = fadeIn(frame, F_MAJOR_PROBLEM, 20);
  const titleSlide = slideUp(frame, F_MAJOR_PROBLEM, 20);

  // Warning badge: "not secure for authentication"
  const warningOpacity = fadeIn(frame, F_NOT_SECURE, 15);
  const warningScale = spring({
    frame: Math.max(0, frame - F_NOT_SECURE),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // HTTP Request appears: "sent with every request"
  const requestOpacity = fadeIn(frame, F_SENT_REQUEST, 20);
  const requestSlide = slideUp(frame, F_SENT_REQUEST, 20);

  // Key highlights in request: "plain text in the header"
  const keyRevealed = interpolate(
    frame,
    [F_PLAIN_TEXT, F_PLAIN_TEXT + 20],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // Interception: "If someone intercepts that request"
  const interceptProgress = interpolate(
    frame,
    [F_INTERCEPTS, F_INTERCEPTS + 25],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );
  const intercepted = frame >= F_INTERCEPTS;

  // Attacker eye: appears when intercepting
  const eyeOpacity = fadeIn(frame, F_INTERCEPTS + 5, 15);
  const eyeScale = spring({
    frame: Math.max(0, frame - F_INTERCEPTS - 5),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // "They have your key" — stolen key badge
  const stolenOpacity = fadeIn(frame, F_HAVE_YOUR_KEY, 15);
  const stolenSlide = slideUp(frame, F_HAVE_YOUR_KEY, 15);

  // Scene 1 fade out
  const scene1Fade = frame < SCENE1_END ? 1 : fadeOut(frame, SCENE1_END, 25);

  // ─── SCENE 2: No Expiration (~f2055–f2357) ────────────

  const scene2Opacity =
    frame < SCENE2_START ? 0 : fadeIn(frame, SCENE2_START + 10, 25);

  // "Unlike passwords" title
  const expiryTitleOpacity = fadeIn(frame, F_UNLIKE_PASSWORDS, 15);
  const expiryTitleSlide = slideUp(frame, F_UNLIKE_PASSWORDS, 15);

  // "API keys don't expire" — no expiration display
  const noExpireOpacity = fadeIn(frame, F_DONT_EXPIRE, 15);
  const noExpireScale = spring({
    frame: Math.max(0, frame - F_DONT_EXPIRE),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Timeline months: "leaked key could be used for months"
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthsBaseFrame = F_MONTHS;

  // "before anyone notices" — danger pulse
  const noticeOpacity = fadeIn(frame, F_ANYONE_NOTICES, 15);
  const noticePulsePhase = interpolate(
    frame,
    [F_ANYONE_NOTICES, F_ANYONE_NOTICES + 60],
    [0, Math.PI * 4],
    clamp
  );
  const noticePulse = 0.7 + 0.3 * Math.sin(noticePulsePhase);

  // Phase visibility
  const showScene1 = frame < SCENE1_END + 25;
  const showScene2 = frame >= SCENE2_START;

  // Background danger pulse (subtle)
  const bgPulse =
    frame >= F_INTERCEPTS
      ? interpolate(
          Math.sin(
            interpolate(
              frame,
              [F_INTERCEPTS, F_INTERCEPTS + 120],
              [0, Math.PI * 6],
              clamp
            )
          ),
          [-1, 1],
          [0, 0.03],
          clamp
        )
      : 0;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle red vignette on danger */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${DANGER}${Math.round(bgPulse * 255)
            .toString(16)
            .padStart(2, "0")} 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* ═══ SCENE 1: THE INTERCEPTION ═══════════════════ */}
      {showScene1 && (
        <div
          style={{
            opacity: scene1Fade,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            position: "absolute",
            inset: 80,
          }}
        >
          {/* Title: "The Security Problem" */}
          <div
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleSlide}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <ShieldSlash size={32} color={DANGER} weight="duotone" />
              <span
                style={{
                  fontFamily: "'SF Mono', Fira Code, monospace",
                  fontSize: 28,
                  fontWeight: 700,
                  color: TEXT,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                The Security Problem
              </span>
            </div>
            <div
              style={{
                width: 60,
                height: 3,
                background: DANGER,
                borderRadius: 2,
                boxShadow: `0 0 12px ${DANGER}60`,
              }}
            />
          </div>

          {/* Warning badge: "Not secure for authentication" */}
          <div
            style={{
              opacity: warningOpacity,
              transform: `scale(${warningScale})`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 24px",
              background: `${DANGER}12`,
              border: `1.5px solid ${DANGER}30`,
              borderRadius: 10,
              boxShadow: `0 0 20px ${DANGER}15`,
            }}
          >
            <Warning size={22} color={DANGER} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', Fira Code, monospace",
                fontSize: 15,
                fontWeight: 600,
                color: DANGER,
                letterSpacing: 0.5,
              }}
            >
              NOT SECURE FOR AUTHENTICATION
            </span>
          </div>

          {/* Main content area: request + attacker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 60,
              flex: 1,
              width: "100%",
            }}
          >
            {/* HTTP Request */}
            <HttpRequest
              opacity={requestOpacity}
              translateY={requestSlide}
              keyRevealed={keyRevealed}
              intercepted={intercepted}
              interceptProgress={interceptProgress}
            />

            {/* Attacker / Interceptor zone */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                width: 380,
              }}
            >
              {/* Attacker eye */}
              <div
                style={{
                  opacity: eyeOpacity,
                  transform: `scale(${eyeScale})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    background: `${DANGER}10`,
                    border: `2px solid ${DANGER}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 40px ${DANGER}20, inset 0 0 20px ${DANGER}08`,
                  }}
                >
                  <Eye
                    size={48}
                    color={DANGER}
                    weight="duotone"
                    style={{
                      filter: `drop-shadow(0 0 12px ${DANGER}80)`,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'SF Mono', Fira Code, monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: DANGER,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  INTERCEPTED
                </span>
              </div>

              {/* Stolen key badge */}
              <div
                style={{
                  opacity: stolenOpacity,
                  transform: `translateY(${stolenSlide}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  background: `${DANGER}12`,
                  border: `1.5px solid ${DANGER}35`,
                  borderRadius: 10,
                  boxShadow: `0 0 20px ${DANGER}15`,
                }}
              >
                <Key
                  size={22}
                  color={DANGER}
                  weight="duotone"
                  style={{
                    filter: `drop-shadow(0 0 6px ${DANGER}60)`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'SF Mono', Fira Code, monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      color: DANGER,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    STOLEN KEY
                  </span>
                  <span
                    style={{
                      fontFamily: "'SF Mono', Fira Code, monospace",
                      fontSize: 13,
                      fontWeight: 500,
                      color: TEXT_MUTED,
                    }}
                  >
                    sk_live_a8f3...d92e
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 2: NO EXPIRATION ═════════════════════ */}
      {showScene2 && (
        <div
          style={{
            opacity: scene2Opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            position: "absolute",
            inset: 80,
          }}
        >
          {/* Section title */}
          <div
            style={{
              opacity: expiryTitleOpacity,
              transform: `translateY(${expiryTitleSlide}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <LockOpen size={28} color={ACCENT} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', Fira Code, monospace",
                fontSize: 22,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: 1,
              }}
            >
              Unlike Passwords...
            </span>
          </div>

          {/* No expiration badge */}
          <div
            style={{
              opacity: noExpireOpacity,
              transform: `scale(${noExpireScale})`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 40px",
              background: `${DANGER}10`,
              border: `2px solid ${DANGER}40`,
              borderRadius: 12,
              boxShadow: `0 0 30px ${DANGER}15`,
            }}
          >
            <Clock
              size={36}
              color={DANGER}
              weight="duotone"
              style={{
                filter: `drop-shadow(0 0 8px ${DANGER}60)`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontFamily: "'SF Mono', Fira Code, monospace",
                  fontSize: 20,
                  fontWeight: 700,
                  color: DANGER,
                  letterSpacing: 1,
                }}
              >
                NO EXPIRATION
              </span>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: TEXT_MUTED,
                }}
              >
                API keys don't expire by default
              </span>
            </div>
          </div>

          {/* Timeline: months of unauthorized access */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {months.map((month, i) => {
                const mStart = monthsBaseFrame + i * 10;
                const mOpacity = fadeIn(frame, mStart, 12);
                const mScale = spring({
                  frame: Math.max(0, frame - mStart),
                  fps,
                  config: { damping: 22, stiffness: 200 },
                });
                // Danger intensifies over months
                const dangerLevel = interpolate(i, [0, 5], [0.3, 1], clamp);
                const bgAlpha = Math.round(dangerLevel * 20)
                  .toString(16)
                  .padStart(2, "0");
                const borderAlpha = Math.round(dangerLevel * 50)
                  .toString(16)
                  .padStart(2, "0");

                return (
                  <div
                    key={month}
                    style={{
                      opacity: mOpacity,
                      transform: `scale(${mScale})`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      width: 120,
                    }}
                  >
                    {/* Month card */}
                    <div
                      style={{
                        width: 100,
                        height: 80,
                        borderRadius: 10,
                        background: `${DANGER}${bgAlpha}`,
                        border: `1.5px solid ${DANGER}${borderAlpha}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        boxShadow:
                          i === months.length - 1 && frame >= mStart + 12
                            ? `0 0 20px ${DANGER}25`
                            : "none",
                      }}
                    >
                      <CalendarBlank
                        size={22}
                        color={DANGER}
                        weight="duotone"
                        style={{
                          opacity: dangerLevel,
                          filter: `drop-shadow(0 0 4px ${DANGER}${Math.round(dangerLevel * 100)
                            .toString(16)
                            .padStart(2, "0")})`,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'SF Mono', Fira Code, monospace",
                          fontSize: 13,
                          fontWeight: 700,
                          color: DANGER,
                          opacity: dangerLevel,
                          letterSpacing: 1,
                        }}
                      >
                        {month}
                      </span>
                    </div>

                    {/* Skull icon on later months */}
                    {i >= 3 && (
                      <Skull
                        size={16}
                        color={DANGER}
                        weight="duotone"
                        style={{
                          opacity: interpolate(
                            dangerLevel,
                            [0.6, 1],
                            [0, 0.7],
                            clamp
                          ),
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Access bar growing — visualizing continuous unauthorized usage */}
            <div
              style={{
                width: 700,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                opacity: fadeIn(frame, F_MONTHS + 20, 15),
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', Fira Code, monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: TEXT_DIM,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Unauthorized Access
                </span>
                <span
                  style={{
                    fontFamily: "'SF Mono', Fira Code, monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: DANGER,
                  }}
                >
                  ACTIVE
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 10,
                  background: "#1a1a2e",
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${interpolate(
                      frame,
                      [F_MONTHS + 20, F_MONTHS + 80],
                      [0, 100],
                      { ...clamp, easing: easeOutCubic }
                    )}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${DANGER}60, ${DANGER})`,
                    borderRadius: 5,
                    boxShadow: `0 0 12px ${DANGER}40`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* "Before anyone notices" — pulsing danger warning */}
          {frame >= F_ANYONE_NOTICES && (
            <div
              style={{
                opacity: noticeOpacity * noticePulse,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 28px",
                background: `${DANGER}12`,
                border: `2px solid ${DANGER}40`,
                borderRadius: 12,
                boxShadow: `0 0 ${20 + noticePulse * 20}px ${DANGER}${Math.round(noticePulse * 30)
                  .toString(16)
                  .padStart(2, "0")}`,
                marginTop: 10,
              }}
            >
              <Warning
                size={28}
                color={DANGER}
                weight="fill"
                style={{
                  filter: `drop-shadow(0 0 8px ${DANGER}80)`,
                }}
              />
              <span
                style={{
                  fontFamily: "'SF Mono', Fira Code, monospace",
                  fontSize: 18,
                  fontWeight: 700,
                  color: DANGER,
                  letterSpacing: 1,
                  textShadow: `0 0 10px ${DANGER}40`,
                }}
              >
                MONTHS BEFORE ANYONE NOTICES
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Generated_SecurityProblem;
