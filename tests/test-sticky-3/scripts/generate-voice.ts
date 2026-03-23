/**
 * ElevenLabs Voice Generator with Timestamps
 * OAuth Authorization Code Flow - from ByteMonk transcript
 *
 * Usage:
 *   npx ts-node scripts/generate-voice.ts
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// OAuth Authorization Code Flow - ByteMonk
// Kopiran 1:1 iz YouTube transkripta
const SCRIPT = `
the user visits the application website and clicks on a button to log in with Google the application redirects the user to the Google authorization server the Google authorization server asks the user to log in to their Google account the user enters the username and password and clicks the allow button the Google authorization server generates an access token and redirects the user back to the applications website the application receives the access token and stores it in its database the application uses the access token to make requests to Google's apis
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
    console.log(`${section.section}:`);
    console.log(`  Word at: frame ${section.startFrame} (${section.start.toFixed(2)}s)`);
    console.log("");
  });

  const totalDuration = words[words.length - 1]?.end || 0;
  console.log(`Total duration: ${totalDuration.toFixed(2)}s (${Math.ceil(totalDuration * FPS)} frames)`);
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

  // OAuth Flow section markers - matching exact transcript
  // Grupisano u 2 Sticky-a: Request (3 sekcije) i Response (3 sekcije)
  const sectionMarkers = [
    // Sticky 1: Request
    { keyword: "visits the application", section: "USER_VISIT" },
    { keyword: "clicks on a button", section: "CLICK_LOGIN" },
    { keyword: "redirects the user to the Google", section: "REDIRECT_AUTH" },
    // Sticky 2: Authenticate
    { keyword: "asks the user to log in", section: "GOOGLE_LOGIN" },
    { keyword: "enters the username", section: "ENTER_CREDS" },
    { keyword: "clicks the allow", section: "CLICK_ALLOW" },
    // Sticky 3: Token
    { keyword: "generates an access token", section: "GENERATE_TOKEN" },
    { keyword: "receives the access token", section: "RECEIVE_TOKEN" },
    { keyword: "uses the access token", section: "API_REQUESTS" },
  ];

  let currentSection: SectionTimestamp | null = null;
  let fullText = "";
  const usedMarkers = new Set<string>();

  for (const word of words) {
    fullText += word.word.toLowerCase() + " ";

    for (const marker of sectionMarkers) {
      if (fullText.includes(marker.keyword.toLowerCase()) && !usedMarkers.has(marker.section)) {
        if (currentSection) {
          sections.push(currentSection);
        }
        usedMarkers.add(marker.section);

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
