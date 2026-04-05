import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Ladder,
  Timer,
  Brain,
  Lightning,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
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
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeInQuad });

// ─── Colors ───────────────────────────────────────────────
const BG = "#0a0a0a";
const ACCENT = "#3b82f6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";
const RED = "#ef4444";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from word-level timestamps
 * ═══════════════════════════════════════════════════════════
 * "neuroscientists"               → f4771
 * "Friction"                      → f4982
 * "Ladder"                        → f4998
 * "deliberately adding delay"     → f5052
 * "trigger"                       → f5131
 * "reward"                        → f5163
 * "banning AI completely"         → f5221
 * "always fails"                  → f5276
 * "increasing levels resistance"  → f5327–f5361
 * "coding problem"                → f5475
 * "five-minute timer"             → f5593
 * "think through the problem"     → f5669
 * "Just five minutes"             → f5742
 * "solve it yourself"             → f5843
 * "timer goes off"                → f5895
 * "accomplishment"                → f6147
 * "After a week"                  → f6226
 * "fifteen minutes"               → f6314
 * "thirty minutes"                → f6390
 * "Eventually"                    → f6443
 * "full hour-long"                → f6486
 * "coding sessions"               → f6523
 * "without any AI"                → f6563
 * "brain literally rewires"       → f6648–f6679
 * "dopamine pathways"             → f6779
 * "AI anticipation"               → f6839
 * "problem-solving"               → f6918
 */

// ─── KEY FRAMES ───────────────────────────────────────────
const F_START = 4771;
const F_FRICTION = 4982;
const F_LADDER = 4998;
const F_DELIBERATELY = 5052;
const F_TRIGGER = 5131;
const F_REWARD = 5163;
const F_BANNING = 5221;
const F_FAILS = 5276;
const F_RESISTANCE = 5327;
const F_CODING_PROBLEM = 5475;
const F_FIVE_MIN = 5593;
const F_THINK = 5669;
const F_JUST_FIVE = 5742;
const F_SOLVE_IT = 5843;
const F_TIMER_OFF = 5895;
const F_ACCOMPLISHMENT = 6147;
const F_AFTER_WEEK = 6226;
const F_FIFTEEN = 6314;
const F_THIRTY = 6390;
const F_EVENTUALLY = 6443;
const F_HOUR_LONG = 6486;
const F_CODING_SESSIONS = 6523;
const F_WITHOUT_AI = 6563;
const F_BRAIN = 6648;
const F_REWIRES = 6679;
const F_DOPAMINE = 6779;
const F_AI_ANTICIPATION = 6839;
const F_PROBLEM_SOLVING = 6918;

// ─── Timer Circle ─────────────────────────────────────────
const TimerCircle: React.FC<{
  minutes: number;
  color: string;
  progress: number;
  opacity: number;
  scale: number;
  label?: string;
  active?: boolean;
}> = ({ minutes, color, progress, opacity, scale, label, active }) => {
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background ring */}
        <svg
          width={120}
          height={120}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <circle
            cx={60}
            cy={60}
            r={52}
            fill="none"
            stroke={`${color}15`}
            strokeWidth={4}
          />
          <circle
            cx={60}
            cy={60}
            r={52}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{
              filter: active ? `drop-shadow(0 0 6px ${color}80)` : "none",
            }}
          />
        </svg>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 32,
            fontWeight: 700,
            color,
            textShadow: active ? `0 0 15px ${color}40` : "none",
            letterSpacing: -1,
          }}
        >
          {minutes}
        </span>
      </div>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: TEXT_MUTED,
        }}
      >
        {label || `${minutes} min`}
      </span>
    </div>
  );
};

// ─── Ladder Rung ──────────────────────────────────────────
const LadderRung: React.FC<{
  label: string;
  minutes: number;
  color: string;
  width: number;
  opacity: number;
  translateX: number;
  glowing?: boolean;
  index: number;
}> = ({ label, minutes, color, width, opacity, translateX, glowing, index }) => (
  <div
    style={{
      opacity,
      transform: `translateX(${translateX}px)`,
      display: "flex",
      alignItems: "center",
      gap: 20,
      width: "100%",
    }}
  >
    {/* Step number */}
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: glowing ? `${color}20` : `${color}10`,
        border: `1.5px solid ${glowing ? `${color}50` : `${color}25`}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: glowing ? `0 0 15px ${color}30` : "none",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 16,
          fontWeight: 700,
          color,
        }}
      >
        {index + 1}
      </span>
    </div>

    {/* Bar */}
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: TEXT_PRIMARY,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            color,
          }}
        >
          {minutes} min
        </span>
      </div>
      <div
        style={{
          height: 10,
          background: "#1a1a2e",
          borderRadius: 5,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            borderRadius: 5,
            boxShadow: glowing ? `0 0 12px ${color}40` : "none",
          }}
        />
      </div>
    </div>
  </div>
);

// ─── Pathway Node ─────────────────────────────────────────
const PathwayNode: React.FC<{
  label: string;
  color: string;
  icon: React.ReactNode;
  opacity: number;
  scale: number;
  active?: boolean;
  dimmed?: boolean;
}> = ({ label, color, icon, opacity, scale, active, dimmed }) => (
  <div
    style={{
      opacity: opacity * (dimmed ? 0.3 : 1),
      transform: `scale(${scale})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        background: active ? `${color}18` : `${color}08`,
        border: `2px solid ${active ? `${color}60` : `${color}20`}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: active ? `0 0 30px ${color}25, inset 0 0 20px ${color}08` : "none",
        filter: dimmed ? "grayscale(0.6)" : "none",
      }}
    >
      {icon}
    </div>
    <span
      style={{
        fontFamily: "'SF Mono', monospace",
        fontSize: 14,
        fontWeight: 600,
        color: active ? color : TEXT_MUTED,
        textAlign: "center",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_TheFrictionLadder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE BOUNDARIES ──────────────────────────────────
  // Scene 1: Intro concept (f4771 – ~f5400) — title + trigger/reward gap
  // Scene 2: The Ladder (f5400 – ~f6200) — timer + practice explanation
  // Scene 3: Progression (f6200 – ~f6600) — 4 rungs ladder building
  // Scene 4: Brain rewiring (f6600 – end) — dopamine pathway shift

  const scene1Fade = frame < 5360 ? 1 : fadeOut(frame, 5360, 30);
  const scene2Opacity = frame < 5400 ? 0 : frame < 6160 ? fadeIn(frame, 5400, 25) : fadeOut(frame, 6160, 30);
  const scene3Opacity = frame < 6190 ? 0 : frame < 6600 ? fadeIn(frame, 6190, 25) : fadeOut(frame, 6600, 25);
  const scene4Opacity = frame < 6620 ? 0 : fadeIn(frame, 6620, 25);

  const showScene1 = frame < 5400;
  const showScene2 = frame >= 5380 && frame < 6200;
  const showScene3 = frame >= 6170 && frame < 6640;
  const showScene4 = frame >= 6600;

  // ═══ SCENE 1: INTRO — "The Friction Ladder" concept ═══

  // Title appears at "Friction Ladder"
  const titleOpacity = fadeIn(frame, F_FRICTION - 5, 20);
  const titleSlide = slideUp(frame, F_FRICTION - 5, 20);

  // "Deliberately adding delay" subtitle
  const subtitleOpacity = fadeIn(frame, F_DELIBERATELY, 18);
  const subtitleSlide = slideUp(frame, F_DELIBERATELY, 18);

  // Trigger → [GAP] → Reward visual
  const triggerOpacity = fadeIn(frame, F_TRIGGER - 3, 15);
  const triggerScale = spring({
    frame: Math.max(0, frame - (F_TRIGGER - 3)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  const rewardOpacity = fadeIn(frame, F_REWARD - 3, 15);
  const rewardScale = spring({
    frame: Math.max(0, frame - (F_REWARD - 3)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Gap grows between trigger and reward
  const gapWidth = interpolate(frame, [F_TRIGGER, F_REWARD + 30], [40, 200], {
    ...clamp,
    easing: easeOutCubic,
  });

  // "Banning AI completely" → X mark
  const banOpacity = interpolate(frame, [F_BANNING, F_BANNING + 15, F_RESISTANCE - 10, F_RESISTANCE + 10], [0, 1, 1, 0], clamp);

  // "increasing resistance" → checkmark
  const resistanceOpacity = fadeIn(frame, F_RESISTANCE, 15);

  // ═══ SCENE 2: TIMER — "5 minute timer" practice ═══

  // Timer circle that fills up
  const timerProgress = interpolate(frame, [F_FIVE_MIN, F_TIMER_OFF], [0, 1], clamp);
  const timerOpacity = fadeIn(frame, F_FIVE_MIN - 5, 18);
  const timerScale = spring({
    frame: Math.max(0, frame - (F_FIVE_MIN - 5)),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // "think through the problem" — thought bubble
  const thinkOpacity = fadeIn(frame, F_THINK, 15);
  const thinkSlide = slideUp(frame, F_THINK, 15);

  // "Just five minutes" — emphasis
  const justFiveOpacity = fadeIn(frame, F_JUST_FIVE, 12);

  // "solve it yourself" — success flash
  const solveOpacity = fadeIn(frame, F_SOLVE_IT, 15);
  const solveScale = spring({
    frame: Math.max(0, frame - F_SOLVE_IT),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // "accomplishment" — small badge
  const accomplishOpacity = fadeIn(frame, F_ACCOMPLISHMENT, 15);

  // ═══ SCENE 3: LADDER RUNGS — progression ═══

  const rungs = [
    { label: "Week 1", minutes: 5, color: ACCENT, frame: F_AFTER_WEEK },
    { label: "Week 2", minutes: 15, color: CYAN, frame: F_FIFTEEN },
    { label: "Week 3", minutes: 30, color: AMBER, frame: F_THIRTY },
    { label: "Full Session", minutes: 60, color: GREEN, frame: F_HOUR_LONG },
  ];

  // ═══ SCENE 4: BRAIN REWIRING ═══

  const brainOpacity = fadeIn(frame, F_BRAIN, 20);
  const brainScale = spring({
    frame: Math.max(0, frame - F_BRAIN),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  const rewiresOpacity = fadeIn(frame, F_REWIRES, 15);

  // Dopamine pathway: AI anticipation dims, problem-solving lights up
  const aiPathOpacity = fadeIn(frame, F_DOPAMINE, 15);
  const aiPathDim = frame >= F_PROBLEM_SOLVING
    ? interpolate(frame, [F_PROBLEM_SOLVING, F_PROBLEM_SOLVING + 25], [1, 0.25], clamp)
    : 1;

  const solvingPathOpacity = fadeIn(frame, F_PROBLEM_SOLVING - 5, 18);
  const solvingPathScale = spring({
    frame: Math.max(0, frame - (F_PROBLEM_SOLVING - 5)),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // Pulse on the winning pathway
  const pulseIntensity = frame >= F_PROBLEM_SOLVING
    ? interpolate(frame, [F_PROBLEM_SOLVING, F_PROBLEM_SOLVING + 40], [0, 1], clamp)
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
      {/* ═══ SCENE 1: CONCEPT INTRO ═══════════════════════ */}
      {showScene1 && (
        <div
          style={{
            opacity: scene1Fade,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 50,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleSlide}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Ladder size={36} color={ACCENT} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${ACCENT}60)` }} />
              <h1
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 32,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  margin: 0,
                  letterSpacing: 1,
                }}
              >
                THE FRICTION LADDER
              </h1>
            </div>
            <div
              style={{
                width: 60,
                height: 3,
                background: ACCENT,
                borderRadius: 2,
                boxShadow: `0 0 12px ${ACCENT}60`,
              }}
            />
          </div>

          {/* Subtitle: "deliberately adding delay" */}
          <div
            style={{
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleSlide}px)`,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: TEXT_MUTED,
              }}
            >
              Deliberately adding delay between...
            </span>
          </div>

          {/* Trigger → [GROWING GAP] → Reward */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: gapWidth,
            }}
          >
            {/* Trigger */}
            <div
              style={{
                opacity: triggerOpacity,
                transform: `scale(${triggerScale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  background: `${RED}12`,
                  border: `2px solid ${RED}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 20px ${RED}15`,
                }}
              >
                <Lightning size={40} color={RED} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${RED}60)` }} />
              </div>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 16,
                  fontWeight: 600,
                  color: RED,
                }}
              >
                TRIGGER
              </span>
            </div>

            {/* Gap indicator */}
            <div
              style={{
                opacity: interpolate(frame, [F_TRIGGER + 10, F_TRIGGER + 25], [0, 1], clamp),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  height: 2,
                  width: gapWidth * 0.6,
                  background: `linear-gradient(90deg, ${RED}40, ${ACCENT}40, ${GREEN}40)`,
                  borderRadius: 1,
                }}
              />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: TEXT_DIM,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                DELAY
              </span>
            </div>

            {/* Reward */}
            <div
              style={{
                opacity: rewardOpacity,
                transform: `scale(${rewardScale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  background: `${GREEN}12`,
                  border: `2px solid ${GREEN}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 20px ${GREEN}15`,
                }}
              >
                <CheckCircle size={40} color={GREEN} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${GREEN}60)` }} />
              </div>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 16,
                  fontWeight: 600,
                  color: GREEN,
                }}
              >
                REWARD
              </span>
            </div>
          </div>

          {/* Ban AI vs Increasing Resistance */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 60,
              marginTop: 10,
            }}
          >
            {/* Ban AI — fails */}
            <div
              style={{
                opacity: banOpacity,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px",
                background: `${RED}08`,
                border: `1px solid ${RED}20`,
                borderRadius: 10,
              }}
            >
              <XCircle size={24} color={RED} weight="duotone" />
              <span style={{ fontSize: 15, fontWeight: 600, color: RED }}>
                Ban AI completely
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: TEXT_DIM, marginLeft: 4 }}>
                always fails
              </span>
            </div>

            {/* Increasing resistance — works */}
            <div
              style={{
                opacity: resistanceOpacity,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px",
                background: `${GREEN}08`,
                border: `1px solid ${GREEN}20`,
                borderRadius: 10,
                boxShadow: `0 0 15px ${GREEN}10`,
              }}
            >
              <CheckCircle size={24} color={GREEN} weight="duotone" />
              <span style={{ fontSize: 15, fontWeight: 600, color: GREEN }}>
                Increasing resistance
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 2: FIVE-MINUTE TIMER PRACTICE ═════════ */}
      {showScene2 && (
        <div
          style={{
            opacity: scene2Opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Section title */}
          <div
            style={{
              opacity: fadeIn(frame, 5410, 15),
              transform: `translateY(${slideUp(frame, 5410, 15)}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Timer size={24} color={ACCENT} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              HOW IT WORKS IN PRACTICE
            </span>
          </div>

          {/* Timer + explanation side by side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 80,
            }}
          >
            {/* Timer circle */}
            <TimerCircle
              minutes={5}
              color={ACCENT}
              progress={timerProgress}
              opacity={timerOpacity}
              scale={timerScale}
              label="THINK FIRST"
              active={timerProgress > 0 && timerProgress < 1}
            />

            {/* Steps */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                maxWidth: 500,
              }}
            >
              {/* Step 1: Hit coding problem */}
              <div
                style={{
                  opacity: fadeIn(frame, F_CODING_PROBLEM, 15),
                  transform: `translateY(${slideUp(frame, F_CODING_PROBLEM, 15)}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  background: `${RED}08`,
                  border: `1px solid ${RED}18`,
                  borderRadius: 10,
                }}
              >
                <Lightning size={22} color={RED} weight="duotone" />
                <span style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>
                  Hit a coding problem
                </span>
              </div>

              {/* Step 2: Set timer, think */}
              <div
                style={{
                  opacity: thinkOpacity,
                  transform: `translateY(${thinkSlide}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  background: `${ACCENT}08`,
                  border: `1px solid ${ACCENT}18`,
                  borderRadius: 10,
                  boxShadow: frame >= F_THINK && frame < F_SOLVE_IT ? `0 0 12px ${ACCENT}15` : "none",
                }}
              >
                <Clock size={22} color={ACCENT} weight="duotone" />
                <span style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>
                  Set 5-min timer — think first
                </span>
                {frame >= F_JUST_FIVE && (
                  <span
                    style={{
                      opacity: justFiveOpacity,
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: ACCENT,
                      padding: "3px 10px",
                      background: `${ACCENT}15`,
                      borderRadius: 6,
                      marginLeft: "auto",
                    }}
                  >
                    JUST 5 MIN
                  </span>
                )}
              </div>

              {/* Step 3: Solve it yourself */}
              <div
                style={{
                  opacity: solveOpacity,
                  transform: `scale(${solveScale})`,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  background: `${GREEN}08`,
                  border: `1px solid ${GREEN}18`,
                  borderRadius: 10,
                  boxShadow: `0 0 15px ${GREEN}12`,
                }}
              >
                <CheckCircle size={22} color={GREEN} weight="duotone" />
                <span style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>
                  Most times — solve it yourself!
                </span>
              </div>

              {/* Accomplishment badge */}
              {frame >= F_ACCOMPLISHMENT && (
                <div
                  style={{
                    opacity: accomplishOpacity,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "10px 20px",
                    background: `${PURPLE}08`,
                    border: `1px solid ${PURPLE}20`,
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 18 }}>+</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: PURPLE }}>
                    Small sense of accomplishment
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 3: THE LADDER — 4 RUNGS ═══════════════ */}
      {showScene3 && (
        <div
          style={{
            opacity: scene3Opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            width: "100%",
            maxWidth: 800,
          }}
        >
          {/* Section title */}
          <div
            style={{
              opacity: fadeIn(frame, F_AFTER_WEEK - 10, 15),
              transform: `translateY(${slideUp(frame, F_AFTER_WEEK - 10, 15)}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Ladder size={24} color={ACCENT} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              CLIMBING THE LADDER
            </span>
          </div>

          {/* Rungs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              width: "100%",
            }}
          >
            {rungs.map((rung, idx) => {
              const rungOpacity = fadeIn(frame, rung.frame - 3, 15);
              const rungSlide = interpolate(
                frame,
                [rung.frame - 3, rung.frame + 12],
                [-30, 0],
                { ...clamp, easing: easeOutCubic }
              );
              const barWidth = interpolate(
                frame,
                [rung.frame, rung.frame + 25],
                [0, (rung.minutes / 60) * 100],
                { ...clamp, easing: easeOutCubic }
              );
              const isLatest = idx === rungs.length - 1
                ? frame >= rung.frame
                : frame >= rung.frame && frame < rungs[idx + 1].frame;

              return (
                <LadderRung
                  key={idx}
                  label={rung.label}
                  minutes={rung.minutes}
                  color={rung.color}
                  width={barWidth}
                  opacity={rungOpacity}
                  translateX={rungSlide}
                  glowing={isLatest}
                  index={idx}
                />
              );
            })}
          </div>

          {/* "Eventually — full hour-long coding sessions without AI" */}
          {frame >= F_WITHOUT_AI && (
            <div
              style={{
                opacity: fadeIn(frame, F_WITHOUT_AI, 15),
                transform: `translateY(${slideUp(frame, F_WITHOUT_AI, 15)}px)`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                background: `${GREEN}10`,
                border: `1.5px solid ${GREEN}30`,
                borderRadius: 10,
                boxShadow: `0 0 20px ${GREEN}15`,
              }}
            >
              <CheckCircle size={22} color={GREEN} weight="duotone" />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: GREEN,
                }}
              >
                Full hour-long sessions — no AI assistance
              </span>
            </div>
          )}
        </div>
      )}

      {/* ═══ SCENE 4: BRAIN REWIRING ═════════════════════ */}
      {showScene4 && (
        <div
          style={{
            opacity: scene4Opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 44,
          }}
        >
          {/* "Your brain literally rewires" */}
          <div
            style={{
              opacity: brainOpacity,
              transform: `scale(${brainScale})`,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Brain
              size={40}
              color={PURPLE}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 10px ${PURPLE}60)` }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 24,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: 0.5,
              }}
            >
              BRAIN LITERALLY REWIRES
            </span>
          </div>

          {/* "rewires itself" subtitle */}
          <div
            style={{
              opacity: rewiresOpacity,
              transform: `translateY(${slideUp(frame, F_REWIRES, 15)}px)`,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 500, color: TEXT_MUTED }}>
              Dopamine pathways shift during this process
            </span>
          </div>

          {/* Two pathways side by side */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 80,
            }}
          >
            {/* AI Anticipation pathway — dims */}
            <div style={{ opacity: aiPathOpacity * aiPathDim }}>
              <PathwayNode
                label="AI ANTICIPATION"
                color={RED}
                icon={<Lightning size={36} color={RED} weight="duotone" style={{ filter: `drop-shadow(0 0 6px ${RED}50)` }} />}
                opacity={1}
                scale={1}
                active={frame < F_PROBLEM_SOLVING}
                dimmed={frame >= F_PROBLEM_SOLVING}
              />
            </div>

            {/* Arrow between */}
            <div
              style={{
                opacity: fadeIn(frame, F_AI_ANTICIPATION + 10, 15),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ArrowRight size={32} color={TEXT_DIM} weight="bold" />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: TEXT_DIM,
                  letterSpacing: 1,
                }}
              >
                SHIFTS TO
              </span>
            </div>

            {/* Problem-Solving pathway — lights up */}
            <div
              style={{
                opacity: solvingPathOpacity,
                transform: `scale(${solvingPathScale})`,
              }}
            >
              <PathwayNode
                label="PROBLEM-SOLVING"
                color={GREEN}
                icon={<Brain size={36} color={GREEN} weight="duotone" style={{ filter: `drop-shadow(0 0 6px ${GREEN}50)` }} />}
                opacity={1}
                scale={1}
                active={frame >= F_PROBLEM_SOLVING}
              />
            </div>
          </div>

          {/* Pulsing glow around problem-solving when active */}
          {pulseIntensity > 0 && (
            <div
              style={{
                opacity: pulseIntensity * 0.8,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 28px",
                background: `${GREEN}10`,
                border: `1.5px solid ${GREEN}35`,
                borderRadius: 10,
                boxShadow: `0 0 25px ${GREEN}20`,
              }}
            >
              <CheckCircle size={20} color={GREEN} weight="duotone" />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 15,
                  fontWeight: 600,
                  color: GREEN,
                }}
              >
                Dopamine fires for solving, not for AI
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Generated_TheFrictionLadder;
