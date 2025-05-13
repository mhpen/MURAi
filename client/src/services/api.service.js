import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const apiClient = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add CORS headers
    config.headers['Access-Control-Allow-Credentials'] = true;
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    // Handle CORS errors specifically
    if (error.message === 'Network Error') {
      console.error('CORS or Network Error:', error);
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your connection.',
        status: 'error'
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Handle CORS errors
    if (error.response?.status === 403) {
      console.error('CORS Error:', error);
      return Promise.reject({
        message: 'Access denied. Please check your permissions.',
        status: 'error'
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient; 