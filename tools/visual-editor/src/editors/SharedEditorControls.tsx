import React, { useState } from 'react';

// ── Styles matching existing editor UI ──
const inputStyle: React.CSSProperties = {
  background: '#0c0c18',
  border: '1px solid #1a1a2e',
  borderRadius: 6,
  padding: '6px 10px',
  color: '#f8fafc',
  fontSize: 12,
  outline: 'none',
  width: '100%',
  fontFamily: "'SF Mono', 'Fira Code', monospace",
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 4,
};

// ── TextField ──
export const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={labelStyle}>{label}</div>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  </div>
);

// ── TextArea ──
export const TextArea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}> = ({ label, value, onChange, rows = 4, mono = false, placeholder }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={labelStyle}>{label}</div>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{
        ...inputStyle,
        resize: 'vertical',
        lineHeight: 1.5,
        fontFamily: mono ? "'SF Mono', 'Fira Code', monospace" : inputStyle.fontFamily,
      }}
    />
  </div>
);

// ── NumberField ──
export const NumberField: React.FC<{
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}> = ({ label, value, onChange, min, max, placeholder }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={labelStyle}>{label}</div>
    <input
      type="number"
      value={value ?? ''}
      onChange={e => {
        const v = e.target.value === '' ? undefined : Number(e.target.value);
        onChange(v);
      }}
      min={min}
      max={max}
      placeholder={placeholder}
      style={{ ...inputStyle, width: 100 }}
    />
  </div>
);

// ── SelectField ──
export const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={labelStyle}>{label}</div>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        ...inputStyle,
        cursor: 'pointer',
        width: 'auto',
        minWidth: 120,
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ── RadioGroup ──
export const RadioGroup: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  accentColor?: string;
}> = ({ label, value, options, onChange, accentColor = '#818cf8' }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={labelStyle}>{label}</div>
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(o => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              background: selected ? `${accentColor}20` : 'transparent',
              border: `1px solid ${selected ? accentColor : '#1a1a2e'}`,
              borderRadius: 6,
              padding: '4px 10px',
              color: selected ? accentColor : '#64748b',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  </div>
);

// ── CheckboxField ──
export const CheckboxField: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
}> = ({ label, checked, onChange, accentColor = '#818cf8' }) => (
  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `1.5px solid ${checked ? accentColor : '#2a2a3e'}`,
        background: checked ? `${accentColor}30` : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.12s',
        fontSize: 10,
        color: accentColor,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {checked && '\u2713'}
    </div>
    <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
  </div>
);

// ── ColorField ──
export const ColorField: React.FC<{
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={labelStyle}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="color"
        value={value || '#3b82f6'}
        onChange={e => onChange(e.target.value)}
        style={{
          width: 28,
          height: 28,
          border: '1px solid #2a2a3e',
          borderRadius: 6,
          background: 'transparent',
          cursor: 'pointer',
          padding: 0,
        }}
      />
      <input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="#hex"
        style={{ ...inputStyle, width: 90, fontSize: 11 }}
      />
    </div>
  </div>
);

// ── SectionHeading ──
export const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontSize: 11,
    fontWeight: 800,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    padding: '12px 0 6px 0',
    borderTop: '1px solid #1a1a2e',
    marginTop: 8,
  }}>
    {children}
  </div>
);

// ── ArrayEditor (generic reorderable list) ──
export function ArrayEditor<T>({ label, items, onUpdate, renderItem, createItem, itemLabel }: {
  label: string;
  items: T[];
  onUpdate: (items: T[]) => void;
  renderItem: (item: T, idx: number, update: (v: T) => void) => React.ReactNode;
  createItem: () => T;
  itemLabel?: string;
}) {
  const add = () => onUpdate([...items, createItem()]);
  const remove = (idx: number) => onUpdate(items.filter((_, i) => i !== idx));
  const update = (idx: number, v: T) => {
    const arr = [...items];
    arr[idx] = v;
    onUpdate(arr);
  };
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...items];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    onUpdate(arr);
  };
  const moveDown = (idx: number) => {
    if (idx >= items.length - 1) return;
    const arr = [...items];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    onUpdate(arr);
  };

  const btnStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#475569',
    fontSize: 12,
    cursor: 'pointer',
    padding: '2px 4px',
    borderRadius: 4,
    lineHeight: 1,
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...labelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{label} ({items.length})</span>
        <button
          onClick={add}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px dashed #2a2a3e',
            borderRadius: 6,
            padding: '2px 8px',
            color: '#818cf8',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + {itemLabel || 'Add'}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#0a0a14',
              border: '1px solid #1a1a2e',
              borderRadius: 8,
              padding: '8px 10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: '#475569', fontWeight: 700 }}>
                {itemLabel || 'Item'} {idx + 1}
              </span>
              <div style={{ display: 'flex', gap: 2 }}>
                <button onClick={() => moveUp(idx)} style={btnStyle} title="Move up">{'\u2191'}</button>
                <button onClick={() => moveDown(idx)} style={btnStyle} title="Move down">{'\u2193'}</button>
                <button
                  onClick={() => remove(idx)}
                  style={{ ...btnStyle, color: '#ef4444' }}
                  title="Remove"
                >x</button>
              </div>
            </div>
            {renderItem(item, idx, v => update(idx, v))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── StringArrayEditor (simpler: just a list of strings) ──
export const StringArrayEditor: React.FC<{
  label: string;
  items: string[];
  onUpdate: (items: string[]) => void;
  itemLabel?: string;
  placeholder?: string;
}> = ({ label, items, onUpdate, itemLabel = 'Item', placeholder }) => (
  <ArrayEditor
    label={label}
    items={items}
    onUpdate={onUpdate}
    itemLabel={itemLabel}
    createItem={() => ''}
    renderItem={(item, _idx, update) => (
      <input
        value={item}
        onChange={e => update(e.target.value)}
        placeholder={placeholder || `${itemLabel}...`}
        style={inputStyle}
      />
    )}
  />
);
