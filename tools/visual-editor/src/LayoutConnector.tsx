import React, { useState } from 'react';

interface LayoutConnectorProps {
  type: string;
  color: string;
  onChange: (newType: string) => void;
}

const LAYOUT_OPTIONS = [
  'flow', 'arrow', 'vs', 'combine', 'negation',
  'if-else', 'merge', 'bidirectional', 'filter',
];

// Visual representation of each connector type
const connectorSymbols: Record<string, string> = {
  flow: '\u2192',
  arrow: '\u2192',
  vs: 'vs',
  combine: '+',
  negation: '\u2717\u2192',
  'if-else': '\u2192[\u2026]',
  merge: '[\u2026]\u2192',
  bidirectional: '\u2194',
  filter: '\u25B7',
};

// Renders inline connector symbol between nodes
export const ConnectorSymbol: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  const symbol = connectorSymbols[type] || '\u2192';

  if (type === 'vs') {
    return (
      <span style={{
        fontSize: 14,
        fontWeight: 800,
        color,
        textShadow: `0 0 12px ${color}60`,
        padding: '0 8px',
        fontFamily: "'SF Mono', monospace",
      }}>
        vs
      </span>
    );
  }

  if (type === 'combine') {
    return (
      <span style={{
        fontSize: 18,
        fontWeight: 700,
        color,
        textShadow: `0 0 12px ${color}60`,
        padding: '0 4px',
      }}>
        +
      </span>
    );
  }

  // Default: arrow-like
  return (
    <svg width={36} height={16} viewBox="0 0 36 16" style={{ display: 'block' }}>
      {type === 'bidirectional' ? (
        <>
          <polygon points="0,4 6,8 0,12" fill={color} />
          <line x1="6" y1="8" x2="30" y2="8" stroke={color} strokeWidth="2" />
          <polygon points="36,4 30,8 36,12" fill={color} />
        </>
      ) : type === 'filter' ? (
        <>
          <polygon points="2,1 2,15 18,8" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="18" y1="8" x2="34" y2="8" stroke={color} strokeWidth="2" />
        </>
      ) : (
        <>
          <line x1="0" y1="8" x2="28" y2="8" stroke={color} strokeWidth="2" />
          <polygon points="36,8 28,3 28,13" fill={color} />
        </>
      )}
    </svg>
  );
};

export const EqualsSymbol: React.FC<{ color: string }> = ({ color }) => (
  <span style={{
    fontSize: 18,
    fontWeight: 700,
    color,
    textShadow: `0 0 12px ${color}60`,
    padding: '0 4px',
  }}>
    =
  </span>
);

// Layout type selector dropdown
const LayoutConnector: React.FC<LayoutConnectorProps> = ({ type, color, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 6,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 11,
          color: '#94a3b8',
          fontFamily: "'SF Mono', monospace",
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = color + '60';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        }}
        title="Click to change layout type"
      >
        {connectorSymbols[type] || type} <span style={{ fontSize: 9, opacity: 0.6 }}>{type}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 4,
          background: '#12121a',
          border: '1px solid #2a2a3e',
          borderRadius: 8,
          padding: 4,
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          minWidth: 140,
        }}>
          {LAYOUT_OPTIONS.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                color: opt === type ? color : '#94a3b8',
                background: opt === type ? `${color}15` : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => {
                if (opt !== type) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={e => {
                if (opt !== type) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontFamily: 'monospace', width: 30 }}>{connectorSymbols[opt]}</span>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayoutConnector;
