"""
Point Transaction Ledger and Gamification Manager.
"""

from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional
from bson import ObjectId
from civic_connect.mongo import get_collection, serialize_docs
from gamification.badges import evaluate_user_badges
from users.models import UserManager, VolunteerScheme


class ActionPoints:
    REPORT_SUBMITTED = 10
    REPORT_CONFIRMED = 20
    EVIDENCE_ADDED = 5
    UPVOTE_GIVEN = 2
    DISPUTE_FILED = 0
    BONUS_OFFICER_FIX = 15


class GamificationManager:
    """Manages the point ledger and gamification transactions."""

    @staticmethod
    def get_ledger_collection():
        return get_collection("gamification_ledger")

    @classmethod
    def record_points(
        cls,
        user_id: str,
        action: str,
        base_points: int,
        report_id: Optional[str] = None,
        notes: str = "",
    ) -> Dict[str, Any]:
        """
        Record a points transaction in the ledger and update user profile.
        Applies 1.25x scheme bonus for active youth volunteers (NSS/NCC/NYKS).
        """
        if not user_id:
            return {"points_awarded": 0, "total_points": 0}

        user = UserManager.find_by_id(user_id) or {}
        scheme = user.get("volunteer_scheme", VolunteerScheme.NONE)

        # Apply youth volunteer incentive multiplier
        multiplier = 1.25 if scheme in (VolunteerScheme.NSS, VolunteerScheme.NCC, VolunteerScheme.NYKS) else 1.0
        points_awarded = int(round(base_points * multiplier))

        now = datetime.datetime.now(datetime.timezone.utc)
        transaction = {
            "user_id": user_id,
            "action": action,
            "base_points": base_points,
            "multiplier": multiplier,
            "points_awarded": points_awarded,
            "report_id": report_id,
            "notes": notes,
            "created_at": now,
        }

        # 1. Insert into immutable ledger
        cls.get_ledger_collection().insert_one(transaction)

        # 2. Update user profile total points and tier
        updated_user = UserManager.add_points(user_id, points_awarded) or {}
        total_points = updated_user.get("points", points_awarded)
        badge = updated_user.get("badge", "Bronze")

        unlocked_badges = evaluate_user_badges(
            points=total_points,
            volunteer_scheme=scheme,
        )

        return {
            "user_id": user_id,
            "action": action,
            "points_awarded": points_awarded,
            "total_points": total_points,
            "badge": badge,
            "unlocked_badges": unlocked_badges,
            "created_at": now.isoformat(),
        }

    @classmethod
    def get_user_summary(cls, user_id: str) -> Dict[str, Any]:
        """Retrieve user points balance, badges, and ledger history."""
        user = UserManager.find_by_id(user_id) or {}
        points = user.get("points", 0)
        scheme = user.get("volunteer_scheme", "NONE")
        badge = user.get("badge", "Bronze")

        history_cursor = cls.get_ledger_collection().find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(25)

        unlocked_badges = evaluate_user_badges(points=points, volunteer_scheme=scheme)

        return {
            "user_id": user_id,
            "name": user.get("name", "Civic User"),
            "role": user.get("role", "citizen"),
            "volunteer_scheme": scheme,
            "points": points,
            "badge": badge,
            "unlocked_badges": unlocked_badges,
            "transactions": serialize_docs(list(history_cursor)),
        }

    @classmethod
    def get_leaderboard(cls, filter_role: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve ranked community leaderboard."""
        users_col = get_collection("users")
        query: Dict[str, Any] = {"is_active": True}
        if filter_role and filter_role != "all":
            query["role"] = filter_role

        cursor = users_col.find(
            query,
            {"name": 1, "role": 1, "volunteer_scheme": 1, "points": 1, "badge": 1, "ward_id": 1},
        ).sort("points", -1).limit(limit)

        results = serialize_docs(list(cursor))
        for idx, item in enumerate(results, start=1):
            item["rank"] = idx

        return results
