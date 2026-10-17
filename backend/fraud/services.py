"""
Fraud Orchestration Service for Civic Connect.

Combines perceptual hash duplicate detection, screen recapture analysis,
and GPS location anomaly verification into a consolidated risk score.
"""

from __future__ import annotations

import io
import logging
from typing import Any, Dict, List, Optional, Tuple, Union
from PIL import Image
from fraud.phash import compute_image_phash, find_duplicate_reports
from fraud.recapture import detect_screen_recapture
from fraud.location import verify_location_integrity

logger = logging.getLogger(__name__)

# Default fraud risk threshold (0-100)
FRAUD_RISK_THRESHOLD = 50.0


def analyze_report_fraud(
    image_input: Optional[Union[str, bytes, io.BytesIO, Image.Image]] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    accuracy: Optional[float] = None,
    is_mock_location: bool = False,
    reporter_id: Optional[str] = None,
    threshold: float = FRAUD_RISK_THRESHOLD,
) -> Dict[str, Any]:
    """
    Execute full fraud detection pipeline on an incoming civic report.

    Returns:
        Dict containing:
            - is_flagged_fraud: bool
            - risk_score: float (0.0 to 100.0)
            - phash: str
            - flags: List[str]
            - checks: Dict with individual test results
    """
    total_risk = 0.0
    flags: List[str] = []
    checks: Dict[str, Any] = {}
    phash_str = ""

    # -------------------------------------------------------------
    # 1. Image Perceptual Hash & Duplicate Detection
    # -------------------------------------------------------------
    if image_input is not None:
        phash_str = compute_image_phash(image_input)
        checks["phash"] = phash_str

        if phash_str:
            duplicates = find_duplicate_reports(phash_str, threshold=6, limit=3)
            checks["duplicate_matches"] = duplicates
            if duplicates:
                flags.append("DUPLICATE_PHOTO_DETECTED")
                # Penalty depends on similarity
                closest_dist = min(d["distance"] for d in duplicates)
                if closest_dist <= 2:
                    total_risk += 50.0
                else:
                    total_risk += 35.0

        # ---------------------------------------------------------
        # 2. Screen Recapture & Moiré Pattern Analysis
        # ---------------------------------------------------------
        is_recapture, recapture_conf, recapture_details = detect_screen_recapture(image_input)
        checks["recapture"] = recapture_details
        if is_recapture:
            flags.append("SCREEN_RECAPTURE_DETECTED")
            total_risk += recapture_conf * 45.0
        elif recapture_conf > 0.4:
            total_risk += 20.0

    # -------------------------------------------------------------
    # 3. GPS Location Integrity Analysis
    # -------------------------------------------------------------
    if lat is not None and lng is not None:
        is_suspicious_loc, loc_penalty, loc_flags, loc_details = verify_location_integrity(
            lat=lat,
            lng=lng,
            accuracy=accuracy,
            is_mock=is_mock_location,
            reporter_id=reporter_id,
        )
        checks["location"] = loc_details
        flags.extend(loc_flags)
        total_risk += loc_penalty

    # Clamp risk score
    final_risk_score = round(max(0.0, min(100.0, total_risk)), 2)
    is_flagged = final_risk_score >= threshold

    return {
        "is_flagged_fraud": is_flagged,
        "risk_score": final_risk_score,
        "phash": phash_str,
        "flags": flags,
        "threshold": threshold,
        "checks": checks,
    }
