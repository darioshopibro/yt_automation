import React from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

/**
 * LOGO GRID VISUAL
 * Config: { items: [{ icon: "Lightning", label: "Docker", color?: "#2496ed" }], cols?: 3 }
 * icon must be PascalCase Phosphor icon name
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

const getPhosphorIcon = (name: string): React.FC<any> => {
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComp = (PhosphorIcons as Record<string, unknown>)[pascal];
  if (IconComp) return IconComp as React.FC<any>;
  // Try exact name
  const exact = (PhosphorIcons as Record<string, unknown>)[name];
  if (exact) return exact as React.FC<any>;
  return Cube as React.FC<any>;
};

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
        const IconComponent = getPhosphorIcon(item.icon);
        return (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            padding: "14px 8px", borderRadius: 10,
            background: `${color}08`, border: `1px solid ${color}15`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `linear-gradient(135deg, ${color}20, ${color}08)`,
              border: `1.5px solid ${color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 15px ${color}15`,
            }}>
              <IconComponent size={24} color={color} weight={"duotone" as any} style={{
                filter: `drop-shadow(0 0 8px ${color}60)`,
              }} />
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
