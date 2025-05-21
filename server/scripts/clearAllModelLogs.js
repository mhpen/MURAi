import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ModelLog } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Script to clear all model logs from the database
 * This is a simpler approach to remove all logs and start fresh
 */
const clearAllModelLogs = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get count of logs before deletion
    const beforeCount = await ModelLog.countDocuments();
    console.log(`Current model logs count: ${beforeCount}`);

    // Delete all logs
    const result = await ModelLog.deleteMany({});

    console.log(`Deleted ${result.deletedCount} model logs`);
    console.log('All model logs have been cleared');
  } catch (error) {
    console.error('Error clearing model logs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
clearAllModelLogs()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
