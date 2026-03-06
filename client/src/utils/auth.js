// src/utils/auth.js
import Swal from 'sweetalert2';

const TOKEN_KEY = 'adminToken';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

let inactivityTimer = null;

// Get token safely
export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Set token + reset timer
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

// Safe isAuthenticated (no crash on undefined token)
export const isAuthenticated = () => {
  const token = getToken();
  if (!token || typeof token !== 'string') return false;

  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return false;

    const payload = JSON.parse(atob(payloadBase64));
    const exp = payload.exp * 1000;
    return exp > Date.now();
  } catch {
    return false;
  }
};

// Logout with reason
export const logout = (reason = 'Session expired') => {
  removeToken();
  Swal.fire({
    icon: 'info',
    title: 'Logged Out',
    text: reason,
    timer: 2500,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = '/admin';
  });
};

// Reset inactivity timer
export const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => logout('Inactivity timeout'), INACTIVITY_TIMEOUT_MS);
};

// Setup listeners (call once when logged in)
export const setupActivityListeners = () => {
  const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

  const handleActivity = () => resetInactivityTimer();

  events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

  return () => {
    events.forEach(event => window.removeEventListener(event, handleActivity));
    clearTimeout(inactivityTimer);
  };
};

// src/utils/auth.js
export const protectedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token'); // Double-check this key name matches your login logic

  if (!token) {
    //Redirect to login if no token exists
    globalThis.location.href = '/login';
    return;
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`, // Must follow the "Bearer <token>" format
  };

  // Ensure we don't break FormData as discussed previously
  if (options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, { ...options, headers });
};

// Get user from token (safe, no crash)
export const getCurrentUser = () => {
  const token = getToken();
  if (!token || typeof token !== 'string') return null;

  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return null;

    const payload = JSON.parse(atob(payloadBase64));
    if (payload.exp * 1000 <= Date.now()) return null;

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};