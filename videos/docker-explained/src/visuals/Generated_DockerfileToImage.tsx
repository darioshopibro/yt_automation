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

/**
 * Generated_DockerfileToImage
 * Segment 4/5: "Dockerfile to Image"
 * Frames: 4574 – 6068 (1494 frames, ~49.8s @ 30fps)
 *
 * Visual metaphor: Context Panel — left side shows Dockerfile being written
 * line-by-line, then morphs to terminal for build command. Right side shows
 * the conceptual flow: Dockerfile (blueprint) → Image → Container.
 *
 * Transcript: "So how do we use Docker? You begin with a Dockerfile,
 * which can be built into a Docker image, which can be run as a Docker
 * container. The Dockerfile is a surprisingly simple text document that
 * instructs how the Docker image will be built, like a blueprint..."
 */

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

// Brand colors
const BLUE = "#3b82f6";
const CYAN = "#06b6d4";
const AMBER = "#f59e0b";
const BG = "#0f0f1a";

// Estimated word-level timestamps (seconds from video start)
// Segment starts at frame 4574 = 152.47s, ends at 6068 = 202.27s
// Mapped to absolute frames at 30fps
const T = {
  // "So how do we use Docker?"
  how: 4580,
  useDocker: 4598,
  // "You begin with a Dockerfile"
  dockerfile: 4634,
  // "which can be built into a Docker image"
  builtInto: 4664,
  dockerImage: 4682,
  // "which can be run as a Docker container"
  runAs: 4706,
  dockerContainer: 4724,
  // "The Dockerfile is a surprisingly simple text document"
  simpleText: 4766,
  // "that instructs how the Docker image will be built"
  instructs: 4790,
  // "like a blueprint"
  blueprint: 4820,
  // "You first select a base image to start with using the FROM keyword"
  baseImage: 4856,
  fromKeyword: 4880,
  // "which you can find from the Docker Hub"
  dockerHub: 4910,
  // "Ubuntu and Alpine Linux are popular choices"
  ubuntu: 4940,
  alpine: 4955,
  // "From there you can run commands such as downloading, installing, and running"
  runCommands: 4990,
  downloading: 5010,
  installing: 5025,
  running: 5040,
  // "Once your Dockerfile is complete, you can build it"
  complete: 5080,
  canBuild: 5100,
  // "using docker build followed by the -t flag"
  dockerBuild: 5120,
  tFlag: 5145,
  // "so you can name your image"
  nameImage: 5170,
  // "and pass your command the location of the Dockerfile"
  location: 5200,
  // "Once complete, you can verify your image's existence with docker images"
  verify: 5240,
  dockerImages: 5270,
};

// ============================================================
// Sub-components
// ============================================================

const FileIcon = getIcon("FileText");
const TerminalIcon = getIcon("Terminal");
const PackageIcon = getIcon("Package");
const PlayIcon = getIcon("Play");
const CheckCircleIcon = getIcon("CheckCircle");
const BlueprintIcon = getIcon("Blueprint");
const ArrowRightIcon = getIcon("ArrowRight");
const DownloadIcon = getIcon("Download");
const GlobeIcon = getIcon("Globe");

// Clamp helper
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const Generated_DockerfileToImage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ============================================================
  // SCENE PHASES
  // ============================================================
  // Phase 1: Intro — "How do we use Docker?" + Dockerfile→Image→Container flow
  // Phase 2: Dockerfile deep-dive — Context Panel with Dockerfile lines
  // Phase 3: Build command — Terminal with docker build
  // Phase 4: Verification — docker images output

  const isPhase1 = frame >= T.how && frame < T.simpleText;
  const isPhase2 = frame >= T.simpleText && frame < T.complete;
  const isPhase3 = frame >= T.complete && frame < T.verify;
  const isPhase4 = frame >= T.verify;

  // Master opacity for the whole component
  const masterOpacity = interpolate(
    frame,
    [T.how, T.how + 15, 6050, 6068],
    [0, 1, 1, 0],
    clamp
  );

  // ============================================================
  // PHASE 1: The Pipeline Flow — Dockerfile → Image → Container
  // ============================================================
  const phase1Opacity = interpolate(
    frame,
    [T.how, T.how + 15, T.simpleText - 20, T.simpleText],
    [0, 1, 1, 0],
    clamp
  );

  // Title "How do we use Docker?"
  const titleOpacity = interpolate(frame, [T.how, T.how + 20], [0, 1], clamp);
  const titleY = interpolate(frame, [T.how, T.how + 20], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Three boxes appear in sequence
  const dockerfileBoxOpacity = interpolate(
    frame,
    [T.dockerfile - 5, T.dockerfile + 10],
    [0, 1],
    clamp
  );
  const dockerfileBoxScale = spring({
    frame: Math.max(0, frame - (T.dockerfile - 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const imageBoxOpacity = interpolate(
    frame,
    [T.dockerImage - 5, T.dockerImage + 10],
    [0, 1],
    clamp
  );
  const imageBoxScale = spring({
    frame: Math.max(0, frame - (T.dockerImage - 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  const containerBoxOpacity = interpolate(
    frame,
    [T.dockerContainer - 5, T.dockerContainer + 10],
    [0, 1],
    clamp
  );
  const containerBoxScale = spring({
    frame: Math.max(0, frame - (T.dockerContainer - 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Arrows between boxes
  const arrow1Opacity = interpolate(
    frame,
    [T.builtInto, T.builtInto + 12],
    [0, 1],
    clamp
  );
  const arrow2Opacity = interpolate(
    frame,
    [T.runAs, T.runAs + 12],
    [0, 1],
    clamp
  );

  // ============================================================
  // PHASE 2: Context Panel — Dockerfile deep dive
  // ============================================================
  const phase2Opacity = interpolate(
    frame,
    [T.simpleText, T.simpleText + 15, T.complete - 15, T.complete],
    [0, 1, 1, 0],
    clamp
  );

  // Blueprint badge
  const blueprintOpacity = interpolate(
    frame,
    [T.blueprint - 3, T.blueprint + 12],
    [0, 1],
    clamp
  );

  // Dockerfile lines appearing
  const fromLineOpacity = interpolate(
    frame,
    [T.fromKeyword - 5, T.fromKeyword + 10],
    [0, 1],
    clamp
  );
  const fromLineHighlight = interpolate(
    frame,
    [T.fromKeyword - 5, T.fromKeyword + 10, T.dockerHub - 5, T.dockerHub],
    [0, 1, 1, 0.4],
    clamp
  );

  // Docker Hub mention
  const hubOpacity = interpolate(
    frame,
    [T.dockerHub - 3, T.dockerHub + 12],
    [0, 1],
    clamp
  );

  // Ubuntu / Alpine
  const ubuntuOpacity = interpolate(
    frame,
    [T.ubuntu - 3, T.ubuntu + 10],
    [0, 1],
    clamp
  );
  const alpineOpacity = interpolate(
    frame,
    [T.alpine - 3, T.alpine + 10],
    [0, 1],
    clamp
  );

  // RUN lines
  const runLineOpacity = interpolate(
    frame,
    [T.runCommands - 5, T.runCommands + 10],
    [0, 1],
    clamp
  );
  const runLineHighlight = interpolate(
    frame,
    [T.runCommands - 5, T.runCommands + 10, T.running + 15, T.running + 25],
    [0, 1, 1, 0.4],
    clamp
  );

  // ============================================================
  // PHASE 3: Terminal — docker build
  // ============================================================
  const phase3Opacity = interpolate(
    frame,
    [T.complete, T.complete + 15, T.verify - 15, T.verify],
    [0, 1, 1, 0],
    clamp
  );

  // Build command typing effect
  const buildCommandChars = "$ docker build -t my-app .";
  const typingProgress = interpolate(
    frame,
    [T.dockerBuild, T.location],
    [0, 1],
    clamp
  );
  const visibleChars = Math.floor(typingProgress * buildCommandChars.length);
  const typedCommand = buildCommandChars.slice(0, visibleChars);

  // -t flag highlight
  const tFlagGlow = interpolate(
    frame,
    [T.tFlag - 3, T.tFlag + 8, T.tFlag + 25, T.tFlag + 35],
    [0, 1, 1, 0.3],
    clamp
  );

  // Build progress bar
  const buildProgress = interpolate(
    frame,
    [T.location + 10, T.verify - 20],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // Image result appearing
  const imageResultOpacity = interpolate(
    frame,
    [T.verify - 25, T.verify - 10],
    [0, 1],
    clamp
  );

  // ============================================================
  // PHASE 4: docker images verification
  // ============================================================
  const phase4Opacity = interpolate(
    frame,
    [T.verify, T.verify + 15, 6050, 6068],
    [0, 1, 1, 0],
    clamp
  );

  const verifyCommandProgress = interpolate(
    frame,
    [T.dockerImages, T.dockerImages + 20],
    [0, 1],
    clamp
  );
  const verifyCommand = "$ docker images";
  const verifyTyped = verifyCommand.slice(
    0,
    Math.floor(verifyCommandProgress * verifyCommand.length)
  );

  const tableOpacity = interpolate(
    frame,
    [T.dockerImages + 25, T.dockerImages + 40],
    [0, 1],
    clamp
  );

  const checkOpacity = interpolate(
    frame,
    [T.dockerImages + 45, T.dockerImages + 55],
    [0, 1],
    clamp
  );
  const checkScale = spring({
    frame: Math.max(0, frame - (T.dockerImages + 45)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        opacity: masterOpacity,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ========== PHASE 1: Pipeline Flow ========== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          opacity: phase1Opacity,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: 80,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            letterSpacing: -0.5,
          }}
        >
          How do we use Docker?
        </div>

        {/* Three boxes: Dockerfile → Image → Container */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
          }}
        >
          {/* Dockerfile Box */}
          <div
            style={{
              opacity: dockerfileBoxOpacity,
              transform: `scale(${dockerfileBoxScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "32px 40px",
              borderRadius: 12,
              background: `${BLUE}08`,
              border: `1px solid ${BLUE}25`,
              boxShadow:
                dockerfileBoxOpacity > 0.8 ? `0 0 25px ${BLUE}15` : "none",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${BLUE}20, ${BLUE}08)`,
                border: `1.5px solid ${BLUE}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${BLUE}15`,
              }}
            >
              <FileIcon size={32} color={BLUE} weight="duotone" />
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Dockerfile
            </div>
          </div>

          {/* Arrow 1 */}
          <div style={{ opacity: arrow1Opacity }}>
            <ArrowRightIcon size={28} color="#64748b" weight="bold" />
          </div>

          {/* Image Box */}
          <div
            style={{
              opacity: imageBoxOpacity,
              transform: `scale(${imageBoxScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "32px 40px",
              borderRadius: 12,
              background: `${CYAN}08`,
              border: `1px solid ${CYAN}25`,
              boxShadow:
                imageBoxOpacity > 0.8 ? `0 0 25px ${CYAN}15` : "none",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${CYAN}20, ${CYAN}08)`,
                border: `1.5px solid ${CYAN}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${CYAN}15`,
              }}
            >
              <PackageIcon size={32} color={CYAN} weight="duotone" />
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Docker Image
            </div>
          </div>

          {/* Arrow 2 */}
          <div style={{ opacity: arrow2Opacity }}>
            <ArrowRightIcon size={28} color="#64748b" weight="bold" />
          </div>

          {/* Container Box */}
          <div
            style={{
              opacity: containerBoxOpacity,
              transform: `scale(${containerBoxScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "32px 40px",
              borderRadius: 12,
              background: `${AMBER}08`,
              border: `1px solid ${AMBER}25`,
              boxShadow:
                containerBoxOpacity > 0.8 ? `0 0 25px ${AMBER}15` : "none",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${AMBER}20, ${AMBER}08)`,
                border: `1.5px solid ${AMBER}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${AMBER}15`,
              }}
            >
              <PlayIcon size={32} color={AMBER} weight="duotone" />
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Container
            </div>
          </div>
        </div>

        {/* Labels under arrows */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 24,
            alignItems: "center",
          }}
        >
          <div style={{ width: 160 }} />
          <div
            style={{
              opacity: arrow1Opacity,
              fontSize: 12,
              color: "#64748b",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            build
          </div>
          <div style={{ width: 160 }} />
          <div
            style={{
              opacity: arrow2Opacity,
              fontSize: 12,
              color: "#64748b",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: 1.5,
            }}
          >
            run
          </div>
          <div style={{ width: 160 }} />
        </div>
      </div>

      {/* ========== PHASE 2: Context Panel — Dockerfile Deep Dive ========== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          padding: 80,
          gap: 48,
          opacity: phase2Opacity,
        }}
      >
        {/* LEFT: Dockerfile Panel */}
        <div
          style={{
            flex: "0 0 40%",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {/* File header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: "#12121f",
              borderRadius: "12px 12px 0 0",
              border: "1px solid #1a1a2e",
              borderBottom: "none",
            }}
          >
            <FileIcon size={16} color={BLUE} weight="duotone" />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#94a3b8",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Dockerfile
            </span>
            {/* Blueprint badge */}
            <div
              style={{
                marginLeft: "auto",
                opacity: blueprintOpacity,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 8,
                background: `${AMBER}12`,
                border: `1px solid ${AMBER}20`,
              }}
            >
              <BlueprintIcon size={12} color={AMBER} weight="duotone" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: AMBER,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Blueprint
              </span>
            </div>
          </div>

          {/* File content */}
          <div
            style={{
              flex: 1,
              background: "#0a0a15",
              borderRadius: "0 0 12px 12px",
              border: "1px solid #1a1a2e",
              borderTop: "none",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
            }}
          >
            {/* Line numbers + content */}
            {/* Line 1: FROM */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: fromLineOpacity,
                padding: "6px 8px",
                borderRadius: 6,
                background:
                  fromLineHighlight > 0.5
                    ? `${BLUE}${Math.round(fromLineHighlight * 15)
                        .toString(16)
                        .padStart(2, "0")}`
                    : "transparent",
                boxShadow:
                  fromLineHighlight > 0.7 ? `0 0 15px ${BLUE}15` : "none",
              }}
            >
              <span style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}>
                1
              </span>
              <span>
                <span style={{ color: "#c678dd" }}>FROM</span>{" "}
                <span style={{ color: "#98c379" }}>
                  {frame >= T.ubuntu
                    ? "ubuntu:22.04"
                    : "node:18-alpine"}
                </span>
              </span>
            </div>

            {/* Line 2: Empty */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: fromLineOpacity,
                padding: "6px 8px",
              }}
            >
              <span style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}>
                2
              </span>
              <span style={{ color: "#5c6370" }}># Set working directory</span>
            </div>

            {/* Line 3: WORKDIR */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: runLineOpacity,
                padding: "6px 8px",
              }}
            >
              <span style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}>
                3
              </span>
              <span>
                <span style={{ color: "#c678dd" }}>WORKDIR</span>{" "}
                <span style={{ color: "#98c379" }}>/app</span>
              </span>
            </div>

            {/* Line 4: COPY */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: runLineOpacity,
                padding: "6px 8px",
              }}
            >
              <span style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}>
                4
              </span>
              <span>
                <span style={{ color: "#c678dd" }}>COPY</span>{" "}
                <span style={{ color: "#98c379" }}>. .</span>
              </span>
            </div>

            {/* Line 5: RUN */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: runLineOpacity,
                padding: "6px 8px",
                borderRadius: 6,
                background:
                  runLineHighlight > 0.5
                    ? `${CYAN}${Math.round(runLineHighlight * 15)
                        .toString(16)
                        .padStart(2, "0")}`
                    : "transparent",
                boxShadow:
                  runLineHighlight > 0.7 ? `0 0 15px ${CYAN}15` : "none",
              }}
            >
              <span style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}>
                5
              </span>
              <span>
                <span style={{ color: "#c678dd" }}>RUN</span>{" "}
                <span style={{ color: "#e2e8f0" }}>apt-get update && apt-get install -y curl</span>
              </span>
            </div>

            {/* Line 6: RUN 2 */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: interpolate(
                  frame,
                  [T.installing - 3, T.installing + 10],
                  [0, 1],
                  clamp
                ),
                padding: "6px 8px",
              }}
            >
              <span style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}>
                6
              </span>
              <span>
                <span style={{ color: "#c678dd" }}>RUN</span>{" "}
                <span style={{ color: "#e2e8f0" }}>npm install</span>
              </span>
            </div>

            {/* Line 7: CMD */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: interpolate(
                  frame,
                  [T.running - 3, T.running + 10],
                  [0, 1],
                  clamp
                ),
                padding: "6px 8px",
              }}
            >
              <span style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}>
                7
              </span>
              <span>
                <span style={{ color: "#c678dd" }}>CMD</span>{" "}
                <span style={{ color: "#98c379" }}>["node", "server.js"]</span>
              </span>
            </div>

            {/* Placeholder lines (dimmed) */}
            {[8, 9, 10].map((n) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "6px 8px",
                  opacity: 0.15,
                }}
              >
                <span
                  style={{ color: "#4a4a5e", width: 24, textAlign: "right" }}
                >
                  {n}
                </span>
                <div
                  style={{
                    height: 10,
                    width: n === 8 ? 120 : n === 9 ? 180 : 90,
                    background: "#ffffff15",
                    borderRadius: 4,
                    marginTop: 2,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Visual explanation */}
        <div
          style={{
            flex: "0 0 55%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 32,
          }}
        >
          {/* "Simple text document" label */}
          <div
            style={{
              opacity: interpolate(
                frame,
                [T.simpleText, T.simpleText + 15],
                [0, 1],
                clamp
              ),
              fontSize: 22,
              fontWeight: 700,
              color: "#e2e8f0",
              textAlign: "center",
              transform: `translateY(${interpolate(
                frame,
                [T.simpleText, T.simpleText + 15],
                [20, 0],
                { ...clamp, easing: Easing.out(Easing.cubic) }
              )}px)`,
            }}
          >
            A simple text document
          </div>
          <div
            style={{
              opacity: blueprintOpacity,
              fontSize: 14,
              color: AMBER,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <BlueprintIcon size={18} color={AMBER} weight="duotone" />
            Like a blueprint for your image
          </div>

          {/* Docker Hub section */}
          <div
            style={{
              opacity: hubOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "24px 32px",
              borderRadius: 12,
              background: `${BLUE}06`,
              border: `1px solid ${BLUE}15`,
              transform: `translateY(${interpolate(
                frame,
                [T.dockerHub - 3, T.dockerHub + 12],
                [15, 0],
                { ...clamp, easing: Easing.out(Easing.cubic) }
              )}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GlobeIcon size={20} color={BLUE} weight="duotone" />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                Docker Hub — Base Images
              </span>
            </div>

            {/* Ubuntu + Alpine chips */}
            <div style={{ display: "flex", gap: 12 }}>
              <div
                style={{
                  opacity: ubuntuOpacity,
                  padding: "8px 20px",
                  borderRadius: 10,
                  background: `${AMBER}10`,
                  border: `1px solid ${AMBER}20`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: AMBER,
                  fontFamily: "'SF Mono', monospace",
                  transform: `scale(${spring({
                    frame: Math.max(0, frame - (T.ubuntu - 3)),
                    fps,
                    config: { damping: 22, stiffness: 200 },
                  })})`,
                }}
              >
                ubuntu:22.04
              </div>
              <div
                style={{
                  opacity: alpineOpacity,
                  padding: "8px 20px",
                  borderRadius: 10,
                  background: `${CYAN}10`,
                  border: `1px solid ${CYAN}20`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: CYAN,
                  fontFamily: "'SF Mono', monospace",
                  transform: `scale(${spring({
                    frame: Math.max(0, frame - (T.alpine - 3)),
                    fps,
                    config: { damping: 22, stiffness: 200 },
                  })})`,
                }}
              >
                alpine:3.18
              </div>
            </div>
          </div>

          {/* Commands section */}
          <div
            style={{
              opacity: runLineOpacity,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              {
                label: "Download",
                icon: "DownloadSimple",
                color: BLUE,
                f: T.downloading,
              },
              {
                label: "Install",
                icon: "Wrench",
                color: CYAN,
                f: T.installing,
              },
              {
                label: "Run",
                icon: "Play",
                color: AMBER,
                f: T.running,
              },
            ].map((cmd) => {
              const CmdIcon = getIcon(cmd.icon);
              const cmdOpacity = interpolate(
                frame,
                [cmd.f - 3, cmd.f + 10],
                [0, 1],
                clamp
              );
              return (
                <div
                  key={cmd.label}
                  style={{
                    opacity: cmdOpacity,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 18px",
                    borderRadius: 10,
                    background: `${cmd.color}08`,
                    border: `1px solid ${cmd.color}15`,
                    transform: `scale(${spring({
                      frame: Math.max(0, frame - (cmd.f - 3)),
                      fps,
                      config: { damping: 22, stiffness: 200 },
                    })})`,
                  }}
                >
                  <CmdIcon size={18} color={cmd.color} weight="duotone" />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: cmd.color,
                    }}
                  >
                    {cmd.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== PHASE 3: Terminal — docker build ========== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          opacity: phase3Opacity,
        }}
      >
        {/* Terminal window */}
        <div
          style={{
            width: 900,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #1a1a2e",
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "#12121f",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ef4444",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#f59e0b",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span
              style={{
                marginLeft: 12,
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Terminal
            </span>
          </div>

          {/* Terminal body */}
          <div
            style={{
              background: "#0a0a12",
              padding: "24px 20px",
              fontFamily: "'SF Mono', monospace",
              fontSize: 15,
              minHeight: 260,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Command line */}
            <div style={{ display: "flex", gap: 0 }}>
              <span style={{ color: "#e2e8f0" }}>
                {typedCommand.split("").map((char, i) => {
                  const isTFlag =
                    i >= buildCommandChars.indexOf("-t") &&
                    i < buildCommandChars.indexOf("-t") + 2;
                  const isName =
                    i >= buildCommandChars.indexOf("my-app") &&
                    i < buildCommandChars.indexOf("my-app") + 6;
                  return (
                    <span
                      key={i}
                      style={{
                        color: char === "$"
                          ? "#22c55e"
                          : isTFlag
                          ? AMBER
                          : isName
                          ? CYAN
                          : "#e2e8f0",
                        textShadow: isTFlag && tFlagGlow > 0.3
                          ? `0 0 10px ${AMBER}60`
                          : "none",
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
              {/* Cursor */}
              {typingProgress < 1 && (
                <span
                  style={{
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                    color: "#e2e8f0",
                    fontWeight: 700,
                  }}
                >
                  _
                </span>
              )}
            </div>

            {/* -t flag explanation */}
            <div
              style={{
                opacity: tFlagGlow,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 14px",
                borderRadius: 8,
                background: `${AMBER}08`,
                border: `1px solid ${AMBER}15`,
                marginTop: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: AMBER,
                  fontWeight: 600,
                }}
              >
                -t
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Tag flag — names your image
              </span>
            </div>

            {/* Build progress */}
            {buildProgress > 0 && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Building image...
                  </span>
                  <span style={{ fontSize: 12, color: CYAN }}>
                    {Math.round(buildProgress * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    background: "#1a1a2e",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${buildProgress * 100}%`,
                      height: "100%",
                      borderRadius: 3,
                      background: `linear-gradient(90deg, ${BLUE}, ${CYAN})`,
                      boxShadow: `0 0 12px ${CYAN}40`,
                    }}
                  />
                </div>

                {/* Build steps */}
                {[
                  { step: "Step 1/5 : FROM ubuntu:22.04", t: 0.1 },
                  { step: "Step 2/5 : WORKDIR /app", t: 0.3 },
                  { step: "Step 3/5 : COPY . .", t: 0.5 },
                  { step: "Step 4/5 : RUN apt-get update", t: 0.7 },
                  { step: "Step 5/5 : CMD [\"node\", \"server.js\"]", t: 0.9 },
                ].map(
                  (s) =>
                    buildProgress >= s.t && (
                      <div
                        key={s.step}
                        style={{
                          fontSize: 11,
                          color: "#4a4a5e",
                          marginTop: 4,
                          opacity: interpolate(
                            buildProgress,
                            [s.t, s.t + 0.05],
                            [0, 1],
                            clamp
                          ),
                        }}
                      >
                        {s.step}
                      </div>
                    )
                )}
              </div>
            )}

            {/* Success message */}
            <div
              style={{
                opacity: imageResultOpacity,
                marginTop: 12,
                fontSize: 13,
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <CheckCircleIcon size={16} color="#22c55e" weight="duotone" />
              Successfully built my-app:latest
            </div>
          </div>
        </div>
      </div>

      {/* ========== PHASE 4: docker images verification ========== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          opacity: phase4Opacity,
        }}
      >
        {/* Terminal window */}
        <div
          style={{
            width: 900,
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #1a1a2e",
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "#12121f",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#ef4444",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#f59e0b",
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span
              style={{
                marginLeft: 12,
                fontSize: 12,
                fontWeight: 600,
                color: "#64748b",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              Terminal
            </span>
          </div>

          {/* Terminal body */}
          <div
            style={{
              background: "#0a0a12",
              padding: "24px 20px",
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Command */}
            <div style={{ color: "#e2e8f0" }}>
              <span style={{ color: "#22c55e" }}>$ </span>
              {verifyTyped.replace("$ ", "")}
              {verifyCommandProgress < 1 && (
                <span
                  style={{
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                    fontWeight: 700,
                  }}
                >
                  _
                </span>
              )}
            </div>

            {/* Table header */}
            <div
              style={{
                opacity: tableOpacity,
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 120px 120px 140px 100px",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  borderBottom: "1px solid #1a1a2e",
                  paddingBottom: 8,
                }}
              >
                <span>REPOSITORY</span>
                <span>TAG</span>
                <span>IMAGE ID</span>
                <span>CREATED</span>
                <span>SIZE</span>
              </div>

              {/* Table row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 120px 120px 140px 100px",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#e2e8f0",
                  padding: "8px 0",
                  background: `${CYAN}06`,
                  borderRadius: 6,
                  paddingLeft: 4,
                  boxShadow: `0 0 15px ${CYAN}08`,
                }}
              >
                <span style={{ color: CYAN, fontWeight: 600 }}>my-app</span>
                <span>latest</span>
                <span style={{ color: "#94a3b8" }}>a1b2c3d4e5f6</span>
                <span style={{ color: "#94a3b8" }}>2 seconds ago</span>
                <span style={{ color: "#94a3b8" }}>187MB</span>
              </div>
            </div>

            {/* Check mark */}
            <div
              style={{
                opacity: checkOpacity,
                transform: `scale(${checkScale})`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 16,
                padding: "10px 16px",
                borderRadius: 10,
                background: "#22c55e08",
                border: "1px solid #22c55e15",
              }}
            >
              <CheckCircleIcon size={20} color="#22c55e" weight="duotone" />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#22c55e",
                }}
              >
                Image verified — ready to run
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_DockerfileToImage;
