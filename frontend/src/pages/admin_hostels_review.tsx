import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHostelDetails, deleteHostel, approveHostel, CACHE_HOSTEL_DETAIL, type HostelTableRow } from "../api/admin_hostels_review";
import { cacheGet, cacheSet } from "../utils/cache";
import { getAdminAccessCode } from "../utils/auth";
import { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";
import "../AdminViewHostels.css";

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
  const [actionError, setActionError] = useState<string | null>(null);

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
      <div>
        {/* NAVBAR */}
        <nav className={styles.navbar}>
          <div className={styles.logo}>
            <i className="fa-solid fa-user-shield"></i> FastStay Admin
          </div>
          <div className={styles.navLinks}>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/hostels">Hostels</Link>
            <Link to="/admin/students">Students</Link>
            <Link to="/admin/managers">Managers</Link>
            <Link to="/admin/logout">Logout</Link>
          </div>
        </nav>

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
                          <i className="fa-solid fa-check"></i> Approve
                        </>
                      )}
                    </button>
                  ) : showApproveSuccess ? (
                    <div className="custom-approved-message">
                      <i className="fa-solid fa-check-circle"></i>
                      <span>This hostel has been approved</span>
                    </div>
                  ) : null}

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
                </div>
              </div>
            </>
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