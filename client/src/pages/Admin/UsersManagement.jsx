// src/pages/admin/UsersManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '', nic_number: '', email: '', password: '', role: 'manager'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await protectedFetch(`${API_BASE}/api/admin/users`);
      if (!res.ok) throw new Error('Failed to load users');
      const { data } = await res.json();
      setUsers(data || []);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');

    const { name, nic_number, email, password } = newUser;
    if (!name.trim() || !nic_number.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await protectedFetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create user');
      }

      Swal.fire('Success', 'User created successfully', 'success');
      loadUsers();
      setNewUser({ name: '', nic_number: '', email: '', password: '', role: 'manager' });
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = async (id, currentActive) => {
    const action = currentActive ? 'deactivate' : 'activate';
    const confirmed = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
      text: `This will ${action} the account.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentActive ? '#d33' : '#28a745',
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (!res.ok) throw new Error('Failed');
      Swal.fire('Success', `User ${action}d`, 'success');
      loadUsers();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-10 text-gray-900">User Management</h1>

      {/* Create User Form */}
      <div className="bg-white p-8 rounded-2xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">Create New User</h2>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            placeholder="Full Name *"
            value={newUser.name}
            onChange={e => setNewUser({...newUser, name: e.target.value})}
            required
            className="p-4 border rounded-xl focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="NIC Number *"
            value={newUser.nic_number}
            onChange={e => setNewUser({...newUser, nic_number: e.target.value})}
            required
            className="p-4 border rounded-xl focus:ring-2 focus:ring-green-500"
          />
          <input
            type="email"
            placeholder="Email *"
            value={newUser.email}
            onChange={e => setNewUser({...newUser, email: e.target.value})}
            required
            className="p-4 border rounded-xl focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            placeholder="Password *"
            value={newUser.password}
            onChange={e => setNewUser({...newUser, password: e.target.value})}
            required
            className="p-4 border rounded-xl focus:ring-2 focus:ring-green-500"
          />
          <select
            value={newUser.role}
            onChange={e => setNewUser({...newUser, role: e.target.value})}
            className="p-4 border rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="md:col-span-3 bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition font-semibold shadow-md"
          >
            Create User
          </button>
          {error && <p className="md:col-span-3 text-red-600 text-center font-medium">{error}</p>}
        </form>
      </div>

      {/* Users List */}
      <h2 className="text-3xl font-bold mb-8 text-gray-900">All Users</h2>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">NIC</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.nic_number}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleActive(u.id, u.is_active)}
                    className={`px-5 py-2 rounded-lg font-medium transition ${
                      u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;