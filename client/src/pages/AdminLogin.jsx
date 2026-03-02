// src/pages/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegistering ? 'register' : 'login';

    try {
      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isRegistering ? 'Registration failed' : 'Login failed'));
      }

      if (isRegistering) {
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: 'You can now log in.',
          timer: 2000,
        });
        setIsRegistering(false);
      } else {
        localStorage.setItem('adminToken', data.token);
        Swal.fire({
          icon: 'success',
          title: 'Logged In',
          text: 'Redirecting to dashboard...',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate('/admin/dashboard');
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 lg:p-12 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">
          {isRegistering ? 'Register Admin' : 'Admin / Manager Login'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            {loading ? 'Please wait...' : isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-green-600 hover:underline font-medium"
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;