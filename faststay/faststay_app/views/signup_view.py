from django.http import JsonResponse
from django.views import View
from faststay_app.services.signup_service import DBService
from faststay_app.utils.signup_validator import validate_signup_data
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

@method_decorator(csrf_exempt, name='dispatch')
class SignupView(View):
    auth_service = DBService()

    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            data['age']= int(data['age'])

            is_valid, error = validate_signup_data(data)
            if not is_valid:
                return JsonResponse({'error': error}, status=400)

            email = data['email']
            password = data['password']
            fname = data['fname']
            lname = data['lname']
            usertype = data['usertype']
            gender = data['gender']
            city = data['city']
            age = int(data['age'])

            hashed_password = make_password(password)
            result_tuple = self.auth_service.register_user(
               "signup", [usertype, fname, lname, age, gender, city, email, hashed_password]
            )
            if not result_tuple:
                return JsonResponse({'error': 'Database returned no result'}, status=500)

            user_id = result_tuple[0]

            if user_id == 0:
                return JsonResponse({'error': 'Email already exists'}, status=400)
            elif user_id == -1:
                return JsonResponse({'error': 'Invalid input parameters sent to database'}, status=400)

            return JsonResponse({'message': 'User created successfully', 'user_id': user_id}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON input'}, status=400)
        except Exception as e:
            print(f"Signup view server error: {e}")
            return JsonResponse({'error': f'Internal Server Error: {str(e)}'}, status=500)
