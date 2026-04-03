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
   Generated_WhatIsDocker
   "What is Docker?" — Intro segment
   Progressive build: title → container metaphor → deploy everywhere
   1920×1080 @ 30fps, frames 0–945
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

// ── Timestamp-synced frames (fps=30) ──
const TS = {
  what: 0,
  docker: 16,
  software: 65,
  development: 82,
  platform: 96,
  virtualization: 122,
  technology: 149,
  develop: 201,
  deploy: 225,
  containerized: 269,
  environments: 289,
  apps: 318,
  machine: 368,
  containers: 467,
  deployed: 475,
  compatibility: 531,
  system: 579,
  agnostic: 586,
  simpler: 652,
  maintain: 720,
  deployEnd: 762,
};

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

const scaleIn = (frame: number, start: number, fps: number) => {
  const s = spring({ frame, fps, from: 0, to: 1, config: { damping: 22, mass: 0.8, stiffness: 180 }, delay: start });
  return s;
};

const pulseGlow = (frame: number, speed = 0.05, min = 0.4, max = 1) =>
  min + (max - min) * (0.5 + 0.5 * Math.sin(frame * speed));

// ── Container Box Component ──
const ContainerBox: React.FC<{
  label: string;
  icon: string;
  color: string;
  frame: number;
  fps: number;
  appearFrame: number;
  size?: "normal" | "large";
}> = ({ label, icon, color, frame, fps, appearFrame, size = "normal" }) => {
  const scale = scaleIn(frame, appearFrame, fps);
  const opacity = interpolate(
    frame,
    [appearFrame - 3, appearFrame + 15],
    [0, 1],
    CLAMP
  );
  const IconComp = getIcon(icon);
  const isLarge = size === "large";
  const w = isLarge ? 200 : 160;
  const h = isLarge ? 140 : 110;

  return (
    <div
      style={{
        width: w,
        height: h,
        background: `${color}10`,
        border: `2px solid ${color}60`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity,
        transform: `scale(${scale})`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Container ridges (shipping container look) */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 8 + i * (isLarge ? 44 : 34),
            left: 0,
            right: 0,
            height: 1,
            background: `${color}20`,
          }}
        />
      ))}
      <IconComp size={isLarge ? 36 : 28} weight="duotone" color={color} />
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: isLarge ? 14 : 12,
          color: TEXT_PRIMARY,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── Machine Target Component ──
const MachineTarget: React.FC<{
  label: string;
  icon: string;
  color: string;
  frame: number;
  fps: number;
  appearFrame: number;
  hasContainer: boolean;
  containerFrame: number;
}> = ({ label, icon, color, frame, fps, appearFrame, hasContainer, containerFrame }) => {
  const { opacity, translateY } = fadeSlideIn(frame, appearFrame, 20, 30);
  const IconComp = getIcon(icon);
  const containerOpacity = interpolate(
    frame,
    [containerFrame, containerFrame + 15],
    [0, 1],
    CLAMP
  );
  const containerScale = scaleIn(frame, containerFrame, fps);
  const checkOpacity = interpolate(
    frame,
    [containerFrame + 20, containerFrame + 35],
    [0, 1],
    CLAMP
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Machine box */}
      <div
        style={{
          width: 200,
          height: 180,
          background: `${color}08`,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          position: "relative",
        }}
      >
        <IconComp size={30} weight="duotone" color={color} />
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 11,
            color: TEXT_SECONDARY,
            fontWeight: 500,
          }}
        >
          {label}
        </span>

        {/* Mini container inside machine */}
        {hasContainer && (
          <div
            style={{
              width: 120,
              height: 50,
              background: `${BLUE}15`,
              border: `1px solid ${BLUE}40`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: containerOpacity,
              transform: `scale(${containerScale})`,
            }}
          >
            <Cube size={16} weight="duotone" color={BLUE} />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 10,
                color: BLUE,
                fontWeight: 600,
              }}
            >
              CONTAINER
            </span>
          </div>
        )}

        {/* Check mark */}
        {hasContainer && (
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: 12,
              background: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: checkOpacity,
            }}
          >
            {React.createElement(getIcon("CheckCircle"), {
              size: 16,
              weight: "bold",
              color: "#fff",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ──
const Generated_WhatIsDocker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase control ──
  // Phase 1: Title (0–65) "What is Docker?"
  // Phase 2: Platform concept (65–225) software dev platform + virtualization
  // Phase 3: Container metaphor (225–467) develop, deploy, containerized environments
  // Phase 4: Runs everywhere (467–586) containers deployed, no compatibility issues
  // Phase 5: Benefits summary (586–945) simpler, maintain, deploy

  // ── Title animations ──
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], EASE_OUT);
  const titleScale = spring({
    frame,
    fps,
    from: 0.7,
    to: 1,
    config: { damping: 22, mass: 1, stiffness: 160 },
    delay: 0,
  });
  const questionMarkOpacity = interpolate(frame, [13, 25], [0, 1], CLAMP);
  const questionMarkRotate = interpolate(frame, [13, 30], [-15, 0], EASE_OUT);

  // Title shrinks and moves up when platform concept appears
  const titleShrink = interpolate(frame, [60, 85], [1, 0.7], EASE_OUT);
  const titleMoveUp = interpolate(frame, [60, 85], [0, -1], EASE_OUT);

  // ── Platform badges ──
  const platformBadges = [
    { label: "SOFTWARE DEV", icon: "Code", color: BLUE, frame: TS.software - 3 },
    { label: "PLATFORM", icon: "Stack", color: PURPLE, frame: TS.platform - 3 },
    { label: "VIRTUALIZATION", icon: "VirtualReality", color: CYAN, frame: TS.virtualization - 3 },
  ];

  // Fade out platform badges before container section
  const badgesOpacity = interpolate(frame, [195, 220], [1, 0], EASE_IN);

  // ── Container section ──
  const containerSectionOpacity = interpolate(
    frame,
    [TS.develop - 5, TS.develop + 15],
    [0, 1],
    CLAMP
  );

  // ── "Runs everywhere" label ──
  const everywhereOpacity = interpolate(
    frame,
    [TS.apps - 5, TS.apps + 15],
    [0, 1],
    CLAMP
  );

  // ── Deploy targets ──
  const machineTargets = [
    {
      label: "LAPTOP",
      icon: "Laptop",
      color: BLUE,
      appearFrame: TS.machine - 5,
      containerFrame: TS.containers - 3,
    },
    {
      label: "SERVER",
      icon: "HardDrives",
      color: GREEN,
      appearFrame: TS.machine + 20,
      containerFrame: TS.deployed - 3,
    },
    {
      label: "CLOUD",
      icon: "Cloud",
      color: PURPLE,
      appearFrame: TS.machine + 40,
      containerFrame: TS.deployed + 15,
    },
  ];

  // "No compatibility issues" badge
  const noCompatOpacity = interpolate(
    frame,
    [TS.compatibility - 3, TS.compatibility + 15],
    [0, 1],
    CLAMP
  );
  const noCompatScale = scaleIn(frame, TS.compatibility - 3, fps);

  // "System Agnostic" badge
  const agnosticOpacity = interpolate(
    frame,
    [TS.agnostic - 3, TS.agnostic + 15],
    [0, 1],
    CLAMP
  );

  // ── Benefits section (fade in machines, show summary) ──
  const benefitsOpacity = interpolate(
    frame,
    [TS.simpler - 10, TS.simpler + 10],
    [0, 1],
    CLAMP
  );

  const benefits = [
    { label: "Simpler to Use", icon: "Smiley", color: GREEN, frame: TS.simpler - 3 },
    { label: "Less Work to Develop", icon: "Wrench", color: BLUE, frame: TS.simpler + 40 },
    { label: "Easy to Maintain", icon: "ShieldCheck", color: AMBER, frame: TS.maintain - 3 },
    { label: "Easy to Deploy", icon: "RocketLaunch", color: PURPLE, frame: TS.deployEnd - 3 },
  ];

  // Phase transitions: fade out machines section when benefits come in
  const machinesSectionOpacity = interpolate(
    frame,
    [TS.simpler - 30, TS.simpler - 5],
    [1, 0],
    CLAMP
  );

  // Title completely fades when machines/benefits take over
  const titleFinalOpacity = interpolate(frame, [TS.simpler - 30, TS.simpler - 10], [1, 0.15], CLAMP);

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
          top: 200,
          left: 600,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `${BLUE}08`,
          filter: "blur(120px)",
          opacity: pulseGlow(frame, 0.02, 0.3, 0.7),
          pointerEvents: "none",
        }}
      />

      {/* ── TITLE SECTION ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: frame < TS.software ? 1 : 0,
          opacity: titleOpacity * titleFinalOpacity,
          transform: `scale(${titleScale * titleShrink}) translateY(${titleMoveUp * 80}px)`,
          transition: "flex 0s",
          marginBottom: frame >= TS.software ? 20 : 0,
          minHeight: frame >= TS.software ? 80 : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Docker whale icon */}
          <div
            style={{
              opacity: interpolate(frame, [5, 18], [0, 1], CLAMP),
              transform: `scale(${scaleIn(frame, 3, fps)})`,
            }}
          >
            {React.createElement(getIcon("Whale"), {
              size: frame < TS.software ? 72 : 48,
              weight: "duotone",
              color: BLUE,
            })}
          </div>
          <div>
            <span
              style={{
                fontSize: frame < TS.software ? 80 : 52,
                fontWeight: 800,
                color: TEXT_PRIMARY,
                letterSpacing: -2,
              }}
            >
              What is Docker
            </span>
            <span
              style={{
                fontSize: frame < TS.software ? 80 : 52,
                fontWeight: 800,
                color: BLUE,
                opacity: questionMarkOpacity,
                display: "inline-block",
                transform: `rotate(${questionMarkRotate}deg)`,
                marginLeft: 4,
              }}
            >
              ?
            </span>
          </div>
        </div>

        {/* Subtitle that appears with "software" */}
        {frame >= TS.software - 5 && frame < TS.simpler - 20 && (
          <div
            style={{
              marginTop: 12,
              opacity: interpolate(
                frame,
                [TS.software - 5, TS.software + 12],
                [0, 1],
                CLAMP
              ),
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: TEXT_DIM,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Software Development Platform
            </span>
          </div>
        )}
      </div>

      {/* ── PLATFORM BADGES ── */}
      {frame >= TS.software - 5 && frame < TS.develop && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginTop: 40,
            opacity: badgesOpacity,
          }}
        >
          {platformBadges.map((badge, i) => {
            const { opacity, translateY } = fadeSlideIn(frame, badge.frame, 18);
            const BadgeIcon = getIcon(badge.icon);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 28px",
                  background: `${badge.color}10`,
                  border: `1px solid ${badge.color}40`,
                  borderRadius: 12,
                  opacity,
                  transform: `translateY(${translateY}px)`,
                }}
              >
                <BadgeIcon size={28} weight="duotone" color={badge.color} />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 14,
                    color: badge.color,
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CONTAINER METAPHOR SECTION ── */}
      {frame >= TS.develop - 5 && frame < TS.simpler - 20 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            opacity: containerSectionOpacity * machinesSectionOpacity,
            gap: 40,
          }}
        >
          {/* Central container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* "Containerized Environment" label */}
            {frame >= TS.containerized - 5 && (
              <div
                style={{
                  opacity: interpolate(
                    frame,
                    [TS.containerized - 5, TS.containerized + 12],
                    [0, 1],
                    CLAMP
                  ),
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 13,
                    color: CYAN,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                  }}
                >
                  Containerized Environment
                </span>
              </div>
            )}

            {/* The main container visual */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 48,
              }}
            >
              {/* App inside container */}
              <ContainerBox
                label="YOUR APP"
                icon="AppWindow"
                color={BLUE}
                frame={frame}
                fps={fps}
                appearFrame={TS.develop - 3}
                size="large"
              />

              {/* Arrow to deploy */}
              {frame >= TS.deploy - 5 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    opacity: interpolate(
                      frame,
                      [TS.deploy - 5, TS.deploy + 12],
                      [0, 1],
                      CLAMP
                    ),
                  }}
                >
                  {React.createElement(getIcon("ArrowRight"), {
                    size: 40,
                    weight: "duotone",
                    color: GREEN,
                  })}
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 11,
                      color: GREEN,
                      fontWeight: 600,
                    }}
                  >
                    DEPLOY
                  </span>
                </div>
              )}

              {/* Dependencies container */}
              {frame >= TS.containerized - 3 && (
                <ContainerBox
                  label="+ DEPS"
                  icon="Package"
                  color={AMBER}
                  frame={frame}
                  fps={fps}
                  appearFrame={TS.containerized - 3}
                />
              )}
            </div>

            {/* "Apps run the same" label */}
            {frame >= TS.apps - 5 && (
              <div
                style={{
                  marginTop: 20,
                  padding: "10px 24px",
                  background: `${GREEN}10`,
                  border: `1px solid ${GREEN}30`,
                  borderRadius: 10,
                  opacity: everywhereOpacity,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 15,
                    color: GREEN,
                    fontWeight: 600,
                  }}
                >
                  Apps run the same no matter where they are
                </span>
              </div>
            )}
          </div>

          {/* ── DEPLOY TARGETS ── */}
          {frame >= TS.machine - 8 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 40,
              }}
            >
              {machineTargets.map((target, i) => (
                <MachineTarget
                  key={i}
                  label={target.label}
                  icon={target.icon}
                  color={target.color}
                  frame={frame}
                  fps={fps}
                  appearFrame={target.appearFrame}
                  hasContainer={frame >= target.containerFrame}
                  containerFrame={target.containerFrame}
                />
              ))}
            </div>
          )}

          {/* "No compatibility issues" + "System Agnostic" badges */}
          {frame >= TS.compatibility - 5 && (
            <div
              style={{
                display: "flex",
                gap: 24,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  padding: "10px 20px",
                  background: `${RED}10`,
                  border: `1px solid ${RED}30`,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: noCompatOpacity,
                  transform: `scale(${noCompatScale})`,
                }}
              >
                {React.createElement(getIcon("XCircle"), {
                  size: 20,
                  weight: "duotone",
                  color: RED,
                })}
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 13,
                    color: RED,
                    fontWeight: 600,
                    textDecoration: "line-through",
                  }}
                >
                  Compatibility Issues
                </span>
              </div>

              {frame >= TS.agnostic - 5 && (
                <div
                  style={{
                    padding: "10px 20px",
                    background: `${CYAN}10`,
                    border: `1px solid ${CYAN}30`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    opacity: agnosticOpacity,
                  }}
                >
                  {React.createElement(getIcon("Globe"), {
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
                    System Agnostic
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── BENEFITS SUMMARY SECTION ── */}
      {frame >= TS.simpler - 15 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            opacity: benefitsOpacity,
            gap: 40,
          }}
        >
          {/* Section title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {React.createElement(getIcon("Sparkle"), {
              size: 28,
              weight: "duotone",
              color: AMBER,
            })}
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: -0.5,
              }}
            >
              Why Docker?
            </span>
          </div>

          {/* Benefits grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              maxWidth: 800,
            }}
          >
            {benefits.map((benefit, i) => {
              const { opacity, translateY } = fadeSlideIn(
                frame,
                benefit.frame,
                20,
                20
              );
              const BenefitIcon = getIcon(benefit.icon);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "24px 32px",
                    background: `${benefit.color}08`,
                    border: `1px solid ${benefit.color}30`,
                    borderRadius: 12,
                    opacity,
                    transform: `translateY(${translateY}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${benefit.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BenefitIcon
                      size={26}
                      weight="duotone"
                      color={benefit.color}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {benefit.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Docker container badge at bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 24px",
              background: `${BLUE}10`,
              border: `1px solid ${BLUE}25`,
              borderRadius: 10,
              opacity: interpolate(
                frame,
                [TS.deployEnd - 3, TS.deployEnd + 15],
                [0, 1],
                CLAMP
              ),
            }}
          >
            {React.createElement(getIcon("Whale"), {
              size: 22,
              weight: "duotone",
              color: BLUE,
            })}
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                color: BLUE,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              DOCKER: DEVELOP. DEPLOY. RUN ANYWHERE.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_WhatIsDocker;
