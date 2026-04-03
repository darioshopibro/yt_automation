import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

/* ─────────────────────────────────────────────
   Generated_ContainersMicroComputers
   "Containers as Micro Computers" segment
   Shows containers with OS/CPU/Memory/Network,
   add/remove/stop/start, MySQL + Node.js, networking + scaling
   1920×1080 @ 30fps, frames 975–1993
   ───────────────────────────────────────────── */

// ── Design tokens ──
const BG = "#0f0f1a";
const BORDER = "#1a1a2e";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_DIM = "#64748b";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";
const RED = "#ef4444";
const CYAN = "#06b6d4";
const ORANGE = "#f97316";
const PINK = "#ec4899";

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const EASE_OUT = { ...CLAMP, easing: Easing.out(Easing.cubic) };
const EASE_IN = { ...CLAMP, easing: Easing.in(Easing.quad) };

// ── Absolute frame timestamps (from video timeline) ──
const ABS = {
  these: 975,
  containers: 996,
  computer: 1030,
  server: 1048,
  micro: 1092,
  computers: 1100,
  operating: 1174,
  system: 1188,
  cpu: 1218,
  memory: 1249,
  network: 1267,
  added: 1367,
  removed: 1380,
  stopped: 1396,
  started: 1414,
  mysql: 1605,
  database: 1624,
  nodejs: 1656,
  application: 1671,
  networked: 1729,
  scaled: 1790,
};

// Convert to local frames (this component starts at frame 975)
const START_FRAME = 975;
const ts = Object.fromEntries(
  Object.entries(ABS).map(([k, v]) => [k, v - START_FRAME])
) as Record<keyof typeof ABS, number>;

// ── Animation helpers ──
const fadeSlideIn = (
  frame: number,
  start: number,
  dur = 18,
  yOffset = 24
) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], EASE_OUT),
  translateY: interpolate(frame, [start, start + dur], [yOffset, 0], EASE_OUT),
});

const scaleIn = (frame: number, start: number, fps: number) =>
  spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 22, mass: 0.8, stiffness: 180 },
    delay: start,
  });

const pulseGlow = (frame: number, speed = 0.05, min = 0.4, max = 1) =>
  min + (max - min) * (0.5 + 0.5 * Math.sin(frame * speed));

// ── Resource Bar Component ──
const ResourceBar: React.FC<{
  label: string;
  icon: string;
  color: string;
  value: number; // 0-1
  frame: number;
  appearFrame: number;
}> = ({ label, icon, color, value, frame, appearFrame }) => {
  const opacity = interpolate(
    frame,
    [appearFrame - 3, appearFrame + 15],
    [0, 1],
    CLAMP
  );
  const barWidth = interpolate(
    frame,
    [appearFrame, appearFrame + 25],
    [0, value * 100],
    EASE_OUT
  );
  const IconComp = getIcon(icon);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        opacity,
      }}
    >
      <IconComp size={12} weight="duotone" color={color} />
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 9,
          color: TEXT_DIM,
          width: 28,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div
        style={{
          flex: 1,
          height: 4,
          background: `${color}15`,
          borderRadius: 2,
          overflow: "hidden",
          minWidth: 40,
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            background: `${color}80`,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

// ── Micro Container Component ──
const MicroContainer: React.FC<{
  label: string;
  taskIcon: string;
  color: string;
  frame: number;
  fps: number;
  appearFrame: number;
  showResources: boolean;
  resourceFrame: number;
  statusOverride?: "running" | "stopped" | "removing" | "adding";
  statusFrame?: number;
  cpuValue?: number;
  memValue?: number;
  netValue?: number;
}> = ({
  label,
  taskIcon,
  color,
  frame,
  fps,
  appearFrame,
  showResources,
  resourceFrame,
  statusOverride,
  statusFrame = 0,
  cpuValue = 0.6,
  memValue = 0.4,
  netValue = 0.3,
}) => {
  const scale = scaleIn(frame, appearFrame - 3, fps);
  const opacity = interpolate(
    frame,
    [appearFrame - 3, appearFrame + 15],
    [0, 1],
    CLAMP
  );

  // Status-based opacity override
  let statusOpacity = 1;
  if (statusOverride === "stopped" && statusFrame > 0) {
    statusOpacity = interpolate(
      frame,
      [statusFrame, statusFrame + 12],
      [1, 0.3],
      CLAMP
    );
  } else if (statusOverride === "removing" && statusFrame > 0) {
    statusOpacity = interpolate(
      frame,
      [statusFrame, statusFrame + 15],
      [1, 0],
      CLAMP
    );
  } else if (statusOverride === "adding" && statusFrame > 0) {
    statusOpacity = interpolate(
      frame,
      [statusFrame - 3, statusFrame + 12],
      [0, 1],
      CLAMP
    );
  }

  const IconComp = getIcon(taskIcon);

  // Status indicator color
  const statusColor =
    statusOverride === "stopped"
      ? RED
      : statusOverride === "removing"
        ? RED
        : GREEN;
  const statusDotOpacity =
    statusOverride === "stopped" || statusOverride === "removing"
      ? statusOpacity
      : pulseGlow(frame, 0.08, 0.5, 1);

  return (
    <div
      style={{
        width: 180,
        background: `${color}06`,
        border: `1px solid ${color}30`,
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        opacity: opacity * statusOpacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconComp size={20} weight="duotone" color={color} />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 11,
              color: TEXT_PRIMARY,
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        </div>
        {/* Status dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: statusColor,
            opacity: statusDotOpacity,
            boxShadow: `0 0 6px ${statusColor}60`,
          }}
        />
      </div>

      {/* OS badge */}
      {showResources && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: interpolate(
              frame,
              [resourceFrame - 3, resourceFrame + 12],
              [0, 1],
              CLAMP
            ),
          }}
        >
          {React.createElement(getIcon("LinuxLogo"), {
            size: 12,
            weight: "duotone",
            color: TEXT_DIM,
          })}
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 9,
              color: TEXT_DIM,
            }}
          >
            Isolated OS
          </span>
        </div>
      )}

      {/* Resource bars */}
      {showResources && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <ResourceBar
            label="CPU"
            icon="Cpu"
            color={CYAN}
            value={cpuValue}
            frame={frame}
            appearFrame={resourceFrame + 10}
          />
          <ResourceBar
            label="MEM"
            icon="Memory"
            color={PURPLE}
            value={memValue}
            frame={frame}
            appearFrame={resourceFrame + 18}
          />
          <ResourceBar
            label="NET"
            icon="WifiHigh"
            color={GREEN}
            value={netValue}
            frame={frame}
            appearFrame={resourceFrame + 26}
          />
        </div>
      )}
    </div>
  );
};

// ── Main Component ──
const Generated_ContainersMicroComputers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase control ──
  // Phase 1 (0–~200): Containers on computer/server → micro computers
  // Phase 2 (~200–~400): Resources: OS, CPU, Memory, Network
  // Phase 3 (~400–~600): Added, removed, stopped, started
  // Phase 4 (~600–~820): MySQL, Node.js specific tasks + networking + scaling

  // ── Section title ──
  const titleOpacity = interpolate(frame, [ts.these - 3, ts.these + 12], [0, 1], CLAMP);
  const titleShrink = interpolate(frame, [ts.micro - 10, ts.micro + 10], [1, 0.75], EASE_OUT);
  const titleMoveUp = interpolate(frame, [ts.micro - 10, ts.micro + 10], [0, 1], EASE_OUT);

  // Title fades out for specific tasks phase
  const titleFadeForTasks = interpolate(
    frame,
    [ts.mysql - 60, ts.mysql - 30],
    [1, 0],
    CLAMP
  );

  // ── "Micro Computers" label ──
  const microLabelOpacity = interpolate(
    frame,
    [ts.micro - 3, ts.micro + 15],
    [0, 1],
    CLAMP
  );

  // ── Initial containers (generic) ──
  const genericContainers = [
    { label: "Container A", icon: "Cube", color: BLUE, appear: ts.containers - 3 },
    { label: "Container B", icon: "Cube", color: GREEN, appear: ts.containers + 15 },
    { label: "Container C", icon: "Cube", color: PURPLE, appear: ts.computer - 3 },
  ];

  // Resources become visible
  const showResources = frame >= ts.operating - 10;
  const resourceFrame = ts.operating - 3;

  // ── Add/Remove/Stop/Start phase ──
  // Container D gets "added"
  // Container B gets "removed"
  // Container A gets "stopped" then "started"

  // Fade out generic containers and transition to lifecycle demo
  const lifecyclePhase = frame >= ts.added - 30;
  const genericFade = interpolate(
    frame,
    [ts.added - 30, ts.added - 10],
    [1, 0],
    CLAMP
  );
  const lifecycleOpacity = interpolate(
    frame,
    [ts.added - 15, ts.added],
    [0, 1],
    CLAMP
  );

  // Lifecycle containers
  const lifecycleContainers = [
    {
      label: "Worker-1",
      icon: "GearSix",
      color: BLUE,
      appear: ts.added - 12,
      status: "running" as const,
      statusFrame: 0,
    },
    {
      label: "Worker-2",
      icon: "GearSix",
      color: GREEN,
      appear: ts.added - 10,
      status: "removing" as const,
      statusFrame: ts.removed - 3,
    },
    {
      label: "Worker-3",
      icon: "GearSix",
      color: PURPLE,
      appear: ts.added - 8,
      status: (frame >= ts.started - 3 ? "running" : frame >= ts.stopped - 3 ? "stopped" : "running") as "running" | "stopped",
      statusFrame: frame >= ts.started - 3 ? ts.started - 3 : ts.stopped - 3,
    },
    {
      label: "Worker-4",
      icon: "GearSix",
      color: AMBER,
      appear: ts.added - 3,
      status: "adding" as const,
      statusFrame: ts.added - 3,
    },
  ];

  // Status labels
  const statusActions = [
    { label: "ADDED", color: GREEN, frame: ts.added - 3 },
    { label: "REMOVED", color: RED, frame: ts.removed - 3 },
    { label: "STOPPED", color: AMBER, frame: ts.stopped - 3 },
    { label: "STARTED", color: GREEN, frame: ts.started - 3 },
  ];

  // ── Task-specific phase ──
  const taskPhase = frame >= ts.mysql - 30;
  const lifecycleFade = interpolate(
    frame,
    [ts.mysql - 40, ts.mysql - 20],
    [1, 0],
    CLAMP
  );
  const taskOpacity = interpolate(
    frame,
    [ts.mysql - 20, ts.mysql - 3],
    [0, 1],
    CLAMP
  );

  // ── Networking: containers glow together ──
  const networkPhase = frame >= ts.networked - 5;
  const networkGlow = interpolate(
    frame,
    [ts.networked - 5, ts.networked + 20],
    [0, 1],
    CLAMP
  );

  // ── Scaling: duplicate containers appear ──
  const scalePhase = frame >= ts.scaled - 5;
  const scaleOpacity = interpolate(
    frame,
    [ts.scaled - 5, ts.scaled + 15],
    [0, 1],
    CLAMP
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Ambient glow ── */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 500,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `${PURPLE}06`,
          filter: "blur(100px)",
          opacity: pulseGlow(frame, 0.02, 0.3, 0.6),
          pointerEvents: "none",
        }}
      />

      {/* ── TITLE ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          opacity: titleOpacity * titleFadeForTasks,
          transform: `scale(${titleShrink}) translateY(${titleMoveUp * -30}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {React.createElement(getIcon("Desktop"), {
            size: 40,
            weight: "duotone",
            color: CYAN,
          })}
          <span
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: TEXT_PRIMARY,
              letterSpacing: -1.5,
            }}
          >
            Containers
          </span>
        </div>

        {/* "Micro Computers" subtitle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: microLabelOpacity,
          }}
        >
          <div
            style={{
              height: 1,
              width: 40,
              background: `${CYAN}40`,
            }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              color: CYAN,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Like Micro Computers
          </span>
          <div
            style={{
              height: 1,
              width: 40,
              background: `${CYAN}40`,
            }}
          />
        </div>

        {/* "on your computer or server" */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 4,
          }}
        >
          {[
            { label: "Your Computer", icon: "Laptop", color: BLUE, f: ts.computer - 3 },
            { label: "Your Server", icon: "HardDrives", color: GREEN, f: ts.server - 3 },
          ].map((item, i) => {
            const ItemIcon = getIcon(item.icon);
            const op = interpolate(
              frame,
              [item.f, item.f + 15],
              [0, 1],
              CLAMP
            );
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}25`,
                  borderRadius: 8,
                  opacity: op,
                }}
              >
                <ItemIcon size={16} weight="duotone" color={item.color} />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 11,
                    color: item.color,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PHASE 1+2: Generic containers with resources ── */}
      {!taskPhase && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            gap: 32,
            opacity: lifecyclePhase ? genericFade : 1,
          }}
        >
          {/* "Each with very specific jobs" */}
          {frame >= ts.micro - 3 && (
            <div
              style={{
                opacity: interpolate(
                  frame,
                  [ts.micro - 3, ts.micro + 12],
                  [0, 1],
                  CLAMP
                ),
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  color: TEXT_SECONDARY,
                  fontWeight: 500,
                }}
              >
                Each with very specific jobs
              </span>
            </div>
          )}

          {/* Container grid */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 28,
            }}
          >
            {genericContainers.map((c, i) => (
              <MicroContainer
                key={i}
                label={c.label}
                taskIcon={c.icon}
                color={c.color}
                frame={frame}
                fps={fps}
                appearFrame={c.appear}
                showResources={showResources}
                resourceFrame={resourceFrame + i * 8}
                cpuValue={0.3 + i * 0.2}
                memValue={0.2 + i * 0.15}
                netValue={0.15 + i * 0.1}
              />
            ))}
          </div>

          {/* Resource labels appearing */}
          {showResources && (
            <div
              style={{
                display: "flex",
                gap: 20,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Isolated OS", icon: "LinuxLogo", color: TEXT_DIM, f: ts.operating - 3 },
                { label: "Own CPU", icon: "Cpu", color: CYAN, f: ts.cpu - 3 },
                { label: "Own Memory", icon: "Memory", color: PURPLE, f: ts.memory - 3 },
                { label: "Own Network", icon: "WifiHigh", color: GREEN, f: ts.network - 3 },
              ].map((r, i) => {
                const RIcon = getIcon(r.icon);
                const op = interpolate(
                  frame,
                  [r.f, r.f + 15],
                  [0, 1],
                  CLAMP
                );
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 16px",
                      background: `${r.color}08`,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 10,
                      opacity: op,
                    }}
                  >
                    <RIcon size={18} weight="duotone" color={r.color} />
                    <span
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 12,
                        color: r.color,
                        fontWeight: 500,
                      }}
                    >
                      {r.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PHASE 3: Lifecycle — add/remove/stop/start ── */}
      {lifecyclePhase && !taskPhase && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            gap: 32,
            opacity: lifecycleOpacity * lifecycleFade,
          }}
        >
          {/* Subtitle */}
          <span
            style={{
              fontSize: 16,
              color: TEXT_SECONDARY,
              fontWeight: 500,
            }}
          >
            Without affecting each other or the host machine
          </span>

          {/* Lifecycle containers */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {lifecycleContainers.map((c, i) => (
              <MicroContainer
                key={i}
                label={c.label}
                taskIcon={c.icon}
                color={c.color}
                frame={frame}
                fps={fps}
                appearFrame={c.appear}
                showResources={false}
                resourceFrame={0}
                statusOverride={c.status}
                statusFrame={c.statusFrame}
              />
            ))}
          </div>

          {/* Status action labels */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
            }}
          >
            {statusActions.map((action, i) => {
              const op = interpolate(
                frame,
                [action.frame, action.frame + 12],
                [0, 1],
                CLAMP
              );
              const sc = scaleIn(frame, action.frame, fps);
              return (
                <div
                  key={i}
                  style={{
                    padding: "8px 18px",
                    background: `${action.color}12`,
                    border: `1px solid ${action.color}35`,
                    borderRadius: 8,
                    opacity: op,
                    transform: `scale(${sc})`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      color: action.color,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    {action.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PHASE 4: Specific tasks + Networking + Scaling ── */}
      {taskPhase && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            gap: 36,
            opacity: taskOpacity,
          }}
        >
          {/* Section label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {React.createElement(getIcon("Target"), {
              size: 24,
              weight: "duotone",
              color: AMBER,
            })}
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: TEXT_PRIMARY,
              }}
            >
              One Container, One Task
            </span>
          </div>

          {/* Task containers row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              position: "relative",
            }}
          >
            {/* Network glow background */}
            {networkPhase && (
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  left: -30,
                  right: -30,
                  bottom: -20,
                  borderRadius: 20,
                  background: `${CYAN}05`,
                  border: `1px solid ${CYAN}${Math.round(networkGlow * 30).toString(16).padStart(2, "0")}`,
                  opacity: networkGlow,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* MySQL container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MicroContainer
                label="MySQL"
                taskIcon="Database"
                color={BLUE}
                frame={frame}
                fps={fps}
                appearFrame={ts.mysql - 3}
                showResources={true}
                resourceFrame={ts.mysql + 5}
                cpuValue={0.45}
                memValue={0.7}
                netValue={0.3}
              />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 10,
                  color: TEXT_DIM,
                  opacity: interpolate(
                    frame,
                    [ts.database - 3, ts.database + 12],
                    [0, 1],
                    CLAMP
                  ),
                }}
              >
                Database Service
              </span>
            </div>

            {/* Node.js container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MicroContainer
                label="Node.js"
                taskIcon="Code"
                color={GREEN}
                frame={frame}
                fps={fps}
                appearFrame={ts.nodejs - 3}
                showResources={true}
                resourceFrame={ts.nodejs + 5}
                cpuValue={0.6}
                memValue={0.5}
                netValue={0.55}
              />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 10,
                  color: TEXT_DIM,
                  opacity: interpolate(
                    frame,
                    [ts.application - 3, ts.application + 12],
                    [0, 1],
                    CLAMP
                  ),
                }}
              >
                App Service
              </span>
            </div>

            {/* Redis container (appears with networking) */}
            {networkPhase && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MicroContainer
                  label="Redis"
                  taskIcon="Lightning"
                  color={RED}
                  frame={frame}
                  fps={fps}
                  appearFrame={ts.networked - 3}
                  showResources={true}
                  resourceFrame={ts.networked + 5}
                  cpuValue={0.25}
                  memValue={0.8}
                  netValue={0.4}
                />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 10,
                    color: TEXT_DIM,
                    opacity: interpolate(
                      frame,
                      [ts.networked, ts.networked + 12],
                      [0, 1],
                      CLAMP
                    ),
                  }}
                >
                  Cache Service
                </span>
              </div>
            )}
          </div>

          {/* Networked together label */}
          {networkPhase && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 24px",
                background: `${CYAN}10`,
                border: `1px solid ${CYAN}30`,
                borderRadius: 10,
                opacity: networkGlow,
              }}
            >
              {React.createElement(getIcon("ShareNetwork"), {
                size: 20,
                weight: "duotone",
                color: CYAN,
              })}
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 13,
                  color: CYAN,
                  fontWeight: 600,
                }}
              >
                Networked Together
              </span>
            </div>
          )}

          {/* Scaled: duplicate containers */}
          {scalePhase && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                opacity: scaleOpacity,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {React.createElement(getIcon("CopySimple"), {
                  size: 20,
                  weight: "duotone",
                  color: AMBER,
                })}
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 14,
                    color: AMBER,
                    fontWeight: 600,
                    letterSpacing: 2,
                  }}
                >
                  SCALED
                </span>
              </div>

              {/* Scaled replicas row */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                {[
                  { label: "Node.js (2)", color: GREEN, delay: 0 },
                  { label: "Node.js (3)", color: GREEN, delay: 8 },
                  { label: "MySQL (2)", color: BLUE, delay: 16 },
                ].map((replica, i) => {
                  const rScale = scaleIn(frame, ts.scaled - 3 + replica.delay, fps);
                  const rOpacity = interpolate(
                    frame,
                    [ts.scaled - 3 + replica.delay, ts.scaled + 12 + replica.delay],
                    [0, 1],
                    CLAMP
                  );
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "10px 18px",
                        background: `${replica.color}08`,
                        border: `1px dashed ${replica.color}30`,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: rOpacity,
                        transform: `scale(${rScale})`,
                      }}
                    >
                      <Cube size={16} weight="duotone" color={replica.color} />
                      <span
                        style={{
                          fontFamily: "'SF Mono', monospace",
                          fontSize: 11,
                          color: replica.color,
                          fontWeight: 500,
                        }}
                      >
                        {replica.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Generated_ContainersMicroComputers;
