from django.urls import path, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from faststay_app.views import SignupView
from faststay_app.views import Add_App_Suggestion_view, Display_Ratings_View, Display_User_Suggestions_View
from faststay_app.views import Student_Detail_Entry_view, Update_Student_Detail_view, Display_Student_View, Display_All_Students_View
from faststay_app.views import Add_Manager_Details_view, Update_Manager_Details_view, delete_Hostel_Manager_view, Display_Manager_View, Display_All_Managers_View
from faststay_app.views import Add_Hostel_Details_view, Update_Hostel_Details_view, Display_Hostel_View
from faststay_app.views import Add_Kitchen_Details_view, Update_Kitchen_Details_view
from faststay_app.views import Add_Mess_Details, Update_Mess_Details, Delete_Mess_Details_view, Add_New_Dish_View
from faststay_app.views import Add_Room_View, Update_Room_View, Delete_Room_View, Display_Room_View, Display_Hostel_Rooms_View
from faststay_app.views import Add_Expenses_View, AddExpenses_RoomIncluded_View, Update_Expenses_View, Delete_Expenses_View, Display_Expenses_View
from faststay_app.views.signup_view import SignupView
from faststay_app.views.get_all_users_view import GetAllUsersView
from faststay_app.views.login_view import LoginView 
from faststay_app.views.delete_hostel_details import DeleteHostelDetailsView
from faststay_app.views.add_hostel_pics_view import AddHostelPics
from faststay_app.views.add_room_pics_view import AddRoomPics
from faststay_app.views.delete_hostel_pics_view import DeleteHostelPics
from faststay_app.views.delete_kitchen_details_view import DeleteKitchenDetails
from faststay_app.views.display_allrooms_view import DisplayAllRoomsView
from faststay_app.views.add_securityinfo_view import AddSecurityInfoView
from faststay_app.views.delete_securityinfo_view import DeleteSecurityInfoView
from faststay_app.views.display_securityinfo_view import DisplayHostelSecurityInfoView
from faststay_app.views.update_securityinfo_view import UpdateSecurityInfoView
from faststay_app.views.rating_views.add import AddHostelRatingView
from faststay_app.views.rating_views.update import UpdateHostelRatingView
from faststay_app.views.rating_views.delete import DeleteHostelRatingView
from faststay_app.views.rating_views.display import DisplayRatingsView
from faststay_app.views.display_views.detail_all_hostels import DisplayAllHostelsView
from faststay_app.views.display_views.details_hostel_mess import DetailsHostelMess
from faststay_app.views.display_views.details_kitchen import DetailsKitchen
from faststay_app.views.display_views.hostel_pic import HostelPicView
from faststay_app.views.display_views.room_pic import RoomPicView
from faststay_app.views.Hostel_views.Display_Student_Home import DisplayStudentHomeView

schema_view = get_schema_view(
    openapi.Info(
        title='FastStay API',
        default_version='v1',
        description='API documentation for FastStay',
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns=[
    path('signup/', SignupView.as_view(), name='signup'),
    path('UserDetail/add/', Student_Detail_Entry_view.as_view(), name='DetailEntry'),
    path('UserDetail/update/', Update_Student_Detail_view.as_view(), name='UpdateStudentDetail'),
    path('UserDetail/display/', Display_Student_View.as_view(), name='Display_Student_Details'),
    path('UserDetail/display/all/', Display_All_Students_View.as_view(), name='Display_All_Students_Details'),
    path('AppSuggestion/add/', Add_App_Suggestion_view.as_view(), name='Add_App_Suggestion'),
    path('AppSuggestion/display/', Display_User_Suggestions_View.as_view(), name='Display_User_Suggestions'),
    path('HostelRating/display/', Display_Ratings_View.as_view(), name='Display_hostel_Ratings'),
    path('ManagerDetails/add/', Add_Manager_Details_view.as_view(), name='Add_Manager_Details'),
    path('ManagerDetails/update/', Update_Manager_Details_view.as_view(), name='Update_Manager_Details'),
    path('ManagerDetails/delete/', delete_Hostel_Manager_view.as_view(), name='Delete_Hostel_Manager'),
    path('ManagerDetails/display/', Display_Manager_View.as_view(), name='Display_Hostel_Manager'),
    path('ManagerDetails/display/all/', Display_All_Managers_View.as_view(), name='Display_All_Hostel_Manager'),
    path('hostel/add/', Add_Hostel_Details_view.as_view(), name='add_hostel'),
    path('hostel/update/', Update_Hostel_Details_view.as_view(), name='update_hostel'),
    path('hostel/display/', Display_Hostel_View.as_view(), name='Display_hostel_Details'),
    path('kitchenDetails/add/', Add_Kitchen_Details_view.as_view(), name='Add_Kitchen_Detail'),
    path('kitchenDetails/update/', Update_Kitchen_Details_view.as_view(), name='Update_Kitchen_Detail'),
    path('messDetails/add/', Add_Mess_Details.as_view(), name='Add_Mess_Detail'),
    path('messDetails/update/', Update_Mess_Details.as_view(), name='Update_Mess_Detail'),
    path('messDetails/delete/', Delete_Mess_Details_view.as_view(), name='Delete_Mess_Detail'),
    path('messDetails/AddNewDish/', Add_New_Dish_View.as_view(), name='Add_Mess_Dish'),
    path('Rooms/add/', Add_Room_View.as_view(), name='Add_Room'),
    path('Rooms/update/', Update_Room_View.as_view(), name='Update_Room'),
    path('Rooms/delete/', Delete_Room_View.as_view(), name='Delete_Room'),
    path('Rooms/Display/', Display_Room_View.as_view(), name='Display_Room'),
    path("Rooms/DisplayAllHostel/", Display_Hostel_Rooms_View.as_view(), name='Display_Hostel_Rooms_All'),
    path("Expenses/add/", Add_Expenses_View.as_view(), name='Add_Expenses'),
    path("ExpensesRoomIncluded/add/", AddExpenses_RoomIncluded_View.as_view(), name='AddExpenses_RoomIncluded'),
    path("Expenses/update/", Update_Expenses_View.as_view(), name='Update_Expenses'),
    path("Expenses/delete/", Delete_Expenses_View.as_view(), name='Delete_Expenses'),
    path("Expenses/display/", Display_Expenses_View.as_view(), name='Display_Expenses'),
    path('users/all/', GetAllUsersView.as_view(), name='get_all_users'),
    path('login/', LoginView.as_view(), name='login'),
    path('hosteldetails/delete', DeleteHostelDetailsView.as_view(), name='delete_hostel_details'),
    path('hostel_pics/add', AddHostelPics.as_view(), name='add_hostel_pics'),
    path('room_pics/add', AddRoomPics.as_view(), name='add_room_pics'),
    path('hostel_pics/delete', DeleteHostelPics.as_view(), name='delete_hostel_pics'),
    path('kitchen/delete', DeleteKitchenDetails.as_view(), name='delete_kitchen_details'),
    path('display/all_rooms', DisplayAllRoomsView.as_view(), name='display_allrooms'),
    path('add/security_info', AddSecurityInfoView.as_view(), name='add_security_info'),
    path('delete/security_info', DeleteSecurityInfoView.as_view(), name='delete_security_info'),
    path('display/security_info', DisplayHostelSecurityInfoView.as_view(), name='display_security_info'),
    path('update/security_info', UpdateSecurityInfoView.as_view(), name='update_security_info'),
    path('add/hostel_rating', AddHostelRatingView.as_view(), name='add_hostel_rating'),
    path('update/hostel_rating', UpdateHostelRatingView.as_view(), name='update_hostel_rating'),
    path('delete/hostel_rating', DeleteHostelRatingView.as_view(), name='delete_hostel_rating'),
    path('display/hostel_rating', DisplayRatingsView.as_view(), name='display_hostel_rating'),
    path('display/all_hostels', DisplayAllHostelsView.as_view(), name='display_all_hostels'),
    path('display/hostel_mess', DetailsHostelMess.as_view(), name='display_details_mess'),
    path('display/details_kitchen', DetailsKitchen.as_view(), name='display_details_kitchen'),
    path('display/hostel_pic',HostelPicView.as_view(), name='display_hostel_pic'),
    path('display/room_pic',RoomPicView.as_view(), name='display_room_pic'),
    path('display/StudentHome',DisplayStudentHomeView.as_view(), name='display_student_home'),

    # Swagger URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]