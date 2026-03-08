from django.http import JsonResponse
from django.views import View
from faststay_app.services.display_service.room_pic import RoomPic
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RoomPicView(View):
    hostel_service = RoomPic()

    def get(self, request, *args, **kwargs):
        # Use query parameters instead of request body for GET
        
        hostel_id_str = request.GET.get("p_HostelId")
        
        if not hostel_id_str:
            return JsonResponse({'error': 'Missing required query parameter: p_HostelId'}, status=400)
            
        try:
            hostel_id = int(hostel_id_str)
        except ValueError:
            return JsonResponse({'error': 'hostel_id must be a valid integer'}, status=400)

        try:
            info_list = self.hostel_service.room_pic(hostel_id)
            if info_list:
                return JsonResponse(info_list, safe=False, status=200)
            else:
                return JsonResponse([], safe=False, status=200)  # Return empty array instead of error
                
        except Exception as e:
            print(f"Error fetching room pics: {e}")
            return JsonResponse({'error': 'Internal server error while fetching details'}, status=500)