import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import * as PhosphorIcons from "@phosphor-icons/react";
import { Cube } from "@phosphor-icons/react";

const getIcon = (name: string): React.FC<any> => {
  const I = (PhosphorIcons as Record<string, unknown>)[name];
  return (I && typeof I === "function" ? I : Cube) as React.FC<any>;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const c = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
};

// ── Services that the API fans out to ──
const services = [
  { label: "Playback Service", sub: "Find video files", icon: "PlayCircle", color: c.blue },
  { label: "Personalization", sub: "Thumbnail + row position", icon: "UserFocus", color: c.purple },
  { label: "AB Testing", sub: "Active experiments", icon: "FlaskRound", color: c.amber },
  { label: "Billing Service", sub: "Verify subscription", icon: "CreditCard", color: c.green },
  { label: "Device Service", sub: "Resolution + bandwidth", icon: "DeviceMobile", color: c.cyan },
];

// ── Scene boundaries ──
const SCENE1_END = 130;   // Entry: click → gateway → API
const SCENE2_START = 110;
const SCENE2_END = 300;   // Fan-out: parallel service race
const SCENE3_START = 280;
// SCENE3 goes to end (~420)

const Generated_NetflixPlayClick: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene opacities (crossfade) ──
  const scene1Op = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp)
    * interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Op = interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

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
      {/* ════════════ SCENE 1: Click → Edge Gateway → API ════════════ */}
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
            gap: 0,
            opacity: scene1Op,
          }}
        >
          <Scene1_Entry frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Fan-out to 5 services ════════════ */}
      {frame >= SCENE2_START && frame < SCENE2_END && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: scene2Op,
          }}
        >
          <Scene2_Fanout frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: Convergence + Fallback ════════════ */}
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
          <Scene3_Converge frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Play Button → Edge Gateway → API Service
// ═══════════════════════════════════════════════════════════
const Scene1_Entry: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const PlayIcon = getIcon("Play");
  const GlobeIcon = getIcon("Globe");
  const TreeStructureIcon = getIcon("TreeStructure");

  // Play button
  const btnScale = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const btnGlow = interpolate(frame, [15, 30], [0, 40], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Click pulse at frame 20
  const pulseScale = interpolate(frame, [20, 35], [1, 2.5], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pulseOp = interpolate(frame, [20, 35], [0.6, 0], clamp);

  // Edge Gateway appears at frame 40
  const gwOp = interpolate(frame, [40, 55], [0, 1], clamp);
  const gwX = interpolate(frame, [40, 55], [40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Pulse traveling from button to gateway
  const travelProgress = interpolate(frame, [30, 50], [0, 1], clamp);
  const travelOp = interpolate(frame, [30, 35], [0, 0.8], clamp) * interpolate(frame, [45, 50], [1, 0], clamp);

  // API Service appears at frame 70
  const apiOp = interpolate(frame, [70, 85], [0, 1], clamp);
  const apiX = interpolate(frame, [70, 85], [40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // "200M requests/day" stat
  const statOp = interpolate(frame, [58, 70], [0, 1], clamp);

  // "fans out" text
  const fansOutOp = interpolate(frame, [90, 105], [0, 1], clamp);
  const fansOutY = interpolate(frame, [90, 105], [10, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
      {/* Play Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div
          style={{
            position: "relative",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Pulse ring */}
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `2px solid ${c.red}`,
              transform: `scale(${pulseScale})`,
              opacity: pulseOp,
            }}
          />
          {/* Button circle */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${c.red}30, ${c.red}10)`,
              border: `2px solid ${c.red}50`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${btnScale})`,
              boxShadow: `0 0 ${btnGlow}px ${c.red}40`,
            }}
          >
            <PlayIcon size={48} color={c.red} weight="fill" />
          </div>
        </div>
        <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>Play Click</span>
      </div>

      {/* Traveling pulse */}
      <div
        style={{
          width: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ width: "100%", height: 2, background: `${c.blue}20` }} />
        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: c.blue,
            boxShadow: `0 0 12px ${c.blue}80`,
            left: `${travelProgress * 100}%`,
            opacity: travelOp,
            transform: "translateX(-50%)",
          }}
        />
      </div>

      {/* Edge Gateway */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: gwOp,
          transform: `translateX(${gwX}px)`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${c.blue}20, ${c.blue}08)`,
            border: `1.5px solid ${c.blue}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 15px ${c.blue}15`,
          }}
        >
          <GlobeIcon size={40} color={c.blue} weight="duotone" />
        </div>
        <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>Edge Gateway</span>
        <span
          style={{
            color: c.blue,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'SF Mono', monospace",
            opacity: statOp,
          }}
        >
          200M req/day
        </span>
      </div>

      {/* Arrow to API */}
      <div style={{ width: 80, height: 2, background: `${c.blue}20`, opacity: apiOp }} />

      {/* API Service */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          opacity: apiOp,
          transform: `translateX(${apiX}px)`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${c.orange}20, ${c.orange}08)`,
            border: `1.5px solid ${c.orange}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 15px ${c.orange}15`,
          }}
        >
          <TreeStructureIcon size={40} color={c.orange} weight="duotone" />
        </div>
        <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>API Service</span>
        <span
          style={{
            color: c.amber,
            fontSize: 13,
            fontWeight: 500,
            opacity: fansOutOp,
            transform: `translateY(${fansOutY}px)`,
          }}
        >
          fans out to 5 services...
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Parallel Fan-out — 5 services racing
// ═══════════════════════════════════════════════════════════
const Scene2_Fanout: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE2_START;

  // Title
  const titleOp = interpolate(localFrame, [0, 20], [0, 1], clamp);
  const titleY = interpolate(localFrame, [0, 20], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Timer (100ms countdown visual)
  const timerStart = 60; // local frame when bars start filling
  const timerEnd = 130;  // local frame when all complete
  const timerMs = Math.round(interpolate(localFrame, [timerStart, timerEnd], [0, 100], clamp));
  const timerOp = interpolate(localFrame, [timerStart - 10, timerStart], [0, 1], clamp);
  const timerColor = timerMs >= 100 ? c.green : timerMs > 70 ? c.amber : c.blue;

  // "All return within 100ms" text
  const allReturnOp = interpolate(localFrame, [timerEnd, timerEnd + 15], [0, 1], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <span style={{ color: "#e2e8f0", fontSize: 24, fontWeight: 700 }}>
          API Service — Parallel Fan-out
        </span>

        {/* Timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: timerOp,
          }}
        >
          <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>Response time</span>
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              background: `${timerColor}12`,
              border: `1px solid ${timerColor}30`,
              boxShadow: timerMs >= 100 ? `0 0 20px ${c.green}30` : "none",
            }}
          >
            <span
              style={{
                color: timerColor,
                fontSize: 28,
                fontWeight: 700,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: -1,
              }}
            >
              {timerMs}ms
            </span>
          </div>
        </div>
      </div>

      {/* Service bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {services.map((svc, i) => {
          const barDelay = 30 + i * 8;
          const Icon = getIcon(svc.icon);

          // Row entrance
          const rowOp = interpolate(localFrame, [barDelay, barDelay + 15], [0, 1], clamp);
          const rowX = interpolate(localFrame, [barDelay, barDelay + 15], [30, 0], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });

          // Bar fill — all start ~same time, slightly staggered end
          const fillStart = timerStart + i * 3;
          const fillEnd = timerEnd - 10 + i * 4;
          const fillProgress = interpolate(localFrame, [fillStart, fillEnd], [0, 1], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          });

          // Checkmark when done
          const CheckIcon = getIcon("CheckCircle");
          const checkOp = interpolate(localFrame, [fillEnd, fillEnd + 10], [0, 1], clamp);
          const checkScale = spring({
            frame: Math.max(0, localFrame - fillEnd),
            fps,
            config: { damping: 22, stiffness: 200 },
          });

          return (
            <div
              key={svc.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: rowOp,
                transform: `translateX(${rowX}px)`,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${svc.color}20, ${svc.color}08)`,
                  border: `1.5px solid ${svc.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 12px ${svc.color}15`,
                  flexShrink: 0,
                }}
              >
                <Icon size={26} color={svc.color} weight="duotone" />
              </div>

              {/* Label */}
              <div style={{ width: 180, flexShrink: 0 }}>
                <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>{svc.label}</div>
                <div style={{ color: "#64748b", fontSize: 12, fontWeight: 400 }}>{svc.sub}</div>
              </div>

              {/* Progress bar track */}
              <div
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 10,
                  background: "#1a1a2e",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Fill */}
                <div
                  style={{
                    width: `${fillProgress * 100}%`,
                    height: "100%",
                    borderRadius: 10,
                    background: `linear-gradient(90deg, ${svc.color}40, ${svc.color}80)`,
                    boxShadow: fillProgress > 0.5 ? `0 0 15px ${svc.color}30` : "none",
                  }}
                />
                {/* Shimmer on active bar */}
                {fillProgress > 0 && fillProgress < 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${fillProgress * 100 - 15}%`,
                      width: "15%",
                      height: "100%",
                      background: `linear-gradient(90deg, transparent, ${svc.color}20, transparent)`,
                    }}
                  />
                )}
              </div>

              {/* Checkmark */}
              <div
                style={{
                  width: 36,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: checkOp,
                  transform: `scale(${checkScale})`,
                }}
              >
                <CheckIcon size={28} color={c.green} weight="fill" />
              </div>
            </div>
          );
        })}
      </div>

      {/* "All return within 100ms" */}
      <div
        style={{
          textAlign: "center",
          opacity: allReturnOp,
          marginTop: 8,
        }}
      >
        <span
          style={{
            color: c.green,
            fontSize: 18,
            fontWeight: 600,
            textShadow: `0 0 20px ${c.green}30`,
          }}
        >
          All 5 services respond within 100ms
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Convergence — Stitch + Unified Response + Fallback
// ═══════════════════════════════════════════════════════════
const Scene3_Converge: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE3_START;
  const MergeIcon = getIcon("GitMerge");
  const PaperIcon = getIcon("FileText");
  const ShieldIcon = getIcon("ShieldCheck");
  const PlayIcon = getIcon("Play");

  // "API stitches responses" title
  const titleOp = interpolate(localFrame, [0, 20], [0, 1], clamp);
  const titleY = interpolate(localFrame, [0, 20], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // 5 small dots converging into center
  const dotsProgress = interpolate(localFrame, [15, 50], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Merge icon pop
  const mergeScale = spring({
    frame: Math.max(0, localFrame - 45),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const mergeOp = interpolate(localFrame, [45, 55], [0, 1], clamp);

  // Unified response card
  const cardOp = interpolate(localFrame, [65, 80], [0, 1], clamp);
  const cardY = interpolate(localFrame, [65, 80], [25, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const cardGlow = interpolate(localFrame, [80, 100], [0, 25], clamp);

  // Fallback message
  const fbOp = interpolate(localFrame, [100, 115], [0, 1], clamp);
  const fbY = interpolate(localFrame, [100, 115], [10, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Dot positions (radial, converging to center)
  const dotAngles = [-60, -30, 0, 30, 60];
  const dotRadius = interpolate(dotsProgress, [0, 1], [220, 0], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Title */}
      <span
        style={{
          color: "#e2e8f0",
          fontSize: 24,
          fontWeight: 700,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        API Stitches Responses Together
      </span>

      {/* Convergence area */}
      <div style={{ position: "relative", width: 500, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Converging dots */}
        {services.map((svc, i) => {
          const angle = (dotAngles[i] * Math.PI) / 180;
          const x = Math.cos(angle) * dotRadius;
          const y = Math.sin(angle) * dotRadius * 0.6;
          const dotOp = interpolate(dotsProgress, [0, 0.8], [1, 0.3], clamp);
          return (
            <div
              key={svc.label}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: svc.color,
                boxShadow: `0 0 10px ${svc.color}60`,
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: dotOp,
              }}
            />
          );
        })}

        {/* Merge icon in center */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${c.orange}20, ${c.orange}08)`,
            border: `1.5px solid ${c.orange}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 20px ${c.orange}20`,
            transform: `scale(${mergeScale})`,
            opacity: mergeOp,
          }}
        >
          <MergeIcon size={36} color={c.orange} weight="duotone" />
        </div>
      </div>

      {/* Unified Response Card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "24px 40px",
          borderRadius: 12,
          background: `${c.green}08`,
          border: `1px solid ${c.green}20`,
          boxShadow: `0 0 ${cardGlow}px ${c.green}20`,
          opacity: cardOp,
          transform: `translateY(${cardY}px)`,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${c.green}20, ${c.green}08)`,
            border: `1.5px solid ${c.green}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PaperIcon size={28} color={c.green} weight="duotone" />
        </div>
        <div>
          <div style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700 }}>One Unified Response</div>
          <div style={{ color: "#94a3b8", fontSize: 14, fontWeight: 400 }}>
            Video files + thumbnails + experiments + subscription + device profile
          </div>
        </div>
        <div style={{ marginLeft: 20 }}>
          <PlayIcon size={36} color={c.green} weight="fill" style={{ filter: `drop-shadow(0 0 8px ${c.green}60)` }} />
        </div>
      </div>

      {/* Fallback */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 32px",
          borderRadius: 10,
          background: `${c.amber}06`,
          border: `1px solid ${c.amber}15`,
          opacity: fbOp,
          transform: `translateY(${fbY}px)`,
        }}
      >
        <ShieldIcon size={24} color={c.amber} weight="duotone" />
        <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500 }}>
          If any service fails — fallback kicks in. You still get a play button, just without personalized thumbnails.
        </span>
      </div>
    </div>
  );
};

export default Generated_NetflixPlayClick;
