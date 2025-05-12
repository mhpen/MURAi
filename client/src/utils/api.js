const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-render-service-url.onrender.com'
  : 'http://localhost:5001';

// Use API_URL in your fetch calls 