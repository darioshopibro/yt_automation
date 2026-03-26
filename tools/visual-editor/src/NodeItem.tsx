import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NodeItem as NodeItemType } from './types';
import { RenderIcon } from './IconPopover';
import IconPopover from './IconPopover';
import ColorStrip from './ColorStrip';
import InlineEdit from './InlineEdit';
import { ICON_SIZE } from './styles';

interface NodeItemProps {
  node: NodeItemType;
  color: string;  // resolved accent color
  onChange: (updated: NodeItemType) => void;
  onRemove: () => void;
}

const NodeItemComponent: React.FC<NodeItemProps> = ({ node, color, onChange, onRemove }) => {
  const [hovered, setHovered] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete button */}
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#ef4444',
            border: 'none',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
            lineHeight: 1,
          }}
          title="Remove node"
        >
          x
        </button>
      )}

      {/* Color dot — appears on hover, top-left */}
      {hovered && (
        <div
          onClick={e => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: color,
            border: '2px solid #0c0c16',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: `0 0 6px ${color}80`,
          }}
          title="Change color"
        />
      )}

      {/* Color strip popover — portaled to body */}
      {showColorPicker && iconRef.current && createPortal(
        <div
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 1999 }}
            onClick={() => setShowColorPicker(false)}
          />
          <div style={{
            position: 'fixed',
            top: iconRef.current.getBoundingClientRect().bottom + 6,
            left: iconRef.current.getBoundingClientRect().left + iconRef.current.getBoundingClientRect().width / 2 - 100,
            zIndex: 2000,
          }}>
            <ColorStrip
              currentColor={node.color}
              onSelect={c => onChange({ ...node, color: c })}
              onClear={() => {
                const { color: _, ...rest } = node;
                onChange(rest as NodeItemType);
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Icon box */}
      <div
        ref={iconRef}
        onClick={e => { e.stopPropagation(); setShowIconPicker(true); }}
        style={{
          width: ICON_SIZE,
          height: ICON_SIZE,
          borderRadius: 14,
          background: `linear-gradient(145deg, ${color}25, ${color}10)`,
          border: `1.5px solid ${color}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 20px ${color}30`,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 0 30px ${color}50`;
          e.currentTarget.style.borderColor = `${color}80`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = `0 0 20px ${color}30`;
          e.currentTarget.style.borderColor = `${color}50`;
        }}
        title={`Icon: ${node.icon} (click to change)`}
      >
        <RenderIcon
          name={node.icon}
          size={26}
          color={color}
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </div>

      {/* Icon popover */}
      {showIconPicker && iconRef.current && (
        <IconPopover
          currentIcon={node.icon}
          anchorRect={iconRef.current.getBoundingClientRect()}
          onSelect={icon => { onChange({ ...node, icon }); setShowIconPicker(false); }}
          onClose={() => setShowIconPicker(false)}
        />
      )}

      {/* Label */}
      <InlineEdit
        value={node.label}
        onSave={label => onChange({ ...node, label })}
        style={{
          fontSize: 11,
          color: '#f8fafc',
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: 70,
        }}
      />
    </div>
  );
};

export default NodeItemComponent;
