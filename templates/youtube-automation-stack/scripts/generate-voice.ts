/**
 * ElevenLabs Voice Generator with Timestamps
 * YouTube Automation Stack - Budget vs Standard vs Pro
 *
 * Usage:
 *   npx tsx scripts/generate-voice.ts
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// YouTube Automation Stack - Budget vs Standard vs Pro comparison
const SCRIPT = `
let me show you the three tiers of youtube automation. the budget tier costs around fifty dollars per month. you start with ChatGPT for writing scripts, then use ElevenLabs for voice generation, and finally InVideo AI to put it all together. simple and effective.

the standard tier runs about ninety dollars monthly. you get all the budget tools plus Canva Pro for thumbnails and TubeBuddy for SEO optimization. this combo gives you professional looking content with better discoverability.

the pro tier starts at one hundred fifty dollars and up. this is where HeyGen comes in for AI avatars. then you add n8n workflows to automate the entire process. schedule everything, auto publish, and scale your channel hands free.
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
    const cameraFrame = section.startFrame - 15;
    const sectionFrame = section.startFrame - 5;
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

  // Generate dynamic-config.json update suggestions
  console.log("\n=== SUGGESTED dynamic-config.json startFrames ===\n");
  sections.forEach((section) => {
    console.log(`"${section.section}": startFrame: ${section.startFrame - 5}`);
  });
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

  // YouTube Automation Stack section markers
  const sectionMarkers = [
    // Budget $50 tier
    { keyword: "budget tier", section: "BUDGET_INTRO" },
    { keyword: "ChatGPT for writing", section: "BUDGET_SCRIPT" },
    { keyword: "ElevenLabs for voice", section: "BUDGET_VOICE" },
    { keyword: "InVideo AI", section: "BUDGET_VIDEO" },

    // Standard $90 tier
    { keyword: "standard tier", section: "STANDARD_INTRO" },
    { keyword: "Canva Pro", section: "STANDARD_TOOLS" },
    { keyword: "TubeBuddy", section: "STANDARD_EXTRAS" },

    // Pro $150+ tier
    { keyword: "pro tier", section: "PRO_INTRO" },
    { keyword: "HeyGen", section: "PRO_AVATAR" },
    { keyword: "n8n workflows", section: "PRO_AUTOMATION" },
  ];

  let currentSection: SectionTimestamp | null = null;
  let fullText = "";

  for (const word of words) {
    fullText += word.word.toLowerCase() + " ";

    for (const marker of sectionMarkers) {
      if (fullText.includes(marker.keyword) &&
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

    if (currentSection && !sectionMarkers.some(m =>
      fullText.includes(m.keyword) && !sections.some(s => s.section === m.section)
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
