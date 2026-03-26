import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as PhosphorIcons from '@phosphor-icons/react';

// ── Icon map with FIXED detection ──
// Phosphor exports forwardRef components (objects with $$typeof), not plain functions.
const EXCLUDE_KEYS = new Set(['IconContext', 'IconBase', 'SSR']);

const iconMap: Record<string, React.ComponentType<{ size?: number; weight?: string; color?: string; style?: React.CSSProperties }>> = {};
for (const [key, value] of Object.entries(PhosphorIcons)) {
  if (key[0] !== key[0].toUpperCase()) continue;
  if (EXCLUDE_KEYS.has(key) || key.includes('SSR')) continue;

  // Accept both function components AND forwardRef objects ($$typeof)
  const isComponent =
    typeof value === 'function' ||
    (typeof value === 'object' && value !== null && '$$typeof' in value);

  if (isComponent) {
    iconMap[key] = value as any;
  }
}
const allIconNames = Object.keys(iconMap).sort();

// ── Icon aliases (matching DynamicPipeline) ──
const ICON_ALIASES: Record<string, string> = {
  sparkles: 'Sparkle', layers: 'Stack', server: 'HardDrives',
  alerttriangle: 'Warning', settings: 'Gear', zap: 'Lightning',
  search: 'MagnifyingGlass', refreshcw: 'ArrowsClockwise', ship: 'Boat',
  music: 'MusicNote', menu: 'List', gitmergeconflict: 'GitMerge',
  dollarsign: 'CurrencyDollar', workflow: 'GitFork', alertcircle: 'Warning',
  infocircle: 'Info', globe: 'Globe', network: 'ShareNetwork',
  plug: 'PlugsConnected', link: 'Link', wifi: 'WifiHigh',
  container: 'Package', video: 'VideoCamera', film: 'FilmStrip',
  camera: 'VideoCamera', frame: 'FrameCorners', clapperboard: 'FilmStrip',
  filevideo: 'VideoCamera', type: 'TextT', textcursorinput: 'Textbox',
  messagesquaretext: 'Textbox', captions: 'Textbox', grid3x3: 'GridFour',
  layoutgrid: 'GridFour', merge: 'GitMerge', focus: 'Target',
  cloudy: 'Cloud', boxes: 'Package', box: 'Cube', orbit: 'Atom',
  clockcheck: 'CheckCircle', move3d: 'CubeTransparent', arrowright: 'ArrowRight',
  gitbranch: 'GitBranch', gitmerge: 'GitMerge', gitcommit: 'GitCommit',
  pencilline: 'PencilLine', filetext: 'File',
};

// ── Resolve icon name to component ──
export function resolveIcon(name: string): React.ComponentType<any> {
  const lower = name.toLowerCase();
  const aliasName = ICON_ALIASES[lower];
  if (aliasName && iconMap[aliasName]) return iconMap[aliasName];
  const pascal = name.charAt(0).toUpperCase() + name.slice(1);
  if (iconMap[pascal]) return iconMap[pascal];
  if (iconMap[name]) return iconMap[name];
  return iconMap['Cube'] || PhosphorIcons.Cube;
}

// ── Small inline icon renderer ──
export const RenderIcon: React.FC<{
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ name, size = 26, color = '#fff', style }) => {
  const IconComp = resolveIcon(name);
  return <IconComp size={size} color={color} weight={'duotone' as any} style={style} />;
};

// ── Fuzzy similar icon finder ──
function findSimilarIcons(currentIcon: string, count: number = 6): string[] {
  const lower = currentIcon.toLowerCase();

  // Break name into substrings for fuzzy matching
  // e.g. "RocketLaunch" -> ["rocket", "launch"]
  const parts = currentIcon
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(p => p.length >= 3);

  const scored: { name: string; score: number }[] = [];

  for (const name of allIconNames) {
    if (name.toLowerCase() === lower) continue; // skip self
    const nameLower = name.toLowerCase();
    let score = 0;

    // Exact substring match
    for (const part of parts) {
      if (nameLower.includes(part)) score += 10;
    }

    // Prefix match (same starting letters)
    const prefix = lower.slice(0, Math.min(4, lower.length));
    if (nameLower.startsWith(prefix)) score += 5;

    // Levenshtein-like: shared characters ratio
    if (score === 0) {
      let shared = 0;
      const nameChars = new Set(nameLower.split(''));
      for (const ch of lower) {
        if (nameChars.has(ch)) shared++;
      }
      const ratio = shared / Math.max(lower.length, nameLower.length);
      if (ratio > 0.6) score += Math.round(ratio * 3);
    }

    if (score > 0) {
      scored.push({ name, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.name);
}

// ── Popover position calculator ──
function computePosition(anchorRect: DOMRect): React.CSSProperties {
  const popoverWidth = 280;
  const popoverMaxHeight = 340;
  const gap = 8;

  let top = anchorRect.bottom + gap;
  let left = anchorRect.left;

  // Flip upward if near bottom
  if (top + popoverMaxHeight > window.innerHeight - 20) {
    top = anchorRect.top - popoverMaxHeight - gap;
  }

  // Shift left if near right edge
  if (left + popoverWidth > window.innerWidth - 20) {
    left = window.innerWidth - popoverWidth - 20;
  }

  // Don't go off-screen left
  if (left < 10) left = 10;

  return {
    position: 'fixed',
    top,
    left,
    zIndex: 2000,
  };
}

// ── IconPopover component ──
export interface IconPopoverProps {
  currentIcon: string;
  anchorRect: DOMRect;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

const IconPopover: React.FC<IconPopoverProps> = ({ currentIcon, anchorRect, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Similar icons (computed once)
  const similar = useMemo(() => findSimilarIcons(currentIcon, 6), [currentIcon]);

  // Filtered search results
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allIconNames.slice(0, 40);
    return allIconNames.filter(n => n.toLowerCase().includes(q)).slice(0, 40);
  }, [search]);

  // Focus search on mount
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  // Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const posStyle = computePosition(anchorRect);

  const handleSelect = (name: string) => {
    onSelect(name);
    onClose();
  };

  return createPortal(
    <>
    {/* Backdrop — click to close */}
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1999 }}
      onClick={onClose}
      onMouseDown={e => e.stopPropagation()}
    />
    <div
      ref={panelRef}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
      style={{
        ...posStyle,
        width: 280,
        maxHeight: 340,
        background: '#0c0c16',
        border: '1px solid #2a2a3e',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Header with close button */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px 4px',
      }}>
        <span style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Select Icon
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#64748b', fontSize: 16,
            cursor: 'pointer', padding: '0 2px', lineHeight: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >×</button>
      </div>

      {/* Similar icons row */}
      {similar.length > 0 && (
        <div style={{
          padding: '4px 12px 6px',
          borderBottom: '1px solid #1a1a2e',
        }}>
          <div style={{ fontSize: 9, color: '#475569', marginBottom: 4 }}>
            Similar
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {similar.map(name => {
              const IconComp = iconMap[name];
              if (!IconComp) return null;
              return (
                <button
                  key={name}
                  onClick={() => handleSelect(name)}
                  title={name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: '1px solid transparent',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.1s',
                    padding: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(129,140,248,0.15)';
                    e.currentTarget.style.borderColor = '#818cf850';
                    e.currentTarget.style.color = '#f8fafc';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  <IconComp size={20} weight="regular" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search input */}
      <div style={{ padding: '8px 12px' }}>
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search icons..."
          style={{
            width: '100%',
            background: '#16162a',
            border: '1px solid #2a2a3e',
            borderRadius: 8,
            padding: '7px 10px',
            color: '#f8fafc',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Icon grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 3,
        padding: '0 10px 10px',
        overflowY: 'auto',
        flex: 1,
      }}>
        {filtered.map(name => {
          const IconComp = iconMap[name];
          if (!IconComp) return null;
          const isSelected = name.toLowerCase() === currentIcon.toLowerCase() || name === currentIcon;
          return (
            <button
              key={name}
              onClick={() => handleSelect(name)}
              title={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '8px 2px 5px',
                borderRadius: 8,
                border: isSelected ? '1px solid #818cf8' : '1px solid transparent',
                background: isSelected ? 'rgba(129,140,248,0.15)' : 'transparent',
                color: isSelected ? '#818cf8' : '#94a3b8',
                cursor: 'pointer',
                fontSize: 8,
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
            >
              <IconComp size={20} weight="regular" />
              <span style={{
                maxWidth: 56,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {name}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '16px 0',
            color: '#475569',
            fontSize: 12,
          }}>
            No icons found
          </div>
        )}
      </div>
    </div>
    </>,
    document.body
  );
};

export default IconPopover;
