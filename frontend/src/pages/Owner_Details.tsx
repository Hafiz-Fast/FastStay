import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "../styles/OwnerDetails.module.css";
import Navbar from "../components/Navbar";
import useAuthGuard from "../hooks/useAuthGuard";

interface ManagerDetails {
  p_PhotoLink?: string;
  p_PhoneNo: string;
  p_Education: string;
  p_ManagerType: string;
  p_OperatingHours: number;
}

interface UserDetails {
  userid: number;
  loginid: number;
  fname: string;
  lname: string;
  age: number;
  gender: string;
  city: string;
  usertype: string;
}

interface OwnerDetails {
  user: UserDetails;
  manager: ManagerDetails;
  hostelName?: string;
  hostelBlock?: string;
  hostelHouse?: string;
  managerSince?: string;
  responseTime?: string;
  experienceLevel?: string;
}

// Cache configuration
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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
  } catch {
    // Storage full, ignore
  }
};

const SkeletonLoader: React.FC<{ userId: string | null }> = ({ userId }) => (
  <div className={styles.pageWrapper}>
    <Navbar userId={userId ?? ""} />
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.skeletonBackButton} />
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonSubtitle} />
      </div>
    </div>
    <div className={styles.container}>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading owner details...</p>
      </div>
    </div>
  </div>
);

const OwnerDetails: React.FC = () => {
  const userId = useAuthGuard();
  const [owner, setOwner] = useState<OwnerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Extract query parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const hostelId = queryParams.get("id");
  
  // API Base URL
  const API_BASE_URL = "http://127.0.0.1:8000/faststay_app";
  
  // Format operating hours
  const formatOperatingHours = useCallback((hours: number): string => {
    if (hours === 24) return "24/7";
    if (hours === -1) return "Not specified";
    return `${hours} hours/day`;
  }, []);
  
  // Format phone number for display
  const formatPhoneNumber = useCallback((phone: string): string => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 4)} ${cleaned.slice(4, 11)}`;
    }
    return phone;
  }, []);
  
  // Fetch owner details
  const fetchOwnerDetails = useCallback(async () => {
    if (!hostelId) {
      setError("No hostel ID provided");
      setLoading(false);
      return;
    }
    
    // Check cache first
    const cacheKey = `owner_details_${hostelId}`;
    const cached = getCached<OwnerDetails>(cacheKey);
    if (cached) {
      setOwner(cached);
      setLoading(false);
      return;
    }
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setLoading(true);
    setError(null);
    setImageError(false);
    
    try {
      // Fetch all data in parallel where possible
      const [hostelResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/display/all_hostels`, { signal }).catch(() => ({ data: { hostels: [] } })),
        axios.get(`${API_BASE_URL}/users/all/`, { signal }).catch(() => ({ data: { users: [] } }))
      ]);
      
      // Find hostel and manager ID
      let managerId = null;
      let hostelName = "";
      let hostelBlock = "";
      let hostelHouse = "";
      
      if (hostelResponse.data.hostels?.length) {
        const hostel = hostelResponse.data.hostels.find(
          (h: any) => h.hostel_id === parseInt(hostelId) || h.p_hostelid === parseInt(hostelId)
        );
        
        if (hostel) {
          managerId = hostel.p_managerid;
          hostelName = hostel.p_name || "";
          hostelBlock = hostel.p_blockno || "";
          hostelHouse = hostel.p_houseno || "";
        }
      }
      
      if (!managerId) {
        throw new Error("Manager not found for this hostel");
      }
      
      // Find user details
      let userDetails: UserDetails | null = null;
      if (usersResponse.data.users?.length) {
        userDetails = usersResponse.data.users.find(
          (u: any) => u.userid === managerId
        );
      }
      
      if (!userDetails) {
        throw new Error("Manager details not found");
      }
      
      // Fetch manager-specific details
      let managerDetails: ManagerDetails | null = null;
      
      try {
        const managerResponse = await axios.post(
          `${API_BASE_URL}/ManagerDetails/display/`,
          { p_ManagerId: managerId },
          { signal }
        );
        
        if (managerResponse.data.success && managerResponse.data.result) {
          managerDetails = managerResponse.data.result;
        }
      } catch (managerError) {
        console.warn("Could not fetch manager details, using default structure");
        // Create default structure with empty values
        managerDetails = {
          p_PhoneNo: "",
          p_Education: "",
          p_ManagerType: "",
          p_OperatingHours: -1
        };
      }
      
      // Combine all data
      const ownerData: OwnerDetails = {
        user: userDetails,
        manager: managerDetails!,
        hostelName,
        hostelBlock,
        hostelHouse,
        managerSince: "2023", // This should come from actual data in production
        responseTime: "Within 1-2 hours", // This should come from actual data
        experienceLevel: managerDetails?.p_ManagerType === "Full-time" ? "Experienced" : "Standard"
      };
      
      setOwner(ownerData);
      setCache(cacheKey, ownerData);
      
    } catch (error: any) {
      if (!signal.aborted) {
        console.error("Failed to fetch owner details:", error);
        setError(error.response?.data?.error || error.message || "Failed to load owner details");
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [hostelId, API_BASE_URL]);
  
  useEffect(() => {
    window.scrollTo(0, 0)
    fetchOwnerDetails();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchOwnerDetails]);
  
  // Handler functions
  const handleContact = useCallback(() => {
    if (owner?.manager.p_PhoneNo) {
      window.location.href = `tel:${owner.manager.p_PhoneNo}`;
    }
  }, [owner?.manager.p_PhoneNo]);
  
  const handleWhatsApp = useCallback(() => {
    if (owner?.manager.p_PhoneNo) {
      const phone = owner.manager.p_PhoneNo.replace(/\D/g, '');
      const message = `Hi ${owner.user.fname}, I'm interested in ${owner.hostelName || 'your hostel'}. Can you provide more details?`;
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }, [owner]);
  
  const handleBack = useCallback(() => {
    navigate(`/student/home?user_id=${userId}`);
  }, [navigate, userId]);
  
  const handleBackToHostel = useCallback(() => {
    navigate(`/student/hostelDetails?id=${hostelId}&user_id=${userId}`);
  }, [navigate, hostelId, userId]);
  
  const handleRetry = useCallback(() => {
    sessionStorage.removeItem(`owner_details_${hostelId}`);
    fetchOwnerDetails();
  }, [fetchOwnerDetails, hostelId]);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  // Memoized values
  const formattedPhone = useMemo(() => 
    owner?.manager.p_PhoneNo ? formatPhoneNumber(owner.manager.p_PhoneNo) : "Not available",
    [owner?.manager.p_PhoneNo, formatPhoneNumber]
  );
  
  const operatingHoursDisplay = useMemo(() => 
    formatOperatingHours(owner?.manager.p_OperatingHours || -1),
    [owner?.manager.p_OperatingHours, formatOperatingHours]
  );
  
  const fullName = useMemo(() => 
    `${owner?.user.fname || ''} ${owner?.user.lname || ''}`.trim() || "Manager",
    [owner?.user.fname, owner?.user.lname]
  );
  
  // Render loading state
  if (loading) {
    return <SkeletonLoader userId={userId} />;
  }
  
  // Render error state
  if (error || !owner) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar userId={userId ?? ""} />
        <div className={styles.errorContainer}>
          <i className="fa-solid fa-exclamation-circle"></i>
          <h3>Error Loading Owner Details</h3>
          <p>{error || "Owner information not found"}</p>
          <div className={styles.errorButtons}>
            <button onClick={handleRetry} className={styles.retryBtn}>
              <i className="fa-solid fa-rotate"></i> Retry
            </button>
            <button onClick={handleBack} className={styles.backBtn}>
              <i className="fa-solid fa-arrow-left"></i> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.pageWrapper}>
      <Navbar userId={userId ?? ""} />
      
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={handleBackToHostel} className={styles.backButton}>
            <i className="fa-solid fa-arrow-left"></i> Back to Hostel
          </button>
          <h1>Hostel Manager Details</h1>
          {owner.hostelName && (
            <p className={styles.hostelInfo}>
              <i className="fa-solid fa-building"></i> Managing: {owner.hostelName}
              {owner.hostelBlock && owner.hostelHouse && (
                <span> • {owner.hostelBlock}, {owner.hostelHouse}</span>
              )}
            </p>
          )}
        </div>
      </div>
      
      <div className={styles.container}>
        {/* PROFILE CARD */}
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.profileImage}>
              {owner.manager.p_PhotoLink && !imageError ? (
                <img 
                  src={owner.manager.p_PhotoLink} 
                  alt={fullName}
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <i className="fa-solid fa-user-tie"></i>
                </div>
              )}
            </div>
            <div className={styles.profileInfo}>
              <h2>{fullName}</h2>
              {owner.manager.p_ManagerType && (
                <p className={styles.managerType}>
                  <i className="fa-solid fa-briefcase"></i> {owner.manager.p_ManagerType} Manager
                </p>
              )}
              <div className={styles.quickStats}>
                {owner.manager.p_OperatingHours > 0 && (
                  <div className={styles.stat}>
                    <i className="fa-solid fa-clock"></i>
                    <span>{operatingHoursDisplay}</span>
                  </div>
                )}
                {owner.manager.p_Education && (
                  <div className={styles.stat}>
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>{owner.manager.p_Education}</span>
                  </div>
                )}
                {owner.user.city && (
                  <div className={styles.stat}>
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{owner.user.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* CONTACT BUTTONS */}
          <div className={styles.contactButtons}>
            <button className={styles.contactBtn} onClick={handleContact} disabled={!owner.manager.p_PhoneNo}>
              <i className="fa-solid fa-phone"></i> Call Now
            </button>
            <button className={styles.contactBtn} onClick={handleWhatsApp} disabled={!owner.manager.p_PhoneNo}>
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
          </div>
        </div>
        
        {/* DETAILED INFORMATION */}
        <div className={styles.detailsGrid}>
          {/* PERSONAL INFO */}
          <section className={styles.detailSection}>
            <h3><i className="fa-solid fa-user"></i> Personal Information</h3>
            <div className={styles.detailList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Full Name</span>
                <span className={styles.detailValue}>{fullName}</span>
              </div>
              {owner.user.age > 0 && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Age</span>
                  <span className={styles.detailValue}>{owner.user.age} years</span>
                </div>
              )}
              {owner.user.gender && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Gender</span>
                  <span className={styles.detailValue}>{owner.user.gender}</span>
                </div>
              )}
              {owner.user.city && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>City</span>
                  <span className={styles.detailValue}>{owner.user.city}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>User Type</span>
                <span className={styles.detailValue}>{owner.user.usertype}</span>
              </div>
            </div>
          </section>
          
          {/* PROFESSIONAL INFO */}
          <section className={styles.detailSection}>
            <h3><i className="fa-solid fa-briefcase"></i> Professional Information</h3>
            <div className={styles.detailList}>
              {owner.manager.p_ManagerType && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Manager Type</span>
                  <span className={styles.detailValue}>{owner.manager.p_ManagerType}</span>
                </div>
              )}
              {owner.manager.p_OperatingHours > 0 && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Operating Hours</span>
                  <span className={styles.detailValue}>{operatingHoursDisplay}</span>
                </div>
              )}
              {owner.manager.p_Education && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Education</span>
                  <span className={styles.detailValue}>{owner.manager.p_Education}</span>
                </div>
              )}
              {owner.experienceLevel && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Experience Level</span>
                  <span className={styles.detailValue}>{owner.experienceLevel}</span>
                </div>
              )}
            </div>
          </section>
          
          {/* CONTACT INFO - Fixed alignment */}
          <section className={styles.detailSection}>
            <h3><i className="fa-solid fa-address-book"></i> Contact Information</h3>
            <div className={styles.detailList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Phone Number</span>
                <span className={styles.detailValue}>
                  {owner.manager.p_PhoneNo ? (
                    <a href={`tel:${owner.manager.p_PhoneNo}`} className={styles.phoneLink}>
                      <i className="fa-solid fa-phone"></i> {formattedPhone}
                    </a>
                  ) : (
                    <span className={styles.phoneLink}>Not available</span>
                  )}
                </span>
              </div>
              {owner.responseTime && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Response Time</span>
                  <span className={styles.detailValue}>
                    <i className="fa-solid fa-bolt"></i> {owner.responseTime}
                  </span>
                </div>
              )}
            </div>
          </section>
          
          {/* HOSTEL INFO */}
          {owner.hostelName && (
            <section className={styles.detailSection}>
              <h3><i className="fa-solid fa-building"></i> Managing Hostel</h3>
              <div className={styles.detailList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Hostel Name</span>
                  <span className={styles.detailValue}>{owner.hostelName}</span>
                </div>
                {owner.hostelBlock && owner.hostelHouse && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Location</span>
                    <span className={styles.detailValue}>
                      {owner.hostelBlock}, {owner.hostelHouse}
                    </span>
                  </div>
                )}
                {owner.managerSince && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Manager Since</span>
                    <span className={styles.detailValue}>{owner.managerSince}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
        
        {/* ABOUT SECTION - Only show if we have meaningful data */}
        {(owner.manager.p_ManagerType || owner.manager.p_Education) && (
          <section className={styles.aboutSection}>
            <h3><i className="fa-solid fa-circle-info"></i> About the Manager</h3>
            <div className={styles.aboutContent}>
              <p>
                {fullName} is {owner.manager.p_ManagerType ? `a ${owner.manager.p_ManagerType.toLowerCase()} manager` : 'a manager'}
                {owner.manager.p_Education ? ` with ${owner.manager.p_Education.toLowerCase()}` : ''}.
                {owner.manager.p_OperatingHours > 0 && ` Available ${operatingHoursDisplay} for any inquiries.`}
              </p>
            </div>
          </section>
        )}
        
        {/* ACTION BUTTONS */}
        <div className={styles.actionButtons}>
          <button className={styles.primaryBtn} onClick={handleContact} disabled={!owner.manager.p_PhoneNo}>
            <i className="fa-solid fa-phone"></i> Contact for Booking
          </button>
          <button className={styles.secondaryBtn} onClick={handleBackToHostel}>
            <i className="fa-solid fa-building"></i> View Hostel Details
          </button>
          <button className={styles.secondaryBtn} onClick={handleBack}>
            <i className="fa-solid fa-home"></i> Back to Home
          </button>
        </div>
        
        {/* TIPS SECTION */}
        <div className={styles.tipsSection}>
          <h4><i className="fa-solid fa-lightbulb"></i> Tips for Contacting the Manager</h4>
          <ul className={styles.tipsList}>
            <li>Have your student ID ready when calling</li>
            <li>Mention the hostel name when inquiring</li>
            <li>Ask about room availability and booking process</li>
            <li>Inquire about any special offers for students</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OwnerDetails;