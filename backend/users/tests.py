"""
Unit and Integration Tests for Users and Volunteers.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from civic_connect.mongo import get_collection
from users.models import UserRole, VolunteerScheme


class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        get_collection("users").delete_many({})

    def test_user_profile_create_and_get(self):
        post_res = self.client.post("/api/users/profile/", {
            "name": "Kavita Singh",
            "phone": "+91-9876500001",
            "role": UserRole.CITIZEN,
        }, format="json")
        self.assertEqual(post_res.status_code, status.HTTP_200_OK)
        user_id = post_res.data["id"]

        get_res = self.client.get(f"/api/users/profile/?user_id={user_id}")
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data["name"], "Kavita Singh")

    def test_user_sync_endpoint(self):
        sync_res = self.client.post("/api/users/sync/", {
            "firebase_uid": "fb_uid_987654321",
            "phone": "+91-9876500002",
            "name": "Vikram Rathore",
            "role": UserRole.VOLUNTEER,
            "volunteer_scheme": VolunteerScheme.NCC,
        }, format="json")
        self.assertEqual(sync_res.status_code, status.HTTP_200_OK)
        self.assertEqual(sync_res.data["role"], UserRole.VOLUNTEER)
        self.assertEqual(sync_res.data["volunteer_scheme"], VolunteerScheme.NCC)

    def test_volunteers_list(self):
        self.client.post("/api/users/sync/", {
            "firebase_uid": "vol_1",
            "name": "Vol 1",
            "role": UserRole.VOLUNTEER,
            "volunteer_scheme": VolunteerScheme.NSS,
        }, format="json")

        res = self.client.get("/api/users/volunteers/?scheme=NSS")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["volunteer_scheme"], "NSS")

    def test_jwt_generation_and_verification(self):
        from civic_connect.authentication import generate_jwt, verify_jwt

        payload = {
            "user_id": "usr_test_123",
            "phone": "+919876543210",
            "name": "Officer Test",
            "role": "officer",
            "department": "Engineering",
        }
        token = generate_jwt(payload)
        self.assertTrue(bool(token))
        self.assertEqual(token.count("."), 2)

        is_valid, decoded, err = verify_jwt(token)
        self.assertTrue(is_valid)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["user_id"], "usr_test_123")
        self.assertEqual(decoded["role"], "officer")

        # Tampered token check
        tampered = token[:-4] + "abcd"
        is_val_tamp, _, _ = verify_jwt(tampered)
        self.assertFalse(is_val_tamp)
