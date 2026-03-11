import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * Hook that validates the user_id from URL against session.
 * Redirects to "/" if unauthorized.
 * Returns the validated userId.
 */
const useAuthGuard = (options?: { allowGuest?: boolean }): string => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const allowGuest = options?.allowGuest ?? false;

  const userId =
    searchParams.get("user_id") ||
    sessionStorage.getItem("authenticated_user") ||
    "";

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    if (userId === "guest" && !allowGuest) {
      // Will be handled by the page component itself
      return;
    }

    if (userId !== "guest") {
      const storedUser = sessionStorage.getItem("authenticated_user");
      if (storedUser && storedUser !== userId) {
        navigate("/");
      }
    }
  }, [userId, navigate, allowGuest]);

  return userId;
};

export default useAuthGuard;
