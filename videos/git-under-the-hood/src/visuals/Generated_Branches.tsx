import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { GitBranch, File, ArrowRight, X, Folder, CaretRight } from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOutCubic = Easing.out(Easing.cubic);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });

// ─── Brand Colors ─────────────────────────────────────────
const BG = "#030305";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const TEXT = "#f8fafc";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#1a1a2e";

// ─── Global frame timestamps (provided, 30fps) ───────────
const F = {
  branches: 2415,
  interesting: 2432,
  branch: 2471,
  isnt: 2485,
  copy: 2499,
  code: 2518,
  textFile: 2561,
  textFileEnd: 2570,
  commitHash: 2604,
  commitHashEnd: 2613,
  thatsIt: 2648,
  thatsItEnd: 2660,
  create: 2699,
  newWord: 2709,
  newBranch: 2713,
  fortyByte: 2757,
  byteWord: 2770,
  fileWord: 2778,
  hash: 2797,
  switchWord: 2849,
  switchBranches: 2858,
  head: 2906,
  headEnd: 2936,
  branchFile: 2972,
  branchFileEnd: 2982,
};

// ─── Scene boundaries ─────────────────────────────────────
const SCENE1_END = F.thatsIt - 10;       // ~2638
const SCENE2_START = F.thatsIt - 30;     // ~2618
const SCENE2_END = F.create - 10;        // ~2689
const SCENE3_START = F.create - 30;      // ~2669

// ─── Branch File Card ─────────────────────────────────────
const BranchFileCard: React.FC<{
  name: string;
  hash: string;
  color: string;
  opacity: number;
  translateY: number;
  scale?: number;
  glowing?: boolean;
  sizeLabel?: string;
  sizeLabelOpacity?: number;
}> = ({ name, hash, color, opacity, translateY, scale = 1, glowing, sizeLabel, sizeLabelOpacity = 0 }) => (
  <div
    style={{
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
    }}
  >
    {/* The file itself */}
    <div
      style={{
        width: 280,
        borderRadius: 12,
        background: `${color}08`,
        border: `2px solid ${color}${glowing ? "60" : "30"}`,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: glowing ? `0 0 30px ${color}25, inset 0 0 20px ${color}06` : `0 0 12px ${color}10`,
        position: "relative",
      }}
    >
      {/* File header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <File size={22} color={color} weight="duotone" />
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            fontSize: 18,
            fontWeight: 700,
            color,
            letterSpacing: 0.5,
          }}
        >
          {name}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: "100%", height: 1, background: `${color}20` }} />

      {/* Hash content */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 15,
          fontWeight: 500,
          color: TEXT_MUTED,
          letterSpacing: 0.3,
          lineHeight: 1.6,
        }}
      >
        {hash}
      </div>
    </div>

    {/* Size label */}
    <div style={{ opacity: sizeLabelOpacity, display: "flex", alignItems: "center", gap: 6 }}>
      {sizeLabel && (
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            fontSize: 14,
            fontWeight: 600,
            color: ACCENT,
            textShadow: `0 0 12px ${ACCENT}40`,
          }}
        >
          {sizeLabel}
        </span>
      )}
    </div>
  </div>
);

// ─── HEAD Pointer ─────────────────────────────────────────
const HeadPointer: React.FC<{
  opacity: number;
  translateX: number;
  scale: number;
}> = ({ opacity, translateX, scale }) => (
  <div
    style={{
      opacity,
      transform: `translateX(${translateX}px) scale(${scale})`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
    }}
  >
    <div
      style={{
        padding: "10px 24px",
        borderRadius: 10,
        background: `${ACCENT}15`,
        border: `2px solid ${ACCENT}50`,
        boxShadow: `0 0 20px ${ACCENT}20`,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <CaretRight size={20} color={ACCENT} weight="bold" />
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color: ACCENT,
          letterSpacing: 1,
          textShadow: `0 0 10px ${ACCENT}40`,
        }}
      >
        HEAD
      </span>
    </div>
    {/* Arrow down */}
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "10px solid transparent",
        borderRight: "10px solid transparent",
        borderTop: `14px solid ${ACCENT}80`,
        filter: `drop-shadow(0 0 6px ${ACCENT}40)`,
      }}
    />
  </div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_Branches: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE 1: Misconception → Revelation (f2415–f2638) ──

  // 🔊 SOUND: scene_start @ frame 2415 — segment opens, title fades in
  const titleOp = fadeIn(frame, F.branches, 20);
  const titleSlide = slideUp(frame, F.branches, 20);

  // "interesting" emphasis glow
  // 🔊 SOUND: element_appear @ frame 2432 — "interesting" text glows
  const interestingGlow = interpolate(frame, [F.interesting, F.interesting + 15], [0, 20], clamp);

  // "A branch ISN'T a copy" — show misconception
  // 🔊 SOUND: element_appear @ frame 2471 — misconception folder icon appears
  const misconceptionOp = fadeIn(frame, F.branch - 5, 15);
  const misconceptionSlide = slideUp(frame, F.branch - 5, 15);

  // X mark on the folder at "isn't"
  // 🔊 SOUND: reveal @ frame 2485 — red X crosses out the folder icon
  const xMarkOp = fadeIn(frame, F.isnt, 10);
  const xMarkScale = spring({
    frame: Math.max(0, frame - F.isnt),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // Folder dims + grayscale after X
  const folderDim = interpolate(frame, [F.isnt, F.isnt + 20], [1, 0.25], clamp);

  // "It's just a text file" — file card appears
  // 🔊 SOUND: reveal @ frame 2561 — branch file card slides in, key revelation
  const fileCardOp = fadeIn(frame, F.textFile - 5, 18);
  const fileCardSlide = slideUp(frame, F.textFile - 5, 18);

  // "containing one commit hash" — hash text appears inside card
  // 🔊 SOUND: element_appear @ frame 2604 — hash text types in
  const hashTextOp = fadeIn(frame, F.commitHash - 3, 12);

  // Scene 1 fade out
  const scene1Fade = frame < SCENE1_END ? 1 : fadeOut(frame, SCENE1_END, 25);

  // ─── SCENE 2: "That's it" emphasis (f2618–f2689) ────────

  // 🔊 SOUND: transition @ frame 2638 — scene crossfades to "That's it" emphasis
  const scene2FadeIn = fadeIn(frame, SCENE2_START, 25);
  const scene2FadeOut = frame < SCENE2_END ? 1 : fadeOut(frame, SCENE2_END, 25);
  const scene2Op = scene2FadeIn * scene2FadeOut;

  // "That's it." big text pop
  // 🔊 SOUND: reveal @ frame 2648 — "That's it" text scales up dramatically
  const thatsItScale = spring({
    frame: Math.max(0, frame - F.thatsIt),
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  const thatsItOp = fadeIn(frame, F.thatsIt, 12);

  // File card in scene 2 (persistent from scene 1 but centered/bigger)
  const scene2CardOp = fadeIn(frame, SCENE2_START + 5, 15);
  const scene2CardScale = interpolate(frame, [SCENE2_START + 5, SCENE2_START + 20], [0.9, 1.05], {
    ...clamp,
    easing: easeOutCubic,
  });

  // ─── SCENE 3: New branch + HEAD switching (f2669–f2982) ─

  // 🔊 SOUND: transition @ frame 2689 — scene crossfades to branch creation
  const scene3FadeIn = fadeIn(frame, SCENE3_START, 25);

  // "main" file already visible
  // 🔊 SOUND: element_appear @ frame 2699 — "main" branch file card appears
  const mainCardOp = fadeIn(frame, SCENE3_START + 15, 18);
  const mainCardSlide = slideUp(frame, SCENE3_START + 15, 18);

  // "create a new branch" — "feature" file appears
  // 🔊 SOUND: element_appear @ frame 2713 — "feature" branch file card slides in
  const featureCardOp = fadeIn(frame, F.newBranch, 18);
  const featureCardSlide = slideUp(frame, F.newBranch, 18);

  // "forty byte file" — size label pops
  // 🔊 SOUND: reveal @ frame 2757 — "40 bytes" label scales up with emphasis
  const sizeLabOp = fadeIn(frame, F.fortyByte - 3, 12);
  const sizeLabScale = spring({
    frame: Math.max(0, frame - F.fortyByte),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // HEAD pointer appears at "switch branches"
  // 🔊 SOUND: element_appear @ frame 2849 — HEAD pointer badge appears above main
  const headOp = fadeIn(frame, F.switchWord - 5, 15);
  const headScale = spring({
    frame: Math.max(0, frame - (F.switchWord - 5)),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // HEAD moves from main (x=0) to feature card when narrator says "HEAD"
  // main is left (-180), feature is right (+180)
  // 🔊 SOUND: reveal @ frame 2906 — HEAD pointer smoothly slides from main to feature branch
  const headSlideX = interpolate(
    frame,
    [F.head, F.head + 25],
    [0, 360],
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );

  // Main card glow state — glows when HEAD points to it, dims when HEAD moves
  const mainGlowing = frame < F.head;
  const mainDimFactor = interpolate(frame, [F.head, F.head + 15], [1, 0.6], clamp);

  // Feature card glow — glows when HEAD arrives
  const featureGlowing = frame >= F.head + 15;
  const featureGlowFactor = interpolate(frame, [F.head + 10, F.head + 25], [0.6, 1], clamp);

  // "branch file" final emphasis
  // 🔊 SOUND: element_appear @ frame 2972 — final emphasis glow on branch files
  const finalGlow = interpolate(frame, [F.branchFile, F.branchFile + 15], [0, 25], clamp);

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
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${PRIMARY}06 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ════════════ SCENE 1: Misconception → File Revelation ════════════ */}
      {frame < SCENE1_END + 25 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 48,
            opacity: scene1Fade,
          }}
        >
          {/* Title: "branches get interesting" */}
          <div
            style={{
              opacity: titleOp,
              transform: `translateY(${titleSlide}px)`,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: -0.5,
              }}
            >
              Branches get{" "}
              <span
                style={{
                  color: PRIMARY,
                  textShadow: `0 0 ${interestingGlow}px ${PRIMARY}60`,
                }}
              >
                interesting
              </span>
            </span>
          </div>

          {/* Misconception vs Reality row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 100,
            }}
          >
            {/* LEFT: Misconception — folder = "copy of code" */}
            <div
              style={{
                opacity: misconceptionOp * folderDim,
                transform: `translateY(${misconceptionSlide}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                position: "relative",
                filter: frame >= F.isnt + 20 ? "grayscale(0.7)" : "none",
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 16,
                  background: `${TEXT_MUTED}08`,
                  border: `2px solid ${TEXT_MUTED}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <Folder size={64} color={TEXT_MUTED} weight="duotone" />
                {/* Red X */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: xMarkOp,
                    transform: `scale(${xMarkScale})`,
                  }}
                >
                  <X size={100} color="#ef4444" weight="bold" style={{ filter: "drop-shadow(0 0 8px #ef444460)" }} />
                </div>
              </div>
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 16,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  textDecoration: frame >= F.isnt ? "line-through" : "none",
                  textDecorationColor: "#ef4444",
                }}
              >
                "copy of your code"
              </span>
            </div>

            {/* Arrow between */}
            <div style={{ opacity: fileCardOp }}>
              <ArrowRight size={36} color={PRIMARY} weight="bold" style={{ filter: `drop-shadow(0 0 8px ${PRIMARY}40)` }} />
            </div>

            {/* RIGHT: Reality — tiny text file */}
            <div
              style={{
                opacity: fileCardOp,
                transform: `translateY(${fileCardSlide}px)`,
              }}
            >
              <BranchFileCard
                name="main"
                hash={hashTextOp > 0.1 ? "a1b2c3d4e5f6..." : ""}
                color={PRIMARY}
                opacity={1}
                translateY={0}
                glowing
              />
            </div>
          </div>

          {/* "just a text file containing one commit hash" label */}
          <div
            style={{
              opacity: fadeIn(frame, F.textFile + 10, 15),
              transform: `translateY(${slideUp(frame, F.textFile + 10, 15)}px)`,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 20,
                fontWeight: 600,
                color: TEXT_MUTED,
              }}
            >
              Just a{" "}
              <span style={{ color: SECONDARY }}>text file</span>
              {" "}with one{" "}
              <span style={{ color: PRIMARY }}>commit hash</span>
            </span>
          </div>
        </div>
      )}

      {/* ════════════ SCENE 2: "That's it" Emphasis ════════════ */}
      {frame >= SCENE2_START && frame < SCENE2_END + 25 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 48,
            opacity: scene2Op,
          }}
        >
          {/* File card centered */}
          <div style={{ opacity: scene2CardOp, transform: `scale(${scene2CardScale})` }}>
            <BranchFileCard
              name="main"
              hash="a1b2c3d4e5f6..."
              color={PRIMARY}
              opacity={1}
              translateY={0}
              glowing
            />
          </div>

          {/* "That's it." dramatic text */}
          <div
            style={{
              opacity: thatsItOp,
              transform: `scale(${thatsItScale})`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', 'JetBrains Mono', monospace",
                fontSize: 48,
                fontWeight: 700,
                color: ACCENT,
                letterSpacing: -1,
                textShadow: `0 0 30px ${ACCENT}40`,
              }}
            >
              That's it.
            </span>
          </div>
        </div>
      )}

      {/* ════════════ SCENE 3: Create branch + HEAD switching ════════════ */}
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
            gap: 40,
            opacity: scene3FadeIn,
          }}
        >
          {/* Section title */}
          <div
            style={{
              opacity: fadeIn(frame, SCENE3_START + 10, 15),
              transform: `translateY(${slideUp(frame, SCENE3_START + 10, 15)}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <GitBranch size={28} color={PRIMARY} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 22,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: 0.5,
              }}
            >
              .git/refs/heads/
            </span>
          </div>

          {/* HEAD pointer above the cards */}
          <div
            style={{
              position: "relative",
              width: 660,
              height: 60,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 150 - 50, // centered above main card initially
                top: 0,
              }}
            >
              <HeadPointer
                opacity={headOp}
                translateX={headSlideX}
                scale={headScale}
              />
            </div>
          </div>

          {/* Branch file cards row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 80,
            }}
          >
            {/* MAIN branch file */}
            <div style={{ opacity: mainCardOp * mainDimFactor }}>
              <BranchFileCard
                name="main"
                hash="a1b2c3d4e5f6..."
                color={PRIMARY}
                opacity={1}
                translateY={mainCardSlide}
                glowing={mainGlowing}
                sizeLabel="40 bytes"
                sizeLabelOpacity={sizeLabOp * sizeLabScale}
              />
            </div>

            {/* FEATURE branch file */}
            <div style={{ opacity: featureCardOp * featureGlowFactor }}>
              <BranchFileCard
                name="feature"
                hash="f7e8d9c0b1a2..."
                color={SECONDARY}
                opacity={1}
                translateY={featureCardSlide}
                glowing={featureGlowing}
                sizeLabel="40 bytes"
                sizeLabelOpacity={sizeLabOp * sizeLabScale}
              />
            </div>
          </div>

          {/* Explanation text below cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            {/* "git creates a forty byte file" text */}
            <div
              style={{
                opacity: fadeIn(frame, F.fortyByte, 15),
                transform: `translateY(${slideUp(frame, F.fortyByte, 15)}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                }}
              >
                Each branch ={" "}
                <span
                  style={{
                    color: ACCENT,
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                    fontWeight: 700,
                    textShadow: `0 0 ${finalGlow}px ${ACCENT}40`,
                  }}
                >
                  40-byte file
                </span>
                {" "}with a hash
              </span>
            </div>

            {/* "HEAD points to branch file" text */}
            <div
              style={{
                opacity: fadeIn(frame, F.head - 5, 15),
                transform: `translateY(${slideUp(frame, F.head - 5, 15)}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                }}
              >
                <span style={{ color: ACCENT, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>HEAD</span>
                {" "}= which branch you're on
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_Branches;
