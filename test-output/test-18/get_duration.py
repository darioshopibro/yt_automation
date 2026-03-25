#!/usr/bin/env python3
"""
Get audio duration and generate word timestamps
"""
import subprocess
import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MP3_PATH = os.path.join(SCRIPT_DIR, "voiceover.mp3")
TRANSCRIPT_PATH = os.path.join(SCRIPT_DIR, "transcript.txt")
TIMESTAMPS_PATH = os.path.join(SCRIPT_DIR, "voiceover-timestamps.json")

# Get duration using ffprobe
result = subprocess.run(
    ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
     '-of', 'default=noprint_wrappers=1:nokey=1', MP3_PATH],
    capture_output=True, text=True
)
duration = float(result.stdout.strip())
print(f"Audio duration: {duration:.2f}s")

# Read transcript
with open(TRANSCRIPT_PATH, 'r') as f:
    text = f.read()

# Split into words
words_raw = re.findall(r'\S+', text)
word_count = len(words_raw)
print(f"Word count: {word_count}")

# Calculate average time per word
avg_time_per_word = duration / word_count

# Generate timestamps
words = []
current_time = 0.0

for word in words_raw:
    # Clean word for display
    clean_word = re.sub(r'[^\w\'-]', '', word)
    if not clean_word:
        continue

    word_duration = avg_time_per_word
    # Adjust for punctuation - add pause after sentences
    if word.endswith('.') or word.endswith('?') or word.endswith('!'):
        word_duration *= 1.2

    start = current_time
    end = current_time + word_duration * 0.9  # word ends slightly before next starts

    words.append({
        "word": clean_word,
        "start": round(start, 3),
        "end": round(end, 3)
    })

    current_time += word_duration

# Save timestamps
timestamps_data = {
    "model": "macos-say-samantha",
    "voice_settings": {},
    "duration": round(duration, 3),
    "wordCount": len(words),
    "words": words
}

with open(TIMESTAMPS_PATH, 'w', encoding='utf-8') as f:
    json.dump(timestamps_data, f, indent=2)

print(f"Saved timestamps to: {TIMESTAMPS_PATH}")
print(f"Duration: {duration:.2f}s | Words: {len(words)}")
