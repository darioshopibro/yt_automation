import requests
import json
import sys
import base64

ELEVENLABS_API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel

text = """To understand how RAG works, we need to break it down into three steps: Retrieval, Augmented, and Generation.

Starting with retrieval, just like how we converted documents into vector embeddings to store them in the database, we do the same step for the question. Once the word embedding for the question is generated, the embedding is compared against the embeddings of the documents.

Augmentation in RAG refers to the process where retrieved data is injected into the prompt at runtime. Typically AI assistants rely on what they learn during pre-training, which is static knowledge that can become outdated fast. Instead, our goal is to have the AI assistant rely on up-to-date information in the vector database.

The final step of RAG is generation, where AI generates the response."""

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps"

headers = {
    "xi-api-key": ELEVENLABS_API_KEY,
    "Content-Type": "application/json"
}

payload = {
    "text": text,
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
}

print("Generating voiceover with ElevenLabs...")
response = requests.post(url, json=payload, headers=headers)

if response.status_code != 200:
    print(f"Error: {response.status_code}")
    print(response.text)
    sys.exit(1)

data = response.json()

# Save audio
audio_bytes = base64.b64decode(data["audio_base64"])
with open("public/voiceover.mp3", "wb") as f:
    f.write(audio_bytes)
print(f"Saved voiceover.mp3 ({len(audio_bytes)} bytes)")

# Process timestamps
alignment = data.get("alignment", {})
characters = alignment.get("characters", [])
char_start_times = alignment.get("character_start_times_seconds", [])
char_end_times = alignment.get("character_end_times_seconds", [])

# Reconstruct words from characters
words = []
current_word = ""
word_start = None

for i, char in enumerate(characters):
    if char == " ":
        if current_word:
            words.append({
                "word": current_word,
                "start": word_start,
                "end": char_end_times[i-1] if i > 0 else word_start
            })
            current_word = ""
            word_start = None
    else:
        if word_start is None:
            word_start = char_start_times[i]
        current_word += char

# Don't forget the last word
if current_word:
    words.append({
        "word": current_word,
        "start": word_start,
        "end": char_end_times[-1] if char_end_times else word_start
    })

# Calculate duration
duration = char_end_times[-1] if char_end_times else 0

timestamps_data = {
    "duration": duration,
    "words": words
}

with open("src/voiceover-timestamps.json", "w") as f:
    json.dump(timestamps_data, f, indent=2)

print(f"Duration: {duration:.2f} seconds")
print(f"Word count: {len(words)}")
print("Saved voiceover-timestamps.json")
