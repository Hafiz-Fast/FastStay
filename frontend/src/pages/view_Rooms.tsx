import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "../styles/ViewRooms.module.css";

interface Room {
  p_RoomNo: number;
  p_FloorNo: number;
  p_SeaterNo: number;
  p_BedType: string;
  p_WashroomType: string;
  p_CupboardType: string;
  p_RoomRent: number;
  p_isVentilated: boolean;
  p_isCarpet: boolean;
  p_isMiniFridge: boolean;
}

interface HostelInfo {
  p_name: string;
  p_blockno: string;
  p_houseno: string;
  distance_from_university?: number;
  averageRating?: number;
}

interface RoomPic {
  p_PhotoLink: string;
  p_RoomNo: number | null;
  p_RoomSeaterNo: number;
}

// --- Caching helpers (same pattern as Suggestions.tsx) ---
const CACHE_TTL = 30 * 60 * 1000;

const getCached = <T,>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
};

const setCache = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full, ignore */ }
};

// --- Skeleton loader ---
const SkeletonCards: React.FC = () => (
  <div className={styles.skeletonGrid}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className={styles.skeletonCard}>
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
        </div>
      </div>
    ))}
  </div>
);

const ViewRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hostelInfo, setHostelInfo] = useState<HostelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [roomPics, setRoomPics] = useState<RoomPic[]>([]);
  const [roomPicIndices, setRoomPicIndices] = useState<{ [key: number]: number }>({});

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hostelId = queryParams.get("hostel_id");
  const userId = queryParams.get("user_id");

  const API_BASE_URL = "http://127.0.0.1:8000/faststay_app";

  const [filters, setFilters] = useState({
    seater: "all",
    floor: "all",
    bedType: "all",
    washroom: "all",
    minRent: "",
    maxRent: "",
    hasFridge: false,
    hasCarpet: false,
    hasVentilation: false
  });

  useEffect(() => {
    const initialIndices: { [key: number]: number } = {};
    rooms.forEach(room => {
      initialIndices[room.p_RoomNo] = 0;
    });
    setRoomPicIndices(initialIndices);
  }, [rooms]);

  // --- Data fetching with cache + abort ---
  useEffect(() => {
    if (!hostelId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      const cacheKey = `viewrooms_${hostelId}`;
      const cached = getCached<{ hostelInfo: HostelInfo | null; rooms: Room[]; roomPics: RoomPic[] }>(cacheKey);
      if (cached) {
        setHostelInfo(cached.hostelInfo);
        setRooms(cached.rooms);
        setRoomPics(cached.roomPics);
        setLoading(false);
        return;
      }

      try {
        // Fetch hostel info, room pics, and rooms in parallel
        const [hostelRes, picsRes, roomsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/display/all_hostels`, { signal }).catch(() => ({ data: null })),
          axios.get(`${API_BASE_URL}/display/room_pic?p_HostelId=${hostelId}`, { signal }).catch(() => ({ data: null })),
          axios.post(`${API_BASE_URL}/Rooms/DisplayAllHostel/`, { p_HostelId: parseInt(hostelId) }, { signal })
        ]);

        // Process hostel info
        let info: HostelInfo | null = null;
        if (hostelRes?.data?.hostels && Array.isArray(hostelRes.data.hostels)) {
          const hostel = hostelRes.data.hostels.find(
            (h: any) => h.hostel_id === parseInt(hostelId) || h.p_hostelid === parseInt(hostelId)
          );
          if (hostel) {
            info = {
              p_name: hostel.p_name || "Hostel",
              p_blockno: hostel.p_blockno || "N/A",
              p_houseno: hostel.p_houseno || "N/A",
              distance_from_university: hostel.distance_from_university,
              averageRating: hostel.rating || hostel.averageRating
            };
          }
        }
        setHostelInfo(info);

        // Process room pics
        let picsData: RoomPic[] = [];
        if (picsRes?.data) {
          if (Array.isArray(picsRes.data)) {
            picsData = picsRes.data.map((pic: any) => ({
              p_PhotoLink: pic.p_PhotoLink ?? pic.p_photolink ?? pic.photolink,
              p_RoomNo: pic.p_RoomNo !== undefined ? pic.p_RoomNo : (pic.p_roomno !== undefined ? pic.p_roomno : null),
              p_RoomSeaterNo: pic.p_RoomSeaterNo ?? pic.p_roomseaterno ?? pic.seaterno ?? 0
            }));
          } else if (picsRes.data.p_PhotoLink) {
            picsData = [{
              p_PhotoLink: picsRes.data.p_PhotoLink,
              p_RoomNo: picsRes.data.p_RoomNo !== undefined ? picsRes.data.p_RoomNo : null,
              p_RoomSeaterNo: picsRes.data.p_RoomSeaterNo ?? 0
            }];
          }
        }
        setRoomPics(picsData);

        // Process rooms
        let fetchedRooms: Room[] = [];
        if (roomsRes.data.success && roomsRes.data.result && Array.isArray(roomsRes.data.result)) {
          // Debug: log raw room data to find the actual key for room number
          console.log("Raw rooms response keys:", Object.keys(roomsRes.data.result[0] || {}));
          console.log("Raw first room data:", JSON.stringify(roomsRes.data.result[0]));

          fetchedRooms = roomsRes.data.result.map((room: any, index: number) => {
            // The backend does NOT return p_RoomNo — fallback to index+1
            const roomNo = room.p_roomno ?? room.p_RoomNo ?? room.roomno ?? room.p_room_no ?? room.room_no ?? room.RoomNo ?? room.roomNo ?? (index + 1);
            console.log("Room mapping - raw keys:", Object.keys(room), "resolved roomNo:", roomNo);

            return {
              p_RoomNo: roomNo,
              p_FloorNo: room.p_floorno ?? room.p_FloorNo ?? room.floorno ?? room.p_FloorNo ?? 1,
              p_SeaterNo: room.p_seaterno ?? room.p_SeaterNo ?? room.seaterno ?? room.p_SeaterNo ?? 1,
              p_BedType: room.p_bedtype || room.p_BedType || room.bedtype || room.p_BedType || "Single",
              p_WashroomType: room.p_washroomtype || room.p_WashroomType || room.washroomtype || room.p_WashroomType || "Attached",
              p_CupboardType: room.p_cupboardtype || room.p_CupboardType || room.cupboardtype || room.p_CupboardType || "PerPerson",
              p_RoomRent: room.p_roomrent ?? room.p_RoomRent ?? room.roomrent ?? room.p_RoomRent ?? 0,
              p_isVentilated: room.p_isventilated ?? room.p_isVentilated ?? room.isventilated ?? room.p_isVentilated ?? false,
              p_isCarpet: room.p_iscarpet ?? room.p_isCarpet ?? room.iscarpet ?? room.p_isCarpet ?? false,
              p_isMiniFridge: room.p_isminifridge ?? room.p_isMiniFridge ?? room.isminifridge ?? room.p_isMiniFridge ?? false
            };
          });

          fetchedRooms.sort((a: Room, b: Room) => {
            if (a.p_SeaterNo !== b.p_SeaterNo) return a.p_SeaterNo - b.p_SeaterNo;
            return a.p_RoomRent - b.p_RoomRent;
          });
        }
        setRooms(fetchedRooms);

        // Cache everything
        setCache(cacheKey, { hostelInfo: info, rooms: fetchedRooms, roomPics: picsData });
      } catch (error: any) {
        if (!signal.aborted) {
          console.error("Failed to fetch rooms:", error);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [hostelId]);

  // --- Memoized filtered rooms ---
  const filteredRooms = useMemo(() => {
    let filtered = [...rooms];

    if (filters.seater !== "all")
      filtered = filtered.filter(r => r.p_SeaterNo.toString() === filters.seater);
    if (filters.floor !== "all")
      filtered = filtered.filter(r => r.p_FloorNo.toString() === filters.floor);
    if (filters.bedType !== "all")
      filtered = filtered.filter(r => r.p_BedType.toLowerCase() === filters.bedType.toLowerCase());
    if (filters.washroom !== "all")
      filtered = filtered.filter(r => r.p_WashroomType.toLowerCase().includes(filters.washroom.toLowerCase()));
    if (filters.minRent) {
      const min = parseInt(filters.minRent);
      filtered = filtered.filter(r => r.p_RoomRent >= min);
    }
    if (filters.maxRent) {
      const max = parseInt(filters.maxRent);
      filtered = filtered.filter(r => r.p_RoomRent <= max);
    }
    if (filters.hasFridge) filtered = filtered.filter(r => r.p_isMiniFridge);
    if (filters.hasCarpet) filtered = filtered.filter(r => r.p_isCarpet);
    if (filters.hasVentilation) filtered = filtered.filter(r => r.p_isVentilated);

    return filtered;
  }, [rooms, filters]);

  // --- Memoized helpers ---
  const getRoomPics = useCallback((room: Room): string[] => {
    if (!roomPics.length) return [];
    const roomPicsList: string[] = [];

    // 1. Specific room pics (p_RoomNo matches exactly)
    const roomSpecific = roomPics
      .filter(pic => pic.p_RoomNo === room.p_RoomNo)
      .map(pic => pic.p_PhotoLink);
    roomPicsList.push(...roomSpecific);

    // 2. Shared seater pics (p_RoomNo is null, p_RoomSeaterNo matches)
    const sharedSeater = roomPics
      .filter(pic => pic.p_RoomNo === null && pic.p_RoomSeaterNo === room.p_SeaterNo)
      .map(pic => pic.p_PhotoLink);
    roomPicsList.push(...sharedSeater);

    return [...new Set(roomPicsList)];
  }, [roomPics]);

  const nextPic = useCallback((roomNo: number) => {
    const room = filteredRooms.find(r => r.p_RoomNo === roomNo);
    if (!room) return;
    const pics = getRoomPics(room);
    if (pics.length <= 1) return;
    setRoomPicIndices(prev => ({
      ...prev,
      [roomNo]: ((prev[roomNo] ?? 0) + 1) % pics.length
    }));
  }, [filteredRooms, getRoomPics]);

  const prevPic = useCallback((roomNo: number) => {
    const room = filteredRooms.find(r => r.p_RoomNo === roomNo);
    if (!room) return;
    const pics = getRoomPics(room);
    if (pics.length <= 1) return;
    setRoomPicIndices(prev => ({
      ...prev,
      [roomNo]: ((prev[roomNo] ?? 0) - 1 + pics.length) % pics.length
    }));
  }, [filteredRooms, getRoomPics]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      seater: "all", floor: "all", bedType: "all", washroom: "all",
      minRent: "", maxRent: "", hasFridge: false, hasCarpet: false, hasVentilation: false
    });
  }, []);

  const handleViewRoomDetails = useCallback((room: Room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  }, []);

  const handleBookRoom = useCallback((room: Room) => {
    alert(`Booking room ${room.p_RoomNo}...`);
  }, []);

  const handleBack = useCallback(() => {
    navigate(`/student/hostelDetails?id=${hostelId}&user_id=${userId}`);
  }, [navigate, hostelId, userId]);

  const handleBackToHome = useCallback(() => {
    navigate(`/student/home?user_id=${userId}`);
  }, [navigate, userId]);

  const formatCurrency = useCallback((amount: number): string => {
    return `PKR ${amount.toLocaleString()}`;
  }, []);

  const getRoomImage = useCallback((room: Room): string | null => {
    const pics = getRoomPics(room);
    return pics.length > 0 ? pics[0] : null;
  }, [getRoomPics]);

  // --- Memoized stats ---
  const roomStats = useMemo(() => {
    if (rooms.length === 0) return { total: 0, capacity: 0, minRent: 0, maxRent: 0 };
    return {
      total: rooms.length,
      capacity: rooms.reduce((acc, r) => acc + r.p_SeaterNo, 0),
      minRent: Math.min(...rooms.map(r => r.p_RoomRent)),
      maxRent: Math.max(...rooms.map(r => r.p_RoomRent))
    };
  }, [rooms]);

  // --- Memoized rendered cards ---
  const renderedCards = useMemo(() => {
    if (filteredRooms.length === 0) {
      return (
        <div className={styles.noResults}>
          <i className="fa-solid fa-search"></i>
          <h3>No rooms found</h3>
          <p>Try adjusting your filters</p>
          <button onClick={clearFilters} className={styles.resetBtn}>
            Clear All Filters
          </button>
        </div>
      );
    }

    return filteredRooms.map((room) => {
      const roomPicsList = getRoomPics(room);
      const currentIndex = roomPicIndices[room.p_RoomNo] || 0;

      return (
        <div key={room.p_RoomNo} className={styles.roomCard}>
          <div className={styles.cardImage}>
            {roomPicsList.length > 0 ? (
              <>
                <img
                  src={roomPicsList[currentIndex]}
                  alt={`Room ${room.p_RoomNo}`}
                  loading="lazy"
                  decoding="async"
                />
                {roomPicsList.length > 1 && (
                  <>
                    <button
                      className={`${styles.sliderBtn} ${styles.prevBtn}`}
                      onClick={(e) => { e.stopPropagation(); prevPic(room.p_RoomNo); }}
                    >
                      <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <button
                      className={`${styles.sliderBtn} ${styles.nextBtn}`}
                      onClick={(e) => { e.stopPropagation(); nextPic(room.p_RoomNo); }}
                    >
                      <i className="fa-solid fa-chevron-right"></i>
                    </button>
                    <div className={styles.sliderDots}>
                      {roomPicsList.map((_, idx) => (
                        <span
                          key={idx}
                          className={`${styles.dot} ${idx === currentIndex ? styles.activeDot : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomPicIndices(prev => ({ ...prev, [room.p_RoomNo]: idx }));
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={styles.noPicsPlaceholder} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                background: '#f0f0f0',
                color: '#999'
              }}>
                <i className="fa-solid fa-image" style={{ fontSize: '2rem', marginBottom: '8px' }}></i>
                <p style={{ margin: 0 }}>Pic not Available</p>
              </div>
            )}
            <div className={styles.cardBadges}>
              <span className={`${styles.seaterBadge} ${
                room.p_SeaterNo === 1 ? styles.seater1 :
                room.p_SeaterNo === 2 ? styles.seater2 :
                room.p_SeaterNo === 3 ? styles.seater3 :
                styles.seater4
              }`}>
                {room.p_SeaterNo}-Seater
              </span>
              <span className={styles.floorBadge}>Floor {room.p_FloorNo}</span>
              {room.p_isMiniFridge && (
                <span className={styles.fridgeBadge}>
                  <i className="fa-solid fa-snowflake"></i> Fridge
                </span>
              )}
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h3>Room #{room.p_RoomNo}</h3>
              <div className={styles.roomPrice}>
                {formatCurrency(room.p_RoomRent)}
                <span>/month</span>
              </div>
            </div>

            <div className={styles.roomDetails}>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-bed"></i>
                <span>{room.p_BedType} Bed</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-toilet"></i>
                <span>{room.p_WashroomType} Washroom</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-clipboard"></i>
                <span>{room.p_CupboardType} Cupboard</span>
              </div>
            </div>

            <div className={styles.roomFeatures}>
              {room.p_isVentilated && (
                <span className={styles.feature}><i className="fa-solid fa-wind"></i> Ventilated</span>
              )}
              {room.p_isCarpet && (
                <span className={styles.feature}><i className="fa-solid fa-rug"></i> Carpet</span>
              )}
              {room.p_isMiniFridge && (
                <span className={styles.feature}><i className="fa-solid fa-snowflake"></i> Mini Fridge</span>
              )}
            </div>

            <div className={styles.cardButtons}>
              <button className={styles.detailsBtn} onClick={() => handleViewRoomDetails(room)}>
                <i className="fa-solid fa-eye"></i> View Details
              </button>
              <button className={styles.bookBtn} onClick={() => handleBookRoom(room)}>
                <i className="fa-solid fa-calendar-check"></i> Book Now
              </button>
            </div>
          </div>
        </div>
      );
    });
  }, [filteredRooms, roomPicIndices, getRoomPics, prevPic, nextPic, clearFilters, formatCurrency, handleViewRoomDetails, handleBookRoom]);

  // --- Render ---
  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <nav className={styles.navbar}>
          <div className={styles.logo}><i className="fa-solid fa-building-user"></i> FastStay</div>
          <div className={styles.navLinks}>
            <a href={`/student/home?user_id=${userId}`} className={styles.navLink}>Home</a>
            <a href={`/student/profile?user_id=${userId}`} className={styles.navLink}>My Profile</a>
            <a href={`/student/suggestions?user_id=${userId}`} className={styles.navLink}>Suggestions</a>
            <a href="/" className={styles.navLink}>Logout</a>
          </div>
        </nav>
        <div className={styles.container}>
          <SkeletonCards />
        </div>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className={styles.pageWrapper}>
        <nav className={styles.navbar}>
          <div className={styles.logo}><i className="fa-solid fa-building-user"></i> FastStay</div>
          <div className={styles.navLinks}>
            <a href={`/student/home?user_id=${userId}`} className={styles.navLink}>Home</a>
            <a href={`/student/profile?user_id=${userId}`} className={styles.navLink}>My Profile</a>
            <a href={`/student/suggestions?user_id=${userId}`} className={styles.navLink}>Suggestions</a>
            <a href="/" className={styles.navLink}>Logout</a>
          </div>
        </nav>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}><i className="fa-solid fa-door-closed"></i></div>
          <h3>No Rooms Available</h3>
          <p>No rooms found for this hostel. Please try another hostel.</p>
          <div className={styles.errorButtons}>
            <button onClick={handleBack} className={styles.backBtn}>
              <i className="fa-solid fa-arrow-left"></i> Back to Hostel
            </button>
            <button onClick={handleBackToHome} className={styles.homeBtn}>
              <i className="fa-solid fa-house"></i> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}><i className="fa-solid fa-building-user"></i> FastStay</div>
        <div className={styles.navLinks}>
          <a href={`/student/home?user_id=${userId}`} className={styles.navLink}>Home</a>
          <a href={`/student/profile?user_id=${userId}`} className={styles.navLink}>My Profile</a>
          <a href={`/student/suggestions?user_id=${userId}`} className={styles.navLink}>Suggestions</a>
          <a href="/" className={styles.navLink}>Logout</a>
        </div>
      </nav>

      {/* HOSTEL HEADER */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <button onClick={handleBack} className={styles.backButton}>
              <i className="fa-solid fa-arrow-left"></i> Back to Hostel
            </button>
            <h1>Available Rooms</h1>
          </div>
          <div className={styles.hostelInfo}>
            <h2>{hostelInfo?.p_name}</h2>
            <p className={styles.address}>
              <i className="fa-solid fa-location-dot"></i>
              Block {hostelInfo?.p_blockno}, House {hostelInfo?.p_houseno}
              {hostelInfo?.distance_from_university && (
                <span className={styles.distance}>
                  • {hostelInfo.distance_from_university.toFixed(1)} km from university
                </span>
              )}
            </p>
            {hostelInfo?.averageRating && (
              <div className={styles.rating}>
                <i className="fa-solid fa-star"></i>
                {hostelInfo.averageRating.toFixed(1)}/5.0
              </div>
            )}
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <i className="fa-solid fa-door-open"></i>
              <span>{roomStats.total} Total Rooms</span>
            </div>
            <div className={styles.stat}>
              <i className="fa-solid fa-users"></i>
              <span>{roomStats.capacity} Total Capacity</span>
            </div>
            <div className={styles.stat}>
              <i className="fa-solid fa-money-bill-wave"></i>
              <span>{formatCurrency(roomStats.minRent)} - {formatCurrency(roomStats.maxRent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.container}>
        {/* FILTERS SECTION */}
        <div className={styles.filtersSection}>
          <h3><i className="fa-solid fa-filter"></i> Filter Rooms</h3>

          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label>Seater Type</label>
              <select value={filters.seater} onChange={(e) => handleFilterChange("seater", e.target.value)}>
                <option value="all">All Types</option>
                <option value="1">1-Seater</option>
                <option value="2">2-Seater</option>
                <option value="3">3-Seater</option>
                <option value="4">4-Seater</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Floor</label>
              <select value={filters.floor} onChange={(e) => handleFilterChange("floor", e.target.value)}>
                <option value="all">All Floors</option>
                <option value="1">Ground Floor</option>
                <option value="2">1st Floor</option>
                <option value="3">2nd Floor</option>
                <option value="4">3rd Floor</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Bed Type</label>
              <select value={filters.bedType} onChange={(e) => handleFilterChange("bedType", e.target.value)}>
                <option value="all">All Bed Types</option>
                <option value="Bed">Single Bed</option>
                <option value="Mattress">Mattress</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Washroom</label>
              <select value={filters.washroom} onChange={(e) => handleFilterChange("washroom", e.target.value)}>
                <option value="all">All Types</option>
                <option value="Attached">Attached</option>
                <option value="Shared">Shared</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Min Rent (PKR)</label>
              <input type="number" placeholder="e.g., 10000" value={filters.minRent} onChange={(e) => handleFilterChange("minRent", e.target.value)} min="0" />
            </div>
            <div className={styles.filterGroup}>
              <label>Max Rent (PKR)</label>
              <input type="number" placeholder="e.g., 25000" value={filters.maxRent} onChange={(e) => handleFilterChange("maxRent", e.target.value)} min="0" />
            </div>
          </div>

          {/* Feature Filters - inline */}
          <div className={styles.featureFilters}>
            <div className={styles.featureGrid}>
              <label className={styles.featureCheckbox}>
                <input type="checkbox" checked={filters.hasVentilation} onChange={(e) => handleFilterChange("hasVentilation", e.target.checked)} />
                <span><i className="fa-solid fa-wind"></i> Ventilated</span>
              </label>
              <label className={styles.featureCheckbox}>
                <input type="checkbox" checked={filters.hasCarpet} onChange={(e) => handleFilterChange("hasCarpet", e.target.checked)} />
                <span><i className="fa-solid fa-carpet"></i> Carpet Floor</span>
              </label>
              <label className={styles.featureCheckbox}>
                <input type="checkbox" checked={filters.hasFridge} onChange={(e) => handleFilterChange("hasFridge", e.target.checked)} />
                <span><i className="fa-solid fa-snowflake"></i> Mini Fridge</span>
              </label>
            </div>
          </div>

          {/* Filter Actions */}
          <div className={styles.filterActions}>
            <button onClick={clearFilters} className={styles.clearBtn}>
              <i className="fa-solid fa-times"></i> Clear All Filters
            </button>
            <div className={styles.resultsInfo}>
              <i className="fa-solid fa-list"></i>
              Showing {filteredRooms.length} of {rooms.length} rooms
            </div>
          </div>
        </div>

        {/* ROOMS GRID */}
        <div className={styles.roomsGrid}>
          {renderedCards}
        </div>
      </div>

      {/* ROOM DETAILS MODAL */}
      {showRoomDetails && selectedRoom && (
        <div className={styles.modalOverlay} onClick={() => setShowRoomDetails(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Room #{selectedRoom.p_RoomNo} Details</h2>
              <button className={styles.closeBtn} onClick={() => setShowRoomDetails(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalImage}>
                {getRoomImage(selectedRoom) ? (
                  <>
                    <img
                      src={getRoomImage(selectedRoom)!}
                      alt={`Room ${selectedRoom.p_RoomNo}`}
                      loading="lazy"
                      decoding="async"
                    />
                    {getRoomPics(selectedRoom).length > 1 && (
                      <div className={styles.picCountIndicator}>
                        <i className="fa-solid fa-images"></i>
                        {getRoomPics(selectedRoom).length} photos available
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '250px',
                    background: '#f0f0f0',
                    color: '#999',
                    borderRadius: '8px'
                  }}>
                    <i className="fa-solid fa-image" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>Pic not Available</p>
                  </div>
                )}
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailSection}>
                  <h3>Room Information</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Room Number:</span>
                    <span className={styles.detailValue}>{selectedRoom.p_RoomNo}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Floor:</span>
                    <span className={styles.detailValue}>{selectedRoom.p_FloorNo}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Seater Type:</span>
                    <span className={styles.detailValue}>{selectedRoom.p_SeaterNo}-Seater</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Monthly Rent:</span>
                    <span className={styles.detailValueHighlight}>{formatCurrency(selectedRoom.p_RoomRent)}</span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Furniture & Amenities</h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Bed Type:</span>
                    <span className={styles.detailValue}>{selectedRoom.p_BedType}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Washroom:</span>
                    <span className={styles.detailValue}>{selectedRoom.p_WashroomType}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Cupboard:</span>
                    <span className={styles.detailValue}>{selectedRoom.p_CupboardType}</span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>Additional Features</h3>
                  <div className={styles.featureList}>
                    {selectedRoom.p_isVentilated && (
                      <div className={styles.featureItem}><i className="fa-solid fa-check-circle"></i><span>Well Ventilated</span></div>
                    )}
                    {selectedRoom.p_isCarpet && (
                      <div className={styles.featureItem}><i className="fa-solid fa-check-circle"></i><span>Carpeted Floor</span></div>
                    )}
                    {selectedRoom.p_isMiniFridge && (
                      <div className={styles.featureItem}><i className="fa-solid fa-check-circle"></i><span>Mini Fridge Included</span></div>
                    )}
                    {!selectedRoom.p_isVentilated && !selectedRoom.p_isCarpet && !selectedRoom.p_isMiniFridge && (
                      <div className={styles.noFeatures}>No additional features</div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.modalBookBtn} onClick={() => handleBookRoom(selectedRoom)}>
                  <i className="fa-solid fa-calendar-check"></i> Book This Room
                </button>
                <button className={styles.modalCloseBtn} onClick={() => setShowRoomDetails(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRooms;