import axios, { type AxiosInstance } from 'axios';

// ─────────────────────────────────────────────────────────
// Two backends:
// - api     → cdr-steward (PLO/Course/CLO/render — main app)
// - kdclApi → kdcl-steward (đo CĐR thực tế từ điểm SV)
//
// Production env vars:
//   VITE_API_URL=https://cdr-steward-api.onrender.com/api
//   VITE_KDCL_API_URL=https://kdcl-steward-api.onrender.com/api
//
// Dev: blank → Vite proxy /api → http://localhost:8000 (cdr only).
//      kdcl dev cần set VITE_KDCL_API_URL=http://localhost:8001/api
// ─────────────────────────────────────────────────────────

const cdrBase = import.meta.env.VITE_API_URL || '/api';
const kdclBase = import.meta.env.VITE_KDCL_API_URL || cdrBase; // fallback giống cdr (dev mặc định)

const TOKEN_KEY = 'cdr_auth_token';
const USER_KEY = 'cdr_auth_user';

function attachAuthInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      console.error('API error:', err.response?.data || err.message);
      return Promise.reject(err);
    }
  );
}

// cdr: 90s đủ cho mọi PLO/Course CRUD + render 5 PDF
// kdcl: 240s vì TT04 PDF render qua xelatex có thể mất 30-60s + cold start ~50s
export const api = axios.create({ baseURL: cdrBase, timeout: 90_000 });
export const kdclApi = axios.create({ baseURL: kdclBase, timeout: 240_000 });

attachAuthInterceptors(api);
attachAuthInterceptors(kdclApi);
