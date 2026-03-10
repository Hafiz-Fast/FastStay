
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  loadDashboardData,
  type RecentUserAccount,
  type RecentHostel,
  CACHE_DASHBOARD,
  CACHE_RECENT_USERS,
  CACHE_RECENT_HOSTELS,
  CACHE_ALL_USERS_RAW,
} from "../api/admin_dashboard";

import { cacheGet } from "../utils/cache";
import { getStudentProfile } from "../api/admin_students_review";
import { getManagerProfile } from "../api/admin_manager_review";
import { getHostelDetails } from "../api/admin_hostels_review";
import { getAllSuggestions, CACHE_SUGGESTIONS } from "../api/admin_suggestions";
import SkeletonRow, { SkeletonBlock } from "../components/SkeletonRow";
import styles from "../styles/admin_dashboard.module.css";

// Dashboard Summary
interface DashboardSummary {
  total_students: number;
  total_managers: number;
  total_hostels: number;
  total_rooms: number;
  total_pending: number;
}

// ---- Notification helpers (persist dismissed IDs in localStorage, no DB required) ----
const NOTIF_DISMISSED_KEY = 'faststay_admin:dismissed_notif_ids';
const readDismissed = (): Set<number> => {
  try {
    const raw = localStorage.getItem(NOTIF_DISMISSED_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch (_err) { return new Set(); }
};
const saveDismissed = (ids: Set<number>): void => {
  try { localStorage.setItem(NOTIF_DISMISSED_KEY, JSON.stringify([...ids])); } catch (_err) {}
};
type RawUserNotif = { userid: number; usertype: string; fname: string; lname: string; city: string; };
interface NotifItem { userid: number; name: string; city: string; userType: 'Student' | 'Hostel Manager'; }
const buildNotifications = (users: RawUserNotif[]): NotifItem[] => {
  const dismissed = readDismissed();
  const pick = (type: string) => users
    .filter(u => u.usertype === type)
    .sort((a, b) => b.userid - a.userid)
    .slice(0, 25);
  return [...pick('Student'), ...pick('Hostel Manager')]
    .filter(u => !dismissed.has(u.userid))
    .map(u => ({
      userid: u.userid,
      name: `${u.fname} ${u.lname}`.trim(),
      city: u.city,
      userType: u.usertype as 'Student' | 'Hostel Manager',
    }));
};

const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUserAccount[]>([]);
  const [recentHostels, setRecentHostels] = useState<RecentHostel[]>([]);
  const [totalSuggestions, setTotalSuggestions] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Individual loading states
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [hostelsLoading, setHostelsLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Phase 1: Paint cached data instantly (zero network wait on revisits) ──
      const cachedSummary = cacheGet<DashboardSummary>(CACHE_DASHBOARD);
      const cachedUsers   = cacheGet<RecentUserAccount[]>(`${CACHE_RECENT_USERS}:5`);
      const cachedHostels = cacheGet<RecentHostel[]>(`${CACHE_RECENT_HOSTELS}:5`);
      const cachedSuggestions = cacheGet<unknown[]>(CACHE_SUGGESTIONS);

      if (cachedSummary) { setSummary(cachedSummary);       setSummaryLoading(false); }
      if (cachedUsers)   { setRecentUsers(cachedUsers);     setUsersLoading(false); }
      if (cachedHostels) { setRecentHostels(cachedHostels); setHostelsLoading(false); }
      if (cachedSuggestions) { setTotalSuggestions(cachedSuggestions.length); }
      const cachedRawUsers = cacheGet<RawUserNotif[]>(CACHE_ALL_USERS_RAW);
      if (cachedRawUsers) {
        setNotifications(buildNotifications(cachedRawUsers));
        setNotifLoading(false);
      }

      // Phase 1 prefetch: warm up caches for recent profiles in background
      if (cachedUsers) {
        cachedUsers.forEach(u => {
          if (u.UserType === 'Student') getStudentProfile(u.userid);
          else if (u.UserType === 'Hostel Manager') getManagerProfile(u.userid);
        });
      }
      if (cachedHostels) {
        cachedHostels.forEach(h => getHostelDetails(h.hostelId));
      }

      // ── Phase 2: Always refresh from network in background (3 calls, not 6) ──
      try {
        const { summary: freshSummary, recentUsers: freshUsers, recentHostels: freshHostels } =
          await loadDashboardData(true);

        setSummary(freshSummary);       setSummaryLoading(false);
        setRecentUsers(freshUsers);     setUsersLoading(false);
        setRecentHostels(freshHostels); setHostelsLoading(false);
        const freshRawUsers = cacheGet<RawUserNotif[]>(CACHE_ALL_USERS_RAW);
        if (freshRawUsers) setNotifications(buildNotifications(freshRawUsers));
        setNotifLoading(false);

        // Fetch suggestions count in background
        getAllSuggestions(true).then(s => setTotalSuggestions(s.length)).catch(() => {});

        // Phase 2 prefetch: warm up caches for fresh recent profiles
        freshUsers.forEach(u => {
          if (u.UserType === 'Student') getStudentProfile(u.userid);
          else if (u.UserType === 'Hostel Manager') getManagerProfile(u.userid);
        });
        freshHostels.forEach(h => getHostelDetails(h.hostelId));

      } catch (err) {
        // Only show hard error when there is nothing cached to display
        if (!cachedSummary && !cachedUsers && !cachedHostels) {
          const errorMessage = err instanceof Error
            ? `Failed to load dashboard data: ${err.message}`
            : "Failed to load dashboard data. Check backend connection.";
          setError(errorMessage);
        }
        setSummaryLoading(false);
        setUsersLoading(false);
        setHostelsLoading(false);
        setNotifLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) return <h2 style={{ textAlign:"center", marginTop:"40px", color:"red" }}>{error}</h2>;

  // Helper function to determine profile route based on user type
  const getUserProfileRoute = (user: RecentUserAccount) => {
    switch (user.UserType) {
      case "Hostel Manager":
        return `/admin/managers/${user.userid}`;
      case "Student":
        return `/admin/students/${user.userid}`;
      default:
        return "#";
    }
  };

  const dismissNotif = (userid: number) => {
    const set = readDismissed();
    set.add(userid);
    saveDismissed(set);
    setNotifications(prev => prev.filter(n => n.userid !== userid));
  };
  const clearAllNotifs = () => {
    const set = readDismissed();
    notifications.forEach(n => set.add(n.userid));
    saveDismissed(set);
    setNotifications([]);
  };

  const notifsStudents = notifications.filter(n => n.userType === 'Student');
  const notifsManagers = notifications.filter(n => n.userType === 'Hostel Manager');

  return (
    <>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}><i className="fa-solid fa-user-shield"></i> FastStay Admin</div>

        <div className={styles.navLinks}>
          <Link to="/admin" className={styles.active}>Dashboard</Link>
          <Link to="/admin/hostels">Hostels</Link>
          <Link to="/admin/students">Students</Link>
          <Link to="/admin/managers">Managers</Link>
          <Link to="/admin/suggestions">Suggestions</Link>
          <Link to="/admin/logout">Logout</Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>Admin Dashboard</h2>
        <p className={styles.subtitle}>Manage all data throughout the platform.</p>

        {/* DASHBOARD STATS CARDS */}
        <div className={styles.cards}>
          <div className={styles.card}>
            <i className="fa-solid fa-users"></i>
            <p className={styles.cardTitle}>Total Students</p>
            <p className={styles.cardValue}>
              {summaryLoading ? <SkeletonBlock width="55%" height="30px" /> : (summary?.total_students ?? 0)}
            </p>
          </div>

          <div className={styles.card}>
            <i className="fa-solid fa-user-tie"></i>
            <p className={styles.cardTitle}>Hostel Managers</p>
            <p className={styles.cardValue}>
              {summaryLoading ? <SkeletonBlock width="55%" height="30px" /> : (summary?.total_managers ?? 0)}
            </p>
          </div>

          <div className={styles.card}>
            <i className="fa-solid fa-hotel"></i>
            <p className={styles.cardTitle}>Hostels Listed</p>
            <p className={styles.cardValue}>
              {summaryLoading ? <SkeletonBlock width="55%" height="30px" /> : (summary?.total_hostels ?? 0)}
            </p>
          </div>

          <div className={styles.card}>
            <i className="fa-solid fa-bed"></i>
            <p className={styles.cardTitle}>Rooms</p>
            <p className={styles.cardValue}>
              {summaryLoading ? <SkeletonBlock width="55%" height="30px" /> : (summary?.total_rooms ?? 0)}
            </p>
          </div>

          <Link
            to="/admin/hostels/pending"
            style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: '230px' }}
          >
            <div
              className={styles.card}
              style={{
                cursor: 'pointer',
                position: 'relative',
                borderLeft: !summaryLoading && (summary?.total_pending ?? 0) > 0
                  ? '4px solid #d97706'
                  : '4px solid #8d5f3a',
              }}
            >
              {!summaryLoading && (summary?.total_pending ?? 0) > 0 && (
                <span style={{
                  position: 'absolute', top: '12px', right: '14px',
                  backgroundColor: '#d97706', color: 'white',
                  borderRadius: '50%', width: '22px', height: '22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700',
                }}>!</span>
              )}
              <i
                className="fa-solid fa-hourglass-half"
                style={{ color: !summaryLoading && (summary?.total_pending ?? 0) > 0 ? '#d97706' : '#8d5f3a' }}
              ></i>
              <p className={styles.cardTitle}>Pending Approvals</p>
              <p className={styles.cardValue}>
                {summaryLoading ? <SkeletonBlock width="55%" height="30px" /> : (summary?.total_pending ?? 0)}
              </p>
            </div>
          </Link>

          <Link
            to="/admin/suggestions"
            style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: '230px' }}
          >
            <div
              className={styles.card}
              style={{
                cursor: 'pointer',
                position: 'relative',
                borderLeft: totalSuggestions !== null && totalSuggestions > 0
                  ? '4px solid #5c6bc0'
                  : '4px solid #8d5f3a',
              }}
            >
              {totalSuggestions !== null && totalSuggestions > 0 && (
                <span style={{
                  position: 'absolute', top: '12px', right: '14px',
                  backgroundColor: '#5c6bc0', color: 'white',
                  borderRadius: '50%', width: '22px', height: '22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700',
                }}>{totalSuggestions > 9 ? '9+' : totalSuggestions}</span>
              )}
              <i
                className="fa-solid fa-lightbulb"
                style={{ color: totalSuggestions !== null && totalSuggestions > 0 ? '#5c6bc0' : '#8d5f3a' }}
              ></i>
              <p className={styles.cardTitle}>User Suggestions</p>
              <p className={styles.cardValue}>
                {totalSuggestions === null ? <SkeletonBlock width="55%" height="30px" /> : totalSuggestions}
              </p>
            </div>
          </Link>
        </div>

        {/* NEW REGISTRATIONS NOTIFICATION PANEL */}
        {(notifLoading || notifications.length > 0) && (
          <div style={{
            background: '#fffbf7',
            border: '1px solid #e8ddd4',
            borderRadius: '12px',
            marginBottom: '28px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(43,33,28,0.08)',
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #5c3d2e 0%, #8d5f3a 100%)',
              padding: '14px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8f3e7' }}>
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <i className="fa-solid fa-bell" style={{ fontSize: '18px' }}></i>
                  {!notifLoading && notifications.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-7px', right: '-10px',
                      background: '#d97706', color: '#fff',
                      borderRadius: '50%', fontSize: '10px', fontWeight: 800,
                      width: '18px', height: '18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{notifications.length > 9 ? '9+' : notifications.length}</span>
                  )}
                </div>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>New Registrations</span>
              </div>
              {!notifLoading && notifications.length > 0 && (
                <button
                  onClick={clearAllNotifs}
                  style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.35)',
                    color: '#f8f3e7', borderRadius: '6px', padding: '5px 14px',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-check-double"></i> Dismiss All
                </button>
              )}
            </div>

            {/* Body */}
            {notifLoading ? (
              <div style={{ padding: '28px', textAlign: 'center', color: '#888' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>Loading new registrations...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>

                {/* Students column */}
                {notifsStudents.length > 0 && (
                  <div style={{ flex: '1 1 300px', borderRight: notifsManagers.length > 0 ? '1px solid #e8ddd4' : 'none' }}>
                    <div style={{
                      padding: '9px 18px', background: '#fdf6ef',
                      borderBottom: '1px solid #f0e7dc',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      fontSize: '12px', fontWeight: 700, color: '#5c3d2e',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      <i className="fa-solid fa-user-graduate"></i> Students
                      <span style={{ background: '#7D5D4E', color: '#fff', borderRadius: '10px', fontSize: '10px', padding: '1px 7px', fontWeight: 600 }}>
                        {notifsStudents.length}
                      </span>
                    </div>
                    <div style={{ maxHeight: '290px', overflowY: 'auto' }}>
                      {notifsStudents.map(n => (
                        <div key={n.userid} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '11px 18px', borderBottom: '1px solid #f5f0ec',
                        }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7D5D4E, #5c3d2e)',
                            color: '#f8f3e7', fontWeight: 700, fontSize: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{n.name.charAt(0).toUpperCase()}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.name}</div>
                            <div style={{ fontSize: '12px', color: '#8d7060' }}>
                              <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>{n.city}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <Link
                              to={`/admin/students/${n.userid}`}
                              onClick={() => dismissNotif(n.userid)}
                              style={{
                                padding: '5px 13px', background: '#5c3d2e', color: '#f8f3e7',
                                borderRadius: '6px', textDecoration: 'none',
                                fontSize: '12px', fontWeight: 600,
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                              }}
                            >
                              <i className="fa-solid fa-eye"></i> View
                            </Link>
                            <button
                              onClick={() => dismissNotif(n.userid)}
                              title="Dismiss"
                              style={{
                                padding: '5px 9px', background: '#f0e7dc',
                                border: 'none', borderRadius: '6px',
                                cursor: 'pointer', color: '#8d5f3a', fontSize: '13px',
                              }}
                            ><i className="fa-solid fa-xmark"></i></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Managers column */}
                {notifsManagers.length > 0 && (
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{
                      padding: '9px 18px', background: '#fdf6ef',
                      borderBottom: '1px solid #f0e7dc',
                      display: 'flex', alignItems: 'center', gap: '7px',
                      fontSize: '12px', fontWeight: 700, color: '#5c3d2e',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      <i className="fa-solid fa-user-tie"></i> Managers
                      <span style={{ background: '#8B7355', color: '#fff', borderRadius: '10px', fontSize: '10px', padding: '1px 7px', fontWeight: 600 }}>
                        {notifsManagers.length}
                      </span>
                    </div>
                    <div style={{ maxHeight: '290px', overflowY: 'auto' }}>
                      {notifsManagers.map(n => (
                        <div key={n.userid} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '11px 18px', borderBottom: '1px solid #f5f0ec',
                        }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B7355, #5c3d2e)',
                            color: '#f8f3e7', fontWeight: 700, fontSize: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{n.name.charAt(0).toUpperCase()}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.name}</div>
                            <div style={{ fontSize: '12px', color: '#8d7060' }}>
                              <i className="fa-solid fa-location-dot" style={{ marginRight: '4px' }}></i>{n.city}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <Link
                              to={`/admin/managers/${n.userid}`}
                              onClick={() => dismissNotif(n.userid)}
                              style={{
                                padding: '5px 13px', background: '#5c3d2e', color: '#f8f3e7',
                                borderRadius: '6px', textDecoration: 'none',
                                fontSize: '12px', fontWeight: 600,
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                              }}
                            >
                              <i className="fa-solid fa-eye"></i> View
                            </Link>
                            <button
                              onClick={() => dismissNotif(n.userid)}
                              title="Dismiss"
                              style={{
                                padding: '5px 9px', background: '#f0e7dc',
                                border: 'none', borderRadius: '6px',
                                cursor: 'pointer', color: '#8d5f3a', fontSize: '13px',
                              }}
                            ><i className="fa-solid fa-xmark"></i></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* RECENT STUDENTS */}
        <div className={styles.tableCard}>
          <p className={styles.tableTitle}><i className="fa-solid fa-user-plus"></i> Recent User Accounts</p>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>User Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {usersLoading ? (
                <SkeletonRow cols={4} rows={5} />
              ) : recentUsers.length > 0 ? (
                recentUsers.map(u => (
                  <tr key={u.userid}>
                    <td>{u.Name}</td>
                    <td>{u.City}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: u.UserType === 'Student' ? '#7D5D4E' :      // Muted Brown
                                          u.UserType === 'Hostel Manager' ? '#8B7355' : '#A1887F', // Muted Tan & Muted Gray-Brown
                          color: '#F8F3E7',  // Cream text
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          {u.UserType}
                        </span>
                      </td>
                    <td>
                      {u.UserType === "Student" || u.UserType === "Hostel Manager" ? (
                        <Link
                          to={getUserProfileRoute(u)}
                          className={styles.actionBtn}
                          style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            textDecoration: 'none',
                            textAlign: 'center'
                          }}
                        >
                          View
                        </Link>
                      ) : (
                        <button
                          className={styles.actionBtn}
                          disabled
                          title="Profile not available for this user type"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign:"center", padding: "20px" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RECENT HOSTELS TABLE */}
        <div className={styles.tableCard}>
          <p className={styles.tableTitle}><i className="fa-solid fa-building"></i> Recently Added Hostels</p>

          <table>
            <thead>
              <tr>
                <th>Hostel Name</th>
                <th>House No</th>
                <th>Manager</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {hostelsLoading ? (
                <SkeletonRow cols={4} rows={5} />
              ) : recentHostels.length > 0 ? (
                recentHostels.map(h => (
                  <tr key={h.hostelId}>
                    <td>{h.hostelName}</td>
                    <td>{h.houseNo}</td>
                    <td>{h.managerName}</td>
                    <td>
                      <Link
                        to={`/admin/hostels/${h.hostelId}`}
                        className={styles.actionBtn}
                        style={{
                          display: 'inline-block',
                          padding: '8px 16px',
                          textDecoration: 'none',
                          textAlign: 'center'
                        }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign:"center", padding: "20px" }}>
                    No Hostels Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;