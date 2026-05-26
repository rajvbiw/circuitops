const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

import axios from 'axios';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
export { BASE_URL };
