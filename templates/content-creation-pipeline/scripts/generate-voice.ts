/**
 * ElevenLabs Voice Generator with Timestamps
 * Content Creation Pipeline - 4 Steps
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_xxx npx ts-node scripts/generate-voice.ts
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// Content Creation Pipeline - 4 Steps
const SCRIPT = `
Every viral video starts the same way. Research. You dive into trending topics, analyze competitors, and extract what actually works. That's step one, idea mining.

Step two is scriptwriting. You take those insights and craft a narrative. Hook, body, call to action. The script is your blueprint.

Step three is production. Record the footage, capture b-roll, design thumbnails. Everything visual comes together here.

Finally, step four. Publishing. Schedule the upload, write SEO-optimized descriptions, push to socials. Your content goes live.

Four steps. Research to publish. That's the content creation pipeline.
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
  console.log(`\nKopiraj gornje frame brojeve u DynamicPipeline.tsx!`);
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

  // Content Creation Pipeline section markers
  const sectionMarkers = [
    { keyword: "Research", section: "STEP1_RESEARCH" },
    { keyword: "idea mining", section: "STEP1_IDEAMINING" },
    { keyword: "scriptwriting", section: "STEP2_SCRIPTWRITING" },
    { keyword: "Hook", section: "STEP2_HOOK" },
    { keyword: "production", section: "STEP3_PRODUCTION" },
    { keyword: "Record", section: "STEP3_RECORD" },
    { keyword: "Publishing", section: "STEP4_PUBLISHING" },
    { keyword: "Schedule", section: "STEP4_SCHEDULE" },
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
