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

const easeOut = Easing.out(Easing.cubic);
const easeIn = Easing.in(Easing.quad);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOut });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOut });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeIn });

// ── Colors ──
const BG = "#0f0f1a";
const c = {
  red: "#ef4444",
  blue: "#3b82f6",
  purple: "#a855f7",
  amber: "#f59e0b",
  green: "#22c55e",
  cyan: "#06b6d4",
  pink: "#ec4899",
};
const TEXT = "#e2e8f0";
const TEXT_DIM = "#64748b";
const TEXT_SEC = "#94a3b8";

// ═══════════════════════════════════════════════════════════
// VOICEOVER TIMESTAMPS (global frames @ 30fps)
// ═══════════════════════════════════════════════════════════
const T = {
  WHEN:         1290,  // "When"
  NOTIFICATION: 1304,  // "notification"
  ARRIVES:      1322,  // "arrives"
  BRAIN:        1343,  // "brain"
  DOPAMINE:     1388,  // "dopamine"
  ANTICIPATION: 1493,  // "anticipation"
  RED:          1547,  // "red"
  BADGE:        1553,  // "badge"
  APP:          1570,  // "app"
  ICON:         1578,  // "icon"
  OPEN:         1673,  // "open"
  LOOP:         1683,  // "loop"
  UNRESOLVED:   1724,  // "unresolved"
  TENSION:      1742,  // "tension"
  TAPPING:      1802,  // "tapping"
  ZEIGARNIK:    1868,  // "Zeigarnik"
  EFFECT:       1886,  // "effect"
  OBSESSES:     1935,  // "obsesses"
  INCOMPLETE:   1963,  // "incomplete"
  TASKS:        1982,  // "tasks"
};

// ── Scene boundaries ──
const SCENE1_END = T.RED - 10;       // ~1537: dopamine scene fades
const SCENE2_START = T.RED - 25;     // ~1522: red badge scene starts
const SCENE2_END = T.ZEIGARNIK - 15; // ~1853: badge scene fades
const SCENE3_START = T.ZEIGARNIK - 30; // ~1838: zeigarnik scene starts

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_DopamineRedBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene crossfade opacities ──
  const scene1Op = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op =
    interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp) *
    interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Op = interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

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
      {/* ════════════ SCENE 1: Notification → Brain → Dopamine ════════════ */}
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
          <Scene1_Dopamine frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Red Badge + Open Loop ════════════ */}
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
          <Scene2_RedBadge frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: Zeigarnik Effect ════════════ */}
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
          <Scene3_Zeigarnik frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Notification arrives → Brain → Dopamine burst
// "When a notification arrives, your brain releases
//  a small hit of dopamine. Not because of the content,
//  but because of the anticipation."
// ═══════════════════════════════════════════════════════════
const Scene1_Dopamine: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const BellIcon = getIcon("BellRinging");
  const BrainIcon = getIcon("Brain");
  const LightningIcon = getIcon("Lightning");

  // 🔊 SOUND: scene_start @ frame 1290 — segment opens, notification bell fades in
  const bellOp = fadeIn(frame, T.WHEN);
  const bellSlide = slideUp(frame, T.WHEN);
  const bellScale = spring({
    frame: Math.max(0, frame - T.WHEN),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // 🔊 SOUND: element_appear @ frame 1304 — notification pulse ring expands
  const pulseScale = interpolate(frame, [T.NOTIFICATION, T.NOTIFICATION + 20], [1, 2.8], {
    ...clamp,
    easing: easeOut,
  });
  const pulseOp = interpolate(frame, [T.NOTIFICATION, T.NOTIFICATION + 20], [0.7, 0], clamp);

  // 🔊 SOUND: element_appear @ frame 1343 — brain icon slides in from right
  const brainOp = fadeIn(frame, T.BRAIN);
  const brainX = interpolate(frame, [T.BRAIN, T.BRAIN + 18], [50, 0], {
    ...clamp,
    easing: easeOut,
  });

  // 🔊 SOUND: reveal @ frame 1388 — dopamine burst particles explode from brain
  const dopamineProgress = interpolate(frame, [T.DOPAMINE, T.DOPAMINE + 25], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const dopamineOp = fadeIn(frame, T.DOPAMINE, 10);

  // Dopamine label
  const dopamineLabelOp = fadeIn(frame, T.DOPAMINE + 8, 15);
  const dopamineLabelY = slideUp(frame, T.DOPAMINE + 8, 15);

  // Brain glow intensifies with dopamine
  const brainGlow = interpolate(frame, [T.DOPAMINE, T.DOPAMINE + 20], [0, 35], clamp);

  // 🔊 SOUND: element_appear @ frame 1493 — "anticipation" label appears below
  const anticipationOp = fadeIn(frame, T.ANTICIPATION);
  const anticipationY = slideUp(frame, T.ANTICIPATION);

  // Dopamine particles
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const dist = dopamineProgress * (80 + (i % 3) * 30);
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    const size = interpolate(dopamineProgress, [0, 0.3, 1], [0, 10, 4], clamp);
    const pOp = interpolate(dopamineProgress, [0, 0.2, 0.8, 1], [0, 1, 0.6, 0], clamp);
    return { px, py, size, pOp, color: i % 2 === 0 ? c.purple : c.pink };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
      {/* Main row: Bell → Brain */}
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        {/* Notification Bell */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: bellOp,
            transform: `translateY(${bellSlide}px)`,
          }}
        >
          <div style={{ position: "relative", width: 110, height: 110 }}>
            {/* Pulse ring */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: `2px solid ${c.blue}`,
                transform: `scale(${pulseScale})`,
                opacity: pulseOp,
              }}
            />
            {/* Bell circle */}
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${c.blue}25, ${c.blue}08)`,
                border: `2px solid ${c.blue}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${bellScale})`,
                boxShadow: `0 0 20px ${c.blue}20`,
              }}
            >
              <BellIcon size={44} color={c.blue} weight="duotone" />
            </div>
          </div>
          <span style={{ color: TEXT_SEC, fontSize: 15, fontWeight: 500 }}>
            Notification
          </span>
        </div>

        {/* Traveling dot from bell to brain */}
        <div style={{ width: 100, position: "relative", height: 4 }}>
          <div style={{ width: "100%", height: 2, background: `${c.purple}15`, borderRadius: 2 }} />
          {frame >= T.NOTIFICATION && frame < T.BRAIN + 10 && (() => {
            const travelProgress = interpolate(frame, [T.NOTIFICATION + 5, T.BRAIN], [0, 1], clamp);
            const tOp = interpolate(frame, [T.NOTIFICATION + 5, T.NOTIFICATION + 10], [0, 1], clamp) *
              interpolate(frame, [T.BRAIN - 5, T.BRAIN + 5], [1, 0], clamp);
            return (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  left: `${travelProgress * 100}%`,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c.purple,
                  boxShadow: `0 0 12px ${c.purple}80`,
                  transform: "translateX(-50%)",
                  opacity: tOp,
                }}
              />
            );
          })()}
        </div>

        {/* Brain with dopamine burst */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: brainOp,
            transform: `translateX(${brainX}px)`,
          }}
        >
          <div style={{ position: "relative", width: 140, height: 140 }}>
            {/* Dopamine particles */}
            {particles.map((p, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}80`,
                  transform: `translate(calc(-50% + ${p.px}px), calc(-50% + ${p.py}px))`,
                  opacity: p.pOp * dopamineOp,
                }}
              />
            ))}
            {/* Brain circle */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${c.purple}20, ${c.purple}06)`,
                border: `2px solid ${c.purple}50`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 ${brainGlow}px ${c.purple}30`,
              }}
            >
              <BrainIcon size={56} color={c.purple} weight="duotone" />
            </div>
          </div>
          <span style={{ color: TEXT, fontSize: 16, fontWeight: 600 }}>Your Brain</span>
        </div>
      </div>

      {/* Dopamine label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: dopamineLabelOp,
          transform: `translateY(${dopamineLabelY}px)`,
          padding: "14px 32px",
          borderRadius: 12,
          background: `${c.purple}10`,
          border: `1.5px solid ${c.purple}30`,
          boxShadow: `0 0 20px ${c.purple}15`,
        }}
      >
        <LightningIcon size={28} color={c.purple} weight="duotone" />
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 22,
            fontWeight: 700,
            color: c.purple,
            textShadow: `0 0 15px ${c.purple}40`,
          }}
        >
          Dopamine Hit
        </span>
      </div>

      {/* Anticipation insight */}
      <div
        style={{
          opacity: anticipationOp,
          transform: `translateY(${anticipationY}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: TEXT_SEC, fontSize: 16, fontWeight: 500 }}>
          Not because of the content...
        </span>
        <span
          style={{
            color: c.amber,
            fontSize: 20,
            fontWeight: 700,
            textShadow: `0 0 12px ${c.amber}30`,
          }}
        >
          ...but because of the anticipation
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Red Badge on App Icon + Open Loop
// "The red badge on your app icon is doing the same thing.
//  It creates an open loop in your mind, an unresolved
//  tension that can only be closed by tapping it."
// ═══════════════════════════════════════════════════════════
const Scene2_RedBadge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ChatIcon = getIcon("ChatCircleDots");
  const LockOpenIcon = getIcon("LockOpen");

  // 🔊 SOUND: scene_start @ frame 1547 — app icon fades in center
  const appScale = spring({
    frame: Math.max(0, frame - T.RED),
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const appOp = fadeIn(frame, T.RED, 12);

  // 🔊 SOUND: reveal @ frame 1553 — red badge pops on app icon with pulse
  const badgeScale = spring({
    frame: Math.max(0, frame - T.BADGE),
    fps,
    config: { damping: 18, stiffness: 220 },
  });
  const badgeOp = fadeIn(frame, T.BADGE, 8);

  // Badge pulse (ongoing subtle)
  const badgePulsePhase = (frame - T.BADGE) / 30;
  const badgePulseScale = frame >= T.BADGE
    ? 1 + Math.sin(badgePulsePhase * Math.PI * 2) * 0.08
    : 1;
  const badgeGlow = frame >= T.BADGE
    ? 15 + Math.sin(badgePulsePhase * Math.PI * 2) * 10
    : 0;

  // 🔊 SOUND: element_appear @ frame 1673 — open loop arc draws clockwise (incomplete circle)
  const loopDrawProgress = interpolate(frame, [T.OPEN, T.OPEN + 30], [0, 0.75], {
    ...clamp,
    easing: easeOut,
  });
  const loopOp = fadeIn(frame, T.OPEN, 15);

  // "Open Loop" label
  const loopLabelOp = fadeIn(frame, T.LOOP, 12);
  const loopLabelY = slideUp(frame, T.LOOP, 12);

  // 🔊 SOUND: element_appear @ frame 1724 — "unresolved tension" text pulses in
  const tensionOp = fadeIn(frame, T.UNRESOLVED);
  const tensionY = slideUp(frame, T.UNRESOLVED);

  // Tension glow grows
  const tensionGlow = interpolate(frame, [T.TENSION, T.TENSION + 20], [0, 25], clamp);

  // 🔊 SOUND: reveal @ frame 1802 — loop closes (arc completes), satisfaction click
  const loopCloseProgress = interpolate(frame, [T.TAPPING, T.TAPPING + 20], [0.75, 1], clamp);
  const closedOp = interpolate(frame, [T.TAPPING + 15, T.TAPPING + 25], [0, 1], clamp);

  // Combined arc progress
  const arcProgress = frame < T.TAPPING ? loopDrawProgress : loopCloseProgress;

  // Arc circumference for incomplete circle
  const arcRadius = 90;
  const arcCircumference = 2 * Math.PI * arcRadius;
  const arcDashLength = arcProgress * arcCircumference;
  const arcGapLength = arcCircumference - arcDashLength;

  // Gap color changes: red (open) → green (closed)
  const arcColor = frame >= T.TAPPING + 15 ? c.green : c.red;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 100 }}>
      {/* Left side: App icon with red badge */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          opacity: appOp,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 140,
            height: 140,
            transform: `scale(${appScale})`,
          }}
        >
          {/* App icon base */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 32,
              background: `linear-gradient(135deg, ${c.blue}25, ${c.blue}08)`,
              border: `2px solid ${c.blue}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${c.blue}15`,
            }}
          >
            <ChatIcon size={56} color={c.blue} weight="duotone" />
          </div>

          {/* Red badge */}
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: c.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${badgeGlow}px ${c.red}60`,
              opacity: badgeOp,
              transform: `scale(${badgeScale * badgePulseScale})`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 18,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              3
            </span>
          </div>
        </div>
        <span style={{ color: TEXT, fontSize: 16, fontWeight: 600 }}>App Icon</span>
        <span style={{ color: TEXT_SEC, fontSize: 14, fontWeight: 500 }}>
          The red badge demands attention
        </span>
      </div>

      {/* Right side: Open Loop visualization */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity: loopOp,
        }}
      >
        {/* SVG arc - decorative circle, not a connection */}
        <div style={{ position: "relative", width: 200, height: 200 }}>
          <svg width={200} height={200} style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle
              cx={100}
              cy={100}
              r={arcRadius}
              fill="none"
              stroke={`${arcColor}15`}
              strokeWidth={4}
            />
            {/* Active arc */}
            <circle
              cx={100}
              cy={100}
              r={arcRadius}
              fill="none"
              stroke={arcColor}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${arcDashLength} ${arcGapLength}`}
              style={{ filter: `drop-shadow(0 0 8px ${arcColor}60)` }}
            />
          </svg>
          {/* Center icon */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LockOpenIcon
              size={40}
              color={frame >= T.TAPPING + 15 ? c.green : c.red}
              weight="duotone"
            />
          </div>
          {/* "Closed!" checkmark when loop completes */}
          {frame >= T.TAPPING + 15 && (
            <div
              style={{
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                opacity: closedOp,
              }}
            >
              {(() => {
                const CheckIcon = getIcon("CheckCircle");
                return <CheckIcon size={28} color={c.green} weight="fill" />;
              })()}
            </div>
          )}
        </div>

        {/* Open Loop label */}
        <div
          style={{
            opacity: loopLabelOp,
            transform: `translateY(${loopLabelY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: c.red,
            }}
          >
            Open Loop
          </span>
          <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 500 }}>
            in your mind
          </span>
        </div>

        {/* Unresolved tension */}
        <div
          style={{
            opacity: tensionOp,
            transform: `translateY(${tensionY}px)`,
            padding: "12px 28px",
            borderRadius: 10,
            background: `${c.red}08`,
            border: `1px solid ${c.red}20`,
            boxShadow: `0 0 ${tensionGlow}px ${c.red}15`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: c.red,
            }}
          >
            Unresolved Tension
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Zeigarnik Effect — Brain obsesses over incomplete tasks
// "This is called the Zeigarnik effect. Your brain
//  obsesses over incomplete tasks."
// ═══════════════════════════════════════════════════════════
const Scene3_Zeigarnik: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const BrainIcon = getIcon("Brain");
  const CircleNotchIcon = getIcon("CircleNotch");
  const CheckSquareIcon = getIcon("CheckSquare");
  const SquareIcon = getIcon("Square");

  // 🔊 SOUND: scene_start @ frame 1868 — "Zeigarnik Effect" title scales in
  const titleScale = spring({
    frame: Math.max(0, frame - T.ZEIGARNIK),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const titleOp = fadeIn(frame, T.ZEIGARNIK, 15);

  // "effect" label
  // 🔊 SOUND: element_appear @ frame 1886 — subtitle fades in under title
  const subtitleOp = fadeIn(frame, T.EFFECT, 12);
  const subtitleY = slideUp(frame, T.EFFECT, 12);

  // 🔊 SOUND: element_appear @ frame 1935 — brain icon with spinning notch appears
  const brainOp = fadeIn(frame, T.OBSESSES, 15);
  const brainSlide = slideUp(frame, T.OBSESSES, 15);

  // Spinning notch around brain (obsession visual)
  const spinAngle = frame >= T.OBSESSES
    ? ((frame - T.OBSESSES) / 30) * 360 * 0.5
    : 0;

  // Brain glow pulses (obsessive thinking)
  const obsessGlow = frame >= T.OBSESSES
    ? 15 + Math.sin(((frame - T.OBSESSES) / 30) * Math.PI * 3) * 10
    : 0;

  // 🔊 SOUND: staggered_group @ frame 1963 — 4 task items appear staggered (2 complete, 2 incomplete)
  const tasks = [
    { label: "Reply to email", done: true },
    { label: "Review document", done: true },
    { label: "Check notification", done: false },
    { label: "Read message", done: false },
  ];

  // 🔊 SOUND: reveal @ frame 1982 — incomplete tasks glow red, brain obsession visual intensifies
  const incompleteGlow = interpolate(frame, [T.TASKS, T.TASKS + 15], [0, 20], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
      {/* Zeigarnik Effect title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: titleOp,
          transform: `scale(${titleScale})`,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 28,
            fontWeight: 800,
            color: c.amber,
            letterSpacing: 2,
            textShadow: `0 0 20px ${c.amber}30`,
          }}
        >
          THE ZEIGARNIK EFFECT
        </span>
        <span
          style={{
            color: TEXT_SEC,
            fontSize: 16,
            fontWeight: 500,
            opacity: subtitleOp,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          Your brain obsesses over what is not finished
        </span>
      </div>

      {/* Main content: Brain + Task list */}
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        {/* Brain with obsession spinner */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: brainOp,
            transform: `translateY(${brainSlide}px)`,
          }}
        >
          <div style={{ position: "relative", width: 160, height: 160 }}>
            {/* Spinning orbit ring */}
            <div
              style={{
                position: "absolute",
                inset: -10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircleNotchIcon
                size={180}
                color={`${c.amber}50`}
                weight="bold"
                style={{ transform: `rotate(${spinAngle}deg)` }}
              />
            </div>
            {/* Brain */}
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${c.purple}18, ${c.purple}06)`,
                border: `2px solid ${c.purple}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 ${obsessGlow}px ${c.purple}40`,
              }}
            >
              <BrainIcon size={64} color={c.purple} weight="duotone" />
            </div>
          </div>
          <span style={{ color: TEXT, fontSize: 16, fontWeight: 600 }}>
            Can't stop thinking...
          </span>
        </div>

        {/* Task list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tasks.map((task, i) => {
            const taskDelay = T.INCOMPLETE + i * 8;
            const taskOp = fadeIn(frame, taskDelay, 12);
            const taskX = interpolate(frame, [taskDelay, taskDelay + 12], [30, 0], {
              ...clamp,
              easing: easeOut,
            });
            const TaskIcon = task.done ? CheckSquareIcon : SquareIcon;
            const taskColor = task.done ? c.green : c.red;
            const isDimmed = task.done;

            return (
              <div
                key={task.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 24px",
                  borderRadius: 10,
                  background: task.done ? `${c.green}06` : `${c.red}08`,
                  border: `1px solid ${taskColor}${task.done ? "15" : "25"}`,
                  boxShadow: !task.done ? `0 0 ${incompleteGlow}px ${c.red}20` : "none",
                  opacity: taskOp,
                  transform: `translateX(${taskX}px)`,
                  width: 340,
                }}
              >
                <TaskIcon
                  size={24}
                  color={taskColor}
                  weight={task.done ? "fill" : "duotone"}
                />
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: isDimmed ? TEXT_DIM : TEXT,
                    textDecoration: task.done ? "line-through" : "none",
                  }}
                >
                  {task.label}
                </span>
                {!task.done && frame >= T.TASKS && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: c.red,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: `${c.red}15`,
                    }}
                  >
                    UNFINISHED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Generated_DopamineRedBadge;
