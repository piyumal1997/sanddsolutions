// src/pages/admin/CapacitiesManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const CapacitiesManagement = () => {
  const [activeTab, setActiveTab] = useState('panel'); // 'panel' or 'inverter'
  const [items, setItems] = useState([]); // current list
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    wattage: '',           // panel only
    capacity_kw: '',       // inverter only
    type: '',              // inverter only
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab) => {
    setLoading(true);
    setError(null);
    setItems([]);

    try {
      const endpoint = tab === 'panel' ? '/api/panel-capacities' : '/api/inverter-capacities';
      const res = await protectedFetch(`${API_BASE}${endpoint}`);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to load ${tab} capacities (HTTP ${res.status})`);
      }

      const json = await res.json();
      setItems(json.data || []);
    } catch (err) {
      console.error(`Error loading ${tab} capacities:`, err);
      const errorMsg = err.message || 'Unknown error';
      setError(`Failed to load ${tab} capacities: ${errorMsg}`);
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

    let payload = { description: form.description.trim() || null };

    if (activeTab === 'panel') {
      const wattageNum = Number(form.wattage);
      if (isNaN(wattageNum) || wattageNum < 100 || wattageNum > 1000) {
        Swal.fire('Error', 'Wattage must be a number between 100 and 1000', 'error');
        return;
      }
      payload.wattage = wattageNum;
    } else {
      const capacityNum = Number(form.capacity_kw);
      if (isNaN(capacityNum) || capacityNum < 0.5 || capacityNum > 100) {
        Swal.fire('Error', 'Capacity must be a number between 0.5 and 100 kW', 'error');
        return;
      }
      if (!form.type) {
        Swal.fire('Error', 'Inverter type is required', 'error');
        return;
      }
      payload.capacity_kw = capacityNum;
      payload.type = form.type;
    }

    try {
      const endpoint = activeTab === 'panel' ? '/api/panel-capacities' : '/api/inverter-capacities';
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
        text: editing ? 'Capacity updated successfully' : 'Capacity added successfully',
        timer: 2000,
      });

      loadData(activeTab);
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save capacity',
      });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      wattage: '',
      capacity_kw: '',
      type: '',
      description: '',
    });
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      wattage: item.wattage || '',
      capacity_kw: item.capacity_kw || '',
      type: item.type || '',
      description: item.description || '',
    });
  };

  const handleDelete = async (id) => {
    const tabName = activeTab === 'panel' ? 'Panel' : 'Inverter';
    const confirmed = await Swal.fire({
      title: `Delete ${tabName} Capacity?`,
      text: 'This action is permanent and cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete permanently',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const endpoint = activeTab === 'panel' ? '/api/panel-capacities' : '/api/inverter-capacities';
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
        text: `${tabName} capacity deleted successfully`,
        timer: 2000,
      });

      loadData(activeTab);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete capacity',
      });
    }
  };

  const isPanelTab = activeTab === 'panel';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading capacities...</p>
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
            onClick={() => loadData(activeTab)}
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
        Capacities Management
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
          Panel Capacities
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
          Inverter Capacities
        </button>
      </div>

      {/* Form Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Capacity' : `Add New ${isPanelTab ? 'Panel' : 'Inverter'} Capacity`}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isPanelTab ? 'Wattage (W)' : 'Capacity (kW)'} *
            </label>
            <input
              type="number"
              step={isPanelTab ? '1' : '0.01'}
              placeholder={isPanelTab ? 'e.g. 550' : 'e.g. 5.0'}
              value={isPanelTab ? form.wattage : form.capacity_kw}
              onChange={(e) =>
                setForm({
                  ...form,
                  [isPanelTab ? 'wattage' : 'capacity_kw']: e.target.value,
                })
              }
              min={isPanelTab ? '100' : '0.5'}
              max={isPanelTab ? '1000' : '100'}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {!isPanelTab && (
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
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              placeholder={isPanelTab ? 'e.g. Monocrystalline, Half-cut' : 'e.g. 3-phase, high efficiency'}
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

      {/* Table Section */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All {isPanelTab ? 'Panel' : 'Inverter'} Capacities ({items.length})
      </h2>

      {items.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No {isPanelTab ? 'panel' : 'inverter'} capacities added yet.</p>
          <p className="mt-2">Add your first capacity using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  {isPanelTab ? 'Wattage (W)' : 'Capacity (kW)'}
                </th>
                {!isPanelTab && (
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                )}
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created At</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {isPanelTab ? `${item.wattage} W` : `${item.capacity_kw} kW`}
                  </td>
                  {!isPanelTab && (
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                      {item.type}
                    </td>
                  )}
                  <td className="px-6 py-4 text-gray-600">
                    {item.description || <span className="text-gray-400">No description</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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

export default CapacitiesManagement;