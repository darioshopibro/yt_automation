import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  GitMerge,
  GitBranch,
  Warning,
  CheckCircle,
  FileCode,
  TreeStructure,
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
const BG = "#030305";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const TEXT = "#f8fafc";
const TEXT_MUTED = "#94a3b8";
const ERROR = "#ef4444";
const SUCCESS = "#22c55e";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from provided timestamps
 * ═══════════════════════════════════════════════════════════
 * "Merging"                    → f2982
 * "magic"                      → f3038
 * "walks back"                 → f3095/f3104
 * "both branch"                → f3118/f3126
 * "histories"                  → f3136
 * "common ancestor"            → f3178/f3190
 * "commit"                     → f3206
 * "compares trees"             → f3263/f3277/f3280
 * "both branches changed"      → f3325/f3333/f3347
 * "same file same place"       → f3360/f3369/f3385/f3393
 * "merge conflict"             → f3432/f3442
 * "different files"            → f3493/f3503/f3514
 * "automatically combines"     → f3608/f3630
 * "three-way merge"            → f3694/f3710/f3721
 * "ancestor"                   → f3735
 * "yours"                      → f3765
 * "theirs"                     → f3790
 */

// ─── Frame constants from timestamps ──────────────────────
const F_MERGING = 2982;
const F_MAGIC = 3038;
const F_WALKS_BACK = 3095;
const F_BOTH_BRANCH = 3118;
const F_HISTORIES = 3136;
const F_COMMON_ANCESTOR = 3178;
const F_COMMIT = 3206;
const F_COMPARES_TREES = 3263;
const F_BOTH_CHANGED = 3325;
const F_SAME_FILE = 3360;
const F_SAME_PLACE = 3393;
const F_MERGE_CONFLICT = 3432;
const F_DIFFERENT_FILES = 3493;
const F_AUTO_COMBINES = 3608;
const F_THREE_WAY = 3694;
const F_ANCESTOR_END = 3735;
const F_YOURS = 3765;
const F_THEIRS = 3790;

// ─── Scene boundaries ─────────────────────────────────────
const SCENE1_END = 3280;
const SCENE2_START = 3260;
const SCENE2_END = 3650;
const SCENE3_START = 3630;

// ─── Commit Node ──────────────────────────────────────────
const CommitNode: React.FC<{
  color: string;
  opacity: number;
  scale?: number;
  glow?: boolean;
  label?: string;
  labelOpacity?: number;
}> = ({ color, opacity, scale = 1, glow = false, label, labelOpacity = 1 }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      opacity,
      transform: `scale(${scale})`,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: `${color}${glow ? "40" : "20"}`,
        border: `2.5px solid ${color}`,
        boxShadow: glow ? `0 0 30px ${color}60, 0 0 60px ${color}30` : `0 0 10px ${color}20`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: color,
        }}
      />
    </div>
    {label && (
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color: `${color}cc`,
          opacity: labelOpacity,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
    )}
  </div>
);

// ─── Branch Line ──────────────────────────────────────────
const BranchLine: React.FC<{
  color: string;
  width: number;
  opacity: number;
}> = ({ color, width, opacity }) => (
  <div
    style={{
      width,
      height: 3,
      background: `linear-gradient(90deg, ${color}60, ${color}30)`,
      borderRadius: 2,
      opacity,
    }}
  />
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_Merging: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Scene opacities ────────────────────────────────────
  const scene1Op = frame < SCENE1_END - 20
    ? 1
    : interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp)
    * (frame < SCENE2_END - 20 ? 1 : interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp));
  const scene3Op = interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

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
      {/* ════════════ SCENE 1: Branch histories → Common Ancestor ════════════ */}
      {frame < SCENE1_END && (
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
          <Scene1_Ancestry frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Conflict vs Auto-merge ════════════ */}
      {frame >= SCENE2_START && frame < SCENE2_END && (
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
          <Scene2_ConflictVsAuto frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: Three-way merge ════════════ */}
      {frame >= SCENE3_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: scene3Op,
          }}
        >
          <Scene3_ThreeWayMerge frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Two branches walking back to common ancestor
// ═══════════════════════════════════════════════════════════
const Scene1_Ancestry: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // 🔊 SOUND: scene_start @ frame 2982 — "Merging" title fades in
  const titleOp = fadeIn(frame, F_MERGING, 20);
  const titleSlide = slideUp(frame, F_MERGING, 20);

  // 🔊 SOUND: element_appear @ frame 3038 — "magic" subtitle sparkle
  const subOp = fadeIn(frame, F_MAGIC, 15);

  // 🔊 SOUND: element_appear @ frame 3095 — branch A commit trail starts appearing
  // Branch A (top) — commits appear right to left as git "walks back"
  const branchACommits = [0, 1, 2, 3].map((i) => {
    const commitFrame = F_WALKS_BACK + i * 12;
    return {
      opacity: fadeIn(frame, commitFrame, 12),
      scale: spring({
        frame: Math.max(0, frame - commitFrame),
        fps,
        config: { damping: 22, stiffness: 200 },
      }),
    };
  });

  // 🔊 SOUND: element_appear @ frame 3118 — branch B commit trail starts appearing
  const branchBCommits = [0, 1, 2, 3].map((i) => {
    const commitFrame = F_BOTH_BRANCH + i * 12;
    return {
      opacity: fadeIn(frame, commitFrame, 12),
      scale: spring({
        frame: Math.max(0, frame - commitFrame),
        fps,
        config: { damping: 22, stiffness: 200 },
      }),
    };
  });

  // Branch lines extend as commits appear
  // 🔊 SOUND: element_appear @ frame 3095 — branch lines draw out
  const branchLineProgress = interpolate(
    frame,
    [F_WALKS_BACK, F_HISTORIES],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // 🔊 SOUND: reveal @ frame 3178 — common ancestor node glows bright
  const ancestorOp = fadeIn(frame, F_COMMON_ANCESTOR, 18);
  const ancestorScale = spring({
    frame: Math.max(0, frame - F_COMMON_ANCESTOR),
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  const ancestorGlow = frame >= F_COMMON_ANCESTOR;

  // 🔊 SOUND: element_appear @ frame 3206 — "commit" label appears on ancestor
  const commitLabelOp = fadeIn(frame, F_COMMIT, 12);

  // Scan highlight — a glow that travels back along branches
  const scanProgress = interpolate(
    frame,
    [F_WALKS_BACK, F_COMMON_ANCESTOR],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // 🔊 SOUND: element_appear @ frame 3263 — "compares the trees" text appears
  const comparesOp = fadeIn(frame, F_COMPARES_TREES, 15);
  const comparesSlide = slideUp(frame, F_COMPARES_TREES, 15);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleSlide}px)`,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <GitMerge size={36} color={PRIMARY} weight="duotone" />
          <h1
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 32,
              fontWeight: 700,
              color: TEXT,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Merging
          </h1>
        </div>
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 500,
            color: TEXT_MUTED,
            marginTop: 8,
            opacity: subOp,
          }}
        >
          Where the magic happens
        </p>
      </div>

      {/* Branch visualization — two branches converging to ancestor */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          position: "relative",
          width: "100%",
          maxWidth: 1200,
        }}
      >
        {/* Branch A label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: fadeIn(frame, F_WALKS_BACK - 5, 12),
          }}
        >
          <GitBranch size={22} color={PRIMARY} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 15,
              fontWeight: 600,
              color: PRIMARY,
              letterSpacing: 1,
            }}
          >
            feature-branch
          </span>
        </div>

        {/* Branch A — commits + line */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {branchACommits.map((c, i) => (
            <React.Fragment key={`a-${i}`}>
              <CommitNode
                color={PRIMARY}
                opacity={c.opacity}
                scale={c.scale}
                label={i === 3 ? "HEAD" : undefined}
              />
              {i < 3 && (
                <BranchLine
                  color={PRIMARY}
                  width={60 * branchLineProgress}
                  opacity={c.opacity}
                />
              )}
            </React.Fragment>
          ))}

          {/* Scan dot traveling back */}
          <div
            style={{
              position: "absolute",
              right: `${20 + scanProgress * 60}%`,
              top: "33%",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: ACCENT,
              boxShadow: `0 0 15px ${ACCENT}80`,
              opacity: scanProgress > 0 && scanProgress < 1 ? 0.9 : 0,
              transform: "translateY(-50%)",
            }}
          />
        </div>

        {/* Converging arrows into ancestor */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* Convergence lines */}
          <div
            style={{
              display: "flex",
              gap: 80,
              opacity: ancestorOp,
            }}
          >
            <div
              style={{
                width: 3,
                height: 30,
                background: `linear-gradient(${PRIMARY}50, ${ACCENT}60)`,
                borderRadius: 2,
                transform: "rotate(20deg)",
              }}
            />
            <div
              style={{
                width: 3,
                height: 30,
                background: `linear-gradient(${SECONDARY}50, ${ACCENT}60)`,
                borderRadius: 2,
                transform: "rotate(-20deg)",
              }}
            />
          </div>

          {/* Common ancestor node — BIG + GLOWING */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: ancestorOp,
              transform: `scale(${ancestorScale})`,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: `${ACCENT}25`,
                border: `3px solid ${ACCENT}`,
                boxShadow: ancestorGlow
                  ? `0 0 40px ${ACCENT}50, 0 0 80px ${ACCENT}20`
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: ACCENT,
                  boxShadow: `0 0 15px ${ACCENT}80`,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: 1,
                textShadow: `0 0 15px ${ACCENT}40`,
                opacity: commitLabelOp,
              }}
            >
              COMMON ANCESTOR
            </span>
          </div>

          {/* Convergence lines down */}
          <div
            style={{
              display: "flex",
              gap: 80,
              opacity: ancestorOp,
            }}
          >
            <div
              style={{
                width: 3,
                height: 30,
                background: `linear-gradient(${ACCENT}60, ${PRIMARY}50)`,
                borderRadius: 2,
                transform: "rotate(-20deg)",
              }}
            />
            <div
              style={{
                width: 3,
                height: 30,
                background: `linear-gradient(${ACCENT}60, ${SECONDARY}50)`,
                borderRadius: 2,
                transform: "rotate(20deg)",
              }}
            />
          </div>
        </div>

        {/* Branch B label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: fadeIn(frame, F_BOTH_BRANCH - 5, 12),
          }}
        >
          <GitBranch size={22} color={SECONDARY} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 15,
              fontWeight: 600,
              color: SECONDARY,
              letterSpacing: 1,
            }}
          >
            main
          </span>
        </div>

        {/* Branch B — commits + line */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {branchBCommits.map((c, i) => (
            <React.Fragment key={`b-${i}`}>
              <CommitNode
                color={SECONDARY}
                opacity={c.opacity}
                scale={c.scale}
                label={i === 3 ? "HEAD" : undefined}
              />
              {i < 3 && (
                <BranchLine
                  color={SECONDARY}
                  width={60 * branchLineProgress}
                  opacity={c.opacity}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* "Compares the trees" text */}
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 600,
          color: TEXT_MUTED,
          opacity: comparesOp,
          transform: `translateY(${comparesSlide}px)`,
        }}
      >
        Then it compares the trees...
      </span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Merge Conflict vs Auto-merge
// ═══════════════════════════════════════════════════════════
const Scene2_ConflictVsAuto: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // 🔊 SOUND: scene_start @ frame 3280 — split screen appears
  const headerOp = fadeIn(frame, F_COMPARES_TREES + 20, 18);
  const headerSlide = slideUp(frame, F_COMPARES_TREES + 20, 18);

  // ── LEFT SIDE: Merge Conflict ──
  // 🔊 SOUND: element_appear @ frame 3325 — "Both branches changed" — file icons appear
  const conflictFileOp = fadeIn(frame, F_BOTH_CHANGED, 15);
  const conflictFileSlide = slideUp(frame, F_BOTH_CHANGED, 15);

  // 🔊 SOUND: element_appear @ frame 3360 — "same file" highlight
  const sameFileGlow = interpolate(
    frame,
    [F_SAME_FILE, F_SAME_FILE + 20],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // 🔊 SOUND: element_appear @ frame 3393 — "same place" — overlap highlight
  const samePlaceOp = fadeIn(frame, F_SAME_PLACE, 12);

  // 🔊 SOUND: reveal @ frame 3432 — MERGE CONFLICT warning pops in red
  const conflictOp = fadeIn(frame, F_MERGE_CONFLICT, 15);
  const conflictScale = spring({
    frame: Math.max(0, frame - F_MERGE_CONFLICT),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const conflictShake = frame >= F_MERGE_CONFLICT && frame < F_MERGE_CONFLICT + 20
    ? Math.sin((frame - F_MERGE_CONFLICT) * 1.5) * 3
    : 0;

  // ── RIGHT SIDE: Auto-merge ──
  // 🔊 SOUND: element_appear @ frame 3493 — "different files" — separate file icons
  const diffFilesOp = fadeIn(frame, F_DIFFERENT_FILES, 15);
  const diffFilesSlide = slideUp(frame, F_DIFFERENT_FILES, 15);

  // 🔊 SOUND: reveal @ frame 3608 — "automatically combines" — green success
  const autoMergeOp = fadeIn(frame, F_AUTO_COMBINES, 18);
  const autoMergeScale = spring({
    frame: Math.max(0, frame - F_AUTO_COMBINES),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // Divider between the two scenarios
  const dividerOp = fadeIn(frame, F_BOTH_CHANGED + 10, 20);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Header */}
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 24,
          fontWeight: 700,
          color: TEXT,
          opacity: headerOp,
          transform: `translateY(${headerSlide}px)`,
        }}
      >
        What happens when branches diverge?
      </span>

      {/* Split view */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 60,
          width: "100%",
          maxWidth: 1400,
        }}
      >
        {/* ── LEFT: Conflict ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "36px 32px",
            borderRadius: 12,
            background: `${ERROR}06`,
            border: `1px solid ${ERROR}15`,
          }}
        >
          {/* Two file icons pointing at same spot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              opacity: conflictFileOp,
              transform: `translateY(${conflictFileSlide}px)`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}08)`,
                  border: `1.5px solid ${PRIMARY}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: sameFileGlow > 0 ? `0 0 ${20 * sameFileGlow}px ${ERROR}30` : "none",
                }}
              >
                <FileCode size={28} color={PRIMARY} weight="duotone" />
              </div>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: PRIMARY, fontWeight: 600 }}>
                Branch A
              </span>
            </div>

            {/* Overlap indicator */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                opacity: samePlaceOp,
              }}
            >
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: TEXT_MUTED }}>
                same file
              </span>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: ERROR }}>
                same line
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${SECONDARY}20, ${SECONDARY}08)`,
                  border: `1.5px solid ${SECONDARY}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: sameFileGlow > 0 ? `0 0 ${20 * sameFileGlow}px ${ERROR}30` : "none",
                }}
              >
                <FileCode size={28} color={SECONDARY} weight="duotone" />
              </div>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: SECONDARY, fontWeight: 600 }}>
                Branch B
              </span>
            </div>
          </div>

          {/* Conflict code representation */}
          <div
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: 10,
              background: "#0a0a12",
              border: `1px solid ${BORDER}`,
              opacity: samePlaceOp,
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.8 }}>
              <div style={{ color: ERROR }}>{"<<<<<<< yours"}</div>
              <div style={{ color: PRIMARY }}>{"  color: 'blue'"}</div>
              <div style={{ color: TEXT_MUTED }}>{"======="}</div>
              <div style={{ color: SECONDARY }}>{"  color: 'cyan'"}</div>
              <div style={{ color: ERROR }}>{">>>>>>> theirs"}</div>
            </div>
          </div>

          {/* MERGE CONFLICT badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 28px",
              borderRadius: 10,
              background: `${ERROR}15`,
              border: `2px solid ${ERROR}40`,
              boxShadow: `0 0 25px ${ERROR}20`,
              opacity: conflictOp,
              transform: `scale(${conflictScale}) translateX(${conflictShake}px)`,
            }}
          >
            <Warning size={28} color={ERROR} weight="fill" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: ERROR,
                letterSpacing: 1,
                textShadow: `0 0 12px ${ERROR}40`,
              }}
            >
              MERGE CONFLICT
            </span>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div
          style={{
            width: 2,
            background: `linear-gradient(transparent, ${TEXT_MUTED}30, transparent)`,
            opacity: dividerOp,
            flexShrink: 0,
          }}
        />

        {/* ── RIGHT: Auto-merge ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "36px 32px",
            borderRadius: 12,
            background: `${SUCCESS}06`,
            border: `1px solid ${SUCCESS}15`,
          }}
        >
          {/* Two file icons — different files */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              opacity: diffFilesOp,
              transform: `translateY(${diffFilesSlide}px)`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}08)`,
                  border: `1.5px solid ${PRIMARY}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileCode size={28} color={PRIMARY} weight="duotone" />
              </div>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: PRIMARY, fontWeight: 600 }}>
                app.ts
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${SECONDARY}20, ${SECONDARY}08)`,
                  border: `1.5px solid ${SECONDARY}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileCode size={28} color={SECONDARY} weight="duotone" />
              </div>
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 12, color: SECONDARY, fontWeight: 600 }}>
                utils.ts
              </span>
            </div>
          </div>

          {/* Different files label */}
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              fontWeight: 500,
              color: TEXT_MUTED,
              opacity: diffFilesOp,
            }}
          >
            Different files — no overlap
          </span>

          {/* AUTO-MERGE SUCCESS badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 28px",
              borderRadius: 10,
              background: `${SUCCESS}15`,
              border: `2px solid ${SUCCESS}40`,
              boxShadow: `0 0 25px ${SUCCESS}20`,
              opacity: autoMergeOp,
              transform: `scale(${autoMergeScale})`,
            }}
          >
            <CheckCircle size={28} color={SUCCESS} weight="fill" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: SUCCESS,
                letterSpacing: 1,
                textShadow: `0 0 12px ${SUCCESS}40`,
              }}
            >
              AUTO-MERGED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Three-way merge (ancestor + yours + theirs → result)
// ═══════════════════════════════════════════════════════════
const Scene3_ThreeWayMerge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // 🔊 SOUND: scene_start @ frame 3694 — "three-way merge" title appears
  const titleOp = fadeIn(frame, F_THREE_WAY, 18);
  const titleSlide = slideUp(frame, F_THREE_WAY, 18);

  // 🔊 SOUND: element_appear @ frame 3735 — ancestor source box appears
  const ancestorOp = fadeIn(frame, F_ANCESTOR_END, 15);
  const ancestorSlide = slideUp(frame, F_ANCESTOR_END, 15);
  const ancestorScale = spring({
    frame: Math.max(0, frame - F_ANCESTOR_END),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // 🔊 SOUND: element_appear @ frame 3765 — "yours" source box appears
  const yoursOp = fadeIn(frame, F_YOURS, 15);
  const yoursSlide = slideUp(frame, F_YOURS, 15);
  const yoursScale = spring({
    frame: Math.max(0, frame - F_YOURS),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // 🔊 SOUND: element_appear @ frame 3790 — "theirs" source box appears
  const theirsOp = fadeIn(frame, F_THEIRS, 15);
  const theirsSlide = slideUp(frame, F_THEIRS, 15);
  const theirsScale = spring({
    frame: Math.max(0, frame - F_THEIRS),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Convergence arrows — appear after all 3 sources shown
  // 🔊 SOUND: transition @ frame 3800 — convergence arrows draw toward result
  const arrowsOp = interpolate(frame, [F_THEIRS + 5, F_THEIRS + 20], [0, 1], { ...clamp, easing: easeOutCubic });

  // Result merge node
  // 🔊 SOUND: reveal @ frame 3808 — final merge result node pops in
  const resultOp = fadeIn(frame, F_THEIRS + 18, 15);
  const resultScale = spring({
    frame: Math.max(0, frame - (F_THEIRS + 18)),
    fps,
    config: { damping: 18, stiffness: 160 },
  });

  const sources = [
    { label: "ANCESTOR", color: ACCENT, opacity: ancestorOp, slide: ancestorSlide, scale: ancestorScale, icon: TreeStructure },
    { label: "YOURS", color: PRIMARY, opacity: yoursOp, slide: yoursSlide, scale: yoursScale, icon: GitBranch },
    { label: "THEIRS", color: SECONDARY, opacity: theirsOp, slide: theirsSlide, scale: theirsScale, icon: GitBranch },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleSlide}px)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 26,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: -0.5,
          }}
        >
          Three-Way Merge
        </span>
      </div>

      {/* Three source boxes */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 60,
        }}
      >
        {sources.map((src) => {
          const IconComp = src.icon;
          return (
            <div
              key={src.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                opacity: src.opacity,
                transform: `translateY(${src.slide}px) scale(${src.scale})`,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${src.color}18, ${src.color}06)`,
                  border: `2px solid ${src.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 25px ${src.color}20`,
                }}
              >
                <IconComp size={44} color={src.color} weight="duotone" />
              </div>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: src.color,
                  letterSpacing: 1.5,
                }}
              >
                {src.label}
              </span>
              {/* Code preview placeholder */}
              <div
                style={{
                  width: 180,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: "#0a0a12",
                  border: `1px solid ${BORDER}`,
                }}
              >
                {[0.85, 0.6, 0.45, 0.7].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      height: 8,
                      width: `${w * 100}%`,
                      background: `${src.color}20`,
                      borderRadius: 4,
                      marginBottom: i < 3 ? 6 : 0,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Convergence arrows */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          opacity: arrowsOp,
        }}
      >
        <div
          style={{
            width: 3,
            height: 40,
            background: `linear-gradient(${ACCENT}50, ${SUCCESS}60)`,
            borderRadius: 2,
            transform: "rotate(25deg)",
          }}
        />
        <div
          style={{
            width: 3,
            height: 40,
            background: `linear-gradient(${PRIMARY}50, ${SUCCESS}60)`,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            width: 3,
            height: 40,
            background: `linear-gradient(${SECONDARY}50, ${SUCCESS}60)`,
            borderRadius: 2,
            transform: "rotate(-25deg)",
          }}
        />
      </div>

      {/* RESULT — merged commit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "20px 40px",
          borderRadius: 14,
          background: `${SUCCESS}10`,
          border: `2px solid ${SUCCESS}40`,
          boxShadow: `0 0 35px ${SUCCESS}20`,
          opacity: resultOp,
          transform: `scale(${resultScale})`,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `${SUCCESS}20`,
            border: `2.5px solid ${SUCCESS}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 20px ${SUCCESS}40`,
          }}
        >
          <GitMerge size={28} color={SUCCESS} weight="fill" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: SUCCESS,
              letterSpacing: 0.5,
            }}
          >
            MERGE COMMIT
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: TEXT_MUTED,
            }}
          >
            Combined result of all three
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_Merging;
