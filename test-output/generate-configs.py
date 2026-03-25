#!/usr/bin/env python3
"""Generate dynamic-config.json for each test based on voiceover duration"""

import json
import os
import math

BASE_DIR = "/Users/dario61/Desktop/YT automation/test-output"

# Test titles
TITLES = {
    1: "CI/CD Merge Problem",
    2: "Kubernetes Orchestration",
    3: "Machine Learning Basics",
    4: "RAG Pipeline",
    5: "Monolith vs Microservices",
    6: "GitHub Actions",
    7: "Kubernetes Architecture",
    8: "ML Training & Testing",
    9: "Microservices Communication",
    10: "CI/CD Benefits",
    11: "Message vs Event Driven",
    12: "Pub/Sub Architecture",
    13: "ETL Pipeline",
    14: "Batch vs Stream Processing",
    15: "RAG Problem Statement",
    16: "RAG Three Steps",
    17: "Username Check Data Structures",
    18: "Bloom Filters",
    19: "Event-Driven Advantages",
    20: "Eventual Consistency"
}

for i in range(1, 21):
    test_dir = f"{BASE_DIR}/test-{i}"
    timestamps_path = f"{test_dir}/voiceover-timestamps.json"
    config_path = f"{test_dir}/src/dynamic-config.json"

    if not os.path.exists(timestamps_path):
        print(f"Test {i}: ❌ No timestamps")
        continue

    # Read timestamps to get duration
    with open(timestamps_path, 'r') as f:
        timestamps = json.load(f)

    # Get duration from last word
    if 'duration' in timestamps:
        duration = timestamps['duration']
    else:
        duration = timestamps['words'][-1]['end']

    # Calculate totalFrames: ceil(duration * fps) + 30
    fps = 30
    total_frames = math.ceil(duration * fps) + 30

    # Create config
    config = {
        "title": TITLES.get(i, f"Test {i}"),
        "fps": fps,
        "totalFrames": total_frames,
        "showStepPrefix": True,
        "stickies": [
            {
                "step": 1,
                "title": "Overview",
                "color": "#a855f7",
                "sections": [
                    {
                        "id": "main_section",
                        "title": "Main Concept",
                        "subtitle": "Key Ideas",
                        "layout": "flow",
                        "colorKey": "userQuery",
                        "startFrame": 30,
                        "nodes": [
                            {"label": "Start", "icon": "play"},
                            {"label": "Process", "icon": "cpu"},
                            {"label": "End", "icon": "check"}
                        ]
                    }
                ]
            }
        ]
    }

    # Write config
    os.makedirs(os.path.dirname(config_path), exist_ok=True)
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    print(f"Test {i}: ✅ {duration:.1f}s → {total_frames} frames")

print("\nDone!")
