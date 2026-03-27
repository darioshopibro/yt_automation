import React, { useState } from "react";

/**
 * VISUAL PREVIEW PAGE — standalone test page for all visual components
 * Shows all visuals with sample data on dark background
 */

// === Inline visual components (same code as template, for browser preview) ===

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

function CodeBlock({ language, filename, code, highlightLines = [], accentColor = "#3b82f6" }: any) {
  const lines = code.split("\n");
  const lc = langColors[language?.toLowerCase()] || accentColor;
  return (
    <div style={{ background: "#1e1e2e", borderRadius: 12, overflow: "hidden", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6, width: "100%", border: "1px solid #2a2a3e" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#161622", borderBottom: "1px solid #2a2a3e" }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        </div>
        {filename && <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>{filename}</span>}
        <div style={{ flex: 1 }} />
        {language && <span style={{ fontSize: 9, fontWeight: 700, color: lc, background: `${lc}15`, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1 }}>{language}</span>}
      </div>
      <div style={{ padding: "12px 0" }}>
        {lines.map((line: string, i: number) => {
          const hl = highlightLines.includes(i + 1);
          return (
            <div key={i} style={{ display: "flex", padding: "0 14px", background: hl ? `${accentColor}15` : "transparent", borderLeft: hl ? `3px solid ${accentColor}` : "3px solid transparent" }}>
              <span style={{ color: hl ? accentColor : "#4a4a5e", minWidth: 32, textAlign: "right", marginRight: 16, fontSize: 11 }}>{i + 1}</span>
              <span style={{ whiteSpace: "pre" }}>{tokenizeLine(line).map((t, ti) => <span key={ti} style={{ color: t.color }}>{t.text}</span>)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- TERMINAL ----
function Terminal({ commands, title = "Terminal", accentColor = "#22c55e" }: any) {
  return (
    <div style={{ background: "#0a0a14", borderRadius: 12, overflow: "hidden", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.7, width: "100%", border: "1px solid #1a1a2e" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "#08080f", borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ display: "flex", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
        </div>
        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>{title}</span>
      </div>
      <div style={{ padding: "14px 18px" }}>
        {commands.map((cmd: any, i: number) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
              <span style={{ color: accentColor, fontWeight: 700 }}>{cmd.prompt || "$"}</span>
              <span style={{ color: "#f8fafc" }}>{cmd.command}</span>
            </div>
            {cmd.output && <div style={{ color: "#94a3b8", marginBottom: 12, paddingLeft: 20, fontSize: 12 }}>{cmd.output.split("\n").map((l: string, li: number) => <div key={li}>{l}</div>)}</div>}
          </React.Fragment>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ color: accentColor, fontWeight: 700 }}>$</span>
          <span style={{ width: 8, height: 16, background: accentColor, opacity: 0.7, display: "inline-block", animation: "blink 1s step-end infinite" }} />
        </div>
      </div>
    </div>
  );
}

// ---- LIST ----
function ListVis({ items, style = "bullet", accentColor = "#3b82f6" }: any) {
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: "20px 24px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      {items.map((item: string, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid #1a1a2e" : "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: style === "checklist" ? 6 : "50%", background: `${accentColor}15`, border: `1.5px solid ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: accentColor, fontSize: style === "numbered" ? 12 : 14, fontWeight: 700, fontFamily: style === "numbered" ? "monospace" : "inherit" }}>
              {style === "numbered" ? i + 1 : style === "checklist" ? "\u2713" : "\u2022"}
            </span>
          </div>
          <span style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.5, paddingTop: 3 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ---- KINETIC TYPOGRAPHY ----
function KineticType({ text, highlight = [], style = "impact", accentColor = "#3b82f6" }: any) {
  const words = text.split(/\s+/);
  const isHl = (w: string) => highlight.some((h: string) => w.toLowerCase().includes(h.toLowerCase()));

  if (style === "stack") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 20 }}>
        {words.map((w: string, i: number) => (
          <span key={i} style={{ fontSize: isHl(w) ? 36 : 24, fontWeight: isHl(w) ? 900 : 600, color: isHl(w) ? accentColor : "#f8fafc", fontFamily: "'Inter', sans-serif", letterSpacing: isHl(w) ? 2 : 0, textTransform: isHl(w) ? "uppercase" : "none", textShadow: isHl(w) ? `0 0 30px ${accentColor}60` : "none", lineHeight: 1.2 }}>{w}</span>
        ))}
      </div>
    );
  }
  if (style === "reveal") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", padding: 20, maxWidth: 500 }}>
        {words.map((w: string, i: number) => (
          <span key={i} style={{ fontSize: 22, fontWeight: isHl(w) ? 800 : 500, color: isHl(w) ? accentColor : "#e2e8f0", fontFamily: "'Inter', sans-serif", textShadow: isHl(w) ? `0 0 20px ${accentColor}40` : "none" }}>{w}</span>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", alignItems: "baseline", padding: 20, maxWidth: 600 }}>
      {words.map((w: string, i: number) => (
        <span key={i} style={{ fontSize: isHl(w) ? 42 : 28, fontWeight: isHl(w) ? 900 : 600, color: isHl(w) ? "#fff" : "#94a3b8", fontFamily: "'Inter', sans-serif", background: isHl(w) ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : "none", WebkitBackgroundClip: isHl(w) ? "text" : undefined, WebkitTextFillColor: isHl(w) ? "transparent" : undefined, filter: isHl(w) ? `drop-shadow(0 0 20px ${accentColor}60)` : "none" }}>{w}</span>
      ))}
    </div>
  );
}

// === SAMPLE DATA ===

const sampleCode = `import express from "express";
import { auth } from "./middleware";

const app = express();

// Protected API route
app.get("/api/users", auth, (req, res) => {
  const users = db.query("SELECT * FROM users");
  res.json({ data: users });
});

app.listen(3000);`;

const sampleCommands = [
  { prompt: "$", command: "npm create vite@latest my-app", output: "Scaffolding project in ./my-app..." },
  { prompt: "$", command: "cd my-app && npm install", output: "added 156 packages in 4.2s" },
  { prompt: "$", command: "npm run dev", output: "  VITE v5.4.1  ready in 312 ms\n\n  Local:   http://localhost:5173/" },
];

const sampleList = [
  "Zero-config deployment with automatic HTTPS",
  "Edge runtime for ultra-low latency globally",
  "Built-in CI/CD with preview deployments",
  "Real-time analytics and performance monitoring",
  "Automatic scaling from 0 to millions of requests",
];

const sampleKineticText = "Microservices are not a silver bullet but they solve real scaling problems";

// ---- TABLE (inline) ----
function TableVis({ headers, rows, highlightCol, accentColor = "#3b82f6" }: any) {
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, overflow: "hidden", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{headers.map((h: string, i: number) => (
          <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: i === highlightCol ? accentColor : "#94a3b8", borderBottom: `2px solid ${i === highlightCol ? accentColor : "#1a1a2e"}`, background: i === highlightCol ? `${accentColor}08` : "transparent" }}>{h}</th>
        ))}</tr></thead>
        <tbody>{rows.map((row: string[], ri: number) => (
          <tr key={ri}>{row.map((cell: string, ci: number) => {
            const isCheck = cell === "Yes" || cell === "\u2713";
            const isCross = cell === "No" || cell === "\u2717";
            return <td key={ci} style={{ padding: "10px 16px", fontSize: 13, color: isCheck ? "#22c55e" : isCross ? "#ef4444" : ci === 0 ? "#e2e8f0" : "#94a3b8", fontWeight: ci === 0 ? 600 : 400, borderBottom: "1px solid #1a1a2e10", background: ci === highlightCol ? `${accentColor}05` : "transparent" }}>{isCheck ? "\u2713 Yes" : isCross ? "\u2717 No" : cell}</td>;
          })}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ---- BAR CHART (inline) ----
const barColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316"];
function BarChart({ items, unit = "", maxValue }: any) {
  const max = maxValue || Math.max(...items.map((i: any) => i.value)) * 1.1;
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: "20px 24px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      {items.map((item: any, i: number) => {
        const color = item.color || barColors[i % barColors.length];
        const pct = (item.value / max) * 100;
        return (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#e2e8f0" }}>{item.label}</span>
              <span style={{ fontSize: 12, color, fontWeight: 700, fontFamily: "monospace" }}>{item.value}{unit}</span>
            </div>
            <div style={{ height: 24, borderRadius: 6, background: "#1a1a2e" }}>
              <div style={{ height: "100%", borderRadius: 6, width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 20px ${color}30` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- PIE CHART (inline) ----
function polarToCart(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function PieChart({ items, donut = true }: any) {
  const total = items.reduce((s: number, i: any) => s + i.value, 0);
  const cx = 100, cy = 100, r = 80, ir = donut ? 50 : 0;
  let angle = 0;
  const segs = items.map((item: any, i: number) => {
    const a = (item.value / total) * 360;
    const sa = angle; angle += a;
    const color = item.color || barColors[i % barColors.length];
    return { ...item, color, sa, ea: angle, a, pct: Math.round((item.value / total) * 100) };
  });
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: 20, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
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
          return <path key={i} d={d} fill={seg.color} opacity={0.85} style={{ filter: `drop-shadow(0 0 8px ${seg.color}40)` }} />;
        })}
        {donut && <text x={cx} y={cy + 4} textAnchor="middle" fill="#f8fafc" fontSize={18} fontWeight={700} fontFamily="monospace">100%</text>}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {segs.map((seg: any, i: number) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, boxShadow: `0 0 8px ${seg.color}40` }} />
            <span style={{ fontSize: 12, color: "#e2e8f0", flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: 12, color: seg.color, fontWeight: 700, fontFamily: "monospace" }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- STATS (inline) ----
const statColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];
function Stats({ items }: any) {
  const cols = items.length <= 2 ? items.length : items.length <= 4 ? 2 : 3;
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: 20, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
      {items.map((item: any, i: number) => {
        const c = item.color || statColors[i % statColors.length];
        return (
          <div key={i} style={{ background: `${c}08`, border: `1px solid ${c}20`, borderRadius: 10, padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: c, fontFamily: "monospace", letterSpacing: -1, textShadow: `0 0 30px ${c}30`, lineHeight: 1 }}>{item.value}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 4 }}>{item.label}</span>
            {item.subtitle && <span style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{item.subtitle}</span>}
          </div>
        );
      })}
    </div>
  );
}

// === SAMPLE DATA — GROUP 2 ===

const sampleTableHeaders = ["Feature", "React", "Vue", "Svelte"];
const sampleTableRows = [
  ["Virtual DOM", "Yes", "Yes", "No"],
  ["Bundle Size", "42kb", "33kb", "1.6kb"],
  ["Learning Curve", "Medium", "Easy", "Easy"],
  ["TypeScript", "Yes", "Yes", "Yes"],
  ["SSR Built-in", "No", "Yes", "Yes"],
];

const sampleBarItems = [
  { label: "React", value: 40 },
  { label: "Vue", value: 18 },
  { label: "Angular", value: 17 },
  { label: "Svelte", value: 8 },
  { label: "Solid", value: 4 },
];

const samplePieItems = [
  { label: "Compute", value: 70 },
  { label: "Storage", value: 20 },
  { label: "Networking", value: 10 },
];

const sampleStats = [
  { label: "Active Users", value: "10M+", subtitle: "Monthly active" },
  { label: "Uptime", value: "99.9%", subtitle: "Last 12 months" },
  { label: "Latency", value: "12ms", subtitle: "p99 globally" },
  { label: "Countries", value: "190+", subtitle: "Edge locations" },
];

// ---- TIMELINE (inline) ----
const tlColors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"];
function polarTC(cx: number, cy: number, r: number, a: number) { const rad = ((a-90)*Math.PI)/180; return {x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)}; }

function TimelineHorizontal() {
  const items = [
    { label: "2018", description: "Monolith era" },
    { label: "2020", description: "First microservice" },
    { label: "2022", description: "Full migration" },
    { label: "2024", description: "Kubernetes native" },
    { label: "2026", description: "AI-powered infra" },
  ];
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: "28px 24px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", top: 6, left: 7, right: 7, height: 2, background: "#1a1a2e" }}>
          <div style={{ height: "100%", width: "100%", background: `linear-gradient(90deg, ${tlColors[0]}, ${tlColors[4]})`, boxShadow: `0 0 10px ${tlColors[0]}30` }} />
        </div>
        {items.map((item, i) => {
          const c = tlColors[i % tlColors.length];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", flex: 1 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: c, boxShadow: `0 0 12px ${c}60`, border: "2px solid #0f0f1a", zIndex: 1 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: "monospace" }}>{item.label}</span>
              <span style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", maxWidth: 90, lineHeight: 1.3 }}>{item.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineVertical() {
  const items = [
    { label: "Step 1", description: "Clone repository" },
    { label: "Step 2", description: "Install dependencies" },
    { label: "Step 3", description: "Configure environment" },
    { label: "Step 4", description: "Run migrations" },
    { label: "Step 5", description: "Start development server" },
  ];
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: "24px 28px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      {items.map((item, i) => {
        const c = tlColors[i % tlColors.length];
        const isLast = i === items.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: c, boxShadow: `0 0 12px ${c}60`, flexShrink: 0, border: "2px solid #0f0f1a" }} />
              {!isLast && <div style={{ width: 2, flex: 1, background: `linear-gradient(${c}60, ${tlColors[(i+1)%tlColors.length]}30)`, minHeight: 30 }} />}
            </div>
            <div style={{ paddingBottom: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: "monospace" }}>{item.label}</span>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{item.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- HIERARCHY (inline) ----
function HierarchyNode({ label, color, children, depth = 0 }: any) {
  const c = color || tlColors[depth % tlColors.length];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ background: `${c}10`, border: `1.5px solid ${c}30`, borderRadius: 10, padding: "8px 16px", textAlign: "center", boxShadow: depth === 0 ? `0 0 20px ${c}20` : "none" }}>
        <span style={{ fontSize: depth === 0 ? 13 : 11, fontWeight: depth === 0 ? 700 : 600, color: depth === 0 ? c : "#e2e8f0", fontFamily: "monospace" }}>{label}</span>
      </div>
      {children && children.length > 0 && (
        <>
          <div style={{ width: 2, height: 16, background: `${c}30` }} />
          {children.length > 1 && <div style={{ height: 2, background: `${c}20`, width: `${(children.length - 1) * 100}px` }} />}
          <div style={{ display: "flex", gap: 12 }}>
            {children.map((child: any, i: number) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 2, height: 12, background: `${tlColors[(depth + i + 1) % tlColors.length]}30` }} />
                <HierarchyNode {...child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HierarchyVis() {
  const tree = {
    label: "Application",
    children: [
      { label: "Frontend", children: [{ label: "React" }, { label: "Next.js" }] },
      { label: "API", children: [{ label: "REST" }, { label: "GraphQL" }, { label: "gRPC" }] },
      { label: "Database", children: [{ label: "PostgreSQL" }, { label: "Redis" }] },
    ],
  };
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: 24, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "flex", justifyContent: "center" }}>
      <HierarchyNode {...tree} />
    </div>
  );
}

// ---- PROCESS STEPS (inline) ----
function ProcessSteps() {
  const steps = [
    { label: "Clone Repository", description: "git clone https://github.com/..." },
    { label: "Install Dependencies", description: "npm install" },
    { label: "Configure Environment", description: "Copy .env.example to .env" },
    { label: "Run Database Migrations", description: "npx prisma migrate dev" },
    { label: "Start Dev Server", description: "npm run dev" },
  ];
  const completedCount = 3;
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: "24px 28px", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e" }}>
      {steps.map((step, i) => {
        const c = tlColors[i % tlColors.length];
        const done = i < completedCount;
        const current = i === completedCount;
        const isLast = i === steps.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? c : current ? `${c}20` : "#1a1a2e", border: `2px solid ${done || current ? c : "#2a2a3e"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: current ? `0 0 15px ${c}40` : "none", flexShrink: 0 }}>
                {done ? <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{"\u2713"}</span> : <span style={{ color: current ? c : "#4a4a5e", fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{i + 1}</span>}
              </div>
              {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: done ? c : "#1a1a2e" }} />}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 20, paddingTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: done ? "#94a3b8" : current ? "#f8fafc" : "#64748b", textDecoration: done ? "line-through" : "none" }}>{step.label}</span>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{step.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- LOGO GRID (inline) ----
function LogoGrid() {
  const items = [
    { icon: "D", label: "Docker", color: "#2496ed" },
    { icon: "K", label: "Kubernetes", color: "#326ce5" },
    { icon: "T", label: "Terraform", color: "#7b42bc" },
    { icon: "A", label: "AWS", color: "#ff9900" },
    { icon: "G", label: "GitHub", color: "#f8fafc" },
    { icon: "P", label: "PostgreSQL", color: "#336791" },
    { icon: "R", label: "Redis", color: "#dc382d" },
    { icon: "N", label: "Nginx", color: "#009639" },
    { icon: "G", label: "Grafana", color: "#f46800" },
  ];
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, padding: 20, fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: 10, background: `${item.color}08`, border: `1px solid ${item.color}15` }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`, border: `1.5px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: item.color, boxShadow: `0 0 15px ${item.color}15` }}>{item.icon}</div>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textAlign: "center" }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---- SPLIT SCREEN (inline) ----
function SplitScreen() {
  const left = { title: "Monolith", items: ["Single codebase", "Tightly coupled", "One deployment", "Vertical scaling", "Simpler debugging"] };
  const right = { title: "Microservices", items: ["Multiple services", "Loosely coupled", "Independent deploy", "Horizontal scaling", "Complex debugging"] };
  const lc = "#ef4444", rc = "#22c55e";
  const renderPanel = (panel: any, color: string) => (
    <div style={{ flex: 1, padding: "16px 20px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, fontFamily: "monospace" }}>{panel.title}</div>
      {panel.items.map((item: string, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}40` }} />
          <span style={{ fontSize: 12, color: "#e2e8f0" }}>{item}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ background: "#0f0f1a", borderRadius: 12, overflow: "hidden", fontFamily: "'Inter', sans-serif", width: "100%", border: "1px solid #1a1a2e", display: "flex", position: "relative" }}>
      {renderPanel(left, lc)}
      <div style={{ width: 1, background: "#1a1a2e", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", background: "#0f0f1a", padding: "6px 8px", borderRadius: 6, border: "1px solid #1a1a2e" }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", fontStyle: "italic" }}>vs</span>
        </div>
      </div>
      {renderPanel(right, rc)}
    </div>
  );
}

// === COMBINATION MATRIX ===

// Mini section wrapper (simulates SectionBox)
function MiniSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "linear-gradient(145deg, #1a1a2e, #0f0f23)",
      border: `1.5px solid ${color}30`,
      borderRadius: 14, padding: "12px 14px 10px", flex: 1,
      backdropFilter: "blur(16px)",
      boxShadow: `0 0 20px ${color}10`,
      display: "flex", flexDirection: "column",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}60` }} />
        <span style={{ fontSize: 8, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>{title}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

// Mini sticky with 2 sections side by side
function MiniSticky({ label, color, left, right }: {
  label: string; color: string;
  left: { title: string; content: React.ReactNode };
  right: { title: string; content: React.ReactNode };
}) {
  return (
    <div style={{ width: 520, flexShrink: 0 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: `${color}15`, border: `1px solid ${color}30`,
        borderRadius: 12, padding: "2px 10px", marginBottom: -6,
        position: "relative", zIndex: 2, marginLeft: 12, fontSize: 9,
        fontWeight: 700, color, fontFamily: "monospace", letterSpacing: 1,
      }}>{label}</div>
      <div style={{
        borderRadius: 16, padding: "14px 12px 10px",
        background: "linear-gradient(145deg, #0a0a14, #08080f)",
        border: `1.5px solid ${color}20`,
        display: "flex", gap: 10, alignItems: "stretch",
      }}>
        <MiniSection title={left.title} color={color}>{left.content}</MiniSection>
        <MiniSection title={right.title} color={color}>{right.content}</MiniSection>
      </div>
    </div>
  );
}

// Small icon nodes (simulating ExplainerLayout)
function MiniIcons({ count, layout = "flow" }: { count: number; layout?: string }) {
  const icons = ["\u25CB", "\u25A1", "\u25B3", "\u25C7"];
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, transform: "scale(0.85)", transformOrigin: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${colors[i % 4]}12`, border: `1px solid ${colors[i % 4]}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, color: colors[i % 4],
            }}>{icons[i % 4]}</div>
            <span style={{ fontSize: 7, color: "#94a3b8" }}>Node {i + 1}</span>
          </div>
          {i < count - 1 && layout === "flow" && (
            <span style={{ color: "#475569", fontSize: 10 }}>{"\u2192"}</span>
          )}
          {i < count - 1 && layout === "vs" && (
            <span style={{ color: "#475569", fontSize: 8, fontWeight: 800, fontStyle: "italic" }}>vs</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// All visual mini-renderers
const miniVisuals: Record<string, { label: string; render: () => React.ReactNode }> = {
  "icons-2": { label: "Icons (2)", render: () => <MiniIcons count={2} /> },
  "icons-3": { label: "Icons (3)", render: () => <MiniIcons count={3} /> },
  "icons-4": { label: "Icons (4)", render: () => <MiniIcons count={4} /> },
  "icons-vs": { label: "Icons (vs)", render: () => <MiniIcons count={2} layout="vs" /> },
  "timeline": { label: "Timeline", render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
      <div style={{ position: "absolute", top: "50%", left: 10, right: 10, height: 2, background: "#3b82f640" }} />
      {["2020", "2022", "2024"].map((y, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", flex: 1 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: ["#3b82f6", "#22c55e", "#f59e0b"][i], zIndex: 1 }} />
          <span style={{ fontSize: 8, color: ["#3b82f6", "#22c55e", "#f59e0b"][i], fontFamily: "monospace" }}>{y}</span>
        </div>
      ))}
    </div>
  )},
  "table": { label: "Table", render: () => (
    <table style={{ fontSize: 8, color: "#94a3b8", borderCollapse: "collapse", width: "100%" }}>
      <thead><tr>{["", "A", "B"].map((h, i) => <th key={i} style={{ padding: "4px 8px", borderBottom: "1px solid #1a1a2e", color: i === 2 ? "#22c55e" : "#64748b", textAlign: "left", fontWeight: 700 }}>{h}</th>)}</tr></thead>
      <tbody>{[["Speed", "Fast", "Slow"], ["Cost", "$10", "$50"]].map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci} style={{ padding: "3px 8px", color: ci === 0 ? "#e2e8f0" : "#94a3b8", fontWeight: ci === 0 ? 600 : 400 }}>{c}</td>)}</tr>)}</tbody>
    </table>
  )},
  "list": { label: "List", render: () => (
    <div style={{ fontSize: 9, color: "#e2e8f0", display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      {["Feature one here", "Feature two here", "Feature three"].map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )},
  "stats": { label: "Stats", render: () => (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      {[{ v: "10M+", l: "USERS" }, { v: "99%", l: "UPTIME" }].map((s, i) => (
        <div key={i} style={{ flex: 1, background: `${["#3b82f6", "#22c55e"][i]}08`, border: `1px solid ${["#3b82f6", "#22c55e"][i]}20`, borderRadius: 8, padding: "8px 4px", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: ["#3b82f6", "#22c55e"][i], fontFamily: "monospace" }}>{s.v}</div>
          <div style={{ fontSize: 6, color: "#94a3b8", letterSpacing: 1 }}>{s.l}</div>
        </div>
      ))}
    </div>
  )},
  "code": { label: "Code Block", render: () => (
    <div style={{ background: "#1e1e2e", borderRadius: 8, padding: "6px 10px", width: "100%", fontFamily: "monospace", fontSize: 8, lineHeight: 1.5 }}>
      <div><span style={{ color: "#569cd6" }}>const</span> <span style={{ color: "#d4d4d4" }}>app = </span><span style={{ color: "#ce9178" }}>"express"</span></div>
      <div><span style={{ color: "#d4d4d4" }}>app.</span><span style={{ color: "#569cd6" }}>listen</span><span style={{ color: "#d4d4d4" }}>(</span><span style={{ color: "#b5cea8" }}>3000</span><span style={{ color: "#d4d4d4" }}>)</span></div>
    </div>
  )},
  "terminal": { label: "Terminal", render: () => (
    <div style={{ background: "#0a0a14", borderRadius: 8, padding: "6px 10px", width: "100%", fontFamily: "monospace", fontSize: 8, lineHeight: 1.6 }}>
      <div><span style={{ color: "#22c55e", fontWeight: 700 }}>$ </span><span style={{ color: "#f8fafc" }}>npm install</span></div>
      <div style={{ color: "#94a3b8", fontSize: 7 }}>added 156 packages</div>
    </div>
  )},
  "bar": { label: "Bar Chart", render: () => (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      {[{ l: "React", v: 80, c: "#3b82f6" }, { l: "Vue", v: 45, c: "#22c55e" }, { l: "Svelte", v: 20, c: "#f59e0b" }].map((b, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, marginBottom: 2 }}>
            <span style={{ color: "#e2e8f0" }}>{b.l}</span><span style={{ color: b.c, fontWeight: 700 }}>{b.v}%</span>
          </div>
          <div style={{ height: 10, borderRadius: 3, background: "#1a1a2e" }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${b.v}%`, background: b.c }} />
          </div>
        </div>
      ))}
    </div>
  )},
  "steps": { label: "Process Steps", render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      {["Install", "Configure", "Deploy"].map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: i < 2 ? ["#3b82f6", "#22c55e"][i] : "#1a1a2e", border: `1px solid ${i < 2 ? ["#3b82f6", "#22c55e"][i] : "#475569"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{i < 2 ? "\u2713" : i + 1}</div>
          <span style={{ fontSize: 8, color: i < 2 ? "#94a3b8" : "#e2e8f0", textDecoration: i < 2 ? "line-through" : "none" }}>{s}</span>
        </div>
      ))}
    </div>
  )},
  "logo": { label: "Logo Grid", render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, width: "100%" }}>
      {[{ i: "D", c: "#2496ed" }, { i: "K", c: "#326ce5" }, { i: "N", c: "#009639" }].map((x, xi) => (
        <div key={xi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", borderRadius: 6, background: `${x.c}08`, border: `1px solid ${x.c}15` }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: `${x.c}15`, border: `1px solid ${x.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: x.c }}>{x.i}</div>
        </div>
      ))}
    </div>
  )},
  "kinetic": { label: "Kinetic Type", render: () => (
    <div style={{ textAlign: "center", padding: 4 }}>
      <span style={{ fontSize: 14, fontWeight: 900, background: "linear-gradient(135deg, #a855f7, #a855f7cc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Scale</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}> everything</span>
    </div>
  )},
  "split": { label: "Split Screen", render: () => (
    <div style={{ display: "flex", width: "100%", fontSize: 7, gap: 1 }}>
      <div style={{ flex: 1, padding: 4 }}>
        <div style={{ color: "#ef4444", fontWeight: 700, marginBottom: 3, fontSize: 7 }}>BEFORE</div>
        {["Slow", "Manual"].map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, color: "#e2e8f0" }}><div style={{ width: 3, height: 3, borderRadius: "50%", background: "#ef4444" }} />{s}</div>)}
      </div>
      <div style={{ width: 1, background: "#1a1a2e" }} />
      <div style={{ flex: 1, padding: 4 }}>
        <div style={{ color: "#22c55e", fontWeight: 700, marginBottom: 3, fontSize: 7 }}>AFTER</div>
        {["Fast", "Auto"].map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, color: "#e2e8f0" }}><div style={{ width: 3, height: 3, borderRadius: "50%", background: "#22c55e" }} />{s}</div>)}
      </div>
    </div>
  )},
};

// Generate all meaningful pairs
function CombinationMatrix() {
  const keys = Object.keys(miniVisuals);
  const stickyColors = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#06b6d4"];

  // Generate pairs: every visual with every other
  const pairs: [string, string][] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      pairs.push([keys[i], keys[j]]);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, maxWidth: 1600 }}>
      {pairs.map(([a, b], idx) => (
        <MiniSticky
          key={`${a}-${b}`}
          label={`${miniVisuals[a].label} + ${miniVisuals[b].label}`}
          color={stickyColors[idx % stickyColors.length]}
          left={{ title: miniVisuals[a].label, content: miniVisuals[a].render() }}
          right={{ title: miniVisuals[b].label, content: miniVisuals[b].render() }}
        />
      ))}
    </div>
  );
}

// === MAIN PAGE ===

export default function VisualPreview() {
  const [accent] = useState("#3b82f6");

  return (
    <div style={{
      minHeight: "100vh", background: "#030305", color: "#f8fafc", padding: "40px 60px",
      fontFamily: "'Inter', sans-serif",
    }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#818cf8", marginBottom: 8 }}>
        Visual Components Preview
      </h1>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 40 }}>
        Full demo flow + all individual components
      </p>

      {/* ========== FULL DEMO FLOW ========== */}
      <h2 style={{ fontSize: 16, color: "#f59e0b", marginBottom: 16, borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}>
        Full Demo: "Microservices vs Monolith" — 3 Stickies
      </h2>

      <div style={{ position: "relative", height: 820, marginBottom: 60, overflow: "hidden" }}>
        {/* === SVG LASER LAYER (behind everything) === */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
          <defs>
            <filter id="laser-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Laser: Sticky 1 → Sticky 2 */}
          {/* From right edge of sticky1 (440, 280) to left edge of sticky2 (500, 280) */}
          <line x1="430" y1="290" x2="490" y2="290" stroke="#f97316" strokeWidth={8} strokeOpacity={0.1} />
          <line x1="430" y1="290" x2="490" y2="290" stroke="#f97316" strokeWidth={4} strokeOpacity={0.25} />
          <line x1="430" y1="290" x2="490" y2="290" stroke="#f97316" strokeWidth={2} strokeOpacity={0.8} filter="url(#laser-glow)" />
          <circle r={3.5} fill="#f97316" opacity={0.9} filter="url(#laser-glow)">
            <animate attributeName="cx" values="430;490" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="cy" values="290;290" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="490" cy="290" r={5} fill="#f97316" opacity={0.2}>
            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Laser: Sticky 2 → Sticky 3 */}
          {/* From right edge of sticky2 (840, 280) to left edge of sticky3 (900, 280) */}
          <line x1="840" y1="290" x2="900" y2="290" stroke="#ef4444" strokeWidth={8} strokeOpacity={0.1} />
          <line x1="840" y1="290" x2="900" y2="290" stroke="#ef4444" strokeWidth={4} strokeOpacity={0.25} />
          <line x1="840" y1="290" x2="900" y2="290" stroke="#ef4444" strokeWidth={2} strokeOpacity={0.8} filter="url(#laser-glow)" />
          <circle r={3.5} fill="#ef4444" opacity={0.9} filter="url(#laser-glow)">
            <animate attributeName="cx" values="840;900" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="cy" values="290;290" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="900" cy="290" r={5} fill="#ef4444" opacity={0.2}>
            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* === STICKY 1: EVOLUTION (position: absolute) === */}
        <div style={{ position: "absolute", left: 10, top: 20, width: 420, zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#f9731615", border: "1px solid #f9731630",
            borderRadius: 20, padding: "4px 14px", marginBottom: -10,
            position: "relative", zIndex: 2, marginLeft: 20,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#f97316", fontFamily: "monospace", letterSpacing: 1 }}>STEP 1: EVOLUTION</span>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 10px #f97316" }} />
          </div>
          <div style={{
            borderRadius: 20, padding: "24px 20px 16px",
            background: "linear-gradient(145deg, #1a1008, #0f0f1a)",
            border: "1.5px solid #f9731625",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 40px #f9731610, 0 8px 40px rgba(0,0,0,0.6)",
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 10px #f59e0b60" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>ARCHITECTURE HISTORY</span>
                <div style={{ flex: 1, height: 1, background: "#f59e0b20" }} />
              </div>
              <TimelineHorizontal />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 10px #f9731660" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>KEY METRICS</span>
                <div style={{ flex: 1, height: 1, background: "#f9731620" }} />
              </div>
              <Stats items={[
                { label: "Companies", value: "83%", subtitle: "Use microservices" },
                { label: "Migration", value: "2.5yr", subtitle: "Average timeline" },
              ]} />
            </div>
          </div>
        </div>

        {/* === STICKY 2: MONOLITH === */}
        <div style={{ position: "absolute", left: 490, top: 20, width: 350, zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#ef444415", border: "1px solid #ef444430",
            borderRadius: 20, padding: "4px 14px", marginBottom: -10,
            position: "relative", zIndex: 2, marginLeft: 20,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", fontFamily: "monospace", letterSpacing: 1 }}>STEP 2: MONOLITH</span>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
          </div>
          <div style={{
            borderRadius: 20, padding: "24px 20px 16px",
            background: "linear-gradient(145deg, #1a0808, #0f0f1a)",
            border: "1.5px solid #ef444425",
            boxShadow: "0 0 40px #ef444410, 0 8px 40px rgba(0,0,0,0.6)",
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef444460" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>ARCHITECTURE</span>
                <div style={{ flex: 1, height: 1, background: "#ef444420" }} />
              </div>
              <CodeBlock language="bash" code={"app/\n  src/\n    controllers/\n    models/\n    views/\n    routes.ts\n  package.json"} accentColor="#ef4444" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", boxShadow: "0 0 10px #f9731660" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>PROBLEMS</span>
                <div style={{ flex: 1, height: 1, background: "#f9731620" }} />
              </div>
              <ListVis items={["Tightly coupled", "Single point of failure", "Slow deployments"]} style="bullet" accentColor="#ef4444" />
            </div>
          </div>
        </div>

        {/* === STICKY 3: MICROSERVICES === */}
        <div style={{ position: "absolute", left: 900, top: 20, width: 380, zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#22c55e15", border: "1px solid #22c55e30",
            borderRadius: 20, padding: "4px 14px", marginBottom: -10,
            position: "relative", zIndex: 2, marginLeft: 20,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", fontFamily: "monospace", letterSpacing: 1 }}>STEP 3: MICROSERVICES</span>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
          </div>
          <div style={{
            borderRadius: 20, padding: "24px 20px 16px",
            background: "linear-gradient(145deg, #081a08, #0f0f1a)",
            border: "1.5px solid #22c55e25",
            boxShadow: "0 0 40px #22c55e10, 0 8px 40px rgba(0,0,0,0.6)",
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e60" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>COMPARISON</span>
                <div style={{ flex: 1, height: 1, background: "#22c55e20" }} />
              </div>
              <TableVis headers={["", "Monolith", "Micro"]} rows={[["Deploy", "Hours", "Minutes"], ["Scale", "Vertical", "Horizontal"], ["Team", "1 big", "Many small"]]} highlightCol={2} accentColor="#22c55e" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 10px #06b6d460" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>TECH STACK</span>
                <div style={{ flex: 1, height: 1, background: "#06b6d420" }} />
              </div>
              <div style={{ background: "#0f0f1a", borderRadius: 12, padding: 14, border: "1px solid #1a1a2e", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[{ i: "D", l: "Docker", c: "#2496ed" }, { i: "K", l: "K8s", c: "#326ce5" }, { i: "N", l: "Nginx", c: "#009639" }].map((x, xi) => (
                  <div key={xi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 4px", borderRadius: 8, background: `${x.c}08`, border: `1px solid ${x.c}15` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${x.c}15`, border: `1.5px solid ${x.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: x.c }}>{x.i}</div>
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 10px #a855f760" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>ADOPTION</span>
                <div style={{ flex: 1, height: 1, background: "#a855f720" }} />
              </div>
              <BarChart items={[{ label: "Microservices", value: 83 }, { label: "Monolith", value: 12 }, { label: "Hybrid", value: 5 }]} unit="%" maxValue={100} />
            </div>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #1a1a2e", margin: "40px 0" }} />

      {/* ========== INDIVIDUAL COMPONENTS ========== */}

      <h2 style={{ fontSize: 16, color: "#818cf8", marginBottom: 16, borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}>
        Group 1: Text-Based
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 1200 }}>
        {/* Code Block */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Code Block</h3>
          <CodeBlock language="typescript" filename="server.ts" code={sampleCode} highlightLines={[7, 8]} accentColor={accent} />
        </div>

        {/* Terminal */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Terminal</h3>
          <Terminal commands={sampleCommands} title="bash — my-app" />
        </div>

        {/* List — Bullet */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>List (Bullet)</h3>
          <ListVis items={sampleList} style="bullet" accentColor="#06b6d4" />
        </div>

        {/* List — Numbered */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>List (Numbered)</h3>
          <ListVis items={sampleList} style="numbered" accentColor="#f59e0b" />
        </div>

        {/* List — Checklist */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>List (Checklist)</h3>
          <ListVis items={sampleList.slice(0, 3)} style="checklist" accentColor="#22c55e" />
        </div>

        {/* Kinetic — Impact */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Kinetic Typography (Impact)</h3>
          <div style={{ background: "#0a0a14", borderRadius: 12, border: "1px solid #1a1a2e", display: "flex", justifyContent: "center", padding: 20 }}>
            <KineticType text={sampleKineticText} highlight={["Microservices", "scaling"]} style="impact" accentColor="#a855f7" />
          </div>
        </div>

        {/* Kinetic — Stack */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Kinetic Typography (Stack)</h3>
          <div style={{ background: "#0a0a14", borderRadius: 12, border: "1px solid #1a1a2e", display: "flex", justifyContent: "center", padding: 20 }}>
            <KineticType text="Ship Fast Break Nothing Scale Everything" highlight={["Fast", "Nothing", "Everything"]} style="stack" accentColor="#ef4444" />
          </div>
        </div>

        {/* Kinetic — Reveal */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Kinetic Typography (Reveal)</h3>
          <div style={{ background: "#0a0a14", borderRadius: 12, border: "1px solid #1a1a2e", display: "flex", justifyContent: "center", padding: 20 }}>
            <KineticType text="Every second counts when your API is down" highlight={["second", "API", "down"]} style="reveal" accentColor="#f97316" />
          </div>
        </div>
      </div>

      {/* ===== GROUP 2: DATA ===== */}
      <h2 style={{ fontSize: 16, color: "#818cf8", marginTop: 60, marginBottom: 16, borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}>
        Group 2: Data
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 1200 }}>
        {/* Table */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Table (highlight col 3)</h3>
          <TableVis headers={sampleTableHeaders} rows={sampleTableRows} highlightCol={3} accentColor="#22c55e" />
        </div>

        {/* Bar Chart */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Bar Chart</h3>
          <BarChart items={sampleBarItems} unit="%" maxValue={50} />
        </div>

        {/* Pie Chart — Donut */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Pie Chart (Donut)</h3>
          <PieChart items={samplePieItems} donut={true} />
        </div>

        {/* Pie Chart — Full */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Pie Chart (Full)</h3>
          <PieChart items={[...samplePieItems, { label: "Support", value: 15 }]} donut={false} />
        </div>

        {/* Stats — 4 items */}
        <div style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Statistics / Counters</h3>
          <Stats items={sampleStats} />
        </div>
      </div>

      {/* ===== GROUP 3: STRUCTURE ===== */}
      <h2 style={{ fontSize: 16, color: "#818cf8", marginTop: 60, marginBottom: 16, borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}>
        Group 3: Structure
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 1200 }}>
        {/* Timeline — Horizontal */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Timeline (Horizontal)</h3>
          <TimelineHorizontal />
        </div>

        {/* Timeline — Vertical */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Timeline (Vertical)</h3>
          <TimelineVertical />
        </div>

        {/* Hierarchy */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Hierarchy / Tree</h3>
          <HierarchyVis />
        </div>

        {/* Process Steps */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Process Steps</h3>
          <ProcessSteps />
        </div>
      </div>

      {/* ===== GROUP 4: LAYOUT / META ===== */}
      <h2 style={{ fontSize: 16, color: "#818cf8", marginTop: 60, marginBottom: 16, borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}>
        Group 4: Layout / Meta
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 1200, marginBottom: 80 }}>
        {/* Logo Grid */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Logo Grid</h3>
          <LogoGrid />
        </div>

        {/* Split Screen */}
        <div>
          <h3 style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Split Screen (VS variant)</h3>
          <SplitScreen />
        </div>
      </div>

      {/* ===== COMBINATION MATRIX ===== */}
      <h2 style={{ fontSize: 16, color: "#ef4444", marginTop: 60, marginBottom: 8, borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}>
        Combination Matrix — Every Visual Pair
      </h2>
      <p style={{ fontSize: 11, color: "#64748b", marginBottom: 24 }}>
        Each box = mini sticky with 2 sections side by side. Check which pairs look good together.
      </p>

      <CombinationMatrix />

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}
