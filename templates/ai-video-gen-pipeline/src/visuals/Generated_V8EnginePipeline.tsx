import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  interpolateColors,
} from "remotion";
import { Code, TreeStructure, Cpu, Lightning, Fire, Warning, ArrowsClockwise, Speedometer } from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOutCubic });

const slideRight = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [-30, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeInQuad });

// ─── Colors ───────────────────────────────────────────────
const BG = "#0f0f1a";
const SOURCE_COLOR = "#3b82f6";
const AST_COLOR = "#a855f7";
const BYTECODE_COLOR = "#f59e0b";
const MACHINE_COLOR = "#22c55e";
const HOT_COLOR = "#ef4444";
const TURBOFAN_COLOR = "#06b6d4";
const DEOPT_COLOR = "#ef4444";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — estimated from transcript
 * ═══════════════════════════════════════════════════════════
 * "This is how your JavaScript code actually runs"     → f0-f60
 * "The engine first parses...AST"                       → f60-f180
 * "basically a tree of nodes...statement"               → f180-f240
 * "Then the interpreter Ignition...bytecode"            → f240-f360
 * "compact, portable...50% smaller"                     → f360-f420
 * "The bytecode starts executing...but it's slow"       → f420-f510
 * "The engine watches...hot functions"                  → f510-f630
 * "When a function has been called 100 times"           → f630-f720
 * "the optimizing compiler TurboFan kicks in"           → f720-f810
 * "TurboFan takes bytecode...machine code"              → f810-f900
 * "The machine code is 10-100x faster"                  → f900-f990
 * "But there's a catch — types change"                  → f990-f1080
 * "The engine deoptimizes back to bytecode"             → f1080-f1170
 * "This optimize-deoptimize cycle..."                   → f1170-f1350
 */

// ─── SCENE 1: Source → AST → Bytecode (f0-f510) ──────────

// AST tree node component
const ASTNode: React.FC<{
  label: string;
  x: number;
  y: number;
  opacity: number;
  color: string;
  size?: number;
}> = ({ label, x, y, opacity, color, size = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      transform: `scale(${opacity})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
    }}
  >
    <div
      style={{
        width: 14 * size,
        height: 14 * size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 10px ${color}50`,
      }}
    />
    <span
      style={{
        fontFamily: "'SF Mono', monospace",
        fontSize: 10 * size,
        color: TEXT_DIM,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  </div>
);

// Pipeline stage box
const PipelineStage: React.FC<{
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  opacity: number;
  translateY: number;
  translateX?: number;
  glowIntensity?: number;
  active?: boolean;
  width?: number;
}> = ({ label, sublabel, icon, color, opacity, translateY, translateX = 0, glowIntensity = 0, active = true, width = 280 }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px) translateX(${translateX}px)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      width,
    }}
  >
    <div
      style={{
        background: `${color}10`,
        border: `2px solid ${color}${active ? "40" : "20"}`,
        borderRadius: 12,
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: "100%",
        boxShadow: glowIntensity > 0 ? `0 0 ${20 + glowIntensity * 30}px ${color}${Math.round(15 + glowIntensity * 25).toString(16).padStart(2, "0")}` : "none",
        filter: active ? "none" : "grayscale(0.5)",
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 18,
          fontWeight: 700,
          color,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: TEXT_SECONDARY,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {sublabel}
      </span>
    </div>
  </div>
);

// Chevron arrow between stages
const StageArrow: React.FC<{ opacity: number; color: string; horizontal?: boolean }> = ({ opacity, color, horizontal }) => (
  <div
    style={{
      opacity,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: horizontal ? "rotate(0deg)" : "rotate(90deg)",
    }}
  >
    <svg width="40" height="24" viewBox="0 0 40 24">
      <path
        d="M8 4 L20 12 L8 20"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M20 4 L32 12 L20 20"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
    </svg>
  </div>
);

// Speed bar with animated fill
const SpeedBar: React.FC<{
  label: string;
  fill: number;
  color: string;
  opacity: number;
  maxLabel: string;
}> = ({ label, fill, color, opacity, maxLabel }) => (
  <div style={{ opacity, display: "flex", flexDirection: "column", gap: 6, width: 260 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: TEXT_DIM, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color, fontWeight: 700 }}>
        {maxLabel}
      </span>
    </div>
    <div style={{ width: "100%", height: 8, borderRadius: 4, background: `${color}15` }}>
      <div
        style={{
          width: `${fill * 100}%`,
          height: "100%",
          borderRadius: 4,
          background: `linear-gradient(90deg, ${color}60, ${color})`,
          boxShadow: fill > 0.5 ? `0 0 12px ${color}40` : "none",
        }}
      />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────
const Generated_V8EnginePipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══ SCENE TRANSITIONS ═══
  // Scene 1: Parsing pipeline (f0-f510)
  // Scene 2: Hot functions + TurboFan (f510-f990)
  // Scene 3: Deoptimization cycle (f990-f1350)

  const scene1Opacity = interpolate(frame, [470, 510], [1, 0], clamp);
  const scene2Opacity = frame < 480 ? 0 : interpolate(frame, [480, 520], [0, 1], clamp) * interpolate(frame, [950, 990], [1, 0], clamp);
  const scene3Opacity = frame < 960 ? 0 : interpolate(frame, [960, 1000], [0, 1], clamp);

  // ═══ SCENE 1: Source Code → AST → Bytecode ═══

  // Title
  const titleOp = fadeIn(frame, 0, 20);
  const titleSlide = slideUp(frame, 0, 20);

  // Source code block
  const sourceOp = fadeIn(frame, 50, 20);
  const sourceSlide = slideRight(frame, 50, 20);

  // "Parses" arrow
  const parseArrowOp = fadeIn(frame, 90, 15);

  // AST tree nodes appear staggered
  const astNodes = [
    { label: "Program", delay: 0, x: 120, y: 0 },
    { label: "FuncDecl", delay: 8, x: 30, y: 60 },
    { label: "VarDecl", delay: 12, x: 210, y: 60 },
    { label: "Identifier", delay: 16, x: -20, y: 120 },
    { label: "Params", delay: 20, x: 80, y: 120 },
    { label: "Literal", delay: 24, x: 170, y: 120 },
    { label: "BinExpr", delay: 28, x: 260, y: 120 },
  ];
  const astBaseFrame = 120;

  // Ignition label
  const ignitionOp = fadeIn(frame, 260, 20);
  const ignitionSlide = slideUp(frame, 260, 20);

  // Bytecode blocks
  const bytecodeBaseFrame = 300;
  const bytecodeLines = [
    "LdaZero",
    "Star r0",
    "LdaSmi [1]",
    "Add r0",
    "Star r0",
    "Return",
  ];

  // "50% smaller" stat
  const smallerOp = fadeIn(frame, 380, 15);
  const smallerScale = spring({ frame: Math.max(0, frame - 380), fps, config: { damping: 20, stiffness: 200 } });

  // "Executing but slow" indicator
  const slowOp = fadeIn(frame, 430, 15);

  // ═══ SCENE 2: Hot Functions → TurboFan → Machine Code ═══

  // Hot function counter (fills from 0 to 100)
  const hotCounterStart = 540;
  const hotCounterEnd = 700;
  const hotCount = Math.round(interpolate(frame, [hotCounterStart, hotCounterEnd], [0, 100], clamp));
  const hotCounterOp = scene2Opacity * fadeIn(frame, hotCounterStart, 15);

  // Hot counter color shifts blue → orange → red
  const hotCounterColor = interpolateColors(
    hotCount,
    [0, 50, 100],
    [SOURCE_COLOR, BYTECODE_COLOR, HOT_COLOR],
  );

  // "Hot Functions" label
  const hotLabelOp = scene2Opacity * fadeIn(frame, 560, 15);

  // TurboFan entrance (dramatic)
  const turbofanStart = 730;
  const turbofanOp = scene2Opacity * fadeIn(frame, turbofanStart, 20);
  const turbofanScale = spring({ frame: Math.max(0, frame - turbofanStart), fps, config: { damping: 18, stiffness: 180 } });
  const turbofanGlow = interpolate(frame, [turbofanStart, turbofanStart + 40], [0, 1], clamp);

  // Machine code appears
  const machineStart = 820;
  const machineOp = scene2Opacity * fadeIn(frame, machineStart, 20);
  const machineSlide = slideUp(frame, machineStart, 20);

  // "10-100x faster" stat
  const fasterStart = 910;
  const fasterOp = scene2Opacity * fadeIn(frame, fasterStart, 15);
  const fasterScale = spring({ frame: Math.max(0, frame - fasterStart), fps, config: { damping: 20, stiffness: 200 } });

  // Speed comparison bars
  const speedBarOp = scene2Opacity * fadeIn(frame, 860, 20);
  const bytecodeSpeed = interpolate(frame, [860, 900], [0, 0.15], clamp);
  const machineSpeed = interpolate(frame, [900, 950], [0, 1], clamp);

  // ═══ SCENE 3: Deoptimization Cycle ═══

  // "Types change" warning
  const warningStart = 1010;
  const warningOp = scene3Opacity * fadeIn(frame, warningStart, 15);
  const warningPulse = interpolate(
    frame,
    [warningStart + 15, warningStart + 25, warningStart + 35, warningStart + 45],
    [1, 1.06, 1, 1.03],
    clamp,
  );

  // Optimized code "breaks" — red flash overlay
  const flashOp = scene3Opacity * interpolate(
    frame,
    [1050, 1060, 1080, 1090],
    [0, 0.15, 0.15, 0],
    clamp,
  );

  // Deoptimize arrow + label
  const deoptStart = 1090;
  const deoptOp = scene3Opacity * fadeIn(frame, deoptStart, 15);
  const deoptSlide = slideUp(frame, deoptStart, 15);

  // Cycle diagram
  const cycleStart = 1180;
  const cycleOp = scene3Opacity * fadeIn(frame, cycleStart, 20);

  // Cycle arrow rotation
  const cycleRotation = frame > cycleStart
    ? interpolate(frame, [cycleStart, cycleStart + 120], [0, 360], clamp)
    : 0;

  // Final message
  const finalStart = 1260;
  const finalOp = scene3Opacity * fadeIn(frame, finalStart, 20);
  const finalSlide = slideUp(frame, finalStart, 20);

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
      {/* Red flash overlay for deoptimization */}
      {flashOp > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: DEOPT_COLOR,
            opacity: flashOp,
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ═══ SCENE 1: Source → AST → Bytecode ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          opacity: scene1Opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOp,
            transform: `translateY(${titleSlide}px)`,
            fontFamily: "'SF Mono', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: 1,
            marginBottom: 20,
          }}
        >
          V8 Engine Pipeline
        </div>

        {/* Main pipeline: Source → AST → Bytecode */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 40,
            flex: 1,
          }}
        >
          {/* Source Code Block */}
          <div
            style={{
              opacity: sourceOp,
              transform: `translateX(${-slideRight(frame, 50, 20) + slideRight(frame, 50, 20)}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              width: 300,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Code size={28} color={SOURCE_COLOR} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${SOURCE_COLOR}60)` }} />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, fontWeight: 700, color: SOURCE_COLOR, textTransform: "uppercase", letterSpacing: 1 }}>
                Source Code
              </span>
            </div>
            <div
              style={{
                background: `${SOURCE_COLOR}08`,
                border: `1.5px solid ${SOURCE_COLOR}25`,
                borderRadius: 12,
                padding: "20px 24px",
                width: "100%",
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                lineHeight: 1.7,
                color: TEXT_SECONDARY,
              }}
            >
              <span style={{ color: "#c084fc" }}>function</span>{" "}
              <span style={{ color: "#60a5fa" }}>add</span>
              <span style={{ color: TEXT_DIM }}>(a, b)</span> {"{"}<br />
              {"  "}<span style={{ color: "#c084fc" }}>return</span>{" "}
              <span style={{ color: TEXT_PRIMARY }}>a + b</span>;<br />
              {"}"}
            </div>
          </div>

          {/* Parse arrow */}
          <div style={{ opacity: parseArrowOp, alignSelf: "center", marginTop: 60 }}>
            <StageArrow opacity={1} color={AST_COLOR} horizontal />
            <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: TEXT_DIM, textAlign: "center", marginTop: 4 }}>
              parse
            </div>
          </div>

          {/* AST Tree */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              width: 320,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, opacity: fadeIn(frame, 110, 15) }}>
              <TreeStructure size={28} color={AST_COLOR} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${AST_COLOR}60)` }} />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, fontWeight: 700, color: AST_COLOR, textTransform: "uppercase", letterSpacing: 1 }}>
                Abstract Syntax Tree
              </span>
            </div>
            <div
              style={{
                background: `${AST_COLOR}08`,
                border: `1.5px solid ${AST_COLOR}20`,
                borderRadius: 12,
                padding: "24px 20px",
                width: "100%",
                height: 220,
                position: "relative",
              }}
            >
              {/* Tree connection lines */}
              <svg
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                viewBox="0 0 320 220"
              >
                {/* Program → FuncDecl */}
                <line x1="140" y1="22" x2="50" y2="68" stroke={`${AST_COLOR}30`} strokeWidth="1.5" opacity={fadeIn(frame, astBaseFrame + 8, 12)} />
                {/* Program → VarDecl */}
                <line x1="140" y1="22" x2="230" y2="68" stroke={`${AST_COLOR}30`} strokeWidth="1.5" opacity={fadeIn(frame, astBaseFrame + 12, 12)} />
                {/* FuncDecl → Identifier */}
                <line x1="50" y1="88" x2="0" y2="128" stroke={`${AST_COLOR}20`} strokeWidth="1" opacity={fadeIn(frame, astBaseFrame + 16, 12)} />
                {/* FuncDecl → Params */}
                <line x1="50" y1="88" x2="100" y2="128" stroke={`${AST_COLOR}20`} strokeWidth="1" opacity={fadeIn(frame, astBaseFrame + 20, 12)} />
                {/* VarDecl → Literal */}
                <line x1="230" y1="88" x2="190" y2="128" stroke={`${AST_COLOR}20`} strokeWidth="1" opacity={fadeIn(frame, astBaseFrame + 24, 12)} />
                {/* VarDecl → BinExpr */}
                <line x1="230" y1="88" x2="280" y2="128" stroke={`${AST_COLOR}20`} strokeWidth="1" opacity={fadeIn(frame, astBaseFrame + 28, 12)} />
              </svg>
              {astNodes.map((node, i) => (
                <ASTNode
                  key={i}
                  label={node.label}
                  x={node.x}
                  y={node.y}
                  opacity={fadeIn(frame, astBaseFrame + node.delay, 12)}
                  color={AST_COLOR}
                />
              ))}
            </div>
          </div>

          {/* Ignition arrow */}
          <div style={{ opacity: ignitionOp, alignSelf: "center", marginTop: 60 }}>
            <StageArrow opacity={1} color={BYTECODE_COLOR} horizontal />
            <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: BYTECODE_COLOR, textAlign: "center", marginTop: 4, fontWeight: 600 }}>
              Ignition
            </div>
          </div>

          {/* Bytecode */}
          <div
            style={{
              opacity: fadeIn(frame, 290, 20),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              width: 280,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Cpu size={28} color={BYTECODE_COLOR} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${BYTECODE_COLOR}60)` }} />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, fontWeight: 700, color: BYTECODE_COLOR, textTransform: "uppercase", letterSpacing: 1 }}>
                Bytecode
              </span>
            </div>
            <div
              style={{
                background: `${BYTECODE_COLOR}08`,
                border: `1.5px solid ${BYTECODE_COLOR}20`,
                borderRadius: 12,
                padding: "16px 20px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {bytecodeLines.map((line, i) => {
                const lineOp = fadeIn(frame, bytecodeBaseFrame + 20 + i * 8, 10);
                return (
                  <div
                    key={i}
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      color: BYTECODE_COLOR,
                      opacity: lineOp,
                      transform: `translateX(${interpolate(frame, [bytecodeBaseFrame + 20 + i * 8, bytecodeBaseFrame + 30 + i * 8], [12, 0], { ...clamp, easing: easeOutCubic })}px)`,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: `${BYTECODE_COLOR}06`,
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </div>

            {/* 50% smaller stat */}
            <div
              style={{
                opacity: smallerOp,
                transform: `scale(${smallerScale})`,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                background: `${BYTECODE_COLOR}10`,
                border: `1px solid ${BYTECODE_COLOR}20`,
              }}
            >
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 22, fontWeight: 700, color: BYTECODE_COLOR }}>
                50%
              </span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: TEXT_SECONDARY }}>
                smaller than AST
              </span>
            </div>

            {/* "Executing... but slow" */}
            <div
              style={{
                opacity: slowOp,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 8,
                background: `${HOT_COLOR}10`,
                border: `1px solid ${HOT_COLOR}15`,
              }}
            >
              <Speedometer size={18} color={TEXT_DIM} weight="duotone" />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: TEXT_DIM }}>
                Executing... but slow
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SCENE 2: Hot Functions → TurboFan → Machine Code ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          opacity: scene2Opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: 1,
            opacity: scene2Opacity,
          }}
        >
          Optimization Pipeline
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 60,
            flex: 1,
          }}
        >
          {/* Hot Function Counter */}
          <div
            style={{
              opacity: hotCounterOp,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              width: 280,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: hotLabelOp }}>
              <Fire size={28} color={hotCounterColor} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${hotCounterColor}60)` }} />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, fontWeight: 700, color: hotCounterColor, textTransform: "uppercase", letterSpacing: 1 }}>
                Hot Functions
              </span>
            </div>

            {/* Counter circle */}
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: `${hotCounterColor}08`,
                border: `3px solid ${hotCounterColor}30`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                boxShadow: hotCount >= 100 ? `0 0 40px ${hotCounterColor}30` : "none",
                position: "relative",
              }}
            >
              {/* Progress ring */}
              <svg
                style={{ position: "absolute", inset: -2, width: "calc(100% + 4px)", height: "calc(100% + 4px)" }}
                viewBox="0 0 184 184"
              >
                <circle
                  cx="92"
                  cy="92"
                  r="88"
                  fill="none"
                  stroke={hotCounterColor}
                  strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - hotCount / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 92 92)"
                  opacity="0.6"
                />
              </svg>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 48,
                  fontWeight: 700,
                  color: hotCounterColor,
                  textShadow: hotCount >= 100 ? `0 0 20px ${hotCounterColor}60` : "none",
                }}
              >
                {hotCount}
              </span>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: TEXT_DIM, fontWeight: 600 }}>
                calls
              </span>
            </div>

            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: TEXT_SECONDARY, textAlign: "center" }}>
              Engine watches frequently{"\n"}called functions
            </span>
          </div>

          {/* TurboFan Arrow */}
          <div style={{ opacity: turbofanOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <StageArrow opacity={1} color={TURBOFAN_COLOR} horizontal />
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: TURBOFAN_COLOR,
                textAlign: "center",
                transform: `scale(${turbofanScale})`,
                textShadow: `0 0 15px ${TURBOFAN_COLOR}50`,
              }}
            >
              TurboFan
            </div>
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: TEXT_DIM }}>
              optimizing compiler
            </span>
          </div>

          {/* Machine Code Output */}
          <div
            style={{
              opacity: machineOp,
              transform: `translateY(${machineSlide}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              width: 320,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lightning size={28} color={MACHINE_COLOR} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${MACHINE_COLOR}60)` }} />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 16, fontWeight: 700, color: MACHINE_COLOR, textTransform: "uppercase", letterSpacing: 1 }}>
                Machine Code
              </span>
            </div>

            {/* Machine code hex representation */}
            <div
              style={{
                background: `${MACHINE_COLOR}08`,
                border: `1.5px solid ${MACHINE_COLOR}25`,
                borderRadius: 12,
                padding: "20px 24px",
                width: "100%",
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                lineHeight: 1.8,
                color: `${MACHINE_COLOR}90`,
                boxShadow: `0 0 30px ${MACHINE_COLOR}15`,
              }}
            >
              <span style={{ color: MACHINE_COLOR }}>mov</span> rax, [rbp-8]<br />
              <span style={{ color: MACHINE_COLOR }}>add</span> rax, [rbp-16]<br />
              <span style={{ color: MACHINE_COLOR }}>ret</span>
              <div style={{ marginTop: 12, padding: "6px 10px", borderRadius: 6, background: `${MACHINE_COLOR}10`, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: TEXT_DIM }}>using type feedback</span>
              </div>
            </div>

            {/* Speed comparison */}
            <div
              style={{
                opacity: speedBarOp,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
              }}
            >
              <SpeedBar label="Bytecode" fill={bytecodeSpeed} color={BYTECODE_COLOR} opacity={1} maxLabel="1x" />
              <SpeedBar label="Machine Code" fill={machineSpeed} color={MACHINE_COLOR} opacity={1} maxLabel="10-100x" />
            </div>

            {/* "10-100x faster" stat */}
            <div
              style={{
                opacity: fasterOp,
                transform: `scale(${fasterScale})`,
                padding: "10px 20px",
                borderRadius: 10,
                background: `${MACHINE_COLOR}12`,
                border: `1.5px solid ${MACHINE_COLOR}30`,
                boxShadow: `0 0 25px ${MACHINE_COLOR}20`,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 28, fontWeight: 700, color: MACHINE_COLOR, textShadow: `0 0 15px ${MACHINE_COLOR}40` }}>
                10-100×
              </span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: TEXT_SECONDARY }}>
                faster
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SCENE 3: Deoptimization Cycle ═══ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          opacity: scene3Opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: 1,
            opacity: scene3Opacity,
          }}
        >
          The Catch: Deoptimization
        </div>

        {/* Warning: Types Changed */}
        <div
          style={{
            opacity: warningOp,
            transform: `scale(${warningPulse})`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 32px",
            borderRadius: 12,
            background: `${DEOPT_COLOR}12`,
            border: `2px solid ${DEOPT_COLOR}40`,
            boxShadow: `0 0 30px ${DEOPT_COLOR}20`,
          }}
        >
          <Warning size={32} color={DEOPT_COLOR} weight="duotone" style={{ filter: `drop-shadow(0 0 10px ${DEOPT_COLOR}60)` }} />
          <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 18, fontWeight: 700, color: DEOPT_COLOR }}>
            Types Changed — Optimized Code Invalid!
          </span>
        </div>

        {/* Deopt visual: Machine Code → back to Bytecode */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 50,
            opacity: deoptOp,
            transform: `translateY(${deoptSlide}px)`,
            marginTop: 20,
          }}
        >
          {/* Machine Code (broken) */}
          <PipelineStage
            label="Machine Code"
            sublabel="Invalidated"
            icon={<Lightning size={32} color={DEOPT_COLOR} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${DEOPT_COLOR}60)` }} />}
            color={DEOPT_COLOR}
            opacity={1}
            translateY={0}
            active={false}
            width={240}
          />

          {/* Deopt arrow */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <svg width="80" height="24" viewBox="0 0 80 24">
              <path
                d="M8 12 L72 12"
                stroke={DEOPT_COLOR}
                strokeWidth="2.5"
                strokeDasharray="6 4"
                opacity="0.6"
              />
              <path
                d="M60 4 L72 12 L60 20"
                stroke={DEOPT_COLOR}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: DEOPT_COLOR, fontWeight: 600 }}>
              deoptimize
            </span>
          </div>

          {/* Bytecode (active again) */}
          <PipelineStage
            label="Bytecode"
            sublabel="Profile again"
            icon={<Cpu size={32} color={BYTECODE_COLOR} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${BYTECODE_COLOR}60)` }} />}
            color={BYTECODE_COLOR}
            opacity={1}
            translateY={0}
            active
            width={240}
          />
        </div>

        {/* Optimize-Deoptimize Cycle */}
        <div
          style={{
            opacity: cycleOp,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            marginTop: 20,
          }}
        >
          {/* Cycle visualization */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 30,
              padding: "24px 40px",
              borderRadius: 12,
              background: "#12121f",
              border: `1px solid ${BORDER}`,
            }}
          >
            {/* Bytecode side */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: `${BYTECODE_COLOR}10`,
                  border: `2px solid ${BYTECODE_COLOR}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Cpu size={36} color={BYTECODE_COLOR} weight="duotone" />
              </div>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 700, color: BYTECODE_COLOR }}>
                Bytecode
              </span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: TEXT_DIM }}>
                slow but safe
              </span>
            </div>

            {/* Cycle arrows */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <ArrowsClockwise
                size={40}
                color={TEXT_SECONDARY}
                weight="duotone"
                style={{
                  transform: `rotate(${cycleRotation}deg)`,
                  filter: `drop-shadow(0 0 8px ${TURBOFAN_COLOR}40)`,
                }}
              />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 10, color: TEXT_DIM }}>
                optimize ↔ deopt
              </span>
            </div>

            {/* Machine Code side */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: `${MACHINE_COLOR}10`,
                  border: `2px solid ${MACHINE_COLOR}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lightning size={36} color={MACHINE_COLOR} weight="duotone" />
              </div>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 700, color: MACHINE_COLOR }}>
                Machine Code
              </span>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, color: TEXT_DIM }}>
                fast but fragile
              </span>
            </div>
          </div>

          {/* Final takeaway */}
          <div
            style={{
              opacity: finalOp,
              transform: `translateY(${finalSlide}px)`,
              padding: "16px 32px",
              borderRadius: 12,
              background: `${MACHINE_COLOR}08`,
              border: `1.5px solid ${MACHINE_COLOR}20`,
              boxShadow: `0 0 20px ${MACHINE_COLOR}10`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Lightning size={24} color={MACHINE_COLOR} weight="duotone" />
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 16, color: TEXT_PRIMARY, fontWeight: 600 }}>
              Consistent types = V8 stays in optimized machine code = better performance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_V8EnginePipeline;
