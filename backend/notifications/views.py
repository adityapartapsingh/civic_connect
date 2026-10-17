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

        # Handle resolution photo upload
        resolution_photo_url = data.get("resolution_photo_url", "")
        photo_file = request.FILES.get("resolution_photo")
        if photo_file:
            timestamp_prefix = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"resolution_{timestamp_prefix}_{photo_file.name}"
            save_path = default_storage.save(f"resolutions/{filename}", photo_file)
            resolution_photo_url = request.build_absolute_uri(settings.MEDIA_URL + save_path)

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
