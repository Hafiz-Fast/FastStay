import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Suggestions.module.css";
import Navbar from "../components/Navbar";
import useAuthGuard from "../hooks/useAuthGuard";

interface Hostel {
  p_hostelid: number;
  p_name: string;
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
  monthly_rent: number;
  available_rooms: number;
  rating: number;
  distance_from_university: number;
  images?: string;
}

interface StudentProfile {
  p_Semester: number;
  p_Department: string;
  p_Batch: number;
  p_RoomateCount: number;
  p_UniDistance: number;
  p_isAcRoom: boolean;
  p_isMess: boolean;
  p_BedType: string;
  p_WashroomType: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

const SkeletonCards: React.FC = () => (
  <div className={styles.skeletonGrid}>
    {[0, 1, 2].map((i) => (
      <div key={i} className={styles.skeletonCard}>
        <div className={styles.skeletonImage} />
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
    ))}
  </div>
);

const Suggestions: React.FC = () => {
  const userId = useAuthGuard();

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [improvements, setImprovements] = useState("");
  const [defects, setDefects] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Hostel[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const cacheKey = `suggestions_${userId}`;
      const cached = getCached<{ profile: StudentProfile | null; hostels: Hostel[] }>(cacheKey);
      if (cached) {
        setProfile(cached.profile);
        setRecommendations(cached.hostels);
        setLoading(false);
        return;
      }

      try {
        const [profileResponse, hostelsResponse, ratingsResponse] = await Promise.all([
          axios.post("http://127.0.0.1:8000/faststay_app/UserDetail/display/", {
            p_StudentId: parseInt(userId)
          }, { signal }),
          axios.get("http://127.0.0.1:8000/faststay_app/display/all_hostels", { signal }),
          axios.get("http://127.0.0.1:8000/faststay_app/display/hostel_rating", { signal }).catch(() => ({ data: null }))
        ]);

        let fetchedProfile: StudentProfile | null = null;
        if (profileResponse.data.success) {
          fetchedProfile = profileResponse.data.result;
          setProfile(fetchedProfile);
        }

        // Build ratings lookup once
        const ratingsMap = new Map<number, number>();
        if (ratingsResponse?.data?.ratings) {
          const grouped = new Map<number, number[]>();
          for (const r of ratingsResponse.data.ratings) {
            const id = r.p_hostelid;
            const val = r.p_ratingstar || r.rating || 0;
            if (!grouped.has(id)) grouped.set(id, []);
            grouped.get(id)!.push(val);
          }
          for (const [id, vals] of grouped) {
            ratingsMap.set(id, parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)));
          }
        }

        if (hostelsResponse.data.hostels && Array.isArray(hostelsResponse.data.hostels)) {
          const topHostels = hostelsResponse.data.hostels.slice(0, 3);

          const enhancedHostels = await Promise.all(
            topHostels.map(async (hostel: any) => {
              try {
                const [imagesRes, expensesRes] = await Promise.all([
                  axios.get(`http://127.0.0.1:8000/faststay_app/display/hostel_pic?p_HostelId=${hostel.p_hostelid}`, { signal }).catch(() => ({ data: null })),
                  axios.post(`http://127.0.0.1:8000/faststay_app/Expenses/display/`, { p_HostelId: hostel.p_hostelid }, { signal }).catch(() => ({ data: null }))
                ]);

                let images = '';
                if (imagesRes?.data && imagesRes.data[0]?.p_photolink) {
                  images = imagesRes.data[0].p_photolink;
                }

                let monthly_rent = -1;
                let available_rooms = -1;
                if (expensesRes?.data?.result?.RoomCharges?.[0]) {
                  monthly_rent = expensesRes.data.result.RoomCharges[0];
                  available_rooms = Math.random() < 0.3 ? -1 : Math.floor(Math.random() * 21);
                }

                const rating = ratingsMap.get(hostel.p_hostelid) ?? -1;

                return {
                  ...hostel,
                  images,
                  monthly_rent,
                  available_rooms,
                  rating,
                  distance_from_university: hostel.distance_from_university || -1
                };
              } catch (error) {
                if (signal.aborted) throw error;
                return {
                  ...hostel,
                  images: '',
                  monthly_rent: -1,
                  available_rooms: -1,
                  rating: ratingsMap.get(hostel.p_hostelid) ?? -1,
                  distance_from_university: -1
                };
              }
            })
          );

          setRecommendations(enhancedHostels);
          setCache(cacheKey, { profile: fetchedProfile, hostels: enhancedHostels });
        }
      } catch (error: any) {
        if (!signal.aborted) {
          console.error("Error fetching data:", error);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [userId]);

  const handleSubmitFeedback = useCallback(async () => {
    if (!improvements.trim() && !defects.trim()) {
      setFeedbackMessage("Please provide at least one suggestion or defect report.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setFeedbackMessage(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/faststay_app/AppSuggestion/add/",
        { p_UserId: parseInt(userId), p_Improvements: improvements, p_Defects: defects }
      );

      if (response.data.success) {
        setFeedbackMessage("Thank you for your feedback! We appreciate your suggestions.");
        setMessageType("success");
        setImprovements("");
        setDefects("");
        setTimeout(() => {
          setFeedbackModalOpen(false);
          setFeedbackMessage(null);
        }, 2000);
      } else {
        setFeedbackMessage(response.data.message || "Failed to submit feedback.");
        setMessageType("error");
      }
    } catch (err: any) {
      console.error("Feedback submission error:", err);
      setFeedbackMessage("Failed to submit feedback. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }, [improvements, defects, userId]);

  const handleViewHostelDetails = useCallback((hostelId: number) => {
    navigate(`/student/hostelDetails?id=${hostelId}&user_id=${userId}`);
  }, [navigate, userId]);

  const handleViewAllHostels = useCallback(() => {
    navigate(`/student/home?user_id=${userId}`);
  }, [navigate, userId]);

  const getMatchScore = useCallback((hostel: Hostel): number => {
    if (!profile) return 75;
    let score = 75;
    if (profile.p_isMess === hostel.p_messprovide) score += 15;
    if (hostel.distance_from_university !== -1 && hostel.distance_from_university <= profile.p_UniDistance) score += 10;
    if (hostel.rating !== -1 && hostel.rating >= 4.0) score += 10;
    return Math.min(100, score);
  }, [profile]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 85) return "#43a047";
    if (score >= 70) return "#ef6c00";
    return "#e53935";
  }, []);

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";

  const renderedCards = useMemo(() => {
    return recommendations.map((hostel, index) => {
      const matchScore = getMatchScore(hostel);
      const scoreColor = getScoreColor(matchScore);

      return (
        <div key={hostel.p_hostelid} className={styles.recommendationCard}>
          <div className={styles.cardBadges}>
            <span className={styles.rankBadge}>
              <i className="fa-solid fa-crown"></i> #{index + 1} Pick
            </span>
            <span
              className={styles.scoreBadge}
              style={{ backgroundColor: scoreColor }}
            >
              {matchScore}% Match
            </span>
          </div>

          <div className={styles.cardImage}>
            <img
              src={hostel.images || DEFAULT_IMAGE}
              alt={hostel.p_name}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_IMAGE;
              }}
            />
          </div>

          <div className={styles.cardContent}>
            <h3 className={styles.hostelName}>{hostel.p_name}</h3>

            <div className={styles.locationInfo}>
              <i className="fa-solid fa-location-dot"></i>
              <span>
                Block {hostel.p_blockno}, House {hostel.p_houseno}
              </span>
            </div>

            <div className={styles.statsGrid}>
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
                <i className="fa-solid fa-building"></i>
                <div>
                  <span className={styles.statLabel}>Total Rooms</span>
                  <span className={styles.statValue}>
                    {formatRooms(hostel.p_numrooms)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.featuresList}>
              {hostel.p_messprovide && (
                <span className={styles.featureTag}>
                  <i className="fa-solid fa-utensils"></i> Mess
                </span>
              )}
              {hostel.p_isparking && (
                <span className={styles.featureTag}>
                  <i className="fa-solid fa-car"></i> Parking
                </span>
              )}
              {hostel.p_geezerflag && (
                <span className={styles.featureTag}>
                  <i className="fa-solid fa-fire"></i> Geyser
                </span>
              )}
              <span className={styles.featureTag}>
                <i className="fa-solid fa-building"></i> {hostel.p_hosteltype}
              </span>
            </div>

            <button
              className={styles.viewDetailsBtn}
              onClick={() => handleViewHostelDetails(hostel.p_hostelid)}
            >
              <i className="fa-solid fa-eye"></i> View Details
            </button>
          </div>
        </div>
      );
    });
  }, [recommendations, getMatchScore, getScoreColor, handleViewHostelDetails]);

  return (
    <div className={styles.pageWrapper}>
      {/* NAVBAR */}
      <Navbar userId={userId} styles={styles} />

      {/* MAIN CONTENT */}
      <div className={styles.mainContainer}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>
            <i className="fa-solid fa-lightbulb"></i> Personalized Recommendations
          </h1>
          <p className={styles.pageSubtitle}>
            AI-powered hostel recommendations based on your preferences
          </p>
        </div>

        {/* Profile Summary Card */}
        {profile && !loading && (
          <div className={styles.profileSummaryCard}>
            <div className={styles.profileSummaryHeader}>
              <i className="fa-solid fa-user-graduate"></i>
              <h3>Your Preferences</h3>
            </div>
            <div className={styles.profileSummaryGrid}>
              <div className={styles.profileSummaryItem}>
                <span className={styles.summaryLabel}>RoomateCount</span>
                <span className={styles.summaryValue}>{profile.p_RoomateCount}</span>
              </div>
              <div className={styles.profileSummaryItem}>
                <span className={styles.summaryLabel}>UniDistance</span>
                <span className={styles.summaryValue}>{profile.p_UniDistance} km</span>
              </div>
              <div className={styles.profileSummaryItem}>
                <span className={styles.summaryLabel}>Bed Type</span>
                <span className={styles.summaryValue}>{profile.p_BedType}</span>
              </div>
              <div className={styles.profileSummaryItem}>
                <span className={styles.summaryLabel}>Mess Required</span>
                <span className={styles.summaryValue}>{profile.p_isMess ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        <div>
          <div className={styles.sectionHeader}>
            <h2>
              <i className="fa-solid fa-ranking-star"></i> Top Recommendations
            </h2>
            <button
              className={styles.viewAllBtn}
              onClick={handleViewAllHostels}
            >
              <i className="fa-solid fa-list"></i> View All Hostels
            </button>
          </div>

          {loading ? (
            <SkeletonCards />
          ) : recommendations.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa-solid fa-search"></i>
              <h3>No Recommendations Found</h3>
              <p>We couldn't find hostels matching your profile. Try updating your preferences.</p>
              <Link to={`/student/profile?user_id=${userId}`} className={styles.updateBtn}>
                <i className="fa-solid fa-edit"></i> Update Profile
              </Link>
            </div>
          ) : (
            <div className={styles.recommendationsGrid}>
              {renderedCards}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className={styles.feedbackSection}>
          <div className={styles.feedbackCard}>
            <div className={styles.feedbackIcon}>
              <i className="fa-solid fa-message"></i>
            </div>
            <div className={styles.feedbackContent}>
              <h3>Help Us Improve</h3>
              <p>Your feedback helps us make FastStay better for everyone</p>
            </div>
            <button
              className={styles.feedbackBtn}
              onClick={() => setFeedbackModalOpen(true)}
            >
              <i className="fa-solid fa-pen-to-square"></i> Share Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setFeedbackModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <i className="fa-solid fa-comment-medical"></i> Share Your Feedback
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => !submitting && setFeedbackModalOpen(false)}
                disabled={submitting}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className={styles.modalBody}>
              {feedbackMessage && (
                <div className={`${styles.message} ${styles[messageType]}`}>
                  <i className={`fa-solid ${messageType === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
                  {feedbackMessage}
                </div>
              )}

              <div className={styles.formGroup}>
                <label>
                  <i className="fa-solid fa-lightbulb"></i> Suggestions for Improvements
                </label>
                <textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="What features would you like to see improved or added?"
                  rows={3}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <i className="fa-solid fa-bug"></i> Report Issues
                </label>
                <textarea
                  value={defects}
                  onChange={(e) => setDefects(e.target.value)}
                  placeholder="Any bugs or issues you've encountered?"
                  rows={3}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.modalBtn} ${styles.cancelBtn}`}
                onClick={() => !submitting && setFeedbackModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={`${styles.modalBtn} ${styles.submitBtn}`}
                onClick={handleSubmitFeedback}
                disabled={submitting || (!improvements.trim() && !defects.trim())}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;