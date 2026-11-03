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
    ward_name = serializers.CharField(required=False, allow_null=True)
    ward = serializers.CharField(required=False, allow_null=True)
    district = serializers.CharField(required=False, allow_null=True)
    state = serializers.CharField(required=False, allow_null=True)
    department_id = serializers.CharField(required=False, allow_null=True)
    department = serializers.CharField(required=False, allow_null=True)
    designation = serializers.CharField(required=False, allow_null=True)
    employee_id = serializers.CharField(required=False, allow_null=True)
    jurisdiction_zone = serializers.CharField(required=False, allow_null=True)
    assigned_tasks = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    created_by = serializers.CharField(required=False, allow_null=True)
    credential_code = serializers.CharField(required=False, allow_null=True)
    officers_count = serializers.IntegerField(required=False, default=0)
    reports_submitted_count = serializers.IntegerField(required=False, default=0)
    reports_resolved_count = serializers.IntegerField(required=False, default=0)
    upvotes_given_count = serializers.IntegerField(required=False, default=0)
    points = serializers.IntegerField(default=0, read_only=True)
    coins = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    badge = serializers.ChoiceField(choices=BadgeTier.CHOICES, default=BadgeTier.BRONZE, read_only=True)
    badges = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    is_active = serializers.BooleanField(default=True, read_only=True)

    def get_coins(self, obj):
        if isinstance(obj, dict):
            return obj.get("coins", obj.get("points", 50))
        return getattr(obj, "coins", getattr(obj, "points", 50))

    def get_level(self, obj):
        pts = obj.get("points", 0) if isinstance(obj, dict) else getattr(obj, "points", 0)
        return max(1, (pts // 60) + 1)

    def get_badges(self, obj):
        raw = obj.get("badges") if isinstance(obj, dict) else getattr(obj, "badges", None)
        if raw and isinstance(raw, list) and len(raw) > 0:
            return raw
        pts = obj.get("points", 0) if isinstance(obj, dict) else getattr(obj, "points", 0)
        resolved = obj.get("reports_resolved_count", 0) if isinstance(obj, dict) else getattr(obj, "reports_resolved_count", 0)
        submitted = obj.get("reports_submitted_count", 0) if isinstance(obj, dict) else getattr(obj, "reports_submitted_count", 0)
        return [
            {
                "id": "first_report",
                "name": "First Watchdog",
                "description": "Submitted your first verified municipal civic issue.",
                "icon": "Eye",
                "is_unlocked": bool(submitted > 0),
                "unlocked_at": "2026-03-15" if submitted > 0 else None,
                "points_reward": 50,
            },
            {
                "id": "verified_fix",
                "name": "Resolution Sentinel",
                "description": "Confirmed and verified an officer resolution in your ward.",
                "icon": "ShieldCheck",
                "is_unlocked": bool(resolved > 0),
                "unlocked_at": "2026-03-20" if resolved > 0 else None,
                "points_reward": 75,
            },
            {
                "id": "clean_streak",
                "name": "Neighborhood Champion",
                "description": "Reported 5 or more resolved neighborhood issues.",
                "icon": "CheckCircle2",
                "is_unlocked": bool(submitted >= 5),
                "unlocked_at": None,
                "points_reward": 150,
            },
            {
                "id": "civic_hero",
                "name": "Ward Pioneer",
                "description": "Earned over 200 civic points in your municipal ward.",
                "icon": "Trophy",
                "is_unlocked": bool(pts >= 200),
                "unlocked_at": None,
                "points_reward": 300,
            },
        ]

    def validate_phone(self, value):
        if not value:
            return value
        from users.validators import validate_indian_phone
        return validate_indian_phone(value)

    def validate_credential_code(self, value):
        if not value:
            return value
        from users.validators import validate_password_strength
        return validate_password_strength(value)


class UserSyncSerializer(serializers.Serializer):
    """Payload sent by frontend upon Firebase Auth authentication."""
    firebase_uid = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, default="Civic User")
    role = serializers.ChoiceField(choices=UserRole.CHOICES, default=UserRole.CITIZEN)
    volunteer_scheme = serializers.ChoiceField(choices=VolunteerScheme.CHOICES, default=VolunteerScheme.NONE)
    ward_id = serializers.CharField(required=False, allow_null=True)

    def validate_phone(self, value):
        if not value:
            return value
        from users.validators import validate_indian_phone
        return validate_indian_phone(value)

    def validate_credential_code(self, value):
        if not value:
            return value
        from users.validators import validate_password_strength
        return validate_password_strength(value)
