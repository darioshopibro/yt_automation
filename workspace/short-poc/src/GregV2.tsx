import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";

/* ═══════════════════════════════════════════════════════════════
   GREG V2 — BLOB + PARTICLE TRAIL + GOO + GRAIN + GLOW

   Fixes:
   - Blob starts from BOTTOM EDGE of source, ends at CENTER of target
   - Element grows INSTANTLY when blob arrives (0 delay)
   - Blob speed slower (stiffness 80)
   - Gooey SVG filter on collision (pills melt together)
   - Film grain overlay (feTurbulence seed={frame})
   - Neon glow on blob (5-layer mint shadow)
   ═══════════════════════════════════════════════════════════════ */

const G = {
  bg: "#F0F0F0",
  dark: "#1E3A2F",
  mint: "#80C2A0",
  coral: "#DE6B58",
  white: "#FFFFFF",
  gridDot: "#DBDBDB",
  shadow: (a: number) => `rgba(0,0,0,${a})`,
};

const SP = {
  entrance: { mass: 0.8, damping: 20, stiffness: 200, overshootClamping: false },
  bounce: { mass: 1, damping: 12, stiffness: 180, overshootClamping: false },
  morph: { mass: 1.5, damping: 18, stiffness: 100, overshootClamping: false },
  slide: { mass: 1.2, damping: 22, stiffness: 80, overshootClamping: false },
  collision: { mass: 0.6, damping: 14, stiffness: 250, overshootClamping: false },
  // Blob: SLOWER than before (stiffness 80 vs 120)
  blob: { mass: 1, damping: 16, stiffness: 80, overshootClamping: false },
  camera: { mass: 2, damping: 30, stiffness: 60, overshootClamping: true },
};

interface CamKey { f: number; y: number; s: number }
const CAM: CamKey[] = [
  { f: 0,   y: 400,  s: 1.0 },
  { f: 80,  y: 400,  s: 1.0 },
  { f: 120, y: 480,  s: 1.06 },
  { f: 200, y: 700,  s: 1.0 },
  { f: 280, y: 900,  s: 1.06 },
  { f: 400, y: 900,  s: 1.0 },
  { f: 460, y: 1100, s: 1.0 },
  { f: 530, y: 1300, s: 1.04 },
  { f: 600, y: 1350, s: 1.0 },
  { f: 660, y: 1600, s: 1.0 },
  { f: 730, y: 1800, s: 1.06 },
  { f: 850, y: 1800, s: 1.0 },
  { f: 900, y: 1800, s: 1.0 },
];

function cam(frame: number, prop: "y" | "s"): number {
  if (frame <= CAM[0].f) return CAM[0][prop];
  if (frame >= CAM[CAM.length - 1].f) return CAM[CAM.length - 1][prop];
  for (let i = 0; i < CAM.length - 1; i++) {
    if (frame >= CAM[i].f && frame <= CAM[i + 1].f) {
      const t = (frame - CAM[i].f) / (CAM[i + 1].f - CAM[i].f);
      return CAM[i][prop] + (CAM[i + 1][prop] - CAM[i][prop]) * Easing.bezier(0.4, 0, 0.2, 1)(t);
    }
  }
  return CAM[0][prop];
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

function multiShadow(y: number, blur: number, a: number) {
  return `inset 0 1px 0 rgba(255,255,255,0.08), 0 ${y * 0.3}px ${blur * 0.3}px ${G.shadow(a * 0.4)}, 0 ${y}px ${blur}px ${G.shadow(a * 0.7)}, 0 ${y * 2}px ${blur * 2.5}px ${G.shadow(a * 0.3)}`;
}

function curvePos(t: number, sx: number, sy: number, ex: number, ey: number, curve: number) {
  const cx = (sx + ex) / 2 + curve;
  const cy = (sy + ey) / 2;
  return {
    x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex,
    y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey,
  };
}

// ═══ GOOEY SVG FILTER (metaball effect) ═══
const GooeyFilter: React.FC = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
        <feColorMatrix in="blur" mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

// ═══ FILM GRAIN OVERLAY ═══
const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}>
      <defs>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={frame} stitchTiles="stitch" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#grain)" opacity={0.045} />
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

// ═══ SUNBURST ═══
const Sunburst: React.FC<{ x: number; y: number; at: number; size?: number }> = ({ x, y, at, size = 180 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const f = frame - at;
  const s = spring({ frame: f, fps, config: SP.entrance });
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(-50%, -50%) scale(${interpolate(s, [0, 1], [0.2, 1])}) rotate(${f * 0.15}deg)`,
      opacity: interpolate(s, [0, 0.4], [0, 0.45], { extrapolateRight: "clamp" }),
      width: size, height: size,
    }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1="50" y1="50"
            x2={50 + 42 * Math.cos((i * 36 * Math.PI) / 180)}
            y2={50 + 42 * Math.sin((i * 36 * Math.PI) / 180)}
            stroke={G.coral} strokeWidth="5" strokeLinecap="round" />
        ))}
        <circle cx="50" cy="50" r="14" fill={G.coral} opacity={0.85} />
      </svg>
    </div>
  );
};

// ═══ BLOB WITH PARTICLE TRAIL + NEON GLOW ═══
function blobPath(frame: number, cx: number, cy: number, r: number, w: number = 0.25): string {
  const n = 7, step = (Math.PI * 2) / n;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = step * i - Math.PI / 2;
    const ww = 1 + Math.sin(frame * 0.14 + i * 1.8) * w + Math.sin(frame * 0.09 + i * 3.1) * w * 0.4;
    pts.push({ x: cx + Math.cos(a) * r * ww, y: cy + Math.sin(a) * r * ww });
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const c = pts[i], nx = pts[(i + 1) % n], pv = pts[(i - 1 + n) % n], nn = pts[(i + 2) % n];
    const t = 0.35;
    d += ` C ${c.x + (nx.x - pv.x) * t} ${c.y + (nx.y - pv.y) * t}, ${nx.x - (nn.x - c.x) * t} ${nx.y - (nn.y - c.y) * t}, ${nx.x} ${nx.y}`;
  }
  return d;
}

const BlobTrail: React.FC<{
  id: string;
  startX: number; startY: number;  // BOTTOM EDGE of source element
  endX: number; endY: number;      // CENTER of target element
  progress: number;
  curveAmount?: number;
  blobRadius?: number;
  particleCount?: number;
}> = ({ id, startX, startY, endX, endY, progress, curveAmount = 60, blobRadius = 26, particleCount = 14 }) => {
  const frame = useCurrentFrame();
  if (progress <= 0.01) return null;

  const blob = curvePos(progress, startX, startY, endX, endY, curveAmount);

  const wobble = interpolate(progress, [0, 0.3, 0.7, 1], [0.08, 0.28, 0.28, 0.06], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Scale: shrinks to 0 at end — blob BECOMES the element
  const scale = interpolate(progress, [0, 0.1, 0.5, 0.88, 1], [0.2, 0.9, 1.1, 0.6, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const glow = interpolate(progress, [0, 0.2, 0.5, 0.8, 1], [0, 0.35, 0.55, 0.25, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (scale < 0.02) return null;

  const blobD = blobPath(frame, blob.x, blob.y, blobRadius * scale, wobble);

  // Particles
  const particles: JSX.Element[] = [];
  for (let i = 0; i < particleCount; i++) {
    const dropT = (i / particleCount) * progress;
    if (dropT < 0.02) continue;
    const age = progress - dropT;
    const seed = ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
    const pos = curvePos(dropT, startX, startY, endX, endY, curveAmount);
    const pOp = interpolate(age, [0, 0.3, 0.8], [0.6, 0.25, 0.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pR = interpolate(age, [0, 0.3, 0.8], [4.5, 2.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    particles.push(
      <circle key={i}
        cx={pos.x + (seed - 0.5) * 14} cy={pos.y + (Math.sin(seed * 100) - 0.5) * 10}
        r={pR} fill={G.dark} opacity={pOp}
      />
    );
  }

  const fId = `bg-${id}`;

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 4000, pointerEvents: "none" }}>
      <defs>
        <filter id={fId}>
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {particles}
      {/* Neon glow layers (mint) */}
      <path d={blobD} fill={G.mint} opacity={glow * 0.3} filter={`url(#${fId})`} />
      <path d={blobD} fill={G.mint} opacity={glow * 0.6} filter={`url(#${fId})`}
        style={{ transform: "scale(0.92)", transformOrigin: `${blob.x}px ${blob.y}px`, transformBox: "fill-box" as any }} />
      {/* Blob body */}
      <path d={blobD} fill={G.dark} opacity={0.92} />
      <path d={blobD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
    </svg>
  );
};

// ═══ MORPH ELEMENT ═══
// Grows from blob center INSTANTLY when blob arrives
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

  const shadowY = interpolate(p, [0, 1], [4, 22]);
  const shadowBlur = interpolate(p, [0, 1], [12, 52]);
  const shadowAlpha = interpolate(p, [0, 1], [0.1, 0.22]);

  const pillOpacity = interpolate(p, [0.08, 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contentOpacity = interpolate(p, [0.6, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contentY = interpolate(p, [0.6, 1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      width, height, background: G.dark, borderRadius, overflow: "hidden",
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 ${shadowY * 0.3}px ${shadowBlur * 0.3}px ${G.shadow(shadowAlpha * 0.4)}, 0 ${shadowY}px ${shadowBlur}px ${G.shadow(shadowAlpha * 0.7)}, 0 ${shadowY * 2}px ${shadowBlur * 2.5}px ${G.shadow(shadowAlpha * 0.3)}`,
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
        position: "absolute", inset: 0,
        padding: interpolate(p, [0, 1], [0, 28]),
        opacity: contentOpacity,
        transform: `translateY(${contentY}px)`,
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, background: "rgba(255,255,255,0.1)", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{pillIcon}</div>
        <div style={{
          color: G.white, fontSize: 24, fontWeight: 800,
          fontFamily: '-apple-system, sans-serif', letterSpacing: -0.5,
        }}>{cardTitle}</div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
        {children}
      </div>
    </div>
  );
};

// ═══ PROMPT BAR ═══
const PromptBarShape: React.FC<{
  x: number; y: number; morphProgress: number;
  text: string; frame: number; textStartFrame: number;
}> = ({ x, y, morphProgress, text, frame, textStartFrame }) => {
  const p = morphProgress;
  if (p <= 0) return null;

  const width = interpolate(p, [0, 0.15, 1], [50, 200, 420], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const height = interpolate(p, [0, 0.15, 1], [50, 48, 56], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const borderRadius = interpolate(p, [0, 0.15, 1], [50, 50, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(p, [0, 0.06], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pillOpacity = interpolate(p, [0.08, 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contentOpacity = interpolate(p, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tf = frame - textStartFrame;
  const charCount = tf > 0 ? Math.min(text.length, Math.floor(tf * 0.8)) : 0;
  const showCursor = tf > 0 && frame % 16 < 10;

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      width, height, background: G.dark, borderRadius,
      display: "flex", alignItems: "center",
      boxShadow: multiShadow(8, 24, 0.15), overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: pillOpacity, gap: 8, color: G.white, fontSize: 17, fontWeight: 700,
        fontFamily: '-apple-system, sans-serif',
      }}>
        <span style={{ fontSize: 15 }}>💬</span>Prompt
      </div>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        padding: "0 20px", gap: 12, opacity: contentOpacity,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: G.white, flexShrink: 0,
        }}>+</div>
        <div style={{
          color: "rgba(255,255,255,0.6)", fontSize: 14,
          fontFamily: '-apple-system, sans-serif', fontWeight: 500, flex: 1,
        }}>{text.slice(0, charCount)}{showCursor ? "│" : ""}</div>
        <div style={{
          background: G.mint, color: G.dark, padding: "4px 10px", borderRadius: 8,
          fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: '-apple-system, sans-serif',
        }}>Sonnet 4.6</div>
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
   ═══════════════════════════════════════════ */
export const GregV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card/prompt heights for calculating bottom edges
  const CARD_H = 460;
  const PROMPT_H = 56;

  const T = {
    pillsAppear: 0,
    pillsConverge: 70,
    collisionHit: 105,
    // Blob 1: collision bottom → card center
    blob1Start: 115,
    // Element grows THE SAME FRAME blob arrives (use spring progress)
    featuresAppear: 280,
    // Blob 2: card bottom → prompt center
    blob2Start: 370,
    promptType: 480,
    // Blob 3: prompt bottom → context center
    blob3Start: 530,
    contextFeatures: 680,
  };

  const POS = {
    collision: { x: 540, y: 510 },
    card: { x: 540, y: 920 },
    prompt: { x: 540, y: 1380 },
    context: { x: 540, y: 1830 },
  };

  const pillDefs = [
    { label: "Agents.md", icon: "📄", sx: 320, sy: 420 },
    { label: "Context.md", icon: "📋", sx: 760, sy: 420 },
    { label: "Memory.md", icon: "🧠", sx: 320, sy: 600 },
    { label: "Skills.md", icon: "⚡", sx: 760, sy: 600 },
  ];

  const convergeP = (() => {
    const f = frame - T.pillsConverge;
    return f < 0 ? 0 : f > 50 ? 1 : spring({ frame: f, fps, config: SP.slide });
  })();
  const collisionP = (() => {
    const f = frame - T.collisionHit;
    return f < 0 ? 0 : spring({ frame: f, fps, config: SP.collision });
  })();
  const pillsVisible = frame < T.blob1Start;

  // ═══ BLOB 1: collision center → card CENTER ═══
  // Start: collision center (where pills merged)
  // End: card center
  const blob1P = (() => {
    const f = frame - T.blob1Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: SP.blob });
  })();

  // Card grows when blob progress > 0.88 (blob nearly arrived)
  // This means element appears THE MOMENT blob reaches destination
  const cardMorphP = (() => {
    if (blob1P < 0.88) return 0;
    // Map blob 0.88→1.0 to morph 0→0.15 (initial growth from blob)
    // Then continue with its own spring after
    const earlyP = interpolate(blob1P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // After blob is done, continue morphing with spring
    const f = frame - T.blob1Start - 50; // ~50 frames for blob to reach 0.88
    if (f < 0) return earlyP;
    const springP = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(springP, [0, 1], [0.1, 1]));
  })();

  // ═══ BLOB 2: card BOTTOM → prompt CENTER ═══
  const blob2P = (() => {
    const f = frame - T.blob2Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: SP.blob });
  })();

  const promptMorphP = (() => {
    if (blob2P < 0.88) return 0;
    const earlyP = interpolate(blob2P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.blob2Start - 50;
    if (f < 0) return earlyP;
    const springP = spring({ frame: f, fps, config: { mass: 1, damping: 18, stiffness: 150, overshootClamping: false } });
    return Math.max(earlyP, interpolate(springP, [0, 1], [0.1, 1]));
  })();

  // ═══ BLOB 3: prompt BOTTOM → context CENTER ═══
  const blob3P = (() => {
    const f = frame - T.blob3Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: SP.blob });
  })();

  const contextMorphP = (() => {
    if (blob3P < 0.88) return 0;
    const earlyP = interpolate(blob3P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.blob3Start - 50;
    if (f < 0) return earlyP;
    const springP = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(springP, [0, 1], [0.1, 1]));
  })();

  const agentFeatures = [
    { label: "What you do", icon: "🎯" },
    { label: "How you sound", icon: "🗣" },
    { label: "How you work", icon: "⚙️" },
  ];
  const contextFeatures = [
    { label: "Brand details", icon: "🏷" },
    { label: "Ideal customer", icon: "👤" },
    { label: "Decision factors", icon: "⚖️" },
    { label: "Buying triggers", icon: "🎯" },
  ];

  const camY = cam(frame, "y");
  const camS = cam(frame, "s");

  return (
    <AbsoluteFill style={{ background: G.bg, overflow: "hidden" }}>
      {/* Global SVG filters */}
      <GooeyFilter />

      <div style={{
        position: "absolute", width: 1080, height: 4000,
        transform: `translateY(${960 - camY}px) scale(${camS})`,
        transformOrigin: `540px ${camY}px`,
      }}>
        <DotGrid />
        <Sunburst x={540} y={510} at={5} size={200} />
        <Sunburst x={540} y={POS.context.y} at={T.blob3Start - 10} size={160} />

        {/* ═══ PILLS → COLLISION (with gooey filter!) ═══ */}
        <div style={{ filter: pillsVisible && convergeP > 0.5 ? "url(#goo)" : "none" }}>
          {pillsVisible && pillDefs.map((pill, i) => {
            const ent = layeredEntrance(frame, T.pillsAppear + i * 8, fps);
            const cx = interpolate(convergeP, [0, 1], [pill.sx, POS.collision.x]);
            const cy = interpolate(convergeP, [0, 1], [pill.sy, POS.collision.y]);
            const cS = interpolate(collisionP, [0, 0.5, 1], [1, 0.6, 0.3], { extrapolateRight: "clamp" });
            const cR = interpolate(collisionP, [0, 1], [0, i % 2 === 0 ? 8 : -8], { extrapolateRight: "clamp" });
            const cO = interpolate(collisionP, [0.3, 0.8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const fS = ent.scale * (frame >= T.collisionHit ? cS : interpolate(convergeP, [0.7, 1], [1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

            return (
              <div key={i} style={{
                position: "absolute", left: cx, top: cy + ent.y,
                transform: `translate(-50%, -50%) scale(${fS}) rotate(${frame >= T.collisionHit ? cR : 0}deg)`,
                opacity: ent.opacity * (frame >= T.collisionHit ? cO : 1),
                background: G.dark, color: G.white,
                padding: "14px 28px", borderRadius: 50,
                fontSize: 19, fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: multiShadow(8, 24, 0.15),
                whiteSpace: "nowrap" as const, letterSpacing: -0.3, zIndex: 10 - i,
              }}>
                <span style={{ fontSize: 17 }}>{pill.icon}</span>{pill.label}
              </div>
            );
          })}
        </div>

        {/* ═══ BLOB 1: Collision → Card ═══ */}
        {/* Start: collision center, End: card center */}
        {frame >= T.blob1Start && blob1P < 0.99 && (
          <BlobTrail id="1"
            startX={POS.collision.x} startY={POS.collision.y + 25}
            endX={POS.card.x} endY={POS.card.y}
            progress={blob1P} curveAmount={70} blobRadius={30} particleCount={16}
          />
        )}

        {/* ═══ AGENTS CARD ═══ */}
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

        {/* ═══ BLOB 2: Card BOTTOM → Prompt CENTER ═══ */}
        {frame >= T.blob2Start && blob2P < 0.99 && (
          <BlobTrail id="2"
            startX={POS.card.x} startY={POS.card.y + CARD_H / 2}
            endX={POS.prompt.x} endY={POS.prompt.y}
            progress={blob2P} curveAmount={-55} blobRadius={24} particleCount={12}
          />
        )}

        {/* ═══ PROMPT BAR ═══ */}
        {promptMorphP > 0 && (
          <PromptBarShape
            x={POS.prompt.x} y={POS.prompt.y}
            morphProgress={promptMorphP}
            text="Write a LinkedIn post about AI..."
            frame={frame} textStartFrame={T.promptType}
          />
        )}

        {/* ═══ BLOB 3: Prompt BOTTOM → Context CENTER ═══ */}
        {frame >= T.blob3Start && blob3P < 0.99 && (
          <BlobTrail id="3"
            startX={POS.prompt.x} startY={POS.prompt.y + PROMPT_H / 2}
            endX={POS.context.x} endY={POS.context.y}
            progress={blob3P} curveAmount={65} blobRadius={26} particleCount={14}
          />
        )}

        {/* ═══ CONTEXT CARD ═══ */}
        {contextMorphP > 0 && (
          <MorphElement
            x={POS.context.x} y={POS.context.y}
            morphProgress={contextMorphP}
            pillLabel="Context.md" pillIcon="📋" cardTitle="Context.md"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {contextFeatures.map((feat, i) => {
                const a = layeredEntrance(frame, T.contextFeatures + i * 12, fps);
                return <FeaturePill key={i} label={feat.label} icon={feat.icon} opacity={a.opacity} scale={a.scale} y={a.y} />;
              })}
            </div>
          </MorphElement>
        )}
      </div>

      {/* Film grain overlay (on top of everything) */}
      <GrainOverlay />
    </AbsoluteFill>
  );
};
