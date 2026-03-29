# Hailuo AI / MiniMax

> Last updated: 2026-03-29

---

## Model Versions & History

### Hailuo 01 Series (Legacy)

| Model | Type | Key Feature |
|-------|------|-------------|
| **I2V-01** | Image-to-Video | Base I2V model |
| **I2V-01-Live** | Image-to-Video | Optimized for 2D illustrations, smooth animation, near-zero latency |
| **T2V-01-Director** | Text-to-Video | Camera control via natural language, reduced randomness |
| **I2V-01-Director** | Image-to-Video | Camera control + image input |
| **S2V-01** | Subject-to-Video | Character consistency from single reference image |
| **Video-01** | General | Standard generation model |
| **Video-01-Live** | General | Optimized for animation/illustration styles |

### Hailuo 02 (Current Main Model)

- Released mid-2025
- 3x parameters vs predecessor
- 4x training data volume
- NCR (Noise-aware Compute Redistribution) architecture - 2.5x more efficient
- Native 1080p (up from 720p)
- Ranked **#2 globally** on Artificial Analysis benchmark (surpassed Veo 3)

### Hailuo 2.3 (Latest - October 2025)

- Built on top of Hailuo 02
- Enhanced dynamic expression, more realistic/stable visuals
- Better physical actions, stylization, character micro-expressions
- Enhanced motion command response
- **Art styles**: Anime, illustration, ink-wash painting, game CG
- **2.3 Fast**: Reduces costs by up to 50% for batch creation
- 2.5x rendering speed boost while maintaining 1080p quality

---

## All Features

### Core Generation Modes

1. **Text-to-Video (T2V)** - Generate video from text description
2. **Image-to-Video (I2V)** - Animate a static image with motion prompt
3. **Start + End Frame** - Specify opening and ending frames, AI generates transition
4. **Subject Reference (S2V)** - Character consistency from single face/reference photo

### Director Mode / Camera Control

- 15 distinct camera movements available
- Natural language commands in square brackets: `[Push in]`, `[Pan left]`, `[Dolly zoom]`
- Multiple movements can be layered in sequence
- Supported moves: push, pull, pan, tilt, dolly zoom, tracking shot, orbit, crane shot, POV, roll
- Syntax: `[camera move]prompt text` (no space between bracket and text)

### Subject Reference (S2V-01)

- Generate character-consistent videos from **single reference image**
- Maintains facial features and identity across dynamic content
- Adjustable: posture, expressions, lighting, clothing, atmosphere, body type
- Identity preserved regardless of camera angle or movement
- Current limitation: single subject only (multi-subject in development)

### Motion Brush (Director Mode)

- Paint movement direction onto specific objects in the scene
- Granular control over individual element motion

### Art Style Support (2.3+)

- Photorealistic
- Anime
- Illustration
- Ink-wash painting
- Game CG

---

## Settings & Specifications

### Resolution

| Model | Resolutions Available |
|-------|----------------------|
| Hailuo 01 series | 512p - 720p |
| Hailuo 02 | 512p, 768p, 1080p |
| Hailuo 2.3 | 768p, 1080p |

### Duration

| Model | Duration Options |
|-------|-----------------|
| Hailuo 01 | 6s (720p), 10s (lower res) |
| Hailuo 02 | 6s or 10s |
| Hailuo 2.3 | 6s or 10s |

### Aspect Ratios

| Ratio | Use Case | Support |
|-------|----------|---------|
| 16:9 | YouTube, landscape | All models |
| 9:16 | TikTok, Reels, Shorts | All models |
| 1:1 | Instagram square | All models |
| 4:3 | Standard | 2.3 Fast Pro only |

### Frame Rate

- Standard: 25fps
- Hailuo 02/2.3: 25fps at all resolutions

---

## API Access

### Official MiniMax API

- URL: `platform.minimax.io`
- Endpoint: `POST https://api.minimax.io/v1/video_generation`
- Auth: `Authorization: Bearer YOUR_API_KEY`
- Async workflow: POST returns `task_id`, poll for completion

### API Generation Modes

| Mode | Parameter | Description |
|------|-----------|-------------|
| Mode 1: T2V | `prompt` only | Text-to-video |
| Mode 2: I2V | `first_frame_image` + `prompt` | Image-to-video |
| Mode 3: Start-End | `first_frame_image` + `last_frame_image` + `prompt` | Frame interpolation |
| Mode 4: Subject Ref | `subject_reference` + `prompt` | Character consistency |

### API Parameters

```json
{
  "model": "MiniMax-Hailuo-2.3",
  "prompt": "A woman walks through a garden [Pan left]",
  "first_frame_image": "url_or_base64",
  "last_frame_image": "url_or_base64",
  "subject_reference": "url_or_base64",
  "duration": 6,
  "resolution": "1080P"
}
```

### Third-Party API Providers

| Provider | Model | Price | Notes |
|----------|-------|-------|-------|
| **fal.ai** | Video-01 | $0.50/video | I2V and T2V |
| **fal.ai** | Video-01-Live | $0.50/video | Animation optimized |
| **fal.ai** | Hailuo-02 Standard | ~$0.25/video (768p 6s) | Cheapest option |
| **Replicate** | Hailuo-02 | $0.45/generation | Easy integration |
| **Segmind** | MiniMax AI | Various | Multiple models |
| **getimg.ai** | Director models | Various | Camera control guides |
| **Pollo AI** | All Hailuo models | Free tier available | Web interface |

---

## UI vs API Differences

| Feature | UI (hailuoai.video) | API (platform.minimax.io) |
|---------|---------------------|--------------------------|
| Director mode | Full visual controls | Square bracket syntax in prompts |
| Motion brush | Visual painting tool | Not available via API |
| Subject reference | Upload UI | `subject_reference` parameter |
| Queue priority | Based on subscription tier | Direct access |
| Watermark | Free plan has watermark | No watermark |
| Credit system | Monthly credits per plan | Unit-based pay-per-use |
| Templates | Available | Not available |
| Relax mode | Available on Max plan | Not available |
| Models | All latest models | May lag behind UI releases |

---

## Limitations

### Duration
- Max 10 seconds per generation (6s at 1080p for some models)
- Not suitable for long-form content without stitching
- 6 seconds feels very constrained for storytelling

### Resolution
- No native 4K support (max 1080p)
- 1080p only available on newer models (02+)

### Subject Reference
- Single subject only (multi-subject in development)
- S2V may follow prompts less precisely than T2V/I2V
- Environmental morphing can occur

### Server & Performance
- Queue times can stretch to hours during peak
- Servers reported as slow and unreliable by some users
- Free tier wait times spike significantly during peak hours

### Cost & Billing
- Credits consumed even on failed/poor generations
- Every edit/retry costs credits
- Pricing ramps up quickly with iteration
- Customer support response times reported as slow

### Quality
- Complex multi-character interactions can break down
- Highly specific prompts may not be followed accurately
- Dynamic scenes occasionally produce visual glitches or odd motion
- Scene transitions are basic and can feel repetitive
- Voice options lack emotional depth and advanced customization

### General
- Limited fine-grained control over visuals, gestures, transitions
- No audio generation (unlike Vidu Q3)
- No upscale feature natively

---

## Pricing

### Web Platform Plans (hailuoai.video)

| Plan | Monthly Price | Credits/mo | Key Features |
|------|-------------|------------|--------------|
| **Free** | $0 | Daily bonus credits | 3 tasks queue, 720p, watermark, peak delays |
| **Standard** | $14.99 | 1,000 | Queue priority, no watermark, faster gen |
| **Pro** | $54.99 | 4,500 | All Standard features + more credits |
| **Master** | $119.99 | 10,000 | High volume |
| **Ultra** | $124.99 | 12,000 | Hailuo02 model access |
| **Max** | $199.99 | 20,000 | Both Hailuo01&02, unlimited Relax Mode |

### Pay-As-You-Go Credits

| Pack | Price | Per Credit |
|------|-------|-----------|
| 20 credits | $24.90 | ~$1.25 |
| 100 credits | $49.90 | ~$0.50 |
| 300 credits | $88.90 | ~$0.30 |

*Credits never expire*

### Official API Pricing (MiniMax Platform)

| Model | Spec | Units | Approx USD |
|-------|------|-------|-----------|
| Hailuo 2.3 / 02 | 768p, 6s | 1 unit | ~$0.25 |
| Hailuo 2.3 / 02 | 768p, 10s | 2 units | ~$0.52 |
| Hailuo 2.3 / 02 | 1080p, 6s | 2 units | ~$0.52 |
| Hailuo 02 | 512p, 6s | 0.3 units | ~$0.08 |
| Hailuo 02 | 512p, 10s | 0.5 units | ~$0.13 |

### Credit Cost per Video (UI Platform)

| Spec | Credits Required |
|------|-----------------|
| 768p, 6s | 25 credits |
| 768p, 10s | 50 credits |
| 1080p, 6s | 50 credits |

### Third-Party API Pricing

| Provider | Cost |
|----------|------|
| fal.ai (Video-01) | $0.50/video |
| fal.ai (Hailuo-02 Standard) | ~$0.25/video |
| Replicate (Hailuo-02) | $0.45/generation |

---

## Best Practices

### Prompt Structure

```
[Subject] + [Action] + [Style/Mood] + [Setting] + [Camera Movement]
```

Ideal length: **40-60 words**

### Camera Control Syntax

```
[Push in] A woman walks through a misty forest at dawn
[Pan left][Zoom in] Close-up of a clock ticking on a wooden desk
[Tracking shot] A car drives down a coastal highway at sunset
```

### Tips

1. **Keep prompts clear and concise** - Overcomplicating causes AI to struggle
2. **Define characters fully** - Appearance, attire, facial symmetry, emotions, body language
3. **Use camera brackets** - `[Dolly]`, `[Zoom in]`, `[Crane shot]`, `[Tracking shot]`, `[POV]`
4. **Layer camera moves** - Start with zoom, transition to tracking shot in one prompt
5. **Single subject focus** - Best results with one main character/element
6. **Leverage Subject Reference** - Upload reference image for character consistency across shots
7. **Start at 768p** - Test concepts at lower resolution, upgrade winners to 1080p
8. **Use 6s for iteration** - Cheaper and faster, extend to 10s for final versions
9. **Specify lighting and mood** - "Golden hour", "dramatic shadows", "soft diffused light"
10. **Art style keywords** (2.3+) - "anime style", "ink wash painting", "game CG aesthetic"

### Model Selection Guide

| Use Case | Best Model |
|----------|-----------|
| Quick animation of illustration | I2V-01-Live / Video-01-Live |
| Cinematic with camera control | T2V-01-Director / I2V-01-Director |
| Character consistency across shots | S2V-01 |
| Highest quality realistic | Hailuo 02 (1080p) |
| Anime/illustration style | Hailuo 2.3 |
| Budget batch generation | Hailuo 02 (512p) or 2.3 Fast |
| Production pipeline via API | Hailuo 2.3 via MiniMax API |

---

## Sources

- [MiniMax Official](https://www.minimax.io/)
- [Hailuo AI Video](https://hailuoai.video/)
- [Hailuo AI Pricing](https://hailuoai.video/subscribe)
- [MiniMax API Docs - Video Generation](https://platform.minimax.io/docs/guides/video-generation)
- [MiniMax API Pricing](https://platform.minimax.io/docs/pricing/overview)
- [MiniMax News: Hailuo 02](https://www.minimax.io/news/minimax-hailuo-02)
- [MiniMax News: Hailuo 2.3](https://www.minimax.io/news/minimax-hailuo-23)
- [MiniMax News: S2V-01 Release](https://www.minimax.io/news/s2v-01-release)
- [MiniMax News: Director Models](https://www.minimax.io/news/01-director)
- [MiniMax News: I2V-01-Live](https://www.minimax.io/news/i2v-01-live-release)
- [fal.ai: MiniMax Video-01](https://fal.ai/models/fal-ai/minimax/video-01/image-to-video)
- [fal.ai: Hailuo 02](https://fal.ai/models/fal-ai/minimax/hailuo-02/standard/image-to-video)
- [Replicate: Hailuo video-01](https://replicate.com/minimax/video-01)
- [Segmind: MiniMax Pricing](https://www.segmind.com/models/minimax-ai/pricing)
- [Escapism: Hailuo Director Mode](https://www.escapism.ai/p/hailuo-ai-director-mode)
- [ImagineArt: Hailuo Prompt Guide](https://www.imagine.art/blogs/hailuo-ai-prompt-guide)
- [Cybernews: Hailuo Review 2026](https://cybernews.com/ai-tools/hailuo-ai-video-generator-review/)
