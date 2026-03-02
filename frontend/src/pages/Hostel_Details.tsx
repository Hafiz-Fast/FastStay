import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "../styles/HostelDetails.module.css";

// ─── Interfaces ───

interface RoomType {
  type: string;
  rent: number;
  available: number;
}

interface Rating {
  p_RatingId: number;
  p_HostelId: number;
  p_StudentId: number;
  p_RatingStar: number;
  p_MaintenanceRating: number;
  p_IssueResolvingRate: number;
  p_ManagerBehaviour: number;
  p_Challenges: string;
}

interface Expense {
  p_isIncludedInRoomCharges: boolean;
  p_RoomCharges: number[];
  p_SecurityCharges: number;
  p_MessCharges: number;
  p_KitchenCharges: number;
  p_InternetCharges: number;
  p_AcServiceCharges: number;
  p_ElectricitybillType: string;
  p_ElectricityCharges: number;
}

interface HostelImage {
  p_PhotoLink: string;
}

interface MessDetails {
  p_MessTimeCount: number;
  p_Dishes: string[];
}

interface KitchenDetails {
  p_isFridge: boolean;
  p_isMicrowave: boolean;
  p_isGas: boolean;
}

interface SecurityInfo {
  p_GateTimings: number;
  p_isCameras: boolean;
  p_isGuard: boolean;
  p_isOutsiderVerification: boolean;
}

interface BasicInfo {
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
}

interface HostelDetails {
  hostel_id: number;
  p_name: string;
  p_blockno: string;
  p_houseno: string;
  distance_from_university?: number;
  images: HostelImage[];
  rooms: RoomType[];
  ratings: Rating[];
  averageRating?: number;
  expenses: Expense | null;
  mess: MessDetails | null;
  kitchen: KitchenDetails | null;
  security: SecurityInfo | null;
  basic: BasicInfo | null;
  p_latitude?: number;
  p_longitude?: number;
}

const API_BASE_URL = "http://127.0.0.1:8000/faststay_app";
const CACHE_TTL = 30 * 60 * 1000;

const getCached = <T,>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(key); return null; }
    return data as T;
  } catch { return null; }
};

const setCache = (key: string, data: any) => {
  try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
};

const calculateAverageRating = (ratings: Rating[]): number => {
  if (!ratings || ratings.length === 0) return 0;
  const total = ratings.reduce((sum, r) => sum + r.p_RatingStar, 0);
  return parseFloat((total / ratings.length).toFixed(1));
};

// ─── Fetch helpers ───

const getHostelImages = async (hostelId: number, signal: AbortSignal): Promise<HostelImage[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/display/hostel_pic?p_HostelId=${hostelId}`, { signal });
    const d = response.data;
    if (d && d.p_photolink) return [{ p_PhotoLink: d.p_photolink }];
    if (d && d.p_PhotoLink) return [{ p_PhotoLink: d.p_PhotoLink }];
    if (Array.isArray(d)) return d.filter((img: any) => img.p_photolink || img.p_PhotoLink).map((img: any) => ({ p_PhotoLink: img.p_photolink || img.p_PhotoLink }));
    return [];
  } catch (e: any) { if (axios.isCancel(e)) throw e; return []; }
};

const getHostelRatings = async (hostelId: number, signal: AbortSignal): Promise<Rating[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/display/hostel_rating`, { signal });
    if (response.data && Array.isArray(response.data.ratings)) {
      return response.data.ratings
        .filter((r: any) => r.p_hostelid === hostelId || r.p_HostelId === hostelId || r.hostel_id === hostelId)
        .map((r: any) => ({
          p_RatingId: r.p_RatingId || r.id || 0,
          p_HostelId: r.p_hostelid || r.p_HostelId || r.hostel_id,
          p_StudentId: r.p_studentid || r.p_StudentId || r.student_id || 0,
          p_RatingStar: r.p_ratingstar || r.p_RatingStar || r.rating || 0,
          p_MaintenanceRating: r.p_maintenancerating || r.p_MaintenanceRating || 0,
          p_IssueResolvingRate: r.p_issueresolvingrate || r.p_IssueResolvingRate || 0,
          p_ManagerBehaviour: r.p_managerbehaviour || r.p_ManagerBehaviour || 0,
          p_Challenges: r.p_challenges || r.p_Challenges || ""
        }));
    }
    return [];
  } catch (e: any) { if (axios.isCancel(e)) throw e; return []; }
};

const getHostelExpenses = async (hostelId: number, signal: AbortSignal): Promise<Expense | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/Expenses/display/`, { p_HostelId: hostelId }, { signal });
    const data = response.data;
    if (data.success && data.result) {
      const r = data.result;
      return {
        p_isIncludedInRoomCharges: r.p_isIncludedInRoomCharges ?? r.isIncludedInRoomCharges ?? false,
        p_RoomCharges: r.p_RoomCharges ?? r.RoomCharges ?? [],
        p_SecurityCharges: r.p_SecurityCharges ?? r.SecurityCharges ?? 0,
        p_MessCharges: r.p_MessCharges ?? r.MessCharges ?? 0,
        p_KitchenCharges: r.p_KitchenCharges ?? r.KitchenCharges ?? 0,
        p_InternetCharges: r.p_InternetCharges ?? r.InternetCharges ?? 0,
        p_AcServiceCharges: r.p_AcServiceCharges ?? r.AcServiceCharges ?? 0,
        p_ElectricitybillType: r.p_ElectricitybillType ?? r.ElectricitybillType ?? "",
        p_ElectricityCharges: r.p_ElectricityCharges ?? r.ElectricityCharges ?? 0,
      };
    }
    if (data.expenses) return data.expenses as Expense;
    if (data.p_isIncludedInRoomCharges !== undefined) return data as Expense;
    return null;
  } catch (e: any) { if (axios.isCancel(e)) throw e; return null; }
};

const getHostelMess = async (hostelId: number, signal: AbortSignal): Promise<MessDetails | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/display/hostel_mess?p_HostelId=${hostelId}`, { signal });
    const d = response.data;
    if (d && !d.error) {
      const timeCount = d.p_messtimecount ?? d.p_MessTimeCount ?? 0;
      let dishes: string[] = [];
      const raw = d.p_dishes ?? d.p_Dishes;
      if (Array.isArray(raw)) dishes = raw.map((x: any) => x?.toString()?.trim()).filter(Boolean);
      else if (typeof raw === "string") dishes = raw.split(",").map((x: string) => x.trim()).filter(Boolean);
      return { p_MessTimeCount: timeCount, p_Dishes: dishes };
    }
    return null;
  } catch (e: any) { if (axios.isCancel(e)) throw e; return null; }
};

const getHostelKitchen = async (hostelId: number, signal: AbortSignal): Promise<KitchenDetails | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/display/details_kitchen?p_HostelId=${hostelId}`, { signal });
    const d = response.data;
    if (d && !d.error) {
      return {
        p_isFridge: d.p_isFridge ?? d.p_isfridge ?? false,
        p_isMicrowave: d.p_isMicrowave ?? d.p_ismicrowave ?? false,
        p_isGas: d.p_isGas ?? d.p_isgas ?? false,
      };
    }
    return null;
  } catch (e: any) { if (axios.isCancel(e)) throw e; return null; }
};

const getHostelSecurity = async (hostelId: number, signal: AbortSignal): Promise<SecurityInfo | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/display/security_info?p_HostelId=${hostelId}`, { signal });
    const d = response.data;
    if (d && !d.error) {
      return {
        p_GateTimings: d.p_GateTimings ?? d.p_gatetimings ?? 0,
        p_isCameras: d.p_isCameras ?? d.p_iscameras ?? false,
        p_isGuard: d.p_isGuard ?? d.p_isguard ?? false,
        p_isOutsiderVerification: d.p_isOutsiderVerification ?? d.p_isoutsiderverification ?? false,
      };
    }
    return null;
  } catch (e: any) { if (axios.isCancel(e)) throw e; return null; }
};

const getHostelCoordinates = async (hostelId: number, signal: AbortSignal): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/hostel/display/`, { p_HostelId: hostelId }, { signal });
    const data = response.data;
    if (data?.success && data?.result) {
      const r = data.result;
      const lat = parseFloat(r.p_Latitude ?? r.p_latitude ?? "");
      const lng = parseFloat(r.p_Longitude ?? r.p_longitude ?? "");
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) return { lat, lng };
    }
    return null;
  } catch (e: any) { if (axios.isCancel(e)) throw e; return null; }
};

const getRoomTypesFromExpenses = (expenses: Expense | null): RoomType[] => {
  if (!expenses || !expenses.p_RoomCharges || expenses.p_RoomCharges.length === 0) return [];
  const types = ["1-Seater", "2-Seater", "3-Seater"];
  return expenses.p_RoomCharges.map((rent, index) => ({
    type: types[index] || `Room Type ${index + 1}`,
    rent,
    available: 0,
  }));
};

// ─── Components ───

const SkeletonLoader: React.FC = () => (
  <>
    <div className={styles.skeletonHeader} />
    <div className={styles.buttons} style={{ background: '#1e1710', borderBottom: '2px solid #3a2c22' }}>
      {[0,1,2,3].map(i => (
        <div key={i} className={styles.skeletonLine} style={{ width: 130, height: 44, borderRadius: 10, margin: 0, display: 'inline-block' }} />
      ))}
    </div>
    <div className={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={styles.skeletonBox}>
          <div className={styles.skeletonLine} style={{ width: '35%', height: '26px', marginBottom: '20px' }} />
          <div className={styles.skeletonLine} style={{ width: '100%' }} />
          <div className={styles.skeletonLine} style={{ width: '85%' }} />
          <div className={styles.skeletonLine} style={{ width: '65%' }} />
          <div className={styles.skeletonLine} style={{ width: '45%' }} />
        </div>
      ))}
    </div>
  </>
);

const Navbar: React.FC<{ userId: string }> = ({ userId }) => (
  <nav className={styles.navbar}>
    <div className={styles.logo}><i className="fa-solid fa-building-user"></i> FastStay</div>
    <div className={styles.navLinks}>
      <a href={`/student/home?user_id=${userId}`} className={styles.navLink}>Home</a>
      <a href={`/student/profile?user_id=${userId}`} className={styles.navLink}>My Profile</a>
      <a href={`/student/suggestions?user_id=${userId}`} className={styles.navLink}>Suggestions</a>
      <a href="/" className={styles.navLink}>Logout</a>
    </div>
  </nav>
);

const BooleanBadge: React.FC<{ value: boolean; trueLabel: string; falseLabel?: string }> = ({ value, trueLabel, falseLabel }) => (
  <span className={value ? styles.badgeYes : styles.badgeNo}>
    <i className={value ? "fa-solid fa-check" : "fa-solid fa-xmark"}></i>{" "}
    {value ? trueLabel : (falseLabel || trueLabel)}
  </span>
);

const InfoRow: React.FC<{ icon: string; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel}><i className={icon}></i> {label}</span>
    <span className={styles.infoValue}>{value}</span>
  </div>
);

// ─── Main Component ───

const HostelDetailsPage: React.FC = () => {
  const [hostel, setHostel] = useState<HostelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hostelId = queryParams.get("id");
  const userId = queryParams.get("user_id") || "";

  const fetchHostelDetails = useCallback(async (signal: AbortSignal) => {
    if (!hostelId) { setLoading(false); return; }

    const cacheKey = `hostel_details_v2_${hostelId}`;
    const cached = getCached<HostelDetails>(cacheKey);
    if (cached) { setHostel(cached); setLoading(false); return; }

    setLoading(true);

    try {
      const id = parseInt(hostelId);

      // Fetch basic info list + detailed single hostel info in parallel
      const [allHostelsRes, singleHostelRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/display/all_hostels`, { signal }),
        axios.post(`${API_BASE_URL}/hostel/display/`, { p_HostelId: id }, { signal }).catch(() => null),
      ]);

      let basicListInfo: any = null;
      if (allHostelsRes.data.hostels && Array.isArray(allHostelsRes.data.hostels)) {
        basicListInfo = allHostelsRes.data.hostels.find((h: any) => h.hostel_id === id || h.p_hostelid === id);
      }

      let singleHostelData: any = null;
      if (singleHostelRes?.data?.success && singleHostelRes?.data?.result) {
        singleHostelData = singleHostelRes.data.result;
      }

      // Fetch all detail sections in parallel
      const [images, ratings, expenses, mess, kitchen, security] = await Promise.all([
        getHostelImages(id, signal),
        getHostelRatings(id, signal),
        getHostelExpenses(id, signal),
        getHostelMess(id, signal),
        getHostelKitchen(id, signal),
        getHostelSecurity(id, signal),
      ]);

      const coordinates = await getHostelCoordinates(id, signal);
      const averageRating = calculateAverageRating(ratings);
      const roomsFromExpenses = getRoomTypesFromExpenses(expenses);

      // Extract basic info
      const basic: BasicInfo = {
        p_BlockNo: singleHostelData?.p_BlockNo || basicListInfo?.p_blockno || "",
        p_HouseNo: singleHostelData?.p_HouseNo || basicListInfo?.p_houseno || "",
        p_HostelType: singleHostelData?.p_HostelType || basicListInfo?.p_hosteltype || "",
        p_isParking: singleHostelData?.p_isParking ?? basicListInfo?.p_isparking ?? false,
        p_NumRooms: singleHostelData?.p_NumRooms ?? basicListInfo?.p_numrooms ?? 0,
        p_NumFloors: singleHostelData?.p_NumFloors ?? basicListInfo?.p_numfloors ?? 0,
        p_WaterTimings: singleHostelData?.p_WaterTimings ?? basicListInfo?.p_watertimings ?? 0,
        p_CleanlinessTenure: singleHostelData?.p_CleanlinessTenure ?? basicListInfo?.p_cleanlinesstenure ?? 0,
        p_IssueResolvingTenure: singleHostelData?.p_IssueResolvingTenure ?? basicListInfo?.p_issueresolvingtenure ?? 0,
        p_MessProvide: singleHostelData?.p_MessProvide ?? basicListInfo?.p_messprovide ?? false,
        p_GeezerFlag: singleHostelData?.p_GeezerFlag ?? basicListInfo?.p_geezerflag ?? false,
      };

      const hostelDetails: HostelDetails = {
        hostel_id: id,
        p_name: singleHostelData?.p_name || basicListInfo?.p_name || "",
        p_blockno: basic.p_BlockNo,
        p_houseno: basic.p_HouseNo,
        distance_from_university: basicListInfo?.distance_from_university,
        images,
        rooms: roomsFromExpenses,
        ratings,
        averageRating: averageRating > 0 ? averageRating : undefined,
        expenses,
        mess,
        kitchen,
        security,
        basic,
        p_latitude: coordinates?.lat,
        p_longitude: coordinates?.lng,
      };

      setHostel(hostelDetails);
      setCache(cacheKey, hostelDetails);
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      console.error("Failed to fetch hostel details:", error);
    } finally {
      setLoading(false);
    }
  }, [hostelId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchHostelDetails(controller.signal);
    return () => controller.abort();
  }, [fetchHostelDetails]);

  useEffect(() => { window.scrollTo(0, 0); }, [hostelId]);

  const handleGetDirections = () => {
    if (!hostel) return;
    const lat = hostel.p_latitude;
    const lng = hostel.p_longitude;
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) { alert("Hostel location is not available."); return; }
    const params = new URLSearchParams({
      hostel_id: String(hostel.hostel_id), user_id: userId,
      lat: String(lat), lng: String(lng),
      name: hostel.p_name, block: hostel.p_blockno, house: hostel.p_houseno,
    });
    navigate(`/student/directions?${params.toString()}`);
  };

  const handleBack = () => { navigate(`/student/home?user_id=${userId}`); };

  const handlePrevImage = () => {
    if (!hostel) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? hostel.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!hostel) return;
    setCurrentImageIndex((prev) =>
      prev === hostel.images.length - 1 ? 0 : prev + 1
    );
  };

  const ratingBreakdown = useMemo(() => {
    if (!hostel || hostel.ratings.length === 0) return null;
    const c = hostel.ratings.length;
    return {
      maintenance: Math.floor(hostel.ratings.reduce((s, r) => s + r.p_MaintenanceRating, 0) / c),
      issueResolving: Math.floor(hostel.ratings.reduce((s, r) => s + r.p_IssueResolvingRate, 0) / c),
      manager: Math.floor(hostel.ratings.reduce((s, r) => s + r.p_ManagerBehaviour, 0) / c),
    };
  }, [hostel]);

  const estimatedMonthly = useMemo(() => {
    if (!hostel || !hostel.expenses) return null;
    const roomRent = hostel.rooms[0]?.rent || 0;
    const e = hostel.expenses;
    return roomRent + (e.p_MessCharges || 0) + (e.p_KitchenCharges || 0) + (e.p_InternetCharges || 0) + (e.p_AcServiceCharges || 0) + (e.p_ElectricityCharges || 0);
  }, [hostel]);

  if (loading) {
    return (<div className={styles.pageWrapper}><Navbar userId={userId} /><SkeletonLoader /></div>);
  }

  if (!hostel) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar userId={userId} />
        <div className={styles.errorContainer}>
          <h3>Hostel Not Found</h3>
          <button onClick={handleBack} className={styles.backBtn}><i className="fa-solid fa-arrow-left"></i> Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar userId={userId} />

      {/* ─── Header Image ─── */}
      <div className={styles.headerImage}>
        {hostel.images.length > 0 ? (
          <>
            <img src={hostel.images[currentImageIndex].p_PhotoLink} alt={`${hostel.p_name} - ${currentImageIndex + 1}`} loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            {hostel.images.length > 1 && (
              <>
                <button className={styles.sliderArrowLeft} onClick={handlePrevImage} aria-label="Previous image">
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <button className={styles.sliderArrowRight} onClick={handleNextImage} aria-label="Next image">
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
                <div className={styles.imageCounter}>
                  <i className="fa-solid fa-images"></i> {currentImageIndex + 1} / {hostel.images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className={styles.noImagePlaceholder}>
            <i className="fa-solid fa-image" style={{ fontSize: '56px', color: '#7a6050' }}></i>
            <p>No image available</p>
          </div>
        )}
        <h1>{hostel.p_name || "Unknown Hostel"}</h1>
        <p>
          {hostel.distance_from_university != null && (
            <span><i className="fa-solid fa-location-dot"></i> {hostel.distance_from_university.toFixed(1)} km from FAST Lahore</span>
          )}
          {hostel.averageRating && (
            <span className={styles.averageRating}>
              <i className="fa-solid fa-star"></i>
              {hostel.averageRating.toFixed(1)}&nbsp;/&nbsp;5.0
              <span style={{ fontSize: '13px', color: '#d4c4b0', fontWeight: 400 }}>
                &nbsp;({hostel.ratings.length} review{hostel.ratings.length !== 1 ? 's' : ''})
              </span>
            </span>
          )}
        </p>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className={styles.buttons}>
        
        <button className={styles.btn} onClick={() => navigate(`/student/rooms?hostel_id=${hostelId}&user_id=${userId}`)}><i className="fa-solid fa-door-open"></i> View Rooms</button>
        <button className={styles.btn} onClick={handleGetDirections}><i className="fa-solid fa-map-location-dot"></i> Get Directions</button>
      </div>

      <div className={styles.container}>

        {/* ═══════════════════ BASIC DETAILS ═══════════════════ */}
        {hostel.basic && (
          <section className={styles.box}>
            <h2><i className="fa-solid fa-circle-info"></i> Basic Details</h2>
            <div className={styles.infoGrid}>
              <InfoRow icon="fa-solid fa-building" label="Hostel Type" value={hostel.basic.p_HostelType || "N/A"} />
              <InfoRow icon="fa-solid fa-map-pin" label="Block No" value={hostel.basic.p_BlockNo || "N/A"} />
              <InfoRow icon="fa-solid fa-house" label="House No" value={hostel.basic.p_HouseNo || "N/A"} />
              <InfoRow icon="fa-solid fa-door-open" label="Total Rooms" value={hostel.basic.p_NumRooms} />
              <InfoRow icon="fa-solid fa-layer-group" label="Total Floors" value={hostel.basic.p_NumFloors} />
              <InfoRow icon="fa-solid fa-droplet" label="Water Timing" value={`${hostel.basic.p_WaterTimings} hrs/day`} />
              <InfoRow icon="fa-solid fa-broom" label="Cleaning Tenure" value={`Every ${hostel.basic.p_CleanlinessTenure} day(s)`} />
              <InfoRow icon="fa-solid fa-wrench" label="Issue Resolving" value={`Within ${hostel.basic.p_IssueResolvingTenure} day(s)`} />
            </div>
            <div className={styles.featureTags}>
              <BooleanBadge value={hostel.basic.p_isParking} trueLabel="Parking Available" falseLabel="No Parking" />
              <BooleanBadge value={hostel.basic.p_MessProvide} trueLabel="Mess Provided" falseLabel="No Mess" />
              <BooleanBadge value={hostel.basic.p_GeezerFlag} trueLabel="Geyser Available" falseLabel="No Geyser" />
            </div>
          </section>
        )}

        {/* ═══════════════════ MESS DETAILS ═══════════════════ */}
        {hostel.mess && (
          <section className={styles.box}>
            <h2><i className="fa-solid fa-utensils"></i> Mess Details</h2>
            <div className={styles.infoGrid}>
              <InfoRow icon="fa-solid fa-clock" label="Meals Per Day" value={`${hostel.mess.p_MessTimeCount} meals`} />
              {hostel.expenses && hostel.expenses.p_MessCharges > 0 && (
                <InfoRow icon="fa-solid fa-money-bill" label="Mess Charges" value={`${hostel.expenses.p_MessCharges.toLocaleString()} PKR/month`} />
              )}
            </div>
            {hostel.mess.p_Dishes.length > 0 && (
              <>
                <h4><i className="fa-solid fa-bowl-food"></i> Dishes Served</h4>
                <div className={styles.dishTags}>
                  {hostel.mess.p_Dishes.map((dish, i) => (
                    <span key={i} className={styles.dishTag}>{dish}</span>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ═══════════════════ KITCHEN DETAILS ═══════════════════ */}
        {hostel.kitchen && (
          <section className={styles.box}>
            <h2><i className="fa-solid fa-kitchen-set"></i> Kitchen Details</h2>
            <div className={styles.featureTags}>
              <BooleanBadge value={hostel.kitchen.p_isFridge} trueLabel="Fridge Available" falseLabel="No Fridge" />
              <BooleanBadge value={hostel.kitchen.p_isMicrowave} trueLabel="Microwave Available" falseLabel="No Microwave" />
              <BooleanBadge value={hostel.kitchen.p_isGas} trueLabel="Gas Available" falseLabel="No Gas" />
            </div>
            {hostel.expenses && hostel.expenses.p_KitchenCharges > 0 && (
              <div className={styles.infoGrid} style={{ marginTop: '18px' }}>
                <InfoRow icon="fa-solid fa-money-bill" label="Kitchen Charges" value={`${hostel.expenses.p_KitchenCharges.toLocaleString()} PKR/month`} />
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════ SECURITY DETAILS ═══════════════════ */}
        {hostel.security && (
          <section className={styles.box}>
            <h2><i className="fa-solid fa-shield-halved"></i> Security Details</h2>
            <div className={styles.infoGrid}>
              <InfoRow icon="fa-solid fa-clock" label="Guard Hours" value={`${hostel.security.p_GateTimings} hrs/day`} />
              {hostel.expenses && hostel.expenses.p_SecurityCharges > 0 && (
                <InfoRow icon="fa-solid fa-money-bill" label="Security Deposit" value={`${hostel.expenses.p_SecurityCharges.toLocaleString()} PKR`} />
              )}
            </div>
            <div className={styles.featureTags} style={{ marginTop: '16px' }}>
              <BooleanBadge value={hostel.security.p_isCameras} trueLabel="CCTV Cameras" falseLabel="No Cameras" />
              <BooleanBadge value={hostel.security.p_isGuard} trueLabel="Security Guard" falseLabel="No Guard" />
              <BooleanBadge value={hostel.security.p_isOutsiderVerification} trueLabel="Outsider Verification" falseLabel="No Outsider Check" />
            </div>
          </section>
        )}

        {/* ═══════════════════ EXPENSES BREAKDOWN ═══════════════════ */}
        {hostel.expenses && (
          <section className={styles.box}>
            <h2><i className="fa-solid fa-money-bill-wave"></i> Expense Breakdown</h2>

            {hostel.expenses.p_isIncludedInRoomCharges ? (
              <div className={styles.expenseNote}>
                <i className="fa-solid fa-circle-check"></i> All expenses are included in the room charges.
                {hostel.expenses.p_SecurityCharges > 0 && (
                  <p style={{ marginTop: '10px', marginBottom: 0 }}>
                    Security Deposit: <b>{hostel.expenses.p_SecurityCharges.toLocaleString()} PKR</b> (one-time)
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.expenseGrid}>
                {hostel.expenses.p_SecurityCharges > 0 && (
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseLabel}><i className="fa-solid fa-shield"></i> Security Deposit</span>
                    <span className={styles.expenseValue}>{hostel.expenses.p_SecurityCharges.toLocaleString()} PKR <span style={{fontWeight:400, fontSize:'12px', color:'#8a7568'}}>(one-time)</span></span>
                  </div>
                )}
                {hostel.expenses.p_MessCharges > 0 && (
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseLabel}><i className="fa-solid fa-utensils"></i> Mess Charges</span>
                    <span className={styles.expenseValue}>{hostel.expenses.p_MessCharges.toLocaleString()} PKR/mo</span>
                  </div>
                )}
                {hostel.expenses.p_KitchenCharges > 0 && (
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseLabel}><i className="fa-solid fa-kitchen-set"></i> Kitchen</span>
                    <span className={styles.expenseValue}>{hostel.expenses.p_KitchenCharges.toLocaleString()} PKR/mo</span>
                  </div>
                )}
                {hostel.expenses.p_InternetCharges > 0 && (
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseLabel}><i className="fa-solid fa-wifi"></i> Internet</span>
                    <span className={styles.expenseValue}>{hostel.expenses.p_InternetCharges.toLocaleString()} PKR/mo</span>
                  </div>
                )}
                {hostel.expenses.p_AcServiceCharges > 0 && (
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseLabel}><i className="fa-solid fa-snowflake"></i> AC Service</span>
                    <span className={styles.expenseValue}>{hostel.expenses.p_AcServiceCharges.toLocaleString()} PKR/mo</span>
                  </div>
                )}
                {hostel.expenses.p_ElectricitybillType && (
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseLabel}><i className="fa-solid fa-bolt"></i> Electricity Type</span>
                    <span className={styles.expenseValue}>{hostel.expenses.p_ElectricitybillType}</span>
                  </div>
                )}
                {hostel.expenses.p_ElectricityCharges > 0 && (
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseLabel}><i className="fa-solid fa-plug"></i> Electricity</span>
                    <span className={styles.expenseValue}>{hostel.expenses.p_ElectricityCharges.toLocaleString()} PKR/mo</span>
                  </div>
                )}
              </div>
            )}

            {estimatedMonthly != null && estimatedMonthly > 0 && !hostel.expenses.p_isIncludedInRoomCharges && (
              <div className={styles.totalEstimate}>
                <h4>Estimated Monthly Total</h4>
                <div className={styles.totalAmount}>
                  {estimatedMonthly.toLocaleString()} PKR
                  <span className={styles.totalSuffix}>/month</span>
                </div>
                <div className={styles.totalNote}>* Based on cheapest room + all listed recurring charges</div>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════ RATINGS & REVIEWS ═══════════════════ */}
        {hostel.ratings.length > 0 && ratingBreakdown && (
          <section className={styles.box}>
            <h2><i className="fa-solid fa-star"></i> Ratings & Reviews</h2>
            <div className={styles.ratingHeader}>
              <div className={styles.ratingBig}>{hostel.averageRating?.toFixed(1)}</div>
              <div>
                <div className={styles.ratingStars}>
                  {'★'.repeat(Math.floor(hostel.averageRating || 0))}
                  {'☆'.repeat(5 - Math.floor(hostel.averageRating || 0))}
                </div>
                <div className={styles.ratingCount}>
                  Based on {hostel.ratings.length} review{hostel.ratings.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className={styles.ratingBreakdown}>
              <div className={styles.ratingCategory}>
                <span>Maintenance</span>
                <span className={styles.ratingStars}>{'★'.repeat(ratingBreakdown.maintenance)}{'☆'.repeat(5 - ratingBreakdown.maintenance)}</span>
              </div>
              <div className={styles.ratingCategory}>
                <span>Issue Resolving</span>
                <span className={styles.ratingStars}>{'★'.repeat(ratingBreakdown.issueResolving)}{'☆'.repeat(5 - ratingBreakdown.issueResolving)}</span>
              </div>
              <div className={styles.ratingCategory}>
                <span>Manager Behavior</span>
                <span className={styles.ratingStars}>{'★'.repeat(ratingBreakdown.manager)}{'☆'.repeat(5 - ratingBreakdown.manager)}</span>
              </div>
            </div>

            <h4><i className="fa-solid fa-comment"></i> Recent Reviews</h4>
            {hostel.ratings.slice(0, 3).map((rating, index) => (
              <div key={index} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.ratingStars}>
                    {'★'.repeat(rating.p_RatingStar)}{'☆'.repeat(5 - rating.p_RatingStar)}
                  </div>
                  <div className={styles.reviewStudent}>Student #{rating.p_StudentId}</div>
                </div>
                {rating.p_Challenges && (
                  <div className={styles.reviewText}>"{rating.p_Challenges}"</div>
                )}
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
};

export default HostelDetailsPage;