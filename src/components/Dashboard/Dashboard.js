import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [data, setData] = useState({ expenses: [], income: [] });
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, incomeRes] = await Promise.all([
        api.get("/expenses/"),
        api.get("/incomes/"),
      ]);
      setData({ expenses: expensesRes.data, income: incomeRes.data });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
      setData({ expenses: [], income: [] });
    }
  };

  // ✅ Convert to YYYY-MM for filtering
  const toMonthKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // ✅ Filter by selected month
  const filteredExpenses = data.expenses.filter(
    (exp) => toMonthKey(exp.date_time) === selectedMonth
  );
  const filteredIncome = data.income.filter(
    (inc) => toMonthKey(inc.date) === selectedMonth
  );

  const totalExpenses = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );
  const totalIncome = filteredIncome.reduce(
    (sum, inc) => sum + Number(inc.amount),
    0
  );
  const netProfit = totalIncome - totalExpenses;

  // ✅ Format to YYYY-MM-DD for grouping
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // 📊 Prepare daily breakdown within that month
  const dailyData = [
    ...filteredExpenses.map((exp) => ({
      date: formatDate(exp.date_time),
      expenses: Number(exp.amount),
      income: 0,
    })),
    ...filteredIncome.map((inc) => ({
      date: formatDate(inc.date),
      expenses: 0,
      income: Number(inc.amount),
    })),
  ].reduce((acc, curr) => {
    const existing = acc.find((d) => d.date === curr.date);
    if (existing) {
      existing.expenses += curr.expenses;
      existing.income += curr.income;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  // ✅ Sort by date (so graph shows correct order)
  dailyData.sort((a, b) => new Date(a.date) - new Date(b.date));

  // ✅ Restrict month input to last 5 years
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const minYear = currentYear - 5;
  const minMonth = `${minYear}-${currentMonth}`;
  const maxMonth = `${currentYear}-${currentMonth}`;

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-blue-800">Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Single Month Filter */}
      <div className="bg-white p-6 rounded-lg shadow flex flex-col md:flex-row gap-4 items-center justify-between">
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
        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Total Expenses
          </h2>
          <p className="text-3xl font-bold text-red-500">
            Rs.{totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700">Total Income</h2>
          <p className="text-3xl font-bold text-green-600">
            Rs.{totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Net Profit / Loss
          </h2>
          <p
            className={`text-3xl font-bold ${
              netProfit >= 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            Rs.{netProfit.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 📊 Daily Bar Chart for Selected Month */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Daily Income vs Expenses ({selectedMonth || "Select a month"})
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#4CAF50" name="Income" />
            <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
