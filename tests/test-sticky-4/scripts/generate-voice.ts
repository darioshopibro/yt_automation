/**
 * ElevenLabs Voice Generator with Timestamps
 * DNS Resolution Flow - from Fireship transcript
 *
 * Usage:
 *   npx ts-node scripts/generate-voice.ts
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// DNS Resolution Flow - Fireship
// Kopiran 1:1 iz YouTube transkripta
const SCRIPT = `
when you type a url into the browser it makes a dns query to figure out which unique ip address is associated with that hostname first it'll attempt to look in the local browser or operating system cache but if the cache is empty then we need to look up the ip address in the phone book which is the job of a server known as the dns recursive resolver it's recursive because it needs to make multiple requests to other servers starting with the root name server which itself will respond with the address of a top level domain dns server which stores data about top level domains like com or dot io the resolver makes a request there which will respond with the ip address of the authoritative name server that's the final source of truth that contains the requested website's ip address that gets sent back down to the client and is cached for future use
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

  // DNS Flow section markers - matching exact transcript
  // Grupisano u 2 Sticky-a: Query (3 sekcije) i Resolution (3 sekcije)
  const sectionMarkers = [
    // Sticky 1: Query
    { keyword: "type a url into the browser", section: "BROWSER_QUERY" },
    { keyword: "dns query", section: "DNS_QUERY" },
    { keyword: "local browser or operating system cache", section: "CACHE_CHECK" },
    // Sticky 2: Resolver
    { keyword: "dns recursive resolver", section: "RECURSIVE_RESOLVER" },
    { keyword: "root name server", section: "ROOT_SERVER" },
    { keyword: "top level domain", section: "TLD_SERVER" },
    // Sticky 3: Response
    { keyword: "authoritative name server", section: "AUTH_SERVER" },
    { keyword: "final source of truth", section: "FINAL_IP" },
    { keyword: "cached for future use", section: "CACHE_RESULT" },
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
