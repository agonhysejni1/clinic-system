// src/api/axios.js
import axios from "axios";
import { getAccessToken, setAccessToken, clearAuth } from "../utils/token.js";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // allow cookies for refresh token
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

// Request: attach access token (if available)
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: try refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (!original) return Promise.reject(err);

    // If 401 and we haven't tried refresh yet
    if (err.response && err.response.status === 401 && !original._retry) {
      // mark retry to avoid loops
      original._retry = true;

      if (isRefreshing) {
        // queue request until refresh finishes
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (!token) return reject(err);
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const r = await axios.post(
          "http://localhost:3000/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        const newToken = r.data?.accessToken;
        if (!newToken) throw new Error("No token from refresh");

        setAccessToken(newToken);
        onRefreshed(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        // refresh failed: clear auth and redirect to login
        clearAuth();
        onRefreshed(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
