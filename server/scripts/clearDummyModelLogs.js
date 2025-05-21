import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ModelLog } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * Script to clear dummy model logs from the database
 * This script removes all existing model logs that match patterns of dummy data
 */
const clearDummyModelLogs = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get count of logs before deletion
    const beforeCount = await ModelLog.countDocuments();
    console.log(`Current model logs count: ${beforeCount}`);

    // Define patterns that identify dummy data
    const dummyMessagePatterns = [
      'Model training completed successfully',
      'New version deployment started',
      'Performance threshold reached',
      'Dataset validation completed',
      'Error in prediction pipeline',
      'Warning: High false positive rate detected',
      'Failed to load test dataset',
      'Retrying dataset load',
      'Dataset loaded successfully',
      'Model v1.2.0 deployed',
      'Model training started',
      'Dataset loaded: 13,888 samples',
      'Training completed in 1h 23m',
      'Model evaluation started',
      'Model evaluation completed',
      'Model saved to disk',
      'Model deployed to production'
    ];

    // Create a regex pattern to match any of the dummy messages
    const regexPattern = dummyMessagePatterns.map(pattern => 
      pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
    ).join('|');

    // Delete logs that match the dummy patterns
    const result = await ModelLog.deleteMany({
      message: { $regex: regexPattern }
    });

    console.log(`Deleted ${result.deletedCount} dummy model logs`);

    // Get count of logs after deletion
    const afterCount = await ModelLog.countDocuments();
    console.log(`Remaining model logs count: ${afterCount}`);
    console.log(`Total logs removed: ${beforeCount - afterCount}`);

    console.log('Dummy model logs cleanup completed successfully');
  } catch (error) {
    console.error('Error clearing dummy model logs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  clearDummyModelLogs()
    .then(() => {
      console.log('Script execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script execution failed:', error);
      process.exit(1);
    });
}

export default clearDummyModelLogs;
