import { AbsoluteFill, Composition } from "remotion";
import React from "react";

/**
 * TEST KOMPONENTA - Explainer Layouts
 * Jednostavna verzija bez animacija
 */

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

// === NODE ===
const Node: React.FC<{ label: string; icon: string; color?: string }> = ({ label, icon, color = colors.blue }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
    <div style={{
      width: 56, height: 56,
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

// === NEGATED NODE (X preko) ===
const NegatedNode: React.FC<{ label: string; icon: string }> = ({ label, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
    <div style={{ position: "relative" }}>
      <div style={{
        width: 56, height: 56,
        background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
        borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 30px ${colors.red}30`,
        border: `1px solid ${colors.red}40`,
        opacity: 0.5,
      }}>
        <Icon type={icon} color={colors.red} />
      </div>
      <svg width={56} height={56} viewBox="0 0 56 56" style={{ position: "absolute", top: 0, left: 0 }}>
        <line x1={12} y1={12} x2={44} y2={44} stroke={colors.red} strokeWidth={4} strokeLinecap="round" />
        <line x1={44} y1={12} x2={12} y2={44} stroke={colors.red} strokeWidth={4} strokeLinecap="round" />
      </svg>
    </div>
    <span style={{ fontSize: 10, color: colors.text, fontWeight: 500, opacity: 0.6, textDecoration: "line-through" }}>{label}</span>
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
  <svg width={70} height={50} viewBox="0 0 70 50">
    <line x1={0} y1={25} x2={15} y2={25} stroke={colors.line} strokeWidth={2} />
    <rect x={15} y={10} width={30} height={30} rx={4} fill="none" stroke={colors.line} strokeWidth={2} />
    <line x1={22} y1={18} x2={38} y2={18} stroke={colors.line} strokeWidth={1.5} />
    <line x1={24} y1={25} x2={36} y2={25} stroke={colors.line} strokeWidth={1.5} />
    <line x1={26} y1={32} x2={34} y2={32} stroke={colors.line} strokeWidth={1.5} />
    <line x1={45} y1={25} x2={62} y2={25} stroke={colors.green} strokeWidth={2} />
    <polygon points="62,20 70,25 62,30" fill={colors.green} />
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

// === SPLIT ARROW (za IF/ELSE) ===
const SplitArrow: React.FC = () => (
  <svg width={60} height={80} viewBox="0 0 60 80">
    {/* Horizontal start */}
    <line x1={0} y1={40} x2={20} y2={40} stroke={colors.line} strokeWidth={2} />
    {/* Split point */}
    <circle cx={20} cy={40} r={4} fill={colors.line} />
    {/* Top branch */}
    <path d="M20 40 Q30 40 30 20 L50 20" fill="none" stroke={colors.green} strokeWidth={2} />
    <polygon points="50,15 58,20 50,25" fill={colors.green} />
    {/* Bottom branch */}
    <path d="M20 40 Q30 40 30 60 L50 60" fill="none" stroke={colors.red} strokeWidth={2} />
    <polygon points="50,55 58,60 50,65" fill={colors.red} />
  </svg>
);

// === MERGE ARROW (za MERGE) ===
const MergeArrow: React.FC = () => (
  <svg width={60} height={80} viewBox="0 0 60 80">
    {/* Top input */}
    <line x1={0} y1={20} x2={20} y2={20} stroke={colors.line} strokeWidth={2} />
    <path d="M20 20 Q30 20 30 40" fill="none" stroke={colors.line} strokeWidth={2} />
    {/* Bottom input */}
    <line x1={0} y1={60} x2={20} y2={60} stroke={colors.line} strokeWidth={2} />
    <path d="M20 60 Q30 60 30 40" fill="none" stroke={colors.line} strokeWidth={2} />
    {/* Merge point */}
    <circle cx={30} cy={40} r={4} fill={colors.green} />
    {/* Output */}
    <line x1={30} y1={40} x2={50} y2={40} stroke={colors.green} strokeWidth={2} />
    <polygon points="50,35 58,40 50,45" fill={colors.green} />
  </svg>
);

// === MINI NODE (manji node za IF/ELSE i MERGE) ===
const MiniNode: React.FC<{ label: string; icon: string; color?: string }> = ({ label, icon, color = colors.blue }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
    <div style={{
      width: 40, height: 40,
      background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 2px 12px rgba(0,0,0,0.4), 0 0 20px ${color}30`,
      border: `1px solid ${color}40`,
    }}>
      <Icon type={icon} size={20} color={color} />
    </div>
    <span style={{ fontSize: 8, color: colors.text, fontWeight: 500 }}>{label}</span>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Node label="User" icon="user" color={colors.blue} />
          <Arrow />
          <Node label="API" icon="zap" color={colors.green} />
          <Arrow />
          <Node label="DB" icon="database" color={colors.orange} />
        </div>
      </div>

      {/* VS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>VS</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Node label="REST" icon="file" color={colors.blue} />
          <VSBadge />
          <Node label="GraphQL" icon="cube" color={colors.purple} />
        </div>
      </div>

      {/* COMBINE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>COMBINE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Node label="Context" icon="file" color={colors.blue} />
          <Plus />
          <Node label="Query" icon="search" color={colors.orange} />
          <Equals />
          <Node label="Prompt" icon="sparkle" color={colors.green} />
        </div>
      </div>

      {/* NEGATION */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>NEGATION</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <NegatedNode label="Bad" icon="database" />
          <Arrow />
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Node label="Input" icon="file" color={colors.blue} />
          <Arrow length={60} />
          <Node label="Output" icon="sparkle" color={colors.green} />
        </div>
      </div>

      {/* FILTER */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>FILTER</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Node label="All Data" icon="database" color={colors.blue} />
          <FilterConn />
          <Node label="Filtered" icon="check" color={colors.green} />
        </div>
      </div>

      {/* BIDIRECTIONAL */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>BIDIRECTIONAL</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Node label="Client" icon="user" color={colors.blue} />
          <BiArrow />
          <Node label="Server" icon="database" color={colors.green} />
        </div>
      </div>

      {/* IF/ELSE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>IF/ELSE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Node label="Check" icon="search" color={colors.blue} />
          <SplitArrow />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <MiniNode label="Yes" icon="check" color={colors.green} />
            <MiniNode label="No" icon="zap" color={colors.red} />
          </div>
        </div>
      </div>

      {/* MERGE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>MERGE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <MiniNode label="Source A" icon="file" color={colors.blue} />
            <MiniNode label="Source B" icon="database" color={colors.orange} />
          </div>
          <MergeArrow />
          <Node label="Combined" icon="sparkle" color={colors.green} />
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
