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

const colors = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
};

// ─── Helper: fade+slide entrance ───
const entrance = (
  frame: number,
  startFrame: number,
  dur = 15,
  slideY = 20
) => {
  const opacity = interpolate(frame, [startFrame, startFrame + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + dur],
    [slideY, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  return { opacity, translateY };
};

// ─── Helper: scene transition ───
const sceneOpacity = (
  frame: number,
  sceneStart: number,
  sceneEnd: number,
  fadeIn = 15,
  fadeOut = 15
) => {
  const inOp = interpolate(
    frame,
    [sceneStart, sceneStart + fadeIn],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const outOp = interpolate(
    frame,
    [sceneEnd - fadeOut, sceneEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return Math.min(inOp, outOp);
};

// ─── Timestamps (seconds) ───
const timestamps = [
  { word: "Once", start: 185.0 },
  { word: "Dockerfile's", start: 185.469 },
  { word: "build", start: 187.257 },
  { word: "docker_build", start: 187.432 },
  { word: "-t", start: 189.569 },
  { word: "flag", start: 189.802 },
  { word: "name", start: 190.546 },
  { word: "image_name", start: 190.965 },
  { word: "docker_images", start: 194.256 },
  { word: "images.", start: 194.488 },
  { word: "run_container", start: 196.286 },
  { word: "container", start: 196.576 },
  { word: "push", start: 197.842 },
  { word: "cloud", start: 198.237 },
  { word: "share", start: 198.656 },
  { word: "pull", start: 202.387 },
  { word: "DockerHub", start: 203.107 },
  { word: "Hub", start: 203.363 },
  { word: "docker_pull", start: 203.584 },
  { word: "tag", start: 206.429 },
  { word: "version", start: 207.684 },
  { word: "docker_run", start: 214.853 },
  { word: "run_cmd", start: 215.155 },
  { word: "detached", start: 218.489 },
  { word: "-d,", start: 218.884 },
  { word: "ports", start: 219.767 },
  { word: "docker_ls", start: 222.499 },
  { word: "container_ls", start: 222.836 },
];

const Generated_DockerCommands: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const f = frame; // global frame (no offset needed)

  const ANTICIPATION = 4;

  // Key frames (absolute)
  const fDockerBuild = Math.round(187.432 * fps) - ANTICIPATION; // ~5618
  const fTFlag = Math.round(189.569 * fps) - ANTICIPATION; // ~5683
  const fDockerImages = Math.round(194.256 * fps) - ANTICIPATION; // ~5823
  const fRunContainer = Math.round(196.286 * fps) - ANTICIPATION; // ~5884
  const fPush = Math.round(197.842 * fps) - ANTICIPATION; // ~5931
  const fCloud = Math.round(198.237 * fps) - ANTICIPATION; // ~5943
  const fPull = Math.round(202.387 * fps) - ANTICIPATION; // ~6067
  const fDockerHub = Math.round(203.363 * fps) - ANTICIPATION; // ~6096
  const fDockerPull = Math.round(203.584 * fps) - ANTICIPATION; // ~6103
  const fTag = Math.round(206.429 * fps) - ANTICIPATION; // ~6188
  const fVersion = Math.round(207.684 * fps) - ANTICIPATION; // ~6226
  const fDockerRun = Math.round(214.853 * fps) - ANTICIPATION; // ~6441
  const fDetached = Math.round(218.489 * fps) - ANTICIPATION; // ~6550
  const fDFlag = Math.round(218.884 * fps) - ANTICIPATION; // ~6562
  const fPorts = Math.round(219.767 * fps) - ANTICIPATION; // ~6589
  const fDockerLs = Math.round(222.499 * fps) - ANTICIPATION; // ~6670

  // ════════════════════════════════════════
  // SCENES — we split the long segment into 3 scenes
  // Scene 1: Build + Images (frames 5550 – 5870)
  // Scene 2: Push/Pull + Hub (frames 5870 – 6420)
  // Scene 3: Docker Run + Options + ls (frames 6420 – 7266)
  // ════════════════════════════════════════

  const s1Opacity = sceneOpacity(f, 5545, 5880, 12, 15);
  const s2Opacity = sceneOpacity(f, 5870, 6430, 15, 15);
  const s3Opacity = sceneOpacity(f, 6420, 7270, 15, 10);

  // ─── TERMINAL: Typing effect helper ───
  const typingEffect = (
    text: string,
    startF: number,
    typeDuration = 30
  ) => {
    const chars = Math.min(
      text.length,
      Math.floor(
        interpolate(f, [startF, startF + typeDuration], [0, text.length], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      )
    );
    return text.slice(0, chars);
  };

  // Cursor blink
  const cursorVisible = frame % 20 < 12;

  // Terminal commands
  const cmd1 = "$ docker build -t myapp .";
  const cmd2 = "$ docker images";
  const cmd3 = "$ docker pull node:18";
  const cmd4 = "$ docker run -d -p 3000:3000 myapp";
  const cmd5 = "$ docker container ls";

  // Icons
  const TerminalIcon = getIcon("Terminal");
  const FileIcon = getIcon("FileText");
  const PackageIcon = getIcon("Package");
  const PlayIcon = getIcon("Play");
  const ArrowRightIcon = getIcon("ArrowRight");
  const CloudArrowUpIcon = getIcon("CloudArrowUp");
  const CloudArrowDownIcon = getIcon("CloudArrowDown");
  const CloudIcon = getIcon("Cloud");
  const TagIcon = getIcon("Tag");
  const ListIcon = getIcon("List");
  const GearIcon = getIcon("Gear");
  const PlugIcon = getIcon("Plug");

  // ─── Terminal Line Component ───
  const TerminalLine = ({
    text,
    startF,
    color: lineColor,
    typeDuration = 25,
    showCursor = false,
  }: {
    text: string;
    startF: number;
    color: string;
    typeDuration?: number;
    showCursor?: boolean;
  }) => {
    const lineEnt = entrance(f, startF, 10, 12);
    const typed = typingEffect(text, startF + 10, typeDuration);
    const isTyping = f >= startF + 10 && typed.length < text.length;
    return (
      <div
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 15,
          color: lineColor,
          fontWeight: 600,
          opacity: lineEnt.opacity,
          transform: `translateY(${lineEnt.translateY}px)`,
          whiteSpace: "nowrap",
          minHeight: 24,
        }}
      >
        {typed}
        {(isTyping || (showCursor && typed.length === text.length)) &&
          cursorVisible && (
            <span style={{ color: "#e2e8f0", opacity: 0.8 }}>|</span>
          )}
      </div>
    );
  };

  // ─── Right-side workflow box ───
  const WorkflowBox = ({
    icon: Icon,
    label,
    sublabel,
    color: boxColor,
    ent,
    scale = 1,
    glowPulse = 0,
  }: {
    icon: React.FC<any>;
    label: string;
    sublabel?: string;
    color: string;
    ent: { opacity: number; translateY: number };
    scale?: number;
    glowPulse?: number;
  }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: ent.opacity,
        transform: `translateY(${ent.translateY}px) scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${boxColor}18, ${boxColor}06)`,
          border: `1.5px solid ${boxColor}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 ${20 + glowPulse * 12}px ${boxColor}${Math.round(12 + glowPulse * 20).toString(16).padStart(2, "0")}`,
        }}
      >
        <Icon
          size={36}
          color={boxColor}
          weight="duotone"
          style={{ filter: `drop-shadow(0 0 8px ${boxColor}60)` }}
        />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
        {label}
      </span>
      {sublabel && (
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
          {sublabel}
        </span>
      )}
    </div>
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ═══ SCENE 1: BUILD + IMAGES ═══ */}
      {s1Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            opacity: s1Opacity,
            display: "flex",
            gap: 48,
          }}
        >
          {/* Left: Terminal */}
          <div
            style={{
              flex: "0 0 40%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Terminal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: entrance(f, 5550, 12).opacity,
                transform: `translateY(${entrance(f, 5550, 12).translateY}px)`,
              }}
            >
              <TerminalIcon size={20} color={colors.green} weight="duotone" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#64748b",
                }}
              >
                Terminal
              </span>
            </div>

            {/* Terminal body */}
            <div
              style={{
                flex: 1,
                background: "#12121f",
                border: "1px solid #1a1a2e",
                borderRadius: 12,
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                justifyContent: "center",
              }}
            >
              <TerminalLine
                text={cmd1}
                startF={fDockerBuild}
                color={colors.green}
                showCursor
              />

              {/* Flag explanation */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  paddingLeft: 16,
                  opacity: entrance(f, fTFlag, 12).opacity,
                  transform: `translateY(${entrance(f, fTFlag, 12).translateY}px)`,
                }}
              >
                <div
                  style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: `${colors.amber}10`,
                    border: `1px solid ${colors.amber}20`,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: colors.amber,
                    fontWeight: 700,
                  }}
                >
                  -t
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Name your image
                </span>
              </div>

              <TerminalLine
                text={cmd2}
                startF={fDockerImages}
                color={colors.cyan}
              />

              {/* Fake output for docker images */}
              <div
                style={{
                  paddingLeft: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  opacity: interpolate(
                    f,
                    [fDockerImages + 30, fDockerImages + 42],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  ),
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  REPOSITORY   TAG      SIZE
                </span>
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                  myapp        latest   142MB
                </span>
              </div>
            </div>
          </div>

          {/* Right: Build workflow visual */}
          <div
            style={{
              flex: "0 0 56%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: entrance(f, fDockerBuild, 15).opacity,
              }}
            >
              <GearIcon size={20} color="#64748b" weight="duotone" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#64748b",
                }}
              >
                Build Phase
              </span>
            </div>

            {/* Dockerfile → Image flow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
              }}
            >
              <WorkflowBox
                icon={FileIcon}
                label="Dockerfile"
                sublabel="Source"
                color={colors.blue}
                ent={entrance(f, fDockerBuild, 18)}
              />

              {/* Build arrow with animation */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  opacity: entrance(f, fDockerBuild + 15, 12).opacity,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 11,
                    color: colors.blue,
                    fontWeight: 700,
                  }}
                >
                  build
                </span>
                <ArrowRightIcon size={24} color={colors.blue} weight="bold" />
              </div>

              <WorkflowBox
                icon={PackageIcon}
                label="Docker Image"
                sublabel="myapp:latest"
                color={colors.purple}
                ent={entrance(f, fDockerBuild + 25, 18)}
                scale={spring({
                  frame: Math.max(0, f - (fDockerBuild + 25)),
                  fps,
                  config: { damping: 22, stiffness: 180 },
                })}
              />
            </div>

            {/* Verify card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 20px",
                borderRadius: 12,
                background: `${colors.cyan}08`,
                border: `1px solid ${colors.cyan}15`,
                alignSelf: "center",
                opacity: entrance(f, fDockerImages, 15).opacity,
                transform: `translateY(${entrance(f, fDockerImages, 15).translateY}px)`,
              }}
            >
              <ListIcon size={20} color={colors.cyan} weight="duotone" />
              <span style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>
                Verify with
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 13,
                  color: colors.cyan,
                  fontWeight: 700,
                }}
              >
                docker images
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 2: PUSH / PULL / HUB ═══ */}
      {s2Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            opacity: s2Opacity,
            display: "flex",
            gap: 48,
          }}
        >
          {/* Left: Terminal */}
          <div
            style={{
              flex: "0 0 40%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: entrance(f, fRunContainer, 12).opacity,
              }}
            >
              <TerminalIcon size={20} color={colors.green} weight="duotone" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#64748b",
                }}
              >
                Terminal
              </span>
            </div>

            <div
              style={{
                flex: 1,
                background: "#12121f",
                border: "1px solid #1a1a2e",
                borderRadius: 12,
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                justifyContent: "center",
              }}
            >
              {/* docker pull */}
              <TerminalLine
                text={cmd3}
                startF={fDockerPull}
                color={colors.cyan}
                showCursor
              />

              {/* Tag explanation */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  paddingLeft: 16,
                  alignItems: "center",
                  opacity: entrance(f, fTag, 12).opacity,
                  transform: `translateY(${entrance(f, fTag, 12).translateY}px)`,
                }}
              >
                <TagIcon size={16} color={colors.amber} weight="duotone" />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Tag specifies
                </span>
                <div
                  style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: `${colors.amber}10`,
                    border: `1px solid ${colors.amber}20`,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: colors.amber,
                    fontWeight: 700,
                    opacity: entrance(f, fVersion, 12).opacity,
                  }}
                >
                  version / variant
                </div>
              </div>
            </div>
          </div>

          {/* Right: Push/Pull workflow */}
          <div
            style={{
              flex: "0 0 56%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 40,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: entrance(f, fRunContainer, 15).opacity,
              }}
            >
              <CloudIcon size={20} color="#64748b" weight="duotone" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#64748b",
                }}
              >
                Share & Distribute
              </span>
            </div>

            {/* Central layout: Image ↔ Cloud ↔ Container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 32,
              }}
            >
              {/* Docker Hub (cloud) */}
              <div
                style={{
                  opacity: entrance(f, fDockerHub, 18).opacity,
                  transform: `translateY(${entrance(f, fDockerHub, 18).translateY}px)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: 20,
                      background: `linear-gradient(135deg, ${colors.cyan}18, ${colors.cyan}06)`,
                      border: `1.5px solid ${colors.cyan}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 30px ${colors.cyan}12`,
                    }}
                  >
                    <CloudIcon
                      size={44}
                      color={colors.cyan}
                      weight="duotone"
                      style={{ filter: `drop-shadow(0 0 10px ${colors.cyan}60)` }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#e2e8f0",
                    }}
                  >
                    Docker Hub
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Registry
                  </span>
                </div>
              </div>

              {/* Push / Pull arrows + labels */}
              <div
                style={{
                  display: "flex",
                  gap: 80,
                  alignItems: "center",
                }}
              >
                {/* Push */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    opacity: entrance(f, fPush, 15).opacity,
                    transform: `translateY(${entrance(f, fPush, 15).translateY}px)`,
                  }}
                >
                  <CloudArrowUpIcon
                    size={32}
                    color={colors.orange}
                    weight="duotone"
                    style={{ filter: `drop-shadow(0 0 8px ${colors.orange}60)` }}
                  />
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      color: colors.orange,
                      fontWeight: 700,
                    }}
                  >
                    docker push
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Share with others
                  </span>
                </div>

                {/* Pull */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    opacity: entrance(f, fPull, 15).opacity,
                    transform: `translateY(${entrance(f, fPull, 15).translateY}px)`,
                  }}
                >
                  <CloudArrowDownIcon
                    size={32}
                    color={colors.green}
                    weight="duotone"
                    style={{ filter: `drop-shadow(0 0 8px ${colors.green}60)` }}
                  />
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      color: colors.green,
                      fontWeight: 700,
                    }}
                  >
                    docker pull
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Download pre-made
                  </span>
                </div>
              </div>

              {/* Image box at bottom */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                }}
              >
                <WorkflowBox
                  icon={PackageIcon}
                  label="Local Image"
                  color={colors.purple}
                  ent={entrance(f, fRunContainer, 18)}
                />

                {/* Arrow to container */}
                <div
                  style={{
                    opacity: entrance(f, fRunContainer + 10, 12).opacity,
                  }}
                >
                  <ArrowRightIcon size={24} color={colors.green} weight="bold" />
                </div>

                <WorkflowBox
                  icon={PlayIcon}
                  label="Container"
                  sublabel="Running"
                  color={colors.green}
                  ent={entrance(f, fRunContainer + 15, 18)}
                  scale={spring({
                    frame: Math.max(0, f - (fRunContainer + 15)),
                    fps,
                    config: { damping: 22, stiffness: 180 },
                  })}
                  glowPulse={
                    f > fRunContainer + 30
                      ? 0.5 + Math.sin((f - fRunContainer) * 0.1) * 0.5
                      : 0
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 3: DOCKER RUN + OPTIONS + LS ═══ */}
      {s3Opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            opacity: s3Opacity,
            display: "flex",
            gap: 48,
          }}
        >
          {/* Left: Terminal */}
          <div
            style={{
              flex: "0 0 40%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: entrance(f, fDockerRun, 12).opacity,
              }}
            >
              <TerminalIcon size={20} color={colors.green} weight="duotone" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#64748b",
                }}
              >
                Terminal
              </span>
            </div>

            <div
              style={{
                flex: 1,
                background: "#12121f",
                border: "1px solid #1a1a2e",
                borderRadius: 12,
                padding: "28px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                justifyContent: "center",
              }}
            >
              {/* docker run */}
              <TerminalLine
                text={cmd4}
                startF={fDockerRun}
                color={colors.green}
                typeDuration={35}
                showCursor
              />

              {/* Flags explanation */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  paddingLeft: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: `${colors.amber}10`,
                    border: `1px solid ${colors.amber}20`,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: colors.amber,
                    fontWeight: 700,
                    opacity: entrance(f, fDFlag, 12).opacity,
                    transform: `translateY(${entrance(f, fDFlag, 12).translateY}px)`,
                  }}
                >
                  -d detached mode
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: 6,
                    background: `${colors.cyan}10`,
                    border: `1px solid ${colors.cyan}20`,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: colors.cyan,
                    fontWeight: 700,
                    opacity: entrance(f, fPorts, 12).opacity,
                    transform: `translateY(${entrance(f, fPorts, 12).translateY}px)`,
                  }}
                >
                  -p port mapping
                </div>
              </div>

              {/* Spacer */}
              <div style={{ height: 8 }} />

              {/* docker container ls */}
              <TerminalLine
                text={cmd5}
                startF={fDockerLs}
                color={colors.cyan}
              />

              {/* Fake output for container ls */}
              <div
                style={{
                  paddingLeft: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  opacity: interpolate(
                    f,
                    [fDockerLs + 30, fDockerLs + 42],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  ),
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 11,
                    color: "#64748b",
                  }}
                >
                  CONTAINER ID   IMAGE    STATUS         PORTS
                </span>
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 11,
                    color: "#94a3b8",
                  }}
                >
                  a1b2c3d4e5   myapp    Up 2 minutes   0.0.0.0:3000→3000
                </span>
              </div>
            </div>
          </div>

          {/* Right: Run workflow */}
          <div
            style={{
              flex: "0 0 56%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: entrance(f, fDockerRun, 15).opacity,
              }}
            >
              <PlayIcon size={20} color="#64748b" weight="duotone" />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: "#64748b",
                }}
              >
                Run Phase
              </span>
            </div>

            {/* Image → Container flow */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 28,
              }}
            >
              <WorkflowBox
                icon={PackageIcon}
                label="Image"
                sublabel="myapp"
                color={colors.purple}
                ent={entrance(f, fDockerRun, 18)}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  opacity: entrance(f, fDockerRun + 12, 12).opacity,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 11,
                    color: colors.green,
                    fontWeight: 700,
                  }}
                >
                  run
                </span>
                <ArrowRightIcon size={24} color={colors.green} weight="bold" />
              </div>

              <WorkflowBox
                icon={PlayIcon}
                label="Container"
                sublabel="Running"
                color={colors.green}
                ent={entrance(f, fDockerRun + 20, 18)}
                scale={spring({
                  frame: Math.max(0, f - (fDockerRun + 20)),
                  fps,
                  config: { damping: 22, stiffness: 180 },
                })}
                glowPulse={
                  f > fDockerRun + 40
                    ? 0.5 + Math.sin((f - fDockerRun) * 0.1) * 0.5
                    : 0
                }
              />
            </div>

            {/* Options cards */}
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* Detached mode */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: `${colors.amber}08`,
                  border: `1px solid ${colors.amber}15`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: entrance(f, fDetached, 15).opacity,
                  transform: `translateY(${entrance(f, fDetached, 15).translateY}px)`,
                }}
              >
                <GearIcon
                  size={20}
                  color={colors.amber}
                  weight="duotone"
                  style={{ filter: `drop-shadow(0 0 6px ${colors.amber}60)` }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      color: colors.amber,
                      fontWeight: 700,
                    }}
                  >
                    -d
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Detached (background)
                  </span>
                </div>
              </div>

              {/* Port mapping */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: `${colors.cyan}08`,
                  border: `1px solid ${colors.cyan}15`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: entrance(f, fPorts, 15).opacity,
                  transform: `translateY(${entrance(f, fPorts, 15).translateY}px)`,
                }}
              >
                <PlugIcon
                  size={20}
                  color={colors.cyan}
                  weight="duotone"
                  style={{ filter: `drop-shadow(0 0 6px ${colors.cyan}60)` }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      color: colors.cyan,
                      fontWeight: 700,
                    }}
                  >
                    -p 3000:3000
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Port mapping
                  </span>
                </div>
              </div>

              {/* Container ls */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: `${colors.blue}08`,
                  border: `1px solid ${colors.blue}15`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: entrance(f, fDockerLs, 15).opacity,
                  transform: `translateY(${entrance(f, fDockerLs, 15).translateY}px)`,
                }}
              >
                <ListIcon
                  size={20}
                  color={colors.blue}
                  weight="duotone"
                  style={{ filter: `drop-shadow(0 0 6px ${colors.blue}60)` }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      color: colors.blue,
                      fontWeight: 700,
                    }}
                  >
                    docker container ls
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    View running containers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_DockerCommands;
