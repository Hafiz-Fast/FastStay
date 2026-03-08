import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllStudentsTableData, CACHE_STUDENTS, type StudentTableRow } from "../api/admin_student";
import { cacheGet } from "../utils/cache";
import SkeletonRow from "../components/SkeletonRow";
import styles from "../styles/admin_student.module.css";

const AdminViewStudents: React.FC = () => {
    const [students, setStudents] = useState<StudentTableRow[]>([]);
    const [search, setSearch] = useState<string>("");
    const [cityFilter, setCityFilter] = useState<string>("All");
    const [genderFilter, setGenderFilter] = useState<string>("All");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Phase 1: instant render from cache
        const cached = cacheGet<StudentTableRow[]>(CACHE_STUDENTS);
        if (cached) {
            setStudents(cached);
            setLoading(false);
        }

        // Phase 2: background refresh
        getAllStudentsTableData(true)
            .then(result => {
                setStudents(result);
                setLoading(false);
            })
            .catch((err: unknown) => {
                console.error(err);
                if (!cached) setError("Failed to load students data. Please try again later.");
                setLoading(false);
            });
    }, []);

    // Get unique cities and genders from data
    const cityOptions = useMemo(() => {
        const cities = new Set(students.map(s => s.city).filter(Boolean));
        return Array.from(cities).sort();
    }, [students]);

    const genderOptions = useMemo(() => {
        const genders = new Set(students.map(s => s.gender).filter(Boolean));
        return Array.from(genders).sort();
    }, [students]);

    // Filter students based on search and filters
    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            // Search filter
            const searchTerm = search.toLowerCase();
            const matchesSearch = searchTerm === "" ||
                s.name.toLowerCase().includes(searchTerm) ||
                s.city.toLowerCase().includes(searchTerm);

            // City filter
            const matchesCity = cityFilter === "All" || s.city === cityFilter;

            // Gender filter
            const matchesGender = genderFilter === "All" || s.gender === genderFilter;

            return matchesSearch && matchesCity && matchesGender;
        });
    }, [students, search, cityFilter, genderFilter]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (filteredStudents.length === 0) return null;

        const averageAge = filteredStudents.reduce((sum, s) => sum + s.age, 0) / filteredStudents.length;
        const genderCount = filteredStudents.reduce((acc, s) => {
            acc[s.gender] = (acc[s.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { averageAge, genderCount };
    }, [filteredStudents]);

    // Show only error on full page if there's a critical error
    if (error) {
        return (
            <div className={styles.container} style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div className={styles.body}>

            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.logo}>
                    <i className="fa-solid fa-user-shield"></i> FastStay Admin
                </div>

                <div className={styles.navLinks}>
                    <Link to="/admin" className={styles.navLink}>Dashboard</Link>
                    <Link to="/admin/hostels" className={styles.navLink}>Hostels</Link>
                    <Link to="/admin/students" className={`${styles.navLink} ${styles.activeNavLink}`}>Students</Link>
                    <Link to="/admin/managers" className={styles.navLink}>Managers</Link>
                    <Link to="/admin/logout" className={styles.navLink}>Logout</Link>
                </div>
            </nav>

            {/* MAIN */}
            <div className={styles.container}>
                <h2 className={styles.pageTitle}><i className="fa-solid fa-user-graduate"></i> All Students</h2>
                <p className={styles.subtitle}>View and manage student accounts registered on FastStay.</p>

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
                            Showing {filteredStudents.length} of {students.length} student(s)
                            {(cityFilter !== "All" || genderFilter !== "All" || search) && " (filtered)"}
                        </span>
                    </div>
                )}

                {/* SEARCH + FILTER BAR */}
                <div className={styles.topBar} style={{ marginBottom: "20px" }}>
                    <div className={styles.searchBox} style={{ flex: 1 }}>
                        <input
                            type="text"
                            placeholder="Search by name or city..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                            disabled={loading}
                            style={{
                                backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
                                color: loading ? "#7a6648" : "#4c3f30",            // deep brown text shades
                                width: "40%"
                            }}
                        />
                    </div>

                    <div className={styles.filters} style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "150px" }}>
                            <label style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                                Filter by City
                            </label>
                            <select
                                className={styles.select}
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                disabled={loading}
                                style={{
                                backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
                                color: loading ? "#7a6648" : "#4c3f30",
                                }}
                            >
                                <option value="All">All Cities ({students.length})</option>
                                {cityOptions.map((city) => (
                                    <option key={city} value={city}>
                                        {city} ({students.filter(s => s.city === city).length})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", minWidth: "150px" }}>
                            <label style={{ fontSize: "12px", color: "#666", fontWeight: "500" }}>
                                Filter by Gender
                            </label>
                            <select
                                className={styles.select}
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                disabled={loading}
                                style={{
                                backgroundColor: loading ? "#d6c4a1" : "#f5e9d2",  // light muted brown tones
                                color: loading ? "#7a6648" : "#4c3f30",
                                }}
                            >
                                <option value="All">All Genders ({students.length})</option>
                                {genderOptions.map((gender) => (
                                    <option key={gender} value={gender}>
                                        {gender} ({students.filter(s => s.gender === gender).length})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(search || cityFilter !== "All" || genderFilter !== "All") && (
                            <div style={{ alignSelf: "flex-end" }}>
                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setCityFilter("All");
                                        setGenderFilter("All");
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
                                        height: "38px"
                                    }}
                                >
                                    <i className="fa-solid fa-times"></i>
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* STATISTICS BAR */}
                {!loading && filteredStudents.length > 0 && stats && (
                    <div style={{
                        marginBottom: "20px",
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e9ecef",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        fontSize: "14px",
                        color: "#666"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <i className="fa-solid fa-users" style={{ color: "#3498db" }}></i>
                            <div>
                                <div style={{ fontWeight: "600", color: "#2c3e50" }}>
                                    {filteredStudents.length} Students
                                </div>
                                <div style={{ fontSize: "12px" }}>
                                    Average Age: <strong>{stats.averageAge.toFixed(1)}</strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <i className="fa-solid fa-venus-mars" style={{ color: "#9b59b6" }}></i>
                            <div>
                                <div style={{ fontWeight: "600", color: "#2c3e50" }}>Gender Distribution</div>
                                <div style={{ fontSize: "12px" }}>
                                    {Object.entries(stats.genderCount).map(([gender, count]) => (
                                        <span key={gender} style={{ marginRight: "10px" }}>
                                            {gender}: <strong>{count}</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <i className="fa-solid fa-city" style={{ color: "#e74c3c" }}></i>
                            <div>
                                <div style={{ fontWeight: "600", color: "#2c3e50" }}>Top Cities</div>
                                <div style={{ fontSize: "12px" }}>
                                    {cityOptions.slice(0, 2).map(city => (
                                        <span key={city} style={{ marginRight: "10px" }}>
                                            {city}: <strong>{students.filter(s => s.city === city).length}</strong>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TABLE */}
                <div className={styles.tableCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>City</th>
                                <th>Gender</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <SkeletonRow cols={5} rows={8} />
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <tr key={student.id} className={styles.tableRow}>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                                                    {student.name}
                                                </span>
                                                <span style={{ fontSize: "12px", color: "#666" }}>
                                                    ID: {student.id}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: "inline-block",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                backgroundColor:
                                                    student.age < 20 ? "#e8f5e8" :
                                                    student.age < 25 ? "#e8f4fd" : "#fef5e7",
                                                color:
                                                    student.age < 20 ? "#27ae60" :
                                                    student.age < 25 ? "#2980b9" : "#d35400",
                                                fontWeight: "bold",
                                                fontSize: "13px"
                                            }}>
                                                {student.age}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: "inline-block",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                backgroundColor: "#f8f9fa",
                                                color: "#2c3e50",
                                                border: "1px solid #e9ecef"
                                            }}>
                                                {student.city}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: "inline-block",
                                                padding: "4px 12px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                backgroundColor:
                                                    student.gender === "Male" ? "#e8f4fd" :
                                                    student.gender === "Female" ? "#fde8f8" : "#f5f5f5",
                                                color:
                                                    student.gender === "Male" ? "#2980b9" :
                                                    student.gender === "Female" ? "#9b59b6" : "#666",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px"
                                            }}>
                                                <i className={`fa-solid ${
                                                    student.gender === "Male" ? "fa-mars" :
                                                    student.gender === "Female" ? "fa-venus" : "fa-genderless"
                                                }`}></i>
                                                {student.gender}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/admin/students/${student.id}`}
                                                className={styles.actionBtn}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "5px",
                                                    padding: "8px 16px",
                                                    backgroundColor: "#3498db",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    textDecoration: "none",
                                                    textAlign: "center",
                                                    width: "60%",
                                                    justifyContent: "center"
                                                }}
                                            >
                                                <i className="fa-solid fa-eye"></i>
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={styles.noDataRow}>
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: "40px 20px",
                                            gap: "15px"
                                        }}>
                                            <i className="fa-solid fa-user-graduate" style={{
                                                fontSize: "48px",
                                                color: "#ddd"
                                            }}></i>
                                            <div style={{ textAlign: "center" }}>
                                                <h4 style={{ marginBottom: "5px", color: "#666" }}>
                                                    No students found
                                                </h4>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: "14px",
                                                    color: "#999",
                                                    maxWidth: "400px",
                                                    lineHeight: "1.5"
                                                }}>
                                                    {search || cityFilter !== "All" || genderFilter !== "All"
                                                        ? "No students match your current filters. Try adjusting your search criteria."
                                                        : "There are no students registered in the system yet."}
                                                </p>
                                                {(search || cityFilter !== "All" || genderFilter !== "All") && (
                                                    <button
                                                        onClick={() => {
                                                            setSearch("");
                                                            setCityFilter("All");
                                                            setGenderFilter("All");
                                                        }}
                                                        style={{
                                                            marginTop: "15px",
                                                            padding: "8px 16px",
                                                            backgroundColor: "#3498db",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "5px",
                                                            margin: "0 auto"
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-times"></i>
                                                        Clear all filters
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

export default AdminViewStudents;