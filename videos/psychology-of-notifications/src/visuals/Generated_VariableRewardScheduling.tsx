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

// ── Word timestamps (GLOBAL frames @ 30fps) ──
const T = {
  notifications: 504,
  exploit: 521,
  psychological: 536,
  mechanism: 558,
  variable: 596,
  reward: 614,
  scheduling: 627,
  slot: 704,
  machines: 713,
  next: 767,
  buzz: 775,
  exciting: 803,
  worthless: 839,
  unpredictability: 884,
  addictive: 940,
};

// ── Scene boundaries (GLOBAL frames) ──
const SCENE1_END = 690;    // Concept intro ends, slot machine begins
const SCENE2_START = 675;  // Slot machine scene
const SCENE2_END = 870;    // Slot machine ends
const SCENE3_START = 855;  // Unpredictability + addictive conclusion

// ── Slot reel outcomes ──
const reelOutcomes = [
  { label: "New follower", icon: "UserPlus", color: c.green, exciting: true },
  { label: "Spam email", icon: "Trash", color: "#64748b", exciting: false },
  { label: "Friend's message", icon: "ChatCircle", color: c.blue, exciting: true },
  { label: "App update", icon: "ArrowsClockwise", color: "#64748b", exciting: false },
  { label: "Payment received", icon: "CurrencyDollar", color: c.green, exciting: true },
];

const Generated_VariableRewardScheduling: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene opacities (crossfade) ──
  const scene1Op =
    interpolate(frame, [SCENE1_END - 20, SCENE1_END], [1, 0], clamp);
  const scene2Op =
    interpolate(frame, [SCENE2_START, SCENE2_START + 20], [0, 1], clamp) *
    interpolate(frame, [SCENE2_END - 20, SCENE2_END], [1, 0], clamp);
  const scene3Op =
    interpolate(frame, [SCENE3_START, SCENE3_START + 20], [0, 1], clamp);

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
      {/* ════════ SCENE 1: Concept Intro — "Notifications exploit..." ════════ */}
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
          <Scene1_ConceptIntro frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════ SCENE 2: Slot Machine — spinning reels ════════ */}
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
          <Scene2_SlotMachine frame={frame} fps={fps} />
        </div>
      )}

      {/* ════════ SCENE 3: Unpredictability → Addictive ════════ */}
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
          <Scene3_Conclusion frame={frame} fps={fps} />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 1: Concept intro — bell, "exploit", mechanism name
// ═══════════════════════════════════════════════════════════
const Scene1_ConceptIntro: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const BellIcon = getIcon("BellRinging");
  const BrainIcon = getIcon("Brain");
  const LightningIcon = getIcon("Lightning");

  // 🔊 SOUND: scene_start @ frame 474 — segment opens, background fades in
  const bgPulse = interpolate(
    frame,
    [474, 504],
    [0, 1],
    { ...clamp, easing: Easing.out(Easing.cubic) }
  );

  // 🔊 SOUND: element_appear @ frame 504 — bell icon shakes in on "Notifications"
  const bellScale = spring({
    frame: Math.max(0, frame - T.notifications),
    fps,
    config: { damping: 18, stiffness: 200 },
  });
  const bellGlow = interpolate(frame, [T.notifications, T.notifications + 20], [0, 30], clamp);

  // Bell shake animation
  const bellShake = frame >= T.notifications && frame < T.notifications + 25
    ? Math.sin((frame - T.notifications) * 1.2) * interpolate(frame, [T.notifications, T.notifications + 25], [6, 0], clamp)
    : 0;

  // 🔊 SOUND: element_appear @ frame 521 — "exploit" word flashes red
  const exploitOp = interpolate(frame, [T.exploit, T.exploit + 12], [0, 1], clamp);
  const exploitGlow = interpolate(frame, [T.exploit, T.exploit + 20], [0, 25], clamp);

  // 🔊 SOUND: element_appear @ frame 536 — brain icon + "psychological mechanism" appears
  const mechOp = interpolate(frame, [T.psychological, T.psychological + 15], [0, 1], clamp);
  const mechY = interpolate(frame, [T.psychological, T.psychological + 15], [25, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: reveal @ frame 596 — concept name "Variable Reward Scheduling" scales up
  const conceptScale = spring({
    frame: Math.max(0, frame - T.variable),
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const conceptOp = interpolate(frame, [T.variable, T.variable + 10], [0, 1], clamp);
  const conceptGlow = interpolate(frame, [T.variable, T.variable + 30], [0, 40], clamp);

  // 🔊 SOUND: element_appear @ frame 627 — "scheduling" underline draws in
  const underlineW = interpolate(frame, [T.scheduling, T.scheduling + 20], [0, 100], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Subtitle text below concept name
  const subOp = interpolate(frame, [T.scheduling + 10, T.scheduling + 25], [0, 1], clamp);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
        opacity: bgPulse,
      }}
    >
      {/* Bell icon */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${c.amber}20, ${c.amber}08)`,
            border: `1.5px solid ${c.amber}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${bellScale}) rotate(${bellShake}deg)`,
            boxShadow: `0 0 ${bellGlow}px ${c.amber}40`,
          }}
        >
          <BellIcon size={44} color={c.amber} weight="duotone" />
        </div>
        {/* Notification dot */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: c.red,
            border: "2px solid #0f0f1a",
            transform: `scale(${bellScale})`,
            boxShadow: `0 0 8px ${c.red}60`,
          }}
        />
      </div>

      {/* "Exploit" flash text */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: exploitOp,
        }}
      >
        <LightningIcon size={28} color={c.red} weight="duotone" />
        <span
          style={{
            color: c.red,
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "'SF Mono', monospace",
            textShadow: `0 0 ${exploitGlow}px ${c.red}60`,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          exploits a mechanism
        </span>
        <LightningIcon size={28} color={c.red} weight="duotone" />
      </div>

      {/* Brain + psychological mechanism */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: mechOp,
          transform: `translateY(${mechY}px)`,
        }}
      >
        <BrainIcon size={36} color={c.purple} weight="duotone" />
        <span style={{ color: "#94a3b8", fontSize: 18, fontWeight: 500 }}>
          A psychological mechanism called...
        </span>
      </div>

      {/* BIG concept name */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: conceptOp,
          transform: `scale(${conceptScale})`,
        }}
      >
        <span
          style={{
            color: "#e2e8f0",
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: -1,
            textShadow: `0 0 ${conceptGlow}px ${c.purple}30`,
          }}
        >
          Variable Reward Scheduling
        </span>
        {/* Animated underline */}
        <div
          style={{
            width: `${underlineW}%`,
            maxWidth: 520,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${c.purple}, ${c.amber})`,
            boxShadow: `0 0 10px ${c.purple}40`,
          }}
        />
        {/* Subtitle */}
        <span
          style={{
            color: "#64748b",
            fontSize: 16,
            fontWeight: 500,
            marginTop: 8,
            opacity: subOp,
          }}
        >
          The same principle behind slot machines
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 2: Slot Machine — reels spinning, outcomes revealing
// ═══════════════════════════════════════════════════════════
const Scene2_SlotMachine: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const SlotIcon = getIcon("Coin");

  // 🔊 SOUND: transition @ frame 690 — scene crossfades to slot machine
  // 🔊 SOUND: element_appear @ frame 704 — slot machine body appears on "slot"
  const machineScale = spring({
    frame: Math.max(0, frame - T.slot),
    fps,
    config: { damping: 20, stiffness: 160 },
  });
  const machineOp = interpolate(frame, [T.slot, T.slot + 12], [0, 1], clamp);

  // 🔊 SOUND: element_appear @ frame 713 — "SLOT MACHINE" label on "machines"
  const labelOp = interpolate(frame, [T.machines, T.machines + 15], [0, 1], clamp);
  const labelY = interpolate(frame, [T.machines, T.machines + 15], [12, 0], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Reel spin speed (fast then slow)
  const spinActive = frame >= T.machines + 10 && frame < T.next;
  const spinSpeed = spinActive
    ? interpolate(frame, [T.machines + 10, T.next - 15], [12, 2], clamp)
    : 0;

  // 🔊 SOUND: reveal @ frame 775 — first outcome locks in on "buzz"
  // Reel stops at "buzz" — show the first outcome
  const outcome1Op = interpolate(frame, [T.buzz, T.buzz + 10], [0, 1], clamp);
  const outcome1Scale = spring({
    frame: Math.max(0, frame - T.buzz),
    fps,
    config: { damping: 22, stiffness: 200 },
  });

  // 🔊 SOUND: element_appear @ frame 803 — "exciting" outcome glows green
  const excitingOp = interpolate(frame, [T.exciting, T.exciting + 12], [0, 1], clamp);
  const excitingGlow = interpolate(frame, [T.exciting, T.exciting + 20], [0, 35], clamp);

  // 🔊 SOUND: element_appear @ frame 839 — "worthless" outcome shows grey/dim
  const worthlessOp = interpolate(frame, [T.worthless, T.worthless + 12], [0, 1], clamp);

  // Reel cycle index for spinning effect
  const spinOffset = spinActive ? (frame * spinSpeed) % (reelOutcomes.length * 60) : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
        width: "100%",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: labelOp,
          transform: `translateY(${labelY}px)`,
        }}
      >
        <SlotIcon size={32} color={c.amber} weight="duotone" />
        <span style={{ color: "#e2e8f0", fontSize: 28, fontWeight: 700 }}>
          The Slot Machine Effect
        </span>
      </div>

      {/* Slot machine body */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          opacity: machineOp,
          transform: `scale(${machineScale})`,
        }}
      >
        {/* Machine frame */}
        <div
          style={{
            width: 700,
            padding: "40px 50px",
            borderRadius: 16,
            background: `linear-gradient(180deg, #1a1a2e, #12122080)`,
            border: `2px solid ${c.amber}25`,
            boxShadow: `0 0 40px ${c.amber}10, inset 0 0 60px #00000040`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* Three reel windows */}
          <div style={{ display: "flex", gap: 20 }}>
            {[0, 1, 2].map((reelIdx) => {
              const isLocked = frame >= T.buzz + reelIdx * 12;
              const lockScale = isLocked
                ? spring({
                    frame: Math.max(0, frame - (T.buzz + reelIdx * 12)),
                    fps,
                    config: { damping: 22, stiffness: 200 },
                  })
                : 1;

              // Pick outcome per reel
              const outcomeIdx = isLocked
                ? reelIdx === 0 ? 0 : reelIdx === 1 ? 1 : 2
                : Math.floor(((spinOffset + reelIdx * 20) / 60) % reelOutcomes.length);
              const outcome = reelOutcomes[outcomeIdx];
              const Icon = getIcon(outcome.icon);

              const borderColor = isLocked
                ? outcome.exciting ? c.green : "#64748b"
                : c.amber;

              return (
                <div
                  key={reelIdx}
                  style={{
                    width: 180,
                    height: 160,
                    borderRadius: 12,
                    background: "#0f0f1a",
                    border: `2px solid ${borderColor}40`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    overflow: "hidden",
                    boxShadow: isLocked && outcome.exciting
                      ? `0 0 20px ${c.green}20`
                      : `inset 0 0 20px #00000040`,
                    transform: `scale(${lockScale})`,
                  }}
                >
                  {/* Spinning or locked content */}
                  {!isLocked && spinActive ? (
                    // Spinning blur effect
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        filter: `blur(${Math.min(spinSpeed * 0.5, 4)}px)`,
                        transform: `translateY(${spinOffset % 30 - 15}px)`,
                      }}
                    >
                      <Icon size={40} color={outcome.color} weight="duotone" />
                      <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>
                        {outcome.label}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        opacity: isLocked ? 1 : 0.3,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          background: `${outcome.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={32} color={outcome.color} weight="duotone" />
                      </div>
                      <span
                        style={{
                          color: outcome.exciting ? "#e2e8f0" : "#64748b",
                          fontSize: 14,
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        {outcome.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lever / handle indicator */}
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {/* "Next buzz" label */}
            <span
              style={{
                color: "#64748b",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "'SF Mono', monospace",
                opacity: interpolate(frame, [T.next, T.next + 10], [0, 1], clamp),
              }}
            >
              *buzz*
            </span>

            {/* Mini lights */}
            {[c.red, c.amber, c.green].map((color, i) => {
              const on = spinActive || frame >= T.buzz;
              const blinkOp = on
                ? 0.4 + 0.6 * Math.abs(Math.sin((frame + i * 10) * 0.15))
                : 0.15;
              return (
                <div
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: color,
                    opacity: blinkOp,
                    boxShadow: on ? `0 0 8px ${color}60` : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Exciting vs Worthless labels */}
      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        {/* Exciting */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: excitingOp,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: c.green,
              boxShadow: `0 0 ${excitingGlow}px ${c.green}60`,
            }}
          />
          <span
            style={{
              color: c.green,
              fontSize: 20,
              fontWeight: 700,
              textShadow: `0 0 ${excitingGlow}px ${c.green}40`,
            }}
          >
            Something exciting
          </span>
        </div>

        {/* Separator */}
        <span
          style={{
            color: "#64748b",
            fontSize: 16,
            fontWeight: 600,
            opacity: Math.min(excitingOp, worthlessOp),
          }}
        >
          or
        </span>

        {/* Worthless */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: worthlessOp,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#475569",
            }}
          />
          <span
            style={{
              color: "#64748b",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Completely worthless
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SCENE 3: Unpredictability → Addictive
// ═══════════════════════════════════════════════════════════
const Scene3_Conclusion: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const QuestionIcon = getIcon("Question");
  const WarningIcon = getIcon("Warning");
  const BrainIcon = getIcon("Brain");

  // 🔊 SOUND: transition @ frame 870 — scene crossfades to conclusion
  // 🔊 SOUND: reveal @ frame 884 — "Unpredictability" word scales up big
  const unpredScale = spring({
    frame: Math.max(0, frame - T.unpredictability),
    fps,
    config: { damping: 18, stiffness: 160 },
  });
  const unpredOp = interpolate(frame, [T.unpredictability, T.unpredictability + 12], [0, 1], clamp);
  const unpredGlow = interpolate(frame, [T.unpredictability, T.unpredictability + 30], [0, 45], clamp);

  // Orbiting question marks around the word
  const orbitActive = frame >= T.unpredictability + 10;
  const orbitAngle = orbitActive ? (frame - T.unpredictability) * 2.5 : 0;
  const orbitOp = interpolate(frame, [T.unpredictability + 10, T.unpredictability + 25], [0, 0.6], clamp);

  // 🔊 SOUND: element_appear @ frame 910 — arrow/connector to "addictive"
  const connectorOp = interpolate(frame, [T.unpredictability + 30, T.unpredictability + 45], [0, 1], clamp);
  const connectorW = interpolate(frame, [T.unpredictability + 30, T.unpredictability + 45], [0, 100], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // 🔊 SOUND: reveal @ frame 940 — "ADDICTIVE" slams in with red glow
  const addictiveScale = spring({
    frame: Math.max(0, frame - T.addictive),
    fps,
    config: { damping: 16, stiffness: 220 },
  });
  const addictiveOp = interpolate(frame, [T.addictive, T.addictive + 8], [0, 1], clamp);
  const addictiveGlow = interpolate(frame, [T.addictive, T.addictive + 25], [0, 50], clamp);

  // Pulsing warning effect on "addictive"
  const addictivePulse = frame >= T.addictive
    ? 1 + 0.02 * Math.sin((frame - T.addictive) * 0.3)
    : 1;

  // Background red vignette on addictive
  const vignetteOp = interpolate(frame, [T.addictive, T.addictive + 20], [0, 0.15], clamp);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 50,
        width: "100%",
        position: "relative",
      }}
    >
      {/* Red vignette */}
      <div
        style={{
          position: "absolute",
          inset: -80,
          background: `radial-gradient(ellipse at center, transparent 40%, ${c.red}${Math.round(vignetteOp * 255).toString(16).padStart(2, "0")} 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* "Unpredictability" big word */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: unpredOp,
          transform: `scale(${unpredScale})`,
        }}
      >
        {/* Orbiting question marks */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = ((orbitAngle + i * 72) * Math.PI) / 180;
          const rx = 260;
          const ry = 60;
          const x = Math.cos(a) * rx;
          const y = Math.sin(a) * ry;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                opacity: orbitOp * (0.3 + 0.7 * Math.abs(Math.sin(a))),
              }}
            >
              <QuestionIcon size={24} color={c.amber} weight="bold" />
            </div>
          );
        })}

        <span
          style={{
            color: c.amber,
            fontSize: 52,
            fontWeight: 800,
            letterSpacing: -1,
            textShadow: `0 0 ${unpredGlow}px ${c.amber}40`,
          }}
        >
          Unpredictability
        </span>
        <span style={{ color: "#64748b", fontSize: 16, fontWeight: 500 }}>
          You never know what the next notification brings
        </span>
      </div>

      {/* Connector — arrow-like bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          opacity: connectorOp,
        }}
      >
        <div
          style={{
            width: `${connectorW * 1.2}px`,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${c.amber}, ${c.red})`,
            boxShadow: `0 0 10px ${c.red}30`,
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `10px solid ${c.red}`,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            filter: `drop-shadow(0 0 4px ${c.red}40)`,
          }}
        />
      </div>

      {/* "ADDICTIVE" slam */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: addictiveOp,
          transform: `scale(${addictiveScale * addictivePulse})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <WarningIcon size={40} color={c.red} weight="duotone" />
          <span
            style={{
              color: c.red,
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: 4,
              textTransform: "uppercase",
              textShadow: `0 0 ${addictiveGlow}px ${c.red}50`,
            }}
          >
            Addictive
          </span>
          <WarningIcon size={40} color={c.red} weight="duotone" />
        </div>

        {/* Brain icon with danger glow */}
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: `${c.red}12`,
            border: `1.5px solid ${c.red}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${addictiveGlow * 0.6}px ${c.red}30`,
          }}
        >
          <BrainIcon size={36} color={c.red} weight="duotone" />
        </div>
      </div>
    </div>
  );
};

export default Generated_VariableRewardScheduling;
