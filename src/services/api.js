import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor — logs what's being sent
api.interceptors.request.use((config) => {
  console.log('[API Request]', config.method.toUpperCase(), config.url);
  console.log('[API Body]', config.data);   // ← shows exactly what's sent
  return config;
});

// Response interceptor — handles 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;