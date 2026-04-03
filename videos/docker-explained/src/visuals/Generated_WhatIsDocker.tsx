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
  background: "#030305",
  text: "#f8fafc",
};

// Estimated word-level timestamps for segment 1 (0:00 - 33.47s)
// Based on natural speech pacing of the transcript
const timestamps = [
  { word: "What", start: 0.1, end: 0.3 },
  { word: "is", start: 0.3, end: 0.4 },
  { word: "Docker?", start: 0.4, end: 0.9 },
  { word: "Docker's", start: 1.1, end: 1.5 },
  { word: "a", start: 1.5, end: 1.6 },
  { word: "software", start: 1.6, end: 2.1 },
  { word: "development", start: 2.1, end: 2.7 },
  { word: "platform", start: 2.7, end: 3.2 },
  { word: "and", start: 3.3, end: 3.5 },
  { word: "a", start: 3.5, end: 3.6 },
  { word: "virtualization", start: 3.6, end: 4.4 },
  { word: "technology", start: 4.4, end: 5.0 },
  { word: "that", start: 5.1, end: 5.3 },
  { word: "makes", start: 5.3, end: 5.5 },
  { word: "it", start: 5.5, end: 5.6 },
  { word: "easy", start: 5.6, end: 5.9 },
  { word: "for", start: 5.9, end: 6.0 },
  { word: "us", start: 6.0, end: 6.2 },
  { word: "to", start: 6.2, end: 6.3 },
  { word: "develop", start: 6.3, end: 6.8 },
  { word: "and", start: 6.8, end: 6.9 },
  { word: "deploy", start: 6.9, end: 7.3 },
  { word: "apps", start: 7.3, end: 7.7 },
  { word: "inside", start: 7.8, end: 8.1 },
  { word: "of", start: 8.1, end: 8.2 },
  { word: "neatly", start: 8.2, end: 8.6 },
  { word: "packaged", start: 8.6, end: 9.1 },
  { word: "virtual", start: 9.1, end: 9.5 },
  { word: "containerized", start: 9.5, end: 10.3 },
  { word: "environments.", start: 10.3, end: 11.0 },
  { word: "This", start: 11.3, end: 11.5 },
  { word: "means", start: 11.5, end: 11.8 },
  { word: "apps", start: 11.8, end: 12.1 },
  { word: "run", start: 12.1, end: 12.3 },
  { word: "the", start: 12.3, end: 12.4 },
  { word: "same", start: 12.4, end: 12.7 },
  { word: "no", start: 12.8, end: 12.9 },
  { word: "matter", start: 12.9, end: 13.2 },
  { word: "where", start: 13.2, end: 13.5 },
  { word: "they", start: 13.5, end: 13.7 },
  { word: "are", start: 13.7, end: 13.9 },
  { word: "or", start: 14.0, end: 14.1 },
  { word: "what", start: 14.1, end: 14.3 },
  { word: "machine", start: 14.3, end: 14.7 },
  { word: "they're", start: 14.7, end: 15.0 },
  { word: "running", start: 15.0, end: 15.3 },
  { word: "on.", start: 15.3, end: 15.6 },
  { word: "Docker", start: 15.9, end: 16.3 },
  { word: "containers", start: 16.3, end: 16.9 },
  { word: "can", start: 16.9, end: 17.1 },
  { word: "be", start: 17.1, end: 17.2 },
  { word: "deployed", start: 17.2, end: 17.7 },
  { word: "to", start: 17.7, end: 17.8 },
  { word: "just", start: 17.8, end: 18.0 },
  { word: "about", start: 18.0, end: 18.2 },
  { word: "any", start: 18.2, end: 18.5 },
  { word: "machine", start: 18.5, end: 18.9 },
  { word: "without", start: 18.9, end: 19.3 },
  { word: "compatibility", start: 19.3, end: 20.0 },
  { word: "issues,", start: 20.0, end: 20.4 },
  { word: "so", start: 20.5, end: 20.7 },
  { word: "your", start: 20.7, end: 20.8 },
  { word: "software", start: 20.8, end: 21.3 },
  { word: "stays", start: 21.3, end: 21.6 },
  { word: "system", start: 21.6, end: 22.0 },
  { word: "agnostic.", start: 22.0, end: 22.6 },
  { word: "This", start: 23.0, end: 23.2 },
  { word: "makes", start: 23.2, end: 23.5 },
  { word: "software", start: 23.5, end: 24.0 },
  { word: "simpler", start: 24.0, end: 24.5 },
  { word: "to", start: 24.5, end: 24.6 },
  { word: "use,", start: 24.6, end: 24.9 },
  { word: "less", start: 25.0, end: 25.2 },
  { word: "work", start: 25.2, end: 25.5 },
  { word: "to", start: 25.5, end: 25.6 },
  { word: "develop,", start: 25.6, end: 26.1 },
  { word: "and", start: 26.2, end: 26.4 },
  { word: "easier", start: 26.4, end: 26.8 },
  { word: "to", start: 26.8, end: 26.9 },
  { word: "maintain", start: 26.9, end: 27.4 },
  { word: "and", start: 27.4, end: 27.6 },
  { word: "deploy.", start: 27.6, end: 28.2 },
];

const fps = 30;

const frameFor = (keyword: string, nth = 0): number => {
  let count = 0;
  for (const t of timestamps) {
    if (t.word.toLowerCase().includes(keyword.toLowerCase())) {
      if (count === nth) return Math.round(t.start * fps);
      count++;
    }
  }
  return 0;
};

// ============================================================
// KEY FRAMES derived from timestamps
// ============================================================
const TITLE_IN = frameFor("What");                    // "What is Docker?"
const PLATFORM_IN = frameFor("platform");             // "software development platform"
const VIRTUALIZATION_IN = frameFor("virtualization");  // "virtualization technology"
const EASY_IN = frameFor("easy");                     // "makes it easy"
const DEVELOP_IN = frameFor("develop");               // "develop and deploy"
const DEPLOY_IN = frameFor("deploy");                 // "deploy apps"
const CONTAINERIZED_IN = frameFor("containerized");   // "containerized environments"
const SAME_IN = frameFor("same");                     // "apps run the same"
const MACHINE_IN = frameFor("machine");               // "what machine they're running on"
const CONTAINERS_IN = frameFor("containers");         // "Docker containers"
const ANY_MACHINE_IN = frameFor("any");               // "just about any machine"
const AGNOSTIC_IN = frameFor("agnostic");             // "system agnostic"
const SIMPLER_IN = frameFor("simpler");               // "simpler to use"
const LESS_WORK_IN = frameFor("less");                // "less work"
const EASIER_IN = frameFor("easier");                 // "easier to maintain"

// ============================================================
// HELPER: smooth entrance
// ============================================================
const fadeSlideIn = (
  frame: number,
  startFrame: number,
  duration = 15,
  slideDistance = 25
) => {
  const opacity = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [slideDistance, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );
  return { opacity, translateY };
};

const fadeIn = (frame: number, startFrame: number, duration = 15) => {
  return interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

// ============================================================
// COMPONENT
// ============================================================
const Generated_WhatIsDocker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();

  // --- SCENE 1: "What is Docker?" title + platform/virtualization concept ---
  // Frame ~0 to ~280 (0s to ~9.3s)

  const titleAnim = fadeSlideIn(frame, TITLE_IN, 18, 30);

  // Docker whale/container icon scales in
  const dockerIconScale = spring({
    frame: frame - TITLE_IN - 5,
    fps: videoFps,
    config: { damping: 22, stiffness: 180 },
  });

  // Two pillars: "Development Platform" and "Virtualization Technology"
  const pillar1Anim = fadeSlideIn(frame, PLATFORM_IN - 3, 18, 20);
  const pillar2Anim = fadeSlideIn(frame, VIRTUALIZATION_IN - 3, 18, 20);

  // "Easy to develop and deploy" — container forming animation
  const containerFormProgress = interpolate(
    frame,
    [EASY_IN, CONTAINERIZED_IN + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // App icon that goes into container
  const appOpacity = fadeIn(frame, DEVELOP_IN - 3, 12);
  const appIntoContainer = interpolate(
    frame,
    [DEPLOY_IN, DEPLOY_IN + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // --- SCENE 2: "Apps run the same" — deploy to multiple machines ---
  // Frame ~330 to ~660 (11s to 22s)

  const scene2Opacity = interpolate(
    frame,
    [SAME_IN - 10, SAME_IN],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Scene 1 fades as scene 2 comes in
  const scene1Fade = interpolate(
    frame,
    [SAME_IN - 15, SAME_IN],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Three machines appear one by one
  const machines = [
    { icon: "Laptop", label: "Laptop", color: BRAND.primary, delay: 0 },
    { icon: "Desktop", label: "Server", color: BRAND.secondary, delay: 12 },
    { icon: "Cloud", label: "Cloud", color: BRAND.accent, delay: 24 },
  ];

  // Container clones to each machine
  const containerCloneStart = MACHINE_IN;

  // Checkmarks appear on "without compatibility issues"
  const checkmarkStart = frameFor("without");

  // "System agnostic" highlight
  const agnosticGlow = interpolate(
    frame,
    [AGNOSTIC_IN - 3, AGNOSTIC_IN + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );

  // --- SCENE 3: Benefits summary ---
  // Frame ~690+ (23s+)

  const scene3Opacity = interpolate(
    frame,
    [SIMPLER_IN - 15, SIMPLER_IN - 3],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scene2Fade = interpolate(
    frame,
    [SIMPLER_IN - 15, SIMPLER_IN - 3],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const benefits = [
    { icon: "CheckCircle", label: "Simpler to Use", color: BRAND.primary, startFrame: SIMPLER_IN },
    { icon: "Wrench", label: "Less Work to Develop", color: BRAND.secondary, startFrame: LESS_WORK_IN },
    { icon: "Rocket", label: "Easier to Maintain & Deploy", color: BRAND.accent, startFrame: EASIER_IN },
  ];

  // Icons
  const PackageIcon = getIcon("Package");
  const CodeIcon = getIcon("Code");
  const MonitorIcon = getIcon("Monitor");
  const DockerIcon = getIcon("Cube"); // Using Cube as Docker container metaphor

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
      {/* Subtle gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 30%, ${BRAND.primary}08 0%, transparent 60%)`,
        }}
      />

      {/* ============ SCENE 1: What is Docker? ============ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          opacity: scene1Fade,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleAnim.opacity,
            transform: `translateY(${titleAnim.translateY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Docker container icon */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${BRAND.primary}25, ${BRAND.primary}08)`,
              border: `2px solid ${BRAND.primary}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${dockerIconScale})`,
              boxShadow: `0 0 40px ${BRAND.primary}20`,
            }}
          >
            <PackageIcon size={48} color={BRAND.primary} weight="duotone" />
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: BRAND.text,
              letterSpacing: -0.5,
              textAlign: "center",
            }}
          >
            What is Docker?
          </div>
        </div>

        {/* Two pillars: Platform + Virtualization */}
        <div
          style={{
            display: "flex",
            gap: 60,
            alignItems: "stretch",
          }}
        >
          {/* Development Platform Pillar */}
          <div
            style={{
              opacity: pillar1Anim.opacity,
              transform: `translateY(${pillar1Anim.translateY}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "28px 36px",
              borderRadius: 12,
              background: `${BRAND.primary}08`,
              border: `1px solid ${BRAND.primary}15`,
              minWidth: 260,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${BRAND.primary}20, ${BRAND.primary}08)`,
                border: `1.5px solid ${BRAND.primary}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 15px ${BRAND.primary}15`,
              }}
            >
              <CodeIcon size={28} color={BRAND.primary} weight="duotone" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", textAlign: "center" }}>
              Development Platform
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
              Build & ship applications
            </div>
          </div>

          {/* Virtualization Pillar */}
          <div
            style={{
              opacity: pillar2Anim.opacity,
              transform: `translateY(${pillar2Anim.translateY}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              padding: "28px 36px",
              borderRadius: 12,
              background: `${BRAND.secondary}08`,
              border: `1px solid ${BRAND.secondary}15`,
              minWidth: 260,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${BRAND.secondary}20, ${BRAND.secondary}08)`,
                border: `1.5px solid ${BRAND.secondary}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 15px ${BRAND.secondary}15`,
              }}
            >
              <MonitorIcon size={28} color={BRAND.secondary} weight="duotone" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", textAlign: "center" }}>
              Virtualization Technology
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
              Isolated containerized environments
            </div>
          </div>
        </div>

        {/* Container forming animation — appears when narrator says "containerized" */}
        <div
          style={{
            opacity: interpolate(frame, [EASY_IN - 3, EASY_IN + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* App icon */}
          <div
            style={{
              opacity: appOpacity,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `${BRAND.accent}15`,
                border: `1px solid ${BRAND.accent}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {React.createElement(getIcon("FileCode"), {
                size: 24,
                color: BRAND.accent,
                weight: "duotone",
              })}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Your App</div>
          </div>

          {/* Arrow flowing into container */}
          <div
            style={{
              width: interpolate(frame, [DEPLOY_IN, DEPLOY_IN + 15], [0, 60], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              }),
              height: 2,
              background: `linear-gradient(90deg, ${BRAND.accent}60, ${BRAND.primary}60)`,
              borderRadius: 1,
            }}
          />

          {/* Container box forming */}
          <div
            style={{
              width: 180,
              height: 80,
              borderRadius: 12,
              border: `2px solid ${BRAND.primary}${
                containerFormProgress > 0 ? Math.round(containerFormProgress * 60).toString(16).padStart(2, "0") : "00"
              }`,
              background: `${BRAND.primary}${
                containerFormProgress > 0 ? "0" + Math.round(containerFormProgress * 8).toString(16) : "00"
              }`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow:
                containerFormProgress > 0.5
                  ? `0 0 20px ${BRAND.primary}15`
                  : "none",
              transform: `scale(${interpolate(containerFormProgress, [0, 1], [0.9, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`,
            }}
          >
            <PackageIcon
              size={28}
              color={BRAND.primary}
              weight="duotone"
              style={{
                opacity: containerFormProgress,
                filter: `drop-shadow(0 0 8px ${BRAND.primary}60)`,
              }}
            />
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#e2e8f0",
                opacity: containerFormProgress,
              }}
            >
              Container
            </div>
          </div>
        </div>
      </div>

      {/* ============ SCENE 2: Runs the same everywhere ============ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          opacity: Math.min(scene2Opacity, scene2Fade),
        }}
      >
        {/* Central container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${BRAND.primary}20, ${BRAND.secondary}10)`,
              border: `2px solid ${BRAND.primary}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${BRAND.primary}20`,
            }}
          >
            <PackageIcon size={42} color={BRAND.primary} weight="duotone" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
            Docker Container
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            Runs the same everywhere
          </div>
        </div>

        {/* Connector dots flowing down */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: `${BRAND.primary}${Math.round(
                  interpolate(
                    frame,
                    [
                      containerCloneStart + i * 5,
                      containerCloneStart + i * 5 + 8,
                    ],
                    [0, 60],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  )
                )
                  .toString(16)
                  .padStart(2, "0")}`,
              }}
            />
          ))}
        </div>

        {/* Three machines */}
        <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
          {machines.map((m, i) => {
            const machineStart = ANY_MACHINE_IN - 5 + i * 12;
            const anim = fadeSlideIn(frame, machineStart, 18, 25);
            const MachineIcon = getIcon(m.icon);
            const CheckIcon = getIcon("CheckCircle");

            // Container appearing inside each machine
            const containerInMachine = interpolate(
              frame,
              [machineStart + 20, machineStart + 35],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              }
            );

            // Checkmark on "without compatibility issues"
            const checkOpacity = interpolate(
              frame,
              [checkmarkStart + i * 8, checkmarkStart + i * 8 + 12],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              }
            );

            return (
              <div
                key={i}
                style={{
                  opacity: anim.opacity,
                  transform: `translateY(${anim.translateY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  padding: "32px 40px",
                  borderRadius: 12,
                  background: `${m.color}06`,
                  border: `1px solid ${m.color}15`,
                  minWidth: 220,
                  position: "relative",
                }}
              >
                {/* Machine icon */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${m.color}18, ${m.color}06)`,
                    border: `1.5px solid ${m.color}25`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 15px ${m.color}12`,
                  }}
                >
                  <MachineIcon size={30} color={m.color} weight="duotone" />
                </div>

                <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>
                  {m.label}
                </div>

                {/* Mini container inside machine */}
                <div
                  style={{
                    opacity: containerInMachine,
                    transform: `scale(${interpolate(containerInMachine, [0, 1], [0.8, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })})`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 8,
                    background: `${BRAND.primary}10`,
                    border: `1px solid ${BRAND.primary}20`,
                  }}
                >
                  <PackageIcon size={16} color={BRAND.primary} weight="duotone" />
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: BRAND.primary,
                      fontFamily: "'SF Mono', monospace",
                    }}
                  >
                    SAME APP
                  </div>
                </div>

                {/* Checkmark */}
                <div
                  style={{
                    opacity: checkOpacity,
                    transform: `scale(${spring({
                      frame: frame - (checkmarkStart + i * 8),
                      fps: videoFps,
                      config: { damping: 20, stiffness: 200 },
                    })})`,
                  }}
                >
                  <CheckIcon size={24} color="#22c55e" weight="fill" />
                </div>
              </div>
            );
          })}
        </div>

        {/* "System Agnostic" badge */}
        <div
          style={{
            opacity: agnosticGlow,
            transform: `translateY(${interpolate(agnosticGlow, [0, 1], [10, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
            padding: "12px 32px",
            borderRadius: 10,
            background: `${BRAND.secondary}10`,
            border: `1px solid ${BRAND.secondary}25`,
            boxShadow: agnosticGlow > 0.5 ? `0 0 25px ${BRAND.secondary}15` : "none",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: BRAND.secondary,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            System Agnostic
          </div>
        </div>
      </div>

      {/* ============ SCENE 3: Benefits ============ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          opacity: scene3Opacity,
        }}
      >
        {/* Summary header */}
        <div
          style={{
            opacity: fadeIn(frame, SIMPLER_IN - 8, 12),
            fontSize: 24,
            fontWeight: 700,
            color: BRAND.text,
            letterSpacing: -0.3,
          }}
        >
          Why Docker?
        </div>

        {/* Benefits cards */}
        <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
          {benefits.map((b, i) => {
            const anim = fadeSlideIn(frame, b.startFrame - 3, 18, 30);
            const BenefitIcon = getIcon(b.icon);

            // Glow pulse on the active benefit
            const isActive = frame >= b.startFrame - 3 && frame < b.startFrame + 45;
            const glowIntensity = isActive
              ? interpolate(
                  frame,
                  [b.startFrame, b.startFrame + 20],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                )
              : 0;

            return (
              <div
                key={i}
                style={{
                  opacity: anim.opacity,
                  transform: `translateY(${anim.translateY}px)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 18,
                  padding: "36px 44px",
                  borderRadius: 12,
                  background: `${b.color}08`,
                  border: `1px solid ${b.color}${isActive ? "30" : "15"}`,
                  minWidth: 260,
                  boxShadow: glowIntensity > 0 ? `0 0 25px ${b.color}${Math.round(glowIntensity * 20).toString(16).padStart(2, "0")}` : "none",
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${b.color}20, ${b.color}08)`,
                    border: `1.5px solid ${b.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0 18px ${b.color}15`,
                  }}
                >
                  <BenefitIcon size={32} color={b.color} weight="duotone" />
                </div>

                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    textAlign: "center",
                  }}
                >
                  {b.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Generated_WhatIsDocker;
