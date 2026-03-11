from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from faststay_app.services.Student_Services.Delete_Student_service import Delete_Student_service
from faststay_app.serializers.Student_Serializers.Delete_Student_Serializer import Delete_Student_Serializer

class Delete_Student_View(APIView):
    def post(self, request, *args, **kwargs):
        serializer = Delete_Student_Serializer(data=request.data)

        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result, message = Delete_Student_service(serializer.validated_data)

        if result is True:
            return Response({'message': message}, status=status.HTTP_200_OK)
        elif result is False:
            return Response({'error': message}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
