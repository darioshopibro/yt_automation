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

// Brand colors
const BRAND = {
  primary: "#3b82f6",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  bg: "#030305",
  text: "#f8fafc",
};

// Design system colors
const BG = "#0f0f1a";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

// VM color = warm/heavy (orange-red)
const VM_COLOR = "#ef4444";
// Docker color = cool/light (blue-cyan)
const DOCKER_COLOR = BRAND.primary;
// Kernel color
const KERNEL_COLOR = "#22c55e";
// Hypervisor color
const HYPERVISOR_COLOR = "#f59e0b";
// Layer color
const LAYER_COLOR = "#a855f7";

/**
 * Estimated word-level timestamps (seconds from video start).
 * Segment: frames 2536–4574 @ 30fps = seconds 84.53–152.47
 * Total duration: ~67.9s
 *
 * These are estimated from natural speech pacing.
 * Each key moment is mapped to the approximate time the narrator says that word.
 */
const T = {
  // "Docker's a form of virtualization"
  dockerVirtualization: 84.5,
  // "but unlike virtual machines"
  unlikeVMs: 86.0,
  // "resources are shared directly with the host"
  sharedWithHost: 88.0,
  // "run many Docker containers"
  manyContainers: 91.0,
  // "only a few virtual machines"
  fewVMs: 93.5,
  // "A virtual machine has to quarantine off"
  vmQuarantine: 95.5,
  // "hard drive space, memory, and processing power"
  vmResources: 98.0,
  // "emulate hardware"
  emulateHardware: 100.5,
  // "boot an entire operating system"
  bootOS: 102.0,
  // "VM communicates with the host computer"
  vmCommunicates: 104.5,
  // "translator application... called a hypervisor"
  hypervisor: 107.5,
  // "Docker communicates natively with the system kernel"
  dockerKernel: 110.5,
  // "bypassing the middleman"
  bypassMiddleman: 113.0,
  // "Linux machines"
  linuxMachines: 114.5,
  // "Windows 10 and Windows Server 2016"
  windowsSupport: 116.5,
  // "run any version of Linux in a container"
  anyLinux: 119.5,
  // "run natively"
  runNatively: 121.0,
  // "Docker also uses less disk space"
  lessDiskSpace: 123.0,
  // "reuse files efficiently"
  reuseFiles: 125.5,
  // "layered file system"
  layeredFS: 127.0,
  // "multiple Docker images using the same base image"
  multipleImages: 129.5,
  // "single copy of the files"
  singleCopy: 132.0,
  // "share them with each container"
  shareContainers: 134.5,
};

// Convert seconds to frame number
const fps = 30;
const f = (seconds: number) => Math.round(seconds * fps);

// ============================================================
// SCENE DEFINITIONS
// Scene 1: VM Architecture (heavy, layered) — frames ~2536-3300
// Scene 2: Docker Architecture (light, direct) — frames ~3300-3750
// Scene 3: Layered File System — frames ~3750-4574
// ============================================================

const SCENE1_END = f(T.dockerKernel) - 15;
const SCENE2_END = f(T.lessDiskSpace) - 15;

// Helper: smooth appearance
const appear = (
  frame: number,
  startFrame: number,
  duration: number = 15
) => {
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [20, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  return { opacity, translateY };
};

// Helper: fade out
const fadeOut = (frame: number, startFrame: number, duration: number = 20) => {
  return interpolate(frame, [startFrame, startFrame + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
};

// Helper: scene transition (cross-fade)
const sceneOpacity = (
  frame: number,
  sceneStart: number,
  sceneEnd: number,
  fadeIn: number = 20,
  fadeOutDuration: number = 20
) => {
  const enterOpacity = interpolate(
    frame,
    [sceneStart, sceneStart + fadeIn],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitOpacity = interpolate(
    frame,
    [sceneEnd - fadeOutDuration, sceneEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return Math.min(enterOpacity, exitOpacity);
};

// ============================================================
// Layer Block component (reusable for architecture stacks)
// ============================================================
type LayerBlockProps = {
  label: string;
  color: string;
  width: number;
  height: number;
  opacity: number;
  translateY: number;
  glow?: boolean;
  icon?: string;
  sublabel?: string;
};

const LayerBlock: React.FC<LayerBlockProps> = ({
  label,
  color,
  width,
  height,
  opacity,
  translateY,
  glow = false,
  icon,
  sublabel,
}) => {
  const IconComp = icon ? getIcon(icon) : null;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 10,
        background: `${color}15`,
        border: `1.5px solid ${color}30`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        opacity,
        transform: `translateY(${translateY}px)`,
        boxShadow: glow ? `0 0 20px ${color}30` : "none",
        position: "relative",
      }}
    >
      {IconComp && (
        <IconComp
          size={22}
          color={color}
          weight="duotone"
          style={{ filter: `drop-shadow(0 0 6px ${color}50)` }}
        />
      )}
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: TEXT_PRIMARY,
          textAlign: "center",
        }}
      >
        {label}
      </span>
      {sublabel && (
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            color: TEXT_DIM,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
};

// ============================================================
// Main Component
// ============================================================
const Generated_DockerVsVMs: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();

  // ── SCENE 1: VM Architecture ──────────────────────────────
  // "Docker's a form of virtualization, but unlike VMs..."
  // Build up VM stack: Host OS → Hypervisor → VMs (each with Guest OS)
  const scene1Opacity = sceneOpacity(frame, f(T.dockerVirtualization) - 5, SCENE1_END);

  // Title appears first
  const titleAnim = appear(frame, f(T.dockerVirtualization));

  // "shared directly with host" → show host hardware/OS base
  const hostAnim = appear(frame, f(T.sharedWithHost) - 5);

  // "run many containers vs few VMs" → show count comparison
  const countAnim = appear(frame, f(T.manyContainers) - 3);

  // "quarantine off resources" → VM resource blocks appear
  const vmResourceAnim = appear(frame, f(T.vmQuarantine) - 3);

  // "emulate hardware, boot entire OS" → Guest OS layers
  const vmGuestAnim = appear(frame, f(T.emulateHardware) - 3);

  // "hypervisor" → hypervisor layer highlights
  const hypervisorAnim = appear(frame, f(T.hypervisor) - 5);
  const hypervisorGlow = interpolate(
    frame,
    [f(T.hypervisor), f(T.hypervisor) + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── SCENE 2: Docker Architecture ─────────────────────────
  const scene2Opacity = sceneOpacity(frame, SCENE1_END - 10, SCENE2_END);

  const dockerTitleAnim = appear(frame, f(T.dockerKernel) - 10);
  const kernelAnim = appear(frame, f(T.dockerKernel) - 3);
  const bypassAnim = appear(frame, f(T.bypassMiddleman) - 3);

  // "any version of Linux" → multiple container icons appear
  const linuxAnim = appear(frame, f(T.anyLinux) - 3);
  const nativelyAnim = appear(frame, f(T.runNatively) - 3);

  // Strikethrough hypervisor (bypassing middleman)
  const strikethroughProgress = interpolate(
    frame,
    [f(T.bypassMiddleman), f(T.bypassMiddleman) + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── SCENE 3: Layered File System ──────────────────────────
  const scene3Opacity = sceneOpacity(
    frame,
    SCENE2_END - 10,
    f(T.shareContainers) + 90,
    20,
    30
  );

  const layerTitleAnim = appear(frame, f(T.lessDiskSpace) - 3);
  const layeredFSAnim = appear(frame, f(T.layeredFS) - 3);
  const multiImageAnim = appear(frame, f(T.multipleImages) - 3);
  const singleCopyAnim = appear(frame, f(T.singleCopy) - 3);
  const shareAnim = appear(frame, f(T.shareContainers) - 3);

  // Shared base layer highlight
  const sharedGlow = interpolate(
    frame,
    [f(T.singleCopy), f(T.singleCopy) + 20],
    [0, 1],
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
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ═══════════════════════════════════════════════════
          SCENE 1: VM Architecture — Heavy Stacked Layers
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          opacity: scene1Opacity,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleAnim.opacity,
            transform: `translateY(${titleAnim.translateY}px)`,
            marginBottom: 50,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: TEXT_DIM,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Virtual Machine Architecture
          </span>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              marginTop: 8,
            }}
          >
            Why VMs Are{" "}
            <span style={{ color: VM_COLOR }}>Heavy</span>
          </div>
        </div>

        {/* VM Architecture Stack — bottom to top */}
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            alignItems: "center",
            gap: 8,
            width: 800,
          }}
        >
          {/* Hardware Layer */}
          <div style={{ opacity: hostAnim.opacity, transform: `translateY(${hostAnim.translateY}px)` }}>
            <LayerBlock
              label="Hardware"
              color={TEXT_DIM}
              width={760}
              height={50}
              opacity={1}
              translateY={0}
              icon="Cpu"
              sublabel="Physical Machine"
            />
          </div>

          {/* Host OS */}
          <div style={{ opacity: hostAnim.opacity, transform: `translateY(${hostAnim.translateY}px)` }}>
            <LayerBlock
              label="Host Operating System"
              color={BRAND.secondary}
              width={760}
              height={50}
              opacity={1}
              translateY={0}
              icon="Desktop"
            />
          </div>

          {/* Hypervisor (translator) */}
          <div style={{ opacity: hypervisorAnim.opacity, transform: `translateY(${hypervisorAnim.translateY}px)` }}>
            <LayerBlock
              label="Hypervisor"
              color={HYPERVISOR_COLOR}
              width={760}
              height={55}
              opacity={1}
              translateY={0}
              glow={hypervisorGlow > 0.5}
              icon="Translate"
              sublabel="Translator / Middleman"
            />
          </div>

          {/* VMs Row */}
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              opacity: vmResourceAnim.opacity,
              transform: `translateY(${vmResourceAnim.translateY}px)`,
            }}
          >
            {/* VM 1 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                gap: 4,
                padding: 12,
                borderRadius: 12,
                background: `${VM_COLOR}08`,
                border: `1px solid ${VM_COLOR}20`,
              }}
            >
              <LayerBlock
                label="Guest OS"
                color={VM_COLOR}
                width={220}
                height={42}
                opacity={vmGuestAnim.opacity}
                translateY={vmGuestAnim.translateY}
                icon="LinuxLogo"
              />
              <LayerBlock
                label="Bins/Libs"
                color={VM_COLOR}
                width={220}
                height={36}
                opacity={vmGuestAnim.opacity}
                translateY={vmGuestAnim.translateY}
              />
              <LayerBlock
                label="App 1"
                color={BRAND.primary}
                width={220}
                height={40}
                opacity={vmGuestAnim.opacity}
                translateY={vmGuestAnim.translateY}
                icon="Package"
              />
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: TEXT_DIM,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginTop: 4,
                }}
              >
                Virtual Machine 1
              </div>
            </div>

            {/* VM 2 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
                gap: 4,
                padding: 12,
                borderRadius: 12,
                background: `${VM_COLOR}08`,
                border: `1px solid ${VM_COLOR}20`,
              }}
            >
              <LayerBlock
                label="Guest OS"
                color={VM_COLOR}
                width={220}
                height={42}
                opacity={vmGuestAnim.opacity}
                translateY={vmGuestAnim.translateY}
                icon="WindowsLogo"
              />
              <LayerBlock
                label="Bins/Libs"
                color={VM_COLOR}
                width={220}
                height={36}
                opacity={vmGuestAnim.opacity}
                translateY={vmGuestAnim.translateY}
              />
              <LayerBlock
                label="App 2"
                color={BRAND.primary}
                width={220}
                height={40}
                opacity={vmGuestAnim.opacity}
                translateY={vmGuestAnim.translateY}
                icon="Package"
              />
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: TEXT_DIM,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginTop: 4,
                }}
              >
                Virtual Machine 2
              </div>
            </div>

            {/* Resource cost indicator */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 10,
                padding: "12px 20px",
                opacity: countAnim.opacity,
                transform: `translateY(${countAnim.translateY}px)`,
              }}
            >
              {[
                { label: "CPU", icon: "Cpu", value: "Dedicated" },
                { label: "RAM", icon: "Memory", value: "Reserved" },
                { label: "Disk", icon: "HardDrive", value: "Quarantined" },
              ].map((res, i) => {
                const ResIcon = getIcon(res.icon);
                const resAppear = appear(frame, f(T.vmResources) + i * 8);
                return (
                  <div
                    key={res.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: resAppear.opacity,
                      transform: `translateY(${resAppear.translateY}px)`,
                    }}
                  >
                    <ResIcon size={18} color={VM_COLOR} weight="duotone" />
                    <span
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 11,
                        color: VM_COLOR,
                        fontWeight: 600,
                      }}
                    >
                      {res.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SCENE 2: Docker Architecture — Lightweight
          Split screen: VM (faded) vs Docker (highlighted)
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          gap: 60,
          opacity: scene2Opacity,
        }}
      >
        {/* LEFT: VM (dimmed, crossed out hypervisor) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: 0.4,
            filter: "grayscale(0.6)",
          }}
        >
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: TEXT_DIM,
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            Virtual Machine
          </div>
          <LayerBlock label="App" color={TEXT_DIM} width={320} height={40} opacity={1} translateY={0} icon="Package" />
          <LayerBlock label="Guest OS" color={TEXT_DIM} width={320} height={40} opacity={1} translateY={0} icon="Desktop" />
          <LayerBlock label="Bins/Libs" color={TEXT_DIM} width={320} height={32} opacity={1} translateY={0} />
          {/* Hypervisor with strikethrough */}
          <div style={{ position: "relative" }}>
            <LayerBlock
              label="Hypervisor"
              color={HYPERVISOR_COLOR}
              width={320}
              height={44}
              opacity={0.5}
              translateY={0}
              icon="Translate"
              sublabel="Middleman"
            />
            {/* Strikethrough line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                height: 3,
                width: `${strikethroughProgress * 100}%`,
                background: VM_COLOR,
                borderRadius: 2,
                boxShadow: `0 0 10px ${VM_COLOR}60`,
              }}
            />
          </div>
          <LayerBlock label="Host OS" color={TEXT_DIM} width={320} height={40} opacity={1} translateY={0} icon="Desktop" />
          <LayerBlock label="Hardware" color={TEXT_DIM} width={320} height={36} opacity={1} translateY={0} icon="Cpu" />
        </div>

        {/* CENTER DIVIDER */}
        <div
          style={{
            width: 2,
            height: 500,
            background: `linear-gradient(transparent, ${BORDER}, transparent)`,
            opacity: dockerTitleAnim.opacity,
          }}
        />

        {/* RIGHT: Docker (bright, direct kernel connection) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: dockerTitleAnim.opacity,
            transform: `translateY(${dockerTitleAnim.translateY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: DOCKER_COLOR,
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            Docker
          </div>

          {/* Multiple containers (lightweight) */}
          <div
            style={{
              display: "flex",
              gap: 8,
              opacity: linuxAnim.opacity,
              transform: `translateY(${linuxAnim.translateY}px)`,
            }}
          >
            {["App 1", "App 2", "App 3", "App 4"].map((app, i) => {
              const containerAppear = appear(frame, f(T.dockerKernel) + 5 + i * 8);
              return (
                <div
                  key={app}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: `${DOCKER_COLOR}10`,
                    border: `1px solid ${DOCKER_COLOR}25`,
                    opacity: containerAppear.opacity,
                    transform: `translateY(${containerAppear.translateY}px)`,
                  }}
                >
                  {(() => {
                    const DockerIcon = getIcon("Package");
                    return (
                      <DockerIcon
                        size={20}
                        color={DOCKER_COLOR}
                        weight="duotone"
                        style={{ filter: `drop-shadow(0 0 4px ${DOCKER_COLOR}40)` }}
                      />
                    );
                  })()}
                  <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_PRIMARY }}>
                    {app}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Direct arrow to kernel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
              opacity: kernelAnim.opacity,
            }}
          >
            <div
              style={{
                width: 2,
                height: 30,
                background: `${KERNEL_COLOR}50`,
              }}
            />
            {(() => {
              const ArrowIcon = getIcon("ArrowDown");
              return (
                <ArrowIcon size={16} color={KERNEL_COLOR} weight="bold" />
              );
            })()}
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 10,
                color: KERNEL_COLOR,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 2,
              }}
            >
              Direct Access
            </span>
          </div>

          {/* Kernel */}
          <div style={{ opacity: kernelAnim.opacity, transform: `translateY(${kernelAnim.translateY}px)` }}>
            <LayerBlock
              label="System Kernel"
              color={KERNEL_COLOR}
              width={340}
              height={50}
              opacity={1}
              translateY={0}
              glow={bypassAnim.opacity > 0.5}
              icon="Terminal"
              sublabel="No Middleman"
            />
          </div>

          <div style={{ opacity: kernelAnim.opacity, transform: `translateY(${kernelAnim.translateY}px)` }}>
            <LayerBlock label="Host OS" color={BRAND.secondary} width={340} height={40} opacity={1} translateY={0} icon="Desktop" />
          </div>
          <div style={{ opacity: kernelAnim.opacity, transform: `translateY(${kernelAnim.translateY}px)` }}>
            <LayerBlock label="Hardware" color={TEXT_DIM} width={340} height={36} opacity={1} translateY={0} icon="Cpu" />
          </div>

          {/* "Runs natively" badge */}
          <div
            style={{
              marginTop: 12,
              padding: "6px 16px",
              borderRadius: 20,
              background: `${KERNEL_COLOR}15`,
              border: `1px solid ${KERNEL_COLOR}30`,
              opacity: nativelyAnim.opacity,
              transform: `translateY(${nativelyAnim.translateY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                color: KERNEL_COLOR,
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Runs Natively on Linux
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          SCENE 3: Layered File System — Shared Base Layers
          ═══════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          opacity: scene3Opacity,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: layerTitleAnim.opacity,
            transform: `translateY(${layerTitleAnim.translateY}px)`,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: TEXT_DIM,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Layered File System
          </span>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              marginTop: 8,
            }}
          >
            Docker Reuses{" "}
            <span style={{ color: LAYER_COLOR }}>Shared Layers</span>
          </div>
        </div>

        {/* Three images sharing a base */}
        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "flex-end",
            opacity: layeredFSAnim.opacity,
            transform: `translateY(${layeredFSAnim.translateY}px)`,
          }}
        >
          {[
            { name: "Image A", appColor: BRAND.primary, layers: ["App Layer A", "Deps A"] },
            { name: "Image B", appColor: BRAND.secondary, layers: ["App Layer B", "Deps B"] },
            { name: "Image C", appColor: BRAND.accent, layers: ["App Layer C", "Deps C"] },
          ].map((img, imgIdx) => {
            const imgAppear = appear(frame, f(T.multipleImages) + imgIdx * 12);
            return (
              <div
                key={img.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  opacity: imgAppear.opacity,
                  transform: `translateY(${imgAppear.translateY}px)`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: img.appColor,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  {img.name}
                </div>
                {/* Unique layers (per image) */}
                {img.layers.map((layer, layerIdx) => (
                  <div
                    key={layer}
                    style={{
                      width: 200,
                      height: 36,
                      borderRadius: 8,
                      background: `${img.appColor}12`,
                      border: `1px solid ${img.appColor}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: TEXT_SECONDARY,
                      }}
                    >
                      {layer}
                    </span>
                  </div>
                ))}
                {/* Connector to shared base */}
                <div
                  style={{
                    width: 2,
                    height: 20,
                    background: `${LAYER_COLOR}30`,
                    opacity: singleCopyAnim.opacity,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Shared Base Layer — ONE copy */}
        <div
          style={{
            marginTop: 8,
            opacity: singleCopyAnim.opacity,
            transform: `translateY(${singleCopyAnim.translateY}px)`,
          }}
        >
          <div
            style={{
              width: 740,
              padding: "16px 24px",
              borderRadius: 12,
              background: `${LAYER_COLOR}12`,
              border: `1.5px solid ${LAYER_COLOR}${sharedGlow > 0.5 ? "40" : "20"}`,
              boxShadow: sharedGlow > 0.5 ? `0 0 25px ${LAYER_COLOR}25` : "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {(() => {
              const LayersIcon = getIcon("Stack");
              return (
                <LayersIcon
                  size={28}
                  color={LAYER_COLOR}
                  weight="duotone"
                  style={{ filter: `drop-shadow(0 0 8px ${LAYER_COLOR}50)` }}
                />
              );
            })()}
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: TEXT_PRIMARY,
              }}
            >
              Shared Base Image
            </span>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 11,
                color: LAYER_COLOR,
                fontWeight: 600,
              }}
            >
              Single Copy — Shared Across All Containers
            </span>
          </div>
        </div>

        {/* "Less disk space" indicator */}
        <div
          style={{
            marginTop: 30,
            display: "flex",
            gap: 40,
            opacity: shareAnim.opacity,
            transform: `translateY(${shareAnim.translateY}px)`,
          }}
        >
          {/* Without Docker (wasteful) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 10,
                color: TEXT_DIM,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Without Sharing
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 50,
                    height: 24,
                    borderRadius: 6,
                    background: `${VM_COLOR}20`,
                    border: `1px solid ${VM_COLOR}25`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color: VM_COLOR, fontWeight: 600 }}>
              3x Disk Space
            </span>
          </div>

          {/* VS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              color: TEXT_DIM,
              fontWeight: 700,
            }}
          >
            vs
          </div>

          {/* With Docker (efficient) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 10,
                color: TEXT_DIM,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              With Docker Layers
            </span>
            <div
              style={{
                width: 50,
                height: 24,
                borderRadius: 6,
                background: `${KERNEL_COLOR}20`,
                border: `1px solid ${KERNEL_COLOR}25`,
              }}
            />
            <span style={{ fontSize: 11, color: KERNEL_COLOR, fontWeight: 600 }}>
              1x Disk Space
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_DockerVsVMs;
