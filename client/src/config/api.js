const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://murai-qgd8.onrender.com/api'
  : 'http://localhost:5001/api';

export default API_URL; 