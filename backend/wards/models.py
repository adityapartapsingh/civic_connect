"""
Ward and Department Data Access and Analytics.
"""

from __future__ import annotations

import datetime
from typing import Any, Dict, List, Optional
from civic_connect.mongo import get_collection, serialize_doc, serialize_docs


INITIAL_SAMPLE_WARDS: List[Dict[str, Any]] = [
    {
        "ward_number": "Ward-101",
        "name": "Model Town Urban Zone",
        "zone": "Central Jalandhar",
        "counselor_name": "Ramesh Kumar",
        "contact_phone": "+91-9876543210",
        "location": {"type": "Point", "coordinates": [75.5802, 31.3090]},
    },
    {
        "ward_number": "Ward-102",
        "name": "Civil Lines Administrative Ward",
        "zone": "North Jalandhar",
        "counselor_name": "Priya Sharma",
        "contact_phone": "+91-9876543211",
        "location": {"type": "Point", "coordinates": [75.5762, 31.3260]},
    },
    {
        "ward_number": "Ward-103",
        "name": "Cantt Road & Defense Colony",
        "zone": "East Jalandhar",
        "counselor_name": "Anand Rao",
        "contact_phone": "+91-9876543212",
        "location": {"type": "Point", "coordinates": [75.6178, 31.2847]},
    },
    {
        "ward_number": "Ward-104",
        "name": "Rama Mandi Commercial Hub",
        "zone": "East Jalandhar",
        "counselor_name": "Sunita Patil",
        "contact_phone": "+91-9876543213",
        "location": {"type": "Point", "coordinates": [75.6290, 31.3120]},
    },
    {
        "ward_number": "Ward-105",
        "name": "Phillaur Municipal Core",
        "zone": "Phillaur Sub-Division",
        "counselor_name": "Vijay Reddy",
        "contact_phone": "+91-9876543214",
        "location": {"type": "Point", "coordinates": [75.7820, 31.0200]},
    },
]


class WardManager:
    """Data layer and analytics for Wards."""

    @staticmethod
    def get_collection():
        return get_collection("wards")

    @classmethod
    def ensure_seed_wards(cls) -> None:
        """Seed default sample wards if collection is empty."""
        try:
            col = cls.get_collection()
            if col.count_documents({}) == 0:
                col.insert_many(INITIAL_SAMPLE_WARDS)
        except Exception:
            pass

    @classmethod
    def list_all(cls) -> List[Dict[str, Any]]:
        cls.ensure_seed_wards()
        try:
            docs = cls.get_collection().find().sort("ward_number", 1)
            return serialize_docs(list(docs))
        except Exception:
            return INITIAL_SAMPLE_WARDS

    @classmethod
    def calculate_leaderboard(cls) -> List[Dict[str, Any]]:
        """
        Calculate municipal leaderboard:
        - Total reports
        - Resolved reports
        - Resolution rate % (resolved / total * 100)
        - Average resolution time in hours
        """
        cls.ensure_seed_wards()
        wards = cls.list_all()
        reports_col = get_collection("reports")

        leaderboard: List[Dict[str, Any]] = []

        for ward in wards:
            ward_num = ward.get("ward_number", "Ward-101")
            ward_name = ward.get("name", "Unknown Ward")
            zone = ward.get("zone", "General")

            try:
                # Find all reports belonging to this ward
                reports = list(reports_col.find({"ward_id": ward_num}))
                total_reports = len(reports)
                resolved_reports = 0
                total_resolution_seconds = 0.0

                for r in reports:
                    status = r.get("status", "")
                    if status in ("RESOLVED", "CLOSED"):
                        resolved_reports += 1
                        created_at = r.get("created_at")
                        resolved_at = r.get("resolved_at") or r.get("updated_at")

                        if created_at and resolved_at:
                            t_start = (
                                datetime.datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                                if isinstance(created_at, str)
                                else created_at
                            )
                            t_end = (
                                datetime.datetime.fromisoformat(resolved_at.replace("Z", "+00:00"))
                                if isinstance(resolved_at, str)
                                else resolved_at
                            )
                            if t_start and t_end:
                                diff = max(0.0, (t_end - t_start).total_seconds())
                                total_resolution_seconds += diff

                # Compute metrics
                resolution_rate = (
                    round((resolved_reports / total_reports) * 100.0, 1)
                    if total_reports > 0
                    else 0.0
                )
                avg_resolution_hours = (
                    round((total_resolution_seconds / resolved_reports) / 3600.0, 1)
                    if resolved_reports > 0
                    else 0.0
                )

                # Score formula: 60% resolution rate + bonus for fast average turnaround
                speed_score = max(0.0, 40.0 - min(40.0, avg_resolution_hours * 0.5))
                ward_score = round(resolution_rate * 0.6 + speed_score, 1)

            except Exception:
                total_reports = 0
                resolved_reports = 0
                resolution_rate = 0.0
                avg_resolution_hours = 0.0
                ward_score = 0.0

            leaderboard.append({
                "ward_number": ward_num,
                "name": ward_name,
                "zone": zone,
                "total_reports": total_reports,
                "resolved_reports": resolved_reports,
                "pending_reports": total_reports - resolved_reports,
                "resolution_rate_percent": resolution_rate,
                "avg_resolution_hours": avg_resolution_hours,
                "performance_score": ward_score,
            })

        # Rank wards by performance score descending
        leaderboard.sort(key=lambda x: x["performance_score"], reverse=True)
        for idx, entry in enumerate(leaderboard, start=1):
            entry["rank"] = idx

        return leaderboard
