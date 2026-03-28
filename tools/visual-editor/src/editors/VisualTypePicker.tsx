import React, { useState } from 'react';
import { VISUAL_REGISTRY, VisualType } from './VisualTypeRegistry';

interface Props {
  currentType?: string;
  accentColor: string;
  onSelect: (type: VisualType | null) => void;
}

const VisualTypePicker: React.FC<Props> = ({ currentType, accentColor, onSelect }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  return (
    <div
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      style={{
        background: '#0c0c16',
        border: '1px solid #2a2a3e',
        borderRadius: 14,
        padding: '10px 12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
        width: 280,
      }}
    >
      {/* None option — back to nodes */}
      <div
        onClick={() => onSelect(null)}
        onMouseEnter={() => setHoveredKey('none')}
        onMouseLeave={() => setHoveredKey(null)}
        title="Nodes (no visual)"
        style={{
          width: '100%',
          height: 48,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: !currentType
            ? `1.5px solid ${accentColor}`
            : '1.5px solid transparent',
          background: !currentType
            ? `${accentColor}18`
            : hoveredKey === 'none'
              ? 'rgba(255,255,255,0.06)'
              : 'transparent',
          color: !currentType ? accentColor : hoveredKey === 'none' ? '#f8fafc' : '#64748b',
          transition: 'all 0.12s ease',
          gap: 2,
        }}
      >
        <span style={{ fontSize: 14 }}>{'\u25CB\u25CB'}</span>
        <span style={{ fontSize: 8, fontWeight: 600 }}>Nodes</span>
      </div>

      {/* Visual type options */}
      {VISUAL_REGISTRY.map(({ key, label, symbol }) => {
        const isSelected = currentType === key;
        const isHovered = hoveredKey === key;

        return (
          <div
            key={key}
            onClick={() => onSelect(key)}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
            title={label}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: isSelected
                ? `1.5px solid ${accentColor}`
                : '1.5px solid transparent',
              background: isSelected
                ? `${accentColor}18`
                : isHovered
                  ? 'rgba(255,255,255,0.06)'
                  : 'transparent',
              color: isSelected ? accentColor : isHovered ? '#f8fafc' : '#64748b',
              transition: 'all 0.12s ease',
              userSelect: 'none',
              gap: 2,
              position: 'relative',
            }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              lineHeight: 1,
            }}>
              {symbol}
            </span>
            <span style={{
              fontSize: 8,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              textAlign: 'center',
            }}>
              {label}
            </span>

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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VisualTypePicker;
