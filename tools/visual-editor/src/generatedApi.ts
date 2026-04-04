const API = '/api/generated';

export interface ColorEntry { id: string; key: string; value: string; objectName: string; }
export interface IconEntry { id: string; name: string; line: number; context: string; }
export interface TextEntry { id: string; text: string; line: number; context: string; }
export interface SceneEntry { id: string; name: string; comment: string; startLine: number; endLine: number; }
export interface ConstantEntry { id: string; name: string; value: string; line: number; }
export interface ParsedComponent { file: string; colors: ColorEntry[]; icons: IconEntry[]; texts: TextEntry[]; scenes: SceneEntry[]; constants: ConstantEntry[]; }
export interface EditOperation { type: 'color' | 'icon' | 'text' | 'constant'; id: string; oldValue: string; newValue: string; }

async function get<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export async function fetchProjects(): Promise<string[]> {
  const d = await get<{ projects: string[] }>(`${API}/projects`);
  return d.projects;
}

export async function fetchFiles(project: string): Promise<string[]> {
  const d = await get<{ files: string[] }>(`${API}/${project}/files`);
  return d.files;
}

export async function parseFile(project: string, file: string): Promise<{ parsed: ParsedComponent; source: string }> {
  return get(`${API}/${project}/${file}/parse`);
}

export async function applyEdits(project: string, file: string, edits: EditOperation[], parsed: ParsedComponent): Promise<{ parsed: ParsedComponent; source: string }> {
  const r = await fetch(`${API}/${project}/${file}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edits, parsed }),
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export async function searchIcons(query: string): Promise<string[]> {
  const d = await get<{ icons: string[] }>(`/api/icons?search=${encodeURIComponent(query)}`);
  return d.icons;
}
