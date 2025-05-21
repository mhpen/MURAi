import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const forceCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Force delete any existing admin
    await mongoose.connection.db.collection('users').deleteMany({ email: 'admin@murai.com' });

    // Create password hash
    // Note: In production, you should use a more secure password
    // This is just a placeholder for development
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);

    // Create admin directly in MongoDB
    const result = await mongoose.connection.db.collection('users').insertOne({
      _id: new mongoose.Types.ObjectId("682326f43e664b30bd65d1d7"),
      name: 'Admin',
      email: 'admin@murai.com',
      password: hashedPassword,
      role: 'admin',
      account_status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin created:', result);

    // Verify the admin was created
    const admin = await mongoose.connection.db.collection('users').findOne({ email: 'admin@murai.com' });
    console.log('Admin verification:', admin);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

forceCreateAdmin();