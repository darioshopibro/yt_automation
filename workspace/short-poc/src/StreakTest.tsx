import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  random,
  Easing,
} from "remotion";

/* ═══════════════════════════════════════════════════════════════
   MOTION STREAK / SPEED BLUR TRANSITION

   Element moves FAST downward, leaves a stretched rainbow
   blur trail with scan lines. Like warp speed / comet.

   Technique: Ghost copies + SVG directional blur +
   scan line overlay + rainbow hue shift + glow.

   Same structure: source → streak → target grows from center.
   ═══════════════════════════════════════════════════════════════ */

const G = {
  bg: "#0C0C0C",  // very dark for glow to pop
  dark: "#1E3A2F",
  mint: "#80C2A0",
  white: "#FFFFFF",
  shadow: (a: number) => `rgba(0,0,0,${a})`,
};

const SP = {
  entrance: { mass: 0.8, damping: 20, stiffness: 200, overshootClamping: false },
  bounce: { mass: 1, damping: 12, stiffness: 180, overshootClamping: false },
  morph: { mass: 1.5, damping: 18, stiffness: 100, overshootClamping: false },
};

function multiShadow(y: number, blur: number, a: number) {
  return `inset 0 1px 0 rgba(255,255,255,0.08), 0 ${y * 0.3}px ${blur * 0.3}px ${G.shadow(a * 0.4)}, 0 ${y}px ${blur}px ${G.shadow(a * 0.7)}, 0 ${y * 2}px ${blur * 2.5}px ${G.shadow(a * 0.3)}`;
}

function layeredEntrance(frame: number, at: number, fps: number) {
  const f = frame - at;
  if (f < -2) return { opacity: 0, y: 30, scale: 0.85 };
  const ff = Math.max(0, f);
  return {
    opacity: interpolate(ff, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
    y: interpolate(spring({ frame: ff, fps, config: SP.entrance }), [0, 1], [30, 0]),
    scale: interpolate(spring({ frame: Math.max(0, ff - 3), fps, config: SP.bounce }), [0, 1], [0.85, 1]),
  };
}

// ═══ MOTION STREAK TRANSITION ═══
// Element streaks from A to B with rainbow blur trail
const MotionStreak: React.FC<{
  id: string;
  startX: number; startY: number;
  endX: number; endY: number;
  progress: number;  // 0→1
  trailCount?: number;
  elementWidth?: number;
  elementHeight?: number;
}> = ({ id, startX, startY, endX, endY, progress, trailCount = 14, elementWidth = 200, elementHeight = 48 }) => {
  const frame = useCurrentFrame();
  if (progress <= 0.01) return null;

  // Current position — fast ease (quick start, dramatic)
  const easedProgress = Easing.bezier(0.25, 0.1, 0.25, 1)(Math.min(progress, 1));
  const currentX = interpolate(easedProgress, [0, 1], [startX, endX]);
  const currentY = interpolate(easedProgress, [0, 1], [startY, endY]);

  // Speed (velocity) for blur intensity
  const speed = progress < 0.05 ? 0 : interpolate(
    progress, [0.05, 0.3, 0.7, 0.95],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Lead element: directional blur based on speed
  const verticalBlur = speed * 25;

  // Lead element scale: stretched vertically during movement
  const scaleY = 1 + speed * 1.5;
  const scaleX = 1 - speed * 0.15; // slightly narrower when stretched

  // Lead opacity: visible during transit
  const leadOpacity = interpolate(progress, [0, 0.05, 0.85, 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Ghost copies trail
  const ghosts: JSX.Element[] = [];
  const trailSpacing = Math.abs(endY - startY) / (trailCount * 3);

  for (let i = 0; i < trailCount; i++) {
    const age = (i + 1) / trailCount; // 0 = newest, 1 = oldest
    const ghostY = currentY - (i + 1) * trailSpacing * speed;
    const ghostX = currentX - (endX - startX) * age * easedProgress * 0.1;

    // Opacity: newer = brighter, older = dimmer
    const ghostOpacity = interpolate(age, [0, 0.5, 1], [0.5, 0.2, 0.02]) * speed;
    if (ghostOpacity < 0.01) continue;

    // Stretch: older ghosts are more stretched
    const ghostScaleY = 1 + age * 2 * speed;

    // Rainbow hue shift
    const hue = (age * 280 + frame * 2) % 360; // cycles through rainbow
    const ghostColor = `hsla(${hue}, 85%, 60%, ${ghostOpacity})`;

    ghosts.push(
      <div key={i} style={{
        position: "absolute",
        left: ghostX,
        top: ghostY,
        width: elementWidth,
        height: elementHeight,
        transform: `translate(-50%, -50%) scaleY(${ghostScaleY}) scaleX(${scaleX * 0.9})`,
        background: ghostColor,
        borderRadius: 30,
        boxShadow: `0 0 ${15 + age * 20}px ${ghostColor}, 0 0 ${30 + age * 40}px ${ghostColor}`,
      }} />
    );
  }

  // SVG filter for directional blur on lead element
  const filterId = `streak-blur-${id}`;

  return (
    <>
      {/* SVG filter definition */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id={filterId} x="-50%" y="-100%" width="200%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`0 ${verticalBlur}`} />
          </filter>
        </defs>
      </svg>

      {/* Ghost trail (behind lead) */}
      {ghosts}

      {/* Scan lines overlay on trail area */}
      {speed > 0.1 && (
        <div style={{
          position: "absolute",
          left: Math.min(startX, endX) - elementWidth,
          top: Math.min(currentY - trailCount * trailSpacing * speed, startY) - 50,
          width: elementWidth * 2,
          height: Math.abs(currentY - startY) + 100,
          background: `repeating-linear-gradient(0deg, rgba(255,255,255,${0.04 * speed}) 0px, rgba(255,255,255,${0.04 * speed}) 1px, transparent 1px, transparent 4px)`,
          pointerEvents: "none",
          transform: "translate(-50%, 0)",
          mixBlendMode: "screen" as const,
        }} />
      )}

      {/* Lead element (with directional blur) */}
      <div style={{
        position: "absolute",
        left: currentX,
        top: currentY,
        width: elementWidth,
        height: elementHeight,
        transform: `translate(-50%, -50%) scaleY(${scaleY}) scaleX(${scaleX})`,
        transformOrigin: "center center",
        opacity: leadOpacity,
        background: G.dark,
        borderRadius: 30,
        filter: verticalBlur > 1 ? `url(#${filterId})` : "none",
        boxShadow: speed > 0.2
          ? `0 0 ${20 * speed}px ${G.mint}, 0 0 ${40 * speed}px ${G.mint}60`
          : multiShadow(8, 24, 0.15),
        display: "flex", alignItems: "center", justifyContent: "center",
        color: G.white, fontSize: 17, fontWeight: 700,
        fontFamily: "-apple-system, sans-serif",
        gap: 8, overflow: "hidden",
      }}>
        {speed < 0.3 && (
          <>
            <span style={{ fontSize: 15, opacity: 1 - speed * 3 }}>📄</span>
            <span style={{ opacity: 1 - speed * 3 }}>Agents.md</span>
          </>
        )}
      </div>
    </>
  );
};

// ═══ FILM GRAIN ═══
const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}>
      <defs>
        <filter id="grain-st">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={frame} stitchTiles="stitch" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#grain-st)" opacity={0.06} />
    </svg>
  );
};

// ═══ MORPH ELEMENT ═══
const MorphElement: React.FC<{
  x: number; y: number;
  morphProgress: number;
  pillLabel: string; pillIcon: string;
  cardTitle: string;
  cardWidth?: number; cardHeight?: number;
  children?: React.ReactNode;
}> = ({ x, y, morphProgress, pillLabel, pillIcon, cardTitle, cardWidth = 380, cardHeight = 460, children }) => {
  const p = morphProgress;
  if (p <= 0) return null;

  const width = interpolate(p, [0, 0.15, 1], [50, 240, cardWidth], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const height = interpolate(p, [0, 0.15, 1], [50, 50, cardHeight], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const borderRadius = interpolate(p, [0, 0.15, 1], [50, 50, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(p, [0, 0.06], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pillOpacity = interpolate(p, [0.08, 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contentOpacity = interpolate(p, [0.6, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contentY = interpolate(p, [0.6, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      width, height, background: G.dark, borderRadius, overflow: "hidden",
      boxShadow: multiShadow(interpolate(p, [0, 1], [4, 22]), interpolate(p, [0, 1], [12, 52]), interpolate(p, [0, 1], [0.1, 0.22])),
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        position: "absolute", opacity: pillOpacity,
        color: G.white, fontSize: 19, fontWeight: 700, fontFamily: '-apple-system, sans-serif',
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>{pillIcon}</span>{pillLabel}
      </div>
      <div style={{
        position: "absolute", inset: 0, padding: interpolate(p, [0, 1], [0, 28]),
        opacity: contentOpacity, transform: `translateY(${contentY}px)`,
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, background: "rgba(255,255,255,0.1)", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{pillIcon}</div>
        <div style={{ color: G.white, fontSize: 24, fontWeight: 800, fontFamily: '-apple-system, sans-serif', letterSpacing: -0.5 }}>{cardTitle}</div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        {children}
      </div>
    </div>
  );
};

const FeaturePill: React.FC<{
  label: string; icon: string; opacity: number; scale: number; y: number;
}> = ({ label, icon, opacity, scale, y }) => (
  <div style={{
    background: G.mint, color: G.dark, padding: "10px 20px", borderRadius: 50,
    fontSize: 15, fontWeight: 700, fontFamily: '-apple-system, sans-serif',
    display: "flex", alignItems: "center", gap: 8,
    boxShadow: `0 4px 14px ${G.shadow(0.1)}`,
    transform: `scale(${scale}) translateY(${y}px)`, opacity,
  }}>
    <span>{icon}</span>{label}
  </div>
);

/* ═══════════════════════════════════════════
   MAIN COMPOSITION
   Source pill → STREAK down → card grows
   Card → STREAK down → target card grows
   ═══════════════════════════════════════════ */
export const StreakTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD_H = 460;

  const T = {
    sourceAppear: 0,
    streak1Start: 40,
    featuresAppear: 140,
    streak2Start: 240,
    targetFeatures: 340,
  };

  const POS = {
    source: { x: 540, y: 350 },
    card: { x: 540, y: 900 },
    target: { x: 540, y: 1500 },
  };

  // Streak 1: FAST spring
  const streak1P = (() => {
    const f = frame - T.streak1Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: { mass: 0.5, damping: 18, stiffness: 200, overshootClamping: false } });
  })();

  const cardMorphP = (() => {
    if (streak1P < 0.88) return 0;
    const earlyP = interpolate(streak1P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.streak1Start - 18;
    if (f < 0) return earlyP;
    const sp = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(sp, [0, 1], [0.1, 1]));
  })();

  // Streak 2
  const streak2P = (() => {
    const f = frame - T.streak2Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: { mass: 0.5, damping: 18, stiffness: 200, overshootClamping: false } });
  })();

  const targetMorphP = (() => {
    if (streak2P < 0.88) return 0;
    const earlyP = interpolate(streak2P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.streak2Start - 18;
    if (f < 0) return earlyP;
    const sp = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(sp, [0, 1], [0.1, 1]));
  })();

  // Source fades
  const sourceOpacity = frame < T.streak1Start ? 1 :
    interpolate(streak1P, [0, 0.1], [1, 0], { extrapolateRight: "clamp" });

  const agentFeatures = [
    { label: "What you do", icon: "🎯" },
    { label: "How you sound", icon: "🗣" },
    { label: "How you work", icon: "⚙️" },
  ];
  const targetFeatures = [
    { label: "Brand details", icon: "🏷" },
    { label: "Ideal customer", icon: "👤" },
    { label: "Decision factors", icon: "⚖️" },
  ];

  return (
    <AbsoluteFill style={{ background: G.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1080, height: 4000 }}>
        {/* Source */}
        <div style={{
          position: "absolute", left: POS.source.x, top: POS.source.y,
          transform: "translate(-50%, -50%)", opacity: sourceOpacity,
          background: G.dark, color: G.white,
          padding: "16px 32px", borderRadius: 50,
          fontSize: 21, fontWeight: 700, fontFamily: '-apple-system, sans-serif',
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: multiShadow(10, 28, 0.18),
        }}>
          <span style={{ fontSize: 18 }}>📄</span>Agents.md
        </div>

        {/* Streak 1 */}
        {frame >= T.streak1Start && streak1P < 0.99 && (
          <MotionStreak
            id="s1"
            startX={POS.source.x} startY={POS.source.y + 25}
            endX={POS.card.x} endY={POS.card.y}
            progress={streak1P}
          />
        )}

        {/* Card */}
        {cardMorphP > 0 && (
          <MorphElement
            x={POS.card.x} y={POS.card.y}
            morphProgress={cardMorphP}
            pillLabel="Agents.md" pillIcon="📄" cardTitle="Agents.md"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {agentFeatures.map((feat, i) => {
                const a = layeredEntrance(frame, T.featuresAppear + i * 12, fps);
                return <FeaturePill key={i} label={feat.label} icon={feat.icon} opacity={a.opacity} scale={a.scale} y={a.y} />;
              })}
            </div>
          </MorphElement>
        )}

        {/* Streak 2 */}
        {frame >= T.streak2Start && streak2P < 0.99 && (
          <MotionStreak
            id="s2"
            startX={POS.card.x} startY={POS.card.y + CARD_H / 2}
            endX={POS.target.x} endY={POS.target.y}
            progress={streak2P}
          />
        )}

        {/* Target */}
        {targetMorphP > 0 && (
          <MorphElement
            x={POS.target.x} y={POS.target.y}
            morphProgress={targetMorphP}
            pillLabel="Context.md" pillIcon="📋" cardTitle="Context.md"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {targetFeatures.map((feat, i) => {
                const a = layeredEntrance(frame, T.targetFeatures + i * 12, fps);
                return <FeaturePill key={i} label={feat.label} icon={feat.icon} opacity={a.opacity} scale={a.scale} y={a.y} />;
              })}
            </div>
          </MorphElement>
        )}
      </div>

      <GrainOverlay />
    </AbsoluteFill>
  );
};
