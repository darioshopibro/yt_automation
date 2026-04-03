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

// ─── Timestamps (seconds) ───
const timestamps = [
  { word: "So", start: 150.047 },
  { word: "how", start: 151.603 },
  { word: "Docker?", start: 152.207 },
  { word: "Dockerfile,", start: 153.995 },
  { word: "built", start: 154.948 },
  { word: "image,", start: 155.714 },
  { word: "run", start: 156.528 },
  { word: "container.", start: 157.363 },
  { word: "Dockerfile2", start: 158.583 },
  { word: "text", start: 160.137 },
  { word: "document", start: 160.428 },
  { word: "blueprint.", start: 163.086 },
  { word: "base", start: 164.574 },
  { word: "image2", start: 164.888 },
  { word: "FROM", start: 166.01 },
  { word: "keyword,", start: 166.404 },
  { word: "DockerHub", start: 167.752 },
  { word: "Hub.", start: 168.054 },
  { word: "Ubuntu", start: 168.856 },
  { word: "Alpine", start: 169.367 },
  { word: "Linux", start: 169.692 },
  { word: "downloading,", start: 181.441 },
  { word: "installing,", start: 182.253 },
  { word: "running", start: 183.38 },
];

const Generated_DockerfileToContainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const f = frame; // global frame (no offset needed — components receive global frame directly)

  const frameFor = (keyword: string): number => {
    const w = timestamps.find((t) =>
      t.word.toLowerCase().includes(keyword.toLowerCase())
    );
    return w ? Math.round(w.start * fps) : 0;
  };

  // Key frames (absolute) — elements appear 4 frames before keyword
  const ANTICIPATION = 4;
  const fDockerfile = frameFor("Dockerfile,") - ANTICIPATION; // ~4615
  const fBuilt = frameFor("built") - ANTICIPATION; // ~4644
  const fImage = frameFor("image,") - ANTICIPATION; // ~4667
  const fRun = frameFor("run") - ANTICIPATION; // ~4691
  const fContainer = frameFor("container.") - ANTICIPATION; // ~4716
  const fDockerfile2 = frameFor("Dockerfile2") - ANTICIPATION; // ~4753
  const fText = frameFor("text") - ANTICIPATION; // ~4800
  const fBlueprint = frameFor("blueprint.") - ANTICIPATION; // ~4888
  const fBase = frameFor("base") - ANTICIPATION; // ~4933
  const fFROM = frameFor("FROM") - ANTICIPATION; // ~4976
  const fHub = frameFor("Hub.") - ANTICIPATION; // ~5037
  const fUbuntu = frameFor("Ubuntu") - ANTICIPATION; // ~5061
  const fAlpine = frameFor("Alpine") - ANTICIPATION; // ~5077
  const fDownloading = frameFor("downloading,") - ANTICIPATION; // ~5439
  const fInstalling = frameFor("installing,") - ANTICIPATION; // ~5463
  const fRunning = frameFor("running") - ANTICIPATION; // ~5497

  // ════════════════════════════════════════
  // LEFT PANEL: Dockerfile representation
  // ════════════════════════════════════════

  // Panel appears when narrator says "Dockerfile"
  const leftPanelEnt = entrance(f, fDockerfile, 18);

  // "Text document" label appears
  const textDocEnt = entrance(f, fText, 15);

  // Blueprint badge
  const blueprintEnt = entrance(f, fBlueprint, 15);
  const blueprintScale = spring({
    frame: Math.max(0, f - fBlueprint),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Code lines — appear progressively
  const codeLine1Ent = entrance(f, fFROM, 15); // FROM node:18
  const codeLine2Ent = entrance(f, fDownloading, 15); // RUN npm install
  const codeLine3Ent = entrance(f, fInstalling, 15); // COPY . .
  const codeLine4Ent = entrance(f, fRunning, 15); // CMD ["node", "index.js"]

  // FROM keyword highlight glow
  const fromGlow = interpolate(f, [fFROM, fFROM + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Base image / Docker Hub labels
  const baseEnt = entrance(f, fBase, 15);
  const hubEnt = entrance(f, fHub, 15);

  // Ubuntu / Alpine highlights
  const ubuntuEnt = entrance(f, fUbuntu, 12);
  const alpineEnt = entrance(f, fAlpine, 12);

  // ════════════════════════════════════════
  // RIGHT PANEL: 3-step pipeline
  // ════════════════════════════════════════

  // Step 1: Dockerfile (blueprint sheet)
  const step1Ent = entrance(f, fDockerfile, 18);

  // Step 2: Docker Image (after "built into a Docker image")
  const step2Ent = entrance(f, fImage, 18);
  const step2Scale = spring({
    frame: Math.max(0, f - fImage),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Arrow 1 (Dockerfile → Image)
  const arrow1Ent = entrance(f, fBuilt, 15);

  // Step 3: Docker Container (after "run as a Docker container")
  const step3Ent = entrance(f, fContainer, 18);
  const step3Scale = spring({
    frame: Math.max(0, f - fContainer),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Arrow 2 (Image → Container)
  const arrow2Ent = entrance(f, fRun, 15);

  // Container pulse glow
  const containerPulse =
    f > fContainer
      ? 0.6 + Math.sin((f - fContainer) * 0.12) * 0.4
      : 0;

  // Placeholder "code" bars for the left panel (before real code appears)
  const placeholderBars = [
    { width: "70%", delay: 0 },
    { width: "55%", delay: 4 },
    { width: "85%", delay: 8 },
    { width: "40%", delay: 12 },
    { width: "65%", delay: 16 },
  ];

  const FileIcon = getIcon("FileText");
  const BlueprintIcon = getIcon("Blueprint");
  const PackageIcon = getIcon("Package");
  const PlayIcon = getIcon("Play");
  const ArrowRightIcon = getIcon("ArrowRight");
  const CloudIcon = getIcon("Cloud");
  const TerminalIcon = getIcon("Terminal");

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: "hidden",
        padding: 80,
        display: "flex",
        gap: 48,
      }}
    >
      {/* ═══ LEFT PANEL (40%): Dockerfile ═══ */}
      <div
        style={{
          flex: "0 0 40%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          opacity: leftPanelEnt.opacity,
          transform: `translateY(${leftPanelEnt.translateY}px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <FileIcon size={24} color={colors.blue} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "#64748b",
            }}
          >
            Dockerfile
          </span>

          {/* "Text document" badge */}
          <div
            style={{
              marginLeft: "auto",
              padding: "4px 12px",
              borderRadius: 8,
              background: "#94a3b810",
              border: "1px solid #94a3b820",
              fontSize: 11,
              color: "#94a3b8",
              fontWeight: 600,
              opacity: textDocEnt.opacity,
            }}
          >
            Text Document
          </div>
        </div>

        {/* Blueprint badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            borderRadius: 10,
            background: `${colors.amber}08`,
            border: `1px solid ${colors.amber}15`,
            opacity: blueprintEnt.opacity,
            transform: `scale(${blueprintScale})`,
            transformOrigin: "left center",
          }}
        >
          <BlueprintIcon
            size={20}
            color={colors.amber}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 6px ${colors.amber}60)` }}
          />
          <span style={{ fontSize: 13, color: colors.amber, fontWeight: 600 }}>
            Like a Blueprint
          </span>
        </div>

        {/* File panel */}
        <div
          style={{
            flex: 1,
            background: "#12121f",
            border: "1px solid #1a1a2e",
            borderRadius: 12,
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "hidden",
          }}
        >
          {/* Placeholder bars (visible before real code, fade out when FROM appears) */}
          {placeholderBars.map((bar, i) => {
            const barEnt = entrance(f, fDockerfile2 + bar.delay, 12);
            const barFade = interpolate(f, [fFROM - 5, fFROM + 10], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  height: 12,
                  width: bar.width,
                  borderRadius: 6,
                  background: "#1a1a2e",
                  opacity: barEnt.opacity * barFade,
                }}
              />
            );
          })}

          {/* Real code lines */}
          {/* Line 1: FROM node:18 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              opacity: codeLine1Ent.opacity,
              transform: `translateY(${codeLine1Ent.translateY}px)`,
              padding: "6px 12px",
              borderRadius: 8,
              background: fromGlow > 0 ? `${colors.blue}${Math.round(fromGlow * 15).toString(16).padStart(2, "0")}` : "transparent",
              border: fromGlow > 0 ? `1px solid ${colors.blue}${Math.round(fromGlow * 40).toString(16).padStart(2, "0")}` : "1px solid transparent",
              boxShadow: fromGlow > 0 ? `0 0 ${20 * fromGlow}px ${colors.blue}20` : "none",
            }}
          >
            <span style={{ color: colors.purple, fontWeight: 700 }}>FROM</span>
            <span style={{ color: "#e2e8f0" }}> node:18</span>
          </div>

          {/* Base image note */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingLeft: 12,
              opacity: baseEnt.opacity,
              transform: `translateY(${baseEnt.translateY}px)`,
            }}
          >
            <span style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
              Base image from
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                opacity: hubEnt.opacity,
              }}
            >
              <CloudIcon size={14} color={colors.cyan} weight="duotone" />
              <span
                style={{
                  fontSize: 12,
                  color: colors.cyan,
                  fontWeight: 700,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                Docker Hub
              </span>
            </div>
          </div>

          {/* OS choices: Ubuntu / Alpine */}
          <div
            style={{
              display: "flex",
              gap: 10,
              paddingLeft: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                background: `${colors.orange}10`,
                border: `1px solid ${colors.orange}20`,
                fontSize: 12,
                fontFamily: "'SF Mono', monospace",
                color: colors.orange,
                fontWeight: 600,
                opacity: ubuntuEnt.opacity,
                transform: `translateY(${ubuntuEnt.translateY}px)`,
              }}
            >
              Ubuntu
            </div>
            <div
              style={{
                padding: "4px 12px",
                borderRadius: 8,
                background: `${colors.green}10`,
                border: `1px solid ${colors.green}20`,
                fontSize: 12,
                fontFamily: "'SF Mono', monospace",
                color: colors.green,
                fontWeight: 600,
                opacity: alpineEnt.opacity,
                transform: `translateY(${alpineEnt.translateY}px)`,
              }}
            >
              Alpine Linux
            </div>
          </div>

          {/* Line 2: RUN npm install */}
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              padding: "6px 12px",
              borderRadius: 8,
              opacity: codeLine2Ent.opacity,
              transform: `translateY(${codeLine2Ent.translateY}px)`,
            }}
          >
            <span style={{ color: colors.purple, fontWeight: 700 }}>RUN</span>
            <span style={{ color: "#e2e8f0" }}> npm install</span>
          </div>

          {/* Line 3: COPY . . */}
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              padding: "6px 12px",
              borderRadius: 8,
              opacity: codeLine3Ent.opacity,
              transform: `translateY(${codeLine3Ent.translateY}px)`,
            }}
          >
            <span style={{ color: colors.purple, fontWeight: 700 }}>COPY</span>
            <span style={{ color: "#e2e8f0" }}> . .</span>
          </div>

          {/* Line 4: CMD */}
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              padding: "6px 12px",
              borderRadius: 8,
              opacity: codeLine4Ent.opacity,
              transform: `translateY(${codeLine4Ent.translateY}px)`,
            }}
          >
            <span style={{ color: colors.purple, fontWeight: 700 }}>CMD</span>
            <span style={{ color: "#e2e8f0" }}> ["node", "index.js"]</span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL (60%): Pipeline Flow ═══ */}
      <div
        style={{
          flex: "0 0 56%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Section label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: entrance(f, fDockerfile, 18).opacity,
            transform: `translateY(${entrance(f, fDockerfile, 18).translateY}px)`,
          }}
        >
          <TerminalIcon size={20} color="#64748b" weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              color: "#64748b",
            }}
          >
            Build Pipeline
          </span>
        </div>

        {/* 3-Step Flow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Step 1: Dockerfile */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              flex: 1,
              opacity: step1Ent.opacity,
              transform: `translateY(${step1Ent.translateY}px)`,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${colors.blue}18, ${colors.blue}06)`,
                border: `1.5px solid ${colors.blue}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 24px ${colors.blue}12`,
              }}
            >
              <FileIcon
                size={48}
                color={colors.blue}
                weight="duotone"
                style={{ filter: `drop-shadow(0 0 10px ${colors.blue}60)` }}
              />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              Dockerfile
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Blueprint
            </span>
          </div>

          {/* Arrow 1 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              opacity: arrow1Ent.opacity,
            }}
          >
            <ArrowRightIcon
              size={28}
              color={colors.blue}
              weight="bold"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.blue}40)`,
              }}
            />
          </div>

          {/* Step 2: Docker Image */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              flex: 1,
              opacity: step2Ent.opacity,
              transform: `translateY(${step2Ent.translateY}px) scale(${step2Scale})`,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${colors.purple}18, ${colors.purple}06)`,
                border: `1.5px solid ${colors.purple}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 24px ${colors.purple}12`,
              }}
            >
              <PackageIcon
                size={48}
                color={colors.purple}
                weight="duotone"
                style={{ filter: `drop-shadow(0 0 10px ${colors.purple}60)` }}
              />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              Docker Image
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Snapshot
            </span>
          </div>

          {/* Arrow 2 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              opacity: arrow2Ent.opacity,
            }}
          >
            <ArrowRightIcon
              size={28}
              color={colors.purple}
              weight="bold"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.purple}40)`,
              }}
            />
          </div>

          {/* Step 3: Docker Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              flex: 1,
              opacity: step3Ent.opacity,
              transform: `translateY(${step3Ent.translateY}px) scale(${step3Scale})`,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${colors.green}18, ${colors.green}06)`,
                border: `1.5px solid ${colors.green}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 ${24 + containerPulse * 16}px ${colors.green}${Math.round(12 + containerPulse * 20).toString(16).padStart(2, "0")}`,
              }}
            >
              <PlayIcon
                size={48}
                color={colors.green}
                weight="duotone"
                style={{ filter: `drop-shadow(0 0 10px ${colors.green}60)` }}
              />
            </div>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#e2e8f0",
              }}
            >
              Container
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {/* Running indicator dot */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: colors.green,
                  boxShadow: `0 0 8px ${colors.green}80`,
                  opacity: containerPulse,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: colors.green,
                  fontWeight: 600,
                  opacity: step3Ent.opacity,
                }}
              >
                Running Instance
              </span>
            </div>
          </div>
        </div>

        {/* Explanation cards below pipeline */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 24,
          }}
        >
          {/* Card: docker build */}
          <div
            style={{
              flex: 1,
              padding: "16px 20px",
              borderRadius: 12,
              background: `${colors.blue}08`,
              border: `1px solid ${colors.blue}15`,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              opacity: arrow1Ent.opacity,
              transform: `translateY(${arrow1Ent.translateY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                color: colors.blue,
                fontWeight: 700,
              }}
            >
              docker build
            </span>
            <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
              Reads Dockerfile, creates image layer by layer
            </span>
          </div>

          {/* Card: docker run */}
          <div
            style={{
              flex: 1,
              padding: "16px 20px",
              borderRadius: 12,
              background: `${colors.green}08`,
              border: `1px solid ${colors.green}15`,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              opacity: arrow2Ent.opacity,
              transform: `translateY(${arrow2Ent.translateY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                color: colors.green,
                fontWeight: 700,
              }}
            >
              docker run
            </span>
            <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
              Starts container from image — isolated process
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_DockerfileToContainer;
