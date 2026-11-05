"""
Gemini AI Content Quality, Civic Issue Verification, and Anti-Spam Pipeline.
Supports graceful offline fallback when GEMINI_API_KEY is not configured or offline.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Optional
import requests
from django.conf import settings
from fraud.text_quality import CIVIC_LEXICON, detect_gibberish_or_meaningless

logger = logging.getLogger(__name__)


def get_gemini_api_key() -> str:
    """Retrieve Gemini API key from settings or environment."""
    return os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "") or ""


def verify_hazard_content(
    title: str,
    description: str,
    category: str,
    address: str = "",
) -> Dict[str, Any]:
    """
    Assess report quality, civic legitimacy, and spam likelihood using Gemini LLM.
    Falls back to deterministic heuristics if API key is missing or service is offline.
    """
    # Step 1: Pre-filter via fast local heuristics
    is_gibberish, gibb_reason, details = detect_gibberish_or_meaningless(title, description)
    if is_gibberish:
        return {
            "is_acceptable": False,
            "is_spam": True,
            "risk_score": 95.0,
            "cleaned_title": title,
            "suggested_category": category,
            "rejection_reason": gibb_reason,
            "provider": "heuristic_filter",
            "details": details,
        }

    api_key = get_gemini_api_key()

    # Step 2: Try Gemini API if key is available and non-dummy
    if api_key and not api_key.startswith("your_") and len(api_key) > 10:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        try:
            prompt_text = (
                f"You are a strict municipal civic issue validator for a civic reporting app. Analyze this citizen complaint:\n"
                f"Title: {title}\n"
                f"Description: {description}\n"
                f"Category: {category}\n"
                f"Location context: {address}\n\n"
                f"Evaluate whether this is a legitimate civic hazard (pothole, garbage, drainage, street light, broken pipe, etc.) "
                f"or meaningless spam, test junk, commercial advertisement, or prank.\n"
                f"Return ONLY valid JSON with keys:\n"
                f"- is_civic_hazard (bool)\n"
                f"- is_spam (bool)\n"
                f"- risk_score (float 0.0 to 100.0, where 0 is clean civic hazard, 100 is pure spam/fake)\n"
                f"- cleaned_title (str)\n"
                f"- suggested_category (str)\n"
                f"- reason (str)"
            )

            payload = {
                "contents": [{"parts": [{"text": prompt_text}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "maxOutputTokens": 300,
                    "responseMimeType": "application/json",
                },
            }

            resp = requests.post(endpoint, json=payload, timeout=3.5)
            if resp.status_code == 200:
                raw_data = resp.json()
                text_out = raw_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                parsed = json.loads(text_out)

                is_civic = bool(parsed.get("is_civic_hazard", True))
                is_spam = bool(parsed.get("is_spam", False))
                risk = float(parsed.get("risk_score", 0.0))

                return {
                    "is_acceptable": is_civic and not is_spam and risk < 60.0,
                    "is_spam": is_spam or not is_civic,
                    "risk_score": risk,
                    "cleaned_title": parsed.get("cleaned_title") or title,
                    "suggested_category": parsed.get("suggested_category") or category,
                    "rejection_reason": parsed.get("reason", "") if (is_spam or not is_civic) else "",
                    "provider": "gemini-2.0-flash",
                }
        except Exception as exc:
            logger.warning(f"Gemini API check timed out or failed, using heuristic fallback: {exc}")

    # Step 3: Heuristic Fallback (Offline / No Key Mode)
    combined = f"{title} {description}".lower()
    has_civic_word = any(kw in combined for kw in CIVIC_LEXICON)

    return {
        "is_acceptable": True,
        "is_spam": False,
        "risk_score": 10.0 if has_civic_word else 30.0,
        "cleaned_title": title,
        "suggested_category": category,
        "rejection_reason": "",
        "provider": "local_heuristic_fallback",
        "has_civic_keywords": has_civic_word,
    }
