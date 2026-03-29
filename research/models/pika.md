# Pika AI - Complete Research Document

> Last updated: 2026-03-29

---

## Table of Contents

1. [Models & Versions](#models--versions)
2. [All Features](#all-features)
3. [All Settings & Parameters](#all-settings--parameters)
4. [API Access](#api-access)
5. [UI vs API Differences](#ui-vs-api-differences)
6. [Limitations](#limitations)
7. [Pricing](#pricing)
8. [Best Practices](#best-practices)

---

## Models & Versions

### Version History

| Version | Release | Key Addition | Resolution | Max Duration |
|---------|---------|-------------|------------|-------------|
| Pika 1.0 | Late 2023 | First public release, text-to-video & image-to-video | 720p | 3-4 sec |
| Pika 1.5 | Mid 2024 | Pikaffects (special effects), physics-defying effects | 720p | 4 sec |
| Pika 2.0 | Dec 2024 | Scene Ingredients, templates, major realism boost | 720p | 5 sec |
| Pika 2.1 | Jan 2025 | HD output, expanded animation styles (3D, anime, cinematic) | 1080p | 5 sec |
| Pika 2.2 | Feb 2025 | Pikaframes (keyframe control), 10-sec duration, 1080p | 1080p | 10 sec |
| Pika 2.5 | Early 2026 | Physics-based interaction, scene extension, upgraded lip-sync, better temporal consistency | 1080p | 10-15 sec |

### Differences Between Versions

**Pika 1.0 -> 1.5:**
- Added Pikaffects (melt, explode, inflate, crush, etc.)
- Physics-defying special effects on existing video/images
- Same resolution and duration

**Pika 1.5 -> 2.0:**
- Major realism and motion quality boost
- Introduced "Scene Ingredients" (reference images for characters, objects, scenes)
- Templates for common video styles
- Expanded Pikaffects library
- Still had physics quirks and morphing issues

**Pika 2.0 -> 2.1:**
- HD 1080p output
- Expanded animation styles: 3D, anime, cinematic realism
- Better visual quality overall
- Higher credit cost (35 credits per generation)

**Pika 2.1 -> 2.2:**
- Pikaframes: keyframe transition control (upload start + end images)
- Extended duration up to 10 seconds
- Much better credit efficiency (6-18 credits vs 35 in 2.1)
- Sharper visuals, smoother motion, more natural physics

**Pika 2.2 -> 2.5:**
- Physics-based interaction (objects interact realistically)
- Scene extension (continue a video seamlessly from its last frames)
- Upgraded lip-sync with complex facial expressions
- Auto sound effect generation
- Better texture rendering, more reliable face generation
- Improved prompt adherence
- Faster generation speeds

### Currently Available Models (as of March 2026)

- **Pika 2.5** - Latest, best quality + physics
- **Pika 2.2** - High quality, Pikaframes support
- **Turbo** - Fast generation, lower quality (good for drafts)
- **Pro** - Higher quality, slower generation

---

## All Features

### 1. Text-to-Video
Generate video from a text prompt. Available in all versions. Pika 2.2+ supports 720p/1080p and up to 10 seconds.

### 2. Image-to-Video
Upload a static image, add a prompt describing desired motion, and Pika animates it. One of the strongest features - maintains image fidelity well.

### 3. Pikaframes (Keyframe Control) - v2.2+
- Upload a **start image** and an **end image**
- Pika generates the transition video between them
- Duration control: 1 to 10 seconds (up to 25 seconds on paid plans)
- Supports up to **5 keyframes** on the API (fal.ai)
- Great for: morphing, scene transitions, controlled animations

### 4. Scene Ingredients / Pikascenes - v2.0+
Semi-structured composition system. Instead of one long prompt, you define:
- **Background/Setting:** "Neon-lit alley in Tokyo", "Abandoned spaceship corridor"
- **Characters/Subjects:** "A girl in a red dress", "A robot bartender"
- **Objects:** "A floating orb", "Books scattered on the ground"
- **Mood/Lighting:** "Dark and stormy", "Soft golden hour glow"
- **Motion/Camera:** "Slow zoom-in", "Character walks toward camera"

Solves prompt confusion by breaking vision into structured fields. Can use reference images for characters, objects, and backgrounds.

### 5. Pikaffects (Special Effects) - v1.5+
One-click AI effects applied to video/images. AI identifies subjects and applies transformation.

**Classic Effects:**
- Squish it, Inflate it, Melt it, Explode it, Crush it
- Cake-ify it, Crumble it, Dissolve it, Deflate it
- Levitate it, Eye Pop it, Ta-da it, Decapitate it

**Advanced Effects (27+ total):**
- Bullet Time, Whip Pans, Crane Shots
- Transformation effects (person into different character/scene)
- Halloween-themed effects (seasonal)

**Access:** 10 basic effects on free tier, all 27+ on paid plans.

### 6. Pikaswaps (Object Replacement) - v2.0+
Replace specific elements in a video:
- Select element with brush or prompt
- Replace with new object/person/background via text prompt or reference image
- Preserves lighting, motion, and perspective of original video

### 7. Pikadditions (Add Elements) - v2.0+
Insert new objects, characters, or elements into existing video:
- Upload video + prompt/reference image of what to add
- AI blends new element matching lighting, motion, perspective

### 8. Pikatwists (Surprise Edits) - v2.0+
Add unexpected twist/change to beginning or end of a video clip:
- Upload clip + text description of the twist
- AI edits the opening/closing seconds, leaves rest intact
- Great for memes, story punchlines, reveals

### 9. Camera Control
Prompt-based camera direction. Supported movements:

| Movement | Command | Options |
|----------|---------|---------|
| **Zoom** | `-camera zoom` | `in`, `out` |
| **Pan** | `-camera pan` | `up`, `down`, `left`, `right` (can combine 2: `up right`) |
| **Rotate** | `-camera rotate` | `clockwise`/`cw`, `counterclockwise`/`ccw`/`acw` |

**Limitation:** Only ONE camera movement type per generation (cannot stack zoom + pan).

Can also use natural language in prompt: "slow push-in", "dolly zoom", "tracking shot", "aerial shot", "crane up", "orbit around".

### 10. Lip Sync / Pikaformance - v2.5+
- Turn still images into talking/singing characters
- Upload image + audio clip
- AI analyzes waveform and transcript
- Generates accurate lip movements synced to speech
- Supports complex facial expressions
- Near real-time generation speed
- Competes with HeyGen for character content

### 11. Sound Effects Generation - v2.5+
Two modes:
- **Contextual:** AI automatically generates matching sounds for the action (car crash = metal crunch)
- **Manual:** Add specific AI-generated sounds after generation via text prompt (e.g., "sizzling bacon", "engine noise", "eagle screaming")

### 12. Extend Video
- One-click continuation of any clip
- Uses final frames as conditioning context for next segment
- Maintains character positions, lighting, camera angle, environment
- No strict length limit but quality degrades with repeated extensions

### 13. Reprompt
- Alter initial prompt while maintaining some aspects of generated video
- Useful for iterating without starting from scratch

### 14. Style Transfer / Reference
- Use reference images to guide style, characters, objects, backgrounds
- Integrated into Scene Ingredients system

---

## All Settings & Parameters

### Core Parameters

| Parameter | Options | Default | Notes |
|-----------|---------|---------|-------|
| **Resolution** | 720p, 1080p | 720p | 1080p requires paid plan |
| **Duration** | 5s, 10s (up to 25s for Pikaframes) | 5s | 10s costs more credits |
| **Aspect Ratio** | 16:9, 9:16, 1:1, 4:5, 5:4, 3:2, 2:3 | 16:9 | 7 options total |
| **Motion Strength** | 0-4 (integer) | 1 | `-motion` parameter, controls intensity of movement |
| **FPS** | 8-24 | 24 | `-fps` parameter |
| **Seed** | Any integer | Random | `-seed` for reproducibility. Only works if prompt + neg prompt unchanged |
| **Negative Prompt** | Text | None | `-neg` parameter. What NOT to include |
| **Camera** | zoom/pan/rotate | None | `-camera` parameter |

### Negative Prompt Best Practices
Recommended starter set for realism:
```
-neg blurry, noisy, text, watermark, distorted, jitter, flicker
```
Keep negative prompts tight and concise. Overly general terms can block needed data.

### Credit Cost Per Generation (Pika 2.2)

| Type | Credits |
|------|---------|
| Image/Text-to-Video (5s, 720p) | ~6 credits |
| Image/Text-to-Video (10s, 1080p) | ~18 credits |
| Pika 2.1 generation | ~35 credits |

---

## API Access

### Official API: fal.ai Integration

Pika's official API is hosted on **fal.ai**. No direct pika.art REST API -- you call fal's model endpoints.

**Authentication:**
```bash
export FAL_KEY="your-fal-api-key"
```

**Client Library:**
```bash
npm install --save @fal-ai/client
# or
pip install fal-client
```

### Available Endpoints

| Endpoint | URL Path | Description |
|----------|----------|-------------|
| Text-to-Video v2.2 | `fal-ai/pika/v2.2/text-to-video` | Text prompt to video |
| Image-to-Video v2.2 | `fal-ai/pika/v2.2/image-to-video` | Static image to video |
| Pikascenes v2.2 | `fal-ai/pika/v2.2/pikascenes` | Multi-reference scene composition |
| Pikaframes v2.2 | `fal-ai/pika/v2.2/pikaframes` | Keyframe interpolation (up to 5 frames) |
| Image-to-Video Turbo v2 | `fal-ai/pika/v2/turbo/image-to-video` | Fast draft quality |
| Text-to-Video v2.1 | `fal-ai/pika/v2.1/text-to-video` | Previous version |

### API Request Flow
1. Submit request with input parameters
2. fal queues the job
3. Async processing on GPU
4. Client library returns result when finished

### API Parameters (Text-to-Video v2.2)
```json
{
  "prompt": "string (required)",
  "resolution": "720 | 1080",
  "aspect_ratio": "16:9 | 9:16 | 1:1 | 4:5 | 5:4 | 3:2 | 2:3",
  "duration": 5 | 10
}
```

### API Parameters (Image-to-Video v2.2)
```json
{
  "image_url": "string (required)",
  "prompt": "string",
  "resolution": "720 | 1080",
  "duration": 5 | 10
}
```

### API Parameters (Pikaframes v2.2)
```json
{
  "images": ["url1", "url2", ... up to 5],
  "prompt": "string",
  "duration": 1-25
}
```

### API Parameters (Pikascenes v2.2)
```json
{
  "images": ["url1", "url2", ...],
  "prompt": "string",
  "resolution": "720 | 1080",
  "duration": 5 | 10
}
```

### API Pricing (fal.ai)

| Resolution | Cost |
|------------|------|
| 720p | $0.04 / second of video |
| 1080p | $0.06 / second of video |
| Minimum charge | 5 seconds |

**Examples:**
- 5s 720p video = $0.20
- 10s 720p video = $0.40
- 5s 1080p video = $0.30
- 10s 1080p video = $0.60

### Third-Party API Providers

| Provider | Notes |
|----------|-------|
| **fal.ai** (Official) | Primary API host, self-serve, well-documented |
| **API Glue (pikapikapika.io)** | Unofficial wrapper, full feature access including Regenerate, Shuffle, Remix |
| **useapi.net** | Experimental API, wraps around Pika's Discord bot |
| **Pollo AI (docs.pollo.ai)** | Third-party documentation for Pika v2.2 |
| **PiAPI (piapi.ai)** | Third-party API for Pikaffects (crush, melt effects) |

**Note:** Pika is NOT available on Replicate as of March 2026.

### Adobe Firefly Integration
Pika 2.2 is integrated into Adobe Firefly Video Editor as a generation option.

---

## UI vs API Differences

| Feature | Web UI (pika.art) | API (fal.ai) |
|---------|-------------------|--------------|
| Text-to-Video | Yes | Yes |
| Image-to-Video | Yes | Yes |
| Pikaframes | Yes | Yes (up to 5 keyframes) |
| Pikascenes | Yes | Yes |
| Pikaffects | Yes | **NO** |
| Pikaswaps | Yes | **NO** |
| Pikadditions | Yes | **NO** |
| Pikatwists | Yes | **NO** |
| Lip Sync | Yes | **NO** |
| Sound Effects | Yes | **NO** |
| Extend Video | Yes | **NO** |
| Reprompt | Yes | **NO** |
| Camera Control | Via prompt text | Via prompt text |
| Motion Strength | Slider | Not documented in API |
| Negative Prompt | UI field | Not documented in API |
| Seed | UI field | Not documented in API |
| Batch Processing | No | Yes (queue multiple requests) |
| Webhooks | No | Yes (fal.ai supports webhooks) |

**Key Takeaway:** The API only covers core generation (text-to-video, image-to-video, scenes, frames). All the creative editing tools (Pikaffects, Pikaswaps, Pikadditions, Pikatwists, lip sync, sound FX) are **UI-only** as of March 2026.

---

## Limitations

### Duration Limits
- Single generation: 5-10 seconds (standard), up to 25 seconds (Pikaframes)
- Extension available but quality degrades with repeated use
- No native long-form video generation (1+ minute)

### Quality Issues
- Distorted faces on some generations
- Unnatural movements (especially hands, fingers)
- AI sometimes ignores parts of prompts
- Physics inconsistencies (improved in 2.5 but not eliminated)
- Morphing artifacts between scenes

### Queue Times
- **Paid users:** Prioritized, essentially no wait time
- **Free users:** Can be 6-7 hours for Scene Ingredient generations during peak times
- Peak times cause delays even for paid users occasionally

### Rate Limits
- Not clearly documented in API
- Vague error messages ("generation failed" without specifics)
- Free tier: 80 credits/month cap
- Credit-based throttling on all plans

### Resolution Limits
- Maximum 1080p (no 4K)
- Free tier capped at 480p (Pika 2.5 free)
- 720p is the free ceiling for older models

### Camera Control Limits
- Only one camera movement per generation
- Cannot combine zoom + pan + rotate simultaneously

### Other Known Issues
- Watermark on all free-tier videos
- No real-time generation (async queue system)
- Seed reproducibility only works with identical prompt + negative prompt
- Generated audio/sound effects are basic compared to dedicated audio tools

---

## Pricing

### Subscription Plans (March 2026)

| Plan | Monthly (Yearly Billing) | Credits/Month | Resolution | Models | Watermark | Commercial Use |
|------|--------------------------|---------------|------------|--------|-----------|----------------|
| **Basic (Free)** | $0 | 80 | 480p (2.5 only) | Pika 2.5, Turbo, limited Pikaffects | Yes | No |
| **Standard** | $8/mo | 700 | Up to 1080p | All models (1.0, 1.5, 2.1, 2.2, 2.5, Turbo, Pro) | No | Yes |
| **Pro** | $28/mo | 2,300 | Up to 1080p | All models, all Pikaffects, faster generation | No | Yes |
| **Fancy** | $76/mo | 6,000 | Up to 1080p | All models, all Pikaffects, fastest generation | No | Yes |

### Billing Notes
- **Yearly billing = 20% discount** vs monthly
- Monthly plan credits do NOT roll over
- Purchased extra credits DO roll over (never expire)
- Extra credit packs available on Standard+ plans

### Credit Efficiency (Estimated)
- Standard (700 credits): ~10-30 usable videos/month (~$0.33-$1.00/video)
- Pro (2,300 credits): ~30-100 usable videos/month
- Fancy (6,000 credits): ~80-250 usable videos/month

### API Pricing (fal.ai) - Pay-per-use
- 720p: $0.04/second (min 5s = $0.20 minimum)
- 1080p: $0.06/second (min 5s = $0.30 minimum)
- No subscription needed, pure usage-based

### Cost Comparison: Subscription vs API

| Scenario | Subscription Cost | API Cost |
|----------|-------------------|----------|
| 50 videos/month (5s, 720p) | $8/mo (Standard) | $10/mo |
| 100 videos/month (5s, 720p) | $28/mo (Pro) | $20/mo |
| 200 videos/month (10s, 1080p) | $76/mo (Fancy) | $120/mo |

**Verdict:** Subscription is better for heavy UI users. API is better for programmatic/batch workflows or light usage.

---

## Best Practices

### Prompt Structure
1. **One subject + one action + simple background** - Keep it focused
2. **Start with dynamic verbs:** "running", "dancing", "jumping"
3. **Use cinema language:** "golden hour", "aerial shot", "dolly zoom", "slow push-in", "tracking shot"
4. **Always mention:** light, weather, mood (foggy, rainy, warm, moody)
5. **Be specific about motion:** "Hair flowing gently in the wind" not "add movement"

### Prompt Template
```
[Subject doing action], [environment/setting], [lighting/mood], [camera direction]
```

**Example:**
```
A woman in a red dress walking through a neon-lit Tokyo alley at night,
rain-soaked streets reflecting colorful signs, moody cinematic lighting,
slow tracking shot following from behind
```

### Camera Tips
- Give clear camera instructions: "push in", "pan left", "orbit around", "crane up"
- Treat it like directing a cinematographer
- Use only ONE camera movement per generation

### Motion Graphics Style Tips
- Use `-motion 2` or `-motion 3` for more dynamic movement (default 1 is subtle)
- For motion graphics/kinetic text: describe the graphic elements explicitly
- Use image-to-video with designed frames for best motion graphics results
- Pikaframes is ideal for controlled motion graphics (design start + end states)

### Iteration Strategy
1. Use **Turbo mode** for quick drafts and testing prompts
2. Use **Pro model** for final renders
3. Change only ONE thing at a time (camera, style, or action)
4. Prompt variations produce big differences - experiment

### Negative Prompt Strategy
Start minimal:
```
-neg blurry, noisy, text, watermark, distorted, jitter, flicker
```
Add specifics as needed. Avoid overly general terms that block useful data.

### Consistency Tips
- Use same seed value for related generations (only works with identical prompt + neg)
- Use Scene Ingredients with reference images for character consistency
- Image-to-video gives more consistent results than pure text-to-video
- Pikaframes with designed keyframes gives most control over output

### Platform-Specific Settings
| Platform | Aspect Ratio | Notes |
|----------|-------------|-------|
| YouTube | 16:9 | Standard horizontal |
| TikTok / Reels / Shorts | 9:16 | Vertical, max impact |
| Instagram Feed | 1:1 or 4:5 | Square or portrait |
| Twitter / X | 16:9 or 1:1 | Horizontal or square |

### When to Use Each Feature
| Goal | Best Feature |
|------|-------------|
| Quick video from idea | Text-to-Video |
| Animate a designed frame | Image-to-Video |
| Controlled transition/morph | Pikaframes |
| Complex scene with references | Pikascenes / Scene Ingredients |
| Fun effects for social | Pikaffects |
| Replace element in existing video | Pikaswaps |
| Add character/object to video | Pikadditions |
| Meme / punchline twist | Pikatwists |
| Talking head from image | Lip Sync / Pikaformance |
| Add audio to silent clip | Sound Effects |

---

## Sources

- [ImagineArt - Pika 2.2 Features](https://www.imagine.art/features/pika-2-2)
- [AIBase - Pika 2.2 Release](https://test-news.aibase.com/news/15808)
- [fal.ai - Pika API Blog Post](https://blog.fal.ai/pika-api-is-now-powered-by-fal/)
- [fal.ai - Pika v2.2 Text-to-Video](https://fal.ai/models/fal-ai/pika/v2.2/text-to-video)
- [fal.ai - Pika v2.2 Pikascenes API](https://fal.ai/models/fal-ai/pika/v2.2/pikascenes/api)
- [fal.ai - Pika v2.2 Pikaframes](https://fal.ai/models/fal-ai/pika/v2.2/pikaframes)
- [VentureBeat - Pika 2.0 Launch](https://venturebeat.com/ai/pika-2-0-launches-in-wake-of-sora-integrating-your-own-characters-objects-scenes-in-new-ai-videos)
- [VentureBeat - Pika 1.5 Pikaffects](https://venturebeat.com/ai/pika-1-5-launches-with-physics-defying-ai-special-effects)
- [VentureBeat - Pika Sound Effects](https://venturebeat.com/ai/pika-adds-generative-ai-sound-effects-to-its-video-maker)
- [Tom's Guide - Pika Lip Sync](https://www.tomsguide.com/ai/ai-image-video/ai-video-just-took-a-big-leap-forward-pika-labs-adds-lip-syncing)
- [Flowith - Pika 2.5 Scene Extension](https://flowith.io/blog/pika-2-5-scene-extension-motion-control-new-standard-2026/)
- [WeShop - Pika 2026 Review](https://www.weshop.ai/blog/pika-ai-review-2026-still-the-king-of-creative-ai-video-generation/)
- [UCStrategies - Pika 2.5 Review](https://ucstrategies.com/news/pika-2-5-review-fast-ai-video-generation-for-social-media-worth-it/)
- [Pikartai - Version Comparison](https://pikartai.com/pika-ai-2-5-vs-previous-version/)
- [Pikaais - fal.ai Integration](https://pikaais.com/fal-ai/)
- [Pikaais - Extend Video](https://pikaais.com/extend-video-length/)
- [Pikaais - Lip Sync](https://pikaais.com/lip-sync/)
- [Pikaais - Pikaformance](https://pikaais.com/pikaformance/)
- [Pikaais - Pricing](https://pikaais.com/yearly-price/)
- [Pikalabs - Camera Parameters](https://pikalabs.org/camera-parameters/)
- [Pikalabs - Optional Parameters](https://pikalabs.org/pika-labs-optional-parameters/)
- [AgentsAPIs - Pika API Guide](https://agentsapis.com/api/pika-api/)
- [Pika Official - Pricing](https://pika.art/pricing)
- [Pika Official - API](https://pika.art/api)
- [Adobe Firefly - Pika 2.2 Integration](https://helpx.adobe.com/firefly/web/firefly-video-editor/generate-videos/generate-videos-with-pika-22.html)
- [The Decoder - Sound Effects & Lip Sync](https://the-decoder.com/pika-labs-ai-video-generator-now-includes-sound-effects-and-lip-sync-voices/)
