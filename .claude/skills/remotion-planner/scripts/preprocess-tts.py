#!/usr/bin/env python3
"""
TTS Preprocessor - Čisti tekst za prirodniji AI voiceover

Funkcije:
1. Zamenjuje tehničke termine fonetskim verzijama
2. Uklanja filler words (um, uh, basically, literally...)
3. Popravlja "and then" repetition
4. Pretvara u kontrakcije (do not → don't)

Usage: python3 preprocess-tts.py "tekst za preprocessing"
       python3 preprocess-tts.py --file input.txt
       python3 preprocess-tts.py --file input.txt --auto-fix --clean
"""

import json
import re
import sys
import os
from pathlib import Path

# ============================================
# FILLER WORDS TO REMOVE
# ============================================
FILLER_WORDS = [
    r'\b(um|uh|ah)\b',
    r'\b(like)\s*,',  # "like," as filler
    r'\b(basically|literally|actually|honestly)\s*,?\s*',
    r'\b(you know|I mean|kind of|sort of)\s*,?\s*',
    r'\b(just|really)\s+',  # "just" and "really" as weak qualifiers
]

# ============================================
# "AND THEN" REPETITION FIX
# ============================================
# Zameni ponavljajuće "and then" sa varied transitions
TRANSITION_REPLACEMENTS = [
    # Pattern: više "and then" u blizini
    (r'and then[,\s]+and then[,\s]+and then', 'First, ... Then, ... Finally,'),
    (r'and then[,\s]+and then', 'Then, ... After that,'),
    # Pojedinačni "and then" na početku rečenice
    (r'(?<=[.!?]\s)[Aa]nd then\b', 'Then'),
    (r'^[Aa]nd then\b', 'Then'),
    # "and so basically" → "Therefore"
    (r'\b[Aa]nd so basically\b', 'Therefore'),
    (r'\b[Ss]o basically\b', 'So'),
    # "and also" → "Additionally"
    (r'\b[Aa]nd also\b', 'Additionally'),
]

# ============================================
# CONTRACTIONS (sounds more natural)
# ============================================
CONTRACTIONS = {
    r'\b[Ii]t is\b': "it's",
    r'\b[Tt]hat is\b': "that's",
    r'\b[Ww]hat is\b': "what's",
    r'\b[Tt]here is\b': "there's",
    r'\b[Hh]ere is\b': "here's",
    r'\b[Ww]ho is\b': "who's",
    r'\b[Dd]o not\b': "don't",
    r'\b[Dd]oes not\b': "doesn't",
    r'\b[Dd]id not\b': "didn't",
    r'\b[Ii]s not\b': "isn't",
    r'\b[Aa]re not\b': "aren't",
    r'\b[Ww]as not\b': "wasn't",
    r'\b[Ww]ere not\b': "weren't",
    r'\b[Hh]as not\b': "hasn't",
    r'\b[Hh]ave not\b': "haven't",
    r'\b[Hh]ad not\b': "hadn't",
    r'\b[Ww]ill not\b': "won't",
    r'\b[Ww]ould not\b': "wouldn't",
    r'\b[Cc]ould not\b': "couldn't",
    r'\b[Ss]hould not\b': "shouldn't",
    r'\b[Cc]an not\b': "can't",
    r'\b[Cc]annot\b': "can't",
    r'\b[Yy]ou are\b': "you're",
    r'\b[Ww]e are\b': "we're",
    r'\b[Tt]hey are\b': "they're",
    r'\b[Ii] am\b': "I'm",
    r'\b[Yy]ou will\b': "you'll",
    r'\b[Ww]e will\b': "we'll",
    r'\b[Tt]hey will\b': "they'll",
    r'\b[Ii] will\b': "I'll",
    r'\b[Yy]ou have\b': "you've",
    r'\b[Ww]e have\b': "we've",
    r'\b[Tt]hey have\b': "they've",
    r'\b[Ii] have\b': "I've",
    r'\b[Ll]et us\b': "let's",
}

# Pronađi dictionary relativno od ovog skripta
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent.parent.parent
DICTIONARY_PATH = PROJECT_ROOT / "research" / "tech-terms-dictionary.json"

def load_dictionary():
    """Učitaj dictionary iz JSON fajla"""
    if not DICTIONARY_PATH.exists():
        print(f"ERROR: Dictionary not found at {DICTIONARY_PATH}", file=sys.stderr)
        sys.exit(1)

    with open(DICTIONARY_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Spoji sve kategorije u jedan dict (osim 'notes')
    all_terms = {}
    for category, terms in data.items():
        if category not in ['version', 'description', 'lastUpdated', 'notes']:
            if isinstance(terms, dict):
                all_terms.update(terms)

    return all_terms

def remove_fillers(text: str) -> str:
    """Ukloni filler words (um, uh, basically, you know...)"""
    processed = text
    for pattern in FILLER_WORDS:
        processed = re.sub(pattern, '', processed, flags=re.IGNORECASE)
    # Očisti višestruke razmake
    processed = re.sub(r'\s+', ' ', processed)
    return processed.strip()


def fix_transitions(text: str) -> str:
    """Popravi 'and then' repetition sa varied transitions"""
    processed = text
    for pattern, replacement in TRANSITION_REPLACEMENTS:
        processed = re.sub(pattern, replacement, processed)
    return processed


def apply_contractions(text: str) -> str:
    """Pretvori 'do not' → 'don't' za prirodniji zvuk"""
    processed = text
    for pattern, replacement in CONTRACTIONS.items():
        processed = re.sub(pattern, replacement, processed)
    return processed


def clean_text_for_tts(text: str) -> str:
    """
    FULL CLEANING PIPELINE (sigurna pravila):
    1. Remove fillers
    2. Fix transitions
    3. Apply contractions
    """
    processed = text
    processed = remove_fillers(processed)
    processed = fix_transitions(processed)
    processed = apply_contractions(processed)
    return processed


def preprocess_text(text: str, dictionary: dict) -> str:
    """
    Zameni sve tehničke termine fonetskim verzijama.
    Radi case-sensitive zamenu, sortira po dužini (duži termini prvo).
    """
    processed = text

    # Sortiraj termine po dužini (duži prvo) da izbegneš parcijalne zamene
    # npr. "GraphQL" pre "Graph"
    sorted_terms = sorted(dictionary.items(), key=lambda x: len(x[0]), reverse=True)

    for term, replacement in sorted_terms:
        # Word boundary regex za tačnu zamenu
        # Escapuj specijalne regex karaktere u terminu
        escaped_term = re.escape(term)
        pattern = r'\b' + escaped_term + r'\b'
        processed = re.sub(pattern, replacement, processed)

    return processed

def detect_unknown_acronyms(text: str, dictionary: dict) -> list:
    """
    Detektuj CAPS reči koje nisu u dictionary-ju.
    Vraća listu potencijalnih acronyma za ručnu proveru.
    """
    # Pronađi sve CAPS reči (2+ slova)
    caps_pattern = r'\b[A-Z]{2,}\b'
    found_caps = set(re.findall(caps_pattern, text))

    # Filtriraj one koji su već u dictionary
    unknown = [word for word in found_caps if word not in dictionary]

    return sorted(unknown)

def auto_fix_unknown_acronyms(text: str, dictionary: dict, save_to_dict: bool = True) -> str:
    """
    Automatski dodaj razmake u nepoznate acronyme.
    npr. "CORS" -> "C O R S"
    Ako save_to_dict=True, čuva nove termine u dictionary fajl.
    """
    # Skip common English words that are ALL CAPS but not acronyms
    SKIP_WORDS = {"AM", "PM", "OK", "IT", "OR", "AN", "AS", "AT", "BE", "BY",
                  "DO", "GO", "IF", "IN", "IS", "ME", "MY", "NO", "OF", "ON",
                  "SO", "TO", "UP", "US", "WE", "BUT", "THE", "AND", "FOR",
                  "NOT", "YOU", "ALL", "CAN", "HER", "WAS", "ONE", "OUR",
                  "OUT", "HAS", "HIS", "HOW", "ITS", "MAY", "NEW", "NOW",
                  "OLD", "SEE", "WAY", "WHO", "DID", "GET", "LET", "SAY",
                  "SHE", "TOO", "USE", "THEN", "THAN", "THEM", "THEY",
                  "THIS", "WILL", "WITH", "HAVE", "FROM", "HERE", "JUST"}

    unknown = detect_unknown_acronyms(text, dictionary)
    unknown = [a for a in unknown if a not in SKIP_WORDS]
    processed = text

    new_entries = {}
    for acronym in unknown:
        spaced = ' '.join(list(acronym))
        pattern = r'\b' + re.escape(acronym) + r'\b'
        processed = re.sub(pattern, spaced, processed)
        new_entries[acronym] = spaced

    # Save new entries to dictionary file
    if save_to_dict and new_entries:
        _save_new_terms(new_entries)

    return processed


def _save_new_terms(new_entries: dict):
    """Append new terms to tech-terms-dictionary.json."""
    dict_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))))), 'research', 'tech-terms-dictionary.json')

    if not os.path.exists(dict_path):
        return

    try:
        with open(dict_path, 'r') as f:
            data = json.load(f)

        added = []
        for term, phonetic in new_entries.items():
            if term not in data.get("acronyms", {}):
                data.setdefault("acronyms", {})[term] = phonetic
                added.append(f"{term} → {phonetic}")

        if added:
            with open(dict_path, 'w') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"📚 Auto-added to dictionary: {', '.join(added)}")
    except Exception as e:
        print(f"⚠️ Could not update dictionary: {e}")

def main():
    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage: python3 preprocess-tts.py \"text to preprocess\"")
        print("       python3 preprocess-tts.py --file input.txt")
        print("       python3 preprocess-tts.py --file input.txt --auto-fix --clean")
        print()
        print("Flags:")
        print("  --auto-fix  Auto-add spaces to unknown acronyms (API → A P I)")
        print("  --clean     Apply text cleaning (remove fillers, fix transitions, contractions)")
        sys.exit(1)

    auto_fix = '--auto-fix' in sys.argv
    clean_text = '--clean' in sys.argv

    # Učitaj tekst
    if '--file' in sys.argv:
        file_idx = sys.argv.index('--file') + 1
        if file_idx >= len(sys.argv):
            print("ERROR: --file requires a filename", file=sys.stderr)
            sys.exit(1)

        filepath = sys.argv[file_idx]
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        # Tekst kao argument (preskači flags)
        args = [a for a in sys.argv[1:] if not a.startswith('--')]
        text = ' '.join(args)

    original_text = text

    # STEP 1: Clean text (fillers, transitions, contractions)
    if clean_text:
        text = clean_text_for_tts(text)
        print("=" * 60)
        print("CLEANING APPLIED:")
        print("=" * 60)
        print("✓ Removed fillers (um, uh, basically, literally, you know...)")
        print("✓ Fixed 'and then' repetition")
        print("✓ Applied contractions (do not → don't)")
        print()

    # STEP 2: Replace tech terms with phonetic versions
    dictionary = load_dictionary()
    processed = preprocess_text(text, dictionary)

    # STEP 3: Opciono auto-fix nepoznate acronyme
    if auto_fix:
        processed = auto_fix_unknown_acronyms(processed, dictionary)

    # Proveri za nepoznate acronyme
    unknown = detect_unknown_acronyms(processed, dictionary)

    # Output
    print("=" * 60)
    print("PREPROCESSED TEXT:")
    print("=" * 60)
    print(processed)
    print()

    if unknown and not auto_fix:
        print("=" * 60)
        print("WARNING: Unknown acronyms detected (not in dictionary):")
        print("=" * 60)
        for acr in unknown:
            suggested = ' '.join(list(acr))
            print(f"  {acr} -> suggested: \"{suggested}\"")
        print()
        print("Run with --auto-fix to automatically add spaces to these.")

    # Return samo processed text za piping
    return processed

if __name__ == "__main__":
    main()
