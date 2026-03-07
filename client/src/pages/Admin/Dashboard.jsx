// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { BellIcon } from "@heroicons/react/24/outline";
import { protectedFetch } from "../../utils/auth";
import { useAuth } from "../../context/AuthContext"; // Add this import to access user from context

const Dashboard = () => {
  const { user } = useAuth(); // Get user from context

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    projects: 0,
    packages: 0,
    inquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const notifRes = await protectedFetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications`,
      );
      if (notifRes.ok) {
        const { data } = await notifRes.json();
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n) => !n.is_read).length);
      }

      // Placeholder stats — replace with real endpoint later
      setStats({
        projects: 24,
        packages: 11,
        inquiries: 8,
      });
    } catch (err) {
      if (!err.message?.includes("401")) {
        Swal.fire({
          icon: "error",
          title: "Dashboard Error",
          text: "Could not load some data. Please refresh.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await protectedFetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}/read`,
        {
          method: "PUT",
        },
      );
      loadDashboardData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Welcome back, {user ? user.email.split("@")[0] : "User"}
          </h1>
          <p className="text-xl text-gray-600 mt-2 capitalize">
            {user ? user.role : "Guest"} Dashboard
          </p>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl shadow hover:shadow-lg transition focus:outline-none"
          >
            <BellIcon className="h-8 w-8 text-gray-700" />
            <span className="font-semibold text-gray-800">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-sm px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-96 lg:w-[420px] bg-white rounded-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto border border-gray-200">
              <div className="p-6 border-b bg-gray-50 rounded-t-2xl">
                <h3 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {unreadCount} unread • Recent activity
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-lg">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-6 border-b last:border-none hover:bg-gray-50 transition cursor-pointer ${
                      !notif.is_read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    <p className="font-bold text-gray-900 text-lg">
                      {notif.title}
                    </p>
                    <p className="text-gray-700 mt-2">{notif.message}</p>
                    <p className="text-sm text-gray-500 mt-3">
                      {new Date(notif.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition">
          <h3 className="text-2xl font-semibold text-green-800">
            Total Projects
          </h3>
          <p className="text-6xl font-bold text-green-700 mt-4">
            {stats.projects}
          </p>
          <p className="text-green-600 mt-3">Showcase entries</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition">
          <h3 className="text-2xl font-semibold text-blue-800">
            Active Packages
          </h3>
          <p className="text-6xl font-bold text-blue-700 mt-4">
            {stats.packages}
          </p>
          <p className="text-blue-600 mt-3">Solar system offerings</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl shadow-lg border border-red-200 hover:shadow-xl transition">
          <h3 className="text-2xl font-semibold text-red-800">
            Pending Inquiries
          </h3>
          <p className="text-6xl font-bold text-red-700 mt-4">
            {stats.inquiries}
          </p>
          <p className="text-red-600 mt-3">Awaiting response</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Projects</h3>
          <p className="text-gray-600">Manage showcase entries</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Packages</h3>
          <p className="text-gray-600">Solar system offerings</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Panel Brands
          </h3>
          <p className="text-gray-600">Manage panel brands</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Inverter Brands
          </h3>
          <p className="text-gray-600">Manage inverter brands</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
