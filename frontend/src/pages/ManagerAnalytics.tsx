import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/ManagerAnalytics.module.css";
import ManagerSidenav from "../components/ManagerSidenav";

interface Hostel {
    p_HostelId: number;
    p_ManagerId: number;
    p_NumRooms: number;
    p_NumFloors: number;
    p_name: string;
}

export default function ManagerAnalytics() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);

    const params = new URLSearchParams(window.location.search);
    const managerId = Number(params.get("user_id"));

    const fetchHostels = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/faststay_app/display/all_hostels");
            const data = await res.json();

            if (data?.hostels) {
                const mapped = data.hostels.map((h: any) => ({
                    p_HostelId: h.p_hostelid,
                    p_ManagerId: h.p_managerid,
                    p_NumRooms: h.p_numrooms,
                    p_NumFloors: h.p_numfloors,
                    p_name: h.p_name,
                }));

                const filtered = mapped.filter((h: Hostel) => h.p_ManagerId === managerId);
                setHostels(filtered);
            }
        } catch (error) {
            console.log("Analytics error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostels();
    }, []);

    const totalHostels = hostels.length;
    const totalRooms = hostels.reduce((sum, h) => sum + h.p_NumRooms, 0);
    const totalFloors = hostels.reduce((sum, h) => sum + h.p_NumFloors, 0);

    return (
        <div className={styles.screen}>
            <ManagerSidenav managerId={managerId} activePage="analytics" />

            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.logo}>
                    <i className="fa-solid fa-building-user"></i> FastStay
                </div>

                <div className={styles.navLinks}>
                    <Link to={`/manager/dashboard?user_id=${managerId}`} className={styles.backArrow}>
                        <i className="fa-solid fa-arrow-left"></i> Back
                    </Link>

                    <Link to={`/manager/dashboard?user_id=${managerId}`}>Dashboard</Link>
                    <Link to={`/manager/add_hostel?user_id=${managerId}`}>Add Hostel</Link>
                    <Link to={`/manager/add_room?user_id=${managerId}`}>Add Room</Link>
                    <Link to={`/manager/profile?user_id=${managerId}`}>Your Profile</Link>
                    <Link to="/">Logout</Link>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <div className={styles.container}>
                <h2 className={styles.pageTitle}>Analytics Overview</h2>
                <p className={styles.subtitle}>Statistics across all your managed hostels</p>

                {loading ? (
                    <p className={styles.loading}>Loading analytics...</p>
                ) : (
                    <div className={styles.statsGrid}>

                        <div className={styles.statCard}>
                            <div className={styles.iconBox}>
                                <i className="fa-solid fa-building-user"></i>
                            </div>
                            <h3>Total Hostels</h3>
                            <p className={styles.statNumber}>{totalHostels}</p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.iconBox}>
                                <i className="fa-solid fa-bed"></i>
                            </div>
                            <h3>Total Rooms</h3>
                            <p className={styles.statNumber}>{totalRooms}</p>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.iconBox}>
                                <i className="fa-solid fa-layer-group"></i>
                            </div>
                            <h3>Total Floors</h3>
                            <p className={styles.statNumber}>{totalFloors}</p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}