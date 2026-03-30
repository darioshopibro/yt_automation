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
  pink: "#ec4899",
  orange: "#f97316",
};

// ─── STEP DEFINITIONS ───
const steps = [
  { num: 1, label: "Client Hello", color: c.blue, dir: "right" as const, startFrame: 90 },
  { num: 2, label: "Server Hello", color: c.purple, dir: "left" as const, startFrame: 240 },
  { num: 3, label: "Verify Certificate", color: c.amber, dir: "none" as const, startFrame: 420 },
  { num: 4, label: "Key Exchange", color: c.cyan, dir: "right" as const, startFrame: 570 },
  { num: 5, label: "Finished", color: c.green, dir: "both" as const, startFrame: 780 },
];

// ─── HELPER: fade in + slide ───
const fadeSlide = (frame: number, start: number, dur = 15, dist = 20) => ({
  opacity: interpolate(frame, [start, start + dur], [0, 1], clamp),
  y: interpolate(frame, [start, start + dur], [dist, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  }),
});

// ─── PACKET COMPONENT ───
const Packet: React.FC<{
  frame: number;
  fps: number;
  startFrame: number;
  direction: "right" | "left" | "both";
  label: string;
  sublabel: string;
  color: string;
  icon: string;
}> = ({ frame, fps, startFrame, direction, label, sublabel, color, icon }) => {
  const IconComp = getIcon(icon);
  const travelDuration = 25;
  const progress = interpolate(
    frame,
    [startFrame, startFrame + travelDuration],
    [0, 1],
    { ...clamp, easing: Easing.inOut(Easing.cubic) }
  );
  const packetOpacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], clamp);

  // For "both" direction, show two packets
  if (direction === "both") {
    const prog1 = interpolate(
      frame,
      [startFrame, startFrame + travelDuration],
      [0, 1],
      { ...clamp, easing: Easing.inOut(Easing.cubic) }
    );
    const prog2 = interpolate(
      frame,
      [startFrame + 10, startFrame + 10 + travelDuration],
      [0, 1],
      { ...clamp, easing: Easing.inOut(Easing.cubic) }
    );
    return (
      <div style={{ position: "relative", width: "100%", height: 60 }}>
        {/* Right-going packet */}
        <div
          style={{
            position: "absolute",
            left: `${5 + prog1 * 70}%`,
            top: 0,
            opacity: packetOpacity,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: 10,
            padding: "6px 14px",
            boxShadow: `0 0 20px ${color}25`,
          }}
        >
          <IconComp size={18} color={color} weight="duotone" />
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>
            Test →
          </span>
        </div>
        {/* Left-going packet */}
        <div
          style={{
            position: "absolute",
            left: `${75 - prog2 * 70}%`,
            top: 30,
            opacity: interpolate(frame, [startFrame + 10, startFrame + 18], [0, 1], clamp),
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: 10,
            padding: "6px 14px",
            boxShadow: `0 0 20px ${color}25`,
          }}
        >
          <IconComp size={18} color={color} weight="duotone" />
          <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>
            ← Test
          </span>
        </div>
      </div>
    );
  }

  const leftPos =
    direction === "right"
      ? `${5 + progress * 70}%`
      : `${75 - progress * 70}%`;

  return (
    <div
      style={{
        position: "absolute",
        left: leftPos,
        top: "50%",
        transform: "translateY(-50%)",
        opacity: packetOpacity,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: `${color}12`,
        border: `1px solid ${color}30`,
        borderRadius: 10,
        padding: "8px 16px",
        boxShadow: `0 0 20px ${color}25`,
        whiteSpace: "nowrap",
      }}
    >
      <IconComp size={20} color={color} weight="duotone" style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
      <div>
        <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>
          {label}
        </div>
        <div style={{ color: "#64748b", fontSize: 10, fontFamily: "'SF Mono', monospace", marginTop: 2 }}>
          {sublabel}
        </div>
      </div>
    </div>
  );
};

const Generated_TLSHandshake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══ SCENE 1: URL bar + Title (frame 0-90) ═══
  const titleAnim = fadeSlide(frame, 0);
  const urlBarAnim = fadeSlide(frame, 15);

  // URL bar typing effect
  const urlText = "https://google.com";
  const charsVisible = Math.min(
    urlText.length,
    Math.floor(interpolate(frame, [20, 55], [0, urlText.length], clamp))
  );
  const typedUrl = urlText.slice(0, charsVisible);
  const showCursor = frame < 60 && frame % 16 < 10;

  // Browser & Server towers appear
  const browserAnim = fadeSlide(frame, 50, 20, 30);
  const serverAnim = fadeSlide(frame, 60, 20, 30);

  // ═══ SCENE 2: Steps (frame 90-900) ═══

  // Step 1: Client Hello (90-240)
  const step1LabelAnim = fadeSlide(frame, 90);
  // Packet content for step 1
  const step1PacketVisible = frame >= 120;

  // Step 1 details (cipher suites + random number)
  const detail1aAnim = fadeSlide(frame, 150);
  const detail1bAnim = fadeSlide(frame, 165);
  const latency1Anim = fadeSlide(frame, 190);

  // Step 2: Server Hello (240-420)
  const step2LabelAnim = fadeSlide(frame, 240);
  const step2PacketVisible = frame >= 270;
  const detail2aAnim = fadeSlide(frame, 300);
  const detail2bAnim = fadeSlide(frame, 320);
  const certAnim = fadeSlide(frame, 345);
  const certScale = spring({ frame: Math.max(0, frame - 345), fps, config: { damping: 22, stiffness: 200 } });

  // Step 3: Certificate Verification (420-570)
  const step3LabelAnim = fadeSlide(frame, 420);
  const checks = [
    { label: "Expired?", frame: 450 },
    { label: "Domain correct?", frame: 465 },
    { label: "Chain valid?", frame: 480 },
  ];
  const checkAllDone = frame >= 500;
  const verifyTimeAnim = fadeSlide(frame, 505);

  // Step 4: Key Exchange (570-780)
  const step4LabelAnim = fadeSlide(frame, 570);
  const step4PacketVisible = frame >= 600;
  const preMasterAnim = fadeSlide(frame, 620);
  const sessionKeyAnim = fadeSlide(frame, 680);
  const sessionKeyScale = spring({ frame: Math.max(0, frame - 680), fps, config: { damping: 22, stiffness: 200 } });

  // Step 5: Finished (780-900)
  const step5LabelAnim = fadeSlide(frame, 780);
  const successAnim = fadeSlide(frame, 850);
  const successScale = spring({ frame: Math.max(0, frame - 850), fps, config: { damping: 20, stiffness: 180 } });

  // ═══ SCENE 3: Encrypted result (900-1200) ═══
  const encryptedAnim = fadeSlide(frame, 920);
  const tunnelGlow = interpolate(frame, [920, 980], [0, 1], clamp);
  const stat1Anim = fadeSlide(frame, 960);
  const stat2Anim = fadeSlide(frame, 990);
  const stat3Anim = fadeSlide(frame, 1020);

  // ═══ ACTIVE STEP (for step indicator) ═══
  const activeStep =
    frame < 90 ? 0 :
    frame < 240 ? 1 :
    frame < 420 ? 2 :
    frame < 570 ? 3 :
    frame < 780 ? 4 : 5;

  // ═══ SCENE TRANSITIONS ═══
  // Scene 1 content fades when scene 2 steps start
  const scene1ContentOpacity = interpolate(frame, [85, 100], [1, 0], clamp);
  // Steps 1-2 area fades to make room for steps 3-5
  const earlyStepsOpacity = frame < 420 ? 1 : interpolate(frame, [415, 435], [1, 0], clamp);
  // Steps 3-4 fade for step 5
  const midStepsOpacity = frame < 780 ? 1 : interpolate(frame, [775, 795], [1, 0], clamp);
  // All steps fade for final encrypted scene
  const allStepsOpacity = frame < 900 ? 1 : interpolate(frame, [900, 930], [1, 0], clamp);
  // Final scene appears
  const finalSceneOpacity = interpolate(frame, [910, 940], [0, 1], clamp);

  const LockIcon = getIcon("Lock");
  const GlobeIcon = getIcon("Globe");
  const ServerIcon = getIcon("HardDrives");
  const ShieldCheckIcon = getIcon("ShieldCheck");
  const KeyIcon = getIcon("Key");
  const CheckCircleIcon = getIcon("CheckCircle");
  const LightningIcon = getIcon("Lightning");
  const CertificateIcon = getIcon("Certificate");
  const ShufflIcon = getIcon("Shuffle");

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: "#0f0f1a",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 80,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ═══ TITLE ═══ */}
      <div
        style={{
          opacity: titleAnim.opacity,
          transform: `translateY(${titleAnim.y}px)`,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#e2e8f0",
            letterSpacing: -0.5,
          }}
        >
          The TLS Handshake
        </div>
        <div style={{ fontSize: 14, color: "#64748b", marginTop: 6, fontFamily: "'SF Mono', monospace" }}>
          What happens before a single byte is sent
        </div>
      </div>

      {/* ═══ URL BAR (fades out after intro) ═══ */}
      <div
        style={{
          opacity: urlBarAnim.opacity * scene1ContentOpacity,
          transform: `translateY(${urlBarAnim.y}px)`,
          display: "flex",
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        <div
          style={{
            background: "#1a1a2e",
            border: "1px solid #2a2a3e",
            borderRadius: 12,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 380,
          }}
        >
          <LockIcon size={16} color={frame >= 55 ? c.green : "#64748b"} weight="duotone" />
          <span style={{ color: "#e2e8f0", fontSize: 15, fontFamily: "'SF Mono', monospace", fontWeight: 500 }}>
            {typedUrl}
            {showCursor && <span style={{ color: c.blue }}>|</span>}
          </span>
        </div>
      </div>

      {/* ═══ MAIN AREA: Browser ↔ Server ═══ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 0,
          alignItems: "stretch",
          position: "relative",
        }}
      >
        {/* ─── BROWSER TOWER ─── */}
        <div
          style={{
            width: 200,
            opacity: browserAnim.opacity,
            transform: `translateY(${browserAnim.y}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${c.blue}20, ${c.blue}08)`,
              border: `1.5px solid ${c.blue}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${c.blue}15`,
            }}
          >
            <GlobeIcon size={40} color={c.blue} weight="duotone" style={{ filter: `drop-shadow(0 0 10px ${c.blue}60)` }} />
          </div>
          <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Browser</div>
          <div style={{ color: "#64748b", fontSize: 11, fontFamily: "'SF Mono', monospace" }}>Client</div>
        </div>

        {/* ─── MIDDLE AREA (handshake steps) ─── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            gap: 16,
            padding: "0 30px",
          }}
        >
          {/* Connection line background */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 2,
              background: tunnelGlow > 0
                ? `linear-gradient(90deg, ${c.blue}${Math.round(20 + tunnelGlow * 40).toString(16).padStart(2, "0")}, ${c.green}${Math.round(20 + tunnelGlow * 40).toString(16).padStart(2, "0")}, ${c.purple}${Math.round(20 + tunnelGlow * 40).toString(16).padStart(2, "0")})`
                : `linear-gradient(90deg, ${c.blue}15, ${c.purple}15)`,
              opacity: browserAnim.opacity,
            }}
          />

          {/* ─── STEP CONTENT AREA ─── */}
          <div style={{ width: "100%", minHeight: 400, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>

            {/* STEPS 1 & 2 */}
            <div style={{ opacity: allStepsOpacity * earlyStepsOpacity }}>
              {/* Step 1: Client Hello */}
              {frame >= 90 && (
                <div style={{ opacity: step1LabelAnim.opacity, transform: `translateY(${step1LabelAnim.y}px)`, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: activeStep >= 1 ? c.blue : `${c.blue}20`,
                      border: `2px solid ${c.blue}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: activeStep === 1 ? `0 0 15px ${c.blue}40` : "none",
                      fontSize: 13, fontWeight: 700, color: "#fff",
                    }}>
                      1
                    </div>
                    <span style={{ color: c.blue, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'SF Mono', monospace" }}>
                      Client Hello
                    </span>
                    <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>Browser → Server</span>
                  </div>

                  {/* Packet animation area */}
                  <div style={{ position: "relative", height: 50, marginBottom: 8 }}>
                    {step1PacketVisible && (
                      <Packet
                        frame={frame} fps={fps} startFrame={120}
                        direction="right" label="Cipher suites + Random #"
                        sublabel="TLS_AES_256_GCM_SHA384, ..."
                        color={c.blue} icon="PaperPlaneTilt"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ opacity: detail1aAnim.opacity, transform: `translateY(${detail1aAnim.y}px)`, background: `${c.blue}08`, border: `1px solid ${c.blue}15`, borderRadius: 10, padding: "8px 14px" }}>
                      <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'SF Mono', monospace" }}>Cipher suites supported</span>
                    </div>
                    <div style={{ opacity: detail1bAnim.opacity, transform: `translateY(${detail1bAnim.y}px)`, background: `${c.blue}08`, border: `1px solid ${c.blue}15`, borderRadius: 10, padding: "8px 14px" }}>
                      <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'SF Mono', monospace" }}>+ random number</span>
                    </div>
                    <div style={{ opacity: latency1Anim.opacity, transform: `translateY(${latency1Anim.y}px)`, background: `${c.amber}08`, border: `1px solid ${c.amber}20`, borderRadius: 10, padding: "8px 14px" }}>
                      <LightningIcon size={14} color={c.amber} weight="duotone" style={{ marginRight: 6, verticalAlign: "middle" }} />
                      <span style={{ color: c.amber, fontSize: 12, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>~30ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Server Hello */}
              {frame >= 240 && (
                <div style={{ opacity: step2LabelAnim.opacity, transform: `translateY(${step2LabelAnim.y}px)`, marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: activeStep >= 2 ? c.purple : `${c.purple}20`,
                      border: `2px solid ${c.purple}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: activeStep === 2 ? `0 0 15px ${c.purple}40` : "none",
                      fontSize: 13, fontWeight: 700, color: "#fff",
                    }}>
                      2
                    </div>
                    <span style={{ color: c.purple, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'SF Mono', monospace" }}>
                      Server Hello
                    </span>
                    <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>Server → Browser</span>
                  </div>

                  <div style={{ position: "relative", height: 50, marginBottom: 8 }}>
                    {step2PacketVisible && (
                      <Packet
                        frame={frame} fps={fps} startFrame={270}
                        direction="left" label="Cipher pick + Random # + Cert"
                        sublabel="SSL Certificate: google.com"
                        color={c.purple} icon="PaperPlaneTilt"
                      />
                    )}
                  </div>

                  {/* Certificate badge */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ opacity: detail2aAnim.opacity, transform: `translateY(${detail2aAnim.y}px)`, background: `${c.purple}08`, border: `1px solid ${c.purple}15`, borderRadius: 10, padding: "8px 14px" }}>
                      <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'SF Mono', monospace" }}>Chosen cipher + random #</span>
                    </div>
                    <div style={{ opacity: detail2bAnim.opacity, transform: `translateY(${detail2bAnim.y}px)` }}>
                      <div style={{
                        background: `${c.amber}10`,
                        border: `1.5px solid ${c.amber}30`,
                        borderRadius: 12,
                        padding: "10px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transform: `scale(${certScale})`,
                        boxShadow: `0 0 20px ${c.amber}20`,
                      }}>
                        <CertificateIcon size={22} color={c.amber} weight="duotone" style={{ filter: `drop-shadow(0 0 8px ${c.amber}60)` }} />
                        <div>
                          <div style={{ color: c.amber, fontSize: 13, fontWeight: 700 }}>SSL Certificate</div>
                          <div style={{ color: "#64748b", fontSize: 10, fontFamily: "'SF Mono', monospace" }}>"I really am google.com"</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEPS 3 & 4 */}
            <div style={{ opacity: allStepsOpacity * midStepsOpacity }}>
              {/* Step 3: Certificate Verification */}
              {frame >= 420 && (
                <div style={{ opacity: step3LabelAnim.opacity, transform: `translateY(${step3LabelAnim.y}px)`, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: activeStep >= 3 ? c.amber : `${c.amber}20`,
                      border: `2px solid ${c.amber}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: activeStep === 3 ? `0 0 15px ${c.amber}40` : "none",
                      fontSize: 13, fontWeight: 700, color: "#fff",
                    }}>
                      3
                    </div>
                    <span style={{ color: c.amber, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'SF Mono', monospace" }}>
                      Verify Certificate
                    </span>
                    <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>Browser-side check</span>
                  </div>

                  {/* Checklist */}
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {checks.map((chk, i) => {
                      const chkAnim = fadeSlide(frame, chk.frame, 12);
                      const isDone = frame >= chk.frame + 15;
                      return (
                        <div
                          key={i}
                          style={{
                            opacity: chkAnim.opacity,
                            transform: `translateY(${chkAnim.y}px)`,
                            background: isDone ? `${c.green}10` : `${c.amber}08`,
                            border: `1px solid ${isDone ? c.green : c.amber}25`,
                            borderRadius: 10,
                            padding: "10px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CheckCircleIcon
                            size={18}
                            color={isDone ? c.green : "#64748b"}
                            weight={isDone ? "fill" : "duotone"}
                            style={{ filter: isDone ? `drop-shadow(0 0 6px ${c.green}60)` : "none" }}
                          />
                          <span style={{ color: isDone ? c.green : "#94a3b8", fontSize: 13, fontWeight: 600 }}>
                            {chk.label}
                          </span>
                        </div>
                      );
                    })}
                    {/* < 1ms badge */}
                    <div style={{
                      opacity: verifyTimeAnim.opacity,
                      transform: `translateY(${verifyTimeAnim.y}px)`,
                      background: `${c.green}08`,
                      border: `1px solid ${c.green}20`,
                      borderRadius: 10,
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}>
                      <LightningIcon size={14} color={c.green} weight="duotone" />
                      <span style={{ color: c.green, fontSize: 12, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>&lt; 1ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Key Exchange */}
              {frame >= 570 && (
                <div style={{ opacity: step4LabelAnim.opacity, transform: `translateY(${step4LabelAnim.y}px)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: activeStep >= 4 ? c.cyan : `${c.cyan}20`,
                      border: `2px solid ${c.cyan}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: activeStep === 4 ? `0 0 15px ${c.cyan}40` : "none",
                      fontSize: 13, fontWeight: 700, color: "#fff",
                    }}>
                      4
                    </div>
                    <span style={{ color: c.cyan, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'SF Mono', monospace" }}>
                      Key Exchange
                    </span>
                    <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>Browser → Server</span>
                  </div>

                  <div style={{ position: "relative", height: 50, marginBottom: 8 }}>
                    {step4PacketVisible && (
                      <Packet
                        frame={frame} fps={fps} startFrame={600}
                        direction="right" label="Pre-master secret (encrypted)"
                        sublabel="Only server's private key can decrypt"
                        color={c.cyan} icon="LockKey"
                      />
                    )}
                  </div>

                  {/* Session key computation */}
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ opacity: preMasterAnim.opacity, transform: `translateY(${preMasterAnim.y}px)`, background: `${c.cyan}08`, border: `1px solid ${c.cyan}15`, borderRadius: 10, padding: "8px 14px" }}>
                      <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'SF Mono', monospace" }}>Pre-master secret → session key</span>
                    </div>
                    <div style={{
                      opacity: sessionKeyAnim.opacity,
                      transform: `translateY(${sessionKeyAnim.y}px) scale(${sessionKeyScale})`,
                    }}>
                      <div style={{
                        display: "flex",
                        gap: 20,
                        alignItems: "center",
                      }}>
                        {/* Browser key */}
                        <div style={{ background: `${c.blue}10`, border: `1px solid ${c.blue}25`, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                          <KeyIcon size={16} color={c.blue} weight="duotone" />
                          <span style={{ color: c.blue, fontSize: 11, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>Session Key</span>
                        </div>
                        <span style={{ color: "#64748b", fontSize: 18, fontWeight: 300 }}>=</span>
                        {/* Server key */}
                        <div style={{ background: `${c.purple}10`, border: `1px solid ${c.purple}25`, borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                          <KeyIcon size={16} color={c.purple} weight="duotone" />
                          <span style={{ color: c.purple, fontSize: 11, fontWeight: 600, fontFamily: "'SF Mono', monospace" }}>Session Key</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 5 */}
            <div style={{ opacity: allStepsOpacity }}>
              {frame >= 780 && (
                <div style={{ opacity: step5LabelAnim.opacity, transform: `translateY(${step5LabelAnim.y}px)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: activeStep >= 5 ? c.green : `${c.green}20`,
                      border: `2px solid ${c.green}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 15px ${c.green}40`,
                      fontSize: 13, fontWeight: 700, color: "#fff",
                    }}>
                      5
                    </div>
                    <span style={{ color: c.green, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "'SF Mono', monospace" }}>
                      Finished
                    </span>
                    <span style={{ color: "#64748b", fontSize: 12, marginLeft: "auto" }}>Both sides verify</span>
                  </div>

                  {/* Both-way test messages */}
                  <div style={{ position: "relative", height: 70, marginBottom: 12 }}>
                    <Packet
                      frame={frame} fps={fps} startFrame={810}
                      direction="both" label="" sublabel=""
                      color={c.green} icon="ShieldCheck"
                    />
                  </div>

                  {/* Success badge */}
                  <div style={{
                    opacity: successAnim.opacity,
                    transform: `translateY(${successAnim.y}px) scale(${successScale})`,
                    display: "flex",
                    justifyContent: "center",
                  }}>
                    <div style={{
                      background: `${c.green}12`,
                      border: `1.5px solid ${c.green}30`,
                      borderRadius: 12,
                      padding: "12px 28px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      boxShadow: `0 0 30px ${c.green}25`,
                    }}>
                      <ShieldCheckIcon size={24} color={c.green} weight="fill" style={{ filter: `drop-shadow(0 0 8px ${c.green}60)` }} />
                      <span style={{ color: c.green, fontSize: 16, fontWeight: 700 }}>Handshake Complete</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ FINAL: Encrypted Connection ═══ */}
            {frame >= 910 && (
              <div
                style={{
                  opacity: finalSceneOpacity,
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 30,
                }}
              >
                {/* Encrypted tunnel visualization */}
                <div style={{
                  opacity: encryptedAnim.opacity,
                  transform: `translateY(${encryptedAnim.y}px)`,
                  width: "90%",
                  height: 80,
                  borderRadius: 20,
                  background: `linear-gradient(90deg, ${c.blue}08, ${c.green}15, ${c.purple}08)`,
                  border: `1.5px solid ${c.green}30`,
                  boxShadow: `0 0 40px ${c.green}15, inset 0 0 40px ${c.green}08`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                }}>
                  <LockIcon size={28} color={c.green} weight="fill" style={{ filter: `drop-shadow(0 0 10px ${c.green}60)` }} />
                  <span style={{ color: c.green, fontSize: 20, fontWeight: 700, letterSpacing: 2, fontFamily: "'SF Mono', monospace" }}>
                    AES-256 ENCRYPTED
                  </span>
                  <LockIcon size={28} color={c.green} weight="fill" style={{ filter: `drop-shadow(0 0 10px ${c.green}60)` }} />
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 30 }}>
                  <div style={{
                    opacity: stat1Anim.opacity,
                    transform: `translateY(${stat1Anim.y}px)`,
                    background: `${c.blue}08`,
                    border: `1px solid ${c.blue}20`,
                    borderRadius: 12,
                    padding: "16px 24px",
                    textAlign: "center",
                  }}>
                    <div style={{ color: c.blue, fontSize: 28, fontWeight: 700, fontFamily: "'SF Mono', monospace", letterSpacing: -1, textShadow: `0 0 20px ${c.blue}30` }}>
                      1-2
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'SF Mono', monospace", marginTop: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>
                      Round Trips
                    </div>
                  </div>
                  <div style={{
                    opacity: stat2Anim.opacity,
                    transform: `translateY(${stat2Anim.y}px)`,
                    background: `${c.amber}08`,
                    border: `1px solid ${c.amber}20`,
                    borderRadius: 12,
                    padding: "16px 24px",
                    textAlign: "center",
                  }}>
                    <div style={{ color: c.amber, fontSize: 28, fontWeight: 700, fontFamily: "'SF Mono', monospace", letterSpacing: -1, textShadow: `0 0 20px ${c.amber}30` }}>
                      ~100ms
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'SF Mono', monospace", marginTop: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>
                      Total Time
                    </div>
                  </div>
                  <div style={{
                    opacity: stat3Anim.opacity,
                    transform: `translateY(${stat3Anim.y}px)`,
                    background: `${c.green}08`,
                    border: `1px solid ${c.green}20`,
                    borderRadius: 12,
                    padding: "16px 24px",
                    textAlign: "center",
                  }}>
                    <div style={{ color: c.green, fontSize: 28, fontWeight: 700, fontFamily: "'SF Mono', monospace", letterSpacing: -1, textShadow: `0 0 20px ${c.green}30` }}>
                      &lt;1ms
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'SF Mono', monospace", marginTop: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>
                      Added Latency
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── SERVER TOWER ─── */}
        <div
          style={{
            width: 200,
            opacity: serverAnim.opacity,
            transform: `translateY(${serverAnim.y}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${c.purple}20, ${c.purple}08)`,
              border: `1.5px solid ${c.purple}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${c.purple}15`,
            }}
          >
            <ServerIcon size={40} color={c.purple} weight="duotone" style={{ filter: `drop-shadow(0 0 10px ${c.purple}60)` }} />
          </div>
          <div style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700 }}>Server</div>
          <div style={{ color: "#64748b", fontSize: 11, fontFamily: "'SF Mono', monospace" }}>google.com</div>
        </div>
      </div>

      {/* ═══ STEP PROGRESS INDICATOR ═══ */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginTop: 20,
          opacity: interpolate(frame, [85, 100], [0, 1], clamp),
        }}
      >
        {steps.map((step, i) => {
          const isActive = activeStep === step.num;
          const isDone = activeStep > step.num;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: isActive ? `${step.color}15` : isDone ? `${c.green}08` : "#1a1a2e",
                border: `1px solid ${isActive ? step.color : isDone ? c.green : "#2a2a3e"}30`,
                opacity: frame >= step.startFrame ? 1 : 0.3,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: isDone ? c.green : isActive ? step.color : "#2a2a3e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {isDone ? "✓" : step.num}
              </div>
              <span
                style={{
                  color: isActive ? step.color : isDone ? c.green : "#64748b",
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "'SF Mono', monospace",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Generated_TLSHandshake;
