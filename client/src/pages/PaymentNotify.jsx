// src/pages/PaymentNotify.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const PaymentNotify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("unknown");
  const [orderId, setOrderId] = useState(null);
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const payhereStatus =
      searchParams.get("status_code") || searchParams.get("status");
    const receivedOrderId =
      searchParams.get("order_id") || searchParams.get("orderId");
    const receivedAmount =
      searchParams.get("payhere_amount") || searchParams.get("amount");

    setOrderId(receivedOrderId);
    setAmount(receivedAmount);

    // PayHere status code mapping
    switch (payhereStatus) {
      case "2":
        setStatus("success");
        break;
      case "0":
        setStatus("pending");
        break;
      case "-1":
        setStatus("failed");
        break;
      case "cancel":
      case "cancelled":
        setStatus("cancelled");
        break;
      default:
        setStatus("unknown");
    }

    setLoading(false);
  }, [searchParams]);

  // Status configurations
  const statusConfig = {
    success: {
      icon: faCheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      title: "Payment Successful!",
      message: "Thank you! Your payment has been successfully processed.",
      nextAction: "View your order details or continue shopping.",
    },
    failed: {
      icon: faTimesCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      title: "Payment Failed",
      message:
        "Unfortunately, your payment could not be processed. Please try again.",
      nextAction: "Return to checkout or contact support.",
    },
    pending: {
      icon: faSpinner,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      title: "Payment Pending",
      message:
        "Your payment is being processed. This usually takes a few minutes.",
      nextAction: "We will notify you once it is confirmed.",
    },
    cancelled: {
      icon: faTimesCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      title: "Payment Cancelled",
      message: "You have cancelled the payment process.",
      nextAction: "You can try again or contact support if needed.",
    },
    unknown: {
      icon: faTimesCircle,
      color: "text-gray-600",
      bg: "bg-gray-50",
      title: "Payment Status Unknown",
      message:
        "We could not determine the payment status. Please check your email or contact support.",
      nextAction: "We are looking into it.",
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-6xl text-green-600 mb-6"
          />
          <p className="text-xl text-gray-700">
            Verifying your payment status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 text-center">
        {/* Status Banner */}
        <div className={`p-10 md:p-16 ${config.bg}`}>
          <FontAwesomeIcon
            icon={config.icon}
            className={`text-7xl md:text-9xl mb-6 ${config.color}`}
          />
          <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${config.color}`}>
            {config.title}
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 mb-6">
            {config.message}
          </p>
        </div>

        {/* Order Details */}
        <div className="p-8 md:p-12">
          {orderId && (
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl mb-10 text-left">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                Order Details
              </h3>
              <div className="space-y-4 text-gray-700 text-lg">
                <p className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium">{orderId}</span>
                </p>
                {amount && (
                  <p className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">
                      LKR {Number(amount).toLocaleString()}
                    </span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${config.color}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-gray-700 mb-10 text-lg">
            {config.nextAction}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/"
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-xl font-medium text-xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              Back to Home
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>

            <Link
              to="/contact"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-12 py-5 rounded-xl font-medium text-xl transition-all shadow-lg"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentNotify;
