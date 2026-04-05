import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Brain,
  ChatCircleDots,
  Lightning,
  Timer,
  BookOpen,
  Warning,
  Lock,
  ChartBar,
  ArrowDown,
  Skull,
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
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";
const GREEN = "#22c55e";
const CYAN = "#06b6d4";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from timestamps
 * ═══════════════════════════════════════════════════════════
 * "Every coding challenge"         → f3261
 * "triggers...immediate craving"   → f3290-f3328
 * "ask the AI"                     → f3341-f3378
 * "staring at a perfectly solvable bug" → f3409-f3472
 * "brain starts generating excuses" → f3494-f3554
 * "It'll be faster this way"       → f3575-f3619
 * "I can learn from the AI"        → f3637-f3696
 * "I'm being efficient"            → f3712-f3764
 * "But efficiency isn't the real driver" → f3785-f3858
 * "The craving is."                → f3875-f3888
 *
 * "knowing you're addicted doesn't help" → f3972-f4037
 * "Addiction never works that way"  → f4055-f4107
 *
 * "In 2023, GitHub surveyed"       → f4125-f4213
 * "over-dependence on Copilot"     → f4257-f4306
 * "91% said they wanted to reduce" → f4324-f4413
 * "Only 12% managed...week"        → f4434-f4530
 * "knowledge...bad for you"        → f4551-f4612
 * "doesn't override neurochemical compulsion" → f4624-f4705
 * "to keep doing it"               → f4715-f4770
 */

// ─── Key frames from timestamps ──────────────────────────
const F_CODING_CHALLENGE = 3261;
const F_CRAVING = 3317;
const F_ASK_AI = 3341;
const F_SOLVABLE_BUG = 3409;
const F_EXCUSES = 3530;
const F_FASTER = 3575;
const F_LEARN = 3637;
const F_EFFICIENT = 3712;
const F_NOT_DRIVER = 3785;
const F_CRAVING_REVEAL = 3875;

const F_KNOWING_ADDICTED = 3972;
const F_ADDICTION_NEVER = 4055;

const F_GITHUB_SURVEY = 4125;
const F_COPILOT = 4285;
const F_91_PERCENT = 4324;
const F_12_PERCENT = 4434;
const F_KNOWLEDGE_BAD = 4551;
const F_NEUROCHEMICAL = 4662;
const F_KEEP_DOING = 4715;

// ─── Scene boundaries ────────────────────────────────────
const SCENE1_END = 3920;     // Craving excuses → "The craving is."
const SCENE2_START = 3900;
const SCENE2_END = 4120;     // "Addiction never works that way"
const SCENE3_START = 4100;
// Scene 3 goes to end (~4770)

// ─── Excuse Bubble ───────────────────────────────────────
const ExcuseBubble: React.FC<{
  text: string;
  icon: React.ReactNode;
  color: string;
  opacity: number;
  translateY: number;
  strikethrough: number;
}> = ({ text, icon, color, opacity, translateY, strikethrough }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 24px",
      borderRadius: 12,
      background: `${color}0a`,
      border: `1px solid ${color}25`,
      boxShadow: `0 0 15px ${color}10`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {icon}
    <span
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 18,
        fontWeight: 500,
        color: TEXT_PRIMARY,
      }}
    >
      {text}
    </span>
    {/* Strikethrough line */}
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: 16,
        right: 16,
        height: 2,
        background: RED,
        transform: `scaleX(${strikethrough})`,
        transformOrigin: "left",
        boxShadow: `0 0 8px ${RED}60`,
      }}
    />
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_TheCravingTrap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene opacities (crossfade) ──
  const scene1Op = frame < SCENE1_END - 20 ? 1 : fadeOut(frame, SCENE1_END - 20, 20);
  const scene2Op = fadeIn(frame, SCENE2_START, 20)
    * (frame < SCENE2_END - 20 ? 1 : fadeOut(frame, SCENE2_END - 20, 20));
  const scene3Op = fadeIn(frame, SCENE3_START, 20);

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
      {/* ════════════ SCENE 1: Craving + Excuses ════════════ */}
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
            opacity: scene1Op,
          }}
        >
          <Scene1_Craving frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Knowing Doesn't Help ════════════ */}
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
            opacity: scene2Op,
          }}
        >
          <Scene2_Addiction frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: GitHub Survey Stats ════════════ */}
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
            opacity: scene3Op,
          }}
        >
          <Scene3_Survey frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Craving Triggers + Excuse Bubbles
// ═══════════════════════════════════════════════════════════
const Scene1_Craving: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Brain icon with pulsing craving glow
  const brainOp = fadeIn(frame, F_CODING_CHALLENGE, 20);
  const brainScale = spring({
    frame: Math.max(0, frame - F_CODING_CHALLENGE),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Pulsing glow on brain (craving intensifying)
  const pulsePhase = (frame - F_CRAVING) * 0.08;
  const pulseGlow = frame >= F_CRAVING
    ? interpolate(Math.sin(pulsePhase), [-1, 1], [10, 35], clamp)
    : 0;

  // "craving" label under brain
  const cravingLabelOp = fadeIn(frame, F_CRAVING, 15);
  const cravingLabelY = slideUp(frame, F_CRAVING, 15);

  // Bug icon representing "solvable bug"
  const bugOp = fadeIn(frame, F_SOLVABLE_BUG, 15);
  const bugY = slideUp(frame, F_SOLVABLE_BUG, 15);

  // "generating excuses" label
  const excusesLabelOp = fadeIn(frame, F_EXCUSES, 12);

  // Individual excuse bubbles
  const excuse1Op = fadeIn(frame, F_FASTER, 15);
  const excuse1Y = slideUp(frame, F_FASTER, 15);

  const excuse2Op = fadeIn(frame, F_LEARN, 15);
  const excuse2Y = slideUp(frame, F_LEARN, 15);

  const excuse3Op = fadeIn(frame, F_EFFICIENT, 15);
  const excuse3Y = slideUp(frame, F_EFFICIENT, 15);

  // Strikethrough all excuses when "efficiency isn't the real driver"
  const strikeProgress = interpolate(
    frame, [F_NOT_DRIVER, F_NOT_DRIVER + 25], [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // "THE CRAVING" big reveal
  const revealOp = fadeIn(frame, F_CRAVING_REVEAL, 15);
  const revealScale = spring({
    frame: Math.max(0, frame - F_CRAVING_REVEAL),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Excuses fade when reveal happens
  const excusesFade = frame >= F_CRAVING_REVEAL
    ? interpolate(frame, [F_CRAVING_REVEAL, F_CRAVING_REVEAL + 20], [1, 0.3], clamp)
    : 1;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 80, width: "100%" }}>
      {/* Left side: Brain + Bug context */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          flex: "0 0 300px",
        }}
      >
        {/* Brain icon */}
        <div
          style={{
            opacity: brainOp,
            transform: `scale(${brainScale})`,
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
              borderRadius: "50%",
              background: `${PURPLE}12`,
              border: `2px solid ${PURPLE}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${pulseGlow}px ${PURPLE}40`,
            }}
          >
            <Brain size={56} color={PURPLE} weight="duotone" />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: TEXT_DIM,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            YOUR BRAIN
          </span>
        </div>

        {/* Craving label */}
        <div
          style={{
            opacity: cravingLabelOp,
            transform: `translateY(${cravingLabelY}px)`,
            padding: "8px 20px",
            borderRadius: 8,
            background: `${RED}12`,
            border: `1px solid ${RED}30`,
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              color: RED,
            }}
          >
            CRAVING TRIGGERED
          </span>
        </div>

        {/* Bug context */}
        <div
          style={{
            opacity: bugOp,
            transform: `translateY(${bugY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            borderRadius: 10,
            background: `${AMBER}08`,
            border: `1px solid ${AMBER}15`,
          }}
        >
          <Warning size={20} color={AMBER} weight="duotone" />
          <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_MUTED }}>
            Solvable bug in front of you
          </span>
        </div>
      </div>

      {/* Right side: Excuses + Reveal */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flex: 1,
          opacity: excusesFade,
        }}
      >
        {/* "Generating excuses" label */}
        <div style={{ opacity: excusesLabelOp, marginBottom: 4 }}>
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
            BRAIN GENERATES EXCUSES
          </span>
        </div>

        {/* Excuse 1: "It'll be faster" */}
        <ExcuseBubble
          text={'"It\'ll be faster this way"'}
          icon={<Lightning size={22} color={AMBER} weight="duotone" />}
          color={AMBER}
          opacity={excuse1Op}
          translateY={excuse1Y}
          strikethrough={strikeProgress}
        />

        {/* Excuse 2: "I can learn from the AI" */}
        <ExcuseBubble
          text={'"I can learn from the AI\'s approach"'}
          icon={<BookOpen size={22} color={BLUE} weight="duotone" />}
          color={BLUE}
          opacity={excuse2Op}
          translateY={excuse2Y}
          strikethrough={strikeProgress}
        />

        {/* Excuse 3: "I'm being efficient" */}
        <ExcuseBubble
          text={'"I\'m being efficient with my time"'}
          icon={<Timer size={22} color={GREEN} weight="duotone" />}
          color={GREEN}
          opacity={excuse3Op}
          translateY={excuse3Y}
          strikethrough={strikeProgress}
        />
      </div>

      {/* THE CRAVING reveal — center overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: revealOp,
          transform: `scale(${revealScale})`,
        }}
      >
        <div
          style={{
            padding: "20px 48px",
            borderRadius: 12,
            background: `${RED}15`,
            border: `2px solid ${RED}50`,
            boxShadow: `0 0 40px ${RED}25, inset 0 0 20px ${RED}08`,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <ChatCircleDots size={32} color={RED} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: RED,
              letterSpacing: 1,
              textShadow: `0 0 20px ${RED}50`,
            }}
          >
            THE CRAVING IS THE DRIVER
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Knowing Doesn't Help — Addiction Trap
// ═══════════════════════════════════════════════════════════
const Scene2_Addiction: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Brain icon with chain/lock
  const brainOp = fadeIn(frame, SCENE2_START + 10, 18);
  const brainScale = spring({
    frame: Math.max(0, frame - (SCENE2_START + 10)),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // "Knowing you're addicted" text
  const knowingOp = fadeIn(frame, F_KNOWING_ADDICTED, 15);
  const knowingY = slideUp(frame, F_KNOWING_ADDICTED, 15);

  // "doesn't help you stop" — strikethrough on "knowing"
  const doesntHelpOp = fadeIn(frame, 4001, 15);

  // "Addiction never works that way" — final statement
  const neverWorksOp = fadeIn(frame, F_ADDICTION_NEVER, 15);
  const neverWorksY = slideUp(frame, F_ADDICTION_NEVER, 15);

  // Lock pulse (trapped feeling)
  const lockPulse = frame >= F_KNOWING_ADDICTED
    ? interpolate(Math.sin((frame - F_KNOWING_ADDICTED) * 0.1), [-1, 1], [15, 30], clamp)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
      {/* Brain with lock overlay */}
      <div
        style={{
          opacity: brainOp,
          transform: `scale(${brainScale})`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `${PURPLE}10`,
            border: `2px solid ${PURPLE}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${lockPulse}px ${RED}30`,
            position: "relative",
          }}
        >
          <Brain size={60} color={PURPLE} weight="duotone" />
          {/* Lock overlay */}
          <div
            style={{
              position: "absolute",
              bottom: -8,
              right: -8,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: `${RED}20`,
              border: `2px solid ${RED}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: fadeIn(frame, F_KNOWING_ADDICTED + 10, 12),
            }}
          >
            <Lock size={22} color={RED} weight="fill" />
          </div>
        </div>
      </div>

      {/* "Knowing you're addicted..." */}
      <div
        style={{
          opacity: knowingOp,
          transform: `translateY(${knowingY}px)`,
          textAlign: "center",
          maxWidth: 700,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 26,
            fontWeight: 600,
            color: TEXT_PRIMARY,
            lineHeight: 1.5,
          }}
        >
          Knowing you're addicted{" "}
          <span
            style={{
              color: RED,
              opacity: doesntHelpOp,
              fontWeight: 700,
            }}
          >
            doesn't help you stop
          </span>
        </span>
      </div>

      {/* "Addiction never works that way" */}
      <div
        style={{
          opacity: neverWorksOp,
          transform: `translateY(${neverWorksY}px)`,
          padding: "14px 32px",
          borderRadius: 10,
          background: `${RED}0c`,
          border: `1px solid ${RED}25`,
          boxShadow: `0 0 20px ${RED}10`,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 18,
            fontWeight: 600,
            color: RED,
            letterSpacing: 0.5,
          }}
        >
          Addiction never works that way.
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: GitHub Survey — 91% vs 12%
// ═══════════════════════════════════════════════════════════
const Scene3_Survey: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Title: "GitHub Copilot Survey, 2023"
  const titleOp = fadeIn(frame, SCENE3_START + 10, 18);
  const titleY = slideUp(frame, SCENE3_START + 10, 18);

  // Copilot context
  const copilotOp = fadeIn(frame, F_COPILOT, 15);
  const copilotY = slideUp(frame, F_COPILOT, 15);

  // 91% bar — "wanted to reduce"
  const bar91Start = F_91_PERCENT;
  const bar91Fill = interpolate(
    frame, [bar91Start, bar91Start + 40], [0, 91],
    { ...clamp, easing: easeOutCubic }
  );
  const bar91Op = fadeIn(frame, bar91Start, 15);
  const bar91Y = slideUp(frame, bar91Start, 15);

  // Counter for 91%
  const count91 = Math.round(bar91Fill);

  // 12% bar — "actually managed"
  const bar12Start = F_12_PERCENT;
  const bar12Fill = interpolate(
    frame, [bar12Start, bar12Start + 30], [0, 12],
    { ...clamp, easing: easeOutCubic }
  );
  const bar12Op = fadeIn(frame, bar12Start, 15);
  const bar12Y = slideUp(frame, bar12Start, 15);

  const count12 = Math.round(bar12Fill);

  // "for more than a week" badge
  const weekBadgeOp = fadeIn(frame, 4517, 12);

  // Bottom text: "Knowledge doesn't override neurochemical compulsion"
  const bottomOp = fadeIn(frame, F_NEUROCHEMICAL, 20);
  const bottomY = slideUp(frame, F_NEUROCHEMICAL, 20);

  // Glow on 91% when 12% appears (contrast shock)
  const contrastGlow = frame >= bar12Start
    ? interpolate(frame, [bar12Start, bar12Start + 20], [0, 30], clamp)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%", maxWidth: 1200 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <ChartBar size={32} color={CYAN} weight="duotone" />
        <span style={{ fontSize: 26, fontWeight: 700, color: TEXT_PRIMARY }}>
          GitHub Developer Survey
        </span>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 16,
            fontWeight: 600,
            color: TEXT_DIM,
            marginLeft: 8,
          }}
        >
          2023
        </span>
      </div>

      {/* Copilot context */}
      <div
        style={{
          opacity: copilotOp,
          transform: `translateY(${copilotY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 20px",
          borderRadius: 10,
          background: `${PURPLE}08`,
          border: `1px solid ${PURPLE}15`,
          alignSelf: "flex-start",
        }}
      >
        <Skull size={20} color={PURPLE} weight="duotone" />
        <span style={{ fontSize: 15, fontWeight: 500, color: TEXT_MUTED }}>
          Developers who recognized over-dependence on Copilot
        </span>
      </div>

      {/* 91% Bar */}
      <div
        style={{
          opacity: bar91Op,
          transform: `translateY(${bar91Y}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 52,
              fontWeight: 700,
              color: AMBER,
              letterSpacing: -2,
              textShadow: `0 0 ${contrastGlow}px ${AMBER}50`,
            }}
          >
            {count91}%
          </span>
          <span style={{ fontSize: 18, fontWeight: 500, color: TEXT_MUTED }}>
            wanted to reduce their usage
          </span>
        </div>
        {/* Bar track */}
        <div
          style={{
            width: "100%",
            height: 44,
            borderRadius: 12,
            background: "#1a1a2e",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${bar91Fill}%`,
              height: "100%",
              borderRadius: 12,
              background: `linear-gradient(90deg, ${AMBER}50, ${AMBER}90)`,
              boxShadow: bar91Fill > 50 ? `0 0 20px ${AMBER}30` : "none",
            }}
          />
          {/* Shimmer */}
          {bar91Fill > 0 && bar91Fill < 91 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${bar91Fill - 10}%`,
                width: "10%",
                height: "100%",
                background: `linear-gradient(90deg, transparent, ${AMBER}20, transparent)`,
              }}
            />
          )}
        </div>
      </div>

      {/* 12% Bar */}
      <div
        style={{
          opacity: bar12Op,
          transform: `translateY(${bar12Y}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 52,
              fontWeight: 700,
              color: RED,
              letterSpacing: -2,
            }}
          >
            {count12}%
          </span>
          <span style={{ fontSize: 18, fontWeight: 500, color: TEXT_MUTED }}>
            actually managed to do it
          </span>
          {/* "for more than a week" */}
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: RED,
              opacity: weekBadgeOp,
              padding: "4px 12px",
              borderRadius: 6,
              background: `${RED}12`,
              border: `1px solid ${RED}25`,
            }}
          >
            for more than a week
          </span>
        </div>
        {/* Bar track */}
        <div
          style={{
            width: "100%",
            height: 44,
            borderRadius: 12,
            background: "#1a1a2e",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${bar12Fill}%`,
              height: "100%",
              borderRadius: 12,
              background: `linear-gradient(90deg, ${RED}50, ${RED}90)`,
            }}
          />
        </div>
      </div>

      {/* Drop arrow between bars — visual emphasis on the gap */}
      <div
        style={{
          opacity: bar12Op,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <ArrowDown size={24} color={RED} weight="bold" />
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: RED,
          }}
        >
          79% DROP-OFF
        </span>
        <ArrowDown size={24} color={RED} weight="bold" />
      </div>

      {/* Bottom: neurochemical compulsion */}
      <div
        style={{
          opacity: bottomOp,
          transform: `translateY(${bottomY}px)`,
          padding: "16px 28px",
          borderRadius: 12,
          background: `${RED}08`,
          border: `1px solid ${RED}20`,
          boxShadow: `0 0 25px ${RED}10`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 19,
            fontWeight: 600,
            color: TEXT_PRIMARY,
            lineHeight: 1.6,
          }}
        >
          Knowledge that something is bad for you{" "}
          <span style={{ color: RED, fontWeight: 700 }}>
            doesn't override
          </span>
          {" "}the neurochemical compulsion
        </span>
      </div>
    </div>
  );
};

export default Generated_TheCravingTrap;
