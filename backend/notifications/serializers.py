"""Serializers for Notifications and Public Update API."""

from rest_framework import serializers


class PublicUpdateStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=["IN_PROGRESS", "RESOLVED", "REJECTED"],
        required=True,
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    resolution_photo = serializers.ImageField(required=False, allow_null=True)
    resolution_photo_url = serializers.CharField(required=False, allow_blank=True)
    officer_name = serializers.CharField(required=False, default="Field Officer")


class ActionTokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    action_url = serializers.CharField()
    expires_at = serializers.CharField()
    report_id = serializers.CharField()
