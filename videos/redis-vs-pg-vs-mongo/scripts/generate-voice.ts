/**
 * ElevenLabs Voice Generator with Timestamps
 * AI Video Generation Pipeline - Kling vs Runway vs Sora
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_xxx npx ts-node scripts/generate-voice.ts
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "iP95p4xoKVk53GoZ742B"; // Chris - American, Casual

// AI Video Generation - Kling vs Runway vs Sora
const SCRIPT = `
You write a text prompt describing your video. That prompt goes to the AI model for processing. Let me show you how Kling, Runway, and Sora each handle this differently.

Step one, Kling. Your prompt enters the text encoder. The encoder transforms words into embeddings. Those embeddings feed into the diffusion model. The model generates video frames iteratively. Each frame builds on the previous. Kling outputs your final video in 1080p.

Step two, Runway. You provide your prompt plus an optional image. Runway uses multi-modal encoding. The encoder processes both text and visual input. Gen-3 Alpha runs temporal diffusion. It generates motion across frames simultaneously. Runway delivers smooth, cinematic output.

Step three, Sora. Your prompt describes the full scene. Sora uses a transformer architecture, not diffusion. The model predicts video patches directly. It understands physics and object permanence. Sora generates longer, more coherent videos. The output maintains consistency across frames.

Each tool has its strength. Kling excels at speed and accessibility. Runway delivers professional quality. Sora leads in understanding and coherence.
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
  console.log("Generating voice with ElevenLabs...");
  console.log("Script:\n", SCRIPT);
  console.log("\n---\n");

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
          stability: 0.75,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: false,
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

  // Print summary for animation sync
  console.log("\n=== SECTION TIMESTAMPS (za animaciju) ===\n");
  sections.forEach((section) => {
    const cameraFrame = section.startFrame - 15; // Camera 15 frames BEFORE
    const sectionFrame = section.startFrame - 5;  // Section 5 frames BEFORE
    console.log(`${section.section}:`);
    console.log(`  Word at: frame ${section.startFrame} (${section.start.toFixed(2)}s)`);
    console.log(`  Camera keyframe: frame ${cameraFrame}`);
    console.log(`  Section appear: frame ${sectionFrame}`);
    console.log(`  Camera whoosh: frame ${cameraFrame - 2}`);
    console.log(`  Section whoosh: frame ${sectionFrame + 20}`);
    console.log("");
  });

  const totalDuration = words[words.length - 1]?.end || 0;
  console.log(`Total duration: ${totalDuration.toFixed(2)}s (${Math.ceil(totalDuration * FPS)} frames)`);
  console.log(`\nKopiraj gornje frame brojeve u dynamic-config.json!`);
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

  // AI Video Gen section markers
  const sectionMarkers = [
    { keyword: "text prompt", section: "TEXT_PROMPT" },
    { keyword: "Step one, Kling", section: "KLING_INTRO" },
    { keyword: "text encoder", section: "KLING_ENCODER" },
    { keyword: "embeddings", section: "KLING_EMBEDDINGS" },
    { keyword: "diffusion model", section: "KLING_DIFFUSION" },
    { keyword: "1080p", section: "KLING_OUTPUT" },
    { keyword: "Step two, Runway", section: "RUNWAY_INTRO" },
    { keyword: "multi-modal", section: "RUNWAY_MULTIMODAL" },
    { keyword: "Gen-3 Alpha", section: "RUNWAY_GEN3" },
    { keyword: "cinematic output", section: "RUNWAY_OUTPUT" },
    { keyword: "Step three, Sora", section: "SORA_INTRO" },
    { keyword: "transformer architecture", section: "SORA_TRANSFORMER" },
    { keyword: "video patches", section: "SORA_PATCHES" },
    { keyword: "physics", section: "SORA_PHYSICS" },
    { keyword: "consistency", section: "SORA_OUTPUT" },
    { keyword: "Each tool", section: "COMPARISON" },
  ];

  let currentSection: SectionTimestamp | null = null;
  let fullText = "";

  for (const word of words) {
    fullText += word.word + " ";

    for (const marker of sectionMarkers) {
      if (fullText.toLowerCase().includes(marker.keyword.toLowerCase()) &&
          !sections.some(s => s.section === marker.section)) {
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
        break;
      }
    }

    if (currentSection) {
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
