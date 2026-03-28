import React from "react";

/**
 * BAR CHART VISUAL
 * Config: { items: [{ label: "React", value: 40, color?: "#3b82f6" }], unit?: "%", maxValue?: 100 }
 */

interface BarItem {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  items: BarItem[];
  unit?: string;
  maxValue?: number;
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

// Ease-out curve — fills fast at start, slows at end (looks snappy)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const BarChartVisual: React.FC<Props> = ({
  items, unit = "", maxValue, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const mode = shapeMode ?? "square";
  const isWide = mode === "wide";
  const max = maxValue || Math.max(...items.map(i => i.value)) * 1.1;
  // Bars fill with ease-out curve — fast start, smooth finish
  const easedProgress = easeOut(Math.min(progress * 1.5, 1)); // 1.5x speed = fills in first 66% of duration

  if (isWide) {
    // Horizontal row of vertical bars
    return (
      <div style={{
        background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: "20px 24px",
        fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 160 }}>
          {items.map((item, i) => {
            const color = item.color || defaultColors[i % defaultColors.length];
            const heightPct = (item.value / max) * 100 * easedProgress;
            const displayVal = Math.round(item.value * easedProgress);

            return (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%",
                justifyContent: "flex-end", gap: 6,
              }}>
                <span style={{ fontSize: 11, color, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
                  {displayVal}{unit}
                </span>
                <div style={{
                  width: "100%", borderRadius: 6, background: "#1a1a2e", overflow: "hidden",
                  height: `${heightPct}%`, minHeight: 4, position: "relative",
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: 6,
                    background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                    boxShadow: `0 0 20px ${color}30`,
                  }} />
                </div>
                <span style={{ fontSize: 10, color: "#e2e8f0", fontWeight: 500, textAlign: "center" }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: "20px 24px",
      fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((item, i) => {
          const color = item.color || defaultColors[i % defaultColors.length];
          const widthPct = (item.value / max) * 100 * easedProgress;
          const displayVal = Math.round(item.value * easedProgress);

          return (
            <div key={i}>
              {/* Label + value */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
                  {displayVal}{unit}
                </span>
              </div>
              {/* Bar track */}
              <div style={{
                height: 24, borderRadius: 6, background: "#1a1a2e", overflow: "hidden",
                position: "relative",
              }}>
                {/* Bar fill */}
                <div style={{
                  height: "100%", borderRadius: 6, width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  boxShadow: `0 0 20px ${color}30`,
                  transition: "width 0.3s ease-out",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChartVisual;
