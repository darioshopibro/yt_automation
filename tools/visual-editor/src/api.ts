import { DynamicConfig } from './types';

const API_BASE = '/api';

export async function loadConfig(project: string): Promise<DynamicConfig> {
  const res = await fetch(`${API_BASE}/config?project=${encodeURIComponent(project)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to load config');
  }
  const data = await res.json();
  return data.config;
}

export async function saveConfig(project: string, config: DynamicConfig): Promise<void> {
  const res = await fetch(`${API_BASE}/config?project=${encodeURIComponent(project)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to save config');
  }
}

export async function searchIcons(query: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/icons?search=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.icons || [];
}

export async function listProjects(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects || [];
}
