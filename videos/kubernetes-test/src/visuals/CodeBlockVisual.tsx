import React from "react";

/**
 * CODE BLOCK VISUAL
 * Config: { language, filename?, code, highlightLines? }
 */

const langColors: Record<string, string> = {
  typescript: "#3178c6", javascript: "#f7df1e", python: "#3776ab",
  rust: "#dea584", go: "#00add8", bash: "#4eaa25", shell: "#4eaa25",
  json: "#292929", yaml: "#cb171e", html: "#e34f26", css: "#1572b6",
  sql: "#e38c00", docker: "#2496ed",
};

function tokenizeLine(line: string): { text: string; color: string }[] {
  const keywords = /\b(const|let|var|function|return|import|from|export|if|else|for|while|class|interface|type|async|await|new|this|true|false|null|undefined|npm|docker|git|cd|mkdir|pip|yarn|brew|sudo|run|build|install)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\/.*$|#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;

  const tokens: { text: string; color: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = comments.exec(line)) !== null)
    tokens.push({ text: m[0], color: "#6a9955", start: m.index, end: m.index + m[0].length });
  while ((m = strings.exec(line)) !== null)
    tokens.push({ text: m[0], color: "#ce9178", start: m.index, end: m.index + m[0].length });
  while ((m = keywords.exec(line)) !== null) {
    if (!tokens.some(t => m!.index >= t.start && m!.index < t.end))
      tokens.push({ text: m[0], color: "#569cd6", start: m.index, end: m.index + m[0].length });
  }
  while ((m = numbers.exec(line)) !== null) {
    if (!tokens.some(t => m!.index >= t.start && m!.index < t.end))
      tokens.push({ text: m[0], color: "#b5cea8", start: m.index, end: m.index + m[0].length });
  }

  tokens.sort((a, b) => a.start - b.start);
  const result: { text: string; color: string }[] = [];
  let pos = 0;
  for (const tok of tokens) {
    if (tok.start > pos) result.push({ text: line.slice(pos, tok.start), color: "#d4d4d4" });
    result.push({ text: tok.text, color: tok.color });
    pos = tok.end;
  }
  if (pos < line.length) result.push({ text: line.slice(pos), color: "#d4d4d4" });
  if (result.length === 0) result.push({ text: line || " ", color: "#d4d4d4" });
  return result;
}

interface Props {
  language?: string;
  filename?: string;
  code: string;
  highlightLines?: number[];
  accentColor?: string;
  progress?: number;
  shapeMode?: "square" | "wide";
}

const CodeBlockVisual: React.FC<Props> = ({
  language = "", filename, code, highlightLines = [],
  accentColor = "#3b82f6", progress = 1, shapeMode = "square",
}) => {
  const isWide = shapeMode === "wide";
  const lines = code.split("\n");
  const maxLines = isWide ? Math.min(lines.length, 6) : lines.length;
  const visibleLines = Math.ceil(maxLines * progress);
  const langColor = langColors[language.toLowerCase()] || accentColor;

  return (
    <div style={{
      background: "#1e1e2e", borderRadius: 12, overflow: "hidden",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: isWide ? 12 : 13, lineHeight: 1.6,
      width: "100%", minWidth: isWide ? 600 : undefined, border: "1px solid #2a2a3e",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
        background: "#161622", borderBottom: "1px solid #2a2a3e",
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        </div>
        {filename && <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{filename}</span>}
        <div style={{ flex: 1 }} />
        {language && (
          <span style={{
            fontSize: 9, fontWeight: 700, color: langColor, background: `${langColor}15`,
            padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
          }}>{language}</span>
        )}
      </div>
      {/* Code — typing animation */}
      <div style={{ padding: "12px 0" }}>
        {(() => {
          // Calculate total characters for typing effect
          const totalChars = lines.slice(0, maxLines).reduce((sum, l) => sum + l.length + 1, 0);
          const charsToShow = Math.floor(totalChars * progress);
          let charCount = 0;

          return lines.slice(0, maxLines).map((line, i) => {
            const lineStart = charCount;
            charCount += line.length + 1; // +1 for newline

            // How much of this line to show
            const lineCharsVisible = Math.max(0, Math.min(line.length, charsToShow - lineStart));
            if (lineCharsVisible <= 0 && charsToShow < lineStart) return null;

            const lineNum = i + 1;
            const hl = highlightLines.includes(lineNum);
            const visibleText = line.substring(0, lineCharsVisible);
            const isTyping = lineCharsVisible > 0 && lineCharsVisible < line.length;

            return (
              <div key={i} style={{
                display: "flex", padding: "0 14px",
                background: hl ? `${accentColor}15` : "transparent",
                borderLeft: hl ? `3px solid ${accentColor}` : "3px solid transparent",
              }}>
                <span style={{
                  color: hl ? accentColor : "#4a4a5e", minWidth: 32, textAlign: "right",
                  marginRight: 16, userSelect: "none", fontSize: 11,
                }}>{lineNum}</span>
                <span style={{ whiteSpace: "pre" }}>
                  {tokenizeLine(visibleText).map((tok, ti) => (
                    <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
                  ))}
                  {/* Blinking cursor at typing position */}
                  {isTyping && (
                    <span style={{
                      display: "inline-block", width: 7, height: 14,
                      background: accentColor, opacity: 0.8, marginLeft: 1,
                      verticalAlign: "middle",
                    }} />
                  )}
                </span>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

export default CodeBlockVisual;
