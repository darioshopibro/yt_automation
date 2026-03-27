import React from "react";

/**
 * TABLE VISUAL
 * Config: { headers: ["Feature", "React", "Vue"], rows: [["Virtual DOM", "Yes", "No"], ...], highlightCol?: 1 }
 */

interface Props {
  headers: string[];
  rows: string[][];
  highlightCol?: number;
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const TableVisual: React.FC<Props> = ({
  headers, rows, highlightCol, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const mode = shapeMode ?? "wide";
  const isSquare = mode === "square";
  const visibleRows = Math.ceil(rows.length * progress);

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", overflow: "hidden",
      fontFamily: "'Inter', system-ui, sans-serif", width: "100%",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: isSquare ? "10px 10px" : "12px 16px", textAlign: "left", fontSize: isSquare ? 9 : 11,
                fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5,
                color: i === highlightCol ? accentColor : "#94a3b8",
                borderBottom: `2px solid ${i === highlightCol ? accentColor : "#1a1a2e"}`,
                background: i === highlightCol ? `${accentColor}08` : "transparent",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, visibleRows).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                const isFirst = ci === 0;
                const isHlCol = ci === highlightCol;
                const isCheck = cell === "Yes" || cell === "\u2713" || cell === "true";
                const isCross = cell === "No" || cell === "\u2717" || cell === "false";
                return (
                  <td key={ci} style={{
                    padding: isSquare ? "8px 10px" : "10px 16px", fontSize: isSquare ? 11 : 13,
                    color: isCheck ? "#22c55e" : isCross ? "#ef4444" : isFirst ? "#e2e8f0" : "#94a3b8",
                    fontWeight: isFirst ? 600 : 400,
                    borderBottom: "1px solid #1a1a2e10",
                    background: isHlCol ? `${accentColor}05` : "transparent",
                  }}>
                    {isCheck ? "\u2713 Yes" : isCross ? "\u2717 No" : cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableVisual;
