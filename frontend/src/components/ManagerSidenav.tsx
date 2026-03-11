import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/ManagerSidenav.module.css";

interface ManagerSidenavProps {
  managerId: number;
  activePage?: string;
}

export default function ManagerSidenav({ managerId, activePage }: ManagerSidenavProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { to: `/manager/dashboard?user_id=${managerId}`, label: "Dashboard", icon: "fa-solid fa-gauge", key: "dashboard" },
    { to: `/manager/add_hostel?user_id=${managerId}`, label: "Add Hostel", icon: "fa-solid fa-plus", key: "add_hostel" },
    { to: `/manager/add_room?user_id=${managerId}`, label: "Add Room", icon: "fa-solid fa-bed", key: "add_room" },
    { to: `/manager/analytics?user_id=${managerId}`, label: "Analytics", icon: "fa-solid fa-chart-line", key: "analytics" },
    { to: `/manager/profile?user_id=${managerId}`, label: "Your Profile", icon: "fa-solid fa-user", key: "profile" },
    { to: "/", label: "Logout", icon: "fa-solid fa-right-from-bracket", key: "logout" },
  ];

  return (
    <>
      <button className={styles.hamburger} onClick={() => setOpen(true)} aria-label="Open menu">
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidenav panel */}
      <nav className={`${styles.sidenav} ${open ? styles.open : ""}`}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <i className="fa-solid fa-building-user"></i> FastStay
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close menu">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <ul className={styles.navList}>
          {links.map((link) => (
            <li key={link.key}>
              <Link
                to={link.to}
                className={`${styles.navItem} ${activePage === link.key ? styles.active : ""}`}
                onClick={() => setOpen(false)}
              >
                <i className={link.icon}></i>
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
