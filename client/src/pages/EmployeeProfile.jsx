// src/pages/EmployeeProfile.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";

const EmployeeProfile = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/employees/${id}/profile`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message);
        setEmployee(data.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Not Found",
          text: "This employee profile does not exist or has been removed.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Employee Not Found</h1>
          <Link to="/" className="text-green-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
            {employee.photo ? (
              <img src={employee.photo} alt={employee.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center text-6xl">👤</div>
            )}
          </div>
          <h1 className="text-3xl font-bold">{employee.full_name}</h1>
          <p className="text-green-100 mt-1">{employee.position}</p>
        </div>

        {/* Info */}
        <div className="p-8 space-y-6">
          <div>
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="font-mono text-xl font-semibold text-gray-800">{employee.employee_number}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-semibold text-lg ${employee.statusColor}`}>
              {employee.status}
            </p>
          </div>

          {employee.contact_number && (
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">{employee.contact_number}</p>
            </div>
          )}

          {employee.address && (
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-gray-700">{employee.address}</p>
            </div>
          )}
        </div>

        <div className="border-t p-6 text-center">
          <Link
            to="/"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition"
          >
            Back to S & D Solutions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;