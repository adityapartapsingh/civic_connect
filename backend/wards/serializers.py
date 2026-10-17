"""Serializers for Wards and Departments."""

from rest_framework import serializers


class WardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    ward_number = serializers.CharField()
    name = serializers.CharField()
    zone = serializers.CharField()
    counselor_name = serializers.CharField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)
    location = serializers.DictField(required=False)


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
