import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";

// ============================================================
// SPRING PRESETS — low damping = visible overshoot!
// ============================================================
const SP = {
  // Bouncy pop: scale 0→1.12→0.97→1.02→1
  pop: { mass: 0.6, damping: 9, stiffness: 180, overshootClamping: false },
  // Heavy drop: weighty, slower settle
  drop: { mass: 1.8, damping: 11, stiffness: 140, overshootClamping: false },
  // Soft slide: gentle, almost no bounce
  soft: { mass: 0.9, damping: 16, stiffness: 100, overshootClamping: false },
  // Snappy: fast with micro-bounce
  snap: { mass: 0.35, damping: 10, stiffness: 260, overshootClamping: false },
};

// ============================================================
// CAMERA — smooth Y scroll + scale zoom
// ============================================================
interface CK { f: number; y: number; s: number }
const CK: CK[] = [
  { f: 0,    y: 420,  s: 1.0 },
  { f: 130,  y: 1150, s: 1.0 },
  { f: 220,  y: 1350, s: 1.2 },
  { f: 400,  y: 1550, s: 1.0 },
  { f: 500,  y: 2350, s: 1.0 },
  { f: 610,  y: 2600, s: 1.18 },
  { f: 740,  y: 2850, s: 1.0 },
  { f: 840,  y: 3550, s: 1.0 },
  { f: 950,  y: 3750, s: 1.15 },
  { f: 1100, y: 3950, s: 1.0 },
  { f: 1200, y: 4750, s: 1.0 },
  { f: 1320, y: 5000, s: 1.15 },
  { f: 1460, y: 5500, s: 1.0 },
  { f: 1800, y: 5500, s: 1.0 },
];

function cam(frame: number, p: "y" | "s"): number {
  if (frame <= CK[0].f) return CK[0][p];
  if (frame >= CK[CK.length - 1].f) return CK[CK.length - 1][p];
  for (let i = 0; i < CK.length - 1; i++) {
    if (frame >= CK[i].f && frame <= CK[i + 1].f) {
      const t = (frame - CK[i].f) / (CK[i + 1].f - CK[i].f);
      const e = Easing.bezier(0.4, 0.0, 0.2, 1.0)(t);
      return CK[i][p] + (CK[i + 1][p] - CK[i][p]) * e;
    }
  }
  return CK[0][p];
}

// ============================================================
// ANIMATED PATH — stroke-dashoffset draw-on
// ============================================================
const Path: React.FC<{
  d: string; len: number; at: number;
  color?: string; width?: number; dash?: boolean;
}> = ({ d, len, at, color = "rgba(255,255,255,0.2)", width = 2, dash = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < 0) return null;

  const p = spring({ frame: f, fps, config: { mass: 1.2, damping: 20, stiffness: 35 } });
  const off = interpolate(p, [0, 1], [len, 0]);
  const id = `m${at}${len}`;

  return (
    <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {dash ? (
        <>
          <defs>
            <mask id={id}>
              <path d={d} stroke="white" strokeWidth={width + 6} fill="none"
                strokeDasharray={len} strokeDashoffset={off} strokeLinecap="round" />
            </mask>
          </defs>
          <path d={d} stroke={color} strokeWidth={width} strokeDasharray="8 5"
            fill="none" strokeLinecap="round" mask={`url(#${id})`} />
        </>
      ) : (
        <path d={d} stroke={color} strokeWidth={width} fill="none"
          strokeDasharray={len} strokeDashoffset={off} strokeLinecap="round" />
      )}
    </svg>
  );
};

// ============================================================
// CARD — the main "folder" / panel component
// Expands: shadow first → width → height → content slides in
// Has STRONG shadows for depth (neumorphism)
// ============================================================
const Card: React.FC<{
  at: number; w: number; h: number; x: number; y: number;
  accent?: string; bg?: string;
  children: React.ReactNode;
}> = ({ at, w, h, x, y, accent = "#60A5FA", bg = "rgba(18,24,40,0.92)", children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < -5) return null;

  // Phase 1: scale pop with overshoot
  const scaleSpring = spring({ frame: Math.max(0, f), fps, config: SP.pop });
  const scale = interpolate(scaleSpring, [0, 1], [0.6, 1]);

  // Phase 2: width/height expand
  const ew = spring({ frame: Math.max(0, f - 2), fps, config: SP.drop });
  const eh = spring({ frame: Math.max(0, f - 8), fps, config: { mass: 1.4, damping: 13, stiffness: 110 } });

  // Phase 3: content reveals
  const contentAlpha = interpolate(f, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const contentSlide = interpolate(f, [18, 32], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Dynamic shadow — gets bigger as card "lands"
  const shadowY = interpolate(scaleSpring, [0, 1], [2, 18]);
  const shadowBlur = interpolate(scaleSpring, [0, 1], [5, 45]);
  const shadowAlpha = interpolate(scaleSpring, [0, 1], [0.05, 0.35]);

  const curW = interpolate(ew, [0, 1], [80, w]);
  const curH = interpolate(eh, [0, 1], [16, h]);

  return (
    <div style={{
      position: "absolute", left: x + (w - curW) / 2, top: y + (h - curH) / 2,
      width: curW, height: curH,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
      background: bg,
      border: `1.5px solid ${accent}33`,
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: `
        0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha}),
        0 0 0 1px ${accent}15,
        inset 0 1px 0 rgba(255,255,255,0.05)
      `,
      backdropFilter: "blur(20px)",
    }}>
      <div style={{
        opacity: contentAlpha,
        transform: `translateY(${contentSlide}px)`,
        padding: 22,
        height: "100%",
      }}>
        {children}
      </div>
    </div>
  );
};

// ============================================================
// ENTER — spring entrance with REAL overshoot
// ============================================================
const Enter: React.FC<{
  at: number;
  type?: "pop" | "drop" | "left" | "right" | "up";
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, type = "pop", children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - at;
  if (f < -1) return null;

  const s = spring({ frame: Math.max(0, f), fps, config: type === "pop" ? SP.pop : type === "drop" ? SP.drop : SP.snap });
  const alpha = interpolate(s, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });

  let tx = 0, ty = 0, sc = 1;
  switch (type) {
    case "pop":
      sc = interpolate(s, [0, 1], [0.3, 1]);
      break;
    case "drop":
      ty = interpolate(s, [0, 1], [-80, 0]);
      sc = interpolate(s, [0, 1], [0.85, 1]);
      break;
    case "left":
      tx = interpolate(s, [0, 1], [-100, 0]);
      break;
    case "right":
      tx = interpolate(s, [0, 1], [100, 0]);
      break;
    case "up":
      ty = interpolate(s, [0, 1], [50, 0]);
      break;
  }

  return (
    <div style={{
      ...style,
      transform: `translate(${tx}px, ${ty}px) scale(${sc})`,
      opacity: alpha,
    }}>
      {children}
    </div>
  );
};

// ============================================================
// TEXT STAGGER — line by line slide up + fade
// ============================================================
const TextBlock: React.FC<{
  lines: string[]; at: number; gap?: number;
  size?: number; color?: string; weight?: number;
  style?: React.CSSProperties;
}> = ({ lines, at, gap = 5, size = 22, color = "rgba(255,255,255,0.55)", weight = 400, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, ...style }}>
      {lines.map((line, i) => {
        const s = spring({ frame: Math.max(0, frame - at - i * gap), fps, config: SP.soft });
        return (
          <div key={i} style={{
            transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)`,
            opacity: interpolate(s, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }),
            fontSize: size, fontWeight: weight, color, lineHeight: 1.55,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// ICON — floating badge with bob
// ============================================================
const Icon: React.FC<{
  emoji: string; x: number; y: number; at: number;
  size?: number; bg?: string;
}> = ({ emoji, x, y, at, size = 58, bg = "rgba(96,165,250,0.12)" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;

  const s = spring({ frame: frame - at, fps, config: SP.pop });
  const bob = frame > at + 25 ? Math.sin((frame - at) * 0.05) * 3.5 : 0;
  const sc = interpolate(s, [0, 1], [0.15, 1]);

  return (
    <div style={{
      position: "absolute", left: x, top: y + bob,
      width: size, height: size, borderRadius: 14,
      backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.48,
      transform: `scale(${sc})`,
      opacity: interpolate(s, [0, 0.2], [0, 1], { extrapolateRight: "clamp" }),
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: `0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
    }}>
      {emoji}
    </div>
  );
};

// ============================================================
// GLOW — background ambient light
// ============================================================
const Glow: React.FC<{ x: number; y: number; r: number; color: string; at: number }> = ({ x, y, r, color, at }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const pulse = Math.sin((frame - at) * 0.025) * 0.12 + 0.88;
  const fade = interpolate(frame - at, [0, 50], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity: fade * pulse * 0.3, filter: "blur(60px)", pointerEvents: "none",
    }} />
  );
};

// ============================================================
// STEP HEADER
// ============================================================
const Step: React.FC<{ num: string; title: string; color: string; x: number; y: number; at: number }> = ({ num, title, color, x, y, at }) => (
  <>
    <Enter at={at} type="left" style={{ position: "absolute", left: x, top: y }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 3.5 }}>{num}</div>
    </Enter>
    <Enter at={at + 5} type="left" style={{ position: "absolute", left: x, top: y + 24 }}>
      <div style={{ fontSize: 42, fontWeight: 800, color: "white", letterSpacing: -1 }}>{title}</div>
    </Enter>
  </>
);

// ============================================================
// MAIN
// ============================================================
export const ShortVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const cY = cam(frame, "y");
  const cS = cam(frame, "s");
  const drift = Math.sin(frame * 0.006) * 4;

  // Canvas transform: move canvas so camera target is centered in viewport
  const canvasY = 1920 / 2 - (cY + drift) * cS;

  return (
    <AbsoluteFill style={{
      backgroundColor: "#080C18", overflow: "hidden",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* BG: subtle grid with parallax */}
      <div style={{
        position: "absolute", inset: -100,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        transform: `translateY(${-cY * 0.06}px)`,
      }} />

      {/* BG: large ambient glow */}
      <div style={{
        position: "absolute",
        left: 200, top: 400 + canvasY * 0.15,
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />

      {/* ===== CANVAS ===== */}
      <div style={{
        position: "absolute", left: 0, top: canvasY,
        width: 1080,
        transform: `scale(${cS})`,
        transformOrigin: "540px 0px",
      }}>

        {/* ===== HOOK (y 100-700) ===== */}
        <Glow x={540} y={280} r={320} color="#3B82F6" at={0} />
        <Glow x={280} y={480} r={200} color="#8B5CF6" at={6} />

        <Enter at={8} type="pop" style={{ position: "absolute", left: 440, top: 130 }}>
          <div style={{
            fontSize: 120,
            filter: "drop-shadow(0 12px 30px rgba(59,130,246,0.3))",
          }}>🤖</div>
        </Enter>

        <Enter at={22} type="drop" style={{ position: "absolute", left: 60, top: 300, width: 960, textAlign: "center" }}>
          <div style={{
            fontSize: 68, fontWeight: 800, color: "white", lineHeight: 1.12, letterSpacing: -2,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}>
            How AI Agents<br />
            <span style={{
              background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Actually Work</span>
          </div>
        </Enter>

        <TextBlock
          lines={["The architecture behind autonomous AI", "explained in 60 seconds"]}
          at={50} size={27} color="rgba(255,255,255,0.4)"
          style={{ position: "absolute", left: 170, top: 540, width: 740, textAlign: "center" }}
        />

        {/* Animated down indicator */}
        <Enter at={80} type="up" style={{ position: "absolute", left: 505, top: 660 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 20,
            border: "1.5px solid rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "rgba(255,255,255,0.2)",
          }}>▼</div>
        </Enter>

        {/* ===== AREA 1: AGENT LOOP (y 850-1700) ===== */}
        <Glow x={350} y={1250} r={300} color="#10B981" at={100} />

        <Step num="Step 01" title="The Agent Loop" color="#10B981" x={70} y={870} at={108} />

        {/* Observe */}
        <Card at={135} w={430} h={155} x={40} y={990} accent="#10B981">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 42, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>👁️</div>
            <div>
              <div style={{ fontSize: 23, fontWeight: 700, color: "white" }}>Observe</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                Reads environment & user input
              </div>
            </div>
          </div>
        </Card>

        {/* Think */}
        <Card at={165} w={430} h={155} x={520} y={990} accent="#60A5FA">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 42, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>🧠</div>
            <div>
              <div style={{ fontSize: 23, fontWeight: 700, color: "white" }}>Think</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                LLM reasons about next step
              </div>
            </div>
          </div>
        </Card>

        {/* Act */}
        <Card at={195} w={500} h={155} x={280} y={1200} accent="#F59E0B">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 42, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>⚡</div>
            <div>
              <div style={{ fontSize: 23, fontWeight: 700, color: "white" }}>Act</div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                Calls tools, APIs, writes code
              </div>
            </div>
          </div>
        </Card>

        {/* Loop connections */}
        <Path d="M 470,1068 Q 495,1040 520,1068" len={70} at={178} color="rgba(96,165,250,0.3)" />
        <Path d="M 720,1145 Q 650,1180 530,1200" len={210} at={208} color="rgba(245,158,11,0.3)" />
        <Path d="M 280,1277 Q 130,1240 60,1145" len={260} at={235} color="rgba(16,185,129,0.3)" />

        {/* LOOP badge */}
        <Enter at={255} type="pop" style={{ position: "absolute", left: 55, top: 1175 }}>
          <div style={{
            fontSize: 11, color: "#10B981", fontWeight: 800,
            transform: "rotate(-90deg)", letterSpacing: 3,
            background: "rgba(16,185,129,0.08)", padding: "5px 10px",
            borderRadius: 6, border: "1px solid rgba(16,185,129,0.15)",
          }}>LOOP</div>
        </Enter>

        <TextBlock
          lines={["This loop runs continuously", "until the task is complete."]}
          at={270} size={20} style={{ position: "absolute", left: 280, top: 1410 }}
        />

        {/* ===== AREA 2: TOOLS (y 2050-2900) ===== */}
        <Glow x={700} y={2450} r={300} color="#F59E0B" at={470} />

        <Step num="Step 02" title="Tool Calling" color="#F59E0B" x={70} y={2100} at={480} />

        {/* Tool icons stagger */}
        <Icon emoji="🔍" x={70}  y={2210} at={500} bg="rgba(245,158,11,0.1)" />
        <Icon emoji="💻" x={158} y={2210} at={507} bg="rgba(245,158,11,0.1)" />
        <Icon emoji="📁" x={246} y={2210} at={514} bg="rgba(245,158,11,0.1)" />
        <Icon emoji="🌐" x={334} y={2210} at={521} bg="rgba(245,158,11,0.1)" />
        <Icon emoji="🗄️" x={422} y={2210} at={528} bg="rgba(245,158,11,0.1)" />

        {/* Code card */}
        <Card at={545} w={940} h={230} x={70} y={2310} accent="#F59E0B">
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F59E0B", marginBottom: 10 }}>
              Example: Search Tool
            </div>
            <div style={{
              fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
              fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8,
              background: "rgba(0,0,0,0.35)", padding: 16, borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ color: "#60A5FA" }}>agent</span>.
              <span style={{ color: "#F59E0B" }}>call_tool</span>(
              <span style={{ color: "#34D399" }}>"web_search"</span>, {"{"}<br />
              {"  "}query: <span style={{ color: "#34D399" }}>"latest AI papers"</span><br />
              {"}"})
            </div>
          </div>
        </Card>

        <TextBlock
          lines={["Agents don't just chat —", "they execute real actions."]}
          at={595} size={20} style={{ position: "absolute", left: 70, top: 2590 }}
        />

        {/* Connection down */}
        <Path d="M 540,2680 C 540,2800 540,2950 540,3100" len={420} at={630} color="rgba(139,92,246,0.15)" />

        {/* ===== AREA 3: MEMORY (y 3250-3950) ===== */}
        <Glow x={400} y={3550} r={280} color="#8B5CF6" at={810} />

        <Step num="Step 03" title="Memory & Context" color="#8B5CF6" x={70} y={3270} at={820} />

        <Card at={850} w={440} h={135} x={40} y={3380} accent="#8B5CF6">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 34 }}>📝</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>Short-term</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Conversation window</div>
            </div>
          </div>
        </Card>

        <Card at={878} w={440} h={135} x={530} y={3380} accent="#8B5CF6">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 34 }}>🧬</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>Long-term</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Vector DB, files</div>
            </div>
          </div>
        </Card>

        <Card at={906} w={930} h={135} x={40} y={3555} accent="#8B5CF6">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 34 }}>🔄</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>Working Memory</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                Scratchpad for intermediate reasoning & partial results
              </div>
            </div>
          </div>
        </Card>

        {/* Vertical connects */}
        <Path d="M 260,3515 L 260,3555" len={40} at={915} color="rgba(139,92,246,0.25)" dash={false} width={1.5} />
        <Path d="M 750,3515 L 750,3555" len={40} at={920} color="rgba(139,92,246,0.25)" dash={false} width={1.5} />

        <TextBlock
          lines={["Memory lets agents learn", "and keep context over time."]}
          at={935} size={20} style={{ position: "absolute", left: 70, top: 3740 }}
        />

        {/* Connection down */}
        <Path d="M 540,3830 C 540,3980 540,4200 540,4400" len={570} at={980} color="rgba(236,72,153,0.15)" />

        {/* ===== AREA 4: MULTI-AGENT (y 4450-5100) ===== */}
        <Glow x={540} y={4750} r={320} color="#EC4899" at={1170} />

        <Step num="Step 04" title="Multi-Agent Systems" color="#EC4899" x={70} y={4470} at={1180} />

        {/* Agent icons */}
        <Icon emoji="🤖" x={220} y={4580} at={1200} size={68} bg="rgba(236,72,153,0.12)" />
        <Icon emoji="🔬" x={470} y={4555} at={1210} size={68} bg="rgba(96,165,250,0.12)" />
        <Icon emoji="✍️" x={720} y={4580} at={1220} size={68} bg="rgba(16,185,129,0.12)" />

        {/* Labels */}
        <Enter at={1208} type="up" style={{ position: "absolute", left: 205, top: 4665, width: 100, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Planner</div>
        </Enter>
        <Enter at={1218} type="up" style={{ position: "absolute", left: 455, top: 4640, width: 100, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Researcher</div>
        </Enter>
        <Enter at={1228} type="up" style={{ position: "absolute", left: 705, top: 4665, width: 100, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Writer</div>
        </Enter>

        {/* Agent connections */}
        <Path d="M 326,4615 C 380,4590 430,4590 470,4595" len={160} at={1230} color="rgba(236,72,153,0.25)" />
        <Path d="M 576,4595 C 620,4590 670,4590 720,4615" len={160} at={1240} color="rgba(236,72,153,0.25)" />

        {/* Orchestrator */}
        <Card at={1260} w={720} h={165} x={180} y={4730} accent="#EC4899" bg="rgba(236,72,153,0.06)">
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 8 }}>
              🎯 Orchestrator
            </div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
              Coordinates agents, manages delegation,<br />
              handles failures, merges results
            </div>
          </div>
        </Card>

        <TextBlock
          lines={["Complex tasks get broken into", "subtasks for specialized agents."]}
          at={1320} size={20} style={{ position: "absolute", left: 70, top: 4945 }}
        />

        {/* ===== CTA (y 5150-5600) ===== */}
        <Glow x={540} y={5250} r={380} color="#3B82F6" at={1430} />
        <Glow x={300} y={5350} r={220} color="#8B5CF6" at={1435} />

        <Enter at={1455} type="pop" style={{ position: "absolute", left: 80, top: 5150, width: 920, textAlign: "center" }}>
          <div style={{
            fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.25,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          }}>
            AI Agents are<br />
            <span style={{
              background: "linear-gradient(135deg, #60A5FA, #A78BFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>the future</span> of<br />
            automation
          </div>
        </Enter>

        <Enter at={1500} type="up" style={{ position: "absolute", left: 180, top: 5390, width: 720, textAlign: "center" }}>
          <div style={{ fontSize: 21, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
            Follow for more AI engineering<br />breakdowns like this
          </div>
        </Enter>

        <Enter at={1540} type="pop" style={{ position: "absolute", left: 280, top: 5510, width: 520, textAlign: "center" }}>
          <div style={{
            padding: "18px 40px", borderRadius: 50,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            fontSize: 23, fontWeight: 700, color: "white",
            display: "inline-block",
            boxShadow: "0 10px 40px rgba(59,130,246,0.35), 0 2px 8px rgba(0,0,0,0.2)",
          }}>
            Follow + Subscribe 🚀
          </div>
        </Enter>

      </div>

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Subtle noise texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />
    </AbsoluteFill>
  );
};
