"""Pipeline logger — tracks every step of the pipeline with status, timing, and details.

Logs to both:
1. SQLite (pipeline_logs table) — for history and querying
2. Console — human-readable summary
3. JSON file — machine-readable for the agent to read

Every scan run gets a run_id. Every step within that run gets logged.
At the end, a summary report is generated.
"""

import os
import json
import time
from datetime import datetime, timezone

import db

LOG_DIR = os.path.join(os.path.dirname(__file__), "data", "logs")


def _ensure_log_dir():
    os.makedirs(LOG_DIR, exist_ok=True)


def _ensure_log_table():
    """Create pipeline_logs table if it doesn't exist."""
    conn = db.get_connection()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS pipeline_logs (
            id INTEGER PRIMARY KEY,
            run_id INTEGER,
            step TEXT NOT NULL,
            status TEXT NOT NULL,
            started_at TEXT,
            completed_at TEXT,
            duration_ms INTEGER,
            items_in INTEGER DEFAULT 0,
            items_out INTEGER DEFAULT 0,
            errors TEXT,
            details TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_pipeline_logs_run ON pipeline_logs(run_id);
    """)
    conn.commit()
    conn.close()


_ensure_log_table()


class PipelineLogger:
    """Logger for a single pipeline run."""

    def __init__(self, run_id):
        self.run_id = run_id
        self.steps = []
        self._current_step = None
        self._run_start = time.time()

    def start_step(self, step_name):
        """Mark the beginning of a pipeline step."""
        self._current_step = {
            "step": step_name,
            "status": "running",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "start_time": time.time(),
            "items_in": 0,
            "items_out": 0,
            "errors": [],
            "details": {},
        }
        print(f"  ⏳ {step_name}...")
        return self._current_step

    def complete_step(self, items_in=0, items_out=0, details=None):
        """Mark current step as completed successfully."""
        if not self._current_step:
            return

        elapsed = time.time() - self._current_step["start_time"]
        self._current_step.update({
            "status": "ok",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "duration_ms": int(elapsed * 1000),
            "items_in": items_in,
            "items_out": items_out,
            "details": details or {},
        })

        self._save_step()
        icon = "✅"
        detail_str = f"({items_in} in → {items_out} out, {elapsed:.1f}s)"
        print(f"  {icon} {self._current_step['step']} {detail_str}")
        self.steps.append(self._current_step)
        self._current_step = None

    def fail_step(self, error, items_in=0, items_out=0, details=None):
        """Mark current step as failed."""
        if not self._current_step:
            return

        elapsed = time.time() - self._current_step["start_time"]
        self._current_step.update({
            "status": "failed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "duration_ms": int(elapsed * 1000),
            "items_in": items_in,
            "items_out": items_out,
            "errors": [error] if isinstance(error, str) else error,
            "details": details or {},
        })

        self._save_step()
        print(f"  ❌ {self._current_step['step']} FAILED: {error} ({elapsed:.1f}s)")
        self.steps.append(self._current_step)
        self._current_step = None

    def partial_step(self, error, items_in=0, items_out=0, details=None):
        """Mark current step as partial success (some items, some errors)."""
        if not self._current_step:
            return

        elapsed = time.time() - self._current_step["start_time"]
        self._current_step.update({
            "status": "partial",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "duration_ms": int(elapsed * 1000),
            "items_in": items_in,
            "items_out": items_out,
            "errors": [error] if isinstance(error, str) else error,
            "details": details or {},
        })

        self._save_step()
        print(f"  ⚠️  {self._current_step['step']} PARTIAL ({items_out} items, errors: {error}) ({elapsed:.1f}s)")
        self.steps.append(self._current_step)
        self._current_step = None

    def _save_step(self):
        """Persist step to database."""
        s = self._current_step
        conn = db.get_connection()
        conn.execute(
            """INSERT INTO pipeline_logs (run_id, step, status, started_at, completed_at,
               duration_ms, items_in, items_out, errors, details)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (self.run_id, s["step"], s["status"], s["started_at"], s["completed_at"],
             s["duration_ms"], s["items_in"], s["items_out"],
             json.dumps(s["errors"]), json.dumps(s["details"]))
        )
        conn.commit()
        conn.close()

    def get_summary(self):
        """Generate a full run summary."""
        total_time = time.time() - self._run_start
        ok_steps = [s for s in self.steps if s["status"] == "ok"]
        failed_steps = [s for s in self.steps if s["status"] == "failed"]
        partial_steps = [s for s in self.steps if s["status"] == "partial"]

        summary = {
            "run_id": self.run_id,
            "total_steps": len(self.steps),
            "ok": len(ok_steps),
            "failed": len(failed_steps),
            "partial": len(partial_steps),
            "total_duration_s": round(total_time, 1),
            "overall_status": "ok" if not failed_steps else ("partial" if ok_steps else "failed"),
            "steps": [],
        }

        for s in self.steps:
            summary["steps"].append({
                "step": s["step"],
                "status": s["status"],
                "duration_ms": s["duration_ms"],
                "items_in": s["items_in"],
                "items_out": s["items_out"],
                "errors": s["errors"],
            })

        return summary

    def save_report(self):
        """Save JSON report to logs directory."""
        _ensure_log_dir()
        summary = self.get_summary()
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        filepath = os.path.join(LOG_DIR, f"run_{self.run_id}_{timestamp}.json")

        with open(filepath, "w") as f:
            json.dump(summary, f, indent=2)

        return filepath

    def print_report(self):
        """Print human-readable summary report."""
        summary = self.get_summary()

        print(f"\n{'='*60}")
        print(f"PIPELINE RUN REPORT (run #{summary['run_id']})")
        print(f"{'='*60}")
        print(f"Overall: {summary['overall_status'].upper()} | "
              f"{summary['ok']} ok, {summary['partial']} partial, {summary['failed']} failed | "
              f"{summary['total_duration_s']}s total")
        print(f"{'─'*60}")

        for s in summary["steps"]:
            icon = {"ok": "✅", "failed": "❌", "partial": "⚠️"}.get(s["status"], "?")
            duration = f"{s['duration_ms']/1000:.1f}s"
            items = f"{s['items_in']}→{s['items_out']}"
            errors = f" | ERRORS: {s['errors']}" if s["errors"] else ""
            print(f"  {icon} {s['step']:30s} {s['status']:8s} {items:12s} {duration}{errors}")

        print(f"{'='*60}")
        return summary


def get_last_runs(limit=5):
    """Get summary of last N pipeline runs from logs."""
    conn = db.get_connection()
    rows = conn.execute("""
        SELECT run_id, step, status, duration_ms, items_in, items_out, errors
        FROM pipeline_logs
        WHERE run_id IN (
            SELECT DISTINCT run_id FROM pipeline_logs ORDER BY run_id DESC LIMIT ?
        )
        ORDER BY run_id DESC, id ASC
    """, (limit,)).fetchall()
    conn.close()

    runs = {}
    for r in rows:
        rid = r["run_id"]
        if rid not in runs:
            runs[rid] = {"run_id": rid, "steps": []}
        runs[rid]["steps"].append(dict(r))

    return list(runs.values())
