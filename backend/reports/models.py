"""
Report Models, Status Enums, and MongoDB Data Access Layer for Civic Connect.
"""

from __future__ import annotations

import datetime
import logging
from typing import Any, Dict, List, Optional, Tuple
from bson import ObjectId
from civic_connect.mongo import get_collection, parse_object_id, serialize_doc, serialize_docs
from gamification.models import ActionPoints, GamificationManager
from utils.geo import (
    build_box_query,
    build_near_query,
    haversine_distance,
    point_to_geojson,
    validate_coordinates,
)
from utils.priority import calculate_priority_score
from utils.ticket_id import generate_ticket_id
from wards.routing import route_category_to_department, route_location_to_ward

logger = logging.getLogger(__name__)


class ReportStatus:
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    DISPUTED = "DISPUTED"
    REJECTED = "REJECTED"

    CHOICES = [
        SUBMITTED,
        VERIFIED,
        IN_PROGRESS,
        RESOLVED,
        CLOSED,
        DISPUTED,
        REJECTED,
    ]


class PriorityLevel:
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

    CHOICES = [LOW, MEDIUM, HIGH, CRITICAL]


class ReportManager:
    """Core Data Access Layer for Civic Reports in MongoDB."""

    @staticmethod
    def get_collection():
        return get_collection("reports")

    @classmethod
    def get_by_id(cls, report_id: str) -> Optional[Dict[str, Any]]:
        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}
        doc = cls.get_collection().find_one(query)
        return serialize_doc(doc)

    @classmethod
    def get_by_ticket_id(cls, ticket_id: str) -> Optional[Dict[str, Any]]:
        if not ticket_id:
            return None
        doc = cls.get_collection().find_one({"ticket_id": ticket_id.strip()})
        return serialize_doc(doc)

    @classmethod
    def create_report(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new civic report with ticket_id, priority scoring,
        department & ward routing, and fraud metadata.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        lat = data.get("latitude")
        lng = data.get("longitude")
        lat_f, lng_f = validate_coordinates(lat, lng)

        ticket_id = data.get("ticket_id") or generate_ticket_id()
        category = (data.get("category") or "other").lower().strip()

        # Routing to Ward and Department
        ward_id = data.get("ward_id") or route_location_to_ward(lat_f, lng_f)
        dept_id = data.get("department_id") or route_category_to_department(category)

        # Check local recurrence (same category within 200m in past 14 days)
        is_recurring = False
        try:
            col = cls.get_collection()
            fourteen_days_ago = now - datetime.timedelta(days=14)
            recurring_doc = col.find_one({
                "category": category,
                "created_at": {"$gte": fourteen_days_ago},
                "location": {
                    "$near": {
                        "$geometry": point_to_geojson(lat_f, lng_f),
                        "$maxDistance": 200.0,
                    }
                },
            })
            if recurring_doc:
                is_recurring = True
        except Exception:
            pass

        # Calculate initial priority
        fraud_meta = data.get("fraud_metadata") or {}
        is_flagged_fraud = data.get("is_flagged_fraud", fraud_meta.get("is_flagged_fraud", False))
        score, level, breakdown = calculate_priority_score(
            category=category,
            upvote_count=0,
            lat=lat_f,
            lng=lng_f,
            is_recurring=is_recurring,
            is_flagged_fraud=is_flagged_fraud,
        )

        initial_status = ReportStatus.SUBMITTED
        reporter_id = data.get("reporter_id") or "anonymous"
        reporter_name = data.get("reporter_name", "Citizen")

        status_entry = {
            "status": initial_status,
            "changed_by": reporter_name,
            "role": "citizen",
            "notes": "Issue reported by citizen.",
            "timestamp": now.isoformat(),
        }

        photos = data.get("photos", [])
        primary_photo = data.get("primary_photo") or (photos[0] if photos else None)

        report_doc = {
            "ticket_id": ticket_id,
            "title": data.get("title") or f"{category.replace('_', ' ').title()} Issue",
            "description": data.get("description", ""),
            "category": category,
            "photos": photos,
            "primary_photo": primary_photo,
            "phash": data.get("phash", ""),
            "location": point_to_geojson(lat_f, lng_f),
            "latitude": lat_f,
            "longitude": lng_f,
            "address": data.get("address", ""),
            "ward_id": ward_id,
            "department_id": dept_id,
            "status": initial_status,
            "priority_score": score,
            "priority_level": level,
            "priority_factors": breakdown,
            "reporter_id": reporter_id,
            "reporter_name": reporter_name,
            "reporter_phone": data.get("reporter_phone", ""),
            "upvote_count": 0,
            "evidence": [],
            "status_history": [status_entry],
            "fraud_metadata": fraud_meta,
            "is_flagged_fraud": is_flagged_fraud,
            "created_at": now,
            "updated_at": now,
        }

        col = cls.get_collection()
        insert_res = col.insert_one(report_doc)
        report_doc["_id"] = insert_res.inserted_id

        # Award points to reporter if registered user
        if reporter_id and reporter_id != "anonymous":
            try:
                GamificationManager.record_points(
                    user_id=reporter_id,
                    action="REPORT_SUBMITTED",
                    base_points=ActionPoints.REPORT_SUBMITTED,
                    report_id=ticket_id,
                    notes=f"Submitted report {ticket_id}",
                )
            except Exception as exc:
                logger.warning(f"Error recording points for report creation: {exc}")

        return serialize_doc(report_doc) or {}

    @classmethod
    def query_nearby(
        cls,
        lat: float,
        lng: float,
        radius_meters: float = 5000.0,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Query reports ordered by distance using MongoDB $near or Haversine fallback."""
        lat_f, lng_f = validate_coordinates(lat, lng)
        col = cls.get_collection()
        filter_dict: Dict[str, Any] = {
            "status": {"$ne": ReportStatus.REJECTED},
        }
        if category:
            filter_dict["category"] = category.lower().strip()

        results: List[Dict[str, Any]] = []
        try:
            # 1. Primary MongoDB 2dsphere $near query
            geo_query = dict(filter_dict)
            geo_query["location"] = build_near_query(lat_f, lng_f, radius_meters=radius_meters)
            cursor = col.find(geo_query).limit(limit)
            docs = list(cursor)

            for doc in docs:
                coords = doc.get("location", {}).get("coordinates", [])
                if len(coords) == 2:
                    dist = haversine_distance(lat_f, lng_f, coords[1], coords[0])
                    doc["distance_meters"] = round(dist, 1)
                results.append(serialize_doc(doc))

        except Exception as exc:
            logger.warning(f"Geospatial $near query failed, using Haversine calculation: {exc}")
            # 2. Resilient fallback: Query active reports and filter via Haversine
            cursor = col.find(filter_dict).sort("created_at", -1).limit(200)
            for doc in cursor:
                coords = doc.get("location", {}).get("coordinates", [])
                if len(coords) == 2:
                    d = haversine_distance(lat_f, lng_f, coords[1], coords[0])
                    if d <= radius_meters:
                        doc["distance_meters"] = round(d, 1)
                        results.append(serialize_doc(doc))
            results.sort(key=lambda x: x.get("distance_meters", 999999))
            results = results[:limit]

        return results

    @classmethod
    def query_feed(
        cls,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius_meters: float = 10000.0,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        Ranked feed of active reports based on priority score, upvotes,
        and proximity to user.
        """
        col = cls.get_collection()
        base_filter = {"status": {"$nin": [ReportStatus.REJECTED, ReportStatus.CLOSED]}}

        reports = []
        if lat is not None and lng is not None:
            reports = cls.query_nearby(lat=lat, lng=lng, radius_meters=radius_meters, limit=limit * 2)
        else:
            docs = list(col.find(base_filter).sort([("priority_score", -1), ("upvote_count", -1)]).limit(limit))
            reports = serialize_docs(docs)

        # Feed ranking algorithm: Sort by composite score (priority_score * 0.7 + upvotes * 3 - distance penalty)
        def rank_key(item: Dict[str, Any]) -> float:
            p_score = float(item.get("priority_score", 0))
            upvotes = float(item.get("upvote_count", 0))
            dist = float(item.get("distance_meters", 1000.0))
            dist_factor = max(0.0, 20.0 - (dist / 500.0))
            return p_score + (upvotes * 3.0) + dist_factor

        reports.sort(key=rank_key, reverse=True)
        return reports[:limit]

    @classmethod
    def query_map_bounding_box(
        cls,
        north: float,
        south: float,
        east: float,
        west: float,
        limit: int = 300,
    ) -> List[Dict[str, Any]]:
        """Fetch map pins within bounding box rectangle."""
        col = cls.get_collection()
        box_query = {
            "status": {"$ne": ReportStatus.REJECTED},
            "location": build_box_query(north=north, south=south, east=east, west=west),
        }

        fields = {
            "ticket_id": 1,
            "title": 1,
            "category": 1,
            "status": 1,
            "priority_level": 1,
            "priority_score": 1,
            "latitude": 1,
            "longitude": 1,
            "primary_photo": 1,
            "created_at": 1,
        }

        try:
            cursor = col.find(box_query, fields).limit(limit)
            return serialize_docs(list(cursor))
        except Exception:
            # Fallback coordinate comparison
            cursor = col.find({
                "status": {"$ne": ReportStatus.REJECTED},
                "latitude": {"$gte": float(south), "$lte": float(north)},
                "longitude": {"$gte": float(west), "$lte": float(east)},
            }, fields).limit(limit)
            return serialize_docs(list(cursor))

    @classmethod
    def update_status(
        cls,
        report_id: str,
        new_status: str,
        changed_by: str = "Officer",
        role: str = "officer",
        notes: str = "",
        resolution_photo: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """Update report status and log transition history."""
        col = cls.get_collection()
        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}

        now = datetime.datetime.now(datetime.timezone.utc)
        status_entry = {
            "status": new_status,
            "changed_by": changed_by,
            "role": role,
            "notes": notes,
            "timestamp": now.isoformat(),
            "photo_url": resolution_photo,
        }

        update_set: Dict[str, Any] = {
            "status": new_status,
            "updated_at": now,
        }
        if notes:
            update_set["resolution_notes"] = notes
        if resolution_photo:
            update_set["resolution_photo"] = resolution_photo
        if new_status == ReportStatus.RESOLVED:
            update_set["resolved_at"] = now

        doc = col.find_one_and_update(
            query,
            {
                "$set": update_set,
                "$push": {"status_history": status_entry},
            },
            return_document=True,
        )
        return serialize_doc(doc)

    @classmethod
    def confirm_resolution(
        cls,
        report_id: str,
        citizen_id: str = "citizen",
        notes: str = "Citizen confirmed work completed.",
    ) -> Optional[Dict[str, Any]]:
        """Citizen confirms resolution -> awards +20 points to reporter, closes ticket."""
        col = cls.get_collection()
        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}

        doc = col.find_one(query)
        if not doc:
            return None

        now = datetime.datetime.now(datetime.timezone.utc)
        status_entry = {
            "status": ReportStatus.CLOSED,
            "changed_by": citizen_id,
            "role": "citizen",
            "notes": notes,
            "timestamp": now.isoformat(),
        }

        updated_doc = col.find_one_and_update(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "status": ReportStatus.CLOSED,
                    "closed_at": now,
                    "updated_at": now,
                    "citizen_confirmed": True,
                },
                "$push": {"status_history": status_entry},
            },
            return_document=True,
        )

        # Award +20 points to original reporter
        reporter_id = doc.get("reporter_id")
        if reporter_id and reporter_id != "anonymous":
            try:
                GamificationManager.record_points(
                    user_id=reporter_id,
                    action="REPORT_CONFIRMED",
                    base_points=ActionPoints.REPORT_CONFIRMED,
                    report_id=doc.get("ticket_id"),
                    notes="Citizen confirmed issue resolution (+20 pts).",
                )
            except Exception as exc:
                logger.warning(f"Error awarding confirmation points: {exc}")

        return serialize_doc(updated_doc)

    @classmethod
    def dispute_resolution(
        cls,
        report_id: str,
        citizen_id: str = "citizen",
        dispute_reason: str = "Issue was not resolved properly.",
    ) -> Optional[Dict[str, Any]]:
        """Citizen disputes resolution -> auto-escalates to DISPUTED with priority boost."""
        col = cls.get_collection()
        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}

        doc = col.find_one(query)
        if not doc:
            return None

        now = datetime.datetime.now(datetime.timezone.utc)

        # Escalation: Boost priority score by 25 points, bump level to CRITICAL or HIGH
        old_score = doc.get("priority_score", 50)
        new_score = min(100, old_score + 25)
        new_level = PriorityLevel.CRITICAL if new_score >= 75 else PriorityLevel.HIGH

        status_entry = {
            "status": ReportStatus.DISPUTED,
            "changed_by": citizen_id,
            "role": "citizen",
            "notes": f"Disputed: {dispute_reason}",
            "timestamp": now.isoformat(),
        }

        updated_doc = col.find_one_and_update(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "status": ReportStatus.DISPUTED,
                    "priority_score": new_score,
                    "priority_level": new_level,
                    "dispute_reason": dispute_reason,
                    "disputed_at": now,
                    "updated_at": now,
                },
                "$push": {"status_history": status_entry},
            },
            return_document=True,
        )
        return serialize_doc(updated_doc)

    @classmethod
    def add_evidence(
        cls,
        report_id: str,
        photo_url: str,
        phash: str = "",
        submitted_by: str = "citizen",
        notes: str = "",
    ) -> Optional[Dict[str, Any]]:
        """Add corroborating photo with timestamp to existing report."""
        col = cls.get_collection()
        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}

        now = datetime.datetime.now(datetime.timezone.utc)
        evidence_entry = {
            "id": str(ObjectId()),
            "photo_url": photo_url,
            "phash": phash,
            "submitted_by": submitted_by,
            "notes": notes,
            "timestamp": now.isoformat(),
        }

        updated_doc = col.find_one_and_update(
            query,
            {
                "$push": {"evidence": evidence_entry, "photos": photo_url},
                "$set": {"updated_at": now},
            },
            return_document=True,
        )

        if updated_doc and submitted_by and submitted_by != "anonymous":
            try:
                GamificationManager.record_points(
                    user_id=submitted_by,
                    action="EVIDENCE_ADDED",
                    base_points=ActionPoints.EVIDENCE_ADDED,
                    report_id=updated_doc.get("ticket_id"),
                    notes="Added corroborating photo evidence.",
                )
            except Exception as exc:
                logger.warning(f"Error awarding evidence points: {exc}")

        return serialize_doc(updated_doc)

    @classmethod
    def add_upvote(
        cls,
        report_id: str,
        user_id: Optional[str] = None,
        device_id: Optional[str] = None,
        photo_url: Optional[str] = None,
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        'I see this too' upvote with optional photo.
        Prevents duplicate upvote from same user or device.
        Recalculates priority score on success.
        """
        if not user_id and not device_id:
            device_id = "device_guest"

        upvotes_col = get_collection("upvotes")
        reports_col = cls.get_collection()

        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}
        doc = reports_col.find_one(query)
        if not doc:
            return False, "Report not found.", None

        rep_id_str = str(doc["_id"])

        # Check existing upvote
        dup_query: Dict[str, Any] = {"report_id": rep_id_str}
        if user_id:
            dup_query["user_id"] = user_id
        else:
            dup_query["device_id"] = device_id

        existing = upvotes_col.find_one(dup_query)
        if existing:
            return False, "You have already upvoted this report.", serialize_doc(doc)

        now = datetime.datetime.now(datetime.timezone.utc)
        upvote_record = {
            "report_id": rep_id_str,
            "user_id": user_id,
            "device_id": device_id,
            "photo_url": photo_url,
            "created_at": now,
        }
        upvotes_col.insert_one(upvote_record)

        # Recalculate priority
        new_upvote_count = doc.get("upvote_count", 0) + 1
        coords = doc.get("location", {}).get("coordinates", [0, 0])
        score, level, breakdown = calculate_priority_score(
            category=doc.get("category", "other"),
            upvote_count=new_upvote_count,
            lat=coords[1],
            lng=coords[0],
            is_recurring=doc.get("priority_factors", {}).get("is_recurring", False),
            is_flagged_fraud=doc.get("is_flagged_fraud", False),
        )

        update_ops: Dict[str, Any] = {
            "$inc": {"upvote_count": 1},
            "$set": {
                "priority_score": score,
                "priority_level": level,
                "priority_factors": breakdown,
                "updated_at": now,
            },
        }
        if photo_url:
            update_ops["$push"] = {"photos": photo_url}

        updated_doc = reports_col.find_one_and_update(
            {"_id": doc["_id"]},
            update_ops,
            return_document=True,
        )

        # Award upvote points
        if user_id and user_id != "anonymous":
            try:
                GamificationManager.record_points(
                    user_id=user_id,
                    action="UPVOTE_GIVEN",
                    base_points=ActionPoints.UPVOTE_GIVEN,
                    report_id=doc.get("ticket_id"),
                    notes="Corroborated report ('I see this too').",
                )
            except Exception as exc:
                logger.warning(f"Error awarding upvote points: {exc}")

        return True, "Upvote recorded successfully.", serialize_doc(updated_doc)
