import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@murai.com' });
    if (admin) {
      console.log('Admin user exists:', {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        status: admin.account_status
      });
    } else {
      console.log('No admin user found');
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

verifyAdmin(); 