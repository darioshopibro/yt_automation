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

// ── Key timestamps (global frames at 30fps) ──
const CHAIN_START = 1890;       // segment start
const RECURSIVE = 1926;         // "recursive"
const CHAIN = 2030;             // "chain"
const QUESTIONS = 2042;         // "questions"
const ROOT_NS = 2123;           // "root" nameserver
const THIRTEEN = 2185;          // "13"
const CLUSTERS = 2225;          // "clusters"
const WORLD = 2266;             // "world"
const ROOT_SERVER = 2303;       // "root server"
const GOOGLE_IP = 2333;         // "google.com's" IP
const DOT_COM_ZONE = 2439;     // "dot-com" zone
const REFERRAL_1 = 2507;       // first "referral"
const TLD_NS = 2529;           // "TLD" nameserver
const TLD_HANDLES = 2633;      // "handles"
const DOT_COM_DOMAINS = 2657;  // "dot-com domains"
const GOOGLE_EXACT = 2743;     // "google.com's exact"
const AUTHORITATIVE = 2864;    // "authoritative"
const AUTH_NS = 2885;          // "nameserver" (auth)
const GOOGLE_USES = 2902;      // "Google uses"
const REFERRAL_2 = 2983;       // second "referral"

// ── Scene boundaries (global frames) ──
const SCENE1_END = 2400;
const SCENE2_START = 2380;
const SCENE2_END = 2750;
const SCENE3_START = 2730;
// Scene 3 goes to 3000

// ── Shared server node component ──
const ServerNode: React.FC<{
  frame: number;
  fps: number;
  appearFrame: number;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  size?: number;
  glowFrame?: number;
  shakeFrame?: number;
}> = ({ frame, fps, appearFrame, icon, label, sublabel, color, size = 100, glowFrame, shakeFrame }) => {
  const Icon = getIcon(icon);

  const opacity = interpolate(frame, [appearFrame, appearFrame + 15], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const slideY = interpolate(frame, [appearFrame, appearFrame + 15], [25, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const scale = spring({
    frame: Math.max(0, frame - appearFrame),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Glow when active
  const glowAmount = glowFrame
    ? interpolate(frame, [glowFrame, glowFrame + 20], [0, 30], clamp)
    : 0;

  // Shake "don't know" — subtle horizontal shake
  let shakeX = 0;
  if (shakeFrame && frame >= shakeFrame && frame < shakeFrame + 18) {
    const t = frame - shakeFrame;
    shakeX = Math.sin(t * 1.8) * 6 * interpolate(t, [0, 18], [1, 0], clamp);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity,
        transform: `translateY(${slideY}px) translateX(${shakeX}px)`,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1.5px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: glowAmount > 0 ? `0 0 ${glowAmount}px ${color}40` : `0 0 12px ${color}15`,
          transform: `scale(${scale})`,
        }}
      >
        <Icon size={size * 0.4} color={color} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </div>
      <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600, textAlign: "center" }}>{label}</span>
      <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500, textAlign: "center" }}>{sublabel}</span>
    </div>
  );
};

// ── Query pulse traveling between two positions ──
const QueryPulse: React.FC<{
  frame: number;
  startFrame: number;
  endFrame: number;
  color: string;
  label?: string;
}> = ({ frame, startFrame, endFrame, color, label }) => {
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const opacity = interpolate(frame, [startFrame, startFrame + 5], [0, 1], clamp)
    * interpolate(frame, [endFrame - 5, endFrame], [1, 0], clamp);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        opacity,
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color,
            fontFamily: "'SF Mono', monospace",
            opacity: interpolate(progress, [0.2, 0.5], [0, 1], clamp),
          }}
        >
          {label}
        </span>
      )}
      <div
        style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: `${color}15`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `${progress * 80}%`,
            width: "20%",
            height: "100%",
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
            boxShadow: `0 0 10px ${color}60`,
          }}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Resolver starts the chain → Root Nameserver
// Frames ~1890–2400
// ═══════════════════════════════════════════════════════════
const Scene1_ResolverToRoot: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Title: "Chain of Questions"
  const titleOp = interpolate(frame, [CHAIN - 10, CHAIN + 10], [0, 1], clamp);
  const titleY = interpolate(frame, [CHAIN - 10, CHAIN + 10], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "?" marks appearing one by one
  const q1Op = interpolate(frame, [QUESTIONS, QUESTIONS + 10], [0, 0.6], clamp);
  const q2Op = interpolate(frame, [QUESTIONS + 8, QUESTIONS + 18], [0, 0.4], clamp);
  const q3Op = interpolate(frame, [QUESTIONS + 16, QUESTIONS + 26], [0, 0.3], clamp);

  // "13 root nameserver clusters" stat
  const statOp = interpolate(frame, [THIRTEEN, THIRTEEN + 15], [0, 1], clamp);
  const statY = interpolate(frame, [THIRTEEN, THIRTEEN + 15], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "in the entire world" — globe hint
  const globeOp = interpolate(frame, [WORLD - 15, WORLD], [0, 1], clamp);
  const globeScale = spring({
    frame: Math.max(0, frame - (WORLD - 15)),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Root server "doesn't know" shake at GOOGLE_IP
  // Referral badge
  const referralOp = interpolate(frame, [DOT_COM_ZONE, DOT_COM_ZONE + 15], [0, 1], clamp);
  const referralY = interpolate(frame, [DOT_COM_ZONE, DOT_COM_ZONE + 15], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Referral glow pulse
  const referralGlow = interpolate(frame, [REFERRAL_1 - 10, REFERRAL_1 + 10], [0, 25], clamp);

  const GlobeIcon = getIcon("GlobeHemisphereWest");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <span style={{ color: "#e2e8f0", fontSize: 26, fontWeight: 700 }}>Chain of Questions</span>
        <span style={{ color: `${c.amber}80`, fontSize: 28, fontWeight: 300, opacity: q1Op }}>?</span>
        <span style={{ color: `${c.orange}60`, fontSize: 24, fontWeight: 300, opacity: q2Op }}>?</span>
        <span style={{ color: `${c.red}40`, fontSize: 20, fontWeight: 300, opacity: q3Op }}>?</span>
      </div>

      {/* Server chain: Resolver → Root */}
      <div style={{ display: "flex", alignItems: "center", gap: 40, justifyContent: "center" }}>
        {/* Recursive Resolver */}
        <ServerNode
          frame={frame}
          fps={fps}
          appearFrame={RECURSIVE - 5}
          icon="MagnifyingGlass"
          label="Recursive Resolver"
          sublabel="Starts the chain"
          color={c.amber}
          size={90}
          glowFrame={CHAIN}
        />

        {/* Query traveling */}
        <QueryPulse
          frame={frame}
          startFrame={ROOT_NS - 20}
          endFrame={ROOT_NS}
          color={c.blue}
          label="Where is google.com?"
        />

        {/* Root Nameserver */}
        <ServerNode
          frame={frame}
          fps={fps}
          appearFrame={ROOT_NS - 5}
          icon="TreeStructure"
          label="Root Nameserver"
          sublabel="Top of DNS hierarchy"
          color={c.blue}
          size={100}
          glowFrame={ROOT_SERVER}
          shakeFrame={GOOGLE_IP}
        />
      </div>

      {/* 13 clusters stat + globe */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, justifyContent: "center" }}>
        {/* Globe hint */}
        <div
          style={{
            opacity: globeOp,
            transform: `scale(${globeScale})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${c.cyan}15, ${c.cyan}05)`,
              border: `1px solid ${c.cyan}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${c.cyan}15`,
            }}
          >
            <GlobeIcon size={32} color={c.cyan} weight="duotone" style={{ filter: `drop-shadow(0 0 6px ${c.cyan}50)` }} />
          </div>
        </div>

        {/* 13 clusters badge */}
        <div
          style={{
            opacity: statOp,
            transform: `translateY(${statY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 10,
            background: `${c.blue}08`,
            border: `1px solid ${c.blue}20`,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: c.blue,
              fontFamily: "'SF Mono', monospace",
              letterSpacing: -1,
              textShadow: `0 0 20px ${c.blue}40`,
            }}
          >
            13
          </span>
          <div>
            <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>Root Nameserver Clusters</div>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>In the entire world</div>
          </div>
        </div>
      </div>

      {/* Referral badge — "Knows who manages .com" */}
      <div
        style={{
          opacity: referralOp,
          transform: `translateY(${referralY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 28px",
          borderRadius: 10,
          background: `${c.green}08`,
          border: `1px solid ${c.green}20`,
          boxShadow: `0 0 ${referralGlow}px ${c.green}25`,
        }}
      >
        {React.createElement(getIcon("ArrowBendDownRight"), {
          size: 22,
          color: c.green,
          weight: "duotone",
        })}
        <div>
          <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>
            Referral: "I know who manages .com"
          </div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>
            Sends you to the TLD Nameserver
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: TLD Nameserver — handles .com domains
// Frames ~2380–2750
// ═══════════════════════════════════════════════════════════
const Scene2_TLDNameserver: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Title
  const titleOp = interpolate(frame, [TLD_NS - 10, TLD_NS + 10], [0, 1], clamp);
  const titleY = interpolate(frame, [TLD_NS - 10, TLD_NS + 10], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ".com" domain badges appearing
  const domains = [".com", ".net", ".org", ".io"];
  const domainsStart = TLD_HANDLES;

  // "Handles all .com domains" emphasis
  const handlesOp = interpolate(frame, [DOT_COM_DOMAINS - 10, DOT_COM_DOMAINS + 5], [0, 1], clamp);

  // "Doesn't know exact IP" shake
  // Then referral
  const referral2Op = interpolate(frame, [AUTH_NS - 30, AUTH_NS - 15], [0, 1], clamp);
  const referral2Y = interpolate(frame, [AUTH_NS - 30, AUTH_NS - 15], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "#e2e8f0", fontSize: 24, fontWeight: 700 }}>TLD Nameserver</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: c.green,
            fontFamily: "'SF Mono', monospace",
            padding: "4px 12px",
            borderRadius: 6,
            background: `${c.green}12`,
            border: `1px solid ${c.green}25`,
          }}
        >
          Top-Level Domain
        </span>
      </div>

      {/* Main server + domain zone */}
      <div style={{ display: "flex", alignItems: "center", gap: 60, justifyContent: "center" }}>
        {/* Query from resolver */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <ServerNode
            frame={frame}
            fps={fps}
            appearFrame={TLD_NS - 5}
            icon="MagnifyingGlass"
            label="Resolver"
            sublabel="Following the chain"
            color={c.amber}
            size={72}
          />
          <QueryPulse
            frame={frame}
            startFrame={TLD_NS + 15}
            endFrame={TLD_NS + 35}
            color={c.green}
            label="google.com?"
          />
        </div>

        {/* TLD Server */}
        <ServerNode
          frame={frame}
          fps={fps}
          appearFrame={TLD_NS}
          icon="Globe"
          label="TLD Nameserver"
          sublabel="Manages .com zone"
          color={c.green}
          size={110}
          glowFrame={TLD_HANDLES}
          shakeFrame={GOOGLE_EXACT}
        />

        {/* Domain zone badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: handlesOp }}>
          {domains.map((d, i) => {
            const dStart = domainsStart + i * 8;
            const dOp = interpolate(frame, [dStart, dStart + 12], [0, 1], clamp);
            const dX = interpolate(frame, [dStart, dStart + 12], [15, 0], {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            });
            const isActive = d === ".com";
            return (
              <div
                key={d}
                style={{
                  opacity: dOp,
                  transform: `translateX(${dX}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: isActive ? `${c.green}12` : `${c.green}06`,
                  border: `1px solid ${isActive ? `${c.green}30` : `${c.green}12`}`,
                  boxShadow: isActive ? `0 0 15px ${c.green}20` : "none",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isActive ? c.green : `${c.green}50`,
                    boxShadow: isActive ? `0 0 8px ${c.green}60` : "none",
                  }}
                />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#e2e8f0" : "#94a3b8",
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {d}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TLD doesn't know exact IP — referral to authoritative */}
      <div
        style={{
          opacity: referral2Op,
          transform: `translateY(${referral2Y}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 28px",
          borderRadius: 10,
          background: `${c.purple}08`,
          border: `1px solid ${c.purple}20`,
          boxShadow: `0 0 15px ${c.purple}15`,
        }}
      >
        {React.createElement(getIcon("ArrowBendDownRight"), {
          size: 22,
          color: c.purple,
          weight: "duotone",
        })}
        <div>
          <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>
            Referral: "I know Google's nameserver"
          </div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>
            Sends you to the Authoritative Nameserver
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Authoritative Nameserver — final answer
// Frames ~2730–3000
// ═══════════════════════════════════════════════════════════
const Scene3_Authoritative: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Title
  const titleOp = interpolate(frame, [AUTHORITATIVE - 10, AUTHORITATIVE + 10], [0, 1], clamp);
  const titleY = interpolate(frame, [AUTHORITATIVE - 10, AUTHORITATIVE + 10], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Full chain recap — 3 small nodes showing the journey
  const chainRecapOp = interpolate(frame, [SCENE3_START + 10, SCENE3_START + 30], [0, 1], clamp);

  // The 3 hops
  const hops = [
    { label: "Root", color: c.blue, icon: "TreeStructure" },
    { label: "TLD", color: c.green, icon: "Globe" },
    { label: "Authoritative", color: c.purple, icon: "ShieldCheck" },
  ];

  // Authoritative server appears
  // "Google uses" emphasis
  const googleOp = interpolate(frame, [GOOGLE_USES, GOOGLE_USES + 12], [0, 1], clamp);
  const googleY = interpolate(frame, [GOOGLE_USES, GOOGLE_USES + 12], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Final referral sent
  const finalOp = interpolate(frame, [REFERRAL_2 - 10, REFERRAL_2 + 5], [0, 1], clamp);
  const finalGlow = interpolate(frame, [REFERRAL_2, REFERRAL_2 + 20], [0, 30], clamp);

  // Progress indicators for the 3 hops — they light up sequentially
  const hop1Active = interpolate(frame, [SCENE3_START + 15, SCENE3_START + 25], [0, 1], clamp);
  const hop2Active = interpolate(frame, [SCENE3_START + 25, SCENE3_START + 35], [0, 1], clamp);
  const hop3Active = interpolate(frame, [AUTHORITATIVE, AUTHORITATIVE + 15], [0, 1], clamp);
  const hopActivities = [hop1Active, hop2Active, hop3Active];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "#e2e8f0", fontSize: 24, fontWeight: 700 }}>Authoritative Nameserver</span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: c.purple,
            fontFamily: "'SF Mono', monospace",
            padding: "4px 12px",
            borderRadius: 6,
            background: `${c.purple}12`,
            border: `1px solid ${c.purple}25`,
          }}
        >
          Final Authority
        </span>
      </div>

      {/* Chain recap — 3 hops as a progress tracker */}
      <div
        style={{
          opacity: chainRecapOp,
          display: "flex",
          alignItems: "center",
          gap: 0,
          justifyContent: "center",
        }}
      >
        {hops.map((hop, i) => {
          const Icon = getIcon(hop.icon);
          const active = hopActivities[i];
          return (
            <React.Fragment key={hop.label}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: active > 0.5
                      ? `linear-gradient(135deg, ${hop.color}25, ${hop.color}10)`
                      : `${hop.color}08`,
                    border: `1.5px solid ${active > 0.5 ? `${hop.color}40` : `${hop.color}15`}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: active > 0.5 ? `0 0 15px ${hop.color}30` : "none",
                  }}
                >
                  <Icon size={22} color={hop.color} weight="duotone" />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: active > 0.5 ? "#e2e8f0" : "#64748b",
                    fontFamily: "'SF Mono', monospace",
                  }}
                >
                  {hop.label}
                </span>
              </div>
              {/* Connector between hops */}
              {i < hops.length - 1 && (
                <div
                  style={{
                    width: 80,
                    height: 2,
                    background: `${hops[i + 1].color}${active > 0.5 ? "40" : "15"}`,
                    marginBottom: 22,
                    borderRadius: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Authoritative Server — main focus */}
      <div style={{ display: "flex", alignItems: "center", gap: 50, justifyContent: "center" }}>
        <ServerNode
          frame={frame}
          fps={fps}
          appearFrame={AUTHORITATIVE - 5}
          icon="ShieldCheck"
          label="Authoritative NS"
          sublabel="Google's nameserver"
          color={c.purple}
          size={110}
          glowFrame={AUTH_NS}
        />

        {/* Google badge */}
        <div
          style={{
            opacity: googleOp,
            transform: `translateY(${googleY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: "16px 28px",
              borderRadius: 12,
              background: `${c.purple}08`,
              border: `1px solid ${c.purple}20`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            {React.createElement(getIcon("GoogleLogo"), {
              size: 32,
              color: c.purple,
              weight: "duotone",
            })}
            <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>Google's NS</span>
            <span
              style={{
                color: "#94a3b8",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'SF Mono', monospace",
              }}
            >
              ns1.google.com
            </span>
          </div>
        </div>
      </div>

      {/* Final referral — "another referral" */}
      <div
        style={{
          opacity: finalOp,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 28px",
          borderRadius: 10,
          background: `${c.purple}08`,
          border: `1px solid ${c.purple}25`,
          boxShadow: `0 0 ${finalGlow}px ${c.purple}25`,
        }}
      >
        {React.createElement(getIcon("ArrowBendDownRight"), {
          size: 22,
          color: c.purple,
          weight: "duotone",
        })}
        <div>
          <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>
            Another Referral Sent
          </div>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>
            The chain continues — each server knows a little more
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_ChainOfQuestions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene opacities (crossfade) ──
  const scene1Op = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op =
    interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp) *
    interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
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
      {/* ════════════ SCENE 1: Resolver → Root Nameserver ════════════ */}
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
          <Scene1_ResolverToRoot frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: TLD Nameserver ════════════ */}
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
          <Scene2_TLDNameserver frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: Authoritative Nameserver ════════════ */}
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
          <Scene3_Authoritative frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

export default Generated_ChainOfQuestions;
