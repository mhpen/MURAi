import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the ModelMetrics schema
import ModelMetrics from '../models/ModelMetrics.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to read metrics from file
const readMetricsFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading metrics file ${filePath}:`, error);
    return null;
  }
};

// Function to save metrics to database
const saveMetricsToDB = async (metrics, modelType, version) => {
  try {
    // Format metrics for the database
    const formattedMetrics = {
      version: version,
      model_type: modelType,
      performance: {
        accuracy: metrics.test.accuracy,
        precision: metrics.test.precision,
        recall: metrics.test.recall,
        f1_score: metrics.test.f1
      },
      training_info: {
        dataset_size: metrics.training.steps * 32, // Assuming batch size of 32
        training_duration: `${(metrics.training.training_time / 60).toFixed(2)} minutes`,
        model_type: modelType
      },
      confusion_matrix: metrics.test.confusion_matrix
    };

    // Check if metrics for this version already exist
    const existingMetrics = await ModelMetrics.findOne({
      version: version,
      model_type: modelType
    });

    if (existingMetrics) {
      console.log(`Metrics for ${modelType} version ${version} already exist. Updating...`);
      await ModelMetrics.findByIdAndUpdate(existingMetrics._id, formattedMetrics);
      console.log(`Updated metrics for ${modelType} version ${version}`);
    } else {
      // Create new metrics document
      const newMetrics = new ModelMetrics(formattedMetrics);
      await newMetrics.save();
      console.log(`Saved new metrics for ${modelType} version ${version}`);
    }

    return true;
  } catch (error) {
    console.error(`Error saving ${modelType} metrics to database:`, error);
    return false;
  }
};

// Main function
const main = async () => {
  try {
    // Paths to metrics files
    const bertMetricsPath = path.join(__dirname, '../../microservices/tagalog_profanity_detector/models/google-bert-multilingual-tagalog-profanity/metrics.json');
    const robertaMetricsPath = path.join(__dirname, '../../microservices/tagalog_profanity_detector/models/roberta-tagalog-profanity/metrics.json');

    // Read metrics files
    const bertMetrics = readMetricsFile(bertMetricsPath);
    const robertaMetrics = readMetricsFile(robertaMetricsPath);

    let bertSuccess = false;
    let robertaSuccess = false;

    if (bertMetrics) {
      bertSuccess = await saveMetricsToDB(bertMetrics, 'bert', 'google-bert-multilingual-tagalog-profanity-v1.0');
    } else {
      console.error('Failed to read BERT metrics file');
    }

    if (robertaMetrics) {
      robertaSuccess = await saveMetricsToDB(robertaMetrics, 'roberta', 'roberta-tagalog-profanity-v1.0');
    } else {
      console.error('Failed to read RoBERTa metrics file');
    }

    if (bertSuccess && robertaSuccess) {
      console.log('Successfully saved all metrics to MongoDB');
    } else {
      console.log('Some metrics could not be saved to MongoDB');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the main function
main();
