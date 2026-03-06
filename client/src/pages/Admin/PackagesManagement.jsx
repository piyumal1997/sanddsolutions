// src/pages/admin/PackagesManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PackagesManagement = () => {
  const [packages, setPackages] = useState([]);
  const [panelBrands, setPanelBrands] = useState([]);
  const [panelCapacities, setPanelCapacities] = useState([]);
  const [inverterBrands, setInverterBrands] = useState([]);
  const [inverterCapacities, setInverterCapacities] = useState([]);
  const [batteries, setBatteries] = useState([]); // ← New: batteries list
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    package_type: 'On-Grid', // default
    panel_brand_id: '',
    panel_capacity_id: '',
    panel_count: '',
    inverter_brand_id: '',
    inverter_capacity_id: '',
    battery_id: '', // only used for Off-Grid/Hybrid
    full_price_lkr: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        pkgRes, pbRes, pcRes, ibRes, icRes, batRes
      ] = await Promise.all([
        protectedFetch(`${API_BASE}/api/packages`),
        protectedFetch(`${API_BASE}/api/panel-brands`),
        protectedFetch(`${API_BASE}/api/panel-capacities`),
        protectedFetch(`${API_BASE}/api/inverter-brands`),
        protectedFetch(`${API_BASE}/api/inverter-capacities`),
        protectedFetch(`${API_BASE}/api/batteries`), // ← New
      ]);

      const pkgData = await pkgRes.json();
      setPackages(pkgData.success ? pkgData.data || [] : []);

      const pbData = await pbRes.json();
      setPanelBrands(pbData.success ? pbData.data || [] : []);

      const pcData = await pcRes.json();
      setPanelCapacities(pcData.success ? pcData.data || [] : []);

      const ibData = await ibRes.json();
      setInverterBrands(ibData.success ? ibData.data || [] : []);

      const icData = await icRes.json();
      setInverterCapacities(icData.success ? icData.data || [] : []);

      const batData = await batRes.json();
      setBatteries(batData.success ? batData.data || [] : []);
    } catch (err) {
      console.error('Failed to load packages data:', err);
      setError('Failed to load packages, brands, capacities, or batteries.');
      Swal.fire({
        icon: 'error',
        title: 'Load Error',
        text: 'Could not load data. Check your connection or server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields (common)
    if (!form.name.trim() ||
        !form.package_type ||
        !form.panel_brand_id ||
        !form.panel_capacity_id ||
        !form.panel_count ||
        !form.inverter_brand_id ||
        !form.inverter_capacity_id ||
        !form.full_price_lkr) {
      Swal.fire('Error', 'All required fields must be filled', 'error');
      return;
    }

    // Battery validation based on package_type
    if (['Off-Grid', 'Hybrid'].includes(form.package_type) && !form.battery_id) {
      Swal.fire('Error', 'Battery is required for Off-Grid or Hybrid packages', 'error');
      return;
    }

    if (form.package_type === 'On-Grid' && form.battery_id) {
      Swal.fire('Error', 'On-Grid packages cannot have a battery', 'error');
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        package_type: form.package_type,
        panel_brand_id: form.panel_brand_id,
        panel_capacity_id: form.panel_capacity_id,
        panel_count: Number(form.panel_count),
        inverter_brand_id: form.inverter_brand_id,
        inverter_capacity_id: form.inverter_capacity_id,
        battery_id: form.battery_id || null, // null for On-Grid
        full_price_lkr: Number(form.full_price_lkr),
        description: form.description.trim() || null,
      };

      const url = editing ? `${API_BASE}/api/packages/${editing.id}` : `${API_BASE}/api/packages`;
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
        text: editing ? 'Package updated successfully' : 'Package created successfully',
        timer: 2000,
      });

      loadAllData();
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save package',
      });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '',
      package_type: 'On-Grid',
      panel_brand_id: '',
      panel_capacity_id: '',
      panel_count: '',
      inverter_brand_id: '',
      inverter_capacity_id: '',
      battery_id: '',
      full_price_lkr: '',
      description: '',
    });
  };

  const handleEdit = (pkg) => {
    setEditing(pkg);
    setForm({
      name: pkg.name || '',
      package_type: pkg.package_type || 'On-Grid',
      panel_brand_id: pkg.panel_brand_id || '',
      panel_capacity_id: pkg.panel_capacity_id || '',
      panel_count: pkg.panel_count || '',
      inverter_brand_id: pkg.inverter_brand_id || '',
      inverter_capacity_id: pkg.inverter_capacity_id || '',
      battery_id: pkg.battery_id || '',
      full_price_lkr: pkg.full_price_lkr || '',
      description: pkg.description || '',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Delete Package?',
      text: 'This will permanently remove the package from the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/packages/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Package deleted successfully',
        timer: 2000,
      });

      loadAllData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete package',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading packages data...</p>
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
            onClick={loadAllData}
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
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">Solar Packages Management</h1>

      {/* Form Section */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Solar Package' : 'Add New Solar Package'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
            <input
              placeholder="e.g. 5kW Residential Solar Package"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Type *</label>
            <select
              value={form.package_type}
              onChange={(e) => {
                const newType = e.target.value;
                setForm({
                  ...form,
                  package_type: newType,
                  battery_id: newType === 'On-Grid' ? '' : form.battery_id, // clear battery if On-Grid
                });
              }}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="On-Grid">On-Grid</option>
              <option value="Off-Grid">Off-Grid</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Battery – only for Off-Grid & Hybrid */}
          {(form.package_type === 'Off-Grid' || form.package_type === 'Hybrid') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Battery *
              </label>
              <select
                value={form.battery_id}
                onChange={(e) => setForm({ ...form, battery_id: e.target.value })}
                required
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Select Battery</option>
                {batteries.map((bat) => (
                  <option key={bat.id} value={bat.id}>
                    {bat.brand} – {bat.capacity_kwh} kWh (LKR {Number(bat.price_lkr).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Panel Brand *</label>
            <select
              value={form.panel_brand_id}
              onChange={(e) => setForm({ ...form, panel_brand_id: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Select Panel Brand</option>
              {panelBrands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.country ? `(${b.country})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Panel Capacity (W) *</label>
            <select
              value={form.panel_capacity_id}
              onChange={(e) => setForm({ ...form, panel_capacity_id: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Select Panel Wattage</option>
              {panelCapacities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.wattage}W {c.description ? `(${c.description})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Panels *</label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={form.panel_count}
              onChange={(e) => setForm({ ...form, panel_count: e.target.value })}
              min="1"
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Brand *</label>
            <select
              value={form.inverter_brand_id}
              onChange={(e) => setForm({ ...form, inverter_brand_id: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Select Inverter Brand</option>
              {inverterBrands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.country ? `(${b.country})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Inverter Capacity *</label>
            <select
              value={form.inverter_capacity_id}
              onChange={(e) => setForm({ ...form, inverter_capacity_id: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Select Inverter Capacity</option>
              {inverterCapacities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.capacity_kw} kW - {c.type} {c.description ? `(${c.description})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Price (LKR) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 850000"
              value={form.full_price_lkr}
              onChange={(e) => setForm({ ...form, full_price_lkr: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Description (optional)</label>
            <textarea
              placeholder="e.g. Includes installation, warranty, and monitoring"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex gap-6 mt-8">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
            >
              {editing ? 'Update Package' : 'Add Package'}
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

      {/* Packages Table */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Solar Packages ({packages.length})
      </h2>

      {packages.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No solar packages added yet.</p>
          <p className="mt-2">Add your first package using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price (LKR)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Panels</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Inverter</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Battery</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pkg.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pkg.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">{pkg.package_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {Number(pkg.full_price_lkr).toLocaleString()} LKR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {pkg.panel_count} × {pkg.panel_wattage || '?'}W
                    <br />
                    <small>{panelBrands.find(b => b.id === pkg.panel_brand_id)?.name || 'Unknown'}</small>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {pkg.inverter_capacity_kw || '?'} kW {pkg.inverter_type || ''}
                    <br />
                    <small>{inverterBrands.find(b => b.id === pkg.inverter_brand_id)?.name || 'Unknown'}</small>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {pkg.battery_brand ? (
                      <>
                        {pkg.battery_brand} – {pkg.battery_capacity_kwh} kWh
                        <br />
                        <small>LKR {Number(pkg.battery_price_lkr).toLocaleString()}</small>
                      </>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {pkg.description ? (
                      <span title={pkg.description} className="line-clamp-2">
                        {pkg.description}
                      </span>
                    ) : (
                      <span className="text-gray-400">No description</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
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

export default PackagesManagement;