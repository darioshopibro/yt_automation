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
Branch Layout Test - Data Flow with Fork

VOICEOVER TIMING:
- "Input" at frame 53
- "Router" at frame 377
- "Local" at frame 675
- "Cloud" at frame 942
- "Output" at frame 1219
- Total: 1500 frames (~50 sec)

LAYOUT (branch):
     ┌─────────┐
     │  INPUT  │  (x: 750, y: 200)
     └────┬────┘
          │
     ┌────┴────┐
     │ ROUTER  │  (x: 750, y: 450)
     └────┬────┘
          │
    ╱           ╲
┌───────┐   ┌───────┐
│ LOCAL │   │ CLOUD │  (x: 400, y: 750) and (x: 1100, y: 750)
└───┬───┘   └───┬───┘
    ╲           ╱
     ┌────┴────┐
     │ OUTPUT  │  (x: 750, y: 1050)
     └─────────┘

CAMERA KEYFRAMES:
- Frame 0: At Input (y: 200)
- Frame 360: Move to Router (y: 450)
- Frame 655: Zoom out for both paths (y: 750, scale: 0.8)
- Frame 1200: Move to Output (y: 1050)
*/

const colors = {
  bg: "#030305",
  bgGradient1: "#080810",
  text: "#f8fafc",
  textMuted: "#94a3b8",
  textAccent: "#e2e8f0",
  line: "#60a5fa",

  input: {
    bg: "linear-gradient(145deg, #1e1e3f 0%, #151530 50%, #0d0d20 100%)",
    border: "#818cf8",
    glow: "rgba(129, 140, 248, 0.4)",
    accent: "#a5b4fc",
  },
  router: {
    bg: "linear-gradient(145deg, #3d1e5c 0%, #2a1540 50%, #1a0d28 100%)",
    border: "#c084fc",
    glow: "rgba(192, 132, 252, 0.5)",
    accent: "#d8b4fe",
  },
  local: {
    bg: "linear-gradient(145deg, #0f3d1e 0%, #082815 50%, #051a0d 100%)",
    border: "#4ade80",
    glow: "rgba(74, 222, 128, 0.4)",
    accent: "#86efac",
  },
  cloud: {
    bg: "linear-gradient(145deg, #0f3d3d 0%, #082828 50%, #051a1a 100%)",
    border: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.4)",
    accent: "#5eead4",
  },
  output: {
    bg: "linear-gradient(145deg, #3d2e0f 0%, #2a2008 50%, #1a1405 100%)",
    border: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
    accent: "#fcd34d",
  },
};

const glassStyle = (borderColor: string, glowColor: string): React.CSSProperties => ({
  backdropFilter: "blur(16px) saturate(180%)",
  border: `1.5px solid ${borderColor}40`,
  boxShadow: `0 0 60px ${glowColor}, 0 0 100px ${glowColor}50, 0 8px 40px rgba(0, 0, 0, 0.6)`,
  borderRadius: 20,
});

const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 28, color = "#fff" }) => {
  const iconStyle: React.CSSProperties = { filter: `drop-shadow(0 0 10px ${color}60)` };
  const icons: Record<string, JSX.Element> = {
    input: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M12 2v10M12 12l4-4M12 12l-4-4"/>
        <rect x="4" y="14" width="16" height="8" rx="2"/>
      </svg>
    ),
    router: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v7M12 15v7M2 12h7M15 12h7"/>
      </svg>
    ),
    server: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="3" y="4" width="18" height="6" rx="1.5"/>
        <rect x="3" y="14" width="18" height="6" rx="1.5"/>
        <circle cx="7" cy="7" r="1.5" fill={color}/><circle cx="7" cy="17" r="1.5" fill={color}/>
      </svg>
    ),
    cloud: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
      </svg>
    ),
    output: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="4" y="2" width="16" height="8" rx="2"/>
        <path d="M12 10v10M12 20l4-4M12 20l-4-4"/>
      </svg>
    ),
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  };
  return icons[type] || <div style={{ width: size, height: size }} />;
};

// Smart grid columns based on item count
const getGridCols = (count: number) => {
  if (count <= 2) return count;  // 1-2: single row
  if (count === 3) return 3;     // 3: one row of 3
  if (count === 4) return 2;     // 4: 2x2 grid
  if (count <= 6) return 3;      // 5-6: 3 columns
  return 4;                      // 7+: 4 columns
};

// Dynamic container size based on item count
const ITEM_WIDTH = 85;      // NodeItem fixed width
const ITEM_HEIGHT = 100;    // Icon (60) + gap (10) + label (~30)
const GAP = 20;
const PADDING_X = 48;       // 24px left + 24px right
const PADDING_Y = 36;       // 24px top + 12px bottom (less bottom to balance header)
const HEADER_HEIGHT = 50;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

const getContainerSize = (itemCount: number) => {
  const cols = getGridCols(itemCount);
  const rows = Math.ceil(itemCount / cols);

  const contentWidth = (cols * ITEM_WIDTH) + ((cols - 1) * GAP);
  const contentHeight = (rows * ITEM_HEIGHT) + ((rows - 1) * GAP);

  const width = Math.max(MIN_WIDTH, PADDING_X + contentWidth);
  const height = Math.max(MIN_HEIGHT, HEADER_HEIGHT + PADDING_Y + contentHeight);

  return { width, height };
};

const SectionBox: React.FC<{
  title: string;
  colorScheme: { bg: string; border: string; glow: string; accent: string };
  children: React.ReactNode;
  opacity: number;
  scale: number;
  x: number;
  y: number;
  width?: number;   // Optional - auto-calculate if not provided
  height?: number;  // Optional - auto-calculate if not provided
}> = ({ title, colorScheme, children, opacity, scale, x, y, width, height }) => {
  const childCount = React.Children.count(children);

  // Auto-calculate size if not provided
  const autoSize = getContainerSize(childCount);
  const finalWidth = width ?? autoSize.width;
  const finalHeight = height ?? autoSize.height;

  return (
    <div style={{
      position: "absolute", left: x, top: y, width: finalWidth, height: finalHeight, background: colorScheme.bg,
      ...glassStyle(colorScheme.border, colorScheme.glow),
      padding: "24px 24px 12px 24px", // Less bottom padding to balance header
      opacity, display: "flex", flexDirection: "column",
      transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTop: `2px solid ${colorScheme.accent}`, borderLeft: `2px solid ${colorScheme.accent}`, borderTopLeftRadius: 20, opacity: 0.6 }}/>
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottom: `2px solid ${colorScheme.accent}`, borderRight: `2px solid ${colorScheme.accent}`, borderBottomRightRadius: 20, opacity: 0.6 }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: `linear-gradient(135deg, ${colorScheme.accent}, ${colorScheme.border})`, boxShadow: `0 0 15px ${colorScheme.glow}` }}/>
        <div style={{ fontSize: 12, fontWeight: 700, color: colorScheme.accent, textTransform: "uppercase", letterSpacing: 3, fontFamily: "'SF Mono', monospace" }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${colorScheme.border}40, transparent)` }}/>
      </div>
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: `repeat(${getGridCols(childCount)}, minmax(0, 1fr))`,
        gap: 20,
        justifyItems: "center",
        alignContent: "start",
      }}>{children}</div>
    </div>
  );
};

const NodeItem: React.FC<{
  label: string;
  icon?: string;
  opacity: number;
  accentColor?: string;
  frame: number;
  delay?: number;
  highlightStart?: number;  // Frame when highlight starts
  highlightEnd?: number;    // Frame when highlight ends
}> = ({ label, icon, opacity, accentColor = "#fff", frame, delay = 0, highlightStart, highlightEnd }) => {
  const { fps } = useVideoConfig();
  const scaleSpring = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 150 } });

  // Highlight animation: scale boost + glow when item is being mentioned
  const isHighlighted = highlightStart !== undefined && highlightEnd !== undefined
    && frame >= highlightStart && frame <= highlightEnd;

  const highlightProgress = highlightStart !== undefined && highlightEnd !== undefined
    ? interpolate(
        frame,
        [highlightStart, highlightStart + 10, highlightEnd - 10, highlightEnd],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  // Highlight effects
  const highlightScale = 1 + (highlightProgress * 0.15);  // Scale up to 1.15x
  const highlightGlow = highlightProgress * 0.6;          // Extra glow intensity
  const pulseScale = isHighlighted ? 1 + Math.sin(frame * 0.3) * 0.03 : 1;  // Subtle pulse

  const finalScale = Math.min(scaleSpring, 1) * highlightScale * pulseScale;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      opacity,
      width: 85,
      transform: `scale(${finalScale}) translateY(${(1 - opacity) * 15}px)`,
      zIndex: isHighlighted ? 10 : 1,
      transition: "z-index 0.1s",
    }}>
      <div style={{
        width: 60,
        height: 60,
        background: isHighlighted
          ? `linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))`
          : "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isHighlighted
          ? `0 4px 24px rgba(0,0,0,0.4), 0 0 60px ${accentColor}${Math.round(40 + highlightGlow * 60).toString(16)}, 0 0 100px ${accentColor}${Math.round(20 + highlightGlow * 40).toString(16)}`
          : `0 4px 24px rgba(0,0,0,0.4), 0 0 40px ${accentColor}15`,
        position: "relative",
        overflow: "hidden",
        border: isHighlighted ? `2px solid ${accentColor}60` : "none",
      }}>
        <div style={{ position: "absolute", top: 0, left: -60, width: 60, height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", transform: `translateX(${(frame * 2) % 180}px)` }}/>
        {icon && <Icon type={icon} size={28} color={accentColor} />}
      </div>
      <span style={{
        fontSize: isHighlighted ? 12 : 11,
        textAlign: "center",
        maxWidth: 75,
        fontWeight: isHighlighted ? 700 : 500,
        color: isHighlighted ? accentColor : colors.textAccent,
        textShadow: isHighlighted ? `0 0 10px ${accentColor}80` : "none",
      }}>{label}</span>
    </div>
  );
};

const AnimatedLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number; progress: number; color?: string; frame: number; curved?: boolean;
}> = ({ x1, y1, x2, y2, progress, color = colors.line, frame, curved }) => {
  // DON'T RENDER if progress <= 0 (line hasn't started yet)
  if (progress <= 0) return null;

  const endX = x1 + (x2 - x1) * progress;
  const endY = y1 + (y2 - y1) * progress;
  const pulseOffset = (frame % 60) / 60;

  if (curved) {
    const midX = (x1 + x2) / 2;
    const midY = y1 + (y2 - y1) * 0.3;
    const path = `M ${x1} ${y1} Q ${midX} ${midY} ${endX} ${endY}`;
    return (
      <g>
        <path d={path} stroke={color} strokeWidth={8} strokeOpacity={0.2} fill="none" strokeLinecap="round" filter="blur(6px)" />
        <path d={path} stroke={color} strokeWidth={4} strokeOpacity={0.4} fill="none" strokeLinecap="round" filter="blur(2px)" />
        <path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g>
      <line x1={x1} y1={y1} x2={endX} y2={endY} stroke={color} strokeWidth={8} strokeOpacity={0.2} strokeLinecap="round" filter="blur(6px)" />
      <line x1={x1} y1={y1} x2={endX} y2={endY} stroke={color} strokeWidth={4} strokeOpacity={0.4} strokeLinecap="round" filter="blur(2px)" />
      <line x1={x1} y1={y1} x2={endX} y2={endY} stroke={color} strokeWidth={2} strokeLinecap="round" />
      {progress > 0.1 && <circle cx={x1 + (endX - x1) * pulseOffset} cy={y1 + (endY - y1) * pulseOffset} r={3} fill={color} opacity={0.8} />}
      {progress > 0.95 && <circle cx={endX} cy={endY} r={5} fill={color} filter="url(#glow)" />}
    </g>
  );
};

const MeshGradient: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.5 }}>
    <defs>
      <radialGradient id="mesh1" cx="30%" cy="30%"><stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12"/><stop offset="100%" stopColor="transparent"/></radialGradient>
      <radialGradient id="mesh2" cx="70%" cy="60%"><stop offset="0%" stopColor="#7c3aed" stopOpacity="0.1"/><stop offset="100%" stopColor="transparent"/></radialGradient>
    </defs>
    <ellipse cx="30%" cy="30%" rx="40%" ry="35%" fill="url(#mesh1)"/>
    <ellipse cx="70%" cy="60%" rx="45%" ry="40%" fill="url(#mesh2)"/>
  </svg>
);

const GridBackground: React.FC = () => (
  <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.08 }}>
    <defs>
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="#60a5fa" strokeWidth="0.5"/></pattern>
      <radialGradient id="gridFade" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="1"/><stop offset="100%" stopColor="white" stopOpacity="0"/></radialGradient>
      <mask id="gridMask"><rect width="100%" height="100%" fill="url(#gridFade)"/></mask>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gridMask)"/>
  </svg>
);

export const BranchFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const canvasWidth = 2000;
  const canvasHeight = 1400;
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // Camera keyframes - BRANCH LAYOUT
  // Input at 53, Router at 377, Local at 675, Cloud at 942, Output at 1219
  const cameraKeyframes = [
    { frame: 0, x: 750, y: 200, scale: 1.0 },       // Input (word at 53)
    { frame: 360, x: 750, y: 450, scale: 1.0 },     // Router (word at 377)
    { frame: 655, x: 750, y: 750, scale: 0.75 },    // BOTH paths - zoom out! (words at 675, 942)
    { frame: 1200, x: 750, y: 1050, scale: 1.0 },   // Output (word at 1219)
  ];

  const getCameraValue = (prop: "x" | "y" | "scale") => {
    for (let i = 0; i < cameraKeyframes.length - 1; i++) {
      const current = cameraKeyframes[i];
      const next = cameraKeyframes[i + 1];
      if (frame >= current.frame && frame < next.frame) {
        const springValue = spring({ frame: frame - current.frame, fps, config: { damping: 22, stiffness: 90 }, durationInFrames: 45 });
        return current[prop] + (next[prop] - current[prop]) * Math.min(springValue, 1);
      }
    }
    return cameraKeyframes[cameraKeyframes.length - 1][prop];
  };

  const cameraX = getCameraValue("x") + Math.sin(frame * 0.05) * 6;
  const cameraY = getCameraValue("y") + Math.cos(frame * 0.04) * 3;
  const cameraScale = getCameraValue("scale");

  const getOpacity = (startFrame: number, duration = 8) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const getScale = (startFrame: number, duration = 10) =>
    interpolate(frame, [startFrame, startFrame + duration], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.2)) });
  const getLineProgress = (startFrame: number, duration = 15) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });

  // PAIRED CONTAINERS: LOCAL (3 items) and CLOUD (2 items) - use MAX size for both
  const localItemCount = 3;
  const cloudItemCount = 2;  // Testing with different count!
  const localSize = getContainerSize(localItemCount);
  const cloudSize = getContainerSize(cloudItemCount);
  const pairedSize = {
    width: Math.max(localSize.width, cloudSize.width),
    height: Math.max(localSize.height, cloudSize.height),
  };

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 120% 100% at 50% 0%, ${colors.bgGradient1} 0%, ${colors.bg} 50%, #000 100%)`, overflow: "hidden", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <MeshGradient />
      <GridBackground />

      <div style={{ width: canvasWidth, height: canvasHeight, position: "absolute", left: viewportWidth / 2, top: viewportHeight / 2, transform: `scale(${cameraScale}) translate(${-cameraX}px, ${-cameraY}px)`, transformOrigin: "0 0" }}>

        {/* Connection lines - START AFTER DESTINATION BOX! */}
        {/* Formula: lineStart = max(sourceBox.startFrame, destBox.startFrame) + 10 */}
        <svg style={{ position: "absolute", width: canvasWidth, height: canvasHeight, pointerEvents: "none" }}>
          <defs><filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>

          {/* Input(48) → Router(372): max(48,372)+10 = 382 */}
          <AnimatedLine x1={750} y1={320} x2={750} y2={380} progress={getLineProgress(382)} color={colors.input.accent} frame={frame} />

          {/* Router(372) → Local(670): max(372,670)+10 = 680 - STRAIGHT diagonal */}
          <AnimatedLine x1={680} y1={520} x2={400} y2={680} progress={getLineProgress(680)} color={colors.router.accent} frame={frame} />

          {/* Router(372) → Cloud(937): max(372,937)+10 = 947 - STRAIGHT diagonal */}
          <AnimatedLine x1={820} y1={520} x2={1100} y2={680} progress={getLineProgress(947)} color={colors.router.accent} frame={frame} />

          {/* Local(670) → Output(1214): max(670,1214)+10 = 1224 - STRAIGHT diagonal */}
          <AnimatedLine x1={400} y1={820} x2={680} y2={980} progress={getLineProgress(1224)} color={colors.local.accent} frame={frame} />

          {/* Cloud(937) → Output(1214): max(937,1214)+10 = 1224 - STRAIGHT diagonal */}
          <AnimatedLine x1={1100} y1={820} x2={820} y2={980} progress={getLineProgress(1224)} color={colors.cloud.accent} frame={frame} />
        </svg>

        {/* INPUT - word at frame 53 (auto-size: 3 items) */}
        <SectionBox title="Input Layer" colorScheme={colors.input} x={750} y={200} opacity={getOpacity(48)} scale={getScale(48)}>
          <NodeItem label="User Queries" icon="input" opacity={getOpacity(60)} accentColor={colors.input.accent} frame={frame} delay={60} />
          <NodeItem label="API Calls" icon="server" opacity={getOpacity(80)} accentColor={colors.input.accent} frame={frame} delay={80} />
          <NodeItem label="Scheduled" icon="zap" opacity={getOpacity(100)} accentColor={colors.input.accent} frame={frame} delay={100} />
          {/* HIGHLIGHT AVAILABLE: highlightStart={frame} highlightEnd={frame} */}
        </SectionBox>

        {/* ROUTER - word at frame 377 (auto-size: 2 items) */}
        <SectionBox title="Router" colorScheme={colors.router} x={750} y={450} opacity={getOpacity(372)} scale={getScale(372)}>
          <NodeItem label="Analyzer" icon="router" opacity={getOpacity(385)} accentColor={colors.router.accent} frame={frame} delay={385} />
          <NodeItem label="Decision" icon="zap" opacity={getOpacity(410)} accentColor={colors.router.accent} frame={frame} delay={410} />
        </SectionBox>

        {/* LOCAL PATH - word at frame 675 (3 items) */}
        <SectionBox title="Local Path" colorScheme={colors.local} x={400} y={750} width={pairedSize.width} height={pairedSize.height} opacity={getOpacity(670)} scale={getScale(670)}>
          <NodeItem label="On-Device" icon="server" opacity={getOpacity(685)} accentColor={colors.local.accent} frame={frame} delay={685} />
          <NodeItem label="Private" icon="lock" opacity={getOpacity(705)} accentColor={colors.local.accent} frame={frame} delay={705} />
          <NodeItem label="Nemo" icon="zap" opacity={getOpacity(725)} accentColor={colors.local.accent} frame={frame} delay={725} />
        </SectionBox>

        {/* CLOUD PATH - word at frame 942 (2 items - testing different count!) */}
        <SectionBox title="Cloud Path" colorScheme={colors.cloud} x={1100} y={750} width={pairedSize.width} height={pairedSize.height} opacity={getOpacity(937)} scale={getScale(937)}>
          <NodeItem label="Fast" icon="zap" opacity={getOpacity(950)} accentColor={colors.cloud.accent} frame={frame} delay={950} />
          <NodeItem label="Scalable" icon="cloud" opacity={getOpacity(970)} accentColor={colors.cloud.accent} frame={frame} delay={970} />
        </SectionBox>

        {/* OUTPUT - word at frame 1219 (auto-size: 2 items) */}
        <SectionBox title="Output Layer" colorScheme={colors.output} x={750} y={1050} opacity={getOpacity(1214)} scale={getScale(1214)}>
          <NodeItem label="Responses" icon="output" opacity={getOpacity(1230)} accentColor={colors.output.accent} frame={frame} delay={1230} />
          <NodeItem label="Unified" icon="router" opacity={getOpacity(1250)} accentColor={colors.output.accent} frame={frame} delay={1250} />
        </SectionBox>
      </div>

      {/* Title */}
      <div style={{ position: "absolute", top: 50, left: 70, opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" }) }}>
        <div style={{ fontSize: 42, fontWeight: 800, background: "linear-gradient(135deg, #f8fafc, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -1.5 }}>Data Flow Pipeline</div>
        <div style={{ fontSize: 15, color: colors.textMuted, marginTop: 12 }}>Intelligent Routing with Privacy</div>
      </div>

      {/* Vignette + Scanlines */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)", pointerEvents: "none", opacity: 0.5 }}/>

      {/* VOICEOVER */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* SOUND EFFECTS */}
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.15} /></Sequence>
      <Sequence from={48} durationInFrames={20}><Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} /></Sequence>
      <Sequence from={358} durationInFrames={30}><Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} /></Sequence>
      <Sequence from={380} durationInFrames={20}><Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} /></Sequence>
      <Sequence from={653} durationInFrames={30}><Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} /></Sequence>
      <Sequence from={675} durationInFrames={20}><Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} /></Sequence>
      <Sequence from={937} durationInFrames={20}><Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} /></Sequence>
      <Sequence from={1198} durationInFrames={30}><Audio src={staticFile("sounds/whooshes/medium-whoosh.mp3")} volume={0.25} /></Sequence>
      <Sequence from={1220} durationInFrames={20}><Audio src={staticFile("sounds/whooshes/soft-whoosh.mp3")} volume={0.12} /></Sequence>
    </AbsoluteFill>
  );
};
