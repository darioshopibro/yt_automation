/**
 * TSX Parser for Generated_*.tsx components
 * Extracts editable elements: colors, icons, text labels, scenes, constants
 * and can apply changes back to the source file.
 */

export interface ColorEntry {
  id: string;
  key: string;       // e.g. "primary", "blue"
  value: string;     // e.g. "#3b82f6"
  objectName: string; // e.g. "c", "colors", "BRAND"
}

export interface IconEntry {
  id: string;
  name: string;      // e.g. "AppWindow"
  line: number;
  context: string;   // surrounding code snippet for display
}

export interface TextEntry {
  id: string;
  text: string;
  line: number;
  context: string;
}

export interface SceneEntry {
  id: string;
  name: string;      // e.g. "Scene1_AppToService"
  comment: string;   // e.g. "App pulls data from service"
  startLine: number;
  endLine: number;
}

export interface ConstantEntry {
  id: string;
  name: string;
  value: string;
  line: number;
}

export interface ParsedComponent {
  file: string;
  colors: ColorEntry[];
  icons: IconEntry[];
  texts: TextEntry[];
  scenes: SceneEntry[];
  constants: ConstantEntry[];
}

let _id = 0;
const nextId = (prefix: string) => `${prefix}_${++_id}`;

export function parseTsx(source: string, fileName: string): ParsedComponent {
  _id = 0;
  const lines = source.split('\n');

  const colors = extractColors(source);
  const icons = extractIcons(lines);
  const texts = extractTexts(lines);
  const scenes = extractScenes(lines);
  const constants = extractConstants(lines);

  return { file: fileName, colors, icons, texts, scenes, constants };
}

// ── Colors ──
// Matches: const c = { primary: "#3b82f6", ... }
// Also: const colors = { ... }, const BRAND = { ... }
function extractColors(source: string): ColorEntry[] {
  const results: ColorEntry[] = [];

  // Find color object declarations
  const objPattern = /const\s+(c|colors|BRAND|brand)\s*=\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = objPattern.exec(source)) !== null) {
    const objectName = match[1];
    const body = match[2];

    // Extract key: "value" pairs
    const entryPattern = /(\w+)\s*:\s*["']([^"']+)["']/g;
    let entry: RegExpExecArray | null;

    while ((entry = entryPattern.exec(body)) !== null) {
      if (entry[2].startsWith('#')) {
        results.push({
          id: nextId('color'),
          key: entry[1],
          value: entry[2],
          objectName,
        });
      }
    }
  }

  return results;
}

// ── Icons ──
// Matches: getIcon("AppWindow") AND direct imports: import { Warning, Key } from '@phosphor-icons/react'
function extractIcons(lines: string[]): IconEntry[] {
  const results: IconEntry[] = [];
  const seen = new Set<string>();

  // Pattern 1: getIcon("AppWindow")
  const getIconPattern = /getIcon\(["'](\w+)["']\)/g;
  for (let i = 0; i < lines.length; i++) {
    let match: RegExpExecArray | null;
    getIconPattern.lastIndex = 0;
    while ((match = getIconPattern.exec(lines[i])) !== null) {
      if (!seen.has(match[1])) {
        results.push({ id: nextId('icon'), name: match[1], line: i + 1, context: lines[i].trim() });
        seen.add(match[1]);
      }
    }
  }

  // Pattern 2: Direct imports from @phosphor-icons/react
  // import { Warning, ShieldSlash, Eye, Key } from "@phosphor-icons/react";
  const source = lines.join('\n');
  const importPattern = /import\s*\{([^}]+)\}\s*from\s*["']@phosphor-icons\/react["']/g;
  let importMatch: RegExpExecArray | null;
  while ((importMatch = importPattern.exec(source)) !== null) {
    const names = importMatch[1].split(',').map(n => n.trim()).filter(Boolean);
    // Find which line this import is on
    const beforeImport = source.substring(0, importMatch.index);
    const lineNum = beforeImport.split('\n').length;
    for (const name of names) {
      if (!seen.has(name) && /^[A-Z]/.test(name)) {
        // Skip Remotion/React imports — only Phosphor icon names (PascalCase, not 'React', 'Cube' already added)
        results.push({ id: nextId('icon'), name, line: lineNum, context: `import { ${name} } from "@phosphor-icons/react"` });
        seen.add(name);
      }
    }
  }

  return results;
}

// ── Text Labels ──
// Matches text in JSX, arrays, objects — anything that renders as visible text
function extractTexts(lines: string[]): TextEntry[] {
  const results: TextEntry[] = [];
  const seenTexts = new Set<string>();

  const patterns = [
    // JSX text: >Your App</span>
    />\s*([A-Z][A-Za-z0-9 .,'&!?:+\-–—]{2,60})\s*<\//,
    // JSX string: {"Your App"}
    /\{["']([A-Za-z][A-Za-z0-9 .,'&!?:+\-–—]{2,60})["']\}/,
    // Object/array label: label: "Some Text" or value: "Some Text"
    /(?:label|value|title|text|heading|name)\s*:\s*["']([A-Za-z][A-Za-z0-9 .,'&!?:+\-–—/]{2,60})["']/,
    // Template literal text in JSX (backtick strings that look like labels)
    /`([A-Z][A-Za-z0-9 .,'&!?:+\-–—]{2,40})`/,
    // Standalone quoted strings that look like UI text (in arrays etc)
    /["']([A-Z][a-z][A-Za-z0-9 .,'&!?:+\-–—]{2,50})["']/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip imports, animation code, comments
    if (line.match(/^\s*(import|const\s+\w+\s*=\s*(interpolate|spring|useCurrentFrame|useMemo|fadeIn|fadeOut|slideUp|appear))/)) continue;
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) continue;
    // Skip lines that are purely style/animation
    if (line.match(/^\s*(opacity|transform|easing|extrapolate)/)) continue;

    for (const pattern of patterns) {
      const match = pattern.exec(line);
      if (match) {
        const text = match[1].trim();
        // Skip short, numeric, hex colors, common code tokens
        if (text.length < 3) continue;
        if (/^\d+$/.test(text)) continue;
        if (/^#[0-9a-f]/i.test(text)) continue;
        if (/^(clamp|ease|cubic|linear|none|auto|flex|grid|absolute|relative|center|row|column)$/i.test(text)) continue;
        // Skip font family strings
        if (/sans-serif|monospace|system-ui|Fira Code|SF Mono/i.test(text)) continue;
        // Skip if it's an icon name (PascalCase single word matching an icon import)
        if (/^[A-Z][a-z]+[A-Z]/.test(text) && text.split(' ').length === 1) continue;
        if (seenTexts.has(text)) continue;

        seenTexts.add(text);
        results.push({ id: nextId('text'), text, line: i + 1, context: line.trim() });
      }
    }
  }

  return results;
}

// ── Scenes ──
// Matches: const Scene1_AppToService: React.FC<...> = ...
// And scene comments like: {/* ════════ SCENE 1: description ════════ */}
function extractScenes(lines: string[]): SceneEntry[] {
  const results: SceneEntry[] = [];
  const scenePattern = /const\s+(Scene\d+_\w+)\s*:/;
  const commentPattern = /SCENE\s*\d+\s*:\s*(.+?)\s*[═=]*\s*\*\//;

  // First pass: find scene comments for descriptions
  const descriptions = new Map<number, string>();
  for (let i = 0; i < lines.length; i++) {
    const cm = commentPattern.exec(lines[i]);
    if (cm) {
      // Look for the next scene declaration within 20 lines
      for (let j = i; j < Math.min(i + 20, lines.length); j++) {
        const sm = scenePattern.exec(lines[j]);
        if (sm) {
          descriptions.set(j, cm[1].trim().replace(/["']/g, ''));
          break;
        }
      }
    }
  }

  // Second pass: find scene function declarations
  for (let i = 0; i < lines.length; i++) {
    const match = scenePattern.exec(lines[i]);
    if (match) {
      const name = match[1];
      // Find the end of this scene (next scene declaration or end of file)
      let endLine = lines.length;
      for (let j = i + 1; j < lines.length; j++) {
        if (scenePattern.test(lines[j]) || /^const\s+Generated_/.test(lines[j].trim())) {
          endLine = j;
          break;
        }
      }
      results.push({
        id: nextId('scene'),
        name,
        comment: descriptions.get(i) || name.replace(/Scene\d+_/, '').replace(/([A-Z])/g, ' $1').trim(),
        startLine: i + 1,
        endLine,
      });
    }
  }

  return results;
}

// ── Constants ──
// Matches: const API_KEY_STRING = "sk-a3F9x...Qm7zR"
// Skip animation/frame constants
function extractConstants(lines: string[]): ConstantEntry[] {
  const results: ConstantEntry[] = [];
  const pattern = /const\s+([A-Z][A-Z_0-9]+)\s*=\s*["']([^"']+)["']/;

  for (let i = 0; i < lines.length; i++) {
    const match = pattern.exec(lines[i]);
    if (match) {
      const name = match[1];
      // Skip scene/frame constants
      if (name.match(/^(SCENE|FRAME|FPS|CLAMP)/)) continue;
      results.push({
        id: nextId('const'),
        name,
        value: match[2],
        line: i + 1,
      });
    }
  }

  return results;
}

// ── Apply Edits ──
export interface EditOperation {
  type: 'color' | 'icon' | 'text' | 'constant';
  id: string;
  oldValue: string;
  newValue: string;
}

export function applyEdits(source: string, parsed: ParsedComponent, edits: EditOperation[]): string {
  let result = source;

  for (const edit of edits) {
    switch (edit.type) {
      case 'color': {
        const colorEntry = parsed.colors.find(c => c.id === edit.id);
        if (colorEntry) {
          // Replace in color object: key: "oldValue" → key: "newValue"
          const pattern = new RegExp(
            `(${colorEntry.key}\\s*:\\s*["'])${escapeRegex(edit.oldValue)}(["'])`,
          );
          result = result.replace(pattern, `$1${edit.newValue}$2`);
        }
        break;
      }
      case 'icon': {
        const iconEntry = parsed.icons.find(i => i.id === edit.id);
        if (iconEntry) {
          // Replace getIcon("OldName") → getIcon("NewName")
          const pattern = new RegExp(
            `getIcon\\(["']${escapeRegex(edit.oldValue)}["']\\)`,
            'g',
          );
          result = result.replace(pattern, `getIcon("${edit.newValue}")`);
        }
        break;
      }
      case 'text': {
        const textEntry = parsed.texts.find(t => t.id === edit.id);
        if (textEntry) {
          // Replace the exact text occurrence
          // Be careful to only replace in the right line context
          const lines = result.split('\n');
          const lineIdx = textEntry.line - 1;
          if (lineIdx < lines.length) {
            lines[lineIdx] = lines[lineIdx].replace(edit.oldValue, edit.newValue);
            result = lines.join('\n');
          }
        }
        break;
      }
      case 'constant': {
        const constEntry = parsed.constants.find(c => c.id === edit.id);
        if (constEntry) {
          const pattern = new RegExp(
            `(const\\s+${escapeRegex(constEntry.name)}\\s*=\\s*["'])${escapeRegex(edit.oldValue)}(["'])`,
          );
          result = result.replace(pattern, `$1${edit.newValue}$2`);
        }
        break;
      }
    }
  }

  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
