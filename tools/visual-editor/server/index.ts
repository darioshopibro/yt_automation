import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.listen(PORT, () => {
  console.log(`Visual Editor API running at http://localhost:${PORT}`);
});
