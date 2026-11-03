"""
Spatio-Semantic Hazard Duplicate Detector and Timeline Merging Service.
Identifies nearby unresolved duplicate civic complaints and merges evidence
and notes into the existing active ticket timeline rather than cluttering city queues.
"""

from __future__ import annotations

import datetime
import logging
from typing import Any, Dict, List, Optional, Tuple
from bson import ObjectId
from civic_connect.mongo import get_collection, serialize_doc
from fraud.phash import hamming_distance
from gamification.models import ActionPoints, GamificationManager
from users.models import UserManager
from utils.geo import haversine_distance, point_to_geojson
from utils.priority import calculate_priority_score

try:
    from rapidfuzz import fuzz
    HAS_RAPIDFUZZ = True
except ImportError:
    HAS_RAPIDFUZZ = False

logger = logging.getLogger(__name__)

ACTIVE_STATUSES = ["SUBMITTED", "VERIFIED", "IN_PROGRESS", "DISPUTED"]


def find_nearby_active_duplicate(
    lat: float,
    lng: float,
    category: str,
    title: str,
    description: str,
    phash: str = "",
    radius_meters: float = 75.0,
) -> Tuple[Optional[Dict[str, Any]], float, str]:
    """
    Search MongoDB for active reports in the vicinity and compute duplicate similarity score.
    Returns: (duplicate_doc, score, matching_reason)
    """
    col = get_collection("reports")
    now = datetime.datetime.now(datetime.timezone.utc)
    thirty_days_ago = now - datetime.timedelta(days=30)

    # 1. Search active tickets
    query: Dict[str, Any] = {
        "status": {"$in": ACTIVE_STATUSES},
        "created_at": {"$gte": thirty_days_ago},
    }

    try:
        # Try geospatial $near query if indexed
        geo_query = {
            **query,
            "location": {
                "$near": {
                    "$geometry": point_to_geojson(lat, lng),
                    "$maxDistance": radius_meters,
                }
            },
        }
        candidates = list(col.find(geo_query).limit(10))
    except Exception:
        # Fallback to local filtering if 2dsphere index query is unsupported in current collection state
        candidates = list(col.find(query).limit(50))

    if not candidates:
        return None, 0.0, "No nearby active tickets."

    best_match: Optional[Dict[str, Any]] = None
    best_score = 0.0
    best_reason = ""

    new_text = f"{title} {description}".lower()

    for cand in candidates:
        score = 0.0
        reasons = []

        coords = cand.get("location", {}).get("coordinates", [])
        if len(coords) != 2:
            continue
        c_lng, c_lat = coords[0], coords[1]
        dist = haversine_distance(lat, lng, c_lat, c_lng)

        # Skip if beyond threshold radius
        if dist > radius_meters:
            continue

        # A. Proximity Score (max 35 pts)
        if dist <= 20.0:
            score += 35.0
            reasons.append(f"Proximity {dist:.1f}m (+35)")
        elif dist <= 50.0:
            score += 25.0
            reasons.append(f"Proximity {dist:.1f}m (+25)")
        else:
            score += 15.0
            reasons.append(f"Proximity {dist:.1f}m (+15)")

        # B. Category Match (max 25 pts)
        cand_cat = (cand.get("category") or "").lower()
        if cand_cat == category.lower():
            score += 25.0
            reasons.append("Exact category match (+25)")
        elif cand_cat in ["pothole", "road_damage"] and category.lower() in ["pothole", "road_damage"]:
            score += 18.0
            reasons.append("Compatible category match (+18)")
        elif cand_cat in ["drainage", "water_leakage"] and category.lower() in ["drainage", "water_leakage"]:
            score += 18.0
            reasons.append("Compatible water hazard match (+18)")

        # C. Textual Semantic Similarity (max 25 pts)
        cand_text = f"{cand.get('title', '')} {cand.get('description', '')}".lower()
        if HAS_RAPIDFUZZ:
            token_ratio = fuzz.token_set_ratio(new_text, cand_text)
            if token_ratio >= 60:
                text_pts = (token_ratio / 100.0) * 25.0
                score += text_pts
                reasons.append(f"Text similarity {token_ratio:.0f}% (+{text_pts:.1f})")
        else:
            # Simple word overlap fallback
            w1 = set(new_text.split())
            w2 = set(cand_text.split())
            overlap = len(w1.intersection(w2))
            if overlap >= 2:
                score += 15.0
                reasons.append(f"Keyword overlap (+15)")

        # D. Image Hash Match (max 15 pts)
        cand_phash = cand.get("phash", "")
        if phash and cand_phash:
            try:
                h_dist = hamming_distance(phash, cand_phash)
                if h_dist <= 6:
                    score += 15.0
                    reasons.append(f"Visual pHash match dist={h_dist} (+15)")
                elif h_dist <= 12:
                    score += 8.0
                    reasons.append(f"Visual pHash close dist={h_dist} (+8)")
            except Exception:
                pass

        if score > best_score:
            best_score = score
            best_match = cand
            best_reason = "; ".join(reasons)

    # Threshold for duplicate confirmation is 55.0 points
    if best_score >= 55.0 and best_match is not None:
        return serialize_doc(best_match), best_score, best_reason

    return None, best_score, best_reason


def merge_duplicate_into_timeline(
    parent_report: Dict[str, Any],
    photo_url: str,
    phash: str,
    reporter_id: str,
    reporter_name: str,
    title: str,
    description: str,
) -> Dict[str, Any]:
    """
    Attach citizen's corroboration and photo to the existing ticket's timeline and evidence stack.
    Awards +10 points and +10 coins to the citizen for corroborating community evidence.
    """
    col = get_collection("reports")
    now = datetime.datetime.now(datetime.timezone.utc)
    report_id = parent_report["_id"] if "_id" in parent_report else parent_report["id"]
    oid = ObjectId(report_id) if isinstance(report_id, str) else report_id

    # 1. Create Evidence Item
    evidence_entry = {
        "id": str(ObjectId()),
        "photo_url": photo_url or parent_report.get("primary_photo") or "",
        "phash": phash or "",
        "submitted_by": reporter_name or reporter_id or "Citizen",
        "notes": f"Corroborating report: '{title}'. {description}",
        "timestamp": now.isoformat(),
        "stage": "in_progress",
    }

    # 2. Create Status History (Timeline) Entry
    timeline_entry = {
        "status": parent_report.get("status", "SUBMITTED"),
        "changed_by": reporter_name or "Citizen",
        "role": "citizen",
        "notes": f"Citizen Corroboration: Additional report and evidence submitted by {reporter_name or 'Citizen'}. Issue corroborated.",
        "timestamp": now.isoformat(),
        "photo_url": photo_url or None,
        "is_corroboration": True,
    }

    # 3. Recalculate Priority Score with incremented upvotes/corroborations
    new_upvotes = parent_report.get("upvote_count", 0) + 1
    coords = parent_report.get("location", {}).get("coordinates", [0, 0])
    score, level, breakdown = calculate_priority_score(
        category=parent_report.get("category", "other"),
        upvote_count=new_upvotes,
        lat=coords[1] if len(coords) == 2 else 0,
        lng=coords[0] if len(coords) == 2 else 0,
        is_recurring=True,
    )

    update_ops: Dict[str, Any] = {
        "$push": {
            "evidence": evidence_entry,
            "status_history": timeline_entry,
        },
        "$inc": {"upvote_count": 1},
        "$set": {
            "priority_score": score,
            "priority_level": level,
            "priority_factors": breakdown,
            "updated_at": now,
        },
    }
    if photo_url:
        update_ops["$push"]["photos"] = photo_url
    if reporter_id and reporter_id != "anonymous":
        update_ops.setdefault("$addToSet", {})["corroborating_reporters"] = reporter_id

    updated = col.find_one_and_update({"_id": oid}, update_ops, return_document=True)

    # 4. Award Points & Coins to Reporter (+10 pts & +10 coins)
    if reporter_id and reporter_id != "anonymous":
        try:
            GamificationManager.record_points(
                user_id=reporter_id,
                action="DUPLICATE_CORROBORATION",
                base_points=ActionPoints.REPORT_SUBMITTED,
                report_id=parent_report.get("ticket_id"),
                notes=f"Corroborated existing ticket {parent_report.get('ticket_id')} with evidence",
            )
            # Also credit dual-currency coins
            UserManager.add_points_and_coins(
                user_id=reporter_id,
                points=10,
                coins=10,
                reason=f"Corroborated existing ticket {parent_report.get('ticket_id')}",
            )
        except Exception as exc:
            logger.warning(f"Error awarding duplicate corroboration points: {exc}")

    res = serialize_doc(updated) or serialize_doc(parent_report) or {}
    res["is_duplicate"] = True
    res["merged_into_ticket_id"] = parent_report.get("ticket_id")
    res["message"] = (
        f"An active hazard report already exists at this location ({parent_report.get('ticket_id')}). "
        f"Your evidence and report have been merged into the ticket timeline, and +10 Points & +10 Coins have been awarded to your account!"
    )
    return res
