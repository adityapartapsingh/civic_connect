"""
Badges and Recognition System for Civic Connect.

Badges:
- Tier Badges: Bronze (10 pts), Silver (50 pts), Gold (150 pts), Platinum (500 pts)
- Special Volunteer Badges: NSS Champion, NCC Sentinel, NYKS Youth Leader
- Milestone Badges: Quick Reporter, Master Corroborator, Neighborhood Guardian
"""

from __future__ import annotations

from typing import Any, Dict, List


BADGE_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "id": "tier_bronze",
        "name": "Bronze Citizen",
        "tier": "Bronze",
        "description": "Earned by taking the first steps in reporting civic issues (10+ pts).",
        "icon": "shield-bronze",
        "min_points": 10,
    },
    {
        "id": "tier_silver",
        "name": "Silver Guardian",
        "tier": "Silver",
        "description": "Active contributor resolving and reporting neighbourhood problems (50+ pts).",
        "icon": "shield-silver",
        "min_points": 50,
    },
    {
        "id": "tier_gold",
        "name": "Gold Champion",
        "tier": "Gold",
        "description": "Exemplary civic leader creating noticeable positive impact in their city (150+ pts).",
        "icon": "shield-gold",
        "min_points": 150,
    },
    {
        "id": "tier_platinum",
        "name": "Platinum Civic Legend",
        "tier": "Platinum",
        "description": "Distinguished civic stalwart dedicated to city welfare (500+ pts).",
        "icon": "shield-platinum",
        "min_points": 500,
    },
    {
        "id": "volunteer_nss",
        "name": "NSS Civic Warrior",
        "tier": "Special",
        "description": "Recognized National Service Scheme student contributor.",
        "icon": "nss-star",
        "min_points": 20,
    },
    {
        "id": "volunteer_ncc",
        "name": "NCC Civic Sentinel",
        "tier": "Special",
        "description": "Recognized National Cadet Corps discipline & civic leader.",
        "icon": "ncc-shield",
        "min_points": 20,
    },
    {
        "id": "volunteer_nyks",
        "name": "NYKS Youth Ambassador",
        "tier": "Special",
        "description": "Nehru Yuva Kendra Sangathan active grassroots champion.",
        "icon": "nyks-torch",
        "min_points": 20,
    },
]


def evaluate_user_badges(
    points: int,
    volunteer_scheme: str = "NONE",
    confirmed_reports: int = 0,
) -> List[Dict[str, Any]]:
    """
    Evaluate and return the list of badges a user has unlocked based on
    points, volunteer affiliation, and verified contributions.
    """
    unlocked: List[Dict[str, Any]] = []

    # 1. Tier Badges
    for badge in BADGE_DEFINITIONS:
        if badge["tier"] in ("Bronze", "Silver", "Gold", "Platinum"):
            if points >= badge["min_points"]:
                unlocked.append(badge)

    # 2. Scheme-specific Badges
    scheme_clean = (volunteer_scheme or "NONE").upper()
    if scheme_clean == "NSS" and points >= 20:
        unlocked.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "volunteer_nss"))
    elif scheme_clean == "NCC" and points >= 20:
        unlocked.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "volunteer_ncc"))
    elif scheme_clean == "NYKS" and points >= 20:
        unlocked.append(next(b for b in BADGE_DEFINITIONS if b["id"] == "volunteer_nyks"))

    return unlocked
