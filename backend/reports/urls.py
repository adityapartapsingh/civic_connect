"""
URLs for Reports App.
"""

from django.urls import path
from reports.views import (
    FeedReportsAPIView,
    MapReportsAPIView,
    NearbyReportsAPIView,
    ReportConfirmAPIView,
    ReportDetailAPIView,
    ReportDisputeAPIView,
    ReportEvidenceAPIView,
    ReportListCreateAPIView,
    ReportStatusUpdateAPIView,
    ReportTicketAPIView,
    ReportUpvoteAPIView,
)

urlpatterns = [
    # Collection queries & creation
    path("", ReportListCreateAPIView.as_view(), name="report-list-create"),
    path("nearby/", NearbyReportsAPIView.as_view(), name="report-nearby"),
    path("feed/", FeedReportsAPIView.as_view(), name="report-feed"),
    path("map/", MapReportsAPIView.as_view(), name="report-map"),

    # Single item by ticket ID
    path("ticket/<str:ticket_id>/", ReportTicketAPIView.as_view(), name="report-by-ticket"),

    # Single item lifecycle actions by ID (or ticket_id)
    path("<str:report_id>/", ReportDetailAPIView.as_view(), name="report-detail"),
    path("<str:report_id>/status/", ReportStatusUpdateAPIView.as_view(), name="report-status-update"),
    path("<str:report_id>/confirm/", ReportConfirmAPIView.as_view(), name="report-confirm"),
    path("<str:report_id>/dispute/", ReportDisputeAPIView.as_view(), name="report-dispute"),
    path("<str:report_id>/evidence/", ReportEvidenceAPIView.as_view(), name="report-evidence"),
    path("<str:report_id>/upvote/", ReportUpvoteAPIView.as_view(), name="report-upvote"),
]
