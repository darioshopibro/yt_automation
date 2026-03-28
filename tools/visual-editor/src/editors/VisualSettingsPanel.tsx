import React from 'react';
import { Section } from '../types';
import { getVisualInfo, VisualType } from './VisualTypeRegistry';
import CodeBlockEditor from './CodeBlockEditor';
import TerminalEditor from './TerminalEditor';
import ListEditor from './ListEditor';
import TableEditor from './TableEditor';
import BarChartEditor from './BarChartEditor';
import PieChartEditor from './PieChartEditor';
import StatsEditor from './StatsEditor';
import TimelineEditor from './TimelineEditor';
import ProcessStepsEditor from './ProcessStepsEditor';
import LogoGridEditor from './LogoGridEditor';
import HierarchyEditor from './HierarchyEditor';
import SplitScreenEditor from './SplitScreenEditor';
import KineticEditor from './KineticEditor';
import ServiceMeshEditor from './ServiceMeshEditor';
import NodeSectionEditor from './NodeSectionEditor';

interface Props {
  section: Section;
  accentColor: string;
  onChange: (updated: Section) => void;
  onClose: () => void;
}

const VisualSettingsPanel: React.FC<Props> = ({ section, accentColor, onChange, onClose }) => {
  const hasVisual = section.visualType && section.visualType !== 'nodes' && section.visualData;
  const info = hasVisual ? getVisualInfo(section.visualType!) : null;
  const visualData = section.visualData || {};

  const updateData = (newData: any) => {
    onChange({ ...section, visualData: newData });
  };

  const renderVisualEditor = () => {
    switch (section.visualType as VisualType) {
      case 'code-block':
        return <CodeBlockEditor data={visualData} onChange={updateData} />;
      case 'terminal':
        return <TerminalEditor data={visualData} onChange={updateData} />;
      case 'list':
        return <ListEditor data={visualData} onChange={updateData} />;
      case 'table':
        return <TableEditor data={visualData} onChange={updateData} />;
      case 'bar-chart':
        return <BarChartEditor data={visualData} onChange={updateData} />;
      case 'pie-chart':
        return <PieChartEditor data={visualData} onChange={updateData} />;
      case 'stats':
        return <StatsEditor data={visualData} onChange={updateData} />;
      case 'timeline':
        return <TimelineEditor data={visualData} onChange={updateData} />;
      case 'process-steps':
        return <ProcessStepsEditor data={visualData} onChange={updateData} />;
      case 'logo-grid':
        return <LogoGridEditor data={visualData} onChange={updateData} />;
      case 'hierarchy':
        return <HierarchyEditor data={visualData} onChange={updateData} />;
      case 'split-screen':
        return <SplitScreenEditor data={visualData} onChange={updateData} />;
      case 'kinetic':
        return <KineticEditor data={visualData} onChange={updateData} />;
      case 'service-mesh':
        return <ServiceMeshEditor data={visualData} onChange={updateData} />;
      default:
        return <div style={{ color: '#475569', fontSize: 12 }}>Unknown visual type: {section.visualType}</div>;
    }
  };

  // Header label
  const headerLabel = hasVisual
    ? (info?.label || section.visualType || 'Visual')
    : `Nodes (${section.nodes.length})`;

  const headerSymbol = hasVisual
    ? (info?.symbol || '')
    : section.layout;

  return (
    <div style={{
      width: 320,
      height: '100%',
      background: '#08080f',
      borderLeft: '1px solid #1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderBottom: '1px solid #1a1a2e',
        background: '#0a0a14',
        flexShrink: 0,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: accentColor,
          boxShadow: `0 0 10px ${accentColor}80`,
        }} />
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          color: accentColor,
          letterSpacing: '-0.02em',
          flex: 1,
        }}>
          {headerLabel}
        </span>
        <span style={{
          fontSize: 9,
          color: '#475569',
          fontFamily: "'SF Mono', monospace",
        }}>
          {section.title}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid #1a1a2e',
            borderRadius: 4,
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: 10,
            cursor: 'pointer',
            lineHeight: 1,
          }}
          title="Close panel"
        >
          x
        </button>
      </div>

      {/* Scrollable editor body */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 14px',
      }}>
        {hasVisual
          ? renderVisualEditor()
          : <NodeSectionEditor section={section} onChange={onChange} />
        }
      </div>
    </div>
  );
};

export default VisualSettingsPanel;
