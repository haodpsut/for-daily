import axios from 'axios';

// Production: VITE_API_URL=https://cdr-steward-api.onrender.com/api
// Dev: blank → Vite proxy /api → http://localhost:8000
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 90000,
});

// Auth: attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cdr_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (except for /auth/login attempts)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('cdr_auth_token');
      localStorage.removeItem('cdr_auth_user');
      // Hard redirect so AuthContext re-initializes
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    console.error('API error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);
