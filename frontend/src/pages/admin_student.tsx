import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminSideNavbar from "../components/AdminSideNavbar";
import { getAllStudentsTableData, CACHE_STUDENTS, type StudentTableRow } from "../api/admin_student";
import { cacheGet } from "../utils/cache";
import { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";

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
            <AdminSideNavbar active="students" />

            <div className={styles.mainContent}>
            <div className={styles.container}>
                <h2 className={styles.pageTitle}>
                    <i className="fa-solid fa-user-graduate" style={{ color: '#2980b9', marginRight: '10px' }}></i>All Students
                </h2>
                <p className={styles.subtitle}>View and manage student accounts registered on FastStay.</p>

                {/* STUDENT OVERVIEW TILES */}
                <div style={{ background: '#f8f3e7', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '24px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1a3a5f 0%, #2980b9 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <i className="fa-solid fa-chart-pie" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
                        <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>Student Overview</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {/* Total */}
                        <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #2980b9, #1a3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-users" style={{ color: '#f8f3e7', fontSize: '18px' }}></i>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Total Students</p>
                                    <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                                        {loading ? <SkeletonBlock width="50px" height="26px" /> : students.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Male */}
                        <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #2980b9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-mars" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Male</p>
                                    <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                                        {loading ? <SkeletonBlock width="50px" height="26px" /> : students.filter(s => s.gender === 'Male').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Female */}
                        <div style={{ flex: '1 1 160px', padding: '20px 24px', borderRight: '1px solid #ede4d8', borderBottom: '1px solid #ede4d8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #9b59b6, #6c3483)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-venus" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Female</p>
                                    <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                                        {loading ? <SkeletonBlock width="50px" height="26px" /> : students.filter(s => s.gender === 'Female').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Showing */}
                        <div style={{ flex: '1 1 160px', padding: '20px 24px', borderBottom: '1px solid #ede4d8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #2e86a0, #1a3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="fa-solid fa-filter" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, margin: 0 }}>Showing</p>
                                    <p style={{ fontSize: '26px', fontWeight: 700, color: '#2b211c', lineHeight: 1, margin: 0 }}>
                                        {loading ? <SkeletonBlock width="50px" height="26px" /> : filteredStudents.length}
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
                        placeholder="Search by name or city..."
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
                            value={cityFilter}
                            onChange={e => setCityFilter(e.target.value)}
                            disabled={loading}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: loading ? '#d6c4a1' : '#f5e9d2', color: loading ? '#7a6648' : '#4c3f30', fontSize: '14px' }}
                        >
                            <option value="All">All Cities ({students.length})</option>
                            {cityOptions.map(c => <option key={c} value={c}>{c} ({students.filter(s => s.city === c).length})</option>)}
                        </select>
                        <select
                            value={genderFilter}
                            onChange={e => setGenderFilter(e.target.value)}
                            disabled={loading}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: loading ? '#d6c4a1' : '#f5e9d2', color: loading ? '#7a6648' : '#4c3f30', fontSize: '14px' }}
                        >
                            <option value="All">All Genders ({students.length})</option>
                            {genderOptions.map(g => <option key={g} value={g}>{g} ({students.filter(s => s.gender === g).length})</option>)}
                        </select>
                        {(search || cityFilter !== 'All' || genderFilter !== 'All') && (
                            <button
                                onClick={() => { setSearch(''); setCityFilter('All'); setGenderFilter('All'); }}
                                style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                <i className="fa-solid fa-times"></i> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* STUDENTS PANEL */}
                <div style={{ background: '#f8f3e7', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '28px', overflow: 'hidden' }}>
                    {/* Panel header */}
                    <div style={{ background: 'linear-gradient(135deg, #1a3a5f 0%, #2980b9 100%)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-user-graduate" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
                            <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>All Students</span>
                        </div>
                        {!loading && (
                            <span style={{ background: 'rgba(255,255,255,0.18)', color: '#f8f3e7', borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 }}>
                                {filteredStudents.length} of {students.length}
                            </span>
                        )}
                    </div>

                    {/* Column headers */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '2fr 80px 140px 120px 90px',
                        padding: '8px 20px', background: '#f0f5fb', borderBottom: '1px solid #d0e4f7',
                        fontSize: '11px', fontWeight: 700, color: '#1a3a5f', textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        <span>Student</span><span>Age</span><span>City</span>
                        <span>Gender</span><span style={{ textAlign: 'right' }}>Action</span>
                    </div>

                    {/* Loading skeleton */}
                    {loading ? (
                        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <SkeletonBlock width="42px" height="42px" />
                                    <SkeletonBlock width="160px" height="16px" />
                                    <SkeletonBlock width="60px" height="14px" />
                                    <SkeletonBlock width="90px" height="14px" />
                                </div>
                            ))}
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                            <i className="fa-solid fa-user-graduate" style={{ fontSize: '40px', marginBottom: '14px', display: 'block', color: '#c9b8a8' }}></i>
                            <p style={{ fontWeight: 600, color: '#4b3a32', marginBottom: '6px' }}>No students found</p>
                            <p style={{ fontSize: '13px', color: '#a89080' }}>
                                {search || cityFilter !== 'All' || genderFilter !== 'All'
                                    ? 'No students match your filters.'
                                    : 'There are no students registered in the system yet.'}
                            </p>
                            {(search || cityFilter !== 'All' || genderFilter !== 'All') && (
                                <button
                                    onClick={() => { setSearch(''); setCityFilter('All'); setGenderFilter('All'); }}
                                    style={{ marginTop: '14px', padding: '8px 18px', background: '#1a3a5f', color: '#f8f3e7', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                                >Clear filters</button>
                            )}
                        </div>
                    ) : (
                        filteredStudents.map((s, i) => (
                            <div key={s.id} style={{
                                display: 'grid', gridTemplateColumns: '2fr 80px 140px 120px 90px',
                                alignItems: 'center', padding: '13px 20px',
                                borderBottom: i < filteredStudents.length - 1 ? '1px solid #d9e8f5' : 'none',
                                transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f0f5fb')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                {/* Avatar + Name */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #2980b9, #1a3a5f)', color: '#f8f3e7', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {(s.name || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                                        <div style={{ fontSize: '11px', color: '#a89080' }}>ID #{s.id}</div>
                                    </div>
                                </div>
                                {/* Age */}
                                <div>
                                    <span style={{
                                        display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                                        backgroundColor: s.age < 20 ? '#e8f5e8' : s.age < 25 ? '#e8f4fd' : '#fef5e7',
                                        color: s.age < 20 ? '#2e7d32' : s.age < 25 ? '#1565c0' : '#d35400',
                                    }}>{s.age}</span>
                                </div>
                                {/* City */}
                                <div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f0f5fb', color: '#1a3a5f', border: '1px solid #c8dff5' }}>
                                        <i className="fa-solid fa-location-dot" style={{ fontSize: '10px' }}></i>
                                        {s.city}
                                    </span>
                                </div>
                                {/* Gender */}
                                <div>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                                        backgroundColor: s.gender === 'Male' ? '#e8f4fd' : s.gender === 'Female' ? '#fde8f8' : '#f5f5f5',
                                        color: s.gender === 'Male' ? '#1565c0' : s.gender === 'Female' ? '#9b59b6' : '#666',
                                    }}>
                                        <i className={`fa-solid ${s.gender === 'Male' ? 'fa-mars' : s.gender === 'Female' ? 'fa-venus' : 'fa-genderless'}`}></i>
                                        {s.gender}
                                    </span>
                                </div>
                                {/* Action */}
                                <div style={{ textAlign: 'right' }}>
                                    <Link to={`/admin/students/${s.id}`} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '7px 14px', background: '#1a3a5f', color: '#f8f3e7',
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
            </div>
        </>
    );
};

export default AdminViewStudents;