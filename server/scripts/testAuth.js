/**
 * Script to test authentication with the new JWT_SECRET
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const API_URL = 'http://localhost:5001';

const testAuth = async () => {
  try {
    console.log('Testing authentication with new JWT_SECRET...');

    // Test login
    console.log('Attempting login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@murai.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });

    console.log('Login successful!');
    console.log('Token received:', loginResponse.data.token);

    // Test protected route with the token
    console.log('\nTesting protected route...');
    const token = loginResponse.data.token;

    const testResponse = await axios.get(`${API_URL}/api/auth/test`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Protected route access successful!');
    console.log('Response:', testResponse.data);

    console.log('\nAuthentication is working correctly with the new JWT_SECRET!');
  } catch (error) {
    console.error('Authentication test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

testAuth();
