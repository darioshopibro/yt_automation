import { AbsoluteFill, Composition } from "remotion";
import React from "react";

/**
 * TEST KOMPONENTA - Explainer Layouts
 * Sve ikone iste veličine, strelice centrirane sa ikonama
 */

// === DIMENSIONS ===
const ICON_SIZE = 56;        // Visina icon boxa
const ICON_CENTER = 28;      // Centar ikone (ICON_SIZE / 2)
const NODE_GAP = 8;          // Gap između ikone i labele
const LABEL_HEIGHT = 14;     // Približna visina labele
const NODE_HEIGHT = ICON_SIZE + NODE_GAP + LABEL_HEIGHT; // ~78px
const STACK_GAP = 20;        // Gap između stacked nodova
const STACKED_HEIGHT = NODE_HEIGHT * 2 + STACK_GAP;      // ~176px
const STACKED_TOP_CENTER = ICON_CENTER;                  // 28px
const STACKED_BOTTOM_CENTER = NODE_HEIGHT + STACK_GAP + ICON_CENTER; // ~126px
const STACKED_MIDDLE = (STACKED_TOP_CENTER + STACKED_BOTTOM_CENTER) / 2; // ~77px

// === COLORS ===
const colors = {
  bg: "#030305",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  line: "#475569",
  blue: "#3b82f6",
  green: "#10b981",
  orange: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
};

// === ICON ===
const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({
  type, size = 26, color = "#fff",
}) => {
  const s = { filter: `drop-shadow(0 0 8px ${color}40)` };
  const icons: Record<string, React.ReactNode> = {
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    database: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    cube: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/></svg>,
    sparkle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={s}><polyline points="20 6 9 17 4 12"/></svg>,
  };
  return <>{icons[type] || null}</>;
};

// === NODE (ista za sve) ===
const Node: React.FC<{ label: string; icon: string; color?: string }> = ({ label, icon, color = colors.blue }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: NODE_GAP }}>
    <div style={{
      width: ICON_SIZE, height: ICON_SIZE,
      background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
      borderRadius: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 30px ${color}30`,
      border: `1px solid ${color}40`,
    }}>
      <Icon type={icon} color={color} />
    </div>
    <span style={{ fontSize: 10, color: colors.text, fontWeight: 500 }}>{label}</span>
  </div>
);

// === NEGATED NODE ===
const NegatedNode: React.FC<{ label: string; icon: string }> = ({ label, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: NODE_GAP }}>
    <div style={{ position: "relative" }}>
      <div style={{
        width: ICON_SIZE, height: ICON_SIZE,
        background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
        borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 30px ${colors.red}30`,
        border: `1px solid ${colors.red}40`,
        opacity: 0.5,
      }}>
        <Icon type={icon} color={colors.red} />
      </div>
      <svg width={ICON_SIZE} height={ICON_SIZE} viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`} style={{ position: "absolute", top: 0, left: 0 }}>
        <line x1={12} y1={12} x2={44} y2={44} stroke={colors.red} strokeWidth={4} strokeLinecap="round" />
        <line x1={44} y1={12} x2={12} y2={44} stroke={colors.red} strokeWidth={4} strokeLinecap="round" />
      </svg>
    </div>
    <span style={{ fontSize: 10, color: colors.text, fontWeight: 500, opacity: 0.6, textDecoration: "line-through" }}>{label}</span>
  </div>
);

// === CONNECTOR WRAP (postavlja children na centar ikone) ===
const ConnectorWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ height: ICON_SIZE, display: "flex", alignItems: "center" }}>
    {children}
  </div>
);

// === ARROW ===
const Arrow: React.FC<{ length?: number }> = ({ length = 50 }) => (
  <svg width={length} height={20} viewBox={`0 0 ${length} 20`}>
    <line x1={0} y1={10} x2={length - 8} y2={10} stroke={colors.line} strokeWidth={2} />
    <polygon points={`${length - 8},5 ${length},10 ${length - 8},15`} fill={colors.line} />
  </svg>
);

// === VS BADGE ===
const VSBadge: React.FC = () => (
  <div style={{
    background: `linear-gradient(135deg, ${colors.red} 0%, ${colors.orange} 100%)`,
    padding: "8px 16px", borderRadius: 10,
    fontSize: 16, fontWeight: 900, color: "#fff",
    boxShadow: `0 0 30px ${colors.red}60`,
  }}>VS</div>
);

// === PLUS / EQUALS ===
const Plus: React.FC = () => <span style={{ fontSize: 28, color: colors.textMuted, opacity: 0.6 }}>+</span>;
const Equals: React.FC = () => <span style={{ fontSize: 28, color: colors.textMuted, opacity: 0.6 }}>=</span>;

// === FILTER CONNECTOR ===
const FilterConn: React.FC = () => (
  <svg width={70} height={ICON_SIZE} viewBox={`0 0 70 ${ICON_SIZE}`}>
    <line x1={0} y1={ICON_CENTER} x2={15} y2={ICON_CENTER} stroke={colors.line} strokeWidth={2} />
    <rect x={15} y={ICON_CENTER - 15} width={30} height={30} rx={4} fill="none" stroke={colors.line} strokeWidth={2} />
    <line x1={22} y1={ICON_CENTER - 7} x2={38} y2={ICON_CENTER - 7} stroke={colors.line} strokeWidth={1.5} />
    <line x1={24} y1={ICON_CENTER} x2={36} y2={ICON_CENTER} stroke={colors.line} strokeWidth={1.5} />
    <line x1={26} y1={ICON_CENTER + 7} x2={34} y2={ICON_CENTER + 7} stroke={colors.line} strokeWidth={1.5} />
    <line x1={45} y1={ICON_CENTER} x2={62} y2={ICON_CENTER} stroke={colors.green} strokeWidth={2} />
    <polygon points={`62,${ICON_CENTER - 5} 70,${ICON_CENTER} 62,${ICON_CENTER + 5}`} fill={colors.green} />
  </svg>
);

// === BIDIRECTIONAL ===
const BiArrow: React.FC<{ length?: number }> = ({ length = 60 }) => (
  <svg width={length} height={20} viewBox={`0 0 ${length} 20`}>
    <line x1={10} y1={10} x2={length - 10} y2={10} stroke={colors.line} strokeWidth={2} />
    <polygon points={`0,10 10,5 10,15`} fill={colors.line} />
    <polygon points={`${length},10 ${length - 10},5 ${length - 10},15`} fill={colors.line} />
  </svg>
);

// === SPLIT ARROW (za IF/ELSE) - visina odgovara 2 stacked noda ===
const SplitArrow: React.FC = () => (
  <svg width={70} height={STACKED_HEIGHT} viewBox={`0 0 70 ${STACKED_HEIGHT}`}>
    {/* Input line at middle height */}
    <line x1={0} y1={STACKED_MIDDLE} x2={20} y2={STACKED_MIDDLE} stroke={colors.line} strokeWidth={2} />
    {/* Split point */}
    <circle cx={20} cy={STACKED_MIDDLE} r={4} fill={colors.line} />
    {/* Top branch - curve to top icon center */}
    <path d={`M20 ${STACKED_MIDDLE} Q35 ${STACKED_MIDDLE} 35 ${STACKED_TOP_CENTER} L55 ${STACKED_TOP_CENTER}`} fill="none" stroke={colors.green} strokeWidth={2} />
    <polygon points={`55,${STACKED_TOP_CENTER - 5} 63,${STACKED_TOP_CENTER} 55,${STACKED_TOP_CENTER + 5}`} fill={colors.green} />
    {/* Bottom branch - curve to bottom icon center */}
    <path d={`M20 ${STACKED_MIDDLE} Q35 ${STACKED_MIDDLE} 35 ${STACKED_BOTTOM_CENTER} L55 ${STACKED_BOTTOM_CENTER}`} fill="none" stroke={colors.red} strokeWidth={2} />
    <polygon points={`55,${STACKED_BOTTOM_CENTER - 5} 63,${STACKED_BOTTOM_CENTER} 55,${STACKED_BOTTOM_CENTER + 5}`} fill={colors.red} />
  </svg>
);

// === MERGE ARROW (za MERGE) - visina odgovara 2 stacked noda ===
const MergeArrow: React.FC = () => (
  <svg width={70} height={STACKED_HEIGHT} viewBox={`0 0 70 ${STACKED_HEIGHT}`}>
    {/* Top input - from top icon center */}
    <line x1={0} y1={STACKED_TOP_CENTER} x2={15} y2={STACKED_TOP_CENTER} stroke={colors.line} strokeWidth={2} />
    <path d={`M15 ${STACKED_TOP_CENTER} Q30 ${STACKED_TOP_CENTER} 30 ${STACKED_MIDDLE}`} fill="none" stroke={colors.line} strokeWidth={2} />
    {/* Bottom input - from bottom icon center */}
    <line x1={0} y1={STACKED_BOTTOM_CENTER} x2={15} y2={STACKED_BOTTOM_CENTER} stroke={colors.line} strokeWidth={2} />
    <path d={`M15 ${STACKED_BOTTOM_CENTER} Q30 ${STACKED_BOTTOM_CENTER} 30 ${STACKED_MIDDLE}`} fill="none" stroke={colors.line} strokeWidth={2} />
    {/* Merge point */}
    <circle cx={30} cy={STACKED_MIDDLE} r={4} fill={colors.green} />
    {/* Output */}
    <line x1={30} y1={STACKED_MIDDLE} x2={55} y2={STACKED_MIDDLE} stroke={colors.green} strokeWidth={2} />
    <polygon points={`55,${STACKED_MIDDLE - 5} 63,${STACKED_MIDDLE} 55,${STACKED_MIDDLE + 5}`} fill={colors.green} />
  </svg>
);

// === STACKED NODES (2 noda vertikalno) ===
const StackedNodes: React.FC<{ nodes: { label: string; icon: string; color: string }[] }> = ({ nodes }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: STACK_GAP }}>
    {nodes.map((n, i) => <Node key={i} label={n.label} icon={n.icon} color={n.color} />)}
  </div>
);

// === SINGLE NODE CENTERED (visina kao stacked, node je centriran) ===
const CenteredSingleNode: React.FC<{ label: string; icon: string; color: string }> = ({ label, icon, color }) => (
  <div style={{ height: STACKED_HEIGHT, display: "flex", alignItems: "center" }}>
    <Node label={label} icon={icon} color={color} />
  </div>
);

// === TEST SCENE ===
export const ExplainerTestScene: React.FC = () => (
  <AbsoluteFill style={{
    background: `radial-gradient(ellipse at 50% 30%, #0a0a14 0%, ${colors.bg} 70%)`,
    display: "flex", flexDirection: "row", justifyContent: "space-around",
    alignItems: "flex-start", padding: "60px 40px", gap: 40,
  }}>
    {/* LEFT - Layouts */}
    <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
      <div style={{ fontSize: 14, color: colors.text, fontWeight: 700, letterSpacing: 2 }}>LAYOUTS</div>

      {/* FLOW */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>FLOW</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Node label="User" icon="user" color={colors.blue} />
          <ConnectorWrap><Arrow /></ConnectorWrap>
          <Node label="API" icon="zap" color={colors.green} />
          <ConnectorWrap><Arrow /></ConnectorWrap>
          <Node label="DB" icon="database" color={colors.orange} />
        </div>
      </div>

      {/* VS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>VS</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <Node label="REST" icon="file" color={colors.blue} />
          <ConnectorWrap><VSBadge /></ConnectorWrap>
          <Node label="GraphQL" icon="cube" color={colors.purple} />
        </div>
      </div>

      {/* COMBINE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>COMBINE</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Node label="Context" icon="file" color={colors.blue} />
          <ConnectorWrap><Plus /></ConnectorWrap>
          <Node label="Query" icon="search" color={colors.orange} />
          <ConnectorWrap><Equals /></ConnectorWrap>
          <Node label="Prompt" icon="sparkle" color={colors.green} />
        </div>
      </div>

      {/* NEGATION */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>NEGATION</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <NegatedNode label="Bad" icon="database" />
          <ConnectorWrap><Arrow /></ConnectorWrap>
          <Node label="Good" icon="check" color={colors.green} />
        </div>
      </div>
    </div>

    {/* RIGHT - Connections */}
    <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
      <div style={{ fontSize: 14, color: colors.text, fontWeight: 700, letterSpacing: 2 }}>CONNECTIONS</div>

      {/* ARROW */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>ARROW</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Node label="Input" icon="file" color={colors.blue} />
          <ConnectorWrap><Arrow length={60} /></ConnectorWrap>
          <Node label="Output" icon="sparkle" color={colors.green} />
        </div>
      </div>

      {/* FILTER */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>FILTER</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Node label="All Data" icon="database" color={colors.blue} />
          <ConnectorWrap><FilterConn /></ConnectorWrap>
          <Node label="Filtered" icon="check" color={colors.green} />
        </div>
      </div>

      {/* BIDIRECTIONAL */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>BIDIRECTIONAL</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Node label="Client" icon="user" color={colors.blue} />
          <ConnectorWrap><BiArrow /></ConnectorWrap>
          <Node label="Server" icon="database" color={colors.green} />
        </div>
      </div>

      {/* IF/ELSE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>IF/ELSE</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <CenteredSingleNode label="Check" icon="search" color={colors.blue} />
          <SplitArrow />
          <StackedNodes nodes={[
            { label: "Yes", icon: "check", color: colors.green },
            { label: "No", icon: "zap", color: colors.red },
          ]} />
        </div>
      </div>

      {/* MERGE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>MERGE</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <StackedNodes nodes={[
            { label: "Source A", icon: "file", color: colors.blue },
            { label: "Source B", icon: "database", color: colors.orange },
          ]} />
          <MergeArrow />
          <CenteredSingleNode label="Combined" icon="sparkle" color={colors.green} />
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

// === COMPOSITION ===
export const ExplainerTestComposition = () => (
  <Composition
    id="ExplainerTest"
    component={ExplainerTestScene}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);
