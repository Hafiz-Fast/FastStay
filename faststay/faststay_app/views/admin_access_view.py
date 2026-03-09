from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import json
import threading
from datetime import datetime, timedelta

# Shared rate-limit store with the login view
_admin_attempts = {}
_lock = threading.Lock()
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def _is_locked_out(ip):
    with _lock:
        entry = _admin_attempts.get(ip)
        if not entry:
            return False
        lockout_until = entry.get('lockout_until')
        if lockout_until and datetime.now() < lockout_until:
            return True
        if lockout_until:
            _admin_attempts[ip] = {'count': 0, 'lockout_until': None}
        return False


def _record_failure(ip):
    with _lock:
        if ip not in _admin_attempts:
            _admin_attempts[ip] = {'count': 0, 'lockout_until': None}
        _admin_attempts[ip]['count'] += 1
        if _admin_attempts[ip]['count'] >= MAX_ATTEMPTS:
            _admin_attempts[ip]['lockout_until'] = datetime.now() + timedelta(minutes=LOCKOUT_MINUTES)


def _reset_attempts(ip):
    with _lock:
        _admin_attempts.pop(ip, None)


@method_decorator(csrf_exempt, name='dispatch')
class AdminAccessView(View):
    def post(self, request, *args, **kwargs):
        ip = _get_client_ip(request)

        if _is_locked_out(ip):
            return JsonResponse(
                {'error': f'Too many failed attempts. Try again in {LOCKOUT_MINUTES} minutes.'},
                status=429
            )

        try:
            data = json.loads(request.body)
            admin_secret = data.get('admin_secret', '').strip()

            if not admin_secret:
                return JsonResponse({'error': 'Access code is required'}, status=400)

            expected = getattr(settings, 'ADMIN_SECRET_KEY', '')
            if admin_secret != expected:
                _record_failure(ip)
                return JsonResponse({'error': 'Invalid admin access code'}, status=401)

            _reset_attempts(ip)
            return JsonResponse({'success': True}, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON input'}, status=400)
        except Exception as e:
            print(f"Admin access view error: {e}")
            return JsonResponse({'error': 'Internal Server Error'}, status=500)
