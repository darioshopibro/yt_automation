import { AbsoluteFill, Composition } from "remotion";
import React from "react";

/**
 * TEST KOMPONENTA - Explainer Layouts
 * Sve ikone iste veličine, strelice centrirane sa ikonama
 */

/**
 * === DIMENSIONS REFERENCE ===
 *
 * SINGLE NODE STRUCTURE:
 * ┌──────────────────┐
 * │   ICON_SIZE      │ 56px (icon box height/width)
 * │   ┌──────────┐   │
 * │   │  ICON    │   │ ICON_CENTER = 28px (center point for arrows)
 * │   └──────────┘   │
 * ├──────────────────┤ NODE_GAP = 8px
 * │     LABEL        │ LABEL_HEIGHT = 14px
 * └──────────────────┘
 *   NODE_HEIGHT = 78px total
 *
 * STACKED NODES (2 nodes vertically):
 * ┌──────────────────┐ ← STACKED_TOP_CENTER = 28px (arrow connects here)
 * │     NODE 1       │ 78px
 * └──────────────────┘
 *        gap           STACK_GAP = 20px
 * ┌──────────────────┐ ← STACKED_BOTTOM_CENTER = 126px (arrow connects here)
 * │     NODE 2       │ 78px
 * └──────────────────┘
 *   STACKED_HEIGHT = 176px total
 *   STACKED_MIDDLE = 77px (input/output point for IF/ELSE, MERGE)
 *
 * AVAILABLE LAYOUTS:
 * - FLOW: A → B → C (linear sequence)
 * - VS: A vs B (comparison)
 * - COMBINE: A + B = C (combination)
 * - NEGATION: ✗A → B (negated to good)
 * - ARROW: A → B (simple connection)
 * - FILTER: A ▷ B (filtered)
 * - BIDIRECTIONAL: A ↔ B (two-way)
 * - IF/ELSE: A → [B, C] (split/branch)
 * - MERGE: [A, B] → C (join)
 *
 * AVAILABLE ICONS (35 total):
 * Original (8):  user, database, zap, cube, search, file, sparkle, check
 * Lucide (15):   server, cloud, gitBranch, gitMerge, settings, play, lock,
 *                shield, monitor, refreshCw, layers, cpu, terminal, globe, code
 * Custom (12):   api, webhook, queue, network, brain, vector, alert, x,
 *                arrowRight, container, package, messageSquare
 */

// === DIMENSIONS ===
const ICON_SIZE = 56;        // Visina icon boxa
const ICON_CENTER = 28;      // Centar ikone (ICON_SIZE / 2)
const NODE_GAP = 8;          // Gap između ikone i labele
const LABEL_HEIGHT = 14;     // Približna visina labele
const NODE_HEIGHT = ICON_SIZE + NODE_GAP + LABEL_HEIGHT; // 78px
const STACK_GAP = 20;        // Gap između stacked nodova
const STACKED_HEIGHT = NODE_HEIGHT * 2 + STACK_GAP;      // 176px
const STACKED_TOP_CENTER = ICON_CENTER;                  // 28px
const STACKED_BOTTOM_CENTER = NODE_HEIGHT + STACK_GAP + ICON_CENTER; // 126px
const STACKED_MIDDLE = (STACKED_TOP_CENTER + STACKED_BOTTOM_CENTER) / 2; // 77px

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
// Original 8 + 15 NEW from Lucide (paths only, our styling)
const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({
  type, size = 26, color = "#fff",
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

    // === NEW FROM LUCIDE (15) ===
    // server - backend, API server
    server: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>,
    // cloud - deployment, cloud services
    cloud: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z"/></svg>,
    // gitBranch - version control, branching
    gitBranch: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 01-9 9"/></svg>,
    // gitMerge - merging branches
    gitMerge: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/></svg>,
    // settings - config, build, gear
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    // play - runtime, execution
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    // lock - security, authentication
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    // shield - protection, security
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    // monitor - dashboard, display
    monitor: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="20" height="14" x="2" y="3" rx="2" ry="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>,
    // refreshCw - loop, CI/CD cycle, sync
    refreshCw: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
    // layers - stack, tiers
    layers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    // cpu - processing, compute
    cpu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect width="16" height="16" x="4" y="4" rx="2" ry="2"/><rect width="6" height="6" x="9" y="9" rx="1" ry="1"/><line x1="9" x2="9" y1="1" y2="4"/><line x1="15" x2="15" y1="1" y2="4"/><line x1="9" x2="9" y1="20" y2="23"/><line x1="15" x2="15" y1="20" y2="23"/><line x1="20" x2="23" y1="9" y2="9"/><line x1="20" x2="23" y1="14" y2="14"/><line x1="1" x2="4" y1="9" y2="9"/><line x1="1" x2="4" y1="14" y2="14"/></svg>,
    // terminal - CLI, commands
    terminal: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>,
    // globe - network, internet, world
    globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    // code - programming, development
    code: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,

    // === CUSTOM SVGs (10) ===
    // api - API endpoint
    api: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/></svg>,
    // webhook - callback, hook
    webhook: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 012 14c0-2.21 1.79-4 4-4 .74 0 1.43.2 2.02.55"/><path d="M9 17c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3c.48 0 .93.12 1.33.32"/><path d="M14 8.14c.09-1.88.92-3.14 2.59-3.14 2.21 0 4 1.79 4 4 0 1.45-.78 2.73-1.93 3.43"/><circle cx="12" cy="12" r="3"/></svg>,
    // queue - message queue
    queue: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>,
    // network - connections, mesh
    network: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/><line x1="7" y1="19" x2="17" y2="19"/></svg>,
    // brain - AI, LLM, intelligence
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M12 5a3 3 0 100-6 3 3 0 000 6z" transform="translate(0,5)"/><path d="M9 10c-3 0-5 2-5 5s2 5 5 5"/><path d="M15 10c3 0 5 2 5 5s-2 5-5 5"/><path d="M12 10v10"/><path d="M9 14h6"/><path d="M9 18h6"/></svg>,
    // vector - embeddings, dots
    vector: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>,
    // alert - warning, attention
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    // x - error, close, failure
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    // arrowRight - flow direction
    arrowRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    // container - docker-style, box with dots
    container: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6.01" y2="10"/><line x1="10" y1="10" x2="10.01" y2="10"/><line x1="14" y1="10" x2="14.01" y2="10"/><line x1="6" y1="14" x2="6.01" y2="14"/><line x1="10" y1="14" x2="10.01" y2="14"/></svg>,
    // package - npm, dependency
    package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    // messageSquare - chat, communication
    messageSquare: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={s}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
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

      {/* CI/CD FLOW - using NEW icons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: 2 }}>CI/CD (NEW ICONS)</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Node label="Code" icon="code" color={colors.blue} />
          <ConnectorWrap><Arrow /></ConnectorWrap>
          <Node label="Build" icon="settings" color={colors.orange} />
          <ConnectorWrap><Arrow /></ConnectorWrap>
          <Node label="Deploy" icon="cloud" color={colors.green} />
        </div>
      </div>
    </div>

    {/* MIDDLE - New Icons Showcase */}
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <div style={{ fontSize: 14, color: colors.text, fontWeight: 700, letterSpacing: 2 }}>NEW ICONS</div>

      {/* Row 1 */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="Server" icon="server" color={colors.blue} />
        <Node label="Cloud" icon="cloud" color={colors.green} />
        <Node label="CPU" icon="cpu" color={colors.orange} />
      </div>

      {/* Row 2 */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="GitBranch" icon="gitBranch" color={colors.purple} />
        <Node label="GitMerge" icon="gitMerge" color={colors.green} />
        <Node label="RefreshCw" icon="refreshCw" color={colors.blue} />
      </div>

      {/* Row 3 */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="Settings" icon="settings" color={colors.orange} />
        <Node label="Lock" icon="lock" color={colors.red} />
        <Node label="Shield" icon="shield" color={colors.green} />
      </div>

      {/* Row 4 */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="Terminal" icon="terminal" color={colors.blue} />
        <Node label="Monitor" icon="monitor" color={colors.purple} />
        <Node label="Globe" icon="globe" color={colors.green} />
      </div>

      {/* Row 5 - Lucide */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="Layers" icon="layers" color={colors.orange} />
        <Node label="Play" icon="play" color={colors.green} />
        <Node label="Code" icon="code" color={colors.blue} />
      </div>

      {/* Row 6 - Custom */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="API" icon="api" color={colors.blue} />
        <Node label="Webhook" icon="webhook" color={colors.purple} />
        <Node label="Queue" icon="queue" color={colors.orange} />
      </div>

      {/* Row 7 - Custom */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="Network" icon="network" color={colors.green} />
        <Node label="Brain" icon="brain" color={colors.purple} />
        <Node label="Vector" icon="vector" color={colors.blue} />
      </div>

      {/* Row 8 - Custom */}
      <div style={{ display: "flex", gap: 12 }}>
        <Node label="Alert" icon="alert" color={colors.orange} />
        <Node label="X" icon="x" color={colors.red} />
        <Node label="Container" icon="container" color={colors.blue} />
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
