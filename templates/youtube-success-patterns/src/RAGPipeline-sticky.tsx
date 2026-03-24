import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import React from "react";

/*
=== RAG PIPELINE - StickyNote Structure ===
Testing hierarchical layout with StickyNote wrappers

Transcript analysis:
- "A user sends a query... embedding... vector database" → Part of RETRIEVE
- "step one, retrieve" → StickyNote 1
- "step two, augment" → StickyNote 2
- "step three, generate" → StickyNote 3

TIMESTAMPS:
- Step 1 trigger: "step one" @ frame 531
- Step 2 trigger: "step two" @ frame 715
- Step 3 trigger: "step three" @ frame 974

Total: 1310 frames = 43.65 sec @ 30fps
*/

const colors = {
  bg: "#030305",
  bgGradient1: "#080810",

  step1: {
    border: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)",
    bg: "linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%)",
    accent: "#c084fc",
  },
  step2: {
    border: "#f97316",
    glow: "rgba(249, 115, 22, 0.4)",
    bg: "linear-gradient(145deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)",
    accent: "#fb923c",
  },
  step3: {
    border: "#22c55e",
    glow: "rgba(34, 197, 94, 0.4)",
    bg: "linear-gradient(145deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)",
    accent: "#4ade80",
  },

  // For SectionBoxes inside StickyNotes
  sectionBlue: {
    bg: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
    border: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.3)",
    accent: "#60a5fa",
  },
  sectionTeal: {
    bg: "linear-gradient(145deg, #0f3d3d 0%, #082828 50%, #051a1a 100%)",
    border: "#14b8a6",
    glow: "rgba(20, 184, 166, 0.3)",
    accent: "#2dd4bf",
  },

  text: "#f8fafc",
  textMuted: "#94a3b8",
  textAccent: "#e2e8f0",
  line: "#60a5fa",
};

const glassStyle = (borderColor: string, glowColor: string): React.CSSProperties => ({
  backdropFilter: "blur(12px) saturate(150%)",
  WebkitBackdropFilter: "blur(12px) saturate(150%)",
  border: `1px solid ${borderColor}30`,
  boxShadow: `
    0 0 40px ${glowColor},
    0 4px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.06)
  `,
  borderRadius: 16,
});

// ========== ICONS ==========
const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 24, color = "#fff" }) => {
  const iconStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 8px ${color}50)`,
  };

  const icons: Record<string, JSX.Element> = {
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    cube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    file: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
        <path d="M14 2v6h6"/>
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    merge: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <circle cx="18" cy="18" r="3"/>
        <circle cx="6" cy="6" r="3"/>
        <path d="M6 21V9a9 9 0 009 9"/>
      </svg>
    ),
    terminal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M4 17l6-5-6-5"/>
        <path d="M12 19h8"/>
      </svg>
    ),
    cpu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <rect x="9" y="9" width="6" height="6"/>
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>
      </svg>
    ),
    sparkle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636"/>
      </svg>
    ),
  };
  return icons[type] || <div style={{ width: size, height: size }} />;
};

// ========== STICKY NOTE (Wrapper) ==========
const StickyNote: React.FC<{
  step: number;
  title: string;
  colorScheme: { border: string; glow: string; bg: string; accent: string };
  opacity: number;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
  children: React.ReactNode;
}> = ({ step, title, colorScheme, opacity, scale, x, y, width, height, children }) => (
  <div style={{
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    opacity,
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }}>
    {/* Step badge - floating above */}
    <div style={{
      position: "absolute",
      top: -28,
      left: 28,
      background: `linear-gradient(135deg, ${colorScheme.border} 0%, ${colorScheme.accent} 100%)`,
      padding: "10px 28px",
      borderRadius: "14px 14px 4px 4px",
      fontSize: 14,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: 2,
      textTransform: "uppercase",
      boxShadow: `0 -4px 30px ${colorScheme.glow}, 0 4px 20px rgba(0,0,0,0.5)`,
      fontFamily: "'SF Mono', 'Fira Code', monospace",
    }}>
      Step {step}: {title}
    </div>

    {/* Main container */}
    <div style={{
      width: "100%",
      height: "100%",
      border: `2px dashed ${colorScheme.border}60`,
      borderRadius: 24,
      padding: 28,
      background: colorScheme.bg,
      backdropFilter: "blur(8px)",
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      alignContent: "flex-start",
      justifyContent: "center",
      boxShadow: `inset 0 0 60px ${colorScheme.glow}20`,
    }}>
      {children}
    </div>
  </div>
);

// ========== SECTION BOX (Inside StickyNote) ==========
const SectionBox: React.FC<{
  title: string;
  colorScheme: { bg: string; border: string; glow: string; accent: string };
  children: React.ReactNode;
  opacity: number;
  scale: number;
  width?: number;
}> = ({ title, colorScheme, children, opacity, scale, width = 200 }) => (
  <div
    style={{
      width,
      background: colorScheme.bg,
      ...glassStyle(colorScheme.border, colorScheme.glow),
      padding: 16,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: colorScheme.accent,
        boxShadow: `0 0 12px ${colorScheme.glow}`,
      }}/>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: colorScheme.accent,
        textTransform: "uppercase",
        letterSpacing: 2,
        fontFamily: "'SF Mono', monospace",
      }}>
        {title}
      </div>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
      {children}
    </div>
  </div>
);

// ========== NODE ITEM ==========
const NodeItem: React.FC<{
  label: string;
  icon?: string;
  opacity: number;
  accentColor?: string;
  frame: number;
  delay?: number;
}> = ({ label, icon, opacity, accentColor = "#fff", frame, delay = 0 }) => {
  const { fps } = useVideoConfig();
  const scaleSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 150 },
  });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      opacity,
      transform: `scale(${Math.min(scaleSpring, 1)})`,
      width: 70,
    }}>
      <div style={{
        width: 48,
        height: 48,
        background: `linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)`,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 20px ${accentColor}10`,
      }}>
        {icon && <Icon type={icon} size={22} color={accentColor} />}
      </div>
      <span style={{
        fontSize: 10,
        textAlign: "center",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 500,
        color: colors.textAccent,
      }}>
        {label}
      </span>
    </div>
  );
};

// ========== ANIMATED LINE ==========
const AnimatedLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  progress: number; color?: string; frame: number;
}> = ({ x1, y1, x2, y2, progress, color = colors.line, frame }) => {
  const endX = x1 + (x2 - x1) * progress;
  const endY = y1 + (y2 - y1) * progress;

  return (
    <g>
      <line x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={6} strokeOpacity={0.2}
        strokeLinecap="round" filter="blur(4px)"/>
      <line x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={2} strokeLinecap="round"/>
      {progress > 0.9 && (
        <circle cx={endX} cy={endY} r={4} fill={color} filter="url(#glow)" />
      )}
    </g>
  );
};

// ========== BACKGROUNDS ==========
const MeshGradient: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.4 }}>
    <defs>
      <radialGradient id="mesh1" cx="20%" cy="30%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
      <radialGradient id="mesh2" cx="50%" cy="60%">
        <stop offset="0%" stopColor="#f97316" stopOpacity="0.08"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
      <radialGradient id="mesh3" cx="80%" cy="40%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
    </defs>
    <ellipse cx="20%" cy="30%" rx="35%" ry="30%" fill="url(#mesh1)"/>
    <ellipse cx="50%" cy="60%" rx="40%" ry="35%" fill="url(#mesh2)"/>
    <ellipse cx="80%" cy="40%" rx="35%" ry="30%" fill="url(#mesh3)"/>
  </svg>
);

const GridBackground: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.06 }}>
    <defs>
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#a855f7" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>
  </svg>
);

// ========== MAIN COMPONENT ==========
export const RAGPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const canvasWidth = 2400;
  const canvasHeight = 900;
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // Layout: 3 StickyNotes horizontally
  const stickyWidth = 520;
  const stickyHeight = 380;
  const stickyGap = 80;
  const stickyY = 200;

  const sticky1X = 100;
  const sticky2X = sticky1X + stickyWidth + stickyGap;
  const sticky3X = sticky2X + stickyWidth + stickyGap;

  // Camera keyframes - move between StickyNotes
  const cameraKeyframes = [
    { frame: 0, x: 500, y: 400, scale: 0.85 },     // Overview
    { frame: 516, x: 360, y: 400, scale: 1.0 },    // Step 1 (word @ 531)
    { frame: 700, x: 960, y: 400, scale: 1.0 },    // Step 2 (word @ 715)
    { frame: 959, x: 1560, y: 400, scale: 1.0 },   // Step 3 (word @ 974)
  ];

  const getCameraValue = (prop: "x" | "y" | "scale") => {
    for (let i = 0; i < cameraKeyframes.length - 1; i++) {
      const current = cameraKeyframes[i];
      const next = cameraKeyframes[i + 1];
      if (frame >= current.frame && frame < next.frame) {
        const springValue = spring({
          frame: frame - current.frame,
          fps,
          config: { damping: 22, stiffness: 90 },
          durationInFrames: 45,
        });
        return current[prop] + (next[prop] - current[prop]) * Math.min(springValue, 1);
      }
    }
    return cameraKeyframes[cameraKeyframes.length - 1][prop];
  };

  const cameraX = getCameraValue("x") + Math.sin(frame * 0.04) * 4;
  const cameraY = getCameraValue("y") + Math.cos(frame * 0.03) * 2;
  const cameraScale = getCameraValue("scale");

  const getOpacity = (startFrame: number, duration = 8) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
    });

  const getScale = (startFrame: number, duration = 10) =>
    interpolate(frame, [startFrame, startFrame + duration], [0.85, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.2)),
    });

  const getLineProgress = (startFrame: number, duration = 15) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic),
    });

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse 120% 100% at 50% 0%, ${colors.bgGradient1} 0%, ${colors.bg} 50%, #000 100%)`,
      overflow: "hidden",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <MeshGradient />
      <GridBackground />

      <div style={{
        width: canvasWidth,
        height: canvasHeight,
        position: "absolute",
        left: viewportWidth / 2,
        top: viewportHeight / 2,
        transform: `scale(${cameraScale}) translate(${-cameraX}px, ${-cameraY}px)`,
        transformOrigin: "0 0",
      }}>
        {/* Connection lines between StickyNotes */}
        <svg style={{ position: "absolute", width: canvasWidth, height: canvasHeight, pointerEvents: "none" }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Step 1 → Step 2 */}
          <AnimatedLine
            x1={sticky1X + stickyWidth} y1={stickyY + stickyHeight/2}
            x2={sticky2X} y2={stickyY + stickyHeight/2}
            progress={getLineProgress(710)}
            color={colors.step1.accent}
            frame={frame}
          />
          {/* Step 2 → Step 3 */}
          <AnimatedLine
            x1={sticky2X + stickyWidth} y1={stickyY + stickyHeight/2}
            x2={sticky3X} y2={stickyY + stickyHeight/2}
            progress={getLineProgress(970)}
            color={colors.step2.accent}
            frame={frame}
          />
        </svg>

        {/* ========== STEP 1: RETRIEVE ========== */}
        <StickyNote
          step={1}
          title="Retrieve"
          colorScheme={colors.step1}
          x={sticky1X}
          y={stickyY}
          width={stickyWidth}
          height={stickyHeight}
          opacity={getOpacity(520)}
          scale={getScale(520)}
        >
          <SectionBox title="Input" colorScheme={colors.sectionBlue} opacity={getOpacity(535)} scale={getScale(535)}>
            <NodeItem label="Query" icon="search" opacity={getOpacity(545)} accentColor={colors.sectionBlue.accent} frame={frame} delay={545} />
            <NodeItem label="Embed" icon="cube" opacity={getOpacity(555)} accentColor={colors.sectionBlue.accent} frame={frame} delay={555} />
          </SectionBox>
          <SectionBox title="Search" colorScheme={colors.sectionTeal} opacity={getOpacity(565)} scale={getScale(565)}>
            <NodeItem label="Vector DB" icon="database" opacity={getOpacity(575)} accentColor={colors.sectionTeal.accent} frame={frame} delay={575} />
            <NodeItem label="Chunks" icon="file" opacity={getOpacity(585)} accentColor={colors.sectionTeal.accent} frame={frame} delay={585} />
            <NodeItem label="Context" icon="layers" opacity={getOpacity(595)} accentColor={colors.sectionTeal.accent} frame={frame} delay={595} />
          </SectionBox>
        </StickyNote>

        {/* ========== STEP 2: AUGMENT ========== */}
        <StickyNote
          step={2}
          title="Augment"
          colorScheme={colors.step2}
          x={sticky2X}
          y={stickyY}
          width={stickyWidth}
          height={stickyHeight}
          opacity={getOpacity(705)}
          scale={getScale(705)}
        >
          <SectionBox title="Combine" colorScheme={colors.sectionBlue} opacity={getOpacity(720)} scale={getScale(720)} width={420}>
            <NodeItem label="Context" icon="layers" opacity={getOpacity(730)} accentColor={colors.sectionBlue.accent} frame={frame} delay={730} />
            <NodeItem label="Query" icon="terminal" opacity={getOpacity(740)} accentColor={colors.sectionBlue.accent} frame={frame} delay={740} />
            <NodeItem label="Merge" icon="merge" opacity={getOpacity(750)} accentColor={colors.sectionBlue.accent} frame={frame} delay={750} />
            <NodeItem label="Prompt" icon="file" opacity={getOpacity(760)} accentColor={colors.sectionBlue.accent} frame={frame} delay={760} />
          </SectionBox>
        </StickyNote>

        {/* ========== STEP 3: GENERATE ========== */}
        <StickyNote
          step={3}
          title="Generate"
          colorScheme={colors.step3}
          x={sticky3X}
          y={stickyY}
          width={stickyWidth}
          height={stickyHeight}
          opacity={getOpacity(965)}
          scale={getScale(965)}
        >
          <SectionBox title="LLM" colorScheme={colors.sectionBlue} opacity={getOpacity(980)} scale={getScale(980)} width={420}>
            <NodeItem label="Prompt" icon="terminal" opacity={getOpacity(990)} accentColor={colors.sectionBlue.accent} frame={frame} delay={990} />
            <NodeItem label="Process" icon="cpu" opacity={getOpacity(1000)} accentColor={colors.sectionBlue.accent} frame={frame} delay={1000} />
            <NodeItem label="Response" icon="sparkle" opacity={getOpacity(1010)} accentColor={colors.sectionBlue.accent} frame={frame} delay={1010} />
          </SectionBox>
        </StickyNote>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute",
        top: 50,
        left: 70,
        opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontSize: 40,
          fontWeight: 800,
          background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -1,
        }}>
          RAG Pipeline
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, marginTop: 10, letterSpacing: 1 }}>
          Retrieve → Augment → Generate
        </div>
      </div>

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none",
      }}/>

      {/* VOICEOVER */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* SOUND EFFECTS */}
      <Sequence from={0} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.15} />
      </Sequence>

      <Sequence from={514} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      <Sequence from={698} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      <Sequence from={957} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

    </AbsoluteFill>
  );
};
