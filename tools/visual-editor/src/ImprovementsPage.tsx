import React, { useState, useEffect } from 'react';
import {
  Lightning, CheckCircle, XCircle, Warning, ArrowClockwise,
  ChartBar, TrendUp, Target, Eye, Trash, CaretRight,
  FilmStrip, Clock, Star,
} from '@phosphor-icons/react';

const C = {
  bg: '#f8f9fb', surface: '#ffffff', border: '#e2e5ea', borderLight: '#eef0f3',
  text: '#1e2330', textMid: '#5a6275', textDim: '#9099ad',
  accent: '#6366f1', accentLight: '#eef2ff',
  good: '#10b981', goodLight: '#ecfdf5',
  bad: '#f43f5e', badLight: '#fff1f2',
  missing: '#f59e0b', missingLight: '#fffbeb',
};

interface Recommendation {
  id: string;
  title: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  occurrences: number;
  evidence: string[];
  problem: string;
  fix: string;
  targetFile: string;
  impactScore: number;
  status: 'pending' | 'approved' | 'applied' | 'rejected';
}

interface ImprovementsData {
  analyzedAt: string;
  videosAnalyzed: number;
  totalMarkers: { good: number; bad: number; missing: number };
  recommendations: Recommendation[];
}

interface ProjectSummary {
  name: string;
  markers: number;
  counts: { good: number; bad: number; missing: number };
  updatedAt: string | null;
}

const SEVERITY_COLORS: Record<string, { color: string; bg: string }> = {
  high: { color: C.bad, bg: C.badLight },
  medium: { color: C.missing, bg: C.missingLight },
  low: { color: C.textMid, bg: C.borderLight },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  animation: <Lightning size={14} weight="bold" />,
  layout: <Eye size={14} weight="bold" />,
  timing: <Clock size={14} weight="bold" />,
  'visual-type': <FilmStrip size={14} weight="bold" />,
  content: <Target size={14} weight="bold" />,
  style: <Star size={14} weight="bold" />,
};

export default function ImprovementsPage() {
  const [summary, setSummary] = useState<{ projects: ProjectSummary[]; totals: { good: number; bad: number; missing: number }; categories: { name: string; count: number; comments: string[] }[]; allBadMarkers: any[]; improvements: ImprovementsData | null } | null>(null);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/improvements/summary')
      .then(r => r.json())
      .then(d => { setSummary(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateRecStatus = async (recId: string, status: Recommendation['status']) => {
    if (!summary?.improvements) return;
    const updated = {
      ...summary.improvements,
      recommendations: summary.improvements.recommendations.map(r =>
        r.id === recId ? { ...r, status } : r
      ),
    };
    await fetch('/api/improvements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSummary({ ...summary, improvements: updated });
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: C.bg, color: C.textDim }}>Loading...</div>;
  }

  const totals = summary?.totals || { good: 0, bad: 0, missing: 0 };
  const totalMarkers = totals.good + totals.bad + totals.missing;
  const improvements = summary?.improvements;
  const recs = improvements?.recommendations || [];
  const pendingCount = recs.filter(r => r.status === 'pending').length;
  const appliedCount = recs.filter(r => r.status === 'applied').length;

  return (
    <div style={{ height: '100%', overflow: 'auto', background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", padding: '20px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <TrendUp size={20} weight="bold" color={C.accent} />
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>System Improvements</span>
        <div style={{ flex: 1 }} />
        {improvements && (
          <span style={{ fontSize: 10, color: C.textDim }}>Last analysis: {improvements.analyzedAt}</span>
        )}
      </div>

      {/* Stats cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <StatCard label="Reviewed Projects" value={summary?.projects.length || 0} icon={<FilmStrip size={16} weight="bold" />} color={C.accent} />
        <StatCard label="Total Markers" value={totalMarkers} icon={<Target size={16} weight="bold" />} color={C.textMid} />
        <StatCard label="Good" value={totals.good} icon={<CheckCircle size={16} weight="bold" />} color={C.good} />
        <StatCard label="Bad" value={totals.bad} icon={<XCircle size={16} weight="bold" />} color={C.bad} />
        <StatCard label="Missing" value={totals.missing} icon={<Warning size={16} weight="bold" />} color={C.missing} />
        <StatCard label="Pending Fixes" value={pendingCount} icon={<Lightning size={16} weight="bold" />} color={C.accent} />
        <StatCard label="Applied" value={appliedCount} icon={<CheckCircle size={16} weight="bold" />} color={C.good} />
      </div>

      {/* Projects overview */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reviewed Projects</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {(summary?.projects || []).length === 0 ? (
            <div style={{ fontSize: 12, color: C.textDim, padding: '12px 0' }}>
              No reviews yet. Use the Review tab to mark good/bad segments, then run "analyze reviews" in Claude Code.
            </div>
          ) : (
            (summary?.projects || []).map(p => (
              <div key={p.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px', minWidth: 140 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {p.counts.good > 0 && <MiniCount color={C.good} count={p.counts.good} />}
                  {p.counts.bad > 0 && <MiniCount color={C.bad} count={p.counts.bad} />}
                  {p.counts.missing > 0 && <MiniCount color={C.missing} count={p.counts.missing} />}
                </div>
                {p.updatedAt && <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>{new Date(p.updatedAt).toLocaleDateString()}</div>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Problem Categories — ranked by frequency */}
      {(summary?.categories || []).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problem Categories (ranked)</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {(summary?.categories || []).map((cat, i) => {
              const maxCount = (summary?.categories || [])[0]?.count || 1;
              const barWidth = (cat.count / maxCount) * 100;
              const icon = CATEGORY_ICONS[cat.name] || <Target size={14} weight="bold" />;
              return (
                <div key={cat.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textDim, width: 18 }}>#{i + 1}</span>
                    <div style={{ color: C.accent, display: 'flex' }}>{icon}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>{cat.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.bad }}>{cat.count}</span>
                    <span style={{ fontSize: 10, color: C.textDim }}>issues</span>
                  </div>
                  {/* Bar */}
                  <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ width: `${barWidth}%`, height: '100%', borderRadius: 2, background: cat.count >= 5 ? C.bad : cat.count >= 3 ? C.missing : C.textDim, transition: 'width 0.3s' }} />
                  </div>
                  {/* Example comments */}
                  {cat.comments.length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {cat.comments.map((c, j) => (
                        <div key={j} style={{ fontSize: 10, color: C.textDim, paddingLeft: 26, fontStyle: 'italic' }}>"{c}"</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendations</span>
          {recs.length > 0 && (
            <span style={{ fontSize: 10, color: C.textDim }}>({recs.length} found)</span>
          )}
        </div>

        {recs.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '24px', textAlign: 'center' }}>
            <ChartBar size={32} weight="thin" color={C.textDim} />
            <div style={{ fontSize: 13, color: C.textMid, marginTop: 8 }}>No recommendations yet</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>
              1. Review videos in the Review tab (add good/bad markers)<br />
              2. Run <code style={{ background: C.borderLight, padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>analyze reviews</code> in Claude Code<br />
              3. Recommendations will appear here
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recs.sort((a, b) => b.impactScore - a.impactScore).map(rec => {
              const sev = SEVERITY_COLORS[rec.severity] || SEVERITY_COLORS.low;
              const isExpanded = expandedRec === rec.id;
              const catIcon = CATEGORY_ICONS[rec.category] || <Target size={14} weight="bold" />;

              return (
                <div key={rec.id} style={{ background: C.surface, border: `1px solid ${rec.status === 'applied' ? C.good + '40' : C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  {/* Header row */}
                  <div
                    onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', cursor: 'pointer' }}
                  >
                    <CaretRight size={12} weight="bold" color={C.textDim} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: sev.color }}>{catIcon}</div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>{rec.title}</span>
                    <span style={{ fontSize: 9, background: sev.bg, color: sev.color, padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>{rec.severity.toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: C.textDim }}>{rec.occurrences}x</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{ width: 4, height: 10, borderRadius: 1, background: i < rec.impactScore ? C.accent : C.borderLight }} />
                      ))}
                    </div>
                    {rec.status === 'applied' && <span style={{ fontSize: 9, color: C.good, fontWeight: 600 }}>APPLIED</span>}
                    {rec.status === 'rejected' && <span style={{ fontSize: 9, color: C.textDim, fontWeight: 600 }}>REJECTED</span>}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${C.borderLight}` }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                        <div>
                          <Label>Problem</Label>
                          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{rec.problem}</div>
                        </div>
                        <div>
                          <Label>Suggested Fix</Label>
                          <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{rec.fix}</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <Label>Target</Label>
                        <code style={{ fontSize: 10, background: C.borderLight, padding: '2px 6px', borderRadius: 3, color: C.accent }}>{rec.targetFile}</code>
                      </div>

                      {rec.evidence.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Label>Evidence ({rec.evidence.length})</Label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {rec.evidence.slice(0, 5).map((ev, i) => (
                              <div key={i} style={{ fontSize: 10, color: C.textDim, fontStyle: 'italic' }}>"{ev}"</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {rec.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                          <button onClick={() => updateRecStatus(rec.id, 'approved')} style={{ ...btn, background: C.accentLight, color: C.accent, border: `1px solid ${C.accent}30` }}>
                            <CheckCircle size={12} weight="bold" /> Approve
                          </button>
                          <button onClick={() => updateRecStatus(rec.id, 'rejected')} style={{ ...btn, background: C.borderLight, color: C.textDim, border: `1px solid ${C.border}` }}>
                            <XCircle size={12} weight="bold" /> Reject
                          </button>
                        </div>
                      )}
                      {rec.status === 'approved' && (
                        <div style={{ marginTop: 8, fontSize: 10, color: C.accent, fontWeight: 500 }}>
                          Approved — run "analyze reviews" in Claude Code to apply this fix.
                        </div>
                      )}
                      {rec.status === 'applied' && (
                        <div style={{ marginTop: 8, fontSize: 10, color: C.good, fontWeight: 500 }}>
                          Applied to {rec.targetFile}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Sub-components ----

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', flex: 1, minWidth: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color, marginBottom: 4 }}>
        {icon}
        <span style={{ fontSize: 9, fontWeight: 600, color: C.textDim, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{value}</div>
    </div>
  );
}

function MiniCount({ color, count }: { color: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 9, color, fontWeight: 600 }}>{count}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 600, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{children}</div>;
}

const btn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 5,
  fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.1s',
};
