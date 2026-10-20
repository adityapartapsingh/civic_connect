"""Serializers for Users API."""

from rest_framework import serializers
from users.models import BadgeTier, UserRole, VolunteerScheme


class UserProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, default="Civic User")
    role = serializers.ChoiceField(choices=UserRole.CHOICES, default=UserRole.CITIZEN)
    volunteer_scheme = serializers.ChoiceField(
        choices=VolunteerScheme.CHOICES,
        default=VolunteerScheme.NONE,
    )
    ward_id = serializers.CharField(required=False, allow_null=True)
    department_id = serializers.CharField(required=False, allow_null=True)
    department = serializers.CharField(required=False, allow_null=True)
    designation = serializers.CharField(required=False, allow_null=True)
    employee_id = serializers.CharField(required=False, allow_null=True)
    jurisdiction_zone = serializers.CharField(required=False, allow_null=True)
    points = serializers.IntegerField(default=0, read_only=True)
    level = serializers.SerializerMethodField()
    badge = serializers.ChoiceField(choices=BadgeTier.CHOICES, default=BadgeTier.BRONZE, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    is_active = serializers.BooleanField(default=True, read_only=True)

    def get_level(self, obj):
        pts = obj.get("points", 0) if isinstance(obj, dict) else getattr(obj, "points", 0)
        return max(1, (pts // 60) + 1)


class UserSyncSerializer(serializers.Serializer):
    """Payload sent by frontend upon Firebase Auth authentication."""
    firebase_uid = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, default="Civic User")
    role = serializers.ChoiceField(choices=UserRole.CHOICES, default=UserRole.CITIZEN)
    volunteer_scheme = serializers.ChoiceField(choices=VolunteerScheme.CHOICES, default=VolunteerScheme.NONE)
    ward_id = serializers.CharField(required=False, allow_null=True)
