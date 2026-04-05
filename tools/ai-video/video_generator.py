"""AI Video Generator — generates images with Flux, animates with Higgsfield via fal.ai.

Pipeline per clip:
1. Generate image from prompt (Flux dev on fal.ai)
2. Animate image → 3-5s video (Higgsfield image-to-video on fal.ai)

Reads visual-plan.json for beats that need ai_video.
Outputs video clips to project's public/clips/ folder.
"""

import urllib.request
import json
import os
import sys
import time
import base64

FAL_API_BASE = "https://fal.run"
FAL_QUEUE_BASE = "https://queue.fal.run"


def _get_fal_key():
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("FAL_KEY="):
                    return line.split("=", 1)[1].strip()
    return os.environ.get("FAL_KEY", "")


def _fal_sync(endpoint, payload, timeout=120):
    """Synchronous fal.ai call — use for fast operations (image gen)."""
    key = _get_fal_key()
    if not key:
        raise ValueError("FAL_KEY not found in .env")

    url = f"{FAL_API_BASE}/{endpoint}"
    data = json.dumps(payload).encode()

    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Key {key}",
        "Content-Type": "application/json",
    })

    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _fal_queue(endpoint, payload, timeout=300):
    """Async fal.ai call with polling — use for slow operations (video gen)."""
    key = _get_fal_key()
    if not key:
        raise ValueError("FAL_KEY not found in .env")

    url = f"{FAL_QUEUE_BASE}/{endpoint}"
    data = json.dumps(payload).encode()

    # Submit to queue
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Key {key}",
        "Content-Type": "application/json",
    })

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    # Direct result (no queue)
    if "video" in result or "output" in result:
        return result

    request_id = result.get("request_id")
    if not request_id:
        return result

    # Use URLs from response (fal.ai may shorten endpoint paths)
    status_url = result.get("status_url", f"{FAL_QUEUE_BASE}/{endpoint}/requests/{request_id}/status")
    result_url = result.get("response_url", f"{FAL_QUEUE_BASE}/{endpoint}/requests/{request_id}")

    start = time.time()
    while time.time() - start < timeout:
        status_req = urllib.request.Request(status_url, headers={
            "Authorization": f"Key {key}",
        })
        try:
            with urllib.request.urlopen(status_req, timeout=15) as resp:
                status = json.loads(resp.read().decode("utf-8"))
        except Exception:
            time.sleep(5)
            continue

        s = status.get("status", "")
        if s == "COMPLETED":
            result_req = urllib.request.Request(result_url, headers={
                "Authorization": f"Key {key}",
            })
            with urllib.request.urlopen(result_req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))

        if s in ("FAILED", "CANCELLED"):
            raise Exception(f"fal.ai job {s}: {status}")

        pos = status.get("queue_position", "?")
        print(f"    ⏳ Queue position: {pos}, status: {s}...")
        time.sleep(5)

    raise TimeoutError(f"fal.ai job timed out after {timeout}s")


def generate_image(prompt, width=1920, height=1080):
    """Generate an image using Flux dev on fal.ai.

    Returns dict with image URL.
    """
    result = _fal_sync("fal-ai/flux/dev", {
        "prompt": prompt,
        "image_size": {"width": width, "height": height},
        "num_images": 1,
        "enable_safety_checker": False,
    })

    images = result.get("images", [])
    if images:
        return {
            "url": images[0].get("url", ""),
            "width": images[0].get("width", width),
            "height": images[0].get("height", height),
            "prompt": prompt,
        }
    return None


def generate_video_from_image(image_url, prompt="", duration=5, model="minimax"):
    """Animate an image into a video using AI on fal.ai.

    Models:
        - minimax: Minimax/Hailuo ($0.27/clip, fast, good quality)
        - kling: Kling 3.0 ($0.50/clip, best for start+end frame)

    Args:
        image_url: URL of the source image
        prompt: motion/camera description
        duration: video length in seconds (3-5 recommended)
        model: "minimax" or "kling"

    Returns dict with video URL.
    """
    endpoints = {
        "minimax": "fal-ai/minimax-video/image-to-video",
        "kling": "fal-ai/kling-video/v2/standard/image-to-video",
    }

    endpoint = endpoints.get(model, endpoints["minimax"])
    motion = prompt or "subtle cinematic camera movement, slow zoom in, atmospheric"

    payload = {"image_url": image_url, "prompt": motion}
    if model == "kling":
        payload["duration"] = str(min(duration, 5))

    result = _fal_queue(endpoint, payload, timeout=300)

    # Response format varies by model
    video = result.get("video", {})
    if isinstance(video, dict):
        return {"url": video.get("url", ""), "duration": duration, "prompt": motion, "model": model}
    elif isinstance(video, str):
        return {"url": video, "duration": duration, "prompt": motion, "model": model}

    # Some models return differently
    output_url = result.get("output", {}).get("url", "") if isinstance(result.get("output"), dict) else result.get("video_url", "")
    if output_url:
        return {"url": output_url, "duration": duration, "prompt": motion, "model": model}

    return None


def download_file(url, output_path):
    """Download a file from URL to local path."""
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        with open(output_path, "wb") as f:
            f.write(resp.read())
    return output_path


def _check_image_quality(img_path, min_size_kb=100):
    """Quality gate for generated images. Returns (passed, reason)."""
    if not os.path.exists(img_path):
        return False, "File does not exist"
    size_kb = os.path.getsize(img_path) / 1024
    if size_kb < min_size_kb:
        return False, f"Image too small ({size_kb:.0f}KB < {min_size_kb}KB) — likely blank or error"
    return True, "ok"


def _check_video_quality(vid_path, min_size_kb=500):
    """Quality gate for generated videos. Returns (passed, reason)."""
    if not os.path.exists(vid_path):
        return False, "File does not exist"
    size_kb = os.path.getsize(vid_path) / 1024
    if size_kb < min_size_kb:
        return False, f"Video too small ({size_kb:.0f}KB < {min_size_kb}KB) — likely corrupt or static"
    return True, "ok"


def generate_clip(prompt, output_dir, clip_name="clip", motion_prompt=None, duration=5, max_retries=2):
    """Full pipeline: prompt → image → video → downloaded file.

    Includes quality gates: retries image/video generation if output is
    too small (blank/corrupt). Max retries per step controlled by max_retries.

    Args:
        prompt: image description
        output_dir: where to save files
        clip_name: base filename (without extension)
        motion_prompt: camera/motion description for video
        duration: video length
        max_retries: max retry attempts per step on quality failure

    Returns dict with paths and metadata.
    """
    os.makedirs(output_dir, exist_ok=True)
    result = {"prompt": prompt, "clip_name": clip_name, "steps": []}

    # Step 1: Generate image (with quality gate + retry)
    image = None
    img_path = os.path.join(output_dir, f"{clip_name}.png")

    for attempt in range(1, max_retries + 2):
        print(f"  🖼️  Generating image (attempt {attempt}): {prompt[:60]}...")
        try:
            image = generate_image(prompt)
            if not image or not image.get("url"):
                result["steps"].append({"step": "image_gen", "status": "failed", "attempt": attempt})
                continue

            download_file(image["url"], img_path)
            passed, reason = _check_image_quality(img_path)
            if passed:
                result["image_path"] = img_path
                result["image_url"] = image["url"]
                result["steps"].append({"step": "image_gen", "status": "ok", "path": img_path, "attempt": attempt})
                print(f"  ✅ Image saved: {img_path} ({os.path.getsize(img_path)/1024:.0f}KB)")
                break
            else:
                print(f"  ⚠️ Quality check failed: {reason}")
                result["steps"].append({"step": "image_gen", "status": "quality_fail", "reason": reason, "attempt": attempt})
                os.remove(img_path)
                image = None
        except Exception as e:
            result["steps"].append({"step": "image_gen", "status": "failed", "error": str(e), "attempt": attempt})
            image = None

    if not image:
        result["error"] = "Image generation failed after all retries"
        return result

    # Step 2: Animate to video (with quality gate + retry)
    vid_path = os.path.join(output_dir, f"{clip_name}.mp4")

    for attempt in range(1, max_retries + 2):
        print(f"  🎬 Animating (attempt {attempt}, {duration}s)...")
        try:
            video = generate_video_from_image(
                image["url"],
                prompt=motion_prompt or "subtle cinematic camera movement, slow zoom in",
                duration=duration,
            )
            if not video or not video.get("url"):
                result["steps"].append({"step": "video_gen", "status": "failed", "attempt": attempt})
                continue

            download_file(video["url"], vid_path)
            passed, reason = _check_video_quality(vid_path)
            if passed:
                result["video_path"] = vid_path
                result["video_url"] = video["url"]
                result["steps"].append({"step": "video_gen", "status": "ok", "path": vid_path, "attempt": attempt})
                print(f"  ✅ Video saved: {vid_path} ({os.path.getsize(vid_path)/1024:.0f}KB)")
                break
            else:
                print(f"  ⚠️ Quality check failed: {reason}")
                result["steps"].append({"step": "video_gen", "status": "quality_fail", "reason": reason, "attempt": attempt})
                os.remove(vid_path)
        except Exception as e:
            result["steps"].append({"step": "video_gen", "status": "failed", "error": str(e), "attempt": attempt})

    if "video_path" not in result:
        result["error"] = "Video generation failed after all retries"
        return result

    result["status"] = "ok"
    return result


def generate_clips_from_visual_plan(visual_plan_path, output_dir):
    """Generate AI video clips for all beats marked as ai_video in visual-plan.json.

    Reads visual-plan.json, finds beats with visual_type="ai_video",
    generates image + video for each.
    """
    with open(visual_plan_path) as f:
        plan = json.load(f)

    beats = plan.get("beats", plan.get("segments", []))
    ai_beats = [b for b in beats if b.get("visual_type") == "ai_video"]

    if not ai_beats:
        print("No ai_video beats found in visual plan.")
        return []

    print(f"\n{'='*60}")
    print(f"AI VIDEO GENERATION — {len(ai_beats)} clips")
    print(f"{'='*60}")

    results = []
    for i, beat in enumerate(ai_beats):
        prompt = beat.get("ai_video_prompt", "")
        beat_id = beat.get("beat_id", f"clip_{i+1}")
        duration = min(max(beat.get("duration_s", 5), 3), 5)  # 3-5s range

        print(f"\nClip {i+1}/{len(ai_beats)}: {beat_id}")
        result = generate_clip(
            prompt=prompt,
            output_dir=output_dir,
            clip_name=beat_id,
            duration=duration,
        )
        result["beat_id"] = beat_id
        result["startFrame"] = beat.get("startFrame", 0)
        result["endFrame"] = beat.get("endFrame", 0)
        results.append(result)

    # Save results
    results_path = os.path.join(output_dir, "ai_clips_results.json")
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)

    ok = sum(1 for r in results if r.get("status") == "ok")
    print(f"\n{'='*60}")
    print(f"Done: {ok}/{len(results)} clips generated successfully")
    print(f"📄 Results: {results_path}")
    print(f"{'='*60}")

    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 video_generator.py single 'prompt' [output_dir]")
        print("  python3 video_generator.py plan <visual-plan.json> [output_dir]")
        sys.exit(1)

    mode = sys.argv[1]

    if mode == "single":
        prompt = sys.argv[2] if len(sys.argv) > 2 else "A programmer staring at code, cinematic lighting, dramatic"
        output_dir = sys.argv[3] if len(sys.argv) > 3 else "ai-clips-test"
        result = generate_clip(prompt, output_dir, "test_clip")
        print(json.dumps({k: v for k, v in result.items() if k != "steps"}, indent=2))

    elif mode == "plan":
        plan_path = sys.argv[2]
        output_dir = sys.argv[3] if len(sys.argv) > 3 else plan_path.replace("visual-plan.json", "ai-clips")
        generate_clips_from_visual_plan(plan_path, output_dir)
