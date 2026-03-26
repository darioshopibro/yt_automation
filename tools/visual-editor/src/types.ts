export interface NodeItem {
  label: string;
  icon: string;
  color?: string;
  connectorAfter?: string;
}

export interface Section {
  id: string;
  title: string;
  subtitle?: string;
  colorKey?: string;
  layout: string;
  startFrame: number;
  nodes: NodeItem[];
}

export interface Sticky {
  step: number;
  title: string;
  color: string;
  startFrame?: number;
  sections: Section[];
}

export interface DynamicConfig {
  title: string;
  subtitle?: string;
  fps: number;
  totalFrames: number;
  showStepPrefix: boolean;
  stickies: Sticky[];
}

export const LAYOUT_OPTIONS = [
  'flow',
  'arrow',
  'vs',
  'combine',
  'negation',
  'if-else',
  'merge',
  'bidirectional',
  'filter',
] as const;

export const NODE_COLORS = [
  { value: '', label: 'Default' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'purple', label: 'Purple' },
  { value: 'red', label: 'Red' },
] as const;

export const STICKY_COLOR_PRESETS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

export type ColorScheme = {
  bg: string;
  border: string;
  glow: string;
  accent: string;
};

export const colorSchemes: Record<string, ColorScheme> = {
  userQuery: { bg: "linear-gradient(145deg, #1a1a2e, #16213e, #0f0f23)", border: "#3b82f6", glow: "rgba(59,130,246,0.4)", accent: "#60a5fa" },
  embedding: { bg: "linear-gradient(145deg, #0f3d3d, #082828, #051a1a)", border: "#10b981", glow: "rgba(16,185,129,0.4)", accent: "#34d399" },
  vectorSearch: { bg: "linear-gradient(145deg, #3d2a0f, #2d1b08, #1a1005)", border: "#f59e0b", glow: "rgba(245,158,11,0.4)", accent: "#fbbf24" },
  retrieve: { bg: "linear-gradient(145deg, #3d1a3d, #2d1b3d, #1a0f1a)", border: "#a855f7", glow: "rgba(168,85,247,0.4)", accent: "#c084fc" },
  augment: { bg: "linear-gradient(145deg, #2d1a0f, #3d2d1b, #1a1005)", border: "#f97316", glow: "rgba(249,115,22,0.4)", accent: "#fb923c" },
  generate: { bg: "linear-gradient(145deg, #1a2d1a, #0f3d0f, #051a05)", border: "#22c55e", glow: "rgba(34,197,94,0.4)", accent: "#4ade80" },
};

export const colorRotation = ["userQuery", "embedding", "vectorSearch", "retrieve", "augment", "generate"];

export const layoutColors: Record<string, string> = {
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  line: "#475569",
  text: "#f8fafc",
  textMuted: "#94a3b8",
};

export function getColorSchemeForSection(globalSectionIndex: number, colorKey?: string): ColorScheme {
  if (colorKey && colorSchemes[colorKey]) {
    return colorSchemes[colorKey];
  }
  const key = colorRotation[globalSectionIndex % colorRotation.length];
  return colorSchemes[key];
}

export function getColorValue(colorKey?: string, fallback: string = "#3b82f6"): string {
  if (!colorKey) return fallback;
  return layoutColors[colorKey] || fallback;
}

// === Brand Config ===

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundGradient: string;
  text: string;
  textMuted: string;
  stickyColors: string[];
}

export interface BrandLogo {
  path: string;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  watermarkOpacity: number;
}

export interface BrandFont {
  heading: string;
  body: string;
  code: string;
}

export interface BrandGlass {
  enabled: boolean;
  blur: number;
  borderOpacity: number;
  glowIntensity: number;
}

export interface BrandStyle {
  stickyBorder: boolean;
  stickyBorderRadius: number;
  stickyBorderWidth: number;
  stickyBorderStyle: 'solid' | 'dashed' | 'dotted' | 'none';
  sectionBorder: boolean;
  sectionBorderRadius: number;
  glass: BrandGlass;
  nodeShape: 'rounded' | 'square' | 'circle';
  nodeIconSize: number;
  connectorStyle: 'arrow' | 'line' | 'dotted';
  shadow: boolean;
  backgroundPattern: 'none' | 'dots' | 'grid' | 'noise';
}

export interface BrandConfig {
  name: string;
  colors: BrandColors;
  logo: BrandLogo;
  font: BrandFont;
  style: BrandStyle;
  intro: { videoPath: string };
  outro: { videoPath: string };
}
