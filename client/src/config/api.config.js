const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://murai-qgd8.onrender.com';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  timeout: 10000,
  validateStatus: status => status >= 200 && status < 500
}; 