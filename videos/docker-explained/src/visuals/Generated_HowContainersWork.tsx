import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Cube,
  Desktop,
  Database,
  Globe,
  Cpu,
  HardDrive,
  WifiHigh,
  Play,
  Stop,
  Plus,
  Minus,
  CloudArrowDown,
  Package,
  DiamondsFour,
  GearSix,
} from "@phosphor-icons/react";

// =============================================================
// Word-level timestamps from voiceover (absolute seconds)
// Segment 2: frames 1004–2536
// =============================================================
const timestamps = [
  { word: "containers", start: 35.051, end: 35.596 },
  { word: "running", start: 35.689, end: 35.956 },
  { word: "computer", start: 36.258, end: 36.676 },
  { word: "server", start: 36.874, end: 37.268 },
  { word: "act", start: 37.477, end: 37.744 },
  { word: "micro", start: 38.418, end: 38.812 },
  { word: "computers", start: 38.87, end: 39.567 },
  { word: "specific", start: 40.682, end: 41.146 },
  { word: "jobs", start: 41.192, end: 41.634 },
  { word: "operating", start: 42.864, end: 43.282 },
  { word: "system", start: 43.329, end: 43.793 },
  { word: "isolated", start: 44.629, end: 45.187 },
  { word: "CPU", start: 45.245, end: 45.825 },
  { word: "processes", start: 45.895, end: 46.591 },
  { word: "memory", start: 46.87, end: 47.392 },
  { word: "network", start: 47.683, end: 48.043 },
  { word: "resources", start: 48.101, end: 48.797 },
  { word: "easily", start: 50.841, end: 51.224 },
  { word: "added", start: 51.282, end: 51.653 },
  { word: "removed", start: 51.804, end: 52.373 },
  { word: "stopped", start: 52.524, end: 53.035 },
  { word: "started", start: 53.325, end: 53.685 },
  { word: "affecting", start: 54.684, end: 55.067 },
  { word: "host", start: 56.228, end: 56.413 },
  { word: "machine", start: 56.46, end: 58.19 },
  { word: "task", start: 59.583, end: 60.047 },
  { word: "MySQL", start: 60.813, end: 61.556 },
  { word: "database", start: 61.626, end: 62.218 },
  { word: "node", start: 62.799, end: 63.1 },
  { word: "application", start: 63.832, end: 64.587 },
  { word: "networked", start: 65.469, end: 65.887 },
  { word: "together", start: 65.945, end: 66.398 },
  { word: "scaled", start: 67.315, end: 68.546 },
  { word: "developer", start: 68.615, end: 69.056 },
  { word: "accessing", start: 70.275, end: 70.751 },
  { word: "docker", start: 70.914, end: 71.181 },
  { word: "Hub", start: 71.216, end: 71.576 },
  { word: "online", start: 72.005, end: 72.319 },
  { word: "cloud", start: 72.354, end: 72.609 },
  { word: "repository", start: 72.655, end: 73.189 },
  { word: "pull", start: 74.814, end: 75.0 },
  { word: "pre-configured", start: 76.034, end: 76.788 },
  { word: "environment", start: 76.823, end: 77.345 },
  { word: "programming", start: 78.228, end: 78.715 },
  { word: "language", start: 78.785, end: 79.296 },
  { word: "Ruby", start: 79.993, end: 80.387 },
  { word: "nodeJS2", start: 80.817, end: 81.792 },
  { word: "files", start: 82.837, end: 83.197 },
  { word: "frameworks", start: 83.394, end: 83.917 },
  { word: "started2", start: 84.52, end: 86.169 },
];

const FPS = 30;

const f = (keyword: string): number => {
  const w = timestamps.find((t) =>
    t.word.toLowerCase().includes(keyword.toLowerCase())
  );
  return w ? Math.round(w.start * FPS) : 0;
};

// =============================================================
// Brand colors
// =============================================================
const BRAND = {
  primary: "#3b82f6",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  bg: "#030305",
  text: "#f8fafc",
};

const COLORS = {
  bg: "#0f0f1a",
  text: "#e2e8f0",
  muted: "#94a3b8",
  dim: "#64748b",
  border: "#1a1a2e",
};

// =============================================================
// Helpers
// =============================================================
const clampOpts = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...clampOpts,
    easing: Easing.out(Easing.cubic),
  });

const slideUp = (frame: number, start: number, dur = 15, dist = 25) =>
  interpolate(frame, [start, start + dur], [dist, 0], {
    ...clampOpts,
    easing: Easing.out(Easing.cubic),
  });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], {
    ...clampOpts,
    easing: Easing.in(Easing.quad),
  });

// =============================================================
// SCENE BOUNDARIES
// =============================================================
// Scene 1: Containers as micro-computers with resources (frames ~1004–1740)
// Scene 2: Lifecycle + tasks + networking (frames ~1740–2050)
// Scene 3: Docker Hub + pull (frames ~2050–2536)

const SCENE1_END = f("host") - 10; // ~1677
const SCENE2_START = f("machine"); // ~1694
const SCENE2_END = f("developer") - 10; // ~2048
const SCENE3_START = f("developer"); // ~2058

// =============================================================
// Sub-components
// =============================================================

// A single container box showing isolated resources
const ContainerBox: React.FC<{
  frame: number;
  fps: number;
  appearFrame: number;
  label: string;
  color: string;
  showResources: boolean;
  resourceAppearFrame: number;
  icon: React.ReactNode;
  index: number;
}> = ({
  frame,
  fps,
  appearFrame,
  label,
  color,
  showResources,
  resourceAppearFrame,
  icon,
  index,
}) => {
  const opacity = fadeIn(frame, appearFrame);
  const ty = slideUp(frame, appearFrame);
  const scale = spring({
    frame: Math.max(0, frame - appearFrame),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  const resources = [
    { icon: <Cpu size={16} color={COLORS.muted} weight="duotone" />, label: "CPU" },
    { icon: <HardDrive size={16} color={COLORS.muted} weight="duotone" />, label: "MEM" },
    { icon: <WifiHigh size={16} color={COLORS.muted} weight="duotone" />, label: "NET" },
  ];

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${ty}px) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "20px 18px",
        borderRadius: 12,
        background: `${color}0a`,
        border: `1.5px solid ${color}25`,
        boxShadow:
          frame > appearFrame + 20 ? `0 0 20px ${color}15` : "none",
        minWidth: 150,
        transition: "none",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1.5px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 15px ${color}15`,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.text,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>

      {/* Resource indicators */}
      {showResources && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 4,
            opacity: fadeIn(frame, resourceAppearFrame, 12),
            transform: `translateY(${slideUp(frame, resourceAppearFrame, 12, 10)}px)`,
          }}
        >
          {resources.map((r, ri) => {
            const rDelay = resourceAppearFrame + ri * 6;
            const rOp = fadeIn(frame, rDelay, 10);
            return (
              <div
                key={ri}
                style={{
                  opacity: rOp,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "#ffffff06",
                  border: "1px solid #ffffff0a",
                }}
              >
                {r.icon}
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'SF Mono', monospace",
                    fontWeight: 500,
                    color: COLORS.dim,
                    letterSpacing: 1,
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
  );
};

// =============================================================
// MAIN COMPONENT
// =============================================================
const Generated_HowContainersWork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- KEY FRAMES (from timestamps) ---
  const CONTAINERS = f("containers"); // ~1052
  const COMPUTER = f("computer"); // ~1088
  const MICRO = f("micro"); // ~1153
  const JOBS = f("jobs"); // ~1236
  const OS = f("operating"); // ~1286
  const ISOLATED = f("isolated"); // ~1339
  const CPU_F = f("CPU"); // ~1357
  const MEMORY = f("memory"); // ~1406
  const NETWORK = f("network"); // ~1431
  const ADDED = f("added"); // ~1538
  const REMOVED = f("removed"); // ~1554
  const STOPPED = f("stopped"); // ~1576
  const STARTED = f("started"); // ~1600
  const TASK = f("task"); // ~1787
  const MYSQL = f("MySQL"); // ~1824
  const DATABASE = f("database"); // ~1849
  const NODE_APP = f("node"); // ~1884
  const NETWORKED = f("networked"); // ~1964
  const SCALED = f("scaled"); // ~2019
  const DEVELOPER = f("developer"); // ~2058
  const ACCESSING = f("accessing"); // ~2108
  const DOCKER_HUB = f("Hub"); // ~2136
  const CLOUD = f("cloud"); // ~2171
  const REPOSITORY = f("repository"); // ~2180
  const PULL = f("pull"); // ~2244
  const PRECONFIG = f("pre-configured"); // ~2281
  const ENVIRONMENT = f("environment"); // ~2305
  const RUBY = f("Ruby"); // ~2400
  const FILES_F = f("files"); // ~2485
  const FRAMEWORKS = f("frameworks"); // ~2502

  // --- SCENE TRANSITIONS ---
  const scene1Opacity = interpolate(
    frame,
    [SCENE1_END, SCENE1_END + 20],
    [1, 0],
    clampOpts
  );
  const scene2Opacity = interpolate(
    frame,
    [SCENE2_START - 5, SCENE2_START + 15, SCENE2_END, SCENE2_END + 20],
    [0, 1, 1, 0],
    clampOpts
  );
  const scene3Opacity = interpolate(
    frame,
    [SCENE3_START - 5, SCENE3_START + 15],
    [0, 1],
    clampOpts
  );

  // =============================================================
  // SCENE 1: Containers as micro-computers on a host
  // =============================================================
  const renderScene1 = () => {
    // Host machine outline
    const hostOpacity = fadeIn(frame, COMPUTER - 5);
    const hostSlide = slideUp(frame, COMPUTER - 5, 20, 30);

    // Container data
    const containers = [
      {
        label: "Container A",
        color: BRAND.primary,
        appear: MICRO - 3,
        icon: <Cube size={26} color={BRAND.primary} weight="duotone" />,
      },
      {
        label: "Container B",
        color: BRAND.secondary,
        appear: MICRO + 8,
        icon: <Cube size={26} color={BRAND.secondary} weight="duotone" />,
      },
      {
        label: "Container C",
        color: BRAND.accent,
        appear: MICRO + 16,
        icon: <Cube size={26} color={BRAND.accent} weight="duotone" />,
      },
    ];

    // "Isolated" label glow
    const isolatedGlow = interpolate(
      frame,
      [ISOLATED, ISOLATED + 20],
      [0, 1],
      clampOpts
    );

    return (
      <div
        style={{
          opacity: scene1Opacity,
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          gap: 30,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: fadeIn(frame, CONTAINERS - 3),
            transform: `translateY(${slideUp(frame, CONTAINERS - 3, 18)}px)`,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.text,
            letterSpacing: -0.5,
            marginBottom: 10,
          }}
        >
          Containers = Isolated Micro-Computers
        </div>

        {/* Host machine box */}
        <div
          style={{
            opacity: hostOpacity,
            transform: `translateY(${hostSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            padding: "36px 50px",
            borderRadius: 12,
            background: "#ffffff04",
            border: `1.5px dashed ${COLORS.dim}40`,
            position: "relative",
          }}
        >
          {/* Host label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <Desktop size={22} color={COLORS.muted} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.muted,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Host Machine / Server
            </span>
          </div>

          {/* Containers row */}
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
            {containers.map((c, i) => (
              <ContainerBox
                key={i}
                frame={frame}
                fps={fps}
                appearFrame={c.appear}
                label={c.label}
                color={c.color}
                showResources={frame >= OS - 3}
                resourceAppearFrame={CPU_F - 3 + i * 8}
                icon={c.icon}
                index={i}
              />
            ))}
          </div>

          {/* Isolated badge */}
          <div
            style={{
              opacity: fadeIn(frame, ISOLATED - 3),
              transform: `translateY(${slideUp(frame, ISOLATED - 3, 12, 12)}px)`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 10,
              background: `${BRAND.accent}10`,
              border: `1px solid ${BRAND.accent}25`,
              boxShadow: `0 0 ${20 * isolatedGlow}px ${BRAND.accent}20`,
              marginTop: 8,
            }}
          >
            <DiamondsFour size={18} color={BRAND.accent} weight="duotone" />
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: BRAND.accent,
              }}
            >
              Each fully isolated - own OS, CPU, Memory, Network
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =============================================================
  // SCENE 2: Lifecycle + Tasks + Networking
  // =============================================================
  const renderScene2 = () => {
    // Lifecycle actions
    const actions = [
      { label: "ADD", icon: <Plus size={20} color="#22c55e" weight="bold" />, color: "#22c55e", appear: ADDED - 3 },
      { label: "REMOVE", icon: <Minus size={20} color="#ef4444" weight="bold" />, color: "#ef4444", appear: REMOVED - 3 },
      { label: "STOP", icon: <Stop size={20} color="#f59e0b" weight="bold" />, color: "#f59e0b", appear: STOPPED - 3 },
      { label: "START", icon: <Play size={20} color="#3b82f6" weight="bold" />, color: "#3b82f6", appear: STARTED - 3 },
    ];

    // Task containers
    const taskContainers = [
      {
        label: "MySQL",
        sublabel: "Database",
        color: "#06b6d4",
        appear: MYSQL - 3,
        icon: <Database size={28} color="#06b6d4" weight="duotone" />,
      },
      {
        label: "Node.js",
        sublabel: "Application",
        color: "#22c55e",
        appear: NODE_APP - 3,
        icon: <GearSix size={28} color="#22c55e" weight="duotone" />,
      },
    ];

    // Network pulse between containers
    const networkPulseProgress = interpolate(
      frame,
      [NETWORKED, NETWORKED + 40],
      [0, 1],
      clampOpts
    );

    // Scale animation for "scaled"
    const scaleAppear = fadeIn(frame, SCALED - 3);
    const scalePulse = interpolate(
      frame,
      [SCALED, SCALED + 30, SCALED + 60],
      [1, 1.08, 1],
      clampOpts
    );

    return (
      <div
        style={{
          opacity: scene2Opacity,
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          gap: 40,
        }}
      >
        {/* LIFECYCLE ROW */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <span
            style={{
              opacity: fadeIn(frame, ADDED - 15),
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            Container Lifecycle
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {actions.map((a, i) => {
              const op = fadeIn(frame, a.appear);
              const ty = slideUp(frame, a.appear, 12, 18);
              return (
                <div
                  key={i}
                  style={{
                    opacity: op,
                    transform: `translateY(${ty}px)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 20px",
                    borderRadius: 12,
                    background: `${a.color}0a`,
                    border: `1.5px solid ${a.color}20`,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${a.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {a.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      color: a.color,
                      letterSpacing: 1,
                    }}
                  >
                    {a.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TASK CONTAINERS + NETWORKING */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            style={{
              opacity: fadeIn(frame, TASK - 10),
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            One Task Per Container
          </span>
          <div
            style={{
              display: "flex",
              gap: 60,
              alignItems: "center",
              transform: `scale(${scalePulse})`,
            }}
          >
            {taskContainers.map((tc, i) => {
              const op = fadeIn(frame, tc.appear);
              const ty = slideUp(frame, tc.appear, 15, 20);
              return (
                <div
                  key={i}
                  style={{
                    opacity: op,
                    transform: `translateY(${ty}px)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    padding: "22px 28px",
                    borderRadius: 12,
                    background: `${tc.color}0a`,
                    border: `1.5px solid ${tc.color}25`,
                    boxShadow:
                      frame > NETWORKED
                        ? `0 0 ${15 + networkPulseProgress * 10}px ${tc.color}20`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${tc.color}20, ${tc.color}08)`,
                      border: `1.5px solid ${tc.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 15px ${tc.color}15`,
                    }}
                  >
                    {tc.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 15,
                      fontWeight: 700,
                      color: tc.color,
                    }}
                  >
                    {tc.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 11,
                      fontWeight: 500,
                      color: COLORS.dim,
                    }}
                  >
                    {tc.sublabel}
                  </span>
                </div>
              );
            })}

            {/* Network connection indicator between containers */}
            {frame >= NETWORKED - 3 && (
              <div
                style={{
                  position: "absolute",
                  opacity: fadeIn(frame, NETWORKED - 3, 12),
                }}
              >
                {/* Pulse ring showing network connection */}
              </div>
            )}
          </div>

          {/* Networked label */}
          {frame >= NETWORKED - 5 && (
            <div
              style={{
                opacity: fadeIn(frame, NETWORKED - 3),
                transform: `translateY(${slideUp(frame, NETWORKED - 3, 12, 10)}px)`,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 10,
                background: `${BRAND.primary}10`,
                border: `1px solid ${BRAND.primary}20`,
              }}
            >
              <Globe size={16} color={BRAND.primary} weight="duotone" />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: BRAND.primary,
                }}
              >
                Networked Together & Scaled
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =============================================================
  // SCENE 3: Docker Hub + Pull
  // =============================================================
  const renderScene3 = () => {
    // Docker Hub cloud
    const hubAppear = DOCKER_HUB - 5;
    const hubOp = fadeIn(frame, hubAppear, 18);
    const hubSlide = slideUp(frame, hubAppear, 18, 30);

    // Repository items
    const repoItems = [
      { label: "Ruby", color: "#ef4444", appear: RUBY - 3 },
      { label: "Node.js", color: "#22c55e", appear: RUBY + 10 },
      { label: "Python", color: "#f59e0b", appear: RUBY + 20 },
      { label: "Go", color: "#06b6d4", appear: RUBY + 28 },
    ];

    // Pull animation
    const pullProgress = interpolate(
      frame,
      [PULL, PULL + 35],
      [0, 1],
      { ...clampOpts, easing: Easing.out(Easing.cubic) }
    );

    // Pulled container
    const pulledOpacity = fadeIn(frame, PRECONFIG - 5, 15);
    const pulledSlide = interpolate(
      frame,
      [PULL, PULL + 35],
      [-120, 0],
      { ...clampOpts, easing: Easing.out(Easing.cubic) }
    );

    // Environment details
    const envOp = fadeIn(frame, ENVIRONMENT - 3, 12);
    const envSlide = slideUp(frame, ENVIRONMENT - 3, 12, 15);

    // Files & frameworks
    const filesOp = fadeIn(frame, FILES_F - 3, 12);

    return (
      <div
        style={{
          opacity: scene3Opacity,
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          gap: 36,
        }}
      >
        {/* Docker Hub cloud section */}
        <div
          style={{
            opacity: hubOp,
            transform: `translateY(${hubSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Cloud header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${BRAND.primary}25, ${BRAND.secondary}15)`,
                border: `1.5px solid ${BRAND.primary}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 25px ${BRAND.primary}20`,
              }}
            >
              <CloudArrowDown size={30} color={BRAND.primary} weight="duotone" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                Docker Hub
              </span>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: COLORS.dim,
                }}
              >
                Online Cloud Repository
              </span>
            </div>
          </div>

          {/* Repository grid */}
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "20px 28px",
              borderRadius: 12,
              background: "#ffffff04",
              border: `1px dashed ${COLORS.dim}30`,
            }}
          >
            {repoItems.map((r, i) => {
              const rOp = fadeIn(frame, r.appear, 10);
              const rTy = slideUp(frame, r.appear, 10, 14);
              return (
                <div
                  key={i}
                  style={{
                    opacity: rOp,
                    transform: `translateY(${rTy}px)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 20px",
                    borderRadius: 10,
                    background: `${r.color}0a`,
                    border: `1px solid ${r.color}20`,
                  }}
                >
                  <Package size={22} color={r.color} weight="duotone" />
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      color: r.color,
                    }}
                  >
                    {r.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pull arrow / indicator */}
        {frame >= PULL - 3 && (
          <div
            style={{
              opacity: fadeIn(frame, PULL - 3, 10),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 3,
                height: interpolate(frame, [PULL, PULL + 25], [0, 50], {
                  ...clampOpts,
                  easing: Easing.out(Easing.cubic),
                }),
                background: `linear-gradient(${BRAND.primary}60, ${BRAND.primary}10)`,
                borderRadius: 2,
              }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: BRAND.primary,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                opacity: fadeIn(frame, PULL + 5, 10),
              }}
            >
              docker pull
            </span>
          </div>
        )}

        {/* Pulled container - pre-configured environment */}
        <div
          style={{
            opacity: pulledOpacity,
            transform: `translateY(${pulledSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            padding: "24px 36px",
            borderRadius: 12,
            background: `${BRAND.secondary}08`,
            border: `1.5px solid ${BRAND.secondary}25`,
            boxShadow: `0 0 25px ${BRAND.secondary}15`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Cube size={24} color={BRAND.secondary} weight="duotone" />
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: BRAND.secondary,
              }}
            >
              Pre-configured Environment
            </span>
          </div>

          {/* Environment details */}
          <div
            style={{
              opacity: envOp,
              transform: `translateY(${envSlide}px)`,
              display: "flex",
              gap: 14,
            }}
          >
            {[
              { label: "Runtime", value: "Node.js / Ruby", color: "#22c55e" },
              { label: "Dependencies", value: "All included", color: "#f59e0b" },
            ].map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: `${d.color}08`,
                  border: `1px solid ${d.color}15`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    color: COLORS.dim,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {d.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: d.color,
                  }}
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>

          {/* Files & frameworks badge */}
          <div
            style={{
              opacity: filesOp,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 8,
              background: `${BRAND.accent}0a`,
              border: `1px solid ${BRAND.accent}18`,
            }}
          >
            <Package size={14} color={BRAND.accent} weight="duotone" />
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: BRAND.accent,
              }}
            >
              All files & frameworks included - ready to go
            </span>
          </div>
        </div>
      </div>
    );
  };

  // =============================================================
  // RENDER
  // =============================================================
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: COLORS.bg,
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${BRAND.primary}06, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {renderScene1()}
      {renderScene2()}
      {renderScene3()}
    </div>
  );
};

export default Generated_HowContainersWork;
