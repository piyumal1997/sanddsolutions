// src/pages/admin/EmployeesManagement.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { protectedFetch } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const EmployeesManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    full_name: '',
    position: '',
    address: '',
    nic_number: '',
    contact_number: '',
    birthday: '',
    education_qualifications: '',
    joined_at: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await protectedFetch(`${API_BASE}/api/employees`);
      const data = await res.json();
      setEmployees(data.data || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (emp) => {
    setEditing(emp);
    setForm({
      full_name: emp.full_name || '',
      position: emp.position || '',
      address: emp.address || '',
      nic_number: emp.nic_number || '',
      contact_number: emp.contact_number || '',
      birthday: emp.birthday ? emp.birthday.split('T')[0] : '',
      education_qualifications: emp.education_qualifications 
        ? emp.education_qualifications.join(', ') 
        : '',
      joined_at: emp.joined_at ? emp.joined_at.split('T')[0] : '',
    });
    setPhoto(null);
    setPhotoPreview(emp.photo || null);
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      full_name: '',
      position: '',
      address: '',
      nic_number: '',
      contact_number: '',
      birthday: '',
      education_qualifications: '',
      joined_at: '',
    });
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('full_name', form.full_name);
    formData.append('position', form.position);
    formData.append('address', form.address);
    formData.append('nic_number', form.nic_number);
    formData.append('contact_number', form.contact_number);
    formData.append('birthday', form.birthday);
    formData.append('joined_at', form.joined_at);

    const eduArray = form.education_qualifications
      .split(',')
      .map(item => item.trim())
      .filter(item => item);
    formData.append('education_qualifications', JSON.stringify(eduArray));

    if (photo) formData.append('photo', photo);

    try {
      const url = editing 
        ? `${API_BASE}/api/employees/${editing.id}` 
        : `${API_BASE}/api/employees`;
      const method = editing ? 'PUT' : 'POST';

      const res = await protectedFetch(url, { method, body: formData });

      if (!res.ok) throw new Error('Failed to save');

      Swal.fire({
        icon: 'success',
        title: editing ? 'Updated' : 'Added',
        text: editing ? 'Employee updated successfully' : 'Employee added successfully',
        timer: 2000,
      });

      loadEmployees();
      resetForm();
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to save employee', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    const confirmed = await Swal.fire({
      title: 'Deactivate Employee?',
      text: 'This employee will no longer appear on the Our Team page.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Deactivate',
    });

    if (!confirmed.isConfirmed) return;

    try {
      await protectedFetch(`${API_BASE}/api/employees/${id}`, { method: 'DELETE' });
      Swal.fire('Deactivated', 'Employee has been deactivated successfully', 'success');
      loadEmployees();
    } catch (err) {
      console.error('Deactivation error:', err);
      Swal.fire('Error', 'Failed to deactivate employee', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl font-bold mb-10 text-gray-900">Employee Management</h1>

      {/* Form */}
      <div className="bg-white p-8 rounded-3xl shadow-xl mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? 'Edit Employee' : 'Add New Employee'}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number *</label>
            <input
              value={form.nic_number}
              onChange={(e) => setForm({ ...form, nic_number: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
            <input
              value={form.contact_number}
              onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
              required
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Joined Date</label>
            <input
              type="date"
              value={form.joined_at}
              onChange={(e) => setForm({ ...form, joined_at: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education Qualifications (comma separated)
            </label>
            <input
              value={form.education_qualifications}
              onChange={(e) => setForm({ ...form, education_qualifications: e.target.value })}
              className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500"
              placeholder="BSc Engineering, Diploma in Solar Technology"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full p-4 border border-gray-300 rounded-2xl"
            />
            {photoPreview && (
              <div className="mt-4">
                <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow" />
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex gap-4 mt-8">
            <button
              type="submit"
              disabled={submitLoading}
              className={`flex-1 py-4 rounded-2xl font-semibold text-white transition ${
                submitLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {submitLoading ? 'Saving...' : editing ? 'Update Employee' : 'Add Employee'}
            </button>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-600 text-white py-4 rounded-2xl hover:bg-gray-700 transition font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Employees Table */}
      <h2 className="text-3xl font-bold mb-8">All Employees ({employees.length})</h2>

      <div className="overflow-x-auto bg-white rounded-3xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Photo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Employee No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Position</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Birthday</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  {emp.photo ? (
                    <img src={emp.photo} alt={emp.full_name} className="w-12 h-12 object-cover rounded-full border" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">No Photo</div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-700">{emp.employee_number}</td>
                <td className="px-6 py-4 font-semibold">{emp.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{emp.position}</td>
                <td className="px-6 py-4 text-gray-600">{emp.contact_number}</td>
                <td className="px-6 py-4 text-gray-600">
                  {emp.birthday ? new Date(emp.birthday).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${emp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => handleEdit(emp)} className="text-blue-600 hover:text-blue-800 mr-4">Edit</button>
                  <button onClick={() => handleDeactivate(emp.id)} className="text-red-600 hover:text-red-800">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesManagement;