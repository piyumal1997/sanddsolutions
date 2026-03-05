// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Check if token expired
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.id,
            email: payload.email,
            role: payload.role,
          });
        } else {
          localStorage.removeItem('adminToken');
        }
      } catch (err) {
        console.error('Invalid token', err);
        localStorage.removeItem('adminToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('adminToken', token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    setUser({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
    // Navigate after state update
    setTimeout(() => {
      navigate('/admin/dashboard', { replace: true });
    }, 100); // small delay ensures state propagates
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    navigate('/admin', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);