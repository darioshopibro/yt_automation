import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  random,
} from "remotion";

/* ═══════════════════════════════════════════════════════════════
   PARTICLE SWARM TRANSITION TEST

   Same structure as GregV2 blob — but instead of one solid blob,
   a CLOUD OF PARTICLES travels along the bezier curve.

   Phases:
   1. Particles SPAWN at source bottom edge (dissolve from element)
   2. Particle cloud TRAVELS along curve
   3. Particles CONVERGE at destination center
   4. Target element grows from that center (zero delay)

   Uses SVG circles (60 particles @ 2ms/frame, proven in benchmarks).
   All randomness via Remotion random() — seeded, deterministic.
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
  swarm: { mass: 1, damping: 16, stiffness: 80, overshootClamping: false },
};

// Bezier curve position
function curvePos(t: number, sx: number, sy: number, ex: number, ey: number, curve: number) {
  const cx = (sx + ex) / 2 + curve;
  const cy = (sy + ey) / 2;
  return {
    x: (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * ex,
    y: (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ey,
  };
}

function multiShadow(y: number, blur: number, a: number) {
  return `inset 0 1px 0 rgba(255,255,255,0.08), 0 ${y * 0.3}px ${blur * 0.3}px ${G.shadow(a * 0.4)}, 0 ${y}px ${blur}px ${G.shadow(a * 0.7)}, 0 ${y * 2}px ${blur * 2.5}px ${G.shadow(a * 0.3)}`;
}

// ═══ PARTICLE SWARM TRANSITION ═══
const ParticleSwarm: React.FC<{
  id: string;
  startX: number; startY: number;  // bottom edge of source
  endX: number; endY: number;      // center of target
  progress: number;                 // 0→1
  curveAmount?: number;
  particleCount?: number;
  cloudRadius?: number;
}> = ({
  id, startX, startY, endX, endY, progress,
  curveAmount = 60, particleCount = 60, cloudRadius = 22,
}) => {
  const frame = useCurrentFrame();
  if (progress <= 0.01) return null;

  // Center of mass on bezier
  const center = curvePos(progress, startX, startY, endX, endY, curveAmount);

  // Converge: cloud shrinks to a point when arriving (0.82→1.0)
  const converge = progress < 0.82 ? 1 : interpolate(progress, [0.82, 0.98], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Cloud overall scale: small at start, full mid-travel, small at end
  const cloudScale = interpolate(progress, [0, 0.12, 0.5, 0.85, 1], [0.3, 1, 1.1, 0.8, 0.2], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const particles: JSX.Element[] = [];

  for (let i = 0; i < particleCount; i++) {
    // Spawn stagger: particles appear one by one over first 20% of progress
    const spawnDelay = (i / particleCount) * 0.15;
    const spawnP = interpolate(progress, [spawnDelay, spawnDelay + 0.08], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    if (spawnP <= 0) continue;

    // Cloud offset (fixed per particle — seeded)
    const angle = random(`a-${id}-${i}`) * Math.PI * 2;
    const dist = random(`d-${id}-${i}`) * cloudRadius;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    // Individual wobble (animated per frame)
    const freqX = 0.08 + random(`fx-${id}-${i}`) * 0.06;
    const freqY = 0.09 + random(`fy-${id}-${i}`) * 0.07;
    const ampX = 3 + random(`ax-${id}-${i}`) * 5;
    const ampY = 3 + random(`ay-${id}-${i}`) * 5;
    const phaseX = random(`px-${id}-${i}`) * Math.PI * 2;
    const phaseY = random(`py-${id}-${i}`) * Math.PI * 2;
    const wx = Math.sin(frame * freqX + phaseX) * ampX;
    const wy = Math.sin(frame * freqY + phaseY) * ampY;

    // Final position
    const x = center.x + (dx + wx) * converge * cloudScale;
    const y = center.y + (dy + wy) * converge * cloudScale;

    // Size: varied per particle (2-5px), scaled by spawn
    const baseSize = 1.5 + random(`s-${id}-${i}`) * 3.5;
    const size = baseSize * spawnP * Math.max(0.3, cloudScale);

    // Opacity: varied, fades during converge
    const baseOpacity = 0.4 + random(`o-${id}-${i}`) * 0.55;
    const opacity = baseOpacity * spawnP * Math.max(0.2, converge);

    // Color: mix of dark and mint
    const isMint = random(`c-${id}-${i}`) > 0.6;

    particles.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={size}
        fill={isMint ? G.mint : G.dark}
        opacity={opacity}
      />
    );
  }

  // Glow: radial gradient at center during mid-travel
  const glowOpacity = interpolate(progress, [0.1, 0.3, 0.7, 0.95], [0, 0.25, 0.25, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const filterId = `swarm-glow-${id}`;

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id={`rg-${id}`}>
          <stop offset="0%" stopColor={G.mint} stopOpacity="0.4" />
          <stop offset="100%" stopColor={G.mint} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow behind cloud */}
      <circle cx={center.x} cy={center.y} r={35 * cloudScale} fill={`url(#rg-${id})`} opacity={glowOpacity} />

      {/* Particles */}
      <g filter={converge < 0.5 ? `url(#${filterId})` : undefined}>
        {particles}
      </g>
    </svg>
  );
};

// ═══ FILM GRAIN ═══
const GrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}>
      <defs>
        <filter id="grain-ps">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={frame} stitchTiles="stitch" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#grain-ps)" opacity={0.04} />
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

// ═══ MORPH ELEMENT (same as GregV2 — grows from blob/swarm center) ═══
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

/* ═══════════════════════════════════════════
   MAIN COMPOSITION — same structure as GregV2
   but with ParticleSwarm instead of Blob
   ═══════════════════════════════════════════ */
export const ParticleSwarmTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD_H = 460;
  const PROMPT_H = 56;

  const T = {
    // Source element appears
    sourceAppear: 0,
    // Swarm 1: source → card
    swarm1Start: 40,
    featuresAppear: 180,
    // Swarm 2: card → target
    swarm2Start: 280,
    targetFeatures: 420,
  };

  const POS = {
    source: { x: 540, y: 400 },
    card: { x: 540, y: 920 },
    target: { x: 540, y: 1500 },
  };

  // ═══ SWARM 1 ═══
  const swarm1P = (() => {
    const f = frame - T.swarm1Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: SP.swarm });
  })();

  const cardMorphP = (() => {
    if (swarm1P < 0.88) return 0;
    const earlyP = interpolate(swarm1P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.swarm1Start - 50;
    if (f < 0) return earlyP;
    const sp = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(sp, [0, 1], [0.1, 1]));
  })();

  // ═══ SWARM 2 ═══
  const swarm2P = (() => {
    const f = frame - T.swarm2Start;
    return f < 0 ? 0 : spring({ frame: f, fps, config: SP.swarm });
  })();

  const targetMorphP = (() => {
    if (swarm2P < 0.88) return 0;
    const earlyP = interpolate(swarm2P, [0.88, 1], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const f = frame - T.swarm2Start - 50;
    if (f < 0) return earlyP;
    const sp = spring({ frame: f, fps, config: SP.morph });
    return Math.max(earlyP, interpolate(sp, [0, 1], [0.1, 1]));
  })();

  // Source: visible until swarm starts, then fades
  const sourceOpacity = frame < T.swarm1Start ? 1 :
    interpolate(swarm1P, [0, 0.15], [1, 0], { extrapolateRight: "clamp" });

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
          transform: "translate(-50%, -50%)",
          opacity: sourceOpacity,
          background: G.dark, color: G.white,
          padding: "16px 32px", borderRadius: 50,
          fontSize: 21, fontWeight: 700, fontFamily: '-apple-system, sans-serif',
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: multiShadow(10, 28, 0.18),
        }}>
          <span style={{ fontSize: 18 }}>📄</span>Agents.md
        </div>

        {/* Swarm 1: source bottom → card center */}
        {frame >= T.swarm1Start && swarm1P < 0.99 && (
          <ParticleSwarm
            id="s1"
            startX={POS.source.x} startY={POS.source.y + 25}
            endX={POS.card.x} endY={POS.card.y}
            progress={swarm1P}
            curveAmount={65}
            particleCount={60}
            cloudRadius={22}
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

        {/* Swarm 2: card bottom → target center */}
        {frame >= T.swarm2Start && swarm2P < 0.99 && (
          <ParticleSwarm
            id="s2"
            startX={POS.card.x} startY={POS.card.y + CARD_H / 2}
            endX={POS.target.x} endY={POS.target.y}
            progress={swarm2P}
            curveAmount={-55}
            particleCount={60}
            cloudRadius={22}
          />
        )}

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
