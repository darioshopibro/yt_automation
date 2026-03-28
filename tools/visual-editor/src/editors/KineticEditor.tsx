import React from 'react';
import { KineticData } from './VisualTypeRegistry';
import { TextArea, TextField, RadioGroup } from './SharedEditorControls';

interface Props {
  data: KineticData;
  onChange: (data: KineticData) => void;
}

const KineticEditor: React.FC<Props> = ({ data, onChange }) => (
  <>
    <RadioGroup
      label="Style"
      value={data.style || 'impact'}
      options={[
        { value: 'impact', label: 'Impact' },
        { value: 'reveal', label: 'Reveal' },
        { value: 'stack', label: 'Stack' },
      ]}
      onChange={v => onChange({ ...data, style: v as KineticData['style'] })}
    />
    <TextArea
      label="Text"
      value={data.text || ''}
      onChange={v => onChange({ ...data, text: v })}
      rows={3}
      placeholder="Enter text..."
    />
    <TextField
      label="Highlight Words (comma-separated)"
      value={(data.highlight || []).join(', ')}
      onChange={v => {
        const words = v.split(',').map(s => s.trim()).filter(Boolean);
        onChange({ ...data, highlight: words });
      }}
      placeholder="important, key, words"
    />
  </>
);

export default KineticEditor;
