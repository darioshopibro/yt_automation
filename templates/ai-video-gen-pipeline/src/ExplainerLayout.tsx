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
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

// Same alias map as DynamicPipeline — Lucide/shorthand → Phosphor PascalCase
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
  connectorAfter?: string; // Optional label shown on the connector after this node
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

// === ICON COMPONENT (PHOSPHOR — dynamic, 1500+ icons) ===

const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({
  type,
  size = 26,
  color = "#fff",
}) => {
  const s = { filter: `drop-shadow(0 0 8px ${color}40)` };
  const lower = type.toLowerCase();
  const aliasName = ICON_ALIASES[lower];
  const lookupName = aliasName || (type.charAt(0).toUpperCase() + type.slice(1));
  const IconComponent = (PhosphorIcons as Record<string, unknown>)[lookupName] as React.FC<{size?: number; color?: string; style?: React.CSSProperties}> | undefined;
  if (!IconComponent) return <Cube size={size} color={color} style={s} />;
  return <IconComponent size={size} color={color} style={s} />;
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

// === CONNECTOR WRAP (centers connector with icon row) ===

const ConnectorWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ height: ICON_SIZE, display: "flex", alignItems: "center" }}>{children}</div>
);


// === CONNECTORS — accent colored + glow ===

const Arrow: React.FC<{ color?: string; uid?: string }> = ({
  color = "#ffffff",
  uid = "0",
}) => {
  const c = color.replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={40} height={20} viewBox="0 0 40 20">
      <defs>
        <marker id={`arh-${uid}-${c}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={color} />
        </marker>
      </defs>
      <line x1="0" y1="10" x2="32" y2="10" stroke={color} strokeWidth="2" markerEnd={`url(#arh-${uid}-${c})`} />
    </svg>
  );
};

const BiArrow: React.FC<{ color?: string; uid?: string }> = ({
  color = "#ffffff",
  uid = "0",
}) => {
  const c = color.replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={40} height={20} viewBox="0 0 40 20">
      <defs>
        <marker id={`biarL-${uid}-${c}`} markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill={color} />
        </marker>
        <marker id={`biarR-${uid}-${c}`} markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={color} />
        </marker>
      </defs>
      <line x1="8" y1="10" x2="32" y2="10" stroke={color} strokeWidth="2" markerStart={`url(#biarL-${uid}-${c})`} markerEnd={`url(#biarR-${uid}-${c})`} />
    </svg>
  );
};

const FilterArrow: React.FC<{ color?: string; uid?: string }> = ({
  color = "#ffffff",
  uid = "0",
}) => (
  <svg width={40} height={20} viewBox="0 0 40 20">
    <polygon points="5,2 5,18 25,10" fill="none" stroke={color} strokeWidth="2" />
    <line x1="25" y1="10" x2="38" y2="10" stroke={color} strokeWidth="2" />
  </svg>
);

const VsSymbol: React.FC<{ color?: string }> = ({ color = "#ffffff" }) => (
  <div
    style={{
      fontSize: 16,
      fontWeight: 800,
      color,
      textShadow: `0 0 12px ${color}60`,
      padding: "0 8px",
      fontFamily: "'SF Mono', monospace",
    }}
  >
    vs
  </div>
);

const PlusSymbol: React.FC<{ color?: string }> = ({ color = "#ffffff" }) => (
  <div
    style={{
      fontSize: 22,
      fontWeight: 700,
      color,
      textShadow: `0 0 12px ${color}60`,
      padding: "0 4px",
    }}
  >
    +
  </div>
);

const EqualsSymbol: React.FC<{ color?: string }> = ({ color = "#ffffff" }) => (
  <div
    style={{
      fontSize: 22,
      fontWeight: 700,
      color,
      textShadow: `0 0 12px ${color}60`,
      padding: "0 4px",
    }}
  >
    =
  </div>
);

// === SPLIT/MERGE ARROWS ===

const SplitArrow: React.FC<{ color?: string; uid?: string }> = ({
  color = "#ffffff",
  uid = "0",
}) => {
  const c = color.replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={50} height={STACKED_HEIGHT} viewBox={`0 0 50 ${STACKED_HEIGHT}`}>
      <defs>
        <marker id={`spl-${uid}-${c}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={color} />
        </marker>
      </defs>
      <path d={`M0,${STACKED_MIDDLE} L20,${STACKED_MIDDLE} L20,${STACKED_TOP_CENTER} L42,${STACKED_TOP_CENTER}`}
        fill="none" stroke={color} strokeWidth="2" markerEnd={`url(#spl-${uid}-${c})`} />
      <path d={`M20,${STACKED_MIDDLE} L20,${STACKED_BOTTOM_CENTER} L42,${STACKED_BOTTOM_CENTER}`}
        fill="none" stroke={color} strokeWidth="2" markerEnd={`url(#spl-${uid}-${c})`} />
    </svg>
  );
};

const MergeArrow: React.FC<{ color?: string; uid?: string }> = ({
  color = "#ffffff",
  uid = "0",
}) => {
  const c = color.replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={50} height={STACKED_HEIGHT} viewBox={`0 0 50 ${STACKED_HEIGHT}`}>
      <defs>
        <marker id={`mrg-${uid}-${c}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={color} />
        </marker>
      </defs>
      <path d={`M0,${STACKED_TOP_CENTER} L20,${STACKED_TOP_CENTER} L20,${STACKED_MIDDLE} L42,${STACKED_MIDDLE}`}
        fill="none" stroke={color} strokeWidth="2" markerEnd={`url(#mrg-${uid}-${c})`} />
      <path d={`M0,${STACKED_BOTTOM_CENTER} L20,${STACKED_BOTTOM_CENTER} L20,${STACKED_MIDDLE}`}
        fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
};


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
        <Node label={node.label} icon={node.icon} color={getColor(node.color, defaultColor)} />
        {i < nodes.length - 1 && (
          <ConnectorWrap>
            <Arrow uid={`fl-${i}`} color={defaultColor} />
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
      color={getColor(nodes[0]?.color, layoutColors.red)}
    />
    <ConnectorWrap>
      <VsSymbol color={defaultColor} />
    </ConnectorWrap>
    <Node
      label={nodes[1]?.label || "B"}
      icon={nodes[1]?.icon || "cube"}
      color={getColor(nodes[1]?.color, layoutColors.green)}
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
      <PlusSymbol color={defaultColor} />
    </ConnectorWrap>
    <Node
      label={nodes[1]?.label || "B"}
      icon={nodes[1]?.icon || "cube"}
      color={getColor(nodes[1]?.color, defaultColor)}
    />
    <ConnectorWrap>
      <EqualsSymbol color={defaultColor} />
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
    <ConnectorWrap><Arrow uid="neg-0" color={layoutColors.green} /></ConnectorWrap>
    <Node label={nodes[1]?.label || "Good"} icon={nodes[1]?.icon || "check"} color={getColor(nodes[1]?.color, layoutColors.green)} />
  </div>
);

// BIDIRECTIONAL: A ↔ B
const BidirectionalLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <Node label={nodes[0]?.label || "A"} icon={nodes[0]?.icon || "cube"} color={getColor(nodes[0]?.color, defaultColor)} />
    <ConnectorWrap><BiArrow uid="bi-0" color={defaultColor} /></ConnectorWrap>
    <Node label={nodes[1]?.label || "B"} icon={nodes[1]?.icon || "cube"} color={getColor(nodes[1]?.color, defaultColor)} />
  </div>
);

// FILTER: A ▷ B
const FilterLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
    <Node label={nodes[0]?.label || "Input"} icon={nodes[0]?.icon || "cube"} color={getColor(nodes[0]?.color, defaultColor)} />
    <ConnectorWrap><FilterArrow uid="fi-0" color={defaultColor} /></ConnectorWrap>
    <Node label={nodes[1]?.label || "Output"} icon={nodes[1]?.icon || "cube"} color={getColor(nodes[1]?.color, layoutColors.green)} />
  </div>
);

// IF/ELSE: A → [B, C]
const IfElseLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
    <CenteredSingleNode node={nodes[0] || { label: "Input", icon: "cube" }} defaultColor={defaultColor} />
    <div style={{ height: STACKED_HEIGHT, display: "flex", alignItems: "center" }}>
      <SplitArrow uid="ife-0" color={defaultColor} />
    </div>
    <StackedNodes nodes={nodes.slice(1, 3)} defaultColor={defaultColor} />
  </div>
);

// MERGE: [A, B] → C
const MergeLayout: React.FC<{ nodes: NodeConfig[]; defaultColor: string }> = ({ nodes, defaultColor }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
    <StackedNodes nodes={nodes.slice(0, 2)} defaultColor={defaultColor} />
    <div style={{ height: STACKED_HEIGHT, display: "flex", alignItems: "center" }}>
      <MergeArrow uid="mrg-0" color={defaultColor} />
    </div>
    <CenteredSingleNode node={nodes[2] || { label: "Output", icon: "sparkle" }} defaultColor={layoutColors.green} />
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
    case "flow":        return <FlowLayout nodes={nodes} defaultColor={defaultColor} />;
    case "arrow":       return <ArrowLayout nodes={nodes} defaultColor={defaultColor} />;
    case "vs":          return <VsLayout nodes={nodes} defaultColor={defaultColor} />;
    case "combine":     return <CombineLayout nodes={nodes} defaultColor={defaultColor} />;
    case "negation":    return <NegationLayout nodes={nodes} defaultColor={defaultColor} />;
    case "bidirectional": return <BidirectionalLayout nodes={nodes} defaultColor={defaultColor} />;
    case "filter":      return <FilterLayout nodes={nodes} defaultColor={defaultColor} />;
    case "if-else":     return <IfElseLayout nodes={nodes} defaultColor={defaultColor} />;
    case "merge":       return <MergeLayout nodes={nodes} defaultColor={defaultColor} />;
    default:            return <FlowLayout nodes={nodes} defaultColor={defaultColor} />;
  }
};

export default ExplainerLayout;
