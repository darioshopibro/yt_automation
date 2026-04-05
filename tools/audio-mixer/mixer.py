"""Audio Mixer — combines voiceover + background music + SFX into final mix.

Reads master-composition.json for:
- Voiceover file path
- SFX timeline (frame → file + volume)
- Ducking zones (where music drops for voiceover)
- Music config (base volume, ducked volume, ramp frames)

Uses pydub (already installed) + ffmpeg (already installed).

Audio standards from research:
- Voiceover: -6 to -10 dB peak
- Music during speech: -30 dB (ducked)
- Music between speech: -18 dB
- SFX: varies by type (hit: -9dB, whoosh: -12dB, click: -16dB)
- Final: -13 LUFS, -1 dBTP true peak
"""

import json
import os
import sys
import subprocess

from pydub import AudioSegment


SFX_LIBRARY_DIR = os.path.join(os.path.dirname(__file__), "..", "sound-design", "library")


def _frame_to_ms(frame, fps=30):
    return int(frame / fps * 1000)


def _db_from_volume(volume):
    """Convert 0-1 volume to dB reduction. 1.0 = 0dB, 0.5 = -6dB, 0.1 = -20dB."""
    if volume <= 0:
        return -60
    import math
    return 20 * math.log10(volume)


def load_voiceover(path):
    """Load voiceover audio file."""
    return AudioSegment.from_file(path)


def load_sfx(file_path):
    """Load an SFX file from the library."""
    # Try library path first
    full_path = os.path.join(SFX_LIBRARY_DIR, file_path)
    if os.path.exists(full_path):
        return AudioSegment.from_file(full_path)

    # Try absolute path
    if os.path.exists(file_path):
        return AudioSegment.from_file(file_path)

    return None


def mix_audio(composition_path, voiceover_path, music_path=None, output_path=None):
    """Mix voiceover + music + SFX according to master-composition.json.

    Args:
        composition_path: path to master-composition.json
        voiceover_path: path to voiceover.mp3
        music_path: path to background music (optional)
        output_path: where to save the mix (default: mixed_audio.mp3 next to composition)

    Returns:
        output path
    """
    with open(composition_path) as f:
        comp = json.load(f)

    fps = comp.get("meta", {}).get("fps", 30)
    total_frames = comp.get("meta", {}).get("totalFrames", 0)
    total_ms = _frame_to_ms(total_frames, fps)

    # === LOAD VOICEOVER ===
    print(f"  Loading voiceover: {voiceover_path}")
    voice = load_voiceover(voiceover_path)
    total_ms = max(total_ms, len(voice))

    # === CREATE BASE (silent track at full duration) ===
    base = AudioSegment.silent(duration=total_ms)

    # === LAYER 1: VOICEOVER ===
    base = base.overlay(voice, position=0)
    print(f"  ✅ Voiceover layered ({len(voice)}ms)")

    # === LAYER 2: BACKGROUND MUSIC (with ducking) ===
    if music_path and os.path.exists(music_path):
        print(f"  Loading music: {music_path}")
        music = AudioSegment.from_file(music_path)

        # Loop music if shorter than video
        if len(music) < total_ms:
            loops = (total_ms // len(music)) + 1
            music = music * loops
        music = music[:total_ms]

        # Apply ducking
        music_config = comp.get("audio", {}).get("music", {})
        base_vol_db = _db_from_volume(music_config.get("baseVolume", 0.35))
        duck_vol_db = _db_from_volume(music_config.get("duckedVolume", 0.08))
        ramp_frames = music_config.get("duckRampFrames", 10)
        ramp_ms = max(_frame_to_ms(ramp_frames, fps), 300)  # min 300ms ramp for smooth transition

        ducking_zones = comp.get("audio", {}).get("duckingZones", [])

        # Merge close ducking zones (gap < 500ms) to avoid rapid volume pumping
        merged_zones = []
        for zone in ducking_zones:
            start_ms = _frame_to_ms(zone["startFrame"], fps)
            end_ms = _frame_to_ms(zone["endFrame"], fps)
            if merged_zones and start_ms - merged_zones[-1]["end_ms"] < 500:
                # Merge with previous zone
                merged_zones[-1]["end_ms"] = end_ms
            else:
                merged_zones.append({"start_ms": start_ms, "end_ms": end_ms})

        # Build volume curve: for each millisecond, determine target volume
        # Instead of cutting abruptly, we create smooth fades
        ducked_music = music + base_vol_db

        for zone in merged_zones:
            zs = zone["start_ms"]
            ze = zone["end_ms"]
            if zs >= len(ducked_music) or ze > len(ducked_music):
                continue

            # Simple approach: reduce volume in ducked zone, pydub handles transitions
            duck_db = duck_vol_db - base_vol_db  # negative number

            # Fade down into zone
            fade_in_start = max(0, zs - ramp_ms)
            if fade_in_start < zs and fade_in_start < len(ducked_music):
                ramp_seg = ducked_music[fade_in_start:zs]
                # Gradual volume reduction over ramp
                steps = max(len(ramp_seg) // 50, 1)
                step_size = len(ramp_seg) // steps
                faded = AudioSegment.empty()
                for s in range(steps):
                    chunk = ramp_seg[s*step_size:(s+1)*step_size]
                    ratio = s / steps
                    faded += chunk + (duck_db * ratio)
                ducked_music = ducked_music[:fade_in_start] + faded + ducked_music[zs:]

            # Quiet zone
            if zs < len(ducked_music) and ze <= len(ducked_music):
                quiet = ducked_music[zs:ze] + duck_db
                ducked_music = ducked_music[:zs] + quiet + ducked_music[ze:]

            # Fade up out of zone
            fade_out_end = min(ze + ramp_ms, len(ducked_music))
            if ze < fade_out_end and ze < len(ducked_music):
                ramp_seg = ducked_music[ze:fade_out_end]
                steps = max(len(ramp_seg) // 50, 1)
                step_size = len(ramp_seg) // steps
                faded = AudioSegment.empty()
                for s in range(steps):
                    chunk = ramp_seg[s*step_size:(s+1)*step_size]
                    ratio = 1 - (s / steps)
                    faded += chunk + (duck_db * ratio)
                ducked_music = ducked_music[:ze] + faded + ducked_music[fade_out_end:]

        # Fade in at start, fade out at end
        fade_in = max(_frame_to_ms(music_config.get("fadeInEndFrame", 30), fps), 1000)
        fade_out_duration = min(total_ms - _frame_to_ms(music_config.get("fadeOutStartFrame", total_frames - 60), fps), 3000)
        ducked_music = ducked_music.fade_in(fade_in).fade_out(max(fade_out_duration, 1000))

        base = base.overlay(ducked_music, position=0)
        print(f"  ✅ Music layered with ducking ({len(ducking_zones)} zones)")
    else:
        print(f"  ⏭️  No background music (skipping)")

    # === LAYER 3: SFX ===
    sfx_list = comp.get("audio", {}).get("sfx", [])
    sfx_loaded = 0
    sfx_failed = 0

    for sfx in sfx_list:
        frame = sfx.get("frame", 0)
        position_ms = _frame_to_ms(frame, fps)
        volume = sfx.get("volume", 0.25)
        file_path = sfx.get("file", "")

        if not file_path:
            sfx_failed += 1
            continue

        sound = load_sfx(file_path)
        if sound is None:
            sfx_failed += 1
            continue

        # Apply volume
        vol_db = _db_from_volume(volume)
        sound = sound + vol_db

        # Overlay at position
        if position_ms < total_ms:
            base = base.overlay(sound, position=position_ms)
            sfx_loaded += 1

    print(f"  ✅ SFX layered: {sfx_loaded} loaded, {sfx_failed} failed")

    # === NORMALIZE ===
    # Only normalize if the mix is too quiet. Never boost more than +3dB
    # to avoid amplifying noise and ruining voice quality.
    target_dbfs = -16
    change_db = target_dbfs - base.dBFS
    change_db = min(change_db, 3.0)  # never boost more than 3dB
    change_db = max(change_db, -6.0)  # never cut more than 6dB
    if abs(change_db) > 0.5:
        base = base + change_db
        print(f"  ✅ Normalized (change: {change_db:+.1f}dB)")
    else:
        print(f"  ✅ Levels OK, no normalization needed")

    # === EXPORT ===
    if not output_path:
        output_path = os.path.join(os.path.dirname(composition_path), "mixed_audio.mp3")

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    base.export(output_path, format="mp3", bitrate="192k")
    print(f"  ✅ Exported: {output_path} ({os.path.getsize(output_path):,} bytes)")

    # === OPTIONAL: FFmpeg loudnorm for proper LUFS ===
    lufs_path = output_path.replace(".mp3", "_lufs.mp3")
    try:
        cmd = [
            "ffmpeg", "-y", "-i", output_path,
            "-af", "loudnorm=I=-13:LRA=7:TP=-1",
            "-ar", "44100", "-ab", "192k",
            lufs_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            os.replace(lufs_path, output_path)
            print(f"  ✅ LUFS normalized with ffmpeg (-13 LUFS, -1 dBTP)")
        else:
            # Clean up failed attempt
            if os.path.exists(lufs_path):
                os.remove(lufs_path)
    except Exception:
        if os.path.exists(lufs_path):
            os.remove(lufs_path)

    return output_path


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 mixer.py <master-composition.json> <voiceover.mp3> [music.mp3]")
        sys.exit(1)

    comp_path = sys.argv[1]
    voice_path = sys.argv[2]
    music_path = sys.argv[3] if len(sys.argv) > 3 else None

    output = mix_audio(comp_path, voice_path, music_path)
    print(f"\n🎵 Final mix: {output}")
