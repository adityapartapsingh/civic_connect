"""
Rule-based Priority Score Computation for Civic Connect.

Calculates priority based on:
1. Category severity weight
2. Community corroboration (upvotes)
3. Proximity to vulnerable facilities (schools, hospitals, transit)
4. Recurrence / history in the immediate vicinity
5. Fraud status penalties
"""

from __future__ import annotations

from typing import Any, Dict, Optional, Tuple
from utils.geo import is_near_facility


# Base weights by civic issue category (0-30 scale)
CATEGORY_WEIGHTS: Dict[str, int] = {
    "fallen_tree": 28,      # Immediate physical safety / road blockage hazard
    "water_leakage": 25,    # Resource waste / contamination hazard
    "drainage": 24,         # Health & flooding hazard
    "pothole": 20,          # Vehicle damage / accident risk
    "road_damage": 20,      # Structural transport risk
    "street_light": 16,     # Night safety / crime prevention
    "garbage": 14,          # Sanitation risk
    "stagnant_water": 22,   # Mosquito vector risk
    "illegal_dumping": 15,  # Environmental sanitation
    "other": 10,
}


def calculate_priority_score(
    category: str,
    upvote_count: int = 0,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    is_recurring: bool = False,
    is_flagged_fraud: bool = False,
    override_boost: int = 0,
) -> Tuple[int, str, Dict[str, Any]]:
    """
    Calculate the priority score (0-100) and classification level for a civic report.

    Returns:
        Tuple of (score: int, level: str, breakdown: dict)
    """
    cat_key = (category or "").lower().strip().replace(" ", "_")
    base_weight = CATEGORY_WEIGHTS.get(cat_key, 12)

    # 1. Category score (up to 30)
    cat_score = base_weight

    # 2. Upvote corroboration (up to 30 points: 3 points per upvote)
    upvote_score = min(max(0, upvote_count) * 3, 30)

    # 3. Proximity to sensitive civic facilities (schools, hospitals, transit) (+20 points)
    near_facility = False
    facility_score = 0
    if lat is not None and lng is not None:
        near_facility = is_near_facility(lat, lng)
        if near_facility:
            facility_score = 20

    # 4. Recurring civic issue in the vicinity (+15 points)
    recurrence_score = 15 if is_recurring else 0

    # Combine positive factors
    total_score = cat_score + upvote_score + facility_score + recurrence_score + override_boost

    # 5. Fraud penalty: If report is flagged for fraud, sharply suppress priority
    if is_flagged_fraud:
        total_score = min(total_score, 10)

    # Clamp total score between 0 and 100
    final_score = max(0, min(100, int(total_score)))

    # Determine classification level
    if final_score >= 75:
        level = "CRITICAL"
    elif final_score >= 50:
        level = "HIGH"
    elif final_score >= 25:
        level = "MEDIUM"
    else:
        level = "LOW"

    breakdown = {
        "category_score": cat_score,
        "upvote_score": upvote_score,
        "near_facility": near_facility,
        "facility_score": facility_score,
        "is_recurring": is_recurring,
        "recurrence_score": recurrence_score,
        "is_flagged_fraud": is_flagged_fraud,
        "override_boost": override_boost,
        "final_score": final_score,
        "level": level,
    }

    return final_score, level, breakdown
