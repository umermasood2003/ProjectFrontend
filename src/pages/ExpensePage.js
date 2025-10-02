import React, { useState, useEffect } from "react";
import api from "../services/api";

function ExpensesPage({ role }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [form, setForm] = useState({
    receiver_name: "",
    amount: "",
    fee: "",
    transaction_id: "",
    transaction_type: "",
    date_time: "",
  });

  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchExpenses = async (from = "", to = "") => {
    setLoading(true);
    try {
      let url = "/expenses/";
      if (from || to) {
        const params = new URLSearchParams();
        if (from) params.append("from_date", from);
        if (to) params.append("to_date", to);
        url += `?${params.toString()}`;
      }
      const res = await api.get(url);
      setExpenses(res.data);
    } catch (error) {
      showMessage(
        error.response?.data?.detail || "Failed to fetch expenses",
        "error"
      );
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteExpense = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${confirmDelete.id}/`);
      setExpenses((prev) => prev.filter((exp) => exp.id !== confirmDelete.id));
      showMessage("Expense deleted successfully!", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.detail || "Error deleting expense",
        "error"
      );
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };

  const handleImport = async () => {
    if (!fromDate || !toDate) {
      showMessage(
        "⚠️ Please select both start and end dates before importing.",
        "error"
      );
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      showMessage("⚠️ Start date cannot be after end date.", "error");
      return;
    }
    setImporting(true);
    try {
      const res = await api.post(
        `/expenses/fetch_from_gmail/?from_date=${fromDate}&to_date=${toDate}`
      );
      showMessage(res.data.message || "Imported successfully!", "success");
      fetchExpenses(fromDate, toDate);
    } catch (error) {
      showMessage(
        error.response?.data?.detail || "Failed to import from Gmail",
        "error"
      );
    } finally {
      setImporting(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || parseFloat(form.amount) <= 0) {
      showMessage("Amount must be greater than 0", "error");
      return;
    }

    const newExpense = {
      receiver_name: form.receiver_name || "",
      transaction_type: form.transaction_type || "Unknown",
      transaction_id: form.transaction_id || "",
      amount: parseFloat(form.amount),
      fee: form.fee ? parseFloat(form.fee) : 0,
      total: parseFloat(form.amount) + (form.fee ? parseFloat(form.fee) : 0),
      date_time: form.date_time
        ? new Date(form.date_time).toISOString()
        : new Date().toISOString(),
    };

    try {
      const res = await api.post("/expenses/", newExpense);
      setExpenses((prev) => [...prev, res.data]);
      showMessage("Expense added successfully!", "success");
      setForm({
        receiver_name: "",
        amount: "",
        fee: "",
        transaction_id: "",
        transaction_type: "",
        date_time: "",
      });
    } catch (error) {
      showMessage(
        error.response?.data?.detail || "Error adding expense",
        "error"
      );
    }
  };

  const totalExpense = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0) + parseFloat(exp.fee || 0),
    0
  );

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
      {/* Notification */}
      {message && (
        <div
          className={`p-3 rounded-md text-white ${
            messageType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* Header + Gmail Import + Date Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-800">Expenses</h1>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-input"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-input"
          />
          <button
            onClick={() => fetchExpenses(fromDate, toDate)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Filter
          </button>
          <button
            onClick={handleImport}
            className={`px-4 py-2 rounded text-white ${
              importing || !fromDate || !toDate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={importing || !fromDate || !toDate}
          >
            {importing ? "Importing..." : "Import from Gmail"}
          </button>
        </div>
      </div>

      {/* Add Expense Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="receiver_name"
            placeholder="Sent To"
            value={form.receiver_name}
            onChange={handleChange}
            className="form-input"
            required
          />
          <input
            type="number"
            step="0.01"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="form-input"
            required
          />
          <input
            type="number"
            step="0.01"
            name="fee"
            placeholder="Fee"
            value={form.fee}
            onChange={handleChange}
            className="form-input"
          />
          <input
            type="text"
            name="transaction_id"
            placeholder="Transaction ID"
            value={form.transaction_id}
            onChange={handleChange}
            className="form-input"
          />
          <input
            type="text"
            name="transaction_type"
            placeholder="Transaction Type"
            value={form.transaction_type}
            onChange={handleChange}
            className="form-input"
          />
          <input
            type="datetime-local"
            name="date_time"
            value={form.date_time}
            onChange={handleChange}
            className="form-input"
          />
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>

      {/* Total Expense */}
      <div className="bg-blue-100 p-4 rounded-lg shadow-md">
        <p className="text-lg font-semibold text-blue-900">
          💰 Total Expense:{" "}
          <span className="text-2xl">Rs. {totalExpense.toFixed(2)}</span>
        </p>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Date & Time
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Sent To
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Fee
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Transaction ID
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Transaction Type
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-gray-50">
                <td className="p-4 whitespace-nowrap">
                  {new Date(exp.date_time).toLocaleString("en-PK")}
                </td>
                <td className="p-4">{exp.receiver_name}</td>
                <td className="p-4">Rs. {parseFloat(exp.amount).toFixed(2)}</td>
                <td className="p-4">
                  Rs. {parseFloat(exp.fee || 0).toFixed(2)}
                </td>
                <td className="p-4">
                  Rs.{" "}
                  {(
                    parseFloat(exp.amount || 0) + parseFloat(exp.fee || 0)
                  ).toFixed(2)}
                </td>
                <td className="p-4">{exp.transaction_id}</td>
                <td className="p-4">{exp.transaction_type}</td>
                <td className="p-4">
                  <button
                    onClick={() => confirmDeleteExpense(exp.id)}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete this expense?
            </p>
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

export default ExpensesPage;
