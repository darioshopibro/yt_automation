import React from 'react';
import { TimelineData, TimelineItem } from './VisualTypeRegistry';
import { RadioGroup, ArrayEditor } from './SharedEditorControls';

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
  data: TimelineData;
  onChange: (data: TimelineData) => void;
}

const TimelineEditor: React.FC<Props> = ({ data, onChange }) => (
  <>
    <RadioGroup
      label="Direction"
      value={data.direction || 'horizontal'}
      options={[
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ]}
      onChange={v => onChange({ ...data, direction: v as 'horizontal' | 'vertical' })}
    />
    <ArrayEditor<TimelineItem>
      label="Events"
      items={data.items || []}
      onUpdate={items => onChange({ ...data, items })}
      itemLabel="Event"
      createItem={() => ({ label: 'New', description: '' })}
      renderItem={(item, _idx, update) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
            <input value={item.label} onChange={e => update({ ...item, label: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Description</div>
            <input value={item.description || ''} onChange={e => update({ ...item, description: e.target.value })} style={inputStyle} placeholder="optional" />
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

export default TimelineEditor;
