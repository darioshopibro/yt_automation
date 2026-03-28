import { useState, useEffect } from 'react';

const API = 'http://localhost:3003/api/research';

interface Topic {
  id: number;
  title: string;
  status: string;
  engagement_score: number;
  freshness_score: number;
  competition_score: number;
  final_score: number;
  multi_source_count: number;
  proposed_angle: string | null;
  proposed_hook: string | null;
  angle_type: string | null;
  created_at: string;
  sources?: any[];
}

interface Improvement {
  id: number;
  title: string;
  description: string;
  category: string;
  source_url: string;
  status: string;
  created_at: string;
}

interface Stats {
  total_topics: { cnt: number };
  by_status: { status: string; cnt: number }[];
  total_improvements: { cnt: number };
  improvements_by_status: { status: string; cnt: number }[];
  total_decisions: { cnt: number };
  last_scan: any;
  learning_threshold: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  update: '⬆️',
  alternative: '🔄',
  new_capability: '🆕',
  workflow: '⚡',
  competitive_intel: '🔍',
  gap_filler: '🎯',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  approved: '#22c55e',
  rejected: '#ef4444',
  queued: '#f59e0b',
  processed: '#8b5cf6',
  suggested: '#3b82f6',
  accepted: '#22c55e',
  implemented: '#8b5cf6',
};

export default function ResearchDashboard() {
  const [tab, setTab] = useState<'candidates' | 'improvements' | 'scripts' | 'history'>('candidates');
  const [candidates, setCandidates] = useState<Topic[]>([]);
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [history, setHistory] = useState<Topic[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadData(); }, [tab]);

  async function loadData() {
    setLoading(true);
    try {
      const statsRes = await fetch(`${API}/stats`);
      setStats(await statsRes.json());

      if (tab === 'candidates') {
        const res = await fetch(`${API}/candidates?limit=15`);
        setCandidates(await res.json());
      } else if (tab === 'improvements') {
        const res = await fetch(`${API}/improvements?status=suggested`);
        setImprovements(await res.json());
      } else if (tab === 'scripts') {
        const res = await fetch(`${API}/scripts`);
        setScripts(await res.json());
      } else if (tab === 'history') {
        const res = await fetch(`${API}/all?limit=50`);
        setHistory(await res.json());
      }
    } catch (e) {
      console.error('Failed to load research data:', e);
    }
    setLoading(false);
  }

  async function updateTopicStatus(id: number, status: string) {
    await fetch(`${API}/topic/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  async function updateImprovementStatus(id: number, status: string) {
    await fetch(`${API}/improvement/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  }

  const decisions = stats?.total_decisions?.cnt || 0;
  const threshold = stats?.learning_threshold || 20;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', color: '#e2e8f0' }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {stats?.by_status?.map(s => (
          <div key={s.status} style={{
            padding: '8px 16px', borderRadius: 8,
            background: `${STATUS_COLORS[s.status] || '#475569'}20`,
            border: `1px solid ${STATUS_COLORS[s.status] || '#475569'}40`,
          }}>
            <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase' }}>{s.status}</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: STATUS_COLORS[s.status] || '#e2e8f0' }}>{s.cnt}</div>
          </div>
        ))}
        <div style={{
          padding: '8px 16px', borderRadius: 8,
          background: decisions >= threshold ? '#22c55e20' : '#f59e0b20',
          border: `1px solid ${decisions >= threshold ? '#22c55e' : '#f59e0b'}40`,
        }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>LEARNING</span>
          <div style={{ fontSize: 14, fontWeight: 600, color: decisions >= threshold ? '#22c55e' : '#f59e0b' }}>
            {decisions >= threshold ? `Active (${decisions})` : `${decisions}/${threshold} decisions`}
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['candidates', 'improvements', 'scripts', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
            background: tab === t ? '#818cf830' : '#1e293b',
            border: `1px solid ${tab === t ? '#818cf8' : '#334155'}`,
            color: tab === t ? '#818cf8' : '#94a3b8',
            fontWeight: tab === t ? 700 : 400,
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {loading && <div style={{ color: '#94a3b8', padding: 20 }}>Loading...</div>}

      {/* Candidates */}
      {tab === 'candidates' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {candidates.map((c, i) => (
            <div key={c.id} style={{
              padding: 16, borderRadius: 12,
              background: '#1e293b', border: '1px solid #334155',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    {i + 1}. {c.title}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#94a3b8' }}>
                    <span>📈 Eng: {c.engagement_score?.toFixed(2)}</span>
                    <span>⏰ Fresh: {c.freshness_score?.toFixed(2)}</span>
                    <span>🔗 {c.multi_source_count} source types</span>
                    <span style={{ fontWeight: 700, color: '#818cf8' }}>
                      Score: {c.final_score?.toFixed(3)}
                    </span>
                  </div>
                  {c.proposed_angle && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#a78bfa' }}>
                      🎯 {c.proposed_angle}
                    </div>
                  )}
                  {c.proposed_hook && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                      "{c.proposed_hook}"
                    </div>
                  )}
                  {c.sources && c.sources.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {c.sources.map((s: any, j: number) => (
                        <span key={j} style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 4,
                          background: '#334155', color: '#94a3b8',
                        }}>
                          {s.source_type}/{s.source_detail}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => updateTopicStatus(c.id, 'approved')} style={btnStyle('#22c55e')}>✅</button>
                  <button onClick={() => updateTopicStatus(c.id, 'rejected')} style={btnStyle('#ef4444')}>❌</button>
                  <button onClick={() => updateTopicStatus(c.id, 'queued')} style={btnStyle('#f59e0b')}>⏸️</button>
                </div>
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <div style={{ color: '#94a3b8', padding: 40, textAlign: 'center' }}>
              No candidates. Run the pipeline first.
            </div>
          )}
        </div>
      )}

      {/* Improvements */}
      {tab === 'improvements' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {improvements.map(imp => (
            <div key={imp.id} style={{
              padding: 16, borderRadius: 12,
              background: '#1e293b', border: '1px solid #334155',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                    {CATEGORY_ICONS[imp.category] || '💡'} {imp.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{imp.description}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4,
                      background: '#334155', color: '#94a3b8', textTransform: 'uppercase',
                    }}>{imp.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => updateImprovementStatus(imp.id, 'accepted')} style={btnStyle('#22c55e')}>Accept</button>
                  <button onClick={() => updateImprovementStatus(imp.id, 'rejected')} style={btnStyle('#ef4444')}>Reject</button>
                  <button onClick={() => updateImprovementStatus(imp.id, 'implemented')} style={btnStyle('#8b5cf6')}>Done</button>
                </div>
              </div>
            </div>
          ))}
          {improvements.length === 0 && (
            <div style={{ color: '#94a3b8', padding: 40, textAlign: 'center' }}>
              No pending improvements.
            </div>
          )}
        </div>
      )}

      {/* Scripts */}
      {tab === 'scripts' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {scripts.map(s => (
            <div key={s.id} style={{
              padding: 16, borderRadius: 12,
              background: '#1e293b', border: '1px solid #334155',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{s.topic_title}</div>
              {s.proposed_angle && (
                <div style={{ fontSize: 13, color: '#a78bfa', marginBottom: 8 }}>🎯 {s.proposed_angle}</div>
              )}
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                <span>📝 {s.script_text?.split(' ').length || 0} words</span>
                <span>🔍 Similarity: {s.similarity_score ?? '?'}%</span>
                <span style={{ color: s.status === 'approved' ? '#22c55e' : '#f59e0b' }}>
                  {s.status?.toUpperCase()}
                </span>
              </div>
              <details>
                <summary style={{ cursor: 'pointer', color: '#818cf8', fontSize: 13 }}>Show script</summary>
                <pre style={{
                  marginTop: 8, padding: 12, borderRadius: 8,
                  background: '#0f172a', fontSize: 12, whiteSpace: 'pre-wrap',
                  lineHeight: 1.6, color: '#cbd5e1', maxHeight: 300, overflow: 'auto',
                }}>{s.script_text}</pre>
              </details>
            </div>
          ))}
          {scripts.length === 0 && (
            <div style={{ color: '#94a3b8', padding: 40, textAlign: 'center' }}>
              No scripts generated yet. Approve a topic and run /process.
            </div>
          )}
        </div>
      )}

      {/* History */}
      {tab === 'history' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map(t => (
            <div key={t.id} style={{
              padding: '10px 16px', borderRadius: 8,
              background: '#1e293b', border: '1px solid #334155',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: 14 }}>{t.title}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                  Score: {t.final_score?.toFixed(3)}
                </span>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 10px', borderRadius: 4,
                background: `${STATUS_COLORS[t.status] || '#475569'}30`,
                color: STATUS_COLORS[t.status] || '#94a3b8',
                fontWeight: 600, textTransform: 'uppercase',
              }}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
    background: `${color}20`, border: `1px solid ${color}60`,
    color, fontSize: 13, fontWeight: 600,
  };
}
