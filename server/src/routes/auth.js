// client/src/utils/auth.js
import Swal from 'sweetalert2';

const TOKEN_KEY = 'adminToken';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let timeoutId = null;
let lastActivity = Date.now();

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  resetInactivityTimer();
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  clearTimeout(timeoutId);
  window.location.href = '/admin'; // or '/login'
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  removeToken();
  Swal.fire({
    icon: 'info',
    title: 'Session Ended',
    text: 'You have been logged out due to inactivity or invalid session.',
    timer: 3000,
  });
};

// Reset timer on user activity
export const resetInactivityTimer = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(logout, INACTIVITY_TIMEOUT);
  lastActivity = Date.now();
};

// Call this on mount + on user events (mousemove, keydown, etc.)
export const setupActivityListeners = () => {
  const events = ['mousemove', 'keydown', 'scroll', 'click'];
  events.forEach(event => window.addEventListener(event, resetInactivityTimer));
  return () => events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
};

// Protected fetch wrapper (auto logout on 401)
export const protectedFetch = async (url, options = {}) => {
  const token = getToken();
  if (!token) {
    logout();
    throw new Error('No token');
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    logout();
    throw new Error('Session expired');
  }

  return res;
};