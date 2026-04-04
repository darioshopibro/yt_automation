const API_BASE = '/api';

// ---- Types ----

export interface SegmentInfo {
  id: string;
  componentName: string;
  file: string;
  startFrame: number;
  endFrame: number;
  title: string;
  exists: boolean;
}

export interface CompositionInfo {
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export type MarkerType = 'good' | 'bad' | 'missing';

export interface Marker {
  id: string;
  startFrame: number;
  endFrame: number;
  type: MarkerType;
  comment: string;
}

export interface ReviewData {
  project: string;
  updatedAt: string;
  markers: Marker[];
}

export interface VersionInfo {
  name: string;
  path: string;
  created: string;
}

// ---- API Functions ----

export async function fetchReviewProjects(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/review/projects`);
  if (!res.ok) return [];
  return (await res.json()).projects || [];
}

export async function fetchSegments(project: string): Promise<{ segments: SegmentInfo[]; composition: CompositionInfo }> {
  const res = await fetch(`${API_BASE}/review/segments?project=${encodeURIComponent(project)}`);
  if (!res.ok) throw new Error('Failed to fetch segments');
  return res.json();
}

export async function fetchReview(project: string): Promise<ReviewData | null> {
  const res = await fetch(`${API_BASE}/review?project=${encodeURIComponent(project)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.review;
}

export async function saveReview(project: string, review: ReviewData): Promise<void> {
  await fetch(`${API_BASE}/review?project=${encodeURIComponent(project)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
}

export async function regenerateSegment(params: {
  project: string; segmentId: string; file: string; comment: string;
  startFrame?: number; endFrame?: number;
}): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/review/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to queue regeneration');
  return res.json();
}

export async function pollQueue(project: string, id: string): Promise<{ status: string; result?: any }> {
  const res = await fetch(`${API_BASE}/review/queue/${id}?project=${encodeURIComponent(project)}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export async function fetchVersions(project: string, file: string): Promise<VersionInfo[]> {
  const res = await fetch(`${API_BASE}/review/versions?project=${encodeURIComponent(project)}&file=${encodeURIComponent(file)}`);
  if (!res.ok) return [];
  return (await res.json()).versions || [];
}

export async function saveAsExample(project: string, file: string): Promise<void> {
  await fetch(`${API_BASE}/review/save-example`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project, file }) });
}

export async function fetchTranscript(project: string): Promise<{ transcript: string; timestamps: any[] }> {
  const res = await fetch(`${API_BASE}/review/transcript?project=${encodeURIComponent(project)}`);
  if (!res.ok) return { transcript: '', timestamps: [] };
  return res.json();
}

export function getAudioUrl(project: string): string {
  return `${API_BASE}/audio?project=${encodeURIComponent('videos/' + project)}`;
}

export function getVideoUrl(project: string): string {
  return `${API_BASE}/review/video?project=${encodeURIComponent(project)}`;
}

export async function fetchVideoStatus(project: string): Promise<{ exists: boolean; filename?: string; size?: number }> {
  const res = await fetch(`${API_BASE}/review/video-status?project=${encodeURIComponent(project)}`);
  if (!res.ok) return { exists: false };
  return res.json();
}

export async function renderVideo(project: string): Promise<{ status: string; compositionId: string }> {
  const res = await fetch(`${API_BASE}/review/render?project=${encodeURIComponent(project)}`, { method: 'POST' });
  if (!res.ok) throw new Error('Render failed');
  return res.json();
}
