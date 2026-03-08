from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from faststay_app.services import Display_Hostel_service
from faststay_app.serializers import Display_Hostel_serializer

class Display_Hostel_View(APIView):
    """
    Summary: Retrieve detailed information of a specific hostel.

    POST:
    Accepts JSON:
    {
        "p_HostelId": int   # Required, ID of the hostel to display
    }

    Returns:
    {
        "success": bool,    # True if hostel details retrieved successfully, False otherwise
        "result": {
            "p_BlockNo": str,
            "p_HouseNo": str,
            "p_HostelType": str,
            "p_isParking": bool,
            "p_NumRooms": int,
            "p_NumFloors": int,
            "p_WaterTimings": int,
            "p_CleanlinessTenure": int,
            "p_IssueResolvingTenure": int,
            "p_MessProvide": bool,
            "p_GeezerFlag": bool,
            "p_name": str
            "p_Latitude": decimal
            "p_Longitude": decimal
        }
    }

    Notes:
    - Calls stored procedure `DisplayHostel`.
    - Returns full details of a hostel identified by `p_HostelId`.
    - API response:
        * 200 OK with hostel details if successful
        * 400 Bad Request if any error occurs
    """
    
    @swagger_auto_schema(request_body=Display_Hostel_serializer)
    def post(self, request):
        serializer = Display_Hostel_serializer(data=request.data)

        #Validate Input
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        #call service
        success, result = Display_Hostel_service(serializer.validated_data)
        if not success:
            return Response({'error': result}, status=status.HTTP_400_BAD_REQUEST)
        
        #success
        return Response({'success': success, "result": result}, status=status.HTTP_200_OK)
