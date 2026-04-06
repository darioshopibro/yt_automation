import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  Warning,
  Package,
  File,
  Keyboard,
  CloudArrowUp,
  Key,
  Terminal,
  Eye,
  ShieldWarning,
  Lock,
} from "@phosphor-icons/react";

// ─── Helpers ──────────────────────────────────────────────
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

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

const slideLeft = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [30, 0], {
    ...clamp,
    easing: easeOutCubic,
  });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], {
    ...clamp,
    easing: easeInQuad,
  });

// ─── Colors ───────────────────────────────────────────────
const BG = "#030305";
const DANGER = "#ef4444";
const DANGER_DARK = "#991b1b";
const PRIMARY = "#3b82f6";
const ACCENT = "#f59e0b";
const CYAN = "#06b6d4";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — Global frames
 * ═══════════════════════════════════════════════════════════
 * Start                                → f1346
 * "scary part"                         → f1363
 * "malicious extension"                → f1397–f1437
 * "three things"                       → f1460
 * "exfiltrate your code"               → f1573–f1601
 * "every file"                         → f1645
 * "every keystroke"                    → f1688–f1704
 * "silently sent"                      → f1744–f1770
 * "remote server"                      → f1778–f1789
 * "API keys"                           → f1895–f1907
 * "environment variables"              → f1941–f1959
 * End                                  → f2056
 */

// ─── Placeholder Code Lines ──────────────────────────────
const codeLinesData = [
  { width: "70%", indent: 0 },
  { width: "55%", indent: 0 },
  { width: "80%", indent: 16 },
  { width: "65%", indent: 16 },
  { width: "45%", indent: 16 },
  { width: "75%", indent: 0 },
  { width: "60%", indent: 16 },
  { width: "50%", indent: 32 },
  { width: "85%", indent: 16 },
  { width: "40%", indent: 0 },
  { width: "70%", indent: 16 },
  { width: "55%", indent: 32 },
];

// ─── Data Particle ───────────────────────────────────────
const DataParticle: React.FC<{
  frame: number;
  startFrame: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  duration: number;
}> = ({ frame, startFrame, startX, startY, endX, endY, color, size, duration }) => {
  const progress = interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { ...clamp, easing: Easing.inOut(Easing.cubic) }
  );
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 5, startFrame + duration - 5, startFrame + duration],
    [0, 0.9, 0.9, 0],
    clamp
  );

  const x = startX + (endX - startX) * progress;
  const y = startY + (endY - startY) * progress + Math.sin(progress * Math.PI * 2) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}80, 0 0 ${size * 4}px ${color}30`,
        opacity,
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_CodeExfiltration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── SCENE PHASES ─────────────────────────────────────
  // Scene 1: f1346–f1540  Intro + malicious extension
  // Scene 2: f1540–f1810  Exfiltration in action (files, keystrokes, sent to server)
  // Scene 3: f1810–f2056  Sensitive data exposed (API keys, env vars)

  const scene1Fade = frame < 1510 ? 1 : fadeOut(frame, 1510, 30);
  const scene2Opacity = frame < 1510 ? 0 : frame < 1790 ? fadeIn(frame, 1520, 25) : fadeOut(frame, 1790, 25);
  const scene3Opacity = frame < 1790 ? 0 : fadeIn(frame, 1800, 25);

  // ─── SCENE 1: Intro ─────────────────────────────────
  // 🔊 SOUND: scene_start @ frame 1346 — ominous background begins, dark screen
  const bgPulse = interpolate(
    frame,
    [1346, 1370, 1400, 1430],
    [0, 0.3, 0.15, 0.25],
    clamp
  );

  // 🔊 SOUND: element_appear @ frame 1350 — warning icon fades in with glow
  const warningOpacity = fadeIn(frame, 1350, 12);
  const warningSlide = slideUp(frame, 1350, 12);

  // 🔊 SOUND: reveal @ frame 1363 — "THE SCARY PART" text slams in
  const scaryTextOpacity = fadeIn(frame, 1360, 10);
  const scaryTextScale = spring({
    frame: Math.max(0, frame - 1360),
    fps,
    config: { damping: 18, stiffness: 220 },
  });

  // 🔊 SOUND: element_appear @ frame 1397 — malicious extension puzzle piece slides in with red glow
  const extensionOpacity = fadeIn(frame, 1394, 18);
  const extensionSlide = slideUp(frame, 1394, 18);

  // Extension red pulse animation (ominous)
  const extensionGlow = interpolate(
    frame,
    [1397, 1420, 1440, 1460, 1480, 1500],
    [0, 0.8, 0.4, 0.7, 0.3, 0.6],
    clamp
  );

  // 🔊 SOUND: element_appear @ frame 1460 — "3 THINGS" counter appears
  const threeThingsOpacity = fadeIn(frame, 1457, 12);
  const threeThingsScale = spring({
    frame: Math.max(0, frame - 1457),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // ─── SCENE 2: Exfiltration ──────────────────────────
  // 🔊 SOUND: transition @ frame 1530 — scene crossfades to exfiltration view
  // Left: code editor. Right: server receiving data

  // Code editor panel
  const editorOpacity = fadeIn(frame, 1530, 20);
  const editorSlide = slideLeft(frame, 1530, 20);

  // 🔊 SOUND: reveal @ frame 1573 — "EXFILTRATE YOUR CODE" label appears, data starts flowing
  const exfilLabelOpacity = fadeIn(frame, 1570, 12);
  const exfilLabelSlide = slideUp(frame, 1570, 12);

  // Code lines get highlighted red progressively as they're "stolen"
  const codeHighlightProgress = interpolate(
    frame,
    [1573, 1750],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // 🔊 SOUND: element_appear @ frame 1645 — file icon captured with red flash
  const fileIconOpacity = fadeIn(frame, 1642, 12);
  const fileIconScale = spring({
    frame: Math.max(0, frame - 1642),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // 🔊 SOUND: element_appear @ frame 1688 — keyboard icon captured
  const keystrokeOpacity = fadeIn(frame, 1685, 12);
  const keystrokeScale = spring({
    frame: Math.max(0, frame - 1685),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  // 🔊 SOUND: reveal @ frame 1744 — "SILENTLY SENT" — data stream intensifies
  const streamIntensity = interpolate(
    frame,
    [1573, 1644, 1744, 1789],
    [0, 0.4, 0.8, 1],
    clamp
  );

  // 🔊 SOUND: element_appear @ frame 1778 — remote server fully revealed with ominous pulse
  const serverOpacity = fadeIn(frame, 1550, 20);
  const serverGlow = interpolate(
    frame,
    [1778, 1800, 1820, 1840],
    [0, 1, 0.6, 0.8],
    clamp
  );

  // ─── SCENE 3: Sensitive Data ────────────────────────
  // 🔊 SOUND: transition @ frame 1800 — scene shifts to sensitive data exposure

  // 🔊 SOUND: reveal @ frame 1895 — API key exposed with danger glow
  const apiKeyOpacity = fadeIn(frame, 1892, 15);
  const apiKeySlide = slideUp(frame, 1892, 15);
  const apiKeyGlow = interpolate(
    frame,
    [1895, 1920, 1940],
    [0, 1, 0.7],
    clamp
  );

  // 🔊 SOUND: reveal @ frame 1941 — environment variables exposed
  const envVarOpacity = fadeIn(frame, 1938, 15);
  const envVarSlide = slideUp(frame, 1938, 15);
  const envVarGlow = interpolate(
    frame,
    [1941, 1966, 1986],
    [0, 1, 0.7],
    clamp
  );

  // Final danger pulse on everything
  const finalPulse = interpolate(
    frame,
    [1970, 2000, 2030, 2050],
    [0.7, 1, 0.8, 0.6],
    clamp
  );

  // Data particles (flowing from editor to server in scene 2)
  const particleConfigs = [
    { startFrame: 1580, startX: 520, startY: 350, endX: 1350, endY: 320, color: DANGER, size: 6, dur: 50 },
    { startFrame: 1600, startX: 500, startY: 420, endX: 1370, endY: 380, color: `${DANGER}cc`, size: 4, dur: 45 },
    { startFrame: 1620, startX: 530, startY: 480, endX: 1340, endY: 440, color: ACCENT, size: 5, dur: 55 },
    { startFrame: 1650, startX: 510, startY: 360, endX: 1360, endY: 350, color: DANGER, size: 5, dur: 48 },
    { startFrame: 1670, startX: 540, startY: 440, endX: 1350, endY: 400, color: `${DANGER}cc`, size: 4, dur: 42 },
    { startFrame: 1700, startX: 500, startY: 500, endX: 1380, endY: 460, color: ACCENT, size: 6, dur: 50 },
    { startFrame: 1720, startX: 520, startY: 380, endX: 1340, endY: 340, color: DANGER, size: 5, dur: 45 },
    { startFrame: 1740, startX: 530, startY: 460, endX: 1360, endY: 420, color: `${DANGER}dd`, size: 4, dur: 48 },
    { startFrame: 1755, startX: 510, startY: 400, endX: 1370, endY: 380, color: DANGER, size: 7, dur: 40 },
    { startFrame: 1765, startX: 540, startY: 340, endX: 1350, endY: 360, color: ACCENT, size: 5, dur: 52 },
  ];

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
      {/* ─── Ominous background vignette/pulse ──────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${DANGER}${Math.round(bgPulse * 8).toString(16).padStart(2, "0")} 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* ═══ SCENE 1: THE SCARY PART ════════════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          opacity: scene1Fade,
          padding: 80,
        }}
      >
        {/* Warning icon */}
        <div
          style={{
            opacity: warningOpacity,
            transform: `translateY(${warningSlide}px)`,
          }}
        >
          <ShieldWarning
            size={64}
            color={DANGER}
            weight="duotone"
            style={{
              filter: `drop-shadow(0 0 20px ${DANGER}60)`,
            }}
          />
        </div>

        {/* "THE SCARY PART" */}
        <div
          style={{
            opacity: scaryTextOpacity,
            transform: `scale(${scaryTextScale})`,
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 32,
              fontWeight: 700,
              color: DANGER,
              letterSpacing: 4,
              textTransform: "uppercase",
              textShadow: `0 0 30px ${DANGER}50`,
            }}
          >
            THE SCARY PART
          </span>
        </div>

        {/* Malicious Extension */}
        <div
          style={{
            opacity: extensionOpacity,
            transform: `translateY(${extensionSlide}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 36px",
              background: `${DANGER}${Math.round(extensionGlow * 12).toString(16).padStart(2, "0")}`,
              border: `2px solid ${DANGER}${Math.round(30 + extensionGlow * 40).toString(16).padStart(2, "0")}`,
              borderRadius: 12,
              boxShadow: `0 0 ${20 + extensionGlow * 30}px ${DANGER}${Math.round(extensionGlow * 40).toString(16).padStart(2, "0")}`,
            }}
          >
            <Package
              size={36}
              color={DANGER}
              weight="duotone"
              style={{
                filter: `drop-shadow(0 0 12px ${DANGER}80)`,
              }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 20,
                fontWeight: 700,
                color: TEXT_PRIMARY,
                letterSpacing: 1,
              }}
            >
              Malicious Extension
            </span>
            <Eye
              size={28}
              color={DANGER}
              weight="duotone"
              style={{
                opacity: extensionGlow,
                filter: `drop-shadow(0 0 8px ${DANGER}80)`,
              }}
            />
          </div>

          {/* "Can do 3 things" badge */}
          <div
            style={{
              opacity: threeThingsOpacity,
              transform: `scale(${threeThingsScale})`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: `${DANGER}15`,
                border: `2px solid ${DANGER}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${DANGER}20`,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 24,
                  fontWeight: 700,
                  color: DANGER,
                }}
              >
                3
              </span>
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: TEXT_DIM,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              things without you ever noticing
            </span>
          </div>
        </div>
      </div>

      {/* ═══ SCENE 2: EXFILTRATION IN ACTION ════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
          opacity: scene2Opacity,
          padding: 80,
        }}
      >
        {/* LEFT: Code Editor Mockup */}
        <div
          style={{
            opacity: editorOpacity,
            transform: `translateX(${-slideLeft(frame, 1530, 20) * 0 + interpolate(frame, [1530, 1545], [-30, 0], { ...clamp, easing: easeOutCubic })}px)`,
            width: 480,
            display: "flex",
            flexDirection: "column",
            background: "#0c0c14",
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Editor title bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#111120",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef444460" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b40" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e40" }} />
            <span
              style={{
                marginLeft: 8,
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                color: TEXT_DIM,
              }}
            >
              app.ts — your-project
            </span>
          </div>

          {/* Code lines */}
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
            {codeLinesData.map((line, i) => {
              const lineHighlighted = i / codeLinesData.length < codeHighlightProgress;
              const highlightIntensity = lineHighlighted
                ? interpolate(
                    frame,
                    [1573 + i * 15, 1573 + i * 15 + 10],
                    [0, 1],
                    clamp
                  )
                : 0;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingLeft: line.indent,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 10,
                      color: "#ffffff15",
                      width: 20,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div
                    style={{
                      height: 10,
                      width: line.width,
                      background: lineHighlighted
                        ? `${DANGER}${Math.round(15 + highlightIntensity * 25).toString(16).padStart(2, "0")}`
                        : "#ffffff10",
                      borderRadius: 4,
                      boxShadow: lineHighlighted
                        ? `0 0 8px ${DANGER}${Math.round(highlightIntensity * 30).toString(16).padStart(2, "0")}`
                        : "none",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: Exfiltration label + captured items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            minWidth: 260,
          }}
        >
          {/* "EXFILTRATE YOUR CODE" */}
          <div
            style={{
              opacity: exfilLabelOpacity,
              transform: `translateY(${exfilLabelSlide}px)`,
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: DANGER,
                letterSpacing: 2,
                textTransform: "uppercase",
                textShadow: `0 0 15px ${DANGER}40`,
              }}
            >
              EXFILTRATING CODE
            </span>
          </div>

          {/* Captured: Every file */}
          <div
            style={{
              opacity: fileIconOpacity,
              transform: `scale(${fileIconScale})`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 24px",
              background: `${DANGER}10`,
              border: `1px solid ${DANGER}25`,
              borderRadius: 10,
              boxShadow: `0 0 15px ${DANGER}15`,
            }}
          >
            <File size={24} color={DANGER} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 600,
                color: TEXT_PRIMARY,
              }}
            >
              Every file you open
            </span>
          </div>

          {/* Captured: Every keystroke */}
          <div
            style={{
              opacity: keystrokeOpacity,
              transform: `scale(${keystrokeScale})`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 24px",
              background: `${ACCENT}10`,
              border: `1px solid ${ACCENT}25`,
              borderRadius: 10,
              boxShadow: `0 0 15px ${ACCENT}15`,
            }}
          >
            <Keyboard size={24} color={ACCENT} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14,
                fontWeight: 600,
                color: TEXT_PRIMARY,
              }}
            >
              Every keystroke you type
            </span>
          </div>

          {/* Stream intensity indicator */}
          <div
            style={{
              width: 200,
              height: 4,
              background: "#1a1a2e",
              borderRadius: 2,
              overflow: "hidden",
              opacity: interpolate(frame, [1573, 1590], [0, 1], clamp),
            }}
          >
            <div
              style={{
                width: `${streamIntensity * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${DANGER}80, ${ACCENT}80)`,
                borderRadius: 2,
                boxShadow: `0 0 10px ${DANGER}40`,
              }}
            />
          </div>

          {/* "SILENTLY SENT" text */}
          <div
            style={{
              opacity: interpolate(frame, [1741, 1755], [0, 1], clamp),
              transform: `translateY(${slideUp(frame, 1741, 14)}px)`,
            }}
          >
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                color: `${DANGER}cc`,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              SILENTLY SENT
            </span>
          </div>
        </div>

        {/* RIGHT: Remote Server */}
        <div
          style={{
            opacity: serverOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 20,
              background: `${DANGER}${Math.round(5 + serverGlow * 10).toString(16).padStart(2, "0")}`,
              border: `2px solid ${DANGER}${Math.round(20 + serverGlow * 40).toString(16).padStart(2, "0")}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 ${20 + serverGlow * 40}px ${DANGER}${Math.round(serverGlow * 35).toString(16).padStart(2, "0")}`,
            }}
          >
            <CloudArrowUp
              size={52}
              color={DANGER}
              weight="duotone"
              style={{
                filter: `drop-shadow(0 0 15px ${DANGER}60)`,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              color: DANGER,
              letterSpacing: 1,
              opacity: interpolate(frame, [1775, 1790], [0, 1], clamp),
            }}
          >
            REMOTE SERVER
          </span>
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 11,
              color: TEXT_DIM,
              opacity: interpolate(frame, [1780, 1800], [0, 1], clamp),
            }}
          >
            attacker-controlled
          </span>
        </div>

        {/* Data particles */}
        {particleConfigs.map((p, i) => (
          <DataParticle
            key={i}
            frame={frame}
            startFrame={p.startFrame}
            startX={p.startX}
            startY={p.startY}
            endX={p.endX}
            endY={p.endY}
            color={p.color}
            size={p.size}
            duration={p.dur}
          />
        ))}
      </div>

      {/* ═══ SCENE 3: SENSITIVE DATA EXPOSED ════════════ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          opacity: scene3Opacity,
          padding: 80,
        }}
      >
        {/* Section title */}
        <div
          style={{
            opacity: fadeIn(frame, 1805, 15),
            transform: `translateY(${slideUp(frame, 1805, 15)}px)`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Warning size={28} color={DANGER} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: DANGER,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            YOUR DATA — EXPOSED
          </span>
        </div>

        {/* Sensitive data cards */}
        <div
          style={{
            display: "flex",
            gap: 40,
            alignItems: "stretch",
          }}
        >
          {/* Proprietary Code card */}
          <div
            style={{
              opacity: fadeIn(frame, 1830, 15),
              transform: `translateY(${slideUp(frame, 1830, 15)}px)`,
              width: 320,
              padding: "28px 24px",
              background: "#0c0c14",
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <File size={36} color={PRIMARY} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 15,
                fontWeight: 600,
                color: TEXT_PRIMARY,
              }}
            >
              Proprietary Code
            </span>
            {/* Placeholder code lines */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
              {[70, 55, 80, 45, 65].map((w, i) => (
                <div
                  key={i}
                  style={{
                    height: 8,
                    width: `${w}%`,
                    background: `${PRIMARY}15`,
                    borderRadius: 3,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                padding: "4px 12px",
                background: `${DANGER}10`,
                border: `1px solid ${DANGER}20`,
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 11,
                  color: DANGER,
                  fontWeight: 600,
                }}
              >
                STOLEN
              </span>
            </div>
          </div>

          {/* API Keys card */}
          <div
            style={{
              opacity: apiKeyOpacity,
              transform: `translateY(${apiKeySlide}px)`,
              width: 320,
              padding: "28px 24px",
              background: "#0c0c14",
              border: `1px solid ${DANGER}${Math.round(15 + apiKeyGlow * 30).toString(16).padStart(2, "0")}`,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              boxShadow: `0 0 ${apiKeyGlow * 25}px ${DANGER}${Math.round(apiKeyGlow * 20).toString(16).padStart(2, "0")}`,
            }}
          >
            <Key
              size={36}
              color={ACCENT}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 10px ${ACCENT}60)` }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 15,
                fontWeight: 600,
                color: TEXT_PRIMARY,
              }}
            >
              API Keys
            </span>
            {/* Fake API key values */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  padding: "6px 12px",
                  background: `${ACCENT}08`,
                  border: `1px solid ${ACCENT}15`,
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: ACCENT,
                  }}
                >
                  sk-proj-a8f3...x9k2
                </span>
              </div>
              <div
                style={{
                  padding: "6px 12px",
                  background: `${CYAN}08`,
                  border: `1px solid ${CYAN}15`,
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: CYAN,
                  }}
                >
                  STRIPE_KEY=rk_live...
                </span>
              </div>
            </div>
            <div
              style={{
                padding: "4px 12px",
                background: `${DANGER}15`,
                border: `1px solid ${DANGER}30`,
                borderRadius: 6,
                boxShadow: `0 0 10px ${DANGER}20`,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 11,
                  color: DANGER,
                  fontWeight: 700,
                }}
              >
                COMPROMISED
              </span>
            </div>
          </div>

          {/* Environment Variables card */}
          <div
            style={{
              opacity: envVarOpacity,
              transform: `translateY(${envVarSlide}px)`,
              width: 320,
              padding: "28px 24px",
              background: "#0c0c14",
              border: `1px solid ${DANGER}${Math.round(15 + envVarGlow * 30).toString(16).padStart(2, "0")}`,
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              boxShadow: `0 0 ${envVarGlow * 25}px ${DANGER}${Math.round(envVarGlow * 20).toString(16).padStart(2, "0")}`,
            }}
          >
            <Terminal
              size={36}
              color={CYAN}
              weight="duotone"
              style={{ filter: `drop-shadow(0 0 10px ${CYAN}60)` }}
            />
            <span
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 15,
                fontWeight: 600,
                color: TEXT_PRIMARY,
              }}
            >
              Environment Variables
            </span>
            {/* Fake env vars */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  padding: "6px 12px",
                  background: `${CYAN}08`,
                  border: `1px solid ${CYAN}15`,
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: CYAN,
                  }}
                >
                  DATABASE_URL=postgres://...
                </span>
              </div>
              <div
                style={{
                  padding: "6px 12px",
                  background: `${ACCENT}08`,
                  border: `1px solid ${ACCENT}15`,
                  borderRadius: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 12,
                    color: ACCENT,
                  }}
                >
                  AWS_SECRET=AKIA3...
                </span>
              </div>
            </div>
            <div
              style={{
                padding: "4px 12px",
                background: `${DANGER}15`,
                border: `1px solid ${DANGER}30`,
                borderRadius: 6,
                boxShadow: `0 0 10px ${DANGER}20`,
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 11,
                  color: DANGER,
                  fontWeight: 700,
                }}
              >
                COMPROMISED
              </span>
            </div>
          </div>
        </div>

        {/* Bottom warning */}
        <div
          style={{
            opacity: interpolate(frame, [1970, 1990], [0, 1], clamp),
            transform: `translateY(${slideUp(frame, 1970, 20)}px)`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 28px",
            background: `${DANGER}08`,
            border: `1px solid ${DANGER}20`,
            borderRadius: 10,
            boxShadow: `0 0 ${finalPulse * 20}px ${DANGER}15`,
          }}
        >
          <Lock size={20} color={DANGER} weight="duotone" />
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              color: TEXT_PRIMARY,
            }}
          >
            All of it — exfiltrated silently
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_CodeExfiltration;
