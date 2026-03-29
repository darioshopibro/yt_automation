# Research: Best High-Quality Sound Effects for Programmatic Video Generation

## Executive Summary

For your Remotion pipeline, you need SFX that are: (1) high quality, (2) programmatically accessible, (3) categorized for automation. After researching 10+ sources (web + YouTube), here's the complete breakdown.

---

## TIER 1: Best Options for Your Use Case (Programmatic + High Quality)

### 1. Epidemic Sound API + MCP Server -- BEST OVERALL FOR AUTOMATION
- **Quality:** 9/10 - 90,000+ professional SFX, used by top YouTubers
- **API:** Full REST API with OpenAPI 3.0 spec, search by text/mood/duration
- **MCP Server:** Official MCP server exists (Beta) at developers.epidemicsite.com
- **Search:** Semantic search ("whoosh for fast transition"), filter by duration, mood
- **Download:** Direct download endpoint for SFX
- **Pricing:** Subscription-based (~$15/mo for personal plan)
- **License:** Active subscription = cleared for commercial use
- **Verdict:** Best fit for automated pipeline. API + MCP = can be integrated directly into your Remotion build pipeline

### 2. ElevenLabs Sound Effects v2 API -- BEST AI-GENERATED
- **Quality:** 7.5/10 - Good for simple SFX (whoosh, ding, click), mixed for complex
- **API:** Full API, text-to-SFX generation
- **Specs:** 48kHz, up to 30 seconds, MP3/WAV output, seamless looping
- **Strengths:** Infinite variety, no licensing issues (you generate = you own), great for unique sounds
- **Weaknesses:** Complex prompts yield mixed results. Not as consistent as pre-made packs for professional transitions
- **Pricing:** Pay per generation (included in ElevenLabs plans)
- **You already have this:** elevenlabs-tts skill exists, SFX uses same API
- **Verdict:** Great supplement for unique/custom SFX. Not reliable enough as PRIMARY source for consistent quality

### 3. Freesound.org + MCP Server -- BEST FREE OPTION
- **Quality:** 5-8/10 (varies wildly, community-uploaded)
- **API:** Full REST API with search, filter, download
- **MCP Servers:** Multiple MCP implementations exist:
  - `johnkimdw/freesound-mcp-server` (Docker)
  - `MuShan-bit/freesound-mcp` (Python)
  - `timjrobinson/FreesoundMCPServer` (Node.js)
- **Strengths:** Free, 500K+ sounds, API ready, MCP servers ready
- **Weaknesses:** Quality inconsistent, MP3 previews (128kbps) unless OAuth2, Creative Commons licenses vary per file
- **Verdict:** Good for ambient/background sounds, not reliable for premium transition SFX

---

## TIER 2: Premium Packs (One-Time Purchase, Pre-Downloaded)

### 4. SoundMorph - Motion Graphics Pack -- BEST DEDICATED MOTION GRAPHICS PACK
- **Quality:** 10/10 - Purpose-built for motion graphics
- **Specs:** 2.8 GB, 650 files, 24-bit 96kHz WAV
- **Content:** Transitions, whooshes, UI sounds, impacts, zaps, particle sounds
- **UCS tagged:** Organized by category, metadata included
- **Pricing:** One-time purchase (~$79-149)
- **No API:** Manual download, but files are perfectly organized for programmatic use
- **Verdict:** HIGHEST QUALITY option. Buy once, organize into your asset folder, map to categories in code

### 5. BOOM Library - Cinematic Motion -- TOP PROFESSIONAL CHOICE
- **Quality:** 10/10 - Industry standard, used in film/TV/games
- **Specs:** 7.7 GB WAV files
- **Categories:** Whooshes, impacts, transitions, textures, zaps, friction
- **Pricing:** ~$99-199 per collection
- **No API:** Pre-downloaded packs
- **Verdict:** Studio-quality. If SoundMorph is great, BOOM is legendary. Both are excellent

### 6. Lens Distortions SFX Packs -- BEST FOR VIDEO EDITORS
- **Quality:** 9/10
- **Packs:**
  - Anticipation: 80 originals, 320 variations (risers, hits, whooshes, moments, atmospheres)
  - Archetype: 120+ originals, 600+ variations (risers, hits, whooshes, glitches, undertones, atmospheres)
- **Pricing:** ~$49-99 per pack
- **No API:** Pre-downloaded
- **Verdict:** Excellent variety with multiple variations per sound. Great for having options

### 7. Artlist SFX Library -- BEST ALL-IN-ONE SUBSCRIPTION
- **Quality:** 8.5/10 - 72,000+ sound effects
- **License:** Perpetual (keep using after cancellation!)
- **No public API:** Web-based download only
- **Pricing:** ~$15-25/mo subscription
- **Verdict:** Mentioned by BOTH YouTube pros (Herman Huang, Jacob Nordin) as their go-to. Great library but no API for automation

---

## TIER 3: Free Libraries (Good for Supplementing)

### 8. Pixabay Sound Effects
- **Quality:** 7/10 - 120,000+ effects
- **License:** Free, no attribution required, commercial use OK
- **API:** Basic, not as robust
- **Verdict:** Fast and safe for basic sounds (whoosh, click, UI)

### 9. Mixkit
- **Quality:** 7.5/10 - Curated, professionally produced
- **License:** Free, no attribution, commercial use OK
- **No API:** Web download
- **Verdict:** Better curated than Pixabay, fewer sounds

### 10. Uppbeat
- **Quality:** 7/10 - Safe for YouTube/TikTok
- **Free tier:** Available with attribution
- **Verdict:** Good free option

---

## KEY INSIGHTS FROM YOUTUBE PROS

From Herman Huang (819K views, "3 Sound Design Secrets"):
- **Layer sounds by frequency** - Don't use a single whoosh, layer low + mid + high frequency whooshes
- **Commit to a style** - Use SFX packs that match your visual aesthetic (don't mix random sounds)
- **His go-to:** Artlist + Happy Editing sound packs
- **Key categories used constantly:** Risers, hits, whooshes, suckbacks

From Jacob Nordin (830K views, "Sound Design for Cinematic Filmmaking"):
- **His go-to:** Artlist
- **Sound layers (in order):** Vocals > Music > Ambience > Literal SFX > Creative SFX
- **Key technique:** J-cuts and L-cuts for audio transitions
- **Reverb:** Essential for making SFX sound natural in context

From Film Editing Pro (1M views, "How to SOUND DESIGN a Video"):
- **Three steps:** Score > Ambience/Foley > Creative Sound Design
- **Key insight:** Silence is as powerful as sound
- **Variety matters:** Don't reuse the same sound effect (e.g., different keystrokes each time)

---

## RECOMMENDED STRATEGY FOR YOUR REMOTION PIPELINE

### Primary Source: Pre-Made Premium Pack (SoundMorph or BOOM Library)
**Why:** Highest quality, consistent, organized by category, perfect for mapping to animation types.

**Implementation:**
```
/assets/sfx/
  /whoosh/       - 10-20 whoosh variations (fast, slow, light, heavy)
  /impact/       - 10-20 hits/impacts
  /transition/   - 10-20 transition sounds
  /riser/        - 10-20 risers/builds
  /ui/           - clicks, dings, pops, toggles
  /atmosphere/   - subtle background textures
```

Map each animation type in Remotion to a sound category, randomly pick from variations.

### Secondary Source: Epidemic Sound API
**Why:** When you need MORE variety or specific sounds not in your pack. API-searchable, MCP server available.

### Supplementary: ElevenLabs SFX v2
**Why:** For truly custom/unique sounds. Generate on-demand when pre-made doesn't fit.

### Free Backup: Freesound MCP + Pixabay
**Why:** Zero cost, API access, good enough for ambient/background.

---

## COST COMPARISON

| Option | Cost | Quality | API | Best For |
|--------|------|---------|-----|----------|
| SoundMorph Motion Graphics | ~$99 one-time | 10/10 | No (files) | Core SFX library |
| BOOM Library Cinematic Motion | ~$149 one-time | 10/10 | No (files) | Core SFX library |
| Lens Distortions | ~$49-99 one-time | 9/10 | No (files) | Variations |
| Epidemic Sound | ~$15/mo | 9/10 | Yes (full) | On-demand search |
| Artlist | ~$15-25/mo | 8.5/10 | No | Manual download |
| ElevenLabs SFX v2 | Per generation | 7.5/10 | Yes | Custom/unique |
| Freesound | Free | 5-8/10 | Yes + MCP | Ambient/backup |
| Pixabay | Free | 7/10 | Basic | Quick basics |

---

## MY RECOMMENDATION

**Buy SoundMorph Motion Graphics pack ($99) + set up Freesound MCP server + use ElevenLabs SFX v2 for custom sounds.**

This gives you:
1. **SoundMorph** = 650 studio-quality files at 96kHz, organized by category, perfect for mapping to Remotion animations. One-time cost, no subscription.
2. **Freesound MCP** = Free API access for when you need something specific. Already has MCP servers ready to use.
3. **ElevenLabs SFX v2** = You already have the skill. Use for unique/custom sounds when nothing else fits.

If budget allows, also add **Epidemic Sound API** ($15/mo) for the best programmatic access to professional SFX with semantic search.

---

## Sources

- [SoundMorph Motion Graphics Library](https://soundmorph.com/products/motion-graphics)
- [BOOM Library Cinematic Motion](https://www.boomlibrary.com/sound-effects/cinematic-motion/)
- [Lens Distortions SFX](https://lensdistortions.com/sfx/)
- [Epidemic Sound API Docs](https://developers.epidemicsound.com/docs/)
- [Epidemic Sound MCP Server](https://developers.epidemicsite.com/docs/mcp/)
- [ElevenLabs Sound Effects v2](https://elevenlabs.io/sound-effects)
- [ElevenLabs SFX Documentation](https://elevenlabs.io/docs/overview/capabilities/sound-effects)
- [Freesound MCP Server (johnkimdw)](https://github.com/johnkimdw/freesound-mcp-server)
- [Freesound MCP Server (MuShan)](https://github.com/MuShan-bit/freesound-mcp)
- [Freesound MCP Server (Node.js)](https://github.com/timjrobinson/FreesoundMCPServer)
- [Artlist vs Epidemic Sound 2026](https://www.cchound.com/epidemic-sound/artlist-vs-epidemic-sound/)
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/)
- [Mixkit Free Sound Effects](https://mixkit.co/free-sound-effects/)
- [Uppbeat Free SFX](https://uppbeat.io/sfx)
- [Top 8 SFX Libraries 2026](https://sendshort.ai/guides/sfx-libraries/)
- [Herman Huang - 3 Sound Design Secrets](https://www.youtube.com/watch?v=tzfzkTAQsnE)
- [Jacob Nordin - Sound Design for Cinematic Filmmaking](https://www.youtube.com/watch?v=I66_LmOTlSk)
- [Film Editing Pro - How to Sound Design a Video](https://www.youtube.com/watch?v=Wcxw3BPSt3A)
