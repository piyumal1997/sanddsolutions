// src/pages/admin/ProjectsManagement.jsx
import { useState, useEffect, useRef } from 'react';
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
  const [filePreviews, setFilePreviews] = useState([]); // For image/video previews
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // Separate loading for submit
  const fileInputRef = useRef(null); // Ref to reset file input

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
    setSubmitLoading(true); // Start submit loading

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
        title: 'Success',
        text: editing ? 'Project updated successfully' : 'Project created successfully',
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
    } finally {
      setSubmitLoading(false); // End submit loading
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
    setFilePreviews([]); // Clear previews
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input field
    }
  };

  const handleEdit = (project) => {
    setEditing(project);
    setForm({
      title: project.title || '',
      description: project.description || '',
      type: project.type || 'residential-solar',
      date: project.date ? new Date(project.date).toISOString().split('T')[0] : '',
      details: project.details || '',
    });
    setFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input on edit
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(newFiles);

    // Generate previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Delete Project?',
      text: 'This will permanently delete the project.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Project deleted successfully',
        timer: 2000,
      });
      loadProjects();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete project',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">Project Management</h1>

      {/* Form Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
            <input
              placeholder="e.g. Residential Solar Installation"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              minLength={3}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="residential-solar">Residential Solar</option>
              <option value="industrial-solar">Industrial Solar</option>
              <option value="automation">Automation</option>
              <option value="engineering">Engineering</option>
              <option value="cooling solution">Cooling Solution</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Description *</label>
            <textarea
              placeholder="Describe the project in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              required
              minLength={10}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details (optional)</label>
            <textarea
              placeholder="Additional project details, specs, or notes..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Existing Images Preview in Edit Mode */}
          {editing && editing.images && editing.images.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
              <div className="grid grid-cols-3 gap-4">
                {editing.images.map((img, idx) => (
                  <img key={idx} src={img} alt="Existing" className="w-full h-32 object-cover rounded-xl" />
                ))}
              </div>
            </div>
          )}

          {/* New Files Upload and Preview */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-4 border border-gray-300 rounded-xl"
            />
            {filePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {filePreviews.map((preview, idx) => (
                  <img key={idx} src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex gap-6 mt-6">
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
            >
              {submitLoading ? 'Saving...' : editing ? 'Update Project' : 'Add Project'}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-600 text-white py-4 rounded-xl hover:bg-gray-700 transition font-semibold shadow-md"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Projects Table */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Projects ({projects.length})
      </h2>

      {projects.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No projects added yet.</p>
          <p className="mt-2">Add your first project using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Images</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{project.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{project.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {project.date ? new Date(project.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{project.images?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagement;