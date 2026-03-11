import { useState, useEffect, useRef } from "react";
import styles from "../styles/AddRoom.module.css";
import { Link } from "react-router-dom";
import ManagerSidenav from "../components/ManagerSidenav";

interface Hostel {
    p_HostelId: number;
    p_name: string;
    p_BlockNo: string;
    p_HouseNo: string;
    p_HostelType: string;
}

interface Room {
    p_RoomNo: number;
    p_HostelId: number;
    p_FloorNo: number;
    p_SeaterNo: number;
    p_RoomRent: number;
    p_BedType: string;
    p_WashroomType: string;
    p_CupboardType: string;
    p_isVentilated: boolean;
    p_isCarpet: boolean;
    p_isMiniFridge: boolean;
}

interface RoomPic {
    p_PhotoLink: string;
    p_RoomNo: number;
    p_RoomSeaterNo: number;
}

export default function AddRoom() {
    const params = new URLSearchParams(window.location.search);
    const managerId = Number(params.get("user_id"));

    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomPics, setRoomPics] = useState<RoomPic[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [, setCurrentRoomNo] = useState<number | null>(null);

    // Room form state
    const [roomForm, setRoomForm] = useState({
        p_RoomNo: "",
        p_HostelId: "",
        p_FloorNo: "",
        p_SeaterNo: "",
        p_RoomRent: "",
        p_BedType: "",
        p_WashroomType: "",
        p_CupboardType: "",
        p_isVentilated: false,
        p_isCarpet: false,
        p_isMiniFridge: false
    });

    // Room pics modal state
    const [showPicsModal, setShowPicsModal] = useState(false);
    const [currentRoomForPics, setCurrentRoomForPics] = useState<Room | null>(null);
    const [roomPicsFiles, setRoomPicsFiles] = useState<File[]>([]);
    const [uploadingPics, setUploadingPics] = useState(false);
    const [applyToAllRooms, setApplyToAllRooms] = useState<boolean | null>(null);
    const [uploadedLinks, setUploadedLinks] = useState<string[]>([]);

    // Track current picture index PER ROOM
    const [roomPicIndices, setRoomPicIndices] = useState<{ [key: number]: number }>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch hostels for this manager
    useEffect(() => {
        async function fetchHostels() {
            try {
                const res = await fetch("http://127.0.0.1:8000/faststay_app/display/all_hostels");
                const data = await res.json();

                if (data?.hostels) {
                    // Filter hostels by managerId
                    const filteredHostels = data.hostels
                        .filter((h: any) => h.p_managerid === managerId)
                        .map((h: any) => ({
                            p_HostelId: h.p_hostelid,
                            p_name: h.p_name || `Hostel ${h.p_hostelid}`,
                            p_BlockNo: h.p_blockno,
                            p_HouseNo: h.p_houseno,
                            p_HostelType: h.p_hosteltype
                        }));

                    setHostels(filteredHostels);
                }
            } catch (error) {
                console.error("Error fetching hostels:", error);
                setMessage("Failed to load hostels");
            }
        }
        fetchHostels();
    }, [managerId]);

    // Fetch rooms and pictures when hostel is selected
    useEffect(() => {
        if (selectedHostelId) {
            fetchRoomsForHostel(selectedHostelId);
            fetchRoomPics(selectedHostelId);
        } else {
            setRooms([]);
            setRoomPics([]);
            setRoomPicIndices({});
        }
    }, [selectedHostelId]);

    async function fetchRoomsForHostel(hostelId: number) {
        setLoading(true);
        setMessage("");
        try {
            console.log("Fetching rooms for hostel ID:", hostelId);
            const res = await fetch("http://127.0.0.1:8000/faststay_app/Rooms/DisplayAllHostel/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ p_HostelId: hostelId })
            });

            const data = await res.json();
            console.log("Rooms API Response:", data);

            if (res.ok && data.success) {
                let roomList = [];

                if (Array.isArray(data.result)) {
                    roomList = data.result;
                } else if (data.result && typeof data.result === 'object') {
                    roomList = [data.result];
                }

                const roomsWithRoomNo = roomList.map((room: any, index: number) => {
                    return {
                        p_RoomNo: room.p_roomno || room.p_RoomNo || room.roomno || (index + 1),
                        p_HostelId: room.p_hostelid || room.p_HostelId || hostelId,
                        p_FloorNo: room.p_floorno || room.p_FloorNo || room.floorno || 1,
                        p_SeaterNo: room.p_seaterno || room.p_SeaterNo || room.seaterno || 1,
                        p_RoomRent: room.p_roomrent || room.p_RoomRent || room.roomrent || 0,
                        p_BedType: room.p_bedtype || room.p_BedType || room.bedtype || "Bed",
                        p_WashroomType: room.p_washroomtype || room.p_WashroomType || room.washroomtype || "Community",
                        p_CupboardType: room.p_cupboardtype || room.p_CupboardType || room.cupboardtype || "Shared",
                        p_isVentilated: room.p_isventilated || room.p_isVentilated || room.isventilated || false,
                        p_isCarpet: room.p_iscarpet || room.p_isCarpet || room.iscarpet || false,
                        p_isMiniFridge: room.p_isminifridge || room.p_isMiniFridge || room.isminifridge || false
                    };
                });

                console.log("Final rooms array:", roomsWithRoomNo);
                setRooms(roomsWithRoomNo);

                // Reset picture indices for all rooms
                const initialIndices: { [key: number]: number } = {};
                roomsWithRoomNo.forEach((room: Room) => {
                    initialIndices[room.p_RoomNo] = 0;
                });
                setRoomPicIndices(initialIndices);

                if (roomsWithRoomNo.length === 0) {
                    setMessage("No rooms found for this hostel. Add your first room!");
                }
            } else {
                setRooms([]);
                setMessage(data.error || "No rooms found for this hostel");
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
            setRooms([]);
            setMessage("Failed to load rooms. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchRoomPics(hostelId: number) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/faststay_app/display/room_pic?p_HostelId=${hostelId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            });

            const data = await res.json();
            console.log("Room pics response:", data);

            if (res.ok) {
                // Check if data is an array or object
                if (Array.isArray(data)) {
                    console.log(`Found ${data.length} room pictures for hostel ${hostelId}`);
                    setRoomPics(data);

                    // Debug: Log each picture
                    data.forEach((pic: RoomPic, index: number) => {
                        console.log(`Pic ${index + 1}: ${pic.p_PhotoLink}, Seater: ${pic.p_RoomSeaterNo}`);
                    });
                } else if (data.p_PhotoLink) {
                    // Single picture object
                    console.log("Single picture found:", data);
                    setRoomPics([data]);
                } else if (data.error) {
                    console.log("API error:", data.error);
                    setRoomPics([]);
                } else {
                    console.log("No pictures found or empty response");
                    setRoomPics([]);
                }
            } else {
                console.error("Failed to fetch room pics:", data.error);
                setRoomPics([]);
            }
        } catch (error) {
            console.error("Error fetching room pictures:", error);
            setRoomPics([]);
        }
    }

    function handleHostelSelect(e: React.ChangeEvent<HTMLSelectElement>) {
        const hostelId = parseInt(e.target.value);
        setSelectedHostelId(hostelId || null);
        setMessage("");
    }

    function openAddModal() {
        setIsEditing(false);
        setCurrentRoomNo(null);
        setRoomForm({
            p_RoomNo: "",
            p_HostelId: selectedHostelId?.toString() || "",
            p_FloorNo: "",
            p_SeaterNo: "",
            p_RoomRent: "",
            p_BedType: "",
            p_WashroomType: "",
            p_CupboardType: "",
            p_isVentilated: false,
            p_isCarpet: false,
            p_isMiniFridge: false
        });
        setShowModal(true);
    }

    function openEditModal(room: Room) {
        console.log("Opening edit modal for room:", room);

        setIsEditing(true);
        setCurrentRoomNo(room.p_RoomNo);

        setRoomForm({
            p_RoomNo: room.p_RoomNo.toString(),
            p_HostelId: room.p_HostelId.toString(),
            p_FloorNo: room.p_FloorNo.toString(),
            p_SeaterNo: room.p_SeaterNo.toString(),
            p_RoomRent: room.p_RoomRent.toString(),
            p_BedType: room.p_BedType,
            p_WashroomType: room.p_WashroomType,
            p_CupboardType: room.p_CupboardType,
            p_isVentilated: room.p_isVentilated,
            p_isCarpet: room.p_isCarpet,
            p_isMiniFridge: room.p_isMiniFridge
        });

        setShowModal(true);
    }

    function openAddPicsModal(room: Room) {
        setCurrentRoomForPics(room);
        setRoomPicsFiles([]);
        setUploadedLinks([]);
        setApplyToAllRooms(null);
        setShowPicsModal(true);
    }

    function closeModal() {
        setShowModal(false);
        setMessage("");
        setCurrentRoomNo(null);
    }

    function closePicsModal() {
        setShowPicsModal(false);
        setCurrentRoomForPics(null);
        setRoomPicsFiles([]);
        setUploadedLinks([]);
        setApplyToAllRooms(null);
    }

    function handleRoomFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setRoomForm(prev => ({ ...prev, [name]: checked }));
        } else {
            setRoomForm(prev => ({ ...prev, [name]: value }));
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);

        // Check total files limit (max 5)
        if (roomPicsFiles.length + newFiles.length > 5) {
            setMessage("You can only upload up to 5 photos per room");
            return;
        }

        // Validate file types
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setMessage("Only JPG, PNG, and WebP images are allowed");
            return;
        }

        setRoomPicsFiles(prev => [...prev, ...newFiles]);
        setMessage("");
    }

    function removeFile(index: number) {
        setRoomPicsFiles(prev => prev.filter((_, i) => i !== index));
    }

    async function handleAddRoomPics() {
        if (!currentRoomForPics || !selectedHostelId) return;

        if (roomPicsFiles.length === 0) {
            setMessage("Please select at least one photo");
            return;
        }

        if (applyToAllRooms === null) {
            setMessage("Please select whether to apply to all rooms or just this room");
            return;
        }

        setUploadingPics(true);
        setMessage("");

        try {
            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append("p_HostelId", selectedHostelId.toString());

            if (applyToAllRooms) {
                // For all rooms with this seater
                formData.append("p_RoomSeaterNo", currentRoomForPics.p_SeaterNo.toString());
                formData.append("applyToAll", "true");
            } else {
                // For this specific room only
                formData.append("p_RoomSeaterNo", "0"); // 0 indicates specific room
                formData.append("p_RoomNo", currentRoomForPics.p_RoomNo.toString()); // Send room number
                formData.append("applyToAll", "false");
            }

            // Add all files
            roomPicsFiles.forEach(file => {
                formData.append("p_PhotoLink", file);
            });

            // Send request to your API
            const response = await fetch("http://127.0.0.1:8000/faststay_app/room_pics/add", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Room photos added successfully!");

                // Update uploaded links for preview
                if (data.uploaded_urls) {
                    setUploadedLinks(data.uploaded_urls);
                }

                // Refresh room pics
                fetchRoomPics(selectedHostelId);

                // Show success for 2 seconds then close
                setTimeout(() => {
                    closePicsModal();
                }, 2000);
            } else {
                setMessage(data.error || "Failed to upload photos");

                // Show detailed error if available
                if (data.failed_uploads) {
                    setMessage(prev => prev + ": " + data.failed_uploads.join(", "));
                }
            }
        } catch (error) {
            console.error("Error adding room photos:", error);
            setMessage("Failed to add room photos. Please try again.");
        } finally {
            setUploadingPics(false);
        }
    }

    async function handleRoomSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage("");

        if (!selectedHostelId) {
            setMessage("Please select a hostel first");
            return;
        }

        const requiredFields = ['p_RoomNo', 'p_FloorNo', 'p_SeaterNo', 'p_RoomRent', 'p_BedType', 'p_WashroomType', 'p_CupboardType'];
        const missingFields = requiredFields.filter(field => !roomForm[field as keyof typeof roomForm]);

        if (missingFields.length > 0) {
            setMessage(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        const payload = {
            p_RoomNo: parseInt(roomForm.p_RoomNo),
            p_HostelId: selectedHostelId,
            p_FloorNo: parseInt(roomForm.p_FloorNo),
            p_SeaterNo: parseInt(roomForm.p_SeaterNo),
            p_RoomRent: parseFloat(roomForm.p_RoomRent),
            p_BedType: roomForm.p_BedType,
            p_WashroomType: roomForm.p_WashroomType,
            p_CupboardType: roomForm.p_CupboardType,
            p_isVentilated: roomForm.p_isVentilated,
            p_isCarpet: roomForm.p_isCarpet,
            p_isMiniFridge: roomForm.p_isMiniFridge
        };

        try {
            const url = isEditing
                ? "http://127.0.0.1:8000/faststay_app/Rooms/update/"
                : "http://127.0.0.1:8000/faststay_app/Rooms/add/";

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || (isEditing ? "Room updated successfully!" : "Room added successfully!"));

                // Refresh rooms list
                fetchRoomsForHostel(selectedHostelId);

                setTimeout(() => {
                    closeModal();
                }, 1500);
            } else {
                setMessage(data.error || data.message || `Failed to ${isEditing ? 'update' : 'add'} room`);
            }
        } catch (error) {
            console.error("Error saving room:", error);
            setMessage("Server error occurred. Please check console for details.");
        }
    }

    async function deleteRoom(roomNo: number) {
        if (!window.confirm("Are you sure you want to delete this room?")) return;

        try {
            const res = await fetch("http://127.0.0.1:8000/faststay_app/Rooms/delete/", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    p_HostelId: selectedHostelId,
                    p_RoomNo: roomNo
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || "Room deleted successfully!");
                // Refresh rooms list
                fetchRoomsForHostel(selectedHostelId!);
            } else {
                setMessage(data.error || "Failed to delete room");
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            setMessage("Server error occurred");
        }
    }

    // Get pictures for a specific room
    // Get pictures for a specific room
    function getRoomPics(room: Room): string[] {
        if (!roomPics.length) return [];

        const roomPicsList: string[] = [];

        // 1. Specific room pics (roomno matches exactly)
        const roomSpecific = roomPics
            .filter(pic => pic.p_RoomNo === room.p_RoomNo)
            .map(pic => pic.p_PhotoLink);

        roomPicsList.push(...roomSpecific);

        // 2. Shared seater pics (roomno is null, roomseaterno matches)
        const sharedSeater = roomPics
            .filter(pic =>
                pic.p_RoomNo === null &&
                pic.p_RoomSeaterNo === room.p_SeaterNo
            )
            .map(pic => pic.p_PhotoLink);

        roomPicsList.push(...sharedSeater);

        // Remove duplicates (in case same photo exists in both)
        return [...new Set(roomPicsList)];
    }

    // Navigation for picture slider - PER ROOM
    function nextPic(roomNo: number) {
        const roomPicsList = getRoomPics(rooms.find(r => r.p_RoomNo === roomNo)!);
        if (roomPicsList.length <= 1) return;

        setRoomPicIndices(prev => ({
            ...prev,
            [roomNo]: (prev[roomNo] + 1) % roomPicsList.length
        }));
    }

    function prevPic(roomNo: number) {
        const roomPicsList = getRoomPics(rooms.find(r => r.p_RoomNo === roomNo)!);
        if (roomPicsList.length <= 1) return;

        setRoomPicIndices(prev => ({
            ...prev,
            [roomNo]: (prev[roomNo] - 1 + roomPicsList.length) % roomPicsList.length
        }));
    }

    // Get selected hostel name
    const selectedHostel = hostels.find(h => h.p_HostelId === selectedHostelId);

    return (
        <>
            <ManagerSidenav managerId={managerId} activePage="add_room" />

            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.logo}>
                    <i className="fa-solid fa-building-user"></i> FastStay
                </div>
                <div className={styles.navLinks}>
                    <Link to={`/manager/dashboard?user_id=${managerId}`}>Dashboard</Link>
                    <Link to={`/manager/add_hostel?user_id=${managerId}`}>Add Hostel</Link>
                    <Link to={`/manager/add_room?user_id=${managerId}`} className={styles.active}>Add Room</Link>
                    <Link to={`/manager/profile?user_id=${managerId}`}>Your Profile</Link>
                    <Link to="/">Logout</Link>
                </div>
            </nav>

            <div className={styles.container}>
                <h2 className={styles.pageTitle}><i className="fa-solid fa-door-open"></i> Add Room</h2>
                <p className={styles.subtitle}>Select a hostel and manage its rooms</p>

                {/* Hostel Selector Card */}
                <div className={styles.card}>
                    <h3>Select Hostel</h3>
                    <div className={styles.hostelSelector}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <select
                                id="hostel-select"
                                value={selectedHostelId || ""}
                                onChange={handleHostelSelect}
                            >
                                <option value="" disabled>Select a hostel</option>
                                {hostels.map(hostel => (
                                    <option key={hostel.p_HostelId} value={hostel.p_HostelId}>
                                        {hostel.p_name} - {hostel.p_BlockNo}, {hostel.p_HouseNo} ({hostel.p_HostelType})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            className={styles.btn}
                            id="add-room-btn"
                            onClick={openAddModal}
                            disabled={!selectedHostelId}
                        >
                            <i className="fa-solid fa-plus"></i> Add New Room
                        </button>
                    </div>
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`${styles.message} ${message.includes("successfully") ||
                        message.includes("added") ||
                        message.includes("updated") ||
                        message.includes("deleted")
                        ? styles.success
                        : styles.error
                        }`}>
                        {message}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className={styles.loading}>
                        <i className="fa-solid fa-spinner fa-spin"></i> Loading rooms...
                    </div>
                )}

                {/* Existing Rooms */}
                {selectedHostelId && rooms.length > 0 && !loading && (
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>Existing Rooms - {selectedHostel?.p_name}</h3>
                            <div className={styles.hostelInfo}>
                                <span>Block: {selectedHostel?.p_BlockNo}</span>
                                <span>House: {selectedHostel?.p_HouseNo}</span>
                                <span>Type: {selectedHostel?.p_HostelType}</span>
                            </div>
                        </div>

                        <div className={styles.roomsGrid}>
                            {rooms.map((room, index) => {
                                const roomPicsList = getRoomPics(room);
                                const currentIndex = roomPicIndices[room.p_RoomNo] || 0;

                                return (
                                    <div key={index} className={styles.roomCard}>
                                        {/* Room Pictures Slider */}
                                        {roomPicsList.length > 0 ? (
                                            <div className={styles.roomPicsSlider}>
                                                <div className={styles.sliderContainer}>
                                                    <img
                                                        src={roomPicsList[currentIndex]}
                                                        alt={`Room ${room.p_RoomNo}`}
                                                        className={styles.roomPic}
                                                    />
                                                    {roomPicsList.length > 1 && (
                                                        <>
                                                            <button
                                                                className={`${styles.sliderBtn} ${styles.prevBtn}`}
                                                                onClick={() => prevPic(room.p_RoomNo)}
                                                            >
                                                                <i className="fa-solid fa-chevron-left"></i>
                                                            </button>
                                                            <button
                                                                className={`${styles.sliderBtn} ${styles.nextBtn}`}
                                                                onClick={() => nextPic(room.p_RoomNo)}
                                                            >
                                                                <i className="fa-solid fa-chevron-right"></i>
                                                            </button>
                                                            <div className={styles.sliderDots}>
                                                                {roomPicsList.map((_, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className={`${styles.dot} ${idx === currentIndex ? styles.active : ''}`}
                                                                        onClick={() => setRoomPicIndices(prev => ({
                                                                            ...prev,
                                                                            [room.p_RoomNo]: idx
                                                                        }))}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.noPicsPlaceholder}>
                                                <i className="fa-solid fa-image"></i>
                                                <p>No pictures added yet</p>
                                            </div>
                                        )}

                                        <div className={styles.roomHeader}>
                                            <div className={styles.roomNumber}>Room {room.p_RoomNo}</div>
                                            <button
                                                className={styles.addPicsBtn}
                                                onClick={() => openAddPicsModal(room)}
                                                title="Add Room Pictures"
                                            >
                                                <i className="fa-solid fa-camera"></i>
                                                {roomPicsList.length > 0 && (
                                                    <span className={styles.picsCount}>{roomPicsList.length}</span>
                                                )}
                                            </button>
                                        </div>
                                        <div className={styles.roomDetails}>
                                            <div><i className="fa-solid fa-layer-group"></i> Floor {room.p_FloorNo}</div>
                                            <div><i className="fa-solid fa-users"></i> {room.p_SeaterNo} Seater</div>
                                            <div><i className="fa-solid fa-money-bill-wave"></i> Rent: {room.p_RoomRent} pkr</div>
                                            <div><i className="fa-solid fa-bed"></i> {room.p_BedType || "Not specified"}</div>
                                            <div><i className="fa-solid fa-toilet"></i> {room.p_WashroomType === "RoomAttached" ? "Attached" : "Community"}</div>
                                            <div><i className="fa-solid fa-archive"></i> {room.p_CupboardType === "PerPerson" ? "Per Person" : "Shared"}</div>
                                            {room.p_isVentilated && <div><i className="fa-solid fa-wind"></i> Ventilated</div>}
                                            {room.p_isCarpet && <div><i className="fa-solid fa-rug"></i> Carpet</div>}
                                            {room.p_isMiniFridge && <div><i className="fa-solid fa-snowflake"></i> Mini Fridge</div>}
                                        </div>
                                        <div className={styles.roomActions}>
                                            <button
                                                className={`${styles.btn} ${styles.editBtn}`}
                                                onClick={() => openEditModal(room)}
                                            >
                                                <i className="fa-solid fa-edit"></i> Edit
                                            </button>
                                            <button
                                                className={`${styles.btn} ${styles.deleteBtn}`}
                                                onClick={() => deleteRoom(room.p_RoomNo)}
                                            >
                                                <i className="fa-solid fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* No Rooms Message */}
                {selectedHostelId && rooms.length === 0 && !loading && (
                    <div className={`${styles.card} ${styles.noRooms}`}>
                        <i className="fa-solid fa-door-closed"></i>
                        <h3>No Rooms Added Yet</h3>
                        <p>Start by adding the first room to this hostel.</p>
                        <button className={styles.btn} onClick={openAddModal}>
                            <i className="fa-solid fa-plus"></i> Add First Room
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Room Modal */}
            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                {isEditing ? "Edit Room" : "Add New Room"}
                            </h3>
                            <button className={styles.closeModal} onClick={closeModal}>&times;</button>
                        </div>

                        <form onSubmit={handleRoomSubmit} className={styles.roomForm}>
                            <input type="hidden" name="p_HostelId" value={selectedHostelId || ""} />

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Room Number *</label>
                                    <input
                                        type="number"
                                        name="p_RoomNo"
                                        value={roomForm.p_RoomNo}
                                        onChange={handleRoomFormChange}
                                        placeholder="101"
                                        required
                                        disabled={isEditing}
                                        min="1"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Floor Number *</label>
                                    <input
                                        type="number"
                                        name="p_FloorNo"
                                        value={roomForm.p_FloorNo}
                                        onChange={handleRoomFormChange}
                                        placeholder="1"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Seater Number *</label>
                                    <select
                                        name="p_SeaterNo"
                                        value={roomForm.p_SeaterNo}
                                        onChange={handleRoomFormChange}
                                        required
                                    >
                                        <option value="">Select Seater</option>
                                        <option value="1">1 Seater</option>
                                        <option value="2">2 Seater</option>
                                        <option value="3">3 Seater</option>
                                        <option value="4">4 Seater</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Bed Type *</label>
                                    <select
                                        name="p_BedType"
                                        value={roomForm.p_BedType}
                                        onChange={handleRoomFormChange}
                                        required
                                    >
                                        <option value="">Select Bed Type</option>
                                        <option value="Bed">Bed</option>
                                        <option value="Mattress">Mattress</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Washroom Type *</label>
                                    <select
                                        name="p_WashroomType"
                                        value={roomForm.p_WashroomType}
                                        onChange={handleRoomFormChange}
                                        required
                                    >
                                        <option value="">Select Washroom Type</option>
                                        <option value="RoomAttached">Room Attached</option>
                                        <option value="Community">Community</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Cupboard Type *</label>
                                    <select
                                        name="p_CupboardType"
                                        value={roomForm.p_CupboardType}
                                        onChange={handleRoomFormChange}
                                        required
                                    >
                                        <option value="">Select Cupboard Type</option>
                                        <option value="PerPerson">Per Person</option>
                                        <option value="Shared">Shared</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label>Room Rent (pkr) *</label>
                                    <input
                                        type="number"
                                        name="p_RoomRent"
                                        value={roomForm.p_RoomRent}
                                        onChange={handleRoomFormChange}
                                        placeholder="5000"
                                        min="0"
                                        step="100"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.checkboxRow}>
                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="p_isVentilated"
                                            checked={roomForm.p_isVentilated}
                                            onChange={handleRoomFormChange}
                                        />
                                        Ventilated Room
                                    </label>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="p_isCarpet"
                                            checked={roomForm.p_isCarpet}
                                            onChange={handleRoomFormChange}
                                        />
                                        Carpet Available
                                    </label>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="p_isMiniFridge"
                                            checked={roomForm.p_isMiniFridge}
                                            onChange={handleRoomFormChange}
                                        />
                                        Mini Fridge Available
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className={`${styles.btn} ${styles.fullWidth}`}>
                                {isEditing ? "Update Room" : "Add Room"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Room Pictures Modal */}
            {showPicsModal && currentRoomForPics && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                Add Pictures for Room {currentRoomForPics.p_RoomNo}
                            </h3>
                            <button className={styles.closeModal} onClick={closePicsModal}>&times;</button>
                        </div>

                        <div className={styles.picsModalContent}>
                            <div className={styles.fileUploadSection}>
                                <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                    <p>Click to upload room pictures</p>
                                    <p className={styles.uploadHint}>(Max 5 photos, JPG/PNG/WebP)</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {roomPicsFiles.length > 0 && (
                                    <div className={styles.selectedFiles}>
                                        <h4>Selected Files ({roomPicsFiles.length}/5)</h4>
                                        <div className={styles.fileList}>
                                            {roomPicsFiles.map((file, index) => (
                                                <div key={index} className={styles.fileItem}>
                                                    <i className="fa-solid fa-image"></i>
                                                    <span className={styles.fileName}>{file.name}</span>
                                                    <button
                                                        className={styles.removeFileBtn}
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <i className="fa-solid fa-times"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.applyToSection}>
                                <h4>Apply these pictures to:</h4>
                                <div className={styles.applyOptions}>
                                    <label className={styles.applyOption}>
                                        <input
                                            type="radio"
                                            name="applyTo"
                                            checked={applyToAllRooms === false}
                                            onChange={() => setApplyToAllRooms(false)}
                                        />
                                        <div className={styles.optionContent}>
                                            <i className="fa-solid fa-door-closed"></i>
                                            <div>
                                                <strong>This room only</strong>
                                                <p>Pictures will only appear for Room {currentRoomForPics.p_RoomNo}</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={styles.applyOption}>
                                        <input
                                            type="radio"
                                            name="applyTo"
                                            checked={applyToAllRooms === true}
                                            onChange={() => setApplyToAllRooms(true)}
                                        />
                                        <div className={styles.optionContent}>
                                            <i className="fa-solid fa-building"></i>
                                            <div>
                                                <strong>All {currentRoomForPics.p_SeaterNo}-seater rooms</strong>
                                                <p>Pictures will appear for all {currentRoomForPics.p_SeaterNo}-seater rooms in this hostel</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {uploadedLinks.length > 0 && (
                                <div className={styles.uploadedPreview}>
                                    <h4>Uploaded Images Preview:</h4>
                                    <div className={styles.previewGrid}>
                                        {uploadedLinks.map((link, index) => (
                                            <div key={index} className={styles.previewItem}>
                                                <img src={link} alt={`Uploaded ${index + 1}`} />
                                                <div className={styles.previewOverlay}>
                                                    <span>✓ Uploaded</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                className={`${styles.btn} ${styles.fullWidth}`}
                                onClick={handleAddRoomPics}
                                disabled={uploadingPics || roomPicsFiles.length === 0 || applyToAllRooms === null}
                            >
                                {uploadingPics ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-upload"></i> Upload Pictures
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}