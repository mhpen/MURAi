import mongoose from 'mongoose';

const detectedWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  website_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  detected_texts_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DetectedText', required: true },
  language: { type: String, required: true },
  detected_at: { type: Date, default: Date.now },
  frequency: { type: Number, default: 1 },
  category: { 
    type: String,
    enum: ['profanity', 'slur', 'sexual'],
    required: true
  },
  severity_level: { 
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

export default mongoose.model('DetectedWord', detectedWordSchema); 