import axios from 'axios';

// Production: VITE_API_URL=https://cdr-steward-api.onrender.com/api
// Dev: blank → Vite proxy /api → http://localhost:8000
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 90000,  // render PDF có thể chậm trên free tier
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error('API error:', err.response?.data || err.message);
    return Promise.reject(err);
  }
);
