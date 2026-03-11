from .App_views import Add_App_Suggestion_view, Display_Ratings_View, Display_User_Suggestions_View
from .Hostel_views import Add_Hostel_Details_view, Update_Hostel_Details_view, Display_Hostel_View
from .Kitchen_views import Add_Kitchen_Details_view, Update_Kitchen_Details_view
from .Manager_views import Add_Manager_Details_view, Update_Manager_Details_view, delete_Hostel_Manager_view, Display_All_Managers_View, Display_Manager_View
from .Mess_views import Add_Mess_Details, Add_New_Dish_View, Update_Mess_Details, Delete_Mess_Details_view
from .Student_views import Student_Detail_Entry_view, Update_Student_Detail_view, Display_All_Students_View, Display_Student_View, Delete_Student_View
from .User_views import SignupView
from .Room_views import Add_Room_View, Update_Room_View, Delete_Room_View, Display_Hostel_Rooms_View, Display_Room_View
from .Expenses_views import Add_Expenses_View, AddExpenses_RoomIncluded_View, Delete_Expenses_View, Display_Expenses_View, Update_Expenses_View

__all__ = [
    "Add_App_Suggestion_view", "Display_Ratings_View", "Display_User_Suggestions_View",
    "Add_Hostel_Details_view", "Update_Hostel_Details_view", "Display_Hostel_View",
    "Add_Kitchen_Details_view", "Update_Kitchen_Details_view",
    "Add_Manager_Details_view", "Update_Manager_Details_view", "Display_All_Managers_View", "Display_Manager_View",
    "delete_Hostel_Manager_view", "Add_Mess_Details", "Add_New_Dish_View", "Update_Mess_Details", "Delete_Mess_Details_view",
    "Student_Detail_Entry_view", "Update_Student_Detail_view", "Display_All_Students_View", "Display_Student_View", "Delete_Student_View",
    "SignupView",
    "Add_Room_View", "Update_Room_View", "Delete_Room_View", "Display_Hostel_Rooms_View", "Display_Room_View",
    "Add_Expenses_View", "AddExpenses_RoomIncluded_View", "Delete_Expenses_View", "Display_Expenses_View", "Update_Expenses_View"
]
