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
        get_collection("reports").delete_many({})
        get_collection("upvotes").delete_many({})

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

    def test_super_admin_provisions_ward_admin(self):
        res = self.client.post("/api/users/admin/provision/", {
            "target_role": "admin",
            "name": "Smt. Sunita Talwar Test",
            "phone": "9876599901",
            "email": "sunita.test@mcj.punjab.gov.in",
            "ward_id": "Ward-102",
            "ward_name": "Ward 2 - Civil Lines Administrative Ward",
            "department": "Municipal Corporation Jalandhar",
            "designation": "Ward 2 Municipal Councillor & Admin",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("credentials", res.data)
        self.assertEqual(res.data["credentials"]["ward_id"], "Ward-102")
        self.assertTrue(bool(res.data["credentials"]["passcode"]))
        self.assertTrue(bool(res.data["credentials"]["employee_id"]))

    def test_ward_admin_provisions_field_officer(self):
        res = self.client.post("/api/users/admin/provision/", {
            "target_role": "officer",
            "name": "Er. Harpreet Singh Test",
            "phone": "9814099902",
            "email": "harpreet.test@mcj.punjab.gov.in",
            "ward_id": "Ward-102",
            "department": "Roads & Infrastructure Division",
            "designation": "Junior Engineer (JE)",
            "assigned_tasks": ["pothole", "road_damage"],
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("credentials", res.data)
        self.assertEqual(res.data["credentials"]["ward_id"], "Ward-102")
        self.assertIn("pothole", res.data["credentials"]["assigned_tasks"])

    def test_admin_quick_login_flow(self):
        # 1. Provision an admin
        prov_res = self.client.post("/api/users/admin/provision/", {
            "target_role": "admin",
            "name": "Sh. Ramesh Kumar Test",
            "phone": "9876599903",
            "ward_id": "Ward-101",
        }, format="json")
        self.assertEqual(prov_res.status_code, status.HTTP_201_CREATED)
        emp_id = prov_res.data["credentials"]["employee_id"]
        passcode = prov_res.data["credentials"]["passcode"]

        # 2. Login with correct credentials
        login_res = self.client.post("/api/users/admin/quick-login/", {
            "identifier": emp_id,
            "passcode": passcode,
        }, format="json")
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertTrue(bool(login_res.data["token"]))
        self.assertEqual(login_res.data["user"]["role"], "admin")

        # 3. Login with wrong passcode
        bad_login = self.client.post("/api/users/admin/quick-login/", {
            "identifier": emp_id,
            "passcode": "WRONG_PASS",
        }, format="json")
        self.assertEqual(bad_login.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_duplicate_phone_rejected_on_signup(self):
        from users.models import UserManager

        # 1. Register initial user
        UserManager.upsert_user({
            "name": "Original Citizen",
            "phone": "9876511111",
            "role": UserRole.CITIZEN,
        })

        # 2. Try to send OTP for signup with the same phone -> must return 409 CONFLICT
        res = self.client.post("/api/users/send-otp/", {
            "phone": "9876511111",
            "mode": "signup",
            "role": "citizen",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)
        self.assertTrue(res.data.get("account_exists"))
        self.assertIn("already exists", res.data.get("detail", ""))

    def test_duplicate_phone_rejected_on_provisioning(self):
        # 1. Provision initial Ward Admin
        res1 = self.client.post("/api/users/admin/provision/", {
            "target_role": "admin",
            "name": "First Admin",
            "phone": "9876522222",
            "ward_id": "Ward-101",
        }, format="json")
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # 2. Attempt to provision another officer or admin with the exact same phone -> must be rejected
        res2 = self.client.post("/api/users/admin/provision/", {
            "target_role": "officer",
            "name": "Second Officer",
            "phone": "+91-9876522222",  # Different format, same normalized number
            "ward_id": "Ward-101",
            "assigned_tasks": ["pothole"],
        }, format="json")
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already exists", res2.data.get("detail", ""))

    def test_phone_normalization_prevents_duplicate_users(self):
        from users.models import UserManager, normalize_phone

        norm1 = normalize_phone("+91 98765-33333")
        norm2 = normalize_phone("09876533333")
        norm3 = normalize_phone("9876533333")
        self.assertEqual(norm1, "9876533333")
        self.assertEqual(norm2, "9876533333")
        self.assertEqual(norm3, "9876533333")

        # Upsert with +91 format
        u1 = UserManager.upsert_user({
            "name": "User Alpha",
            "phone": "+91 98765 33333",
            "role": UserRole.CITIZEN,
        })

        # Upsert with plain 10-digit format
        u2 = UserManager.upsert_user({
            "name": "User Alpha Updated",
            "phone": "9876533333",
            "role": UserRole.CITIZEN,
        })

        # Ensure only 1 user exists in collection, updated in place
        col = UserManager.get_collection()
        count = col.count_documents({"phone": "9876533333"})
        self.assertEqual(count, 1)
        self.assertEqual(u1["_id"], u2["_id"])

    def test_login_with_password(self):
        from users.models import UserManager

        # Create user with credential_code (password)
        UserManager.upsert_user({
            "name": "Password User",
            "phone": "9876544444",
            "role": UserRole.CITIZEN,
            "credential_code": "SecretPass123",
        })

        # Correct password login
        res = self.client.post("/api/users/login-password/", {
            "phone": "9876544444",
            "password": "SecretPass123",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("token", res.data)
        self.assertEqual(res.data["user"]["phone"], "9876544444")

        # Wrong password login
        res_bad = self.client.post("/api/users/login-password/", {
            "phone": "9876544444",
            "password": "WrongPassword",
        }, format="json")
        self.assertEqual(res_bad.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_password_with_otp(self):
        from users.models import UserManager

        UserManager.upsert_user({
            "name": "OTP User",
            "phone": "9876555555",
            "role": UserRole.CITIZEN,
        })

        # Change password using valid OTP (demo OTP 123456)
        res = self.client.post("/api/users/change-password/", {
            "phone": "9876555555",
            "otp": "123456",
            "new_password": "NewSecurePassword99",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Verify password login works with the new password
        login_res = self.client.post("/api/users/login-password/", {
            "phone": "9876555555",
            "password": "NewSecurePassword99",
        }, format="json")
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)

    def test_delete_account_with_otp_anonymizes_reports_and_upvotes(self):
        from users.models import UserManager
        from reports.models import ReportManager
        from civic_connect.mongo import get_collection

        # 1. Create a citizen
        user = UserManager.upsert_user({
            "name": "Citizen To Delete",
            "phone": "9876566666",
            "role": UserRole.CITIZEN,
        })
        user_id = user.get("user_id")

        # 2. Create a report submitted by this citizen
        report = ReportManager.create_report({
            "title": "Pothole in Ward 2",
            "description": "Severe pothole near market entrance.",
            "category": "pothole",
            "latitude": 31.3260,
            "longitude": 75.5762,
            "reporter_id": user_id,
            "reporter_name": "Citizen To Delete",
            "reporter_phone": "9876566666",
        })
        ticket_id = report["ticket_id"]

        # 3. Create an upvote by this citizen
        upvotes_col = get_collection("upvotes")
        upvotes_col.insert_one({
            "report_id": ticket_id,
            "user_id": user_id,
            "phone": "9876566666",
            "user_name": "Citizen To Delete",
        })

        # 4. Attempt deletion with wrong OTP -> must fail
        bad_res = self.client.post("/api/users/delete-account/", {
            "phone": "9876566666",
            "otp": "999999",
        }, format="json")
        self.assertEqual(bad_res.status_code, status.HTTP_400_BAD_REQUEST)

        # 5. Delete account with valid OTP (demo 123456)
        res = self.client.post("/api/users/delete-account/", {
            "phone": "9876566666",
            "otp": "123456",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get("success"))

        # 6. Verify user is removed from database
        deleted_user = UserManager.find_by_phone("9876566666")
        self.assertIsNone(deleted_user)

        # 7. Verify report REMAINS in database, marked as Anonymous Citizen
        persisted_report = ReportManager.get_by_ticket_id(ticket_id)
        self.assertIsNotNone(persisted_report)
        self.assertEqual(persisted_report["reporter_name"], "Anonymous Citizen")
        self.assertEqual(persisted_report["reporter_id"], "anonymous")
        self.assertEqual(persisted_report["reporter_phone"], "")

        # 8. Verify upvote REMAINS in database, marked as Anonymous Citizen
        persisted_upvote = upvotes_col.find_one({"report_id": ticket_id})
        self.assertIsNotNone(persisted_upvote)
        self.assertEqual(persisted_upvote["user_name"], "Anonymous Citizen")
        self.assertEqual(persisted_upvote["phone"], "")

    def test_coins_redemption_and_fraud_penalty_logic(self):
        from users.models import UserManager

        # 1. Create citizen with 100 points and 100 coins
        user = UserManager.upsert_user({
            "name": "Coins Citizen",
            "phone": "9876577777",
            "role": UserRole.CITIZEN,
            "points": 100,
            "coins": 100,
        })
        uid = user.get("user_id")

        # 2. Buy merchandise costing 40 coins -> Coins drop to 60, POINTS STAY AT 100!
        res = self.client.post("/api/users/redeem/", {
            "user_id": uid,
            "item_id": "merch_bottle",
            "item_name": "Stainless Steel Bottle",
            "coins_cost": 40,
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["user"]["coins"], 60)
        self.assertEqual(res.data["user"]["points"], 100)  # Points must NEVER decrease on purchase!

        # 3. Attempt to buy item costing 100 coins (only 60 available) -> Insufficient coins error
        bad_res = self.client.post("/api/users/redeem/", {
            "user_id": uid,
            "item_id": "merch_tshirt",
            "coins_cost": 100,
        }, format="json")
        self.assertEqual(bad_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Insufficient", bad_res.data.get("detail", ""))

        # 4. Fraud penalty applied: BOTH points and coins decrease!
        penalized = UserManager.apply_fraud_penalty(uid, points_penalty=50, coins_penalty=50)
        self.assertIsNotNone(penalized)
        self.assertEqual(penalized["points"], 50)  # 100 - 50 = 50
        self.assertEqual(penalized["coins"], 10)   # 60 - 50 = 10

    def test_indian_phone_validator(self):
        from users.validators import validate_indian_phone
        from rest_framework import serializers

        # Valid Indian numbers
        self.assertEqual(validate_indian_phone("+91 9876543210"), "9876543210")
        self.assertEqual(validate_indian_phone("08360941177"), "8360941177")
        self.assertEqual(validate_indian_phone("7890123456"), "7890123456")
        self.assertEqual(validate_indian_phone("6123456789"), "6123456789")

        # Invalid numbers
        with self.assertRaises(serializers.ValidationError):
            validate_indian_phone("12345")
        with self.assertRaises(serializers.ValidationError):
            validate_indian_phone("5555555555")  # Does not start with 6-9
        with self.assertRaises(serializers.ValidationError):
            validate_indian_phone("abcdefghij")

    def test_password_strength_validator(self):
        from users.validators import validate_password_strength
        from rest_framework import serializers

        # Valid passwords
        self.assertEqual(validate_password_strength("adiraj123"), "adiraj123")
        self.assertEqual(validate_password_strength("Secure2026"), "Secure2026")

        # Too short (<6 chars)
        with self.assertRaises(serializers.ValidationError):
            validate_password_strength("abc1")

        # Only letters
        with self.assertRaises(serializers.ValidationError):
            validate_password_strength("abcdefgh")

        # Only digits
        with self.assertRaises(serializers.ValidationError):
            validate_password_strength("12345678")

        # Common weak password
        with self.assertRaises(serializers.ValidationError):
            validate_password_strength("password")

    def test_user_persistence_without_sparse_collision(self):
        """
        Verify multiple citizens can be created without crashing on employee_id null index.
        Solves: 'currently i have to create user when try to login everytime'
        """
        from users.models import UserManager

        # Insert Citizen 1 without employee_id and email
        c1 = UserManager.upsert_user({
            "name": "Citizen Alpha",
            "phone": "9876500011",
            "role": UserRole.CITIZEN,
        })
        self.assertIsNotNone(c1)
        self.assertEqual(c1["phone"], "9876500011")

        # Insert Citizen 2 without employee_id and email
        c2 = UserManager.upsert_user({
            "name": "Citizen Beta",
            "phone": "9876500022",
            "role": UserRole.CITIZEN,
        })
        self.assertIsNotNone(c2)
        self.assertEqual(c2["phone"], "9876500022")

        # Verify BOTH citizens exist in the database!
        found1 = UserManager.find_by_phone("9876500011")
        found2 = UserManager.find_by_phone("9876500022")
        self.assertIsNotNone(found1)
        self.assertIsNotNone(found2)
        self.assertEqual(found1["name"], "Citizen Alpha")
        self.assertEqual(found2["name"], "Citizen Beta")

    def test_meaningless_gibberish_filter(self):
        from fraud.text_quality import detect_gibberish_or_meaningless

        # Random keyboard walks
        is_gibb, reason, _ = detect_gibberish_or_meaningless("asdfghjk", "random typing problem")
        self.assertTrue(is_gibb)

        # Repeated characters
        is_gibb, reason, _ = detect_gibberish_or_meaningless("road issue", "aaaaaaa broken")
        self.assertTrue(is_gibb)

        # Repetitive words
        is_gibb, reason, _ = detect_gibberish_or_meaningless("road road road", "road road road road")
        self.assertTrue(is_gibb)

        # Consonant cluster mashing
        is_gibb, reason, _ = detect_gibberish_or_meaningless("pothole", "sdfghjkl broken street")
        self.assertTrue(is_gibb)

        # Valid civic issue
        is_gibb, reason, _ = detect_gibberish_or_meaningless(
            "Large deep pothole near main market",
            "Deep crater causing two-wheelers to slip near Civil Lines junction"
        )
        self.assertFalse(is_gibb)

    def test_duplicate_report_timeline_merging(self):
        """
        Verify that nearby duplicate hazard reports attach to existing timeline rather than punching duplicate tickets.
        """
        from reports.models import ReportManager
        from fraud.pipeline import run_report_verification_pipeline

        # 1. Create original ticket
        res1 = run_report_verification_pipeline(
            title="Large Pothole on Mall Road",
            description="Deep crater in middle of road near clock tower",
            category="pothole",
            latitude=31.3260,
            longitude=75.5762,
            reporter_id="usr_rep_1",
            reporter_name="Citizen 1",
            reporter_phone="9876511111",
        )
        self.assertTrue(res1["is_valid"])
        self.assertFalse(res1["is_duplicate"])
        original_ticket = res1["report_data"]["ticket_id"]

        # 2. Corroborating citizen reports identical pothole 10m away
        res2 = run_report_verification_pipeline(
            title="Dangerous Pothole on Mall Road",
            description="Deep pothole in middle of Mall Road near clock tower",
            category="pothole",
            latitude=31.3261,  # ~11 meters away
            longitude=75.5762,
            photo_url="https://cloudinary.com/test_corroboration.jpg",
            reporter_id="usr_rep_2",
            reporter_name="Citizen 2",
            reporter_phone="9876522222",
        )
        self.assertTrue(res2["is_valid"])
        self.assertTrue(res2["is_duplicate"])
        self.assertEqual(res2["report_data"]["ticket_id"], original_ticket)

        # 3. Verify original ticket has timeline corroboration entry and incremented upvotes
        updated_ticket = ReportManager.get_by_ticket_id(original_ticket)
        self.assertEqual(updated_ticket["upvote_count"], 1)
        self.assertTrue(any(ev.get("submitted_by") == "Citizen 2" for ev in updated_ticket.get("evidence", [])))


