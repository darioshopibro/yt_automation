import React from "react";

/**
 * HIERARCHY / TREE VISUAL
 * Config: { root: { label: "App", children: [{ label: "API", children: [...] }] } }
 */

interface TreeNode {
  label: string;
  color?: string;
  children?: TreeNode[];
}

interface Props {
  root: TreeNode;
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

function RenderNodeVertical({ node, depth, colorIdx, progress }: { node: TreeNode; depth: number; colorIdx: number; progress: number }) {
  const color = node.color || defaultColors[colorIdx % defaultColors.length];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* Node box */}
      <div style={{
        background: `${color}10`, border: `1.5px solid ${color}30`, borderRadius: 10,
        padding: "8px 16px", minWidth: 60, textAlign: "center",
        boxShadow: depth === 0 ? `0 0 20px ${color}20` : "none",
      }}>
        <span style={{
          fontSize: depth === 0 ? 13 : 11, fontWeight: depth === 0 ? 700 : 600,
          color: depth === 0 ? color : "#e2e8f0",
          fontFamily: "'SF Mono', monospace",
        }}>{node.label}</span>
      </div>

      {/* Children */}
      {hasChildren && progress > 0 && (
        <>
          {/* Vertical connector */}
          <div style={{ width: 2, height: 16, background: `${color}30` }} />
          {/* Horizontal bar */}
          {node.children!.length > 1 && (
            <div style={{
              height: 2, background: `${color}20`,
              width: `${Math.max(60, (node.children!.length - 1) * 100)}px`,
              marginBottom: 0,
            }} />
          )}
          {/* Children row */}
          <div style={{ display: "flex", gap: 12, marginTop: 0 }}>
            {node.children!.map((child, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 2, height: 12, background: `${defaultColors[(colorIdx + i + 1) % defaultColors.length]}30` }} />
                <RenderNodeVertical node={child} depth={depth + 1} colorIdx={colorIdx + i + 1} progress={progress} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RenderNodeHorizontal({ node, depth, colorIdx, progress }: { node: TreeNode; depth: number; colorIdx: number; progress: number }) {
  const color = node.color || defaultColors[colorIdx % defaultColors.length];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 0 }}>
      {/* Node box */}
      <div style={{
        background: `${color}10`, border: `1.5px solid ${color}30`, borderRadius: 10,
        padding: "8px 16px", minWidth: 60, textAlign: "center",
        boxShadow: depth === 0 ? `0 0 20px ${color}20` : "none",
      }}>
        <span style={{
          fontSize: depth === 0 ? 13 : 11, fontWeight: depth === 0 ? 700 : 600,
          color: depth === 0 ? color : "#e2e8f0",
          fontFamily: "'SF Mono', monospace",
        }}>{node.label}</span>
      </div>

      {/* Children (horizontal: laid out to the right) */}
      {hasChildren && progress > 0 && (
        <>
          {/* Horizontal connector */}
          <div style={{ height: 2, width: 16, background: `${color}30` }} />
          {/* Vertical bar for multiple children */}
          {node.children!.length > 1 && (
            <div style={{
              width: 2, background: `${color}20`,
              height: `${Math.max(30, (node.children!.length - 1) * 50)}px`,
            }} />
          )}
          {/* Children column (stacked vertically, branching right) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {node.children!.map((child, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <div style={{ height: 2, width: 12, background: `${defaultColors[(colorIdx + i + 1) % defaultColors.length]}30` }} />
                <RenderNodeHorizontal node={child} depth={depth + 1} colorIdx={colorIdx + i + 1} progress={progress} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const HierarchyVisual: React.FC<Props> = ({ root, accentColor = "#3b82f6", progress = 1, shapeMode }) => {
  const isHorizontal = shapeMode === "wide";

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: 24,
      display: "flex", justifyContent: "center", alignItems: isHorizontal ? "center" : undefined,
    }}>
      {isHorizontal
        ? <RenderNodeHorizontal node={root} depth={0} colorIdx={0} progress={progress} />
        : <RenderNodeVertical node={root} depth={0} colorIdx={0} progress={progress} />
      }
    </div>
  );
};

export default HierarchyVisual;
