import mongoose from 'mongoose';

const modelMetricsSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  version: { type: String, required: true },
  model_type: { type: String, enum: ['bert', 'roberta'], default: 'roberta' },
  performance: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1_score: Number
  },
  training_info: {
    dataset_size: Number,
    training_duration: String,
    model_type: String
  },
  confusion_matrix: {
    TP: Number,
    FP: Number,
    TN: Number,
    FN: Number
  }
});

export default mongoose.model('ModelMetrics', modelMetricsSchema);