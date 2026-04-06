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

const easeOutCubic = Easing.out(Easing.cubic);
const easeInQuad = Easing.in(Easing.quad);

// ─── Brand Colors ────────────────────────────────────────
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const BG = "#030305";
const DARK_BG = "#0f0f1a";
const RED = "#ef4444";
const GREEN = "#22c55e";
const PURPLE = "#a855f7";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

// ─── Key Timestamps (GLOBAL frames from voiceover) ──────
const F_START = 473;
const F_BREAK_DOWN = 481;
const F_VSCODE_EXT_START = 496;
const F_VSCODE_EXT_END = 531;
const F_NODEJS_START = 657;
const F_NODEJS_END = 689;
const F_NO_SANDBOX = 835;
const F_READ_FILE = 894;
const F_SHELL_CMD = 965;
const F_NETWORK_REQ = 1022;
const F_NO_PERMISSION = 1095;
const F_NO_CONFIRM = 1125;
const F_FULL_ACCESS = 1279;
const F_END = 1345;

// ─── Helpers ─────────────────────────────────────────────
const fadeIn = (frame: number, start: number, dur = 15) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeOutCubic });

const slideUp = (frame: number, start: number, dur = 15, dist = 20) =>
  interpolate(frame, [start, start + dur], [dist, 0], { ...clamp, easing: easeOutCubic });

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], { ...clamp, easing: easeInQuad });

// ─── Scene boundaries ────────────────────────────────────
const SCENE1_END = 830;
const SCENE2_START = 810;
const SCENE2_END = 1180;
const SCENE3_START = 1160;

// ═══════════════════════════════════════════════════════════
// SCENE 1: Extension Install → Node.js Process Spawn
// ═══════════════════════════════════════════════════════════
const Scene1_Spawn: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const CodeIcon = getIcon("Code");
  const PuzzlePieceIcon = getIcon("PuzzlePiece");
  const NodeJsIcon = getIcon("Cpu");
  const CursorClickIcon = getIcon("CursorClick");

  // 🔊 SOUND: scene_start @ frame 473 — segment opens, dark screen
  const titleOp = fadeIn(frame, F_START, 20);
  const titleY = slideUp(frame, F_START, 20);

  // 🔊 SOUND: element_appear @ frame 496 — VS Code icon slides in
  const vscodeOp = fadeIn(frame, F_VSCODE_EXT_START, 18);
  const vscodeScale = spring({
    frame: Math.max(0, frame - F_VSCODE_EXT_START),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // Extension puzzle piece appears
  // 🔊 SOUND: element_appear @ frame 520 — extension puzzle icon pops in
  const extOp = fadeIn(frame, F_VSCODE_EXT_START + 24, 15);
  const extY = slideUp(frame, F_VSCODE_EXT_START + 24, 15);

  // "Install" click animation
  // 🔊 SOUND: reveal @ frame 570 — install button click pulse
  const clickFrame = 570;
  const clickOp = interpolate(frame, [clickFrame, clickFrame + 12], [0, 1], clamp);
  const clickPulseScale = interpolate(frame, [clickFrame + 5, clickFrame + 25], [1, 2.2], { ...clamp, easing: easeOutCubic });
  const clickPulseOp = interpolate(frame, [clickFrame + 5, clickFrame + 25], [0.7, 0], clamp);

  // Connector pulse traveling from VS Code to Node.js
  // 🔊 SOUND: element_appear @ frame 620 — data pulse travels right
  const pulseProgress = interpolate(frame, [600, 650], [0, 1], { ...clamp, easing: easeOutCubic });
  const pulseOp = interpolate(frame, [600, 615], [0, 0.9], clamp) * interpolate(frame, [640, 655], [1, 0], clamp);

  // 🔊 SOUND: reveal @ frame 657 — Node.js process bubble spawns with spring
  const nodeOp = fadeIn(frame, F_NODEJS_START, 18);
  const nodeScale = spring({
    frame: Math.max(0, frame - F_NODEJS_START),
    fps,
    config: { damping: 20, stiffness: 160 },
  });

  // "No sandboxing" label
  // 🔊 SOUND: reveal @ frame 730 — "process" label fades in under Node
  const processLabelOp = fadeIn(frame, F_NODEJS_START + 20, 15);

  // "Spawns for it" descriptor
  const spawnOp = fadeIn(frame, F_NODEJS_END + 10, 15);
  const spawnY = slideUp(frame, F_NODEJS_END + 10, 15);

  // Warning badge: "No Sandboxing"
  // 🔊 SOUND: reveal @ frame 780 — warning badge appears: no sandboxing
  const warnOp = fadeIn(frame, 780, 18);
  const warnScale = spring({
    frame: Math.max(0, frame - 780),
    fps,
    config: { damping: 20, stiffness: 200 },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48 }}>
      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, textAlign: "center" }}>
        <span style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 14,
          fontWeight: 600,
          color: PRIMARY,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}>
          Under The Hood
        </span>
      </div>

      {/* Main content: VS Code → Node.js Process */}
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        {/* VS Code + Extension */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          opacity: vscodeOp, transform: `scale(${vscodeScale})`,
        }}>
          <div style={{
            width: 120, height: 120, borderRadius: 24,
            background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}08)`,
            border: `2px solid ${PRIMARY}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 30px ${PRIMARY}15`,
            position: "relative",
          }}>
            <CodeIcon size={52} color={PRIMARY} weight="duotone" />
            {/* Extension badge */}
            <div style={{
              position: "absolute", top: -8, right: -8,
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}10)`,
              border: `1.5px solid ${ACCENT}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: extOp, transform: `translateY(${extY}px)`,
            }}>
              <PuzzlePieceIcon size={18} color={ACCENT} weight="duotone" />
            </div>
          </div>
          <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>VS Code</span>
          <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 500 }}>Extension Host</span>
        </div>

        {/* Install click button */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative",
        }}>
          <div style={{
            padding: "12px 28px", borderRadius: 10,
            background: frame >= clickFrame ? `${GREEN}20` : `${GREEN}12`,
            border: `1.5px solid ${GREEN}40`,
            opacity: clickOp,
            position: "relative",
          }}>
            {/* Pulse ring */}
            {frame >= clickFrame + 5 && (
              <div style={{
                position: "absolute", inset: -4, borderRadius: 14,
                border: `2px solid ${GREEN}`,
                transform: `scale(${clickPulseScale})`,
                opacity: clickPulseOp,
              }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CursorClickIcon size={20} color={GREEN} weight="duotone" />
              <span style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14, fontWeight: 700, color: GREEN,
              }}>
                Install
              </span>
            </div>
          </div>

          {/* Traveling pulse dot */}
          <div style={{
            width: 200, height: 4, background: `${PRIMARY}15`, borderRadius: 2,
            position: "relative", marginTop: 12,
          }}>
            <div style={{
              position: "absolute", top: -4,
              left: `${pulseProgress * 100}%`,
              width: 12, height: 12, borderRadius: "50%",
              background: PRIMARY,
              boxShadow: `0 0 15px ${PRIMARY}80`,
              opacity: pulseOp,
              transform: "translateX(-50%)",
            }} />
          </div>
          <span style={{
            color: TEXT_DIM, fontSize: 12, fontWeight: 500,
            opacity: spawnOp, transform: `translateY(${spawnY}px)`,
            fontFamily: "'SF Mono', monospace",
          }}>
            spawns process
          </span>
        </div>

        {/* Node.js Process */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          opacity: nodeOp, transform: `scale(${nodeScale})`,
        }}>
          <div style={{
            width: 140, height: 140, borderRadius: 28,
            background: `linear-gradient(135deg, ${GREEN}15, ${SECONDARY}08)`,
            border: `2px solid ${GREEN}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 35px ${GREEN}12`,
          }}>
            <NodeJsIcon size={56} color={GREEN} weight="duotone" />
          </div>
          <span style={{
            color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600,
            opacity: processLabelOp,
          }}>
            Node.js Process
          </span>
          <span style={{
            color: TEXT_DIM, fontSize: 13, fontWeight: 500,
            opacity: processLabelOp,
          }}>
            Extension Runtime
          </span>
        </div>
      </div>

      {/* Warning badge: NO SANDBOXING */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 32px", borderRadius: 12,
        background: `${RED}10`,
        border: `1.5px solid ${RED}30`,
        boxShadow: `0 0 25px ${RED}12`,
        opacity: warnOp,
        transform: `scale(${warnScale})`,
      }}>
        {(() => { const ShieldSlashIcon = getIcon("ShieldSlash"); return <ShieldSlashIcon size={28} color={RED} weight="duotone" />; })()}
        <span style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 18, fontWeight: 700, color: RED,
          letterSpacing: 1,
        }}>
          ALMOST NO SANDBOXING
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Three Threat Vectors (file, shell, network)
// ═══════════════════════════════════════════════════════════
const Scene2_Threats: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const NodeIcon = getIcon("Cpu");
  const FileSearchIcon = getIcon("FileSearch");
  const TerminalIcon = getIcon("Terminal");
  const GlobeIcon = getIcon("Globe");
  const WarningIcon = getIcon("Warning");

  // Central Node.js process (persists from scene 1)
  // 🔊 SOUND: transition @ frame 830 — scene crossfades to threat view
  const centerOp = fadeIn(frame, SCENE2_START, 20);
  const centerScale = spring({
    frame: Math.max(0, frame - SCENE2_START),
    fps,
    config: { damping: 22, stiffness: 160 },
  });

  // Threat 1: Read any file
  // 🔊 SOUND: element_appear @ frame 894 — file access icon fans out left
  const file_op = fadeIn(frame, F_READ_FILE, 18);
  const file_x = interpolate(frame, [F_READ_FILE, F_READ_FILE + 20], [-40, 0], { ...clamp, easing: easeOutCubic });
  const file_glow = interpolate(frame, [F_READ_FILE + 15, F_READ_FILE + 35], [0, 25], clamp);

  // Threat 2: Shell commands
  // 🔊 SOUND: element_appear @ frame 965 — terminal icon fans out right
  const shell_op = fadeIn(frame, F_SHELL_CMD, 18);
  const shell_y = slideUp(frame, F_SHELL_CMD, 18, 30);
  const shell_glow = interpolate(frame, [F_SHELL_CMD + 15, F_SHELL_CMD + 35], [0, 25], clamp);

  // Threat 3: Network requests
  // 🔊 SOUND: element_appear @ frame 1022 — network globe icon fans out
  const net_op = fadeIn(frame, F_NETWORK_REQ, 18);
  const net_x = interpolate(frame, [F_NETWORK_REQ, F_NETWORK_REQ + 20], [40, 0], { ...clamp, easing: easeOutCubic });
  const net_glow = interpolate(frame, [F_NETWORK_REQ + 15, F_NETWORK_REQ + 35], [0, 25], clamp);

  // Expanding threat ring around center
  const ringProgress = interpolate(frame, [F_READ_FILE, F_NETWORK_REQ + 40], [0, 1], { ...clamp, easing: easeOutCubic });
  const ringOp = interpolate(frame, [F_READ_FILE, F_READ_FILE + 15], [0, 0.3], clamp);
  const ringRadius = interpolate(ringProgress, [0, 1], [80, 260], clamp);

  // "No permission popup" warning at bottom
  // 🔊 SOUND: reveal @ frame 1095 — "no permission" warning appears
  const noPermOp = fadeIn(frame, F_NO_PERMISSION, 18);
  const noPermY = slideUp(frame, F_NO_PERMISSION, 18);

  // "No confirmation dialog" strikethrough
  const noConfirmOp = fadeIn(frame, F_NO_CONFIRM, 15);

  const threats = [
    {
      icon: "FileSearch", label: "Read Any File", sub: "Full disk access",
      color: RED, op: file_op, x: file_x, y: 0, glow: file_glow,
      posStyle: { left: 180, top: 120 } as React.CSSProperties,
    },
    {
      icon: "Terminal", label: "Execute Commands", sub: "Shell access",
      color: ACCENT, op: shell_op, x: 0, y: shell_y, glow: shell_glow,
      posStyle: { left: 680, top: 40 } as React.CSSProperties,
    },
    {
      icon: "Globe", label: "Network Requests", sub: "Any server, any data",
      color: PURPLE, op: net_op, x: net_x, y: 0, glow: net_glow,
      posStyle: { right: 180, top: 120 } as React.CSSProperties,
    },
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 40, width: "100%", position: "relative",
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        opacity: centerOp,
      }}>
        <span style={{
          fontFamily: "'SF Mono', monospace", fontSize: 13,
          fontWeight: 600, color: RED, letterSpacing: 2,
          textTransform: "uppercase",
        }}>
          What It Can Do
        </span>
      </div>

      {/* Central layout: Node process in middle, threats around it */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 80, position: "relative", width: "100%",
      }}>
        {/* Threat 1: Files (left) */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          opacity: threats[0].op, transform: `translateX(${threats[0].x}px)`,
        }}>
          {(() => { const Icon = getIcon(threats[0].icon); return (
            <div style={{
              width: 100, height: 100, borderRadius: 20,
              background: `linear-gradient(135deg, ${threats[0].color}18, ${threats[0].color}06)`,
              border: `1.5px solid ${threats[0].color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 ${threats[0].glow}px ${threats[0].color}30`,
            }}>
              <Icon size={42} color={threats[0].color} weight="duotone" />
            </div>
          ); })()}
          <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>{threats[0].label}</span>
          <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 500 }}>{threats[0].sub}</span>
        </div>

        {/* Center: Node.js process */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          opacity: centerOp, transform: `scale(${centerScale})`,
          position: "relative",
        }}>
          {/* Expanding threat ring */}
          <div style={{
            position: "absolute",
            width: ringRadius * 2, height: ringRadius * 2,
            borderRadius: "50%",
            border: `2px solid ${RED}`,
            opacity: ringOp,
            top: "50%", left: "50%",
            transform: "translate(-50%, -60%)",
            boxShadow: `0 0 20px ${RED}15, inset 0 0 20px ${RED}08`,
          }} />
          <div style={{
            width: 120, height: 120, borderRadius: 24,
            background: `linear-gradient(135deg, ${GREEN}15, ${SECONDARY}08)`,
            border: `2px solid ${GREEN}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 30px ${GREEN}10`,
            zIndex: 2,
          }}>
            <NodeIcon size={48} color={GREEN} weight="duotone" />
          </div>
          <span style={{ color: TEXT_PRIMARY, fontSize: 15, fontWeight: 600, zIndex: 2 }}>
            Extension Process
          </span>
        </div>

        {/* Threat 2: Shell (top-right area, rendered as right column) */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          opacity: threats[1].op, transform: `translateY(${threats[1].y}px)`,
        }}>
          {(() => { const Icon = getIcon(threats[1].icon); return (
            <div style={{
              width: 100, height: 100, borderRadius: 20,
              background: `linear-gradient(135deg, ${threats[1].color}18, ${threats[1].color}06)`,
              border: `1.5px solid ${threats[1].color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 ${threats[1].glow}px ${threats[1].color}30`,
            }}>
              <Icon size={42} color={threats[1].color} weight="duotone" />
            </div>
          ); })()}
          <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>{threats[1].label}</span>
          <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 500 }}>{threats[1].sub}</span>
        </div>

        {/* Threat 3: Network (right) */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          opacity: threats[2].op, transform: `translateX(${threats[2].x}px)`,
        }}>
          {(() => { const Icon = getIcon(threats[2].icon); return (
            <div style={{
              width: 100, height: 100, borderRadius: 20,
              background: `linear-gradient(135deg, ${threats[2].color}18, ${threats[2].color}06)`,
              border: `1.5px solid ${threats[2].color}35`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 ${threats[2].glow}px ${threats[2].color}30`,
            }}>
              <Icon size={42} color={threats[2].color} weight="duotone" />
            </div>
          ); })()}
          <span style={{ color: TEXT_PRIMARY, fontSize: 16, fontWeight: 600 }}>{threats[2].label}</span>
          <span style={{ color: TEXT_DIM, fontSize: 13, fontWeight: 500 }}>{threats[2].sub}</span>
        </div>
      </div>

      {/* No permission popup / No confirmation dialog */}
      <div style={{
        display: "flex", alignItems: "center", gap: 24, marginTop: 20,
        opacity: noPermOp, transform: `translateY(${noPermY}px)`,
      }}>
        {/* Fake dialog mockup crossed out */}
        <div style={{
          padding: "16px 28px", borderRadius: 12,
          background: `${TEXT_DIM}08`,
          border: `1px dashed ${TEXT_DIM}30`,
          position: "relative",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <WarningIcon size={22} color={TEXT_DIM} weight="duotone" />
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14, fontWeight: 500, color: TEXT_DIM,
            textDecoration: "line-through",
            opacity: noConfirmOp,
          }}>
            Allow extension to access files?
          </span>
          {/* Strike line */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: noConfirmOp,
          }}>
            <div style={{
              width: "110%", height: 3, background: RED,
              borderRadius: 2, opacity: 0.6,
              transform: "rotate(-3deg)",
            }} />
          </div>
        </div>
        <span style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 15, fontWeight: 700, color: RED,
        }}>
          No permission popup
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: "You click install — Full Access"
// ═══════════════════════════════════════════════════════════
const Scene3_FullAccess: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const ShieldWarningIcon = getIcon("ShieldWarning");
  const LockKeyOpenIcon = getIcon("LockKeyOpen");
  const CursorClickIcon = getIcon("CursorClick");

  // 🔊 SOUND: transition @ frame 1160 — scene transitions to final reveal

  // "You click install" reminder
  const clickOp = fadeIn(frame, SCENE3_START + 10, 18);
  const clickY = slideUp(frame, SCENE3_START + 10, 18);

  // Access items appearing staggered
  const accessItems = [
    { label: "File System", color: RED },
    { label: "Shell Access", color: ACCENT },
    { label: "Network", color: PURPLE },
    { label: "Your Data", color: SECONDARY },
  ];

  // 🔊 SOUND: staggered_group @ frame 1200 — access items pop in one by one
  const itemsStartFrame = 1200;

  // 🔊 SOUND: reveal @ frame 1279 — FULL ACCESS stamp scales in dramatically
  const stampOp = fadeIn(frame, F_FULL_ACCESS, 15);
  const stampScale = spring({
    frame: Math.max(0, frame - F_FULL_ACCESS),
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  const stampGlow = interpolate(frame, [F_FULL_ACCESS + 10, F_FULL_ACCESS + 40], [0, 40], clamp);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 48, width: "100%",
    }}>
      {/* "You click install" */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        opacity: clickOp, transform: `translateY(${clickY}px)`,
      }}>
        <CursorClickIcon size={28} color={TEXT_DIM} weight="duotone" />
        <span style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 20, fontWeight: 600, color: TEXT_DIM,
        }}>
          You click install...
        </span>
      </div>

      {/* Access items in a row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 24,
      }}>
        {accessItems.map((item, i) => {
          const itemOp = fadeIn(frame, itemsStartFrame + i * 12, 15);
          const itemScale = spring({
            frame: Math.max(0, frame - (itemsStartFrame + i * 12)),
            fps,
            config: { damping: 22, stiffness: 200 },
          });
          return (
            <div key={item.label} style={{
              padding: "16px 24px", borderRadius: 12,
              background: `${item.color}10`,
              border: `1px solid ${item.color}25`,
              opacity: itemOp,
              transform: `scale(${itemScale})`,
            }}>
              <span style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 14, fontWeight: 600, color: item.color,
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* FULL ACCESS stamp */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        opacity: stampOp,
        transform: `scale(${stampScale})`,
      }}>
        <div style={{
          padding: "24px 56px", borderRadius: 16,
          background: `${RED}12`,
          border: `3px solid ${RED}50`,
          boxShadow: `0 0 ${stampGlow}px ${RED}25, inset 0 0 ${stampGlow * 0.5}px ${RED}08`,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <LockKeyOpenIcon size={40} color={RED} weight="duotone" style={{
            filter: `drop-shadow(0 0 10px ${RED}60)`,
          }} />
          <span style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 32, fontWeight: 800, color: RED,
            letterSpacing: 3,
            textShadow: `0 0 20px ${RED}40`,
          }}>
            FULL ACCESS
          </span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <ShieldWarningIcon size={20} color={TEXT_DIM} weight="duotone" />
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14, fontWeight: 500, color: TEXT_DIM,
          }}>
            No confirmation, no restrictions
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_UnderTheHood: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene crossfade opacities
  const scene1Op = interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op = interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp)
    * interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Op = interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

  // Subtle background glow that intensifies as threats mount
  const bgGlowIntensity = interpolate(frame, [F_READ_FILE, F_FULL_ACCESS], [0, 0.15], clamp);

  return (
    <div style={{
      width: 1920, height: 1080,
      background: DARK_BG,
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background subtle radial threat glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at center, ${RED}${Math.round(bgGlowIntensity * 99).toString().padStart(2, '0')} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* ════════════ SCENE 1: Extension → Process ════════════ */}
      {frame < SCENE1_END && (
        <div style={{
          position: "absolute", inset: 0, padding: 80,
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          opacity: scene1Op,
        }}>
          <Scene1_Spawn frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 2: Threat Vectors ════════════ */}
      {frame >= SCENE2_START && frame < SCENE2_END && (
        <div style={{
          position: "absolute", inset: 0, padding: 80,
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          opacity: scene2Op,
        }}>
          <Scene2_Threats frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════════ SCENE 3: Full Access ════════════ */}
      {frame >= SCENE3_START && (
        <div style={{
          position: "absolute", inset: 0, padding: 80,
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          opacity: scene3Op,
        }}>
          <Scene3_FullAccess frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

export default Generated_UnderTheHood;
