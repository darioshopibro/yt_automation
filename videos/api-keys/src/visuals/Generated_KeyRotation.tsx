import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Key,
  ArrowsClockwise,
  Warning,
  Timer,
  CurrencyDollar,
  ShieldCheck,
  Lightning,
  X,
} from "@phosphor-icons/react";

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

// ─── Brand Colors ─────────────────────────────────────────
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const BG = "#030305";
const TEXT = "#f8fafc";
const TEXT_MUTED = "#94a3b8";
const ERROR = "#ef4444";
const SUCCESS = "#22c55e";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps)
 * Segment: frames 3970–4499 (530 frames, ~17.7s)
 * ═══════════════════════════════════════════════════════════
 * "One more thing."                           → f3970  (local 0)
 * "Always rotate your keys."                  → f4000  (local 30)
 * "Most services let you generate"            → f4060  (local 90)
 * "a new key"                                 → f4090  (local 120)
 * "and revoke the old one instantly."         → f4120  (local 150)
 * "If you suspect a leak,"                    → f4190  (local 220)
 * "rotate immediately."                       → f4240  (local 270)
 * "It takes 10 seconds"                       → f4300  (local 330)
 * "and could save you thousands of dollars"   → f4370  (local 400)
 * "in unauthorized API calls."                → f4430  (local 460)
 * End                                         → f4499  (local 529)
 */

type Props = {
  startFrame: number;
  endFrame: number;
};

// ─── Key Card ─────────────────────────────────────────────
const KeyCard: React.FC<{
  label: string;
  keyValue: string;
  color: string;
  opacity: number;
  translateY: number;
  translateX?: number;
  rotation?: number;
  scale?: number;
  glow?: boolean;
  revoked?: boolean;
  glowIntensity?: number;
}> = ({ label, keyValue, color, opacity, translateY, translateX = 0, rotation = 0, scale = 1, glow = false, revoked = false, glowIntensity = 20 }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px) translateX(${translateX}px) rotate(${rotation}deg) scale(${scale})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      filter: revoked ? "grayscale(0.7)" : "none",
    }}
  >
    <div
      style={{
        padding: "28px 40px",
        borderRadius: 12,
        background: revoked ? `${ERROR}08` : `${color}10`,
        border: `2px solid ${revoked ? ERROR + "40" : color + "40"}`,
        boxShadow: glow ? `0 0 ${glowIntensity}px ${color}30, 0 0 ${glowIntensity * 2}px ${color}15` : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Revoke strikethrough */}
      {revoked && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: -10,
            right: -10,
            height: 3,
            background: ERROR,
            transform: "rotate(-5deg)",
            boxShadow: `0 0 10px ${ERROR}60`,
          }}
        />
      )}
      <Key size={36} color={revoked ? ERROR : color} weight="duotone" style={{ filter: glow ? `drop-shadow(0 0 8px ${color}60)` : "none" }} />
      <span
        style={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: 14,
          fontWeight: 600,
          color: revoked ? `${ERROR}cc` : TEXT_MUTED,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: 18,
          fontWeight: 700,
          color: revoked ? `${ERROR}80` : color,
          letterSpacing: 1,
          textDecoration: revoked ? "line-through" : "none",
        }}
      >
        {keyValue}
      </span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_KeyRotation: React.FC<Props> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame; // local frame

  // ─── SCENE 1: Key Rotation Visual (f0–f280) ──────────
  // Title: "One more thing. Always rotate your keys."
  const titleOp = fadeIn(f, 0, 20);
  const titleY = slideUp(f, 0, 20);

  // Rotate icon spin
  const rotateIconOp = fadeIn(f, 25, 15);
  const rotateIconSpin = interpolate(f, [25, 80], [0, 360], { ...clamp, easing: Easing.out(Easing.cubic) });
  const rotateIconScale = spring({ frame: Math.max(0, f - 25), fps, config: { damping: 20, stiffness: 180 } });

  // Old key appears at f40
  const oldKeyOp = interpolate(f, [40, 55, 150, 180], [0, 1, 1, 0.3], { ...clamp });
  const oldKeyY = slideUp(f, 40, 15);
  // Old key rotates out and shrinks when revoked (f150+)
  const oldKeyRotation = interpolate(f, [150, 200], [0, -15], { ...clamp, easing: easeInQuad });
  const oldKeyScale = interpolate(f, [150, 200], [1, 0.85], { ...clamp, easing: easeInQuad });
  const oldKeyRevoked = f >= 160;

  // "REVOKED" badge
  const revokedBadgeOp = fadeIn(f, 165, 12);
  const revokedBadgeScale = spring({ frame: Math.max(0, f - 165), fps, config: { damping: 20, stiffness: 200 } });

  // New key appears at f90 ("generate a new key")
  const newKeyOp = fadeIn(f, 90, 20);
  const newKeyY = slideUp(f, 90, 20);
  // New key glows stronger after old one is revoked
  const newKeyGlow = f >= 160;
  const newKeyGlowIntensity = interpolate(f, [160, 200], [15, 40], clamp);

  // Arrow between keys
  const arrowOp = interpolate(f, [105, 120], [0, 1], clamp);
  const arrowPulse = interpolate(f, [120, 160], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // "instantly" text
  const instantlyOp = fadeIn(f, 155, 15);
  const instantlyY = slideUp(f, 155, 15);

  // Scene 1 fade out
  const scene1Fade = f < 240 ? 1 : fadeOut(f, 240, 30);

  // ─── SCENE 2: Urgency — Leak + Timer + Dollars (f220+) ──
  const scene2Op = f < 210 ? 0 : fadeIn(f, 215, 25);

  // Warning: "If you suspect a leak" (f220)
  const warningOp = fadeIn(f, 220, 15);
  const warningY = slideUp(f, 220, 15);
  const warningPulse = interpolate(
    f % 30, [0, 15, 30], [1, 1.06, 1], clamp
  );

  // "rotate immediately" flash (f270)
  const immediateOp = fadeIn(f, 270, 12);
  const immediateScale = spring({ frame: Math.max(0, f - 270), fps, config: { damping: 20, stiffness: 180 } });
  const immediateGlow = interpolate(f, [270, 290], [0, 35], clamp);

  // Timer: 10 second countdown (f330+)
  const timerOp = fadeIn(f, 325, 15);
  const timerY = slideUp(f, 325, 15);
  // Count from 10 down to 0 over ~60 frames
  const timerValue = Math.max(0, Math.round(
    interpolate(f, [335, 395], [10, 0], clamp)
  ));
  const timerColor = timerValue > 5 ? SECONDARY : timerValue > 2 ? ACCENT : ERROR;
  // Timer bar shrinks
  const timerBarProgress = interpolate(f, [335, 395], [1, 0], clamp);

  // Dollar counter: "thousands of dollars" (f400+)
  const dollarOp = fadeIn(f, 395, 15);
  const dollarY = slideUp(f, 395, 15);
  const dollarAmount = Math.round(
    interpolate(f, [400, 460], [0, 4750], { ...clamp, easing: Easing.out(Easing.cubic) })
  );
  const dollarColor = dollarAmount > 3000 ? ERROR : dollarAmount > 1000 ? ACCENT : TEXT_MUTED;
  const dollarGlow = interpolate(f, [430, 460], [0, 30], clamp);

  // "unauthorized API calls" label (f460)
  const unauthorizedOp = fadeIn(f, 455, 15);
  const unauthorizedY = slideUp(f, 455, 15);

  // Shield: "Save yourself" (f475)
  const shieldOp = fadeIn(f, 475, 20);
  const shieldScale = spring({ frame: Math.max(0, f - 475), fps, config: { damping: 22, stiffness: 180 } });

  // ─── Phase visibility ─────────────────────────────────
  const showScene1 = f < 270;
  const showScene2 = f >= 210;

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
      {/* ─── Step Badge ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: titleOp,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: `${PRIMARY}20`,
            border: `2px solid ${PRIMARY}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 15px ${PRIMARY}20`,
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 16,
              fontWeight: 700,
              color: PRIMARY,
            }}
          >
            6
          </span>
        </div>
        <span
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 14,
            fontWeight: 600,
            color: TEXT_MUTED,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          Key Rotation
        </span>
      </div>

      {/* ═══ SCENE 1: KEY ROTATION DEMO ════════════════════ */}
      {showScene1 && (
        <div
          style={{
            opacity: scene1Fade,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 48,
          }}
        >
          {/* Title */}
          <div
            style={{
              opacity: titleOp,
              transform: `translateY(${titleY}px)`,
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 32,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: -0.5,
                margin: 0,
              }}
            >
              Always Rotate Your Keys
            </h1>
          </div>

          {/* Rotation icon */}
          <div
            style={{
              opacity: rotateIconOp,
              transform: `rotate(${rotateIconSpin}deg) scale(${rotateIconScale})`,
            }}
          >
            <ArrowsClockwise
              size={56}
              color={SECONDARY}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 12px ${SECONDARY}50)` }}
            />
          </div>

          {/* Keys row: Old Key → Arrow → New Key */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 60,
            }}
          >
            {/* Old Key */}
            <div style={{ position: "relative" }}>
              <KeyCard
                label="Old Key"
                keyValue="sk-a8f3...x7q2"
                color={TEXT_MUTED}
                opacity={oldKeyOp}
                translateY={oldKeyY}
                rotation={oldKeyRotation}
                scale={oldKeyScale}
                revoked={oldKeyRevoked}
              />
              {/* REVOKED badge */}
              {f >= 165 && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: -20,
                    opacity: revokedBadgeOp,
                    transform: `scale(${revokedBadgeScale})`,
                    padding: "6px 16px",
                    borderRadius: 8,
                    background: ERROR,
                    boxShadow: `0 0 15px ${ERROR}50`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: 1.5,
                    }}
                  >
                    REVOKED
                  </span>
                </div>
              )}
            </div>

            {/* Arrow / rotation indicator */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                opacity: arrowOp,
              }}
            >
              {/* Animated dot traveling from left to right */}
              <div
                style={{
                  width: 120,
                  height: 4,
                  background: `${SECONDARY}20`,
                  borderRadius: 2,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${arrowPulse * 100}%`,
                    width: 24,
                    height: 4,
                    borderRadius: 2,
                    background: SECONDARY,
                    boxShadow: `0 0 8px ${SECONDARY}80`,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: `${SECONDARY}cc`,
                  opacity: instantlyOp,
                  transform: `translateY(${instantlyY}px)`,
                }}
              >
                INSTANTLY
              </span>
            </div>

            {/* New Key */}
            <KeyCard
              label="New Key"
              keyValue="sk-m9d2...k4p8"
              color={SUCCESS}
              opacity={newKeyOp}
              translateY={newKeyY}
              glow={newKeyGlow}
              glowIntensity={newKeyGlowIntensity}
            />
          </div>
        </div>
      )}

      {/* ═══ SCENE 2: URGENCY — LEAK + TIMER + DOLLARS ═════ */}
      {showScene2 && (
        <div
          style={{
            opacity: scene2Op,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Warning banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 36px",
              borderRadius: 12,
              background: `${ACCENT}10`,
              border: `2px solid ${ACCENT}40`,
              boxShadow: `0 0 20px ${ACCENT}15`,
              opacity: warningOp,
              transform: `translateY(${warningY}px) scale(${warningPulse})`,
            }}
          >
            <Warning size={32} color={ACCENT} weight="fill" />
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: ACCENT,
              }}
            >
              If you suspect a leak...
            </span>
          </div>

          {/* "Rotate Immediately" flash */}
          <div
            style={{
              opacity: immediateOp,
              transform: `scale(${immediateScale})`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 48px",
              borderRadius: 12,
              background: `${ERROR}10`,
              border: `2px solid ${ERROR}50`,
              boxShadow: `0 0 ${immediateGlow}px ${ERROR}30`,
            }}
          >
            <Lightning size={32} color={ERROR} weight="fill" />
            <span
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: ERROR,
                textShadow: `0 0 15px ${ERROR}40`,
                letterSpacing: 1,
              }}
            >
              ROTATE IMMEDIATELY
            </span>
          </div>

          {/* Timer + Dollar row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 80,
              marginTop: 12,
            }}
          >
            {/* Timer: 10 seconds */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                opacity: timerOp,
                transform: `translateY(${timerY}px)`,
              }}
            >
              <Timer size={36} color={timerColor} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${timerColor}50)` }} />
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                TIME TO ROTATE
              </span>
              {/* Big number */}
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  background: `${timerColor}08`,
                  border: `3px solid ${timerColor}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 30px ${timerColor}15, inset 0 0 20px ${timerColor}05`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: 56,
                    fontWeight: 700,
                    color: timerColor,
                    textShadow: `0 0 20px ${timerColor}40`,
                    letterSpacing: -2,
                  }}
                >
                  {timerValue}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  color: TEXT_MUTED,
                }}
              >
                seconds
              </span>
              {/* Timer bar */}
              <div
                style={{
                  width: 200,
                  height: 8,
                  borderRadius: 4,
                  background: `${BORDER}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${timerBarProgress * 100}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${timerColor}80, ${timerColor})`,
                    boxShadow: `0 0 8px ${timerColor}40`,
                  }}
                />
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                width: 2,
                height: 280,
                background: `linear-gradient(${BORDER}, ${BORDER}00)`,
                opacity: dollarOp,
              }}
            />

            {/* Dollar counter: money at risk */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                opacity: dollarOp,
                transform: `translateY(${dollarY}px)`,
              }}
            >
              <CurrencyDollar size={36} color={dollarColor} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${dollarColor}50)` }} />
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                POTENTIAL LOSS
              </span>
              {/* Big dollar amount */}
              <div
                style={{
                  padding: "24px 48px",
                  borderRadius: 12,
                  background: `${dollarColor}08`,
                  border: `2px solid ${dollarColor}30`,
                  boxShadow: `0 0 ${dollarGlow}px ${dollarColor}20`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', 'Fira Code', monospace",
                    fontSize: 52,
                    fontWeight: 700,
                    color: dollarColor,
                    textShadow: `0 0 20px ${dollarColor}30`,
                    letterSpacing: -1,
                  }}
                >
                  ${dollarAmount.toLocaleString()}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  color: TEXT_MUTED,
                  opacity: unauthorizedOp,
                  transform: `translateY(${unauthorizedY}px)`,
                }}
              >
                in unauthorized API calls
              </span>
            </div>
          </div>

          {/* Shield: save yourself */}
          {f >= 475 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: shieldOp,
                transform: `scale(${shieldScale})`,
                padding: "14px 32px",
                borderRadius: 12,
                background: `${SUCCESS}08`,
                border: `1px solid ${SUCCESS}25`,
                boxShadow: `0 0 20px ${SUCCESS}15`,
                marginTop: 8,
              }}
            >
              <ShieldCheck size={28} color={SUCCESS} weight="duotone" />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: SUCCESS,
                }}
              >
                10 seconds to rotate. Thousands saved.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Generated_KeyRotation;
