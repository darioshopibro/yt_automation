"""Google Trends scanner — RSS feed + tech keyword filtering."""

import urllib.request
import xml.etree.ElementTree as ET

from config import SCANNER_TIMEOUT


def scan():
    """Fetch trending searches from Google Trends RSS."""
    try:
        url = "https://trends.google.com/trending/rss?geo=US"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=SCANNER_TIMEOUT) as resp:
            content = resp.read().decode("utf-8")

        root = ET.fromstring(content)
        xml_items = root.findall(".//item")

        items = []
        for item in xml_items:
            title_el = item.find("title")
            link_el = item.find("link")
            pub_el = item.find("pubDate")

            title = title_el.text if title_el is not None else ""
            if not title:
                continue

            items.append({
                "source_type": "trends",
                "source_detail": "google_trends_us",
                "title": title,
                "url": link_el.text if link_el is not None else "",
                "score": 0,  # Google Trends RSS doesn't give numeric scores
                "comments": 0,
                "published_at": pub_el.text if pub_el is not None else "",
                "raw_data": {},
            })

        return {"source": "trends", "items": items, "error": None}

    except Exception as e:
        return {"source": "trends", "items": [], "error": str(e)}
