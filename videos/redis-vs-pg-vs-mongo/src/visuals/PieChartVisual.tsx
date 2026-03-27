import React from "react";

/**
 * PIE / DONUT CHART VISUAL
 * Config: { items: [{ label: "Compute", value: 70, color?: "#3b82f6" }], donut?: true }
 */

interface PieItem {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  items: PieItem[];
  donut?: boolean;
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

const PieChartVisual: React.FC<Props> = ({
  items, donut = true, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const mode = shapeMode ?? "wide";
  const isSquare = mode === "square";
  const total = items.reduce((s, i) => s + i.value, 0);
  const cx = 100, cy = 100, r = 80;
  const innerR = donut ? 50 : 0;

  let currentAngle = 0;
  const segments = items.map((item, i) => {
    const angle = (item.value / total) * 360 * progress;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    const color = item.color || defaultColors[i % defaultColors.length];
    const midAngle = startAngle + angle / 2;
    const labelPos = polarToCartesian(cx, cy, r + 18, midAngle);
    return { ...item, color, startAngle, endAngle, angle, labelPos, pct: Math.round((item.value / total) * 100) };
  });

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: 20,
      fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
      display: "flex", flexDirection: isSquare ? "column" : "row", alignItems: "center", gap: isSquare ? 16 : 24,
    }}>
      {/* Chart */}
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        {segments.map((seg, i) => {
          if (seg.angle < 0.5) return null;
          const path = seg.angle >= 359.5
            ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
            : (() => {
                const s = polarToCartesian(cx, cy, r, seg.endAngle);
                const e = polarToCartesian(cx, cy, r, seg.startAngle);
                const la = seg.angle > 180 ? 1 : 0;
                if (innerR > 0) {
                  const si = polarToCartesian(cx, cy, innerR, seg.endAngle);
                  const ei = polarToCartesian(cx, cy, innerR, seg.startAngle);
                  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${la} 0 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${innerR} ${innerR} 0 ${la} 1 ${si.x} ${si.y} Z`;
                }
                return `M ${cx} ${cy} L ${e.x} ${e.y} A ${r} ${r} 0 ${la} 1 ${s.x} ${s.y} Z`;
              })();
          return (
            <path key={i} d={path} fill={seg.color} opacity={0.85}
              style={{ filter: `drop-shadow(0 0 8px ${seg.color}40)` }}
            />
          );
        })}
        {/* Center label for donut */}
        {donut && (
          <text x={cx} y={cy + 4} textAnchor="middle" fill="#f8fafc" fontSize={18} fontWeight={700}
            fontFamily="'SF Mono', monospace">
            {Math.round(progress * 100)}%
          </text>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0,
              boxShadow: `0 0 8px ${seg.color}40`,
            }} />
            <span style={{ fontSize: 12, color: "#e2e8f0", flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: 12, color: seg.color, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
              {seg.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartVisual;
