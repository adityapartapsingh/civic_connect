"""
Perceptual Hashing (pHash) and Duplicate Image Detection.

Computes robust visual fingerprints of civic report photos and searches
for duplicate or reused images across recent reports.
"""

from __future__ import annotations

import io
import logging
from typing import Any, Dict, List, Optional, Tuple, Union
from PIL import Image
import imagehash
from civic_connect.mongo import get_collection

logger = logging.getLogger(__name__)


def compute_image_phash(image_input: Union[str, bytes, io.BytesIO, Image.Image]) -> str:
    """
    Compute 64-bit perceptual hash (pHash) string from an image.
    Supports file paths, raw bytes, file-like objects, or PIL Image instances.
    """
    try:
        if isinstance(image_input, Image.Image):
            img = image_input
        elif isinstance(image_input, bytes):
            img = Image.open(io.BytesIO(image_input))
        elif hasattr(image_input, "read"):
            # Handles Django UploadedFile or BytesIO
            image_input.seek(0)
            img = Image.open(image_input)
        elif isinstance(image_input, str):
            img = Image.open(image_input)
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")

        # Convert to RGB to ensure uniform hash generation
        if img.mode != "RGB":
            img = img.convert("RGB")

        ph = imagehash.phash(img)
        return str(ph)
    except Exception as exc:
        logger.error(f"Failed to compute pHash: {exc}")
        return ""


def hamming_distance(hash1_str: str, hash2_str: str) -> int:
    """
    Compute Hamming distance between two hex pHash strings.
    Distance <= 6 typically indicates identical or near-duplicate images.
    """
    if not hash1_str or not hash2_str:
        return 64  # Maximum distance
    try:
        h1 = imagehash.hex_to_hash(hash1_str)
        h2 = imagehash.hex_to_hash(hash2_str)
        return int(h1 - h2)
    except Exception as exc:
        logger.warning(f"Error computing hamming distance: {exc}")
        return 64


def find_duplicate_reports(
    phash_str: str,
    threshold: int = 6,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    """
    Query MongoDB reports to find existing reports containing photos with matching pHash.
    """
    if not phash_str:
        return []

    duplicates: List[Dict[str, Any]] = []
    try:
        reports_col = get_collection("reports")
        # Query recent reports that have a phash stored
        cursor = reports_col.find(
            {"phash": {"$exists": True, "$ne": ""}},
            {"ticket_id": 1, "phash": 1, "status": 1, "created_at": 1, "photos": 1},
        ).sort("created_at", -1).limit(200)

        for doc in cursor:
            existing_phash = doc.get("phash", "")
            if not existing_phash:
                continue
            dist = hamming_distance(phash_str, existing_phash)
            if dist <= threshold:
                duplicates.append({
                    "ticket_id": doc.get("ticket_id"),
                    "distance": dist,
                    "status": doc.get("status"),
                    "created_at": doc.get("created_at"),
                })
                if len(duplicates) >= limit:
                    break
    except Exception as exc:
        logger.warning(f"Database error while searching duplicates: {exc}")

    return duplicates
