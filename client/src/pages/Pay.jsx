// src/pages/Pay.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import sandlogo from '../assets/images/sndlogo.png';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const Pay = () => {
  const { unique_id } = useParams();
  const navigate = useNavigate();

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [form, setForm] = useState({
    address: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaymentInfo();
  }, [unique_id]);

  const fetchPaymentInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payments/${unique_id}/info`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Invalid or expired payment link');
      }

      const data = await res.json();
      setPaymentInfo(data.data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Link Invalid',
        text: err.message || 'This payment link is invalid or has expired.',
        confirmButtonText: 'Go Home',
      }).then(() => navigate('/'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/payments/${unique_id}/submit-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to process your details');
      }

      // Redirect to PayHere
      window.location.href = `https://www.payhere.lk/pay/${data.merchant_id}/${data.order_id}?amount=${data.amount}&currency=${data.currency}&hash=${data.hash}&return_url=https://sanddsolutions.lk/thank-you-payhere&cancel_url=https://sanddsolutions.lk/payment-notify&notify_url=https://api.sanddsolutions.lk/api/payments/notify`;

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!paymentInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header with Logo on Left */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-10 flex items-center gap-6">
          {/* Logo in Circle */}
          <div className="w-20 h-20 bg-white rounded-full p-2 flex-shrink-0 shadow-lg">
            <img 
              src={sandlogo} 
              alt="S&D Solutions Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">Complete Your Payment</h1>
            <p className="text-lg opacity-90 mt-1">S & D Solutions (Pvt) Ltd</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-8 md:p-12">
          <div className="bg-green-50 border border-green-200 p-6 rounded-2xl mb-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Customer Name</span>
              <span className="font-semibold text-gray-900">{paymentInfo.customer_name}</span>
            </div>
            <div className="flex justify-between items-center text-3xl font-bold text-green-700">
              <span>Total Amount</span>
              <span>LKR {Number(paymentInfo.amount).toLocaleString()}</span>
            </div>
            {paymentInfo.description && (
              <p className="text-gray-600 mt-4 text-sm">{paymentInfo.description}</p>
            )}
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
              <textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                placeholder="Full address including city"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="071 234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-5 rounded-2xl font-semibold text-xl transition-all mt-8 ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              }`}
            >
              {submitting ? 'Processing...' : `Pay LKR ${Number(paymentInfo.amount).toLocaleString()}`}
            </button>
          </form>
        </div>

        <div className="px-8 py-6 text-center text-sm text-gray-500 border-t">
          Secured by PayHere • Your payment information is encrypted
        </div>
      </div>
    </div>
  );
};

export default Pay;