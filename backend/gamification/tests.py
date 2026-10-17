"""
Unit and Integration Tests for Gamification, Badges, and Points Ledger.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from civic_connect.mongo import get_collection
from gamification.badges import evaluate_user_badges
from gamification.models import ActionPoints, GamificationManager
from users.models import UserManager, VolunteerScheme


class GamificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        get_collection("users").delete_many({})
        get_collection("gamification_ledger").delete_many({})

    def test_points_awarding_and_badge_upgrade(self):
        # 1. Create user
        user = UserManager.upsert_user({
            "name": "Aarav Patel",
            "phone": "+91-9988776655",
            "role": "citizen",
        })
        user_id = user["id"]

        # Award 50 points
        result = GamificationManager.record_points(
            user_id=user_id,
            action="REPORT_SUBMITTED",
            base_points=50,
        )
        self.assertEqual(result["total_points"], 50)
        self.assertEqual(result["badge"], "Silver")

    def test_volunteer_scheme_multiplier(self):
        # Create NSS volunteer
        user = UserManager.upsert_user({
            "name": "NSS Volunteer Priya",
            "phone": "+91-9988776656",
            "role": "volunteer",
            "volunteer_scheme": VolunteerScheme.NSS,
        })
        user_id = user["id"]

        # Award base 20 points -> with 1.25x multiplier, should award 25 points!
        result = GamificationManager.record_points(
            user_id=user_id,
            action="REPORT_CONFIRMED",
            base_points=20,
        )
        self.assertEqual(result["points_awarded"], 25)

    def test_user_gamification_summary_api(self):
        user = UserManager.upsert_user({
            "name": "Civic Hero",
            "phone": "+91-9988776657",
        })
        user_id = user["id"]
        GamificationManager.record_points(user_id=user_id, action="BONUS", base_points=15)

        res = self.client.get(f"/api/gamification/user/{user_id}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["points"], 15)
        self.assertEqual(len(res.data["transactions"]), 1)

    def test_gamification_leaderboard_api(self):
        # Create multiple users with varying points
        u1 = UserManager.upsert_user({"name": "Top User", "phone": "+91-9000000001"})
        u2 = UserManager.upsert_user({"name": "Runner Up", "phone": "+91-9000000002"})

        GamificationManager.record_points(user_id=u1["id"], action="BONUS", base_points=100)
        GamificationManager.record_points(user_id=u2["id"], action="BONUS", base_points=60)

        res = self.client.get("/api/gamification/leaderboard/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 2)
        self.assertEqual(res.data[0]["name"], "Top User")
        self.assertEqual(res.data[0]["rank"], 1)
