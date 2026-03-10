from django.conf import settings
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from faststay_app.services.disapprove_hostel_service import DisapproveHostelService
import json
import secrets


@method_decorator(csrf_exempt, name='dispatch')
class DisapproveHostelView(View):
    hostel_service = DisapproveHostelService()

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            hostel_id_raw = data.get("p_HostelId", data.get("p_hostelid"))
            admin_secret = data.get("admin_secret", "").strip()

            if hostel_id_raw is None:
                return JsonResponse({"error": "Missing required field: p_HostelId"}, status=400)

            if not admin_secret:
                return JsonResponse({"error": "Admin access code is required"}, status=401)

            expected_secret = getattr(settings, "ADMIN_SECRET_KEY", "")
            if not secrets.compare_digest(admin_secret, expected_secret):
                return JsonResponse({"error": "Invalid admin access code"}, status=401)

            try:
                hostel_id = int(hostel_id_raw)
            except (TypeError, ValueError):
                return JsonResponse({"error": "HostelId must be a valid integer"}, status=400)

            result = self.hostel_service.disapprove_hostel(hostel_id)

            if result == 1:
                return JsonResponse({"success": True, "message": f"Hostel ID {hostel_id} disapproved successfully"}, status=200)
            if result == -1:
                return JsonResponse({"error": f"Hostel ID {hostel_id} not found"}, status=404)

            return JsonResponse({"error": "Database system error during disapproval"}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON input"}, status=400)
        except Exception as e:
            print(f"Error disapproving hostel: {e}")
            return JsonResponse({"error": "Internal server error"}, status=500)
