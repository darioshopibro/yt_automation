import React, { useState, useRef, useEffect, useCallback } from 'react';

const COLORS = [
  { key: 'blue', hex: '#3b82f6' },
  { key: 'green', hex: '#22c55e' },
  { key: 'orange', hex: '#f97316' },
  { key: 'purple', hex: '#a855f7' },
  { key: 'red', hex: '#ef4444' },
  { key: 'cyan', hex: '#06b6d4' },
];

// ── Position calculator ──
function computePosition(anchorRect: DOMRect): React.CSSProperties {
  const stripWidth = 260;
  const stripHeight = 40;
  const gap = 6;

  let top = anchorRect.bottom + gap;
  let left = anchorRect.left + anchorRect.width / 2 - stripWidth / 2;

  // Flip upward if near bottom
  if (top + stripHeight + 40 > window.innerHeight - 10) {
    top = anchorRect.top - stripHeight - gap;
  }

  // Clamp to screen edges
  if (left + stripWidth > window.innerWidth - 10) {
    left = window.innerWidth - stripWidth - 10;
  }
  if (left < 10) left = 10;

  return {
    position: 'fixed',
    top,
    left,
    zIndex: 2000,
  };
}

// ── ColorStrip component ──
export interface ColorStripProps {
  currentColor?: string; // hex or color key
  onSelect: (color: string) => void; // returns color key ("blue") or hex
  onClear?: () => void; // remove color override
  anchorRect?: DOMRect; // optional positioning
}

const ColorStrip: React.FC<ColorStripProps> = ({ currentColor, onSelect, onClear, anchorRect }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState(currentColor || '#');
  const stripRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Resolve current color to match against presets
  const resolvedCurrent = currentColor?.toLowerCase() || '';
  const matchedKey = COLORS.find(c => c.key === resolvedCurrent || c.hex.toLowerCase() === resolvedCurrent)?.key;

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (stripRef.current && !stripRef.current.contains(e.target as Node)) {
        // Parent handles close - this component doesn't manage its own open state
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setShowCustom(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus custom input when expanded
  useEffect(() => {
    if (showCustom) {
      setTimeout(() => customInputRef.current?.focus(), 50);
    }
  }, [showCustom]);

  const posStyle: React.CSSProperties = anchorRect
    ? computePosition(anchorRect)
    : { position: 'relative' as const };

  return (
    <div
      ref={stripRef}
      onClick={e => e.stopPropagation()}
      style={{
        ...posStyle,
        background: '#0c0c16',
        border: '1px solid #2a2a3e',
        borderRadius: 20,
        padding: '4px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        boxShadow: anchorRect ? '0 8px 28px rgba(0,0,0,0.7)' : 'none',
      }}
    >
      {/* Color dots */}
      {COLORS.map(({ key, hex }) => {
        const isSelected = matchedKey === key;
        return (
          <div
            key={key}
            onClick={() => onSelect(key)}
            title={key}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: hex,
              cursor: 'pointer',
              border: isSelected ? '2px solid #fff' : '2px solid transparent',
              boxShadow: isSelected ? `0 0 8px ${hex}80` : 'none',
              transition: 'all 0.1s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'scale(1.2)';
                e.currentTarget.style.boxShadow = `0 0 6px ${hex}60`;
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
        );
      })}

      {/* Divider */}
      <div style={{
        width: 1,
        height: 14,
        background: '#2a2a3e',
        flexShrink: 0,
      }} />

      {/* Clear button */}
      {onClear && (
        <div
          onClick={() => onClear()}
          title="Clear color"
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'transparent',
            cursor: 'pointer',
            border: !matchedKey && !currentColor ? '2px solid #fff' : '2px solid #475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#64748b',
            flexShrink: 0,
            transition: 'all 0.1s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#94a3b8';
            e.currentTarget.style.color = '#f8fafc';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = !matchedKey && !currentColor ? '#fff' : '#475569';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <span style={{ lineHeight: 1 }}>{'\u2298'}</span>
        </div>
      )}

      {/* Custom color button */}
      <div
        onClick={() => setShowCustom(!showCustom)}
        title="Custom hex color"
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          cursor: 'pointer',
          border: '2px dashed #475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#64748b',
          flexShrink: 0,
          transition: 'all 0.1s',
          background: showCustom ? 'rgba(255,255,255,0.06)' : 'transparent',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#818cf8';
          e.currentTarget.style.color = '#818cf8';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#475569';
          e.currentTarget.style.color = '#64748b';
        }}
      >
        #
      </div>

      {/* Custom hex input (expandable) */}
      {showCustom && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginLeft: 2,
        }}>
          <input
            ref={customInputRef}
            type="text"
            value={customHex}
            onChange={e => setCustomHex(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const hex = customHex.startsWith('#') ? customHex : '#' + customHex;
                if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
                  onSelect(hex);
                  setShowCustom(false);
                }
              }
            }}
            placeholder="#hex"
            style={{
              width: 70,
              background: '#16162a',
              border: '1px solid #2a2a3e',
              borderRadius: 6,
              padding: '3px 6px',
              color: '#f8fafc',
              fontSize: 11,
              fontFamily: "'SF Mono', monospace",
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {/* Preview swatch */}
          <div style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            background: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(
              customHex.startsWith('#') ? customHex : '#' + customHex
            ) ? (customHex.startsWith('#') ? customHex : '#' + customHex) : '#333',
            border: '1px solid #2a2a3e',
            flexShrink: 0,
          }} />
        </div>
      )}
    </div>
  );
};

export default ColorStrip;
