import axios from 'axios';

// Axios instance configured with backend base URL from Vite env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

export default api;
