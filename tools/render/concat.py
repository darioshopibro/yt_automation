"""Final concat pipeline — combines Remotion render + AI video clips + mixed audio into final mp4.

Reads master-composition.json for:
- Beat timeline (which beats are ai_video vs motion_graphics)
- AI video clip paths
- Mixed audio path

Pipeline:
1. Render Remotion project → motion_graphics.mp4 (or use existing)
2. Insert AI video clips at their frame positions
3. Overlay mixed audio (voice + SFX + music)
4. Output → final_video.mp4
"""

import json
import os
import sys
import subprocess


def _frame_to_seconds(frame, fps=30):
    return frame / fps


def render_remotion(project_dir, output_path, fps=30, total_frames=None):
    """Render Remotion project to mp4.

    Uses npx remotion render if the project has a valid Remotion setup.
    Returns output path or None if failed.
    """
    remotion_dir = project_dir
    if not os.path.exists(os.path.join(remotion_dir, "package.json")):
        # Try videos/ path
        remotion_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "videos", os.path.basename(project_dir))

    if not os.path.exists(os.path.join(remotion_dir, "package.json")):
        print(f"  ⚠️ No Remotion project found at {remotion_dir}")
        return None

    print(f"  🎬 Rendering Remotion project: {remotion_dir}")
    cmd = [
        "npx", "remotion", "render",
        "DynamicPipeline",
        output_path,
        "--codec", "h264",
    ]
    if total_frames:
        cmd.extend(["--frames", f"0-{total_frames}"])

    try:
        result = subprocess.run(cmd, cwd=remotion_dir, capture_output=True, text=True, timeout=600)
        if result.returncode == 0 and os.path.exists(output_path):
            print(f"  ✅ Remotion rendered: {output_path}")
            return output_path
        else:
            print(f"  ❌ Remotion render failed: {result.stderr[:200]}")
            return None
    except Exception as e:
        print(f"  ❌ Remotion render error: {e}")
        return None


def concat_with_ai_clips(base_video, ai_clips, output_path, fps=30):
    """Insert AI video clips into the base Remotion render at their frame positions.

    Uses FFmpeg to overlay AI clips at specific timestamps.
    """
    if not ai_clips or not base_video:
        return base_video

    print(f"  🎬 Inserting {len(ai_clips)} AI clips...")

    # Build FFmpeg filter chain for overlaying clips
    inputs = ["-i", base_video]
    filter_parts = []

    for i, clip in enumerate(ai_clips):
        clip_path = clip.get("videoPath", "")
        if not clip_path or not os.path.exists(clip_path):
            continue

        start_sec = _frame_to_seconds(clip.get("startFrame", 0), fps)
        end_sec = _frame_to_seconds(clip.get("endFrame", 0), fps)
        duration = end_sec - start_sec

        inputs.extend(["-i", clip_path])
        input_idx = i + 1

        # Scale clip to 1920x1080 and overlay at the right time
        label_in = f"[{input_idx}:v]"
        label_out = f"[clip{i}]"
        filter_parts.append(
            f"{label_in}scale=1920:1080,setpts=PTS-STARTPTS{label_out}"
        )

    if not filter_parts:
        return base_video

    # Build overlay chain
    current = "[0:v]"
    for i in range(len(filter_parts)):
        clip = ai_clips[i]
        start_sec = _frame_to_seconds(clip.get("startFrame", 0), fps)
        next_label = f"[out{i}]" if i < len(filter_parts) - 1 else "[outv]"
        filter_parts.append(
            f"{current}[clip{i}]overlay=enable='between(t,{start_sec:.2f},{start_sec + 5:.2f})'{next_label}"
        )
        current = next_label

    filter_complex = ";".join(filter_parts)

    cmd = ["ffmpeg", "-y"] + inputs + [
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "0:a?",
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac",
        output_path,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            print(f"  ✅ AI clips inserted: {output_path}")
            return output_path
        else:
            print(f"  ⚠️ AI clip overlay failed, using base video: {result.stderr[:200]}")
            return base_video
    except Exception as e:
        print(f"  ⚠️ AI clip overlay error: {e}")
        return base_video


def replace_audio(video_path, audio_path, output_path):
    """Replace video audio with mixed audio (voice + SFX + music)."""
    print(f"  🔊 Replacing audio with mixed track...")

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        output_path,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print(f"  ✅ Audio replaced: {output_path}")
            return output_path
        else:
            print(f"  ❌ Audio replace failed: {result.stderr[:200]}")
            return video_path
    except Exception as e:
        print(f"  ❌ Audio replace error: {e}")
        return video_path


def create_video_from_audio_and_clips(audio_path, ai_clips, output_path, total_duration, fps=30):
    """Create video from mixed audio + AI clips (when no Remotion render available).

    Makes a black background video with AI clips overlaid at their positions.
    This is a fallback when Remotion render isn't available.
    """
    print(f"  🎬 Creating video from audio + AI clips (no Remotion render)...")

    total_frames = int(total_duration * fps)

    # Start with black background + audio
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"color=c=black:s=1920x1080:d={total_duration:.2f}:r={fps}",
        "-i", audio_path,
        "-c:v", "libx264", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        "-map", "0:v", "-map", "1:a",
        "-shortest",
        output_path,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print(f"  ✅ Base video created: {output_path}")

            # If we have AI clips, overlay them
            if ai_clips:
                final = concat_with_ai_clips(output_path, ai_clips, output_path.replace(".mp4", "_final.mp4"), fps)
                if final != output_path:
                    os.replace(final, output_path)

            return output_path
        else:
            print(f"  ❌ Video creation failed: {result.stderr[:200]}")
            return None
    except Exception as e:
        print(f"  ❌ Video creation error: {e}")
        return None


def run_concat(project_dir):
    """Full concat pipeline for a project.

    Reads master-composition.json and produces final_video.mp4.
    """
    comp_path = os.path.join(project_dir, "master-composition.json")
    if not os.path.exists(comp_path):
        print(f"❌ No master-composition.json in {project_dir}")
        return None

    with open(comp_path) as f:
        comp = json.load(f)

    meta = comp.get("meta", {})
    fps = meta.get("fps", 30)
    total_frames = meta.get("totalFrames", 0)
    total_duration = meta.get("totalDurationSec", total_frames / fps)
    title = meta.get("title", "video")

    print(f"\n{'='*60}")
    print(f"FINAL CONCAT — {title}")
    print(f"{'='*60}")
    print(f"Duration: {total_duration:.1f}s | Frames: {total_frames} | FPS: {fps}")

    # Find mixed audio
    mixed_audio = os.path.join(project_dir, "mixed_audio.mp3")
    if not os.path.exists(mixed_audio):
        # Try voiceover as fallback
        voiceover = os.path.join(project_dir, "voiceover.mp3")
        voiceover_chris = os.path.join(project_dir, "voiceover-chris.mp3")
        if os.path.exists(voiceover_chris):
            mixed_audio = voiceover_chris
        elif os.path.exists(voiceover):
            mixed_audio = voiceover
        else:
            print("  ❌ No audio file found")
            return None
    print(f"  Audio: {os.path.basename(mixed_audio)}")

    # Find AI clips
    ai_clips = comp.get("aiVideoClips", [])
    valid_clips = [c for c in ai_clips if c.get("videoPath") and os.path.exists(c["videoPath"])]
    print(f"  AI clips: {len(valid_clips)} available")

    # Output path
    output_path = os.path.join(project_dir, "final_video.mp4")

    # Try Remotion render first
    remotion_output = os.path.join(project_dir, "remotion_render.mp4")
    rendered = render_remotion(project_dir, remotion_output, fps, total_frames)

    if rendered:
        # Have Remotion render → insert AI clips → replace audio
        if valid_clips:
            with_clips = concat_with_ai_clips(rendered, valid_clips, os.path.join(project_dir, "with_clips.mp4"), fps)
        else:
            with_clips = rendered

        final = replace_audio(with_clips, mixed_audio, output_path)
    else:
        # No Remotion render → create from audio + AI clips
        final = create_video_from_audio_and_clips(mixed_audio, valid_clips, output_path, total_duration, fps)

    if final and os.path.exists(final):
        size_mb = os.path.getsize(final) / (1024 * 1024)
        print(f"\n{'='*60}")
        print(f"✅ FINAL VIDEO: {final} ({size_mb:.1f} MB)")
        print(f"{'='*60}")
        return final
    else:
        print(f"\n❌ Concat failed")
        return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 concat.py <project_dir>")
        print("Example: python3 concat.py workspace/how-llms-work")
        sys.exit(1)

    project = sys.argv[1]
    base = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    project_dir = os.path.join(base, project) if not os.path.isabs(project) else project

    run_concat(project_dir)
