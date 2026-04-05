import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { Folder, FileText, TreeStructure, GitCommit, HashStraight, Package } from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOutCubic = Easing.out(Easing.cubic);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });

// ─── Colors ───────────────────────────────────────────────
const BG = "#0f0f1a";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const TEXT = "#e2e8f0";
const TEXT_DIM = "#64748b";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";
const BLOB_COLOR = "#3b82f6";
const TREE_COLOR = "#22c55e";
const COMMIT_COLOR = "#a855f7";

// ─── Voiceover Timestamps (30fps) ─────────────────────────
// "show"           → f459
// "inside"         → f495
// "dot"            → f512
// "git"            → f520
// "folder"         → f525
// "three"          → f608
// "types"          → f616
// "objects"        → f629
// "Blobs,"         → f668
// "trees,"         → f697
// "commits."       → f733
// "blob"           → f779

const F_SHOW = 459;
const F_DOT_GIT = 512;
const F_FOLDER = 525;
const F_THREE = 608;
const F_OBJECTS = 629;
const F_BLOBS = 668;
const F_TREES = 697;
const F_COMMITS = 733;

// ─── Object Type Card ─────────────────────────────────────
const ObjectCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  opacity: number;
  translateY: number;
  scale: number;
  glowing: boolean;
}> = ({ icon, label, sublabel, color, opacity, translateY, scale, glowing }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16,
      width: 280,
    }}
  >
    <div
      style={{
        width: 100,
        height: 100,
        borderRadius: 24,
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `2px solid ${color}${glowing ? "60" : "30"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: glowing ? `0 0 30px ${color}30, 0 0 60px ${color}10` : `0 0 15px ${color}10`,
      }}
    >
      {icon}
    </div>
    <span
      style={{
        fontFamily: "'SF Mono', monospace",
        fontSize: 22,
        fontWeight: 700,
        color,
        letterSpacing: 1,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14,
        fontWeight: 500,
        color: TEXT_DIM,
        textAlign: "center",
      }}
    >
      {sublabel}
    </span>
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_ThreeObjectsIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── .git FOLDER (f459+) ──────────────────────────────
  // 🔊 SOUND: element_appear @ frame 459 — .git folder fades in
  const folderOp = fadeIn(frame, F_SHOW, 18);
  const folderSlide = slideUp(frame, F_SHOW, 18);
  const folderScale = spring({
    frame: Math.max(0, frame - F_SHOW),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // 🔊 SOUND: reveal @ frame 512 — .git folder "opens" with glow pulse
  const folderGlow = interpolate(frame, [F_DOT_GIT, F_DOT_GIT + 20], [0, 40], {
    ...clamp,
    easing: easeOutCubic,
  });

  // Folder fades out when three objects appear
  const folderFadeOut = interpolate(frame, [F_THREE - 15, F_THREE + 5], [1, 0], clamp);

  // ─── "Everything comes down to three types" TITLE ─────
  // 🔊 SOUND: element_appear @ frame 590 — section title fades in
  const titleOp = interpolate(frame, [590, 605], [0, 1], clamp);
  const titleSlide = slideUp(frame, 590, 15);

  // ─── THREE OBJECT TYPES (f668+) ───────────────────────
  // 🔊 SOUND: element_appear @ frame 665 — blob card pops in
  const blobOp = fadeIn(frame, F_BLOBS - 3, 18);
  const blobSlide = slideUp(frame, F_BLOBS - 3, 18);
  const blobScale = spring({
    frame: Math.max(0, frame - (F_BLOBS - 3)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // 🔊 SOUND: element_appear @ frame 694 — tree card pops in
  const treeOp = fadeIn(frame, F_TREES - 3, 18);
  const treeSlide = slideUp(frame, F_TREES - 3, 18);
  const treeScale = spring({
    frame: Math.max(0, frame - (F_TREES - 3)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // 🔊 SOUND: element_appear @ frame 730 — commit card pops in
  const commitOp = fadeIn(frame, F_COMMITS - 3, 18);
  const commitSlide = slideUp(frame, F_COMMITS - 3, 18);
  const commitScale = spring({
    frame: Math.max(0, frame - (F_COMMITS - 3)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Blob card glows when narrator gets to blob detail
  const blobGlowing = frame >= 770;

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
      {/* ─── Background subtle radial ────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 30%, #0a1628 0%, #0f0f1a 60%)",
        }}
      />

      {/* ─── .git Folder (appears first, then fades) ─────── */}
      {frame < F_THREE + 10 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${folderScale})`,
            opacity: folderOp * folderFadeOut,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 32,
              background: `linear-gradient(135deg, ${ACCENT}18, ${ACCENT}06)`,
              border: `2px solid ${ACCENT}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${folderGlow}px ${ACCENT}30, 0 0 ${folderGlow * 2}px ${ACCENT}10`,
            }}
          >
            <Folder size={72} color={ACCENT} weight="duotone" />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 28,
              fontWeight: 700,
              color: ACCENT,
              letterSpacing: 1,
              transform: `translateY(${folderSlide}px)`,
            }}
          >
            .git/
          </span>
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 500,
              color: TEXT_DIM,
              opacity: interpolate(frame, [F_DOT_GIT + 5, F_DOT_GIT + 20], [0, 1], clamp),
            }}
          >
            The hidden database behind every repo
          </span>
        </div>
      )}

      {/* ─── Title: "Three Types of Objects" ─────────────── */}
      <div
        style={{
          position: "absolute",
          top: 120,
          opacity: titleOp,
          transform: `translateY(${titleSlide}px)`,
          textAlign: "center",
          zIndex: 2,
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: TEXT,
            letterSpacing: -0.5,
            margin: 0,
          }}
        >
          Everything Git Does = Three Types of Objects
        </h2>
      </div>

      {/* ─── Three Object Cards ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 80,
          zIndex: 2,
          marginTop: 40,
        }}
      >
        <ObjectCard
          icon={<FileText size={44} color={BLOB_COLOR} weight="duotone" />}
          label="BLOB"
          sublabel="Raw file content"
          color={BLOB_COLOR}
          opacity={blobOp}
          translateY={blobSlide}
          scale={blobScale}
          glowing={blobGlowing}
        />

        <ObjectCard
          icon={<TreeStructure size={44} color={TREE_COLOR} weight="duotone" />}
          label="TREE"
          sublabel="Directory listing"
          color={TREE_COLOR}
          opacity={treeOp}
          translateY={treeSlide}
          scale={treeScale}
          glowing={false}
        />

        <ObjectCard
          icon={<GitCommit size={44} color={COMMIT_COLOR} weight="duotone" />}
          label="COMMIT"
          sublabel="Snapshot pointer"
          color={COMMIT_COLOR}
          opacity={commitOp}
          translateY={commitSlide}
          scale={commitScale}
          glowing={false}
        />
      </div>

      {/* ─── Subtle connecting line between cards ────────── */}
      <div
        style={{
          width: 700,
          height: 2,
          background: `linear-gradient(90deg, ${BLOB_COLOR}00, ${BLOB_COLOR}30, ${TREE_COLOR}30, ${COMMIT_COLOR}30, ${COMMIT_COLOR}00)`,
          marginTop: -20,
          opacity: interpolate(frame, [F_COMMITS, F_COMMITS + 20], [0, 1], clamp),
          zIndex: 1,
        }}
      />

      {/* ─── ".git/objects/" path indicator ──────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          opacity: interpolate(frame, [F_OBJECTS + 5, F_OBJECTS + 20], [0, 1], clamp),
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Package size={20} color={TEXT_DIM} weight="duotone" />
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 15,
            fontWeight: 500,
            color: TEXT_DIM,
            letterSpacing: 0.5,
          }}
        >
          .git/objects/ — compressed, SHA-1 hashed
        </span>
      </div>
    </div>
  );
};

export default Generated_ThreeObjectsIntro;
