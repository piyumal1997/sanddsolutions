// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const API_BASE = ''; // empty string = same origin (recommended for production)
// If testing locally with different ports → 'http://localhost:3000'

const AdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'residential-solar',
    date: '',
    details: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    if (token) {
      // Optional: you could verify token here by calling a protected /me route
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to fetch projects');
      }

      const data = await res.json();
      setProjects(data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Could not load projects',
      });
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
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
        });
        setIsRegistering(false);
      } else {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setUserEmail(data.user?.email || email);
        Swal.fire({
          icon: 'success',
          title: 'Logged in',
          text: 'Welcome to the Admin Dashboard',
          timer: 1800,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: err.message,
      });
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Log out?',
      text: 'You will be logged out of the admin dashboard.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, log out',
    });

    if (result.isConfirmed) {
      localStorage.removeItem('adminToken');
      setToken('');
      setUserEmail('');
      setProjects([]);
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        timer: 1500,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formPayload = new FormData();
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('type', formData.type);
    formPayload.append('date', formData.date);
    formPayload.append('details', formData.details);

    // Add existing images if editing
    if (editingProject) {
      formPayload.append('existingImages', JSON.stringify(editingProject.images || []));
    }

    // Add new files
    selectedFiles.forEach((file) => {
      formPayload.append('images', file);
    });

    try {
      const url = editingProject
        ? `${API_BASE}/api/projects/${editingProject.id}`
        : `${API_BASE}/api/projects`;

      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Operation failed');
      }

      Swal.fire({
        icon: 'success',
        title: editingProject ? 'Project Updated' : 'Project Added',
        timer: 1800,
      });

      fetchProjects();
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save project',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      type: project.type || 'residential-solar',
      date: project.date || '',
      details: project.details || '',
    });
    setSelectedFiles([]);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete project?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Delete failed');

      Swal.fire('Deleted!', 'Project removed.', 'success');
      fetchProjects();
    } catch (err) {
      Swal.fire('Error', err.message || 'Could not delete project', 'error');
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      type: 'residential-solar',
      date: '',
      details: '',
    });
    setSelectedFiles([]);
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleAuth}
          className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md"
        >
          <h2 className="text-4xl font-bold text-center mb-8">
            {isRegistering ? 'Register Admin' : 'Admin Login'}
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-4 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>

          <p className="text-center mt-6 text-gray-600">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-green-600 hover:underline font-medium"
            >
              {isRegistering ? 'Login' : 'Register'}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-6">
            <p className="text-lg text-gray-700">Logged in: {userEmail || 'Admin'}</p>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Form - Add / Edit Project */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="residential-solar">Residential Solar</option>
              <option value="industrial-solar">Industrial Solar</option>
              <option value="automation">Automation</option>
              <option value="engineering">Engineering</option>
            </select>

            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <textarea
              placeholder="Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="md:col-span-2 px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <textarea
              placeholder="Details (optional)"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={6}
              className="md:col-span-2 px-6 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* File Upload */}
            <div className="md:col-span-2">
              <label className="block text-lg font-medium mb-3 text-gray-700">
                Upload Images / Videos
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            {/* Existing Images (only when editing) */}
            {editingProject && editingProject.images?.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-lg font-medium mb-4 text-gray-700">
                  Current Images ({editingProject.images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {editingProject.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url.startsWith('/') ? `${API_BASE}${url}` : url}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm"
                      />
                      {/* You can add remove button here later if backend supports deleting individual images */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
              <button
                type="submit"
                disabled={uploading}
                className={`flex-1 py-4 px-8 rounded-lg font-semibold text-white transition ${
                  uploading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {uploading
                  ? 'Saving...'
                  : editingProject
                  ? 'Update Project'
                  : 'Add Project'}
              </button>

              {editingProject && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-4 px-8 rounded-lg hover:bg-gray-700 transition font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Projects List */}
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Existing Projects ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                <div className="text-sm text-gray-500 space-y-1 mb-6">
                  <p>Type: {project.type.replace('-', ' ').toUpperCase()}</p>
                  <p>Date: {project.date || 'N/A'}</p>
                  <p>Images: {project.images?.length || 0}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;