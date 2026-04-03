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

// ─── CONSTANTS ──────────────────────────────────────────────
const SEGMENT_START = 2010;
const SEGMENT_END = 2521;

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

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

// ─── TIMESTAMPS (absolute frames at 30fps) ─────────────────
const timestamps = [
  { word: "developer", start: 67.791 },
  { word: "accessing", start: 69.451 },
  { word: "Docker", start: 70.532 },
  { word: "Hub,", start: 70.95 },
  { word: "online", start: 71.635 },
  { word: "cloud", start: 71.95 },
  { word: "repository", start: 72.193 },
  { word: "containers,", start: 73.356 },
  { word: "pull", start: 73.763 },
  { word: "pre-configured", start: 74.88 },
  { word: "environment", start: 75.612 },
  { word: "programming", start: 76.89 },
  { word: "language,", start: 77.332 },
  { word: "Ruby", start: 78.343 },
  { word: "Node.js,", start: 79.017 },
  { word: "files", start: 80.341 },
  { word: "frameworks", start: 80.818 },
];

// ─── HELPERS ────────────────────────────────────────────────
const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const slideUp = (frame: number, start: number, dur = 15, dist = 25) =>
  interpolate(frame, [start, start + dur], [dist, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const frameFor = (keyword: string, fps: number): number => {
  const w = timestamps.find((t) =>
    t.word.toLowerCase().includes(keyword.toLowerCase())
  );
  return w ? Math.round(w.start * fps) : SEGMENT_START;
};

// ─── MAIN COMPONENT ────────────────────────────────────────
const Generated_DockerHub: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Key frames (absolute) — elements appear 4 frames before keyword
  const devFrame = frameFor("developer", fps) - 4;
  const accessFrame = frameFor("accessing", fps) - 4;
  const hubFrame = frameFor("Hub", fps) - 4;
  const cloudFrame = frameFor("cloud", fps) - 4;
  const repoFrame = frameFor("repository", fps) - 4;
  const containersFrame = frameFor("containers", fps) - 4;
  const pullFrame = frameFor("pull", fps) - 4;
  const preConfigFrame = frameFor("pre-configured", fps) - 4;
  const rubyFrame = frameFor("Ruby", fps) - 4;
  const nodeFrame = frameFor("Node.js", fps) - 4;
  const filesFrame = frameFor("files", fps) - 4;
  const frameworksFrame = frameFor("frameworks", fps) - 4;

  // Icons
  const UserIcon = getIcon("UserCircle");
  const CloudIcon = getIcon("CloudArrowDown");
  const PackageIcon = getIcon("Package");
  const DiamondIcon = getIcon("Diamond");
  const CubeIcon = getIcon("Cube");
  const FileIcon = getIcon("FileCode");
  const FrameworkIcon = getIcon("Stack");
  const ArrowIcon = getIcon("ArrowLeft");

  // ─── Developer icon (left side) ──────────────────────────
  const devOp = fadeIn(frame, devFrame, 18);
  const devSlide = slideUp(frame, devFrame, 18, 30);
  const devScale = spring({
    frame: Math.max(0, frame - devFrame),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // ─── Docker Hub (center) ─────────────────────────────────
  const hubOp = fadeIn(frame, hubFrame, 20);
  const hubSlide = slideUp(frame, hubFrame, 20, 20);
  const hubScale = spring({
    frame: Math.max(0, frame - hubFrame),
    fps,
    config: { damping: 24, stiffness: 160 },
  });

  // "Cloud Repository" subtitle
  const repoLabelOp = fadeIn(frame, repoFrame, 12);

  // ─── Container boxes on the shelf ────────────────────────
  const containerItems = [
    { label: "Python", color: colors.blue, icon: "PythonLogo", appearFrame: containersFrame },
    { label: "Ruby", color: colors.red, icon: "Diamond", appearFrame: rubyFrame },
    { label: "Node.js", color: colors.green, icon: "FileJs", appearFrame: nodeFrame },
    { label: "Go", color: colors.cyan, icon: "Cube", appearFrame: containersFrame + 15 },
  ];

  // ─── Pull animation ──────────────────────────────────────
  // After "pull" keyword, the Node.js container slides toward developer
  const pullStartFrame = pullFrame;
  const pullProgress = interpolate(
    frame,
    [pullStartFrame, pullStartFrame + 45],
    [0, 1],
    { ...clamp, easing: Easing.inOut(Easing.cubic) }
  );

  // ─── "Pre-configured environment" label ──────────────────
  const preConfigOp = fadeIn(frame, preConfigFrame, 15);
  const preConfigSlide = slideUp(frame, preConfigFrame, 15);

  // ─── Files & frameworks labels ───────────────────────────
  const filesOp = fadeIn(frame, filesFrame, 12);
  const fwOp = fadeIn(frame, frameworksFrame, 12);

  // ─── Pull arrow glow pulse ───────────────────────────────
  const pullArrowOp = fadeIn(frame, pullFrame, 10);
  const pullGlow = interpolate(
    frame,
    [pullFrame, pullFrame + 20, pullFrame + 40],
    [0, 1, 0.5],
    clamp
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Main layout: Developer | Arrow | Docker Hub */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          width: "100%",
        }}
      >
        {/* ── Developer (left side) ── */}
        <div
          style={{
            opacity: devOp,
            transform: `translateY(${devSlide}px) scale(${Math.min(devScale, 1)})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            minWidth: 200,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${colors.purple}25, ${colors.purple}08)`,
              border: `1.5px solid ${colors.purple}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${colors.purple}20`,
            }}
          >
            <UserIcon size={56} color={colors.purple} weight="duotone" />
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#e2e8f0",
              letterSpacing: 0.3,
            }}
          >
            Developer
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#64748b",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            docker pull
          </div>

          {/* Pulled container (appears during pull animation) */}
          <div
            style={{
              opacity: pullProgress,
              transform: `translateY(${interpolate(pullProgress, [0, 1], [30, 0], clamp)}px) scale(${interpolate(pullProgress, [0, 1], [0.7, 1], clamp)})`,
              marginTop: 16,
              width: 160,
              padding: "14px 16px",
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.green}18, ${colors.green}06)`,
              border: `1.5px solid ${colors.green}50`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 0 25px ${colors.green}15`,
            }}
          >
            <PackageIcon size={28} color={colors.green} weight="duotone" />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
                fontFamily: "'SF Mono', monospace",
              }}
            >
              node:18-alpine
            </span>
            {/* Files & frameworks sub-labels */}
            <div style={{ display: "flex", gap: 8, opacity: filesOp }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#94a3b8",
                }}
              >
                <FileIcon size={12} color={colors.amber} weight="duotone" />
                files
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#94a3b8",
                  opacity: fwOp,
                }}
              >
                <FrameworkIcon
                  size={12}
                  color={colors.orange}
                  weight="duotone"
                />
                frameworks
              </div>
            </div>
          </div>
        </div>

        {/* ── Pull Arrow ── */}
        <div
          style={{
            opacity: pullArrowOp,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ArrowIcon
            size={40}
            color={colors.cyan}
            weight="bold"
            style={{
              filter: `drop-shadow(0 0 ${8 + pullGlow * 12}px ${colors.cyan}60)`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.cyan,
              fontFamily: "'SF Mono', monospace",
              opacity: pullArrowOp,
            }}
          >
            pull
          </span>
        </div>

        {/* ── Docker Hub (center-right) ── */}
        <div
          style={{
            opacity: hubOp,
            transform: `translateY(${hubSlide}px) scale(${Math.min(hubScale, 1)})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Hub header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                background: `linear-gradient(135deg, ${colors.blue}30, ${colors.cyan}15)`,
                border: `1.5px solid ${colors.blue}50`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 40px ${colors.blue}20`,
              }}
            >
              <CloudIcon size={44} color={colors.blue} weight="duotone" />
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: 0.5,
              }}
            >
              Docker Hub
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#94a3b8",
                fontFamily: "'SF Mono', monospace",
                opacity: repoLabelOp,
              }}
            >
              Cloud Repository
            </div>
          </div>

          {/* Container shelf */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              padding: 20,
              borderRadius: 16,
              background: "#0f0f1a",
              border: "1px solid #1a1a2e",
            }}
          >
            {containerItems.map((item, i) => {
              const itemOp = fadeIn(frame, item.appearFrame, 14);
              const itemScale = spring({
                frame: Math.max(0, frame - item.appearFrame),
                fps,
                config: { damping: 22, stiffness: 200 },
              });
              const Icon = getIcon(item.icon);

              // If this is Node.js and pull is happening, fade it out from shelf
              const isPulled =
                item.label === "Node.js" && pullProgress > 0;
              const shelfOp = isPulled
                ? interpolate(pullProgress, [0, 0.5], [1, 0.3], clamp)
                : 1;

              return (
                <div
                  key={item.label}
                  style={{
                    opacity: itemOp * shelfOp,
                    transform: `scale(${Math.min(itemScale, 1)})`,
                    width: 150,
                    padding: "16px 14px",
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${item.color}12, ${item.color}04)`,
                    border: `1px solid ${item.color}30`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: `0 0 15px ${item.color}10`,
                  }}
                >
                  <Icon size={30} color={item.color} weight="duotone" />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e2e8f0",
                      fontFamily: "'SF Mono', monospace",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                    }}
                  >
                    Pre-configured
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pre-configured environment label */}
          <div
            style={{
              opacity: preConfigOp,
              transform: `translateY(${preConfigSlide}px)`,
              fontSize: 14,
              color: "#94a3b8",
              fontFamily: "'SF Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 8,
              background: "#1a1a2e40",
              border: "1px solid #1a1a2e",
            }}
          >
            <PackageIcon size={16} color={colors.amber} weight="duotone" />
            Pre-configured environments ready to use
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_DockerHub;
