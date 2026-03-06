// src/pages/admin/BatteryManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BatteryManagement = () => {
  const [batteries, setBatteries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    brand: '',
    capacity_kwh: '',
    price_lkr: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBatteries();
  }, []);

  const loadBatteries = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await protectedFetch(`${API_BASE}/api/batteries`);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to load batteries (HTTP ${res.status})`);
      }

      const json = await res.json();
      setBatteries(json.data || []);
    } catch (err) {
      console.error('Error loading batteries:', err);
      const errorMsg = err.message || 'Unknown error';
      setError(`Failed to load batteries: ${errorMsg}`);
      Swal.fire({
        icon: 'error',
        title: 'Load Error',
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.brand.trim()) {
      Swal.fire('Error', 'Brand name is required', 'error');
      return;
    }

    const capacityNum = Number(form.capacity_kwh);
    if (isNaN(capacityNum) || capacityNum < 0.5 || capacityNum > 200) {
      Swal.fire('Error', 'Capacity must be between 0.5 and 200 kWh', 'error');
      return;
    }

    const priceNum = Number(form.price_lkr);
    if (isNaN(priceNum) || priceNum < 10000) {
      Swal.fire('Error', 'Price must be at least 10,000 LKR', 'error');
      return;
    }

    try {
      const payload = {
        brand: form.brand.trim(),
        capacity_kwh: capacityNum,
        price_lkr: priceNum,
        description: form.description.trim() || null,
      };

      const url = editing ? `${API_BASE}/api/batteries/${editing.id}` : `${API_BASE}/api/batteries`;
      const method = editing ? 'PUT' : 'POST';

      const res = await protectedFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || (editing ? 'Update failed' : 'Create failed'));
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: editing ? 'Battery updated successfully' : 'Battery added successfully',
        timer: 2000,
      });

      loadBatteries();
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save battery',
      });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      brand: '',
      capacity_kwh: '',
      price_lkr: '',
      description: '',
    });
  };

  const handleEdit = (battery) => {
    setEditing(battery);
    setForm({
      brand: battery.brand || '',
      capacity_kwh: battery.capacity_kwh || '',
      price_lkr: battery.price_lkr || '',
      description: battery.description || '',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Delete Battery?',
      text: 'This action is permanent and cannot be undone. Related packages may be affected.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/batteries/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete');
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Battery deleted successfully',
        timer: 2000,
      });

      loadBatteries();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete battery',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading batteries...</p>
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
            onClick={loadBatteries}
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
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">
        Battery Management
      </h1>

      {/* Form Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Battery' : 'Add New Battery'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <input
              placeholder="e.g. Pylontech, Dyness, BYD"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (kWh) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 5.00"
              value={form.capacity_kwh}
              onChange={(e) => setForm({ ...form, capacity_kwh: e.target.value })}
              min="0.5"
              max="200"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (LKR) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 285000"
              value={form.price_lkr}
              onChange={(e) => setForm({ ...form, price_lkr: e.target.value })}
              min="10000"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              placeholder="e.g. LiFePO4, 48V, 100Ah, with BMS"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex gap-6 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
            >
              {editing ? 'Update Battery' : 'Add Battery'}
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

      {/* Batteries Table */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Batteries ({batteries.length})
      </h2>

      {batteries.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No batteries added yet.</p>
          <p className="mt-2">Add your first battery using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Brand</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Capacity (kWh)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price (LKR)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batteries.map((battery) => (
                <tr key={battery.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{battery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{battery.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{battery.capacity_kwh} kWh</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    LKR {Number(battery.price_lkr).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {battery.description || <span className="text-gray-400">No description</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(battery.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(battery)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(battery.id)}
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

export default BatteryManagement;