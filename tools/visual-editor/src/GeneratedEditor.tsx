import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import {
  Play, Pause, SkipBack, SkipForward, FileTsx, CaretDown, CaretRight,
  MagnifyingGlass, X, FloppyDisk, ArrowCounterClockwise,
  PencilSimple, Trash, Palette, TextAa, Cube, Lightning,
  Eye, ArrowClockwise, FilmStrip, XCircle,
} from '@phosphor-icons/react';
import {
  fetchProjects, fetchFiles, parseFile, applyEdits, searchIcons,
  ParsedComponent, EditOperation, ColorEntry, IconEntry, TextEntry, SceneEntry, ConstantEntry,
} from './generatedApi';
import { fetchSegments, SegmentInfo, CompositionInfo } from './reviewApi';

// ── Theme ──
const C = {
  bg: '#0a0a0f', surface: '#131320', surfaceLight: '#1a1a2e',
  border: '#252540', borderLight: '#1e1e35',
  text: '#e2e8f0', textMid: '#94a3b8', textDim: '#64748b',
  accent: '#6366f1', accentLight: '#6366f120',
  good: '#10b981', bad: '#f43f5e', warn: '#f59e0b',
};

// ── Dynamic single-file loader ──
function useSingleComponent(project: string, file: string) {
  const [Comp, setComp] = useState<React.FC<any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ durationInFrames: number; fps: number; initialSeek: number; segStart: number; segEnd: number } | null>(null);

  useEffect(() => {
    if (!project || !file) { setComp(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const modName = file.replace('.tsx', '');
        const mod = await import(/* @vite-ignore */ `/Users/dario61/Desktop/YT automation/videos/${project}/src/visuals/${modName}`);
        if (cancelled) return;

        const Component = mod.default;

        // Get segment info for this file to know its global frame range
        let segStartFrame = 0;
        let segEndFrame = 600;
        let totalDuration = 600;
        let hasProps = false;

        try {
          const segData = await fetchSegments(project);
          const seg = segData.segments.find((s: SegmentInfo) => s.file === file);
          if (seg) {
            segStartFrame = seg.startFrame;
            segEndFrame = seg.endFrame;
          }
          // Total video duration (we need this for components that use global frames)
          totalDuration = segData.composition?.durationInFrames || segEndFrame;
        } catch {}

        // Check if component uses startFrame/endFrame props
        try {
          const resp = await fetch(`/api/generated/${project}/${file}/parse`);
          const data = await resp.json();
          hasProps = data.source?.includes('startFrame: number') || false;
        } catch {}

        // ALL components use useCurrentFrame() which returns global frame numbers.
        // Even components with startFrame/endFrame props typically use global frame
        // constants (e.g. F_MAJOR_PROBLEM = 1719) without offsetting.
        // So the Player ALWAYS spans the full video duration and we seek to the segment start.

        const sf = segStartFrame;
        const ef = segEndFrame;
        const hp = hasProps;
        const Wrapper: React.FC = () => (
          <AbsoluteFill style={{ background: '#030305' }}>
            {hp ? <Component startFrame={sf} endFrame={ef} /> : <Component />}
          </AbsoluteFill>
        );
        setComp(() => Wrapper);
        setMeta({ durationInFrames: totalDuration, fps: 30, initialSeek: segStartFrame, segStart: segStartFrame, segEnd: segEndFrame });
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) { setError(err.message); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [project, file]);

  return { Comp, loading, error, meta };
}

// ══════════════════════════════════════
//  MAIN EDITOR
// ══════════════════════════════════════
export default function GeneratedEditor() {
  const [projects, setProjects] = useState<string[]>([]);
  const [project, setProject] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState('');
  const [parsed, setParsed] = useState<ParsedComponent | null>(null);
  const [source, setSource] = useState('');
  const [pendingEdits, setPendingEdits] = useState<EditOperation[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Player
  const playerRef = useRef<PlayerRef>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Popup
  const [popup, setPopup] = useState<{ type: 'color' | 'icon' | 'text' | 'constant'; item: any } | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);

  // (removed: selectedElId, ctxMenu — replaced by command palette)

  // Icon search
  const [iconQuery, setIconQuery] = useState('');
  const [iconResults, setIconResults] = useState<string[]>([]);

  // Scrubber drag
  const [scrubbing, setScrubbing] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const { Comp, loading: compLoading, error: compError, meta } = useSingleComponent(project, activeFile);

  // Load projects
  useEffect(() => {
    fetchProjects().then(p => { setProjects(p); if (p.length && !project) setProject(p[0]); });
  }, []);

  // Load files
  useEffect(() => {
    if (!project) return;
    fetchFiles(project).then(f => { setFiles(f); if (f.length) setActiveFile(f[0]); });
  }, [project]);

  // Parse file
  useEffect(() => {
    if (!project || !activeFile) return;
    parseFile(project, activeFile).then(({ parsed: p, source: s }) => {
      setParsed(p);
      setSource(s);
      setPendingEdits([]);
      setPopup(null);
    });
  }, [project, activeFile]);

  // Seek to segment start when component loads
  useEffect(() => {
    if (!meta || !Comp || !playerRef.current) return;
    if (meta.initialSeek > 0) {
      const t = setTimeout(() => {
        playerRef.current?.seekTo(meta.initialSeek);
        setCurrentFrame(meta.initialSeek);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [Comp, meta]);

  // Poll frame
  useEffect(() => {
    if (!playerRef.current) return;
    const iv = setInterval(() => {
      const f = playerRef.current?.getCurrentFrame();
      if (f !== undefined) setCurrentFrame(f);
    }, 50);
    return () => clearInterval(iv);
  }, [Comp]);

  // Icon search
  useEffect(() => {
    if (!iconQuery) { setIconResults([]); return; }
    const t = setTimeout(() => searchIcons(iconQuery).then(setIconResults), 200);
    return () => clearTimeout(t);
  }, [iconQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seekTo(currentFrame - (e.shiftKey ? fps * 5 : fps)); break;
        case 'ArrowRight': e.preventDefault(); seekTo(currentFrame + (e.shiftKey ? fps * 5 : fps)); break;
        case 'Escape': setPopup(null); setPaletteOpen(false); break;
        case 's': if (e.metaKey || e.ctrlKey) { e.preventDefault(); handleSave(); } break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentFrame, isPlaying, pendingEdits, parsed]);

  // ── Scrubber drag (constrained to segment range) ──
  const segStart = meta?.segStart || 0;
  const segEnd = meta?.segEnd || meta?.durationInFrames || 1;
  const segDuration = segEnd - segStart;

  const scrubFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    const r = scrubberRef.current?.getBoundingClientRect();
    if (!r || !meta) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const f = Math.floor(segStart + pct * segDuration);
    playerRef.current?.seekTo(f);
    setCurrentFrame(f);
  }, [meta, segStart, segDuration]);

  useEffect(() => {
    if (!scrubbing) return;
    const onMove = (e: MouseEvent) => scrubFromEvent(e);
    const onUp = () => setScrubbing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [scrubbing, scrubFromEvent]);

  // ── Player controls ──
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pause(); else playerRef.current.play();
    setIsPlaying(!isPlaying);
  };
  const seekTo = (f: number) => {
    const clamped = Math.max(segStart, Math.min(f, segEnd - 1));
    playerRef.current?.seekTo(clamped);
    setCurrentFrame(clamped);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── Command palette — click ANYWHERE in player opens searchable list of ALL elements ──
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const paletteInputRef = useRef<HTMLInputElement>(null);

  // Live values with pending edits applied (must be before paletteItems)
  const liveVal = useCallback((type: string, id: string, original: string) => {
    const edit = pendingEdits.find(e => e.type === type && e.id === id);
    return edit ? edit.newValue : original;
  }, [pendingEdits]);

  const handlePlayerClick = useCallback((e: React.MouseEvent) => {
    if (!parsed) return;
    if (popup || paletteOpen) return;
    setPaletteOpen(true);
    setPaletteQuery('');
    setTimeout(() => paletteInputRef.current?.focus(), 50);
  }, [parsed, popup, paletteOpen]);

  // All palette items
  const paletteItems = useMemo(() => {
    if (!parsed) return [];
    const items: { type: 'color' | 'icon' | 'text' | 'constant'; item: any; label: string; category: string }[] = [];
    parsed.texts.forEach(t => items.push({ type: 'text', item: t, label: liveVal('text', t.id, t.text), category: 'Text' }));
    parsed.icons.forEach(ic => items.push({ type: 'icon', item: ic, label: liveVal('icon', ic.id, ic.name), category: 'Icon' }));
    parsed.colors.forEach(c => items.push({ type: 'color', item: c, label: `${c.key} — ${liveVal('color', c.id, c.value)}`, category: 'Color' }));
    parsed.constants.forEach(c => items.push({ type: 'constant', item: c, label: `${c.name} = "${liveVal('constant', c.id, c.value)}"`, category: 'Constant' }));
    return items;
  }, [parsed, pendingEdits]);

  const filteredPalette = useMemo(() => {
    if (!paletteQuery) return paletteItems;
    const q = paletteQuery.toLowerCase();
    return paletteItems.filter(i => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [paletteItems, paletteQuery]);

  // ── Edit helpers ──
  const addEdit = useCallback((edit: EditOperation) => {
    setPendingEdits(prev => [...prev.filter(e => !(e.type === edit.type && e.id === edit.id)), edit]);
  }, []);

  const handleSave = async () => {
    if (!project || !activeFile || !parsed || pendingEdits.length === 0) return;
    setSaving(true);
    try {
      const result = await applyEdits(project, activeFile, pendingEdits, parsed);
      setParsed(result.parsed);
      setPendingEdits([]);
      setPopup(null);
      showToast(`Saved ${pendingEdits.length} changes`);
    } catch (err: any) { showToast(`Error: ${err.message}`); }
    finally { setSaving(false); }
  };

  const handleDiscard = () => {
    setPendingEdits([]);
    setPopup(null);
    if (project && activeFile) parseFile(project, activeFile).then(({ parsed: p }) => setParsed(p));
  };

  const dirty = pendingEdits.length > 0;
  const fps = meta?.fps || 30;
  const totalFrames = meta?.durationInFrames || 1;
  const fmt = (f: number) => { const s = f / fps; return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; };

  // All elements flattened for the panel
  // Extract SCENE/frame constants from source (SCENE1_END = 220, F_TITLE = 45, etc.)
  const sceneConstants = useMemo(() => {
    if (!source) return [];
    const results: { name: string; value: string }[] = [];
    const pattern = /const\s+(SCENE\d+_\w+|F_\w+)\s*=\s*(\d+)/g;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(source)) !== null) {
      results.push({ name: m[1], value: m[2] });
    }
    return results;
  }, [source]);

  const elements = useMemo(() => {
    if (!parsed) return [];
    const els: { type: 'color' | 'icon' | 'text' | 'constant'; item: any; label: string; sublabel: string; iconEl: React.ReactNode }[] = [];
    parsed.colors.forEach(c => els.push({
      type: 'color', item: c, label: c.key,
      sublabel: liveVal('color', c.id, c.value),
      iconEl: <div style={{ width: 16, height: 16, borderRadius: 4, background: liveVal('color', c.id, c.value), border: `1px solid ${C.border}` }} />,
    }));
    parsed.icons.forEach(ic => els.push({
      type: 'icon', item: ic, label: liveVal('icon', ic.id, ic.name),
      sublabel: `Line ${ic.line}`,
      iconEl: <Cube size={16} color={C.accent} weight="duotone" />,
    }));
    parsed.texts.forEach(t => els.push({
      type: 'text', item: t, label: liveVal('text', t.id, t.text),
      sublabel: `Line ${t.line}`,
      iconEl: <TextAa size={16} color="#f59e0b" weight="duotone" />,
    }));
    parsed.constants.forEach(c => els.push({
      type: 'constant', item: c, label: c.name,
      sublabel: liveVal('constant', c.id, c.value),
      iconEl: <Lightning size={16} color="#a855f7" weight="duotone" />,
    }));
    return els;
  }, [parsed, pendingEdits]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: C.text }}>

      {/* ═══ TOP BAR ═══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
        <select value={project} onChange={e => setProject(e.target.value)}
          style={{ background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 8px', fontSize: 11, color: C.text, outline: 'none' }}>
          {projects.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <div style={{ width: 1, height: 18, background: C.border }} />

        {/* File tabs */}
        <div style={{ display: 'flex', gap: 2, overflow: 'auto', flex: 1 }}>
          {files.map(f => {
            const label = f.replace('Generated_', '').replace('.tsx', '');
            const isActive = f === activeFile;
            return (
              <button key={f} onClick={() => setActiveFile(f)}
                style={{
                  background: isActive ? C.accentLight : 'transparent', border: `1px solid ${isActive ? C.accent + '40' : 'transparent'}`,
                  borderRadius: 5, padding: '3px 10px', fontSize: 10, fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.accent : C.textDim, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ width: 1, height: 18, background: C.border }} />

        {dirty && (
          <>
            <span style={{ fontSize: 10, color: C.warn, fontWeight: 600 }}>{pendingEdits.length} changes</span>
            <button onClick={handleDiscard} style={{ ...smallBtn, color: C.textDim, border: `1px solid ${C.border}` }}>
              <ArrowCounterClockwise size={11} /> Discard
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ ...smallBtn, background: C.accent, color: '#fff', border: 'none', opacity: saving ? 0.5 : 1 }}>
              <FloppyDisk size={11} /> Save
            </button>
          </>
        )}
      </div>

      {/* ═══ MAIN: Player + Elements Panel ═══ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── VIDEO PLAYER ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

          {/* Player area */}
          <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {compLoading ? (
              <div style={{ color: '#666', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <ArrowClockwise size={24} color="#666" weight="bold" style={{ animation: 'spin 1s linear infinite' }} />
                Loading...
              </div>
            ) : compError ? (
              <div style={{ color: '#f66', fontSize: 12, textAlign: 'center', padding: 20, maxWidth: 400 }}>
                <XCircle size={24} color="#f66" weight="bold" />
                <div style={{ marginTop: 8 }}>{compError}</div>
              </div>
            ) : Comp && meta ? (
              <div data-player-container="true" onClick={handlePlayerClick} style={{ width: '100%', height: '100%', cursor: 'pointer', position: 'relative' }}>
                <Player
                  ref={playerRef}
                  component={Comp}
                  durationInFrames={meta.durationInFrames}
                  fps={meta.fps}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{ width: '100%', height: '100%' }}
                  clickToPlay={false}
                />
                {/* Click hint */}
                {!paletteOpen && !popup && (
                  <div style={{
                    position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 12px',
                    fontSize: 10, color: '#94a3b8', pointerEvents: 'none', zIndex: 15,
                    backdropFilter: 'blur(4px)',
                  }}>
                    Click anywhere to edit elements
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#555', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <FilmStrip size={32} color="#444" weight="thin" />
                Select a file to preview
              </div>
            )}

            {/* ═══ COMMAND PALETTE — searchable list of ALL elements ═══ */}
            {paletteOpen && (
              <>
                <div onClick={() => setPaletteOpen(false)}
                  style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 20 }} />
                <div style={{
                  position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
                  width: 450, maxHeight: '75%', background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.8)', zIndex: 25,
                  display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}>
                  {/* Search bar */}
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MagnifyingGlass size={16} color={C.textDim} />
                    <input ref={paletteInputRef} value={paletteQuery} onChange={e => setPaletteQuery(e.target.value)}
                      placeholder="Search elements... (text, icons, colors)"
                      onKeyDown={e => {
                        if (e.key === 'Escape') setPaletteOpen(false);
                        if (e.key === 'Enter' && filteredPalette.length > 0) {
                          const first = filteredPalette[0];
                          setPaletteOpen(false);
                          setPopup({ type: first.type, item: first.item });
                          setPopupPos(null);
                          if (first.type === 'icon') { setIconQuery(''); setIconResults([]); }
                        }
                      }}
                      style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 14, color: C.text, outline: 'none' }} />
                    <kbd style={{ ...kbd, fontSize: 9 }}>Esc</kbd>
                  </div>

                  {/* Results */}
                  <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
                    {filteredPalette.length === 0 && (
                      <div style={{ padding: 20, textAlign: 'center', color: C.textDim, fontSize: 12 }}>No matches</div>
                    )}
                    {filteredPalette.map((item, i) => (
                      <div key={`${item.type}-${i}`}
                        onClick={() => {
                          setPaletteOpen(false);
                          setPopup({ type: item.type, item: item.item });
                          setPopupPos(null);
                          if (item.type === 'icon') { setIconQuery(''); setIconResults([]); }
                        }}
                        style={{
                          padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                          transition: 'background 0.05s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = C.surfaceLight}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {/* Type icon */}
                        {item.type === 'color' && <div style={{ width: 18, height: 18, borderRadius: 4, background: item.item.value, border: `1px solid ${C.border}`, flexShrink: 0 }} />}
                        {item.type === 'icon' && <Cube size={16} color={C.accent} weight="duotone" />}
                        {item.type === 'text' && <TextAa size={16} color="#f59e0b" weight="duotone" />}
                        {item.type === 'constant' && <Lightning size={16} color="#a855f7" weight="duotone" />}
                        {/* Label */}
                        <span style={{ flex: 1, fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </span>
                        {/* Category badge */}
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                          background: item.type === 'color' ? '#6366f115' : item.type === 'icon' ? '#6366f115' : item.type === 'text' ? '#f59e0b15' : '#a855f715',
                          color: item.type === 'color' ? C.accent : item.type === 'icon' ? C.accent : item.type === 'text' ? '#f59e0b' : '#a855f7',
                        }}>
                          {item.category}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer hint */}
                  <div style={{ padding: '6px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 12, fontSize: 9, color: C.textDim }}>
                    <span><kbd style={kbd}>Enter</kbd> select first</span>
                    <span><kbd style={kbd}>Esc</kbd> close</span>
                    <span style={{ marginLeft: 'auto' }}>{filteredPalette.length} / {paletteItems.length} elements</span>
                  </div>
                </div>
              </>
            )}

            {/* ── COMMAND POPUP (positioned near click) ── */}
            {popup && (
              <div style={{
                position: 'fixed',
                left: Math.min((popupPos?.x || 400), window.innerWidth - 400),
                top: Math.min((popupPos?.y || 300) - 20, window.innerHeight - 350),
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: 16, minWidth: 300, maxWidth: 420,
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)', zIndex: 30,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  {popup.type === 'color' && <Palette size={18} color={C.accent} weight="duotone" />}
                  {popup.type === 'icon' && <Cube size={18} color={C.accent} weight="duotone" />}
                  {popup.type === 'text' && <TextAa size={18} color="#f59e0b" weight="duotone" />}
                  {popup.type === 'constant' && <Lightning size={18} color="#a855f7" weight="duotone" />}
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text, flex: 1 }}>
                    Edit {popup.type === 'color' ? 'Color' : popup.type === 'icon' ? 'Icon' : popup.type === 'text' ? 'Text' : 'Constant'}
                  </span>
                  <button onClick={() => setPopup(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textDim, padding: 4 }}>
                    <X size={16} weight="bold" />
                  </button>
                </div>

                {/* ── Color popup ── */}
                {popup.type === 'color' && (() => {
                  const c = popup.item as ColorEntry;
                  const val = liveVal('color', c.id, c.value);
                  return (
                    <div>
                      <div style={{ fontSize: 11, color: C.textMid, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{c.objectName}.{c.key}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <input type="color" value={val}
                          onChange={e => addEdit({ type: 'color', id: c.id, oldValue: c.value, newValue: e.target.value })}
                          style={{ width: 60, height: 60, border: 'none', cursor: 'pointer', borderRadius: 8, background: 'transparent' }} />
                        <div>
                          <input value={val}
                            onChange={e => addEdit({ type: 'color', id: c.id, oldValue: c.value, newValue: e.target.value })}
                            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 14, fontWeight: 600, width: 120 }} />
                          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                            {['#3b82f6', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444', '#a855f7', '#ec4899', '#f97316'].map(hex => (
                              <div key={hex} onClick={() => addEdit({ type: 'color', id: c.id, oldValue: c.value, newValue: hex })}
                                style={{ width: 24, height: 24, borderRadius: 6, background: hex, cursor: 'pointer', border: val === hex ? '2px solid #fff' : `1px solid ${C.border}` }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Icon popup ── */}
                {popup.type === 'icon' && (() => {
                  const ic = popup.item as IconEntry;
                  const val = liveVal('icon', ic.id, ic.name);
                  return (
                    <div>
                      <div style={{ fontSize: 12, color: C.text, marginBottom: 8 }}>
                        Current: <span style={{ fontWeight: 700, color: C.accent }}>{val}</span>
                        <span style={{ fontSize: 10, color: C.textDim, marginLeft: 8 }}>Line {ic.line}</span>
                      </div>
                      <div style={{ position: 'relative', marginBottom: 8 }}>
                        <MagnifyingGlass size={12} color={C.textDim} style={{ position: 'absolute', left: 10, top: 10 }} />
                        <input value={iconQuery} onChange={e => setIconQuery(e.target.value)}
                          placeholder="Search Phosphor icons..."
                          autoFocus
                          style={{ ...inputStyle, paddingLeft: 28, width: '100%' }} />
                      </div>
                      {iconResults.length > 0 && (
                        <div style={{ maxHeight: 200, overflow: 'auto', border: `1px solid ${C.border}`, borderRadius: 6, background: C.bg }}>
                          {iconResults.slice(0, 30).map(name => (
                            <div key={name} onClick={() => {
                              addEdit({ type: 'icon', id: ic.id, oldValue: ic.name, newValue: name });
                              setIconQuery('');
                              setIconResults([]);
                            }}
                              style={{
                                padding: '6px 12px', fontSize: 11, cursor: 'pointer', color: C.text,
                                background: name === val ? C.accentLight : 'transparent',
                                display: 'flex', alignItems: 'center', gap: 8,
                              }}
                              onMouseEnter={e => { if (name !== val) e.currentTarget.style.background = C.surfaceLight; }}
                              onMouseLeave={e => { if (name !== val) e.currentTarget.style.background = 'transparent'; }}>
                              <Cube size={12} color={C.textDim} weight="duotone" />
                              <span style={{ fontWeight: name === val ? 700 : 400 }}>{name}</span>
                              {name === val && <span style={{ fontSize: 9, color: C.accent, marginLeft: 'auto' }}>current</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ── Text popup ── */}
                {popup.type === 'text' && (() => {
                  const t = popup.item as TextEntry;
                  const val = liveVal('text', t.id, t.text);
                  return (
                    <div>
                      <div style={{ fontSize: 10, color: C.textDim, marginBottom: 8 }}>Line {t.line}</div>
                      <input value={val}
                        onChange={e => addEdit({ type: 'text', id: t.id, oldValue: t.text, newValue: e.target.value })}
                        autoFocus
                        style={{ ...inputStyle, width: '100%', fontSize: 16, fontWeight: 600, padding: '10px 14px' }} />
                      <div style={{ fontSize: 9, color: C.textDim, marginTop: 8, fontFamily: 'monospace', background: C.bg, padding: '6px 10px', borderRadius: 4, maxHeight: 60, overflow: 'auto' }}>
                        {t.context}
                      </div>
                    </div>
                  );
                })()}

                {/* ── Constant popup ── */}
                {popup.type === 'constant' && (() => {
                  const co = popup.item as ConstantEntry;
                  const val = liveVal('constant', co.id, co.value);
                  return (
                    <div>
                      <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: C.accent, marginBottom: 8 }}>{co.name}</div>
                      <input value={val}
                        onChange={e => addEdit({ type: 'constant', id: co.id, oldValue: co.value, newValue: e.target.value })}
                        autoFocus
                        style={{ ...inputStyle, width: '100%', fontSize: 14, fontFamily: 'monospace', padding: '10px 14px' }} />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Popup backdrop */}
            {popup && (
              <div onClick={() => { setPopup(null); }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 25 }} />
            )}
          </div>

          {/* ── PLAYER CONTROLS ── */}
          <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button onClick={() => seekTo(segStart)} style={ctrlBtn}><SkipBack size={13} weight="bold" color={C.textMid} /></button>
            <button onClick={() => seekTo(currentFrame - fps)} style={ctrlBtn}><CaretRight size={13} weight="bold" color={C.textMid} style={{ transform: 'rotate(180deg)' }} /></button>
            <button onClick={togglePlay}
              style={{ ...ctrlBtn, background: C.accent, borderColor: C.accent, borderRadius: '50%', width: 32, height: 32 }}>
              {isPlaying ? <Pause size={14} weight="bold" color="#fff" /> : <Play size={14} weight="fill" color="#fff" />}
            </button>
            <button onClick={() => seekTo(currentFrame + fps)} style={ctrlBtn}><CaretRight size={13} weight="bold" color={C.textMid} /></button>
            <button onClick={() => seekTo(segEnd - 1)} style={ctrlBtn}><SkipForward size={13} weight="bold" color={C.textMid} /></button>

            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: C.text }}>{fmt(currentFrame - segStart)}</span>
            <span style={{ fontSize: 9, fontFamily: 'monospace', color: C.textDim }}>/ {fmt(segDuration)}</span>

            {/* Scrubber — constrained to segment range */}
            <div ref={scrubberRef}
              style={{ flex: 1, height: 20, background: 'transparent', borderRadius: 3, position: 'relative', cursor: 'pointer', margin: '0 8px', display: 'flex', alignItems: 'center' }}
              onMouseDown={e => { setScrubbing(true); scrubFromEvent(e as any); }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 6, background: C.surfaceLight, borderRadius: 3 }} />
              <div style={{ position: 'absolute', left: 0, height: 6, width: `${segDuration > 0 ? ((currentFrame - segStart) / segDuration) * 100 : 0}%`, background: C.accent, borderRadius: 3, transition: isPlaying && !scrubbing ? 'none' : 'width 0.05s' }} />
              <div style={{
                position: 'absolute', left: `${segDuration > 0 ? ((currentFrame - segStart) / segDuration) * 100 : 0}%`, top: '50%', transform: 'translate(-50%, -50%)',
                width: 14, height: 14, borderRadius: '50%', background: C.accent, border: '2px solid #fff',
                boxShadow: '0 0 8px rgba(99,102,241,0.5)', zIndex: 2,
              }} />
            </div>

            {/* Keyboard hints */}
            <div style={{ display: 'flex', gap: 6, fontSize: 9, color: C.textDim }}>
              <span><kbd style={kbd}>Space</kbd> play</span>
              <span><kbd style={kbd}>&larr;&rarr;</kbd> seek</span>
            </div>
          </div>
        </div>

        {/* ═══ ELEMENTS PANEL (right sidebar) ═══ */}
        <div style={{ width: 320, minWidth: 320, borderLeft: `1px solid ${C.border}`, background: C.surface, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Elements {parsed ? `(${elements.length})` : ''}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {!parsed && (
              <div style={{ padding: 20, textAlign: 'center', color: C.textDim, fontSize: 11 }}>No file loaded</div>
            )}

            {parsed && (
              <>
                {/* Scenes — click to jump to that scene */}
                {parsed.scenes.length > 0 && (
                  <ElementGroup title="Scenes — click to jump" count={parsed.scenes.length}>
                    {parsed.scenes.map((sc, i) => {
                      // Estimate frame range from scene constants in source
                      // Scene boundaries are defined as constants like SCENE1_END, SCENE2_START
                      const nextScene = parsed.scenes[i + 1];
                      return (
                        <div key={sc.id}
                          onClick={() => {
                            // Jump to ~20 frames after scene start so elements are visible
                            // Use line numbers to estimate: each scene starts at its startLine
                            // but we need frame numbers. Look for SCENE*_START constants
                            const sceneNum = i + 1;
                            const startConst = sceneConstants.find(c => c.name.includes(`SCENE${sceneNum}_START`) || c.name.includes(`SCENE${sceneNum}_END`));
                            if (startConst) {
                              seekTo(parseInt(startConst.value) + 30);
                            }
                          }}
                          style={{ ...elRow, borderLeft: `3px solid ${C.accent}`, cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.surfaceLight}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Eye size={14} color={C.accent} weight="duotone" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sc.name.replace(/Scene\d+_/, '')}
                            </div>
                            <div style={{ fontSize: 9, color: C.textDim }}>{sc.comment}</div>
                          </div>
                          <span style={{ fontSize: 8, color: C.accent, fontFamily: 'monospace' }}>jump</span>
                        </div>
                      );
                    })}
                  </ElementGroup>
                )}

                {/* Colors */}
                {parsed.colors.length > 0 && (
                  <ElementGroup title="Colors" count={parsed.colors.length}>
                    {parsed.colors.map(c => {
                      const val = liveVal('color', c.id, c.value);
                      const isEdited = pendingEdits.some(e => e.id === c.id);
                      return (
                        <div key={c.id} onClick={() => { setPopup({ type: 'color', item: c }); }}
                          style={{ ...elRow, cursor: 'pointer', borderLeft: isEdited ? `3px solid ${C.warn}` : '3px solid transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.surfaceLight}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, background: val, border: `1px solid ${C.border}`, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{c.key}</div>
                            <div style={{ fontSize: 9, fontFamily: 'monospace', color: C.textDim }}>{val}</div>
                          </div>
                          <PencilSimple size={11} color={C.textDim} />
                        </div>
                      );
                    })}
                  </ElementGroup>
                )}

                {/* Icons */}
                {parsed.icons.length > 0 && (
                  <ElementGroup title="Icons" count={parsed.icons.length}>
                    {parsed.icons.map(ic => {
                      const val = liveVal('icon', ic.id, ic.name);
                      const isEdited = pendingEdits.some(e => e.id === ic.id);
                      return (
                        <div key={ic.id} onClick={() => { setPopup({ type: 'icon', item: ic }); setIconQuery(''); setIconResults([]); }}
                          style={{ ...elRow, cursor: 'pointer', borderLeft: isEdited ? `3px solid ${C.warn}` : '3px solid transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.surfaceLight}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Cube size={16} color={C.accent} weight="duotone" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{val}</div>
                            <div style={{ fontSize: 9, color: C.textDim }}>Line {ic.line}</div>
                          </div>
                          <PencilSimple size={11} color={C.textDim} />
                        </div>
                      );
                    })}
                  </ElementGroup>
                )}

                {/* Texts */}
                {parsed.texts.length > 0 && (
                  <ElementGroup title="Text Labels" count={parsed.texts.length}>
                    {parsed.texts.map(t => {
                      const val = liveVal('text', t.id, t.text);
                      const isEdited = pendingEdits.some(e => e.id === t.id);
                      return (
                        <div key={t.id} onClick={() => setPopup({ type: 'text', item: t })}
                          style={{ ...elRow, cursor: 'pointer', borderLeft: isEdited ? `3px solid ${C.warn}` : '3px solid transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.surfaceLight}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <TextAa size={16} color="#f59e0b" weight="duotone" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 500, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
                            <div style={{ fontSize: 9, color: C.textDim }}>Line {t.line}</div>
                          </div>
                          <PencilSimple size={11} color={C.textDim} />
                        </div>
                      );
                    })}
                  </ElementGroup>
                )}

                {/* Constants */}
                {parsed.constants.length > 0 && (
                  <ElementGroup title="Constants" count={parsed.constants.length}>
                    {parsed.constants.map(co => {
                      const val = liveVal('constant', co.id, co.value);
                      const isEdited = pendingEdits.some(e => e.id === co.id);
                      return (
                        <div key={co.id} onClick={() => setPopup({ type: 'constant', item: co })}
                          style={{ ...elRow, cursor: 'pointer', borderLeft: isEdited ? `3px solid ${C.warn}` : '3px solid transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.surfaceLight}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Lightning size={16} color="#a855f7" weight="duotone" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#a855f7' }}>{co.name}</div>
                            <div style={{ fontSize: 9, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
                          </div>
                          <PencilSimple size={11} color={C.textDim} />
                        </div>
                      );
                    })}
                  </ElementGroup>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#f1f5f9', padding: '8px 20px', borderRadius: 8,
          fontSize: 12, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 100,
        }}>{toast}</div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        /* Player container cursor */
        [data-player-container] { cursor: pointer; }
      `}</style>
    </div>
  );
}

// ── Helper: get direct text content of element (not nested children) ──
function getDirectTextContent(el: Element): string {
  let text = '';
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += (node.textContent || '').trim();
    }
  }
  return text;
}

// ── Helper: get all text content from element and children ──
function getDeepTextContent(el: HTMLElement): string {
  return (el.textContent || '').trim();
}

// ── Element Group (collapsible) ──
function ElementGroup({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', cursor: 'pointer', userSelect: 'none' }}>
        <CaretDown size={9} color={C.textDim} weight="bold" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.1s' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <span style={{ fontSize: 9, color: C.textDim, background: C.surfaceLight, borderRadius: 6, padding: '0 5px' }}>{count}</span>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── Styles ──
const elRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
  transition: 'background 0.1s',
};

const ctrlBtn: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5,
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};

const smallBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '3px 10px', borderRadius: 5, fontSize: 10, fontWeight: 600,
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
  padding: '8px 12px', fontSize: 12, color: C.text, outline: 'none',
};

const kbd: React.CSSProperties = {
  background: C.surfaceLight, border: `1px solid ${C.border}`, borderRadius: 3,
  padding: '0 3px', fontSize: 8, fontFamily: 'monospace',
};
