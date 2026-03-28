import React from 'react';
import { StatsData, StatItem } from './VisualTypeRegistry';
import { ArrayEditor } from './SharedEditorControls';

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
  data: StatsData;
  onChange: (data: StatsData) => void;
}

const StatsEditor: React.FC<Props> = ({ data, onChange }) => (
  <ArrayEditor<StatItem>
    label="Stats"
    items={data.items || []}
    onUpdate={items => onChange({ ...data, items })}
    itemLabel="Stat"
    createItem={() => ({ label: 'Metric', value: '0', subtitle: '' })}
    renderItem={(item, _idx, update) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
            <input value={item.label} onChange={e => update({ ...item, label: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ width: 80 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Value</div>
            <input value={item.value} onChange={e => update({ ...item, value: e.target.value })} style={inputStyle} />
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
        <div>
          <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Subtitle</div>
          <input value={item.subtitle || ''} onChange={e => update({ ...item, subtitle: e.target.value })} style={inputStyle} placeholder="optional" />
        </div>
      </div>
    )}
  />
);

export default StatsEditor;
