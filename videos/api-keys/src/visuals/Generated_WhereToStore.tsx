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
  XCircle,
  CheckCircle,
  ShieldCheck,
  Code,
  GithubLogo,
  FileCode,
  Terminal,
  Eye,
  EyeSlash,
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

const fadeOut = (frame: number, start: number, dur = 20) =>
  interpolate(frame, [start, start + dur], [1, 0], {
    ...clamp,
    easing: easeInQuad,
  });

// ─── Colors ───────────────────────────────────────────────
const BG = "#030305";
const PRIMARY = "#3b82f6";
const SECONDARY = "#06b6d4";
const ACCENT = "#f59e0b";
const ERROR = "#ef4444";
const SUCCESS = "#22c55e";
const TEXT_PRIMARY = "#f8fafc";
const TEXT_MUTED = "#94a3b8";
const TEXT_DIM = "#64748b";
const BORDER = "#1a1a2e";

/*
 * ═══════════════════════════════════════════════════════════
 * VOICEOVER TIMELINE (30fps) — from ElevenLabs timestamps
 * Segment 5: "Where to Store API Keys" (f3259–f3970)
 * ═══════════════════════════════════════════════════════════
 * "where should you store"            → f3259
 * "your API key?"                     → f3312
 * "Never in your frontend code."      → f3340
 * "Never in a GitHub repository."     → f3396
 * "Never hardcoded in your source"    → f3466
 * "Use environment variables."        → f3546
 * "Your server reads the key from"    → f3615
 * "a .env file"                       → f3663
 * "that's listed in .gitignore."      → f3700
 * "The key never touches your codebase" → f3779
 * "never gets committed"              → f3847
 * "never gets deployed to the client" → f3886
 */

// ─── Frame constants from timestamps ──────────────────────
const F_WHERE = 3259;
const F_NEVER_FRONTEND = 3340;
const F_NEVER_GITHUB = 3396;
const F_NEVER_HARDCODED = 3466;
const F_USE_ENV = 3546;
const F_SERVER_READS = 3615;
const F_DOT_ENV = 3663;
const F_GITIGNORE = 3700;
const F_NEVER_TOUCHES = 3779;
const F_NEVER_COMMITTED = 3847;
const F_NEVER_DEPLOYED = 3886;
const F_END = 3970;

// ─── "NEVER" Item ─────────────────────────────────────────
const NeverItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  opacity: number;
  translateY: number;
  strikeProgress: number;
  xOpacity: number;
}> = ({ icon, label, sublabel, opacity, translateY, strikeProgress, xOpacity }) => {
  const dimAmount = interpolate(strikeProgress, [0, 1], [1, 0.3], clamp);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "24px 36px",
        borderRadius: 12,
        background: `${ERROR}${strikeProgress > 0.5 ? "06" : "0a"}`,
        border: `1.5px solid ${ERROR}${strikeProgress > 0.5 ? "15" : "30"}`,
        width: 600,
        position: "relative",
        overflow: "hidden",
        filter: `grayscale(${strikeProgress * 0.7})`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${ERROR}20, ${ERROR}08)`,
          border: `1.5px solid ${ERROR}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          opacity: dimAmount,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, opacity: dimAmount }}>
        <div
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 20,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: TEXT_DIM,
            marginTop: 4,
          }}
        >
          {sublabel}
        </div>
      </div>

      {/* Strikethrough line */}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: "50%",
          height: 3,
          background: ERROR,
          borderRadius: 2,
          transformOrigin: "left center",
          transform: `scaleX(${strikeProgress})`,
          boxShadow: `0 0 12px ${ERROR}60`,
        }}
      />

      {/* X circle */}
      <div
        style={{
          opacity: xOpacity,
          flexShrink: 0,
        }}
      >
        <XCircle size={36} color={ERROR} weight="fill" style={{ filter: `drop-shadow(0 0 8px ${ERROR}60)` }} />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
type Props = {
  startFrame: number;
  endFrame: number;
};

const Generated_WhereToStore: React.FC<Props> = ({ startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Scene transitions ────────────────────────────────
  // Scene 1: NEVER items (f3259–f3530)
  // Scene 2: Solution — .env + .gitignore (f3530+)
  const SCENE_TRANSITION = F_USE_ENV - 16; // ~f3530
  const scene1Fade = frame < SCENE_TRANSITION
    ? 1
    : fadeOut(frame, SCENE_TRANSITION, 25);
  const scene2Fade = fadeIn(frame, SCENE_TRANSITION + 5, 20);

  // ─── TITLE ────────────────────────────────────────────
  const titleOpacity = fadeIn(frame, F_WHERE, 18);
  const titleSlide = slideUp(frame, F_WHERE, 18);

  // ─── NEVER ITEMS ──────────────────────────────────────
  // Item 1: Frontend code — appears at f3340
  const n1Opacity = fadeIn(frame, F_NEVER_FRONTEND - 5, 15);
  const n1Slide = slideUp(frame, F_NEVER_FRONTEND - 5, 15);
  const n1Strike = interpolate(
    frame,
    [F_NEVER_FRONTEND + 20, F_NEVER_FRONTEND + 40],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );
  const n1X = spring({
    frame: Math.max(0, frame - (F_NEVER_FRONTEND + 35)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Item 2: GitHub repository — appears at f3396
  const n2Opacity = fadeIn(frame, F_NEVER_GITHUB - 5, 15);
  const n2Slide = slideUp(frame, F_NEVER_GITHUB - 5, 15);
  const n2Strike = interpolate(
    frame,
    [F_NEVER_GITHUB + 20, F_NEVER_GITHUB + 40],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );
  const n2X = spring({
    frame: Math.max(0, frame - (F_NEVER_GITHUB + 35)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // Item 3: Source files — appears at f3466
  const n3Opacity = fadeIn(frame, F_NEVER_HARDCODED - 5, 15);
  const n3Slide = slideUp(frame, F_NEVER_HARDCODED - 5, 15);
  const n3Strike = interpolate(
    frame,
    [F_NEVER_HARDCODED + 20, F_NEVER_HARDCODED + 40],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );
  const n3X = spring({
    frame: Math.max(0, frame - (F_NEVER_HARDCODED + 35)),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // ─── "NEVER" flash label ──────────────────────────────
  const neverLabelOpacity = interpolate(
    frame,
    [F_NEVER_FRONTEND - 3, F_NEVER_FRONTEND + 8, SCENE_TRANSITION - 10, SCENE_TRANSITION],
    [0, 1, 1, 0],
    clamp
  );

  // ─── SOLUTION SCENE ───────────────────────────────────
  // "Use environment variables" title
  const solutionTitleOp = fadeIn(frame, F_USE_ENV - 3, 18);
  const solutionTitleSlide = slideUp(frame, F_USE_ENV - 3, 18);
  const solutionTitleScale = spring({
    frame: Math.max(0, frame - F_USE_ENV),
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  // .env file visual — appears at f3663
  const envFileOp = fadeIn(frame, F_DOT_ENV - 5, 18);
  const envFileSlide = slideUp(frame, F_DOT_ENV - 5, 18);

  // .gitignore shield — appears at f3700
  const gitignoreOp = fadeIn(frame, F_GITIGNORE - 5, 18);
  const gitignoreSlide = slideUp(frame, F_GITIGNORE - 5, 18);
  const shieldScale = spring({
    frame: Math.max(0, frame - F_GITIGNORE),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // "Key never touches..." checkmarks — f3779, f3847, f3886
  const check1Op = fadeIn(frame, F_NEVER_TOUCHES - 3, 15);
  const check1Slide = slideUp(frame, F_NEVER_TOUCHES - 3, 15);
  const check2Op = fadeIn(frame, F_NEVER_COMMITTED - 3, 15);
  const check2Slide = slideUp(frame, F_NEVER_COMMITTED - 3, 15);
  const check3Op = fadeIn(frame, F_NEVER_DEPLOYED - 3, 15);
  const check3Slide = slideUp(frame, F_NEVER_DEPLOYED - 3, 15);

  // Connection glow between .env and .gitignore
  const connectionGlow = interpolate(
    frame,
    [F_GITIGNORE + 15, F_GITIGNORE + 40],
    [0, 1],
    { ...clamp, easing: easeOutCubic }
  );

  // ─── Phase visibility ─────────────────────────────────
  const showScene1 = frame < SCENE_TRANSITION + 25;
  const showScene2 = frame >= SCENE_TRANSITION - 5;

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
      {/* ─── Subtle grid background ──────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${PRIMARY}05 1px, transparent 1px),
            linear-gradient(90deg, ${PRIMARY}05 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.5,
        }}
      />

      {/* ─── Title (persistent) ──────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
        }}
      >
        <h1
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 30,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            letterSpacing: -0.5,
            margin: 0,
          }}
        >
          Where to Store API Keys
        </h1>
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 500,
            color: TEXT_DIM,
            marginTop: 8,
          }}
        >
          Step 5 — Security Best Practices
        </p>
      </div>

      {/* ═══ SCENE 1: NEVER ITEMS — Three crossed-out bad practices ═══ */}
      {showScene1 && (
        <div
          style={{
            opacity: scene1Fade,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            marginTop: 40,
          }}
        >
          {/* NEVER label */}
          <div
            style={{
              opacity: neverLabelOpacity,
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Warning size={28} color={ERROR} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 22,
                fontWeight: 700,
                color: ERROR,
                letterSpacing: 2,
                textTransform: "uppercase",
                textShadow: `0 0 20px ${ERROR}40`,
              }}
            >
              NEVER STORE KEYS IN:
            </span>
          </div>

          {/* Item 1: Frontend code */}
          <NeverItem
            icon={<Code size={28} color={ERROR} weight="duotone" />}
            label="Frontend Code"
            sublabel="Exposed to every browser — anyone can read it"
            opacity={n1Opacity}
            translateY={n1Slide}
            strikeProgress={n1Strike}
            xOpacity={n1X}
          />

          {/* Item 2: GitHub repository */}
          <NeverItem
            icon={<GithubLogo size={28} color={ERROR} weight="duotone" />}
            label="GitHub Repository"
            sublabel="Public or private — bots scan repos for leaked keys"
            opacity={n2Opacity}
            translateY={n2Slide}
            strikeProgress={n2Strike}
            xOpacity={n2X}
          />

          {/* Item 3: Source files */}
          <NeverItem
            icon={<FileCode size={28} color={ERROR} weight="duotone" />}
            label="Hardcoded in Source"
            sublabel="Stays forever in git history — even after deletion"
            opacity={n3Opacity}
            translateY={n3Slide}
            strikeProgress={n3Strike}
            xOpacity={n3X}
          />
        </div>
      )}

      {/* ═══ SCENE 2: THE CORRECT WAY — .env + .gitignore ═══ */}
      {showScene2 && (
        <div
          style={{
            opacity: scene2Fade,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 40,
            marginTop: 20,
          }}
        >
          {/* Solution title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: solutionTitleOp,
              transform: `translateY(${solutionTitleSlide}px) scale(${solutionTitleScale})`,
            }}
          >
            <CheckCircle size={32} color={SUCCESS} weight="duotone" />
            <span
              style={{
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: 24,
                fontWeight: 700,
                color: SUCCESS,
                letterSpacing: 1,
                textShadow: `0 0 20px ${SUCCESS}30`,
              }}
            >
              USE ENVIRONMENT VARIABLES
            </span>
          </div>

          {/* .env file + .gitignore flow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 50,
            }}
          >
            {/* .env file card */}
            <div
              style={{
                opacity: envFileOp,
                transform: `translateY(${envFileSlide}px)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 280,
                  borderRadius: 12,
                  background: "#0a0a14",
                  border: `1.5px solid ${SECONDARY}30`,
                  overflow: "hidden",
                  boxShadow: `0 0 20px ${SECONDARY}15`,
                }}
              >
                {/* File header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    background: `${SECONDARY}10`,
                    borderBottom: `1px solid ${SECONDARY}20`,
                  }}
                >
                  <Terminal size={18} color={SECONDARY} weight="duotone" />
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 14,
                      fontWeight: 600,
                      color: SECONDARY,
                    }}
                  >
                    .env
                  </span>
                </div>

                {/* File contents */}
                <div style={{ padding: "16px 16px" }}>
                  <div
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 13,
                      lineHeight: 2,
                      color: TEXT_MUTED,
                    }}
                  >
                    <div>
                      <span style={{ color: TEXT_DIM }}>API_KEY=</span>
                      <span style={{ color: ACCENT }}>sk-***********</span>
                    </div>
                    <div>
                      <span style={{ color: TEXT_DIM }}>DB_URL=</span>
                      <span style={{ color: ACCENT }}>postgres://...</span>
                    </div>
                    <div>
                      <span style={{ color: TEXT_DIM }}>SECRET=</span>
                      <span style={{ color: ACCENT }}>••••••••••</span>
                    </div>
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: TEXT_DIM,
                }}
              >
                Server reads key at runtime
              </span>
            </div>

            {/* Connection — glowing arrow between */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: connectionGlow,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 3,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${SECONDARY}60, ${SUCCESS}60)`,
                  boxShadow: `0 0 12px ${SUCCESS}30`,
                }}
              />
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: TEXT_DIM,
                  letterSpacing: 1,
                }}
              >
                PROTECTED BY
              </span>
            </div>

            {/* .gitignore shield */}
            <div
              style={{
                opacity: gitignoreOp,
                transform: `translateY(${gitignoreSlide}px) scale(${shieldScale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 280,
                  borderRadius: 12,
                  background: "#0a0a14",
                  border: `1.5px solid ${SUCCESS}30`,
                  overflow: "hidden",
                  boxShadow: `0 0 25px ${SUCCESS}15`,
                }}
              >
                {/* File header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    background: `${SUCCESS}10`,
                    borderBottom: `1px solid ${SUCCESS}20`,
                  }}
                >
                  <ShieldCheck size={18} color={SUCCESS} weight="duotone" />
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 14,
                      fontWeight: 600,
                      color: SUCCESS,
                    }}
                  >
                    .gitignore
                  </span>
                </div>

                {/* File contents */}
                <div style={{ padding: "16px 16px" }}>
                  <div
                    style={{
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 13,
                      lineHeight: 2,
                      color: TEXT_MUTED,
                    }}
                  >
                    <div style={{ color: TEXT_DIM }}># secrets</div>
                    <div>
                      <span style={{ color: SUCCESS, fontWeight: 600 }}>.env</span>
                    </div>
                    <div>
                      <span style={{ color: SUCCESS, fontWeight: 600 }}>.env.local</span>
                    </div>
                    <div>
                      <span style={{ color: SUCCESS, fontWeight: 600 }}>.env.production</span>
                    </div>
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: TEXT_DIM,
                }}
              >
                Git ignores .env — never committed
              </span>
            </div>
          </div>

          {/* ─── Result checkmarks: "never touches / committed / deployed" ─── */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              marginTop: 12,
            }}
          >
            {/* Check 1: Never touches codebase */}
            <div
              style={{
                opacity: check1Op,
                transform: `translateY(${check1Slide}px)`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 10,
                background: `${SUCCESS}08`,
                border: `1px solid ${SUCCESS}20`,
              }}
            >
              <EyeSlash size={22} color={SUCCESS} weight="duotone" />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: SUCCESS,
                }}
              >
                Never touches codebase
              </span>
            </div>

            {/* Check 2: Never gets committed */}
            <div
              style={{
                opacity: check2Op,
                transform: `translateY(${check2Slide}px)`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 10,
                background: `${SUCCESS}08`,
                border: `1px solid ${SUCCESS}20`,
              }}
            >
              <Lock size={22} color={SUCCESS} weight="duotone" />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: SUCCESS,
                }}
              >
                Never gets committed
              </span>
            </div>

            {/* Check 3: Never deployed to client */}
            <div
              style={{
                opacity: check3Op,
                transform: `translateY(${check3Slide}px)`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 10,
                background: `${SUCCESS}08`,
                border: `1px solid ${SUCCESS}20`,
              }}
            >
              <ShieldCheck size={22} color={SUCCESS} weight="duotone" />
              <span
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: SUCCESS,
                }}
              >
                Never deployed to client
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generated_WhereToStore;
