// This service provides local metrics data when the database is not available
// It uses the actual metrics from the trained models

const bertMetrics = {
  version: 'google-bert-multilingual-tagalog-profanity-v1.0',
  model_type: 'bert',
  timestamp: new Date().toISOString(),
  performance: {
    accuracy: 0.8866906474820144,
    precision: 0.8429752066115702,
    recall: 0.8908296943231441,
    f1_score: 0.8662420382165605
  },
  training_info: {
    dataset_size: 24892,
    training_duration: '8h 35m 42s',
    model_type: 'BERT Multilingual (Trained)',
    epochs: 3,
    best_epoch: 2,
    early_stopped: false,
    gpu_used: 'NVIDIA RTX 3050'
  },
  confusion_matrix: {
    TP: 204,
    FP: 38,
    TN: 289,
    FN: 25
  }
};

const robertaMetrics = {
  version: 'roberta-tagalog-profanity-v1.0',
  model_type: 'roberta',
  timestamp: new Date().toISOString(),
  performance: {
    accuracy: 0.9064748201438849,
    precision: 0.8968609865470852,
    recall: 0.8733624454148472,
    f1_score: 0.8849557522123894
  },
  training_info: {
    dataset_size: 24892,
    training_duration: '7h 15m 18s',
    model_type: 'RoBERTa Tagalog (Trained)',
    epochs: 3,
    best_epoch: 3,
    early_stopped: false,
    gpu_used: 'NVIDIA RTX 3050'
  },
  confusion_matrix: {
    TP: 200,
    FP: 23,
    TN: 304,
    FN: 29
  }
};

// Get latest model metrics for a specific model type
export const getLocalLatestModelMetrics = (modelType = 'roberta') => {
  return modelType === 'roberta' ? robertaMetrics : bertMetrics;
};

// Get model comparison data
export const getLocalModelComparison = () => {
  return {
    roberta: robertaMetrics,
    bert: bertMetrics
  };
};

export default {
  getLocalLatestModelMetrics,
  getLocalModelComparison
};
