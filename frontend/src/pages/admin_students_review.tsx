// // // import React, { useEffect, useState } from "react";
// // // import { useParams, useNavigate, Link } from "react-router-dom";
// // // import { getStudentProfile, type StudentProfile } from "../api/admin_students_review";
// // // import styles from "../styles/admin_dashboard.module.css";
// // // import studentStyles from "../styles/admin_students_profile.module.css";

// // // const AdminStudentProfile: React.FC = () => {
// // //   const { id } = useParams<{ id: string }>();
// // //   const navigate = useNavigate();

// // //   const [student, setStudent] = useState<StudentProfile | null>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);

// // //   useEffect(() => {
// // //     const fetchStudentData = async () => {
// // //       if (!id) {
// // //         setError("Student ID is missing");
// // //         setLoading(false);
// // //         return;
// // //       }

// // //       try {
// // //         setLoading(true);
// // //         const studentId = parseInt(id);

// // //         const studentData = await getStudentProfile(studentId);

// // //         if (studentData) {
// // //           setStudent(studentData);
// // //         } else {
// // //           setError(`Student with ID ${studentId} not found`);
// // //         }
// // //       } catch (err) {
// // //         console.error("Error fetching student profile:", err);
// // //         setError("Failed to load student profile. Please try again.");
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchStudentData();
// // //   }, [id]);

// // //   const handleDelete = async () => {
// // //     if (!student) return;

// // //     if (window.confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
// // //       try {
// // //         // Add your delete API call here
// // //         console.log("Deleting student:", student.userId);
// // //         // await deleteStudent(student.userId);

// // //         // Navigate back to students list after deletion
// // //         navigate("/admin/students");
// // //       } catch (err) {
// // //         console.error("Error deleting student:", err);
// // //         alert("Failed to delete student. Please try again.");
// // //       }
// // //     }
// // //   };

// // //   const formatSemester = (semester: number): string => {
// // //     const suffixes: Record<number, string> = {
// // //       1: "st",
// // //       2: "nd",
// // //       3: "rd"
// // //     };
// // //     const suffix = suffixes[semester] || "th";
// // //     return `${semester}${suffix}`;
// // //   };

// // //   const formatDistance = (distance: number): string => {
// // //     return `${distance.toFixed(1)} km`;
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div>
// // //         {/* NAVBAR */}
// // //         <nav className={styles.navbar}>
// // //           <div className={styles.logo}>
// // //             <i className="fa-solid fa-user-shield"></i> FastStay Admin
// // //           </div>
// // //           <div className={styles.navLinks}>
// // //             <Link to="/admin/dashboard">Dashboard</Link>
// // //             <Link to="/admin/hostels">Hostels</Link>
// // //             <Link to="/admin/students" className={styles.active}>Students</Link>
// // //             <Link to="/admin/managers">Managers</Link>
// // //             <Link to="/logout">Logout</Link>
// // //           </div>
// // //         </nav>

// // //         <div className={styles.container}>
// // //           <div className={studentStyles.loadingContainer}>
// // //             <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i>
// // //             Loading student profile...
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   if (error || !student) {
// // //     return (
// // //       <div>
// // //         {/* NAVBAR */}
// // //         <nav className={styles.navbar}>
// // //           <div className={styles.logo}>
// // //             <i className="fa-solid fa-user-shield"></i> FastStay Admin
// // //           </div>
// // //           <div className={styles.navLinks}>
// // //             <Link to="/admin/dashboard">Dashboard</Link>
// // //             <Link to="/admin/hostels">Hostels</Link>
// // //             <Link to="/admin/students" className={styles.active}>Students</Link>
// // //             <Link to="/admin/managers">Managers</Link>
// // //             <Link to="/logout">Logout</Link>
// // //           </div>
// // //         </nav>

// // //         <div className={styles.container}>
// // //           <div className={studentStyles.errorContainer}>
// // //             <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "20px" }}></i>
// // //             <h2>Error Loading Student</h2>
// // //             <p>{error || "Student not found"}</p>
// // //             <button
// // //               className={studentStyles.backButton}
// // //               onClick={() => navigate("/admin/students")}
// // //               style={{ marginTop: "20px" }}
// // //             >
// // //               <i className="fas fa-arrow-left"></i> Back to Students List
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div>
// // //       {/* NAVBAR */}
// // //       <nav className={styles.navbar}>
// // //         <div className={styles.logo}>
// // //           <i className="fa-solid fa-user-shield"></i> FastStay Admin
// // //         </div>
// // //         <div className={styles.navLinks}>
// // //           <Link to="/admin/dashboard">Dashboard</Link>
// // //           <Link to="/admin/hostels">Hostels</Link>
// // //           <Link to="/admin/students" className={styles.active}>Students</Link>
// // //           <Link to="/admin/managers">Managers</Link>
// // //           <Link to="/logout">Logout</Link>
// // //         </div>
// // //       </nav>

// // //       {/* PAGE CONTENT */}
// // //       <div className={styles.container}>
// // //         <div className={studentStyles.studentProfileCard}>
// // //           {/* Header with Back Button */}
// // //           <div className={studentStyles.profileHeader}>
// // //             <div>
// // //               <h2 className={styles.pageTitle}>
// // //                 <i className="fa-solid fa-user-graduate"></i> Student Profile
// // //               </h2>
// // //               <p className={styles.subtitle}>Complete demographic details of {student.fullName}</p>
// // //             </div>
// // //             <button
// // //               className={studentStyles.backButton}
// // //               onClick={() => navigate("/admin/students")}
// // //             >
// // //               <i className="fas fa-arrow-left"></i> Back to List
// // //             </button>
// // //           </div>

// // //           {/* Student Summary Stats */}
// // //           <div className={studentStyles.studentSummary}>
// // //             <div className={studentStyles.summaryItem}>
// // //               <div className={studentStyles.summaryLabel}>Student ID</div>
// // //               <div className={studentStyles.summaryValue}>#{student.userId}</div>
// // //             </div>
// // //             <div className={studentStyles.summaryItem}>
// // //               <div className={studentStyles.summaryLabel}>Age</div>
// // //               <div className={studentStyles.summaryValue}>{student.age} years</div>
// // //             </div>
// // //             <div className={studentStyles.summaryItem}>
// // //               <div className={studentStyles.summaryLabel}>Semester</div>
// // //               <div className={studentStyles.summaryValue}>{formatSemester(student.semester)}</div>
// // //             </div>
// // //             <div className={studentStyles.summaryItem}>
// // //               <div className={studentStyles.summaryLabel}>Batch</div>
// // //               <div className={studentStyles.summaryValue}>{student.batch}</div>
// // //             </div>
// // //           </div>

// // //           {/* Student Information Grid */}
// // //           <div className={studentStyles.infoGrid}>
// // //             {/* Personal Information */}
// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-user"></i> Full Name
// // //               </div>
// // //               <div className={studentStyles.value}>{student.fullName}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-venus-mars"></i> Gender
// // //               </div>
// // //               <div className={studentStyles.value}>{student.gender}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-birthday-cake"></i> Age
// // //               </div>
// // //               <div className={studentStyles.value}>{student.age} years</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-city"></i> City
// // //               </div>
// // //               <div className={studentStyles.value}>{student.city}</div>
// // //             </div>

// // //             {/* Academic Information */}
// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-graduation-cap"></i> Department
// // //               </div>
// // //               <div className={studentStyles.value}>{student.department}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-calendar-alt"></i> Semester
// // //               </div>
// // //               <div className={studentStyles.value}>{formatSemester(student.semester)}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-calendar"></i> Batch
// // //               </div>
// // //               <div className={studentStyles.value}>{student.batch}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-road"></i> University Distance
// // //               </div>
// // //               <div className={studentStyles.value}>{formatDistance(student.universityDistance)}</div>
// // //             </div>

// // //             {/* Room Information */}
// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-user-friends"></i> Roommate Preference
// // //               </div>
// // //               <div className={studentStyles.value}>
// // //                 {student.roommateCount === 0 ? "Single" : `${student.roommateCount} Roommates`}
// // //               </div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-bed"></i> Bed Type
// // //               </div>
// // //               <div className={studentStyles.value}>{student.bedType}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-shower"></i> Washroom Type
// // //               </div>
// // //               <div className={studentStyles.value}>{student.washroomType}</div>
// // //             </div>

// // //             {/* Account Information */}
// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-id-card"></i> Student ID
// // //               </div>
// // //               <div className={studentStyles.value}>#{student.userId}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-sign-in-alt"></i> Login ID
// // //               </div>
// // //               <div className={studentStyles.value}>#{student.loginId}</div>
// // //             </div>

// // //             <div className={studentStyles.infoItem}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-user-tag"></i> User Type
// // //               </div>
// // //               <div className={studentStyles.value}>{student.userType}</div>
// // //             </div>

// // //             {/* Full Width Items */}
// // //             <div className={`${studentStyles.infoItem} ${studentStyles.fullWidthItem}`}>
// // //               <div className={studentStyles.label}>
// // //                 <i className="fas fa-info-circle"></i> Additional Information
// // //               </div>
// // //               <div className={studentStyles.value}>
// // //                 {student.firstName} {student.lastName} is a {student.semester}th semester student in {student.department} department.
// // //                 Currently residing in {student.city} and studying at FAST University.
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* Preferences Section */}
// // //           <div className={studentStyles.preferencesSection}>
// // //             <h3 className={studentStyles.sectionTitle}>
// // //               <i className="fas fa-star"></i> Accommodation Preferences
// // //             </h3>
// // //             <div className={studentStyles.preferencesGrid}>
// // //               <div className={studentStyles.preferenceItem}>
// // //                 <div className={studentStyles.preferenceIcon}>
// // //                   <i className={`fas ${student.isAcRoom ? "fa-snowflake" : "fa-fan"}`}></i>
// // //                 </div>
// // //                 <div className={studentStyles.preferenceLabel}>AC Room</div>
// // //                 <div className={`${studentStyles.preferenceValue} ${
// // //                   student.isAcRoom ? studentStyles.booleanTrue : studentStyles.booleanFalse
// // //                 }`}>
// // //                   {student.isAcRoom ? "Required" : "Not Required"}
// // //                 </div>
// // //               </div>

// // //               <div className={studentStyles.preferenceItem}>
// // //                 <div className={studentStyles.preferenceIcon}>
// // //                   <i className={`fas ${student.isMess ? "fa-utensils" : "fa-utensil-spoon"}`}></i>
// // //                 </div>
// // //                 <div className={studentStyles.preferenceLabel}>Mess Service</div>
// // //                 <div className={`${studentStyles.preferenceValue} ${
// // //                   student.isMess ? studentStyles.booleanTrue : studentStyles.booleanFalse
// // //                 }`}>
// // //                   {student.isMess ? "Required" : "Not Required"}
// // //                 </div>
// // //               </div>

// // //               <div className={studentStyles.preferenceItem}>
// // //                 <div className={studentStyles.preferenceIcon}>
// // //                   <i className="fas fa-users"></i>
// // //                 </div>
// // //                 <div className={studentStyles.preferenceLabel}>Room Capacity</div>
// // //                 <div className={studentStyles.preferenceValue}>
// // //                   {student.roommateCount + 1} Persons
// // //                 </div>
// // //               </div>

// // //               <div className={studentStyles.preferenceItem}>
// // //                 <div className={studentStyles.preferenceIcon}>
// // //                   <i className="fas fa-university"></i>
// // //                 </div>
// // //                 <div className={studentStyles.preferenceLabel}>Distance to Uni</div>
// // //                 <div className={studentStyles.preferenceValue}>
// // //                   {formatDistance(student.universityDistance)}
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           {/* Action Buttons */}
// // //           <div className={studentStyles.studentActions}>
// // //             <button
// // //               className={studentStyles.primaryButton}
// // //               onClick={() => {
// // //                 // Navigate to find suitable hostels for this student
// // //                 navigate(`/admin/hostels?student=${student.userId}&ac=${student.isAcRoom}&mess=${student.isMess}`);
// // //               }}
// // //             >
// // //               <i className="fas fa-search"></i> Find Suitable Hostels
// // //             </button>

// // //             <button
// // //               className={studentStyles.secondaryButton}
// // //               onClick={() => {
// // //                 // Edit student functionality
// // //                 console.log("Edit student:", student.userId);
// // //                 // navigate(`/admin/students/edit/${student.userId}`);
// // //               }}
// // //             >
// // //               <i className="fas fa-edit"></i> Edit Profile
// // //             </button>

// // //             <button
// // //               className={studentStyles.dangerButton}
// // //               onClick={handleDelete}
// // //             >
// // //               <i className="fas fa-trash-alt"></i> Delete Student
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Font Awesome Icons */}
// // //       <link
// // //         rel="stylesheet"
// // //         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
// // //       />
// // //     </div>
// // //   );
// // // };

// // // export default AdminStudentProfile;







// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { getStudentProfile, type StudentProfile } from "../api/admin_students_review";
// import styles from "../styles/admin_dashboard.module.css";
// import studentStyles from "../styles/admin_students_profile.module.css";

// const AdminStudentProfile: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [student, setStudent] = useState<StudentProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchStudentData = async () => {
//       if (!id) {
//         setError("Student ID is missing");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const studentId = parseInt(id);

//         const studentData = await getStudentProfile(studentId);

//         if (studentData) {
//           setStudent(studentData);
//         } else {
//           setError(`Student with ID ${studentId} not found`);
//         }
//       } catch (err) {
//         console.error("Error fetching student profile:", err);
//         setError("Failed to load student profile. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudentData();
//   }, [id]);

//   const handleDelete = async () => {
//     if (!student) return;

//     if (window.confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
//       try {
//         // Add your delete API call here
//         console.log("Deleting student:", student.userId);
//         // await deleteStudent(student.userId);

//         // Navigate back to students list after deletion
//         navigate("/admin/students");
//       } catch (err) {
//         console.error("Error deleting student:", err);
//         alert("Failed to delete student. Please try again.");
//       }
//     }
//   };

//   const formatSemester = (semester: number): string => {
//     const suffixes: Record<number, string> = {
//       1: "st",
//       2: "nd",
//       3: "rd"
//     };
//     const suffix = suffixes[semester] || "th";
//     return `${semester}${suffix}`;
//   };

//   const formatDistance = (distance: number): string => {
//     return `${distance.toFixed(1)} km`;
//   };

//   // Show only error on full page if there's a critical error
//   if (error && !loading) {
//     return (
//       <div>
//         {/* NAVBAR */}
//         <nav className={styles.navbar}>
//           <div className={styles.logo}>
//             <i className="fa-solid fa-user-shield"></i> FastStay Admin
//           </div>
//           <div className={styles.navLinks}>
//             <Link to="/admin">Dashboard</Link>
//             <Link to="/admin/hostels">Hostels</Link>
//             <Link to="/admin/students" className={styles.active}>Students</Link>
//             <Link to="/admin/managers">Managers</Link>
//             <Link to="/admin/logout">Logout</Link>
//           </div>
//         </nav>

//         <div className={styles.container}>
//           <div className={studentStyles.errorContainer}>
//             <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "20px" }}></i>
//             <h2>Error Loading Student</h2>
//             <p>{error || "Student not found"}</p>
//             <button
//               className={studentStyles.backButton}
//               onClick={() => navigate("/admin/students")}
//               style={{ marginTop: "20px" }}
//             >
//               <i className="fas fa-arrow-left"></i> Back to Students List
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* NAVBAR */}
//       <nav className={styles.navbar}>
//         <div className={styles.logo}>
//           <i className="fa-solid fa-user-shield"></i> FastStay Admin
//         </div>
//         <div className={styles.navLinks}>
//           <Link to="/admin">Dashboard</Link>
//           <Link to="/admin/hostels">Hostels</Link>
//           <Link to="/admin/students" className={styles.active}>Students</Link>
//           <Link to="/admin/managers">Managers</Link>
//           <Link to="/admin/logout">Logout</Link>
//         </div>
//       </nav>

//       {/* PAGE CONTENT */}
//       <div className={styles.container}>
//         {/* Loading state within the profile card */}
//         {loading ? (
//           <div className={studentStyles.studentProfileCard}>
//             <div className={studentStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-graduate"></i> Student Profile
//                 </h2>
//                 <p className={styles.subtitle}>Loading student details...</p>
//               </div>
//               <button
//                 className={studentStyles.backButton}
//                 onClick={() => navigate("/admin/students")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             <div style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "60px 20px",
//               textAlign: "center"
//             }}>
//               <i className="fa-solid fa-spinner fa-spin" style={{
//                 fontSize: "32px",
//                 marginBottom: "20px",
//                 color: "#5c3d2e"
//               }}></i>
//               <h3 style={{ marginBottom: "10px", color: "#5c3d2e" }}>Loading student profile...</h3>
//               <p style={{ color: "#666" }}>Please wait while we fetch the student information</p>
//             </div>
//           </div>
//         ) : !student ? (
//           <div className={studentStyles.studentProfileCard}>
//             <div className={studentStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-graduate"></i> Student Profile
//                 </h2>
//                 <p className={styles.subtitle}>Student not found</p>
//               </div>
//               <button
//                 className={studentStyles.backButton}
//                 onClick={() => navigate("/admin/students")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             <div style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "60px 20px",
//               textAlign: "center"
//             }}>
//               <i className="fas fa-user-slash" style={{
//                 fontSize: "48px",
//                 marginBottom: "20px",
//                 color: "#999"
//               }}></i>
//               <h3 style={{ marginBottom: "10px", color: "#666" }}>Student Not Found</h3>
//               <p style={{ color: "#666", marginBottom: "20px" }}>The requested student could not be found or no longer exists.</p>
//             </div>
//           </div>
//         ) : (
//           <div className={studentStyles.studentProfileCard}>
//             {/* Header with Back Button */}
//             <div className={studentStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-graduate"></i> Student Profile
//                 </h2>
//                 <p className={styles.subtitle}>Complete demographic details of {student.fullName}</p>
//               </div>
//               <button
//                 className={studentStyles.backButton}
//                 onClick={() => navigate("/admin/students")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             {/* Student Summary Stats */}
//             <div className={studentStyles.studentSummary}>
//               <div className={studentStyles.summaryItem}>
//                 <div className={studentStyles.summaryLabel}>Student ID</div>
//                 <div className={studentStyles.summaryValue}>#{student.userId}</div>
//               </div>
//               <div className={studentStyles.summaryItem}>
//                 <div className={studentStyles.summaryLabel}>Age</div>
//                 <div className={studentStyles.summaryValue}>{student.age} years</div>
//               </div>
//               <div className={studentStyles.summaryItem}>
//                 <div className={studentStyles.summaryLabel}>Semester</div>
//                 <div className={studentStyles.summaryValue}>{formatSemester(student.semester)}</div>
//               </div>
//               <div className={studentStyles.summaryItem}>
//                 <div className={studentStyles.summaryLabel}>Batch</div>
//                 <div className={studentStyles.summaryValue}>{student.batch}</div>
//               </div>
//             </div>

//             {/* Student Information Grid */}
//             <div className={studentStyles.infoGrid}>
//               {/* Personal Information */}
//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-user"></i> Full Name
//                 </div>
//                 <div className={studentStyles.value}>{student.fullName}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-venus-mars"></i> Gender
//                 </div>
//                 <div className={studentStyles.value}>{student.gender}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-birthday-cake"></i> Age
//                 </div>
//                 <div className={studentStyles.value}>{student.age} years</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-city"></i> City
//                 </div>
//                 <div className={studentStyles.value}>{student.city}</div>
//               </div>

//               {/* Academic Information */}
//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-graduation-cap"></i> Department
//                 </div>
//                 <div className={studentStyles.value}>{student.department}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-calendar-alt"></i> Semester
//                 </div>
//                 <div className={studentStyles.value}>{formatSemester(student.semester)}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-calendar"></i> Batch
//                 </div>
//                 <div className={studentStyles.value}>{student.batch}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-road"></i> University Distance
//                 </div>
//                 <div className={studentStyles.value}>{formatDistance(student.universityDistance)}</div>
//               </div>

//               {/* Room Information */}
//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-user-friends"></i> Roommate Preference
//                 </div>
//                 <div className={studentStyles.value}>
//                   {student.roommateCount === 0 ? "Single" : `${student.roommateCount} Roommates`}
//                 </div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-bed"></i> Bed Type
//                 </div>
//                 <div className={studentStyles.value}>{student.bedType}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-shower"></i> Washroom Type
//                 </div>
//                 <div className={studentStyles.value}>{student.washroomType}</div>
//               </div>

//               {/* Account Information */}
//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-id-card"></i> Student ID
//                 </div>
//                 <div className={studentStyles.value}>#{student.userId}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-sign-in-alt"></i> Login ID
//                 </div>
//                 <div className={studentStyles.value}>#{student.loginId}</div>
//               </div>

//               <div className={studentStyles.infoItem}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-user-tag"></i> User Type
//                 </div>
//                 <div className={studentStyles.value}>{student.userType}</div>
//               </div>

//               {/* Full Width Items */}
//               <div className={`${studentStyles.infoItem} ${studentStyles.fullWidthItem}`}>
//                 <div className={studentStyles.label}>
//                   <i className="fas fa-info-circle"></i> Additional Information
//                 </div>
//                 <div className={studentStyles.value}>
//                   {student.firstName} {student.lastName} is a {student.semester}th semester student in {student.department} department.
//                   Currently residing in {student.city} and studying at FAST University.
//                 </div>
//               </div>
//             </div>

//             {/* Preferences Section */}
//             <div className={studentStyles.preferencesSection}>
//               <h3 className={studentStyles.sectionTitle}>
//                 <i className="fas fa-star"></i> Accommodation Preferences
//               </h3>
//               <div className={studentStyles.preferencesGrid}>
//                 <div className={studentStyles.preferenceItem}>
//                   <div className={studentStyles.preferenceIcon}>
//                     <i className={`fas ${student.isAcRoom ? "fa-snowflake" : "fa-fan"}`}></i>
//                   </div>
//                   <div className={studentStyles.preferenceLabel}>AC Room</div>
//                   <div className={`${studentStyles.preferenceValue} ${
//                     student.isAcRoom ? studentStyles.booleanTrue : studentStyles.booleanFalse
//                   }`}>
//                     {student.isAcRoom ? "Required" : "Not Required"}
//                   </div>
//                 </div>

//                 <div className={studentStyles.preferenceItem}>
//                   <div className={studentStyles.preferenceIcon}>
//                     <i className={`fas ${student.isMess ? "fa-utensils" : "fa-utensil-spoon"}`}></i>
//                   </div>
//                   <div className={studentStyles.preferenceLabel}>Mess Service</div>
//                   <div className={`${studentStyles.preferenceValue} ${
//                     student.isMess ? studentStyles.booleanTrue : studentStyles.booleanFalse
//                   }`}>
//                     {student.isMess ? "Required" : "Not Required"}
//                   </div>
//                 </div>

//                 <div className={studentStyles.preferenceItem}>
//                   <div className={studentStyles.preferenceIcon}>
//                     <i className="fas fa-users"></i>
//                   </div>
//                   <div className={studentStyles.preferenceLabel}>Room Capacity</div>
//                   <div className={studentStyles.preferenceValue}>
//                     {student.roommateCount + 1} Persons
//                   </div>
//                 </div>

//                 <div className={studentStyles.preferenceItem}>
//                   <div className={studentStyles.preferenceIcon}>
//                     <i className="fas fa-university"></i>
//                   </div>
//                   <div className={studentStyles.preferenceLabel}>Distance to Uni</div>
//                   <div className={studentStyles.preferenceValue}>
//                     {formatDistance(student.universityDistance)}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className={studentStyles.studentActions}>
//               <button
//                 className={studentStyles.primaryButton}
//                 onClick={() => {
//                   // Navigate to find suitable hostels for this student
//                   navigate(`/admin/hostels?student=${student.userId}&ac=${student.isAcRoom}&mess=${student.isMess}`);
//                 }}
//               >
//                 <i className="fas fa-search"></i> Find Suitable Hostels
//               </button>

//               <button
//                 className={studentStyles.secondaryButton}
//                 onClick={() => {
//                   // Edit student functionality
//                   console.log("Edit student:", student.userId);
//                   // navigate(`/admin/students/edit/${student.userId}`);
//                 }}
//               >
//                 <i className="fas fa-edit"></i> Edit Profile
//               </button>

//               <button
//                 className={studentStyles.dangerButton}
//                 onClick={handleDelete}
//               >
//                 <i className="fas fa-trash-alt"></i> Delete Student
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Font Awesome Icons */}
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
//       />
//     </div>
//   );
// };

// export default AdminStudentProfile;







import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getStudentProfile, CACHE_STUDENT_PROFILE, type StudentProfile } from "../api/admin_students_review";
import { cacheGet } from "../utils/cache";
import { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import studentStyles from "../styles/admin_students_profile.module.css";

const AdminStudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Student ID is missing");
      setLoading(false);
      return;
    }

    const studentId = parseInt(id);

    // Phase 1: instant render from cache
    const cached = cacheGet<StudentProfile>(CACHE_STUDENT_PROFILE(studentId));
    if (cached) {
      setStudent(cached);
      setLoading(false);
    }

    // Phase 2: background refresh
    getStudentProfile(studentId, true)
      .then(studentData => {
        if (studentData) {
          setStudent(studentData);
        } else if (!cached) {
          setError(`Student with ID ${studentId} not found`);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error fetching student profile:", err);
        if (!cached) setError("Failed to load student profile. Please try again.");
        setLoading(false);
      });
  }, [id]);

  const handleApprove = () => {
    if (!student) return;

    // Dummy approve functionality
    console.log(`Dummy approving student ${student.userId}`);
    setIsApproved(true);
    setShowApproveSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowApproveSuccess(false);
    }, 3000);
  };

  const handleDelete = () => {
    if (!student) return;

    // Dummy delete functionality
    console.log(`Dummy deleting student ${student.userId}`);
    setActionError("This is a dummy delete. Student not actually deleted.");
  };

  const formatSemester = (semester: number): string => {
    const suffixes: Record<number, string> = {
      1: "st",
      2: "nd",
      3: "rd"
    };
    const suffix = suffixes[semester] || "th";
    return `${semester}${suffix}`;
  };

  const formatDistance = (distance: number): string => {
    return `${distance.toFixed(1)} km`;
  };

  // Show only error on full page if there's a critical error
  if (error && !loading) {
    return (
      <div>
        {/* NAVBAR */}
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <i className="fa-solid fa-user-shield"></i> FastStay Admin
          </div>
          <div className={styles.navLinks}>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/hostels">Hostels</Link>
            <Link to="/admin/students" className={styles.active}>Students</Link>
            <Link to="/admin/managers">Managers</Link>
            <Link to="/admin/logout">Logout</Link>
          </div>
        </nav>

        <div className={styles.container}>
          <div className={studentStyles.errorContainer}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "20px" }}></i>
            <h2>Error Loading Student</h2>
            <p>{error || "Student not found"}</p>
            <button
              className={studentStyles.backButton}
              onClick={() => navigate("/admin/students")}
              style={{ marginTop: "20px" }}
            >
              <i className="fas fa-arrow-left"></i> Back to Students List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <i className="fa-solid fa-user-shield"></i> FastStay Admin
        </div>
        <div className={styles.navLinks}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/hostels">Hostels</Link>
          <Link to="/admin/students" className={styles.active}>Students</Link>
          <Link to="/admin/managers">Managers</Link>
          <Link to="/admin/logout">Logout</Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className={styles.container}>
        {/* Loading state within the profile card */}
        {loading && !student ? (
          <div className={studentStyles.studentProfileCard}>
            <div className={studentStyles.profileHeader}>
              <div>
                <h2 className={styles.pageTitle}>
                  <i className="fa-solid fa-user-graduate"></i> Student Profile
                </h2>
                <SkeletonBlock width="220px" height="16px" />
              </div>
              <button className={studentStyles.backButton} onClick={() => navigate("/admin/students")}>
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>

            <div className={studentStyles.studentSummary}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={studentStyles.summaryItem}>
                  <SkeletonBlock width="70px" height="12px" />
                  <SkeletonBlock width="50px" height="24px" />
                </div>
              ))}
            </div>

            <div className={studentStyles.infoGrid}>
              {[...Array(14)].map((_, i) => (
                <div key={i} className={studentStyles.infoItem}>
                  <SkeletonBlock width="120px" height="13px" />
                  <SkeletonBlock width="90%" height="18px" />
                </div>
              ))}
            </div>

            <div className={studentStyles.preferencesSection}>
              <h3 className={studentStyles.sectionTitle}>
                <i className="fas fa-star"></i> Accommodation Preferences
              </h3>
              <div className={studentStyles.preferencesGrid}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={studentStyles.preferenceItem}>
                    <SkeletonBlock width="40px" height="40px" />
                    <SkeletonBlock width="80px" height="13px" />
                    <SkeletonBlock width="100px" height="18px" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !student ? (
          <div className={studentStyles.studentProfileCard}>
            <div className={studentStyles.profileHeader}>
              <div>
                <h2 className={styles.pageTitle}>
                  <i className="fa-solid fa-user-graduate"></i> Student Profile
                </h2>
                <p className={styles.subtitle}>Student not found</p>
              </div>
              <button
                className={studentStyles.backButton}
                onClick={() => navigate("/admin/students")}
              >
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
              textAlign: "center"
            }}>
              <i className="fas fa-user-slash" style={{
                fontSize: "48px",
                marginBottom: "20px",
                color: "#999"
              }}></i>
              <h3 style={{ marginBottom: "10px", color: "#666" }}>Student Not Found</h3>
              <p style={{ color: "#666", marginBottom: "20px" }}>The requested student could not be found or no longer exists.</p>
            </div>
          </div>
        ) : (
          <div className={studentStyles.studentProfileCard}>
            {/* Header with Back Button */}
            <div className={studentStyles.profileHeader}>
              <div>
                <h2 className={styles.pageTitle}>
                  <i className="fa-solid fa-user-graduate"></i> Student Profile
                  {isApproved && (
                    <span style={{
                      marginLeft: "15px",
                      backgroundColor: "#28a745",
                      color: "white",
                      padding: "5px 15px",
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: "normal"
                    }}>
                      <i className="fa-solid fa-check" style={{ marginRight: "5px" }}></i> Approved
                    </span>
                  )}
                </h2>
                <p className={styles.subtitle}>Complete demographic details of {student.fullName}</p>
              </div>
              <button
                className={studentStyles.backButton}
                onClick={() => navigate("/admin/students")}
              >
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>

            {/* Action Messages */}
            {showApproveSuccess && (
              <div style={{
                backgroundColor: "#d4edda",
                color: "#155724",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <i className="fa-solid fa-check-circle" style={{ fontSize: "18px" }}></i>
                <span>Student approved successfully!</span>
              </div>
            )}

            {actionError && (
              <div style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <i className="fa-solid fa-exclamation-circle" style={{ fontSize: "18px" }}></i>
                <span>{actionError}</span>
              </div>
            )}

            {/* Student Summary Stats */}
            <div className={studentStyles.studentSummary}>
              <div className={studentStyles.summaryItem}>
                <div className={studentStyles.summaryLabel}>Student ID</div>
                <div className={studentStyles.summaryValue}>#{student.userId}</div>
              </div>
              <div className={studentStyles.summaryItem}>
                <div className={studentStyles.summaryLabel}>Age</div>
                <div className={studentStyles.summaryValue}>{student.age} years</div>
              </div>
              <div className={studentStyles.summaryItem}>
                <div className={studentStyles.summaryLabel}>Semester</div>
                <div className={studentStyles.summaryValue}>{formatSemester(student.semester)}</div>
              </div>
              <div className={studentStyles.summaryItem}>
                <div className={studentStyles.summaryLabel}>Batch</div>
                <div className={studentStyles.summaryValue}>{student.batch}</div>
              </div>
            </div>

            {/* Student Information Grid */}
            <div className={studentStyles.infoGrid}>
              {/* Personal Information */}
              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-user"></i> Full Name
                </div>
                <div className={studentStyles.value}>{student.fullName}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-venus-mars"></i> Gender
                </div>
                <div className={studentStyles.value}>{student.gender}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-birthday-cake"></i> Age
                </div>
                <div className={studentStyles.value}>{student.age} years</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-city"></i> City
                </div>
                <div className={studentStyles.value}>{student.city}</div>
              </div>

              {/* Academic Information */}
              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-graduation-cap"></i> Department
                </div>
                <div className={studentStyles.value}>{student.department}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-calendar-alt"></i> Semester
                </div>
                <div className={studentStyles.value}>{formatSemester(student.semester)}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-calendar"></i> Batch
                </div>
                <div className={studentStyles.value}>{student.batch}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-road"></i> University Distance
                </div>
                <div className={studentStyles.value}>{formatDistance(student.universityDistance)}</div>
              </div>

              {/* Room Information */}
              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-user-friends"></i> Roommate Preference
                </div>
                <div className={studentStyles.value}>
                  {student.roommateCount === 0 ? "Single" : `${student.roommateCount} Roommates`}
                </div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-bed"></i> Bed Type
                </div>
                <div className={studentStyles.value}>{student.bedType}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-shower"></i> Washroom Type
                </div>
                <div className={studentStyles.value}>{student.washroomType}</div>
              </div>

              {/* Account Information */}
              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-id-card"></i> Student ID
                </div>
                <div className={studentStyles.value}>#{student.userId}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-sign-in-alt"></i> Login ID
                </div>
                <div className={studentStyles.value}>#{student.loginId}</div>
              </div>

              <div className={studentStyles.infoItem}>
                <div className={studentStyles.label}>
                  <i className="fas fa-user-tag"></i> User Type
                </div>
                <div className={studentStyles.value}>{student.userType}</div>
              </div>

              {/* Full Width Items */}
              <div className={`${studentStyles.infoItem} ${studentStyles.fullWidthItem}`}>
                <div className={studentStyles.label}>
                  <i className="fas fa-info-circle"></i> Additional Information
                </div>
                <div className={studentStyles.value}>
                  {student.firstName} {student.lastName} is a {student.semester}th semester student in {student.department} department.
                  Currently residing in {student.city} and studying at FAST University.
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className={studentStyles.preferencesSection}>
              <h3 className={studentStyles.sectionTitle}>
                <i className="fas fa-star"></i> Accommodation Preferences
              </h3>
              <div className={studentStyles.preferencesGrid}>
                <div className={studentStyles.preferenceItem}>
                  <div className={studentStyles.preferenceIcon}>
                    <i className={`fas ${student.isAcRoom ? "fa-snowflake" : "fa-fan"}`}></i>
                  </div>
                  <div className={studentStyles.preferenceLabel}>AC Room</div>
                  <div className={`${studentStyles.preferenceValue} ${
                    student.isAcRoom ? studentStyles.booleanTrue : studentStyles.booleanFalse
                  }`}>
                    {student.isAcRoom ? "Required" : "Not Required"}
                  </div>
                </div>

                <div className={studentStyles.preferenceItem}>
                  <div className={studentStyles.preferenceIcon}>
                    <i className={`fas ${student.isMess ? "fa-utensils" : "fa-utensil-spoon"}`}></i>
                  </div>
                  <div className={studentStyles.preferenceLabel}>Mess Service</div>
                  <div className={`${studentStyles.preferenceValue} ${
                    student.isMess ? studentStyles.booleanTrue : studentStyles.booleanFalse
                  }`}>
                    {student.isMess ? "Required" : "Not Required"}
                  </div>
                </div>

                <div className={studentStyles.preferenceItem}>
                  <div className={studentStyles.preferenceIcon}>
                    <i className="fas fa-users"></i>
                  </div>
                  <div className={studentStyles.preferenceLabel}>Room Capacity</div>
                  <div className={studentStyles.preferenceValue}>
                    {student.roommateCount + 1} Persons
                  </div>
                </div>

                <div className={studentStyles.preferenceItem}>
                  <div className={studentStyles.preferenceIcon}>
                    <i className="fas fa-university"></i>
                  </div>
                  <div className={studentStyles.preferenceLabel}>Distance to Uni</div>
                  <div className={studentStyles.preferenceValue}>
                    {formatDistance(student.universityDistance)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: "flex",
              gap: "15px",
              marginTop: "30px",
              padding: "20px",
              borderTop: "1px solid #eaeaea"
            }}>
              {!isApproved ? (
                <>
                  <button
                    style={{
                      padding: "12px 25px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "all 0.3s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#218838";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#28a745";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={handleApprove}
                  >
                    <i className="fa-solid fa-check"></i> Approve Student
                  </button>

                  <button
                    style={{
                      padding: "12px 25px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "all 0.3s",
                      marginLeft: "auto"

                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#c82333";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc3545";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-trash"></i> Delete Student
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  padding: "15px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  justifyContent: "center"
                }}>
                  <i className="fa-solid fa-check-circle"></i>
                  <span>This student has been approved</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "25px",
            width: "90%",
            maxWidth: "500px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px"
            }}>
              <i className="fa-solid fa-exclamation-triangle" style={{
                color: "#dc3545",
                marginRight: "10px",
                fontSize: "24px"
              }}></i>
              <h3 style={{
                margin: 0,
                color: "#dc3545",
                fontSize: "20px"
              }}>Confirm Delete</h3>
            </div>
            <div style={{ marginBottom: "25px" }}>
              <p style={{
                marginBottom: "10px",
                fontSize: "16px",
                lineHeight: "1.5"
              }}>
                Are you sure you want to delete <strong>{student?.fullName}</strong>?
              </p>
              <p style={{
                color: "#dc3545",
                backgroundColor: "#f8d7da",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px"
              }}>
                <i className="fa-solid fa-exclamation-circle" style={{ marginTop: "2px" }}></i>
                <span>This is a dummy action. No data will be actually deleted.</span>
              </p>
            </div>
            <div style={{
              display: "flex",
              gap: "15px",
              justifyContent: "flex-end"
            }}>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a6268";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#6c757d";
                }}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#c82333";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc3545";
                }}
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Font Awesome Icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
    </div>
  );
};

export default AdminStudentProfile;