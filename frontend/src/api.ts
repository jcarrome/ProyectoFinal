import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sturdy-fortnight-6994wr5j7j7qf5pxv-8000.app.github.dev/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default api;