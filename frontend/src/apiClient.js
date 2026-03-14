import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

const clearAuthStorage = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('session_id');
};

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('access_token');

  config.headers = config.headers || {};

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isUnauthorized = error?.response?.status === 401;
    const isLoginCall = originalRequest?.url?.includes('/login');
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

    if (isUnauthorized && !originalRequest._retry && !isLoginCall && !isRefreshCall) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        clearAuthStorage();
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = refreshResponse.data.access_token;
        localStorage.setItem('access_token', newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        clearAuthStorage();
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
