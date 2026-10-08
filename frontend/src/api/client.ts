import axios from 'axios';

/**
 * Resolves the backend base URL (without /api suffix).
 * Search order:
 * 1. import.meta.env.VITE_API_URL
 * 2. import.meta.env.VITE_API_BASE_URL
 * 3. Localhost check: If running in dev mode or accessed via localhost/127.0.0.1, use http://127.0.0.1:8000
 * 4. Production fallback: https://civicmind-ma7x.onrender.com
 */
function resolveApiBaseUrl(): string {
  const envUrl = (
    import.meta.env.VITE_API_URL || 
    import.meta.env.VITE_API_BASE_URL || 
    ''
  ).trim();

  if (envUrl) {
    // Strip trailing slashes and /api if user supplied it with /api
    return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }

  // Check if browser is running on localhost/local network
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]' ||
      host.endsWith('.local')
    ) {
      return 'http://127.0.0.1:8000';
    }
  }

  // If in Vite dev server mode without custom env URL
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000';
  }

  // Default production backend on Render
  return 'https://civicmind-ma7x.onrender.com';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

  // Network / Connection Refused / Service Sleeping
  if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || !err.response) {
    return `CivicMind Core API is currently unreachable at ${API_BASE_URL}. If using the cloud deployment, please wait 30 seconds for the free-tier service to finish waking up, then try again.`;
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
