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
import CodeBlockVisual from "./visuals/CodeBlockVisual";
import TerminalVisual from "./visuals/TerminalVisual";
import ListVisual from "./visuals/ListVisual";
import KineticTypography from "./visuals/KineticTypography";
import TableVisual from "./visuals/TableVisual";
import BarChartVisual from "./visuals/BarChartVisual";
import PieChartVisual from "./visuals/PieChartVisual";
import StatsVisual from "./visuals/StatsVisual";
import TimelineVisual from "./visuals/TimelineVisual";
import HierarchyVisual from "./visuals/HierarchyVisual";
import ProcessStepsVisual from "./visuals/ProcessStepsVisual";
import LogoGridVisual from "./visuals/LogoGridVisual";
import SplitScreenVisual from "./visuals/SplitScreenVisual";
import ServiceMeshVisual from "./visuals/ServiceMeshVisual";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube, type Icon as PhosphorIcon } from "@phosphor-icons/react";

// Maps common Lucide/shorthand names → Phosphor PascalCase names
const ICON_ALIASES: Record<string, string> = {
  sparkles: "Sparkle",
  layers: "Stack",
  server: "HardDrives",
  alerttriangle: "Warning",
  settings: "Gear",
  zap: "Lightning",
  search: "MagnifyingGlass",
  refreshcw: "ArrowsClockwise",
  ship: "Boat",
  music: "MusicNote",
  menu: "List",
  gitmergeconflict: "GitMerge",
  dollarsign: "CurrencyDollar",
  workflow: "GitFork",
  alertcircle: "Warning",
  infocircle: "Info",
  globe: "Globe",
  network: "ShareNetwork",
  plug: "PlugsConnected",
  link: "Link",
  wifi: "WifiHigh",
  container: "Package",
  video: "VideoCamera",
  film: "FilmStrip",
  camera: "VideoCamera",
  frame: "FrameCorners",
  clapperboard: "FilmStrip",
  filevideo: "VideoCamera",
  type: "TextT",
  textcursorinput: "Textbox",
  messagesquaretext: "Textbox",
  captions: "Textbox",
  grid3x3: "GridFour",
  layoutgrid: "GridFour",
  merge: "GitMerge",
  focus: "Target",
  cloudy: "Cloud",
  boxes: "Package",
  box: "Cube",
  orbit: "Atom",
  clockcheck: "CheckCircle",
  move3d: "CubeTransparent",
  arrowright: "ArrowRight",
  gitbranch: "GitBranch",
  gitmerge: "GitMerge",
  gitcommit: "GitCommit",
  pencilline: "PencilLine",
  filetext: "File",
};

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
  connectorAfter?: string; // Optional: label shown on connector after this node
  startFrame?: number; // Optional: used by ExplainerLayout
}

// Connection types available at all levels (node, section, sticky)
type ConnectionType = 'flow' | 'arrow' | 'vs' | 'bidirectional' | 'combine' | 'none';

// Direction for sticky positioning
type StickyDirection = 'right' | 'below' | 'left';

interface SectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  colorKey?: string;
  startFrame: number;
  endFrame?: number; // Optional: for visual progress animation
  layout?: string; // Optional: flow, arrow, vs, combine, negation, if-else, merge, bidirectional, filter
  visualType?: string; // Optional: "nodes" (default), "timeline", "table", "list", "logo-grid"
  visualData?: any; // Data for non-node visual types
  connectionToNext?: ConnectionType; // Connection to next section within same sticky
  nodes?: NodeConfig[]; // Optional: not present for visualType sections
}

interface StickyConfig {
  step: number;
  title: string;
  color: string;
  startFrame?: number;
  direction?: StickyDirection; // Direction to next sticky (default: "right")
  connectionToNext?: ConnectionType; // Connection type to next sticky
  sections: SectionConfig[];
}

interface BrandStyleConfig {
  stickyBorder?: boolean;
  stickyBorderRadius?: number;
  stickyBorderWidth?: number;
  stickyBorderStyle?: string;
  sectionBorder?: boolean;
  sectionBorderRadius?: number;
  glass?: {
    enabled?: boolean;
    blur?: number;
    borderOpacity?: number;
    glowIntensity?: number;
  };
  nodeShape?: string;
  nodeIconSize?: number;
  shadow?: boolean;
}

interface BrandConfig {
  name?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    backgroundGradient?: string;
    text?: string;
    textMuted?: string;
    stickyColors?: string[];
  };
  font?: {
    heading?: string;
    body?: string;
    code?: string;
  };
  style?: BrandStyleConfig;
  logo?: {
    path?: string;
    watermarkPosition?: string;
    watermarkOpacity?: number;
  };
}

interface TranscriptWord {
  word: string;
  start: number; // seconds
  end: number;   // seconds
}

interface Config {
  title: string;
  subtitle?: string;
  fps: number;
  totalFrames: number;
  showStepPrefix?: boolean;
  stickies: StickyConfig[];
  brand?: BrandConfig;
  transcriptWords?: TranscriptWord[];
}

// === THEME (reads brand config, falls back to defaults) ===

const _brandCfg = config as Config;
const brand = _brandCfg.brand || {};
const brandColors = brand.colors || {};
const brandFont = brand.font || {};
const brandStyle = brand.style || {};
const brandGlass = brandStyle.glass || {};

const theme = {
  bg: brandColors.background || "#030305",
  bgGradient: brandColors.backgroundGradient || "radial-gradient(ellipse at 50% 0%, #0a1628 0%, #030305 70%)",
  text: brandColors.text || "#f8fafc",
  textMuted: brandColors.textMuted || "#94a3b8",
  fontHeading: brandFont.heading || "'SF Mono', 'Fira Code', monospace",
  fontBody: brandFont.body || "'Inter', -apple-system, sans-serif",
  fontCode: brandFont.code || "'JetBrains Mono', 'Fira Code', monospace",
  stickyBorder: brandStyle.stickyBorder !== false,
  stickyBorderRadius: brandStyle.stickyBorderRadius ?? 20,
  stickyBorderWidth: brandStyle.stickyBorderWidth ?? 1.5,
  stickyBorderStyle: brandStyle.stickyBorderStyle || "solid",
  sectionBorderRadius: brandStyle.sectionBorderRadius ?? 20,
  glassEnabled: brandGlass.enabled !== false,
  glassBlur: brandGlass.blur ?? 16,
  glassBorderOpacity: brandGlass.borderOpacity ?? 0.37,
  glassGlowIntensity: brandGlass.glowIntensity ?? 1.0,
  shadow: brandStyle.shadow !== false,
  nodeIconSize: brandStyle.nodeIconSize ?? 56,
  nodeShape: brandStyle.nodeShape || "rounded",
  stickyColors: brandColors.stickyColors,
  logoPath: brand.logo?.path || "",
  logoPosition: brand.logo?.watermarkPosition || "bottom-right",
  logoOpacity: brand.logo?.watermarkOpacity ?? 0.3,
};

// === COLORS ===

const colors = {
  bg: theme.bg,
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

  text: theme.text,
  textMuted: theme.textMuted,
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
  const isActive = activeIntensity > 0.5;
  const glowStrength = isActive ? (activeIntensity - 0.5) * 2 : 0;

  const borderWidth = theme.stickyBorderWidth;
  const borderHex = Math.round((theme.glassBorderOpacity + (isActive ? 0.15 : 0)) * 255).toString(16).padStart(2, '0');

  const glowBase = glowColor.replace(/[\d.]+\)$/, '');
  const gi = theme.glassGlowIntensity;

  const coloredGlow = isActive && theme.shadow
    ? `0 0 ${Math.round((40 + glowStrength * 40) * gi)}px ${glowBase}${(0.3 + glowStrength * 0.2).toFixed(2)}),
       0 0 ${Math.round((60 + glowStrength * 60) * gi)}px ${glowBase}${(0.15 + glowStrength * 0.15).toFixed(2)}),`
    : '';

  const baseShadow = theme.shadow
    ? `0 8px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.2)`
    : 'none';

  return {
    ...(theme.glassEnabled ? {
      backdropFilter: `blur(${theme.glassBlur}px) saturate(180%)`,
      WebkitBackdropFilter: `blur(${theme.glassBlur}px) saturate(180%)`,
    } : {}),
    ...(theme.stickyBorder ? {
      border: `${borderWidth}px ${theme.stickyBorderStyle} ${borderColor}${borderHex}`,
    } : {}),
    boxShadow: coloredGlow ? `${coloredGlow} ${baseShadow}` : baseShadow,
    borderRadius: theme.stickyBorderRadius,
  };
};

// === DYNAMIC SIZING ===

const ITEM_WIDTH = 85;
const ITEM_HEIGHT = 100;
const GAP = 20;
const PADDING_X = 32;
const PADDING_Y = 24;
const HEADER_HEIGHT = 40;
const MIN_WIDTH = 180;
const MIN_HEIGHT = 120;

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
  const height = Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + contentHeight + PADDING_Y);
  return { width, height };
};

// Visual type content sizes — returns size based on shapeMode
// SQUARE ≈ 250x250 (compact, fits in grid)  WIDE ≈ 400x150 (horizontal, fills row)
const getVisualContentSize = (visualType: string, visualData: any, shapeMode?: "square" | "wide"): { width: number; height: number } => {
  const S = shapeMode === "wide" ? "wide" : shapeMode === "square" ? "square" : undefined;

  switch (visualType) {
    case "code-block": {
      const lines = (visualData?.code || "").split("\n").length;
      if (S === "wide") return { width: 450, height: Math.max(120, Math.min(lines, 6) * 22 + 60) };
      return { width: 300, height: Math.max(160, lines * 22 + 60) };
    }
    case "terminal": {
      const cmds = visualData?.commands?.length || 1;
      if (S === "wide") return { width: 450, height: Math.max(120, Math.min(cmds, 3) * 40 + 60) };
      return { width: 300, height: Math.max(160, cmds * 50 + 60) };
    }
    case "list": {
      const items = visualData?.items?.length || 1;
      if (S === "wide") return { width: 450, height: Math.max(120, Math.ceil(items / 2) * 36 + 40) };
      return { width: 260, height: Math.max(150, items * 36 + 40) };
    }
    case "kinetic": {
      const wordCount = (visualData?.text || "").split(/\s+/).length;
      if (S === "square") return { width: 250, height: Math.max(180, wordCount * 28 + 40) };
      return { width: 400, height: 120 };
    }
    case "table": {
      const rows = visualData?.rows?.length || 1;
      const cols = visualData?.headers?.length || 2;
      if (S === "square") return { width: Math.max(220, cols * 80), height: Math.max(160, (rows + 1) * 30 + 20) };
      return { width: Math.max(300, cols * 100 + 20), height: Math.max(120, (rows + 1) * 32 + 20) };
    }
    case "bar-chart": {
      const items = visualData?.items?.length || 1;
      if (S === "wide") return { width: Math.max(350, items * 80 + 40), height: 160 };
      return { width: 280, height: Math.max(150, items * 48 + 40) };
    }
    case "pie-chart":
      if (S === "square") return { width: 250, height: 300 };
      return { width: 400, height: 220 };
    case "stats": {
      const items = visualData?.items?.length || 1;
      if (S === "wide") return { width: Math.max(300, items * 130 + 40), height: 110 };
      // Square: compact grid, max 2 cols
      const sCols = Math.min(items, 2);
      const sRows = Math.ceil(items / sCols);
      return { width: Math.max(220, sCols * 110 + 30), height: Math.max(120, sRows * 80 + 30) };
    }
    case "timeline": {
      const items = visualData?.items?.length || 1;
      if (S === "square") return { width: 250, height: Math.max(160, items * 60 + 48) };
      return { width: Math.max(300, items * 85 + 48), height: 110 };
    }
    case "hierarchy":
      if (S === "wide") return { width: 450, height: 180 };
      return { width: 300, height: 240 };
    case "process-steps": {
      const steps = visualData?.steps?.length || 1;
      if (S === "wide") return { width: Math.max(350, steps * 90 + 40), height: 140 };
      return { width: 280, height: Math.max(180, steps * 55 + 48) };
    }
    case "logo-grid": {
      const items = visualData?.items?.length || 1;
      if (S === "wide") return { width: Math.max(300, items * 80 + 40), height: 110 };
      const gCols = items <= 3 ? items : items <= 6 ? 3 : 4;
      const gRows = Math.ceil(items / gCols);
      return { width: Math.max(220, gCols * 80 + 40), height: Math.max(120, gRows * 80 + 40) };
    }
    case "split-screen":
      if (S === "square") return { width: 260, height: 260 };
      return { width: 380, height: 180 };
    case "service-mesh": {
      const meshNodes = visualData?.nodes?.length || 1;
      const meshCols = S === "wide" ? Math.min(meshNodes, 4) : Math.min(meshNodes, 3);
      const meshRows = Math.ceil(meshNodes / meshCols);
      if (S === "wide") return { width: Math.max(350, meshCols * 154), height: Math.max(140, meshRows * 120) };
      return { width: Math.max(280, meshCols * 130), height: Math.max(200, meshRows * 126) };
    }
    default:
      return { width: 0, height: 0 };
  }
};

// Determine default shape for a section
const getDefaultShape = (section: SectionConfig): "square" | "wide" => {
  if (section.visualType) {
    switch (section.visualType) {
      case "code-block": case "terminal": case "list": case "bar-chart":
      case "process-steps": case "logo-grid": case "hierarchy": case "service-mesh":
        return "square";
      case "timeline": case "table": case "split-screen": case "kinetic":
      case "pie-chart":
        return "wide";
      case "stats":
        return (section.visualData?.items?.length || 0) <= 2 ? "wide" : "square";
      default:
        return "square";
    }
  }
  // Icons: flow/arrow/vs/combine/bidirectional = wide, if-else/merge = square
  const layout = section.layout || "grid";
  if (layout === "if-else" || layout === "merge") return "square";
  // flow with 4+ nodes could be wide but also works square
  const nodeCount = section.nodes?.length || 0;
  if (nodeCount >= 4) return "wide"; // 4+ nodes are naturally wide in flow
  return nodeCount <= 2 ? "square" : "wide";
};

// Determine shape mode for entire sticky (majority vote)
const getStickyShapeMode = (sections: SectionConfig[]): "square" | "wide" => {
  let sq = 0, wd = 0;
  for (const s of sections) {
    if (getDefaultShape(s) === "square") sq++; else wd++;
  }
  return sq >= wd ? "square" : "wide";
};

// Actual SectionBox size based on node count, layout type, or visual type
const getSectionBoxSize = (nodeCount: number, layout?: string, visualType?: string, visualData?: any, shapeMode?: "square" | "wide") => {
  // Visual type sizing
  if (visualType && visualType !== "nodes" && visualData) {
    const vs = getVisualContentSize(visualType, visualData, shapeMode);
    if (vs.width > 0) {
      return {
        width: Math.max(MIN_WIDTH, PADDING_X + vs.width),
        height: Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + vs.height + PADDING_Y),
      };
    }
  }
  // ExplainerLayout sizing
  if (layout && layout !== "grid") {
    const layoutSize = getLayoutSize(layout, nodeCount);
    if (layoutSize.width > 0) {
      return {
        width: Math.max(MIN_WIDTH, PADDING_X + layoutSize.width),
        height: Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + layoutSize.height + PADDING_Y),
      };
    }
  }
  // Fallback to grid sizing
  return getContainerSize(nodeCount);
};

// Sticky size based on sections — uses globalMaxH for uniform height
// LINEAR LAYOUT: all sections in a single row (left → right)
const getStickyDimensions = (sections: SectionConfig[], globalMaxH?: number) => {
  const sectionCount = sections.length;
  const cols = sectionCount; // Always single row — linear layout
  const rows = 1;
  const gap = 16;
  const paddingX = 24;
  const paddingY = 16;

  // Determine shape mode for this sticky, then size sections accordingly
  const stickyShapeMode = getStickyShapeMode(sections);
  const boxSizes = sections.map(s => getSectionBoxSize((s.nodes?.length || 0), s.layout, s.visualType, s.visualData, stickyShapeMode));

  // Calculate width: sum of widest section per column
  const colWidths: number[] = [];
  for (let c = 0; c < cols; c++) {
    let maxW = 0;
    for (let r = 0; r < rows; r++) {
      const idx = r * cols + c;
      if (idx < sectionCount) maxW = Math.max(maxW, boxSizes[idx].width);
    }
    colWidths.push(maxW);
  }
  // Use provided global max height or calculate from this sticky's sections
  const maxW = Math.max(...boxSizes.map(b => b.width));
  const maxH = globalMaxH || Math.max(...boxSizes.map(b => b.height));

  const width = paddingX + (maxW * cols) + ((cols - 1) * gap);
  const height = (paddingY * 2) + (maxH * rows) + ((rows - 1) * gap);

  return { width, height, cols, rows, boxW: maxW, boxH: maxH };
};

// LINEAR layout: all sections in a single row (left → right)
// No grid, no clockwise — just horizontal progression
const getLinearPos = (index: number, _total: number, _cols: number): { row: number; col: number } => {
  return { row: 0, col: index };
};

// Calculate section box positions within a sticky
// LINEAR layout: all sections left → right in a single row
const getSectionPositions = (
  sections: SectionConfig[],
  stickyWidth: number,
  stickyHeight: number,
  centerVertically: boolean,
  overrideMaxH?: number
) => {
  const sectionCount = sections.length;
  const cols = sectionCount; // Always single row — linear layout
  const rows = 1;
  const gap = 16;
  const padding = 16;

  // Per-section sizes (using sticky's shape mode for consistency)
  const stickyShapeMode2 = getStickyShapeMode(sections);
  const boxSizes = sections.map(s => getSectionBoxSize((s.nodes?.length || 0), s.layout, s.visualType, s.visualData, stickyShapeMode2));

  // Use override (global) max height if provided, otherwise local max
  const globalMaxW = Math.max(...boxSizes.map(b => b.width));
  const globalMaxH = overrideMaxH || Math.max(...boxSizes.map(b => b.height));
  const colWidths = Array(cols).fill(globalMaxW);
  const rowHeights = Array(rows).fill(globalMaxH);

  // Column X offsets (cumulative)
  const colX: number[] = [0];
  for (let c = 1; c < cols; c++) {
    colX.push(colX[c - 1] + globalMaxW + gap);
  }

  // Row Y offsets (cumulative)
  const rowY: number[] = [0];
  for (let r = 1; r < rows; r++) {
    rowY.push(rowY[r - 1] + globalMaxH + gap);
  }

  const totalGridW = colX[cols - 1] + globalMaxW;
  const totalGridH = rowY[rows - 1] + globalMaxH;

  const contentW = stickyWidth - (padding * 2);
  const contentH = stickyHeight - (padding * 2);

  const startX = padding + (contentW - totalGridW) / 2;
  const startY = padding + (contentH - totalGridH) / 2;

  const positions: { x: number; y: number; cx: number; cy: number; right: number; bottom: number; w: number; h: number }[] = [];

  for (let i = 0; i < sectionCount; i++) {
    const { row, col } = getLinearPos(i, sectionCount, cols);

    // Use GLOBAL max dimensions so ALL sections in sticky are uniform
    const maxW = Math.max(...colWidths);
    const maxH = Math.max(...rowHeights);
    const boxW = maxW;
    const boxH = maxH;

    // Cell position from per-col/per-row offsets
    const cellX = startX + colX[col];
    const cellY = startY + rowY[row];

    // No centering needed — box fills entire cell
    const x = cellX;
    const y = cellY;

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

  return { positions, cols, rows, maxBoxW: Math.max(...colWidths), maxBoxH: Math.max(...rowHeights), rowHeights };
};

// === ICON COMPONENT (PHOSPHOR) ===
// Dynamic lookup — works with all 1500+ Phosphor icons

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIcon = (type: string): React.FC<any> => {
  const lower = type.toLowerCase();
  const aliasName = ICON_ALIASES[lower];
  if (aliasName) {
    const aliased = (PhosphorIcons as Record<string, unknown>)[aliasName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (aliased) return aliased as React.FC<any>;
  }
  const pascal = type.charAt(0).toUpperCase() + type.slice(1);
  const direct = (PhosphorIcons as Record<string, unknown>)[pascal];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (direct) return direct as React.FC<any>;
  return Cube;
};

const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 28, color = "#fff" }) => {
  const iconStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 10px ${color}60) drop-shadow(0 0 20px ${color}30)`,
  };

  const IconComponent = getIcon(type);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <IconComponent size={size} color={color} weight={"duotone" as any} style={iconStyle} />;
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
      fontFamily: theme.fontHeading,
    }}>
      {showStepPrefix ? `Step ${step}: ${title}` : title}
    </div>

    {/* Content area */}
    <div style={{
      width: "100%",
      height: "100%",
      border: theme.stickyBorder ? `2px dashed ${color}40` : 'none',
      borderRadius: theme.sectionBorderRadius,
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
  activeIntensity?: number;
  layout?: string;
  nodes?: NodeConfig[];
  startFrame?: number;
  visualType?: string;
  visualData?: any;
  shapeMode?: "square" | "wide";
  progress?: number;
  overrideWidth?: number;
  overrideHeight?: number;
}> = ({ title, subtitle, colorScheme, children, opacity, scale, activeIntensity = 1, layout, nodes, startFrame, visualType, visualData, shapeMode, progress = 1, overrideWidth, overrideHeight }) => {
  const useVisual = visualType && visualType !== "nodes" && visualData;
  const useExplainer = !useVisual && layout && layout !== "grid" && nodes && nodes.length > 0;
  const childCount = useExplainer ? nodes!.length : React.Children.count(children);
  const autoSize = useVisual
    ? getSectionBoxSize(0, undefined, visualType, visualData, shapeMode)
    : useExplainer
    ? getSectionBoxSize(nodes!.length, layout)
    : getContainerSize(childCount);

  const finalWidth = overrideWidth || autoSize.width;
  const finalHeight = overrideHeight || autoSize.height;

  return (
    <div
      style={{
        width: finalWidth,
        height: finalHeight,
        background: colorScheme.bg,
        ...glassStyle(colorScheme.border, colorScheme.glow, activeIntensity),
        padding: 16,
        boxSizing: "border-box" as const,
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
          fontFamily: theme.fontHeading,
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
          fontFamily: theme.fontHeading,
        }}>
          {subtitle}
        </div>
      )}

      {/* Content - Visual Type, ExplainerLayout, or CSS Grid */}
      {useVisual ? (
        <div style={{
          flex: 1, display: "flex", alignItems: "stretch", justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* Visual content — fills the section */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            // Override child visual's own bg/border since SectionBox provides glassmorphism
            // Children use width:100% so they fill this container
          }}>
          {visualType === "code-block" && <CodeBlockVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "terminal" && <TerminalVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "list" && <ListVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "kinetic" && <KineticTypography {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "table" && <TableVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "bar-chart" && <BarChartVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "pie-chart" && <PieChartVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "stats" && <StatsVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "timeline" && <TimelineVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "hierarchy" && <HierarchyVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "process-steps" && <ProcessStepsVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "logo-grid" && <LogoGridVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          {visualType === "split-screen" && <SplitScreenVisual {...visualData} shapeMode={shapeMode} progress={progress} />}
          {visualType === "service-mesh" && <ServiceMeshVisual {...visualData} accentColor={colorScheme.border} shapeMode={shapeMode} progress={progress} />}
          </div>
        </div>
      ) : useExplainer ? (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <ExplainerLayout
            layout={layout!}
            nodes={nodes!}
            accentColor={colorScheme.border}
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
        fontFamily: theme.fontBody,
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

// === TRANSCRIPT OVERLAY (karaoke-style word highlight) ===
const TranscriptOverlay: React.FC<{
  words: TranscriptWord[];
  frame: number;
  fps: number;
}> = ({ words, frame, fps }) => {
  if (!words || words.length === 0) return null;

  const currentTime = frame / fps;

  // Find current word index
  let activeIdx = -1;
  for (let i = 0; i < words.length; i++) {
    if (currentTime >= words[i].start && currentTime <= words[i].end) {
      activeIdx = i;
      break;
    }
    // Between words — show the next word as upcoming
    if (i < words.length - 1 && currentTime > words[i].end && currentTime < words[i + 1].start) {
      activeIdx = i;
      break;
    }
  }

  // If before first word or after last word, hide
  if (activeIdx === -1 && currentTime < (words[0]?.start ?? 0)) return null;
  if (activeIdx === -1) activeIdx = words.length - 1;

  // Show window of words around active (6 before, 6 after)
  const windowSize = 6;
  const startIdx = Math.max(0, activeIdx - windowSize);
  const endIdx = Math.min(words.length - 1, activeIdx + windowSize);
  const visibleWords = words.slice(startIdx, endIdx + 1);

  const brandPrimary = brandColors.primary || "#3b82f6";
  const brandAccent = brandColors.accent || "#f59e0b";

  return (
    <div style={{
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      <div style={{
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(12px)",
        borderRadius: 12,
        padding: "12px 24px",
        maxWidth: "80%",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "4px 8px",
        border: `1px solid rgba(255,255,255,0.1)`,
      }}>
        {visibleWords.map((w, i) => {
          const globalIdx = startIdx + i;
          const isActive = globalIdx === activeIdx;
          const isPast = globalIdx < activeIdx;
          const wordTime = w.start;
          const isSpoken = currentTime >= wordTime;

          // Active word: brand accent with glow
          // Past words: regular text
          // Future words: muted
          let color = brandColors.textMuted || "#64748b";
          let fontWeight: number | string = 400;
          let textShadow = "none";
          let scale = 1;

          if (isActive) {
            color = brandAccent;
            fontWeight = 700;
            textShadow = `0 0 12px ${brandAccent}80, 0 0 4px ${brandAccent}40`;
            scale = 1.1;
          } else if (isPast || isSpoken) {
            color = brandColors.text || "#f8fafc";
            fontWeight = 400;
          }

          return (
            <span
              key={`tw-${globalIdx}`}
              style={{
                color,
                fontWeight,
                fontSize: 22,
                fontFamily: theme.fontBody,
                textShadow,
                transform: `scale(${scale})`,
                transition: "all 0.15s ease-out",
                display: "inline-block",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const DynamicPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cfg = config as Config;
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // Calculate sticky dimensions and 2D positions based on direction
  const stickyGap = 50;
  const startX = 80;
  const startY = 150;
  const BADGE_H = 38;

  // PRE-PASS: Calculate global max section height across ALL stickies
  let prePassMaxH = 0;
  for (const sticky of cfg.stickies) {
    const sm = getStickyShapeMode(sticky.sections);
    for (const sec of sticky.sections) {
      const size = getSectionBoxSize((sec.nodes?.length || 0), sec.layout, sec.visualType, sec.visualData, sm);
      prePassMaxH = Math.max(prePassMaxH, size.height);
    }
  }

  const stickyLayouts: { width: number; height: number; cols: number; rows: number; boxW: number; boxH: number; x: number; y: number }[] = [];
  for (let i = 0; i < cfg.stickies.length; i++) {
    const dims = getStickyDimensions(cfg.stickies[i].sections, prePassMaxH);
    if (i === 0) {
      stickyLayouts.push({ ...dims, x: startX, y: startY });
    } else {
      const prev = stickyLayouts[i - 1];
      const dir = cfg.stickies[i - 1].direction || "right";
      let x: number, y: number;
      switch (dir) {
        case "below":
          x = prev.x;
          y = prev.y + prev.height + BADGE_H + stickyGap;
          break;
        case "left":
          x = prev.x - dims.width - stickyGap;
          y = prev.y;
          break;
        case "right":
        default:
          x = prev.x + prev.width + stickyGap;
          y = prev.y;
          break;
      }
      stickyLayouts.push({ ...dims, x: Math.max(20, x), y });
    }
  }

  // Global max section height — already computed in pre-pass
  const globalMaxSectionHeight = prePassMaxH;

  // Canvas size = bounding box of ALL stickies (2D)
  const allLeft = Math.min(...stickyLayouts.map(s => s.x));
  const allRight = Math.max(...stickyLayouts.map(s => s.x + s.width));
  const allTop = Math.min(...stickyLayouts.map(s => s.y));
  const allBottom = Math.max(...stickyLayouts.map(s => s.y + s.height));
  const canvasWidth = allRight - Math.min(0, allLeft) + 200;
  const canvasHeight = allBottom + 100;

  // === CAMERA SYSTEM ===
  // Camera follows sections, not just stickies. Pans within sticky to active section.
  const camViewW = 1920;
  const camViewH = 1080;
  const BADGE_HEIGHT = 38;

  // Scale to fit entire sticky in viewport — NO minimum clamp that cuts content
  const getScaleForSticky = (stickyWidth: number, stickyHeight: number) => {
    const visualHeight = stickyHeight + BADGE_HEIGHT;
    const padding = 300;
    const scaleToFitW = (camViewW - padding) / stickyWidth;
    const scaleToFitH = (camViewH - padding) / visualHeight;
    // Always fit — no min clamp. Max 0.95 so we don't zoom in too much.
    return Math.min(0.95, Math.min(scaleToFitW, scaleToFitH));
  };

  // Get camera target for a specific section within a sticky
  const getSectionCameraTarget = (stickyIdx: number, sectionIdx: number) => {
    const layout = stickyLayouts[stickyIdx];
    const sticky = cfg.stickies[stickyIdx];
    const stickyScale = getScaleForSticky(layout.width, layout.height);

    // Sticky center (default target)
    const stickyCenterX = layout.x + layout.width / 2;
    const stickyCenterY = layout.y + layout.height / 2 - 14;

    // If only 1-2 sections, just center on sticky — no need to pan
    if (sticky.sections.length <= 2) {
      return { x: stickyCenterX, y: stickyCenterY, scale: stickyScale };
    }

    // For 3+ sections, pan toward active section while keeping scale
    const { positions } = getSectionPositions(sticky.sections, layout.width, layout.height, sticky.sections.length <= 2, globalMaxSectionHeight);
    const pos = positions[sectionIdx];
    if (!pos) return { x: stickyCenterX, y: stickyCenterY, scale: stickyScale };

    // Blend: 70% sticky center + 30% section position — gentle pan, not a jump
    const sectionCenterY = layout.y + pos.y + pos.h / 2;
    const blendedY = stickyCenterY * 0.5 + sectionCenterY * 0.5;

    return { x: stickyCenterX, y: blendedY, scale: stickyScale };
  };

  // Group focus: zoom out to show 2 stickies together (for VS/bidirectional)
  const getGroupCameraTarget = (idxA: number, idxB: number) => {
    const a = stickyLayouts[idxA];
    const b = stickyLayouts[idxB];
    const groupLeft = Math.min(a.x, b.x);
    const groupRight = Math.max(a.x + a.width, b.x + b.width);
    const groupTop = Math.min(a.y, b.y) - BADGE_H;
    const groupBottom = Math.max(a.y + a.height, b.y + b.height);
    const groupW = groupRight - groupLeft;
    const groupH = groupBottom - groupTop;
    const scale = Math.min(0.7, Math.min((camViewW - 200) / groupW, (camViewH - 200) / groupH));
    return {
      x: (groupLeft + groupRight) / 2,
      y: (groupTop + groupBottom) / 2,
      scale,
    };
  };

  // Detect groups (VS/bidirectional/combine pairs)
  const groupStickies = new Set<number>();
  cfg.stickies.forEach((sticky, i) => {
    const conn = sticky.connectionToNext;
    if (conn === "vs" || conn === "bidirectional" || conn === "combine") {
      groupStickies.add(i);
      groupStickies.add(i + 1);
    }
  });

  // Build camera keyframes: one per section + group overviews
  const cameraKeyframes: { frame: number; x: number; y: number; scale: number }[] = [];

  // Frame 0: start on first sticky
  const firstTarget = getSectionCameraTarget(0, 0);
  cameraKeyframes.push({ frame: 0, ...firstTarget });

  // One keyframe per section + group overview keyframes
  cfg.stickies.forEach((sticky, stickyIdx) => {
    // If this sticky is the FIRST in a group (VS/bidirectional), add group overview before it
    const prevConn = stickyIdx > 0 ? cfg.stickies[stickyIdx - 1].connectionToNext : undefined;
    if (prevConn === "vs" || prevConn === "bidirectional" || prevConn === "combine") {
      // This is the SECOND sticky in a group — group overview was already added before first
    } else if (sticky.connectionToNext === "vs" || sticky.connectionToNext === "bidirectional") {
      // This is the FIRST sticky in a group — add group overview
      const groupTarget = getGroupCameraTarget(stickyIdx, stickyIdx + 1);
      const groupFrame = Math.max(1, sticky.sections[0].startFrame - 30);
      cameraKeyframes.push({ frame: groupFrame, ...groupTarget });
    }

    sticky.sections.forEach((section, sectionIdx) => {
      const target = getSectionCameraTarget(stickyIdx, sectionIdx);
      cameraKeyframes.push({ frame: Math.max(1, section.startFrame - 15), ...target });
    });
  });

  // End: zoom out to overview showing all stickies (2D bounding box)
  const overviewW = allRight - allLeft;
  const overviewH = allBottom - allTop + BADGE_H;
  const overviewScale = Math.min(0.5, Math.min((camViewW - 200) / overviewW, (camViewH - 200) / overviewH));
  const overviewX = (allLeft + allRight) / 2;
  const overviewY = (allTop + allBottom) / 2;
  // Zoom out 60 frames before end
  cameraKeyframes.push({ frame: Math.max(cameraKeyframes[cameraKeyframes.length - 1].frame + 60, cfg.totalFrames - 60), x: overviewX, y: overviewY, scale: overviewScale });

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
        background: theme.bgGradient || `radial-gradient(ellipse 120% 100% at 50% 0%, ${colors.bgGradient1} 0%, ${colors.bg} 50%, #000 100%)`,
        overflow: "hidden",
        fontFamily: theme.fontBody,
      }}
    >
      <MeshGradient />
      <GridBackground />

      <div
        style={{
          width: canvasWidth,
          height: canvasHeight,
          position: "absolute",
          // Camera centering: position canvas so camera target is at screen center
          left: viewportWidth / 2 - cameraX * cameraScale,
          top: viewportHeight / 2 - cameraY * cameraScale,
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
            const curr = stickyLayouts[i];
            const next = stickyLayouts[i + 1];
            const nextSticky = cfg.stickies[i + 1];
            const lineStartFrame = nextSticky.sections[0].startFrame - 10;
            const dir = sticky.direction || "right";
            const conn = sticky.connectionToNext || "flow";

            // Skip if no connection
            if (conn === "none") return null;

            // Direction-aware endpoints
            let x1: number, y1: number, x2: number, y2: number;
            switch (dir) {
              case "below":
                x1 = curr.x + curr.width / 2;
                y1 = curr.y + curr.height;
                x2 = next.x + next.width / 2;
                y2 = next.y;
                break;
              case "left":
                x1 = curr.x;
                y1 = curr.y + curr.height / 2;
                x2 = next.x + next.width;
                y2 = next.y + next.height / 2;
                break;
              case "right":
              default:
                x1 = curr.x + curr.width;
                y1 = curr.y + curr.height / 2;
                x2 = next.x;
                y2 = next.y + next.height / 2;
                break;
            }

            return (
              <AnimatedLine
                key={`line-${i}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
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

          // Shape mode for this sticky (all sections use same shape)
          const stickyShape = getStickyShapeMode(sticky.sections);

          // Calculate section positions for internal lines — use global max height for uniform sizing
          const { positions: sectionPositions, cols } = getSectionPositions(
            sticky.sections,
            layout.width,
            layout.height,
            centerVertically,
            globalMaxSectionHeight
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
                  const color1 = getColorSchemeForSection(i, section.nodes?.[0]?.icon);
                  const color2 = getColorSchemeForSection(i + 1, nextSection.nodes?.[0]?.icon);

                  // LINEAR layout: always horizontal lines (left → right)
                  const x1 = pos1.right;
                  const y1 = pos1.cy;
                  const x2 = pos2.x;
                  const y2 = pos2.cy;

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
                const firstIcon = section.nodes?.[0]?.icon;
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

                // Calculate progress for visual components (0→1 over section duration)
                const nextSectionFrame = sectionIndex < sticky.sections.length - 1
                  ? sticky.sections[sectionIndex + 1].startFrame
                  : (section.endFrame || section.startFrame + 90);
                const sectionDuration = Math.max(30, nextSectionFrame - section.startFrame);
                const visualProgress = section.visualType
                  ? interpolate(frame, [section.startFrame, section.startFrame + sectionDuration], [0, 1], {
                      extrapolateLeft: "clamp", extrapolateRight: "clamp",
                    })
                  : 1;

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
                    nodes={section.nodes || []}
                    startFrame={section.startFrame}
                    visualType={section.visualType}
                    visualData={section.visualData}
                    shapeMode={stickyShape}
                    progress={visualProgress}
                    overrideWidth={pos.w}
                    overrideHeight={pos.h}
                  >
                    {/* Fallback: render NodeItems if no layout specified */}
                    {!section.visualType && (!section.layout || section.layout === "grid") && (section.nodes || []).map((node, nodeIndex) => {
                      const nodeDelay = section.startFrame + (nodeIndex * 10);
                      return (
                        <NodeItem
                          key={`node-${stickyIndex}-${sectionIndex}-${nodeIndex}`}
                          label={node.label}
                          icon={node.icon}
                          opacity={getOpacity(nodeDelay)}
                          accentColor={colorScheme.border}
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

      {/* Transcript Overlay */}
      {cfg.transcriptWords && cfg.transcriptWords.length > 0 && (
        <TranscriptOverlay words={cfg.transcriptWords} frame={frame} fps={fps} />
      )}

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
