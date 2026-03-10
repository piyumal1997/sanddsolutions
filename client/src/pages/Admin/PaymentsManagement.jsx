// src/pages/admin/PaymentsManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PaymentsManagement = () => {
  const [links, setLinks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    amount: '',
    description: '',
    expiry_date: '',
    send_email: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await protectedFetch(`${API_BASE}/api/payments`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setLinks(data.data || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
      Swal.fire('Error', 'Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing ? `${API_BASE}/api/payments/${editing.id}/edit` : `${API_BASE}/api/payments/create-link`;
      const res = await protectedFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Link created/updated. Copy and share: ' + data.link,
        timer: 3000,
      });
      loadLinks();
      resetForm();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      amount: '',
      description: '',
      expiry_date: '',
      send_email: true,
    });
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    Swal.fire('Copied', 'Link copied to clipboard. Send via WhatsApp or SMS.', 'success');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl font-bold mb-10">Payment Links Management</h1>

      {/* Form */}
      <div className="bg-white p-8 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Payment Link' : 'Create Payment Link'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            placeholder="Customer Name *"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            required
            className="p-4 border rounded-xl"
          />
          <input
            placeholder="Customer Email *"
            type="email"
            value={form.customer_email}
            onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
            required
            className="p-4 border rounded-xl"
          />
          <input
            placeholder="Customer Phone (optional)"
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
            className="p-4 border rounded-xl"
          />
          <input
            type="number"
            placeholder="Amount (LKR) *"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            min="0.01"
            step="0.01"
            className="p-4 border rounded-xl"
          />
          <input
            type="date"
            placeholder="Expiry Date (optional)"
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            className="p-4 border rounded-xl"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="md:col-span-2 p-4 border rounded-xl"
          />
          <div className="md:col-span-2 flex items-center gap-4">
            <input
              type="checkbox"
              id="send_email"
              checked={form.send_email}
              onChange={(e) => setForm({ ...form, send_email: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="send_email">Send link via email automatically</label>
          </div>
          <div className="md:col-span-2 flex gap-6 mt-4">
            <button type="submit" className="flex-1 bg-green-600 text-white py-4 rounded-xl">
              {editing ? 'Update Link' : 'Create Link'}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="flex-1 bg-gray-600 text-white py-4 rounded-xl">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Payment Links Table */}
      <h2 className="text-3xl font-bold mb-8">All Payment Links ({links.length})</h2>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount (LKR)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Expiry</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-500">{link.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{link.customer_name}</td>
                <td className="px-6 py-4 text-gray-600">{link.customer_email}</td>
                <td className="px-6 py-4 text-gray-700">{link.amount.toLocaleString()} LKR</td>
                <td className="px-6 py-4 text-gray-600 capitalize">{link.status}</td>
                <td className="px-6 py-4 text-gray-600">{link.expiry_date || 'None'}</td>
                <td className="px-6 py-4 text-gray-600">{new Date(link.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  <button onClick={() => copyLink(`https://sanddsolutions.lk/pay/${link.unique_id}`)} className="text-blue-600 hover:text-blue-800 mr-4">
                    Copy Link
                  </button>
                  {link.status === 'pending' && (
                    <button onClick={() => setEditing(link)} className="text-green-600 hover:text-green-800">
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsManagement;