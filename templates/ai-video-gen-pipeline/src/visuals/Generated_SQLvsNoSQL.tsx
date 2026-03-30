import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

const colors = {
  sql: "#3b82f6",
  nosql: "#22c55e",
  tradeoff: "#f59e0b",
  stat: "#a855f7",
};

const sqlFeatures = [
  { label: "Structured Tables", icon: "Table" },
  { label: "Strict Schemas", icon: "TreeStructure" },
  { label: "ACID Compliance", icon: "ShieldCheck" },
  { label: "Complex Joins", icon: "GitMerge" },
];

const nosqlFeatures = [
  { label: "Flexible Documents", icon: "FileDoc" },
  { label: "No Schema Required", icon: "Eraser" },
  { label: "Horizontal Scaling", icon: "ArrowsOutLineHorizontal" },
  { label: "Blazing Fast Reads", icon: "Lightning" },
];

const Generated_SQLvsNoSQL: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === TIMELINE ===
  const titleStart = 0;
  const sqlPanelStart = 12;
  const sqlFeaturesStart = 22;
  const nosqlPanelStart = 40;
  const nosqlFeaturesStart = 50;
  const tradeoffStart = 80;
  const statsStart = 100;

  // === TITLE ===
  const titleScale = spring({ frame: frame - titleStart, fps, config: { damping: 14, stiffness: 150 } });
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // === DIVIDER LINE ===
  const dividerProgress = interpolate(frame, [sqlPanelStart, nosqlPanelStart + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // === SQL PANEL ===
  const sqlPanelScale = spring({ frame: frame - sqlPanelStart, fps, config: { damping: 16, stiffness: 140 } });
  const sqlPanelOpacity = interpolate(frame, [sqlPanelStart, sqlPanelStart + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // === NOSQL PANEL ===
  const nosqlPanelScale = spring({ frame: frame - nosqlPanelStart, fps, config: { damping: 16, stiffness: 140 } });
  const nosqlPanelOpacity = interpolate(frame, [nosqlPanelStart, nosqlPanelStart + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // === TRADEOFF ===
  const tradeoffScale = spring({ frame: frame - tradeoffStart, fps, config: { damping: 14, stiffness: 150 } });
  const tradeoffOpacity = interpolate(frame, [tradeoffStart, tradeoffStart + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // === STATS ===
  const statsScale = spring({ frame: frame - statsStart, fps, config: { damping: 14, stiffness: 150 } });
  const statsOpacity = interpolate(frame, [statsStart, statsStart + 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const sqlCountUp = interpolate(frame, [statsStart, statsStart + 40], [0, 10000], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const nosqlCountUp = interpolate(frame, [statsStart, statsStart + 40], [0, 100000], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const renderFeatureBadge = (
    feature: { label: string; icon: string },
    index: number,
    startFrame: number,
    color: string,
  ) => {
    const delay = index * 8;
    const badgeScale = spring({ frame: frame - startFrame - delay, fps, config: { damping: 14, stiffness: 150 } });
    const badgeOpacity = interpolate(frame, [startFrame + delay, startFrame + delay + 8], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const Icon = getIcon(feature.icon);

    return (
      <div
        key={feature.label}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", borderRadius: 10,
          background: `${color}08`,
          border: `1px solid ${color}15`,
          transform: `scale(${badgeScale})`,
          opacity: badgeOpacity,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1.5px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 12px ${color}15`,
          flexShrink: 0,
        }}>
          <Icon size={20} color={color} weight="duotone" style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
        </div>
        <span style={{
          fontSize: 16, fontWeight: 600, color: "#e2e8f0",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {feature.label}
        </span>
      </div>
    );
  };

  const renderStatCard = (
    label: string,
    value: number,
    suffix: string,
    color: string,
    icon: string,
  ) => {
    const Icon = getIcon(icon);
    const displayValue = value >= 1000 ? `${Math.round(value / 1000)}K` : Math.round(value).toString();

    return (
      <div style={{
        flex: 1, padding: "20px 24px", borderRadius: 12,
        background: `${color}08`,
        border: `1px solid ${color}15`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        transform: `scale(${statsScale})`,
        opacity: statsOpacity,
      }}>
        <Icon size={28} color={color} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
        <div style={{
          fontSize: 32, fontWeight: 700, color,
          fontFamily: "'SF Mono', monospace",
          letterSpacing: -1,
          textShadow: `0 0 30px ${color}30`,
        }}>
          {displayValue}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "#94a3b8",
          fontFamily: "'SF Mono', monospace",
          textTransform: "uppercase", letterSpacing: 1.5,
        }}>
          {suffix}
        </div>
        <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'Inter', system-ui, sans-serif" }}>
          {label}
        </div>
      </div>
    );
  };

  const PostgresIcon = getIcon("Database");
  const MongoIcon = getIcon("Leaf");

  return (
    <div style={{
      width: 1920, height: 1080,
      padding: 80,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      gap: 32,
      background: "#0f0f1a",
      position: "relative",
    }}>
      {/* MESH GRADIENT BG */}
      <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.5, top: 0, left: 0 }}>
        <defs>
          <radialGradient id="mesh1" cx="20%" cy="30%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="mesh2" cx="50%" cy="60%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="mesh3" cx="80%" cy="40%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="20%" cy="30%" rx="35%" ry="30%" fill="url(#mesh1)" />
        <ellipse cx="50%" cy="60%" rx="40%" ry="35%" fill="url(#mesh2)" />
        <ellipse cx="80%" cy="40%" rx="35%" ry="30%" fill="url(#mesh3)" />
      </svg>

      {/* GRID BG */}
      <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.08, top: 0, left: 0 }}>
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="gridFade" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)" />
      </svg>

      {/* TITLE */}
      <div style={{
        fontSize: 28, fontWeight: 700, color: "#e2e8f0",
        letterSpacing: -0.5,
        transform: `scale(${titleScale})`,
        opacity: titleOpacity,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ color: colors.sql }}>SQL</span>
        <span style={{ color: "#64748b", fontSize: 20, fontStyle: "italic" }}>vs</span>
        <span style={{ color: colors.nosql }}>NoSQL</span>
      </div>

      {/* MAIN COMPARISON — TWO PANELS */}
      <div style={{
        display: "flex", gap: 0, width: "100%", flex: 1,
        alignItems: "stretch",
      }}>
        {/* SQL PANEL */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 16,
          padding: "28px 32px",
          background: `${colors.sql}04`,
          borderRadius: "12px 0 0 12px",
          border: `1px solid ${colors.sql}10`,
          borderRight: "none",
          transform: `scale(${sqlPanelScale})`,
          opacity: sqlPanelOpacity,
        }}>
          {/* SQL Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.sql}20, ${colors.sql}08)`,
              border: `1.5px solid ${colors.sql}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 15px ${colors.sql}15`,
            }}>
              <PostgresIcon size={28} color={colors.sql} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${colors.sql}60)` }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.sql }}>PostgreSQL</div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: "#64748b",
                fontFamily: "'SF Mono', monospace",
                textTransform: "uppercase", letterSpacing: 1.5,
              }}>
                Relational Database
              </div>
            </div>
          </div>

          {/* SQL Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sqlFeatures.map((f, i) => renderFeatureBadge(f, i, sqlFeaturesStart, colors.sql))}
          </div>
        </div>

        {/* DIVIDER */}
        <div style={{
          width: 2, background: `linear-gradient(180deg, transparent 0%, #64748b40 20%, #64748b40 80%, transparent 100%)`,
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          clipPath: `inset(${(1 - dividerProgress) * 50}% 0)`,
        }}>
          <div style={{
            position: "absolute",
            background: "#0f0f1a",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #1a1a2e",
          }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: "#94a3b8",
              textTransform: "uppercase", fontStyle: "italic",
              fontFamily: "'SF Mono', monospace",
            }}>
              vs
            </span>
          </div>
        </div>

        {/* NOSQL PANEL */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 16,
          padding: "28px 32px",
          background: `${colors.nosql}04`,
          borderRadius: "0 12px 12px 0",
          border: `1px solid ${colors.nosql}10`,
          borderLeft: "none",
          transform: `scale(${nosqlPanelScale})`,
          opacity: nosqlPanelOpacity,
        }}>
          {/* NoSQL Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.nosql}20, ${colors.nosql}08)`,
              border: `1.5px solid ${colors.nosql}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 15px ${colors.nosql}15`,
            }}>
              <MongoIcon size={28} color={colors.nosql} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${colors.nosql}60)` }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: colors.nosql }}>MongoDB</div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: "#64748b",
                fontFamily: "'SF Mono', monospace",
                textTransform: "uppercase", letterSpacing: 1.5,
              }}>
                Document Database
              </div>
            </div>
          </div>

          {/* NoSQL Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {nosqlFeatures.map((f, i) => renderFeatureBadge(f, i, nosqlFeaturesStart, colors.nosql))}
          </div>
        </div>
      </div>

      {/* TRADEOFF SECTION */}
      <div style={{
        display: "flex", alignItems: "center", gap: 32, width: "100%",
        padding: "16px 24px",
        background: `${colors.tradeoff}06`,
        borderRadius: 12,
        border: `1px solid ${colors.tradeoff}12`,
        transform: `scale(${tradeoffScale})`,
        opacity: tradeoffOpacity,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `linear-gradient(135deg, ${colors.tradeoff}20, ${colors.tradeoff}08)`,
          border: `1.5px solid ${colors.tradeoff}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 12px ${colors.tradeoff}15`,
          flexShrink: 0,
        }}>
          {React.createElement(getIcon("Scales"), { size: 22, color: colors.tradeoff, weight: "duotone", style: { filter: `drop-shadow(0 0 6px ${colors.tradeoff}60)` } })}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.sql }}>Consistency</span>
          <span style={{ fontSize: 14, color: "#64748b", fontStyle: "italic" }}>vs</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.nosql }}>Speed</span>
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginLeft: "auto" }}>
          The core tradeoff
        </div>
      </div>

      {/* PERFORMANCE STATS */}
      <div style={{
        display: "flex", gap: 24, width: "100%",
      }}>
        {renderStatCard("PostgreSQL", sqlCountUp, "TPS", colors.sql, "Database")}
        {renderStatCard("MongoDB", nosqlCountUp, "reads/sec", colors.nosql, "Leaf")}
      </div>
    </div>
  );
};

export default Generated_SQLvsNoSQL;
