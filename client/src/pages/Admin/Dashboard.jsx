// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { BellIcon } from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { protectedFetch } from "../../utils/auth";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    projects: 0,
    packages: 0,
    inquiries: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  // Only load data when user is fully authenticated
  useEffect(() => {
    if (!user || authLoading) return;

    loadDashboardData();

    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, [user, authLoading]); // ← Important: depend on user & authLoading

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await protectedFetch(`${API_BASE}/api/dashboard`);
      if (statsRes.ok) {
        const { data } = await statsRes.json();
        setStats(data);
      }

      // Fetch notifications
      const notifRes = await protectedFetch(`${API_BASE}/api/notifications`);
      if (notifRes.ok) {
        const { data } = await notifRes.json();
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n) => !n.is_read).length);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      // Only show error if it's not authentication related
      if (!err.message?.includes("401") && !err.message?.includes("token")) {
        Swal.fire({
          icon: "error",
          title: "Dashboard Error",
          text: "Could not load some data. Please refresh the page.",
          timer: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await protectedFetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PUT",
      });
      loadDashboardData();
    } catch (err) {}
  };

  const deleteNotification = async (id) => {
    try {
      await protectedFetch(`${API_BASE}/api/notifications/${id}`, {
        method: "DELETE",
      });
      loadDashboardData();
    } catch (err) {}
  };

  // Show loading while auth is still initializing
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700">Loading dashboard...</p>
        </div>
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
            className="relative p-3 bg-white rounded-full shadow hover:shadow-lg transition focus:outline-none"
          >
            <BellIcon className="h-6 w-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto border border-gray-200">
              <div className="p-4 border-b bg-gray-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900">
                  Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} unread
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-lg">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b last:border-none hover:bg-gray-50 transition cursor-pointer flex justify-between items-start ${
                      !notif.is_read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div
                      className="flex-1"
                      onClick={() => !notif.is_read && markAsRead(notif.id)}
                    >
                      <p className="font-bold text-gray-900 text-md">
                        {notif.title}
                      </p>
                      <p className="text-gray-700 text-sm mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faTrash} size="sm" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-lg border border-green-200 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-green-800">
            Total Projects
          </h3>
          <p className="text-5xl font-bold text-green-700 mt-2">
            {stats.projects}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-blue-800">
            Solar Packages
          </h3>
          <p className="text-5xl font-bold text-blue-700 mt-2">
            {stats.packages}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl shadow-lg border border-red-200 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-red-800">
            Pending Inquiries
          </h3>
          <p className="text-5xl font-bold text-red-700 mt-2">
            {stats.inquiries}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow-lg border border-purple-200 hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-purple-800">
            Active Users
          </h3>
          <p className="text-5xl font-bold text-purple-700 mt-2">
            {stats.activeUsers}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/projects"
          className="block bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Projects</h3>
          <p className="text-gray-600">Manage showcase entries</p>
        </Link>

        <Link
          to="/admin/packages"
          className="block bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Solar Packages
          </h3>
          <p className="text-gray-600">Manage solar packages</p>
        </Link>

        <Link
          to="/admin/brands"
          className="block bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Brands</h3>
          <p className="text-gray-600">Manage brands</p>
        </Link>

        <Link
          to="/admin/capacities"
          className="block bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 border border-gray-200"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Capacities</h3>
          <p className="text-gray-600">Manage capacities</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
