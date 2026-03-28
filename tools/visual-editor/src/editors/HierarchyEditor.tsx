import React, { useState } from 'react';
import { HierarchyData, TreeNode } from './VisualTypeRegistry';

const inputStyle: React.CSSProperties = {
  background: '#0c0c18',
  border: '1px solid #1a1a2e',
  borderRadius: 6,
  padding: '4px 8px',
  color: '#f8fafc',
  fontSize: 11,
  outline: 'none',
  width: '100%',
  fontFamily: "'SF Mono', 'Fira Code', monospace",
};

const btnSmall: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#475569',
  fontSize: 10,
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: 4,
};

interface Props {
  data: HierarchyData;
  onChange: (data: HierarchyData) => void;
}

// Recursive tree node editor
const TreeNodeEditor: React.FC<{
  node: TreeNode;
  onChange: (node: TreeNode) => void;
  onRemove?: () => void;
  depth: number;
}> = ({ node, onChange, onRemove, depth }) => {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const children = node.children || [];

  const addChild = () => {
    onChange({ ...node, children: [...children, { label: 'New' }] });
  };

  const updateChild = (idx: number, child: TreeNode) => {
    const c = [...children];
    c[idx] = child;
    onChange({ ...node, children: c });
  };

  const removeChild = (idx: number) => {
    onChange({ ...node, children: children.filter((_, i) => i !== idx) });
  };

  return (
    <div style={{ paddingLeft: depth > 0 ? 16 : 0, borderLeft: depth > 0 ? '1px solid #1a1a2e' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        {children.length > 0 && (
          <button onClick={() => setCollapsed(!collapsed)} style={{ ...btnSmall, fontSize: 9 }}>
            {collapsed ? '\u25B6' : '\u25BC'}
          </button>
        )}
        <input
          value={node.label}
          onChange={e => onChange({ ...node, label: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
        <input
          type="color"
          value={node.color || '#3b82f6'}
          onChange={e => onChange({ ...node, color: e.target.value })}
          style={{ width: 20, height: 20, border: '1px solid #2a2a3e', borderRadius: 4, background: 'transparent', cursor: 'pointer', padding: 0 }}
        />
        <button onClick={addChild} style={{ ...btnSmall, color: '#818cf8' }} title="Add child">+</button>
        {onRemove && <button onClick={onRemove} style={{ ...btnSmall, color: '#ef4444' }} title="Remove">x</button>}
      </div>
      {!collapsed && children.map((child, i) => (
        <TreeNodeEditor
          key={i}
          node={child}
          onChange={c => updateChild(i, c)}
          onRemove={() => removeChild(i)}
          depth={depth + 1}
        />
      ))}
    </div>
  );
};

const HierarchyEditor: React.FC<Props> = ({ data, onChange }) => (
  <div>
    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
      Tree Structure
    </div>
    <TreeNodeEditor
      node={data.root || { label: 'Root' }}
      onChange={root => onChange({ ...data, root })}
      depth={0}
    />
  </div>
);

export default HierarchyEditor;
