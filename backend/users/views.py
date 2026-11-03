"""Views for Users App."""

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from civic_connect.mongo import get_collection, serialize_docs
from users.models import UserManager, UserRole
from users.serializers import UserProfileSerializer, UserSyncSerializer


class UserProfileAPIView(APIView):
    """
    GET: Retrieve user profile by user_id, phone, or email.
    POST: Create or update user profile.
    """

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get("user_id") or request.query_params.get("id")
        phone = request.query_params.get("phone")
        email = request.query_params.get("email")

        user = None
        if user_id:
            user = UserManager.find_by_id(user_id)
        elif phone:
            user = UserManager.find_by_phone(phone)
        elif email:
            user = UserManager.find_by_email(email)

        if not user:
            return Response(
                {"detail": "User profile not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = UserProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        phone = serializer.validated_data.get("phone")
        user_id = serializer.validated_data.get("user_id")
        if phone:
            existing = UserManager.find_by_phone(phone)
            if existing and user_id and existing.get("user_id") != user_id and str(existing.get("_id")) != str(user_id):
                return Response(
                    {"detail": f"A user with phone number '{phone}' already exists. Phone number must be unique."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user_doc = UserManager.upsert_user(serializer.validated_data)
        return Response(
            UserProfileSerializer(user_doc).data,
            status=status.HTTP_200_OK,
        )


class UserSyncAPIView(APIView):
    """
    Synchronize user upon client authentication (e.g., Firebase Auth).
    """

    def post(self, request, *args, **kwargs):
        serializer = UserSyncSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        user_id = data.get("firebase_uid") or data.get("phone")
        user_payload = {
            "user_id": user_id,
            "name": data.get("name", "Civic User"),
            "phone": data.get("phone"),
            "email": data.get("email"),
            "role": data.get("role", UserRole.CITIZEN),
            "volunteer_scheme": data.get("volunteer_scheme"),
            "ward_id": data.get("ward_id"),
        }

        user_doc = UserManager.upsert_user(user_payload)
        return Response(
            UserProfileSerializer(user_doc).data,
            status=status.HTTP_200_OK,
        )


class VolunteersListAPIView(APIView):
    """List volunteers, their active scheme (NSS/NCC/NYKS), and gamification points."""

    def get(self, request, *args, **kwargs):
        scheme = request.query_params.get("scheme")
        col = get_collection("users")
        query = {"role": UserRole.VOLUNTEER}
        if scheme:
            query["volunteer_scheme"] = scheme.upper()

        docs = col.find(query).sort("points", -1).limit(100)
        return Response(
            UserProfileSerializer(serialize_docs(list(docs)), many=True).data,
            status=status.HTTP_200_OK,
        )


class SendOTPAPIView(APIView):
    """
    POST /api/users/send-otp/
    Request OTP for phone authentication with 60-second cooldown rate limiting and duplicate user prevention.
    """

    def post(self, request, *args, **kwargs):
        from users.otp import OTPManager
        from users.validators import validate_indian_phone
        from rest_framework import serializers

        try:
            phone = validate_indian_phone(request.data.get("phone", ""))
        except serializers.ValidationError as err:
            return Response(
                {"detail": str(err.detail[0]) if err.detail else "A valid 10-digit Indian mobile number is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        role = request.data.get("role", "citizen").lower()
        mode = request.data.get("mode", "").strip().lower()

        existing_user = UserManager.find_by_phone(phone)

        # Prohibit duplicate users: if signing up and phone already exists, reject
        if mode == "signup" and existing_user is not None:
            return Response(
                {
                    "detail": f"An account with mobile number {phone} already exists ({existing_user.get('name', 'Citizen')}). Please sign in instead.",
                    "account_exists": True,
                    "phone": phone,
                    "user_name": existing_user.get("name"),
                },
                status=status.HTTP_409_CONFLICT,
            )

        # If user explicitly selected Sign In, but no account exists, prompt to Sign Up
        if mode == "signin" and existing_user is None:
            return Response(
                {
                    "detail": f"No account found with mobile number {phone}. Please sign up to create your account.",
                    "account_exists": False,
                    "phone": phone,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR"))
        success, err, retry_after, dev_otp = OTPManager.request_otp(
            phone=phone, role=role, ip_address=ip
        )

        if not success:
            return Response(
                {
                    "detail": err,
                    "retry_after": retry_after,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        response_payload = {
            "message": f"Test OTP generated for {phone}.",
            "retry_after": retry_after,
            "phone": phone,
            "test_otp": dev_otp or "123456",
            "dev_otp": dev_otp or "123456",
            "account_exists": existing_user is not None,
            "user_name": existing_user.get("name") if existing_user else None,
        }
        return Response(response_payload, status=status.HTTP_200_OK)


class VerifyOTPAPIView(APIView):
    """
    POST /api/users/verify-otp/
    Verify OTP code and authenticate or register citizen/officer profile without generating duplicate users.
    """

    def post(self, request, *args, **kwargs):
        from users.otp import OTPManager
        from users.validators import validate_indian_phone, validate_password_strength
        from rest_framework import serializers
        import uuid

        raw_phone = request.data.get("phone", "")
        otp = request.data.get("otp", "").strip()
        name = request.data.get("name", "").strip()
        role = request.data.get("role", "").strip().lower()
        mode = request.data.get("mode", "").strip().lower()

        if not raw_phone or not otp:
            return Response(
                {"detail": "Phone and OTP code are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            phone = validate_indian_phone(raw_phone)
        except serializers.ValidationError as err:
            return Response(
                {"detail": str(err.detail[0]) if err.detail else "A valid 10-digit Indian mobile number is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_valid, err, record = OTPManager.verify_otp(phone, otp)
        if not is_valid:
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)

        # Check existing user
        existing_user = UserManager.find_by_phone(phone)

        # Prohibit duplicate account creation
        if mode == "signup" and existing_user is not None:
            return Response(
                {"detail": f"An account with mobile number {phone} already exists. Please sign in instead."},
                status=status.HTTP_409_CONFLICT,
            )

        if mode == "signin" and existing_user is None:
            return Response(
                {"detail": f"No account found with mobile number {phone}. Please sign up first."},
                status=status.HTTP_404_NOT_FOUND,
            )

        password_input = str(request.data.get("password") or request.data.get("credential_code") or "").strip()
        if password_input:
            try:
                validate_password_strength(password_input)
            except serializers.ValidationError as err:
                return Response(
                    {"detail": str(err.detail[0]) if err.detail else "Invalid password complexity."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if existing_user:
            # Authenticate existing user and update non-destructive fields without creating duplicate
            update_payload = {"phone": phone}
            if password_input:
                update_payload["credential_code"] = password_input
            if name and existing_user.get("name") in ["Civic User", "Verified Citizen", ""]:
                update_payload["name"] = name
            email = request.data.get("email", "").strip()
            if email:
                update_payload["email"] = email.lower()
            ward_id = request.data.get("ward_id") or request.data.get("ward")
            ward_name = request.data.get("ward_name")
            if ward_id and not existing_user.get("ward_id"):
                update_payload["ward_id"] = str(ward_id).strip()
            if ward_name and not existing_user.get("ward_name"):
                update_payload["ward_name"] = str(ward_name).strip()

            user = UserManager.update_user(existing_user["_id"], update_payload)
        else:
            # Create brand new unique user
            user_role = role or (record.get("role") if record else UserRole.CITIZEN)
            new_payload = {
                "user_id": f"usr_{uuid.uuid4().hex[:8]}",
                "phone": phone,
                "name": name or ("Municipal Officer" if user_role == UserRole.OFFICER else "Verified Citizen"),
                "role": user_role,
            }
            if password_input:
                new_payload["credential_code"] = password_input

            ward_id = request.data.get("ward_id") or request.data.get("ward")
            ward_name = request.data.get("ward_name")
            if ward_id:
                new_payload["ward_id"] = str(ward_id).strip()
            if ward_name:
                new_payload["ward_name"] = str(ward_name).strip()

            email = request.data.get("email", "").strip()
            if email:
                new_payload["email"] = email.lower()

            if user_role == UserRole.OFFICER:
                if request.data.get("department"):
                    new_payload["department"] = request.data.get("department").strip()
                if request.data.get("designation"):
                    new_payload["designation"] = request.data.get("designation").strip()
                if request.data.get("employee_id"):
                    new_payload["employee_id"] = request.data.get("employee_id").strip()
                if request.data.get("jurisdiction_zone"):
                    new_payload["jurisdiction_zone"] = request.data.get("jurisdiction_zone").strip()

            user = UserManager.upsert_user(new_payload)

        from civic_connect.authentication import generate_jwt
        auth_token = generate_jwt(user)

        return Response({
            "message": "Authentication successful.",
            "token": auth_token,
            "user": UserProfileSerializer(user).data,
        }, status=status.HTTP_200_OK)


class PasswordLoginAPIView(APIView):
    """
    POST /api/users/login-password/
    Authenticate citizen or officer using mobile phone/identifier and password/passcode.
    """

    def post(self, request, *args, **kwargs):
        from civic_connect.authentication import generate_jwt
        from users.models import UserManager, normalize_phone

        identifier = str(request.data.get("identifier") or request.data.get("phone") or "").strip()
        password = str(request.data.get("password") or request.data.get("passcode") or "").strip()

        if not identifier:
            return Response(
                {"detail": "Mobile number or identifier is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not password:
            return Response(
                {"detail": "Password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = UserManager.find_by_credential(identifier, password)
        if not user:
            norm_phone = normalize_phone(identifier)
            existing = UserManager.find_by_phone(identifier) or (UserManager.find_by_phone(norm_phone) if norm_phone else None)
            if not existing:
                return Response(
                    {"detail": f"No account found with mobile number {identifier}. Please sign up with OTP first."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if not existing.get("credential_code"):
                return Response(
                    {"detail": "No password configured for this account yet. Please sign in with OTP first, then set a password in your Profile."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"detail": "Incorrect password. Please verify your password or sign in with OTP."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.get("is_active", True):
            return Response(
                {"detail": "Account has been deactivated. Please contact support."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token = generate_jwt(user)
        return Response({
            "message": f"Welcome back, {user.get('name', 'Citizen')}.",
            "token": token,
            "user": UserProfileSerializer(user).data,
        }, status=status.HTTP_200_OK)


class ChangePasswordAPIView(APIView):
    """
    POST /api/users/change-password/
    Change user password/passcode with mandatory OTP verification.
    """

    def post(self, request, *args, **kwargs):
        import datetime
        from users.otp import OTPManager
        from users.models import normalize_phone, UserManager

        phone = normalize_phone(request.data.get("phone", ""))
        user_id = request.data.get("user_id", "")
        otp = str(request.data.get("otp", "")).strip()
        new_password = str(request.data.get("new_password", "")).strip()

        if not phone and not user_id:
            return Response(
                {"detail": "Phone number or User ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not otp:
            return Response(
                {"detail": "Verification OTP code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from users.validators import validate_password_strength
        from rest_framework import serializers

        try:
            new_password = validate_password_strength(new_password)
        except serializers.ValidationError as err:
            return Response(
                {"detail": str(err.detail[0]) if err.detail else "Password must be at least 6 characters and contain letters and numbers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Lookup user
        user = None
        if user_id:
            user = UserManager.find_by_id(user_id)
        if not user and phone:
            user = UserManager.find_by_phone(phone)

        target_phone = phone
        if user:
            target_phone = user.get("phone") or phone

        # Verify OTP code
        is_valid, err, _ = OTPManager.verify_otp(target_phone, otp)
        if not is_valid:
            return Response(
                {"detail": err or "Invalid or expired verification code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = datetime.datetime.now(datetime.timezone.utc)
        col = UserManager.get_collection()

        if not user:
            # If user does not exist in DB yet, create user with verified phone & new password
            user_doc = UserManager.upsert_user({
                "phone": target_phone,
                "name": request.data.get("name") or "Verified Citizen",
                "role": "citizen",
                "credential_code": new_password,
            })
            return Response(
                {
                    "message": "Password updated and account credentials verified successfully.",
                    "user": UserProfileSerializer(user_doc).data if user_doc else None,
                },
                status=status.HTTP_200_OK,
            )

        # Update password/credential_code on user record in MongoDB
        target_uid = user.get("user_id") or user.get("_id") or user.get("id")
        updated_user = UserManager.update_user(target_uid, {"credential_code": new_password})
        if not updated_user:
            updated_user = UserManager.find_by_phone(target_phone)
        return Response(
            {
                "message": "Password updated successfully.",
                "user": UserProfileSerializer(updated_user).data if updated_user else None,
            },
            status=status.HTTP_200_OK,
        )


class DeleteAccountAPIView(APIView):
    """
    POST /api/users/delete-account/
    Delete user account with mandatory OTP verification.
    After deletion, all citizen reports and upvotes remain permanently in MongoDB,
    marked and attributed to 'Anonymous Citizen' to preserve community resolution integrity.
    """

    def post(self, request, *args, **kwargs):
        import datetime
        from users.otp import OTPManager
        from users.models import normalize_phone, UserManager

        raw_phone = request.data.get("phone", "")
        phone = normalize_phone(raw_phone)
        user_id = request.data.get("user_id", "")
        otp = str(request.data.get("otp", "")).strip()

        # Attribute from authenticated token if available
        if getattr(request.user, "phone", None):
            phone = normalize_phone(request.user.phone)
        if getattr(request.user, "user_id", None):
            user_id = request.user.user_id

        if not phone and not user_id:
            return Response(
                {"detail": "Registered mobile number or user ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not otp:
            return Response(
                {"detail": "Verification OTP code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Lookup user in database
        user = None
        if user_id:
            user = UserManager.find_by_id(user_id)
        if not user and phone:
            user = UserManager.find_by_phone(phone)
        if not user and raw_phone:
            user = UserManager.find_by_phone(raw_phone)

        target_phone = phone or (user.get("phone") if user else raw_phone)

        # Step 1: Verify OTP code
        is_valid, err, _ = OTPManager.verify_otp(target_phone, otp)
        if not is_valid:
            return Response(
                {"detail": err or "Invalid or expired verification OTP code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = datetime.datetime.now(datetime.timezone.utc)
        user_id_val = (user.get("user_id") if user else user_id) or f"usr_{phone}"
        user_phone = (user.get("phone") if user else phone) or phone
        raw_phone_str = str(raw_phone).strip()

        # Step 2: Anonymize citizen reports in MongoDB (Preserve reports for city maintenance)
        reports_col = get_collection("reports")
        rep_clauses = [
            {"reporter_id": user_id_val},
            {"reporter_phone": user_phone},
        ]
        if user and user.get("_id"):
            rep_clauses.append({"reporter_id": str(user["_id"])})
        if raw_phone_str and raw_phone_str != user_phone:
            rep_clauses.append({"reporter_phone": raw_phone_str})

        reports_filter = {"$or": rep_clauses}
        reports_update = {
            "$set": {
                "reporter_id": "anonymous",
                "reporter_name": "Anonymous Citizen",
                "reporter_phone": "",
                "updated_at": now,
            },
            "$push": {
                "status_history": {
                    "status": "ANONYMIZED",
                    "changed_by": "System",
                    "role": "system",
                    "notes": "Citizen requested account deletion with verified OTP. Report and resolution history preserved as Anonymous Citizen.",
                    "timestamp": now.isoformat(),
                }
            },
        }
        reports_col.update_many(reports_filter, reports_update)

        # Step 3: Anonymize citizen upvotes in MongoDB (Keep upvote count intact)
        upvotes_col = get_collection("upvotes")
        upv_clauses = [
            {"user_id": user_id_val},
            {"phone": user_phone},
        ]
        if user and user.get("_id"):
            upv_clauses.append({"user_id": str(user["_id"])})
        if raw_phone_str and raw_phone_str != user_phone:
            upv_clauses.append({"phone": raw_phone_str})

        upvotes_col.update_many(
            {"$or": upv_clauses},
            {
                "$set": {
                    "user_id": "anonymous_user",
                    "user_name": "Anonymous Citizen",
                    "phone": "",
                    "anonymized": True,
                }
            },
        )

        # Step 4: Delete citizen user record from MongoDB
        from civic_connect.mongo import parse_object_id
        users_col = get_collection("users")
        del_clauses = []
        if user_id_val:
            del_clauses.append({"user_id": user_id_val})
        if user_phone:
            del_clauses.append({"phone": user_phone})
        if raw_phone_str:
            del_clauses.append({"phone": raw_phone_str})
        if user and user.get("_id"):
            oid = parse_object_id(user["_id"])
            if oid:
                del_clauses.append({"_id": oid})
            del_clauses.append({"_id": user["_id"]})

        if del_clauses:
            users_col.delete_many({"$or": del_clauses})

        # Step 5: Clean up gamification ledger
        gamification_col = get_collection("gamification_ledger")
        gamification_col.delete_many({"$or": [{"user_id": user_id_val}, {"phone": user_phone}]})

        return Response(
            {
                "message": "Your account has been deleted. Your submitted reports and upvotes have been safely anonymized in the database to support continued civic maintenance.",
                "success": True,
            },
            status=status.HTTP_200_OK,
        )


class RedeemRewardAPIView(APIView):
    """
    POST /api/users/redeem/
    Redeem municipal civic rewards using spendable Civic Coins.
    CRITICAL RULE: Deducts Coins ONLY. Civic Reputation Points remain 100% intact!
    """

    def post(self, request, *args, **kwargs):
        import datetime
        import uuid
        from users.models import UserManager

        user_id = getattr(request.user, "user_id", None) or request.data.get("user_id")
        phone = getattr(request.user, "phone", None) or request.data.get("phone")

        user = None
        if user_id:
            user = UserManager.find_by_id(user_id)
        if not user and phone:
            user = UserManager.find_by_phone(phone)

        if not user:
            return Response(
                {"detail": "Authentication required. Please sign in to redeem rewards."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        item_id = str(request.data.get("item_id", "")).strip()
        item_name = str(request.data.get("item_name", "Municipal Civic Merchandise")).strip()
        size = str(request.data.get("size", "")).strip()

        try:
            coins_cost = int(request.data.get("coins_cost", request.data.get("coins", 0)))
        except (ValueError, TypeError):
            coins_cost = 0

        if coins_cost <= 0:
            return Response(
                {"detail": "Invalid coin amount specified for reward."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_uid = user.get("user_id") or str(user["_id"])
        success, msg, updated_user = UserManager.deduct_coins(target_uid, coins_cost)

        if not success:
            return Response(
                {"detail": msg, "user": UserProfileSerializer(updated_user or user).data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = datetime.datetime.now(datetime.timezone.utc)
        order_id = f"RDM-2026-{uuid.uuid4().hex[:6].upper()}"

        # Record redemption receipt in MongoDB
        redemptions_col = get_collection("redemptions")
        receipt_doc = {
            "order_id": order_id,
            "user_id": target_uid,
            "user_name": user.get("name", "Citizen"),
            "user_phone": user.get("phone", ""),
            "item_id": item_id,
            "item_name": item_name,
            "size": size or None,
            "coins_spent": coins_cost,
            "status": "CONFIRMED",
            "created_at": now,
        }
        redemptions_col.insert_one(receipt_doc)

        return Response(
            {
                "message": f"Successfully claimed {item_name}! {coins_cost} Civic Coins deducted. Your Civic Reputation Points remain untouched.",
                "order_id": order_id,
                "coins_spent": coins_cost,
                "user": UserProfileSerializer(updated_user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminProvisionAPIView(APIView):
    """
    POST /api/users/admin/provision/
    3-Tier Administration Provisioning Engine:
    - Super Admin (Civic Connect Team) generates credentials for Ward Admins.
    - Ward Admin (Municipal Corporation) generates credentials for Field Officers for their specific tasks in their ward.
    """

    def post(self, request, *args, **kwargs):
        try:
            from civic_connect.authentication import JWTBearerAuthentication
            caller = None
            try:
                auth = JWTBearerAuthentication()
                user_auth = auth.authenticate(request)
                caller = user_auth[0] if user_auth else None
            except Exception:
                caller = None

            target_role = request.data.get("target_role", "").strip().lower()

            if target_role == UserRole.ADMIN:
                # Super Admin creates Ward Admin
                from users.validators import validate_indian_phone
                from rest_framework import serializers

                name = request.data.get("name", "").strip()
                raw_phone = request.data.get("phone", "").strip()
                ward_id = request.data.get("ward_id", "").strip()
                ward_name = request.data.get("ward_name", "").strip()

                if not name or not raw_phone or not ward_id:
                    return Response(
                        {"detail": "Administrator Name, Phone number, and Ward Assignment are required."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                try:
                    phone = validate_indian_phone(raw_phone)
                except serializers.ValidationError as err:
                    return Response(
                        {"detail": str(err.detail[0]) if err.detail else "Invalid phone number."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                super_admin_id = getattr(caller, "user_id", "cc_superadmin_01")
                admin_payload = dict(request.data)
                admin_payload["phone"] = phone
                admin_doc = UserManager.create_admin_by_super_admin(super_admin_id, admin_payload)

                return Response({
                    "message": f"Municipal Ward Admin credentials generated successfully for {name}.",
                    "admin": UserProfileSerializer(admin_doc).data,
                    "credentials": {
                        "employee_id": admin_doc.get("employee_id"),
                        "passcode": admin_doc.get("credential_code"),
                        "ward_id": admin_doc.get("ward_id"),
                        "ward_name": admin_doc.get("ward_name"),
                    }
                }, status=status.HTTP_201_CREATED)

            elif target_role == UserRole.OFFICER:
                # Ward Admin creates Field Officer for their specific ward
                from users.validators import validate_indian_phone
                from rest_framework import serializers

                name = request.data.get("name", "").strip()
                raw_phone = request.data.get("phone", "").strip()
                assigned_tasks = request.data.get("assigned_tasks", [])
                ward_id = getattr(caller, "ward_id", None) or request.data.get("ward_id", "Ward-102")

                if not name or not raw_phone:
                    return Response(
                        {"detail": "Officer Name and Phone number are required."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                try:
                    phone = validate_indian_phone(raw_phone)
                except serializers.ValidationError as err:
                    return Response(
                        {"detail": str(err.detail[0]) if err.detail else "Invalid phone number."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if not assigned_tasks:
                    assigned_tasks = ["pothole", "road_damage"]

                ward_admin_id = getattr(caller, "user_id", "admin_ward_102")
                officer_payload = {
                    **request.data,
                    "phone": phone,
                    "assigned_tasks": assigned_tasks,
                }
                officer_doc = UserManager.create_officer_by_ward_admin(ward_admin_id, ward_id, officer_payload)

                return Response({
                    "message": f"Field Officer credentials and task assignment generated successfully for {name}.",
                    "officer": UserProfileSerializer(officer_doc).data,
                    "credentials": {
                        "employee_id": officer_doc.get("employee_id"),
                        "passcode": officer_doc.get("credential_code"),
                        "ward_id": officer_doc.get("ward_id"),
                        "ward_name": officer_doc.get("ward_name"),
                        "assigned_tasks": officer_doc.get("assigned_tasks"),
                    }
                }, status=status.HTTP_201_CREATED)

            else:
                return Response(
                    {"detail": "Invalid target_role. Must be 'admin' or 'officer'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminRosterAPIView(APIView):
    """
    GET /api/users/admin/roster/
    List Ward Admins (for Super Admin) or Field Officers (for Ward Admin).
    """

    def get(self, request, *args, **kwargs):
        try:
            role = request.query_params.get("role", "admin").lower()
            ward_id = request.query_params.get("ward_id")

            if role == "admin":
                admins = UserManager.list_admins()
                return Response(UserProfileSerializer(admins, many=True).data, status=status.HTTP_200_OK)
            else:
                officers = UserManager.list_officers(ward_id=ward_id)
                return Response(UserProfileSerializer(officers, many=True).data, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": f"Failed to retrieve roster: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminQuickLoginAPIView(APIView):
    """
    POST /api/users/admin/quick-login/
    Login with generated credentials (employee_id/phone + passcode) for Super Admin, Ward Admin, or Officer.
    """

    def post(self, request, *args, **kwargs):
        try:
            from civic_connect.authentication import generate_jwt

            identifier = request.data.get("identifier", "").strip()
            passcode = request.data.get("passcode", "").strip()

            if not identifier or not passcode:
                return Response(
                    {"detail": "Identifier (Employee ID / Phone / Email) and Passcode are required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = UserManager.find_by_credential(identifier, passcode)
            if not user:
                return Response(
                    {"detail": "Invalid credentials or unauthorized administrative access code."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            if not user.get("is_active", True):
                return Response(
                    {"detail": "Administrative credentials have been revoked by authority."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            token = generate_jwt(user)
            return Response({
                "message": f"Welcome, {user.get('name')}. Administrative session authorized.",
                "token": token,
                "user": UserProfileSerializer(user).data,
            }, status=status.HTTP_200_OK)
        except Exception as exc:
            return Response(
                {"detail": f"Administrative login error: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminRevokeAPIView(APIView):
    """
    POST /api/users/admin/revoke/
    Revoke user credentials. Requires Admin or Super Admin privileges.
    """

    def post(self, request, *args, **kwargs):
        try:
            from civic_connect.authentication import JWTBearerAuthentication
            try:
                auth = JWTBearerAuthentication()
                user_auth = auth.authenticate(request)
                caller = user_auth[0] if user_auth else None
            except Exception:
                caller = None

            if not caller or getattr(caller, "role", "") not in (UserRole.ADMIN, UserRole.SUPER_ADMIN):
                return Response(
                    {"detail": "Administrative privileges required to revoke credentials."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            user_id = request.data.get("user_id", "").strip()
            if not user_id:
                return Response({"detail": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            success = UserManager.revoke_user_credential(user_id)
            if success:
                return Response({"message": f"Credential for {user_id} revoked."}, status=status.HTTP_200_OK)
            return Response({"detail": "User not found or already inactive."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as exc:
            return Response(
                {"detail": f"Revocation error: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

