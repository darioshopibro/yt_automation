import React from 'react';
import { SplitScreenData } from './VisualTypeRegistry';
import { TextField, ColorField, StringArrayEditor, SectionHeading } from './SharedEditorControls';

interface Props {
  data: SplitScreenData;
  onChange: (data: SplitScreenData) => void;
}

const SplitScreenEditor: React.FC<Props> = ({ data, onChange }) => (
  <>
    <TextField
      label="Divider Label"
      value={data.dividerLabel || 'vs'}
      onChange={v => onChange({ ...data, dividerLabel: v })}
      placeholder="vs"
    />

    <SectionHeading>Left Side</SectionHeading>
    <TextField
      label="Title"
      value={data.left?.title || ''}
      onChange={v => onChange({ ...data, left: { ...data.left, title: v } })}
    />
    <ColorField
      label="Color"
      value={data.leftColor}
      onChange={v => onChange({ ...data, leftColor: v })}
    />
    <StringArrayEditor
      label="Items"
      items={data.left?.items || []}
      onUpdate={items => onChange({ ...data, left: { ...data.left, items } })}
      itemLabel="Item"
    />

    <SectionHeading>Right Side</SectionHeading>
    <TextField
      label="Title"
      value={data.right?.title || ''}
      onChange={v => onChange({ ...data, right: { ...data.right, title: v } })}
    />
    <ColorField
      label="Color"
      value={data.rightColor}
      onChange={v => onChange({ ...data, rightColor: v })}
    />
    <StringArrayEditor
      label="Items"
      items={data.right?.items || []}
      onUpdate={items => onChange({ ...data, right: { ...data.right, items } })}
      itemLabel="Item"
    />
  </>
);

export default SplitScreenEditor;
