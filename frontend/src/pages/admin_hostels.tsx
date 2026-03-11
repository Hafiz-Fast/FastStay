
// import React, { useEffect, useState, useMemo } from "react";
// import { Link } from "react-router-dom";
// import { getAllHostelsTableData, type HostelTableRow } from "../api/admin_hostels";
// import styles from "../styles/admin_hostel.module.css";

// const ViewHostels: React.FC = () => {
//   const [hostels, setHostels] = useState<HostelTableRow[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState<string>("");
//   const [blockFilter, setBlockFilter] = useState<string>("All");
//   const [typeFilter, setTypeFilter] = useState<string>("All");

//   useEffect(() => {
//     const fetchHostels = async () => {
//       try {
//         const data = await getAllHostelsTableData();
//         setHostels(data);
//         setLoading(false);
//       } catch (err: unknown) {
//         console.error(err);
//         setError("Failed to load hostels.");
//         setLoading(false);
//       }
//     };

//     fetchHostels();
//   }, []);

//   // Get unique blocks and types from data
//   const blockOptions = useMemo(() => {
//     const blocks = new Set(hostels.map(h => h.blockHouse).filter(Boolean));
//     return Array.from(blocks).sort();
//   }, [hostels]);

//   const typeOptions = useMemo(() => {
//     const types = new Set(hostels.map(h => h.type).filter(Boolean));
//     return Array.from(types).sort();
//   }, [hostels]);

//   // Filter hostels based on search and filters
//   const filteredHostels = useMemo(() => {
//     return hostels.filter(h => {
//       // Search filter
//       const searchTerm = search.toLowerCase();
//       const matchesSearch = searchTerm === "" ||
//         h.name.toLowerCase().includes(searchTerm) ||
//         h.blockHouse.toLowerCase().includes(searchTerm) ||
//         h.managerName.toLowerCase().includes(searchTerm);

//       // Block filter
//       const matchesBlock = blockFilter === "All" || h.blockHouse === blockFilter;

//       // Type filter
//       const matchesType = typeFilter === "All" || h.type === typeFilter;

//       return matchesSearch && matchesBlock && matchesType;
//     });
//   }, [hostels, search, blockFilter, typeFilter]);

//   // Show only error on full page if there's a critical error
//   if (error) {
//     return (
//       <div className={styles.container} style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
//         <h2>{error}</h2>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* NAVBAR */}
//       <nav className={styles.navbar}>
//         <div className={styles.logo}>
//           <i className="fa-solid fa-user-shield"></i> FastStay Admin
//         </div>

//         <div className={styles.navLinks}>
//           <Link to="/admin">Dashboard</Link>
//           <Link to="/admin/hostels" className={styles.active}>Hostels</Link>
//           <Link to="/admin/students">Students</Link>
//           <Link to="/admin/managers">Managers</Link>
//           <Link to="/admin/logout">Logout</Link>
//         </div>
//       </nav>

//       {/* MAIN CONTENT */}
//       <div className={styles.container}>
//         <h2 className={styles.pageTitle}>
//           <i className="fa-solid fa-building"></i> All Hostels
//         </h2>
//         <p className={styles.subtitle}>View, manage and edit all hostels listed on FastStay.</p>

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
//               Showing {filteredHostels.length} of {hostels.length} hostel(s)
//               {(blockFilter !== "All" || typeFilter !== "All" || search) && " (filtered)"}
//             </span>
//           </div>
//         )}

//         {/* TOP BAR */}
//         <div className={styles.topBar} style={{ marginBottom: "20px" }}>
//           <div className={styles.searchBox}>
//             <input
//               type="text"
//               placeholder="Search by name, block, or manager..."
//               className={styles.searchInput}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               disabled={loading}
//               style={{
//                 backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
//                 color: loading ? "#7a6648" : "#4c3f30",
//               }}
//             />
//           </div>

//           <div className={styles.filters} style={{ display: "flex", gap: "15px" }}>
//             <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
//               <label style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
//                 Filter by Block / House
//               </label>
//               <select
//                 className={styles.filterSelect}
//                 value={blockFilter}
//                 onChange={(e) => setBlockFilter(e.target.value)}
//                 disabled={loading}
//                 style={{
//                   backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
//                   color: loading ? "#7a6648" : "#4c3f30",
//                 }}
//               >
//                 <option value="All">All Blocks ({hostels.length})</option>
//                 {blockOptions.map((block) => (
//                   <option key={block} value={block}>
//                     {block} ({hostels.filter(h => h.blockHouse === block).length})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
//               <label style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
//                 Filter by Type
//               </label>
//               <select
//                 className={styles.filterSelect}
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value)}
//                 disabled={loading}
//                 style={{
//                   backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
//                   color: loading ? "#7a6648" : "#4c3f30",
//                 }}
//               >
//                 <option value="All">All Types ({hostels.length})</option>
//                 {typeOptions.map((type) => (
//                   <option key={type} value={type}>
//                     {type} ({hostels.filter(h => h.type === type).length})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {(search || blockFilter !== "All" || typeFilter !== "All") && (
//               <button
//                 onClick={() => {
//                   setSearch("");
//                   setBlockFilter("All");
//                   setTypeFilter("All");
//                 }}
//                 style={{
//                   alignSelf: "flex-end",
//                   padding: "8px 16px",
//                   backgroundColor: "#e74c3c",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "6px",
//                   cursor: "pointer",
//                   fontSize: "14px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "5px"
//                 }}
//               >
//                 <i className="fa-solid fa-times"></i>
//                 Clear Filters
//               </button>
//             )}
//           </div>
//         </div>

//         {/* HOSTELS TABLE */}
//         <div className={styles.tableCard}>
//           <table className={styles.hostelTable}>
//             <thead>
//               <tr>
//                 <th className={styles.tableHeader}>Hostel Name</th>
//                 <th className={styles.tableHeader}>Block / House</th>
//                 <th className={styles.tableHeader}>Type</th>
//                 <th className={styles.tableHeader}>Rooms</th>
//                 <th className={styles.tableHeader}>Floors</th>
//                 <th className={styles.tableHeader}>Manager</th>
//                 <th className={styles.tableHeader}>Actions</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={7} className={styles.loadingCell}>
//                     <div className={styles.loadingContainer}>
//                       <i className="fa-solid fa-spinner fa-spin" style={{
//                         marginRight: "10px",
//                         fontSize: "18px"
//                       }}></i>
//                       Loading hostels...
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredHostels.length > 0 ? (
//                 filteredHostels.map(h => (
//                   <tr key={h.id} className={styles.tableRow}>
//                     <td className={styles.tableCell}>
//                       <div style={{ fontWeight: "600", color: "#2c3e50" }}>
//                         {h.name}
//                       </div>
//                       {h.messProvide && (
//                         <div style={{
//                           fontSize: "12px",
//                           color: "#27ae60",
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "5px",
//                           marginTop: "3px"
//                         }}>
//                           <i className="fa-solid fa-utensils"></i>
//                           Mess Available
//                         </div>
//                       )}
//                     </td>
//                     <td className={styles.tableCell}>
//                       <span style={{
//                         display: "inline-block",
//                         padding: "4px 8px",
//                         borderRadius: "4px",
//                         fontSize: "12px",
//                         fontWeight: "bold",
//                         backgroundColor: "#e8f4fd",
//                         color: "#2980b9"
//                       }}>
//                         {h.blockHouse}
//                       </span>
//                     </td>
//                     <td className={styles.tableCell}>
//                       <span style={{
//                         display: "inline-block",
//                         padding: "4px 8px",
//                         borderRadius: "4px",
//                         fontSize: "12px",
//                         fontWeight: "bold",
//                         backgroundColor:
//                           h.type === "Portion" ? "#e8f5e8" :
//                           h.type === "Building" ? "#f0e8ff" : "#f5f5f5",
//                         color:
//                           h.type === "Portion" ? "#27ae60" :
//                           h.type === "Building" ? "#8e44ad" : "#666"
//                       }}>
//                         {h.type}
//                       </span>
//                     </td>
//                     <td className={styles.tableCell}>
//                       <div style={{
//                         fontWeight: "bold",
//                         color: "#2c3e50",
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "5px"
//                       }}>
//                         <i className="fa-solid fa-door-closed"></i>
//                         {h.rooms}
//                       </div>
//                     </td>
//                     <td className={styles.tableCell}>
//                       <div style={{
//                         fontWeight: "bold",
//                         color: "#2c3e50",
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "5px"
//                       }}>
//                         <i className="fa-solid fa-building"></i>
//                         {h.floors}
//                       </div>
//                     </td>
//                     <td className={styles.tableCell}>
//                       <div style={{ display: "flex", flexDirection: "column" }}>
//                         <span style={{ fontWeight: "500" }}>{h.managerName}</span>
//                         <span style={{ fontSize: "12px", color: "#666" }}>
//                           ID: {h.managerID}
//                         </span>
//                       </div>
//                     </td>
//                     <td className={styles.actionCell}>
//                       <button
//                         className={styles.viewBtn}
//                         style={{ marginBottom: "5px" }}
//                       >
//                         <i className="fa-solid fa-eye"></i> View
//                       </button>
//                       <button
//                         className={styles.editBtn}
//                         style={{ marginBottom: "5px" }}
//                       >
//                         <i className="fa-solid fa-edit"></i> Edit
//                       </button>
//                       <button className={styles.deleteBtn}>
//                         <i className="fa-solid fa-trash"></i> Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={7} className={styles.noDataCell}>
//                     <div style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       padding: "40px 20px",
//                       gap: "15px"
//                     }}>
//                       <i className="fa-solid fa-building" style={{
//                         fontSize: "48px",
//                         color: "#ddd"
//                       }}></i>
//                       <div style={{ textAlign: "center" }}>
//                         <h4 style={{ marginBottom: "5px", color: "#666" }}>No hostels found</h4>
//                         <p style={{ margin: 0, fontSize: "14px", color: "#999", maxWidth: "400px" }}>
//                           {search || blockFilter !== "All" || typeFilter !== "All"
//                             ? "No hostels match your current filters. Try adjusting your search criteria."
//                             : "There are no hostels in the system yet."}
//                         </p>
//                         {(search || blockFilter !== "All" || typeFilter !== "All") && (
//                           <button
//                             onClick={() => {
//                               setSearch("");
//                               setBlockFilter("All");
//                               setTypeFilter("All");
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
//                             Clear all filters
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

//         {/* EXTRA INFO BAR */}
//         {!loading && filteredHostels.length > 0 && (
//           <div style={{
//             marginTop: "20px",
//             padding: "15px",
//             backgroundColor: "#f8f9fa",
//             borderRadius: "8px",
//             border: "1px solid #e9ecef",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             fontSize: "14px",
//             color: "#666"
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               <i className="fa-solid fa-chart-bar"></i>
//               <span>
//                 Total Rooms: <strong>{filteredHostels.reduce((sum, h) => sum + h.rooms, 0)}</strong> |
//                 Average Rooms: <strong>{(filteredHostels.reduce((sum, h) => sum + h.rooms, 0) / filteredHostels.length).toFixed(1)}</strong>
//               </span>
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
//               <i className="fa-solid fa-clock"></i>
//               <span>
//                 {filteredHostels.filter(h => h.messProvide).length} of {filteredHostels.length} hostels provide mess
//               </span>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default ViewHostels;






import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllHostelsTableData, CACHE_HOSTELS, type HostelTableRow } from "../api/admin_hostels";
import { cacheGet } from "../utils/cache";
import { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import AdminSideNavbar from "../components/AdminSideNavbar";

const ViewHostels: React.FC = () => {
  const [hostels, setHostels] = useState<HostelTableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [blockFilter, setBlockFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  useEffect(() => {
    // Phase 1: instant render from cache
    const cached = cacheGet<HostelTableRow[]>(CACHE_HOSTELS);
    if (cached) {
      setHostels(cached);
      setLoading(false);
    }

    // Phase 2: background refresh
    getAllHostelsTableData(true)
      .then(data => {
        setHostels(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cached) setError("Failed to load hostels.");
        setLoading(false);
      });
  }, []);

  // Get unique blocks and types from data
  const blockOptions = useMemo(() => {
    const blocks = new Set(hostels.map(h => h.blockHouse).filter(Boolean));
    return Array.from(blocks).sort();
  }, [hostels]);

  const typeOptions = useMemo(() => {
    const types = new Set(hostels.map(h => h.type).filter(Boolean));
    return Array.from(types).sort();
  }, [hostels]);

  // Filter hostels based on search and filters
  const filteredHostels = useMemo(() => {
    return hostels.filter(h => {
      // Search filter
      const searchTerm = search.toLowerCase();
      const matchesSearch = searchTerm === "" ||
        h.name.toLowerCase().includes(searchTerm) ||
        h.blockHouse.toLowerCase().includes(searchTerm) ||
        h.managerName.toLowerCase().includes(searchTerm);

      // Block filter
      const matchesBlock = blockFilter === "All" || h.blockHouse === blockFilter;

      // Type filter
      const matchesType = typeFilter === "All" || h.type === typeFilter;

      return matchesSearch && matchesBlock && matchesType;
    });
  }, [hostels, search, blockFilter, typeFilter]);

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
      {/* ADMIN SIDE NAVBAR */}
      <AdminSideNavbar active="hostels" />

      <div className={styles.mainContent}>
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>
          <i className="fa-solid fa-hotel" style={{ color: '#6d8c6d', marginRight: '10px' }}></i>All Hostels
        </h2>
        <p className={styles.subtitle}>View and manage all hostels listed on FastStay.</p>

        {/* HOSTEL OVERVIEW TILES */}
        <div style={{ background: '#f8f3e7', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #3a5f3a 0%, #6d8c6d 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
            <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>Hostel Overview</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {/* Total */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6d8c6d, #3a5f3a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-hotel" style={{ color: '#f8f3e7', fontSize: '18px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Total Hostels</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : hostels.length}
                  </p>
                </div>
              </div>
            </div>
            {/* Mess */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #5c8a5c, #2e5e2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-utensils" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>With Mess</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : hostels.filter(h => h.messProvide).length}
                  </p>
                </div>
              </div>
            </div>
            {/* Parking */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #8B7355, #5c3d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-square-parking" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>With Parking</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : hostels.filter(h => h.isParking).length}
                  </p>
                </div>
              </div>
            </div>
            {/* Filtered */}
            <div style={{ flex: '1 1 160px', padding: '20px 24px', borderBottom: '1px solid #ede4d8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #7D5D4E, #5c3d2e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-filter" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Showing</p>
                  <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                    {loading ? <SkeletonBlock width="50px" height="26px" /> : filteredHostels.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER BAR */}
        <div className={styles.hostelFilterBar} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search by name, block, or manager..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={loading}
            style={{
              padding: '9px 14px', borderRadius: '8px', border: '1px solid #ddd',
              backgroundColor: loading ? '#d6c4a1' : '#f5e9d2',
              color: loading ? '#7a6648' : '#4c3f30',
              fontSize: '14px', flex: '1 1 auto', minWidth: 0,
            }}
          />
          <select
            value={blockFilter}
            onChange={e => setBlockFilter(e.target.value)}
            disabled={loading}
            style={{ padding: '9px 8px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: loading ? '#d6c4a1' : '#f5e9d2', color: loading ? '#7a6648' : '#4c3f30', fontSize: '13px', flexShrink: 0 }}
          >
            <option value="All">All Blocks</option>
            {blockOptions.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <button
            onClick={() => { setSearch(''); setBlockFilter('All'); setTypeFilter('All'); }}
            disabled={!search && blockFilter === 'All'}
            title="Clear filters"
            style={{
              padding: '9px 12px', backgroundColor: (search || blockFilter !== 'All') ? '#e74c3c' : '#ddd',
              color: (search || blockFilter !== 'All') ? 'white' : '#999',
              border: 'none', borderRadius: '8px', cursor: (search || blockFilter !== 'All') ? 'pointer' : 'default',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, transition: 'background 0.2s',
            }}
          >
            <i className="fa-solid fa-times"></i> Clear
          </button>
        </div>

        {/* HOSTELS PANEL */}
        <div style={{ background: '#f8f3e7', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '28px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #3a5f3a 0%, #6d8c6d 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-building" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
              <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>All Hostels</span>
            </div>
            {!loading && (
              <span style={{ background: 'rgba(255,255,255,0.18)', color: '#f8f3e7', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
                {filteredHostels.length} of {hostels.length}
              </span>
            )}
          </div>

          {/* Column headers */}
          <div className={styles.hostelColHeader} style={{
            padding: '8px 32px', background: '#f3f8f3', borderBottom: '1px solid #deeade',
            fontSize: '11px', fontWeight: 700, color: '#5a7060', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            <span>Hostel</span><span>Location</span><span>Type</span>
            <span>Rooms / Floors</span><span>Manager</span><span>Amenities</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <SkeletonBlock width="42px" height="42px" />
                  <SkeletonBlock width="160px" height="16px" />
                  <SkeletonBlock width="80px" height="14px" />
                  <SkeletonBlock width="80px" height="14px" />
                </div>
              ))}
            </div>
          ) : filteredHostels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <i className="fa-solid fa-hotel" style={{ fontSize: '40px', marginBottom: '14px', display: 'block', color: '#c9b8a8' }}></i>
              <p style={{ fontWeight: 600, color: '#4b3a32', marginBottom: '6px' }}>No hostels found</p>
              <p style={{ fontSize: '13px', color: '#a89080' }}>
                {search || blockFilter !== 'All' || typeFilter !== 'All'
                  ? 'No hostels match your filters.'
                  : 'There are no hostels in the system yet.'}
              </p>
              {(search || blockFilter !== 'All' || typeFilter !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setBlockFilter('All'); setTypeFilter('All'); }}
                  style={{ marginTop: '14px', padding: '8px 18px', background: '#3a5f3a', color: '#f8f3e7', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                >Clear filters</button>
              )}
            </div>
          ) : (
            <div style={{ padding: '8px 0 4px' }}>
            {filteredHostels.map((h, i) => (
              <div key={h.id} className={styles.hostelGridRow}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0faf0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fdfffd')}
              >
                {/* Name */}
                <div className={styles.hostelCellName} style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #6d8c6d, #3a5f3a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-hotel" style={{ color: '#f8f3e7', fontSize: '17px' }}></i>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                    <div style={{ fontSize: '11px', color: '#a89080' }}>ID #{h.id}</div>
                    {h.avgRating != null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
                        {[1,2,3,4,5].map(s => (
                          <i key={s} className="fa-solid fa-star" style={{ color: s <= Math.round(h.avgRating!) ? '#f4a62a' : '#ddd', fontSize: '10px' }}></i>
                        ))}
                        <span style={{ fontSize: '10px', color: '#8d7060', marginLeft: '3px' }}>{h.avgRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '10px', color: '#c9b8a8', marginTop: '2px' }}>No ratings</div>
                    )}
                  </div>
                </div>
                {/* Location */}
                <div className={styles.hostelCellLoc}>
                  <span style={{
                    display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    backgroundColor: '#e8f2fb', color: '#1565c0',
                    maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    verticalAlign: 'middle',
                  }} title={h.blockHouse || '—'}>
                    {h.blockHouse || '—'}
                  </span>
                </div>
                {/* Type */}
                <div className={styles.hostelCellType}>
                  <span style={{
                    display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                    backgroundColor: h.type === 'Portion' ? '#e8f5e8' : h.type === 'Building' ? '#f0e8ff' : '#f5f0e8',
                    color: h.type === 'Portion' ? '#2e7d32' : h.type === 'Building' ? '#6b21a8' : '#7a5c3a',
                  }}>{h.type || '—'}</span>
                </div>
                {/* Rooms / Floors */}
                <div className={styles.hostelCellRooms} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ fontSize: '12px', color: '#6d5d52', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-solid fa-door-closed" style={{ color: '#8d7060', fontSize: '10px' }}></i>
                    <span><strong>{h.rooms}</strong> rooms</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6d5d52', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-solid fa-layer-group" style={{ color: '#8d7060', fontSize: '10px' }}></i>
                    <span><strong>{h.floors}</strong> floors</span>
                  </div>
                </div>
                {/* Manager */}
                <div className={styles.hostelCellMgr} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #8B7355, #5c3d2e)', color: '#f8f3e7', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(h.managerName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.managerName || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: '#a89080' }}>ID #{h.managerID}</div>
                  </div>
                </div>
                {/* Amenities */}
                <div className={styles.hostelCellAmen} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {h.messProvide && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: '#e8f5e8', color: '#2e7d32' }}>
                      <i className="fa-solid fa-utensils"></i> Mess
                    </span>
                  )}
                  {h.isParking && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: '#e8f2fb', color: '#1565c0' }}>
                      <i className="fa-solid fa-square-parking"></i> Parking
                    </span>
                  )}
                  {h.geezerFlag && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 600, background: '#fff3e0', color: '#e65100' }}>
                      <i className="fa-solid fa-fire-flame-simple"></i> Geezer
                    </span>
                  )}
                  {!h.messProvide && !h.isParking && !h.geezerFlag && (
                    <span style={{ fontSize: '12px', color: '#c9b8a8' }}>—</span>
                  )}
                </div>
                {/* Action */}
                <div className={styles.hostelCellAction} style={{ textAlign: 'right' }}>
                  <Link to={`/admin/hostels/${h.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '7px 14px', background: '#3a5f3a', color: '#f8f3e7',
                    borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                  }}>
                    <i className="fa-solid fa-eye"></i> View
                  </Link>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default ViewHostels;