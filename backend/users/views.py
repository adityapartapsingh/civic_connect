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
    Request OTP for phone authentication with 60-second cooldown rate limiting.
    """

    def post(self, request, *args, **kwargs):
        from users.otp import OTPManager

        phone = request.data.get("phone", "").strip()
        role = request.data.get("role", "citizen").lower()
        if not phone or len(phone) < 10:
            return Response(
                {"detail": "A valid 10-digit phone number is required."},
                status=status.HTTP_400_BAD_REQUEST,
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
            "message": f"OTP sent to {phone}. Valid for 5 minutes.",
            "retry_after": retry_after,
            "phone": phone,
        }
        # In development, return the code for testing convenience
        if settings.DEBUG:
            response_payload["dev_otp"] = dev_otp

        return Response(response_payload, status=status.HTTP_200_OK)


class VerifyOTPAPIView(APIView):
    """
    POST /api/users/verify-otp/
    Verify OTP code and authenticate or register citizen/officer profile.
    """

    def post(self, request, *args, **kwargs):
        from users.otp import OTPManager
        import uuid

        phone = request.data.get("phone", "").strip()
        otp = request.data.get("otp", "").strip()
        name = request.data.get("name", "").strip()
        role = request.data.get("role", "").strip().lower()

        if not phone or not otp:
            return Response(
                {"detail": "Phone and OTP code are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_valid, err, record = OTPManager.verify_otp(phone, otp)
        if not is_valid:
            return Response({"detail": err}, status=status.HTTP_400_BAD_REQUEST)

        # Check existing user or create new profile
        user = UserManager.find_by_phone(phone)
        user_role = role or (record.get("role") if record else "citizen")

        upsert_payload = {
            "user_id": user["user_id"] if user else f"usr_{uuid.uuid4().hex[:8]}",
            "phone": phone,
            "name": name or ("Municipal Officer" if user_role == "officer" else "Verified Citizen"),
            "role": user_role,
        }

        email = request.data.get("email", "").strip()
        if email:
            upsert_payload["email"] = email

        if user_role == "officer":
            department = request.data.get("department", "").strip()
            designation = request.data.get("designation", "").strip()
            employee_id = request.data.get("employee_id", "").strip()
            jurisdiction_zone = request.data.get("jurisdiction_zone", "").strip()
            if department:
                upsert_payload["department"] = department
            if designation:
                upsert_payload["designation"] = designation
            if employee_id:
                upsert_payload["employee_id"] = employee_id
            if jurisdiction_zone:
                upsert_payload["jurisdiction_zone"] = jurisdiction_zone

        user = UserManager.upsert_user(upsert_payload)

        from civic_connect.authentication import generate_jwt
        auth_token = generate_jwt(user)

        return Response({
            "message": "Authentication successful.",
            "token": auth_token,
            "user": UserProfileSerializer(user).data,
        }, status=status.HTTP_200_OK)

