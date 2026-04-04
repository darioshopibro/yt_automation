import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DynamicConfig, Section } from './types';
import { loadConfig, saveConfig, listProjects } from './api';
import Canvas from './Canvas';
import BottomPanel from './BottomPanel';
import ReviewPage from './ReviewPage';
import ResearchDashboard from './ResearchDashboard';
import GeneratedEditor from './GeneratedEditor';
import ImprovementsPage from './ImprovementsPage';
import VisualSettingsPanel from './editors/VisualSettingsPanel';
import { getColorSchemeForSection } from './types';

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
  const [activeTab, setActiveTab] = useState<'editor' | 'review' | 'visual' | 'research' | 'improvements'>('review');

  const [showPreview, setShowPreview] = useState(false);
  const [previewPort, setPreviewPort] = useState('3001');
  const [previewHeight, setPreviewHeight] = useState(40);
  const [activeSection, setActiveSection] = useState<{ stickyIdx: number; sectionIdx: number } | null>(null);
  const [audioVersion, setAudioVersion] = useState(0);
  const [selectedSection, setSelectedSection] = useState<{ stickyIdx: number; sectionIdx: number } | null>(null);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3000);
  }, []);

  useEffect(() => { listProjects().then(setProjects).catch(() => {}); }, []);

  const handleLoad = useCallback(async (proj?: string) => {
    const p = proj || project;
    if (!p.trim()) { showToast('Enter a project path', 'error'); return; }
    setLoading(true);
    try {
      const cfg = await loadConfig(p.trim());
      setConfig(cfg);
      setHistory([]);
      setDirty(false);
      showToast(`Loaded: ${p}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setLoading(false); }
  }, [project, showToast]);

  useEffect(() => { if (project) handleLoad(); }, []);

  const pushHistory = useCallback(() => {
    if (config) setHistory(prev => [...prev.slice(-30), clone(config)]);
  }, [config]);

  const updateConfig = useCallback((updater: (cfg: DynamicConfig) => DynamicConfig) => {
    if (!config) return;
    pushHistory();
    setConfig(updater(clone(config)));
    setDirty(true);
  }, [config, pushHistory]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    setHistory(h => h.slice(0, -1));
    setConfig(history[history.length - 1]);
    setDirty(true);
    showToast('Undo', 'info');
  }, [history, showToast]);

  const handleSave = useCallback(async () => {
    if (!config || !project.trim()) return;
    setLoading(true);
    try {
      await saveConfig(project.trim(), config);
      setDirty(false);
      showToast('Saved! Remotion will hot-reload.', 'success');
    } catch (err: any) {
      showToast(`Save failed: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }, [config, project, showToast]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSave, handleUndo]);

  const totalSections = config ? config.stickies.reduce((sum, st) => sum + st.sections.length, 0) : 0;
  const totalNodes = config ? config.stickies.reduce((sum, st) => sum + st.sections.reduce((s2, sec) => s2 + sec.nodes.length, 0), 0) : 0;

  const tabStyle = (tab: string) => ({
    background: activeTab === tab ? '#eef2ff' : 'transparent',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
    padding: '6px 14px',
    color: activeTab === tab ? '#6366f1' : '#9ca3af',
    fontSize: 12,
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
    transition: 'all 0.1s',
    letterSpacing: '-0.01em',
  });

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: (activeTab === 'review' || activeTab === 'visual' || activeTab === 'improvements') ? '#fafafa' : '#030305', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0 12px',
        borderBottom: '1px solid #e5e7eb',
        background: '#fff',
        flexShrink: 0, zIndex: 50, height: 38,
      }}>
        <button onClick={() => setActiveTab('editor')} style={tabStyle('editor')}>Editor</button>
        <button onClick={() => setActiveTab('review')} style={tabStyle('review')}>Review</button>
        <button onClick={() => setActiveTab('visual')} style={tabStyle('visual')}>Visual</button>
        <button onClick={() => setActiveTab('research')} style={tabStyle('research')}>Research</button>
        <button onClick={() => setActiveTab('improvements')} style={tabStyle('improvements')}>Improvements</button>

        <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 12px' }} />

        {activeTab === 'editor' && projects.length > 0 && (
          <select
            value={project}
            onChange={e => { setProject(e.target.value); handleLoad(e.target.value); }}
            style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 5, padding: '4px 8px', color: '#374151', fontSize: 11, outline: 'none', cursor: 'pointer', maxWidth: 220 }}
          >
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}

        {activeTab === 'editor' && config && (
          <>
            <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8 }}>{config.title}</span>
            <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 8, fontFamily: 'monospace' }}>{config.stickies.length}st / {totalSections}sec / {totalNodes}n</span>
          </>
        )}

        <div style={{ flex: 1 }} />

        {activeTab === 'editor' && (
          <>
            <button onClick={() => setShowPreview(prev => !prev)} style={{ background: showPreview ? '#eef2ff' : 'transparent', border: '1px solid #e5e7eb', borderRadius: 5, padding: '3px 10px', color: showPreview ? '#6366f1' : '#9ca3af', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button onClick={handleUndo} disabled={history.length === 0} title="Undo (Cmd+Z)" style={{ position: 'relative', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 5, width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: history.length > 0 ? '#6b7280' : '#d1d5db', fontSize: 16, cursor: history.length > 0 ? 'pointer' : 'default', marginLeft: 4 }}>
              &#x21B6;
              {history.length > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#6366f1', color: '#fff', fontSize: 8, fontWeight: 700, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{history.length}</span>}
            </button>
            <button onClick={handleSave} disabled={loading || !config} title="Save (Cmd+S)" style={{ position: 'relative', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 5, width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 14, cursor: 'pointer', opacity: loading ? 0.5 : 1, marginLeft: 4 }}>
              &#x2B24;
              {dirty && <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#059669', boxShadow: '0 0 6px #059669' }} />}
            </button>
          </>
        )}
      </div>

      {/* Main content */}
      {activeTab === 'review' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ReviewPage />
        </div>
      ) : activeTab === 'visual' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <GeneratedEditor />
        </div>
      ) : activeTab === 'research' ? (
        <div style={{ flex: 1, overflow: 'auto', background: '#fafafa' }}>
          <ResearchDashboard />
        </div>
      ) : activeTab === 'improvements' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ImprovementsPage />
        </div>
      ) : (
        <div style={{ flex: showPreview ? `0 0 ${100 - previewHeight}%` : '1 1 auto', display: 'flex', overflow: 'hidden', background: '#030305' }}>
          {config ? (
            <>
              <Canvas config={config} onChange={updateConfig} activeSection={activeSection} selectedSection={selectedSection} onSelectSection={(stickyIdx, sectionIdx) => setSelectedSection({ stickyIdx, sectionIdx })} />
              {selectedSection && config.stickies[selectedSection.stickyIdx]?.sections[selectedSection.sectionIdx] && (() => {
                const sec = config.stickies[selectedSection.stickyIdx].sections[selectedSection.sectionIdx];
                let globalIdx = 0;
                for (let i = 0; i < selectedSection.stickyIdx; i++) globalIdx += config.stickies[i].sections.length;
                globalIdx += selectedSection.sectionIdx;
                const cs = getColorSchemeForSection(globalIdx, sec.colorKey);
                return (
                  <VisualSettingsPanel section={sec} accentColor={cs.accent} onChange={updated => {
                    updateConfig(cfg => {
                      const stickies = [...cfg.stickies];
                      const sticky = { ...stickies[selectedSection.stickyIdx] };
                      const sections = [...sticky.sections];
                      sections[selectedSection.sectionIdx] = updated;
                      sticky.sections = sections;
                      stickies[selectedSection.stickyIdx] = sticky;
                      return { ...cfg, stickies };
                    });
                  }} onClose={() => setSelectedSection(null)} />
                );
              })()}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#475569' }}>
              {loading ? <span style={{ fontSize: 16 }}>Loading...</span> : (
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

      {/* Preview panel (editor only) */}
      {activeTab === 'editor' && showPreview && (
        <div style={{ flex: `0 0 ${previewHeight}%`, display: 'flex', flexDirection: 'column', borderTop: '1px solid #1a1a2e', background: '#08080f', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -4, left: 0, right: 0, height: 8, cursor: 'ns-resize', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseDown={e => {
              e.preventDefault();
              const startY = e.clientY; const startH = previewHeight;
              const onMove = (ev: MouseEvent) => setPreviewHeight(Math.max(15, Math.min(80, startH + ((startY - ev.clientY) / window.innerHeight) * 100)));
              const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
              document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
            }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#2a2a3e' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 16px', borderBottom: '1px solid #1a1a2e', background: '#0a0a14', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8' }}>Remotion Preview</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>Port:</span>
            <input value={previewPort} onChange={e => setPreviewPort(e.target.value.replace(/\D/g, ''))} style={{ width: 50, background: '#0c0c18', border: '1px solid #1a1a2e', borderRadius: 4, padding: '2px 6px', color: '#f8fafc', fontSize: 10, outline: 'none', textAlign: 'center' }} />
            <div style={{ flex: 1 }} />
            <button onClick={() => setShowPreview(false)} style={{ background: 'transparent', border: '1px solid #1a1a2e', borderRadius: 4, padding: '2px 8px', color: '#64748b', fontSize: 10, cursor: 'pointer' }}>Collapse</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <iframe src={`http://localhost:${previewPort}`} style={{ width: '100%', height: '100%', border: 'none', background: '#000' }} title="Remotion" allow="autoplay" />
          </div>
        </div>
      )}

      {/* Bottom Panel (editor only) */}
      {activeTab === 'editor' && config && (
        <BottomPanel project={project} config={config} audioVersion={audioVersion} onActiveSection={(si, se) => setActiveSection({ stickyIdx: si, sectionIdx: se })} onRegenerated={() => { setAudioVersion(v => v + 1); showToast('Voiceover regenerated!', 'success'); }} />
      )}

      {/* Toasts */}
      <div style={{ position: 'fixed', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 2000, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#fff', background: `${t.type === 'success' ? '#059669' : t.type === 'error' ? '#ef4444' : '#6366f1'}dd`, backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: 'toastSlideIn 0.2s ease-out', pointerEvents: 'auto' }}>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes toastSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
