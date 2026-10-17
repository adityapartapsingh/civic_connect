"""
URL configuration for Civic Connect project.

Exposes REST APIs for Reports, Users, Wards, Fraud, Gamification, and Public Action Updates.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.response import Response
from rest_framework.views import APIView
from civic_connect.mongo import is_mongo_connected
from notifications.views import PublicUpdateAPIView


class HealthCheckAPIView(APIView):
    """System health check endpoint."""

    def get(self, request, *args, **kwargs):
        mongo_ok = is_mongo_connected()
        return Response({
            "status": "healthy" if mongo_ok else "degraded",
            "service": "Civic Connect Backend MVP",
            "version": "1.0.0",
            "database": {
                "engine": "MongoDB",
                "connected": mongo_ok,
            },
        })


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckAPIView.as_view(), name="health-check"),

    # Direct no-login public action update route
    path("api/public-update/<str:token>/", PublicUpdateAPIView.as_view(), name="public-update-direct"),

    # Core Application APIs
    path("api/reports/", include("reports.urls")),
    path("api/users/", include("users.urls")),
    path("api/wards/", include("wards.urls")),
    path("api/fraud/", include("fraud.urls")),
    path("api/gamification/", include("gamification.urls")),
    path("api/notifications/", include("notifications.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
