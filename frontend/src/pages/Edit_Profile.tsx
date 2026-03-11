import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/EditProfile.module.css";
import Navbar from "../components/Navbar";
import useAuthGuard from "../hooks/useAuthGuard";

interface StudentDetails {
  userid: number;
  fname?: string;
  lname?: string;
  age?: number;
  gender?: string;
  city?: string;
  usertype?: string;
  email?: string;
  p_Semester?: number;
  p_Department?: string;
  p_Batch?: number;
  p_RoomateCount?: number;
  p_UniDistance?: number;
  p_isAcRoom?: boolean;
  p_isMess?: boolean;
  p_BedType?: string;
  p_WashroomType?: string;
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

const SkeletonLoader: React.FC = () => (
  <div className={styles.pageWrapper}>
    <div className={styles.skeletonNavbar} />
    <div className={styles.container}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonSubtitle} />
      <div className={styles.editGrid}>
        {[1, 2].map((section) => (
          <div key={section} className={styles.section}>
            <div className={styles.skeletonSectionTitle} />
            {[1, 2, 3].map((row) => (
              <div key={row} className={styles.formRow}>
                <div className={styles.formGroup}>
                  <div className={styles.skeletonLabel} />
                  <div className={styles.skeletonInput} />
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.skeletonLabel} />
                  <div className={styles.skeletonInput} />
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className={styles.buttonSection}>
          <div className={styles.skeletonButton} />
          <div className={styles.skeletonButton} />
        </div>
      </div>
    </div>
  </div>
);

const EditProfile: React.FC = () => {
  const userId = useAuthGuard();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchStudent = async () => {
      if (!userId) {
        setError("No student ID provided.");
        setLoading(false);
        return;
      }

      const cacheKey = `edit_profile_${userId}`;
      const cached = getCached<StudentDetails>(cacheKey);
      if (cached) {
        setStudent(cached);
        setLoading(false);
        return;
      }

      try {
        const [profileResponse, usersResponse] = await Promise.all([
          axios.post("http://127.0.0.1:8000/faststay_app/UserDetail/display/", {
            p_StudentId: parseInt(userId)
          }, { signal }),
          axios.get("http://127.0.0.1:8000/faststay_app/users/all/", { signal })
        ]);

        const users: StudentDetails[] = usersResponse.data.users;
        const foundUser = users.find((u) => u.userid === parseInt(userId));

        if (profileResponse.data.success && foundUser) {
          const mergedStudent = { ...profileResponse.data.result, ...foundUser };
          setStudent(mergedStudent);
          setCache(cacheKey, mergedStudent);
        } else {
          setError("Student not found.");
        }
      } catch (err: any) {
        if (!signal.aborted) {
          console.error(err);
          setError("Failed to fetch student details.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStudent();
    return () => controller.abort();
  }, [userId]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setStudent(prev => {
      if (!prev) return prev;

      let newValue: any = value;
      if (type === "checkbox") {
        newValue = (e.target as HTMLInputElement).checked;
      } else if (type === "number") {
        newValue = value === '' ? '' : parseFloat(value);
      }

      return {
        ...prev,
        [name]: newValue
      };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!student) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updateData = {
        p_StudentId: student.userid,
        p_Department: student.p_Department,
        p_Batch: student.p_Batch,
        p_Semester: student.p_Semester,
        p_RoomateCount: student.p_RoomateCount,
        p_UniDistance: student.p_UniDistance,
        p_isAcRoom: student.p_isAcRoom,
        p_isMess: student.p_isMess,
        p_BedType: student.p_BedType,
        p_WashroomType: student.p_WashroomType,
      };

      const response = await axios.put(
        "http://127.0.0.1:8000/faststay_app/UserDetail/update/",
        updateData
      );

      if (response.data.result) {
        setSuccessMessage("Profile updated successfully! Redirecting...");

        // Clear cache to ensure fresh data on next view
        const cacheKey = `edit_profile_${userId}`;
        sessionStorage.removeItem(cacheKey);

        // Clear student profile cache too
        const profileCacheKey = `student_profile_${userId}`;
        sessionStorage.removeItem(profileCacheKey);

        // Redirect after showing success message
        setTimeout(() => {
          navigate(`/student/profile?user_id=${userId}`);
        }, 1500);
      } else {
        setError("Failed to update profile.");
        setSaving(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save changes. Please try again.");
      setSaving(false);
    }
  }, [student, userId, navigate]);

  const handleCancel = useCallback(() => {
    navigate(`/student/profile?user_id=${userId}`);
  }, [navigate, userId]);

  const handleRetry = useCallback(() => {
    sessionStorage.removeItem(`edit_profile_${userId}`);
    window.location.reload();
  }, [userId]);

  // Memoize form values to prevent unnecessary re-renders
  const formValues = useMemo(() => ({
    department: student?.p_Department || "",
    batch: student?.p_Batch || "",
    semester: student?.p_Semester || "",
    roommateCount: student?.p_RoomateCount || 1,
    uniDistance: student?.p_UniDistance !== undefined ? student.p_UniDistance : "",
    isAcRoom: student?.p_isAcRoom || false,
    bedType: student?.p_BedType || "Bed",
    washroomType: student?.p_WashroomType || "RoomAttached",
    isMess: student?.p_isMess || false,
  }), [student]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error && !student) {
    return (
      <div className={styles.pageWrapper}>
        <Navbar userId={userId} />
        <div className={styles.errorContainer}>
          <i className="fa-solid fa-circle-exclamation"></i>
          <h3>Unable to load profile</h3>
          <p>{error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            <i className="fa-solid fa-rotate-right"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar userId={userId} />

      <div className={styles.container}>
        <h2 className={styles.pageTitle}>
          <i className="fa-solid fa-user-edit"></i> Edit Profile
        </h2>
        <p className={styles.subtitle}>
          Update your account and preferences
        </p>

        {/* Messages below subtitle */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            <i className="fa-solid fa-exclamation-circle"></i> {error}
          </div>
        )}

        {successMessage && (
          <div className={styles.successMessage} role="status">
            <i className="fa-solid fa-check-circle"></i> {successMessage}
          </div>
        )}

        <div className={styles.editGrid}>
          {/* UNIVERSITY INFORMATION */}
          <div className={styles.section}>
            <h3>
              <i className="fa-solid fa-building-columns"></i> University Information
            </h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  name="p_Department"
                  value={formValues.department}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  disabled={saving}
                  aria-label="Department"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="batch">Batch</label>
                <input
                  id="batch"
                  type="number"
                  name="p_Batch"
                  value={formValues.batch}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  min="2000"
                  max="2030"
                  disabled={saving}
                  aria-label="Batch year"
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="semester">Semester</label>
                <input
                  id="semester"
                  type="number"
                  name="p_Semester"
                  value={formValues.semester}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  min="1"
                  max="12"
                  disabled={saving}
                  aria-label="Semester"
                />
              </div>
            </div>
          </div>

          {/* HOSTEL PREFERENCES */}
          <div className={styles.section}>
            <h3>
              <i className="fa-solid fa-bed"></i> Hostel Preferences
            </h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="roommateCount">Number of roommates</label>
                <select
                  id="roommateCount"
                  name="p_RoomateCount"
                  value={formValues.roommateCount}
                  onChange={handleInputChange}
                  className={styles.selectField}
                  disabled={saving}
                  aria-label="Number of roommates"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="uniDistance">Preferred Distance (km)</label>
                <input
                  id="uniDistance"
                  type="number"
                  name="p_UniDistance"
                  value={formValues.uniDistance}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  min="1"
                  max="20"
                  step="0.5"
                  placeholder="Enter distance"
                  disabled={saving}
                  aria-label="Preferred distance from university in kilometers"
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="washroomType">Washroom Type</label>
                <select
                  id="washroomType"
                  name="p_WashroomType"
                  value={formValues.washroomType}
                  onChange={handleInputChange}
                  className={styles.selectField}
                  disabled={saving}
                  aria-label="Washroom type preference"
                >
                  <option value="RoomAttached">Room Attached</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="bedType">Bed Type</label>
                <select
                  id="bedType"
                  name="p_BedType"
                  value={formValues.bedType}
                  onChange={handleInputChange}
                  className={styles.selectField}
                  disabled={saving}
                  aria-label="Bed type preference"
                >
                  <option value="Bed">Bed</option>
                  <option value="Matress">Matress</option>
                  <option value="Anyone">Any</option>
                </select>
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ marginLeft: '4px' }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="p_isAcRoom"
                    checked={formValues.isAcRoom}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                    disabled={saving}
                    aria-label="AC room required"
                  />
                  AC Room Required
                </label>
              </div>
              <div className={styles.formGroup} style={{ marginLeft: '4px' }}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="p_isMess"
                    checked={formValues.isMess}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                    disabled={saving}
                    aria-label="Mess required"
                  />
                  Mess Required
                </label>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className={styles.buttonSection}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={handleCancel}
              disabled={saving}
              aria-label="Cancel editing"
            >
              <i className="fa-solid fa-times"></i> Cancel
            </button>
            <button
              className={`${styles.button} ${styles.saveButton}`}
              onClick={handleSave}
              disabled={saving || !student}
              aria-label="Save changes"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;