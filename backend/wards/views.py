"""Views for Wards and Departments."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from wards.models import WardManager
from wards.routing import DEPARTMENTS
from wards.serializers import DepartmentSerializer, WardLeaderboardSerializer, WardSerializer


class WardListAPIView(APIView):
    """List all municipal wards."""

    def get(self, request, *args, **kwargs):
        wards = WardManager.list_all()
        serializer = WardSerializer(wards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DepartmentListAPIView(APIView):
    """List all municipal departments and categories handled."""

    def get(self, request, *args, **kwargs):
        serializer = DepartmentSerializer(DEPARTMENTS, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WardLeaderboardAPIView(APIView):
    """
    Municipal Ward Leaderboard.
    Computes total reports, resolution rate %, and average resolution hours.
    """

    def get(self, request, *args, **kwargs):
        leaderboard = WardManager.calculate_leaderboard()
        serializer = WardLeaderboardSerializer(leaderboard, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
