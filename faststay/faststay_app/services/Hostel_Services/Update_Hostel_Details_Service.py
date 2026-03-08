from django.db import connection

def Update_hostel_details_service(data):
    try:
        function_name = 'UpdateHostelDetails'
        params = [
            data.get('p_HostelId'),                # required (if required, validate earlier)
            data.get('p_BlockNo', None),
            data.get('p_HouseNo', None),
            data.get('p_HostelType', None),
            data.get('p_isParking', None),
            data.get('p_NumRooms', None),
            data.get('p_NumFloors', None),
            data.get('p_WaterTimings', None),
            data.get('p_CleanlinessTenure', None),
            data.get('p_IssueResolvingTenure', None),
            data.get('p_MessProvide', None),
            data.get('p_GeezerFlag', None),
            data.get('p_name', None),
            data.get('p_Latitude', None),
            data.get('p_Longitude', None)
        ]
        with connection.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(params))
            query = f"SELECT * FROM {function_name}({placeholders})"
            cursor.execute(query, params)
            result = cursor.fetchone()

        if not result:
            return False, 'Database Returned no values.'
        if not result[0]:
            return False, "Operation failed. Check Manager ID or data."
        return True, "Operation successful."
    
    except KeyError as e:
        return False, f'Missing field: {str(e)}' 
    
    except Exception as e:
        print(f"DB Error in {function_name}: {e}")
        return False, str(e)