import React from 'react';
import { Section, NodeItem, LAYOUT_OPTIONS } from '../types';
import { TextField, RadioGroup, SectionHeading, ArrayEditor, SelectField } from './SharedEditorControls';

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
  section: Section;
  onChange: (updated: Section) => void;
}

const LAYOUT_SELECT_OPTIONS = LAYOUT_OPTIONS.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }));

const NodeSectionEditor: React.FC<Props> = ({ section, onChange }) => {
  const updateNode = (idx: number, updated: NodeItem) => {
    const nodes = [...section.nodes];
    nodes[idx] = updated;
    onChange({ ...section, nodes });
  };

  return (
    <>
      <TextField
        label="Section Title"
        value={section.title}
        onChange={v => onChange({ ...section, title: v })}
      />
      <TextField
        label="Subtitle"
        value={section.subtitle || ''}
        onChange={v => onChange({ ...section, subtitle: v || undefined })}
        placeholder="Optional subtitle"
      />
      <SelectField
        label="Layout"
        value={section.layout}
        options={LAYOUT_SELECT_OPTIONS}
        onChange={v => onChange({ ...section, layout: v })}
      />

      <SectionHeading>Nodes</SectionHeading>
      <ArrayEditor<NodeItem>
        label="Nodes"
        items={section.nodes}
        onUpdate={nodes => onChange({ ...section, nodes })}
        itemLabel="Node"
        createItem={() => ({ label: 'New', icon: 'Circle' })}
        renderItem={(node, idx, update) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
                <input
                  value={node.label}
                  onChange={e => update({ ...node, label: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div style={{ width: 90 }}>
                <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Icon</div>
                <input
                  value={node.icon}
                  onChange={e => update({ ...node, icon: e.target.value })}
                  style={inputStyle}
                  placeholder="Phosphor name"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ fontSize: 9, color: '#475569' }}>Color</div>
              <select
                value={node.color || ''}
                onChange={e => {
                  const c = e.target.value;
                  if (c) {
                    update({ ...node, color: c });
                  } else {
                    const { color: _, ...rest } = node;
                    update(rest as NodeItem);
                  }
                }}
                style={{ ...inputStyle, width: 'auto', minWidth: 90, cursor: 'pointer' }}
              >
                <option value="">Default</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
                <option value="purple">Purple</option>
                <option value="red">Red</option>
              </select>
            </div>
          </div>
        )}
      />
    </>
  );
};

export default NodeSectionEditor;
