import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '..', '.env') });

const createAdmin = async () => {
  try {
    // Connect to MongoDB using the MONGODB_URI from .env
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // First, delete existing admin if exists
    await User.deleteOne({ email: 'admin@murai.com' });
    console.log('Cleaned up existing admin user');
    
    const adminData = {
      name: 'Admin User',
      email: 'admin@murai.com',
      password: 'admin123', // Change this in production
      role: 'admin',
      account_status: 'active'
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('Admin user created successfully with email:', adminData.email);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
    process.exit(1);
  }
};

// Add error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

createAdmin(); 