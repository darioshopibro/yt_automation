import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DynamicConfig, Section } from './types';
import { loadConfig, saveConfig, listProjects } from './api';
import Canvas from './Canvas';
import BottomPanel from './BottomPanel';
import BrandingPage from './BrandingPage';
import VisualPreview from './VisualPreview';
import ResearchDashboard from './ResearchDashboard';
import VisualSettingsPanel from './editors/VisualSettingsPanel';
import { getColorSchemeForSection } from './types';

// Deep clone helper
function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

let toastId = 0;

export default function App() {
  const [project, setProject] = useState('templates/ai-video-gen-pipeline');
  const [config, setConfig] = useState<DynamicConfig | null>(null);
  const [history, setHistory] = useState<DynamicConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'branding' | 'visuals' | 'research'>('editor');

  // Preview panel state
  const [showPreview, setShowPreview] = useState(false);
  const [previewPort, setPreviewPort] = useState('3001');
  const [previewHeight, setPreviewHeight] = useState(40); // % of viewport

  // Player / active section state
  const [activeSection, setActiveSection] = useState<{ stickyIdx: number; sectionIdx: number } | null>(null);
  const [audioVersion, setAudioVersion] = useState(0);

  // Visual editing selection state
  const [selectedSection, setSelectedSection] = useState<{ stickyIdx: number; sectionIdx: number } | null>(null);

  // Show toast notification (slides from top-right)
  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Load project list on mount
  useEffect(() => {
    listProjects().then(setProjects).catch(() => {});
  }, []);

  // Load config
  const handleLoad = useCallback(async (proj?: string) => {
    const p = proj || project;
    if (!p.trim()) {
      showToast('Enter a project path', 'error');
      return;
    }
    setLoading(true);
    try {
      const cfg = await loadConfig(p.trim());
      setConfig(cfg);
      setHistory([]);
      setDirty(false);
      showToast(`Loaded: ${p}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [project, showToast]);

  // Auto-load on mount
  useEffect(() => {
    if (project) handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push current state to history before change
  const pushHistory = useCallback(() => {
    if (config) {
      setHistory(prev => [...prev.slice(-30), clone(config)]);
    }
  }, [config]);

  // Update config with history tracking
  const updateConfig = useCallback(
    (updater: (cfg: DynamicConfig) => DynamicConfig) => {
      if (!config) return;
      pushHistory();
      setConfig(updater(clone(config)));
      setDirty(true);
    },
    [config, pushHistory]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setConfig(prev);
    setDirty(true);
    showToast('Undo', 'info');
  }, [history, showToast]);

  // Save
  const handleSave = useCallback(async () => {
    if (!config || !project.trim()) return;
    setLoading(true);
    try {
      await saveConfig(project.trim(), config);
      setDirty(false);
      showToast('Saved! Remotion will hot-reload.', 'success');
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [config, project, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSave, handleUndo]);

  // Total counts
  const totalSections = config
    ? config.stickies.reduce((sum, st) => sum + st.sections.length, 0)
    : 0;
  const totalNodes = config
    ? config.stickies.reduce(
        (sum, st) => sum + st.sections.reduce((s2, sec) => s2 + sec.nodes.length, 0),
        0
      )
    : 0;

  const getToastIcon = (type: Toast['type']) => {
    if (type === 'success') return '\u2713';
    if (type === 'error') return '\u2715';
    return '\u2139';
  };

  const getToastColor = (type: Toast['type']) => {
    if (type === 'success') return '#22c55e';
    if (type === 'error') return '#ef4444';
    return '#818cf8';
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#030305',
      color: '#f8fafc',
      overflow: 'hidden',
    }}>
      {/* Top bar — compact single row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderBottom: '1px solid #1a1a2e',
        background: '#08080f',
        flexShrink: 0,
        zIndex: 50,
        height: 38,
      }}>
        {/* Tab buttons */}
        <button
          onClick={() => setActiveTab('editor')}
          style={{
            background: activeTab === 'editor' ? '#818cf820' : 'transparent',
            border: `1px solid ${activeTab === 'editor' ? '#818cf8' : 'transparent'}`,
            borderRadius: 6,
            padding: '3px 10px',
            color: activeTab === 'editor' ? '#818cf8' : '#64748b',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          Visual Editor
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          style={{
            background: activeTab === 'branding' ? '#818cf820' : 'transparent',
            border: `1px solid ${activeTab === 'branding' ? '#818cf8' : 'transparent'}`,
            borderRadius: 6,
            padding: '3px 10px',
            color: activeTab === 'branding' ? '#818cf8' : '#64748b',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          Branding
        </button>
        <button
          onClick={() => setActiveTab('visuals')}
          style={{
            background: activeTab === 'visuals' ? '#818cf820' : 'transparent',
            border: `1px solid ${activeTab === 'visuals' ? '#818cf8' : 'transparent'}`,
            borderRadius: 6,
            padding: '3px 10px',
            color: activeTab === 'visuals' ? '#818cf8' : '#64748b',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          Visuals
        </button>
        <button
          onClick={() => setActiveTab('research')}
          style={{
            background: activeTab === 'research' ? '#818cf820' : 'transparent',
            border: `1px solid ${activeTab === 'research' ? '#818cf8' : 'transparent'}`,
            borderRadius: 6,
            padding: '3px 10px',
            color: activeTab === 'research' ? '#818cf8' : '#64748b',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s',
          }}
        >
          Research
        </button>
        <span style={{ color: '#1a1a2e', fontSize: 14 }}>|</span>

        {/* Project dropdown — auto-loads on select (editor tab only) */}
        {activeTab === 'editor' && projects.length > 0 && (
          <select
            value={project}
            onChange={e => {
              const val = e.target.value;
              setProject(val);
              handleLoad(val);
            }}
            style={{
              background: '#0c0c18',
              border: '1px solid #1a1a2e',
              borderRadius: 6,
              padding: '4px 8px',
              color: '#f8fafc',
              fontSize: 11,
              outline: 'none',
              cursor: 'pointer',
              maxWidth: 220,
            }}
          >
            {projects.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        )}

        {/* Config metadata */}
        {activeTab === 'editor' && config && (
          <>
            <span style={{ color: '#1a1a2e', fontSize: 14 }}>|</span>
            <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              {config.title}
            </span>
            <span style={{ fontSize: 10, color: '#475569', fontFamily: "'SF Mono', monospace" }}>
              {config.stickies.length}st / {totalSections}sec / {totalNodes}n
            </span>
            <span style={{ fontSize: 10, color: '#475569', fontFamily: "'SF Mono', monospace" }}>
              {config.fps}fps
            </span>
          </>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Preview toggle (editor tab only) */}
        {activeTab === 'editor' && <button
          onClick={() => setShowPreview(prev => !prev)}
          style={{
            background: showPreview ? '#818cf8' : 'transparent',
            border: `1px solid ${showPreview ? '#818cf8' : '#1a1a2e'}`,
            borderRadius: 6,
            padding: '3px 10px',
            color: showPreview ? '#fff' : '#64748b',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          title="Toggle Remotion Preview"
        >
          {showPreview ? 'Hide Preview' : 'Preview'}
        </button>}

        {/* Undo icon button (editor tab only) */}
        {activeTab === 'editor' &&
        <button
          onClick={handleUndo}
          disabled={history.length === 0}
          style={{
            position: 'relative',
            background: 'transparent',
            border: `1px solid ${history.length > 0 ? '#1a1a2e' : '#0f0f1a'}`,
            borderRadius: 6,
            width: 30,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: history.length > 0 ? '#94a3b8' : '#2a2a3e',
            fontSize: 16,
            cursor: history.length > 0 ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
          title="Undo (Cmd+Z)"
        >
          &#x21B6;
          {history.length > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#818cf8',
              color: '#fff',
              fontSize: 8,
              fontWeight: 700,
              borderRadius: '50%',
              width: 14,
              height: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}>
              {history.length}
            </span>
          )}
        </button>}

        {/* Save icon button with unsaved dot (editor tab only) */}
        {activeTab === 'editor' &&
        <button
          onClick={handleSave}
          disabled={loading || !config}
          style={{
            position: 'relative',
            background: 'transparent',
            border: `1px solid #1a1a2e`,
            borderRadius: 6,
            width: 30,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.15s',
            opacity: loading ? 0.5 : 1,
          }}
          title="Save (Cmd+S)"
        >
          {loading ? '\u22EF' : '\u2B24'}
          {/* Small green dot indicator when unsaved */}
          {dirty && (
            <span style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }} />
          )}
        </button>}
      </div>

      {/* Main content area */}
      {activeTab === 'branding' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <BrandingPage />
        </div>
      ) : activeTab === 'visuals' ? (
        <div style={{ flex: 1, overflow: 'auto' }}>
          <VisualPreview />
        </div>
      ) : activeTab === 'research' ? (
        <div style={{ flex: 1, overflow: 'auto', background: '#0f172a' }}>
          <ResearchDashboard />
        </div>
      ) : (
        <div style={{
          flex: showPreview ? `0 0 ${100 - previewHeight}%` : '1 1 auto',
          display: 'flex',
          overflow: 'hidden',
          transition: 'flex 0.2s ease',
        }}>
          {config ? (
            <>
              <Canvas
                config={config}
                onChange={updateConfig}
                activeSection={activeSection}
                selectedSection={selectedSection}
                onSelectSection={(stickyIdx, sectionIdx) => {
                  setSelectedSection({ stickyIdx, sectionIdx });
                }}
              />
              {selectedSection && config.stickies[selectedSection.stickyIdx]?.sections[selectedSection.sectionIdx] && (() => {
                const sec = config.stickies[selectedSection.stickyIdx].sections[selectedSection.sectionIdx];
                let globalIdx = 0;
                for (let i = 0; i < selectedSection.stickyIdx; i++) {
                  globalIdx += config.stickies[i].sections.length;
                }
                globalIdx += selectedSection.sectionIdx;
                const cs = getColorSchemeForSection(globalIdx, sec.colorKey);
                return (
                  <VisualSettingsPanel
                    section={sec}
                    accentColor={cs.accent}
                    onChange={updated => {
                      updateConfig(cfg => {
                        const stickies = [...cfg.stickies];
                        const sticky = { ...stickies[selectedSection.stickyIdx] };
                        const sections = [...sticky.sections];
                        sections[selectedSection.sectionIdx] = updated;
                        sticky.sections = sections;
                        stickies[selectedSection.stickyIdx] = sticky;
                        return { ...cfg, stickies };
                      });
                    }}
                    onClose={() => setSelectedSection(null)}
                  />
                );
              })()}
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: '#475569',
            }}>
              {loading ? (
                <span style={{ fontSize: 16 }}>Loading...</span>
              ) : (
                <>
                  <span style={{ fontSize: 48, opacity: 0.2 }}>~</span>
                  <span style={{ fontSize: 16 }}>No config loaded</span>
                  <span style={{ fontSize: 13 }}>Select a project above</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Preview panel (editor tab only) */}
      {activeTab === 'editor' && showPreview && (
        <div style={{
          flex: `0 0 ${previewHeight}%`,
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid #1a1a2e',
          background: '#08080f',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Drag handle to resize */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: 0,
              right: 0,
              height: 8,
              cursor: 'ns-resize',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseDown={e => {
              e.preventDefault();
              const startY = e.clientY;
              const startHeight = previewHeight;
              const onMove = (ev: MouseEvent) => {
                const dy = startY - ev.clientY;
                const vh = window.innerHeight;
                const newHeight = Math.max(15, Math.min(80, startHeight + (dy / vh) * 100));
                setPreviewHeight(newHeight);
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
          >
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: '#2a2a3e',
            }} />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 16px',
            borderBottom: '1px solid #1a1a2e',
            background: '#0a0a14',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#818cf8',
              letterSpacing: '-0.02em',
            }}>
              Remotion Preview
            </span>
            <span style={{ color: '#1a1a2e' }}>|</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>Port:</span>
            <input
              value={previewPort}
              onChange={e => setPreviewPort(e.target.value.replace(/\D/g, ''))}
              style={{
                width: 50,
                background: '#0c0c18',
                border: '1px solid #1a1a2e',
                borderRadius: 4,
                padding: '2px 6px',
                color: '#f8fafc',
                fontSize: 10,
                outline: 'none',
                textAlign: 'center',
              }}
            />
            <a
              href={`http://localhost:${previewPort}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 10,
                color: '#64748b',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#818cf8'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = '#64748b'; }}
            >
              Open in new tab
            </a>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShowPreview(false)}
              style={{
                background: 'transparent',
                border: '1px solid #1a1a2e',
                borderRadius: 4,
                padding: '2px 8px',
                color: '#64748b',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              Collapse
            </button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <iframe
              src={`http://localhost:${previewPort}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#000',
              }}
              title="Remotion Studio Preview"
              allow="autoplay"
            />
          </div>
        </div>
      )}

      {/* Bottom Panel (Player + Voice + Transcript) — editor tab only */}
      {activeTab === 'editor' && config && (
        <BottomPanel
          project={project}
          config={config}
          audioVersion={audioVersion}
          onActiveSection={(stickyIdx, sectionIdx) => setActiveSection({ stickyIdx, sectionIdx })}
          onRegenerated={() => {
            setAudioVersion(v => v + 1);
            showToast('Voiceover regenerated!', 'success');
          }}
        />
      )}

      {/* Toast stack — top-right */}
      <div style={{
        position: 'fixed',
        top: 12,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 2000,
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              background: `${getToastColor(t.type)}dd`,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              animation: 'toastSlideIn 0.2s ease-out',
              pointerEvents: 'auto',
            }}
          >
            <span style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {getToastIcon(t.type)}
            </span>
            {t.message}
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
