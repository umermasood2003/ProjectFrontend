import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import ExpensesPage from "./pages/ExpensePage";
import IncomePage from "./pages/IncomePage";
import ReportsPage from "./pages/ReportPage";
import UserPage from "./pages/UserPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Common/Navbar";
import ForgetPassword from "./pages/ForgetPasswordPage";
import ResetPassword from "./pages/ResetPasswordPage";
import api from "./services/api";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("staff");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await api.get("/auth/me/");
        const user = res.data;

        setIsAuthenticated(true);
        const roleName = user.role?.name?.toLowerCase() || "staff";
        setUserRole(roleName);
        setUsername(user.username || "User");
        setUserId(user.id);
        localStorage.setItem("role", roleName);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.clear();
        delete api.defaults.headers.common["Authorization"];
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = (role, uname, id) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUsername(uname || "User"); // ✅ gets real username immediately
    setUserId(id || null); // ✅ gets real id immediately
  };

  const handleLogout = () => {
    localStorage.clear();
    delete api.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUserRole("staff");
    setUsername("");
    setUserId(null);
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-700">
          Checking authentication...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <Navbar onLogout={handleLogout} role={userRole} username={username} />
      )}
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route
            path="/reset-password/:token/:userId"
            element={<ResetPassword />}
          />
          <Route path="/signup" element={<Signup />} />
          {isAuthenticated ? (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/user"
                element={<UserPage role={userRole} currentUserId={userId} />}
              />
              <Route
                path="/expenses"
                element={<ExpensesPage role={userRole} />}
              />
              <Route path="/income" element={<IncomePage role={userRole} />} />
              <Route
                path="/reports"
                element={<ReportsPage role={userRole} />}
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="" element={<Navigate to="/dashboard" />} />
            </>
          ) : (
            <Route path="" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
