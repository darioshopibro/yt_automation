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
  primary: "#3b82f6",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  purple: "#a855f7",
  pink: "#ec4899",
};

// The API key string that gets "typed out"
const API_KEY_STRING = "sk-a3F9x...Qm7zR";
const FULL_KEY = "sk-a3F9xKpL2nWvB8dY...Qm7zRtE4hJ";

// ── Scene boundaries ──
const SCENE1_END = 220;
const SCENE2_START = 200;
const SCENE2_END = 420;
const SCENE3_START = 400;

type Props = {
  startFrame: number;
  endFrame: number;
};

const Generated_WhatIsAnAPIKey: React.FC<Props> = ({ startFrame, endFrame }) => {
  const globalFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frame = globalFrame - startFrame;

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
        background: "#030305",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid pattern background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff06 1px, transparent 0)`,
          backgroundSize: "60px 60px",
          opacity: interpolate(frame, [0, 30], [0, 0.5], clamp),
        }}
      />

      {/* ════════ SCENE 1: App pulls data from service — key behind the scenes ════════ */}
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
          <Scene1_AppToService frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════ SCENE 2: API Key = secret password, identifies your app ════════ */}
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
          <Scene2_SecretPassword frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════ SCENE 3: Sign up, get unique key ════════ */}
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
          <Scene3_SignUpGetKey frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: "Every time you use an app that pulls data from another service,
//           there's an API key working behind the scenes."
// ═══════════════════════════════════════════════════════════
const Scene1_AppToService: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const AppIcon = getIcon("AppWindow");
  const CloudIcon = getIcon("Cloud");
  const KeyIcon = getIcon("Key");

  // "Your App" box appears
  const appOp = interpolate(frame, [8, 23], [0, 1], clamp);
  const appX = interpolate(frame, [8, 23], [-40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // "Service" box appears
  const svcOp = interpolate(frame, [25, 40], [0, 1], clamp);
  const svcX = interpolate(frame, [25, 40], [40, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Data request arrow (dots traveling from app to service)
  const dataFlowStart = 50;
  const dataProgress = interpolate(frame, [dataFlowStart, dataFlowStart + 40], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const dataOp = interpolate(frame, [dataFlowStart, dataFlowStart + 10], [0, 1], clamp);

  // "pulls data" label
  const pullsOp = interpolate(frame, [55, 70], [0, 1], clamp);
  const pullsY = interpolate(frame, [55, 70], [10, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Data response flowing back
  const responseStart = 100;
  const responseProgress = interpolate(frame, [responseStart, responseStart + 40], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const responseOp =
    interpolate(frame, [responseStart, responseStart + 10], [0, 1], clamp) *
    interpolate(frame, [responseStart + 30, responseStart + 40], [1, 0], clamp);

  // Key reveal behind the scenes
  const keyRevealStart = 130;
  const keyOp = interpolate(frame, [keyRevealStart, keyRevealStart + 20], [0, 1], clamp);
  const keyScale = spring({
    frame: Math.max(0, frame - keyRevealStart),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const keyGlow = interpolate(frame, [keyRevealStart + 15, keyRevealStart + 40], [0, 30], clamp);

  // "Behind the scenes" text
  const btsOp = interpolate(frame, [155, 170], [0, 1], clamp);
  const btsY = interpolate(frame, [155, 170], [12, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Bracket/curtain effect - subtle lines above and below the key
  const bracketOp = interpolate(frame, [keyRevealStart + 5, keyRevealStart + 20], [0, 1], clamp);
  const bracketWidth = interpolate(frame, [keyRevealStart + 5, keyRevealStart + 25], [0, 200], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 50, width: "100%" }}>
      {/* App and Service with connection */}
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        {/* Your App */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: appOp,
            transform: `translateX(${appX}px)`,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 24,
              background: `linear-gradient(135deg, ${c.primary}20, ${c.primary}08)`,
              border: `1.5px solid ${c.primary}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${c.primary}15`,
            }}
          >
            <AppIcon size={48} color={c.primary} weight="duotone" />
          </div>
          <span style={{ color: "#f8fafc", fontSize: 18, fontWeight: 600 }}>Your App</span>
        </div>

        {/* Connection area */}
        <div style={{ width: 300, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Track line */}
          <div style={{ width: "100%", height: 2, background: `${c.primary}15`, borderRadius: 1 }} />

          {/* Request dot traveling right */}
          {dataOp > 0 && (
            <div
              style={{
                position: "absolute",
                left: `${dataProgress * 100}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: c.primary,
                boxShadow: `0 0 16px ${c.primary}80`,
                opacity: dataOp,
                transform: "translateX(-50%)",
              }}
            />
          )}

          {/* Response dot traveling left */}
          {responseOp > 0 && (
            <div
              style={{
                position: "absolute",
                left: `${responseProgress * 100}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: c.secondary,
                boxShadow: `0 0 16px ${c.secondary}80`,
                opacity: responseOp,
                transform: "translateX(-50%)",
              }}
            />
          )}

          {/* "pulls data" label */}
          <div
            style={{
              position: "absolute",
              top: -30,
              opacity: pullsOp,
              transform: `translateY(${pullsY}px)`,
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
              pulls data
            </span>
          </div>
        </div>

        {/* Service */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            opacity: svcOp,
            transform: `translateX(${svcX}px)`,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 24,
              background: `linear-gradient(135deg, ${c.secondary}20, ${c.secondary}08)`,
              border: `1.5px solid ${c.secondary}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 20px ${c.secondary}15`,
            }}
          >
            <CloudIcon size={48} color={c.secondary} weight="duotone" />
          </div>
          <span style={{ color: "#f8fafc", fontSize: 18, fontWeight: 600 }}>External Service</span>
        </div>
      </div>

      {/* Key reveal - "behind the scenes" */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, position: "relative" }}>
        {/* Top bracket line */}
        <div
          style={{
            width: bracketWidth,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${c.accent}40, transparent)`,
            opacity: bracketOp,
          }}
        />

        {/* Key icon with glow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 32px",
            borderRadius: 12,
            background: `${c.accent}08`,
            border: `1px solid ${c.accent}20`,
            boxShadow: `0 0 ${keyGlow}px ${c.accent}25`,
            opacity: keyOp,
            transform: `scale(${keyScale})`,
          }}
        >
          <KeyIcon size={32} color={c.accent} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${c.accent}60)` }} />
          <span
            style={{
              color: c.accent,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              letterSpacing: 1,
            }}
          >
            API KEY
          </span>
        </div>

        {/* Bottom bracket line */}
        <div
          style={{
            width: bracketWidth,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${c.accent}40, transparent)`,
            opacity: bracketOp,
          }}
        />

        {/* "Behind the scenes" text */}
        <span
          style={{
            color: "#94a3b8",
            fontSize: 16,
            fontWeight: 500,
            fontStyle: "italic",
            opacity: btsOp,
            transform: `translateY(${btsY}px)`,
          }}
        >
          working behind the scenes
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: "An API key is a secret password that identifies
//           your application to a server."
// ═══════════════════════════════════════════════════════════
const Scene2_SecretPassword: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE2_START;
  const LockIcon = getIcon("Lock");
  const IdentificationBadgeIcon = getIcon("IdentificationBadge");
  const ServerIcon = getIcon("HardDrives");
  const AppIcon = getIcon("AppWindow");

  // Title: "API Key = Secret Password"
  const titleOp = interpolate(localFrame, [0, 20], [0, 1], clamp);
  const titleY = interpolate(localFrame, [0, 20], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Lock icon appears with the concept of "secret"
  const lockOp = interpolate(localFrame, [15, 30], [0, 1], clamp);
  const lockScale = spring({
    frame: Math.max(0, localFrame - 15),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // Key string typing effect — "secret password"
  const typingStart = 35;
  const typingEnd = 80;
  const charsVisible = Math.floor(
    interpolate(localFrame, [typingStart, typingEnd], [0, FULL_KEY.length], clamp)
  );
  const keyStringOp = interpolate(localFrame, [typingStart - 5, typingStart + 5], [0, 1], clamp);

  // Cursor blink
  const cursorVisible = charsVisible < FULL_KEY.length ? Math.sin(localFrame * 0.3) > 0 : false;

  // "identifies your app" — app badge appears
  const badgeStart = 95;
  const badgeOp = interpolate(localFrame, [badgeStart, badgeStart + 15], [0, 1], clamp);
  const badgeX = interpolate(localFrame, [badgeStart, badgeStart + 15], [-30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // "to a server" — server appears
  const serverStart = 120;
  const serverOp = interpolate(localFrame, [serverStart, serverStart + 15], [0, 1], clamp);
  const serverX = interpolate(localFrame, [serverStart, serverStart + 15], [30, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Key traveling from app to server
  const travelStart = 145;
  const travelProgress = interpolate(localFrame, [travelStart, travelStart + 35], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const travelOp =
    interpolate(localFrame, [travelStart, travelStart + 8], [0, 1], clamp) *
    interpolate(localFrame, [travelStart + 28, travelStart + 35], [1, 0.6], clamp);

  // Server recognition glow
  const recognizeStart = 175;
  const recognizeGlow = interpolate(localFrame, [recognizeStart, recognizeStart + 20], [0, 35], clamp);
  const checkOp = interpolate(localFrame, [recognizeStart + 5, recognizeStart + 15], [0, 1], clamp);
  const CheckIcon = getIcon("CheckCircle");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44, width: "100%" }}>
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
            opacity: lockOp,
            transform: `scale(${lockScale})`,
          }}
        >
          <LockIcon size={36} color={c.accent} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${c.accent}60)` }} />
        </div>
        <span style={{ color: "#f8fafc", fontSize: 28, fontWeight: 700, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
          API Key = Secret Password
        </span>
      </div>

      {/* Key string typing out */}
      <div
        style={{
          opacity: keyStringOp,
          padding: "20px 40px",
          borderRadius: 12,
          background: "#0a0a12",
          border: `1px solid ${c.accent}20`,
          boxShadow: `inset 0 0 30px #00000060`,
          minWidth: 500,
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: c.accent,
            fontSize: 26,
            fontWeight: 700,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            letterSpacing: 2,
            textShadow: `0 0 20px ${c.accent}40`,
          }}
        >
          {FULL_KEY.slice(0, charsVisible)}
        </span>
        {cursorVisible && (
          <span
            style={{
              color: c.accent,
              fontSize: 26,
              fontWeight: 300,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            |
          </span>
        )}
      </div>

      {/* App → Key → Server diagram */}
      <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 20 }}>
        {/* App card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: badgeOp,
            transform: `translateX(${badgeX}px)`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${c.primary}20, ${c.primary}08)`,
              border: `1.5px solid ${c.primary}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${c.primary}15`,
            }}
          >
            <AppIcon size={42} color={c.primary} weight="duotone" />
          </div>
          <span style={{ color: "#f8fafc", fontSize: 15, fontWeight: 600 }}>Your Application</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 8,
              background: `${c.primary}10`,
              border: `1px solid ${c.primary}20`,
            }}
          >
            <IdentificationBadgeIcon size={16} color={c.primary} weight="duotone" />
            <span
              style={{
                color: c.primary,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              has API key
            </span>
          </div>
        </div>

        {/* Connection track with traveling key */}
        <div style={{ width: 350, position: "relative", display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", height: 2, background: `${c.accent}15`, borderRadius: 1 }} />

          {/* Traveling key badge */}
          {travelOp > 0 && (
            <div
              style={{
                position: "absolute",
                left: `${travelProgress * 100}%`,
                transform: "translate(-50%, -50%)",
                top: "50%",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                background: `${c.accent}15`,
                border: `1px solid ${c.accent}30`,
                boxShadow: `0 0 18px ${c.accent}40`,
                opacity: travelOp,
              }}
            >
              {React.createElement(getIcon("Key"), { size: 16, color: c.accent, weight: "fill" })}
              <span
                style={{
                  color: c.accent,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  whiteSpace: "nowrap",
                }}
              >
                {API_KEY_STRING}
              </span>
            </div>
          )}
        </div>

        {/* Server card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: serverOp,
            transform: `translateX(${serverX}px)`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${c.secondary}20, ${c.secondary}08)`,
              border: `1.5px solid ${c.secondary}${recognizeGlow > 0 ? "50" : "30"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: recognizeGlow > 0 ? `0 0 ${recognizeGlow}px ${c.green}30` : `0 0 15px ${c.secondary}15`,
            }}
          >
            <ServerIcon size={42} color={recognizeGlow > 0 ? c.green : c.secondary} weight="duotone" />
          </div>
          <span style={{ color: "#f8fafc", fontSize: 15, fontWeight: 600 }}>Server</span>

          {/* Recognition checkmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 8,
              background: `${c.green}10`,
              border: `1px solid ${c.green}25`,
              opacity: checkOp,
            }}
          >
            <CheckIcon size={16} color={c.green} weight="fill" />
            <span
              style={{
                color: c.green,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              Identified!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: "When you sign up for Google Maps or OpenAI,
//           they give you a unique string. That's your API key."
// ═══════════════════════════════════════════════════════════
const Scene3_SignUpGetKey: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const localFrame = frame - SCENE3_START;
  const UserPlusIcon = getIcon("UserPlus");
  const KeyIcon = getIcon("Key");
  const CopyIcon = getIcon("Copy");

  const services = [
    { label: "Google Maps", icon: "MapPin", color: c.primary },
    { label: "OpenAI", icon: "Brain", color: c.green },
  ];

  // "Sign up for a service" title
  const titleOp = interpolate(localFrame, [0, 20], [0, 1], clamp);
  const titleY = interpolate(localFrame, [0, 20], [15, 0], { ...clamp, easing: Easing.out(Easing.cubic) });

  // Sign up icon
  const signupOp = interpolate(localFrame, [10, 25], [0, 1], clamp);
  const signupScale = spring({
    frame: Math.max(0, localFrame - 10),
    fps,
    config: { damping: 20, stiffness: 180 },
  });

  // Service cards stagger
  const svcStartFrames = [40, 60];

  // Key generation animation
  const keyGenStart = 100;
  const keyGenOp = interpolate(localFrame, [keyGenStart, keyGenStart + 15], [0, 1], clamp);
  const keyGenY = interpolate(localFrame, [keyGenStart, keyGenStart + 15], [20, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // The unique key string materializing character by character
  const uniqueKey = "sk-proj-x7Kn9Pm2Rv...";
  const keyTypingStart = 120;
  const keyTypingEnd = 170;
  const keyChars = Math.floor(
    interpolate(localFrame, [keyTypingStart, keyTypingEnd], [0, uniqueKey.length], clamp)
  );
  const keyStringOp = interpolate(localFrame, [keyTypingStart - 5, keyTypingStart + 5], [0, 1], clamp);

  // "That string is your API key" — final highlight glow
  const finalGlowStart = 180;
  const finalGlow = interpolate(localFrame, [finalGlowStart, finalGlowStart + 30], [0, 40], clamp);
  const finalLabelOp = interpolate(localFrame, [finalGlowStart, finalGlowStart + 15], [0, 1], clamp);
  const finalLabelY = interpolate(localFrame, [finalGlowStart, finalGlowStart + 15], [10, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Cursor
  const keyCursor = keyChars < uniqueKey.length ? Math.sin(localFrame * 0.3) > 0 : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, width: "100%" }}>
      {/* Title */}
      <span
        style={{
          color: "#f8fafc",
          fontSize: 26,
          fontWeight: 700,
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
        }}
      >
        Sign Up for a Service
      </span>

      {/* Service cards row */}
      <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
        {/* Sign up icon */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: signupOp,
            transform: `scale(${signupScale})`,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${c.purple}20, ${c.purple}08)`,
              border: `1.5px solid ${c.purple}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 15px ${c.purple}15`,
            }}
          >
            <UserPlusIcon size={36} color={c.purple} weight="duotone" />
          </div>
          <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>You sign up</span>
        </div>

        {/* Arrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 60, height: 2, background: `${c.accent}20`, borderRadius: 1 }} />
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: `8px solid ${c.accent}40`,
            }}
          />
        </div>

        {/* Service cards */}
        {services.map((svc, i) => {
          const SvcIcon = getIcon(svc.icon);
          const sOp = interpolate(localFrame, [svcStartFrames[i], svcStartFrames[i] + 15], [0, 1], clamp);
          const sScale = spring({
            frame: Math.max(0, localFrame - svcStartFrames[i]),
            fps,
            config: { damping: 22, stiffness: 200 },
          });
          return (
            <div
              key={svc.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: sOp,
                transform: `scale(${sScale})`,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 20,
                  background: `linear-gradient(135deg, ${svc.color}20, ${svc.color}08)`,
                  border: `1.5px solid ${svc.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 15px ${svc.color}15`,
                }}
              >
                <SvcIcon size={40} color={svc.color} weight="duotone" />
              </div>
              <span style={{ color: "#f8fafc", fontSize: 16, fontWeight: 600 }}>{svc.label}</span>
            </div>
          );
        })}
      </div>

      {/* Arrow down */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          opacity: keyGenOp,
        }}
      >
        <div style={{ width: 2, height: 30, background: `${c.accent}30` }} />
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `8px solid ${c.accent}40`,
          }}
        />
      </div>

      {/* Key generation card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "28px 48px",
          borderRadius: 16,
          background: "#0a0a12",
          border: `1.5px solid ${c.accent}${finalGlow > 0 ? "40" : "20"}`,
          boxShadow: `0 0 ${finalGlow}px ${c.accent}25, inset 0 0 40px #00000060`,
          opacity: keyGenOp,
          transform: `translateY(${keyGenY}px)`,
        }}
      >
        {/* "They give you" + key icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <KeyIcon size={28} color={c.accent} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${c.accent}60)` }} />
          <span style={{ color: "#94a3b8", fontSize: 15, fontWeight: 500 }}>
            They give you a unique string:
          </span>
        </div>

        {/* The key string */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 10,
            background: `${c.accent}06`,
            border: `1px solid ${c.accent}15`,
            opacity: keyStringOp,
          }}
        >
          <span
            style={{
              color: c.accent,
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              letterSpacing: 2,
              textShadow: finalGlow > 10 ? `0 0 20px ${c.accent}50` : "none",
            }}
          >
            {uniqueKey.slice(0, keyChars)}
          </span>
          {keyCursor && (
            <span style={{ color: c.accent, fontSize: 28, fontWeight: 300, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
              |
            </span>
          )}
          {keyChars >= uniqueKey.length && (
            <div style={{ opacity: interpolate(localFrame, [keyTypingEnd + 5, keyTypingEnd + 15], [0, 1], clamp) }}>
              <CopyIcon size={20} color="#94a3b8" weight="duotone" />
            </div>
          )}
        </div>

        {/* "That's your API key" label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: finalLabelOp,
            transform: `translateY(${finalLabelY}px)`,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c.accent,
              boxShadow: `0 0 8px ${c.accent}80`,
            }}
          />
          <span
            style={{
              color: c.accent,
              fontSize: 18,
              fontWeight: 700,
              textShadow: `0 0 20px ${c.accent}30`,
            }}
          >
            That string is your API Key
          </span>
        </div>
      </div>
    </div>
  );
};

export default Generated_WhatIsAnAPIKey;
