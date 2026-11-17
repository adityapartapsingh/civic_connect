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


class InAppNotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        get_collection("notifications").delete_many({})

        from civic_connect.authentication import generate_jwt
        self.citizen_payload = {
            "user_id": "cit_101",
            "phone": "9876543210",
            "role": "citizen",
            "name": "Aman Deep",
        }
        self.citizen_token = generate_jwt(self.citizen_payload)

    def test_notification_lifecycle_and_unread_count(self):
        from notifications.models import NotificationManager, NotificationType

        # 1. Create notifications for the citizen
        n1 = NotificationManager.create_notification(
            recipient_id="cit_101",
            recipient_role="citizen",
            recipient_phone="9876543210",
            title="Repair Completed",
            message="Field crew completed repair for pothole.",
            link="/tickets/TKT-001/confirm",
            notification_type=NotificationType.RESOLUTION_PENDING,
            ticket_id="TKT-001",
        )
        n2 = NotificationManager.create_notification(
            recipient_id="cit_101",
            recipient_role="citizen",
            recipient_phone="9876543210",
            title="Work Squad On-Site",
            message="Crew is on-site.",
            link="/tickets/TKT-001",
            notification_type=NotificationType.STATUS_CHANGED,
            ticket_id="TKT-001",
        )

        # 2. Check unread count endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.citizen_token}")
        count_res = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_res.status_code, status.HTTP_200_OK)
        self.assertEqual(count_res.data["unread_count"], 2)

        # 3. List notifications
        list_res = self.client.get("/api/notifications/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data["results"]), 2)
        self.assertEqual(list_res.data["unread_count"], 2)

        # 4. Mark single notification as read
        mark_res = self.client.post(f"/api/notifications/{n1['id']}/read/")
        self.assertEqual(mark_res.status_code, status.HTTP_200_OK)
        self.assertTrue(mark_res.data["success"])

        count_after = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(count_after.data["unread_count"], 1)

        # 5. Mark all as read
        mark_all = self.client.post("/api/notifications/mark-all-read/")
        self.assertEqual(mark_all.status_code, status.HTTP_200_OK)
        self.assertEqual(mark_all.data["marked_count"], 1)

        final_count = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(final_count.data["unread_count"], 0)
