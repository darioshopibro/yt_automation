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

// ============================================================
// TIMESTAMPS — from voiceover-timestamps.json (segment 4)
// startFrame=2357, endFrame=3259, fps=30
// ============================================================
const timestamps = [
  { word: "That's", start: 78.564, end: 80.015 },
  { word: "why", start: 80.062, end: 80.363 },
  { word: "modern", start: 80.526, end: 80.886 },
  { word: "layered", start: 82.987, end: 83.347 },
  { word: "approach", start: 83.37, end: 83.963 },
  { word: "keys", start: 85.367, end: 85.692 },
  { word: "identification", start: 85.901, end: 86.807 },
  { word: "oh-auth", start: 87.179, end: 87.562 },
  { word: "tokens", start: 87.608, end: 88.049 },
  { word: "authorization", start: 88.444, end: 89.35 },
  { word: "rate", start: 90.023, end: 90.255 },
  { word: "limiting", start: 90.302, end: 90.627 },
  { word: "prevent", start: 90.882, end: 91.23 },
  { word: "abuse", start: 91.265, end: 91.764 },
  // "The API key says who you are"
  { word: "key-says", start: 93.343, end: 93.622 },  // "key" before "says who you are"
  { word: "who", start: 94.179, end: 94.377 },
  // "The OAuth token says what you're allowed to do"
  { word: "token-says", start: 96.176, end: 96.501 }, // "token" before "says what"
  { word: "allowed", start: 97.221, end: 97.453 },
  // "And rate limiting says how much you can do"
  { word: "rate-says", start: 98.638, end: 98.847 },  // "rate" before "limiting says how much"
  { word: "how-much", start: 100.066, end: 100.251 },
  // "Stripe processes 500 million API requests per day"
  { word: "Stripe", start: 101.877, end: 102.237 },
  { word: "500", start: 102.98, end: 103.525 },
  { word: "million", start: 103.583, end: 103.851 },
  { word: "pattern", start: 107.368, end: 107.741 },
];

const fps = 30;

const frameFor = (keyword: string): number => {
  const w = timestamps.find((t) =>
    t.word.toLowerCase().includes(keyword.toLowerCase())
  );
  return w ? Math.round(w.start * fps) : 0;
};

// ============================================================
// KEY FRAMES — derived from timestamps
// ============================================================
const TITLE_IN = frameFor("layered") - 5;            // Title: "layered approach"
const LAYER1_IN = frameFor("keys") - 4;              // API Keys for identification
const LAYER2_IN = frameFor("oh-auth") - 4;           // OAuth tokens for authorization
const LAYER3_IN = frameFor("rate") - 4;              // Rate limiting to prevent abuse
const LAYER1_HL = frameFor("who");                    // "says who you are"
const LAYER2_HL = frameFor("allowed");                // "says what you're allowed"
const LAYER3_HL = frameFor("how-much");               // "says how much you can do"
const STRIPE_IN = frameFor("Stripe") - 3;             // Stripe stat
const STRIPE_NUM = frameFor("500");                   // 500 million counter
const END_GLOW = frameFor("pattern");                 // Final glow

// ============================================================
// BRAND COLORS
// ============================================================
const brand = {
  primary: "#3b82f6",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  bg: "#030305",
  text: "#f8fafc",
  textMuted: "#94a3b8",
};

// Layer definitions
const layers = [
  {
    id: "apikey",
    label: "API Key",
    sublabel: "Identification",
    description: "Who you are",
    icon: "Key",
    color: brand.primary,
    enterFrame: LAYER1_IN,
    highlightFrame: LAYER1_HL,
  },
  {
    id: "oauth",
    label: "OAuth Token",
    sublabel: "Authorization",
    description: "What you're allowed to do",
    icon: "ShieldCheck",
    color: brand.secondary,
    enterFrame: LAYER2_IN,
    highlightFrame: LAYER2_HL,
  },
  {
    id: "ratelimit",
    label: "Rate Limiting",
    sublabel: "Abuse Prevention",
    description: "How much you can do",
    icon: "Gauge",
    color: brand.accent,
    enterFrame: LAYER3_IN,
    highlightFrame: LAYER3_HL,
  },
];

type LayerProps = {
  layer: typeof layers[0];
  frame: number;
  fps: number;
  index: number;
};

const LayerCard: React.FC<LayerProps> = ({ layer, frame, fps: fpsProp, index }) => {
  // Entrance animation
  const enterOpacity = interpolate(
    frame,
    [layer.enterFrame, layer.enterFrame + 18],
    [0, 1],
    clamp
  );
  const enterX = interpolate(
    frame,
    [layer.enterFrame, layer.enterFrame + 18],
    [-60, 0],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );
  const enterScale = spring({
    frame: Math.max(0, frame - layer.enterFrame),
    fps: fpsProp,
    config: { damping: 22, stiffness: 180 },
  });

  // Highlight animation (when narrator says "says who/what/how much")
  const hlProgress = interpolate(
    frame,
    [layer.highlightFrame, layer.highlightFrame + 20],
    [0, 1],
    clamp
  );
  const hlGlow = interpolate(
    frame,
    [layer.highlightFrame, layer.highlightFrame + 12],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // Description badge fade in
  const descOpacity = interpolate(
    frame,
    [layer.highlightFrame + 5, layer.highlightFrame + 18],
    [0, 1],
    clamp
  );
  const descX = interpolate(
    frame,
    [layer.highlightFrame + 5, layer.highlightFrame + 18],
    [20, 0],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // End glow — all layers glow together at the end
  const endGlowVal = interpolate(
    frame,
    [END_GLOW, END_GLOW + 20],
    [0, 0.6],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  const isHighlighted = frame >= layer.highlightFrame;
  const glowIntensity = Math.max(hlGlow * 0.5, endGlowVal);

  const IconComp = getIcon(layer.icon);

  // Layer number (1, 2, 3)
  const layerNum = index + 1;

  return (
    <div
      style={{
        opacity: enterOpacity,
        transform: `translateX(${enterX}px) scale(${enterScale})`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        width: "100%",
        maxWidth: 1200,
      }}
    >
      {/* Layer number indicator */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: isHighlighted
            ? `${layer.color}20`
            : `${layer.color}08`,
          border: `1.5px solid ${layer.color}${isHighlighted ? "50" : "20"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: glowIntensity > 0
            ? `0 0 ${20 * glowIntensity}px ${layer.color}${Math.round(glowIntensity * 40).toString(16).padStart(2, "0")}`
            : "none",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: layer.color,
            fontFamily: "'SF Mono', Fira Code, monospace",
            textShadow: isHighlighted ? `0 0 12px ${layer.color}60` : "none",
          }}
        >
          {layerNum}
        </span>
      </div>

      {/* Main card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "20px 28px",
          background: isHighlighted
            ? `linear-gradient(135deg, ${layer.color}12, ${layer.color}06)`
            : `${layer.color}06`,
          border: `1.5px solid ${layer.color}${isHighlighted ? "40" : "15"}`,
          borderRadius: 12,
          boxShadow: glowIntensity > 0
            ? `0 0 ${30 * glowIntensity}px ${layer.color}${Math.round(glowIntensity * 30).toString(16).padStart(2, "0")}, inset 0 0 ${20 * glowIntensity}px ${layer.color}08`
            : "none",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${layer.color}20, ${layer.color}08)`,
            border: `1.5px solid ${layer.color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isHighlighted
              ? `0 0 20px ${layer.color}25`
              : `0 0 10px ${layer.color}10`,
            flexShrink: 0,
          }}
        >
          <IconComp
            size={28}
            color={layer.color}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 8px ${layer.color}60)` }}
          />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: isHighlighted ? brand.text : "#e2e8f0",
              fontFamily: "'SF Mono', Fira Code, monospace",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            {layer.label}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: isHighlighted ? `${layer.color}` : brand.textMuted,
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            {layer.sublabel}
          </div>
        </div>

        {/* Description badge — appears on highlight */}
        <div
          style={{
            opacity: descOpacity,
            transform: `translateX(${descX}px)`,
            padding: "8px 18px",
            background: `${layer.color}12`,
            border: `1px solid ${layer.color}30`,
            borderRadius: 10,
            boxShadow: `0 0 12px ${layer.color}15`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: layer.color,
              fontFamily: "'Inter', system-ui, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {`"${layer.description}"`}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Generated_LayeredSecurity: React.FC<{
  startFrame?: number;
  endFrame?: number;
}> = ({ startFrame = 2357, endFrame = 3259 }) => {
  const frame = useCurrentFrame();
  const { fps: videoFps } = useVideoConfig();

  // ============================================================
  // TITLE — "The Layered Security Approach"
  // ============================================================
  const titleOpacity = interpolate(
    frame,
    [TITLE_IN, TITLE_IN + 20],
    [0, 1],
    clamp
  );
  const titleY = interpolate(
    frame,
    [TITLE_IN, TITLE_IN + 20],
    [20, 0],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // Subtitle underline grows
  const underlineWidth = interpolate(
    frame,
    [TITLE_IN + 10, TITLE_IN + 30],
    [0, 80],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // ============================================================
  // STRIPE STAT — "500 million API requests per day"
  // ============================================================
  const stripeOpacity = interpolate(
    frame,
    [STRIPE_IN, STRIPE_IN + 18],
    [0, 1],
    clamp
  );
  const stripeY = interpolate(
    frame,
    [STRIPE_IN, STRIPE_IN + 18],
    [15, 0],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // Count-up for 500M
  const countProgress = interpolate(
    frame,
    [STRIPE_NUM, STRIPE_NUM + 40],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );
  const displayNum = Math.round(countProgress * 500);

  // Stripe badge glow
  const stripeGlow = interpolate(
    frame,
    [STRIPE_NUM + 30, STRIPE_NUM + 50],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // ============================================================
  // BACKGROUND — subtle gradient that builds
  // ============================================================
  const bgGradientOpacity = interpolate(
    frame,
    [LAYER1_IN, LAYER3_IN + 30],
    [0, 0.15],
    clamp
  );

  const StripeIcon = getIcon("Lightning");

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: brand.bg,
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
      {/* Subtle radial gradient background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse 800px 600px at 50% 45%, ${brand.primary}${Math.round(bgGradientOpacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* TITLE */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: brand.primary,
            textTransform: "uppercase",
            letterSpacing: 3,
            fontFamily: "'SF Mono', Fira Code, monospace",
            marginBottom: 12,
          }}
        >
          Step 4
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: brand.text,
            fontFamily: "'SF Mono', Fira Code, monospace",
            letterSpacing: 0.5,
          }}
        >
          The Layered Security Approach
        </div>
        <div
          style={{
            width: underlineWidth,
            height: 3,
            background: `linear-gradient(90deg, ${brand.primary}, ${brand.secondary})`,
            margin: "14px auto 0",
            borderRadius: 2,
            boxShadow: `0 0 12px ${brand.primary}50`,
          }}
        />
      </div>

      {/* THREE LAYERS — stacking vertically */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
          maxHeight: 500,
        }}
      >
        {layers.map((layer, idx) => (
          <LayerCard
            key={layer.id}
            layer={layer}
            frame={frame}
            fps={videoFps}
            index={idx}
          />
        ))}
      </div>

      {/* STRIPE STAT — bottom */}
      <div
        style={{
          opacity: stripeOpacity,
          transform: `translateY(${stripeY}px)`,
          marginTop: 50,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 32px",
          background: "#0a0a12",
          borderRadius: 12,
          border: `1px solid #1a1a2e`,
          boxShadow: stripeGlow > 0
            ? `0 0 ${25 * stripeGlow}px ${brand.primary}15`
            : "none",
        }}
      >
        {/* Stripe icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${brand.primary}15, ${brand.secondary}10)`,
            border: `1.5px solid ${brand.primary}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <StripeIcon
            size={24}
            color={brand.primary}
            weight="duotone"
            style={{ filter: `drop-shadow(0 0 6px ${brand.primary}50)` }}
          />
        </div>

        {/* Stripe label */}
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: brand.textMuted,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontFamily: "'SF Mono', Fira Code, monospace",
              marginBottom: 4,
            }}
          >
            Stripe — This Exact Pattern
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: brand.text,
                fontFamily: "'SF Mono', Fira Code, monospace",
                letterSpacing: -1,
                textShadow: stripeGlow > 0
                  ? `0 0 20px ${brand.primary}30`
                  : "none",
              }}
            >
              {displayNum}M
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: brand.textMuted,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              API requests / day
            </span>
          </div>
        </div>

        {/* Three mini dots showing the layers in use */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginLeft: 20,
          }}
        >
          {layers.map((l, i) => {
            const dotOpacity = interpolate(
              frame,
              [STRIPE_NUM + 15 + i * 8, STRIPE_NUM + 25 + i * 8],
              [0, 1],
              clamp
            );
            return (
              <div
                key={l.id}
                style={{
                  opacity: dotOpacity,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: l.color,
                  boxShadow: `0 0 8px ${l.color}60`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Generated_LayeredSecurity;
