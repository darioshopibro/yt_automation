#!/usr/bin/env python3
"""
Batch icon finder - prima listu koncepata, vraća ikone za svaki.

Usage:
  echo '["video encoding", "user input", "database"]' | python3 batch_icons.py

Output (JSON):
  {"video encoding": "fileVideo", "user input": "formInput", "database": "database"}
"""

import json
import sys
from find_icon import find_icon

def main():
    # Read JSON array from stdin
    input_data = sys.stdin.read().strip()
    concepts = json.loads(input_data)

    results = {}
    for concept in concepts:
        icons = find_icon(concept, top_k=1)
        results[concept] = icons[0] if icons else "box"

    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
