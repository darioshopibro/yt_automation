# Voiceover Sync Reference

ElevenLabs voice generation i sinhronizacija sa animacijama.

> **ZAPAMTI:** Ovo je deo JEDNE KOMPOZICIJE - voiceover timing određuje camera i element animacije.

---

## ELEVENLABS SETUP

### API Call
```bash
export ELEVENLABS_API_KEY=your_key_here
npm run generate-voice
```

### Voice Settings (TESTIRANO)
```tsx
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";  // Rachel

const voiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

const model = "eleven_turbo_v2_5";
```

### Voice Options
| Voice | ID | Style |
|-------|-----|-------|
| Rachel | `21m00Tcm4TlvDq8ikWAM` | Clear, professional female |
| Bella | `EXAVITQu4vr4xnSDxMaL` | Warm, friendly female |
| Antoni | `ErXwobaYiN019PkySvjV` | Professional male |

---

## TIMESTAMPS ENDPOINT

```tsx
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
      voice_settings: voiceSettings,
    }),
  }
);

// Response:
// - audio_base64: MP3 audio
// - alignment.characters[]: svaki karakter sa start/end time
```

---

## TIMESTAMPS JSON FORMAT

```json
{
  "words": [
    { "word": "Channels.", "start": 0, "end": 0.813, "startFrame": 0, "endFrame": 24 },
    { "word": "WhatsApp.", "start": 1.022, "end": 1.811, "startFrame": 31, "endFrame": 54 }
  ],
  "sections": [
    { "section": "CHANNELS", "startFrame": 0, "endFrame": 224, "words": [...] },
    { "section": "GATEWAY", "startFrame": 235, "endFrame": 512, "words": [...] }
  ],
  "fps": 30
}
```

---

## SYNC PRAVILA

### Element Animations
```
Element pojavi se 3-5 frames PRE reči (vizual anticipira audio)
```

```tsx
// Frame kad narator kaže "WhatsApp" = 31, element se pojavi na 28
const whatsappAppear = interpolate(frame, [28, 43], [0, 1], { extrapolateRight: 'clamp' });
```

---

## SCRIPT WRITING

```tsx
// PUNCHY - kratke rečenice, bez intro/outro
const SCRIPT = `
Channels. WhatsApp. Telegram. Discord. Slack. One codebase handles all of them.

Gateway layer. WebSocket receives messages in real-time.

Memory System. WAL files for recovery. Everything persists.
`.trim();
```

**PRAVILO**: Kratke rečenice = brži tempo = bolji engagement!

---

## ADD AUDIO TO COMPONENT

```tsx
import { Audio, staticFile } from "remotion";

// U komponenti:
<Audio src={staticFile("voiceover.mp3")} />
```

---

## ROOT.TSX SETUP

```tsx
import { Composition } from "remotion";
import { MyAnimation } from "./MyAnimation";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MyAnimation"
    component={MyAnimation}
    durationInFrames={600}  // 20 sec @ 30fps
    fps={30}
    width={1920}
    height={1080}
  />
);
```

---

## WORKFLOW

1. **Napisati script** (kratke rečenice)
2. **Generate voice** sa timestamps
3. **Plan camera keyframes** prema sections
4. **Plan element animations** prema words
5. **Add sounds** prema camera keyframes
6. **Build komponente**
7. **Test sync** i adjust

---

## COMMON ERRORS

| Simptom | Uzrok | Fix |
|---------|-------|-----|
| Voice bugs out | Loši voice settings | Rachel + standard settings |
| Audio desync | Pogrešni frame offsets | Check timestamps JSON |
| Elementi kasne | Nema anticipation | Element 3-5 frames PRE reči |
| Camera kasni | Nema anticipation | Camera 15 frames PRE sekcije |
