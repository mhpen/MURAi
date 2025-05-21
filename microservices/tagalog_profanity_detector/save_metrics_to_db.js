const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API endpoint for saving metrics
const API_URL = 'http://localhost:5000/api/model/metrics/microservice';

// API key from environment variable or hardcoded for testing
const API_KEY = process.env.MICROSERVICE_API_KEY || 'your-api-key-here';

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
    // Format metrics for the API
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

    // Send metrics to API
    const response = await axios.post(API_URL, formattedMetrics, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });

    console.log(`Successfully saved ${modelType} metrics to database:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error saving ${modelType} metrics to database:`, error.message);
    return null;
  }
};

// Main function
const main = async () => {
  // Paths to metrics files
  const bertMetricsPath = path.join(__dirname, 'models', 'google-bert-multilingual-tagalog-profanity', 'metrics.json');
  const robertaMetricsPath = path.join(__dirname, 'models', 'roberta-tagalog-profanity', 'metrics.json');

  // Read metrics files
  const bertMetrics = readMetricsFile(bertMetricsPath);
  const robertaMetrics = readMetricsFile(robertaMetricsPath);

  if (bertMetrics) {
    await saveMetricsToDB(bertMetrics, 'bert', 'google-bert-multilingual-tagalog-profanity-v1.0');
  }

  if (robertaMetrics) {
    await saveMetricsToDB(robertaMetrics, 'roberta', 'roberta-tagalog-profanity-v1.0');
  }
};

// Run the main function
main().catch(console.error);
