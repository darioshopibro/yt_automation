import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;
const BASE_PATH = '/Users/dario61/Desktop/YT automation';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Resolve config path from project param
function getConfigPath(project: string): string {
  const sanitized = project.replace(/\.\./g, '');
  return path.join(BASE_PATH, sanitized, 'src', 'dynamic-config.json');
}

// GET /api/config?project=videos/blue-green-deploy
app.get('/api/config', (req, res) => {
  const project = req.query.project as string;
  if (!project) {
    return res.status(400).json({ error: 'Missing project parameter' });
  }

  const configPath = getConfigPath(project);

  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ error: `Config not found: ${configPath}` });
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    res.json({ config, path: configPath });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to read config: ${err.message}` });
  }
});

// POST /api/config?project=videos/blue-green-deploy
app.post('/api/config', (req, res) => {
  const project = req.query.project as string;
  if (!project) {
    return res.status(400).json({ error: 'Missing project parameter' });
  }

  const configPath = getConfigPath(project);
  const config = req.body;

  if (!config) {
    return res.status(400).json({ error: 'Missing config body' });
  }

  try {
    // Auto-backup before save
    if (fs.existsSync(configPath)) {
      const dir = path.dirname(configPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `config.backup.${timestamp}.json`;
      const backupPath = path.join(dir, backupName);
      fs.copyFileSync(configPath, backupPath);
      console.log(`Backup created: ${backupPath}`);
    }

    // Write new config
    const json = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, json + '\n', 'utf-8');
    console.log(`Config saved: ${configPath}`);

    res.json({ success: true, path: configPath });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to write config: ${err.message}` });
  }
});

// GET /api/icons?search=deploy — returns matching Phosphor icon names
// We read from a bundled list to avoid importing all icons server-side
app.get('/api/icons', (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase();

  // Load icon list from file
  const iconListPath = path.join(__dirname, 'phosphor-icons.json');

  if (!fs.existsSync(iconListPath)) {
    return res.status(500).json({ error: 'Icon list not found. Run generate-icon-list first.' });
  }

  try {
    const icons: string[] = JSON.parse(fs.readFileSync(iconListPath, 'utf-8'));
    const filtered = search
      ? icons.filter((name) => name.toLowerCase().includes(search))
      : icons.slice(0, 100);
    res.json({ icons: filtered.slice(0, 100) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects — list available projects that have dynamic-config.json
app.get('/api/projects', (_req, res) => {
  const projects: string[] = [];

  function scan(dir: string, prefix: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        if (entry.isDirectory()) {
          const configCheck = path.join(dir, entry.name, 'src', 'dynamic-config.json');
          if (fs.existsSync(configCheck)) {
            projects.push(prefix ? `${prefix}/${entry.name}` : entry.name);
          }
          // Recurse one level for dirs like videos/
          if (!prefix) {
            scan(path.join(dir, entry.name), entry.name);
          }
        }
      }
    } catch {
      // ignore permission errors
    }
  }

  scan(BASE_PATH, '');
  res.json({ projects });
});

// GET /api/timestamps?project=videos/blue-green-deploy — load voiceover timestamps
app.get('/api/timestamps', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');
  const tsPath = path.join(BASE_PATH, sanitized, 'src', 'voiceover-timestamps.json');
  if (!fs.existsSync(tsPath)) return res.status(404).json({ error: 'No timestamps file' });
  try {
    res.json(JSON.parse(fs.readFileSync(tsPath, 'utf-8')));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audio?project=videos/blue-green-deploy — serve voiceover mp3
app.get('/api/audio', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');
  const audioPath = path.join(BASE_PATH, sanitized, 'public', 'voiceover.mp3');
  if (!fs.existsSync(audioPath)) return res.status(404).json({ error: 'No voiceover.mp3' });
  res.sendFile(audioPath);
});

// ========== Brand Endpoints ==========

import multer from 'multer';

const BRANDS_PATH = path.join(BASE_PATH, 'brands');

// GET /api/brands — list all brands
app.get('/api/brands', (_req, res) => {
  if (!fs.existsSync(BRANDS_PATH)) {
    return res.json({ brands: [] });
  }
  try {
    const entries = fs.readdirSync(BRANDS_PATH, { withFileTypes: true });
    const brands = entries
      .filter(e => e.isDirectory() && fs.existsSync(path.join(BRANDS_PATH, e.name, 'brand.json')))
      .map(e => e.name);
    res.json({ brands });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/brands/:name — read brand config
app.get('/api/brands/:name', (req, res) => {
  const name = req.params.name.replace(/\.\./g, '');
  const brandPath = path.join(BRANDS_PATH, name, 'brand.json');
  if (!fs.existsSync(brandPath)) {
    return res.status(404).json({ error: `Brand not found: ${name}` });
  }
  try {
    const brand = JSON.parse(fs.readFileSync(brandPath, 'utf-8'));
    res.json({ brand });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/brands/:name — save brand config
app.post('/api/brands/:name', (req, res) => {
  const name = req.params.name.replace(/\.\./g, '');
  const brandDir = path.join(BRANDS_PATH, name);
  const brandPath = path.join(brandDir, 'brand.json');

  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true });
  }

  try {
    fs.writeFileSync(brandPath, JSON.stringify(req.body, null, 2) + '\n', 'utf-8');
    console.log(`Brand saved: ${brandPath}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// File upload for brand assets
const brandUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const name = (req.params as any).name?.replace(/\.\./g, '') || 'default';
      const dir = path.join(BRANDS_PATH, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const type = (_req.body?.type as string) || 'asset';
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `${type}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video
});

// POST /api/brands/:name/upload — upload logo, intro, or outro
app.post('/api/brands/:name/upload', brandUpload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const relativePath = req.file.filename;
  console.log(`Brand file uploaded: ${req.file.path}`);
  res.json({ success: true, path: relativePath });
});

// GET /api/brands/:name/logo — serve logo file
app.get('/api/brands/:name/logo', (req, res) => {
  const name = req.params.name.replace(/\.\./g, '');
  const brandDir = path.join(BRANDS_PATH, name);

  // Find logo file (any extension)
  if (!fs.existsSync(brandDir)) {
    return res.status(404).json({ error: 'Brand not found' });
  }

  const files = fs.readdirSync(brandDir);
  const logoFile = files.find(f => f.startsWith('logo.'));
  if (!logoFile) {
    return res.status(404).json({ error: 'No logo found' });
  }

  res.sendFile(path.join(brandDir, logoFile));
});

// ========== Voice / TTS Endpoints ==========

const ELEVENLABS_API_KEY = 'sk_05502b179071a5af73848098c52b3b556ac144e89fe35998';
const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

// Cache voices for 1 hour
let voicesCache: { data: any; timestamp: number } | null = null;
const VOICES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

// GET /api/voices — List available ElevenLabs voices
app.get('/api/voices', async (_req, res) => {
  try {
    // Return cached if fresh
    if (voicesCache && Date.now() - voicesCache.timestamp < VOICES_CACHE_TTL) {
      return res.json(voicesCache.data);
    }

    const resp = await fetch(`${ELEVENLABS_BASE}/voices`, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: `ElevenLabs API error: ${text.slice(0, 200)}` });
    }

    const data = await resp.json();
    const voices = (data.voices || []).map((v: any) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category || 'unknown',
      labels: v.labels || {},
    }));

    const result = { voices };
    voicesCache = { data: result, timestamp: Date.now() };
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch voices: ${err.message}` });
  }
});

// GET /api/transcript?project=... — Get current transcript text from timestamps
app.get('/api/transcript', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });

  const sanitized = project.replace(/\.\./g, '');
  const tsPath = path.join(BASE_PATH, sanitized, 'src', 'voiceover-timestamps.json');

  if (!fs.existsSync(tsPath)) {
    return res.status(404).json({ error: 'No timestamps file found' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(tsPath, 'utf-8'));
    const words: { word: string }[] = data.words || [];
    const text = words.map(w => w.word).join(' ');
    res.json({ text, words: data.words || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/regenerate?project=... — Regenerate voiceover with ElevenLabs
app.post('/api/regenerate', async (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });

  const { text, voiceId, modelId, settings } = req.body;
  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Missing text or voiceId' });
  }

  const sanitized = project.replace(/\.\./g, '');
  const mp3Path = path.join(BASE_PATH, sanitized, 'public', 'voiceover.mp3');
  const tsPath = path.join(BASE_PATH, sanitized, 'src', 'voiceover-timestamps.json');
  const FPS = 30;

  try {
    // 1. Auto-backup existing files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (fs.existsSync(mp3Path)) {
      const backupMp3 = mp3Path.replace('.mp3', `.backup.${timestamp}.mp3`);
      fs.copyFileSync(mp3Path, backupMp3);
      console.log(`Backup: ${backupMp3}`);
    }
    if (fs.existsSync(tsPath)) {
      const backupTs = tsPath.replace('.json', `.backup.${timestamp}.json`);
      fs.copyFileSync(tsPath, backupTs);
      console.log(`Backup: ${backupTs}`);
    }

    // 2. Call ElevenLabs TTS with-timestamps endpoint
    const ttsUrl = `${ELEVENLABS_BASE}/text-to-speech/${voiceId}/with-timestamps`;
    const payload: any = {
      text,
      model_id: modelId || 'eleven_turbo_v2_5',
    };
    if (settings) {
      payload.voice_settings = {
        stability: settings.stability ?? 0.5,
        similarity_boost: settings.similarity_boost ?? 0.75,
        speed: settings.speed ?? 1.0,
      };
    }

    console.log(`Calling ElevenLabs TTS (${text.length} chars, voice: ${voiceId})...`);
    const ttsResp = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!ttsResp.ok) {
      const errText = await ttsResp.text();
      console.error(`ElevenLabs error: ${ttsResp.status} ${errText.slice(0, 300)}`);
      return res.status(ttsResp.status).json({ error: `ElevenLabs API error: ${errText.slice(0, 200)}` });
    }

    const ttsData = await ttsResp.json();

    // 3. Decode audio_base64 and save voiceover.mp3
    const audioBuffer = Buffer.from(ttsData.audio_base64, 'base64');
    const mp3Dir = path.dirname(mp3Path);
    if (!fs.existsSync(mp3Dir)) fs.mkdirSync(mp3Dir, { recursive: true });
    fs.writeFileSync(mp3Path, audioBuffer);
    console.log(`Saved: ${mp3Path} (${audioBuffer.length} bytes)`);

    // 4. Parse character alignments into word-level timestamps
    const alignment = ttsData.alignment || {};
    const characters: string[] = alignment.characters || [];
    const charStartTimes: number[] = alignment.character_start_times_seconds || [];
    const charEndTimes: number[] = alignment.character_end_times_seconds || [];

    const words: any[] = [];
    let currentWord = '';
    let wordStart: number | null = null;
    let wordEnd: number | null = null;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      if (char === ' ') {
        if (currentWord && wordStart !== null && wordEnd !== null) {
          words.push({
            word: currentWord,
            start: Math.round(wordStart * 1000) / 1000,
            end: Math.round(wordEnd * 1000) / 1000,
            startFrame: Math.round(wordStart * FPS),
            endFrame: Math.round(wordEnd * FPS),
          });
        }
        currentWord = '';
        wordStart = null;
        wordEnd = null;
      } else {
        if (wordStart === null) {
          wordStart = charStartTimes[i];
        }
        wordEnd = charEndTimes[i];
        currentWord += char;
      }
    }
    // Last word
    if (currentWord && wordStart !== null && wordEnd !== null) {
      words.push({
        word: currentWord,
        start: Math.round(wordStart * 1000) / 1000,
        end: Math.round(wordEnd * 1000) / 1000,
        startFrame: Math.round(wordStart * FPS),
        endFrame: Math.round(wordEnd * FPS),
      });
    }

    // 5. Save voiceover-timestamps.json
    const tsDir = path.dirname(tsPath);
    if (!fs.existsSync(tsDir)) fs.mkdirSync(tsDir, { recursive: true });
    const timestampsData = { words };
    fs.writeFileSync(tsPath, JSON.stringify(timestampsData, null, 2), 'utf-8');
    console.log(`Saved: ${tsPath} (${words.length} words)`);

    const duration = words.length > 0 ? words[words.length - 1].end : 0;
    res.json({ success: true, duration, wordCount: words.length });
  } catch (err: any) {
    console.error('Regeneration error:', err);
    res.status(500).json({ error: `Regeneration failed: ${err.message}` });
  }
});

// ==========================================
// Research Pipeline API (SQLite)
// ==========================================

import Database from 'better-sqlite3';

const PIPELINE_DB = path.join(BASE_PATH, 'tools', 'content-pipeline', 'data', 'pipeline.db');

function getDb() {
  const db = new Database(PIPELINE_DB, { readonly: false });
  db.pragma('journal_mode = WAL');
  return db;
}

// GET /api/research/candidates — top scored topics
app.get('/api/research/candidates', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 15;
    const db = getDb();
    const topics = db.prepare(
      'SELECT * FROM topics WHERE status = ? ORDER BY final_score DESC LIMIT ?'
    ).all('new', limit);

    // Attach sources to each topic
    const result = topics.map((t: any) => ({
      ...t,
      sources: db.prepare('SELECT * FROM topic_sources WHERE topic_id = ?').all(t.id)
    }));
    db.close();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/research/all — all topics with any status
app.get('/api/research/all', (req, res) => {
  try {
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const db = getDb();
    let topics;
    if (status) {
      topics = db.prepare('SELECT * FROM topics WHERE status = ? ORDER BY final_score DESC LIMIT ?').all(status, limit);
    } else {
      topics = db.prepare('SELECT * FROM topics ORDER BY created_at DESC LIMIT ?').all(limit);
    }
    db.close();
    res.json(topics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/research/topic/:id/status — change topic status
app.post('/api/research/topic/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['new', 'approved', 'rejected', 'queued', 'processed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const db = getDb();
    const now = new Date().toISOString();
    if (status === 'approved') {
      db.prepare('UPDATE topics SET status = ?, reviewed_at = ? WHERE id = ?').run(status, now, id);
    } else if (status === 'processed') {
      db.prepare('UPDATE topics SET status = ?, processed_at = ? WHERE id = ?').run(status, now, id);
    } else {
      db.prepare('UPDATE topics SET status = ? WHERE id = ?').run(status, id);
    }
    db.close();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/research/improvements — self-improvement suggestions
app.get('/api/research/improvements', (req, res) => {
  try {
    const status = req.query.status as string || 'suggested';
    const db = getDb();
    const improvements = db.prepare(
      'SELECT * FROM improvements WHERE status = ? ORDER BY id DESC'
    ).all(status);
    db.close();
    res.json(improvements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/research/improvement/:id/status — change improvement status
app.post('/api/research/improvement/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['suggested', 'accepted', 'rejected', 'implemented'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const db = getDb();
    db.prepare('UPDATE improvements SET status = ? WHERE id = ?').run(status, id);
    db.close();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/research/stats — pipeline stats
app.get('/api/research/stats', (req, res) => {
  try {
    const db = getDb();
    const stats = {
      total_topics: db.prepare('SELECT COUNT(*) as cnt FROM topics').get() as any,
      by_status: db.prepare('SELECT status, COUNT(*) as cnt FROM topics GROUP BY status').all(),
      total_improvements: db.prepare('SELECT COUNT(*) as cnt FROM improvements').get() as any,
      improvements_by_status: db.prepare('SELECT status, COUNT(*) as cnt FROM improvements GROUP BY status').all(),
      total_decisions: db.prepare("SELECT COUNT(*) as cnt FROM topics WHERE status IN ('approved', 'rejected')").get() as any,
      last_scan: db.prepare('SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1').get(),
      learning_threshold: 20,
    };
    db.close();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/research/scripts — generated scripts
app.get('/api/research/scripts', (req, res) => {
  try {
    const db = getDb();
    const scripts = db.prepare(`
      SELECT s.*, t.title as topic_title, t.proposed_angle, t.proposed_hook
      FROM scripts s JOIN topics t ON s.topic_id = t.id
      ORDER BY s.id DESC LIMIT 20
    `).all();
    db.close();
    res.json(scripts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// REVIEW API — Video Review Editor
// ============================================================

// GET /api/review/projects — list video projects with Generated_*.tsx files
app.get('/api/review/projects', (_req, res) => {
  const videosDir = path.join(BASE_PATH, 'videos');
  if (!fs.existsSync(videosDir)) return res.json({ projects: [] });

  const projects: string[] = [];
  try {
    for (const entry of fs.readdirSync(videosDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'good-examples') continue;
      const visualsDir = path.join(videosDir, entry.name, 'src', 'visuals');
      if (fs.existsSync(visualsDir)) {
        const hasGenerated = fs.readdirSync(visualsDir).some(f => f.startsWith('Generated_') && f.endsWith('.tsx'));
        if (hasGenerated) projects.push(entry.name);
      }
    }
  } catch { /* ignore */ }
  res.json({ projects });
});

// GET /api/review/segments?project=api-keys — parse Root.tsx for segment info
app.get('/api/review/segments', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');

  const rootPath = path.join(BASE_PATH, 'videos', sanitized, 'src', 'Root.tsx');
  if (!fs.existsSync(rootPath)) return res.status(404).json({ error: 'Root.tsx not found' });

  try {
    const rootContent = fs.readFileSync(rootPath, 'utf-8');

    // Parse segments from Root.tsx: { Component: Generated_X, startFrame: 0, endFrame: 633 }
    const segmentRegex = /\{\s*Component:\s*(\w+),\s*startFrame:\s*(\d+),\s*endFrame:\s*(\d+)\s*\}/g;
    const segments: any[] = [];
    let match;
    while ((match = segmentRegex.exec(rootContent)) !== null) {
      const componentName = match[1];
      const fileName = `${componentName}.tsx`;
      const filePath = path.join(BASE_PATH, 'videos', sanitized, 'src', 'visuals', fileName);
      segments.push({
        id: `segment_${segments.length + 1}`,
        componentName,
        file: fileName,
        startFrame: parseInt(match[2]),
        endFrame: parseInt(match[3]),
        title: componentName.replace('Generated_', '').replace(/([A-Z])/g, ' $1').trim(),
        exists: fs.existsSync(filePath),
      });
    }

    // Parse composition info: durationInFrames, fps, width, height
    const durationMatch = rootContent.match(/durationInFrames=\{(\d+)\}/);
    const fpsMatch = rootContent.match(/fps=\{(\d+)\}/);
    const widthMatch = rootContent.match(/width=\{(\d+)\}/);
    const heightMatch = rootContent.match(/height=\{(\d+)\}/);

    res.json({
      segments,
      composition: {
        durationInFrames: durationMatch ? parseInt(durationMatch[1]) : 0,
        fps: fpsMatch ? parseInt(fpsMatch[1]) : 30,
        width: widthMatch ? parseInt(widthMatch[1]) : 1920,
        height: heightMatch ? parseInt(heightMatch[1]) : 1080,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/review?project=api-keys — read review.json
app.get('/api/review', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');
  const reviewPath = path.join(BASE_PATH, 'videos', sanitized, 'review.json');

  if (!fs.existsSync(reviewPath)) {
    return res.json({ review: null });
  }

  try {
    res.json({ review: JSON.parse(fs.readFileSync(reviewPath, 'utf-8')) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/review?project=api-keys — save review.json
app.post('/api/review', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');
  const reviewPath = path.join(BASE_PATH, 'videos', sanitized, 'review.json');

  try {
    fs.writeFileSync(reviewPath, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/review/regenerate — create queue request for segment regeneration
app.post('/api/review/regenerate', (req, res) => {
  const { project, segmentId, file, comment, transcriptSegment, timestamps, startFrame, endFrame } = req.body;
  if (!project || !segmentId || !file) return res.status(400).json({ error: 'Missing required fields' });
  const sanitized = project.replace(/\.\./g, '');

  const queueDir = path.join(BASE_PATH, 'videos', sanitized, 'queue');
  if (!fs.existsSync(queueDir)) fs.mkdirSync(queueDir, { recursive: true });

  // Backup current file before regeneration
  const versionsDir = path.join(BASE_PATH, 'videos', sanitized, 'versions');
  if (!fs.existsSync(versionsDir)) fs.mkdirSync(versionsDir, { recursive: true });

  const currentFile = path.join(BASE_PATH, 'videos', sanitized, 'src', 'visuals', file);
  if (fs.existsSync(currentFile)) {
    const baseName = file.replace('.tsx', '');
    const existing = fs.readdirSync(versionsDir).filter(f => f.startsWith(baseName + '_v'));
    const nextVersion = existing.length + 1;
    const backupName = `${baseName}_v${nextVersion}.tsx`;
    fs.copyFileSync(currentFile, path.join(versionsDir, backupName));
  }

  const id = `req-${Date.now()}`;
  const request = {
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    project: sanitized,
    segmentId,
    action: 'regenerate',
    file,
    comment: comment || '',
    transcriptSegment: transcriptSegment || '',
    timestamps: timestamps || [],
    startFrame: startFrame || 0,
    endFrame: endFrame || 0,
  };

  fs.writeFileSync(path.join(queueDir, `${id}.json`), JSON.stringify(request, null, 2));
  res.json({ id, status: 'pending' });
});

// GET /api/review/queue/:id?project=X — poll queue status
app.get('/api/review/queue/:id', (req, res) => {
  const project = req.query.project as string;
  const id = req.params.id;
  if (!project || !id) return res.status(400).json({ error: 'Missing project or id' });
  const sanitized = project.replace(/\.\./g, '');

  const queueDir = path.join(BASE_PATH, 'videos', sanitized, 'queue');
  const resultPath = path.join(queueDir, `${id}-result.json`);
  const requestPath = path.join(queueDir, `${id}.json`);

  if (fs.existsSync(resultPath)) {
    try {
      return res.json({ status: 'done', result: JSON.parse(fs.readFileSync(resultPath, 'utf-8')) });
    } catch { /* fall through */ }
  }

  if (fs.existsSync(requestPath)) {
    return res.json({ status: 'pending' });
  }

  res.status(404).json({ error: 'Queue request not found' });
});

// GET /api/review/versions?project=X&file=Generated_X.tsx — list versions
app.get('/api/review/versions', (req, res) => {
  const project = req.query.project as string;
  const file = req.query.file as string;
  if (!project || !file) return res.status(400).json({ error: 'Missing project or file' });
  const sanitized = project.replace(/\.\./g, '');

  const versionsDir = path.join(BASE_PATH, 'videos', sanitized, 'versions');
  if (!fs.existsSync(versionsDir)) return res.json({ versions: [] });

  const baseName = (file as string).replace('.tsx', '');
  const versions = fs.readdirSync(versionsDir)
    .filter(f => f.startsWith(baseName + '_v') && f.endsWith('.tsx'))
    .sort()
    .map(f => ({
      name: f,
      path: path.join(versionsDir, f),
      created: fs.statSync(path.join(versionsDir, f)).mtime.toISOString(),
    }));

  res.json({ versions });
});

// POST /api/review/save-example — copy a segment file to good-examples
app.post('/api/review/save-example', (req, res) => {
  const { project, file } = req.body;
  if (!project || !file) return res.status(400).json({ error: 'Missing project or file' });
  const sanitized = project.replace(/\.\./g, '');

  const sourcePath = path.join(BASE_PATH, 'videos', sanitized, 'src', 'visuals', file);
  if (!fs.existsSync(sourcePath)) return res.status(404).json({ error: 'Source file not found' });

  const examplesDir = path.join(BASE_PATH, '.claude', 'skills', 'visual-generator', 'reference', 'good-examples');
  if (!fs.existsSync(examplesDir)) fs.mkdirSync(examplesDir, { recursive: true });

  // Enforce max 10 examples — remove oldest if needed
  const existing = fs.readdirSync(examplesDir).filter(f => f.endsWith('.tsx'));
  if (existing.length >= 10) {
    const oldest = existing
      .map(f => ({ name: f, mtime: fs.statSync(path.join(examplesDir, f)).mtime.getTime() }))
      .sort((a, b) => a.mtime - b.mtime)[0];
    if (oldest) fs.unlinkSync(path.join(examplesDir, oldest.name));
  }

  fs.copyFileSync(sourcePath, path.join(examplesDir, file));
  res.json({ ok: true, path: path.join(examplesDir, file) });
});

// GET /api/review/transcript?project=X — get transcript for review
app.get('/api/review/transcript', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');

  // Try workspace first (has full transcript), then videos
  const workspacePath = path.join(BASE_PATH, 'workspace', sanitized, 'transcript.txt');
  const videosPath = path.join(BASE_PATH, 'videos', sanitized, 'TRANSCRIPT.md');

  let transcript = '';
  if (fs.existsSync(workspacePath)) {
    transcript = fs.readFileSync(workspacePath, 'utf-8');
  } else if (fs.existsSync(videosPath)) {
    transcript = fs.readFileSync(videosPath, 'utf-8');
  }

  // Also try voiceover timestamps for word-level data
  // Check workspace first, then videos/src
  const tsPaths = [
    path.join(BASE_PATH, 'workspace', sanitized, 'voiceover-timestamps.json'),
    path.join(BASE_PATH, 'videos', sanitized, 'src', 'voiceover-timestamps.json'),
  ];
  let timestamps: any[] = [];
  for (const tsPath of tsPaths) {
    if (fs.existsSync(tsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(tsPath, 'utf-8'));
        timestamps = data.words || data;
        break;
      } catch { /* ignore */ }
    }
  }

  res.json({ transcript, timestamps });
});

// GET /api/review/video-status?project=X — check if rendered video exists
app.get('/api/review/video-status', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');

  // Check multiple possible locations
  const locations = [
    path.join(BASE_PATH, 'videos', sanitized, 'out', 'video.mp4'),
    path.join(BASE_PATH, 'videos', sanitized, 'out', 'DynamicPipeline.mp4'),
    path.join(BASE_PATH, 'videos', sanitized, 'output.mp4'),
  ];

  // Also check for any .mp4 in out/
  const outDir = path.join(BASE_PATH, 'videos', sanitized, 'out');
  if (fs.existsSync(outDir)) {
    const mp4s = fs.readdirSync(outDir).filter(f => f.endsWith('.mp4'));
    if (mp4s.length > 0) {
      const fullPath = path.join(outDir, mp4s[0]);
      const stat = fs.statSync(fullPath);
      return res.json({ exists: true, path: fullPath, filename: mp4s[0], size: stat.size });
    }
  }

  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      const stat = fs.statSync(loc);
      return res.json({ exists: true, path: loc, filename: path.basename(loc), size: stat.size });
    }
  }

  res.json({ exists: false });
});

// GET /api/review/video?project=X — serve rendered video
app.get('/api/review/video', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');

  // Find video file
  const outDir = path.join(BASE_PATH, 'videos', sanitized, 'out');
  let videoPath = '';

  if (fs.existsSync(outDir)) {
    const mp4s = fs.readdirSync(outDir).filter(f => f.endsWith('.mp4'));
    if (mp4s.length > 0) videoPath = path.join(outDir, mp4s[0]);
  }

  if (!videoPath) {
    const fallbacks = [
      path.join(BASE_PATH, 'videos', sanitized, 'output.mp4'),
    ];
    for (const fb of fallbacks) {
      if (fs.existsSync(fb)) { videoPath = fb; break; }
    }
  }

  if (!videoPath) return res.status(404).json({ error: 'No rendered video found' });

  const stat = fs.statSync(videoPath);
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

// POST /api/review/render?project=X — render video with Remotion
app.post('/api/review/render', async (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });
  const sanitized = project.replace(/\.\./g, '');

  const projectDir = path.join(BASE_PATH, 'videos', sanitized);
  const rootPath = path.join(projectDir, 'src', 'Root.tsx');
  if (!fs.existsSync(rootPath)) return res.status(404).json({ error: 'Root.tsx not found' });

  // Parse composition ID from Root.tsx
  const rootContent = fs.readFileSync(rootPath, 'utf-8');
  const idMatch = rootContent.match(/id="([^"]+)"/);
  if (!idMatch) return res.status(400).json({ error: 'Could not find composition ID in Root.tsx' });
  const compositionId = idMatch[1];

  const outDir = path.join(projectDir, 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outputPath = path.join(outDir, 'video.mp4');

  // Return immediately, render in background
  res.json({ status: 'rendering', compositionId, outputPath });

  const { exec } = await import('child_process');
  exec(
    `cd "${projectDir}" && npx remotion render src/index.ts "${compositionId}" out/video.mp4 --codec h264`,
    { timeout: 600000 },
    (err, stdout, stderr) => {
      if (err) {
        console.error('Render failed:', err.message);
        console.error(stderr);
      } else {
        console.log('Render complete:', outputPath);
      }
    }
  );
});

// ========== Generated Visual Editor Endpoints ==========

import { parseTsx, applyEdits, EditOperation, ParsedComponent } from './tsx-parser.js';

// GET /api/generated/projects — list projects that have Generated_*.tsx files
app.get('/api/generated/projects', (_req, res) => {
  const videosDir = path.join(BASE_PATH, 'videos');
  const projects: string[] = [];

  if (!fs.existsSync(videosDir)) return res.json({ projects: [] });

  try {
    const entries = fs.readdirSync(videosDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const visualsDir = path.join(videosDir, entry.name, 'src', 'visuals');
      if (!fs.existsSync(visualsDir)) continue;
      const files = fs.readdirSync(visualsDir);
      if (files.some(f => f.startsWith('Generated_') && f.endsWith('.tsx'))) {
        projects.push(entry.name);
      }
    }
    res.json({ projects });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/generated/:project/files — list Generated_*.tsx files in a project
app.get('/api/generated/:project/files', (req, res) => {
  const project = req.params.project.replace(/\.\./g, '');
  const visualsDir = path.join(BASE_PATH, 'videos', project, 'src', 'visuals');

  if (!fs.existsSync(visualsDir)) return res.status(404).json({ error: 'Visuals dir not found' });

  try {
    const files = fs.readdirSync(visualsDir)
      .filter(f => f.startsWith('Generated_') && f.endsWith('.tsx'))
      .sort();
    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/generated/:project/:file/parse — parse a Generated_*.tsx and return editable elements
app.get('/api/generated/:project/:file/parse', (req, res) => {
  const project = req.params.project.replace(/\.\./g, '');
  const file = req.params.file.replace(/\.\./g, '');
  const filePath = path.join(BASE_PATH, 'videos', project, 'src', 'visuals', file);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  try {
    const source = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseTsx(source, file);
    res.json({ parsed, source });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/generated/:project/:file/edit — apply edits to a Generated_*.tsx
app.post('/api/generated/:project/:file/edit', (req, res) => {
  const project = req.params.project.replace(/\.\./g, '');
  const file = req.params.file.replace(/\.\./g, '');
  const filePath = path.join(BASE_PATH, 'videos', project, 'src', 'visuals', file);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  const { edits, parsed } = req.body as { edits: EditOperation[]; parsed: ParsedComponent };

  if (!edits || !parsed) {
    return res.status(400).json({ error: 'Missing edits or parsed data' });
  }

  try {
    const source = fs.readFileSync(filePath, 'utf-8');

    // Backup before editing
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = filePath.replace('.tsx', `.backup.${timestamp}.tsx`);
    fs.copyFileSync(filePath, backupPath);

    const newSource = applyEdits(source, parsed, edits);
    fs.writeFileSync(filePath, newSource, 'utf-8');

    // Re-parse to return fresh state
    const newParsed = parseTsx(newSource, file);

    console.log(`Generated visual edited: ${filePath} (${edits.length} edits, backup: ${path.basename(backupPath)})`);
    res.json({ success: true, parsed: newParsed, source: newSource });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// IMPROVEMENTS API — System Learning Dashboard
// ============================================================

// GET /api/improvements — read improvements.json
app.get('/api/improvements', (_req, res) => {
  const improvPath = path.join(BASE_PATH, 'workspace', 'improvements.json');
  if (!fs.existsSync(improvPath)) return res.json({ improvements: null });
  try {
    res.json({ improvements: JSON.parse(fs.readFileSync(improvPath, 'utf-8')) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/improvements — save improvements.json (used by skill or UI)
app.post('/api/improvements', (req, res) => {
  const improvPath = path.join(BASE_PATH, 'workspace', 'improvements.json');
  try {
    fs.writeFileSync(improvPath, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/improvements/summary — aggregate all review.json markers with categorization
app.get('/api/improvements/summary', (_req, res) => {
  const videosDir = path.join(BASE_PATH, 'videos');
  if (!fs.existsSync(videosDir)) return res.json({ projects: [], totals: { good: 0, bad: 0, missing: 0 }, categories: [], allBadMarkers: [] });

  const projects: any[] = [];
  const totals = { good: 0, bad: 0, missing: 0 };
  const allBadMarkers: any[] = [];

  // Category keyword detection
  const categoryKeywords: Record<string, string[]> = {
    animation: ['static', 'no movement', 'boring', 'still', 'frozen', 'no animation', 'just appears', 'no motion', 'doesnt move', 'animacija', 'statick', 'staticn'],
    layout: ['too many', 'crowded', 'cluttered', 'overlapping', 'small', 'messy', 'kutija', 'previse', 'raspored', 'layout'],
    timing: ['too fast', 'too slow', 'sync', 'early', 'late', 'timing', 'brzo', 'sporo', 'kasni'],
    'visual-type': ['wrong type', 'should be', 'doesnt fit', 'wrong visual', 'tip vizuala', 'pogresan'],
    content: ['missing info', 'wrong data', 'unclear', 'confusing', 'fali', 'nejasno', 'pogresno'],
    style: ['ugly', 'colors', 'font', 'looks bad', 'inconsistent', 'ruzno', 'boje', 'stil'],
  };

  function categorize(comment: string): string {
    const lower = (comment || '').toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) return cat;
    }
    return 'other';
  }

  try {
    for (const entry of fs.readdirSync(videosDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'good-examples' || entry.name === 'node_modules') continue;
      const reviewPath = path.join(videosDir, entry.name, 'review.json');
      if (!fs.existsSync(reviewPath)) continue;

      try {
        const data = JSON.parse(fs.readFileSync(reviewPath, 'utf-8'));
        const markers = data.markers || [];
        const counts = { good: 0, bad: 0, missing: 0 };
        markers.forEach((m: any) => {
          if (m.type === 'good') { counts.good++; totals.good++; }
          if (m.type === 'bad') { counts.bad++; totals.bad++; }
          if (m.type === 'missing') { counts.missing++; totals.missing++; }
          if (m.type === 'bad' || m.type === 'missing') {
            allBadMarkers.push({
              project: entry.name,
              type: m.type,
              comment: m.comment || '',
              category: categorize(m.comment),
              startFrame: m.startFrame,
              endFrame: m.endFrame,
            });
          }
        });
        projects.push({
          name: entry.name,
          markers: markers.length,
          counts,
          updatedAt: data.updatedAt || null,
        });
      } catch { /* skip bad json */ }
    }
  } catch { /* ignore */ }

  // Aggregate categories ranked by frequency
  const catCounts: Record<string, { count: number; comments: string[] }> = {};
  allBadMarkers.forEach(m => {
    if (!catCounts[m.category]) catCounts[m.category] = { count: 0, comments: [] };
    catCounts[m.category].count++;
    if (m.comment && catCounts[m.category].comments.length < 5) {
      catCounts[m.category].comments.push(`${m.project}: ${m.comment}`);
    }
  });
  const categories = Object.entries(catCounts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  // Sort projects by bad marker count (worst first)
  projects.sort((a, b) => (b.counts.bad + b.counts.missing) - (a.counts.bad + a.counts.missing));

  // Read improvements.json
  const improvPath = path.join(BASE_PATH, 'workspace', 'improvements.json');
  let improvements = null;
  if (fs.existsSync(improvPath)) {
    try { improvements = JSON.parse(fs.readFileSync(improvPath, 'utf-8')); } catch {}
  }

  res.json({ projects, totals, categories, allBadMarkers, improvements });
});

// ============================================================
// PIPELINE API — Topics, approve/reject, process
// ============================================================

const PIPELINE_DIR = path.join(BASE_PATH, 'tools', 'content-pipeline');

// GET /api/pipeline/topics — list topics from pipeline DB (using better-sqlite3 directly)
app.get('/api/pipeline/topics', (_req, res) => {
  try {
    const pdb = new Database(path.join(PIPELINE_DIR, 'data', 'pipeline.db'), { readonly: true });
    pdb.pragma('journal_mode = WAL');
    const topics = pdb.prepare('SELECT * FROM topics ORDER BY final_score DESC LIMIT 50').all();

    // Also get demand data for each topic
    const demandStmt = pdb.prepare('SELECT * FROM topic_demand WHERE topic_id = ?');
    const enriched = topics.map((t: any) => {
      const demand = demandStmt.get(t.id) as any;
      return {
        ...t,
        demand_signal: demand?.demand_signal || null,
        has_tutorial_demand: demand?.has_tutorial_demand || false,
        has_comparison_demand: demand?.has_comparison_demand || false,
      };
    });

    pdb.close();
    res.json({ topics: enriched });
  } catch (e: any) {
    res.json({ topics: [], error: e.message });
  }
});

// POST /api/pipeline/topic/:id/status — approve/reject/queue
app.post('/api/pipeline/topic/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  try {
    const pdb = new Database(path.join(PIPELINE_DIR, 'data', 'pipeline.db'));
    pdb.pragma('journal_mode = WAL');
    const now = new Date().toISOString();
    if (status === 'approved') {
      pdb.prepare('UPDATE topics SET status = ?, reviewed_at = ? WHERE id = ?').run(status, now, id);
    } else {
      pdb.prepare('UPDATE topics SET status = ? WHERE id = ?').run(status, id);
    }
    pdb.close();
    res.json({ ok: true, id, status });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/pipeline/process/:id - run pipeline in BACKGROUND
app.post('/api/pipeline/process/:id', (req, res) => {
  const id = req.params.id;

  // Update status immediately
  try {
    const pdb = new Database(path.join(PIPELINE_DIR, 'data', 'pipeline.db'));
    pdb.pragma('journal_mode = WAL');
    pdb.prepare('UPDATE topics SET status = ? WHERE id = ?').run('processing', id);
    pdb.close();
  } catch {}

  // Respond immediately - don't block server
  res.json({ ok: true, id, status: 'processing', message: 'Pipeline started. Refresh to check.' });

  // Run in background
  const cp = require('child_process') as typeof import('child_process');
  const child = cp.spawn('python3', [
    '-c',
    `import sys; sys.path.insert(0, '${PIPELINE_DIR}'); from full_pipeline import run_full_pipeline; run_full_pipeline(${id})`
  ], { cwd: PIPELINE_DIR, detached: true, stdio: 'ignore' });
  child.unref();
});

// POST /api/pipeline/scan - run scan in BACKGROUND
app.post('/api/pipeline/scan', (_req, res) => {
  res.json({ ok: true, status: 'scanning', message: 'Scan started. Refresh in ~4 min.' });

  const cp = require('child_process') as typeof import('child_process');
  const child = cp.spawn('python3', ['run_pipeline.py'], { cwd: PIPELINE_DIR, detached: true, stdio: 'ignore' });
  child.unref();
});

// GET /api/composition?project=workspace/how-llms-work
app.get('/api/composition', (req, res) => {
  const project = req.query.project as string;
  if (!project) return res.status(400).json({ error: 'Missing project' });

  const sanitized = project.replace(/\.\./g, '');
  const compPath = path.join(BASE_PATH, sanitized, 'master-composition.json');

  if (!fs.existsSync(compPath)) {
    return res.status(404).json({ error: 'master-composition.json not found' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(compPath, 'utf-8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to parse composition' });
  }
});

// POST /api/regenerate-beat — regenerate a specific beat's visual
app.post('/api/regenerate-beat', (req, res) => {
  const { project, beatId, count } = req.body;
  try {
    // Find the composition to get beat info
    let compPath = '';
    for (const prefix of ['videos/', 'workspace/']) {
      const p = path.join(BASE_PATH, prefix, project, 'master-composition.json');
      if (fs.existsSync(p)) { compPath = p; break; }
    }
    if (!compPath) {
      return res.json({ beatId, variants: [], status: 'no composition found' });
    }

    const comp = JSON.parse(fs.readFileSync(compPath, 'utf-8'));
    const beat = (comp.beats || []).find((b: any) => b.id === beatId);
    if (!beat) {
      return res.json({ beatId, variants: [], status: 'beat not found' });
    }

    // For ai_video beats: regenerate image + video
    if (beat.visualType === 'ai_video' && beat.aiVideoPrompt) {
      const prompt = beat.aiVideoPrompt;
      const clipsDir = path.join(path.dirname(compPath), 'ai-clips');
      const cmd = `cd "${BASE_PATH}" && python3 tools/ai-video/video_generator.py single "${prompt.replace(/"/g, '\\"')}" "${clipsDir}"`;
      const result = execFileSync('bash', ['-c', cmd], { timeout: 300000, encoding: 'utf-8' }) as string;
      res.json({ beatId, status: 'regenerated', output: result.substring(0, 500) });
    } else {
      // For motion_graphics: would need to call visual-generator skill (Claude agent)
      res.json({ beatId, status: 'motion_graphics regeneration requires Claude agent — use Review tab markers instead' });
    }
  } catch (e: any) {
    res.json({ beatId, status: 'error', error: e.message?.substring(0, 200) });
  }
});

// POST /api/select-variant — placeholder
app.post('/api/select-variant', (req, res) => {
  const { project, beatId, variantIndex } = req.body;
  // TODO: swap selected variant into composition
  res.json({ beatId, selected: variantIndex, status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Visual Editor API running at http://localhost:${PORT}`);
});
