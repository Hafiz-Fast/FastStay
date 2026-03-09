import { useState } from "react";
import axios from "axios";
import styles from "../styles/Login.module.css";
import { useGoogleLogin } from "@react-oauth/google";
import { setAuthenticatedUser, setAuthenticatedUserType, loginAsGuest } from "../utils/auth";

const Login: React.FC = () => {
  const adminModeFromQuery = new URLSearchParams(window.location.search).get("admin") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminMode, setAdminMode] = useState(adminModeFromQuery);
  const [adminSecret, setAdminSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Switch between normal and admin mode
  const toggleAdminMode = () => {
    setAdminMode(prev => !prev);
    setAdminSecret("");
    setError("");
    setEmail("");
    setPassword("");
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        // Autofill email field
        setEmail(userInfo.data.email);
        document.querySelector<HTMLInputElement>('input[type="password"]')?.focus();

      } catch (err) {
        alert("Failed to fetch Google account info");
      }
    },
    onError: () => {
      alert("Google Login Failed");
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- Admin login: only access code needed ---
    if (adminMode) {
      try {
        await axios.post("http://127.0.0.1:8000/faststay_app/admin/verify-access/", {
          admin_secret: adminSecret,
        });
        setAuthenticatedUser("admin");
        setAuthenticatedUserType("Admin");
        window.location.href = "/admin";
      } catch (err: any) {
        setError(err.response?.data?.error || "Invalid access code.");
      }
      setLoading(false);
      return;
    }

    // --- Normal login ---
    try {
      const response = await axios.post("http://127.0.0.1:8000/faststay_app/login/", {
        email,
        password,
      });

      // Store authenticated user ID and type before redirecting
      setAuthenticatedUser(String(response.data.user_id));
      setAuthenticatedUserType(response.data.usertype);

      if (response.data.usertype === "Hostel Manager") {
        window.location.href = `/manager/dashboard?user_id=${response.data.user_id}`;
      } else if (response.data.usertype === "Student") {
        window.location.href = `/student/home?user_id=${response.data.user_id}`;
      } else if (response.data.usertype === "Admin") {
        window.location.href = `/admin`;
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Try again.");
      }
    }

    setLoading(false);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    window.location.href = `/student/home?user_id=guest`;
  };

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.loginCard}>

          <h2 className={styles.title}>
            <i className="fa-solid fa-building-user"></i> FastStay
          </h2>
          <p className={styles.subtitle}>Your trusted hostel companion</p>

          <button
            type="button"
            onClick={toggleAdminMode}
            className={styles.adminToggle}
          >
            <i className="fa-solid fa-user-shield"></i>
            {adminMode ? " Back to normal login" : " Login as Admin"}
          </button>

          <form onSubmit={handleLogin}>

            {adminMode ? (
              /* ---- Admin mode: only access code ---- */
              <>
                <p style={{ textAlign: "center", fontSize: "13px", color: "#5c3d2e", marginBottom: "12px" }}>
                  <i className="fa-solid fa-lock"></i> Enter your admin access code
                </p>
                <div className={styles.inputGroup}>
                  <i className="fa-solid fa-key"></i>
                  <input
                    type="password"
                    placeholder="Admin Access Code"
                    required
                    autoFocus
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                  />
                </div>
              </>
            ) : (
              /* ---- Normal mode: email + password ---- */
              <>
                <div className={styles.inputGroup}>
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            <button className={styles.btn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : adminMode ? "Enter Admin Portal" : "Login"}
            </button>

            {!adminMode && (
              <>
                <div className={styles.divider}>or</div>

            <button
              className={styles.googleBtn}
              type="button"
              onClick={() => googleLogin()}
            >
              <i className="fa-brands fa-google"></i> Login with Google
            </button>

            <button
              className={styles.guestBtn}
              type="button"
              onClick={handleGuestLogin}
            >
              <i className="fa-solid fa-user-secret"></i> Continue as Guest
            </button>

              <p className={styles.bottomText}>
                Don't have an account?
                <a href="/signup"> Create Account</a>
              </p>
            </>
            )}

          </form>

          <div className={styles.errorSpace}>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;