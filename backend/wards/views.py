"""Views for Wards and Departments."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from wards.models import WardManager
from wards.routing import DEPARTMENTS
from wards.serializers import (
    DepartmentSerializer,
    WardCreateSerializer,
    WardLeaderboardSerializer,
    WardSerializer,
)


class WardListAPIView(APIView):
    """List all municipal wards or create a new ward (Super Admin only)."""

    def get(self, request, *args, **kwargs):
        wards = WardManager.list_all()
        serializer = WardSerializer(wards, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        from users.views import _require_super_admin
        is_allowed, auth_res = _require_super_admin(request)
        if not is_allowed:
            return auth_res

        serializer = WardCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            ward = WardManager.create_ward(serializer.validated_data)
            return Response(WardSerializer(ward).data, status=status.HTTP_201_CREATED)
        except ValueError as err:
            return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as err:
            return Response(
                {"detail": f"Failed to create ward: {str(err)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


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
