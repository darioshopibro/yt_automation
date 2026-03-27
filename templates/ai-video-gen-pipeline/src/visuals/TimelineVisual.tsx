import React from "react";

/**
 * TIMELINE VISUAL
 * Config: { items: [{ label: "2020", description: "v1 Release", icon?: "Rocket" }], direction?: "horizontal"|"vertical" }
 */

interface TimelineItem {
  label: string;
  description?: string;
  color?: string;
}

interface Props {
  items: TimelineItem[];
  direction?: "horizontal" | "vertical";
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

const TimelineVisual: React.FC<Props> = ({
  items, direction = "horizontal", accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const visibleCount = Math.ceil(items.length * progress);
  const effectiveDirection = shapeMode === "square" ? "vertical" : shapeMode === "wide" ? "horizontal" : direction;

  if (effectiveDirection === "vertical") {
    return (
      <div style={{ background: "#0f0f1a", borderRadius: 12, padding: "24px 28px", border: "1px solid #1a1a2e", fontFamily: "'Inter', sans-serif", width: "100%" }}>
        {items.slice(0, visibleCount).map((item, i) => {
          const color = item.color || defaultColors[i % defaultColors.length];
          const isLast = i === items.length - 1;
          return (
            <div key={i} style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}60`, flexShrink: 0, border: "2px solid #0f0f1a" }} />
                {!isLast && <div style={{ width: 2, flex: 1, background: `linear-gradient(${color}60, ${defaultColors[(i + 1) % defaultColors.length]}30)`, minHeight: 30 }} />}
              </div>
              <div style={{ paddingBottom: 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>{item.label}</span>
                {item.description && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, lineHeight: 1.4 }}>{item.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: "28px 24px", border: "1px solid #1a1a2e", fontFamily: "'Inter', sans-serif", width: "100%" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Horizontal line */}
        <div style={{ position: "absolute", top: 6, left: 7, right: 7, height: 2, background: "#1a1a2e" }}>
          <div style={{ height: "100%", width: `${(visibleCount / items.length) * 100}%`, background: `linear-gradient(90deg, ${defaultColors[0]}, ${defaultColors[Math.min(visibleCount - 1, defaultColors.length - 1)]})`, boxShadow: `0 0 10px ${accentColor}30` }} />
        </div>
        {items.slice(0, visibleCount).map((item, i) => {
          const color = item.color || defaultColors[i % defaultColors.length];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", flex: 1 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 12px ${color}60`, border: "2px solid #0f0f1a", zIndex: 1 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "'SF Mono', monospace" }}>{item.label}</span>
              {item.description && <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", maxWidth: 100, lineHeight: 1.3 }}>{item.description}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineVisual;
