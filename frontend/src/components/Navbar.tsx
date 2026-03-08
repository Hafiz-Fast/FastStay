import React, { useState, useCallback, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/Navbar.module.css";

interface NavbarProps {
  userId: string;
}

const SharedNavbar: React.FC<NavbarProps> = ({ userId }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const isGuest = userId === "guest";
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.search]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleLogout = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const currentUrl = `${location.pathname}${location.search}`;
    navigate(`/admin/logout?from=${encodeURIComponent(currentUrl)}`);
  }, [location, navigate]);

  const isActive = useCallback((path: string) => {
    return currentPath.includes(path)
      ? `${styles.navLinkItem} ${styles.active || ''}`.trim()
      : styles.navLinkItem;
  }, [currentPath]);

  const isDrawerActive = useCallback((path: string) => {
    return currentPath.includes(path)
      ? `${styles.drawerLink} ${styles.active}`.trim()
      : styles.drawerLink;
  }, [currentPath]);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <i className="fa-solid fa-building-user"></i> FastStay
        </div>

        {/* Desktop nav links */}
        <div className={styles.navLinks}>
          <Link to={`/student/home?user_id=${userId}`} className={isActive("/student/home")}>
            Home
          </Link>
          {isGuest ? (
            <span className={`${styles.navLinkItem} ${styles.disabledLink}`}>
              My Profile
              <span className={styles.tooltip}>Create an account first</span>
            </span>
          ) : (
            <Link to={`/student/profile?user_id=${userId}`} className={isActive("/student/profile")}>
              My Profile
            </Link>
          )}
          {isGuest ? (
            <span className={`${styles.navLinkItem} ${styles.disabledLink}`}>
              Recommendations
              <span className={styles.tooltip}>Create an account first</span>
            </span>
          ) : (
            <Link to={`/student/suggestions?user_id=${userId}`} className={isActive("/student/suggestions")}>
              Recommendations
            </Link>
          )}
          <a href="" onClick={handleLogout} className={styles.navLinkItem}>
            Sign out
          </a>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className={`${styles.hamburger} ${drawerOpen ? styles.hamburgerOpen : ""}`}
          onClick={() => setDrawerOpen(prev => !prev)}
          aria-label="Toggle menu"
          aria-expanded={drawerOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </nav>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${drawerOpen ? styles.overlayVisible : ""}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Side Drawer */}
      <aside className={`${styles.sideDrawer} ${drawerOpen ? styles.sideDrawerOpen : ""}`} aria-label="Mobile navigation">
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLogo}>
            <i className="fa-solid fa-building-user"></i> FastStay
          </span>
          <button className={styles.drawerClose} onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className={styles.drawerLinks}>
          <Link to={`/student/home?user_id=${userId}`} className={isDrawerActive("/student/home")}>
            <i className="fa-solid fa-house"></i> Home
          </Link>

          <div className={styles.drawerDivider} />

          {isGuest ? (
            <span className={styles.drawerLinkDisabled}>
              <i className="fa-solid fa-user"></i> My Profile
            </span>
          ) : (
            <Link to={`/student/profile?user_id=${userId}`} className={isDrawerActive("/student/profile")}>
              <i className="fa-solid fa-user"></i> My Profile
            </Link>
          )}

          {isGuest ? (
            <span className={styles.drawerLinkDisabled}>
              <i className="fa-solid fa-lightbulb"></i> Recommendations
            </span>
          ) : (
            <Link to={`/student/suggestions?user_id=${userId}`} className={isDrawerActive("/student/suggestions")}>
              <i className="fa-solid fa-lightbulb"></i> Recommendations
            </Link>
          )}

          <div className={styles.drawerDivider} />

          <a href="" onClick={handleLogout} className={styles.drawerLink}>
            <i className="fa-solid fa-right-from-bracket"></i> Sign out
          </a>
        </div>

        <div className={styles.drawerFooter}>
          <p>© {new Date().getFullYear()} FastStay</p>
        </div>
      </aside>
    </>
  );
};

export default SharedNavbar;