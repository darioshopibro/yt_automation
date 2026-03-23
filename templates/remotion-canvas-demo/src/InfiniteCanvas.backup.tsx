import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
  spring,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";
import React from "react";

// Premium color palette
const colors = {
  bg: "#030305",
  bgGradient1: "#080810",
  bgGradient2: "#050508",

  channels: {
    bg: "linear-gradient(145deg, #0f3d3d 0%, #082828 50%, #051a1a 100%)",
    border: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.4)",
    accent: "#5eead4",
  },
  gateway: {
    bg: "linear-gradient(145deg, #1e1e3f 0%, #151530 50%, #0d0d20 100%)",
    border: "#818cf8",
    glow: "rgba(129, 140, 248, 0.4)",
    accent: "#a5b4fc",
  },
  reasoning: {
    bg: "linear-gradient(145deg, #3d1e5c 0%, #2a1540 50%, #1a0d28 100%)",
    border: "#c084fc",
    glow: "rgba(192, 132, 252, 0.5)",
    accent: "#d8b4fe",
  },
  memory: {
    bg: "linear-gradient(145deg, #3d2e0f 0%, #2a2008 50%, #1a1405 100%)",
    border: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
    accent: "#fcd34d",
  },
  execution: {
    bg: "linear-gradient(145deg, #0f3d1e 0%, #082815 50%, #051a0d 100%)",
    border: "#4ade80",
    glow: "rgba(74, 222, 128, 0.4)",
    accent: "#86efac",
  },
  sessions: {
    bg: "linear-gradient(145deg, #262626 0%, #1a1a1a 50%, #0f0f0f 100%)",
    border: "#a1a1aa",
    glow: "rgba(161, 161, 170, 0.25)",
    accent: "#d4d4d8",
  },

  text: "#f8fafc",
  textMuted: "#94a3b8",
  textAccent: "#e2e8f0",
  line: "#60a5fa",
};

// Glassmorphism card style with enhanced effects
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

// Enhanced Icon component
const Icon: React.FC<{ type: string; size?: number; color?: string }> = ({ type, size = 28, color = "#fff" }) => {
  const iconStyle: React.CSSProperties = {
    filter: `drop-shadow(0 0 10px ${color}60) drop-shadow(0 0 20px ${color}30)`,
  };

  const icons: Record<string, JSX.Element> = {
    whatsapp: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={iconStyle}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    telegram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={iconStyle}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.1.155.234.17.332.015.099.034.323.019.498z"/>
      </svg>
    ),
    discord: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={iconStyle}>
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
    slack: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={iconStyle}>
        <path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z"/>
      </svg>
    ),
    claude: (
      <svg width={size} height={size} viewBox="0 0 24 24" style={iconStyle}>
        <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="1"/>
        <circle cx="12" cy="12" r="2" fill={color}/>
      </svg>
    ),
    gpt: (
      <svg width={size} height={size} viewBox="0 0 24 24" style={iconStyle}>
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1.5" fill={color}/>
      </svg>
    ),
    server: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="3" y="4" width="18" height="6" rx="1.5"/>
        <rect x="3" y="14" width="18" height="6" rx="1.5"/>
        <circle cx="7" cy="7" r="1.5" fill={color}/>
        <circle cx="7" cy="17" r="1.5" fill={color}/>
        <line x1="11" y1="7" x2="17" y2="7" strokeWidth="1"/>
        <line x1="11" y1="17" x2="17" y2="17" strokeWidth="1"/>
      </svg>
    ),
    shell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={iconStyle}>
        <path d="M4 17l6-5-6-5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 19h8" strokeLinecap="round"/>
      </svg>
    ),
    python: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={iconStyle}>
        <path d="M12 2c-1.7 0-3.2.2-4.4.5C5 3.2 4.4 4.6 4.4 6.5V9h7.5v1H4.4c-2 0-3.8 1.2-4.3 3.5C-.6 16.3-.6 18 .1 20.6c.5 2 1.7 3.4 3.6 3.4h2.4V20c0-2.3 2-4.3 4.4-4.3h7.3c1.9 0 3.5-1.6 3.5-3.5V6.5c0-1.9-1.6-3.4-3.5-3.9C16.7 2.2 14.5 2 12 2zM8 4.8c.7 0 1.3.6 1.3 1.4s-.6 1.3-1.3 1.3-1.3-.6-1.3-1.3.6-1.4 1.3-1.4z"/>
      </svg>
    ),
    docker: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={iconStyle}>
        <path d="M4.82 17.35c-.65 0-1.17-.22-1.55-.65-.4-.44-.6-1-.6-1.7 0-.82.3-1.5.9-2.02.37-.32.8-.55 1.28-.7-.1-.4-.15-.77-.15-1.13 0-1.37.5-2.56 1.5-3.57 1-.7 2.15-1.05 3.43-1.05 1.2 0 2.26.32 3.2.95.5.33.92.73 1.27 1.2h4.4c.47 0 .9.17 1.25.52.36.36.53.78.53 1.26v.47c1.15.55 1.72 1.5 1.72 2.85 0 1.06-.35 1.95-1.05 2.67-.5.5-1.08.85-1.75 1.03v.02h-14z"/>
        <rect x="7" y="9" width="2" height="2" rx=".3" fill={colors.bg}/>
        <rect x="10" y="9" width="2" height="2" rx=".3" fill={colors.bg}/>
        <rect x="13" y="9" width="2" height="2" rx=".3" fill={colors.bg}/>
        <rect x="10" y="6" width="2" height="2" rx=".3" fill={colors.bg}/>
      </svg>
    ),
    file: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
        <path d="M14 2v6h6"/>
        <path d="M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    browser: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={iconStyle}>
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/>
        <circle cx="6.5" cy="6" r="1" fill={color}/>
        <circle cx="9.5" cy="6" r="1" fill={color}/>
        <circle cx="12.5" cy="6" r="1" fill={color}/>
      </svg>
    ),
  };
  return icons[type] || <div style={{ width: size, height: size }} />;
};

// Enhanced section box
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

// Node item with enhanced styling
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
    config: { damping: 14, stiffness: 150 },  // Snappier!
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

// Animated connection line with pulse effect
const AnimatedLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  dashed?: boolean;
  color?: string;
  frame: number;
}> = ({ x1, y1, x2, y2, progress, dashed, color = colors.line, frame }) => {
  const endX = x1 + (x2 - x1) * progress;
  const endY = y1 + (y2 - y1) * progress;
  const pulseOffset = (frame % 60) / 60;

  return (
    <g>
      {/* Outer glow */}
      <line
        x1={x1}
        y1={y1}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={8}
        strokeOpacity={0.2}
        strokeLinecap="round"
        strokeDasharray={dashed ? "15,10" : "none"}
        filter="blur(6px)"
      />
      {/* Middle glow */}
      <line
        x1={x1}
        y1={y1}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={4}
        strokeOpacity={0.4}
        strokeLinecap="round"
        strokeDasharray={dashed ? "15,10" : "none"}
        filter="blur(2px)"
      />
      {/* Main line */}
      <line
        x1={x1}
        y1={y1}
        x2={endX}
        y2={endY}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={dashed ? "15,10" : "none"}
      />
      {/* Animated pulse dot */}
      {progress > 0.1 && !dashed && (
        <circle
          cx={x1 + (endX - x1) * pulseOffset}
          cy={y1 + (endY - y1) * pulseOffset}
          r={3}
          fill={color}
          opacity={0.8}
        >
          <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite"/>
        </circle>
      )}
      {/* End dot */}
      {progress > 0.95 && (
        <circle
          cx={endX}
          cy={endY}
          r={5}
          fill={color}
          filter="url(#glow)"
        />
      )}
    </g>
  );
};

// Static mesh gradient background (no animation - cleaner look)
const MeshGradient: React.FC = () => {
  return (
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
};

// Grid with fade
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

export const InfiniteCanvas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const canvasWidth = 4000;
  const canvasHeight = 2400;
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  // Camera keyframes - synced with Rachel voiceover (~54 sec)
  const cameraKeyframes = [
    { frame: 0, x: 230, y: 490, scale: 1.1 },        // Channels (frame 0)
    { frame: 220, x: 635, y: 490, scale: 1.0 },      // Gateway (frame 235)
    { frame: 515, x: 1085, y: 450, scale: 0.95 },    // Reasoning (frame 530)
    { frame: 840, x: 1535, y: 275, scale: 1.0 },     // Memory (frame 854)
    { frame: 1140, x: 1535, y: 620, scale: 0.9 },    // Execution (frame 1157)
    { frame: 1388, x: 1985, y: 540, scale: 1.0 },    // Sessions (frame 1403)
    { frame: 1600, x: 1000, y: 450, scale: 0.55 },   // Zoom out at end
  ];

  const getCameraValue = (prop: "x" | "y" | "scale") => {
    for (let i = 0; i < cameraKeyframes.length - 1; i++) {
      const current = cameraKeyframes[i];
      const next = cameraKeyframes[i + 1];
      if (frame >= current.frame && frame < next.frame) {
        // Smooth camera - 45 frames (~1.5 sec) transition, not instant snap
        const transitionDuration = 45;
        const springValue = spring({
          frame: frame - current.frame,
          fps,
          config: { damping: 22, stiffness: 90 },  // Smooth, settles nicely
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

  // Subtle idle drift - breathing movement
  const driftX = Math.sin(frame * 0.05) * 6;
  const driftY = Math.cos(frame * 0.04) * 3;

  const cameraX = baseCameraX + driftX;
  const cameraY = baseCameraY + driftY;

  // FAST timing - snappy animations (200-300ms)
  const getOpacity = (startFrame: number, duration: number = 8) =>
    interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const getScale = (startFrame: number, duration: number = 10) =>
    interpolate(frame, [startFrame, startFrame + duration], [0.85, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.back(1.2)),  // Less bounce, faster
    });

  const getLineProgress = (startFrame: number, duration: number = 12) =>
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
      {/* Mesh gradient background */}
      <MeshGradient />

      {/* Grid */}
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
          {/* Lines - appear when transitioning between sections */}
          <AnimatedLine x1={360} y1={490} x2={460} y2={490} progress={getLineProgress(200)} color="#2dd4bf" frame={frame} />
          <AnimatedLine x1={810} y1={490} x2={910} y2={450} progress={getLineProgress(500)} color="#818cf8" frame={frame} />
          <AnimatedLine x1={1260} y1={380} x2={1360} y2={275} progress={getLineProgress(820)} color="#c084fc" frame={frame} />
          <AnimatedLine x1={1260} y1={500} x2={1360} y2={620} progress={getLineProgress(1130)} color="#c084fc" frame={frame} />
          <AnimatedLine x1={1710} y1={620} x2={1810} y2={540} progress={getLineProgress(1370)} color="#4ade80" frame={frame} />
          <AnimatedLine x1={1985} y1={680} x2={1985} y2={800} progress={getLineProgress(1550)} color="#a1a1aa" frame={frame} />
        </svg>

        {/* Sections - synced with Rachel voiceover */}

        {/* CHANNELS: frame 0-224 */}
        <SectionBox title="Channels" colorScheme={colors.channels} x={100} y={350} width={260} height={280} opacity={getOpacity(0)} scale={getScale(0)}>
          <NodeItem label="WhatsApp" icon="whatsapp" opacity={getOpacity(28)} accentColor="#25D366" frame={frame} delay={28} />
          <NodeItem label="Telegram" icon="telegram" opacity={getOpacity(58)} accentColor="#0088cc" frame={frame} delay={58} />
          <NodeItem label="Discord" icon="discord" opacity={getOpacity(94)} accentColor="#5865F2" frame={frame} delay={94} />
          <NodeItem label="Slack" icon="slack" opacity={getOpacity(127)} accentColor="#E01E5A" frame={frame} delay={127} />
        </SectionBox>

        {/* GATEWAY: frame 235-512 */}
        <SectionBox title="Gateway Layer" colorScheme={colors.gateway} x={460} y={350} width={350} height={280} opacity={getOpacity(232)} scale={getScale(232)}>
          <NodeItem label="WebSocket" icon="server" opacity={getOpacity(274)} accentColor="#818cf8" frame={frame} delay={274} />
          <NodeItem label="Normalizer" icon="server" opacity={getOpacity(367)} accentColor="#818cf8" frame={frame} delay={367} />
          <NodeItem label="Router" icon="server" opacity={getOpacity(440)} accentColor="#818cf8" frame={frame} delay={440} />
        </SectionBox>

        {/* REASONING: frame 530-840 */}
        <SectionBox title="Reasoning Layer" colorScheme={colors.reasoning} x={910} y={300} width={350} height={300} opacity={getOpacity(527)} scale={getScale(527)}>
          <NodeItem label="Claude" icon="claude" opacity={getOpacity(570)} accentColor="#c084fc" frame={frame} delay={570} />
          <NodeItem label="GPT" icon="gpt" opacity={getOpacity(620)} accentColor="#10a37f" frame={frame} delay={620} />
          <NodeItem label="Local LLM" icon="server" opacity={getOpacity(670)} accentColor="#fbbf24" frame={frame} delay={670} />
          <NodeItem label="Prompts" icon="file" opacity={getOpacity(740)} accentColor="#c084fc" frame={frame} delay={740} />
          <NodeItem label="Context" icon="server" opacity={getOpacity(790)} accentColor="#c084fc" frame={frame} delay={790} />
        </SectionBox>

        {/* MEMORY: frame 854-1146 */}
        <SectionBox title="Memory Layer" colorScheme={colors.memory} x={1360} y={150} width={350} height={250} opacity={getOpacity(851)} scale={getScale(851)}>
          <NodeItem label="WAL Files" icon="file" opacity={getOpacity(900)} accentColor="#fbbf24" frame={frame} delay={900} />
          <NodeItem label="Context" icon="server" opacity={getOpacity(980)} accentColor="#fbbf24" frame={frame} delay={980} />
          <NodeItem label="Markdown" icon="file" opacity={getOpacity(1050)} accentColor="#fbbf24" frame={frame} delay={1050} />
        </SectionBox>

        {/* EXECUTION: frame 1157-1392 */}
        <SectionBox title="Execution Layer" colorScheme={colors.execution} x={1360} y={470} width={350} height={300} opacity={getOpacity(1154)} scale={getScale(1154)}>
          <NodeItem label="Shell" icon="shell" opacity={getOpacity(1190)} accentColor="#4ade80" frame={frame} delay={1190} />
          <NodeItem label="Python" icon="python" opacity={getOpacity(1220)} accentColor="#3776ab" frame={frame} delay={1220} />
          <NodeItem label="ClawHub" icon="server" opacity={getOpacity(1250)} accentColor="#4ade80" frame={frame} delay={1250} />
          <NodeItem label="Browser" icon="browser" opacity={getOpacity(1280)} accentColor="#4ade80" frame={frame} delay={1280} />
          <NodeItem label="Docker" icon="docker" opacity={getOpacity(1320)} accentColor="#2496ed" frame={frame} delay={1320} />
        </SectionBox>

        {/* SESSIONS: frame 1403-1606 */}
        <SectionBox title="Sessions" colorScheme={colors.sessions} x={1810} y={400} width={350} height={280} opacity={getOpacity(1400)} scale={getScale(1400)}>
          <NodeItem label="WhatsApp" icon="whatsapp" opacity={getOpacity(1440)} accentColor="#25D366" frame={frame} delay={1440} />
          <NodeItem label="Discord" icon="discord" opacity={getOpacity(1480)} accentColor="#5865F2" frame={frame} delay={1480} />
          <NodeItem label="Cron Jobs" icon="server" opacity={getOpacity(1530)} accentColor="#a1a1aa" frame={frame} delay={1530} />
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
          OpenClaw Architecture
        </div>
        <div style={{
          fontSize: 15,
          color: colors.textMuted,
          marginTop: 12,
          fontWeight: 400,
          letterSpacing: 1,
        }}>
          Multi-Platform AI Assistant Framework
        </div>
      </div>

      {/* Vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none",
      }}/>

      {/* Subtle scanlines */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        pointerEvents: "none",
        opacity: 0.5,
      }}/>

      {/* Voiceover audio */}
      <Audio src={staticFile("voiceover.mp3")} />
    </AbsoluteFill>
  );
};
