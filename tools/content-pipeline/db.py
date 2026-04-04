"""SQLite database for content pipeline — schema + helpers."""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'pipeline.db')


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'new',
            engagement_score REAL DEFAULT 0,
            freshness_score REAL DEFAULT 0,
            competition_score REAL DEFAULT 0,
            final_score REAL DEFAULT 0,
            multi_source_count INTEGER DEFAULT 1,
            proposed_angle TEXT,
            proposed_hook TEXT,
            angle_type TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            reviewed_at TEXT,
            processed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS topic_sources (
            id INTEGER PRIMARY KEY,
            topic_id INTEGER REFERENCES topics(id),
            source_type TEXT NOT NULL,
            source_url TEXT,
            title TEXT,
            raw_score INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            published_at TEXT,
            raw_data TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS topic_research (
            id INTEGER PRIMARY KEY,
            topic_id INTEGER REFERENCES topics(id),
            source_type TEXT NOT NULL,
            source_url TEXT,
            content TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS scripts (
            id INTEGER PRIMARY KEY,
            topic_id INTEGER REFERENCES topics(id),
            script_text TEXT NOT NULL,
            processed_text TEXT,
            similarity_score REAL,
            similarity_report TEXT,
            status TEXT DEFAULT 'draft',
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS channel_stats (
            channel_name TEXT PRIMARY KEY,
            avg_views INTEGER DEFAULT 0,
            avg_likes INTEGER DEFAULT 0,
            sample_size INTEGER DEFAULT 0,
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS scan_runs (
            id INTEGER PRIMARY KEY,
            started_at TEXT DEFAULT (datetime('now')),
            completed_at TEXT,
            topics_found INTEGER DEFAULT 0,
            topics_new INTEGER DEFAULT 0,
            sources_succeeded TEXT,
            sources_failed TEXT,
            errors TEXT
        );

        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL,
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS user_likes (
            id INTEGER PRIMARY KEY,
            url TEXT,
            title TEXT,
            transcript TEXT,
            topic_analysis TEXT,
            style_analysis TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS improvements (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            source_url TEXT,
            status TEXT DEFAULT 'suggested',
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS topic_demand (
            id INTEGER PRIMARY KEY,
            topic_id INTEGER REFERENCES topics(id),
            keyword TEXT,
            suggestion_count INTEGER DEFAULT 0,
            has_tutorial_demand INTEGER DEFAULT 0,
            has_comparison_demand INTEGER DEFAULT 0,
            demand_signal REAL DEFAULT 0,
            suggestions TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS topic_velocity (
            id INTEGER PRIMARY KEY,
            topic_slug TEXT NOT NULL,
            scan_run_id INTEGER,
            source_count INTEGER DEFAULT 0,
            total_engagement INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_topics_status ON topics(status);
        CREATE INDEX IF NOT EXISTS idx_topics_score ON topics(final_score DESC);
        CREATE INDEX IF NOT EXISTS idx_topic_sources_topic ON topic_sources(topic_id);
        CREATE INDEX IF NOT EXISTS idx_topic_demand_topic ON topic_demand(topic_id);
        CREATE INDEX IF NOT EXISTS idx_topic_velocity_slug ON topic_velocity(topic_slug);
    """)
    conn.commit()
    conn.close()


# --- Topic helpers ---

def insert_topic(title, slug, description=None, sources=None):
    conn = get_connection()
    try:
        conn.execute(
            "INSERT OR IGNORE INTO topics (title, slug, description) VALUES (?, ?, ?)",
            (title, slug, description)
        )
        topic_id = conn.execute("SELECT id FROM topics WHERE slug = ?", (slug,)).fetchone()['id']

        if sources:
            for s in sources:
                conn.execute(
                    """INSERT INTO topic_sources (topic_id, source_type, source_url, title, raw_score, comments, published_at, raw_data)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (topic_id, s.get('source_type', ''), s.get('url', ''), s.get('title', ''),
                     s.get('score', 0), s.get('comments', 0), s.get('published_at', ''),
                     json.dumps(s.get('raw_data', {})))
                )
        conn.commit()
        return topic_id
    finally:
        conn.close()


def update_topic_scores(topic_id, engagement, freshness, competition, final_score, multi_source_count):
    conn = get_connection()
    conn.execute(
        """UPDATE topics SET engagement_score=?, freshness_score=?, competition_score=?,
           final_score=?, multi_source_count=? WHERE id=?""",
        (engagement, freshness, competition, final_score, multi_source_count, topic_id)
    )
    conn.commit()
    conn.close()


def update_topic_status(topic_id, status):
    conn = get_connection()
    now = datetime.now().isoformat()
    if status == 'approved':
        conn.execute("UPDATE topics SET status=?, reviewed_at=? WHERE id=?", (status, now, topic_id))
    elif status == 'processed':
        conn.execute("UPDATE topics SET status=?, processed_at=? WHERE id=?", (status, now, topic_id))
    else:
        conn.execute("UPDATE topics SET status=? WHERE id=?", (status, topic_id))
    conn.commit()
    conn.close()


def get_top_candidates(limit=5):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM topics WHERE status='new' ORDER BY final_score DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_topic_sources(topic_id):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM topic_sources WHERE topic_id=?", (topic_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def topic_exists(slug):
    conn = get_connection()
    row = conn.execute("SELECT id FROM topics WHERE slug=?", (slug,)).fetchone()
    conn.close()
    return row is not None


# --- Scan run helpers ---

def start_scan_run():
    conn = get_connection()
    cursor = conn.execute("INSERT INTO scan_runs DEFAULT VALUES")
    run_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return run_id


def complete_scan_run(run_id, topics_found, topics_new, succeeded, failed, errors=None):
    conn = get_connection()
    conn.execute(
        """UPDATE scan_runs SET completed_at=datetime('now'), topics_found=?, topics_new=?,
           sources_succeeded=?, sources_failed=?, errors=? WHERE id=?""",
        (topics_found, topics_new, json.dumps(succeeded), json.dumps(failed),
         json.dumps(errors or []), run_id)
    )
    conn.commit()
    conn.close()


# --- User preferences helpers ---

def count_decisions():
    conn = get_connection()
    row = conn.execute(
        "SELECT COUNT(*) as cnt FROM topics WHERE status IN ('approved', 'rejected')"
    ).fetchone()
    conn.close()
    return row['cnt']


def get_preference(key, default=None):
    conn = get_connection()
    row = conn.execute("SELECT value FROM user_preferences WHERE key=?", (key,)).fetchone()
    conn.close()
    if row:
        return json.loads(row['value'])
    return default


def set_preference(key, value):
    conn = get_connection()
    conn.execute(
        "INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, datetime('now'))",
        (key, json.dumps(value))
    )
    conn.commit()
    conn.close()


# --- Channel stats helpers ---

def get_channel_avg_views(channel_name):
    conn = get_connection()
    row = conn.execute("SELECT avg_views FROM channel_stats WHERE channel_name=?", (channel_name,)).fetchone()
    conn.close()
    return row['avg_views'] if row else None


def set_channel_stats(channel_name, avg_views, avg_likes=0, sample_size=0):
    conn = get_connection()
    conn.execute(
        """INSERT OR REPLACE INTO channel_stats (channel_name, avg_views, avg_likes, sample_size, updated_at)
           VALUES (?, ?, ?, ?, datetime('now'))""",
        (channel_name, avg_views, avg_likes, sample_size)
    )
    conn.commit()
    conn.close()


# --- Demand helpers ---

def insert_demand(topic_id, keyword, suggestion_count, has_tutorial, has_comparison, demand_signal, suggestions=None):
    conn = get_connection()
    conn.execute(
        """INSERT INTO topic_demand (topic_id, keyword, suggestion_count, has_tutorial_demand,
           has_comparison_demand, demand_signal, suggestions) VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (topic_id, keyword, suggestion_count, int(has_tutorial), int(has_comparison),
         demand_signal, json.dumps(suggestions or []))
    )
    conn.commit()
    conn.close()


def get_demand(topic_id):
    conn = get_connection()
    row = conn.execute("SELECT * FROM topic_demand WHERE topic_id=?", (topic_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


# --- Velocity helpers ---

def insert_velocity(topic_slug, scan_run_id, source_count, total_engagement):
    conn = get_connection()
    conn.execute(
        """INSERT INTO topic_velocity (topic_slug, scan_run_id, source_count, total_engagement)
           VALUES (?, ?, ?, ?)""",
        (topic_slug, scan_run_id, source_count, total_engagement)
    )
    conn.commit()
    conn.close()


def get_velocity(topic_slug, lookback=3):
    """Get velocity data for a topic over last N scans."""
    conn = get_connection()
    rows = conn.execute(
        """SELECT * FROM topic_velocity WHERE topic_slug=?
           ORDER BY created_at DESC LIMIT ?""",
        (topic_slug, lookback)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# Initialize on import
init_db()
