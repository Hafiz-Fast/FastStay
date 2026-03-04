import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/Navbar.module.css";

interface NavbarProps {
  userId: string;
}

const SharedNavbar: React.FC<NavbarProps> = ({ userId }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentUrl = `${location.pathname}${location.search}`;
    navigate(`/admin/logout?from=${encodeURIComponent(currentUrl)}`);
  };

  const isActive = (path: string) => {
    return currentPath.includes(path)
      ? `${styles.navLinkItem} ${styles.active || ''}`.trim()
      : styles.navLinkItem;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <i className="fa-solid fa-building-user"></i> FastStay
      </div>
      <div className={styles.navLinks}>
        <Link
          to={`/student/home?user_id=${userId}`}
          className={isActive("/student/home")}
        >
          Home
        </Link>
        <Link
          to={`/student/profile?user_id=${userId}`}
          className={isActive("/student/profile")}
        >
          My Profile
        </Link>
        <Link
          to={`/student/suggestions?user_id=${userId}`}
          className={isActive("/student/suggestions")}
        >
          Recommendations
        </Link>
        <a href="" onClick={handleLogout} className={styles.navLinkItem}>
          Sign out
        </a>
      </div>
    </nav>
  );
};

export default SharedNavbar;