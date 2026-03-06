// frontend/src/services/api.js
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.token = token;
    config.headers["x-access-token"] = token;
  }
  return config;
});

export const getApiBase = () => API_BASE_URL;

export default api;