import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { Brain, Scales, Lightning, Warning, Trash, Timer, ArrowsClockwise, ShieldCheck, Barbell, UserFocus, Robot, CheckCircle } from "@phosphor-icons/react";

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
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from word-level timestamps
 * ═══════════════════════════════════════════════════════════
 * "isn't about becoming an AI purist"        → f8258
 * "maintaining the cognitive flexibility"     → f8414-8485
 * "makes you valuable as a developer"        → f8505-8562
 * "When AI inevitably fails"                 → f8583-8641
 * "hallucinates"                             → f8652-8672
 * "deprecated solutions"                     → f8704-8748
 * "problem-solving muscles to still work"    → f8783-8839
 * "developers who will thrive"               → f8878-8921
 * "AI-dominated future"                      → f8932-8986
 * "prompt engineer the best"                 → f9031-9078
 * "think through problems independently"     → f9134-9189
 * "brains haven't outsourced reasoning"      → f9265-9341
 * "external systems"                         → f9347-9385
 * "Delete your AI shortcuts right now"       → f9421-9477
 * "Not permanently, just for today"          → f9497-9561
 * "Set a ten-minute timer"                   → f9586-9623
 * "tackle your next coding problem"          → f9640-9688
 * "without reaching for assistance"          → f9697-9744
 * "Your brain will resist"                   → f9765-9806
 * "resistance is exactly the proof"          → f9845-9906
 * "choosing to use it"                       → f10084-10119
 * "instead of being compelled"               → f10129-10167
 * "Start building that friction"             → f10205-10245
 * "problem-solving ability atrophies"        → f10291-10385
 */

// ─── Scene boundaries (GLOBAL frames) ────────────────────
const S1_START = 8258;
const S1_END = 8870;
const S2_START = 8850;
const S2_END = 9410;
const S3_START = 9390;
// S3 goes to 10415

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_TakeBackControl: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene crossfade opacities
  const scene1Op = frame < S1_END - 20 ? 1 : fadeOut(frame, S1_END - 20, 20);
  const scene2Op =
    interpolate(frame, [S2_START, S2_START + 20], [0, 1], clamp) *
    interpolate(frame, [S2_END - 20, S2_END], [1, 0], clamp);
  const scene3Op = interpolate(frame, [S3_START, S3_START + 20], [0, 1], clamp);

  const showScene1 = frame >= S1_START && frame < S1_END;
  const showScene2 = frame >= S2_START && frame < S2_END;
  const showScene3 = frame >= S3_START;

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
      {/* ═══ SCENE 1: Cognitive Flexibility Balance ═══════════ */}
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
          <Scene1_Balance frame={frame} fps={fps} />
        </div>
      )}

      {/* ═══ SCENE 2: Who Thrives — Independent Thinking ═════ */}
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
          <Scene2_Thrive frame={frame} fps={fps} />
        </div>
      )}

      {/* ═══ SCENE 3: Take Action — Delete, Timer, Choose ════ */}
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
            gap: 36,
            opacity: scene3Op,
          }}
        >
          <Scene3_Action frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Cognitive Flexibility — Balance Scale
// "Not about being AI purist... maintaining cognitive flexibility"
// "When AI fails/hallucinates... need problem-solving muscles"
// ═══════════════════════════════════════════════════════════
const Scene1_Balance: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Title: "maintaining the cognitive flexibility" → f8414
  const titleOp = fadeIn(frame, 8258, 20);
  const titleY = slideUp(frame, 8258, 20);

  // Scale icon appears → f8414 "maintaining"
  const scaleOp = fadeIn(frame, 8400, 18);
  const scaleScale = spring({
    frame: Math.max(0, frame - 8400),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Left side: "AI Tools" — f8303 "purist" → tools are fine
  const leftOp = fadeIn(frame, 8350, 18);
  const leftSlide = slideUp(frame, 8350, 18);

  // Right side: "Independent Thinking" — f8461 "flexibility"
  const rightOp = fadeIn(frame, 8460, 18);
  const rightSlide = slideUp(frame, 8460, 18);

  // "valuable as a developer" f8519 — right side glows
  const rightGlow = interpolate(frame, [8519, 8540], [0, 30], clamp);

  // AI fails section — f8583 "When AI inevitably fails"
  const failsOp = fadeIn(frame, 8580, 15);
  const failsY = slideUp(frame, 8580, 15);

  // Warning items stagger: fails f8624, hallucinates f8652, deprecated f8704
  const warn1Op = fadeIn(frame, 8620, 12);
  const warn2Op = fadeIn(frame, 8650, 12);
  const warn3Op = fadeIn(frame, 8700, 12);

  // "problem-solving muscles" f8783 — muscle metaphor
  const muscleOp = fadeIn(frame, 8780, 18);
  const muscleScale = spring({
    frame: Math.max(0, frame - 8780),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // "to still work" f8829 — glow pulse
  const muscleGlow = interpolate(frame, [8829, 8850], [0, 25], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: -0.5,
          }}
        >
          Cognitive Flexibility
        </span>
        <p style={{ fontSize: 16, fontWeight: 500, color: TEXT_DIM, marginTop: 8 }}>
          What makes you valuable as a developer
        </p>
      </div>

      {/* Balance visual */}
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        {/* Left: AI Tools */}
        <div
          style={{
            opacity: leftOp,
            transform: `translateY(${leftSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: 280,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: `linear-gradient(135deg, ${BLUE}20, ${BLUE}08)`,
              border: `1.5px solid ${BLUE}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${BLUE}15`,
            }}
          >
            <Robot size={36} color={BLUE} weight="duotone" />
          </div>
          <span style={{ color: BLUE, fontSize: 18, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
            AI TOOLS
          </span>
          <span style={{ color: TEXT_DIM, fontSize: 14, fontWeight: 500, textAlign: "center" }}>
            Helpful, not harmful
          </span>
        </div>

        {/* Scale center */}
        <div
          style={{
            opacity: scaleOp,
            transform: `scale(${scaleScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Scales size={56} color={AMBER} weight="duotone" style={{ filter: `drop-shadow(0 0 12px ${AMBER}40)` }} />
          <span style={{ color: AMBER, fontSize: 13, fontWeight: 600, fontFamily: "'SF Mono', monospace", letterSpacing: 1.5, textTransform: "uppercase" as const }}>
            BALANCE
          </span>
        </div>

        {/* Right: Independent Thinking */}
        <div
          style={{
            opacity: rightOp,
            transform: `translateY(${rightSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: 280,
            boxShadow: rightGlow > 0 ? `0 0 ${rightGlow}px ${GREEN}20` : "none",
            padding: 16,
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: `linear-gradient(135deg, ${GREEN}20, ${GREEN}08)`,
              border: `1.5px solid ${GREEN}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${15 + rightGlow}px ${GREEN}${rightGlow > 10 ? "30" : "15"}`,
            }}
          >
            <Brain size={36} color={GREEN} weight="duotone" />
          </div>
          <span style={{ color: GREEN, fontSize: 18, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
            YOUR THINKING
          </span>
          <span style={{ color: TEXT_DIM, fontSize: 14, fontWeight: 500, textAlign: "center" }}>
            The part that matters
          </span>
        </div>
      </div>

      {/* When AI fails — warning badges */}
      <div
        style={{
          opacity: failsOp,
          transform: `translateY(${failsY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginTop: 8,
        }}
      >
        <span style={{ color: TEXT_DIM, fontSize: 14, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" as const }}>
          When AI inevitably...
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Fails", op: warn1Op, color: RED },
            { label: "Hallucinates", op: warn2Op, color: AMBER },
            { label: "Gives deprecated solutions", op: warn3Op, color: PURPLE },
          ].map((w) => (
            <div
              key={w.label}
              style={{
                opacity: w.op,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                background: `${w.color}10`,
                border: `1px solid ${w.color}25`,
                borderRadius: 10,
              }}
            >
              <Warning size={18} color={w.color} weight="duotone" />
              <span style={{ color: w.color, fontSize: 14, fontWeight: 600 }}>{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Problem-solving muscles */}
      <div
        style={{
          opacity: muscleOp,
          transform: `scale(${muscleScale})`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 28px",
          background: `${CYAN}10`,
          border: `1.5px solid ${CYAN}30`,
          borderRadius: 12,
          boxShadow: `0 0 ${muscleGlow}px ${CYAN}25`,
        }}
      >
        <Barbell size={28} color={CYAN} weight="duotone" />
        <span style={{ color: CYAN, fontSize: 18, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
          Problem-solving muscles must still work
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Who Thrives — Not prompt engineers, independent thinkers
// ═══════════════════════════════════════════════════════════
const Scene2_Thrive: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // "developers who will thrive" f8878 — title
  const titleOp = fadeIn(frame, 8875, 20);
  const titleY = slideUp(frame, 8875, 20);

  // "AI-dominated future" f8932 — subtitle
  const subOp = fadeIn(frame, 8930, 15);

  // LEFT: "Best Prompt Engineer" f9031 — appears then dims
  const promptOp = fadeIn(frame, 9028, 18);
  const promptSlide = slideUp(frame, 9028, 18);
  // Dims after f9078 "the best" → strikethrough effect
  const promptDim = interpolate(frame, [9100, 9130], [1, 0.25], clamp);
  const promptStrike = interpolate(frame, [9100, 9130], [0, 1], clamp);

  // RIGHT: "Independent Thinker" f9134 "think" — appears and glows
  const thinkerOp = fadeIn(frame, 9130, 18);
  const thinkerSlide = slideUp(frame, 9130, 18);
  const thinkerGlow = interpolate(frame, [9160, 9189], [0, 30], clamp);

  // "whose brains haven't outsourced reasoning" f9265
  const outsourceOp = fadeIn(frame, 9260, 18);
  const outsourceY = slideUp(frame, 9260, 18);

  // Brain arrows going OUT (outsourcing) f9265
  const arrowsOutProgress = interpolate(frame, [9280, 9320], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });

  // "external systems" f9347 — arrows turn red/stop
  const arrowsDanger = interpolate(frame, [9347, 9370], [0, 1], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      {/* Title */}
      <div style={{ textAlign: "center", opacity: titleOp, transform: `translateY(${titleY}px)` }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY }}>
          Who Will Thrive?
        </span>
        <p style={{ fontSize: 16, fontWeight: 500, color: AMBER, marginTop: 8, opacity: subOp }}>
          In an AI-dominated future
        </p>
      </div>

      {/* Comparison: Prompt Engineer vs Independent Thinker */}
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        {/* LEFT — Prompt Engineer (dims) */}
        <div
          style={{
            opacity: promptOp * promptDim,
            transform: `translateY(${promptSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: 320,
            padding: 24,
            borderRadius: 12,
            background: `${RED}06`,
            border: `1px solid ${RED}15`,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: `linear-gradient(135deg, ${PURPLE}15, ${PURPLE}05)`,
              border: `1.5px solid ${PURPLE}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Robot size={32} color={PURPLE} weight="duotone" />
          </div>
          <span style={{ color: PURPLE, fontSize: 18, fontWeight: 700, fontFamily: "'SF Mono', monospace", position: "relative" }}>
            BEST PROMPT ENGINEER
            {/* Strikethrough line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                width: `${promptStrike * 100}%`,
                height: 2,
                background: RED,
                boxShadow: `0 0 8px ${RED}60`,
              }}
            />
          </span>
          <span style={{ color: TEXT_DIM, fontSize: 14, fontWeight: 500 }}>Not the answer</span>
        </div>

        {/* VS divider */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span
            style={{
              color: TEXT_DIM,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "'SF Mono', monospace",
              opacity: promptOp,
            }}
          >
            VS
          </span>
        </div>

        {/* RIGHT — Independent Thinker (glows) */}
        <div
          style={{
            opacity: thinkerOp,
            transform: `translateY(${thinkerSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: 320,
            padding: 24,
            borderRadius: 12,
            background: `${GREEN}08`,
            border: `1.5px solid ${GREEN}25`,
            boxShadow: `0 0 ${thinkerGlow}px ${GREEN}20`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: `linear-gradient(135deg, ${GREEN}20, ${GREEN}08)`,
              border: `1.5px solid ${GREEN}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${15 + thinkerGlow}px ${GREEN}20`,
            }}
          >
            <Brain size={32} color={GREEN} weight="duotone" />
          </div>
          <span style={{ color: GREEN, fontSize: 18, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
            INDEPENDENT THINKER
          </span>
          <span style={{ color: TEXT_DIM, fontSize: 14, fontWeight: 500 }}>
            Can think through problems alone
          </span>
        </div>
      </div>

      {/* Outsourced reasoning visual — brain with arrows going out */}
      <div
        style={{
          opacity: outsourceOp,
          transform: `translateY(${outsourceY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          marginTop: 12,
        }}
      >
        <span style={{ color: TEXT_DIM, fontSize: 14, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" as const }}>
          Don't outsource your reasoning
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Brain center */}
          <div style={{ position: "relative", width: 200, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain
              size={40}
              color={arrowsDanger > 0.5 ? RED : TEXT_PRIMARY}
              weight="duotone"
              style={{
                filter: arrowsDanger > 0.5 ? `drop-shadow(0 0 8px ${RED}60)` : "none",
              }}
            />
            {/* Arrows flowing outward */}
            {[-1, 1].map((dir) => (
              <div
                key={dir}
                style={{
                  position: "absolute",
                  left: dir === -1 ? `${20 - arrowsOutProgress * 30}%` : undefined,
                  right: dir === 1 ? `${20 - arrowsOutProgress * 30}%` : undefined,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: arrowsDanger > 0.5 ? `${RED}30` : `${AMBER}30`,
                  border: `1px solid ${arrowsDanger > 0.5 ? RED : AMBER}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: arrowsOutProgress,
                }}
              >
                <ArrowsClockwise
                  size={14}
                  color={arrowsDanger > 0.5 ? RED : AMBER}
                  weight="bold"
                />
              </div>
            ))}
          </div>
          <span
            style={{
              color: arrowsDanger > 0.5 ? RED : AMBER,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'SF Mono', monospace",
              opacity: interpolate(frame, [9347, 9365], [0, 1], clamp),
            }}
          >
            → external systems
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Take Action — Delete, Timer, Choose vs Compelled
// ═══════════════════════════════════════════════════════════
const Scene3_Action: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // "Delete your AI shortcuts right now" f9421
  const deleteOp = fadeIn(frame, 9418, 18);
  const deleteScale = spring({
    frame: Math.max(0, frame - 9418),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // "Not permanently, just for today" f9497
  const tempOp = fadeIn(frame, 9494, 15);
  const tempY = slideUp(frame, 9494, 15);

  // "Set a ten-minute timer" f9586
  const timerOp = fadeIn(frame, 9583, 18);
  const timerScale = spring({
    frame: Math.max(0, frame - 9583),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Timer countdown visual (animated digits)
  const timerProgress = interpolate(frame, [9600, 9740], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });
  const timerMinutes = Math.round(interpolate(timerProgress, [0, 1], [10, 0], clamp));

  // "tackle your next coding problem" f9640
  const tackleOp = fadeIn(frame, 9637, 15);
  const tackleY = slideUp(frame, 9637, 15);

  // "without reaching for assistance" f9697
  const withoutOp = fadeIn(frame, 9694, 15);

  // Delete/timer section fades out before resist section
  const section1Fade = interpolate(frame, [9750, 9770], [1, 0], clamp);

  // "Your brain will resist" f9765
  const resistOp = interpolate(frame, [9762, 9777], [0, 1], { ...clamp, easing: easeOutCubic });
  const resistY = slideUp(frame, 9762, 18);

  // "resistance is exactly the proof" f9845
  const proofOp = fadeIn(frame, 9842, 18);
  const proofScale = spring({
    frame: Math.max(0, frame - 9842),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // Resist/proof section fades
  const section2Fade = frame < 9940 ? 1 : fadeOut(frame, 9940, 20);

  // "choosing to use it" f10084 vs "being compelled" f10150
  const chooseOp = fadeIn(frame, 10050, 20);
  const chooseY = slideUp(frame, 10050, 20);

  // "choosing" label f10084
  const choosingOp = fadeIn(frame, 10080, 15);
  const choosingGlow = interpolate(frame, [10084, 10110], [0, 25], clamp);

  // "compelled" label f10150
  const compelledOp = fadeIn(frame, 10145, 15);

  // "Start building that friction" f10205
  const frictionOp = fadeIn(frame, 10200, 20);
  const frictionY = slideUp(frame, 10200, 20);

  // Friction bar grows f10234-10245
  const frictionFill = interpolate(frame, [10234, 10350], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });

  // "problem-solving ability completely atrophies" f10291
  const atrophyOp = fadeIn(frame, 10288, 15);

  // Final glow f10355 "atrophies" — emphasis
  const finalGlow = interpolate(frame, [10355, 10385], [0, 35], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, width: "100%" }}>
      {/* Section 1: Delete + Timer (fades out for resist section) */}
      <div
        style={{
          opacity: frame < 9750 ? 1 : section1Fade,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* DELETE YOUR AI SHORTCUTS */}
        <div
          style={{
            opacity: deleteOp,
            transform: `scale(${deleteScale})`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "18px 36px",
            background: `${RED}12`,
            border: `2px solid ${RED}40`,
            borderRadius: 12,
            boxShadow: `0 0 25px ${RED}20`,
          }}
        >
          <Trash size={32} color={RED} weight="duotone" />
          <span style={{ color: RED, fontSize: 24, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
            DELETE AI SHORTCUTS
          </span>
        </div>

        {/* "Not permanently, just for today" */}
        <div style={{ opacity: tempOp, transform: `translateY(${tempY}px)` }}>
          <span style={{ color: TEXT_DIM, fontSize: 16, fontWeight: 500, fontStyle: "italic" }}>
            Not permanently — just for today
          </span>
        </div>

        {/* Timer + Challenge row */}
        <div style={{ display: "flex", alignItems: "center", gap: 48, marginTop: 8 }}>
          {/* Timer */}
          <div
            style={{
              opacity: timerOp,
              transform: `scale(${timerScale})`,
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
                borderRadius: 60,
                background: `${AMBER}10`,
                border: `3px solid ${AMBER}50`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${AMBER}15`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Timer size={28} color={AMBER} weight="duotone" />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 32,
                    fontWeight: 700,
                    color: AMBER,
                    letterSpacing: -2,
                    textShadow: `0 0 12px ${AMBER}40`,
                    marginTop: 2,
                  }}
                >
                  {timerMinutes}:00
                </span>
              </div>
            </div>
            <span style={{ color: AMBER, fontSize: 13, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>
              SET A TIMER
            </span>
          </div>

          {/* Challenge text */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ opacity: tackleOp, transform: `translateY(${tackleY}px)` }}>
              <span style={{ color: TEXT_PRIMARY, fontSize: 18, fontWeight: 600 }}>
                Tackle your next coding problem
              </span>
            </div>
            <div
              style={{
                opacity: withoutOp,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                background: `${BLUE}10`,
                border: `1px solid ${BLUE}20`,
                borderRadius: 10,
              }}
            >
              <ShieldCheck size={22} color={BLUE} weight="duotone" />
              <span style={{ color: BLUE, fontSize: 16, fontWeight: 600 }}>
                Without reaching for AI assistance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Resistance = Proof (fades in/out) */}
      {frame >= 9760 && (
        <div
          style={{
            opacity: resistOp * section2Fade,
            transform: `translateY(${resistY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* "Your brain will resist" */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 28px",
              background: `${PURPLE}10`,
              border: `1px solid ${PURPLE}25`,
              borderRadius: 12,
            }}
          >
            <Lightning size={24} color={PURPLE} weight="duotone" />
            <span style={{ color: PURPLE, fontSize: 20, fontWeight: 700 }}>
              Your brain will resist this change
            </span>
          </div>

          {/* "Resistance = proof" */}
          <div
            style={{
              opacity: proofOp,
              transform: `scale(${proofScale})`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 32px",
              background: `${GREEN}10`,
              border: `2px solid ${GREEN}40`,
              borderRadius: 12,
              boxShadow: `0 0 25px ${GREEN}20`,
            }}
          >
            <CheckCircle size={28} color={GREEN} weight="duotone" />
            <span style={{ color: GREEN, fontSize: 22, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
              That resistance = PROOF you need this
            </span>
          </div>
        </div>
      )}

      {/* Section 3: Choosing vs Compelled + Friction */}
      {frame >= 10040 && (
        <div
          style={{
            opacity: chooseOp,
            transform: `translateY(${chooseY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          {/* CHOOSING vs COMPELLED */}
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            {/* Choosing */}
            <div
              style={{
                opacity: choosingOp,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "20px 36px",
                background: `${GREEN}10`,
                border: `2px solid ${GREEN}40`,
                borderRadius: 12,
                boxShadow: `0 0 ${choosingGlow}px ${GREEN}25`,
              }}
            >
              <UserFocus size={32} color={GREEN} weight="duotone" />
              <span style={{ color: GREEN, fontSize: 22, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
                CHOOSING
              </span>
              <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 500 }}>to use AI</span>
            </div>

            <span
              style={{
                color: TEXT_DIM,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "'SF Mono', monospace",
              }}
            >
              not
            </span>

            {/* Compelled */}
            <div
              style={{
                opacity: compelledOp,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "20px 36px",
                background: `${RED}08`,
                border: `1px solid ${RED}20`,
                borderRadius: 12,
              }}
            >
              <Lightning size={32} color={RED} weight="duotone" />
              <span style={{ color: RED, fontSize: 22, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
                COMPELLED
              </span>
              <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 500 }}>to use AI</span>
            </div>
          </div>

          {/* Build Friction bar */}
          <div
            style={{
              opacity: frictionOp,
              transform: `translateY(${frictionY}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              width: 600,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Barbell size={22} color={CYAN} weight="duotone" />
              <span style={{ color: CYAN, fontSize: 16, fontWeight: 700, fontFamily: "'SF Mono', monospace", letterSpacing: 1 }}>
                BUILD THAT FRICTION TODAY
              </span>
            </div>
            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: 20,
                borderRadius: 10,
                background: "#1a1a2e",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${frictionFill * 100}%`,
                  height: "100%",
                  borderRadius: 10,
                  background: `linear-gradient(90deg, ${CYAN}60, ${GREEN}80)`,
                  boxShadow: frictionFill > 0.5 ? `0 0 ${finalGlow}px ${GREEN}40` : "none",
                }}
              />
            </div>

            {/* Atrophy warning */}
            <div
              style={{
                opacity: atrophyOp,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Warning size={16} color={AMBER} weight="duotone" />
              <span style={{ color: AMBER, fontSize: 14, fontWeight: 600 }}>
                Before your problem-solving ability atrophies
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_TakeBackControl;
