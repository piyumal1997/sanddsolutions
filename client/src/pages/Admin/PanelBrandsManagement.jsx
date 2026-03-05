// src/pages/admin/PanelBrandsManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const PanelBrandsManagement = () => {
  const [brands, setBrands] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', country: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await protectedFetch(`${API_BASE}/api/panel-brands`);
      if (!res.ok) {
        throw new Error('Failed to load panel brands');
      }
      const { data } = await res.json();
      setBrands(data || []);
    } catch (err) {
      console.error('Error loading brands:', err);
      setError('Failed to load panel brands. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Load Error',
        text: err.message || 'Could not load panel brands.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      Swal.fire('Error', 'Brand name is required', 'error');
      return;
    }

    try {
      const url = editing ? `${API_BASE}/api/panel-brands/${editing.id}` : `${API_BASE}/api/panel-brands`;
      const method = editing ? 'PUT' : 'POST';

      const res = await protectedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || (editing ? 'Update failed' : 'Create failed'));
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editing ? 'Brand updated successfully' : 'Brand added successfully',
        timer: 2000,
      });

      loadBrands();
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save brand',
      });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', country: '' });
  };

  const handleEdit = (brand) => {
    setEditing(brand);
    setForm({
      name: brand.name || '',
      country: brand.country || '',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Delete Brand?',
      text: 'This action cannot be undone. All related packages may be affected.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/panel-brands/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Brand deleted successfully',
        timer: 2000,
      });

      loadBrands();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete brand',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading panel brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">Panel Brands Management</h1>

      {/* Form Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Panel Brand' : 'Add New Panel Brand'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              placeholder="e.g. Longi, Jinko, Trina"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country (optional)
            </label>
            <input
              placeholder="e.g. China, USA, Germany"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 flex gap-6 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
            >
              {editing ? 'Update Brand' : 'Add Brand'}
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

      {/* Brands Table */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Panel Brands ({brands.length})
      </h2>

      {brands.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No panel brands added yet.</p>
          <p className="mt-2">Add your first brand using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Brand Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Country</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{brand.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{brand.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {brand.country || <span className="text-gray-400">Not specified</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(brand.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
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

export default PanelBrandsManagement;