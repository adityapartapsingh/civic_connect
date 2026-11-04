"""
User Models and Schema Constants for Civic Connect.

Supports roles: citizen, volunteer, officer, admin.
Volunteer schemes: NSS, NCC, NYKS.
"""

from __future__ import annotations

import datetime
import re
from typing import Any, Dict, List, Optional
from bson import ObjectId
from civic_connect.mongo import get_collection, parse_object_id, serialize_doc, serialize_docs


def normalize_phone(phone: Optional[str]) -> Optional[str]:
    """
    Standardize mobile phone numbers to a consistent 10-digit format for India / Civic Connect.
    Removes whitespace, dashes, country code +91 or 91 prefix, and leading 0.
    """
    if not phone:
        return None
    phone_str = str(phone).strip()
    digits = re.sub(r"\D", "", phone_str)
    # Strip country code 91 if followed by 10 digits
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    # Strip leading 0 if 11 digits
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]

    return digits if digits else phone_str


class UserRole:
    CITIZEN = "citizen"
    VOLUNTEER = "volunteer"
    OFFICER = "officer"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

    CHOICES = [CITIZEN, VOLUNTEER, OFFICER, ADMIN, SUPER_ADMIN]


class VolunteerScheme:
    NONE = "NONE"
    NSS = "NSS"    # National Service Scheme
    NCC = "NCC"    # National Cadet Corps
    NYKS = "NYKS"  # Nehru Yuva Kendra Sangathan

    COMMUNITY = "COMMUNITY"  # Community / Resident Volunteer

    CHOICES = [NONE, NSS, NCC, NYKS, COMMUNITY]


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
        norm_phone = normalize_phone(phone)
        raw_phone = str(phone).strip()
        query = {
            "$or": [
                {"phone": norm_phone},
                {"phone": raw_phone},
            ]
        } if norm_phone != raw_phone else {"phone": norm_phone}
        doc = cls.get_collection().find_one(query)
        return serialize_doc(doc)

    @classmethod
    def find_by_email(cls, email: str) -> Optional[Dict[str, Any]]:
        if not email:
            return None
        doc = cls.get_collection().find_one({"email": email.strip().lower()})
        return serialize_doc(doc)

    @classmethod
    def update_user(cls, user_id_or_oid: Any, update_fields: Dict[str, Any]) -> Dict[str, Any]:
        """Safely update an existing user profile without generating duplicate user records."""
        now = datetime.datetime.now(datetime.timezone.utc)
        oid = parse_object_id(str(user_id_or_oid)) if not isinstance(user_id_or_oid, ObjectId) else user_id_or_oid
        query = {"$or": [{"_id": oid}, {"user_id": str(user_id_or_oid)}]} if oid else {"user_id": str(user_id_or_oid)}

        fields = dict(update_fields)
        fields["updated_at"] = now
        if "phone" in fields and fields["phone"]:
            fields["phone"] = normalize_phone(fields["phone"])

        col = cls.get_collection()
        doc = col.find_one_and_update(query, {"$set": fields}, return_document=True)
        return serialize_doc(doc) or {}

    @classmethod
    def deduplicate_users_by_phone(cls) -> int:
        """Find and remove duplicate users with the same phone number, keeping the primary one."""
        col = cls.get_collection()
        removed_count = 0
        try:
            pipeline = [
                {"$match": {"phone": {"$exists": True, "$ne": None, "$nin": ["", "null"]}}},
                {"$group": {"_id": "$phone", "count": {"$sum": 1}, "docs": {"$push": "$$ROOT"}}},
                {"$match": {"count": {"$gt": 1}}},
            ]
            duplicates = list(col.aggregate(pipeline))
            for group in duplicates:
                docs = group.get("docs", [])
                role_rank = {
                    UserRole.SUPER_ADMIN: 5,
                    UserRole.ADMIN: 4,
                    UserRole.OFFICER: 3,
                    UserRole.VOLUNTEER: 2,
                    UserRole.CITIZEN: 1,
                }
                docs.sort(
                    key=lambda d: (
                        role_rank.get(d.get("role"), 0),
                        d.get("points", 0),
                        d.get("reports_resolved_count", 0),
                        d.get("updated_at") or d.get("created_at") or datetime.datetime.min,
                    ),
                    reverse=True,
                )
                duplicates_to_remove = docs[1:]
                for dup in duplicates_to_remove:
                    col.delete_one({"_id": dup["_id"]})
                    removed_count += 1
        except Exception:
            pass
        return removed_count

    @classmethod
    def ensure_indexes(cls) -> None:
        """Ensure unique indexes on phone and employee_id to strictly prohibit duplicate users."""
        try:
            col = cls.get_collection()
            cls.deduplicate_users_by_phone()
            # Clean up null employee_id and email fields from citizen docs to prevent null collision
            try:
                col.update_many({"employee_id": None}, {"$unset": {"employee_id": ""}})
                col.update_many({"email": None}, {"$unset": {"email": ""}})
            except Exception:
                pass
            col.create_index([("phone", 1)], unique=True, sparse=True, name="phone_unique")
            try:
                col.create_index(
                    [("employee_id", 1)],
                    unique=True,
                    partialFilterExpression={"employee_id": {"$type": "string"}},
                    name="employee_id_unique",
                )
            except Exception:
                col.create_index([("employee_id", 1)], unique=True, sparse=True, name="employee_id_unique")
            col.create_index([("user_id", 1)], unique=True, sparse=True, name="user_id_unique")
        except Exception:
            pass

    @classmethod
    def upsert_user(cls, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update user profile while enforcing strict phone number uniqueness."""
        cls.ensure_indexes()
        now = datetime.datetime.now(datetime.timezone.utc)
        phone = normalize_phone(user_data.get("phone"))
        raw_phone = str(user_data.get("phone")).strip() if user_data.get("phone") else None
        email = user_data.get("email", "").strip().lower() if user_data.get("email") else None
        user_id = user_data.get("user_id")
        employee_id = user_data.get("employee_id")

        col = cls.get_collection()

        # Step 1: Detect existing user by unique phone number first
        existing_doc = None
        if phone:
            phone_queries = [{"phone": phone}]
            if raw_phone and raw_phone != phone:
                phone_queries.append({"phone": raw_phone})
            existing_doc = col.find_one({"$or": phone_queries} if len(phone_queries) > 1 else phone_queries[0])

        # Step 2: Fall back to employee_id
        if not existing_doc and employee_id:
            existing_doc = col.find_one({"employee_id": employee_id})

        # Step 3: Fall back to user_id / _id
        if not existing_doc and user_id:
            oid = parse_object_id(user_id)
            query = {"$or": [{"_id": oid}, {"user_id": user_id}]} if oid else {"user_id": user_id}
            existing_doc = col.find_one(query)

        update_fields: Dict[str, Any] = {
            "name": user_data.get("name", "Civic User"),
            "role": user_data.get("role", UserRole.CITIZEN),
            "volunteer_scheme": user_data.get("volunteer_scheme", VolunteerScheme.NONE),
            "ward_id": user_data.get("ward_id"),
            "ward_name": user_data.get("ward_name"),
            "ward": user_data.get("ward") or user_data.get("ward_name"),
            "district": user_data.get("district"),
            "state": user_data.get("state"),
            "department_id": user_data.get("department_id"),
            "department": user_data.get("department"),
            "designation": user_data.get("designation"),
            "employee_id": user_data.get("employee_id"),
            "jurisdiction_zone": user_data.get("jurisdiction_zone"),
            "assigned_tasks": user_data.get("assigned_tasks", []),
            "created_by": user_data.get("created_by"),
            "credential_code": user_data.get("credential_code"),
            "updated_at": now,
        }
        if phone:
            update_fields["phone"] = phone
        if email:
            update_fields["email"] = email
        if "is_active" in user_data:
            update_fields["is_active"] = user_data["is_active"]
        if "reports_resolved_count" in user_data:
            update_fields["reports_resolved_count"] = user_data["reports_resolved_count"]

        # If user already exists with this phone or ID, safely update provided fields without wiping existing data
        if existing_doc:
            clean_updates: Dict[str, Any] = {"updated_at": now}
            for k, v in user_data.items():
                if k in ("_id", "id", "created_at"):
                    continue
                if v is not None and v != "":
                    # Do not overwrite custom name with generic "Civic User"
                    if k == "name" and v == "Civic User" and existing_doc.get("name") and existing_doc.get("name") != "Civic User":
                        continue
                    clean_updates[k] = v

            if phone:
                clean_updates["phone"] = phone
            if email:
                clean_updates["email"] = email
            # Ensure credential_code is never erased if already set
            if "credential_code" in user_data and user_data.get("credential_code"):
                clean_updates["credential_code"] = user_data["credential_code"]
            elif "credential_code" in clean_updates and not clean_updates["credential_code"]:
                clean_updates.pop("credential_code", None)

            res = col.find_one_and_update(
                {"_id": existing_doc["_id"]},
                {"$set": clean_updates},
                return_document=True,
            )
            return serialize_doc(res) or {}

        # Brand new user insert
        import uuid
        user_id_final = user_id or f"usr_{uuid.uuid4().hex[:8]}"
        raw_doc_to_insert = {
            **update_fields,
            "user_id": user_id_final,
            "points": user_data.get("points", 0),
            "coins": user_data.get("coins", user_data.get("points", 50)),
            "badge": user_data.get("badge", BadgeTier.BRONZE),
            "created_at": now,
            "is_active": True,
        }
        # Strip all None and empty string keys to avoid sparse index null collisions in MongoDB
        doc_to_insert = {k: v for k, v in raw_doc_to_insert.items() if v is not None and v != ""}

        try:
            col.insert_one(doc_to_insert)
            return serialize_doc(doc_to_insert)
        except Exception as exc:
            import logging
            logging.getLogger(__name__).warning(f"upsert_user insert error: {exc}. Attempting recovery...")
            # Fallback if concurrent insert raced on unique index
            fallback = None
            if phone:
                fallback = col.find_one({"phone": phone})
            if not fallback and employee_id:
                fallback = col.find_one({"employee_id": employee_id})
            if fallback:
                res = col.find_one_and_update(
                    {"_id": fallback["_id"]},
                    {"$set": doc_to_insert},
                    return_document=True,
                )
                return serialize_doc(res) or {}
            # If fallback still didn't find the user, re-raise exception so caller handles it
            raise

    @classmethod
    def add_points_and_coins(cls, user_id: str, points: int, coins: int, reason: str = "") -> Optional[Dict[str, Any]]:
        """
        Add reputation points and spendable coins atomically.
        Points increase citizen reputation, level progress, and leaderboard standing.
        Coins increase the citizen's spendable wallet for municipal rewards.
        """
        oid = parse_object_id(user_id)
        query = {"$or": [{"_id": oid}, {"user_id": user_id}]} if oid else {"user_id": user_id}

        col = cls.get_collection()
        doc = col.find_one_and_update(
            query,
            {"$inc": {"points": points, "coins": coins}},
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

    @classmethod
    def add_points(cls, user_id: str, points: int) -> Optional[Dict[str, Any]]:
        """Add points and calculate tier update (also awards matching spendable coins)."""
        return cls.add_points_and_coins(user_id, points, points)

    @classmethod
    def deduct_coins(cls, user_id: str, coins: int) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Deduct spendable coins when a user redeems a reward or merchandise.
        CRITICAL CIVIC RULE: Points (reputation / level) are NEVER reduced when buying rewards!
        Only coins are deducted.
        """
        oid = parse_object_id(user_id)
        query = {"$or": [{"_id": oid}, {"user_id": user_id}]} if oid else {"user_id": user_id}

        col = cls.get_collection()
        doc = col.find_one(query)
        if not doc:
            return False, "User account not found.", None

        current_coins = doc.get("coins", doc.get("points", 0))
        if current_coins < coins:
            return False, f"Insufficient Civic Coins. You have {current_coins} coins, but this reward requires {coins} coins.", serialize_doc(doc)

        updated = col.find_one_and_update(
            query,
            {"$inc": {"coins": -coins}},
            return_document=True,
        )
        return True, f"Successfully redeemed reward. {coins} Civic Coins deducted. Your Civic Reputation Points remain 100% intact!", serialize_doc(updated)

    @classmethod
    def apply_fraud_penalty(cls, user_id: str, points_penalty: int = 50, coins_penalty: int = 50) -> Optional[Dict[str, Any]]:
        """
        Penalty for fraudulent / fake reports.
        CRITICAL CIVIC RULE: Points decrease ONLY if a report is proven fake. Coins are also deducted.
        """
        oid = parse_object_id(user_id)
        query = {"$or": [{"_id": oid}, {"user_id": user_id}]} if oid else {"user_id": user_id}

        col = cls.get_collection()
        doc = col.find_one(query)
        if not doc:
            return None

        # Calculate capped penalties so points/coins don't drop below 0
        cur_pts = doc.get("points", 0)
        cur_coins = doc.get("coins", cur_pts)
        pts_dec = min(cur_pts, points_penalty)
        coins_dec = min(cur_coins, coins_penalty)

        updated = col.find_one_and_update(
            query,
            {"$inc": {"points": -pts_dec, "coins": -coins_dec}},
            return_document=True,
        )
        return serialize_doc(updated)

    @classmethod
    def ensure_seed_admins(cls) -> None:
        """Seed the 3-tier hierarchy: Super Admin, 1 Admin per Ward, and Officers."""
        try:
            cls.ensure_indexes()
            col = cls.get_collection()
            # 1. Super Admin
            sa = col.find_one({"$or": [{"role": UserRole.SUPER_ADMIN}, {"employee_id": "CC-SUPERADMIN-001"}]})
            if not sa:
                cls.upsert_user({
                    "user_id": "cc_superadmin_01",
                    "name": "Civic Connect Team Super Admin",
                    "phone": "9999900001",
                    "email": "superadmin@civicconnect.gov.in",
                    "role": UserRole.SUPER_ADMIN,
                    "employee_id": "CC-SUPERADMIN-001",
                    "credential_code": "CC-ROOT-2026",
                    "department": "Civic Connect Platform Engineering",
                    "designation": "Principal Platform Administrator",
                    "jurisdiction_zone": "Punjab State Directorate / All Wards",
                })
            else:
                col.update_one(
                    {"_id": sa["_id"]},
                    {"$set": {
                        "credential_code": "CC-ROOT-2026",
                        "employee_id": "CC-SUPERADMIN-001",
                        "role": UserRole.SUPER_ADMIN,
                        "is_active": True,
                    }}
                )

            # 2. Municipal Corporation Ward Admins (1 per Ward)
            initial_admins = [
                {
                    "user_id": "admin_ward_101",
                    "name": "Sh. Ramesh Kumar",
                    "phone": "9876543210",
                    "email": "ward101.admin@mcjalandhar.in",
                    "role": UserRole.ADMIN,
                    "ward_id": "Ward-101",
                    "ward_name": "Ward 1 - Model Town Urban Zone",
                    "employee_id": "PB-MCJ-ADM-W101",
                    "credential_code": "MCJ-W101-SEC4",
                    "department": "Municipal Corporation Jalandhar",
                    "designation": "Ward 1 Municipal Administrator",
                    "jurisdiction_zone": "Central Zone (Ward 1)",
                    "created_by": "cc_superadmin_01",
                },
                {
                    "user_id": "admin_ward_102",
                    "name": "Smt. Sunita Talwar",
                    "phone": "9876543211",
                    "email": "ward102.admin@mcjalandhar.in",
                    "role": UserRole.ADMIN,
                    "ward_id": "Ward-102",
                    "ward_name": "Ward 2 - Civil Lines Administrative Ward",
                    "employee_id": "PB-MCJ-ADM-W102",
                    "credential_code": "MCJ-W102-SEC9",
                    "department": "Municipal Corporation Jalandhar",
                    "designation": "Ward 2 Municipal Councillor & Admin",
                    "jurisdiction_zone": "North Zone (Ward 2)",
                    "created_by": "cc_superadmin_01",
                },
                {
                    "user_id": "admin_ward_103",
                    "name": "Sh. Anand Rao",
                    "phone": "9876543212",
                    "email": "ward103.admin@mcjalandhar.in",
                    "role": UserRole.ADMIN,
                    "ward_id": "Ward-103",
                    "ward_name": "Ward 3 - Cantt Road & Defense Colony",
                    "employee_id": "PB-MCJ-ADM-W103",
                    "credential_code": "MCJ-W103-SEC7",
                    "department": "Municipal Corporation Jalandhar",
                    "designation": "Ward 3 Municipal Administrator",
                    "jurisdiction_zone": "East Zone (Ward 3)",
                    "created_by": "cc_superadmin_01",
                },
                {
                    "user_id": "admin_ward_104",
                    "name": "Smt. Sunita Patil",
                    "phone": "9876543213",
                    "email": "ward104.admin@mcjalandhar.in",
                    "role": UserRole.ADMIN,
                    "ward_id": "Ward-104",
                    "ward_name": "Ward 4 - Rama Mandi Commercial Hub",
                    "employee_id": "PB-MCJ-ADM-W104",
                    "credential_code": "MCJ-W104-SEC2",
                    "department": "Municipal Corporation Jalandhar",
                    "designation": "Ward 4 Municipal Administrator",
                    "jurisdiction_zone": "East Zone (Ward 4)",
                    "created_by": "cc_superadmin_01",
                },
                {
                    "user_id": "admin_ward_105",
                    "name": "Sh. Vijay Reddy",
                    "phone": "9876543214",
                    "email": "ward105.admin@mcjalandhar.in",
                    "role": UserRole.ADMIN,
                    "ward_id": "Ward-105",
                    "ward_name": "Ward 5 - Phillaur Municipal Core",
                    "employee_id": "PB-MCJ-ADM-W105",
                    "credential_code": "MCJ-W105-SEC5",
                    "department": "Municipal Corporation Jalandhar",
                    "designation": "Ward 5 Municipal Administrator",
                    "jurisdiction_zone": "Phillaur Sub-Division (Ward 5)",
                    "created_by": "cc_superadmin_01",
                },
            ]

            for admin in initial_admins:
                if not col.find_one({"employee_id": admin["employee_id"]}):
                    cls.upsert_user(admin)

            # 3. Initial Field Officers in Ward-102 (Civil Lines)
            initial_officers = [
                {
                    "user_id": "off_w102_road",
                    "name": "Er. Harpreet Singh",
                    "phone": "9814099881",
                    "email": "h.singh@mcj.punjab.gov.in",
                    "role": UserRole.OFFICER,
                    "ward_id": "Ward-102",
                    "ward_name": "Ward 2 - Civil Lines Administrative Ward",
                    "department": "Municipal Roads & Infrastructure Division",
                    "designation": "Junior Engineer (JE)",
                    "employee_id": "PB-MCJ-W102-ENG-084",
                    "credential_code": "OFF-W102-7492",
                    "jurisdiction_zone": "Central Zone (Ward 2)",
                    "assigned_tasks": ["pothole", "road_damage", "sidewalk"],
                    "created_by": "admin_ward_102",
                    "reports_resolved_count": 142,
                    "points": 4260,
                },
                {
                    "user_id": "off_w102_san",
                    "name": "Gurpreet Sandhu",
                    "phone": "9814099882",
                    "email": "g.sandhu@mcj.punjab.gov.in",
                    "role": UserRole.OFFICER,
                    "ward_id": "Ward-102",
                    "ward_name": "Ward 2 - Civil Lines Administrative Ward",
                    "department": "Solid Waste & Sanitation Department",
                    "designation": "Sanitary Inspector (SI)",
                    "employee_id": "PB-MCJ-W102-SAN-019",
                    "credential_code": "OFF-W102-3810",
                    "jurisdiction_zone": "Central Zone (Ward 2)",
                    "assigned_tasks": ["garbage"],
                    "created_by": "admin_ward_102",
                    "reports_resolved_count": 118,
                    "points": 3540,
                },
                {
                    "user_id": "off_w102_elec",
                    "name": "Balwinder Kumar",
                    "phone": "9814099883",
                    "email": "b.kumar@mcj.punjab.gov.in",
                    "role": UserRole.OFFICER,
                    "ward_id": "Ward-102",
                    "ward_name": "Ward 2 - Civil Lines Administrative Ward",
                    "department": "Electrical & Street Lighting Cell",
                    "designation": "Lineman / Field Inspector",
                    "employee_id": "PB-MCJ-W102-ELE-052",
                    "credential_code": "OFF-W102-9124",
                    "jurisdiction_zone": "Central Zone (Ward 2)",
                    "assigned_tasks": ["streetlight", "traffic_signal"],
                    "created_by": "admin_ward_102",
                    "reports_resolved_count": 84,
                    "points": 2520,
                },
                {
                    "user_id": "off_w102_water",
                    "name": "Er. Rajesh K. Sharma",
                    "phone": "9814099884",
                    "email": "r.sharma@mcj.punjab.gov.in",
                    "role": UserRole.OFFICER,
                    "ward_id": "Ward-102",
                    "ward_name": "Ward 2 - Civil Lines Administrative Ward",
                    "department": "Water Supply & Sewerage Unit",
                    "designation": "Assistant Engineer (AE)",
                    "employee_id": "PB-MCJ-W102-WAT-033",
                    "credential_code": "OFF-W102-6045",
                    "jurisdiction_zone": "Central Zone (Ward 2)",
                    "assigned_tasks": ["water_leakage", "drainage"],
                    "created_by": "admin_ward_102",
                    "reports_resolved_count": 96,
                    "points": 2880,
                },
            ]

            for officer in initial_officers:
                if not col.find_one({"employee_id": officer["employee_id"]}):
                    cls.upsert_user(officer)

        except Exception:
            pass

    @classmethod
    def find_by_credential(cls, identifier: str, passcode: str) -> Optional[Dict[str, Any]]:
        """Find user by employee_id, phone, or email AND matching credential_code."""
        cls.ensure_seed_admins()
        ident = identifier.strip()
        code = passcode.strip()
        norm_phone = normalize_phone(ident)

        col = cls.get_collection()
        id_clauses = [
            {"employee_id": ident},
            {"employee_id": ident.upper()},
            {"phone": ident},
            {"email": ident.lower()},
            {"user_id": ident},
        ]
        if norm_phone and norm_phone != ident:
            id_clauses.append({"phone": norm_phone})

        query = {
            "$and": [
                {"$or": id_clauses},
                {
                    "$or": [
                        {"credential_code": code},
                        {"credential_code": code.upper()},
                    ]
                },
            ]
        }
        doc = col.find_one(query)
        return serialize_doc(doc)

    @classmethod
    def list_admins(cls) -> List[Dict[str, Any]]:
        """List all Municipal Corporation Ward Admins."""
        cls.ensure_seed_admins()
        docs = cls.get_collection().find({"role": UserRole.ADMIN, "is_active": {"$ne": False}}).sort("ward_id", 1)
        admins = serialize_docs(list(docs))

        # Augment with count of officers deployed in each ward
        for admin in admins:
            w_id = admin.get("ward_id")
            if w_id:
                count = cls.get_collection().count_documents({"role": UserRole.OFFICER, "ward_id": w_id})
                admin["officers_count"] = count
            else:
                admin["officers_count"] = 0
        return admins

    @classmethod
    def list_officers(cls, ward_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List Field Officers, optionally filtered by assigned Ward."""
        cls.ensure_seed_admins()
        query: Dict[str, Any] = {"role": UserRole.OFFICER, "is_active": {"$ne": False}}
        if ward_id:
            query["ward_id"] = ward_id

        docs = cls.get_collection().find(query).sort("created_at", -1)
        return serialize_docs(list(docs))

    @classmethod
    def create_admin_by_super_admin(cls, super_admin_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Super Admin generates credentials for a Municipal Corporation Ward Admin."""
        import uuid
        cls.ensure_seed_admins()
        phone = normalize_phone(payload.get("phone"))
        if not phone or len(phone) < 10:
            raise ValueError("A valid 10-digit phone number is required for the Ward Administrator.")

        # Enforce unique phone number across the system
        existing_phone = cls.find_by_phone(phone)
        if existing_phone:
            raise ValueError(
                f"A user or official with phone number '{phone}' already exists ({existing_phone.get('name')}, Role: {existing_phone.get('role')}). Official phone numbers must be unique."
            )

        ward_id = payload.get("ward_id")
        ward_num = ward_id.replace("Ward-", "W") if ward_id else "W00"
        rand_code = uuid.uuid4().hex[:4].upper()

        employee_id = payload.get("employee_id") or f"PB-MCJ-ADM-{ward_num}"
        credential_code = payload.get("credential_code") or f"MCJ-{ward_num}-SEC{rand_code[:3]}"

        user_data = {
            "user_id": f"adm_{uuid.uuid4().hex[:8]}",
            "name": payload.get("name"),
            "phone": phone,
            "email": payload.get("email"),
            "role": UserRole.ADMIN,
            "ward_id": ward_id,
            "ward_name": payload.get("ward_name"),
            "department": payload.get("department", "Municipal Corporation Jalandhar"),
            "designation": payload.get("designation", "Ward Municipal Administrator"),
            "jurisdiction_zone": payload.get("jurisdiction_zone", f"Municipal Division {ward_id}"),
            "employee_id": employee_id,
            "credential_code": credential_code,
            "created_by": super_admin_id,
            "is_active": True,
        }
        return cls.upsert_user(user_data)

    @classmethod
    def create_officer_by_ward_admin(cls, ward_admin_id: str, ward_admin_ward_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Ward Admin generates credentials for an On-Site Field Officer for their specific task."""
        import uuid
        cls.ensure_seed_admins()
        phone = normalize_phone(payload.get("phone"))
        if not phone or len(phone) < 10:
            raise ValueError("A valid 10-digit phone number is required for the Field Officer.")

        # Enforce unique phone number across the system
        existing_phone = cls.find_by_phone(phone)
        if existing_phone:
            raise ValueError(
                f"A user or official with phone number '{phone}' already exists ({existing_phone.get('name')}, Role: {existing_phone.get('role')}). Official phone numbers must be unique."
            )

        ward_num = ward_admin_ward_id.replace("Ward-", "W") if ward_admin_ward_id else "W00"
        rand_code = uuid.uuid4().hex[:4].upper()

        task_prefix = "ENG"
        assigned_tasks = payload.get("assigned_tasks", [])
        if "garbage" in assigned_tasks:
            task_prefix = "SAN"
        elif "streetlight" in assigned_tasks:
            task_prefix = "ELE"
        elif "water_leakage" in assigned_tasks or "drainage" in assigned_tasks:
            task_prefix = "WAT"

        employee_id = payload.get("employee_id") or f"PB-MCJ-{ward_num}-{task_prefix}-{rand_code[:3]}"
        credential_code = payload.get("credential_code") or f"OFF-{ward_num}-{rand_code}"

        user_data = {
            "user_id": f"off_{uuid.uuid4().hex[:8]}",
            "name": payload.get("name"),
            "phone": phone,
            "email": payload.get("email"),
            "role": UserRole.OFFICER,
            "ward_id": ward_admin_ward_id,
            "ward_name": payload.get("ward_name"),
            "department": payload.get("department", "Municipal Field Operations"),
            "designation": payload.get("designation", "Junior Engineer (JE)"),
            "jurisdiction_zone": payload.get("jurisdiction_zone", f"Ward {ward_admin_ward_id}"),
            "assigned_tasks": assigned_tasks,
            "employee_id": employee_id,
            "credential_code": credential_code,
            "created_by": ward_admin_id,
            "is_active": True,
        }
        return cls.upsert_user(user_data)

    @classmethod
    def revoke_user_credential(cls, user_id: str) -> bool:
        """Revoke user credentials / deactivate user."""
        oid = parse_object_id(user_id)
        query = {"$or": [{"_id": oid}, {"user_id": user_id}, {"employee_id": user_id}]} if oid else {"$or": [{"user_id": user_id}, {"employee_id": user_id}]}
        res = cls.get_collection().update_one(query, {"$set": {"is_active": False, "revoked_at": datetime.datetime.now(datetime.timezone.utc)}})
        return res.modified_count > 0
