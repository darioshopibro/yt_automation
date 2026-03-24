/**
 * ElevenLabs Voice Generator with Timestamps
 * RAG Pipeline - from ByteMonk transcript
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_xxx npx ts-node scripts/generate-voice.ts
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// YouTube Success Patterns - Branding, Content, Production
const SCRIPT = `
YouTube success comes down to three pillars. First is branding. Your channel needs a memorable name. A logo that works at thumbnail size. And a consistent color palette across all visuals.

Second pillar is content strategy. You need a content calendar to stay consistent. Strong hooks in the first five seconds. And clear calls to action at the end.

Third pillar is production quality. Good audio is more important than video. Use proper lighting to look professional. And edit with a fast pace to maintain attention.

Master these three pillars and your channel will grow.
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
          stability: 0.75,        // Higher = less variation, more natural
          similarity_boost: 0.5,  // Lower = less "acting", more neutral
          style: 0.0,             // No style exaggeration
          use_speaker_boost: false, // Off = less AI-ish
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
  console.log(`\nKopiraj gornje frame brojeve u RAGPipeline.tsx!`);
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

  // YouTube Success Patterns section markers
  const sectionMarkers = [
    { keyword: "three pillars", section: "INTRO" },
    { keyword: "First is branding", section: "BRANDING" },
    { keyword: "memorable name", section: "BRANDING_NAME" },
    { keyword: "thumbnail size", section: "BRANDING_LOGO" },
    { keyword: "color palette", section: "BRANDING_COLORS" },
    { keyword: "Second pillar is content", section: "CONTENT" },
    { keyword: "content calendar", section: "CONTENT_CALENDAR" },
    { keyword: "Strong hooks", section: "CONTENT_HOOKS" },
    { keyword: "calls to action", section: "CONTENT_CTA" },
    { keyword: "Third pillar is production", section: "PRODUCTION" },
    { keyword: "Good audio", section: "PRODUCTION_AUDIO" },
    { keyword: "proper lighting", section: "PRODUCTION_LIGHTING" },
    { keyword: "fast pace", section: "PRODUCTION_EDITING" },
    { keyword: "channel will grow", section: "OUTRO" },
  ];

  let currentSection: SectionTimestamp | null = null;
  let fullText = "";

  for (const word of words) {
    fullText += word.word + " ";

    for (const marker of sectionMarkers) {
      if (fullText.endsWith(marker.keyword + " ") ||
          fullText.endsWith(marker.keyword + ". ")) {
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

    if (currentSection && !sectionMarkers.some(m =>
      fullText.endsWith(m.keyword + " ") || fullText.endsWith(m.keyword + ". ")
    )) {
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
