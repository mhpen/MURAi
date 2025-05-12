import mongoose from 'mongoose';

const modelMetricsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  version: { type: String, required: true },
  performance: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1_score: Number
  },
  training_info: {
    dataset_size: Number,
    training_duration: String
  },
  confusion_matrix: {
    TP: Number,
    FP: Number,
    TN: Number,
    FN: Number
  }
});

export default mongoose.model('ModelMetrics', modelMetricsSchema); 