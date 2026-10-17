"""URLs for Wards App."""

from django.urls import path
from wards.views import DepartmentListAPIView, WardLeaderboardAPIView, WardListAPIView

urlpatterns = [
    path("", WardListAPIView.as_view(), name="ward-list"),
    path("departments/", DepartmentListAPIView.as_view(), name="department-list"),
    path("leaderboard/", WardLeaderboardAPIView.as_view(), name="ward-leaderboard"),
]
