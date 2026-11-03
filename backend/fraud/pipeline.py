"""
Verification & Intake Pipeline for Civic Hazard Reports.
Orchestrates Gibberish Filtering, LLM Content Verification, Fraud Checks,
and Spatio-Semantic Duplicate Detection & Timeline Merging.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional, TypedDict
from fraud.duplicates import find_nearby_active_duplicate, merge_duplicate_into_timeline
from fraud.llm_verifier import verify_hazard_content
from fraud.services import analyze_report_fraud
from reports.models import ReportManager

logger = logging.getLogger(__name__)


class VerificationResult(TypedDict):
    is_valid: bool
    status_code: int
    error_message: Optional[str]
    is_duplicate: bool
    report_data: Optional[Dict[str, Any]]


def run_report_verification_pipeline(
    title: str,
    description: str,
    category: str,
    latitude: float,
    longitude: float,
    accuracy: float = 15.0,
    is_mock: bool = False,
    photo_file: Any = None,
    photo_url: str = "",
    reporter_id: str = "anonymous",
    reporter_name: str = "Citizen",
    reporter_phone: str = "",
    address: str = "",
    ward_id: Optional[str] = None,
) -> VerificationResult:
    """
    Executes the complete verification and ingestion pipeline:
    1. Text Quality & Meaningless Gibberish Filter
    2. LLM Hazard & Spam Evaluator (Gemini with local fallback)
    3. Media & Location Fraud Checks (pHash, Moiré FFT, Mock GPS)
    4. Duplicate Detection & Timeline Merging
    5. Clean Ticket Creation (if not duplicate)
    """
    # -------------------------------------------------------------
    # Step 1 & 2: Text Quality & LLM Content Verification
    # -------------------------------------------------------------
    llm_check = verify_hazard_content(
        title=title,
        description=description,
        category=category,
        address=address,
    )

    if not llm_check.get("is_acceptable", True):
        reason = llm_check.get("rejection_reason") or "Invalid, meaningless, or spam report."
        return {
            "is_valid": False,
            "status_code": 400,
            "error_message": f"Report Rejected: {reason}",
            "is_duplicate": False,
            "report_data": None,
        }

    # -------------------------------------------------------------
    # Step 3: Media & Location Fraud Analysis
    # -------------------------------------------------------------
    fraud_result: Dict[str, Any] = {}
    try:
        fraud_result = analyze_report_fraud(
            image_input=photo_file,
            lat=latitude,
            lng=longitude,
            accuracy=accuracy,
            is_mock_location=is_mock,
            reporter_id=reporter_id,
        )
    except Exception as exc:
        logger.warning(f"Fraud check fallback: {exc}")
        fraud_result = {"is_flagged_fraud": False, "phash": ""}

    phash = fraud_result.get("phash", "")

    # -------------------------------------------------------------
    # Step 4: Spatio-Semantic Duplicate Detection
    # -------------------------------------------------------------
    dup_parent, dup_score, match_reason = find_nearby_active_duplicate(
        lat=latitude,
        lng=longitude,
        category=category,
        title=title,
        description=description,
        phash=phash,
        radius_meters=75.0,
    )

    if dup_parent:
        logger.info(f"Duplicate hazard identified (Score: {dup_score:.1f}, Reason: {match_reason}). Merging into timeline...")
        merged_report = merge_duplicate_into_timeline(
            parent_report=dup_parent,
            photo_url=photo_url,
            phash=phash,
            reporter_id=reporter_id,
            reporter_name=reporter_name,
            title=title,
            description=description,
        )
        return {
            "is_valid": True,
            "status_code": 200,
            "error_message": None,
            "is_duplicate": True,
            "report_data": merged_report,
        }

    # -------------------------------------------------------------
    # Step 5: Clean Ticket Creation in MongoDB
    # -------------------------------------------------------------
    photos_list = [photo_url] if photo_url else []
    create_payload = {
        "title": llm_check.get("cleaned_title") or title,
        "description": description,
        "category": llm_check.get("suggested_category") or category,
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "ward_id": ward_id,
        "photos": photos_list,
        "primary_photo": photo_url,
        "phash": phash,
        "reporter_id": reporter_id or "anonymous",
        "reporter_name": reporter_name,
        "reporter_phone": reporter_phone,
        "fraud_metadata": fraud_result,
        "is_flagged_fraud": fraud_result.get("is_flagged_fraud", False),
    }

    report_doc = ReportManager.create_report(create_payload)
    return {
        "is_valid": True,
        "status_code": 201,
        "error_message": None,
        "is_duplicate": False,
        "report_data": report_doc,
    }
