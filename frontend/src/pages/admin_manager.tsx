// import React, { useEffect, useState, useMemo } from "react";
// import { getAllManagersTableData, type ManagerTableRow } from "../api/admin_manager";
// import styles from "../styles/admin_dashboard.module.css";
// import { Link } from "react-router-dom";

// const AdminViewManagers: React.FC = () => {
//   const [managers, setManagers] = useState<ManagerTableRow[]>([]);
//   const [search, setSearch] = useState("");
//   const [filterType, setFilterType] = useState("All");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadManagers = async () => {
//       try {
//         setLoading(true);
//         const data = await getAllManagersTableData();
//         setManagers(data);
//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to load managers data. Please try again later.");
//         setLoading(false);
//       }
//     };

//     loadManagers();
//   }, []);

//   // Get unique manager types from data
//   const managerTypes = useMemo(() => {
//     const types = new Set(managers.map(m => m.type).filter(Boolean));
//     return Array.from(types).sort();
//   }, [managers]);

//   // --------- SEARCH + FILTER ----------
//   const filteredManagers = useMemo(() => {
//     return managers.filter(m => {
//       // Search filter
//       const searchTerm = search.toLowerCase();
//       const matchesSearch =
//         m.name.toLowerCase().includes(searchTerm) ||
//         m.phone.toLowerCase().includes(searchTerm) ||
//         m.education.toLowerCase().includes(searchTerm);

//       // Type filter
//       if (filterType === "All") {
//         return matchesSearch;
//       }

//       return matchesSearch && m.type.toLowerCase() === filterType.toLowerCase();
//     });
//   }, [managers, search, filterType]);

//   // Show only error on full page if there's a critical error
//   if (error) {
//     return (
//       <div className={styles.container} style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
//         <h2>{error}</h2>
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

//         <h2 className={styles.pageTitle}><i className="fa-solid fa-user-tie"></i> Hostel Managers</h2>
//         <p className={styles.subtitle}>View and manage hostel manager accounts near FAST Lahore.</p>

//         {/* SEARCH + FILTER BAR */}
//         <div style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: "20px",
//           flexWrap: "wrap",
//           gap: "10px"
//         }}>

//           {/* Search Field */}
//           <input
//             type="text"
//             placeholder="Search manager by name, phone, or education..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             style={{
//               padding: "10px",
//               borderRadius: "8px",
//               width: "300px",
//               border: "1px solid #ddd",
//               backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
//               color: loading ? "#7a6648" : "#4c3f30",
//             }}
//             disabled={loading}
//           />

//           {/* Filter Dropdown */}
//           <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//             <span style={{ color: "#666", fontSize: "14px" }}>Filter by type:</span>
//             <select
//               value={filterType}
//               onChange={(e) => setFilterType(e.target.value)}
//               style={{
//                 padding: "10px",
//                 borderRadius: "8px",
//                 border: "1px solid #ddd",
//                 backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
//                 color: loading ? "#7a6648" : "#4c3f30",
//                 minWidth: "150px"
//               }}
//               disabled={loading}
//             >
//               <option value="All">All Types ({managers.length})</option>
//               {managerTypes.map((type) => (
//                 <option key={type} value={type}>
//                   {type} ({managers.filter(m => m.type === type).length})
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* RESULTS SUMMARY */}
//         {!loading && (
//           <div style={{
//             marginBottom: "15px",
//             color: "#666",
//             fontSize: "14px",
//             display: "flex",
//             alignItems: "center",
//             gap: "10px"
//           }}>
//             <i className="fa-solid fa-info-circle"></i>
//             <span>
//               Showing {filteredManagers.length} of {managers.length} manager(s)
//               {filterType !== "All" && ` (filtered by: ${filterType})`}
//               {search && ` (search: "${search}")`}
//             </span>
//           </div>
//         )}

//         {/* TABLE */}
//         <div className={styles.tableCard}>
//           <table>
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>Phone</th>
//                 <th>Type</th>
//                 <th>Education</th>
//                 <th>Operating Hours</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} style={{
//                     textAlign: "center",
//                     padding: "40px 20px",
//                     color: "#666"
//                   }}>
//                     <div style={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       gap: "10px"
//                     }}>
//                       <i className="fa-solid fa-spinner fa-spin" style={{
//                         fontSize: "18px",
//                         marginRight: "8px"
//                       }}></i>
//                       Loading managers...
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredManagers.length > 0 ? (
//                 filteredManagers.map((m) => (
//                   <tr key={m.id}>
//                     <td>{m.name}</td>
//                     <td>{m.phone}</td>
//                     <td>
//                       <span style={{
//                         display: "inline-block",
//                         padding: "4px 8px",
//                         borderRadius: "4px",
//                         fontSize: "12px",
//                         fontWeight: "bold",
//                         backgroundColor:
//                           m.type === "Owner" ? "#e8f5e8" :
//                           m.type === "Employee" ? "#e8f5ff" :
//                           m.type === "Manager" ? "#f5f0ff" : "#f5f5f5",
//                         color:
//                           m.type === "Owner" ? "#2e7d32" :
//                           m.type === "Employee" ? "#1565c0" :
//                           m.type === "Manager" ? "#5e35b1" : "#666"
//                       }}>
//                         {m.type}
//                       </span>
//                     </td>
//                     <td>{m.education}</td>
//                     <td>{m.operatingHours} hours</td>
//                     <td>
//                       <button className={styles.actionBtn}>View</button>{" "}
//                       <button className={`${styles.actionBtn}`} style={{ background: "#c0392b" }}>
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={6} style={{
//                     textAlign: "center",
//                     padding: "40px 20px",
//                     color: "#666"
//                   }}>
//                     <div style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       gap: "15px"
//                     }}>
//                       <i className="fa-solid fa-user-slash" style={{
//                         fontSize: "48px",
//                         color: "#ddd"
//                       }}></i>
//                       <div>
//                         <h4 style={{ marginBottom: "5px" }}>No managers found</h4>
//                         <p style={{ margin: 0, fontSize: "14px", maxWidth: "400px" }}>
//                           {search || filterType !== "All"
//                             ? `No managers match your ${search ? `search "${search}"` : ""}${search && filterType !== "All" ? ' and ' : ''}${filterType !== "All" ? `filter "${filterType}"` : ''}.`
//                             : "There are no managers in the system yet."}
//                         </p>
//                         {(search || filterType !== "All") && (
//                           <button
//                             onClick={() => {
//                               setSearch("");
//                               setFilterType("All");
//                             }}
//                             style={{
//                               marginTop: "15px",
//                               padding: "8px 16px",
//                               backgroundColor: "#3498db",
//                               color: "white",
//                               border: "none",
//                               borderRadius: "4px",
//                               cursor: "pointer"
//                             }}
//                           >
//                             Clear filters
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminViewManagers;






import React, { useEffect, useState, useMemo } from "react";
import { getAllManagersTableData, CACHE_MANAGERS, type ManagerTableRow } from "../api/admin_manager";
import { cacheGet } from "../utils/cache";
import SkeletonRow from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import { Link } from "react-router-dom";

const AdminViewManagers: React.FC = () => {
  const [managers, setManagers] = useState<ManagerTableRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Phase 1: instant render from cache
    const cached = cacheGet<ManagerTableRow[]>(CACHE_MANAGERS);
    if (cached) {
      setManagers(cached);
      setLoading(false);
    }

    // Phase 2: background refresh
    getAllManagersTableData(true)
      .then(data => {
        setManagers(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cached) setError("Failed to load managers data. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Get unique manager types from data
  const managerTypes = useMemo(() => {
    const types = new Set(managers.map(m => m.type).filter(Boolean));
    return Array.from(types).sort();
  }, [managers]);

  // --------- SEARCH + FILTER ----------
  const filteredManagers = useMemo(() => {
    return managers.filter(m => {
      // Search filter
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm) ||
        m.phone.toLowerCase().includes(searchTerm) ||
        m.education.toLowerCase().includes(searchTerm);

      // Type filter
      if (filterType === "All") {
        return matchesSearch;
      }

      return matchesSearch && m.type.toLowerCase() === filterType.toLowerCase();
    });
  }, [managers, search, filterType]);

  // Show only error on full page if there's a critical error
  if (error) {
    return (
      <div className={styles.container} style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        <h2>{error}</h2>
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

        <h2 className={styles.pageTitle}><i className="fa-solid fa-user-tie"></i> Hostel Managers</h2>
        <p className={styles.subtitle}>View and manage hostel manager accounts near FAST Lahore.</p>

        {/* SEARCH + FILTER BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px"
        }}>

          {/* Search Field */}
          <input
            type="text"
            placeholder="Search manager by name, phone, or education..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              width: "300px",
              border: "1px solid #ddd",
              backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
              color: loading ? "#7a6648" : "#4c3f30",
            }}
            disabled={loading}
          />

          {/* Filter Dropdown */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>Filter by type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
                color: loading ? "#7a6648" : "#4c3f30",
                minWidth: "150px"
              }}
              disabled={loading}
            >
              <option value="All">All Types ({managers.length})</option>
              {managerTypes.map((type) => (
                <option key={type} value={type}>
                  {type} ({managers.filter(m => m.type === type).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS SUMMARY */}
        {!loading && (
          <div style={{
            marginBottom: "15px",
            color: "#666",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <i className="fa-solid fa-info-circle"></i>
            <span>
              Showing {filteredManagers.length} of {managers.length} manager(s)
              {filterType !== "All" && ` (filtered by: ${filterType})`}
              {search && ` (search: "${search}")`}
            </span>
          </div>
        )}

        {/* TABLE */}
        <div className={styles.tableCard}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Type</th>
                <th>Education</th>
                <th>Operating Hours</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <SkeletonRow cols={6} rows={6} />
              ) : filteredManagers.length > 0 ? (
                filteredManagers.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.phone}</td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor:
                          m.type === "Owner" ? "#e8f5e8" :
                          m.type === "Employee" ? "#e8f5ff" :
                          m.type === "Manager" ? "#f5f0ff" : "#f5f5f5",
                        color:
                          m.type === "Owner" ? "#2e7d32" :
                          m.type === "Employee" ? "#1565c0" :
                          m.type === "Manager" ? "#5e35b1" : "#666"
                      }}>
                        {m.type}
                      </span>
                    </td>
                    <td>{m.education}</td>
                    <td>{m.operatingHours} hours</td>
                    <td>
                      <Link
                        to={`/admin/managers/${m.id}`}
                        className={styles.actionBtn}
                        style={{
                          display: "inline-block",
                          padding: "8px 16px",
                          backgroundColor: "#3498db",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          textDecoration: "none",
                          textAlign: "center",
                          width: "100%"
                        }}
                      >
                        <i className="fa-solid fa-eye"></i> View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#666"
                  }}>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "15px"
                    }}>
                      <i className="fa-solid fa-user-slash" style={{
                        fontSize: "48px",
                        color: "#ddd"
                      }}></i>
                      <div>
                        <h4 style={{ marginBottom: "5px" }}>No managers found</h4>
                        <p style={{ margin: 0, fontSize: "14px", maxWidth: "400px" }}>
                          {search || filterType !== "All"
                            ? `No managers match your ${search ? `search "${search}"` : ""}${search && filterType !== "All" ? ' and ' : ''}${filterType !== "All" ? `filter "${filterType}"` : ''}.`
                            : "There are no managers in the system yet."}
                        </p>
                        {(search || filterType !== "All") && (
                          <button
                            onClick={() => {
                              setSearch("");
                              setFilterType("All");
                            }}
                            style={{
                              marginTop: "15px",
                              padding: "8px 16px",
                              backgroundColor: "#3498db",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminViewManagers;