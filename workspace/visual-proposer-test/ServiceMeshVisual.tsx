import React, { useRef, useEffect, useState } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

/**
 * SERVICE MESH VISUAL
 * Config: {
 *   nodes: [{ label: "API Gateway", icon: "ShieldCheck", color?: "#f59e0b", role?: "gateway" }],
 *   connections: [{ from: "API Gateway", to: "User Service", label?: "REST", style?: "dashed" }]
 * }
 */

interface MeshNode {
  label: string;
  icon?: string;
  color?: string;
  role?: "gateway" | "service" | "database" | "queue";
}

interface MeshConnection {
  from: string;
  to: string;
  label?: string;
  style?: "solid" | "dashed";
}

interface Props {
  nodes: MeshNode[];
  connections: MeshConnection[];
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const getPhosphorIcon = (name: string): React.FC<any> => {
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  const IconComp = (PhosphorIcons as Record<string, unknown>)[pascal];
  if (IconComp) return IconComp as React.FC<any>;
  const exact = (PhosphorIcons as Record<string, unknown>)[name];
  if (exact) return exact as React.FC<any>;
  return Cube as React.FC<any>;
};

const defaultIcons: Record<string, string> = {
  gateway: "ShieldCheck",
  service: "Cube",
  database: "Database",
  queue: "Queue",
};

const ServiceMeshVisual: React.FC<Props> = ({
  nodes, connections, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const mode = shapeMode ?? "square";
  const isWide = mode === "wide";
  const easedProgress = easeOut(Math.min(progress * 1.5, 1));

  const visibleNodeCount = Math.ceil(nodes.length * Math.min(easedProgress * 1.4, 1));
  const visibleConnCount = Math.ceil(connections.length * Math.max((easedProgress - 0.3) / 0.7, 0));

  const gridCols = isWide
    ? Math.min(nodes.length, nodes.length <= 4 ? nodes.length : 4)
    : Math.min(nodes.length, 3);

  // Refs for computing connection positions
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [connLines, setConnLines] = useState<Array<{
    sx: number; sy: number; ex: number; ey: number;
    color: string; label?: string; dashed: boolean;
  }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const lines: typeof connLines = [];

    for (let i = 0; i < Math.min(visibleConnCount, connections.length); i++) {
      const conn = connections[i];
      const fromEl = nodeRefs.current[conn.from];
      const toEl = nodeRefs.current[conn.to];
      if (!fromEl || !toEl) continue;

      const fRect = fromEl.getBoundingClientRect();
      const tRect = toEl.getBoundingClientRect();

      const fcx = fRect.left - cRect.left + fRect.width / 2;
      const fcy = fRect.top - cRect.top + fRect.height / 2;
      const tcx = tRect.left - cRect.left + tRect.width / 2;
      const tcy = tRect.top - cRect.top + tRect.height / 2;

      const dx = tcx - fcx;
      const dy = tcy - fcy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) continue;

      const offFrom = Math.min(fRect.width, fRect.height) / 2 + 4;
      const offTo = Math.min(tRect.width, tRect.height) / 2 + 4;

      const fromNode = nodes.find(n => n.label === conn.from);
      const color = fromNode?.color || defaultColors[nodes.indexOf(fromNode!) % defaultColors.length];

      lines.push({
        sx: fcx + (dx / dist) * offFrom,
        sy: fcy + (dy / dist) * offFrom,
        ex: tcx - (dx / dist) * offTo,
        ey: tcy - (dy / dist) * offTo,
        color,
        label: conn.label,
        dashed: conn.style === "dashed",
      });
    }
    setConnLines(lines);
  }, [visibleNodeCount, visibleConnCount, isWide, nodes, connections]);

  if (!nodes || nodes.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e",
        padding: 20, fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
        position: "relative",
      }}
    >
      {/* Connection lines — SVG overlay */}
      <svg style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        pointerEvents: "none", overflow: "visible",
      }}>
        {connLines.map((line, i) => (
          <g key={`conn-${i}`}>
            {/* Glow line */}
            <line
              x1={line.sx} y1={line.sy} x2={line.ex} y2={line.ey}
              stroke={line.color} strokeWidth={4} strokeOpacity={0.06}
              strokeDasharray={line.dashed ? "6,4" : undefined}
            />
            {/* Main line */}
            <line
              x1={line.sx} y1={line.sy} x2={line.ex} y2={line.ey}
              stroke={`${line.color}40`} strokeWidth={1.5}
              strokeDasharray={line.dashed ? "6,4" : undefined}
            />
            {/* Arrow head */}
            {(() => {
              const angle = Math.atan2(line.ey - line.sy, line.ex - line.sx);
              const ax = line.ex - 7 * Math.cos(angle - 0.4);
              const ay = line.ey - 7 * Math.sin(angle - 0.4);
              const bx = line.ex - 7 * Math.cos(angle + 0.4);
              const by = line.ey - 7 * Math.sin(angle + 0.4);
              return <polygon points={`${line.ex},${line.ey} ${ax},${ay} ${bx},${by}`} fill={`${line.color}50`} />;
            })()}
            {/* Label pill */}
            {line.label && (() => {
              const mx = (line.sx + line.ex) / 2;
              const my = (line.sy + line.ey) / 2;
              const lw = line.label.length * 6.5 + 16;
              return (
                <>
                  <rect x={mx - lw / 2} y={my - 9} width={lw} height={18}
                    rx={9} fill="#0f0f1a" stroke={`${line.color}30`} strokeWidth={1} />
                  <text x={mx} y={my + 3.5} textAnchor="middle"
                    fill={line.color} fontSize={9} fontWeight={600}
                    fontFamily="'SF Mono', monospace" opacity={0.7}>
                    {line.label}
                  </text>
                </>
              );
            })()}
          </g>
        ))}
      </svg>

      {/* Node grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: 14,
        position: "relative",
        zIndex: 2,
      }}>
        {nodes.slice(0, visibleNodeCount).map((node, i) => {
          const color = node.color || defaultColors[i % defaultColors.length];
          const isGateway = node.role === "gateway";
          const iconName = node.icon || defaultIcons[node.role || "service"];
          const IconComponent = getPhosphorIcon(iconName);

          return (
            <div
              key={i}
              ref={(el) => { nodeRefs.current[node.label] = el; }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                padding: "14px 8px", borderRadius: 10,
                background: `${color}${isGateway ? "12" : "08"}`,
                border: `${isGateway ? "2" : "1"}px solid ${color}${isGateway ? "40" : "15"}`,
                boxShadow: isGateway ? `0 0 20px ${color}20` : "none",
              }}
            >
              {/* Icon box — same as LogoGrid */}
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
              {/* Label */}
              <span style={{
                fontSize: 10, fontWeight: 600, color: "#94a3b8",
                textAlign: "center", lineHeight: 1.2,
              }}>{node.label}</span>
              {/* Role badge for gateway */}
              {isGateway && (
                <span style={{
                  fontSize: 7, fontWeight: 800, color,
                  textTransform: "uppercase", letterSpacing: 1,
                  opacity: 0.6, marginTop: -4,
                }}>GATEWAY</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceMeshVisual;
