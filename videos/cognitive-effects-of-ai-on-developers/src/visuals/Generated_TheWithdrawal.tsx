import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Brain,
  Heartbeat,
  Warning,
  ChatCircleDots,
  Code,
  Lightning,
  Users,
  Eye,
} from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const easeOutCubic = Easing.out(Easing.cubic);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], {
    ...clamp,
    easing: easeOutCubic,
  });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], {
    ...clamp,
    easing: Easing.in(Easing.quad),
  });

// ─── Colors ───────────────────────────────────────────────
const BG = "#0a0a0f";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";
const AMBER = "#f59e0b";
const GREEN = "#22c55e";
const CYAN = "#06b6d4";
const TEXT = "#e2e8f0";
const DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMESTAMPS (30fps)
 * ═══════════════════════════════════════════════════════════
 * "I just spent"                f0-f9
 * "30 minutes"                  f16-f31
 * "debugging"                   f33-f49
 * "simple CSS issue"            f54-f95
 * "without AI"                  f101-f130
 * "brain...screaming for help"  f149-f217
 * "fingers...twitch...ChatGPT"  f269-f354
 * "heart rate...increased"      f380-f422
 * "sweating...flexbox"          f457-f535
 * --- PAUSE ---
 * "This isn't productivity anxiety" f583-f626
 * "or imposter syndrome"        f630-f661
 * --- PAUSE ---
 * "This is literal dopamine withdrawal" f682-f748
 * "happening to millions of developers" f768-f830
 * "brain...hijacked by AI"      f855-f937
 * "most of us don't even realize" f949-f1028
 */

// ─── Scene boundaries ──────────────────────────────────────
const SCENE1_END = 560;   // Struggling with CSS
const SCENE2_START = 540;
const SCENE2_END = 840;   // The reveal: dopamine withdrawal
const SCENE3_START = 820;
// Scene 3 goes to ~1028

// ─── Fake CSS code lines ──────────────────────────────────
const cssLines = [
  ".container {",
  "  display: flex;",
  "  justify-content: center;",
  "  align-items: ???;",
  "  flex-wrap: wrap;",
  "  gap: 16px;",
  "}",
  "",
  ".item {",
  "  flex: 1 1 auto;",
  "  /* WHY WON'T THIS WORK */",
  "  min-width: 0;",
  "}",
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_TheWithdrawal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Scene opacities ──────────────────────────────────
  const scene1Op =
    interpolate(frame, [0, 15], [0, 1], clamp) *
    interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op =
    interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp) *
    interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Op = interpolate(
    frame,
    [SCENE3_START, SCENE3_START + 20],
    [0, 1],
    clamp
  );

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ═══ SCENE 1: Struggling with CSS without AI ═══ */}
      {frame < SCENE1_END && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: scene1Op,
          }}
        >
          <Scene1_Struggle frame={frame} fps={fps} />
        </div>
      )}

      {/* ═══ SCENE 2: Dopamine Withdrawal Reveal ═══ */}
      {frame >= SCENE2_START && frame < SCENE2_END && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene2Op,
          }}
        >
          <Scene2_Reveal frame={frame} fps={fps} />
        </div>
      )}

      {/* ═══ SCENE 3: Brain Hijacked ═══ */}
      {frame >= SCENE3_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: scene3Op,
          }}
        >
          <Scene3_Hijacked frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: IDE with CSS + Struggle Symptoms
// Context Panel layout: code left, symptoms right
// ═══════════════════════════════════════════════════════════
const Scene1_Struggle: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // ─── IDE panel (left 45%) ──────────────────────────────
  const ideOp = fadeIn(frame, 0, 20);

  // Cursor blink (deterministic)
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  // "debugging" highlight on line 4 at f33
  const highlightLine4 = interpolate(frame, [33, 48], [0, 1], clamp);

  // Code jitter when frustrated (f149+ "brain screaming")
  const jitterAmount =
    frame >= 149 && frame < 420
      ? interpolate(frame, [149, 180], [0, 2], clamp)
      : 0;
  const jitterX = jitterAmount * Math.sin(frame * 1.7);
  const jitterY = jitterAmount * Math.cos(frame * 2.3);

  // ─── Right side: Symptoms ─────────────────────────────

  // f16: "30 minutes" timer appears
  const timerOp = fadeIn(frame, 16, 15);
  const timerSlide = slideUp(frame, 16, 15);
  const minuteCount = Math.min(
    30,
    Math.round(interpolate(frame, [16, 80], [0, 30], clamp))
  );

  // f149: "brain screaming" — brain icon with red glow
  const brainOp = fadeIn(frame, 149, 18);
  const brainSlide = slideUp(frame, 149, 18);
  const brainPulse =
    frame >= 185
      ? 1 + 0.03 * Math.sin((frame - 185) * 0.3)
      : 1;
  const brainGlow = interpolate(frame, [185, 210], [0, 35], clamp);

  // f269: "fingers twitch toward ChatGPT" — tab with pulse
  const tabOp = fadeIn(frame, 269, 18);
  const tabSlide = slideUp(frame, 269, 18);
  const tabPulse =
    frame >= 284
      ? 0.6 + 0.4 * Math.abs(Math.sin((frame - 284) * 0.15))
      : 0;
  const tabGlow = interpolate(frame, [284, 310], [0, 25], clamp);

  // f380: "heart rate increased" — heart rate monitor
  const heartOp = fadeIn(frame, 375, 18);
  const heartSlide = slideUp(frame, 375, 18);
  const heartScale =
    frame >= 393
      ? 1 + 0.06 * Math.abs(Math.sin((frame - 393) * 0.4))
      : 1;
  const bpm = Math.round(interpolate(frame, [380, 422], [72, 120], clamp));

  // f457: "sweating over flexbox" — sweat drops
  const sweatOp = fadeIn(frame, 457, 15);
  const sweatDrop1Y = interpolate(
    frame,
    [460, 500],
    [0, 40],
    { ...clamp, easing: Easing.in(Easing.quad) }
  );
  const sweatDrop1Op = interpolate(frame, [460, 490, 500, 510], [0, 0.8, 0.8, 0], clamp);
  const sweatDrop2Y = interpolate(
    frame,
    [475, 515],
    [0, 40],
    { ...clamp, easing: Easing.in(Easing.quad) }
  );
  const sweatDrop2Op = interpolate(frame, [475, 505, 515, 525], [0, 0.8, 0.8, 0], clamp);

  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      {/* ─── LEFT: IDE Panel ─────────────────────────── */}
      <div
        style={{
          width: "45%",
          padding: "60px 40px 60px 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          opacity: ideOp,
        }}
      >
        {/* IDE header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            padding: "10px 16px",
            background: "#12121f",
            borderRadius: "10px 10px 0 0",
            border: `1px solid ${BORDER}`,
            borderBottom: "none",
          }}
        >
          <Code size={18} color={CYAN} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: DIM,
            }}
          >
            layout.css
          </span>
          <div style={{ flex: 1 }} />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: AMBER,
            }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 11,
              color: AMBER,
              fontWeight: 500,
            }}
          >
            unsaved
          </span>
        </div>

        {/* Code area */}
        <div
          style={{
            background: "#0d0d18",
            border: `1px solid ${BORDER}`,
            borderRadius: "0 0 10px 10px",
            padding: "20px 0",
            transform: `translate(${jitterX}px, ${jitterY}px)`,
          }}
        >
          {cssLines.map((line, i) => {
            const lineOp = fadeIn(frame, i * 3, 12);
            const isHighlighted = i === 3 && highlightLine4 > 0;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "2px 20px",
                  background: isHighlighted
                    ? `${RED}${Math.round(highlightLine4 * 15)
                        .toString(16)
                        .padStart(2, "0")}`
                    : "transparent",
                  minHeight: 28,
                  opacity: lineOp,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 13,
                    color: "#4a4a5e",
                    width: 32,
                    textAlign: "right",
                    marginRight: 16,
                    userSelect: "none",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 14,
                    fontWeight: 500,
                    color: line.includes("???")
                      ? RED
                      : line.includes("/*")
                        ? DIM
                        : line.includes(":")
                          ? CYAN
                          : TEXT,
                    whiteSpace: "pre",
                  }}
                >
                  {line}
                </span>
                {i === 3 && cursorVisible && (
                  <span
                    style={{
                      width: 2,
                      height: 18,
                      background: TEXT,
                      marginLeft: 2,
                      display: "inline-block",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Timer below IDE — "30 minutes" */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: timerOp,
            transform: `translateY(${timerSlide}px)`,
          }}
        >
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 36,
              fontWeight: 700,
              color: RED,
              textShadow: `0 0 20px ${RED}30`,
              letterSpacing: -1,
            }}
          >
            {minuteCount}
          </div>
          <div>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 600,
                color: RED,
                letterSpacing: 1,
              }}
            >
              MINUTES
            </div>
            <div style={{ fontSize: 12, color: DIM, fontWeight: 500 }}>
              on a simple CSS issue
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Symptoms ─────────────────────────── */}
      <div
        style={{
          width: "55%",
          padding: "60px 80px 60px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* Brain screaming (f149) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: brainOp,
            transform: `translateY(${brainSlide}px)`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${RED}20, ${RED}08)`,
              border: `1.5px solid ${RED}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${brainGlow}px ${RED}30`,
              transform: `scale(${brainPulse})`,
              flexShrink: 0,
            }}
          >
            <Brain size={36} color={RED} weight="duotone" />
          </div>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: TEXT,
              }}
            >
              Brain Screaming for Help
            </div>
            <div style={{ fontSize: 14, color: DIM, fontWeight: 500, marginTop: 4 }}>
              Cognitive overload without AI assistance
            </div>
          </div>
        </div>

        {/* ChatGPT tab calling (f269) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: tabOp,
            transform: `translateY(${tabSlide}px)`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${GREEN}20, ${GREEN}08)`,
              border: `1.5px solid ${GREEN}${Math.round(
                35 + tabPulse * 30
              )
                .toString(16)
                .padStart(2, "0")}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${tabGlow}px ${GREEN}40`,
              flexShrink: 0,
            }}
          >
            <ChatCircleDots size={36} color={GREEN} weight="duotone" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
              Fingers Twitching to ChatGPT
            </div>
            <div style={{ fontSize: 14, color: DIM, fontWeight: 500, marginTop: 4 }}>
              Involuntary urge — the tab is RIGHT THERE
            </div>
          </div>
          {/* Pulsing "open" indicator */}
          <div
            style={{
              marginLeft: "auto",
              padding: "6px 14px",
              borderRadius: 8,
              background: `${GREEN}15`,
              border: `1px solid ${GREEN}30`,
              opacity: tabPulse,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                fontWeight: 600,
                color: GREEN,
              }}
            >
              OPEN ME
            </span>
          </div>
        </div>

        {/* Heart rate (f380) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: heartOp,
            transform: `translateY(${heartSlide}px)`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${PURPLE}20, ${PURPLE}08)`,
              border: `1.5px solid ${PURPLE}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${PURPLE}15`,
              transform: `scale(${heartScale})`,
              flexShrink: 0,
            }}
          >
            <Heartbeat size={36} color={PURPLE} weight="duotone" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
              Heart Rate Spiking
            </div>
            <div style={{ fontSize: 14, color: DIM, fontWeight: 500, marginTop: 4 }}>
              Physical stress response activating
            </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              padding: "8px 16px",
              borderRadius: 10,
              background: `${PURPLE}10`,
              border: `1px solid ${PURPLE}25`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 24,
                fontWeight: 700,
                color: PURPLE,
                letterSpacing: -1,
              }}
            >
              {bpm}
            </span>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                fontWeight: 500,
                color: DIM,
                marginLeft: 4,
              }}
            >
              BPM
            </span>
          </div>
        </div>

        {/* Sweating (f457) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: sweatOp,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${AMBER}20, ${AMBER}08)`,
              border: `1.5px solid ${AMBER}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${AMBER}15`,
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Warning size={36} color={AMBER} weight="duotone" />
            {/* Sweat drops */}
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 10,
                height: 14,
                borderRadius: "50% 50% 50% 50%",
                background: `${CYAN}80`,
                transform: `translateY(${sweatDrop1Y}px)`,
                opacity: sweatDrop1Op,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 2,
                right: 8,
                width: 8,
                height: 11,
                borderRadius: "50% 50% 50% 50%",
                background: `${CYAN}60`,
                transform: `translateY(${sweatDrop2Y}px)`,
                opacity: sweatDrop2Op,
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>
              Sweating Over Flexbox
            </div>
            <div style={{ fontSize: 14, color: DIM, fontWeight: 500, marginTop: 4 }}>
              A problem that should take 2 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: "This is dopamine withdrawal"
// ═══════════════════════════════════════════════════════════
const Scene2_Reveal: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // f583: "This isn't productivity anxiety" — crossed-out labels
  const anxietyOp = fadeIn(frame, 583, 18);
  const anxietySlide = slideUp(frame, 583, 18);
  const anxietyStrike = interpolate(frame, [600, 620], [0, 100], clamp);

  // f630: "or imposter syndrome" — second crossed-out label
  const imposterOp = fadeIn(frame, 630, 18);
  const imposterSlide = slideUp(frame, 630, 18);
  const imposterStrike = interpolate(frame, [648, 668], [0, 100], clamp);

  // f682: "This is literal dopamine withdrawal" — BIG reveal
  const revealOp = fadeIn(frame, 682, 20);
  const revealScale = spring({
    frame: Math.max(0, frame - 682),
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  const revealGlow = interpolate(frame, [700, 740], [0, 45], clamp);

  // f708: "dopamine" word — dopamine meter depleting
  const meterOp = fadeIn(frame, 708, 18);
  const meterSlide = slideUp(frame, 708, 18);
  const meterLevel = interpolate(frame, [708, 760], [0.85, 0.12], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // f768: "millions of developers"
  const millionsOp = fadeIn(frame, 768, 18);
  const millionsSlide = slideUp(frame, 768, 18);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 48,
        width: "100%",
      }}
    >
      {/* Crossed-out wrong diagnoses */}
      <div
        style={{
          display: "flex",
          gap: 40,
          alignItems: "center",
        }}
      >
        {/* "Productivity Anxiety" */}
        <div
          style={{
            opacity: anxietyOp,
            transform: `translateY(${anxietySlide}px)`,
            padding: "14px 28px",
            borderRadius: 10,
            background: `${DIM}10`,
            border: `1px solid ${DIM}20`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: DIM,
            }}
          >
            Productivity Anxiety
          </span>
          {/* Strike-through line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${anxietyStrike}%`,
              height: 2,
              background: RED,
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* "Imposter Syndrome" */}
        <div
          style={{
            opacity: imposterOp,
            transform: `translateY(${imposterSlide}px)`,
            padding: "14px 28px",
            borderRadius: 10,
            background: `${DIM}10`,
            border: `1px solid ${DIM}20`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 20,
              fontWeight: 600,
              color: DIM,
            }}
          >
            Imposter Syndrome
          </span>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${imposterStrike}%`,
              height: 2,
              background: RED,
              transform: "translateY(-50%)",
            }}
          />
        </div>
      </div>

      {/* Big reveal: DOPAMINE WITHDRAWAL */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          opacity: revealOp,
          transform: `scale(${revealScale})`,
        }}
      >
        <div
          style={{
            padding: "24px 56px",
            borderRadius: 12,
            background: `${RED}10`,
            border: `2px solid ${RED}40`,
            boxShadow: `0 0 ${revealGlow}px ${RED}25`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 32,
              fontWeight: 800,
              color: RED,
              textShadow: `0 0 20px ${RED}30`,
              letterSpacing: 1,
            }}
          >
            DOPAMINE WITHDRAWAL
          </span>
        </div>
      </div>

      {/* Dopamine meter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity: meterOp,
          transform: `translateY(${meterSlide}px)`,
          width: 600,
        }}
      >
        <Lightning size={28} color={AMBER} weight="duotone" />
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 14,
            fontWeight: 600,
            color: AMBER,
            letterSpacing: 1,
            width: 100,
          }}
        >
          DOPAMINE
        </span>
        <div
          style={{
            flex: 1,
            height: 28,
            borderRadius: 10,
            background: "#1a1a2e",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${meterLevel * 100}%`,
              height: "100%",
              borderRadius: 10,
              background:
                meterLevel > 0.5
                  ? `linear-gradient(90deg, ${GREEN}80, ${AMBER}80)`
                  : `linear-gradient(90deg, ${RED}80, ${AMBER}60)`,
              boxShadow:
                meterLevel < 0.3 ? `0 0 12px ${RED}40` : "none",
            }}
          />
          {meterLevel < 0.2 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `${RED}08`,
                borderRadius: 10,
              }}
            />
          )}
        </div>
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 16,
            fontWeight: 700,
            color: meterLevel < 0.3 ? RED : AMBER,
            width: 50,
            textAlign: "right",
          }}
        >
          {Math.round(meterLevel * 100)}%
        </span>
      </div>

      {/* "Millions of developers" */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: millionsOp,
          transform: `translateY(${millionsSlide}px)`,
          padding: "14px 28px",
          borderRadius: 10,
          background: `${PURPLE}08`,
          border: `1px solid ${PURPLE}15`,
        }}
      >
        <Users size={24} color={PURPLE} weight="duotone" />
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: TEXT,
          }}
        >
          Happening to{" "}
          <span style={{ color: PURPLE, textShadow: `0 0 12px ${PURPLE}30` }}>
            millions
          </span>{" "}
          of developers right now
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: "Your brain has been hijacked"
// ═══════════════════════════════════════════════════════════
const Scene3_Hijacked: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // f855: "Your brain has been hijacked"
  const brainOp = fadeIn(frame, 855, 20);
  const brainScale = spring({
    frame: Math.max(0, frame - 855),
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const brainGlow = interpolate(frame, [870, 910], [0, 50], clamp);

  // f879: "hijacked" — red pulse on brain
  const hijackPulse =
    frame >= 879
      ? 0.4 + 0.3 * Math.abs(Math.sin((frame - 879) * 0.12))
      : 0;

  // f901: "artificial intelligence" — AI tendrils (represented as colored bars wrapping brain)
  const tendrilOp = fadeIn(frame, 901, 20);
  const tendrilAngles = [0, 60, 120, 180, 240, 300];
  const tendrilProgress = interpolate(frame, [901, 940], [0, 1], {
    ...clamp,
    easing: easeOutCubic,
  });

  // f949: "scary part" — text
  const scaryOp = fadeIn(frame, 949, 18);
  const scarySlide = slideUp(frame, 949, 18);

  // f1002: "don't even realize" — eye icon dimming
  const eyeOp = fadeIn(frame, 1002, 15);
  const eyeDim = interpolate(frame, [1010, 1028], [1, 0.3], clamp);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 48,
        width: "100%",
      }}
    >
      {/* Central brain with AI tendrils */}
      <div
        style={{
          position: "relative",
          width: 320,
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: brainOp,
          transform: `scale(${brainScale})`,
        }}
      >
        {/* Tendril bars (radiating from brain) */}
        {tendrilAngles.map((angle, i) => {
          const colors = [RED, PURPLE, BLUE, AMBER, CYAN, GREEN];
          const len = interpolate(tendrilProgress, [0, 1], [0, 60 + i * 10], clamp);
          return (
            <div
              key={angle}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: len,
                height: 4,
                borderRadius: 2,
                background: `${colors[i]}80`,
                boxShadow: `0 0 10px ${colors[i]}40`,
                transform: `rotate(${angle}deg) translateX(80px)`,
                transformOrigin: "0 50%",
                opacity: tendrilOp,
              }}
            />
          );
        })}

        {/* Brain circle */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: `${RED}${Math.round(8 + hijackPulse * 12)
              .toString(16)
              .padStart(2, "0")}`,
            border: `3px solid ${RED}${Math.round(40 + hijackPulse * 40)
              .toString(16)
              .padStart(2, "0")}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${brainGlow}px ${RED}25, inset 0 0 30px ${RED}08`,
          }}
        >
          <Brain size={64} color={RED} weight="duotone" />
        </div>
      </div>

      {/* "HIJACKED BY AI" label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: interpolate(frame, [879, 894], [0, 1], clamp),
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 24,
            fontWeight: 700,
            color: RED,
            letterSpacing: 2,
            textShadow: `0 0 15px ${RED}30`,
          }}
        >
          HIJACKED BY ARTIFICIAL INTELLIGENCE
        </span>
      </div>

      {/* "Scary part" + "don't realize" */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity: scaryOp,
          transform: `translateY(${scarySlide}px)`,
        }}
      >
        <div
          style={{
            opacity: eyeOp,
            transform: `scale(${eyeDim})`,
          }}
        >
          <Eye size={28} color={DIM} weight="duotone" />
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: DIM,
          }}
        >
          The scary part: most of us don't even realize it's happening
        </span>
      </div>
    </div>
  );
};

export default Generated_TheWithdrawal;
