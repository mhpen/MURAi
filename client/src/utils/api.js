import axios from 'axios';

// Get API URL from environment variables with fallback
const apiUrl = import.meta.env.VITE_API_URL || 'https://murai-qgd8.onrender.com';

// Only log in development mode
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    apiUrl
  });
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout and other options for better error handling
  timeout: 10000,
  withCredentials: false // Set to true if using cookies
});

// Add request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Basic validation to ensure token is properly formatted
    if (token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Malformed token detected, clearing from localStorage');
      localStorage.removeItem('token');
    }
  }
  // Log the full URL being requested only in development mode
  if (import.meta.env.DEV) {
    console.log('Making request to:', config.baseURL + config.url);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // More detailed error logging in development, concise in production
    if (import.meta.env.DEV) {
      console.error('API Error Details:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
    } else {
      console.error('API Error:', error.message, error.response?.status, error.response?.data?.error);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('Authentication error detected, redirecting to login');

      // Clear invalid token
      localStorage.removeItem('token');

      // Redirect to login page if not already there
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }

    // Check for network errors
    if (error.message === 'Network Error') {
      console.error('Network Error - Check CORS and server availability');
    }

    // Check for timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Server might be slow or unavailable');
    }

    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;