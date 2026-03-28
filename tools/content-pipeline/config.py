"""Configuration for content pipeline — channels, sources, weights."""

# YouTube channels to monitor
YOUTUBE_CHANNELS = [
    # Top tech explainers
    "@Fireship",
    "@ByteMonk",
    "@NetworkChuck",
    "@t3dotgg",
    "@TechWorldwithNana",
    "@TwoMinutePapers",
    "@JeffSu",
    "@ThePrimeagen",
    # AI focused
    "@MattWolfe",
    "@AIExplained-official",
    "@YannicKilcher",
]

# Reddit subreddits
SUBREDDITS = [
    "programming",
    "webdev",
    "devops",
    "machinelearning",
]

# RSS feeds
RSS_FEEDS = {
    "TechCrunch": "https://techcrunch.com/feed/",
    "TheVerge": "https://www.theverge.com/rss/index.xml",
    "ArsTechnica": "https://feeds.arstechnica.com/arstechnica/index",
}

# Scoring weights (default, before adaptive learning kicks in)
# Engagement is king — a topic nobody cares about isn't worth covering
# even if it's fresh. Freshness is secondary signal.
DEFAULT_WEIGHTS = {
    "engagement": 0.50,
    "freshness": 0.25,
    "opportunity": 0.25,
}

# Multi-source boost
MULTI_SOURCE_BOOST = {
    1: 0.0,
    2: 0.10,
    3: 0.20,
}
MULTI_SOURCE_BOOST_MAX = 0.30  # 4+ sources

# Source averages for engagement normalization
SOURCE_DEFAULTS = {
    "reddit_avg_score": 300,
    "hn_avg_score": 150,
    "github_avg_stars": 500,
    "youtube_avg_views": 500000,
    "devto_avg_reactions": 50,
}

# Freshness decay (hours → score)
FRESHNESS_TIERS = [
    (6, 1.0),
    (24, 0.85),
    (48, 0.65),
    (72, 0.45),
    (168, 0.25),
]
FRESHNESS_DEFAULT = 0.10  # older than 7 days

# Scanner settings
SCANNER_TIMEOUT = 15  # seconds per request
REDDIT_POSTS_LIMIT = 15
HN_STORIES_LIMIT = 15
GITHUB_REPOS_LIMIT = 10
DEVTO_ARTICLES_LIMIT = 10
YOUTUBE_VIDEOS_PER_CHANNEL = 5

# Claude API models
HAIKU_MODEL = "claude-haiku-4-5-20251001"
SONNET_MODEL = "claude-sonnet-4-20250514"

# Telegram
TELEGRAM_BOT_TOKEN = "8588286224:AAG1SkIzyd8SbBvC7nyRO_S20-IHeLP2oZM"

# Cold start threshold
LEARNING_MIN_DECISIONS = 20

# Dashboard URL (localhost for now, replace with domain when deployed)
DASHBOARD_URL = "http://localhost:3002"

# Top candidates per daily digest
DAILY_CANDIDATES = 5
