import api from '../utils/api';

// Get all model metrics
export const getModelMetrics = async () => {
  try {
    const { data } = await api.get('/api/model/metrics');
    return data;
  } catch (error) {
    console.error('Error fetching model metrics:', error);
    throw error;
  }
};

// Get latest model metrics
export const getLatestModelMetrics = async (modelType = 'roberta') => {
  try {
    const { data } = await api.get(`/api/model/metrics/latest?model_type=${modelType}`);
    return data;
  } catch (error) {
    console.error(`Error fetching latest ${modelType} model metrics:`, error);
    throw error;
  }
};

// Get model comparison data
export const getModelComparison = async () => {
  try {
    const { data } = await api.get('/api/model/metrics/comparison');
    return data;
  } catch (error) {
    console.error('Error fetching model comparison data:', error);
    throw error;
  }
};

// Get model logs
export const getModelLogs = async () => {
  try {
    const { data } = await api.get('/api/model/logs');
    return data;
  } catch (error) {
    console.error('Error fetching model logs:', error);
    throw error;
  }
};

// Save model metrics (admin only)
export const saveModelMetrics = async (metricsData) => {
  try {
    const { data } = await api.post('/api/model/metrics', metricsData);
    return data;
  } catch (error) {
    console.error('Error saving model metrics:', error);
    throw error;
  }
};

// Save model log (admin only)
export const saveModelLog = async (logData) => {
  try {
    const { data } = await api.post('/api/model/logs', logData);
    return data;
  } catch (error) {
    console.error('Error saving model log:', error);
    throw error;
  }
};

// Retrain model (admin only)
export const retrainModel = async (modelType) => {
  try {
    const { data } = await api.post('/api/model/training/retrain', { model_type: modelType });
    return data;
  } catch (error) {
    console.error(`Error retraining ${modelType} model:`, error);
    throw error;
  }
};

// Get model retraining status (admin only)
export const getRetrainingStatus = async (modelType) => {
  try {
    const { data } = await api.get(`/api/model/training/status?model_type=${modelType}`);
    return data;
  } catch (error) {
    console.error(`Error getting retraining status for ${modelType} model:`, error);
    throw error;
  }
};
