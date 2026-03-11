
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSideNavbar from "../components/AdminSideNavbar";

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
import { SkeletonBlock } from "../components/SkeletonRow";
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
      {/* ADMIN SIDE NAVBAR */}
      <AdminSideNavbar active="dashboard" />

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
      <div className={styles.container}>
        <h2 className={styles.pageTitle}>Admin Dashboard</h2>
        <p className={styles.subtitle}>Manage all data throughout the platform.</p>

        {/* PLATFORM OVERVIEW — merged clickable stats panel */}
        <div style={{
          background: '#f8f3e7',
          borderRadius: '16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.22)',
          marginBottom: '24px',
          overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            background: 'linear-gradient(135deg, #5c3d2e 0%, #8d5f3a 100%)',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <i className="fa-solid fa-chart-pie" style={{ color: '#f8f3e7', fontSize: '16px' }}></i>
            <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px', letterSpacing: '0.3px' }}>
              Platform Overview
            </span>
          </div>

          {/* Three stat tiles */}
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>

            {/* Students tile */}
            <Link to="/admin/students" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
              <div style={{
                padding: '24px 28px',
                borderRight: '1px solid #ede4d8',
                borderBottom: '1px solid #ede4d8',
                cursor: 'pointer',
                transition: 'background 0.18s',
                background: 'transparent',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf6ef')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7D5D4E, #5c3d2e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="fa-solid fa-users" style={{ color: '#f8f3e7', fontSize: '18px' }}></i>
                  </div>
                  <i className="fa-solid fa-arrow-right" style={{ color: '#c9b8a8', fontSize: '13px' }}></i>
                </div>
                <p style={{ fontSize: '13px', color: '#8d7060', fontWeight: 500, marginBottom: '4px' }}>Total Students</p>
                <p style={{ fontSize: '30px', fontWeight: 700, color: '#2b211c', lineHeight: 1 }}>
                  {summaryLoading ? <SkeletonBlock width="60px" height="32px" /> : (summary?.total_students ?? 0)}
                </p>
                <p style={{ fontSize: '11px', color: '#b49a89', marginTop: '8px', fontWeight: 500 }}>
                  View all students →
                </p>
              </div>
            </Link>

            {/* Managers tile */}
            <Link to="/admin/managers" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
              <div style={{
                padding: '24px 28px',
                borderRight: '1px solid #ede4d8',
                borderBottom: '1px solid #ede4d8',
                cursor: 'pointer',
                transition: 'background 0.18s',
                background: 'transparent',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf6ef')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8B7355, #5c3d2e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="fa-solid fa-user-tie" style={{ color: '#f8f3e7', fontSize: '18px' }}></i>
                  </div>
                  <i className="fa-solid fa-arrow-right" style={{ color: '#c9b8a8', fontSize: '13px' }}></i>
                </div>
                <p style={{ fontSize: '13px', color: '#8d7060', fontWeight: 500, marginBottom: '4px' }}>Hostel Managers</p>
                <p style={{ fontSize: '30px', fontWeight: 700, color: '#2b211c', lineHeight: 1 }}>
                  {summaryLoading ? <SkeletonBlock width="60px" height="32px" /> : (summary?.total_managers ?? 0)}
                </p>
                <p style={{ fontSize: '11px', color: '#b49a89', marginTop: '8px', fontWeight: 500 }}>
                  View all managers →
                </p>
              </div>
            </Link>

            {/* Hostels tile */}
            <Link to="/admin/hostels" style={{ textDecoration: 'none', flex: '1 1 200px' }}>
              <div style={{
                padding: '24px 28px',
                borderBottom: '1px solid #ede4d8',
                cursor: 'pointer',
                transition: 'background 0.18s',
                background: 'transparent',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf6ef')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6d8c6d, #3a5f3a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="fa-solid fa-hotel" style={{ color: '#f8f3e7', fontSize: '18px' }}></i>
                  </div>
                  <i className="fa-solid fa-arrow-right" style={{ color: '#c9b8a8', fontSize: '13px' }}></i>
                </div>
                <p style={{ fontSize: '13px', color: '#8d7060', fontWeight: 500, marginBottom: '4px' }}>Hostels Listed</p>
                <p style={{ fontSize: '30px', fontWeight: 700, color: '#2b211c', lineHeight: 1 }}>
                  {summaryLoading ? <SkeletonBlock width="60px" height="32px" /> : (summary?.total_hostels ?? 0)}
                </p>
                <p style={{ fontSize: '11px', color: '#b49a89', marginTop: '8px', fontWeight: 500 }}>
                  View all hostels →
                </p>
              </div>
            </Link>

          </div>
        </div>

        {/* ALERT CARDS ROW — Pending Approvals + Suggestions */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>

          {/* Pending Approvals */}
          <Link to="/admin/hostels/pending" style={{ textDecoration: 'none', flex: '1 1 260px' }}>
            <div style={{
              background: !summaryLoading && (summary?.total_pending ?? 0) > 0 ? '#fffbf2' : '#f8f3e7',
              borderRadius: '14px',
              padding: '20px 24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              borderLeft: !summaryLoading && (summary?.total_pending ?? 0) > 0 ? '5px solid #d97706' : '5px solid #c9b8a8',
              display: 'flex', alignItems: 'center', gap: '18px',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 22px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                background: !summaryLoading && (summary?.total_pending ?? 0) > 0
                  ? 'linear-gradient(135deg, #d97706, #b45309)'
                  : 'linear-gradient(135deg, #a89080, #7a6048)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa-solid fa-hourglass-half" style={{ color: '#fff', fontSize: '20px' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, marginBottom: '2px' }}>Pending Approvals</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#2b211c', lineHeight: 1 }}>
                  {summaryLoading ? <SkeletonBlock width="50px" height="28px" /> : (summary?.total_pending ?? 0)}
                </p>
              </div>
              {!summaryLoading && (summary?.total_pending ?? 0) > 0 && (
                <span style={{
                  background: '#d97706', color: '#fff',
                  borderRadius: '20px', padding: '3px 10px',
                  fontSize: '11px', fontWeight: 700,
                }}>Review</span>
              )}
            </div>
          </Link>

          {/* Suggestions */}
          <Link to="/admin/suggestions" style={{ textDecoration: 'none', flex: '1 1 260px' }}>
            <div style={{
              background: totalSuggestions !== null && totalSuggestions > 0 ? '#f8f7ff' : '#f8f3e7',
              borderRadius: '14px',
              padding: '20px 24px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              borderLeft: totalSuggestions !== null && totalSuggestions > 0 ? '5px solid #5c6bc0' : '5px solid #c9b8a8',
              display: 'flex', alignItems: 'center', gap: '18px',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 22px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                background: totalSuggestions !== null && totalSuggestions > 0
                  ? 'linear-gradient(135deg, #5c6bc0, #3949ab)'
                  : 'linear-gradient(135deg, #a89080, #7a6048)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa-solid fa-lightbulb" style={{ color: '#fff', fontSize: '20px' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#8d7060', fontWeight: 500, marginBottom: '2px' }}>User Suggestions</p>
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#2b211c', lineHeight: 1 }}>
                  {totalSuggestions === null ? <SkeletonBlock width="50px" height="28px" /> : totalSuggestions}
                </p>
              </div>
              {totalSuggestions !== null && totalSuggestions > 0 && (
                <span style={{
                  background: '#5c6bc0', color: '#fff',
                  borderRadius: '20px', padding: '3px 10px',
                  fontSize: '11px', fontWeight: 700,
                }}>{totalSuggestions > 99 ? '99+' : totalSuggestions} new</span>
              )}
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

        {/* RECENT USER ACCOUNTS */}
        <div style={{
          background: '#f8f3e7', borderRadius: '16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '28px', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #5c3d2e 0%, #8d5f3a 100%)',
            padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-user-plus" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
              <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>Recent User Accounts</span>
            </div>
            {!usersLoading && recentUsers.length > 0 && (
              <span style={{
                background: 'rgba(255,255,255,0.18)', color: '#f8f3e7',
                borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600,
              }}>{recentUsers.length} users</span>
            )}
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 140px 90px',
            padding: '8px 20px', background: '#fdf6ef',
            borderBottom: '1px solid #ede4d8',
            fontSize: '11px', fontWeight: 700, color: '#8d7060',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            <span>User</span><span>City</span><span>Type</span><span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {/* Rows */}
          {usersLoading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <SkeletonBlock width="38px" height="38px" />
                  <SkeletonBlock width="180px" height="16px" />
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8d7060' }}>
              <i className="fa-solid fa-users" style={{ fontSize: '32px', marginBottom: '10px', display: 'block', color: '#c9b8a8' }}></i>
              No recent accounts found.
            </div>
          ) : (
            recentUsers.map((u, i) => (
              <div key={u.userid} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 140px 90px',
                alignItems: 'center', padding: '12px 20px',
                borderBottom: i < recentUsers.length - 1 ? '1px solid #f0e9e0' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fdf6ef')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name + avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: u.UserType === 'Student'
                      ? 'linear-gradient(135deg, #7D5D4E, #5c3d2e)'
                      : 'linear-gradient(135deg, #8B7355, #5c3d2e)',
                    color: '#f8f3e7', fontWeight: 700, fontSize: '15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{u.Name.charAt(0).toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.Name}</div>
                    <div style={{ fontSize: '11px', color: '#a89080' }}>ID #{u.userid}</div>
                  </div>
                </div>
                {/* City */}
                <div style={{ fontSize: '13px', color: '#6d5d52' }}>
                  <i className="fa-solid fa-location-dot" style={{ marginRight: '4px', color: '#b49a89' }}></i>{u.City}
                </div>
                {/* Type badge */}
                <div>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 700,
                    backgroundColor: u.UserType === 'Student' ? '#7D5D4E' : u.UserType === 'Hostel Manager' ? '#8B7355' : '#A1887F',
                    color: '#F8F3E7',
                  }}>{u.UserType}</span>
                </div>
                {/* Action */}
                <div style={{ textAlign: 'right' }}>
                  {u.UserType === 'Student' || u.UserType === 'Hostel Manager' ? (
                    <Link to={getUserProfileRoute(u)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '6px 14px', background: '#5c3d2e', color: '#f8f3e7',
                      borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                    }}>
                      <i className="fa-solid fa-eye"></i> View
                    </Link>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#c9b8a8' }}>—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RECENTLY ADDED HOSTELS */}
        <div style={{
          background: '#f8f3e7', borderRadius: '16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.22)', marginBottom: '28px', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #3a5f3a 0%, #6d8c6d 100%)',
            padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-building" style={{ color: '#f8f3e7', fontSize: '15px' }}></i>
              <span style={{ color: '#f8f3e7', fontWeight: 700, fontSize: '15px' }}>Recently Added Hostels</span>
            </div>
            {!hostelsLoading && recentHostels.length > 0 && (
              <span style={{
                background: 'rgba(255,255,255,0.18)', color: '#f8f3e7',
                borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600,
              }}>{recentHostels.length} hostels</span>
            )}
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 160px 160px 90px',
            padding: '8px 20px', background: '#f3f8f3',
            borderBottom: '1px solid #deeade',
            fontSize: '11px', fontWeight: 700, color: '#5a7060',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            <span>Hostel</span><span>Block / House No</span><span>Manager</span><span style={{ textAlign: 'right' }}>Action</span>
          </div>

          {/* Rows */}
          {hostelsLoading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <SkeletonBlock width="42px" height="42px" />
                  <SkeletonBlock width="200px" height="16px" />
                </div>
              ))}
            </div>
          ) : recentHostels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8d7060' }}>
              <i className="fa-solid fa-hotel" style={{ fontSize: '32px', marginBottom: '10px', display: 'block', color: '#c9b8a8' }}></i>
              No recent hostels found.
            </div>
          ) : (
            recentHostels.map((h, i) => (
              <div key={h.hostelId} style={{
                display: 'grid', gridTemplateColumns: '1fr 160px 160px 90px',
                alignItems: 'center', padding: '12px 20px',
                borderBottom: i < recentHostels.length - 1 ? '1px solid #e8f0e8' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f3f8f3')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Hostel name + icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #6d8c6d, #3a5f3a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="fa-solid fa-hotel" style={{ color: '#f8f3e7', fontSize: '17px' }}></i>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#2b211c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.hostelName}</div>
                    <div style={{ fontSize: '11px', color: '#a89080' }}>ID #{h.hostelId}</div>
                  </div>
                </div>
                {/* Block / House No */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {h.blockNo && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#1565c0', backgroundColor: '#e8f2fb', borderRadius: '5px', padding: '1px 6px', width: 'fit-content' }}>
                      <i className="fa-solid fa-map-pin" style={{ fontSize: '9px' }}></i>{h.blockNo}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: '#6d5d52', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-hashtag" style={{ color: '#b49a89', fontSize: '10px' }}></i>{h.houseNo || '—'}
                  </span>
                </div>
                {/* Manager */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #8B7355, #5c3d2e)',
                    color: '#f8f3e7', fontWeight: 700, fontSize: '11px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{(h.managerName || 'U').charAt(0).toUpperCase()}</div>
                  <span style={{ fontSize: '13px', color: '#6d5d52', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.managerName || 'Unknown'}</span>
                </div>
                {/* Action */}
                <div style={{ textAlign: 'right' }}>
                  <Link to={`/admin/hostels/${h.hostelId}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '6px 14px', background: '#3a5f3a', color: '#f8f3e7',
                    borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                  }}>
                    <i className="fa-solid fa-eye"></i> View
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminDashboard;