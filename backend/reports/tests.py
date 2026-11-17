"""
Integration and Unit Tests for Reports API and Lifecycle Operations.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from civic_connect.mongo import get_collection
from civic_connect.authentication import generate_jwt
from reports.models import PriorityLevel, ReportManager, ReportStatus


class ReportAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Clean collections before each test
        get_collection("reports").delete_many({})
        get_collection("upvotes").delete_many({})
        get_collection("gamification_ledger").delete_many({})

        # Citizen credentials
        self.citizen_payload = {
            "user_id": "user_123",
            "phone": "9876543210",
            "name": "John Doe",
            "role": "citizen",
        }
        self.citizen_token = generate_jwt(self.citizen_payload)

        # Officer credentials
        self.officer_payload = {
            "user_id": "officer_456",
            "phone": "9876543211",
            "name": "Inspector Ramesh",
            "role": "officer",
        }
        self.officer_token = generate_jwt(self.officer_payload)

        # Authenticate client as citizen by default for test cases
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.citizen_token}")

    def test_create_report_and_verify_ticket_id(self):
        payload = {
            "title": "Pothole on Main St",
            "description": "Deep pothole causing vehicle damage near hospital junction",
            "category": "pothole",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "address": "12 Main St, Bangalore",
            "reporter_id": "user_123",
            "reporter_name": "John Doe",
        }
        response = self.client.post("/api/reports/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.data

        # Verify auto-generated human readable ticket ID (CC-2026-XXXXX)
        self.assertTrue(data["ticket_id"].startswith("CC-"))
        self.assertEqual(data["status"], ReportStatus.SUBMITTED)
        self.assertEqual(data["category"], "pothole")
        self.assertGreater(data["priority_score"], 0)
        self.assertIn(data["priority_level"], PriorityLevel.CHOICES)

        # Verify status history has initial entry
        self.assertEqual(len(data["status_history"]), 1)
        self.assertEqual(data["status_history"][0]["status"], ReportStatus.SUBMITTED)

    def test_get_report_by_id_and_ticket_id(self):
        create_payload = {
            "title": "Garbage Heap Overflow",
            "description": "Uncollected garbage piling up",
            "category": "garbage",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "reporter_id": "user_456",
        }
        res = self.client.post("/api/reports/", create_payload, format="json")
        report_id = res.data["id"]
        ticket_id = res.data["ticket_id"]

        # 1. Fetch by MongoDB ID
        res_by_id = self.client.get(f"/api/reports/{report_id}/")
        self.assertEqual(res_by_id.status_code, status.HTTP_200_OK)
        self.assertEqual(res_by_id.data["ticket_id"], ticket_id)

        # 2. Fetch by Ticket ID
        res_by_ticket = self.client.get(f"/api/reports/ticket/{ticket_id}/")
        self.assertEqual(res_by_ticket.status_code, status.HTTP_200_OK)
        self.assertEqual(res_by_ticket.data["id"], report_id)

    def test_nearby_reports_query(self):
        # Create report at (12.9716, 77.5946)
        self.client.post("/api/reports/", {
            "title": "Water Leakage",
            "description": "Broken pipe spraying water",
            "category": "water_leakage",
            "latitude": 12.9716,
            "longitude": 77.5946,
        }, format="json")

        # Query nearby within 5km radius
        response = self.client.get("/api/reports/nearby/?lat=12.9720&lng=77.5950&radius=5000")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertIn("distance_meters", response.data[0])

    def test_feed_and_map_queries(self):
        self.client.post("/api/reports/", {
            "title": "Street Light Off",
            "description": "Dark stretch",
            "category": "street_light",
            "latitude": 12.9784,
            "longitude": 77.6412,
        }, format="json")

        # Feed query
        feed_res = self.client.get("/api/reports/feed/?lat=12.9780&lng=77.6410&radius=10000")
        self.assertEqual(feed_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(feed_res.data), 1)

        # Map bounding box query
        map_res = self.client.get("/api/reports/map/?north=13.05&south=12.90&east=77.70&west=77.50")
        self.assertEqual(map_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(map_res.data), 1)
        self.assertIn("ticket_id", map_res.data[0])

    def test_status_update_patch(self):
        res = self.client.post("/api/reports/", {
            "title": "Broken Drain",
            "description": "Open drain near school",
            "category": "drainage",
            "latitude": 12.9750,
            "longitude": 77.6000,
        }, format="json")
        rep_id = res.data["id"]

        # Authenticate as officer to update status
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.officer_token}")
        patch_res = self.client.patch(f"/api/reports/{rep_id}/status/", {
            "status": ReportStatus.IN_PROGRESS,
            "notes": "Assigned crew to inspect site",
            "changed_by": "Inspector Ramesh",
        }, format="json")
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["status"], ReportStatus.IN_PROGRESS)
        self.assertEqual(len(patch_res.data["status_history"]), 2)

    def test_confirm_resolution_flow(self):
        res = self.client.post("/api/reports/", {
            "title": "Pothole for Confirmation",
            "description": "Testing citizen confirmation",
            "category": "pothole",
            "latitude": 12.9716,
            "longitude": 77.5946,
        }, format="json")
        rep_id = res.data["id"]

        # Unauthorized citizen attempting to confirm someone else's report -> 403 Forbidden
        diff_token = generate_jwt({
            "user_id": "diff_citizen_888",
            "phone": "9999988888",
            "name": "Different Citizen",
            "role": "citizen",
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {diff_token}")
        unauth_confirm = self.client.post(f"/api/reports/{rep_id}/confirm/", {
            "citizen_id": "diff_citizen_888",
            "notes": "Trying to confirm someone else's report",
        }, format="json")
        self.assertEqual(unauth_confirm.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Only the citizen who originally reported", unauth_confirm.data["detail"])

        # Original reporting citizen confirms resolution -> 200 OK
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.citizen_token}")
        confirm_res = self.client.post(f"/api/reports/{rep_id}/confirm/", {
            "citizen_id": "user_123",
            "notes": "Looks cleanly repaired. Thank you!",
        }, format="json")
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)
        self.assertEqual(confirm_res.data["report"]["status"], ReportStatus.CLOSED)

    def test_dispute_resolution_escalation(self):
        res = self.client.post("/api/reports/", {
            "title": "Incomplete Repair",
            "description": "Pothole not filled properly",
            "category": "pothole",
            "latitude": 12.9716,
            "longitude": 77.5946,
        }, format="json")
        rep_id = res.data["id"]

        # Unauthorized citizen attempting to dispute someone else's report -> 403 Forbidden
        diff_token = generate_jwt({
            "user_id": "diff_citizen_777",
            "phone": "9999977777",
            "name": "Different Citizen",
            "role": "citizen",
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {diff_token}")
        unauth_dispute = self.client.post(f"/api/reports/{rep_id}/dispute/", {
            "citizen_id": "diff_citizen_777",
            "dispute_reason": "Not my report but disputing",
        }, format="json")
        self.assertEqual(unauth_dispute.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Only the citizen who originally reported", unauth_dispute.data["detail"])

        # Original reporting citizen disputes resolution -> 200 OK
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.citizen_token}")
        dispute_res = self.client.post(f"/api/reports/{rep_id}/dispute/", {
            "citizen_id": "user_123",
            "dispute_reason": "Only loose gravel was dumped; pothole still exists.",
        }, format="json")
        self.assertEqual(dispute_res.status_code, status.HTTP_200_OK)
        self.assertEqual(dispute_res.data["report"]["status"], ReportStatus.DISPUTED)
        self.assertIn(dispute_res.data["report"]["priority_level"], [PriorityLevel.HIGH, PriorityLevel.CRITICAL])

    def test_upvote_and_duplicate_prevention(self):
        res = self.client.post("/api/reports/", {
            "title": "Corroboration Test",
            "description": "Tree fallen on road",
            "category": "fallen_tree",
            "latitude": 12.9716,
            "longitude": 77.5946,
        }, format="json")
        rep_id = res.data["id"]

        # Authenticate as a different citizen (cannot upvote your own report)
        voter_token = generate_jwt({"user_id": "user_voter_1", "role": "citizen", "phone": "9998887771"})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {voter_token}")

        # 1. First Upvote -> Should succeed
        upvote1 = self.client.post(f"/api/reports/{rep_id}/upvote/", {
            "user_id": "user_voter_1",
        }, format="json")
        self.assertEqual(upvote1.status_code, status.HTTP_200_OK)
        self.assertEqual(upvote1.data["report"]["upvote_count"], 1)

        # 2. Second Upvote from same user -> Toggles upvote off (or removes corroboration)
        upvote2 = self.client.post(f"/api/reports/{rep_id}/upvote/", {
            "user_id": "user_voter_1",
        }, format="json")
        self.assertEqual(upvote2.status_code, status.HTTP_200_OK)
        self.assertFalse(upvote2.data.get("has_upvoted", True))
        self.assertEqual(upvote2.data["report"]["upvote_count"], 0)

    def test_add_corroborating_evidence(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.citizen_token}")
        res = self.client.post("/api/reports/", {
            "title": "Evidence Test",
            "description": "Drain overflowing",
            "category": "drainage",
            "latitude": 12.9716,
            "longitude": 77.5946,
        }, format="json")
        rep_id = res.data["id"]

        evid_res = self.client.post(f"/api/reports/{rep_id}/evidence/", {
            "photo_url": "https://example.com/photos/drain_overflow_evidence.jpg",
            "submitted_by": "volunteer_1",
            "notes": "Water level has risen 10cm since morning.",
        }, format="json")
        self.assertEqual(evid_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(evid_res.data["report"]["evidence"]), 1)

    def test_report_create_with_image_upload_and_cloudinary_service(self):
        import io
        from unittest.mock import patch
        from PIL import Image
        from django.core.files.uploadedfile import SimpleUploadedFile
        from utils.cloudinary_service import upload_media, is_cloudinary_configured

        # Generate a small in-memory test image
        img = Image.new("RGB", (100, 100), color=(73, 109, 137))
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)

        uploaded_file = SimpleUploadedFile(
            "test_hazard.jpg",
            img_bytes.read(),
            content_type="image/jpeg",
        )

        # 1. Test fallback when Cloudinary is not configured
        with patch("utils.cloudinary_service.is_cloudinary_configured", return_value=False):
            url, meta = upload_media(uploaded_file, folder="test_folder")
            self.assertTrue(url.endswith(".jpg"))
            self.assertEqual(meta["provider"], "local_storage")

        # 2. Test when Cloudinary is configured
        uploaded_file.seek(0)
        mock_cloudinary_response = {
            "secure_url": "https://res.cloudinary.com/civic-test/image/upload/v1/civic_connect/reports/test_hazard.jpg",
            "public_id": "civic_connect/reports/test_hazard",
            "format": "jpg",
            "bytes": 1024,
            "resource_type": "image",
        }
        with patch("utils.cloudinary_service.is_cloudinary_configured", return_value=True), \
             patch("cloudinary.uploader.upload", return_value=mock_cloudinary_response):
            url, meta = upload_media(uploaded_file, folder="civic_connect/reports")
            self.assertEqual(url, mock_cloudinary_response["secure_url"])
            self.assertEqual(meta["provider"], "cloudinary")

        # 3. Test API endpoint with file upload
        uploaded_file.seek(0)
        with patch("utils.cloudinary_service.is_cloudinary_configured", return_value=True), \
             patch("cloudinary.uploader.upload", return_value=mock_cloudinary_response):
            api_res = self.client.post("/api/reports/", {
                "title": "Cloudinary Test Hazard",
                "description": "Hazard reported with live camera capture",
                "category": "pothole",
                "latitude": 12.9716,
                "longitude": 77.5946,
                "photo": uploaded_file,
            }, format="multipart")
            self.assertEqual(api_res.status_code, status.HTTP_201_CREATED)
            self.assertEqual(api_res.data["photo_url"], mock_cloudinary_response["secure_url"])

    def test_analyze_image_api_endpoint(self):
        # 1. Test with base64 dataUrl
        payload = {
            "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=",
            "mime_type": "image/jpeg",
        }
        res = self.client.post("/api/reports/analyze-image/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["success"])
        self.assertIn("category", res.data)
        self.assertIn("title", res.data)
        self.assertIn("description", res.data)
        self.assertIn("confidence", res.data)

        # 2. Test with empty payload -> 400
        bad_res = self.client.post("/api/reports/analyze-image/", {}, format="json")
        self.assertEqual(bad_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_user_cannot_create_report(self):
        # Clear credentials (simulate unauthenticated public visitor)
        self.client.credentials()

        payload = {
            "title": "Unauthorized Hazard",
            "description": "Trying to report without login",
            "category": "pothole",
            "latitude": 12.9716,
            "longitude": 77.5946,
        }
        res = self.client.post("/api/reports/", payload, format="json")
        # Must be rejected with 401 Unauthorized or 403 Forbidden
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_public_unauthenticated_can_view_reports(self):
        # 1. Create a report as authenticated citizen
        create_res = self.client.post("/api/reports/", {
            "title": "Public Viewable Pothole",
            "description": "Should be readable by anyone without login",
            "category": "pothole",
            "latitude": 12.9716,
            "longitude": 77.5946,
        }, format="json")
        rep_id = create_res.data["id"]
        ticket_id = create_res.data["ticket_id"]

        # 2. Clear credentials (simulate unauthenticated visitor)
        self.client.credentials()

        # Public list view
        list_res = self.client.get("/api/reports/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)

        # Public detail view by ID
        detail_res = self.client.get(f"/api/reports/{rep_id}/")
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)

        # Public detail view by Ticket ID
        ticket_res = self.client.get(f"/api/reports/ticket/{ticket_id}/")
        self.assertEqual(ticket_res.status_code, status.HTTP_200_OK)

        # Public nearby view
        nearby_res = self.client.get("/api/reports/nearby/?lat=12.9716&lng=77.5946&radius=5000")
        self.assertEqual(nearby_res.status_code, status.HTTP_200_OK)

        # Public feed view
        feed_res = self.client.get("/api/reports/feed/?lat=12.9716&lng=77.5946&radius=10000")
        self.assertEqual(feed_res.status_code, status.HTTP_200_OK)

        # Public map view
        map_res = self.client.get("/api/reports/map/?north=13.05&south=12.90&east=77.70&west=77.50")
        self.assertEqual(map_res.status_code, status.HTTP_200_OK)
