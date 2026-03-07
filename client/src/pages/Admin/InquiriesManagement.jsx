// src/pages/admin/InquiriesManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const InquiriesManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInquiries();
  }, [filter]);

  const loadInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/api/inquiries${filter !== 'all' ? `?status=${filter}` : ''}`;
      const res = await protectedFetch(url);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to load inquiries');
      }
      const data = await res.json();
      setInquiries(data.data || []);
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Could not load inquiries',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (inquiry) => {
    const { value: notes } = await Swal.fire({
      title: 'Mark as Completed',
      input: 'textarea',
      inputLabel: 'Completion Notes (optional)',
      inputPlaceholder: 'e.g., Customer confirmed via phone, installation scheduled...',
      showCancelButton: true,
      confirmButtonText: 'Mark Complete',
      cancelButtonText: 'Cancel',
      inputAttributes: {
        rows: 4,
      },
    });

    if (notes === undefined) return; // Cancelled

    try {
      const res = await protectedFetch(`${API_BASE}/api/inquiries/${inquiry.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completion_notes: notes.trim() || null }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update');
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Inquiry marked as completed',
        timer: 2000,
      });

      loadInquiries();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
      });
    }
  };

  const getStatusBadge = (completed) => {
    return completed ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        Completed
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">Inquiries Management</h1>

      {/* Filter */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-xl font-medium transition ${
            filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-3 rounded-xl font-medium transition ${
            filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-3 rounded-xl font-medium transition ${
            filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading inquiries...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">
          <p className="text-xl font-medium">{error}</p>
          <button
            onClick={loadInquiries}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-600">
          <p className="text-xl">No inquiries found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Message</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Completed By</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Notes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inq.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{inq.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inq.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inq.phone || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{inq.inquiry_type}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={inq.message}>
                    {inq.message.substring(0, 100)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inq.request_completed ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {inq.updated_by_email || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={inq.completion_notes || ''}>
                    {inq.completion_notes || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!inq.request_completed && (
                      <button
                        onClick={() => handleComplete(inq)}
                        className="text-green-600 hover:text-green-800 transition"
                      >
                        Mark Complete
                      </button>
                    )}
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

export default InquiriesManagement;