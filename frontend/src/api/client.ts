import axios from 'axios';

export const PRODUCTION_API_URL = 'https://civicmind-ma7x.onrender.com';
export const LOCAL_DEV_API_URL = 'http://127.0.0.1:8000';

/**
 * Resolves the backend base URL (without /api suffix).
 * 
 * Rules:
 * 1. Explicit environment variable: VITE_API_URL or VITE_API_BASE_URL
 * 2. In production (import.meta.env.PROD): ALWAYS use PRODUCTION_API_URL.
 *    Localhost is NEVER used as a production fallback!
 * 3. In development (import.meta.env.DEV): use LOCAL_DEV_API_URL.
 */
function resolveApiBaseUrl(): string {
  // 1. Explicit environment variable
  const envUrl = (
    import.meta.env.VITE_API_URL || 
    import.meta.env.VITE_API_BASE_URL || 
    ''
  ).trim();

  if (envUrl) {
    // Strip trailing slashes and redundant /api if supplied
    return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }

  // 2. Strict production mode guard - localhost is NEVER used
  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }

  // 3. Local development server
  if (import.meta.env.DEV) {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '[::1]' ||
        host.endsWith('.local')
      ) {
        return LOCAL_DEV_API_URL;
      }
    }
    return LOCAL_DEV_API_URL;
  }

  // 4. Default safe fallback
  return PRODUCTION_API_URL;
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
