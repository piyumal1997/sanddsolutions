import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { protectedFetch } from "../../utils/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "residential-solar",
    date: "",
    details: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await protectedFetch(`${API_BASE}/api/projects`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to load projects");
      }
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Could not load projects",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("description", form.description.trim());
      payload.append("type", form.type);
      payload.append("date", form.date);
      payload.append("details", form.details.trim());

      if (editing) {
        // We pass back the existing images so the server knows what to keep
        // If you added a "delete image" feature, you would filter editing.images here
        payload.append("existingImages", JSON.stringify(editing.images || []));
      }

      files.forEach((file) => payload.append("images", file));

      const url = editing
        ? `${API_BASE}/api/projects/${editing.id}`
        : `${API_BASE}/api/projects`;
      const method = editing ? "PUT" : "POST";

      const res = await protectedFetch(url, { method, body: payload });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Operation failed");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Project saved successfully",
        timer: 2000,
      });
      loadProjects();
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: err.message,
      });
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      type: "residential-solar",
      date: "",
      details: "",
    });
    setFiles([]);
  };

  const handleEdit = (project) => {
    setEditing(project);

    // FIX: Format date to YYYY-MM-DD so the <input type="date"> can display it
    let formattedDate = "";
    if (project.date) {
      const d = new Date(project.date);
      formattedDate = d.toISOString().split("T")[0];
    }

    setForm({
      title: project.title || "",
      description: project.description || "",
      type: project.type || "residential-solar",
      date: formattedDate,
      details: project.details || "",
    });
    setFiles([]);
  };

  const handleDelete = async (id) => {
    const confirmed = await Swal.fire({
      title: "Delete Project?",
      text: "This will permanently delete the project.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await protectedFetch(`${API_BASE}/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      Swal.fire("Success", "Project deleted", "success");
      loadProjects();
    } catch (err) {
      Swal.fire("Error", err.message || "Could not delete project", "error");
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-4xl lg:text-5xl font-bold mb-10 text-gray-900">
        Project Management
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-8">
          {editing ? "Edit Project" : "Add New Project"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input
            placeholder="Project Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="residential-solar">Residential Solar</option>
            <option value="industrial-solar">Industrial Solar</option>
            <option value="automation">Automation</option>
            <option value="engineering">Engineering</option>
            <option value="cooling solution">Cooling Solution</option>
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          />

          <textarea
            placeholder="Full Description *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            required
            className="md:col-span-2 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
          />

          {/* FIX: Show existing images in Edit Mode */}
          {editing && editing.images && editing.images.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Current Project Media:
              </label>
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                {editing.images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24">
                    {img.toLowerCase().endsWith(".mp4") ? (
                      <video
                        src={img}
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <img
                        src={img}
                        alt="Existing"
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                * Uploading new files below will be added to these existing
                images.
              </p>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-lg font-medium mb-3 text-gray-700">
              {editing ? "Add More Images / Videos" : "Upload Images / Videos"}{" "}
              (max 10)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/mp4"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full p-4 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-green-50 file:text-green-700"
            />
          </div>

          <div className="md:col-span-2 flex gap-6 mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 rounded-xl font-semibold text-white ${loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"}`}
            >
              {editing ? "Update Project" : "Add Project"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-600 text-white py-4 rounded-xl"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <h2 className="text-3xl font-bold mb-8">
        All Projects ({projects.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-3">{project.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>
            <div className="text-sm text-gray-500 mb-6">
              <p>
                Type: <span className="font-medium">{project.type}</span>
              </p>
              <p>
                Date:{" "}
                <span className="font-medium">
                  {project.date
                    ? new Date(project.date).toLocaleDateString()
                    : "N/A"}
                </span>
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleEdit(project)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsManagement;
