import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { Cube } from "@phosphor-icons/react";
import * as PhosphorIcons from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

// ─── Helpers ──────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeInQuad });

// ─── Colors ───────────────────────────────────────────────
const BG = "#030305";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const DANGER = "#ef4444";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";

// ─── Global frame timestamps (from voiceover) ─────────────
const F_START = 2638;
const F_PERSIST = 2674;
const F_BEYOND_UNINSTALL = 2702;
const F_EXTENSIONS_WRITE = 2765;
const F_SHELL_PROFILE = 2797;
const F_GIT_HOOKS = 2830;
const F_STARTUP_SCRIPTS = 2868;
const F_REMOVE_EXTENSION = 2950;
const F_PAYLOAD_STAYS = 2996;
const F_END = 3066;

// ─── Target system locations ──────────────────────────────
const targets = [
  { label: ".bashrc / .zshrc", sub: "Shell Profile", icon: "Terminal", color: PRIMARY, frame: F_SHELL_PROFILE },
  { label: ".git/hooks/", sub: "Git Hooks", icon: "GitBranch", color: SECONDARY, frame: F_GIT_HOOKS },
  { label: "~/.config/autostart", sub: "Startup Scripts", icon: "Power", color: ACCENT, frame: F_STARTUP_SCRIPTS },
];

// ─── Payload Dot (planted file indicator) ─────────────────
const PayloadDot: React.FC<{
  color: string;
  opacity: number;
  scale: number;
  danger: boolean;
}> = ({ color, opacity, scale, danger }) => {
  const dotColor = danger ? DANGER : color;
  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        width: 14,
        height: 14,
        borderRadius: "50%",
        background: dotColor,
        boxShadow: danger
          ? `0 0 16px ${DANGER}80, 0 0 32px ${DANGER}40`
          : `0 0 10px ${color}60`,
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_Persistence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const PuzzlePieceIcon = getIcon("PuzzlePiece");
  const WarningIcon = getIcon("Warning");
  const TrashIcon = getIcon("Trash");
  const FileCodeIcon = getIcon("FileCode");

  // ─── TITLE (appears at segment start) ───────────────────
  // 🔊 SOUND: scene_start @ frame 2638 — segment title fades in
  const titleOpacity = fadeIn(frame, F_START, 20);
  const titleSlide = slideUp(frame, F_START, 20);

  // "persist" emphasis glow
  // 🔊 SOUND: reveal @ frame 2674 — "persist" keyword pulses
  const persistGlow = interpolate(frame, [F_PERSIST, F_PERSIST + 12], [0, 30], clamp);
  const persistColor = interpolate(
    frame,
    [F_PERSIST, F_PERSIST + 12],
    [0, 1],
    clamp
  );

  // ─── EXTENSION ICON (appears at "beyond uninstall") ─────
  // 🔊 SOUND: element_appear @ frame 2702 — extension icon scales in
  const extScale = spring({
    frame: Math.max(0, frame - F_BEYOND_UNINSTALL),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const extOpacity = fadeIn(frame, F_BEYOND_UNINSTALL, 15);

  // Extension "WRITING" indicator
  // 🔊 SOUND: element_appear @ frame 2765 — "writing" action badge appears
  const writingBadgeOpacity = interpolate(
    frame,
    [F_EXTENSIONS_WRITE, F_EXTENSIONS_WRITE + 12, F_REMOVE_EXTENSION - 15, F_REMOVE_EXTENSION],
    [0, 1, 1, 0],
    clamp
  );

  // ─── TARGET CARDS (staggered with narration) ────────────
  // Each appears when narrator mentions it

  // ─── UNINSTALL PHASE ────────────────────────────────────
  // 🔊 SOUND: element_disappear @ frame 2950 — extension shrinks and fades out
  const uninstallProgress = interpolate(
    frame,
    [F_REMOVE_EXTENSION, F_REMOVE_EXTENSION + 25],
    [0, 1],
    { ...clamp, easing: easeInQuad }
  );
  const extUninstallScale = interpolate(uninstallProgress, [0, 1], [1, 0.3], clamp);
  const extUninstallOpacity = interpolate(uninstallProgress, [0, 1], [1, 0], clamp);
  const extGrayscale = interpolate(uninstallProgress, [0, 0.5], [0, 1], clamp);

  // "Uninstalled" label
  const uninstallLabelOpacity = interpolate(
    frame,
    [F_REMOVE_EXTENSION + 20, F_REMOVE_EXTENSION + 35],
    [0, 1],
    clamp
  );

  // ─── PAYLOAD STAYS BEHIND PHASE ─────────────────────────
  // 🔊 SOUND: reveal @ frame 2996 — payloads pulse red, danger state
  const dangerPhase = frame >= F_PAYLOAD_STAYS;
  const dangerPulse = dangerPhase
    ? 0.7 + 0.3 * Math.sin((frame - F_PAYLOAD_STAYS) * 0.15)
    : 0;

  const warningOpacity = fadeIn(frame, F_PAYLOAD_STAYS, 15);
  const warningSlide = slideUp(frame, F_PAYLOAD_STAYS, 15);

  // Background danger tint
  const bgDangerTint = interpolate(
    frame,
    [F_PAYLOAD_STAYS, F_PAYLOAD_STAYS + 20],
    [0, 0.03],
    clamp
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
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background danger overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, ${DANGER}${Math.round(bgDangerTint * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* ─── TITLE ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              letterSpacing: -0.5,
            }}
          >
            Persist{" "}
            <span
              style={{
                color: interpolate(persistColor, [0, 1], [0, 1], clamp) > 0.5 ? DANGER : TEXT_PRIMARY,
                textShadow: `0 0 ${persistGlow}px ${DANGER}50`,
              }}
            >
              Beyond Uninstall
            </span>
          </span>
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: TEXT_DIM,
            marginTop: 8,
          }}
        >
          Extensions that leave hidden payloads in your system
        </p>
      </div>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          marginTop: 30,
        }}
      >
        {/* Extension icon + writing badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: extOpacity * extUninstallOpacity,
            transform: `scale(${extScale * extUninstallScale})`,
            filter: `grayscale(${extGrayscale})`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}08)`,
              border: `2px solid ${PRIMARY}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${PRIMARY}20`,
            }}
          >
            <PuzzlePieceIcon size={48} color={PRIMARY} weight="duotone" />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              color: TEXT_MUTED,
            }}
          >
            Extension
          </span>

          {/* WRITING action badge */}
          <div
            style={{
              opacity: writingBadgeOpacity,
              padding: "6px 16px",
              borderRadius: 8,
              background: `${ACCENT}15`,
              border: `1px solid ${ACCENT}30`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FileCodeIcon size={16} color={ACCENT} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                color: ACCENT,
              }}
            >
              WRITING TO SYSTEM...
            </span>
          </div>
        </div>

        {/* "Uninstalled" label (replaces extension after removal) */}
        <div
          style={{
            opacity: uninstallLabelOpacity,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 24px",
            borderRadius: 10,
            background: `${TEXT_DIM}08`,
            border: `1px solid ${BORDER}`,
            position: "absolute",
            top: 200,
          }}
        >
          <TrashIcon size={22} color={TEXT_DIM} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              color: TEXT_DIM,
            }}
          >
            Extension Removed
          </span>
        </div>

        {/* ─── TARGET SYSTEM LOCATIONS ─────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
          }}
        >
          {targets.map((target, i) => {
            const Icon = getIcon(target.icon);

            // 🔊 SOUND: element_appear @ frame {target.frame} — system target card appears
            const cardOpacity = fadeIn(frame, target.frame, 18);
            const cardSlide = slideUp(frame, target.frame, 18);

            // Payload dot appears shortly after card
            const payloadFrame = target.frame + 15;
            const payloadScale = spring({
              frame: Math.max(0, frame - payloadFrame),
              fps,
              config: { damping: 20, stiffness: 200 },
            });
            const payloadOpacity = fadeIn(frame, payloadFrame, 10);

            // Travel dot from extension to target
            const travelStart = target.frame - 10;
            const travelEnd = target.frame + 5;
            const travelProgress = interpolate(frame, [travelStart, travelEnd], [0, 1], clamp);
            const travelOpacity = interpolate(
              frame,
              [travelStart, travelStart + 5, travelEnd - 3, travelEnd],
              [0, 0.8, 0.8, 0],
              clamp
            );

            // Danger state for payloads after uninstall
            const cardDangerBorder = dangerPhase
              ? `2px solid ${DANGER}${Math.round(dangerPulse * 60).toString(16).padStart(2, "0")}`
              : `1.5px solid ${target.color}25`;
            const cardDangerShadow = dangerPhase
              ? `0 0 ${20 * dangerPulse}px ${DANGER}30`
              : `0 0 10px ${target.color}10`;

            return (
              <div
                key={target.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  opacity: cardOpacity,
                  transform: `translateY(${cardSlide}px)`,
                }}
              >
                {/* Travel dot */}
                <div
                  style={{
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: target.color,
                      boxShadow: `0 0 10px ${target.color}80`,
                      opacity: travelOpacity,
                      transform: `translateY(${interpolate(travelProgress, [0, 1], [-40, 0], clamp)}px)`,
                    }}
                  />
                </div>

                {/* Target card */}
                <div
                  style={{
                    width: 280,
                    padding: "28px 24px",
                    borderRadius: 12,
                    background: dangerPhase ? `${DANGER}06` : `${target.color}06`,
                    border: cardDangerBorder,
                    boxShadow: cardDangerShadow,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: `linear-gradient(135deg, ${target.color}20, ${target.color}08)`,
                      border: `1.5px solid ${target.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 12px ${target.color}15`,
                    }}
                  >
                    <Icon size={28} color={target.color} weight="duotone" />
                  </div>

                  {/* Label */}
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 15,
                        fontWeight: 600,
                        color: TEXT_PRIMARY,
                      }}
                    >
                      {target.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: TEXT_DIM,
                        marginTop: 4,
                      }}
                    >
                      {target.sub}
                    </div>
                  </div>

                  {/* Planted payload indicator */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px",
                      borderRadius: 8,
                      background: dangerPhase ? `${DANGER}12` : `${target.color}10`,
                      opacity: payloadOpacity,
                    }}
                  >
                    <PayloadDot
                      color={target.color}
                      opacity={1}
                      scale={payloadScale}
                      danger={dangerPhase}
                    />
                    <span
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 12,
                        fontWeight: 600,
                        color: dangerPhase ? DANGER : target.color,
                      }}
                    >
                      {dangerPhase ? "PAYLOAD ACTIVE" : "payload planted"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── WARNING BANNER (payload stays behind) ────────── */}
        {frame >= F_PAYLOAD_STAYS && (
          <div
            style={{
              opacity: warningOpacity,
              transform: `translateY(${warningSlide}px)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 32px",
              borderRadius: 12,
              background: `${DANGER}10`,
              border: `1.5px solid ${DANGER}35`,
              boxShadow: `0 0 25px ${DANGER}15`,
            }}
          >
            <WarningIcon size={28} color={DANGER} weight="duotone" />
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: DANGER,
                textShadow: `0 0 15px ${DANGER}30`,
              }}
            >
              Payload stays behind
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: TEXT_MUTED,
                marginLeft: 8,
              }}
            >
              Extension gone, but the damage persists
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generated_Persistence;
