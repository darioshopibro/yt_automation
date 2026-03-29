import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";

/* ═══════════════════════════════════════════
   GREG ISENBERG STYLE — MORPH TRANSITION TEST

   Replicating Video 1 [0:03-0:14]:
   Scene A: 4 pills float
   → MORPH: Pills slide to center, merge into 1
   Scene B: Pill morphs into large card
   → POP: 3 feature pills appear inside card
   ═══════════════════════════════════════════ */

// ─── GREG COLOR PALETTE ───
const G = {
  bg: "#F0F0F0",
  dark: "#1E3A2F",
  mint: "#80C2A0",
  coral: "#DE6B58",
  white: "#FFFFFF",
  gridDot: "#DBDBDB",
};

// ─── SPRING CONFIGS (Greg-style: bouncy, visible overshoot) ───
const Springs = {
  // Heavy elastic bounce — for morph transitions
  morph: { mass: 0.8, damping: 8, stiffness: 120, overshootClamping: false },
  // Snappy pop — for elements appearing
  pop: { mass: 0.5, damping: 9, stiffness: 200, overshootClamping: false },
  // Soft slide — for position changes
  slide: { mass: 1.0, damping: 14, stiffness: 100, overshootClamping: false },
  // Heavy drop — for weighty things
  drop: { mass: 1.2, damping: 10, stiffness: 80, overshootClamping: false },
};

// ─── DOT GRID BACKGROUND ───
const DotGrid: React.FC = () => (
  <div
    style={{
      position: "absolute",
      width: "100%",
      height: "100%",
      background: G.bg,
      backgroundImage: `radial-gradient(circle, ${G.gridDot} 1.2px, transparent 1.2px)`,
      backgroundSize: "28px 28px",
    }}
  />
);

// ─── GREG-STYLE PILL BADGE ───
const Pill: React.FC<{
  label: string;
  icon?: string;
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  variant?: "dark" | "mint";
}> = ({ label, icon = "📄", x, y, scale = 1, opacity = 1, variant = "dark" }) => {
  const bg = variant === "dark" ? G.dark : G.mint;
  const fg = variant === "dark" ? G.white : G.dark;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        background: bg,
        color: fg,
        padding: "14px 28px",
        borderRadius: 50,
        fontSize: 19,
        fontWeight: 700,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: `0 8px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)`,
        whiteSpace: "nowrap" as const,
        letterSpacing: -0.3,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </div>
  );
};

// ─── THE MORPH ELEMENT ───
// This is the KEY component: one DOM node that smoothly transitions
// from pill shape to card shape using interpolate + spring
const MorphPillToCard: React.FC<{
  startFrame: number; // when morph begins
  x: number;
  y: number;
  pillLabel: string;
  cardTitle: string;
  cardContent: React.ReactNode;
}> = ({ startFrame, x, y, pillLabel, cardTitle, cardContent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const f = frame - startFrame;
  if (f < -10) return null;

  // Spring for the morph (0 = pill, 1 = card)
  const morphProgress = f <= 0 ? 0 : spring({
    frame: f,
    fps,
    config: Springs.morph,
  });

  // Dimensions morph
  const width = interpolate(morphProgress, [0, 1], [220, 360]);
  const height = interpolate(morphProgress, [0, 1], [48, 420]);
  const borderRadius = interpolate(morphProgress, [0, 1], [50, 20]);
  const padding = interpolate(morphProgress, [0, 1], [0, 28]);

  // Shadow grows as card expands
  const shadowY = interpolate(morphProgress, [0, 1], [8, 20]);
  const shadowBlur = interpolate(morphProgress, [0, 1], [28, 50]);
  const shadowAlpha = interpolate(morphProgress, [0, 1], [0.18, 0.25]);

  // Pill label fades out, card content fades in
  const pillLabelOpacity = interpolate(morphProgress, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });
  const cardContentOpacity = interpolate(morphProgress, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contentSlideY = interpolate(morphProgress, [0.5, 1], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        width,
        height,
        background: G.dark,
        borderRadius,
        overflow: "hidden",
        boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha}), 0 2px 8px rgba(0,0,0,0.08)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "none",
      }}
    >
      {/* Pill label (fades out during morph) */}
      <div
        style={{
          position: "absolute",
          opacity: pillLabelOpacity,
          color: G.white,
          fontSize: 19,
          fontWeight: 700,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          display: "flex",
          alignItems: "center",
          gap: 10,
          letterSpacing: -0.3,
        }}
      >
        <span style={{ fontSize: 16 }}>📄</span>
        {pillLabel}
      </div>

      {/* Card content (fades in after morph) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: padding,
          opacity: cardContentOpacity,
          transform: `translateY(${contentSlideY}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Card icon */}
        <div
          style={{
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          📄
        </div>
        {/* Card title */}
        <div
          style={{
            color: G.white,
            fontSize: 24,
            fontWeight: 800,
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            letterSpacing: -0.5,
          }}
        >
          {cardTitle}
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        {/* Card content */}
        {cardContent}
      </div>
    </div>
  );
};

// ─── ANIMATED DOTTED LINE ───
const DottedLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  at: number;
}> = ({ x1, y1, x2, y2, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;

  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const progress = spring({ frame: f, fps, config: { mass: 1.2, damping: 18, stiffness: 40 } });
  const dashOffset = interpolate(progress, [0, 1], [len, 0]);

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={G.dark}
        strokeWidth={2.5}
        strokeDasharray="8 6"
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        opacity={interpolate(progress, [0, 0.1], [0, 0.5], { extrapolateRight: "clamp" })}
      />
    </svg>
  );
};

// ─── SUNBURST ACCENT ───
const Sunburst: React.FC<{ x: number; y: number; at: number; size?: number }> = ({
  x, y, at, size = 140,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;

  const s = spring({ frame: frame - at, fps, config: Springs.pop });
  const rotation = interpolate(frame - at, [0, 300], [0, 360]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${interpolate(s, [0, 1], [0.3, 1])}) rotate(${rotation}deg)`,
        width: size,
        height: size,
        opacity: interpolate(s, [0, 0.3], [0, 0.6], { extrapolateRight: "clamp" }),
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="50" y1="50"
            x2={50 + 45 * Math.cos((i * 30 * Math.PI) / 180)}
            y2={50 + 45 * Math.sin((i * 30 * Math.PI) / 180)}
            stroke={G.coral}
            strokeWidth="4"
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}
        <circle cx="50" cy="50" r="12" fill={G.coral} opacity={0.8} />
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPOSITION — Greg Video 1 Replica
   Total: ~210 frames = 7 seconds @ 30fps
   ═══════════════════════════════════════════ */
export const GregTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE TIMING ───
  const PILLS_APPEAR = 0;       // 4 pills pop in
  const PILLS_CONVERGE = 60;    // pills slide to center
  const PILLS_MERGE = 100;      // 4 pills fade, 1 merged pill appears
  const PILL_MORPH = 130;       // merged pill morphs into card
  const FEATURES_POP = 185;     // feature pills pop inside card

  // ─── Helper: spring pop for individual pill appearance ───
  const pillPop = (at: number) => {
    const f = frame - at;
    if (f < 0) return { scale: 0, opacity: 0 };
    const s = spring({ frame: f, fps, config: Springs.pop });
    return {
      scale: interpolate(s, [0, 1], [0.2, 1]),
      opacity: interpolate(s, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
    };
  };

  // ─── Helper: slide position for convergence ───
  const slidePos = (startX: number, startY: number, endX: number, endY: number) => {
    const f = frame - PILLS_CONVERGE;
    if (f < 0) return { x: startX, y: startY };
    const s = spring({ frame: f, fps, config: Springs.slide });
    return {
      x: interpolate(s, [0, 1], [startX, endX]),
      y: interpolate(s, [0, 1], [startY, endY]),
    };
  };

  // ─── 4 Pills fade out during merge ───
  const mergeFade = (() => {
    const f = frame - PILLS_MERGE;
    if (f < 0) return 1;
    return interpolate(f, [0, 12], [1, 0], { extrapolateRight: "clamp" });
  })();

  // ─── Merged single pill appears ───
  const mergedPillPop = (() => {
    const f = frame - (PILLS_MERGE + 5);
    if (f < 0) return { scale: 0, opacity: 0 };
    const s = spring({ frame: f, fps, config: Springs.pop });
    return {
      scale: interpolate(s, [0, 1], [0.3, 1]),
      opacity: interpolate(s, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
    };
  })();

  // ─── Show merged pill until morph starts ───
  const showMergedPill = frame >= PILLS_MERGE + 5 && frame < PILL_MORPH + 5;

  // ─── Feature pills inside card ───
  const featurePop = (index: number) => {
    const at = FEATURES_POP + index * 8;
    const f = frame - at;
    if (f < 0) return { scale: 0, opacity: 0, y: 20 };
    const s = spring({ frame: f, fps, config: Springs.pop });
    return {
      scale: interpolate(s, [0, 1], [0.3, 1]),
      opacity: interpolate(s, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
      y: interpolate(s, [0, 1], [20, 0]),
    };
  };

  // ─── Pill positions ───
  const cx = 540, cy = 820; // center
  const pillPositions = [
    slidePos(320, 720, cx, cy),  // Agents.md
    slidePos(760, 720, cx, cy),  // Context.md
    slidePos(320, 920, cx, cy),  // Memory.md
    slidePos(760, 920, cx, cy),  // Skills.md
  ];
  const pillLabels = ["Agents.md", "Context.md", "Memory.md", "Skills.md"];
  const pillIcons = ["📄", "📋", "🧠", "⚡"];

  const features = [
    { label: "What you do", icon: "🎯" },
    { label: "How you sound", icon: "🗣" },
    { label: "How you work", icon: "⚙️" },
  ];

  return (
    <AbsoluteFill>
      <DotGrid />

      {/* Sunburst accent behind everything */}
      <Sunburst x={540} y={820} at={PILLS_APPEAR + 10} size={200} />

      {/* ═══ PHASE 1: 4 Pills floating ═══ */}
      {pillPositions.map((pos, i) => {
        const pop = pillPop(PILLS_APPEAR + i * 6);
        return (
          <Pill
            key={i}
            label={pillLabels[i]}
            icon={pillIcons[i]}
            x={pos.x}
            y={pos.y}
            scale={pop.scale}
            opacity={pop.opacity * mergeFade}
          />
        );
      })}

      {/* ═══ PHASE 2: Merged single pill ═══ */}
      {showMergedPill && (
        <Pill
          label="Agents.md"
          icon="📄"
          x={cx}
          y={cy}
          scale={mergedPillPop.scale}
          opacity={mergedPillPop.opacity}
        />
      )}

      {/* ═══ PHASE 3: Morph pill → card ═══ */}
      {frame >= PILL_MORPH && (
        <MorphPillToCard
          startFrame={PILL_MORPH}
          x={cx}
          y={cy}
          pillLabel="Agents.md"
          cardTitle="Agents.md"
          cardContent={
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {features.map((feat, i) => {
                const fp = featurePop(i);
                return (
                  <div
                    key={i}
                    style={{
                      background: G.mint,
                      color: G.dark,
                      padding: "10px 20px",
                      borderRadius: 50,
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: '-apple-system, sans-serif',
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                      transform: `scale(${fp.scale}) translateY(${fp.y}px)`,
                      opacity: fp.opacity,
                    }}
                  >
                    <span>{feat.icon}</span>
                    {feat.label}
                  </div>
                );
              })}
            </div>
          }
        />
      )}
    </AbsoluteFill>
  );
};
