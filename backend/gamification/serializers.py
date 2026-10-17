"""Serializers for Gamification API."""

from rest_framework import serializers


class BadgeSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    tier = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    min_points = serializers.IntegerField()


class PointTransactionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField()
    action = serializers.CharField()
    base_points = serializers.IntegerField()
    multiplier = serializers.FloatField()
    points_awarded = serializers.IntegerField()
    report_id = serializers.CharField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.CharField()


class GamificationSummarySerializer(serializers.Serializer):
    user_id = serializers.CharField()
    name = serializers.CharField()
    role = serializers.CharField()
    volunteer_scheme = serializers.CharField()
    points = serializers.IntegerField()
    badge = serializers.CharField()
    unlocked_badges = BadgeSerializer(many=True)
    transactions = PointTransactionSerializer(many=True)


class GamificationLeaderboardEntrySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    id = serializers.CharField(required=False)
    name = serializers.CharField()
    role = serializers.CharField()
    volunteer_scheme = serializers.CharField()
    points = serializers.IntegerField()
    badge = serializers.CharField()
    ward_id = serializers.CharField(required=False, allow_null=True)
