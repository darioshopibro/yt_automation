import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Section, NodeItem as NodeItemType, ColorScheme, getColorValue } from './types';
import { glassStyle, getSectionBoxSize, getVisualBoxSize, ICON_SIZE } from './styles';
import NodeItemComponent from './NodeItem';
import InlineEdit from './InlineEdit';
import LayoutStrip from './LayoutStrip';
import { ConnectorSymbol, EqualsSymbol } from './LayoutConnector';
import { RenderIcon } from './IconPopover';
import VisualTypePicker from './editors/VisualTypePicker';
import { getVisualInfo, getDefaultData, VisualType } from './editors/VisualTypeRegistry';
import { renderVisualPreview } from './editors/VisualRenderers';

interface SectionBoxProps {
  section: Section;
  colorScheme: ColorScheme;
  onChange: (updated: Section) => void;
  onRemove: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

const SectionBox: React.FC<SectionBoxProps> = ({ section, colorScheme, onChange, onRemove, isSelected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const [stripAnchor, setStripAnchor] = useState<DOMRect | null>(null);
  const [pickerAnchor, setPickerAnchor] = useState<DOMRect | null>(null);

  const hasVisual = section.visualType && section.visualType !== 'nodes' && section.visualData;
  const visualInfo = hasVisual ? getVisualInfo(section.visualType!) : null;

  const autoSize = getSectionBoxSize(section.nodes.length, section.layout);
  // Override size for visual sections — they need more space to render the actual visual
  const visualSize = hasVisual ? getVisualBoxSize(section.visualType!, section.visualData) : autoSize;

  const updateNode = (idx: number, updated: NodeItemType) => {
    const nodes = [...section.nodes];
    nodes[idx] = updated;
    onChange({ ...section, nodes });
  };

  const removeNode = (idx: number) => {
    onChange({ ...section, nodes: section.nodes.filter((_, i) => i !== idx) });
  };

  const addNode = () => {
    onChange({
      ...section,
      nodes: [...section.nodes, { label: 'New', icon: 'Circle' }],
    });
  };

  const resolveNodeColor = (node: NodeItemType): string => {
    return getColorValue(node.color, colorScheme.accent);
  };

  const defaultColor = colorScheme.accent;

  // Render nodes based on layout type
  const renderNodes = () => {
    const { nodes, layout } = section;
    if (!nodes.length) return null;

    // Helper: render a single editable node
    const renderNode = (node: NodeItemType, idx: number) => (
      <NodeItemComponent
        key={idx}
        node={node}
        color={resolveNodeColor(node)}
        onChange={updated => updateNode(idx, updated)}
        onRemove={() => removeNode(idx)}
      />
    );

    // Helper: clickable connector that opens layout strip
    const connWrap = (children: React.ReactNode) => {
      const ref = React.createRef<HTMLDivElement>();
      return (
        <div
          ref={ref}
          style={{
            height: ICON_SIZE,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '0 2px',
          }}
          onClick={e => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setStripAnchor(prev => prev ? null : rect);
          }}
          onMouseDown={e => e.stopPropagation()}
          title="Click to change layout"
        >
          {children}
        </div>
      );
    };

    switch (layout) {
      case 'flow':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {nodes.map((node, i) => (
              <React.Fragment key={i}>
                {renderNode(node, i)}
                {i < nodes.length - 1 && connWrap(<ConnectorSymbol type="arrow" color={defaultColor} />)}
              </React.Fragment>
            ))}
          </div>
        );

      case 'arrow':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {nodes.slice(0, 2).map((node, i) => (
              <React.Fragment key={i}>
                {renderNode(node, i)}
                {i === 0 && nodes.length > 1 && connWrap(<ConnectorSymbol type="arrow" color={defaultColor} />)}
              </React.Fragment>
            ))}
          </div>
        );

      case 'vs':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {nodes.map((node, i) => (
              <React.Fragment key={i}>
                {renderNode(node, i)}
                {i < nodes.length - 1 && connWrap(<ConnectorSymbol type="vs" color={defaultColor} />)}
              </React.Fragment>
            ))}
          </div>
        );

      case 'combine':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {renderNode(nodes[0], 0)}
            {nodes.length > 1 && connWrap(<ConnectorSymbol type="combine" color={defaultColor} />)}
            {nodes.length > 1 && renderNode(nodes[1], 1)}
            {nodes.length > 2 && connWrap(<EqualsSymbol color={defaultColor} />)}
            {nodes.length > 2 && renderNode(nodes[2], 2)}
          </div>
        );

      case 'negation':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Negated first node — rendered with red X overlay */}
            {nodes[0] && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: ICON_SIZE, height: ICON_SIZE, borderRadius: 14,
                    background: `linear-gradient(145deg, #ef444415, #ef444405)`,
                    border: `1.5px solid #ef444430`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0.5,
                  }}>
                    <RenderIcon name={nodes[0].icon} size={26} color="#ef4444" />
                  </div>
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#ef4444', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 10px #ef4444', fontSize: 12, color: '#fff', fontWeight: 700,
                  }}>x</div>
                </div>
                <InlineEdit
                  value={nodes[0].label}
                  onSave={label => updateNode(0, { ...nodes[0], label })}
                  style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through', textAlign: 'center', maxWidth: 70 }}
                />
              </div>
            )}
            {connWrap(<ConnectorSymbol type="arrow" color="#22c55e" />)}
            {nodes.length > 1 && renderNode(nodes[1], 1)}
          </div>
        );

      case 'bidirectional':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {renderNode(nodes[0], 0)}
            {nodes.length > 1 && connWrap(<ConnectorSymbol type="bidirectional" color={defaultColor} />)}
            {nodes.length > 1 && renderNode(nodes[1], 1)}
          </div>
        );

      case 'filter':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            {renderNode(nodes[0], 0)}
            {nodes.length > 1 && connWrap(<ConnectorSymbol type="filter" color={defaultColor} />)}
            {nodes.length > 1 && renderNode(nodes[1], 1)}
          </div>
        );

      case 'if-else':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {renderNode(nodes[0], 0)}
            {connWrap(<ConnectorSymbol type="arrow" color={defaultColor} />)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {nodes.slice(1, 3).map((n, i) => renderNode(n, i + 1))}
            </div>
          </div>
        );

      case 'merge':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {nodes.slice(0, 2).map((n, i) => renderNode(n, i))}
            </div>
            {connWrap(<ConnectorSymbol type="arrow" color={defaultColor} />)}
            {nodes.length > 2 && renderNode(nodes[2], 2)}
          </div>
        );

      default:
        // Grid fallback
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {nodes.map((node, i) => renderNode(node, i))}
          </div>
        );
    }
  };

  // Handle visual type switch
  const handleVisualTypeSelect = (type: VisualType | null) => {
    if (type === null) {
      // Switch back to nodes
      onChange({ ...section, visualType: undefined, visualData: undefined });
    } else {
      onChange({
        ...section,
        visualType: type,
        visualData: section.visualType === type ? section.visualData : getDefaultData(type),
      });
    }
    setPickerAnchor(null);
  };

  return (
    <>
      <div
        style={{
          width: visualSize.width,
          height: visualSize.height,
          background: colorScheme.bg,
          ...glassStyle(colorScheme.border, colorScheme.glow),
          padding: '24px 24px 12px 24px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'relative',
          transition: 'box-shadow 0.3s ease-out',
          outline: isSelected ? `2px solid ${colorScheme.accent}` : 'none',
          outlineOffset: 2,
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={e => {
          if (onSelect) {
            e.stopPropagation();
            onSelect();
          }
        }}
      >
        {/* Delete section button */}
        {hovered && (
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 20,
              height: 20,
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
            title="Remove section"
          >
            x
          </button>
        )}

        {/* Visual type picker button (top-left, next to delete) */}
        {hovered && (
          <button
            onClick={e => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setPickerAnchor(prev => prev ? null : rect);
            }}
            onMouseDown={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 8,
              right: hovered ? 34 : 8,
              height: 20,
              borderRadius: 10,
              background: hasVisual ? `${colorScheme.accent}20` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${hasVisual ? colorScheme.accent + '40' : '#2a2a3e'}`,
              color: hasVisual ? colorScheme.accent : '#64748b',
              fontSize: 9,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '0 8px',
              zIndex: 10,
              transition: 'all 0.12s',
              whiteSpace: 'nowrap',
            }}
            title="Change visual type"
          >
            {visualInfo ? visualInfo.symbol : '\u25A3'} {visualInfo ? visualInfo.label : 'Visual'}
          </button>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colorScheme.accent}, ${colorScheme.border})`,
            boxShadow: `0 0 15px ${colorScheme.glow}`,
          }} />
          <InlineEdit
            value={section.title}
            onSave={title => onChange({ ...section, title })}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: colorScheme.accent,
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 160,
            }}
          />
          {/* Visual type badge */}
          {hasVisual && visualInfo && (
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: colorScheme.accent,
              background: `${colorScheme.accent}15`,
              border: `1px solid ${colorScheme.accent}30`,
              borderRadius: 6,
              padding: '2px 6px',
              fontFamily: "'SF Mono', monospace",
            }}>
              {visualInfo.symbol} {visualInfo.label}
            </span>
          )}
          <div style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(90deg, ${colorScheme.border}40, transparent)`,
          }} />
        </div>

        {/* Subtitle if present */}
        {section.subtitle && (
          <div style={{
            fontSize: 10,
            color: '#94a3b8',
            marginBottom: 12,
            fontFamily: "'SF Mono', monospace",
          }}>
            {section.subtitle}
          </div>
        )}

        {/* Content: visual preview OR nodes */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {hasVisual ? (
            <div
              style={{
                width: '100%',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={e => {
                e.stopPropagation();
                if (onSelect) onSelect();
              }}
            >
              {renderVisualPreview(section.visualType!, section.visualData, colorScheme.accent)}
            </div>
          ) : (
            renderNodes()
          )}
        </div>

        {/* Add node button (only for nodes mode) */}
        {hovered && !hasVisual && (
          <button
            onClick={e => { e.stopPropagation(); addNode(); }}
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.06)',
              border: `1px dashed ${colorScheme.border}40`,
              borderRadius: 8,
              padding: '4px 12px',
              color: colorScheme.accent,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
          >
            + Add Node
          </button>
        )}
      </div>

      {/* Layout strip portal */}
      {stripAnchor && createPortal(
        <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1999 }} onClick={() => setStripAnchor(null)} />
          <div style={{
            position: 'fixed',
            top: stripAnchor.bottom + 6,
            left: stripAnchor.left - 80,
            zIndex: 2000,
          }}>
            <LayoutStrip
              currentLayout={section.layout}
              accentColor={defaultColor}
              onSelect={l => { console.log('Layout change:', section.layout, '→', l); onChange({ ...section, layout: l }); setStripAnchor(null); }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Visual type picker portal */}
      {pickerAnchor && createPortal(
        <div onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <div style={{ position: 'fixed', inset: 0, zIndex: 1999 }} onClick={() => setPickerAnchor(null)} />
          <div style={{
            position: 'fixed',
            top: pickerAnchor.bottom + 6,
            left: Math.max(8, pickerAnchor.left - 120),
            zIndex: 2000,
          }}>
            <VisualTypePicker
              currentType={section.visualType}
              accentColor={defaultColor}
              onSelect={handleVisualTypeSelect}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default SectionBox;
