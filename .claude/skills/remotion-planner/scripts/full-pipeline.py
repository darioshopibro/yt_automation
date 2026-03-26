#!/usr/bin/env python3
"""
TTS PIPELINE - Tech Terms + Voiceover Generation
Text cleaning radi AI agent (vidi reference/text-cleaning.md)

Usage: python3 full-pipeline.py --file transcript.txt --output-dir ./output/
       python3 full-pipeline.py "tekst" --output-dir ./output/
"""

import json
import sys
import re
import base64
import requests
from pathlib import Path

# ============================================================
# CONFIG
# ============================================================

ELEVENLABS_API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998"
VOICE_ID = "IKne3meq5aSn9XLyUdCD"  # Charlie - Deep, Confident, Energetic

VOICE_SETTINGS = {
    "stability": 0.50,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": True
}

MODEL_ID = "eleven_multilingual_v2"

# Dictionary path
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent.parent
DICTIONARY_PATH = PROJECT_ROOT / "research" / "tech-terms-dictionary.json"

# ============================================================
# TECH TERMS PREPROCESSING
# ============================================================

def load_dictionary():
    """Učitaj dictionary iz JSON fajla"""
    if not DICTIONARY_PATH.exists():
        print(f"WARNING: Dictionary not found at {DICTIONARY_PATH}")
        return {}

    with open(DICTIONARY_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    all_terms = {}
    for category, terms in data.items():
        if category not in ['version', 'description', 'lastUpdated', 'notes']:
            if isinstance(terms, dict):
                all_terms.update(terms)

    return all_terms

def preprocess_tech_terms(text: str, dictionary: dict) -> str:
    """Zameni tehničke termine fonetskim verzijama"""
    processed = text
    sorted_terms = sorted(dictionary.items(), key=lambda x: len(x[0]), reverse=True)

    for term, replacement in sorted_terms:
        escaped_term = re.escape(term)
        pattern = r'\b' + escaped_term + r'\b'
        processed = re.sub(pattern, replacement, processed)

    return processed

def auto_fix_unknown_acronyms(text: str, dictionary: dict) -> str:
    """Automatski dodaj razmake u nepoznate CAPS reči"""
    caps_pattern = r'\b[A-Z]{2,}\b'
    found_caps = set(re.findall(caps_pattern, text))
    unknown = [word for word in found_caps if word not in dictionary]

    processed = text
    for acronym in unknown:
        spaced = ' '.join(list(acronym))
        pattern = r'\b' + re.escape(acronym) + r'\b'
        processed = re.sub(pattern, spaced, processed)

    return processed

# ============================================================
# VOICEOVER GENERATION
# ============================================================

def generate_voiceover(text: str, output_dir: Path):
    """Generiši voiceover sa timestamps"""

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

    print(f"\n[GENERATING] Model: {MODEL_ID}")
    print(f"[SETTINGS] stability={VOICE_SETTINGS['stability']}, similarity={VOICE_SETTINGS['similarity_boost']}")

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        print(f"ERROR: ElevenLabs API returned {response.status_code}", file=sys.stderr)
        print(response.text, file=sys.stderr)
        sys.exit(1)

    data = response.json()

    audio_base64 = data.get("audio_base64", "")
    alignment = data.get("alignment", {})

    if not audio_base64:
        print("ERROR: No audio in response", file=sys.stderr)
        sys.exit(1)

    # Sačuvaj audio
    audio_path = output_dir / "voiceover.mp3"
    audio_bytes = base64.b64decode(audio_base64)
    with open(audio_path, 'wb') as f:
        f.write(audio_bytes)
    print(f"[SAVED] Audio: {audio_path}")

    # Parsiraj timestamps
    words = []
    duration = 0

    if 'characters' in alignment:
        chars = alignment['characters']
        start_times = alignment['character_start_times_seconds']
        end_times = alignment['character_end_times_seconds']

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
                        "start": round(word_start, 3),
                        "end": round(word_end, 3)
                    })
                current_word = ""
                if i + 1 < len(start_times):
                    word_start = start_times[i + 1]
            else:
                if not current_word:
                    word_start = start_times[i]
                current_word += char
                word_end = end_times[i]

        duration = end_times[-1] if end_times else 0

    # Sačuvaj timestamps
    timestamps_path = output_dir / "voiceover-timestamps.json"
    timestamps_data = {
        "model": MODEL_ID,
        "voice_settings": VOICE_SETTINGS,
        "duration": round(duration, 3),
        "wordCount": len(words),
        "words": words
    }

    with open(timestamps_path, 'w', encoding='utf-8') as f:
        json.dump(timestamps_data, f, indent=2)
    print(f"[SAVED] Timestamps: {timestamps_path}")

    return timestamps_data

# ============================================================
# MAIN
# ============================================================

def main():
    print("=" * 60)
    print("TTS PIPELINE - Tech Terms + Voiceover")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("Usage: python3 full-pipeline.py --file transcript.txt --output-dir ./output/")
        print("       python3 full-pipeline.py \"tekst\" --output-dir ./output/")
        sys.exit(1)

    output_dir = Path("./output")

    if '--output-dir' in sys.argv:
        idx = sys.argv.index('--output-dir') + 1
        if idx < len(sys.argv):
            output_dir = Path(sys.argv[idx])

    output_dir.mkdir(parents=True, exist_ok=True)

    if '--file' in sys.argv:
        file_idx = sys.argv.index('--file') + 1
        filepath = sys.argv[file_idx]
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        args = []
        skip_next = False
        for a in sys.argv[1:]:
            if skip_next:
                skip_next = False
                continue
            if a in ['--output-dir', '--file']:
                skip_next = True
                continue
            if not a.startswith('--'):
                args.append(a)
        text = ' '.join(args)

    if not text.strip():
        print("ERROR: No text provided", file=sys.stderr)
        sys.exit(1)

    # Tech terms preprocessing
    print("\n[PREPROCESSING] Tech terms...")
    dictionary = load_dictionary()
    print(f"[LOADED] Dictionary: {len(dictionary)} terms")

    processed = preprocess_tech_terms(text, dictionary)
    processed = auto_fix_unknown_acronyms(processed, dictionary)

    with open(output_dir / "processed-text.txt", 'w') as f:
        f.write(processed)
    print(f"[SAVED] processed-text.txt")

    # Voiceover
    print("\n[VOICEOVER] Generating...")
    result = generate_voiceover(processed, output_dir)

    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)
    print(f"Duration: {result['duration']:.2f}s | Words: {result['wordCount']}")

if __name__ == "__main__":
    main()
