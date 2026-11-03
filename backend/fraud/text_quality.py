"""
Text Quality, Gibberish, and Spam Heuristic Engine for Civic Reports.
Provides fast, zero-dependency statistical and linguistic checks to reject
random keyboard mashing, character spam, and nonsensical report submissions.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from typing import Any, Dict, List, Tuple

# Common QWERTY and Indian keyboard walk sequences
KEYBOARD_WALKS = [
    "qwerty", "asdfgh", "zxcvbn", "123456", "qwertz", "azerty",
    "yuiop", "hjkl", "vbnm", "67890", "poiuy", "lkjhg", "mnbvc",
    "asdf", "qwer", "zxcv", "ghjkl"
]

CIVIC_LEXICON = {
    "pothole", "road", "street", "drain", "drainage", "water", "leak", "pipe",
    "sewage", "garbage", "trash", "waste", "dump", "light", "lamp", "pole",
    "wire", "cable", "electric", "footpath", "sidewalk", "manhole", "cover",
    "crater", "broken", "overflow", "stagnant", "traffic", "signal", "tree",
    "branch", "fallen", "danger", "hazard", "smell", "dustbin", "clean", "repair",
    "street light", "water supply", "gutter", "nalah", "kachra", "sadak",
    "pipeline", "flooding", "debris", "sanitation", "encroachment", "park"
}


def calculate_shannon_entropy(text: str) -> float:
    """Calculate Shannon entropy (bits per character) of a string."""
    cleaned = re.sub(r"\s+", "", text.lower())
    if not cleaned:
        return 0.0
    counts = Counter(cleaned)
    length = len(cleaned)
    return -sum((cnt / length) * math.log2(cnt / length) for cnt in counts.values())


def detect_gibberish_or_meaningless(title: str, description: str) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Fast rule-based detector for random typing, character spam, and nonsensical text.
    Returns: (is_gibberish: bool, reason: str, details: dict)
    """
    title_clean = (title or "").strip()
    desc_clean = (description or "").strip()
    combined = f"{title_clean} {desc_clean}".strip().lower()

    details: Dict[str, Any] = {}

    # 1. Minimum Length Check
    if len(title_clean) < 3:
        return True, "Title is too short to describe a civic issue (minimum 3 characters required).", {"code": "TITLE_TOO_SHORT"}
    if len(desc_clean) < 5:
        return True, "Description is too short. Please describe the problem clearly (minimum 5 characters required).", {"code": "DESC_TOO_SHORT"}

    # 2. Repeated Character Spam (e.g. 'aaaaaaa', 'pothollleeeeeee', '.....', 'zzzzzz')
    if re.search(r"(.)\1{4,}", combined):
        return True, "Meaningless text detected (excessive repeated characters). Please provide a genuine description.", {"code": "CHAR_REPETITION"}

    # 3. Repeated Words (e.g. 'test test test test', 'road road road')
    words = re.findall(r"[a-z0-9]+", combined)
    if len(words) >= 4:
        unique_ratio = len(set(words)) / len(words)
        details["unique_word_ratio"] = round(unique_ratio, 2)
        if unique_ratio < 0.30:
            return True, "Meaningless repetitive text detected. Please describe the actual civic issue.", {"code": "WORD_REPETITION"}

    # 4. Keyboard Walking (e.g. 'asdfghjk', 'qwertyuiop')
    for walk in KEYBOARD_WALKS:
        if len(walk) >= 5 and walk in combined:
            return True, f"Random keyboard pattern detected ('{walk}'). Please write a meaningful description.", {"code": "KEYBOARD_WALK"}

    # 5. Consonant Run & Vowel-to-Consonant Ratio
    # Natural words require vowels; 5+ consonants in a row is almost certainly keyboard mashing
    for word in words:
        if len(word) >= 5 and not word.isdigit():
            if re.search(r"[bcdfghjklmnpqrstvwxyz]{5,}", word):
                return True, f"Nonsensical consonant cluster detected in '{word}'. Please describe the hazard in words.", {"code": "CONSONANT_CLUSTER"}
            vowels = len(re.findall(r"[aeiou]", word))
            vowel_ratio = vowels / len(word)
            if vowel_ratio < 0.10 or vowel_ratio > 0.85:
                return True, f"Unnatural letter distribution in '{word}'. Please use clear words.", {"code": "VOWEL_RATIO_ANOMALY"}

    # 6. Shannon Entropy (low entropy means highly predictable/repetitive typing)
    entropy = calculate_shannon_entropy(combined)
    details["entropy"] = round(entropy, 2)
    if len(combined) > 20 and entropy < 1.8:
        return True, "Text has low information density (unnatural character distribution).", {"code": "LOW_ENTROPY"}

    return False, "Clean", details
