import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateInitialAnalytics } from '../controllers/analytics.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const testAnalytics = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Generating initial analytics...');
    await generateInitialAnalytics();
    console.log('Initial analytics generated');

    // Keep the script running to watch for changes
    console.log('Watching for changes...');
    
    // Test by making a change after 5 seconds
    setTimeout(async () => {
      const { DetectedText } = await import('../models/index.js');
      const newText = new DetectedText({
        website_id: (await mongoose.model('Website').findOne())._id,
        text_content: 'Test change stream text',
        language: 'English',
        detection_method: 'automated',
        source: 'automated',
        content_type: 'comment',
        is_inappropriate: true
      });
      await newText.save();
      console.log('Test document created');
    }, 5000);

  } catch (error) {
    console.error('Error testing analytics:', error);
    process.exit(1);
  }
};

testAnalytics(); 