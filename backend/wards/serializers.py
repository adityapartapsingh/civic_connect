"""Serializers for Wards and Departments."""

from rest_framework import serializers


class WardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    ward_number = serializers.CharField()
    name = serializers.CharField()
    zone = serializers.CharField()
    counselor_name = serializers.CharField(required=False, allow_blank=True, default="")
    contact_phone = serializers.CharField(required=False, allow_blank=True, default="")
    location = serializers.DictField(required=False)
    created_at = serializers.CharField(required=False)


class WardCreateSerializer(serializers.Serializer):
    ward_number = serializers.CharField(max_length=50)
    name = serializers.CharField(max_length=200)
    zone = serializers.CharField(max_length=100)
    counselor_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    contact_phone = serializers.CharField(max_length=30, required=False, allow_blank=True, default="")
    lat = serializers.FloatField(required=False, default=31.3260)
    lng = serializers.FloatField(required=False, default=75.5762)


class DepartmentSerializer(serializers.Serializer):
    code = serializers.CharField()
    name = serializers.CharField()
    categories = serializers.ListField(child=serializers.CharField())
    officer_email = serializers.EmailField()


class WardLeaderboardSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    ward_number = serializers.CharField()
    name = serializers.CharField()
    zone = serializers.CharField()
    total_reports = serializers.IntegerField()
    resolved_reports = serializers.IntegerField()
    pending_reports = serializers.IntegerField()
    resolution_rate_percent = serializers.FloatField()
    avg_resolution_hours = serializers.FloatField()
    performance_score = serializers.FloatField()
