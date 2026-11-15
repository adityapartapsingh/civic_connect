"""
Unit and Integration Tests for Wards, Departments, and Leaderboard.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from civic_connect.authentication import generate_jwt
from reports.models import ReportManager, ReportStatus
from users.models import UserRole
from wards.routing import route_category_to_department, route_location_to_ward


class WardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        from wards.models import WardManager
        WardManager.get_collection().delete_many({"ward_number": {"$in": ["Ward-199", "Ward-999"]}})

    def tearDown(self):
        from wards.models import WardManager
        WardManager.get_collection().delete_many({"ward_number": {"$in": ["Ward-199", "Ward-999"]}})

    def test_category_department_routing(self):
        self.assertEqual(route_category_to_department("pothole"), "ROADS")
        self.assertEqual(route_category_to_department("garbage"), "SWM")
        self.assertEqual(route_category_to_department("street_light"), "ELECTRICAL")
        self.assertEqual(route_category_to_department("water_leakage"), "WATER_SEWAGE")
        self.assertEqual(route_category_to_department("fallen_tree"), "HORTICULTURE")

    def test_ward_and_department_listing(self):
        wards_res = self.client.get("/api/wards/")
        self.assertEqual(wards_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(wards_res.data), 1)

        depts_res = self.client.get("/api/wards/departments/")
        self.assertEqual(depts_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(depts_res.data), 5)

    def test_ward_leaderboard(self):
        res = self.client.get("/api/wards/leaderboard/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)
        first_ward = res.data[0]
        self.assertIn("resolution_rate_percent", first_ward)
        self.assertIn("avg_resolution_hours", first_ward)
        self.assertIn("rank", first_ward)

    def test_create_ward_forbidden_for_anonymous_or_citizen(self):
        # Anonymous fails
        res = self.client.post("/api/wards/", {"ward_number": "Ward-999", "name": "Illegal Ward", "zone": "Zone"})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Citizen fails
        cit_token = generate_jwt({"user_id": "cit_001", "role": "citizen"})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {cit_token}")
        res2 = self.client.post("/api/wards/", {"ward_number": "Ward-999", "name": "Illegal Ward", "zone": "Zone"})
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_ward_success_and_duplicate_check_for_superadmin(self):
        sa_token = generate_jwt({"user_id": "sa_root_01", "role": UserRole.SUPER_ADMIN})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {sa_token}")

        payload = {
            "ward_number": "Ward-199",
            "name": "New Test Sector Ward",
            "zone": "Outer Jalandhar",
            "counselor_name": "Sh. Amarjit Singh",
            "contact_phone": "+91-9876543299",
            "lat": 31.3300,
            "lng": 75.5900,
        }
        res = self.client.post("/api/wards/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["ward_number"], "Ward-199")
        self.assertEqual(res.data["name"], "New Test Sector Ward")

        # Duplicate check should fail with 400
        dup_res = self.client.post("/api/wards/", payload, format="json")
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already exists", dup_res.data.get("detail", ""))
