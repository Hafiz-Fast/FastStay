import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getManagerHostels, type ManagerHostelCard } from "../api/admin_hostels_review";
import { getManagerById } from "../api/admin_manager_review";
import { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import "../AdminViewHostels.css";
import AdminSideNavbar from "../components/AdminSideNavbar";

const AdminManagerHostels: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hostels, setHostels] = useState<ManagerHostelCard[]>([]);
  const [managerName, setManagerName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const managerId = parseInt(id || "0");
    if (!managerId) { setLoading(false); return; }

    Promise.all([
      getManagerHostels(managerId),
      getManagerById(managerId).catch(() => null),
    ]).then(([hostelData, managerData]) => {
      setHostels(hostelData);
      if (managerData) setManagerName(managerData.name);
    }).finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      {/* ADMIN SIDE NAVBAR */}
      <AdminSideNavbar active="managers" />

      <div className={styles.mainContent}>
      <div className={styles.container}>
        {/* Back button */}
        <div style={{ marginBottom: "20px" }}>
          <Link
            to={`/admin/managers/${id}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", backgroundColor: "#5c3d2e", color: "#f8f3e7",
              textDecoration: "none", borderRadius: "8px",
            }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Manager Profile
          </Link>
        </div>

        {/* Page header */}
        <h2 className="custom-title">
          <i className="fa-solid fa-building"></i> Managed Hostels
          {managerName && (
            <span style={{ color: "#8d5f3a", fontWeight: 400, fontSize: "18px", marginLeft: "10px" }}>
              — {managerName}
            </span>
          )}
        </h2>
        <p className="custom-subtitle">
          {loading
            ? "Loading hostels..."
            : `${hostels.length} hostel${hostels.length !== 1 ? "s" : ""} managed by this manager`}
        </p>

        {/* Loading skeleton */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginTop: "20px" }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="custom-card" style={{ padding: 0, borderRadius: "12px", overflow: "hidden" }}>
                <SkeletonBlock width="100%" height="180px" />
                <div style={{ padding: "18px 20px" }}>
                  <SkeletonBlock width="70%" height="18px" />
                  <div style={{ marginTop: "10px" }}><SkeletonBlock width="50%" height="14px" /></div>
                  <div style={{ marginTop: "10px" }}><SkeletonBlock width="90%" height="14px" /></div>
                  <div style={{ marginTop: "10px" }}><SkeletonBlock width="60%" height="14px" /></div>
                </div>
              </div>
            ))}
          </div>

        ) : hostels.length === 0 ? (
          /* Empty state */
          <div className="custom-card" style={{ textAlign: "center", padding: "60px 20px", marginTop: "20px" }}>
            <i className="fa-solid fa-building" style={{ fontSize: "48px", color: "#c5b09f", marginBottom: "16px", display: "block" }}></i>
            <h3 style={{ color: "#666", marginBottom: "10px" }}>No Hostels Found</h3>
            <p style={{ color: "#888" }}>This manager has no registered hostels yet.</p>
          </div>

        ) : (
          /* Hostel cards grid */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginTop: "20px" }}>
            {hostels.map(hostel => (
              <div
                key={hostel.id}
                className="custom-card"
                style={{ padding: 0, borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                {/* Photo */}
                {hostel.photos[0] ? (
                  <img
                    src={hostel.photos[0]}
                    alt={hostel.name}
                    style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x180?text=No+Image"; }}
                  />
                ) : (
                  <div style={{
                    height: "180px", background: "#e8ddd4",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                    <i className="fa-solid fa-image" style={{ fontSize: "32px", color: "#b5a090" }}></i>
                    <span style={{ fontSize: "13px", color: "#b5a090" }}>No photo available</span>
                  </div>
                )}

                <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: "0" }}>
                  {/* Name + status/type badges */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", gap: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#2b211c", lineHeight: 1.3 }}>
                      {hostel.name}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0, alignItems: "flex-end" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                        background: "#f0e7dc", color: "#5c3d2e",
                      }}>{hostel.type}</span>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                        background: hostel.approved ? "#e8f5e9" : "#fff3e0",
                        color: hostel.approved ? "#2e7d32" : "#e65100",
                      }}>
                        <i className={`fa-solid ${hostel.approved ? "fa-check" : "fa-clock"}`} style={{ marginRight: "4px" }}></i>
                        {hostel.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6a5c54", fontSize: "13px", marginBottom: "14px" }}>
                    <i className="fa-solid fa-location-dot" style={{ color: "#8d5f3a" }}></i>
                    Block {hostel.blockNo}, House {hostel.houseNo}
                  </div>

                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                    <div className="custom-info-box" style={{ padding: "10px 12px" }}>
                      <div className="custom-info-label">Rooms</div>
                      <div className="custom-info-value">
                        <i className="fa-solid fa-door-open" style={{ marginRight: "5px", color: "#8d5f3a" }}></i>{hostel.rooms}
                      </div>
                    </div>
                    <div className="custom-info-box" style={{ padding: "10px 12px" }}>
                      <div className="custom-info-label">Floors</div>
                      <div className="custom-info-value">
                        <i className="fa-solid fa-layer-group" style={{ marginRight: "5px", color: "#8d5f3a" }}></i>{hostel.floors}
                      </div>
                    </div>
                  </div>

                  {/* Amenity pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                    {[
                      { flag: hostel.parking, label: "Parking", icon: "fa-car" },
                      { flag: hostel.messProvide, label: "Mess", icon: "fa-utensils" },
                      { flag: hostel.geezer, label: "Geezer", icon: "fa-fire-burner" },
                    ].map(a => (
                      <span key={a.label} style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
                        background: a.flag ? "#e3f1e3" : "#f5f0ec",
                        color: a.flag ? "#2e7d32" : "#9e8a7a",
                        display: "inline-flex", alignItems: "center", gap: "4px",
                      }}>
                        <i className={`fa-solid ${a.icon}`}></i>{a.label}: {a.flag ? "Yes" : "No"}
                      </span>
                    ))}
                  </div>

                  {/* Rating */}
                  <div style={{ marginBottom: "18px" }}>
                    <div className="custom-info-label" style={{ marginBottom: "5px" }}>Rating</div>
                    {hostel.avgRating !== null ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <i
                            key={i}
                            className={`fa-${i <= Math.round(hostel.avgRating!) ? "solid" : "regular"} fa-star`}
                            style={{ fontSize: "14px", color: i <= Math.round(hostel.avgRating!) ? "#f5a623" : "#d0c8c0" }}
                          />
                        ))}
                        <span style={{ fontSize: "12px", color: "#6a5c54", marginLeft: "4px" }}>
                          {hostel.avgRating.toFixed(1)} / 5
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#9e8a7a" }}>
                        <i className="fa-regular fa-star" style={{ marginRight: "5px" }}></i>No ratings yet
                      </span>
                    )}
                  </div>

                  {/* View Details button — pushed to bottom */}
                  <div style={{ marginTop: "auto" }}>
                    <Link
                      to={`/admin/hostels/${hostel.id}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        padding: "10px 20px",
                        background: "linear-gradient(135deg, #5c3d2e, #8d5f3a)",
                        color: "#f8f3e7", textDecoration: "none", borderRadius: "8px",
                        fontWeight: 600, fontSize: "14px",
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                      onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      <i className="fa-solid fa-eye"></i> View Full Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default AdminManagerHostels;
