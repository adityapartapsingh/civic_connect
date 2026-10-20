from django.urls import path
from users.views import (
    SendOTPAPIView,
    UserProfileAPIView,
    UserSyncAPIView,
    VerifyOTPAPIView,
    VolunteersListAPIView,
)

urlpatterns = [
    path("profile/", UserProfileAPIView.as_view(), name="user-profile"),
    path("sync/", UserSyncAPIView.as_view(), name="user-sync"),
    path("volunteers/", VolunteersListAPIView.as_view(), name="volunteers-list"),
    path("send-otp/", SendOTPAPIView.as_view(), name="user-send-otp"),
    path("verify-otp/", VerifyOTPAPIView.as_view(), name="user-verify-otp"),
]
