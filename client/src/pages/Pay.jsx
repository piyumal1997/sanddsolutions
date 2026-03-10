// src/pages/Pay.jsx
import { useState, useEffect } from 'react';
import { Payhere, Customer, CurrencyType, PayhereCheckout, CheckoutParams } from '@payhere-js-sdk/client';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';
import { publicFetch } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Pay = () => {
  const { unique_id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    address: '',
    phone: '',
    email: '',
  });
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      const res = await publicFetch(`${API_BASE}/api/payments/${unique_id}/info`);
      const data = await res.json();
      if (data.success) {
        setPaymentInfo(data);
        setForm(prev => ({ ...prev, customer_name: data.customer_name || '' }));
      } else {
        Swal.fire('Error', 'Invalid link', 'error');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to fetch payment info:', err);
      Swal.fire('Error', 'Failed to load', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await publicFetch(`${API_BASE}/api/payments/${unique_id}/submit-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed');

      const customer = new Customer({
        first_name: paymentInfo.customer_name,
        last_name: '',
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: 'Colombo',
        country: 'Sri Lanka',
      });

      const checkoutParams = new CheckoutParams({
        returnUrl: 'https://sanddsolutions.lk/thank-you?order_id=' + unique_id,
        cancelUrl: 'https://sanddsolutions.lk/cancel?order_id=' + unique_id,
        notifyUrl: `${API_BASE}/api/payments/notify`,
        orderId: unique_id,
        itemTitle: 'Payment for ' + paymentInfo.customer_name,
        currency: CurrencyType.LKR,
        amount: data.amount,
        hash: data.hash,
      });

      Payhere.checkout(checkoutParams, customer, (payment) => {
        Swal.fire('Success', 'Payment completed', 'success');
        navigate('/thank-you?order_id=' + unique_id);
      }, (err) => {
        Swal.fire('Error', err, 'error');
      });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pay LKR {paymentInfo.amount}</h1>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <input
          placeholder="Address (optional)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="p-4 border rounded-xl"
        />
        <input
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="p-4 border rounded-xl"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="p-4 border rounded-xl"
        />
        <button type="submit" className="bg-green-600 text-white py-4 rounded-xl">
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default Pay;