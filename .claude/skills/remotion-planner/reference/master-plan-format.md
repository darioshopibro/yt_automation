# Master-plan.json Format

```
totalFrames = Math.ceil(voiceover_duration_seconds * fps) + 30
```

```json
{
  "meta": {
    "title": "Video Title",
    "fps": 30,
    "totalFrames": 1395,
    "totalDuration": 46.5
  },
  "voiceover": {
    "file": "voiceover.mp3",
    "duration": 40.0,
    "words": [
      { "word": "User", "start": 0.5, "end": 0.7, "startFrame": 15, "endFrame": 21 }
    ]
  },
  "structure": {
    "segments": [
      {
        "id": "segment_1",
        "step": 1,
        "title": "The Hook",
        "beatType": "ai_video",
        "startFrame": 0,
        "endFrame": 150,
        "aiVideoPrompt": "Cinematic close-up of programmer staring at screen, dramatic lighting, code reflections in glasses",
        "transcriptSegment": "Every developer thinks AI is making them faster...",
        "timestamps": [
          { "word": "Every", "start": 0.1, "startFrame": 3 }
        ]
      },
      {
        "id": "segment_2",
        "step": 2,
        "title": "How Docker Works",
        "beatType": "motion_graphics",
        "startFrame": 150,
        "endFrame": 900,
        "componentPath": "src/visuals/Generated_HowDockerWorks.tsx",
        "transcriptSegment": "Here's how a Docker container is born...",
        "timestamps": [
          { "word": "Docker", "start": 5.52, "startFrame": 166 }
        ]
      },
      {
        "id": "segment_3",
        "step": 3,
        "title": "The Reality Check",
        "beatType": "meme",
        "startFrame": 900,
        "endFrame": 990,
        "meme": {
          "name": "This Is Fine",
          "reason": "developer debugging Docker networking",
          "durationFrames": 60
        },
        "transcriptSegment": "And then you try to debug networking...",
        "timestamps": [
          { "word": "debug", "start": 30.1, "startFrame": 903 }
        ]
      }
    ]
  }
}
```
