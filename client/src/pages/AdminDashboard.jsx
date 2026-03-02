// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { BellIcon } from "@heroicons/react/24/outline"; // npm install @heroicons/react

const API_BASE = import.meta.env.VITE_API_BASE_URL || ""; // e.g. https://api.sanddsolutions.lk

const AdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");
  const [user, setUser] = useState(null); // { email, role }
  const [loading, setLoading] = useState(true);

  // Auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Projects
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    type: "residential-solar",
    date: "",
    details: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Admin-only: Users
  const [users, setUsers] = useState([]);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    nic_number: "",
    email: "",
    password: "",
    role: "manager",
  });
  const [userFormError, setUserFormError] = useState("");

  // Notifications (for both admin & manager)
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch data when token or role changes
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ email: payload.email, role: payload.role });
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("adminToken");
        setToken("");
        return;
      }

      fetchProjects();
      fetchNotifications();

      if (user?.role === "admin") {
        fetchUsers();
      }

      // Poll notifications every 45 seconds
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [token, user?.role]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to load projects");
      }

      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Projects Error",
        text: err.message || "Unable to load projects. Please try again.",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to load users");
      }

      const { data } = await res.json();
      setUsers(data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Users Error",
        text: err.message || "Unable to load user list.",
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load notifications");

      const { data } = await res.json();
      setNotifications(data || []);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Notifications fetch failed:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';

    try {
      const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {  // or /api/v2/auth/${endpoint}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isRegistering ? 'Registration failed' : 'Login failed'));
      }

      if (isRegistering) {
        Swal.fire({
          icon: 'success',
          title: 'Registered!',
          text: 'You can now log in.',
          timer: 2000,
        });
        setIsRegistering(false);
      } else {
        // Handle both possible response shapes (old flat + new {data: {token, user}})
        const token = data.token || data.data?.token;
        const userData = data.user || data.data?.user;

        if (!token || !userData) {
          throw new Error("Invalid login response from server");
        }

        localStorage.setItem('adminToken', token);
        setToken(token);
        setUser({
          email: userData.email,
          role: userData.role,
        });

        Swal.fire({
          icon: 'success',
          title: 'Welcome!',
          text: `Logged in as ${userData.role}`,
          timer: 1800,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Failed',
        text: err.message || 'Something went wrong. Please try again.',
      });
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Log out?",
      text: "You will be logged out of the dashboard.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, log out",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("adminToken");
      setToken("");
      setUser(null);
      setProjects([]);
      setUsers([]);
      setNotifications([]);
      Swal.fire({
        icon: "success",
        title: "Logged Out",
        timer: 1500,
      });
    }
  };

  // ────────────────────────────────────────────────
  // Project CRUD Handlers
  // ────────────────────────────────────────────────

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formPayload = new FormData();
    formPayload.append("title", projectForm.title.trim());
    formPayload.append("description", projectForm.description.trim());
    formPayload.append("type", projectForm.type);
    formPayload.append("date", projectForm.date);
    formPayload.append("details", projectForm.details.trim());

    if (editingProject) {
      formPayload.append(
        "existingImages",
        JSON.stringify(editingProject.images || []),
      );
    }

    selectedFiles.forEach((file) => formPayload.append("images", file));

    try {
      const url = editingProject
        ? `${API_BASE}/api/projects/${editingProject.id}`
        : `${API_BASE}/api/projects`;

      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.message ||
            (editingProject ? "Update failed" : "Create failed"),
        );
      }

      Swal.fire({
        icon: "success",
        title: editingProject ? "Project Updated" : "Project Added",
        timer: 1800,
      });

      fetchProjects();
      resetProjectForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Project Error",
        text: err.message || "Failed to save project",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      type: project.type || "residential-solar",
      date: project.date || "",
      details: project.details || "",
    });
    setSelectedFiles([]);
  };

  const handleDeleteProject = async (id) => {
    const result = await Swal.fire({
      title: "Deactivate Project?",
      text: "This will hide the project (soft delete). You can reactivate later if needed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, deactivate",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Deactivation failed");
      }

      Swal.fire("Success", "Project deactivated.", "success");
      fetchProjects();
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "Could not deactivate project",
        "error",
      );
    }
  };

  const resetProjectForm = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      description: "",
      type: "residential-solar",
      date: "",
      details: "",
    });
    setSelectedFiles([]);
  };

  // ────────────────────────────────────────────────
  // User Management (Admin only)
  // ────────────────────────────────────────────────

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserFormError("");

    const { name, nic_number, email, password } = newUserForm;
    if (
      !name.trim() ||
      !nic_number.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setUserFormError("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUserForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      Swal.fire({
        icon: "success",
        title: "User Created",
        text: "New user added successfully.",
        timer: 2000,
      });

      fetchUsers();
      setNewUserForm({
        name: "",
        nic_number: "",
        email: "",
        password: "",
        role: "manager",
      });
    } catch (err) {
      setUserFormError(err.message);
    }
  };

  const toggleUserActive = async (id, currentActive) => {
    const action = currentActive ? "deactivate" : "reactivate";
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
      text: `This will ${action} the user account.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: currentActive ? "#d33" : "#28a745",
      confirmButtonText: `Yes, ${action}`,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (!res.ok) throw new Error("Failed to update user status");

      Swal.fire("Success", `User ${action}d`, "success");
      fetchUsers();
    } catch (err) {
      Swal.fire(
        "Error",
        err.message || "Could not update user status",
        "error",
      );
    }
  };

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form
          onSubmit={handleAuth}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <h2 className="text-4xl font-bold text-center mb-10 text-gray-900">
            {isRegistering ? "Register Admin" : "Admin / Manager Login"}
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-6 py-4 border border-gray-300 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-6 py-4 border border-gray-300 rounded-xl mb-8 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold text-lg shadow-md"
          >
            {isRegistering ? "Register" : "Login"}
          </button>

          <p className="text-center mt-8 text-gray-600">
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-green-600 hover:underline font-medium"
            >
              {isRegistering ? "Login" : "Register"}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Notification Bell */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 relative">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            {user.role === "admin" ? "Admin Dashboard" : "Manager Dashboard"}
          </h1>

          <div className="flex items-center gap-8">
            {/* Notification Bell */}
            <div
              className="relative cursor-pointer"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <BellIcon className="h-8 w-8 text-gray-700 hover:text-green-600 transition" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="text-right">
              <p className="text-lg font-medium">{user.email}</p>
              <p className="text-sm text-gray-600 capitalize">{user.role}</p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition font-medium shadow-md"
            >
              Logout
            </button>
          </div>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-20 right-0 w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto border border-gray-200">
              <div className="p-5 border-b bg-gray-50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-gray-900">
                  Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} unread • Recent inquiries & updates
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-5 border-b hover:bg-gray-50 cursor-pointer transition ${
                      !notif.is_read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      if (!notif.is_read) markAsRead(notif.id);
                      // You can add navigation here later, e.g.:
                      // if (notif.type === 'new_inquiry') window.location.href = `/admin/inquiries/${notif.related_id}`;
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {notif.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Admin-only: User Management */}
        {user.role === "admin" && (
          <section className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Manage Users
            </h2>

            {/* Create User Form */}
            <form
              onSubmit={handleCreateUser}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <input
                placeholder="Full Name *"
                value={newUserForm.name}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, name: e.target.value })
                }
                required
                className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                placeholder="NIC Number *"
                value={newUserForm.nic_number}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, nic_number: e.target.value })
                }
                required
                className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                required
                className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                placeholder="Password *"
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                required
                className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={newUserForm.role}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, role: e.target.value })
                }
                className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="md:col-span-3 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
              >
                Create New User
              </button>
              {userFormError && (
                <p className="md:col-span-3 text-red-600 text-center font-medium">
                  {userFormError}
                </p>
              )}
            </form>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      NIC
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.nic_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserActive(u.id, u.is_active)}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            u.is_active
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Project Management – Shared for admin & manager */}
        <section className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            {editingProject ? "Edit Project" : "Add New Project"}
          </h2>

          <form
            onSubmit={handleProjectSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <input
              type="text"
              placeholder="Title *"
              value={projectForm.title}
              onChange={(e) =>
                setProjectForm({ ...projectForm, title: e.target.value })
              }
              required
              className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={projectForm.type}
              onChange={(e) =>
                setProjectForm({ ...projectForm, type: e.target.value })
              }
              className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="residential-solar">Residential Solar</option>
              <option value="industrial-solar">Industrial Solar</option>
              <option value="automation">Automation</option>
              <option value="engineering">Engineering</option>
              <option value="cooling solution">Cooling Solution</option>
            </select>

            <input
              type="date"
              value={projectForm.date}
              onChange={(e) =>
                setProjectForm({ ...projectForm, date: e.target.value })
              }
              required
              className="px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <textarea
              placeholder="Description *"
              value={projectForm.description}
              onChange={(e) =>
                setProjectForm({ ...projectForm, description: e.target.value })
              }
              required
              rows={4}
              className="md:col-span-2 px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <textarea
              placeholder="Details (optional)"
              value={projectForm.details}
              onChange={(e) =>
                setProjectForm({ ...projectForm, details: e.target.value })
              }
              rows={6}
              className="md:col-span-2 px-6 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="md:col-span-2">
              <label className="block text-lg font-medium mb-3 text-gray-700">
                Upload Images / Videos (max 10)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/mp4"
                onChange={(e) =>
                  setSelectedFiles(Array.from(e.target.files || []))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            {editingProject && editingProject.images?.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-lg font-medium mb-4 text-gray-700">
                  Current Images ({editingProject.images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {editingProject.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url.startsWith("/") ? `${API_BASE}${url}` : url}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg shadow-sm transition group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-6 mt-8">
              <button
                type="submit"
                disabled={uploading}
                className={`flex-1 py-4 px-8 rounded-xl font-semibold text-white transition shadow-md ${
                  uploading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {uploading
                  ? "Saving..."
                  : editingProject
                    ? "Update Project"
                    : "Add Project"}
              </button>

              {editingProject && (
                <button
                  type="button"
                  onClick={resetProjectForm}
                  className="flex-1 bg-gray-600 text-white py-4 px-8 rounded-xl hover:bg-gray-700 transition font-semibold shadow-md"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Projects List */}
          <h2 className="text-3xl font-bold mt-16 mb-8 text-gray-900">
            Existing Projects ({projects.length})
          </h2>

          {projects.length === 0 ? (
            <p className="text-center text-xl text-gray-600 py-12">
              No projects added yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300"
                >
                  <h3 className="text-xl font-bold mb-3 text-gray-900">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1 mb-6">
                    <p>
                      Type:{" "}
                      <span className="font-medium">
                        {project.type.replace("-", " ").toUpperCase()}
                      </span>
                    </p>
                    <p>
                      Date:{" "}
                      <span className="font-medium">
                        {project.date || "N/A"}
                      </span>
                    </p>
                    <p>
                      Images:{" "}
                      <span className="font-medium">
                        {project.images?.length || 0}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition font-medium"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
