# Luma AI - Dream Machine / Ray Models

> Last updated: 2026-03-29
> Status: ACTIVE - Luma's primary product, actively developed

---

## Models / Versions

### Ray3.14 (Latest - January 2026)
- Native 1080p generation
- 4x faster than Ray3
- 3x cheaper than Ray3
- Improved stability and prompt adherence
- Best quality-to-cost ratio currently available

### Ray3 (September 2025)
- World's first "reasoning" video model - can think, plan, and create
- Native 16-bit HDR (ACES EXR standard) - first model to offer this
- More than 2x the size of Ray2
- Superior fidelity, instruction following, temporal coherence
- Draft Mode for quick iteration at reduced cost
- Hi-Fi Diffusion "master" mode for production-ready 4K HDR

### Ray3 Modify (December 2025)
- Video-to-video editing model
- Start + End frame control for V2V workflows
- Character reference with likeness/costume/identity lock
- Preserves actor motion, timing, eye line, emotional delivery
- Can transform environments, swap backgrounds, update wardrobe

### Ray2 (March 2025)
- 10x compute of Ray1
- Strong physics simulation
- Keyframe control (start + end frames)
- Extend and Loop features
- NO character reference support (use Ray3 for that)
- Modify Video currently only works with Ray2/Ray2 Flash

### Ray2 Flash
- ~3x faster and cheaper than Ray2
- Good for testing ideas and quick iteration
- Same feature set as Ray2

### Ray 1.6 (Legacy)
- Original Dream Machine model
- Lower quality, superseded by Ray2+

### Key Differences: Ray3 vs Ray2
| Feature | Ray2 | Ray3/3.14 |
|---------|------|-----------|
| Reasoning | No | Yes |
| HDR | No | Yes (16-bit) |
| Character Reference | No | Yes |
| Modify Video | Yes | No (Ray2 only) |
| Native 1080p | Upscale only | Yes (3.14) |
| Draft Mode | No | Yes |
| Physics | Good | Superior |
| Prompt adherence | Good | Much better |

---

## All Features

### Text-to-Video
- Describe scene in natural language
- Supports complex multi-element scenes
- Strong physics simulation (water, fire, explosions, materials)

### Image-to-Video
- Single image animation
- Dual image interpolation (start + end frame)
- Image used as first frame, AI generates motion

### Start + End Frame (Keyframing)
- Upload/select images as starting AND ending frames
- AI creates smooth transition between them
- Works with text prompt to guide the transition
- Available on Ray2+ and Ray3

### Camera Control
- Camera Motion Concepts - learnable, composable camera controls
- Presets: Pan, Orbit, Zoom, Crane, Tracking
- Compatible with image-to-video, keyframes, and loop
- Natural phrasing in prompts: "crane down", "tracking shot", "camera circles slowly"

### Loop Video
- Toggle infinity icon in UI
- `loop: true` parameter in API
- Creates seamless infinite playback

### Extend Video
- Extend default 5s clips up to ~1 minute
- Quality may degrade beyond 30 seconds
- Ray2 carries motion naturally when extended

### Modify Video (Ray2/Ray3 Modify)
- Video-to-video transformation
- Preserves original motion while changing visuals
- Environment transformation, background swap, wardrobe change
- Character replacement with reference preservation

### Character Reference (Ray3 only)
- Lock likeness, costume, identity across clips
- Character adapts to scene style/lighting automatically
- Works with Modify Video workflow

### Style Reference
- Not explicitly available as standalone feature
- Style controlled primarily through prompting
- Note: words like "vibrant", "whimsical", "hyper-realistic" may degrade output

### Draft Mode (Ray3)
- Reduced credit cost
- Faster generation
- Physics engine and reasoning still work
- Use for exploration, then "master" best shots to Hi-Fi 4K HDR

### HDR Generation (Ray3)
- Native 16-bit High Dynamic Range
- ACES EXR standard
- Studio-grade color output

---

## All Settings

### Resolution
| Model | Options |
|-------|---------|
| Ray2 | 540p, 720p (native), upscale to 1080p/4K |
| Ray3 | 540p, 720p, 1080p (native with 3.14), upscale to 4K |

### Duration
- 5 seconds (default)
- 9 seconds
- Up to ~1 minute with Extend feature

### Aspect Ratios
- 1:1 (Square)
- 16:9 (Landscape)
- 9:16 (Portrait/TikTok/Reels)
- 4:3
- 3:4
- 21:9 (Ultrawide)
- 9:21

### Generation Speed
- Standard (full quality)
- Flash (Ray2 Flash - 3x faster, lower cost)
- Draft Mode (Ray3 - fast iteration)
- Hi-Fi Diffusion (Ray3 - production master)

---

## API Access

### Official Luma API
- **Base URL:** `https://api.lumalabs.ai/dream-machine/v1/generations`
- **Auth:** Bearer token from `https://lumalabs.ai/dream-machine/api/keys`
- **Docs:** `https://docs.lumalabs.ai`

#### Endpoints
- `POST /dream-machine/v1/generations` - Create video generation
- `GET /dream-machine/v1/generations/{id}` - Check status
- `GET /concepts/list` - List available camera motion concepts

#### Request Parameters (Text-to-Video)
```json
{
  "prompt": "description of scene",
  "model": "ray-2",
  "aspect_ratio": "16:9",
  "duration": "5s",
  "resolution": "720p",
  "loop": false,
  "callback_url": "optional webhook",
  "keyframes": null
}
```

#### Request Parameters (Image-to-Video with Keyframes)
```json
{
  "prompt": "transition description",
  "model": "ray-2",
  "keyframes": {
    "frame0": { "type": "image", "url": "start_image_url" },
    "frame1": { "type": "image", "url": "end_image_url" }
  }
}
```

### fal.ai
- **Ray2 Text-to-Video:** `fal-ai/luma-dream-machine/ray-2`
- **Ray2 Image-to-Video:** `fal-ai/luma-dream-machine/ray-2/image-to-video`
- **Ray2 Flash Image-to-Video:** `fal-ai/luma-dream-machine/ray-2-flash/image-to-video`
- **Ray2 Reframe:** `fal-ai/luma-dream-machine/ray-2/reframe`
- Parameters: `image_url`, `end_image_url`, `prompt`, `aspect_ratio`, `loop`, `duration`, `resolution`

### Amazon Bedrock
- Luma AI models available on Amazon Bedrock
- Standard AWS authentication

### Third-Party Providers
- AIML API, PiAPI, Pollo AI, ApiFrame - various pricing tiers
- Generally offer same parameters as official API

---

## API Pricing

### Official API (Credit-Based)

#### Ray3.14 (Best value)
| Resolution | 5 seconds | 10 seconds |
|-----------|-----------|------------|
| 540p | 50 credits | 100 credits |
| 720p | 100 credits | 200 credits |
| 1080p | 400 credits | 800 credits |

#### Ray3
| Resolution | 5 seconds | 10 seconds |
|-----------|-----------|------------|
| 540p SDR | 160 credits | 320 credits |
| 720p SDR | 320 credits | 640 credits |
| 1080p SDR | 330 credits | 660 credits |
| 540p HDR | 640 credits | 1280 credits |
| 720p HDR | 1280 credits | 2560 credits |

#### Ray2
- Ray2 Flash: ~11 credits/sec
- Ray2 Standard: ~32 credits/sec
- Approximate cost: $0.01582/million pixels (720p, 5s, 16:9 = ~$1.75)

### fal.ai Pricing
- Ray2: ~$0.50 per 5 seconds

---

## UI Pricing (Dream Machine Plans)

| Plan | Price | Generations/mo | Features |
|------|-------|---------------|----------|
| Free | $0/mo | ~30 | Watermarked, no commercial use |
| Plus | $30/mo | ~120 | Commercial use, no watermark |
| Pro | $90/mo | ~480 | 4x Plus capacity |
| Ultra | $300/mo | ~2000+ | High-volume production |

- Credits reset monthly
- API credits are SEPARATE from subscription credits
- 10-second video costs ~800 credits

---

## UI vs API Differences

| Feature | UI (Dream Machine) | API |
|---------|-------------------|-----|
| Camera Concepts | Visual presets | Concepts list endpoint |
| Keyframes | Drag-and-drop images | JSON with frame0/frame1 |
| Loop | Toggle infinity icon | `loop: true` parameter |
| Extend | UI button | Sequential API calls |
| Boards/Context | Retains context within board | No context retention |
| Credits | Included in subscription | Separate billing |
| Draft Mode | Toggle in UI | Model parameter |
| Modify Video | Upload + edit in UI | Modify endpoint |

---

## Limitations

- **Duration:** Max 5-9 seconds per generation, extend up to ~1 minute (quality degrades after 30s)
- **Character Reference:** Only available on Ray3, NOT Ray2
- **Modify Video:** Only works with Ray2/Ray2 Flash, NOT Ray3
- **Text in Video:** Can struggle with text rendering
- **Prompt Sensitivity:** Certain adjectives ("vibrant", "whimsical", "hyper-realistic") may degrade output
- **No Audio:** Video-only generation, no sound
- **Consistency:** Multi-generation character consistency requires Ray3 character reference
- **HDR:** Only available on Ray3, not Ray2

---

## Best Practices

### Prompt Structure
```
Main subject -> Action -> Subject details -> Scene -> Style -> Camera move -> Reinforcer
```
Example: "A man in a red coat runs through a foggy forest, cinematic lighting, tracking shot, camera follows him from behind."

### Tips
1. **Be specific** - Describe what can be SEEN, avoid vague/emotional language
2. **Specify camera dynamics** - "crane down", "tracking shot", "camera circles slowly"
3. **Start simple** - Build intuition with basic prompts, then add complexity
4. **Use motion cues** - "sprints", "spins", "swerves" for dynamic output
5. **Extend wisely** - If initial generation is static, add motion cues first
6. **Use boards** - Dream Machine retains context within a board
7. **Ray2 Flash for iteration** - Test with Flash, finalize with Standard/Ray3
8. **Ray3 Draft Mode** - Use Draft for exploration, Hi-Fi for final output
9. **Keyframes for control** - Define start AND end frames for predictable motion
10. **Avoid over-styling** - Too many style words can confuse the model

### Model Selection Guide
- **Quick iteration:** Ray2 Flash or Ray3 Draft Mode
- **Standard quality:** Ray2 Standard or Ray3.14
- **Maximum quality:** Ray3 Hi-Fi 4K HDR
- **Video editing:** Ray2 + Modify Video or Ray3 Modify
- **Character consistency:** Ray3 with Character Reference
- **Cost-efficient production:** Ray3.14 (best quality/cost ratio)

---

## Sources
- [Luma Ray Models](https://lumalabs.ai/ray)
- [Ray2 Changelog](https://lumalabs.ai/changelog/introducing-ray2)
- [Ray3 Modify](https://lumalabs.ai/news/ray3-modify)
- [Ray3.14 Update](https://lumalabs.ai/news/ray3_14)
- [Camera Motion Concepts](https://lumalabs.ai/news/camera-motion-concepts)
- [API Documentation](https://docs.lumalabs.ai/docs/api)
- [Video Generation API](https://docs.lumalabs.ai/docs/video-generation)
- [Pricing & Plans](https://lumalabs.ai/pricing)
- [Credit System](https://lumalabs.ai/learning-hub/dream-machine-credit-system)
- [Ray2 FAQ](https://lumalabs.ai/learning-hub/dream-machine-guide-ray2)
- [Best Practices](https://lumalabs.ai/learning-hub/best-practices)
- [How to Generate with Ray2](https://lumalabs.ai/learning-hub/dream-machine-how-to-generate-with-ray2)
- [fal.ai Ray2 Text-to-Video](https://fal.ai/models/fal-ai/luma-dream-machine/ray-2/api)
- [fal.ai Ray2 Image-to-Video](https://fal.ai/models/fal-ai/luma-dream-machine/ray-2/image-to-video)
- [Luma AI Review 2026](https://max-productive.ai/ai-tools/luma-ai/)
- [Luma vs Runway 2026](https://aloa.co/ai/comparisons/ai-video-comparison/luma-ai-vs-runway)
- [Luma on Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-luma.html)
