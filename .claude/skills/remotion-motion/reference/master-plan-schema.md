# Master Plan JSON Schema

Definicija formata za `master-plan.json` koji povezuje `remotion-planner` i `remotion-builder`.

---

## Kompletan Format

```json
{
  "meta": {
    "title": "string - Video title",
    "subtitle": "string - Optional subtitle",
    "fps": 30,
    "totalFrames": "number - calculated from voiceover duration",
    "totalDuration": "number - in seconds",
    "hierarchyType": "flat | sticky"
  },

  "voiceover": {
    "file": "voiceover.mp3",
    "duration": "number - seconds",
    "words": [
      {
        "word": "string",
        "start": "number - seconds",
        "end": "number - seconds",
        "startFrame": "number - calculated: start * fps",
        "endFrame": "number - calculated: end * fps"
      }
    ]
  },

  "structure": {
    "stickies": [
      {
        "id": "sticky_1",
        "step": 1,
        "title": "string",
        "color": "#hex color",
        "startFrame": "number - when sticky appears",
        "endFrame": "number - when sticky disappears (optional)",
        "position": {
          "x": "number - canvas position",
          "y": "number - canvas position",
          "width": "number",
          "height": "number"
        },
        "sections": [
          {
            "id": "section_1_1",
            "title": "string",
            "subtitle": "string (optional)",
            "colorKey": "string - for color lookup",
            "startFrame": "number - when section content appears",
            "nodes": [
              {
                "label": "string",
                "icon": "string - icon name",
                "startFrame": "number - when this node appears"
              }
            ]
          }
        ]
      }
    ]
  },

  "camera": {
    "initialPosition": {
      "x": 960,
      "y": 540,
      "scale": 0.7
    },
    "keyframes": [
      {
        "frame": "number",
        "target": "string - segment id or 'overview'",
        "x": "number",
        "y": "number",
        "scale": "number",
        "description": "string - optional comment"
      }
    ]
  },

  "sounds": {
    "points": [
      {
        "frame": "number",
        "type": "title | camera | section",
        "file": "medium-whoosh.mp3 | soft-whoosh.mp3",
        "volume": "number - 0.0 to 1.0"
      }
    ],
    "totalCount": "number - should be <= 10 for 60sec video"
  },

  "lines": {
    "connections": [
      {
        "from": "string - node id",
        "to": "string - node id",
        "startFrame": "number",
        "color": "#hex"
      }
    ]
  }
}
```

---

## Validacija Pravila

### meta
- `fps` mora biti 30
- `totalFrames` = `voiceover.duration * fps`
- `hierarchyType` mora biti "flat" ili "sticky"

### voiceover
- Svaka reč mora imati `startFrame` i `endFrame`
- `startFrame` = Math.round(start * fps)
- Nema praznina > 2 sekunde između reči

### structure
- Ako `hierarchyType === "sticky"` → mora imati `stickies[]`
- Ako `hierarchyType === "flat"` → `stickies[0]` sadrži sve sections bez step
- `startFrame` sticky-ja = 5 frames PRE prvog sadržaja o tom koraku
- `startFrame` sekcije = 5 frames PRE prve reči te sekcije
- `startFrame` noda = stagger (+4-6 frames od prethodnog)

### camera
- Prvi keyframe mora biti frame 0 ili < 30
- Keyframe za sticky = 15 frames PRE sticky.startFrame
- Scale: 0.6-1.2 (ne previše zoomiran)

### sounds
- `totalCount` <= 10 za 60 sec video
- Camera whoosh volume: 0.20-0.30
- Section whoosh volume: 0.10-0.15
- Title whoosh volume: 0.12-0.18
- Gap između sounds: >= 20 frames

---

## Primer: RAG Pipeline

```json
{
  "meta": {
    "title": "RAG Pipeline",
    "subtitle": "Retrieval Augmented Generation",
    "fps": 30,
    "totalFrames": 1200,
    "totalDuration": 40.0,
    "hierarchyType": "sticky"
  },
  "voiceover": {
    "file": "voiceover.mp3",
    "duration": 40.0,
    "words": [
      { "word": "A", "start": 0.1, "startFrame": 3 },
      { "word": "user", "start": 0.2, "startFrame": 6 },
      { "word": "sends", "start": 0.4, "startFrame": 12 },
      { "word": "a", "start": 0.5, "startFrame": 15 },
      { "word": "query", "start": 0.6, "startFrame": 18 }
    ]
  },
  "structure": {
    "stickies": [
      {
        "id": "sticky_1",
        "step": 1,
        "title": "Retrieve",
        "color": "#a855f7",
        "startFrame": 1,
        "position": { "x": 200, "y": 200, "width": 500, "height": 400 },
        "sections": [
          {
            "id": "query",
            "title": "Query",
            "startFrame": 3,
            "nodes": [
              { "label": "User Input", "icon": "user", "startFrame": 6 },
              { "label": "Embed", "icon": "cube", "startFrame": 12 }
            ]
          }
        ]
      }
    ]
  },
  "camera": {
    "initialPosition": { "x": 960, "y": 540, "scale": 0.7 },
    "keyframes": [
      { "frame": 0, "target": "overview", "x": 960, "y": 540, "scale": 0.7 },
      { "frame": 1, "target": "sticky_1", "x": 450, "y": 400, "scale": 1.0 }
    ]
  },
  "sounds": {
    "points": [
      { "frame": 0, "type": "title", "file": "soft-whoosh.mp3", "volume": 0.15 }
    ],
    "totalCount": 1
  }
}
```

---

## Generisanje iz Timestamps

```typescript
// Kalkulacija frames iz timestamps
const wordsWithFrames = words.map(w => ({
  ...w,
  startFrame: Math.round(w.start * fps),
  endFrame: Math.round(w.end * fps)
}));

// Kalkulacija totalFrames
const totalFrames = Math.ceil(voiceoverDuration * fps) + 30; // +30 for outro
```
