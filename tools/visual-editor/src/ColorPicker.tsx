import React, { useState, useRef, useEffect } from 'react';
import { STICKY_COLOR_PRESETS } from './types';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  size?: number;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, size = 20 }) => {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(color);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setCustom(color); }, [color]);

  useEffect(() => {
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
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          cursor: 'pointer',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: `0 0 12px ${color}60`,
          transition: 'transform 0.1s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        title="Change color"
      />
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: size + 8,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#12121a',
            border: '1px solid #2a2a3e',
            borderRadius: 10,
            padding: 10,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            width: 180,
            zIndex: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          }}
        >
          {STICKY_COLOR_PRESETS.map(c => (
            <div
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: c,
                cursor: 'pointer',
                border: c === color ? '2px solid #fff' : '2px solid transparent',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ))}
          <div style={{ width: '100%', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { onChange(custom); setOpen(false); } }}
              style={{
                flex: 1,
                background: '#0a0a12',
                border: '1px solid #2a2a3e',
                borderRadius: 4,
                padding: '4px 8px',
                color: '#f8fafc',
                fontSize: 11,
                fontFamily: 'monospace',
                outline: 'none',
              }}
              placeholder="#hex"
            />
            <div style={{
              width: 24, height: 24, borderRadius: 4,
              background: custom, border: '1px solid #2a2a3e', flexShrink: 0,
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
