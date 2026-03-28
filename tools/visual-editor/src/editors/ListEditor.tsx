import React from 'react';
import { ListData } from './VisualTypeRegistry';
import { RadioGroup, StringArrayEditor } from './SharedEditorControls';

interface Props {
  data: ListData;
  onChange: (data: ListData) => void;
}

const ListEditor: React.FC<Props> = ({ data, onChange }) => (
  <>
    <RadioGroup
      label="Style"
      value={data.style || 'bullet'}
      options={[
        { value: 'bullet', label: 'Bullet' },
        { value: 'numbered', label: 'Numbered' },
        { value: 'checklist', label: 'Checklist' },
      ]}
      onChange={v => onChange({ ...data, style: v as ListData['style'] })}
    />
    <StringArrayEditor
      label="Items"
      items={data.items || []}
      onUpdate={items => onChange({ ...data, items })}
      itemLabel="Item"
    />
  </>
);

export default ListEditor;
