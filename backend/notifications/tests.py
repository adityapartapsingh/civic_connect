"""
Unit and Integration Tests for Action Tokens and No-Login Updates.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from civic_connect.mongo import get_collection
from notifications.tokens import generate_action_token, verify_action_token
from reports.models import ReportManager, ReportStatus


class ActionTokenTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        get_collection("reports").delete_many({})
        get_collection("action_tokens").delete_many({})

    def test_token_generation_and_verification(self):
        token = generate_action_token(
            report_id="rep_999",
            officer_email="officer@city.gov",
            expiry_days=3,
        )
        self.assertTrue(isinstance(token, str))
        self.assertIn(".", token)

        is_valid, payload, error_msg = verify_action_token(token)
        self.assertTrue(is_valid)
        self.assertEqual(payload["report_id"], "rep_999")
        self.assertEqual(payload["officer_email"], "officer@city.gov")
        self.assertEqual(error_msg, "")

    def test_tampered_token_rejection(self):
        token = generate_action_token(report_id="rep_999")
        # Tamper signature
        tampered_token = token[:-5] + "abcde"
        is_valid, payload, error_msg = verify_action_token(tampered_token)
        self.assertFalse(is_valid)
        self.assertIn("Invalid token cryptographic signature", error_msg)

    def test_public_update_flow(self):
        # 1. Create a sample report
        report = ReportManager.create_report({
            "title": "Road Blocked by Fallen Tree",
            "description": "Tree fallen during heavy rain",
            "category": "fallen_tree",
            "latitude": 12.9716,
            "longitude": 77.5946,
        })
        rep_id = report["id"]

        # 2. Generate Action Token for field officer
        token = generate_action_token(
            report_id=rep_id,
            officer_email="horticulture.field@city.gov",
        )

        # 3. GET /api/public-update/<token>/ -> Fetch details without login
        get_res = self.client.get(f"/api/public-update/{token}/")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["report"]["ticket_id"], report["ticket_id"])

        # 4. POST /api/public-update/<token>/ -> Update status to RESOLVED
        post_res = self.client.post(f"/api/public-update/{token}/", {
            "status": ReportStatus.RESOLVED,
            "notes": "Tree cleared from roadway and sent to mulch yard.",
            "officer_name": "Officer Sharma",
        }, format="json")
        self.assertEqual(post_res.status_code, status.HTTP_200_OK)
        self.assertEqual(post_res.data["report"]["status"], ReportStatus.RESOLVED)
        self.assertEqual(post_res.data["report"]["resolution_notes"], "Tree cleared from roadway and sent to mulch yard.")
