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
  orange: "#f97316",
  pink: "#ec4899",
};

const BG = "#0a0a14";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";
const DOPAMINE = "#a855f7";
const ADDICTION = "#ef4444";

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });

// ═══════════════════════════════════════════════════════════
// VOICEOVER TIMESTAMPS (ABSOLUTE frames at 30fps)
// ═══════════════════════════════════════════════════════════
// "Here's what's actually going on inside your head" → 1029
// "Every time you hit a coding problem" → 1147
// "reach for chat GPT" → 1212
// "brain releases a small hit of dopamine" → 1277
// "Not when you solve the problem" → 1358
// "the moment you decide to ask for help" → 1416
// "same neurochemical pathway" → 1506
// "slot machines so addictive" → 1564
// "The anticipation of the reward" → 1633
// "not the reward itself" → 1691
// --- SCENE 2 ---
// "Meta's internal research team" → 1760
// "engineers" → 1833
// "forty-seven coding tasks per day" → 1945
// "once every ten minutes" → 2048
// "eight-hour workday" → 2104
// "Each query triggers that same dopamine hit" → 2157
// "training your brain to crave the next fix" → 2233
// "behavioral addiction loop" → 2391
// --- SCENE 3 ---
// "The problem gets worse" → 2455
// "tolerance builds over time" → 2508
// "complex algorithms" → 2632
// "basic syntax" → 2703
// "Google...asking ChatGPT how to write for loops" → 2782
// "for loops" → 2885
// "brain stops bothering to remember" → 2980
// "calculator for addition permanently attached" → 3132

// Scene boundaries (ABSOLUTE frames)
const SCENE1_START = 1029;
const SCENE1_END = 1760;
const SCENE2_START = 1720;
const SCENE2_END = 2440;
const SCENE3_START = 2410;
// SCENE3 goes to ~3216

// ═══════════════════════════════════════════════════════════
// DOPAMINE PULSE — reusable animated ring
// ═══════════════════════════════════════════════════════════
const DopaminePulse: React.FC<{
  frame: number;
  triggerFrame: number;
  x: number;
  y: number;
  color?: string;
}> = ({ frame, triggerFrame, x, y, color = DOPAMINE }) => {
  const localF = frame - triggerFrame;
  if (localF < 0 || localF > 40) return null;

  const scale = interpolate(localF, [0, 40], [0.3, 2.5], { ...clamp, easing: Easing.out(Easing.cubic) });
  const opacity = interpolate(localF, [0, 10, 40], [0, 0.7, 0], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: x - 40,
        top: y - 40,
        width: 80,
        height: 80,
        borderRadius: "50%",
        border: `3px solid ${color}`,
        transform: `scale(${scale})`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: The Dopamine Mechanism
// ═══════════════════════════════════════════════════════════
const Scene1_DopamineMechanism: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const BrainIcon = getIcon("Brain");
  const ChatIcon = getIcon("ChatCircleDots");
  const LightningIcon = getIcon("Lightning");
  const SlotIcon = getIcon("Coin");

  // "Inside your head" — brain appears
  const brainOp = fadeIn(frame, 1029, 20);
  const brainScale = spring({ frame: Math.max(0, frame - 1029), fps, config: { damping: 22, stiffness: 180 } });

  // "coding problem" — problem indicator
  const problemOp = fadeIn(frame, 1165, 15);
  const problemSlide = slideUp(frame, 1165, 15);

  // "reach for ChatGPT" — ChatGPT icon slides in
  const chatOp = fadeIn(frame, 1210, 15);
  const chatSlide = interpolate(frame, [1210, 1225], [40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // "brain releases dopamine" — dopamine spike visualization
  const dopamineOp = fadeIn(frame, 1275, 15);
  const dopamineBarHeight = interpolate(frame, [1275, 1310], [0, 180], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dopamineGlow = interpolate(frame, [1275, 1320], [0, 30], clamp);

  // "Not when you solve...moment you decide to ask" — label switch
  const notSolveOp = fadeIn(frame, 1356, 15);
  const notSolveStrike = interpolate(frame, [1356, 1380], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  const askHelpOp = fadeIn(frame, 1414, 15);
  const askHelpSlide = slideUp(frame, 1414, 15);

  // "slot machines" — slot machine comparison
  const slotOp = fadeIn(frame, 1562, 18);
  const slotScale = spring({ frame: Math.max(0, frame - 1562), fps, config: { damping: 22, stiffness: 180 } });

  // "anticipation of the reward" — anticipation label glows
  const anticipationOp = fadeIn(frame, 1631, 15);
  const anticipationGlow = interpolate(frame, [1631, 1670], [0, 25], clamp);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 80, width: "100%", height: "100%", position: "relative" }}>
      {/* Left side: Brain + Problem */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {/* Brain icon */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${DOPAMINE}18, ${DOPAMINE}06)`,
            border: `2px solid ${DOPAMINE}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${dopamineGlow}px ${DOPAMINE}40`,
            opacity: brainOp,
            transform: `scale(${brainScale})`,
          }}
        >
          <BrainIcon size={64} color={DOPAMINE} weight="duotone" />
        </div>

        {/* Problem indicator */}
        <div
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: `${c.amber}08`,
            border: `1px solid ${c.amber}20`,
            opacity: problemOp,
            transform: `translateY(${problemSlide}px)`,
          }}
        >
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 14, fontWeight: 600, color: c.amber }}>
            ⚠ CODING PROBLEM
          </span>
        </div>
      </div>

      {/* Center: Dopamine spike bar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: dopamineOp }}>
        <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 700, color: DOPAMINE, letterSpacing: 2, textTransform: "uppercase" }}>
          DOPAMINE
        </span>
        <div style={{ width: 60, height: 200, borderRadius: 10, background: "#1a1a2e", position: "relative", overflow: "hidden" }}>
          {/* Fill from bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: dopamineBarHeight,
              borderRadius: 10,
              background: `linear-gradient(0deg, ${DOPAMINE}60, ${DOPAMINE}cc)`,
              boxShadow: `0 0 20px ${DOPAMINE}40`,
            }}
          />
          {/* Shimmer */}
          {dopamineBarHeight > 50 && (
            <div
              style={{
                position: "absolute",
                bottom: dopamineBarHeight - 30,
                left: 0,
                right: 0,
                height: 30,
                background: `linear-gradient(0deg, transparent, ${DOPAMINE}30, transparent)`,
              }}
            />
          )}
        </div>

        {/* "Not when you solve" — crossed out */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minHeight: 60 }}>
          <div style={{ position: "relative", opacity: notSolveOp }}>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: TEXT_DIM }}>
              Solving the problem
            </span>
            {/* Strikethrough line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                height: 2,
                width: `${notSolveStrike}%`,
                background: ADDICTION,
                borderRadius: 1,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: DOPAMINE,
              opacity: askHelpOp,
              transform: `translateY(${askHelpSlide}px)`,
              textShadow: `0 0 15px ${DOPAMINE}30`,
            }}
          >
            Deciding to ask for help
          </span>
        </div>
      </div>

      {/* Right side: ChatGPT + Slot machine comparison */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        {/* ChatGPT icon */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${c.green}18, ${c.green}06)`,
            border: `1.5px solid ${c.green}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 15px ${c.green}15`,
            opacity: chatOp,
            transform: `translateX(${chatSlide}px)`,
          }}
        >
          <ChatIcon size={52} color={c.green} weight="duotone" />
        </div>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15, fontWeight: 600, color: TEXT_MUTED, opacity: chatOp }}>
          ChatGPT
        </span>

        {/* Slot machine comparison */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 10,
            background: `${ADDICTION}08`,
            border: `1px solid ${ADDICTION}20`,
            opacity: slotOp,
            transform: `scale(${slotScale})`,
          }}
        >
          <SlotIcon size={24} color={ADDICTION} weight="duotone" />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 13, fontWeight: 600, color: ADDICTION }}>
            = SLOT MACHINE
          </span>
        </div>

        {/* Anticipation label */}
        <div
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: `${DOPAMINE}08`,
            border: `1px solid ${DOPAMINE}20`,
            boxShadow: `0 0 ${anticipationGlow}px ${DOPAMINE}30`,
            opacity: anticipationOp,
          }}
        >
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: DOPAMINE }}>
            Anticipation &gt; Reward
          </span>
        </div>
      </div>

      {/* Dopamine pulse effects */}
      <DopaminePulse frame={frame} triggerFrame={1285} x={960} y={350} />
      <DopaminePulse frame={frame} triggerFrame={1320} x={960} y={350} color={`${DOPAMINE}80`} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Meta Stats — 47 Tasks / Addiction Loop
// ═══════════════════════════════════════════════════════════
const Scene2_MetaStats: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ChartBarIcon = getIcon("ChartBar");
  const TimerIcon = getIcon("Timer");
  const ArrowClockwiseIcon = getIcon("ArrowsClockwise");

  // "Meta's internal research" — title
  const titleOp = fadeIn(frame, 1758, 18);
  const titleSlide = slideUp(frame, 1758, 18);

  // "forty-seven coding tasks per day" — big number counter
  const counterStart = 1940;
  const counterEnd = 1980;
  const counterValue = Math.round(interpolate(frame, [counterStart, counterEnd], [0, 47], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const counterOp = fadeIn(frame, counterStart - 5, 15);
  const counterScale = spring({ frame: Math.max(0, frame - counterStart), fps, config: { damping: 22, stiffness: 180 } });

  // "once every ten minutes" — timer stat
  const timerOp = fadeIn(frame, 2046, 15);
  const timerSlide = slideUp(frame, 2046, 15);

  // "eight-hour workday" — workday bar visualization
  const workdayOp = fadeIn(frame, 2100, 15);
  // 47 dots across 8 hours — fill progressively
  const dotCount = 24; // Show 24 representative dots
  const dotsVisible = interpolate(frame, [2100, 2160], [0, dotCount], clamp);

  // "Each query triggers that same dopamine hit" — pulse indicators
  const pulseOp = fadeIn(frame, 2155, 15);
  const pulsePhase = interpolate(frame, [2155, 2300], [0, Math.PI * 6], clamp);

  // "training your brain to crave" — addiction text
  const craveOp = fadeIn(frame, 2231, 15);
  const craveSlide = slideUp(frame, 2231, 15);

  // "behavioral addiction loop" — loop visualization
  const loopOp = fadeIn(frame, 2389, 20);
  const loopRotation = interpolate(frame, [2389, 2440], [0, 360], { ...clamp, easing: Easing.out(Easing.cubic) });
  const loopScale = spring({ frame: Math.max(0, frame - 2389), fps, config: { damping: 20, stiffness: 160 } });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%" }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: titleOp, transform: `translateY(${titleSlide}px)` }}>
        <ChartBarIcon size={28} color={c.blue} weight="duotone" />
        <span style={{ fontSize: 24, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Inter', system-ui, sans-serif" }}>
          Meta Internal Research
        </span>
      </div>

      {/* Big stat row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 60 }}>
        {/* 47 tasks counter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: counterOp, transform: `scale(${counterScale})` }}>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 72,
              fontWeight: 700,
              color: ADDICTION,
              letterSpacing: -3,
              textShadow: `0 0 30px ${ADDICTION}30`,
            }}
          >
            {counterValue}
          </span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 16, fontWeight: 600, color: TEXT_MUTED }}>
            AI tasks per day
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 2, height: 100, background: `${BORDER}`, borderRadius: 1, opacity: timerOp }} />

        {/* Every 10 minutes */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: timerOp, transform: `translateY(${timerSlide}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TimerIcon size={32} color={c.amber} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 40,
                fontWeight: 700,
                color: c.amber,
                letterSpacing: -1,
              }}
            >
              10 min
            </span>
          </div>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: TEXT_DIM }}>
            once every 10 minutes
          </span>
        </div>
      </div>

      {/* 8-hour workday timeline with dots */}
      <div style={{ width: "85%", opacity: workdayOp }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, fontWeight: 600, color: TEXT_DIM }}>9:00</span>
          <div style={{ flex: 1, height: 32, borderRadius: 10, background: "#12121f", position: "relative", display: "flex", alignItems: "center", padding: "0 8px", gap: 0 }}>
            {Array.from({ length: dotCount }).map((_, i) => {
              const isVisible = i < Math.floor(dotsVisible);
              const dotPulseIntensity = pulseOp > 0
                ? Math.sin(pulsePhase + i * 0.5) * 0.3 + 0.7
                : 1;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: isVisible ? DOPAMINE : `${DOPAMINE}15`,
                      boxShadow: isVisible && pulseOp > 0 ? `0 0 ${6 * dotPulseIntensity}px ${DOPAMINE}60` : "none",
                      opacity: isVisible ? dotPulseIntensity : 0.3,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, fontWeight: 600, color: TEXT_DIM }}>5:00</span>
        </div>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: TEXT_DIM }}>
            8-hour workday — each dot = dopamine hit
          </span>
        </div>
      </div>

      {/* "Training your brain to crave" */}
      <div style={{ opacity: craveOp, transform: `translateY(${craveSlide}px)`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 18, fontWeight: 600, color: TEXT_MUTED }}>
          Training your brain to crave the next fix
        </span>
      </div>

      {/* "Behavioral addiction loop" — rotating arrows icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 32px",
          borderRadius: 12,
          background: `${ADDICTION}08`,
          border: `2px solid ${ADDICTION}30`,
          boxShadow: `0 0 25px ${ADDICTION}15`,
          opacity: loopOp,
          transform: `scale(${loopScale})`,
        }}
      >
        <div style={{ transform: `rotate(${loopRotation}deg)` }}>
          <ArrowClockwiseIcon size={32} color={ADDICTION} weight="bold" />
        </div>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: ADDICTION,
            letterSpacing: 1,
            textShadow: `0 0 15px ${ADDICTION}30`,
          }}
        >
          BEHAVIORAL ADDICTION LOOP
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Tolerance — Complex → Basic Degradation
// ═══════════════════════════════════════════════════════════
const Scene3_Tolerance: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const TrendDownIcon = getIcon("TrendDown");
  const CodeIcon = getIcon("Code");
  const BrainIcon = getIcon("Brain");
  const CalculatorIcon = getIcon("Calculator");

  // "The problem gets worse" — title
  const titleOp = fadeIn(frame, 2453, 18);
  const titleSlide = slideUp(frame, 2453, 18);

  // "tolerance builds over time" — tolerance meter
  const toleranceOp = fadeIn(frame, 2506, 18);
  const toleranceFill = interpolate(frame, [2506, 2570], [0.2, 0.95], { ...clamp, easing: Easing.out(Easing.cubic) });
  const toleranceColor = interpolate(toleranceFill, [0.2, 0.6, 0.95], [0, 0.5, 1], clamp);
  const tolColorHex = toleranceColor > 0.7 ? ADDICTION : toleranceColor > 0.4 ? c.amber : c.green;

  // "complex algorithms" — starting level (appears, then dims)
  const complexOp = fadeIn(frame, 2630, 15);
  const complexDim = frame >= 2695 ? interpolate(frame, [2695, 2720], [1, 0.3], clamp) : 1;

  // "basic syntax" — degraded level
  const basicOp = fadeIn(frame, 2700, 15);
  const basicSlide = slideUp(frame, 2700, 15);

  // "Google...for loops" — embarrassing example
  const forLoopOp = fadeIn(frame, 2780, 18);
  const forLoopSlide = slideUp(frame, 2780, 18);

  // "for loops" code snippet
  const codeOp = fadeIn(frame, 2883, 15);
  const codeScale = spring({ frame: Math.max(0, frame - 2883), fps, config: { damping: 22, stiffness: 180 } });

  // "brain stops bothering to remember" — brain dimming
  const brainFadeOp = fadeIn(frame, 2978, 20);
  const brainDim = interpolate(frame, [2978, 3050], [1, 0.15], { ...clamp, easing: Easing.in(Easing.quad) });
  const brainGrayscale = interpolate(frame, [2978, 3050], [0, 100], clamp);

  // "calculator for addition" — calculator metaphor
  const calcOp = fadeIn(frame, 3130, 18);
  const calcScale = spring({ frame: Math.max(0, frame - 3130), fps, config: { damping: 22, stiffness: 180 } });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%" }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: titleOp, transform: `translateY(${titleSlide}px)` }}>
        <TrendDownIcon size={28} color={ADDICTION} weight="duotone" />
        <span style={{ fontSize: 24, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "'Inter', system-ui, sans-serif" }}>
          Tolerance Builds Over Time
        </span>
      </div>

      {/* Tolerance meter */}
      <div style={{ width: "70%", opacity: toleranceOp }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 600, color: TEXT_DIM, letterSpacing: 1 }}>
            AI DEPENDENCY
          </span>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 700, color: tolColorHex }}>
            {Math.round(toleranceFill * 100)}%
          </span>
        </div>
        <div style={{ width: "100%", height: 16, borderRadius: 8, background: "#1a1a2e", overflow: "hidden" }}>
          <div
            style={{
              width: `${toleranceFill * 100}%`,
              height: "100%",
              borderRadius: 8,
              background: `linear-gradient(90deg, ${c.green}80, ${c.amber}80, ${ADDICTION}cc)`,
              boxShadow: `0 0 15px ${tolColorHex}30`,
            }}
          />
        </div>
      </div>

      {/* Degradation: Complex → Basic */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, width: "80%" }}>
        {/* Complex algorithms — starting point */}
        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            borderRadius: 12,
            background: `${c.blue}08`,
            border: `1px solid ${c.blue}20`,
            opacity: complexOp * complexDim,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            filter: complexDim < 0.5 ? "grayscale(0.6)" : "none",
          }}
        >
          <CodeIcon size={32} color={c.blue} weight="duotone" />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 14, fontWeight: 600, color: c.blue }}>
            Complex Algorithms
          </span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: TEXT_DIM }}>
            Started here
          </span>
        </div>

        {/* Arrow indicator */}
        <div style={{ opacity: basicOp }}>
          <span style={{ fontSize: 28, color: ADDICTION }}>→</span>
        </div>

        {/* Basic syntax — degraded to */}
        <div
          style={{
            flex: 1,
            padding: "20px 24px",
            borderRadius: 12,
            background: `${ADDICTION}08`,
            border: `2px solid ${ADDICTION}30`,
            boxShadow: `0 0 20px ${ADDICTION}15`,
            opacity: basicOp,
            transform: `translateY(${basicSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CodeIcon size={32} color={ADDICTION} weight="duotone" />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 14, fontWeight: 600, color: ADDICTION }}>
            Basic Syntax
          </span>
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: TEXT_DIM }}>
            Now here
          </span>
        </div>
      </div>

      {/* Google devs asking for for-loops */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: forLoopOp,
          transform: `translateY(${forLoopSlide}px)`,
          padding: "14px 28px",
          borderRadius: 12,
          background: "#12121f",
          border: `1px solid ${BORDER}`,
        }}
      >
        <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15, fontWeight: 500, color: TEXT_MUTED }}>
          Google devs asking ChatGPT:
        </span>
        <div
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: `${c.amber}10`,
            border: `1px solid ${c.amber}25`,
            opacity: codeOp,
            transform: `scale(${codeScale})`,
          }}
        >
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 15, fontWeight: 700, color: c.amber }}>
            "How to write for loops"
          </span>
        </div>
      </div>

      {/* Brain + Calculator row */}
      <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: 8 }}>
        {/* Brain dimming */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: brainFadeOp }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `${DOPAMINE}10`,
              border: `2px solid ${DOPAMINE}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: brainDim,
              filter: `grayscale(${brainGrayscale}%)`,
            }}
          >
            <BrainIcon size={36} color={DOPAMINE} weight="duotone" />
          </div>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, fontWeight: 600, color: TEXT_DIM }}>
            STOPS REMEMBERING
          </span>
        </div>

        {/* Equals sign */}
        <span style={{ fontSize: 24, color: TEXT_DIM, opacity: calcOp }}>=</span>

        {/* Calculator metaphor */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: calcOp,
            transform: `scale(${calcScale})`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${c.orange}18, ${c.orange}06)`,
              border: `1.5px solid ${c.orange}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${c.orange}15`,
            }}
          >
            <CalculatorIcon size={36} color={c.orange} weight="duotone" />
          </div>
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, fontWeight: 600, color: c.orange }}>
            CALCULATOR FOR 2+2
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_TheDopamineLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene crossfade opacities
  const scene1Op = frame < SCENE1_END - 40 ? 1 : fadeOut(frame, SCENE1_END - 40, 40);
  const scene2Op = fadeIn(frame, SCENE2_START, 30) * (frame < SCENE2_END - 40 ? 1 : fadeOut(frame, SCENE2_END - 40, 40));
  const scene3Op = fadeIn(frame, SCENE3_START, 30);

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
      {/* ════════════ SCENE 1: Dopamine Mechanism ════════════ */}
      {frame < SCENE1_END && (
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
          <Scene1_DopamineMechanism frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Meta Stats ════════════ */}
      {frame >= SCENE2_START && frame < SCENE2_END && (
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
          <Scene2_MetaStats frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: Tolerance Degradation ════════════ */}
      {frame >= SCENE3_START && (
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
          <Scene3_Tolerance frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

export default Generated_TheDopamineLoop;
