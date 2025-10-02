import React from "react";
import { Link } from "react-router-dom";

function Navbar({ onLogout, role, username }) {
  return (
    <nav className="bg-blue-800 text-white p-4 shadow-lg sticky top-0 z-10">
      <div className="container flex justify-between items-center">
        <div className="text-xl font-bold">Financial Tracker</div>
        <div className="flex space-x-6 items-center">
          {role === "admin" ? (
            // Admin sees only User Management
            <>
              <Link
                to="/user"
                className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
              >
                Users
              </Link>
              <Link
                to="/profile"
                className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
              >
                {username || "Profile"}
              </Link>
            </>
          ) : (
            // Regular user sees everything else
            <>
              <Link
                to="/dashboard"
                className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
              >
                Dashboard
              </Link>
              <Link
                to="/expenses"
                className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
              >
                Expenses
              </Link>
              <Link
                to="/income"
                className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
              >
                Income
              </Link>
              <Link
                to="/reports"
                className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
              >
                Reports
              </Link>
              <Link
                to="/profile"
                className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
              >
                {username || "Profile"}
              </Link>
            </>
          )}

          {/* Logout always visible */}
          <button
            onClick={onLogout}
            className="bg-accent text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
