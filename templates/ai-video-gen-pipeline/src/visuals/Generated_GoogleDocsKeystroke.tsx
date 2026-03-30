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
  purple: "#a855f7",
  red: "#ef4444",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
};

// ─── SCENE 1: Keystroke + Local Processing (steps 1-3) ───
// ─── SCENE 2: Network + Server (steps 4-6) ───
// ─── SCENE 3: Persistence + Summary (steps 7a, 7b, <200ms) ───

const SCENE_1_END = 210;
const SCENE_2_START = 180;
const SCENE_2_END = 400;
const SCENE_3_START = 370;

// Steps data
const localSteps = [
  {
    label: "Local DOM Render",
    sublabel: "Instant — letter appears",
    icon: "Monitor",
    color: colors.blue,
    startFrame: 70,
  },
  {
    label: "Operation Log",
    sublabel: "Timestamp + position appended",
    icon: "ClockCounterClockwise",
    color: colors.cyan,
    startFrame: 120,
  },
  {
    label: "OT Engine",
    sublabel: "Check for remote conflicts",
    icon: "GitMerge",
    color: colors.purple,
    startFrame: 165,
  },
];

const networkSteps = [
  {
    label: "WebSocket → Server",
    sublabel: "~50ms latency",
    icon: "CloudArrowUp",
    color: colors.amber,
    startFrame: 220,
  },
  {
    label: "Server OT Resolution",
    sublabel: "Canonical version broadcast",
    icon: "Database",
    color: colors.orange,
    startFrame: 280,
  },
  {
    label: "Client Reconciliation",
    sublabel: "Merge server version",
    icon: "ArrowsClockwise",
    color: colors.green,
    startFrame: 340,
  },
];

const persistSteps = [
  {
    label: "Autosave",
    sublabel: "Batch every 2 seconds",
    icon: "FloppyDisk",
    color: colors.pink,
    startFrame: 395,
  },
  {
    label: "Revision History",
    sublabel: "Snapshot every 30 seconds",
    icon: "FileMagnifyingGlass",
    color: colors.red,
    startFrame: 430,
  },
];

// ─── Helper: animated step card ───
const StepCard: React.FC<{
  frame: number;
  fps: number;
  step: { label: string; sublabel: string; icon: string; color: string; startFrame: number };
  index: number;
  pulseFrame?: number;
}> = ({ frame, fps, step, index, pulseFrame }) => {
  const IconComp = getIcon(step.icon);

  const opacity = interpolate(frame, [step.startFrame, step.startFrame + 15], [0, 1], clamp);
  const slideY = interpolate(frame, [step.startFrame, step.startFrame + 15], [24, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const scale = spring({
    frame: Math.max(0, frame - step.startFrame),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Pulse glow when data "reaches" this step
  const pf = pulseFrame ?? step.startFrame + 20;
  const glowIntensity = interpolate(frame, [pf, pf + 10, pf + 30], [0, 1, 0.3], clamp);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideY}px) scale(${scale})`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 22px",
        borderRadius: 12,
        background: `${step.color}08`,
        border: `1px solid ${step.color}18`,
        boxShadow: `0 0 ${20 + glowIntensity * 25}px ${step.color}${Math.round(15 + glowIntensity * 30).toString(16).padStart(2, "0")}`,
        width: "100%",
      }}
    >
      {/* Number badge */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: `${step.color}20`,
          border: `1.5px solid ${step.color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'SF Mono', monospace",
          fontSize: 14,
          fontWeight: 700,
          color: step.color,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>

      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${step.color}20, ${step.color}08)`,
          border: `1.5px solid ${step.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 15px ${step.color}15`,
        }}
      >
        <IconComp
          size={24}
          color={step.color}
          weight="duotone"
          style={{ filter: `drop-shadow(0 0 8px ${step.color}60)` }}
        />
      </div>

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: "#e2e8f0",
          }}
        >
          {step.label}
        </span>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            color: "#64748b",
          }}
        >
          {step.sublabel}
        </span>
      </div>
    </div>
  );
};

const Generated_GoogleDocsKeystroke: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══════════════════════════════════════════
  // TITLE
  // ═══════════════════════════════════════════
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], clamp);
  const titleY = interpolate(frame, [0, 20], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ═══════════════════════════════════════════
  // TEXT INPUT WITH TYPING ANIMATION
  // ═══════════════════════════════════════════
  const inputOpacity = interpolate(frame, [25, 40], [0, 1], clamp);
  const inputScale = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Typing animation: cursor blinks, then "H" appears at frame 50
  const charOpacity = interpolate(frame, [50, 53], [0, 1], clamp);
  const cursorOpacity = frame < 50
    ? interpolate(Math.sin(frame * 0.25) , [-1, 1], [0.3, 1], clamp)
    : interpolate(frame, [50, 55, 60, 65], [1, 0.3, 1, 0.3], clamp);

  // Keystroke ripple effect
  const rippleScale = interpolate(frame, [50, 80], [0, 1], clamp);
  const rippleOpacity = interpolate(frame, [50, 80], [0.6, 0], clamp);

  // ═══════════════════════════════════════════
  // SCENE TRANSITIONS (crossfade between sections)
  // ═══════════════════════════════════════════
  const scene1Opacity = interpolate(frame, [SCENE_1_END - 30, SCENE_1_END], [1, 0], clamp);
  const scene2Opacity = frame < SCENE_2_START
    ? 0
    : frame > SCENE_2_END
      ? interpolate(frame, [SCENE_2_END - 30, SCENE_2_END], [1, 0], clamp)
      : interpolate(frame, [SCENE_2_START, SCENE_2_START + 20], [0, 1], clamp);
  const scene3Opacity = frame < SCENE_3_START
    ? 0
    : interpolate(frame, [SCENE_3_START, SCENE_3_START + 20], [0, 1], clamp);

  // ═══════════════════════════════════════════
  // TIMING BAR at the end
  // ═══════════════════════════════════════════
  const barStart = 460;
  const barProgress = interpolate(frame, [barStart, barStart + 40], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const barOpacity = interpolate(frame, [barStart - 10, barStart], [0, 1], clamp);
  const barGlow = interpolate(frame, [barStart + 40, barStart + 60], [0, 1], clamp);

  // ═══════════════════════════════════════════
  // SECTION LABELS
  // ═══════════════════════════════════════════
  const localLabelOpacity = interpolate(frame, [60, 70], [0, 1], clamp);
  const networkLabelOpacity = interpolate(frame, [SCENE_2_START, SCENE_2_START + 15], [0, 1], clamp);
  const persistLabelOpacity = interpolate(frame, [SCENE_3_START + 10, SCENE_3_START + 25], [0, 1], clamp);

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
        padding: "60px 80px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── TITLE ── */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 28,
          fontWeight: 700,
          color: "#e2e8f0",
          textAlign: "center",
          marginBottom: 10,
          letterSpacing: -0.5,
        }}
      >
        What Happens When You Type in Google Docs
      </div>
      <div
        style={{
          opacity: titleOpacity,
          fontSize: 14,
          fontWeight: 500,
          color: "#64748b",
          fontFamily: "'SF Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 30,
        }}
      >
        7 simultaneous operations &bull; &lt; 200ms
      </div>

      {/* ── TEXT INPUT FIELD ── */}
      <div
        style={{
          opacity: inputOpacity,
          transform: `scale(${inputScale})`,
          width: 500,
          height: 56,
          borderRadius: 12,
          background: "#12121f",
          border: "1px solid #2a2a3e",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          marginBottom: 40,
          position: "relative",
        }}
      >
        {/* Typed character */}
        <span
          style={{
            opacity: charOpacity,
            fontSize: 22,
            fontWeight: 500,
            color: "#e2e8f0",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          H
        </span>
        {/* Cursor */}
        <div
          style={{
            width: 2,
            height: 26,
            background: colors.blue,
            opacity: cursorOpacity,
            marginLeft: charOpacity > 0.5 ? 1 : 0,
            borderRadius: 1,
            boxShadow: `0 0 8px ${colors.blue}60`,
          }}
        />
        {/* Ripple from keystroke */}
        {frame >= 50 && frame < 85 && (
          <div
            style={{
              position: "absolute",
              left: 30,
              top: "50%",
              transform: `translate(-50%, -50%) scale(${rippleScale})`,
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `2px solid ${colors.blue}`,
              opacity: rippleOpacity,
              pointerEvents: "none",
            }}
          />
        )}
        {/* Input label */}
        <span
          style={{
            position: "absolute",
            right: 16,
            fontSize: 11,
            color: "#4a4a5e",
            fontFamily: "'SF Mono', monospace",
          }}
        >
          keystroke captured
        </span>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* ━━━ SCENE 1: Local Processing ━━━ */}
        {frame < SCENE_1_END + 10 && (
          <div
            style={{
              opacity: frame < SCENE_1_END - 30 ? 1 : scene1Opacity,
              position: "absolute",
              top: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Section label */}
            <div
              style={{
                opacity: localLabelOpacity,
                fontSize: 12,
                fontWeight: 700,
                color: colors.blue,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                fontFamily: "'SF Mono', monospace",
                marginBottom: 8,
              }}
            >
              Local Processing
            </div>

            {/* Step cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: 520,
              }}
            >
              {localSteps.map((step, i) => (
                <StepCard
                  key={step.label}
                  frame={frame}
                  fps={fps}
                  step={step}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* ━━━ SCENE 2: Network + Server ━━━ */}
        {frame >= SCENE_2_START - 10 && frame < SCENE_2_END + 10 && (
          <div
            style={{
              opacity: scene2Opacity,
              position: "absolute",
              top: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Section label */}
            <div
              style={{
                opacity: networkLabelOpacity,
                fontSize: 12,
                fontWeight: 700,
                color: colors.amber,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                fontFamily: "'SF Mono', monospace",
                marginBottom: 8,
              }}
            >
              Network &amp; Server
            </div>

            {/* Step cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: 520,
              }}
            >
              {networkSteps.map((step, i) => (
                <StepCard
                  key={step.label}
                  frame={frame}
                  fps={fps}
                  step={step}
                  index={i + 3}
                />
              ))}
            </div>
          </div>
        )}

        {/* ━━━ SCENE 3: Persistence + Summary ━━━ */}
        {frame >= SCENE_3_START - 10 && (
          <div
            style={{
              opacity: scene3Opacity,
              position: "absolute",
              top: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Section label */}
            <div
              style={{
                opacity: persistLabelOpacity,
                fontSize: 12,
                fontWeight: 700,
                color: colors.pink,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                fontFamily: "'SF Mono', monospace",
                marginBottom: 8,
              }}
            >
              Persistence Layer
            </div>

            {/* Persist step cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                width: 520,
              }}
            >
              {persistSteps.map((step, i) => (
                <StepCard
                  key={step.label}
                  frame={frame}
                  fps={fps}
                  step={step}
                  index={i + 6}
                />
              ))}
            </div>

            {/* ── TIMING BAR ── */}
            <div
              style={{
                opacity: barOpacity,
                marginTop: 30,
                width: 520,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "center",
              }}
            >
              {/* Bar label */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  fontSize: 12,
                  fontFamily: "'SF Mono', monospace",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                <span>0ms</span>
                <span>200ms</span>
              </div>

              {/* Bar track */}
              <div
                style={{
                  width: "100%",
                  height: 16,
                  borderRadius: 8,
                  background: "#1a1a2e",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Bar fill */}
                <div
                  style={{
                    width: `${barProgress * 100}%`,
                    height: "100%",
                    borderRadius: 8,
                    background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})`,
                    boxShadow: barGlow > 0
                      ? `0 0 ${20 + barGlow * 20}px ${colors.green}40`
                      : "none",
                  }}
                />
              </div>

              {/* Result label */}
              <div
                style={{
                  opacity: interpolate(frame, [barStart + 35, barStart + 50], [0, 1], clamp),
                  fontSize: 26,
                  fontWeight: 700,
                  color: colors.green,
                  fontFamily: "'SF Mono', monospace",
                  letterSpacing: -0.5,
                  textShadow: `0 0 30px ${colors.green}40`,
                  transform: `scale(${spring({
                    frame: Math.max(0, frame - (barStart + 35)),
                    fps,
                    config: { damping: 20, stiffness: 180 },
                  })})`,
                }}
              >
                &lt; 200ms
              </div>
              <div
                style={{
                  opacity: interpolate(frame, [barStart + 45, barStart + 60], [0, 1], clamp),
                  fontSize: 13,
                  color: "#94a3b8",
                  fontWeight: 500,
                }}
              >
                Keystroke → Sync → Save — all under 200 milliseconds
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generated_GoogleDocsKeystroke;
