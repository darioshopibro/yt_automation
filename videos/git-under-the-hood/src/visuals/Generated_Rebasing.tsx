import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { GitBranch, ArrowBendUpRight, Trash } from "@phosphor-icons/react";

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
const BORDER = "#1a1a2e";
const GHOST = "#4a4a5e";
const ERROR = "#ef4444";
const SUCCESS = "#22c55e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps, GLOBAL frames)
 * ═══════════════════════════════════════════════════════════
 * "Rebasing"                    → f3790
 * "completely different"        → f3874/f3893
 * "Instead"                     → f3930
 * "merge commit"                → f3962/f3973
 * "replays"                     → f4004
 * "commits"                     → f4025
 * "one by one"                  → f4038/f4048/f4055
 * "top of other branch"         → f4081/f4090/f4097/f4103
 * "replayed commit"             → f4148/f4163
 * "new hash"                    → f4185/f4192
 * "parent changed"              → f4233/f4246
 * "old commits"                 → f4293/f4299
 * "still exist"                 → f4320/f4330
 * "object database"             → f4350/f4361
 * "garbage collection"          → f4396/f4407
 * "cleans them up"              → f4420/f4434
 */

// ─── Commit data ──────────────────────────────────────────
const featureCommits = [
  { hash: "a3f1", newHash: "d7e2", color: ACCENT },
  { hash: "b8c4", newHash: "e9a5", color: ACCENT },
  { hash: "c2d7", newHash: "f1b8", color: ACCENT },
];

// Branch positions
const MAIN_Y = 420;
const FEATURE_Y = 660;
const BRANCH_LEFT = 280;
const BRANCH_RIGHT = 1640;

// Commit positions on main branch (where they land after rebase)
const mainCommitX = [480, 720, 960];
// Original positions on feature branch
const featureCommitX = [740, 980, 1220];

// ─── Commit Circle ────────────────────────────────────────
const CommitCircle: React.FC<{
  x: number;
  y: number;
  hash: string;
  color: string;
  opacity: number;
  scale?: number;
  ghost?: boolean;
  glowing?: boolean;
}> = ({ x, y, hash, color, opacity, scale = 1, ghost, glowing }) => (
  <div
    style={{
      position: "absolute",
      left: x - 28,
      top: y - 28,
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: ghost ? "transparent" : `${color}20`,
      border: `2.5px ${ghost ? "dashed" : "solid"} ${ghost ? GHOST : `${color}70`}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity,
      transform: `scale(${scale})`,
      boxShadow: glowing ? `0 0 24px ${color}50, 0 0 48px ${color}25` : ghost ? "none" : `0 0 12px ${color}15`,
      filter: ghost ? "grayscale(0.8)" : "none",
    }}
  >
    <span
      style={{
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        fontSize: 13,
        fontWeight: 700,
        color: ghost ? GHOST : color,
        letterSpacing: 0.5,
      }}
    >
      {hash}
    </span>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_Rebasing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE BOUNDARIES ──────────────────────────────────
  // Scene 1: Title + branch setup (f3790 – f3930)
  // Scene 2: Replay animation (f3930 – f4250)
  // Scene 3: Ghost state + GC (f4250 – f4480)

  // ─── TITLE (f3790) ─────────────────────────────────────
  // 🔊 SOUND: scene_start @ frame 3790 — title "Rebasing" fades in
  const titleOpacity = fadeIn(frame, 3790, 20);
  const titleSlide = slideUp(frame, 3790, 20);
  const titleFadeOut = frame < 4000 ? 1 : fadeOut(frame, 4000, 25);

  // ─── "completely different" emphasis (f3874) ───────────
  // 🔊 SOUND: reveal @ frame 3874 — subtitle emphasizes "completely different"
  const subtitleOpacity = interpolate(frame, [3874, 3889, 4000, 4025], [0, 1, 1, 0], clamp);
  const subtitleSlide = slideUp(frame, 3874, 15);

  // ─── BRANCH LINES (f3850+) ─────────────────────────────
  // 🔊 SOUND: element_appear @ frame 3850 — main branch line draws in
  const mainBranchDraw = interpolate(frame, [3850, 3890], [0, 1], { ...clamp, easing: easeOutCubic });
  // 🔊 SOUND: element_appear @ frame 3870 — feature branch line draws in
  const featureBranchDraw = interpolate(frame, [3870, 3910], [0, 1], { ...clamp, easing: easeOutCubic });

  // Branch label opacities
  const mainLabelOp = fadeIn(frame, 3860, 15);
  const featureLabelOp = fadeIn(frame, 3880, 15);

  // ─── EXISTING MAIN COMMITS (appear at f3860) ──────────
  // 🔊 SOUND: element_appear @ frame 3860 — base commits on main appear
  const baseCommit1Op = fadeIn(frame, 3860, 12);
  const baseCommit2Op = fadeIn(frame, 3868, 12);

  // ─── FEATURE COMMITS original positions (f3885+) ──────
  // 🔊 SOUND: staggered_group @ frame 3885 — 3 feature commits pop in
  const feat1Op = fadeIn(frame, 3885, 12);
  const feat2Op = fadeIn(frame, 3895, 12);
  const feat3Op = fadeIn(frame, 3905, 12);

  // ─── "merge commit" crossed out (f3962) ────────────────
  // 🔊 SOUND: element_appear @ frame 3962 — "No merge commit" text appears
  const noMergeOp = interpolate(frame, [3962, 3977, 4050, 4070], [0, 1, 1, 0], clamp);
  const noMergeSlide = slideUp(frame, 3962, 15);

  // ─── REPLAY ANIMATION (f4004+) "replays your commits one by one" ──
  // Each commit lifts from feature branch, arcs upward, and lands on main
  // Stagger: commit 0 at f4004, commit 1 at f4038, commit 2 at f4055

  const replayStarts = [4004, 4038, 4070];
  const replayDuration = 25; // frames per replay arc

  const replayedCommits = featureCommits.map((commit, i) => {
    const start = replayStarts[i];
    const progress = interpolate(frame, [start, start + replayDuration], [0, 1], {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    });

    // Arc from feature position to main position
    const startX = featureCommitX[i];
    const endX = mainCommitX[i] + 480; // land further right on main (after base commits)
    const startY = FEATURE_Y;
    const endY = MAIN_Y;

    const currentX = interpolate(progress, [0, 1], [startX, endX], clamp);
    const currentY = interpolate(progress, [0, 1], [startY, endY], clamp);
    // Arc height — parabolic lift
    const arcLift = Math.sin(progress * Math.PI) * -120;

    // 🔊 SOUND: element_appear @ frame {start} — commit {hash} lifts and replays onto main
    const isLanded = progress >= 1;

    // Scale pop on landing
    const landScale = isLanded
      ? spring({ frame: Math.max(0, frame - (start + replayDuration)), fps, config: { damping: 22, stiffness: 200 } })
      : 1;

    // Hash transition: old hash → new hash when landed
    const displayHash = isLanded ? commit.newHash : commit.hash;
    const displayColor = isLanded ? SECONDARY : commit.color;

    // Ghost of original commit (appears when replay starts)
    const ghostOpacity = interpolate(frame, [start, start + 10], [0, 0.4], clamp);

    return {
      x: currentX,
      y: currentY + arcLift,
      hash: displayHash,
      color: displayColor,
      opacity: progress > 0 ? 1 : 0,
      scale: landScale,
      glowing: isLanded && frame < start + replayDuration + 20,
      ghostOpacity,
      ghostX: featureCommitX[i],
      originalHash: commit.hash,
      started: frame >= start,
      landed: isLanded,
    };
  });

  // ─── "new hash" highlight (f4185) ──────────────────────
  // 🔊 SOUND: reveal @ frame 4185 — "new hash" label appears near replayed commits
  const newHashLabelOp = interpolate(frame, [4185, 4200, 4280, 4295], [0, 1, 1, 0], clamp);
  const newHashSlide = slideUp(frame, 4185, 15);

  // ─── "parent changed" indicator (f4233) ────────────────
  // 🔊 SOUND: element_appear @ frame 4233 — "parent changed" annotation
  const parentChangedOp = interpolate(frame, [4233, 4248, 4290, 4310], [0, 1, 1, 0], clamp);

  // ─── "old commits still exist" (f4293+) ────────────────
  // Ghost commits become more visible, "object database" label
  // 🔊 SOUND: element_appear @ frame 4293 — old ghost commits pulse brighter
  const ghostHighlight = interpolate(frame, [4293, 4310], [0.4, 0.7], clamp);

  // 🔊 SOUND: element_appear @ frame 4350 — "Object Database" label appears
  const dbLabelOp = fadeIn(frame, 4350, 15);
  const dbLabelSlide = slideUp(frame, 4350, 15);

  // ─── GARBAGE COLLECTION SWEEP (f4396+) ─────────────────
  // 🔊 SOUND: transition @ frame 4396 — GC sweep line wipes across screen
  const gcSweepProgress = interpolate(frame, [4396, 4434], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Ghost commits fade out as GC passes over them
  const gcFadeOut = interpolate(frame, [4407, 4434], [1, 0], { ...clamp, easing: easeInQuad });

  // "Garbage Collection" label
  // 🔊 SOUND: reveal @ frame 4396 — "Garbage Collection" label appears with sweep
  const gcLabelOp = interpolate(frame, [4396, 4411, 4460, 4480], [0, 1, 1, 0], clamp);

  // Feature branch fades out during/after GC
  const featureBranchFade = frame < 4396 ? 1 : fadeOut(frame, 4396, 40);

  // ─── Scene-level visibility ────────────────────────────
  const showBranches = frame >= 3850;

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: BG,
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: 80,
      }}
    >
      {/* ─── Title ─────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity * titleFadeOut,
          transform: `translateY(${titleSlide}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <ArrowBendUpRight size={36} color={SECONDARY} weight="duotone" />
          <h1
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 32,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: -0.5,
              margin: 0,
            }}
          >
            Rebasing
          </h1>
        </div>
        {/* "completely different" subtitle */}
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 500,
            color: SECONDARY,
            marginTop: 10,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleSlide}px)`,
          }}
        >
          Something completely different
        </p>
      </div>

      {/* ─── "No merge commit" annotation ──────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 170,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: noMergeOp,
          transform: `translateY(${noMergeSlide}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 16,
            fontWeight: 600,
            color: ERROR,
            padding: "6px 20px",
            background: `${ERROR}10`,
            border: `1px solid ${ERROR}25`,
            borderRadius: 8,
            textDecoration: "line-through",
            textDecorationColor: ERROR,
          }}
        >
          merge commit
        </span>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 500,
            color: TEXT_MUTED,
            marginLeft: 12,
          }}
        >
          Instead, replays commits on top
        </span>
      </div>

      {/* ═══ BRANCH VISUALIZATION ═════════════════════════════ */}
      {showBranches && (
        <>
          {/* ─── Main Branch Line ──────────────────────────── */}
          <div
            style={{
              position: "absolute",
              top: MAIN_Y,
              left: BRANCH_LEFT,
              width: (BRANCH_RIGHT - BRANCH_LEFT) * mainBranchDraw,
              height: 3,
              background: `linear-gradient(90deg, ${PRIMARY}60, ${PRIMARY}30)`,
              borderRadius: 2,
            }}
          />
          {/* Main label */}
          <div
            style={{
              position: "absolute",
              top: MAIN_Y - 40,
              left: BRANCH_LEFT,
              opacity: mainLabelOp,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GitBranch size={20} color={PRIMARY} weight="duotone" />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 15,
                  fontWeight: 700,
                  color: PRIMARY,
                  letterSpacing: 1,
                }}
              >
                main
              </span>
            </div>
          </div>

          {/* ─── Feature Branch Line ───────────────────────── */}
          <div
            style={{
              position: "absolute",
              top: FEATURE_Y,
              left: BRANCH_LEFT + 200,
              width: (BRANCH_RIGHT - BRANCH_LEFT - 200) * featureBranchDraw * featureBranchFade,
              height: 3,
              background: `linear-gradient(90deg, ${ACCENT}60, ${ACCENT}30)`,
              borderRadius: 2,
              opacity: featureBranchFade,
            }}
          />
          {/* Feature label */}
          <div
            style={{
              position: "absolute",
              top: FEATURE_Y - 40,
              left: BRANCH_LEFT + 200,
              opacity: featureLabelOp * featureBranchFade,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GitBranch size={20} color={ACCENT} weight="duotone" />
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 15,
                  fontWeight: 700,
                  color: ACCENT,
                  letterSpacing: 1,
                }}
              >
                feature
              </span>
            </div>
          </div>

          {/* Fork connector (diagonal from main to feature) */}
          <div
            style={{
              position: "absolute",
              top: MAIN_Y,
              left: BRANCH_LEFT + 440,
              width: 3,
              height: FEATURE_Y - MAIN_Y,
              background: `linear-gradient(180deg, ${PRIMARY}40, ${ACCENT}40)`,
              borderRadius: 2,
              opacity: featureBranchDraw * featureBranchFade * 0.5,
              transformOrigin: "top left",
              transform: "rotate(20deg)",
            }}
          />

          {/* ─── Base commits on main ──────────────────────── */}
          <CommitCircle x={480} y={MAIN_Y} hash="m1" color={PRIMARY} opacity={baseCommit1Op} />
          <CommitCircle x={720} y={MAIN_Y} hash="m2" color={PRIMARY} opacity={baseCommit2Op} />

          {/* ─── Feature commits (original positions) ──────── */}
          {/* These become ghosts during replay */}
          {featureCommits.map((commit, i) => {
            const originalOp = [feat1Op, feat2Op, feat3Op][i];
            const isBeingReplayed = replayedCommits[i].started;
            const ghostOp = isBeingReplayed
              ? (frame >= 4293 ? ghostHighlight * gcFadeOut : replayedCommits[i].ghostOpacity)
              : originalOp;
            const isGhost = isBeingReplayed;

            return (
              <CommitCircle
                key={`orig-${i}`}
                x={featureCommitX[i]}
                y={FEATURE_Y}
                hash={commit.hash}
                color={commit.color}
                opacity={ghostOp * featureBranchFade}
                ghost={isGhost}
              />
            );
          })}

          {/* ─── Replayed commits (animated arc) ───────────── */}
          {replayedCommits.map((rc, i) =>
            rc.opacity > 0 ? (
              <CommitCircle
                key={`replay-${i}`}
                x={rc.x}
                y={rc.y}
                hash={rc.hash}
                color={rc.color}
                opacity={rc.opacity}
                scale={rc.scale}
                glowing={rc.glowing}
              />
            ) : null,
          )}

          {/* ─── "new hash" label (f4185) ──────────────────── */}
          <div
            style={{
              position: "absolute",
              top: MAIN_Y - 90,
              right: 280,
              opacity: newHashLabelOp,
              transform: `translateY(${newHashSlide}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: SECONDARY,
                letterSpacing: 1,
                padding: "4px 14px",
                background: `${SECONDARY}12`,
                border: `1px solid ${SECONDARY}25`,
                borderRadius: 6,
              }}
            >
              NEW HASH
            </span>
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: TEXT_MUTED,
              }}
            >
              because parent changed
            </span>
          </div>

          {/* ─── "parent changed" arrow annotation (f4233) ─── */}
          <div
            style={{
              position: "absolute",
              top: MAIN_Y + 30,
              left: mainCommitX[0] + 480 - 20,
              opacity: parentChangedOp,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: SECONDARY,
                boxShadow: `0 0 8px ${SECONDARY}60`,
              }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                fontWeight: 600,
                color: SECONDARY,
              }}
            >
              parent: m2 (changed!)
            </span>
          </div>

          {/* ─── "Object Database" label (f4350) ───────────── */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              left: BRANCH_LEFT + 200,
              opacity: dbLabelOp * gcFadeOut,
              transform: `translateY(${dbLabelSlide}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              background: `${GHOST}10`,
              border: `1px solid ${GHOST}20`,
              borderRadius: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 600,
                color: GHOST,
                letterSpacing: 1,
              }}
            >
              OBJECT DATABASE
            </span>
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: TEXT_MUTED,
              }}
            >
              old commits still exist here...
            </span>
          </div>

          {/* ─── GARBAGE COLLECTION SWEEP (f4396+) ─────────── */}
          {frame >= 4396 && (
            <>
              {/* Sweep line */}
              <div
                style={{
                  position: "absolute",
                  top: FEATURE_Y - 60,
                  left: BRANCH_LEFT + 200 + gcSweepProgress * (BRANCH_RIGHT - BRANCH_LEFT - 200),
                  width: 3,
                  height: 120,
                  background: `linear-gradient(180deg, transparent, ${ERROR}60, transparent)`,
                  boxShadow: `0 0 20px ${ERROR}30, 0 0 40px ${ERROR}15`,
                  borderRadius: 2,
                }}
              />
              {/* GC label */}
              <div
                style={{
                  position: "absolute",
                  bottom: 200,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  opacity: gcLabelOp,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Trash size={22} color={ERROR} weight="duotone" />
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: ERROR,
                      letterSpacing: 1,
                    }}
                  >
                    GARBAGE COLLECTION
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color: TEXT_MUTED,
                    marginTop: 6,
                    display: "block",
                  }}
                >
                  cleans up unreachable commits
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Generated_Rebasing;
