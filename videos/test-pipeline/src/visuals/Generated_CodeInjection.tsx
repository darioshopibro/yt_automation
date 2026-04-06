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

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const colors = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#a855f7",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
};

// ── KEY FRAMES (global, from voiceover timestamps) ──
const F = {
  START: 2057,
  INJECT_CODE: 2068,
  YOUR_PROJECTS: 2107,
  EXTENSION: 2175,
  QUIETLY_MODIFIES: 2211,
  PACKAGE_JSON: 2231,
  DEPENDENCY: 2310,
  LEGITIMATE: 2384,
  BACKDOOR: 2408,
  DIFF_LOOKS: 2497,
  NORMAL_UPDATE: 2540,
  END: 2637,
};

// Scene boundaries
const SCENE2_START = 2370;

// ── package.json existing lines (placeholder content) ──
const existingLines = [
  { text: '{', indent: 0, mono: true },
  { text: '"name": "my-awesome-app",', indent: 1, mono: true },
  { text: '"version": "1.0.0",', indent: 1, mono: true },
  { text: '"dependencies": {', indent: 1, mono: true },
  { text: '"react": "^18.2.0",', indent: 2, mono: true },
  { text: '"next": "^14.0.0",', indent: 2, mono: true },
];

// The injected malicious line
const injectedLine = { text: '"@babel/helper-utils": "^7.23.1",', indent: 2, mono: true };

const closingLines = [
  { text: '}', indent: 1, mono: true },
  { text: '}', indent: 0, mono: true },
];

const Generated_CodeInjection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── SCENE OPACITIES ──
  const scene1Op = interpolate(frame, [SCENE2_START - 20, SCENE2_START], [1, 0], clamp);
  const scene2Op = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp);

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
      {/* ═══ SCENE 1: Extension modifies package.json ═══ */}
      {frame < SCENE2_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: scene1Op,
          }}
        >
          <Scene1_Injection frame={frame} fps={fps} />
        </div>
      )}

      {/* ═══ SCENE 2: Diff view — looks normal, hides backdoor ═══ */}
      {frame >= SCENE2_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: scene2Op,
          }}
        >
          <Scene2_DiffView frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Extension quietly modifies package.json
// ═══════════════════════════════════════════════════════════
const Scene1_Injection: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const PuzzleIcon = getIcon("PuzzlePiece");
  const SyringeIcon = getIcon("Syringe");
  const FileCodeIcon = getIcon("FileTs");
  const FolderIcon = getIcon("FolderOpen");

  // 🔊 SOUND: scene_start @ frame 2057 — segment title fades in
  const titleOp = interpolate(frame, [F.START, F.START + 15], [0, 1], clamp);
  const titleY = interpolate(frame, [F.START, F.START + 15], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 2068 — syringe icon slides in with "inject code"
  const syringeOp = interpolate(frame, [F.INJECT_CODE, F.INJECT_CODE + 15], [0, 1], clamp);
  const syringeScale = spring({
    frame: Math.max(0, frame - F.INJECT_CODE),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // 🔊 SOUND: element_appear @ frame 2107 — project folder icon appears
  const projectOp = interpolate(frame, [F.YOUR_PROJECTS, F.YOUR_PROJECTS + 15], [0, 1], clamp);
  const projectX = interpolate(frame, [F.YOUR_PROJECTS, F.YOUR_PROJECTS + 15], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 2175 — extension icon slides in
  const extOp = interpolate(frame, [F.EXTENSION, F.EXTENSION + 15], [0, 1], clamp);
  const extScale = spring({
    frame: Math.max(0, frame - F.EXTENSION),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Extension pulse (malicious intent)
  const extPulseOp = interpolate(frame, [F.EXTENSION + 20, F.EXTENSION + 35], [0.6, 0], clamp);
  const extPulseScale = interpolate(frame, [F.EXTENSION + 20, F.EXTENSION + 35], [1, 1.8], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 2211 — package.json file panel appears
  const fileOp = interpolate(frame, [F.QUIETLY_MODIFIES, F.QUIETLY_MODIFIES + 20], [0, 1], clamp);
  const fileY = interpolate(frame, [F.QUIETLY_MODIFIES, F.QUIETLY_MODIFIES + 20], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: reveal @ frame 2231 — "package.json" header glows
  const headerGlow = interpolate(frame, [F.PACKAGE_JSON, F.PACKAGE_JSON + 20], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Existing lines appear staggered
  const getLineOp = (index: number) => {
    const lineStart = F.QUIETLY_MODIFIES + 20 + index * 5;
    return interpolate(frame, [lineStart, lineStart + 10], [0, 1], clamp);
  };

  // 🔊 SOUND: reveal @ frame 2310 — malicious dependency line types in
  const injectedOp = interpolate(frame, [F.DEPENDENCY, F.DEPENDENCY + 20], [0, 1], clamp);
  const injectedChars = Math.round(
    interpolate(frame, [F.DEPENDENCY, F.DEPENDENCY + 40], [0, injectedLine.text.length], clamp)
  );
  const injectedGlow = interpolate(frame, [F.DEPENDENCY + 25, F.DEPENDENCY + 45], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Closing lines
  const closingOp = interpolate(frame, [F.DEPENDENCY + 45, F.DEPENDENCY + 55], [0, 1], clamp);

  // Top row: icons fade out as file takes over
  const topRowOp = interpolate(frame, [F.QUIETLY_MODIFIES - 10, F.QUIETLY_MODIFIES + 10], [1, 0], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: 1,
            fontFamily: "'SF Mono', monospace",
            textTransform: "uppercase",
          }}
        >
          Code Injection
        </span>
        <div
          style={{
            width: 60,
            height: 3,
            background: colors.red,
            margin: "12px auto 0",
            borderRadius: 2,
            boxShadow: `0 0 12px ${colors.red}60`,
          }}
        />
      </div>

      {/* Top Row: Syringe → Project → Extension (fades out before file appears) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 50,
          opacity: topRowOp,
          height: topRowOp > 0 ? "auto" : 0,
          overflow: "hidden",
        }}
      >
        {/* Syringe icon */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: syringeOp,
            transform: `scale(${syringeScale})`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${colors.red}20, ${colors.red}08)`,
              border: `1.5px solid ${colors.red}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${colors.red}20`,
            }}
          >
            <SyringeIcon size={36} color={colors.red} weight="duotone" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.red, fontFamily: "'SF Mono', monospace" }}>
            inject code
          </span>
        </div>

        {/* Arrow */}
        <div
          style={{
            width: 60,
            height: 2,
            background: `linear-gradient(90deg, ${colors.red}40, ${colors.amber}40)`,
            opacity: projectOp,
          }}
        />

        {/* Project folder */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: projectOp,
            transform: `translateX(${projectX}px)`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${colors.amber}20, ${colors.amber}08)`,
              border: `1.5px solid ${colors.amber}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${colors.amber}15`,
            }}
          >
            <FolderIcon size={36} color={colors.amber} weight="duotone" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>your project</span>
        </div>

        {/* Arrow */}
        <div
          style={{
            width: 60,
            height: 2,
            background: `linear-gradient(90deg, ${colors.amber}40, ${colors.purple}40)`,
            opacity: extOp,
          }}
        />

        {/* Malicious extension */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: extOp,
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }}>
            {/* Pulse ring */}
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: 20,
                border: `2px solid ${colors.purple}`,
                transform: `scale(${extPulseScale})`,
                opacity: extPulseOp,
              }}
            />
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${colors.purple}20, ${colors.purple}08)`,
                border: `1.5px solid ${colors.purple}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 15px ${colors.purple}20`,
                transform: `scale(${extScale})`,
              }}
            >
              <PuzzleIcon size={36} color={colors.purple} weight="duotone" />
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.purple, fontFamily: "'SF Mono', monospace" }}>
            extension
          </span>
        </div>
      </div>

      {/* ── PACKAGE.JSON FILE PANEL ── */}
      <div
        style={{
          opacity: fileOp,
          transform: `translateY(${fileY}px)`,
          width: "100%",
          maxWidth: 900,
          borderRadius: 12,
          background: "#12121f",
          border: `1px solid ${headerGlow > 0 ? `${colors.amber}${Math.round(headerGlow * 40).toString(16).padStart(2, "0")}` : "#1a1a2e"}`,
          overflow: "hidden",
          boxShadow: headerGlow > 0 ? `0 0 20px ${colors.amber}15` : "none",
        }}
      >
        {/* File header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 20px",
            borderBottom: "1px solid #1a1a2e",
            background: headerGlow > 0 ? `${colors.amber}08` : "transparent",
          }}
        >
          <FileCodeIcon size={18} color={colors.amber} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: headerGlow > 0 ? colors.amber : "#94a3b8",
              fontFamily: "'SF Mono', monospace",
              textShadow: headerGlow > 0.5 ? `0 0 10px ${colors.amber}40` : "none",
            }}
          >
            package.json
          </span>
        </div>

        {/* Code lines */}
        <div style={{ padding: "16px 0" }}>
          {/* Existing lines */}
          {existingLines.map((line, i) => (
            <div
              key={`existing-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "3px 20px 3px 0",
                opacity: getLineOp(i),
              }}
            >
              <span
                style={{
                  width: 50,
                  textAlign: "right",
                  fontSize: 12,
                  color: "#4a4a5e",
                  fontFamily: "'SF Mono', monospace",
                  paddingRight: 16,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  fontFamily: "'SF Mono', monospace",
                  paddingLeft: line.indent * 24,
                }}
              >
                {line.text}
              </span>
            </div>
          ))}

          {/* INJECTED MALICIOUS LINE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "3px 20px 3px 0",
              opacity: injectedOp,
              background: injectedGlow > 0
                ? `${colors.red}${Math.round(injectedGlow * 12).toString(16).padStart(2, "0")}`
                : "transparent",
              borderLeft: injectedGlow > 0.3 ? `3px solid ${colors.red}60` : "3px solid transparent",
            }}
          >
            <span
              style={{
                width: 50,
                textAlign: "right",
                fontSize: 12,
                color: injectedGlow > 0.5 ? colors.red : "#4a4a5e",
                fontFamily: "'SF Mono', monospace",
                paddingRight: 16,
                flexShrink: 0,
              }}
            >
              {existingLines.length + 1}
            </span>
            <span
              style={{
                fontSize: 14,
                color: injectedGlow > 0.5 ? "#e2e8f0" : colors.green,
                fontFamily: "'SF Mono', monospace",
                paddingLeft: injectedLine.indent * 24,
                textShadow: injectedGlow > 0.7 ? `0 0 8px ${colors.red}40` : "none",
              }}
            >
              {injectedLine.text.slice(0, injectedChars)}
              {injectedChars < injectedLine.text.length && (
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 16,
                    background: colors.green,
                    marginLeft: 1,
                    opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                  }}
                />
              )}
            </span>
          </div>

          {/* Closing lines */}
          {closingLines.map((line, i) => (
            <div
              key={`closing-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "3px 20px 3px 0",
                opacity: closingOp,
              }}
            >
              <span
                style={{
                  width: 50,
                  textAlign: "right",
                  fontSize: 12,
                  color: "#4a4a5e",
                  fontFamily: "'SF Mono', monospace",
                  paddingRight: 16,
                  flexShrink: 0,
                }}
              >
                {existingLines.length + 2 + i}
              </span>
              <span
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  fontFamily: "'SF Mono', monospace",
                  paddingLeft: line.indent * 24,
                }}
              >
                {line.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Diff View — looks legitimate, hides backdoor
// ═══════════════════════════════════════════════════════════
const Scene2_DiffView: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const GitDiffIcon = getIcon("GitDiff");
  const ShieldWarningIcon = getIcon("ShieldWarning");
  const EyeIcon = getIcon("Eye");
  const EyeSlashIcon = getIcon("EyeSlash");

  // 🔊 SOUND: transition @ frame 2370 — scene crossfades to diff view
  const titleOp = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp);
  const titleY = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: element_appear @ frame 2384 — diff panel appears showing "legitimate" change
  const diffOp = interpolate(frame, [F.LEGITIMATE - 10, F.LEGITIMATE + 10], [0, 1], clamp);
  const diffY = interpolate(frame, [F.LEGITIMATE - 10, F.LEGITIMATE + 10], [25, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: reveal @ frame 2408 — "backdoor" red glow reveals hidden threat
  const backdoorReveal = interpolate(frame, [F.BACKDOOR, F.BACKDOOR + 25], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Scanning line effect over diff
  const scanlineY = interpolate(frame, [F.BACKDOOR, F.BACKDOOR + 40], [0, 200], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const scanlineOp = interpolate(frame, [F.BACKDOOR, F.BACKDOOR + 5], [0, 0.6], clamp)
    * interpolate(frame, [F.BACKDOOR + 35, F.BACKDOOR + 40], [1, 0], clamp);

  // 🔊 SOUND: element_appear @ frame 2497 — "you'd never notice" label with eye icon
  const noticeOp = interpolate(frame, [F.DIFF_LOOKS, F.DIFF_LOOKS + 15], [0, 1], clamp);
  const noticeY = interpolate(frame, [F.DIFF_LOOKS, F.DIFF_LOOKS + 15], [12, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: reveal @ frame 2540 — warning badge "normal dependency update" with danger context
  const warningOp = interpolate(frame, [F.NORMAL_UPDATE, F.NORMAL_UPDATE + 15], [0, 1], clamp);
  const warningScale = spring({
    frame: Math.max(0, frame - F.NORMAL_UPDATE),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Diff lines
  const diffLines = [
    { prefix: " ", text: '"dependencies": {', color: "#94a3b8" },
    { prefix: " ", text: '  "react": "^18.2.0",', color: "#94a3b8" },
    { prefix: " ", text: '  "next": "^14.0.0",', color: "#94a3b8" },
    { prefix: "+", text: '  "@babel/helper-utils": "^7.23.1",', color: colors.green },
    { prefix: " ", text: '}', color: "#94a3b8" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <GitDiffIcon size={28} color={colors.blue} weight="duotone" />
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#e2e8f0",
          }}
        >
          The Diff Looks Normal
        </span>
      </div>

      {/* Diff panel */}
      <div
        style={{
          opacity: diffOp,
          transform: `translateY(${diffY}px)`,
          width: "100%",
          maxWidth: 900,
          borderRadius: 12,
          background: "#12121f",
          border: `1px solid ${backdoorReveal > 0.5 ? `${colors.red}30` : "#1a1a2e"}`,
          overflow: "hidden",
          position: "relative",
          boxShadow: backdoorReveal > 0.5 ? `0 0 30px ${colors.red}15` : "none",
        }}
      >
        {/* Diff header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px",
            borderBottom: "1px solid #1a1a2e",
            background: "#0f0f1a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#64748b", fontFamily: "'SF Mono', monospace" }}>
              package.json
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: colors.green, fontFamily: "'SF Mono', monospace" }}>+1</span>
            <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'SF Mono', monospace" }}>-0</span>
          </div>
        </div>

        {/* Diff lines */}
        <div style={{ padding: "12px 0", position: "relative" }}>
          {diffLines.map((line, i) => {
            const lineDelay = i * 6;
            const lineOp = interpolate(frame, [F.LEGITIMATE + lineDelay, F.LEGITIMATE + lineDelay + 10], [0, 1], clamp);
            const isAdded = line.prefix === "+";
            const isBackdoorLine = isAdded;

            // Backdoor line gets red overlay
            const lineRedGlow = isBackdoorLine ? backdoorReveal : 0;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 20px",
                  opacity: lineOp,
                  background: isAdded
                    ? lineRedGlow > 0.5
                      ? `${colors.red}${Math.round(lineRedGlow * 15).toString(16).padStart(2, "0")}`
                      : `${colors.green}08`
                    : "transparent",
                  borderLeft: isAdded
                    ? lineRedGlow > 0.5
                      ? `3px solid ${colors.red}80`
                      : `3px solid ${colors.green}40`
                    : "3px solid transparent",
                }}
              >
                <span
                  style={{
                    width: 30,
                    fontSize: 13,
                    fontWeight: 700,
                    color: isAdded
                      ? lineRedGlow > 0.5
                        ? colors.red
                        : colors.green
                      : "transparent",
                    fontFamily: "'SF Mono', monospace",
                    flexShrink: 0,
                  }}
                >
                  {line.prefix}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: isAdded && lineRedGlow > 0.5 ? "#e2e8f0" : line.color,
                    fontFamily: "'SF Mono', monospace",
                    textShadow: isAdded && lineRedGlow > 0.7 ? `0 0 6px ${colors.red}50` : "none",
                  }}
                >
                  {line.text}
                </span>
              </div>
            );
          })}

          {/* Red scanning line */}
          {scanlineOp > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: scanlineY,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${colors.red}60, ${colors.red}80, ${colors.red}60, transparent)`,
                opacity: scanlineOp,
                boxShadow: `0 0 15px ${colors.red}40`,
              }}
            />
          )}
        </div>
      </div>

      {/* Bottom row: "You'd never notice" + "Normal update" warning */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          marginTop: 10,
        }}
      >
        {/* "You'd never notice" */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 10,
            background: `${colors.blue}08`,
            border: `1px solid ${colors.blue}20`,
            opacity: noticeOp,
            transform: `translateY(${noticeY}px)`,
          }}
        >
          <EyeSlashIcon size={22} color={colors.blue} weight="duotone" />
          <span style={{ fontSize: 15, fontWeight: 600, color: "#94a3b8" }}>
            The diff looks like a normal update
          </span>
        </div>

        {/* Warning: contains backdoor */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 10,
            background: `${colors.red}10`,
            border: `1px solid ${colors.red}30`,
            boxShadow: `0 0 20px ${colors.red}20`,
            opacity: warningOp,
            transform: `scale(${warningScale})`,
          }}
        >
          <ShieldWarningIcon size={22} color={colors.red} weight="duotone" />
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.red }}>
            Contains a backdoor
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_CodeInjection;
