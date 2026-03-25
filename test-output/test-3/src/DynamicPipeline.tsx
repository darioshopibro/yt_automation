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
import { ExplainerLayout } from "./ExplainerLayout";
import { getLayoutSize } from "./dimensions";
import * as LucideIcons from "lucide-react";

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
  color?: string; // Optional: blue, green, orange, purple, red
}

interface SectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  colorKey: string;
  startFrame: number;
  layout?: string; // Optional: flow, arrow, vs, combine, negation, if-else, merge, bidirectional, filter
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
  showStepPrefix?: boolean; // true = "Step 1: Title", false = just "Title"
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

// Icon to color mapping - determines section color based on first icon
const iconToColorKey: Record<string, string> = {
  // Blue family
  user: "userQuery",
  search: "userQuery",
  terminal: "userQuery",

  // Green/Teal family
  database: "embedding",
  layers: "embedding",
  vector: "embedding",

  // Orange/Yellow family
  file: "vectorSearch",
  cube: "vectorSearch",
  video: "vectorSearch",
  image: "vectorSearch",

  // Purple family
  merge: "retrieve",
  sparkle: "retrieve",

  // Orange family
  cpu: "augment",

  // Green family
  zap: "generate",
};

// Color rotation palette for auto-assignment
const colorRotation = ["userQuery", "embedding", "vectorSearch", "retrieve", "augment", "generate"];

// Get color scheme - uses icon-based color if available, otherwise rotates
const getColorSchemeForSection = (sectionIndex: number, firstIcon?: string): ColorScheme => {
  // If icon has a mapped color, use it
  if (firstIcon && iconToColorKey[firstIcon]) {
    return (colors as any)[iconToColorKey[firstIcon]];
  }
  // Otherwise rotate through palette
  const colorKey = colorRotation[sectionIndex % colorRotation.length];
  return (colors as any)[colorKey];
};

const getColorScheme = (key: string): ColorScheme => {
  return (colors as any)[key] || colors.userQuery;
};

// === GLASS STYLE ===

// activeIntensity: 0 = not visible, 0.35 = dimmed (past), 1 = fully active (current topic)
// GLOW ONLY ON ACTIVE - dimmed sections get NO colored glow
const glassStyle = (borderColor: string, glowColor: string, activeIntensity: number = 1): React.CSSProperties => {
  // Only apply colored glow when intensity > 0.5 (active state)
  const isActive = activeIntensity > 0.5;
  const glowStrength = isActive ? (activeIntensity - 0.5) * 2 : 0; // 0-1 only when active

  const borderWidth = 1.5;
  const borderHex = Math.round((0.25 + (isActive ? 0.35 : 0)) * 255).toString(16).padStart(2, '0');

  // Parse glow color base
  const glowBase = glowColor.replace(/[\d.]+\)$/, ''); // "rgba(59, 130, 246, "

  // Build box-shadow: colored glow ONLY when active, always keep base shadow
  const coloredGlow = isActive
    ? `0 0 ${Math.round(40 + glowStrength * 40)}px ${glowBase}${(0.3 + glowStrength * 0.2).toFixed(2)}),
       0 0 ${Math.round(60 + glowStrength * 60)}px ${glowBase}${(0.15 + glowStrength * 0.15).toFixed(2)}),`
    : ''; // No colored glow when dimmed

  return {
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    border: `${borderWidth}px solid ${borderColor}${borderHex}`,
    boxShadow: `
      ${coloredGlow}
      0 8px 40px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2)
    `,
    borderRadius: 20,
  };
};

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

// Actual SectionBox size based on node count and layout type
const getSectionBoxSize = (nodeCount: number, layout?: string) => {
  // If layout is specified, use ExplainerLayout sizing
  if (layout && layout !== "grid") {
    const layoutSize = getLayoutSize(layout, nodeCount);
    if (layoutSize.width > 0) {
      // Add padding for header and borders
      return {
        width: Math.max(MIN_WIDTH, PADDING_X + layoutSize.width),
        height: Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + layoutSize.height),
      };
    }
  }
  // Fallback to grid sizing
  return getContainerSize(nodeCount);
};

// Sticky size based on sections (uses actual box sizes)
const getStickyDimensions = (sections: SectionConfig[]) => {
  const sectionCount = sections.length;
  const cols = sectionCount <= 2 ? sectionCount : sectionCount <= 4 ? 2 : 3;
  const rows = Math.ceil(sectionCount / cols);
  const gap = 24;
  const paddingX = 48; // left + right
  const paddingY = 24; // top + bottom (symmetric)

  // Calculate max box dimensions per row (including layout-based sizing)
  const boxSizes = sections.map(s => getSectionBoxSize(s.nodes.length, s.layout));
  const maxBoxW = Math.max(...boxSizes.map(s => s.width));
  const maxBoxH = Math.max(...boxSizes.map(s => s.height));

  const width = paddingX + (cols * maxBoxW) + ((cols - 1) * gap);
  const height = (paddingY * 2) + (rows * maxBoxH) + ((rows - 1) * gap); // symmetric top/bottom

  return { width, height, cols, rows, boxW: maxBoxW, boxH: maxBoxH };
};

// Get clockwise grid position for section index
// For 4 sections: 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left
// For 3 sections: 0=top-left, 1=top-right, 2=bottom-right
const getClockwiseGridPos = (index: number, total: number, cols: number): { row: number; col: number } => {
  if (total <= 2) {
    return { row: 0, col: index };
  }

  if (total === 3) {
    // 0 -- 1
    //      |
    //      2
    const positions = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
    ];
    return positions[index];
  }

  if (total === 4) {
    // 0 -- 1
    // |    |
    // 3 -- 2
    const positions = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 1, col: 0 },
    ];
    return positions[index];
  }

  // Fallback for 5+
  return { row: Math.floor(index / cols), col: index % cols };
};

// Calculate section box positions within a sticky
// CLOCKWISE order: [0]→[1]→[2]→[3] visually goes around the square
const getSectionPositions = (
  sections: SectionConfig[],
  stickyWidth: number,
  stickyHeight: number,
  centerVertically: boolean
) => {
  const sectionCount = sections.length;
  const cols = sectionCount <= 2 ? sectionCount : 2; // Always 2 cols for 3-4 sections
  const rows = Math.ceil(sectionCount / cols);
  const gap = 24;
  const padding = 24;

  // Get actual box sizes (including layout-based sizing)
  const boxSizes = sections.map(s => getSectionBoxSize(s.nodes.length, s.layout));
  const maxBoxW = Math.max(...boxSizes.map(s => s.width));
  const maxBoxH = Math.max(...boxSizes.map(s => s.height));

  const contentW = stickyWidth - (padding * 2);
  const contentH = stickyHeight - (padding * 2);

  const gridW = (cols * maxBoxW) + ((cols - 1) * gap);
  const gridH = (rows * maxBoxH) + ((rows - 1) * gap);

  const startX = padding + (contentW - gridW) / 2;
  // Always center vertically for symmetric top/bottom spacing
  const startY = padding + (contentH - gridH) / 2;

  const positions: { x: number; y: number; cx: number; cy: number; right: number; bottom: number; w: number; h: number }[] = [];

  for (let i = 0; i < sectionCount; i++) {
    // Use CLOCKWISE position instead of row-major
    const { row, col } = getClockwiseGridPos(i, sectionCount, cols);

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

// === ICON COMPONENT (LUCIDE DYNAMIC) ===
// Koristi 1500+ Lucide ikona dinamički - planner može koristiti BILO KOJU!

const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 28, color = "#fff" }) => {
  const iconStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 10px ${color}60) drop-shadow(0 0 20px ${color}30)`,
  };

  // Konvertuj "gitBranch" -> "GitBranch", "database" -> "Database"
  const toPascalCase = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Probaj naći ikonu u Lucide
  const iconName = toPascalCase(type);
  const LucideIcon = (LucideIcons as Record<string, React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>>)[iconName];

  if (LucideIcon) {
    return <LucideIcon size={size} color={color} style={iconStyle} />;
  }

  // Fallback na Box ikonu ako ne postoji
  const FallbackIcon = LucideIcons.Box;
  return <FallbackIcon size={size} color={color} style={iconStyle} />;
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
  showStepPrefix?: boolean; // true = "Step 1: Title", false = just "Title"
  children: React.ReactNode;
}> = ({ step, title, color, opacity, scale, x, y, width, height, centerVertically = false, showStepPrefix = true, children }) => (
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
      {showStepPrefix ? `Step ${step}: ${title}` : title}
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
  children?: React.ReactNode;
  opacity: number;
  scale: number;
  activeIntensity?: number; // 0-1, how "active" this section is (for highlight)
  layout?: string; // NEW: flow, arrow, vs, combine, negation, if-else, merge, etc.
  nodes?: NodeConfig[]; // NEW: nodes for ExplainerLayout
}> = ({ title, subtitle, colorScheme, children, opacity, scale, activeIntensity = 1, layout, nodes }) => {
  // Use ExplainerLayout sizing if layout is specified
  const useExplainer = layout && layout !== "grid" && nodes && nodes.length > 0;
  const childCount = useExplainer ? nodes!.length : React.Children.count(children);
  const autoSize = useExplainer
    ? getSectionBoxSize(nodes!.length, layout)
    : getContainerSize(childCount);

  return (
    <div
      style={{
        width: autoSize.width,
        height: autoSize.height,
        background: colorScheme.bg,
        ...glassStyle(colorScheme.border, colorScheme.glow, activeIntensity),
        padding: "24px 24px 12px 24px",
        opacity,
        display: "flex",
        flexDirection: "column",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        flexShrink: 0,
        position: "relative",
        transition: "box-shadow 0.3s ease-out",
      }}
    >

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

      {/* Content - ExplainerLayout or CSS Grid */}
      {useExplainer ? (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <ExplainerLayout
            layout={layout!}
            nodes={nodes!}
            accentColor={colorScheme.accent}
          />
        </div>
      ) : (
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
      )}
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

// === GRADIENT ANIMATED LINE ===

const GradientLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  colorStart: string;
  colorEnd: string;
  frame: number;
  id: string;
}> = ({ x1, y1, x2, y2, progress, colorStart, colorEnd, frame, id }) => {
  const endX = x1 + (x2 - x1) * progress;
  const endY = y1 + (y2 - y1) * progress;
  const pulseOffset = (frame % 60) / 60;
  const gradientId = `gradient-${id}`;

  // Calculate gradient direction based on line direction
  const isHorizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);

  return (
    <g>
      <defs>
        <linearGradient
          id={gradientId}
          x1={isHorizontal ? "0%" : "50%"}
          y1={isHorizontal ? "50%" : "0%"}
          x2={isHorizontal ? "100%" : "50%"}
          y2={isHorizontal ? "50%" : "100%"}
        >
          <stop offset="0%" stopColor={colorStart} />
          <stop offset="100%" stopColor={colorEnd} />
        </linearGradient>
      </defs>
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={`url(#${gradientId})`} strokeWidth={8} strokeOpacity={0.2}
        strokeLinecap="round" filter="blur(6px)"
      />
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={`url(#${gradientId})`} strokeWidth={4} strokeOpacity={0.4}
        strokeLinecap="round" filter="blur(2px)"
      />
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round"
      />
      {progress > 0.1 && (
        <circle
          cx={x1 + (endX - x1) * pulseOffset}
          cy={y1 + (endY - y1) * pulseOffset}
          r={3}
          fill={pulseOffset < 0.5 ? colorStart : colorEnd}
          opacity={0.8}
        />
      )}
      {progress > 0.95 && (
        <circle cx={endX} cy={endY} r={5} fill={colorEnd} filter="url(#glow)" />
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

  // Calculate dynamic scale based on sticky size (smaller scale for larger stickies)
  const camViewW = 1920;
  const camViewH = 1080;
  const BADGE_HEIGHT = 38; // Badge above sticky (28px offset + 10px extra space)

  const getScaleForSticky = (stickyWidth: number, stickyHeight: number) => {
    // Account for badge in visual height
    const visualHeight = stickyHeight + BADGE_HEIGHT;

    // Calculate scale needed to fit sticky in viewport
    // We want: stickyWidth * scale = viewportWidth - padding
    // So: scale = (viewportWidth - padding) / stickyWidth
    // But we're scaling the CANVAS down, so SMALLER scale = more zoomed out
    const padding = 400; // generous padding around sticky
    const availableW = camViewW - padding;
    const availableH = camViewH - padding;

    // Scale needed to fit - take the smaller (more restrictive)
    const scaleToFitW = availableW / stickyWidth;
    const scaleToFitH = availableH / visualHeight;
    const scaleToFit = Math.min(scaleToFitW, scaleToFitH);

    // Cap between 0.7 and 0.95 - more zoomed in
    return Math.min(0.95, Math.max(0.7, scaleToFit));
  };

  // Generate camera keyframes from sticky positions
  // Camera Y accounts for badge: visual center = stickyY + (height - 28) / 2 = stickyY + height/2 - 14
  const getCameraY = (stickyHeight: number) => stickyY + stickyHeight / 2 - 14;

  const cameraKeyframes = [
    {
      frame: 0,
      x: stickyLayouts[0].x + stickyLayouts[0].width / 2,
      y: getCameraY(stickyLayouts[0].height),
      scale: getScaleForSticky(stickyLayouts[0].width, stickyLayouts[0].height) // same scale, no extra zoom
    },
    ...cfg.stickies.map((sticky, i) => {
      const firstSection = sticky.sections[0];
      const stickyScale = getScaleForSticky(stickyLayouts[i].width, stickyLayouts[i].height);
      return {
        frame: firstSection.startFrame - 5,
        x: stickyLayouts[i].x + stickyLayouts[i].width / 2,
        y: getCameraY(stickyLayouts[i].height),
        scale: stickyScale,
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

  // === ACTIVE INTENSITY (Highlight while voiceover discusses section) ===
  // Collect ALL sections across all stickies into flat array with their startFrames
  const allSections: { startFrame: number; stickyIndex: number; sectionIndex: number }[] = [];
  cfg.stickies.forEach((sticky, stickyIdx) => {
    sticky.sections.forEach((section, sectionIdx) => {
      allSections.push({ startFrame: section.startFrame, stickyIndex: stickyIdx, sectionIndex: sectionIdx });
    });
  });
  // Sort by startFrame
  allSections.sort((a, b) => a.startFrame - b.startFrame);

  // Get active intensity for a section
  // Returns: 0 = not visible, 0-1 = fading in, 1 = fully active, 1-0.3 = fading out, 0.3 = dimmed (past)
  const getActiveIntensity = (sectionStartFrame: number): number => {
    const MIN_ACTIVE_FRAMES = 30; // Minimum 1 second active (30fps)
    const FADE_IN_FRAMES = 10;    // 10 frame fade in
    const FADE_OUT_FRAMES = 10;   // 10 frame fade out
    const DIMMED_INTENSITY = 0.35; // Dimmed state for past sections

    // Find this section's index in sorted array
    const idx = allSections.findIndex(s => s.startFrame === sectionStartFrame);
    if (idx === -1) return DIMMED_INTENSITY;

    // Calculate when this section's "active" period ends
    const nextSection = allSections[idx + 1];
    const rawActiveUntil = nextSection ? nextSection.startFrame : cfg.totalFrames;
    const activeUntilFrame = Math.max(rawActiveUntil, sectionStartFrame + MIN_ACTIVE_FRAMES);

    // Not visible yet
    if (frame < sectionStartFrame) {
      return 0;
    }

    // Fade in period (first 10 frames after appear)
    if (frame < sectionStartFrame + FADE_IN_FRAMES) {
      return interpolate(
        frame,
        [sectionStartFrame, sectionStartFrame + FADE_IN_FRAMES],
        [DIMMED_INTENSITY, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
      );
    }

    // Fully active period
    if (frame < activeUntilFrame - FADE_OUT_FRAMES) {
      return 1;
    }

    // Fade out period (last 10 frames before next section)
    if (frame < activeUntilFrame) {
      return interpolate(
        frame,
        [activeUntilFrame - FADE_OUT_FRAMES, activeUntilFrame],
        [1, DIMMED_INTENSITY],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
      );
    }

    // Past active period - dimmed
    return DIMMED_INTENSITY;
  };

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
          // Camera centering: position canvas so camera point is at screen center
          // Offset to push view right (+) so sticky is more centered
          left: viewportWidth / 2 - cameraX * cameraScale + 450,
          top: viewportHeight / 2 - cameraY * cameraScale + 150,
          transform: `scale(${cameraScale})`,
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
              showStepPrefix={cfg.showStepPrefix !== false} // default true
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
                  const sectionCount = sticky.sections.length;

                  // Get colors from both sections (icon-based)
                  const color1 = getColorSchemeForSection(i, section.nodes[0]?.icon);
                  const color2 = getColorSchemeForSection(i + 1, nextSection.nodes[0]?.icon);

                  // Get CLOCKWISE grid positions
                  const gridPos1 = getClockwiseGridPos(i, sectionCount, cols);
                  const gridPos2 = getClockwiseGridPos(i + 1, sectionCount, cols);

                  let x1: number, y1: number, x2: number, y2: number;

                  if (gridPos1.row === gridPos2.row) {
                    // Same row - horizontal line
                    if (gridPos2.col > gridPos1.col) {
                      // Going right: 0→1
                      x1 = pos1.right; y1 = pos1.cy;
                      x2 = pos2.x; y2 = pos2.cy;
                    } else {
                      // Going left: 2→3
                      x1 = pos1.x; y1 = pos1.cy;
                      x2 = pos2.right; y2 = pos2.cy;
                    }
                  } else {
                    // Different rows - vertical line (90° angle, NOT diagonal!)
                    if (gridPos2.row > gridPos1.row) {
                      // Going down: 1→2
                      x1 = pos1.cx; y1 = pos1.bottom;
                      x2 = pos2.cx; y2 = pos2.y;
                    } else {
                      // Going up: 3→0 (if looping)
                      x1 = pos1.cx; y1 = pos1.y;
                      x2 = pos2.cx; y2 = pos2.bottom;
                    }
                  }

                  return (
                    <AnimatedLine
                      key={`internal-line-${stickyIndex}-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      progress={getLineProgress(lineStartFrame)}
                      color={color2.accent}
                      frame={frame}
                    />
                  );
                })}
              </svg>

              {sticky.sections.map((section, sectionIndex) => {
                // Use icon-based color instead of colorKey from config
                const firstIcon = section.nodes[0]?.icon;
                const colorScheme = getColorSchemeForSection(sectionIndex, firstIcon);
                const sectionAppearFrame = section.startFrame - 5;
                const pos = sectionPositions[sectionIndex];

                // Calculate highlight intensity for this section
                const intensity = getActiveIntensity(section.startFrame);

                // Base scale from appear animation + subtle "active" scale boost
                const baseScale = getScale(sectionAppearFrame);
                const activeScaleBoost = interpolate(intensity, [0.35, 1], [0, 0.02], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }); // Active sections get 2% larger
                const finalScale = baseScale * (1 + activeScaleBoost);

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
                    scale={finalScale}
                    activeIntensity={intensity}
                    layout={section.layout}
                    nodes={section.nodes}
                  >
                    {/* Fallback: render NodeItems if no layout specified */}
                    {(!section.layout || section.layout === "grid") && section.nodes.map((node, nodeIndex) => {
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
