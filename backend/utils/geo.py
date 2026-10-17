"""
Geospatial and GeoJSON utilities for Civic Connect.

Handles coordinate validation, GeoJSON Point formatting, Haversine distance calculations,
and MongoDB 2dsphere proximity query construction.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple

# Earth radius in meters
EARTH_RADIUS_METERS = 6371000.0


def validate_coordinates(lat: Any, lng: Any) -> Tuple[float, float]:
    """
    Validate and return latitude and longitude as floats.
    Raises ValueError if values cannot be converted or are out of bounds.
    """
    try:
        lat_f = float(lat)
        lng_f = float(lng)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid coordinate format: lat={lat}, lng={lng}") from exc

    if not (-90.0 <= lat_f <= 90.0):
        raise ValueError(f"Latitude out of bounds [-90, 90]: {lat_f}")
    if not (-180.0 <= lng_f <= 180.0):
        raise ValueError(f"Longitude out of bounds [-180, 180]: {lng_f}")

    return round(lat_f, 6), round(lng_f, 6)


def point_to_geojson(lat: float, lng: float) -> Dict[str, Any]:
    """
    Convert latitude and longitude to a GeoJSON Point.
    Note: GeoJSON and MongoDB 2dsphere indexes require coordinates in [lng, lat] order.
    """
    lat, lng = validate_coordinates(lat, lng)
    return {
        "type": "Point",
        "coordinates": [lng, lat],
    }


def geojson_to_coords(geojson: Dict[str, Any]) -> Tuple[float, float]:
    """
    Extract (lat, lng) from a GeoJSON Point.
    """
    if not geojson or geojson.get("type") != "Point":
        raise ValueError("Provided dictionary is not a valid GeoJSON Point")
    coords = geojson.get("coordinates", [])
    if len(coords) < 2:
        raise ValueError("GeoJSON coordinates missing lat/lng values")
    lng, lat = coords[0], coords[1]
    return float(lat), float(lng)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in meters.
    """
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_METERS * c


def build_near_query(
    lat: float,
    lng: float,
    radius_meters: float = 5000.0,
    min_distance_meters: float = 0.0,
) -> Dict[str, Any]:
    """
    Build a MongoDB $near query for a 2dsphere indexed 'location' field.
    """
    lat, lng = validate_coordinates(lat, lng)
    query: Dict[str, Any] = {
        "$near": {
            "$geometry": {
                "type": "Point",
                "coordinates": [lng, lat],
            },
            "$maxDistance": float(radius_meters),
        }
    }
    if min_distance_meters > 0:
        query["$near"]["$minDistance"] = float(min_distance_meters)
    return query


def build_box_query(
    north: float,
    south: float,
    east: float,
    west: float,
) -> Dict[str, Any]:
    """
    Build a MongoDB $geoWithin $box query for map bounding box searches.
    Box format: [[bottom-left (west, south)], [top-right (east, north)]]
    """
    return {
        "$geoWithin": {
            "$box": [
                [float(west), float(south)],
                [float(east), float(north)],
            ]
        }
    }


def is_near_facility(
    lat: float,
    lng: float,
    facilities: Optional[List[Dict[str, Any]]] = None,
    threshold_meters: float = 300.0,
) -> bool:
    """
    Check if a given coordinate is within threshold distance of sensitive facilities
    (schools, hospitals, public transit junctions).
    """
    if not facilities:
        # Default mock sample critical locations for urban safety
        facilities = [
            {"name": "Civil Hospital", "lat": 12.9716, "lng": 77.5946},
            {"name": "Government High School", "lat": 12.9750, "lng": 77.6000},
            {"name": "Central Railway Station", "lat": 12.9780, "lng": 77.5700},
            {"name": "Metro Terminal", "lat": 12.9352, "lng": 77.6245},
        ]

    for fac in facilities:
        dist = haversine_distance(lat, lng, fac["lat"], fac["lng"])
        if dist <= threshold_meters:
            return True
    return False
