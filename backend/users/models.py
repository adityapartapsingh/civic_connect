"""
User Models and Schema Constants for Civic Connect.

Supports roles: citizen, volunteer, officer, admin.
Volunteer schemes: NSS, NCC, NYKS.
"""

from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from civic_connect.mongo import get_collection, parse_object_id, serialize_doc, serialize_docs


class UserRole:
    CITIZEN = "citizen"
    VOLUNTEER = "volunteer"
    OFFICER = "officer"
    ADMIN = "admin"

    CHOICES = [CITIZEN, VOLUNTEER, OFFICER, ADMIN]


class VolunteerScheme:
    NONE = "NONE"
    NSS = "NSS"    # National Service Scheme
    NCC = "NCC"    # National Cadet Corps
    NYKS = "NYKS"  # Nehru Yuva Kendra Sangathan

    CHOICES = [NONE, NSS, NCC, NYKS]


class BadgeTier:
    BRONZE = "Bronze"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"

    CHOICES = [BRONZE, SILVER, GOLD, PLATINUM]


class UserManager:
    """Data access layer for MongoDB Users collection."""

    @staticmethod
    def get_collection():
        return get_collection("users")

    @classmethod
    def find_by_id(cls, user_id: str) -> Optional[Dict[str, Any]]:
        oid = parse_object_id(user_id)
        query = {"$or": [{"_id": oid}, {"user_id": user_id}]} if oid else {"user_id": user_id}
        doc = cls.get_collection().find_one(query)
        return serialize_doc(doc)

    @classmethod
    def find_by_phone(cls, phone: str) -> Optional[Dict[str, Any]]:
        if not phone:
            return None
        doc = cls.get_collection().find_one({"phone": phone.strip()})
        return serialize_doc(doc)

    @classmethod
    def find_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        if not email:
            return None
        doc = cls.get_collection().find_one({"email": email.strip().lower()})
        return serialize_doc(doc)

    @classmethod
    def upsert_user(cls, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update user profile."""
        now = datetime.datetime.now(datetime.timezone.utc)
        phone = user_data.get("phone", "").strip() if user_data.get("phone") else None
        email = user_data.get("email", "").strip().lower() if user_data.get("email") else None
        user_id = user_data.get("user_id")

        query: Dict[str, Any] = {}
        if user_id:
            oid = parse_object_id(user_id)
            query = {"$or": [{"_id": oid}, {"user_id": user_id}]} if oid else {"user_id": user_id}
        elif phone:
            query = {"phone": phone}
        elif email:
            query = {"email": email}
        else:
            query = {"_id": ObjectId()}

        update_fields: Dict[str, Any] = {
            "name": user_data.get("name", "Civic User"),
            "role": user_data.get("role", UserRole.CITIZEN),
            "volunteer_scheme": user_data.get("volunteer_scheme", VolunteerScheme.NONE),
            "ward_id": user_data.get("ward_id"),
            "department_id": user_data.get("department_id"),
            "department": user_data.get("department"),
            "designation": user_data.get("designation"),
            "employee_id": user_data.get("employee_id"),
            "jurisdiction_zone": user_data.get("jurisdiction_zone"),
            "updated_at": now,
        }
        if phone:
            update_fields["phone"] = phone
        if email:
            update_fields["email"] = email

        set_on_insert = {
            "points": user_data.get("points", 0),
            "badge": user_data.get("badge", BadgeTier.BRONZE),
            "created_at": now,
            "is_active": True,
        }

        col = cls.get_collection()
        res = col.find_one_and_update(
            query,
            {"$set": update_fields, "$setOnInsert": set_on_insert},
            upsert=True,
            return_document=True,
        )
        return serialize_doc(res) or {}

    @classmethod
    def add_points(cls, user_id: str, points: int) -> Optional[Dict[str, Any]]:
        """Add points and calculate tier update."""
        oid = parse_object_id(user_id)
        query = {"$or": [{"_id": oid}, {"user_id": user_id}]} if oid else {"user_id": user_id}

        col = cls.get_collection()
        doc = col.find_one_and_update(
            query,
            {"$inc": {"points": points}},
            return_document=True,
        )
        if not doc:
            return None

        # Re-evaluate badge tier
        current_points = doc.get("points", 0)
        badge = BadgeTier.BRONZE
        if current_points >= 500:
            badge = BadgeTier.PLATINUM
        elif current_points >= 150:
            badge = BadgeTier.GOLD
        elif current_points >= 50:
            badge = BadgeTier.SILVER

        if doc.get("badge") != badge:
            doc = col.find_one_and_update(
                {"_id": doc["_id"]},
                {"$set": {"badge": badge}},
                return_document=True,
            )

        return serialize_doc(doc)
