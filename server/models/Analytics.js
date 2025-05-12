import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  website_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  metrics: {
    total_flagged_texts: Number,
    total_reports: Number,
    flagged_by_language: {
      Filipino: Number,
      English: Number
    },
    sentiment_distribution: {
      positive: Number,
      neutral: Number,
      negative: Number
    },
    moderation_accuracy: {
      true_positives: Number,
      false_positives: Number
    },
    source_breakdown: { type: Map, of: Number }
  },
  top_detected_words: [{
    word: String,
    frequency: Number,
    language: String
  }],
  word_categories: {
    profanity: Number,
    slur: Number,
    sexual: Number
  },
  language_breakdown: {
    Filipino: Number,
    English: Number
  },
  detection_metrics: {
    precision: Number,
    recall: Number,
    f1_score: Number
  }
});

export default mongoose.model('Analytics', analyticsSchema); 