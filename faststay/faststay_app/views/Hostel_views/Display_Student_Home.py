from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from faststay_app.services.display_service.display_student_home import DetailStudentHome

@method_decorator(csrf_exempt, name='dispatch')
class DisplayStudentHomeView(View):
    def get(self, request, *args, **kwargs):
        hostel_service =  DetailStudentHome()
        try:
            hostels_list = hostel_service.detail_all_hostels()

            if hostels_list:
                return JsonResponse({
                    'hostels': hostels_list, 
                    'count': len(hostels_list)
                }, status=200)
            else:
                return JsonResponse({'hostels': [], 'count': 0, 'message': 'No hostels found'}, status=200)

        except Exception as e:
            print(f"Error fetching all hostels: {e}")
            return JsonResponse({'error': 'Internal server error while fetching hostels'}, status=500)