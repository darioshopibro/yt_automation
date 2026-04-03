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
const SEGMENT_START = 2550;
const SEGMENT_END = 4501;

const SCENE_1_START = 2550;
const SCENE_1_END = 3100;
const SCENE_2_START = 3100;
const SCENE_2_END = 3400;
const SCENE_3_START = 3400;
const SCENE_3_END = 4501;

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

// ─── TIMESTAMPS ─────────────────────────────────────────────
const timestamps = [
  { word: "virtualization,", start: 86.32 },
  { word: "virtual", start: 88.294 },
  { word: "machines,", start: 88.724 },
  { word: "resources", start: 89.549 },
  { word: "shared", start: 89.934 },
  { word: "host.", start: 90.41 },
  { word: "many", start: 91.596 },
  { word: "Docker", start: 91.794 },
  { word: "containers", start: 92.189 },
  { word: "few", start: 93.352 },
  { word: "virtual2", start: 93.539 },
  { word: "quarantine", start: 95.378 },
  { word: "hard", start: 97.147 },
  { word: "drive", start: 97.38 },
  { word: "memory,", start: 98.078 },
  { word: "processing", start: 98.497 },
  { word: "emulate", start: 99.497 },
  { word: "hardware,", start: 99.904 },
  { word: "boot", start: 100.846 },
  { word: "operating", start: 101.427 },
  { word: "system.", start: 101.904 },
  { word: "hypervisor.", start: 106.38 },
  { word: "Docker2", start: 107.461 },
  { word: "kernel,", start: 108.868 },
  { word: "bypassing", start: 109.484 },
  { word: "middleman", start: 109.937 },
  { word: "Linux", start: 110.775 },
  { word: "Windows", start: 112.032 },
  { word: "natively.", start: 117.891 },
  { word: "disk", start: 119.607 },
  { word: "space,", start: 119.827 },
  { word: "layered", start: 121.543 },
  { word: "file", start: 121.821 },
  { word: "system2.", start: 122.029 },
  { word: "base", start: 124.373 },
  { word: "image,", start: 124.732 },
  { word: "single", start: 125.57 },
  { word: "copy", start: 125.93 },
  { word: "shares", start: 149.037 },
];

// ─── HELPERS ────────────────────────────────────────────────
const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const fadeOut = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });

const slideUp = (frame: number, start: number, dur = 15, dist = 25) =>
  interpolate(frame, [start, start + dur], [dist, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

const sceneOpacity = (
  frame: number,
  sceneStart: number,
  sceneEnd: number,
  fi = 15,
  fo = 15
) => {
  const inOp = interpolate(frame, [sceneStart, sceneStart + fi], [0, 1], clamp);
  const outOp = interpolate(frame, [sceneEnd - fo, sceneEnd], [1, 0], clamp);
  return Math.min(inOp, outOp);
};

const f = (keyword: string, fps: number): number => {
  const w = timestamps.find((t) =>
    t.word.toLowerCase().includes(keyword.toLowerCase())
  );
  return w ? Math.round(w.start * fps) : SEGMENT_START;
};

// ─── SCENE 1: Split Screen VM vs Docker ────────────────────
const Scene1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sOp = sceneOpacity(frame, SCENE_1_START, SCENE_1_END);
  if (sOp <= 0) return null;

  const virtFrame = f("virtualization", fps) - 4;
  const vmFrame = f("machines,", fps) - 4;
  const resourcesFrame = f("resources", fps) - 4;
  const sharedFrame = f("shared", fps) - 4;
  const hostFrame = f("host.", fps) - 4;
  const manyFrame = f("many", fps) - 4;
  const containersFrame = f("containers", fps) - 4;
  const fewFrame = f("few", fps) - 4;
  const quarantineFrame = f("quarantine", fps) - 4;
  const hardFrame = f("hard", fps) - 4;
  const memoryFrame = f("memory,", fps) - 4;
  const processingFrame = f("processing", fps) - 4;
  const emulateFrame = f("emulate", fps) - 4;
  const bootFrame = f("boot", fps) - 4;
  const osFrame = f("operating", fps) - 4;

  // Title
  const titleOp = fadeIn(frame, virtFrame, 18);
  const titleSlide = slideUp(frame, virtFrame, 18);

  // VM side label
  const vmLabelOp = fadeIn(frame, vmFrame, 15);

  // Docker side label
  const dockerLabelOp = fadeIn(frame, sharedFrame, 15);

  // VM stack layers
  const vmLayers = [
    { label: "App", color: colors.blue, appearAt: vmFrame + 10 },
    { label: "Bins/Libs", color: colors.blue, appearAt: vmFrame + 18 },
    { label: "Guest OS", color: colors.orange, appearAt: bootFrame - 4 },
    { label: "Hypervisor", color: colors.red, appearAt: emulateFrame - 4 },
    { label: "Host OS", color: colors.amber, appearAt: osFrame - 4 },
    { label: "Hardware", color: "#64748b", appearAt: osFrame + 10 },
  ];

  // Docker stack layers
  const dockerLayers = [
    { label: "App", color: colors.green, appearAt: containersFrame },
    { label: "App", color: colors.green, appearAt: containersFrame + 8 },
    { label: "App", color: colors.green, appearAt: containersFrame + 16 },
    { label: "Docker Engine", color: colors.cyan, appearAt: sharedFrame },
    { label: "Host OS", color: colors.amber, appearAt: hostFrame },
    { label: "Hardware", color: "#64748b", appearAt: hostFrame + 10 },
  ];

  // Resource bars (quarantine visual)
  const resourceItems = [
    { label: "HDD", value: 80, color: colors.red, appearAt: hardFrame },
    { label: "RAM", value: 65, color: colors.orange, appearAt: memoryFrame },
    { label: "CPU", value: 70, color: colors.amber, appearAt: processingFrame },
  ];

  // "many containers" vs "few VMs" counter
  const manyOp = fadeIn(frame, manyFrame, 12);
  const fewOp = fadeIn(frame, fewFrame, 12);
  const dockerCount = Math.round(
    interpolate(frame, [manyFrame, manyFrame + 30], [0, 8], clamp)
  );
  const vmCount = Math.round(
    interpolate(frame, [fewFrame, fewFrame + 20], [0, 2], clamp)
  );

  const DesktopIcon = getIcon("DesktopTower");
  const CubeIcon = getIcon("Cube");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sOp,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleSlide}px)`,
          fontSize: 28,
          fontWeight: 700,
          color: "#e2e8f0",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "'SF Mono', monospace",
        }}
      >
        Virtualization Comparison
      </div>

      {/* Split screen */}
      <div
        style={{
          display: "flex",
          width: "100%",
          gap: 40,
          flex: 1,
          alignItems: "stretch",
        }}
      >
        {/* ── VM Side (Left) ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              opacity: vmLabelOp,
              fontSize: 20,
              fontWeight: 700,
              color: colors.red,
              fontFamily: "'SF Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <DesktopIcon size={24} color={colors.red} weight="duotone" />
            Virtual Machines
          </div>

          {/* VM Stack */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              width: "100%",
              maxWidth: 360,
            }}
          >
            {vmLayers.map((layer, i) => {
              const layerOp = fadeIn(frame, layer.appearAt, 12);
              const layerScale = spring({
                frame: Math.max(0, frame - layer.appearAt),
                fps,
                config: { damping: 22, stiffness: 180 },
              });
              return (
                <div
                  key={`vm-${i}`}
                  style={{
                    opacity: layerOp,
                    transform: `scaleX(${Math.min(layerScale, 1)})`,
                    padding: "14px 20px",
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${layer.color}18, ${layer.color}06)`,
                    border: `1px solid ${layer.color}35`,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {layer.label}
                </div>
              );
            })}
          </div>

          {/* Resources quarantined */}
          <div
            style={{
              opacity: fadeIn(frame, quarantineFrame, 15),
              display: "flex",
              flexDirection: "column",
              gap: 8,
              width: "100%",
              maxWidth: 360,
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${colors.red}25`,
              background: `${colors.red}08`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: colors.red,
                fontFamily: "'SF Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Quarantined Resources
            </div>
            {resourceItems.map((res) => {
              const barOp = fadeIn(frame, res.appearAt, 12);
              const barWidth = interpolate(
                frame,
                [res.appearAt, res.appearAt + 25],
                [0, res.value],
                { ...clamp, easing: Easing.out(Easing.cubic) }
              );
              return (
                <div
                  key={res.label}
                  style={{
                    opacity: barOp,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontFamily: "'SF Mono', monospace",
                      width: 30,
                    }}
                  >
                    {res.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      background: "#1a1a2e",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${res.color}, ${res.color}80)`,
                        boxShadow: `0 0 8px ${res.color}40`,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontFamily: "'SF Mono', monospace",
                      width: 35,
                    }}
                  >
                    {Math.round(barWidth)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Few VMs count */}
          <div
            style={{
              opacity: fewOp,
              fontSize: 36,
              fontWeight: 700,
              color: colors.red,
              fontFamily: "'SF Mono', monospace",
              textShadow: `0 0 20px ${colors.red}30`,
            }}
          >
            {vmCount} VMs
          </div>
        </div>

        {/* ── Center Divider ── */}
        <div
          style={{
            width: 2,
            background: `linear-gradient(180deg, transparent, #1a1a2e, transparent)`,
            opacity: fadeIn(frame, vmFrame, 20),
          }}
        />

        {/* ── Docker Side (Right) ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              opacity: dockerLabelOp,
              fontSize: 20,
              fontWeight: 700,
              color: colors.cyan,
              fontFamily: "'SF Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <CubeIcon size={24} color={colors.cyan} weight="duotone" />
            Docker Containers
          </div>

          {/* Docker Stack */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              width: "100%",
              maxWidth: 360,
            }}
          >
            {dockerLayers.map((layer, i) => {
              const layerOp = fadeIn(frame, layer.appearAt, 12);
              const layerScale = spring({
                frame: Math.max(0, frame - layer.appearAt),
                fps,
                config: { damping: 22, stiffness: 180 },
              });
              const isApp = layer.label === "App" && i < 3;
              return (
                <div
                  key={`docker-${i}`}
                  style={{
                    opacity: layerOp,
                    transform: `scaleX(${Math.min(layerScale, 1)})`,
                    padding: isApp ? "10px 20px" : "14px 20px",
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${layer.color}18, ${layer.color}06)`,
                    border: `1px solid ${layer.color}35`,
                    textAlign: "center",
                    fontSize: isApp ? 13 : 14,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {isApp ? `Container ${i + 1}` : layer.label}
                </div>
              );
            })}
          </div>

          {/* Shared resources label */}
          <div
            style={{
              opacity: fadeIn(frame, resourcesFrame, 15),
              padding: "10px 16px",
              borderRadius: 10,
              border: `1px solid ${colors.green}25`,
              background: `${colors.green}08`,
              fontSize: 13,
              color: colors.green,
              fontFamily: "'SF Mono', monospace",
              fontWeight: 600,
            }}
          >
            Resources shared with host
          </div>

          {/* Many containers count */}
          <div
            style={{
              opacity: manyOp,
              fontSize: 36,
              fontWeight: 700,
              color: colors.green,
              fontFamily: "'SF Mono', monospace",
              textShadow: `0 0 20px ${colors.green}30`,
            }}
          >
            {dockerCount} Containers
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SCENE 2: Docker → Kernel Direct Connection ────────────
const Scene2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sOp = sceneOpacity(frame, SCENE_2_START, SCENE_2_END);
  if (sOp <= 0) return null;

  const kernelFrame = f("kernel,", fps) - 4;
  const bypassFrame = f("bypassing", fps) - 4;
  const middlemanFrame = f("middleman", fps) - 4;
  const linuxFrame = f("Linux", fps) - 4;
  const windowsFrame = f("Windows", fps) - 4;
  const dockerFrame = f("Docker2", fps) - 4;
  const hypervisorFrame = f("hypervisor.", fps) - 4;

  const CpuIcon = getIcon("Cpu");
  const CubeIcon = getIcon("Cube");
  const LightningIcon = getIcon("Lightning");
  const ProhibitIcon = getIcon("Prohibit");
  const LinuxIcon = getIcon("LinuxLogo");
  const WindowsIcon = getIcon("WindowsLogo");
  const ShieldIcon = getIcon("ShieldCheck");

  // Docker box
  const dockerOp = fadeIn(frame, dockerFrame, 18);
  const dockerSlide = slideUp(frame, dockerFrame, 18);

  // Kernel box
  const kernelOp = fadeIn(frame, kernelFrame, 18);
  const kernelSlide = slideUp(frame, kernelFrame, 18);

  // Connection glow pulse between Docker and Kernel
  const connectionOp = fadeIn(frame, kernelFrame + 10, 15);
  const glowPulse =
    frame > kernelFrame + 10
      ? 0.6 + 0.4 * Math.sin((frame - kernelFrame) * 0.15)
      : 0;

  // Hypervisor (faded / crossed out)
  const hyperOp = fadeIn(frame, hypervisorFrame, 15);
  const hyperFade = interpolate(
    frame,
    [middlemanFrame, middlemanFrame + 20],
    [1, 0.25],
    clamp
  );

  // "Bypassing the middleman" label
  const bypassOp = fadeIn(frame, bypassFrame, 12);
  const bypassSlide = slideUp(frame, bypassFrame, 12);

  // Linux logo
  const linuxOp = fadeIn(frame, linuxFrame, 15);
  const linuxScale = spring({
    frame: Math.max(0, frame - linuxFrame),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Windows logo
  const windowsOp = fadeIn(frame, windowsFrame, 15);
  const windowsScale = spring({
    frame: Math.max(0, frame - windowsFrame),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sOp,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: fadeIn(frame, SCENE_2_START + 5, 18),
          transform: `translateY(${slideUp(frame, SCENE_2_START + 5, 18)}px)`,
          fontSize: 28,
          fontWeight: 700,
          color: "#e2e8f0",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "'SF Mono', monospace",
        }}
      >
        Native Kernel Access
      </div>

      {/* Main connection diagram */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
        }}
      >
        {/* Docker box */}
        <div
          style={{
            opacity: dockerOp,
            transform: `translateY(${dockerSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${colors.cyan}25, ${colors.cyan}08)`,
              border: `1.5px solid ${colors.cyan}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 35px ${colors.cyan}20`,
            }}
          >
            <CubeIcon size={60} color={colors.cyan} weight="duotone" />
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            Docker
          </span>
        </div>

        {/* Connection indicator */}
        <div
          style={{
            opacity: connectionOp,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <LightningIcon
            size={36}
            color={colors.green}
            weight="fill"
            style={{
              filter: `drop-shadow(0 0 ${10 + glowPulse * 15}px ${colors.green}70)`,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: colors.green,
              fontFamily: "'SF Mono', monospace",
            }}
          >
            DIRECT
          </span>
        </div>

        {/* Kernel box */}
        <div
          style={{
            opacity: kernelOp,
            transform: `translateY(${kernelSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
              background: `linear-gradient(135deg, ${colors.green}25, ${colors.green}08)`,
              border: `1.5px solid ${colors.green}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${20 + glowPulse * 20}px ${colors.green}${Math.round(20 + glowPulse * 20).toString(16).padStart(2, "0")}`,
            }}
          >
            <CpuIcon size={60} color={colors.green} weight="duotone" />
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            System Kernel
          </span>
        </div>
      </div>

      {/* Hypervisor (faded with strikethrough) */}
      <div
        style={{
          opacity: hyperOp * hyperFade,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 24px",
          borderRadius: 12,
          background: `${colors.red}08`,
          border: `1px solid ${colors.red}20`,
        }}
      >
        <ProhibitIcon
          size={22}
          color={colors.red}
          weight="bold"
          style={{
            opacity: fadeIn(frame, middlemanFrame, 10),
          }}
        />
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: `#e2e8f0${Math.round(hyperFade * 255).toString(16).padStart(2, "0")}`,
            fontFamily: "'SF Mono', monospace",
            textDecoration: hyperFade < 0.5 ? "line-through" : "none",
          }}
        >
          Hypervisor
        </span>
        <span
          style={{
            fontSize: 13,
            color: "#64748b",
            opacity: bypassOp,
          }}
        >
          (middleman bypassed)
        </span>
      </div>

      {/* Bypass label */}
      <div
        style={{
          opacity: bypassOp,
          transform: `translateY(${bypassSlide}px)`,
          fontSize: 15,
          color: colors.green,
          fontWeight: 600,
          fontFamily: "'SF Mono', monospace",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <ShieldIcon size={18} color={colors.green} weight="duotone" />
        Bypassing the middleman
      </div>

      {/* OS Logos */}
      <div
        style={{
          display: "flex",
          gap: 30,
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: linuxOp,
            transform: `scale(${Math.min(linuxScale, 1)})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "16px 28px",
            borderRadius: 12,
            background: `${colors.amber}08`,
            border: `1px solid ${colors.amber}25`,
          }}
        >
          <LinuxIcon size={36} color={colors.amber} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#e2e8f0",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            Linux
          </span>
          <span style={{ fontSize: 11, color: colors.green }}>
            Native
          </span>
        </div>

        <div
          style={{
            opacity: windowsOp,
            transform: `scale(${Math.min(windowsScale, 1)})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "16px 28px",
            borderRadius: 12,
            background: `${colors.blue}08`,
            border: `1px solid ${colors.blue}25`,
          }}
        >
          <WindowsIcon size={36} color={colors.blue} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#e2e8f0",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            Windows 10+
          </span>
          <span style={{ fontSize: 11, color: colors.green }}>
            Supported
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── SCENE 3: Layered File System ──────────────────────────
const Scene3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sOp = sceneOpacity(frame, SCENE_3_START, SCENE_3_END);
  if (sOp <= 0) return null;

  const diskFrame = f("disk", fps) - 4;
  const layeredFrame = f("layered", fps) - 4;
  const fileFrame = f("file", fps) - 4;
  const baseFrame = f("base", fps) - 4;
  const imageFrame = f("image,", fps) - 4;
  const singleFrame = f("single", fps) - 4;
  const copyFrame = f("copy", fps) - 4;
  const sharesFrame = f("shares", fps) - 4;

  const StackIcon = getIcon("Stack");
  const HardDriveIcon = getIcon("HardDrives");
  const CopyIcon = getIcon("CopySimple");
  const ShareIcon = getIcon("ShareNetwork");
  const FileIcon = getIcon("File");
  const CubeIcon = getIcon("Cube");

  // Title
  const titleOp = fadeIn(frame, SCENE_3_START + 5, 18);
  const titleSlide = slideUp(frame, SCENE_3_START + 5, 18);

  // "Less disk space" badge
  const diskOp = fadeIn(frame, diskFrame, 15);
  const diskSlide = slideUp(frame, diskFrame, 15);

  // Layer stack visual
  const layers = [
    { label: "Application Code", color: colors.blue, appearAt: layeredFrame + 20 },
    { label: "npm packages", color: colors.cyan, appearAt: layeredFrame + 30 },
    { label: "Node.js Runtime", color: colors.green, appearAt: layeredFrame + 40 },
    { label: "Ubuntu Base Image", color: colors.amber, appearAt: baseFrame - 4, isBase: true },
  ];

  // Second image stack (shares base)
  const image2Layers = [
    { label: "API Server Code", color: colors.purple, appearAt: imageFrame },
    { label: "pip packages", color: colors.pink, appearAt: imageFrame + 10 },
    { label: "Python Runtime", color: colors.orange, appearAt: imageFrame + 20 },
    { label: "Ubuntu Base Image", color: colors.amber, appearAt: imageFrame + 30, isBase: true },
  ];

  // "Single copy" highlight
  const singleOp = fadeIn(frame, singleFrame, 15);
  const singleScale = spring({
    frame: Math.max(0, frame - singleFrame),
    fps,
    config: { damping: 20, stiffness: 160 },
  });

  // Shares indicator
  const sharesOp = fadeIn(frame, sharesFrame, 15);
  const sharesGlow =
    frame > sharesFrame
      ? 0.5 + 0.5 * Math.sin((frame - sharesFrame) * 0.12)
      : 0;

  // Base image highlight glow
  const baseHighlight = fadeIn(frame, singleFrame, 20);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sOp,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleSlide}px)`,
          fontSize: 28,
          fontWeight: 700,
          color: "#e2e8f0",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "'SF Mono', monospace",
        }}
      >
        Layered File System
      </div>

      {/* Less disk space badge */}
      <div
        style={{
          opacity: diskOp,
          transform: `translateY(${diskSlide}px)`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 20px",
          borderRadius: 20,
          background: `${colors.green}12`,
          border: `1px solid ${colors.green}30`,
        }}
      >
        <HardDriveIcon size={18} color={colors.green} weight="duotone" />
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.green,
            fontFamily: "'SF Mono', monospace",
          }}
        >
          Less Disk Space
        </span>
      </div>

      {/* Two image stacks side by side */}
      <div
        style={{
          display: "flex",
          gap: 80,
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {/* Image 1 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              opacity: fadeIn(frame, layeredFrame, 15),
              fontSize: 15,
              fontWeight: 600,
              color: "#e2e8f0",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CubeIcon size={18} color={colors.blue} weight="duotone" />
            Web App Image
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {layers.map((layer, i) => {
              const layerOp = fadeIn(frame, layer.appearAt, 14);
              const layerScale = spring({
                frame: Math.max(0, frame - layer.appearAt),
                fps,
                config: { damping: 24, stiffness: 200 },
              });
              const isBaseHighlighted = layer.isBase && baseHighlight > 0;
              return (
                <div
                  key={`l1-${i}`}
                  style={{
                    opacity: layerOp,
                    transform: `scaleX(${Math.min(layerScale, 1)})`,
                    width: 300,
                    padding: "14px 20px",
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${layer.color}${isBaseHighlighted ? "25" : "15"}, ${layer.color}06)`,
                    border: `1.5px solid ${layer.color}${isBaseHighlighted ? "60" : "30"}`,
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    fontFamily: "'SF Mono', monospace",
                    boxShadow: isBaseHighlighted
                      ? `0 0 20px ${layer.color}30`
                      : "none",
                  }}
                >
                  {layer.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shared indicator between stacks */}
        <div
          style={{
            opacity: singleOp,
            transform: `scale(${Math.min(singleScale, 1)})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            alignSelf: "center",
          }}
        >
          <ShareIcon
            size={40}
            color={colors.amber}
            weight="duotone"
            style={{
              filter: `drop-shadow(0 0 ${8 + sharesGlow * 12}px ${colors.amber}60)`,
              opacity: sharesOp > 0 ? 1 : 0.7,
            }}
          />
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: colors.amber,
              fontFamily: "'SF Mono', monospace",
              textAlign: "center",
            }}
          >
            Single
            <br />
            Copy
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              textAlign: "center",
              maxWidth: 100,
            }}
          >
            Base shared across containers
          </div>
        </div>

        {/* Image 2 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              opacity: fadeIn(frame, imageFrame, 15),
              fontSize: 15,
              fontWeight: 600,
              color: "#e2e8f0",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CubeIcon size={18} color={colors.purple} weight="duotone" />
            API Server Image
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {image2Layers.map((layer, i) => {
              const layerOp = fadeIn(frame, layer.appearAt, 14);
              const layerScale = spring({
                frame: Math.max(0, frame - layer.appearAt),
                fps,
                config: { damping: 24, stiffness: 200 },
              });
              const isBaseHighlighted = layer.isBase && baseHighlight > 0;
              return (
                <div
                  key={`l2-${i}`}
                  style={{
                    opacity: layerOp,
                    transform: `scaleX(${Math.min(layerScale, 1)})`,
                    width: 300,
                    padding: "14px 20px",
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${layer.color}${isBaseHighlighted ? "25" : "15"}, ${layer.color}06)`,
                    border: `1.5px solid ${layer.color}${isBaseHighlighted ? "60" : "30"}`,
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    fontFamily: "'SF Mono', monospace",
                    boxShadow: isBaseHighlighted
                      ? `0 0 20px ${layer.color}30`
                      : "none",
                  }}
                >
                  {layer.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Efficiency summary */}
      <div
        style={{
          opacity: fadeIn(frame, copyFrame, 18),
          transform: `translateY(${slideUp(frame, copyFrame, 18)}px)`,
          display: "flex",
          gap: 30,
          alignItems: "center",
          padding: "14px 28px",
          borderRadius: 12,
          background: "#1a1a2e40",
          border: "1px solid #1a1a2e",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CopyIcon size={18} color={colors.green} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              color: "#e2e8f0",
              fontWeight: 600,
              fontFamily: "'SF Mono', monospace",
            }}
          >
            Deduplication
          </span>
        </div>
        <div
          style={{
            width: 1,
            height: 20,
            background: "#1a1a2e",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <StackIcon size={18} color={colors.cyan} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              color: "#94a3b8",
            }}
          >
            Layers reused efficiently
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────
const Generated_DockerVsVMs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
      <Scene1 frame={frame} fps={fps} />
      <Scene2 frame={frame} fps={fps} />
      <Scene3 frame={frame} fps={fps} />
    </div>
  );
};

export default Generated_DockerVsVMs;
