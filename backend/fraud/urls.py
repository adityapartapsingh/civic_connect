"""URLs for Fraud Detection App."""

from django.urls import path
from fraud.views import FraudCheckAPIView

urlpatterns = [
    path("check/", FraudCheckAPIView.as_view(), name="fraud-check"),
]
