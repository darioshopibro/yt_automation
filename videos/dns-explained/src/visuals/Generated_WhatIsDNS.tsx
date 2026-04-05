import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  interpolateColors,
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

// ── KEY WORD TIMESTAMPS (global frames at 30fps) ──
const DNS_D = 425;
const DNS_STANDS = 439;
const DNS_DOMAIN = 456;
const DNS_NAME = 472;
const DNS_SYSTEM = 480;
const PHONEBOOK = 538;
const INTERNET = 560;
const GOOGLE_COM = 612;
const BROWSER = 643;
const COMPUTER = 670;
const IP = 778;
const IP_P = 785;
const ADDRESSES = 791;
const IP_NUMBER = 834;
const TRANSLATES = 1010;
const HUMAN_READABLE = 1028;
const MACHINE_READABLE = 1068;

// ── SCENE BOUNDARIES ──
const SCENE1_END = 590;     // DNS acronym + phonebook metaphor
const SCENE2_START = 570;
const SCENE2_END = 920;     // Browser bar + google.com + computer doesn't know
const SCENE3_START = 900;
// SCENE3 goes to endFrame 1110: translation reveal

const Generated_WhatIsDNS: React.FC = () => {
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
      {/* ════════════ SCENE 1: DNS Acronym Reveal + Phonebook ════════════ */}
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
          <Scene1_Acronym frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Browser → google.com → confusion ════════════ */}
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
          <Scene2_Browser frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: Translation — domain → IP ════════════ */}
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
          <Scene3_Translation frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: "DNS stands for Domain Name System" + Phonebook
// ═══════════════════════════════════════════════════════════
const Scene1_Acronym: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const BookIcon = getIcon("BookOpen");
  const GlobeIcon = getIcon("GlobeSimple");

  // "DNS" letters appear with stagger
  const dScale = spring({
    frame: Math.max(0, frame - (DNS_D - 5)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  const nScale = spring({
    frame: Math.max(0, frame - (DNS_D + 5)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  const sScale = spring({
    frame: Math.max(0, frame - (DNS_D + 15)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Glow on DNS letters builds up
  const dnsGlow = interpolate(frame, [DNS_D, DNS_D + 30], [0, 25], clamp);

  // Full words appear under each letter
  const domainOp = interpolate(frame, [DNS_DOMAIN - 3, DNS_DOMAIN + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const domainY = interpolate(frame, [DNS_DOMAIN - 3, DNS_DOMAIN + 12], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const nameOp = interpolate(frame, [DNS_NAME - 3, DNS_NAME + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const nameY = interpolate(frame, [DNS_NAME - 3, DNS_NAME + 12], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const systemOp = interpolate(frame, [DNS_SYSTEM - 3, DNS_SYSTEM + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const systemY = interpolate(frame, [DNS_SYSTEM - 3, DNS_SYSTEM + 12], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Phonebook metaphor appears
  const phonebookOp = interpolate(frame, [PHONEBOOK - 5, PHONEBOOK + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const phonebookY = interpolate(frame, [PHONEBOOK - 5, PHONEBOOK + 12], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const phonebookScale = spring({
    frame: Math.max(0, frame - (PHONEBOOK - 5)),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // "of the internet" text
  const internetOp = interpolate(frame, [INTERNET - 3, INTERNET + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const internetY = interpolate(frame, [INTERNET - 3, INTERNET + 12], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  const letters = [
    { char: "D", word: "Domain", scale: dScale, wordOp: domainOp, wordY: domainY, color: c.blue },
    { char: "N", word: "Name", scale: nScale, wordOp: nameOp, wordY: nameY, color: c.purple },
    { char: "S", word: "System", scale: sScale, wordOp: systemOp, wordY: systemY, color: c.cyan },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 60 }}>
      {/* DNS Letters */}
      <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
        {letters.map((l) => (
          <div
            key={l.char}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Big letter */}
            <div
              style={{
                fontSize: 120,
                fontWeight: 800,
                color: l.color,
                fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1,
                transform: `scale(${l.scale})`,
                textShadow: `0 0 ${dnsGlow}px ${l.color}60`,
                letterSpacing: -2,
              }}
            >
              {l.char}
            </div>
            {/* Full word */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#e2e8f0",
                opacity: l.wordOp,
                transform: `translateY(${l.wordY}px)`,
              }}
            >
              {l.word}
            </div>
          </div>
        ))}
      </div>

      {/* Phonebook metaphor card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "28px 48px",
          borderRadius: 12,
          background: `${c.amber}08`,
          border: `1px solid ${c.amber}20`,
          opacity: phonebookOp,
          transform: `translateY(${phonebookY}px) scale(${phonebookScale})`,
          boxShadow: `0 0 20px ${c.amber}15`,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${c.amber}20, ${c.amber}08)`,
            border: `1.5px solid ${c.amber}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 15px ${c.amber}15`,
          }}
        >
          <BookIcon
            size={32}
            color={c.amber}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 8px ${c.amber}60)` }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
            The Phonebook of the Internet
          </span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "#94a3b8",
              opacity: internetOp,
              transform: `translateY(${internetY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <GlobeIcon size={18} color={c.cyan} weight="duotone" />
            Names in, numbers out
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Browser bar with google.com → Computer confused
// ═══════════════════════════════════════════════════════════
const Scene2_Browser: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const BrowserIcon = getIcon("Browser");
  const DesktopIcon = getIcon("Desktop");
  const QuestionIcon = getIcon("Question");
  const WarningIcon = getIcon("WarningCircle");

  // Browser window appears
  const browserOp = interpolate(frame, [SCENE2_START + 20, SCENE2_START + 40], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const browserY = interpolate(frame, [SCENE2_START + 20, SCENE2_START + 40], [40, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Typing "google.com" in address bar
  const GOOGLE_TEXT = "google.com";
  const typingStart = GOOGLE_COM - 15;
  const typingProgress = interpolate(
    frame,
    [typingStart, typingStart + 30],
    [0, GOOGLE_TEXT.length],
    clamp
  );
  const displayedUrl = GOOGLE_TEXT.slice(0, Math.floor(typingProgress));
  const showCursor = frame >= typingStart && frame < COMPUTER + 30;
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  // "Your computer" label + icon
  const computerOp = interpolate(frame, [COMPUTER - 5, COMPUTER + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const computerX = interpolate(frame, [COMPUTER - 5, COMPUTER + 12], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Question marks — computer doesn't understand
  const q1Op = interpolate(frame, [COMPUTER + 15, COMPUTER + 25], [0, 1], clamp);
  const q2Op = interpolate(frame, [COMPUTER + 22, COMPUTER + 32], [0, 1], clamp);
  const q3Op = interpolate(frame, [COMPUTER + 29, COMPUTER + 39], [0, 1], clamp);
  const q1Y = interpolate(frame, [COMPUTER + 15, COMPUTER + 45], [0, -20], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const q2Y = interpolate(frame, [COMPUTER + 22, COMPUTER + 52], [0, -28], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const q3Y = interpolate(frame, [COMPUTER + 29, COMPUTER + 59], [0, -16], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "Only understands IP addresses" text
  const ipTextOp = interpolate(frame, [IP - 5, IP + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const ipTextY = interpolate(frame, [IP - 5, IP + 12], [15, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // IP number reveal
  const ipNumOp = interpolate(frame, [IP_NUMBER - 5, IP_NUMBER + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const ipNumScale = spring({
    frame: Math.max(0, frame - (IP_NUMBER - 5)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });
  const ipNumGlow = interpolate(frame, [IP_NUMBER, IP_NUMBER + 20], [0, 25], clamp);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50, width: "100%" }}>
      {/* Browser Window Mock */}
      <div
        style={{
          width: 750,
          borderRadius: 12,
          background: "#12121f",
          border: "1px solid #1a1a2e",
          overflow: "hidden",
          opacity: browserOp,
          transform: `translateY(${browserY}px)`,
          boxShadow: "0 8px 40px #00000040",
        }}
      >
        {/* Title bar with dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            background: "#0a0a14",
            borderBottom: "1px solid #1a1a2e",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef444480" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b80" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e80" }} />
        </div>
        {/* Address bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            margin: "10px 12px",
            borderRadius: 8,
            background: "#0f0f1a",
            border: "1px solid #2a2a3e",
          }}
        >
          <BrowserIcon size={20} color="#64748b" weight="duotone" />
          <span
            style={{
              fontSize: 18,
              fontFamily: "'SF Mono', monospace",
              color: "#e2e8f0",
              fontWeight: 500,
            }}
          >
            {displayedUrl}
            {showCursor && (
              <span style={{ opacity: cursorBlink ? 1 : 0, color: c.blue, fontWeight: 300 }}>|</span>
            )}
          </span>
        </div>
        {/* Placeholder content */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ width: "70%", height: 10, borderRadius: 4, background: "#ffffff08" }} />
          <div style={{ width: "50%", height: 10, borderRadius: 4, background: "#ffffff05" }} />
          <div style={{ width: "60%", height: 10, borderRadius: 4, background: "#ffffff05" }} />
        </div>
      </div>

      {/* Computer + Question marks row */}
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {/* Computer icon block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: computerOp,
            transform: `translateX(${computerX}px)`,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${c.blue}20, ${c.blue}08)`,
                border: `1.5px solid ${c.blue}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 15px ${c.blue}15`,
              }}
            >
              <DesktopIcon size={36} color={c.blue} weight="duotone" />
            </div>
            {/* Floating question marks */}
            <div
              style={{
                position: "absolute",
                top: -10,
                right: -18,
                opacity: q1Op,
                transform: `translateY(${q1Y}px)`,
              }}
            >
              <QuestionIcon size={22} color={c.red} weight="bold" />
            </div>
            <div
              style={{
                position: "absolute",
                top: -18,
                right: 10,
                opacity: q2Op,
                transform: `translateY(${q2Y}px)`,
              }}
            >
              <QuestionIcon size={18} color={c.amber} weight="bold" />
            </div>
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -30,
                opacity: q3Op,
                transform: `translateY(${q3Y}px)`,
              }}
            >
              <QuestionIcon size={16} color={c.orange} weight="bold" />
            </div>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Your Computer</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>
            has no idea what "google.com" means
          </span>
        </div>

        {/* Arrow indicator */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: ipTextOp,
            transform: `translateY(${ipTextY}px)`,
          }}
        >
          <WarningIcon size={28} color={c.amber} weight="duotone" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: c.amber,
              fontFamily: "'SF Mono', monospace",
              textTransform: "uppercase" as const,
              letterSpacing: 1.5,
            }}
          >
            Only understands
          </span>
        </div>

        {/* IP Address block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: ipTextOp,
            transform: `translateY(${ipTextY}px)`,
          }}
        >
          <div
            style={{
              padding: "20px 36px",
              borderRadius: 12,
              background: `${c.green}08`,
              border: `1px solid ${c.green}20`,
              boxShadow: `0 0 ${ipNumGlow}px ${c.green}20`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 28,
                fontWeight: 700,
                color: c.green,
                letterSpacing: -0.5,
                opacity: ipNumOp,
                transform: `scale(${ipNumScale})`,
                display: "inline-block",
                textShadow: `0 0 20px ${c.green}30`,
              }}
            >
              142.250.80.46
            </span>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#64748b",
              textTransform: "uppercase" as const,
              letterSpacing: 1.5,
            }}
          >
            IP Addresses
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: The Translation — google.com morphs → 142.250.80.46
// ═══════════════════════════════════════════════════════════
const Scene3_Translation: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ArrowsIcon = getIcon("ArrowsLeftRight");
  const TranslateIcon = getIcon("Translate");
  const UserIcon = getIcon("User");
  const CpuIcon = getIcon("Cpu");

  // Title: "DNS translates"
  const titleOp = interpolate(frame, [TRANSLATES - 5, TRANSLATES + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const titleY = interpolate(frame, [TRANSLATES - 5, TRANSLATES + 12], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Translate icon pop
  const translateScale = spring({
    frame: Math.max(0, frame - (TRANSLATES - 3)),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // Left side: human-readable
  const humanOp = interpolate(frame, [HUMAN_READABLE - 5, HUMAN_READABLE + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const humanX = interpolate(frame, [HUMAN_READABLE - 5, HUMAN_READABLE + 12], [-40, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Right side: machine-readable
  const machineOp = interpolate(frame, [MACHINE_READABLE - 5, MACHINE_READABLE + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const machineX = interpolate(frame, [MACHINE_READABLE - 5, MACHINE_READABLE + 12], [40, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Arrow animation between them
  const arrowOp = interpolate(frame, [MACHINE_READABLE + 5, MACHINE_READABLE + 18], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Morph color pulse on center icon
  const morphPulse = interpolate(frame, [MACHINE_READABLE + 10, MACHINE_READABLE + 40], [0, 1], clamp);
  const morphGlow = interpolate(frame, [MACHINE_READABLE + 10, MACHINE_READABLE + 40], [0, 30], clamp);

  // Center color shifts from blue → green
  const centerColor = interpolateColors(
    frame,
    [TRANSLATES, MACHINE_READABLE + 20],
    [c.blue, c.green]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50, width: "100%" }}>
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
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${centerColor}20, ${centerColor}08)`,
            border: `1.5px solid ${centerColor}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${15 + morphGlow}px ${centerColor}25`,
            transform: `scale(${translateScale})`,
          }}
        >
          <TranslateIcon
            size={28}
            color={centerColor}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 8px ${centerColor}60)` }}
          />
        </div>
        <span style={{ fontSize: 26, fontWeight: 700, color: "#e2e8f0" }}>
          DNS Translates
        </span>
      </div>

      {/* Translation visualization */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          width: "100%",
        }}
      >
        {/* Human-Readable side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: humanOp,
            transform: `translateX(${humanX}px)`,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${c.blue}20, ${c.blue}08)`,
              border: `1.5px solid ${c.blue}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${c.blue}15`,
            }}
          >
            <UserIcon
              size={32}
              color={c.blue}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 8px ${c.blue}60)` }}
            />
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase" as const,
              letterSpacing: 1.5,
            }}
          >
            Human-Readable
          </span>
          <div
            style={{
              padding: "20px 40px",
              borderRadius: 12,
              background: `${c.blue}08`,
              border: `1px solid ${c.blue}20`,
              boxShadow: `0 0 20px ${c.blue}15`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 30,
                fontWeight: 700,
                color: c.blue,
                letterSpacing: -0.5,
                textShadow: `0 0 20px ${c.blue}30`,
              }}
            >
              google.com
            </span>
          </div>
        </div>

        {/* Center arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: arrowOp,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: `${centerColor}12`,
              border: `1.5px solid ${centerColor}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${15 + morphGlow}px ${centerColor}30`,
            }}
          >
            <ArrowsIcon size={28} color={centerColor} weight="bold" />
          </div>
        </div>

        {/* Machine-Readable side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: machineOp,
            transform: `translateX(${machineX}px)`,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${c.green}20, ${c.green}08)`,
              border: `1.5px solid ${c.green}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${c.green}15`,
            }}
          >
            <CpuIcon
              size={32}
              color={c.green}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 8px ${c.green}60)` }}
            />
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase" as const,
              letterSpacing: 1.5,
            }}
          >
            Machine-Readable
          </span>
          <div
            style={{
              padding: "20px 40px",
              borderRadius: 12,
              background: `${c.green}08`,
              border: `1px solid ${c.green}20`,
              boxShadow: `0 0 20px ${c.green}15`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 30,
                fontWeight: 700,
                color: c.green,
                letterSpacing: -0.5,
                textShadow: `0 0 20px ${c.green}30`,
              }}
            >
              142.250.80.46
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generated_WhatIsDNS;
