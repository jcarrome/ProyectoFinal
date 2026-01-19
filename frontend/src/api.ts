import axios from 'axios';

// Detectar automáticamente la URL del backend basándose en el hostname actual
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Si estamos en GitHub Codespaces, reemplazar cualquier puerto por 8000
    if (origin.includes('.app.github.dev')) {
      // Reemplaza el patrón -PUERTO. por -8000.
      return origin.replace(/-\d+\.app\.github\.dev/, '-8000.app.github.dev') + '/api';
    }
  }
  // Fallback para desarrollo local
  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getBackendUrl(),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export default api;