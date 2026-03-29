# Sora (OpenAI) - AI Video Generation

> Last updated: 2026-03-29
> Status: SHUTTING DOWN - App closes April 26, 2026. API closes September 24, 2026.

---

## CRITICAL: Sora is Being Discontinued

On March 24, 2026, OpenAI announced Sora shutdown:
- **Sora App/Web:** Discontinues April 26, 2026
- **Sora API:** Discontinues September 24, 2026
- **Reason:** Unsustainable computing costs + regulatory pressure around deepfakes
- **Strategic pivot:** OpenAI funneling compute toward coding tools and enterprise customers
- **Disney impact:** Disney dropped plans for $1 billion OpenAI investment
- **Action needed:** Export all Sora content before shutdown (hover > ... > Download)

---

## Models / Versions

### Sora 2 Pro (Latest)
- Higher quality, more polished output
- 1080p resolution support
- Longer render times
- More expensive
- Best for final/production output

### Sora 2 (Standard)
- Faster, more flexible
- 720p default resolution
- Good for rapid iteration, concepting, rough cuts
- Cheaper per generation

### Model IDs (API)
- `sora-2` (standard)
- `sora-2-pro` (premium)
- `sora-2-2025-10-06` (pinned version)
- `sora-2-2025-12-08` (pinned version)
- `sora-2-pro-2025-10-06` (pinned version)
- ALL deprecated, shutting down September 24, 2026

### Sora 1 / Sora Turbo (Legacy)
- Original model announced February 2024
- Sora Turbo launched December 2024 with ChatGPT Plus/Pro
- Superseded by Sora 2

---

## All Features

### Text-to-Video
- Describe scene with detailed prompts
- Supports complex multi-element scenes
- Camera, lighting, motion all controlled via text
- Synchronized dialogue and sound effects (Sora 2)

### Image-to-Video
- Upload reference image as first frame
- Image should match target resolution for best results
- Mismatched resolutions cause auto-cropping/scaling artifacts
- Available via `input_reference` API parameter

### Storyboard
- Organize video into structured shot sequence
- Cards on a timeline - each card can be text, image, or video
- Drag cards to set pace/timing
- Define specific content at designated frame points
- Example: Frames 0-114: "Landscape", Frames 114-324: "Interior shot", etc.
- Enables multi-shot narrative planning

### Style Presets
Built-in presets:
- Balloon World
- Stop Motion
- Archival
- Film Noir
- Cardboard & Papercraft

Additional style categories:
- Cinematic, Anime, Cyberpunk, Dreamy
- Hyper-Realistic, Pixel Art
- Custom presets can be saved and reused
- Presets act as prompt prefixes attached to your live prompt

### Camera Control
- Controlled entirely through text prompts (no visual sliders)
- Shot types: Wide, Medium, Close-up, Extreme close-up
- Movements: Pan, Tilt, Zoom, Dolly, Tracking, Crane
- Static options: "Static Camera", "Locked-off Shot", "Tripod Shot"
- Can combine movements: "pan left while dollying in, then tilt up"

### Remix
- Modify existing video by describing changes
- Strength levels: "subtle", "mild", "strong", "custom"
- Adjusts how dramatically the original video changes

### Blend
- Merge two videos into one
- Influence curve controls contribution of each source over time
- Creates smooth visual transitions between clips

### Loop
- Create seamless repetition of video segment
- Smooth looping for infinite playback

### Re-cut
- Trim clips with frame-level precision
- Stitch multiple clips into single sequence

### Extend
- Forward/backward extension of clips
- Can be used for storyboard stitching
- Enables longer narratives beyond single generation

### Character Cameos (Sora 2)
- Insert real people into Sora-generated environments
- Accurate portrayal of appearance and voice
- Works for humans, animals, or objects
- Highly general capability

### Synchronized Audio (Sora 2)
- Native audio generation with video
- Synchronized dialogue and sound effects
- Unique among AI video generators

---

## All Settings

### Resolution
| Model | Options |
|-------|---------|
| sora-2 | 720x1280, 1280x720 (default 720p) |
| sora-2-pro | 720x1280, 1280x720, 1920x1080, 1080x1920, 1024x1792, 1792x1024 |

### Duration
- 4 seconds (default)
- 8 seconds
- 12 seconds (via API `seconds` parameter)
- 16 seconds (Sora 2)
- 20 seconds (Sora 2 max)

### Aspect Ratios
- 16:9 (1280x720, 1920x1080) - YouTube landscape
- 9:16 (720x1280, 1080x1920) - Shorts/Reels/TikTok
- ~9:16 tall (1024x1792)
- ~16:9 wide (1792x1024)
- 1:1 (square) - supported via prompting

### Quality Modes
- Standard (faster, cheaper)
- HD (higher quality, longer processing)

---

## API Access

### Official OpenAI Videos API
- **Base URL:** `https://api.openai.com/v1/videos`
- **Auth:** Standard OpenAI API key (Bearer token)
- **Docs:** `https://developers.openai.com/api/docs/guides/video-generation`
- **Status:** DEPRECATED - shuts down September 24, 2026

### Endpoints
1. `POST /v1/videos` - Create video generation job
2. `GET /v1/videos/{video_id}` - Poll job status
3. `GET /v1/videos/{video_id}/content` - Download completed MP4

### Request Parameters
```python
# Python example
video = openai.videos.create(
    model="sora-2",           # or "sora-2-pro"
    prompt="A cool cat on a motorcycle at night",
    seconds="8",              # "4", "8", or "12"
    size="1280x720",          # resolution string
    # input_reference=image,  # optional: image-to-video
)
```

```javascript
// JavaScript example
let video = await openai.videos.create({
    model: 'sora-2',
    prompt: "Words 'Thank you' in sparkling letters",
});
```

### Workflow
1. Submit `POST /v1/videos` with prompt + parameters
2. Receive job ID
3. Poll `GET /v1/videos/{video_id}` until status = "completed"
4. Download MP4 from `GET /v1/videos/{video_id}/content`
5. Alternative: use `callback_url` webhook

### Third-Party API Access
- **fal.ai:** `fal-ai/sora-2/image-to-video`
- **Replicate:** `openai/sora-2`
- **OpenRouter:** `openai/sora-2-pro`
- **AIML API:** `sora-2-i2v`, `sora-2-pro-t2v`, `sora-2-pro-i2v`
- **Azure Foundry:** Available as preview
- **Atlas Cloud:** Image-to-video endpoint

---

## API Pricing

### Per-Second Billing

| Model | Resolution | Cost/Second | ~10s Clip |
|-------|-----------|-------------|-----------|
| sora-2 | 720p | ~$0.01-0.02 | ~$0.15 |
| sora-2-pro | 720p | ~$0.04-0.10 | ~$0.45-1.00 |
| sora-2-pro | 1080p | $0.70 | ~$7.00 |

### Credit-Based (UI)
- 720p: 16 credits/second
- 1080p (Pro): 40 credits/second (2.5x more)

---

## UI Pricing (via ChatGPT Plans)

| Plan | Price | Sora Access | Resolution | Notes |
|------|-------|-------------|------------|-------|
| Free | $0/mo | No | - | No Sora access |
| Go | $8/mo | No | - | No Sora access |
| Plus | $20/mo | Yes (limited) | 720p, 5s clips | Basic access |
| Pro | $200/mo | Yes (expanded) | 1080p, longer | Priority queue |
| Business | $25/user/mo | Limited | - | Restricted |
| Enterprise | Custom | No | - | Not available |

- Credits add-on system available for extra usage beyond plan limits
- Pro users get priority in generation queues

---

## UI vs API Differences

| Feature | UI (sora.com/ChatGPT) | API |
|---------|----------------------|-----|
| Storyboard | Visual timeline editor | Not available |
| Remix | Visual slider control | Not available |
| Blend | Visual merge tool | Not available |
| Re-cut | Timeline trimming | Not available |
| Style Presets | Dropdown selection | Via prompt text only |
| Camera Control | Via prompt text | Via prompt text |
| Resolution | Plan-dependent | Parameter-based |
| Audio | Synced generation | Included in output |
| Extend | UI button | Sequential calls |
| Loop | Toggle option | Not documented |

**Key difference:** Many creative tools (Storyboard, Remix, Blend, Re-cut) are UI-only and have no API equivalent.

---

## Limitations

### Technical
- **Max duration:** 20 seconds per generation
- **No real-time editing** - async generation only
- **Object consistency:** Objects disappear after occlusion, unintentional duplication
- **Physics:** Struggles with hands (finger count), feet, complex interactions
- **Text rendering:** Creates garbled text in background elements
- **Reproducibility:** Generating same scene twice is very difficult
- **Control:** No precise sliders/timelines, everything via text prompts
- **Character drift:** Model sometimes drifts on character details even with detailed prompts

### Business/Availability
- **SHUTTING DOWN:** App April 26, 2026; API September 24, 2026
- **No Enterprise access**
- **Quality degradation:** Reports of quality declining as OpenAI reduced compute
- **High compute costs** were cited as reason for shutdown
- **Deepfake concerns** contributed to regulatory pressure

### Content
- Training data bias inheritance
- Hallucinations (confident but incorrect outputs)
- Model drift over time
- NSFW/safety filters can be overly restrictive

---

## Best Practices

### Prompt Structure
Think of prompting like briefing a cinematographer:
1. Camera framing
2. Depth of field
3. Action beats
4. Lighting and palette

### Tips
1. **Shorter is better** - Model follows instructions more reliably in shorter clips
2. **Stitch over extend** - Two 4s clips often better than one 8s clip
3. **Be specific** - Anchor subjects with distinctive details
4. **Single action** - One plausible action per shot is easier to follow
5. **Dialogue formatting** - Place in separate block below visual description
6. **Keep dialogue concise** - Limit to handful of sentences to match clip length
7. **Set parameters explicitly** - Resolution/duration via API params, not prompt text
8. **Higher resolution = better** - More detail, texture, lighting accuracy
9. **Use sora-2 for iteration** - Switch to sora-2-pro for final output
10. **Export everything NOW** - Service shutting down April/September 2026

### Prompt Example
```
A medium shot of a woman in a red leather jacket standing on a
rain-slicked Tokyo street at night. Neon signs reflect in puddles.
Camera slowly dollies forward as she turns to face the camera.
Shallow depth of field, warm amber and cool blue lighting.
```

---

## Verdict: Should You Use Sora?

**NO for new projects.** Sora is being discontinued:
- App shuts down April 26, 2026 (less than 1 month away)
- API shuts down September 24, 2026
- Quality has reportedly degraded as OpenAI reduced compute
- No long-term viability

**Consider instead:** Luma Ray3, Kling, Runway Gen-4, Pika, PixVerse

---

## Sources
- [Sora 2 Announcement](https://openai.com/index/sora-2/)
- [Sora Discontinuation FAQ](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation)
- [Video Generation Guide](https://developers.openai.com/api/docs/guides/video-generation)
- [Sora 2 Prompting Guide](https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide)
- [Sora 2 Model Docs](https://platform.openai.com/docs/models/sora-2)
- [Videos API Reference](https://platform.openai.com/docs/api-reference/videos)
- [Sora 2 System Card](https://openai.com/index/sora-2-system-card/)
- [Sora Release Notes](https://help.openai.com/en/articles/12593142-sora-release-notes)
- [Sora Billing FAQ](https://help.openai.com/en/articles/10245774-sora-billing-faq)
- [Generating Videos on Sora](https://help.openai.com/en/articles/9957612-generating-videos-on-sora)
- [Variety - Sora Shutdown](https://variety.com/2026/digital/news/openai-shutting-down-sora-video-disney-1236698277/)
- [TechCrunch - Sora Shutdown](https://techcrunch.com/2026/03/24/openais-sora-was-the-creepiest-app-on-your-phone-now-its-shutting-down/)
- [The Decoder - Two-Stage Shutdown](https://the-decoder.com/openai-sets-two-stage-sora-shutdown-with-app-closing-april-2026-and-api-following-in-september/)
- [Sora 2 Output Parameters](https://www.vaiflux.com/blog/understanding-sora-2-video-output-parameters)
- [fal.ai Sora 2](https://fal.ai/models/fal-ai/sora-2/image-to-video)
- [Sora 2 Complete Guide 2026](https://wavespeed.ai/blog/posts/openai-sora-2-complete-guide-2026/)
- [DataCamp Sora 2 API Guide](https://www.datacamp.com/tutorial/sora-2-api-guide)
