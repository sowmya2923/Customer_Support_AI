import axios from 'axios';

const api = axios.create({
  // Hardcoded to deployed backend URL to prevent 404 routing errors on Render
  baseURL: 'https://customer-support-ai-oapw.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor to automatically append JWT authorization tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to catch 401 Unauthorized errors and force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, log out the user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are in the browser, redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
