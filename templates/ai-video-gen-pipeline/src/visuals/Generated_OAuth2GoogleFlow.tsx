import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import {
  GoogleLogo,
  Globe,
  ShieldCheck,
  Key,
  ArrowRight,
  Lock,
  User,
  Envelope,
  CheckCircle,
  XCircle,
  Desktop,
  ArrowsLeftRight,
} from "@phosphor-icons/react";

/* ─── helpers ─── */
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const fadeSlide = (frame: number, start: number, dur = 15, dist = 20) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  }),
  transform: `translateY(${interpolate(frame, [start, start + dur], [dist, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  })}px)`,
});

/* ─── palette ─── */
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";
const RED = "#ef4444";
const CYAN = "#06b6d4";

/* ─── Traveling Packet ─── */
const Packet: React.FC<{
  frame: number;
  startFrame: number;
  duration?: number;
  label: string;
  color: string;
  direction: "left-to-right" | "right-to-left";
}> = ({ frame, startFrame, duration = 40, label, color, direction }) => {
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 8, startFrame + duration - 8, startFrame + duration],
    [0, 1, 1, 0],
    clamp,
  );

  const fromX = direction === "left-to-right" ? -280 : 280;
  const toX = direction === "left-to-right" ? 280 : -280;
  const x = fromX + (toX - fromX) * progress;

  if (frame < startFrame || frame > startFrame + duration + 5) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${x}px), -50%)`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        borderRadius: 20,
        padding: "8px 18px",
        boxShadow: `0 0 25px ${color}30`,
        whiteSpace: "nowrap",
        zIndex: 10,
      }}
    >
      <ArrowRight
        size={16}
        color={color}
        weight="bold"
        style={{
          transform: direction === "right-to-left" ? "scaleX(-1)" : "none",
        }}
      />
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
    </div>
  );
};

/* ─── Panel ─── */
const Panel: React.FC<{
  children: React.ReactNode;
  color: string;
  title: string;
  icon: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, color, title, icon, style }) => (
  <div
    style={{
      flex: 1,
      background: `${color}06`,
      border: `1px solid ${color}18`,
      borderRadius: 12,
      padding: "28px 32px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
      minHeight: 500,
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {icon}
      <span
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: 14,
          fontWeight: 700,
          color: `${color}`,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
      {children}
    </div>
  </div>
);

/* ─── Small info card inside panel ─── */
const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color: string;
  style?: React.CSSProperties;
}> = ({ icon, label, sublabel, color, style }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 18px",
      background: `${color}08`,
      border: `1px solid ${color}15`,
      borderRadius: 10,
      ...style,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1.5px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 12px ${color}15`,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: "#e2e8f0",
        }}
      >
        {label}
      </span>
      {sublabel && (
        <span
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            color: "#64748b",
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

const Generated_OAuth2GoogleFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ─── TIMELINE (mapped to narration) ─── */

  // Scene 1: The Redirect Dance (0–240)
  const titleAnim = fadeSlide(frame, 0);
  const panelsAnim = fadeSlide(frame, 18, 20);

  // "Sign in with Google" button
  const btnAnim = fadeSlide(frame, 40);
  const btnClick = spring({
    frame: Math.max(0, frame - 65),
    fps,
    config: { damping: 20, stiffness: 200 },
    durationInFrames: 15,
  });
  const btnScale = frame >= 65 && frame < 85 ? 0.95 + 0.05 * btnClick : 1;

  // Packet 1: Website → Google (client_id + redirect_uri) ~frame 75
  // Consent screen appears ~frame 120
  const consentAnim = fadeSlide(frame, 120, 18);

  // "Allow" button click ~frame 160
  const allowClick = spring({
    frame: Math.max(0, frame - 160),
    fps,
    config: { damping: 20, stiffness: 200 },
    durationInFrames: 15,
  });
  const allowScale = frame >= 160 && frame < 180 ? 0.95 + 0.05 * allowClick : 1;
  const allowGlow = interpolate(frame, [150, 160], [0, 1], clamp);

  // Packet 2: Google → Website (authorization code) ~frame 170

  // Scene 2: Token Exchange (240–400)
  const serverAnim = fadeSlide(frame, 225);

  // Packet 3: Website → Google (server-to-server, code exchange) ~frame 245
  // Packet 4: Google → Website (access_token + refresh_token) ~frame 300

  // Token cards appear
  const accessTokenAnim = fadeSlide(frame, 340);
  const refreshTokenAnim = fadeSlide(frame, 355);

  // Scene 3: The API Call + Beauty (400–540)
  const apiCallAnim = fadeSlide(frame, 390);
  const userInfoAnim = fadeSlide(frame, 430);

  // Final: OAuth2 beauty
  const finalAnim = fadeSlide(frame, 465, 20);
  const noPasswordAnim = fadeSlide(frame, 470, 15);
  const neverSawAnim = fadeSlide(frame, 485, 15);
  const oauthTagAnim = fadeSlide(frame, 505, 20);

  // Strikethrough animation for "password"
  const strikeWidth = interpolate(frame, [478, 495], [0, 100], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        gap: 30,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── TITLE ─── */}
      <div style={{ textAlign: "center", ...titleAnim }}>
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: 28,
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: -0.5,
          }}
        >
          OAuth2 — "Sign in with Google"
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#64748b",
            marginTop: 6,
          }}
        >
          What actually happens when you click that button?
        </div>
      </div>

      {/* ─── MAIN TWO-PANEL LAYOUT ─── */}
      <div
        style={{
          display: "flex",
          gap: 60,
          flex: 1,
          position: "relative",
          ...panelsAnim,
        }}
      >
        {/* ─── LEFT: Website ─── */}
        <Panel
          color={BLUE}
          title="randomwebsite.com"
          icon={<Globe size={22} color={BLUE} weight="duotone" />}
        >
          {/* Sign in with Google button */}
          <div style={{ ...btnAnim }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 24px",
                background: "#ffffff12",
                border: "1px solid #ffffff20",
                borderRadius: 10,
                cursor: "pointer",
                transform: `scale(${btnScale})`,
                boxShadow:
                  frame >= 65 ? `0 0 20px ${BLUE}25` : "none",
              }}
            >
              <GoogleLogo size={24} weight="bold" color="#e2e8f0" />
              <span
                style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}
              >
                Sign in with Google
              </span>
            </div>
          </div>

          {/* Server exchange (appears later) */}
          <div style={{ ...serverAnim }}>
            <InfoCard
              icon={<Desktop size={22} color={CYAN} weight="duotone" />}
              label="Server-to-server call"
              sublabel="exchanges code for tokens"
              color={CYAN}
            />
          </div>

          {/* Access Token */}
          <div style={{ ...accessTokenAnim }}>
            <InfoCard
              icon={<Key size={22} color={AMBER} weight="duotone" />}
              label="Access Token"
              sublabel="expires in 1 hour"
              color={AMBER}
            />
          </div>

          {/* Refresh Token */}
          <div style={{ ...refreshTokenAnim }}>
            <InfoCard
              icon={<ArrowsLeftRight size={22} color={PURPLE} weight="duotone" />}
              label="Refresh Token"
              sublabel="lasts until you revoke it"
              color={PURPLE}
            />
          </div>

          {/* API call */}
          <div style={{ ...apiCallAnim }}>
            <InfoCard
              icon={<User size={22} color={GREEN} weight="duotone" />}
              label="Calls Google API"
              sublabel="gets your email + name"
              color={GREEN}
            />
          </div>
        </Panel>

        {/* ─── TRAVELING PACKETS (absolute overlay in gap) ─── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          {/* Packet 1: redirect to Google */}
          <Packet
            frame={frame}
            startFrame={75}
            duration={40}
            label="client_id + redirect_uri"
            color={BLUE}
            direction="left-to-right"
          />
          {/* Packet 2: redirect back with auth code */}
          <Packet
            frame={frame}
            startFrame={175}
            duration={40}
            label="authorization_code"
            color={GREEN}
            direction="right-to-left"
          />
          {/* Packet 3: server exchanges code */}
          <Packet
            frame={frame}
            startFrame={250}
            duration={40}
            label="code → token exchange"
            color={CYAN}
            direction="left-to-right"
          />
          {/* Packet 4: tokens come back */}
          <Packet
            frame={frame}
            startFrame={305}
            duration={40}
            label="access_token + refresh_token"
            color={AMBER}
            direction="right-to-left"
          />
          {/* Packet 5: API call with token */}
          <Packet
            frame={frame}
            startFrame={400}
            duration={35}
            label="Bearer {token} → email, name"
            color={GREEN}
            direction="left-to-right"
          />
        </div>

        {/* ─── RIGHT: Google ─── */}
        <Panel
          color={GREEN}
          title="accounts.google.com"
          icon={<GoogleLogo size={22} color={GREEN} weight="bold" />}
        >
          {/* URL bar hint */}
          <div
            style={{
              ...fadeSlide(frame, 95, 15),
              fontFamily: "'SF Mono', monospace",
              fontSize: 12,
              color: "#64748b",
              padding: "8px 14px",
              background: "#ffffff06",
              borderRadius: 8,
              border: "1px solid #1a1a2e",
            }}
          >
            ?client_id=abc123&redirect_uri=https://...
          </div>

          {/* Consent screen */}
          <div style={{ ...consentAnim }}>
            <div
              style={{
                padding: "22px 24px",
                background: `${GREEN}06`,
                border: `1px solid ${GREEN}15`,
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                This app wants to:
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Envelope size={18} color={GREEN} weight="duotone" />
                <span style={{ fontSize: 14, color: "#94a3b8" }}>
                  See your email address
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <User size={18} color={GREEN} weight="duotone" />
                <span style={{ fontSize: 14, color: "#94a3b8" }}>
                  See your basic profile
                </span>
              </div>

              {/* Allow button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 28px",
                  background:
                    frame >= 150
                      ? `${GREEN}${Math.round(20 + allowGlow * 60)
                          .toString(16)
                          .padStart(2, "0")}`
                      : `${GREEN}20`,
                  border: `1px solid ${GREEN}40`,
                  borderRadius: 8,
                  transform: `scale(${allowScale})`,
                  boxShadow:
                    frame >= 155 ? `0 0 18px ${GREEN}30` : "none",
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: frame >= 155 ? "#e2e8f0" : GREEN,
                  }}
                >
                  Allow
                </span>
              </div>
            </div>
          </div>

          {/* Auth code generated label */}
          <div style={{ ...fadeSlide(frame, 165) }}>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: 12,
                color: AMBER,
                padding: "8px 14px",
                background: `${AMBER}08`,
                border: `1px solid ${AMBER}15`,
                borderRadius: 8,
              }}
            >
              → redirect back with <span style={{ fontWeight: 700 }}>authorization_code</span>
              <br />
              <span style={{ color: "#64748b", fontSize: 11 }}>
                short-lived, one-time-use
              </span>
            </div>
          </div>

          {/* User info response */}
          <div style={{ ...userInfoAnim }}>
            <InfoCard
              icon={<Envelope size={22} color={GREEN} weight="duotone" />}
              label="Returns: email + name"
              sublabel="via Google API"
              color={GREEN}
            />
          </div>
        </Panel>
      </div>

      {/* ─── BOTTOM: OAuth2 Beauty Summary ─── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          ...finalAnim,
        }}
      >
        {/* No password on website */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            ...noPasswordAnim,
          }}
        >
          <XCircle size={24} color={RED} weight="duotone" />
          <span style={{ fontSize: 15, color: "#94a3b8", position: "relative" }}>
            User never typed a{" "}
            <span style={{ position: "relative", color: RED }}>
              password
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  width: `${strikeWidth}%`,
                  height: 2,
                  background: RED,
                  transform: "translateY(-50%)",
                }}
              />
            </span>
            {" "}on the website
          </span>
        </div>

        {/* Website never saw password */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            ...neverSawAnim,
          }}
        >
          <ShieldCheck size={24} color={GREEN} weight="duotone" />
          <span style={{ fontSize: 15, color: "#94a3b8" }}>
            Website <span style={{ fontWeight: 700, color: GREEN }}>never saw</span> Google password
          </span>
        </div>

        {/* OAuth2 tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 22px",
            background: `${PURPLE}10`,
            border: `1px solid ${PURPLE}25`,
            borderRadius: 10,
            ...oauthTagAnim,
          }}
        >
          <Lock size={22} color={PURPLE} weight="duotone" />
          <span
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: PURPLE,
            }}
          >
            OAuth2 — Delegated Authorization
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_OAuth2GoogleFlow;
