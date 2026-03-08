/**
 * Store the authenticated user ID after login.
 * Call this from your login page upon successful authentication.
 */
export const setAuthenticatedUser = (userId: string) => {
  sessionStorage.setItem("authenticated_user", userId);
};

/**
 * Get the authenticated user ID from session storage.
 */
export const getAuthenticatedUser = (): string | null => {
  return sessionStorage.getItem("authenticated_user_id");
};

/**
 * Clear the authenticated user (on logout).
 */
export const clearAuthenticatedUser = () => {
  sessionStorage.removeItem("authenticated_user_id");
};

/**
 * Validate that the user_id in the URL matches the authenticated user.
 * Returns the valid userId if matched, or null if not.
 */
export const validateUserAccess = (urlUserId: string | null): string | null => {
  const authenticatedId = getAuthenticatedUser();
  if (!authenticatedId || !urlUserId) return null;
  if (urlUserId !== authenticatedId) return null;
  return authenticatedId;
};

/**
 * Login as a guest user.
 */
export const loginAsGuest = () => {
  sessionStorage.setItem("authenticated_user", "guest");
};

/**
 * Check if the current user is a guest.
 */
export const isGuestUser = (userId: string | null): boolean => {
  return userId === "guest";
};
