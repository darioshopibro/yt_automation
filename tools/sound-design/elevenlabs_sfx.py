"""ElevenLabs SFX generator — backup for when Freesound doesn't have what we need.

Generates custom sound effects from text prompts using ElevenLabs API.
Same API key as TTS — no extra cost setup.

Usage:
    from elevenlabs_sfx import generate_sfx
    generate_sfx("soft whoosh transition", duration=1.5, output_path="whoosh.mp3")
"""

import urllib.request
import json
import os
import sys

# Load API key from .env
def _get_api_key():
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("ELEVENLABS_API_KEY="):
                    return line.split("=", 1)[1].strip()
    return os.environ.get("ELEVENLABS_API_KEY", "")


def generate_sfx(prompt, duration=None, output_path=None, prompt_influence=0.5):
    """Generate a sound effect from a text prompt.

    Args:
        prompt: Description like "soft whoosh transition sound"
        duration: Duration in seconds (0.5-30). None = auto
        output_path: Where to save the MP3. None = return bytes
        prompt_influence: 0-1 (higher = more literal interpretation)

    Returns:
        bytes if no output_path, else the output_path string
    """
    api_key = _get_api_key()
    if not api_key:
        raise ValueError("ELEVENLABS_API_KEY not found in .env or environment")

    payload = {
        "text": prompt,
        "prompt_influence": prompt_influence,
    }
    if duration is not None:
        payload["duration_seconds"] = max(0.5, min(duration, 30))

    data = json.dumps(payload).encode()
    url = "https://api.elevenlabs.io/v1/sound-generation"
    req = urllib.request.Request(url, data=data, headers={
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    })

    with urllib.request.urlopen(req, timeout=30) as resp:
        audio = resp.read()

    if output_path:
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(audio)
        return output_path

    return audio


def generate_sfx_batch(prompts, output_dir):
    """Generate multiple SFX from a list of prompt dicts.

    Args:
        prompts: list of {"prompt": "...", "duration": N, "filename": "name.mp3"}
        output_dir: directory to save files

    Returns:
        list of {"prompt": ..., "path": ..., "status": "ok"/"error", "error": ...}
    """
    os.makedirs(output_dir, exist_ok=True)
    results = []

    for p in prompts:
        prompt = p["prompt"]
        duration = p.get("duration")
        filename = p.get("filename", prompt.replace(" ", "_")[:30] + ".mp3")
        output_path = os.path.join(output_dir, filename)

        try:
            generate_sfx(prompt, duration=duration, output_path=output_path)
            results.append({"prompt": prompt, "path": output_path, "status": "ok"})
        except Exception as e:
            results.append({"prompt": prompt, "path": None, "status": "error", "error": str(e)})

    return results


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 elevenlabs_sfx.py 'prompt' [duration] [output.mp3]")
        sys.exit(1)

    prompt = sys.argv[1]
    duration = float(sys.argv[2]) if len(sys.argv) > 2 else None
    output = sys.argv[3] if len(sys.argv) > 3 else f"sfx_{prompt.replace(' ', '_')[:20]}.mp3"

    result = generate_sfx(prompt, duration=duration, output_path=output)
    print(f"✅ Generated: {result} ({os.path.getsize(result):,} bytes)")
