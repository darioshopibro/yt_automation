import requests
import json
import base64

ELEVENLABS_API_KEY = "sk_05502b179071a5af73848098c52b3b556ac144e89fe35998"
VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel

transcript = """Machine learning teaches a computer how to perform a task without explicitly programming it to perform said task. Instead, feed data into an algorithm to gradually improve outcomes with experience, similar to how organic life learns.

Predictive models are embedded in many of the products we use every day, which perform two fundamental jobs. One is to classify data, like is there another car on the road or does this patient have cancer. The other is to make predictions about future outcomes, like will the stock go up or which YouTube video do you want to watch next.

The first step in the process is to acquire and clean up data, lots and lots of data. The better the data represents the problem, the better the results. Garbage in, garbage out. The data needs to have some kind of signal to be valuable to the algorithm for making predictions."""

url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps"

headers = {
    "xi-api-key": ELEVENLABS_API_KEY,
    "Content-Type": "application/json"
}

data = {
    "text": transcript,
    "model_id": "eleven_turbo_v2_5",
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.75
    }
}

print("Generating voiceover with ElevenLabs API...")
response = requests.post(url, headers=headers, json=data)

if response.status_code == 200:
    result = response.json()

    # Save audio
    audio_bytes = base64.b64decode(result["audio_base64"])
    with open("voiceover.mp3", "wb") as f:
        f.write(audio_bytes)
    print(f"Saved voiceover.mp3 ({len(audio_bytes)} bytes)")

    # Save timestamps
    alignment = result.get("alignment", {})
    characters = alignment.get("characters", [])
    character_start_times = alignment.get("character_start_times_seconds", [])
    character_end_times = alignment.get("character_end_times_seconds", [])

    # Reconstruct words from characters
    words = []
    current_word = ""
    word_start = None
    word_end = None

    for i, char in enumerate(characters):
        if char == " " or char == "\n":
            if current_word:
                words.append({
                    "word": current_word,
                    "start": word_start,
                    "end": word_end
                })
                current_word = ""
                word_start = None
        else:
            if word_start is None:
                word_start = character_start_times[i]
            word_end = character_end_times[i]
            current_word += char

    # Add last word
    if current_word:
        words.append({
            "word": current_word,
            "start": word_start,
            "end": word_end
        })

    timestamps_data = {"words": words}

    with open("voiceover-timestamps.json", "w") as f:
        json.dump(timestamps_data, f, indent=2)

    # Calculate duration
    duration = max([w["end"] for w in words]) if words else 0
    print(f"Duration: {duration:.2f} seconds")
    print(f"Total words: {len(words)}")
    print(f"Saved voiceover-timestamps.json")

    # Save duration for later use
    with open("duration.txt", "w") as f:
        f.write(str(duration))

else:
    print(f"Error: {response.status_code}")
    print(response.text)
