// src/pages/admin/InverterBrandsManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const InverterBrandsManagement = () => {
  const [brands, setBrands] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', country: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/inverter-brands`);
      if (!res.ok) throw new Error('Failed');
      const { data } = await res.json();
      setBrands(data || []);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
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
      const url = editing ? `/api/inverter-brands/${editing.id}` : '/api/inverter-brands';
      const method = editing ? 'PUT' : 'POST';

      const res = await protectedFetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed');

      Swal.fire('Success', editing ? 'Brand updated' : 'Brand added', 'success');
      loadBrands();
      resetForm();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', country: '' });
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Delete Brand?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${import.meta.env.VITE_API_BASE_URL}/api/inverter-brands/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed');
      Swal.fire('Success', 'Brand deleted', 'success');
      loadBrands();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-10 text-gray-900">Inverter Brands Management</h1>

      <div className="bg-white p-8 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Inverter Brand' : 'Add New Inverter Brand'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            placeholder="Brand Name *"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Country (optional)"
            value={form.country}
            onChange={e => setForm({...form, country: e.target.value})}
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="md:col-span-2 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
          >
            {editing ? 'Update Brand' : 'Add Brand'}
          </button>
        </form>
      </div>

      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        All Inverter Brands ({brands.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands.map(brand => (
          <div key={brand.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold mb-3">{brand.name}</h3>
            <p className="text-gray-600 mb-6">{brand.country || 'Country not specified'}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setEditing(brand)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(brand.id)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InverterBrandsManagement;