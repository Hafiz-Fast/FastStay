from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from faststay_app.services import Update_hostel_details_service
from faststay_app.serializers import Update_Hostel_Details_serializer
   
class Update_Hostel_Details_view(APIView):
    """
    Update existing hostel details for a manager.

    PUT:
    Accepts JSON:
    {
        "p_HostelId": int,           # Required, must exist in HHostel table
        "p_BlockNo": str,             # Optional
        "p_HouseNo": str,             # Optional
        "p_HostelType": str,          # Optional, 'Portion' or 'Building'
        "p_isParking": bool,          # Optional
        "p_NumRooms": int,            # Optional, >= 1
        "p_NumFloors": int,           # Optional, >= 1
        "p_WaterTimings": str,        # Optional, HH:MM:SS format
        "p_CleanlinessTenure": int,   # Optional, >= 1
        "p_IssueResolvingTenure": int,# Optional, >= 1
        "p_MessProvide": bool,        # Optional
        "p_GeezerFlag": bool          # Optional
        "p_Latitude": decimal
        "p_Longitude": decimal
    }

    Returns:
    {
        "message": str,   # "Data Updated Successfully" or error message
        "result": bool    # True if updated successfully, False otherwise
    }

    Notes:
    - Calls stored procedure `UpdateHostelDetails`.
    - Validates that `p_ManagerId` exists.
    - Returns 400 if input is invalid or manager does not exist.
    - Returns 201 Created if successfully updated.
    """


    @swagger_auto_schema(request_body=Update_Hostel_Details_serializer)
    def put(self, request):
        serializer = Update_Hostel_Details_serializer(data=request.data)

        #Validate Input
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        #call service
        success, result = Update_hostel_details_service(serializer.validated_data)
        if not success:
            return Response({'error': result}, status=status.HTTP_400_BAD_REQUEST)
        
        #success
        return Response({'message': 'Data Entered Successfully', 'result': success}, status=status.HTTP_201_CREATED)
    
    