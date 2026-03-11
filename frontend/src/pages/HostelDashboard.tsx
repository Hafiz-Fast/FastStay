import { useEffect, useState } from "react";
import styles from "../styles/HostelDashboard.module.css";
import { Link, useNavigate } from "react-router-dom";
import ManagerSidenav from "../components/ManagerSidenav";

interface Hostel {
    p_HostelId: number;
    p_ManagerId: number;
    p_BlockNo: string;
    p_HouseNo: string;
    p_HostelType: string;
    p_isParking: boolean;
    p_NumRooms: number;
    p_NumFloors: number;
    p_WaterTimings: number;
    p_CleanlinessTenure: number;
    p_IssueResolvingTenure: number;
    p_MessProvide: boolean;
    p_GeezerFlag: boolean;
    p_name: string;
}

export default function HostelDashboard() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [pics, setPics] = useState<Record<number, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState<Record<number, number>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [hostelToDelete, setHostelToDelete] = useState<Hostel | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    
    const params = new URLSearchParams(window.location.search);
    const managerId = Number(params.get("user_id"));
    const navigate = useNavigate();

    console.log(managerId);

    function mapHostel(h: any): Hostel {
        return {
            p_HostelId: h.p_hostelid,
            p_ManagerId: h.p_managerid,
            p_BlockNo: h.p_blockno,
            p_HouseNo: h.p_houseno,
            p_HostelType: h.p_hosteltype,
            p_isParking: h.p_isparking,
            p_NumRooms: h.p_numrooms,
            p_NumFloors: h.p_numfloors,
            p_WaterTimings: h.p_watertimings,
            p_CleanlinessTenure: h.p_cleanlinesstenure,
            p_IssueResolvingTenure: h.p_issueresolvingtenure,
            p_MessProvide: h.p_messprovide,
            p_GeezerFlag: h.p_geezerflag,
            p_name: h.p_name,
        };
    }

    // Handle edit button click
    const handleEditHostel = (hostelId: number) => {
        navigate(`/manager/add_hostel?user_id=${managerId}&edit_hostel=${hostelId}`);
    };

    // Handle delete button click
    const handleDeleteClick = (hostel: Hostel) => {
        setHostelToDelete(hostel);
        setShowDeleteModal(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setHostelToDelete(null);
        setDeleteMessage(null);
    };

    // Confirm and delete hostel
    const confirmDeleteHostel = async () => {
        if (!hostelToDelete) return;

        setDeleteLoading(true);
        setDeleteMessage(null);

        try {
            const response = await fetch("http://127.0.0.1:8000/faststay_app/hosteldetails/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    p_HostelId: hostelToDelete.p_HostelId.toString()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Remove deleted hostel from state
                setHostels(prev => prev.filter(h => h.p_HostelId !== hostelToDelete.p_HostelId));
                
                // Remove pics for deleted hostel
                setPics(prev => {
                    const newPics = { ...prev };
                    delete newPics[hostelToDelete.p_HostelId];
                    return newPics;
                });

                setDeleteMessage({
                    type: 'success',
                    text: data.message || `Hostel "${hostelToDelete.p_name}" deleted successfully`
                });

                // Close modal after 2 seconds
                setTimeout(() => {
                    closeDeleteModal();
                }, 2000);
            } else {
                setDeleteMessage({
                    type: 'error',
                    text: data.error || 'Failed to delete hostel'
                });
            }
        } catch (error) {
            console.error("Delete error:", error);
            setDeleteMessage({
                type: 'error',
                text: 'Network error. Please try again.'
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    // Fetch all hostels
    const fetchHostels = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/faststay_app/display/all_hostels");
            const data = await res.json();

            if (data?.hostels) {
                const mapped = data.hostels.map((h: any) => mapHostel(h));
                const filtered = mapped.filter(
                    (h: Hostel) => h.p_ManagerId === managerId
                );
                setHostels(filtered);

                // For each hostel → fetch pics
                filtered.forEach((h: { p_HostelId: number }) => fetchPics(h.p_HostelId));
            }
        } catch (error) {
            console.log("Hostel fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch hostel pics for each hostel
    async function fetchPics(hostelId: number) {
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/faststay_app/display/hostel_pic?p_HostelId=${hostelId}`
            );
            const data = await res.json();

            let images: string[] = [];

            if (Array.isArray(data)) {
                images = data.map((item: any) => item.p_photolink);
            } else if (data?.p_photolink) {
                images = [data.p_photolink];
            }

            if (images.length > 0) {
                setPics((prev) => ({
                    ...prev,
                    [hostelId]: images,
                }));
            }
        } catch (err) {
            console.log("Pic fetch error", err);
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchHostels();
    }, []);

    // Slide control
    const nextPic = (id: number) => {
        const images = pics[id];
        if (!images) return;
        setSlideIndex((p) => ({
            ...p,
            [id]: p[id] === images.length - 1 ? 0 : (p[id] || 0) + 1,
        }));
    };

    const prevPic = (id: number) => {
        const images = pics[id];
        if (!images) return;
        setSlideIndex((p) => ({
            ...p,
            [id]: p[id] === 0 ? images.length - 1 : (p[id] || 0) - 1,
        }));
    };

    return (
        <>
            <ManagerSidenav managerId={managerId} activePage="dashboard" />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Confirm Deletion</h3>
                            <button 
                                className={styles.closeModalBtn}
                                onClick={closeDeleteModal}
                                disabled={deleteLoading}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            {deleteMessage ? (
                                <div className={`${styles.message} ${
                                    deleteMessage.type === 'success' ? styles.successMessage : styles.errorMessage
                                }`}>
                                    {deleteMessage.text}
                                </div>
                            ) : (
                                <>
                                    <div className={styles.warningIcon}>
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                    </div>
                                    <p className={styles.warningText}>
                                        Are you sure you want to delete <strong>"{hostelToDelete?.p_name}"</strong>?
                                    </p>
                                    <div className={styles.hostelDetails}>
                                        <p><span>House:</span> {hostelToDelete?.p_HouseNo}</p>
                                        <p><span>Block:</span> {hostelToDelete?.p_BlockNo}</p>
                                        <p><span>Type:</span> {hostelToDelete?.p_HostelType}</p>
                                        <p><span>Rooms:</span> {hostelToDelete?.p_NumRooms}</p>
                                    </div>
                                    <div className={styles.warningBox}>
                                        <p className={styles.warningTitle}>⚠️ Warning</p>
                                        <p>This action will permanently delete:</p>
                                        <ul>
                                            <li>All rooms in this hostel</li>
                                            <li>Mess details</li>
                                            <li>Kitchen details</li>
                                            <li>Security information</li>
                                            <li>Expense records</li>
                                            <li>Hostel images</li>
                                        </ul>
                                        <p className={styles.irreversible}>This action cannot be undone!</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {!deleteMessage && (
                            <div className={styles.modalFooter}>
                                <button
                                    className={`${styles.modalBtn} ${styles.cancelBtn}`}
                                    onClick={closeDeleteModal}
                                    disabled={deleteLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`${styles.modalBtn} ${styles.deleteConfirmBtn}`}
                                    onClick={confirmDeleteHostel}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                                        </>
                                    ) : (
                                        "Delete Permanently"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <nav className={styles.navbar}>
                <div className={styles.logo}>
                    <i className="fa-solid fa-building-user"></i> FastStay
                </div>
                <div className={styles.navLinks}>
                    <Link
                        to={`/manager/dashboard?user_id=${managerId}`}
                        className={styles.active}
                    >
                        Dashboard
                    </Link>

                    <Link to={`/manager/add_hostel?user_id=${managerId}`}>
                        Add Hostel
                    </Link>

                    <Link to={`/manager/add_room?user_id=${managerId}`}>
                        Add Room
                    </Link>

                    <Link to={`/manager/profile?user_id=${managerId}`}>
                        Your Profile
                    </Link>

                    <Link to="/">
                        Logout
                    </Link>
                </div>
            </nav>

            <div className={styles.screen}>
                <div className={styles.container}>
                    <h2 className={styles.pageTitle}>Manager Dashboard</h2>
                    <p className={styles.subtitle}>Manage your hostels and rooms easily.</p>

                    {/* ACTION CARDS */}
                    <div className={styles.actions}>
                        <Link 
                            to={`/manager/add_hostel?user_id=${managerId}`} 
                            className={styles.actionCard}
                        >
                            <i className="fa-solid fa-plus"></i>
                            <h3>Add Hostel</h3>
                        </Link>
                        <Link 
                            to={`/manager/add_room?user_id=${managerId}`} 
                            className={styles.actionCard}
                        >
                            <i className="fa-solid fa-bed"></i>
                            <h3>Add Room</h3>
                        </Link>
                        <Link 
                            to={`/manager/analytics?user_id=${managerId}`} 
                            className={styles.actionCard}
                        >
                            <i className="fa-solid fa-chart-line"></i>
                            <h3>Analytics</h3>
                        </Link>
                    </div>

                    {/* HOSTEL LIST */}
                    <h3 className={styles.sectionTitle}>Your Hostels</h3>

                    <div className={styles.hostelList}>
                        {loading && (
                            <div className={styles.loadingContainer}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Loading your hostels...</p>
                            </div>
                        )}

                        {!loading && hostels.length === 0 && (
                            <div className={styles.noHostelsMessage}>
                                <p>No hostels found for this manager.</p>
                                <Link 
                                    to={`/manager/add_hostel?user_id=${managerId}`}
                                    className={styles.addHostelLink}
                                >
                                    Add your first hostel
                                </Link>
                            </div>
                        )}

                        {!loading && hostels.map((h) => (
                            <div key={h.p_HostelId} className={styles.hostelCard}>
                                {/* IMAGE SLIDER */}
                                <div className={styles.imageWrapper}>
                                    {pics[h.p_HostelId]?.length > 0 ? (
                                        <>
                                            <img
                                                src={pics[h.p_HostelId][slideIndex[h.p_HostelId] || 0]}
                                                className={styles.cardImg}
                                                alt={h.p_name}
                                            />

                                            {/* Only show arrows if more than 1 image */}
                                            {pics[h.p_HostelId].length > 1 && (
                                                <>
                                                    <button
                                                        className={styles.leftArrow}
                                                        onClick={() => prevPic(h.p_HostelId)}
                                                    >
                                                        &#10094;
                                                    </button>

                                                    <button
                                                        className={styles.rightArrow}
                                                        onClick={() => nextPic(h.p_HostelId)}
                                                    >
                                                        &#10095;
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className={styles.noImagePlaceholder}>
                                            <i className="fa-solid fa-building"></i>
                                            <span>No image available</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.info}>
                                    <h3>{h.p_name}</h3>
                                    <p><b>House:</b> {h.p_HouseNo}</p>
                                    <p><b>Block:</b> {h.p_BlockNo}</p>
                                    <p><b>Type:</b> {h.p_HostelType}</p>
                                    <p><b>Rooms:</b> {h.p_NumRooms}</p>
                                </div>

                                <div className={styles.buttons}>
                                    <button 
                                        className={`${styles.btn} ${styles.view}`}
                                        onClick={() => handleEditHostel(h.p_HostelId)}
                                    >
                                        View
                                    </button>
                                    <button 
                                        className={`${styles.btn} ${styles.edit}`}
                                        onClick={() => handleEditHostel(h.p_HostelId)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className={`${styles.btn} ${styles.delete}`}
                                        onClick={() => handleDeleteClick(h)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}