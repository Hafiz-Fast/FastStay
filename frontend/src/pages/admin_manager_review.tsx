// // import React, { useEffect, useState } from "react";
// // import { useParams, useNavigate, Link } from "react-router-dom";
// // import { getManagerById, getUserForManager, type ManagerTableRow } from "../api/admin_manager_review";
// // import type { RawUser } from "../api/admin_manager_review";
// // import styles from "../styles/admin_dashboard.module.css";
// // import managerStyles from "../styles/admin_manager_profile.module.css";

// // const AdminManagerProfile: React.FC = () => {
// //   const { id } = useParams<{ id: string }>();
// //   const navigate = useNavigate();

// //   const [manager, setManager] = useState<ManagerTableRow | null>(null);
// //   const [userDetails, setUserDetails] = useState<RawUser | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     const fetchManagerData = async () => {
// //       if (!id) {
// //         setError("Manager ID is missing");
// //         setLoading(false);
// //         return;
// //       }

// //       try {
// //         setLoading(true);
// //         const managerId = parseInt(id);

// //         // Fetch manager details and user details in parallel
// //         const [managerData, userData] = await Promise.all([
// //           getManagerById(managerId),
// //           getUserForManager(managerId)
// //         ]);

// //         if (managerData) {
// //           setManager(managerData);
// //           setUserDetails(userData);
// //         } else {
// //           setError(`Manager with ID ${managerId} not found`);
// //         }
// //       } catch (err) {
// //         console.error("Error fetching manager profile:", err);
// //         setError("Failed to load manager profile. Please try again.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchManagerData();
// //   }, [id]);

// //   const handleDelete = async () => {
// //     if (!manager) return;

// //     if (window.confirm(`Are you sure you want to delete ${manager.name}? This action cannot be undone.`)) {
// //       try {
// //         // Add your delete API call here
// //         console.log("Deleting manager:", manager.id);
// //         // await deleteManager(manager.id);

// //         // Navigate back to managers list after deletion
// //         navigate("/admin/managers");
// //       } catch (err) {
// //         console.error("Error deleting manager:", err);
// //         alert("Failed to delete manager. Please try again.");
// //       }
// //     }
// //   };

// //   const formatOperatingHours = (hours: number) => {
// //     // Assuming operating hours is a number representing total hours per day
// //     if (hours === 24) return "24 hours";
// //     if (hours <= 12) return `${hours} hours`;

// //     // Convert to 12-hour format if needed
// //     const start = 9; // Default start time
// //     const end = start + hours;
// //     return `${start}:00 AM - ${end % 12 || 12}:00 ${end < 12 ? 'AM' : 'PM'}`;
// //   };

// //   if (loading) {
// //     return (
// //       <div>
// //         {/* NAVBAR */}
// //         <nav className={styles.navbar}>
// //           <div className={styles.logo}>
// //             <i className="fa-solid fa-user-shield"></i> FastStay Admin
// //           </div>
// //           <div className={styles.navLinks}>
// //             <Link to="/admin/dashboard">Dashboard</Link>
// //             <Link to="/admin/hostels">Hostels</Link>
// //             <Link to="/admin/students">Students</Link>
// //             <Link to="/admin/managers" className={styles.active}>Managers</Link>
// //             <Link to="/logout">Logout</Link>
// //           </div>
// //         </nav>

// //         <div className={styles.container}>
// //           <div className={managerStyles.loadingContainer}>
// //             <i className="fas fa-spinner fa-spin" style={{ marginRight: "10px" }}></i>
// //             Loading manager profile...
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (error || !manager) {
// //     return (
// //       <div>
// //         {/* NAVBAR */}
// //         <nav className={styles.navbar}>
// //           <div className={styles.logo}>
// //             <i className="fa-solid fa-user-shield"></i> FastStay Admin
// //           </div>
// //           <div className={styles.navLinks}>
// //             <Link to="/admin/dashboard">Dashboard</Link>
// //             <Link to="/admin/hostels">Hostels</Link>
// //             <Link to="/admin/students">Students</Link>
// //             <Link to="/admin/managers" className={styles.active}>Managers</Link>
// //             <Link to="/logout">Logout</Link>
// //           </div>
// //         </nav>

// //         <div className={styles.container}>
// //           <div className={managerStyles.errorContainer}>
// //             <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "20px" }}></i>
// //             <h2>Error Loading Manager</h2>
// //             <p>{error || "Manager not found"}</p>
// //             <button
// //               className={managerStyles.backButton}
// //               onClick={() => navigate("/admin/managers")}
// //               style={{ marginTop: "20px" }}
// //             >
// //               <i className="fas fa-arrow-left"></i> Back to Managers List
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div>
// //       {/* NAVBAR */}
// //       <nav className={styles.navbar}>
// //         <div className={styles.logo}>
// //           <i className="fa-solid fa-user-shield"></i> FastStay Admin
// //         </div>
// //         <div className={styles.navLinks}>
// //           <Link to="/admin/dashboard">Dashboard</Link>
// //           <Link to="/admin/hostels">Hostels</Link>
// //           <Link to="/admin/students">Students</Link>
// //           <Link to="/admin/managers" className={styles.active}>Managers</Link>
// //           <Link to="/logout">Logout</Link>
// //         </div>
// //       </nav>

// //       {/* PAGE CONTENT */}
// //       <div className={styles.container}>
// //         <div className={managerStyles.managerProfileCard}>
// //           {/* Header with Back Button */}
// //           <div className={managerStyles.profileHeader}>
// //             <div>
// //               <h2 className={styles.pageTitle}>
// //                 <i className="fa-solid fa-user-tie"></i> Manager Profile
// //               </h2>
// //               <p className={styles.subtitle}>Complete details of {manager.name}</p>
// //             </div>
// //             <button
// //               className={managerStyles.backButton}
// //               onClick={() => navigate("/admin/managers")}
// //             >
// //               <i className="fas fa-arrow-left"></i> Back to List
// //             </button>
// //           </div>

// //           {/* Profile Content */}
// //           <div className={managerStyles.profileBox}>
// //             {/* Profile Image */}
// //             <div>
// //               <div className={managerStyles.photoLabel}>Profile Photo</div>
// //               <img
// //                 src={manager.photoLink || "https://via.placeholder.com/180"}
// //                 alt={manager.name}
// //                 className={managerStyles.profileImg}
// //                 onError={(e) => {
// //                   e.currentTarget.src = "https://via.placeholder.com/180";
// //                 }}
// //               />
// //             </div>

// //             {/* Manager Information Grid */}
// //             <div className={managerStyles.profileInfo}>
// //               <div className={managerStyles.infoItem}>
// //                 <div className={managerStyles.label}>Full Name</div>
// //                 <div className={managerStyles.value}>{manager.name}</div>
// //               </div>

// //               <div className={managerStyles.infoItem}>
// //                 <div className={managerStyles.label}>Phone Number</div>
// //                 <div className={managerStyles.value}>
// //                   <i className="fas fa-phone" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                   {manager.phone}
// //                 </div>
// //               </div>

// //               <div className={managerStyles.infoItem}>
// //                 <div className={managerStyles.label}>Education</div>
// //                 <div className={managerStyles.value}>
// //                   <i className="fas fa-graduation-cap" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                   {manager.education}
// //                 </div>
// //               </div>

// //               <div className={managerStyles.infoItem}>
// //                 <div className={managerStyles.label}>Manager Type</div>
// //                 <div className={managerStyles.value}>
// //                   <i className="fas fa-briefcase" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                   {manager.type}
// //                 </div>
// //               </div>

// //               <div className={managerStyles.infoItem}>
// //                 <div className={managerStyles.label}>Operating Hours</div>
// //                 <div className={managerStyles.value}>
// //                   <i className="fas fa-clock" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                   {formatOperatingHours(manager.operatingHours)}
// //                 </div>
// //               </div>

// //               <div className={managerStyles.infoItem}>
// //                 <div className={managerStyles.label}>Manager ID</div>
// //                 <div className={managerStyles.value}>
// //                   <i className="fas fa-id-card" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                   {manager.id}
// //                 </div>
// //               </div>

// //               {/* Additional User Details from users API */}
// //               {userDetails && (
// //                 <>
// //                   <div className={managerStyles.infoItem}>
// //                     <div className={managerStyles.label}>Age</div>
// //                     <div className={managerStyles.value}>
// //                       <i className="fas fa-birthday-cake" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                       {userDetails.age} years
// //                     </div>
// //                   </div>

// //                   <div className={managerStyles.infoItem}>
// //                     <div className={managerStyles.label}>Gender</div>
// //                     <div className={managerStyles.value}>
// //                       <i className="fas fa-venus-mars" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                       {userDetails.gender}
// //                     </div>
// //                   </div>

// //                   <div className={managerStyles.infoItem}>
// //                     <div className={managerStyles.label}>City</div>
// //                     <div className={managerStyles.value}>
// //                       <i className="fas fa-city" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                       {userDetails.city}
// //                     </div>
// //                   </div>

// //                   <div className={managerStyles.infoItem}>
// //                     <div className={managerStyles.label}>User Type</div>
// //                     <div className={managerStyles.value}>
// //                       <i className="fas fa-user-tag" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
// //                       {userDetails.usertype}
// //                     </div>
// //                   </div>
// //                 </>
// //               )}
// //             </div>
// //           </div>

// //           {/* Action Buttons */}
// //           <div className={managerStyles.managerActions}>
// //             <button
// //               className={managerStyles.primaryButton}
// //               onClick={() => {
// //                 // Navigate to hostels managed by this manager
// //                 navigate(`/admin/hostels?manager=${manager.id}`);
// //               }}
// //             >
// //               <i className="fa-solid fa-building"></i> View Hostels Managed
// //             </button>

// //             <button
// //               className={managerStyles.secondaryButton}
// //               onClick={() => {
// //                 // Edit manager functionality
// //                 console.log("Edit manager:", manager.id);
// //                 // navigate(`/admin/managers/edit/${manager.id}`);
// //               }}
// //             >
// //               <i className="fas fa-edit"></i> Edit Profile
// //             </button>

// //             <button
// //               className={managerStyles.dangerButton}
// //               onClick={handleDelete}
// //             >
// //               <i className="fas fa-trash-alt"></i> Delete Manager
// //             </button>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Font Awesome Icons */}
// //       <link
// //         rel="stylesheet"
// //         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
// //       />
// //     </div>
// //   );
// // };

// // export default AdminManagerProfile;





// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { getManagerById, getUserForManager, type ManagerTableRow } from "../api/admin_manager_review";
// import type { RawUser } from "../api/admin_manager_review";
// import styles from "../styles/admin_dashboard.module.css";
// import managerStyles from "../styles/admin_manager_profile.module.css";

// const AdminManagerProfile: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [manager, setManager] = useState<ManagerTableRow | null>(null);
//   const [userDetails, setUserDetails] = useState<RawUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchManagerData = async () => {
//       if (!id) {
//         setError("Manager ID is missing");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const managerId = parseInt(id);

//         // Fetch manager details and user details in parallel
//         const [managerData, userData] = await Promise.all([
//           getManagerById(managerId),
//           getUserForManager(managerId)
//         ]);

//         if (managerData) {
//           setManager(managerData);
//           setUserDetails(userData);
//         } else {
//           setError(`Manager with ID ${managerId} not found`);
//         }
//       } catch (err) {
//         console.error("Error fetching manager profile:", err);
//         setError("Failed to load manager profile. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchManagerData();
//   }, [id]);

//   const handleDelete = async () => {
//     if (!manager) return;

//     if (window.confirm(`Are you sure you want to delete ${manager.name}? This action cannot be undone.`)) {
//       try {
//         // Add your delete API call here
//         console.log("Deleting manager:", manager.id);
//         // await deleteManager(manager.id);

//         // Navigate back to managers list after deletion
//         navigate("/admin/managers");
//       } catch (err) {
//         console.error("Error deleting manager:", err);
//         alert("Failed to delete manager. Please try again.");
//       }
//     }
//   };

//   const formatOperatingHours = (hours: number) => {
//     // Assuming operating hours is a number representing total hours per day
//     if (hours === 24) return "24 hours";
//     if (hours <= 12) return `${hours} hours`;

//     // Convert to 12-hour format if needed
//     const start = 9; // Default start time
//     const end = start + hours;
//     return `${start}:00 AM - ${end % 12 || 12}:00 ${end < 12 ? 'AM' : 'PM'}`;
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
//             <Link to="/admin/students">Students</Link>
//             <Link to="/admin/managers" className={styles.active}>Managers</Link>
//             <Link to="/admin/logout">Logout</Link>
//           </div>
//         </nav>

//         <div className={styles.container}>
//           <div className={managerStyles.errorContainer}>
//             <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "20px" }}></i>
//             <h2>Error Loading Manager</h2>
//             <p>{error || "Manager not found"}</p>
//             <button
//               className={managerStyles.backButton}
//               onClick={() => navigate("/admin/managers")}
//               style={{ marginTop: "20px" }}
//             >
//               <i className="fas fa-arrow-left"></i> Back to Managers List
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
//           <Link to="/admin/students">Students</Link>
//           <Link to="/admin/managers" className={styles.active}>Managers</Link>
//           <Link to="/admin/logout">Logout</Link>
//         </div>
//       </nav>

//       {/* PAGE CONTENT */}
//       <div className={styles.container}>
//         {/* Loading state within the profile card */}
//         {loading ? (
//           <div className={managerStyles.managerProfileCard}>
//             <div className={managerStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-tie"></i> Manager Profile
//                 </h2>
//                 <p className={styles.subtitle}>Loading manager details...</p>
//               </div>
//               <button
//                 className={managerStyles.backButton}
//                 onClick={() => navigate("/admin/managers")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             <div className={managerStyles.profileBox} style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "60px 20px",
//               textAlign: "center",
//               minHeight: "400px"
//             }}>
//               <i className="fa-solid fa-spinner fa-spin" style={{
//                 fontSize: "32px",
//                 marginBottom: "20px",
//                 color: "#5c3d2e"
//               }}></i>
//               <h3 style={{ marginBottom: "10px", color: "#5c3d2e" }}>Loading manager profile...</h3>
//               <p style={{ color: "#666" }}>Please wait while we fetch the manager information</p>
//             </div>
//           </div>
//         ) : !manager ? (
//           <div className={managerStyles.managerProfileCard}>
//             <div className={managerStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-tie"></i> Manager Profile
//                 </h2>
//                 <p className={styles.subtitle}>Manager not found</p>
//               </div>
//               <button
//                 className={managerStyles.backButton}
//                 onClick={() => navigate("/admin/managers")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             <div className={managerStyles.profileBox} style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "60px 20px",
//               textAlign: "center",
//               minHeight: "400px"
//             }}>
//               <i className="fas fa-user-slash" style={{
//                 fontSize: "48px",
//                 marginBottom: "20px",
//                 color: "#999"
//               }}></i>
//               <h3 style={{ marginBottom: "10px", color: "#666" }}>Manager Not Found</h3>
//               <p style={{ color: "#666", marginBottom: "20px" }}>The requested manager could not be found or no longer exists.</p>
//             </div>
//           </div>
//         ) : (
//           <div className={managerStyles.managerProfileCard}>
//             {/* Header with Back Button */}
//             <div className={managerStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-tie"></i> Manager Profile
//                 </h2>
//                 <p className={styles.subtitle}>Complete details of {manager.name}</p>
//               </div>
//               <button
//                 className={managerStyles.backButton}
//                 onClick={() => navigate("/admin/managers")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             {/* Profile Content */}
//             <div className={managerStyles.profileBox}>
//               {/* Profile Image */}
//               <div>
//                 <div className={managerStyles.photoLabel}>Profile Photo</div>
//                 <img
//                   src={manager.photoLink || "https://via.placeholder.com/180"}
//                   alt={manager.name}
//                   className={managerStyles.profileImg}
//                   onError={(e) => {
//                     e.currentTarget.src = "https://via.placeholder.com/180";
//                   }}
//                 />
//               </div>

//               {/* Manager Information Grid */}
//               <div className={managerStyles.profileInfo}>
//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Full Name</div>
//                   <div className={managerStyles.value}>{manager.name}</div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Phone Number</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-phone" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.phone}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Education</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-graduation-cap" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.education}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Manager Type</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-briefcase" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.type}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Operating Hours</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-clock" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {formatOperatingHours(manager.operatingHours)}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Manager ID</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-id-card" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.id}
//                   </div>
//                 </div>

//                 {/* Additional User Details from users API */}
//                 {userDetails && (
//                   <>
//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>Age</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-birthday-cake" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.age} years
//                       </div>
//                     </div>

//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>Gender</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-venus-mars" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.gender}
//                       </div>
//                     </div>

//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>City</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-city" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.city}
//                       </div>
//                     </div>

//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>User Type</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-user-tag" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.usertype}
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className={managerStyles.managerActions}>
//               <button
//                 className={managerStyles.primaryButton}
//                 onClick={() => {
//                   // Navigate to hostels managed by this manager
//                   navigate(`/admin/hostels?manager=${manager.id}`);
//                 }}
//               >
//                 <i className="fa-solid fa-building"></i> View Hostels Managed
//               </button>

//               <button
//                 className={managerStyles.secondaryButton}
//                 onClick={() => {
//                   // Edit manager functionality
//                   console.log("Edit manager:", manager.id);
//                   // navigate(`/admin/managers/edit/${manager.id}`);
//                 }}
//               >
//                 <i className="fas fa-edit"></i> Edit Profile
//               </button>

//               <button
//                 className={managerStyles.dangerButton}
//                 onClick={handleDelete}
//               >
//                 <i className="fas fa-trash-alt"></i> Delete Manager
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

// export default AdminManagerProfile;






// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { getManagerById, getUserForManager, deleteManager, type ManagerTableRow } from "../api/admin_manager_review";
// import type { RawUser } from "../api/admin_manager_review";
// import styles from "../styles/admin_dashboard.module.css";
// import managerStyles from "../styles/admin_manager_profile.module.css";

// const AdminManagerProfile: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [manager, setManager] = useState<ManagerTableRow | null>(null);
//   const [userDetails, setUserDetails] = useState<RawUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [deleteSuccess, setDeleteSuccess] = useState(false);
//   const [actionMessage, setActionMessage] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchManagerData = async () => {
//       if (!id) {
//         setError("Manager ID is missing");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const managerId = parseInt(id);

//         // Fetch manager details and user details in parallel
//         const [managerData, userData] = await Promise.all([
//           getManagerById(managerId),
//           getUserForManager(managerId)
//         ]);

//         if (managerData) {
//           setManager(managerData);
//           setUserDetails(userData);
//         } else {
//           setError(`Manager with ID ${managerId} not found`);
//         }
//       } catch (err) {
//         console.error("Error fetching manager profile:", err);
//         setError("Failed to load manager profile. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchManagerData();
//   }, [id]);

//   const handleDelete = async () => {
//     if (!manager) return;

//     setShowDeleteConfirm(true);
//   };

//   const confirmDelete = async () => {
//     if (!manager) return;

//     try {
//       setDeleteLoading(true);
//       setActionMessage(null);

//       console.log(`Deleting manager: ${manager.name} (ID: ${manager.id})`);
//       const success = await deleteManager(manager.id);

//       if (success) {
//         console.log("Manager deleted successfully!");
//         setDeleteSuccess(true);
//         setActionMessage("Manager deleted successfully!");

//         // Wait 2 seconds then redirect to managers list
//         setTimeout(() => {
//           navigate("/admin/managers");
//         }, 2000);
//       } else {
//         console.log("Delete failed - API returned false");
//         setActionMessage("Failed to delete manager. Please try again.");
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//       setActionMessage("Error deleting manager. Please try again.");
//     } finally {
//       setDeleteLoading(false);
//       setShowDeleteConfirm(false);
//     }
//   };

//   const formatOperatingHours = (hours: number) => {
//     if (hours === 24) return "24 hours";
//     if (hours <= 12) return `${hours} hours`;

//     const start = 9;
//     const end = start + hours;
//     return `${start}:00 AM - ${end % 12 || 12}:00 ${end < 12 ? 'AM' : 'PM'}`;
//   };

//   // If delete was successful and we're about to redirect
//   if (deleteSuccess) {
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
//             <Link to="/admin/students">Students</Link>
//             <Link to="/admin/managers" className={styles.active}>Managers</Link>
//             <Link to="/admin/logout">Logout</Link>
//           </div>
//         </nav>

//         <div className={styles.container}>
//           <div className="custom-card" style={{
//             maxWidth: "500px",
//             margin: "50px auto",
//             textAlign: "center",
//             padding: "40px 20px"
//           }}>
//             <i className="fa-solid fa-check-circle" style={{
//               fontSize: "48px",
//               color: "#28a745",
//               marginBottom: "20px"
//             }}></i>
//             <h2 style={{ marginBottom: "15px", color: "#5c3d2e" }}>Manager Deleted Successfully!</h2>
//             <p style={{ marginBottom: "25px", color: "#666" }}>Redirecting to managers list...</p>
//             <div className="fa-spin" style={{ fontSize: "24px", color: "#5c3d2e" }}>
//               <i className="fa-solid fa-spinner"></i>
//             </div>
//             <div style={{ marginTop: "30px" }}>
//               <Link
//                 to="/admin/managers"
//                 style={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   padding: "10px 20px",
//                   backgroundColor: "#5c3d2e",
//                   color: "#f8f3e7",
//                   textDecoration: "none",
//                   borderRadius: "8px"
//                 }}
//               >
//                 <i className="fa-solid fa-arrow-left"></i> Go to Managers List
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

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
//             <Link to="/admin/students">Students</Link>
//             <Link to="/admin/managers" className={styles.active}>Managers</Link>
//             <Link to="/admin/logout">Logout</Link>
//           </div>
//         </nav>

//         <div className={styles.container}>
//           <div className={managerStyles.errorContainer}>
//             <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "20px" }}></i>
//             <h2>Error Loading Manager</h2>
//             <p>{error || "Manager not found"}</p>
//             <button
//               className={managerStyles.backButton}
//               onClick={() => navigate("/admin/managers")}
//               style={{ marginTop: "20px" }}
//             >
//               <i className="fas fa-arrow-left"></i> Back to Managers List
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
//           <Link to="/admin/students">Students</Link>
//           <Link to="/admin/managers" className={styles.active}>Managers</Link>
//           <Link to="/admin/logout">Logout</Link>
//         </div>
//       </nav>

//       {/* PAGE CONTENT */}
//       <div className={styles.container}>
//         {/* Action Messages */}
//         {actionMessage && (
//           <div className={`custom-message ${actionMessage.includes("successfully") ? "custom-success-message" : "custom-error-message"}`}>
//             <i className={`fa-solid ${actionMessage.includes("successfully") ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
//             <span>{actionMessage}</span>
//           </div>
//         )}

//         {/* Loading state within the profile card */}
//         {loading ? (
//           <div className={managerStyles.managerProfileCard}>
//             <div className={managerStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-tie"></i> Manager Profile
//                 </h2>
//                 <p className={styles.subtitle}>Loading manager details...</p>
//               </div>
//               <button
//                 className={managerStyles.backButton}
//                 onClick={() => navigate("/admin/managers")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             <div className={managerStyles.profileBox} style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "60px 20px",
//               textAlign: "center",
//               minHeight: "400px"
//             }}>
//               <i className="fa-solid fa-spinner fa-spin" style={{
//                 fontSize: "32px",
//                 marginBottom: "20px",
//                 color: "#5c3d2e"
//               }}></i>
//               <h3 style={{ marginBottom: "10px", color: "#5c3d2e" }}>Loading manager profile...</h3>
//               <p style={{ color: "#666" }}>Please wait while we fetch the manager information</p>
//             </div>
//           </div>
//         ) : !manager ? (
//           <div className={managerStyles.managerProfileCard}>
//             <div className={managerStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-tie"></i> Manager Profile
//                 </h2>
//                 <p className={styles.subtitle}>Manager not found</p>
//               </div>
//               <button
//                 className={managerStyles.backButton}
//                 onClick={() => navigate("/admin/managers")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             <div className={managerStyles.profileBox} style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "60px 20px",
//               textAlign: "center",
//               minHeight: "400px"
//             }}>
//               <i className="fas fa-user-slash" style={{
//                 fontSize: "48px",
//                 marginBottom: "20px",
//                 color: "#999"
//               }}></i>
//               <h3 style={{ marginBottom: "10px", color: "#666" }}>Manager Not Found</h3>
//               <p style={{ color: "#666", marginBottom: "20px" }}>The requested manager could not be found or no longer exists.</p>
//             </div>
//           </div>
//         ) : (
//           <div className={managerStyles.managerProfileCard}>
//             {/* Header with Back Button */}
//             <div className={managerStyles.profileHeader}>
//               <div>
//                 <h2 className={styles.pageTitle}>
//                   <i className="fa-solid fa-user-tie"></i> Manager Profile
//                 </h2>
//                 <p className={styles.subtitle}>Complete details of {manager.name}</p>
//               </div>
//               <button
//                 className={managerStyles.backButton}
//                 onClick={() => navigate("/admin/managers")}
//               >
//                 <i className="fas fa-arrow-left"></i> Back to List
//               </button>
//             </div>

//             {/* Profile Content */}
//             <div className={managerStyles.profileBox}>
//               {/* Profile Image */}
//               <div>
//                 <div className={managerStyles.photoLabel}>Profile Photo</div>
//                 <img
//                   src={manager.photoLink || "https://via.placeholder.com/180"}
//                   alt={manager.name}
//                   className={managerStyles.profileImg}
//                   onError={(e) => {
//                     e.currentTarget.src = "https://via.placeholder.com/180";
//                   }}
//                 />
//               </div>

//               {/* Manager Information Grid */}
//               <div className={managerStyles.profileInfo}>
//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Full Name</div>
//                   <div className={managerStyles.value}>{manager.name}</div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Phone Number</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-phone" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.phone}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Education</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-graduation-cap" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.education}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Manager Type</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-briefcase" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.type}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Operating Hours</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-clock" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {formatOperatingHours(manager.operatingHours)}
//                   </div>
//                 </div>

//                 <div className={managerStyles.infoItem}>
//                   <div className={managerStyles.label}>Manager ID</div>
//                   <div className={managerStyles.value}>
//                     <i className="fas fa-id-card" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                     {manager.id}
//                   </div>
//                 </div>

//                 {/* Additional User Details from users API */}
//                 {userDetails && (
//                   <>
//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>Age</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-birthday-cake" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.age} years
//                       </div>
//                     </div>

//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>Gender</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-venus-mars" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.gender}
//                       </div>
//                     </div>

//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>City</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-city" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.city}
//                       </div>
//                     </div>

//                     <div className={managerStyles.infoItem}>
//                       <div className={managerStyles.label}>User Type</div>
//                       <div className={managerStyles.value}>
//                         <i className="fas fa-user-tag" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
//                         {userDetails.usertype}
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className={managerStyles.managerActions}>
//               <button
//                 className={managerStyles.primaryButton}
//                 onClick={() => {
//                   navigate(`/admin/hostels?manager=${manager.id}`);
//                 }}
//               >
//                 <i className="fa-solid fa-building"></i> View Hostels Managed
//               </button>

//               <button
//                 className={managerStyles.secondaryButton}
//                 onClick={() => {
//                   // Edit manager functionality
//                   console.log("Edit manager:", manager.id);
//                   // navigate(`/admin/managers/edit/${manager.id}`);
//                 }}
//               >
//                 <i className="fas fa-edit"></i> Edit Profile
//               </button>

//               <button
//                 className={managerStyles.dangerButton}
//                 onClick={handleDelete}
//                 disabled={deleteLoading}
//               >
//                 {deleteLoading ? (
//                   <>
//                     <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fas fa-trash-alt"></i> Delete Manager
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Delete Confirmation Modal */}
//       {showDeleteConfirm && (
//         <div className="custom-modal-overlay">
//           <div className="custom-modal">
//             <div className="custom-modal-header">
//               <i className="fa-solid fa-exclamation-triangle" style={{ color: "#dc3545", marginRight: "10px" }}></i>
//               <h3>Confirm Delete</h3>
//             </div>
//             <div className="custom-modal-body">
//               <p>Are you sure you want to delete <strong>{manager?.name}</strong>?</p>
//               <p><strong>Manager ID:</strong> {manager?.id}</p>
//               <p><strong>Phone:</strong> {manager?.phone}</p>
//               <p className="custom-warning-text">
//                 <i className="fa-solid fa-exclamation-circle"></i> This action cannot be undone. All manager data and associated hostels will be affected.
//               </p>
//             </div>
//             <div className="custom-modal-footer">
//               <button
//                 className="custom-btn custom-btn-cancel"
//                 onClick={() => setShowDeleteConfirm(false)}
//                 disabled={deleteLoading}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="custom-btn custom-btn-confirm-delete"
//                 onClick={confirmDelete}
//                 disabled={deleteLoading}
//               >
//                 {deleteLoading ? (
//                   <>
//                     <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fas fa-trash-alt"></i> Delete Manager
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Font Awesome Icons */}
//       <link
//         rel="stylesheet"
//         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
//       />
//     </div>
//   );
// };

// export default AdminManagerProfile;







import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getManagerById, getUserForManager, deleteManager, CACHE_MANAGER_PROFILE, type ManagerTableRow } from "../api/admin_manager_review";
import type { RawUser } from "../api/admin_manager_review";
import { cacheGet, cacheSet } from "../utils/cache";
import { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import managerStyles from "../styles/admin_manager_profile.module.css";

const AdminManagerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [manager, setManager] = useState<ManagerTableRow | null>(null);
  const [userDetails, setUserDetails] = useState<RawUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Manager ID is missing");
      setLoading(false);
      return;
    }

    const managerId = parseInt(id);

    // Phase 1: instant render from cache
    const cached = cacheGet<{ manager: ManagerTableRow; userDetails: RawUser | null }>(CACHE_MANAGER_PROFILE(managerId));
    if (cached) {
      setManager(cached.manager);
      setUserDetails(cached.userDetails);
      setLoading(false);
    }

    // Phase 2: background refresh
    Promise.all([
      getManagerById(managerId),
      getUserForManager(managerId)
    ])
      .then(([managerData, userData]) => {
        if (managerData) {
          setManager(managerData);
          setUserDetails(userData);
          cacheSet(CACHE_MANAGER_PROFILE(managerId), { manager: managerData, userDetails: userData });
        } else if (!cached) {
          setError(`Manager with ID ${managerId} not found`);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error fetching manager profile:", err);
        if (!cached) setError("Failed to load manager profile. Please try again.");
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!manager) return;

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!manager) return;

    try {
      setDeleteLoading(true);
      setActionMessage(null);

      console.log(`Deleting manager: ${manager.name} (ID: ${manager.id})`);
      const success = await deleteManager(manager.id);

      if (success) {
        console.log("Manager deleted successfully!");
        setDeleteSuccess(true);
        setActionMessage("Manager deleted successfully! Redirecting...");

        // Wait 2 seconds then redirect to managers list
        setTimeout(() => {
          navigate("/admin/managers");
        }, 2000);
      } else {
        console.log("Delete failed - API returned false");
        setActionMessage("Failed to delete manager. Please try again.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setActionMessage("Error deleting manager. Please try again.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatOperatingHours = (hours: number) => {
    if (hours === 24) return "24 hours";
    if (hours <= 12) return `${hours} hours`;

    const start = 9;
    const end = start + hours;
    return `${start}:00 AM - ${end % 12 || 12}:00 ${end < 12 ? 'AM' : 'PM'}`;
  };

  // If delete was successful and we're about to redirect
  if (deleteSuccess) {
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
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/managers" className={styles.active}>Managers</Link>
            <Link to="/admin/suggestions">Suggestions</Link>
            <Link to="/admin/logout">Logout</Link>
          </div>
        </nav>

        <div className={styles.container}>
          <div className="custom-card" style={{
            maxWidth: "500px",
            margin: "50px auto",
            textAlign: "center",
            padding: "40px 20px"
          }}>
            <i className="fa-solid fa-check-circle" style={{
              fontSize: "48px",
              color: "#28a745",
              marginBottom: "20px"
            }}></i>
            <h2 style={{ marginBottom: "15px", color: "#5c3d2e" }}>Manager Deleted Successfully!</h2>
            <p style={{ marginBottom: "25px", color: "#666" }}>Redirecting to managers list...</p>
            <div className="fa-spin" style={{ fontSize: "24px", color: "#5c3d2e" }}>
              <i className="fa-solid fa-spinner"></i>
            </div>
            <div style={{ marginTop: "30px" }}>
              <Link
                to="/admin/managers"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "#5c3d2e",
                  color: "#f8f3e7",
                  textDecoration: "none",
                  borderRadius: "8px"
                }}
              >
                <i className="fa-solid fa-arrow-left"></i> Go to Managers List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/managers" className={styles.active}>Managers</Link>
            <Link to="/admin/logout">Logout</Link>
          </div>
        </nav>

        <div className={styles.container}>
          <div className={managerStyles.errorContainer}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", marginBottom: "20px" }}></i>
            <h2>Error Loading Manager</h2>
            <p>{error || "Manager not found"}</p>
            <button
              className={managerStyles.backButton}
              onClick={() => navigate("/admin/managers")}
              style={{ marginTop: "20px" }}
            >
              <i className="fas fa-arrow-left"></i> Back to Managers List
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
          <Link to="/admin/students">Students</Link>
          <Link to="/admin/managers" className={styles.active}>Managers</Link>
          <Link to="/admin/logout">Logout</Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className={styles.container}>
        {actionMessage && (
          <div style={{
            backgroundColor: actionMessage.includes("successfully") ? "#d4edda" : "#f8d7da",
            color: actionMessage.includes("successfully") ? "#155724" : "#721c24",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <i className={`fa-solid ${actionMessage.includes("successfully") ? "fa-check-circle" : "fa-exclamation-circle"}`} style={{ fontSize: "18px" }}></i>
            <span>{actionMessage}</span>
            {actionMessage.includes("successfully") && (
              <i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: "10px" }}></i>
            )}
          </div>
        )}

        {/* Loading state within the profile card */}
        {loading && !manager ? (
          <div className={managerStyles.managerProfileCard}>
            <div className={managerStyles.profileHeader}>
              <div>
                <h2 className={styles.pageTitle}>
                  <i className="fa-solid fa-user-tie"></i> Manager Profile
                </h2>
                <SkeletonBlock width="200px" height="16px" />
              </div>
              <button className={managerStyles.backButton} onClick={() => navigate("/admin/managers")}>
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>

            <div className={managerStyles.profileBox}>
              <div>
                <SkeletonBlock width="180px" height="180px" />
              </div>
              <div className={managerStyles.profileInfo}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={managerStyles.infoItem}>
                    <SkeletonBlock width="110px" height="13px" />
                    <SkeletonBlock width="90%" height="20px" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !manager ? (
          <div className={managerStyles.managerProfileCard}>
            <div className={managerStyles.profileHeader}>
              <div>
                <h2 className={styles.pageTitle}>
                  <i className="fa-solid fa-user-tie"></i> Manager Profile
                </h2>
                <p className={styles.subtitle}>Manager not found</p>
              </div>
              <button
                className={managerStyles.backButton}
                onClick={() => navigate("/admin/managers")}
              >
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>

            <div className={managerStyles.profileBox} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
              textAlign: "center",
              minHeight: "400px"
            }}>
              <i className="fas fa-user-slash" style={{
                fontSize: "48px",
                marginBottom: "20px",
                color: "#999"
              }}></i>
              <h3 style={{ marginBottom: "10px", color: "#666" }}>Manager Not Found</h3>
              <p style={{ color: "#666", marginBottom: "20px" }}>The requested manager could not be found or no longer exists.</p>
            </div>
          </div>
        ) : (
          <div className={managerStyles.managerProfileCard}>
            {/* Header with Back Button */}
            <div className={managerStyles.profileHeader}>
              <div>
                <h2 className={styles.pageTitle}>
                  <i className="fa-solid fa-user-tie"></i> Manager Profile
                </h2>
                <p className={styles.subtitle}>Complete details of {manager.name}</p>
              </div>
              <button
                className={managerStyles.backButton}
                onClick={() => navigate("/admin/managers")}
              >
                <i className="fas fa-arrow-left"></i> Back to List
              </button>
            </div>

            {/* Profile Content */}
            <div className={managerStyles.profileBox}>
              {/* Profile Image */}
              <div>
                <div className={managerStyles.photoLabel}>Profile Photo</div>
                <img
                  src={manager.photoLink || "https://via.placeholder.com/180"}
                  alt={manager.name}
                  className={managerStyles.profileImg}
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/180";
                  }}
                />
              </div>

              {/* Manager Information Grid */}
              <div className={managerStyles.profileInfo}>
                <div className={managerStyles.infoItem}>
                  <div className={managerStyles.label}>Full Name</div>
                  <div className={managerStyles.value}>{manager.name}</div>
                </div>

                <div className={managerStyles.infoItem}>
                  <div className={managerStyles.label}>Phone Number</div>
                  <div className={managerStyles.value}>
                    <i className="fas fa-phone" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                    {manager.phone}
                  </div>
                </div>

                <div className={managerStyles.infoItem}>
                  <div className={managerStyles.label}>Education</div>
                  <div className={managerStyles.value}>
                    <i className="fas fa-graduation-cap" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                    {manager.education}
                  </div>
                </div>

                <div className={managerStyles.infoItem}>
                  <div className={managerStyles.label}>Manager Type</div>
                  <div className={managerStyles.value}>
                    <i className="fas fa-briefcase" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                    {manager.type}
                  </div>
                </div>

                <div className={managerStyles.infoItem}>
                  <div className={managerStyles.label}>Operating Hours</div>
                  <div className={managerStyles.value}>
                    <i className="fas fa-clock" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                    {formatOperatingHours(manager.operatingHours)}
                  </div>
                </div>

                <div className={managerStyles.infoItem}>
                  <div className={managerStyles.label}>Manager ID</div>
                  <div className={managerStyles.value}>
                    <i className="fas fa-id-card" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                    {manager.id}
                  </div>
                </div>

                {/* Additional User Details from users API */}
                {userDetails && (
                  <>
                    <div className={managerStyles.infoItem}>
                      <div className={managerStyles.label}>Age</div>
                      <div className={managerStyles.value}>
                        <i className="fas fa-birthday-cake" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                        {userDetails.age} years
                      </div>
                    </div>

                    <div className={managerStyles.infoItem}>
                      <div className={managerStyles.label}>Gender</div>
                      <div className={managerStyles.value}>
                        <i className="fas fa-venus-mars" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                        {userDetails.gender}
                      </div>
                    </div>

                    <div className={managerStyles.infoItem}>
                      <div className={managerStyles.label}>City</div>
                      <div className={managerStyles.value}>
                        <i className="fas fa-city" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                        {userDetails.city}
                      </div>
                    </div>

                    <div className={managerStyles.infoItem}>
                      <div className={managerStyles.label}>User Type</div>
                      <div className={managerStyles.value}>
                        <i className="fas fa-user-tag" style={{ marginRight: "8px", color: "#8d5f3a" }}></i>
                        {userDetails.usertype}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "30px",
              padding: "20px",
              borderTop: "1px solid #eaeaea"
            }}>
              {/* View Managed Hostels */}
              <Link
                to={`/admin/managers/${id}/hostels`}
                style={{
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #5c3d2e, #8d5f3a)",
                  color: "#f8f3e7",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(92, 61, 46, 0.25)",
                  transition: "all 0.3s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(92, 61, 46, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(92, 61, 46, 0.25)";
                }}
              >
                <i className="fa-solid fa-building"></i> View Managed Hostels
              </Link>

              {/* Delete Manager */}
              <button
                style={{
                  padding: "12px 28px",
                  background: "linear-gradient(135deg, #dc3545, #c82333)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: deleteLoading ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.3s",
                  boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)",
                  opacity: deleteLoading ? 0.7 : 1
                }}
                onMouseOver={(e) => {
                  if (!deleteLoading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(220, 53, 69, 0.45)";
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
                }}
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Deleting...</>
                ) : (
                  <><i className="fa-solid fa-trash"></i> Delete Manager</>
                )}
              </button>
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
                Are you sure you want to delete <strong>{manager?.name}</strong>?
              </p>
              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "15px"
              }}>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Manager ID:</strong> {manager?.id}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Phone:</strong> {manager?.phone}
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Type:</strong> {manager?.type}
                </p>
              </div>
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
                <span>This action cannot be undone. All associated data will be permanently deleted.</span>
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
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i> Delete Manager
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

export default AdminManagerProfile;