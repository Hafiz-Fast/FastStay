// src/components/AddHostel.tsx
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/AddHostel.module.css";
import { Link } from "react-router-dom";
import ManagerSidenav from "../components/ManagerSidenav";
import BasicInfoSection from "./hostel-sections/BasicInfoSection";
import MessDetailsSection from "./hostel-sections/MessDetailsSection";
import KitchenDetailsSection from "./hostel-sections/KitchenDetailsSection";
import SecurityInfoSection from "./hostel-sections/SecurityInfoSection";
import ExpensesSection from "./hostel-sections/ExpensesSection";

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

export default function AddHostel() {
    const params = new URLSearchParams(window.location.search);
    const managerId = Number(params.get("user_id"));
    const editHostelId = params.get("edit_hostel");

    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [hostelId, setHostelId] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState("basic");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingMode, setEditingMode] = useState(false);
    const [hostelDetails, setHostelDetails] = useState<any>(null);

    // hostel pics URLs (from DB/cloudinary)
    const [hostelPics, setHostelPics] = useState<string[]>([]);

    // Pending files selected before hostel is saved
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    // Form state for basic info
    const [form, setForm] = useState({
        p_ManagerId: managerId,
        p_HostelId: 0,
        p_BlockNo: "",
        p_HouseNo: "",
        p_HostelType: "",
        p_isParking: false,
        p_NumRooms: "",
        p_NumFloors: "",
        p_WaterTimings: "",
        p_CleanlinessTenure: "",
        p_IssueResolvingTenure: "",
        p_MessProvide: false,
        p_GeezerFlag: false,
        p_name: "",
        p_Latitude: "",
        p_Longitude: ""
    });

    // Add this useEffect to scroll to top when component mounts or editHostelId changes
    useEffect(() => {
        // Scroll to top immediately when component loads
        window.scrollTo(0, 0);

        // Also scroll to top when editHostelId changes (which happens after hostel loads)
        if (editHostelId) {
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        }
    }, [editHostelId]);

    // Fetch all hostels for this manager
    useEffect(() => {
        async function fetchHostels() {
            try {
                setLoading(true);
                const res = await fetch("http://127.0.0.1:8000/faststay_app/display/all_hostels");
                const data = await res.json();

                if (data?.hostels) {
                    const filteredHostels = data.hostels
                        .filter((h: any) => h.p_managerid === managerId)
                        .map((h: any) => ({
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
                        }));

                    setHostels(filteredHostels);
                }
            } catch (error) {
                console.log("Hostel fetch error", error);
                setMessage("Failed to load hostels");
            } finally {
                setLoading(false);
            }
        }
        fetchHostels();
    }, [managerId]);

    // When selectedHostelId changes, fetch details and pics
    useEffect(() => {
        if (selectedHostelId) {
            fetchHostelDetails(selectedHostelId);
            loadHostelPics(selectedHostelId);
        } else {
            setEditingMode(false);
            setHostelDetails(null);
            resetForm();
            setHostelPics([]);
        }
    }, [selectedHostelId]);

    useEffect(() => {
        if (editHostelId) {
            const hostelId = parseInt(editHostelId);
            setSelectedHostelId(hostelId);
            setHostelId(hostelId);
            // This will trigger the existing useEffect that fetches hostel details
        }
    }, [editHostelId]);

    async function fetchHostelDetails(hostelIdParam: number) {
        try {
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/faststay_app/hostel/display/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ p_HostelId: hostelIdParam })
            });

            const data = await res.json();

            if (res.ok && data?.success && data?.result) {
                const hostel = data.result;
                setHostelDetails(hostel);
                setEditingMode(true);
                setHostelId(hostelIdParam);

                // Pre-fill form with hostel details
                setForm(prev => ({
                    ...prev,
                    p_HostelId: hostelIdParam,
                    p_BlockNo: hostel.p_BlockNo || "",
                    p_HouseNo: hostel.p_HouseNo || "",
                    p_HostelType: hostel.p_HostelType || "",
                    p_isParking: hostel.p_isParking || false,
                    p_NumRooms: hostel.p_NumRooms?.toString() || "",
                    p_NumFloors: hostel.p_NumFloors?.toString() || "",
                    p_WaterTimings: hostel.p_WaterTimings?.toString() || "",
                    p_CleanlinessTenure: hostel.p_CleanlinessTenure?.toString() || "",
                    p_IssueResolvingTenure: hostel.p_IssueResolvingTenure?.toString() || "",
                    p_MessProvide: hostel.p_MessProvide || false,
                    p_GeezerFlag: hostel.p_GeezerFlag || false,
                    p_name: hostel.p_name || "",
                    p_Latitude: hostel.p_Latitude?.toString() || "",
                    p_Longitude: hostel.p_Longitude?.toString() || ""
                }));

                setActiveSection("basic");
                setMessage("");
            } else {
                setMessage(data?.error || "Failed to load hostel details");
            }
        } catch (error) {
            console.error("Error fetching hostel details:", error);
            setMessage("Failed to load hostel details");
        } finally {
            setLoading(false);
        }
    }

    async function loadHostelPics(hostelIdParam: number) {
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/faststay_app/display/hostel_pic?p_HostelId=${hostelIdParam}`
            );
            const data = await res.json();

            if (res.ok) {
                const urls = Array.isArray(data)
                    ? data.map((d: any) =>
                        d.p_PhotoLink ||
                        d.p_photolink ||
                        d.photolink ||
                        d.P_Photolink
                    )
                    : [];

                console.log("Loaded hostel pics:", urls);

                setHostelPics(urls);
            } else {
                setHostelPics([]);
            }
        } catch (err) {
            console.error("Failed to load hostel pics", err);
            setHostelPics([]);
        }
    }

    function handleChange(e: any) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleHostelSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        const hostelIdVal = parseInt(e.target.value);
        setSelectedHostelId(hostelIdVal || null);
        setMessage("");
        setHostelId(hostelIdVal || null);
    }

    function openAddNewMode() {
        setSelectedHostelId(null);
        setEditingMode(false);
        setHostelDetails(null);
        resetForm();
        setActiveSection("basic");
        setHostelId(null);
        setHostelPics([]);
        setPendingFiles([]);
        setMessage("");

        // Clear the edit_hostel parameter from URL without refreshing
        const newUrl = window.location.pathname + `?user_id=${managerId}`;
        window.history.replaceState({}, '', newUrl);
    }

    function resetForm() {
        setForm({
            p_ManagerId: managerId,
            p_HostelId: 0,
            p_BlockNo: "",
            p_HouseNo: "",
            p_HostelType: "",
            p_isParking: false,
            p_NumRooms: "",
            p_NumFloors: "",
            p_WaterTimings: "",
            p_CleanlinessTenure: "",
            p_IssueResolvingTenure: "",
            p_MessProvide: false,
            p_GeezerFlag: false,
            p_name: "",
            p_Latitude: "",
            p_Longitude: ""
        });
    }

    async function handleSubmit(e: any) {
        e.preventDefault();
        setMessage("");

        try {
            const url = editingMode
                ? "http://127.0.0.1:8000/faststay_app/hostel/update/"
                : "http://127.0.0.1:8000/faststay_app/hostel/add/";

            const method = editingMode ? "PUT" : "POST";

            // Prepare the data
            const submitData = {
                ...form,
                p_NumRooms: parseInt(form.p_NumRooms) || 0,
                p_NumFloors: parseInt(form.p_NumFloors) || 0,
                p_WaterTimings: parseInt(form.p_WaterTimings) || 0,
                p_CleanlinessTenure: parseInt(form.p_CleanlinessTenure) || 0,
                p_IssueResolvingTenure: parseInt(form.p_IssueResolvingTenure) || 0,
                p_Latitude: parseFloat(form.p_Latitude),
                p_Longitude: parseFloat(form.p_Longitude),
            };

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            });

            const data = await res.json();

            if (res.ok) {

                setMessage(editingMode
                    ? (data.message || "Hostel Updated Successfully!")
                    : (data.message || "Hostel Added Successfully!"));

                if (!editingMode && data.hostelid) {
                    // When newly created, set hostelId & selectedHostelId
                    setHostelId(data.hostelid);
                    setSelectedHostelId(data.hostelid);
                    setActiveSection("mess");

                    // Clear edit_hostel parameter for new hostels
                    const newUrl = window.location.pathname + `?user_id=${managerId}&hostel_id=${data.hostelid}`;
                    window.history.replaceState({}, '', newUrl);

                    // Upload pending files now that we have a hostel ID
                    if (pendingFiles.length > 0) {
                        await uploadPendingFiles(data.hostelid);
                    }
                }
                else if (editingMode && selectedHostelId) {
                    // Upload pending files for existing hostel
                    if (pendingFiles.length > 0) {
                        await uploadPendingFiles(selectedHostelId);
                    }
                    // Refresh hostel details
                    fetchHostelDetails(selectedHostelId);
                }

                // Refresh hostel list
                const refreshRes = await fetch("http://127.0.0.1:8000/faststay_app/display/all_hostels");
                const refreshData = await refreshRes.json();

                if (refreshData?.hostels) {
                    const filteredHostels = refreshData.hostels
                        .filter((h: any) => h.p_managerid === managerId)
                        .map((h: any) => ({
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
                        }));

                    setHostels(filteredHostels);
                }
            } else {
                setMessage(data.error || (editingMode ? "Failed to update hostel" : "Failed to add hostel"));
            }
        } catch (error) {
            console.error("Submit error:", error);
            setMessage("Server error");
        }
    }

    // Upload pending files after hostel creation
    async function uploadPendingFiles(newHostelId: number) {
        for (let i = 0; i < pendingFiles.length; i++) {
            const file = pendingFiles[i];
            const formData = new FormData();
            formData.append("p_HostelId", newHostelId.toString());
            formData.append("p_PhotoLink", file);

            try {
                const res = await fetch("http://127.0.0.1:8000/faststay_app/hostel_pics/add", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();

                if (res.ok) {
                    if (data.photo_url) {
                        setHostelPics(prev => [...prev, data.photo_url]);
                    } else if (data.photoUrl) {
                        setHostelPics(prev => [...prev, data.photoUrl]);
                    }
                } else {
                    console.error("Pending upload failed:", data.error);
                }
            } catch (err) {
                console.error("Pending upload error:", err);
            }
        }
        // Clear pending files after upload
        setPendingFiles([]);
        // Refresh pics from server
        loadHostelPics(newHostelId);
    }

    // Image upload handler (uploads to backend which will upload to Cloudinary)
    async function handlePicUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!hostelId) {
            setMessage("Please save basic information first (so we have a hostel ID).");
            return;
        }

        const files = e.target.files;
        if (!files || files.length === 0) return;

        // enforce total <= 5
        if (hostelPics.length + files.length > 5) {
            setMessage("You can upload a maximum of 5 images per hostel.");
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("p_HostelId", hostelId.toString());
            // backend expects key "p_PhotoLink" like the manager endpoint
            formData.append("p_PhotoLink", file);

            try {
                const res = await fetch("http://127.0.0.1:8000/faststay_app/hostel_pics/add", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (res.ok) {
                    // backend returns photo_url
                    if (data.photo_url) {
                        setHostelPics(prev => [...prev, data.photo_url]);
                    } else if (data.photoUrl) {
                        setHostelPics(prev => [...prev, data.photoUrl]);
                    } else {
                        // Fallback: if backend returns message only, attempt to refresh list
                        loadHostelPics(hostelId);
                    }
                } else {
                    // show backend error
                    setMessage(data.error || "Image upload failed");
                }
            } catch (err) {
                console.error("Upload error:", err);
                setMessage("Image upload failed");
            }
        }
    }

    // Remove an already-uploaded pic
    function handleRemoveUploadedPic(index: number) {
        // Remove from local state (optionally call backend delete endpoint)
        setHostelPics(prev => prev.filter((_, i) => i !== index));
    }

    function requireBasicInfo(e: any, goto: string) {
        e.preventDefault();
        if (!hostelId) {
            setMessage("Please fill Basic Information first");
            setActiveSection("basic");
            return;
        }
        setMessage("");
        setActiveSection(goto);
    }

    const selectedHostel = hostels.find(h => h.p_HostelId === selectedHostelId);

    const sectionRef = useRef<HTMLDivElement>(null);

    // Scroll to section content when active section changes
    useEffect(() => {
        if (sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: "smooth", block: 'start' });
        }
    }, [activeSection]);

    return (
        <>
            <ManagerSidenav managerId={managerId} activePage="add_hostel" />

            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.logo}>
                    <i className="fa-solid fa-building-user"></i> FastStay
                </div>
                <div className={styles.navLinks}>
                    <Link to={`/manager/dashboard?user_id=${managerId}`}>Dashboard</Link>
                    <Link to={`/manager/add_hostel?user_id=${managerId}`} className={styles.active}>Add Hostel</Link>
                    <Link to={`/manager/add_room?user_id=${managerId}`}>Add Room</Link>
                    <Link to={`/manager/profile?user_id=${managerId}`}>Your Profile</Link>
                    <Link to="/">Logout</Link>
                </div>
            </nav>

            <div className={styles.layout}>
                {/* SIDEBAR */}
                <aside className={styles.sidebar}>
                    <h3>Hostel Sections</h3>
                    <ul>
                        <li>
                            <button
                                className={`${styles.sidebarLink} ${activeSection === "basic" ? styles.active : ""}`}
                                onClick={() => setActiveSection("basic")}
                            >
                                Basic Information
                            </button>
                        </li>
                        <li>
                            <button
                                className={`${styles.sidebarLink} ${activeSection === "mess" ? styles.active : ""}`}
                                onClick={(e) => requireBasicInfo(e, "mess")}
                                disabled={!hostelId}
                            >
                                Mess Details
                            </button>
                        </li>
                        <li>
                            <button
                                className={`${styles.sidebarLink} ${activeSection === "kitchen" ? styles.active : ""}`}
                                onClick={(e) => requireBasicInfo(e, "kitchen")}
                                disabled={!hostelId}
                            >
                                Kitchen Details
                            </button>
                        </li>
                        <li>
                            <button
                                className={`${styles.sidebarLink} ${activeSection === "security" ? styles.active : ""}`}
                                onClick={(e) => requireBasicInfo(e, "security")}
                                disabled={!hostelId}
                            >
                                Security Info
                            </button>
                        </li>
                        <li>
                            <button
                                className={`${styles.sidebarLink} ${activeSection === "expenses" ? styles.active : ""}`}
                                onClick={(e) => requireBasicInfo(e, "expenses")}
                                disabled={!hostelId}
                            >
                                Expenses
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* MAIN CONTENT */}
                <main className={styles.content}>
                    <h2 className={styles.pageTitle}>
                        {editingMode ? "Edit Hostel Details" : "Add Hostel Details"}
                    </h2>
                    <p className={styles.subtitle}>
                        {editingMode
                            ? "View and edit hostel information"
                            : "Fill in the required information carefully"}
                    </p>

                    {/* Hostel Selector Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHead}>
                            <h3>Select Hostel</h3>
                            <button
                                className={styles.addNewBtn}
                                onClick={openAddNewMode}
                            >
                                <i className="fa-solid fa-plus"></i> Add New Hostel
                            </button>
                        </div>
                        <div className={styles.hostelSelector}>
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <select
                                    id="hostel-select"
                                    value={selectedHostelId || ""}
                                    onChange={handleHostelSelect}
                                    disabled={loading}
                                >
                                    <option value="" disabled>Select a hostel</option>
                                    {hostels.map(hostel => (
                                        <option key={hostel.p_HostelId} value={hostel.p_HostelId}>
                                            {hostel.p_name} - {hostel.p_BlockNo}, {hostel.p_HouseNo} ({hostel.p_HostelType})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedHostel && (
                            <div className={styles.hostelInfo}>
                                <span>Rooms: {selectedHostel.p_NumRooms}</span>
                                <span>Floors: {selectedHostel.p_NumFloors}</span>
                                <span>Type: {selectedHostel.p_HostelType}</span>
                                <span>Parking: {selectedHostel.p_isParking ? "Yes" : "No"}</span>
                                <span>Mess: {selectedHostel.p_MessProvide ? "Yes" : "No"}</span>
                            </div>
                        )}
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`${styles.message} ${message.includes("Successfully") ||
                            message.includes("successfully") ||
                            message.includes("Added") ||
                            message.includes("Updated") ||
                            message.includes("success")
                            ? styles.success
                            : styles.error
                            }`}>
                            {message}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className={styles.loading}>
                            <i className="fa-solid fa-spinner fa-spin"></i> Loading...
                        </div>
                    )}

                    {/* Section anchor for scrolling */}
                    <div ref={sectionRef}></div>

                    {/* BASIC INFORMATION SECTION */}
                    {activeSection === "basic" && (
                        <BasicInfoSection
                            form={form}
                            handleChange={handleChange}
                            handleSubmit={handleSubmit}
                            message={message}
                            editingMode={editingMode}
                            selectedHostelId={selectedHostelId}
                            hostelId={hostelId}
                            hostelPics={hostelPics}
                            onFileChange={handlePicUpload}
                            pendingFiles={pendingFiles}
                            setPendingFiles={setPendingFiles}
                            onRemoveUploadedPic={handleRemoveUploadedPic}
                        />
                    )}

                    {/* MESS DETAILS SECTION */}
                    {activeSection === "mess" && hostelId && (
                        <MessDetailsSection
                            hostelId={hostelId}
                            editingMode={editingMode}
                            hostelDetails={hostelDetails}
                        />
                    )}

                    {/* KITCHEN DETAILS SECTION */}
                    {activeSection === "kitchen" && hostelId && (
                        <KitchenDetailsSection
                            hostelId={hostelId}
                            editingMode={editingMode}
                            hostelDetails={hostelDetails}
                        />
                    )}

                    {/* SECURITY DETAILS SECTION */}
                    {activeSection === "security" && hostelId && (
                        <SecurityInfoSection
                            hostelId={hostelId}
                            editingMode={editingMode}
                            hostelDetails={hostelDetails}
                        />
                    )}

                    {/* EXPENSES SECTION */}
                    {activeSection === "expenses" && hostelId && (
                        <ExpensesSection
                            hostelId={hostelId}
                            editingMode={editingMode}
                            hostelDetails={hostelDetails}
                        />
                    )}
                </main>
            </div>
        </>
    );
}