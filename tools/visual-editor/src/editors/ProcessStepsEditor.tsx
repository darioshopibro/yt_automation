import React from 'react';
import { ProcessStepsData, ProcessStep } from './VisualTypeRegistry';
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
  data: ProcessStepsData;
  onChange: (data: ProcessStepsData) => void;
}

const ProcessStepsEditor: React.FC<Props> = ({ data, onChange }) => (
  <ArrayEditor<ProcessStep>
    label="Steps"
    items={data.steps || []}
    onUpdate={steps => onChange({ ...data, steps })}
    itemLabel="Step"
    createItem={() => ({ label: 'New Step', description: '' })}
    renderItem={(step, _idx, update) => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
          <input value={step.label} onChange={e => update({ ...step, label: e.target.value })} style={inputStyle} />
        </div>
        <div style={{ flex: 2 }}>
          <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Description</div>
          <input value={step.description || ''} onChange={e => update({ ...step, description: e.target.value })} style={inputStyle} placeholder="optional" />
        </div>
        <div style={{ width: 36 }}>
          <input
            type="color"
            value={step.color || '#3b82f6'}
            onChange={e => update({ ...step, color: e.target.value })}
            style={{ width: 28, height: 28, border: '1px solid #2a2a3e', borderRadius: 6, background: 'transparent', cursor: 'pointer', padding: 0 }}
          />
        </div>
      </div>
    )}
  />
);

export default ProcessStepsEditor;
