import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Audio,
  staticFile,
} from "remotion";
import { Lock, Lightning, Warning, CheckCircle, ArrowRight, ArrowLeft } from "@phosphor-icons/react";

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
const THREAD_A = "#3b82f6";
const THREAD_B = "#a855f7";
const ERROR = "#ef4444";
const SUCCESS = "#22c55e";
const ATOMIC = "#f59e0b";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from ElevenLabs timestamps
 * ═══════════════════════════════════════════════════════════
 * "Race conditions..."              → f0
 * "Imagine two threads...counter"   → f130–f209
 * "Thread A reads...it's 5"         → f240–f300
 * "Thread B also reads...still 5"   → f338–f398
 * "Thread A writes 6"               → f431
 * "Thread B writes 6"               → f488
 * "You lost an increment"           → f550
 * "counter should be 7 but it's 6"  → f599
 * "The fix? Use a mutex lock"       → f666–f698
 * "Before reading, acquire lock"    → f751
 * "Other threads wait"              → f815
 * "Read, increment, write, release" → f858
 * "Now it's thread-safe"            → f955
 * "In Go, sync.Mutex...two lines"   → f1010–f1098
 * "mu.Lock()"                       → f1134
 * "mu.Unlock() after"               → f1234
 * "Or even better, atomic"          → f1318
 * "atomic.AddInt64"                 → f1398
 * "10x faster"                      → f1504
 * End                               → f1595
 */

// ─── Thread Box ───────────────────────────────────────────
const ThreadBox: React.FC<{
  label: string;
  color: string;
  value: string | null;
  opacity: number;
  translateY: number;
  dimmed?: boolean;
  action?: string;
}> = ({ label, color, value, opacity, translateY, dimmed, action }) => (
  <div
    style={{
      opacity: opacity * (dimmed ? 0.3 : 1),
      transform: `translateY(${translateY}px)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      width: 320,
    }}
  >
    <div
      style={{
        background: `${color}12`,
        border: `2px solid ${color}${dimmed ? "20" : "50"}`,
        borderRadius: 12,
        padding: "28px 36px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: "100%",
        boxShadow: dimmed ? "none" : `0 0 20px ${color}15`,
        filter: dimmed ? "grayscale(0.6)" : "none",
      }}
    >
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      {value !== null && (
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 16,
            color: TEXT_DIM,
            fontWeight: 500,
          }}
        >
          local = {value}
        </span>
      )}
      {action && (
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 14,
            color: `${color}cc`,
            fontWeight: 600,
            padding: "4px 12px",
            background: `${color}15`,
            borderRadius: 6,
          }}
        >
          {action}
        </span>
      )}
    </div>
  </div>
);

// ─── Counter Display ──────────────────────────────────────
const CounterDisplay: React.FC<{
  value: number;
  opacity: number;
  scale: number;
  glowColor: string;
  label?: string;
}> = ({ value, opacity, scale, glowColor, label }) => (
  <div
    style={{
      opacity,
      transform: `scale(${scale})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
    }}
  >
    <span
      style={{
        fontFamily: "'SF Mono', monospace",
        fontSize: 14,
        fontWeight: 600,
        color: TEXT_DIM,
        letterSpacing: 2,
        textTransform: "uppercase",
      }}
    >
      COUNTER
    </span>
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: 70,
        background: `${glowColor}10`,
        border: `3px solid ${glowColor}60`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 40px ${glowColor}25, inset 0 0 30px ${glowColor}08`,
      }}
    >
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 56,
          fontWeight: 700,
          color: glowColor,
          textShadow: `0 0 20px ${glowColor}40`,
          letterSpacing: -2,
        }}
      >
        {value}
      </span>
    </div>
    {label && (
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 600,
          color: glowColor,
          marginTop: 4,
        }}
      >
        {label}
      </span>
    )}
  </div>
);

// ─── Arrow Pulse ──────────────────────────────────────────
const ArrowPulse: React.FC<{
  direction: "left" | "right";
  color: string;
  label: string;
  opacity: number;
}> = ({ direction, color, label, opacity }) => (
  <div
    style={{
      opacity,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
    }}
  >
    <span
      style={{
        fontFamily: "'SF Mono', monospace",
        fontSize: 13,
        fontWeight: 600,
        color: `${color}cc`,
      }}
    >
      {label}
    </span>
    {direction === "right" ? (
      <ArrowRight size={28} color={color} weight="bold" />
    ) : (
      <ArrowLeft size={28} color={color} weight="bold" />
    )}
  </div>
);

// ─── Code Block ───────────────────────────────────────────
const CodeBlock: React.FC<{
  lines: { text: string; opacity: number }[];
  opacity: number;
  translateY: number;
}> = ({ lines, opacity, translateY }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      background: "#12121f",
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      padding: "20px 28px",
      maxWidth: 520,
    }}
  >
    {lines.map((line, i) => (
      <div
        key={i}
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 16,
          fontWeight: 500,
          color: line.text.startsWith("//") ? TEXT_DIM : TEXT_PRIMARY,
          lineHeight: 1.8,
          whiteSpace: "pre",
          opacity: line.opacity,
        }}
      >
        {line.text.includes("mu.Lock") || line.text.includes("mu.Unlock") ? (
          <span style={{ color: SUCCESS, textShadow: `0 0 8px ${SUCCESS}30` }}>{line.text}</span>
        ) : line.text.includes("atomic") ? (
          <span style={{ color: ATOMIC, textShadow: `0 0 8px ${ATOMIC}30` }}>{line.text}</span>
        ) : (
          line.text
        )}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT — synced to voiceover timestamps
// ═══════════════════════════════════════════════════════════
const Generated_RaceConditions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── TITLE (f0 — "Race conditions...") ────────────────
  const titleOpacity = fadeIn(frame, 0, 20);
  const titleSlide = slideUp(frame, 0, 20);

  // ─── RACE PHASE: Counter + Threads (f130+) ────────────
  // f130: "Imagine two threads" → counter + threads appear
  const counterOpacity = fadeIn(frame, 130, 20);
  const counterScale = spring({ frame: Math.max(0, frame - 130), fps, config: { damping: 22, stiffness: 180 } });

  const threadAOpacity = fadeIn(frame, 140, 18);
  const threadASlide = slideUp(frame, 140, 18);
  const threadBOpacity = fadeIn(frame, 150, 18);
  const threadBSlide = slideUp(frame, 150, 18);

  // f240: "Thread A reads the value" → READ arrow A
  const readAOpacity = interpolate(frame, [240, 255, 420, 435], [0, 1, 1, 0], { ...clamp });
  // f338: "Thread B also reads" → READ arrow B
  const readBOpacity = interpolate(frame, [338, 353, 420, 435], [0, 1, 1, 0], { ...clamp });

  // Thread A: shows local=5 at f300 ("it's 5"), action at f240/f431
  const threadAValue = frame >= 300 ? "5" : null;
  const threadAAction =
    frame >= 431 && frame < 520
      ? "WRITE 6"
      : frame >= 240 && frame < 431
        ? "READ → 5"
        : undefined;

  // Thread B: shows local=5 at f398 ("still 5"), action at f338/f488
  const threadBValue = frame >= 398 ? "5" : null;
  const threadBAction =
    frame >= 488 && frame < 550
      ? "WRITE 6"
      : frame >= 338 && frame < 488
        ? "READ → 5"
        : undefined;

  // f431: "Thread A writes 6" → WRITE arrow A
  const writeAOpacity = interpolate(frame, [431, 446, 520, 535], [0, 1, 1, 0], { ...clamp });
  // f488: "Thread B writes 6" → WRITE arrow B
  const writeBOpacity = interpolate(frame, [488, 503, 540, 555], [0, 1, 1, 0], { ...clamp });

  // Counter value: 5 → 6 at f431 (Thread A writes)
  const counterValue = frame < 431 ? 5 : 6;

  // Counter color: white → red at f550 ("You lost an increment")
  const counterGlow =
    frame >= 550 && frame < 680 ? ERROR : TEXT_PRIMARY;

  // f550: "You lost an increment" → error warning
  const errorOpacity = interpolate(frame, [550, 565, 650, 670], [0, 1, 1, 0], { ...clamp });
  const errorSlide = slideUp(frame, 550, 15);

  // f599: "counter should be 7 but it's 6"
  const expectedLabel =
    frame >= 599 && frame < 670 ? "Expected: 7 — Got: 6" : undefined;

  // Race scene fades out at f650 (before mutex appears)
  const raceSceneFade =
    frame < 650 ? 1 : fadeOut(frame, 650, 30);

  // ─── MUTEX PHASE (f666–f1280) ─────────────────────────
  // f666: "The fix?" — phase appears
  // f698: "Use a mutex lock"
  const mutexPhaseOpacity =
    frame < 666 ? 0 : frame < 1280 ? fadeIn(frame, 670, 25) : fadeOut(frame, 1280, 30);

  const lockOpacity = fadeIn(frame, 690, 15);
  const lockScale = spring({
    frame: Math.max(0, frame - 690),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // f751: "Before reading, acquire the lock" → Thread A active
  // f815: "Other threads wait" → Thread B dimmed
  // f858: "Read, increment, write, release" → sequential steps
  // f955: "Now it's thread-safe" → counter = 7
  const mutexCounterValue =
    frame < 858 ? 5 : frame < 920 ? 6 : 7;
  const mutexCounterColor =
    frame >= 920 ? SUCCESS : TEXT_PRIMARY;

  const threadAMutexAction =
    frame >= 751 && frame < 920
      ? "LOCK → READ → WRITE → UNLOCK"
      : frame >= 920
        ? "✓ DONE"
        : undefined;
  const threadBMutexAction =
    frame >= 815 && frame < 920
      ? "WAITING..."
      : frame >= 920 && frame < 970
        ? "LOCK → READ → WRITE → UNLOCK"
        : frame >= 970
          ? "✓ DONE"
          : undefined;
  const threadBDimmed = frame >= 751 && frame < 920;

  // f955: "Now it's thread-safe" → success indicator
  const successOpacity = fadeIn(frame, 955, 15);
  const successSlide = slideUp(frame, 955, 15);

  // f1010: "In Go, sync.Mutex — just two lines"
  // f1134: "mu.Lock()" — first line appears
  // f1234: "mu.Unlock() after" — second line appears
  const codeBlockOpacity = fadeIn(frame, 1010, 20);
  const codeBlockSlide = slideUp(frame, 1010, 20);
  const muLockLineOpacity = fadeIn(frame, 1134, 15);
  const counterPPOpacity = fadeIn(frame, 1170, 15);
  const muUnlockLineOpacity = fadeIn(frame, 1234, 15);

  // ─── ATOMIC PHASE (f1318–f1600) ───────────────────────
  // f1318: "Or even better"
  const atomicPhaseOpacity = frame < 1300 ? 0 : fadeIn(frame, 1310, 20);

  // f1398: "atomic.AddInt64"
  const atomicCodeOpacity = fadeIn(frame, 1390, 20);
  const atomicCodeSlide = slideUp(frame, 1390, 20);

  // f1504: "10x faster"
  const badgeOpacity = fadeIn(frame, 1500, 15);
  const badgeScale = spring({
    frame: Math.max(0, frame - 1500),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // ─── Phase visibility ─────────────────────────────────
  const showRacePhase = frame < 680;
  const showMutexPhase = frame >= 666 && frame < 1310;
  const showAtomicPhase = frame >= 1300;

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
      {/* ─── Voiceover Audio ─────────────────────────────── */}
      <Audio src={staticFile("voiceover-race.mp3")} volume={1} />

      {/* ─── Title ───────────────────────────────────────── */}
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
        <h1
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: -0.5,
            margin: 0,
          }}
        >
          Race Conditions
        </h1>
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 500,
            color: TEXT_DIM,
            marginTop: 8,
          }}
        >
          Concurrent Programming's Trickiest Bug
        </p>
      </div>

      {/* ═══ PHASE 1: RACE CONDITION DEMO ═════════════════ */}
      {showRacePhase && (
        <div
          style={{
            opacity: raceSceneFade,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 60,
            marginTop: 20,
          }}
        >
          {/* Thread A */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <ThreadBox
              label="Thread A"
              color={THREAD_A}
              value={threadAValue}
              opacity={threadAOpacity}
              translateY={threadASlide}
              action={threadAAction}
            />
            <div style={{ opacity: readAOpacity }}>
              <ArrowPulse direction="left" color={THREAD_A} label="READ" opacity={1} />
            </div>
            <div style={{ opacity: writeAOpacity }}>
              <ArrowPulse direction="right" color={THREAD_A} label="WRITE 6" opacity={1} />
            </div>
          </div>

          {/* Counter */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <CounterDisplay
              value={counterValue}
              opacity={counterOpacity}
              scale={counterScale}
              glowColor={counterGlow}
              label={expectedLabel}
            />
            {frame >= 550 && frame < 670 && (
              <div
                style={{
                  opacity: errorOpacity,
                  transform: `translateY(${errorSlide}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 20px",
                  background: `${ERROR}12`,
                  border: `1px solid ${ERROR}30`,
                  borderRadius: 10,
                }}
              >
                <Warning size={24} color={ERROR} weight="duotone" />
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 15,
                    fontWeight: 600,
                    color: ERROR,
                  }}
                >
                  Lost increment!
                </span>
              </div>
            )}
          </div>

          {/* Thread B */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <ThreadBox
              label="Thread B"
              color={THREAD_B}
              value={threadBValue}
              opacity={threadBOpacity}
              translateY={threadBSlide}
              action={threadBAction}
            />
            <div style={{ opacity: readBOpacity }}>
              <ArrowPulse direction="right" color={THREAD_B} label="READ" opacity={1} />
            </div>
            <div style={{ opacity: writeBOpacity }}>
              <ArrowPulse direction="left" color={THREAD_B} label="WRITE 6" opacity={1} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ PHASE 2: MUTEX FIX ═══════════════════════════ */}
      {showMutexPhase && (
        <div
          style={{
            opacity: mutexPhaseOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 36,
            marginTop: 20,
          }}
        >
          {/* "THE FIX: MUTEX LOCK" label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: lockOpacity,
              transform: `scale(${lockScale})`,
            }}
          >
            <Lock size={28} color={SUCCESS} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: SUCCESS,
                letterSpacing: 1,
              }}
            >
              THE FIX: MUTEX LOCK
            </span>
          </div>

          {/* Threads + Counter row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 60,
            }}
          >
            <ThreadBox
              label="Thread A"
              color={THREAD_A}
              value={null}
              opacity={fadeIn(frame, 710, 15)}
              translateY={slideUp(frame, 710, 15)}
              action={threadAMutexAction}
            />

            <CounterDisplay
              value={mutexCounterValue}
              opacity={fadeIn(frame, 720, 15)}
              scale={1}
              glowColor={mutexCounterColor}
            />

            <ThreadBox
              label="Thread B"
              color={THREAD_B}
              value={null}
              opacity={fadeIn(frame, 710, 15)}
              translateY={slideUp(frame, 710, 15)}
              action={threadBMutexAction}
              dimmed={threadBDimmed}
            />
          </div>

          {/* f955: "Now it's thread-safe" — success */}
          {frame >= 955 && (
            <div
              style={{
                opacity: successOpacity,
                transform: `translateY(${successSlide}px)`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CheckCircle size={24} color={SUCCESS} weight="duotone" />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: SUCCESS,
                }}
              >
                Thread-safe! Counter = 7
              </span>
            </div>
          )}

          {/* f1010: Go code — lines appear progressively */}
          {frame >= 1010 && (
            <CodeBlock
              lines={[
                { text: "// Go sync.Mutex", opacity: fadeIn(frame, 1010, 15) },
                { text: "mu.Lock()", opacity: muLockLineOpacity },
                { text: "counter++", opacity: counterPPOpacity },
                { text: "mu.Unlock()", opacity: muUnlockLineOpacity },
              ]}
              opacity={codeBlockOpacity}
              translateY={codeBlockSlide}
            />
          )}
        </div>
      )}

      {/* ═══ PHASE 3: ATOMIC OPERATIONS ═══════════════════ */}
      {showAtomicPhase && (
        <div
          style={{
            opacity: atomicPhaseOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            marginTop: 20,
          }}
        >
          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Lightning size={28} color={ATOMIC} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: ATOMIC,
                letterSpacing: 1,
              }}
            >
              EVEN BETTER: ATOMIC OPERATIONS
            </span>
          </div>

          {/* f1398: atomic.AddInt64 code */}
          <CodeBlock
            lines={[
              { text: "// Lock-free, no mutex needed", opacity: fadeIn(frame, 1390, 15) },
              { text: "atomic.AddInt64(&counter, 1)", opacity: fadeIn(frame, 1398, 15) },
            ]}
            opacity={atomicCodeOpacity}
            translateY={atomicCodeSlide}
          />

          {/* f1504: "10x faster" badge */}
          <div
            style={{
              opacity: badgeOpacity,
              transform: `scale(${badgeScale})`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 32px",
              background: `${ATOMIC}10`,
              border: `2px solid ${ATOMIC}40`,
              borderRadius: 12,
              boxShadow: `0 0 30px ${ATOMIC}15`,
            }}
          >
            <Lightning size={32} color={ATOMIC} weight="fill" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: ATOMIC,
                textShadow: `0 0 15px ${ATOMIC}40`,
              }}
            >
              10x FASTER
            </span>
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 500,
                color: TEXT_DIM,
              }}
            >
              than mutex for simple counters
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_RaceConditions;
