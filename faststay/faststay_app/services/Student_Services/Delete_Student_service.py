from django.db import connection

def Delete_Student_service(data):
    function_name = "DeleteStudent"

    try:
        params = [
            data['p_StudentId'],
        ]

        with connection.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(params))
            query = f"SELECT * FROM {function_name}({placeholders})"
            cursor.execute(query, params)
            result = cursor.fetchone()

            if not result:
                return False, 'Database returned no result'

            deleted = result[0]

            if deleted is True:
                return True, 'Student deleted successfully'
            else:
                return False, 'Student not found or could not be deleted'

    except Exception as e:
        print(f"DB error during DeleteStudent: {e}")
        return None, 'Database error during deletion'
