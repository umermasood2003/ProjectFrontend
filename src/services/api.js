import axios from "axios";

const API_URL = "http://localhost:8000/api";
const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor → attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // only attempt once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          // <-- FIXED endpoint: your Django refresh URL is /api/auth/refresh/
          const res = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh,
          });

          const newAccess = res.data.access;
          if (!newAccess)
            throw new Error("No access token returned by refresh");

          // Save new token
          localStorage.setItem("access", newAccess);

          // Update axios headers and retry original request
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

          return api(originalRequest);
        }
      } catch (err) {
        console.error(
          "Token refresh failed:",
          err.response?.data || err.message
        );
        // clear auth and force login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        // remove Authorization default header
        delete api.defaults.headers.common["Authorization"];
        // redirect to login page
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
