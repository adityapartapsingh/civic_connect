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


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField()
    recipient_id = serializers.CharField(allow_null=True, required=False)
    recipient_role = serializers.CharField()
    recipient_phone = serializers.CharField(allow_null=True, required=False)
    recipient_ward = serializers.CharField(allow_null=True, required=False)
    title = serializers.CharField()
    message = serializers.CharField()
    link = serializers.CharField(allow_blank=True, default="")
    type = serializers.CharField()
    report_id = serializers.CharField(allow_null=True, required=False)
    ticket_id = serializers.CharField(allow_null=True, required=False)
    is_read = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField()
