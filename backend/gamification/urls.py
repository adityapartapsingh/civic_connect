"""URLs for Gamification App."""

from django.urls import path
from gamification.views import GamificationLeaderboardAPIView, UserGamificationAPIView

urlpatterns = [
    path("leaderboard/", GamificationLeaderboardAPIView.as_view(), name="gamification-leaderboard"),
    path("user/<str:user_id>/", UserGamificationAPIView.as_view(), name="user-gamification"),
]
