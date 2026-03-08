from django.db import connection

def Add_hostel_details_service(data):
    try:
        function_name = 'AddHostelDetails'
        params = [
            data['p_ManagerId'],
            data['p_BlockNo'],
            data['p_HouseNo'],
            data['p_HostelType'],
            data['p_isParking'],
            data['p_NumRooms'],
            data['p_NumFloors'],
            data['p_WaterTimings'],
            data['p_CleanlinessTenure'],
            data['p_IssueResolvingTenure'],
            data['p_MessProvide'],
            data['p_GeezerFlag'],
            data['p_name'],
            data['p_Latitude'],
            data['p_Longitude']
        ]
        with connection.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(params))
            query = f"SELECT * FROM {function_name}({placeholders})"
            cursor.execute(query, params)
            result = cursor.fetchone()

        if not result:
            return False, 'Database Returned no values.', None
        if not result[0]:
            return False, "Operation failed. Check Manager ID or data.", None
        return True, "Operation successful.", result[0]
    
    except KeyError as e:
        return False, f'Missing field: {str(e)}', None 
    
    except Exception as e:
        print(f"DB Error in {function_name}: {e}")
        return False, str(e), None