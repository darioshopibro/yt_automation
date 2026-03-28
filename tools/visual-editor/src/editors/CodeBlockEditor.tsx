import React from 'react';
import { CodeBlockData } from './VisualTypeRegistry';
import { TextField, TextArea, SelectField, StringArrayEditor } from './SharedEditorControls';

const LANGUAGES = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Bash' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'docker', label: 'Dockerfile' },
  { value: 'yaml', label: 'YAML' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
];

interface Props {
  data: CodeBlockData;
  onChange: (data: CodeBlockData) => void;
}

const CodeBlockEditor: React.FC<Props> = ({ data, onChange }) => {
  const update = (patch: Partial<CodeBlockData>) => onChange({ ...data, ...patch });

  return (
    <>
      <SelectField
        label="Language"
        value={data.language || 'typescript'}
        options={LANGUAGES}
        onChange={v => update({ language: v })}
      />
      <TextField
        label="Filename"
        value={data.filename || ''}
        onChange={v => update({ filename: v })}
        placeholder="e.g. index.ts"
      />
      <TextArea
        label="Code"
        value={data.code || ''}
        onChange={v => update({ code: v })}
        rows={8}
        mono
        placeholder="Write code here..."
      />
      <TextField
        label="Highlight Lines (comma-separated)"
        value={(data.highlightLines || []).join(', ')}
        onChange={v => {
          const lines = v.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
          update({ highlightLines: lines });
        }}
        placeholder="e.g. 1, 3, 5"
      />
    </>
  );
};

export default CodeBlockEditor;
