"""
Unit and Integration Tests for Wards, Departments, and Leaderboard.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from reports.models import ReportManager, ReportStatus
from wards.routing import route_category_to_department, route_location_to_ward


class WardTests(TestCase):
    def setUp(self):
        self.client = APIClient()

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
