import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/StudentHome.module.css";
import Navbar from "../components/Navbar";
import useAuthGuard from "../hooks/useAuthGuard";

interface Hostel {
  p_blockno: string;
  p_houseno: string;
  p_hosteltype: string;
  p_isparking: boolean;
  p_numrooms: number;
  p_numfloors: number;
  p_watertimings: string;
  p_cleanlinesstenure: number;
  p_issueresolvingtenure: number;
  p_messprovide: boolean;
  p_geezerflag: boolean;
  p_name: string;
  p_hostelid: number;
  p_managerid?: number;
  distance_from_university: number;
  rating: number;
  monthly_rent: number;
  available_rooms: number;
  images?: string[];
  location?: string;
  p_latitude: number;
  p_longitude: number;
  p_photolinks?: string;
  p_ratingstar?: number;
  p_roomcharges?: number[];
}

interface FilterState {
  maxRent: string;
  distance: string;
  hostelType: string;
  rating: string;
  hasParking: boolean | null;
  hasMess: boolean | null;
  hasGeyser: boolean | null;
}

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
  } catch { /* storage full, ignore */ }
};

const UNIVERSITY_LAT = 31.48104;
const UNIVERSITY_LNG = 74.303449;

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return parseFloat((R * c).toFixed(2));
};

const formatValue = (value: number, options?: {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  isCurrency?: boolean;
  isDistance?: boolean;
}): string => {
  if (value === -1) return "N/A";
  let displayValue = value;
  if (options?.decimals !== undefined) {
    displayValue = parseFloat(displayValue.toFixed(options.decimals));
  }
  if (options?.isCurrency) {
    return `${options.prefix || ''}${displayValue.toLocaleString()}${options.suffix || ' PKR'}`;
  }
  if (options?.isDistance) {
    return `${displayValue.toFixed(1)}${options.suffix || ' km'}`;
  }
  return `${options?.prefix || ''}${displayValue}${options?.suffix || ''}`;
};

const formatRating = (rating: number): string => {
  if (rating === -1) return "N/A";
  return `${rating.toFixed(1)}/5.0`;
};

const formatRooms = (rooms: number): string => {
  if (rooms === -1) return "N/A";
  return `${rooms}`;
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";

const processHostelData = (hostelData: any): Hostel => {
  let distance = -1;
  if (hostelData.p_latitude && hostelData.p_longitude) {
    distance = calculateDistance(
      UNIVERSITY_LAT, UNIVERSITY_LNG,
      parseFloat(hostelData.p_latitude),
      parseFloat(hostelData.p_longitude)
    );
  }

  let images: string[] = [];
  if (hostelData.p_photolinks) {
    if (typeof hostelData.p_photolinks === 'string') {
      images = hostelData.p_photolinks.split(',')
        .map((link: string) => link.trim())
        .filter((link: string) => link.length > 0)
        .map((link: string) => link.startsWith('/') ? `http://127.0.0.1:8000${link}` : link);
    }
  }

  let rating = -1;
  if (hostelData.p_ratingstar) {
    rating = parseFloat(hostelData.p_ratingstar.toFixed(1));
  }

  let monthly_rent = -1;
  if (hostelData.p_roomcharges && Array.isArray(hostelData.p_roomcharges) && hostelData.p_roomcharges.length > 0) {
    monthly_rent = hostelData.p_roomcharges[0];
  }

  return {
    p_blockno: hostelData.p_blockno || "",
    p_houseno: hostelData.p_houseno || "",
    p_hosteltype: hostelData.p_hosteltype || "",
    p_isparking: hostelData.p_isparking || false,
    p_numrooms: hostelData.p_numrooms || 0,
    p_numfloors: hostelData.p_numfloors || 0,
    p_watertimings: hostelData.p_watertimings?.toString() || "",
    p_cleanlinesstenure: hostelData.p_cleanlinesstenure || 0,
    p_issueresolvingtenure: hostelData.p_issueresolvingtenure || 0,
    p_messprovide: hostelData.p_messprovide || false,
    p_geezerflag: hostelData.p_geezerflag || false,
    p_name: hostelData.p_name || "",
    p_hostelid: hostelData.p_hostelid,
    p_managerid: hostelData.p_managerid,
    distance_from_university: distance,
    rating,
    monthly_rent,
    available_rooms: hostelData.p_numrooms || 0,
    images,
    p_latitude: hostelData.p_latitude,
    p_longitude: hostelData.p_longitude,
    p_photolinks: hostelData.p_photolinks,
    p_ratingstar: hostelData.p_ratingstar,
    p_roomcharges: hostelData.p_roomcharges
  };
};

const SkeletonCards: React.FC = () => (
  <div className={styles.loadingGrid}>
    <div className={styles.spinner}></div>
    <p>Loading hostels...</p>
  </div>
);

const AnimatedCard: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.5s ease ${index * 0.07}s, transform 0.5s ease ${index * 0.07}s`,
      }}
    >
      {children}
    </div>
  );
};

const StudentHome: React.FC = () => {
  const userId = useAuthGuard({ allowGuest: true });

  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const hostelGridRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    maxRent: "",
    distance: "",
    hostelType: "",
    rating: "",
    hasParking: null,
    hasMess: null,
    hasGeyser: null
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchAllHostels = async () => {
      setLoading(true);
      setError(null);

      const cacheKey = `student_home_hostels`;
      const cached = getCached<Hostel[]>(cacheKey);
      if (cached) {
        setHostels(cached);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/faststay_app/display/StudentHome",
          { signal }
        );

        if (response.data.hostels && Array.isArray(response.data.hostels)) {
          const processedHostels = response.data.hostels.map((hostel: any) =>
            processHostelData(hostel)
          );
          setHostels(processedHostels);
          setCache(cacheKey, processedHostels);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error: any) {
        if (!signal.aborted) {
          console.error("Failed to fetch hostels:", error);
          setError(error.response?.data?.error || "Failed to load hostels. Please try again.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAllHostels();
    return () => controller.abort();
  }, [userId]);

  const filteredHostels = useMemo(() => {
    let filtered = hostels;

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hostel =>
        hostel.p_name.toLowerCase().includes(query) ||
        hostel.p_blockno.toLowerCase().includes(query) ||
        hostel.p_houseno.toLowerCase().includes(query) ||
        (hostel.location && hostel.location.toLowerCase().includes(query))
      );
    }

    if (filters.maxRent) {
      const maxRentValue = parseInt(filters.maxRent);
      filtered = filtered.filter(hostel =>
        hostel.monthly_rent !== -1 && hostel.monthly_rent <= maxRentValue
      );
    }

    if (filters.distance) {
      const maxDistance = parseFloat(filters.distance);
      filtered = filtered.filter(hostel =>
        hostel.distance_from_university !== -1 && hostel.distance_from_university <= maxDistance
      );
    }

    if (filters.hostelType) {
      filtered = filtered.filter(hostel =>
        hostel.p_hosteltype === filters.hostelType
      );
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(hostel =>
        hostel.rating !== -1 && hostel.rating >= minRating
      );
    }

    if (filters.hasParking !== null) {
      filtered = filtered.filter(hostel => hostel.p_isparking === filters.hasParking);
    }

    if (filters.hasMess !== null) {
      filtered = filtered.filter(hostel => hostel.p_messprovide === filters.hasMess);
    }

    if (filters.hasGeyser !== null) {
      filtered = filtered.filter(hostel => hostel.p_geezerflag === filters.hasGeyser);
    }

    return filtered;
  }, [hostels, searchQuery, filters]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    hostelGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      maxRent: "",
      distance: "",
      hostelType: "",
      rating: "",
      hasParking: null,
      hasMess: null,
      hasGeyser: null
    });
    setSearchQuery("");
  }, []);

  const handleViewDetails = useCallback((hostelId: number) => {
    navigate(`/student/hostelDetails?id=${hostelId}&user_id=${userId}`);
  }, [navigate, userId]);

  const handleViewOwner = useCallback((hostelId: number) => {
    navigate(`/student/ownerDetails?id=${hostelId}&user_id=${userId}`);
  }, [navigate, userId]);

  const handleRetry = useCallback(() => {
    sessionStorage.removeItem('student_home_hostels');
    window.location.reload();
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return hostels
      .filter(hostel =>
        hostel.p_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.p_blockno.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [hostels, searchQuery]);

  const renderedCards = useMemo(() => {
    return filteredHostels.map((hostel, index) => (
      <AnimatedCard key={hostel.p_hostelid} index={index % 9}>
        <div className={styles.hostelCard} style={{ animationDelay: '0s' }}>
          <div className={styles.cardImage}>
            <img
              src={hostel.images && hostel.images.length > 0 ? hostel.images[0] : DEFAULT_IMAGE}
              alt={hostel.p_name}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_IMAGE;
              }}
            />
            <div className={styles.cardBadges}>
              {hostel.p_hosteltype === "Portion" && (
                <span className={styles.acBadge}>Portion</span>
              )}
              {hostel.p_messprovide && (
                <span className={styles.messBadge}>Mess</span>
              )}
              {hostel.p_isparking && (
                <span className={styles.parkingBadge}>Parking</span>
              )}
              {hostel.p_geezerflag && (
                <span className={styles.geyserBadge}>Geyser</span>
              )}
              {hostel.available_rooms !== -1 && hostel.available_rooms < 5 && (
                <span className={styles.roomsBadge}>
                  Only {hostel.available_rooms} left
                </span>
              )}
            </div>
          </div>

          <div className={styles.cardContent}>
            <h3>{hostel.p_name}</h3>
            <p className={styles.cardAddress}>
              <i className="fa-solid fa-location-dot"></i>
              Block {hostel.p_blockno}, House {hostel.p_houseno}
              {hostel.distance_from_university !== -1 && (
                <span className={styles.distance}>
                  • {formatValue(hostel.distance_from_university, { isDistance: true })} from FAST
                </span>
              )}
            </p>

            <div className={styles.cardStats}>
              <div className={styles.statItem}>
                <i className="fa-solid fa-money-bill-wave"></i>
                <div>
                  <span className={styles.statLabel}>Monthly Rent</span>
                  <span className={styles.statValue}>
                    {formatValue(hostel.monthly_rent, { isCurrency: true })}
                  </span>
                </div>
              </div>

              <div className={styles.statItem}>
                <i className="fa-solid fa-star"></i>
                <div>
                  <span className={styles.statLabel}>Rating</span>
                  <span className={styles.statValue}>
                    {formatRating(hostel.rating)}
                  </span>
                </div>
              </div>

              <div className={styles.statItem}>
                <i className="fa-solid fa-door-closed"></i>
                <div>
                  <span className={styles.statLabel}>Total Rooms</span>
                  <span className={styles.statValue}>
                    {formatRooms(hostel.available_rooms)}
                  </span>
                </div>
              </div>
            </div>

            {/* cardDetails section removed to reduce card size */}

            <div className={styles.cardButtons}>
              <button
                className={styles.viewBtn}
                onClick={() => handleViewDetails(hostel.p_hostelid)}
              >
                <i className="fa-solid fa-eye"></i> View Details
              </button>
              <button
                className={styles.ownerBtn}
                onClick={() => handleViewOwner(hostel.p_hostelid)}
              >
                <i className="fa-solid fa-user-tie"></i> View Owner
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>
    ));
  }, [filteredHostels, handleViewDetails, handleViewOwner]);

  if (error && hostels.length === 0 && !loading) {
    return (
      <div className={styles.errorContainer}>
        <i className="fa-solid fa-exclamation-circle"></i>
        <h3>Error Loading Hostels</h3>
        <p>{error}</p>
        <button onClick={handleRetry} className={styles.retryBtn}>
          <i className="fa-solid fa-rotate"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar userId={userId} />

      {showSuggestions && (
        <div
          className={styles.overlay}
          onClick={() => setShowSuggestions(false)}
        />
      )}

      <div className={styles.searchSection}>
        <h2>Find the Perfect Hostel</h2>

        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search by hostel name, block, or location..."
              value={searchQuery || ''}
              onChange={(e) => {
                setSearchQuery(e.target.value || '');
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className={styles.searchBtn}>
              Search
            </button>
          </div>

          {showSuggestions && searchQuery && (
            <div className={styles.suggestionsDropdown}>
              {searchSuggestions.map(hostel => (
                <div
                  key={hostel.p_hostelid}
                  className={styles.suggestionItem}
                  onClick={() => {
                    setSearchQuery(hostel.p_name);
                    setShowSuggestions(false);
                  }}
                >
                  <i className="fa-solid fa-building"></i>
                  <div>
                    <strong>{hostel.p_name}</strong>
                    <small>{hostel.p_blockno}, {hostel.p_houseno}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        <div className={styles.filtersSection}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label>Max Rent (PKR)</label>
              <input
                type="number"
                placeholder="e.g., 15000"
                value={filters.maxRent}
                onChange={(e) => handleFilterChange('maxRent', e.target.value)}
                min="0"
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Max Distance (km)</label>
              <input
                type="number"
                placeholder="e.g., 2.5"
                step="0.1"
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', e.target.value)}
                min="0"
              />
            </div>

            <div className={styles.filterGroup}>
              <label>Hostel Type</label>
              <select
                value={filters.hostelType}
                onChange={(e) => handleFilterChange('hostelType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Portion">Portion</option>
                <option value="Building">Building</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Min Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.hasParking === true}
                  onChange={(e) => handleFilterChange('hasParking', e.target.checked ? true : null)}
                />
                <span style={{position: 'relative', bottom: '4px'}}> Parking Available </span>
              </label>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.hasMess === true}
                  onChange={(e) => handleFilterChange('hasMess', e.target.checked ? true : null)}
                />
                <span style={{position: 'relative', bottom: '4px'}}> Mess Provided</span>
              </label>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.hasGeyser === true}
                  onChange={(e) => handleFilterChange('hasGeyser', e.target.checked ? true : null)}
                />
                <span style={{position: 'relative', bottom: '4px'}}> Geyser Available</span>
              </label>
            </div>

            <div className={styles.filterGroup}>
              <button style={{position: 'relative', bottom: '20px'}} onClick={clearFilters} className={styles.clearBtn}>
                <i className="fa-solid fa-times"></i> Clear All Filters
              </button>
            </div>
          </div>
        </div>

        <div className={styles.resultsInfo}>
          <p>
            <i className="fa-solid fa-list"></i>
            Showing {filteredHostels.length} of {hostels.length} hostels
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
      </div>

      <div className={styles.hostelGrid} ref={hostelGridRef}>
        {loading ? (
          <SkeletonCards />
        ) : filteredHostels.length === 0 ? (
          <div className={styles.noResults}>
            <i className="fa-solid fa-search"></i>
            <h3>No hostels found</h3>
            <p>Try adjusting your filters or search term</p>
            <div className={styles.noResultsActions}>
              <button onClick={clearFilters} className={styles.resetBtn}>
                Clear All Filters
              </button>
              <button
                onClick={() => navigate(`/student/suggestions?user_id=${userId}`)}
                className={styles.suggestionsLinkBtn}
              >
                View Suggestions
              </button>
            </div>
          </div>
        ) : (
          renderedCards
        )}
      </div>
    </div>
  );
};

export default StudentHome;