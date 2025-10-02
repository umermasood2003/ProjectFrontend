// src/pages/SignupPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    gmail: "",
    app_password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await api.post("/users/", {
        username: form.username,
        email: form.email,
        password: form.password,
        gmail: form.gmail,
        gmail_app_password: form.app_password,
      });
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-blue-800">
          Sign Up
        </h1>

        {error && (
          <p className="text-red-500 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          name="gmail"
          value={form.gmail}
          onChange={handleChange}
          placeholder="Your Gmail Address"
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="app_password"
          value={form.app_password}
          onChange={handleChange}
          placeholder="Gmail App Password"
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-800 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
