import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { validateUserAccess } from "../utils/auth";

/**
 * Hook that validates the user_id from URL against session.
 * Redirects to "/" if unauthorized.
 * Returns the validated userId.
 */
const useAuthGuard = (): string => {
  const navigate = useNavigate();
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const urlUserId = queryParams.get("user_id");

  useEffect(() => {
    const validId = validateUserAccess(urlUserId);
    if (!validId) {
      // Clear everything and redirect to login
      sessionStorage.clear();
      navigate("/", { replace: true });
    }
  }, [urlUserId, navigate]);

  // Return the userId (will be empty string briefly before redirect if invalid)
  return urlUserId || "";
};

export default useAuthGuard;
