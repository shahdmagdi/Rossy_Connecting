import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Only set Content-Type to JSON for body requests that are NOT FormData.
  // When data is FormData, axios sets the correct multipart/form-data boundary
  // automatically — overwriting it here would break file uploads.
  if (
    ['post', 'put', 'patch'].includes(config.method?.toLowerCase()) &&
    !(config.data instanceof FormData)
  ) {
    config.headers['Content-Type'] = 'application/json';
  }

  console.log('[API Request]', config.method.toUpperCase(), config.url);
  console.log('[API Body]', config.data);
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