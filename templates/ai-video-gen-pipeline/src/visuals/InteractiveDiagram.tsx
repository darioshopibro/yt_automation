import React, { useMemo } from "react";
import { spring, interpolate, useVideoConfig, Easing } from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

// ─── TYPES ───

interface DiagramElement {
  id: string;
  label: string;
  type?: "icon-box" | "stat" | "progress-bar" | "code" | "card" | "status" | "score" | "mini-table";
  icon?: string;
  color?: string;
  row?: number;
  col?: number;
  badge?: string;
  // Type-specific data
  value?: string | number;
  subtitle?: string;
  code?: string;
  items?: string[];          // for card bullet points or mini-table rows
  headers?: string[];        // for mini-table
  maxValue?: number;         // for progress-bar
  status?: "success" | "warning" | "error" | "info" | "pending";
}

interface TimelineEvent {
  frame: number;
  op: "appear" | "highlight" | "connect" | "eliminate";
  target?: string;
  from?: string;
  to?: string;
  badge?: string;
}

interface Props {
  elements: DiagramElement[];
  timeline: TimelineEvent[];
  cols?: number;
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
  fullScreen?: boolean;
}

// ─── CONSTANTS ───

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];
const HIGHLIGHT_DURATION = 12;
const CONNECT_DURATION = 18;
const ELIMINATE_DURATION = 12;

const statusColors: Record<string, string> = {
  success: "#22c55e", warning: "#f59e0b", error: "#ef4444", info: "#3b82f6", pending: "#94a3b8",
};

// ─── HELPERS ───

const getPhosphorIcon = (name: string): React.FC<any> => {
  const IconComp = (PhosphorIcons as Record<string, unknown>)[name];
  if (IconComp && typeof IconComp === "function") return IconComp as React.FC<any>;
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  const PascalComp = (PhosphorIcons as Record<string, unknown>)[pascal];
  if (PascalComp && typeof PascalComp === "function") return PascalComp as React.FC<any>;
  return Cube as React.FC<any>;
};

// ─── STATE COMPUTATION ───

type ElementState = {
  visible: boolean;
  highlighted: boolean;
  eliminated: boolean;
  badge: string | null;
  appearFrame: number;
  highlightFrame: number;
  eliminateFrame: number;
};

const computeElementStates = (
  elements: DiagramElement[],
  timeline: TimelineEvent[],
  currentFrame: number,
): Record<string, ElementState> => {
  const states: Record<string, ElementState> = {};
  for (const el of elements) {
    states[el.id] = {
      visible: false, highlighted: false, eliminated: false,
      badge: el.badge || null, appearFrame: -1, highlightFrame: -1, eliminateFrame: -1,
    };
  }
  for (const evt of timeline) {
    if (evt.frame > currentFrame) continue;
    const s = evt.target ? states[evt.target] : null;
    if (evt.op === "appear" && s) { s.visible = true; if (s.appearFrame < 0) s.appearFrame = evt.frame; }
    if (evt.op === "highlight" && s) { s.highlighted = true; s.highlightFrame = evt.frame; if (evt.badge) s.badge = evt.badge; }
    if (evt.op === "eliminate" && s) { s.eliminated = true; s.eliminateFrame = evt.frame; }
  }
  return states;
};

type ConnectionInfo = { fromId: string; toId: string; connectFrame: number };

const getActiveConnections = (timeline: TimelineEvent[], currentFrame: number): ConnectionInfo[] => {
  const conns: ConnectionInfo[] = [];
  for (const evt of timeline) {
    if (evt.op === "connect" && evt.from && evt.to && evt.frame <= currentFrame)
      conns.push({ fromId: evt.from, toId: evt.to, connectFrame: evt.frame });
  }
  return conns;
};

const computeGrid = (elements: DiagramElement[], cols: number) =>
  elements.map((el, i) => ({ ...el, row: el.row ?? Math.floor(i / cols), col: el.col ?? (i % cols) }));

// ─── ELEMENT RENDERERS BY TYPE ───

const RenderIconBox: React.FC<{ el: DiagramElement; color: string; fs: boolean }> = ({ el, color, fs }) => {
  const IconComp = getPhosphorIcon(el.icon || "Cube");
  const size = fs ? 48 : 34;
  const iconS = fs ? 26 : 18;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: fs ? 6 : 4 }}>
      <div style={{
        width: size, height: size, borderRadius: fs ? 14 : 10,
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1.5px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 12px ${color}15`,
      }}>
        <IconComp size={iconS} color={color} weight="duotone" style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </div>
      <span style={{ fontSize: fs ? 11 : 9, fontWeight: 600, color: "#94a3b8", textAlign: "center" }}>{el.label}</span>
    </div>
  );
};

const RenderStat: React.FC<{ el: DiagramElement; color: string; fs: boolean }> = ({ el, color, fs }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
    <span style={{
      fontSize: fs ? 24 : 16, fontWeight: 800, color,
      fontFamily: "'SF Mono', monospace", letterSpacing: -1,
      textShadow: `0 0 20px ${color}30`,
    }}>{el.value}</span>
    <span style={{ fontSize: fs ? 10 : 8, fontWeight: 600, color: "#94a3b8", textAlign: "center" }}>{el.label}</span>
    {el.subtitle && <span style={{ fontSize: fs ? 8 : 7, color: "#64748b", textAlign: "center" }}>{el.subtitle}</span>}
  </div>
);

const RenderProgressBar: React.FC<{ el: DiagramElement; color: string; fs: boolean }> = ({ el, color, fs }) => {
  const val = typeof el.value === "number" ? el.value : parseInt(String(el.value)) || 0;
  const max = el.maxValue || 100;
  const pct = Math.min(100, (val / max) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: fs ? 10 : 8, fontWeight: 600, color: "#94a3b8" }}>{el.label}</span>
        <span style={{ fontSize: fs ? 10 : 8, fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>{el.value}</span>
      </div>
      <div style={{ height: fs ? 8 : 5, borderRadius: 4, background: "#1a1a2e", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: color, boxShadow: `0 0 8px ${color}40` }} />
      </div>
    </div>
  );
};

const RenderCode: React.FC<{ el: DiagramElement; fs: boolean }> = ({ el, fs }) => (
  <div style={{
    background: "#0a0a14", borderRadius: 6, padding: fs ? "8px 10px" : "4px 6px",
    fontFamily: "'SF Mono', monospace", fontSize: fs ? 10 : 7, color: "#e2e8f0",
    lineHeight: 1.4, whiteSpace: "pre", overflow: "hidden", width: "100%",
    border: "1px solid #1a1a2e",
  }}>
    {el.code || el.value || "// code"}
  </div>
);

const RenderCard: React.FC<{ el: DiagramElement; color: string; fs: boolean }> = ({ el, color, fs }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
    <span style={{ fontSize: fs ? 10 : 8, fontWeight: 700, color: "#e2e8f0" }}>{el.label}</span>
    {el.items && el.items.map((item, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <span style={{ fontSize: fs ? 9 : 7, color: "#94a3b8", lineHeight: 1.3 }}>{item}</span>
      </div>
    ))}
  </div>
);

const RenderStatus: React.FC<{ el: DiagramElement; fs: boolean }> = ({ el, fs }) => {
  const sColor = statusColors[el.status || "info"] || "#3b82f6";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: fs ? 12 : 8, height: fs ? 12 : 8, borderRadius: "50%",
        background: sColor, boxShadow: `0 0 8px ${sColor}60`,
      }} />
      <span style={{ fontSize: fs ? 10 : 8, fontWeight: 600, color: "#e2e8f0" }}>{el.label}</span>
    </div>
  );
};

const RenderScore: React.FC<{ el: DiagramElement; color: string; fs: boolean }> = ({ el, color, fs }) => {
  const size = fs ? 44 : 32;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `${color}15`, border: `2px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 12px ${color}30`,
      }}>
        <span style={{ fontSize: fs ? 14 : 10, fontWeight: 800, color, fontFamily: "'SF Mono', monospace" }}>
          {el.value}
        </span>
      </div>
      <span style={{ fontSize: fs ? 9 : 7, fontWeight: 600, color: "#94a3b8", textAlign: "center" }}>{el.label}</span>
    </div>
  );
};

const RenderMiniTable: React.FC<{ el: DiagramElement; color: string; fs: boolean }> = ({ el, color, fs }) => (
  <div style={{ width: "100%", fontSize: fs ? 9 : 7, fontFamily: "'SF Mono', monospace" }}>
    {el.headers && (
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1a1a2e", paddingBottom: 2, marginBottom: 2 }}>
        {el.headers.map((h, i) => (
          <span key={i} style={{ flex: 1, fontWeight: 700, color, fontSize: fs ? 8 : 6 }}>{h}</span>
        ))}
      </div>
    )}
    {el.items && el.items.map((row, i) => (
      <div key={i} style={{ display: "flex", gap: 4, padding: "1px 0" }}>
        {row.split("|").map((cell, j) => (
          <span key={j} style={{ flex: 1, color: "#94a3b8" }}>{cell.trim()}</span>
        ))}
      </div>
    ))}
  </div>
);

// Element renderer dispatcher
const RenderElement: React.FC<{ el: DiagramElement; color: string; fs: boolean }> = ({ el, color, fs }) => {
  switch (el.type) {
    case "stat": return <RenderStat el={el} color={color} fs={fs} />;
    case "progress-bar": return <RenderProgressBar el={el} color={color} fs={fs} />;
    case "code": return <RenderCode el={el} fs={fs} />;
    case "card": return <RenderCard el={el} color={color} fs={fs} />;
    case "status": return <RenderStatus el={el} fs={fs} />;
    case "score": return <RenderScore el={el} color={color} fs={fs} />;
    case "mini-table": return <RenderMiniTable el={el} color={color} fs={fs} />;
    case "icon-box":
    default: return <RenderIconBox el={el} color={color} fs={fs} />;
  }
};

// ─── MAIN COMPONENT ───

const InteractiveDiagram: React.FC<Props> = ({
  elements = [],
  timeline = [],
  cols: colsProp,
  accentColor = "#3b82f6",
  progress = 1,
  shapeMode,
  fullScreen = false,
}) => {
  const { fps } = useVideoConfig();
  const isWide = shapeMode === "wide";

  const cols = colsProp || (isWide
    ? Math.min(elements.length, elements.length <= 4 ? elements.length : 4)
    : Math.min(elements.length, 3));

  const gridElements = useMemo(() => computeGrid(elements, cols), [elements, cols]);
  const rows = gridElements.length > 0 ? Math.max(...gridElements.map(e => e.row!)) + 1 : 1;

  const cellW = fullScreen ? 170 : isWide ? 110 : 90;
  const cellH = fullScreen ? 120 : isWide ? 85 : 85;
  const gapX = fullScreen ? 60 : isWide ? 40 : 30;
  const gapY = fullScreen ? 50 : isWide ? 35 : 25;

  const totalW = cols * cellW + (cols - 1) * gapX;
  const totalH = rows * cellH + (rows - 1) * gapY;

  const maxFrame = timeline.length > 0 ? Math.max(...timeline.map(e => e.frame)) + 30 : 100;
  const currentFrame = Math.round(progress * maxFrame);

  const states = computeElementStates(elements, timeline, currentFrame);
  const connections = getActiveConnections(timeline, currentFrame);

  const getCellCenter = (id: string): { x: number; y: number } | null => {
    const el = gridElements.find(e => e.id === id);
    if (!el) return null;
    return { x: el.col! * (cellW + gapX) + cellW / 2, y: el.row! * (cellH + gapY) + cellH / 2 };
  };

  const iconBoxSize = fullScreen ? 48 : 34;

  return (
    <div style={{
      background: fullScreen ? "transparent" : "#0f0f1a",
      borderRadius: fullScreen ? 0 : 12,
      border: fullScreen ? "none" : "1px solid #1a1a2e",
      padding: fullScreen ? 40 : 16,
      fontFamily: "'Inter', system-ui, sans-serif",
      width: fullScreen ? "100%" : "auto",
      position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* SVG connections */}
      <svg width={totalW} height={totalH}
        style={{ position: "absolute", pointerEvents: "none", zIndex: 1 }}>
        {connections.map((conn, i) => {
          const fromPos = getCellCenter(conn.fromId);
          const toPos = getCellCenter(conn.toId);
          if (!fromPos || !toPos) return null;

          const fromEl = elements.find(e => e.id === conn.fromId);
          const lineColor = fromEl?.color || defaultColors[i % defaultColors.length];

          const drawProgress = interpolate(currentFrame,
            [conn.connectFrame, conn.connectFrame + CONNECT_DURATION], [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (drawProgress <= 0) return null;

          const dx = toPos.x - fromPos.x;
          const dy = toPos.y - fromPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) return null;

          const off = iconBoxSize / 2 + 12;
          const sx = fromPos.x + (dx / dist) * off;
          const sy = fromPos.y + (dy / dist) * off;
          const ex = fromPos.x + dx * drawProgress - (dx / dist) * off * (drawProgress > 0.9 ? 1 : 0);
          const ey = fromPos.y + dy * drawProgress - (dy / dist) * off * (drawProgress > 0.9 ? 1 : 0);

          const angle = Math.atan2(dy, dx);
          const arrowS = fullScreen ? 8 : 6;
          const ax = ex - arrowS * Math.cos(angle - 0.4);
          const ay = ey - arrowS * Math.sin(angle - 0.4);
          const bx = ex - arrowS * Math.cos(angle + 0.4);
          const by = ey - arrowS * Math.sin(angle + 0.4);

          return (
            <g key={`c-${i}`}>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={lineColor} strokeWidth={5} strokeOpacity={0.08} strokeLinecap="round" />
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={`${lineColor}60`} strokeWidth={1.5} strokeLinecap="round" />
              {drawProgress > 0.85 && (
                <polygon points={`${ex},${ey} ${ax},${ay} ${bx},${by}`} fill={`${lineColor}70`}
                  opacity={interpolate(drawProgress, [0.85, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
              )}
            </g>
          );
        })}
      </svg>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellH}px)`,
        gap: `${gapY}px ${gapX}px`,
        position: "relative", zIndex: 2,
      }}>
        {gridElements.map((el, i) => {
          const state = states[el.id];
          const color = el.color || defaultColors[i % defaultColors.length];

          if (!state || !state.visible) {
            return <div key={el.id} style={{ gridRow: el.row! + 1, gridColumn: el.col! + 1 }} />;
          }

          const appearProgress = state.appearFrame >= 0
            ? spring({ frame: currentFrame - state.appearFrame, fps, config: { damping: 14, stiffness: 150, mass: 0.8 } }) : 1;
          const appearOpacity = state.appearFrame >= 0
            ? interpolate(currentFrame, [state.appearFrame, state.appearFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

          let glowIntensity = 0, hlScale = 1;
          if (state.highlighted && state.highlightFrame >= 0) {
            const hlP = interpolate(currentFrame, [state.highlightFrame, state.highlightFrame + HIGHLIGHT_DURATION], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            glowIntensity = hlP; hlScale = 1 + hlP * 0.06;
          }

          let elimOpacity = 1, showX = false;
          if (state.eliminated && state.eliminateFrame >= 0) {
            const elP = interpolate(currentFrame, [state.eliminateFrame, state.eliminateFrame + ELIMINATE_DURATION], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            elimOpacity = 1 - elP * 0.6; showX = elP > 0.15;
          }

          return (
            <div key={el.id} style={{
              gridRow: el.row! + 1, gridColumn: el.col! + 1,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: fullScreen ? "10px 8px" : "6px 4px",
              borderRadius: 10,
              background: state.highlighted ? `${color}12` : `${color}06`,
              border: `1px solid ${color}${state.highlighted ? "40" : "12"}`,
              boxShadow: glowIntensity > 0 ? `0 0 ${15 + glowIntensity * 20}px ${color}30` : "none",
              transform: `scale(${appearProgress * hlScale})`,
              opacity: appearOpacity * elimOpacity,
              filter: state.eliminated ? "grayscale(0.7)" : "none",
              position: "relative", overflow: "hidden",
            }}>
              {/* Element content — dispatched by type */}
              <RenderElement el={el} color={color} fs={fullScreen} />

              {/* Badge */}
              {state.badge && state.highlighted && glowIntensity > 0.3 && (
                <div style={{
                  fontSize: fullScreen ? 9 : 7, fontWeight: 700, color: "#0f0f1a",
                  background: color, padding: "2px 6px", borderRadius: 8,
                  fontFamily: "'SF Mono', monospace", marginTop: 3,
                  boxShadow: `0 0 10px ${color}60`,
                  opacity: interpolate(glowIntensity, [0.3, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                }}>
                  {state.badge}
                </div>
              )}

              {/* X overlay for eliminated */}
              {showX && (
                <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
                  <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />
                  <line x1="80%" y1="20%" x2="20%" y2="80%" stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveDiagram;
