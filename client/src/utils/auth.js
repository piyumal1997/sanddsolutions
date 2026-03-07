import Swal from "sweetalert2";

// --- Constants ---
const TOKEN_KEY = "adminToken";
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ADMIN_ROUTE = "/admin";

let inactivityTimer = null;

// --- Internal Helpers (Private) ---

/**
 * Safely decodes a JWT payload.
 * Prevents crashes from malformed tokens or non-standard characters.
 */
const getDecodedPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;

    // Using decodeURIComponent + escape to handle potential Unicode characters safely
    const jsonPayload = decodeURIComponent(
      atob(payloadBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// --- Exported Auth Utilities ---

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    resetInactivityTimer();
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  if (inactivityTimer) clearTimeout(inactivityTimer);
};

export const logout = (reason = "Session expired") => {
  removeToken();
  Swal.fire({
    icon: "info",
    title: "Logged Out",
    text: reason,
    timer: 2500,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = ADMIN_ROUTE;
  });
};

/**
 * Checks if the user is authenticated and the token is not expired.
 */
export const isAuthenticated = () => {
  const payload = getDecodedPayload(getToken());
  if (!payload || !payload.exp) return false;

  const bufferTime = 5000; // 5s buffer to prevent edge-case race conditions
  return payload.exp * 1000 > Date.now() + bufferTime;
};

/**
 * Returns user details from the JWT.
 */
export const getCurrentUser = () => {
  const payload = getDecodedPayload(getToken());
  if (!payload || !isAuthenticated()) return null;

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
};

// --- Inactivity Logic ---

export const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(
    () => logout("Inactivity timeout"),
    INACTIVITY_TIMEOUT_MS,
  );
};

export const setupActivityListeners = () => {
  const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
  const handleActivity = () => resetInactivityTimer();

  events.forEach((event) =>
    window.addEventListener(event, handleActivity, { passive: true }),
  );

  // Cleanup function to avoid memory leaks
  return () => {
    events.forEach((event) =>
      window.removeEventListener(event, handleActivity),
    );
    if (inactivityTimer) clearTimeout(inactivityTimer);
  };
};

// --- API Utilities ---

/**
 * Wrapper for fetch that injects the Auth header and handles basic session validation.
 */
export const protectedFetch = async (url, options = {}) => {
  const token = getToken();

  if (!token || !isAuthenticated()) {
    logout("Session invalid or expired");
    return;
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  // Logic for FormData vs JSON content types
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Ethical Handling: If the server returns a 401, force logout.
    if (response.status === 401) {
      logout("Session revoked by server");
      return;
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
