"""Views for Fraud Detection API."""

from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from fraud.serializers import FraudCheckRequestSerializer, FraudCheckResponseSerializer
from fraud.services import analyze_report_fraud


class FraudCheckAPIView(APIView):
    """
    API View to run standalone fraud verification on photo, location, and mock flags.
    """
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        serializer = FraudCheckRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        photo = data.get("photo")
        lat = data.get("latitude")
        lng = data.get("longitude")
        accuracy = data.get("accuracy")
        is_mock = data.get("is_mock_location", False)
        reporter_id = data.get("reporter_id")

        result = analyze_report_fraud(
            image_input=photo,
            lat=lat,
            lng=lng,
            accuracy=accuracy,
            is_mock_location=is_mock,
            reporter_id=reporter_id,
        )

        resp_serializer = FraudCheckResponseSerializer(result)
        return Response(resp_serializer.data, status=status.HTTP_200_OK)
