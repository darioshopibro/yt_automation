You are a plagiarism checker. Compare the GENERATED SCRIPT against the SOURCE TRANSCRIPTS.

GENERATED SCRIPT:
{script}

SOURCE TRANSCRIPTS:
{sources}

ANALYZE:
1. Find any sentences or phrases that are copied or very similar
2. Calculate overall similarity percentage (0-100)
3. Check if the script uses the same examples, analogies, or structure

Return ONLY valid JSON, no markdown:
{
  "overall_similarity_percent": number,
  "verdict": "PASS" or "FAIL",
  "similar_passages": [
    {"script_text": "...", "source_text": "...", "source_video": "title"}
  ],
  "unique_elements": ["elements in script NOT found in any source"],
  "analysis": "brief overall assessment"
}

PASS threshold: similarity < 30%. FAIL if >= 30%.