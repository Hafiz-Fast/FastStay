from django.db import connection
from django.contrib.auth.hashers import check_password, make_password


class login_user_service:

    def authenticate_user(self, email: str, password: str):
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT L.loginid, L.password, U.userid, U.usertype
                    FROM logininfo L
                    JOIN users U ON U.loginid = L.loginid
                    WHERE L.email = %s
                    """,
                    [email]
                )
                row = cursor.fetchone()

            if not row:
                return None

            loginid, stored_password, user_id, usertype = row

            # Primary check: bcrypt/PBKDF2 hashed password
            if check_password(password, stored_password):
                return (user_id, usertype)

            # Fallback: plain-text match for existing accounts (transparent migration)
            if password == stored_password:
                self._rehash_password(loginid, password)
                return (user_id, usertype)

            return None

        except Exception as e:
            print(f"DB error in authenticate_user: {e}")
            return None

    def _rehash_password(self, loginid: int, plain_password: str):
        """Upgrade a plain-text password to a secure hash in-place."""
        try:
            hashed = make_password(plain_password)
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE logininfo SET password = %s WHERE loginid = %s",
                    [hashed, loginid]
                )
        except Exception as e:
            print(f"Failed to rehash password for loginid {loginid}: {e}")