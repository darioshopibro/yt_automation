import React from "react";

/**
 * PROCESS STEPS VISUAL
 * Config: { steps: [{ label: "Install", description?: "Run npm install" }] }
 */

interface Step {
  label: string;
  description?: string;
  color?: string;
}

interface Props {
  steps: Step[];
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];

const ProcessStepsVisual: React.FC<Props> = ({
  steps, accentColor = "#3b82f6", progress = 1, shapeMode,
}) => {
  const visibleCount = Math.ceil(steps.length * progress);
  const completedCount = Math.max(0, visibleCount - 1);
  const isWide = shapeMode === "wide";

  if (isWide) {
    return (
      <div style={{
        background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: "24px 20px",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
      }}>
        {steps.slice(0, visibleCount).map((step, i) => {
          const color = step.color || defaultColors[i % defaultColors.length];
          const isCompleted = i < completedCount;
          const isCurrent = i === completedCount;
          const isLast = i === steps.length - 1;

          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
              {/* Step column (circle + label below) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isCompleted ? color : isCurrent ? `${color}20` : "#1a1a2e",
                  border: `2px solid ${isCompleted || isCurrent ? color : "#2a2a3e"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isCurrent ? `0 0 15px ${color}40` : "none",
                  flexShrink: 0,
                }}>
                  {isCompleted ? (
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{"\u2713"}</span>
                  ) : (
                    <span style={{
                      color: isCurrent ? color : "#4a4a5e",
                      fontSize: 13, fontWeight: 700, fontFamily: "'SF Mono', monospace",
                    }}>{i + 1}</span>
                  )}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, textAlign: "center",
                  color: isCompleted ? "#94a3b8" : isCurrent ? "#f8fafc" : "#64748b",
                  textDecoration: isCompleted ? "line-through" : "none",
                }}>{step.label}</span>
                {step.description && (
                  <span style={{ fontSize: 10, color: "#64748b", textAlign: "center", lineHeight: 1.3, maxWidth: 100 }}>
                    {step.description}
                  </span>
                )}
              </div>
              {/* Horizontal connector */}
              {!isLast && (
                <div style={{
                  height: 2, flex: 1, marginTop: 16, minWidth: 16,
                  background: isCompleted ? color : "#1a1a2e",
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{
      background: "#0f0f1a", borderRadius: 12, border: "1px solid #1a1a2e", padding: "24px 28px",
    }}>
      {steps.slice(0, visibleCount).map((step, i) => {
        const color = step.color || defaultColors[i % defaultColors.length];
        const isCompleted = i < completedCount;
        const isCurrent = i === completedCount;
        const isLast = i === steps.length - 1;

        return (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            {/* Step indicator column */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: isCompleted ? color : isCurrent ? `${color}20` : "#1a1a2e",
                border: `2px solid ${isCompleted || isCurrent ? color : "#2a2a3e"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isCurrent ? `0 0 15px ${color}40` : "none",
                flexShrink: 0,
              }}>
                {isCompleted ? (
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{"\u2713"}</span>
                ) : (
                  <span style={{
                    color: isCurrent ? color : "#4a4a5e",
                    fontSize: 13, fontWeight: 700, fontFamily: "'SF Mono', monospace",
                  }}>{i + 1}</span>
                )}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 20,
                  background: isCompleted ? color : "#1a1a2e",
                }} />
              )}
            </div>

            {/* Step content */}
            <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 4 }}>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isCompleted ? "#94a3b8" : isCurrent ? "#f8fafc" : "#64748b",
                textDecoration: isCompleted ? "line-through" : "none",
              }}>{step.label}</span>
              {step.description && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>
                  {step.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessStepsVisual;
