"""
Views for Notifications and Secure No-Login Action Updates.
"""

from __future__ import annotations

import datetime
import os
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from civic_connect.mongo import get_collection, parse_object_id, serialize_doc
from notifications.serializers import PublicUpdateStatusSerializer
from notifications.tokens import generate_action_token, record_token_usage, verify_action_token
from utils.cloudinary_service import upload_media


class PublicUpdateAPIView(APIView):
    """
    Public Endpoint for Field Officers to view and update report status
    without requiring a full portal login, authenticated by cryptographic Action Token.

    GET  /api/public-update/<token>/ -> Fetch report summary
    POST /api/public-update/<token>/ -> Update status (IN_PROGRESS, RESOLVED, REJECTED)
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, token: str, *args, **kwargs):
        is_valid, payload, error_msg = verify_action_token(token)
        if not is_valid or not payload:
            return Response(
                {"detail": error_msg or "Invalid action token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        report_id = payload.get("report_id")
        reports_col = get_collection("reports")

        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}
        doc = reports_col.find_one(query)

        if not doc:
            return Response(
                {"detail": "Report associated with this token was not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "token_valid": True,
            "officer_email": payload.get("officer_email"),
            "report": serialize_doc(doc),
        }, status=status.HTTP_200_OK)

    def post(self, request, token: str, *args, **kwargs):
        is_valid, payload, error_msg = verify_action_token(token)
        if not is_valid or not payload:
            return Response(
                {"detail": error_msg or "Invalid action token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = PublicUpdateStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        new_status = data.get("status")
        notes = data.get("notes", "")
        officer_name = data.get("officer_name") or payload.get("officer_email", "Field Officer")

        # Handle resolution photo upload via Cloudinary (with local fallback)
        resolution_photo_url = data.get("resolution_photo_url", "")
        photo_file = request.FILES.get("resolution_photo")
        if photo_file:
            uploaded_url, _ = upload_media(photo_file, folder="civic_connect/resolutions", request=request)
            resolution_photo_url = uploaded_url

        now = datetime.datetime.now(datetime.timezone.utc)
        status_entry = {
            "status": new_status,
            "changed_by": officer_name,
            "role": "officer",
            "notes": notes,
            "timestamp": now.isoformat(),
            "photo_url": resolution_photo_url if resolution_photo_url else None,
        }

        update_fields = {
            "status": new_status,
            "updated_at": now,
        }
        if notes:
            update_fields["resolution_notes"] = notes
        if resolution_photo_url:
            update_fields["resolution_photo"] = resolution_photo_url
        if new_status == "RESOLVED":
            update_fields["resolved_at"] = now

        report_id = payload.get("report_id")
        reports_col = get_collection("reports")
        oid = parse_object_id(report_id)
        query = {"$or": [{"_id": oid}, {"ticket_id": report_id}]} if oid else {"ticket_id": report_id}

        updated_doc = reports_col.find_one_and_update(
            query,
            {
                "$set": update_fields,
                "$push": {"status_history": status_entry},
            },
            return_document=True,
        )

        if not updated_doc:
            return Response(
                {"detail": "Failed to update report: document not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        record_token_usage(token)

        return Response({
            "message": f"Report successfully updated to {new_status}.",
            "report": serialize_doc(updated_doc),
        }, status=status.HTTP_200_OK)


class GenerateActionTokenAPIView(APIView):
    """Internal/Admin API to generate an action token for an officer."""

    def post(self, request, *args, **kwargs):
        report_id = request.data.get("report_id")
        officer_email = request.data.get("officer_email", "field.officer@civicconnect.gov")
        expiry_days = request.data.get("expiry_days", 7)

        if not report_id:
            return Response(
                {"detail": "report_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = generate_action_token(
            report_id=report_id,
            officer_email=officer_email,
            expiry_days=expiry_days,
        )
        action_url = request.build_absolute_uri(f"/api/public-update/{token}/")

        return Response({
            "token": token,
            "action_url": action_url,
            "report_id": report_id,
            "officer_email": officer_email,
        }, status=status.HTTP_201_CREATED)


from civic_connect.authentication import IsAuthenticatedCivicUser
from notifications.models import NotificationManager
from notifications.serializers import NotificationSerializer


class NotificationListAPIView(APIView):
    """
    GET /api/notifications/
    Lists in-app notifications for the authenticated user session.
    Supports query parameter ?unread_only=true and ?limit=40.
    """
    permission_classes = [IsAuthenticatedCivicUser]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_id = getattr(user, "user_id", None) or getattr(user, "id", None)
        phone = getattr(user, "phone", None)
        role = getattr(user, "role", "citizen")
        ward_id = getattr(user, "ward_id", None)

        unread_only = request.query_params.get("unread_only", "").lower() in ("true", "1")
        try:
            limit = int(request.query_params.get("limit", 40))
        except (ValueError, TypeError):
            limit = 40

        items = NotificationManager.list_for_user(
            user_id=user_id,
            phone=phone,
            role=role,
            ward_id=ward_id,
            limit=limit,
            only_unread=unread_only,
        )
        unread_count = NotificationManager.get_unread_count(
            user_id=user_id,
            phone=phone,
            role=role,
            ward_id=ward_id,
        )

        return Response({
            "results": items,
            "unread_count": unread_count,
        }, status=status.HTTP_200_OK)


class NotificationUnreadCountAPIView(APIView):
    """
    GET /api/notifications/unread-count/
    Returns fast unread count for navbar notification bell badge.
    """
    permission_classes = [IsAuthenticatedCivicUser]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_id = getattr(user, "user_id", None) or getattr(user, "id", None)
        phone = getattr(user, "phone", None)
        role = getattr(user, "role", "citizen")
        ward_id = getattr(user, "ward_id", None)

        unread_count = NotificationManager.get_unread_count(
            user_id=user_id,
            phone=phone,
            role=role,
            ward_id=ward_id,
        )
        return Response({"unread_count": unread_count}, status=status.HTTP_200_OK)


class NotificationMarkReadAPIView(APIView):
    """
    POST /api/notifications/<id>/read/
    Marks a single notification as read.
    """
    permission_classes = [IsAuthenticatedCivicUser]

    def post(self, request, notification_id: str, *args, **kwargs):
        user = request.user
        user_id = getattr(user, "user_id", None) or getattr(user, "id", None)

        success = NotificationManager.mark_as_read(notification_id=notification_id, user_id=user_id)
        return Response({"success": success, "notification_id": notification_id}, status=status.HTTP_200_OK)


class NotificationMarkAllReadAPIView(APIView):
    """
    POST /api/notifications/mark-all-read/
    Marks all notifications for current user as read.
    """
    permission_classes = [IsAuthenticatedCivicUser]

    def post(self, request, *args, **kwargs):
        user = request.user
        user_id = getattr(user, "user_id", None) or getattr(user, "id", None)
        phone = getattr(user, "phone", None)
        role = getattr(user, "role", "citizen")
        ward_id = getattr(user, "ward_id", None)

        marked = NotificationManager.mark_all_as_read(
            user_id=user_id,
            phone=phone,
            role=role,
            ward_id=ward_id,
        )
        return Response({"success": True, "marked_count": marked}, status=status.HTTP_200_OK)
