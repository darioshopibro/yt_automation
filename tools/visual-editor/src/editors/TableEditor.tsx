import React from 'react';
import { TableData } from './VisualTypeRegistry';
import { NumberField, SectionHeading } from './SharedEditorControls';

const cellStyle: React.CSSProperties = {
  background: '#0c0c18',
  border: '1px solid #1a1a2e',
  borderRadius: 4,
  padding: '4px 8px',
  color: '#f8fafc',
  fontSize: 11,
  outline: 'none',
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  width: '100%',
  minWidth: 60,
};

interface Props {
  data: TableData;
  onChange: (data: TableData) => void;
}

const TableEditor: React.FC<Props> = ({ data, onChange }) => {
  const headers = data.headers || [];
  const rows = data.rows || [];
  const cols = headers.length;

  const updateHeader = (idx: number, val: string) => {
    const h = [...headers];
    h[idx] = val;
    onChange({ ...data, headers: h });
  };

  const updateCell = (row: number, col: number, val: string) => {
    const r = rows.map(r => [...r]);
    r[row][col] = val;
    onChange({ ...data, rows: r });
  };

  const addColumn = () => {
    onChange({
      ...data,
      headers: [...headers, `Col ${cols + 1}`],
      rows: rows.map(r => [...r, '']),
    });
  };

  const removeColumn = (idx: number) => {
    if (cols <= 1) return;
    onChange({
      ...data,
      headers: headers.filter((_, i) => i !== idx),
      rows: rows.map(r => r.filter((_, i) => i !== idx)),
      highlightCol: data.highlightCol === idx ? undefined : data.highlightCol,
    });
  };

  const addRow = () => {
    onChange({ ...data, rows: [...rows, new Array(cols).fill('')] });
  };

  const removeRow = (idx: number) => {
    onChange({ ...data, rows: rows.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <SectionHeading>Headers</SectionHeading>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
        {headers.map((h, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <input
              value={h}
              onChange={e => updateHeader(i, e.target.value)}
              style={{ ...cellStyle, fontWeight: 700 }}
            />
            <button
              onClick={() => removeColumn(i)}
              style={{
                position: 'absolute', top: -4, right: -4,
                width: 14, height: 14, borderRadius: '50%',
                background: '#ef4444', border: 'none', color: '#fff',
                fontSize: 8, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', lineHeight: 1,
              }}
            >x</button>
          </div>
        ))}
        <button
          onClick={addColumn}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px dashed #2a2a3e',
            borderRadius: 6,
            padding: '4px 10px',
            color: '#818cf8',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >+ Col</button>
      </div>

      <SectionHeading>Rows</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: '#475569', width: 16, flexShrink: 0 }}>{ri + 1}</span>
            {row.map((cell, ci) => (
              <input
                key={ci}
                value={cell}
                onChange={e => updateCell(ri, ci, e.target.value)}
                style={cellStyle}
              />
            ))}
            <button
              onClick={() => removeRow(ri)}
              style={{
                background: 'transparent', border: 'none',
                color: '#ef4444', fontSize: 12, cursor: 'pointer', padding: '2px 4px',
              }}
            >x</button>
          </div>
        ))}
        <button
          onClick={addRow}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px dashed #2a2a3e',
            borderRadius: 6,
            padding: '4px 12px',
            color: '#818cf8',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >+ Row</button>
      </div>

      <NumberField
        label="Highlight Column (0-based)"
        value={data.highlightCol}
        onChange={v => onChange({ ...data, highlightCol: v })}
        min={0}
        max={cols - 1}
        placeholder="none"
      />
    </>
  );
};

export default TableEditor;
