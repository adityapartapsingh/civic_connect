"""URLs for Notifications App."""

from django.urls import path
from notifications.views import GenerateActionTokenAPIView, PublicUpdateAPIView

urlpatterns = [
    path("public-update/<str:token>/", PublicUpdateAPIView.as_view(), name="public-update"),
    path("tokens/generate/", GenerateActionTokenAPIView.as_view(), name="generate-action-token"),
]
