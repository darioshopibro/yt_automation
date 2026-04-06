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
const BG = "#0f0f1a";
const ACCENT = "#3b82f6";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const GREEN = "#22c55e";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from word timestamps
 * ═══════════════════════════════════════════════════════════
 * "The attention cost"         → f2010
 * "staggering"                 → f2051
 * "Research from UC Irvine"    → f2094–f2120
 * "twenty three minutes"       → f2182–f2200
 * "fifteen seconds"            → f2217–f2232
 * "refocus after interruption" → f2273–f2300
 * "ten notifications"          → f2363–f2373
 * "four hours"                 → f2460–f2471
 * "fragmented attention"       → f2486–f2505
 * "You're not getting ten"     → f2541–f2561
 * "sixty to eighty"            → f2620–f2638
 * End                          → f2689
 */

// ─── KEY FRAMES (from voiceover timestamps) ─────────────
const F_THE = 2010;
const F_ATTENTION = 2023;
const F_STAGGERING = 2051;
const F_RESEARCH = 2094;
const F_UC_IRVINE = 2111;
const F_TWENTY = 2182;
const F_THREE = 2193;
const F_MINUTES = 2200;
const F_FIFTEEN = 2217;
const F_SECONDS = 2232;
const F_REFOCUS = 2273;
const F_INTERRUPTION = 2300;
const F_TEN_NOTIFS = 2363;
const F_NOTIFICATIONS = 2373;
const F_FOUR = 2460;
const F_HOURS = 2471;
const F_FRAGMENTED = 2486;
const F_FRAG_ATTENTION = 2505;
const F_YOURE_NOT = 2541;
const F_NOT_TEN = 2548;
const F_TEN_2ND = 2561;
const F_SIXTY = 2620;
const F_EIGHTY = 2638;
const F_END = 2689;

// ─── Scene boundaries ────────────────────────────────────
const SCENE1_END = F_TEN_NOTIFS - 15;        // ~f2348
const SCENE2_START = F_TEN_NOTIFS - 30;      // ~f2333
const SCENE2_END = F_YOURE_NOT - 15;         // ~f2526
const SCENE3_START = F_YOURE_NOT - 30;       // ~f2511

// ═══════════════════════════════════════════════════════════
// Animated Number Counter
// ═══════════════════════════════════════════════════════════
const AnimatedNumber: React.FC<{
  frame: number;
  startFrame: number;
  endFrame: number;
  from: number;
  to: number;
  color: string;
  fontSize: number;
  prefix?: string;
  suffix?: string;
  fontFamily?: string;
}> = ({ frame, startFrame, endFrame, from, to, color, fontSize, prefix, suffix, fontFamily }) => {
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], { ...clamp, easing: easeOutCubic });
  const value = Math.round(from + (to - from) * progress);
  return (
    <span
      style={{
        fontFamily: fontFamily || "'SF Mono', monospace",
        fontSize,
        fontWeight: 700,
        color,
        textShadow: `0 0 30px ${color}50`,
        letterSpacing: -1,
      }}
    >
      {prefix}{value}{suffix}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_AttentionCost: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE TRANSITIONS ────────────────────────────────
  const scene1Opacity = frame < SCENE1_END ? 1 : fadeOut(frame, SCENE1_END, 25);
  const scene2Opacity =
    frame < SCENE2_START ? 0
    : frame < SCENE2_END ? fadeIn(frame, SCENE2_START, 20)
    : fadeOut(frame, SCENE2_END, 25);
  const scene3Opacity = frame < SCENE3_START ? 0 : fadeIn(frame, SCENE3_START, 20);

  // ═══ SCENE 1: The 23:15 Stat Reveal ═══════════════════
  // 🔊 SOUND: scene_start @ frame 2010 — title text fades in
  const titleOpacity = fadeIn(frame, F_THE, 20);
  const titleSlide = slideUp(frame, F_THE, 20);

  // 🔊 SOUND: reveal @ frame 2051 — "staggering" emphasis glow
  const staggeringScale = spring({
    frame: Math.max(0, frame - F_STAGGERING),
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const staggeringOpacity = fadeIn(frame, F_STAGGERING, 12);

  // 🔊 SOUND: element_appear @ frame 2094 — research source badge slides in
  const researchOpacity = fadeIn(frame, F_RESEARCH, 15);
  const researchSlide = slideUp(frame, F_RESEARCH, 15);

  // 🔊 SOUND: reveal @ frame 2182 — big timer starts counting up to 23:15
  const timerOpacity = fadeIn(frame, F_TWENTY - 10, 15);
  const timerScale = spring({
    frame: Math.max(0, frame - (F_TWENTY - 10)),
    fps,
    config: { damping: 22, stiffness: 160 },
  });

  // Timer counts: minutes count from 0 to 23 over ~35 frames
  const minuteProgress = interpolate(frame, [F_TWENTY, F_MINUTES + 10], [0, 1], { ...clamp, easing: easeOutCubic });
  const minuteValue = Math.round(23 * minuteProgress);

  // Seconds count from 0 to 15 (starts at F_FIFTEEN)
  const secondProgress = interpolate(frame, [F_FIFTEEN, F_SECONDS + 10], [0, 1], { ...clamp, easing: easeOutCubic });
  const secondValue = Math.round(15 * secondProgress);

  // 🔊 SOUND: element_appear @ frame 2273 — "to refocus" label appears below timer
  const refocusLabelOpacity = fadeIn(frame, F_REFOCUS, 15);
  const refocusLabelSlide = slideUp(frame, F_REFOCUS, 15);

  // 🔊 SOUND: element_appear @ frame 2300 — "after each interruption" label fades in
  const interruptionOpacity = fadeIn(frame, F_INTERRUPTION, 15);

  // Timer glow pulses after full reveal
  const timerGlowIntensity = frame >= F_SECONDS + 10
    ? interpolate(
        Math.sin((frame - F_SECONDS) * 0.08),
        [-1, 1],
        [0.3, 0.7],
        clamp,
      )
    : 0.2;

  // ═══ SCENE 2: Workday Fragmentation ═══════════════════

  // 🔊 SOUND: transition @ frame 2333 — scene crossfades to workday bar
  // 🔊 SOUND: element_appear @ frame 2363 — "10 notifications" label + notification icons appear
  const notifLabelOpacity = fadeIn(frame, F_TEN_NOTIFS, 15);
  const notifLabelSlide = slideUp(frame, F_TEN_NOTIFS, 15);

  // Workday bar (8 hours visualized)
  // 🔊 SOUND: element_appear @ frame 2373 — workday progress bar appears
  const barOpacity = fadeIn(frame, F_NOTIFICATIONS, 15);

  // Notification slices cut through the workday bar
  // 10 notification cuts staggered from F_NOTIFICATIONS+10
  const NOTIF_COUNT = 10;
  const notifSliceStart = F_NOTIFICATIONS + 15;
  const notifSliceStagger = 8;

  // 🔊 SOUND: staggered_group @ frame 2388 — 10 notification slices cut through workday bar one by one
  const notifSlices = Array.from({ length: NOTIF_COUNT }, (_, i) => {
    const sliceFrame = notifSliceStart + i * notifSliceStagger;
    const sliceOpacity = fadeIn(frame, sliceFrame, 8);
    // Each slice is positioned along the bar
    const position = (i + 1) / (NOTIF_COUNT + 1);
    return { opacity: sliceOpacity, position, frame: sliceFrame };
  });

  // 🔊 SOUND: reveal @ frame 2460 — "4 HOURS" stat scales up dramatically
  const fourHoursOpacity = fadeIn(frame, F_FOUR - 5, 15);
  const fourHoursScale = spring({
    frame: Math.max(0, frame - (F_FOUR - 5)),
    fps,
    config: { damping: 18, stiffness: 180 },
  });

  // 🔊 SOUND: element_appear @ frame 2486 — "fragmented attention" label with red tint
  const fragmentedOpacity = fadeIn(frame, F_FRAGMENTED, 15);
  const fragmentedSlide = slideUp(frame, F_FRAGMENTED, 15);

  // Bar turns red as fragmented attention is revealed
  const barRedShift = interpolate(frame, [F_FRAGMENTED, F_FRAGMENTED + 20], [0, 1], { ...clamp });

  // ═══ SCENE 3: The Punchline — 60-80 ═══════════════════

  // 🔊 SOUND: transition @ frame 2511 — scene crossfades to final punchline
  // 🔊 SOUND: element_appear @ frame 2541 — "You're not getting" text appears
  const punchSetupOpacity = fadeIn(frame, F_YOURE_NOT, 15);
  const punchSetupSlide = slideUp(frame, F_YOURE_NOT, 15);

  // 🔊 SOUND: element_appear @ frame 2548 — "10" number appears then gets crossed out
  const tenOpacity = fadeIn(frame, F_NOT_TEN, 12);
  const tenStrike = interpolate(frame, [F_TEN_2ND, F_TEN_2ND + 15], [0, 1], { ...clamp, easing: easeOutCubic });

  // 🔊 SOUND: reveal @ frame 2620 — "60" number scales up BIG with dramatic glow
  const sixtyOpacity = fadeIn(frame, F_SIXTY - 5, 12);
  const sixtyScale = spring({
    frame: Math.max(0, frame - (F_SIXTY - 5)),
    fps,
    config: { damping: 15, stiffness: 160 },
  });

  // 🔊 SOUND: reveal @ frame 2638 — "80" appears next to 60, final punchline glow intensifies
  const eightyOpacity = fadeIn(frame, F_EIGHTY - 3, 12);
  const eightyScale = spring({
    frame: Math.max(0, frame - (F_EIGHTY - 3)),
    fps,
    config: { damping: 15, stiffness: 160 },
  });

  // Final glow pulse on the big numbers
  const finalGlow = frame >= F_EIGHTY
    ? interpolate(
        Math.sin((frame - F_EIGHTY) * 0.06),
        [-1, 1],
        [0.4, 1],
        clamp,
      )
    : 0;

  // 🔊 SOUND: element_disappear @ frame 2670 — segment fading out
  const endFade = frame >= F_END - 20 ? fadeOut(frame, F_END - 20, 20) : 1;

  // Bell icon for notifications
  const BellIcon = getIcon("BellRinging");
  const ClockIcon = getIcon("Clock");
  const WarningIcon = getIcon("Warning");
  const LightningIcon = getIcon("Lightning");
  const BrainIcon = getIcon("Brain");

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
        opacity: endFade,
      }}
    >
      {/* ═══ SCENE 1: The 23:15 Stat ═══════════════════════ */}
      <div
        style={{
          opacity: scene1Opacity,
          display: scene1Opacity <= 0 ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
          position: "absolute",
          inset: 0,
          padding: 80,
          justifyContent: "center",
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <BrainIcon size={36} color={ACCENT} weight="duotone" />
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: TEXT_PRIMARY,
              letterSpacing: -0.5,
            }}
          >
            The Attention Cost
          </span>
        </div>

        {/* "Staggering" emphasis */}
        <div
          style={{
            opacity: staggeringOpacity,
            transform: `scale(${staggeringScale})`,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: RED,
              letterSpacing: 4,
              textTransform: "uppercase",
              textShadow: `0 0 20px ${RED}40`,
            }}
          >
            STAGGERING
          </span>
        </div>

        {/* Research source */}
        <div
          style={{
            opacity: researchOpacity,
            transform: `translateY(${researchSlide}px)`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            background: `${CYAN}10`,
            border: `1px solid ${CYAN}25`,
            borderRadius: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              color: CYAN,
            }}
          >
            Research from UC Irvine
          </span>
        </div>

        {/* BIG TIMER — the main visual */}
        <div
          style={{
            opacity: timerOpacity,
            transform: `scale(${timerScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            marginTop: 16,
          }}
        >
          {/* Timer circle */}
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: 160,
              background: `${RED}08`,
              border: `3px solid ${RED}40`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: `0 0 ${60 * timerGlowIntensity}px ${RED}${Math.round(timerGlowIntensity * 30).toString(16).padStart(2, "0")}, inset 0 0 40px ${RED}08`,
            }}
          >
            <ClockIcon size={40} color={`${RED}90`} weight="duotone" />
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 72,
                  fontWeight: 700,
                  color: RED,
                  textShadow: `0 0 30px ${RED}40`,
                  letterSpacing: -2,
                }}
              >
                {minuteValue}
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 48,
                  fontWeight: 600,
                  color: `${RED}aa`,
                }}
              >
                :
              </span>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 72,
                  fontWeight: 700,
                  color: RED,
                  textShadow: `0 0 30px ${RED}40`,
                  letterSpacing: -2,
                  minWidth: 90,
                }}
              >
                {String(secondValue).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* "to fully refocus" label */}
          <div
            style={{
              opacity: refocusLabelOpacity,
              transform: `translateY(${refocusLabelSlide}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: TEXT_PRIMARY,
              }}
            >
              to fully refocus
            </span>
            <span
              style={{
                opacity: interruptionOpacity,
                fontSize: 16,
                fontWeight: 500,
                color: TEXT_DIM,
              }}
            >
              after each interruption
            </span>
          </div>
        </div>
      </div>

      {/* ═══ SCENE 2: Workday Fragmentation ════════════════ */}
      <div
        style={{
          opacity: scene2Opacity,
          display: scene2Opacity <= 0 ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          position: "absolute",
          inset: 0,
          padding: 80,
          justifyContent: "center",
        }}
      >
        {/* "10 Notifications Per Workday" label */}
        <div
          style={{
            opacity: notifLabelOpacity,
            transform: `translateY(${notifLabelSlide}px)`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <BellIcon size={28} color={AMBER} weight="duotone" />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: TEXT_PRIMARY,
            }}
          >
            Just 10 Notifications Per Workday
          </span>
        </div>

        {/* Workday bar */}
        <div
          style={{
            opacity: barOpacity,
            width: 1200,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Hour labels */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: 4, paddingRight: 4 }}>
            {["9am", "10", "11", "12pm", "1", "2", "3", "4", "5pm"].map((h, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  color: TEXT_DIM,
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* The bar itself */}
          <div
            style={{
              position: "relative",
              height: 80,
              borderRadius: 12,
              overflow: "hidden",
              border: `1px solid ${BORDER}`,
            }}
          >
            {/* Base productive color */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: interpolate(barRedShift, [0, 1], [0, 1], clamp) > 0.5
                  ? `linear-gradient(90deg, ${GREEN}25, ${ACCENT}20)`
                  : `linear-gradient(90deg, ${GREEN}30, ${ACCENT}30)`,
                opacity: interpolate(barRedShift, [0, 1], [1, 0.3], clamp),
              }}
            />

            {/* Notification slices — red cuts through the bar */}
            {notifSlices.map((slice, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${slice.position * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: RED,
                  opacity: slice.opacity,
                  boxShadow: `0 0 20px ${RED}60, -30px 0 40px ${RED}15, 30px 0 40px ${RED}15`,
                  transform: `scaleX(${interpolate(frame, [slice.frame, slice.frame + 12], [3, 1], { ...clamp })})`,
                }}
              />
            ))}

            {/* Red fragmented zones spreading from each cut */}
            {notifSlices.map((slice, i) => {
              const spreadProgress = interpolate(frame, [slice.frame + 5, slice.frame + 40], [0, 1], { ...clamp, easing: easeOutCubic });
              return (
                <div
                  key={`zone-${i}`}
                  style={{
                    position: "absolute",
                    left: `${slice.position * 100 - 5 * spreadProgress}%`,
                    top: 0,
                    bottom: 0,
                    width: `${10 * spreadProgress}%`,
                    background: `${RED}15`,
                    opacity: slice.opacity * 0.7,
                  }}
                />
              );
            })}
          </div>

          {/* Labels below bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: `${GREEN}50` }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_DIM }}>Productive</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: `${RED}50` }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_DIM }}>Recovery time (23:15 each)</span>
            </div>
          </div>
        </div>

        {/* "4 HOURS" — big reveal */}
        <div
          style={{
            opacity: fourHoursOpacity,
            transform: `scale(${fourHoursScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 80,
                fontWeight: 700,
                color: RED,
                textShadow: `0 0 40px ${RED}50`,
                letterSpacing: -3,
              }}
            >
              ~4
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: RED,
                textShadow: `0 0 20px ${RED}30`,
              }}
            >
              HOURS
            </span>
          </div>
          <div
            style={{
              opacity: fragmentedOpacity,
              transform: `translateY(${fragmentedSlide}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <WarningIcon size={22} color={AMBER} weight="duotone" />
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: TEXT_SECONDARY,
              }}
            >
              of fragmented attention — gone
            </span>
          </div>
        </div>
      </div>

      {/* ═══ SCENE 3: The Punchline — 60-80 ════════════════ */}
      <div
        style={{
          opacity: scene3Opacity,
          display: scene3Opacity <= 0 ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          position: "absolute",
          inset: 0,
          padding: 80,
          justifyContent: "center",
        }}
      >
        {/* "You're not getting..." setup */}
        <div
          style={{
            opacity: punchSetupOpacity,
            transform: `translateY(${punchSetupSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: TEXT_SECONDARY,
            }}
          >
            You're not getting
          </span>
        </div>

        {/* The "10" that gets struck through */}
        <div
          style={{
            opacity: tenOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            position: "relative",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 96,
              fontWeight: 700,
              color: interpolate(tenStrike, [0, 1], [0, 1], clamp) > 0.5 ? TEXT_DIM : TEXT_PRIMARY,
              letterSpacing: -3,
              opacity: interpolate(tenStrike, [0, 0.5, 1], [1, 0.8, 0.35], clamp),
            }}
          >
            10
          </span>
          {/* Strikethrough line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: `${interpolate(tenStrike, [0, 1], [0, 140], clamp)}px`,
              height: 4,
              background: RED,
              borderRadius: 2,
              boxShadow: `0 0 12px ${RED}60`,
            }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 16,
              fontWeight: 500,
              color: TEXT_DIM,
              opacity: interpolate(tenStrike, [0, 1], [1, 0.4], clamp),
            }}
          >
            notifications
          </span>
        </div>

        {/* "You're getting..." */}
        <div
          style={{
            opacity: interpolate(frame, [F_SIXTY - 20, F_SIXTY - 5], [0, 1], { ...clamp }),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: TEXT_SECONDARY,
            }}
          >
            You're getting
          </span>
        </div>

        {/* THE BIG NUMBERS — 60-80 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* 60 */}
          <div
            style={{
              opacity: sixtyOpacity,
              transform: `scale(${sixtyScale})`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 140,
                fontWeight: 700,
                color: RED,
                textShadow: `0 0 ${40 + 30 * finalGlow}px ${RED}${Math.round(50 + 30 * finalGlow).toString(16)}, 0 0 80px ${RED}20`,
                letterSpacing: -5,
              }}
            >
              60
            </span>
          </div>

          {/* Dash separator */}
          <div style={{ opacity: eightyOpacity }}>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 80,
                fontWeight: 300,
                color: `${RED}80`,
              }}
            >
              —
            </span>
          </div>

          {/* 80 */}
          <div
            style={{
              opacity: eightyOpacity,
              transform: `scale(${eightyScale})`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 140,
                fontWeight: 700,
                color: RED,
                textShadow: `0 0 ${40 + 30 * finalGlow}px ${RED}${Math.round(50 + 30 * finalGlow).toString(16)}, 0 0 80px ${RED}20`,
                letterSpacing: -5,
              }}
            >
              80
            </span>
          </div>
        </div>

        {/* "notifications per day" below the big numbers */}
        <div
          style={{
            opacity: interpolate(frame, [F_EIGHTY + 5, F_EIGHTY + 18], [0, 1], { ...clamp }),
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <BellIcon size={28} color={RED} weight="duotone" />
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: TEXT_SECONDARY,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            notifications per day
          </span>
        </div>

        {/* Subtle notification bell icons floating around for atmosphere */}
        {frame >= F_SIXTY && Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2 + (frame - F_SIXTY) * 0.01;
          const radius = 350 + i * 30;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * 0.4;
          const bellFade = interpolate(frame, [F_SIXTY + i * 5, F_SIXTY + i * 5 + 15], [0, 0.15], { ...clamp });
          return (
            <div
              key={`bell-${i}`}
              style={{
                position: "absolute",
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                opacity: bellFade,
                transform: `rotate(${Math.sin((frame - F_SIXTY + i * 20) * 0.05) * 15}deg)`,
              }}
            >
              <BellIcon size={24} color={RED} weight="duotone" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Generated_AttentionCost;
