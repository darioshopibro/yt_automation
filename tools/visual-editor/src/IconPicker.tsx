import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

// Build icon map once
const iconMap: Record<string, React.ComponentType<{ size?: number; weight?: string; color?: string; style?: React.CSSProperties }>> = {};
for (const [key, value] of Object.entries(PhosphorIcons)) {
  if (
    typeof value === 'function' &&
    key[0] === key[0].toUpperCase() &&
    key !== 'IconContext' &&
    key !== 'IconBase' &&
    !key.includes('SSR')
  ) {
    iconMap[key] = value as any;
  }
}
const allIconNames = Object.keys(iconMap).sort();

// === ICON ALIASES (matching DynamicPipeline) ===
const ICON_ALIASES: Record<string, string> = {
  sparkles: "Sparkle", layers: "Stack", server: "HardDrives",
  alerttriangle: "Warning", settings: "Gear", zap: "Lightning",
  search: "MagnifyingGlass", refreshcw: "ArrowsClockwise", ship: "Boat",
  music: "MusicNote", menu: "List", gitmergeconflict: "GitMerge",
  dollarsign: "CurrencyDollar", workflow: "GitFork", alertcircle: "Warning",
  infocircle: "Info", globe: "Globe", network: "ShareNetwork",
  plug: "PlugsConnected", link: "Link", wifi: "WifiHigh",
  container: "Package", video: "VideoCamera", film: "FilmStrip",
  camera: "VideoCamera", frame: "FrameCorners", clapperboard: "FilmStrip",
  filevideo: "VideoCamera", type: "TextT", textcursorinput: "Textbox",
  messagesquaretext: "Textbox", captions: "Textbox", grid3x3: "GridFour",
  layoutgrid: "GridFour", merge: "GitMerge", focus: "Target",
  cloudy: "Cloud", boxes: "Package", box: "Cube", orbit: "Atom",
  clockcheck: "CheckCircle", move3d: "CubeTransparent", arrowright: "ArrowRight",
  gitbranch: "GitBranch", gitmerge: "GitMerge", gitcommit: "GitCommit",
  pencilline: "PencilLine", filetext: "File",
};

// Resolve icon name to component
export function resolveIcon(name: string): React.ComponentType<any> {
  const lower = name.toLowerCase();
  const aliasName = ICON_ALIASES[lower];
  if (aliasName && iconMap[aliasName]) return iconMap[aliasName];
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  if (iconMap[pascal]) return iconMap[pascal];
  if (iconMap[name]) return iconMap[name];
  return iconMap['Cube'] || PhosphorIcons.Cube;
}

// Small inline icon renderer
export const RenderIcon: React.FC<{
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 26, color = '#fff', style }) => {
  const IconComp = resolveIcon(name);
  return <IconComp size={size} color={color} weight={"duotone" as any} style={style} />;
};

// === ICON PICKER MODAL ===
interface IconPickerProps {
  currentIcon: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<string[]>(allIconNames.slice(0, 120));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(allIconNames.slice(0, 120));
    } else {
      setFiltered(allIconNames.filter(n => n.toLowerCase().includes(q)).slice(0, 120));
    }
  }, [search]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0c0c16',
          border: '1px solid #2a2a3e',
          borderRadius: 16,
          width: 600,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #1a1a2e',
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>Select Icon</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>Current: {currentIcon}</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: '#64748b',
              fontSize: 20, cursor: 'pointer', padding: '4px 8px',
            }}
          >
            x
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px' }}>
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search icons... (e.g. rocket, gear, check)"
            style={{
              width: '100%',
              background: '#16162a',
              border: '1px solid #2a2a3e',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#f8fafc',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, padding: '0 2px' }}>
            {filtered.length} icons{search ? ' matching' : ''} (max 120)
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 4,
          padding: '0 16px 16px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {filtered.map(name => {
            const IconComp = iconMap[name];
            if (!IconComp) return null;
            const isSelected = name === currentIcon || name.toLowerCase() === currentIcon.toLowerCase();
            return (
              <button
                key={name}
                onClick={() => { onSelect(name); onClose(); }}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4,
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: isSelected ? '1px solid #818cf8' : '1px solid transparent',
                  background: isSelected ? 'rgba(129,140,248,0.15)' : 'transparent',
                  color: isSelected ? '#818cf8' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 9,
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#f8fafc';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
                title={name}
              >
                <IconComp size={24} weight="regular" />
                <span style={{
                  maxWidth: 60, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
