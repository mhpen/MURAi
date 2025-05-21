import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ModelMetrics, ModelLog } from '../models/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

// Sample model versions
const modelVersions = [
  { version: 'v1.0.0', date: new Date('2023-10-15') },
  { version: 'v1.1.0', date: new Date('2023-11-20') },
  { version: 'v1.2.0', date: new Date('2024-01-05') },
  { version: 'v1.2.3', date: new Date('2024-02-18') },
  { version: 'v1.3.0', date: new Date() } // Current version
];

// Sample log messages
const logMessages = [
  { type: 'info', message: 'Model training started', version: 'v1.3.0' },
  { type: 'info', message: 'Dataset loaded: 13,888 samples', version: 'v1.3.0' },
  { type: 'info', message: 'Training completed in 1h 23m', version: 'v1.3.0' },
  { type: 'info', message: 'Model evaluation started', version: 'v1.3.0' },
  { type: 'info', message: 'Model evaluation completed', version: 'v1.3.0' },
  { type: 'warning', message: 'High false positive rate detected', version: 'v1.3.0' },
  { type: 'info', message: 'Model saved to disk', version: 'v1.3.0' },
  { type: 'info', message: 'Model deployed to production', version: 'v1.3.0' },
  { type: 'error', message: 'Failed to load test dataset', version: 'v1.2.0' },
  { type: 'info', message: 'Retrying dataset load', version: 'v1.2.0' },
  { type: 'info', message: 'Dataset loaded successfully', version: 'v1.2.0' },
  { type: 'info', message: 'Model v1.2.0 deployed', version: 'v1.2.0' }
];

// Generate random metrics with improving trend
const generateMetrics = (version, index) => {
  // Base values that improve with each version
  const baseAccuracy = 0.85 + (index * 0.02);
  const basePrecision = 0.82 + (index * 0.025);
  const baseRecall = 0.80 + (index * 0.03);
  const baseF1 = 0.81 + (index * 0.028);
  
  // Add some randomness
  const randomFactor = () => (Math.random() * 0.02) - 0.01;
  
  // Calculate metrics with some randomness
  const accuracy = Math.min(0.98, baseAccuracy + randomFactor());
  const precision = Math.min(0.98, basePrecision + randomFactor());
  const recall = Math.min(0.98, baseRecall + randomFactor());
  const f1_score = Math.min(0.98, baseF1 + randomFactor());
  
  // Generate confusion matrix based on metrics
  const datasetSize = 13888;
  const positiveRatio = 0.4; // 40% of samples are positive
  const positiveCount = Math.round(datasetSize * positiveRatio);
  const negativeCount = datasetSize - positiveCount;
  
  const TP = Math.round(positiveCount * recall);
  const FN = positiveCount - TP;
  const TN = Math.round(negativeCount * (accuracy * 1.2)); // Adjust to make numbers work
  const FP = negativeCount - TN;
  
  return {
    version: version.version,
    timestamp: version.date,
    performance: {
      accuracy,
      precision,
      recall,
      f1_score
    },
    training_info: {
      dataset_size: datasetSize,
      training_duration: `${Math.floor(80 + Math.random() * 20)}m ${Math.floor(Math.random() * 60)}s`
    },
    confusion_matrix: {
      TP: Math.max(0, TP),
      FP: Math.max(0, FP),
      TN: Math.max(0, TN),
      FN: Math.max(0, FN)
    }
  };
};

// Generate and save sample metrics
const generateModelMetrics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await ModelMetrics.deleteMany({});
    await ModelLog.deleteMany({});
    
    console.log('Generating model metrics...');
    
    // Generate and save metrics for each version
    for (let i = 0; i < modelVersions.length; i++) {
      const metrics = generateMetrics(modelVersions[i], i);
      await new ModelMetrics(metrics).save();
      console.log(`Saved metrics for ${metrics.version}`);
    }
    
    // Save log messages
    for (const log of logMessages) {
      await new ModelLog({
        type: log.type,
        message: log.message,
        model_version: log.version,
        timestamp: new Date(Date.now() - Math.random() * 86400000) // Random time in last 24 hours
      }).save();
    }
    
    console.log('Model metrics and logs generated successfully');
  } catch (error) {
    console.error('Error generating model metrics:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the script
generateModelMetrics();
