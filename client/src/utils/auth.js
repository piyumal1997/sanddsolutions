// src/utils/auth.js
import Swal from 'sweetalert2';

const TOKEN_KEY = 'adminToken';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

let inactivityTimer = null;

// ────────────────────────────────────────────────
// Token Management
// ────────────────────────────────────────────────
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    resetInactivityTimer();
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  clearTimeout(inactivityTimer);
};

// ────────────────────────────────────────────────
// Authentication Check
// ────────────────────────────────────────────────
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  // Optional: basic JWT format check (can be expanded)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // convert to ms
    return exp > Date.now();
  } catch {
    return false;
  }
};

// ────────────────────────────────────────────────
// Auto-Logout on Inactivity
// ────────────────────────────────────────────────
export const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT_MS);
};

export const logout = (reason = 'Session expired due to inactivity') => {
  removeToken();
  Swal.fire({
    icon: 'info',
    title: 'Logged Out',
    text: reason,
    timer: 2500,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = '/admin'; // redirect to login
  });
};

// ────────────────────────────────────────────────
// Setup Activity Listeners (call this once on mount)
// ────────────────────────────────────────────────
export const setupActivityListeners = () => {
  const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

  const handleActivity = () => {
    resetInactivityTimer();
  };

  events.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true });
  });

  // Cleanup function
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    clearTimeout(inactivityTimer);
  };
};

// ────────────────────────────────────────────────
// Protected Fetch Wrapper (auto logout on 401)
// ────────────────────────────────────────────────
export const protectedFetch = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    logout('No active session');
    throw new Error('No authentication token');
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, finalOptions);

  // Auto-logout on 401 (token invalid/expired)
  if (response.status === 401) {
    logout('Session expired or invalid. Please log in again.');
    throw new Error('Unauthorized - session expired');
  }

  return response;
};

// ────────────────────────────────────────────────
// Optional: Get current user info from token (without API call)
// ────────────────────────────────────────────────
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
};