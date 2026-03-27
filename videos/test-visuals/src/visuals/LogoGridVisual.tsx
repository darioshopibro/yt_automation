import React from "react";

/**
 * LOGO GRID VISUAL
 * Config: { items: [{ icon: "Docker", label: "Docker", color?: "#2496ed" }], cols?: 3 }
 */

interface LogoItem {
  icon: string;
  label: string;
  color?: string;
}

interface Props {
  items: LogoItem[];
  cols?: number;
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

const LogoGridVisual: React.FC<Props> = ({
  items, cols, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const baseCols = cols || (items.length <= 3 ? items.length : items.length <= 6 ? 3 : 4);
  const gridCols = shapeMode === "wide" ? items.length : baseCols;
  const visibleCount = Math.ceil(items.length * progress);

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: 20,
      display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 14,
    }}>
      {items.slice(0, visibleCount).map((item, i) => {
        const color = item.color || defaultColors[i % defaultColors.length];
        return (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "14px 8px", borderRadius: 10,
            background: `${color}08`, border: `1px solid ${color}15`,
          }}>
            {/* Icon placeholder — circle with first letter */}
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `linear-gradient(135deg, ${color}20, ${color}08)`,
              border: `1.5px solid ${color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color,
              boxShadow: `0 0 15px ${color}15`,
            }}>
              {item.icon.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "#94a3b8",
              textAlign: "center", lineHeight: 1.2,
            }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LogoGridVisual;
