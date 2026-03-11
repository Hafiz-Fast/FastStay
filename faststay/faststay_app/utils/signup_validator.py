import re

def validate_email(email: str) -> bool:
    """Check if email is valid format."""
    regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$'
    return re.fullmatch(regex, email) is not None

def validate_password(password: str) -> bool:
    """Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char."""
    if len(password) < 8:
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[^a-zA-Z0-9]', password):
        return False
    return True


def validate_name(name: str) -> bool:
    """Name: letters, spaces, hyphen allowed."""
    pattern = r'^[A-Za-z\s-]{2,50}$'
    return re.fullmatch(pattern, name) is not None

def validate_age(age: int) -> bool:
    """Age: 18-120"""
    return 18 <= age <= 120


def validate_signup_data(data: dict):
    required_fields = ['email', 'password', 'fname', 'lname', 'usertype', 'gender', 'city', 'age']

    for field in required_fields:
        if field not in data or data[field] in [None, ""]:
            return False, f"Missing field: {field}"

    if not validate_email(data['email']):
        return False, "Invalid email format"

    if not validate_password(data['password']):
        return False, ("Password must be at least 8 characters, contain 1 uppercase, "
                       "1 lowercase, 1 number, and 1 special character")

    if not validate_name(data['fname']):
        return False, "Invalid first name format"
    if not validate_name(data['lname']):
        return False, "Invalid last name format"

    if not validate_age(data['age']):
        return False, "Age must be between 18 and 120"

    return True, None
