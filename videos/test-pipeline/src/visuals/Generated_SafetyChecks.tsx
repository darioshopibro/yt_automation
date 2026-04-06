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

// ── Colors (brand) ───────────────────────────────────────
const BG = "#030305";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const SUCCESS = "#22c55e";
const ERROR = "#ef4444";
const TEXT_PRIMARY = "#e2e8f0";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

// ── Global frame timestamps from voiceover ───────────────
// "what should you do" @ 3684
const TITLE_START = 3678;
// "Check three things" @ 3748
const THREE_THINGS = 3748;
// "installing any extension" @ 3786
const INSTALLING = 3786;

// CHECK 1: Publisher
// "One, look at the publisher" @ 3835
const CHECK1_START = 3830;
// "blue checkmark" @ 3945
const BLUE_CHECK = 3945;

// CHECK 2: Source code
// "Two, check the source code" @ 3993
const CHECK2_START = 3988;
// "GitHub repo" @ 4112
const GITHUB_REPO = 4112;
// "no repo, red flag" @ 4196
const RED_FLAG = 4196;

// CHECK 3: Permissions
// "Three, review the permissions" @ 4271
const CHECK3_START = 4266;
// "package.json manifest" @ 4342
const PACKAGE_JSON = 4342;
// "color theme extension" @ 4440
const COLOR_THEME = 4440;
// "terminal access" @ 4496
const TERMINAL_ACCESS = 4496;
// "something is very wrong" @ 4548
const VERY_WRONG = 4548;

// ── Check Number Badge ───────────────────────────────────
const CheckNumber: React.FC<{
  num: number;
  color: string;
  opacity: number;
  scale: number;
  active: boolean;
  completed: boolean;
}> = ({ num, color, opacity, scale, active, completed }) => {
  const CheckCircle = getIcon("CheckCircle");
  return (
    <div style={{
      opacity,
      transform: `scale(${scale})`,
      width: 56,
      height: 56,
      borderRadius: 28,
      background: completed ? `${SUCCESS}20` : active ? `${color}18` : `${color}08`,
      border: `2.5px solid ${completed ? SUCCESS : color}${active ? "70" : "30"}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: active ? `0 0 25px ${color}30` : "none",
      flexShrink: 0,
    }}>
      {completed ? (
        <CheckCircle size={30} color={SUCCESS} weight="fill" />
      ) : (
        <span style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 24,
          fontWeight: 700,
          color: active ? color : `${color}80`,
        }}>
          {num}
        </span>
      )}
    </div>
  );
};

// ── Check Card Component ─────────────────────────────────
const CheckCard: React.FC<{
  title: string;
  color: string;
  iconName: string;
  opacity: number;
  translateY: number;
  active: boolean;
  children: React.ReactNode;
}> = ({ title, color, iconName, opacity, translateY, active, children }) => {
  const Icon = getIcon(iconName);
  return (
    <div style={{
      opacity,
      transform: `translateY(${translateY}px)`,
      background: active ? `${color}08` : `${color}04`,
      border: `1.5px solid ${active ? color : color + "20"}`,
      borderRadius: 12,
      padding: "28px 32px",
      width: "100%",
      boxShadow: active ? `0 0 30px ${color}15` : "none",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 20,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1.5px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 15px ${color}15`,
        }}>
          <Icon size={24} color={color} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
        </div>
        <span style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          color: TEXT_PRIMARY,
        }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Generated_SafetyChecks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── INTRO: Title + "3 Safety Checks" ─────────────────
  // 🔊 SOUND: scene_start @ frame 3678 — segment opens, shield icon + title fades in
  const titleOp = fadeIn(frame, TITLE_START, 20);
  const titleY = slideUp(frame, TITLE_START, 20);

  // 🔊 SOUND: element_appear @ frame 3748 — "Check three things" subtitle pops in
  const subtitleOp = fadeIn(frame, THREE_THINGS);
  const subtitleY = slideUp(frame, THREE_THINGS);

  // Title fades to top after intro
  const titleShrink = interpolate(frame, [CHECK1_START - 10, CHECK1_START + 5], [1, 0.85], { ...clamp });
  const titleMoveUp = interpolate(frame, [CHECK1_START - 10, CHECK1_START + 5], [0, -20], { ...clamp });

  // ─── CHECK 1: Publisher Verification ──────────────────
  const check1Active = frame >= CHECK1_START && frame < CHECK2_START;
  const check1Completed = frame >= CHECK2_START;

  // 🔊 SOUND: element_appear @ frame 3830 — Check 1 card slides in from below
  const check1Op = fadeIn(frame, CHECK1_START, 18);
  const check1Y = slideUp(frame, CHECK1_START, 18);
  const check1NumScale = spring({ frame: Math.max(0, frame - CHECK1_START), fps, config: { damping: 20, stiffness: 200 } });

  // Publisher name placeholder
  // 🔊 SOUND: element_appear @ frame 3860 — publisher name row appears
  const publisherRowOp = fadeIn(frame, CHECK1_START + 30);
  const publisherRowY = slideUp(frame, CHECK1_START + 30);

  // 🔊 SOUND: reveal @ frame 3945 — blue checkmark badge pops in with spring
  const checkmarkOp = fadeIn(frame, BLUE_CHECK, 12);
  const checkmarkScale = spring({ frame: Math.max(0, frame - BLUE_CHECK), fps, config: { damping: 18, stiffness: 220 } });

  // Dim check 1 when check 2 starts
  const check1Dim = interpolate(frame, [CHECK2_START, CHECK2_START + 15], [1, 0.55], { ...clamp });

  // ─── CHECK 2: Source Code / GitHub ────────────────────
  const check2Active = frame >= CHECK2_START && frame < CHECK3_START;
  const check2Completed = frame >= CHECK3_START;

  // 🔊 SOUND: element_appear @ frame 3988 — Check 2 card slides in
  const check2Op = fadeIn(frame, CHECK2_START, 18);
  const check2Y = slideUp(frame, CHECK2_START, 18);
  const check2NumScale = spring({ frame: Math.max(0, frame - CHECK2_START), fps, config: { damping: 20, stiffness: 200 } });

  // GitHub repo row — good state
  // 🔊 SOUND: element_appear @ frame 4112 — GitHub repo link appears (green = good)
  const repoGoodOp = fadeIn(frame, GITHUB_REPO);
  const repoGoodY = slideUp(frame, GITHUB_REPO);

  // Red flag — no repo
  // 🔊 SOUND: reveal @ frame 4196 — "No repo" red flag warning pops in
  const redFlagOp = fadeIn(frame, RED_FLAG);
  const redFlagScale = spring({ frame: Math.max(0, frame - RED_FLAG), fps, config: { damping: 18, stiffness: 220 } });

  // Red flag pulse glow
  const redFlagPulse = interpolate(
    frame,
    [RED_FLAG + 15, RED_FLAG + 30, RED_FLAG + 45, RED_FLAG + 60],
    [15, 25, 15, 25],
    { ...clamp }
  );

  // Dim check 2 when check 3 starts
  const check2Dim = interpolate(frame, [CHECK3_START, CHECK3_START + 15], [1, 0.55], { ...clamp });

  // ─── CHECK 3: Permissions Audit ───────────────────────
  const check3Active = frame >= CHECK3_START;

  // 🔊 SOUND: element_appear @ frame 4266 — Check 3 card slides in
  const check3Op = fadeIn(frame, CHECK3_START, 18);
  const check3Y = slideUp(frame, CHECK3_START, 18);
  const check3NumScale = spring({ frame: Math.max(0, frame - CHECK3_START), fps, config: { damping: 20, stiffness: 200 } });

  // package.json manifest reference
  // 🔊 SOUND: element_appear @ frame 4342 — package.json code block appears
  const manifestOp = fadeIn(frame, PACKAGE_JSON);
  const manifestY = slideUp(frame, PACKAGE_JSON);

  // Color theme line
  // 🔊 SOUND: element_appear @ frame 4440 — "Color Theme" permission row fades in
  const colorThemeOp = fadeIn(frame, COLOR_THEME);

  // Terminal access — DANGER
  // 🔊 SOUND: reveal @ frame 4496 — "Terminal Access" danger row appears with red glow
  const terminalOp = fadeIn(frame, TERMINAL_ACCESS);
  const terminalScale = spring({ frame: Math.max(0, frame - TERMINAL_ACCESS), fps, config: { damping: 18, stiffness: 220 } });

  // "Something is very wrong" — big warning
  // 🔊 SOUND: reveal @ frame 4548 — full warning banner scales in — dramatic moment
  const warningOp = fadeIn(frame, VERY_WRONG, 12);
  const warningScale = spring({ frame: Math.max(0, frame - VERY_WRONG), fps, config: { damping: 20, stiffness: 180 } });

  // Warning glow pulse
  const warningGlow = interpolate(
    frame,
    [VERY_WRONG + 12, VERY_WRONG + 30, VERY_WRONG + 48, VERY_WRONG + 66],
    [20, 35, 20, 35],
    { ...clamp }
  );

  // ─── Icons ────────────────────────────────────────────
  const ShieldCheck = getIcon("ShieldCheck");
  const SealCheck = getIcon("SealCheck");
  const GithubLogo = getIcon("GithubLogo");
  const Warning = getIcon("Warning");
  const XCircle = getIcon("XCircle");
  const Terminal = getIcon("Terminal");
  const Palette = getIcon("Palette");
  const FileCode = getIcon("FileCode");
  const Flag = getIcon("Flag");

  return (
    <div style={{
      width: 1920,
      height: 1080,
      background: BG,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "60px 120px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* ─── Background subtle gradient ──────────────────── */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, ${PRIMARY}06 0%, transparent 60%)`,
        pointerEvents: "none",
      }} />

      {/* ─── Title Section ───────────────────────────────── */}
      <div style={{
        opacity: titleOp,
        transform: `translateY(${titleY + titleMoveUp}px) scale(${titleShrink})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ShieldCheck size={40} color={PRIMARY} weight="duotone" style={{ filter: `drop-shadow(0 0 12px ${PRIMARY}60)` }} />
          <span style={{
            fontSize: 32,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            letterSpacing: -0.5,
          }}>
            3 Safety Checks
          </span>
        </div>
        <span style={{
          opacity: subtitleOp,
          transform: `translateY(${subtitleY}px)`,
          fontSize: 16,
          fontWeight: 500,
          color: TEXT_DIM,
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          Before installing any extension
        </span>
      </div>

      {/* ─── Checks Container ────────────────────────────── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
        maxWidth: 1400,
        flex: 1,
      }}>

        {/* ═══ CHECK 1: Publisher ═════════════════════════ */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          opacity: check1Op * (check1Completed ? check1Dim : 1),
          transform: `translateY(${check1Y}px)`,
        }}>
          <CheckNumber
            num={1}
            color={PRIMARY}
            opacity={1}
            scale={check1NumScale}
            active={check1Active}
            completed={check1Completed}
          />
          <CheckCard
            title="Look at the Publisher"
            color={PRIMARY}
            iconName="User"
            opacity={1}
            translateY={0}
            active={check1Active}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: publisherRowOp,
              transform: `translateY(${publisherRowY}px)`,
            }}>
              {/* Publisher example */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                background: `${PRIMARY}10`,
                borderRadius: 10,
                border: `1px solid ${PRIMARY}20`,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${PRIMARY}30, ${SECONDARY}20)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: 16,
                    fontWeight: 700,
                    color: PRIMARY,
                  }}>
                    MS
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: TEXT_PRIMARY,
                  }}>
                    Microsoft
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: TEXT_DIM,
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    Publisher
                  </span>
                </div>

                {/* Blue checkmark — appears at BLUE_CHECK */}
                <div style={{
                  opacity: checkmarkOp,
                  transform: `scale(${checkmarkScale})`,
                  marginLeft: 8,
                }}>
                  <SealCheck size={32} color={PRIMARY} weight="fill" style={{
                    filter: `drop-shadow(0 0 10px ${PRIMARY}80)`,
                  }} />
                </div>
              </div>

              {/* Verified badge label */}
              <div style={{
                opacity: checkmarkOp,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                background: `${SUCCESS}10`,
                borderRadius: 8,
                border: `1px solid ${SUCCESS}25`,
              }}>
                <SealCheck size={20} color={SUCCESS} weight="fill" />
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: SUCCESS,
                  fontFamily: "'SF Mono', monospace",
                }}>
                  VERIFIED
                </span>
              </div>
            </div>
          </CheckCard>
        </div>

        {/* ═══ CHECK 2: Source Code ═══════════════════════ */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          opacity: check2Op * (check2Completed ? check2Dim : 1),
          transform: `translateY(${check2Y}px)`,
        }}>
          <CheckNumber
            num={2}
            color={SUCCESS}
            opacity={1}
            scale={check2NumScale}
            active={check2Active}
            completed={check2Completed}
          />
          <CheckCard
            title="Check the Source Code"
            color={SUCCESS}
            iconName="Code"
            opacity={1}
            translateY={0}
            active={check2Active}
          >
            <div style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
            }}>
              {/* Good: Has GitHub repo */}
              <div style={{
                opacity: repoGoodOp,
                transform: `translateY(${repoGoodY}px)`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                background: `${SUCCESS}10`,
                borderRadius: 10,
                border: `1px solid ${SUCCESS}25`,
              }}>
                <GithubLogo size={28} color={SUCCESS} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${SUCCESS}60)` }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: SUCCESS,
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    github.com/publisher/ext
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: `${SUCCESS}90`,
                  }}>
                    Source code available
                  </span>
                </div>
              </div>

              {/* Bad: No repo — RED FLAG */}
              <div style={{
                opacity: redFlagOp,
                transform: `scale(${redFlagScale})`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 20px",
                background: `${ERROR}10`,
                borderRadius: 10,
                border: `1px solid ${ERROR}30`,
                boxShadow: `0 0 ${redFlagPulse}px ${ERROR}25`,
              }}>
                <Flag size={28} color={ERROR} weight="fill" style={{ filter: `drop-shadow(0 0 8px ${ERROR}60)` }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: ERROR,
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    No repository
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: `${ERROR}90`,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}>
                    RED FLAG
                  </span>
                </div>
              </div>
            </div>
          </CheckCard>
        </div>

        {/* ═══ CHECK 3: Permissions ═══════════════════════ */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 20,
          opacity: check3Op,
          transform: `translateY(${check3Y}px)`,
        }}>
          <CheckNumber
            num={3}
            color={ACCENT}
            opacity={1}
            scale={check3NumScale}
            active={check3Active}
            completed={false}
          />
          <CheckCard
            title="Review the Permissions"
            color={ACCENT}
            iconName="LockKey"
            opacity={1}
            translateY={0}
            active={check3Active}
          >
            {/* package.json manifest block */}
            <div style={{
              opacity: manifestOp,
              transform: `translateY(${manifestY}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}>
              {/* Manifest header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}>
                <FileCode size={20} color={ACCENT} weight="duotone" />
                <span style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 14,
                  fontWeight: 600,
                  color: ACCENT,
                }}>
                  package.json
                </span>
              </div>

              {/* Permission rows */}
              <div style={{
                background: "#0a0a12",
                borderRadius: 10,
                border: `1px solid ${BORDER}`,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {/* Row: Color Theme extension */}
                <div style={{
                  opacity: colorThemeOp,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  background: `${ACCENT}08`,
                  borderRadius: 8,
                  border: `1px solid ${ACCENT}15`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Palette size={22} color={ACCENT} weight="duotone" />
                    <span style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 14,
                      fontWeight: 600,
                      color: TEXT_PRIMARY,
                    }}>
                      Color Theme Extension
                    </span>
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: TEXT_DIM,
                    fontFamily: "'SF Mono', monospace",
                  }}>
                    contributes: themes
                  </span>
                </div>

                {/* Row: Terminal Access — DANGER */}
                <div style={{
                  opacity: terminalOp,
                  transform: `scale(${terminalScale})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  background: `${ERROR}10`,
                  borderRadius: 8,
                  border: `1px solid ${ERROR}30`,
                  boxShadow: frame >= TERMINAL_ACCESS ? `0 0 15px ${ERROR}20` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Terminal size={22} color={ERROR} weight="duotone" style={{ filter: `drop-shadow(0 0 6px ${ERROR}60)` }} />
                    <span style={{
                      fontFamily: "'SF Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      color: ERROR,
                    }}>
                      Terminal Access
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <XCircle size={18} color={ERROR} weight="fill" />
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: ERROR,
                      fontFamily: "'SF Mono', monospace",
                      letterSpacing: 1,
                    }}>
                      SUSPICIOUS
                    </span>
                  </div>
                </div>
              </div>

              {/* "Something is very wrong" warning banner */}
              <div style={{
                opacity: warningOp,
                transform: `scale(${warningScale})`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 24px",
                background: `${ERROR}12`,
                border: `2px solid ${ERROR}40`,
                borderRadius: 10,
                boxShadow: `0 0 ${warningGlow}px ${ERROR}30`,
                marginTop: 4,
              }}>
                <Warning size={28} color={ERROR} weight="fill" style={{ filter: `drop-shadow(0 0 8px ${ERROR}80)` }} />
                <span style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: ERROR,
                  textShadow: `0 0 15px ${ERROR}30`,
                }}>
                  Something is very wrong
                </span>
                <span style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: 13,
                  fontWeight: 500,
                  color: `${ERROR}90`,
                  marginLeft: "auto",
                }}>
                  Color themes don't need terminal access
                </span>
              </div>
            </div>
          </CheckCard>
        </div>
      </div>
    </div>
  );
};

export default Generated_SafetyChecks;
