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

// ── Timestamps from voiceover (global frames at 30fps) ──
const HERES = 1141;
const LOOKUP = 1168;
const WORKS = 1194;
const BROWSER = 1238;
const CHECKS = 1251;
const CACHE = 1271;
const VISITED = 1318;
const GOOGLE_COM = 1330;
const STORED = 1423;
const LOCALLY = 1433;
const NO = 1471;
const NETWORK = 1480;
const REQUEST = 1491;
const CACHE_EMPTY = 1550;
const EMPTY = 1564;
const OPERATING = 1588;
const SYSTEM = 1603;
const RECURSIVE = 1626;
const RESOLVER = 1643;
const ISP = 1704;
const DNS_SERVER = 1736;
const CLOUDFLARE = 1824;
const ONE_ONE = 1847;

// ── Scene boundaries (global frames) ──
const SCENE1_END = CACHE_EMPTY - 15;   // ~1535 — title + browser + cache HIT
const SCENE2_START = CACHE_EMPTY - 35;  // ~1515 — crossfade into cache MISS + resolver
const SCENE2_END = 1890;

const Generated_DNSLookupCache: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene opacities with crossfade
  const scene1Op = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp);

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
      {/* ════════ SCENE 1: "How DNS lookup works" + Browser cache HIT ════════ */}
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
            gap: 48,
            opacity: scene1Op,
          }}
        >
          <Scene1_CacheHit frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════ SCENE 2: Cache MISS + Recursive Resolver ════════ */}
      {frame >= SCENE2_START && (
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
          <Scene2_Resolver frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Title -> Browser URL bar -> Cache check -> HIT
// ═══════════════════════════════════════════════════════════
const Scene1_CacheHit: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const GlobeIcon = getIcon("GlobeSimple");
  const MagnifyingGlassIcon = getIcon("MagnifyingGlass");
  const DatabaseIcon = getIcon("Database");
  const CheckCircleIcon = getIcon("CheckCircle");
  const LightningIcon = getIcon("Lightning");

  // ── Title: "How DNS Lookup Works" ──
  const titleOp = interpolate(frame, [HERES - 5, HERES + 10], [0, 1], clamp);
  const titleY = interpolate(frame, [HERES - 5, HERES + 10], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── Browser "window" appears ──
  const browserOp = interpolate(frame, [BROWSER - 10, BROWSER + 5], [0, 1], clamp);
  const browserScale = spring({
    frame: Math.max(0, frame - (BROWSER - 10)),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // ── URL typing "google.com" animation ──
  const urlText = "google.com";
  const typingStart = GOOGLE_COM - 10;
  const typingEnd = GOOGLE_COM + 20;
  const typingProgress = interpolate(frame, [typingStart, typingEnd], [0, 1], clamp);
  const visibleChars = Math.round(typingProgress * urlText.length);

  // ── "checks its own cache" label ──
  const checksOp = interpolate(frame, [CHECKS - 5, CHECKS + 10], [0, 1], clamp);
  const checksY = interpolate(frame, [CHECKS - 5, CHECKS + 10], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── Cache box appears ──
  const cacheOp = interpolate(frame, [CACHE - 5, CACHE + 10], [0, 1], clamp);
  const cacheScale = spring({
    frame: Math.max(0, frame - (CACHE - 5)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // ── Query pulse traveling from browser to cache ──
  const pulseStart = CACHE + 10;
  const pulseEnd = VISITED - 5;
  const pulseProgress = interpolate(frame, [pulseStart, pulseEnd], [0, 1], clamp);
  const pulseOp = interpolate(frame, [pulseStart, pulseStart + 5], [0, 0.9], clamp)
    * interpolate(frame, [pulseEnd - 5, pulseEnd], [1, 0], clamp);

  // ── Cache HIT: green glow + checkmark ──
  const hitStart = STORED - 5;
  const hitGlow = interpolate(frame, [hitStart, hitStart + 20], [0, 30], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const hitCheckOp = interpolate(frame, [hitStart + 5, hitStart + 20], [0, 1], clamp);
  const hitCheckScale = spring({
    frame: Math.max(0, frame - (hitStart + 5)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // ── "Stored locally" badge ──
  const storedOp = interpolate(frame, [LOCALLY - 3, LOCALLY + 12], [0, 1], clamp);
  const storedY = interpolate(frame, [LOCALLY - 3, LOCALLY + 12], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── "No network request needed" ──
  const noNetworkOp = interpolate(frame, [NO - 3, NO + 12], [0, 1], clamp);
  const noNetworkY = interpolate(frame, [NO - 3, NO + 12], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#e2e8f0",
            fontFamily: "'SF Mono', monospace",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          How DNS Lookup Works
        </span>
        <div
          style={{
            width: 60,
            height: 3,
            background: c.blue,
            margin: "12px auto 0",
            borderRadius: 2,
            boxShadow: `0 0 12px ${c.blue}60`,
          }}
        />
      </div>

      {/* Browser + Cache row */}
      <div style={{ display: "flex", alignItems: "center", gap: 60, justifyContent: "center" }}>
        {/* Browser window mock */}
        <div
          style={{
            opacity: browserOp,
            transform: `scale(${browserScale})`,
            display: "flex",
            flexDirection: "column",
            gap: 0,
            width: 520,
          }}
        >
          {/* Browser top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "#1a1a2e",
              borderRadius: "12px 12px 0 0",
              border: "1px solid #2a2a3e",
              borderBottom: "none",
            }}
          >
            {/* Traffic light dots */}
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef444480" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b80" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e80" }} />
            </div>

            {/* URL bar */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "#0f0f1a",
                borderRadius: 8,
                border: "1px solid #2a2a3e",
                marginLeft: 12,
              }}
            >
              <GlobeIcon size={16} color="#64748b" weight="duotone" />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "'SF Mono', monospace",
                  color: "#e2e8f0",
                  letterSpacing: 0.3,
                }}
              >
                {urlText.substring(0, visibleChars)}
                {visibleChars < urlText.length && (
                  <span
                    style={{
                      opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                      color: c.blue,
                    }}
                  >
                    |
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Browser content area */}
          <div
            style={{
              padding: "32px 24px",
              background: "#12121f",
              borderRadius: "0 0 12px 12px",
              border: "1px solid #2a2a3e",
              borderTop: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Placeholder search bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 20px",
                background: "#0f0f1a",
                border: "1px solid #2a2a3e",
                borderRadius: 24,
                width: "80%",
              }}
            >
              <MagnifyingGlassIcon size={18} color="#64748b" weight="duotone" />
              <div style={{ height: 10, width: 120, background: "#ffffff10", borderRadius: 4 }} />
            </div>
            {/* Placeholder lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "70%", marginTop: 8 }}>
              <div style={{ height: 8, width: "90%", background: "#ffffff08", borderRadius: 4 }} />
              <div style={{ height: 8, width: "70%", background: "#ffffff08", borderRadius: 4 }} />
              <div style={{ height: 8, width: "80%", background: "#ffffff08", borderRadius: 4 }} />
            </div>
          </div>
        </div>

        {/* Arrow zone with traveling pulse */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: c.blue,
              fontFamily: "'SF Mono', monospace",
              opacity: checksOp,
              transform: `translateY(${checksY}px)`,
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
          >
            checks cache
          </span>
          <div style={{ width: 100, height: 2, background: `${c.blue}20`, position: "relative" }}>
            {/* Traveling dot */}
            <div
              style={{
                position: "absolute",
                top: -5,
                left: `${pulseProgress * 100}%`,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: c.blue,
                boxShadow: `0 0 14px ${c.blue}80`,
                opacity: pulseOp,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>

        {/* Cache box */}
        <div
          style={{
            opacity: cacheOp,
            transform: `scale(${cacheScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 16,
              background: hitGlow > 0
                ? `linear-gradient(135deg, ${c.green}20, ${c.green}08)`
                : `linear-gradient(135deg, ${c.purple}20, ${c.purple}08)`,
              border: `1.5px solid ${hitGlow > 0 ? `${c.green}50` : `${c.purple}30`}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: hitGlow > 0
                ? `0 0 ${hitGlow}px ${c.green}30`
                : `0 0 15px ${c.purple}15`,
              position: "relative",
            }}
          >
            <DatabaseIcon
              size={44}
              color={hitGlow > 0 ? c.green : c.purple}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 8px ${hitGlow > 0 ? c.green : c.purple}60)` }}
            />

            {/* Checkmark overlay */}
            <div
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                opacity: hitCheckOp,
                transform: `scale(${hitCheckScale})`,
              }}
            >
              <CheckCircleIcon size={28} color={c.green} weight="fill" />
            </div>
          </div>
          <span style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 600 }}>Browser Cache</span>

          {/* Cache entry showing google.com */}
          {frame >= VISITED && (
            <div
              style={{
                opacity: interpolate(frame, [VISITED, VISITED + 12], [0, 1], clamp),
                padding: "6px 14px",
                background: `${c.purple}08`,
                border: `1px solid ${c.purple}20`,
                borderRadius: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: c.purple,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                google.com → 142.250.80.46
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Result badges */}
      <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
        {/* "Stored locally" */}
        <div
          style={{
            opacity: storedOp,
            transform: `translateY(${storedY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 24px",
            background: `${c.green}08`,
            border: `1px solid ${c.green}20`,
            borderRadius: 10,
            boxShadow: `0 0 15px ${c.green}15`,
          }}
        >
          <CheckCircleIcon size={22} color={c.green} weight="duotone" />
          <span style={{ fontSize: 16, fontWeight: 600, color: c.green }}>
            Stored Locally
          </span>
        </div>

        {/* "No network request" */}
        <div
          style={{
            opacity: noNetworkOp,
            transform: `translateY(${noNetworkY}px)`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 24px",
            background: `${c.amber}08`,
            border: `1px solid ${c.amber}20`,
            borderRadius: 10,
          }}
        >
          <LightningIcon size={22} color={c.amber} weight="duotone" />
          <span style={{ fontSize: 16, fontWeight: 600, color: c.amber }}>
            No Network Request Needed
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Cache MISS -> Recursive Resolver (ISP / Cloudflare)
// ═══════════════════════════════════════════════════════════
const Scene2_Resolver: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const WarningIcon = getIcon("Warning");
  const ArrowRightIcon = getIcon("ArrowRight");
  const DatabaseIcon = getIcon("Database");
  const CloudIcon = getIcon("Cloud");
  const GlobeIcon = getIcon("GlobeSimple");
  const ShieldCheckIcon = getIcon("ShieldCheck");
  const XCircleIcon = getIcon("XCircle");

  // ── "But if the cache is empty" title ──
  const titleOp = interpolate(frame, [CACHE_EMPTY - 5, CACHE_EMPTY + 10], [0, 1], clamp);
  const titleY = interpolate(frame, [CACHE_EMPTY - 5, CACHE_EMPTY + 10], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── Empty cache box with X ──
  const emptyCacheOp = interpolate(frame, [EMPTY - 5, EMPTY + 10], [0, 1], clamp);
  const emptyCacheScale = spring({
    frame: Math.max(0, frame - (EMPTY - 5)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // ── "your OS asks" arrow ──
  const osAskOp = interpolate(frame, [OPERATING - 5, OPERATING + 10], [0, 1], clamp);
  const osAskY = interpolate(frame, [OPERATING - 5, OPERATING + 10], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── Recursive resolver big box ──
  const resolverOp = interpolate(frame, [RECURSIVE - 5, RECURSIVE + 15], [0, 1], clamp);
  const resolverScale = spring({
    frame: Math.max(0, frame - (RECURSIVE - 5)),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const resolverGlow = interpolate(frame, [RESOLVER, RESOLVER + 20], [0, 25], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── "This is usually your ISP's DNS server" ──
  const ispOp = interpolate(frame, [ISP - 5, ISP + 12], [0, 1], clamp);
  const ispY = interpolate(frame, [ISP - 5, ISP + 12], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── "or Cloudflare 1.1.1.1" ──
  const cfOp = interpolate(frame, [CLOUDFLARE - 5, CLOUDFLARE + 12], [0, 1], clamp);
  const cfY = interpolate(frame, [CLOUDFLARE - 5, CLOUDFLARE + 12], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // ── 1.1.1.1 badge pop ──
  const ipOp = interpolate(frame, [ONE_ONE - 3, ONE_ONE + 12], [0, 1], clamp);
  const ipScale = spring({
    frame: Math.max(0, frame - (ONE_ONE - 3)),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // ── Traveling pulse from empty cache to resolver ──
  const travelStart = SYSTEM;
  const travelEnd = RECURSIVE - 10;
  const travelProgress = interpolate(frame, [travelStart, travelEnd], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const travelOp = interpolate(frame, [travelStart, travelStart + 5], [0, 0.9], clamp)
    * interpolate(frame, [travelEnd - 5, travelEnd], [1, 0], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Title */}
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#e2e8f0",
          }}
        >
          But if the cache is empty...
        </span>
      </div>

      {/* Main row: Empty Cache → OS → Recursive Resolver */}
      <div style={{ display: "flex", alignItems: "center", gap: 40, justifyContent: "center" }}>
        {/* Empty Cache */}
        <div
          style={{
            opacity: emptyCacheOp,
            transform: `scale(${emptyCacheScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${c.red}15, ${c.red}05)`,
              border: `1.5px solid ${c.red}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <DatabaseIcon size={40} color={c.red} weight="duotone" style={{ opacity: 0.4 }} />
            <div style={{ position: "absolute", top: -6, right: -6 }}>
              <XCircleIcon size={24} color={c.red} weight="fill" />
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Cache Empty</span>
        </div>

        {/* Arrow with traveling pulse */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: c.cyan,
              fontFamily: "'SF Mono', monospace",
              opacity: osAskOp,
              transform: `translateY(${osAskY}px)`,
              whiteSpace: "nowrap",
            }}
          >
            OS asks resolver
          </span>
          <div style={{ width: 140, height: 2, background: `${c.cyan}20`, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: -5,
                left: `${travelProgress * 100}%`,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: c.cyan,
                boxShadow: `0 0 14px ${c.cyan}80`,
                opacity: travelOp,
                transform: "translateX(-50%)",
              }}
            />
          </div>
        </div>

        {/* Recursive Resolver */}
        <div
          style={{
            opacity: resolverOp,
            transform: `scale(${resolverScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${c.cyan}15, ${c.cyan}05)`,
              border: `1.5px solid ${c.cyan}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${resolverGlow}px ${c.cyan}25`,
            }}
          >
            <GlobeIcon
              size={52}
              color={c.cyan}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 10px ${c.cyan}60)` }}
            />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>Recursive Resolver</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>
            Does the heavy lifting
          </span>
        </div>
      </div>

      {/* Provider options: ISP vs Cloudflare */}
      <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 8 }}>
        {/* ISP Option */}
        <div
          style={{
            opacity: ispOp,
            transform: `translateY(${ispY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "24px 32px",
            background: `${c.amber}06`,
            border: `1px solid ${c.amber}18`,
            borderRadius: 12,
            minWidth: 280,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${c.amber}20, ${c.amber}08)`,
              border: `1.5px solid ${c.amber}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 12px ${c.amber}15`,
            }}
          >
            <ShieldCheckIcon size={28} color={c.amber} weight="duotone" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>ISP DNS Server</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#64748b",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            Your Internet Provider
          </span>
        </div>

        {/* "or" divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            opacity: cfOp,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#64748b",
              fontFamily: "'SF Mono', monospace",
            }}
          >
            or
          </span>
        </div>

        {/* Cloudflare Option */}
        <div
          style={{
            opacity: cfOp,
            transform: `translateY(${cfY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "24px 32px",
            background: `${c.orange}06`,
            border: `1px solid ${c.orange}18`,
            borderRadius: 12,
            minWidth: 280,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${c.orange}20, ${c.orange}08)`,
              border: `1.5px solid ${c.orange}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 12px ${c.orange}15`,
            }}
          >
            <CloudIcon size={28} color={c.orange} weight="duotone" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Cloudflare</span>

          {/* 1.1.1.1 badge */}
          <div
            style={{
              opacity: ipOp,
              transform: `scale(${ipScale})`,
              padding: "8px 20px",
              background: `${c.orange}12`,
              border: `1px solid ${c.orange}30`,
              borderRadius: 10,
              boxShadow: `0 0 15px ${c.orange}20`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: c.orange,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: 1,
                textShadow: `0 0 20px ${c.orange}40`,
              }}
            >
              1.1.1.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_DNSLookupCache;
