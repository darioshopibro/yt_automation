import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Globe,
  User,
  Lightning,
  FileHtml,
  FileCss,
  FileJs,
  Image,
  Database,
  Cloud,
  Buildings,
  Television,
  FilePdf,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";

// ─── SCENE BOUNDARIES ───────────────────────────────────────
const SCENE_1_END = 420; // The Distance Problem
const SCENE_2_START = 380; // CDN Solution (overlap for crossfade)
const SCENE_2_END = 810;
const SCENE_3_START = 770; // Netflix Extreme
const SCENE_3_END = 1200;

// ─── HELPERS ─────────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

const slideUp = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [25, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: Easing.in(Easing.quad) });

const colors = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  purple: "#a855f7",
  red: "#ef4444",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
};

// ─── SCENE 1: THE DISTANCE PROBLEM ──────────────────────────
const Scene1: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Virginia server appears (frame 0)
  const serverOp = fadeIn(frame, 0, 20);
  const serverSlide = slideUp(frame, 0, 20);

  // Tokyo user appears (frame 60)
  const userOp = fadeIn(frame, 60, 20);
  const userSlide = slideUp(frame, 60, 20);

  // Cable appears (frame 90)
  const cableOp = fadeIn(frame, 90, 25);
  const cableWidth = interpolate(frame, [90, 130], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });

  // "11,000 km" label (frame 120)
  const distLabelOp = fadeIn(frame, 120, 15);

  // Data packet dot travels (frame 150-240)
  const packetOp = interpolate(frame, [150, 160, 235, 245], [0, 1, 1, 0], clamp);
  const packetX = interpolate(frame, [155, 240], [0, 100], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // Latency counter (frame 170-280)
  const latencyMs = Math.round(
    interpolate(frame, [170, 270], [0, 250], { ...clamp, easing: Easing.out(Easing.cubic) })
  );
  const latencyOp = fadeIn(frame, 170, 15);

  // "150ms speed of light" label (frame 210)
  const lightLabelOp = fadeIn(frame, 210, 15);

  // "250ms with routing hops" (frame 270)
  const hopsLabelOp = fadeIn(frame, 270, 15);

  // Asset icons appear (frame 360-400)
  const assets = [
    { icon: FileHtml, label: "HTML", color: colors.orange },
    { icon: FileCss, label: "CSS", color: colors.blue },
    { icon: FileJs, label: "JS", color: colors.amber },
    { icon: Image, label: "Images", color: colors.green },
  ];

  const assetsLabelOp = fadeIn(frame, 340, 15);

  // Scene 1 fade out
  const sceneOp = frame > SCENE_1_END - 40 ? fadeOut(frame, SCENE_1_END - 40, 40) : 1;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneOp, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 50 }}>
      {/* Title */}
      <div style={{ opacity: fadeIn(frame, 30, 20), transform: `translateY(${slideUp(frame, 30, 20)}px)`, fontSize: 28, fontWeight: 700, color: "#e2e8f0", letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'SF Mono', monospace" }}>
        The Distance Problem
      </div>

      {/* Server ←——→ User */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, width: 1400, justifyContent: "space-between", position: "relative" }}>
        {/* Virginia Server */}
        <div style={{ opacity: serverOp, transform: `translateY(${serverSlide}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 160 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${colors.blue}25, ${colors.blue}08)`, border: `1.5px solid ${colors.blue}40`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 25px ${colors.blue}20` }}>
            <Database size={40} color={colors.blue} weight="duotone" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>Origin Server</div>
          <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'SF Mono', monospace" }}>Virginia, USA</div>
        </div>

        {/* Cable + Packet */}
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 30, marginRight: 30 }}>
          {/* Cable line */}
          <div style={{ width: `${cableWidth}%`, height: 3, background: `linear-gradient(90deg, ${colors.blue}60, ${colors.cyan}60)`, borderRadius: 2, opacity: cableOp, position: "relative" }}>
            {/* Traveling packet dot */}
            <div style={{
              position: "absolute", top: -8, left: `${packetX}%`, transform: "translateX(-50%)",
              width: 20, height: 20, borderRadius: "50%",
              background: colors.cyan,
              boxShadow: `0 0 20px ${colors.cyan}80, 0 0 40px ${colors.cyan}40`,
              opacity: packetOp,
            }} />
          </div>

          {/* Distance label */}
          <div style={{ opacity: distLabelOp, marginTop: 16, fontSize: 14, color: "#64748b", fontFamily: "'SF Mono', monospace", display: "flex", alignItems: "center", gap: 8 }}>
            <span>11,000 km</span>
            <span style={{ color: "#4a4a5e" }}>•</span>
            <span>undersea fiber optic</span>
          </div>
        </div>

        {/* Tokyo User */}
        <div style={{ opacity: userOp, transform: `translateY(${userSlide}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 160 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${colors.green}25, ${colors.green}08)`, border: `1.5px solid ${colors.green}40`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 25px ${colors.green}20` }}>
            <User size={40} color={colors.green} weight="duotone" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>User</div>
          <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'SF Mono', monospace" }}>Tokyo, Japan</div>
        </div>
      </div>

      {/* Latency Counter */}
      <div style={{ opacity: latencyOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 64, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: frame >= 250 ? colors.red : colors.amber, letterSpacing: -2, textShadow: `0 0 30px ${frame >= 250 ? colors.red : colors.amber}30` }}>
          {latencyMs}ms
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#64748b" }}>
          <span style={{ opacity: lightLabelOp, color: "#94a3b8" }}>
            <Lightning size={14} color={colors.amber} weight="fill" style={{ verticalAlign: "middle", marginRight: 4 }} />
            150ms speed of light
          </span>
          <span style={{ opacity: hopsLabelOp, color: "#94a3b8" }}>
            + routing hops = 250ms round trip
          </span>
        </div>
      </div>

      {/* Asset multiplier */}
      <div style={{ opacity: assetsLabelOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Now multiply by every asset:</div>
        <div style={{ display: "flex", gap: 20 }}>
          {assets.map((asset, i) => {
            const assetOp = fadeIn(frame, 360 + i * 10, 12);
            const assetScale = spring({ frame: Math.max(0, frame - (360 + i * 10)), fps, config: { damping: 22, stiffness: 200 } });
            const Icon = asset.icon;
            return (
              <div key={asset.label} style={{ opacity: assetOp, transform: `scale(${assetScale})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: `${asset.color}10`, border: `1px solid ${asset.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={24} color={asset.color} weight="duotone" />
                </div>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'SF Mono', monospace" }}>{asset.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── SCENE 2: CDN SOLUTION ──────────────────────────────────
const Scene2: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE_2_START;
  if (localFrame < 0) return null;

  const sceneOp = interpolate(localFrame, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const sceneOut = frame > SCENE_2_END - 40 ? fadeOut(frame, SCENE_2_END - 40, 40) : 1;

  // Title (frame 0 local)
  const titleOp = fadeIn(localFrame, 10, 20);
  const titleSlide = slideUp(localFrame, 10, 20);

  // "300+ edge locations" subtitle
  const subtitleOp = fadeIn(localFrame, 40, 15);

  // Edge nodes appear in a arc/semicircle around origin
  const edgeLocations = [
    { label: "Tokyo", angle: -20, distance: 380, color: colors.green },
    { label: "London", angle: -60, distance: 340, color: colors.blue },
    { label: "São Paulo", angle: 40, distance: 360, color: colors.amber },
    { label: "Sydney", angle: 10, distance: 350, color: colors.cyan },
    { label: "Mumbai", angle: -40, distance: 320, color: colors.purple },
  ];

  // First request animation: Virginia → Tokyo (local frame 90-160)
  const firstReqOp = interpolate(localFrame, [90, 100, 155, 165], [0, 1, 1, 0], clamp);
  const firstReqX = interpolate(localFrame, [100, 160], [0, 380], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // "250ms" for first request
  const firstLatencyOp = fadeIn(localFrame, 160, 12);

  // "CACHED" stamp on Tokyo edge (local frame 180)
  const cachedScale = spring({ frame: Math.max(0, localFrame - 180), fps, config: { damping: 18, stiffness: 180 } });
  const cachedOp = fadeIn(localFrame, 180, 10);

  // Second request: short distance (local frame 220-250)
  const secondReqOp = interpolate(localFrame, [220, 228, 245, 255], [0, 1, 1, 0], clamp);
  const secondReqX = interpolate(localFrame, [228, 248], [0, 60], { ...clamp, easing: Easing.out(Easing.cubic) });

  // "5ms" counter
  const secondLatencyOp = fadeIn(localFrame, 250, 12);

  // Traffic split bar (local frame 300)
  const splitOp = fadeIn(localFrame, 300, 20);
  const splitProgress = interpolate(localFrame, [310, 370], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneOp * sceneOut, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleSlide}px)`, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.cyan, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'SF Mono', monospace" }}>
          CDN — Content Delivery Network
        </div>
        <div style={{ opacity: subtitleOp, fontSize: 15, color: "#94a3b8", marginTop: 8 }}>
          Caching content at 300+ edge locations worldwide
        </div>
      </div>

      {/* Network visualization */}
      <div style={{ position: "relative", width: 900, height: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Origin server (center-left) */}
        <div style={{ position: "absolute", left: 60, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 70, height: 70, borderRadius: 18, background: `linear-gradient(135deg, ${colors.blue}25, ${colors.blue}08)`, border: `1.5px solid ${colors.blue}40`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${colors.blue}20` }}>
            <Database size={34} color={colors.blue} weight="duotone" />
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'SF Mono', monospace" }}>Origin</span>
        </div>

        {/* Edge nodes */}
        {edgeLocations.map((loc, i) => {
          const nodeStart = 60 + i * 12;
          const nodeOp = fadeIn(localFrame, nodeStart, 15);
          const nodeScale = spring({ frame: Math.max(0, localFrame - nodeStart), fps, config: { damping: 22, stiffness: 200 } });

          const rad = (loc.angle * Math.PI) / 180;
          const x = 450 + Math.cos(rad) * loc.distance;
          const y = 200 + Math.sin(rad) * loc.distance * 0.5;

          return (
            <div key={loc.label} style={{
              position: "absolute", left: x - 30, top: y - 30,
              opacity: nodeOp, transform: `scale(${nodeScale})`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${loc.color}12`, border: `1px solid ${loc.color}30`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 15px ${loc.color}15` }}>
                <Cloud size={26} color={loc.color} weight="duotone" />
              </div>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'SF Mono', monospace", whiteSpace: "nowrap" }}>{loc.label}</span>

              {/* CACHED badge on Tokyo */}
              {loc.label === "Tokyo" && localFrame > 180 && (
                <div style={{
                  opacity: cachedOp, transform: `scale(${cachedScale})`,
                  position: "absolute", top: -14, right: -20,
                  background: colors.green, color: "#0f0f1a",
                  fontSize: 9, fontWeight: 800, fontFamily: "'SF Mono', monospace",
                  padding: "2px 6px", borderRadius: 4, letterSpacing: 1,
                }}>
                  CACHED
                </div>
              )}
            </div>
          );
        })}

        {/* First request packet (origin → tokyo edge) */}
        <div style={{
          position: "absolute", left: 130 + firstReqX, top: "50%",
          transform: "translate(-50%, -50%)", opacity: firstReqOp,
          width: 14, height: 14, borderRadius: "50%",
          background: colors.amber,
          boxShadow: `0 0 18px ${colors.amber}80`,
        }} />

        {/* Second request packet (user → tokyo edge, short) */}
        {localFrame > 218 && (
          <div style={{
            position: "absolute", right: 80 - secondReqX, top: 120,
            transform: "translate(50%, -50%)", opacity: secondReqOp,
            width: 14, height: 14, borderRadius: "50%",
            background: colors.green,
            boxShadow: `0 0 18px ${colors.green}80`,
          }} />
        )}

        {/* Second user icon near Tokyo edge */}
        {localFrame > 210 && (
          <div style={{
            position: "absolute", right: 30, top: 95,
            opacity: fadeIn(localFrame, 210, 12),
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <User size={28} color={colors.green} weight="duotone" />
            <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'SF Mono', monospace" }}>User 2</span>
          </div>
        )}
      </div>

      {/* Latency comparison */}
      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        {/* First request */}
        <div style={{ opacity: firstLatencyOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>1st request (uncached)</div>
          <div style={{ fontSize: 42, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: colors.amber, textShadow: `0 0 20px ${colors.amber}25` }}>
            250ms
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Virginia → Tokyo</div>
        </div>

        {/* Divider */}
        <div style={{ opacity: secondLatencyOp, width: 1, height: 80, background: "#1a1a2e", marginTop: 10 }} />

        {/* Second request */}
        <div style={{ opacity: secondLatencyOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>2nd request (cached)</div>
          <div style={{ fontSize: 42, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: colors.green, textShadow: `0 0 20px ${colors.green}25` }}>
            5ms
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>50km from edge</div>
        </div>
      </div>

      {/* Traffic split bar */}
      <div style={{ opacity: splitOp, width: 700, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontFamily: "'SF Mono', monospace" }}>
          <span style={{ color: colors.cyan }}>CDN Edge — 90%</span>
          <span style={{ color: "#64748b" }}>Origin — 10%</span>
        </div>
        <div style={{ width: "100%", height: 12, borderRadius: 6, background: "#1a1a2e", overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${90 * splitProgress}%`, height: "100%", background: `linear-gradient(90deg, ${colors.cyan}, ${colors.blue})`, borderRadius: 6, transition: "none" }} />
          <div style={{ width: `${10 * splitProgress}%`, height: "100%", background: `${colors.blue}30`, marginLeft: 2 }} />
        </div>
      </div>
    </div>
  );
};

// ─── SCENE 3: NETFLIX EXTREME ───────────────────────────────
const Scene3: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE_3_START;
  if (localFrame < 0) return null;

  const sceneOp = interpolate(localFrame, [0, 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Title
  const titleOp = fadeIn(localFrame, 10, 20);
  const titleSlide = slideUp(localFrame, 10, 20);

  // ISP Building appears (frame 40)
  const buildingOp = fadeIn(localFrame, 40, 25);
  const buildingSlide = slideUp(localFrame, 40, 25);

  // Netflix server slides INTO the building (frame 90)
  const serverSlideIn = interpolate(localFrame, [90, 130], [200, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const serverOp = fadeIn(localFrame, 90, 15);

  // "Open Connect Appliance" label (frame 130)
  const ocaLabelOp = fadeIn(localFrame, 135, 15);

  // User nearby (frame 160)
  const nearUserOp = fadeIn(localFrame, 160, 15);
  const nearUserSlide = slideUp(localFrame, 160, 15);

  // Ultra-low latency badge (frame 200)
  const latencyScale = spring({ frame: Math.max(0, localFrame - 200), fps, config: { damping: 20, stiffness: 180 } });
  const latencyOp = fadeIn(localFrame, 200, 10);

  // Contrast section (frame 260)
  const contrastOp = fadeIn(localFrame, 260, 20);

  // 4K streaming check (frame 290)
  const streamOp = fadeIn(localFrame, 290, 15);

  // VPN struggles X (frame 320)
  const vpnOp = fadeIn(localFrame, 320, 15);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sceneOp, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 44 }}>
      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleSlide}px)`, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.red, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'SF Mono', monospace" }}>
          Netflix — The Extreme
        </div>
        <div style={{ opacity: fadeIn(localFrame, 40, 15), fontSize: 15, color: "#94a3b8", marginTop: 8 }}>
          Open Connect Appliances embedded directly inside ISPs
        </div>
      </div>

      {/* ISP Building + Netflix Server */}
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        {/* ISP Building */}
        <div style={{
          opacity: buildingOp, transform: `translateY(${buildingSlide}px)`,
          width: 360, height: 260, borderRadius: 16,
          background: "#12121f",
          border: "1.5px solid #2a2a3e",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "20px 24px", position: "relative", overflow: "hidden",
        }}>
          {/* Building header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Buildings size={28} color="#94a3b8" weight="duotone" />
            <span style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>ISP Building</span>
          </div>

          <div style={{ width: "100%", height: 1, background: "#1a1a2e", marginBottom: 16 }} />

          {/* ISP equipment (background) */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16, opacity: 0.5 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ width: 60, height: 40, borderRadius: 8, background: "#1a1a2e", border: "1px solid #2a2a3e" }} />
            ))}
          </div>

          {/* Netflix OCA Server sliding in */}
          <div style={{
            opacity: serverOp,
            transform: `translateX(${serverSlideIn}px)`,
            width: 280, padding: "14px 20px", borderRadius: 12,
            background: `linear-gradient(135deg, ${colors.red}18, ${colors.red}05)`,
            border: `1.5px solid ${colors.red}35`,
            boxShadow: `0 0 30px ${colors.red}15`,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <Television size={32} color={colors.red} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${colors.red}60)` }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.red }}>Netflix OCA</div>
              <div style={{ fontSize: 11, color: "#94a3b8", opacity: ocaLabelOp }}>Open Connect Appliance</div>
            </div>
          </div>
        </div>

        {/* Arrow / connection (short distance) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 3, background: `linear-gradient(90deg, ${colors.red}60, ${colors.green}60)`, borderRadius: 2, opacity: fadeIn(localFrame, 170, 15) }} />
          <div style={{ opacity: fadeIn(localFrame, 175, 10), fontSize: 11, color: "#64748b", fontFamily: "'SF Mono', monospace" }}>
            ~0 km
          </div>
        </div>

        {/* User */}
        <div style={{ opacity: nearUserOp, transform: `translateY(${nearUserSlide}px)`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 70, height: 70, borderRadius: 18, background: `linear-gradient(135deg, ${colors.green}25, ${colors.green}08)`, border: `1.5px solid ${colors.green}40`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${colors.green}20` }}>
            <User size={34} color={colors.green} weight="duotone" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>You</span>
        </div>
      </div>

      {/* Latency badge */}
      <div style={{
        opacity: latencyOp, transform: `scale(${latencyScale})`,
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 32px", borderRadius: 12,
        background: `${colors.green}10`, border: `1px solid ${colors.green}25`,
      }}>
        <Lightning size={24} color={colors.green} weight="fill" />
        <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "'SF Mono', monospace", color: colors.green, textShadow: `0 0 25px ${colors.green}30` }}>
          {"<"} 5ms
        </span>
        <span style={{ fontSize: 15, color: "#94a3b8", marginLeft: 8 }}>latency</span>
      </div>

      {/* Contrast: Netflix vs VPN */}
      <div style={{ opacity: contrastOp, display: "flex", gap: 60, alignItems: "flex-start" }}>
        {/* Netflix 4K */}
        <div style={{ opacity: streamOp, display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", borderRadius: 12, background: `${colors.green}08`, border: `1px solid ${colors.green}20` }}>
          <CheckCircle size={28} color={colors.green} weight="duotone" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.green }}>Netflix 4K</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Streams without buffering</div>
          </div>
        </div>

        {/* VPN PDF */}
        <div style={{ opacity: vpnOp, display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", borderRadius: 12, background: `${colors.red}08`, border: `1px solid ${colors.red}20` }}>
          <XCircle size={28} color={colors.red} weight="duotone" />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.red }}>Corporate VPN</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Struggles with a PDF</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────
const Generated_CDNLatency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
      <Scene1 frame={frame} fps={fps} />
      <Scene2 frame={frame} fps={fps} />
      <Scene3 frame={frame} fps={fps} />
    </div>
  );
};

export default Generated_CDNLatency;
