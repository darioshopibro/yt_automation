# Runway AI - Complete Research Document

> **Last Updated:** 2026-03-29
> **Status:** Comprehensive research from web + YouTube sources

---

## Table of Contents

1. [Model Overview & Versions](#model-overview--versions)
2. [Features by Model](#features-by-model)
3. [All Settings & Parameters](#all-settings--parameters)
4. [API Access](#api-access)
5. [UI vs API Differences](#ui-vs-api-differences)
6. [Limitations](#limitations)
7. [Pricing](#pricing)
8. [Best Practices](#best-practices)
9. [Third-Party API Providers](#third-party-api-providers)
10. [Sources](#sources)

---

## Model Overview & Versions

### Gen-4.5 (Latest - December 2025)

- **Architecture:** Autoregressive-to-Diffusion (A2D) built on NVIDIA GPUs
- **Focus:** Text-to-video (primary), image-to-video
- **Benchmark:** #1 on Artificial Analysis Text to Video benchmark (1,247 Elo)
- **Key Strength:** Physical realism - weight, inertia, liquids, cloth, physically plausible collisions
- **Multi-element scenes:** Precise placement of objects, fluid motion, believable interactions
- **Known Weaknesses:** Causal reasoning (effects precede causes), object permanence issues, success bias
- **Credits:** 12 credits/second (120 credits for 10s clip)
- **Available on:** All paid plans

### Gen-4 (March 2025)

- **Focus:** Image-to-video (primary), character/scene consistency
- **Key Breakthrough:** Consistent characters, locations, and objects across multiple shots
- **Character consistency:** ~70% success rate vs competitors' 45-50%
- **Prompt adherence:** ~65% perfect adherence (vs Gen-3's ~40%)
- **Temporal consistency:** Major leap over Gen-3
- **Credits:** 12 credits/second (120 credits for 10s clip)

### Gen-4 Turbo (April 2025)

- **Focus:** Speed - generates 10s clip in ~30 seconds (5x faster than standard Gen-4)
- **Quality:** Similar to Gen-4 standard but optimized for speed
- **Best for:** Rapid iteration, creative experimentation
- **Credits:** 5 credits/second (50 credits for 10s clip)
- **API model name:** `gen4_turbo`

### Gen-4 Aleph (July 2025)

- **Type:** In-context video-to-video editor (NOT a generator)
- **Capabilities:**
  - Add, remove, transform objects via text prompts
  - Generate new camera angles from existing footage
  - In-painting: paint over objects, AI removes and fills seamlessly across frames
  - Style/lighting modification
  - Green screen extraction without physical green screen
  - Retro film grain, cyberpunk neon, hand-painted aesthetics
- **Max duration:** 5 seconds per generation
- **Credits:** 15 credits/second (150 credits for 10s edit)

### Gen-4 Image

- **Type:** Text-to-image with reference support
- **Supports:** Up to 3 reference images
- **API model name:** `gen4_image`
- **Credits:** 8 credits per image

### Gen-3 Alpha (June 2024)

- **Features:** Text-to-video, image-to-video, video-to-video
- **Controls:** Motion Brush, Advanced Camera Controls, Director Mode
- **Keyframes:** First frame + last frame + middle frame support
- **Resolution:** 720p at 24fps
- **Generation time:** ~60s for 5s clip, ~90s for 10s clip
- **Extensions:** Up to 3 extensions per generation
- **Credits:** 10 credits/second

### Gen-3 Alpha Turbo

- **Faster variant** of Gen-3 Alpha
- **Best for:** Rapid prototyping and prompt testing
- **Credits:** 5 credits/second
- **API model name:** `gen3a_turbo`

### Gen-2 (DEPRECATED - May 2025)

- **Status:** Fully deprecated as of May 11, 2025
- **Had:** 30+ preset styles, Motion Brush, camera control, lip sync
- **Note:** Gen-2's original Motion Brush (paint specific movement areas) was NOT carried to Gen-3/Gen-4 in the same way
- **Legacy use:** Was good for abstract/stylized work

---

## Features by Model

### Feature Comparison Matrix

| Feature | Gen-4.5 | Gen-4 | Gen-4 Turbo | Aleph | Gen-3 Alpha | Gen-3 Turbo |
|---|---|---|---|---|---|---|
| Text-to-Video | PRIMARY | Limited | Limited | No | Yes | Yes |
| Image-to-Video | Yes | PRIMARY | PRIMARY | No | Yes | Yes |
| Video-to-Video | Yes | No | No | PRIMARY | Yes | Yes |
| Start Frame | Yes | Yes | Yes | N/A | Yes | Yes |
| End Frame | Yes | No | No | N/A | Yes | Yes |
| Middle Frame | No | No | No | N/A | Yes | No |
| Camera Control | Yes | Yes | Yes | N/A | Yes | Yes |
| Motion Brush | Yes | Yes | Yes | N/A | Yes | Yes |
| Character Consistency | Excellent | Excellent | Good | N/A | Moderate | Moderate |
| Lip Sync | Via Act-Two | Via Act-Two | Via Act-Two | N/A | Via Act-One | Via Act-One |
| Style Reference | Yes | Yes (up to 3) | Yes | Yes | Limited | Limited |
| Director Mode | Yes | Yes | Yes | N/A | Yes | Yes |
| Layout Sketch | Yes | Yes | No | N/A | No | No |
| Workflows | Yes | Yes | Yes | Yes | Yes | Yes |
| 4K Upscale | Yes | Yes | Yes | No | Yes | Yes |

### Camera Control (All video models)

Six movement directions, each with -10 to +10 intensity:
- **Horizontal** - left/right camera movement
- **Vertical** - up/down camera movement
- **Pan** - horizontal rotation
- **Tilt** - vertical rotation
- **Zoom** - in/out
- **Roll** - rotational around the forward axis

Additional controls:
- **Dolly** - forward/backward movement
- **Truck** - lateral movement
- **Orbit** - circular movement around subject

### Motion Brush 3.0

- Paint specific areas of an image to direct movement
- Vector controls for speed and direction per painted area
- **Multi Motion Brush:** Up to 5 different areas, each with own motion controls
- Available on Gen-4 and Gen-4.5

### Director Mode

- Node-based interface for camera control throughout clip duration
- Set precise camera moves: Zoom In, Pan Left, Truck Right, Orbit
- Dynamic lighting control throughout the clip
- Essentially simplified keyframe system for camera

### Act-Two (Performance Capture)

- Full-body performance capture from webcam video
- Facial expression transfer with high fidelity
- Lip sync automatically synchronized with audio
- Hand gesture capture
- Multi-character dialogue support (same background motion, unique facial performances)
- Evolved from Act-One (which was facial/head only)

### Layout Sketch

- Draw/block out basic scene layouts using simple shapes
- Define character/object placement, shot framing, visual balance
- Upload rough sketches or wireframes
- Model builds detailed render from sketch
- Useful for ad layouts, mockups, scene planning

### Workflows (October 2025)

- Node-based system for chaining multiple AI models
- Three node types: Input, Media model, LLM
- Save as templates for team consistency
- Adjust parameters per node: aspect ratio, resolution, temperature
- Run entire workflows or individual nodes
- Best for: agencies, brand teams, repetitive production

### Reference System (Gen-4+)

- Combine up to 3 reference images per generation
- Label references as `image_1`, `image_2`, `image_3`
- Maintain character/style consistency across scenes
- Recommended minimum: 640x640px, maximum: 4K
- Max file size: 20MB per reference image

---

## All Settings & Parameters

### Resolution Options

| Plan | Max Resolution |
|---|---|
| Free | 720p |
| Standard | 1080p |
| Pro | 4K (via upscale) |
| Unlimited | 4K (via upscale) |

**Native output:** 720p (all models generate at 720p, then upscale)

### Supported Dimensions (API)

- `1280x720` (16:9 landscape)
- `720x1280` (9:16 vertical/portrait)
- `1104x832` (landscape variant)
- `832x1104` (portrait variant)
- `960x960` (1:1 square)
- `1584x672` (21:9 ultrawide)

### Duration Options

- **5 seconds** - recommended for simple actions
- **10 seconds** - recommended for complex/multi-movement prompts
- Default: 10 seconds
- Extensions: Up to 3 extensions on Gen-3 Alpha

### Other Parameters

| Parameter | Details |
|---|---|
| **Seed** | Fixed seed for reproducible results. Copy/paste from previous output for similar style/movement |
| **Aspect Ratio** | Auto-crops from center if input doesn't match |
| **Prompt Text** | 1-1000 characters |
| **Prompt Image** | First or last frame position. Max 20MB |
| **Frame Rate** | 24fps (fixed) |

### API-Specific Parameters

```python
# Image-to-Video example
client.image_to_video.create(
    model="gen4_turbo",          # Model selection
    prompt_image="url_or_base64", # Input image
    ratio="1280:720",            # Output resolution
    prompt_text="description",    # Motion/action description
    duration=10,                  # 5 or 10 seconds
    seed=12345,                   # Optional: for reproducibility
)
```

The `promptImage` parameter accepts an array where you can set `position` to `"first"` or `"last"` to control whether the video starts or ends with the image.

---

## API Access

### Official Runway API

- **Portal:** https://dev.runwayml.com/
- **Docs:** https://docs.dev.runwayml.com/
- **API Reference:** https://docs.dev.runwayml.com/api/

### Available API Models

| Model ID | Type | Credits/sec |
|---|---|---|
| `gen4_turbo` | Image-to-Video | 5 |
| `gen4_image` | Text-to-Image | 8/image |
| `gen3a_turbo` | Text/Image-to-Video | 5 |
| `gen4_aleph` | Video-to-Video editing | 15 |

### SDKs

**Python SDK:**
```bash
pip install runwayml
```
- Python 3.8+
- MyPy-compatible type annotations
- Sync and async clients
- GitHub: https://github.com/runwayml/sdk-python

**Node.js SDK:**
```bash
npm install @runwayml/sdk
```
- Node 18+
- TypeScript bindings included

### Authentication

```bash
# Environment variable (auto-detected by SDKs)
export RUNWAYML_API_SECRET="your_api_key"
```

### Async Task System

Runway API is **fully asynchronous**:
1. Submit task -> get task ID
2. Poll for completion (recommended: 5s+ intervals with jitter)
3. Handle THROTTLED status (queued but not yet processing)
4. Default timeout: 10 minutes

### Concurrency & Rate Limits

| Tier | Concurrent Tasks | Notes |
|---|---|---|
| Free | ~3 | Very limited |
| Standard | ~5 | Per model, per org |
| Pro | ~5 | Per model, per org |
| Higher tiers | More | Contact sales |

- **No maximum requests-per-minute limit** (but respect concurrency)
- Tasks exceeding concurrency get THROTTLED status
- Throttled tasks processed in submission order
- Polling: use 5s+ intervals with exponential backoff on non-200 responses

### Webhook Support

- Webhook configuration available for production integration
- Documented in API for error handling and batch processing patterns

### Batch Processing

- Submit up to 200+ tasks simultaneously
- Runway queues and processes ~5 at a time sequentially
- Control concurrency separately from UX (e.g., let users submit 20, process 3)

### `waitForTaskOutput` Method

```python
# Python - wait for completion
task = await client.image_to_video.create(...)
output = await task.wait_for_task_output(timeout=600)  # 10 min default
```

---

## UI vs API Differences

### UI-Only Features (NOT available in API)

- **End frame customization** - Can set last frame in UI, not yet in API
- **Middle frame keyframing** - Gen-3 UI feature, not in API
- **Director Mode** - Node-based camera control UI
- **Layout Sketch** - Draw scene layouts
- **Motion Brush** - Paint motion areas interactively
- **Aleph visual editor** - Full in-context editing UI
- **Workflows builder** - Node-based pipeline builder
- **4K Upscale** - One-click upscale in UI
- **Act-Two** - Webcam performance capture
- **Video editor** - Built-in editing workspace

### API-Only Advantages

- Batch processing at scale (200+ tasks)
- Programmatic control and automation
- Integration into custom pipelines
- Webhook-based notifications
- Concurrent task management

### Important: Separate Credit Systems

**Web app credits and API credits are COMPLETELY SEPARATE.** Credits purchased on the web app never appear in API credits, and vice versa.

---

## Limitations

### Duration

- **Max per generation:** 10 seconds (all models)
- **Aleph max:** 5 seconds per generation
- **Extensions:** Up to 3x on Gen-3 Alpha (making ~40s max)
- **Longer content:** Requires stitching clips together manually

### Resolution

- **Native output:** 720p for all video models
- **Upscale:** Available to 4K on paid plans (post-generation)
- **Frame rate:** Fixed at 24fps

### Known Issues

- **Character consistency across clips:** While much improved in Gen-4, keeping characters consistent across MULTIPLE separate clips remains challenging
- **Visual glitches:** Objects may be distorted, prompts partially followed
- **Complex scenes:** Often require multiple attempts
- **Text rendering:** AI video models generally struggle with readable text in video
- **Fast camera motion:** Causes "AI wobble" especially on repeated textures (brick, fabric)
- **Object permanence:** Objects may disappear or appear unexpectedly across frames (Gen-4.5)
- **Causal reasoning:** Effects sometimes precede causes (Gen-4.5)
- **Success bias:** Actions disproportionately succeed (Gen-4.5)

### Queue & Processing Times

- **Gen-4 Turbo:** ~30 seconds for 10s clip
- **Gen-4 Standard:** ~2-5 minutes for 10s clip
- **Gen-3 Alpha:** ~60s for 5s, ~90s for 10s
- **High-traffic periods:** Render failures, processing errors, slow times reported
- **API task timeout:** Default 10 minutes

### Content Restrictions

- Standard AI safety filters apply
- No NSFW content generation
- Content moderation on all outputs

---

## Pricing

### Plan Comparison (March 2026)

| Plan | Monthly | Annual (per month) | Credits | Key Features |
|---|---|---|---|---|
| **Free** | $0 | - | 125 (one-time) | Gen-4 Turbo, Gen-4 Image, 720p, watermarked |
| **Standard** | $15 | $12 | 625/month | 1080p, watermark-free, 100GB storage |
| **Pro** | $35 | $28 | 2,250/month | 4K upscale, 500GB storage, priority |
| **Unlimited** | $95 | $76 | 2,250 + unlimited relaxed | Relaxed mode unlimited generations |
| **Enterprise** | Custom | Custom | Custom | Custom limits, dedicated support |

### What Credits Get You (Examples)

| Model | Credits/sec | 10s clip cost | $ cost (at $0.01/credit) |
|---|---|---|---|
| Gen-3 Alpha Turbo | 5 | 50 credits | $0.50 |
| Gen-4 Turbo | 5 | 50 credits | $0.50 |
| Gen-3 Alpha | 10 | 100 credits | $1.00 |
| Gen-4 Video | 12 | 120 credits | $1.20 |
| Gen-4.5 | 12 | 120 credits | $1.20 |
| Gen-4 Aleph | 15 | 150 credits | $1.50 |
| Veo 3 (with audio) | 40 | 400 credits | $4.00 |
| Gen-4 Image | 8/image | 8 credits | $0.08 |

### API Pricing

- **Rate:** $0.01 per credit (1 credit = $0.01)
- **Separate from web app** - must purchase API credits separately
- **No subscription required** - pay-as-you-go for API

### Important Notes

- Credits do NOT roll over - unused credits expire at billing cycle end
- Annual billing saves ~20% across all paid tiers
- All paid plans include watermark-free exports
- Free tier: watermarked, 720p only

---

## Best Practices

### Prompting for Gen-4 Video

1. **Keep prompts simple** - Start with a simple prompt, iterate by adding details
2. **Focus on MOTION, not appearance** - The image provides visual info; prompt should describe the desired movement
3. **Use active, descriptive verbs:**
   - "A woman turns slowly toward the camera, hair moving with the breeze"
   - "A dog runs across a wet street, splashing water in slow motion"
4. **NO negative prompting** - Gen-4 doesn't support "don't" or "no" instructions. Only describe what SHOULD happen
5. **One strong visual idea per prompt** - Multiple actions = "soup". Single focal action, supporting elements
6. **Iterate one element at a time** - Add one new element per iteration to identify what works

### Camera Motion Tips

- **Moderate speeds** keep edges clean
- **Fast camera = "AI wobble"** especially on small repeated textures (brick, fabric)
- **5s clips** for simple motions, **10s clips** for complex multi-movement prompts
- Combine camera presets with Motion Brush for best control

### Consistency Tips

- Use reference images (up to 3) with clear labels
- Maintain same lighting/angle in reference images
- For multi-shot: use Gen-4 References with the same character reference across generations
- Gen-4 achieves ~70% character consistency; plan for re-generation of failed shots

### Motion Graphics Specific

- Layout Sketch for precise composition control
- Use Gen-4 Image first to create perfect starting frames
- Director Mode for controlled camera movements
- Workflows for repeatable production pipelines
- Aleph for post-generation adjustments without re-rendering

### Cost Optimization

- **Prototype with Gen-4 Turbo** (5 credits/sec) before using Gen-4 standard (12 credits/sec)
- **Test prompts with Gen-3 Alpha Turbo** first (cheapest and fastest)
- Use 5s duration for testing, 10s for final renders
- Save working seeds for reproducible results

### Production Workflow (Recommended)

1. Write and test prompts using Gen-3 Alpha Turbo (cheapest)
2. Create starting frames using Gen-4 Image
3. Generate video with Gen-4 Turbo for speed iteration
4. Final render with Gen-4 or Gen-4.5 for quality
5. Post-edit with Aleph if needed
6. Upscale to 4K for delivery

---

## Third-Party API Providers

| Provider | Runway Models Available | Notes |
|---|---|---|
| **Replicate** | Gen-4 Turbo, Gen-4 Image | replicate.com/runwayml |
| **fal.ai** | Multiple models | 50% market share for image APIs, 44% for video |
| **Segmind** | Gen-4 Turbo | segmind.com/models/runway-gen4-turbo |
| **AI/ML API** | Gen-4 Turbo | docs.aimlapi.com |
| **Runware** | Gen-4 Turbo, Aleph | Unified API access |
| **CometAPI** | Gen-4, Gen-4 Image | Aggregator platform |
| **Pollo AI** | Gen-4 | docs.pollo.ai |

**Third-party advantages:**
- Often lower per-generation costs than official API
- Good for high-volume applications
- Unified API across multiple providers

**Third-party disadvantages:**
- May lag behind on latest features
- Additional latency from proxy layer
- Less direct support

---

## Sources

### Official Runway
- [Runway Official Site](https://runwayml.com/)
- [Runway API Documentation](https://docs.dev.runwayml.com/)
- [Runway API Reference](https://docs.dev.runwayml.com/api/)
- [Runway API Input Parameters](https://docs.dev.runwayml.com/assets/inputs/)
- [Runway API Pricing](https://docs.dev.runwayml.com/guides/pricing/)
- [Runway API Usage Tiers & Limits](https://docs.dev.runwayml.com/usage/tiers/)
- [Runway API SDKs](https://docs.dev.runwayml.com/api-details/sdks/)
- [Runway API Getting Started](https://docs.dev.runwayml.com/guides/using-the-api/)
- [Runway API Available Models](https://docs.dev.runwayml.com/guides/models/)
- [Runway Pricing Page](https://runwayml.com/pricing)
- [Runway Changelog](https://runwayml.com/changelog)
- [Runway Developer Portal](https://dev.runwayml.com/)
- [Runway Python SDK (GitHub)](https://github.com/runwayml/sdk-python)

### Official Runway Research
- [Introducing Gen-4](https://runwayml.com/research/introducing-runway-gen-4)
- [Introducing Gen-4.5](https://runwayml.com/research/introducing-runway-gen-4.5)
- [Introducing Aleph](https://runwayml.com/research/introducing-runway-aleph)
- [Gen-4 Behind the Scenes](https://runwayml.com/gen-4-bts)
- [Gen-3 Alpha Research](https://runwayml.com/research/introducing-gen-3-alpha)

### Official Help Articles
- [Creating with Gen-4 Video](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video)
- [Creating with Gen-4.5](https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5)
- [Creating with Aleph](https://help.runwayml.com/hc/en-us/articles/43176400374419-Creating-with-Aleph)
- [Gen-4 Video Prompting Guide](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide)
- [Gen-4 Image References](https://help.runwayml.com/hc/en-us/articles/40042718905875-Creating-with-Gen-4-Image-References)
- [Camera Control on Gen-3 Alpha Turbo](https://help.runwayml.com/hc/en-us/articles/34926468947347-Creating-with-Camera-Control-on-Gen-3-Alpha-Turbo)
- [Keyframes on Gen-3](https://help.runwayml.com/hc/en-us/articles/34170748696595-Creating-with-Keyframes-on-Gen-3)
- [Creating with Lip Sync](https://help.runwayml.com/hc/en-us/articles/31941427186323-Creating-with-Lip-Sync)
- [Multi-Character Dialogues with Act-Two](https://help.runwayml.com/hc/en-us/articles/41748090660499-Creating-Multi-Character-Dialogues-with-Act-Two)
- [Introduction to Workflows](https://help.runwayml.com/hc/en-us/articles/45763528999699-Introduction-to-Workflows)
- [Gen-2 Deprecation](https://help.runwayml.com/hc/en-us/articles/41072248471187-Gen-2-Deprecation)
- [How Credits Work](https://help.runwayml.com/hc/en-us/articles/15124877443219-How-do-credits-work)

### Third-Party Reviews & Guides
- [Runway AI Review 2026 (max-productive.ai)](https://max-productive.ai/ai-tools/runwayml/)
- [Runway Gen-4 Turbo Review (aitoolsguide.in)](https://aitoolsguide.in/runway-gen-4-turbo-review/)
- [Runway Gen-4 Guide 2026 (aitoolsdevpro.com)](https://aitoolsdevpro.com/ai-tools/runway-guide/)
- [Gen-4 vs Gen-3 Comparison (apatero.com)](https://apatero.com/blog/runway-gen-4-vs-gen-3-alpha-comparison-2025)
- [Runway Gen 4.5 Tutorial (DataCamp)](https://www.datacamp.com/tutorial/runway-gen-4-5)
- [Runway Pricing Guide 2026 (getaiperks.com)](https://www.getaiperks.com/en/articles/runway-pricing)
- [Runway ML Pricing 2026 (saascrmreview.com)](https://saascrmreview.com/runway-ml-pricing/)
- [Runway Capabilities Cheatsheet (ai-mindset.ai)](https://www.ai-mindset.ai/runway-cheatsheet)
- [Gen-4 Camera Motion Prompts (crepal.ai)](https://crepal.ai/blog/aivideo/runway-gen4-motion-prompts/)
- [Gen-4 Prompts Guide (filmart.ai)](https://filmart.ai/runway-gen-4-prompts/)
- [Layout Sketch for Gen-4 (kinomotomag.com)](https://kinomotomag.com/2025/05/30/runway-adds-layout-sketch-for-gen-4/)
- [Luma AI vs Runway 2026 (aloa.co)](https://aloa.co/ai/comparisons/ai-video-comparison/luma-ai-vs-runway)
- [AI API Comparison 2026 (teamday.ai)](https://www.teamday.ai/blog/ai-image-video-api-providers-comparison-2026)

### YouTube Resources
- [Runway AI Tutorial for Beginners (Skills Factory, 301K views)](https://www.youtube.com/watch?v=c38vtLw1nSk)
- [Runway Gen 4.5 Tutorial (Skills Factory, 17.9K views)](https://www.youtube.com/watch?v=w_kKWDyPZnI)
- [Gen-4 References Full Tutorial (Justin Serran, 16.6K views)](https://www.youtube.com/watch?v=5zYUNcyRcUc)
- [Gen-4.5 Cinematic Motion Explained (AI. Now Y'Know)](https://www.youtube.com/watch?v=SoIAZV82TnQ)
- [Runway Workflows Tutorial (Jerrod Lew)](https://www.youtube.com/watch?v=aAieBWkHAmM)
- [Runway VFX Without After Effects (Blue Lightning, 91.9K views)](https://www.youtube.com/watch?v=9HST1tlLWGo)
