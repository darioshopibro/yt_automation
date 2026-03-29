#!/usr/bin/env python3
"""Always-on Telegram poller — runs continuously, processes button clicks and messages."""

import time
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from telegram_bot import process_updates

POLL_INTERVAL = 1  # seconds between polls

if __name__ == "__main__":
    print("🤖 Telegram poller started. Polling every 3 seconds...")
    print("   Press Ctrl+C to stop.\n")

    while True:
        try:
            process_updates()
        except KeyboardInterrupt:
            print("\n👋 Poller stopped.")
            break
        except Exception as e:
            print(f"⚠️ Error: {e}")
            time.sleep(10)  # wait longer on error
            continue

        time.sleep(POLL_INTERVAL)
