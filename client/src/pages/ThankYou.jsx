// src/pages/ThankYou.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const order_id = searchParams.get('order_id');

  useEffect(() => {
    setTimeout(() => navigate('/'), 5000);
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Payment!</h1>
      <p>Order ID: {order_id}</p>
      <p>You will be redirected to the home page in 5 seconds.</p>
    </div>
  );
};

export default ThankYou;