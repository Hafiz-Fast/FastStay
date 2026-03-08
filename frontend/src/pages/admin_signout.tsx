import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearAuthenticatedUser } from "../utils/auth";

const LogoutConfirm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const handleCancel = () => {
    navigate(from);
  };

  const handleLogout = () => {
    clearAuthenticatedUser();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#3b2c24",
        color: "#f8f3e7",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#f8f3e7",
          color: "#3b2c24",
          padding: "35px",
          borderRadius: "18px",
          textAlign: "center",
          boxShadow: "0px 8px 25px rgba(0,0,0,0.35)",
        }}
      >
        <i
          className="fa-solid fa-door-open"
          style={{ fontSize: "50px", color: "#8d5f3a", marginBottom: "10px" }}
        ></i>

        <p style={{ fontSize: "24px", fontWeight: "600", marginBottom: "5px" }}>
          Confirm Sign out
        </p>

        <p style={{ fontSize: "14px", color: "#6a5446", marginBottom: "22px" }}>
          Are you sure you want to Sign out from FastStay?
        </p>

        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button
            onClick={handleLogout}
            style={{
              background: "#8d5f3a",
              padding: "10px 22px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontWeight: "500",
            }}
          >
            Sign out
          </button>

          <button
            onClick={handleCancel}
            style={{
              background: "#c4b6a8",
              padding: "10px 22px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              color: "#3b2c24",
              fontWeight: "500",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirm;
