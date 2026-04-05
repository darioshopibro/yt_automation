import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  GitCommit,
  TreeStructure,
  User,
  Clock,
  ChatText,
  ArrowBendUpLeft,
  LinkSimpleHorizontal,
  GitBranch,
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

// ─── Brand Colors ─────────────────────────────────────────
const BG = "#030305";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const TEXT = "#f8fafc";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMESTAMPS (30fps, GLOBAL frames)
 * ═══════════════════════════════════════════════════════════
 * "commit"           → f1909
 * "object"           → f1916
 * "ties everything"  → f1923/f1933
 * "together"         → f1945
 * "pointer"          → f1991
 * "root tree"        → f2007/f2012
 * "author"           → f2024
 * "timestamp"        → f2054
 * "commit message"   → f2076/f2083
 * "crucially"        → f2110
 * "parent commit"    → f2153/f2164
 * "creates chain"    → f2229/f2242
 * "Every commit"     → f2274/f2283
 * "points back"      → f2291
 * "git history"      → f2356/f2362
 */

// ─── Frame constants from timestamps ──────────────────────
const F_COMMIT = 1909;
const F_TIES = 1923;
const F_POINTER = 1991;
const F_ROOT_TREE = 2007;
const F_AUTHOR = 2024;
const F_TIMESTAMP = 2054;
const F_COMMIT_MSG = 2076;
const F_CRUCIALLY = 2110;
const F_PARENT_COMMIT = 2153;
const F_CREATES_CHAIN = 2229;
const F_EVERY_COMMIT = 2274;
const F_POINTS_BACK = 2291;
const F_GIT_HISTORY = 2356;

// Scene transition: crossfade between anatomy and chain
const SCENE1_FADE_START = F_CREATES_CHAIN - 20; // f2209
const SCENE2_FADE_IN = F_CREATES_CHAIN - 10; // f2219

// ─── Commit Field Row ─────────────────────────────────────
const FieldRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  opacity: number;
  translateY: number;
  glow?: number;
}> = ({ icon, label, value, color, opacity, translateY, glow = 0 }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 24px",
      background: glow > 0 ? `${color}${Math.round(glow * 20).toString(16).padStart(2, "0")}` : `${color}08`,
      border: `1.5px solid ${glow > 0 ? `${color}60` : `${color}20`}`,
      borderRadius: 10,
      boxShadow: glow > 0 ? `0 0 25px ${color}40, inset 0 0 15px ${color}10` : "none",
      width: "100%",
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1.5px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: TEXT_MUTED,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 15,
          fontWeight: 600,
          color: glow > 0 ? TEXT : `${TEXT}cc`,
          textShadow: glow > 0 ? `0 0 12px ${color}60` : "none",
        }}
      >
        {value}
      </span>
    </div>
  </div>
);

// ─── Mini Commit Node (for chain scene) ───────────────────
const CommitNode: React.FC<{
  hash: string;
  color: string;
  opacity: number;
  scale: number;
  isActive?: boolean;
  label?: string;
}> = ({ hash, color, opacity, scale, isActive, label }) => (
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
    {label && (
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 12,
          fontWeight: 600,
          color: TEXT_MUTED,
          letterSpacing: 1,
        }}
      >
        {label}
      </span>
    )}
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: 16,
        background: isActive
          ? `linear-gradient(135deg, ${color}20, ${color}08)`
          : `${color}0a`,
        border: `2px solid ${isActive ? `${color}60` : `${color}25`}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: isActive ? `0 0 30px ${color}25` : "none",
      }}
    >
      <GitCommit
        size={32}
        color={color}
        weight="duotone"
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      />
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          color,
          letterSpacing: 0.5,
        }}
      >
        {hash}
      </span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_Commits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE 1: Commit Object Anatomy ────────────────────

  // 🔊 SOUND: scene_start @ frame 1909 — segment opens, "COMMIT OBJECT" title fades in
  const titleOpacity = fadeIn(frame, F_COMMIT, 20);
  const titleSlide = slideUp(frame, F_COMMIT, 20);

  // 🔊 SOUND: element_appear @ frame 1923 — commit card container appears
  const cardOpacity = fadeIn(frame, F_TIES, 20);
  const cardScale = spring({
    frame: Math.max(0, frame - F_TIES),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Fields appear one by one as narrator mentions them
  // 🔊 SOUND: element_appear @ frame 2007 — "root tree" field row slides in
  const fieldTree = { opacity: fadeIn(frame, F_ROOT_TREE), y: slideUp(frame, F_ROOT_TREE) };
  // 🔊 SOUND: element_appear @ frame 2024 — "author" field row slides in
  const fieldAuthor = { opacity: fadeIn(frame, F_AUTHOR), y: slideUp(frame, F_AUTHOR) };
  // 🔊 SOUND: element_appear @ frame 2054 — "timestamp" field row slides in
  const fieldTimestamp = { opacity: fadeIn(frame, F_TIMESTAMP), y: slideUp(frame, F_TIMESTAMP) };
  // 🔊 SOUND: element_appear @ frame 2076 — "commit message" field row slides in
  const fieldMessage = { opacity: fadeIn(frame, F_COMMIT_MSG), y: slideUp(frame, F_COMMIT_MSG) };

  // 🔊 SOUND: reveal @ frame 2110 — "crucially" glow pulse on parent pointer field
  const parentFieldOpacity = fadeIn(frame, F_CRUCIALLY + 10);
  const parentFieldSlide = slideUp(frame, F_CRUCIALLY + 10);
  const cruciallyGlow = interpolate(
    frame,
    [F_CRUCIALLY, F_CRUCIALLY + 20, F_CRUCIALLY + 50],
    [0, 1, 0.6],
    { ...clamp, easing: easeOutCubic }
  );

  // "CRUCIALLY" text emphasis
  const cruciallyLabelOpacity = interpolate(
    frame,
    [F_CRUCIALLY - 5, F_CRUCIALLY + 10],
    [0, 1],
    clamp
  );
  const cruciallyScale = spring({
    frame: Math.max(0, frame - F_CRUCIALLY),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Scene 1 fade out
  const scene1Opacity = frame < SCENE1_FADE_START
    ? 1
    : fadeOut(frame, SCENE1_FADE_START, 25);

  // ─── SCENE 2: Chain of Commits ─────────────────────────

  // 🔊 SOUND: transition @ frame 2219 — crossfade to chain scene
  const scene2Opacity = frame < SCENE2_FADE_IN ? 0 : fadeIn(frame, SCENE2_FADE_IN, 20);

  // 🔊 SOUND: element_appear @ frame 2239 — first commit node (oldest) pops in
  const commit1Scale = spring({
    frame: Math.max(0, frame - (F_CREATES_CHAIN - 5)),
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const commit1Opacity = fadeIn(frame, F_CREATES_CHAIN - 5);

  // 🔊 SOUND: element_appear @ frame 2259 — second commit node pops in
  const commit2Scale = spring({
    frame: Math.max(0, frame - (F_CREATES_CHAIN + 15)),
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const commit2Opacity = fadeIn(frame, F_CREATES_CHAIN + 15);

  // 🔊 SOUND: element_appear @ frame 2283 — third commit node (newest) pops in
  const commit3Scale = spring({
    frame: Math.max(0, frame - F_EVERY_COMMIT),
    fps,
    config: { damping: 22, stiffness: 180 },
  });
  const commit3Opacity = fadeIn(frame, F_EVERY_COMMIT);

  // Parent pointer connectors — animated draw from right to left
  // 🔊 SOUND: element_appear @ frame 2291 — parent pointer arrows draw backwards
  const pointer1Progress = interpolate(
    frame,
    [F_POINTS_BACK, F_POINTS_BACK + 20],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );
  const pointer2Progress = interpolate(
    frame,
    [F_POINTS_BACK + 10, F_POINTS_BACK + 30],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // 🔊 SOUND: reveal @ frame 2356 — "git history" label glows in at bottom
  const historyLabelOpacity = fadeIn(frame, F_GIT_HISTORY, 18);
  const historyLabelSlide = slideUp(frame, F_GIT_HISTORY, 18);

  // Chain label "parent" on arrows
  const parentLabelOpacity = interpolate(
    frame,
    [F_POINTS_BACK + 15, F_POINTS_BACK + 30],
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ═══ SCENE 1: Commit Object Anatomy ═══════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          opacity: scene1Opacity,
        }}
      >
        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 40,
          }}
        >
          <GitCommit
            size={36}
            color={PRIMARY}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 10px ${PRIMARY}60)` }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Commit Object
          </span>
        </div>

        {/* Commit card with fields */}
        <div
          style={{
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: 520,
            padding: "32px 28px",
            background: `${PRIMARY}06`,
            border: `1.5px solid ${PRIMARY}20`,
            borderRadius: 12,
            boxShadow: `0 0 40px ${PRIMARY}08`,
          }}
        >
          {/* Hash header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 8,
              opacity: cardOpacity,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                color: TEXT_MUTED,
                letterSpacing: 1,
              }}
            >
              a3f7c2d
            </span>
          </div>

          {/* Tree pointer */}
          <FieldRow
            icon={<TreeStructure size={22} color={SECONDARY} weight="duotone" />}
            label="Tree"
            value="→ root tree (snapshot)"
            color={SECONDARY}
            opacity={fieldTree.opacity}
            translateY={fieldTree.y}
          />

          {/* Author */}
          <FieldRow
            icon={<User size={22} color={PRIMARY} weight="duotone" />}
            label="Author"
            value="dev@company.com"
            color={PRIMARY}
            opacity={fieldAuthor.opacity}
            translateY={fieldAuthor.y}
          />

          {/* Timestamp */}
          <FieldRow
            icon={<Clock size={22} color={ACCENT} weight="duotone" />}
            label="Timestamp"
            value="2026-04-05 14:32:08"
            color={ACCENT}
            opacity={fieldTimestamp.opacity}
            translateY={fieldTimestamp.y}
          />

          {/* Commit message */}
          <FieldRow
            icon={<ChatText size={22} color="#22c55e" weight="duotone" />}
            label="Message"
            value="fix: resolve merge conflict"
            color="#22c55e"
            opacity={fieldMessage.opacity}
            translateY={fieldMessage.y}
          />

          {/* Parent pointer — THE CRUCIAL ONE */}
          <div style={{ position: "relative" }}>
            <FieldRow
              icon={
                <ArrowBendUpLeft
                  size={22}
                  color="#ec4899"
                  weight="duotone"
                  style={{ filter: cruciallyGlow > 0.3 ? `drop-shadow(0 0 8px #ec489980)` : "none" }}
                />
              }
              label="Parent"
              value="→ b4e8a1f (previous commit)"
              color="#ec4899"
              opacity={parentFieldOpacity}
              translateY={parentFieldSlide}
              glow={cruciallyGlow}
            />

            {/* "CRUCIALLY" emphasis badge */}
            {cruciallyLabelOpacity > 0 && (
              <div
                style={{
                  position: "absolute",
                  right: -100,
                  top: "50%",
                  transform: `translateY(-50%) scale(${cruciallyScale})`,
                  opacity: cruciallyLabelOpacity,
                  padding: "6px 16px",
                  background: `${ACCENT}18`,
                  border: `1.5px solid ${ACCENT}50`,
                  borderRadius: 8,
                  boxShadow: `0 0 20px ${ACCENT}30`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: ACCENT,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  KEY
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SCENE 2: Chain of Commits ════════════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          opacity: scene2Opacity,
        }}
      >
        {/* Section title */}
        <div
          style={{
            opacity: scene2Opacity,
            marginBottom: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <LinkSimpleHorizontal
            size={28}
            color={SECONDARY}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 8px ${SECONDARY}60)` }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 22,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            The Chain
          </span>
        </div>

        {/* Three commits in a row with parent pointer arrows */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Commit 1 (oldest) */}
          <CommitNode
            hash="f1a2b3"
            color={TEXT_MUTED}
            opacity={commit1Opacity}
            scale={commit1Scale}
            label="oldest"
          />

          {/* Parent pointer arrow 2 → 1 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              width: 160,
              position: "relative",
            }}
          >
            {/* Arrow track background */}
            <div
              style={{
                width: 160,
                height: 3,
                background: `${PRIMARY}15`,
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Animated fill — draws right to left (child → parent) */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  height: "100%",
                  width: `${pointer2Progress * 100}%`,
                  background: `linear-gradient(270deg, ${PRIMARY}60, #ec489960)`,
                  borderRadius: 2,
                  boxShadow: pointer2Progress > 0.5 ? `0 0 10px ${PRIMARY}30` : "none",
                }}
              />
            </div>
            {/* Arrowhead (points left = toward parent) */}
            <div
              style={{
                position: "absolute",
                left: 4,
                top: -5,
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderRight: `10px solid ${pointer2Progress > 0.8 ? "#ec4899" : "#ec489900"}`,
                opacity: pointer2Progress,
              }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: `#ec4899`,
                opacity: parentLabelOpacity,
                marginTop: 4,
              }}
            >
              parent
            </span>
          </div>

          {/* Commit 2 (middle) */}
          <CommitNode
            hash="b4e8a1"
            color={PRIMARY}
            opacity={commit2Opacity}
            scale={commit2Scale}
          />

          {/* Parent pointer arrow 3 → 2 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              width: 160,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 160,
                height: 3,
                background: `${PRIMARY}15`,
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  height: "100%",
                  width: `${pointer1Progress * 100}%`,
                  background: `linear-gradient(270deg, ${SECONDARY}60, #ec489960)`,
                  borderRadius: 2,
                  boxShadow: pointer1Progress > 0.5 ? `0 0 10px ${SECONDARY}30` : "none",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: 4,
                top: -5,
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderRight: `10px solid ${pointer1Progress > 0.8 ? "#ec4899" : "#ec489900"}`,
                opacity: pointer1Progress,
              }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: `#ec4899`,
                opacity: parentLabelOpacity,
                marginTop: 4,
              }}
            >
              parent
            </span>
          </div>

          {/* Commit 3 (newest / HEAD) */}
          <CommitNode
            hash="a3f7c2"
            color={SECONDARY}
            opacity={commit3Opacity}
            scale={commit3Scale}
            isActive
            label="HEAD"
          />
        </div>

        {/* Direction indicator */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: parentLabelOpacity,
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: TEXT_MUTED,
            }}
          >
            every commit points back
          </span>
          <ArrowBendUpLeft
            size={20}
            color="#ec4899"
            weight="bold"
            style={{ filter: `drop-shadow(0 0 6px #ec489960)` }}
          />
        </div>

        {/* "That's your git history" label */}
        <div
          style={{
            opacity: historyLabelOpacity,
            transform: `translateY(${historyLabelSlide}px)`,
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 28px",
            background: `${SECONDARY}10`,
            border: `1.5px solid ${SECONDARY}30`,
            borderRadius: 10,
            boxShadow: `0 0 25px ${SECONDARY}15`,
          }}
        >
          <GitBranch
            size={24}
            color={SECONDARY}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 8px ${SECONDARY}60)` }}
          />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 18,
              fontWeight: 700,
              color: SECONDARY,
              letterSpacing: 1,
            }}
          >
            That's your git history
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_Commits;
