import React from "react";

/**
 * LIST / BULLET POINTS VISUAL
 * Config: { style: "bullet"|"numbered"|"checklist", items: ["Item 1", "Item 2"], icons?: ["Check", "X"] }
 */

interface Props {
  items: string[];
  style?: "bullet" | "numbered" | "checklist";
  icons?: string[]; // optional per-item icon override
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const bulletSymbols = {
  bullet: "\u2022",
  numbered: "", // uses index
  checklist: "\u2713",
};

const ListVisual: React.FC<Props> = ({
  items, style = "bullet", accentColor = "#3b82f6", progress = 1, shapeMode = "square",
}) => {
  const isWide = shapeMode === "wide";
  const visibleCount = Math.ceil(items.length * progress);
  const visibleItems = items.slice(0, visibleCount);

  const renderItem = (item: string, i: number) => {
    const isChecklist = style === "checklist";
    const isNumbered = style === "numbered";

    return (
      <div key={i} style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "10px 0",
        borderBottom: i < items.length - 1 ? "1px solid #1a1a2e08" : "none",
      }}>
        {/* Bullet/Number/Check */}
        <div style={{
          width: 28, height: 28, borderRadius: isChecklist ? 6 : "50%",
          background: isChecklist ? `${accentColor}20` : `${accentColor}15`,
          border: `1.5px solid ${accentColor}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}>
          <span style={{
            color: accentColor, fontSize: isNumbered ? 12 : 14,
            fontWeight: 700,
            fontFamily: isNumbered ? "'SF Mono', monospace" : "inherit",
          }}>
            {isNumbered ? i + 1 : isChecklist ? "\u2713" : "\u2022"}
          </span>
        </div>
        {/* Text */}
        <span style={{
          color: "#e2e8f0", fontSize: 14, lineHeight: 1.5,
          paddingTop: 3,
        }}>
          {item}
        </span>
      </div>
    );
  };

  if (isWide) {
    const mid = Math.ceil(visibleItems.length / 2);
    const leftCol = visibleItems.slice(0, mid);
    const rightCol = visibleItems.slice(mid);

    return (
      <div style={{
        background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: "20px 24px",
        fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
        display: "flex", gap: 32,
      }}>
        <div style={{ flex: 1 }}>{leftCol.map((item, i) => renderItem(item, i))}</div>
        <div style={{ flex: 1 }}>{rightCol.map((item, i) => renderItem(item, mid + i))}</div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: "20px 24px",
      fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
    }}>
      {visibleItems.map((item, i) => renderItem(item, i))}
    </div>
  );
};

export default ListVisual;
