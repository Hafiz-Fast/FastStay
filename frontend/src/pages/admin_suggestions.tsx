import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getAllSuggestions,
  CACHE_SUGGESTIONS,
  type SuggestionRow,
} from "../api/admin_suggestions";
import { cacheGet } from "../utils/cache";
import SkeletonRow, { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";

const AdminSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"improvements" | "defects" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = cacheGet<SuggestionRow[]>(CACHE_SUGGESTIONS);
    if (cached) {
      setSuggestions(cached);
      setLoading(false);
    }

    getAllSuggestions(true)
      .then((result) => {
        setSuggestions(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cached) setError("Failed to load suggestions. Please try again.");
        setLoading(false);
      });
  }, []);

  const userTypeOptions = useMemo(() => {
    const types = new Set(suggestions.map((s) => s.userType).filter(Boolean));
    return Array.from(types).sort();
  }, [suggestions]);

  const filtered = useMemo(() => {
    return suggestions.filter((s) => {
      const term = search.toLowerCase();
      const matchesSearch =
        term === "" ||
        s.userName.toLowerCase().includes(term) ||
        s.improvements.toLowerCase().includes(term) ||
        s.defects.toLowerCase().includes(term);
      const matchesType = typeFilter === "All" || s.userType === typeFilter;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "improvements" && s.improvements.trim() !== "") ||
        (activeTab === "defects" && s.defects.trim() !== "");
      return matchesSearch && matchesType && matchesTab;
    });
  }, [suggestions, search, typeFilter, activeTab]);

  const withImprovements = suggestions.filter((s) => s.improvements.trim() !== "").length;
  const withDefects = suggestions.filter((s) => s.defects.trim() !== "").length;

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
          <Link to="/admin/managers">Managers</Link>
          <Link to="/admin/logout">Logout</Link>
        </div>
      </nav>

      <div className={styles.container}>
        {/* PAGE HEADER */}
        <h2 className={styles.pageTitle}>
          <i className="fa-solid fa-lightbulb" style={{ color: "#d97706", marginRight: "10px" }}></i>
          User Suggestions
        </h2>
        <p className={styles.subtitle}>
          Feedback and suggestions submitted by students and managers to improve the platform.
        </p>

        {/* SUMMARY STATS ROW */}
        <div className={styles.cards} style={{ marginBottom: "25px" }}>
          <div className={styles.card}>
            <i className="fa-solid fa-comments" style={{ color: "#8d5f3a" }}></i>
            <p className={styles.cardTitle}>Total Submissions</p>
            <p className={styles.cardValue}>
              {loading ? <SkeletonBlock width="55%" height="30px" /> : suggestions.length}
            </p>
          </div>

          <div className={styles.card}>
            <i className="fa-solid fa-arrow-up-right-dots" style={{ color: "#2e7d32" }}></i>
            <p className={styles.cardTitle}>With Improvements</p>
            <p className={styles.cardValue}>
              {loading ? <SkeletonBlock width="55%" height="30px" /> : withImprovements}
            </p>
          </div>

          <div className={styles.card}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "#c62828" }}></i>
            <p className={styles.cardTitle}>With Defects Reported</p>
            <p className={styles.cardValue}>
              {loading ? <SkeletonBlock width="55%" height="30px" /> : withDefects}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {(["all", "improvements", "defects"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                backgroundColor: activeTab === tab ? "#8d5f3a" : "#f0e7dc",
                color: activeTab === tab ? "#fff" : "#4b3a32",
                transition: "all 0.2s",
              }}
            >
              {tab === "all" && <><i className="fa-solid fa-list" style={{ marginRight: "6px" }}></i>All</>}
              {tab === "improvements" && <><i className="fa-solid fa-arrow-trend-up" style={{ marginRight: "6px" }}></i>Improvements</>}
              {tab === "defects" && <><i className="fa-solid fa-bug" style={{ marginRight: "6px" }}></i>Defects</>}
            </button>
          ))}
        </div>

        {/* SEARCH + FILTER BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Search by user name or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "8px",
              width: "320px",
              border: "1px solid #ddd",
              backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",
              color: loading ? "#7a6648" : "#4c3f30",
              fontSize: "14px",
            }}
          />
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#d6c7ba", fontSize: "14px" }}>Filter by type:</span>
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
              <option value="All">All Types ({suggestions.length})</option>
              {userTypeOptions.map((t) => (
                <option key={t} value={t}>
                  {t} ({suggestions.filter((s) => s.userType === t).length})
                </option>
              ))}
            </select>
            {(search || typeFilter !== "All") && (
              <button
                onClick={() => { setSearch(""); setTypeFilter("All"); }}
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

        {/* RESULT COUNT */}
        {!loading && (
          <div style={{ marginBottom: "12px", color: "#d6c7ba", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-solid fa-info-circle"></i>
            <span>
              Showing {filtered.length} of {suggestions.length} suggestion(s)
              {(typeFilter !== "All" || search || activeTab !== "all") && " (filtered)"}
            </span>
          </div>
        )}

        {/* SUGGESTIONS TABLE */}
        <div className={styles.tableCard}>
          {!loading && suggestions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <i className="fa-solid fa-inbox" style={{ fontSize: "52px", color: "#8d5f3a", marginBottom: "16px", display: "block" }}></i>
              <h3 style={{ color: "#4b3a32", marginBottom: "8px" }}>No Suggestions Yet</h3>
              <p style={{ color: "#6d5d52" }}>Users haven't submitted any feedback yet.</p>
            </div>
          ) : !loading && filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <i className="fa-solid fa-search" style={{ fontSize: "40px", color: "#8d5f3a", marginBottom: "12px", display: "block" }}></i>
              <p style={{ color: "#4b3a32" }}>No suggestions match your search or filter.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Improvements</th>
                  <th>Defects Reported</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRow cols={6} rows={5} />
                ) : (
                  filtered.map((s, idx) => (
                    <tr key={`${s.userId}-${idx}`}>
                      <td style={{ color: "#6d5d52", fontSize: "13px" }}>{idx + 1}</td>
                      <td>
                        <strong>{s.userName}</strong>
                        <div style={{ fontSize: "12px", color: "#6d5d52" }}>ID #{s.userId}</div>
                      </td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: s.userType === "Student" ? "#7D5D4E" : "#8B7355",
                          color: "#F8F3E7",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}>
                          {s.userType}
                        </span>
                      </td>
                      <td style={{ maxWidth: "280px" }}>
                        {s.improvements.trim() ? (
                          <div style={{
                            backgroundColor: "#e8f5e9",
                            border: "1px solid #a5d6a7",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            fontSize: "13px",
                            color: "#1b5e20",
                            lineHeight: "1.5",
                          }}>
                            {s.improvements}
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: "13px", fontStyle: "italic" }}>—</span>
                        )}
                      </td>
                      <td style={{ maxWidth: "280px" }}>
                        {s.defects.trim() ? (
                          <div style={{
                            backgroundColor: "#ffebee",
                            border: "1px solid #ef9a9a",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            fontSize: "13px",
                            color: "#b71c1c",
                            lineHeight: "1.5",
                          }}>
                            {s.defects}
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: "13px", fontStyle: "italic" }}>—</span>
                        )}
                      </td>
                      <td>
                        {s.improvements.trim() && s.defects.trim() ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                            fontWeight: "600", backgroundColor: "#fff3e0", color: "#e65100",
                            border: "1px solid #ffcc80",
                          }}>
                            <i className="fa-solid fa-circle-half-stroke"></i> Mixed
                          </span>
                        ) : s.improvements.trim() ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                            fontWeight: "600", backgroundColor: "#e8f5e9", color: "#2e7d32",
                            border: "1px solid #a5d6a7",
                          }}>
                            <i className="fa-solid fa-arrow-trend-up"></i> Improvement
                          </span>
                        ) : (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "4px 10px", borderRadius: "20px", fontSize: "12px",
                            fontWeight: "600", backgroundColor: "#ffebee", color: "#c62828",
                            border: "1px solid #ef9a9a",
                          }}>
                            <i className="fa-solid fa-bug"></i> Defect
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSuggestions;
