import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
  useVideoConfig,
  Audio,
  Sequence,
  staticFile,
} from "remotion";
import React from "react";

/*
=== JEDNA KOMPOZICIJA PLAN ===
Synced to voiceover-timestamps.json
Using EXACT style from remotion-canvas-demo/InfiniteCanvas.tsx

VOICEOVER TIMING:
- "OpenShell" spoken at frame 90
- "Policy Engine" spoken at frame 501
- "Privacy Router" spoken at frame 796
- Total: 1246 frames (~41.5 sec)

CAMERA KEYFRAMES (15 frames BEFORE word):
- Frame 0: At OpenShell position
- Frame 485: Move to Policy Engine
- Frame 780: Move to Privacy Router
*/

// Premium color palette - EXACT copy from original
const colors = {
  bg: "#030305",
  bgGradient1: "#080810",
  bgGradient2: "#050508",

  openShell: {
    bg: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
    border: "#4f46e5",
    glow: "rgba(79, 70, 229, 0.4)",
    accent: "#818cf8",
  },
  policyEngine: {
    bg: "linear-gradient(145deg, #0f3d3d 0%, #082828 50%, #051a1a 100%)",
    border: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.4)",
    accent: "#5eead4",
  },
  privacyRouter: {
    bg: "linear-gradient(145deg, #3d1a3d 0%, #2d1b3d 50%, #1a0f1a 100%)",
    border: "#c084fc",
    glow: "rgba(192, 132, 252, 0.4)",
    accent: "#e879f9",
  },

  text: "#f8fafc",
  textMuted: "#94a3b8",
  textAccent: "#e2e8f0",
  line: "#60a5fa",
};

// Glassmorphism card style - EXACT copy
const glassStyle = (borderColor: string, glowColor: string): React.CSSProperties => ({
  backdropFilter: "blur(16px) saturate(180%)",
  WebkitBackdropFilter: "blur(16px) saturate(180%)",
  border: `1.5px solid ${borderColor}40`,
  boxShadow: `
    0 0 60px ${glowColor},
    0 0 100px ${glowColor}50,
    0 8px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
  `,
  borderRadius: 20,
});

// Icon component - same style as original
const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 28, color = "#fff" }) => {
  const iconStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 10px ${color}60) drop-shadow(0 0 20px ${color}30)`,
  };

  const icons: Record<string, JSX.Element> = {
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    terminal: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={iconStyle}>
        <path d="M4 17l6-5-6-5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 19h8" strokeLinecap="round"/>
      </svg>
    ),
    file: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
        <path d="M14 2v6h6"/>
      </svg>
    ),
    network: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <circle cx="12" cy="12" r="2"/>
        <circle cx="12" cy="5" r="2"/>
        <circle cx="19" cy="12" r="2"/>
        <circle cx="5" cy="12" r="2"/>
        <path d="M12 7v3M14 12h3M10 12H7"/>
      </svg>
    ),
    api: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z"/>
        <path d="M17 14v3a2 2 0 01-2 2h-1"/>
        <path d="M14 17h6"/>
      </svg>
    ),
    router: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="2" y="14" width="20" height="7" rx="2"/>
        <path d="M6 14V6a2 2 0 012-2h8a2 2 0 012 2v8"/>
        <circle cx="6" cy="17.5" r="1" fill={color}/>
        <circle cx="10" cy="17.5" r="1" fill={color}/>
      </svg>
    ),
    cloud: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
      </svg>
    ),
    server: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="3" y="4" width="18" height="6" rx="1.5"/>
        <rect x="3" y="14" width="18" height="6" rx="1.5"/>
        <circle cx="7" cy="7" r="1.5" fill={color}/>
        <circle cx="7" cy="17" r="1.5" fill={color}/>
      </svg>
    ),
    policy: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  };
  return icons[type] || <div style={{ width: size, height: size }} />;
};

// Section box - EXACT copy from original
const SectionBox: React.FC<{
  title: string;
  colorScheme: { bg: string; border: string; glow: string; accent: string };
  children: React.ReactNode;
  opacity: number;
  scale: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ title, colorScheme, children, opacity, scale, x, y, width, height }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      background: colorScheme.bg,
      ...glassStyle(colorScheme.border, colorScheme.glow),
      padding: 24,
      opacity,
      display: "flex",
      flexDirection: "column",
      transform: `scale(${scale})`,
      transformOrigin: "center center",
    }}
  >
    {/* Decorative corner accents */}
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: 40,
      height: 40,
      borderTop: `2px solid ${colorScheme.accent}`,
      borderLeft: `2px solid ${colorScheme.accent}`,
      borderTopLeftRadius: 20,
      opacity: 0.6,
    }}/>
    <div style={{
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 40,
      height: 40,
      borderBottom: `2px solid ${colorScheme.accent}`,
      borderRight: `2px solid ${colorScheme.accent}`,
      borderBottomRightRadius: 20,
      opacity: 0.6,
    }}/>

    {/* Section header */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${colorScheme.accent} 0%, ${colorScheme.border} 100%)`,
        boxShadow: `0 0 15px ${colorScheme.glow}, 0 0 30px ${colorScheme.glow}50`,
      }}/>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        color: colorScheme.accent,
        textTransform: "uppercase",
        letterSpacing: 3,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
      }}>
        {title}
      </div>
      <div style={{
        flex: 1,
        height: 1,
        background: `linear-gradient(90deg, ${colorScheme.border}40 0%, transparent 100%)`,
        marginLeft: 10,
      }}/>
    </div>

    {/* Content */}
    <div style={{
      flex: 1,
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      justifyContent: "center",
      alignItems: "flex-start",
      alignContent: "flex-start",
    }}>
      {children}
    </div>
  </div>
);

// Node item - EXACT copy from original
const NodeItem: React.FC<{
  label: string;
  icon?: string;
  opacity: number;
  accentColor?: string;
  frame: number;
  delay?: number;
}> = ({ label, icon, opacity, accentColor = "#fff", frame, delay = 0 }) => {
  const { fps } = useVideoConfig();
  const scaleSpring = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 150 },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity,
        color: colors.text,
        transform: `scale(${Math.min(scaleSpring, 1)}) translateY(${(1 - opacity) * 15}px)`,
        width: 85,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          background: `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)`,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid rgba(255,255,255,0.1)`,
          boxShadow: `
            0 4px 24px rgba(0,0,0,0.4),
            0 0 40px ${accentColor}15,
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Shimmer effect */}
        <div style={{
          position: "absolute",
          top: 0,
          left: -60,
          width: 60,
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          transform: `translateX(${(frame * 2) % 180}px)`,
        }}/>
        {icon && <Icon type={icon} size={28} color={accentColor} />}
      </div>
      <span style={{
        fontSize: 11,
        textAlign: "center",
        maxWidth: 75,
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontWeight: 500,
        color: colors.textAccent,
        letterSpacing: 0.3,
      }}>
        {label}
      </span>
    </div>
  );
};

// Animated connection line - EXACT copy
const AnimatedLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color?: string;
  frame: number;
}> = ({ x1, y1, x2, y2, progress, color = colors.line, frame }) => {
  const endX = x1 + (x2 - x1) * progress;
  const endY = y1 + (y2 - y1) * progress;
  const pulseOffset = (frame % 60) / 60;

  return (
    <g>
      {/* Outer glow */}
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={8} strokeOpacity={0.2}
        strokeLinecap="round" filter="blur(6px)"
      />
      {/* Middle glow */}
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={4} strokeOpacity={0.4}
        strokeLinecap="round" filter="blur(2px)"
      />
      {/* Main line */}
      <line
        x1={x1} y1={y1} x2={endX} y2={endY}
        stroke={color} strokeWidth={2} strokeLinecap="round"
      />
      {/* Animated pulse dot */}
      {progress > 0.1 && (
        <circle
          cx={x1 + (endX - x1) * pulseOffset}
          cy={y1 + (endY - y1) * pulseOffset}
          r={3} fill={color} opacity={0.8}
        />
      )}
      {/* End dot */}
      {progress > 0.95 && (
        <circle cx={endX} cy={endY} r={5} fill={color} filter="url(#glow)" />
      )}
    </g>
  );
};

// Mesh gradient background
const MeshGradient: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.5 }}>
    <defs>
      <radialGradient id="mesh1" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
      <radialGradient id="mesh2" cx="70%" cy="60%">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
      <radialGradient id="mesh3" cx="20%" cy="80%">
        <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.08"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
    </defs>
    <ellipse cx="30%" cy="30%" rx="40%" ry="35%" fill="url(#mesh1)"/>
    <ellipse cx="70%" cy="60%" rx="45%" ry="40%" fill="url(#mesh2)"/>
    <ellipse cx="20%" cy="80%" rx="35%" ry="30%" fill="url(#mesh3)"/>
  </svg>
);

// Grid background
const GridBackground: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.08 }}>
    <defs>
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#60a5fa" strokeWidth="0.5"/>
      </pattern>
      <radialGradient id="gridFade" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="white" stopOpacity="1"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </radialGradient>
      <mask id="gridMask">
        <rect width="100%" height="100%" fill="url(#gridFade)"/>
      </mask>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)"/>
  </svg>
);

export const NemoClawStack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const canvasWidth = 3000;
  const canvasHeight = 1500;
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // Camera keyframes - synced to voiceover
  const cameraKeyframes = [
    { frame: 0, x: 350, y: 400, scale: 1.0 },      // OpenShell
    { frame: 485, x: 900, y: 400, scale: 1.0 },    // Policy Engine (word at 501)
    { frame: 780, x: 1450, y: 400, scale: 1.0 },   // Privacy Router (word at 796)
  ];

  const getCameraValue = (prop: "x" | "y" | "scale") => {
    for (let i = 0; i < cameraKeyframes.length - 1; i++) {
      const current = cameraKeyframes[i];
      const next = cameraKeyframes[i + 1];
      if (frame >= current.frame && frame < next.frame) {
        const transitionDuration = 45;
        const springValue = spring({
          frame: frame - current.frame,
          fps,
          config: { damping: 22, stiffness: 90 },
          durationInFrames: transitionDuration,
        });
        return current[prop] + (next[prop] - current[prop]) * Math.min(springValue, 1);
      }
    }
    return cameraKeyframes[cameraKeyframes.length - 1][prop];
  };

  const baseCameraX = getCameraValue("x");
  const baseCameraY = getCameraValue("y");
  const cameraScale = getCameraValue("scale");

  // Subtle breathing movement
  const driftX = Math.sin(frame * 0.05) * 6;
  const driftY = Math.cos(frame * 0.04) * 3;

  const cameraX = baseCameraX + driftX;
  const cameraY = baseCameraY + driftY;

  // Animation helpers
  const getOpacity = (startFrame: number, duration = 8) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const getScale = (startFrame: number, duration = 10) =>
    interpolate(frame, [startFrame, startFrame + duration], [0.85, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.2)),
    });

  const getLineProgress = (startFrame: number, duration = 12) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 120% 100% at 50% 0%, ${colors.bgGradient1} 0%, ${colors.bg} 50%, #000 100%)`,
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <MeshGradient />
      <GridBackground />

      {/* Main canvas */}
      <div
        style={{
          width: canvasWidth,
          height: canvasHeight,
          position: "absolute",
          left: viewportWidth / 2,
          top: viewportHeight / 2,
          transform: `scale(${cameraScale}) translate(${-cameraX}px, ${-cameraY}px)`,
          transformOrigin: "0 0",
        }}
      >
        {/* Connection lines SVG */}
        <svg style={{ position: "absolute", width: canvasWidth, height: canvasHeight, pointerEvents: "none" }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* OpenShell → Policy Engine */}
          <AnimatedLine x1={520} y1={400} x2={630} y2={400} progress={getLineProgress(450)} color={colors.openShell.accent} frame={frame} />
          {/* Policy Engine → Privacy Router */}
          <AnimatedLine x1={1070} y1={400} x2={1180} y2={400} progress={getLineProgress(750)} color={colors.policyEngine.accent} frame={frame} />
        </svg>

        {/* OPENSHELL: word at frame 90, appear at 85 */}
        <SectionBox
          title="OpenShell"
          colorScheme={colors.openShell}
          x={100}
          y={250}
          width={420}
          height={300}
          opacity={getOpacity(85)}
          scale={getScale(85)}
        >
          <NodeItem label="OS Enforcement" icon="shield" opacity={getOpacity(95)} accentColor={colors.openShell.accent} frame={frame} delay={95} />
          <NodeItem label="Sandboxed" icon="lock" opacity={getOpacity(110)} accentColor={colors.openShell.accent} frame={frame} delay={110} />
          <NodeItem label="No Bypass" icon="terminal" opacity={getOpacity(125)} accentColor={colors.openShell.accent} frame={frame} delay={125} />
        </SectionBox>

        {/* POLICY ENGINE: word at frame 501, appear at 496 */}
        <SectionBox
          title="Policy Engine"
          colorScheme={colors.policyEngine}
          x={650}
          y={250}
          width={420}
          height={300}
          opacity={getOpacity(496)}
          scale={getScale(496)}
        >
          <NodeItem label="File Access" icon="file" opacity={getOpacity(510)} accentColor={colors.policyEngine.accent} frame={frame} delay={510} />
          <NodeItem label="Network" icon="network" opacity={getOpacity(530)} accentColor={colors.policyEngine.accent} frame={frame} delay={530} />
          <NodeItem label="API Calls" icon="api" opacity={getOpacity(550)} accentColor={colors.policyEngine.accent} frame={frame} delay={550} />
        </SectionBox>

        {/* PRIVACY ROUTER: word at frame 796, appear at 791 */}
        <SectionBox
          title="Privacy Router"
          colorScheme={colors.privacyRouter}
          x={1200}
          y={250}
          width={420}
          height={300}
          opacity={getOpacity(791)}
          scale={getScale(791)}
        >
          <NodeItem label="Local (Nemo)" icon="server" opacity={getOpacity(805)} accentColor={colors.privacyRouter.accent} frame={frame} delay={805} />
          <NodeItem label="Cloud" icon="cloud" opacity={getOpacity(825)} accentColor={colors.privacyRouter.accent} frame={frame} delay={825} />
          <NodeItem label="Policy Decides" icon="policy" opacity={getOpacity(845)} accentColor={colors.privacyRouter.accent} frame={frame} delay={845} />
        </SectionBox>
      </div>

      {/* Title */}
      <div style={{
        position: "absolute",
        top: 50,
        left: 70,
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        <div style={{
          fontSize: 42,
          fontWeight: 800,
          background: "linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -1.5,
          textShadow: "0 0 60px rgba(99, 102, 241, 0.5)",
        }}>
          NemoClaw Stack
        </div>
        <div style={{
          fontSize: 15,
          color: colors.textMuted,
          marginTop: 12,
          fontWeight: 400,
          letterSpacing: 1,
        }}>
          Enterprise Security for AI Agents
        </div>
      </div>

      {/* Vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }}/>

      {/* Scanlines */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        pointerEvents: "none",
        opacity: 0.5,
      }}/>

      {/* VOICEOVER */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* SOUND EFFECTS */}

      {/* Title reveal */}
      <Sequence from={0} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.15} />
      </Sequence>

      {/* Section 1 reveal - OpenShell at 85 */}
      <Sequence from={85} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
      </Sequence>

      {/* Camera transition 1 - to Policy Engine */}
      <Sequence from={483} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Section 2 reveal - 22 frames after camera */}
      <Sequence from={505} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
      </Sequence>

      {/* Camera transition 2 - to Privacy Router */}
      <Sequence from={778} durationInFrames={30}>
        <Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} />
      </Sequence>

      {/* Section 3 reveal - 22 frames after camera */}
      <Sequence from={800} durationInFrames={20}>
        <Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} />
      </Sequence>

    </AbsoluteFill>
  );
};
