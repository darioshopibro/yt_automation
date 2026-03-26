import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DynamicConfig, Sticky } from './types';
import { getStickyDimensions } from './styles';
import StickyNote from './StickyNote';

interface CanvasProps {
  config: DynamicConfig;
  onChange: (updater: (cfg: DynamicConfig) => DynamicConfig) => void;
  activeSection?: { stickyIdx: number; sectionIdx: number } | null;
}

// Matching DynamicPipeline.tsx positioning
const START_X = 80;
const STICKY_Y = 150;
const STICKY_GAP = 50;

const Canvas: React.FC<CanvasProps> = ({ config, onChange, activeSection }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & zoom state (Figma-style)
  const [zoom, setZoom] = useState(0.5);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Auto-fit on first load
  const [initialized, setInitialized] = useState(false);

  const updateSticky = (idx: number, updated: Sticky) => {
    onChange(cfg => {
      const stickies = [...cfg.stickies];
      stickies[idx] = updated;
      return { ...cfg, stickies };
    });
  };

  const removeSticky = (idx: number) => {
    onChange(cfg => {
      const stickies = cfg.stickies.filter((_, i) => i !== idx);
      stickies.forEach((s, i) => { s.step = i + 1; });
      return { ...cfg, stickies };
    });
  };

  const addSticky = () => {
    onChange(cfg => {
      const step = cfg.stickies.length + 1;
      return {
        ...cfg,
        stickies: [
          ...cfg.stickies,
          {
            step,
            title: 'New Step',
            color: '#3b82f6',
            sections: [
              {
                id: `section_${step}_1`,
                title: 'New Section',
                layout: 'flow',
                startFrame: 0,
                nodes: [{ label: 'New', icon: 'Circle' }],
              },
            ],
          },
        ],
      };
    });
  };

  // Compute global section offset for color rotation
  const globalOffsets: number[] = [];
  let offset = 0;
  for (const st of config.stickies) {
    globalOffsets.push(offset);
    offset += st.sections.length;
  }

  // Calculate sticky positions
  const stickyPositions: { x: number; y: number; width: number; height: number }[] = [];
  let currentX = START_X;
  for (const sticky of config.stickies) {
    const dims = getStickyDimensions(sticky.sections);
    stickyPositions.push({ x: currentX, y: STICKY_Y, width: dims.width, height: dims.height });
    currentX += dims.width + STICKY_GAP;
  }

  const totalContentWidth = currentX + 100;
  const totalContentHeight = STICKY_Y + Math.max(100, ...stickyPositions.map(p => p.height)) + 200;

  // Auto-fit to center content on load
  useEffect(() => {
    if (initialized || !containerRef.current || config.stickies.length === 0) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const fitZoomX = width / totalContentWidth;
    const fitZoomY = height / totalContentHeight;
    const fitZoom = Math.min(fitZoomX, fitZoomY) * 0.85;
    setZoom(Math.max(0.15, Math.min(1.5, fitZoom)));
    // Center content
    setPanX((width - totalContentWidth * fitZoom) / 2);
    setPanY((height - totalContentHeight * fitZoom) / 2);
    setInitialized(true);
  }, [config.stickies.length, initialized, totalContentWidth, totalContentHeight]);

  // Wheel = zoom (pinch on trackpad), shift+wheel = horizontal pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Pinch zoom (trackpad) or Ctrl+scroll
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
      const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor));

      // Zoom toward mouse position
      const scale = newZoom / zoom;
      setPanX(mouseX - (mouseX - panX) * scale);
      setPanY(mouseY - (mouseY - panY) * scale);
      setZoom(newZoom);
    } else {
      // Regular scroll = pan
      setPanX(prev => prev - e.deltaX);
      setPanY(prev => prev - e.deltaY);
    }
  }, [zoom, panX, panY]);

  // Mouse drag = pan (middle click, space+drag, or clicking empty canvas)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isCanvas = target.dataset.canvas === 'true';
    if (e.button === 1 || spaceHeld || (e.button === 0 && isCanvas)) {
      e.preventDefault();
      setIsPanning(true);
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  }, [spaceHeld]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setPanX(prev => prev + dx);
    setPanY(prev => prev + dy);
    setLastMouse({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastMouse]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Space key = pan mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target as HTMLElement).matches('input, textarea, [contenteditable]')) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Fit all button
  const fitAll = () => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const fitZoomX = width / totalContentWidth;
    const fitZoomY = height / totalContentHeight;
    const fitZoom = Math.min(fitZoomX, fitZoomY) * 0.85;
    const newZoom = Math.max(0.15, Math.min(1.5, fitZoom));
    setZoom(newZoom);
    setPanX((width - totalContentWidth * newZoom) / 2);
    setPanY((height - totalContentHeight * newZoom) / 2);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      data-canvas="true"
      style={{
        flex: 1,
        overflow: 'hidden',
        background: '#050508',
        cursor: isPanning || spaceHeld ? 'grabbing' : 'default',
        position: 'relative',
        userSelect: isPanning ? 'none' : 'auto',
      }}
    >
      {/* Infinite canvas */}
      <div
        data-canvas="true"
        style={{
          position: 'absolute',
          left: panX,
          top: panY,
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Background grid (subtle dots) */}
        <div
          data-canvas="true"
          style={{
            position: 'absolute',
            left: -2000,
            top: -2000,
            width: totalContentWidth + 4000,
            height: totalContentHeight + 4000,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Lines between stickies — stronger lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: totalContentWidth,
            height: totalContentHeight,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          {stickyPositions.slice(0, -1).map((pos, i) => {
            const nextPos = stickyPositions[i + 1];
            const stickyColor = config.stickies[i].color;
            const x1 = pos.x + pos.width;
            const y1 = pos.y + pos.height / 2;
            const x2 = nextPos.x;
            const y2 = nextPos.y + nextPos.height / 2;
            return (
              <g key={`sticky-line-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={stickyColor} strokeWidth={8} strokeOpacity={0.2}
                  strokeLinecap="round" />
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={stickyColor} strokeWidth={3} strokeOpacity={0.7}
                  strokeLinecap="round" />
                <circle cx={x2} cy={y2} r={5} fill={stickyColor} opacity={0.6} />
              </g>
            );
          })}
        </svg>

        {/* Stickies */}
        {config.stickies.map((sticky, idx) => {
          const pos = stickyPositions[idx];
          return (
            <div
              key={`${sticky.step}-${idx}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
              }}
            >
              <StickyNote
                sticky={sticky}
                stickyIndex={idx}
                globalSectionOffset={globalOffsets[idx]}
                showStepPrefix={config.showStepPrefix !== false}
                onChange={updated => updateSticky(idx, updated)}
                onRemove={() => removeSticky(idx)}
                activeSectionIdx={activeSection?.stickyIdx === idx ? activeSection.sectionIdx : undefined}
              />
            </div>
          );
        })}

        {/* Add sticky button — smaller, 120x120 */}
        <div
          onClick={addSticky}
          style={{
            position: 'absolute',
            left: currentX,
            top: STICKY_Y + 28,
            width: 120,
            height: 120,
            border: '1.5px dashed rgba(255,255,255,0.08)',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: 'rgba(255,255,255,0.2)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.2)';
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 300 }}>+</span>
          <span style={{ fontSize: 10, fontWeight: 600 }}>Add Step</span>
        </div>
      </div>

      {/* Bottom-right controls */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(12,12,22,0.9)',
        border: '1px solid #1a1a2e',
        borderRadius: 8,
        padding: '4px 8px',
        zIndex: 50,
      }}>
        <button
          onClick={() => setZoom(z => Math.max(0.1, z * 0.8))}
          style={{
            background: 'none', border: 'none', color: '#94a3b8', fontSize: 16,
            cursor: 'pointer', padding: '2px 6px', borderRadius: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >{'\u2212'}</button>
        <span style={{
          fontSize: 11, color: '#64748b', fontFamily: "'SF Mono', monospace",
          minWidth: 40, textAlign: 'center',
        }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(3, z * 1.25))}
          style={{
            background: 'none', border: 'none', color: '#94a3b8', fontSize: 16,
            cursor: 'pointer', padding: '2px 6px', borderRadius: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
        >+</button>
        <div style={{ width: 1, height: 16, background: '#1a1a2e' }} />
        <button
          onClick={fitAll}
          style={{
            background: 'none', border: 'none', color: '#94a3b8', fontSize: 11,
            cursor: 'pointer', padding: '2px 8px', borderRadius: 4,
            fontFamily: "'SF Mono', monospace",
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          title="Fit all (reset view)"
        >Fit</button>
      </div>
    </div>
  );
};

export default Canvas;
