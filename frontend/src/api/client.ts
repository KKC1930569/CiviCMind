import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to automatically attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civicmind_token') || localStorage.getItem('urbaneye_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/sign-in')) {
      localStorage.removeItem('civicmind_token');
      localStorage.removeItem('civicmind_user');
      localStorage.removeItem('urbaneye_token');
      localStorage.removeItem('urbaneye_user');
    }
    return Promise.reject(error);
  }
);

/**
 * Distinguishes network failure, validation errors, auth failures, and server errors.
 */
export function formatApiError(err: any): string {
  if (!err) return 'An unexpected error occurred.';

  // Network / Connection Refused
  if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response) {
    return 'CivicMind Core API is currently unavailable. Please make sure the backend is running at http://127.0.0.1:8000.';
  }

  const status = err.response?.status;
  const detail = err.response?.data?.detail;

  if (detail) {
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join('; ');
    }
  }

  if (status === 401) {
    return 'Invalid email or password.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status >= 500) {
    return 'CivicMind encountered a server error. Please try again.';
  }

  return err.response?.data?.message || err.message || 'An error occurred. Please check your inputs.';
}
