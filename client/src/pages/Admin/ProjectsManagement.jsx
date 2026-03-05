// src/pages/admin/ProjectsManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'residential-solar',
    date: '',
    details: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await protectedFetch(`${API_BASE}/api/projects`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to load projects');
      }
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Could not load projects',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('title', form.title.trim());
      payload.append('description', form.description.trim());
      payload.append('type', form.type);
      payload.append('date', form.date);
      payload.append('details', form.details.trim());

      if (editing) {
        payload.append('existingImages', JSON.stringify(editing.images || []));
      }

      files.forEach(file => payload.append('images', file));

      const url = editing ? `${API_BASE}/api/projects/${editing.id}` : `${API_BASE}/api/projects`;
      const method = editing ? 'PUT' : 'POST';

      const res = await protectedFetch(url, { method, body: payload });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || (editing ? 'Update failed' : 'Create failed'));
      }

      Swal.fire({
        icon: 'success',
        title: editing ? 'Updated' : 'Created',
        text: `Project successfully ${editing ? 'updated' : 'added'}`,
        timer: 2000,
      });

      loadProjects();
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: err.message,
      });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      type: 'residential-solar',
      date: '',
      details: '',
    });
    setFiles([]);
  };

  const handleEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title || '',
      description: project.description || '',
      type: project.type || 'residential-solar',
      date: project.date || '',
      details: project.details || '',
    });
    setFiles([]);
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Deactivate Project?',
      text: 'This will hide it from public view (soft delete).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, deactivate',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      Swal.fire('Success', 'Project deactivated', 'success');
      loadProjects();
    } catch (err) {
      Swal.fire('Error', err.message || 'Could not deactivate', 'error');
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">Project Management</h1>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            placeholder="Project Title *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="residential-solar">Residential Solar</option>
            <option value="industrial-solar">Industrial Solar</option>
            <option value="automation">Automation</option>
            <option value="engineering">Engineering</option>
            <option value="cooling solution">Cooling Solution</option>
          </select>

          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <textarea
            placeholder="Full Description *"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={4}
            required
            className="md:col-span-2 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <textarea
            placeholder="Additional Details (optional)"
            value={form.details}
            onChange={e => setForm({ ...form, details: e.target.value })}
            rows={6}
            className="md:col-span-2 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <div className="md:col-span-2">
            <label className="block text-lg font-medium mb-3 text-gray-700">
              Upload Images / Videos (max 10 files)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/mp4"
              onChange={e => setFiles(Array.from(e.target.files || []))}
              className="w-full p-4 border border-gray-300 rounded-xl file:mr-4 file:py-3 file:px-6 file:rounded-lg file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {files.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                {files.length} file(s) selected
              </p>
            )}
          </div>

          <div className="md:col-span-2 flex gap-6 mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 rounded-xl font-semibold text-white transition ${
                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Saving...' : editing ? 'Update Project' : 'Add Project'}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-600 text-white py-4 rounded-xl hover:bg-gray-700 transition font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Projects List */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Projects ({projects.length})
      </h2>

      {projects.length === 0 ? (
        <p className="text-center text-xl text-gray-600 py-12">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300"
            >
              <h3 className="text-xl font-bold mb-3 text-gray-900">{project.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
              <div className="text-sm text-gray-500 space-y-1 mb-6">
                <p>Type: <span className="font-medium">{project.type.replace('-', ' ').toUpperCase()}</span></p>
                <p>Date: <span className="font-medium">{project.date || 'N/A'}</span></p>
                <p>Images: <span className="font-medium">{project.images?.length || 0}</span></p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-medium"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;