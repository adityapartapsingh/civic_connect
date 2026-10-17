"""URLs for Users App."""

from django.urls import path
from users.views import UserProfileAPIView, UserSyncAPIView, VolunteersListAPIView

urlpatterns = [
    path("profile/", UserProfileAPIView.as_view(), name="user-profile"),
    path("sync/", UserSyncAPIView.as_view(), name="user-sync"),
    path("volunteers/", VolunteersListAPIView.as_view(), name="volunteers-list"),
]
