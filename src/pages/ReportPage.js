import React, { useState, useEffect } from "react";
import api from "../services/api";

function ReportsPage({ role }) {
  const [profitLoss, setProfitLoss] = useState({});
  const [typeBreakdown, setTypeBreakdown] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" }); // success/error alert

  useEffect(() => {
    if (selectedMonth) {
      fetchReports();
    }
  }, [selectedMonth]);

  const fetchReports = async () => {
    try {
      const [profitRes, typeRes, topRes] = await Promise.all([
        api.get(`/reports/profit_loss/?month=${selectedMonth}`),
        api.get(`/reports/type_breakdown/?month=${selectedMonth}`),
        api.get(`/reports/top_expenses/?month=${selectedMonth}&limit=5`),
      ]);

      setProfitLoss(profitRes.data);
      setTypeBreakdown(typeRes.data);
      setTopExpenses(topRes.data);
      setMessage({ text: "Reports loaded successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to load reports", type: "error" });
    }
  };

  // Restrict month input to last 5 years
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const minYear = currentYear - 5;
  const minMonth = `${minYear}-${currentMonth}`;
  const maxMonth = `${currentYear}-${currentMonth}`;

  const exportExcel = async () => {
    try {
      const res = await api.get(
        `/reports/export_excel/?month=${selectedMonth}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial_report_${selectedMonth}.xlsx`);
      document.body.appendChild(link);
      link.click();
      setMessage({ text: "Excel exported successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Error exporting Excel", type: "error" });
    }
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-800">Reports</h1>

      {/* Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Month Filter */}
      <div className="bg-white p-4 rounded shadow flex items-center gap-4">
        <label className="font-semibold text-gray-700">
          Select Month:
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            min={minMonth}
            max={maxMonth}
            className="border px-3 py-2 rounded-md ml-2"
          />
        </label>
      </div>

      {/* Profit/Loss */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2 text-blue-800">
          Profit/Loss Summary
        </h2>
        <p>
          <strong>Total Income:</strong> Rs.{profitLoss.total_income || 0}
        </p>
        <p>
          <strong>Total Expenses:</strong> Rs.{profitLoss.total_expenses || 0}
        </p>
        <p>
          <strong>Profit/Loss:</strong>{" "}
          <span
            className={
              (profitLoss.profit_loss || 0) >= 0
                ? "text-green-600"
                : "text-red-600"
            }
          >
            Rs.{profitLoss.profit_loss || 0}
          </span>
        </p>
      </div>

      {/* Transaction Type Breakdown */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2 text-blue-800">
          Transaction Type Breakdown
        </h2>
        <table className="min-w-full text-left border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Transaction Type</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {typeBreakdown.map((item, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{item.transaction_type}</td>
                <td className="p-2 border">Rs.{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Expenses */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Top Expenses</h2>
        <ul className="list-disc list-inside">
          {topExpenses.map((item, idx) => (
            <li key={idx}>
              {item.transaction_type} — Rs.{item.amount} — Sent To:{" "}
              {item.receiver_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Export */}
      <div className="space-x-4">
        <button
          onClick={exportExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}

export default ReportsPage;
