#!/usr/bin/env python3
"""
ElevenLabs Voiceover Generator - Sa optimizovanim settings
Usage: python3 generate-voiceover.py "tekst" --output voiceover.mp3
       python3 generate-voiceover.py --file input.txt --output voiceover.mp3
"""

import json
import sys
import os
import requests
from pathlib import Path

# ElevenLabs Config - OPTIMIZOVANI SETTINGS
ELEVENLABS_API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel

# NOVI OPTIMIZOVANI SETTINGS (iz research-a)
VOICE_SETTINGS = {
    "stability": 0.45,           # Sniženo sa 0.5 - prirodnije
    "similarity_boost": 0.70,    # Sniženo sa 0.75 - čistije
    "style": 0.0,                # UVEK 0 - više = lošije
    "use_speaker_boost": True
}

# Bolji model za tech termine
MODEL_ID = "eleven_multilingual_v2"

def generate_voiceover_with_timestamps(text: str, output_path: str):
    """
    Generiši voiceover sa word-level timestamps.
    Koristi optimizovane settings iz research-a.
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps"

    headers = {
        "Accept": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": VOICE_SETTINGS
    }

    print(f"Generating voiceover with {MODEL_ID}...")
    print(f"Settings: stability={VOICE_SETTINGS['stability']}, similarity={VOICE_SETTINGS['similarity_boost']}")
    print()

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        print(f"ERROR: ElevenLabs API returned {response.status_code}", file=sys.stderr)
        print(response.text, file=sys.stderr)
        sys.exit(1)

    data = response.json()

    # Izvuci audio (base64) i timestamps
    import base64

    audio_base64 = data.get("audio_base64", "")
    alignment = data.get("alignment", {})

    if not audio_base64:
        print("ERROR: No audio in response", file=sys.stderr)
        sys.exit(1)

    # Sačuvaj audio
    audio_bytes = base64.b64decode(audio_base64)
    with open(output_path, 'wb') as f:
        f.write(audio_bytes)
    print(f"Audio saved to: {output_path}")

    # Sačuvaj timestamps
    timestamps_path = output_path.replace('.mp3', '-timestamps.json')

    # Konvertuj alignment format u naš format
    words = []
    if 'characters' in alignment and 'character_start_times_seconds' in alignment:
        chars = alignment['characters']
        start_times = alignment['character_start_times_seconds']
        end_times = alignment['character_end_times_seconds']

        # Rekonstruiši reči iz karaktera
        current_word = ""
        word_start = 0
        word_end = 0

        for i, char in enumerate(chars):
            if char == ' ' or i == len(chars) - 1:
                if i == len(chars) - 1 and char != ' ':
                    current_word += char
                    word_end = end_times[i]

                if current_word.strip():
                    words.append({
                        "word": current_word.strip(),
                        "start": word_start,
                        "end": word_end
                    })
                current_word = ""
                if i + 1 < len(start_times):
                    word_start = start_times[i + 1]
            else:
                if not current_word:
                    word_start = start_times[i]
                current_word += char
                word_end = end_times[i]

    timestamps_data = {
        "model": MODEL_ID,
        "voice_settings": VOICE_SETTINGS,
        "duration": end_times[-1] if end_times else 0,
        "words": words
    }

    with open(timestamps_path, 'w', encoding='utf-8') as f:
        json.dump(timestamps_data, f, indent=2)
    print(f"Timestamps saved to: {timestamps_path}")

    return timestamps_data

def main():
    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage: python3 generate-voiceover.py \"text\"")
        print("       python3 generate-voiceover.py --file input.txt")
        print("       python3 generate-voiceover.py \"text\" --output output.mp3")
        sys.exit(1)

    # Default output
    output_path = "voiceover.mp3"

    # Parse --output
    if '--output' in sys.argv:
        out_idx = sys.argv.index('--output') + 1
        if out_idx < len(sys.argv):
            output_path = sys.argv[out_idx]

    # Učitaj tekst
    if '--file' in sys.argv:
        file_idx = sys.argv.index('--file') + 1
        if file_idx >= len(sys.argv):
            print("ERROR: --file requires a filename", file=sys.stderr)
            sys.exit(1)

        filepath = sys.argv[file_idx]
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        # Tekst kao argument (preskači flags)
        args = []
        skip_next = False
        for i, a in enumerate(sys.argv[1:], 1):
            if skip_next:
                skip_next = False
                continue
            if a.startswith('--'):
                if a in ['--output', '--file']:
                    skip_next = True
                continue
            args.append(a)
        text = ' '.join(args)

    if not text.strip():
        print("ERROR: No text provided", file=sys.stderr)
        sys.exit(1)

    print("=" * 60)
    print("INPUT TEXT:")
    print("=" * 60)
    print(text[:200] + "..." if len(text) > 200 else text)
    print()

    # Generiši voiceover
    result = generate_voiceover_with_timestamps(text, output_path)

    print()
    print("=" * 60)
    print("DONE!")
    print("=" * 60)
    print(f"Duration: {result['duration']:.2f} seconds")
    print(f"Words: {len(result['words'])}")

if __name__ == "__main__":
    main()
