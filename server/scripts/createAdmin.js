import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables from the correct path
dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@murai.com' });
    console.log('Cleaned up any existing admin user');

    // Create admin user with specific ID
    // Note: In production, you should use a more secure password
    // This is just a placeholder for development
    const adminUser = new User({
      _id: "682326f43e664b30bd65d1d7",
      name: 'Admin',
      email: 'admin@murai.com',
      password: process.env.ADMIN_PASSWORD || 'admin123', // Will be hashed by schema
      role: 'admin',
      account_status: 'active'
    });

    await adminUser.save();
    console.log('Admin user created successfully with ID:', adminUser._id);
    console.log('Admin credentials:', {
      email: 'admin@murai.com',
      password: 'admin123'
    });

    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
};

// Run the script directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  createAdminUser()
    .then(() => {
      console.log('Admin creation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create admin:', error);
      process.exit(1);
    });
}

export default createAdminUser;