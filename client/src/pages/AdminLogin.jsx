// src/pages/AdminLogin.jsx
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Use context login → updates global state & redirects
      login(data.data.token);

      await Swal.fire({
        icon: 'success',
        title: 'Logged In',
        text: 'Redirecting to dashboard...',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Invalid email or password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">
          Admin / Manager Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div className="mb-8">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-white transition text-lg shadow-md ${
              loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Optional: Add forgot password link later if needed */}
        {/* <p className="text-center mt-6 text-gray-600">
          <a href="#" className="text-green-600 hover:underline">
            Forgot password?
          </a>
        </p> */}
      </div>
    </div>
  );
};

export default AdminLogin;