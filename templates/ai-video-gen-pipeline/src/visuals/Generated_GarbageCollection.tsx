import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { HardDrives, TreeStructure, Broom, Pause, Lightning, Timer } from "@phosphor-icons/react";

// ─── TYPES ───
type HeapObject = {
  id: string;
  label: string;
  x: number; // % position
  y: number;
  color: string;
  reachable: boolean;
  appearFrame: number;
  referencedBy?: string; // id of parent object
};

type Root = {
  label: string;
  x: number;
  y: number;
};

// ─── DATA ───
const COLORS = {
  alive: "#22c55e",
  garbage: "#ef4444",
  root: "#3b82f6",
  mark: "#22c55e",
  sweep: "#ef4444",
  pause: "#ef4444",
  concurrent: "#a855f7",
  zgc: "#06b6d4",
};

const roots: Root[] = [
  { label: "global vars", x: 8, y: 25 },
  { label: "call stack", x: 8, y: 55 },
];

const heapObjects: HeapObject[] = [
  // Reachable from global vars
  { id: "user1", label: "User()", x: 28, y: 18, color: "#3b82f6", reachable: true, appearFrame: 30, referencedBy: "root0" },
  { id: "config", label: "Config{}", x: 45, y: 15, color: "#3b82f6", reachable: true, appearFrame: 38, referencedBy: "user1" },
  { id: "db", label: "DB conn", x: 62, y: 20, color: "#06b6d4", reachable: true, appearFrame: 46, referencedBy: "config" },
  // Reachable from call stack
  { id: "arr", label: "Array[]", x: 28, y: 52, color: "#a855f7", reachable: true, appearFrame: 54, referencedBy: "root1" },
  { id: "item1", label: "Item(1)", x: 45, y: 48, color: "#a855f7", reachable: true, appearFrame: 62, referencedBy: "arr" },
  // Garbage — nothing references these
  { id: "old_user", label: "User()", x: 55, y: 60, color: "#64748b", reachable: false, appearFrame: 35 },
  { id: "old_cache", label: "Cache{}", x: 72, y: 45, color: "#64748b", reachable: false, appearFrame: 42 },
  { id: "old_tmp", label: "tmp[]", x: 75, y: 68, color: "#64748b", reachable: false, appearFrame: 50 },
  { id: "old_sess", label: "Session", x: 40, y: 72, color: "#64748b", reachable: false, appearFrame: 58 },
];

// ─── HELPERS ───
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [20, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

// ─── COMPONENT ───
const Generated_GarbageCollection: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══════════════════════════════════════════
  // SCENE BOUNDARIES
  // ═══════════════════════════════════════════
  const SCENE1_END = 350;   // Mark & Sweep demo
  const SCENE2_END = 480;   // Stop-the-world pause
  const SCENE3_END = 660;   // Concurrent GC comparison

  // Scene transitions
  const scene1Opacity = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Opacity = frame < SCENE1_END - 20 ? 0 : interpolate(frame, [SCENE1_END - 20, SCENE1_END], [0, 1], clamp)
    * interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Opacity = frame < SCENE2_END - 20 ? 0 : interpolate(frame, [SCENE2_END - 20, SCENE2_END], [0, 1], clamp);

  // ═══════════════════════════════════════════
  // SCENE 1: MARK & SWEEP (frame 0 - 350)
  // ═══════════════════════════════════════════

  // Phase timings
  const HEAP_BUILD_START = 20;
  const GARBAGE_REVEAL = 100; // objects lose references visually
  const MARK_START = 150;     // roots start marking
  const MARK_PROPAGATION_RATE = 18; // frames per hop
  const SWEEP_START = 260;

  // Title
  const titleOpacity = fadeIn(frame, 0, 20);
  const titleSlide = slideUp(frame, 0, 20);

  // Mark phase glow propagation
  const getMarkFrame = (obj: HeapObject): number => {
    if (!obj.reachable) return 99999; // never marked
    // Calculate depth from root
    let depth = 0;
    let current: HeapObject | undefined = obj;
    while (current?.referencedBy) {
      depth++;
      if (current.referencedBy.startsWith("root")) break;
      current = heapObjects.find((o) => o.id === current!.referencedBy);
    }
    return MARK_START + depth * MARK_PROPAGATION_RATE;
  };

  // Sweep phase — garbage fades out
  const getSweepProgress = (obj: HeapObject, idx: number): number => {
    if (obj.reachable) return 0;
    const sweepDelay = idx * 8;
    return interpolate(frame, [SWEEP_START + sweepDelay, SWEEP_START + sweepDelay + 25], [0, 1], clamp);
  };

  // ═══════════════════════════════════════════
  // SCENE 2: STOP-THE-WORLD (frame 350 - 480)
  // ═══════════════════════════════════════════

  const FREEZE_START = SCENE1_END;
  const PAUSE_BAR_START = FREEZE_START + 30;

  const freezeFlash = frame >= FREEZE_START && frame < FREEZE_START + 8
    ? interpolate(frame, [FREEZE_START, FREEZE_START + 4, FREEZE_START + 8], [0, 0.3, 0], clamp)
    : 0;

  const pauseTextOpacity = fadeIn(frame, FREEZE_START + 10, 15);
  const pauseBarWidth = interpolate(frame, [PAUSE_BAR_START, PAUSE_BAR_START + 40], [0, 100], {
    ...clamp, easing: Easing.out(Easing.cubic),
  });

  const heapSizeOpacity = fadeIn(frame, PAUSE_BAR_START + 50, 15);
  const heapSizeSlide = slideUp(frame, PAUSE_BAR_START + 50, 15);

  // ═══════════════════════════════════════════
  // SCENE 3: CONCURRENT GC (frame 480 - 660)
  // ═══════════════════════════════════════════

  const CONC_TITLE_START = SCENE2_END;
  const BARS_START = CONC_TITLE_START + 40;

  const gcTypes = [
    { label: "Mark & Sweep", pause: "200ms", width: 95, color: COLORS.sweep, delay: 0 },
    { label: "Go (concurrent)", pause: "<1ms", width: 8, color: COLORS.concurrent, delay: 20 },
    { label: "Java ZGC", pause: "10μs", width: 2, color: COLORS.zgc, delay: 40 },
  ];

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
      {/* ─── SCENE 1: MARK & SWEEP ─── */}
      <div style={{ position: "absolute", inset: 0, opacity: scene1Opacity, padding: 80 }}>
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.root}20, ${COLORS.root}08)`,
              border: `1.5px solid ${COLORS.root}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${COLORS.root}15`,
            }}
          >
            <HardDrives size={28} color={COLORS.root} weight="duotone" />
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>
            Mark & Sweep
          </span>
          <span style={{ fontSize: 16, color: "#64748b", marginLeft: 8 }}>
            Garbage Collection
          </span>
        </div>

        {/* Heap area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 700,
            borderRadius: 12,
            border: "1px solid #1a1a2e",
            background: "#12121f",
          }}
        >
          {/* HEAP label */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 20,
              fontSize: 11,
              fontFamily: "'SF Mono', monospace",
              fontWeight: 700,
              color: "#64748b",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            HEAP MEMORY
          </div>

          {/* Roots */}
          {roots.map((root, i) => {
            const rOpacity = fadeIn(frame, HEAP_BUILD_START + i * 12);
            const rSlide = slideUp(frame, HEAP_BUILD_START + i * 12);
            // Mark phase: roots glow green
            const rootMarkGlow = interpolate(frame, [MARK_START, MARK_START + 12], [0, 1], clamp);

            return (
              <div
                key={`root-${i}`}
                style={{
                  position: "absolute",
                  left: `${root.x}%`,
                  top: `${root.y}%`,
                  transform: `translate(-50%, -50%) translateY(${rSlide}px)`,
                  opacity: rOpacity,
                }}
              >
                <div
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    background: frame >= MARK_START
                      ? `linear-gradient(135deg, ${COLORS.root}${Math.round(8 + rootMarkGlow * 20).toString(16).padStart(2, "0")}, ${COLORS.root}08)`
                      : `${COLORS.root}10`,
                    border: `1.5px solid ${COLORS.root}${frame >= MARK_START ? "60" : "25"}`,
                    boxShadow: frame >= MARK_START
                      ? `0 0 ${20 + rootMarkGlow * 25}px ${COLORS.root}${Math.round(rootMarkGlow * 60).toString(16).padStart(2, "0")}`
                      : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TreeStructure size={18} color={COLORS.root} weight="duotone" />
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.root,
                    }}
                  >
                    {root.label}
                  </span>
                </div>
                {/* ROOT label */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 4,
                    fontSize: 10,
                    fontFamily: "'SF Mono', monospace",
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: `${COLORS.root}80`,
                  }}
                >
                  ROOT
                </div>
              </div>
            );
          })}

          {/* Heap Objects */}
          {heapObjects.map((obj, idx) => {
            const objOpacity = fadeIn(frame, obj.appearFrame);
            const objScale = spring({
              frame: Math.max(0, frame - obj.appearFrame),
              fps,
              config: { damping: 22, stiffness: 200 },
            });

            // Mark glow for reachable objects
            const markFrame = getMarkFrame(obj);
            const isMarked = frame >= markFrame + 12;
            const markProgress = interpolate(frame, [markFrame, markFrame + 12], [0, 1], clamp);

            // Sweep for garbage
            const sweepProgress = getSweepProgress(obj, idx);

            // Garbage reveal — objects that are garbage get dimmer border
            const isGarbage = !obj.reachable;
            const garbageRevealProgress = isGarbage
              ? interpolate(frame, [GARBAGE_REVEAL, GARBAGE_REVEAL + 20], [0, 1], clamp)
              : 0;

            // Colors
            const baseColor = isMarked ? COLORS.alive : isGarbage && garbageRevealProgress > 0.5 ? "#4a4a5e" : obj.color;
            const finalOpacity = objOpacity * (1 - sweepProgress);
            const finalScale = objScale * (1 - sweepProgress * 0.5);

            return (
              <div
                key={obj.id}
                style={{
                  position: "absolute",
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: `translate(-50%, -50%) scale(${finalScale})`,
                  opacity: finalOpacity,
                }}
              >
                <div
                  style={{
                    padding: "12px 20px",
                    borderRadius: 10,
                    background: `${baseColor}10`,
                    border: `1.5px solid ${baseColor}30`,
                    boxShadow: isMarked
                      ? `0 0 ${15 + markProgress * 20}px ${COLORS.alive}${Math.round(markProgress * 50).toString(16).padStart(2, "0")}`
                      : sweepProgress > 0
                        ? `0 0 10px ${COLORS.sweep}${Math.round(sweepProgress * 30).toString(16).padStart(2, "0")}`
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    filter: sweepProgress > 0 ? `grayscale(${sweepProgress * 100}%)` : "none",
                  }}
                >
                  {/* Mark indicator */}
                  {isMarked && (
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: COLORS.alive,
                        boxShadow: `0 0 8px ${COLORS.alive}80`,
                        opacity: markProgress,
                      }}
                    />
                  )}
                  {/* Garbage X */}
                  {isGarbage && sweepProgress > 0.3 && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: COLORS.sweep,
                        opacity: interpolate(sweepProgress, [0.3, 0.6], [0, 1], clamp),
                      }}
                    >
                      ✕
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: isMarked ? COLORS.alive : isGarbage && garbageRevealProgress > 0.5 ? "#64748b" : "#e2e8f0",
                    }}
                  >
                    {obj.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Phase indicator */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Mark phase label */}
            {frame >= MARK_START && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: `${COLORS.mark}10`,
                  border: `1px solid ${COLORS.mark}25`,
                  opacity: fadeIn(frame, MARK_START),
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: COLORS.mark,
                    boxShadow: `0 0 6px ${COLORS.mark}80`,
                  }}
                />
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 600, color: COLORS.mark }}>
                  MARKING
                </span>
              </div>
            )}
            {/* Sweep phase label */}
            {frame >= SWEEP_START && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: `${COLORS.sweep}10`,
                  border: `1px solid ${COLORS.sweep}25`,
                  opacity: fadeIn(frame, SWEEP_START),
                }}
              >
                <Broom size={16} color={COLORS.sweep} weight="duotone" />
                <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, fontWeight: 600, color: COLORS.sweep }}>
                  SWEEPING
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              display: "flex",
              gap: 20,
              opacity: fadeIn(frame, GARBAGE_REVEAL + 10),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.alive }} />
              <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'SF Mono', monospace" }}>reachable</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4a4a5e" }} />
              <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'SF Mono', monospace" }}>garbage</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SCENE 2: STOP-THE-WORLD ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: scene2Opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        {/* Red flash overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: COLORS.pause,
            opacity: freezeFlash,
            pointerEvents: "none",
          }}
        />

        {/* PAUSED title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 60,
            opacity: pauseTextOpacity,
          }}
        >
          <Pause size={48} color={COLORS.pause} weight="duotone" />
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: COLORS.pause,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: 4,
              textShadow: `0 0 30px ${COLORS.pause}40`,
            }}
          >
            STOP-THE-WORLD
          </span>
        </div>

        {/* Pause duration bar */}
        <div style={{ width: "70%", maxWidth: 900, marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              opacity: pauseTextOpacity,
            }}
          >
            <span style={{ fontSize: 14, color: "#94a3b8" }}>Program execution</span>
            <span style={{ fontSize: 14, fontFamily: "'SF Mono', monospace", fontWeight: 700, color: COLORS.pause }}>
              PAUSED — 200ms
            </span>
          </div>
          {/* Timeline bar */}
          <div
            style={{
              width: "100%",
              height: 48,
              borderRadius: 10,
              background: "#1a1a2e",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Running portion (left) */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${30}%`,
                background: `linear-gradient(90deg, ${COLORS.alive}30, ${COLORS.alive}15)`,
                borderRight: `2px solid ${COLORS.alive}40`,
              }}
            />
            {/* PAUSE portion (red) */}
            <div
              style={{
                position: "absolute",
                left: "30%",
                top: 0,
                height: "100%",
                width: `${pauseBarWidth * 0.35}%`,
                background: `linear-gradient(90deg, ${COLORS.pause}40, ${COLORS.pause}25)`,
                borderRight: pauseBarWidth > 90 ? `2px solid ${COLORS.pause}60` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {pauseBarWidth > 50 && (
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.pause,
                    opacity: interpolate(pauseBarWidth, [50, 80], [0, 1], clamp),
                  }}
                >
                  GC PAUSE
                </span>
              )}
            </div>
            {/* Running portion (right) */}
            {pauseBarWidth > 95 && (
              <div
                style={{
                  position: "absolute",
                  left: "65%",
                  top: 0,
                  height: "100%",
                  width: "35%",
                  background: `linear-gradient(90deg, ${COLORS.alive}15, ${COLORS.alive}30)`,
                  opacity: fadeIn(frame, PAUSE_BAR_START + 45),
                }}
              />
            )}
          </div>
        </div>

        {/* Heap size context */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: heapSizeOpacity,
            transform: `translateY(${heapSizeSlide}px)`,
          }}
        >
          <HardDrives size={24} color="#f59e0b" weight="duotone" />
          <span style={{ fontSize: 16, color: "#94a3b8" }}>
            On a{" "}
            <span style={{ fontFamily: "'SF Mono', monospace", fontWeight: 700, color: "#f59e0b" }}>2GB</span>
            {" "}heap — users notice{" "}
            <span style={{ fontFamily: "'SF Mono', monospace", fontWeight: 700, color: COLORS.pause }}>200ms</span>
            {" "}pauses
          </span>
        </div>
      </div>

      {/* ─── SCENE 3: CONCURRENT GC COMPARISON ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: scene3Opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          gap: 50,
        }}
      >
        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: fadeIn(frame, CONC_TITLE_START, 20),
            transform: `translateY(${slideUp(frame, CONC_TITLE_START, 20)}px)`,
          }}
        >
          <Lightning size={36} color={COLORS.concurrent} weight="duotone" />
          <span style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>
            Modern GC — Concurrent Marking
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: fadeIn(frame, CONC_TITLE_START + 15),
            fontSize: 16,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          Program runs <span style={{ color: COLORS.alive, fontWeight: 600 }}>while</span> GC marks objects — more CPU, but pauses drop dramatically
        </div>

        {/* Comparison bars */}
        <div style={{ width: "75%", maxWidth: 1000, display: "flex", flexDirection: "column", gap: 36 }}>
          {gcTypes.map((gc, i) => {
            const barStart = BARS_START + gc.delay;
            const barOpacity = fadeIn(frame, barStart, 15);
            const barSlide = slideUp(frame, barStart, 15);
            const barProgress = interpolate(frame, [barStart + 10, barStart + 50], [0, gc.width], {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            });

            return (
              <div
                key={gc.label}
                style={{
                  opacity: barOpacity,
                  transform: `translateY(${barSlide}px)`,
                }}
              >
                {/* Label row */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "baseline" }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>{gc.label}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>pause:</span>
                    <span
                      style={{
                        fontFamily: "'SF Mono', monospace",
                        fontSize: 18,
                        fontWeight: 700,
                        color: gc.color,
                        textShadow: `0 0 20px ${gc.color}30`,
                      }}
                    >
                      {gc.pause}
                    </span>
                  </div>
                </div>
                {/* Bar */}
                <div
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 10,
                    background: "#1a1a2e",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barProgress}%`,
                      borderRadius: 10,
                      background: `linear-gradient(90deg, ${gc.color}50, ${gc.color}30)`,
                      boxShadow: `0 0 20px ${gc.color}20`,
                      minWidth: barProgress > 0 ? 4 : 0,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ZGC note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: fadeIn(frame, BARS_START + 80),
            transform: `translateY(${slideUp(frame, BARS_START + 80)}px)`,
            padding: "12px 24px",
            borderRadius: 10,
            background: `${COLORS.zgc}08`,
            border: `1px solid ${COLORS.zgc}15`,
          }}
        >
          <Timer size={20} color={COLORS.zgc} weight="duotone" />
          <span style={{ fontSize: 14, color: "#94a3b8" }}>
            Java ZGC:{" "}
            <span style={{ color: COLORS.zgc, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
              {"<"}10μs
            </span>{" "}
            pauses — even with{" "}
            <span style={{ color: COLORS.zgc, fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>16TB</span>{" "}
            heaps
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_GarbageCollection;
