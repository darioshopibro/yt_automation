import React from "react";

/**
 * STATISTICS / COUNTER VISUAL
 * Config: { items: [{ label: "Users", value: "10M+", icon?: "Users" }, ...] }
 */

interface StatItem {
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
}

interface Props {
  items: StatItem[];
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

// Count-up effect for stat values — reveals characters with ease-out
const countUpValue = (value: string, progress: number): string => {
  if (progress >= 1) return value;
  // Extract numeric part and suffix
  const match = value.match(/^([\d,.]+)(.*)/);
  if (match) {
    const num = parseFloat(match[1].replace(/,/g, ''));
    const suffix = match[2]; // "M+", "%", "ms", etc.
    const eased = 1 - Math.pow(1 - Math.min(progress * 1.8, 1), 3); // fast ease-out
    const current = Math.round(num * eased);
    // Format with commas if original had them
    const formatted = match[1].includes(',') ? current.toLocaleString() : String(current);
    return formatted + suffix;
  }
  // Non-numeric: just reveal chars
  const chars = Math.ceil(value.length * progress);
  return value.substring(0, chars);
};

const StatsVisual: React.FC<Props> = ({
  items, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const mode = shapeMode ?? (items.length <= 2 ? "wide" : "square");
  const cols = mode === "wide" ? items.length : (items.length <= 4 ? 2 : 3);
  const isCompact = mode === "square";

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: isCompact ? 12 : 20,
      fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
      display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: isCompact ? 10 : 16,
    }}>
      {items.map((item, i) => {
        const color = item.color || defaultColors[i % defaultColors.length];
        const visible = i < Math.ceil(items.length * progress);
        if (!visible) return null;

        return (
          <div key={i} style={{
            background: `${color}08`, border: `1px solid ${color}20`,
            borderRadius: isCompact ? 8 : 10, padding: isCompact ? "10px 8px" : "18px 16px",
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: isCompact ? 2 : 4,
          }}>
            {/* Big number */}
            <span style={{
              fontSize: isCompact ? 22 : 32, fontWeight: 800, color,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              letterSpacing: -1,
              textShadow: `0 0 30px ${color}30`,
              lineHeight: 1,
            }}>
              {countUpValue(item.value, progress)}
            </span>
            {/* Label */}
            <span style={{
              fontSize: isCompact ? 8 : 11, fontWeight: 600, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: isCompact ? 1 : 1.5, marginTop: isCompact ? 2 : 4,
            }}>
              {item.label}
            </span>
            {/* Subtitle */}
            {item.subtitle && (
              <span style={{ fontSize: isCompact ? 8 : 10, color: "#64748b", marginTop: isCompact ? 1 : 2 }}>
                {item.subtitle}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsVisual;
