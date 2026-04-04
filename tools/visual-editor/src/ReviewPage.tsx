import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { AbsoluteFill, Audio, useCurrentFrame, interpolate } from 'remotion';
import {
  Play, Pause, SkipBack, SkipForward, Trash,
  CheckCircle, XCircle, Warning, ArrowClockwise,
  SpeakerHigh, SpeakerSlash, FilmStrip, MapPin, X, Plus,
} from '@phosphor-icons/react';
import {
  fetchReviewProjects, fetchSegments, fetchReview, saveReview,
  regenerateSegment, pollQueue, saveAsExample, fetchTranscript, getAudioUrl,
  SegmentInfo, CompositionInfo, ReviewData, Marker, MarkerType,
} from './reviewApi';

// ---- Theme ----
const C = {
  bg: '#f8f9fb', surface: '#ffffff', border: '#e2e5ea', borderLight: '#eef0f3',
  text: '#1e2330', textMid: '#5a6275', textDim: '#9099ad',
  accent: '#6366f1', accentLight: '#eef2ff',
  good: '#10b981', goodLight: '#ecfdf5',
  bad: '#f43f5e', badLight: '#fff1f2',
  missing: '#f59e0b', missingLight: '#fffbeb',
};

const MC: Record<MarkerType, { color: string; bg: string; label: string }> = {
  good: { color: C.good, bg: C.goodLight, label: 'Good' },
  bad: { color: C.bad, bg: C.badLight, label: 'Bad' },
  missing: { color: C.missing, bg: C.missingLight, label: 'Missing' },
};

let _mid = Date.now();

// ---- Dynamic Composition Builder ----
// This loads Generated_*.tsx files from the video project and creates
// a composition component for @remotion/player to play
function useDynamicComposition(project: string, segments: SegmentInfo[]) {
  const [Comp, setComp] = useState<React.FC | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project || segments.length === 0) { setComp(null); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        // Dynamically import each Generated_*.tsx from the video project
        const modules = await Promise.all(
          segments.map(seg =>
            import(/* @vite-ignore */ `/Users/dario61/Desktop/YT automation/videos/${project}/src/visuals/${seg.file.replace('.tsx', '')}`)
          )
        );

        if (cancelled) return;

        const components = modules.map(m => m.default);

        // Build composition component that mimics Root.tsx behavior
        // Audio URL served by our backend
        const audioUrl = `/api/audio?project=${encodeURIComponent('videos/' + project)}`;

        const VideoComposition: React.FC = () => {
          const frame = useCurrentFrame();
          return (
            <AbsoluteFill style={{ background: '#030305' }}>
              <Audio src={audioUrl} />
              {segments.map((seg, i) => {
                if (frame < seg.startFrame - 1 || frame > seg.endFrame + 1) return null;
                const Component = components[i];
                if (!Component) return null;

                const fadeIn = i === 0 ? 1 : interpolate(
                  frame, [seg.startFrame, seg.startFrame + 15], [0, 1],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                const fadeOut = i === segments.length - 1 ? 1 : interpolate(
                  frame, [seg.endFrame - 15, seg.endFrame], [1, 0],
                  { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                  <div key={i} style={{
                    position: 'absolute', top: 0, left: 0, width: 1920, height: 1080,
                    opacity: fadeIn * fadeOut,
                  }}>
                    <Component startFrame={seg.startFrame} endFrame={seg.endFrame} />
                  </div>
                );
              })}
            </AbsoluteFill>
          );
        };

        setComp(() => VideoComposition);
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load composition:', err);
          setError(err.message);
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [project, segments.map(s => s.file).join(',')]);

  return { Comp, loading, error };
}

export default function ReviewPage() {
  const [projects, setProjects] = useState<string[]>([]);
  const [project, setProject] = useState('');
  const [segments, setSegments] = useState<SegmentInfo[]>([]);
  const [composition, setComposition] = useState<CompositionInfo | null>(null);
  const [review, setReview] = useState<ReviewData | null>(null);
  const [timestamps, setTimestamps] = useState<any[]>([]);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Selection
  const [selStart, setSelStart] = useState<number | null>(null);
  const [selEnd, setSelEnd] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [editingMarker, setEditingMarker] = useState<string | null>(null);
  const [markerComment, setMarkerComment] = useState('');
  const [draggingMarker, setDraggingMarker] = useState<{ id: string; edge: 'start' | 'end' } | null>(null);
  const draggingMarkerRef = useRef<{ id: string; edge: 'start' | 'end' } | null>(null);
  const reviewRef = useRef<ReviewData | null>(null);

  const [queueItems, setQueueItems] = useState<Map<string, string>>(new Map());

  const playerRef = useRef<PlayerRef>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const fps = composition?.fps || 30;
  const totalFrames = composition?.durationInFrames || 1;
  const duration = totalFrames / fps;
  const currentTime = currentFrame / fps;
  const markers = review?.markers || [];

  // Dynamic composition
  const { Comp, loading: compLoading, error: compError } = useDynamicComposition(project, segments);

  // ---- Load projects ----
  useEffect(() => {
    fetchReviewProjects().then(p => { setProjects(p); if (p.length > 0 && !project) setProject(p[0]); });
  }, []);

  // ---- Load project ----
  useEffect(() => {
    if (!project) return;
    Promise.all([
      fetchSegments(project),
      fetchReview(project),
      fetchTranscript(project),
    ]).then(([segData, rev, tx]) => {
      setSegments(segData.segments);
      setComposition(segData.composition);
      setReview(rev);
      setTimestamps(tx.timestamps);
      setCurrentFrame(0);
      setSelStart(null); setSelEnd(null);
      setEditingMarker(null);
    });
  }, [project]);

  // ---- Poll current frame from player ----
  useEffect(() => {
    if (!playerRef.current) return;
    const interval = setInterval(() => {
      const f = playerRef.current?.getCurrentFrame();
      if (f !== undefined) setCurrentFrame(f);
    }, 50); // ~20fps polling
    return () => clearInterval(interval);
  }, [Comp]);

  // ---- Player controls ----
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pause();
    else playerRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const seekToFrame = (f: number) => {
    playerRef.current?.seekTo(Math.max(0, Math.min(f, totalFrames - 1)));
    setCurrentFrame(f);
  };

  const seekToTime = (t: number) => seekToFrame(Math.floor(t * fps));

  // ---- Current segment ----
  const currentSegment = useMemo(() =>
    segments.find((s, i) => currentFrame >= s.startFrame && (!segments[i + 1] || currentFrame < segments[i + 1].startFrame))
  , [segments, currentFrame]);

  // ---- Refs for drag handlers (avoid stale closures) ----
  const durationRef = useRef(duration);
  const fpsRef = useRef(fps);
  const projectRef = useRef(project);
  useEffect(() => { reviewRef.current = review; }, [review]);
  useEffect(() => { draggingMarkerRef.current = draggingMarker; }, [draggingMarker]);
  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { fpsRef.current = fps; }, [fps]);
  useEffect(() => { projectRef.current = project; }, [project]);

  const dragMode = useRef<'none' | 'scrub' | 'select' | 'marker'>('none');

  // Convert mouse X to time using refs (never stale)
  const xToTime = (clientX: number) => {
    const r = timelineRef.current?.getBoundingClientRect();
    if (!r || !durationRef.current) return 0;
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * durationRef.current;
  };

  // Global drag handler — attached once per mousedown
  const startDrag = (mode: 'scrub' | 'select' | 'marker', initX: number, markerInfo?: { id: string; edge: 'start' | 'end' }) => {
    dragMode.current = mode;
    if (markerInfo) {
      draggingMarkerRef.current = markerInfo;
      setDraggingMarker(markerInfo);
    }
    setDragging(true);

    const onMove = (ev: MouseEvent) => {
      const time = xToTime(ev.clientX);
      const frame = Math.floor(time * fpsRef.current);

      if (dragMode.current === 'scrub') {
        playerRef.current?.pause();
        setIsPlaying(false);
        playerRef.current?.seekTo(frame);
        setCurrentFrame(frame);
      } else if (dragMode.current === 'select') {
        setSelEnd(time);
      } else if (dragMode.current === 'marker') {
        const dm = draggingMarkerRef.current;
        console.log('[MARKER-DRAG] dm:', dm?.id, dm?.edge, 'frame:', frame);
        if (dm && reviewRef.current) {
          const key = dm.edge === 'start' ? 'startFrame' : 'endFrame';
          const updated = {
            ...reviewRef.current,
            markers: reviewRef.current.markers.map(m =>
              m.id === dm.id ? { ...m, [key]: frame } : m
            ),
          };
          reviewRef.current = updated;
          setReview(updated);
          setCurrentFrame(frame);
          try { playerRef.current?.seekTo(frame); } catch (e) { console.error('seekTo fail', e); }
        }
      }
    };

    const onUp = () => {
      if (dragMode.current === 'marker' && reviewRef.current) {
        saveReview(projectRef.current, reviewRef.current);
      }
      if (dragMode.current === 'select') {
        // Clear tiny selections
        setSelStart(s => {
          if (s !== null) {
            setSelEnd(e => {
              if (e !== null && Math.abs(e - s) < 0.15) {
                setTimeout(() => { setSelStart(null); setSelEnd(null); }, 0);
              }
              return e;
            });
          }
          return s;
        });
      }
      dragMode.current = 'none';
      setDragging(false);
      setDraggingMarker(null);
      draggingMarkerRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Timeline mousedown
  const onTlDown = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[TIMELINE] mousedown, target:', (e.target as HTMLElement).className, 'shiftKey:', e.shiftKey);
    const t = xToTime(e.clientX);
    if (e.shiftKey) {
      setSelStart(t); setSelEnd(t);
      startDrag('select', e.clientX);
    } else {
      const frame = Math.floor(t * fps);
      playerRef.current?.seekTo(frame);
      setCurrentFrame(frame);
      startDrag('scrub', e.clientX);
    }
  };

  // Marker handle mousedown
  const startMarkerDrag = (markerId: string, edge: 'start' | 'end', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startDrag('marker', e.clientX, { id: markerId, edge });
  };

  const onTlMove = () => {};
  const onTlUp = () => {};

  const selMinT = selStart !== null && selEnd !== null ? Math.min(selStart, selEnd) : null;
  const selMaxT = selStart !== null && selEnd !== null ? Math.max(selStart, selEnd) : null;
  const hasSel = selMinT !== null && selMaxT !== null && (selMaxT - selMinT) > 0.15;

  // ---- Marker CRUD ----
  const persist = (m: Marker[]) => {
    const d: ReviewData = { project, updatedAt: new Date().toISOString(), markers: m };
    setReview(d); saveReview(project, d);
  };

  const addMarker = (type: MarkerType) => {
    if (!hasSel) return;
    const nm: Marker = { id: `m-${++_mid}`, startFrame: Math.floor(selMinT! * fps), endFrame: Math.floor(selMaxT! * fps), type, comment: '' };
    persist([...markers, nm]);
    setSelStart(null); setSelEnd(null);
    setEditingMarker(nm.id); setMarkerComment('');
  };

  const markSegment = (seg: SegmentInfo, type: MarkerType) => {
    const nm: Marker = { id: `m-${++_mid}`, startFrame: seg.startFrame, endFrame: seg.endFrame, type, comment: '' };
    persist([...markers, nm]);
    setEditingMarker(nm.id); setMarkerComment('');
  };

  const updateMarker = (id: string, u: Partial<Marker>) => persist(markers.map(m => m.id === id ? { ...m, ...u } : m));
  const deleteMarker = (id: string) => { persist(markers.filter(m => m.id !== id)); if (editingMarker === id) setEditingMarker(null); };

  const segStatus = (seg: SegmentInfo): MarkerType | null => {
    const ov = markers.filter(m => m.startFrame < seg.endFrame && m.endFrame > seg.startFrame);
    return ov.length > 0 ? ov[ov.length - 1].type : null;
  };

  // Word marker color
  const wordMarkerType = (w: any): MarkerType | null => {
    const wMid = (w.start + w.end) / 2;
    for (let i = markers.length - 1; i >= 0; i--) {
      const m = markers[i];
      if (wMid >= m.startFrame / fps && wMid <= m.endFrame / fps) return m.type;
    }
    return null;
  };

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // These always work, even in inputs
      switch (e.key) {
        case 'Escape':
          if (editingMarker) setEditingMarker(null);
          else { setSelStart(null); setSelEnd(null); }
          (e.target as HTMLElement)?.blur?.();
          return;
      }

      // 1/2/3 work in inputs ONLY if there's a selection (to add marker)
      if ((e.key === '1' || e.key === '2' || e.key === '3') && hasSel) {
        e.preventDefault();
        if (e.key === '1') addMarker('good');
        if (e.key === '2') addMarker('bad');
        if (e.key === '3') addMarker('missing');
        return;
      }

      // Everything else blocked in inputs
      if (inInput) return;

      switch (e.key) {
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': e.preventDefault(); seekToFrame(currentFrame - (e.shiftKey ? fps * 5 : fps)); break;
        case 'ArrowRight': e.preventDefault(); seekToFrame(currentFrame + (e.shiftKey ? fps * 5 : fps)); break;
        case '1': if (hasSel) addMarker('good'); break;
        case '2': if (hasSel) addMarker('bad'); break;
        case '3': if (hasSel) addMarker('missing'); break;
        case 'Delete': case 'Backspace': if (editingMarker) deleteMarker(editingMarker); break;
        case '[': {
          const idx = segments.findIndex(s => currentFrame >= s.startFrame && currentFrame < s.endFrame);
          if (idx > 0) seekToFrame(segments[idx - 1].startFrame);
          break;
        }
        case ']': {
          const idx = segments.findIndex(s => currentFrame >= s.startFrame && currentFrame < s.endFrame);
          if (idx >= 0 && idx < segments.length - 1) seekToFrame(segments[idx + 1].startFrame);
          break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentFrame, currentTime, selStart, selEnd, hasSel, editingMarker, isPlaying]);

  // ---- Queue polling ----
  useEffect(() => {
    if (queueItems.size === 0) return;
    const iv = setInterval(() => {
      queueItems.forEach(async (qId, sId) => {
        try { const r = await pollQueue(project, qId); if (r.status === 'done') { setQueueItems(p => { const n = new Map(p); n.delete(sId); return n; }); fetchSegments(project).then(d => setSegments(d.segments)); } } catch {}
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [queueItems, project]);

  const handleRegen = async (seg: SegmentInfo) => {
    const cmts = markers.filter(m => m.startFrame < seg.endFrame && m.endFrame > seg.startFrame).map(m => m.comment).filter(Boolean).join('; ');
    try { const r = await regenerateSegment({ project, segmentId: seg.id, file: seg.file, comment: cmts || 'Regenerate', startFrame: seg.startFrame, endFrame: seg.endFrame }); setQueueItems(prev => new Map(prev).set(seg.id, r.id)); } catch {}
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const pct = (t: number) => duration > 0 ? (t / duration * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>

      {/* ===== TOP: VIDEO + MARKERS SIDEBAR ===== */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* VIDEO PLAYER */}
        <div style={{ flex: 1, background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Project selector (overlay top-left) */}
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <select value={project} onChange={e => setProject(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid #333', borderRadius: 5, padding: '4px 8px', fontSize: 11, color: '#ccc', outline: 'none', backdropFilter: 'blur(8px)' }}>
              {projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {compLoading ? (
            <div style={{ color: '#666', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <ArrowClockwise size={24} color="#666" weight="bold" style={{ animation: 'spin 1s linear infinite' }} />
              Loading composition...
            </div>
          ) : compError ? (
            <div style={{ color: '#f66', fontSize: 12, textAlign: 'center', padding: 20, maxWidth: 400 }}>
              <XCircle size={24} color="#f66" weight="bold" />
              <div style={{ marginTop: 8 }}>Failed to load: {compError}</div>
              <div style={{ marginTop: 4, fontSize: 10, color: '#999' }}>Make sure Remotion Studio is not running on the same project (port conflict)</div>
            </div>
          ) : Comp && composition ? (
            <Player
              ref={playerRef}
              component={Comp}
              durationInFrames={composition.durationInFrames}
              fps={composition.fps}
              compositionWidth={composition.width}
              compositionHeight={composition.height}
              style={{ width: '100%', height: '100%' }}
              clickToPlay={false}
            />
          ) : (
            <div style={{ color: '#555', fontSize: 13 }}>
              <FilmStrip size={32} color="#444" weight="thin" />
              <div style={{ marginTop: 8 }}>Select a project to review</div>
            </div>
          )}
        </div>

        {/* MARKERS PANEL (right sidebar) */}
        <div style={{ width: 280, borderLeft: `1px solid ${C.border}`, background: C.surface, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} weight="bold" color={C.accent} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>Markers ({markers.length})</span>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
            {markers.length === 0 && (
              <div style={{ padding: '12px', fontSize: 11, color: C.textDim, textAlign: 'center' }}>
                Drag on timeline to select a range, then mark it as Good/Bad/Missing.
              </div>
            )}
            {markers.map(m => {
              const mc = MC[m.type];
              const isEd = editingMarker === m.id;
              return (
                <div key={m.id} style={{ padding: '6px 12px', borderLeft: isEd ? `3px solid ${mc.color}` : '3px solid transparent', background: isEd ? mc.bg : 'transparent', transition: 'all 0.1s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: mc.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: mc.color }}>{mc.label}</span>
                    <span style={{ fontSize: 9, color: C.textDim, fontFamily: 'monospace' }}>{fmt(m.startFrame / fps)}-{fmt(m.endFrame / fps)}</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => seekToFrame(m.startFrame)} style={{ ...tinyBtn, color: C.textDim }} title="Go to">
                      <Play size={9} weight="fill" />
                    </button>
                    <button onClick={() => { setEditingMarker(isEd ? null : m.id); setMarkerComment(m.comment); }} style={{ ...tinyBtn, color: C.textDim }}>
                      <Plus size={9} weight="bold" style={{ transform: isEd ? 'rotate(45deg)' : 'none', transition: 'transform 0.1s' }} />
                    </button>
                    <button onClick={() => deleteMarker(m.id)} style={{ ...tinyBtn, color: C.bad }}>
                      <Trash size={9} />
                    </button>
                  </div>

                  {/* Always show comment if exists */}
                  {!isEd && m.comment && (
                    <div onClick={() => { setEditingMarker(m.id); setMarkerComment(m.comment); }}
                      style={{ fontSize: 10, color: C.textMid, marginTop: 2, marginLeft: 11, cursor: 'pointer' }}>
                      {m.comment}
                    </div>
                  )}

                  {/* Edit mode */}
                  {isEd && (
                    <div style={{ marginTop: 4, marginLeft: 11 }}>
                      <input value={markerComment} onChange={e => setMarkerComment(e.target.value)}
                        onBlur={() => updateMarker(m.id, { comment: markerComment })}
                        onKeyDown={e => { if (e.key === 'Enter') { updateMarker(m.id, { comment: markerComment }); setEditingMarker(null); } if (e.key === 'Escape') setEditingMarker(null); }}
                        placeholder="What's wrong/good here? Enter to save, Esc to close"
                        autoFocus
                        style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: '4px 6px', fontSize: 10, color: C.text, outline: 'none' }} />
                      <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                        {(['good', 'bad', 'missing'] as MarkerType[]).map(t => (
                          <button key={t} onClick={() => updateMarker(m.id, { type: t })}
                            style={{ background: m.type === t ? MC[t].bg : 'transparent', border: `1px solid ${m.type === t ? MC[t].color + '40' : C.borderLight}`, borderRadius: 3, padding: '1px 6px', fontSize: 9, color: MC[t].color, cursor: 'pointer', fontWeight: 500 }}>
                            {MC[t].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Segments list (compact) */}
          <div style={{ borderTop: `1px solid ${C.border}`, maxHeight: '40%', overflow: 'auto' }}>
            <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 600, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Segments
            </div>
            {segments.map((seg, i) => {
              const st = segStatus(seg);
              const isActive = currentSegment?.id === seg.id;
              return (
                <div key={seg.id} onClick={() => seekToFrame(seg.startFrame)} style={{
                  padding: '4px 12px', cursor: 'pointer',
                  background: isActive ? C.accentLight : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ fontSize: 9, color: C.textDim, width: 12 }}>{i + 1}</span>
                  <span style={{ fontSize: 10, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seg.title}</span>
                  {st && <div style={{ width: 6, height: 6, borderRadius: '50%', background: MC[st].color }} />}
                  <div style={{ display: 'flex', gap: 1 }}>
                    {(['good', 'bad', 'missing'] as MarkerType[]).map(t => (
                      <button key={t} onClick={e => { e.stopPropagation(); markSegment(seg, t); }}
                        style={{ ...tinyBtn, color: MC[t].color, width: 16, height: 16 }}>
                        {t === 'good' ? <CheckCircle size={8} weight="bold" /> : t === 'bad' ? <XCircle size={8} weight="bold" /> : <Warning size={8} weight="bold" />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== BOTTOM: CONTROLS + TIMELINE ===== */}
      <div style={{ borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>

        {/* Shortcuts bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 16px', borderBottom: `1px solid ${C.borderLight}`, background: '#f3f4f8' }}>
          {[
            { key: 'Space', label: 'Play/Pause' },
            { key: '\u2190 \u2192', label: 'Seek \u00b11s' },
            { key: 'Shift+\u2190\u2192', label: '\u00b15s' },
            { key: '1', label: 'Good', color: C.good },
            { key: '2', label: 'Bad', color: C.bad },
            { key: '3', label: 'Missing', color: C.missing },
            { key: 'Esc', label: 'Clear' },
            { key: 'Del', label: 'Delete marker' },
          ].map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <kbd style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 3, padding: '0px 4px', fontSize: 9, fontFamily: 'monospace', color: C.text, fontWeight: 600, lineHeight: '16px', boxShadow: '0 1px 0 #d1d5db' }}>{s.key}</kbd>
              <span style={{ fontSize: 9, color: s.color || C.textDim }}>{s.label}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 9, color: C.textDim, fontStyle: 'italic' }}>Shift+drag on timeline = select range</span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 16px' }}>
          <button onClick={() => seekToFrame(0)} style={iBtn}><SkipBack size={13} weight="bold" color={C.textMid} /></button>
          <button onClick={togglePlay} style={{ ...iBtn, background: C.accent, borderColor: C.accent, borderRadius: '50%', width: 30, height: 30 }}>
            {isPlaying ? <Pause size={14} weight="bold" color="#fff" /> : <Play size={14} weight="fill" color="#fff" />}
          </button>
          <button onClick={() => seekToFrame(currentFrame + fps * 5)} style={iBtn}><SkipForward size={13} weight="bold" color={C.textMid} /></button>

          <span style={{ fontSize: 11, color: C.text, fontFamily: 'monospace', fontWeight: 600 }}>{fmt(currentTime)} / {fmt(duration)}</span>
          <span style={{ fontSize: 9, color: C.textDim, fontFamily: 'monospace' }}>f:{currentFrame}</span>

          {/* Show I/O selection status */}
          {selStart !== null && <span style={{ fontSize: 9, color: C.accent, fontFamily: 'monospace', background: C.accentLight, padding: '1px 6px', borderRadius: 3 }}>IN: {fmt(selMinT!)}{selMaxT !== selMinT ? ` OUT: ${fmt(selMaxT!)}` : ' — press O for out'}</span>}

          <div style={{ flex: 1 }} />
          {currentSegment && <span style={{ fontSize: 10, color: C.accent, fontWeight: 500 }}>{currentSegment.title}</span>}
        </div>

        {/* Timeline — wrapper with relative positioning for marker overlay */}
        <div style={{ padding: '0 16px 4px', position: 'relative' }}>
          {/* Background timeline — segments + seek */}
          <div ref={timelineRef} onMouseDown={onTlDown}
            style={{ position: 'relative', height: 28, borderRadius: 4, overflow: 'hidden', cursor: 'crosshair', background: C.borderLight, border: `1px solid ${C.border}`, userSelect: 'none' }}>
            {segments.map((seg, i) => {
              const left = pct(seg.startFrame / fps);
              const w = pct((seg.endFrame - seg.startFrame) / fps);
              const st = segStatus(seg);
              const mc = st ? MC[st] : null;
              return (
                <div key={seg.id} style={{ position: 'absolute', left: `${left}%`, width: `${w}%`, top: 0, bottom: 0, background: mc ? mc.color + '10' : i % 2 === 0 ? '#f3f4f6' : '#eaecef', borderRight: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  {mc && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: mc.color }} />}
                  <span style={{ fontSize: 8, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>{seg.title}</span>
                </div>
              );
            })}
            {/* Selection */}
            {hasSel && <div style={{ position: 'absolute', left: `${pct(selMinT!)}%`, width: `${pct(selMaxT! - selMinT!)}%`, top: 0, bottom: 0, background: C.accent + '20', border: `1px solid ${C.accent}50`, pointerEvents: 'none' }} />}
            {/* Playhead */}
            <div style={{ position: 'absolute', left: `${pct(currentTime)}%`, top: 0, bottom: 0, width: 2, background: C.accent, pointerEvents: 'none' }} />
          </div>

          {/* Marker overlay — SEPARATE div on top of timeline, NOT inside it */}
          <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 28, pointerEvents: 'none' }}>
            {markers.map(m => {
              const mc = MC[m.type];
              const left = pct(m.startFrame / fps);
              const w = Math.max(pct((m.endFrame - m.startFrame) / fps), 0.5);
              const isActive = editingMarker === m.id;
              return (
                <div key={m.id} style={{ position: 'absolute', left: `${left}%`, width: `${w}%`, top: 0, bottom: 0, pointerEvents: 'auto' }}>
                  {/* Marker body — drag to move end + video follows */}
                  <div
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); startMarkerDrag(m.id, 'end', e); }}
                    onDoubleClick={e => { e.stopPropagation(); setEditingMarker(m.id); setMarkerComment(m.comment); }}
                    style={{ position: 'absolute', left: 8, right: 8, top: 0, bottom: 0, background: mc.color + (isActive ? '35' : '20'), borderTop: `3px solid ${mc.color}`, borderBottom: `3px solid ${mc.color}`, cursor: 'grab' }}
                  />
                  {/* Left handle */}
                  <div onMouseDown={e => { e.stopPropagation(); e.preventDefault(); startMarkerDrag(m.id, 'start', e); }}
                    style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 4, height: '50%', borderRadius: 2, background: mc.color }} />
                  </div>
                  {/* Right handle */}
                  <div onMouseDown={e => { e.stopPropagation(); e.preventDefault(); startMarkerDrag(m.id, 'end', e); }}
                    style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, cursor: 'ew-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 4, height: '50%', borderRadius: 2, background: mc.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action row — FIXED HEIGHT, no layout shift */}
        <div style={{ padding: '0 16px', height: 30, display: 'flex', alignItems: 'center', borderTop: `1px solid ${C.borderLight}` }}>
          {hasSel ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: 10, color: C.textMid }}>{fmt(selMinT!)} - {fmt(selMaxT!)}</span>
              {(['good', 'bad', 'missing'] as MarkerType[]).map(t => (
                <button key={t} onClick={() => addMarker(t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 3, background: MC[t].bg, border: `1px solid ${MC[t].color}25`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 500, color: MC[t].color, cursor: 'pointer' }}>
                  {t === 'good' ? <CheckCircle size={10} weight="bold" /> : t === 'bad' ? <XCircle size={10} weight="bold" /> : <Warning size={10} weight="bold" />}
                  {MC[t].label}
                </button>
              ))}
              <button onClick={() => { setSelStart(null); setSelEnd(null); }} style={{ ...tinyBtn, color: C.textDim, marginLeft: 4 }}>
                <X size={10} weight="bold" /> Cancel
              </button>
            </div>
          ) : editingMarker ? (() => {
            const m = markers.find(x => x.id === editingMarker);
            if (!m) return <span style={{ fontSize: 10, color: C.textDim }}>Shift+drag to select, then 1/2/3 to mark</span>;
            const mc = MC[m.type];
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: mc.color, flexShrink: 0 }} />
                <span style={{ fontSize: 9, color: mc.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{mc.label} {fmt(m.startFrame / fps)}-{fmt(m.endFrame / fps)}</span>
                <input value={markerComment} onChange={e => setMarkerComment(e.target.value)}
                  onBlur={() => updateMarker(m.id, { comment: markerComment })}
                  onKeyDown={e => { if (e.key === 'Enter') { updateMarker(m.id, { comment: markerComment }); setEditingMarker(null); } if (e.key === 'Escape') setEditingMarker(null); }}
                  placeholder="Comment... (Enter to save)"
                  autoFocus
                  style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 6px', fontSize: 10, color: C.text, outline: 'none' }} />
                {(['good', 'bad', 'missing'] as MarkerType[]).map(t => (
                  <button key={t} onClick={() => updateMarker(m.id, { type: t })}
                    style={{ background: m.type === t ? mc.bg : 'transparent', border: `1px solid ${m.type === t ? MC[t].color + '30' : C.borderLight}`, borderRadius: 3, padding: '1px 5px', fontSize: 9, color: MC[t].color, cursor: 'pointer' }}>
                    {MC[t].label}
                  </button>
                ))}
                <button onClick={() => setEditingMarker(null)} style={{ ...tinyBtn, color: C.textDim }}>
                  <X size={10} weight="bold" />
                </button>
              </div>
            );
          })() : (
            <span style={{ fontSize: 10, color: C.textDim }}>Shift+drag to select range, then 1/2/3 to mark</span>
          )}
        </div>

        {/* Word transcript strip (compact, clickable, marker-colored) */}
        {timestamps.length > 0 && (
          <div style={{ padding: '0 16px 6px', overflowX: 'auto', whiteSpace: 'nowrap', maxHeight: 36 }}>
            {timestamps.map((w: any, i: number) => {
              const isCur = currentTime >= w.start && currentTime <= w.end + 0.1;
              const mType = wordMarkerType(w);
              const mc = mType ? MC[mType] : null;
              return (
                <span key={i} onClick={() => seekToTime(w.start)} style={{
                  cursor: 'pointer', fontSize: 10,
                  background: isCur ? C.accentLight : mc ? mc.bg : 'transparent',
                  color: isCur ? C.accent : mc ? mc.color : C.textDim,
                  fontWeight: isCur ? 600 : 400,
                  borderBottom: mc ? `2px solid ${mc.color}30` : 'none',
                  borderRadius: 2, padding: '0 1px',
                }}>{w.word} </span>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const iBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid #e2e5ea', borderRadius: 5,
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', transition: 'all 0.1s',
};

const tinyBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer', padding: 1,
  display: 'flex', alignItems: 'center', gap: 2, fontSize: 9,
};
