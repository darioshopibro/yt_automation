import React from 'react';
import { ServiceMeshData, MeshNode, MeshConnection } from './VisualTypeRegistry';
import { ArrayEditor, SectionHeading } from './SharedEditorControls';

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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const ROLES = [
  { value: 'gateway', label: 'Gateway' },
  { value: 'service', label: 'Service' },
  { value: 'database', label: 'Database' },
  { value: 'queue', label: 'Queue' },
];

interface Props {
  data: ServiceMeshData;
  onChange: (data: ServiceMeshData) => void;
}

const ServiceMeshEditor: React.FC<Props> = ({ data, onChange }) => {
  const nodes = data.nodes || [];
  const nodeLabels = nodes.map(n => n.label);

  return (
    <>
      <ArrayEditor<MeshNode>
        label="Nodes"
        items={nodes}
        onUpdate={n => onChange({ ...data, nodes: n })}
        itemLabel="Node"
        createItem={() => ({ label: 'New', role: 'service' as const })}
        renderItem={(node, _idx, update) => (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
              <input value={node.label} onChange={e => update({ ...node, label: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ width: 80 }}>
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Icon</div>
              <input value={node.icon || ''} onChange={e => update({ ...node, icon: e.target.value })} style={inputStyle} placeholder="Globe" />
            </div>
            <div style={{ width: 90 }}>
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Role</div>
              <select value={node.role || 'service'} onChange={e => update({ ...node, role: e.target.value as MeshNode['role'] })} style={selectStyle}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div style={{ width: 36 }}>
              <input
                type="color"
                value={node.color || '#3b82f6'}
                onChange={e => update({ ...node, color: e.target.value })}
                style={{ width: 28, height: 28, border: '1px solid #2a2a3e', borderRadius: 6, background: 'transparent', cursor: 'pointer', padding: 0 }}
              />
            </div>
          </div>
        )}
      />

      <SectionHeading>Connections</SectionHeading>
      <ArrayEditor<MeshConnection>
        label="Connections"
        items={data.connections || []}
        onUpdate={c => onChange({ ...data, connections: c })}
        itemLabel="Connection"
        createItem={() => ({ from: nodeLabels[0] || '', to: nodeLabels[1] || '', label: '' })}
        renderItem={(conn, _idx, update) => (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>From</div>
              <select value={conn.from} onChange={e => update({ ...conn, from: e.target.value })} style={selectStyle}>
                <option value="">--</option>
                {nodeLabels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>To</div>
              <select value={conn.to} onChange={e => update({ ...conn, to: e.target.value })} style={selectStyle}>
                <option value="">--</option>
                {nodeLabels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ width: 70 }}>
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Label</div>
              <input value={conn.label || ''} onChange={e => update({ ...conn, label: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ width: 70 }}>
              <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>Style</div>
              <select value={conn.style || 'solid'} onChange={e => update({ ...conn, style: e.target.value as 'solid' | 'dashed' })} style={selectStyle}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
              </select>
            </div>
          </div>
        )}
      />
    </>
  );
};

export default ServiceMeshEditor;
