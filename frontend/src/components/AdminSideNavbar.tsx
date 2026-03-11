import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/admin_side_navbar.module.css";

type ActivePage = "dashboard" | "hostels" | "students" | "managers" | "suggestions";

interface Props {
  active?: ActivePage;
}

const navItems: { to: string; label: string; key: ActivePage; icon: string }[] = [
  { to: "/admin",              label: "Dashboard",   key: "dashboard",   icon: "fa-gauge-high"     },
  { to: "/admin/hostels",      label: "Hostels",     key: "hostels",     icon: "fa-building"       },
  { to: "/admin/students",     label: "Students",    key: "students",    icon: "fa-user-graduate"  },
  { to: "/admin/managers",     label: "Managers",    key: "managers",    icon: "fa-user-tie"       },
  { to: "/admin/suggestions",  label: "Suggestions", key: "suggestions", icon: "fa-lightbulb"      },
];

const AdminSideNavbar: React.FC<Props> = ({ active }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        className={styles.hamburger}
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Backdrop overlay — mobile only */}
      {open && (
        <div className={styles.overlay} onClick={close} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <i className="fa-solid fa-user-shield"></i>
          <span>FastStay Admin</span>
        </div>

        {/* Close button — mobile only */}
        <button
          className={styles.closeBtn}
          onClick={close}
          aria-label="Close navigation"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Navigation links */}
        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.key}
              to={item.to}
              className={`${styles.navItem} ${active === item.key ? styles.navItemActive : ""}`}
              onClick={close}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className={styles.logoutSection}>
          <button
            className={styles.logoutBtn}
            onClick={() => { close(); navigate("/admin/logout"); }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSideNavbar;
