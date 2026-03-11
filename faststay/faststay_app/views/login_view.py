from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import json
import threading
from datetime import datetime, timedelta
from faststay_app.services.login_user_service import login_user_service
from faststay_app.utils.login_validator import validate_login_data

# ---- Brute-force rate limiting ----
_login_attempts = {}   # { ip: {"count": int, "lockout_until": datetime | None} }
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
        entry = _login_attempts.get(ip)
        if not entry:
            return False
        lockout_until = entry.get('lockout_until')
        if lockout_until:
            if datetime.now() < lockout_until:
                return True
            # Lockout expired — reset
            _login_attempts[ip] = {'count': 0, 'lockout_until': None}
        return False


def _record_failure(ip):
    with _lock:
        if ip not in _login_attempts:
            _login_attempts[ip] = {'count': 0, 'lockout_until': None}
        _login_attempts[ip]['count'] += 1
        if _login_attempts[ip]['count'] >= MAX_ATTEMPTS:
            _login_attempts[ip]['lockout_until'] = datetime.now() + timedelta(minutes=LOCKOUT_MINUTES)


def _reset_attempts(ip):
    with _lock:
        _login_attempts.pop(ip, None)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    auth_service = login_user_service()

    def post(self, request, *args, **kwargs):
        ip = _get_client_ip(request)

        if _is_locked_out(ip):
            return JsonResponse(
                {'error': f'Too many failed attempts. Please try again in {LOCKOUT_MINUTES} minutes.'},
                status=429
            )

        try:
            data = json.loads(request.body)
            is_valid, error = validate_login_data(data)
            if not is_valid:
                return JsonResponse({'error': error}, status=400)

            email = data.get('email')
            password = data.get('password')
            admin_secret = data.get('admin_secret', '').strip()

            user_data = self.auth_service.authenticate_user(email, password)
            if user_data is None:
                _record_failure(ip)
                return JsonResponse({'error': 'Invalid email or password'}, status=401)

            user_id, usertype = user_data

            # Admin portal requires a secondary secret key
            if usertype == 'Admin':
                expected_secret = getattr(settings, 'ADMIN_SECRET_KEY', '')
                if not admin_secret or admin_secret != expected_secret:
                    _record_failure(ip)
                    return JsonResponse({'error': 'Invalid admin access code'}, status=401)

            _reset_attempts(ip)
            return JsonResponse({
                'message': 'Login successful',
                'user_id': user_id,
                'usertype': usertype
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON input'}, status=400)
        except Exception as e:
            print(f"Login view server error: {e}")
            return JsonResponse({'error': 'Internal Server Error'}, status=500)