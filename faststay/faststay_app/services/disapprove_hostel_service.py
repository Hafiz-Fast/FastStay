from django.db import connection


class DisapproveHostelService:
    def disapprove_hostel(self, hostel_id: int):
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE hostel SET isapproved = false WHERE hostelid = %s",
                    [hostel_id]
                )
                rows_affected = cursor.rowcount
            if rows_affected > 0:
                return 1   # success
            return -1      # hostel not found
        except Exception as e:
            print(f"DB error disapproving hostel {hostel_id}: {e}")
            return None
