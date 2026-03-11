from faststay_app.services.execute_function import _execute_fetch_one


class ApproveHostelService:
    def approve_hostel(self, hostel_id: int):
        return _execute_fetch_one("ApproveHostel", [hostel_id])