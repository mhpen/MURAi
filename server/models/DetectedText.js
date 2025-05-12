import mongoose from 'mongoose';

const detectedTextSchema = new mongoose.Schema({
  website_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text_content: { type: String, required: true },
  sentiment_score: Number,
  sentiment_label: { 
    type: String,
    enum: ['positive', 'neutral', 'negative']
  },
  language: { type: String, required: true },
  detected_at: { type: Date, default: Date.now },
  detection_method: { 
    type: String,
    enum: ['automated', 'manual'],
    required: true
  },
  source: { 
    type: String,
    enum: ['user', 'automated', 'both'],
    required: true
  },
  is_inappropriate: { type: Boolean, default: false },
  validation_status: { 
    type: String,
    enum: ['true_positive', 'false_positive', 'unverified'],
    default: 'unverified'
  },
  content_type: { 
    type: String,
    enum: ['comment', 'post', 'title'],
    required: true
  }
});

export default mongoose.model('DetectedText', detectedTextSchema); 