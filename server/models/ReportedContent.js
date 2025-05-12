import mongoose from 'mongoose';

const reportedContentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  website_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
  content_text: { type: String, required: true },
  report_reason: { type: String, required: true },
  content_type: { type: String, required: true },
  language: { type: String, required: true },
  report_timestamp: { type: Date, default: Date.now },
  status: { 
    type: String,
    enum: ['pending', 'reviewed', 'dismissed'],
    default: 'pending'
  },
  verified: { type: Boolean, default: false }
});

export default mongoose.model('ReportedContent', reportedContentSchema); 