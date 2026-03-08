import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/StudentProfile.module.css";
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

const SkeletonLoader: React.FC<{ userId: string | null }> = ({ userId }) => (
  <div className={styles.pageWrapper}>
    <Navbar userId={userId ?? ""} />
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonSubtitle} />
        </div>
        <div className={styles.skeletonButton} />
      </div>
      <div className={styles.profileGrid}>
        <div className={styles.profileCard}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonName} />
          <div className={styles.skeletonEmail} />
          <div className={styles.skeletonLocation} />
          <div className={styles.skeletonBadge} />
        </div>
        <div className={styles.infoSections}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.section}>
              <div className={styles.skeletonSectionTitle} />
              <div className={styles.infoGrid}>
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className={styles.infoItem}>
                    <div className={styles.skeletonLabel} />
                    <div className={styles.skeletonValue} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StudentProfile: React.FC = () => {
  const userId = useAuthGuard();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    window.scrollTo(0, 0);

    const fetchStudent = async () => {
      if (!userId) return;
      setLoading(true);

      const cacheKey = `student_profile_${userId}`;
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

  const getInitials = useCallback(() => {
    if (!student) return "U";
    return `${student.fname?.[0] || ''}${student.lname?.[0] || ''}`.toUpperCase();
  }, [student]);

  const fullName = useMemo(() => {
    return student ? `${student.fname || ''} ${student.lname || ''}`.trim() : `Student #${userId}`;
  }, [student, userId]);

  const handleEditProfile = useCallback(() => {
    navigate(`/student/profile/edit?user_id=${userId}`);
  }, [navigate, userId]);

  const handleRetry = useCallback(() => {
    sessionStorage.removeItem(`student_profile_${userId}`);
    window.location.reload();
  }, [userId]);

  if (loading || !userId) {
    return <SkeletonLoader userId={userId} />;
  }

  if (error) {
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
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>
              <i className="fa-solid fa-user-circle"></i> My Profile
            </h2>
            <p className={styles.subtitle}>
              View and manage your account information and preferences
            </p>
          </div>
          <button
            className={styles.editBtn}
            onClick={handleEditProfile}
          >
            <i className="fa-solid fa-pen"></i> Edit Profile
          </button>
        </div>

        {/* Profile Content */}
        <div className={styles.profileGrid}>
          {/* LEFT: PROFILE SUMMARY */}
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {getInitials()}
            </div>
            <h3 className={styles.name}>
              {fullName}
            </h3>
            {student?.email && (
              <p className={styles.email}>
                <i className="fa-regular fa-envelope"></i> {student.email}
              </p>
            )}
            {student?.city && (
              <p className={styles.location}>
                <i className="fa-solid fa-location-dot"></i> {student.city}
              </p>
            )}
            <div className={styles.badge}>
              <i className="fa-solid fa-graduation-cap"></i> {student?.usertype || 'Student'}
            </div>
          </div>

          {/* RIGHT: DETAILED INFO */}
          <div className={styles.infoSections}>
            {/* ACCOUNT INFO */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <i className="fa-solid fa-id-card"></i>
                <h3>Account Information</h3>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>First Name</span>
                  <span className={styles.value}>{student?.fname || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Last Name</span>
                  <span className={styles.value}>{student?.lname || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Age</span>
                  <span className={styles.value}>{student?.age || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Gender</span>
                  <span className={styles.value}>{student?.gender || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>City</span>
                  <span className={styles.value}>{student?.city || '—'}</span>
                </div>
              </div>
            </div>

            {/* UNIVERSITY INFO */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <i className="fa-solid fa-building-columns"></i>
                <h3>University Information</h3>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Department</span>
                  <span className={styles.value}>{student?.p_Department || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Batch</span>
                  <span className={styles.value}>{student?.p_Batch || '—'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Semester</span>
                  <span className={styles.value}>{student?.p_Semester || '—'}</span>
                </div>
              </div>
            </div>

            {/* HOSTEL PREFERENCES */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <i className="fa-solid fa-bed"></i>
                <h3>Hostel Preferences</h3>
              </div>
              <div className={styles.preferencesGrid}>
                <div className={styles.preferenceItem}>
                  <i className="fa-solid fa-people-group"></i>
                  <div>
                    <span className={styles.prefLabel}>Roommate Count</span>
                    <span className={styles.prefValue}>{student?.p_RoomateCount || '—'}</span>
                  </div>
                </div>
                <div className={styles.preferenceItem}>
                  <i className="fa-solid fa-road"></i>
                  <div>
                    <span className={styles.prefLabel}>Distance from University</span>
                    <span className={styles.prefValue}>
                      {student?.p_UniDistance ? `${student.p_UniDistance} km` : '—'}
                    </span>
                  </div>
                </div>
                <div className={styles.preferenceItem}>
                  <i className="fa-solid fa-wind"></i>
                  <div>
                    <span className={styles.prefLabel}>AC Room</span>
                    <span className={styles.prefValue}>
                      {student?.p_isAcRoom !== undefined ? (student.p_isAcRoom ? 'Yes' : 'No') : '—'}
                    </span>
                  </div>
                </div>
                <div className={styles.preferenceItem}>
                  <i className="fa-solid fa-utensils"></i>
                  <div>
                    <span className={styles.prefLabel}>Mess Required</span>
                    <span className={styles.prefValue}>
                      {student?.p_isMess !== undefined ? (student.p_isMess ? 'Yes' : 'No') : '—'}
                    </span>
                  </div>
                </div>
                <div className={styles.preferenceItem}>
                  <i className="fa-solid fa-bed"></i>
                  <div>
                    <span className={styles.prefLabel}>Bed Type</span>
                    <span className={styles.prefValue}>{student?.p_BedType || '—'}</span>
                  </div>
                </div>
                <div className={styles.preferenceItem}>
                  <i className="fa-solid fa-toilet"></i>
                  <div>
                    <span className={styles.prefLabel}>Washroom Type</span>
                    <span className={styles.prefValue}>{student?.p_WashroomType || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;