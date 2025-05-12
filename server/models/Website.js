import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true }
});

export default mongoose.model('Website', websiteSchema); 