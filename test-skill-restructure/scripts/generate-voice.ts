/**
 * ElevenLabs Voice Generator with Timestamps
 * DATA PIPELINES - ETL Flow (~50 seconds)
 */

import fs from "fs";
import path from "path";

const ELEVENLABS_API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998";
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel

// Data Pipelines - ETL explained (~50 sec)
const SCRIPT = `
Data in organizations starts out in many places. It's in data lakes, different databases, SaaS applications, and we also have streaming data coming in real time from sensors and factories.

To make this data useful, we use ETL which stands for Extract, Transform, and Load.

First, we Extract data from all these different sources.

Then we Transform it by cleaning up mismatching data, taking care of missing values, getting rid of duplicates, and making sure the columns are correct.

Finally, we Load this clean data into a destination repository, like an enterprise data warehouse.

Once the data is ready, we can use it for business intelligence dashboards, machine learning models, and other analytics applications.

This is how data pipelines work. They take raw data from many sources and turn it into clean, ready-to-use business data.
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

async function generateVoice() {
  console.log("Generating voice with ElevenLabs...");
  console.log(`Script length: ${SCRIPT.split(' ').length} words`);

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

  const data = await response.json() as any;

  // Save audio
  const audioBuffer = Buffer.from(data.audio_base64, "base64");
  const audioPath = path.join(__dirname, "..", "public", "voiceover.mp3");
  fs.mkdirSync(path.dirname(audioPath), { recursive: true });
  fs.writeFileSync(audioPath, audioBuffer);
  console.log(`Audio saved: ${audioPath}`);

  // Process timestamps
  const FPS = 30;
  const words = extractWords(data.alignment, FPS);

  // Save timestamps JSON
  const timestampsPath = path.join(__dirname, "..", "src", "voiceover-timestamps.json");
  fs.writeFileSync(
    timestampsPath,
    JSON.stringify({ words, fps: FPS }, null, 2)
  );
  console.log(`Timestamps saved: ${timestampsPath}`);

  // Print key word timings for manual master-plan creation
  console.log("\n--- KEY WORD TIMINGS ---");
  const keyPhrases = ["extract", "transform", "load", "business intelligence", "machine learning"];

  for (const phrase of keyPhrases) {
    const wordObj = words.find(w => w.word.toLowerCase().includes(phrase.toLowerCase()));
    if (wordObj) {
      console.log(`"${wordObj.word}": ${wordObj.start.toFixed(2)}s (frame ${wordObj.startFrame})`);
    }
  }

  const totalDuration = words[words.length - 1]?.end || 0;
  const totalFrames = Math.ceil(totalDuration * FPS);
  console.log(`\nTotal duration: ${totalDuration.toFixed(2)}s (${totalFrames} frames)`);
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

generateVoice().catch(console.error);
