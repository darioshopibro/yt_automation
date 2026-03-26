import { DynamicConfig, BrandConfig } from './types';

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

// === Brand API ===

export async function listBrands(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/brands`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.brands || [];
}

export async function loadBrand(name: string): Promise<BrandConfig> {
  const res = await fetch(`${API_BASE}/brands/${encodeURIComponent(name)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to load brand');
  }
  const data = await res.json();
  return data.brand;
}

export async function saveBrand(name: string, brand: BrandConfig): Promise<void> {
  const res = await fetch(`${API_BASE}/brands/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brand),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to save brand');
  }
}

export async function uploadBrandFile(name: string, file: File, type: 'logo' | 'intro' | 'outro'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await fetch(`${API_BASE}/brands/${encodeURIComponent(name)}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Failed to upload file');
  }
  const data = await res.json();
  return data.path;
}

export function getBrandLogoUrl(name: string): string {
  return `${API_BASE}/brands/${encodeURIComponent(name)}/logo`;
}
