"""Serializers for Fraud Detection API."""

from rest_framework import serializers


class FraudCheckRequestSerializer(serializers.Serializer):
    photo = serializers.ImageField(required=False)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    accuracy = serializers.FloatField(required=False, default=10.0)
    is_mock_location = serializers.BooleanField(required=False, default=False)
    reporter_id = serializers.CharField(required=False, allow_blank=True)


class FraudCheckResponseSerializer(serializers.Serializer):
    is_flagged_fraud = serializers.BooleanField()
    risk_score = serializers.FloatField()
    phash = serializers.CharField(allow_blank=True)
    flags = serializers.ListField(child=serializers.CharField())
    threshold = serializers.FloatField()
    checks = serializers.DictField()
