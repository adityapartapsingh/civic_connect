"""
Server-side Gemini AI Civic Issue Vision Analysis.
Analyzes captured photos to identify civic infrastructure problems (pothole, garbage, streetlight, etc.).
Runs completely on the backend; no API keys exposed to frontend clients.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import re
from typing import Any, Dict
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

VALID_CATEGORIES = [
    "pothole",
    "garbage",
    "streetlight",
    "water_leakage",
    "drainage",
    "traffic_signal",
    "fallen_tree",
    "sidewalk",
    "other",
]

SYSTEM_PROMPT = """You are a municipal civic issue classifier for an Indian city. Analyze the photo and identify the civic infrastructure problem shown.

Return ONLY valid JSON (no markdown, no code fences) with these fields:
{
  "title": "A concise 5-12 word title describing the specific issue and location context visible in the image",
  "category": "one of: pothole, garbage, streetlight, water_leakage, drainage, traffic_signal, fallen_tree, sidewalk, other",
  "description": "A detailed 2-3 sentence description of the problem visible in the image. Mention severity, approximate size/extent, and potential hazard to citizens. Write as if filing a municipal complaint.",
  "confidence": 0.0 to 1.0
}

Category definitions:
- pothole: Road surface damage, craters, broken asphalt, potholes
- garbage: Waste piles, overflowing bins, illegal dumping, litter accumulation
- streetlight: Broken/dark/damaged street lights or poles
- water_leakage: Burst water pipes, water flooding from supply lines, leaking hydrants
- drainage: Clogged drains, sewage overflow, waterlogging, open manholes
- traffic_signal: Broken/non-functioning traffic lights or signals
- fallen_tree: Fallen trees, large broken branches blocking road/path
- sidewalk: Damaged footpath, broken curbs, missing tiles, cracked pavement
- other: Any other civic issue not in the above categories

Be specific and practical. Do NOT hallucinate details not visible in the image."""


def get_gemini_api_key() -> str:
    """Retrieve Gemini API key from settings or environment."""
    return os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "") or ""


def analyze_issue_image_data(image_data: str, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Analyzes an image provided as a data URL, base64 string, or raw base64.
    Calls Gemini 2.0 Flash via server-side API call.
    Provides safe heuristic fallback if offline or API key is not configured.
    """
    raw_base64 = image_data
    if "," in image_data:
        header, raw_base64 = image_data.split(",", 1)
        mime_match = re.search(r"data:(.*?);", header)
        if mime_match:
            mime_type = mime_match.group(1)

    # Clean whitespace or line breaks
    raw_base64 = raw_base64.strip()

    api_key = get_gemini_api_key()

    if api_key and not api_key.startswith("your_") and len(api_key) > 10:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": SYSTEM_PROMPT},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": raw_base64,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 512,
                "responseMimeType": "application/json",
            },
        }

        try:
            resp = requests.post(endpoint, json=payload, timeout=12)
            if resp.status_code == 200:
                raw_data = resp.json()
                text_content = (
                    raw_data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                if text_content:
                    cleaned = re.sub(r"```json\s*", "", text_content, flags=re.IGNORECASE)
                    cleaned = re.sub(r"```\s*", "", cleaned).strip()
                    parsed = json.loads(cleaned)

                    category = parsed.get("category", "other")
                    if category not in VALID_CATEGORIES:
                        category = "other"

                    title = str(parsed.get("title", "")).strip()
                    description = str(parsed.get("description", "")).strip()
                    try:
                        confidence = float(parsed.get("confidence", 0.8))
                        confidence = max(0.0, min(1.0, confidence))
                    except (ValueError, TypeError):
                        confidence = 0.8

                    if title or description:
                        return {
                            "title": title or "Reported Civic Hazard",
                            "category": category,
                            "description": description or "Civic issue detected from photo evidence.",
                            "confidence": confidence,
                            "provider": "gemini-2.0-flash",
                        }
            else:
                logger.warning(f"[AI Vision] Gemini returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as exc:
            logger.warning(f"[AI Vision] Gemini API error: {exc}")

    # Fallback when Gemini API key is missing, rate-limited, or offline
    return {
        "title": "Reported Civic Hazard",
        "category": "other",
        "description": "Civic issue captured for municipal review. Please verify category and description details.",
        "confidence": 0.6,
        "provider": "heuristic_fallback",
    }
