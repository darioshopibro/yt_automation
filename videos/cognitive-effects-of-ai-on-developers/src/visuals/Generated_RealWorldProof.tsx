import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Buildings,
  Timer,
  Brain,
  TrendDown,
  TrendUp,
  ShieldCheck,
  Lightning,
  ArrowBendDoubleUpRight,
  Smiley,
} from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeInQuad });

// ─── Colors ───────────────────────────────────────────────
const BG = "#0a0a0a";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";
const RED = "#ef4444";
const CYAN = "#06b6d4";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from word timestamps
 * ═══════════════════════════════════════════════════════════
 * "Basecamp"                          → f6943
 * "implemented"                       → f6999
 * "system"                            → f7022
 * "company-wide"                      → f7035
 * "CTO"                               → f7089
 * "noticed"                           → f7124
 * "junior developers"                 → f7145
 * "couldn't debug"                    → f7183
 * "simple issues"                     → f7208
 * "without assistance"                → f7230
 * "mandatory"                         → f7307
 * "ten-minute"                        → f7330
 * "thinking periods"                  → f7346
 * "before any AI use"                 → f7382
 * "Within three months"               → f7457
 * "bug resolution time"               → f7506
 * "actually improved"                 → f7550
 * "developers reported"               → f7607
 * "feeling more confident"            → f7639
 * "tackling new challenges"           → f7672
 * "The key"                           → f7741
 * "not fighting willpower"            → f7764
 * "against addiction"                 → f7800
 * "You're redirecting"                → f7852
 * "same reward system"                → f7894
 * "that got you hooked"               → f7928
 * "Your brain"                        → f8006
 * "starts finding satisfaction"       → f8023
 * "in the thinking process"           → f8072
 * "instead of"                        → f8124
 * "instant gratification"             → f8158
 * "of getting answers"                → f8198
 */

// ─── Scene boundaries ─────────────────────────────────────
const SCENE1_END = 7700;
const SCENE2_START = 7680;
const SCENE2_END = 7860;
const SCENE3_START = 7840;

// ─── Timer Ring Component ─────────────────────────────────
const TimerRing: React.FC<{
  progress: number;
  size: number;
  color: string;
  opacity: number;
  label: string;
}> = ({ progress, size, color, opacity, label }) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));

  return (
    <div
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        position: "relative",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Background ring */}
        <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`${color}15`}
            strokeWidth={strokeWidth}
          />
        </svg>
        {/* Progress ring */}
        <svg
          width={size}
          height={size}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotate(-90deg)",
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        {/* Center content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Timer size={36} color={color} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color,
              marginTop: 4,
              textShadow: `0 0 15px ${color}40`,
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Metric Bar Component ─────────────────────────────────
const MetricBar: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  barProgress: number;
  color: string;
  opacity: number;
  translateY: number;
  direction: "down" | "up";
}> = ({ label, icon, value, barProgress, color, opacity, translateY, direction }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      display: "flex",
      alignItems: "center",
      gap: 20,
      width: 700,
    }}
  >
    {/* Icon */}
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1.5px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 12px ${color}15`,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>

    {/* Label + bar */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>
          {label}
        </span>
        <span
          style={{
            color,
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "'SF Mono', monospace",
            textShadow: `0 0 10px ${color}30`,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: 28,
          borderRadius: 10,
          background: "#1a1a2e",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${barProgress * 100}%`,
            height: "100%",
            borderRadius: 10,
            background: direction === "down"
              ? `linear-gradient(90deg, ${color}80, ${color}40)`
              : `linear-gradient(90deg, ${color}40, ${color}80)`,
            boxShadow: barProgress > 0.3 ? `0 0 15px ${color}25` : "none",
          }}
        />
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_RealWorldProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE OPACITIES (crossfade) ──────────────────────
  const scene1Op = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op =
    interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp) *
    interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Op = interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

  // ═══ SCENE 1: Basecamp Story + 10-Minute Rule ═════════
  // "Basecamp" → f6943, "implemented this system" → f6999
  const basecampTitleOp = fadeIn(frame, 6943, 20);
  const basecampTitleY = slideUp(frame, 6943, 20);

  // "company-wide" → f7035 — company badge
  const companyBadgeOp = fadeIn(frame, 7030, 15);
  const companyBadgeScale = spring({
    frame: Math.max(0, frame - 7030),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // "CTO noticed" → f7089 — problem card
  const problemCardOp = fadeIn(frame, 7085, 18);
  const problemCardY = slideUp(frame, 7085, 18);

  // "junior developers couldn't debug" → f7145 — warning text in problem card
  const warningTextOp = fadeIn(frame, 7140, 15);

  // "mandatory ten-minute thinking" → f7307 — Timer visual appears
  const timerOp = fadeIn(frame, 7300, 20);
  const timerScale = spring({
    frame: Math.max(0, frame - 7300),
    fps,
    config: { damping: 20, stiffness: 160 },
  });

  // Timer ring fills from f7330 to f7380
  const timerProgress = interpolate(frame, [7330, 7400], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });
  const timerMinutes = Math.round(interpolate(frame, [7330, 7400], [0, 10], clamp));

  // "before any AI use" → f7382 — AI badge dim out
  const aiLabelOp = fadeIn(frame, 7382, 15);

  // Problem card fades as solution appears
  const problemFade = interpolate(frame, [7280, 7310], [1, 0.3], clamp);

  // ═══ SCENE 2: Results — Within 3 Months ═══════════════
  // "Within three months" → f7457
  const resultsTitleOp = fadeIn(frame, 7457, 18);
  const resultsTitleY = slideUp(frame, 7457, 18);

  // "bug resolution time actually improved" → f7506
  const bugBarOp = fadeIn(frame, 7500, 18);
  const bugBarY = slideUp(frame, 7500, 18);
  // Bar fills backwards (showing decrease = improvement) from f7530 to f7570
  const bugBarProgress = interpolate(frame, [7530, 7580], [0.85, 0.45], {
    ...clamp,
    easing: easeOutCubic,
  });

  // "developers reported feeling more confident" → f7607
  const confBarOp = fadeIn(frame, 7600, 18);
  const confBarY = slideUp(frame, 7600, 18);
  // Confidence bar fills up from f7630 to f7670
  const confBarProgress = interpolate(frame, [7630, 7680], [0.3, 0.85], {
    ...clamp,
    easing: easeOutCubic,
  });

  // "tackling new challenges" → f7672 — success badge
  const successOp = fadeIn(frame, 7670, 15);
  const successScale = spring({
    frame: Math.max(0, frame - 7670),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // ═══ SCENE 3: The Key Insight — Reward Redirect ═══════
  // "The key" → f7741
  const keyTitleOp = fadeIn(frame, 7860, 18);
  const keyTitleY = slideUp(frame, 7860, 18);

  // "not fighting willpower against addiction" → f7764
  // Left path: willpower (dimming, fading out)
  const willpowerOp = fadeIn(frame, 7890, 20);
  const willpowerDim = interpolate(frame, [7930, 7970], [1, 0.25], clamp);

  // "You're redirecting the same reward system" → f7852
  const redirectArrowOp = fadeIn(frame, 7940, 20);
  const redirectArrowX = interpolate(frame, [7940, 7970], [-30, 0], {
    ...clamp,
    easing: easeOutCubic,
  });

  // Right path: "brain finds satisfaction in thinking" → f8023
  const thinkPathOp = fadeIn(frame, 7970, 20);
  const thinkPathY = slideUp(frame, 7970, 20);

  // "satisfaction" glow grows → f8045
  const satGlow = interpolate(frame, [8040, 8080], [0, 30], clamp);

  // "instant gratification" → f8158 — crossed out
  const gratStrikeProgress = interpolate(frame, [8155, 8185], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });

  // "thinking process" → f8077 — highlight glow
  const thinkGlow = interpolate(frame, [8072, 8110], [0, 25], clamp);

  // Phase visibility
  const showScene1 = frame < SCENE1_END;
  const showScene2 = frame >= SCENE2_START && frame < SCENE2_END;
  const showScene3 = frame >= SCENE3_START;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ═══ SCENE 1: Basecamp Case Study ═════════════════ */}
      {showScene1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
            opacity: scene1Op,
          }}
        >
          {/* Company header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: basecampTitleOp,
              transform: `translateY(${basecampTitleY}px)`,
            }}
          >
            <div
              style={{
                opacity: companyBadgeOp,
                transform: `scale(${companyBadgeScale})`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${BLUE}20, ${BLUE}08)`,
                  border: `1.5px solid ${BLUE}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 15px ${BLUE}15`,
                }}
              >
                <Buildings size={28} color={BLUE} weight="duotone" />
              </div>
            </div>
            <div>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  letterSpacing: -0.5,
                }}
              >
                Basecamp
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: TEXT_DIM,
                  marginLeft: 12,
                }}
              >
                Company-wide implementation
              </span>
            </div>
          </div>

          {/* Middle row: Problem card + Timer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 60,
            }}
          >
            {/* Problem card — CTO noticed */}
            <div
              style={{
                opacity: problemCardOp * problemFade,
                transform: `translateY(${problemCardY}px)`,
                padding: "28px 36px",
                borderRadius: 12,
                background: `${RED}08`,
                border: `1px solid ${RED}20`,
                maxWidth: 420,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Brain size={24} color={RED} weight="duotone" />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: RED,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  CTO NOTICED
                </span>
              </div>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  color: TEXT_MUTED,
                  lineHeight: 1.5,
                  opacity: warningTextOp,
                }}
              >
                Junior developers couldn't debug simple issues without AI assistance
              </span>
            </div>

            {/* Arrow */}
            <div
              style={{
                opacity: timerOp,
                color: TEXT_DIM,
                fontSize: 24,
              }}
            >
              <ArrowBendDoubleUpRight size={36} color={AMBER} weight="duotone" />
            </div>

            {/* Timer — The Solution */}
            <div
              style={{
                opacity: timerOp,
                transform: `scale(${timerScale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: AMBER,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                THE SOLUTION
              </span>
              <TimerRing
                progress={timerProgress}
                size={160}
                color={AMBER}
                opacity={1}
                label={`${timerMinutes}m`}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: TEXT_PRIMARY,
                  textAlign: "center",
                }}
              >
                Mandatory thinking period
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: TEXT_DIM,
                  opacity: aiLabelOp,
                  padding: "4px 14px",
                  background: `${CYAN}10`,
                  border: `1px solid ${CYAN}20`,
                  borderRadius: 8,
                }}
              >
                before any AI use
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 2: Results — 3 Months Later ═══════════ */}
      {showScene2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
            opacity: scene2Op,
          }}
        >
          {/* Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: resultsTitleOp,
              transform: `translateY(${resultsTitleY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: GREEN,
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "6px 16px",
                background: `${GREEN}10`,
                border: `1px solid ${GREEN}25`,
                borderRadius: 8,
              }}
            >
              WITHIN 3 MONTHS
            </span>
          </div>

          {/* Bug Resolution Time — IMPROVED (bar shrinks) */}
          <MetricBar
            label="Bug Resolution Time"
            icon={<TrendDown size={26} color={GREEN} weight="duotone" />}
            value="Improved"
            barProgress={bugBarProgress}
            color={GREEN}
            opacity={bugBarOp}
            translateY={bugBarY}
            direction="down"
          />

          {/* Developer Confidence — UP (bar grows) */}
          <MetricBar
            label="Developer Confidence"
            icon={<TrendUp size={26} color={BLUE} weight="duotone" />}
            value="Higher"
            barProgress={confBarProgress}
            color={BLUE}
            opacity={confBarOp}
            translateY={confBarY}
            direction="up"
          />

          {/* Success badge */}
          <div
            style={{
              opacity: successOp,
              transform: `scale(${successScale})`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 28px",
              borderRadius: 12,
              background: `${GREEN}08`,
              border: `1px solid ${GREEN}25`,
              boxShadow: `0 0 20px ${GREEN}15`,
            }}
          >
            <ShieldCheck size={24} color={GREEN} weight="duotone" />
            <span
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: GREEN,
              }}
            >
              Tackling new challenges with confidence
            </span>
          </div>
        </div>
      )}

      {/* ═══ SCENE 3: The Key — Reward Redirect ══════════ */}
      {showScene3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 44,
            opacity: scene3Op,
          }}
        >
          {/* "The Key" title */}
          <div
            style={{
              opacity: keyTitleOp,
              transform: `translateY(${keyTitleY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Lightning size={28} color={AMBER} weight="duotone" />
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: -0.5,
              }}
            >
              The Key Insight
            </span>
          </div>

          {/* Two paths comparison */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 60,
            }}
          >
            {/* Left: Willpower vs Addiction (dimming) */}
            <div
              style={{
                opacity: willpowerOp * willpowerDim,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                padding: "32px 40px",
                borderRadius: 12,
                background: `${RED}06`,
                border: `1px solid ${RED}15`,
                width: 340,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: RED,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                NOT THIS
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 600, color: TEXT_MUTED }}>
                  Willpower
                </span>
                <span style={{ fontSize: 24, color: TEXT_DIM }}>vs</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: TEXT_MUTED }}>
                  Addiction
                </span>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: TEXT_DIM,
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Fighting against your own brain never works
              </span>
            </div>

            {/* Redirect arrow */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: redirectArrowOp,
                transform: `translateX(${redirectArrowX}px)`,
              }}
            >
              <ArrowBendDoubleUpRight size={44} color={PURPLE} weight="duotone" />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: PURPLE,
                  letterSpacing: 1,
                }}
              >
                REDIRECT
              </span>
            </div>

            {/* Right: Thinking Satisfaction (glowing) */}
            <div
              style={{
                opacity: thinkPathOp,
                transform: `translateY(${thinkPathY}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                padding: "32px 40px",
                borderRadius: 12,
                background: `${GREEN}08`,
                border: `1px solid ${GREEN}25`,
                width: 340,
                boxShadow: `0 0 ${satGlow}px ${GREEN}20`,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: GREEN,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                DO THIS
              </span>
              <Brain size={44} color={GREEN} weight="duotone" style={{ filter: `drop-shadow(0 0 ${thinkGlow}px ${GREEN}60)` }} />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: GREEN,
                  textShadow: `0 0 ${thinkGlow}px ${GREEN}30`,
                }}
              >
                Thinking Satisfaction
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: TEXT_MUTED,
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                Same reward system, redirected toward the thinking process
              </span>
            </div>
          </div>

          {/* Bottom: instant gratification crossed out */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: fadeIn(frame, 8150, 18),
            }}
          >
            {/* Crossed out "Instant Gratification" */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: `${RED}80`,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                Instant Gratification
              </span>
              {/* Strike-through line */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: `${gratStrikeProgress * 100}%`,
                  height: 2,
                  background: RED,
                  boxShadow: `0 0 8px ${RED}60`,
                  transform: "translateY(-50%)",
                }}
              />
            </div>

            <span style={{ color: TEXT_DIM, fontSize: 20 }}>&rarr;</span>

            {/* "Deep Thinking" highlighted */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 8,
                background: `${GREEN}12`,
                border: `1px solid ${GREEN}30`,
                boxShadow: `0 0 ${thinkGlow}px ${GREEN}20`,
              }}
            >
              <Smiley size={22} color={GREEN} weight="duotone" />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: GREEN,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                Deep Thinking
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_RealWorldProof;
