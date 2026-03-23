/**
 * ElevenLabs Voice Generator with Timestamps
 *
 * Usage:
 *   npx ts-node scripts/generate-voice.ts
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// NemoClaw Stack Script - ByteMonk style
const SCRIPT = `
This is the full NemoClaw stack.

OpenShell. OpenClaw runs inside OpenShell, a security runtime that enforces every rule at the OS level. The agent physically cannot bypass what the policy defines.

Policy Engine. It controls file access, network requests, API calls. Every action goes through this layer.

Privacy Router. Sensitive data stays local, runs on Nemo on your own hardware. Non-sensitive routes to cloud models. The agent doesn't choose. The policy does.

One command. Full control.
`.trim();

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

  // Process timestamps
  const FPS = 30;
  const words = extractWords(data.alignment, FPS);
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

  const sectionMarkers = [
    { keyword: "OpenShell", section: "OPENSHELL" },
    { keyword: "Policy", section: "POLICY_ENGINE" },
    { keyword: "Privacy", section: "PRIVACY_ROUTER" },
    { keyword: "One command", section: "OUTRO" },
  ];

  let currentSection: SectionTimestamp | null = null;

  for (const word of words) {
    const marker = sectionMarkers.find(m =>
      word.word.toLowerCase().includes(m.keyword.toLowerCase())
    );

    if (marker) {
      if (currentSection) {
        sections.push(currentSection);
      }

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

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

generateVoice().catch(console.error);
