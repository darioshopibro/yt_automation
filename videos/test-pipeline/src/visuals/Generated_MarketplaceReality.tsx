import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

// ── Helpers ──────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [24, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeInQuad });

// ── Colors ───────────────────────────────────────────────
const BG = "#030305";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const SUCCESS = "#22c55e";
const DANGER = "#ef4444";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

// ── Timestamps (global frames from voiceover) ────────────
const F_VS_CODE = 3075;
const F_40K = 3147;
const F_MICROSOFT = 3228;
const F_POPULAR = 3249;
const F_LONG_TAIL = 3298;
const F_UNMODERATED = 3337;
const F_RESEARCHERS = 3438;
const F_18_EXT = 3462;
const F_7M = 3520;
const F_MINING = 3606;

const START = 3067;
const END = 3677;

// ── Scene 1: The Marketplace Scale (f3067–f3400) ────────
const MarketplaceScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // 🔊 SOUND: scene_start @ frame 3067 — segment opens, dark bg
  const sceneOp = fadeIn(frame, START, 12);

  // 🔊 SOUND: element_appear @ frame 3070 — VS Code icon + marketplace title slides in
  const titleOp = fadeIn(frame, START + 3, 15);
  const titleY = slideUp(frame, START + 3, 15);

  // 🔊 SOUND: reveal @ frame 3147 — big "40,000" number counts up from 0
  const countStart = F_40K;
  const countOp = fadeIn(frame, countStart - 3, 15);
  const countScale = spring({ frame: Math.max(0, frame - (countStart - 3)), fps, config: { damping: 22, stiffness: 180 } });
  const countValue = interpolate(frame, [countStart, countStart + 40], [0, 40000], { ...clamp, easing: easeOutCubic });

  // 🔊 SOUND: element_appear @ frame 3225 — "Microsoft reviews" green badge appears
  const reviewOp = fadeIn(frame, F_MICROSOFT - 3, 15);
  const reviewY = slideUp(frame, F_MICROSOFT - 3, 15);

  // 🔊 SOUND: element_appear @ frame 3246 — green "reviewed" bar section highlights
  const popularOp = fadeIn(frame, F_POPULAR - 3, 15);
  const reviewedWidth = interpolate(frame, [F_POPULAR - 3, F_POPULAR + 25], [0, 12], { ...clamp, easing: easeOutCubic });

  // 🔊 SOUND: element_appear @ frame 3295 — massive red "long tail" bar expands
  const longTailOp = fadeIn(frame, F_LONG_TAIL - 3, 20);
  const longTailWidth = interpolate(frame, [F_LONG_TAIL - 3, F_LONG_TAIL + 35], [0, 88], { ...clamp, easing: easeOutCubic });

  // 🔊 SOUND: reveal @ frame 3337 — "UNMODERATED" label pulses red
  const unmodOp = fadeIn(frame, F_UNMODERATED - 3, 12);
  const unmodScale = spring({ frame: Math.max(0, frame - (F_UNMODERATED - 3)), fps, config: { damping: 20, stiffness: 200 } });
  const unmodPulse = interpolate(frame, [F_UNMODERATED, F_UNMODERATED + 30, F_UNMODERATED + 60], [0, 1, 0.5], { ...clamp });

  // Scene fade out
  const sceneOut = interpolate(frame, [3380, 3410], [1, 0], { ...clamp });

  const CodeIcon = getIcon("Code");
  const ShieldCheck = getIcon("ShieldCheck");
  const Warning = getIcon("Warning");

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 36,
      padding: 80,
      opacity: sceneOp * sceneOut,
    }}>
      {/* Title: VS Code Marketplace */}
      <div style={{
        opacity: titleOp,
        transform: `translateY(${titleY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <CodeIcon size={36} color={PRIMARY} weight="duotone" style={{ filter: `drop-shadow(0 0 10px ${PRIMARY}60)` }} />
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: TEXT_PRIMARY,
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: -0.5,
        }}>
          VS Code Marketplace
        </span>
      </div>

      {/* Big 40,000 counter */}
      <div style={{
        opacity: countOp,
        transform: `scale(${countScale})`,
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 80,
          fontWeight: 800,
          color: PRIMARY,
          fontFamily: "'SF Mono', monospace",
          letterSpacing: -3,
          textShadow: `0 0 40px ${PRIMARY}30`,
        }}>
          {Math.round(countValue).toLocaleString()}
        </div>
        <div style={{
          fontSize: 18,
          color: TEXT_DIM,
          fontFamily: "'Inter', system-ui, sans-serif",
          marginTop: 4,
        }}>
          extensions available
        </div>
      </div>

      {/* Proportional bar: reviewed vs long tail */}
      <div style={{
        width: 800,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: Math.max(popularOp, longTailOp),
      }}>
        {/* Bar container */}
        <div style={{
          width: "100%",
          height: 40,
          borderRadius: 12,
          background: "#1a1a2e",
          display: "flex",
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
        }}>
          {/* Reviewed (small green section) */}
          <div style={{
            width: `${reviewedWidth}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${SUCCESS}90, ${SUCCESS})`,
            boxShadow: `0 0 15px ${SUCCESS}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: popularOp,
          }}>
            {reviewedWidth > 8 && (
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'SF Mono', monospace",
              }}>
                REVIEWED
              </span>
            )}
          </div>

          {/* Long tail (massive red section) */}
          <div style={{
            width: `${longTailWidth}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${DANGER}60, ${DANGER}90)`,
            boxShadow: `0 0 20px ${DANGER}${Math.round(unmodPulse * 40).toString(16).padStart(2, "0")}`,
            opacity: longTailOp,
          }} />
        </div>

        {/* Labels under bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          {/* Reviewed label */}
          <div style={{
            opacity: reviewOp,
            transform: `translateY(${reviewY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <ShieldCheck size={20} color={SUCCESS} weight="duotone" />
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              color: SUCCESS,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Microsoft reviews top extensions
            </span>
          </div>

          {/* Unmoderated label */}
          <div style={{
            opacity: unmodOp,
            transform: `scale(${unmodScale})`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 8,
            background: `${DANGER}12`,
            border: `1px solid ${DANGER}30`,
            boxShadow: `0 0 ${unmodPulse * 25}px ${DANGER}30`,
          }}>
            <Warning size={20} color={DANGER} weight="duotone" />
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: DANGER,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: 1,
            }}>
              UNMODERATED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Scene 2: The Discovery (f3400–f3677) ────────────────

const DiscoveryScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  if (frame < 3390) return null;

  // 🔊 SOUND: transition @ frame 3400 — scene crossfades to discovery
  const sceneIn = fadeIn(frame, 3400, 20);

  // 🔊 SOUND: element_appear @ frame 3435 — magnifying glass + "Researchers found" text
  const researchOp = fadeIn(frame, F_RESEARCHERS - 3, 15);
  const researchY = slideUp(frame, F_RESEARCHERS - 3, 15);

  // Extension grid — 18 malicious among many
  // 🔊 SOUND: reveal @ frame 3459 — 18 extension tiles turn red one by one
  const extRevealStart = F_18_EXT - 3;

  // 🔊 SOUND: reveal @ frame 3517 — big "7,000,000" installs counter scales up
  const installsOp = fadeIn(frame, F_7M - 3, 15);
  const installsScale = spring({ frame: Math.max(0, frame - (F_7M - 3)), fps, config: { damping: 20, stiffness: 180 } });
  const installsCount = interpolate(frame, [F_7M, F_7M + 45], [0, 7000000], { ...clamp, easing: easeOutCubic });

  // 🔊 SOUND: reveal @ frame 3603 — crypto mining icon + label appears with warning glow
  const miningOp = fadeIn(frame, F_MINING - 3, 15);
  const miningY = slideUp(frame, F_MINING - 3, 15);
  const miningScale = spring({ frame: Math.max(0, frame - (F_MINING - 3)), fps, config: { damping: 20, stiffness: 200 } });
  const miningPulse = interpolate(
    frame,
    [F_MINING, F_MINING + 20, F_MINING + 40, F_MINING + 60],
    [0, 1, 0.4, 0.8],
    { ...clamp }
  );

  const MagnifyingGlass = getIcon("MagnifyingGlass");
  const DownloadSimple = getIcon("DownloadSimple");
  const CurrencyBtc = getIcon("CurrencyBtc");
  const Pickaxe = getIcon("Pickaxe");
  const Bug = getIcon("Bug");

  // Generate extension grid (6x6 = 36 tiles, 18 are malicious)
  const gridSize = 36;
  const maliciousIndices = [2, 5, 7, 10, 12, 14, 17, 19, 21, 23, 25, 27, 28, 30, 31, 33, 34, 35];

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      padding: 80,
      opacity: sceneIn,
    }}>
      {/* "Researchers found..." header */}
      <div style={{
        opacity: researchOp,
        transform: `translateY(${researchY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <MagnifyingGlass size={28} color={SECONDARY} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${SECONDARY}60)` }} />
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: TEXT_PRIMARY,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Security Researchers Discovered
        </span>
      </div>

      {/* Extension grid + stats side by side */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 60,
      }}>
        {/* Extension grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 44px)",
          gap: 8,
        }}>
          {Array.from({ length: gridSize }).map((_, i) => {
            const isMalicious = maliciousIndices.includes(i);
            const malIdx = maliciousIndices.indexOf(i);
            const revealDelay = isMalicious ? malIdx * 3 : 0;
            const tileRevealed = isMalicious && frame >= extRevealStart + revealDelay;

            const tileOp = fadeIn(frame, extRevealStart - 30 + i * 1.5, 12);
            const tileColor = tileRevealed ? DANGER : "#2a2a3e";
            const tileBorder = tileRevealed ? `${DANGER}60` : `${BORDER}`;
            const tileGlow = tileRevealed ? `0 0 10px ${DANGER}40` : "none";

            return (
              <div
                key={i}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: tileRevealed ? `${DANGER}18` : `${tileColor}15`,
                  border: `1.5px solid ${tileBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: tileOp,
                  boxShadow: tileGlow,
                }}
              >
                {tileRevealed ? (
                  <Bug size={20} color={DANGER} weight="duotone" style={{ filter: `drop-shadow(0 0 4px ${DANGER}60)` }} />
                ) : (
                  <Cube size={16} color="#4a4a5e" weight="duotone" />
                )}
              </div>
            );
          })}
        </div>

        {/* Stats column */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}>
          {/* 18 malicious extensions count */}
          <div style={{
            opacity: fadeIn(frame, F_18_EXT - 3, 15),
            transform: `scale(${spring({ frame: Math.max(0, frame - (F_18_EXT - 3)), fps, config: { damping: 22, stiffness: 180 } })})`,
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 72,
              fontWeight: 800,
              color: DANGER,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: -3,
              textShadow: `0 0 30px ${DANGER}40`,
            }}>
              18
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 600,
              color: DANGER,
              fontFamily: "'Inter', system-ui, sans-serif",
              opacity: 0.8,
            }}>
              malicious extensions
            </div>
          </div>

          {/* 7M installs */}
          <div style={{
            opacity: installsOp,
            transform: `scale(${installsScale})`,
            textAlign: "center",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "center",
            }}>
              <DownloadSimple size={28} color={ACCENT} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${ACCENT}60)` }} />
              <div style={{
                fontSize: 56,
                fontWeight: 800,
                color: ACCENT,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: -2,
                textShadow: `0 0 30px ${ACCENT}30`,
              }}>
                {installsCount >= 1000000
                  ? `${(installsCount / 1000000).toFixed(installsCount >= 6500000 ? 0 : 1)}M`
                  : `${Math.round(installsCount / 1000)}K`}
              </div>
            </div>
            <div style={{
              fontSize: 15,
              fontWeight: 500,
              color: TEXT_DIM,
              fontFamily: "'Inter', system-ui, sans-serif",
              marginTop: 4,
            }}>
              combined installs
            </div>
          </div>

          {/* Mining cryptocurrency */}
          <div style={{
            opacity: miningOp,
            transform: `translateY(${miningY}px) scale(${miningScale})`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 28px",
            borderRadius: 12,
            background: `${ACCENT}10`,
            border: `1.5px solid ${ACCENT}35`,
            boxShadow: `0 0 ${miningPulse * 30}px ${ACCENT}25`,
          }}>
            <CurrencyBtc size={28} color={ACCENT} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${ACCENT}60)` }} />
            <span style={{
              fontSize: 18,
              fontWeight: 700,
              color: ACCENT,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: 0.5,
            }}>
              Secretly Mining Crypto
            </span>
            <Pickaxe size={24} color={ACCENT} weight="duotone" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────

const Generated_MarketplaceReality: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{
      width: 1920,
      height: 1080,
      background: BG,
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle grid pattern overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${PRIMARY}06 1px, transparent 0)`,
        backgroundSize: "60px 60px",
        opacity: 0.5,
      }} />

      {/* Scene 1: Marketplace Scale (3067–3410) */}
      {frame < 3410 && <MarketplaceScene frame={frame} fps={fps} />}

      {/* Scene 2: The Discovery (3400–3677) */}
      {frame >= 3390 && <DiscoveryScene frame={frame} fps={fps} />}
    </div>
  );
};

export default Generated_MarketplaceReality;
