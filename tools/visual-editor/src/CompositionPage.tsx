import React, { useState, useEffect, useRef } from 'react';

const C = {
  bg: '#f8f9fb', surface: '#ffffff', border: '#e2e5ea',
  text: '#1e2330', textMid: '#5a6275', textDim: '#9099ad',
  accent: '#6366f1', accentLight: '#eef2ff',
  good: '#10b981', goodLight: '#ecfdf5',
  bad: '#f43f5e', badLight: '#fff1f2',
  warn: '#f59e0b', warnLight: '#fffbeb',
};

const API = 'http://localhost:3003';
const PIPELINE_API = 'http://localhost:3003';

const VICONS: Record<string, string> = {
  ai_video: '🎬', motion_graphics: '📊', meme: '😂',
  text_callout: '📝', b_roll: '🎥', sfx_only: '🔊',
};

interface Topic {
  id: number; title: string; slug: string; status: string;
  engagement_score: number; freshness_score: number; final_score: number;
  proposed_angle?: string; proposed_hook?: string;
  demand_signal?: number; has_tutorial_demand?: boolean; has_comparison_demand?: boolean;
}

export default function CompositionPage() {
  const [view, setView] = useState<'topics' | 'composition'>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [composition, setComposition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [mixPlaying, setMixPlaying] = useState(false);
  const mixRef = useRef<HTMLAudioElement>(null);

  // Load topics from pipeline DB
  useEffect(() => {
    fetch(`${API}/api/pipeline/topics`)
      .then(r => r.ok ? r.json() : { topics: [] })
      .then(d => setTopics(d.topics || []))
      .catch(() => setTopics([]));
  }, []);

  const handleApprove = async (id: number) => {
    await fetch(`${API}/api/pipeline/topic/${id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    const topic = topics.find(t => t.id === id);
    setTopics(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    setMessage(`✅ Approved: "${topic?.title}" — click 🎯 to process`);
  };

  const handleReject = async (id: number) => {
    await fetch(`${API}/api/pipeline/topic/${id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
    const topic = topics.find(t => t.id === id);
    setTopics(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
    setMessage(`❌ Rejected: "${topic?.title}"`);
  };

  const handleProcess = async (topic: Topic) => {
    setProcessing(true);
    setMessage(`⏳ Processing "${topic.title}"...`);
    try {
      const res = await fetch(`${API}/api/pipeline/process/${topic.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.error) {
        setMessage(`❌ Error: ${data.error}`);
      } else {
        setMessage(`✅ Done! Angle: ${data.angle?.proposed_angle || 'N/A'}`);
        setSelectedTopic(topic);
        // Load composition
        loadComposition(topic.slug);
      }
    } catch (e) {
      setMessage(`❌ Process failed`);
    }
    setProcessing(false);
  };

  const loadComposition = async (slug: string) => {
    for (const prefix of ['workspace/', 'videos/']) {
      try {
        const r = await fetch(`${API}/api/composition?project=${prefix}${slug}`);
        if (r.ok) { setComposition(await r.json()); setView('composition'); return; }
      } catch {}
    }
    setComposition(null);
  };

  const runScan = async () => {
    setLoading(true);
    setMessage('🔥 Scanning all sources...');
    try {
      await fetch(`${API}/api/pipeline/scan`, { method: 'POST' });
      // Reload topics
      const r = await fetch(`${API}/api/pipeline/topics`);
      const d = await r.json();
      setTopics(d.topics || []);
      setMessage('✅ Scan complete');
    } catch {
      setMessage('❌ Scan failed');
    }
    setLoading(false);
  };

  const toggleMix = () => {
    if (!mixRef.current) return;
    if (mixPlaying) mixRef.current.pause();
    else mixRef.current.play();
    setMixPlaying(!mixPlaying);
  };

  // ============ TOPICS VIEW ============
  if (view === 'topics') {
    // Sort by demand_signal first (people actually search for it), then by final_score
    const sortByDemand = (a: Topic, b: Topic) => {
      const ad = a.demand_signal || 0;
      const bd = b.demand_signal || 0;
      if (bd !== ad) return bd - ad;
      return (b.final_score || 0) - (a.final_score || 0);
    };
    const newTopics = topics.filter(t => t.status === 'new').sort(sortByDemand);
    const approvedTopics = topics.filter(t => t.status === 'approved').sort(sortByDemand);
    const processedTopics = topics.filter(t => t.status === 'processed').sort(sortByDemand);

    return (
      <div style={{ padding: 24, background: C.bg, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: C.text }}>Pipeline Dashboard</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={runScan} disabled={loading} style={{
              background: C.accent, color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              opacity: loading ? 0.6 : 1,
            }}>
              {loading ? '⏳ Scanning...' : '🔥 Scan Now'}
            </button>
          </div>
        </div>

        {message && (
          <div style={{ padding: '8px 12px', background: C.accentLight, borderRadius: 6, marginBottom: 16, fontSize: 13, color: C.accent }}>
            {message}
          </div>
        )}

        {/* New Topics */}
        <Section title={`New Topics (${newTopics.length})`}>
          {newTopics.length === 0 && <Empty text="No new topics. Run a scan." />}
          {newTopics.map(t => (
            <TopicRow key={t.id} topic={t}
              onApprove={() => handleApprove(t.id)}
              onReject={() => handleReject(t.id)}
              onProcess={() => handleProcess(t)}
              onViewComp={() => { setSelectedTopic(t); loadComposition(t.slug); }}
            />
          ))}
        </Section>

        {/* Approved */}
        {approvedTopics.length > 0 && (
          <Section title={`Approved (${approvedTopics.length})`}>
            {approvedTopics.map(t => (
              <TopicRow key={t.id} topic={t}
                onProcess={() => handleProcess(t)}
                onViewComp={() => { setSelectedTopic(t); loadComposition(t.slug); }}
              />
            ))}
          </Section>
        )}

        {/* Processed */}
        {processedTopics.length > 0 && (
          <Section title={`Processed (${processedTopics.length})`}>
            {processedTopics.map(t => (
              <TopicRow key={t.id} topic={t}
                onViewComp={() => { setSelectedTopic(t); loadComposition(t.slug); }}
              />
            ))}
          </Section>
        )}
      </div>
    );
  }

  // ============ COMPOSITION VIEW ============
  if (!composition) {
    return (
      <div style={{ padding: 40, color: C.textMid }}>
        <button onClick={() => setView('topics')} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 13 }}>
          ← Back to topics
        </button>
        <p>No composition loaded.</p>
      </div>
    );
  }

  const { meta, beats, audio, memes, aiVideoClips, transitions } = composition;
  const sfxByType: Record<string, number> = {};
  (audio?.sfx || []).forEach((s: any) => { sfxByType[s.type] = (sfxByType[s.type] || 0) + 1; });

  return (
    <div style={{ padding: 24, background: C.bg, minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <button onClick={() => setView('topics')} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: 12, marginBottom: 4 }}>
            ← Back to topics
          </button>
          <h2 style={{ margin: 0, color: C.text }}>{meta?.title || selectedTopic?.title}</h2>
          <p style={{ margin: '4px 0 0', color: C.textMid, fontSize: 13 }}>
            {meta?.totalDurationSec}s · {beats?.length} beats · {(audio?.sfx || []).length} SFX · {memes?.length} memes
          </p>
        </div>
        <button onClick={toggleMix} style={{
          background: C.accent, color: '#fff', border: 'none', borderRadius: 8,
          padding: '8px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}>
          {mixPlaying ? '⏸ Pause' : '▶ Play Mix'}
        </button>
      </div>
      {selectedTopic && (
        <audio ref={mixRef} src={`${API}/api/audio?project=workspace/${selectedTopic.slug}&file=mixed_audio.mp3`} onEnded={() => setMixPlaying(false)} />
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(sfxByType).map(([type, count]) => (
          <Stat key={type} label={type} value={count} />
        ))}
        <Stat label="transitions" value={transitions?.length || 0} />
        <Stat label="ducking" value={audio?.duckingZones?.length || 0} />
        <Stat label="memes" value={memes?.length || 0} />
        <Stat label="ai clips" value={aiVideoClips?.length || 0} />
      </div>

      {/* Beat Timeline */}
      <div style={{ background: C.surface, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, color: C.text }}>Beat Timeline</h3>
        {(beats || []).map((beat: any, i: number) => {
          const beatMeme = (memes || []).find((m: any) => m.beatId === beat.id);
          const beatSfx = (audio?.sfx || []).filter((s: any) => s.frame >= beat.startFrame && s.frame < beat.endFrame);

          return (
            <div key={beat.id}>
              {beat.isSegmentStart && (
                <div style={{ margin: '16px 0 8px', padding: '6px 12px', background: C.accentLight, borderRadius: 6, fontSize: 12, fontWeight: 600, color: C.accent }}>
                  ── {beat.title} ──
                </div>
              )}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 8, marginBottom: 4,
                background: beat.visualType === 'ai_video' ? '#fef3c7' : beat.visualType === 'meme' ? '#fce7f3' : 'transparent',
                border: `1px solid ${beat.visualType === 'ai_video' ? '#fbbf24' : beat.visualType === 'meme' ? '#f472b6' : C.border}`,
              }}>
                <span style={{ fontSize: 18 }}>{VICONS[beat.visualType] || '❓'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: C.text }}>
                    <span style={{ fontWeight: 600 }}>{beat.id}</span>
                    <span style={{ color: C.textDim, marginLeft: 8 }}>{beat.durationSec}s · {beat.intent}</span>
                  </div>
                  {beatMeme && <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>😂 {beatMeme.name}</div>}
                  {beat.aiVideoPrompt && <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>🎬 {beat.aiVideoPrompt?.substring(0, 60)}...</div>}
                  {beatSfx.length > 0 && <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>🔊 {beatSfx.map((s: any) => s.type).join(', ')}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Helper Components ----
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 10px', fontSize: 14, color: '#5a6275', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div style={{ padding: 16, color: '#9099ad', fontSize: 13 }}>{text}</div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '8px 14px', border: '1px solid #e2e5ea', fontSize: 13 }}>
      <div style={{ color: '#9099ad', fontSize: 10, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: '#1e2330', fontWeight: 600, fontSize: 18 }}>{value}</div>
    </div>
  );
}

function TopicRow({ topic, onApprove, onReject, onProcess, onViewComp }: {
  topic: Topic; onApprove?: () => void; onReject?: () => void; onProcess?: () => void; onViewComp?: () => void;
}) {
  const statusIcon: Record<string, string> = { new: '🆕', approved: '✅', rejected: '❌', processed: '🎬', queued: '📋' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: '#fff', borderRadius: 8, border: '1px solid #e2e5ea', marginBottom: 6,
    }}>
      <span style={{ fontSize: 16 }}>{statusIcon[topic.status] || '❓'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e2330' }}>{topic.title}</div>
        <div style={{ fontSize: 11, color: '#9099ad', marginTop: 2 }}>
          Score: {topic.final_score?.toFixed(2)} · Eng: {topic.engagement_score?.toFixed(2)} · Fresh: {topic.freshness_score?.toFixed(2)}
          {topic.demand_signal != null && (
            <span style={{ marginLeft: 8 }}>
              🔍 {topic.demand_signal?.toFixed(2)}
              {topic.has_tutorial_demand && <span style={{ color: '#6366f1', marginLeft: 4 }}>[tutorial]</span>}
              {topic.has_comparison_demand && <span style={{ color: '#6366f1', marginLeft: 4 }}>[vs]</span>}
            </span>
          )}
        </div>
        {topic.proposed_angle && (
          <div style={{ fontSize: 11, color: '#6366f1', marginTop: 2 }}>
            🎯 {topic.proposed_angle.substring(0, 60)}
          </div>
        )}
        {topic.proposed_hook && (
          <div style={{ fontSize: 10, color: '#5a6275', marginTop: 1, fontStyle: 'italic' }}>
            💬 "{topic.proposed_hook.substring(0, 70)}..."
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {onApprove && topic.status === 'new' && (
          <button onClick={onApprove} style={{ ...btn, background: '#ecfdf5', color: '#10b981', border: '1px solid #10b981' }}>✅</button>
        )}
        {onReject && topic.status === 'new' && (
          <button onClick={onReject} style={{ ...btn, background: '#fff1f2', color: '#f43f5e', border: '1px solid #f43f5e' }}>❌</button>
        )}
        {onProcess && topic.status !== 'processed' && (
          <button onClick={onProcess} style={{ ...btn, background: '#eef2ff', color: '#6366f1', border: '1px solid #6366f1' }}>🎯</button>
        )}
        {onViewComp && (
          <button onClick={onViewComp} style={{ ...btn, background: '#f8f9fb', color: '#5a6275', border: '1px solid #e2e5ea' }}>🎬</button>
        )}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, border: 'none',
};
