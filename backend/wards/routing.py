"""
Municipal Department and Ward Auto-Routing Matrix.

Maps civic issue categories to municipal departments and resolves
geographic coordinates to administrative wards.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from civic_connect.mongo import get_collection, is_mock_mode
from utils.geo import haversine_distance, point_to_geojson

logger = logging.getLogger(__name__)

# Standard Department Codes & Names
DEPARTMENTS: List[Dict[str, Any]] = [
    {
        "code": "ROADS",
        "name": "Roads & Traffic Infrastructure",
        "categories": ["pothole", "road_damage", "footpath_damaged", "manhole_open"],
        "officer_email": "roads.officer@civicconnect.gov",
    },
    {
        "code": "SWM",
        "name": "Solid Waste Management",
        "categories": ["garbage", "illegal_dumping", "uncollected_waste", "dead_animal"],
        "officer_email": "swm.officer@civicconnect.gov",
    },
    {
        "code": "ELECTRICAL",
        "name": "Electrical & Street Lighting",
        "categories": ["street_light", "electric_wire_hanging", "transformer_issue"],
        "officer_email": "electrical.officer@civicconnect.gov",
    },
    {
        "code": "WATER_SEWAGE",
        "name": "Water Supply & Sewerage",
        "categories": ["water_leakage", "drainage", "stagnant_water", "sewage_overflow", "low_pressure"],
        "officer_email": "water.officer@civicconnect.gov",
    },
    {
        "code": "HORTICULTURE",
        "name": "Horticulture & Urban Forestry",
        "categories": ["fallen_tree", "dangerous_branches", "park_maintenance"],
        "officer_email": "horticulture.officer@civicconnect.gov",
    },
    {
        "code": "PUBLIC_HEALTH",
        "name": "Public Health & Sanitation",
        "categories": ["mosquito_fogging", "sanitation_hazard"],
        "officer_email": "health.officer@civicconnect.gov",
    },
    {
        "code": "GENERAL",
        "name": "General Municipal Grievances",
        "categories": ["other", "encroachment", "noise_pollution"],
        "officer_email": "grievance.officer@civicconnect.gov",
    },
]

# Quick category-to-department lookup table
CATEGORY_TO_DEPT: Dict[str, str] = {}
for dept in DEPARTMENTS:
    for cat in dept["categories"]:
        CATEGORY_TO_DEPT[cat] = dept["code"]


def route_category_to_department(category: str) -> str:
    """Resolve report category string to departmental code."""
    normalized = (category or "").lower().strip().replace(" ", "_")
    return CATEGORY_TO_DEPT.get(normalized, "GENERAL")


def route_location_to_ward(lat: float, lng: float) -> str:
    """
    Resolve coordinates to an administrative ward.
    Checks MongoDB 2dsphere boundaries or proximity to ward centers.
    """
    if is_mock_mode():
        return "Ward-101"

    try:
        wards_col = get_collection("wards")

        # 1. Check if polygon boundary intersects
        point_geojson = point_to_geojson(lat, lng)
        intersecting = wards_col.find_one({
            "boundary": {
                "$geoIntersects": {
                    "$geometry": point_geojson
                }
            }
        })
        if intersecting:
            return str(intersecting.get("ward_number", "Ward-101"))

        # 2. Check nearest ward centroid
        nearest = wards_col.find_one({
            "location": {
                "$near": {
                    "$geometry": point_geojson,
                    "$maxDistance": 25000,
                }
            }
        })
        if nearest:
            return str(nearest.get("ward_number", "Ward-101"))

    except Exception:
        pass

    # Fallback default ward
    return "Ward-101"
