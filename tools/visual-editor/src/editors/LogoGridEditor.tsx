import React from 'react';
import { LogoGridData, LogoGridItem } from './VisualTypeRegistry';
import { NumberField, ArrayEditor } from './SharedEditorControls';

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

interface Props {
  data: LogoGridData;
  onChange: (data: LogoGridData) => void;
}

const LogoGridEditor: React.FC<Props> = ({ data, onChange }) => (
  <>
    <NumberField
      label="Columns (auto if empty)"
      value={data.cols}
      onChange={v => onChange({ ...data, cols: v })}
      min={1}
      max={6}
      placeholder="auto"
    />
    <ArrayEditor<LogoGridItem>
      label="Icons"
      items={data.items || []}
      onUpdate={items => onChange({ ...data, items })}
      itemLabel="Icon"
      createItem={() => ({ icon: 'Circle', label: 'New', color: '#3b82f6' })}
      renderItem={(item, _idx, update) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ width: 90 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Icon (Phosphor)</div>
            <input value={item.icon} onChange={e => update({ ...item, icon: e.target.value })} style={inputStyle} placeholder="Globe" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
            <input value={item.label} onChange={e => update({ ...item, label: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ width: 36 }}>
            <input
              type="color"
              value={item.color || '#3b82f6'}
              onChange={e => update({ ...item, color: e.target.value })}
              style={{ width: 28, height: 28, border: '1px solid #2a2a3e', borderRadius: 6, background: 'transparent', cursor: 'pointer', padding: 0 }}
            />
          </div>
        </div>
      )}
    />
  </>
);

export default LogoGridEditor;
