import React from 'react';
import { BarChartData, BarChartItem } from './VisualTypeRegistry';
import { TextField, NumberField, ArrayEditor, ColorField } from './SharedEditorControls';

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
  data: BarChartData;
  onChange: (data: BarChartData) => void;
}

const BarChartEditor: React.FC<Props> = ({ data, onChange }) => (
  <>
    <TextField
      label="Unit"
      value={data.unit || ''}
      onChange={v => onChange({ ...data, unit: v })}
      placeholder="e.g. %, ms, MB"
    />
    <NumberField
      label="Max Value (auto if empty)"
      value={data.maxValue}
      onChange={v => onChange({ ...data, maxValue: v })}
      min={0}
      placeholder="auto"
    />
    <ArrayEditor<BarChartItem>
      label="Bars"
      items={data.items || []}
      onUpdate={items => onChange({ ...data, items })}
      itemLabel="Bar"
      createItem={() => ({ label: 'New', value: 50 })}
      renderItem={(item, _idx, update) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
            <input value={item.label} onChange={e => update({ ...item, label: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ width: 70 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Value</div>
            <input type="number" value={item.value} onChange={e => update({ ...item, value: Number(e.target.value) })} style={{ ...inputStyle, width: '100%' }} />
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

export default BarChartEditor;
