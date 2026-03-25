#!/bin/bash
# Setup script for Bloom Filter Remotion project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/project"

echo "Creating project directory..."
mkdir -p "$PROJECT_DIR"

echo "Copying template..."
cp -r "/Users/dario61/Desktop/YT automation/templates/ai-video-gen-pipeline/"* "$PROJECT_DIR/"

echo "Copying voiceover to public..."
cp "$SCRIPT_DIR/voiceover.mp3" "$PROJECT_DIR/public/"

echo "Copying timestamps to src..."
cp "$SCRIPT_DIR/voiceover-timestamps.json" "$PROJECT_DIR/src/"

echo "Copying master-plan to src..."
cp "$SCRIPT_DIR/master-plan.json" "$PROJECT_DIR/src/"

echo "Copying sounds..."
cp -r "/Users/dario61/Desktop/YT automation/templates/remotion-nvidia-test/public/sounds" "$PROJECT_DIR/public/" 2>/dev/null || echo "Sounds already copied or not found"

echo "Running npm install..."
cd "$PROJECT_DIR"
npm install

echo "Setup complete!"
