import React, { useState } from 'react';
import { Sticky, Section, getColorSchemeForSection, colorRotation } from './types';
import { getStickyDimensions, getClockwiseGridPos, getSectionBoxSize, SECTION_GAP } from './styles';
import SectionBox from './SectionBox';
import InlineEdit from './InlineEdit';
import ColorPicker from './ColorPicker';

interface StickyNoteProps {
  sticky: Sticky;
  stickyIndex: number;
  globalSectionOffset: number; // for color rotation
  showStepPrefix: boolean;
  onChange: (updated: Sticky) => void;
  onRemove: () => void;
  activeSectionIdx?: number; // which section is currently active (player)
}

const StickyNote: React.FC<StickyNoteProps> = ({
  sticky, stickyIndex, globalSectionOffset, showStepPrefix, onChange, onRemove, activeSectionIdx,
}) => {
  const [hovered, setHovered] = useState(false);
  const { width, height, cols, rows, boxW, boxH } = getStickyDimensions(sticky.sections);
  const color = sticky.color;

  const updateSection = (idx: number, updated: Section) => {
    const sections = [...sticky.sections];
    sections[idx] = updated;
    onChange({ ...sticky, sections });
  };

  const removeSection = (idx: number) => {
    onChange({ ...sticky, sections: sticky.sections.filter((_, i) => i !== idx) });
  };

  const addSection = () => {
    const sectionNum = sticky.sections.length + 1;
    const newSection: Section = {
      id: `section_${sticky.step}_${sectionNum}`,
      title: 'New Section',
      layout: 'flow',
      startFrame: 0,
      nodes: [],
    };
    onChange({ ...sticky, sections: [...sticky.sections, newSection] });
  };

  // Calculate section positions
  const gap = SECTION_GAP;
  const padding = 24;
  const boxSizes = sticky.sections.map(s => getSectionBoxSize(s.nodes.length, s.layout));
  const contentW = width - padding * 2;
  const contentH = height - padding * 2;
  const gridW = (cols * boxW) + ((cols - 1) * gap);
  const gridH = (rows * boxH) + ((rows - 1) * gap);
  const startX = padding + (contentW - gridW) / 2;
  const startY = padding + (contentH - gridH) / 2;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height: height + 36, // room for badge
        flexShrink: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Step badge */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 24,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        padding: '8px 20px',
        borderRadius: '12px 12px 0 0',
        fontSize: 12,
        fontWeight: 800,
        color: '#fff',
        letterSpacing: 2,
        textTransform: 'uppercase',
        boxShadow: `0 -4px 30px ${color}60`,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 2,
      }}>
        <InlineEdit
          value={showStepPrefix ? `Step ${sticky.step}: ${sticky.title}` : sticky.title}
          onSave={val => {
            // Parse out step prefix if present
            const match = val.match(/^Step \d+:\s*(.*)/i);
            onChange({ ...sticky, title: match ? match[1] : val });
          }}
          style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}
        />
        <ColorPicker
          color={color}
          onChange={c => onChange({ ...sticky, color: c })}
          size={16}
        />
      </div>

      {/* Delete sticky */}
      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: 0,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#ef4444',
            border: 'none',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
            lineHeight: 1,
          }}
          title="Remove sticky"
        >
          x
        </button>
      )}

      {/* Content area */}
      <div style={{
        position: 'absolute',
        top: 28,
        left: 0,
        width: '100%',
        height: height,
        border: `2px dashed ${color}40`,
        borderRadius: 20,
        background: `linear-gradient(145deg, ${color}08, ${color}02)`,
      }}>
        {/* Connection lines between sections */}
        {sticky.sections.length > 1 && (
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 5,
          }}>
            {sticky.sections.slice(0, -1).map((section, i) => {
              const gridPos1 = getClockwiseGridPos(i, sticky.sections.length, cols);
              const gridPos2 = getClockwiseGridPos(i + 1, sticky.sections.length, cols);
              const bw1 = boxSizes[i].width;
              const bh1 = boxSizes[i].height;
              const bw2 = boxSizes[i + 1].width;
              const bh2 = boxSizes[i + 1].height;
              const cellX1 = startX + gridPos1.col * (boxW + gap);
              const cellY1 = startY + gridPos1.row * (boxH + gap);
              const x1pos = cellX1 + (boxW - bw1) / 2;
              const y1pos = cellY1 + (boxH - bh1) / 2;
              const cellX2 = startX + gridPos2.col * (boxW + gap);
              const cellY2 = startY + gridPos2.row * (boxH + gap);
              const x2pos = cellX2 + (boxW - bw2) / 2;
              const y2pos = cellY2 + (boxH - bh2) / 2;

              let lx1: number, ly1: number, lx2: number, ly2: number;
              const nextColorScheme = getColorSchemeForSection(globalSectionOffset + i + 1);

              if (gridPos1.row === gridPos2.row) {
                if (gridPos2.col > gridPos1.col) {
                  lx1 = x1pos + bw1; ly1 = y1pos + bh1 / 2;
                  lx2 = x2pos; ly2 = y2pos + bh2 / 2;
                } else {
                  lx1 = x1pos; ly1 = y1pos + bh1 / 2;
                  lx2 = x2pos + bw2; ly2 = y2pos + bh2 / 2;
                }
              } else {
                if (gridPos2.row > gridPos1.row) {
                  lx1 = x1pos + bw1 / 2; ly1 = y1pos + bh1;
                  lx2 = x2pos + bw2 / 2; ly2 = y2pos;
                } else {
                  lx1 = x1pos + bw1 / 2; ly1 = y1pos;
                  lx2 = x2pos + bw2 / 2; ly2 = y2pos + bh2;
                }
              }

              return (
                <g key={`section-line-${i}`}>
                  <line x1={lx1} y1={ly1} x2={lx2} y2={ly2}
                    stroke={nextColorScheme.accent} strokeWidth={6} strokeOpacity={0.12}
                    strokeLinecap="round" />
                  <line x1={lx1} y1={ly1} x2={lx2} y2={ly2}
                    stroke={nextColorScheme.accent} strokeWidth={2} strokeOpacity={0.5}
                    strokeLinecap="round" />
                  <circle cx={lx2} cy={ly2} r={3} fill={nextColorScheme.accent} opacity={0.4} />
                </g>
              );
            })}
          </svg>
        )}

        {/* Sections positioned in grid */}
        {sticky.sections.map((section, idx) => {
          const { row, col } = getClockwiseGridPos(idx, sticky.sections.length, cols);
          const bw = boxSizes[idx].width;
          const bh = boxSizes[idx].height;
          const cellX = startX + col * (boxW + gap);
          const cellY = startY + row * (boxH + gap);
          const x = cellX + (boxW - bw) / 2;
          const y = cellY + (boxH - bh) / 2;

          const globalIdx = globalSectionOffset + idx;
          const colorScheme = getColorSchemeForSection(globalIdx, section.colorKey);

          const isActive = activeSectionIdx === idx;
          return (
            <div
              key={section.id || idx}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transition: 'box-shadow 0.3s, transform 0.3s',
                boxShadow: isActive ? `0 0 30px ${colorScheme.accent}60` : 'none',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                borderRadius: 20,
                zIndex: isActive ? 10 : 1,
              }}
            >
              <SectionBox
                section={section}
                colorScheme={colorScheme}
                onChange={updated => updateSection(idx, updated)}
                onRemove={() => removeSection(idx)}
              />
            </div>
          );
        })}

        {/* Add section button */}
        {hovered && (
          <button
            onClick={e => { e.stopPropagation(); addSection(); }}
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.04)',
              border: `1px dashed ${color}40`,
              borderRadius: 10,
              padding: '6px 16px',
              color: `${color}cc`,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              zIndex: 5,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            + Add Section
          </button>
        )}
      </div>
    </div>
  );
};

export default StickyNote;
