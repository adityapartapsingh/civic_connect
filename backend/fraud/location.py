"""
Location Fraud and Anomaly Verification.

Performs GPS integrity checks:
1. Mock provider flags (Android/iOS mock location APIs)
2. Precision anomalies (accuracy == 0m or accuracy > 300m)
3. Coordinate jump / teleportation velocity checks against recent user reports
"""

from __future__ import annotations

import datetime
import logging
from typing import Any, Dict, List, Optional, Tuple
from civic_connect.mongo import get_collection
from utils.geo import haversine_distance, validate_coordinates

logger = logging.getLogger(__name__)

# Max realistic travel speed between reports (km/h)
MAX_REALISTIC_SPEED_KMH = 150.0


def verify_location_integrity(
    lat: float,
    lng: float,
    accuracy: Optional[float] = None,
    is_mock: bool = False,
    reporter_id: Optional[str] = None,
) -> Tuple[bool, float, List[str], Dict[str, Any]]:
    """
    Verify the integrity of report GPS coordinates.

    Returns:
        Tuple of (is_suspicious: bool, penalty_score: float, flags: list, details: dict)
    """
    flags: List[str] = []
    penalty_score: float = 0.0
    details: Dict[str, Any] = {}

    try:
        lat, lng = validate_coordinates(lat, lng)
    except ValueError as exc:
        flags.append("INVALID_COORDINATES")
        return True, 50.0, flags, {"error": str(exc)}

    # 1. Direct mock location flag check
    if is_mock:
        flags.append("MOCK_PROVIDER_DETECTED")
        penalty_score += 40.0

    # 2. Accuracy anomalies
    if accuracy is not None:
        try:
            acc = float(accuracy)
            details["accuracy"] = acc
            if acc == 0.0:
                # 0.0m is a strong indicator of artificial mock location
                flags.append("ZERO_GPS_ACCURACY_ANOMALY")
                penalty_score += 30.0
            elif acc > 300.0:
                flags.append("EXCESSIVE_GPS_INACCURACY")
                penalty_score += 15.0
        except (ValueError, TypeError):
            flags.append("MALFORMED_ACCURACY_VALUE")

    # 3. Velocity / Teleportation check if reporter_id is provided
    if reporter_id:
        try:
            reports_col = get_collection("reports")
            last_report = reports_col.find_one(
                {"reporter_id": reporter_id},
                sort=[("created_at", -1)],
            )

            if last_report and "location" in last_report and "created_at" in last_report:
                coords = last_report["location"].get("coordinates", [])
                if len(coords) == 2:
                    last_lng, last_lat = coords[0], coords[1]
                    dist_meters = haversine_distance(lat, lng, last_lat, last_lng)

                    # Parse previous report timestamp
                    last_created = last_report["created_at"]
                    if isinstance(last_created, str):
                        last_time = datetime.datetime.fromisoformat(
                            last_created.replace("Z", "+00:00")
                        )
                    elif isinstance(last_created, datetime.datetime):
                        last_time = last_created
                    else:
                        last_time = None

                    if last_time:
                        now_utc = datetime.datetime.now(datetime.timezone.utc)
                        if last_time.tzinfo is None:
                            last_time = last_time.replace(tzinfo=datetime.timezone.utc)
                        time_diff_sec = max(1.0, (now_utc - last_time).total_seconds())

                        speed_kmh = (dist_meters / 1000.0) / (time_diff_sec / 3600.0)
                        details["calculated_speed_kmh"] = round(speed_kmh, 2)
                        details["last_report_distance_meters"] = round(dist_meters, 2)

                        # Check if physically impossible speed (> 150 km/h) over significant distance
                        if speed_kmh > MAX_REALISTIC_SPEED_KMH and dist_meters > 5000.0:
                            flags.append("IMPOSSIBLE_TRAVEL_VELOCITY")
                            penalty_score += 35.0
        except Exception as exc:
            logger.warning(f"Error checking user velocity: {exc}")

    is_suspicious = penalty_score >= 30.0 or "MOCK_PROVIDER_DETECTED" in flags
    details["flags"] = flags
    details["penalty_score"] = round(penalty_score, 2)

    return is_suspicious, penalty_score, flags, details
