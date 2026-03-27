import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BrandConfig, BrandStyle } from './types';
import { listBrands, loadBrand, saveBrand, uploadBrandFile, getBrandLogoUrl } from './api';
import { glassStyle } from './styles';

// Default brand for new brands
const defaultBrand: BrandConfig = {
  name: 'New Brand',
  colors: {
    primary: '#3b82f6',
    secondary: '#06b6d4',
    accent: '#f59e0b',
    background: '#030305',
    backgroundGradient: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #030305 70%)',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    stickyColors: ['#f97316', '#3b82f6', '#22c55e', '#a855f7'],
  },
  logo: { path: '', watermarkPosition: 'bottom-right', watermarkOpacity: 0.3 },
  font: {
    heading: "SF Mono, Fira Code, monospace",
    body: "Inter, system-ui, sans-serif",
    code: "JetBrains Mono, Fira Code, monospace",
  },
  style: {
    stickyBorder: true,
    stickyBorderRadius: 20,
    stickyBorderWidth: 1.5,
    stickyBorderStyle: 'solid',
    sectionBorder: true,
    sectionBorderRadius: 20,
    glass: { enabled: true, blur: 16, borderOpacity: 0.37, glowIntensity: 1.0 },
    nodeShape: 'rounded',
    nodeIconSize: 56,
    connectorStyle: 'arrow',
    shadow: true,
    backgroundPattern: 'none',
  },
  intro: { videoPath: '' },
  outro: { videoPath: '' },
};

// ===== Color Input =====
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
      />
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 70 }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          background: '#0c0c18',
          border: '1px solid #1a1a2e',
          borderRadius: 4,
          padding: '3px 6px',
          color: '#f8fafc',
          fontSize: 10,
          fontFamily: "'SF Mono', monospace",
          outline: 'none',
          maxWidth: 80,
        }}
      />
    </div>
  );
}

// ===== Slider =====
function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 90 }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step || 1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: '#818cf8', height: 4 }}
      />
      <span style={{ fontSize: 10, color: '#64748b', fontFamily: "'SF Mono', monospace", minWidth: 30, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

// ===== Toggle =====
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}
      onClick={() => onChange(!value)}
    >
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 90 }}>{label}</span>
      <div style={{
        width: 32, height: 18, borderRadius: 9, padding: 2,
        background: value ? '#818cf8' : '#1a1a2e',
        transition: 'background 0.15s',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%', background: '#fff',
          transform: value ? 'translateX(14px)' : 'translateX(0)',
          transition: 'transform 0.15s',
        }} />
      </div>
    </div>
  );
}

// ===== Select =====
function SelectField({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 90 }}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        flex: 1, background: '#0c0c18', border: '1px solid #1a1a2e', borderRadius: 4,
        padding: '3px 6px', color: '#f8fafc', fontSize: 10, outline: 'none', cursor: 'pointer',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ===== Section Header =====
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: '#818cf8', letterSpacing: 1.5,
      textTransform: 'uppercase', marginTop: 16, marginBottom: 8,
      borderBottom: '1px solid #1a1a2e', paddingBottom: 4,
    }}>
      {label}
    </div>
  );
}

// ===== Inline visual components for preview =====

function tokenizeLine(line: string): { text: string; color: string }[] {
  const keywords = /\b(const|let|var|function|return|import|from|export|if|else|for|while|class|async|await|new|npm|docker|git|cd|pip|run|build|install)\b/g;
  const strings = /(["'`])(?:(?=(\\?))\2.)*?\1/g;
  const comments = /(\/\/.*$|#.*$)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const tokens: { text: string; color: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = comments.exec(line)) !== null) tokens.push({ text: m[0], color: "#6a9955", start: m.index, end: m.index + m[0].length });
  while ((m = strings.exec(line)) !== null) tokens.push({ text: m[0], color: "#ce9178", start: m.index, end: m.index + m[0].length });
  while ((m = keywords.exec(line)) !== null) { if (!tokens.some(t => m!.index >= t.start && m!.index < t.end)) tokens.push({ text: m[0], color: "#569cd6", start: m.index, end: m.index + m[0].length }); }
  while ((m = numbers.exec(line)) !== null) { if (!tokens.some(t => m!.index >= t.start && m!.index < t.end)) tokens.push({ text: m[0], color: "#b5cea8", start: m.index, end: m.index + m[0].length }); }
  tokens.sort((a, b) => a.start - b.start);
  const result: { text: string; color: string }[] = [];
  let pos = 0;
  for (const tok of tokens) { if (tok.start > pos) result.push({ text: line.slice(pos, tok.start), color: "#d4d4d4" }); result.push({ text: tok.text, color: tok.color }); pos = tok.end; }
  if (pos < line.length) result.push({ text: line.slice(pos), color: "#d4d4d4" });
  if (result.length === 0) result.push({ text: line || " ", color: "#d4d4d4" });
  return result;
}

// ===== Live Preview — Full Demo with Brand Colors =====
function BrandPreview({ brand }: { brand: BrandConfig }) {
  const { colors, style, font } = brand;
  const sc = colors.stickyColors.length >= 3 ? colors.stickyColors : ['#f97316', '#ef4444', '#22c55e', '#a855f7'];

  const stickyBox = (color: string): React.CSSProperties => ({
    borderRadius: style.stickyBorderRadius,
    padding: '24px 20px 16px',
    background: colors.backgroundGradient || colors.background,
    ...(style.stickyBorder ? { border: `${style.stickyBorderWidth}px ${style.stickyBorderStyle} ${color}25` } : {}),
    ...(style.glass.enabled ? { backdropFilter: `blur(${style.glass.blur}px)` } : {}),
    ...(style.shadow ? { boxShadow: `0 0 ${40 * style.glass.glowIntensity}px ${color}10, 0 8px 40px rgba(0,0,0,0.6)` } : {}),
  });

  const badge = (label: string, color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: `${color}15`, border: `1px solid ${color}30`,
    borderRadius: style.stickyBorderRadius, padding: '4px 14px',
    marginBottom: -10, position: 'relative' as const, zIndex: 2, marginLeft: 20,
  });

  const sectionHeader = (label: string, color: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}60` }} />
      <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: font.heading }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `${color}20` }} />
    </div>
  );

  // Mini inline visuals that respect brand
  const nodeBox = (color: string): React.CSSProperties => ({
    width: style.nodeIconSize, height: style.nodeIconSize,
    borderRadius: style.nodeShape === 'circle' ? '50%' : style.nodeShape === 'square' ? 4 : 14,
    background: `linear-gradient(145deg, ${color}15, ${color}05)`,
    border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: style.nodeIconSize * 0.45, color,
  });

  // Not replacing the old stickyStyle — using new approach
  // (keeping old code dead to avoid large diff, will clean up later)
  void stickyBox; // suppress unused warnings in strict mode... actually let's use it

  return (
    <div style={{ flex: 1, padding: 32, overflow: 'auto', background: colors.background }}>
      <div style={{ position: 'relative', height: 780, minWidth: 1200 }}>
        {/* SVG Laser layer */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          <defs><filter id="bp-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          {/* Laser 1→2 */}
          <line x1="410" y1="250" x2="470" y2="250" stroke={sc[0]} strokeWidth={8} strokeOpacity={0.1} />
          <line x1="410" y1="250" x2="470" y2="250" stroke={sc[0]} strokeWidth={4} strokeOpacity={0.25} />
          <line x1="410" y1="250" x2="470" y2="250" stroke={sc[0]} strokeWidth={2} strokeOpacity={0.8} filter="url(#bp-glow)" />
          <circle r={3.5} fill={sc[0]} opacity={0.9}><animate attributeName="cx" values="410;470" dur="1.5s" repeatCount="indefinite" /><animate attributeName="cy" values="250;250" dur="1.5s" repeatCount="indefinite" /></circle>
          {/* Laser 2→3 */}
          <line x1="810" y1="250" x2="870" y2="250" stroke={sc[1]} strokeWidth={8} strokeOpacity={0.1} />
          <line x1="810" y1="250" x2="870" y2="250" stroke={sc[1]} strokeWidth={4} strokeOpacity={0.25} />
          <line x1="810" y1="250" x2="870" y2="250" stroke={sc[1]} strokeWidth={2} strokeOpacity={0.8} filter="url(#bp-glow)" />
          <circle r={3.5} fill={sc[1]} opacity={0.9}><animate attributeName="cx" values="810;870" dur="1.5s" repeatCount="indefinite" /><animate attributeName="cy" values="250;250" dur="1.5s" repeatCount="indefinite" /></circle>
        </svg>

        {/* STICKY 1 */}
        <div style={{ position: 'absolute', left: 0, top: 10, width: 400, zIndex: 2 }}>
          <div style={badge('STEP 1: EVOLUTION', sc[0])}>
            <span style={{ fontSize: 11, fontWeight: 700, color: sc[0], fontFamily: font.heading, letterSpacing: 1 }}>STEP 1: EVOLUTION</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc[0], boxShadow: `0 0 10px ${sc[0]}` }} />
          </div>
          <div style={stickyBox(sc[0])}>
            {sectionHeader('ARCHITECTURE HISTORY', colors.accent)}
            {/* Timeline */}
            <div style={{ background: `${colors.primary}08`, borderRadius: style.sectionBorderRadius, padding: '20px 16px', border: `1px solid ${colors.primary}15`, marginBottom: 16 }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ position: 'absolute', top: 6, left: 7, right: 7, height: 2, background: `${colors.primary}30` }}>
                  <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }} />
                </div>
                {['2018', '2020', '2022', '2024'].map((yr, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', flex: 1 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: [colors.primary, colors.secondary, colors.accent, sc[3] || colors.primary][i], boxShadow: `0 0 10px ${colors.primary}60`, border: `2px solid ${colors.background}`, zIndex: 1 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: [colors.primary, colors.secondary, colors.accent, sc[3] || colors.primary][i], fontFamily: font.heading }}>{yr}</span>
                  </div>
                ))}
              </div>
            </div>
            {sectionHeader('KEY METRICS', sc[0])}
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[{ v: '83%', l: 'COMPANIES' }, { v: '2.5yr', l: 'MIGRATION' }].map((s, i) => (
                <div key={i} style={{ background: `${[colors.primary, colors.accent][i]}08`, border: `1px solid ${[colors.primary, colors.accent][i]}20`, borderRadius: style.sectionBorderRadius > 12 ? 12 : style.sectionBorderRadius, padding: '14px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: [colors.primary, colors.accent][i], fontFamily: font.heading }}>{s.v}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: colors.textMuted, letterSpacing: 1.5, marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STICKY 2 */}
        <div style={{ position: 'absolute', left: 470, top: 10, width: 340, zIndex: 2 }}>
          <div style={badge('STEP 2: MONOLITH', sc[1])}>
            <span style={{ fontSize: 11, fontWeight: 700, color: sc[1], fontFamily: font.heading, letterSpacing: 1 }}>STEP 2: MONOLITH</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc[1], boxShadow: `0 0 10px ${sc[1]}` }} />
          </div>
          <div style={stickyBox(sc[1])}>
            {sectionHeader('ARCHITECTURE', sc[1])}
            {/* Code block */}
            <div style={{ background: '#1e1e2e', borderRadius: 10, overflow: 'hidden', fontFamily: font.code || "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.6, border: '1px solid #2a2a3e', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#161622', borderBottom: '1px solid #2a2a3e' }}>
                <div style={{ display: 'flex', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} /></div>
                <span style={{ fontSize: 9, color: '#64748b', marginLeft: 6 }}>app/</span>
              </div>
              <div style={{ padding: '10px 0' }}>
                {['app/', '  src/', '    controllers/', '    models/', '    views/', '  package.json'].map((line, i) => (
                  <div key={i} style={{ display: 'flex', padding: '0 12px' }}>
                    <span style={{ color: '#4a4a5e', minWidth: 24, textAlign: 'right', marginRight: 12, fontSize: 10 }}>{i + 1}</span>
                    <span style={{ whiteSpace: 'pre' }}>{tokenizeLine(line).map((t, ti) => <span key={ti} style={{ color: t.color }}>{t.text}</span>)}</span>
                  </div>
                ))}
              </div>
            </div>
            {sectionHeader('PROBLEMS', sc[1])}
            {/* List */}
            <div style={{ background: `${sc[1]}05`, borderRadius: style.sectionBorderRadius > 12 ? 12 : style.sectionBorderRadius, padding: '12px 16px', border: `1px solid ${sc[1]}10` }}>
              {['Tightly coupled', 'Single point of failure', 'Slow deployments'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc[1], boxShadow: `0 0 6px ${sc[1]}40` }} />
                  <span style={{ fontSize: 12, color: colors.text }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STICKY 3 */}
        <div style={{ position: 'absolute', left: 870, top: 10, width: 360, zIndex: 2 }}>
          <div style={badge('STEP 3: MICROSERVICES', sc[2])}>
            <span style={{ fontSize: 11, fontWeight: 700, color: sc[2], fontFamily: font.heading, letterSpacing: 1 }}>STEP 3: MICROSERVICES</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc[2], boxShadow: `0 0 10px ${sc[2]}` }} />
          </div>
          <div style={stickyBox(sc[2])}>
            {sectionHeader('COMPARISON', sc[2])}
            {/* Table */}
            <div style={{ background: `${sc[2]}05`, borderRadius: style.sectionBorderRadius > 12 ? 12 : style.sectionBorderRadius, overflow: 'hidden', border: `1px solid ${sc[2]}10`, marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  {['', 'Monolith', 'Micro'].map((h, i) => (
                    <th key={i} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: i === 2 ? sc[2] : colors.textMuted, borderBottom: `1.5px solid ${i === 2 ? sc[2] : colors.textMuted}20`, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[['Deploy', 'Hours', 'Minutes'], ['Scale', 'Vertical', 'Horizontal'], ['Team', '1 big', 'Many small']].map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '6px 12px', fontSize: 12, color: ci === 0 ? colors.text : colors.textMuted, fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>
                    ))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sectionHeader('TECH STACK', colors.secondary)}
            {/* Logo grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[{ i: 'D', l: 'Docker', c: colors.primary }, { i: 'K', l: 'K8s', c: colors.secondary }, { i: 'N', l: 'Nginx', c: colors.accent }].map((x, xi) => (
                <div key={xi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px', borderRadius: style.nodeShape === 'square' ? 4 : 8, background: `${x.c}08`, border: `1px solid ${x.c}15` }}>
                  <div style={nodeBox(x.c)}>{x.i}</div>
                  <span style={{ fontSize: 9, color: colors.textMuted }}>{x.l}</span>
                </div>
              ))}
            </div>
            {sectionHeader('ADOPTION', sc[3] || colors.accent)}
            {/* Bar chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{ l: 'Microservices', v: 83, c: colors.primary }, { l: 'Monolith', v: 12, c: colors.secondary }, { l: 'Hybrid', v: 5, c: colors.accent }].map((b, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: colors.text }}>{b.l}</span>
                    <span style={{ fontSize: 11, color: b.c, fontWeight: 700, fontFamily: font.heading }}>{b.v}%</span>
                  </div>
                  <div style={{ height: 20, borderRadius: 5, background: `${colors.textMuted}15` }}>
                    <div style={{ height: '100%', borderRadius: 5, width: `${b.v}%`, background: `linear-gradient(90deg, ${b.c}, ${b.c}cc)`, boxShadow: style.shadow ? `0 0 15px ${b.c}30` : 'none' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ===== Main BrandingPage =====
export default function BrandingPage() {
  const [brands, setBrands] = useState<string[]>([]);
  const [activeBrand, setActiveBrand] = useState<string>('default');
  const [brand, setBrand] = useState<BrandConfig>(defaultBrand);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load brand list
  useEffect(() => {
    listBrands().then(b => {
      setBrands(b);
      if (b.length > 0 && !b.includes(activeBrand)) setActiveBrand(b[0]);
    });
  }, []);

  // Load active brand
  useEffect(() => {
    if (!activeBrand) return;
    loadBrand(activeBrand).then(b => { setBrand(b); setDirty(false); }).catch(() => {
      setBrand(defaultBrand);
    });
  }, [activeBrand]);

  // Update helpers
  const update = useCallback((fn: (b: BrandConfig) => BrandConfig) => {
    setBrand(prev => fn({ ...JSON.parse(JSON.stringify(prev)) }));
    setDirty(true);
  }, []);

  const updateColor = (key: string, value: string) => {
    update(b => { (b.colors as any)[key] = value; return b; });
  };

  const updateStyle = (key: string, value: any) => {
    update(b => { (b.style as any)[key] = value; return b; });
  };

  const updateGlass = (key: string, value: any) => {
    update(b => { (b.style.glass as any)[key] = value; return b; });
  };

  const updateStickyColor = (idx: number, value: string) => {
    update(b => { b.colors.stickyColors[idx] = value; return b; });
  };

  // Save
  const handleSave = async () => {
    try {
      const slug = activeBrand || brand.name.toLowerCase().replace(/\s+/g, '-');
      await saveBrand(slug, brand);
      setDirty(false);
      setStatus('Saved!');
      setTimeout(() => setStatus(''), 2000);
      // Refresh brand list
      const b = await listBrands();
      setBrands(b);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Create new brand
  const handleNew = () => {
    const name = prompt('Brand name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    setBrand({ ...defaultBrand, name });
    setActiveBrand(slug);
    setDirty(true);
  };

  // Logo upload
  const handleLogoUpload = async (file: File) => {
    try {
      const slug = activeBrand || 'default';
      const uploadedPath = await uploadBrandFile(slug, file, 'logo');
      update(b => { b.logo.path = uploadedPath; return b; });
      setStatus('Logo uploaded!');
      setTimeout(() => setStatus(''), 2000);
    } catch (err: any) {
      setStatus(`Upload error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* ===== Left Sidebar ===== */}
      <div style={{
        width: 300, flexShrink: 0, overflow: 'auto',
        background: '#08080f', borderRight: '1px solid #1a1a2e',
        padding: '12px 16px',
      }}>
        {/* Brand selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <select
            value={activeBrand}
            onChange={e => setActiveBrand(e.target.value)}
            style={{
              flex: 1, background: '#0c0c18', border: '1px solid #1a1a2e', borderRadius: 6,
              padding: '5px 8px', color: '#f8fafc', fontSize: 11, outline: 'none', cursor: 'pointer',
            }}
          >
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button onClick={handleNew} style={{
            background: '#818cf8', border: 'none', borderRadius: 6, padding: '5px 10px',
            color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
          }}>+ New</button>
        </div>

        {/* Brand name */}
        <div style={{ marginBottom: 8 }}>
          <input
            value={brand.name}
            onChange={e => update(b => { b.name = e.target.value; return b; })}
            style={{
              width: '100%', background: '#0c0c18', border: '1px solid #1a1a2e', borderRadius: 6,
              padding: '6px 10px', color: '#f8fafc', fontSize: 12, fontWeight: 600, outline: 'none',
            }}
            placeholder="Brand name"
          />
        </div>

        {/* COLORS */}
        <SectionHeader label="Colors" />
        <ColorField label="Primary" value={brand.colors.primary} onChange={v => updateColor('primary', v)} />
        <ColorField label="Secondary" value={brand.colors.secondary} onChange={v => updateColor('secondary', v)} />
        <ColorField label="Accent" value={brand.colors.accent} onChange={v => updateColor('accent', v)} />
        <ColorField label="Background" value={brand.colors.background} onChange={v => updateColor('background', v)} />
        <ColorField label="Text" value={brand.colors.text} onChange={v => updateColor('text', v)} />
        <ColorField label="Text Muted" value={brand.colors.textMuted} onChange={v => updateColor('textMuted', v)} />

        <div style={{ marginTop: 8, marginBottom: 4, fontSize: 10, color: '#64748b' }}>Sticky Colors</div>
        {brand.colors.stickyColors.map((c, i) => (
          <ColorField key={i} label={`Sticky ${i + 1}`} value={c} onChange={v => updateStickyColor(i, v)} />
        ))}
        <button
          onClick={() => update(b => { b.colors.stickyColors.push('#6b7280'); return b; })}
          style={{
            background: 'transparent', border: '1px dashed #1a1a2e', borderRadius: 4,
            padding: '2px 8px', color: '#64748b', fontSize: 10, cursor: 'pointer', width: '100%',
          }}
        >+ Add sticky color</button>

        {/* STYLE */}
        <SectionHeader label="Style" />
        <Toggle label="Borders" value={brand.style.stickyBorder} onChange={v => { updateStyle('stickyBorder', v); updateStyle('sectionBorder', v); }} />
        <Slider label="Border Radius" value={brand.style.stickyBorderRadius} min={0} max={40} onChange={v => { updateStyle('stickyBorderRadius', v); updateStyle('sectionBorderRadius', v); }} />
        <Slider label="Border Width" value={brand.style.stickyBorderWidth} min={0} max={4} step={0.5} onChange={v => updateStyle('stickyBorderWidth', v)} />
        <SelectField label="Border Style" value={brand.style.stickyBorderStyle}
          options={[
            { value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' }, { value: 'none', label: 'None' },
          ]}
          onChange={v => updateStyle('stickyBorderStyle', v as any)}
        />
        <Toggle label="Glassmorphism" value={brand.style.glass.enabled} onChange={v => updateGlass('enabled', v)} />
        <Slider label="Glass Blur" value={brand.style.glass.blur} min={0} max={40} onChange={v => updateGlass('blur', v)} />
        <Slider label="Glow" value={brand.style.glass.glowIntensity} min={0} max={2} step={0.1} onChange={v => updateGlass('glowIntensity', v)} />
        <Toggle label="Shadows" value={brand.style.shadow} onChange={v => updateStyle('shadow', v)} />
        <Slider label="Icon Size" value={brand.style.nodeIconSize} min={32} max={80} onChange={v => updateStyle('nodeIconSize', v)} />
        <SelectField label="Node Shape" value={brand.style.nodeShape}
          options={[
            { value: 'rounded', label: 'Rounded' }, { value: 'square', label: 'Square' }, { value: 'circle', label: 'Circle' },
          ]}
          onChange={v => updateStyle('nodeShape', v as any)}
        />

        {/* LOGO */}
        <SectionHeader label="Logo" />
        <div
          style={{
            border: '2px dashed #1a1a2e', borderRadius: 8, padding: 16,
            textAlign: 'center', cursor: 'pointer', marginBottom: 8,
            transition: 'border-color 0.15s',
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#818cf8'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = '#1a1a2e'; }}
          onDrop={e => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '#1a1a2e';
            const file = e.dataTransfer.files[0];
            if (file) handleLogoUpload(file);
          }}
        >
          {brand.logo.path ? (
            <img
              src={getBrandLogoUrl(activeBrand)}
              alt="Logo"
              style={{ maxHeight: 48, maxWidth: '100%', objectFit: 'contain' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span style={{ fontSize: 11, color: '#64748b' }}>Drop logo here or click to upload</span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
          />
        </div>
        <SelectField label="Position" value={brand.logo.watermarkPosition}
          options={[
            { value: 'top-left', label: 'Top Left' }, { value: 'top-right', label: 'Top Right' },
            { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-right', label: 'Bottom Right' },
          ]}
          onChange={v => update(b => { b.logo.watermarkPosition = v as any; return b; })}
        />
        <Slider label="Opacity" value={brand.logo.watermarkOpacity} min={0} max={1} step={0.05}
          onChange={v => update(b => { b.logo.watermarkOpacity = v; return b; })}
        />

        {/* FONT */}
        <SectionHeader label="Font" />
        <SelectField label="Heading" value={brand.font.heading}
          options={[
            { value: "SF Mono, Fira Code, monospace", label: 'SF Mono' },
            { value: "Inter, system-ui, sans-serif", label: 'Inter' },
            { value: "JetBrains Mono, monospace", label: 'JetBrains Mono' },
            { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
            { value: "'Outfit', sans-serif", label: 'Outfit' },
          ]}
          onChange={v => update(b => { b.font.heading = v; return b; })}
        />
        <SelectField label="Body" value={brand.font.body}
          options={[
            { value: "Inter, system-ui, sans-serif", label: 'Inter' },
            { value: "SF Mono, Fira Code, monospace", label: 'SF Mono' },
            { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
            { value: "'Outfit', sans-serif", label: 'Outfit' },
          ]}
          onChange={v => update(b => { b.font.body = v; return b; })}
        />

        {/* INTRO/OUTRO */}
        <SectionHeader label="Intro / Outro" />
        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 6 }}>
          Upload pre-made intro/outro videos
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{
            flex: 1, background: '#0c0c18', border: '1px solid #1a1a2e', borderRadius: 6,
            padding: '6px 0', color: brand.intro.videoPath ? '#22c55e' : '#64748b', fontSize: 10,
            cursor: 'pointer',
          }}>
            {brand.intro.videoPath ? 'Intro \u2713' : 'Upload Intro'}
          </button>
          <button style={{
            flex: 1, background: '#0c0c18', border: '1px solid #1a1a2e', borderRadius: 6,
            padding: '6px 0', color: brand.outro.videoPath ? '#22c55e' : '#64748b', fontSize: 10,
            cursor: 'pointer',
          }}>
            {brand.outro.videoPath ? 'Outro \u2713' : 'Upload Outro'}
          </button>
        </div>

        {/* Save button */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, background: dirty ? '#818cf8' : '#2a2a3e',
              border: 'none', borderRadius: 8, padding: '8px 0',
              color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            Save Brand
          </button>
          {status && (
            <span style={{
              fontSize: 11, color: status.startsWith('Error') ? '#ef4444' : '#22c55e',
              fontWeight: 600,
            }}>{status}</span>
          )}
        </div>
      </div>

      {/* ===== Right — Live Preview ===== */}
      <BrandPreview brand={brand} />
    </div>
  );
}
