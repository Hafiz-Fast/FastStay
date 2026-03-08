import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentProfile from "./pages/Student_Profile";
import EditProfile from "./pages/Edit_Profile";
import Suggestions from "./pages/Suggestions";
import StudentHome from "./pages/Student_Home";
import HostelDetails from "./pages/Hostel_Details";
import OwnerDetails from "./pages/Owner_Details";
import Rooms from "./pages/view_Rooms";
import AdminDashboard from './pages/admin_dashboard';
import AdminViewStudents from './pages/admin_student';
import AdminViewManagers from './pages/admin_manager';
import ViewHostels from './pages/admin_hostels';
import AdminManagerProfile from './pages/admin_manager_review';
import AdminStudentProfile from './pages/admin_students_review';
import AdminViewHostels from './pages/admin_hostels_review';
import LogoutConfirm from './pages/admin_signout';
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDemographics from "./pages/StudentDemographics";
import ManagerDemographics from "./pages/ManagerDemographics";
import HostelDashboard from "./pages/HostelDashboard";
import AddHostel from "./pages/AddHostel";
import AddRoom from "./pages/AddRoom";
import Profile from "./pages/Profile";
import ManagerAnalytics from "./pages/ManagerAnalytics";
import DirectionsMap from "./pages/DirectionsMap";

localStorage.clear();

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/profile/edit" element={<EditProfile />} />
        <Route path="/student/suggestions" element={<Suggestions />} />
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/student/hostelDetails" element={<HostelDetails/>}/>
        <Route path="/student/ownerDetails" element={<OwnerDetails/>}/>
        <Route path="/student/rooms" element={<Rooms/>}/>
        <Route path="/student/directions" element={<DirectionsMap />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="admin/logout" element={<LogoutConfirm />} />
        <Route path="/admin/hostels" element={<ViewHostels />} />
        <Route path="/admin/students" element={<AdminViewStudents />} />
        <Route path="/admin/managers" element={<AdminViewManagers />} />
        <Route path="/admin/hostels/:id" element={<AdminViewHostels />} />
        <Route path="/admin/managers/:id" element={<AdminManagerProfile />} />
        <Route path="/admin/students/:id" element={<AdminStudentProfile />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        <Route path="/" element={<Login />} />
        <Route path="/manager/dashboard" element={<HostelDashboard />} />
        <Route path="/manager/add_hostel" element={<AddHostel />} />
        <Route path="/manager/add_room" element={<AddRoom />} />
        <Route path="/manager/profile" element={<Profile />} />
        <Route path="/manager/analytics" element={<ManagerAnalytics />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/studentdemographics" element={<StudentDemographics />} />
        <Route path="/managerdemographics" element={<ManagerDemographics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;