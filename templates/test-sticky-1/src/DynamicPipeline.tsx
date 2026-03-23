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
import config from "./dynamic-config.json";

/*
=== DYNAMIC STICKY PIPELINE ===
Fully dynamic - reads from dynamic-config.json

Features:
- 1-4 sticky notes
- 1-6 sections per sticky
- 1-4 nodes per section
- Auto camera keyframes
- Auto connection lines
- Auto sound effects (max 10)
*/

// === TYPES ===

interface NodeConfig {
  label: string;
  icon: string;
}

interface SectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  colorKey: string;
  startFrame: number;
  nodes: NodeConfig[];
}

interface StickyConfig {
  step: number;
  title: string;
  color: string;
  sections: SectionConfig[];
}

interface Config {
  title: string;
  subtitle: string;
  fps: number;
  totalFrames: number;
  stickies: StickyConfig[];
}

// === COLORS ===

const colors = {
  bg: "#030305",
  bgGradient1: "#080810",
  bgGradient2: "#050508",

  // Color schemes for sections
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

type ColorScheme = {
  bg: string;
  border: string;
  glow: string;
  accent: string;
};

const getColorScheme = (key: string): ColorScheme => {
  return (colors as any)[key] || colors.userQuery;
};

// === GLASS STYLE ===

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

// === DYNAMIC SIZING ===

const ITEM_WIDTH = 85;
const ITEM_HEIGHT = 100;
const GAP = 20;
const PADDING_X = 48;
const PADDING_Y = 36;
const HEADER_HEIGHT = 50;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

const getGridCols = (count: number) => {
  if (count <= 2) return count;
  if (count === 3) return 3;
  if (count === 4) return 2;
  if (count <= 6) return 3;
  return 4;
};

const getContainerSize = (itemCount: number) => {
  const cols = getGridCols(itemCount);
  const rows = Math.ceil(itemCount / cols);
  const contentWidth = (cols * ITEM_WIDTH) + ((cols - 1) * GAP);
  const contentHeight = (rows * ITEM_HEIGHT) + ((rows - 1) * GAP);
  const width = Math.max(MIN_WIDTH, PADDING_X + contentWidth);
  const height = Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + contentHeight);
  return { width, height };
};

// Actual SectionBox size based on node count
const getSectionBoxSize = (nodeCount: number) => {
  return getContainerSize(nodeCount);
};

// Sticky size based on sections (uses actual box sizes)
const getStickyDimensions = (sections: SectionConfig[]) => {
  const sectionCount = sections.length;
  const cols = sectionCount <= 2 ? sectionCount : sectionCount <= 4 ? 2 : 3;
  const rows = Math.ceil(sectionCount / cols);
  const gap = 24;
  const padding = 48;

  // Calculate max box dimensions per row
  const boxSizes = sections.map(s => getSectionBoxSize(s.nodes.length));
  const maxBoxW = Math.max(...boxSizes.map(s => s.width));
  const maxBoxH = Math.max(...boxSizes.map(s => s.height));

  const width = padding + (cols * maxBoxW) + ((cols - 1) * gap);
  const height = 40 + padding + (rows * maxBoxH) + ((rows - 1) * gap);

  return { width, height, cols, rows, boxW: maxBoxW, boxH: maxBoxH };
};

// Calculate section box positions within a sticky
// Row-major order like flexbox - positions match where boxes visually appear
// Lines follow Z-pattern: [1]→[2]↘[3]→[4]
const getSectionPositions = (
  sections: SectionConfig[],
  stickyWidth: number,
  stickyHeight: number,
  centerVertically: boolean
) => {
  const sectionCount = sections.length;
  const cols = sectionCount <= 2 ? sectionCount : sectionCount <= 4 ? 2 : 3;
  const rows = Math.ceil(sectionCount / cols);
  const gap = 24;
  const padding = 24;

  // Get actual box sizes
  const boxSizes = sections.map(s => getSectionBoxSize(s.nodes.length));
  const maxBoxW = Math.max(...boxSizes.map(s => s.width));
  const maxBoxH = Math.max(...boxSizes.map(s => s.height));

  const contentW = stickyWidth - (padding * 2);
  const contentH = stickyHeight - (padding * 2);

  const gridW = (cols * maxBoxW) + ((cols - 1) * gap);
  const gridH = (rows * maxBoxH) + ((rows - 1) * gap);

  const startX = padding + (contentW - gridW) / 2;
  const startY = padding + (centerVertically ? (contentH - gridH) / 2 : 0);

  const positions: { x: number; y: number; cx: number; cy: number; right: number; bottom: number; w: number; h: number }[] = [];

  for (let i = 0; i < sectionCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols; // Row-major order (NOT snake)

    // Use actual box size for this section
    const boxW = boxSizes[i].width;
    const boxH = boxSizes[i].height;

    // Position based on grid cell, but use actual box dimensions for endpoints
    const cellX = startX + col * (maxBoxW + gap);
    const cellY = startY + row * (maxBoxH + gap);

    // Center box within its cell
    const x = cellX + (maxBoxW - boxW) / 2;
    const y = cellY + (maxBoxH - boxH) / 2;

    positions.push({
      x,
      y,
      cx: x + boxW / 2,
      cy: y + boxH / 2,
      right: x + boxW,
      bottom: y + boxH,
      w: boxW,
      h: boxH,
    });
  }

  return { positions, cols, rows, maxBoxW, maxBoxH };
};

// === ICON COMPONENT ===

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

// === STICKY NOTE COMPONENT ===

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
  centerVertically?: boolean;
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
    {/* Step badge */}
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

    {/* Content area */}
    <div style={{
      width: "100%",
      height: "100%",
      border: `2px dashed ${color}40`,
      borderRadius: 20,
      background: `linear-gradient(145deg, ${color}08 0%, ${color}02 100%)`,
      position: "relative",
    }}>
      {children}
    </div>
  </div>
);

// === SECTION BOX COMPONENT ===

const SectionBox: React.FC<{
  title: string;
  subtitle?: string;
  colorScheme: ColorScheme;
  children: React.ReactNode;
  opacity: number;
  scale: number;
}> = ({ title, subtitle, colorScheme, children, opacity, scale }) => {
  const childCount = React.Children.count(children);
  const autoSize = getContainerSize(childCount);

  return (
    <div
      style={{
        width: autoSize.width,
        height: autoSize.height,
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

// === NODE ITEM COMPONENT ===

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

// === ANIMATED LINE ===

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

// === BACKGROUNDS ===

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

// === MAIN COMPONENT ===

export const DynamicPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cfg = config as Config;
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // Calculate sticky dimensions and positions
  const stickyGap = 50;
  const startX = 80;
  const stickyY = 150;

  // Build layouts without circular reference
  const stickyLayouts: { width: number; height: number; cols: number; rows: number; boxW: number; boxH: number; x: number; y: number }[] = [];
  let currentX = startX;
  for (const sticky of cfg.stickies) {
    const dims = getStickyDimensions(sticky.sections);
    stickyLayouts.push({ ...dims, x: currentX, y: stickyY });
    currentX += dims.width + stickyGap;
  }

  // Last sticky for canvas size
  const lastSticky = stickyLayouts[stickyLayouts.length - 1];
  const canvasWidth = lastSticky.x + lastSticky.width + 100;
  const canvasHeight = stickyY + Math.max(...stickyLayouts.map(s => s.height)) + 100;

  // Generate camera keyframes from sticky positions
  const cameraKeyframes = [
    { frame: 0, x: stickyLayouts[0].x + stickyLayouts[0].width / 2, y: stickyY + stickyLayouts[0].height / 2, scale: 0.7 },
    ...cfg.stickies.map((sticky, i) => {
      const firstSection = sticky.sections[0];
      return {
        frame: firstSection.startFrame - 5,
        x: stickyLayouts[i].x + stickyLayouts[i].width / 2,
        y: stickyY + stickyLayouts[i].height / 2,
        scale: 0.85,
      };
    }),
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

  // Animation helpers
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

  // Sound effects - max 10
  const soundEvents: { frame: number; type: "soft" | "medium" }[] = [];

  // Title whoosh
  soundEvents.push({ frame: 0, type: "soft" });

  // Camera moves + sticky appears
  cfg.stickies.forEach((sticky, i) => {
    const firstSection = sticky.sections[0];
    const cameraFrame = firstSection.startFrame - 15;
    soundEvents.push({ frame: cameraFrame, type: "medium" }); // camera
    soundEvents.push({ frame: firstSection.startFrame - 5, type: "soft" }); // sticky appear
  });

  // Limit to 10
  const limitedSounds = soundEvents.slice(0, 10);

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
        {/* Connection lines between stickies */}
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

          {cfg.stickies.slice(0, -1).map((sticky, i) => {
            const currentLayout = stickyLayouts[i];
            const nextLayout = stickyLayouts[i + 1];
            const nextSticky = cfg.stickies[i + 1];
            const lineStartFrame = nextSticky.sections[0].startFrame - 10;

            return (
              <AnimatedLine
                key={`line-${i}`}
                x1={currentLayout.x + currentLayout.width}
                y1={currentLayout.y + currentLayout.height / 2}
                x2={nextLayout.x}
                y2={nextLayout.y + nextLayout.height / 2}
                progress={getLineProgress(lineStartFrame)}
                color={sticky.color}
                frame={frame}
              />
            );
          })}
        </svg>

        {/* Render stickies dynamically */}
        {cfg.stickies.map((sticky, stickyIndex) => {
          const layout = stickyLayouts[stickyIndex];
          const firstSectionFrame = sticky.sections[0].startFrame;
          const stickyAppearFrame = firstSectionFrame - 5;
          const centerVertically = sticky.sections.length <= 2;

          // Calculate section positions for internal lines
          const { positions: sectionPositions, cols } = getSectionPositions(
            sticky.sections,
            layout.width,
            layout.height,
            centerVertically
          );

          return (
            <StickyNote
              key={`sticky-${stickyIndex}`}
              step={sticky.step}
              title={sticky.title}
              color={sticky.color}
              opacity={getOpacity(stickyAppearFrame)}
              scale={getScale(stickyAppearFrame)}
              x={layout.x}
              y={layout.y}
              width={layout.width}
              height={layout.height}
              centerVertically={centerVertically}
            >
              {/* Internal lines between sections */}
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: layout.width,
                  height: layout.height,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                {sticky.sections.slice(0, -1).map((section, i) => {
                  const pos1 = sectionPositions[i];
                  const pos2 = sectionPositions[i + 1];
                  const nextSection = sticky.sections[i + 1];
                  const lineStartFrame = nextSection.startFrame - 10;
                  const colorScheme = getColorScheme(section.colorKey);

                  // Row-major: section i is at row=floor(i/cols), col=i%cols
                  const row1 = Math.floor(i / cols);
                  const col1 = i % cols;
                  const row2 = Math.floor((i + 1) / cols);
                  const col2 = (i + 1) % cols;

                  let x1: number, y1: number, x2: number, y2: number;

                  if (row1 === row2) {
                    // Same row - horizontal line (edge to edge)
                    if (col2 > col1) {
                      // Going right
                      x1 = pos1.right; y1 = pos1.cy;
                      x2 = pos2.x; y2 = pos2.cy;
                    } else {
                      // Going left
                      x1 = pos1.x; y1 = pos1.cy;
                      x2 = pos2.right; y2 = pos2.cy;
                    }
                  } else {
                    // Different rows - diagonal Z line (center-bottom to center-top)
                    // This is the Z-pattern: from right side of row 0 to left side of row 1
                    x1 = pos1.cx; y1 = pos1.bottom;
                    x2 = pos2.cx; y2 = pos2.y;
                  }

                  return (
                    <AnimatedLine
                      key={`internal-line-${stickyIndex}-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      progress={getLineProgress(lineStartFrame)}
                      color={colorScheme.accent}
                      frame={frame}
                    />
                  );
                })}
              </svg>

              {sticky.sections.map((section, sectionIndex) => {
                const colorScheme = getColorScheme(section.colorKey);
                const sectionAppearFrame = section.startFrame - 5;
                const pos = sectionPositions[sectionIndex];

                return (
                  <div
                    key={`section-wrapper-${stickyIndex}-${sectionIndex}`}
                    style={{
                      position: "absolute",
                      left: pos.x,
                      top: pos.y,
                    }}
                  >
                  <SectionBox
                    key={`section-${stickyIndex}-${sectionIndex}`}
                    title={section.title}
                    subtitle={section.subtitle}
                    colorScheme={colorScheme}
                    opacity={getOpacity(sectionAppearFrame)}
                    scale={getScale(sectionAppearFrame)}
                  >
                    {section.nodes.map((node, nodeIndex) => {
                      const nodeDelay = section.startFrame + (nodeIndex * 10);
                      return (
                        <NodeItem
                          key={`node-${stickyIndex}-${sectionIndex}-${nodeIndex}`}
                          label={node.label}
                          icon={node.icon}
                          opacity={getOpacity(nodeDelay)}
                          accentColor={colorScheme.accent}
                          frame={frame}
                          delay={nodeDelay}
                        />
                      );
                    })}
                  </SectionBox>
                  </div>
                );
              })}
            </StickyNote>
          );
        })}
      </div>

      {/* Title */}
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
          {cfg.title}
        </div>
        <div style={{
          fontSize: 14,
          color: colors.textMuted,
          marginTop: 10,
          fontWeight: 400,
          letterSpacing: 1,
        }}>
          {cfg.subtitle}
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

      {/* Voiceover */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* Sound effects */}
      {limitedSounds.map((sound, i) => (
        <Sequence key={`sound-${i}`} from={sound.frame} durationInFrames={30}>
          <Audio
            src={staticFile(`sounds/whooshes/${sound.type === "medium" ? "medium" : "soft"}-whoosh.mp3`)}
            volume={sound.type === "medium" ? 0.25 : 0.12}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
