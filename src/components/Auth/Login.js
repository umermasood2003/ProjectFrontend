import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login request
      const res = await api.post("/auth/login/", { username, password });
      const { access, refresh } = res.data;

      // Store tokens
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      api.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      // Get user info
      const meRes = await api.get("/auth/me/");
      const user = meRes.data;
      const roleName = user.role?.name?.toLowerCase() || "staff";

      // Store role
      localStorage.setItem("role", roleName);

      // ✅ Pass role, username, and id to App.js
      onLogin(roleName, user.username, user.id);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl text-blue-800 font-bold mb-4 text-center">
          Login
        </h2>
        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-800 text-white p-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* 🔹 Forget Password Link */}
        <p className="mt-3 text-center">
          <Link
            to="/forget-password"
            className="text-blue-800 font-semibold hover:underline"
          >
            Forgot your password?
          </Link>
        </p>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-800 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
