import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { File, Package, Cube, HardDrives, Lightning, Skull, Database } from "@phosphor-icons/react";

/**
 * DOCKER CONTAINER LIFECYCLE
 * Transcript: How a Docker container is born — Dockerfile → layers → image → container → ephemeral → volumes
 *
 * Scene 1 (0-210):  Building the image (layers stacking)
 * Scene 2 (210-420): Running & dying (container lifecycle + volumes)
 */

const colors = {
  blue: "#3b82f6",
  green: "#22c55e",
  orange: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  cyan: "#06b6d4",
};

// Layer data — proportional widths based on MB
const layers = [
  { label: "FROM  base image", size: 50, color: colors.blue, command: "FROM node:18-alpine" },
  { label: "COPY  source code", size: 5, color: colors.green, command: "COPY . /app" },
  { label: "RUN   npm install", size: 200, color: colors.orange, command: "RUN npm install" },
];

const totalMB = 255;

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const Generated_DockerContainerLifecycle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== SCENE 1: Building the Image (frames 0-210) =====
  const scene1Opacity = interpolate(frame, [200, 220], [1, 0], clamp);
  // ===== SCENE 2: Running Container (frames 210-420) =====
  const scene2Opacity = interpolate(frame, [210, 230], [0, 1], clamp);

  // --- Scene 1 timings ---
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dockerfileEnter = interpolate(frame, [25, 45], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dockerfileSlide = interpolate(frame, [25, 45], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Build command flash
  const buildCmdOpacity = interpolate(frame, [50, 60, 65, 75], [0, 1, 1, 0.6], clamp);

  // Layer entrance frames
  const layerStartFrames = [80, 110, 135];
  const layerDuration = 25;

  // Cache demo (frame 170-200)
  const cachePhase = interpolate(frame, [170, 185], [0, 1], clamp);
  const rebuildPulse = interpolate(frame, [185, 195, 200], [0, 1, 0], clamp);

  // Total size reveal
  const totalReveal = interpolate(frame, [160, 175], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // --- Scene 2 timings ---
  const dockerRunCmd = interpolate(frame, [225, 240], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const containerScale = spring({ frame: Math.max(0, frame - 245), fps, config: { damping: 22, stiffness: 180 } });
  const containerBoxOpacity = interpolate(frame, [245, 260], [0, 1], clamp);

  // Isolated properties
  const propStartFrame = 275;
  const containerProps = ["Filesystem", "Network", "Process Space"];

  // Speed indicator
  const speedOpacity = interpolate(frame, [310, 320], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Ephemeral death
  const deathProgress = interpolate(frame, [340, 370], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const containerDying = interpolate(frame, [340, 370], [1, 0], clamp);
  const containerGray = interpolate(frame, [340, 370], [0, 1], clamp);

  // Volume mount
  const volumeEnter = interpolate(frame, [375, 395], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const volumeSlide = interpolate(frame, [375, 395], [40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const volumeGlow = interpolate(frame, [395, 410], [0, 1], clamp);

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ===== SCENE 1: Building the Image ===== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          opacity: scene1Opacity,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            fontSize: 28,
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: -0.5,
            marginBottom: 12,
          }}
        >
          How a Docker Container is Born
        </div>
        <div
          style={{
            opacity: titleOpacity * 0.7,
            fontSize: 15,
            color: "#64748b",
            marginBottom: 50,
          }}
        >
          From Dockerfile to running container
        </div>

        {/* Main content: Dockerfile left, Layer Stack center-right */}
        <div style={{ display: "flex", gap: 80, flex: 1, alignItems: "center" }}>
          {/* Dockerfile */}
          <div
            style={{
              opacity: dockerfileEnter,
              transform: `translateY(${dockerfileSlide}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: 380,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${colors.cyan}20, ${colors.cyan}08)`,
                  border: `1.5px solid ${colors.cyan}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 15px ${colors.cyan}15`,
                }}
              >
                <File size={28} color={colors.cyan} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${colors.cyan}60)` }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>Dockerfile</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Text file with instructions</div>
              </div>
            </div>

            {/* Dockerfile commands */}
            {layers.map((layer, i) => {
              const cmdOpacity = interpolate(frame, [layerStartFrames[i] - 10, layerStartFrames[i]], [0, 1], clamp);
              const isRebuilding = i === 1 && rebuildPulse > 0;
              return (
                <div
                  key={i}
                  style={{
                    opacity: cmdOpacity,
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 14,
                    fontWeight: 600,
                    color: layer.color,
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: isRebuilding ? `${layer.color}18` : `${layer.color}08`,
                    border: `1px solid ${isRebuilding ? `${layer.color}40` : `${layer.color}15`}`,
                    boxShadow: isRebuilding ? `0 0 20px ${layer.color}30` : "none",
                    transition: "none",
                  }}
                >
                  {layer.command}
                </div>
              );
            })}

            {/* Build command */}
            <div
              style={{
                opacity: buildCmdOpacity,
                fontFamily: "'SF Mono', monospace",
                fontSize: 15,
                fontWeight: 700,
                color: colors.purple,
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Lightning size={18} color={colors.purple} weight="duotone" />
              docker build .
            </div>
          </div>

          {/* Layer Stack — builds vertically */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            {/* "Image" label */}
            <div
              style={{
                opacity: totalReveal,
                fontSize: 13,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Docker Image
            </div>

            {/* The stack container */}
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                gap: 6,
                padding: 32,
                borderRadius: 12,
                border: `1px solid ${totalReveal > 0.5 ? "#3b82f630" : "#1a1a2e"}`,
                background: totalReveal > 0.5 ? "#3b82f606" : "transparent",
                minWidth: 500,
              }}
            >
              {layers.map((layer, i) => {
                const enter = interpolate(frame, [layerStartFrames[i], layerStartFrames[i] + layerDuration], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
                const slideUp = interpolate(frame, [layerStartFrames[i], layerStartFrames[i] + layerDuration], [30, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
                // Width proportional to size (200MB = full width, 5MB = narrow)
                const maxBarWidth = 440;
                const barWidth = Math.max(60, (layer.size / 200) * maxBarWidth);

                const isCached = cachePhase > 0 && i !== 1;
                const isRebuilding = i === 1 && rebuildPulse > 0;

                return (
                  <div
                    key={i}
                    style={{
                      opacity: enter,
                      transform: `translateY(${slideUp}px)`,
                      width: barWidth,
                      height: layer.size > 100 ? 110 : layer.size > 20 ? 60 : 36,
                      borderRadius: 10,
                      background: isCached
                        ? `linear-gradient(135deg, ${layer.color}12, ${layer.color}06)`
                        : `linear-gradient(135deg, ${layer.color}25, ${layer.color}10)`,
                      border: `1.5px solid ${isRebuilding ? `${layer.color}60` : isCached ? `${layer.color}20` : `${layer.color}35`}`,
                      boxShadow: isRebuilding
                        ? `0 0 25px ${layer.color}40`
                        : isCached
                          ? "none"
                          : `0 0 15px ${layer.color}15`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      position: "relative",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: layer.color, letterSpacing: 0.5 }}>
                      {layer.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#e2e8f0",
                        textShadow: `0 0 20px ${layer.color}40`,
                      }}
                    >
                      {layer.size}MB
                    </div>
                    {/* Cache badge */}
                    {isCached && cachePhase > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          right: -12,
                          top: -8,
                          fontSize: 10,
                          fontWeight: 700,
                          color: colors.green,
                          background: `${colors.green}15`,
                          border: `1px solid ${colors.green}30`,
                          borderRadius: 6,
                          padding: "2px 8px",
                          opacity: cachePhase,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        CACHED
                      </div>
                    )}
                    {/* Rebuild badge */}
                    {isRebuilding && (
                      <div
                        style={{
                          position: "absolute",
                          right: -16,
                          top: -8,
                          fontSize: 10,
                          fontWeight: 700,
                          color: colors.orange,
                          background: `${colors.orange}15`,
                          border: `1px solid ${colors.orange}30`,
                          borderRadius: 6,
                          padding: "2px 8px",
                          opacity: rebuildPulse,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        REBUILD
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total size */}
            <div
              style={{
                opacity: totalReveal,
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
              }}
            >
              <HardDrives size={22} color={colors.blue} weight="duotone" />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  textShadow: `0 0 30px ${colors.blue}30`,
                }}
              >
                {totalMB}MB
              </span>
              <span style={{ fontSize: 14, color: "#64748b" }}>total image size</span>
            </div>

            {/* Cache explanation */}
            {cachePhase > 0 && (
              <div
                style={{
                  opacity: cachePhase,
                  fontSize: 14,
                  color: "#94a3b8",
                  textAlign: "center",
                  maxWidth: 400,
                  lineHeight: 1.5,
                  marginTop: 4,
                }}
              >
                Change your code? Only the <span style={{ color: colors.green, fontWeight: 600 }}>COPY</span> layer rebuilds.
                <br />
                <span style={{ color: colors.orange, fontWeight: 600 }}>npm install</span> stays cached.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== SCENE 2: Running the Container ===== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: scene2Opacity,
        }}
      >
        {/* docker run command */}
        <div
          style={{
            opacity: dockerRunCmd,
            fontFamily: "'SF Mono', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: colors.purple,
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Lightning size={22} color={colors.purple} weight="duotone" />
          docker run → creates container
        </div>

        {/* Container + Volume row */}
        <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
          {/* The Container */}
          <div
            style={{
              opacity: containerBoxOpacity * containerDying,
              transform: `scale(${containerScale})`,
              filter: `grayscale(${containerGray * 100}%)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              padding: "40px 50px",
              borderRadius: 12,
              border: `2px solid ${containerDying > 0.3 ? `${colors.cyan}40` : `${colors.red}30`}`,
              background: `${colors.cyan}06`,
              boxShadow: containerDying > 0.5 ? `0 0 30px ${colors.cyan}15` : "none",
              minWidth: 420,
              position: "relative",
            }}
          >
            {/* Container label */}
            <div
              style={{
                position: "absolute",
                top: -14,
                left: 24,
                fontSize: 12,
                fontWeight: 700,
                color: colors.cyan,
                background: "#0f0f1a",
                padding: "2px 12px",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Container
            </div>

            {/* Container icon */}
            <Cube size={56} color={colors.cyan} weight="duotone" style={{ filter: `drop-shadow(0 0 12px ${colors.cyan}50)` }} />

            {/* Isolated properties */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              {containerProps.map((prop, i) => {
                const propEnter = interpolate(frame, [propStartFrame + i * 12, propStartFrame + i * 12 + 15], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
                const propSlide = interpolate(frame, [propStartFrame + i * 12, propStartFrame + i * 12 + 15], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
                return (
                  <div
                    key={i}
                    style={{
                      opacity: propEnter * containerDying,
                      transform: `translateY(${propSlide}px)`,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#e2e8f0",
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: `${colors.cyan}08`,
                      border: `1px solid ${colors.cyan}15`,
                    }}
                  >
                    {prop}
                  </div>
                );
              })}
            </div>

            {/* Start speed */}
            <div
              style={{
                opacity: speedOpacity * containerDying,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Lightning size={16} color={colors.green} weight="fill" />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.green,
                  textShadow: `0 0 20px ${colors.green}40`,
                }}
              >
                {"<"}1 second
              </span>
              <span style={{ fontSize: 13, color: "#64748b" }}>to start</span>
            </div>

            {/* Ephemeral warning */}
            {deathProgress > 0 && (
              <div
                style={{
                  opacity: deathProgress,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <Skull size={20} color={colors.red} weight="duotone" />
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.red }}>
                  Ephemeral — dies, everything gone
                </span>
              </div>
            )}
          </div>

          {/* Volume Mount */}
          <div
            style={{
              opacity: volumeEnter,
              transform: `translateY(${volumeSlide}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "40px 40px",
              borderRadius: 12,
              border: `2px solid ${colors.green}40`,
              background: `${colors.green}06`,
              boxShadow: `0 0 ${20 + volumeGlow * 20}px ${colors.green}${volumeGlow > 0.5 ? "25" : "10"}`,
              minWidth: 260,
              position: "relative",
            }}
          >
            {/* Volume label */}
            <div
              style={{
                position: "absolute",
                top: -14,
                left: 24,
                fontSize: 12,
                fontWeight: 700,
                color: colors.green,
                background: "#0f0f1a",
                padding: "2px 12px",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Volume Mount
            </div>

            <Database size={48} color={colors.green} weight="duotone" style={{ filter: `drop-shadow(0 0 12px ${colors.green}50)` }} />

            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", textAlign: "center" }}>
              Persistent Storage
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", maxWidth: 200, lineHeight: 1.5 }}>
              Survives container restarts
            </div>

            {/* Survives badge */}
            {volumeGlow > 0.5 && (
              <div
                style={{
                  opacity: interpolate(volumeGlow, [0.5, 1], [0, 1], clamp),
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.green,
                  background: `${colors.green}15`,
                  border: `1px solid ${colors.green}30`,
                  borderRadius: 8,
                  padding: "4px 14px",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                SURVIVES
              </div>
            )}
          </div>
        </div>

        {/* Explanation text at bottom */}
        {deathProgress > 0 && (
          <div
            style={{
              opacity: deathProgress,
              fontSize: 16,
              color: "#94a3b8",
              marginTop: 50,
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: 600,
            }}
          >
            Container filesystem is <span style={{ color: colors.red, fontWeight: 600 }}>ephemeral</span>.
            Mount <span style={{ color: colors.green, fontWeight: 600 }}>volumes</span> for data that must persist.
          </div>
        )}
      </div>
    </div>
  );
};

export default Generated_DockerContainerLifecycle;
