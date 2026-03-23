/**
 * ElevenLabs Voice Generator with Timestamps
 *
 * Usage:
 *   npx ts-node scripts/generate-voice.ts
 *
 * Requires:
 *   - ELEVENLABS_API_KEY environment variable
 *   - npm install node-fetch (if Node < 18)
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
// Rachel - clear, professional female voice
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// OpenClaw Voiceover Script - PUNCHY, no intro/outro
// Short sentences for faster delivery
const SCRIPT = `
Channels. WhatsApp. Telegram. Discord. Slack. One codebase handles all of them.

Gateway layer. WebSocket receives messages in real-time. Normalizer converts formats. Router sends them where they need to go.

Reasoning Engine. Claude. GPT. Local LLMs. Pick your model. The agent thinks, decides, responds.

Memory System. WAL files for recovery. Context windows for history. Markdown for long-term knowledge. Everything persists.

Execution layer. Shell. Python. Browser automation. Docker containers. Safe and sandboxed.

Sessions. Responses route back to users. Cron jobs run scheduled tasks. Done.
`.trim();

interface TimestampedCharacter {
  character: string;
  character_start_times_seconds: number;
  character_end_times_seconds: number;
}

interface ElevenLabsResponse {
  audio_base64: string;
  alignment: {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
  };
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
}

interface SectionTimestamp {
  section: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  words: WordTimestamp[];
}

async function generateVoice() {
  if (!ELEVENLABS_API_KEY) {
    console.error("ERROR: Set ELEVENLABS_API_KEY environment variable");
    console.error("  export ELEVENLABS_API_KEY=your_key_here");
    process.exit(1);
  }

  console.log("Generating voice with ElevenLabs...");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: SCRIPT,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("ElevenLabs API error:", error);
    process.exit(1);
  }

  const data: ElevenLabsResponse = await response.json();

  // Save audio
  const audioBuffer = Buffer.from(data.audio_base64, "base64");
  const audioPath = path.join(__dirname, "..", "public", "voiceover.mp3");
  fs.mkdirSync(path.dirname(audioPath), { recursive: true });
  fs.writeFileSync(audioPath, audioBuffer);
  console.log(`Audio saved: ${audioPath}`);

  // Process timestamps into words
  const FPS = 30;
  const words = extractWords(data.alignment, FPS);

  // Group words into sections based on content
  const sections = groupIntoSections(words, FPS);

  // Save timestamps JSON
  const timestampsPath = path.join(__dirname, "..", "src", "voiceover-timestamps.json");
  fs.writeFileSync(
    timestampsPath,
    JSON.stringify({ words, sections, fps: FPS }, null, 2)
  );
  console.log(`Timestamps saved: ${timestampsPath}`);

  // Print summary
  console.log("\n--- SECTION TIMESTAMPS ---");
  sections.forEach((section) => {
    console.log(`${section.section}: ${section.start.toFixed(2)}s - ${section.end.toFixed(2)}s (frames ${section.startFrame}-${section.endFrame})`);
  });

  const totalDuration = words[words.length - 1]?.end || 0;
  console.log(`\nTotal duration: ${totalDuration.toFixed(2)}s (${Math.ceil(totalDuration * FPS)} frames)`);
}

function extractWords(
  alignment: ElevenLabsResponse["alignment"],
  fps: number
): WordTimestamp[] {
  const words: WordTimestamp[] = [];
  let currentWord = "";
  let wordStart = 0;
  let wordEnd = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const start = alignment.character_start_times_seconds[i];
    const end = alignment.character_end_times_seconds[i];

    if (char === " " || char === "\n") {
      if (currentWord.trim()) {
        words.push({
          word: currentWord.trim(),
          start: wordStart,
          end: wordEnd,
          startFrame: Math.round(wordStart * fps),
          endFrame: Math.round(wordEnd * fps),
        });
      }
      currentWord = "";
      wordStart = end;
    } else {
      if (!currentWord) {
        wordStart = start;
      }
      currentWord += char;
      wordEnd = end;
    }
  }

  // Don't forget the last word
  if (currentWord.trim()) {
    words.push({
      word: currentWord.trim(),
      start: wordStart,
      end: wordEnd,
      startFrame: Math.round(wordStart * fps),
      endFrame: Math.round(wordEnd * fps),
    });
  }

  return words;
}

function groupIntoSections(words: WordTimestamp[], fps: number): SectionTimestamp[] {
  const sections: SectionTimestamp[] = [];

  // Section markers - keywords that indicate section start
  const sectionMarkers = [
    { keyword: "OpenClaw", section: "INTRO" },
    { keyword: "Channels", section: "CHANNELS" },
    { keyword: "Gateway", section: "GATEWAY" },
    { keyword: "Reasoning", section: "REASONING" },
    { keyword: "Memory", section: "MEMORY" },
    { keyword: "Execution", section: "EXECUTION" },
    { keyword: "Sessions", section: "SESSIONS" },
  ];

  let currentSection: SectionTimestamp | null = null;

  for (const word of words) {
    // Check if this word starts a new section
    const marker = sectionMarkers.find(m =>
      word.word.toLowerCase().includes(m.keyword.toLowerCase())
    );

    if (marker) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        section: marker.section,
        start: word.start,
        end: word.end,
        startFrame: word.startFrame,
        endFrame: word.endFrame,
        words: [word],
      };
    } else if (currentSection) {
      currentSection.words.push(word);
      currentSection.end = word.end;
      currentSection.endFrame = word.endFrame;
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

generateVoice().catch(console.error);
