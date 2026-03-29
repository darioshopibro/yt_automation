"""Telegram bot — inline message editing, pagination, detail views."""

import urllib.request
import json
import os
import sys
import re
import subprocess

sys.path.insert(0, os.path.dirname(__file__))
import config
import db

TOKEN = config.TELEGRAM_BOT_TOKEN
API_BASE = f"https://api.telegram.org/bot{TOKEN}"
PAGE_SIZE = 5


# ==========================================
# Core API
# ==========================================

def _api_call(method, data=None):
    url = f"{API_BASE}/{method}"
    if data:
        data = json.dumps(data).encode()
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    else:
        req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def get_chat_id():
    stored = db.get_preference("telegram_chat_id")
    if stored:
        return stored
    result = _api_call("getUpdates", {"limit": 10})
    if result.get("ok") and result.get("result"):
        for update in result["result"]:
            chat = update.get("message", {}).get("chat", {})
            if chat.get("id"):
                db.set_preference("telegram_chat_id", chat["id"])
                return chat["id"]
    return None


def send_message(chat_id, text, reply_markup=None):
    data = {"chat_id": chat_id, "text": text[:4096], "parse_mode": "HTML", "disable_web_page_preview": True}
    if reply_markup:
        data["reply_markup"] = reply_markup
    return _api_call("sendMessage", data)


def edit_message(chat_id, message_id, text, reply_markup=None):
    """Edit existing message — ALL button clicks use this."""
    data = {"chat_id": chat_id, "message_id": message_id, "text": text[:4096], "parse_mode": "HTML", "disable_web_page_preview": True}
    if reply_markup:
        data["reply_markup"] = reply_markup
    try:
        return _api_call("editMessageText", data)
    except Exception:
        # Fallback to new message if edit fails
        return send_message(chat_id, text, reply_markup)


def answer_callback(callback_id, text=""):
    if not callback_id:
        return
    try:
        _api_call("answerCallbackQuery", {"callback_query_id": callback_id, "text": text})
    except Exception:
        pass


# ==========================================
# Build views (return text + buttons, don't send)
# ==========================================

def _build_digest(page=0):
    """Build digest view — returns (text, buttons)."""
    conn = db.get_connection()
    all_new = conn.execute("SELECT * FROM topics WHERE status='new' ORDER BY final_score DESC").fetchall()
    total = len(all_new)
    total_pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
    page = max(0, min(page, total_pages - 1))
    candidates = all_new[page * PAGE_SIZE:(page + 1) * PAGE_SIZE]

    improvements = conn.execute(
        "SELECT title, category FROM improvements WHERE status='suggested' ORDER BY id DESC LIMIT 3"
    ).fetchall()
    conn.close()

    lines = [f"📊 <b>Daily Research</b> (Page {page+1}/{total_pages} · {total} topics)\n"]

    for i, c in enumerate(candidates):
        c = dict(c)
        num = page * PAGE_SIZE + i + 1
        sources = db.get_topic_sources(c["id"])
        source_types = sorted(set(s["source_type"] for s in sources))

        lines.append(f"<b>{num}. {c['title']}</b> ({c['final_score']:.2f})")
        lines.append(
            f"   📈 {c['engagement_score']:.2f} | ⏰ {c['freshness_score']:.2f} | "
            f"🔗 {len(sources)} ({', '.join(source_types)})"
        )
        if c.get("proposed_angle"):
            lines.append(f"   🎯 {c['proposed_angle'][:80]}")
        if c.get("description") and c["description"].startswith("⚠️"):
            lines.append(f"   {c['description'][:80]}")
        lines.append("")

    if improvements and page == 0:
        icons = {"update": "⬆️", "alternative": "🔄", "new_capability": "🆕", "workflow": "⚡", "competitive_intel": "🔍", "gap_filler": "🎯"}
        lines.append("🔧 <b>Improvements:</b>")
        for imp in improvements:
            lines.append(f"  {icons.get(imp['category'], '💡')} {imp['title']}")
        lines.append("")

    decisions = db.count_decisions()
    lines.append(f"📊 Learning: {decisions}/{config.LEARNING_MIN_DECISIONS}")
    lines.append(f"\n🖥 <a href=\"{config.DASHBOARD_URL}\">Open Dashboard</a>")

    # Buttons: topic numbers
    buttons = []
    row = []
    for i, c in enumerate(candidates):
        c = dict(c)
        num = page * PAGE_SIZE + i + 1
        row.append({"text": f"📋 {num}", "callback_data": f"detail_{c['id']}"})
        if len(row) == 5:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)

    # Pagination
    nav = []
    if page > 0:
        nav.append({"text": "◀️ Prev", "callback_data": f"page_{page-1}"})
    nav.append({"text": f"📄 {page+1}/{total_pages}", "callback_data": "noop"})
    if page < total_pages - 1:
        nav.append({"text": "Next ▶️", "callback_data": f"page_{page+1}"})
    buttons.append(nav)

    # Actions
    buttons.append([
        {"text": "🔥 Scan Now", "callback_data": "scan_now"},
        {"text": "📊 Stats", "callback_data": "stats"},
        {"text": "📋 Queue", "callback_data": "show_queue"},
        {"text": "🏆 Best", "callback_data": "best_sources"},
    ])

    return "\n".join(lines), {"inline_keyboard": buttons}


def _build_detail(topic_id):
    """Build topic detail view — returns (text, buttons)."""
    conn = db.get_connection()
    topic = conn.execute("SELECT * FROM topics WHERE id=?", (topic_id,)).fetchone()
    if not topic:
        return "Topic not found.", {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": "page_0"}]]}
    topic = dict(topic)
    sources = db.get_topic_sources(topic_id)
    script = conn.execute("SELECT * FROM scripts WHERE topic_id=? ORDER BY id DESC LIMIT 1", (topic_id,)).fetchone()
    conn.close()

    status_icons = {"new": "🆕", "approved": "✅", "rejected": "❌", "queued": "📋", "processed": "🎬"}
    lines = [f"📋 <b>{topic['title']}</b>\n"]
    lines.append(f"📈 Eng: {topic['engagement_score']:.2f} | ⏰ Fresh: {topic['freshness_score']:.2f} | Score: {topic['final_score']:.3f}")
    lines.append(f"Status: {status_icons.get(topic['status'], '❓')} {topic['status'].upper()}\n")

    lines.append("<b>📰 Sources:</b>")
    for s in sources:
        score_str = ""
        if s['raw_score']:
            unit = "pts" if s['source_type'] in ('hackernews', 'reddit') else "⭐" if s['source_type'] == 'github' else ""
            score_str = f" ({s['raw_score']} {unit})"
        url = s.get('source_url', '')
        title_text = s['title'][:50]
        if url:
            lines.append(f"• <a href=\"{url}\">[{s['source_type']}] {title_text}</a>{score_str}")
        else:
            lines.append(f"• [{s['source_type']}] {title_text}{score_str}")

    if topic.get("proposed_angle"):
        lines.append(f"\n🎯 <b>Angle:</b> {topic['proposed_angle']}")
    if topic.get("proposed_hook"):
        lines.append(f"💬 <i>\"{topic['proposed_hook'][:120]}\"</i>")
    if script:
        script = dict(script)
        lines.append(f"\n📝 Script: {len(script['script_text'].split())} words | Plagiarism: {script.get('similarity_score', '?')}%")

    lines.append(f"\n🖥 <a href=\"{config.DASHBOARD_URL}\">Open in Dashboard</a>")

    buttons = []
    if topic["status"] in ("new", "queued"):
        buttons.append([
            {"text": "✅ Approve", "callback_data": f"approve_{topic_id}"},
            {"text": "❌ Reject", "callback_data": f"reject_{topic_id}"},
            {"text": "📋 Later", "callback_data": f"queue_{topic_id}"},
        ])

    content_row = []
    if not script:
        content_row.append({"text": "🎯 Process", "callback_data": f"process_{topic_id}"})
    else:
        content_row.append({"text": "📝 Script", "callback_data": f"script_{topic_id}"})
        content_row.append({"text": "✏️ Rewrite", "callback_data": f"rewrite_{topic_id}"})
    content_row.append({"text": "🔍 Research", "callback_data": f"research_{topic_id}"})
    buttons.append(content_row)

    buttons.append([{"text": "◀️ Back to List", "callback_data": "page_0"}])

    return "\n".join(lines), {"inline_keyboard": buttons}


def _build_script(topic_id):
    """Build script view — returns (text, buttons)."""
    conn = db.get_connection()
    script = conn.execute(
        "SELECT s.*, t.title, t.proposed_angle FROM scripts s JOIN topics t ON s.topic_id=t.id WHERE s.topic_id=? ORDER BY s.id DESC LIMIT 1",
        (topic_id,)
    ).fetchone()
    conn.close()

    if not script:
        return "No script. Click 🎯 Process first.", {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": f"detail_{topic_id}"}]]}

    script = dict(script)
    script_text = script["script_text"]
    if len(script_text) > 2800:
        script_text = script_text[:2800] + "\n\n... (full in dashboard)"

    lines = [
        f"📝 <b>{script['title']}</b>\n",
        f"🎯 {script.get('proposed_angle', 'N/A')}\n",
        f"<pre>{script_text}</pre>",
        f"\n📊 {len(script['script_text'].split())} words | Plagiarism: {script.get('similarity_score', '?')}%",
    ]

    buttons = [
        [
            {"text": "✏️ Rewrite", "callback_data": f"rewrite_{topic_id}"},
            {"text": "✅ Approve", "callback_data": f"approve_{topic_id}"},
        ],
        [{"text": "◀️ Back", "callback_data": f"detail_{topic_id}"}],
    ]
    return "\n".join(lines), {"inline_keyboard": buttons}


def _build_stats():
    """Build stats view — returns (text, buttons)."""
    conn = db.get_connection()
    total = conn.execute("SELECT COUNT(*) as cnt FROM topics").fetchone()["cnt"]
    by_status = conn.execute("SELECT status, COUNT(*) as cnt FROM topics GROUP BY status").fetchall()
    total_imps = conn.execute("SELECT COUNT(*) as cnt FROM improvements").fetchone()["cnt"]
    imp_pending = conn.execute("SELECT COUNT(*) as cnt FROM improvements WHERE status='suggested'").fetchone()["cnt"]
    last_scan = conn.execute("SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1").fetchone()
    total_likes = conn.execute("SELECT COUNT(*) as cnt FROM user_likes").fetchone()["cnt"]
    decisions = conn.execute("SELECT COUNT(*) as cnt FROM topics WHERE status IN ('approved','rejected')").fetchone()["cnt"]
    conn.close()

    icons = {"new": "🆕", "approved": "✅", "rejected": "❌", "queued": "📋", "processed": "🎬"}
    lines = ["📊 <b>Pipeline Stats</b>\n", f"<b>Topics:</b> {total} total"]
    for s in by_status:
        lines.append(f"  {icons.get(s['status'], '❓')} {s['status']}: {s['cnt']}")
    lines.append(f"\n🔧 Improvements: {total_imps} ({imp_pending} pending)")
    lines.append(f"📥 Saved Videos: {total_likes}")
    lines.append(f"📊 Learning: {decisions}/{config.LEARNING_MIN_DECISIONS}")

    if last_scan:
        ls = dict(last_scan)
        succeeded = json.loads(ls.get("sources_succeeded", "[]"))
        failed = json.loads(ls.get("sources_failed", "[]"))
        lines.append(f"\n<b>Last Scan:</b> {ls.get('started_at', 'N/A')}")
        lines.append(f"  {ls.get('topics_found', 0)} topics ({ls.get('topics_new', 0)} new) · {len(succeeded)}/{len(succeeded)+len(failed)} sources")

    return "\n".join(lines), {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": "page_0"}]]}


def _build_queue():
    """Build queue view — returns (text, buttons)."""
    conn = db.get_connection()
    queued = conn.execute("SELECT * FROM topics WHERE status='queued' ORDER BY final_score DESC").fetchall()
    conn.close()

    if not queued:
        return "📋 <b>Queue is empty.</b>\nUse 📋 Later to save topics.", {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": "page_0"}]]}

    lines = [f"📋 <b>Queued</b> ({len(queued)})\n"]
    buttons = []
    for i, t in enumerate(queued):
        t = dict(t)
        lines.append(f"{i+1}. <b>{t['title']}</b> ({t['final_score']:.2f})")
        buttons.append([{"text": f"📋 {t['title'][:35]}", "callback_data": f"detail_{t['id']}"}])
    buttons.append([{"text": "◀️ Back", "callback_data": "page_0"}])
    return "\n".join(lines), {"inline_keyboard": buttons}


def _build_best():
    """Build best sources view — returns (text, buttons)."""
    conn = db.get_connection()
    approved = conn.execute("SELECT id FROM topics WHERE status='approved'").fetchall()

    if not approved:
        return "🏆 <b>Best Sources</b>\n\nNot enough data. Approve more topics!", {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": "page_0"}]]}

    from collections import Counter
    approved_counter = Counter()
    for t in approved:
        for s in db.get_topic_sources(t["id"]):
            approved_counter[s['source_type']] += 1

    all_counter = Counter()
    all_topics = conn.execute("SELECT id FROM topics").fetchall()
    for t in all_topics:
        for s in db.get_topic_sources(t["id"]):
            all_counter[s['source_type']] += 1
    conn.close()

    lines = ["🏆 <b>Best Sources</b>\n"]
    for src, cnt in approved_counter.most_common(10):
        total = all_counter.get(src, cnt)
        pct = (cnt / total * 100) if total else 0
        bar = "█" * int(pct / 10) + "░" * (10 - int(pct / 10))
        lines.append(f"<code>{bar}</code> {src}: {cnt}/{total} ({pct:.0f}%)")

    return "\n".join(lines), {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": "page_0"}]]}


def _build_research(topic_id):
    """Build deep research view — returns (text, buttons)."""
    conn = db.get_connection()
    topic = conn.execute("SELECT title FROM topics WHERE id=?", (topic_id,)).fetchone()
    conn.close()
    if not topic:
        return "Not found.", {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": "page_0"}]]}

    title = topic["title"]
    search_script = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "research", "scripts", "search.py")
    result = subprocess.run(["python3", search_script, title], capture_output=True, text=True, timeout=30)

    lines = [f"🔍 <b>Research: {title}</b>\n"]
    if result.stdout:
        try:
            data = json.loads(result.stdout)
            videos = data.get("results", data.get("videos", []))[:5]
            for i, v in enumerate(videos):
                lines.append(f"{i+1}. <b>{v.get('title', 'N/A')[:55]}</b>")
                lines.append(f"   👁 {v.get('views', '?')} views · {v.get('channel', 'N/A')}")
        except json.JSONDecodeError:
            lines.append("❌ Parse error.")
    else:
        lines.append("❌ No results.")

    buttons = [
        [{"text": "🎯 Process", "callback_data": f"process_{topic_id}"}],
        [{"text": "◀️ Back", "callback_data": f"detail_{topic_id}"}],
    ]
    return "\n".join(lines), {"inline_keyboard": buttons}


# ==========================================
# Callback Handler — ALWAYS edits existing message
# ==========================================

def _handle_callback(chat_id, message_id, data, callback_id):
    answer_callback(callback_id)

    if data == "noop":
        return

    # Pagination
    if data.startswith("page_"):
        page = int(data.split("_")[1])
        text, markup = _build_digest(page)
        edit_message(chat_id, message_id, text, markup)
        return

    # Views
    if data == "stats":
        text, markup = _build_stats()
        edit_message(chat_id, message_id, text, markup)
        return
    if data == "show_queue":
        text, markup = _build_queue()
        edit_message(chat_id, message_id, text, markup)
        return
    if data == "best_sources":
        text, markup = _build_best()
        edit_message(chat_id, message_id, text, markup)
        return
    if data == "scan_now":
        edit_message(chat_id, message_id, "🔥 <b>Scanning all sources...</b>\n⏳ ~3 minutes", {"inline_keyboard": []})
        subprocess.run(["python3", os.path.join(os.path.dirname(__file__), "run_pipeline.py")], timeout=600)
        text, markup = _build_digest(0)
        edit_message(chat_id, message_id, text, markup)
        return

    # Parse action_topicId (topic_id is always the LAST segment after _)
    last_underscore = data.rfind("_")
    if last_underscore == -1:
        return
    try:
        topic_id = int(data[last_underscore + 1:])
        action = data[:last_underscore]
    except ValueError:
        return

    if action == "detail":
        text, markup = _build_detail(topic_id)
        edit_message(chat_id, message_id, text, markup)

    elif action == "approve":
        db.update_topic_status(topic_id, "approved")
        conn = db.get_connection()
        t = conn.execute("SELECT title FROM topics WHERE id=?", (topic_id,)).fetchone()["title"]
        conn.close()
        edit_message(chat_id, message_id, f"✅ <b>Approved:</b> {t}",
                     {"inline_keyboard": [[{"text": "◀️ Back to List", "callback_data": "page_0"}]]})

    elif action == "reject":
        db.update_topic_status(topic_id, "rejected")
        conn = db.get_connection()
        t = conn.execute("SELECT title FROM topics WHERE id=?", (topic_id,)).fetchone()["title"]
        conn.close()
        edit_message(chat_id, message_id, f"❌ <b>Rejected:</b> {t}",
                     {"inline_keyboard": [[{"text": "◀️ Back to List", "callback_data": "page_0"}]]})

    elif action == "queue":
        db.update_topic_status(topic_id, "queued")
        conn = db.get_connection()
        t = conn.execute("SELECT title FROM topics WHERE id=?", (topic_id,)).fetchone()["title"]
        conn.close()
        edit_message(chat_id, message_id, f"📋 <b>Queued:</b> {t}\nSaved for later.",
                     {"inline_keyboard": [[{"text": "◀️ Back to List", "callback_data": "page_0"}]]})

    elif action == "process":
        conn = db.get_connection()
        t = conn.execute("SELECT title FROM topics WHERE id=?", (topic_id,)).fetchone()["title"]
        conn.close()
        edit_message(chat_id, message_id, f"🎯 <b>Processing:</b> {t}\n⏳ Fetching transcripts → angle → script... (2-3 min)", {"inline_keyboard": []})
        from content_processor import process_topic
        result = process_topic(topic_id)
        if result.get("error"):
            edit_message(chat_id, message_id, f"❌ <b>Error:</b> {result['error']}",
                         {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": f"detail_{topic_id}"}]]})
        else:
            angle = result.get("angle", {})
            script = result.get("script", "")
            plag = result.get("plagiarism", {})
            text = (
                f"✅ <b>Done: {t}</b>\n\n"
                f"🎯 {angle.get('proposed_angle', 'N/A')}\n"
                f"📝 {len(script.split())} words | Plagiarism: {plag.get('overall_similarity_percent', '?')}%\n\n"
                f"💬 <i>\"{angle.get('proposed_hook', '')}\"</i>"
            )
            buttons = [
                [{"text": "📝 Script", "callback_data": f"script_{topic_id}"}, {"text": "✏️ Rewrite", "callback_data": f"rewrite_{topic_id}"}],
                [{"text": "✅ Approve", "callback_data": f"approve_{topic_id}"}, {"text": "◀️ Back", "callback_data": f"detail_{topic_id}"}],
            ]
            edit_message(chat_id, message_id, text, {"inline_keyboard": buttons})

    elif action == "script":
        text, markup = _build_script(topic_id)
        edit_message(chat_id, message_id, text, markup)

    elif action == "rewrite":
        # Show feedback selection — buttons + free text
        conn = db.get_connection()
        t = conn.execute("SELECT title FROM topics WHERE id=?", (topic_id,)).fetchone()["title"]
        conn.close()
        buttons = [
            [
                {"text": "🎯 Bad Angle", "callback_data": f"rwfb_angle_{topic_id}"},
                {"text": "🪝 Bad Hook", "callback_data": f"rwfb_hook_{topic_id}"},
            ],
            [
                {"text": "📖 Too Generic", "callback_data": f"rwfb_generic_{topic_id}"},
                {"text": "🏢 Bad Examples", "callback_data": f"rwfb_examples_{topic_id}"},
            ],
            [
                {"text": "📏 Too Long", "callback_data": f"rwfb_long_{topic_id}"},
                {"text": "📏 Too Short", "callback_data": f"rwfb_short_{topic_id}"},
            ],
            [
                {"text": "🔄 Same Pattern", "callback_data": f"rwfb_pattern_{topic_id}"},
                {"text": "😐 No Personality", "callback_data": f"rwfb_boring_{topic_id}"},
            ],
            [
                {"text": "🎯 New Angle Entirely", "callback_data": f"rwfb_newangle_{topic_id}"},
            ],
            [{"text": "◀️ Back", "callback_data": f"script_{topic_id}"}],
        ]
        text = (
            f"✏️ <b>Rewrite: {t}</b>\n\n"
            f"What didn't you like? Click a button or type your feedback directly."
        )
        # Store that we're waiting for feedback for this topic
        db.set_preference("rewrite_pending_topic", topic_id)
        send_message(chat_id, text, {"inline_keyboard": buttons})

    elif action.startswith("rwfb"):
        # Handle rewrite feedback button click
        feedback_map = {
            "rwfb_angle": "The angle is not interesting or unique enough. Find a completely different, more compelling angle.",
            "rwfb_hook": "The hook is weak. Make the first sentence much more attention-grabbing and specific.",
            "rwfb_generic": "The script is too generic and reads like a blog post. Add specific real-world incidents, names, numbers.",
            "rwfb_examples": "The examples are bad or overused. Use completely different, more surprising real-world examples.",
            "rwfb_long": "The script is too long. Make it more concise, cut filler, get to the point faster.",
            "rwfb_short": "The script is too short. Add more depth, more examples, more technical detail.",
            "rwfb_pattern": "This follows the same structure as previous scripts. Use a completely different narrative structure.",
            "rwfb_boring": "The script has no personality. Add unexpected analogies, opinionated takes, surprising comparisons.",
            "rwfb_newangle": "Forget the current angle entirely. Find a completely new, different angle for this topic.",
        }
        feedback = feedback_map.get(action, "Improve the script overall.")

        _do_rewrite_with_feedback(chat_id, message_id, topic_id, feedback)

    elif action == "research":
        edit_message(chat_id, message_id, "🔍 <b>Researching...</b>", {"inline_keyboard": []})
        text, markup = _build_research(topic_id)
        edit_message(chat_id, message_id, text, markup)


# ==========================================
# Text Message Handler
# ==========================================

def _do_rewrite_with_feedback(chat_id, message_id, topic_id, feedback):
    """Rewrite script with specific feedback."""
    conn = db.get_connection()
    t = conn.execute("SELECT title FROM topics WHERE id=?", (topic_id,)).fetchone()["title"]
    old_script = conn.execute("SELECT script_text FROM scripts WHERE topic_id=? ORDER BY id DESC LIMIT 1", (topic_id,)).fetchone()
    conn.close()

    edit_message(chat_id, message_id,
                 f"✏️ <b>Rewriting:</b> {t}\n\n💬 Feedback: <i>{feedback[:100]}</i>\n\n⏳ Generating new script... (2-3 min)",
                 {"inline_keyboard": []})

    from content_processor import process_topic_with_feedback
    result = process_topic_with_feedback(topic_id, feedback, old_script["script_text"] if old_script else None)

    if result.get("error"):
        edit_message(chat_id, message_id, f"❌ Error: {result['error']}",
                     {"inline_keyboard": [[{"text": "◀️ Back", "callback_data": f"detail_{topic_id}"}]]})
    else:
        text, markup = _build_script(topic_id)
        edit_message(chat_id, message_id, text, markup)

    # Clear pending state
    db.set_preference("rewrite_pending_topic", None)


def _handle_text(chat_id, text):
    text = text.strip()

    # Check if we're waiting for rewrite feedback (free text)
    pending_topic = db.get_preference("rewrite_pending_topic")
    if pending_topic and not text.startswith("/"):
        # User typed free text feedback for rewrite
        send_message(chat_id, f"✏️ <b>Got your feedback:</b> <i>{text[:100]}</i>\n⏳ Rewriting... (2-3 min)")
        from content_processor import process_topic_with_feedback
        conn = db.get_connection()
        old_script = conn.execute("SELECT script_text FROM scripts WHERE topic_id=? ORDER BY id DESC LIMIT 1", (pending_topic,)).fetchone()
        conn.close()
        result = process_topic_with_feedback(pending_topic, text, old_script["script_text"] if old_script else None)
        db.set_preference("rewrite_pending_topic", None)
        if result.get("error"):
            send_message(chat_id, f"❌ Error: {result['error']}")
        else:
            t, m = _build_script(pending_topic)
            send_message(chat_id, t, m)
        return

    if text in ("/start", "/help"):
        send_message(chat_id, "\n".join([
            "🤖 <b>YT Research Bot</b>\n",
            "/digest — Top candidates",
            "/scan — Scan now",
            "/stats — Statistics",
            "/queue — Saved for later",
            "/best — Best sources",
            "/research [topic] — Research topic",
            "\n💡 Send <b>YouTube link</b> to analyze",
            "💡 Send <b>any text</b> to request topic",
        ]))
    elif text == "/digest":
        t, m = _build_digest(0)
        send_message(chat_id, t, m)
    elif text == "/scan":
        send_message(chat_id, "🔥 Scanning... (~3 min)")
        subprocess.run(["python3", os.path.join(os.path.dirname(__file__), "run_pipeline.py")], timeout=600)
        t, m = _build_digest(0)
        send_message(chat_id, t, m)
    elif text == "/stats":
        t, m = _build_stats()
        send_message(chat_id, t, m)
    elif text == "/queue":
        t, m = _build_queue()
        send_message(chat_id, t, m)
    elif text == "/best":
        t, m = _build_best()
        send_message(chat_id, t, m)
    elif text.startswith("/research "):
        query = text[10:].strip()
        if not query:
            send_message(chat_id, "Usage: /research [topic]")
            return
        send_message(chat_id, f"🔍 Researching: <b>{query}</b>...")
        search_script = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "research", "scripts", "search.py")
        result = subprocess.run(["python3", search_script, query], capture_output=True, text=True, timeout=30)
        if result.stdout:
            try:
                data = json.loads(result.stdout)
                videos = data.get("results", data.get("videos", []))[:5]
                lines = [f"🔍 <b>{query}</b>\n"]
                for i, v in enumerate(videos):
                    lines.append(f"{i+1}. <b>{v.get('title', 'N/A')[:55]}</b>")
                    lines.append(f"   👁 {v.get('views', '?')} · {v.get('channel', 'N/A')}")
                send_message(chat_id, "\n".join(lines))
            except json.JSONDecodeError:
                send_message(chat_id, "❌ Parse error.")
        else:
            send_message(chat_id, "❌ No results.")
    elif "youtube.com" in text or "youtu.be" in text:
        _handle_video_link(chat_id, text)
    elif text.startswith("/"):
        send_message(chat_id, "Unknown command. /help")
    else:
        send_message(chat_id, f"📝 <b>Noted:</b> {text}\nWill prioritize in next scan.")


def _handle_video_link(chat_id, text):
    url_match = re.search(r'(https?://(?:www\.)?(?:youtube\.com/watch\?v=|youtu\.be/)[\w-]+)', text)
    if not url_match:
        send_message(chat_id, "Couldn't parse URL.")
        return
    url = url_match.group(1)
    send_message(chat_id, f"📥 Analyzing: {url}")
    transcript_script = os.path.join(os.path.dirname(__file__), "..", "..", ".claude", "skills", "research", "scripts", "transcript.py")
    result = subprocess.run(["python3", transcript_script, url], capture_output=True, text=True, timeout=30)
    if result.stdout:
        try:
            data = json.loads(result.stdout)
            title = data.get("title", "Unknown")
            transcript = data.get("transcript", "")
            conn = db.get_connection()
            conn.execute("INSERT INTO user_likes (url, title, transcript) VALUES (?, ?, ?)", (url, title, transcript[:5000]))
            conn.commit()
            conn.close()
            send_message(chat_id, f"✅ <b>Saved:</b> {title}\n📝 {len(transcript)} chars\n💡 Noted for recommendations.")
        except json.JSONDecodeError:
            send_message(chat_id, "❌ Failed.")
    else:
        send_message(chat_id, "❌ No transcript.")


# ==========================================
# Update Processor
# ==========================================

def process_updates():
    chat_id = get_chat_id()
    if not chat_id:
        return

    result = _api_call("getUpdates", {"limit": 20, "timeout": 0})
    if not result.get("ok"):
        return

    last_id = db.get_preference("telegram_last_update_id") or 0

    for update in result.get("result", []):
        uid = update.get("update_id", 0)
        if uid <= last_id:
            continue

        callback = update.get("callback_query")
        if callback:
            cb_msg = callback.get("message", {})
            cb_chat = cb_msg.get("chat", {}).get("id", chat_id)
            cb_msg_id = cb_msg.get("message_id")
            _handle_callback(cb_chat, cb_msg_id, callback.get("data", ""), callback.get("id"))
            db.set_preference("telegram_last_update_id", uid)
            continue

        msg = update.get("message", {})
        text = msg.get("text", "").strip()
        msg_chat = msg.get("chat", {}).get("id", chat_id)
        if text:
            _handle_text(msg_chat, text)
        db.set_preference("telegram_last_update_id", uid)


# ==========================================
# CLI
# ==========================================

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        chat_id = get_chat_id()
        if not chat_id:
            print("No chat_id. Message the bot first.")
            sys.exit(1)
        if cmd == "digest":
            t, m = _build_digest(0)
            send_message(chat_id, t, m)
        elif cmd == "poll":
            process_updates()
        elif cmd == "stats":
            t, m = _build_stats()
            send_message(chat_id, t, m)
    else:
        print("Usage: python3 telegram_bot.py [digest|poll|stats]")
