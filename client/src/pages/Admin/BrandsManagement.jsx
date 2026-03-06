// src/pages/admin/BrandsManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BrandsManagement = () => {
  const [activeTab, setActiveTab] = useState('panel'); // 'panel' or 'inverter'
  const [brands, setBrands] = useState([]); // current list
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBrands(activeTab);
  }, [activeTab]);

  const loadBrands = async (tab) => {
    setLoading(true);
    setError(null);
    setBrands([]);

    try {
      const endpoint = tab === 'panel' ? '/api/panel-brands' : '/api/inverter-brands';
      const res = await protectedFetch(`${API_BASE}${endpoint}`);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to load ${tab} brands (HTTP ${res.status})`);
      }

      const json = await res.json();
      setBrands(json.data || []);
    } catch (err) {
      console.error(`Error loading ${tab} brands:`, err);
      const errorMsg = err.message || 'Unknown error';
      setError(`Failed to load ${tab} brands: ${errorMsg}`);
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

    if (!form.name.trim()) {
      Swal.fire('Error', 'Brand name is required', 'error');
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        country: form.country.trim() || null,
      };

      const endpoint = activeTab === 'panel' ? '/api/panel-brands' : '/api/inverter-brands';
      const url = editing ? `${API_BASE}${endpoint}/${editing.id}` : `${API_BASE}${endpoint}`;
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
        text: editing ? 'Brand updated successfully' : 'Brand added successfully',
        timer: 2000,
      });

      loadBrands(activeTab);
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
    const tabName = activeTab === 'panel' ? 'Panel' : 'Inverter';
    const confirmed = await Swal.fire({
      title: `Delete ${tabName} Brand?`,
      text: 'This action is permanent and cannot be undone. Related packages may be affected.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const endpoint = activeTab === 'panel' ? '/api/panel-brands' : '/api/inverter-brands';
      const res = await protectedFetch(`${API_BASE}${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete');
      }

      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: `${tabName} brand deleted successfully`,
        timer: 2000,
      });

      loadBrands(activeTab);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete brand',
      });
    }
  };

  const isPanelTab = activeTab === 'panel';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading brands...</p>
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
            onClick={() => loadBrands(activeTab)}
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
        Brands Management
      </h1>

      {/* Tabs */}
      <div className="mb-8 flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('panel');
            resetForm();
          }}
          className={`flex-1 py-4 text-center font-medium transition ${
            isPanelTab
              ? 'border-b-4 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Panel Brands
        </button>
        <button
          onClick={() => {
            setActiveTab('inverter');
            resetForm();
          }}
          className={`flex-1 py-4 text-center font-medium transition ${
            !isPanelTab
              ? 'border-b-4 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Inverter Brands
        </button>
      </div>

      {/* Form Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Brand' : `Add New ${isPanelTab ? 'Panel' : 'Inverter'} Brand`}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              placeholder={isPanelTab ? 'e.g. Longi, Jinko, Trina' : 'e.g. Huawei, Growatt, SMA'}
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
        All {isPanelTab ? 'Panel' : 'Inverter'} Brands ({brands.length})
      </h2>

      {brands.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No {isPanelTab ? 'panel' : 'inverter'} brands added yet.</p>
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

export default BrandsManagement;