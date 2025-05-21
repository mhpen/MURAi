import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ModelLog } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Script to add an initial model log entry
 * This adds a real log entry after clearing the dummy data
 */
const addInitialModelLog = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a real log entry
    const newLog = new ModelLog({
      type: 'info',
      message: 'Tagalog profanity detection model initialized',
      model_version: 'roberta-tagalog-base-v1.0.0',
      timestamp: new Date()
    });

    await newLog.save();
    console.log('Added initial model log entry');
    
    // Verify the log was added
    const count = await ModelLog.countDocuments();
    console.log(`Current model logs count: ${count}`);
  } catch (error) {
    console.error('Error adding initial model log:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
addInitialModelLog()
  .then(() => {
    console.log('Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
