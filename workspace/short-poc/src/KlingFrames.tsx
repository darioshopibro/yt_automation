import React from "react";
import { useCurrentFrame, Sequence } from "remotion";

/* ─── Greg Isenberg Style Tokens ─── */
const C = {
  bg: "#F0F0F0",
  dark: "#1E3A2F",
  mint: "#80C2A0",
  coral: "#DE6B58",
  white: "#FFFFFF",
  grid: "#E0E0E0",
};

const SHADOW = "0 10px 30px rgba(0,0,0,0.18)";
const SHADOW_LIGHT = "0 6px 18px rgba(0,0,0,0.12)";

/* ─── Pill Badge ─── */
const Pill: React.FC<{
  label: string;
  icon?: string;
  x: number;
  y: number;
  scale?: number;
  variant?: "dark" | "mint";
}> = ({ label, icon, x, y, scale = 1, variant = "dark" }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      background: variant === "dark" ? C.dark : C.mint,
      color: variant === "dark" ? C.white : C.dark,
      padding: "14px 30px",
      borderRadius: 50,
      fontSize: 22,
      fontWeight: 700,
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      alignItems: "center",
      gap: 10,
      boxShadow: SHADOW,
      whiteSpace: "nowrap" as const,
    }}
  >
    {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
    {label}
  </div>
);

/* ─── Large Card ─── */
const Card: React.FC<{
  title: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  children?: React.ReactNode;
}> = ({ title, x, y, w = 380, h = 440, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      width: w,
      height: h,
      background: C.dark,
      borderRadius: 20,
      padding: 36,
      boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
      }}
    >
      ⚙️
    </div>
    <div style={{ color: C.white, fontSize: 28, fontWeight: 800, fontFamily: "-apple-system, sans-serif" }}>
      {title}
    </div>
    <div style={{ height: 1, background: "rgba(255,255,255,0.12)" }} />
    {children}
  </div>
);

/* ─── Skeleton Lines ─── */
const SkeletonLines: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
    <div style={{ height: 12, width: "100%", background: "rgba(255,255,255,0.1)", borderRadius: 6 }} />
    <div style={{ height: 12, width: "80%", background: "rgba(255,255,255,0.1)", borderRadius: 6 }} />
    <div style={{ height: 12, width: "60%", background: "rgba(255,255,255,0.1)", borderRadius: 6 }} />
  </div>
);

/* ─── Dotted Line ─── */
const DottedLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}> = ({ x1, y1, x2, y2 }) => (
  <svg
    style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}
  >
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={C.dark}
      strokeWidth={3}
      strokeDasharray="10 8"
    />
  </svg>
);

/* ─── Background ─── */
const Background: React.FC = () => (
  <div
    style={{
      position: "absolute",
      width: 1080,
      height: 1920,
      background: C.bg,
      backgroundImage: `radial-gradient(circle, ${C.grid} 1px, transparent 1px)`,
      backgroundSize: "24px 24px",
    }}
  />
);

/* ─── Sunburst ─── */
const Sunburst: React.FC<{ x: number; y: number; size?: number }> = ({
  x,
  y,
  size = 120,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      width: size,
      height: size,
      background: `radial-gradient(circle, ${C.coral} 30%, transparent 70%)`,
      borderRadius: "50%",
      filter: "blur(2px)",
      opacity: 0.7,
    }}
  />
);

/* ═══════════════════════════════════════════
   KEY FRAMES — Svaki frame je 1 sekunda (30 frames)
   Ukupno 8 key frame-ova = 8 sekundi
   ═══════════════════════════════════════════ */

export const KlingFrames: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden" }}>
      {/* ── FRAME 1 (0s): 4 pilla plutaju ── */}
      <Sequence from={0} durationInFrames={30}>
        <Background />
        <Sunburst x={540} y={700} size={200} />
        <Pill label="Workflows" icon="🔄" x={300} y={700} />
        <Pill label="Agents" icon="🤖" x={780} y={700} />
        <Pill label="Voice AI" icon="🎙" x={300} y={900} />
        <Pill label="Chatbots" icon="💬" x={780} y={900} />
      </Sequence>

      {/* ── FRAME 2 (1s): Pillovi se skupili u centar ── */}
      <Sequence from={30} durationInFrames={30}>
        <Background />
        <Sunburst x={540} y={800} size={160} />
        <Pill label="Workflows" icon="🔄" x={440} y={760} scale={0.85} />
        <Pill label="Agents" icon="🤖" x={640} y={760} scale={0.85} />
        <Pill label="Voice AI" icon="🎙" x={440} y={850} scale={0.85} />
        <Pill label="Chatbots" icon="💬" x={640} y={850} scale={0.85} />
      </Sequence>

      {/* ── FRAME 3 (2s): Merged u jedan pill ── */}
      <Sequence from={60} durationInFrames={30}>
        <Background />
        <Pill label="AI Toolkit" icon="⚙️" x={540} y={800} scale={1.2} />
      </Sequence>

      {/* ── FRAME 4 (3s): Pill se pretvara u karticu (mid-expand) ── */}
      <Sequence from={90} durationInFrames={30}>
        <Background />
        <div
          style={{
            position: "absolute",
            left: 540,
            top: 800,
            transform: "translate(-50%, -50%)",
            width: 240,
            height: 180,
            background: C.dark,
            borderRadius: 24,
            boxShadow: SHADOW,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: C.white, fontSize: 26, fontWeight: 700, fontFamily: "sans-serif" }}>
            ⚙️ AI Toolkit
          </span>
        </div>
      </Sequence>

      {/* ── FRAME 5 (4s): Kartica potpuno otvorena sa skeleton content ── */}
      <Sequence from={120} durationInFrames={30}>
        <Background />
        <Card title="AI Toolkit" x={540} y={750}>
          <SkeletonLines />
        </Card>
      </Sequence>

      {/* ── FRAME 6 (5s): Kartica sa feature pillovima ── */}
      <Sequence from={150} durationInFrames={30}>
        <Background />
        <Card title="AI Toolkit" x={540} y={750}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
            <Pill label="Automate" icon="⚡" x={190} y={24} variant="mint" scale={0.8} />
            <Pill label="Scale" icon="📈" x={190} y={74} variant="mint" scale={0.8} />
            <Pill label="Deploy" icon="🚀" x={190} y={124} variant="mint" scale={0.8} />
          </div>
        </Card>
      </Sequence>

      {/* ── FRAME 7 (6s): Flowchart — kartica + dotted lines + child pillovi ── */}
      <Sequence from={180} durationInFrames={30}>
        <Background />
        <Pill label="AI Toolkit" icon="⚙️" x={540} y={400} />
        <DottedLine x1={540} y1={430} x2={540} y2={550} />
        <DottedLine x1={540} y1={550} x2={280} y2={650} />
        <DottedLine x1={540} y1={550} x2={540} y2={650} />
        <DottedLine x1={540} y1={550} x2={800} y2={650} />
        <Pill label="n8n" icon="🔄" x={280} y={700} scale={0.85} />
        <Pill label="Claude" icon="🤖" x={540} y={700} scale={0.85} />
        <Pill label="Vapi" icon="🎙" x={800} y={700} scale={0.85} />
        <DottedLine x1={280} y1={730} x2={280} y2={830} />
        <DottedLine x1={540} y1={730} x2={540} y2={830} />
        <DottedLine x1={800} y1={730} x2={800} y2={830} />
        <Card title="Workflows" x={280} y={980} w={220} h={240}>
          <SkeletonLines />
        </Card>
        <Card title="Agents" x={540} y={980} w={220} h={240}>
          <SkeletonLines />
        </Card>
        <Card title="Voice AI" x={800} y={980} w={220} h={240}>
          <SkeletonLines />
        </Card>
      </Sequence>

      {/* ── FRAME 8 (7s): Full network view — sve povezano ── */}
      <Sequence from={210} durationInFrames={30}>
        <Background />
        <Sunburst x={540} y={500} size={300} />
        <Pill label="AI Toolkit" icon="⚙️" x={540} y={350} scale={1.1} />
        <DottedLine x1={540} y1={390} x2={260} y2={550} />
        <DottedLine x1={540} y1={390} x2={540} y2={550} />
        <DottedLine x1={540} y1={390} x2={820} y2={550} />
        <Pill label="Workflows" icon="🔄" x={260} y={600} />
        <Pill label="Agents" icon="🤖" x={540} y={600} />
        <Pill label="Voice AI" icon="🎙" x={820} y={600} />
        <DottedLine x1={260} y1={640} x2={260} y2={750} />
        <DottedLine x1={540} y1={640} x2={540} y2={750} />
        <DottedLine x1={820} y1={640} x2={820} y2={750} />
        <Pill label="Automate" icon="⚡" x={260} y={800} variant="mint" scale={0.8} />
        <Pill label="Scale" icon="📈" x={540} y={800} variant="mint" scale={0.8} />
        <Pill label="Deploy" icon="🚀" x={820} y={800} variant="mint" scale={0.8} />
        {/* Bottom CTA area */}
        <DottedLine x1={260} y1={840} x2={540} y2={960} />
        <DottedLine x1={540} y1={840} x2={540} y2={960} />
        <DottedLine x1={820} y1={840} x2={540} y2={960} />
        <Pill label="Launch Your AI Stack" icon="🚀" x={540} y={1010} scale={1.15} />
      </Sequence>
    </div>
  );
};
