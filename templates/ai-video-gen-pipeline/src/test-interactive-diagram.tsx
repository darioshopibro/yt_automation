/**
 * TEST: InteractiveDiagram — Serverless Architecture primer
 *
 * Pokreni: npx remotion studio --port 3001
 * Otvori kompoziciju "TestInteractiveDiagram" u Studio-u
 */
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import InteractiveDiagram from "./visuals/InteractiveDiagram";

// ─── HARDKODIRAN TEST DATA ───

const serverlessElements = [
  // Row 0: Cloud Provider centered (col 1 of 3)
  { id: "cloud", label: "Cloud", icon: "Cloud", color: "#3b82f6", row: 0, col: 1 },
  // Row 1: Event → Lambda → Result
  { id: "event", label: "Event", icon: "Lightning", color: "#a855f7", row: 1, col: 0 },
  { id: "lambda", label: "Lambda", icon: "Function", color: "#f97316", row: 1, col: 1 },
  { id: "result", label: "Result", icon: "CheckCircle", color: "#22c55e", row: 1, col: 2 },
  // Row 2: Cold Start | Container
  { id: "cold", label: "Cold Start", icon: "Timer", color: "#ef4444", row: 2, col: 0 },
  { id: "container", label: "Container", icon: "Package", color: "#06b6d4", row: 2, col: 2 },
];

const serverlessTimeline = [
  // Act 1: Cloud + Lambda appear
  { frame: 10,  op: "appear" as const, target: "cloud" },
  { frame: 30,  op: "appear" as const, target: "lambda" },
  { frame: 45,  op: "connect" as const, from: "cloud", to: "lambda", label: "manages" },

  // Act 2: Event triggers Lambda, produces Result
  { frame: 70,  op: "appear" as const, target: "event" },
  { frame: 85,  op: "connect" as const, from: "event", to: "lambda", label: "triggers" },
  { frame: 100, op: "appear" as const, target: "result" },
  { frame: 110, op: "connect" as const, from: "lambda", to: "result" },
  { frame: 125, op: "highlight" as const, target: "lambda", badge: "pay per ms" },

  // Act 3: Cold start problem, container alternative
  { frame: 160, op: "appear" as const, target: "cold" },
  { frame: 175, op: "connect" as const, from: "cold", to: "lambda", label: "slows down" },
  { frame: 195, op: "eliminate" as const, target: "cold" },
  { frame: 210, op: "appear" as const, target: "container" },
  { frame: 225, op: "highlight" as const, target: "container", badge: "60-70% cheaper" },
];

// ─── TEST 2: Kubernetes Scheduler (kompleksniji — 8 elemenata, transformacije) ───

const k8sElements = [
  // Row 0: Pod — mixed types!
  { id: "pod", label: "New Pod", type: "icon-box" as const, icon: "Cube", color: "#a855f7", row: 0, col: 1 },
  { id: "pod-status", label: "Status", type: "status" as const, status: "pending" as const, color: "#f59e0b", row: 0, col: 2 },
  // Row 1: 4 Nodes — some as progress bars showing resources
  { id: "node1", label: "Node 1 — CPU 95%", type: "progress-bar" as const, value: 95, color: "#ef4444", row: 1, col: 0 },
  { id: "node2", label: "Node 2 — CPU 45%", type: "progress-bar" as const, value: 45, color: "#22c55e", row: 1, col: 1 },
  { id: "node3", label: "Node 3 — CPU 72%", type: "progress-bar" as const, value: 72, color: "#f59e0b", row: 1, col: 2 },
  { id: "node4", label: "Node 4 — CPU 98%", type: "progress-bar" as const, value: 98, color: "#ef4444", row: 1, col: 3 },
  // Row 2: Scheduler + Score + Bound
  { id: "scheduler", label: "Scheduler", type: "icon-box" as const, icon: "FunnelSimple", color: "#ec4899", row: 2, col: 0 },
  { id: "score2", label: "Node 2", type: "score" as const, value: 85, color: "#22c55e", row: 2, col: 1 },
  { id: "score3", label: "Node 3", type: "score" as const, value: 62, color: "#f59e0b", row: 2, col: 2 },
  { id: "bound", label: "Bound!", type: "stat" as const, value: "Node 2", subtitle: "Best fit", color: "#22c55e", row: 2, col: 3 },
];

const k8sTimeline = [
  // Act 1: Pod + status appear
  { frame: 5,   op: "appear" as const, target: "pod" },
  { frame: 10,  op: "appear" as const, target: "pod-status" },
  { frame: 15,  op: "highlight" as const, target: "pod", badge: "Pending" },

  // Act 2: Scheduler + 4 nodes (progress bars showing CPU)
  { frame: 35,  op: "appear" as const, target: "scheduler" },
  { frame: 50,  op: "appear" as const, target: "node1" },
  { frame: 55,  op: "appear" as const, target: "node2" },
  { frame: 60,  op: "appear" as const, target: "node3" },
  { frame: 65,  op: "appear" as const, target: "node4" },

  // Act 3: Scheduler checks all nodes
  { frame: 80,  op: "connect" as const, from: "scheduler", to: "node1" },
  { frame: 85,  op: "connect" as const, from: "scheduler", to: "node2" },
  { frame: 90,  op: "connect" as const, from: "scheduler", to: "node3" },
  { frame: 95,  op: "connect" as const, from: "scheduler", to: "node4" },

  // Act 4: Node 1 (95% CPU) and Node 4 (98% CPU) eliminated — too full
  { frame: 115, op: "eliminate" as const, target: "node1" },
  { frame: 120, op: "eliminate" as const, target: "node4" },

  // Act 5: Score circles appear for remaining nodes
  { frame: 145, op: "appear" as const, target: "score2" },
  { frame: 150, op: "appear" as const, target: "score3" },
  { frame: 155, op: "highlight" as const, target: "score2", badge: "Winner" },

  // Act 6: Bound result
  { frame: 180, op: "appear" as const, target: "bound" },
  { frame: 185, op: "connect" as const, from: "node2", to: "bound" },
  { frame: 190, op: "connect" as const, from: "pod", to: "bound" },
];

// ─── K8S FULL SCREEN TEST ───

export const TestK8sScheduler: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#030305" }}>
      <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.4 }}>
        <defs>
          <radialGradient id="kmesh1" cx="30%" cy="40%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="kmesh2" cx="70%" cy="60%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="30%" cy="40%" rx="40%" ry="35%" fill="url(#kmesh1)" />
        <ellipse cx="70%" cy="60%" rx="35%" ry="40%" fill="url(#kmesh2)" />
      </svg>

      <InteractiveDiagram
        elements={k8sElements}
        timeline={k8sTimeline}
        cols={4}
        fullScreen={true}
        progress={frame / 250}
      />

      <div style={{
        position: "absolute", top: 40, left: 0, right: 0, textAlign: "center",
        fontSize: 36, fontWeight: 800, color: "#f8fafc",
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: -1,
      }}>
        Kubernetes Scheduler
      </div>

      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};

// ─── SERVERLESS FULL SCREEN TEST ───

export const TestInteractiveDiagramFullScreen: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#030305" }}>
      {/* Mesh gradient background */}
      <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.4 }}>
        <defs>
          <radialGradient id="mesh1" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="mesh2" cx="70%" cy="70%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <ellipse cx="30%" cy="30%" rx="40%" ry="35%" fill="url(#mesh1)" />
        <ellipse cx="70%" cy="70%" rx="35%" ry="40%" fill="url(#mesh2)" />
      </svg>

      <InteractiveDiagram
        elements={serverlessElements}
        timeline={serverlessTimeline}
        cols={3}
        fullScreen={true}
        progress={useCurrentFrame() / 300}
      />

      {/* Title */}
      <div style={{
        position: "absolute", top: 40, left: 0, right: 0, textAlign: "center",
        fontSize: 36, fontWeight: 800, color: "#f8fafc",
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: -1,
      }}>
        Serverless Architecture
      </div>

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        pointerEvents: "none",
      }} />
    </AbsoluteFill>
  );
};

// ─── NODE MODE TEST (in a sticky-like container) ───

export const TestInteractiveDiagramNode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{
      backgroundColor: "#030305",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Simulate sticky container */}
      <div style={{
        background: "rgba(15, 15, 26, 0.8)",
        borderRadius: 20,
        border: "1.5px solid rgba(59, 130, 246, 0.25)",
        padding: 24,
        backdropFilter: "blur(16px)",
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: "#f8fafc",
          marginBottom: 12, fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Serverless Flow
        </div>
        <InteractiveDiagram
          elements={serverlessElements}
          timeline={serverlessTimeline}
          cols={3}
          progress={progress}
          shapeMode="square"
        />
      </div>
    </AbsoluteFill>
  );
};
