const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

import axios from 'axios';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (error) {
    console.warn('Failed to attach auth token:', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
