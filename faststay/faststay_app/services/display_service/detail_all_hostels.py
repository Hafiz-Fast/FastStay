from faststay_app.services.execute_function import _execute_display_function

# class DetailAllHostels:
#     def detail_all_hostels(self):
#         all_hostels = _execute_display_function("DisplayAllHostels")
#         return [h for h in all_hostels if h.get('p_isapproved') is not False]

class DetailAllHostels:
    def detail_all_hostels(self):
        return _execute_display_function("DisplayAllHostels")