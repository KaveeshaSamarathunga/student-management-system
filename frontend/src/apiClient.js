import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  const sessionId = localStorage.getItem('session_id');

  config.headers = config.headers || {};

  if (user) {
    config.headers['X-Admin-Name'] = user;
  }

  if (sessionId) {
    config.headers['X-Session-Id'] = sessionId;
  }

  return config;
});

export default api;
