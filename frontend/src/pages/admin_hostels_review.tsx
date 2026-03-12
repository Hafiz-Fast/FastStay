import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHostelDetails, deleteHostel, approveHostel, disapproveHostel, CACHE_HOSTEL_DETAIL, type HostelTableRow, getHostelExpenses, getHostelSecurityInfo, getHostelMessInfo, type HostelExpenses, getHostelRooms, type HostelRoom, getHostelRoomPics, type RoomPicItem, getHostelReviews, type HostelReview } from "../api/admin_hostels_review";
import { cacheGet, cacheSet } from "../utils/cache";
import { getAdminAccessCode } from "../utils/auth";
import { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import "../AdminViewHostels.css";
import AdminSideNavbar from "../components/AdminSideNavbar";

const AdminViewHostels: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState<HostelTableRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDisapproveConfirm, setShowDisapproveConfirm] = useState(false);
  const [disapproveLoading, setDisapproveLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'facilities' | 'rooms' | 'reviews'>('overview');
  const [expenses, setExpenses] = useState<HostelExpenses | null>(null);
  const [securityInfo, setSecurityInfo] = useState<Record<string, any> | null>(null);
  const [messInfo, setMessInfo] = useState<Record<string, any> | null>(null);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [roomPics, setRoomPics] = useState<RoomPicItem[]>([]);
  const [reviews, setReviews] = useState<HostelReview[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const tabsLoadedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const hostelId = parseInt(id || "0");
    setActionError(null);
    //phases
    // Phase 1: instant render from cache
    const cached = cacheGet<HostelTableRow>(CACHE_HOSTEL_DETAIL(hostelId));
    if (cached) {
      setHostel(cached);
      if (cached.photos && cached.photos.length > 0) setSelectedImage(cached.photos[0]);
      setIsApproved(Boolean(cached.approved));
      setLoading(false);
    }

    // Phase 2: background refresh
    getHostelDetails(hostelId, true)
      .then(hostelDetails => {
        if (hostelDetails) {
          setHostel(hostelDetails);
          if (hostelDetails.photos && hostelDetails.photos.length > 0) {
            setSelectedImage(hostelDetails.photos[0]);
            setCurrentImageIndex(0);
          }
          setIsApproved(Boolean(hostelDetails.approved));
        } else if (!cached) {
          setError("Hostel not found");
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        if (!cached) setError("Failed to load hostel details");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    tabsLoadedRef.current = {};
    setActiveTab('overview');
    setExpenses(null);
    setSecurityInfo(null);
    setMessInfo(null);
    setRooms([]);
    setRoomPics([]);
    setReviews([]);
  }, [id]);

  useEffect(() => {
    const hostelId = parseInt(id || '0');
    if (!hostelId) return;
    if (activeTab === 'expenses' && !tabsLoadedRef.current['expenses']) {
      tabsLoadedRef.current = { ...tabsLoadedRef.current, expenses: true };
      setTabLoading(true);
      getHostelExpenses(hostelId)
        .then(data => { setExpenses(data); setTabLoading(false); })
        .catch(() => setTabLoading(false));
    } else if (activeTab === 'facilities' && !tabsLoadedRef.current['facilities']) {
      tabsLoadedRef.current = { ...tabsLoadedRef.current, facilities: true };
      setTabLoading(true);
      Promise.all([getHostelSecurityInfo(hostelId), getHostelMessInfo(hostelId)])
        .then(([sec, mess]) => { setSecurityInfo(sec); setMessInfo(mess); setTabLoading(false); })
        .catch(() => setTabLoading(false));
    } else if (activeTab === 'rooms' && !tabsLoadedRef.current['rooms']) {
      tabsLoadedRef.current = { ...tabsLoadedRef.current, rooms: true };
      setTabLoading(true);
      Promise.all([getHostelRooms(hostelId), getHostelRoomPics(hostelId)])
        .then(([data, pics]) => { setRooms(data); setRoomPics(pics); setTabLoading(false); })
        .catch(() => setTabLoading(false));
    } else if (activeTab === 'reviews' && !tabsLoadedRef.current['reviews']) {
      tabsLoadedRef.current = { ...tabsLoadedRef.current, reviews: true };
      setTabLoading(true);
      getHostelReviews(hostelId)
        .then(data => { setReviews(data); setTabLoading(false); })
        .catch(() => setTabLoading(false));
    }
  }, [activeTab, id]);

  const handleApprove = async () => {
    if (!hostel) return;

    const adminSecret = getAdminAccessCode();
    if (!adminSecret) {
      setActionError("Admin access code not found. Please log out and log in again.");
      return;
    }

    try {
      setApproveLoading(true);
      setActionError(null);

      const success = await approveHostel(hostel.id, adminSecret);

      if (success) {
        setIsApproved(true);
        setShowApproveSuccess(true);
        // Update the cached hostel so the approval state survives navigation
        const updated = { ...hostel, approved: true };
        setHostel(updated);
        cacheSet(CACHE_HOSTEL_DETAIL(hostel.id), updated);
        setTimeout(() => setShowApproveSuccess(false), 3000);
      } else {
        setActionError("Failed to approve hostel. Please try again.");
      }
    } catch (err) {
      console.error("Approve error:", err);
      setActionError("Error approving hostel. Please try again.");
    } finally {
      setApproveLoading(false);
    }
  };


  // In your AdminViewHostels component, update the handleDelete function:

const handleDelete = async () => {
    if (!hostel) return;

    try {
        setDeleteLoading(true);
        setActionError(null);

        console.log(`Deleting hostel ID: ${hostel.id}`);

        // Call the updated API function
        const success = await deleteHostel(hostel.id);

        if (success) {
            // Show success message
            setActionError("Hostel deleted successfully! Redirecting...");

            // Redirect to hostels list after 1.5 seconds
            setTimeout(() => {
                navigate("/admin/hostels");
            }, 1500);
        } else {
            setActionError("Failed to delete hostel. Hostel may not exist or there was a server error.");
        }
    } catch (err) {
        console.error("Delete error:", err);
        setActionError("Error deleting hostel. Please try again.");
    } finally {
        setDeleteLoading(false);
        setShowDeleteConfirm(false);
    }
};

  const handleDisapprove = async () => {
    if (!hostel) return;
    const adminSecret = getAdminAccessCode();
    if (!adminSecret) {
      setActionError("Admin access code not found. Please log out and log in again.");
      setShowDisapproveConfirm(false);
      return;
    }
    try {
      setDisapproveLoading(true);
      setActionError(null);
      const success = await disapproveHostel(hostel.id, adminSecret);
      if (success) {
        setIsApproved(false);
        const updated = { ...hostel, approved: false };
        setHostel(updated);
        cacheSet(CACHE_HOSTEL_DETAIL(hostel.id), updated);
        setShowApproveSuccess(false);
        setActionError("Hostel disapproved successfully!");
        setTimeout(() => setActionError(null), 3000);
      } else {
        setActionError("Failed to disapprove hostel. Please try again.");
      }
    } catch (err) {
      console.error("Disapprove error:", err);
      setActionError("Error disapproving hostel. Please try again.");
    } finally {
      setDisapproveLoading(false);
      setShowDisapproveConfirm(false);
    }
  };

  const handleNextImage = () => {
    if (hostel?.photos && hostel.photos.length > 0) {
      const nextIndex = (currentImageIndex + 1) % hostel.photos.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(hostel.photos[nextIndex]);
    }
  };

  const handlePrevImage = () => {
    if (hostel?.photos && hostel.photos.length > 0) {
      const prevIndex = (currentImageIndex - 1 + hostel.photos.length) % hostel.photos.length;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(hostel.photos[prevIndex]);
    }
  };

  const handleThumbnailClick = (image: string, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const formatKey = (key: string) => key
    .replace(/^p_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  // Show only error on full page if there's a critical error
  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
        <h2>{error}</h2>
        <Link to="/admin/hostels" style={{ color: "#f8f3e7", textDecoration: "underline" }}>
          Go back to all hostels
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ADMIN SIDE NAVBAR */}
      <AdminSideNavbar active="hostels" />

      <div className={styles.mainContent}>
      <div className={styles.container}>
          {/* Back button */}
          <div style={{ marginBottom: "20px" }}>
            <Link
              to="/admin/hostels"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#5c3d2e",
                color: "#f8f3e7",
                textDecoration: "none",
                borderRadius: "8px",
                marginBottom: "20px"
              }}
            >
              <i className="fa-solid fa-arrow-left"></i> Back to All Hostels
            </Link>
          </div>

          {/* Action Messages */}
          {showApproveSuccess && (
            <div className="custom-success-message">
              <i className="fa-solid fa-check-circle"></i>
              <span>Hostel approved successfully!</span>
            </div>
          )}

          {actionError && (
            <div className={`custom-message ${actionError.includes("successfully") ? "custom-success-message" : "custom-error-message"}`}>
              <i className={`fa-solid ${actionError.includes("successfully") ? "fa-check-circle" : "fa-exclamation-circle"}`}></i>
              <span>{actionError}</span>
            </div>
          )}

          {/* Loading state within the page */}
          {loading && !hostel ? (
            <div className="custom-card">
              <h2 className="custom-title">
                <i className="fa-solid fa-building-circle-check"></i>{" "}
                <SkeletonBlock width="260px" height="24px" />
              </h2>
              <SkeletonBlock width="200px" height="14px" />

              <div className="custom-card" style={{ marginTop: "20px" }}>
                <h3 className="custom-section-title">Hostel Information</h3>
                <div className="custom-info-grid">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="custom-info-box">
                      <SkeletonBlock width="120px" height="13px" />
                      <SkeletonBlock width="90%" height="20px" />
                    </div>
                  ))}
                </div>

                <h3 className="custom-section-title" style={{ marginTop: "20px" }}>Hostel Pictures</h3>
                <SkeletonBlock width="100%" height="300px" />

                <h3 className="custom-section-title" style={{ marginTop: "20px" }}>Hostel Manager Information</h3>
                <div className="custom-info-grid">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="custom-info-box">
                      <SkeletonBlock width="120px" height="13px" />
                      <SkeletonBlock width="90%" height="20px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : !hostel ? (
            <div className="custom-card">
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center"
              }}>
                <i className="fa-solid fa-building" style={{
                  fontSize: "32px",
                  marginBottom: "15px",
                  color: "#999"
                }}></i>
                <h3 style={{ marginBottom: "10px", color: "#666" }}>No hostel data available</h3>
                <p style={{ color: "#666", marginBottom: "20px" }}>The requested hostel could not be found</p>
                <Link
                  to="/admin/hostels"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    backgroundColor: "#5c3d2e",
                    color: "#f8f3e7",
                    textDecoration: "none",
                    borderRadius: "8px"
                  }}
                >
                  <i className="fa-solid fa-arrow-left"></i> Go back to all hostels
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="custom-title">
                <i className="fa-solid fa-building-circle-check"></i> Review Hostel: {hostel.name}
                {isApproved && (
                  <span className="custom-approved-badge">
                    <i className="fa-solid fa-check"></i> Approved
                  </span>
                )}
              </h2>
              <p className="custom-subtitle">
                Hostel ID: {hostel.id} | Verify details before approval.
              </p>

              {/* TAB NAVIGATION */}
              <div className="review-tab-bar" style={{ display: 'flex', gap: '4px', marginBottom: '22px', background: '#f0e7dc', borderRadius: '10px', padding: '5px' }}>
                {([
                  { key: 'overview' as const, label: 'Overview', icon: 'fa-building' },
                  { key: 'expenses' as const, label: 'Expenses', icon: 'fa-money-bill-wave' },
                  { key: 'facilities' as const, label: 'Security & Mess', icon: 'fa-shield-halved' },
                  { key: 'rooms' as const, label: 'Rooms', icon: 'fa-door-open' },
                  { key: 'reviews' as const, label: 'Reviews', icon: 'fa-star' },
                ]).map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                    flex: 1, padding: '10px 14px', borderRadius: '7px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
                    background: activeTab === tab.key
                      ? '#5c3d2e'
                      : tab.key === 'rooms'
                        ? 'rgba(92,61,46,0.12)'
                        : tab.key === 'reviews'
                          ? 'rgba(245,166,35,0.10)'
                          : 'transparent',
                    color: activeTab === tab.key ? '#f8f3e7' : '#6b4e38',
                    border: tab.key === 'rooms' && activeTab !== 'rooms'
                      ? '1.5px dashed #a07850'
                      : tab.key === 'reviews' && activeTab !== 'reviews'
                        ? '1.5px dashed #f5a623'
                        : 'none',
                    transition: 'all 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  }}>
                    <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                    {tab.key === 'rooms' && activeTab !== 'rooms' && (
                      <span style={{ background: '#8d5f3a', color: '#fff', borderRadius: '10px', fontSize: '10px', padding: '1px 7px', marginLeft: '2px', fontWeight: 600 }}>
                        {hostel.rooms}
                      </span>
                    )}
                    {tab.key === 'reviews' && activeTab !== 'reviews' && reviews.length > 0 && (
                      <span style={{ background: '#f5a623', color: '#fff', borderRadius: '10px', fontSize: '10px', padding: '1px 7px', marginLeft: '2px', fontWeight: 600 }}>
                        {reviews.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
              <div className="custom-card" key={hostel.id}>
                {/* HOSTEL BASIC INFO */}
                <h3 className="custom-section-title">Hostel Information</h3>
                <div className="custom-info-grid">
                  <div className="custom-info-box">
                    <div className="custom-info-label">Google Map Location</div>
                    <div className="custom-info-value">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${hostel.houseNo} ${hostel.blockNo}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Maps
                      </a>
                    </div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Type</div>
                    <div className="custom-info-value">{hostel.type}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Block No</div>
                    <div className="custom-info-value">{hostel.blockNo}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">House No</div>
                    <div className="custom-info-value">{hostel.houseNo}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Parking Available</div>
                    <div className="custom-info-value">{hostel.parking ? "Yes" : "No"}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Mess Provide</div>
                    <div className="custom-info-value">{hostel.messProvide ? "Yes" : "No"}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Geezer Available</div>
                    <div className="custom-info-value">{hostel.geezer ? "Yes" : "No"}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Number of Rooms</div>
                    <div className="custom-info-value">{hostel.rooms}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Number of Floors</div>
                    <div className="custom-info-value">{hostel.floors}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Water Timings</div>
                    <div className="custom-info-value">{hostel.waterTimings}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Cleanliness Tenure</div>
                    <div className="custom-info-value">{hostel.cleanlinessTenure}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Issue Resolving Tenure</div>
                    <div className="custom-info-value">{hostel.issueResolvingTenure}</div>
                  </div>
                </div>

                {/* ENHANCED PICTURE GALLERY */}
                <h3 className="custom-section-title">Hostel Pictures</h3>
                {hostel.photos && hostel.photos.length > 0 ? (
                  <div className="custom-image-gallery">
                    {/* Main Image Display */}
                    <div className="custom-main-image-container">
                      <div className="custom-image-counter">
                        {currentImageIndex + 1} / {hostel.photos.length}
                      </div>
                      <img
                        src={selectedImage || hostel.photos[0]}
                        alt={`${hostel.name} - Main view`}
                        className="custom-main-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x500?text=Image+Not+Available";
                        }}
                      />

                      {/* Navigation Arrows (only show if more than 1 image) */}
                      {hostel.photos.length > 1 && (
                        <>
                          <button
                            className="custom-nav-btn custom-prev-btn"
                            onClick={handlePrevImage}
                          >
                            <i className="fa-solid fa-chevron-left"></i>
                          </button>
                          <button
                            className="custom-nav-btn custom-next-btn"
                            onClick={handleNextImage}
                          >
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="custom-thumbnail-grid">
                      {hostel.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className={`custom-thumbnail-container ${currentImageIndex === idx ? 'custom-thumbnail-active' : ''}`}
                          onClick={() => handleThumbnailClick(photo, idx)}
                        >
                          <img
                            src={photo}
                            alt={`${hostel.name} - Thumbnail ${idx + 1}`}
                            className="custom-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/100x80?text=Thumb";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="custom-no-images">
                    <img
                      src="https://via.placeholder.com/600x400?text=No+Images+Available"
                      alt="No images available"
                      className="custom-placeholder-image"
                    />
                    <p>No pictures available for this hostel</p>
                  </div>
                )}

                {/* MANAGER INFO */}
                <h3 className="custom-section-title">Hostel Manager Information</h3>
                <div className="custom-info-grid">
                  <div className="custom-info-box">
                    <div className="custom-info-label">Name</div>
                    <div className="custom-info-value">{hostel.managerName}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Phone</div>
                    <div className="custom-info-value">{hostel.managerPhone}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Manager Education</div>
                    <div className="custom-info-value">{hostel.managerEducation}</div>
                  </div>

                  <div className="custom-info-box">
                    <div className="custom-info-label">Manager Type</div>
                    <div className="custom-info-value">{hostel.managerType}</div>
                  </div>
                </div>

                {/* APPROVAL BUTTONS */}
                <div className="custom-btn-row">
                  {/* LEFT — Delete */}
                  <button
                    className="custom-btn custom-btn-delete"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-trash"></i> Delete Hostel
                      </>
                    )}
                  </button>

                  {/* RIGHT — Approve / approved badge */}
                  {!isApproved ? (
                    <button
                      className="custom-btn custom-btn-approve"
                      onClick={handleApprove}
                      disabled={approveLoading}
                    >
                      {approveLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Approving...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-check"></i> Approve Hostel
                        </>
                      )}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {showApproveSuccess && (
                        <div className="custom-approved-message">
                          <i className="fa-solid fa-check-circle"></i>
                          <span>Hostel approved!</span>
                        </div>
                      )}
                      <button
                        className="custom-btn custom-btn-disapprove"
                        onClick={() => setShowDisapproveConfirm(true)}
                        disabled={disapproveLoading}
                      >
                        {disapproveLoading ? (
                          <><i className="fa-solid fa-spinner fa-spin"></i> Disapproving...</>
                        ) : (
                          <><i className="fa-solid fa-ban"></i> Disapprove</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* EXPENSES TAB */}
              {activeTab === 'expenses' && (
                <div className="custom-card">
                  <h3 className="custom-section-title">
                    <i className="fa-solid fa-money-bill-wave" style={{ marginRight: '8px', color: '#8d5f3a' }}></i>
                    Financial Breakdown
                  </h3>
                  {tabLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '26px' }}></i>
                      <p style={{ marginTop: '12px' }}>Loading expenses...</p>
                    </div>
                  ) : !expenses ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: '36px', marginBottom: '12px', display: 'block' }}></i>
                      <p>No expense data found for this hostel.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                          background: expenses.isIncludedInRoomCharges ? '#e8f5e9' : '#fff3e0',
                          color: expenses.isIncludedInRoomCharges ? '#2e7d32' : '#e65100',
                          border: `1px solid ${expenses.isIncludedInRoomCharges ? '#a5d6a7' : '#ffcc80'}`,
                        }}>
                          <i className={`fa-solid ${expenses.isIncludedInRoomCharges ? 'fa-check-circle' : 'fa-circle-xmark'}`}></i>
                          {expenses.isIncludedInRoomCharges ? 'Expenses Included in Room Rent' : 'Expenses Billed Separately'}
                        </span>
                      </div>
                      {expenses.RoomCharges && expenses.RoomCharges.length > 0 && (
                        <div style={{ marginBottom: '22px' }}>
                          <div className="custom-info-label" style={{ marginBottom: '8px' }}>Room Charges (per seater / month)</div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {expenses.RoomCharges.map((charge, idx) => (
                              <span key={idx} style={{ padding: '6px 16px', background: '#f0e7dc', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#3b2c24' }}>
                                {Number(charge).toLocaleString()} PKR
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="custom-info-grid">
                        {([
                          { label: 'Security Charges', value: expenses.SecurityCharges, icon: 'fa-shield-halved' },
                          { label: 'Mess Charges', value: expenses.MessCharges, icon: 'fa-utensils' },
                          { label: 'Kitchen Charges', value: expenses.KitchenCharges, icon: 'fa-fire-burner' },
                          { label: 'Internet Charges', value: expenses.InternetCharges, icon: 'fa-wifi' },
                          { label: 'AC Service Charges', value: expenses.AcServiceCharges, icon: 'fa-snowflake' },
                          { label: 'Electricity Charges', value: expenses.ElectricityCharges, icon: 'fa-bolt' },
                        ] as { label: string; value: number; icon: string }[]).map(item => (
                          <div key={item.label} className="custom-info-box">
                            <div className="custom-info-label">
                              <i className={`fa-solid ${item.icon}`} style={{ marginRight: '6px', color: '#8d5f3a' }}></i>{item.label}
                            </div>
                            <div className="custom-info-value">
                              {item.value != null && item.value > 0 ? `${Number(item.value).toLocaleString()} PKR / month` : 'N/A'}
                            </div>
                          </div>
                        ))}
                        <div className="custom-info-box">
                          <div className="custom-info-label">
                            <i className="fa-solid fa-receipt" style={{ marginRight: '6px', color: '#8d5f3a' }}></i>Electricity Bill Type
                          </div>
                          <div className="custom-info-value">{expenses.ElectricitybillType || 'N/A'}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ROOMS TAB */}
              {activeTab === 'rooms' && (
                <div className="custom-card">
                  <h3 className="custom-section-title">
                    <i className="fa-solid fa-door-open" style={{ marginRight: '8px', color: '#8d5f3a' }}></i>
                    Rooms ({rooms.length})
                  </h3>
                  {tabLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '26px' }}></i>
                      <p style={{ marginTop: '12px' }}>Loading rooms...</p>
                    </div>
                  ) : rooms.length === 0 ? (
                    <div style={{ padding: '24px 0', color: '#888', fontSize: '14px' }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>No rooms registered for this hostel yet.
                    </div>
                  ) : (
                    (() => {
                      const byFloor = rooms.reduce<Record<number, HostelRoom[]>>((acc, r) => {
                        if (!acc[r.p_FloorNo]) acc[r.p_FloorNo] = [];
                        acc[r.p_FloorNo].push(r);
                        return acc;
                      }, {});
                      return Object.keys(byFloor)
                        .sort((a, b) => Number(a) - Number(b))
                        .map(floor => (
                          <div key={floor} style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                              <div style={{ background: '#5c3d2e', color: '#f8f3e7', borderRadius: '8px', padding: '5px 14px', fontSize: '13px', fontWeight: 600 }}>
                                <i className="fa-solid fa-layer-group" style={{ marginRight: '6px' }}></i>Floor {floor}
                              </div>
                              <div style={{ height: '1px', flex: 1, background: '#dbc8b8' }} />
                              <span style={{ fontSize: '12px', color: '#8d7060' }}>{byFloor[Number(floor)].length} room(s)</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                              {byFloor[Number(floor)].map((room, idx) => {
                                const picUrl = (
                                  roomPics.find(p => p.p_RoomSeaterNo === room.p_SeaterNo)
                                  ?? roomPics.find(p => p.p_PhotoLink != null)
                                )?.p_PhotoLink ?? null;
                                return (
                                <div key={idx} className="custom-info-box" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden' }}>
                                  {/* Room pic */}
                                  {picUrl ? (
                                    <img src={picUrl} alt={`Room ${idx + 1}`} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100px', background: '#e8ddd4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                      <i className="fa-solid fa-image" style={{ fontSize: '24px', color: '#b5a090' }}></i>
                                      <span style={{ fontSize: '11px', color: '#b5a090' }}>No photo</span>
                                    </div>
                                  )}
                                  <div style={{ padding: '14px 16px' }}>
                                  {/* Rent header */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                    <div style={{ fontSize: '13px', color: '#6a5c54' }}>Room #{idx + 1}</div>
                                    <div style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', padding: '4px 12px', fontWeight: 700, fontSize: '14px' }}>
                                      PKR {Number(room.p_RoomRent).toLocaleString()}
                                      <span style={{ fontSize: '11px', fontWeight: 400, marginLeft: '3px' }}>/mo</span>
                                    </div>
                                  </div>
                                  {/* Key stats row */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                    <div>
                                      <div className="custom-info-label">Capacity</div>
                                      <div className="custom-info-value" style={{ fontSize: '14px' }}>
                                        <i className="fa-solid fa-users" style={{ marginRight: '5px', color: '#8d5f3a' }}></i>{room.p_SeaterNo} seater
                                      </div>
                                    </div>
                                    <div>
                                      <div className="custom-info-label">Bed Type</div>
                                      <div className="custom-info-value" style={{ fontSize: '14px' }}>
                                        <i className="fa-solid fa-bed" style={{ marginRight: '5px', color: '#8d5f3a' }}></i>{room.p_BedType}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="custom-info-label">Washroom</div>
                                      <div className="custom-info-value" style={{ fontSize: '14px' }}>
                                        <i className="fa-solid fa-shower" style={{ marginRight: '5px', color: '#8d5f3a' }}></i>{room.p_WashroomType}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="custom-info-label">Cupboard</div>
                                      <div className="custom-info-value" style={{ fontSize: '14px' }}>
                                        <i className="fa-solid fa-box-archive" style={{ marginRight: '5px', color: '#8d5f3a' }}></i>{room.p_CupboardType}
                                      </div>
                                    </div>
                                  </div>
                                  {/* Amenity pills */}
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {[
                                      { flag: room.p_isVentilated, label: 'Ventilated', icon: 'fa-wind' },
                                      { flag: room.p_isCarpet, label: 'Carpet', icon: 'fa-rug' },
                                      { flag: room.p_isMiniFridge, label: 'Mini Fridge', icon: 'fa-snowflake' },
                                    ].map(am => (
                                      <span key={am.label} style={{
                                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
                                        background: am.flag ? '#e3f1e3' : '#f5f0ec',
                                        color: am.flag ? '#2e7d32' : '#9e8a7a',
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                      }}>
                                        <i className={`fa-solid ${am.icon}`}></i>
                                        {am.label}: {am.flag ? 'Yes' : 'No'}
                                      </span>
                                    ))}
                                  </div>
                                  </div>{/* end padding wrapper */}
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        ));
                    })()
                  )}
                </div>
              )}

              {/* FACILITIES TAB */}
              {activeTab === 'facilities' && (
                <div className="custom-card">
                  {tabLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '26px' }}></i>
                      <p style={{ marginTop: '12px' }}>Loading facilities data...</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="custom-section-title">
                        <i className="fa-solid fa-shield-halved" style={{ marginRight: '8px', color: '#8d5f3a' }}></i>Security Information
                      </h3>
                      {!securityInfo || Object.keys(securityInfo).filter(k => k !== 'error').length === 0 ? (
                        <div style={{ padding: '16px 0 28px', color: '#888', fontSize: '14px' }}>
                          <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>No security data registered for this hostel.
                        </div>
                      ) : (
                        <div className="custom-info-grid" style={{ marginBottom: '28px' }}>
                          {Object.entries(securityInfo)
                            .filter(([k]) => k !== 'error')
                            .map(([k, v]) => (
                              <div key={k} className="custom-info-box">
                                <div className="custom-info-label">{formatKey(k)}</div>
                                <div className="custom-info-value">
                                  {v != null ? (typeof v === 'boolean' ? (v ? 'Yes' : 'No') : Array.isArray(v) ? (v as any[]).join(', ') : String(v)) : 'N/A'}
                                </div>
                              </div>
                          ))}
                        </div>
                      )}
                      <h3 className="custom-section-title" style={{ marginTop: '8px' }}>
                        <i className="fa-solid fa-utensils" style={{ marginRight: '8px', color: '#8d5f3a' }}></i>Mess Information
                      </h3>
                      {!messInfo || Object.keys(messInfo).filter(k => k !== 'error').length === 0 ? (
                        <div style={{ padding: '16px 0', color: '#888', fontSize: '14px' }}>
                          <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }}></i>No mess data registered for this hostel.
                        </div>
                      ) : (
                        <div className="custom-info-grid">
                          {Object.entries(messInfo)
                            .filter(([k]) => k !== 'error')
                            .map(([k, v]) => (
                              <div key={k} className="custom-info-box">
                                <div className="custom-info-label">{formatKey(k)}</div>
                                <div className="custom-info-value">
                                  {v != null ? (typeof v === 'boolean' ? (v ? 'Yes' : 'No') : Array.isArray(v) ? (v as any[]).join(', ') : String(v)) : 'N/A'}
                                </div>
                              </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="custom-card">
                  <h3 className="custom-section-title">
                    <i className="fa-solid fa-star" style={{ marginRight: '8px', color: '#f5a623' }}></i>
                    Student Reviews ({reviews.length})
                  </h3>

                  {tabLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '26px' }}></i>
                      <p style={{ marginTop: '12px' }}>Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}>
                      <i className="fa-regular fa-star" style={{ fontSize: '36px', display: 'block', marginBottom: '12px', color: '#d0c8c0' }}></i>
                      <p style={{ fontSize: '15px' }}>No reviews yet for this hostel.</p>
                    </div>
                  ) : (
                    <>
                      {/* ── Summary card ── */}
                      {(() => {
                        const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
                        const overall = avg(reviews.map(r => r.ratingStar));
                        const maintenance = avg(reviews.map(r => r.maintenanceRating));
                        const issueResolving = avg(reviews.map(r => r.issueResolvingRate));
                        const managerBehaviour = avg(reviews.map(r => r.managerBehaviour));
                        const categories = [
                          { label: 'Overall Star Rating', value: overall, icon: 'fa-star', color: '#f5a623' },
                          { label: 'Maintenance', value: maintenance, icon: 'fa-wrench', color: '#5c7fff' },
                          { label: 'Issue Resolving', value: issueResolving, icon: 'fa-circle-check', color: '#28a745' },
                          { label: 'Manager Behaviour', value: managerBehaviour, icon: 'fa-user-tie', color: '#8d5f3a' },
                        ];
                        return (
                          <div style={{ background: '#faf6f1', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px', border: '1px solid #e8ddd4' }}>
                            {/* Big overall number */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px', flexWrap: 'wrap' }}>
                              <div style={{ fontSize: '52px', fontWeight: 800, color: '#2b211c', lineHeight: 1 }}>
                                {overall.toFixed(1)}
                              </div>
                              <div>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <i key={i}
                                      className={`fa-${i <= Math.round(overall) ? 'solid' : 'regular'} fa-star`}
                                      style={{ fontSize: '20px', color: i <= Math.round(overall) ? '#f5a623' : '#d0c8c0' }} />
                                  ))}
                                </div>
                                <div style={{ fontSize: '13px', color: '#8d7060' }}>
                                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>

                            {/* Category bars */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                              {categories.slice(1).map(cat => (
                                <div key={cat.label}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '12px', color: '#6a5c54', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <i className={`fa-solid ${cat.icon}`} style={{ color: cat.color }}></i>{cat.label}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2b211c' }}>{cat.value.toFixed(1)}<span style={{ fontSize: '11px', fontWeight: 400, color: '#8d7060' }}>/5</span></span>
                                  </div>
                                  <div style={{ height: '7px', background: '#e8ddd4', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(cat.value / 5) * 100}%`, background: cat.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ── Individual review cards ── */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {reviews.map(review => (
                          <div key={review.ratingId} className="custom-info-box" style={{ padding: '18px 20px' }}>
                            {/* Header: name + overall stars */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '38px', height: '38px', borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #5c3d2e, #8d5f3a)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: '#f8f3e7', fontWeight: 700, fontSize: '15px', flexShrink: 0,
                                }}>
                                  {review.studentName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#2b211c', fontSize: '14px' }}>{review.studentName}</div>
                                  <div style={{ fontSize: '11px', color: '#9e8a7a' }}>Student ID: {review.studentId}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                  <i key={i}
                                    className={`fa-${i <= review.ratingStar ? 'solid' : 'regular'} fa-star`}
                                    style={{ fontSize: '16px', color: i <= review.ratingStar ? '#f5a623' : '#d0c8c0' }} />
                                ))}
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#2b211c', marginLeft: '5px' }}>{review.ratingStar}/5</span>
                              </div>
                            </div>

                            {/* Category mini-bars grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: review.challenges ? '14px' : '0' }}>
                              {[
                                { label: 'Maintenance', value: review.maintenanceRating, icon: 'fa-wrench', color: '#5c7fff' },
                                { label: 'Issue Resolving', value: review.issueResolvingRate, icon: 'fa-circle-check', color: '#28a745' },
                                { label: 'Manager Behaviour', value: review.managerBehaviour, icon: 'fa-user-tie', color: '#8d5f3a' },
                              ].map(cat => (
                                <div key={cat.label}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '11px', color: '#6a5c54', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <i className={`fa-solid ${cat.icon}`} style={{ color: cat.color, fontSize: '10px' }}></i>{cat.label}
                                    </span>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2b211c' }}>{cat.value}/5</span>
                                  </div>
                                  <div style={{ height: '5px', background: '#e8ddd4', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${(cat.value / 5) * 100}%`, background: cat.color, borderRadius: '3px' }} />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Challenges/comment */}
                            {review.challenges && (
                              <div style={{
                                marginTop: '10px', padding: '10px 14px',
                                background: '#fdf6ee', borderRadius: '8px',
                                borderLeft: '3px solid #f5a623',
                                fontSize: '13px', color: '#4a3728', lineHeight: 1.55,
                              }}>
                                <span style={{ fontWeight: 600, color: '#8d5f3a', marginRight: '6px' }}>
                                  <i className="fa-solid fa-comment-dots" style={{ marginRight: '4px' }}></i>Challenges:
                                </span>
                                {review.challenges}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Disapprove Confirmation Modal */}
          {showDisapproveConfirm && (
            <div className="custom-modal-overlay">
              <div className="custom-modal">
                <div className="custom-modal-header">
                  <i className="fa-solid fa-ban" style={{ color: '#e67e22', marginRight: '10px' }}></i>
                  <h3>Confirm Disapproval</h3>
                </div>
                <div className="custom-modal-body">
                  <p>Are you sure you want to disapprove <strong>{hostel?.name}</strong>?</p>
                  <p className="custom-warning-text">
                    <i className="fa-solid fa-exclamation-circle"></i> The hostel will no longer be visible to students and will require re-approval.
                  </p>
                </div>
                <div className="custom-modal-footer">
                  <button
                    className="custom-btn custom-btn-cancel"
                    onClick={() => setShowDisapproveConfirm(false)}
                    disabled={disapproveLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="custom-btn custom-btn-confirm-disapprove"
                    onClick={handleDisapprove}
                    disabled={disapproveLoading}
                  >
                    {disapproveLoading ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Disapproving...</>
                    ) : (
                      <><i className="fa-solid fa-ban"></i> Disapprove</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="custom-modal-overlay">
              <div className="custom-modal">
                <div className="custom-modal-header">
                  <i className="fa-solid fa-exclamation-triangle" style={{ color: "#dc3545", marginRight: "10px" }}></i>
                  <h3>Confirm Delete</h3>
                </div>
                <div className="custom-modal-body">
                  <p>Are you sure you want to delete <strong>{hostel?.name}</strong>?</p>
                  <p className="custom-warning-text">
                    <i className="fa-solid fa-exclamation-circle"></i> This action cannot be undone. All hostel data will be permanently removed.
                  </p>
                </div>
                <div className="custom-modal-footer">
                  <button
                    className="custom-btn custom-btn-cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="custom-btn custom-btn-confirm-delete"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-trash"></i> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminViewHostels;