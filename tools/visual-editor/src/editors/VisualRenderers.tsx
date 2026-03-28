import React from 'react';

/**
 * Mini visual renderers for SectionBox preview.
 * These match the EXACT same look as VisualPreview.tsx and the Remotion template.
 * Each renders the actual visual from visualData — not a placeholder.
 */

const defaultColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316"];

// ---- CODE BLOCK ----
function tokenizeLine(line: string): { text: string; color: string }[] {
  const keywords = /\b(const|let|var|function|return|import|from|export|if|else|for|while|class|interface|type|async|await|new|this|true|false|null|undefined|npm|docker|git|cd|mkdir|pip|yarn|brew|sudo|run|build|install)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\/.*$|#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const tokens: { text: string; color: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = comments.exec(line)) !== null) tokens.push({ text: m[0], color: "#6a9955", start: m.index, end: m.index + m[0].length });
  while ((m = strings.exec(line)) !== null) tokens.push({ text: m[0], color: "#ce9178", start: m.index, end: m.index + m[0].length });
  while ((m = keywords.exec(line)) !== null) { if (!tokens.some(t => m!.index >= t.start && m!.index < t.end)) tokens.push({ text: m[0], color: "#569cd6", start: m.index, end: m.index + m[0].length }); }
  while ((m = numbers.exec(line)) !== null) { if (!tokens.some(t => m!.index >= t.start && m!.index < t.end)) tokens.push({ text: m[0], color: "#b5cea8", start: m.index, end: m.index + m[0].length }); }
  tokens.sort((a, b) => a.start - b.start);
  const result: { text: string; color: string }[] = [];
  let pos = 0;
  for (const tok of tokens) { if (tok.start > pos) result.push({ text: line.slice(pos, tok.start), color: "#d4d4d4" }); result.push({ text: tok.text, color: tok.color }); pos = tok.end; }
  if (pos < line.length) result.push({ text: line.slice(pos), color: "#d4d4d4" });
  if (result.length === 0) result.push({ text: line || " ", color: "#d4d4d4" });
  return result;
}

const langColors: Record<string, string> = { typescript: "#3178c6", javascript: "#f7df1e", python: "#3776ab", bash: "#4eaa25", go: "#00add8", rust: "#dea584", docker: "#2496ed" };

export function CodeBlockRenderer({ language, filename, code, highlightLines = [], accentColor = "#3b82f6" }: any) {
  const lines = (code || "").split("\n");
  const lc = langColors[language?.toLowerCase()] || accentColor;
  return (
    <div style={{ background: "#1e1e2e", borderRadius: 8, overflow: "hidden", fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 9, lineHeight: 1.5, width: "100%", border: "1px solid #2a2a3e" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", background: "#161622", borderBottom: "1px solid #2a2a3e" }}>
        <div style={{ display: "flex", gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28c840" }} />
        </div>
        {filename && <span style={{ fontSize: 8, color: "#94a3b8", marginLeft: 4 }}>{filename}</span>}
        <div style={{ flex: 1 }} />
        {language && <span style={{ fontSize: 7, fontWeight: 700, color: lc, background: `${lc}15`, padding: "1px 4px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{language}</span>}
      </div>
      <div style={{ padding: "6px 0", maxHeight: 120, overflow: "hidden" }}>
        {lines.slice(0, 10).map((line: string, i: number) => {
          const hl = highlightLines.includes(i + 1);
          return (
            <div key={i} style={{ display: "flex", padding: "0 8px", background: hl ? `${accentColor}15` : "transparent", borderLeft: hl ? `2px solid ${accentColor}` : "2px solid transparent" }}>
              <span style={{ color: hl ? accentColor : "#4a4a5e", minWidth: 20, textAlign: "right", marginRight: 8, fontSize: 8 }}>{i + 1}</span>
              <span style={{ whiteSpace: "pre", overflow: "hidden", textOverflow: "ellipsis" }}>{tokenizeLine(line).map((t, ti) => <span key={ti} style={{ color: t.color }}>{t.text}</span>)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- TERMINAL ----
export function TerminalRenderer({ commands, title = "Terminal", accentColor = "#22c55e" }: any) {
  return (
    <div style={{ background: "#0a0a14", borderRadius: 8, overflow: "hidden", fontFamily: "'JetBrains Mono', 'SF Mono', monospace", fontSize: 9, lineHeight: 1.6, width: "100%", border: "1px solid #1a1a2e" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", background: "#08080f", borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ display: "flex", gap: 3 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <span style={{ fontSize: 8, color: "#64748b", marginLeft: 4 }}>{title}</span>
      </div>
      <div style={{ padding: "6px 10px", maxHeight: 100, overflow: "hidden" }}>
        {(commands || []).slice(0, 4).map((cmd: any, i: number) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ color: accentColor, fontWeight: 700 }}>{cmd.prompt || "$"}</span>
              <span style={{ color: "#f8fafc" }}>{cmd.command}</span>
            </div>
            {cmd.output && <div style={{ color: "#94a3b8", paddingLeft: 14, fontSize: 8, marginBottom: 4 }}>{cmd.output.split("\n").slice(0, 2).map((l: string, li: number) => <div key={li}>{l}</div>)}</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ---- LIST ----
export function ListRenderer({ items, style = "bullet", accentColor = "#3b82f6" }: any) {
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      {(items || []).slice(0, 6).map((item: string, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: i < items.length - 1 ? "1px solid #1a1a2e10" : "none" }}>
          <div style={{ width: 16, height: 16, borderRadius: style === "checklist" ? 3 : "50%", background: `${accentColor}15`, border: `1px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: accentColor, fontSize: style === "numbered" ? 8 : 9, fontWeight: 700 }}>
              {style === "numbered" ? i + 1 : style === "checklist" ? "\u2713" : "\u2022"}
            </span>
          </div>
          <span style={{ color: "#e2e8f0", fontSize: 9, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ---- TABLE ----
export function TableRenderer({ headers, rows, highlightCol, accentColor = "#3b82f6" }: any) {
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, overflow: "hidden", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{(headers || []).map((h: string, i: number) => (
          <th key={i} style={{ padding: "6px 8px", textAlign: "left", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: i === highlightCol ? accentColor : "#94a3b8", borderBottom: `1.5px solid ${i === highlightCol ? accentColor : "#1a1a2e"}`, background: i === highlightCol ? `${accentColor}08` : "transparent" }}>{h}</th>
        ))}</tr></thead>
        <tbody>{(rows || []).slice(0, 6).map((row: string[], ri: number) => (
          <tr key={ri}>{row.map((cell: string, ci: number) => {
            const isCheck = cell === "Yes" || cell === "\u2713";
            const isCross = cell === "No" || cell === "\u2717";
            return <td key={ci} style={{ padding: "4px 8px", fontSize: 9, color: isCheck ? "#22c55e" : isCross ? "#ef4444" : ci === 0 ? "#e2e8f0" : "#94a3b8", fontWeight: ci === 0 ? 600 : 400, borderBottom: "1px solid #1a1a2e10", background: ci === highlightCol ? `${accentColor}05` : "transparent" }}>{isCheck ? "\u2713 Yes" : isCross ? "\u2717 No" : cell}</td>;
          })}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ---- BAR CHART ----
export function BarChartRenderer({ items, unit = "", maxValue }: any) {
  const max = maxValue || Math.max(...(items || []).map((i: any) => i.value)) * 1.1 || 100;
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 12px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      {(items || []).slice(0, 6).map((item: any, i: number) => {
        const color = item.color || defaultColors[i % defaultColors.length];
        const pct = (item.value / max) * 100;
        return (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 9, color: "#e2e8f0" }}>{item.label}</span>
              <span style={{ fontSize: 9, color, fontWeight: 700, fontFamily: "monospace" }}>{item.value}{unit}</span>
            </div>
            <div style={{ height: 14, borderRadius: 4, background: "#1a1a2e" }}>
              <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 10px ${color}30` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- PIE CHART ----
function polarToCart(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function PieChartRenderer({ items, donut = true }: any) {
  const total = (items || []).reduce((s: number, i: any) => s + i.value, 0) || 1;
  const cx = 50, cy = 50, r = 40, ir = donut ? 25 : 0;
  let angle = 0;
  const segs = (items || []).map((item: any, i: number) => {
    const a = (item.value / total) * 360;
    const sa = angle; angle += a;
    const color = item.color || defaultColors[i % defaultColors.length];
    return { ...item, color, sa, ea: angle, a, pct: Math.round((item.value / total) * 100) };
  });
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: 10, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        {segs.map((seg: any, i: number) => {
          if (seg.a < 0.5) return null;
          const s = polarToCart(cx, cy, r, seg.ea);
          const e = polarToCart(cx, cy, r, seg.sa);
          const la = seg.a > 180 ? 1 : 0;
          let d: string;
          if (ir > 0) {
            const si = polarToCart(cx, cy, ir, seg.ea);
            const ei = polarToCart(cx, cy, ir, seg.sa);
            d = `M ${s.x} ${s.y} A ${r} ${r} 0 ${la} 0 ${e.x} ${e.y} L ${ei.x} ${ei.y} A ${ir} ${ir} 0 ${la} 1 ${si.x} ${si.y} Z`;
          } else {
            d = `M ${cx} ${cy} L ${e.x} ${e.y} A ${r} ${r} 0 ${la} 1 ${s.x} ${s.y} Z`;
          }
          return <path key={i} d={d} fill={seg.color} opacity={0.85} style={{ filter: `drop-shadow(0 0 4px ${seg.color}40)` }} />;
        })}
        {donut && <text x={cx} y={cy + 2} textAnchor="middle" fill="#f8fafc" fontSize={10} fontWeight={700} fontFamily="monospace">100%</text>}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {segs.map((seg: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 2, background: seg.color }} />
            <span style={{ fontSize: 8, color: "#e2e8f0", flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: 8, color: seg.color, fontWeight: 700, fontFamily: "monospace" }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- STATS ----
export function StatsRenderer({ items }: any) {
  const cols = (items || []).length <= 2 ? (items || []).length : 2;
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: 10, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
      {(items || []).slice(0, 4).map((item: any, i: number) => {
        const c = item.color || defaultColors[i % defaultColors.length];
        return (
          <div key={i} style={{ background: `${c}08`, border: `1px solid ${c}20`, borderRadius: 8, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: "monospace", letterSpacing: -1, textShadow: `0 0 15px ${c}30`, lineHeight: 1 }}>{item.value}</span>
            <span style={{ fontSize: 8, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</span>
            {item.subtitle && <span style={{ fontSize: 7, color: "#64748b" }}>{item.subtitle}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ---- TIMELINE ----
export function TimelineRenderer({ items, direction = "horizontal" }: any) {
  if (direction === "vertical") {
    return (
      <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 14px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
        {(items || []).slice(0, 5).map((item: any, i: number) => {
          const c = item.color || defaultColors[i % defaultColors.length];
          const isLast = i === (items || []).length - 1;
          return (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}60`, flexShrink: 0, border: "1.5px solid #0f0f1a" }} />
                {!isLast && <div style={{ width: 1.5, flex: 1, background: `${c}30`, minHeight: 16 }} />}
              </div>
              <div style={{ paddingBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: c, fontFamily: "monospace" }}>{item.label}</span>
                {item.description && <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 2 }}>{item.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "14px 12px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", top: 4, left: 4, right: 4, height: 1.5, background: "#1a1a2e" }}>
          <div style={{ height: "100%", width: "100%", background: `linear-gradient(90deg, ${defaultColors[0]}, ${defaultColors[4] || defaultColors[0]})` }} />
        </div>
        {(items || []).slice(0, 6).map((item: any, i: number) => {
          const c = item.color || defaultColors[i % defaultColors.length];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", flex: 1 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}60`, border: "1.5px solid #0f0f1a", zIndex: 1 }} />
              <span style={{ fontSize: 8, fontWeight: 700, color: c, fontFamily: "monospace" }}>{item.label}</span>
              {item.description && <span style={{ fontSize: 7, color: "#94a3b8", textAlign: "center", maxWidth: 60, lineHeight: 1.2 }}>{item.description}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- PROCESS STEPS ----
export function ProcessStepsRenderer({ steps }: any) {
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: "10px 14px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      {(steps || []).slice(0, 5).map((step: any, i: number) => {
        const c = step.color || defaultColors[i % defaultColors.length];
        const isLast = i === (steps || []).length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${c}20`, border: `1.5px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: c, fontSize: 8, fontWeight: 700, fontFamily: "monospace" }}>{i + 1}</span>
              </div>
              {!isLast && <div style={{ width: 1.5, flex: 1, minHeight: 12, background: `${c}30` }} />}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 10, paddingTop: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#e2e8f0" }}>{step.label}</span>
              {step.description && <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>{step.description}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- LOGO GRID ----
export function LogoGridRenderer({ items, cols }: any) {
  const c = cols || ((items || []).length <= 3 ? (items || []).length : (items || []).length <= 6 ? 3 : 4);
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: 10, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "grid", gridTemplateColumns: `repeat(${c}, 1fr)`, gap: 6 }}>
      {(items || []).slice(0, 9).map((item: any, i: number) => {
        const color = item.color || defaultColors[i % defaultColors.length];
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 6, background: `${color}08`, border: `1px solid ${color}15` }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${color}20, ${color}08)`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, boxShadow: `0 0 8px ${color}15` }}>
              {(item.icon || item.label || "?")[0]}
            </div>
            <span style={{ fontSize: 7, fontWeight: 600, color: "#94a3b8", textAlign: "center" }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---- HIERARCHY ----
function HierarchyNodeR({ label, color, children, depth = 0 }: any) {
  const c = color || defaultColors[depth % defaultColors.length];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: `${c}10`, border: `1px solid ${c}30`, borderRadius: 6, padding: "4px 8px", textAlign: "center" }}>
        <span style={{ fontSize: depth === 0 ? 9 : 8, fontWeight: depth === 0 ? 700 : 600, color: depth === 0 ? c : "#e2e8f0", fontFamily: "monospace" }}>{label}</span>
      </div>
      {children && children.length > 0 && (
        <>
          <div style={{ width: 1.5, height: 8, background: `${c}30` }} />
          <div style={{ display: "flex", gap: 6 }}>
            {children.slice(0, 4).map((child: any, i: number) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 1.5, height: 6, background: `${defaultColors[(depth + i + 1) % defaultColors.length]}30` }} />
                <HierarchyNodeR {...child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function HierarchyRenderer({ root }: any) {
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: 12, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "flex", justifyContent: "center" }}>
      <HierarchyNodeR {...(root || { label: "Root" })} />
    </div>
  );
}

// ---- SPLIT SCREEN ----
export function SplitScreenRenderer({ left, right, leftColor, rightColor, dividerLabel }: any) {
  const lc = leftColor || "#ef4444", rc = rightColor || "#22c55e";
  const renderPanel = (panel: any, color: string) => (
    <div style={{ flex: 1, padding: "8px 10px" }}>
      <div style={{ fontSize: 8, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "monospace" }}>{panel?.title || ""}</div>
      {(panel?.items || []).slice(0, 5).map((item: string, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
          <span style={{ fontSize: 8, color: "#e2e8f0" }}>{item}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, overflow: "hidden", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "flex", position: "relative" }}>
      {renderPanel(left, lc)}
      <div style={{ width: 1, background: "#1a1a2e", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", background: "#0f0f1a", padding: "3px 5px", borderRadius: 4, border: "1px solid #1a1a2e" }}>
          <span style={{ fontSize: 7, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", fontStyle: "italic" }}>{dividerLabel || "vs"}</span>
        </div>
      </div>
      {renderPanel(right, rc)}
    </div>
  );
}

// ---- KINETIC ----
export function KineticRenderer({ text, highlight = [], style = "impact", accentColor = "#3b82f6" }: any) {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const isHl = (w: string) => (highlight || []).some((h: string) => w.toLowerCase().includes(h.toLowerCase()));

  if (style === "stack") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: 10 }}>
        {words.slice(0, 6).map((w: string, i: number) => (
          <span key={i} style={{ fontSize: isHl(w) ? 18 : 12, fontWeight: isHl(w) ? 900 : 600, color: isHl(w) ? accentColor : "#f8fafc", fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{w}</span>
        ))}
      </div>
    );
  }
  if (style === "reveal") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", padding: 10, maxWidth: 250 }}>
        {words.slice(0, 10).map((w: string, i: number) => (
          <span key={i} style={{ fontSize: 12, fontWeight: isHl(w) ? 800 : 500, color: isHl(w) ? accentColor : "#e2e8f0", fontFamily: "'Inter', sans-serif" }}>{w}</span>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", alignItems: "baseline", padding: 10, maxWidth: 300 }}>
      {words.slice(0, 8).map((w: string, i: number) => (
        <span key={i} style={{ fontSize: isHl(w) ? 22 : 14, fontWeight: isHl(w) ? 900 : 600, color: isHl(w) ? "#fff" : "#94a3b8", fontFamily: "'Inter', sans-serif", background: isHl(w) ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : "none", WebkitBackgroundClip: isHl(w) ? "text" : undefined, WebkitTextFillColor: isHl(w) ? "transparent" : undefined }}>{w}</span>
      ))}
    </div>
  );
}

// ---- SERVICE MESH ----
export function ServiceMeshRenderer({ nodes, connections }: any) {
  const n = (nodes || []).slice(0, 6);
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 8, padding: 12, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {n.map((node: any, i: number) => {
          const c = node.color || defaultColors[i % defaultColors.length];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 10px", borderRadius: 8, background: `${c}08`, border: `1px solid ${c}20` }}>
              <div style={{ width: 20, height: 20, borderRadius: 6, background: `${c}20`, border: `1px solid ${c}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: c }}>
                {(node.icon || node.label || "?")[0]}
              </div>
              <span style={{ fontSize: 7, fontWeight: 600, color: "#94a3b8" }}>{node.label}</span>
              {node.role && <span style={{ fontSize: 6, color: "#475569" }}>{node.role}</span>}
            </div>
          );
        })}
      </div>
      {(connections || []).length > 0 && (
        <div style={{ marginTop: 8, fontSize: 7, color: "#475569", textAlign: "center" }}>
          {(connections || []).slice(0, 4).map((c: any, i: number) => (
            <span key={i}>{c.from} {"\u2192"} {c.to}{c.label ? ` (${c.label})` : ""}{i < (connections || []).length - 1 ? "  \u00B7  " : ""}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN ROUTER ──
export function renderVisualPreview(visualType: string, visualData: any, accentColor?: string): React.ReactNode {
  if (!visualType || !visualData) return null;
  switch (visualType) {
    case 'code-block': return <CodeBlockRenderer {...visualData} accentColor={accentColor} />;
    case 'terminal': return <TerminalRenderer {...visualData} accentColor={accentColor} />;
    case 'list': return <ListRenderer {...visualData} accentColor={accentColor} />;
    case 'table': return <TableRenderer {...visualData} accentColor={accentColor} />;
    case 'bar-chart': return <BarChartRenderer {...visualData} />;
    case 'pie-chart': return <PieChartRenderer {...visualData} />;
    case 'stats': return <StatsRenderer {...visualData} />;
    case 'timeline': return <TimelineRenderer {...visualData} />;
    case 'process-steps': return <ProcessStepsRenderer {...visualData} />;
    case 'logo-grid': return <LogoGridRenderer {...visualData} />;
    case 'hierarchy': return <HierarchyRenderer {...visualData} />;
    case 'split-screen': return <SplitScreenRenderer {...visualData} />;
    case 'kinetic': return <KineticRenderer {...visualData} accentColor={accentColor} />;
    case 'service-mesh': return <ServiceMeshRenderer {...visualData} />;
    default: return <div style={{ color: '#475569', fontSize: 10 }}>Unknown: {visualType}</div>;
  }
}
