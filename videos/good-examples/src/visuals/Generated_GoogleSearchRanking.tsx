import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

// ── Helpers ──────────────────────────────────────────────

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const formatNumber = (n: number): string => {
  if (n >= 1e9) return (n / 1e9).toFixed(0) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n.toFixed(0);
};

// ── Scene 1: The Funnel ──────────────────────────────────

const FunnelScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Title appears
  const titleOp = fadeIn(frame, 0);
  const titleY = slideUp(frame, 0);

  // "100 billion pages" counter
  const indexStart = 20;
  const indexOp = fadeIn(frame, indexStart);
  const indexY = slideUp(frame, indexStart);
  const indexCount = interpolate(frame, [indexStart, indexStart + 30], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Funnel narrows — "keyword matching eliminates 99.9%"
  const filterStart = 60;
  const filterOp = fadeIn(frame, filterStart);
  const funnelWidth = interpolate(frame, [filterStart, filterStart + 40], [100, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // "99.9% eliminated" label
  const elimStart = 75;
  const elimOp = fadeIn(frame, elimStart);

  // "10 million candidates" result
  const resultStart = 110;
  const resultOp = fadeIn(frame, resultStart);
  const resultY = slideUp(frame, resultStart);
  const resultCount = interpolate(frame, [resultStart, resultStart + 25], [100e6, 10e6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "Ranking signals kick in" text
  const signalsStart = 140;
  const signalsOp = fadeIn(frame, signalsStart);
  const signalsScale = spring({ frame: Math.max(0, frame - signalsStart), fps, config: { damping: 20, stiffness: 200 } });

  // Fade out entire scene
  const sceneOut = interpolate(frame, [155, 170], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const MagnifyingGlass = getIcon("MagnifyingGlass");
  const Funnel = getIcon("Funnel");
  const Lightning = getIcon("Lightning");

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      opacity: sceneOut,
    }}>
      {/* Title */}
      <div style={{
        opacity: titleOp,
        transform: `translateY(${titleY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <MagnifyingGlass size={36} color="#3b82f6" weight="duotone" style={{ filter: "drop-shadow(0 0 8px #3b82f660)" }} />
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#e2e8f0",
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: -0.5,
        }}>
          How Google Search Ranks Pages
        </span>
      </div>

      {/* Index count */}
      <div style={{
        opacity: indexOp,
        transform: `translateY(${indexY}px)`,
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          color: "#3b82f6",
          fontFamily: "'SF Mono', monospace",
          letterSpacing: -2,
          textShadow: "0 0 30px #3b82f630",
        }}>
          {formatNumber(Math.round(indexCount * 1e9))}
        </div>
        <div style={{
          fontSize: 16,
          color: "#94a3b8",
          fontFamily: "'Inter', system-ui, sans-serif",
          marginTop: 4,
        }}>
          pages in Google's index
        </div>
      </div>

      {/* Funnel visualization */}
      <div style={{
        opacity: filterOp,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}>
        <Funnel size={32} color="#f59e0b" weight="duotone" style={{ filter: "drop-shadow(0 0 8px #f59e0b60)" }} />

        {/* Animated funnel bar */}
        <div style={{
          width: 500,
          height: 24,
          borderRadius: 12,
          background: "#1a1a2e",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            width: `${funnelWidth}%`,
            height: "100%",
            borderRadius: 12,
            background: "linear-gradient(90deg, #3b82f6, #f59e0b)",
            transition: "none",
          }} />
        </div>

        {/* 99.9% eliminated */}
        <div style={{
          opacity: elimOp,
          fontSize: 14,
          fontWeight: 600,
          color: "#ef4444",
          fontFamily: "'SF Mono', monospace",
          letterSpacing: 1,
        }}>
          99.9% ELIMINATED
        </div>
      </div>

      {/* Remaining candidates */}
      <div style={{
        opacity: resultOp,
        transform: `translateY(${resultY}px)`,
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#22c55e",
          fontFamily: "'SF Mono', monospace",
          letterSpacing: -2,
          textShadow: "0 0 30px #22c55e30",
        }}>
          {formatNumber(Math.round(resultCount))}
        </div>
        <div style={{
          fontSize: 14,
          color: "#94a3b8",
          fontFamily: "'Inter', system-ui, sans-serif",
          marginTop: 2,
        }}>
          candidates remaining
        </div>
      </div>

      {/* "Ranking signals kick in" */}
      <div style={{
        opacity: signalsOp,
        transform: `scale(${signalsScale})`,
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 16,
      }}>
        <Lightning size={24} color="#f59e0b" weight="duotone" />
        <span style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#f59e0b",
          fontFamily: "'Inter', system-ui, sans-serif",
          textShadow: "0 0 20px #f59e0b30",
        }}>
          Ranking signals kick in
        </span>
      </div>
    </div>
  );
};

// ── Scene 2: Ranking Signals ─────────────────────────────

type Signal = {
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  importance: number; // 0-100 bar width
  startFrame: number;
};

const signals: Signal[] = [
  { label: "PageRank", sublabel: "Backlink quality & quantity", icon: "Link", color: "#3b82f6", importance: 90, startFrame: 0 },
  { label: "Content Relevance", sublabel: "Intent matching, not just keywords", icon: "TextAa", color: "#22c55e", importance: 85, startFrame: 30 },
  { label: "Freshness", sublabel: "Newer wins for news queries", icon: "Clock", color: "#f59e0b", importance: 60, startFrame: 55 },
  { label: "User Signals", sublabel: "Bounce = drop, dwell = rise", icon: "Users", color: "#a855f7", importance: 80, startFrame: 80 },
  { label: "Technical", sublabel: "Mobile, speed, HTTPS", icon: "DeviceMobile", color: "#06b6d4", importance: 45, startFrame: 110 },
  { label: "Core Web Vitals", sublabel: "LCP < 2.5s  FID < 100ms  CLS < 0.1", icon: "Gauge", color: "#f97316", importance: 50, startFrame: 135 },
];

const SignalBar: React.FC<{ signal: Signal; frame: number; fps: number }> = ({ signal, frame, fps }) => {
  const localFrame = frame;
  const op = fadeIn(localFrame, signal.startFrame, 18);
  const yOff = slideUp(localFrame, signal.startFrame, 18);

  const barProgress = interpolate(localFrame, [signal.startFrame + 10, signal.startFrame + 40], [0, signal.importance], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const Icon = getIcon(signal.icon);

  return (
    <div style={{
      opacity: op,
      transform: `translateY(${yOff}px)`,
      display: "flex",
      alignItems: "center",
      gap: 16,
      width: "100%",
    }}>
      {/* Icon */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${signal.color}20, ${signal.color}08)`,
        border: `1.5px solid ${signal.color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 0 15px ${signal.color}15`,
      }}>
        <Icon size={26} color={signal.color} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${signal.color}60)` }} />
      </div>

      {/* Label + bar */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#e2e8f0",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            {signal.label}
          </span>
          <span style={{
            fontSize: 11,
            color: "#64748b",
            fontFamily: "'SF Mono', monospace",
          }}>
            {signal.sublabel}
          </span>
        </div>
        <div style={{
          width: "100%",
          height: 10,
          borderRadius: 5,
          background: "#1a1a2e",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${barProgress}%`,
            height: "100%",
            borderRadius: 5,
            background: `linear-gradient(90deg, ${signal.color}90, ${signal.color})`,
            boxShadow: `0 0 12px ${signal.color}40`,
          }} />
        </div>
      </div>
    </div>
  );
};

const SignalsScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 170;
  if (sceneFrame < 0) return null;

  const sceneIn = fadeIn(sceneFrame, 0);

  // "All signals combine" text
  const combineStart = 165;
  const combineOp = fadeIn(sceneFrame, combineStart);
  const combineScale = spring({ frame: Math.max(0, sceneFrame - combineStart), fps, config: { damping: 20, stiffness: 200 } });

  // Scene fade out
  const sceneOut = interpolate(sceneFrame, [185, 200], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ChartBar = getIcon("ChartBar");
  const ArrowsClockwise = getIcon("ArrowsClockwise");

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 80,
      opacity: sceneIn * sceneOut,
    }}>
      {/* Section title */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 40,
      }}>
        <ChartBar size={28} color="#a855f7" weight="duotone" style={{ filter: "drop-shadow(0 0 8px #a855f760)" }} />
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#e2e8f0",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Ranking Signals
        </span>
      </div>

      {/* Signal bars */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: 700,
      }}>
        {signals.map((s, i) => (
          <SignalBar key={i} signal={s} frame={sceneFrame} fps={fps} />
        ))}
      </div>

      {/* "All signals combine into final score" */}
      <div style={{
        opacity: combineOp,
        transform: `scale(${combineScale})`,
        marginTop: 40,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 24px",
        borderRadius: 12,
        background: "#a855f710",
        border: "1px solid #a855f725",
      }}>
        <ArrowsClockwise size={22} color="#a855f7" weight="duotone" />
        <span style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#a855f7",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          All signals combine into a final score
        </span>
      </div>
    </div>
  );
};

// ── Scene 3: The Results ─────────────────────────────────

type ResultItem = {
  position: number;
  ctr: number;
};

const resultItems: ResultItem[] = [
  { position: 1, ctr: 31 },
  { position: 2, ctr: 24 },
  { position: 3, ctr: 18 },
  { position: 4, ctr: 13 },
  { position: 5, ctr: 9.5 },
  { position: 6, ctr: 6.5 },
  { position: 7, ctr: 5 },
  { position: 8, ctr: 4 },
  { position: 9, ctr: 3.2 },
  { position: 10, ctr: 2.5 },
];

const ResultsScene: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const sceneFrame = frame - 370;
  if (sceneFrame < 0) return null;

  const sceneIn = fadeIn(sceneFrame, 0);

  // Position 1 highlight moment
  const highlightStart = 50;
  const pos1Glow = interpolate(sceneFrame, [highlightStart, highlightStart + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "Page 2?" moment
  const page2Start = 100;
  const page2Op = fadeIn(sceneFrame, page2Start);
  const page2Fade = interpolate(sceneFrame, [page2Start + 20, page2Start + 45], [1, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  const ListNumbers = getIcon("ListNumbers");
  const EyeSlash = getIcon("EyeSlash");

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 80px",
      opacity: sceneIn,
    }}>
      {/* Title */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 32,
      }}>
        <ListNumbers size={28} color="#22c55e" weight="duotone" style={{ filter: "drop-shadow(0 0 8px #22c55e60)" }} />
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#e2e8f0",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Page One — Click Distribution
        </span>
      </div>

      {/* Results list */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: 680,
      }}>
        {resultItems.map((item, i) => {
          const itemStart = 10 + i * 6;
          const itemOp = fadeIn(sceneFrame, itemStart, 12);
          const itemY = slideUp(sceneFrame, itemStart, 12);

          const barWidth = interpolate(sceneFrame, [itemStart + 8, itemStart + 30], [0, item.ctr], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          });

          const isPos1 = item.position === 1;
          const isPos10 = item.position === 10;
          const rowColor = isPos1 ? "#22c55e" : isPos10 ? "#ef4444" : colors[i % colors.length];

          const glowIntensity = isPos1 ? pos1Glow * 20 : 0;

          return (
            <div
              key={i}
              style={{
                opacity: itemOp,
                transform: `translateY(${itemY}px)`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "8px 14px",
                borderRadius: 10,
                background: isPos1 ? `#22c55e08` : "transparent",
                border: isPos1 ? `1px solid #22c55e20` : "1px solid transparent",
                boxShadow: isPos1 ? `0 0 ${glowIntensity}px #22c55e30` : "none",
              }}
            >
              {/* Position number */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: `${rowColor}20`,
                border: `1.5px solid ${rowColor}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: rowColor,
                  fontFamily: "'SF Mono', monospace",
                }}>
                  {item.position}
                </span>
              </div>

              {/* CTR bar */}
              <div style={{ flex: 1 }}>
                <div style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 4,
                  background: "#1a1a2e",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${rowColor}80, ${rowColor})`,
                    boxShadow: isPos1 ? `0 0 10px ${rowColor}50` : "none",
                  }} />
                </div>
              </div>

              {/* CTR percentage */}
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: rowColor,
                fontFamily: "'SF Mono', monospace",
                width: 50,
                textAlign: "right",
              }}>
                {item.ctr}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Page 2 — Basically invisible */}
      <div style={{
        opacity: page2Op * page2Fade,
        marginTop: 28,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        borderRadius: 10,
        background: "#ef444410",
        border: "1px solid #ef444420",
      }}>
        <EyeSlash size={22} color="#ef4444" weight="duotone" />
        <span style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#ef4444",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Page 2? Basically invisible.
        </span>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────

const Generated_GoogleSearchRanking: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{
      width: 1920,
      height: 1080,
      background: "#0f0f1a",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Scene 1: The Funnel (0-170) */}
      {frame < 170 && <FunnelScene frame={frame} fps={fps} />}

      {/* Scene 2: Ranking Signals (170-370) */}
      {frame >= 155 && frame < 380 && <SignalsScene frame={frame} fps={fps} />}

      {/* Scene 3: The Results (370-540) */}
      {frame >= 360 && <ResultsScene frame={frame} fps={fps} />}
    </div>
  );
};

export default Generated_GoogleSearchRanking;
