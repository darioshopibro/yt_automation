import React from "react";

/**
 * KINETIC TYPOGRAPHY
 * Config: { text: "AI is the future", highlight?: ["AI", "future"], style?: "impact"|"reveal"|"stack" }
 */

interface Props {
  text: string;
  highlight?: string[];
  style?: "impact" | "reveal" | "stack";
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const KineticTypography: React.FC<Props> = ({
  text, highlight = [], style = "impact", accentColor = "#3b82f6", progress = 1, shapeMode = "wide",
}) => {
  // Square mode forces stack style
  const effectiveStyle = shapeMode === "square" ? "stack" : style;
  const words = text.split(/\s+/);
  const visibleWords = Math.ceil(words.length * progress);

  if (effectiveStyle === "stack") {
    // Words stacked vertically, each on its own line
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 4, padding: 20,
      }}>
        {words.slice(0, visibleWords).map((word, i) => {
          const isHl = highlight.some(h => word.toLowerCase().includes(h.toLowerCase()));
          return (
            <span key={i} style={{
              fontSize: isHl ? 36 : 24,
              fontWeight: isHl ? 900 : 600,
              color: isHl ? accentColor : "#f8fafc",
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: isHl ? 2 : 0,
              textTransform: isHl ? "uppercase" : "none",
              textShadow: isHl ? `0 0 30px ${accentColor}60` : "none",
              lineHeight: 1.2,
            }}>
              {word}
            </span>
          );
        })}
      </div>
    );
  }

  if (effectiveStyle === "reveal") {
    // Words revealed inline, word-by-word
    return (
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center",
        padding: 20, maxWidth: 500,
      }}>
        {words.slice(0, visibleWords).map((word, i) => {
          const isHl = highlight.some(h => word.toLowerCase().includes(h.toLowerCase()));
          return (
            <span key={i} style={{
              fontSize: 22,
              fontWeight: isHl ? 800 : 500,
              color: isHl ? accentColor : "#e2e8f0",
              fontFamily: "'Inter', system-ui, sans-serif",
              textShadow: isHl ? `0 0 20px ${accentColor}40` : "none",
            }}>
              {word}
            </span>
          );
        })}
      </div>
    );
  }

  // "impact" — big centered text, highlighted words glow
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center",
      alignItems: "baseline", padding: 20, maxWidth: 600,
    }}>
      {words.slice(0, visibleWords).map((word, i) => {
        const isHl = highlight.some(h => word.toLowerCase().includes(h.toLowerCase()));
        return (
          <span key={i} style={{
            fontSize: isHl ? 42 : 28,
            fontWeight: isHl ? 900 : 600,
            color: isHl ? "#fff" : "#94a3b8",
            fontFamily: "'Inter', system-ui, sans-serif",
            background: isHl ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : "none",
            WebkitBackgroundClip: isHl ? "text" : undefined,
            WebkitTextFillColor: isHl ? "transparent" : undefined,
            filter: isHl ? `drop-shadow(0 0 20px ${accentColor}60)` : "none",
          }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

export default KineticTypography;
