# Voice Generation

## Setup

1. Get ElevenLabs API key: https://elevenlabs.io/
2. Set environment variable:
   ```bash
   export ELEVENLABS_API_KEY=your_key_here
   ```

## Generate Voice

```bash
npm install
npm run generate-voice
```

This will:
- Generate `public/voiceover.mp3` - audio file
- Generate `src/voiceover-timestamps.json` - word/section timestamps

## Use in Remotion

```tsx
import { Audio } from "remotion";
import { useVoiceoverSync } from "./useVoiceoverSync";

// In your component:
const { getSectionOpacity, isSectionActive } = useVoiceoverSync();

// Fade in when section starts
const channelsOpacity = getSectionOpacity("CHANNELS");

// Check if section is active
if (isSectionActive("GATEWAY")) {
  // Do something
}

// Add audio to composition
<Audio src={staticFile("voiceover.mp3")} />
```

## Section Names

- `INTRO` - OpenClaw introduction
- `CHANNELS` - WhatsApp, Telegram, Discord, Slack
- `GATEWAY` - WebSocket, Normalizer, Router
- `REASONING` - Claude, GPT, Local LLM
- `MEMORY` - WAL files, context, markdown
- `EXECUTION` - Shell, Python, browser, Docker
- `SESSIONS` - Response routing, cron jobs

## Voice Options

Change `VOICE_ID` in generate-voice.ts:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (clear, professional)
- `EXAVITQu4vr4xnSDxMaL` - Bella (warm, friendly)
- `ErXwobaYiN019PkySvjV` - Antoni (male, professional)

Full list: https://api.elevenlabs.io/v1/voices
