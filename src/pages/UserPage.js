// src/pages/UserPage.js
import React, { useState, useEffect } from "react";
import api from "../services/api";

function UserPage({ role, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
  });
  const [editId, setEditId] = useState(null);

  // ✅ Alert state
  const [alert, setAlert] = useState({ type: "", message: "" });

  // ✅ Confirmation modal state
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  useEffect(() => {
    if (role === "admin") {
      fetchData();
    }
  }, [role]);

  const fetchData = async () => {
    setIsLoading(true);
    setAlert({ type: "", message: "" });
    try {
      await Promise.all([fetchUsers(), fetchRoles()]);
    } catch (err) {
      setAlert({
        type: "error",
        message: "Failed to load user data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await api.get("/users/");
    setUsers(res.data);
  };

  const fetchRoles = async () => {
    const res = await api.get("/roles/");
    setRoles(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        username: form.username,
        email: form.email,
        role_id: form.role_id ? parseInt(form.role_id, 10) : null,
      };

      if (!editId) {
        payload.password = form.password;
        await api.post("/users/", payload);
        setAlert({ type: "success", message: "User added successfully!" });
      } else {
        if (form.password && form.password.trim() !== "") {
          payload.password = form.password;
        }
        await api.patch(`/users/${editId}/`, payload);
        setAlert({ type: "success", message: "User updated successfully!" });
      }

      await fetchData();
      resetForm();
    } catch (err) {
      console.error("Error response:", err.response?.data || err.message);
      setAlert({ type: "error", message: "Error saving user" });
    }
  };

  const resetForm = () => {
    setForm({ username: "", email: "", password: "", role_id: "" });
    setEditId(null);
  };

  const handleEdit = (usr) => {
    setForm({
      username: usr.username,
      email: usr.email,
      password: "",
      role_id: usr.role?.id || "",
    });
    setEditId(usr.id);
  };

  const confirmDeleteUser = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${confirmDelete.id}/`);
      setAlert({ type: "success", message: "User deleted successfully!" });
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setAlert({ type: "error", message: "Error deleting user" });
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };

  if (role !== "admin") {
    return <p className="text-red-500 p-4">Access Denied</p>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-700 text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 relative">
      <h1 className="text-3xl font-bold text-blue-800">User Management</h1>

      {/* ✅ Alert */}
      {alert.message && (
        <div
          className={`p-3 rounded-md text-white ${
            alert.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* User Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Username"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder={
              editId
                ? "New Password (leave blank to keep old)"
                : "Password (required)"
            }
            required={!editId}
          />
          <select
            name="role_id"
            value={form.role_id}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editId ? "Update User" : "Add User"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Username</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((usr) => (
                <tr key={usr.id} className="border-t">
                  <td className="p-2">{usr.username}</td>
                  <td className="p-2">{usr.email}</td>
                  <td className="p-2">{usr.role?.name || "—"}</td>
                  <td className="p-2 flex space-x-2">
                    {usr.id !== currentUserId ? (
                      <>
                        <button
                          onClick={() => handleEdit(usr)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDeleteUser(usr.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 italic">Own Account</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this user?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;
