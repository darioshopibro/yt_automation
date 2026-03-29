# Vidu AI (by Shengshu Technology)

> Last updated: 2026-03-29

---

## Model Versions & History

### Version Series (Older)

| Model | Release | Key Improvement |
|-------|---------|-----------------|
| **Vidu 1.0** | Mid 2024 | First release, basic T2V/I2V |
| **Vidu 1.5** | Late 2024 | First-ever multi-entity consistency feature |
| **Vidu 2.0** | Jan 18, 2025 | 10s generation, half cost, templates, start/end frame |

### Q-Series (Current Generation)

| Model | Focus | Max Resolution | Max Duration | Audio |
|-------|-------|---------------|-------------|-------|
| **Q1** | Entry-level, animate stills | 1080p | 5s | No |
| **Q2** | Cinematic realism, multi-reference control | 1080p | Longer scenes | No |
| **Q2 Pro** | High-fidelity, stable characters, smooth camera | 1080p | Extended | No |
| **Q3** | Multimodal (video + synchronized audio) | 1080p | 16s | Yes (dialogue, SFX, music) |

### Key Differences

- **Q1**: Simplest workflow, good for animating a single image/poster/product shot
- **Q2**: Better realism, consistency, and presentation quality. Feels more cinematic
- **Q3**: Full multimodal output - generates video WITH synchronized audio (dialogue, SFX, music) in one pass. Smart multi-shot sequencing with automatic scene transitions

---

## All Features

### Core Generation Modes

1. **Text-to-Video (T2V)** - Generate video from text prompt
2. **Image-to-Video (I2V)** - Animate a static image with motion described by prompt
3. **Reference-to-Video (R2V)** - Upload up to 7 reference images for character/scene consistency
4. **Start + End Frame Control** - Specify first and last frames, AI generates the transition

### Camera Control

- Natural language camera commands in prompts
- Supported moves: push-in, pull-back, pan, tilt, tracking shot, orbit, dolly zoom
- Q3 has most advanced camera understanding
- Smart Cuts (Q3): Automatic scene transitions, angle changes, perspective switches within a single video

### Character Consistency

- **Normal Reference**: Single-shot character consistency
- **My Reference**: Multi-shot continuity across scenes
- Up to **7 reference images** for defining characters, objects, scenes
- System preserves identity, clothing, features across shots

### Audio (Q3 Only)

- Synchronized dialogue generation (Chinese, English, Japanese)
- Environmental sound effects
- Background music
- Lip-sync with character movements
- Natural emotional delivery

### Other Features

- **Templates**: Pre-set effects (couple interactions, celebrations, live photos, etc.)
- **MV Generation**: One-click music video creation (minute-level)
- **Multi-Entity Consistency**: Multiple characters maintaining identity in same scene
- **Anime Generation**: Dedicated anime style support
- **Upscale**: Resolution enhancement available
- **Motion Intensity Control**: auto, small, medium, large

---

## Settings & Specifications

### Resolution Options

| Model | Resolutions |
|-------|------------|
| Vidu 2.0 | 360p, 720p, 1080p |
| Q1 | Up to 1080p |
| Q2/Q2 Pro | Up to 1080p |
| Q3 | 540p, 720p, 1080p |

### Duration

| Model | Duration |
|-------|----------|
| Vidu 2.0 | 4s (fast mode) |
| Q1 | Up to 5s |
| Q3 | 1-16s (flexible) |

### Aspect Ratios (Q3)

- 16:9 (landscape)
- 9:16 (portrait)
- 4:3 (standard)
- 3:4 (portrait standard)
- 1:1 (square)

### Motion Intensity

- Auto
- Small (subtle gestures)
- Medium (balanced)
- Large (dynamic action)

---

## API Access

### Official Vidu API Platform

- URL: `platform.vidu.com`
- Launched: February 2025
- Async generation (POST request returns task_id, poll for result)
- No high-tier subscription required - $10 minimum purchase

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| Text-to-Video | Generate from text prompt |
| Image-to-Video | Animate image with prompt |
| Reference-to-Video | Multi-reference guided generation |
| Start-End-to-Video | First + last frame interpolation |

### API Parameters (I2V Example)

```json
{
  "prompt": "description of motion and action",
  "resolution": "540p | 720p | 1080p",
  "duration": 1-16,
  "motion_intensity": "auto | small | medium | large",
  "image": "base64 or URL"
}
```

### Third-Party API Providers

| Provider | Price | Notes |
|----------|-------|-------|
| **fal.ai** | ~$0.035/sec (360p/540p), 2.2x for 720p/1080p | All modes supported |
| **Replicate** | Q3 Pro available | Per-generation pricing |
| **Segmind** | Various models | Template API available |
| **WaveSpeed AI** | Competitive | R2V 2.0 supported |
| **Runware** | Various | Multiple Vidu models |
| **Runpod** | Q3 I2V available | GPU-based pricing |
| **ComfyUI** | Free (self-hosted) | Q2 integration available |

---

## UI vs API Differences

| Feature | UI (vidu.com) | API (platform.vidu.com) |
|---------|--------------|------------------------|
| Templates | Full library | Limited/no templates |
| Off-peak free generation | Yes (unlimited) | No |
| Credit system | Monthly allocation | Pay-per-use ($0.005/credit) |
| Watermark | Free plan has watermark | No watermark |
| Queue priority | Based on plan tier | Direct access |
| Models available | All including latest | May lag behind UI |
| Batch generation | Manual | Programmatic |
| MV generation | Yes | Not available |

---

## Limitations

### Video Quality
- Complex scenes with multiple interacting elements can break down
- Overlapping limbs, extreme fast motion, liquids can look unrealistic
- Occasional AI artifacts in complex scenes
- Physics not perfect - subtle inconsistencies remain

### Prompt Adherence
- Longer prompts sometimes flatten or misinterpret key elements
- Reference images can get distorted (logos, hairstyles)
- Objects may lose physical consistency (e.g., walking through objects)

### Duration
- Max 16 seconds per generation (Q3)
- Not suitable for long-form storytelling without stitching

### Audio (Q3)
- No audio editing control - cannot fine-tune music or voices
- Limited to Chinese, English, Japanese dialogue

### Cost
- Trial-and-error expensive at higher resolutions/durations
- Each failed render still consumes credits
- Pricing ramps up unpredictably with experimentation

### General
- Template library can feel repetitive after frequent use
- Limited advanced customization for specific aesthetics
- Best viewed as accessible/beginner-friendly, not studio-grade

---

## Pricing

### Web Platform Plans

| Plan | Monthly Price | Yearly Price | Credits/mo | Videos/mo | Key Features |
|------|-------------|-------------|------------|-----------|-------------|
| **Free** | $0 | $0 | 800 | 200 | Watermark, unlimited off-peak |
| **Standard** | ~$10 | ~$8/mo | 800 | 200 | No watermark, commercial use |
| **Premium** | ~$35 | ~$28/mo | 4,000 | 1,000 | Faster generation, early features |
| **Ultimate** | ~$99 | ~$79/mo | 8,000 | 2,000 | Ultra-fast, unlimited off-peak |
| **Enterprise** | Custom | Custom | Custom | Custom | API access, team workspaces |

*Yearly plans offer ~20% discount*

### API Pricing (Official)

- Credits: **$0.005 per credit**
- Minimum purchase: **$10**
- Cost varies by resolution, duration, and feature type
- Approximate: **$0.0375 per second** of video (55% below industry average)

### Cost Examples

| Output | Approximate Cost |
|--------|-----------------|
| 4s video (360p) | ~$0.15 |
| 16s video (1080p, Q3) | ~$0.60 |
| 60s of Cinema quality | ~$2.03 |
| 60s of Standard quality | ~$0.90 |

### Third-Party API Pricing

| Provider | Pricing Model |
|----------|--------------|
| fal.ai | ~$0.035/sec (540p), ~$0.077/sec (1080p) |
| Templates on fal.ai | $0.20-$0.50 per generation |

---

## Best Practices

### Prompt Structure

```
[Subject] + [Action/Verb] + [Style/Aesthetic] + [Composition/Camera]
```

### Tips

1. **Be specific but concise** - Include subject, action, setting, style, composition
2. **Use camera language** - "push-in on face", "slow orbit around subject", "tracking shot following character"
3. **Control motion intensity** - Use "small" for subtle gestures, "large" for dynamic action
4. **Leverage references** - Upload up to 7 reference images for character/scene consistency
5. **Start with lower resolution** - Test at 540p first, then upscale winners to 1080p
6. **Use Start+End frames** - For precise control over scene transitions
7. **Q3 audio prompting** - Write dialogue directly in prompt, describe sounds and music
8. **Off-peak generation** - Free plan users get unlimited generations during off-peak hours
9. **One subject at a time** - Works best with single-subject or stylized environments
10. **Iterate with templates** - Use pre-built templates as starting points, then customize

### Model Selection Guide

| Use Case | Best Model |
|----------|-----------|
| Quick animation of a still | Q1 |
| Cinematic quality, character focus | Q2 Pro |
| Video with dialogue/sound | Q3 |
| Cheapest batch generation | Vidu 2.0 |
| Multi-character consistency | Q2 with references |

---

## Sources

- [Vidu Official](https://www.vidu.com/)
- [Vidu API Platform](https://platform.vidu.com/)
- [Vidu Pricing](https://www.vidu.com/pricing)
- [Vidu Q3 Official](https://www.vidu.com/vidu-q3)
- [KR-Asia: Vidu 2.0 Launch](https://kr-asia.com/ai-video-generation-just-got-faster-and-cheaper-with-shengshus-vidu-2-0)
- [fal.ai Vidu Models](https://fal.ai/pricing)
- [Scenario: Vidu Models Guide](https://help.scenario.com/en/articles/vidu-models-the-essentials/)
- [Cutout.pro: Vidu Q3 Camera Control](https://www.cutout.pro/learn/blog-vidu-q3-camera-control/)
- [Vidu AI Prompt Engineering](https://vidu-ai.net/prompt-engineering/)
- [VideoWeb: Q1 vs Q2 vs Q3](https://videoweb.ai/blog/detail/Which-Vidu-Model-Is-Best-Q1-vs-Q2-vs-Q3-Explained-6aeae8116cdc/)
