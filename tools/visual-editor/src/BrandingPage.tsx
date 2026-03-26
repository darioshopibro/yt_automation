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

// ===== Live Preview =====
function BrandPreview({ brand }: { brand: BrandConfig }) {
  const { colors, style, font } = brand;

  const stickyStyle = (color: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: style.stickyBorderRadius,
      padding: '20px 24px 16px 24px',
      background: colors.backgroundGradient || colors.background,
      position: 'relative',
    };
    if (style.stickyBorder) {
      base.border = `${style.stickyBorderWidth}px ${style.stickyBorderStyle} ${color}40`;
    }
    if (style.glass.enabled) {
      base.backdropFilter = `blur(${style.glass.blur}px) saturate(180%)`;
      base.WebkitBackdropFilter = `blur(${style.glass.blur}px) saturate(180%)`;
    }
    if (style.shadow) {
      base.boxShadow = `0 0 ${60 * style.glass.glowIntensity}px ${color}15, 0 8px 40px rgba(0,0,0,0.6)`;
    }
    return base;
  };

  const sectionStyle = (accent: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: style.sectionBorderRadius,
      padding: '16px 16px 12px 16px',
      background: `linear-gradient(145deg, ${accent}08, ${accent}03)`,
      flex: 1,
    };
    if (style.sectionBorder) {
      base.border = `1.5px solid ${accent}30`;
    }
    if (style.glass.enabled) {
      base.backdropFilter = `blur(${style.glass.blur}px)`;
    }
    if (style.shadow) {
      base.boxShadow = `0 0 ${40 * style.glass.glowIntensity}px ${accent}10, inset 0 1px 0 rgba(255,255,255,0.05)`;
    }
    return base;
  };

  const nodeStyle = (color: string): React.CSSProperties => {
    const size = style.nodeIconSize;
    const radius = style.nodeShape === 'circle' ? '50%' :
                   style.nodeShape === 'square' ? 4 : 14;
    return {
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(145deg, ${color}15, ${color}05)`,
      border: `1.5px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, color,
    };
  };

  const nodeLabel: React.CSSProperties = {
    fontSize: 10, color: colors.textMuted, textAlign: 'center',
    fontFamily: font.body, marginTop: 6,
  };

  const sectionColors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7'];

  // Sample data for preview
  const sampleSections = [
    { title: 'INPUT', nodes: ['User', 'API'], accent: sectionColors[0], layout: 'flow' },
    { title: 'PROCESS', nodes: ['Parse', 'Validate', 'Transform'], accent: sectionColors[1], layout: 'flow' },
    { title: 'COMPARE', nodes: ['Option A', 'Option B'], accent: sectionColors[2], layout: 'vs' },
    { title: 'OUTPUT', nodes: ['Result'], accent: sectionColors[3], layout: 'grid' },
  ];

  return (
    <div style={{
      flex: 1, padding: 32, overflow: 'auto',
      background: colors.background,
      backgroundImage: colors.backgroundGradient,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
    }}>
      {/* Sticky 1 */}
      <div style={{ width: '90%', maxWidth: 700 }}>
        {/* Step badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `${colors.stickyColors[0]}15`,
          border: `1px solid ${colors.stickyColors[0]}30`,
          borderRadius: 20, padding: '4px 14px', marginBottom: -10,
          position: 'relative', zIndex: 2, marginLeft: 20,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: colors.stickyColors[0],
            fontFamily: font.heading, letterSpacing: 1,
          }}>
            STEP 1: DATA FLOW
          </span>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: colors.stickyColors[0],
            boxShadow: `0 0 10px ${colors.stickyColors[0]}`,
          }} />
        </div>

        <div style={stickyStyle(colors.stickyColors[0])}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {sampleSections.slice(0, 2).map((sec, si) => (
              <div key={si} style={sectionStyle(sec.accent)}>
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: sec.accent, boxShadow: `0 0 10px ${sec.accent}60`,
                  }} />
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: sec.accent,
                    textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: font.heading,
                  }}>{sec.title}</span>
                  <div style={{ flex: 1, height: 1, background: `${sec.accent}20` }} />
                </div>
                {/* Nodes */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, justifyContent: 'center' }}>
                  {sec.nodes.map((n, ni) => (
                    <React.Fragment key={ni}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={nodeStyle(sec.accent)}>
                          {/* Simple placeholder icon */}
                          <span style={{ opacity: 0.7 }}>{ni === 0 ? '\u25CB' : '\u25A1'}</span>
                        </div>
                        <span style={nodeLabel}>{n}</span>
                      </div>
                      {sec.layout === 'flow' && ni < sec.nodes.length - 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', height: style.nodeIconSize }}>
                          <svg width={30} height={16} viewBox="0 0 30 16">
                            <defs>
                              <marker id={`prev-ar-${si}-${ni}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M0,0 L6,3 L0,6 Z" fill={sec.accent} />
                              </marker>
                            </defs>
                            <line x1="0" y1="8" x2="22" y2="8" stroke={sec.accent} strokeWidth="1.5"
                              markerEnd={`url(#prev-ar-${si}-${ni})`} />
                          </svg>
                        </div>
                      )}
                      {sec.layout === 'vs' && ni < sec.nodes.length - 1 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', height: style.nodeIconSize,
                          color: sec.accent, fontSize: 12, fontWeight: 800, fontStyle: 'italic',
                          textShadow: `0 0 10px ${sec.accent}40`,
                        }}>vs</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky 2 */}
      <div style={{ width: '90%', maxWidth: 700 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `${colors.stickyColors[1]}15`,
          border: `1px solid ${colors.stickyColors[1]}30`,
          borderRadius: 20, padding: '4px 14px', marginBottom: -10,
          position: 'relative', zIndex: 2, marginLeft: 20,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: colors.stickyColors[1],
            fontFamily: font.heading, letterSpacing: 1,
          }}>
            STEP 2: ANALYSIS
          </span>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: colors.stickyColors[1],
            boxShadow: `0 0 10px ${colors.stickyColors[1]}`,
          }} />
        </div>

        <div style={stickyStyle(colors.stickyColors[1])}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {sampleSections.slice(2).map((sec, si) => (
              <div key={si} style={sectionStyle(sec.accent)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: sec.accent, boxShadow: `0 0 10px ${sec.accent}60`,
                  }} />
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: sec.accent,
                    textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: font.heading,
                  }}>{sec.title}</span>
                  <div style={{ flex: 1, height: 1, background: `${sec.accent}20` }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, justifyContent: 'center' }}>
                  {sec.nodes.map((n, ni) => (
                    <React.Fragment key={ni}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={nodeStyle(sec.accent)}>
                          <span style={{ opacity: 0.7 }}>{'\u25CB'}</span>
                        </div>
                        <span style={nodeLabel}>{n}</span>
                      </div>
                      {sec.layout === 'vs' && ni < sec.nodes.length - 1 && (
                        <div style={{
                          display: 'flex', alignItems: 'center', height: style.nodeIconSize,
                          color: sec.accent, fontSize: 12, fontWeight: 800, fontStyle: 'italic',
                          textShadow: `0 0 10px ${sec.accent}40`,
                        }}>vs</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logo watermark */}
      {brand.logo.path && (
        <div style={{
          position: 'fixed',
          ...(brand.logo.watermarkPosition.includes('bottom') ? { bottom: 80 } : { top: 60 }),
          ...(brand.logo.watermarkPosition.includes('right') ? { right: 20 } : { left: 320 }),
          opacity: brand.logo.watermarkOpacity,
          pointerEvents: 'none',
        }}>
          <img
            src={getBrandLogoUrl(brand.name.toLowerCase().replace(/\s+/g, '-'))}
            alt="Logo"
            style={{ height: 40, objectFit: 'contain' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
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
