from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from faststay_app.services import Update_Manager_Detail_Service
from faststay_app.serializers import Update_Manager_Details_Serializer
from cloudinary.uploader import upload, destroy
from rest_framework.parsers import MultiPartParser, FormParser

class Update_Manager_Details_view(APIView):
    parser_classes = [MultiPartParser, FormParser]

    """
    Update hostel manager Detail.

    POST:
    Accepts JSON:
    {
        "p_ManagerId": int,        # Required, must exist in Manager table
        "p_PhotoLink": str,        # Optional, URL/path to photo
        "p_PhoneNo": str,          # Required, 11-digit phone number
        "p_Education": str,        # Optional
        "p_ManagerType": str,      # Required, 'Owner' or 'Employee'
        "p_OperatingHours": int    # Required, 1–24
    }

    Returns:
    {
        "message": str,  # "Manager added successfully" or error message
        "result": bool   # True if added successfully, False otherwise
    }

    Notes:
    - Calls stored procedure `AddManagerDetails`.
    - Validates that `p_UserId` exists and is not already a student.
    - Returns 400 if input is invalid or constraints fail.
    - Returns 201 Created if successfully added.
    """

    @swagger_auto_schema(request_body=Update_Manager_Details_Serializer)
    def put(self, request):
        serializer = Update_Manager_Details_Serializer(data=request.data)

        # Validate Input
        if not serializer.is_valid():
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES.get("p_PhotoLink")
        photo_url = None
        public_id = None

        if file:
            try:
                upload_result = upload(file)
                photo_url = upload_result.get("secure_url")
                public_id = upload_result.get("public_id")
            except Exception as e:
                return Response({'error': f'Photo upload failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        validated_data = serializer.validated_data
        validated_data['p_PhotoLink'] = photo_url

        # Call service
        success, result = Update_Manager_Detail_Service(serializer.validated_data)

        # If service fails, delete uploaded photo
        if not success and public_id:
            try:
                destroy(public_id)
            except Exception as e:
                print(f"Failed to delete Cloudinary photo: {str(e)}")

        if not success:
            return Response({'error': result}, status=status.HTTP_400_BAD_REQUEST)

        # Success
        return Response({'message': result, 'result': success}, status=status.HTTP_200_OK)