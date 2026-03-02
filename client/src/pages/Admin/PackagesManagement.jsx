// src/pages/admin/PackagesManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const PackagesManagement = () => {
  const [packages, setPackages] = useState([]);
  const [panelBrands, setPanelBrands] = useState([]);
  const [panelCapacities, setPanelCapacities] = useState([]);
  const [inverterBrands, setInverterBrands] = useState([]);
  const [inverterCapacities, setInverterCapacities] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    panel_brand_id: '',
    panel_capacity_id: '',
    panel_count: '',
    inverter_brand_id: '',
    inverter_capacity_id: '',
    full_price_lkr: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [pkgRes, pbRes, pcRes, ibRes, icRes] = await Promise.all([
        protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/packages`),
        protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/panel-brands`),
        protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/panel-capacities`),
        protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/inverter-brands`),
        protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/inverter-capacities`),
      ]);

      const pkgData = await pkgRes.json();
      setPackages(pkgData.data || []);

      const pbData = await pbRes.json();
      setPanelBrands(pbData.data || []);

      const pcData = await pcRes.json();
      setPanelCapacities(pcData.data || []);

      const ibData = await ibRes.json();
      setInverterBrands(ibData.data || []);

      const icData = await icRes.json();
      setInverterCapacities(icData.data || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to load data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      const url = editing ? `/api/packages/${editing.id}` : '/api/packages';
      const method = editing ? 'PUT' : 'POST';

      const res = await protectedFetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Operation failed');
      }

      Swal.fire('Success', editing ? 'Package updated' : 'Package created', 'success');
      loadAllData();
      resetForm();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: '',
      panel_brand_id: '',
      panel_capacity_id: '',
      panel_count: '',
      inverter_brand_id: '',
      inverter_capacity_id: '',
      full_price_lkr: '',
      description: '',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Deactivate Package?',
      text: 'This will hide it from public view (soft delete).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/packages/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed');
      Swal.fire('Success', 'Package deactivated', 'success');
      loadAllData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading packages...</div>;

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">Solar Packages Management</h1>

      {/* Form */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Package' : 'Add New Solar Package'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <input
            placeholder="Package Name *"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          <select
            value={form.panel_brand_id}
            onChange={e => setForm({...form, panel_brand_id: e.target.value})}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Select Panel Brand *</option>
            {panelBrands.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.country || 'N/A'})</option>
            ))}
          </select>

          <select
            value={form.panel_capacity_id}
            onChange={e => setForm({...form, panel_capacity_id: e.target.value})}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Select Panel Capacity (W) *</option>
            {panelCapacities.map(c => (
              <option key={c.id} value={c.id}>{c.wattage}W {c.description || ''}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Number of Panels *"
            value={form.panel_count}
            onChange={e => setForm({...form, panel_count: e.target.value})}
            min="1"
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          />

          <select
            value={form.inverter_brand_id}
            onChange={e => setForm({...form, inverter_brand_id: e.target.value})}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Select Inverter Brand *</option>
            {inverterBrands.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.country || 'N/A'})</option>
            ))}
          </select>

          <select
            value={form.inverter_capacity_id}
            onChange={e => setForm({...form, inverter_capacity_id: e.target.value})}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">Select Inverter Capacity *</option>
            {inverterCapacities.map(c => (
              <option key={c.id} value={c.id}>
                {c.capacity_kw} kW - {c.type} {c.description ? `(${c.description})` : ''}
              </option>
            ))}
          </select>

          <input
            type="number"
            step="0.01"
            placeholder="Full Price (LKR) *"
            value={form.full_price_lkr}
            onChange={e => setForm({...form, full_price_lkr: e.target.value})}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 md:col-span-2 lg:col-span-1"
          />

          <textarea
            placeholder="Package Description (optional)"
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            rows={4}
            className="md:col-span-2 lg:col-span-3 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          />

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

      {/* Packages List */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Solar Packages ({packages.length})
      </h2>

      {packages.length === 0 ? (
        <p className="text-center text-xl text-gray-600 py-12">No packages added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300">
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{pkg.name}</h3>
              <p className="text-xl font-semibold text-green-700 mb-4">
                LKR {Number(pkg.full_price_lkr).toLocaleString()}
              </p>
              <div className="text-gray-600 space-y-2 mb-6">
                <p>Panels: {pkg.panel_count} × {pkg.panel_wattage || '?'}W ({pkg.panel_brand_name})</p>
                <p>Inverter: {pkg.inverter_capacity_kw} kW {pkg.inverter_type} ({pkg.inverter_brand_name})</p>
                {pkg.description && <p className="text-sm">{pkg.description}</p>}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setEditing(pkg)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
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

export default PackagesManagement;