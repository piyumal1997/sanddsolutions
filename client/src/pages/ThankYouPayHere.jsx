// src/pages/ThankYouPayHere.jsx  (Improved version)
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

const ThankYouPayHere = () => {
  const [searchParams] = useSearchParams();
  const [orderId] = useState(
    searchParams.get("order_id") || searchParams.get("orderId") || null,
  );
  const [amount] = useState(
    searchParams.get("payhere_amount") || searchParams.get("amount") || null,
  );

  // Auto redirect after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 text-center">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-16">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-8xl md:text-9xl mb-6 animate-pulse"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Thank You!</h1>
          <p className="text-xl md:text-2xl opacity-90">
            Your payment was successful
          </p>
        </div>

        {/* Order Summary */}
        <div className="p-8 md:p-12">
          <div className="bg-green-50 p-6 rounded-xl mb-10">
            <h3 className="text-2xl font-semibold text-green-800 mb-6">
              Order Confirmed
            </h3>
            <div className="space-y-4 text-left text-gray-700 text-lg">
              {orderId && (
                <p className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium">{orderId}</span>
                </p>
              )}
              {amount && (
                <p className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">
                    LKR {Number(amount).toLocaleString()}
                  </span>
                </p>
              )}
              <p className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">Completed</span>
              </p>
            </div>
          </div>

          <p className="text-xl text-gray-700 mb-10">
            We have received your payment and your order is now being processed.
            <br />
            You will receive a confirmation email shortly.
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
              Need Help?
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

export default ThankYouPayHere;
