"""Views for Gamification App."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from gamification.models import GamificationManager
from gamification.serializers import (
    GamificationLeaderboardEntrySerializer,
    GamificationSummarySerializer,
)


class UserGamificationAPIView(APIView):
    """Retrieve gamification profile, badges, and points ledger for a user."""

    def get(self, request, user_id: str, *args, **kwargs):
        summary = GamificationManager.get_user_summary(user_id)
        serializer = GamificationSummarySerializer(summary)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GamificationLeaderboardAPIView(APIView):
    """
    Retrieve ranked civic contributor leaderboard.
    Query params:
        - role: 'citizen', 'volunteer', or 'all'
        - limit: int (default: 50)
    """

    def get(self, request, *args, **kwargs):
        role_filter = request.query_params.get("role")
        try:
            limit = int(request.query_params.get("limit", 50))
        except ValueError:
            limit = 50

        leaderboard = GamificationManager.get_leaderboard(filter_role=role_filter, limit=limit)
        serializer = GamificationLeaderboardEntrySerializer(leaderboard, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
