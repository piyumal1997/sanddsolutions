// src/pages/admin/InverterCapacitiesManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const InverterCapacitiesManagement = () => {
  const [capacities, setCapacities] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    capacity_kw: '',
    type: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCapacities();
  }, []);

  const loadCapacities = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await protectedFetch(`${API_BASE}/api/inverter-capacities`);
      if (!res.ok) {
        throw new Error('Failed to load inverter capacities');
      }
      const { data } = await res.json();
      setCapacities(data || []);
    } catch (err) {
      console.error('Error loading inverter capacities:', err);
      setError('Failed to load inverter capacities. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Load Error',
        text: err.message || 'Could not load inverter capacities.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const capacityNum = Number(form.capacity_kw);
    if (isNaN(capacityNum) || capacityNum < 0.5 || capacityNum > 100) {
      Swal.fire('Error', 'Capacity must be a number between 0.5 and 100 kW', 'error');
      return;
    }

    if (!form.type) {
      Swal.fire('Error', 'Inverter type is required', 'error');
      return;
    }

    try {
      const payload = {
        capacity_kw: capacityNum,
        type: form.type,
        description: form.description.trim() || null,
      };

      const url = editing
        ? `${API_BASE}/api/inverter-capacities/${editing.id}`
        : `${API_BASE}/api/inverter-capacities`;
      const method = editing ? 'PUT' : 'POST';

      const res = await protectedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || (editing ? 'Update failed' : 'Create failed'));
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editing ? 'Capacity updated successfully' : 'Capacity added successfully',
        timer: 2000,
      });

      loadCapacities();
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save inverter capacity',
      });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ capacity_kw: '', type: '', description: '' });
  };

  const handleEdit = (capacity) => {
    setEditing(capacity);
    setForm({
      capacity_kw: capacity.capacity_kw || '',
      type: capacity.type || '',
      description: capacity.description || '',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Deactivate Capacity?',
      text: 'This will hide it from selection (soft delete). You can reactivate later.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, deactivate',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/inverter-capacities/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to deactivate');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Capacity deactivated',
        timer: 2000,
      });

      loadCapacities();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to deactivate capacity',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading inverter capacities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="text-2xl text-red-600 mb-4">Error Loading Data</p>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={loadCapacities}
            className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">Inverter Capacities Management</h1>

      {/* Form Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Inverter Capacity' : 'Add New Inverter Capacity'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (kW) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 5.0"
              value={form.capacity_kw}
              onChange={(e) => setForm({ ...form, capacity_kw: e.target.value })}
              min="0.5"
              max="100"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Select Type</option>
              <option value="string">String</option>
              <option value="hybrid">Hybrid</option>
              <option value="micro">Micro</option>
              <option value="off-grid">Off-Grid</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              placeholder="e.g. 3-phase, high efficiency"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 flex gap-6 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
            >
              {editing ? 'Update Capacity' : 'Add Capacity'}
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

      {/* Capacities Table */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Inverter Capacities ({capacities.length})
      </h2>

      {capacities.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No inverter capacities added yet.</p>
          <p className="mt-2">Add your first capacity using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Capacity (kW)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {capacities.map((capacity) => (
                <tr key={capacity.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{capacity.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {capacity.capacity_kw} kW
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                    {capacity.type}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {capacity.description || <span className="text-gray-400">No description</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(capacity.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(capacity)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(capacity.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      Deactivate
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

export default InverterCapacitiesManagement;