"""Views for Users App."""

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
