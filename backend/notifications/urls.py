"""URLs for Notifications App."""

from django.urls import path
from notifications.views import (
    GenerateActionTokenAPIView,
    PublicUpdateAPIView,
    NotificationListAPIView,
    NotificationUnreadCountAPIView,
    NotificationMarkReadAPIView,
    NotificationMarkAllReadAPIView,
)

urlpatterns = [
    # Core In-App Notifications
    path("", NotificationListAPIView.as_view(), name="notification-list"),
    path("unread-count/", NotificationUnreadCountAPIView.as_view(), name="notification-unread-count"),
    path("<str:notification_id>/read/", NotificationMarkReadAPIView.as_view(), name="notification-mark-read"),
    path("mark-all-read/", NotificationMarkAllReadAPIView.as_view(), name="notification-mark-all-read"),

    # Secure Action Token & Public Endpoints
    path("public-update/<str:token>/", PublicUpdateAPIView.as_view(), name="public-update"),
    path("tokens/generate/", GenerateActionTokenAPIView.as_view(), name="generate-action-token"),
]
