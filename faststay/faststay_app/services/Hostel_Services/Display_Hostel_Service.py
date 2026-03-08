from django.db import connection

def Display_Hostel_service(data):
    function_name = "DisplayHostel"

    try:
         # Extract fields in the order the stored function expects
        params=[
            data['p_HostelId'],        
        ]
    
        with connection.cursor() as cursor:
            placeholders = ','.join(['%s'] * len(params))
            query = f"SELECT * FROM {function_name}({placeholders})"
            cursor.execute(query, params)
            result = cursor.fetchone()

            #Handle DataBase Response
            if not result:
                return False, 'Database returned no result'
            
            Hostel_Detail = {
                "p_BlockNo": result[0],
                "p_HouseNo": result[1],
                "p_HostelType": result[2],
                "p_isParking": result[3],
                "p_NumRooms": result[4],
                "p_NumFloors": result[5],
                "p_WaterTimings": result[6],
                "p_CleanlinessTenure": result[7],
                "p_IssueResolvingTenure": result[8],
                "p_MessProvide": result[9],
                "p_GeezerFlag": result[10],
                "p_name": result[11],
                "p_Latitude": result[12],
                "p_Longitude": result[13]
            }

            return True, Hostel_Detail

    except KeyError as e:
        return False, f'Missing field: {str(e)}' 
    except Exception as e:
        print(f"DB error in {function_name}: {e}")
        return False, f'Database Error: {e}'