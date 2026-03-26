// src/pages/PaymentCancel.jsx
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // PayHere may sometimes pass order_id
    const receivedOrderId = searchParams.get('order_id') || searchParams.get('orderId');
    setOrderId(receivedOrderId);
  }, [searchParams]);

  // Auto-redirect to home after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 text-center">
        
        {/* Cancel Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-16">
          <FontAwesomeIcon
            icon={faTimesCircle}
            className="text-8xl md:text-9xl mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            You have cancelled the payment process.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          {orderId && (
            <div className="bg-orange-50 p-6 rounded-xl mb-10">
              <p className="text-lg text-gray-700">
                Order ID: <span className="font-medium">{orderId}</span>
              </p>
            </div>
          )}

          <p className="text-xl text-gray-700 mb-10">
            No payment has been made.<br />
            You can try again whenever you're ready.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/"
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-xl font-medium text-xl transition shadow-lg flex items-center justify-center gap-3"
            >
              Back to Home
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>

            <Link
              to="/contact"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-12 py-5 rounded-xl font-medium text-xl transition shadow-lg"
            >
              Need Help? Contact Us
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-10">
            You will be redirected to the homepage in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;