// src/pages/admin/PaymentsManagement.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { protectedFetch } from "../../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const PaymentsManagement = () => {
  const [links, setLinks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    amount: "",
    description: "",
    expiry_date: "",
    send_email: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await protectedFetch(`${API_BASE}/api/payments`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setLinks(data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (link) => {
    setEditing(link);
    setForm({
      customer_name: link.customer_name || "",
      customer_email: link.customer_email || "",
      customer_phone: link.customer_phone || "",
      amount: link.amount || "",
      description: link.description || "",
      expiry_date: link.expiry_date ? link.expiry_date.split("T")[0] : "",
      send_email: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editing
        ? `${API_BASE}/api/payments/${editing.id}/edit`
        : `${API_BASE}/api/payments/create-link`;

      const res = await protectedFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      Swal.fire({
        icon: "success",
        title: editing ? "Link Updated" : "Link Created",
        text: editing
          ? "Payment link has been updated successfully."
          : "Link created successfully. Copy and share the link.",
        timer: 2500,
      });

      loadLinks();
      resetForm();
    } catch (err) {
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      amount: "",
      description: "",
      expiry_date: "",
      send_email: false,
    });
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    Swal.fire(
      "Copied!",
      "Payment link copied to clipboard. You can now share via WhatsApp or SMS.",
      "success",
    );
  };

  // Consistent Loading Spinner (same style as PackagesManagement)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 font-medium">
            Loading payment links...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">
        Payment Links Management
      </h1>

      {/* Form */}
      <div className="bg-white p-8 rounded-3xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? "Edit Payment Link" : "Create New Payment Link"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input
            placeholder="Customer Name *"
            value={form.customer_name}
            onChange={(e) =>
              setForm({ ...form, customer_name: e.target.value })
            }
            required
            className="p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Customer Email *"
            type="email"
            value={form.customer_email}
            onChange={(e) =>
              setForm({ ...form, customer_email: e.target.value })
            }
            required
            className="p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Customer Phone (optional)"
            value={form.customer_phone}
            onChange={(e) =>
              setForm({ ...form, customer_phone: e.target.value })
            }
            className="p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Amount (LKR) *"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            min="0.01"
            step="0.01"
            className="p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="date"
            value={form.expiry_date}
            onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            className="p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="md:col-span-2 p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <div className="md:col-span-2 flex items-center gap-4">
            <input
              type="checkbox"
              id="send_email"
              checked={form.send_email}
              onChange={(e) =>
                setForm({ ...form, send_email: e.target.checked })
              }
              className="w-5 h-5 accent-green-600"
            />
            <label htmlFor="send_email" className="text-gray-700">
              Send link via email automatically
            </label>
          </div>

          <div className="md:col-span-2 flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition"
            >
              {editing ? "Update Link" : "Create Payment Link"}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-2xl font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Payment Links Table */}
      <h2 className="text-3xl font-bold mb-8">
        All Payment Links ({links.length})
      </h2>

      <div className="overflow-x-auto bg-white rounded-3xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Amount (LKR)
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Expiry
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Created
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium">
                  {link.customer_name || "—"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {link.customer_email || "—"}
                </td>
                <td className="px-6 py-4 font-semibold text-green-700">
                  LKR {Number(link.amount || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      link.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : link.status === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {link.status || "pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {link.expiry_date
                    ? new Date(link.expiry_date).toLocaleDateString()
                    : "No expiry"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(link.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      copyLink(
                        `https://sanddsolutions.lk/pay/${link.unique_id}`,
                      )
                    }
                    className="text-blue-600 hover:text-blue-800 mr-4 font-medium"
                  >
                    Copy Link
                  </button>
                  {link.status === "pending" && (
                    <button
                      onClick={() => handleEdit(link)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
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
