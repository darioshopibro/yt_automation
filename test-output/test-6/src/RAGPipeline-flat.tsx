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
=== RAG PIPELINE - FLAT 6-Section Structure ===
Synced to ElevenLabs voiceover timestamps

SECTION TIMESTAMPS (word frame / camera / section appear):
1. USER_QUERY:    142 / 127 / 137  - "A user sends a query"
2. EMBEDDING:     238 / 223 / 233  - "converted into an embedding"
3. VECTOR_SEARCH: 403 / 388 / 398  - "search your vector database"
4. RETRIEVE:      531 / 516 / 526  - "step one, retrieve"
5. AUGMENT:       715 / 700 / 710  - "step two, argument"
6. GENERATE:      974 / 959 / 969  - "step three, generate"

Total: 1310 frames = 43.65 sec @ 30fps
*/

const colors = {
  bg: "#030305",
  bgGradient1: "#080810",
  bgGradient2: "#050508",

  userQuery: {
    bg: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
    border: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.4)",
    accent: "#60a5fa",
  },
  embedding: {
    bg: "linear-gradient(145deg, #0f3d3d 0%, #082828 50%, #051a1a 100%)",
    border: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
    accent: "#34d399",
  },
  vectorSearch: {
    bg: "linear-gradient(145deg, #3d2a0f 0%, #2d1b08 50%, #1a1005 100%)",
    border: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
    accent: "#fbbf24",
  },
  retrieve: {
    bg: "linear-gradient(145deg, #3d1a3d 0%, #2d1b3d 50%, #1a0f1a 100%)",
    border: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)",
    accent: "#c084fc",
  },
  augment: {
    bg: "linear-gradient(145deg, #2d1a0f 0%, #3d2d1b 50%, #1a1005 100%)",
    border: "#f97316",
    glow: "rgba(249, 115, 22, 0.4)",
    accent: "#fb923c",
  },
  generate: {
    bg: "linear-gradient(145deg, #1a2d1a 0%, #0f3d0f 50%, #051a05 100%)",
    border: "#22c55e",
    glow: "rgba(34, 197, 94, 0.4)",
    accent: "#4ade80",
  },

  text: "#f8fafc",
  textMuted: "#94a3b8",
  textAccent: "#e2e8f0",
  line: "#60a5fa",
};

const glassStyle = (borderColor: string, glowColor: string): React.CSSProperties => ({
  backdropFilter: "blur(16px) saturate(180%)",
  WebkitBackdropFilter: "blur(16px) saturate(180%)",
  border: `1.5px solid ${borderColor}40`,
  boxShadow: `
    0 0 60px ${glowColor},
    0 0 100px ${glowColor}50,
    0 8px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
  `,
  borderRadius: 20,
});

const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 28, color = "#fff" }) => {
  const iconStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 10px ${color}60) drop-shadow(0 0 20px ${color}30)`,
  };

  const icons: Record<string, JSX.Element> = {
    user: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
    terminal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={iconStyle}>
        <path d="M4 17l6-5-6-5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 19h8" strokeLinecap="round"/>
      </svg>
    ),
    cube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
      </svg>
    ),
    vector: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    file: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
        <path d="M14 2v6h6"/>
        <path d="M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={iconStyle}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    merge: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M6 3v12"/>
        <path d="M18 9a3 3 0 100-6 3 3 0 000 6z"/>
        <path d="M6 21a3 3 0 100-6 3 3 0 000 6z"/>
        <path d="M15 6c-6.627 0-12 5.373-12 12"/>
      </svg>
    ),
    sparkle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M12 3v18"/>
        <path d="M3 12h18"/>
        <path d="M5.636 5.636l12.728 12.728"/>
        <path d="M5.636 18.364L18.364 5.636"/>
      </svg>
    ),
    cpu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <rect x="9" y="9" width="6" height="6"/>
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>
      </svg>
    ),
  };
  return icons[type] || <div style={{ width: size, height: size }} />;
};

const SectionBox: React.FC<{
  title: string;
  subtitle?: string;
  colorScheme: { bg: string; border: string; glow: string; accent: string };
  children: React.ReactNode;
  opacity: number;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ title, subtitle, colorScheme, children, opacity, scale, x, y, width, height }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      background: colorScheme.bg,
      ...glassStyle(colorScheme.border, colorScheme.glow),
      padding: 24,
      opacity,
      display: "flex",
      flexDirection: "column",
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    }}
  >
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: 40,
      height: 40,
      borderTop: `2px solid ${colorScheme.accent}`,
      borderLeft: `2px solid ${colorScheme.accent}`,
      borderTopLeftRadius: 20,
      opacity: 0.6,
    }}/>
    <div style={{
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 40,
      height: 40,
      borderBottom: `2px solid ${colorScheme.accent}`,
      borderRight: `2px solid ${colorScheme.accent}`,
      borderBottomRightRadius: 20,
      opacity: 0.6,
    }}/>

    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 8 : 20 }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${colorScheme.accent} 0%, ${colorScheme.border} 100%)`,
        boxShadow: `0 0 15px ${colorScheme.glow}, 0 0 30px ${colorScheme.glow}50`,
      }}/>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        color: colorScheme.accent,
        textTransform: "uppercase",
        letterSpacing: 3,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
      }}>
        {title}
      </div>
      <div style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(90deg, ${colorScheme.border}40 0%, transparent 100%)`,
        marginLeft: 10,
      }}/>
    </div>

    {subtitle && (
      <div style={{
        fontSize: 11,
        color: colors.textMuted,
        marginBottom: 16,
        fontFamily: "'SF Mono', monospace",
      }}>
        {subtitle}
      </div>
    )}

    <div style={{
      flex: 1,
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      justifyContent: "center",
      alignItems: "flex-start",
      alignContent: "flex-start",
    }}>
      {children}
    </div>
  </div>
);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity,
        color: colors.text,
        transform: `scale(${Math.min(scaleSpring, 1)}) translateY(${(1 - opacity) * 15}px)`,
        width: 85,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          background: `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)`,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid rgba(255,255,255,0.1)`,
          boxShadow: `
            0 4px 24px rgba(0,0,0,0.4),
            0 0 40px ${accentColor}15,
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute",
          top: 0,
          left: -60,
          width: 60,
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          transform: `translateX(${(frame * 2) % 180}px)`,
        }}/>
        {icon && <Icon type={icon} size={28} color={accentColor} />}
      </div>
      <span style={{
        fontSize: 11,
        textAlign: "center",
        maxWidth: 75,
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontWeight: 500,
        color: colors.textAccent,
        letterSpacing: 0.3,
      }}>
        {label}
      </span>
    </div>
  );
};

const AnimatedLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color?: string;
  frame: number;
}> = ({ x1, y1, x2, y2, progress, color = colors.line, frame }) => {
  const endX = x1 + (x2 - x1) * progress;
  const endY = y1 + (y2 - y1) * progress;
  const pulseOffset = (frame % 60) / 60;

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={8} strokeOpacity={0.2}
        strokeLinecap="round" filter="blur(6px)"
      />
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={4} strokeOpacity={0.4}
        strokeLinecap="round" filter="blur(2px)"
      />
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={2} strokeLinecap="round"
      />
      {progress > 0.1 && (
        <circle
          cx={x1 + (endX - x1) * pulseOffset}
          cy={y1 + (endY - y1) * pulseOffset}
          r={3} fill={color} opacity={0.8}
        />
      )}
      {progress > 0.95 && (
        <circle cx={endX} cy={endY} r={5} fill={color} filter="url(#glow)" />
      )}
    </g>
  );
};

const MeshGradient: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.5 }}>
    <defs>
      <radialGradient id="mesh1" cx="20%" cy="30%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
      <radialGradient id="mesh2" cx="50%" cy="60%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
      <radialGradient id="mesh3" cx="80%" cy="40%">
        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.08"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
    </defs>
    <ellipse cx="20%" cy="30%" rx="35%" ry="30%" fill="url(#mesh1)"/>
    <ellipse cx="50%" cy="60%" rx="40%" ry="35%" fill="url(#mesh2)"/>
    <ellipse cx="80%" cy="40%" rx="35%" ry="30%" fill="url(#mesh3)"/>
  </svg>
);

const GridBackground: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.08 }}>
    <defs>
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
      </pattern>
      <radialGradient id="gridFade" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="white" stopOpacity="1"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </radialGradient>
      <mask id="gridMask">
        <rect width="100%" height="100%" fill="url(#gridFade)"/>
      </mask>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)"/>
  </svg>
);

export const RAGPipelineFlat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const canvasWidth = 4200;
  const canvasHeight = 1500;
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // Camera keyframes - synced to voiceover timestamps
  // Camera moves 15 frames BEFORE word is spoken
  // Layout: 3 sections top row (Query → Embedding → Vector), 3 bottom row (Retrieve → Augment → Generate)
  const cameraKeyframes = [
    { frame: 0, x: 300, y: 350, scale: 1.0 },        // Start
    { frame: 127, x: 300, y: 350, scale: 1.0 },      // USER_QUERY (word at 142)
    { frame: 223, x: 650, y: 350, scale: 1.0 },      // EMBEDDING (word at 238)
    { frame: 388, x: 1000, y: 350, scale: 1.0 },     // VECTOR_SEARCH (word at 403)
    { frame: 516, x: 300, y: 700, scale: 1.0 },      // RETRIEVE (word at 531)
    { frame: 700, x: 650, y: 700, scale: 1.0 },      // AUGMENT (word at 715)
    { frame: 959, x: 1000, y: 700, scale: 1.0 },     // GENERATE (word at 974)
  ];

  const getCameraValue = (prop: "x" | "y" | "scale") => {
    for (let i = 0; i < cameraKeyframes.length - 1; i++) {
      const current = cameraKeyframes[i];
      const next = cameraKeyframes[i + 1];
      if (frame >= current.frame && frame < next.frame) {
        const transitionDuration = 45;
        const springValue = spring({
          frame: frame - current.frame,
          fps,
          config: { damping: 22, stiffness: 90 },
          durationInFrames: transitionDuration,
        });
        return current[prop] + (next[prop] - current[prop]) * Math.min(springValue, 1);
      }
    }
    return cameraKeyframes[cameraKeyframes.length - 1][prop];
  };

  const baseCameraX = getCameraValue("x");
  const baseCameraY = getCameraValue("y");
  const cameraScale = getCameraValue("scale");

  const driftX = Math.sin(frame * 0.05) * 6;
  const driftY = Math.cos(frame * 0.04) * 3;

  const cameraX = baseCameraX + driftX;
  const cameraY = baseCameraY + driftY;

  const getOpacity = (startFrame: number, duration = 8) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const getScale = (startFrame: number, duration = 10) =>
    interpolate(frame, [startFrame, startFrame + duration], [0.85, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.2)),
    });

  const getLineProgress = (startFrame: number, duration = 12) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  // Layout positions
  const boxWidth = 280;
  const boxHeight = 260;
  const gapX = 80;
  const gapY = 120;

  const topRowY = 150;
  const bottomRowY = topRowY + boxHeight + gapY;

  const col1X = 100;
  const col2X = col1X + boxWidth + gapX;
  const col3X = col2X + boxWidth + gapX;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 120% 100% at 50% 0%, ${colors.bgGradient1} 0%, ${colors.bg} 50%, #000 100%)`,
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <MeshGradient />
      <GridBackground />

      <div
        style={{
          width: canvasWidth,
          height: canvasHeight,
          position: "absolute",
          left: viewportWidth / 2,
          top: viewportHeight / 2,
          transform: `scale(${cameraScale}) translate(${-cameraX}px, ${-cameraY}px)`,
          transformOrigin: "0 0",
        }}
      >
        {/* Connection lines SVG */}
        <svg style={{ position: "absolute", width: canvasWidth, height: canvasHeight, pointerEvents: "none" }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Top row connections */}
          {/* User Query → Embedding */}
          <AnimatedLine
            x1={col1X + boxWidth} y1={topRowY + boxHeight/2}
            x2={col2X} y2={topRowY + boxHeight/2}
            progress={getLineProgress(243)}
            color={colors.userQuery.accent}
            frame={frame}
          />
          {/* Embedding → Vector Search */}
          <AnimatedLine
            x1={col2X + boxWidth} y1={topRowY + boxHeight/2}
            x2={col3X} y2={topRowY + boxHeight/2}
            progress={getLineProgress(408)}
            color={colors.embedding.accent}
            frame={frame}
          />

          {/* Vector Search → Retrieve (diagonal down) */}
          <AnimatedLine
            x1={col3X + boxWidth/2} y1={topRowY + boxHeight}
            x2={col1X + boxWidth/2} y2={bottomRowY}
            progress={getLineProgress(536)}
            color={colors.vectorSearch.accent}
            frame={frame}
          />

          {/* Bottom row connections */}
          {/* Retrieve → Augment */}
          <AnimatedLine
            x1={col1X + boxWidth} y1={bottomRowY + boxHeight/2}
            x2={col2X} y2={bottomRowY + boxHeight/2}
            progress={getLineProgress(720)}
            color={colors.retrieve.accent}
            frame={frame}
          />
          {/* Augment → Generate */}
          <AnimatedLine
            x1={col2X + boxWidth} y1={bottomRowY + boxHeight/2}
            x2={col3X} y2={bottomRowY + boxHeight/2}
            progress={getLineProgress(979)}
            color={colors.augment.accent}
            frame={frame}
          />
        </svg>

        {/* TOP ROW */}

        {/* 1. USER QUERY - section appear at 137 (word at 142) */}
        <SectionBox
          title="User Query"
          subtitle='"A user sends a query"'
          colorScheme={colors.userQuery}
          x={col1X}
          y={topRowY}
          width={boxWidth}
          height={boxHeight}
          opacity={getOpacity(137)}
          scale={getScale(137)}
        >
          <NodeItem label="Input" icon="terminal" opacity={getOpacity(147)} accentColor={colors.userQuery.accent} frame={frame} delay={147} />
          <NodeItem label="Question" icon="search" opacity={getOpacity(157)} accentColor={colors.userQuery.accent} frame={frame} delay={157} />
        </SectionBox>

        {/* 2. EMBEDDING - section appear at 233 (word at 238) */}
        <SectionBox
          title="Embedding"
          subtitle='"converted into an embedding"'
          colorScheme={colors.embedding}
          x={col2X}
          y={topRowY}
          width={boxWidth}
          height={boxHeight}
          opacity={getOpacity(233)}
          scale={getScale(233)}
        >
          <NodeItem label="Vectorize" icon="cube" opacity={getOpacity(243)} accentColor={colors.embedding.accent} frame={frame} delay={243} />
          <NodeItem label="Numbers" icon="vector" opacity={getOpacity(253)} accentColor={colors.embedding.accent} frame={frame} delay={253} />
        </SectionBox>

        {/* 3. VECTOR SEARCH - section appear at 398 (word at 403) */}
        <SectionBox
          title="Vector Search"
          subtitle='"search your vector database"'
          colorScheme={colors.vectorSearch}
          x={col3X}
          y={topRowY}
          width={boxWidth}
          height={boxHeight}
          opacity={getOpacity(398)}
          scale={getScale(398)}
        >
          <NodeItem label="Similarity" icon="zap" opacity={getOpacity(408)} accentColor={colors.vectorSearch.accent} frame={frame} delay={408} />
          <NodeItem label="Database" icon="database" opacity={getOpacity(418)} accentColor={colors.vectorSearch.accent} frame={frame} delay={418} />
        </SectionBox>

        {/* BOTTOM ROW - The 3 Steps */}

        {/* 4. RETRIEVE (Step 1) - section appear at 526 (word at 531) */}
        <SectionBox
          title="Step 1: Retrieve"
          subtitle="That's step one, retrieve"
          colorScheme={colors.retrieve}
          x={col1X}
          y={bottomRowY}
          width={boxWidth}
          height={boxHeight}
          opacity={getOpacity(526)}
          scale={getScale(526)}
        >
          <NodeItem label="Chunks" icon="file" opacity={getOpacity(536)} accentColor={colors.retrieve.accent} frame={frame} delay={536} />
          <NodeItem label="Context" icon="layers" opacity={getOpacity(546)} accentColor={colors.retrieve.accent} frame={frame} delay={546} />
        </SectionBox>

        {/* 5. AUGMENT (Step 2) - section appear at 710 (word at 715) */}
        <SectionBox
          title="Step 2: Augment"
          subtitle='"In step two, augment"'
          colorScheme={colors.augment}
          x={col2X}
          y={bottomRowY}
          width={boxWidth}
          height={boxHeight}
          opacity={getOpacity(710)}
          scale={getScale(710)}
        >
          <NodeItem label="Context" icon="merge" opacity={getOpacity(720)} accentColor={colors.augment.accent} frame={frame} delay={720} />
          <NodeItem label="Prompt" icon="terminal" opacity={getOpacity(730)} accentColor={colors.augment.accent} frame={frame} delay={730} />
        </SectionBox>

        {/* 6. GENERATE (Step 3) - section appear at 969 (word at 974) */}
        <SectionBox
          title="Step 3: Generate"
          subtitle='"step three, generate"'
          colorScheme={colors.generate}
          x={col3X}
          y={bottomRowY}
          width={boxWidth}
          height={boxHeight}
          opacity={getOpacity(969)}
          scale={getScale(969)}
        >
          <NodeItem label="LLM" icon="cpu" opacity={getOpacity(979)} accentColor={colors.generate.accent} frame={frame} delay={979} />
          <NodeItem label="Response" icon="sparkle" opacity={getOpacity(989)} accentColor={colors.generate.accent} frame={frame} delay={989} />
        </SectionBox>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute",
        top: 50,
        left: 70,
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontSize: 42,
          fontWeight: 800,
          background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -1.5,
          textShadow: "0 0 60px rgba(59, 130, 246, 0.5)",
        }}>
          RAG Pipeline
        </div>
        <div style={{
          fontSize: 15,
          color: colors.textMuted,
          marginTop: 12,
          fontWeight: 400,
          letterSpacing: 1,
        }}>
          Retrieval Augmented Generation
        </div>
      </div>

      {/* Vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }}/>

      {/* Scanlines */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        pointerEvents: "none",
        opacity: 0.5,
      }}/>

      {/* VOICEOVER */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* SOUND EFFECTS - AI Conservative Rule: max 10 sounds */}

      {/* Title reveal */}
      <Sequence from={0} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.15} />
      </Sequence>

      {/* Camera to User Query (whoosh at 125) */}
      <Sequence from={125} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Section 1 - User Query (section whoosh at 157) */}
      <Sequence from={157} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
      </Sequence>

      {/* Camera to Embedding (whoosh at 221) */}
      <Sequence from={221} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Camera to Vector Search (whoosh at 386) */}
      <Sequence from={386} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Camera to Retrieve - Step 1 (whoosh at 514) */}
      <Sequence from={514} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Camera to Augment - Step 2 (whoosh at 698) */}
      <Sequence from={698} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Camera to Generate - Step 3 (whoosh at 957) */}
      <Sequence from={957} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

    </AbsoluteFill>
  );
};
