import React, { useState, useEffect } from "react";
import api from "../services/api";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" }); // type: "success" | "error"

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me/");
        setUser(res.data);
        setFormData((prev) => ({ ...prev, username: res.data.username }));
      } catch (err) {
        setMessage({ text: "Failed to load profile", type: "error" });
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setMessage({ text: "Passwords do not match!", type: "error" });
      return;
    }

    const patchData = { username: formData.username };
    if (formData.newPassword) patchData.password = formData.newPassword;

    try {
      const res = await api.patch(`/users/${user.id}/`, patchData);
      setUser(res.data);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage({ text: "Failed to update profile", type: "error" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-blue-800">My Profile</h1>

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

      {user && (
        <div className="card p-4 space-y-2">
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role?.name}
          </p>
        </div>
      )}

      {/* Single form for username + password */}
      <form onSubmit={handleSubmit} className="card p-4 space-y-4">
        <h2 className="text-xl font-semibold">Update Profile</h2>

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="input"
          required
        />

        <input
          type="password"
          placeholder="New Password (optional)"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          className="input"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className="input"
        />

        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;
