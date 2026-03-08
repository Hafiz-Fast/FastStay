import { useEffect, useState } from "react";
import styles from "../styles/Profile.module.css";
import { Link } from "react-router-dom";

interface User {
  userid: number;
  loginid: number;
  usertype: string;
  fname: string;
  lname: string;
  age: number;
  gender: string;
  city: string;
}

interface ManagerDetails {
  p_PhotoLink: string;
  p_PhoneNo: string;
  p_Education: string;
  p_ManagerType: string;
  p_OperatingHours: number;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [managerDetails, setManagerDetails] = useState<ManagerDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Photo upload state
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState<ManagerDetails>({
    p_PhotoLink: "",
    p_PhoneNo: "",
    p_Education: "",
    p_ManagerType: "",
    p_OperatingHours: 8,
  });

  // Get managerId from URL params
  const params = new URLSearchParams(window.location.search);
  const managerId = Number(params.get("user_id"));

  // Handle photo change
  const handlePhotoChange = (file: File | null) => {
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
      // If clearing photo, also clear the photo link in form data
      setFormData(prev => ({
        ...prev,
        p_PhotoLink: ""
      }));
    }
  };

  // Fetch user details (from Users table)
  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const res = await fetch("http://127.0.0.1:8000/faststay_app/users/all/");
        const data = await res.json();
        
        if (data?.users) {
          // Find the user with matching UserId (managerId from URL)
          const foundUser = data.users.find((u: User) => u.userid === managerId);
          if (foundUser) {
            setUser(foundUser);
          }
        }
      } catch (error) {
        console.log("User fetch error", error);
      }
    }
    fetchUserDetails();
  }, [managerId]);

  // Fetch manager details
  useEffect(() => {
    async function fetchManagerDetails() {
      try {
        const res = await fetch("http://127.0.0.1:8000/faststay_app/ManagerDetails/display/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ p_ManagerId: managerId }),
        });
        
        const data = await res.json();
        
        if (data.success && data.result) {
          setManagerDetails(data.result);
          setFormData(data.result);
          if (data.result.p_PhotoLink) {
            setPhotoPreview(data.result.p_PhotoLink);
          }
        }
      } catch (error) {
        console.log("Manager details fetch error", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (managerId) {
      fetchManagerDetails();
    }
  }, [managerId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "p_OperatingHours" ? parseInt(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(null);
    setUpdateError(null);
    setIsUploading(true);

    // Prepare FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("p_ManagerId", managerId.toString());
    
    // Append photo file if selected, otherwise append existing photo URL
    if (photo) {
      formDataToSend.append("p_PhotoLink", photo);
    } else if (formData.p_PhotoLink && !photoPreview?.startsWith('data:')) {
      // If there's an existing photo URL and we haven't changed it
      formDataToSend.append("p_PhotoLink", formData.p_PhotoLink);
    }
    
    formDataToSend.append("p_PhoneNo", formData.p_PhoneNo);
    formDataToSend.append("p_Education", formData.p_Education);
    formDataToSend.append("p_ManagerType", formData.p_ManagerType);
    formDataToSend.append("p_OperatingHours", formData.p_OperatingHours.toString());

    try {
      const res = await fetch("http://127.0.0.1:8000/faststay_app/ManagerDetails/update/", {
        method: "PUT",
        body: formDataToSend,
        // Note: Don't set Content-Type header for FormData, browser will set it with boundary
      });

      const data = await res.json();
      
      if (data.result || data.success) {
        setUpdateSuccess(data.message || "Profile updated successfully!");
        
        // Update local state with new data
        const updatedDetails = {
          p_PhotoLink: photoPreview || formData.p_PhotoLink,
          p_PhoneNo: formData.p_PhoneNo,
          p_Education: formData.p_Education,
          p_ManagerType: formData.p_ManagerType,
          p_OperatingHours: formData.p_OperatingHours,
        };
        
        setManagerDetails(updatedDetails);
        setPhoto(null); // Clear photo file after successful upload
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(null), 3000);
      } else {
        setUpdateError(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.log("Update error", error);
      setUpdateError("An error occurred while updating profile");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    if (managerDetails) {
      setFormData(managerDetails);
      setPhoto(null);
      setPhotoPreview(managerDetails.p_PhotoLink || null);
    }
    setIsEditing(false);
    setUpdateSuccess(null);
    setUpdateError(null);
  };

  // Handle remove photo
  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setFormData(prev => ({
      ...prev,
      p_PhotoLink: ""
    }));
  };

  return (
    <>
      {/* NAVBAR - Same as HostelDashboard */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <i className="fa-solid fa-building-user"></i> FastStay
        </div>
        <div className={styles.navLinks}>
          <Link to={`/manager/dashboard?user_id=${managerId}`}>
            Dashboard
          </Link>

          <Link to={`/manager/add_hostel?user_id=${managerId}`}>
            Add Hostel
          </Link>

          <Link to={`/manager/add_room?user_id=${managerId}`}>
            Add Room
          </Link>

          <Link 
            to={`/manager/profile?user_id=${managerId}`}
            className={styles.active}
          >
            Your Profile
          </Link>

          <Link to="/">
            Logout
          </Link>
        </div>
      </nav>

      <div className={styles.screen}>
        <div className={styles.container}>
          <h2 className={styles.pageTitle}>Your Profile</h2>
          <p className={styles.subtitle}>View and update your profile information</p>

          {/* Success/Error Messages */}
          {updateSuccess && (
            <div className={styles.successMessage}>
              <i className="fa-solid fa-check-circle"></i> {updateSuccess}
            </div>
          )}
          
          {updateError && (
            <div className={styles.errorMessage}>
              <i className="fa-solid fa-exclamation-circle"></i> {updateError}
            </div>
          )}

          {isLoading ? (
            <div className={styles.loading}>
              <i className="fa-solid fa-spinner fa-spin"></i> Loading profile...
            </div>
          ) : (
            <div className={styles.profileContainer}>
              {/* Left Column - User Info */}
              <div className={styles.userInfo}>
                <div className={styles.profileHeader}>
                  {photoPreview || managerDetails?.p_PhotoLink ? (
                    <img 
                      src={photoPreview || managerDetails?.p_PhotoLink} 
                      alt="Profile" 
                      className={styles.profileImage}
                    />
                  ) : (
                    <div className={styles.profileImagePlaceholder}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}
                  <div className={styles.profileTitle}>
                    <h3>
                      {user?.fname} {user?.lname}
                      {managerDetails?.p_ManagerType && (
                        <span className={styles.managerType}>
                          <i className="fa-solid fa-user-tie"></i> {managerDetails.p_ManagerType}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <div className={styles.userDetails}>
                  <h4><i className="fa-solid fa-circle-info"></i> Personal Information</h4>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Full Name:</span>
                    <span className={styles.detailValue}>
                      {user?.fname} {user?.lname}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Age:</span>
                    <span className={styles.detailValue}>{user?.age}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Gender:</span>
                    <span className={styles.detailValue}>{user?.gender}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>City:</span>
                    <span className={styles.detailValue}>{user?.city}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>User Type:</span>
                    <span className={styles.detailValue}>{user?.usertype}</span>
                  </div>
                </div>

                {!isEditing && (
                  <button 
                    className={styles.editButton}
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Edit Profile
                  </button>
                )}
              </div>

              {/* Right Column - Manager Details */}
              <div className={styles.managerInfo}>
                <div className={styles.sectionHeader}>
                  <h3><i className="fa-solid fa-briefcase"></i> Manager Details</h3>
                  <p>Update your professional information here</p>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className={styles.editForm}>
                    {/* Photo Upload Section */}
                    <div className={styles.formGroup}>
                      <label htmlFor="p_PhotoLink">
                        <i className="fa-solid fa-camera"></i> Profile Photo
                      </label>
                      
                      <div className={styles.photoUploadSection}>
                        <div className={styles.photoPreviewBox}>
                          {photoPreview || managerDetails?.p_PhotoLink ? (
                            <img 
                              src={photoPreview || managerDetails?.p_PhotoLink} 
                              alt="Profile Preview" 
                              className={styles.photoPreview}
                            />
                          ) : (
                            <div className={styles.photoPlaceholder}>
                              <i className="fa-solid fa-user"></i>
                              <span>No photo selected</span>
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.photoControls}>
                          <label htmlFor="photo-upload" className={styles.photoUploadButton}>
                            <i className="fa-solid fa-upload"></i> Upload Photo
                            <input
                              type="file"
                              id="photo-upload"
                              accept="image/*"
                              className={styles.fileInput}
                              onChange={e => handlePhotoChange(e.target.files?.[0] || null)}
                            />
                          </label>
                          
                          {(photoPreview || managerDetails?.p_PhotoLink) && (
                            <button 
                              type="button"
                              onClick={handleRemovePhoto}
                              className={styles.removePhotoButton}
                            >
                              <i className="fa-solid fa-trash"></i> Remove
                            </button>
                          )}
                        </div>
                        
                        <small className={styles.helperText}>
                          Upload a JPG, PNG, or GIF image (max 5MB)
                        </small>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="p_PhoneNo">
                        <i className="fa-solid fa-phone"></i> Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="p_PhoneNo"
                        name="p_PhoneNo"
                        value={formData.p_PhoneNo}
                        onChange={handleInputChange}
                        placeholder="11-digit phone number"
                        required
                        pattern="[0-9]{11}"
                        className={styles.formInput}
                      />
                      <small className={styles.helperText}>Must be 11 digits</small>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="p_Education">
                        <i className="fa-solid fa-graduation-cap"></i> Education
                      </label>
                      <input
                        type="text"
                        id="p_Education"
                        name="p_Education"
                        value={formData.p_Education}
                        onChange={handleInputChange}
                        placeholder="e.g., Bachelor's in Management"
                        className={styles.formInput}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="p_ManagerType">
                        <i className="fa-solid fa-user-tie"></i> Manager Type *
                      </label>
                      <select
                        id="p_ManagerType"
                        name="p_ManagerType"
                        value={formData.p_ManagerType}
                        onChange={handleInputChange}
                        required
                        className={styles.formSelect}
                      >
                        <option value="">Select type</option>
                        <option value="Owner">Owner</option>
                        <option value="Employee">Employee</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="p_OperatingHours">
                        <i className="fa-solid fa-clock"></i> Operating Hours *
                      </label>
                      <input
                        type="range"
                        id="p_OperatingHours"
                        name="p_OperatingHours"
                        min="1"
                        max="24"
                        value={formData.p_OperatingHours}
                        onChange={handleInputChange}
                        className={styles.formRange}
                      />
                      <div className={styles.rangeValue}>
                        <span>{formData.p_OperatingHours} hours</span>
                      </div>
                    </div>

                    <div className={styles.formButtons}>
                      <button 
                        type="submit" 
                        className={styles.saveButton}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-floppy-disk"></i> Save Changes
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancel}
                        className={styles.cancelButton}
                        disabled={isUploading}
                      >
                        <i className="fa-solid fa-xmark"></i> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className={styles.managerDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        <i className="fa-solid fa-phone"></i> Phone:
                      </span>
                      <span className={styles.detailValue}>
                        {managerDetails?.p_PhoneNo || "Not set"}
                      </span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        <i className="fa-solid fa-graduation-cap"></i> Education:
                      </span>
                      <span className={styles.detailValue}>
                        {managerDetails?.p_Education || "Not set"}
                      </span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        <i className="fa-solid fa-user-tie"></i> Manager Type:
                      </span>
                      <span className={styles.detailValue}>
                        {managerDetails?.p_ManagerType || "Not set"}
                      </span>
                    </div>
                    
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        <i className="fa-solid fa-clock"></i> Operating Hours:
                      </span>
                      <span className={styles.detailValue}>
                        {managerDetails?.p_OperatingHours ? 
                          `${managerDetails.p_OperatingHours} hours per day` : 
                          "Not set"
                        }
                      </span>
                    </div>
                    
                    <div className={styles.note}>
                      <i className="fa-solid fa-lightbulb"></i>
                      <p>Click "Edit Profile" to update your manager details. Fields marked with * are required.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}