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
import SkeletonRow, { SkeletonBlock } from "../components/SkeletonRow";
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
    <>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}><i className="fa-solid fa-user-shield"></i> FastStay Admin</div>
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
        <h2 className={styles.pageTitle}>
          <i className="fa-solid fa-user-tie" style={{ color: '#8d5f3a', marginRight: '10px' }}></i>Hostel Managers
        </h2>
        <p className={styles.subtitle}>View and manage hostel manager accounts near FAST Lahore.</p>

        {/* MANAGER OVERVIEW TILES */}
        <div style={{ background: '#f8f3e7', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #5c3d2e 0%, #8d5f3a 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
            <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>Manager Overview</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Total */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #8d5f3a, #5c3d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-user-tie" style={{ color: '#f8f3e7', fontSize: '18px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Total Managers</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : managers.length}
                  </p>
                </div>
              </div>
            </div>
            {/* Owners */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #2e7d32, #388e3c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-crown" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Owners</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : managers.filter(m => m.type === 'Owner').length}
                  </p>
                </div>
              </div>
            </div>
            {/* Employees */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #1976d2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-briefcase" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Employees</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : managers.filter(m => m.type === 'Employee').length}
                  </p>
                </div>
              </div>
            </div>
            {/* Showing */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7D5D4E, #5c3d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-filter" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Showing</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : filteredManagers.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type="text"
            placeholder="Search by name, phone, or education..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
            style={{
              padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd',
              backgroundColor: loading ? '#d6c4a1' : '#f5e9d2',
              color: loading ? '#7a6648' : '#4c3f30',
              fontSize: '14px', minWidth: '280px', flex: '1 1 280px',
            }}
          />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              disabled={loading}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: loading ? '#d6c4a1' : '#f5e9d2', color: loading ? '#7a6648' : '#4c3f30', fontSize: '14px' }}
            >
              <option value="All">All Types ({managers.length})</option>
              {managerTypes.map(t => <option key={t} value={t}>{t} ({managers.filter(m => m.type === t).length})</option>)}
            </select>
            {(search || filterType !== 'All') && (
              <button
                onClick={() => { setSearch(''); setFilterType('All'); }}
                style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <i className="fa-solid fa-times"></i> Clear
              </button>
            )}
          </div>
        </div>

        {/* MANAGERS PANEL */}
        <div style={{ background: '#f8f3e7', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '28px', overflow: 'hidden' }}>
          {/* Panel header */}
          <div style={{ background: 'linear-gradient(135deg, #5c3d2e 0%, #8d5f3a 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-user-tie" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
              <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>All Managers</span>
            </div>
            {!loading && (
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#f8f3e7', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
                {filteredManagers.length} of {managers.length}
              </span>
            )}
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 130px 110px 160px 120px 80px',
            padding: '8px 20px', background: '#f5ece0', borderBottom: '1px solid #e8d8c8',
            fontSize: '11px', fontWeight: 700, color: '#6b4c38', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            <span>Manager</span><span>Phone</span><span>Type</span>
            <span>Education</span><span>Op. Hours</span><span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <SkeletonBlock width="42px" height="42px" />
                  <SkeletonBlock width="160px" height="16px" />
                  <SkeletonBlock width="90px" height="14px" />
                  <SkeletonBlock width="80px" height="14px" />
                </div>
              ))}
            </div>
          ) : filteredManagers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <i className="fa-solid fa-user-slash" style={{ fontSize: '40px', marginBottom: '14px', display: 'block', color: '#c9b8a8' }}></i>
              <p style={{ fontWeight: 600, color: '#4b3a32', marginBottom: '6px' }}>No managers found</p>
              <p style={{ fontSize: '13px', color: '#a89080' }}>
                {search || filterType !== 'All'
                  ? 'No managers match your filters.'
                  : 'There are no managers in the system yet.'}
              </p>
              {(search || filterType !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setFilterType('All'); }}
                  style={{ marginTop: '14px', padding: '8px 18px', background: '#5c3d2e', color: '#f8f3e7', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                >Clear filters</button>
              )}
            </div>
          ) : (
            filteredManagers.map((m, i) => (
              <div key={m.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 130px 110px 160px 120px 80px',
                alignItems: 'center', padding: '13px 20px',
                borderBottom: i < filteredManagers.length - 1 ? '1px solid #ede4d8' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf6ef')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #8d5f3a, #5c3d2e)', color: '#f8f3e7', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(m.name || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: '#a89080' }}>ID #{m.id}</div>
                  </div>
                </div>
                {/* Phone */}
                <div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4b3a32' }}>
                    <i className="fa-solid fa-phone" style={{ color: '#8d7060', fontSize: '10px' }}></i>
                    {m.phone || '—'}
                  </span>
                </div>
                {/* Type */}
                <div>
                  <span style={{
                    display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    backgroundColor:
                      m.type === 'Owner' ? '#e8f5e8' :
                      m.type === 'Employee' ? '#e8f2fb' :
                      m.type === 'Manager' ? '#f3e8ff' : '#f5f0e8',
                    color:
                      m.type === 'Owner' ? '#2e7d32' :
                      m.type === 'Employee' ? '#1565c0' :
                      m.type === 'Manager' ? '#6b21a8' : '#7a5c3a',
                  }}>{m.type || '—'}</span>
                </div>
                {/* Education */}
                <div style={{ fontSize: '12px', color: '#4b3a32', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <i className="fa-solid fa-graduation-cap" style={{ color: '#8d7060', fontSize: '10px', flexShrink: 0 }}></i>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.education || '—'}</span>
                </div>
                {/* Operating Hours */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#4b3a32' }}>
                  <i className="fa-solid fa-clock" style={{ color: '#8d7060', fontSize: '10px' }}></i>
                  <span><strong>{m.operatingHours}</strong> hrs/day</span>
                </div>
                {/* Action */}
                <div style={{ textAlign: 'right' }}>
                  <Link to={`/admin/managers/${m.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '7px 14px', background: '#5c3d2e', color: '#f8f3e7',
                    borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                  }}>
                    <i className="fa-solid fa-eye"></i> View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AdminViewManagers;