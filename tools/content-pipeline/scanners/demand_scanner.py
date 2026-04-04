"""Multi-source demand scanner — YouTube + Google + Bing search suggest.

Checks 3 search engines to measure REAL search demand for topics.
All free, no auth, no rate limits.

- YouTube Suggest → do people want VIDEOS about this?
- Google Suggest  → do people search for this AT ALL?
- Bing Suggest    → extra confirmation signal

Cross-referencing all 3 gives a much stronger demand signal than any one alone.
"""

import urllib.request
import urllib.parse
import json

# Seed keywords to always check demand for (tech niche)
SEED_KEYWORDS = [
    "docker", "kubernetes", "react", "nextjs", "python", "rust",
    "ai", "llm", "chatgpt", "claude", "openai", "langchain",
    "devops", "aws", "linux", "typescript", "golang", "node",
    "machine learning", "deep learning", "web development",
    "api", "microservices", "github copilot", "cursor",
]


def _get_youtube_suggestions(query):
    """Get YouTube autocomplete suggestions. Free, no auth."""
    encoded = urllib.parse.quote(query)
    url = f"https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&q={encoded}&ds=yt"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")

        paren_start = raw.index("(")
        paren_end = raw.rindex(")")
        json_str = raw[paren_start + 1:paren_end]
        data = json.loads(json_str)

        suggestions = []
        if len(data) > 1 and isinstance(data[1], list):
            for item in data[1]:
                if isinstance(item, list) and len(item) > 0:
                    suggestions.append(item[0])
        return suggestions
    except Exception:
        return []


def _get_google_suggestions(query):
    """Get Google autocomplete suggestions. Free, no auth."""
    encoded = urllib.parse.quote(query)
    url = f"https://suggestqueries-clients6.youtube.com/complete/search?client=firefox&q={encoded}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")

        data = json.loads(raw)
        return data[1] if len(data) > 1 and isinstance(data[1], list) else []
    except Exception:
        return []


def _get_bing_suggestions(query):
    """Get Bing autocomplete suggestions. Free, no auth."""
    encoded = urllib.parse.quote(query)
    url = f"https://api.bing.com/osjson.aspx?query={encoded}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")

        data = json.loads(raw)
        return data[1] if len(data) > 1 and isinstance(data[1], list) else []
    except Exception:
        return []


# Keep old name as alias for backward compatibility
_get_suggestions = _get_youtube_suggestions


def check_demand(keyword):
    """Check search demand across YouTube + Google + Bing.

    Measures:
    - YouTube suggest → video-specific demand (tutorial, vs, how-to, beginner)
    - Google suggest  → general search demand
    - Bing suggest    → confirmation signal
    - Cross-source agreement → stronger signal when all 3 agree

    Returns demand_signal 0-1 where:
    - 0.0 = nobody searches for this anywhere
    - 0.3-0.5 = some search demand but not video-friendly
    - 0.5-0.7 = solid demand, people want to learn about this
    - 0.7-1.0 = high demand with tutorial/comparison intent = ideal video topic
    """
    # Fetch from all 3 sources
    yt_suggestions = _get_youtube_suggestions(keyword)
    google_suggestions = _get_google_suggestions(keyword)
    bing_suggestions = _get_bing_suggestions(keyword)

    # YouTube-specific: check video-friendly signals
    yt_tutorial = _get_youtube_suggestions(f"{keyword} tutorial")
    yt_vs = _get_youtube_suggestions(f"{keyword} vs")

    has_yt = len(yt_suggestions) > 0
    has_google = len(google_suggestions) > 0
    has_bing = len(bing_suggestions) > 0

    has_tutorial = len(yt_tutorial) > 3
    has_comparison = len(yt_vs) > 3
    has_howto = any("how" in s.lower() for s in yt_suggestions)
    has_beginner = any(w in " ".join(yt_suggestions).lower() for w in ["beginner", "learn", "course", "explained"])

    # === SCORING ===

    # 1. Base: how many search engines recognize this keyword?
    source_count = sum([has_yt, has_google, has_bing])
    base_demand = {0: 0.0, 1: 0.15, 2: 0.25, 3: 0.30}[source_count]

    # 2. Video-friendly signals (YouTube-specific)
    tutorial_bonus = 0.20 if has_tutorial else 0
    comparison_bonus = 0.12 if has_comparison else 0
    howto_bonus = 0.08 if has_howto else 0
    beginner_bonus = 0.08 if has_beginner else 0

    # 3. Cross-source strength: Google confirms YouTube demand
    #    If people search on Google AND YouTube = real sustained demand
    #    If only YouTube = could be just curious viewers
    #    If only Google = people read, don't watch
    cross_source_bonus = 0.0
    if has_yt and has_google:
        cross_source_bonus = 0.10
    if has_yt and has_google and has_bing:
        cross_source_bonus = 0.15

    # 4. Breadth: how diverse are the suggestions?
    all_words = set()
    for s in yt_suggestions + google_suggestions:
        all_words.update(s.lower().split())
    breadth_bonus = min(len(all_words) / 60.0, 0.10)

    demand_signal = min(
        base_demand + tutorial_bonus + comparison_bonus +
        howto_bonus + beginner_bonus + cross_source_bonus + breadth_bonus,
        1.0
    )

    return {
        "keyword": keyword,
        "suggestion_count": len(yt_suggestions),
        "suggestions": yt_suggestions[:5],
        "google_suggestions": google_suggestions[:5],
        "bing_suggestions": bing_suggestions[:5],
        "sources_with_results": source_count,
        "has_tutorial_demand": has_tutorial,
        "has_comparison_demand": has_comparison,
        "has_howto_demand": has_howto,
        "has_beginner_demand": has_beginner,
        "demand_signal": round(demand_signal, 3),
    }


def extract_keywords_from_topics(topics):
    """Extract searchable keywords from topic titles.

    Takes clustered topics and pulls out 2-3 word keyword phrases
    that can be checked against YouTube search suggest.
    """
    stop_words = {
        "the", "a", "an", "and", "or", "in", "of", "to", "for", "is", "with",
        "on", "at", "by", "its", "it", "be", "as", "how", "why", "what", "new",
        "now", "just", "&", "has", "have", "are", "was", "from", "this", "that",
    }

    keywords = []
    for topic in topics:
        title = topic.get("title", "") if isinstance(topic, dict) else str(topic)
        words = [w.lower() for w in title.split() if w.lower() not in stop_words and len(w) > 2]

        if len(words) >= 2:
            # Use 2-3 word combo as keyword
            keywords.append(" ".join(words[:3]))
        elif words:
            keywords.append(words[0])

    return list(set(keywords))  # deduplicate


def scan_demand_for_topics(topics):
    """Check YouTube search demand for a list of topic dicts.

    Args:
        topics: list of {"title": "...", "slug": "...", "sources": [...]}

    Returns:
        dict mapping slug -> demand_info
    """
    keywords = extract_keywords_from_topics(topics)
    results = {}

    for topic in topics:
        title = topic.get("title", "")
        slug = topic.get("slug", "")
        words = [w.lower() for w in title.split()
                 if w.lower() not in {"the", "a", "an", "and", "or", "in", "of", "to", "for", "is", "with", "on", "&", "how", "why", "what", "new"}
                 and len(w) > 2]

        keyword = " ".join(words[:3]) if len(words) >= 2 else (words[0] if words else title.lower())
        demand = check_demand(keyword)
        results[slug] = demand

    return results


def scan():
    """Run as a scanner — check demand for seed keywords.

    This provides baseline demand data even before topics are clustered.
    """
    items = []

    for keyword in SEED_KEYWORDS[:15]:  # limit to avoid slowness
        demand = check_demand(keyword)
        if demand["demand_signal"] > 0.3:  # only report keywords with real demand
            items.append({
                "source_type": "demand",
                "source_detail": "youtube_suggest",
                "title": f"Search demand: {keyword} ({demand['suggestion_count']} suggestions)",
                "url": f"https://www.youtube.com/results?search_query={urllib.parse.quote(keyword)}",
                "score": demand["suggestion_count"],
                "comments": 0,
                "published_at": None,
                "raw_data": demand,
            })

    return {"source": "demand", "items": items, "error": None}


if __name__ == "__main__":
    # Quick test
    print("Testing YouTube Search Suggest demand scanner...\n")

    test_keywords = ["docker tutorial", "react vs vue", "claude api", "kubernetes deployment"]
    for kw in test_keywords:
        result = check_demand(kw)
        print(f"  '{kw}': signal={result['demand_signal']:.2f}, "
              f"suggestions={result['suggestion_count']}, "
              f"tutorial={result['has_tutorial_demand']}, "
              f"comparison={result['has_comparison_demand']}")
        if result['suggestions']:
            print(f"    Top suggestions: {result['suggestions'][:3]}")
    print()

    # Run as scanner
    result = scan()
    print(f"\nSeed keyword scan: {len(result['items'])} keywords with demand > 0.3")
    for item in result['items'][:5]:
        d = item['raw_data']
        print(f"  {d['keyword']}: signal={d['demand_signal']:.2f} ({d['suggestion_count']} suggestions)")
