import React, { useState, useEffect } from "react";
import api from "../services/api";

function IncomePage({ role }) {
  const [income, setIncome] = useState([]);
  const [form, setForm] = useState({
    date: "",
    title: "",
    source: "",
    amount: "",
  });
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  useEffect(() => {
    fetchIncome();
  }, []);

  // Show alert for 3 seconds
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const fetchIncome = async () => {
    try {
      const res = await api.get("/incomes/");
      setIncome(res.data);
      setAlert({ type: "", message: "" });
    } catch (error) {
      setIncome([]);
      showAlert("error", "Failed to fetch income");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/incomes/${editId}/`, form);
        showAlert("success", "Income updated successfully!");
      } else {
        await api.post("/incomes/", form);
        showAlert("success", "Income added successfully!");
      }
      fetchIncome();
      resetForm();
    } catch (error) {
      showAlert("error", "Error saving income");
    }
  };

  const handleEdit = (inc) => {
    setForm({
      date: inc.date,
      title: inc.title,
      source: inc.source,
      amount: inc.amount.toString(),
    });
    setEditId(inc.id);
  };

  // Trigger confirmation popup
  const confirmDeleteIncome = (id) => {
    setConfirmDelete({ show: true, id });
  };

  // Delete after confirming
  const handleDelete = async () => {
    try {
      await api.delete(`/incomes/${confirmDelete.id}/`);
      showAlert("success", "Income deleted successfully!");
      fetchIncome();
    } catch (error) {
      showAlert("error", "Error deleting income");
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };

  const resetForm = () => {
    setForm({ date: "", title: "", source: "", amount: "" });
    setEditId(null);
  };
  if (role !== "user") {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold text-red-600">❌ Access Denied</h2>
        <p className="mt-2 text-gray-700">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-8 relative">
      <h1 className="text-3xl font-bold text-blue-800">Income</h1>

      {/* Alerts */}
      {alert.message && (
        <p
          className={`p-3 rounded ${
            alert.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {alert.message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Title"
            required
          />
          <input
            type="text"
            name="source"
            value={form.source}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Source"
            required
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="p-2 border rounded"
            placeholder="Amount"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editId ? "Update" : "Add"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Date</th>
              <th className="p-2">Title</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Source</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {income.map((inc) => (
              <tr key={inc.id} className="border-t">
                <td className="p-2">
                  {new Date(inc.date).toLocaleDateString()}
                </td>
                <td className="p-2">{inc.title}</td>
                <td className="p-2">Rs.{parseFloat(inc.amount).toFixed(2)}</td>
                <td className="p-2">{inc.source}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleEdit(inc)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDeleteIncome(inc.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal confirmation */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center space-y-4">
            <h2 className="text-lg font-bold text-red-600">Confirm Deletion</h2>
            <p>Are you sure you want to delete this record?</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete({ show: false, id: null })}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomePage;
