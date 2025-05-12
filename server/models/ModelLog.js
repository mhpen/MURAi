import mongoose from 'mongoose';

const modelLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  type: { 
    type: String,
    enum: ['info', 'error', 'warning'],
    required: true
  },
  message: { type: String, required: true },
  model_version: { type: String, required: true }
});

export default mongoose.model('ModelLog', modelLogSchema); 