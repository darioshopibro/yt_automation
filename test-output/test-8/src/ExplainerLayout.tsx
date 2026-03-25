/**
 * EXPLAINER LAYOUTS
 * Vizualne veze između ikonica za objašnjavanje koncepata
 *
 * Layouts:
 * - flow: A → B → C (sequence)
 * - arrow: A → B (simple)
 * - vs: A vs B (comparison)
 * - combine: A + B = C (combination)
 * - negation: ✗A → B (bad to good)
 * - if-else: A → [B, C] (split/branch)
 * - merge: [A, B] → C (join)
 * - bidirectional: A ↔ B (two-way)
 * - filter: A ▷ B (filtered)
 */

import React from "react";
import {
  ICON_SIZE,
  ICON_CENTER,
  NODE_GAP,
  NODE_HEIGHT,
  STACK_GAP,
  STACKED_HEIGHT,
  STACKED_TOP_CENTER,
  STACKED_BOTTOM_CENTER,
  STACKED_MIDDLE,
  CONNECTOR_GAP,
  layoutColors,
  type LayoutColorKey,
} from "./dimensions";

// === TYPES ===

export interface NodeConfig {
  label: string;
  icon: string;
  color?: string; // blue, green, orange, purple, red
}

export interface ExplainerLayoutProps {
  layout: string;
  nodes: NodeConfig[];
  accentColor?: string; // Default color from section
}

// Helper to get color value from string key
const getColor = (colorKey?: string, fallback: string = layoutColors.blue): string => {
  if (!colorKey) return fallback;
  return (layoutColors as Record<string, string>)[colorKey] || fallback;
};

// === ICON COMPONENT (35 icons) ===

const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({
  type,
  size = 26,
  color = "#fff",
}) => {
  const s = { filter: `drop-shadow(0 0 8px ${color}40)` };
  const icons: Record<string, React.ReactNode> = {
    // === ORIGINAL 8 ===
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    database: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    cube: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>,
    sparkle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={s}><polyline points="20 6 9 17 4 12"/></svg>,

    // === LUCIDE 15 ===
    server: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>,
    cloud: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z"/></svg>,
    gitBranch: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>,
    gitMerge: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    monitor: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="20" height="14" x="2" y="3" rx="2" ry="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>,
    refreshCw: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
    layers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    cpu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="16" height="16" x="4" y="4" rx="2" ry="2"/><rect width="6" height="6" x="9" y="9" rx="1" ry="1"/><line x1="9" x2="9" y1="1" y2="4"/><line x1="15" x2="15" y1="1" y2="4"/><line x1="9" x2="9" y1="20" y2="23"/><line x1="15" x2="15" y1="20" y2="23"/><line x1="20" x2="23" y1="9" y2="9"/><line x1="20" x2="23" y1="14" y2="14"/><line x1="1" x2="4" y1="9" y2="9"/><line x1="1" x2="4" y1="14" y2="14"/></svg>,
    terminal: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>,
    globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    code: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,

    // === CUSTOM 12 ===
    api: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/></svg>,
    webhook: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 012 14c0-2.21 1.79-4 4-4 .74 0 1.43.2 2.02.55"/><path d="M9 17c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3c.48 0 .93.12 1.33.32"/><path d="M14 8.14c.09-1.88.92-3.14 2.59-3.14 2.21 0 4 1.79 4 4 0 1.45-.78 2.73-1.93 3.43"/><circle cx="12" cy="12" r="3"/></svg>,
    queue: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>,
    network: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/><line x1="7" y1="19" x2="17" y2="19"/></svg>,
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M12 5a3 3 0 100-6 3 3 0 000 6z" transform="translate(0,5)"/><path d="M9 10c-3 0-5 2-5 5s2 5 5 5"/><path d="M15 10c3 0 5 2 5 5s-2 5-5 5"/><path d="M12 10v10"/><path d="M9 14h6"/><path d="M9 18h6"/></svg>,
    vector: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    arrowRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    container: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6.01" y2="10"/><line x1="10" y1="10" x2="10.01" y2="10"/><line x1="14" y1="10" x2="14.01" y2="10"/><line x1="6" y1="14" x2="6.01" y2="14"/><line x1="10" y1="14" x2="10.01" y2="14"/></svg>,
    package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    messageSquare: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  };
  return <>{icons[type] || null}</>;
};

// === NODE COMPONENT ===

const Node: React.FC<{ label: string; icon: string; color?: string }> = ({
  label,
  icon,
  color = layoutColors.blue,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: NODE_GAP }}>
    <div
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: 14,
        background: `linear-gradient(145deg, ${color}25 0%, ${color}10 100%)`,
        border: `1.5px solid ${color}50`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 20px ${color}30`,
      }}
    >
      <Icon type={icon} size={26} color={color} />
    </div>
    <span
      style={{
        fontSize: 11,
        color: layoutColors.text,
        fontWeight: 500,
        textAlign: "center",
        maxWidth: 70,
      }}
    >
      {label}
    </span>
  </div>
);

// === NEGATED NODE (with X overlay) ===

const NegatedNode: React.FC<{ label: string; icon: string }> = ({ label, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: NODE_GAP }}>
    <div style={{ position: "relative" }}>
      <div
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: 14,
          background: `linear-gradient(145deg, ${layoutColors.red}15 0%, ${layoutColors.red}05 100%)`,
          border: `1.5px solid ${layoutColors.red}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.5,
        }}
      >
        <Icon type={icon} size={26} color={layoutColors.red} />
      </div>
      <div
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: layoutColors.red,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 10px ${layoutColors.red}`,
        }}
      >
        <Icon type="x" size={12} color="#fff" />
      </div>
    </div>
    <span style={{ fontSize: 11, color: layoutColors.textMuted, textDecoration: "line-through" }}>
      {label}
    </span>
  </div>
);

// === CONNECTOR WRAP (centers arrow with icon) ===

const ConnectorWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ height: ICON_SIZE, display: "flex", alignItems: "center" }}>{children}</div>
);

// === CONNECTORS ===

const Arrow: React.FC = () => (
  <svg width={40} height={20} viewBox="0 0 40 20">
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#ffffff" />
      </marker>
    </defs>
    <line x1="0" y1="10" x2="32" y2="10" stroke="#ffffff" strokeWidth="2" markerEnd="url(#arrowhead)" />
  </svg>
);

const BiArrow: React.FC = () => (
  <svg width={40} height={20} viewBox="0 0 40 20">
    <defs>
      <marker id="arrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
        <path d="M6,0 L0,3 L6,6 Z" fill="#ffffff" />
      </marker>
      <marker id="arrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff" />
      </marker>
    </defs>
    <line x1="8" y1="10" x2="32" y2="10" stroke="#ffffff" strokeWidth="2" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
  </svg>
);

const FilterArrow: React.FC = () => (
  <svg width={40} height={20} viewBox="0 0 40 20">
    <polygon points="5,2 5,18 25,10" fill="none" stroke="#ffffff" strokeWidth="2" />
    <line x1="25" y1="10" x2="38" y2="10" stroke="#ffffff" strokeWidth="2" />
  </svg>
);

const VsSymbol: React.FC = () => (
  <div
    style={{
      fontSize: 16,
      fontWeight: 800,
      color: "#ffffff",
      textShadow: "0 0 10px rgba(255,255,255,0.4)",
      padding: "0 8px",
    }}
  >
    vs
  </div>
);

const PlusSymbol: React.FC = () => (
  <div
    style={{
      fontSize: 20,
      fontWeight: 700,
      color: "#ffffff",
      textShadow: "0 0 10px rgba(255,255,255,0.4)",
      padding: "0 4px",
    }}
  >
    +
  </div>
);

const EqualsSymbol: React.FC = () => (
  <div
    style={{
      fontSize: 20,
      fontWeight: 700,
      color: "#ffffff",
      textShadow: "0 0 10px rgba(255,255,255,0.4)",
      padding: "0 4px",
    }}
  >
    =
  </div>
);

// === SPLIT/MERGE ARROWS ===

const SplitArrow: React.FC = () => (
  <svg width={50} height={STACKED_HEIGHT} viewBox={`0 0 50 ${STACKED_HEIGHT}`}>
    <defs>
      <marker id="splitArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff" />
      </marker>
    </defs>
    <path
      d={`M0,${STACKED_MIDDLE} L20,${STACKED_MIDDLE} L20,${STACKED_TOP_CENTER} L42,${STACKED_TOP_CENTER}`}
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      markerEnd="url(#splitArrow)"
    />
    <path
      d={`M20,${STACKED_MIDDLE} L20,${STACKED_BOTTOM_CENTER} L42,${STACKED_BOTTOM_CENTER}`}
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      markerEnd="url(#splitArrow)"
    />
  </svg>
);

const MergeArrow: React.FC = () => (
  <svg width={50} height={STACKED_HEIGHT} viewBox={`0 0 50 ${STACKED_HEIGHT}`}>
    <defs>
      <marker id="mergeArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#ffffff" />
      </marker>
    </defs>
    <path
      d={`M0,${STACKED_TOP_CENTER} L20,${STACKED_TOP_CENTER} L20,${STACKED_MIDDLE} L42,${STACKED_MIDDLE}`}
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      markerEnd="url(#mergeArrow)"
    />
    <path
      d={`M0,${STACKED_BOTTOM_CENTER} L20,${STACKED_BOTTOM_CENTER} L20,${STACKED_MIDDLE}`}
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
    />
  </svg>
);

// === STACKED NODES (for IF/ELSE, MERGE) ===

const StackedNodes: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: STACK_GAP }}>
    {nodes.slice(0, 2).map((node, i) => (
      <Node
        key={i}
        label={node.label}
        icon={node.icon}
        color={getColor(node.color, defaultColor)}
      />
    ))}
  </div>
);

// === CENTERED SINGLE NODE (matches stacked height) ===

const CenteredSingleNode: React.FC<{ node: NodeConfig; defaultColor: string }> = ({ node, defaultColor }) => (
  <div style={{ height: STACKED_HEIGHT, display: "flex", alignItems: "center" }}>
    <Node
      label={node.label}
      icon={node.icon}
      color={getColor(node.color, defaultColor)}
    />
  </div>
);

// === LAYOUT COMPONENTS ===

// FLOW: A → B → C
const FlowLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    {nodes.map((node, i) => (
      <React.Fragment key={i}>
        <Node
          label={node.label}
          icon={node.icon}
          color={getColor(node.color, defaultColor)}
        />
        {i < nodes.length - 1 && (
          <ConnectorWrap>
            <Arrow />
          </ConnectorWrap>
        )}
      </React.Fragment>
    ))}
  </div>
);

// ARROW: A → B
const ArrowLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <FlowLayout nodes={nodes.slice(0, 2)} defaultColor={defaultColor} />
);

// VS: A vs B
const VsLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <Node
      label={nodes[0]?.label || "A"}
      icon={nodes[0]?.icon || "cube"}
      color={getColor(nodes[0]?.color, defaultColor)}
    />
    <ConnectorWrap>
      <VsSymbol />
    </ConnectorWrap>
    <Node
      label={nodes[1]?.label || "B"}
      icon={nodes[1]?.icon || "cube"}
      color={getColor(nodes[1]?.color, defaultColor)}
    />
  </div>
);

// COMBINE: A + B = C
const CombineLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <Node
      label={nodes[0]?.label || "A"}
      icon={nodes[0]?.icon || "cube"}
      color={getColor(nodes[0]?.color, defaultColor)}
    />
    <ConnectorWrap>
      <PlusSymbol />
    </ConnectorWrap>
    <Node
      label={nodes[1]?.label || "B"}
      icon={nodes[1]?.icon || "cube"}
      color={getColor(nodes[1]?.color, defaultColor)}
    />
    <ConnectorWrap>
      <EqualsSymbol />
    </ConnectorWrap>
    <Node
      label={nodes[2]?.label || "C"}
      icon={nodes[2]?.icon || "sparkle"}
      color={getColor(nodes[2]?.color, layoutColors.green)}
    />
  </div>
);

// NEGATION: ✗A → B
const NegationLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
    <NegatedNode label={nodes[0]?.label || "Bad"} icon={nodes[0]?.icon || "x"} />
    <ConnectorWrap>
      <Arrow />
    </ConnectorWrap>
    <Node
      label={nodes[1]?.label || "Good"}
      icon={nodes[1]?.icon || "check"}
      color={getColor(nodes[1]?.color, layoutColors.green)}
    />
  </div>
);

// BIDIRECTIONAL: A ↔ B
const BidirectionalLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <Node
      label={nodes[0]?.label || "A"}
      icon={nodes[0]?.icon || "cube"}
      color={getColor(nodes[0]?.color, defaultColor)}
    />
    <ConnectorWrap>
      <BiArrow />
    </ConnectorWrap>
    <Node
      label={nodes[1]?.label || "B"}
      icon={nodes[1]?.icon || "cube"}
      color={getColor(nodes[1]?.color, defaultColor)}
    />
  </div>
);

// FILTER: A ▷ B
const FilterLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <Node
      label={nodes[0]?.label || "Input"}
      icon={nodes[0]?.icon || "cube"}
      color={getColor(nodes[0]?.color, defaultColor)}
    />
    <ConnectorWrap>
      <FilterArrow />
    </ConnectorWrap>
    <Node
      label={nodes[1]?.label || "Output"}
      icon={nodes[1]?.icon || "cube"}
      color={getColor(nodes[1]?.color, layoutColors.green)}
    />
  </div>
);

// IF/ELSE: A → [B, C]
const IfElseLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
    <CenteredSingleNode
      node={nodes[0] || { label: "Input", icon: "cube" }}
      defaultColor={defaultColor}
    />
    <div style={{ height: STACKED_HEIGHT, display: "flex", alignItems: "center" }}>
      <SplitArrow />
    </div>
    <StackedNodes
      nodes={nodes.slice(1, 3)}
      defaultColor={defaultColor}
    />
  </div>
);

// MERGE: [A, B] → C
const MergeLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
    <StackedNodes
      nodes={nodes.slice(0, 2)}
      defaultColor={defaultColor}
    />
    <div style={{ height: STACKED_HEIGHT, display: "flex", alignItems: "center" }}>
      <MergeArrow />
    </div>
    <CenteredSingleNode
      node={nodes[2] || { label: "Output", icon: "sparkle" }}
      defaultColor={layoutColors.green}
    />
  </div>
);

// === MAIN COMPONENT ===

export const ExplainerLayout: React.FC<ExplainerLayoutProps> = ({
  layout,
  nodes,
  accentColor = layoutColors.blue,
}) => {
  const defaultColor = accentColor;

  switch (layout) {
    case "flow":
      return <FlowLayout nodes={nodes} defaultColor={defaultColor} />;
    case "arrow":
      return <ArrowLayout nodes={nodes} defaultColor={defaultColor} />;
    case "vs":
      return <VsLayout nodes={nodes} defaultColor={defaultColor} />;
    case "combine":
      return <CombineLayout nodes={nodes} defaultColor={defaultColor} />;
    case "negation":
      return <NegationLayout nodes={nodes} defaultColor={defaultColor} />;
    case "bidirectional":
      return <BidirectionalLayout nodes={nodes} defaultColor={defaultColor} />;
    case "filter":
      return <FilterLayout nodes={nodes} defaultColor={defaultColor} />;
    case "if-else":
      return <IfElseLayout nodes={nodes} defaultColor={defaultColor} />;
    case "merge":
      return <MergeLayout nodes={nodes} defaultColor={defaultColor} />;
    default:
      // Fallback: render as flow
      return <FlowLayout nodes={nodes} defaultColor={defaultColor} />;
  }
};

export default ExplainerLayout;
