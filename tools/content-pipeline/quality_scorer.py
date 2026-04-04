"""Quality scorer — readability, pacing, and format checks for scripts.

Replaces LLM-based plagiarism check with deterministic quality scoring.
Faster, more reliable, and actually useful.
"""

import re
import math


def score_readability(text):
    """Calculate Flesch-Kincaid readability metrics.

    Target for YouTube scripts: grade 6-8 (easy to follow when spoken).
    """
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    words = text.split()
    syllables = sum(_count_syllables(w) for w in words)

    if not sentences or not words:
        return {"grade": 0, "ease": 0, "status": "empty"}

    avg_sentence_length = len(words) / len(sentences)
    avg_syllables_per_word = syllables / len(words)

    # Flesch-Kincaid Grade Level
    grade = 0.39 * avg_sentence_length + 11.8 * avg_syllables_per_word - 15.59

    # Flesch Reading Ease (higher = easier, 60-70 is ideal for spoken content)
    ease = 206.835 - 1.015 * avg_sentence_length - 84.6 * avg_syllables_per_word

    if grade <= 8:
        status = "good"
    elif grade <= 10:
        status = "ok"
    else:
        status = "too_complex"

    return {
        "grade": round(grade, 1),
        "ease": round(ease, 1),
        "status": status,
    }


def score_pacing(text):
    """Check pacing metrics for spoken content.

    - Word count (target 750-900 for 5min at 160 WPM)
    - Sentence length distribution (target: most under 15 words)
    - Paragraph length (short paragraphs = better pacing)
    """
    words = text.split()
    word_count = len(words)

    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    sentence_lengths = [len(s.split()) for s in sentences]

    # WPM estimate
    estimated_duration_s = word_count / 2.67  # ~160 WPM

    # Sentence length analysis
    short_sentences = sum(1 for l in sentence_lengths if l <= 15)
    long_sentences = sum(1 for l in sentence_lengths if l > 20)
    avg_sentence_length = sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0

    pct_short = short_sentences / len(sentence_lengths) if sentence_lengths else 0
    pct_long = long_sentences / len(sentence_lengths) if sentence_lengths else 0

    issues = []
    if word_count < 650:
        issues.append(f"too_short ({word_count} words, need 700+)")
    elif word_count > 1000:
        issues.append(f"too_long ({word_count} words, target 750-900)")

    if pct_long > 0.3:
        issues.append(f"too_many_long_sentences ({long_sentences}/{len(sentence_lengths)} over 20 words)")

    if avg_sentence_length > 18:
        issues.append(f"avg_sentence_too_long ({avg_sentence_length:.0f} words, target <15)")

    return {
        "word_count": word_count,
        "estimated_duration_s": round(estimated_duration_s),
        "sentence_count": len(sentence_lengths),
        "avg_sentence_length": round(avg_sentence_length, 1),
        "pct_short_sentences": round(pct_short * 100),
        "pct_long_sentences": round(pct_long * 100),
        "issues": issues,
        "status": "good" if not issues else "needs_work",
    }


def score_tts_readiness(text):
    """Check if text is ready for TTS (ElevenLabs).

    Flags patterns that sound bad when read by AI voice.
    """
    issues = []

    # Standalone fragments (under 4 words followed by period)
    fragments = re.findall(r'(?:^|\. )([A-Z][^.!?]{0,20}[.!?])', text)
    short_fragments = [f for f in fragments if len(f.split()) <= 3]
    if len(short_fragments) > 3:
        issues.append(f"too_many_fragments ({len(short_fragments)} short sentences)")

    # Rhetorical questions
    questions = re.findall(r'\?', text)
    if len(questions) > 5:
        issues.append(f"too_many_questions ({len(questions)}, AI voice struggles with tone)")

    # Ellipsis
    ellipsis_count = text.count("...")
    if ellipsis_count > 2:
        issues.append(f"ellipsis ({ellipsis_count} occurrences, avoid dramatic pauses)")

    # URLs or code
    urls = re.findall(r'https?://\S+', text)
    if urls:
        issues.append(f"contains_urls ({len(urls)}, describe instead of reading)")

    # Emoji
    emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]', flags=re.UNICODE)
    emojis = emoji_pattern.findall(text)
    if emojis:
        issues.append(f"contains_emoji ({len(emojis)})")

    # Slang/abbreviations
    slang = re.findall(r'\b(TL;DR|IMHO|AFAIK|FYI|BTW|LMAO|LOL)\b', text, re.IGNORECASE)
    if slang:
        issues.append(f"slang ({', '.join(set(s.upper() for s in slang))})")

    return {
        "issues": issues,
        "status": "good" if not issues else "needs_work",
    }


def score_script(text):
    """Run all quality checks on a script.

    Returns overall score (0-10) and detailed breakdown.
    """
    readability = score_readability(text)
    pacing = score_pacing(text)
    tts = score_tts_readiness(text)

    # Calculate overall score
    score = 10.0

    # Readability penalties
    if readability["status"] == "too_complex":
        score -= 2.0
    elif readability["status"] == "ok":
        score -= 0.5

    # Pacing penalties
    for issue in pacing["issues"]:
        if "too_short" in issue:
            score -= 2.0
        elif "too_long" in issue:
            score -= 1.0
        elif "long_sentences" in issue:
            score -= 1.5
        elif "avg_sentence" in issue:
            score -= 1.0

    # TTS penalties
    score -= len(tts["issues"]) * 0.5

    score = max(score, 0)

    all_issues = pacing["issues"] + tts["issues"]
    if readability["status"] != "good":
        all_issues.append(f"readability_{readability['status']} (grade {readability['grade']})")

    verdict = "PASS" if score >= 6.0 else "NEEDS_REWRITE"

    return {
        "overall_score": round(score, 1),
        "verdict": verdict,
        "readability": readability,
        "pacing": pacing,
        "tts": tts,
        "issues": all_issues,
    }


def _count_syllables(word):
    """Estimate syllable count for English word."""
    word = word.lower().strip(".,!?;:\"'()-")
    if not word:
        return 0

    count = 0
    vowels = "aeiouy"
    prev_vowel = False

    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel

    # Adjustments
    if word.endswith("e") and count > 1:
        count -= 1
    if word.endswith("le") and len(word) > 2 and word[-3] not in vowels:
        count += 1

    return max(count, 1)


if __name__ == "__main__":
    # Test with sample script
    sample = """Docker just mass-revoked access tokens for thousands of users.
    If you pushed an image in the last 90 days, your credentials might be compromised right now.

    Here's what happened. A security researcher found that Docker Hub's token rotation system had a critical flaw.
    When you authenticate with Docker Hub, it generates an OAuth token that's supposed to expire after 24 hours.
    But a bug in their refresh logic meant tokens were being silently renewed indefinitely.

    That means every CI pipeline, every GitHub Action, every automated deployment that ever authenticated with Docker Hub
    was carrying around a token that never died. And someone figured out how to harvest them.

    The attack was elegant. The attacker registered a malicious Docker image that looked like a popular base image.
    When developers pulled it, the image's entrypoint script would quietly exfiltrate the Docker credentials
    stored in the local config file. Those credentials included the immortal tokens.

    Docker's response was nuclear. They force-rotated every token issued in the last 90 days.
    That broke thousands of CI pipelines overnight. Companies like Stripe, Shopify, and Cloudflare
    all reported build failures within hours.

    The fix is simple but tedious. Rotate your Docker Hub credentials manually. Check your CI secrets.
    And add token expiry validation to your pipeline configs. One line in your Dockerfile does it:
    set the TOKEN_EXPIRY environment variable to 3600 seconds. That forces a hard expiry no matter what Docker Hub says.

    The bigger lesson is that supply chain security isn't just about packages.
    It's about every authentication token, every API key, every secret that flows through your pipeline.
    Docker learned that the hard way. Don't be next."""

    result = score_script(sample)
    print(f"Overall: {result['overall_score']}/10 — {result['verdict']}")
    print(f"\nReadability: grade {result['readability']['grade']}, ease {result['readability']['ease']}")
    print(f"Pacing: {result['pacing']['word_count']} words, {result['pacing']['estimated_duration_s']}s, "
          f"avg sentence {result['pacing']['avg_sentence_length']} words")
    print(f"TTS: {result['tts']['status']}")

    if result["issues"]:
        print(f"\nIssues:")
        for i in result["issues"]:
            print(f"  - {i}")
