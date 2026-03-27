import React from "react";

/**
 * SPLIT SCREEN / DUAL PANEL VISUAL
 * Config: { left: { title, items }, right: { title, items }, leftColor?, rightColor?, dividerLabel? }
 */

interface PanelSide {
  title: string;
  items: string[];
}

interface Props {
  left: PanelSide;
  right: PanelSide;
  leftColor?: string;
  rightColor?: string;
  dividerLabel?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const SplitScreenVisual: React.FC<Props> = ({
  left, right, leftColor = "#ef4444", rightColor = "#22c55e",
  dividerLabel = "vs", progress = 1, shapeMode,
}) => {
  const mode = shapeMode ?? "wide";
  const isSquare = mode === "square";
  const leftVisible = Math.ceil(left.items.length * progress);
  const rightVisible = Math.ceil(right.items.length * progress);

  const renderPanel = (panel: PanelSide, color: string, visCount: number, isRight: boolean) => (
    <div style={{ flex: 1, padding: "16px 20px" }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color, textTransform: "uppercase",
        letterSpacing: 1.5, marginBottom: 14, textAlign: isRight ? "left" : "left",
        fontFamily: "'SF Mono', monospace",
      }}>
        {panel.title}
      </div>
      {panel.items.slice(0, visCount).map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0,
            boxShadow: `0 0 8px ${color}40`,
          }} />
          <span style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.4 }}>{item}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", overflow: "hidden",
      display: "flex", flexDirection: isSquare ? "column" : "row", position: "relative",
    }}>
      {renderPanel(left, leftColor, leftVisible, false)}

      {/* Divider */}
      <div style={{
        ...(isSquare
          ? { height: 1, width: "100%", background: "#1a1a2e", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }
          : { width: 1, background: "#1a1a2e", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }
        ),
      }}>
        {dividerLabel && (
          <div style={{
            position: "absolute", background: "#0f0f1a", padding: "6px 8px",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: "#94a3b8",
              textTransform: "uppercase", fontStyle: "italic",
            }}>{dividerLabel}</span>
          </div>
        )}
      </div>

      {renderPanel(right, rightColor, rightVisible, true)}
    </div>
  );
};

export default SplitScreenVisual;
