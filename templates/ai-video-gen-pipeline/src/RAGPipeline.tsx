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
Synced to ElevenLabs voiceover timestamps

KRITIČNO: StickyNote se pojavljuje KAD POČNE SADRŽAJ, ne kad kaže "step X"!

TEKST ANALIZA:
- "Let me walk you through..." (0-83) = INTRO
- "A user sends a query..." (99-681) = STEP 1 RETRIEVE sadržaj
- "In step two, augment..." (699-918) = STEP 2 AUGMENT sadržaj
- "Finally, in step three..." (936-1219) = STEP 3 GENERATE sadržaj
- "Retrieve augment generate" (1237-1310) = RECAP

STICKY NOTE TIMING:
- Step 1: frame 90 (5 frames pre "A user sends..." na 99)
- Step 2: frame 690 (5 frames pre "In step two" na 699)
- Step 3: frame 930 (5 frames pre "Finally" na 936)

Total: 1310 frames = 43.65 sec @ 30fps
*/

const colors = {
  bg: "#030305",
  bgGradient1: "#080810",
  bgGradient2: "#050508",

  // Step colors - za StickyNote badge
  step1: "#a855f7",  // Purple
  step2: "#f97316",  // Orange
  step3: "#22c55e",  // Green

  // Section colors - ISTI kao flat verzija
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

// Glass style - ISTI kao flat verzija
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

// === DYNAMIC SIZING LOGIC (from BranchFlow) ===

// Smart grid columns based on item count
const getGridCols = (count: number) => {
  if (count <= 2) return count;  // 1-2: single row
  if (count === 3) return 3;     // 3: one row of 3
  if (count === 4) return 2;     // 4: 2x2 grid
  if (count <= 6) return 3;      // 5-6: 3 columns
  return 4;                      // 7+: 4 columns
};

// Dynamic container size based on item count
const ITEM_WIDTH = 85;      // NodeItem fixed width
const ITEM_HEIGHT = 100;    // Icon (60) + gap (10) + label (~30)
const GAP = 20;
const PADDING_X = 48;       // 24px left + 24px right
const PADDING_Y = 36;       // 24px top + 12px bottom
const HEADER_HEIGHT = 50;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

const getContainerSize = (itemCount: number) => {
  const cols = getGridCols(itemCount);
  const rows = Math.ceil(itemCount / cols);

  const contentWidth = (cols * ITEM_WIDTH) + ((cols - 1) * GAP);
  const contentHeight = (rows * ITEM_HEIGHT) + ((rows - 1) * GAP);

  const width = Math.max(MIN_WIDTH, PADDING_X + contentWidth);
  const height = Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + contentHeight);

  return { width, height };
};

// StickyNote container sizing
const STICKY_PADDING = 48;    // 24px each side
const STICKY_GAP = 24;        // Gap between SectionBoxes
const STICKY_HEADER = 40;     // Badge height above

const getStickySize = (sectionSizes: { width: number; height: number }[], cols: number) => {
  const rows = Math.ceil(sectionSizes.length / cols);

  // Get max width/height for each row/col
  const maxWidth = Math.max(...sectionSizes.map(s => s.width));
  const maxHeight = Math.max(...sectionSizes.map(s => s.height));

  const contentWidth = (cols * maxWidth) + ((cols - 1) * STICKY_GAP);
  const contentHeight = (rows * maxHeight) + ((rows - 1) * STICKY_GAP);

  return {
    width: STICKY_PADDING + contentWidth,
    height: STICKY_HEADER + STICKY_PADDING + contentHeight,
  };
};

// Icon component - ISTI kao flat verzija
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

// StickyNote wrapper - minimalan, samo border i badge
// centerVertically: true za single-row layouts (Step 2, 3)
const StickyNote: React.FC<{
  step: number;
  title: string;
  color: string;
  opacity: number;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerVertically?: boolean;  // Za single-row layouts
  children: React.ReactNode;
}> = ({ step, title, color, opacity, scale, x, y, width, height, centerVertically = false, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    }}
  >
    {/* Step badge - floating above */}
    <div style={{
      position: "absolute",
      top: -28,
      left: 24,
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      padding: "10px 24px",
      borderRadius: "14px 14px 0 0",
      fontSize: 13,
      fontWeight: 800,
      color: "#fff",
      letterSpacing: 2,
      textTransform: "uppercase",
      boxShadow: `0 -4px 30px ${color}60`,
      fontFamily: "'SF Mono', 'Fira Code', monospace",
    }}>
      Step {step}: {title}
    </div>

    {/* Content area with dashed border */}
    <div style={{
      width: "100%",
      height: "100%",
      border: `2px dashed ${color}40`,
      borderRadius: 20,
      padding: 24,
      background: `linear-gradient(145deg, ${color}08 0%, ${color}02 100%)`,
      display: "flex",
      flexWrap: "wrap",
      gap: 24,
      alignContent: centerVertically ? "center" : "flex-start",
      justifyContent: "center",
    }}>
      {children}
    </div>
  </div>
);

// SectionBox - AUTO-SIZE with CSS Grid (from BranchFlow)
const SectionBox: React.FC<{
  title: string;
  subtitle?: string;
  colorScheme: { bg: string; border: string; glow: string; accent: string };
  children: React.ReactNode;
  opacity: number;
  scale: number;
  width?: number;   // Optional - auto-calculate if not provided
  height?: number;  // Optional - auto-calculate if not provided
}> = ({ title, subtitle, colorScheme, children, opacity, scale, width, height }) => {
  const childCount = React.Children.count(children);

  // Auto-calculate size if not provided
  const autoSize = getContainerSize(childCount);
  const finalWidth = width ?? autoSize.width;
  const finalHeight = height ?? autoSize.height;

  return (
    <div
      style={{
        width: finalWidth,
        height: finalHeight,
        background: colorScheme.bg,
        ...glassStyle(colorScheme.border, colorScheme.glow),
        padding: "24px 24px 12px 24px",
        opacity,
        display: "flex",
        flexDirection: "column",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Corner accents */}
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

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: subtitle ? 8 : 20 }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${colorScheme.accent} 0%, ${colorScheme.border} 100%)`,
          boxShadow: `0 0 15px ${colorScheme.glow}`,
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
        }}/>
      </div>

      {subtitle && (
        <div style={{
          fontSize: 10,
          color: colors.textMuted,
          marginBottom: 12,
          fontFamily: "'SF Mono', monospace",
        }}>
          {subtitle}
        </div>
      )}

      {/* Content - CSS Grid */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: `repeat(${getGridCols(childCount)}, minmax(0, 1fr))`,
        gap: 20,
        justifyItems: "center",
        alignContent: "start",
      }}>
        {children}
      </div>
    </div>
  );
};

// NodeItem - FIXED SIZE 85px width, 60x60 icon (from BranchFlow)
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
        width: 85,  // Fixed width!
      }}
    >
      <div
        style={{
          width: 60,  // Fixed icon size
          height: 60,
          background: `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)`,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 40px ${accentColor}15`,
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

export const RAGPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // SectionBox auto-sizes (based on getContainerSize):
  // - 2 items: 238x186
  // - 3 items: 343x186
  // Step 1: 4 boxes (2x2) → need ~550x420
  // Step 2/3: 2 boxes side by side (343 + 24 + 238 = 605) → need ~680 width
  // Using consistent size for all: 700 wide, 480 tall
  const stickyWidth = 700;
  const stickyHeight = 480;
  const stickyGap = 50;

  const sticky1X = 80;
  const sticky2X = sticky1X + stickyWidth + stickyGap;
  const sticky3X = sticky2X + stickyWidth + stickyGap;
  const stickyY = 150;

  // Canvas size to fit all StickyNotes
  const canvasWidth = sticky3X + stickyWidth + 100;
  const canvasHeight = stickyY + stickyHeight + 100;

  // Camera keyframes - prati StickyNotes
  // Scale 0.85 = ceo StickyNote (600x520) staje u viewport (1920x1080) sa padding-om
  // Camera X = centar StickyNote-a
  const cameraKeyframes = [
    { frame: 0, x: sticky1X + stickyWidth / 2, y: stickyY + stickyHeight / 2, scale: 0.7 },   // Overview
    { frame: 85, x: sticky1X + stickyWidth / 2, y: stickyY + stickyHeight / 2, scale: 0.85 },  // Step 1
    { frame: 685, x: sticky2X + stickyWidth / 2, y: stickyY + stickyHeight / 2, scale: 0.85 }, // Step 2
    { frame: 925, x: sticky3X + stickyWidth / 2, y: stickyY + stickyHeight / 2, scale: 0.85 }, // Step 3
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

  const driftX = Math.sin(frame * 0.05) * 5;
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
        {/* Connection lines between StickyNotes */}
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

          {/* Step 1 → Step 2 */}
          <AnimatedLine
            x1={sticky1X + stickyWidth}
            y1={stickyY + stickyHeight / 2}
            x2={sticky2X}
            y2={stickyY + stickyHeight / 2}
            progress={getLineProgress(695)}
            color={colors.step1}
            frame={frame}
          />

          {/* Step 2 → Step 3 */}
          <AnimatedLine
            x1={sticky2X + stickyWidth}
            y1={stickyY + stickyHeight / 2}
            x2={sticky3X}
            y2={stickyY + stickyHeight / 2}
            progress={getLineProgress(935)}
            color={colors.step2}
            frame={frame}
          />
        </svg>

        {/* ========== STEP 1: RETRIEVE ========== */}
        {/* StickyNote se pojavi na frame 90 (5 frames pre "A user sends" na 99) */}
        <StickyNote
          step={1}
          title="Retrieve"
          color={colors.step1}
          opacity={getOpacity(90)}
          scale={getScale(90)}
          x={sticky1X}
          y={stickyY}
          width={stickyWidth}
          height={stickyHeight}
        >
          {/* Internal lines - Z pattern flow: Box1 → Box2 → Box3 → Box4 */}
          {/* Box auto-size: 238x186, gap: 24, content width: 652 */}
          {/* 2 boxes per row: startX = (652 - 500) / 2 = 76 */}
          {(() => {
            const boxW = 238, boxH = 186, gap = 24;
            const contentW = stickyWidth - 48;
            const startX = (contentW - (2 * boxW + gap)) / 2;
            // Box centers: 1=(startX + boxW/2), 2=(startX + boxW + gap + boxW/2)
            const box1 = { cx: startX + boxW/2, cy: boxH/2, right: startX + boxW };
            const box2 = { cx: startX + boxW + gap + boxW/2, cy: boxH/2, left: startX + boxW + gap };
            const box3 = { cx: startX + boxW/2, cy: boxH + gap + boxH/2, top: boxH + gap, right: startX + boxW };
            const box4 = { cx: startX + boxW + gap + boxW/2, cy: boxH + gap + boxH/2, left: startX + boxW + gap };
            return (
              <svg style={{ position: "absolute", top: 24, left: 24, width: contentW, height: 420, pointerEvents: "none", zIndex: 5 }}>
                {/* Box1 → Box2 (horizontal) */}
                <AnimatedLine x1={box1.right} y1={box1.cy} x2={box2.left} y2={box2.cy} progress={getLineProgress(180)} color={colors.userQuery.accent} frame={frame} />
                {/* Box2 → Box3 (diagonal Z) */}
                <AnimatedLine x1={box2.cx} y1={boxH} x2={box3.cx} y2={box3.top} progress={getLineProgress(350)} color={colors.embedding.accent} frame={frame} />
                {/* Box3 → Box4 (horizontal) */}
                <AnimatedLine x1={box3.right} y1={box3.cy} x2={box4.left} y2={box4.cy} progress={getLineProgress(580)} color={colors.vectorSearch.accent} frame={frame} />
              </svg>
            );
          })()}

          {/* User Query - "A user sends a query" @ frame 99 */}
          <SectionBox
            title="User Query"
            subtitle="A user sends a query"
            colorScheme={colors.userQuery}
            opacity={getOpacity(95)}
            scale={getScale(95)}
          >
            <NodeItem label="Input" icon="terminal" opacity={getOpacity(105)} accentColor={colors.userQuery.accent} frame={frame} delay={105} />
            <NodeItem label="Question" icon="search" opacity={getOpacity(115)} accentColor={colors.userQuery.accent} frame={frame} delay={115} />
          </SectionBox>

          {/* Embedding - "converted into an embedding" @ frame 209-238 */}
          <SectionBox
            title="Embedding"
            subtitle="Converted into embedding"
            colorScheme={colors.embedding}
            opacity={getOpacity(205)}
            scale={getScale(205)}
          >
            <NodeItem label="Vectorize" icon="cube" opacity={getOpacity(215)} accentColor={colors.embedding.accent} frame={frame} delay={215} />
            <NodeItem label="Numbers" icon="vector" opacity={getOpacity(225)} accentColor={colors.embedding.accent} frame={frame} delay={225} />
          </SectionBox>

          {/* Vector Search - "search your vector database" @ frame 379-403 */}
          <SectionBox
            title="Vector Search"
            subtitle="Search vector database"
            colorScheme={colors.vectorSearch}
            opacity={getOpacity(375)}
            scale={getScale(375)}
          >
            <NodeItem label="Similarity" icon="zap" opacity={getOpacity(385)} accentColor={colors.vectorSearch.accent} frame={frame} delay={385} />
            <NodeItem label="Database" icon="database" opacity={getOpacity(395)} accentColor={colors.vectorSearch.accent} frame={frame} delay={395} />
          </SectionBox>

          {/* Context - "chunks become your context" @ frame 599-681 */}
          <SectionBox
            title="Context"
            subtitle="Chunks become context"
            colorScheme={colors.retrieve}
            opacity={getOpacity(595)}
            scale={getScale(595)}
          >
            <NodeItem label="Chunks" icon="file" opacity={getOpacity(605)} accentColor={colors.retrieve.accent} frame={frame} delay={605} />
            <NodeItem label="Context" icon="layers" opacity={getOpacity(615)} accentColor={colors.retrieve.accent} frame={frame} delay={615} />
          </SectionBox>
        </StickyNote>

        {/* ========== STEP 2: AUGMENT ========== */}
        {/* StickyNote se pojavi na frame 690 (5 frames pre "In step two" na 699) */}
        <StickyNote
          step={2}
          title="Augment"
          color={colors.step2}
          opacity={getOpacity(690)}
          scale={getScale(690)}
          x={sticky2X}
          y={stickyY}
          width={stickyWidth}
          height={stickyHeight}
          centerVertically={true}
        >
          {/* Internal lines - 2 boxes: Combine (3 items: 343w) → Prompt (2 items: 238w) */}
          {/* centerVertically=true: boxes su centrirani, linije moraju da prate */}
          {(() => {
            const box1W = 343, box2W = 238, boxH = 186, gap = 24;
            const contentW = stickyWidth - 48;
            const contentH = stickyHeight - 48; // 432px available
            const totalW = box1W + gap + box2W;
            const startX = (contentW - totalW) / 2;
            // Vertical offset for centered single row
            const verticalOffset = (contentH - boxH) / 2; // ~123px
            const box1Right = startX + box1W;
            const box2Left = startX + box1W + gap;
            const centerY = verticalOffset + boxH / 2; // Line follows centered boxes
            return (
              <svg style={{ position: "absolute", top: 24, left: 24, width: contentW, height: contentH, pointerEvents: "none", zIndex: 5 }}>
                {/* Combine → Prompt (horizontal) */}
                <AnimatedLine x1={box1Right} y1={centerY} x2={box2Left} y2={centerY} progress={getLineProgress(870)} color={colors.augment.accent} frame={frame} />
              </svg>
            );
          })()}

          {/* Combine - "take context and combine with query" @ frame 784-885 */}
          <SectionBox
            title="Combine"
            subtitle="Context + Original Query"
            colorScheme={colors.augment}
            opacity={getOpacity(695)}
            scale={getScale(695)}
          >
            <NodeItem label="Context" icon="layers" opacity={getOpacity(705)} accentColor={colors.augment.accent} frame={frame} delay={705} />
            <NodeItem label="Query" icon="terminal" opacity={getOpacity(720)} accentColor={colors.augment.accent} frame={frame} delay={720} />
            <NodeItem label="Merge" icon="merge" opacity={getOpacity(735)} accentColor={colors.augment.accent} frame={frame} delay={735} />
          </SectionBox>

          {/* Prompt - "into a prompt" @ frame 890-918 */}
          <SectionBox
            title="Prompt"
            subtitle="Combined into prompt"
            colorScheme={colors.augment}
            opacity={getOpacity(885)}
            scale={getScale(885)}
          >
            <NodeItem label="Template" icon="file" opacity={getOpacity(895)} accentColor={colors.augment.accent} frame={frame} delay={895} />
            <NodeItem label="Prompt" icon="terminal" opacity={getOpacity(905)} accentColor={colors.augment.accent} frame={frame} delay={905} />
          </SectionBox>
        </StickyNote>

        {/* ========== STEP 3: GENERATE ========== */}
        {/* StickyNote se pojavi na frame 930 (5 frames pre "Finally" na 936) */}
        <StickyNote
          step={3}
          title="Generate"
          color={colors.step3}
          opacity={getOpacity(930)}
          scale={getScale(930)}
          x={sticky3X}
          y={stickyY}
          width={stickyWidth}
          height={stickyHeight}
          centerVertically={true}
        >
          {/* Internal lines - 2 boxes: LLM (2 items: 238w) → Response (2 items: 238w) */}
          {/* centerVertically=true: boxes su centrirani, linije moraju da prate */}
          {(() => {
            const boxW = 238, boxH = 186, gap = 24;
            const contentW = stickyWidth - 48;
            const contentH = stickyHeight - 48; // 432px available
            const totalW = boxW + gap + boxW;
            const startX = (contentW - totalW) / 2;
            // Vertical offset for centered single row
            const verticalOffset = (contentH - boxH) / 2; // ~123px
            const box1Right = startX + boxW;
            const box2Left = startX + boxW + gap;
            const centerY = verticalOffset + boxH / 2; // Line follows centered boxes
            return (
              <svg style={{ position: "absolute", top: 24, left: 24, width: contentW, height: contentH, pointerEvents: "none", zIndex: 5 }}>
                {/* LLM → Response (horizontal) */}
                <AnimatedLine x1={box1Right} y1={centerY} x2={box2Left} y2={centerY} progress={getLineProgress(1090)} color={colors.generate.accent} frame={frame} />
              </svg>
            );
          })()}

          {/* LLM Processing - "pass prompt to LLM" @ frame 1035-1093 */}
          <SectionBox
            title="LLM Processing"
            subtitle="Pass prompt to LLM"
            colorScheme={colors.generate}
            opacity={getOpacity(935)}
            scale={getScale(935)}
          >
            <NodeItem label="Prompt" icon="terminal" opacity={getOpacity(945)} accentColor={colors.generate.accent} frame={frame} delay={945} />
            <NodeItem label="LLM" icon="cpu" opacity={getOpacity(960)} accentColor={colors.generate.accent} frame={frame} delay={960} />
          </SectionBox>

          {/* Response - "generates a response" @ frame 1113-1153 */}
          <SectionBox
            title="Response"
            subtitle="Generates response"
            colorScheme={colors.generate}
            opacity={getOpacity(1105)}
            scale={getScale(1105)}
          >
            <NodeItem label="Process" icon="zap" opacity={getOpacity(1115)} accentColor={colors.generate.accent} frame={frame} delay={1115} />
            <NodeItem label="Response" icon="sparkle" opacity={getOpacity(1130)} accentColor={colors.generate.accent} frame={frame} delay={1130} />
          </SectionBox>
        </StickyNote>
      </div>

      {/* Title - pojavljuje se ODMAH na frame 0 */}
      <div style={{
        position: "absolute",
        top: 40,
        left: 60,
        opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontSize: 38,
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
          fontSize: 14,
          color: colors.textMuted,
          marginTop: 10,
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

      {/* SOUND EFFECTS - max 10 */}

      {/* Title reveal */}
      <Sequence from={0} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.15} />
      </Sequence>

      {/* Camera zoom to Step 1 */}
      <Sequence from={83} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Step 1 StickyNote appear */}
      <Sequence from={90} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
      </Sequence>

      {/* === REMOVABLE: SectionBox sounds === */}
      {/* Embedding box appear */}
      <Sequence from={205} durationInFrames={15}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.08} />
      </Sequence>

      {/* Vector Search box appear */}
      <Sequence from={375} durationInFrames={15}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.08} />
      </Sequence>

      {/* Context box appear */}
      <Sequence from={595} durationInFrames={15}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.08} />
      </Sequence>
      {/* === END REMOVABLE === */}

      {/* Camera pan to Step 2 */}
      <Sequence from={683} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Step 2 StickyNote appear */}
      <Sequence from={690} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
      </Sequence>

      {/* Camera pan to Step 3 */}
      <Sequence from={923} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Step 3 StickyNote appear */}
      <Sequence from={930} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
      </Sequence>

    </AbsoluteFill>
  );
};
