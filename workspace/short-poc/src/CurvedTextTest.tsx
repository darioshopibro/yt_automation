import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

/* ═══════════════════════════════════════════════════════════════
   CURVED TEXT TRANSITION TEST

   Same structure as GregV2 blob — but instead of blob,
   TEXT types along a bezier curve from element A to element B.

   Typewriter on a curve. When text reaches destination,
   element B grows from that center.

   SVG textPath + substring slicing (Remotion-friendly).
   ═══════════════════════════════════════════════════════════════ */

const G = {
  bg: "#F0F0F0",
  dark: "#1E3A2F",
  mint: "#80C2A0",
  white: "#FFFFFF",
  gridDot: "#DBDBDB",
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

// ═══ CURVED TEXT TRANSITION ═══
// Text types along bezier curve from source to destination
const CurvedTextTransition: React.FC<{
  id: string;
  startX: number; startY: number; // bottom edge of source
  endX: number; endY: number;     // center of target
  progress: number;               // 0→1
  text: string;                   // the sentence to type
  curveAmount?: number;           // horizontal curve offset
  fontSize?: number;
  charsPerSecond?: number;
}> = ({
  id, startX, startY, endX, endY, progress, text,
  curveAmount = 80, fontSize = 20, charsPerSecond = 18,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (progress <= 0.01) return null;

  // How many chars visible based on progress (not time — tied to transition progress)
  const visibleChars = Math.min(
    Math.floor(progress * text.length * 1.2), // slightly faster than progress so text finishes before arrival
    text.length,
  );
  const displayText = text.substring(0, visibleChars);

  // Cursor blink
  const showCursor = visibleChars < text.length && frame % 8 < 5;

  // Path: bezier curve from source bottom to target center
  // Control point offset horizontally for nice curve
  const cpX = (startX + endX) / 2 + curveAmount;
  const cpY = (startY + endY) / 2;
  const pathD = `M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`;

  // Text opacity: fade in as it starts, slight fade on older chars
  const textOpacity = interpolate(progress, [0, 0.05, 0.85, 1], [0, 1, 1, 0.3], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Glow intensity
  const glowOpacity = interpolate(progress, [0, 0.1, 0.5, 0.9, 1], [0, 0.6, 0.8, 0.4, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const filterId = `text-glow-${id}`;
  const pathId = `text-path-${id}`;

  return (
    <svg style={{
      position: "absolute", left: 0, top: 0,
      width: 1080, height: 4000,
      pointerEvents: "none", overflow: "visible",
    }}>
      <defs>
        <path id={pathId} d={pathD} fill="none" />
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Faint path line (shows the curve) */}
      <path d={pathD} fill="none" stroke={G.dark} strokeWidth="1" opacity={0.12 * textOpacity}
        strokeDasharray="4 4" />

      {/* Glow text layer (behind) */}
      <text
        fontSize={fontSize}
        fontFamily="'Inter', -apple-system, sans-serif"
        fontWeight="600"
        fill={G.mint}
        opacity={glowOpacity * 0.5}
        filter={`url(#${filterId})`}
        textRendering="optimizeSpeed"
      >
        <textPath href={`#${pathId}`}>
          {displayText}
        </textPath>
      </text>

      {/* Main text layer */}
      <text
        fontSize={fontSize}
        fontFamily="'Inter', -apple-system, sans-serif"
        fontWeight="700"
        fill={G.dark}
        opacity={textOpacity}
        letterSpacing="0.5"
      >
        <textPath href={`#${pathId}`}>
          {displayText}{showCursor ? "│" : ""}
        </textPath>
      </text>
    </svg>
  );
};

// ═══ FILM GRAIN ═══
const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}>
      <defs>
        <filter id="grain-ct">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={frame} stitchTiles="stitch" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#grain-ct)" opacity={0.04} />
    </svg>
  );
};

// ═══ DOT GRID ═══
const DotGrid: React.FC = () => (
  <div style={{
    position: "absolute", width: 1080, height: 4000, background: G.bg,
    backgroundImage: `radial-gradient(circle, ${G.gridDot} 1.2px, transparent 1.2px)`,
    backgroundSize: "28px 28px",
  }} />
);

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

// ═══ FEATURE PILL ═══
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
   Source pill → curved text types → card grows
   Card → curved text types → second card grows
   ═══════════════════════════════════════════ */
export const CurvedTextTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD_H = 460;

  const T = {
    sourceAppear: 0,
    text1Start: 40,
    featuresAppear: 200,
    text2Start: 300,
    targetFeatures: 460,
  };

  const POS = {
    source: { x: 540, y: 400 },
    card: { x: 540, y: 920 },
    target: { x: 540, y: 1500 },
  };

  // Text transition 1: progress
  const text1P = (() => {
    const f = frame - T.text1Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: { mass: 1.2, damping: 16, stiffness: 60, overshootClamping: false } });
  })();

  // Card morph tied to text progress (zero delay)
  const cardMorphP = (() => {
    if (text1P < 0.88) return 0;
    const earlyP = interpolate(text1P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.text1Start - 60;
    if (f < 0) return earlyP;
    const sp = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(sp, [0, 1], [0.1, 1]));
  })();

  // Text transition 2
  const text2P = (() => {
    const f = frame - T.text2Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: { mass: 1.2, damping: 16, stiffness: 60, overshootClamping: false } });
  })();

  const targetMorphP = (() => {
    if (text2P < 0.88) return 0;
    const earlyP = interpolate(text2P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.text2Start - 60;
    if (f < 0) return earlyP;
    const sp = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(sp, [0, 1], [0.1, 1]));
  })();

  // Source fades when text starts
  const sourceOpacity = frame < T.text1Start ? 1 :
    interpolate(text1P, [0, 0.15], [1, 0], { extrapolateRight: "clamp" });

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
        <DotGrid />

        {/* Source element */}
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

        {/* Curved text 1: source → card */}
        <CurvedTextTransition
          id="t1"
          startX={POS.source.x} startY={POS.source.y + 25}
          endX={POS.card.x} endY={POS.card.y}
          progress={text1P}
          text="Defines your agent's personality, role, and behavior..."
          curveAmount={80}
          fontSize={18}
        />

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

        {/* Curved text 2: card → target (curves the other way) */}
        <CurvedTextTransition
          id="t2"
          startX={POS.card.x} startY={POS.card.y + CARD_H / 2}
          endX={POS.target.x} endY={POS.target.y}
          progress={text2P}
          text="Context gives your agent deep knowledge about the brand..."
          curveAmount={-70}
          fontSize={18}
        />

        {/* Target card */}
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
