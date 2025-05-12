import mongoose from 'mongoose';

const systemLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  target: { 
    type: String,
    enum: ['user', 'text', 'website'],
    required: true
  },
  target_id: { type: mongoose.Schema.Types.ObjectId },
  status: { 
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  message: { type: String, required: true },
  severity: { 
    type: String,
    enum: ['info', 'warning', 'error'],
    required: true
  }
});

export default mongoose.model('SystemLog', systemLogSchema); 