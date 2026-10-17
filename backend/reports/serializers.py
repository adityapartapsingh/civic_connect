"""
Serializers for Civic Reports API.
"""

from rest_framework import serializers
from reports.models import PriorityLevel, ReportStatus


class ReportCreateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=True)
    category = serializers.CharField(required=True)
    latitude = serializers.FloatField(required=True)
    longitude = serializers.FloatField(required=True)
    address = serializers.CharField(required=False, allow_blank=True, default="")
    photo = serializers.ImageField(required=False, allow_null=True)
    photo_url = serializers.CharField(required=False, allow_blank=True)
    photos = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    accuracy = serializers.FloatField(required=False, default=15.0)
    is_mock_location = serializers.BooleanField(required=False, default=False)
    reporter_id = serializers.CharField(required=False, allow_blank=True, default="anonymous")
    reporter_name = serializers.CharField(required=False, allow_blank=True, default="Citizen")
    reporter_phone = serializers.CharField(required=False, allow_blank=True, default="")


class StatusHistoryEntrySerializer(serializers.Serializer):
    status = serializers.CharField()
    changed_by = serializers.CharField()
    role = serializers.CharField(required=False, default="citizen")
    notes = serializers.CharField(required=False, allow_blank=True)
    timestamp = serializers.CharField()
    photo_url = serializers.CharField(required=False, allow_null=True)


class EvidenceEntrySerializer(serializers.Serializer):
    id = serializers.CharField()
    photo_url = serializers.CharField()
    phash = serializers.CharField(required=False, allow_blank=True)
    submitted_by = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)
    timestamp = serializers.CharField()


class ReportDetailSerializer(serializers.Serializer):
    id = serializers.CharField()
    ticket_id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    category = serializers.CharField()
    photos = serializers.ListField(child=serializers.CharField(), default=list)
    primary_photo = serializers.CharField(allow_null=True, required=False)
    phash = serializers.CharField(allow_blank=True, required=False)
    location = serializers.DictField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    address = serializers.CharField(allow_blank=True)
    ward_id = serializers.CharField()
    department_id = serializers.CharField()
    status = serializers.ChoiceField(choices=ReportStatus.CHOICES)
    priority_score = serializers.IntegerField()
    priority_level = serializers.ChoiceField(choices=PriorityLevel.CHOICES)
    priority_factors = serializers.DictField(required=False)
    reporter_id = serializers.CharField(required=False)
    reporter_name = serializers.CharField(required=False)
    upvote_count = serializers.IntegerField()
    status_history = StatusHistoryEntrySerializer(many=True, required=False, default=list)
    evidence = EvidenceEntrySerializer(many=True, required=False, default=list)
    is_flagged_fraud = serializers.BooleanField(default=False)
    fraud_metadata = serializers.DictField(required=False, default=dict)
    resolution_photo = serializers.CharField(allow_null=True, required=False)
    resolution_notes = serializers.CharField(allow_blank=True, required=False)
    resolved_at = serializers.CharField(allow_null=True, required=False)
    dispute_reason = serializers.CharField(allow_blank=True, required=False)
    disputed_at = serializers.CharField(allow_null=True, required=False)
    distance_meters = serializers.FloatField(required=False)
    created_at = serializers.CharField()
    updated_at = serializers.CharField()


class ReportStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ReportStatus.CHOICES, required=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    changed_by = serializers.CharField(required=False, default="Officer")
    role = serializers.CharField(required=False, default="officer")
    resolution_photo = serializers.ImageField(required=False, allow_null=True)
    resolution_photo_url = serializers.CharField(required=False, allow_blank=True)


class ReportConfirmSerializer(serializers.Serializer):
    citizen_id = serializers.CharField(required=False, default="citizen")
    notes = serializers.CharField(required=False, allow_blank=True, default="Citizen confirmed resolution.")


class ReportDisputeSerializer(serializers.Serializer):
    citizen_id = serializers.CharField(required=False, default="citizen")
    dispute_reason = serializers.CharField(required=True)


class ReportEvidenceCreateSerializer(serializers.Serializer):
    photo = serializers.ImageField(required=False, allow_null=True)
    photo_url = serializers.CharField(required=False, allow_blank=True)
    submitted_by = serializers.CharField(required=False, default="citizen")
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class ReportUpvoteCreateSerializer(serializers.Serializer):
    user_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    device_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    photo = serializers.ImageField(required=False, allow_null=True)
    photo_url = serializers.CharField(required=False, allow_blank=True)


class ReportMapPinSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    ticket_id = serializers.CharField()
    title = serializers.CharField()
    category = serializers.CharField()
    status = serializers.CharField()
    priority_level = serializers.CharField()
    priority_score = serializers.IntegerField()
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    primary_photo = serializers.CharField(allow_null=True, required=False)
    created_at = serializers.CharField()
