"""
Unit Tests for Fraud Detection Pipeline.
"""

import io
import numpy as np
from PIL import Image
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from fraud.location import verify_location_integrity
from fraud.phash import compute_image_phash, hamming_distance
from fraud.recapture import detect_screen_recapture
from fraud.services import analyze_report_fraud


class FraudPipelineTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _create_sample_image(self, color=(100, 150, 200)) -> io.BytesIO:
        """Create a synthetic test image."""
        img = Image.new("RGB", (300, 300), color=color)
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)
        return buf

    def test_phash_computation_and_distance(self):
        buf1 = self._create_sample_image(color=(120, 120, 120))
        buf2 = self._create_sample_image(color=(120, 120, 120))
        buf3 = self._create_sample_image(color=(250, 10, 10))

        hash1 = compute_image_phash(buf1)
        hash2 = compute_image_phash(buf2)
        hash3 = compute_image_phash(buf3)

        self.assertTrue(len(hash1) > 0)
        # Identical images should have distance 0
        self.assertEqual(hamming_distance(hash1, hash2), 0)

    def test_location_integrity_mock_and_accuracy(self):
        # 1. Mock location detected
        is_susp, penalty, flags, details = verify_location_integrity(
            lat=12.9716, lng=77.5946, accuracy=10.0, is_mock=True
        )
        self.assertTrue(is_susp)
        self.assertIn("MOCK_PROVIDER_DETECTED", flags)

        # 2. 0.0m accuracy anomaly
        is_susp, penalty, flags, details = verify_location_integrity(
            lat=12.9716, lng=77.5946, accuracy=0.0, is_mock=False
        )
        self.assertIn("ZERO_GPS_ACCURACY_ANOMALY", flags)

        # 3. Legitimate location
        is_susp, penalty, flags, details = verify_location_integrity(
            lat=12.9716, lng=77.5946, accuracy=12.5, is_mock=False
        )
        self.assertFalse(is_susp)
        self.assertEqual(len(flags), 0)

    def test_screen_recapture_detection(self):
        # Test synthetic image analysis doesn't crash and returns valid score
        buf = self._create_sample_image()
        is_recapture, conf, details = detect_screen_recapture(buf)
        self.assertIsInstance(is_recapture, bool)
        self.assertGreaterEqual(conf, 0.0)
        self.assertLessEqual(conf, 1.0)
        self.assertIn("moire_peak_ratio", details)

    def test_fraud_service_orchestration(self):
        buf = self._create_sample_image()
        result = analyze_report_fraud(
            image_input=buf,
            lat=12.9716,
            lng=77.5946,
            accuracy=10.0,
            is_mock_location=False,
        )
        self.assertIn("risk_score", result)
        self.assertIn("is_flagged_fraud", result)
        self.assertIn("checks", result)
        self.assertFalse(result["is_flagged_fraud"])

    def test_fraud_check_api_endpoint(self):
        res = self.client.post("/api/fraud/check/", {
            "latitude": 12.9716,
            "longitude": 77.5946,
            "accuracy": 15.0,
            "is_mock_location": False,
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("risk_score", res.data)
        self.assertIn("is_flagged_fraud", res.data)
