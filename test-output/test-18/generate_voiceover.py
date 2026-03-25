#!/usr/bin/env python3
"""
Generate voiceover using macOS say command
"""
import subprocess
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TRANSCRIPT_PATH = os.path.join(SCRIPT_DIR, "transcript.txt")
OUTPUT_AIFF = os.path.join(SCRIPT_DIR, "voiceover.aiff")
OUTPUT_MP3 = os.path.join(SCRIPT_DIR, "voiceover.mp3")

with open(TRANSCRIPT_PATH, 'r') as f:
    text = f.read()

# Generate AIFF using say command
subprocess.run([
    'say', '-o', OUTPUT_AIFF, '-v', 'Samantha', text
], check=True)

print(f"Generated: {OUTPUT_AIFF}")

# Convert to MP3 using ffmpeg if available
try:
    subprocess.run([
        'ffmpeg', '-y', '-i', OUTPUT_AIFF, '-acodec', 'libmp3lame', '-q:a', '2', OUTPUT_MP3
    ], check=True, capture_output=True)
    print(f"Converted to: {OUTPUT_MP3}")
except:
    print("ffmpeg not available, keeping AIFF format")
