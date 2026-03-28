import React from 'react';
import { TerminalData, TerminalCommand } from './VisualTypeRegistry';
import { TextField, ArrayEditor } from './SharedEditorControls';

interface Props {
  data: TerminalData;
  onChange: (data: TerminalData) => void;
}

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

const miniLabel: React.CSSProperties = {
  fontSize: 9,
  color: '#475569',
  marginBottom: 2,
};

const TerminalEditor: React.FC<Props> = ({ data, onChange }) => {
  return (
    <>
      <TextField
        label="Window Title"
        value={data.title || ''}
        onChange={v => onChange({ ...data, title: v })}
        placeholder="Terminal"
      />
      <ArrayEditor<TerminalCommand>
        label="Commands"
        items={data.commands || []}
        onUpdate={commands => onChange({ ...data, commands })}
        itemLabel="Command"
        createItem={() => ({ prompt: '$', command: '', output: '' })}
        renderItem={(cmd, _idx, update) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 50 }}>
                <div style={miniLabel}>Prompt</div>
                <input value={cmd.prompt || '$'} onChange={e => update({ ...cmd, prompt: e.target.value })} style={{ ...inputStyle, width: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={miniLabel}>Command</div>
                <input value={cmd.command} onChange={e => update({ ...cmd, command: e.target.value })} style={inputStyle} placeholder="ls -la" />
              </div>
            </div>
            <div>
              <div style={miniLabel}>Output</div>
              <textarea
                value={cmd.output || ''}
                onChange={e => update({ ...cmd, output: e.target.value })}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.4 }}
                placeholder="Command output..."
              />
            </div>
          </div>
        )}
      />
    </>
  );
};

export default TerminalEditor;
