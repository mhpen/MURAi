import api from '../utils/api';

// Predict profanity in text
export const predictProfanity = async (text, model = 'roberta') => {
  try {
    // Use the server as a proxy to call the microservice
    const { data } = await api.post('/api/detection/test', {
      text,
      model
    });

    return data;
  } catch (error) {
    console.error('Error predicting profanity:', error);
    throw error;
  }
};

// Save test metrics
export const saveTestMetrics = async (metrics) => {
  try {
    const { data } = await api.post('/api/model/test-metrics', metrics);
    return data;
  } catch (error) {
    console.error('Error saving test metrics:', error);
    throw error;
  }
};

// Get all test metrics
export const getTestMetrics = async () => {
  try {
    const { data } = await api.get('/api/model/test-metrics');
    return data;
  } catch (error) {
    console.error('Error fetching test metrics:', error);
    throw error;
  }
};

// Get test metrics by model
export const getTestMetricsByModel = async (modelType) => {
  try {
    const { data } = await api.get(`/api/model/test-metrics/${modelType}`);
    return data;
  } catch (error) {
    console.error(`Error fetching ${modelType} test metrics:`, error);
    throw error;
  }
};

// Get average processing time by model
export const getAverageProcessingTime = async () => {
  try {
    const { data } = await api.get('/api/model/test-metrics/stats/average-time');
    return data;
  } catch (error) {
    console.error('Error fetching average processing time:', error);
    throw error;
  }
};
