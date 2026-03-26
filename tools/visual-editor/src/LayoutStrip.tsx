import React, { useState } from 'react';

const LAYOUT_OPTIONS = [
  { key: 'flow', symbol: '\u2192\u2192', label: 'Flow' },
  { key: 'arrow', symbol: '\u2192', label: 'Arrow' },
  { key: 'vs', symbol: 'vs', label: 'VS' },
  { key: 'combine', symbol: '+', label: 'Combine' },
  { key: 'negation', symbol: '\u2717\u2192', label: 'Negation' },
  { key: 'if-else', symbol: '\u2442', label: 'If-Else' },
  { key: 'merge', symbol: '\u2443', label: 'Merge' },
  { key: 'bidirectional', symbol: '\u2194', label: 'Bidirectional' },
  { key: 'filter', symbol: '\u25B7', label: 'Filter' },
] as const;

// ── LayoutStrip component ──
export interface LayoutStripProps {
  currentLayout: string;
  accentColor: string;
  onSelect: (layout: string) => void;
}

const LayoutStrip: React.FC<LayoutStripProps> = ({ currentLayout, accentColor, onSelect }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: '#0c0c16',
        border: '1px solid #2a2a3e',
        borderRadius: 20,
        padding: '4px 6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        boxShadow: '0 8px 28px rgba(0,0,0,0.7)',
      }}
    >
      {LAYOUT_OPTIONS.map(({ key, symbol, label }) => {
        const isSelected = currentLayout === key;
        const isHovered = hoveredKey === key;

        return (
          <div
            key={key}
            onClick={() => onSelect(key)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
            title={label}
            style={{
              width: 32,
              height: 28,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: isSelected ? `1.5px solid ${accentColor}` : '1.5px solid transparent',
              background: isSelected
                ? `${accentColor}18`
                : isHovered
                  ? 'rgba(255,255,255,0.06)'
                  : 'transparent',
              color: isSelected ? accentColor : isHovered ? '#f8fafc' : '#64748b',
              fontSize: key === 'vs' ? 10 : 13,
              fontWeight: key === 'vs' || key === 'combine' ? 700 : 500,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              transition: 'all 0.12s ease',
              userSelect: 'none',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {symbol}

            {/* Tooltip */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: 6,
                background: '#1e1e32',
                border: '1px solid #2a2a3e',
                borderRadius: 6,
                padding: '3px 8px',
                fontSize: 10,
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                zIndex: 10,
              }}>
                {label}
                {/* Tooltip arrow */}
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid #1e1e32',
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LayoutStrip;
