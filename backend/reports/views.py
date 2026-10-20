"""
API Views for Civic Reports.

Endpoints:
- POST /api/reports/
- GET  /api/reports/nearby/?lat=&lng=&category=&radius=
- GET  /api/reports/<id>/
- GET  /api/reports/ticket/<ticket_id>/
- GET  /api/reports/feed/?lat=&lng=&radius=
- GET  /api/reports/map/?north=&south=&east=&west=
- PATCH /api/reports/<id>/status/
- POST /api/reports/<id>/confirm/
- POST /api/reports/<id>/dispute/
- POST /api/reports/<id>/evidence/
- POST /api/reports/<id>/upvote/
"""

from __future__ import annotations

import datetime
from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from utils.cloudinary_service import upload_media
from civic_connect.mongo import get_collection, serialize_docs
from fraud.phash import compute_image_phash
from fraud.services import analyze_report_fraud
from reports.models import ReportManager, ReportStatus
from reports.serializers import (
    ReportConfirmSerializer,
    ReportCreateSerializer,
    ReportDetailSerializer,
    ReportDisputeSerializer,
    ReportEvidenceCreateSerializer,
    ReportMapPinSerializer,
    ReportStatusUpdateSerializer,
    ReportUpvoteCreateSerializer,
)


class ReportListCreateAPIView(APIView):
    """
    GET  /api/reports/ -> List recent reports (supports status & category filtering)
    POST /api/reports/ -> Submit new civic issue report with fraud verification
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, *args, **kwargs):
        status_param = request.query_params.get("status")
        category_param = request.query_params.get("category")
        priority_param = request.query_params.get("priority")
        ward_param = request.query_params.get("ward_id")
        reporter_id = request.query_params.get("reporter_id")
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        sort_by = request.query_params.get("sort_by", "newest")

        # Pagination params
        try:
            page = max(1, int(request.query_params.get("page", 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = min(50, max(1, int(request.query_params.get("page_size", 10))))
        except (ValueError, TypeError):
            page_size = 10

        query = {}
        if status_param and status_param != "all":
            query["status"] = status_param
        if category_param and category_param != "all":
            query["category"] = category_param.lower().strip()
        if priority_param and priority_param != "all":
            query["priority_level"] = priority_param.upper().strip()
        if ward_param and ward_param != "all":
            query["ward_id"] = ward_param
        if reporter_id:
            query["reporter_id"] = reporter_id

        # Date range filtering
        date_query = {}
        if date_from:
            try:
                date_query["$gte"] = datetime.datetime.fromisoformat(date_from.replace("Z", "+00:00"))
            except ValueError:
                pass
        if date_to:
            try:
                date_query["$lte"] = datetime.datetime.fromisoformat(date_to.replace("Z", "+00:00"))
            except ValueError:
                pass
        if date_query:
            query["created_at"] = date_query

        # Sort criteria
        sort_field = "created_at"
        sort_dir = -1
        if sort_by == "oldest":
            sort_field = "created_at"
            sort_dir = 1
        elif sort_by in ("priority_desc", "priority"):
            sort_field = "priority_score"
            sort_dir = -1
        elif sort_by == "priority_asc":
            sort_field = "priority_score"
            sort_dir = 1
        elif sort_by == "sla_urgency":
            sort_field = "sla_deadline"
            sort_dir = 1

        col = get_collection("reports")
        total_count = col.count_documents(query)
        skip = (page - 1) * page_size
        total_pages = max(1, (total_count + page_size - 1) // page_size)

        docs = col.find(query).sort(sort_field, sort_dir).skip(skip).limit(page_size)
        serialized_results = ReportDetailSerializer(serialize_docs(list(docs)), many=True).data

        return Response(
            {
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
                "results": serialized_results,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, *args, **kwargs):
        serializer = ReportCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        lat = data["latitude"]
        lng = data["longitude"]
        accuracy = data.get("accuracy", 15.0)
        is_mock = data.get("is_mock_location", False)
        
        # Attribute authenticated user or fallback to payload
        reporter_id = getattr(request.user, "user_id", None) or data.get("reporter_id")
        reporter_name = getattr(request.user, "name", None) or data.get("reporter_name", "Citizen")
        reporter_phone = getattr(request.user, "phone", None) or data.get("reporter_phone", "")

        photo_url = data.get("photo_url", "")
        photo_file = request.FILES.get("photo")
        photos_list = list(data.get("photos", []))

        # Handle photo file upload via Cloudinary (with local fallback)
        image_for_analysis = None
        if photo_file:
            uploaded_url, _ = upload_media(photo_file, folder="civic_connect/reports", request=request)
            photo_url = uploaded_url
            photos_list.insert(0, photo_url)
            image_for_analysis = photo_file
        elif photo_url and photo_url not in photos_list:
            photos_list.insert(0, photo_url)

        # Execute Fraud Detection Pipeline
        fraud_result = analyze_report_fraud(
            image_input=image_for_analysis,
            lat=lat,
            lng=lng,
            accuracy=accuracy,
            is_mock_location=is_mock,
            reporter_id=reporter_id,
        )

        create_payload = {
            "title": data.get("title"),
            "description": data["description"],
            "category": data["category"],
            "latitude": lat,
            "longitude": lng,
            "address": data.get("address", ""),
            "photos": photos_list,
            "primary_photo": photos_list[0] if photos_list else None,
            "phash": fraud_result.get("phash", ""),
            "reporter_id": reporter_id,
            "reporter_name": data.get("reporter_name", "Citizen"),
            "reporter_phone": data.get("reporter_phone", ""),
            "fraud_metadata": fraud_result,
            "is_flagged_fraud": fraud_result.get("is_flagged_fraud", False),
        }

        report_doc = ReportManager.create_report(create_payload)
        return Response(
            ReportDetailSerializer(report_doc).data,
            status=status.HTTP_201_CREATED,
        )


class NearbyReportsAPIView(APIView):
    """
    GET /api/reports/nearby/?lat=&lng=&category=&radius=
    Find reports within radius_meters using MongoDB 2dsphere index.
    """

    def get(self, request, *args, **kwargs):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")

        if lat is None or lng is None:
            return Response(
                {"detail": "Both 'lat' and 'lng' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            radius = float(request.query_params.get("radius", 5000))
        except ValueError:
            radius = 5000.0

        category = request.query_params.get("category")

        results = ReportManager.query_nearby(
            lat=float(lat),
            lng=float(lng),
            radius_meters=radius,
            category=category,
        )

        return Response(
            ReportDetailSerializer(results, many=True).data,
            status=status.HTTP_200_OK,
        )


class FeedReportsAPIView(APIView):
    """
    GET /api/reports/feed/?lat=&lng=&radius=
    Ranked feed of active reports (combines priority, upvotes, and proximity).
    """

    def get(self, request, *args, **kwargs):
        lat_param = request.query_params.get("lat")
        lng_param = request.query_params.get("lng")
        radius_param = request.query_params.get("radius", 10000)

        lat = float(lat_param) if lat_param is not None else None
        lng = float(lng_param) if lng_param is not None else None
        radius = float(radius_param)

        reports = ReportManager.query_feed(lat=lat, lng=lng, radius_meters=radius)
        return Response(
            ReportDetailSerializer(reports, many=True).data,
            status=status.HTTP_200_OK,
        )


class MapReportsAPIView(APIView):
    """
    GET /api/reports/map/?north=&south=&east=&west=
    Map bounding box query returning light pin objects.
    """

    def get(self, request, *args, **kwargs):
        north = request.query_params.get("north")
        south = request.query_params.get("south")
        east = request.query_params.get("east")
        west = request.query_params.get("west")

        if None in (north, south, east, west):
            return Response(
                {"detail": "Coordinates north, south, east, and west are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pins = ReportManager.query_map_bounding_box(
            north=float(north),
            south=float(south),
            east=float(east),
            west=float(west),
        )
        return Response(
            ReportMapPinSerializer(pins, many=True).data,
            status=status.HTTP_200_OK,
        )


class ReportDetailAPIView(APIView):
    """
    GET /api/reports/<id>/
    Fetch report by MongoDB _id or ticket_id.
    """

    def get(self, request, report_id: str, *args, **kwargs):
        report = ReportManager.get_by_id(report_id)
        if not report:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ReportDetailSerializer(report).data, status=status.HTTP_200_OK)


class ReportTicketAPIView(APIView):
    """
    GET /api/reports/ticket/<ticket_id>/
    Fetch report by human-readable ticket ID (e.g. CC-2026-00042).
    """

    def get(self, request, ticket_id: str, *args, **kwargs):
        report = ReportManager.get_by_ticket_id(ticket_id)
        if not report:
            return Response(
                {"detail": f"Report with ticket ID '{ticket_id}' not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ReportDetailSerializer(report).data, status=status.HTTP_200_OK)


class ReportStatusUpdateAPIView(APIView):
    """
    PATCH /api/reports/<id>/status/
    Update report status (e.g. IN_PROGRESS, RESOLVED, REJECTED) with notes & resolution photo.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request, report_id: str, *args, **kwargs):
        serializer = ReportStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        resolution_photo_url = data.get("resolution_photo_url", "")
        photo_file = request.FILES.get("resolution_photo")
        if photo_file:
            uploaded_url, _ = upload_media(photo_file, folder="civic_connect/resolutions", request=request)
            resolution_photo_url = uploaded_url

        officer_name = getattr(request.user, "name", None) or data.get("changed_by", "Officer")
        officer_role = getattr(request.user, "role", None) or data.get("role", "officer")

        updated = ReportManager.update_status(
            report_id=report_id,
            new_status=data["status"],
            changed_by=officer_name,
            role=officer_role,
            notes=data.get("notes", ""),
            resolution_photo=resolution_photo_url if resolution_photo_url else None,
        )

        if not updated:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(ReportDetailSerializer(updated).data, status=status.HTTP_200_OK)


class ReportConfirmAPIView(APIView):
    """
    POST /api/reports/<id>/confirm/
    Citizen confirms resolution -> awards +20 points, closes ticket.
    """

    def post(self, request, report_id: str, *args, **kwargs):
        serializer = ReportConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        citizen_id = getattr(request.user, "user_id", None) or data.get("citizen_id", "citizen")
        updated = ReportManager.confirm_resolution(
            report_id=report_id,
            citizen_id=citizen_id,
            notes=data.get("notes", "Citizen confirmed resolution."),
        )

        if not updated:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "message": "Resolution confirmed by citizen. Ticket closed (+20 pts awarded).",
            "report": ReportDetailSerializer(updated).data,
        }, status=status.HTTP_200_OK)


class ReportDisputeAPIView(APIView):
    """
    POST /api/reports/<id>/dispute/
    Citizen dispute -> auto-escalates to DISPUTED status with priority boost.
    """

    def post(self, request, report_id: str, *args, **kwargs):
        serializer = ReportDisputeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        updated = ReportManager.dispute_resolution(
            report_id=report_id,
            citizen_id=data.get("citizen_id", "citizen"),
            dispute_reason=data["dispute_reason"],
        )

        if not updated:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "message": "Resolution disputed by citizen. Ticket auto-escalated to DISPUTED.",
            "report": ReportDetailSerializer(updated).data,
        }, status=status.HTTP_200_OK)


class ReportEvidenceAPIView(APIView):
    """
    POST /api/reports/<id>/evidence/
    Add new corroborating photo with timestamp to an existing report.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, report_id: str, *args, **kwargs):
        serializer = ReportEvidenceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        photo_url = data.get("photo_url", "")
        photo_file = request.FILES.get("photo")

        phash_str = ""
        if photo_file:
            uploaded_url, _ = upload_media(photo_file, folder="civic_connect/evidence", request=request)
            photo_url = uploaded_url
            phash_str = compute_image_phash(photo_file)

        if not photo_url:
            return Response(
                {"detail": "A photo file or photo_url is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        updated = ReportManager.add_evidence(
            report_id=report_id,
            photo_url=photo_url,
            phash=phash_str,
            submitted_by=data.get("submitted_by", "citizen"),
            notes=data.get("notes", ""),
        )

        if not updated:
            return Response(
                {"detail": "Report not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "message": "Corroborating evidence added successfully (+5 pts).",
            "report": ReportDetailSerializer(updated).data,
        }, status=status.HTTP_201_CREATED)


class ReportUpvoteAPIView(APIView):
    """
    POST /api/reports/<id>/upvote/
    'I see this too' community corroboration with optional photo.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, report_id: str, *args, **kwargs):
        serializer = ReportUpvoteCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        photo_url = data.get("photo_url")
        photo_file = request.FILES.get("photo")

        if photo_file:
            uploaded_url, _ = upload_media(photo_file, folder="civic_connect/upvotes", request=request)
            photo_url = uploaded_url

        user_id = getattr(request.user, "user_id", None) or data.get("user_id")
        device_id = data.get("device_id") or request.META.get("HTTP_X_DEVICE_ID", "device_client")

        success, msg, updated = ReportManager.add_upvote(
            report_id=report_id,
            user_id=user_id,
            device_id=device_id,
            photo_url=photo_url,
        )

        if not success:
            return Response(
                {"detail": msg, "report": ReportDetailSerializer(updated).data if updated else None},
                status=status.HTTP_409_CONFLICT if "already upvoted" in msg else status.HTTP_404_NOT_FOUND,
            )

        return Response({
            "message": msg,
            "report": ReportDetailSerializer(updated).data,
        }, status=status.HTTP_200_OK)
