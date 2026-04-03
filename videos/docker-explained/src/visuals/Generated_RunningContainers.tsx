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

// === TIMESTAMPS (from voiceover-timestamps.json, segment 5) ===
const timestamps = [
  { word: "Now", start: 202.282, end: 203.582 },
  { word: "built", start: 203.814, end: 204.012 },
  { word: "image", start: 204.07, end: 204.302 },
  { word: "run", start: 204.546, end: 204.685 },
  { word: "container", start: 204.79, end: 205.451 },
  { word: "push", start: 206.264, end: 206.508 },
  { word: "cloud", start: 206.879, end: 207.158 },
  { word: "share", start: 207.355, end: 207.599 },
  { word: "pre-made", start: 212.162, end: 212.603 },
  { word: "pull", start: 213.694, end: 213.892 },
  { word: "docker-hub-1", start: 214.472, end: 215.041 },
  { word: "docker-pull-cmd", start: 215.656, end: 216.237 },
  { word: "image-name", start: 216.898, end: 217.514 },
  { word: "tag", start: 219.36, end: 219.638 },
  { word: "version", start: 221.938, end: 222.344 },
  { word: "variant", start: 222.681, end: 223.145 },
  { word: "To-run", start: 223.621, end: 224.875 },
  { word: "docker-run", start: 229.531, end: 230.134 },
  { word: "options", start: 233.257, end: 233.571 },
  { word: "detached", start: 235.475, end: 235.881 },
  { word: "-d", start: 236.415, end: 236.926 },
  { word: "ports", start: 237.75, end: 237.994 },
  { word: "web", start: 238.18, end: 238.354 },
  { word: "view", start: 240.061, end: 240.27 },
  { word: "running-containers", start: 240.722, end: 241.233 },
  { word: "docker-container-ls", start: 241.547, end: 242.371 },
  { word: "ls", start: 242.615, end: 243.3 },
];

const FPS = 30;

const frameFor = (keyword: string): number => {
  const w = timestamps.find((t) =>
    t.word.toLowerCase().includes(keyword.toLowerCase())
  );
  return w ? Math.round(w.start * FPS) : 0;
};

// === KEY FRAMES ===
const F_NOW = frameFor("Now");
const F_BUILT = frameFor("built");
const F_RUN_1 = frameFor("run");
const F_CONTAINER_1 = frameFor("container");
const F_PUSH = frameFor("push");
const F_CLOUD = frameFor("cloud");
const F_PREMADE = frameFor("pre-made");
const F_PULL = frameFor("pull");
const F_DOCKER_HUB = frameFor("docker-hub-1");
const F_DOCKER_PULL = frameFor("docker-pull-cmd");
const F_TAG = frameFor("tag");
const F_VERSION = frameFor("version");
const F_TO_RUN = frameFor("To-run");
const F_DOCKER_RUN = frameFor("docker-run");
const F_OPTIONS = frameFor("options");
const F_DETACHED = frameFor("detached");
const F_D_FLAG = frameFor("-d");
const F_PORTS = frameFor("ports");
const F_VIEW = frameFor("view");
const F_RUNNING_CONTAINERS = frameFor("running-containers");
const F_DOCKER_LS = frameFor("docker-container-ls");

// === COLORS ===
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const BG = "#030305";
const TEXT = "#f8fafc";
const TEXT_DIM = "#94a3b8";
const TEXT_FAINT = "#64748b";
const BORDER = "#1a1a2e";
const GREEN = "#22c55e";

// === HELPERS ===
const fadeIn = (
  frame: number,
  start: number,
  dur: number = 15
): { opacity: number; translateY: number } => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
  translateY: interpolate(frame, [start, start + dur], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  }),
});

const fadeOut = (
  frame: number,
  start: number,
  dur: number = 12
): number =>
  interpolate(frame, [start, start + dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

// === TERMINAL LINE COMPONENT ===
const TerminalLine: React.FC<{
  frame: number;
  appearFrame: number;
  command: string;
  isHighlighted: boolean;
  prefix?: string;
}> = ({ frame, appearFrame, command, isHighlighted, prefix = "$ " }) => {
  const { opacity, translateY } = fadeIn(frame, appearFrame, 10);
  const typingProgress = interpolate(
    frame,
    [appearFrame, appearFrame + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const charsToShow = Math.floor(typingProgress * command.length);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "'SF Mono', monospace",
        fontSize: 16,
        lineHeight: "28px",
        color: isHighlighted ? GREEN : TEXT_DIM,
        display: "flex",
        gap: 0,
        textShadow: isHighlighted ? `0 0 12px ${GREEN}40` : "none",
      }}
    >
      <span style={{ color: GREEN, opacity: 0.7 }}>{prefix}</span>
      <span>{command.substring(0, charsToShow)}</span>
      {charsToShow < command.length && (
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 18,
            background: TEXT,
            marginLeft: 1,
            opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
          }}
        />
      )}
    </div>
  );
};

// === ICON BOX COMPONENT ===
const IconBox: React.FC<{
  frame: number;
  appearFrame: number;
  iconName: string;
  label: string;
  color: string;
  size?: number;
  glowing?: boolean;
}> = ({ frame, appearFrame, iconName, label, color, size = 56, glowing = false }) => {
  const { opacity, translateY } = fadeIn(frame, appearFrame);
  const scaleVal = spring({
    frame: Math.max(0, frame - appearFrame),
    fps: FPS,
    config: { damping: 20, stiffness: 200 },
  });
  const Icon = getIcon(iconName);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scaleVal})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1.5px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: glowing
            ? `0 0 25px ${color}40, 0 0 50px ${color}15`
            : `0 0 15px ${color}15`,
        }}
      >
        <Icon
          size={size * 0.5}
          color={color}
          weight="duotone"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </div>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: TEXT_DIM,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// === FLOW ARROW ===
const FlowArrow: React.FC<{
  frame: number;
  appearFrame: number;
  direction?: "right" | "down";
  color?: string;
}> = ({ frame, appearFrame, direction = "right", color = TEXT_FAINT }) => {
  const { opacity } = fadeIn(frame, appearFrame, 10);
  const isRight = direction === "right";
  const ArrowIcon = getIcon("ArrowRight");
  const ArrowDownIcon = getIcon("ArrowDown");

  return (
    <div style={{ opacity, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {isRight ? (
        <ArrowIcon size={24} color={color} weight="bold" />
      ) : (
        <ArrowDownIcon size={24} color={color} weight="bold" />
      )}
    </div>
  );
};

// === CONTAINER ROW (for docker container ls) ===
const ContainerRow: React.FC<{
  frame: number;
  appearFrame: number;
  name: string;
  image: string;
  status: string;
  ports: string;
  color: string;
}> = ({ frame, appearFrame, name, image, status, ports, color }) => {
  const { opacity, translateY } = fadeIn(frame, appearFrame, 12);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "grid",
        gridTemplateColumns: "140px 140px 100px 120px",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 8,
        background: `${color}06`,
        border: `1px solid ${color}12`,
        fontFamily: "'SF Mono', monospace",
        fontSize: 13,
      }}
    >
      <span style={{ color }}>{name}</span>
      <span style={{ color: TEXT_DIM }}>{image}</span>
      <span style={{ color: GREEN }}>{status}</span>
      <span style={{ color: TEXT_FAINT }}>{ports}</span>
    </div>
  );
};

// === MAIN COMPONENT ===
const Generated_RunningContainers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ---- SCENE TRANSITIONS ----
  // Scene 1: Image -> Run or Push (F_NOW to F_PREMADE)
  // Scene 2: Docker Hub + Pull (F_PREMADE to F_TO_RUN)
  // Scene 3: Docker Run + Options (F_TO_RUN to F_VIEW)
  // Scene 4: Docker container ls (F_VIEW to end)

  const scene1Opacity = interpolate(
    frame,
    [F_NOW - 5, F_NOW, F_PREMADE - 15, F_PREMADE],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scene2Opacity = interpolate(
    frame,
    [F_PREMADE - 5, F_PREMADE + 5, F_TO_RUN - 15, F_TO_RUN],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scene3Opacity = interpolate(
    frame,
    [F_TO_RUN - 5, F_TO_RUN + 5, F_VIEW - 15, F_VIEW],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scene4Opacity = interpolate(
    frame,
    [F_VIEW - 5, F_VIEW + 5, F_DOCKER_LS + 60, F_DOCKER_LS + 61],
    [0, 1, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ===== LEFT PANEL — Terminal ===== */}
      <div
        style={{
          width: "40%",
          height: "100%",
          padding: "60px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          borderRight: `1px solid ${BORDER}`,
          background: "#06060a",
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: ACCENT }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: GREEN }} />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              color: TEXT_FAINT,
              letterSpacing: 0.5,
            }}
          >
            terminal
          </span>
        </div>

        {/* Terminal content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {/* Scene 1 commands */}
          <div style={{ opacity: scene1Opacity }}>
            <TerminalLine
              frame={frame}
              appearFrame={F_RUN_1 - 3}
              command="docker run my-app"
              isHighlighted={frame >= F_RUN_1 - 3 && frame < F_PUSH - 3}
            />
            <TerminalLine
              frame={frame}
              appearFrame={F_PUSH - 3}
              command="docker push my-app:latest"
              isHighlighted={frame >= F_PUSH - 3 && frame < F_PREMADE}
            />
          </div>

          {/* Scene 2 commands */}
          <div style={{ opacity: scene2Opacity }}>
            <TerminalLine
              frame={frame}
              appearFrame={F_DOCKER_PULL - 3}
              command="docker pull nginx:latest"
              isHighlighted={frame >= F_DOCKER_PULL - 3 && frame < F_TAG - 3}
            />
            <TerminalLine
              frame={frame}
              appearFrame={F_TAG - 3}
              command="docker pull node:18-alpine"
              isHighlighted={frame >= F_TAG - 3 && frame < F_TO_RUN}
            />
          </div>

          {/* Scene 3 commands */}
          <div style={{ opacity: scene3Opacity }}>
            <TerminalLine
              frame={frame}
              appearFrame={F_DOCKER_RUN - 3}
              command="docker run nginx"
              isHighlighted={frame >= F_DOCKER_RUN - 3 && frame < F_DETACHED - 3}
            />
            <TerminalLine
              frame={frame}
              appearFrame={F_DETACHED - 3}
              command="docker run -d nginx"
              isHighlighted={frame >= F_DETACHED - 3 && frame < F_PORTS - 3}
            />
            <TerminalLine
              frame={frame}
              appearFrame={F_PORTS - 3}
              command="docker run -d -p 8080:80 nginx"
              isHighlighted={frame >= F_PORTS - 3 && frame < F_VIEW}
            />
          </div>

          {/* Scene 4 commands */}
          <div style={{ opacity: scene4Opacity }}>
            <TerminalLine
              frame={frame}
              appearFrame={F_DOCKER_LS - 3}
              command="docker container ls"
              isHighlighted={frame >= F_DOCKER_LS - 3}
            />
            {/* Output header */}
            {frame >= F_DOCKER_LS + 15 && (
              <div
                style={{
                  opacity: fadeIn(frame, F_DOCKER_LS + 15, 8).opacity,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  color: TEXT_FAINT,
                  marginTop: 8,
                  display: "grid",
                  gridTemplateColumns: "100px 80px 60px 100px",
                  gap: 6,
                  padding: "4px 0",
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <span>CONTAINER ID</span>
                <span>IMAGE</span>
                <span>STATUS</span>
                <span>PORTS</span>
              </div>
            )}
            {frame >= F_DOCKER_LS + 22 && (
              <div
                style={{
                  opacity: fadeIn(frame, F_DOCKER_LS + 22, 8).opacity,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  color: TEXT_DIM,
                  display: "grid",
                  gridTemplateColumns: "100px 80px 60px 100px",
                  gap: 6,
                  padding: "4px 0",
                }}
              >
                <span style={{ color: SECONDARY }}>a3f2b1c9</span>
                <span>nginx</span>
                <span style={{ color: GREEN }}>Up 2m</span>
                <span>8080:80</span>
              </div>
            )}
            {frame >= F_DOCKER_LS + 30 && (
              <div
                style={{
                  opacity: fadeIn(frame, F_DOCKER_LS + 30, 8).opacity,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 12,
                  color: TEXT_DIM,
                  display: "grid",
                  gridTemplateColumns: "100px 80px 60px 100px",
                  gap: 6,
                  padding: "4px 0",
                }}
              >
                <span style={{ color: SECONDARY }}>7e4d8f21</span>
                <span>redis</span>
                <span style={{ color: GREEN }}>Up 5m</span>
                <span>6379</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Visual ===== */}
      <div
        style={{
          width: "60%",
          height: "100%",
          padding: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* ===== SCENE 1: Image -> Run Container / Push to Cloud ===== */}
        {scene1Opacity > 0 && (
          <div
            style={{
              opacity: scene1Opacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 48,
              position: "absolute",
              top: "50%",
              left: "70%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Title */}
            <div
              style={{
                opacity: fadeIn(frame, F_NOW, 15).opacity,
                transform: `translateY(${fadeIn(frame, F_NOW, 15).translateY}px)`,
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 26,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: -0.5,
              }}
            >
              Your Built Image
            </div>

            {/* Central image icon */}
            <IconBox
              frame={frame}
              appearFrame={F_BUILT - 3}
              iconName="Package"
              label="Docker Image"
              color={PRIMARY}
              size={72}
              glowing
            />

            {/* Two paths */}
            <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
              {/* Path 1: Run */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <FlowArrow frame={frame} appearFrame={F_RUN_1 - 3} direction="down" color={GREEN} />
                <IconBox
                  frame={frame}
                  appearFrame={F_RUN_1 - 3}
                  iconName="Play"
                  label="Run Container"
                  color={GREEN}
                  size={56}
                />
              </div>

              {/* Path 2: Push */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <FlowArrow frame={frame} appearFrame={F_PUSH - 3} direction="down" color={SECONDARY} />
                <IconBox
                  frame={frame}
                  appearFrame={F_PUSH - 3}
                  iconName="CloudArrowUp"
                  label="Push to Cloud"
                  color={SECONDARY}
                  size={56}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== SCENE 2: Docker Hub + Pull ===== */}
        {scene2Opacity > 0 && (
          <div
            style={{
              opacity: scene2Opacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 40,
              position: "absolute",
              top: "50%",
              left: "70%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Docker Hub */}
            <IconBox
              frame={frame}
              appearFrame={F_DOCKER_HUB - 3}
              iconName="Cloud"
              label="Docker Hub"
              color={PRIMARY}
              size={72}
              glowing
            />

            <FlowArrow frame={frame} appearFrame={F_DOCKER_PULL - 3} direction="down" color={SECONDARY} />

            {/* Pull command representation */}
            <div
              style={{
                opacity: fadeIn(frame, F_DOCKER_PULL - 3, 15).opacity,
                transform: `translateY(${fadeIn(frame, F_DOCKER_PULL - 3, 15).translateY}px)`,
                padding: "16px 28px",
                borderRadius: 12,
                background: `${SECONDARY}10`,
                border: `1px solid ${SECONDARY}25`,
                fontFamily: "'SF Mono', monospace",
                fontSize: 18,
                fontWeight: 600,
                color: SECONDARY,
                boxShadow: `0 0 20px ${SECONDARY}15`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {(() => {
                const DownloadIcon = getIcon("DownloadSimple");
                return <DownloadIcon size={22} color={SECONDARY} weight="duotone" />;
              })()}
              docker pull
            </div>

            <FlowArrow frame={frame} appearFrame={F_DOCKER_PULL + 10} direction="down" color={TEXT_FAINT} />

            {/* Local image */}
            <IconBox
              frame={frame}
              appearFrame={F_DOCKER_PULL + 10}
              iconName="Package"
              label="Local Image"
              color={GREEN}
              size={56}
            />

            {/* Tag info */}
            {frame >= F_TAG - 3 && (
              <div
                style={{
                  opacity: fadeIn(frame, F_TAG - 3, 15).opacity,
                  transform: `translateY(${fadeIn(frame, F_TAG - 3, 15).translateY}px)`,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: `${ACCENT}12`,
                    border: `1px solid ${ACCENT}20`,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 14,
                    color: ACCENT,
                  }}
                >
                  :latest
                </div>
                <div
                  style={{
                    opacity: fadeIn(frame, F_VERSION - 3, 12).opacity,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: `${ACCENT}12`,
                    border: `1px solid ${ACCENT}20`,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 14,
                    color: ACCENT,
                  }}
                >
                  :18-alpine
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SCENE 3: Docker Run + Options ===== */}
        {scene3Opacity > 0 && (
          <div
            style={{
              opacity: scene3Opacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 32,
              position: "absolute",
              top: "50%",
              left: "70%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Title */}
            <div
              style={{
                opacity: fadeIn(frame, F_TO_RUN, 15).opacity,
                transform: `translateY(${fadeIn(frame, F_TO_RUN, 15).translateY}px)`,
                fontSize: 24,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: -0.5,
              }}
            >
              Running a Container
            </div>

            {/* docker run command box */}
            <div
              style={{
                opacity: fadeIn(frame, F_DOCKER_RUN - 3, 15).opacity,
                transform: `translateY(${fadeIn(frame, F_DOCKER_RUN - 3, 15).translateY}px)`,
                padding: "18px 32px",
                borderRadius: 12,
                background: `${GREEN}10`,
                border: `1.5px solid ${GREEN}30`,
                fontFamily: "'SF Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: GREEN,
                boxShadow: `0 0 25px ${GREEN}20`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {(() => {
                const PlayIcon = getIcon("Play");
                return <PlayIcon size={24} color={GREEN} weight="duotone" />;
              })()}
              docker run
            </div>

            {/* Options */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {/* -d flag */}
              <div
                style={{
                  opacity: fadeIn(frame, F_DETACHED - 3, 15).opacity,
                  transform: `translateY(${fadeIn(frame, F_DETACHED - 3, 15).translateY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 20px",
                  borderRadius: 10,
                  background: `${SECONDARY}08`,
                  border: `1px solid ${SECONDARY}15`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    color: SECONDARY,
                  }}
                >
                  -d
                </div>
                <span style={{ fontSize: 12, color: TEXT_FAINT }}>Detached Mode</span>
              </div>

              {/* -p flag */}
              <div
                style={{
                  opacity: fadeIn(frame, F_PORTS - 3, 15).opacity,
                  transform: `translateY(${fadeIn(frame, F_PORTS - 3, 15).translateY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 20px",
                  borderRadius: 10,
                  background: `${ACCENT}08`,
                  border: `1px solid ${ACCENT}15`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    color: ACCENT,
                  }}
                >
                  -p 8080:80
                </div>
                <span style={{ fontSize: 12, color: TEXT_FAINT }}>Port Mapping</span>
              </div>
            </div>

            {/* Visual: Container running indicator */}
            {frame >= F_DOCKER_RUN + 10 && (
              <div
                style={{
                  opacity: fadeIn(frame, F_DOCKER_RUN + 10, 15).opacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 24px",
                  borderRadius: 10,
                  background: `${GREEN}08`,
                  border: `1px solid ${GREEN}15`,
                }}
              >
                {/* Pulsing dot */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: GREEN,
                    boxShadow: `0 0 ${8 + Math.sin(frame * 0.15) * 4}px ${GREEN}60`,
                  }}
                />
                <span style={{ fontSize: 14, color: GREEN, fontWeight: 600 }}>
                  Container Running
                </span>
              </div>
            )}
          </div>
        )}

        {/* ===== SCENE 4: Docker Container LS ===== */}
        {scene4Opacity > 0 && (
          <div
            style={{
              opacity: scene4Opacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              position: "absolute",
              top: "50%",
              left: "70%",
              transform: "translate(-50%, -50%)",
              width: 600,
            }}
          >
            {/* Title */}
            <div
              style={{
                opacity: fadeIn(frame, F_VIEW, 15).opacity,
                transform: `translateY(${fadeIn(frame, F_VIEW, 15).translateY}px)`,
                fontSize: 24,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: -0.5,
              }}
            >
              View Running Containers
            </div>

            {/* Container list visual */}
            <div
              style={{
                opacity: fadeIn(frame, F_RUNNING_CONTAINERS - 3, 15).opacity,
                width: "100%",
                padding: 20,
                borderRadius: 12,
                background: "#0a0a12",
                border: `1px solid ${BORDER}`,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 140px 100px 120px",
                  gap: 8,
                  padding: "6px 12px 12px",
                  borderBottom: `1px solid ${BORDER}`,
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: TEXT_FAINT,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                <span>NAME</span>
                <span>IMAGE</span>
                <span>STATUS</span>
                <span>PORTS</span>
              </div>

              {/* Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                <ContainerRow
                  frame={frame}
                  appearFrame={F_DOCKER_LS + 8}
                  name="web-server"
                  image="nginx:latest"
                  status="Up 2m"
                  ports="8080:80"
                  color={PRIMARY}
                />
                <ContainerRow
                  frame={frame}
                  appearFrame={F_DOCKER_LS + 16}
                  name="cache"
                  image="redis:7"
                  status="Up 5m"
                  ports="6379"
                  color={SECONDARY}
                />
                <ContainerRow
                  frame={frame}
                  appearFrame={F_DOCKER_LS + 24}
                  name="api"
                  image="node:18"
                  status="Up 1m"
                  ports="3000"
                  color={GREEN}
                />
              </div>
            </div>

            {/* Running count badge */}
            {frame >= F_DOCKER_LS + 30 && (
              <div
                style={{
                  opacity: fadeIn(frame, F_DOCKER_LS + 30, 12).opacity,
                  transform: `translateY(${fadeIn(frame, F_DOCKER_LS + 30, 12).translateY}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  borderRadius: 10,
                  background: `${GREEN}10`,
                  border: `1px solid ${GREEN}20`,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: GREEN,
                    boxShadow: `0 0 ${6 + Math.sin(frame * 0.15) * 3}px ${GREEN}60`,
                  }}
                />
                <span style={{ fontSize: 14, color: GREEN, fontWeight: 600 }}>
                  3 containers running
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Generated_RunningContainers;
