#!/usr/bin/env python3
"""
Icon Search - Semantic search kroz 1900+ Lucide ikona
Koristi embeddings za pronalaženje najbolje ikone za dati koncept.

Usage:
  python3 find_icon.py "video encoding"
  python3 find_icon.py "user authentication" --top 5

Output:
  video, film, clapperboard, camera, play
"""

import json
import sys
import os
from pathlib import Path

# Lazy load heavy deps
_model = None
_icon_embeddings = None
_icon_names = None

CACHE_FILE = Path(__file__).parent / "icon_embeddings.json"
ICONS_FILE = Path(__file__).parent / "icons.json"


def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model


def load_icons():
    global _icon_names
    if _icon_names is None:
        with open(ICONS_FILE) as f:
            icons = json.load(f)
        _icon_names = [(i["name"], i["readable"]) for i in icons]
    return _icon_names


def build_embeddings():
    """Generiše embeddings za sve ikone (jednom)"""
    model = get_model()
    icons = load_icons()

    print(f"Building embeddings for {len(icons)} icons...", file=sys.stderr)

    # Embed readable names
    texts = [readable for _, readable in icons]
    embeddings = model.encode(texts, show_progress_bar=True)

    # Save cache
    cache = {
        "icons": [name for name, _ in icons],
        "embeddings": embeddings.tolist()
    }
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f)

    print(f"Saved to {CACHE_FILE}", file=sys.stderr)
    return cache


def load_embeddings():
    global _icon_embeddings, _icon_names

    if _icon_embeddings is not None:
        return _icon_names, _icon_embeddings

    if not CACHE_FILE.exists():
        cache = build_embeddings()
    else:
        with open(CACHE_FILE) as f:
            cache = json.load(f)

    _icon_names = cache["icons"]
    _icon_embeddings = cache["embeddings"]

    return _icon_names, _icon_embeddings


def find_icon(query: str, top_k: int = 5) -> list[str]:
    """Pronađi top_k ikona za dati query"""
    import numpy as np

    model = get_model()
    icons, embeddings = load_embeddings()

    # Embed query
    query_emb = model.encode([query])[0]
    embeddings_np = np.array(embeddings)

    # Cosine similarity
    similarities = np.dot(embeddings_np, query_emb) / (
        np.linalg.norm(embeddings_np, axis=1) * np.linalg.norm(query_emb)
    )

    # Top k
    top_indices = np.argsort(similarities)[-top_k:][::-1]

    return [icons[i] for i in top_indices]


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 find_icon.py 'concept' [--top N]")
        sys.exit(1)

    query = sys.argv[1]
    top_k = 5

    if "--top" in sys.argv:
        idx = sys.argv.index("--top")
        top_k = int(sys.argv[idx + 1])

    if query == "--build":
        build_embeddings()
        return

    results = find_icon(query, top_k)
    print(", ".join(results))


if __name__ == "__main__":
    main()
