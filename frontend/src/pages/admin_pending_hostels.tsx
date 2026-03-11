import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getPendingHostels,
  CACHE_PENDING_HOSTELS,
  type PendingHostel,
} from "../api/admin_hostels_review";
import { cacheGet } from "../utils/cache";
import SkeletonRow from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import AdminSideNavbar from "../components/AdminSideNavbar";

const AdminPendingHostels: React.FC = () => {
  const [hostels, setHostels] = useState<PendingHostel[]>([]);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Phase 1: instant render from cache
    const cached = cacheGet<PendingHostel[]>(CACHE_PENDING_HOSTELS);
    if (cached) {
      setHostels(cached);
      setLoading(false);
    }

    // Phase 2: background refresh
    getPendingHostels(true)
      .then((result) => {
        setHostels(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cached) setError("Failed to load pending hostels. Please try again later.");
        setLoading(false);
      });
  }, []);

  const typeOptions = useMemo(() => {
    const types = new Set(hostels.map((h) => h.type).filter(Boolean));
    return Array.from(types).sort();
  }, [hostels]);

  const filteredHostels = useMemo(() => {
    return hostels.filter((h) => {
      const term = search.toLowerCase();
      const matchesSearch =
        term === "" ||
        h.name.toLowerCase().includes(term) ||
        h.blockNo.toLowerCase().includes(term) ||
        h.houseNo.toLowerCase().includes(term) ||
        h.managerName.toLowerCase().includes(term);
      const matchesType = typeFilter === "All" || h.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [hostels, search, typeFilter]);

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
          <i className="fa-solid fa-hourglass-half" style={{ color: "#d97706", marginRight: "10px" }}></i>
          Pending Hostel Approvals
        </h2>
        <p className={styles.subtitle}>
          Review hostels submitted by managers that are waiting for verification.
        </p>

        {/* Results count */}
        {!loading && (
          <div
            style={{
              marginBottom: "15px",
              color: "#666",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <i className="fa-solid fa-info-circle"></i>
            <span>
              Showing {filteredHostels.length} of {hostels.length} pending hostel(s)
              {(typeFilter !== "All" || search) && " (filtered)"}
            </span>
          </div>
        )}

        {/* SEARCH + FILTER BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, block, house no or manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "8px",
              width: "340px",
              border: "1px solid #ddd",
              backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",
              color: loading ? "#7a6648" : "#4c3f30",
              fontSize: "14px",
            }}
          />

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>Filter by type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              disabled={loading}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",
                color: loading ? "#7a6648" : "#4c3f30",
                minWidth: "160px",
                fontSize: "14px",
              }}
            >
              <option value="All">All Types ({hostels.length})</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t} ({hostels.filter((h) => h.type === t).length})
                </option>
              ))}
            </select>

            {(search || typeFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setTypeFilter("All");
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <i className="fa-solid fa-times"></i> Clear
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableCard}>
          {!loading && hostels.length === 0 ? (
            /* All-clear empty state */
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
              }}
            >
              <i
                className="fa-solid fa-check-circle"
                style={{ fontSize: "52px", color: "#27ae60", marginBottom: "16px", display: "block" }}
              ></i>
              <h3 style={{ color: "#3b2c24", marginBottom: "8px" }}>All caught up!</h3>
              <p style={{ color: "#666" }}>There are no hostels pending approval right now.</p>
              <Link
                to="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "20px",
                  padding: "10px 20px",
                  backgroundColor: "#5c3d2e",
                  color: "#f8f3e7",
                  textDecoration: "none",
                  borderRadius: "8px",
                }}
              >
                <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
              </Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Hostel Name</th>
                  <th>Block</th>
                  <th>House No</th>
                  <th>Type</th>
                  <th>Manager</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRow cols={7} rows={5} />
                ) : filteredHostels.length > 0 ? (
                  filteredHostels.map((h, idx) => (
                    <tr key={h.id}>
                      <td style={{ color: "#999", fontSize: "13px" }}>{idx + 1}</td>
                      <td>
                        <strong>{h.name}</strong>
                      </td>
                      <td>{h.blockNo}</td>
                      <td>{h.houseNo}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: "#8B7355",
                            color: "#F8F3E7",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {h.type}
                        </span>
                      </td>
                      <td>{h.managerName}</td>
                      <td>
                        <Link
                          to={`/admin/hostels/${h.id}`}
                          className={styles.actionBtn}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 16px",
                            textDecoration: "none",
                            textAlign: "center",
                          }}
                        >
                          <i className="fa-solid fa-eye"></i> Review
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#666" }}>
                      No hostels match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminPendingHostels;
