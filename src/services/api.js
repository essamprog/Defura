// src/services/api.js
import axios from "axios";

const api = axios.create({
  // ── Point to your PHP backend ──────────────────────────────────────────────
  // Development: Apache/XAMPP serves backend at this path
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost/LMS-React/backend/api",

  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ── Request interceptor — attach JWT ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Primary: direct key (set at login)
    let token = localStorage.getItem("accessToken");

    // Fallback: Zustand persist store (set after page refresh)
    if (!token) {
      try {
        const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        token = authStorage?.state?.accessToken ?? null;
        // Sync back so subsequent requests don't need the fallback
        if (token) localStorage.setItem("accessToken", token);
      } catch { /* ignore parse errors */ }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — token refresh on 401 ─────────────────────────────
let isRefreshing   = false;
let failedQueue    = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing    = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh.php`,
          { refreshToken }
        );

        const newToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;
        
        localStorage.setItem("accessToken", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        
        // Also update the zustand storage so it doesn't get overwritten by persist
        const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        if (authStorage.state) {
          authStorage.state.accessToken = newToken;
          authStorage.state.refreshToken = newRefreshToken;
          localStorage.setItem("auth-storage", JSON.stringify(authStorage));
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;